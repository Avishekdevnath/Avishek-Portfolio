# Public Blog Page Typography Harmonization Plan

## Objectives
- Eliminate font-size inconsistencies between editor, public blog page, and dashboard.
- Use a single, tokenized typography system (CSS variables/util classes) for predictable sizing.
- Ensure compact readability (like the editor) while preserving accessibility.

## Current Issues (Observed)
- Page title size differs between hero and non-hero headers.
- Meta row (author/date/category) mixes sizes; category chip slightly larger.
- Stats row (read time/views/comments/likes) is larger than meta row and has looser gaps.
- Tags, back button, and "About the Author" use larger sizes than surrounding UI.
- Comments form and list typography is not aligned with the page’s compact scale.
- Mixed usage of ad‑hoc Tailwind sizes instead of standardized tokens.
- Mobile view keeps roomy sizes for meta/author/stats; needs downscaling.

## Typography Decisions (Single Scale)
- Page Title (H): desktop `text-h2`, mobile `text-h3`.
- Section Title: `text-h4` (major), `text-h5` (minor).
- UI Body: `text-body-sm` (14px) for most UI texts.
- UI Labels/Microcopy: `text-caption` (12px) for labels, hints, timestamps.
- Chips/Badges: `text-xs` with compact padding.
- Buttons: `text-button` (14px) with compact padding.

## Token Mapping (Use existing utilities)
- Headings: `text-h1`..`text-h6` (CSS variables in globals.css)
- Body: `text-body`, `text-body-sm`, `text-body-xs`
- UI Small: `text-caption`, `text-small`, `text-button`
- Tables: `text-table-header`, `text-table-cell`

## Page-Specific Targets (Public Blog)
1) Title (Hero/No-hero)
   - Standardize to: desktop `text-h2`, mobile `text-h3`.
2) Meta Row (author/date/category)
   - Entire row: `text-sm`.
   - Category chip: `text-xs` with compact px/py.
3) Back Button
   - Use `text-button` sizing with compact px/py.
4) Stats Row (read time, views, comments, likes)
   - Entire row: `text-xs`, icons 12–14px, reduced gaps.
5) Tags
   - `text-xs`, consistent compact padding.
6) Author Section
   - Section heading: `text-h5`.
   - Author name: `text-sm`.
   - Bio: `text-xs`, tightened line-height.
   - Avatar: 40–48px; social icons 12–14px.
7) Comments Section
   - Heading: `text-h4`.
   - Labels/help text: `text-caption`.
   - Inputs/textarea: compact heights; text `text-sm`.
   - Button: `text-button`.

## Responsive Rules
- Mobile (< md): downscale meta/stats/tags/author/comments to `text-xs` where appropriate.
- Desktop (≥ md): use targets above; avoid exceeding `text-h2` for titles on content pages.

## Implementation Steps
1) Audit and Inventory
   - Capture all font-size utilities on `src/app/blogs/[id]/page.tsx` and `src/components/CommentSection.tsx`.
2) Replace Ad‑Hoc Sizes with Tokens
   - Swap Tailwind `text-*` classes to the standardized tokens (e.g., `text-h5`, `text-caption`, `text-button`).
3) Normalize Spacing
   - Ensure meta/stats/tags use `text-xs`/`text-sm` consistently with compact gaps.
4) Align Icons
   - Set icons to 12–14px where text is `text-xs`/`text-sm`.
5) Apply Compact Prose
   - Keep `.prose-compact` on article content to mirror editor spacing.
6) Responsive Pass
   - Add mobile breakpoints to downscale meta/stats/tags/author/comments.
7) Accessibility Pass
   - Where `text-xs` is used in longer content, bump color from `text-gray-500` to `text-gray-600/700`.

## Validation Checklist
- Title hierarchy: page H uses `text-h2`/`text-h3`, sections `text-h4/5`.
- Meta row fully `text-sm`; chips `text-xs`.
- Stats row fully `text-xs`; icons align visually.
- Back/utility buttons at `text-button` with compact padding.
- Tags at `text-xs` with consistent chip style.
- Author section matches: title `text-h5`, name `text-sm`, bio `text-xs`.
- Comments: heading `text-h4`, labels `text-caption`, fields `text-sm`, button `text-button`.
- Mobile view uses smaller sizes for meta/stats/author/tags/comments.
- Contrast: small text is adequately legible.

## Rollout Plan
1) Finalize public blog page.
2) Apply the same tokenized system to: projects, tools, dashboard post list/details.
3) Create a quick visual regression checklist per page.

## Risks & Mitigations
- Risk: Overly small text hurts readability on low-DPI screens.
  - Mitigation: Keep long-form text at `text-body` inside prose; use `text-xs` sparingly.
- Risk: Ad-hoc overrides reintroduced by future edits.
  - Mitigation: Document tokens and enforce via code review.

## Ownership
- Primary: Frontend maintainers.
- Review: Design owner for visual consistency.


