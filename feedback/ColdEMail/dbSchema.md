# MongoDB Schema — Cold Outreach Tool (Aligned to This Repo)

This repo uses MongoDB + Mongoose and a single-owner dashboard protected by an `auth=true` cookie. Outreach data includes personal email addresses, so it should be stored separately and protected by owner-only APIs.

Notes:
- This repo does not have a `users` collection today. Keep it single-user.
- If you want future multi-user support, add an optional `userId` (default `"admin"`) like the existing `Notification` model.

---

## Collections (proposed)

### 1) `outreachCompanies`

```js
{
  _id: ObjectId,
  name: "Pathao",
  website?: "https://pathao.com",
  careerPageUrl?: "https://pathao.com/careers",
  tags?: ["logistics", "payments", "scale"],
  notes?: "Why I like them / what to mention",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Indexes:
- `name`
- `createdAt`

---

### 2) `outreachContacts`

```js
{
  _id: ObjectId,
  companyId: ObjectId,
  name: "Jane Doe",
  email: "jane@company.com",
  roleTitle?: "Technical Recruiter",
  linkedinUrl?: "https://linkedin.com/in/...",
  status: "new", // new | contacted | replied | closed
  lastContactedAt?: ISODate,
  notes?: "Personalization hooks",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Indexes:
- `email`
- `companyId`
- `status`

---

### 3) `outreachTemplates`

```js
{
  _id: ObjectId,
  name: "Cold intro (backend)",
  type: "cold", // cold | follow_up | referral | post_application
  tone: "professional", // professional | friendly
  subjectTemplate: "Backend Engineer - {{company}}",
  bodyTemplate: "Hi {{name}}, ...",
  variables: ["name", "company", "role", "project1", "project2"],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

### 4) `outreachDrafts` (AI-generated drafts, editable)

Drafts are separate from sent emails to keep “AI output” distinct from “human action”.

```js
{
  _id: ObjectId,
  contactId: ObjectId,
  companyId: ObjectId,
  intent: "cold", // cold | post_application | follow_up
  tone: "friendly",
  jobTitle?: "Backend Engineer",
  jobDescription?: "...",

  // Proof from your portfolio (references existing collections)
  selectedProjectIds?: [ObjectId], // references projects._id
  selectedSkillIds?: [ObjectId],   // if you choose to reference skills
  selectedExperienceIds?: [ObjectId],

  subject: "Following up on Backend Engineer at ...",
  body: "Hi ..., ...",
  modelUsed?: "gemini-pro",
  createdAt: ISODate
}
```

Indexes:
- `contactId`
- `companyId`
- `createdAt`

---

### 5) `outreachEmails` (core log — what you actually sent)

```js
{
  _id: ObjectId,
  contactId: ObjectId,
  companyId: ObjectId,

  templateId?: ObjectId,
  draftId?: ObjectId,

  subject: "Subject you sent",
  body: "Body you sent",

  status: "sent", // sent | replied | no_response | closed

  sentAt: ISODate,
  followUpDate?: ISODate,
  followUpCount: 0,
  closedAt?: ISODate,

  createdAt: ISODate,
  updatedAt: ISODate
}
```

Indexes:
- `contactId`
- `companyId`
- `status`
- `followUpDate`
- `sentAt`

---

### 6) `outreachFollowUpLogs` (optional, but clean)

```js
{
  _id: ObjectId,
  outreachEmailId: ObjectId,
  followUpNumber: 1, // 1 or 2
  sentAt: ISODate,
  generatedByAi: true,
  createdAt: ISODate
}
```

---

### 7) Reply outcomes (optional)

You can either:
- store reply fields directly on `outreachEmails`, or
- keep a dedicated `outreachReplies` collection.

Minimal (inline on `outreachEmails`):
```js
{
  replyReceivedAt?: ISODate,
  outcome?: "positive" | "neutral" | "rejection",
  replyNote?: "short summary"
}
```

---

## Reusing existing collections

### Notifications

Prefer reusing the existing `notifications` collection.

Option:
- store follow-up reminders as `type="system"` with metadata:
  - `metadata.kind = "outreach_follow_up_due"`
  - `metadata.outreachEmailId = ...`
  - `actionUrl = "/dashboard/outreach/follow-ups"`

### Settings

Extend the existing Settings document with:
```js
{
  outreachSettings: {
    defaultTone: "professional",
    defaultFollowUpGapDays: 7,
    maxFollowUps: 2
  }
}
```

---

## Security notes (important in this repo)

- Outreach emails/contacts are sensitive; protect `/api/outreach/*` with the same `auth` check used by the dashboard.
- Consider encrypting `outreachContacts.email` at rest if you ever deploy this publicly.
