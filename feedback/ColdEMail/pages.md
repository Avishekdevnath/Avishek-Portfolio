# Cold Outreach Tool (Cold Email) — Pages Plan (Aligned to This Repo)

Goal: build a private, owner-only outreach workflow **inside the existing portfolio dashboard**, using your existing portfolio content (Projects/Skills/Experience/Settings) as proof and context.

Constraints (portfolio-safe):
- Manual send only (copy/paste or `mailto:` helpers). No bulk sending.
- AI drafts and suggestions only; AI never sends or schedules.
- Follow-up rules enforced by the system (max follow-ups, minimum gap).
- Sensitive data (emails) must be protected at **UI + API** level.

---

## Where it lives

- Existing dashboard: `/dashboard` (already protected by password + `auth=true` cookie + middleware).
- Add a single sidebar item: **Outreach** → `/dashboard/outreach`.
  - Keep the global sidebar clean.
  - Inside `/dashboard/outreach`, use a secondary nav (tabs / subroutes).

Recommended internal routes:

```
/dashboard/outreach
/dashboard/outreach/companies
/dashboard/outreach/contacts
/dashboard/outreach/log
/dashboard/outreach/follow-ups
/dashboard/outreach/templates
/dashboard/outreach/ai
/dashboard/outreach/analytics
```

---

## Page-by-page (dynamic only)

### 1) Outreach Overview (`/dashboard/outreach`)
Purpose: “What needs attention right now?”

Shows (computed):
- Follow-ups due today / overdue
- Emails sent (7d/30d)
- Replies logged
- Active contacts (status != closed)

AI (optional):
- Small insight blocks based on real outreach data (no fake trends)

---

### 2) Companies (`/dashboard/outreach/companies`)
Purpose: store company context to personalize outreach.

Features:
- Add/edit company
- Career page URL
- Notes: why this company + what to mention
- Optional tags (domain/stack)

---

### 3) Contacts (`/dashboard/outreach/contacts`)
Purpose: manage recruiters / hiring managers.

Features:
- Add/edit contact
- Link contact → company
- Status: `new | contacted | replied | closed`
- Notes + “personalization hooks” field

---

### 4) Outreach Log (`/dashboard/outreach/log`) (core)
Purpose: track what you actually sent.

Features:
- List of outreach emails (subject/body snapshot)
- Status: `sent | replied | no_response | closed`
- Follow-up date + follow-up count
- Actions: mark as sent, mark as replied, close, schedule follow-up

Important:
- “Send” action is manual (copy + open email client).

---

### 5) Follow-ups (`/dashboard/outreach/follow-ups`)
Purpose: never miss a follow-up (without being spammy).

Features:
- Due today + overdue lists
- Generate follow-up draft (AI) and copy
- Mark follow-up sent (increments count, enforces hard cap)

---

### 6) Templates (`/dashboard/outreach/templates`)
Purpose: reusable email structures.

Features:
- Create/edit templates with placeholders
- Preview with sample data (contact + company + selected projects)
- Mark templates as “best performing”

AI (optional):
- Improve template wording (shorten/clarify/tone)

---

### 7) AI Assistant (`/dashboard/outreach/ai`)
Purpose: one place for AI help (explicit + ethical).

Features:
- Generate outreach email draft from:
  - contact + company context
  - job title + job description
  - selected portfolio proof (projects/skills)
- Improve existing email text (shorten/clarify/confident)
- Suggest follow-up timing + follow-up draft

Critical:
- AI output is always editable and never auto-sent.

---

### 8) Analytics (`/dashboard/outreach/analytics`)
Purpose: learn what works.

Metrics (computed):
- Reply rate overall + per template + per company
- Best follow-up gap
- Follow-up effectiveness (count vs reply rate)

No placeholders:
- Do not show “% change vs last period” unless you compute it.

---

## Integration with existing dashboard

- Notifications:
  - Reuse `/dashboard/notifications` for follow-up reminders.
  - Store outreach reminders as notifications with `actionUrl` pointing into the outreach module.
- Settings:
  - Add an “Outreach settings” section under existing `/dashboard/settings`:
    - default follow-up gap (days)
    - max follow-ups (hard cap = 2)
    - default tone
    - signature snippet (links pulled from existing Settings)

---

## Why this aligns with the portfolio project

This tool is not a separate app — it reuses your existing portfolio admin + content:
- Pulls **Projects/Skills/Experience** as proof points for emails.
- Uses **Settings** (bio/links/resume URL) for consistent branding.
- Uses **Notifications** for follow-up reminders.

That makes the system cohesive and interview-defensible: backend ownership + product workflow + ethical AI.
