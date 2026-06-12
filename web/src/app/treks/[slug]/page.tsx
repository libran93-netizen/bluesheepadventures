"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatPanel from "@/components/chat/ChatPanel";
import PaywallModal from "@/components/chat/PaywallModal";
import { treks, getTrekBySlug, getDifficultyBadgeClass } from "@/lib/treks";
import { Phone, Star, ShieldCheck, MapPin, Sparkles, Compass, AlertCircle, Calendar } from "lucide-react";

interface Guide {
  id: string;
  name: string;
  regions: string[];
  treks: string[];
  experience: number;
  rating: string;
  avatar: string;
  phone: string;
}

const MOCK_GUIDES: Guide[] = [
  {
    id: "guide-1",
    name: "Rigzin Dorje",
    regions: ["Ladakh"],
    treks: ["Kang Yatse 2 Expedition", "Markha Valley Trek"],
    experience: 12,
    rating: "4.9",
    avatar: "RD",
    phone: "+91 98765 43210",
  },
  {
    id: "guide-2",
    name: "Amit Negi",
    regions: ["Himachal Pradesh"],
    treks: ["Pin Parvati Pass", "Yunam Peak", "Friendship Peak", "Hampta Pass"],
    experience: 9,
    rating: "4.8",
    avatar: "AN",
    phone: "+91 98123 45678",
  },
  {
    id: "guide-3",
    name: "Kalyan Singh",
    regions: ["Uttarakhand"],
    treks: ["Rupin Pass Trek", "Har Ki Dun", "Kedarkantha"],
    experience: 14,
    rating: "4.95",
    avatar: "KS",
    phone: "+91 98000 12345",
  },
  {
    id: "guide-5",
    name: "Dorjee Lhatoo",
    regions: ["Ladakh", "Himachal Pradesh"],
    treks: ["Stok Kangri (Climbing)", "Yunam Peak"],
    experience: 15,
    rating: "5.0",
    avatar: "DL",
    phone: "+91 98321 09876",
  },
];

type Props = { params: Promise<{ slug: string }> };

export default function TrekDetailPage({ params }: Props) {
  const { slug } = use(params);
  const trek = getTrekBySlug(slug);
  
  if (!trek) notFound();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Filter guides who cover this specific trek or region
  const matchingGuides = MOCK_GUIDES.filter(
    (g) =>
      g.treks.includes(trek.name) ||
      trek.region.toLowerCase().includes(g.regions[0].toLowerCase())
  );

  return (
    <div className="min-h-screen bg-ink-950 text-white selection:bg-gold-500 selection:text-ink-950">
      <Nav />

      {/* Hero — full-bleed trek photo */}
      <section className="relative min-h-[62vh] md:min-h-[70vh] flex items-end py-14 md:py-20 overflow-hidden">
        <Image
          src={trek.image}
          alt={trek.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/30 pointer-events-none" />
        <div className="container relative z-10 w-full">
          
          <div className="mb-4 flex gap-2 items-center text-xs text-white/50">
            <Link href="/treks" className="hover:text-white transition-colors">
              ← All Treks
            </Link>
            <span>›</span>
            <span>{trek.region}</span>
          </div>

          <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md mb-4 ${getDifficultyBadgeClass(trek.difficulty)}`}>
            {trek.difficulty}
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-white mb-6 max-w-3xl">
            {trek.name}
          </h1>

          <div className="flex flex-wrap gap-6 mt-6">
            {[
              { label: "Duration", value: `${trek.duration} days` },
              { label: "Max Altitude", value: `${trek.maxAltitude.toLocaleString()}m` },
              { label: "Best Season", value: trek.bestSeason },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-gold-500 font-bold mb-0.5">
                  {m.label}
                </div>
                <div className="text-sm font-bold text-white">{m.value}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Body Section */}
      <main className="bg-ink-950 py-16 border-t border-white/5">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Description & Highlights */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">
                  About This Route
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  {trek.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-white mb-4">
                  Route Highlights
                </h3>
                <ul className="space-y-3">
                  {trek.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-xs md:text-sm text-white/70 leading-relaxed">
                      <span className="text-gold-500 font-bold shrink-0 mt-0.5">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Protocol Panel */}
              <div className="bg-ink-900 border border-white/5 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Acclimatisation & Safety Guidelines
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  Every guide listed covers WFR safety standards. Because this route ascends to <strong>{trek.maxAltitude}m</strong>, local safety protocol requires proper acclimatisation camp setups. Do not skip high camp rest days.
                </p>
              </div>
            </div>

            {/* Right Column: DIY Actions & Guides Side Rail */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* DIY Planner Widget */}
              <div className="bg-ink-900 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gold-500 text-ink-950 font-bold text-[8px] uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  AI Planner
                </div>
                
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" /> Custom DIY Planner
                </h3>
                <p className="text-white/60 text-[11px] mt-2 leading-relaxed">
                  Plan day-by-day camp spots, packing checklist, and altitude metrics with our AI coordinator.
                </p>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" /> Start Custom AI Plan
                </button>
              </div>

              {/* Verified Guide Rail */}
              <div className="bg-ink-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs uppercase tracking-widest text-gold-500 font-bold mb-4">
                  Verified Local Guides ({matchingGuides.length})
                </h3>

                <div className="space-y-4">
                  {matchingGuides.map((guide) => (
                    <div 
                      key={guide.id}
                      className="bg-ink-950/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center font-serif text-sm font-bold text-ink-950">
                            {guide.avatar}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{guide.name}</h4>
                            <p className="text-[10px] text-white/50">{guide.experience} yrs experience</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-gold-400">
                          <Star className="w-3.5 h-3.5 fill-gold-400" /> {guide.rating}
                        </span>
                      </div>

                      {/* Locked number strip */}
                      <div className="mt-3 py-1.5 px-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-white/45 font-mono select-none blur-[3px]">
                          +91 ••••• •••••
                        </span>
                        <span className="text-[8px] uppercase tracking-wider font-bold text-gold-500">
                          Locked
                        </span>
                      </div>

                      <button
                        onClick={() => setIsPaywallOpen(true)}
                        className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all duration-200"
                      >
                        Unlock Guide Contact (₹499)
                      </button>
                    </div>
                  ))}

                  {matchingGuides.length === 0 && (
                    <p className="text-white/40 text-xs italic text-center py-4">
                      No local guides registered for this route yet.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Floating AI Panel Drawer */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialDestination={trek.region}
        initialMessage={`I want to plan a trek to ${trek.name}`}
      />

      <PaywallModal 
        isOpen={isPaywallOpen} 
        onClose={() => setIsPaywallOpen(false)} 
      />

      <Footer />
    </div>
  );
}
