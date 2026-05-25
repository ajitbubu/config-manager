// Shared primitives: icons, chips, sparkline, JSON, avatars, env pill, topbar, sidebar, toast
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FCC_DATA } from './data.js';

export const cx = (...c) => c.filter(Boolean).join(' ');

// ------ Icons (stroked lucide-style, 16px) ------
const I = (p) => React.createElement('svg', { width: p.size||16, height: p.size||16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round', ...p });
export const Icons = {
  dashboard: (p) => <I {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></I>,
  flag: (p) => <I {...p}><path d="M4 21V4M4 4h11l-2 3 2 3H4"/></I>,
  users: (p) => <I {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3 2.8-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15 20c0-2 1.6-3.5 4-3.5"/></I>,
  palette: (p) => <I {...p}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.9-.6-1.3-.6-2.1 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="15.5" cy="7.5" r="1"/><circle cx="17.5" cy="11.5" r="1"/></I>,
  env: (p) => <I {...p}><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="7" cy="7" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="17" cy="17" r="1.4" fill="currentColor"/></I>,
  diff: (p) => <I {...p}><path d="M9 4L5 8l4 4"/><path d="M15 12l4 4-4 4"/><path d="M5 8h10a4 4 0 0 1 4 4"/><path d="M19 16H9a4 4 0 0 1-4-4"/></I>,
  rocket: (p) => <I {...p}><path d="M13 3c4 0 7 3 7 7-2 0-5 2-7 7-5-2-7-5-7-7 0-4 3-7 7-7Z"/><circle cx="13" cy="9" r="2"/><path d="M6 17l-2 3 3-2"/></I>,
  logs: (p) => <I {...p}><path d="M5 4h10l4 4v12H5z"/><path d="M14 4v5h5"/><path d="M8 13h8M8 17h5"/></I>,
  gear: (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.6 21 13v-2l-1.6-.6-.6-1.5.8-1.5-1.4-1.4-1.5.8-1.5-.6L14 4h-2l-.6 1.6-1.5.6-1.5-.8L7 6.8l.8 1.5-.6 1.5L5.6 10.4v2l1.6.6.6 1.5-.8 1.5 1.4 1.4 1.5-.8 1.5.6L10 20h2l.6-1.6 1.5-.6 1.5.8 1.4-1.4-.8-1.5.6-1.5Z"/></I>,
  search: (p) => <I {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></I>,
  plus: (p) => <I {...p}><path d="M12 5v14M5 12h14"/></I>,
  close: (p) => <I {...p}><path d="M6 6l12 12M18 6 6 18"/></I>,
  chev: (p) => <I {...p}><path d="m6 9 6 6 6-6"/></I>,
  copy: (p) => <I {...p}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></I>,
  link: (p) => <I {...p}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></I>,
  external: (p) => <I {...p}><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/></I>,
  check: (p) => <I {...p}><path d="m5 12 5 5L20 6"/></I>,
  dot: (p) => <I {...p}><circle cx="12" cy="12" r="4" fill="currentColor"/></I>,
  more: (p) => <I {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></I>,
  filter: (p) => <I {...p}><path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z"/></I>,
  sort: (p) => <I {...p}><path d="M7 4v16M7 4l-3 3M7 4l3 3"/><path d="M17 20V4M17 20l-3-3M17 20l3-3"/></I>,
  tag: (p) => <I {...p}><path d="M12 3H4v8l10 10 8-8L12 3Z"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></I>,
  bolt: (p) => <I {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z"/></I>,
  book: (p) => <I {...p}><path d="M4 5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h14"/></I>,
  chat: (p) => <I {...p}><path d="M21 12a8 8 0 1 1-3.3-6.4L21 5l-1.3 3.1A8 8 0 0 1 21 12Z"/></I>,
  clock: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></I>,
  sun: (p) => <I {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></I>,
  moon: (p) => <I {...p}><path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10Z"/></I>,
  eye: (p) => <I {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></I>,
  history: (p) => <I {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></I>,
  shield: (p) => <I {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/></I>,
  mobile: (p) => <I {...p}><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></I>,
  desktop: (p) => <I {...p}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></I>,
  globe: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></I>,
  warn: (p) => <I {...p}><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17.5v.5"/></I>,
  pause: (p) => <I {...p}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></I>,
  play: (p) => <I {...p}><path d="M7 4v16l13-8L7 4Z"/></I>,
  undo: (p) => <I {...p}><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></I>,
  lightning: (p) => <I {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" fill="currentColor" stroke="none"/></I>,
  bell: (p) => <I {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z"/><path d="M10 20a2 2 0 0 0 4 0"/></I>,
};

// ------ Tenant colors ------
export const tenantColors = {
  acme: '#F26A4F',
  northwind: '#0F766E',
  helios: '#EAB308',
  orbit: '#7C3AED',
  vanta: '#0EA5E9',
};
export const envColors = { dev: '#6B7280', qa: '#A855F7', stage: '#F59E0B', prod: '#10B981' };

export function TenantAvatar({ id, size = 20 }) {
  const t = FCC_DATA.TENANTS.find((t) => t.id === id);
  const letter = (t?.name || id || '?').trim()[0].toUpperCase();
  return (
    <span className="tavatar" style={{ background: tenantColors[id] || '#64748B', width: size, height: size, borderRadius: size >= 22 ? 6 : 5 }}>
      {letter}
    </span>
  );
}

export function UserAvatar({ id, size = 20, ring }) {
  const u = FCC_DATA.USERS.find((u) => u.id === id);
  const bg = [
    'linear-gradient(135deg,#0F172A,#475569)',
    'linear-gradient(135deg,#7C3AED,#312E81)',
    'linear-gradient(135deg,#0E7490,#052E2B)',
    'linear-gradient(135deg,#B4711A,#7C2D12)',
    'linear-gradient(135deg,#0E9F6E,#064E3B)',
    'linear-gradient(135deg,#334155,#0F172A)',
  ][FCC_DATA.USERS.findIndex((x) => x.id === id) % 6];
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: size >= 22 ? '50%' : 5,
        fontSize: size * 0.42,
        background: bg,
        outline: ring ? '2px solid ' + ring : undefined,
        outlineOffset: 1,
      }}
    >
      {u?.avatar || '?'}
    </span>
  );
}

export function EnvChip({ env, dot = true, size }) {
  const label = { dev: 'dev', qa: 'qa', stage: 'stage', prod: 'prod' }[env] || env;
  return (
    <span className={cx('chip', 'env-' + env, size === 'sm' && 'sm')}>
      {dot && <span className="dot" style={{ background: envColors[env] }} />}
      {label}
    </span>
  );
}

export function StatusChip({ status }) {
  const map = {
    succeeded: { cls: 'success', label: 'succeeded' },
    in_review: { cls: 'warning', label: 'in review' },
    failed:    { cls: 'danger', label: 'failed' },
    rolled_back: { cls: 'danger', label: 'rolled back' },
    pending:   { cls: 'warning', label: 'pending' },
    active:    { cls: 'success', label: 'active' },
    stale:     { cls: '', label: 'stale' },
  };
  const m = map[status] || { cls: '', label: status };
  return <span className={cx('chip', m.cls)}><span className="dot" />{m.label}</span>;
}

// ------ Sparkline / barline SVGs ------
export function Sparkline({ data, stroke = 'var(--accent)', fill = 'var(--accent-weak)', height = 44 }) {
  const w = 240;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const n = data.length;
  const pts = data.map((v, i) => [i / (n - 1) * w, height - ((v - min) / Math.max(1, (max - min))) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const dFill = d + ` L${w} ${height} L0 ${height} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <path d={dFill} fill={fill} opacity="0.6" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.4" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={stroke} />
    </svg>
  );
}

export function Barline({ data, color = 'var(--accent)', height = 44 }) {
  const w = 240;
  const max = Math.max(1, ...data);
  const bw = w / data.length;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const h = (v / max) * (height - 4);
        return <rect key={i} x={i * bw + 1} y={height - h - 2} width={Math.max(1, bw - 2)} height={h} rx="1" fill={v > 0 ? color : 'var(--border)'} />;
      })}
    </svg>
  );
}

// ------ JSON highlighter ------
export function highlightJson(obj, indent = 2) {
  const json = JSON.stringify(obj, null, indent);
  return json.replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (m) => {
    let cls = 'num';
    if (/^"/.test(m)) {
      cls = /:$/.test(m) ? 'key' : 'str';
    } else if (/true|false/.test(m)) cls = 'bool';
    else if (/null/.test(m)) cls = 'null';
    return `<span class="${cls}">${m}</span>`;
  });
}

export function JsonView({ data, maxHeight }) {
  const html = useMemo(() => highlightJson(data), [data]);
  return <pre className="json" style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ------ Toast ------
const ToastCtx = createContext({ notify: () => {} });
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const tref = useRef();
  const notify = useCallback((text) => {
    setMsg(text);
    clearTimeout(tref.current);
    tref.current = setTimeout(() => setMsg(null), 2400);
  }, []);
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div className="toast" data-show={!!msg}>
        <span className="dot" />
        {msg}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx).notify;

// ------ Topbar ------
export function TopBar({ env, onEnv, tenant, onTenant, onOpenSearch }) {
  const envs = FCC_DATA.ENVS;
  const tenants = FCC_DATA.TENANTS;
  const t = tenants.find((t) => t.id === tenant);
  return (
    <div className="topbar">
      <div className="brand">
        <img src="/logo.svg" alt="Data Safeguard" className="brand-logo"/>
        <div className="vsep" style={{ height: 22, margin: '0 4px' }} />
        <div className="brand-sub">Feature Control</div>
      </div>
      <div className="topbar-center">
        <button className="tenant-pill" onClick={() => {
          const idx = tenants.findIndex((x) => x.id === tenant);
          onTenant(tenants[(idx + 1) % tenants.length].id);
        }}>
          <TenantAvatar id={tenant} />
          <span>{t.name}</span>
          <span className="muted mono text-xs">{t.industry}</span>
          <Icons.chev size={14} />
        </button>
        <div className="vsep" style={{ height: 20 }} />
        <div className="env-switcher">
          {envs.map((e) => (
            <button key={e.id} data-active={env === e.id} onClick={() => onEnv(e.id)} style={{ color: envColors[e.id] }}>
              <span className="env-dot" style={{ background: envColors[e.id] }} />
              <span style={{ color: 'var(--ink)', opacity: env === e.id ? 1 : 0.7 }}>{e.id}</span>
            </button>
          ))}
        </div>
        <div className="search" onClick={onOpenSearch}>
          <Icons.search size={14} />
          <span>Search flags, tenants, versions…</span>
          <kbd>⌘K</kbd>
        </div>
      </div>
      <div className="topbar-right">
        <button className="icon-btn" title="Docs"><Icons.book size={15} /></button>
        <button className="icon-btn" title="Activity"><Icons.bell size={15} /></button>
        <div className="vsep" style={{ height: 20 }} />
        <UserAvatar id="u_1" size={26} />
      </div>
    </div>
  );
}

// ------ Sidebar ------
export function Sidebar({ page, onPage }) {
  const groups = [
    { title: null, items: [{ id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard }] },
    { title: 'Manage', items: [
      { id: 'flags', label: 'Feature Flags', icon: Icons.flag, count: FCC_DATA.FLAGS.length },
      { id: 'tenants', label: 'Tenants', icon: Icons.users, count: FCC_DATA.TENANTS.length },
      { id: 'envs', label: 'Environments', icon: Icons.env, count: FCC_DATA.ENVS.length },
    ]},
    { title: 'Operate', items: [
      { id: 'diff', label: 'Diff & Compare', icon: Icons.diff },
      { id: 'deployments', label: 'Deployments', icon: Icons.rocket, count: FCC_DATA.DEPLOYMENTS.length },
      { id: 'audit', label: 'Audit Log', icon: Icons.logs, count: FCC_DATA.AUDIT.length },
    ]},
    { title: null, items: [{ id: 'settings', label: 'Settings', icon: Icons.gear }] },
  ];
  return (
    <aside className="sidebar">
      {groups.map((g, i) => (
        <div className="nav-section" key={i}>
          {g.title && <h5>{g.title}</h5>}
          {g.items.map((it) => (
            <div key={it.id} className="nav-item" data-active={page === it.id} onClick={() => onPage(it.id)}>
              <it.icon size={15} />
              <span>{it.label}</span>
              {it.count != null && <span className="count">{it.count}</span>}
            </div>
          ))}
        </div>
      ))}
      <div className="sidebar-footer">
        <UserAvatar id="u_1" size={26} />
        <div style={{ minWidth: 0 }}>
          <div className="text-xs" style={{ fontWeight: 600 }}>Priya Natarajan</div>
          <div className="text-xs muted truncate">Admin · fcc.internal</div>
        </div>
        <button className="icon-btn" title="Sign out"><Icons.external size={14} /></button>
      </div>
    </aside>
  );
}

// ------ Small helpers ------
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const now = new Date('2026-04-22T06:30:00Z').getTime();
  const s = Math.max(0, Math.floor((now - then) / 1000));
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
export function fmtValue(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') return '"' + v + '"';
  return String(v);
}
