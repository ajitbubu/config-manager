import { Router } from 'express';
import { db } from '../db.js';

export const tenantsRouter = Router();

tenantsRouter.get('/tenants', (req, res) => {
  const rows = db.prepare('SELECT * FROM tenants ORDER BY name').all();
  res.json(rows.map(r => ({ ...r, envs: JSON.parse(r.envs), modules: JSON.parse(r.modules) })));
});

tenantsRouter.get('/users', (req, res) => {
  res.json(db.prepare('SELECT * FROM users ORDER BY name').all());
});

tenantsRouter.get('/envs', (req, res) => {
  res.json(db.prepare(`SELECT * FROM envs ORDER BY "order"`).all());
});
