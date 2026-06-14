"use client";

// Renders the first-itinerary card (CLAUDE.md §4.4).
// Free users: view-only — Edit/Regenerate/PDF visible but locked → paywall.
// Provider rail shows TEASER COUNTS only; phone numbers never reach the browser.

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Mountain,
  Clock,
  UtensilsCrossed,
  Lightbulb,
  Download,
  Edit,
  RefreshCcw,
  Users,
} from "lucide-react";

export interface ItineraryDay {
  n: number;
  title: string;
  km: number;
  altFrom: number;
  altTo: number;
  hours: number;
  difficulty: string;
  meals: string;
  tips: string;
}

export interface ItineraryContent {
  trek: string;
  region: string;
  title: string;
  durationDays: number;
  maxAltitude: number;
  difficulty: string;
  days: ItineraryDay[];
}

export interface ItineraryPayload {
  id: string;
  content: ItineraryContent;
  providerTeaser: { guides: number; region: string };
}

interface ItineraryCardProps {
  data: ItineraryPayload;
  onUnlock: () => void;
}

export default function ItineraryCard({ data, onUnlock }: ItineraryCardProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const { content, providerTeaser } = data;

  return (
    <div className="bg-ink-900 border border-white/10 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 bg-ink-800/40 border-b border-white/10">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/40">
          Your free itinerary · view-only
        </span>
        <h4 className="text-gold-300 font-serif font-bold text-base mt-0.5">{content.title}</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" /> {content.durationDays} days
          </span>
          <span className="flex items-center gap-1">
            <Mountain className="w-3.5 h-3.5 text-sky-400" /> {content.maxAltitude.toLocaleString()}m max
          </span>
          <span className="bg-ink-950 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            {content.difficulty}
          </span>
        </div>
      </div>

      {/* Day accordion */}
      <div className="divide-y divide-white/5">
        {content.days.map((day) => {
          const isExpanded = expandedDay === day.n;
          return (
            <div key={day.n} className="bg-ink-950/20">
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.n)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-white flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink-800 text-[10px] text-gold-400 font-mono shrink-0">
                    {day.n}
                  </span>
                  <span className="truncate">{day.title}</span>
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/50 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 pl-10 text-xs text-white/60 space-y-1.5">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                    <span>{day.km} km</span>
                    <span>{day.altFrom.toLocaleString()}m → {day.altTo.toLocaleString()}m</span>
                    <span>~{day.hours}h walking</span>
                  </div>
                  <p className="flex items-start gap-1.5">
                    <UtensilsCrossed className="w-3 h-3 mt-0.5 text-white/30 shrink-0" /> {day.meals}
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Lightbulb className="w-3 h-3 mt-0.5 text-gold-500/60 shrink-0" /> {day.tips}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Locked controls (visible-but-locked converts better than hidden) */}
      <div className="p-3 bg-ink-900 border-t border-white/10 flex flex-wrap gap-2 justify-end">
        {[
          { icon: Edit, label: "Edit days" },
          { icon: RefreshCcw, label: "Regenerate" },
          { icon: Download, label: "GPX" },
        ].map((b) => (
          <button
            key={b.label}
            onClick={onUnlock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-[11px] font-bold text-white/50 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <b.icon className="w-3.5 h-3.5 text-white/30" /> {b.label}
            <Lock className="w-3 h-3 text-gold-500/70" />
          </button>
        ))}
      </div>

      {/* Provider teaser rail — counts only, numbers stay server-side */}
      <div className="p-4 bg-gradient-to-t from-ink-950 via-ink-950/90 to-ink-900 border-t border-white/10 text-center relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
        <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Local contacts for this itinerary
        </span>
        <p className="text-white text-sm font-bold mt-1.5">
          {providerTeaser.guides} verified local {providerTeaser.guides === 1 ? "guide" : "guides"} cover {providerTeaser.region}
        </p>
        <p className="text-[11px] text-white/40 mt-1">
          Unlock a guide's direct number for ₹499 — talk to them, pay them directly, zero commission.
          48h response guarantee.
        </p>
        <button
          onClick={onUnlock}
          className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-ink-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-gold-500/15"
        >
          Unlock verified guide contact · ₹499
        </button>
      </div>
    </div>
  );
}
