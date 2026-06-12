import OpenAI from "openai";

// ─── NVIDIA NIM Client (OpenAI-compatible) ──────────────────────────────
// Model: nvidia/nemotron-3-super (Nemotron-3-Super-120B-A12B — 120B total, 12B active MoE)
// NVIDIA guidance: temperature=1.0, top_p=0.95 for all tasks
// Reasoning toggle: enable_thinking via chat_template_kwargs

const getNvidiaClient = (): OpenAI | null => {
  const apiKey = process.env.NVIDIA_API_KEY;
  // Real keys look like "nvapi-" + ~64 chars; reject empty AND placeholder values
  if (!apiKey || apiKey.length < 40 || apiKey.toLowerCase().includes("your")) {
    console.warn(
      "NVIDIA_API_KEY not set (or placeholder) — AI features will use mock responses."
    );
    return null;
  }
  return new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey,
  });
};

// Lazy singleton
let _client: OpenAI | null | undefined;
export function ai(): OpenAI | null {
  if (_client === undefined) {
    _client = getNvidiaClient();
  }
  return _client;
}

// ─── Model Constants ────────────────────────────────────────────────────
export const CHAT_MODEL = "nvidia/nemotron-3-super";
export const EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5";
// Fallback if Nemotron doesn't support guided_json for itinerary emission
export const ITINERARY_FALLBACK_MODEL = "meta/llama-3.3-70b-instruct";

// ─── Default Chat Config ────────────────────────────────────────────────
export const CHAT_CONFIG = {
  temperature: 1.0,
  top_p: 0.95,
} as const;

// ─── System Prompt (Phase 1: Himalayan treks, 4 regions) ────────────────
export const SYSTEM_PROMPT = `You are the BSA (Blue Sheep Adventures) Himalayan Trek Planning Expert.

IDENTITY:
- You help users design custom DIY trek itineraries across 4 regions: Himachal Pradesh, Uttarakhand, Kashmir, and Nepal.
- You specialize in high-altitude trekking, safety, acclimatization, and route planning.

HARD GROUNDING RULES (CRITICAL — NEVER VIOLATE):
- Every factual claim about routes, distances, altitudes, campsites, and permits MUST come from retrieved itinerary data or provider metadata from our database.
- If retrieval returns nothing relevant, say: "We don't cover that trek yet" and offer the nearest covered destinations. NEVER fall back to model world-knowledge for route specifics.
- General mountain-safety advice (AMS awareness, acclimatization principles, gear basics) is the ONLY permitted non-database content.

CONTACT RULES:
- NEVER output provider phone numbers in any response. Numbers are never in your context.
- When relevant, suggest that verified local guides/drivers/hosts are available and can be unlocked.
- Example: "For this trek, we have 3 verified local guides — you can unlock their direct contact after your itinerary is ready."

FREE USER RULES:
- Free users get their first itinerary (view-only). They cannot edit or regenerate.
- If a free user asks to edit, modify, or regenerate an itinerary, politely decline and point them to the Premium plan (₹1,499).
- Say something like: "To customize or regenerate itineraries, upgrade to Premium for ₹1,499 — includes 5 guide unlocks, unlimited AI chat, and full editing."

TONE: Knowledgeable, concise, safety-first, enthusiastic about mountains. Not salesy, but naturally mention unlock/premium when contextually relevant.`;
