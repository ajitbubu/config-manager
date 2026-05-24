import { db } from './db.js';
import { FCC_DATA } from '../src/data.js';

export function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM flags').get().n;
  if (count > 0) return { seeded: false, flags: count };

  const insertTenant = db.prepare(`
    INSERT INTO tenants (id, name, slug, industry, envs, modules, theme)
    VALUES (@id, @name, @slug, @industry, @envs, @modules, @theme)
  `);
  const insertEnv = db.prepare(`INSERT INTO envs (id, name, color, "order") VALUES (@id, @name, @color, @order)`);
  const insertUser = db.prepare(`INSERT INTO users (id, name, role, email, avatar) VALUES (@id, @name, @role, @email, @avatar)`);
  const insertFlag = db.prepare(`
    INSERT INTO flags (key, name, description, type, "default", module, tags, owner, status,
                       created_at, updated_at, updated_by, dependencies, overrides, rollout,
                       options, kill_switch, min, max)
    VALUES (@key, @name, @description, @type, @default, @module, @tags, @owner, @status,
            @created_at, @updated_at, @updated_by, @dependencies, @overrides, @rollout,
            @options, @kill_switch, @min, @max)
  `);
  const insertDeploy = db.prepare(`
    INSERT INTO deployments (id, tenant, env, version, status, at, by, items, cdn, duration, note, snapshot)
    VALUES (@id, @tenant, @env, @version, @status, @at, @by, @items, @cdn, @duration, @note, @snapshot)
  `);
  const insertAudit = db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (@at, @user, @action, @entity, @tenant, @env, @before, @after, @version)
  `);
  const insertApproval = db.prepare(`
    INSERT INTO approvals (id, flag, tenant, "from", "to", requested_by, requested_at, reviewers, status, diff)
    VALUES (@id, @flag, @tenant, @from, @to, @requested_by, @requested_at, @reviewers, @status, @diff)
  `);

  const tx = db.transaction(() => {
    for (const t of FCC_DATA.TENANTS) {
      insertTenant.run({ ...t, envs: JSON.stringify(t.envs), modules: JSON.stringify(t.modules) });
    }
    for (const e of FCC_DATA.ENVS) insertEnv.run(e);
    for (const u of FCC_DATA.USERS) insertUser.run(u);

    for (const f of FCC_DATA.FLAGS) {
      insertFlag.run({
        key: f.key,
        name: f.name,
        description: f.description,
        type: f.type,
        default: JSON.stringify(f.default),
        module: f.module || null,
        tags: JSON.stringify(f.tags || []),
        owner: f.owner || null,
        status: f.status || 'active',
        created_at: f.createdAt,
        updated_at: f.updatedAt,
        updated_by: f.updatedBy || null,
        dependencies: JSON.stringify(f.dependencies || []),
        overrides: JSON.stringify(f.overrides || {}),
        rollout: JSON.stringify(f.rollout || {}),
        options: f.options ? JSON.stringify(f.options) : null,
        kill_switch: f.killSwitch ? 1 : 0,
        min: f.min ?? null,
        max: f.max ?? null,
      });
    }

    for (const d of FCC_DATA.DEPLOYMENTS) {
      insertDeploy.run({
        id: d.id, tenant: d.tenant, env: d.env, version: d.version, status: d.status,
        at: d.at, by: d.by, items: d.items, cdn: d.cdn, duration: d.duration, note: d.note,
        snapshot: '{}',
      });
    }

    for (const a of FCC_DATA.AUDIT) {
      insertAudit.run({
        at: a.at, user: a.user, action: a.action, entity: a.entity,
        tenant: a.tenant, env: a.env,
        before: JSON.stringify(a.before ?? null),
        after: JSON.stringify(a.after ?? null),
        version: a.version,
      });
    }

    for (const ap of FCC_DATA.APPROVALS) {
      insertApproval.run({
        id: ap.id, flag: ap.flag, tenant: ap.tenant, from: ap.from, to: ap.to,
        requested_by: ap.requestedBy, requested_at: ap.requestedAt,
        reviewers: JSON.stringify(ap.reviewers || []), status: ap.status, diff: ap.diff || 0,
      });
    }
  });

  tx();
  return { seeded: true, flags: FCC_DATA.FLAGS.length };
}

export function flagFromRow(r) {
  if (!r) return null;
  return {
    key: r.key,
    name: r.name,
    description: r.description,
    type: r.type,
    default: JSON.parse(r.default),
    module: r.module,
    tags: JSON.parse(r.tags),
    owner: r.owner,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    updatedBy: r.updated_by,
    dependencies: JSON.parse(r.dependencies),
    overrides: JSON.parse(r.overrides),
    rollout: JSON.parse(r.rollout),
    options: r.options ? JSON.parse(r.options) : undefined,
    killSwitch: r.kill_switch === 1 ? true : undefined,
    min: r.min ?? undefined,
    max: r.max ?? undefined,
  };
}
