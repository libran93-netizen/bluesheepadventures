// The core chat route (CLAUDE.md §6.2, §7.1–7.3).
//
// Server-authoritative state machine:
//   ASK_NAME → ASK_PHONE → ASK_EMAIL → (lead banked, session created) → FREE_CHAT(3) → PAYWALLED
//
// Protocol: POST { message, sessionId?, pendingLead?: { name?, phone? } }
//   - Lead-capture turns carry no sessionId; the server validates each field
//     and the lead is inserted (deduped by phone) only at the email step.
//   - Free-chat turns carry sessionId; metering is summed across all the
//     lead's sessions, so new sessions/incognito with the same phone share the meter.
//   - Over limit → HTTP 402 + paywall payload (client opens the paywall modal).
//
// Response: SSE stream, every data payload is JSON:
//   event: meta       → { state, sessionId?, freeMessagesLeft?, fieldError? }
//   (default)         → { t: "text chunk" }
//   event: itinerary  → { id, content, providerTeaser }
//   event: done       → {}

import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { ai, CHAT_MODEL, EMBEDDING_MODEL, ITINERARY_MODEL, SYSTEM_PROMPT } from "@/lib/ai";
import { treks } from "@/lib/treks";
import { REGIONS } from "@/lib/himalaya-config";

export const dynamic = "force-dynamic";

const FREE_LIMIT = 3;
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Per-IP rate limit (in-memory token bucket, §7.2) ─────────────────────
const ipHits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const slot = ipHits.get(ip);
  if (!slot || now > slot.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  slot.count += 1;
  return slot.count > 30;
}

// ── Itinerary content schema (structured output) — NO provider/phone fields ──
const ITINERARY_SCHEMA = {
  type: "object",
  properties: {
    trek: { type: "string" },
    region: { type: "string", enum: ["kashmir", "himachal", "uttarakhand", "nepal"] },
    title: { type: "string" },
    durationDays: { type: "integer" },
    maxAltitude: { type: "integer" },
    difficulty: { type: "string", enum: ["Easy", "Moderate", "Hard", "Very Hard"] },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          n: { type: "integer" },
          title: { type: "string" },
          km: { type: "number" },
          altFrom: { type: "integer" },
          altTo: { type: "integer" },
          hours: { type: "number" },
          difficulty: { type: "string" },
          meals: { type: "string" },
          tips: { type: "string" },
        },
        required: ["n", "title", "km", "altFrom", "altTo", "hours", "difficulty", "meals", "tips"],
        additionalProperties: false,
      },
    },
  },
  required: ["trek", "region", "title", "durationDays", "maxAltitude", "difficulty", "days"],
  additionalProperties: false,
} as const;

// ── SSE helpers ───────────────────────────────────────────────────────────
const enc = new TextEncoder();
function sse(controller: ReadableStreamDefaultController, payload: unknown, event?: string) {
  const head = event ? `event: ${event}\n` : "";
  controller.enqueue(enc.encode(`${head}data: ${JSON.stringify(payload)}\n\n`));
}

function sseResponse(body: ReadableStream) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/** Stream a fixed string as a few chunks (scripted lead-capture replies). */
function streamScripted(controller: ReadableStreamDefaultController, text: string) {
  for (const piece of text.match(/.{1,48}(\s|$)/g) ?? [text]) {
    sse(controller, { t: piece });
  }
}

// ── Mock helpers (run the full flow before a real NVIDIA key exists) ─────
function findTrekInText(text: string) {
  const lower = text.toLowerCase();
  return treks.find(
    (t) =>
      lower.includes(t.name.toLowerCase().replace(" trek", "")) ||
      lower.includes(t.slug.replace(/-/g, " "))
  );
}

function mockItinerary(conversation: string) {
  const trek = findTrekInText(conversation) ?? treks.find((t) => t.slug === "hampta-pass")!;
  const days = Array.from({ length: trek.duration }, (_, i) => {
    const n = i + 1;
    const frac = trek.duration === 1 ? 1 : i / (trek.duration - 1);
    const alt = Math.round(2000 + (trek.maxAltitude - 2000) * Math.min(1, frac * 1.4));
    return {
      n,
      title:
        n === 1 ? `Arrival & trailhead briefing` :
        n === trek.duration ? `Descent & drive back` :
        trek.highlights[(n - 2) % trek.highlights.length].slice(0, 60),
      km: n === 1 || n === trek.duration ? 4 : 9 + (n % 3) * 2,
      altFrom: Math.max(1800, alt - 500),
      altTo: alt,
      hours: n === 1 ? 2 : 5 + (n % 3),
      difficulty: trek.difficulty,
      meals: "Breakfast · Packed lunch · Dinner",
      tips: "Hydrate well and watch for AMS symptoms above 3,000m.",
    };
  });
  return {
    trek: trek.name,
    region: trek.region,
    title: `${trek.name} — ${trek.duration}-Day DIY Itinerary`,
    durationDays: trek.duration,
    maxAltitude: trek.maxAltitude,
    difficulty: trek.difficulty,
    days,
  };
}

const MOCK_REPLIES = [
  (msg: string) => {
    const trek = findTrekInText(msg);
    return trek
      ? `${trek.name} is a great choice — ${trek.shortDesc} It runs ${trek.duration} days, topping out at ${trek.maxAltitude.toLocaleString()}m (${trek.difficulty}). Best season: ${trek.bestSeason}. Are you trekking solo or with a group, and roughly when do you want to go?`
      : `Happy to help you plan! Phase 1 covers Himachal, Uttarakhand, Kashmir and Nepal. Which trek or region is calling you — for example Kashmir Great Lakes, Hampta Pass, Kedarkantha, or Everest Base Camp?`;
  },
  () =>
    `Noted. Two quick things that shape the plan: how many trekking days can you spare in total (including travel), and have you been above 3,500m before? That decides the acclimatisation profile I build in.`,
  () =>
    `Perfect — I have everything I need. Building your day-by-day itinerary now, grounded on our verified route data…`,
];

// ── The route ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { message?: string; sessionId?: string; pendingLead?: { name?: string; phone?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  const db = store();

  // ════ LEAD-CAPTURE TURNS (no session yet) ════════════════════════════
  if (!body.sessionId) {
    const pending = body.pendingLead ?? {};

    // ASK_NAME — message is the name
    if (!pending.name) {
      const ok = message.length >= 2 && message.length <= 80;
      return sseResponse(
        new ReadableStream({
          start(c) {
            sse(c, { state: ok ? "ASK_PHONE" : "ASK_NAME", fieldError: ok ? null : "Please enter a valid name (minimum 2 characters)." }, "meta");
            streamScripted(
              c,
              ok
                ? `Nice to meet you, ${message}! Please share your 10-digit mobile number — your itinerary gets linked to it.`
                : `That doesn't look like a name — could you tell me your name again?`
            );
            sse(c, {}, "done");
            c.close();
          },
        })
      );
    }

    // ASK_PHONE — message is the phone
    if (!pending.phone) {
      const ok = PHONE_RE.test(message);
      return sseResponse(
        new ReadableStream({
          start(c) {
            sse(c, { state: ok ? "ASK_EMAIL" : "ASK_PHONE", fieldError: ok ? null : "Please enter a valid 10-digit Indian mobile number." }, "meta");
            streamScripted(
              c,
              ok
                ? `Great! Last one — what's your email address? Your itinerary drafts and the PDF copy go there.`
                : `Hmm, that number doesn't look right. A 10-digit Indian mobile number, please (e.g. 9876543210).`
            );
            sse(c, {}, "done");
            c.close();
          },
        })
      );
    }

    // ASK_EMAIL — message is the email → bank the lead, create session
    if (!EMAIL_RE.test(message)) {
      return sseResponse(
        new ReadableStream({
          start(c) {
            sse(c, { state: "ASK_EMAIL", fieldError: "Please enter a valid email address." }, "meta");
            streamScripted(c, `That email doesn't look valid — mind checking it once more?`);
            sse(c, {}, "done");
            c.close();
          },
        })
      );
    }

    // Server-side re-validation of the full pending lead before insert
    if (!PHONE_RE.test(pending.phone) || pending.name.length < 2) {
      return NextResponse.json({ error: "Invalid lead fields" }, { status: 400 });
    }

    const lead = await db.upsertLeadByPhone({ name: pending.name, phone: pending.phone, email: message });
    const session = await db.createSession(lead.id);
    const used = await db.countedMessagesForLead(lead.id);
    const left = Math.max(0, FREE_LIMIT - used);

    return sseResponse(
      new ReadableStream({
        start(c) {
          sse(c, { state: left > 0 ? "FREE_CHAT" : "PAYWALLED", sessionId: session.id, freeMessagesLeft: left }, "meta");
          streamScripted(
            c,
            left > 0
              ? `You're all set, ${pending.name}! Tell me: which Himalayan trek or region do you want to plan? (e.g. Kashmir Great Lakes, Hampta Pass, Kedarkantha, EBC)`
              : `Welcome back, ${pending.name}! You've already used your free itinerary chat. Upgrade to Premium (₹1,499) for unlimited planning, itinerary editing and 5 guide unlocks.`
          );
          sse(c, {}, "done");
          c.close();
        },
      })
    );
  }

  // ════ FREE_CHAT TURNS (session exists) ═══════════════════════════════
  const session = await db.getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Chat session not found" }, { status: 400 });
  }

  const isPremium = await db.isPremiumLead(session.lead_id);
  const usedBefore = await db.countedMessagesForLead(session.lead_id);

  if (!isPremium && usedBefore >= FREE_LIMIT) {
    return NextResponse.json(
      {
        paywall: true,
        message: "Free message limit reached.",
        premium: { price: 1499, perks: ["Unlimited AI chat", "Itinerary editing & regeneration", "5 guide unlocks"] },
        singleUnlock: { price: 499, perks: ["One verified provider contact"] },
      },
      { status: 402 }
    );
  }

  if (!isPremium) await db.incrementMeter(session.id);
  await db.saveMessage(session.id, "user", message, !isPremium);

  const usedNow = isPremium ? usedBefore : usedBefore + 1;
  const left = Math.max(0, FREE_LIMIT - usedNow);
  const isItineraryTurn = !isPremium && usedNow === FREE_LIMIT;

  const history = await db.getSessionMessages(session.id);
  const client = ai();

  // RAG: embed the question, retrieve grounding chunks (no-ops without Supabase/key)
  let ragContext = "";
  if (client) {
    try {
      const embed = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: message,
        encoding_format: "float",
        // @ts-expect-error NVIDIA extension
        extra_body: { input_type: "query" },
      });
      const chunks = await db.matchChunks(embed.data[0].embedding as number[]);
      ragContext = chunks.join("\n\n");
    } catch (e) {
      console.error("[chat] RAG retrieval failed:", e);
    }
  }

  const systemPrompt = `${SYSTEM_PROMPT}

GROUNDING CONTEXT (TRUTH LAYER — route facts may ONLY come from here):
${ragContext || "No verified route records were retrieved for this query. If the user asks for route specifics we don't have, say we don't cover that trek yet and offer the nearest covered destinations."}`;

  const stream = new ReadableStream({
    async start(controller) {
      sse(controller, { state: "FREE_CHAT", sessionId: session.id, freeMessagesLeft: left }, "meta");
      let assistantText = "";

      try {
        if (client) {
          // `extra_body` is an NVIDIA NIM extension the SDK types don't know
          const completion = (await client.chat.completions.create({
            model: CHAT_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              ...history.map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: 1.0,
            top_p: 0.95,
            stream: true,
            extra_body: { chat_template_kwargs: { enable_thinking: false } },
          } as any)) as unknown as AsyncIterable<{ choices: { delta?: { content?: string } }[] }>;
          for await (const chunk of completion) {
            const t = chunk.choices[0]?.delta?.content ?? "";
            if (t) {
              assistantText += t;
              sse(controller, { t });
            }
          }
        } else {
          // Mock mode: deterministic, grounded on lib/treks data
          const reply = MOCK_REPLIES[Math.min(usedNow - 1, MOCK_REPLIES.length - 1)](message);
          assistantText = reply;
          for (const piece of reply.match(/.{1,42}(\s|$)/g) ?? [reply]) {
            sse(controller, { t: piece });
            await new Promise((r) => setTimeout(r, 35));
          }
        }

        await db.saveMessage(session.id, "assistant", assistantText, false);

        // ── First-itinerary emission on the 3rd counted message ──────────
        if (isItineraryTurn) {
          let content: ReturnType<typeof mockItinerary> | null = null;
          const conversation = [...history, { role: "assistant", content: assistantText }]
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n");

          if (client) {
            // Generation takes ~40-60s — tell the user before going quiet
            sse(controller, { t: "\n\nBuilding your day-by-day itinerary now — this takes up to a minute…" });
            try {
              const completion = (await client.chat.completions.create({
                model: ITINERARY_MODEL,
                messages: [
                  { role: "system", content: "You generate structured trek itinerary JSON. Route facts come ONLY from the provided context; if context is missing, produce a conservative plan and keep altitude gains gradual." },
                  { role: "user", content: `Context:\n${ragContext || "(none)"}\n\nConversation:\n${conversation}\n\nGenerate the itinerary JSON.` },
                ],
                temperature: 1.0,
                top_p: 0.95,
                max_tokens: 4096,
                // Verified Jun 12, 2026: Nemotron honours OpenAI-style
                // response_format json_schema; nvext.guided_json is ignored.
                response_format: {
                  type: "json_schema",
                  json_schema: { name: "itinerary", schema: ITINERARY_SCHEMA },
                },
                extra_body: {
                  chat_template_kwargs: { enable_thinking: false },
                },
              } as any)) as { choices: { message?: { content?: string } }[] };
              content = JSON.parse(completion.choices[0]?.message?.content ?? "null");
            } catch (e) {
              console.error("[chat] guided_json itinerary failed, using mock:", e);
            }
          }
          if (!content) content = mockItinerary(conversation);

          const itineraryId = await db.saveItinerary({
            source: "ai_generated",
            trek: content.trek,
            region: content.region,
            content,
            lead_id: session.lead_id,
          });

          // Provider teaser: counts only — numbers never leave the server (§5)
          const regionCfg = REGIONS.find((r) => r.id === content.region);
          const dbCount = await db.verifiedProviderCount(content.region);
          sse(
            controller,
            {
              id: itineraryId,
              content,
              providerTeaser: {
                guides: dbCount || regionCfg?.guideCount || 0,
                region: regionCfg?.name ?? content.region,
              },
            },
            "itinerary"
          );
        }

        sse(controller, { freeMessagesLeft: left }, "done");
      } catch (err) {
        console.error("[chat] stream error:", err);
        sse(controller, { t: "I hit a connection issue — please try that again." });
        sse(controller, {}, "done");
      } finally {
        controller.close();
      }
    },
  });

  return sseResponse(stream);
}
