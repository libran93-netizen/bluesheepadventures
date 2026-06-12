// Downloads free-licensed trek photos from Wikimedia Commons into public/images/.
// Re-runnable: skips files that already exist. Usage: node scripts/fetch-images.mjs [--force]
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../public/images");
const UA = "BlueSheepAdventures/1.0 (dev asset fetch; contact: libran93@gmail.com)";
const FORCE = process.argv.includes("--force");

// slug -> ordered search terms (first term that yields a usable photo wins)
const TARGETS = {
  "kashmir-great-lakes": ["Vishansar Lake", "Gadsar Lake Kashmir", "Sonamarg landscape"],
  "tarsar-marsar": ["Tarsar Lake", "Aru Valley Kashmir", "Lidderwat"],
  "hampta-pass": ["Hampta Pass", "Chandratal Lake", "Kullu valley mountains"],
  "triund": ["Triund", "Dhauladhar range", "McLeod Ganj mountains"],
  "pin-parvati-pass": ["Pin Parvati Pass", "Parvati Valley Himachal", "Spiti Valley landscape"],
  "kedarkantha": ["Kedarkantha", "Sankri Uttarakhand", "Garhwal Himalaya snow"],
  "brahmatal": ["Brahmatal", "Mount Trishul", "Nanda Ghunti"],
  "har-ki-dun": ["Har Ki Dun", "Swargarohini", "Govind National Park"],
  "roopkund": ["Roopkund Lake", "Bedni Bugyal", "Ali Bugyal"],
  "rupin-pass": ["Rupin Pass", "Sangla Valley", "Kinnaur landscape"],
  "everest-base-camp": ["Kala Patthar Everest", "Everest Base Camp trek", "Namche Bazaar"],
  "annapurna-circuit": ["Thorong La pass", "Annapurna massif", "Manang Nepal"],
  "langtang-valley": ["Langtang Lirung", "Kyanjin Gompa", "Langtang valley"],
};

async function searchCommons(term) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`Commons API ${res.status} for "${term}"`);
  const data = await res.json();
  return Object.values(data?.query?.pages ?? {});
}

function pickBest(pages) {
  const candidates = pages
    .map((p) => p.imageinfo?.[0])
    .filter(Boolean)
    .filter((ii) => ii.mime === "image/jpeg")
    .filter((ii) => ii.width >= 1200 && ii.height >= 700)
    .filter((ii) => ii.width / ii.height >= 1.1 && ii.width / ii.height <= 2.4); // landscape only
  candidates.sort((a, b) => b.width * b.height - a.width * a.height);
  return candidates[0] ?? null;
}

async function download(url, file) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}: ${url}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

await mkdir(OUT_DIR, { recursive: true });
const credits = [];

for (const [slug, terms] of Object.entries(TARGETS)) {
  const file = path.join(OUT_DIR, `${slug}.jpg`);
  if (existsSync(file) && !FORCE) {
    console.log(`skip  ${slug} (exists)`);
    continue;
  }
  let done = false;
  for (const term of terms) {
    try {
      const best = pickBest(await searchCommons(term));
      if (!best) continue;
      await download(best.thumburl ?? best.url, file);
      const artist = (best.extmetadata?.Artist?.value ?? "unknown").replace(/<[^>]*>/g, "").trim();
      const license = best.extmetadata?.LicenseShortName?.value ?? "see Commons";
      credits.push(`${slug}.jpg — "${term}" — ${best.descriptionurl ?? best.url} — ${artist} — ${license}`);
      console.log(`ok    ${slug}  <- "${term}" (${best.width}x${best.height})`);
      done = true;
      break;
    } catch (e) {
      console.warn(`warn  ${slug} "${term}": ${e.message}`);
    }
  }
  if (!done) console.error(`FAIL  ${slug}: no usable image found`);
}

if (credits.length) {
  await writeFile(path.join(OUT_DIR, "CREDITS.txt"), credits.join("\n") + "\n", { flag: "a" });
}
console.log("done");
