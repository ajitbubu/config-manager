const BASE = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8787';

async function req(path, init = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', 'x-user': localStorage.getItem('fcc_user') || 'u_1', ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${init.method || 'GET'} ${path} → ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: BASE,

  getFlags:        () => req('/api/flags'),
  patchFlag:       (key, patch) => req(`/api/flags/${encodeURIComponent(key)}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  listDeployments: () => req('/api/deployments'),
  publish:         (tenant, env, note) => req('/api/deployments', { method: 'POST', body: JSON.stringify({ tenant, env, note }) }),
  rollback:        (id) => req(`/api/deployments/${id}/rollback`, { method: 'POST', body: '{}' }),

  listAudit:       (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
    return req('/api/audit' + (qs ? '?' + qs : ''));
  },

  listApprovals:   () => req('/api/approvals'),
  submitApproval:  (payload) => req('/api/approvals', { method: 'POST', body: JSON.stringify(payload) }),
  approveApproval: (id) => req(`/api/approvals/${id}/approve`, { method: 'POST', body: '{}' }),
  rejectApproval:  (id) => req(`/api/approvals/${id}/reject`, { method: 'POST', body: '{}' }),

  listTenants:     () => req('/api/tenants'),
  listUsers:       () => req('/api/users'),
  listEnvs:        () => req('/api/envs'),

  metricsFetches:  () => req('/api/metrics/fetches'),

  cdnUrl:          (env, tenant, ctx = {}) => {
    const qs = new URLSearchParams(ctx).toString();
    return `${BASE}/cdn/cfg/${env}/${tenant}.json${qs ? '?' + qs : ''}`;
  },
  cdnFetch:        async (env, tenant, ctx = {}) => {
    const r = await fetch(api.cdnUrl(env, tenant, ctx));
    if (!r.ok) throw new Error('cdn ' + r.status);
    return r.json();
  },
};
