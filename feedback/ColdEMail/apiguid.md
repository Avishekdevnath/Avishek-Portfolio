# API Guide — Cold Outreach Tool (Aligned to This Repo)

This repo already has public portfolio APIs (projects/blogs/etc). Outreach data is sensitive, so outreach APIs should be **owner-only**.

Recommended approach:
- Put all outreach endpoints under `/api/outreach/*`
- Enforce auth at the API layer by checking the `auth=true` cookie (do not rely only on UI route protection)
- Add input validation + rate limits on AI endpoints

---

## Auth model in this repo (current reality)

- Login: `POST /api/auth/login` sets cookie `auth=true`
- Middleware blocks `/dashboard/*` if cookie not present

For outreach:
- Add an auth guard in each `/api/outreach/*` handler, or
- Expand middleware matcher to include `/api/outreach/:path*`

---

## API groups

### 1) Companies

- `GET /api/outreach/companies`
  - list companies (search, tags)
- `POST /api/outreach/companies`
  - create company
- `GET /api/outreach/companies/:id`
- `PATCH /api/outreach/companies/:id`
- `DELETE /api/outreach/companies/:id` (soft delete recommended)

---

### 2) Contacts (recruiters / hiring managers)

- `GET /api/outreach/contacts`
  - list contacts (filter by status/company)
- `POST /api/outreach/contacts`
  - create contact
- `GET /api/outreach/contacts/:id`
- `PATCH /api/outreach/contacts/:id`
- `DELETE /api/outreach/contacts/:id`

Status values:
- `new | contacted | replied | closed`

---

### 3) Templates

- `GET /api/outreach/templates`
- `POST /api/outreach/templates`
- `GET /api/outreach/templates/:id`
- `PATCH /api/outreach/templates/:id`
- `DELETE /api/outreach/templates/:id`

---

### 4) AI Drafting (human-in-the-loop)

No sending endpoint exists.

- `POST /api/outreach/ai/drafts`
  - generate an outreach draft (uses contact/company + portfolio context)
- `GET /api/outreach/ai/drafts`
  - list drafts
- `DELETE /api/outreach/ai/drafts/:id`
  - delete a draft

- `POST /api/outreach/ai/improve`
  - rewrite text (shorten/clarify/confident)

- `GET /api/outreach/ai/follow-up-suggestion?outreachId=...`
  - suggest follow-up timing + draft

Provider:
- reuse the existing Gemini integration pattern (GOOGLE_AI_API_KEY) or keep provider pluggable

---

### 5) Outreach log (core)

- `GET /api/outreach/emails`
  - list sent outreach emails
- `POST /api/outreach/emails`
  - create an outreach record (after manual send)
  - enforces follow-up rules

- `GET /api/outreach/emails/:id`
- `PATCH /api/outreach/emails/:id`
  - mark replied/closed
  - update followUpDate (within allowed constraints)

Optional:
- `POST /api/outreach/emails/:id/follow-ups`
  - log a follow-up was sent (increments followUpCount, hard cap)

Status values:
- `sent | replied | no_response | closed`

---

### 6) Follow-ups due

Two options:

Option A (simple):
- `GET /api/outreach/follow-ups/due?date=YYYY-MM-DD`
  - computed list from OutreachEmail.followUpDate + status + count

Option B (reuse existing Notifications):
- A daily cron creates Notification records for due follow-ups
- UI uses `/dashboard/notifications` + link into `/dashboard/outreach/follow-ups`

---

### 7) Analytics

- `GET /api/outreach/analytics/summary`
  - reply rate, best template, best follow-up gap
- `GET /api/outreach/analytics/templates`
  - template performance breakdown
- `GET /api/outreach/analytics/companies`
  - company-wise outcomes

All values must be computed from outreach records (no placeholder trends).

---

### 8) Cron / background jobs (follow-up reminders)

If you deploy on Vercel:
- create a cron job that calls:
  - `POST /api/cron/outreach-followups`

Logic:
```
IF today >= followUpDate
AND status == sent
AND followUpCount < maxFollowUps
THEN create notification/reminder
```

---

## Context sources (reuse existing portfolio data)

AI routes can read existing portfolio data to generate proof-backed emails:
- `/api/settings` (bio, links, resumeUrl)
- `/api/projects?status=published` (projects to mention)
- `/api/skills?status=published` and `/api/experience` (optional highlights)

---

## One end-to-end flow (example)

“I want to email a recruiter about a Backend Engineer role”
1. Create company + contact
2. Use AI draft generation (auto-select relevant projects)
3. Copy & send manually
4. Create outreach record + followUpDate
5. Scheduler creates reminders
6. Mark reply outcome when it happens
7. Analytics computes what worked
