import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TrekCard from "@/components/TrekCard";
import { treks } from "@/lib/treks";

export const metadata: Metadata = {
  title: "All Treks & Expeditions",
  description:
    "Browse all Himalayan treks and high-altitude expeditions offered by Blue Sheep Adventures — from moderate passes to 6,000m summits in Himachal Pradesh, Ladakh and Nepal.",
};

export default function TreksPage() {
  const moderate = treks.filter((t) => t.difficulty === "Moderate" || t.difficulty === "Easy");
  const hard = treks.filter((t) => t.difficulty === "Hard" || t.difficulty === "Very Hard");

  return (
    <>
      <Nav />

      {/* Page Hero */}
      <section
        style={{
          background: "linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 100%)",
          padding: "10rem 2rem 5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <span className="eyebrow">Himachal · Ladakh · Nepal</span>
          <h1
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 700,
              color: "var(--white)",
              lineHeight: 1.1,
              marginBottom: "1.2rem",
            }}
          >
            Treks &amp; Expeditions
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", lineHeight: 1.75 }}>
            Every route led by certified, experienced leaders who know these mountains personally.
            Choose your level — we'll get you there safely.
          </p>
        </div>
      </section>

      <main style={{ background: "var(--cream)", padding: "5rem 0 7rem" }}>
        <div className="container">

          {/* Moderate Treks */}
          <div style={{ marginBottom: "5rem" }}>
            <div className="section-head" style={{ textAlign: "left", marginBottom: "2rem" }}>
              <span className="eyebrow">For Trekkers</span>
              <h2>Moderate Routes</h2>
              <p style={{ textAlign: "left" }}>
                Challenging without technical climbing — ideal for fit, motivated trekkers
                looking for their first serious Himalayan experience.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {moderate.map((trek) => (
                <TrekCard key={trek.slug} trek={trek} />
              ))}
            </div>
          </div>

          {/* Hard / Expeditions */}
          <div>
            <div className="section-head" style={{ textAlign: "left", marginBottom: "2rem" }}>
              <span className="eyebrow">For Climbers</span>
              <h2>High-Altitude Expeditions</h2>
              <p style={{ textAlign: "left" }}>
                Technical terrain, glacier travel, and summits above 5,000m.
                Requires prior altitude experience and serious preparation.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {hard.map((trek) => (
                <TrekCard key={trek.slug} trek={trek} />
              ))}
            </div>
          </div>

          {/* Enquiry CTA */}
          <div
            style={{
              background: "var(--navy)",
              borderRadius: "var(--radius)",
              padding: "3rem",
              marginTop: "5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--white)", marginBottom: "0.5rem" }}>
                Not sure which trek is right for you?
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>
                Tell us your experience level and goals — we'll match you to the right route.
              </p>
            </div>
            <Link href="/contact" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Get a Recommendation →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
