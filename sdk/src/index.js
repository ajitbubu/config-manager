export function createClient({ cdnUrl, context = {}, pollMs = 30_000 }) {
  if (!cdnUrl) throw new Error('@fcc/sdk: cdnUrl required');

  let snapshot = { meta: {}, features: {} };
  let etag = null;
  let timer = null;
  const listeners = new Set();
  let readyResolve;
  const readyP = new Promise(r => { readyResolve = r; });

  const url = () => {
    const u = new URL(cdnUrl);
    for (const [k, v] of Object.entries(context)) {
      if (v != null) u.searchParams.set(k, String(v));
    }
    return u.toString();
  };

  async function poll() {
    try {
      const headers = etag ? { 'If-None-Match': etag } : {};
      const res = await fetch(url(), { headers });
      if (res.status === 304) return;
      if (!res.ok) throw new Error('fcc: HTTP ' + res.status);
      const newEtag = res.headers.get('ETag');
      const json = await res.json();
      const changed = JSON.stringify(json.features) !== JSON.stringify(snapshot.features);
      snapshot = json;
      etag = newEtag;
      if (changed) for (const fn of listeners) fn(snapshot);
      if (readyResolve) { readyResolve(snapshot); readyResolve = null; }
    } catch (e) {
      console.warn('[@fcc/sdk] poll error', e.message);
    }
  }

  function start() {
    if (timer) return;
    poll();
    timer = setInterval(poll, pollMs);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  start();

  return {
    ready: () => readyP,
    get: (key, fallback) => (key in snapshot.features ? snapshot.features[key] : fallback),
    isOn: (key) => snapshot.features[key] === true,
    snapshot: () => snapshot,
    meta: () => snapshot.meta,
    onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    refresh: poll,
    stop,
  };
}
