"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="nav"
      style={
        scrolled
          ? { background: "var(--navy)", boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }
          : {}
      }
    >
      <Link href="/" className="nav-logo">
        <span className="nav-logo-icon">🐑</span>
        <span>BLUE SHEEP ADVENTURES</span>
      </Link>

      <nav>
        <ul className="nav-links">
          <li><Link href="/treks">Treks</Link></li>
          <li><Link href="/expeditions">Expeditions</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li>
            <Link href="/contact" className="nav-cta">
              Book a Trek
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
