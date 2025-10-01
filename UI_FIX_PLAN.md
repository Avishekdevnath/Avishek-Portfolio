## Project Details UI Fix Plan

### 1) Decide visual direction
- Choose one consistent card/border style across the page:
  - Poster style: `bg-white rounded-xl border-2 border-black`
  - Soft ring style: `bg-white rounded-xl ring-1 ring-gray-200 shadow-sm`
- Apply the chosen style to: page wrapper cards, description, repositories, demo links, gallery, related projects, and the main image container.

### 2) Unify section cards
- Replace mixed classes like `bg-white/60 backdrop-blur-sm border border-gray-200/50` with the chosen style.
- Remove `backdrop-blur-sm` everywhere for consistency and performance.

### 3) Spacing scale
- Standardize to: section padding `p-6`, outer gaps `gap-6`, section spacing `mb-8`.
- Keep grid gutter consistent: `gap-6` for 1–2 column layouts.

### 4) Typography rhythm
- Headings: H1 `text-3xl`, section titles H2 `text-2xl`, subheaders H3 `text-xl`.
- Body text: `text-base leading-relaxed`.
- Clamp long blurbs (shortDescription) to 3 lines.

### 5) Color and contrast
- Reduce gradients to H1 and primary buttons only.
- Ensure chips over images use `bg-black/60 text-white`.
- Keep overlay on image at least `opacity-40` always; increase on hover.

### 6) Primary actions (CTAs)
- Use solid buttons: `bg-blue-600` (primary), `bg-gray-900` (secondary).
- Consistent icon size `w-4 h-4`.
- Add `focus-visible:ring-2 ring-offset-2 ring-blue-500`.

### 7) Lightbox accessibility
- Add `role="dialog" aria-modal="true"` and trap focus.
- Keyboard: ESC closes; Left/Right arrows navigate.
- Set initial focus to close button; return focus to opener.

### 8) Main image handling
- Use stable aspect ratio: `aspect-[16/10]` or `aspect-video` with responsive `max-h`.
- Keep `object-cover`; add `placeholder="blur"` if blurDataURL available.
- Use chosen border style on the container.

### 9) Technology chips
- Show up to 6 chips max; then `+N` overflow.
- Render Code icon only when no icon; avoid style-based hiding.

### 10) Empty states
- When no related projects: show placeholder copy and link to `/projects`.
- When no gallery images: hide section or show subtle placeholder.

### 11) Performance cleanup
- Remove `backdrop-blur-*` and heavy section gradients.
- Prefer solid backgrounds and minimal shadows.

### 12) Icon and link semantics
- Standardize icon sizes to `w-4 h-4`.
- Use `a` for external links with `rel="noopener noreferrer"`; use `Link` for internal.
- Add `aria-label` to icon-only links.

---

## Implementation order (recommended)
1. Decide style (Poster vs Soft ring) and update all section wrappers.
2. Normalize spacing and typography across the page.
3. Update main image container (aspect + border + overlay).
4. Unify CTAs and add focus-visible states.
5. Adjust chips (limit +N, icon logic).
6. Add empty states for related and gallery.
7. Add lightbox a11y (role, focus trap, keyboard handlers).
8. Remove blurs/gradients not in the chosen palette.

## Acceptance criteria
- Visual: Cards and image share the same border/ring style; consistent paddings.
- Type: H1/H2/H3 follow the defined scale; body is readable.
- A11y: Lightbox keyboard- and focus-accessible; CTAs have visible focus states; icon-only controls have `aria-label`s.
- Performance: No `backdrop-blur`; minimal gradients; images sized correctly.
- Content: Chips capped with `+N`; clear empty states when data is missing.
