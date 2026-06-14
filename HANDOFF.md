# BLUE SHEEP ADVENTURES — EXECUTION HANDOFF DOCUMENT

**Date:** June 11, 2026
**Owner:** Karan Singh (libran93@gmail.com)
**Project root:** `D:/bluesheepadventures` (app code in `web/`)
**Status:** All research + planning complete. **Phase A (Foundation) coding has NOT started.** This document is the complete handoff — a new developer/team/AI session should be able to execute from this file alone.
**Companion docs:** `CLAUDE.md` (master plan, single source of truth — auto-loaded by Claude Code), `DIY_PIVOT_RESEARCH.md` (full market research, rounds 1–3), task tracker wiki at `E:/claude task tracker/bluesheepadventures/`.

---

## 1. WHAT WE ARE BUILDING

**Vision:** an end-to-end outdoor adventure platform for India — a one-stop solution for experiential and adventure activity. Users **design their own itineraries** (manually or with an AI agent) and **pay to unlock the verified contacts of the local people behind each piece of the itinerary** — trek guides, taxi drivers, hosts, instructors.

**We are NOT a booking platform.** We sell itinerary design, AI convenience, and verified connections. Users transact with providers directly off-platform. This is the structural wedge: every incumbent (Thrillophilia, GetYourGuide, Headout) hides the local provider behind a booking flow and takes 10–35% commission. We reveal the human and charge the traveler a flat fee.

### Phase 1 launch scope (LOCKED)
**Himalayan & high-altitude treks ONLY**, across 4 regions: **Himachal · Uttarakhand · Kashmir · Nepal**.
Phase 2+ widens to beaches/water sports, adventure hubs (Rishikesh, Bir), experiential travel, and an all-India map. The schema already supports this — widening is data + config, not a rebuild.

---

## 2. BUSINESS MODEL (LOCKED — June 11, 2026)

| Rule | Value |
|---|---|
| Free tier | **The 3+3 flow:** ~3 lead-capture chat turns (name → phone → email, do NOT count) + **3 free AI messages** (where / what / preferences) → **first itinerary free, view-only** |
| Lead capture | Chat-native, BEFORE the free itinerary is generated — lead is always banked before value is delivered |
| Single unlock | **₹499** → raw provider phone number revealed. **48h response guarantee:** no response → credit-back |
| Premium | **₹1,499** → 5 unlock credits + unlimited AI chat + itinerary editing/regeneration (ANY change to the free itinerary = premium) |
| PDF delivery | Itinerary ships as a **clickable PDF in Karan's fixed format** (format pending from Karan). Download is **lead-gated** — every download ties to a lead, no matter what. PDF of own first itinerary = free once lead exists; GPX export = premium |
| Who pays | Travelers only (phase 1). Providers listed FREE (free leads for them). Provider-side fees = phase 2 |
| Login | Google one-tap, required **only at payment**. Pre-chat lead linked to user by email match at first login |
| Contact reveal | Raw number, no masking. Providers sign DPDP-compliant consent before listing (jurisdiction-generic template — Nepal guides sign the same) |

**AI monetization guardrails:** the agent suggests provider unlocks contextually, never reveals numbers (numbers are never in its context anyway), never gives more than the free itinerary allows, refuses edit requests from free users → points to premium.

**Open decisions for Karan (non-blocking):** (a) free or ₹99 first unlock to seed usage (Upwork/NoBroker free-allowance pattern)? (b) put the 48h guarantee in the homepage hero copy?

---

## 3. RESEARCH FOUNDATION (3 rounds, full detail in `DIY_PIVOT_RESEARCH.md`)

### 3.1 Why the unlock model works (validated comps)
- **MagicBricks MB Prime** — ₹1,399/6mo for 10 owner contacts, 100K+ pre-launch subscribers. Closest comp to our ₹1,499/5-unlock premium. Their #1 complaint ("paid but owner never responded") is exactly what our 48h credit-back fixes — use it as marketing.
- **NoBroker** — 9 free owner contacts, then ₹999+ bundles. Proves free-taste → paid-bundle funnel in India.
- **WorkIndia / Apna** — employers browse candidates free, pay to unlock phone numbers. Pay-per-contact is mainstream Indian UX (hiring, housing, matrimony via Shaadi ₹4,650+).
- **Upwork Connects** — $0.15/connect micro-pricing with 10 free/month seeding usage.
- **Komoot** — sold one-time region unlocks ($3.99–29.99) happily for a decade; forced-subscription pivot in 2025 caused user revolt. **One-time ₹499 unlock psychology is proven in outdoors. Don't force subscriptions later.**

### 3.2 Why itineraries must be FREE content (not the product)
- **Indiahikes** gives away 300+ documented treks with free GPX. **Bikat Adventures** same. AllTrails/Komoot/Wikiloc never charge for trail content — they charge for convenience/safety tooling.
- **TripHobo / Google Trips:** standalone itinerary builders die commercially. The builder must feed a monetizable action — ours feeds unlocks + paid AI.
- → Itineraries = SEO/acquisition weapon. Money = unlocks + premium AI.

### 3.3 Why grounded AI is chargeable (and generic AI isn't)
- **Mindtrip** (free, monetizes bookings) wins on proprietary grounding: 11M POIs + 40K guides. Grounding data IS the moat.
- **Wanderlog Pro** charges $39.99/yr just for an AI assistant → our ₹1,499 with unlimited AI is under the global comp.
- Generic trek AI = worthless (ChatGPT is free). Our AI is sellable because it's grounded on Karan's real on-ground itineraries + the verified provider network.

### 3.4 The market gap (round 3)
- **Thrillophilia** (₹500cr+ revenue, profitable) proves the Indian experiences market — but sells packages, hides operators.
- **Pickyourtrail** (India's largest DIY holiday builder) proves Indians want DIY itinerary design — but focuses international. **Domestic adventure DIY is open.**
- **Savaari** (2,000 cities, MakeMyTrip-acquired) brokers outstation drivers but never reveals their contacts. **A verified-driver unlock is virgin territory.**
- **Justdial** = free generic contacts; our answer: not 50 unverified numbers, THE verified one matched to your itinerary, with a response guarantee.
- **Nepal:** GetYourTrekGuide et al. prove demand for verified Himalayan guide discovery; no dominant Indian player. Phase 1 including Nepal attacks them on home turf with a stronger product.
- **3+3 chat lead-gen validated:** chatbots convert 15–30% of traffic vs 2–5% for forms (2.4–3×); every extra form field cuts submissions ~11%; −43% cost per qualified lead.

### 3.5 The four hard problems + mitigations
1. **Free alternatives** (Indiahikes etc.) → itineraries free, monetize scarce verified contacts + AI convenience.
2. **Contact leakage** (one WhatsApp group kills an asset) → accepted for phase 1 (raw reveal, Karan's call); phase-2 options researched: masked calling (Exotel/Twilio), in-app chat first, rotating numbers.
3. **Cold start** → depth over breadth: 4 trek corridors seeded with ~30 providers from Karan's existing BSA guide network, reviews seeded from past operations.
4. **AI commoditization** → data flywheel: every unlock/report/interaction feeds proprietary trail+provider data no public LLM has.

### 3.6 Phase-2 revenue menu (researched, parked)
Provider-side: verified-badge subscription (IndiaMART TrustSEAL ₹45K/yr pattern), ₹100–500/lead (vs guide's ₹12–18K/trek revenue; Zillow/Urban Company anchors), or 8–30% booking commission (Much Better Adventures 8%, Skyhook 20%, 57hours 20–30%).

---

## 4. TECH STACK

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.4** (App Router, `web/src/`) | ⚠️ Breaking changes vs Next 14 — check `web/AGENTS.md` and `node_modules/next/dist/docs/` before writing Next.js code |
| UI | React 19, Tailwind CSS 4 | Design system exists in `globals.css`; reuse `Nav.tsx`, `Footer.tsx`, `TrekCard.tsx` as free SEO layer |
| DB + Auth + Vectors | **Supabase free tier** | Postgres 500MB, Auth 50K MAU (Google one-tap), pgvector included |
| AI chat | **`nvidia/nemotron-3-super`** (Nemotron-3-Super-120B-A12B) via NVIDIA NIM `https://integrate.api.nvidia.com/v1` (OpenAI-compatible) | `temperature=1.0, top_p=0.95` (NVIDIA guidance). Reasoning toggle `enable_thinking` via `chat_template_kwargs` — benchmark off vs `low_effort=True` for chat latency. **Smoke-test `nvext.guided_json` on this model; fallback `meta/llama-3.3-70b-instruct` (guided_json confirmed) for the itinerary-emitting call only** |
| Embeddings | `nvidia/nv-embedqa-e5-v5` | 1024-dim; **512-token input cap → chunks ≤ ~400 tokens**; asymmetric: `input_type:"passage"` at ingestion, `"query"` at retrieval |
| Payments | **Razorpay** (UPI-first — 38% vs 4% checkout drop vs Stripe in India) | One-time ₹499 + ₹1,499 premium |
| PDF | `@react-pdf/renderer` in route handler | Pure JS, Vercel-serverless-safe, Link annotations. NOT Puppeteer |
| Hosting | Vercel | |

**Dependency migration (Phase A, first task):** remove `@prisma/client`, `prisma`, `next-auth`, `stripe`, `bcryptjs`, `nodemailer`. Add `@supabase/supabase-js`, `@supabase/ssr`, `openai` (pointed at NVIDIA), `razorpay`, `@react-pdf/renderer`.

```ts
// lib/ai.ts
import OpenAI from "openai";
export const ai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});
// Chat turns:    model "nvidia/nemotron-3-super", temperature 1.0, top_p 0.95,
//                extra_body: { chat_template_kwargs: { enable_thinking: false } }
// Itinerary call: extra_body: { nvext: { guided_json: itinerarySchema } }  // smoke-test; fallback llama-3.3-70b
```

**Env vars (`web/.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=          NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # server-only
NVIDIA_API_KEY=                    # build.nvidia.com
RAZORPAY_KEY_ID=  RAZORPAY_KEY_SECRET=  RAZORPAY_WEBHOOK_SECRET=
ADMIN_EMAILS=libran93@gmail.com
```

---

## 5. ARCHITECTURE & SECURITY HARD RULE

```
Browser
  ├─ Next.js 16 app (Vercel) — web/src/
  │    ├─ / (Himalaya map hero + chat under it)   ├─ /treks, /treks/[slug] (free SEO layer)
  │    ├─ /providers, /providers/[region]          ├─ /dashboard
  │    └─ /api/* (route handlers — ALL business logic server-side)
  ├─ Supabase: Auth (Google one-tap) · Postgres + RLS · pgvector
  ├─ NVIDIA NIM: chat completions + embeddings
  └─ Razorpay: checkout + webhooks
```

**HARD RULE:** metering, credit decrements, number reveals, and payment verification happen ONLY in server route handlers using the Supabase **service-role** client. The anon-key client never touches `providers.phone`, credits, or message counts. RLS denies client reads on `providers.phone` entirely — numbers reach the browser only via `/api/providers/unlock` after verified payment/credit. **This rule extends to generated PDFs: no phone numbers in any PDF, ever.**

---

## 6. DATABASE SCHEMA (Supabase SQL — run as-is in Phase A)

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text not null, email text not null,
  source text default 'ai_chat',
  user_id uuid references auth.users,        -- linked at first login (email match)
  created_at timestamptz default now()
);
create unique index leads_phone_idx on leads(phone);   -- metering dedupe

create table providers (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('guide','taxi_driver','host','instructor','operator')),
  name text not null, phone text not null,             -- RLS: never client-readable
  photo_url text, regions text[] not null,
  activities text[] not null,                          -- {trekking, rafting, ...}
  treks text[],                                        -- guide-specific
  languages text[], years_experience int,
  status text default 'pending' check (status in ('pending','verified','paused')),
  consent_signed_at timestamptz,                       -- required before status='verified'
  response_rate numeric,
  created_at timestamptz default now()
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads not null,
  free_messages_used int default 0,
  created_at timestamptz default now()
);
create table chat_messages (
  id bigint generated always as identity primary key,
  session_id uuid references chat_sessions not null,
  role text check (role in ('user','assistant','system')),
  content text not null,
  counts_against_free boolean default false,           -- lead-capture turns = false
  created_at timestamptz default now()
);

create table itineraries (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('karan_seed','ai_generated')),
  trek text, region text,
  content jsonb not null,                              -- shape locks to Karan's PDF format on receipt
  lead_id uuid references leads, user_id uuid references auth.users,
  editable boolean default false,                      -- premium flips true
  created_at timestamptz default now()
);

create extension if not exists vector;
create table itinerary_chunks (
  id bigint generated always as identity primary key,
  itinerary_id uuid references itineraries not null,
  chunk_text text not null,
  embedding vector(1024)                               -- nv-embedqa-e5-v5
);
create index on itinerary_chunks using hnsw (embedding vector_cosine_ops);

create table pdf_downloads (
  id bigint generated always as identity primary key,
  itinerary_id uuid references itineraries not null,
  lead_id uuid references leads not null,              -- the "no matter what" lead guarantee
  user_id uuid references auth.users,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  razorpay_order_id text unique not null, razorpay_payment_id text,
  amount int not null, type text check (type in ('single_unlock','premium')),
  status text default 'created' check (status in ('created','paid','failed','refunded')),
  created_at timestamptz default now()
);

create table subscriptions (
  user_id uuid primary key references auth.users,
  unlock_credits int default 0,
  ai_unlimited boolean default false,
  itinerary_editing boolean default false,
  expires_at timestamptz
);

create table unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  provider_id uuid references providers not null,
  payment_id uuid references payments,
  source text check (source in ('single','premium_credit','credit_back')),
  response_reported boolean default false,
  report_resolved text,
  created_at timestamptz default now(),
  unique (user_id, provider_id)                        -- never charge twice
);
```

**RLS:** users read own rows only. `providers`: public SELECT via a `providers_public` view that excludes `phone`; raw table service-role only. All writes via service-role in route handlers.

---

## 7. API ROUTES (`web/src/app/api/`)

| Route | Method | Logic |
|---|---|---|
| `/api/chat` | POST | THE core route: lead-capture state machine + metering + RAG + streaming |
| `/api/itineraries/[id]` | GET/PATCH | PATCH requires premium (`itinerary_editing`) |
| `/api/itineraries/[id]/pdf` | GET | **Lead-gated PDF:** lead on session? → render @react-pdf template → log `pdf_downloads` → stream. No lead → 402 + modal payload; client posts lead (chat-flow validation + phone dedupe), retries |
| `/api/providers` | GET | `providers_public` view, filter region/activity/type; phone NEVER included |
| `/api/providers/unlock` | POST | Auth → idempotent check → credit decrement (atomic) OR verified ₹499 order → insert unlock → return phone |
| `/api/providers/report-no-response` | POST | 48h guarantee reporting |
| `/api/payments/create-order` | POST | Razorpay order ₹499/₹1,499 |
| `/api/payments/webhook` | POST | Signature verify → mark paid → premium grants 5 credits + ai_unlimited + editing (+1yr) |
| `/api/auth/link-lead` | POST | First login: email match → set leads.user_id |
| `/api/admin/*` | * | Leads export, provider CRUD + consent, reports queue, payments. Gate: ADMIN_EMAILS |

---

## 8. CORE LOGIC (state machines)

### 8.1 Chat (per session) — the 3+3 flow
```
START → ASK_NAME → ASK_PHONE → ASK_EMAIL → FREE_CHAT(3) → FIRST_ITINERARY → PAYWALLED
```
- Lead turns don't count (`counts_against_free=false`). Phone = 10-digit Indian mobile validation; email regex. Email captured → insert lead → FREE_CHAT.
- 3 free user messages capture where/what/preferences; by message 3 the AI generates the first free itinerary (view-only card). Any edit request after → premium paywall (402 + payload → modal).
- Premium (`ai_unlimited`) skips metering.
- **Metering dedupe: keyed to `leads.phone`** (unique index) — incognito/new email with same phone = same meter. Per-IP rate limit on `/api/chat`.
- PDF download = second lead-capture surface (same `leads` table + dedupe — chat meter and PDF gate share identity).

### 8.2 AI contract (Nemotron, RAG-grounded — "data ONLY from our database")
- Identity: BSA Himalayan trek expert (Phase 1: HP/UK/Kashmir/Nepal, high-altitude focus).
- **Every route fact comes from retrieved `itinerary_chunks` + provider metadata. Retrieval empty → "we don't cover that trek yet" + nearest covered destinations. NEVER model world-knowledge for route specifics.** Only permitted non-DB content: general mountain safety (AMS, acclimatization).
- Itinerary output: two-call pattern — chat streams unconstrained; itinerary emitted via second non-streamed `guided_json` call (shape-guaranteed card payload). guided_json constrains shape; grounding rules are the truth layer.
- Never outputs provider numbers; suggests unlocks contextually; refuses edits for free users.

### 8.3 Unlock flow (server-side, atomic)
```
POST /api/providers/unlock {provider_id}
  → auth → existing unlock? return phone (idempotent)
  → credits > 0? atomic decrement → unlock(premium_credit) → phone
  → verified ₹499 order? unlock(single) → phone
  → else 402 → Razorpay checkout → retry
```
48h guarantee: report → admin queue → upheld: +1 credit (credit_back), response_rate recalc; 3 upheld → provider auto-paused.

### 8.4 RAG ingestion (`scripts/ingest-itineraries.ts`)
1. Karan drops ~50 itineraries in `seed-itineraries/` (any format)
2. Parse → normalize to `itineraries.content` JSON (`source='karan_seed'`)
3. Chunk per-day + overview, **≤ ~400 tokens each** → embed (`input_type:"passage"`) → upsert `itinerary_chunks`
4. Re-runnable (upsert by itinerary_id + chunk hash). Retrieval at chat time embeds the question with `input_type:"query"`.

---

## 9. FRONTEND SPEC

**Design system (existing, reuse):** Mountain Gray `#3A3F47`, Forest Green `#2D5016`, Sky Blue `#1E90FF`, Accent Orange `#FF6B35` (CTAs), Earth Brown `#8B6F47`. Playfair Display headings + Inter body. 8px grid, ≥44px touch targets.

**Hero (Phase 1 signature screen):** stylized **Himalaya map — North India + Nepal**, range rendered prominently. 4 glowing clickable regions (Himachal/Uttarakhand/Kashmir/Nepal) + data-driven trek pins (Hampta Pass, Triund, Pin Parvati · Kedarkantha, Brahmatal, Har Ki Dun, Roopkund · Kashmir Great Lakes, Tarsar Marsar · EBC, Annapurna Circuit, Langtang). High-altitude treks get a distinct badge. **Chat bar docked UNDER the map** + destination listing chips. Click region/pin → side panel (treks, difficulty, season, altitude, provider count, "Plan with AI"). Chat replies deep-link trek pins. Mobile 375px: simplified SVG, bottom-sticky chat, region chips. **Map is config/data-driven** → Phase 2 all-India activity map (🏔🏖🪂✨) is a data swap (parked spec in CLAUDE.md §4.2b).

**Chat UI:** SSE streaming, "2 of 3 free messages left" meter pill, lead turns render as normal conversation with inline validation, itinerary renders as structured card (not text), message-4 attempt → paywall modal (₹1,499 pitch + ₹499 cross-sell).

**Itinerary renderer:** day-by-day accordion (title, km, altitude, hours, difficulty, meals, tips), **visible-but-locked** Edit/Regenerate/GPX buttons for free users (converts better than hidden), **Download PDF button (lead-gated)**, "Local contacts for this itinerary" rail per component.

**Provider cards:** photo, name, type badge (Guide/Driver/Host/Instructor), regions/activities, experience, languages, response-rate badge, **blurred number** (`98•••• ••••`) + Unlock ₹499. Post-unlock: tel: + WhatsApp links. "Didn't respond in 48h?" report link.

**PDF (the deliverable):** Karan's fixed format 1:1 (PENDING — see §11). Clickable: day links → live itinerary (id + UTM), provider teasers → unlock flow, branding/home, WhatsApp share. Personalized footer "Prepared for {lead name} · bluesheepadventures.com". Zero phone numbers.

---

## 10. BUILD PHASES (4 weeks)

- **A — Foundation:** dependency swap → Supabase schema + RLS (§6 SQL) → Google one-tap → NVIDIA wiring (**Nemotron smoke test: basic completion + guided_json acceptance + thinking-toggle latency benchmark**) → `/api/chat` with 3+3 lead capture + metering + streaming
- **B — Frontend:** Himalaya map hero + docked chat → streaming chat UI + meter → itinerary renderer → **PDF template + lead-gated route** → paywall modals → mobile 375px
- **C — Monetization:** provider directory → unlock flow (atomic) → Razorpay orders + webhook → credits ledger → 48h reporting → dashboard
- **D — Intelligence & launch:** RAG ingestion of 50 itineraries → admin views → provider consent onboarding → QA (§12) → deploy to Vercel

---

## 11. BLOCKED ON KARAN (everything else can proceed)

1. **Itinerary end format** — the PDF template + `itineraries.content` JSON shape lock to it 1:1. Drop at `D:/bluesheepadventures/itinerary-format/`, paste, or share an example PDF.
2. **~50 itineraries** (Himalayan treks of the 4 regions, high-altitude priority) → `D:/bluesheepadventures/seed-itineraries/`
3. **~30 providers** across the 4 regions (trek guides first; drivers/hosts where available): name, phone, photo, type, treks, experience + **signed consent** (jurisdiction-generic template to be drafted — DPDP for India, contractual for Nepal)
4. **Accounts:** NVIDIA (build.nvidia.com), Supabase, **Razorpay (KYC takes days — start immediately)**
5. Two open business calls (non-blocking): free/₹99 first unlock? 48h guarantee in hero copy?

---

## 12. VERIFICATION CHECKLIST (run before launch)

- [ ] Full e2e: lead capture → 3-message cutoff → 402 paywall → sandbox payment → number reveal → credit decrement
- [ ] Phone-dedupe blocks incognito/new-email metering bypass
- [ ] RAG: 10 golden questions answered ONLY from seeded itineraries; out-of-corpus question → "not covered yet" + suggestions, zero invented route data
- [ ] `providers.phone` unreachable via anon client (RLS test)
- [ ] PDF: no-lead download → modal → lead row + pdf_downloads row + file; existing-lead → instant; ZERO phone numbers in file; all links resolve
- [ ] Razorpay webhook signature-rejection test
- [ ] Mobile 375px: map, chat, checkout, PDF download all usable

---

## 13. DECISION LOG

| Date | Decision |
|---|---|
| Apr 2026 | Original plan: guided-trek site rebuild, Next.js 14 (OBSOLETE) |
| Jun 11 | PIVOT: DIY platform — itineraries + AI + contact unlocks. 18 old planning docs deleted; CLAUDE.md = single source of truth |
| Jun 11 | Pricing locked: ₹499 single (48h credit-back) / ₹1,499 premium (5 unlocks + AI + editing); travelers-only; raw number reveal; Google login at payment only |
| Jun 11 | Scope corrected: end-to-end outdoor adventure platform (not just treks); providers = guides/drivers/hosts/instructors; 3+3 chat flow; activity-coded map vision |
| Jun 11 | **Phase 1 launch scope: Himalayan/high-altitude treks, 4 regions (HP/UK/Kashmir/Nepal); Himalaya map hero with chat docked under; Nemotron 3 Super 120B (`nvidia/nemotron-3-super`), RAG-grounded on BSA DB only (no fine-tuning — corpus too small)** |
| Jun 11 | Itinerary deliverable = clickable PDF in Karan's fixed format; download lead-gated ("lead no matter what") |

---

*Handoff prepared June 11, 2026. Full research evidence with sources: `DIY_PIVOT_RESEARCH.md` (18 sections, 3 rounds, 60+ companies). Master plan kept in lockstep: `CLAUDE.md`. Work log: `E:/claude task tracker/bluesheepadventures/log.md`.*
