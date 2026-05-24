import express from 'express';
import cors from 'cors';
import { migrate } from './migrate.js';
import { seedIfEmpty } from './seed.js';
import { flagsRouter } from './routes/flags.js';
import { deploymentsRouter } from './routes/deployments.js';
import { auditRouter } from './routes/audit.js';
import { approvalsRouter } from './routes/approvals.js';
import { tenantsRouter } from './routes/tenants.js';
import { cdnRouter } from './routes/cdn.js';
import { metricsRouter } from './routes/metrics.js';

migrate();
const seedResult = seedIfEmpty();
console.log('[fcc] db ready · seed:', seedResult);

const app = express();
app.use(cors({ origin: true, exposedHeaders: ['ETag'] }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => res.json({ ok: true, t: Date.now() }));

app.use('/api/flags', flagsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api', tenantsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/cdn', cdnRouter);

app.use((err, _req, res, _next) => {
  console.error('[fcc] error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[fcc] api listening on http://localhost:${PORT}`));
