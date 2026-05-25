import { Router } from 'express';
import { db } from '../db.js';
import { flagFromRow } from '../seed.js';
import { resolveAll } from '../engine.js';
import { metricsRecord } from './metrics.js';

// CDN model: LIVE (not snapshot).
// This endpoint reads the current flags table, not the latest deployment snapshot.
// A flag edit takes effect on the next CDN read, before any explicit publish.
// Publish/Rollback exist to (a) write an audit trail + version stamp and (b) capture
// a source snapshot that rollback can restore from. They are not gates between
// "draft" and "live" state — there is no draft state in this design.
//
// To migrate to a published-snapshot model later: pick the latest deployments row
// for (tenant, env) with status='succeeded' or 'rolled_back' and serve its
// snapshot.features instead of calling resolveAll() here.

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
