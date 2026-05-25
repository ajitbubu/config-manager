import { describe, it, expect } from 'vitest';
import { hash, resolveFlag, resolveAll } from './engine.js';

const baseCtx = { tenant: 'acme', env: 'prod', platform: 'web', browser: 'chrome', appVersion: '1.0.0', userId: 'u_test' };

describe('hash', () => {
  it('is deterministic for the same input', () => {
    expect(hash('hello')).toBe(hash('hello'));
  });
  it('returns a value in [0, 1)', () => {
    for (const s of ['a', 'b', 'long-string', 'u_42:checkout-np']) {
      const h = hash(s);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
  });
});

describe('resolveFlag — layer order', () => {
  const flagBool = (overrides = {}, rollout = {}) => ({
    key: 'k', type: 'boolean', default: false,
    overrides: { env: {}, tenant: {}, platform: {}, browser: {}, ...overrides },
    rollout,
  });

  it('returns default when no overrides match', () => {
    const f = flagBool();
    const r = resolveFlag(f, baseCtx);
    expect(r.value).toBe(false);
    expect(r.trace[0]).toMatchObject({ layer: 'default', value: false });
  });

  it('env override beats default', () => {
    const f = flagBool({ env: { prod: true } });
    expect(resolveFlag(f, baseCtx).value).toBe(true);
  });

  it('tenant/env override beats env override', () => {
    const f = flagBool({ env: { prod: true }, tenant: { acme: { prod: false } } });
    expect(resolveFlag(f, baseCtx).value).toBe(false);
  });

  it('platform override beats tenant override', () => {
    const f = flagBool({ tenant: { acme: { prod: true } }, platform: { web: false } });
    expect(resolveFlag(f, baseCtx).value).toBe(false);
  });

  it('browser override beats platform override', () => {
    const f = flagBool({ platform: { web: true }, browser: { chrome: false } });
    expect(resolveFlag(f, baseCtx).value).toBe(false);
  });

  it('rollout flips true→false when user not in bucket (0% rollout)', () => {
    const f = flagBool({ env: { prod: true } }, { enabled: true, percentage: 0, seed: 's' });
    const r = resolveFlag(f, baseCtx);
    expect(r.value).toBe(false);
    expect(r.trace.at(-1).note).toMatch(/not in bucket/);
  });

  it('rollout keeps true when user IS in bucket (100% rollout)', () => {
    const f = flagBool({ env: { prod: true } }, { enabled: true, percentage: 100, seed: 's' });
    expect(resolveFlag(f, baseCtx).value).toBe(true);
  });

  it('disabled rollout never gates the value', () => {
    const f = flagBool({ env: { prod: true } }, { enabled: false, percentage: 0 });
    expect(resolveFlag(f, baseCtx).value).toBe(true);
  });

  it('rollout only applies to boolean flags', () => {
    const f = { key: 'k', type: 'number', default: 0, overrides: { env: { prod: 25 } }, rollout: { enabled: true, percentage: 0 } };
    expect(resolveFlag(f, baseCtx).value).toBe(25);
  });

  it('tenant wildcard "*" applies when env not present', () => {
    const f = flagBool({ tenant: { acme: { '*': true } } });
    expect(resolveFlag(f, baseCtx).value).toBe(true);
  });
});

describe('resolveAll — bulk resolution', () => {
  const flags = [
    { key: 'a', type: 'boolean', default: false, overrides: { env: { prod: true }, tenant: {}, platform: {}, browser: {} }, rollout: {} },
    { key: 'b', type: 'number', default: 0, overrides: { env: {}, tenant: { acme: { prod: 42 } }, platform: {}, browser: {} }, rollout: {} },
    { key: 'c', type: 'enum', default: 'A', overrides: { env: { prod: 'C' }, tenant: {}, platform: {}, browser: {} }, rollout: {} },
  ];

  it('resolves every flag in the array', () => {
    const r = resolveAll(flags, baseCtx);
    expect(r.features).toEqual({ a: true, b: 42, c: 'C' });
  });

  it('emits stable etag for identical state', () => {
    const r1 = resolveAll(flags, baseCtx);
    const r2 = resolveAll(flags, baseCtx);
    expect(r1.meta.etag).toBe(r2.meta.etag);
  });

  it('emits different etag when feature values change', () => {
    const r1 = resolveAll(flags, baseCtx);
    const r2 = resolveAll(flags, { ...baseCtx, env: 'stage' });
    expect(r1.meta.etag).not.toBe(r2.meta.etag);
  });

  it('includes resolved context in meta', () => {
    const r = resolveAll(flags, baseCtx);
    expect(r.meta.tenant).toBe('acme');
    expect(r.meta.environment).toBe('prod');
    expect(r.meta.platform).toBe('web');
    expect(r.meta.version).toMatch(/^v\d+$/);
    expect(r.meta.cdnUrl).toContain('/cdn/cfg/prod/acme.json');
  });
});
