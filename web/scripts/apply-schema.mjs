// Applies supabase/schema.sql to the Supabase Postgres instance.
// Usage:  node scripts/apply-schema.mjs
// Reads SUPABASE_DB_URL from web/.env.local, e.g.
//   SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
// (Direct db.* host is IPv6 — if connection fails, use the Session Pooler
//  string from Dashboard → Connect instead; it works over IPv4.)

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const envPath = path.resolve(import.meta.dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.SUPABASE_DB_URL;
if (!url || url.includes("[YOUR-PASSWORD]")) {
  console.error("✗ Set SUPABASE_DB_URL in web/.env.local (connection string WITH the real db password).");
  process.exit(1);
}

const sql = readFileSync(path.resolve(import.meta.dirname, "../supabase/schema.sql"), "utf8");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("connected — applying schema.sql …");
  await client.query(sql);
  const { rows } = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' order by table_name`
  );
  console.log("✓ schema applied. public tables:", rows.map((r) => r.table_name).join(", "));
  const { rows: fns } = await client.query(
    `select routine_name from information_schema.routines
     where routine_schema='public' and routine_name in ('match_chunks','spend_unlock_credit')`
  );
  console.log("✓ functions:", fns.map((r) => r.routine_name).join(", "));
} catch (e) {
  console.error("✗ failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
