import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { treks, getTrekBySlug, getDifficultyBadgeClass, formatPrice } from "@/lib/treks";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return treks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trek = getTrekBySlug(slug);
  if (!trek) return {};
  return {
    title: trek.name,
    description: trek.shortDesc,
  };
}

export default async function TrekDetailPage({ params }: Props) {
  const { slug } = await params;
  const trek = getTrekBySlug(slug);
  if (!trek) notFound();

  return (
    <>
      <Nav />

      {/* Hero */}
      <section
        style={{
          minHeight: "70vh",
          background: "linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 60%, var(--slate) 100%)",
          display: "flex",
          alignItems: "flex-end",
          padding: "8rem 2rem 4rem",
        }}
      >
        <div className="container" style={{ width: "100%" }}>
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link
              href="/treks"
              style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}
            >
              ← All Treks
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>{trek.region}</span>
          </div>
          <span className={`badge ${getDifficultyBadgeClass(trek.difficulty)}`} style={{ marginBottom: "1rem" }}>
            {trek.difficulty}
          </span>
          <h1
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 700,
              color: "var(--white)",
              lineHeight: 1.1,
              marginBottom: "1.2rem",
              maxWidth: 700,
            }}
          >
            {trek.name}
          </h1>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Duration", value: `${trek.duration} days` },
              { label: "Max Altitude", value: `${trek.maxAltitude.toLocaleString()}m` },
              { label: "Region", value: trek.region },
              { label: "Best Season", value: trek.bestSeason },
            ].map((m) => (
              <div key={m.label}>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.2rem" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--white)" }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <main style={{ background: "var(--cream)", padding: "5rem 0 7rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "4rem", alignItems: "start" }}>

            {/* Left: content */}
            <div>
              <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1.2rem" }}>
                About This Trek
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "var(--ink-mid)", marginBottom: "2.5rem" }}>
                {trek.description}
              </p>

              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1rem" }}>
                Highlights
              </h3>
              <ul style={{ listStyle: "none", marginBottom: "2.5rem" }}>
                {trek.highlights.map((h) => (
                  <li
                    key={h}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                      marginBottom: "0.8rem",
                      fontSize: "0.95rem",
                      color: "var(--ink-mid)",
                      lineHeight: 1.65,
                    }}
                  >
                    <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Safety section */}
              <div
                style={{
                  background: "var(--navy)",
                  borderRadius: "var(--radius)",
                  padding: "2rem",
                  color: "var(--white)",
                }}
              >
                <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.8rem" }}>
                  Safety &amp; Leadership
                </h3>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                  Every Blue Sheep Adventures expedition is led by WFR-certified (Wilderness First Responder, NOLS)
                  leaders with direct experience on this specific route. We carry satellite communication on all
                  treks above 4,500m, follow strict acclimatisation protocols, and operate a no-summit-at-all-costs
                  philosophy. Your safety is not negotiable.
                </p>
              </div>
            </div>

            {/* Right: booking card */}
            <div
              style={{
                background: "var(--white)",
                borderRadius: "var(--radius)",
                padding: "2rem",
                boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
                position: "sticky",
                top: "90px",
              }}
            >
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--cream-dark)" }}>
                <div style={{ fontFamily: "var(--ff-display)", fontSize: "2rem", fontWeight: 700, color: "var(--ink)" }}>
                  {formatPrice(trek.price)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--ink-light)", marginTop: "0.2rem" }}>per person, all inclusive</div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                {[
                  ["Duration", `${trek.duration} days`],
                  ["Max Altitude", `${trek.maxAltitude.toLocaleString()}m`],
                  ["Difficulty", trek.difficulty],
                  ["Group Size", "Max 8 persons"],
                  ["Best Season", trek.bestSeason],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.7rem", fontSize: "0.88rem" }}
                  >
                    <span style={{ color: "var(--ink-light)" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{value}</span>
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Book This Trek →
              </Link>
              <p style={{ fontSize: "0.75rem", color: "var(--ink-light)", textAlign: "center", marginTop: "0.8rem" }}>
                No payment required to enquire. We'll confirm availability and next steps.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
