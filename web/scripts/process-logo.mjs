// Processes Karan's LOGO.png into site-ready assets:
//   logo-full.png      — full logo, white background removed
//   logo-full-dark.png — same, with dark teal strokes brightened for the dark theme
//   logo-mark.png      — mountain + sheep emblem only (nav/favicon use)
// Usage: node scripts/process-logo.mjs "<path-to-LOGO.png>"
import sharp from "sharp";
import path from "node:path";

const SRC = process.argv[2];
if (!SRC) {
  console.error("pass the source logo path");
  process.exit(1);
}
const OUT = path.resolve(import.meta.dirname, "../public/images");

const img = sharp(SRC);
const meta = await img.metadata();
console.log(`source: ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha}`);

const { data, info } = await img
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// White -> transparent (feathered so anti-aliased edges stay smooth)
const cut = Buffer.from(data);
for (let i = 0; i < cut.length; i += 4) {
  const r = cut[i], g = cut[i + 1], b = cut[i + 2];
  const min = Math.min(r, g, b);
  if (min > 235) {
    // near-white: alpha falls off as pixel approaches pure white
    cut[i + 3] = Math.round(255 * (1 - (min - 235) / 20));
    if (min >= 252) cut[i + 3] = 0;
  }
}

const transparent = sharp(cut, { raw: { width: info.width, height: info.height, channels: 4 } });
await transparent
  .clone()
  .resize(1200, 1200, { fit: "inside" })
  .png()
  .toFile(path.join(OUT, "logo-full.png"));
console.log("wrote logo-full.png");

// Dark-theme variant: lift dark strokes (the script wordmark ~#2a7c96) toward a
// brighter teal so they read on #0a0f1a, leave the already-bright cyans alone.
const dark = Buffer.from(cut);
const target = { r: 0x4f, g: 0xc8 + 0, b: 0xe0 }; // bright readable teal
for (let i = 0; i < dark.length; i += 4) {
  if (dark[i + 3] === 0) continue;
  const r = dark[i], g = dark[i + 1], b = dark[i + 2];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum < 150) {
    const t = 0.6 * (1 - lum / 150); // darker pixels get pulled harder
    dark[i] = Math.round(r + (target.r - r) * t);
    dark[i + 1] = Math.round(g + (target.g - g) * t);
    dark[i + 2] = Math.round(b + (target.b - b) * t);
  }
}
await sharp(dark, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize(1200, 1200, { fit: "inside" })
  .png()
  .toFile(path.join(OUT, "logo-full-dark.png"));
console.log("wrote logo-full-dark.png");

// Emblem: top portion (mountain + sheep), trimmed to content.
// Two passes: sharp runs trim before extract within one pipeline.
const topHalf = await transparent
  .clone()
  .extract({ left: 0, top: 0, width: info.width, height: Math.round(info.height * 0.56) })
  .png()
  .toBuffer();
await sharp(topHalf)
  .trim()
  .resize(512, 512, { fit: "inside" })
  .png()
  .toFile(path.join(OUT, "logo-mark.png"));
console.log("wrote logo-mark.png");
