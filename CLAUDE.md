# Claude project notes — Feature Control Center

## Design System

Always read [DESIGN.md](DESIGN.md) before making any visual or UI decisions. All font choices, colors, spacing, and aesthetic direction are defined there. Do not deviate without explicit user approval. In QA mode, flag any code that doesn't match DESIGN.md.

The current design direction is "Stripe-dense" — refined data density, cool neutrals + single Stripe purple `#635BFF` accent, soft pastel status chips, segmented env switcher, tabular-nums on numeric columns. See `DESIGN.md` for the full system and the "Implementation backlog" section for the gap between the doc and the live code.

## Architecture

Two-plane design — **author plane** (`/api/*`) for editing flags, **runtime plane** (`/cdn/cfg/:env/:tenant.json`) for SDKs to read them. Both share the same resolution engine ([server/engine.js](server/engine.js)), so the in-UI Resolved-preview drawer and the CDN endpoint produce byte-identical output.

See [docs/architecture.md](docs/architecture.md) and [docs/flow.md](docs/flow.md) for the full diagrams.

## How to run

```bash
npm run dev:all   # Vite (5173) + Node API + SQLite (8787) together
# OR
npm run dev       # Vite frontend only
npm run dev:server # Backend only
```

SQLite DB lives at [server/fcc.db](server/fcc.db). Seeded automatically on first run from [src/data.js](src/data.js).
