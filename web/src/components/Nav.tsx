"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const LINKS = [
  { href: "/treks", label: "Treks" },
  { href: "/guides", label: "Guides" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "bg-gradient-to-b from-[#0a0f1a]/70 to-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-[72px]">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo-mark.png"
            alt="Blue Sheep Adventures"
            width={44}
            height={24}
            className="h-6 md:h-7 w-auto"
            priority
          />
          <span className="font-serif font-bold tracking-wide text-[15px] md:text-base text-white">
            Blue Sheep <span className="text-gold-400">Adventures</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-white/70 hover:text-white tracking-wide transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#plan"
            className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-ink-950 text-[13px] font-bold rounded-full px-5 py-2.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Plan with AI
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-white/80 hover:text-white"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-white/[0.06] bg-[#0a0f1a]/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-1 animate-fade-up">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-medium text-white/80 hover:text-white border-b border-white/[0.05] last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#plan"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-1.5 bg-gold-500 text-ink-950 text-sm font-bold rounded-full px-5 py-3"
          >
            <Sparkles className="w-4 h-4" /> Plan with AI
          </Link>
        </nav>
      )}
    </header>
  );
}
