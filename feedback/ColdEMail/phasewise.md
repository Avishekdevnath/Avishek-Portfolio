# Cold Outreach Tool — Phase Plan (For This Repo)

This plan assumes the tool is implemented inside the existing Next.js + MongoDB portfolio dashboard (owner-only).

---

## Phase 0 — Product rules & ethics (half day)

Decisions to lock:
- Personal use only (single user)
- Manual send only (no SMTP automation to recruiters)
- AI drafts only; never auto-send, never auto-schedule
- Follow-up enforcement:
  - max follow-ups = 2
  - minimum gap = 5–7 days
  - stop on reply

Output:
- A short README/spec for the tool

---

## Phase 1 — Data layer (models + settings) (1–2 days)

Add Mongoose models:
- OutreachCompany
- OutreachContact
- OutreachTemplate
- OutreachDraft
- OutreachEmail (+ optional FollowUpLog)

Extend existing Settings model to include:
- outreachSettings.defaultTone
- outreachSettings.defaultFollowUpGapDays
- outreachSettings.maxFollowUps (hard cap)

Note:
- This repo uses a simple `auth=true` cookie. Outreach data is sensitive, so protect APIs too (not just `/dashboard/*` UI).

---

## Phase 2 — API routes (App Router) (1–2 days)

Create a dedicated API namespace:
- `/api/outreach/*` for companies/contacts/templates/emails
- `/api/outreach/ai/*` for AI drafting endpoints

Must-haves:
- Auth guard on every outreach route (check `auth` cookie)
- Input validation (Zod)
- Rate limit AI endpoints

---

## Phase 3 — Dashboard UI (2–4 days)

Add a single sidebar item:
- Outreach → `/dashboard/outreach`

Build UI pages (no static placeholders):
- Companies
- Contacts
- Outreach Log
- Follow-ups
- Templates
- AI Assistant
- Analytics (computed)

Important UX:
- “Copy draft” button
- “Open email client” (`mailto:`) helper
- “Mark as sent” is the real action

---

## Phase 4 — Follow-up reminders (1–2 days)

Scheduler:
- Daily cron endpoint scans OutreachEmail where followUpDate <= today, status=sent, followUpCount < max
- Creates a Notification pointing to `/dashboard/outreach/follow-ups`

Reuse:
- Existing Notifications page already renders recent activity and unread counts.

---

## Phase 5 — AI assistant (2–3 days)

Provider:
- Reuse the existing Gemini pattern (`GOOGLE_AI_API_KEY`) or keep provider pluggable.

Key features:
- Generate draft (job title + job description + company/contact context)
- Portfolio-aware selection:
  - pick 1–2 published projects and 1–2 skill/experience bullets to mention
- Improve/rewrite existing text (shorten, clarify, confident)
- Follow-up draft + timing suggestion

---

## Phase 6 — Analytics (1–2 days)

Compute (from outreach history, not placeholders):
- Reply rate overall + per template + per company
- Best follow-up gap
- Follow-up effectiveness

---

## Phase 7 — Polish & portfolio story (half day)

- Add screenshots + architecture notes
- Add “Export data” and “Delete all outreach data” buttons (trust signal)
- Write the interview-ready explanation (human-in-the-loop + ownership + constraints)
