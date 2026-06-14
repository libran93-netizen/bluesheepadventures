"use client";

import React, { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";

interface ChatBarProps {
  onStartChat: (initialMessage: string) => void;
}

const POPULAR_CHIPS = [
  { name: "Kashmir Great Lakes", prompt: "Plan a trek for Kashmir Great Lakes." },
  { name: "Everest Base Camp", prompt: "I'd like to plan Everest Base Camp." },
  { name: "Hampta Pass", prompt: "Design an itinerary for Hampta Pass." },
  { name: "Kedarkantha in winter", prompt: "Plan a winter snow trek to Kedarkantha." },
];

export default function ChatBar({ onStartChat }: ChatBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onStartChat(value);
    setValue("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2.5">
      {/* Suggestion chips */}
      <div className="flex gap-2 items-center justify-start md:justify-center overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
        {POPULAR_CHIPS.map((chip) => (
          <button
            key={chip.name}
            type="button"
            onClick={() => onStartChat(chip.prompt)}
            className="shrink-0 text-[11px] font-medium text-white/75 hover:text-white bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md transition-all cursor-pointer"
          >
            {chip.name}
          </button>
        ))}
      </div>

      {/* The bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-px bg-gradient-to-r from-gold-500/60 via-sky-500/40 to-gold-500/60 rounded-full blur-[6px] opacity-40 group-focus-within:opacity-80 transition-opacity duration-500 pointer-events-none" />
        <div className="relative flex items-center bg-[#0c121f]/95 border border-white/15 rounded-full pl-5 pr-2 py-2 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <Sparkles className="w-[18px] h-[18px] text-gold-400 shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Where do you want to trek? Ask me anything…"
            className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm md:text-[15px] px-3 py-2"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Send"
            className="shrink-0 w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-400 disabled:bg-white/[0.06] disabled:text-white/25 text-ink-950 flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
