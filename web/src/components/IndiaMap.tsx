"use client";

import React, { useState } from "react";
import { Compass, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { REGIONS, TREK_PINS, RegionConfig, TrekPinConfig } from "@/lib/himalaya-config";

interface IndiaMapProps {
  onSelectRegion: (regionId: string) => void;
  onSelectTrek: (trekSlug: string) => void;
  selectedRegion: string | null;
}

export default function IndiaMap({ onSelectRegion, onSelectTrek, selectedRegion }: IndiaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredTrek, setHoveredTrek] = useState<string | null>(null);

  const activeRegionId = hoveredRegion || selectedRegion;
  const activeRegion = REGIONS.find((r) => r.id === activeRegionId);

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-between overflow-visible shadow-2xl">
      {/* Background glow animations */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Map Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Interactive Himalayan Explorer
          </span>
          <h3 className="text-xl font-bold text-white font-serif mt-1">Phase 1 Route Matrix</h3>
        </div>
        <div className="text-right text-[11px] text-white/50 hidden sm:block">
          Select region or trek pin to explore details
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full flex items-center justify-center min-h-[300px] sm:min-h-[360px] my-2 select-none overflow-visible">
        <svg
          viewBox="100 100 540 260"
          className="w-full h-auto max-h-[360px] overflow-visible"
        >
          {/* Base shadow map outline */}
          <path
            d="M 100 250 L 150 130 L 250 120 L 310 140 L 380 170 L 630 250 L 610 330 L 380 280 L 280 270 L 210 260 Z"
            fill="#0b0f19"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="3"
          />

          {/* Region Paths */}
          {REGIONS.map((region) => {
            const isHovered = hoveredRegion === region.id;
            const isSelected = selectedRegion === region.id;
            
            return (
              <path
                key={region.id}
                d={region.path}
                fill={isSelected ? `${region.color}35` : isHovered ? `${region.color}20` : `${region.color}08`}
                stroke={isHovered || isSelected ? region.color : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={isSelected ? "2.5" : isHovered ? "1.8" : "1"}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => onSelectRegion(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
            );
          })}

          {/* Region Name Texts */}
          {REGIONS.map((region) => {
            // Find centroid coordinate from path to place region name nicely
            let tx = 0, ty = 0;
            if (region.id === "kashmir") { tx = 180; ty = 165; }
            if (region.id === "himachal") { tx = 275; ty = 160; }
            if (region.id === "uttarakhand") { tx = 340; ty = 175; }
            if (region.id === "nepal") { tx = 500; ty = 225; }

            const isActive = hoveredRegion === region.id || selectedRegion === region.id;

            return (
              <text
                key={`text-${region.id}`}
                x={tx}
                y={ty}
                textAnchor="middle"
                className={`text-[9px] font-bold tracking-widest pointer-events-none transition-all duration-200 ${
                  isActive ? "fill-white opacity-100 font-extrabold" : "fill-white/40 opacity-70"
                }`}
              >
                {region.name.toUpperCase()}
              </text>
            );
          })}

          {/* Trek Pins */}
          {TREK_PINS.map((pin) => {
            const isHighAltitude = pin.maxAltitude > 4000;
            const isHovered = hoveredTrek === pin.slug;
            const region = REGIONS.find((r) => r.id === pin.regionId);
            const pinColor = region?.color || "#f59e0b";

            return (
              <g
                key={pin.slug}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrek(pin.slug);
                }}
                onMouseEnter={() => {
                  setHoveredTrek(pin.slug);
                  setHoveredRegion(pin.regionId);
                }}
                onMouseLeave={() => {
                  setHoveredTrek(null);
                  setHoveredRegion(null);
                }}
              >
                {/* Ping animation for high-altitude or hovered treks */}
                {(isHighAltitude || isHovered) && (
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={isHovered ? 12 : 7}
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1"
                    className="animate-ping opacity-70"
                  />
                )}

                {/* Main Pin Dot */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={isHovered ? 5.5 : isHighAltitude ? 4.5 : 3.5}
                  fill={isHighAltitude ? "#f59e0b" : "#ffffff"}
                  stroke={pinColor}
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />

                {/* Small indicator inside the dot */}
                {isHighAltitude && (
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="1.5"
                    fill="#1e293b"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Trek Hover Tooltip (HTML overlay) */}
        {hoveredTrek && (() => {
          const pin = TREK_PINS.find((p) => p.slug === hoveredTrek)!;
          const isHighAltitude = pin.maxAltitude > 4000;
          return (
            <div className="absolute z-30 bg-slate-950/95 border border-white/10 rounded-xl p-3 shadow-xl max-w-[200px] pointer-events-none transition-all duration-200 text-left"
                 style={{
                   left: `${(pin.x - 100) / 540 * 100}%`,
                   top: `${(pin.y - 100) / 260 * 100 - 45}%`,
                   transform: "translateX(-50%)",
                 }}
            >
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-white/50">
                <span>{pin.duration} Days</span>
                <span>•</span>
                <span className={isHighAltitude ? "text-amber-400 font-semibold" : ""}>{pin.maxAltitude}m</span>
              </div>
              <h4 className="text-white font-semibold text-xs mt-0.5 line-clamp-1">{pin.name}</h4>
              <div className="flex items-center justify-between mt-1 text-[9px] text-white/40">
                <span>{pin.difficulty}</span>
                {isHighAltitude && (
                  <span className="text-amber-500 bg-amber-500/10 px-1 rounded-sm text-[8px] font-bold">HIGH ALTITUDE</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Selected/Hovered Region quick info block */}
      <div className="relative z-10 bg-white/5 border border-white/5 rounded-xl p-4 transition-all duration-300 min-h-[90px] flex items-center justify-between">
        {activeRegion ? (
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: activeRegion.color }} />
                {activeRegion.name}
              </h4>
              <p className="text-white/60 text-xs mt-1 leading-normal line-clamp-2">
                {activeRegion.description}
              </p>
            </div>
            <div className="flex gap-4 border-l border-white/10 pl-4 text-center shrink-0">
              <div>
                <div className="text-white font-serif text-lg font-bold">{activeRegion.trekCount}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Routes</div>
              </div>
              <div>
                <div className="text-amber-500 font-serif text-lg font-bold">{activeRegion.guideCount}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Local Guides</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-2 text-white/40 text-xs italic flex items-center justify-center gap-2">
            <Compass className="w-4 h-4 animate-spin-slow" />
            Hover over map or select a pin to view corridor routes.
          </div>
        )}
      </div>
    </div>
  );
}
