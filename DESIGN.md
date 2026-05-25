# Design System — Feature Control · Data Safeguard

## Product Context

- **What this is:** Multi-tenant feature flag and runtime config management platform under the Data Safeguard product family. Author flags in a UI, evaluate them via a CDN endpoint, ship updates safely across environments.
- **Who it's for:** Platform engineers, DevOps, release managers, and approvers at SaaS companies that ship to many customer organizations.
- **Space:** Developer infrastructure / internal tooling. Peers: LaunchDarkly, Statsig, Flagsmith, Stripe's internal config tooling.
- **Project type:** Data-dense web app with both author plane (editing) and runtime plane (CDN serving SDKs).
- **Parent brand:** Data Safeguard (enterprise data-privacy / compliance / fraud-prevention product family). Feature Control is one product surface within that family.
- **Memorable thing:** "Bloomberg Terminal for feature flags — serious software where every pixel earns its place." Users live in this tool 8 hours a day. Every visual decision serves that working session, not a marketing flyby.

## Aesthetic Direction

- **Direction:** Refined data-dense (Stripe Dashboard family). The /design-shotgun session compared Linear editorial, Stripe-dense, and Terminal pro — user picked Stripe-dense.
- **Decoration level:** **Minimal**. Typography and color do all the work. No decorative borders, no gradient backgrounds in the app shell, no icon-in-colored-circle treatments. The /diff page's color-coded JSON view is the only "expressive" moment, and it earns its place because the data demands it.
- **Mood:** Calm density. The app should feel like the cockpit of a well-run release pipeline — dense, precise, slightly austere. Users should think *"competent"* in the first 3 seconds, not *"playful"* or *"powerful"*.
- **Reference:** Stripe Dashboard composition + Linear's information hierarchy + Vercel's keyboard-first feel.

## Typography

- **Display/Hero:** **Inter Tight**, weight 600, tight letter-spacing (-0.025em). Used only for page H1s (22-24px).
- **Body / UI:** **Inter Tight** at 13px for most surfaces, 12px for table cells and dense lists. 14px reserved for primary readable content (drawer descriptions, error states).
- **UI labels:** Same Inter Tight, weight 500 at 11-12px, neutral-medium color.
- **Data / Tables:** **JetBrains Mono** for flag keys, env IDs, version numbers (`v131`, `dep_xyz`), JSON values, hash bytes, ETags. CSS rule: `font-variant-numeric: tabular-nums` applied wherever numbers line up in columns.
- **Code (drawer JSON view):** JetBrains Mono 11-12px with 1.5 line-height.
- **Loading:** Google Fonts `<link>` tag — both families load via `preconnect` for ~50ms total. Same as today.
- **Scale (modular, weighted toward density):**
  - 28px / weight 600 → not currently used; reserved for dashboard hero numbers if we add one
  - 22px / weight 600 / -0.025em → **H1** (`.page-head h1`)
  - 17px / weight 600 → H2 (section dividers, drawer titles)
  - 14px / weight 500 → drawer descriptions, default body
  - 13px / weight 400 → table body cells, most UI text
  - 12px / weight 500 → labels, chip text
  - 11px / weight 500 → small labels, column headers (rare uppercase use)
  - 10px / weight 600 / +0.08em tracking → uppercase section labels (sidebar MANAGE / OPERATE)

## Color

- **Approach:** Restrained — cool neutral palette + single Stripe-style purple accent. Tenant brand colors (per-customer) and environment colors (semantic) are the only intentional color variations.
- **Neutrals (light):**
  - `--bg: #FAFBFC` — app background
  - `--surface: #FFFFFF` — cards, table backgrounds
  - `--surface-2: #F6F7F9` — hover states, secondary surfaces, inset blocks
  - `--surface-3: #ECEEF1` — borders-on-fill / pill backgrounds
  - `--border: #E3E8EE` — primary border (cards, tables, inputs)
  - `--border-soft: #EDF0F4` — internal dividers (table row separators)
  - `--ink: #1A1F36` — primary text
  - `--ink-2: #3C4257` — secondary text (still readable)
  - `--muted: #687385` — labels, captions
  - `--muted-2: #8792A2` — disabled, "—" placeholders
- **Accent (single):**
  - `--accent: #1A77F2` — Data Safeguard brand blue (sampled from the parent-brand logo). Used for primary CTAs, active filter state, focused row left-border (2px), focus-visible rings.
  - `--accent-ink: #0F5BC2` — darker accent for hover, pressed states, and text-on-light-accent contrast (chip labels).
  - `--accent-weak: #E8F2FE` — accent-tinted backgrounds (active chip, selected row hover).
  - Dark-mode pair: `--accent: #4D95F5`, `--accent-weak: #0E2541`, `--accent-ink: #8FB8F8`.
- **Semantic (soft pastel — never shouty):**
  - Success: bg `#F0F9F4`, ink `#047857`. Used for env=prod chips, "succeeded" deployments, true booleans in tables.
  - Warning: bg `#FFF7ED`, ink `#B45309`. Used for env=stage, "stale" flags, "draft" version chips, "unsaved" indicator.
  - Danger: bg `#FEF2F2`, ink `#B91C1C`. Used for env never, "killSwitch" chips, "failed" deployments, "rolled_back" status.
  - Info: bg `#EFF6FF`, ink `#1E40AF`. Reserved for tooltips and notifications.
- **Environment semantic dots** (preserved from current design — these are now product-critical):
  - dev: `#6B7280`, qa: `#A855F7`, stage: `#F59E0B`, prod: `#10B981`
- **Tenant brand colors** (preserved — these are tenant identity, not design system):
  - Acme `#F26A4F`, Northwind `#0F766E`, Helios `#EAB308`, Orbit `#7C3AED`, Vanta `#0EA5E9`
- **Dark mode:** Inverts the neutral scale. Surfaces use elevation (lighter = closer), not pure black. Accent desaturated 12% (`#7B73FF`). Semantic colors swap to bg-tinted, ink-light variants. The `data-theme="dark"` toggle in App.jsx already wires this up via CSS custom properties.

## Spacing

- **Base unit:** 4px. The entire scale is 4px multiples.
- **Density:** Compact. This is a power-user tool. Table row padding 8-10px vertical (not 16+). Card padding 12-16px.
- **Scale:**
  - `--space-1: 4px` (icon-text gap, hairline gaps)
  - `--space-2: 8px` (chip padding, table cell padding)
  - `--space-3: 12px` (card padding, drawer field gaps)
  - `--space-4: 16px` (section gaps inside cards)
  - `--space-5: 24px` (card-to-card gap)
  - `--space-6: 32px` (page section gap, top-bar height)
  - `--space-7: 48px` (rarely — page-edge gutters on wide screens)

## Layout

- **Approach:** Grid-disciplined. The app shell is a fixed 2-column layout (sidebar 220px, content fluid). Page content uses a 12-col implicit grid via flexbox/CSS-grid. **No editorial asymmetry.**
- **Sidebar:** 220px. Permanent on desktop. Collapses to icon-only at <1024px (TODO — not yet implemented; tracked in design audit FINDING-010).
- **Top bar:** 48-52px tall. Tenant pill + segmented env switcher LEFT, search center (max 480px), notifications + user right.
- **Page content max width:** None — fluid. Tables are the primary content and they should breathe to the edge. Reading text inside drawers caps at 720px measure.
- **Border radius (hierarchical, not bubbly):**
  - `--radius-sm: 3px` (chips, tags, mono pills)
  - `--radius-md: 5-6px` (buttons, inputs, segmented controls)
  - `--radius-lg: 8px` (cards, drawers)
  - `--radius-pill: 999px` (avatars, single env dots — NOT general use)

## Motion

- **Approach:** Minimal-functional. Animations only communicate state changes. No decorative scroll choreography, no entrance animations on page load.
- **Easing:**
  - Enter: `ease-out` (cubic-bezier(0, 0, 0.2, 1))
  - Exit: `ease-in` (cubic-bezier(0.4, 0, 1, 1))
  - Move/transform: `ease-in-out` (cubic-bezier(0.4, 0, 0.2, 1))
- **Duration:**
  - Micro (state change like switch toggle): 100-150ms
  - Short (hover, focus): 100-200ms
  - Medium (drawer open/close): 250-300ms
  - Long: not used
- **Respect `prefers-reduced-motion: reduce`** — disable all transitions when set. (TODO — needs adding to styles.css.)
- **Only animate `transform` and `opacity`.** Never animate `width`, `height`, `top`, `left`, or layout properties.

## Component patterns

- **Segmented control (env switcher)**: Background `--surface-2`, padding 2px. Inactive buttons transparent with muted text. Active button: `--surface` background, 1px shadow border + 1px subtle box-shadow `0 1px 1px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)`. **Replaces today's colored ghost buttons.**
- **Pill chip (tenant override, status)**: 1-2px vertical padding, 6-8px horizontal, font-family mono for technical chips (`tenant override`, `kill`, `v131`), font-family Inter for descriptive chips (`stale`, `awaiting review`). 3px radius.
- **Switch toggle**: 28×16px (was 24×14). Track `#D6DBE2` off / `--accent` on. Thumb: 12×12 white with subtle shadow.
- **Button (primary)**: Background `--accent`, white text, 5-6px padding-y, 12px padding-x, 5px radius. Hover: `--accent-hover`.
- **Button (default)**: White bg, 1px `--border`, `--ink-2` text. Hover: border darkens to `--muted-2`.
- **Search input**: `--surface-2` bg, 1px transparent border (becomes `--accent` on focus). ⌘K kbd hint right-aligned in monospace at 10px.
- **Table**: 1px `--border` outline + 8px rounded corners. Header bg `--bg`, 11px uppercase tracked labels. Row hover: `--surface-2`. Row selected: `--surface-2` bg + inset 2px `--accent` left-border.
- **Focus ring**: `:focus-visible` only (never plain `:focus`). 2px `--accent` outline, 2-3px offset, 4px radius.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-24 | Initial DESIGN.md created | Locked in via /design-shotgun (user picked Variant B "Stripe-dense" over Linear editorial / Terminal pro) + /design-review baseline |
| 2026-05-24 | Two-font system: Inter Tight + JetBrains Mono | Preserved from initial scaffold; both fonts already loaded; pairing tested and works |
| 2026-05-24 | Stripe purple #635BFF as single accent | User chose Variant B which used this. Replaces previous #2E5BFF blue. |
| 2026-05-25 | Rebrand to Data Safeguard parent brand | User-directed. Accent moves from `#635BFF` to `#1A77F2` (color sampled directly from the user-provided logo SVG `fill` attribute). Logo wordmark replaces the placeholder "F" mark in top bar + login. Page title becomes "Feature Control · Data Safeguard". Favicon points at `/logo.svg`. The Stripe-dense layout language (data density, segmented controls, soft pastel chips, tabular nums) survives unchanged — only the brand color and mark identity move. |
| 2026-05-24 | Tenant brand colors preserved | They're product identity, not design system. Acme orange / Helios yellow etc. stay |
| 2026-05-24 | Env semantic colors preserved | dev gray, qa purple, stage amber, prod green — these are wired into too much UI to change |
| 2026-05-24 | Compact spacing (4px base) | Power-user tool. Density > comfort. /design-shotgun's "Linear editorial" with more whitespace was rejected |
| 2026-05-24 | Minimal motion | Same reason. Users want fast state changes, not choreography |

## Implementation backlog (to align code with this DESIGN.md)

These are deliberately separate from DESIGN.md decisions — they're the gap between the doc and today's [src/styles.css](src/styles.css):

1. Bump `--accent` from `#2E5BFF` to `#635BFF` (Stripe purple)
2. Convert env switcher in [src/ui.jsx](src/ui.jsx) from colored ghost buttons to a Stripe-style segmented control
3. Add `font-variant-numeric: tabular-nums` to `.num` and `.mono` classes globally
4. Soften status chips (`.chip.success`, `.chip.warning`, `.chip.danger`) to pastel-bg + dark-ink combinations
5. Add ⌘K kbd hint to the top-bar search field
6. Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }` to styles.css
7. Replace the Inter system fallback ("system-ui, -apple-system, ...") — keep these as fallback chain but ensure Inter Tight actually loads from Google Fonts (it already does)
8. Mobile responsive: sidebar collapse to icon-only at <1024px, top-bar tenant+env switcher wrap or collapse, table → card view at <768px (deferred — half-day refactor noted in design audit)
