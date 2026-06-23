// coord-mobile.jsx — Mockup móvil del Coordinador (4 pantallas en visor iOS)
// Requires: IOSDevice (ios-frame.jsx), CI (coord-app.jsx)

const PRIMARY = '#00695C'; // teal-700 coordinador

// ─── Contenedor de 4 teléfonos ──────────────────────────────
function CoordMobileScreens({ ctx }) {
  return (
    <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', padding: '28px 0' }}>
      <CoordPhone label="1 · Dashboard">
        <CoordMobileHome ctx={ctx} />
      </CoordPhone>
      <CoordPhone label="2 · Profesores">
        <CoordMobileProfesores ctx={ctx} />
      </CoordPhone>
      <CoordPhone label="3 · Estudiantes">
        <CoordMobileEstudiantes ctx={ctx} />
      </CoordPhone>
      <CoordPhone label="4 · Cartas">
        <CoordMobileCartas ctx={ctx} />
      </CoordPhone>
    </div>
  );
}

function CoordPhone({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <IOSDevice>
        <div className="m-screen">{children}</div>
      </IOSDevice>
      <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Nav inferior del coordinador ───────────────────────────
function CoordNav({ active }) {
  const items = [
    { id: 'home',   l: 'Inicio',   icon: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H10v7H4a1 1 0 01-1-1z"/></svg> },
    { id: 'profs',  l: 'Profesores', icon: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
    { id: 'estu',   l: 'Estudiantes', icon: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
    { id: 'cartas', l: 'Cartas', icon: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg> },
    { id: 'mas',    l: 'Más', icon: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg> },
  ];
  return (
    <div style={{ position: 'sticky', bottom: 0 }} className="m-nav">
      {items.map(it => (
        <button key={it.id} className={active === it.id ? 'active' : ''}
                style={active === it.id ? { color: PRIMARY } : {}}>
          {it.icon()}
          {it.l}
        </button>
      ))}
    </div>
  );
}

// ─── Screen 1: Dashboard ─────────────────────────────────────
function CoordMobileHome({ ctx }) {
  const { profs, students, cartas, centros } = ctx;
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const PNAMES = window.PRACTICE_NAMES || {};
  const pendientes = cartas.filter(c => c.estado === 'pendiente').length;
  const asignados  = profs.filter(p => (p.practicasAsignadas||[]).length > 0).length;

  const stats = [
    { label: 'Profesores', val: profs.length,    sub: `${asignados} asignados`,           color: '#e0f2f1', fg: '#00695C' },
    { label: 'Estudiantes', val: students.length, sub: `${[...new Set(students.map(s=>s.cohorte).filter(Boolean))].length} cohortes`, color: '#e3f2fd', fg: '#1565C0' },
    { label: 'Centros',    val: centros.length,  sub: 'centros registrados',              color: '#fce4ec', fg: '#880E4F' },
    { label: 'Cartas',     val: cartas.length,   sub: pendientes > 0 ? `⚠ ${pendientes} pend.` : 'al día', color: '#fff3e0', fg: '#E65100' },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #004D40, ${PRIMARY})`, padding: '16px 16px 28px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.18)', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Coordinador · USACH</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Panel de control</div>
          </div>
          <button style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 18, width: 36, height: 36, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>
      </div>

      {/* Stats grid flotante */}
      <div style={{ margin: '-16px 14px 0', background: 'var(--bg)', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid var(--border)', padding: '14px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: s.color, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.fg, lineHeight: 1 }} className="tnum">{s.val}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: s.fg, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.fg, opacity: 0.75, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estado por práctica */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Estado por práctica
        </div>
        {PRACS.map(code => {
          const pProfs = profs.filter(p => (p.practicasAsignadas||[]).includes(code)).length;
          const pEst   = students.filter(s => s.practica === code).length;
          const chipColors = { I:'#e0f2f1/##00695C', II:'#e3f2fd/#1565C0', III:'#fce4ec/#880E4F', IV:'#fff3e0/#E65100', PI:'#f3e5f5/#4A148C', PII:'#e8f5e9/#1B5E20' };
          const [cbg, cfg] = (chipColors[code]||'#f3f4f6/#374151').split('/');
          return (
            <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 6 }}>
              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800, background: cbg, color: cfg, flexShrink: 0 }}>{code}</span>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)', flex: 1 }}>{PNAMES[code] || `Práctica ${code}`}</div>
              <span style={{ fontSize: 11, color: 'var(--ink-500)' }} className="tnum">{pProfs}p · {pEst}e</span>
            </div>
          );
        })}
      </div>

      <div style={{ height: 68 }} />
      <CoordNav active="home" />
    </>
  );
}

// ─── Screen 2: Profesores ────────────────────────────────────
function CoordMobileProfesores({ ctx }) {
  const { profs, students } = ctx;
  const PNAMES = window.PRACTICE_NAMES || {};

  return (
    <>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #004D40, ${PRIMARY})`, padding: '14px 16px 18px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Profesores</div>
          <button style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 9, padding: '6px 10px', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Buscar
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.22)', color: '#fff' }}>{profs.length} profesores</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
            {profs.filter(p=>(p.practicasAsignadas||[]).length>0).length} asignados
          </span>
        </div>
      </div>

      <div style={{ padding: '12px 14px 0', overflowY: 'auto' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Lista de profesores
        </div>
        {profs.slice(0, 8).map(p => {
          const initials = (p.nombre||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?';
          const nEst = students.filter(s => s.profesorId === p.id).length;
          const practicas = p.practicasAsignadas || [];
          const chipColors = { I:'#e0f2f1/#00695C', II:'#e3f2fd/#1565C0', III:'#fce4ec/#880E4F', IV:'#fff3e0/#E65100', PI:'#f3e5f5/#4A148C', PII:'#e8f5e9/#1B5E20' };
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 7 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${PRIMARY}, #26A69A)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {practicas.slice(0,3).map(code => {
                    const [cbg, cfg] = (chipColors[code]||'#f3f4f6/#374151').split('/');
                    return <span key={code} style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 8, background: cbg, color: cfg }}>{code}</span>;
                  })}
                  {practicas.length === 0 && <span style={{ fontSize: 10, color: '#b45309', fontWeight: 700 }}>⚠ sin asignar</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: PRIMARY }} className="tnum">{p.horasAsignadas||0}h</div>
                <div style={{ fontSize: 10, color: 'var(--ink-400)' }}>{nEst} est.</div>
              </div>
            </div>
          );
        })}
        {profs.length > 8 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-400)', padding: '8px 0' }}>
            +{profs.length - 8} más…
          </div>
        )}
        {profs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--ink-400)', fontSize: 13 }}>
            Sin profesores registrados.
          </div>
        )}
      </div>

      <div style={{ height: 68 }} />
      <CoordNav active="profs" />
    </>
  );
}

// ─── Screen 3: Estudiantes ───────────────────────────────────
function CoordMobileEstudiantes({ ctx }) {
  const { students, profs } = ctx;
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const PNAMES = window.PRACTICE_NAMES || {};
  const cohortes = [...new Set(students.map(s=>s.cohorte).filter(Boolean))].sort();

  const chipColors = { I:'#e0f2f1/#00695C', II:'#e3f2fd/#1565C0', III:'#fce4ec/#880E4F', IV:'#fff3e0/#E65100', PI:'#f3e5f5/#4A148C', PII:'#e8f5e9/#1B5E20' };

  return (
    <>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #004D40, ${PRIMARY})`, padding: '14px 16px 18px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Estudiantes</div>
          <button style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 9, padding: '6px 10px', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Buscar
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.22)', color: '#fff' }}>{students.length} inscritos</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>{cohortes.length} cohortes</span>
        </div>
      </div>

      <div style={{ padding: '12px 14px 0' }}>
        {/* Por práctica */}
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Por práctica
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
          {PRACS.map(code => {
            const cnt = students.filter(s => s.practica === code).length;
            const [cbg, cfg] = (chipColors[code]||'#f3f4f6/#374151').split('/');
            return (
              <div key={code} style={{ background: cbg, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: cfg }} className="tnum">{cnt}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: cfg, marginTop: 1 }}>{code}</div>
              </div>
            );
          })}
        </div>

        {/* Lista */}
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Nómina
        </div>
        {students.slice(0, 7).map(s => {
          const initials = (s.nombre||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?';
          const prof = profs.find(p => p.id === s.profesorId);
          const [cbg, cfg] = (chipColors[s.practica]||'#f3f4f6/#374151').split('/');
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, #26A69A, ${PRIMARY})`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nombre}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-400)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {prof ? prof.nombre.replace('Prof. ','') : 'Sin profesor'}
                </div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 7px', borderRadius: 8, background: cbg, color: cfg, flexShrink: 0 }}>{s.practica||'—'}</span>
            </div>
          );
        })}
        {students.length > 7 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-400)', padding: '6px 0' }}>+{students.length - 7} más…</div>
        )}
        {students.length === 0 && (
          <div style={{ textAlign: 'center', padding: 28, color: 'var(--ink-400)', fontSize: 13 }}>Sin estudiantes registrados.</div>
        )}
      </div>

      <div style={{ height: 68 }} />
      <CoordNav active="estu" />
    </>
  );
}

// ─── Screen 4: Cartas ────────────────────────────────────────
function CoordMobileCartas({ ctx }) {
  const { cartas, students, profs } = ctx;
  const emitidas   = cartas.filter(c => c.estado === 'emitida').length;
  const pendientes = cartas.filter(c => c.estado === 'pendiente').length;

  const estadoStyle = (e) => ({
    emitida:   { bg: '#dcfce7', fg: '#166534', label: 'Emitida' },
    pendiente: { bg: '#fef9c3', fg: '#854d0e', label: 'Pendiente' },
  }[e] || { bg: '#f3f4f6', fg: '#374151', label: e });

  return (
    <>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #004D40, ${PRIMARY})`, padding: '14px 16px 18px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Cartas</div>
          <button style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 9, padding: '6px 12px', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            + Nueva
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.22)', color: '#fff' }}>{emitidas} emitidas</span>
          {pendientes > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,152,0,0.4)', color: '#fff' }}>⚠ {pendientes} pendientes</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px 0' }}>
        {[
          { label: 'Total', val: cartas.length, color: '#e0f2f1', fg: '#00695C' },
          { label: 'Emitidas', val: emitidas, color: '#dcfce7', fg: '#166534' },
          { label: 'Pendientes', val: pendientes, color: pendientes > 0 ? '#fef9c3' : '#f3f4f6', fg: pendientes > 0 ? '#854d0e' : '#6b7280' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.color, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.fg }} className="tnum">{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.fg, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Cartas recientes
        </div>
        {cartas.slice(0, 6).map(c => {
          const est = students.find(s => s.id === c.estudianteId);
          const est_s = estadoStyle(c.estado);
          return (
            <div key={c.id} style={{ padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, #26A69A, ${PRIMARY})`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, flexShrink: 0 }}>
                  ✉
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {est?.nombre || c.nombre || 'Estudiante'}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-400)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.institucion || c.centro || '—'} · {c.practica || '—'}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: est_s.bg, color: est_s.fg, flexShrink: 0 }}>
                  {est_s.label}
                </span>
              </div>
              {c.fecha && (
                <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 6, paddingLeft: 40 }}>
                  {c.fecha}
                </div>
              )}
            </div>
          );
        })}
        {cartas.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--ink-400)', fontSize: 13 }}>Sin cartas registradas.</div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 14px', position: 'sticky', bottom: 56, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: PRIMARY, borderColor: PRIMARY }}>
          ✉ Emitir carta de presentación
        </button>
      </div>

      <CoordNav active="cartas" />
    </>
  );
}

Object.assign(window, { CoordMobileScreens });
