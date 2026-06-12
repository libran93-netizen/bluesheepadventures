// Seeds PLACEHOLDER verified providers so the unlock flow is testable.
// ⚠ All entries are FAKE (names + numbers). Replace with Karan's ~30 real
// guides + signed consent before launch (CLAUDE.md §11.2).
// Usage: node scripts/seed-providers.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const projectDir = path.resolve(import.meta.dirname, "..");
for (const line of fs.readFileSync(path.join(projectDir, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DUMMY_PROVIDERS = [
  {
    type: "guide", name: "[DUMMY] Tashi Guide-Kashmir", phone: "+91 90000 00001",
    regions: ["kashmir"], activities: ["trekking"],
    treks: ["Kashmir Great Lakes", "Tarsar Marsar"], languages: ["English", "Hindi", "Kashmiri"],
    years_experience: 10, status: "verified", consent_signed_at: new Date().toISOString(),
  },
  {
    type: "guide", name: "[DUMMY] Prem Guide-Himachal", phone: "+91 90000 00002",
    regions: ["himachal"], activities: ["trekking"],
    treks: ["Hampta Pass", "Beas Kund", "Bhrigu Lake"], languages: ["English", "Hindi"],
    years_experience: 8, status: "verified", consent_signed_at: new Date().toISOString(),
  },
  {
    type: "guide", name: "[DUMMY] Mohan Guide-Uttarakhand", phone: "+91 90000 00003",
    regions: ["uttarakhand"], activities: ["trekking"],
    treks: ["Kedarkantha", "Brahmatal", "Roopkund"], languages: ["Hindi", "Garhwali"],
    years_experience: 12, status: "verified", consent_signed_at: new Date().toISOString(),
  },
  {
    type: "taxi_driver", name: "[DUMMY] Suresh Driver-Manali", phone: "+91 90000 00004",
    regions: ["himachal"], activities: ["transfer"],
    treks: null, languages: ["Hindi"],
    years_experience: 15, status: "verified", consent_signed_at: new Date().toISOString(),
  },
];

for (const p of DUMMY_PROVIDERS) {
  const { data: existing } = await db.from("providers").select("id").eq("phone", p.phone).maybeSingle();
  if (existing) {
    console.log(`skip  ${p.name} (exists)`);
    continue;
  }
  const { error } = await db.from("providers").insert(p);
  console.log(error ? `FAIL  ${p.name}: ${error.message}` : `ok    ${p.name}`);
}
console.log("done");
