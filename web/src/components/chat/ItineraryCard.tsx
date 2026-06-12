"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Lock, Calendar, Star, Phone, CheckCircle, Download, Edit } from "lucide-react";

interface DayPlan {
  day: number;
  title: string;
  details: string;
}

interface Guide {
  name: string;
  rating: string;
  trips: string;
  phone: string;
}

interface ItineraryData {
  title: string;
  duration: string;
  maxAltitude: string;
  difficulty: string;
  companions: string;
  days: DayPlan[];
  guide: Guide;
}

interface ItineraryCardProps {
  data: ItineraryData;
  onUnlock: () => void;
}

export default function ItineraryCard({ data, onUnlock }: ItineraryCardProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const toggleDay = (dayNum: number) => {
    setExpandedDay(expandedDay === dayNum ? null : dayNum);
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden mt-3 shadow-lg">
      {/* Header Info */}
      <div className="p-4 bg-slate-800/40 border-b border-white/10">
        <h4 className="text-amber-400 font-serif font-bold text-base">{data.title}</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-400" /> {data.duration}
          </span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-sky-400 tracking-wider">
            {data.difficulty}
          </span>
          <span className="text-white/60">Alt: <strong>{data.maxAltitude}</strong></span>
          <span className="text-white/60">Type: <strong>{data.companions}</strong></span>
        </div>
      </div>

      {/* Accordion Days */}
      <div className="divide-y divide-white/5">
        {data.days.map((day) => {
          const isExpanded = expandedDay === day.day;
          return (
            <div key={day.day} className="bg-slate-950/20">
              <button
                onClick={() => toggleDay(day.day)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-[10px] text-amber-500 font-mono">
                    {day.day}
                  </span>
                  {day.title}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                )}
              </button>
              {isExpanded && (
                <div className="p-3 pl-10 text-xs text-white/60 bg-slate-950/40 leading-relaxed border-t border-white/5">
                  {day.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Controls (Locked) */}
      <div className="p-3 bg-slate-900 border-t border-white/10 flex gap-2 justify-end">
        <button
          onClick={onUnlock}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-[11px] font-bold text-white/50 cursor-not-allowed hover:bg-white/5 transition-colors"
        >
          <Edit className="w-3.5 h-3.5 text-white/30" /> Edit Route
        </button>
        <button
          onClick={onUnlock}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-[11px] font-bold text-white/50 cursor-not-allowed hover:bg-white/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-white/30" /> Download PDF
        </button>
      </div>

      {/* Guide Details (Blur / Paywall Pitch) */}
      <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900 border-t border-white/10 text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold block mb-1">
          Assigned Mountain Guide
        </span>
        <h5 className="text-white font-bold text-sm">{data.guide.name}</h5>
        
        <div className="flex items-center justify-center gap-3 mt-1.5 text-xs text-white/50">
          <span className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" /> {data.guide.rating}
          </span>
          <span>•</span>
          <span>{data.guide.trips}</span>
        </div>

        {/* Blurred Phone Number Section */}
        <div className="mt-3.5 relative py-2.5 px-4 bg-white/5 border border-white/5 rounded-xl max-w-xs mx-auto flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-white/50 select-none">
            <Phone className="w-4 h-4 text-amber-500/50" />
            <span className="blur-[4px]">{data.guide.phone}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full select-none">
            <Lock className="w-3 h-3" /> Locked
          </span>
        </div>

        <p className="text-[11px] text-white/40 mt-2">
          Unlock this itinerary & get direct phone contact with {data.guide.name}.
        </p>

        <button
          onClick={onUnlock}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/15"
        >
          Unlock Itinerary & Guide Contact
        </button>
      </div>
    </div>
  );
}
