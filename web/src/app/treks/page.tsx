import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TrekCard from "@/components/TrekCard";
import { treks } from "@/lib/treks";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "All Himalayan Treks",
  description:
    "Browse every trek on Blue Sheep Adventures — Kashmir, Himachal Pradesh, Uttarakhand and Nepal. Free AI itineraries and verified local guide contacts for each route.",
};

const SECTIONS = [
  {
    id: "kashmir",
    title: "Kashmir",
    blurb: "Alpine lakes and meadowed valleys — the gentlest beauty in the high Himalaya.",
  },
  {
    id: "himachal",
    title: "Himachal Pradesh",
    blurb: "Deodar forests, high passes, and the stark trans-Himalayan desert of Lahaul & Spiti.",
  },
  {
    id: "uttarakhand",
    title: "Uttarakhand",
    blurb: "Sacred Garhwal — vast bugyals, frozen lakes, and classic winter summits.",
  },
  {
    id: "nepal",
    title: "Nepal",
    blurb: "The giants. Everest, Annapurna and Langtang — the ultimate high-altitude tests.",
  },
] as const;

export default function TreksPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Nav />

      {/* Page hero */}
      <section className="pt-32 md:pt-40 pb-14 md:pb-20 border-b border-white/[0.06] bg-gradient-to-b from-ink-900/80 to-ink-950">
        <div className="container text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-500 mb-3">
            Himachal · Uttarakhand · Kashmir · Nepal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Every route, verified.
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed">
            Thirteen Himalayan treks across four regions. Plan any of them free with the AI,
            download your itinerary, and unlock the local guides who run the route.
          </p>
        </div>
      </section>

      <main className="py-16 md:py-24 space-y-20 md:space-y-28">
        {SECTIONS.map((section) => {
          const regionTreks = treks.filter((t) => t.region === section.id);
          if (regionTreks.length === 0) return null;
          return (
            <section key={section.id} id={section.id} className="container">
              <div className="mb-8 md:mb-10">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
                  {section.title}
                  <span className="ml-3 text-sm font-sans font-bold text-white/30 align-middle">
                    {regionTreks.length} {regionTreks.length === 1 ? "route" : "routes"}
                  </span>
                </h2>
                <p className="mt-2 text-sm text-white/50 max-w-xl">{section.blurb}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {regionTreks.map((trek) => (
                  <TrekCard key={trek.slug} trek={trek} />
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <section className="container">
          <div className="rounded-3xl bg-gradient-to-r from-ink-800 to-ink-900 border border-white/[0.08] px-8 py-10 md:px-14 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white">
                Not sure which trek fits you?
              </h3>
              <p className="mt-2 text-sm text-white/55 max-w-lg">
                Tell the AI your fitness, dates and dream views — it'll match you to the
                right route and build your first itinerary free.
              </p>
            </div>
            <Link
              href="/#plan"
              className="shrink-0 inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-sm rounded-full px-7 py-3.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Plan with AI
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
