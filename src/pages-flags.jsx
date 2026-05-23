// Dashboard + Feature Flags (hero screen with drawer editor)
import { useEffect, useMemo, useState } from 'react';
import { FCC_DATA } from './data.js';
import {
  cx, Icons, EnvChip, StatusChip, TenantAvatar, UserAvatar,
  Sparkline, Barline, JsonView, useToast, timeAgo, fmtValue,
} from './ui.jsx';

export function Dashboard({ env, tenant, onGoTo }) {
  const flags = FCC_DATA.FLAGS;
  const deps = FCC_DATA.DEPLOYMENTS;
  const audit = FCC_DATA.AUDIT;
  const approvals = FCC_DATA.APPROVALS;
  const fetches = useMemo(() => FCC_DATA.seriesFetches(48), []);
  const publishes = useMemo(() => FCC_DATA.seriesPublishes(48), []);

  const totalFlags = flags.length;
  const activeFlags = flags.filter((f) => f.status === 'active').length;
  const staleFlags = flags.filter((f) => f.status === 'stale').length;
  const publishedConfigs = FCC_DATA.TENANTS.reduce((a, t) => a + t.envs.length, 0);
  const pending = approvals.length;
  const totalReq = fetches.reduce((a, b) => a + b, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">
            <span className="mono">{tenant}</span> · <EnvChip env={env}/> · Live telemetry
          </div>
        </div>
        <div className="actions">
          <button className="btn ghost"><Icons.history size={14}/>Last 24h</button>
          <button className="btn"><Icons.external size={14}/>Status</button>
          <button className="btn accent" onClick={() => onGoTo('flags')}><Icons.plus size={14}/>New flag</button>
        </div>
      </div>
      <div className="page-body vstack" style={{gap:14}}>

        <div className="grid grid-4">
          <div className="card metric">
            <div className="label"><Icons.flag size={13}/> Total flags</div>
            <div className="value">{totalFlags}</div>
            <div className="trend up">+3 this week · {activeFlags} active, {staleFlags} stale</div>
          </div>
          <div className="card metric">
            <div className="label"><Icons.rocket size={13}/> Published configs</div>
            <div className="value">{publishedConfigs}</div>
            <div className="trend">across {FCC_DATA.TENANTS.length} tenants × {FCC_DATA.ENVS.length} envs</div>
          </div>
          <div className="card metric">
            <div className="label"><Icons.clock size={13}/> Pending approvals</div>
            <div className="value">{pending}</div>
            <div className="trend down">1 blocking prod · SLA 4h</div>
          </div>
          <div className="card metric">
            <div className="label"><Icons.bolt size={13}/> Resolved config / hr</div>
            <div className="value">{Math.round(totalReq/48).toLocaleString()}</div>
            <div className="trend up">+12.4% WoW · p99 14ms</div>
          </div>
        </div>

        <div className="grid" style={{gridTemplateColumns:'2fr 1fr', gap:14}}>
          <div className="card">
            <div className="card-head">
              <span>Config fetches</span>
              <span className="sub">last 48h · prod + stage</span>
              <div className="spacer"/>
              <span className="chip accent mono">cdn.fcc.io</span>
            </div>
            <div style={{padding:'16px 16px 8px'}}>
              <Sparkline data={fetches} height={140} />
            </div>
            <div className="hstack" style={{padding:'0 16px 12px', gap: 24}}>
              <div>
                <div className="muted text-xs">Peak</div>
                <div className="mono num" style={{fontSize:13}}>{Math.max(...fetches).toLocaleString()}/hr</div>
              </div>
              <div>
                <div className="muted text-xs">Avg</div>
                <div className="mono num" style={{fontSize:13}}>{Math.round(fetches.reduce((a,b)=>a+b)/fetches.length).toLocaleString()}/hr</div>
              </div>
              <div>
                <div className="muted text-xs">Cache hit</div>
                <div className="mono num" style={{fontSize:13, color:'var(--success)'}}>98.2%</div>
              </div>
              <div>
                <div className="muted text-xs">p50 / p99</div>
                <div className="mono num" style={{fontSize:13}}>3ms / 14ms</div>
              </div>
              <div>
                <div className="muted text-xs">Errors</div>
                <div className="mono num" style={{fontSize:13, color:'var(--success)'}}>0.004%</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <span>Publishes</span>
              <span className="sub">last 48h</span>
              <div className="spacer"/>
              <span className="chip mono">{deps.filter(d=>d.status==='succeeded').length} ok</span>
            </div>
            <div style={{padding:'16px 16px 8px'}}>
              <Barline data={publishes} height={140} />
            </div>
            <div className="vstack" style={{padding:'0 0 6px'}}>
              {deps.slice(0,4).map(d => (
                <div key={d.id} className="activity-row">
                  <StatusChip status={d.status} />
                  <div className="truncate">
                    <div className="text-sm truncate"><span className="mono">{d.version}</span> <span className="muted">{d.note}</span></div>
                    <div className="text-xs muted">{d.id} · <TenantAvatar id={d.tenant} size={14}/> {d.tenant} · <EnvChip env={d.env} size="sm"/></div>
                  </div>
                  <div className="text-xs muted nowrap">{timeAgo(d.at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid" style={{gridTemplateColumns:'1.3fr 1fr 1fr', gap:14}}>
          <div className="card">
            <div className="card-head">
              <span>Pending approvals</span>
              <div className="spacer"/>
              <button className="btn sm ghost">View all →</button>
            </div>
            <table className="tbl">
              <thead><tr><th>Flag</th><th>From → To</th><th>Reviewers</th><th>Age</th><th></th></tr></thead>
              <tbody>
                {approvals.map(a => (
                  <tr key={a.id} className="row">
                    <td>
                      <div className="hstack"><TenantAvatar id={a.tenant} size={16}/><span className="mono">{a.flag}</span></div>
                    </td>
                    <td><EnvChip env={a.from} size="sm"/> → <EnvChip env={a.to} size="sm"/></td>
                    <td>
                      <div className="hstack gap-4">{a.reviewers.map(r => <UserAvatar key={r} id={r} size={18} />)}</div>
                    </td>
                    <td className="muted text-xs nowrap">{timeAgo(a.requestedAt)}</td>
                    <td><button className="btn sm accent">Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-head">
              <span>Environments</span>
              <div className="spacer"/>
              <button className="btn sm ghost" onClick={() => onGoTo('envs')}>Manage</button>
            </div>
            <div className="vstack" style={{padding:10}}>
              {FCC_DATA.ENVS.map(e => {
                const hot = {dev:94, qa:88, stage:72, prod:100}[e.id];
                return (
                  <div key={e.id} className="hstack" style={{padding:'6px 4px'}}>
                    <EnvChip env={e.id} />
                    <span className="text-sm">{e.name}</span>
                    <div className="flex1"/>
                    <div className="bar-track" style={{width:100}}>
                      <div className={cx('bar-fill', e.id==='prod'&&'success', e.id==='stage'&&'warning')} style={{width: hot + '%'}}/>
                    </div>
                    <span className="mono text-xs num muted" style={{width:40,textAlign:'right'}}>{hot}%</span>
                  </div>
                );
              })}
              <hr className="sep"/>
              <div className="text-xs muted" style={{padding:'0 4px'}}>Hot path ≈ % of flags with env-specific overrides.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <span>Tenants</span>
              <div className="spacer"/>
              <button className="btn sm ghost" onClick={() => onGoTo('tenants')}>Manage</button>
            </div>
            <div className="vstack" style={{padding:10}}>
              {FCC_DATA.TENANTS.map(t => (
                <div key={t.id} className="hstack" style={{padding:'4px 2px'}}>
                  <TenantAvatar id={t.id} size={22}/>
                  <div style={{minWidth:0}}>
                    <div className="text-sm" style={{fontWeight:500}}>{t.name}</div>
                    <div className="text-xs muted truncate">{t.industry} · {t.envs.length} envs · {t.modules.length} modules</div>
                  </div>
                  <div className="flex1"/>
                  <span className="chip mono">v{120 + FCC_DATA.TENANTS.indexOf(t)*13}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span>Recent activity</span>
            <div className="spacer"/>
            <button className="btn sm ghost" onClick={() => onGoTo('audit')}>Audit log →</button>
          </div>
          <table className="tbl">
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Tenant / Env</th><th>Before → After</th><th>Version</th></tr></thead>
            <tbody>
              {audit.slice(0, 8).map((e, i) => (
                <tr key={i} className="row">
                  <td className="muted text-xs nowrap">{timeAgo(e.at)}</td>
                  <td><div className="hstack gap-6"><UserAvatar id={e.user} size={18}/><span>{FCC_DATA.USERS.find(u=>u.id===e.user)?.name}</span></div></td>
                  <td><span className="chip ghost mono">{e.action}</span></td>
                  <td className="mono">{e.entity}</td>
                  <td>{e.tenant && <TenantAvatar id={e.tenant} size={14}/>} <span className="mono text-xs muted">{e.tenant||'—'}</span> {e.env && <EnvChip env={e.env} size="sm"/>}</td>
                  <td className="mono text-xs"><span className="muted">{fmtValue(e.before)}</span> → <span>{fmtValue(e.after)}</span></td>
                  <td className="mono text-xs">{e.version||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// ========== FEATURE FLAGS (hero) ==========
export function FlagsPage({ env, tenant, flagsState, setFlagsState }) {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [showStale, setShowStale] = useState(false);
  const [selected, setSelected] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const modules = [...new Set(FCC_DATA.FLAGS.map(f => f.module))];
  const types   = [...new Set(FCC_DATA.FLAGS.map(f => f.type))];

  const items = flagsState.filter(f => {
    if (query && !(f.key.includes(query) || f.name.toLowerCase().includes(query.toLowerCase()))) return false;
    if (moduleFilter && f.module !== moduleFilter) return false;
    if (typeFilter && f.type !== typeFilter) return false;
    if (tagFilter && !f.tags.includes(tagFilter)) return false;
    if (!showStale && f.status === 'stale') return false;
    return true;
  });

  const resolved = useMemo(() => ({
    ...FCC_DATA.resolveAll({ tenant, env, platform: 'web', browser: 'chrome', appVersion: '2.1.0', userId: 'preview-user' })
  }), [tenant, env, flagsState]);

  const selectedFlag = flagsState.find(f => f.key === selected);
  const toast = useToast();

  function effective(f) {
    let v = f.default;
    if (f.overrides?.env && env in f.overrides.env) v = f.overrides.env[env];
    if (f.overrides?.tenant?.[tenant]?.[env] !== undefined) v = f.overrides.tenant[tenant][env];
    return v;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Feature flags</h1>
          <div className="sub">
            Authoring for <TenantAvatar id={tenant} size={14}/> <span className="mono">{tenant}</span> / <EnvChip env={env}/> · overrides resolve left-to-right
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setPreviewOpen(true)}><Icons.eye size={14}/>Resolved preview</button>
          <button className="btn"><Icons.external size={14}/>Import JSON</button>
          <button className="btn accent"><Icons.plus size={14}/>New flag</button>
        </div>
      </div>

      <div className="filterbar">
        <div className="search" style={{width:260}}>
          <Icons.search size={13}/>
          <input className="input" style={{border:'none', background:'transparent', padding:0, height:22}}
                 placeholder="Search key or name…"
                 value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>
        <div className="vsep" style={{height:22}}/>
        <button className={cx('chipfilter', moduleFilter && 'active')} onClick={() => setModuleFilter(null)}>
          <Icons.filter size={12}/>Module: {moduleFilter || 'all'}
        </button>
        {modules.map(m => (
          <button key={m} className={cx('chipfilter', moduleFilter===m && 'active')} onClick={() => setModuleFilter(moduleFilter===m?null:m)}>
            <span className="mono">{m}</span>
          </button>
        ))}
        <div className="vsep" style={{height:22}}/>
        {types.map(t => (
          <button key={t} className={cx('chipfilter', typeFilter===t && 'active')} onClick={() => setTypeFilter(typeFilter===t?null:t)}>
            <span className="dot" style={{background: typeFilter===t?'var(--accent-ink)':'var(--muted-2)'}}/>
            <span className="mono">{t}</span>
          </button>
        ))}
        <div className="spacer"/>
        <label className="hstack gap-6 text-xs muted" style={{cursor:'pointer'}} onClick={()=>setShowStale(s=>!s)}>
          <div className="switch" data-on={showStale}/>
          show stale
        </label>
      </div>

      <div style={{overflow:'auto'}}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:36}}></th>
              <th style={{minWidth:280}}>Key · name</th>
              <th style={{width:100}}>Type</th>
              <th style={{width:200}}>Effective ({env})</th>
              <th style={{width:190}}>Targeting</th>
              <th style={{width:110}}>Rollout</th>
              <th style={{width:120}}>Owner</th>
              <th style={{width:110}}>Updated</th>
              <th style={{width:40}}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(f => {
              const val = effective(f);
              const isOn = f.type==='boolean' && val === true;
              const overridden = f.overrides?.tenant?.[tenant]?.[env] !== undefined;
              return (
                <tr key={f.key} className="row" data-selected={selected===f.key} onClick={() => setSelected(f.key)}>
                  <td>
                    {f.type === 'boolean' ? (
                      <div className="switch" data-on={val===true}
                           onClick={(e)=>{
                             e.stopPropagation();
                             setFlagsState(s => s.map(x => x.key===f.key ? {
                               ...x,
                               overrides: {
                                 ...x.overrides,
                                 env: { ...x.overrides.env, [env]: !val },
                               }
                             } : x));
                             toast(`${f.key} → ${!val} in ${env}`);
                           }}/>
                    ) : (
                      <Icons.dot size={10} style={{color:'var(--muted-2)'}}/>
                    )}
                  </td>
                  <td>
                    <div className="vstack gap-4">
                      <div className="hstack gap-6">
                        <span className="mono" style={{fontSize:12}}>{f.key}</span>
                        {f.killSwitch && <span className="chip danger"><Icons.warn size={10}/>kill</span>}
                        {f.dependencies?.length > 0 && <span className="chip ghost mono text-xs">↳{f.dependencies.length}</span>}
                      </div>
                      <div className="text-xs muted truncate" style={{maxWidth:480}}>{f.name} · {f.description.slice(0,80)}{f.description.length>80?'…':''}</div>
                    </div>
                  </td>
                  <td><span className="chip ghost mono">{f.type}</span></td>
                  <td>
                    <div className="hstack">
                      <span className="mono" style={{ color: f.type==='boolean' ? (isOn?'var(--success)':'var(--muted)') : 'var(--ink)' }}>
                        {fmtValue(val)}
                      </span>
                      {overridden && <span className="chip accent sm" style={{marginLeft:6}}>tenant override</span>}
                    </div>
                    <div className="text-xs muted mono">default: {fmtValue(f.default)}</div>
                  </td>
                  <td>
                    <div className="hstack gap-4">
                      {Object.keys(f.overrides?.platform||{}).length>0 && <span className="chip ghost sm"><Icons.mobile size={10}/>{Object.keys(f.overrides.platform).length}</span>}
                      {Object.keys(f.overrides?.browser||{}).length>0 && <span className="chip ghost sm"><Icons.globe size={10}/>{Object.keys(f.overrides.browser).length}</span>}
                      {Object.keys(f.overrides?.tenant||{}).length>0 && <span className="chip ghost sm"><Icons.users size={10}/>{Object.keys(f.overrides.tenant).length}</span>}
                      {Object.keys(f.overrides?.env||{}).length>0 && <span className="chip ghost sm"><Icons.env size={10}/>{Object.keys(f.overrides.env).length}</span>}
                      {f.dependencies?.length > 0 && <span className="chip ghost sm"><Icons.link size={10}/>dep</span>}
                    </div>
                  </td>
                  <td>
                    {f.rollout?.enabled ? (
                      <div className="hstack gap-6">
                        <div className="bar-track" style={{width:60}}><div className="bar-fill" style={{width: f.rollout.percentage + '%'}}/></div>
                        <span className="mono text-xs num">{f.rollout.percentage}%</span>
                      </div>
                    ) : <span className="muted-2 text-xs">—</span>}
                  </td>
                  <td>
                    <div className="hstack gap-6"><UserAvatar id={f.owner} size={18}/>
                      <span className="text-xs">{FCC_DATA.USERS.find(u=>u.id===f.owner)?.name?.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="muted text-xs">{timeAgo(f.updatedAt)}</td>
                  <td><button className="icon-btn" onClick={(e)=>e.stopPropagation()}><Icons.more/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <FlagDrawer
        open={!!selected}
        flag={selectedFlag}
        env={env}
        tenant={tenant}
        onClose={() => setSelected(null)}
        onChange={(next) => setFlagsState(s => s.map(x => x.key===next.key ? next : x))}
        onSubmit={() => { toast(`Submitted ${selected} for review`); setSelected(null); }}
      />

      <ResolvedDrawer open={previewOpen} onClose={() => setPreviewOpen(false)} resolved={resolved} env={env} tenant={tenant}/>
    </div>
  );
}

function FlagDrawer({ open, flag, env, tenant, onClose, onChange, onSubmit }) {
  const [tab, setTab] = useState('config');
  useEffect(() => { if (open) setTab('config'); }, [open, flag?.key]);
  if (!flag) return <div className="drawer-scrim"/>;
  const envVal = flag.overrides?.env?.[env];
  const tenantVal = flag.overrides?.tenant?.[tenant]?.[env];

  const update = (path, value) => {
    const next = structuredClone(flag);
    let cur = next;
    for (let i = 0; i < path.length - 1; i++) {
      cur[path[i]] = cur[path[i]] || {};
      cur = cur[path[i]];
    }
    cur[path[path.length-1]] = value;
    next.updatedAt = '2026-04-22T06:30:00Z';
    next.updatedBy = 'u_1';
    onChange(next);
  };

  const trace = FCC_DATA.resolveFlag(flag, { tenant, env, platform:'web', browser:'chrome', appVersion:'2.1.0', userId:'preview-user' });

  return (
    <>
      <div className="drawer-scrim" data-open={open} onClick={onClose}/>
      <aside className="drawer" data-open={open}>
        <div className="drawer-head">
          {flag.type === 'boolean' && (
            <div className="switch lg" data-on={envVal === true} onClick={() => update(['overrides','env', env], !(envVal===true))}/>
          )}
          <div style={{minWidth:0}}>
            <div className="hstack gap-6">
              <h3>{flag.name}</h3>
              <StatusChip status={flag.status}/>
              {flag.killSwitch && <span className="chip danger"><Icons.warn size={10}/>kill switch</span>}
            </div>
            <div className="mono">{flag.key}</div>
          </div>
          <div className="flex1"/>
          <button className="btn sm ghost" onClick={onClose}><Icons.close size={14}/></button>
        </div>

        <div className="tabs" style={{padding:'0 16px', background:'var(--surface)'}}>
          {['config','targeting','rollout','dependencies','history','json'].map(t => (
            <button key={t} data-active={tab===t} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="drawer-body">
          {tab === 'config' && (
            <div className="vstack" style={{gap:14}}>
              <div className="grid grid-2">
                <label className="field"><span className="label">Key</span><input className="input mono" readOnly value={flag.key}/></label>
                <label className="field"><span className="label">Display name</span><input className="input" value={flag.name} onChange={e=>update(['name'], e.target.value)}/></label>
              </div>
              <label className="field"><span className="label">Description</span>
                <textarea className="textarea" rows={2} value={flag.description} onChange={e=>update(['description'], e.target.value)}/>
              </label>
              <div className="grid grid-3">
                <label className="field"><span className="label">Type</span>
                  <div className="input" style={{display:'flex',alignItems:'center'}}><span className="mono">{flag.type}</span></div>
                </label>
                <label className="field"><span className="label">Module</span>
                  <div className="input mono">{flag.module}</div>
                </label>
                <label className="field"><span className="label">Owner</span>
                  <div className="input hstack gap-6" style={{padding:'6px 10px'}}><UserAvatar id={flag.owner} size={18}/>{FCC_DATA.USERS.find(u=>u.id===flag.owner)?.name}</div>
                </label>
              </div>

              <div className="card" style={{padding:0}}>
                <div className="card-head"><Icons.env size={14}/> Environment overrides <span className="sub">applies before tenant + platform</span></div>
                <div style={{padding:12}} className="grid grid-4">
                  {FCC_DATA.ENVS.map(e => {
                    const v = flag.overrides?.env?.[e.id];
                    const isCur = e.id === env;
                    return (
                      <div key={e.id} className="vstack gap-6" style={{padding:10, border:'1px solid ' + (isCur?'var(--accent)':'var(--border)'), borderRadius:8, background: isCur?'var(--accent-weak)':'transparent'}}>
                        <div className="hstack"><EnvChip env={e.id}/><span className="muted text-xs">{isCur ? 'current':''}</span></div>
                        <FlagValueInput flag={flag} value={v} onChange={(nv) => update(['overrides','env', e.id], nv)} placeholder={flag.default}/>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{padding:0}}>
                <div className="card-head"><Icons.users size={14}/> Tenant override ({tenant} / {env}) <span className="sub">highest priority in tenant context</span></div>
                <div style={{padding:12}} className="hstack gap-8">
                  <TenantAvatar id={tenant}/>
                  <div className="flex1" style={{maxWidth:280}}>
                    <FlagValueInput flag={flag} value={tenantVal} onChange={(nv) => {
                      update(['overrides','tenant', tenant, env], nv);
                    }} placeholder="inherit from env"/>
                  </div>
                  {tenantVal !== undefined && (
                    <button className="btn sm" onClick={() => {
                      const next = structuredClone(flag);
                      if (next.overrides?.tenant?.[tenant]) delete next.overrides.tenant[tenant][env];
                      onChange(next);
                    }}>Clear</button>
                  )}
                </div>
              </div>

              <div className="grid grid-2">
                <div className="card" style={{padding:0}}>
                  <div className="card-head"><Icons.desktop size={14}/> Platform</div>
                  <div style={{padding:10}} className="vstack gap-6">
                    {['web','mweb','ios','android'].map(p => {
                      const v = flag.overrides?.platform?.[p];
                      return (
                        <div key={p} className="hstack">
                          <span className="mono text-xs" style={{width:56}}>{p}</span>
                          <div className="flex1"><FlagValueInput flag={flag} value={v} onChange={(nv) => update(['overrides','platform', p], nv)} placeholder="inherit"/></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="card" style={{padding:0}}>
                  <div className="card-head"><Icons.globe size={14}/> Browser</div>
                  <div style={{padding:10}} className="vstack gap-6">
                    {['chrome','safari','firefox','edge'].map(b => {
                      const v = flag.overrides?.browser?.[b];
                      return (
                        <div key={b} className="hstack">
                          <span className="mono text-xs" style={{width:56}}>{b}</span>
                          <div className="flex1"><FlagValueInput flag={flag} value={v} onChange={(nv) => update(['overrides','browser', b], nv)} placeholder="inherit"/></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'rollout' && (
            <div className="vstack" style={{gap:14}}>
              <div className="card" style={{padding:14}}>
                <div className="hstack">
                  <div className="flex1">
                    <div style={{fontWeight:600}}>Percentage rollout</div>
                    <div className="muted text-xs">Bucketed by hash({'{userId}:{seed}'})</div>
                  </div>
                  <div className="switch lg" data-on={flag.rollout?.enabled} onClick={()=>update(['rollout','enabled'], !flag.rollout?.enabled)}/>
                </div>
                <div className="hstack mt-12 gap-12">
                  <input type="range" min="0" max="100" value={flag.rollout?.percentage||0}
                         style={{flex:1}}
                         disabled={!flag.rollout?.enabled}
                         onChange={e=>update(['rollout','percentage'], parseInt(e.target.value))}/>
                  <div className="mono num" style={{width:52, textAlign:'right'}}>{flag.rollout?.percentage||0}%</div>
                </div>
                <div className="hstack mt-12 gap-8">
                  <span className="text-xs muted">Seed</span>
                  <input className="input mono" style={{width:200}} value={flag.rollout?.seed||''} disabled={!flag.rollout?.enabled} onChange={e=>update(['rollout','seed'], e.target.value)}/>
                </div>
                <div className="mt-12">
                  <BucketBar percent={flag.rollout?.percentage||0} enabled={flag.rollout?.enabled}/>
                </div>
              </div>

              <div className="card" style={{padding:14}}>
                <div style={{fontWeight:600}}>Simulate</div>
                <div className="muted text-xs">Probe 12 users. Deterministic per userId.</div>
                <BucketGrid flag={flag}/>
              </div>
            </div>
          )}

          {tab === 'targeting' && (
            <TargetingTab flag={flag} tenant={tenant}/>
          )}

          {tab === 'dependencies' && (
            <div className="vstack" style={{gap:10}}>
              <div className="muted text-xs">This flag depends on the following parents. It will evaluate to default if any parent is off.</div>
              {flag.dependencies?.length ? flag.dependencies.map(d => (
                <div key={d} className="card hstack" style={{padding:10}}>
                  <Icons.link size={14}/>
                  <span className="mono">{d}</span>
                  <div className="flex1"/>
                  <span className="chip success sm"><span className="dot"/>evaluated</span>
                </div>
              )) : <div className="muted text-xs">No dependencies.</div>}
            </div>
          )}

          {tab === 'history' && <HistoryTab flag={flag}/>}

          {tab === 'json' && (
            <div>
              <div className="muted text-xs mb-8">Canonical authoring document. POST /api/flags/{flag.key}</div>
              <JsonView data={flag}/>
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <div className="hstack gap-6 text-xs">
            <span className="muted">Resolves to</span>
            <span className="mono" style={{color:'var(--ink)'}}>{fmtValue(trace.value)}</span>
            <span className="muted">via</span>
            {trace.trace.slice(-3).map((t, i) => (
              <span key={i} className="chip ghost sm mono">{t.layer}</span>
            ))}
          </div>
          <div className="flex1"/>
          <button className="btn ghost" onClick={onClose}>Discard</button>
          <button className="btn">Save draft</button>
          <button className="btn accent" onClick={onSubmit}>Submit for review</button>
        </div>
      </aside>
    </>
  );
}

function FlagValueInput({ flag, value, onChange, placeholder }) {
  if (flag.type === 'boolean') {
    return (
      <div className="hstack gap-8">
        <div className="switch" data-on={value===true} onClick={()=>onChange(value===true?false:true)}/>
        <span className="text-xs muted mono">{value===undefined?'inherit':String(value)}</span>
        {value !== undefined && <button className="btn sm ghost" style={{marginLeft:'auto'}} onClick={()=>onChange(undefined)}>clear</button>}
      </div>
    );
  }
  if (flag.type === 'enum') {
    return (
      <div className="hstack gap-4">
        {flag.options.map(o => (
          <button key={o} className={cx('chipfilter', value===o && 'active')} onClick={()=>onChange(o)}>{o}</button>
        ))}
        {value && <button className="btn sm ghost" onClick={()=>onChange(undefined)}>✕</button>}
      </div>
    );
  }
  if (flag.type === 'number' || flag.type === 'percentage') {
    return <input type="number" className="input mono" value={value ?? ''} placeholder={String(placeholder ?? '')} onChange={e=>onChange(e.target.value===''?undefined:Number(e.target.value))}/>;
  }
  if (flag.type === 'json') {
    return <textarea className="textarea mono" rows={3} value={value?JSON.stringify(value,null,2):''} placeholder={JSON.stringify(placeholder)} onChange={e=>{
      try { onChange(JSON.parse(e.target.value)); } catch { /* keep */ }
    }}/>;
  }
  return <input className="input" value={value ?? ''} placeholder={String(placeholder ?? '')} onChange={e=>onChange(e.target.value||undefined)}/>;
}

function BucketBar({ percent, enabled }) {
  const cells = 50;
  const on = Math.round((percent/100) * cells);
  return (
    <div className="hstack" style={{gap:2}}>
      {Array.from({length:cells}).map((_,i) => (
        <div key={i} style={{flex:1, height:22, borderRadius:2, background: i<on?(enabled?'var(--accent)':'var(--border-strong)'):'var(--surface-3)'}}/>
      ))}
    </div>
  );
}

function BucketGrid({ flag }) {
  const users = ['u_1001','u_1002','u_1003','u_1004','u_1005','u_1006','u_1007','u_1008','u_1009','u_1010','u_1011','u_1012'];
  return (
    <div className="grid grid-6 mt-12" style={{gap:6}}>
      {users.map(u => {
        const b = FCC_DATA.hash(u + ':' + (flag.rollout?.seed || flag.key));
        const on = flag.rollout?.enabled && b*100 < (flag.rollout?.percentage||0);
        return (
          <div key={u} className="vstack" style={{gap:2, padding:8, border:'1px solid var(--border)', borderRadius:6, background: on?'var(--success-weak)':'var(--surface-2)'}}>
            <span className="mono text-xs muted">{u.slice(2)}</span>
            <span className="mono text-xs" style={{color: on?'var(--success)':'var(--muted)'}}>{on?'✓ enabled':'— off'}</span>
            <span className="mono text-xs muted-2">{(b*100).toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}

function TargetingTab({ flag, tenant }) {
  return (
    <div className="vstack" style={{gap:12}}>
      <div className="muted text-xs">Override order (highest wins): <span className="mono">rollout → browser → platform → tenant/env → env → default</span></div>
      <div className="card" style={{padding:12}}>
        <div className="hstack mb-8" style={{fontWeight:600}}>App version gates</div>
        <div className="grid grid-2 gap-8">
          <label className="field"><span className="label">Minimum app version</span><input className="input mono" placeholder="e.g. 2.0.0"/></label>
          <label className="field"><span className="label">Maximum app version</span><input className="input mono" placeholder="latest"/></label>
        </div>
      </div>
      <div className="card" style={{padding:12}}>
        <div className="hstack mb-8" style={{fontWeight:600}}>Geo targeting <span className="chip ghost sm">optional</span></div>
        <div className="hstack gap-6 text-xs">
          {['US','CA','MX','EU','UK','APAC'].map(g => <button key={g} className="chipfilter">{g}</button>)}
        </div>
      </div>
      <div className="card" style={{padding:12}}>
        <div className="hstack mb-8" style={{fontWeight:600}}>Custom rule <span className="chip ghost sm">jsonlogic</span></div>
        <textarea className="textarea mono" rows={3} defaultValue={`{"and": [\n  {"==": [{"var": "user.plan"}, "enterprise"]},\n  {">": [{"var": "user.seats"}, 10]}\n]}`}/>
      </div>
    </div>
  );
}

function HistoryTab({ flag }) {
  const rows = FCC_DATA.AUDIT.filter(a => a.entity === flag.key);
  return (
    <div className="timeline">
      {rows.length === 0 && <div className="muted text-xs">No history yet.</div>}
      {rows.map((r,i) => (
        <div key={i} className="tl-item" data-state={r.action}>
          <div className="hstack gap-8">
            <UserAvatar id={r.user} size={18}/>
            <span className="text-sm">{FCC_DATA.USERS.find(u=>u.id===r.user)?.name}</span>
            <span className="chip ghost sm mono">{r.action}</span>
            {r.env && <EnvChip env={r.env} size="sm"/>}
            <span className="muted text-xs" style={{marginLeft:'auto'}}>{timeAgo(r.at)}</span>
          </div>
          <div className="text-xs mono muted" style={{paddingLeft:26}}>{fmtValue(r.before)} → <span style={{color:'var(--ink)'}}>{fmtValue(r.after)}</span> · {r.version}</div>
        </div>
      ))}
    </div>
  );
}

function ResolvedDrawer({ open, onClose, env, tenant }) {
  const [ctx, setCtx] = useState({ platform:'web', browser:'chrome', appVersion:'2.1.0', userId:'preview-user' });
  const r = useMemo(() => FCC_DATA.resolveAll({ tenant, env, ...ctx }), [tenant, env, ctx]);
  const cdnUrl = `https://cdn.fcc.io/cfg/${env}/${tenant}.json`;
  const toast = useToast();
  return (
    <>
      <div className="drawer-scrim" data-open={open} onClick={onClose}/>
      <aside className="drawer" data-open={open}>
        <div className="drawer-head">
          <div className="mark" style={{width:24, height:24, borderRadius:6, background:'var(--accent-weak)', color:'var(--accent-ink)', display:'grid',placeItems:'center',fontFamily:'var(--mono)', fontSize:11, fontWeight:700}}>JSON</div>
          <div>
            <h3>Resolved config preview</h3>
            <div className="mono">{env} · {tenant}</div>
          </div>
          <div className="flex1"/>
          <button className="btn sm ghost" onClick={onClose}><Icons.close size={14}/></button>
        </div>
        <div className="drawer-body">
          <div className="card hstack" style={{padding:10, marginBottom:12}}>
            <Icons.link size={14}/>
            <span className="mono text-xs truncate flex1">{cdnUrl}</span>
            <span className="chip ghost sm mono">ETag {r.meta.etag}</span>
            <button className="btn sm" onClick={()=>toast('CDN URL copied')}><Icons.copy size={12}/>Copy</button>
          </div>
          <div className="card" style={{padding:10, marginBottom:12}}>
            <div className="hstack mb-8" style={{fontWeight:600, fontSize:12}}>Context</div>
            <div className="grid grid-4 gap-8">
              {['web','mweb','ios','android'].map(p => (
                <button key={p} className={cx('chipfilter', ctx.platform===p && 'active')} onClick={()=>setCtx(c=>({...c, platform:p}))}><Icons.mobile size={11}/>{p}</button>
              ))}
            </div>
            <div className="grid grid-4 gap-8 mt-8">
              {['chrome','safari','firefox','edge'].map(b => (
                <button key={b} className={cx('chipfilter', ctx.browser===b && 'active')} onClick={()=>setCtx(c=>({...c, browser:b}))}><Icons.globe size={11}/>{b}</button>
              ))}
            </div>
            <div className="hstack gap-8 mt-8">
              <label className="field flex1"><span className="label">App version</span><input className="input mono" value={ctx.appVersion} onChange={e=>setCtx(c=>({...c, appVersion:e.target.value}))}/></label>
              <label className="field flex1"><span className="label">User id (rollout bucket)</span><input className="input mono" value={ctx.userId} onChange={e=>setCtx(c=>({...c, userId:e.target.value}))}/></label>
            </div>
          </div>
          <JsonView data={{ meta: r.meta, features: r.features }} maxHeight={420}/>
          <div className="mt-16 text-xs muted">GET <span className="mono">/cdn/resolved?env={env}&client={tenant}&platform={ctx.platform}&browser={ctx.browser}&appVersion={ctx.appVersion}</span></div>
        </div>
      </aside>
    </>
  );
}
