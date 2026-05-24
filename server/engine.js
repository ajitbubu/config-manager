export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 0xFFFFFFFF;
}

export function resolveFlag(flag, ctx) {
  const trace = [];
  let value = flag.default;
  trace.push({ layer: 'default', value });

  const ov = flag.overrides || {};
  if (ov.env && ctx.env in ov.env) { value = ov.env[ctx.env]; trace.push({ layer: `env:${ctx.env}`, value }); }
  if (ov.tenant && ov.tenant[ctx.tenant]) {
    const t = ov.tenant[ctx.tenant];
    if (ctx.env in t) { value = t[ctx.env]; trace.push({ layer: `tenant:${ctx.tenant}/${ctx.env}`, value }); }
    else if ('*' in t) { value = t['*']; trace.push({ layer: `tenant:${ctx.tenant}`, value }); }
  }
  if (ov.platform && ctx.platform in ov.platform) { value = ov.platform[ctx.platform]; trace.push({ layer: `platform:${ctx.platform}`, value }); }
  if (ov.browser && ctx.browser in ov.browser) { value = ov.browser[ctx.browser]; trace.push({ layer: `browser:${ctx.browser}`, value }); }

  if (flag.rollout && flag.rollout.enabled && flag.type === 'boolean') {
    const bucket = hash((ctx.userId || 'anon') + ':' + (flag.rollout.seed || flag.key));
    const on = bucket * 100 < flag.rollout.percentage;
    if (value === true && !on) { value = false; trace.push({ layer: `rollout:${flag.rollout.percentage}%`, value, note: 'user not in bucket' }); }
    else if (on) trace.push({ layer: `rollout:${flag.rollout.percentage}%`, value, note: 'user in bucket' });
  }

  return { value, trace };
}

export function resolveAll(flags, ctx) {
  const result = {};
  const traces = {};
  for (const f of flags) {
    const r = resolveFlag(f, ctx);
    result[f.key] = r.value;
    traces[f.key] = r.trace;
  }
  return {
    meta: {
      tenant: ctx.tenant,
      environment: ctx.env,
      platform: ctx.platform,
      browser: ctx.browser,
      appVersion: ctx.appVersion,
      version: 'v' + (120 + Math.floor(hash(ctx.tenant + ctx.env) * 99)),
      publishedAt: new Date().toISOString(),
      cdnUrl: `http://localhost:8787/cdn/cfg/${ctx.env}/${ctx.tenant}.json`,
      etag: 'W/"' + Math.floor(hash(ctx.tenant + ctx.env + JSON.stringify(result)) * 1e10).toString(16) + '"',
    },
    features: result,
    traces,
  };
}
