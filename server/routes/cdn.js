import { Router } from 'express';
import { db } from '../db.js';
import { flagFromRow } from '../seed.js';
import { resolveAll } from '../engine.js';
import { metricsRecord } from './metrics.js';

export const cdnRouter = Router();

cdnRouter.get('/cfg/:env/:tenantFile', (req, res) => {
  const env = req.params.env;
  const tenantFile = req.params.tenantFile;
  const tenant = tenantFile.replace(/\.json$/, '');
  const { platform = 'web', browser = 'chrome', appVersion = '1.0.0', userId = 'anon' } = req.query;

  const flagRows = db.prepare('SELECT * FROM flags').all();
  const flags = flagRows.map(flagFromRow);
  const resolved = resolveAll(flags, { tenant, env, platform, browser, appVersion, userId });

  const etag = resolved.meta.etag;
  metricsRecord();

  if (req.header('if-none-match') === etag) {
    res.status(304).end();
    return;
  }

  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'public, max-age=30');
  res.json({ meta: resolved.meta, features: resolved.features });
});
