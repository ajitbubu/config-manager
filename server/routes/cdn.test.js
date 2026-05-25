import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { migrate } from '../migrate.js';
import { seedIfEmpty } from '../seed.js';
import { createApp } from '../app.js';

let app;

beforeAll(() => {
  migrate();
  seedIfEmpty();
  app = createApp();
});

describe('GET /cdn/cfg/:env/:tenant.json', () => {
  it('returns 200 + features + ETag header on first request', async () => {
    const res = await request(app).get('/cdn/cfg/prod/acme.json');
    expect(res.status).toBe(200);
    expect(res.headers.etag).toMatch(/^W\/"/);
    expect(res.body.meta).toBeDefined();
    expect(res.body.features).toBeDefined();
    expect(typeof res.body.features['checkout.applePayEnabled']).toBe('boolean');
  });

  it('returns 304 when If-None-Match matches', async () => {
    const first = await request(app).get('/cdn/cfg/prod/acme.json');
    const etag = first.headers.etag;
    const second = await request(app)
      .get('/cdn/cfg/prod/acme.json')
      .set('If-None-Match', etag);
    expect(second.status).toBe(304);
    expect(second.text).toBe('');
  });

  it('returns 200 + new ETag when If-None-Match does not match', async () => {
    const res = await request(app)
      .get('/cdn/cfg/prod/acme.json')
      .set('If-None-Match', 'W/"deadbeef"');
    expect(res.status).toBe(200);
    expect(res.headers.etag).toMatch(/^W\/"/);
    expect(res.headers.etag).not.toBe('W/"deadbeef"');
  });

  it('changes ETag when tenant changes', async () => {
    const a = await request(app).get('/cdn/cfg/prod/acme.json');
    const b = await request(app).get('/cdn/cfg/prod/helios.json');
    expect(a.headers.etag).not.toBe(b.headers.etag);
  });

  it('changes ETag when env changes', async () => {
    const a = await request(app).get('/cdn/cfg/prod/acme.json');
    const b = await request(app).get('/cdn/cfg/stage/acme.json');
    expect(a.headers.etag).not.toBe(b.headers.etag);
  });

  it('exposes ETag via CORS', async () => {
    const res = await request(app)
      .get('/cdn/cfg/prod/acme.json')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-expose-headers']).toContain('ETag');
  });
});

describe('PATCH /api/flags then GET /cdn/* — author plane affects runtime', () => {
  it('flag mutation propagates to CDN response on next read', async () => {
    const before = await request(app).get('/cdn/cfg/stage/acme.json');
    const beforeVal = before.body.features['pricing.discountPercentage'];

    await request(app)
      .patch('/api/flags/pricing.discountPercentage')
      .send({ overrides: { env: { dev: 25, qa: 15, stage: 88, prod: 15 } } })
      .expect(200);

    const after = await request(app).get('/cdn/cfg/stage/acme.json');
    expect(after.body.features['pricing.discountPercentage']).toBe(88);
    expect(after.body.features['pricing.discountPercentage']).not.toBe(beforeVal);
    expect(after.headers.etag).not.toBe(before.headers.etag);
  });
});
