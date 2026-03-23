# SEO-Friendly Slugs For Blogs And Projects

## Summary

Introduce a shared slug system for blogs and projects so public URLs are human-readable, SEO-friendly, and stable over time. The system should support:

- automatic slug generation from title
- manual slug override
- an optional editor workflow where auto mode stays active until a slug is manually touched
- explicit regeneration from title
- canonical slug routing
- slug history with `301` redirects when a slug changes

This change should unify the blog and project behavior while preserving existing links during migration.

## Current State

### Blogs

- Blogs already have a `slug` field and public routes use `/blogs/[slug]`.
- Slug generation logic exists in both the blog model and blog API routes.
- There is no slug history, so renamed blog URLs break.
- The editor auto-generates a slug from the title, but it does not model auto/manual editorial intent explicitly.

### Projects

- Projects do not have a persistent slug field.
- Public routes use `/projects/[id]` and project lookups are `_id`-based.
- Dashboard links, metadata generation, related project links, and API routes are tightly coupled to `_id`.

### SEO Implications

- Blog URLs are readable, but renames can break indexed URLs and shared links.
- Project URLs are not SEO-friendly because they expose database IDs instead of content-driven paths.
- Canonical URLs are not consistently derived from a single slug system.

## Goals

- Use SEO-friendly slugs for all public blog and project detail URLs.
- Keep old URLs working when a slug changes by redirecting to the latest canonical slug.
- Allow automatic slug generation by default.
- Allow manual custom slug editing when needed.
- Preserve editor control by locking slug updates after manual edits unless explicitly regenerated.
- Avoid duplicated slug logic across models and API routes.
- Migrate existing projects without breaking traffic.

## Non-Goals

- Full SEO overhaul of the entire site.
- Robots, sitemap, and search console work in the same batch.
- Cross-model global uniqueness between blogs and projects. Uniqueness is per content type.

## Product Decisions

### Canonical Routing

- Blogs remain on `/blogs/[slug]`.
- Projects move to `/projects/[slug]`.
- Canonical metadata and all internal links should use only the current slug.

### Redirect Policy

- If a slug changes, the previous slug is stored in `slugHistory`.
- Requests for an old page URL should return a permanent redirect to the current slug.
- Legacy project `_id` URLs should temporarily redirect to the canonical slug route during migration.
- API mutation endpoints should not redirect. They should resolve stale slugs internally and operate on the canonical document.

### Editor Workflow

- Each blog/project editor shows a `Slug` field.
- Default mode is `auto`.
- In `auto` mode, slug updates as the title changes.
- If the editor types into the slug field, mode becomes `manual`.
- In `manual` mode, title changes no longer overwrite the slug.
- A `Regenerate from title` action restores automatic behavior using a fresh generated slug.
- The field remains optional from the editor perspective. If untouched, the backend generates the slug.

## Data Model Design

### Shared Slug Fields

Add the following fields to blog and project documents:

- `slug: string`
- `slugHistory: string[]`
- `slugMode: 'auto' | 'manual'`

### Blog Model

- Keep `slug` unique and indexed.
- Add `slugHistory` with default `[]`.
- Add `slugMode` with default `'auto'`.
- Remove duplicate slug-generation behavior from scattered code paths and route logic through shared helpers.

### Project Model

- Add `slug` using a migration-safe unique sparse or partial index so existing records without slugs do not break index creation before backfill.
- Add `slugHistory` with default `[]`.
- Add `slugMode` with default `'auto'`.
- Change the virtual/public URL shape to use slug-based URLs instead of `_id`.

## Shared Slug Utility

Create a reusable slug module under `src/lib` that handles:

- slug normalization
- uniqueness resolution for a model
- slug mode transitions
- slug history updates
- canonical slug lookup
- legacy identifier detection where needed

### Normalization Rules

- lowercase all characters
- trim leading/trailing whitespace
- replace spaces and separators with `-`
- remove unsupported punctuation
- collapse repeated separators
- trim leading/trailing hyphens

### Uniqueness Rules

- For auto-generated slugs:
  - use normalized title
  - append `-1`, `-2`, and so on if needed
- For manual slugs:
  - normalize the submitted value
  - if it conflicts with another document, return a validation error rather than silently changing it

## API Behavior

### Create

- Accept optional `slug` and `slugMode`.
- If no slug is submitted, generate one from title in auto mode.
- If manual slug is submitted, normalize and validate uniqueness.
- Initialize `slugHistory` as `[]`.

### Update

- Accept optional `slug` and `slugMode`.
- If title changes while in auto mode, regenerate slug.
- If slug changes from the current canonical value:
  - add the previous slug to `slugHistory`
  - deduplicate `slugHistory`
- If manual slug conflicts with another document, reject the update with a clear error.
- If auto slug conflicts, suffix automatically.

### Lookup

- Blog page lookups should:
  - resolve current slug directly
  - if not found, check `slugHistory`
  - permanently redirect to current slug when matched via old slug
- Blog API lookups should:
  - resolve current slug directly
  - if not found, check `slugHistory`
  - use the canonical document internally rather than redirecting mutation requests
- Project page lookups should:
  - resolve current slug directly
  - if not found, check `slugHistory`
  - temporarily support legacy `_id` redirects during transition
  - permanently redirect to the canonical slug URL when matched via old slug or legacy `_id`
- Project API lookups should:
  - keep admin `_id` endpoints stable in this batch
  - resolve any stale slug aliases internally where slug-based APIs exist later

## Routing Design

### Blogs

- Keep `src/app/blogs/[slug]`.
- Update page metadata and related links to consistently use canonical slug resolution.

### Projects

- Replace the current public dependency on `[id]` with slug-first lookup.
- Canonical project detail route becomes `/projects/[slug]`.
- Keep a compatibility path for legacy `_id` access and redirect to slug-based URLs.

## Dashboard UX

### Blog Form

- Replace the current simple auto-slug behavior with explicit auto/manual state.
- Add:
  - slug input
  - URL preview
  - regenerate button
  - hidden/editor state for `slugMode`

### Project Form

- Add slug controls matching the blog editor behavior.
- Surface the final public URL preview.

### Validation UX

- Show normalized slug as the editor types.
- Show backend conflict errors clearly for manual collisions.
- Avoid silent rewrites of manually chosen slugs.

## Migration Plan

### Phase 1: Schema Compatibility

- Add slug-related fields to project and blog schemas.
- Ensure existing documents remain valid.

### Phase 2: Backfill

- Backfill slugs for all existing projects.
- Backfill blog slugs only for records missing a slug.
- Set `slugHistory` to `[]`.
- Infer legacy `slugMode` conservatively:
  - if an existing slug differs from the normalized title, set `slugMode` to `'manual'`
  - if a slug is missing and generated from title during backfill, set `slugMode` to `'auto'`
  - if an existing slug already matches the normalized title, either keep or set `'auto'`

### Phase 3: Redirect Safety

- Keep legacy project `_id` URLs alive temporarily.
- Redirect them permanently to canonical slug URLs.
- Use `slugHistory` to preserve renamed content URLs.

### Phase 4: Canonical Link Cleanup

- Update project cards, homepage featured project links, related links, metadata, dashboard preview links, and project notification action URLs to use slug URLs.

## Testing Strategy

### Unit Tests

- slug normalization
- uniqueness suffixing for auto mode
- manual conflict rejection
- slug history update rules
- old slug lookup resolution

### API Tests

- blog create with auto slug
- blog create with manual slug
- blog update causing slug history change
- project create with auto slug
- project create with manual slug
- project update causing slug history change
- duplicate manual slug rejection
- duplicate auto slug suffixing

### Route Tests

- canonical slug resolves successfully
- old slug returns redirect to current slug
- legacy project `_id` returns redirect to canonical slug
- unknown slug returns `404`

## Rollout Order

1. Add shared slug utility.
2. Update blog and project models.
3. Refactor blog slug handling to shared logic.
4. Add project slug handling and slug-based lookups.
5. Update public project routes and metadata generation.
6. Update dashboard forms and links.
7. Add migration/backfill script.
8. Verify redirects, canonical URLs, and internal links.

## Risks

- Project routing is currently deeply `_id`-based, so missing a single link path can leave inconsistent navigation.
- Existing project content needs careful backfill to avoid slug collisions.
- Redirect handling must be implemented consistently in both page and API lookup paths.

## Recommendation

Proceed with the shared slug system for both blogs and projects, including:

- canonical slug routing
- auto/manual editor control
- explicit regeneration from title
- slug history with `301` redirects
- temporary compatibility redirects for existing project `_id` URLs

This approach has the best long-term SEO value and removes the current inconsistency between blogs and projects.
