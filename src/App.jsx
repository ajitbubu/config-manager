import { useEffect, useState } from 'react';
import { FCC_DATA } from './data.js';
import { Icons, Sidebar, ToastProvider, TopBar } from './ui.jsx';
import { Dashboard, FlagsPage } from './pages-flags.jsx';
import {
  AuditPage, DeploymentsPage, DiffPage, EnvsPage, Login, SettingsPage, TenantsPage,
} from './pages-other.jsx';

const TWEAKS = { theme: 'light' };

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('fcc_authed') === '1');
  const [page, setPage] = useState(() => localStorage.getItem('fcc_page') || 'flags');
  const [env, setEnv] = useState(() => localStorage.getItem('fcc_env') || 'prod');
  const [tenant, setTenant] = useState(() => localStorage.getItem('fcc_tenant') || 'acme');
  const [theme, setTheme] = useState(TWEAKS.theme || 'light');
  const [editMode, setEditMode] = useState(false);
  const [flagsState, setFlagsState] = useState(() => structuredClone(FCC_DATA.FLAGS));

  useEffect(() => { localStorage.setItem('fcc_page', page); }, [page]);
  useEffect(() => { localStorage.setItem('fcc_env', env); }, [env]);
  useEffect(() => { localStorage.setItem('fcc_tenant', tenant); }, [tenant]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  useEffect(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setEditMode(true);
      else if (d.type === '__deactivate_edit_mode') setEditMode(false);
      else if (d.type === '__edit_mode_set_keys' && d.edits) {
        if (d.edits.theme) setTheme(d.edits.theme);
      }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!authed) return <Login onEnter={() => { localStorage.setItem('fcc_authed', '1'); setAuthed(true); }} />;

  let pageEl = null;
  switch (page) {
    case 'dashboard':   pageEl = <Dashboard env={env} tenant={tenant} onGoTo={setPage}/>; break;
    case 'flags':       pageEl = <FlagsPage env={env} tenant={tenant} flagsState={flagsState} setFlagsState={setFlagsState}/>; break;
    case 'tenants':     pageEl = <TenantsPage tenant={tenant} onTenant={setTenant}/>; break;
    case 'envs':        pageEl = <EnvsPage/>; break;
    case 'diff':        pageEl = <DiffPage tenant={tenant}/>; break;
    case 'deployments': pageEl = <DeploymentsPage/>; break;
    case 'audit':       pageEl = <AuditPage/>; break;
    case 'settings':    pageEl = <SettingsPage/>; break;
    default:            pageEl = <Dashboard env={env} tenant={tenant} onGoTo={setPage}/>;
  }

  const setThemeAndPersist = (t) => {
    setTheme(t);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: t } }, '*');
  };

  return (
    <ToastProvider>
      <div className="app">
        <TopBar env={env} onEnv={setEnv} tenant={tenant} onTenant={setTenant}/>
        <Sidebar page={page} onPage={setPage}/>
        <main className="main">{pageEl}</main>
      </div>
      {editMode && (
        <div className="tweaks">
          <span className="title">Tweaks</span>
          <div className="seg">
            <button data-active={theme==='light'} onClick={()=>setThemeAndPersist('light')}><Icons.sun size={12}/> Light</button>
            <button data-active={theme==='dark'} onClick={()=>setThemeAndPersist('dark')}><Icons.moon size={12}/> Dark</button>
          </div>
        </div>
      )}
    </ToastProvider>
  );
}
