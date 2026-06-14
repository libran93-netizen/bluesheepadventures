import Link from "next/link";
import Image from "next/image";
import { Clock, Mountain, CalendarDays, ArrowUpRight } from "lucide-react";
import { Trek, getDifficultyBadgeClass } from "@/lib/treks";

type Props = { trek: Trek };

const REGION_LABELS: Record<Trek["region"], string> = {
  kashmir: "Kashmir",
  himachal: "Himachal Pradesh",
  uttarakhand: "Uttarakhand",
  nepal: "Nepal",
};

export default function TrekCard({ trek }: Props) {
  return (
    <Link
      href={`/treks/${trek.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-ink-900 border border-white/[0.07] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trek.image}
          alt={trek.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-ink-950/10" />

        <span
          className={`absolute top-3.5 left-3.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md ${getDifficultyBadgeClass(trek.difficulty)}`}
        >
          {trek.difficulty}
        </span>

        {trek.maxAltitude > 4000 && (
          <span className="absolute top-3.5 right-3.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 backdrop-blur-md">
            High Altitude
          </span>
        )}

        <div className="absolute bottom-3.5 left-4 right-4">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold-300/90 mb-0.5">
            {REGION_LABELS[trek.region]}
          </div>
          <h3 className="font-serif text-lg md:text-xl font-bold text-white leading-snug">
            {trek.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 md:p-5">
        <p className="text-[13px] text-white/55 leading-relaxed line-clamp-2 flex-1">
          {trek.shortDesc}
        </p>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.07] text-[11.5px] text-white/60">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold-400" /> {trek.duration} days
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-gold-400" /> {trek.maxAltitude.toLocaleString()}m
          </span>
          <span className="hidden sm:flex items-center gap-1.5 truncate">
            <CalendarDays className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className="truncate">{trek.bestSeason}</span>
          </span>
          <ArrowUpRight className="w-4 h-4 ml-auto text-white/30 group-hover:text-gold-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
