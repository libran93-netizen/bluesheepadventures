"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TrekCard from "@/components/TrekCard";
import HimalayaMap3D from "@/components/HimalayaMap3D";
import ChatBar from "@/components/ChatBar";
import ChatPanel from "@/components/chat/ChatPanel";
import MapSidePanel from "@/components/MapSidePanel";
import { treks } from "@/lib/treks";
import { REGIONS } from "@/lib/himalaya-config";
import {
  ArrowRight,
  ShieldCheck,
  MessageSquareText,
  Map as MapIcon,
  PhoneCall,
  Quote,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: MessageSquareText,
    step: "01",
    title: "Design it free with AI",
    desc: "Tell our AI where you want to go. It plans day-by-day itineraries grounded on real treks we've led — distances, altitudes, campsites.",
  },
  {
    icon: MapIcon,
    step: "02",
    title: "Get your itinerary",
    desc: "Your first full itinerary is free — day-wise route, walking hours, acclimatisation profile, and a downloadable PDF.",
  },
  {
    icon: PhoneCall,
    step: "03",
    title: "Unlock local experts",
    desc: "Reveal the verified phone numbers of the local guides behind your route for ₹499. Talk to them directly — no middlemen, no commissions.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Planned my entire Hampta Pass trek in one evening. The guide I unlocked knew the trail like his backyard — and I paid him directly, no agency cut.",
    name: "Ananya S.",
    detail: "Hampta Pass, Sep 2025",
  },
  {
    quote:
      "The AI knew actual campsite-to-campsite distances, not generic blog fluff. Felt like talking to someone who had done the trek twenty times.",
    name: "Rohit M.",
    detail: "Kedarkantha, Jan 2026",
  },
  {
    quote:
      "We did Kashmir Great Lakes as a DIY group of five. Unlocking a local guide directly saved us nearly ₹40,000 versus a packaged operator.",
    name: "Priya & friends",
    detail: "Kashmir Great Lakes, Aug 2025",
  },
];

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDestination, setChatDestination] = useState<string | undefined>(undefined);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelType, setSidePanelType] = useState<"region" | "trek">("region");
  const [sidePanelData, setSidePanelData] = useState<any>(null);

  const handleSelectRegion = (regionId: string) => {
    const regionData = REGIONS.find((r) => r.id === regionId);
    if (!regionData) return;
    setSelectedRegion(regionId);
    setSidePanelType("region");
    setSidePanelData(regionData);
    setIsSidePanelOpen(true);
  };

  const handleSelectTrek = (trekSlug: string) => {
    const trekData = treks.find((t) => t.slug === trekSlug);
    if (!trekData) return;
    setSelectedRegion(trekData.region);
    setSidePanelType("trek");
    setSidePanelData(trekData);
    setIsSidePanelOpen(true);
  };

  const handleStartChat = (message: string) => {
    setChatInitialMessage(message);
    if (sidePanelType === "region" && sidePanelData) {
      setChatDestination(sidePanelData.name);
    } else if (sidePanelType === "trek" && sidePanelData) {
      setChatDestination(sidePanelData.region);
    } else {
      setChatDestination(undefined);
    }
    setIsChatOpen(true);
  };

  const featuredTreks = selectedRegion
    ? treks.filter((t) => t.region === selectedRegion)
    : treks.filter((t) => t.featured);

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Nav />

      {/* ── HERO: full-bleed 3D Himalaya map ─────────────────────────── */}
      <section id="plan" className="relative h-[100svh] min-h-[620px] overflow-hidden">
        <HimalayaMap3D
          onSelectRegion={handleSelectRegion}
          onSelectTrek={handleSelectTrek}
          selectedRegion={selectedRegion}
        />

        {/* Headline — top, doesn't block the map */}
        <div className="absolute top-24 md:top-28 inset-x-0 z-10 pointer-events-none">
          <div className="container text-center">
            <p className="text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase text-gold-300/90 mb-3 animate-fade-up">
              Himachal · Uttarakhand · Kashmir · Nepal
            </p>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.12] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] animate-fade-up">
              Design your own Himalayan trek.
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/75 max-w-xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] animate-fade-up">
              Free AI itineraries grounded on real expeditions — then unlock the
              verified local guides behind every route.
            </p>
          </div>
        </div>

        {/* Bottom dock: region chips + chat bar */}
        <div className="absolute bottom-0 inset-x-0 z-10 pb-5 md:pb-8 px-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Region chips */}
            <div className="flex gap-2 items-center justify-start md:justify-center overflow-x-auto no-scrollbar -mx-1 px-1">
              <button
                type="button"
                onClick={() => setSelectedRegion(null)}
                className={`shrink-0 text-[11px] font-bold tracking-wider uppercase rounded-full px-4 py-2 border backdrop-blur-md transition-all cursor-pointer ${
                  !selectedRegion
                    ? "bg-white text-ink-950 border-white"
                    : "bg-black/30 text-white/70 border-white/15 hover:border-white/40 hover:text-white"
                }`}
              >
                All Himalaya
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleSelectRegion(region.id)}
                  className={`shrink-0 flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase rounded-full px-4 py-2 border backdrop-blur-md transition-all cursor-pointer ${
                    selectedRegion === region.id
                      ? "bg-white text-ink-950 border-white"
                      : "bg-black/30 text-white/70 border-white/15 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: region.color, boxShadow: `0 0 6px ${region.color}` }}
                  />
                  {region.name}
                </button>
              ))}
            </div>

            <ChatBar onStartChat={handleStartChat} />

            <p className="text-center text-[10.5px] text-white/45 tracking-wide">
              Free itinerary in 3 messages · No login needed · Ctrl + scroll to explore the map
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] bg-ink-900/60">
        <div className="container py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "50+", label: "Real itineraries powering the AI" },
              { num: "13", label: "Himalayan routes live" },
              { num: "74", label: "Verified local guides" },
              { num: "48h", label: "Guide response guarantee" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-3xl md:text-4xl font-bold text-gold-400">
                  {s.num}
                </div>
                <div className="mt-1.5 text-[11px] uppercase font-bold tracking-wider text-white/45">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TREKS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold-500 mb-2">
                {selectedRegion
                  ? REGIONS.find((r) => r.id === selectedRegion)?.name
                  : "The Routes"}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                {selectedRegion ? "Treks in this region" : "Featured Himalayan treks"}
              </h2>
            </div>
            <Link
              href="/treks"
              className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300 transition-colors"
            >
              All treks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {featuredTreks.map((trek) => (
              <TrekCard key={trek.slug} trek={trek} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-ink-900/40 border-y border-white/[0.06]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold-500 mb-2">
              How it works
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Plan free. Pay only for the people.
            </h2>
            <p className="mt-4 text-sm text-white/55 leading-relaxed">
              We're not a booking platform. You design the trek, we connect you to the
              verified locals who make it happen — and you deal with them directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl bg-ink-950/70 border border-white/[0.07] p-7 md:p-8"
              >
                <span className="absolute top-6 right-7 font-serif text-4xl font-bold text-white/[0.07]">
                  {item.step}
                </span>
                <item.icon className="w-7 h-7 text-gold-400 mb-5" strokeWidth={1.6} />
                <h3 className="font-serif text-xl font-bold text-white mb-2.5">{item.title}</h3>
                <p className="text-[13px] text-white/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BLUE SHEEP ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold-500 mb-2">
                The Blue Sheep model
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
                The mountains belong to the people who live there.
              </h2>
              <p className="mt-5 text-sm text-white/55 leading-relaxed">
                Traditional operators take 15–35% commissions and hide the guides who
                actually keep you safe. We do the opposite: every itinerary shows you the
                real people behind it — trek guides, drivers, hosts — and you unlock
                their direct numbers.
              </p>
              <p className="mt-3 text-sm text-white/55 leading-relaxed">
                Guides are listed free, sign verified consent, and keep 100% of what you
                pay them. If a guide doesn't respond within 48 hours, you get your
                unlock credited back.
              </p>
              <Link
                href="/guides"
                className="mt-7 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300 transition-colors"
              >
                Meet the guides <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Grounded AI",
                  desc: "Route data comes only from itineraries we've actually trekked — never hallucinated distances or campsites.",
                },
                {
                  title: "Direct contact",
                  desc: "Raw phone numbers, WhatsApp deep links. You negotiate and pay locals directly.",
                },
                {
                  title: "48h guarantee",
                  desc: "Unlocked guide doesn't respond in 48 hours? The unlock is credited back to you.",
                },
                {
                  title: "DPDP compliant",
                  desc: "Every listed guide has signed consent. Verified identity, real experience, response-rate tracked.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl bg-ink-900/60 border border-white/[0.07] p-6"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-3.5" strokeWidth={1.8} />
                  <h4 className="font-bold text-white text-sm mb-1.5">{f.title}</h4>
                  <p className="text-[12.5px] text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-ink-900/40 border-y border-white/[0.06]">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold-500 mb-2">
              Trail notes
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              From trekkers who went DIY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl bg-ink-950/70 border border-white/[0.07] p-7 flex flex-col"
              >
                <Quote className="w-6 h-6 text-gold-500/60 mb-4" />
                <blockquote className="text-[13.5px] text-white/70 leading-relaxed flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 pt-4 border-t border-white/[0.07]">
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{t.detail}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 text-center">
        <div className="container max-w-2xl">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
            The Himalayas are waiting.
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/55">
            Your first itinerary is free. Start a conversation.
          </p>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-8 inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-sm rounded-full px-8 py-4 transition-colors cursor-pointer"
          >
            Plan my trek with AI <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── PANELS ───────────────────────────────────────────────────── */}
      <MapSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        type={sidePanelType}
        data={sidePanelData}
        onPlanWithAI={handleStartChat}
      />
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialDestination={chatDestination}
        initialMessage={chatInitialMessage}
      />

      <Footer />
    </div>
  );
}
