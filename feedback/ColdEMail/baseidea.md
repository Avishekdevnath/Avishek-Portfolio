# Cold Outreach Tool — Base Idea (Aligned to Avishek-Portfolio)

This is a private outbound workflow that lives **inside your existing portfolio dashboard**. The key differentiator: the tool uses your **actual portfolio content** (Projects/Skills/Experience/Settings) as context so every email is proof-backed and consistent with your positioning.

---

## Scope (what it does)

- Store target companies + contacts (recruiters / hiring managers)
- Manage reusable outreach templates
- Generate AI-assisted drafts (human-in-the-loop)
- Track what you sent (outreach log)
- Schedule and enforce ethical follow-ups
- Measure outcomes (reply rate, best template, best follow-up timing)

---

## Non-goals (what it explicitly does NOT do)

- No scraping emails
- No bulk blasting
- No inbox access
- No auto-sending
- No silent follow-ups

Manual send only:
- generate draft → you review → you copy/send → you click “Mark as sent”

Safety rules (hard constraints):
- Max follow-ups: 2
- Minimum follow-up gap: 5–7 days
- Auto-stop follow-ups after a reply is logged

---

## What we already have in this repo (reuse)

- Dashboard access control:
  - `/login` sets `auth=true` cookie
  - middleware blocks `/dashboard/*` for non-authenticated users
- MongoDB + Mongoose models for your portfolio content:
  - Projects, Skills, Experience, Blog, Messages, Notifications, Settings
- A notification system already exists (`Notification` model + `/dashboard/notifications`)
- Email utility exists for **self-reminders** (`src/lib/email.ts`) if you want optional reminder emails to yourself
- AI integration pattern exists (Gemini in `src/app/api/tools/route.ts`) via `GOOGLE_AI_API_KEY`

---

## Core modules for the Outreach tool

1) Companies
- career URL, notes, tags (domain/stack)

2) Contacts (recruiters/hiring managers)
- linked to company
- status + notes/personalization hooks

3) Templates
- subject/body templates with placeholders

4) AI Drafts
- draft emails stored separately from sent emails
- drafts include “portfolio proof” references (projects/skills used)

5) Outreach Log (core)
- what you actually sent (subject/body snapshot)
- status + follow-up scheduling

6) Follow-ups + reminders
- scheduler creates reminders (reuses Notifications)

7) Analytics
- computed metrics from outreach history (no fake trends)

---

## Portfolio-aware drafting (what makes it strong)

When generating an email draft, the system can pull:
- 1–2 relevant **published Projects** (title + shortDescription + tech)
- relevant Skills/Experience highlights
- Settings (name, links, resume URL) for a consistent signature

This turns your outreach into “evidence-based” messaging rather than generic buzzwords.
