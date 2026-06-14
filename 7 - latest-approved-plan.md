# BSA — Itinerary PDF Delivery in Karan's Format + Lead-Gated Download

## Context

Karan's new requirement: the itinerary the user ends up with must follow **his end format only** (format file/content to be provided by him — not yet received), and it **goes to the client as a clickable PDF**. Downloading the PDF must capture the lead — "some way, we have to get their lead no matter what."

The lead-capture chat flow (3+3) already banks a lead before the first itinerary is generated, so chat users are covered. The PDF gate closes the remaining holes: users who arrive on public trek/itinerary pages without chatting, and recipients of shared PDFs. This is a documentation update to `D:/bluesheepadventures/CLAUDE.md` (single source of truth — Phase A coding hasn't started), so the build implements it natively rather than retrofitting.

## Design to write into CLAUDE.md

### 1. §2 Business model — one new row
| PDF delivery | Itinerary ships as a **clickable PDF in Karan's fixed format**. Download is **lead-gated**: existing lead/user → instant download; no lead → lead-capture modal (name → phone → email, same validation as chat) BEFORE the file is produced. Every download is recorded against a lead |

PDF of the user's own first itinerary = free once lead exists (the lead IS the price). GPX export stays premium (unchanged).

### 2. New §4.7 — Itinerary PDF spec
- **Format: Karan's end format ONLY** — template implements it 1:1 once he supplies it (blocker noted in §11). Until received, the generic day-by-day JSON shape stays; it maps onto any day-based format.
- **Clickable elements inside the PDF** (PDF link annotations):
  - Each day/component links back to the live itinerary on the site (with itinerary id + UTM).
  - **Provider teasers, never numbers:** "3 verified guides for this trek → Unlock" links to the unlock flow. Phone numbers NEVER appear in the PDF (server-side-only rule §5 extends to generated files).
  - BSA branding/home link; WhatsApp-share link.
- **Personalized footer:** "Prepared for {lead name} · bluesheepadventures.com" — discourages anonymous mass-sharing, and every shared PDF becomes an acquisition loop: recipient clicks a link → lands on the itinerary page → must leave a lead to download their own copy.
- **Tech:** `@react-pdf/renderer` in a Next.js route handler (pure JS, works on Vercel serverless; supports Link annotations) — NOT Puppeteer (headless-browser weight/cold-starts on Vercel). Template = React components fed by `itineraries.content` JSON.
- Optional Phase C add-on (not MVP): "Email me this PDF" (captures email by definition; needs an email provider like Resend — decide then).

### 3. §6 Backend — schema + route
```sql
create table pdf_downloads (
  id bigint generated always as identity primary key,
  itinerary_id uuid references itineraries not null,
  lead_id uuid references leads not null,        -- the "no matter what" guarantee
  user_id uuid references auth.users,            -- null until login
  created_at timestamptz default now()
);
```
- New route `/api/itineraries/[id]/pdf` (GET): resolve lead from session/auth → if none, return 402-style payload → client opens lead-capture modal → modal posts lead (reuse chat-flow validation + `leads` insert + phone dedupe) → retry → render PDF, insert `pdf_downloads`, stream file.
- Add the route to the §6.2 API table.

### 4. §7 Logic — lead-gate state note
§7.1 gets a line: PDF download is a second lead-capture surface — chat-originated users pass it silently (lead exists); page-originated visitors hit the modal. Same `leads` table, same phone-dedupe, so the meter and the PDF gate share identity.

### 5. §9 / §10 / §11
- §9: PDF template + gated route land in **Phase B** (renderer exists then); `pdf_downloads` table created with the rest of the schema in Phase A.
- §10 verification adds: download with no lead → modal → lead row + `pdf_downloads` row + file received; download with existing lead → instant; PDF contains zero phone numbers; links in PDF resolve.
- §11 Needed from Karan adds: **the itinerary end format** (any form — file dropped at `D:/bluesheepadventures/itinerary-format/`, a paste in chat, or an example PDF). The `itineraries.content` JSON schema and the PDF template will be locked to it on receipt.

## Files to modify
- `D:/bluesheepadventures/CLAUDE.md` — all sections above.
- `E:/claude task tracker/bluesheepadventures/` — log.md entry, tasks.md (+blocked-on-Karan: format), index.md status line.
- Memory `project_bsa.md` — PDF delivery + lead-gate note.

## Verification
- Re-read CLAUDE.md after edits: PDF spec consistent with §5 hard rule (no numbers client-side), §2 row present, route in API table, schema block valid SQL alongside existing tables.
- Build-time verification stays in §10 as listed above (modal flow, dedupe, zero numbers in PDF, clickable links).
