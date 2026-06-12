# BlueSheepAdventures — Work Log

Chronological record of work done. Most recent at top.

---

## 2026-06-11 (HANDOFF document created)
- **`D:/bluesheepadventures/HANDOFF.md` written** — single execution-ready handoff: vision + Phase 1 scope, locked business model, condensed 3-round research (validated comps, market gap, 4 hard problems, phase-2 revenue menu), full tech stack (Nemotron config + fallback, embedding constraints), complete schema SQL, API route table, state machines (3+3, unlock, RAG ingestion), frontend spec (Himalaya map hero, chat, renderer, PDF), 4-week build phases, verification checklist, blocked-on-Karan list, decision log
- Karan is handing the project off from here; HANDOFF.md + CLAUDE.md + DIY_PIVOT_RESEARCH.md are the complete package

## 2026-06-11 (PDF delivery + lead-gated download added to spec)
- **New requirement from Karan:** itinerary's end deliverable = **clickable PDF in his fixed format** (format pending from him — blocked-on-Karan item added). Download is **lead-gated** — no lead, no PDF ("get their lead no matter what")
- CLAUDE.md updated: §2 PDF-delivery row (PDF of own first itinerary free once lead exists; GPX stays premium), new §4.7 PDF spec (clickable day links + provider-teaser unlock links, ZERO phone numbers in file, personalized footer = anti-share + acquisition loop, @react-pdf/renderer not Puppeteer), §6 `pdf_downloads` table + `/api/itineraries/[id]/pdf` lead-gated route, §7.1 PDF-as-second-lead-surface (shared phone dedupe with chat meter), §9 Phase B placement, §10 verification additions
- Chat users pass the gate silently (lead already banked by 3+3 flow); the gate catches page-visitors and shared-PDF recipients

## 2026-06-11 (PHASE 1 LOCKED: Himalayan treks, 4 regions + Nemotron 120B)
- **Karan phased the rollout:** Phase 1 = **Himalayan & high-altitude treks ONLY** across **Himachal, Uttarakhand, Kashmir, Nepal**. Full vision (beaches/adventure/experiential, all-India map) parked as Phase 2+ — schema already supports it
- **Hero re-specced (CLAUDE.md §4.2):** Himalaya-focused map (North India + Nepal, range rendered prominently), 4 clickable glowing regions + data-driven trek pins (Hampta, Kedarkantha, KGL, EBC, Annapurna, Langtang...; high-altitude badge), **chat bar docked UNDER the map** + destination listing chips. Two equal entries: click map → discover; chat → AI pushes to destinations (replies deep-link pins). All-India activity map preserved as §4.2b parked spec; map component data-driven so Phase 2 is a config swap
- **Chat model changed (Karan's pick):** `nvidia/nemotron-3-super` (Nemotron-3-Super-120B-A12B, 120B/12B-active MoE, 1M ctx, build.nvidia.com). NVIDIA guidance temp=1.0/top_p=0.95; `enable_thinking` toggle to benchmark. guided_json not explicitly documented for it → Phase A smoke test; fallback = llama-3.3-70b for the itinerary-emitting call only
- **"Train on our data only" = RAG grounding (not fine-tuning):** §7.3 hard rule sharpened — route facts ONLY from retrieved DB chunks; out-of-corpus → "we don't cover that yet" + nearest covered treks; never model world-knowledge
- §11 updated: 50 itineraries + ~30 providers region-scoped to the 4 corridors; Nepal guides sign jurisdiction-generic consent
- Research §17 corridor flag RESOLVED; Nepal entry = direct shot at GetYourTrekGuide on home turf

## 2026-06-11 (SCOPE CORRECTED by Karan + Round 3 research)
- **Karan corrected the model — bigger than trekking:** end-to-end outdoor adventure platform, one-stop for experiential & adventure activity across India. Users design their own itineraries (manually or with AI); unlocks cover ALL local people behind the itinerary — trek guides, **taxi drivers, hosts, instructors**. Explicit **3+3 chat flow**: ~3 lead-capture turns → 3 itinerary-preference turns → first itinerary FREE (view-only); any change/edit = premium. India map hero now has **activity-coded clickable destinations** (🏔 mountains/hiking, 🏖 beaches/water, 🪂 adventure hubs, ✨ experiential)
- **Round 3 research appended to `DIY_PIVOT_RESEARCH.md` (§16–18):** Thrillophilia (₹500cr+, profitable — hides providers behind bookings; we reveal them), Pickyourtrail (DIY demand proven, but international-focused → domestic gap), GetYourGuide/Headout 15–35% operator commissions (= our wedge pitch to providers), Savaari (brokers drivers, never reveals contacts — driver unlock is virgin territory), Showaround (reverse-pitch + money-back), Justdial (free-but-unverified generic contacts), TripHobo (cautionary: builder without monetizable action stagnates), chatbot lead-gen 2.4–3× form conversion (validates 3+3 flow)
- **CLAUDE.md migrated to corrected model:** §1 scope, §2 model table (3+3), §4.2 activity-coded map, §4.5 provider directory, schema `guides`→`providers` (+type/activities), `/api/guides/*`→`/api/providers/*`, §7.1 state machine adds FIRST_ITINERARY, §11 seed providers across categories in 2–3 launch corridors
- **New risk logged:** verification burden + cold-start spread across categories → mitigate with 2–3 anchor corridors (depth over breadth)
- Pricing unchanged (₹499/₹1,499). Phase A still next — schema now builds `providers` from day one (cheaper than migrating later)

## 2026-06-11 (Round 2 research — model validated harder, 2 technical catches)
- **Round 2 comp research appended to `DIY_PIVOT_RESEARCH.md` (§10–15):** 20+ new companies across 3 tracks
  - DIY platforms: AllTrails ($35.99/$79.99 tiers), Komoot (decade of one-time region unlocks — strongest proof of ₹499 one-time psychology; forced-subscription pivot caused user revolt), Gaia/Wikiloc/Hiiker, 57hours (guides pay 20–30% commission — phase-2 evidence), Skyhook (20%), Much Better Adventures (8%), Tripoto, Bikat
  - Unlock models: **MagicBricks MB Prime ₹1,399/6-mo for 10 owner contacts, 100K+ pre-launch subs — closest comp yet to our ₹1,499/5-unlock premium**; WorkIndia/Apna (pay-to-contact is mainstream Indian UX); IndiaMART (₹16–24/lead + ₹45K/yr trust badge); Upwork Connects ($0.15, free monthly allowance); Zillow ($20–60/lead)
  - AI: Mindtrip (proprietary 11M-POI grounding = the moat pattern), Wanderlog Pro ($39.99/yr gates AI assistant)
- **Technical verifications applied to CLAUDE.md §3/§6.3/§7.3:** NIM `guided_json` confirmed on llama-3.3-70b (shape-guaranteed itinerary JSON, two-call pattern); **embedding model caps input at 512 tokens** → chunks ≤400 tokens; asymmetric `input_type` passage/query required
- **Flagged for Karan (§15, model NOT changed):** free/₹99 first unlock (Upwork/NoBroker free-allowance pattern)? 48h guarantee promoted to hero copy (MB Prime's top complaint is paid-but-no-response)? Phase-2 guide-side anchors recorded
- Locked pricing survived round 2 with stronger comps than round 1. Phase A remains next.

## 2026-06-11 (early hours — session crash + recovery)
- Antigravity IDE crashed at the end of the docs-reset session. No work was lost — all wiki/doc updates had already been written to disk.
- Full transcript (including Claude's reasoning) recovered to `E:/claude task tracker/recovered-bluesheep-session-2026-06-11.md`. Session ended with Phase A (dependency swap, Supabase schema, chat API) ready to start.

## 2026-06-11 (night — docs reset to new model)
- **Deleted all 18 old-model planning .md files** at Karan's request (ACCELERATED_LAUNCH_PLAN, BUSINESS_ANALYSIS, DATABASE_SCHEMA, WEBSITE_DESIGN_PLAN, TECH_STACK, etc.)
- Kept `DIY_PIVOT_RESEARCH.md` (new-idea research evidence)
- **Created single master plan: `D:/bluesheepadventures/CLAUDE.md`** — business rules, frontend design (map hero, chat UI, itinerary renderer, guide cards), architecture, full Supabase SQL schema + RLS, API route table, logic state machines (lead capture, metering, unlock, 48h guarantee), env vars, phases, verification checklist
- `web/CLAUDE.md` now imports root CLAUDE.md (+ AGENTS.md Next.js 16 warning) so every coding session loads the master plan
- Discovered actual stack in `web/`: Next.js 16.2.4 + React 19 + Tailwind 4 (not Next 14); Prisma/NextAuth/Stripe to be swapped for Supabase/Razorpay
- tasks.md rewritten for Phases A–D of the new model

## 2026-06-11 (evening — PIVOT APPROVED, build started)
- Brainstormed open decisions with Karan; all four locked:
  - Lead capture: chat-native (AI asks name → phone → email; doesn't count toward 3 free messages)
  - Discovery UX: AI chat bar floating over interactive India map hero (glowing trek regions)
  - Pricing: ₹499 single unlock w/ 48h response credit-back; ₹1,499 premium = 5 unlocks + unlimited AI + itinerary editing
  - Monetization: travelers only in phase 1; guides (30 ready) listed free
- Karan's additional specs: raw number reveal; free itinerary is view-only (editing = paid); Google one-tap login only at payment; Supabase free tier as DBMS; NVIDIA NIM keys (build.nvidia.com); Karan to supply ~50 itineraries to ground the AI (RAG via pgvector, not fine-tuning)
- Verified: NVIDIA NIM = 1,000 free credits, OpenAI-compatible endpoint; Supabase free = 500MB Postgres + 50K MAU auth + pgvector included
- Pivot plan v2 written and APPROVED — 4-week build (A: Foundation, B: Frontend, C: Monetization, D: RAG + launch)
- Phase A started: Supabase schema, NVIDIA wiring, chat API with metering + lead capture
- **Pending from Karan:** 50 itineraries → `D:/bluesheepadventures/seed-itineraries/`; 30 guide details + DPDP consent; NVIDIA/Supabase/Razorpay accounts (Razorpay KYC takes days — start now)

## 2026-06-11 (later — PIVOT)
- **Karan proposed full business-model pivot:** DIY trek platform — sell itineraries/location guides, in-app AI agent (3 free questions → premium), pay-to-unlock guide phone numbers (₹1,000 one-time; ₹2,000 premium = 5 unlocks or 10 AI itineraries)
- **Deep comp research completed** → `D:/bluesheepadventures/DIY_PIVOT_RESEARCH.md`
  - Closest analogs: Rexby (guides + creator-trained AI, 50/20/30 split), NoBroker (free contacts → ₹999+ plans), Shaadi (contact paywall ₹4,650+), Thumbtack/Bark (provider-pays leads $15–80), Macs Adventure (self-guided packages), GetYourTrekGuide (verified Nepal guide marketplace)
  - **Key threat:** Indiahikes gives 300+ DIY trek guides + GPX files away FREE → paid itineraries can't be core product
  - **Key gap confirmed:** no dominant verified-guide contact marketplace for Indian Himalayas
  - **Key risks:** contact leakage (mitigate via number masking), ₹1,000 unlock above impulse threshold, cold start needs 50+ seeded guides, DPDP Act consent needed from guides
- Awaiting Karan's decisions on pricing v2, masked calling, guide seeding before drafting the new build plan

## 2026-06-11
- **PHASE 1: Comprehensive market research** — analyzed 20+ trekking platforms globally
  - Competitors: Indiahikes (35k trekkers/year), Bikat Adventures (small groups), Trek The Himalayas
  - International: AllTrails (500k trails), Viator (400k tours), Komoot (modern design)
  - Market insights: 25-45 age group, ₹20k+ income, experiential travel focused
  - Critical: Razorpay + UPI essential (38% vs 4% Stripe conversion drop)
  
- **PHASE 2: Deep UI/UX/Frontend research** — created WEBSITE_DESIGN_PLAN.md (1000+ lines)
  - Component specifications: Button, Card, FilterPanel, TrekCard (with code examples)
  - Page-by-page design: Homepage, Trek listing, Trek detail, Booking flow
  - Mobile-first responsive design: 375px, 640px, 1024px breakpoints
  - Project structure: Next.js app router, API routes, component hierarchy
  - Database schema: Full Prisma schema (Trek, Booking, User, Review models)
  - Search/Filter patterns: Sidebar (desktop), modal (mobile)
  - Booking optimization: Trust signals, friction reduction, email sequences
  
- **Tech stack finalized:** Next.js 14 + React + TypeScript + Tailwind CSS + PostgreSQL + Razorpay
- **Design system:** Colors (mountain gray, forest green, sky blue), typography (Playfair + Inter)
- **Development timeline:** 7-week phased approach (Foundation → MVP → Content → Launch)
- **Created planning docs:** 
  - `C:\Users\Karan singh\.claude\plans\so-i-want-to-ancient-creek.md` (6-month strategy)
  - `D:\bluesheepadventures\WEBSITE_DESIGN_PLAN.md` (implementation specifications)
- **Wiki updated:** Progress 15% → 35%, comprehensive design guidance ready

## 2026-04-24
- Task tracker wiki initialized. Existing project state reverse-engineered from codebase.
- Phase 1 (Planning) confirmed complete — 17 planning/documentation files created.
- Next action: environment setup + Next.js init (Apr 25).

## Earlier (from project files)
- Strategic pivot decided: WordPress → Next.js 14
- Created 17 planning documents:
  - START_HERE_NOW.md, ACCELERATED_LAUNCH_PLAN.md, WEEK1_SPRINT_PLAN.md
  - TECH_STACK.md, DATABASE_SCHEMA.md, PROJECT_PLAN.md
  - FEATURES.md, SETUP_GUIDE.md, QUICK_REFERENCE.md
  - BUSINESS_ANALYSIS.md, PIVOT_SUMMARY.md, ACTION_PLAN.md + more
- Initial git commit

---
