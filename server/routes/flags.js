import { Router } from 'express';
import { db } from '../db.js';
import { flagFromRow } from '../seed.js';

export const flagsRouter = Router();

flagsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM flags ORDER BY key').all();
  res.json(rows.map(flagFromRow));
});

flagsRouter.get('/:key', (req, res) => {
  const row = db.prepare('SELECT * FROM flags WHERE key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'not_found' });
  res.json(flagFromRow(row));
});

flagsRouter.patch('/:key', (req, res) => {
  const key = req.params.key;
  const row = db.prepare('SELECT * FROM flags WHERE key = ?').get(key);
  if (!row) return res.status(404).json({ error: 'not_found' });
  const before = flagFromRow(row);

  const patch = req.body || {};
  const next = { ...before, ...patch };
  if (patch.overrides) next.overrides = { ...before.overrides, ...patch.overrides };
  if (patch.rollout)   next.rollout   = { ...before.rollout,   ...patch.rollout };

  const updatedAt = new Date().toISOString();
  const updatedBy = req.header('x-user') || 'u_1';

  const env = patch.__env || null;
  const tenant = patch.__tenant || null;

  db.prepare(`
    UPDATE flags SET
      name = @name, description = @description,
      tags = @tags, owner = @owner, status = @status,
      updated_at = @updated_at, updated_by = @updated_by,
      dependencies = @dependencies, overrides = @overrides, rollout = @rollout,
      kill_switch = @kill_switch
    WHERE key = @key
  `).run({
    key,
    name: next.name,
    description: next.description,
    tags: JSON.stringify(next.tags || []),
    owner: next.owner,
    status: next.status,
    updated_at: updatedAt,
    updated_by: updatedBy,
    dependencies: JSON.stringify(next.dependencies || []),
    overrides: JSON.stringify(next.overrides || {}),
    rollout: JSON.stringify(next.rollout || {}),
    kill_switch: next.killSwitch ? 1 : 0,
  });

  let beforeVal = null, afterVal = null;
  if (env) {
    beforeVal = before.overrides?.env?.[env] ?? before.default;
    afterVal  = next.overrides?.env?.[env] ?? next.default;
    if (tenant) {
      beforeVal = before.overrides?.tenant?.[tenant]?.[env] ?? beforeVal;
      afterVal  = next.overrides?.tenant?.[tenant]?.[env] ?? afterVal;
    }
  }

  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'update', ?, ?, ?, ?, ?, 'draft')
  `).run(
    updatedAt, updatedBy, key, tenant, env,
    JSON.stringify(beforeVal), JSON.stringify(afterVal),
  );

  const updated = db.prepare('SELECT * FROM flags WHERE key = ?').get(key);
  res.json(flagFromRow(updated));
});
