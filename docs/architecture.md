# FCC — Architecture Diagram

Two-plane design: an **author plane** for editing flags and a **runtime plane** for clients to read them. The same resolution engine runs in both so the preview drawer in the UI gives byte-identical output to what an SDK consumer sees.

```mermaid
flowchart LR
  classDef store fill:#FFF7E6,stroke:#D97706,color:#111;
  classDef ui fill:#EEF2FF,stroke:#4338CA,color:#111;
  classDef api fill:#ECFEFF,stroke:#0E7490,color:#111;
  classDef client fill:#F0FDF4,stroke:#15803D,color:#111;

  subgraph Browser["🖥️ Author UI · Vite :5173"]
    UI["React SPA<br/>App.jsx + StoreProvider"]:::ui
    Pages["Pages<br/>Flags · Dashboard · Diff<br/>Deployments · Audit · Settings"]:::ui
    Store["src/store.jsx<br/>(in-memory cache)"]:::ui
  end

  subgraph Server["⚙️ Express API · :8787"]
    direction TB
    API["/api/* routes<br/>(author plane)"]:::api
    CDN["/cdn/cfg/:env/:tenant.json<br/>(runtime plane · ETag + 304)"]:::api
    ENG["engine.js<br/>resolveFlag · resolveAll · hash"]:::api
    METRICS["metrics ring<br/>last-48h fetch counts"]:::api
  end

  subgraph DB["💾 SQLite · server/fcc.db"]
    direction TB
    FLAGS[("flags<br/>key · type · overrides · rollout")]:::store
    DEPLOYS[("deployments<br/>+ source snapshot JSON")]:::store
    AUDIT[("audit_log<br/>before/after · who · when")]:::store
    APPROVE[("approvals<br/>flag · from · to · status")]:::store
    TENANTS_T[("tenants · users · envs")]:::store
  end

  subgraph ClientApp["📱 Tenant App Runtime"]
    SDK["@fcc/sdk<br/>poll + ETag + onChange"]:::client
    APP["fcc.isOn() · fcc.get()"]:::client
    DEMO["sdk/example/demo.html<br/>(live consumer demo)"]:::client
  end

  Pages -->|"read"| Store
  Store -->|"REST GET/PATCH/POST"| API
  Pages -->|"resolved preview"| CDN

  API -->|"INSERT / UPDATE"| FLAGS
  API -->|"INSERT publish/rollback"| DEPLOYS
  API -->|"INSERT every write"| AUDIT
  API -->|"INSERT submit/approve/reject"| APPROVE
  API -->|"read static"| TENANTS_T

  CDN --> ENG
  ENG -->|"SELECT *"| FLAGS
  CDN --> METRICS

  SDK -->|"GET cfg.json<br/>If-None-Match"| CDN
  APP --> SDK
  DEMO --> SDK
```

## What each plane is responsible for

### Author plane (`/api/*`)

- Writes are the only place that mutates `flags`, `deployments`, `approvals`.
- Every write also inserts into `audit_log` so the history is immutable from the route layer's perspective.
- `POST /api/deployments` snapshots the *full source* of all flags (overrides + rollout) into `deployments.snapshot`. This is what rollback restores from.

### Runtime plane (`/cdn/cfg/:env/:tenant.json`)

- Read-only. Calls `resolveAll(flags, ctx)` against live flag rows.
- Emits an `ETag` derived from the resolved features hash, so the SDK can poll cheaply with `If-None-Match` and get `304 Not Modified` until something actually changes.
- `metricsRecord()` ticks the in-memory 48-hour ring buffer that the dashboard sparkline reads.

### Resolution engine ([server/engine.js](../server/engine.js))

- Lifted verbatim from [src/data.js:394-448](../src/data.js#L394-L448) so the in-browser preview drawer and the CDN endpoint give identical output.
- Override layer order (highest wins): `default → env → tenant/env → platform → browser → rollout`.

### CDN serving model: LIVE (not published snapshot)

The CDN endpoint reads the current `flags` table on every request. A flag edit takes effect on the next CDN read, *before* any explicit publish. Publish and Rollback exist to:

1. write an audit trail + version stamp (`deployments` table), and
2. capture a source snapshot that rollback can restore from.

There is no separate "draft" state. The author plane and runtime plane share the same source of truth (`flags` rows). This is intentional for the demo and matches how internal tools like Stripe's config and LaunchDarkly's relay/sdk path actually behave (edits propagate without an explicit publish gate; audit captures *what was set when*, not *what was promoted when*).

### Migration path to published-snapshot mode

If you later want a strict publish gate: change [server/routes/cdn.js](../server/routes/cdn.js) to pick the latest `deployments` row for `(tenant, env)` with status in `('succeeded', 'rolled_back')` and serve `snapshot.features` instead of calling `resolveAll()`. Add a `Publish required` UI affordance. About a half-day of work + one test file.

## Why SQLite (and not something fancier)

- Zero infra to demo locally — one file at `server/fcc.db`.
- WAL mode → reads don't block writes.
- Schema is small enough (5 tables) to migrate to Postgres in a few hours when scale demands.
