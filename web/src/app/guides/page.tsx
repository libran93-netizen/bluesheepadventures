"use client";

import React, { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PaywallModal from "@/components/chat/PaywallModal";
import { Phone, Star, ShieldCheck, MapPin, Search, Globe, Compass, MessageSquare } from "lucide-react";

interface Guide {
  id: string;
  name: string;
  phone: string;
  regions: string[];
  treks: string[];
  languages: string[];
  experience: number;
  rating: string;
  trips: number;
  responseRate: string;
  avatar: string;
}

const MOCK_GUIDES: Guide[] = [
  {
    id: "guide-1",
    name: "Rigzin Dorje",
    phone: "+91 98765 43210",
    regions: ["Ladakh"],
    treks: ["Kang Yatse 2 Expedition", "Markha Valley Trek"],
    languages: ["English", "Hindi", "Tibetan/Ladakhi"],
    experience: 12,
    rating: "4.9",
    trips: 140,
    responseRate: "98%",
    avatar: "RD",
  },
  {
    id: "guide-2",
    name: "Amit Negi",
    phone: "+91 98123 45678",
    regions: ["Himachal Pradesh"],
    treks: ["Pin Parvati Pass", "Yunam Peak", "Friendship Peak", "Hampta Pass"],
    languages: ["English", "Hindi", "Kinnauri"],
    experience: 9,
    rating: "4.8",
    trips: 110,
    responseRate: "95%",
    avatar: "AN",
  },
  {
    id: "guide-3",
    name: "Kalyan Singh",
    phone: "+91 98000 12345",
    regions: ["Uttarakhand"],
    treks: ["Rupin Pass Trek", "Har Ki Dun", "Kedarkantha"],
    languages: ["Hindi", "Garhwali"],
    experience: 14,
    rating: "4.95",
    trips: 180,
    responseRate: "100%",
    avatar: "KS",
  },
  {
    id: "guide-4",
    name: "Tashi Sherpa",
    phone: "+91 98456 78901",
    regions: ["Sikkim", "West Bengal"],
    treks: ["Goechala Trek", "Sandakphu Trek"],
    languages: ["English", "Hindi", "Nepali", "Tibetan"],
    experience: 8,
    rating: "4.75",
    trips: 85,
    responseRate: "92%",
    avatar: "TS",
  },
  {
    id: "guide-5",
    name: "Dorjee Lhatoo",
    phone: "+91 98321 09876",
    regions: ["Ladakh", "Himachal Pradesh"],
    treks: ["Stok Kangri (Climbing)", "Yunam Peak"],
    languages: ["English", "Hindi", "Tibetan"],
    experience: 15,
    rating: "5.0",
    trips: 210,
    responseRate: "99%",
    avatar: "DL",
  },
];

export default function GuidesPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const handleUnlockClick = (guide: Guide) => {
    setSelectedGuide(guide);
    setIsPaywallOpen(true);
  };

  const filteredGuides = MOCK_GUIDES.filter((guide) => {
    const matchesRegion = selectedRegion === "All" || guide.regions.includes(selectedRegion);
    const matchesSearch =
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.treks.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col justify-between selection:bg-gold-500 selection:text-ink-950">
      <Nav />

      {/* Main Container */}
      <main className="container flex-1 py-24 md:py-32">
        
        {/* Header Block */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500 bg-gold-500/10 px-3 py-1 rounded-full w-fit mx-auto flex items-center gap-1.5 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Wilderness First Responder Verified
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
            Local Himalayan Guides
          </h1>
          <p className="text-white/60 text-xs mt-3 leading-relaxed">
            Connect directly with verified local guides. Keep 100% of the booking fees inside local mountain communities and save up to 60% on expedition costs.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-ink-900 border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Region Tabs */}
          <div className="flex flex-wrap gap-2">
            {["All", "Ladakh", "Himachal Pradesh", "Uttarakhand", "Sikkim"].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedRegion === region
                    ? "bg-gold-500 text-ink-950"
                    : "bg-ink-950 border border-white/10 text-white/70 hover:text-white hover:border-white/20"
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search guide name or specific trek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-gold-500/80 transition-colors"
            />
          </div>

        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-ink-900/60 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Profile Top */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Left info: avatar and main details */}
                  <div className="flex items-center gap-4">
                    {/* Stylized text avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center font-serif text-lg font-bold text-ink-950 shadow-md">
                      {guide.avatar}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                        {guide.name}
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Available" />
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-white/50 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          {guide.regions.join(", ")}
                        </span>
                        <span>•</span>
                        <span>{guide.experience} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Right info: rating */}
                  <div className="text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-gold-400 bg-gold-500/10 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-gold-400" /> {guide.rating}
                    </span>
                    <span className="block text-[10px] text-white/40 mt-1">{guide.trips}+ trips</span>
                  </div>

                </div>

                {/* Cover Treks list */}
                <div className="mt-5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500/80 block mb-2">
                    Verified Routes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.treks.map((t) => (
                      <span
                        key={t}
                        className="bg-ink-950 border border-white/5 px-2.5 py-1 rounded-lg text-[10px] text-white/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Languages: <strong>{guide.languages.join(", ")}</strong></span>
                </div>
              </div>

              {/* Bottom Actions and Locked Contact Info */}
              <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Phone lock */}
                <div className="py-2 px-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between sm:justify-start gap-4 flex-1">
                  <span className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
                    <Phone className="w-4 h-4 text-gold-500/60" />
                    <span className="blur-[4px] select-none">+91 ••••• •••••</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-white/40 bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                    Locked
                  </span>
                </div>

                {/* Unlock Button */}
                <button
                  onClick={() => handleUnlockClick(guide)}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 text-xs font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-gold-500/10 shrink-0 flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" /> Unlock Direct Contact
                </button>

              </div>

            </div>
          ))}
        </div>

      </main>

      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
      <Footer />
    </div>
  );
}
