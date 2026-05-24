# FCC — End-to-End Flow Diagrams

Three diagrams covering the main lifecycle: author → review → publish → rollout → rollback.

---

## 1. Author → Approve → Publish → Client reads

```mermaid
sequenceDiagram
  autonumber
  actor Dev as Developer<br/>(Marco · u_2)
  actor App as Approver<br/>(Søren · u_4)
  participant UI as FCC UI<br/>:5173
  participant API as Express API<br/>:8787
  participant DB as SQLite
  participant CDN as /cdn/cfg/*
  participant SDK as Tenant App<br/>(@fcc/sdk)

  Dev->>UI: Toggle pricing.discountPercentage stage=42
  UI->>API: PATCH /api/flags/pricing.discountPercentage<br/>{overrides:{env:{stage:42}}, __env, __tenant}
  API->>DB: UPDATE flags SET overrides=...
  API->>DB: INSERT audit_log (action=update, before=15, after=42)
  API-->>UI: 200 + updated flag
  UI-->>Dev: toast "→ 42 in stage"

  Dev->>UI: Submit for review (stage → prod)
  UI->>API: POST /api/approvals<br/>{flag, tenant, from:stage, to:prod}
  API->>DB: INSERT approvals (status=pending)
  API->>DB: INSERT audit_log (action=submit)
  API-->>UI: 201 + approval row

  App->>UI: Click Approve on Dashboard tile
  UI->>API: POST /api/approvals/:id/approve
  API->>DB: UPDATE approvals SET status=approved
  API->>DB: INSERT audit_log (action=approve)
  Note over API,DB: Auto-publish step
  API->>DB: SELECT * FROM flags
  API->>API: resolveAll(flags, ctx)
  API->>DB: INSERT deployments<br/>(status=succeeded, version=v++,<br/>snapshot={features, source})
  API->>DB: INSERT audit_log (action=publish)
  API-->>UI: 200 {deployment, version}

  SDK->>CDN: GET /cdn/cfg/prod/acme.json<br/>If-None-Match: W/"abc..."
  CDN->>DB: SELECT * FROM flags
  CDN->>CDN: resolveAll(ctx) → etag
  alt etag changed
    CDN-->>SDK: 200 + features + ETag
    SDK->>SDK: snapshot updated → fire onChange()
  else etag same
    CDN-->>SDK: 304 Not Modified
  end
  SDK-->>SDK: fcc.isOn() / fcc.get() reflects new value
```

**Why auto-publish on approve**: in the demo we collapse approve → publish into one route. In a real system these are separate steps gated by RBAC (the approver may not be the publisher) and by CI checks.

---

## 2. Publish → Rollback (snapshot-based revert)

```mermaid
sequenceDiagram
  autonumber
  actor Ops as DevOps<br/>(Hana · u_3)
  participant UI as FCC UI
  participant API as Express API
  participant DB as SQLite

  Ops->>UI: Edit flag, publish → v131
  UI->>API: POST /api/deployments {tenant, env, note}
  API->>DB: snapshot = full source of all flags
  API->>DB: INSERT deployments v131 + snapshot JSON
  API-->>UI: 201 dep_v131

  Note over Ops,DB: Issue detected in v131 — revert

  Ops->>UI: Click Rollback on dep_v131 row
  UI->>API: POST /api/deployments/:id/rollback
  API->>DB: SELECT previous succeeded deployment<br/>(same tenant + env, at < target.at)
  API->>API: parse snapshot.source
  loop for each flag in snapshot
    API->>DB: UPDATE flags SET overrides=?, rollout=?<br/>WHERE key=?
  end
  API->>DB: INSERT deployments<br/>(status=rolled_back, version=previous.version,<br/>snapshot=previous.snapshot)
  API->>DB: INSERT audit_log (action=rollback)
  API-->>UI: 200 {id, restoredFrom: previous.version}

  Note over API,DB: Subsequent CDN reads see the restored flag values<br/>because the live flags table was rewritten from the snapshot.
```

**Key design choice**: snapshots store the *source* (overrides + rollout per flag), not just the resolved features. That way a rollback can deterministically restore the exact author state, even after platform/browser overrides change between snapshots.

---

## 3. Resolution layer order (what the engine does on every CDN read)

```mermaid
flowchart TD
  start([GET /cdn/cfg/prod/acme.json<br/>?platform=web&browser=chrome&userId=u42]) --> defaultLayer
  defaultLayer[1. default value<br/>e.g. false] --> envLayer
  envLayer{2. overrides.env.prod<br/>defined?} -->|yes| envApply[value := overrides.env.prod]
  envLayer -->|no| tenantLayer
  envApply --> tenantLayer
  tenantLayer{3. overrides.tenant.acme.prod<br/>defined?} -->|yes| tenantApply[value := overrides.tenant.acme.prod]
  tenantLayer -->|no| platformLayer
  tenantApply --> platformLayer
  platformLayer{4. overrides.platform.web<br/>defined?} -->|yes| platformApply[value := overrides.platform.web]
  platformLayer -->|no| browserLayer
  platformApply --> browserLayer
  browserLayer{5. overrides.browser.chrome<br/>defined?} -->|yes| browserApply[value := overrides.browser.chrome]
  browserLayer -->|no| rolloutLayer
  browserApply --> rolloutLayer
  rolloutLayer{6. rollout.enabled<br/>and type=boolean?} -->|yes| bucket
  rolloutLayer -->|no| done
  bucket["hash(userId : seed) → bucket<br/>bucket < percentage → keep<br/>else value := false"] --> done
  done([final value + trace])

  classDef apply fill:#ECFDF5,stroke:#059669;
  class envApply,tenantApply,platformApply,browserApply,bucket apply;
```

The "dominated" chip in the flag row UI fires when steps 4-5 override the value the row toggle controls (steps 2-3) — that explains why the row toggle visibly flips but the resolved column doesn't budge.

---

## Files that implement each piece

| Diagram step | File |
|---|---|
| UI toggle → PATCH | [src/pages-flags.jsx:336-360](../src/pages-flags.jsx#L336-L360) |
| API PATCH handler | [server/routes/flags.js](../server/routes/flags.js) |
| Audit insertion (every write) | each route under [server/routes/](../server/routes/) |
| Approval auto-publish | [server/routes/approvals.js](../server/routes/approvals.js) |
| Snapshot at publish | [server/routes/deployments.js](../server/routes/deployments.js) (POST `/`) |
| Snapshot-based rollback | [server/routes/deployments.js](../server/routes/deployments.js) (POST `/:id/rollback`) |
| CDN + ETag + 304 | [server/routes/cdn.js](../server/routes/cdn.js) |
| Resolution engine | [server/engine.js](../server/engine.js) |
| SDK polling + onChange | [sdk/src/index.js](../sdk/src/index.js) |
