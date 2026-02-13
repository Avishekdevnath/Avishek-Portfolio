# ColdEmail Implementation Plan — Remaining Tasks

This plan outlines how to complete the ColdEmail feature based on the existing planning in `feedback/ColdEMail/`.

---

## Missing Components Overview

| Component | Status | Priority |
|-----------|--------|----------|
| Outreach Settings | ❌ Not in Settings model | High |
| OutreachDraft model | ❌ Missing | High |
| /api/outreach/ai/* | ❌ Missing | High |
| /dashboard/outreach/follow-ups | ❌ Missing | High |
| /dashboard/outreach/ai | ❌ Missing | High |
| /dashboard/outreach/analytics | ❌ Missing | Medium |
| Follow-up cron endpoint | ❌ Missing | Medium |
| AI draft generation | ❌ Missing | High |

---

## Implementation Order

### Step 1: Add Outreach Settings to Settings Model
Extend the existing Settings model to include outreach preferences.

**File:** `src/models/Settings.ts`

```typescript
// Add to existing Settings interface:
outreachSettings?: {
  defaultTone: 'professional' | 'friendly';
  defaultFollowUpGapDays: number;
  maxFollowUps: number;
  signatureSnippet?: string;
};
```

---

### Step 2: Create OutreachDraft Model
Store AI-generated drafts separately from sent emails.

**File:** `src/models/OutreachDraft.ts`

```typescript
{
  _id: ObjectId;
  contactId: ObjectId;
  companyId: ObjectId;
  intent: 'cold' | 'post_application' | 'follow_up';
  tone: 'professional' | 'friendly';
  jobTitle?: string;
  jobDescription?: string;
  selectedProjectIds?: [ObjectId];
  selectedSkillIds?: [ObjectId];
  selectedExperienceIds?: [ObjectId];
  subject: string;
  body: string;
  modelUsed?: string;
  createdAt: ISODate;
}
```

---

### Step 3: Create AI API Routes

#### `/api/outreach/ai/draft/route.ts`
Generate AI-assisted email drafts.

**Features:**
- Accept contactId, companyId, jobTitle, jobDescription
- Fetch portfolio context (projects, skills, experience)
- Generate draft using Gemini API
- Return editable draft with portfolio proof references

#### `/api/outreach/ai/improve/route.ts`
Improve existing email text.

**Features:**
- Accept current subject/body
- Support operations: shorten, clarify, confident
- Return improved version

#### `/api/outreach/ai/followup/route.ts`
Generate follow-up draft with timing suggestion.

**Features:**
- Accept original email context
- Suggest follow-up timing based on settings
- Generate follow-up draft

---

### Step 4: Create Follow-ups Dashboard Page

**File:** `src/app/dashboard/outreach/follow-ups/page.tsx`

**Features:**
- List emails where `followUpDate <= today` and `status=sent`
- Show overdue follow-ups first
- "Generate Follow-up" button (calls AI API)
- "Mark as Sent" button (increments followUpCount)
- Auto-stop after `maxFollowUps`

**UI Components:**
- Due Today section
- Overdue section
- Completed follow-ups (history)

---

### Step 5: Create AI Assistant Dashboard Page

**File:** `src/app/dashboard/outreach/ai/page.tsx`

**Features:**
- Form to generate new draft
  - Select contact/company
  - Enter job title/description
  - Select relevant projects/skills
- "Improve Existing" tab
  - Paste current email
  - Select improvement type
- Draft history (from OutreachDraft collection)
- "Copy to clipboard" and "Open email client" buttons

---

### Step 6: Create Follow-up Cron Endpoint

**File:** `src/app/api/outreach/cron/followups/route.ts`

**Logic:**
1. Query `outreachEmails` where:
   - `followUpDate <= today`
   - `status = 'sent'`
   - `followUpCount < maxFollowUps`
2. For each, create a Notification:
   - `type: 'system'`
   - `metadata.kind: 'outreach_follow_up_due'`
   - `metadata.outreachEmailId`
   - `actionUrl: '/dashboard/outreach/follow-ups'`

**Note:** This endpoint should be protected with a secret cron token.

---

### Step 7: Create Analytics Dashboard Page

**File:** `src/app/dashboard/outreach/analytics/page.tsx`

**Metrics to Compute:**

| Metric | Formula |
|--------|---------|
| Total Sent | Count `outreachEmails.status = 'sent'` |
| Reply Rate | `count(reply) / count(sent) * 100` |
| Per Template Reply Rate | Group by `templateId` |
| Per Company Reply Rate | Group by `companyId` |
| Best Follow-up Gap | Average days between sent and reply |
| Follow-up Effectiveness | `count(reply with followUp > 0) / count(with followUp)` |

**UI:**
- Summary cards (sent, replied, reply rate)
- Charts (optional - use existing chart library)
- Top performing templates table
- Recent activity feed

---

### Step 8: Add Email Log Actions

Extend `src/app/dashboard/outreach/log/page.tsx` with:

- "Schedule Follow-up" button
- "Mark as Replied" action (opens modal for outcome/note)
- "Close" action (for bounced/undeliverable)

---

## File Creation Order

```
1. src/models/OutreachDraft.ts
2. src/app/api/outreach/ai/draft/route.ts
3. src/app/api/outreach/ai/improve/route.ts
4. src/app/api/outreach/ai/followup/route.ts
5. src/app/api/outreach/cron/followups/route.ts
6. src/app/dashboard/outreach/follow-ups/page.tsx
7. src/app/dashboard/outreach/ai/page.tsx
8. src/app/dashboard/outreach/analytics/page.tsx
```

---

## Dependencies to Reuse

- **Gemini API:** Already exists in `src/app/api/tools/route.ts` via `GOOGLE_AI_API_KEY`
- **Notifications:** Existing `Notification` model + `/dashboard/notifications`
- **Projects/Skills/Experience:** Existing models for portfolio context
- **Auth:** Existing `auth=true` cookie pattern

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Settings extension | 1 hour |
| OutreachDraft model | 1 hour |
| AI API routes | 4-6 hours |
| Follow-ups page | 2-3 hours |
| AI Assistant page | 4-5 hours |
| Analytics page | 3-4 hours |
| Cron endpoint | 1-2 hours |
| Testing & polish | 2-3 hours |

**Total: ~18-24 hours**
