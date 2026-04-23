import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Blue Sheep Adventures | Himalayan Treks & Expeditions",
    template: "%s | Blue Sheep Adventures",
  },
  description:
    "Expert-led Himalayan treks, high-altitude expeditions and outdoor programs in Himachal Pradesh, Ladakh and Nepal. Safe, well-organised, unforgettable.",
  keywords: [
    "Himalayan trek",
    "high altitude expedition",
    "Himachal Pradesh trek",
    "Ladakh expedition",
    "trek operator India",
    "Blue Sheep Adventures",
  ],
  authors: [{ name: "Blue Sheep Adventures" }],
  openGraph: {
    type: "website",
    siteName: "Blue Sheep Adventures",
    title: "Blue Sheep Adventures | Himalayan Treks & Expeditions",
    description:
      "Expert-led Himalayan treks, high-altitude expeditions and outdoor programs. Himachal Pradesh · Ladakh · Nepal.",
    url: "https://www.bluesheepadventures.com",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
