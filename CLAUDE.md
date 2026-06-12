# Blue Sheep Adventures — DIY Trek Platform (Master Plan & Project Instructions)

**This is the single source of truth for the BSA platform.** Old guided-trek-model docs are deleted. Market research backing this model: `DIY_PIVOT_RESEARCH.md`. App code lives in `web/` (Next.js 16 — read `web/AGENTS.md` warning before writing Next.js code).

---

## 1. WHAT THIS IS

**An end-to-end outdoor adventure platform for India — one-stop for experiential & adventure activity** (scope corrected by Karan, Jun 11 night). Users come to **design their own itineraries** — mountain treks, beach & water activities in the south, adventure sports (rafting, paragliding), experiential travel — manually or with the AI. Once an itinerary exists, they pay to **unlock the verified contacts of the local people behind each piece of it**: trek guides, taxi drivers, hosts, instructors. The AI agent is grounded on Karan's own ~50 itineraries (RAG), expanding by category over time.

Validated against: Pickyourtrail (DIY itinerary demand in India), Thrillophilia (₹500cr+ proof of the market — but it hides providers behind bookings; we reveal them), NoBroker/MB Prime (contact unlocks), Wanderlog/Layla (AI freemium). Full research: `DIY_PIVOT_RESEARCH.md` rounds 1–3.

**Not** a booking platform. We sell itinerary design, AI convenience, and verified connections. The user transacts with providers directly off-platform — our wedge vs OTAs taking 15–35% commission.

**PHASED ROLLOUT (decided by Karan, Jun 11):**
| Phase | Scope |
|---|---|
| **Phase 1 (LAUNCH — current)** | **Himalayan & high-altitude treks ONLY**, across 4 regions: **Himachal · Uttarakhand · Kashmir · Nepal**. Hero = Himalaya-focused map (North India + Nepal) with chat docked under it. Providers seeded in these regions only |
| Phase 2+ | Widen to the full vision: beaches & water sports, adventure hubs, experiential travel, all-India activity map. The schema (`providers.type/activities`, itinerary shape) already supports this — widening is data + map config, not a rebuild |

---

## 2. BUSINESS MODEL (LOCKED — Jun 11, 2026)

| Rule | Value |
|---|---|
| Free tier | **The 3+3 flow:** ~3 lead-capture chat turns (name → phone → email, do NOT count) + **3 free AI messages** (where / what activities / preferences) → **first itinerary free, view-only** |
| Lead capture | Chat-native, BEFORE the free itinerary is generated — lead is always banked before value is delivered |
| Single unlock | **₹499** → raw provider phone number revealed (guide, taxi driver, host, instructor). 48h response guarantee: no response → credit-back |
| Premium | **₹1,499** → 5 unlock credits + unlimited AI chat + itinerary editing/regeneration (ANY change or fix to the free itinerary = premium) |
| Who pays | Travelers only (phase 1). Providers listed FREE — they get free leads. Provider-side fees = phase 2 |
| Login | Google one-tap, required **only at payment**. Lead (pre-chat) linked to user by email match at first login |
| Contact reveal | Raw number (no masking). Providers sign DPDP-compliant consent before listing |
| Itinerary editing | Paid feature. Free users see their first itinerary, never edit it |
| PDF delivery | Itinerary ships as a **clickable PDF in Karan's fixed format** (format to be supplied — see §11). Download is **lead-gated**: existing lead/user → instant; no lead → lead-capture modal first. Every download recorded against a lead. PDF of own first itinerary = free once lead exists (the lead IS the price); GPX export stays premium |

**Monetization guardrails for the AI:** the agent recommends provider unlocks contextually ("For Kashmir Great Lakes, I'd go with a local guide — 4 verified guides cover this route"; "From Mandrem, 2 verified drivers do the airport run"), never reveals numbers, never reveals more than the free itinerary allows.

---

## 3. TECH STACK

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.4** (App Router, `web/src/`) | ⚠️ Breaking changes vs older Next — check `node_modules/next/dist/docs/` |
| UI | React 19, Tailwind CSS 4 | Existing design system in `globals.css` |
| Database + Auth + Vectors | **Supabase free tier** | Postgres 500MB, Auth 50K MAU (Google one-tap), pgvector included |
| AI | **NVIDIA NIM** — `https://integrate.api.nvidia.com/v1` (OpenAI-compatible) | Free 1,000 dev credits (top up at launch). Chat: **`nvidia/nemotron-3-super-120b-a12b`** (exact catalog ID, verified Jun 12 — "nemotron-3-super" 404s). NVIDIA guidance: `temperature=1.0, top_p=0.95`; reasoning toggle `enable_thinking` via `chat_template_kwargs`. **Phase A smoke RESULT (Jun 12, real key):** `nvext.guided_json` is **IGNORED** by both Nemotron and Llama on this endpoint — use OpenAI-style **`response_format: {type:"json_schema", json_schema:{name, schema}}`** (verified: exact schema-conforming output on Nemotron with thinking off). Single-model setup; no Llama fallback needed. Latency: both thinking modes ~1–8s/turn, inconclusive spread — revisit if chat feels slow. Embeddings: `nvidia/nv-embedqa-e5-v5` (1024-dim ✓ verified; **512-token input cap**; asymmetric — `input_type:"passage"` at ingestion, `"query"` at retrieval) |
| Payments | **Razorpay** (UPI-first) | One-time ₹499 orders + ₹1,499 premium |
| Hosting | Vercel | |

**Dependency migration (to do):** remove `@prisma/client`, `prisma`, `next-auth`, `stripe`, `bcryptjs`, `nodemailer` (old model). Add `@supabase/supabase-js`, `@supabase/ssr`, `openai` (pointed at NVIDIA), `razorpay`.

```ts
// lib/ai.ts — NVIDIA wiring pattern
import OpenAI from "openai";
export const ai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});
// ai.chat.completions.create({
//   model: "nvidia/nemotron-3-super",
//   temperature: 1.0, top_p: 0.95,                       // NVIDIA guidance for Nemotron 3
//   // chat turns: extra_body: { chat_template_kwargs: { enable_thinking: false } }
//   // itinerary call: extra_body: { nvext: { guided_json: itinerarySchema } }  ← smoke-test on Nemotron; fallback meta/llama-3.3-70b-instruct
// })
```

---

## 4. FRONTEND DESIGN

### 4.1 Design system (carried over from existing build)
- **Colors:** Mountain Gray `#3A3F47`, Forest Green `#2D5016`, Sky Blue `#1E90FF`, Accent Orange `#FF6B35` (CTAs), Earth Brown `#8B6F47`. Difficulty badges: green → red scale.
- **Type:** Playfair Display (headings) + Inter (body). Body 16px desktop / 14px mobile, line-height 1.6.
- **Spacing:** 8px grid. Touch targets ≥44px. Cards: 8px radius, subtle shadow.
- Existing `Nav.tsx`, `Footer.tsx`, `TrekCard.tsx` and trek pages are REUSED as the free SEO content layer.

### 4.2 Homepage hero — PHASE 1: "Himalaya map + chat under it" (the signature screen)
- **Stylized Himalaya-focused map: North India + Nepal** (custom SVG; render the Himalayan range prominently — this is a mountain platform, the map should feel like mountains). Four clickable regions, glowing: **Himachal · Uttarakhand · Kashmir · Nepal**.
- **Destination pins** inside each region for marquee treks (data-driven from config): Hampta Pass, Triund/Indrahar, Pin Parvati (Himachal) · Kedarkantha, Brahmatal, Roopkund area, Har Ki Dun (Uttarakhand) · Kashmir Great Lakes, Tarsar Marsar (Kashmir) · Everest Base Camp, Annapurna Circuit, Langtang (Nepal). **High-altitude treks get a distinct badge/pin style.**
- **Click a region or pin** → side panel: treks there (difficulty, season, altitude), verified provider count, "Plan with AI" button (pre-seeds chat with the destination).
- **Chat bar docked UNDER the map** (not floating over it) with a **simple destination listing strip** beside/above it (the 4 regions + featured treks as chips). Placeholder: *"Where do you want to trek? Ask me anything…"*. Typing expands into the chat panel. Two equal entries: **click the map → discover destinations; chat → the AI pushes you to specific destinations** (every AI reply that names a trek deep-links its pin/panel).
- Mobile (375px): simplified tappable range SVG; chat bar bottom-sticky; region chips as horizontal fallback.
- Below the fold: featured treks (existing TrekCards), how-it-works (3 steps: Design your itinerary free with AI → Get your first itinerary → Unlock the verified local contacts behind it), testimonials, provider-count trust bar.
- **Build the map data-driven** (regions + pins + activity types from a config file) — Phase 2's all-India activity map is then a config/data swap, not a component rewrite.

### 4.2b Phase 2+ hero (parked spec — do NOT build yet)
All-India map with activity-coded clickable destinations: 🏔 mountains (adds Sikkim, Northeast) · 🏖 beaches (Goa, Gokarna, Kerala, Andamans) · 🪂 adventure hubs (Rishikesh, Bir, scuba spots) · ✨ experiential (deserts, backwaters, wildlife). Same panel/chat interactions as Phase 1.

### 4.3 Chat UI
- Streaming responses (Server-Sent Events from the chat route).
- **Message meter** visible: "2 of 3 free messages left" pill.
- Lead-capture turns render as normal AI conversation (name → phone → email), with inline validation states.
- When the AI outputs an itinerary → rendered as a structured **itinerary card** (see 4.4), not raw text.
- On message 4 attempt → paywall modal (₹1,499 premium pitch + ₹499 single-unlock cross-sell).

### 4.4 Itinerary renderer (read-only for free users)
- Day-by-day accordion: Day N title, distance km, altitude m → m, walking hours, difficulty chip, meals, tips.
- Map strip per day (static for v1).
- **Locked controls** for free users: "Edit days" / "Regenerate" / "Download GPX" buttons visible but lock-iconed → paywall modal. (Visible-but-locked converts better than hidden.)
- "Local contacts for this itinerary" rail at the bottom (guides, drivers, hosts, instructors per component) → unlock flow.

### 4.5 Provider directory & cards (guides, taxi drivers, hosts, instructors)
- Card: photo, name, **provider type badge** (Guide / Driver / Host / Instructor), regions & activities covered, years experience, languages, response-rate badge, **blurred phone number** (`98•••• ••••`) with Unlock ₹499 button.
- **Itinerary-contextual rail:** each itinerary day/component shows the matching provider types ("Day 2: Triund trek → 3 verified guides · Day 3: transfer to Bir → 2 verified drivers").
- Post-unlock: full number + tel: link + WhatsApp deep link + "unlocked on {date}" in user dashboard.
- "Didn't respond within 48h?" report link on every unlocked card.

### 4.6 Dashboard (post-login)
- My itineraries (AI-generated, editable if premium), My unlocked contacts, Credits remaining, Premium status/expiry.

### 4.7 Itinerary PDF (the deliverable)
- **Format: Karan's end format ONLY** — the PDF template implements it 1:1 once supplied (§11 blocker). Until then the generic day-by-day JSON shape stays; it maps onto any day-based format.
- **Clickable elements** (PDF link annotations):
  - Each day/component links back to the live itinerary page (itinerary id + UTM).
  - **Provider teasers, never numbers:** "3 verified guides for this trek → Unlock" links into the unlock flow. Phone numbers NEVER appear in the PDF — the §5 server-side-only rule extends to generated files.
  - BSA branding/home link; WhatsApp-share link.
- **Personalized footer:** "Prepared for {lead name} · bluesheepadventures.com" — discourages anonymous mass-sharing; every shared PDF is an acquisition loop (recipient clicks → itinerary page → leaves a lead to download their own).
- **Tech:** `@react-pdf/renderer` in a Next.js route handler (pure JS, Vercel-serverless-friendly, supports Link annotations; NOT Puppeteer — cold-start weight). Template = React components fed by `itineraries.content` JSON.
- Optional Phase C add-on (not MVP): "Email me this PDF" (captures email by definition; needs an email provider, e.g. Resend — decide then).

---

## 5. ARCHITECTURE

```
Browser
  │
  ├─ Next.js 16 app (Vercel) — web/src/
  │    ├─ / (map hero + chat)        ├─ /treks, /treks/[slug] (free SEO layer)
  │    ├─ /providers, /providers/[region]  ├─ /dashboard
  │    └─ /api/* (route handlers — ALL business logic server-side)
  │
  ├─ Supabase
  │    ├─ Auth (Google one-tap)
  │    ├─ Postgres + RLS (all tables below)
  │    └─ pgvector (itinerary_chunks)
  │
  ├─ NVIDIA NIM  ── chat completions + embeddings
  └─ Razorpay    ── checkout + webhooks
```

**Hard rule:** metering, credit decrements, number reveals, and payment verification happen ONLY in server route handlers using the Supabase **service-role** client. The anon-key client never touches `providers.phone`, credits, or message counts. RLS denies client reads on `providers.phone` entirely — the number reaches the browser only via `/api/providers/unlock` response after verified payment/credit.

---

## 6. BACKEND DESIGN

### 6.1 Database schema (Supabase SQL)

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
  activities text[] not null,                          -- e.g. {trekking, rafting, scuba, paragliding, beach}
  treks text[],                                        -- guide-specific (nullable for other types)
  languages text[], years_experience int,
  status text default 'pending' check (status in ('pending','verified','paused')),
  consent_signed_at timestamptz,                       -- DPDP: required before status='verified'
  response_rate numeric,                               -- from 48h reports
  created_at timestamptz default now()
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads not null,
  free_messages_used int default 0,                    -- the meter
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
  content jsonb not null,                              -- { days: [{n, title, km, altFrom, altTo, hours, difficulty, meals, tips}] }
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
  user_id uuid references auth.users,                  -- null until login
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
  payment_id uuid references payments,                 -- null when credit-funded
  source text check (source in ('single','premium_credit','credit_back')),
  response_reported boolean default false,             -- 48h guarantee
  report_resolved text,                                -- 'credit_issued' | 'rejected'
  created_at timestamptz default now(),
  unique (user_id, provider_id)                        -- never charge twice for same provider
);
```

**RLS:** users read own rows only (leads via linked user_id, unlocks, subscriptions, itineraries, payments). `providers`: public SELECT on all columns EXCEPT `phone` (use a `providers_public` view; raw table service-role only). All writes via service-role in route handlers.

### 6.2 API routes (web/src/app/api/)

| Route | Method | Logic |
|---|---|---|
| `/api/chat` | POST | The core route. Handles lead-capture state machine + metering + RAG + streaming (see §7.1–7.3) |
| `/api/itineraries/[id]` | GET/PATCH | PATCH requires premium (`itinerary_editing`) |
| `/api/itineraries/[id]/pdf` | GET | Lead-gated download: resolve lead from session/auth → none? 402 + lead-modal payload (client posts lead via chat-flow validation + phone dedupe, retries) → render `@react-pdf` template → insert `pdf_downloads` → stream file |
| `/api/providers` | GET | `providers_public` view, filter by region/activity/type; phone NEVER included |
| `/api/providers/unlock` | POST | Auth required → spend credit OR verify paid order → insert `unlocks` → return phone (see §7.4) |
| `/api/providers/report-no-response` | POST | Sets `response_reported`; admin resolves → credit-back |
| `/api/payments/create-order` | POST | Auth required. Razorpay order for ₹499/₹1,499; row in `payments` |
| `/api/payments/webhook` | POST | Razorpay signature verify → mark paid → if premium: upsert `subscriptions` (5 credits, ai_unlimited, editing, +1yr) |
| `/api/auth/link-lead` | POST | After first login: match `leads.email` → set `leads.user_id` |
| `/api/admin/*` | * | Leads list/export, provider CRUD + consent upload, reports queue, payments. Gate: admin email allowlist |

### 6.3 RAG ingestion (scripts/ingest-itineraries.ts)
1. Karan drops ~50 itineraries (PDF/Word/text) in `seed-itineraries/`
2. Parse → normalize to the `itineraries.content` jsonb shape (`source='karan_seed'`)
3. Chunk per-day + per-trek-overview → embed via NVIDIA → upsert `itinerary_chunks`. Chunks ≤ ~400 tokens (embedding model caps input at 512); embed with `input_type:"passage"` — chat-time retrieval embeds the question with `input_type:"query"`
4. Re-runnable (upsert by itinerary_id + chunk hash)

---

## 7. LOGIC DESIGN (state machines & rules)

### 7.1 Chat state machine (per session)
```
START → ASK_NAME → ASK_PHONE → ASK_EMAIL → FREE_CHAT(3) → FIRST_ITINERARY → PAYWALLED
```
- **The 3+3 design:** ~3 conversational turns capture the lead (name → phone → email, `counts_against_free=false`), then 3 free messages capture where / what activities / preferences — by message 3 the AI generates the **first free itinerary** (view-only card). Any edit/fix request after that → premium paywall.
- States persist server-side on `chat_sessions` (derive from lead completeness + counter; lead-capture turns get `counts_against_free=false`).
- **PDF download = second lead-capture surface:** chat-originated users pass it silently (lead exists); page-originated visitors hit the lead modal. Same `leads` table, same phone-dedupe — the chat meter and the PDF gate share identity.
- Validation: phone = 10-digit Indian mobile (else AI politely re-asks); email regex. On email captured → insert `leads` row → state = FREE_CHAT.
- In FREE_CHAT each **user** message increments `free_messages_used` (assistant replies don't). At 3 used → API returns `402` + paywall payload; client renders paywall modal. Premium users (`ai_unlimited`) skip metering entirely.

### 7.2 Metering & abuse rules
- Meter keyed to **lead.phone** (unique index): new session/incognito/new email with same phone → same meter.
- Per-IP rate limit on `/api/chat` (basic, in-route) to slow fake-phone farming. Accept residual leakage — each bypass still deposits a fresh lead.

### 7.3 AI system prompt contract
- Identity: BSA Himalayan trek-planning expert (Phase 1: Himachal, Uttarakhand, Kashmir, Nepal; high-altitude focus).
- **Hard grounding rule (Karan's requirement — the AI takes data ONLY from our database):** every factual claim about routes comes from retrieved `itinerary_chunks` + provider metadata. If retrieval returns nothing relevant, the AI says we don't cover that trek yet and offers the nearest covered destinations — it NEVER falls back to model world-knowledge for route specifics (distances/altitudes/campsites/permits). General mountain-safety advice (AMS awareness, acclimatization principles) is the only permitted non-DB content.
- Nemotron call config: `temperature=1.0, top_p=0.95` (NVIDIA's guidance for this model); `enable_thinking=False` (or `low_effort=True`) on chat turns for latency — final choice after the Phase A benchmark.
- Output itineraries as JSON matching `itineraries.content` shape (client renders the card). Two-call pattern: chat turns stream unconstrained; when an itinerary is warranted, the route makes a second non-streamed completion with `nvext.guided_json` (the `itineraries.content` JSON schema) so the card payload is shape-guaranteed — guided_json constrains shape only, the grounding rules above remain the truth layer.
- Contextually suggest provider unlocks (guides, drivers, hosts, instructors matched to itinerary components); NEVER output provider phone numbers (defense-in-depth: numbers are never in the prompt context anyway).
- Free user: full micro-itinerary view allowed, refuse edit/regenerate requests → point to premium.

### 7.4 Unlock flow (server-side, atomic)
```
POST /api/providers/unlock {provider_id}
  → require auth
  → existing unlock for (user, provider)? return phone (idempotent, no charge)
  → subscriptions.unlock_credits > 0?  decrement (atomic update with check) → insert unlock(source=premium_credit) → return phone
  → else verified paid ₹499 order for this attempt? insert unlock(source=single) → return phone
  → else 402 → client opens Razorpay checkout (then retries with payment proof)
```
- 48h guarantee: report → admin queue → if upheld: +1 `unlock_credits` (source=credit_back), provider's `response_rate` recalculated; 3 upheld reports → provider auto-paused.

### 7.5 Login-at-payment & lead linking
- Any pay button → Google one-tap (Supabase Auth) → on first login call `/api/auth/link-lead` (email match) → chat history & itineraries follow the user into the dashboard.

---

## 8. ENV VARS (web/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only
NVIDIA_API_KEY=                   # build.nvidia.com
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ADMIN_EMAILS=libran93@gmail.com
```

## 9. BUILD PHASES & STATUS

**Launch scope for ALL build phases below = Phase 1 (Himalayan treks, 4 regions) per §1.**

- **Phase A — Foundation (current):** dependency swap, Supabase schema + RLS, Google one-tap, `/api/chat` with lead capture + metering, NVIDIA wiring (incl. Nemotron guided_json smoke test + thinking-mode latency benchmark)
- **Phase B — Frontend:** Himalaya map hero (North India + Nepal, 4 regions + trek pins) + chat docked under it, streaming chat UI, itinerary renderer, paywall modals, **PDF template (Karan's format) + lead-gated `/api/itineraries/[id]/pdf`**
- **Phase C — Monetization:** provider directory + unlock flow, Razorpay orders/webhooks, premium credits ledger, 48h reporting
- **Phase D — Intelligence & launch:** RAG ingestion of 50 itineraries, admin views, provider consent onboarding, QA, deploy

## 10. VERIFICATION CHECKLIST
- Lead capture → 3-message cutoff → 402 paywall → sandbox payment → number reveal → credit decrement (full e2e)
- Phone-dedupe blocks incognito/new-email metering bypass
- RAG spot-check: 10 trek questions answered from Karan's actual itineraries, zero hallucinated route data
- `providers.phone` unreachable via anon client (RLS test)
- PDF flow: download with NO lead → modal → lead row + `pdf_downloads` row + file received; download with existing lead → instant; PDF contains ZERO phone numbers; all PDF links resolve
- Razorpay webhook signature rejection test
- Mobile 375px: map, chat, checkout all usable

## 11. NEEDED FROM KARAN
1. ~50 itineraries → `seed-itineraries/` (any format) — **Himalayan treks of Himachal/Uttarakhand/Kashmir/Nepal, high-altitude treks prioritized**
2. ~30 providers to seed across the 4 Phase-1 regions (trek guides first; drivers/hosts where Karan has them): name, phone, photo, type, treks, experience + signed consent. Nepal guides sign the same agreement — keep the consent template jurisdiction-generic (DPDP is Indian law; Nepali providers consent contractually)
3. Accounts: NVIDIA (build.nvidia.com), Supabase, Razorpay (start KYC NOW — takes days)
4. **The itinerary end format** (any form — file dropped at `D:/bluesheepadventures/itinerary-format/`, a paste in chat, or an example PDF). The `itineraries.content` JSON schema and the PDF template get locked to it 1:1 on receipt
