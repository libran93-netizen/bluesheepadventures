import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book a Trek",
  description:
    "Get in touch with Blue Sheep Adventures to book a Himalayan trek or expedition, or to ask any questions before you commit.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />

      <section
        style={{
          background: "linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 100%)",
          padding: "10rem 2rem 5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <span className="eyebrow">Let&apos;s Go</span>
          <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 700, color: "var(--white)", lineHeight: 1.1, marginBottom: "1rem" }}>
            Plan Your Trek
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>
            Tell us what you&apos;re looking for — we&apos;ll respond within 24 hours
            with availability, recommendations, and next steps.
          </p>
        </div>
      </section>

      <main style={{ background: "var(--cream)", padding: "5rem 0 7rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", maxWidth: 1000, margin: "0 auto" }}>

            {/* Contact info */}
            <div>
              <h2 style={{ fontFamily: "var(--ff-display)", fontSize: "1.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1.5rem" }}>
                Get in Touch
              </h2>
              <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, marginBottom: "2rem" }}>
                Whether you have a specific trek in mind or just want to understand your options,
                we&apos;re happy to help. Most enquiries get a detailed response within one business day.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {[
                  { icon: "✉", label: "Email", value: "info@bluesheepadventures.com", href: "mailto:info@bluesheepadventures.com" },
                  { icon: "📸", label: "Instagram", value: "@bluesheepadventures", href: "https://instagram.com/bluesheepadventures" },
                  { icon: "📍", label: "Base", value: "Himachal Pradesh, India", href: null },
                ].map((c) => (
                  <div key={c.label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.2rem" }}>{c.label}</div>
                      {c.href ? (
                        <a href={c.href} style={{ fontSize: "0.95rem", color: "var(--sky)", fontWeight: 500 }}>{c.value}</a>
                      ) : (
                        <span style={{ fontSize: "0.95rem", color: "var(--ink-mid)" }}>{c.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquiry form */}
            <div
              style={{
                background: "var(--white)",
                borderRadius: "var(--radius)",
                padding: "2.5rem",
                boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1.5rem" }}>
                Trek Enquiry
              </h3>
              <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-mid)", display: "block", marginBottom: "0.4rem" }}>Name</label>
                    <input type="text" name="name" placeholder="Your name" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--cream-dark)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-mid)", display: "block", marginBottom: "0.4rem" }}>Email</label>
                    <input type="email" name="email" placeholder="your@email.com" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--cream-dark)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", outline: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-mid)", display: "block", marginBottom: "0.4rem" }}>Trek / Expedition Interested In</label>
                  <select name="trek" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--cream-dark)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", background: "white", outline: "none" }}>
                    <option value="">Select a trek</option>
                    <option>Kang Yatse 2 Expedition</option>
                    <option>Yunam Peak</option>
                    <option>Friendship Peak</option>
                    <option>Rupin Pass Trek</option>
                    <option>Hampta Pass Trek</option>
                    <option>Pin Parvati Pass</option>
                    <option>Not sure — need a recommendation</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-mid)", display: "block", marginBottom: "0.4rem" }}>Group Size</label>
                  <select name="group_size" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--cream-dark)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", background: "white", outline: "none" }}>
                    <option>Solo</option>
                    <option>2 people</option>
                    <option>3-4 people</option>
                    <option>5-8 people</option>
                    <option>Larger group</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-mid)", display: "block", marginBottom: "0.4rem" }}>Tell us about your experience &amp; dates</label>
                  <textarea name="message" rows={4} placeholder="Previous trekking experience, preferred dates, any questions..." style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid var(--cream-dark)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", resize: "vertical", outline: "none" }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Send Enquiry →
                </button>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-light)", textAlign: "center" }}>
                  We respond within 24 hours. No spam, ever.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
