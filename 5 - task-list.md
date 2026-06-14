# BlueSheepAdventures — Task List (DIY Trek Platform)

## Legend
- `[ ]` To Do
- `[~]` In Progress
- `[x]` Done
- `[!]` Blocked

---

## Phase 0 — Pivot Research & Planning (Jun 11, 2026)
- [x] Original guided-trek model research (20+ platforms) — superseded by pivot
- [x] DIY pivot deep research → `D:/bluesheepadventures/DIY_PIVOT_RESEARCH.md`
- [x] Brainstorm + lock decisions (lead capture, map UX, ₹499/₹1,499 pricing, travelers-only)
- [x] Pivot plan approved
- [x] Delete 18 old-model planning .md files
- [x] Master plan written → `D:/bluesheepadventures/CLAUDE.md` (frontend + architecture + backend + logic in one file)
- [x] Round 2 research (Jun 11): 20+ more comps (AllTrails, Komoot, 57hours, MB Prime, WorkIndia, Upwork, Mindtrip, Wanderlog...) + NVIDIA technical verification → appended to `DIY_PIVOT_RESEARCH.md` §10–15
- [x] **SCOPE CORRECTED (Jun 11 night):** end-to-end outdoor adventure platform (beaches/mountains/adventure/experiential), multi-provider unlocks (guides/drivers/hosts/instructors), explicit 3+3 chat flow, activity-coded map
- [x] Round 3 research → `DIY_PIVOT_RESEARCH.md` §16–18 (Thrillophilia, Pickyourtrail, GetYourGuide/Headout, Savaari, Showaround, Justdial, TripHobo, chatbot lead-gen stats)
- [x] CLAUDE.md migrated to corrected model (providers schema, /api/providers, 3+3 state machine, activity map)
- [x] **PHASE 1 LOCKED (Jun 11):** Himalayan/high-altitude treks only — Himachal, Uttarakhand, Kashmir, Nepal. Himalaya map hero (chat docked under), Nemotron-3-Super-120B chat model, RAG-only grounding. Corridor question resolved
- [ ] Karan to decide §15 flags: free first unlock? 48h guarantee in hero copy?

## Phase A — Foundation (Week 1)
- [ ] Dependency swap: remove Prisma/NextAuth/Stripe/bcryptjs/nodemailer → add @supabase/supabase-js, @supabase/ssr, openai, razorpay
- [ ] Supabase project + run schema SQL (leads, guides, chat, itineraries, chunks, payments, subscriptions, unlocks)
- [ ] RLS policies + `guides_public` view (phone never client-readable)
- [ ] Google one-tap auth (Supabase)
- [ ] NVIDIA NIM wiring (`lib/ai.ts`, OpenAI SDK → integrate.api.nvidia.com/v1)
- [ ] `/api/chat`: lead-capture state machine + 3-message metering (phone-dedupe) + streaming

## Phase B — Frontend (Week 2)
- [ ] India map hero (interactive SVG, glowing trek regions) + floating AI chat bar
- [ ] Chat UI with meter pill + paywall modal at message 4
- [ ] Itinerary renderer (read-only; locked Edit/Regenerate/GPX buttons for free users)
- [ ] Region side-panel (treks + guide counts + "Plan with AI")
- [ ] Mobile 375px: docked chat bar, simplified map, region chips

## Phase C — Monetization (Week 3)
- [ ] Guide directory + cards (blurred numbers, response-rate badges)
- [ ] `/api/guides/unlock` (idempotent, atomic credit decrement)
- [ ] Razorpay: create-order + webhook (signature verify) + premium subscription grant
- [ ] 48h no-response reporting + admin resolution + credit-back
- [ ] Dashboard: my itineraries, unlocked guides, credits, premium status

## Phase D — Intelligence & Launch (Week 4)
- [ ] RAG ingestion script for Karan's 50 itineraries (parse → chunk → NVIDIA embed → pgvector)
- [ ] AI system prompt contract (BSA-grounded, JSON itineraries, no hallucinated routes, contextual unlock nudges)
- [ ] Admin views: leads export, guide CRUD + consent, reports queue, payments
- [ ] QA per verification checklist (CLAUDE.md §10) + deploy to Vercel

## Blocked on Karan
- [!] **Itinerary end format** (file → `D:/bluesheepadventures/itinerary-format/`, paste, or example PDF) — PDF template + content JSON lock to it 1:1
- [!] ~50 itineraries (Himalayan treks: HP/UK/Kashmir/Nepal, high-altitude priority) → `D:/bluesheepadventures/seed-itineraries/`
- [!] ~30 provider details across the 4 Phase-1 regions + signed consent (template to be drafted)
- [!] Accounts/keys: NVIDIA (build.nvidia.com), Supabase, Razorpay (KYC takes days — start now)

---
*Last updated: 2026-06-11*
