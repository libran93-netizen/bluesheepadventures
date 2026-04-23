import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="nav-logo-icon">🐑</span>
              <span>BLUE SHEEP ADVENTURES</span>
            </div>
            <p>
              Expert-led Himalayan treks and high-altitude expeditions in
              Himachal Pradesh, Ladakh and Nepal. Safe, well-organised,
              and built around the mountains we know deeply.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/treks">All Treks</Link></li>
              <li><Link href="/expeditions">Expeditions</Link></li>
              <li><Link href="/school-programs">School Programs</Link></li>
              <li><Link href="/corporate">Corporate</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/team">Our Team</Link></li>
              <li><Link href="/safety">Safety</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link href="/contact">Book a Trek</Link></li>
              <li><a href="mailto:info@bluesheepadventures.com">Email Us</a></li>
              <li>
                <a
                  href="https://instagram.com/bluesheepadventures"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Blue Sheep Adventures. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
