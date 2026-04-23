import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TrekCard from "@/components/TrekCard";
import { getFeaturedTreks } from "@/lib/treks";

export default function HomePage() {
  const featured = getFeaturedTreks();

  return (
    <>
      <Nav />

      {/* ── HERO ────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0d1522 0%, #1c2e45 50%, #1a3320 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "8rem 2rem 6rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background texture overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 60%, rgba(74,158,186,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(200,146,58,0.08) 0%, transparent 50%)" }} />

        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <span className="eyebrow" style={{ fontSize: "0.78rem", letterSpacing: "3px" }}>
            Himachal Pradesh · Ladakh · Nepal
          </span>
          <h1
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.08,
              marginBottom: "1.5rem",
            }}
          >
            The Himalayas<br />
            <span style={{ color: "var(--gold)" }}>are waiting.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.75,
              marginBottom: "2.5rem",
              maxWidth: 580,
              margin: "0 auto 2.5rem",
            }}
          >
            Expert-led treks and high-altitude expeditions — from moderate passes
            to 6,000m summits. Led by certified professionals who know these mountains deeply.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/treks" className="btn btn-primary">
              Explore All Treks →
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Plan Your Trek
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section style={{ background: "var(--navy)", padding: "3rem 0" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            {[
              { num: "10+", label: "Years in the Himalayas" },
              { num: "50+", label: "Trek Batches Led" },
              { num: "6,250m", label: "Highest Summit" },
              { num: "100%", label: "Safe Return Rate" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: "var(--ff-display)",
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                    lineHeight: 1,
                    marginBottom: "0.4rem",
                  }}
                >
                  {s.num}
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TREKS ──────────────────────────────── */}
      <section style={{ background: "var(--cream)", padding: "6rem 0" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our Expeditions</span>
            <h2>Featured Treks &amp; Summits</h2>
            <p>
              From your first Himalayan crossing to a 6,000m expedition —
              every route designed around safety, experience, and the landscape.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
          >
            {featured.map((trek) => (
              <TrekCard key={trek.slug} trek={trek} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/treks" className="btn btn-dark">
              View All Treks →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY US ──────────────────────────────────────── */}
      <section style={{ background: "var(--white)", padding: "6rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
            <div>
              <span className="eyebrow">Why Blue Sheep Adventures</span>
              <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, marginBottom: "1.5rem" }}>
                Safety is not a policy.<br />It's a practice.
              </h2>
              <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, marginBottom: "1rem" }}>
                Every leader on our treks is WFR certified (Wilderness First Responder — NOLS),
                trained in high-altitude medicine, and has personally led the routes they take you on.
                We don&apos;t outsource safety to checklists.
              </p>
              <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, marginBottom: "2rem" }}>
                Small groups, careful acclimatisation schedules, satellite communication on every
                expedition, and a no-summit-at-all-costs philosophy. The mountain is always there next season.
              </p>
              <Link href="/about" className="btn btn-dark">
                Meet the Team →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { icon: "🏔", title: "WFR Certified Leaders", desc: "Wilderness First Responder certified on every trek" },
                { icon: "📡", title: "Satellite Communication", desc: "Garmin inReach on all expeditions above 4,500m" },
                { icon: "👥", title: "Small Groups", desc: "Maximum 8 per expedition for quality and safety" },
                { icon: "🗺", title: "Expert Route Knowledge", desc: "Leaders who have personally led every route" },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "var(--cream)",
                    borderRadius: "var(--radius)",
                    padding: "1.5rem",
                  }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                  <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)", marginBottom: "0.4rem" }}>{f.title}</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-light)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section style={{ background: "var(--navy)", padding: "6rem 0" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">From the Community</span>
            <h2 style={{ color: "var(--white)" }}>What Trekkers Say</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              {
                quote: "Kang Yatse 2 was the hardest thing I've ever done — and the best. The leadership made every decision feel considered and safe. I came back a different person.",
                author: "Priya M.", trek: "Kang Yatse 2 Expedition",
              },
              {
                quote: "I'd done trekking before but nothing like this. The acclimatisation was handled perfectly, the team was incredible, and I actually summited something I wasn't sure I could.",
                author: "Rohit K.", trek: "Yunam Peak",
              },
              {
                quote: "The Rupin Pass was everything the Instagram posts promise and nothing like what I expected — it was better. The crew, the route, the campsites. Genuinely world-class.",
                author: "Ananya S.", trek: "Rupin Pass Trek",
              },
            ].map((t) => (
              <div
                key={t.author}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--radius)",
                  padding: "2rem",
                }}
              >
                <p style={{ fontFamily: "var(--ff-display)", fontStyle: "italic", fontSize: "1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--white)" }}>{t.author}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gold)", marginTop: "0.2rem" }}>{t.trek}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--slate), var(--navy))",
          padding: "6rem 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <span className="eyebrow">Ready to Go?</span>
          <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "var(--white)", marginBottom: "1rem" }}>
            Your next expedition starts here.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem" }}>
            Tell us what you&apos;re looking for — we&apos;ll help you find the right route,
            prepare properly, and get to the summit safely.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary">
              Plan Your Trek →
            </Link>
            <Link href="/treks" className="btn btn-outline">
              Browse All Routes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
