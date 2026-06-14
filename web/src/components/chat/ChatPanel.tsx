"use client";

// Thin client of /api/chat — the server owns the state machine, metering
// and validation. This component renders messages and relays turns.

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, ShieldCheck, Info } from "lucide-react";
import ItineraryCard, { ItineraryPayload } from "./ItineraryCard";
import PaywallModal from "./PaywallModal";
import { BASE_PATH } from "@/lib/basePath";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  itinerary?: ItineraryPayload;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
  initialMessage?: string;
}

type ServerState = "ASK_NAME" | "ASK_PHONE" | "ASK_EMAIL" | "FREE_CHAT" | "PAYWALLED";

const GREETING =
  "Hi! I'm your Himalayan trek planning expert from Blue Sheep Adventures. Let's design your trek — first, what's your name?";

export default function ChatPanel({ isOpen, onClose, initialMessage }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [serverState, setServerState] = useState<ServerState>("ASK_NAME");
  const [pendingLead, setPendingLead] = useState<{ name?: string; phone?: string }>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [freeMessagesLeft, setFreeMessagesLeft] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [validationError, setValidationError] = useState("");
  const autoSentRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: "greet", sender: "ai", text: GREETING }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-send the pre-seeded destination message once lead capture completes
  useEffect(() => {
    if (serverState === "FREE_CHAT" && initialMessage && !autoSentRef.current && !isStreaming) {
      autoSentRef.current = true;
      void sendTurn(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverState]);

  if (!isOpen) return null;

  async function sendTurn(text: string) {
    const sentFromState = serverState;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: "user", text }]);
    setIsStreaming(true);
    setValidationError("");

    try {
      const res = await fetch(`${BASE_PATH}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, pendingLead }),
      });

      if (res.status === 402) {
        setServerState("PAYWALLED");
        setFreeMessagesLeft(0);
        setShowPaywall(true);
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(`chat request failed (${res.status})`);
      }

      const aiMsgId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { id: aiMsgId, sender: "ai", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      const handlePayload = (event: string, payload: any) => {
        if (event === "meta") {
          if (payload.state) {
            setServerState(payload.state);
            // Record the accepted lead field when the server advances the state
            if (sentFromState === "ASK_NAME" && payload.state === "ASK_PHONE") {
              setPendingLead((p) => ({ ...p, name: text }));
            } else if (sentFromState === "ASK_PHONE" && payload.state === "ASK_EMAIL") {
              setPendingLead((p) => ({ ...p, phone: text }));
            }
          }
          if (payload.sessionId) setSessionId(payload.sessionId);
          if (typeof payload.freeMessagesLeft === "number") setFreeMessagesLeft(payload.freeMessagesLeft);
          if (payload.fieldError) setValidationError(payload.fieldError);
          if (payload.state === "PAYWALLED") setShowPaywall(true);
        } else if (event === "itinerary") {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, itinerary: payload } : m))
          );
        } else if (payload.t) {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + payload.t } : m))
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          currentEvent = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) currentEvent = line.slice(7).trim();
            else if (line.startsWith("data: ")) {
              try {
                handlePayload(currentEvent, JSON.parse(line.slice(6)));
              } catch {
                /* ignore malformed chunk */
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("chat error:", err);
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, sender: "ai", text: "I hit a connection issue — please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    if (serverState === "PAYWALLED" || freeMessagesLeft === 0) {
      setShowPaywall(true);
      return;
    }
    setInputValue("");
    void sendTurn(text);
  };

  const placeholder =
    serverState === "ASK_NAME" ? "Enter your name…"
    : serverState === "ASK_PHONE" ? "10-digit mobile number, e.g. 9876543210…"
    : serverState === "ASK_EMAIL" ? "yourname@example.com…"
    : freeMessagesLeft === 0 ? "Free questions used — upgrade to continue."
    : "Ask about routes, gear, season, safety…";

  const inputLocked = isStreaming || serverState === "PAYWALLED" || (serverState === "FREE_CHAT" && freeMessagesLeft === 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-xl h-full bg-ink-950 border-l border-white/10 flex flex-col relative shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-ink-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-ink-950" />
            </div>
            <div>
              <h4 className="text-white font-serif font-bold text-base">BSA AI Coordinator</h4>
              <p className="text-[11px] text-white/50">Himalayan route & safety planner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free-message meter */}
        {serverState === "FREE_CHAT" && freeMessagesLeft !== null && (
          <div className="bg-gradient-to-r from-gold-500/10 to-sky-500/10 border-b border-white/5 px-4 py-2.5 flex items-center justify-between text-xs text-white/80">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gold-400" />
              {freeMessagesLeft > 0 ? (
                <>You have <strong className="text-gold-300">{freeMessagesLeft} of 3</strong> free messages left.</>
              ) : (
                <strong className="text-gold-300">Free chat limit reached.</strong>
              )}
            </span>
            <button
              onClick={() => setShowPaywall(true)}
              className="text-[10px] text-gold-400 uppercase font-bold tracking-wider hover:underline cursor-pointer"
            >
              Go Premium
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.sender === "user"
                    ? "bg-gold-500 text-ink-950 rounded-tr-none font-medium"
                    : "bg-ink-900 border border-white/10 text-white rounded-tl-none"
                }`}
              >
                {msg.text || (isStreaming ? "…" : "")}
                {msg.itinerary && (
                  <div className="mt-3">
                    <ItineraryCard data={msg.itinerary} onUnlock={() => setShowPaywall(true)} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.sender === "user" && (
            <div className="flex justify-start">
              <div className="bg-ink-900 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-ink-900/30">
          {validationError && (
            <div className="text-[11px] text-rose-400 font-semibold mb-2 bg-rose-500/5 border border-rose-500/10 rounded-lg py-1.5 px-2.5">
              ⚠️ {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type={serverState === "ASK_EMAIL" ? "email" : serverState === "ASK_PHONE" ? "tel" : "text"}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder={placeholder}
              disabled={inputLocked && !isStreaming}
              className="flex-1 bg-ink-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || inputLocked}
              className="bg-gold-500 hover:bg-gold-400 disabled:bg-white/10 disabled:text-white/30 text-ink-950 p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Grounded on verified route data
            </span>
            <span>Blue Sheep Adventures</span>
          </div>
        </div>

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} sessionId={sessionId} />
      </div>
    </div>
  );
}
