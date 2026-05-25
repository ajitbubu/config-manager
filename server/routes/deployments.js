import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { flagFromRow } from '../seed.js';
import { resolveAll } from '../engine.js';
import { PublishBody, RollbackBody, validate } from '../schemas.js';

export const deploymentsRouter = Router();

deploymentsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM deployments ORDER BY at DESC').all();
  res.json(rows.map(r => ({ ...r, snapshot: r.snapshot ? JSON.parse(r.snapshot) : null })));
});

deploymentsRouter.post('/', validate(PublishBody), (req, res) => {
  const { tenant, env, note = '', by = 'u_3' } = req.body;

  const flagRows = db.prepare('SELECT * FROM flags').all();
  const flags = flagRows.map(flagFromRow);

  const resolved = resolveAll(flags, {
    tenant, env, platform: 'web', browser: 'chrome', appVersion: '1.0.0', userId: 'publisher',
  });

  const previousVersions = db.prepare(`SELECT version FROM deployments WHERE tenant = ? AND env = ? ORDER BY at DESC`).all(tenant, env);
  const lastNum = previousVersions.length
    ? Math.max(...previousVersions.map(v => parseInt(String(v.version).replace(/[^\d]/g, ''), 10) || 0))
    : 120;
  const version = 'v' + String(lastNum + 1).padStart(3, '0');

  const id = 'dep_' + nanoid(6);
  const at = new Date().toISOString();
  const cdn = `/cdn/cfg/${env}/${tenant}.json`;
  const items = Object.keys(resolved.features).length;
  const duration = Number((1 + Math.random() * 3).toFixed(1));

  const snapshot = { features: resolved.features, meta: resolved.meta, source: flags };

  db.prepare(`
    INSERT INTO deployments (id, tenant, env, version, status, at, by, items, cdn, duration, note, snapshot)
    VALUES (?, ?, ?, ?, 'succeeded', ?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenant, env, version, at, by, items, cdn, duration, note, JSON.stringify(snapshot));

  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'publish', 'bulk', ?, ?, NULL, NULL, ?)
  `).run(at, by, tenant, env, version);

  res.status(201).json({ id, tenant, env, version, status: 'succeeded', at, by, items, cdn, duration, note });
});

deploymentsRouter.post('/:id/rollback', validate(RollbackBody), (req, res) => {
  const id = req.params.id;
  const by = req.body?.by || 'u_3';
  const target = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'not_found' });

  const previous = db.prepare(`
    SELECT * FROM deployments
    WHERE tenant = ? AND env = ? AND at < ? AND status = 'succeeded'
    ORDER BY at DESC LIMIT 1
  `).get(target.tenant, target.env, target.at);
  if (!previous) return res.status(409).json({ error: 'no_previous_snapshot' });

  const snapshot = previous.snapshot ? JSON.parse(previous.snapshot) : null;
  const at = new Date().toISOString();
  const newId = 'dep_' + nanoid(6);

  if (snapshot?.source?.length) {
    const updateFlag = db.prepare(`
      UPDATE flags SET overrides = ?, rollout = ?, updated_at = ?, updated_by = ?
      WHERE key = ?
    `);
    const tx = db.transaction(() => {
      for (const f of snapshot.source) {
        updateFlag.run(JSON.stringify(f.overrides || {}), JSON.stringify(f.rollout || {}), at, by, f.key);
      }
    });
    tx();
  }

  db.prepare(`
    INSERT INTO deployments (id, tenant, env, version, status, at, by, items, cdn, duration, note, snapshot)
    VALUES (?, ?, ?, ?, 'rolled_back', ?, ?, ?, ?, ?, ?, ?)
  `).run(newId, target.tenant, target.env, previous.version, at, by, previous.items, previous.cdn, 0.5, `Rolled back from ${target.version} → ${previous.version}`, JSON.stringify(snapshot));

  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'rollback', 'bulk', ?, ?, ?, ?, ?)
  `).run(at, by, target.tenant, target.env, JSON.stringify(target.version), JSON.stringify(previous.version), previous.version);

  res.json({ id: newId, restoredFrom: previous.version, replacedVersion: target.version, at });
});
