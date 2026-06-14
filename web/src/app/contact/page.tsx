import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Mail, Instagram, MapPin, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Blue Sheep Adventures — questions about DIY trek planning, guide listings, or partnerships.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "info@bluesheepadventures.com",
    href: "mailto:info@bluesheepadventures.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@bluesheepadventures",
    href: "https://instagram.com/bluesheepadventures",
  },
  {
    icon: MapPin,
    label: "Base",
    value: "Himachal Pradesh, India",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Nav />

      <section className="pt-32 md:pt-40 pb-14 md:pb-20 border-b border-white/[0.06] bg-gradient-to-b from-ink-900/80 to-ink-950">
        <div className="container text-center max-w-xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-500 mb-3">
            Say hello
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">Contact us</h1>
          <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed">
            Planning questions go to the AI — it's faster and knows the routes. For
            everything else (guide listings, partnerships, press), reach us directly.
          </p>
        </div>
      </section>

      <main className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {CHANNELS.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-ink-900/70 border border-white/[0.07] p-6 text-center"
              >
                <c.icon className="w-6 h-6 text-gold-400 mx-auto mb-3.5" strokeWidth={1.7} />
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">
                  {c.label}
                </div>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white hover:text-gold-300 transition-colors break-all"
                  >
                    {c.value}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-white/80">{c.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Are you a guide? */}
          <div className="mt-10 rounded-3xl bg-gradient-to-r from-ink-800 to-ink-900 border border-white/[0.08] px-8 py-10 md:px-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
              Are you a local guide?
            </h2>
            <p className="mt-3 text-sm text-white/55 max-w-md mx-auto leading-relaxed">
              Get listed free, receive direct leads from trekkers, and keep 100% of what
              you earn. Email us your name, region and the treks you run.
            </p>
            <a
              href="mailto:info@bluesheepadventures.com?subject=Guide%20listing"
              className="mt-6 inline-flex items-center gap-2 bg-white hover:bg-white/90 text-ink-950 font-bold text-sm rounded-full px-7 py-3.5 transition-colors"
            >
              Apply to be listed
            </a>
          </div>

          {/* Plan CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-white/45">Want to plan a trek instead?</p>
            <Link
              href="/#plan"
              className="mt-3 inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-bold text-sm uppercase tracking-wider transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Talk to the AI planner
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
