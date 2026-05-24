# FCC Documentation

**Markdown with embedded diagrams** (render on GitHub, VS Code, etc.)

- [architecture.md](architecture.md) — System architecture with two-plane (author + runtime) layout.
- [flow.md](flow.md) — End-to-end sequence diagrams: author/approve/publish, snapshot-based rollback, and the resolution layer waterfall.

**Standalone Mermaid files** (paste into [mermaid.live](https://mermaid.live) or feed to `mmdc` CLI)

- [architecture.mmd](architecture.mmd) — full system flowchart
- [flow-author-publish.mmd](flow-author-publish.mmd) — author → approve → publish → SDK read
- [flow-rollback.mmd](flow-rollback.mmd) — snapshot-based rollback
- [resolution-layers.mmd](resolution-layers.mmd) — override layer waterfall

To export to PNG/SVG: `npx -p @mermaid-js/mermaid-cli mmdc -i docs/architecture.mmd -o docs/architecture.svg`
