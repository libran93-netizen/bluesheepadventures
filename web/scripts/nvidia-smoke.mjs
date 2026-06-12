// Phase A smoke test for the NVIDIA NIM integration (CLAUDE.md §3, §9).
// Run after putting a real key in web/.env.local:  node scripts/nvidia-smoke.mjs
//
// Verifies:
//   1. Chat: Nemotron 3 Super streams with enable_thinking=false
//   2. Latency benchmark: thinking off vs low_effort=True (pick for chat turns)
//   3. Structured output (response_format json_schema) on Nemotron + Llama
//   4. Embeddings: nvidia/nv-embedqa-e5-v5 query/passage modes, 1024 dims

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// Load .env.local manually (no dotenv dependency)
const envPath = path.resolve(import.meta.dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const KEY = process.env.NVIDIA_API_KEY ?? "";
if (!KEY || KEY.length < 40 || KEY.toLowerCase().includes("your")) {
  console.error("✗ NVIDIA_API_KEY missing or placeholder in web/.env.local — paste a real key from build.nvidia.com first.");
  process.exit(1);
}

const BASE = "https://integrate.api.nvidia.com/v1";
const CHAT_MODEL = "nvidia/nemotron-3-super-120b-a12b"; // exact catalog ID (verified Jun 12, 2026)
const FALLBACK_MODEL = "meta/llama-3.3-70b-instruct";
const EMBED_MODEL = "nvidia/nv-embedqa-e5-v5";

async function post(pathname, body) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const results = [];

// 1+2. Chat latency: enable_thinking=false vs low_effort
for (const [label, kwargs] of [
  ["enable_thinking=false", { enable_thinking: false }],
  ["low_effort=True", { enable_thinking: true, low_effort: true }],
]) {
  try {
    const t0 = Date.now();
    const out = await post("/chat/completions", {
      model: CHAT_MODEL,
      messages: [{ role: "user", content: "In one sentence: what is acclimatisation?" }],
      temperature: 1.0,
      top_p: 0.95,
      max_tokens: 80,
      chat_template_kwargs: kwargs,
    });
    const ms = Date.now() - t0;
    const text = out.choices?.[0]?.message?.content?.slice(0, 80);
    results.push(`✓ chat [${label}] ${ms}ms — "${text}…"`);
  } catch (e) {
    results.push(`✗ chat [${label}] FAILED: ${e.message.slice(0, 200)}`);
  }
}

// 3. guided_json on Nemotron, then fallback model
const schema = {
  type: "object",
  properties: { trek: { type: "string" }, days: { type: "integer" } },
  required: ["trek", "days"],
  additionalProperties: false, // without this the grammar permits rambling extra keys
};
// Finding (Jun 12, 2026): nvext.guided_json is IGNORED by both models on
// integrate.api.nvidia.com — OpenAI-style response_format json_schema works.
for (const model of [CHAT_MODEL, FALLBACK_MODEL]) {
  try {
    const out = await post("/chat/completions", {
      model,
      messages: [{ role: "user", content: "Emit JSON for a 6-day Hampta Pass trek." }],
      max_tokens: 1024,
      chat_template_kwargs: { enable_thinking: false },
      response_format: { type: "json_schema", json_schema: { name: "itinerary", schema } },
    });
    const parsed = JSON.parse(out.choices?.[0]?.message?.content ?? "");
    results.push(`✓ structured output [${model}] → ${JSON.stringify(parsed)}`);
  } catch (e) {
    results.push(`✗ structured output [${model}] FAILED: ${e.message.slice(0, 200)}`);
  }
}

// 4. Embeddings (asymmetric query/passage)
for (const input_type of ["query", "passage"]) {
  try {
    const out = await post("/embeddings", {
      model: EMBED_MODEL,
      input: ["Best season for Kashmir Great Lakes trek"],
      encoding_format: "float",
      input_type,
    });
    const dims = out.data?.[0]?.embedding?.length;
    results.push(dims === 1024 ? `✓ embeddings [${input_type}] 1024 dims` : `✗ embeddings [${input_type}] unexpected dims: ${dims}`);
  } catch (e) {
    results.push(`✗ embeddings [${input_type}] FAILED: ${e.message.slice(0, 200)}`);
  }
}

console.log("\n══ NVIDIA NIM smoke test ══");
for (const r of results) console.log(r);
const failed = results.filter((r) => r.startsWith("✗")).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed && results.every((r) => !r.startsWith("✓ chat")) ? 1 : 0);
