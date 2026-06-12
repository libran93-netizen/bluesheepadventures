# BlueSheepAdventures — End-to-End Outdoor Adventure Platform

## Status: ✅ PHASE 1 LOCKED (Jun 11) — Himalayan treks launch scope, Phase A coding next
**Phase 1 launch scope:** **Himalayan & high-altitude treks ONLY** across **Himachal · Uttarakhand · Kashmir · Nepal**. Hero = Himalaya map (North India + Nepal) with 4 clickable glowing regions + trek pins, **chat docked under the map** + destination listing chips. Chat model: **`nvidia/nemotron-3-super`** (Nemotron 3 Super 120B, build.nvidia.com), **grounded ONLY on our database** (RAG; out-of-corpus → "not covered yet"). Full vision (beaches/adventure/experiential, all-India activity map) = Phase 2+, schema-ready.
**Model:** Users design their own itineraries (manually or with AI). **3+3 chat flow:** ~3 lead-capture turns + 3 preference turns → first itinerary FREE (view-only); any edit = premium. Itinerary delivered as **clickable PDF in Karan's fixed format** (format pending), **download lead-gated** — every PDF download captures/ties to a lead. Unlocks ₹499 reveal verified provider contacts (48h response guarantee) + Premium ₹1,499 (5 unlocks + unlimited AI + itinerary editing). Travelers pay; providers listed free. Raw number reveal; PDFs never contain numbers.
**Stack (actual, verified):** Next.js 16.2.4 + React 19 + Tailwind 4 + Supabase free tier (Auth/Postgres/pgvector) + NVIDIA NIM (`integrate.api.nvidia.com/v1`) + Razorpay
**Docs:** `D:/bluesheepadventures/HANDOFF.md` (execution-ready handoff — start here) · `CLAUDE.md` (master plan, single source of truth) · `DIY_PIVOT_RESEARCH.md` (research rounds 1–3)
**Overall Progress: ~12% on new model** (research ×2 + master plan done; Phase A coding not started)
**Location:** `D:/bluesheepadventures` (app in `web/`)
**Target:** 4-week build (Phases A–D) from Jun 11 → launch ~mid-July 2026

## Build Phases

| Phase | Scope | Status |
|---|---|---|
| 0 — Research & planning | Pivot research (rounds 1+2), model locked, CLAUDE.md master plan | ✅ Done |
| A — Foundation (wk 1) | Dependency swap (Prisma/NextAuth/Stripe → Supabase/Razorpay), schema + RLS, Google one-tap, NVIDIA wiring, /api/chat with lead capture + metering | ⏳ Next |
| B — Frontend (wk 2) | India map hero + floating chat bar, streaming chat UI + meter, itinerary renderer, paywall modals | To do |
| C — Monetization (wk 3) | Guide directory (blurred numbers), unlock flow, Razorpay orders + webhooks, credits, 48h reporting | To do |
| D — Intelligence & launch (wk 4) | RAG ingestion of 50 itineraries, admin views, guide consent onboarding, QA, deploy | To do |

## Round 2 Research Highlights (Jun 11)
- **MagicBricks MB Prime** (₹1,399/6-mo, 10 owner contacts, 100K+ pre-launch subs) = closest comp to our ₹1,499 premium — pricing validated
- **Komoot's decade of one-time region unlocks** validates ₹499 one-time purchase psychology; their forced-subscription pivot caused a revolt (lesson: keep one-time unlocks)
- **57hours/Skyhook/MBA** (8–30% guide commissions) anchor phase-2 guide-side monetization
- **Technical:** NIM `guided_json` confirmed for shape-guaranteed itinerary JSON; embedding model caps input at 512 tokens (chunks ≤400); asymmetric `input_type` required — all applied to CLAUDE.md
- **Open flags for Karan (research §15):** free/₹99 first unlock? 48h guarantee in hero copy?

## Blocked on Karan
- [!] ~50 itineraries → `D:/bluesheepadventures/seed-itineraries/`
- [!] 30 guide details + signed DPDP consent (template to be drafted)
- [!] Accounts/keys: NVIDIA (build.nvidia.com), Supabase, Razorpay (KYC takes days — start now)

## Key India-Market Facts (carried from earlier research)
- Razorpay + UPI essential (38% vs 4% checkout drop vs Stripe)
- Mobile-first (60%+ book on phones); authentic photography; reviews are a conversion multiplier
- Indiahikes gives 300+ trek guides away free → itineraries are our SEO weapon, unlocks are the product

---
*Last updated: 2026-06-11 (Round 2 research)*
