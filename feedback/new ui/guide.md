# Portfolio UI/UX Redesign Guide

> Adopt the design language from `portfolio.html` into the existing Next.js + Tailwind codebase.
> **Do NOT** rebuild as static HTML. Keep all backend, CMS, routing, blog, and dashboard functionality.

---

## Summary of Changes

| Area | Current | Target |
|------|---------|--------|
| Color palette | Blue `#007AFF` / gray neutral | Warm cream `#f0ece3` / ink `#2a2118` / orange `#d4622a` / teal `#3a7d6e` |
| Headings font | Inter (sans) | Cormorant Garamond (serif) |
| Label/tag font | Inter (sans) | DM Mono (monospace) |
| Body font | Inter / Merriweather | DM Sans (sans) |
| Visual tone | Clean corporate blue | Warm editorial / artisan |
| Section patterns | Simple heading + content | Eyebrow label + serif heading + muted subtitle |
| Project cards | Basic grid | Filtered grid with search + category badges + thumbnails |
| Contact page | Simple form | Availability grid + sticky sidebar + structured form |
| Tools page | External redirect | Full tools showcase with terminal mockup |

---

## Phase 1 — Design Tokens & Typography

**Priority: HIGH** | **Files to change:**
- `tailwind.config.js`
- `src/app/globals.css`
- `src/app/layout.tsx` (Google Fonts import)

### 1.1 Add Google Fonts

In `src/app/layout.tsx`, add the new font imports via `next/font/google`:

```
Cormorant Garamond — weights: 300, 400, 600 (normal + italic)
DM Sans — weights: 300, 400, 500
DM Mono — weights: 400, 500
```

Keep Inter as fallback but DM Sans becomes the primary body font.

### 1.2 Update Tailwind Color Tokens

Replace the current palette in `tailwind.config.js`:

```js
colors: {
  cream:        { DEFAULT: '#f0ece3', dark: '#e8e2d6', deeper: '#ddd5c5' },
  sand:         '#c9b99a',
  'warm-brown': '#8b7355',
  'deep-brown': '#4a3728',
  ink:          '#2a2118',
  white:        '#faf8f4',
  'text-muted': '#8a7a6a',
  accent: {
    orange: '#d4622a',
    teal:   '#3a7d6e',
    blue:   '#2d5a8e',
  },
  // Keep existing gray scale for dashboard (don't break admin UI)
}
```

### 1.3 Update CSS Custom Properties in globals.css

Add the new design tokens as CSS variables in `:root`:

```css
:root {
  --cream: #f0ece3;
  --cream-dark: #e8e2d6;
  --cream-deeper: #ddd5c5;
  --sand: #c9b99a;
  --warm-brown: #8b7355;
  --deep-brown: #4a3728;
  --ink: #2a2118;
  --accent-orange: #d4622a;
  --accent-teal: #3a7d6e;
  --accent-blue: #2d5a8e;
  --white: #faf8f4;
  --text-muted: #8a7a6a;
}
```

### 1.4 Add Font Family Utilities in Tailwind

```js
fontFamily: {
  heading: ['Cormorant Garamond', 'serif'],
  body:    ['DM Sans', 'sans-serif'],
  mono:    ['DM Mono', 'monospace'],
  ui:      ['Inter', 'system-ui', 'sans-serif'], // keep for dashboard
}
```

### 1.5 Update `body` Base Styles

```css
body {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  color: var(--ink);
}
```

> **Scope guard:** Dashboard routes (`/dashboard/*`) should keep the current Inter/gray/white styling. Add a CSS scope or conditional class on `<body>` to prevent dashboard breakage.

---

## Phase 2 — Shared Components

**Priority: HIGH** | **Files to change:**
- `src/components/shared/Header.tsx` + `Header.module.css`
- `src/components/shared/Footer.tsx`
- New: `src/components/shared/SectionHeader.tsx`
- New: `src/components/shared/Tag.tsx`

### 2.1 Header Redesign

**Current:** White glassmorphism bar, Inter font, blue/gray links, orange "Hire Me" chip.
**Target:** Cream glassmorphism bar, serif logo, uppercase monospace nav links, orange pill CTA.

Changes:
- Background: `rgba(240, 236, 227, 0.9)` with `backdrop-filter: blur(18px)`
- Border bottom: `1px solid var(--cream-deeper)`
- Logo: Use `font-heading` (Cormorant Garamond), `text-ink`, `font-semibold`, `text-[1.4rem]`
- Nav links: `font-mono`, `text-[0.8rem]`, `uppercase`, `tracking-widest`, `text-warm-brown`
- Active/hover state: `text-ink` with `border-b-[1.5px] border-accent-orange`
- CTA button: `bg-accent-orange text-white rounded-full px-5 py-2 text-[0.8rem] font-medium`
- CTA hover: `bg-deep-brown -translate-y-px`
- Mobile menu: Full-screen cream overlay with large serif links

### 2.2 Footer Redesign

**Current:** Dark gray-900, 3-column grid.
**Target:** Dark ink background, horizontal flex layout with brand | links | copyright.

Changes:
- Background: `bg-ink`
- Brand: `font-heading text-cream text-[1.2rem] font-semibold`
- Links: `font-mono text-[0.75rem] uppercase tracking-widest text-sand` → hover `text-cream`
- Copyright: `font-mono text-[0.72rem] text-sand/40`
- Layout: `flex items-center justify-between flex-wrap gap-8 px-16 py-12`
- Border top: `1px solid rgba(201, 185, 154, 0.1)`
- Mobile: stack vertically, center text

### 2.3 New: SectionHeader Component

Create a reusable component for the section heading pattern used throughout the new design:

```tsx
// src/components/shared/SectionHeader.tsx
interface SectionHeaderProps {
  eyebrow: string;       // e.g. "What I do"
  title: string;         // e.g. "End-to-end backend ownership"
  subtitle?: string;     // optional description
  light?: boolean;       // for dark backgrounds
}
```

Styling:
- **Eyebrow:** `font-mono text-[0.7rem] tracking-[0.2em] uppercase text-accent-orange` with `::before` pseudo-element (1.5rem orange line)
- **Title:** `font-heading text-[clamp(2rem,4vw,3rem)] font-light text-ink leading-tight`
- **Subtitle:** `text-[0.92rem] text-text-muted max-w-[60ch] leading-relaxed font-light`
- **Light variant:** eyebrow in `text-sand`, title in `text-cream`

### 2.4 New: Tag Component

Replace scattered badge/chip classes with a unified Tag component:

```tsx
// src/components/shared/Tag.tsx
interface TagProps {
  children: string;
  variant?: 'default' | 'orange' | 'teal' | 'blue';
}
```

Styling:
- Base: `font-mono text-[0.6rem] tracking-wide px-2.5 py-1 rounded-full uppercase whitespace-nowrap`
- Default: `bg-cream-deeper text-warm-brown`
- Orange: `bg-accent-orange/12 text-accent-orange`
- Teal: `bg-accent-teal/12 text-accent-teal`
- Blue: `bg-accent-blue/12 text-accent-blue`

---

## Phase 3 — Home Page Sections

**Priority: HIGH** | **Files to change:**
- `src/components/pages/home/Hero.tsx` + `hero.module.css`
- `src/components/pages/home/About.tsx`
- `src/components/pages/home/Experience.tsx`
- `src/components/pages/home/Projects.tsx`
- `src/components/pages/home/Stats.tsx`
- `src/components/pages/home/Contact.tsx`
- New: `src/components/pages/home/MarqueeBar.tsx`
- New: `src/components/pages/home/Services.tsx`
- New: `src/components/pages/home/QuoteSection.tsx`
- New: `src/components/pages/home/CTABand.tsx`

### 3.1 Hero Section Redesign

**Current:** Profile image left, text right, gradient bg, typewriter effect.
**Target:** Text left with massive serif headline, stat cards right, scroll indicator, watermark text behind.

Layout:
```
[full viewport height, cream background]

    [Background watermark: "Backend" in huge transparent serif]

    [Grid: 1fr auto]
        [Left]
            Eyebrow: "Backend Engineer · System Design"
            Headline: "I build\nsystems that\n*last.*"  (serif, clamp 4rem–8rem)
            Subtext: description paragraph
            Buttons: [View Projects] [About Me]

        [Right]
            Stat cards (stacked vertically, right-aligned):
            - 3+ Years Building
            - 10k+ Students Taught
            - 500+ DSA Solved
            - 10+ Projects Shipped

    [Scroll indicator at bottom center: line + "scroll" text]
```

Key decisions:
- **Keep** the profile image? The new design drops it entirely. **Recommendation:** Keep a small profile image in the About section or Header, but remove it from the Hero. The stat cards are more impactful for a backend engineer's Hero.
- **Keep** the typewriter effect? **Recommendation:** Drop it. The serif headline with italic emphasis is stronger.
- **Keep** CMS integration for resume URL, social links, etc.

### 3.2 New: Marquee Bar

A horizontal scrolling tech ticker below the hero:

```tsx
// src/components/pages/home/MarqueeBar.tsx
// Dark ink background, monospace text, infinite CSS scroll
// Items: NestJS, PostgreSQL, TypeScript, System Design, RBAC, MongoDB, Python, etc.
```

CSS animation: `@keyframes marquee { from { translateX(0) } to { translateX(-50%) } }` at 30s linear infinite. Duplicate items for seamless loop.

### 3.3 New: Services Grid

Replace or enhance the current Experience section with a 3-column service card grid:

```
[6 cards in 3x2 grid with 1.5px gap borders]
  01 API Design & Architecture
  02 Database Engineering
  03 Auth & Access Control
  04 Background Processing
  05 Full-Stack Integration
  06 Technical Mentoring
```

Each card: white bg, emoji icon, serif heading, description paragraph, large translucent number watermark.

### 3.4 Featured Projects (Home)

Replace current project cards with a list/row layout:

```
[Numbered rows with borders]
  01 | BrainScale-CRM | Multi-tenant CRM... | [NestJS] [PostgreSQL] [RBAC] | →
  02 | IdentiFace     | Face recognition... | [Python] [MTCNN]             | →
  ...
```

Each row: number, project info (title + short desc), tags, arrow. Links to `/projects` page.

### 3.5 New: Quote Section

Dark brown (`deep-brown`) background, centered large italic serif quote:

```
" The job is not just delivery, but ownership — architecture, trade-offs, and long-term maintainability. "
— Avishek Devnath · Engineering Philosophy
```

### 3.6 Activity Section

Two-column layout:
- Left: Activity list (recent learning, current projects, ongoing work) with colored dots
- Right: Current tech stack cloud (pill-shaped tags with hover effects)

### 3.7 New: CTA Band

Reusable dark ink band with serif heading and action buttons:

```tsx
// src/components/pages/home/CTABand.tsx
interface CTABandProps {
  heading: string;       // with <em> for italic portion
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}
```

Styling: `bg-ink`, serif heading in cream, cream primary button, ghost secondary button.

---

## Phase 4 — About Page

**Priority: MEDIUM** | **Files to change:**
- `src/app/about/page.tsx`

### 4.1 About Hero

Two-column grid:
- Left: eyebrow label, large serif name ("Avishek / *Devnath*"), role in monospace, bio paragraph, action buttons
- Right: Profile placeholder/image with offset border frame, status badge ("Available for work" with green pulse dot), stats row

### 4.2 About Grid

2x2 card grid + full-width card:
- System Ownership (with tags)
- Academic Foundation (with tags)
- Full-width: Builder bio + what keeps me sharp

### 4.3 Core Expertise (Pillars)

Dark ink background, 4-column grid:
- Backend Architecture
- Database Design
- Auth & Security
- Teaching & Mentoring

Each: border card, emoji icon, serif heading, description, small pillar tags.

### 4.4 Timeline

Centered vertical timeline with alternating left/right cards:
- Work experiences and education entries
- Orange dot markers on center line
- Cards with hover shadow/lift
- Date + badge on opposite side

### 4.5 Philosophy Section

Cream-dark background, 3-column cards with left border accent:
- 01: Own the system, not the ticket
- 02: Teach to understand deeper
- 03: Constraints breed clarity

---

## Phase 5 — Projects Page

**Priority: HIGH** | **Files to change:**
- `src/app/projects/page.tsx`
- `src/components/ProjectCard.tsx`
- `src/components/ProjectGrid.tsx`
- New: `src/components/ProjectFilters.tsx`

### 5.1 Dark Hero Header

Ink background with large serif title, description, stats row (projects shipped, packages, production systems). Background watermark text "Projects".

### 5.2 Sticky Filter Bar

Below hero, sticky at top:
- Left: Filter buttons (All, Web Dev, Machine Learning, NPM Package, Python Package)
- Right: Search input with icon
- Styling: `bg-cream-dark`, monospace filter buttons, `rounded-full` pills

### 5.3 Project Cards Redesign

Three-column grid with cards:
- Color-coded thumbnails by category (gradient backgrounds)
- Category badge in thumbnail corner
- Serif title, description, tech tags, action links (Code / Demo / Details)
- `.large` variant spans 2 columns for featured projects
- Hover: lift + shadow + border color change

### 5.4 Client-Side Filtering

```tsx
// src/components/ProjectFilters.tsx
// Manages active filter state + search query
// Filters ProjectCard visibility via category match + text search
// Updates count display: "Showing X projects"
```

---

## Phase 6 — Skills Page

**Priority: MEDIUM** | **Files to change:**
- `src/app/tools/page.tsx` (or create `src/app/skills/page.tsx`)

### 6.1 Tab Navigation

Sticky tab bar below hero:
- Tabs: Programming, Software, Languages, DSA
- Monospace text, uppercase, orange active underline

### 6.2 Programming Tab

- 2-column proficiency cards (Backend Languages, Backend Frameworks, Databases, Frontend)
- Each card: rows with skill name, percentage, animated fill bar
- Below: Pill clouds for ORM & Data Layer, AI/ML Libraries

### 6.3 Software Tab

- Same proficiency card layout for DevOps, Dev Environment, Architecture Concepts, Testing
- Additional tools pill cloud

### 6.4 Languages Tab

- 3-column cards for human languages (Bengali, English, Hindi)
- Dot-based proficiency indicator
- Technical Communication section with pills

### 6.5 DSA Tab

- Dark hero card with stats (500+, C++, CF, Active)
- Topics grid with colored dots and problem counts

---

## Phase 7 — Tools Page

**Priority: MEDIUM** | **Files to change:**
- `src/app/tools/page.tsx` (currently redirects externally — convert to real page)

### 7.1 Terminal Mockup

Ink background section with a styled terminal:
- macOS-style title bar (red/yellow/green dots)
- `cat stack.json` command with syntax-highlighted JSON output
- Blinking cursor animation

### 7.2 Categorized Tool Cards

4-column grid, organized by category:
- Code & Editor (VS Code, Git, WSL2, Jupyter)
- API & Database (Postman, Insomnia, TablePlus, Swagger)
- Deployment & Infra (Docker, Vercel, Railway, AWS)
- Productivity (Notion, Claude/ChatGPT, Figma, GitHub Actions)

Each card: icon, name, description, usage badge (Daily / Often / Sometimes) with color coding.

### 7.3 Setup Section

Two-column grid:
- Hardware card (laptop, display, tablet)
- Software Configuration card (theme, font, shell, package managers)

### 7.4 Workflow Steps

4-step horizontal flow with connecting line:
1. Schema First
2. Contract Design
3. Build & Test
4. Ship & Monitor

---

## Phase 8 — Contact Page

**Priority: HIGH** | **Files to change:**
- `src/app/contact/page.tsx`

### 8.1 Contact Hero

Dark ink background, two-column:
- Left: Serif heading "Let's build something *together.*", subtitle, availability badge (green pulse dot)
- Right: Contact method cards (Email, LinkedIn, GitHub, Resume) with hover slide effect

### 8.2 Contact Main (Two-Column)

- **Left (sticky):** "What I'm open to" section with:
  - Response time info
  - Email link
  - Location + remote note
  - Availability grid (Full-time: Open, Freelance: Open, Remote: Preferred, Contract: Case by case) with colored status dots

- **Right:** Contact form card:
  - Two-column row: Name + Email
  - Subject dropdown (Full-time Opportunity, Freelance Project, Collaboration, etc.)
  - Budget/Timeline (optional)
  - Message textarea
  - Submit button (full-width, ink bg, orange hover)
  - Note: "No spam, no newsletters."
  - Success state with icon

### 8.3 Location Section

Cream-dark background:
- Left: Dark visual block with "BD" watermark + bouncing pin emoji
- Right: Location info, timezone, remote preference, languages

### 8.4 Social Links Section

Centered section with button-style social links (Email, GitHub, LinkedIn, Twitter, Resume).

---

## Phase 9 — Animations & Micro-interactions

**Priority: LOW** | **Files to change:**
- `tailwind.config.js` (keyframes)
- `src/app/globals.css`

### 9.1 New Keyframes to Add

```js
// tailwind.config.js keyframes
pageIn:    { from: { opacity: 0, translateY: '12px' }, to: { opacity: 1, translateY: 0 } }
bob:       { '0%,100%': { translateY: 0 }, '50%': { translateY: '6px' } }
marquee:   { from: { translateX: 0 }, to: { translateX: '-50%' } }
pulse-dot: { '0%,100%': { boxShadow: '0 0 0 3px rgba(58,176,122,.2)' }, '50%': { boxShadow: '0 0 0 6px rgba(58,176,122,.1)' } }
```

### 9.2 Hover Effects

- Stat cards: `hover:translate-x-[-4px]`
- Service cards: `hover:bg-cream`
- Project rows: arrow slides right `hover:translate-x-1 hover:text-accent-orange`
- Pillar cards: `hover:translate-y-[-3px] hover:border-sand`
- Tool cards: `hover:translate-y-[-2px] hover:shadow-lg`
- Social buttons: `hover:translate-y-[-2px] hover:border-accent-orange hover:text-accent-orange`

### 9.3 Skill Bar Animation

On visibility/tab switch, animate `.skill-fill` width from 0 to `data-w%` over 1.2s ease. Use Intersection Observer or tab-change callback.

---

## Phase 10 — Responsive Breakpoints

**Priority: MEDIUM** | **Files to change:** All component files from previous phases.

### Key Breakpoints (matching new design)

**`max-width: 1024px`**
- Pillars grid: 4 cols → 2 cols
- Tools grid: 4 cols → 2 cols
- Services grid: 3 cols → 2 cols

**`max-width: 768px`**
- Nav: hide desktop links, show hamburger
- Hero: single column, stat cards row-wrap
- About hero: single column
- About grid: single column
- Pillars: single column
- Timeline: hide center line, stack vertically
- Philosophy: single column
- Projects grid: single column, no `.large` span
- Proficiency cards: single column
- DSA hero card: 2 cols
- Tools grid: 2 cols
- Setup/workflow: single column
- Contact hero: single column
- Contact main: single column (sticky → static)
- Location grid: single column
- Section padding: `4rem` → `1.5rem` horizontal
- CTA band: stack vertically
- Footer: stack, center text

---

## Implementation Order

| Order | Phase | Effort | Impact |
|-------|-------|--------|--------|
| 1 | Phase 1 — Design Tokens & Typography | Small | Foundation for everything else |
| 2 | Phase 2 — Header & Footer | Small | Immediate visual transformation |
| 3 | Phase 3 — Home Page | Large | Most-visited page, biggest payoff |
| 4 | Phase 8 — Contact Page | Medium | High-conversion page |
| 5 | Phase 5 — Projects Page | Medium | Portfolio showcase |
| 6 | Phase 7 — Tools Page | Medium | New page, unique content |
| 7 | Phase 4 — About Page | Medium | Storytelling depth |
| 8 | Phase 6 — Skills Page | Medium | Detailed technical showcase |
| 9 | Phase 9 — Animations | Small | Polish layer |
| 10 | Phase 10 — Responsive | Medium | Cross-device verification |

---

## Scope Guards — What NOT to Change

- `/dashboard/*` routes — keep current Inter/gray/white admin UI
- `/login` page — keep current styling
- MongoDB models, API routes, CMS logic — no changes
- Blog system — keep current design (can redesign later as Phase 11)
- Framer Motion — keep using it; replace CSS-only animations from `portfolio.html` with Motion equivalents where appropriate
- SEO, metadata, OG tags — keep current setup
- Authentication, Cloudinary, Nodemailer — no changes

---

## File Impact Summary

### Modified Files
| File | Change Type |
|------|-------------|
| `tailwind.config.js` | Colors, fonts, keyframes, animations |
| `src/app/globals.css` | CSS variables, body styles, new utility classes |
| `src/app/layout.tsx` | Font imports |
| `src/app/page.tsx` | New home section order |
| `src/app/about/page.tsx` | Full redesign |
| `src/app/projects/page.tsx` | Dark hero + filter bar |
| `src/app/contact/page.tsx` | Full redesign |
| `src/app/tools/page.tsx` | Convert from redirect to full page |
| `src/components/shared/Header.tsx` | Styling + structure changes |
| `src/components/shared/Header.module.css` | New cream glassmorphism |
| `src/components/shared/Footer.tsx` | Layout + styling changes |
| `src/components/pages/home/Hero.tsx` | Full redesign |
| `src/components/pages/home/hero.module.css` | New hero styles |
| `src/components/pages/home/About.tsx` | Activity section redesign |
| `src/components/pages/home/Experience.tsx` | Services grid conversion |
| `src/components/pages/home/Projects.tsx` | Row-based featured list |
| `src/components/pages/home/Stats.tsx` | Stat cards in hero |
| `src/components/pages/home/Contact.tsx` | CTA band style |
| `src/components/ProjectCard.tsx` | New card design |
| `src/components/ProjectGrid.tsx` | Filtered grid with search |

### New Files
| File | Purpose |
|------|---------|
| `src/components/shared/SectionHeader.tsx` | Reusable eyebrow + title + subtitle |
| `src/components/shared/Tag.tsx` | Unified tag/badge component |
| `src/components/pages/home/MarqueeBar.tsx` | Scrolling tech ticker |
| `src/components/pages/home/Services.tsx` | 6-card services grid |
| `src/components/pages/home/QuoteSection.tsx` | Quote block |
| `src/components/pages/home/CTABand.tsx` | Reusable CTA section |
| `src/components/ProjectFilters.tsx` | Filter bar + search |
