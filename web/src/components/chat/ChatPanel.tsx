"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, ShieldCheck, Info } from "lucide-react";
import ItineraryCard from "./ItineraryCard";
import PaywallModal from "./PaywallModal";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  isItinerary?: boolean;
  itineraryData?: any;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
  initialMessage?: string;
}

type ChatStep = "name" | "phone" | "email" | "chatting";

export default function ChatPanel({ isOpen, onClose, initialDestination, initialMessage }: ChatPanelProps) {
  const [step, setStep] = useState<ChatStep>("name");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Lead Info
  const [leadInfo, setLeadInfo] = useState({
    name: "",
    phone: "",
    email: "",
    companions: "", // 'solo' or 'group'
  });
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle initialization of chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: "init-1",
            sender: "ai",
            text: "Hi! I am your Himalayan Trek Planning Expert from Blue Sheep Adventures. Let's design your dream trek. First, what is your name?",
          },
        ]);
        setIsTyping(false);
      }, 500);

      if (initialDestination) {
        setLeadInfo((prev) => ({ ...prev, destination: initialDestination }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Inline inputs validation
  const validateInput = (value: string): boolean => {
    if (step === "name") {
      if (value.trim().length < 2) {
        setValidationError("Please enter a valid name (minimum 2 characters).");
        return false;
      }
    } else if (step === "phone") {
      const phoneRegex = /^[6-9]\d{9}$/; // 10-digit Indian mobile format
      if (!phoneRegex.test(value.trim())) {
        setValidationError("Please enter a valid 10-digit Indian mobile number.");
        return false;
      }
    } else if (step === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        setValidationError("Please enter a valid email address.");
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!validateInput(text)) return;

    // Add user message
    const userMsgId = Date.now().toString();
    const userMsg: Message = { id: userMsgId, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    setIsTyping(true);

    if (step === "name") {
      setLeadInfo((prev) => ({ ...prev, name: text }));
      setStep("phone");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: `Nice to meet you, ${text}! Please share your 10-digit mobile number so we can link your custom itinerary to your account.`,
          },
        ]);
        setIsTyping(false);
      }, 800);
    } else if (step === "phone") {
      setLeadInfo((prev) => ({ ...prev, phone: text }));
      setStep("email");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: "Great! Lastly, what is your email address? We will secure your itinerary drafts and send a downloadable copy there.",
          },
        ]);
        setIsTyping(false);
      }, 800);
    } else if (step === "email") {
      const updatedLeadInfo = { ...leadInfo, email: text };
      setLeadInfo((prev) => ({ ...prev, email: text }));
      setStep("chatting");

      // Register the lead in the backend and get session ID
      try {
        const res = await fetch("/api/auth/link-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedLeadInfo),
        });
        const data = await res.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
      } catch (err) {
        console.error("Failed to link lead:", err);
      }

      // Initial AI greeting for planning
      setTimeout(() => {
        const welcomeMessage = initialMessage 
          ? `Perfect! I've linked your details. Let's talk about: "${initialMessage}"`
          : "Perfect! Your profile is linked. Tell me: which Himalayan trek or region are you looking to plan? (e.g. Kashmir Great Lakes, Hampta Pass, EBC)";

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: welcomeMessage,
          },
        ]);
        setIsTyping(false);

        if (initialMessage) {
          // Trigger the first planning message automatically if initialized
          handleChatMessage(initialMessage);
        }
      }, 800);
    } else if (step === "chatting") {
      handleChatMessage(text);
    }
  };

  const handleChatMessage = async (text: string) => {
    if (freeMessagesLeft <= 0) {
      setShowPaywall(true);
      setIsTyping(false);
      return;
    }

    const nextFreeMessages = freeMessagesLeft - 1;
    setFreeMessagesLeft(nextFreeMessages);
    setIsTyping(true);

    const activeMessages = [...messages];
    // If we just appended the user message in handleSend, it's already in the state
    const hasUserMsg = activeMessages.some((m) => m.text === text && m.sender === "user");
    const chatPayload = hasUserMsg 
      ? activeMessages 
      : [...activeMessages, { id: Date.now().toString(), sender: "user" as const, text }];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatPayload,
          leadInfo: { ...leadInfo, sessionId },
          sessionId,
          messageCount: 3 - freeMessagesLeft,
        }),
      });

      if (response.status === 402) {
        setShowPaywall(true);
        setIsTyping(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let buffer = "";
      const tempId = "assistant-temp-" + Date.now();
      
      // Append temporary streaming message
      setMessages((prev) => [...prev, { id: tempId, sender: "ai", text: "" }]);
      setIsTyping(false);

      let currentText = "";
      let parsedItinerary: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataContent = trimmed.slice(6);
            
            // Check if it's an event itinerary chunk or standard text
            if (dataContent.startsWith("{") && dataContent.endsWith("}")) {
              try {
                parsedItinerary = JSON.parse(dataContent);
              } catch (e) {
                // Not full JSON yet or parsing error, treat as text
                currentText += dataContent;
              }
            } else {
              currentText += dataContent;
            }

            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? { ...m, text: currentText } : m))
            );
          } else if (trimmed.startsWith("event: itinerary")) {
            // The itinerary payload will be delivered on the next data line
          } else if (trimmed.startsWith("event: limit_reached")) {
            setShowPaywall(true);
          }
        }
      }

      // If we finished streaming and detected an itinerary in the parsed JSON
      if (parsedItinerary) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  isItinerary: true,
                  itineraryData: parsedItinerary,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Error streaming chat:", err);
      // Fallback assistant response on failure
      setMessages((prev) => [
        ...prev,
        {
          id: "error-reply-" + Date.now(),
          sender: "ai",
          text: "I encountered an issue connecting to the safety server. Please check your internet or retry your request.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
      {/* Background click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Main chat panel */}
      <div className="w-full max-w-xl h-full bg-slate-950 border-l border-white/10 flex flex-col relative shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h4 className="text-white font-serif font-bold text-base flex items-center gap-1.5">
                BSA AI Coordinator
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-sans font-bold">
                  Expert
                </span>
              </h4>
              <p className="text-[11px] text-white/50">Himalayan Route & Safety Planner</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Meter for Free Trial */}
        {step === "chatting" && (
          <div className="bg-gradient-to-r from-amber-500/10 to-sky-500/10 border-b border-white/5 px-4 py-2.5 flex items-center justify-between text-xs text-white/80">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              {freeMessagesLeft > 0 ? (
                <>You have <strong className="text-amber-400">{freeMessagesLeft}</strong> free questions left.</>
              ) : (
                <strong className="text-amber-400">Free chat limit reached.</strong>
              )}
            </span>
            <button 
              onClick={() => setShowPaywall(true)}
              className="text-[10px] text-amber-400 uppercase font-bold tracking-wider hover:underline cursor-pointer"
            >
              Unlock Now
            </button>
          </div>
        )}

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                  msg.sender === "user" 
                    ? "bg-amber-500 text-slate-950 rounded-tr-none font-medium shadow-md shadow-amber-500/10" 
                    : "bg-slate-900 border border-white/10 text-white rounded-tl-none"
                }`}
              >
                {msg.text}
                
                {msg.isItinerary && msg.itineraryData && (
                  <div className="mt-3">
                    <ItineraryCard 
                      data={msg.itineraryData} 
                      onUnlock={() => setShowPaywall(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-white/10 text-white rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel */}
        <div className="p-4 border-t border-white/10 bg-slate-900/30">
          {validationError && (
            <div className="text-[11px] text-rose-400 font-semibold mb-2 bg-rose-500/5 border border-rose-500/10 rounded-lg py-1 px-2">
              ⚠️ {validationError}
            </div>
          )}
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input 
              type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder={
                step === "name" 
                  ? "Enter your name..." 
                  : step === "phone" 
                  ? "e.g. 9876543210 (10-digit mobile)..." 
                  : step === "email" 
                  ? "e.g. yourname@example.com..." 
                  : freeMessagesLeft <= 0 
                  ? "Free questions ended. Unlock premium." 
                  : "Ask about the route, gears, safety..."
              }
              disabled={step === "chatting" && freeMessagesLeft <= 0}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || (step === "chatting" && freeMessagesLeft <= 0)}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-white/30 text-slate-950 p-3 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> WFR Safety Verified Data
            </span>
            <span>Blue Sheep Adventures</span>
          </div>
        </div>

        {/* Paywall Overlay/Modal */}
        <PaywallModal 
          isOpen={showPaywall} 
          onClose={() => setShowPaywall(false)} 
        />
      </div>
    </div>
  );
}
