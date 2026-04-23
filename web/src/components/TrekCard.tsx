import Link from "next/link";
import { Trek, getDifficultyBadgeClass, formatPrice } from "@/lib/treks";

type Props = { trek: Trek };

export default function TrekCard({ trek }: Props) {
  return (
    <div className="trek-card">
      <div className="tc-img">
        {/* Replace with actual trek images */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, var(--navy-mid), var(--slate))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.2)",
            fontSize: "3rem",
          }}
        >
          ⛰
        </div>
        <div className="tc-badges">
          <span className={`badge ${getDifficultyBadgeClass(trek.difficulty)}`}>
            {trek.difficulty}
          </span>
        </div>
      </div>

      <div className="tc-body">
        <span className="tc-region">{trek.region}</span>
        <h3>{trek.name}</h3>
        <p>{trek.shortDesc}</p>

        <div className="tc-meta">
          <span>📅 {trek.duration} days</span>
          <span>⛰ {trek.maxAltitude.toLocaleString()}m</span>
          <span>🗓 {trek.bestSeason}</span>
        </div>

        <div className="tc-footer">
          <div className="tc-price">
            {formatPrice(trek.price)}
            <small> / person</small>
          </div>
          <Link href={`/treks/${trek.slug}`} className="btn btn-dark" style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem" }}>
            View Trek →
          </Link>
        </div>
      </div>
    </div>
  );
}
