// app.jsx — Main entry: state, router, tweaks panel
// Loads after all component scripts.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "practica": "I",
  "density": "regular",
  "primaryColor": "#009688",
  "dataState": "demo",
  "showMobile": false,
  "driveUrl": "https://drive.google.com/drive/folders/practica-usach-2025"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // ─── Estado persistente. activatePractica conserva la identidad de
  //     window.USACH_DATA, por lo que las pantallas siempre ven los datos vivos.
  const [practica, setPractica] = useState(() => { window.activatePractica(t.practica || 'I'); return t.practica || 'I'; });
  const [state, setState] = useState(() => loadState(window.USACH_DATA.activeCodigo, t.dataState || 'demo'));

  // PDF / Reports modal state
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(null);

  // Cambiar de práctica (tweak o selector del sidebar)
  const cambiarPractica = useCallback((cod) => {
    if (cod === window.USACH_DATA.activeCodigo) return;
    window.activatePractica(cod);
    setPractica(cod);
    setState(loadState(cod, t.dataState));
    setRoute({ screen: 'dashboard', params: {} });
    if (t.practica !== cod) setTweak('practica', cod);
  }, [t.dataState, t.practica, setTweak]);

  useEffect(() => { if (t.practica && t.practica !== practica) cambiarPractica(t.practica); }, [t.practica]);

  // Si el coordinador entra con ?practica=CÓDIGO, abrir esa práctica
  useEffect(() => {
    const pr = new URLSearchParams(window.location.search).get('practica');
    if (pr && ['I','II','III','IV','PI','PII'].includes(pr)) cambiarPractica(pr);
  }, []);

  // Si el profesor no tiene asignada la práctica activa, cambiar a su primera práctica asignada
  useEffect(() => {
    const _au = window.__authUser;
    if (!_au || _au.rol === 'coordinador') return;
    const asig = _au.practicasAsignadas;
    if (!Array.isArray(asig) || asig.length === 0) return;
    if (!asig.includes(practica)) cambiarPractica(asig[0]);
  }, []);

  // Re-init when dataState tweak changes (carga lo guardado si existe)
  useEffect(() => { setState(loadState(window.USACH_DATA.activeCodigo, t.dataState)); }, [t.dataState]);

  // Persistencia: guarda TODO lo editable por práctica en localStorage.
  // Como localStorage es compartido en el navegador, las ediciones quedan
  // guardadas y se transfieren entre cuentas (profesor ↔ coordinador).
  useEffect(() => {
    try { localStorage.setItem(stateKey(practica, t.dataState), JSON.stringify(state)); } catch (e) {}
  }, [state, practica, t.dataState]);

  // Push primary color & density to CSS vars
  useEffect(() => {
    document.documentElement.setAttribute('data-density', t.density);
  }, [t.density]);
  useEffect(() => {
    const c = t.primaryColor;
    if (c && c !== '#009688') {
      // override teal-500 + derived
      document.documentElement.style.setProperty('--teal-500', c);
      document.documentElement.style.setProperty('--teal-600', darken(c, 8));
      document.documentElement.style.setProperty('--teal-700', darken(c, 16));
      document.documentElement.style.setProperty('--teal-50',  lighten(c, 90));
      document.documentElement.style.setProperty('--teal-300', lighten(c, 30));
      document.documentElement.style.setProperty('--teal-400', lighten(c, 15));
    } else {
      document.documentElement.style.removeProperty('--teal-500');
      document.documentElement.style.removeProperty('--teal-600');
      document.documentElement.style.removeProperty('--teal-700');
      document.documentElement.style.removeProperty('--teal-50');
      document.documentElement.style.removeProperty('--teal-300');
      document.documentElement.style.removeProperty('--teal-400');
    }
  }, [t.primaryColor]);

  // ─── Router ───────────────────────────────────────────────────
  const [route, setRoute] = useState({ screen: 'dashboard', params: {} });
  const nav = useCallback((screen, params = {}) => {
    setRoute({ screen, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Toast ────────────────────────────────────────────────────
  const [toastMsg, toastEl] = useToast();

  // ─── PDF modal state ──────────────────────────────────────────
  const [pdfModal, setPdfModal] = useState(null);

  // ─── Mutations ────────────────────────────────────────────────
  const ctx = useMemo(() => ({
    state,
    nav,
    toast: toastMsg,
    driveUrl: t.driveUrl,
    navTo: nav,
    openEval: (id) => nav('eval', { id }),
    openGrade: (id) => nav('grade', { id }),
    openStudentPdf: (ev, est) => setPdfModal({ kind: 'student', ev, est }),
    setNivel: (evId, estId, crId, key) => setState(s => {
      const ns = { ...s.niveles };
      ns[evId] = { ...(ns[evId] || {}) };
      ns[evId][estId] = { ...(ns[evId][estId] || {}) };
      if (key == null) delete ns[evId][estId][crId];
      else ns[evId][estId][crId] = key;
      return { ...s, niveles: ns };
    }),
    setAtraso: (evId, estId, dias) => setState(s => {
      const a = { ...s.atrasos };
      a[evId] = { ...(a[evId] || {}) };
      a[evId][estId] = dias;
      return { ...s, atrasos: a };
    }),
    setSupervisor: (respKey, estId, indId, key) => setState(s => {
      const r = { ...s[respKey] };
      r[estId] = { ...(r[estId] || {}) };
      if (key == null) delete r[estId][indId];
      else r[estId][indId] = key;
      return { ...s, [respKey]: r };
    }),
    // ─── Edición de columnas del instrumento del supervisor (Práctica I) ───
    setSupDims: (updater) => setState(s => ({ ...s, supervisorDims: updater(s.supervisorDims || []) })),
    setSupIndicadorTexto: (indId, texto) => setState(s => ({
      ...s,
      supervisorDims: (s.supervisorDims || []).map(d => ({
        ...d, indicadores: d.indicadores.map(ind => ind.id === indId ? { ...ind, texto } : ind),
      })),
    })),
    setSupDimLabel: (dimId, label) => setState(s => ({
      ...s,
      supervisorDims: (s.supervisorDims || []).map(d => d.id === dimId ? { ...d, label } : d),
    })),
    moveSupIndicador: (indId, toDimId) => setState(s => {
      let moved = null;
      const dims = (s.supervisorDims || []).map(d => {
        const keep = d.indicadores.filter(ind => { if (ind.id === indId) { moved = ind; return false; } return true; });
        return { ...d, indicadores: keep };
      });
      if (!moved) return s;
      return { ...s, supervisorDims: dims.map(d => d.id === toDimId ? { ...d, indicadores: [...d.indicadores, moved] } : d) };
    }),
    addSupIndicador: (dimId, texto) => {
      const nid = 'i_' + Date.now();
      setState(s => ({
        ...s,
        supervisorDims: (s.supervisorDims || []).map(d => d.id === dimId
          ? { ...d, indicadores: [...d.indicadores, { id: nid, texto: texto || 'Nuevo indicador' }] } : d),
      }));
      toastMsg('Columna agregada');
    },
    removeSupIndicador: (indId) => setState(s => {
      const supervisor = {}; Object.keys(s.supervisor || {}).forEach(e => { const m = { ...s.supervisor[e] }; delete m[indId]; supervisor[e] = m; });
      const autoeval = {}; Object.keys(s.autoeval || {}).forEach(e => { const m = { ...s.autoeval[e] }; delete m[indId]; autoeval[e] = m; });
      return {
        ...s,
        supervisorDims: (s.supervisorDims || []).map(d => ({ ...d, indicadores: d.indicadores.filter(ind => ind.id !== indId) })),
        supervisor, autoeval,
      };
    }),
    addSupDimension: (label) => {
      const did = 'd_' + Date.now();
      setState(s => ({ ...s, supervisorDims: [...(s.supervisorDims || []), { id: did, label: label || `${(s.supervisorDims || []).length + 1}. Nueva dimensión`, indicadores: [] }] }));
      toastMsg('Dimensión agregada');
    },
    removeSupDimension: (dimId) => setState(s => {
      const dim = (s.supervisorDims || []).find(d => d.id === dimId);
      const ids = dim ? dim.indicadores.map(i => i.id) : [];
      const supervisor = {}; Object.keys(s.supervisor || {}).forEach(e => { const m = { ...s.supervisor[e] }; ids.forEach(i => delete m[i]); supervisor[e] = m; });
      const autoeval = {}; Object.keys(s.autoeval || {}).forEach(e => { const m = { ...s.autoeval[e] }; ids.forEach(i => delete m[i]); autoeval[e] = m; });
      return { ...s, supervisorDims: (s.supervisorDims || []).filter(d => d.id !== dimId), supervisor, autoeval };
    }),
    resetSupDims: () => { setState(s => ({ ...s, supervisorDims: JSON.parse(JSON.stringify(window.USACH_DATA.SUPERVISOR_DIMENSIONES || [])) })); toastMsg('Columnas restauradas'); },
    // ─── Práctica II: supervisión en terreno + proceso + tutor ───
    addVisita: (estId, modo) => setState(s => {
      const terreno = { ...(s.terreno || {}) };
      const arr = [...(terreno[estId] || [])];
      arr.push({ id: 'v_' + Date.now(), fecha: new Date().toISOString().slice(0, 10), modo: modo || 'part', resp: {} });
      terreno[estId] = arr;
      toastMsg('Visita en terreno agregada');
      return { ...s, terreno };
    }),
    removeVisita: (estId, vid) => setState(s => {
      const terreno = { ...(s.terreno || {}) };
      terreno[estId] = (terreno[estId] || []).filter(v => v.id !== vid);
      return { ...s, terreno };
    }),
    setVisitaCampo: (estId, vid, campo, val) => setState(s => {
      const terreno = { ...(s.terreno || {}) };
      terreno[estId] = (terreno[estId] || []).map(v => v.id === vid ? { ...v, [campo]: val, ...(campo === 'modo' ? { resp: {} } : {}) } : v);
      return { ...s, terreno };
    }),
    setVisitaNivel: (estId, vid, crId, key) => setState(s => {
      const terreno = { ...(s.terreno || {}) };
      terreno[estId] = (terreno[estId] || []).map(v => {
        if (v.id !== vid) return v;
        const resp = { ...v.resp };
        if (key == null) delete resp[crId]; else resp[crId] = key;
        return { ...v, resp };
      });
      return { ...s, terreno };
    }),
    setProcesoNivel: (estId, indId, key) => setState(s => {
      const proceso = { ...(s.proceso || {}) };
      proceso[estId] = { ...(proceso[estId] || {}) };
      if (key == null) delete proceso[estId][indId]; else proceso[estId][indId] = key;
      return { ...s, proceso };
    }),
    setTutorNota: (estId, nota) => setState(s => {
      const tutor = { ...(s.tutor || {}) };
      tutor[estId] = nota == null ? null : { nota };
      return { ...s, tutor };
    }),
    fillSuggested: (evId) => setState(s => {
      const ev = s.evaluaciones.find(e => e.id === evId);
      const lvSet = window.USACH_CALC.nivelesSetForEval(ev);
      const ns = { ...s.niveles, [evId]: {} };
      (s.estudiantes || window.USACH_DATA.ESTUDIANTES).forEach((est, ix) => {
        ns[evId][est.id] = {};
        ev.criterios.forEach((cr, ci) => {
          const idx = (ix + ci) % lvSet.length;
          ns[evId][est.id][cr.id] = lvSet[Math.min(idx, lvSet.length - 1)].key;
        });
      });
      toastMsg('Niveles sugeridos. Revisa antes de publicar.');
      return { ...s, niveles: ns };
    }),
    clearEval: (evId) => setState(s => {
      const ns = { ...s.niveles, [evId]: {} };
      const a  = { ...s.atrasos, [evId]: {} };
      toastMsg('Calificaciones limpiadas');
      return { ...s, niveles: ns, atrasos: a };
    }),
    addStudent: (data) => {
      setState(s => ({
        ...s,
        estudiantes: [
          ...(s.estudiantes || []),
          { id: 'e_' + Date.now(), ...data },
        ],
      }));
      toastMsg(`${data.nombre || 'Estudiante'} agregado e inscrito automáticamente`);
    },
    updateStudent: (id, data) => setState(s => ({
      ...s,
      estudiantes: (s.estudiantes || []).map(e => e.id === id ? { ...e, ...data } : e),
    })),
    deleteStudent: (id) => setState(s => {
      const niveles = { ...s.niveles };
      const atrasos = { ...s.atrasos };
      Object.keys(niveles).forEach(evId => {
        const m = { ...niveles[evId] }; delete m[id]; niveles[evId] = m;
      });
      Object.keys(atrasos).forEach(evId => {
        const m = { ...atrasos[evId] }; delete m[id]; atrasos[evId] = m;
      });
      const supervisor = { ...s.supervisor }; delete supervisor[id];
      const autoeval = { ...s.autoeval }; delete autoeval[id];
      const semestral = { ...(s.semestral || {}) }; delete semestral[id];
      const tutor = { ...(s.tutor || {}) }; delete tutor[id];
      const supervisorComments = { ...s.supervisorComments }; delete supervisorComments[id];
      return {
        ...s,
        estudiantes: (s.estudiantes || []).filter(e => e.id !== id),
        niveles, atrasos, supervisor, autoeval, semestral, tutor, supervisorComments,
      };
    }),
    setSupervisorComment: (key, estId, text) => setState(s => ({
      ...s,
      [key]: { ...(s[key] || {}), [estId]: text },
    })),
    openReports: () => setReportsOpen(true),
    setDriveUrl: (url) => setTweak('driveUrl', url),
    addEvalAnexo: (evId, anexo) => setState(s => ({
      ...s,
      evalAnexos: { ...(s.evalAnexos || {}), [evId]: [...((s.evalAnexos || {})[evId] || []), anexo] },
    })),
    removeEvalAnexo: (evId, anexoId) => setState(s => ({
      ...s,
      evalAnexos: { ...(s.evalAnexos || {}), [evId]: ((s.evalAnexos || {})[evId] || []).filter(a => a.id !== anexoId) },
    })),
    renameEvalAnexo: (evId, anexoId, titulo) => setState(s => ({
      ...s,
      evalAnexos: { ...(s.evalAnexos || {}), [evId]: ((s.evalAnexos || {})[evId] || []).map(a => a.id === anexoId ? { ...a, titulo } : a) },
    })),
    updateEval: (evId, draft) => setState(s => ({
      ...s,
      evaluaciones: s.evaluaciones.map(e => e.id === evId ? { ...e, ...draft } : e),
    })),
    // ─── Variante de rúbrica (p. ej. Informe P4: deporte individual / colectivo) ───
    setEvalVariante: (evId, key) => setState(s => ({
      ...s,
      evaluaciones: s.evaluaciones.map(e => {
        if (e.id !== evId || !e.variantes || !e.variantes[key]) return e;
        const v = e.variantes[key];
        return { ...e, variante: key, criterios: v.criterios, maxPuntos: v.maxPuntos, escala: v.escala };
      }),
    })),
    setEvalDate: (evId, iso) => setState(s => ({
      ...s,
      evaluaciones: s.evaluaciones.map(e => e.id === evId ? { ...e, fecha: iso } : e),
    })),
  }), [state, nav, toastMsg, t.driveUrl]);

  // ─── Breadcrumbs + topbar actions ─────────────────────────────
  const ev = route.params.id ? state.evaluaciones.find(e => e.id === route.params.id) : null;
  const crumbs = (() => {
    switch (route.screen) {
      case 'dashboard':   return ['Inicio'];
      case 'evaluaciones':return ['Evaluaciones'];
      case 'eval':        return ['Evaluaciones', ev ? `${window.evalSigla(ev)} · ${ev.titulo.slice(0,40)}${ev.titulo.length>40?'…':''}` : '—'];
      case 'grade':       return ['Evaluaciones', ev ? window.evalSigla(ev) : '—', 'Calificar'];
      case 'notas':       return ['Tabla de notas'];
      case 'estudiantes': return ['Estudiantes'];
      case 'anexos':      return ['Anexos administrativos'];
      case 'supervisor':  return ['Eval. Supervisor'];
      case 'visitas':    return ['Visitas en terreno'];
      case 'mobile':      return ['Vista mobile'];
      default: return ['—'];
    }
  })();

  const counts = { evals: state.evaluaciones.length, students: (state.estudiantes || window.USACH_DATA.ESTUDIANTES).length };
  const meta = window.USACH_DATA.meta || {};

  return (
    <div className="app">
      <Sidebar current={route.screen} onNav={nav} counts={counts}
               practicaActiva={practica} onSelectPractica={cambiarPractica} />
      <main className="main">
        <Topbar crumbs={crumbs} onSettingsPick={setSettingsOpen} breadcrumbRoot={meta.breadcrumb} />
        <div className="content">
          {route.screen === 'dashboard'   && <Dashboard ctx={ctx} onNav={nav} />}
          {route.screen === 'evaluaciones'&& <EvaluacionesScreen ctx={ctx} onOpen={(id) => nav('eval', { id })} />}
          {route.screen === 'eval'        && <EvalDetail evalId={route.params.id} ctx={ctx} onBack={() => nav('evaluaciones')} onGrade={(id) => nav('grade', { id })} />}
          {route.screen === 'grade'       && <RubricaBatch evalId={route.params.id} ctx={ctx} onBack={() => nav('eval', { id: route.params.id })} />}
          {route.screen === 'notas'       && <NotasScreen ctx={ctx} onOpen={(id) => nav('eval', { id })} />}
          {route.screen === 'estudiantes' && <EstudiantesScreen ctx={ctx} onOpen={(id) => {}} />}
          {route.screen === 'anexos'      && <AnexosScreen ctx={ctx} />}
          {route.screen === 'supervisor'  && (meta.supervisorScreen === 'P3' ? <SupervisorP3Screen ctx={ctx} /> : meta.kind === 'profesional' ? <SupervisorPIScreen ctx={ctx} /> : meta.terreno ? <SupervisorP2Screen ctx={ctx} /> : <SupervisorScreen ctx={ctx} kind="supervisor" />)}
          {route.screen === 'autoeval'    && (meta.terreno ? <InstrumentoScreen ctx={ctx} kind="autoeval" /> : <SupervisorScreen ctx={ctx} kind="autoeval" />)}
          {route.screen === 'visitas'      && <VisitasScreen ctx={ctx} />}
          {route.screen === 'mobile'       && <MobileScreens state={state} primary={t.primaryColor || '#009688'} />}
        </div>
      </main>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Práctica" />
        <TweakRadio label="Práctica activa" value={practica}
                    options={['I', 'II', 'III', 'IV', 'PI', 'PII']}
                    onChange={v => cambiarPractica(v)} />

        <TweakSection label="Visual" />
        <TweakColor label="Color primario" value={t.primaryColor}
                    options={['#009688', '#00695C', '#006FA1', '#E89A3C', '#9C2222']}
                    onChange={v => setTweak('primaryColor', v)} />
        <TweakRadio label="Densidad" value={t.density}
                    options={['compact', 'regular', 'comfy']}
                    onChange={v => setTweak('density', v)} />

        <TweakSection label="Datos demo" />
        <TweakRadio label="Estado" value={t.dataState}
                    options={['demo', 'vacio']}
                    onChange={v => setTweak('dataState', v)} />
        <TweakButton label="Restaurar datos de esta práctica"
                     onClick={() => { try { localStorage.removeItem(stateKey(practica, t.dataState)); } catch (e) {} setState(initialState(t.dataState)); toastMsg('Datos de la práctica restaurados'); }}>Restaurar</TweakButton>

        <TweakSection label="Integraciones" />
        <TweakText label="URL del Google Drive del curso" value={t.driveUrl}
                   onChange={v => setTweak('driveUrl', v)}
                   placeholder="https://drive.google.com/drive/folders/…" />

        <TweakSection label="Atajos" />
        <TweakButton label="Ir a inicio" onClick={() => nav('dashboard')}>Inicio</TweakButton>
        <TweakButton label="Calificar primera evaluación" onClick={() => nav('grade', { id: state.evaluaciones[0]?.id })}>Calificar</TweakButton>
        <TweakButton label="Supervisión / terreno" onClick={() => nav('supervisor')}>Supervisión</TweakButton>
        <TweakButton label="Vista mobile (terreno)" onClick={() => nav('mobile')}>Vista mobile</TweakButton>
      </TweaksPanel>

      {toastEl}
      {pdfModal && <PdfPreviewModal {...pdfModal} ctx={ctx} onClose={() => setPdfModal(null)} />}
      {reportsOpen && <ReportsCenterModal ctx={ctx} onClose={() => setReportsOpen(false)} />}
      {settingsOpen === 'profile'       && <ProfileModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'disponibilidad'&& <DisponibilidadModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'course'        && <CoursePrefsModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'notifications' && <NotificationsSettingsModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'integrations'  && <IntegrationsModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'export'        && <ExportModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'help'          && <HelpModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
      {settingsOpen === 'logout'        && <LogoutModal ctx={ctx} onClose={() => setSettingsOpen(null)} />}
    </div>
  );
}

// ─── Initial state factory (delegado a la práctica activa) ────
function initialState(kind) {
  const D = window.USACH_DATA;
  if (D.initialState) return D.initialState(kind);
  return { evaluaciones: [], estudiantes: [], niveles: {}, atrasos: {}, supervisor: {}, autoeval: {}, supervisorComments: {}, autoevalComments: {} };
}

// ─── Persistencia por práctica (localStorage, compartido entre cuentas) ────
function stateKey(practica, kind) { return `usach_state_v1_${practica}_${kind || 'demo'}`; }

// Lee estudiantes del coordinador (coord_students) filtrados por práctica y profesor.
// Por rba Cloud.ready ya corrió pullAll(), coord_students está sincronizado desde Firestore.
function getCoordStudents(practica) {
  const au = window.__authUser;
  if (!au) return [];
  try {
    const all = JSON.parse(localStorage.getItem('coord_students') || '[]') || [];
    const byPrac = all.filter(function(s) { return s.practica === practica; });
    if (au.rol === 'coordinador') return byPrac;
    const profs = JSON.parse(localStorage.getItem('coord_profs') || '[]') || [];
    const prof = profs.find(function(p) { return p.email && p.email.toLowerCase() === (au.email || '').toLowerCase(); });
    if (!prof) return [];
    return byPrac.filter(function(s) { return s.profesorId === prof.id; });
  } catch (e) { return []; }
}

function loadState(practica, kind) {
  const coordStudents = getCoordStudents(practica);
  try {
    const raw = localStorage.getItem(stateKey(practica, kind));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.evaluaciones)) {
        if (!coordStudents.length) return parsed;
        // Coordinator students are authoritative; keep professor-added extras (id starts with 'e_')
        const coordIds = new Set(coordStudents.map(function(s) { return s.id; }));
        const extras = (parsed.estudiantes || []).filter(function(s) { return s.id && s.id.startsWith('e_'); });
        return Object.assign({}, parsed, { estudiantes: coordStudents.concat(extras) });
      }
    }
  } catch (e) {}
  const base = initialState(kind);
  return coordStudents.length ? Object.assign({}, base, { estudiantes: coordStudents }) : base;
}

// ─── Color helpers ────────────────────────────────────────────
function darken(hex, amt) {
  const { r, g, b } = hex2rgb(hex);
  return rgb2hex(Math.max(0, r - amt), Math.max(0, g - amt), Math.max(0, b - amt));
}
function lighten(hex, amt) {
  const { r, g, b } = hex2rgb(hex);
  return rgb2hex(Math.min(255, r + amt), Math.min(255, g + amt), Math.min(255, b + amt));
}
function hex2rgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substr(0,2), 16), g: parseInt(h.substr(2,2), 16), b: parseInt(h.substr(4,2), 16) };
}
function rgb2hex(r, g, b) {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

// Mount (espera la sincronización inicial con Firebase)
const root = ReactDOM.createRoot(document.getElementById('root'));
(window.CLOUD ? window.CLOUD.ready : Promise.resolve()).then(() => {
  root.render(<App />);
});
