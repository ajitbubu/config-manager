import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [flags, setFlags] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [audit, setAudit] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAll = useCallback(async () => {
    try {
      const [f, d, a, ap] = await Promise.all([
        api.getFlags(),
        api.listDeployments(),
        api.listAudit({ limit: 200 }),
        api.listApprovals(),
      ]);
      setFlags(f);
      setDeployments(d);
      setAudit(a);
      setApprovals(ap);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const patchFlag = useCallback(async (key, patch) => {
    const updated = await api.patchFlag(key, patch);
    setFlags(s => s.map(f => f.key === key ? updated : f));
    api.listAudit({ limit: 200 }).then(setAudit).catch(() => {});
    return updated;
  }, []);

  const publish = useCallback(async (tenant, env, note) => {
    const dep = await api.publish(tenant, env, note);
    setDeployments(s => [dep, ...s]);
    api.listAudit({ limit: 200 }).then(setAudit).catch(() => {});
    return dep;
  }, []);

  const rollback = useCallback(async (id) => {
    const r = await api.rollback(id);
    const fresh = await api.listDeployments();
    setDeployments(fresh);
    api.listAudit({ limit: 200 }).then(setAudit).catch(() => {});
    return r;
  }, []);

  const submitApproval = useCallback(async (payload) => {
    const r = await api.submitApproval(payload);
    setApprovals(s => [r, ...s]);
    api.listAudit({ limit: 200 }).then(setAudit).catch(() => {});
    return r;
  }, []);

  const approveApproval = useCallback(async (id) => {
    await api.approveApproval(id);
    const [ap, d, a, f] = await Promise.all([
      api.listApprovals(), api.listDeployments(), api.listAudit({ limit: 200 }), api.getFlags(),
    ]);
    setApprovals(ap); setDeployments(d); setAudit(a); setFlags(f);
  }, []);

  return (
    <StoreContext.Provider value={{
      flags, deployments, audit, approvals, loading, error,
      refreshAll, patchFlag, publish, rollback, submitApproval, approveApproval,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
