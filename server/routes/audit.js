import { Router } from 'express';
import { db } from '../db.js';

export const auditRouter = Router();

auditRouter.get('/', (req, res) => {
  const { entity, action, tenant, env, limit = 200 } = req.query;
  const filters = [];
  const params = [];
  if (entity) { filters.push('entity LIKE ?'); params.push('%' + entity + '%'); }
  if (action) { filters.push('action = ?');    params.push(action); }
  if (tenant) { filters.push('tenant = ?');    params.push(tenant); }
  if (env)    { filters.push('env = ?');       params.push(env); }
  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const rows = db.prepare(`SELECT * FROM audit_log ${where} ORDER BY at DESC LIMIT ?`).all(...params, Number(limit));
  res.json(rows.map(r => ({
    ...r,
    before: r.before ? JSON.parse(r.before) : null,
    after:  r.after  ? JSON.parse(r.after)  : null,
  })));
});
