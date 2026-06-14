"use client";

import React from "react";
import { X, Calendar, Compass, ShieldCheck, Award, Users, AlertTriangle } from "lucide-react";
import { getDifficultyBadgeClass, formatPrice } from "@/lib/treks";

interface MapSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  type: "region" | "trek";
  data: any; // RegionConfig or Trek
  onPlanWithAI: (prompt: string) => void;
}

export default function MapSidePanel({ isOpen, onClose, type, data, onPlanWithAI }: MapSidePanelProps) {
  if (!isOpen || !data) return null;

  const handlePlanClick = () => {
    if (type === "trek") {
      onPlanWithAI(`I want to plan a custom DIY itinerary for the ${data.name} trek.`);
    } else {
      onPlanWithAI(`I want to plan a custom trek in ${data.name}.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">
            {type === "trek" ? "Trek Details" : "Himalayan Region"}
          </span>
          <h3 className="text-xl font-bold text-white font-serif mt-0.5">
            {data.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {/* Short Description */}
        <p className="text-white/70 text-sm leading-relaxed">
          {data.description || data.shortDesc}
        </p>

        {type === "trek" ? (
          <>
            {/* Trek stats grid */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 rounded-xl p-4">
              <div>
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Duration</div>
                <div className="text-white font-semibold text-sm mt-0.5">{data.duration} Days</div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Max Altitude</div>
                <div className="text-white font-semibold text-sm mt-0.5">{data.maxAltitude}m</div>
              </div>
              <div className="mt-2">
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Difficulty</div>
                <div className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${getDifficultyBadgeClass(data.difficulty)}`}>
                  {data.difficulty}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Best Season</div>
                <div className="text-white font-semibold text-xs mt-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  {data.bestSeason}
                </div>
              </div>
            </div>

            {/* Highlights */}
            {data.highlights && data.highlights.length > 0 && (
              <div>
                <h4 className="text-white font-serif font-bold text-xs uppercase tracking-wider mb-2.5">
                  Route Highlights
                </h4>
                <ul className="space-y-2">
                  {data.highlights.map((h: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                      <span className="text-amber-500 shrink-0 mt-0.5">✦</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety/Acclimatisation notice */}
            {data.maxAltitude > 4000 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-amber-500 font-bold text-xs">High Altitude Safety</h5>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                    This trek reaches {data.maxAltitude}m. DIY routes generated here always include a mandatory altitude acclimatisation day to ensure safe Wilderness First Responder (WFR) protocols.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Region Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-white/40 text-[9px] uppercase font-bold tracking-wider">Total Routes</div>
                <div className="text-white font-serif text-2xl font-bold mt-1">{data.trekCount}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-white/40 text-[9px] uppercase font-bold tracking-wider">Verified Guides</div>
                <div className="text-amber-500 font-serif text-2xl font-bold mt-1">{data.guideCount}</div>
              </div>
            </div>

            {/* Guide benefits */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-xs">WFR Safety Protocol</h5>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                    Every guide registered in this region is certified in Wilderness First Aid & mountain rescue.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-xs">100% Direct Remittance</h5>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                    We charge zero commissions. Unlocking a guide's contact details allows you to transact with them directly, ensuring they are paid fairly.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer / CTA Actions */}
      <div className="p-5 border-t border-white/10 bg-slate-900/40 space-y-3">
        <button
          onClick={handlePlanClick}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/5"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
          Plan with AI Coordinator (Free)
        </button>

        <a
          href={type === "trek" ? `/providers?trek=${data.slug}` : `/providers?region=${data.id}`}
          className="w-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200"
        >
          <Users className="w-4 h-4 text-sky-400" />
          Explore Verified Local Providers
        </a>
      </div>
    </div>
  );
}
