import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { flagFromRow } from '../seed.js';
import { resolveAll } from '../engine.js';

export const approvalsRouter = Router();

function rowToApproval(r) {
  return {
    id: r.id, flag: r.flag, tenant: r.tenant, from: r.from, to: r.to,
    requestedBy: r.requested_by, requestedAt: r.requested_at,
    reviewers: JSON.parse(r.reviewers), status: r.status, diff: r.diff,
  };
}

approvalsRouter.get('/', (req, res) => {
  const rows = db.prepare(`SELECT * FROM approvals WHERE status = 'pending' ORDER BY requested_at DESC`).all();
  res.json(rows.map(rowToApproval));
});

approvalsRouter.post('/', (req, res) => {
  const { flag, tenant, from, to, requestedBy = 'u_2', reviewers = ['u_4'] } = req.body || {};
  if (!flag || !tenant || !from || !to) return res.status(400).json({ error: 'flag, tenant, from, to required' });

  const id = 'apr_' + nanoid(6);
  const at = new Date().toISOString();
  db.prepare(`
    INSERT INTO approvals (id, flag, tenant, "from", "to", requested_by, requested_at, reviewers, status, diff)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)
  `).run(id, flag, tenant, from, to, requestedBy, at, JSON.stringify(reviewers));

  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'submit', ?, ?, ?, NULL, NULL, 'draft')
  `).run(at, requestedBy, flag, tenant, to);

  res.status(201).json({ id, flag, tenant, from, to, requestedBy, requestedAt: at, reviewers, status: 'pending', diff: 1 });
});

approvalsRouter.post('/:id/approve', (req, res) => {
  const by = req.body?.by || 'u_4';
  const r = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'not_found' });
  if (r.status !== 'pending') return res.status(409).json({ error: 'already_' + r.status });

  const now = new Date().toISOString();
  db.prepare('UPDATE approvals SET status = ? WHERE id = ?').run('approved', r.id);
  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'approve', ?, ?, ?, NULL, NULL, 'draft')
  `).run(now, by, r.flag, r.tenant, r.to);

  const flags = db.prepare('SELECT * FROM flags').all().map(flagFromRow);
  const resolved = resolveAll(flags, { tenant: r.tenant, env: r.to, platform: 'web', browser: 'chrome', appVersion: '1.0.0', userId: 'publisher' });
  const previousVersions = db.prepare(`SELECT version FROM deployments WHERE tenant = ? AND env = ?`).all(r.tenant, r.to);
  const lastNum = previousVersions.length
    ? Math.max(...previousVersions.map(v => parseInt(String(v.version).replace(/[^\d]/g, ''), 10) || 0))
    : 120;
  const version = 'v' + String(lastNum + 1).padStart(3, '0');
  const depId = 'dep_' + nanoid(6);

  db.prepare(`
    INSERT INTO deployments (id, tenant, env, version, status, at, by, items, cdn, duration, note, snapshot)
    VALUES (?, ?, ?, ?, 'succeeded', ?, ?, ?, ?, ?, ?, ?)
  `).run(depId, r.tenant, r.to, version, now, by, Object.keys(resolved.features).length,
        `/cdn/cfg/${r.to}/${r.tenant}.json`, 2.0, `Auto-publish after approval of ${r.id}`,
        JSON.stringify({ features: resolved.features, meta: resolved.meta, source: flags }));

  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'publish', ?, ?, ?, NULL, NULL, ?)
  `).run(now, by, r.flag, r.tenant, r.to, version);

  res.json({ ok: true, deployment: depId, version });
});

approvalsRouter.post('/:id/reject', (req, res) => {
  const by = req.body?.by || 'u_4';
  const r = db.prepare('SELECT * FROM approvals WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'not_found' });
  if (r.status !== 'pending') return res.status(409).json({ error: 'already_' + r.status });
  const now = new Date().toISOString();
  db.prepare('UPDATE approvals SET status = ? WHERE id = ?').run('rejected', r.id);
  db.prepare(`
    INSERT INTO audit_log (at, user, action, entity, tenant, env, before, after, version)
    VALUES (?, ?, 'reject', ?, ?, ?, NULL, NULL, 'draft')
  `).run(now, by, r.flag, r.tenant, r.to);
  res.json({ ok: true });
});
