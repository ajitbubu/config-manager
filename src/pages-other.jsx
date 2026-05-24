// Remaining pages: Tenants, Envs, Diff, Deployments, Audit, Settings, Login
import { Fragment, useEffect, useMemo, useState } from 'react';
import { FCC_DATA } from './data.js';
import { api } from './api.js';
import { useStore } from './store.jsx';
import {
  cx, Icons, EnvChip, StatusChip, TenantAvatar, UserAvatar,
  JsonView, useToast, envColors, timeAgo, fmtDate, fmtValue,
} from './ui.jsx';

export function TenantsPage({ tenant, onTenant }) {
  const [sel, setSel] = useState(tenant);
  const [tenantConfig, setTenantConfig] = useState(() => {
    const stored = localStorage.getItem('fcc_tenant_config');
    if (stored) return JSON.parse(stored);
    return Object.fromEntries(FCC_DATA.TENANTS.map(x => [x.id, { modules: [...x.modules], envs: [...x.envs] }]));
  });
  const toast = useToast();
  const persist = (next) => {
    setTenantConfig(next);
    localStorage.setItem('fcc_tenant_config', JSON.stringify(next));
  };
  const t = FCC_DATA.TENANTS.find(x => x.id === sel);
  const cfg = tenantConfig[sel] || { modules: t.modules, envs: t.envs };
  const flags = FCC_DATA.FLAGS.filter(f => cfg.modules.includes(f.module)).length;
  const theme = FCC_DATA.THEMES.find(x => x.id === t.theme);
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Tenants</h1><div className="sub">{FCC_DATA.TENANTS.length} client organizations · module & theme assignment</div></div>
        <div className="actions"><button className="btn"><Icons.external size={14}/>Import</button><button className="btn accent"><Icons.plus size={14}/>New tenant</button></div>
      </div>
      <div className="page-body" style={{display:'grid', gridTemplateColumns:'340px 1fr', gap:14}}>
        <div className="card" style={{padding:0, height:'fit-content'}}>
          <div className="filterbar" style={{borderTopLeftRadius:10, borderTopRightRadius:10}}>
            <div className="search" style={{width:'100%'}}><Icons.search size={13}/><span>Search tenants…</span></div>
          </div>
          {FCC_DATA.TENANTS.map(x => (
            <div key={x.id} className="hstack" style={{padding:'10px 12px', borderBottom:'1px solid var(--border)', cursor:'pointer', background: sel===x.id?'var(--accent-weak)':'transparent'}} onClick={()=>{setSel(x.id); onTenant(x.id);}}>
              <TenantAvatar id={x.id} size={30}/>
              <div style={{minWidth:0}}>
                <div className="text-sm" style={{fontWeight:600}}>{x.name}</div>
                <div className="text-xs muted truncate">{x.industry} · {x.envs.length} envs</div>
              </div>
              <div className="flex1"/>
              <div className="hstack gap-4">{x.envs.map(e => <span key={e} className="dot" style={{background:envColors[e], width:5, height:5, borderRadius:999}}/>)}</div>
            </div>
          ))}
        </div>
        <div className="vstack" style={{gap:12}}>
          <div className="card" style={{padding:16}}>
            <div className="hstack">
              <TenantAvatar id={t.id} size={36}/>
              <div>
                <div style={{fontSize:16, fontWeight:600}}>{t.name}</div>
                <div className="text-xs muted">{t.industry} · {t.slug} · created Mar 2024</div>
              </div>
              <div className="flex1"/>
              <button className="btn sm">Edit</button>
              <button className="btn sm danger">Suspend</button>
            </div>
            <div className="grid grid-4 mt-16">
              {[
                ['Modules', cfg.modules.length],
                ['Environments', cfg.envs.length],
                ['Active flags', flags],
                ['Theme', theme.name],
              ].map(([k,v]) => (
                <div key={k} className="vstack" style={{padding:10, background:'var(--surface-2)', borderRadius:8}}>
                  <div className="text-xs muted">{k}</div>
                  <div style={{fontSize:18, fontWeight:600, letterSpacing:'-0.02em'}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-2">
            <div className="card">
              <div className="card-head"><Icons.env size={14}/>Modules enabled</div>
              <div style={{padding:12}} className="vstack gap-8">
                {['checkout','home','pricing','support','account','tracking','dispatch','billing','player','library','discovery','appointments','records','cards','transfer','onboarding'].map(m => {
                  const on = cfg.modules.includes(m);
                  return (
                    <div key={m} className="hstack" style={{cursor:'pointer'}} onClick={() => {
                      const nextMods = on ? cfg.modules.filter(x => x !== m) : [...cfg.modules, m];
                      persist({ ...tenantConfig, [sel]: { ...cfg, modules: nextMods } });
                      toast(`${t.name}: ${m} ${on ? 'disabled' : 'enabled'}`);
                    }}>
                      <span className="mono text-sm" style={{minWidth:120}}>{m}</span>
                      <div className="flex1"/>
                      <div className="switch" data-on={on}/>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="vstack" style={{gap:12}}>
              <div className="card">
                <div className="card-head"><Icons.palette size={14}/>Assigned theme</div>
                <div style={{padding:12}}>
                  <div className="hstack">
                    <div style={{width:40, height:40, borderRadius:10, background:theme.primaryColor}}/>
                    <div><div style={{fontWeight:600}}>{theme.name}</div><div className="text-xs muted mono">{theme.fontFamily} · r{theme.borderRadius}</div></div>
                    <div className="flex1"/><button className="btn sm">Change</button>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><Icons.env size={14}/>Environments</div>
                <div style={{padding:12}} className="vstack gap-8">
                  {FCC_DATA.ENVS.map(e => {
                    const on = cfg.envs.includes(e.id);
                    return (
                      <div key={e.id} className="hstack" style={{cursor:'pointer'}} onClick={() => {
                        const nextEnvs = on ? cfg.envs.filter(x => x !== e.id) : [...cfg.envs, e.id];
                        persist({ ...tenantConfig, [sel]: { ...cfg, envs: nextEnvs } });
                        toast(`${t.name}: ${e.name} ${on ? 'disabled' : 'enabled'}`);
                      }}>
                        <EnvChip env={e.id}/>
                        <span className="text-sm">{e.name}</span>
                        <div className="flex1"/>
                        <span className="mono text-xs muted">{api.base}/cdn/cfg/{e.id}/{t.id}.json</span>
                        <div className="switch" data-on={on}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnvsPage() {
  const toast = useToast();
  const [rules, setRules] = useState(() => {
    const stored = localStorage.getItem('fcc_promotion_rules');
    return stored ? JSON.parse(stored) : {
      'dev → qa': true, 'qa → stage': true, 'stage → prod': true, 'prod rollback': true,
    };
  });
  const persist = (next) => { setRules(next); localStorage.setItem('fcc_promotion_rules', JSON.stringify(next)); };
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Environments</h1><div className="sub">dev → qa → stage → prod · promotion policies</div></div>
        <div className="actions"><button className="btn"><Icons.plus size={14}/>New env</button></div>
      </div>
      <div className="page-body vstack" style={{gap:14}}>
        <div className="card" style={{padding:16}}>
          <div className="hstack" style={{gap:0, alignItems:'stretch', overflow:'hidden'}}>
            {FCC_DATA.ENVS.map((e, i) => (
              <Fragment key={e.id}>
                <div className="vstack" style={{flex:1, padding:16, border:'1px solid var(--border)', borderRadius:10, background:'var(--surface-2)'}}>
                  <div className="hstack"><EnvChip env={e.id}/><span className="mono text-xs muted" style={{marginLeft:'auto'}}>order {e.order}</span></div>
                  <div style={{fontSize:18, fontWeight:600, marginTop:8, letterSpacing:'-0.02em'}}>{e.name}</div>
                  <div className="muted text-xs">{i===0?'Free iteration':i===1?'Auto-promoted after QA gate':i===2?'Manual approval required':'Signed publish + 2 approvers'}</div>
                  <div className="mt-12 grid grid-2 gap-6">
                    <div><div className="text-xs muted">Tenants</div><div className="mono num text-sm">{FCC_DATA.TENANTS.filter(t => t.envs.includes(e.id)).length}</div></div>
                    <div><div className="text-xs muted">Published</div><div className="mono num text-sm">{FCC_DATA.DEPLOYMENTS.filter(d=>d.env===e.id && d.status==='succeeded').length}</div></div>
                  </div>
                </div>
                {i<FCC_DATA.ENVS.length-1 && <div style={{alignSelf:'center', padding:'0 12px', color:'var(--muted-2)'}}>→</div>}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head">Promotion matrix · who can publish where</div>
          <table className="tbl">
            <thead><tr><th>Role</th>{FCC_DATA.ENVS.map(e => <th key={e.id}><EnvChip env={e.id} size="sm"/></th>)}</tr></thead>
            <tbody>
              {[['Admin', [1,1,1,1]], ['DevOps', [1,1,1,1]], ['Developer', [1,1,0,0]], ['Approver', [0,0,1,1]], ['Viewer', [0,0,0,0]]].map(([r, perms]) => (
                <tr key={r} className="row">
                  <td><span className="chip ghost">{r}</span></td>
                  {perms.map((p, i) => <td key={i}>{p ? <Icons.check size={14} style={{color:'var(--success)'}}/> : <span className="muted-2">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head">Promotion rules</div>
          <div className="vstack" style={{padding:12, gap:10}}>
            {[
              ['dev → qa', 'Any developer with write scope'],
              ['qa → stage', 'Requires: CI green + 1 approver'],
              ['stage → prod', 'Requires: 2 approvers + kill-switch attached'],
              ['prod rollback', 'DevOps only · paging desk notified'],
            ].map(([k,v]) => {
              const on = rules[k] === true;
              return (
                <div key={k} className="hstack" style={{cursor:'pointer'}} onClick={() => {
                  persist({ ...rules, [k]: !on });
                  toast(`${k} ${!on ? 'enabled' : 'disabled'}`);
                }}>
                  <span className="mono text-sm" style={{width:160}}>{k}</span>
                  <span className="text-sm muted">{v}</span>
                  <div className="flex1"/>
                  <div className="switch" data-on={on}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiffPage({ tenant }) {
  const { publish } = useStore();
  const toast = useToast();
  const [a, setA] = useState({ env: 'stage', tenant });
  const [b, setB] = useState({ env: 'prod', tenant });
  const [rA, setRA] = useState({ meta: { version: '—', etag: '—' }, features: {} });
  const [rB, setRB] = useState({ meta: { version: '—', etag: '—' }, features: {} });
  useEffect(() => {
    let cancelled = false;
    api.cdnFetch(a.env, a.tenant, { platform:'web', browser:'chrome', appVersion:'2.1.0', userId:'diff' })
      .then(j => { if (!cancelled) setRA(j); }).catch(() => {});
    api.cdnFetch(b.env, b.tenant, { platform:'web', browser:'chrome', appVersion:'2.1.0', userId:'diff' })
      .then(j => { if (!cancelled) setRB(j); }).catch(() => {});
    return () => { cancelled = true; };
  }, [a.env, a.tenant, b.env, b.tenant]);
  const keys = [...new Set([...Object.keys(rA.features), ...Object.keys(rB.features)])].sort();
  const diffs = keys.map(k => {
    const av = rA.features[k], bv = rB.features[k];
    const s = JSON.stringify(av) === JSON.stringify(bv) ? 'same' : (av===undefined?'add':bv===undefined?'rem':'chg');
    return { k, av, bv, s };
  });
  const changed = diffs.filter(d => d.s !== 'same');

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Diff & compare</h1><div className="sub">{changed.length} of {diffs.length} flags differ</div></div>
        <div className="actions">
          <button className="btn" onClick={async () => {
            try { await navigator.clipboard.writeText(JSON.stringify(changed, null, 2)); toast(`Copied ${changed.length} diff rows`); }
            catch { toast('Copy failed'); }
          }}><Icons.copy size={14}/>Copy diff</button>
          <button className="btn accent" disabled={changed.length === 0} onClick={async () => {
            try {
              await publish(b.tenant, b.env, `Promote from ${a.tenant}/${a.env} · ${changed.length} flags`);
              toast(`Promoted to ${b.tenant}/${b.env}`);
            } catch (e) { toast(`Promote failed: ${e.message}`); }
          }}><Icons.rocket size={14}/>Publish {b.env}</button>
        </div>
      </div>
      <div className="filterbar">
        <span className="text-xs muted">Source</span>
        <select className="select" style={{width:130}} value={a.tenant} onChange={e=>setA(s=>({...s, tenant:e.target.value}))}>
          {FCC_DATA.TENANTS.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="env-switcher">
          {FCC_DATA.ENVS.map(e => <button key={e.id} data-active={a.env===e.id} onClick={()=>setA(s=>({...s, env:e.id}))} style={{color:envColors[e.id]}}><span className="env-dot" style={{background:envColors[e.id]}}/><span style={{color:'var(--ink)'}}>{e.id}</span></button>)}
        </div>
        <div style={{flex:1, textAlign:'center'}}><Icons.diff size={18} style={{color:'var(--muted)'}}/></div>
        <span className="text-xs muted">Target</span>
        <select className="select" style={{width:130}} value={b.tenant} onChange={e=>setB(s=>({...s, tenant:e.target.value}))}>
          {FCC_DATA.TENANTS.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="env-switcher">
          {FCC_DATA.ENVS.map(e => <button key={e.id} data-active={b.env===e.id} onClick={()=>setB(s=>({...s, env:e.id}))} style={{color:envColors[e.id]}}><span className="env-dot" style={{background:envColors[e.id]}}/><span style={{color:'var(--ink)'}}>{e.id}</span></button>)}
        </div>
      </div>
      <div className="page-body" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
        <div className="card" style={{padding:0}}>
          <div className="card-head"><TenantAvatar id={a.tenant} size={16}/><EnvChip env={a.env} size="sm"/><span className="mono sub">{rA.meta.version}</span><div className="spacer"/><span className="chip mono sm">{rA.meta.etag.slice(0,10)}</span></div>
          <DiffList diffs={diffs} side="a"/>
        </div>
        <div className="card" style={{padding:0}}>
          <div className="card-head"><TenantAvatar id={b.tenant} size={16}/><EnvChip env={b.env} size="sm"/><span className="mono sub">{rB.meta.version}</span><div className="spacer"/><span className="chip mono sm">{rB.meta.etag.slice(0,10)}</span></div>
          <DiffList diffs={diffs} side="b"/>
        </div>
        <div className="card" style={{gridColumn:'1 / -1'}}>
          <div className="card-head"><Icons.bolt size={14}/>Changes summary <span className="sub">{changed.length} items</span></div>
          <table className="tbl">
            <thead><tr><th style={{width:30}}></th><th>Flag</th><th>{a.tenant}/{a.env}</th><th>{b.tenant}/{b.env}</th><th>Kind</th></tr></thead>
            <tbody>
              {changed.map(d => (
                <tr key={d.k} className="row">
                  <td>{d.s==='add'?<span style={{color:'var(--success)'}}>+</span>:d.s==='rem'?<span style={{color:'var(--danger)'}}>−</span>:<span style={{color:'var(--warning)'}}>~</span>}</td>
                  <td className="mono">{d.k}</td>
                  <td className="mono text-xs">{fmtValue(d.av)}</td>
                  <td className="mono text-xs">{fmtValue(d.bv)}</td>
                  <td><span className={cx('chip', d.s==='add'&&'success', d.s==='rem'&&'danger', d.s==='chg'&&'warning')}>{d.s==='add'?'added':d.s==='rem'?'removed':'changed'}</span></td>
                </tr>
              ))}
              {changed.length===0 && <tr><td colSpan="5" className="muted text-xs" style={{padding:20, textAlign:'center'}}>No differences.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DiffList({ diffs, side }) {
  return (
    <div style={{maxHeight: 520, overflow:'auto'}}>
      {diffs.map((d, i) => {
        const v = side==='a'?d.av:d.bv;
        const other = side==='a'?d.bv:d.av;
        if (v === undefined && other === undefined) return null;
        const mark = d.s === 'same' ? '' : (v === undefined ? 'rem' : (other===undefined?'add':'chg'));
        return (
          <div key={d.k} className={cx('diff-row', mark)}>
            <div className="gutter">{i+1}</div>
            <div className="code">
              <span style={{color:'var(--accent-ink)'}}>"{d.k}"</span><span style={{color:'var(--muted)'}}>: </span>
              <span>{v===undefined?<span className="muted-2">—</span>:JSON.stringify(v)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DeploymentsPage() {
  const { deployments, publish, rollback } = useStore();
  const [q, setQ] = useState('');
  const [rollbackTarget, setRollbackTarget] = useState(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const toast = useToast();
  const items = deployments.filter(d =>
    !q || d.id.includes(q) || d.tenant.includes(q) || d.version.includes(q) || (d.note||'').toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Deployments</h1><div className="sub">publish pipeline · {deployments.filter(d=>d.status==='succeeded').length} succeeded / {deployments.filter(d=>d.status==='failed').length} failed this week</div></div>
        <div className="actions"><button className="btn"><Icons.history size={14}/>Schedule</button><button className="btn accent" onClick={() => setPublishOpen(true)}><Icons.rocket size={14}/>Publish now</button></div>
      </div>
      <div className="filterbar">
        <div className="search" style={{width:260}}><Icons.search size={13}/>
          <input className="input" style={{border:'none', background:'transparent', padding:0, height:22}} placeholder="Find by id, tenant, version…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <button className="chipfilter active">All status</button>
        <button className="chipfilter">Succeeded</button>
        <button className="chipfilter">Failed</button>
        <button className="chipfilter">In review</button>
        <div className="spacer"/>
        <span className="text-xs muted">Showing {items.length}</span>
      </div>
      <div style={{overflow:'auto'}}>
        <table className="tbl">
          <thead><tr><th>When</th><th>Id</th><th>Tenant</th><th>Env</th><th>Version</th><th>Note</th><th>Items</th><th>By</th><th>Duration</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map(d => (
              <tr key={d.id} className="row">
                <td className="muted text-xs nowrap">{fmtDate(d.at)}</td>
                <td className="mono">{d.id}</td>
                <td><div className="hstack gap-6"><TenantAvatar id={d.tenant} size={16}/><span className="mono">{d.tenant}</span></div></td>
                <td><EnvChip env={d.env} size="sm"/></td>
                <td className="mono">{d.version}</td>
                <td className="text-sm truncate" style={{maxWidth:260}}>{d.note}</td>
                <td className="num">{d.items}</td>
                <td><UserAvatar id={d.by} size={18}/></td>
                <td className="num">{d.duration ? d.duration.toFixed(1)+'s' : '—'}</td>
                <td><StatusChip status={d.status}/></td>
                <td>
                  <div className="hstack gap-4">
                    <button className="btn sm ghost" onClick={async () => {
                      const url = `${api.base}${d.cdn}`;
                      try { await navigator.clipboard.writeText(url); toast(`Copied ${url}`); } catch { toast('Copy failed'); }
                    }}><Icons.copy size={12}/></button>
                    {d.status === 'succeeded' && <button className="btn sm" onClick={() => setRollbackTarget(d)}><Icons.undo size={12}/>Rollback</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rollbackTarget && (
        <>
          <div className="drawer-scrim" data-open={true} onClick={()=>setRollbackTarget(null)}/>
          <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', zIndex:70, pointerEvents:'none'}}>
            <div className="card" style={{width:460, padding:20, boxShadow:'var(--shadow-pop)', pointerEvents:'auto'}}>
              <div className="hstack mb-8"><Icons.undo size={16}/><b>Roll back to {rollbackTarget.version}?</b></div>
              <div className="muted text-xs">This republishes <span className="mono">{rollbackTarget.cdn}</span> with the previous snapshot. Auditors will be notified.</div>
              <div className="card mt-12" style={{padding:10, background:'var(--surface-2)'}}>
                <div className="hstack"><TenantAvatar id={rollbackTarget.tenant} size={18}/><span className="mono">{rollbackTarget.tenant}</span><EnvChip env={rollbackTarget.env} size="sm"/><div className="flex1"/><span className="mono text-xs">{rollbackTarget.items} items</span></div>
              </div>
              <div className="hstack mt-16">
                <button className="btn ghost" onClick={()=>setRollbackTarget(null)}>Cancel</button>
                <div className="flex1"/>
                <button className="btn danger" onClick={async () => {
                  const target = rollbackTarget;
                  setRollbackTarget(null);
                  try {
                    const r = await rollback(target.id);
                    toast(`Rolled back ${target.tenant}/${target.env} → ${r.restoredFrom}`);
                  } catch (e) { toast(`Rollback failed: ${e.message}`); }
                }}>Confirm rollback</button>
              </div>
            </div>
          </div>
        </>
      )}
      {publishOpen && <PublishDialog onClose={() => setPublishOpen(false)} onPublish={async (tenant, env, note) => {
        try {
          const dep = await publish(tenant, env, note);
          toast(`Published ${tenant}/${env} → ${dep.version}`);
          setPublishOpen(false);
        } catch (e) { toast(`Publish failed: ${e.message}`); }
      }}/>}
    </div>
  );
}

function PublishDialog({ onClose, onPublish }) {
  const [tenant, setTenant] = useState(FCC_DATA.TENANTS[0].id);
  const [env, setEnv] = useState('stage');
  const [note, setNote] = useState('Manual publish');
  return (
    <>
      <div className="drawer-scrim" data-open={true} onClick={onClose}/>
      <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', zIndex:70, pointerEvents:'none'}}>
        <div className="card" style={{width:460, padding:20, boxShadow:'var(--shadow-pop)', pointerEvents:'auto'}}>
          <div className="hstack mb-8"><Icons.rocket size={16}/><b>Publish snapshot</b></div>
          <div className="muted text-xs">Snapshots all current flags for the chosen tenant + environment and bumps the version.</div>
          <div className="grid grid-2 mt-12 gap-8">
            <label className="field"><span className="label">Tenant</span>
              <select className="select" value={tenant} onChange={e=>setTenant(e.target.value)}>
                {FCC_DATA.TENANTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="field"><span className="label">Environment</span>
              <select className="select" value={env} onChange={e=>setEnv(e.target.value)}>
                {FCC_DATA.ENVS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </label>
          </div>
          <label className="field mt-12"><span className="label">Note</span>
            <input className="input" value={note} onChange={e=>setNote(e.target.value)}/>
          </label>
          <div className="hstack mt-16">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <div className="flex1"/>
            <button className="btn accent" onClick={() => onPublish(tenant, env, note)}>Publish</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function AuditPage() {
  const { audit } = useStore();
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState(null);
  const items = audit.filter(a =>
    (!q || (a.entity||'').includes(q) || (a.action||'').includes(q)) &&
    (!actionFilter || a.action === actionFilter)
  );
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Audit log</h1><div className="sub">Immutable · exported nightly to S3 · signed by fcc-audit-key</div></div>
        <div className="actions"><button className="btn"><Icons.external size={14}/>Export CSV</button></div>
      </div>
      <div className="filterbar">
        <div className="search" style={{width:260}}><Icons.search size={13}/>
          <input className="input" style={{border:'none', background:'transparent', padding:0, height:22}} placeholder="Entity or action…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        {['publish','update','create','submit','approve','reject','rollback','rbac.grant'].map(a => (
          <button key={a} className={cx('chipfilter mono', actionFilter===a && 'active')} onClick={() => setActionFilter(actionFilter===a?null:a)}>{a}</button>
        ))}
        <div className="spacer"/>
        <span className="text-xs muted">Retention 2y</span>
      </div>
      <div style={{overflow:'auto'}}>
        <table className="tbl">
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Tenant</th><th>Env</th><th>Before</th><th>After</th><th>Version</th></tr></thead>
          <tbody>
            {items.map((a, i) => (
              <tr key={i} className="row">
                <td className="muted text-xs nowrap">{fmtDate(a.at)}</td>
                <td><div className="hstack gap-6"><UserAvatar id={a.user} size={18}/><span>{FCC_DATA.USERS.find(u=>u.id===a.user)?.name}</span><span className="chip ghost sm">{FCC_DATA.USERS.find(u=>u.id===a.user)?.role}</span></div></td>
                <td><span className={cx('chip mono sm', a.action==='publish'&&'success', a.action.includes('fail')&&'danger', a.action==='rollback'&&'danger', a.action==='approve'&&'accent')}>{a.action}</span></td>
                <td className="mono">{a.entity}</td>
                <td>{a.tenant && <TenantAvatar id={a.tenant} size={14}/>} <span className="mono text-xs muted">{a.tenant||'—'}</span></td>
                <td>{a.env ? <EnvChip env={a.env} size="sm"/> : <span className="muted-2">—</span>}</td>
                <td className="mono text-xs muted">{fmtValue(a.before)}</td>
                <td className="mono text-xs">{fmtValue(a.after)}</td>
                <td className="mono text-xs">{a.version||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const toast = useToast();
  const [integrations, setIntegrations] = useState(() => {
    const stored = localStorage.getItem('fcc_integrations');
    return stored ? JSON.parse(stored) : { GitHub: true, Slack: true, PagerDuty: true, Datadog: false, Jira: false };
  });
  const flip = (name) => {
    const next = { ...integrations, [name]: !integrations[name] };
    setIntegrations(next);
    localStorage.setItem('fcc_integrations', JSON.stringify(next));
    toast(`${name} ${next[name] ? 'enabled' : 'disabled'}`);
  };
  return (
    <div className="page">
      <div className="page-head"><div><h1>Settings</h1><div className="sub">Workspace, RBAC, tokens, and integrations</div></div></div>
      <div className="page-body grid grid-2" style={{gap:14}}>
        <div className="card">
          <div className="card-head"><Icons.users size={14}/>Roles & members</div>
          <table className="tbl">
            <thead><tr><th>Member</th><th>Role</th><th>Last active</th><th></th></tr></thead>
            <tbody>
              {FCC_DATA.USERS.map(u => (
                <tr key={u.id} className="row">
                  <td><div className="hstack gap-8"><UserAvatar id={u.id} size={22}/><div><div className="text-sm">{u.name}</div><div className="text-xs muted mono">{u.email}</div></div></div></td>
                  <td><span className={cx('chip', u.role==='Admin'&&'accent', u.role==='DevOps'&&'success', u.role==='Approver'&&'warning')}>{u.role}</span></td>
                  <td className="muted text-xs">active now</td>
                  <td><button className="icon-btn"><Icons.more/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head"><Icons.shield size={14}/>API tokens</div>
          <div className="vstack" style={{padding:12, gap:10}}>
            {[
              ['sdk-prod', 'cfg:read', '2026-12-01'],
              ['ci-publish', 'cfg:publish', '2026-09-15'],
              ['ops-rollback', 'cfg:rollback', '2026-06-30'],
            ].map(([n,s,e]) => (
              <div key={n} className="hstack" style={{padding:10, border:'1px solid var(--border)', borderRadius:8}}>
                <div><div className="text-sm" style={{fontWeight:600}}>{n}</div><div className="text-xs muted mono">fcc_sk_••••••{n.slice(-4)}</div></div>
                <div className="flex1"/>
                <span className="chip ghost sm mono">{s}</span>
                <span className="text-xs muted">exp {e}</span>
                <button className="btn sm danger">Revoke</button>
              </div>
            ))}
            <button className="btn"><Icons.plus size={14}/>Generate token</button>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><Icons.bolt size={14}/>Integrations</div>
          <div className="vstack" style={{padding:12, gap:10}}>
            {[
              ['GitHub', 'Sync flag references from code · detect stale flags'],
              ['Slack', 'Deploy + approval notifications → #platform-fcc'],
              ['PagerDuty', 'Auto-page on failed prod publish'],
              ['Datadog', 'Emit custom metrics for resolution latency'],
              ['Jira', 'Link flags to stories · block publish on missing ticket'],
            ].map(([n, d]) => (
              <div key={n} className="hstack" style={{cursor:'pointer'}} onClick={() => flip(n)}>
                <div style={{width:28, height:28, borderRadius:7, background:'var(--surface-3)'}}/>
                <div style={{minWidth:0}}><div className="text-sm" style={{fontWeight:600}}>{n}</div><div className="text-xs muted truncate">{d}</div></div>
                <div className="flex1"/>
                <div className="switch" data-on={integrations[n] === true}/>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><Icons.book size={14}/>Consumer SDK</div>
          <div style={{padding:12}}>
            <div className="muted text-xs mb-8">Apps load resolved config at boot:</div>
            <pre className="json" style={{maxHeight:260}}>{`import { createClient } from '@fcc/sdk';
const fcc = createClient({
  cdnUrl: 'http://localhost:8787/cdn/cfg/prod/acme.json',
  context: { userId, platform: 'web', browser: 'chrome', appVersion: '2.1.0' },
  pollMs: 30_000,
});
await fcc.ready();

if (fcc.isOn('checkout.newPaymentFlow')) mount(NewCheckout);
const hero = fcc.get('home.heroVariant', 'A');
fcc.onChange(snap => console.log('flags changed →', snap.meta.version));`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login({ onEnter }) {
  const [users, setUsers] = useState(FCC_DATA.USERS);
  const [userId, setUserId] = useState(() => localStorage.getItem('fcc_user') || 'u_1');
  const [remember, setRemember] = useState(true);
  useEffect(() => { api.listUsers().then(setUsers).catch(() => {}); }, []);
  const u = users.find(x => x.id === userId) || users[0];
  const submit = () => { localStorage.setItem('fcc_user', userId); onEnter(); };
  return (
    <div className="login-wrap">
      <div className="card" style={{width: 400, padding: 28, boxShadow:'var(--shadow-pop)'}}>
        <div className="brand" style={{width:'auto', paddingRight:0}}>
          <div className="mark">F</div>
          <div><div>Feature Control Center</div><div className="sub">enterprise · multi-tenant</div></div>
        </div>
        <h2 style={{margin:'20px 0 4px', fontSize:20, letterSpacing:'-0.02em'}}>Sign in</h2>
        <div className="text-xs muted mb-8">Pick an identity to author as. Audit entries are attributed to your selection.</div>
        <label className="field mt-12"><span className="label">Sign in as</span>
          <select className="select" value={userId} onChange={e=>setUserId(e.target.value)}>
            {users.map(x => <option key={x.id} value={x.id}>{x.name} — {x.role}</option>)}
          </select>
        </label>
        <label className="field mt-12"><span className="label">Email</span><input className="input" readOnly value={u?.email || ''}/></label>
        <div className="hstack mt-16">
          <div className="hstack gap-6 text-xs muted" style={{cursor:'pointer'}} onClick={() => setRemember(r => !r)}>
            <div className="switch" data-on={remember}/>Remember me
          </div>
          <div className="flex1"/>
          <a className="text-xs muted">Forgot?</a>
        </div>
        <button className="btn accent w-100 mt-16" style={{width:'100%', justifyContent:'center'}} onClick={submit}>Sign in with SSO</button>
        <hr className="sep mt-16"/>
        <div className="hstack mt-8 gap-8" style={{justifyContent:'center'}}>
          <button className="btn sm">Okta</button><button className="btn sm">Google</button><button className="btn sm">Microsoft</button>
        </div>
        <div className="text-xs muted mt-16" style={{textAlign:'center'}}>© 2026 FCC · v4.12.0 · SOC 2 Type II</div>
      </div>
    </div>
  );
}
