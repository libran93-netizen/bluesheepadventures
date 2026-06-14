import Link from "next/link";
import Image from "next/image";

const COLS = [
  {
    title: "Explore",
    links: [
      { href: "/treks", label: "All Treks" },
      { href: "/treks?region=himachal", label: "Himachal Pradesh" },
      { href: "/treks?region=uttarakhand", label: "Uttarakhand" },
      { href: "/treks?region=kashmir", label: "Kashmir" },
      { href: "/treks?region=nepal", label: "Nepal" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/#plan", label: "Plan with AI" },
      { href: "/guides", label: "Verified Guides" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#070b13] border-t border-white/[0.06]">
      <div className="container py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Image
              src="/images/logo-full-dark.png"
              alt="Blue Sheep Adventures"
              width={180}
              height={180}
              className="w-44 h-auto -ml-3"
            />
            <p className="mt-4 text-sm text-white/45 leading-relaxed max-w-xs">
              Design your own Himalayan trek with AI grounded on real itineraries,
              then unlock the verified local guides behind every route.
              Himachal · Uttarakhand · Kashmir · Nepal.
            </p>
            <a
              href="https://instagram.com/bluesheepadventures"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5 text-xs font-bold tracking-widest uppercase text-gold-400 hover:text-gold-300 transition-colors"
            >
              Instagram ↗
            </a>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold tracking-[0.18em] uppercase text-gold-500 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <p>© {new Date().getFullYear()} Blue Sheep Adventures. All rights reserved.</p>
          <p>Made in the Himalayas 🏔</p>
        </div>
      </div>
    </footer>
  );
}
