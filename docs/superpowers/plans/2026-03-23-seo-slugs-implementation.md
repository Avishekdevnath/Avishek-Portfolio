# SEO Slugs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build canonical SEO-friendly slug support for blogs and projects with auto/manual editor control, slug history, and permanent redirects for renamed URLs.

**Architecture:** Shared pure slug helpers in `src/lib` will own normalization, uniqueness, history updates, and editor auto/manual transitions. Blogs stay slug-routed and projects migrate from `_id`-based public URLs to slug-based public URLs, while legacy requests resolve to the canonical slug and redirect permanently.

**Tech Stack:** Next.js App Router, TypeScript, Mongoose, React, Node test runner (`node --import tsx --test`), TSX

---

## Context

- Spec: `docs/superpowers/specs/2026-03-23-seo-slugs-design.md`
- Use `@test-driven-development` for every behavior change.
- Use `@verification-before-completion` before claiming the feature is complete.
- Do not refactor unrelated dashboard/auth code while doing this work.

## File Map

### Core slug logic

- Create: `src/lib/slug.ts`
  - Pure helpers for normalization, uniqueness suffixing, slug history updates, and legacy ObjectId detection.
- Create: `src/lib/slug.test.ts`
  - Unit tests for shared slug behavior.
- Create: `src/lib/slug-editor.ts`
  - Pure helpers for auto/manual/regenerate editor state.
- Create: `src/lib/slug-editor.test.ts`
  - Unit tests for editor slug state transitions.

### Blog domain

- Create: `src/lib/blogs.ts`
  - Canonical slug lookup helpers, old-slug resolution, and redirect metadata helpers.
- Create: `src/lib/blogs.test.ts`
  - Unit tests for blog slug resolution.
- Modify: `src/models/Blog.ts`
  - Add `slugHistory` and `slugMode`; keep migration-safe slug indexing and remove duplicated ad-hoc slug generation in favor of shared helpers.
- Modify: `src/app/api/blogs/route.ts`
  - Use shared slug helpers during create.
- Modify: `src/app/api/blogs/[slug]/route.ts`
  - Use shared slug helpers during update and old-slug resolution for GET/PUT/DELETE/PATCH.
- Modify: `src/app/api/blogs/[slug]/comments/route.ts`
- Modify: `src/app/api/blogs/[slug]/like/route.ts`
- Modify: `src/app/api/blogs/[slug]/share/route.ts`
- Modify: `src/app/api/blogs/[slug]/stats/route.ts`
- Modify: `src/app/api/blogs/[slug]/views/route.ts`
  - Resolve current blog by canonical slug or old slug before acting.
- Modify: `src/app/blogs/[slug]/page.tsx`
- Modify: `src/app/blogs/[slug]/metadata.ts`
- Modify: `src/app/blogs/[slug]/generateMetadata.ts`
  - Redirect old slugs and emit canonical URLs only.

### Project domain

- Modify: `src/models/Project.ts`
  - Add `slug`, `slugHistory`, and `slugMode` with a migration-safe unique sparse or partial index.
- Modify: `src/lib/projects.ts`
  - Add slug-aware public lookup and legacy `_id` redirect resolution; serialize slug fields.
- Create: `src/lib/projects-slug.test.ts`
  - Unit tests for project slug resolution.
- Create: `src/app/projects/[slug]/page.tsx`
  - Canonical public project page; redirect old slugs and legacy ObjectIds.
- Delete: `src/app/projects/[id]/page.tsx`
  - Remove the old dynamic route after the new slug route is in place.
- Modify: `src/app/api/projects/route.ts`
  - Accept optional `slug` and `slugMode` on create; generate slug for new projects.
- Modify: `src/app/api/projects/[id]/route.ts`
  - Persist slug changes and slug history on update while keeping admin `_id` API stable.
- Modify: `src/components/ProjectDetails.tsx`
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/pages/home/Projects.tsx`
- Modify: `src/app/dashboard/projects/page.tsx`
  - Switch all public-facing project links/previews to canonical slug URLs.
- Modify: `src/lib/notifications.ts`
  - Switch project notification URLs and payloads from `_id`-based public URLs to slug-based canonical URLs where applicable.
- Modify: `src/types/dashboard.ts`
  - Add slug-related project fields used by forms and dashboard lists.

### Editor UX and migration

- Modify: `src/components/dashboard/BlogForm.tsx`
  - Replace implicit auto-slug behavior with explicit auto/manual/regenerate controls.
- Modify: `src/components/dashboard/ProjectForm.tsx`
  - Add slug controls for new projects.
- Modify: `src/app/dashboard/projects/edit/[id]/EditForm.tsx`
  - Thread slug fields through the alternate edit flow.
- Create: `src/scripts/backfill-slugs.ts`
  - Backfill project slugs and missing blog slugs safely.
- Modify: `package.json`
  - Add a backfill script and, if useful, a local test shortcut.

## Chunk 1: Shared Slug Foundations

### Task 1: Shared Slug Utility

**Files:**
- Create: `src/lib/slug.ts`
- Test: `src/lib/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSlug, resolveAutoSlug, buildNextSlugHistory } from './slug';

test('normalizeSlug lowercases and hyphenates titles', () => {
  assert.equal(normalizeSlug('  My Great Project!  '), 'my-great-project');
});

test('resolveAutoSlug suffixes duplicates', async () => {
  const existing = new Set(['my-great-project']);
  const slug = await resolveAutoSlug('My Great Project', async (value) => existing.has(value));
  assert.equal(slug, 'my-great-project-1');
});

test('buildNextSlugHistory stores previous canonical slug once', () => {
  assert.deepEqual(
    buildNextSlugHistory('current-slug', 'next-slug', ['older-slug', 'current-slug']),
    ['older-slug', 'current-slug']
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/slug.test.ts`
Expected: FAIL because `src/lib/slug.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function normalizeSlug(input: string) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
```

Add `resolveAutoSlug`, `assertManualSlugAvailable`, `buildNextSlugHistory`, and `isLegacyObjectId` in the same file.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/slug.test.ts`
Expected: PASS for all slug utility tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/slug.ts src/lib/slug.test.ts
git commit -m "feat: add shared slug utility"
```

### Task 2: Editor Slug State Helper

**Files:**
- Create: `src/lib/slug-editor.ts`
- Test: `src/lib/slug-editor.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlugDraft, applyTitleToSlugDraft, applyManualSlugEdit, regenerateSlugDraft } from './slug-editor';

test('title changes update the slug while draft is auto', () => {
  const draft = createSlugDraft('First Title');
  const next = applyTitleToSlugDraft(draft, 'Second Title');
  assert.equal(next.slug, 'second-title');
  assert.equal(next.slugMode, 'auto');
});

test('manual edits lock the slug', () => {
  const draft = applyManualSlugEdit(createSlugDraft('First Title'), 'custom-url');
  const next = applyTitleToSlugDraft(draft, 'Second Title');
  assert.equal(next.slug, 'custom-url');
  assert.equal(next.slugMode, 'manual');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/slug-editor.test.ts`
Expected: FAIL because `src/lib/slug-editor.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export type SlugMode = 'auto' | 'manual';
```

Implement pure helper functions only; no React state in this file.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/slug-editor.test.ts`
Expected: PASS for auto/manual/regenerate transitions.

- [ ] **Step 5: Commit**

```bash
git add src/lib/slug-editor.ts src/lib/slug-editor.test.ts
git commit -m "feat: add slug editor state helpers"
```

## Chunk 2: Blog Canonical Slugs

### Task 3: Blog Model And Resolver Helpers

**Files:**
- Create: `src/lib/blogs.ts`
- Create: `src/lib/blogs.test.ts`
- Modify: `src/models/Blog.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCanonicalBlogSlug } from './blogs';

test('resolveCanonicalBlogSlug returns redirect metadata for old slugs', async () => {
  const result = await resolveCanonicalBlogSlug('old-title', {
    findBySlug: async (slug) => slug === 'current-title' ? { slug: 'current-title', slugHistory: [] } : null,
    findByHistory: async (slug) => slug === 'old-title' ? { slug: 'current-title', slugHistory: ['old-title'] } : null,
  });

  assert.equal(result.kind, 'redirect');
  assert.equal(result.slug, 'current-title');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/blogs.test.ts`
Expected: FAIL because `resolveCanonicalBlogSlug` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function resolveCanonicalBlogSlug(inputSlug: string, deps: ResolverDeps) {
  const canonical = await deps.findBySlug(inputSlug);
  if (canonical) return { kind: 'match', blog: canonical, slug: canonical.slug };
  const redirect = await deps.findByHistory(inputSlug);
  if (redirect) return { kind: 'redirect', blog: redirect, slug: redirect.slug };
  return { kind: 'missing' };
}
```

Update `Blog` schema to include:

```ts
slugHistory: { type: [String], default: [] },
slugMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
```

For legacy data safety, do not replace the existing migration-safe `slug` indexing pattern with a non-sparse unique index during this step.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/blogs.test.ts`
Expected: PASS for canonical/redirect/missing blog slug resolution.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blogs.ts src/lib/blogs.test.ts src/models/Blog.ts
git commit -m "feat: add blog slug resolution helpers"
```

### Task 4: Blog Routes And Pages

**Files:**
- Modify: `src/app/api/blogs/route.ts`
- Modify: `src/app/api/blogs/[slug]/route.ts`
- Modify: `src/app/api/blogs/[slug]/comments/route.ts`
- Modify: `src/app/api/blogs/[slug]/like/route.ts`
- Modify: `src/app/api/blogs/[slug]/share/route.ts`
- Modify: `src/app/api/blogs/[slug]/stats/route.ts`
- Modify: `src/app/api/blogs/[slug]/views/route.ts`
- Modify: `src/app/blogs/[slug]/page.tsx`
- Modify: `src/app/blogs/[slug]/metadata.ts`
- Modify: `src/app/blogs/[slug]/generateMetadata.ts`
- Test: `src/lib/blogs.test.ts`

- [ ] **Step 1: Extend the failing resolver tests first**

Add tests that cover:

```ts
test('manual duplicate blog slug throws a validation error', async () => {});
test('auto slug changes append the previous slug to history', async () => {});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/blogs.test.ts`
Expected: FAIL with missing conflict/history behavior.

- [ ] **Step 3: Write minimal implementation**

- Use shared helpers in blog create/update.
- On update:
  - regenerate slug only when `slugMode === 'auto'`
  - keep manual slug untouched unless user changed it
  - add previous slug to `slugHistory` when canonical slug changes
- Infer legacy `slugMode` conservatively during migration and backfill:
  - existing non-title-matching slugs => `manual`
  - generated missing slugs => `auto`
- In page/metadata handlers:
  - resolve current slug
  - `permanentRedirect('/blogs/' + canonicalSlug)` when an old slug is requested
- In action routes (`comments`, `like`, `share`, `stats`, `views`):
  - resolve the blog by canonical slug or `slugHistory` before acting
  - do not redirect mutation requests

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/blogs.test.ts`
Expected: PASS for blog slug create/update/redirect behavior.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/blogs/route.ts src/app/api/blogs/[slug]/route.ts src/app/api/blogs/[slug]/comments/route.ts src/app/api/blogs/[slug]/like/route.ts src/app/api/blogs/[slug]/share/route.ts src/app/api/blogs/[slug]/stats/route.ts src/app/api/blogs/[slug]/views/route.ts src/app/blogs/[slug]/page.tsx src/app/blogs/[slug]/metadata.ts src/app/blogs/[slug]/generateMetadata.ts src/lib/blogs.ts src/lib/blogs.test.ts
git commit -m "feat: add canonical blog slug redirects"
```

## Chunk 3: Project Public Slug Migration

### Task 5: Project Model And Slug Resolution

**Files:**
- Modify: `src/models/Project.ts`
- Modify: `src/lib/projects.ts`
- Create: `src/lib/projects-slug.test.ts`
- Modify: `src/types/dashboard.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublishedProjectRoute } from './projects';

test('legacy object id resolves to a redirect', async () => {
  const result = await resolvePublishedProjectRoute('65f111111111111111111111', {
    findPublishedById: async () => ({ _id: '65f111111111111111111111', slug: 'my-project', slugHistory: [] }),
    findPublishedBySlug: async () => null,
    findPublishedBySlugHistory: async () => null,
  });

  assert.equal(result.kind, 'redirect');
  assert.equal(result.slug, 'my-project');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/projects-slug.test.ts`
Expected: FAIL because `resolvePublishedProjectRoute` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

- Add `slug`, `slugHistory`, and `slugMode` to the project schema.
- Make slug uniqueness migration-safe:

```ts
slug: { type: String, unique: true, sparse: true }
```

or the equivalent partial unique index.
- Extend project serialization to include these fields.
- Add helpers in `src/lib/projects.ts`:
  - `getPublishedProjectBySlug`
  - `resolvePublishedProjectRoute`
  - `listProjectSlugs`
  - canonical project serialization including `slug`
- Keep admin update/delete APIs `_id`-based, but persist slug fields through them.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/projects-slug.test.ts`
Expected: PASS for canonical slug, old-slug redirect, legacy-id redirect, and missing project cases.

- [ ] **Step 5: Commit**

```bash
git add src/models/Project.ts src/lib/projects.ts src/lib/projects-slug.test.ts src/types/dashboard.ts
git commit -m "feat: add project slug resolution"
```

### Task 6: Public Project Route And Links

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`
- Delete: `src/app/projects/[id]/page.tsx`
- Modify: `src/components/ProjectDetails.tsx`
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/pages/home/Projects.tsx`
- Modify: `src/app/dashboard/projects/page.tsx`
- Modify: `src/lib/notifications.ts`
- Test: `src/lib/projects-slug.test.ts`

- [ ] **Step 1: Extend the failing test**

Add tests that assert related/public links use the canonical slug field rather than `_id`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/projects-slug.test.ts`
Expected: FAIL because callers still point to `_id`.

- [ ] **Step 3: Write minimal implementation**

- Replace the old public route with `src/app/projects/[slug]/page.tsx`.
- In that page:

```ts
if (resolved.kind === 'redirect') {
  permanentRedirect(`/projects/${resolved.slug}`);
}
```

- Preserve the current route-level behavior from `src/app/projects/[id]/page.tsx`:
  - `revalidate`
  - `runtime`
  - `generateStaticParams`
  - `generateMetadata`
- Swap static generation from ID listing to slug listing.
- Keep metadata canonical:
  - `url: ${siteUrl}/projects/${project.slug}`
- Update all public project links:
  - `ProjectCard`
  - `components/pages/home/Projects`
  - related project links in `ProjectDetails`
  - dashboard preview/view links
  - project notification `actionUrl` generation
- Keep admin edit links on `_id`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/projects-slug.test.ts`
Expected: PASS for route resolution behavior.

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/[slug]/page.tsx src/components/ProjectDetails.tsx src/components/ProjectCard.tsx src/app/dashboard/projects/page.tsx
git rm src/app/projects/[id]/page.tsx
git commit -m "feat: switch public project pages to slug urls"
```

## Chunk 4: Editor UX And Migration Script

### Task 7: Blog And Project Slug Controls

**Files:**
- Modify: `src/components/dashboard/BlogForm.tsx`
- Modify: `src/components/dashboard/ProjectForm.tsx`
- Modify: `src/app/dashboard/projects/edit/[id]/EditForm.tsx`
- Test: `src/lib/slug-editor.test.ts`

- [ ] **Step 1: Extend the failing test**

Add tests for:

```ts
test('regenerate resets a manual slug back to the title-derived slug', () => {});
test('manual slug input is normalized before submission', () => {});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/slug-editor.test.ts`
Expected: FAIL because regenerate/normalize behavior is not fully implemented.

- [ ] **Step 3: Write minimal implementation**

- Add slug UI to both blog and project create/edit flows:
  - slug text field
  - URL preview
  - auto/manual mode state
  - `Regenerate from title` button
- Reuse `src/lib/slug-editor.ts` helpers instead of in-component ad-hoc slug code.
- Ensure payloads include `slug` and `slugMode`.
- When loading existing content:
  - initialize `slugMode` from stored document data
  - do not silently downgrade legacy manual slugs back to auto

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import tsx --test src/lib/slug-editor.test.ts`
Expected: PASS for all auto/manual/regenerate state transitions.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/BlogForm.tsx src/components/dashboard/ProjectForm.tsx src/app/dashboard/projects/edit/[id]/EditForm.tsx src/lib/slug-editor.ts src/lib/slug-editor.test.ts
git commit -m "feat: add slug controls to dashboard editors"
```

### Task 8: Backfill Script And Final Verification

**Files:**
- Create: `src/scripts/backfill-slugs.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing dry-run assertion first**

Add a small pure helper test inside `src/lib/slug.test.ts` (or a new `src/lib/backfill-slug.test.ts`) for:

```ts
test('backfill keeps existing blog slugs and only generates missing ones', () => {});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test src/lib/slug.test.ts`
Expected: FAIL because the backfill selection helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

- Add script:

```ts
// src/scripts/backfill-slugs.ts
// 1. load blogs/projects
// 2. generate missing slugs
// 3. persist slugHistory: []
// 4. infer slugMode conservatively for legacy records
// 5. support dry-run logging before writes
```

- Add package script:

```json
"backfill:slugs": "tsx src/scripts/backfill-slugs.ts"
```

- [ ] **Step 4: Run tests and verification**

Run:

```bash
node --import tsx --test src/lib/slug.test.ts
node --import tsx --test src/lib/slug-editor.test.ts
node --import tsx --test src/lib/blogs.test.ts
node --import tsx --test src/lib/projects-slug.test.ts
npx tsc --noEmit
npm run lint
npm run build
```

Expected:

- All tests PASS
- TypeScript completes with exit code `0`
- Lint completes without errors
- Build completes successfully

- [ ] **Step 5: Commit**

```bash
git add src/scripts/backfill-slugs.ts package.json src/lib/slug.test.ts
git commit -m "feat: add slug backfill script and verification"
```

## Execution Notes

- Keep blog public URLs stable during the refactor. Existing slugs should continue to work.
- Do not convert admin edit/delete APIs from `_id` to slug in this batch.
- Because `src/app/projects/[id]/page.tsx` and `src/app/projects/[slug]/page.tsx` cannot coexist long-term, create the slug route and remove the old route in the same commit.
- If tests uncover that page-level redirects are too coupled to route handlers, move redirect decision logic into `src/lib/blogs.ts` and `src/lib/projects.ts` rather than duplicating it.
- Use permanent redirects for page requests only. API mutation endpoints should resolve aliases internally and operate on the canonical document without redirecting.

## Manual QA Checklist

- [ ] Create a new blog without typing a slug and confirm it gets a clean slug.
- [ ] Create a new blog with a manual slug and confirm title edits no longer overwrite it.
- [ ] Rename a published blog slug and confirm the old URL permanently redirects.
- [ ] Create a new project without typing a slug and confirm the public URL uses the slug, not `_id`.
- [ ] Visit a legacy project `_id` URL and confirm it permanently redirects to the slug URL.
- [ ] Rename a project slug and confirm related-project links and dashboard preview links point to the new canonical slug.
- [ ] Run the backfill script in dry-run mode before any real write against production data.
