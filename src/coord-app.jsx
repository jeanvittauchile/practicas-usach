// coord-app.jsx — App principal del Coordinador (carga ÚLTIMO)
// Define CI (íconos), CoordApp, CoordSidebar y llama a ReactDOM.createRoot().

const { useState, useEffect } = React;

// ─── Iconos SVG (exportados a window.CI para uso en pantallas) ─────────────
const CI = {
  home:     () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:    () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  grad:     () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  mail:     () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>,
  chart:    () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  logout:   () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  building: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 012-2h7a2 2 0 012 2v16"/><path d="M16 21V9h3a2 2 0 012 2v10"/><line x1="9" y1="7" x2="12" y2="7"/><line x1="9" y1="11" x2="12" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>,
  camera:   () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  phone:    () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg>,
};
window.CI = CI;

const NAV = [
  { id:'dashboard',    label:'Dashboard',          icon:'home'     },
  { id:'asignaciones', label:'Profesores',          icon:'users'    },
  { id:'estudiantes',  label:'Estudiantes',         icon:'grad'     },
  { id:'centros',      label:'Centros',             icon:'building' },
  { id:'visitas',      label:'Visitas en terreno',  icon:'camera'   },
  { id:'cartas',       label:'Cartas',              icon:'mail'     },
  { id:'reportes',     label:'Reportes',            icon:'chart'    },
  { id:'usuarios',     label:'Usuarios',            icon:'users'    },
];

// ─── CoordApp ──────────────────────────────────────────────────────────────
function CoordApp() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('usach_auth_v2')); } catch { return null; } })();
  const [screen, setScreen] = useState('dashboard');
  const [navParams, setNavParams] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profs, setProfs] = useState([]);
  const [students, setStudents] = useState([]);
  const [cartas, setCartas] = useState([]);
  const [centros, setCentros] = useState([]);
  const [toasts, setToasts] = useState([]);

  const nav = (s, params = {}) => { setNavParams(params); setScreen(s); setSidebarOpen(false); };

  useEffect(() => {
    if (!user || user.rol !== 'coordinador') { window.location.replace('Login.html'); return; }
    DB.init();
    reload();
  }, []);

  const reload = () => {
    setProfs(DB.getProfs());
    setStudents(DB.getStudents());
    setCartas(DB.getCartas());
    setCentros(DB.getCentros());
  };

  const toast = (msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const logout = () => {
    localStorage.removeItem('usach_auth_v2');
    window.location.replace('Login.html');
  };

  const ctx = {
    profs, students, cartas, centros,
    navParams,
    onNav: nav,
    reload,
    toast,
    saveProf:        (p) => { DB.saveProf(p);                        setProfs(DB.getProfs()); },
    deleteProf:      (id) => { DB.deleteProf(id);                    setProfs(DB.getProfs()); },
    saveStudent:     (s) => { DB.saveStudent(s);                     setStudents(DB.getStudents()); },
    deleteStudent:   (id) => { DB.deleteStudent(id);                 setStudents(DB.getStudents()); },
    importStudents:  (rows, pid, prac) => { DB.importStudents(rows, pid, prac); setStudents(DB.getStudents()); },
    saveCarta:       (c) => { DB.saveCarta(c);                       setCartas(DB.getCartas()); },
    deleteCarta:     (id) => { DB.deleteCarta(id);                   setCartas(DB.getCartas()); },
    saveCentro:      (c) => { DB.saveCentro(c);                      setCentros(DB.getCentros()); },
    deleteCentro:    (id) => { DB.deleteCentro(id);                  setCentros(DB.getCentros()); },
  };

  if (!user || user.rol !== 'coordinador') return null;

  const DashboardScreen        = window.DashboardScreen;
  const AsignacionesScreen     = window.AsignacionesScreen;
  const EstudiantesCoordScreen = window.EstudiantesCoordScreen;
  const CentrosScreen          = window.CentrosScreen;
  const CoordVisitasScreen     = window.CoordVisitasScreen;
  const CartasScreen           = window.CartasScreen;
  const ReportesScreen         = window.ReportesScreen;
  const UsuariosScreen         = window.UsuariosScreen;

  const avatar = n => (n||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

  return (
    <div className="app">
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && <div className="sidebar-backdrop visible" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-is-open' : ''}`}>
        <div className="sidebar-brand" style={{ gap:12 }}>
          <img src="src/usach-logo.png" alt="" style={{ width:32, height:32, borderRadius:6, objectFit:'contain' }} onError={e=>e.target.style.display='none'}/>
          <div>
            <div style={{ fontWeight:700, fontSize:13.5, color:'#fff', lineHeight:1.2 }}>Prácticas USACH</div>
            <div style={{ fontSize:10.5, color:'rgba(255,255,255,.55)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase' }}>Coordinador</div>
          </div>
        </div>

        <div className="nav-section-label" style={{ marginTop:8 }}>MÓDULOS</div>
        {NAV.map(n => (
          <button key={n.id} className={`nav-item ${screen===n.id?'active':''}`} onClick={() => nav(n.id)}>
            {CI[n.icon]()} {n.label}
          </button>
        ))}

        <div style={{ marginTop:'auto' }}>
          {DEMO_MODE && (
            <div style={{ margin:'0 12px 10px', padding:'7px 10px', background:'rgba(255,152,0,.15)', borderRadius:8, fontSize:11, color:'#ffb74d', fontWeight:700, textAlign:'center', letterSpacing:'.04em' }}>
              ⬡ MODO DEMO · datos locales
            </div>
          )}
          <div style={{ borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:10, margin:'0 0 4px' }}>
            <button className="nav-item" onClick={logout} style={{ color:'rgba(255,255,255,.65)' }}>{CI.logout()} Cerrar sesión</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px' }}>
            <div className="avatar-sm" style={{ width:30, height:30, fontSize:11, background:'var(--teal-600)', flexShrink:0 }}>{avatar(user.nombre)}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,.9)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:154 }}>{user.nombre}</div>
              <div style={{ fontSize:10.5, color:'rgba(255,255,255,.45)' }}>Coordinador/a</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="coord-topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menú">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="crumb">
            Coordinador <span style={{ color:'var(--border)', margin:'0 4px' }}>›</span>
            <strong>{NAV.find(n=>n.id===screen)?.label || screen}</strong>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            <a href="Login.html" className="btn btn-ghost btn-sm" style={{ fontSize:12 }}>← Login</a>
            <a href="App Prácticas USACH.html" className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>Entrar a las prácticas</a>
          </div>
        </div>

        <div className="content">
          {screen==='dashboard'    && <DashboardScreen        ctx={ctx} />}
          {screen==='asignaciones' && <AsignacionesScreen     ctx={ctx} />}
          {screen==='estudiantes'  && <EstudiantesCoordScreen ctx={ctx} />}
          {screen==='centros'      && <CentrosScreen          ctx={ctx} />}
          {screen==='visitas'      && <CoordVisitasScreen      ctx={ctx} />}
          {screen==='cartas'       && <CartasScreen           ctx={ctx} />}
          {screen==='reportes'     && <ReportesScreen         ctx={ctx} />}
          {screen==='usuarios'     && <UsuariosScreen         ctx={ctx} />}

        </div>
      </main>

      {/* Toast stack */}
      <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:8, zIndex:999 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{ background: t.type==='error' ? '#dc2626' : undefined, minWidth:240, display:'flex', alignItems:'center', gap:10 }}>
            {t.type==='error' ? '✕' : '✓'} {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mount (espera la sincronización inicial con Firebase) ─────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
(window.CLOUD ? window.CLOUD.ready : Promise.resolve()).then(() => {
  root.render(<CoordApp />);
});
