// mobile.jsx — Four mobile screens for terreno (inside iOS frame)
// Uses globals: I, USACH_DATA, USACH_CALC, IOSDevice, formatNota, notaClass, fechaFmt

const Dm = window.USACH_DATA;
const Cm = window.USACH_CALC;

function MobileScreens({ state, primary }) {
  return (
    <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', padding: '28px 0' }}>
      <MobilePhone label="1 · Inicio">
        <MobileHome state={state} primary={primary} />
      </MobilePhone>
      <MobilePhone label="2 · Lista evaluaciones">
        <MobileEvalList state={state} primary={primary} />
      </MobilePhone>
      <MobilePhone label="3 · Detalle evaluación">
        <MobileEvalDetail state={state} primary={primary} />
      </MobilePhone>
      <MobilePhone label="4 · Calificar rápido">
        <MobileGrade state={state} primary={primary} />
      </MobilePhone>
    </div>
  );
}

function MobilePhone({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <IOSDevice>
        <div className="m-screen">{children}</div>
      </IOSDevice>
      <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Screen 1: Home ───────────────────────────────────────────
function MobileHome({ state, primary }) {
  const proxima = state.evaluaciones.filter(e => e.estado !== 'corregida').sort((a,b) => window.evalFechaInfo(a, state).deadline.localeCompare(window.evalFechaInfo(b, state).deadline))[0];
  const porCalificar = state.evaluaciones.filter(e => e.estado !== 'corregida').length;
  const corregidas  = state.evaluaciones.filter(e => e.estado === 'corregida').length;
  return (
    <>
      {/* Header */}
      <div style={{ background: primary, color: '#fff', padding: '16px 16px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <USACHCrest size={28} />
          <div>
            <div style={{ fontSize: 10.5, opacity: 0.8 }}>{(Dm.meta||{}).breadcrumb || 'Práctica'} · USACH</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Hola, Andrés 👋</div>
          </div>
          <button style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.18)', borderRadius: 18, width: 36, height: 36, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <I.bell size={16} />
          </button>
        </div>
      </div>

      {/* Stats card floating */}
      <div className="m-card" style={{ marginTop: -16, position: 'relative', padding: '14px 16px' }}>
        <div className="muted" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Promedio del curso</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em' }} className="tnum">5,3</div>
          <div className="muted" style={{ fontSize: 12 }}>/ 7,0</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: '6px 10px', background: 'var(--orange-50)', borderRadius: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--orange-700)' }}>{porCalificar}</div>
              <div style={{ fontSize: 9.5, color: 'var(--orange-600)', fontWeight: 600, textTransform: 'uppercase' }}>Pendientes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '6px 10px', background: 'var(--teal-50)', borderRadius: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal-700)' }}>{corregidas}</div>
              <div style={{ fontSize: 9.5, color: 'var(--teal-600)', fontWeight: 600, textTransform: 'uppercase' }}>Corregidas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Próxima evaluación */}
      <div style={{ padding: '0 16px 6px' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Próxima evaluación
        </div>
        {proxima && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 4, background: window.grupoEsTeal(proxima.grupo) ? 'linear-gradient(90deg, var(--teal-500), var(--teal-300))' : 'linear-gradient(90deg, var(--orange-500), var(--orange-300))' }} />
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: window.grupoEsTeal(proxima.grupo) ? 'var(--teal-500)' : 'var(--orange-500)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                  {window.evalSigla(proxima)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proxima.titulo}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{window.evalFechaInfo(proxima, state).label} · {proxima.tipo}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                <I.checkSquare size={13} /> Calificar ahora
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div style={{ padding: '10px 16px 0' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 8 }}>
          Acciones rápidas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { i: 'users',    l: 'Estudiantes', color: 'var(--teal-50)',   fg: 'var(--teal-700)'   },
            { i: 'archive',  l: 'Anexos',      color: 'var(--orange-50)', fg: 'var(--orange-700)' },
            { i: 'paperclip',l: 'Consentim.',  color: 'var(--teal-50)',   fg: 'var(--teal-700)'   },
            { i: 'pdf',      l: 'Reportes',    color: 'var(--orange-50)', fg: 'var(--orange-700)' },
          ].map((a, idx) => {
            const IconC = I[a.i];
            return (
              <button key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.color, color: a.fg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <IconC size={15} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-800)' }}>{a.l}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: 68 }} />
      <MobileNav active="home" primary={primary} />
    </>
  );
}

// ─── Screen 2: Evaluaciones list ──────────────────────────────
function MobileEvalList({ state, primary }) {
  const evals = state.evaluaciones;
  const pendientes = evals.filter(e => e.estado !== 'corregida');
  const corregidas = evals.filter(e => e.estado === 'corregida');
  const todosEst = state.estudiantes || Dm.ESTUDIANTES;

  function EvalRow({ ev }) {
    const esTeal = window.grupoEsTeal(ev.grupo);
    const estudiantes = ev.menciones ? todosEst.filter(e => ev.menciones.includes(e.area || 'deportiva')) : todosEst;
    const total = estudiantes.length;
    const completados = estudiantes.filter(est => {
      const r = Cm.calcNotaEvaluacion(ev, state.niveles[ev.id]?.[est.id], state.atrasos[ev.id]?.[est.id]);
      return r && !r.parcial;
    }).length;
    const pct = total > 0 ? completados / total : 0;

    return (
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: 3, background: esTeal ? 'linear-gradient(90deg,var(--teal-500),var(--teal-300))' : 'linear-gradient(90deg,var(--orange-500),var(--orange-300))' }} />
        <div style={{ padding: '11px 13px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
              {window.evalSigla(ev)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink-900)' }}>{ev.titulo}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span className="muted" style={{ fontSize: 10.5 }}>{window.evalFechaInfo(ev, state).label}</span>
                <span style={{ fontSize: 9, color: 'var(--ink-300)' }}>·</span>
                <span className="muted" style={{ fontSize: 10.5 }}>{ev.maxPuntos} pts</span>
              </div>
            </div>
            {ev.estado === 'corregida' ? (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 6, background: 'var(--success-bg)', color: 'var(--success)', flexShrink: 0 }}>✓ Lista</span>
            ) : (
              <I.chev size={14} stroke="var(--ink-300)" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--ink-500)', fontWeight: 600 }}>Calificados</span>
              <span style={{ fontSize: 10, color: 'var(--ink-600)', fontWeight: 700 }} className="tnum">{completados}/{total}</span>
            </div>
            <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)', borderRadius: 4, transition: 'width .3s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ background: primary, padding: '14px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#fff' }}>Evaluaciones</div>
          <button style={{ background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 9, padding: '6px 10px', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <I.search size={13} /> Buscar
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: `${pendientes.length} pendientes`, bg: 'rgba(255,255,255,0.22)', color: '#fff' },
            { label: `${corregidas.length} corregidas`, bg: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' },
          ].map((c, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 14px 0', overflowY: 'auto' }}>
        {pendientes.length > 0 && (
          <>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 10 }}>
              Por calificar
            </div>
            {pendientes.map(ev => <EvalRow key={ev.id} ev={ev} />)}
          </>
        )}
        {corregidas.length > 0 && (
          <>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginTop: 14, marginBottom: 10 }}>
              Corregidas
            </div>
            {corregidas.map(ev => <EvalRow key={ev.id} ev={ev} />)}
          </>
        )}
      </div>

      <div style={{ height: 68 }} />
      <MobileNav active="evals" primary={primary} />
    </>
  );
}

// ─── Screen 3: Eval detail (redesigned) ──────────────────────
function MobileEvalDetail({ state, primary }) {
  const ev = state.evaluaciones.find(e => e.estado === 'corregida') || state.evaluaciones[0];
  const esTeal = window.grupoEsTeal(ev.grupo);
  const heroColor = esTeal
    ? 'linear-gradient(135deg, var(--teal-800) 0%, var(--teal-500) 100%)'
    : 'linear-gradient(135deg, var(--orange-700) 0%, var(--orange-400) 100%)';
  const accentColor = esTeal ? 'var(--teal-500)' : 'var(--orange-500)';

  const todosEst = state.estudiantes || Dm.ESTUDIANTES;
  const estudiantes = ev.menciones ? todosEst.filter(e => ev.menciones.includes(e.area || 'deportiva')) : todosEst;
  const total = estudiantes.length;
  const completados = estudiantes.filter(est => {
    const r = Cm.calcNotaEvaluacion(ev, state.niveles[ev.id]?.[est.id], state.atrasos[ev.id]?.[est.id]);
    return r && !r.parcial;
  }).length;
  const pct = total > 0 ? Math.round(completados / total * 100) : 0;
  const evalDateInfo = window.evalFechaInfo(ev, state);

  const sections = [
    { i: 'zap',         l: 'Resultados de aprendizaje', n: (ev.resultadosAprendizaje||[]).length, color: esTeal ? 'var(--teal-50)' : 'var(--orange-50)', fg: esTeal ? 'var(--teal-700)' : 'var(--orange-700)' },
    { i: 'checkSquare', l: 'Objetivos específicos',      n: (ev.objetivosEspecificos||[]).length,  color: 'var(--surface-1)', fg: 'var(--ink-600)' },
    { i: 'list',        l: 'Instrucciones',              n: (ev.instrucciones||[]).length,          color: 'var(--surface-1)', fg: 'var(--ink-600)' },
    { i: 'doc',         l: 'Aspectos formales',          n: (ev.aspectosFormales||[]).length,       color: 'var(--surface-1)', fg: 'var(--ink-600)' },
    { i: 'paperclip',   l: 'Anexos',                     n: (state.evalAnexos?.[ev.id]||[]).length, color: 'var(--surface-1)', fg: 'var(--ink-600)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hero header */}
      <div style={{ background: heroColor, padding: '14px 16px 52px', position: 'relative', flexShrink: 0 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button style={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <I.arrowLeft size={14} /> Volver
          </button>
          <div style={{ flex: 1 }} />
          <button style={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 7 }}>
            <I.download size={15} />
          </button>
          <button style={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 7 }}>
            <I.edit size={15} />
          </button>
        </div>
        {/* Sigla + title */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18, color: '#fff', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.3)' }}>
            {window.evalSigla(ev)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: 3 }}>
              {window.grupoDef(ev.grupo).singular} {ev.numero} · {ev.tipo}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {ev.titulo}
            </div>
          </div>
        </div>
      </div>

      {/* Floating stats card */}
      <div style={{ margin: '-36px 14px 0', background: 'var(--bg)', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid var(--border)', padding: '14px 16px', flexShrink: 0, position: 'relative', zIndex: 2 }}>
        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-700)' }}>Progreso de calificación</span>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: accentColor }} className="tnum">{completados}/{total}</span>
          </div>
          <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: esTeal ? 'linear-gradient(90deg,var(--teal-600),var(--teal-400))' : 'linear-gradient(90deg,var(--orange-600),var(--orange-400))', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 3, textAlign: 'right' }}>{pct}% completado</div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {[
            { label: 'Fecha', value: evalDateInfo.auto ? `Sem. ${evalDateInfo.semana}` : fechaFmt(ev.fecha).split(' ').slice(0,2).join(' ') },
            { label: 'Puntaje', value: `${ev.maxPuntos} pts` },
            { label: 'Criterios', value: `${ev.criterios.length} crit.` },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-400)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-800)' }}>{s.value}</div>
            </div>
          ))}
        </div>
        {evalDateInfo.auto && (
          <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textAlign: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            {evalDateInfo.label}
          </div>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: '14px 14px 0', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-400)', marginBottom: 10 }}>
          Contenido
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sections.map((s, i) => {
            const IconC = I[s.i];
            return (
              <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: s.color, color: s.fg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <IconC size={14} />
                </div>
                <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--ink-800)' }}>{s.l}</div>
                {s.n > 0 && <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 600 }} className="tnum">{s.n}</span>}
                <I.chev size={13} stroke="var(--ink-300)" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: '10px 0', fontSize: 13.5 }}>
          <I.checkSquare size={15} /> Calificar estudiantes
        </button>
      </div>
    </div>
  );
}

// ─── Screen 4: Quick grade (1 student × 1 criterio per card) ──
function MobileGrade({ state, primary }) {
  const ests = state.estudiantes || Dm.ESTUDIANTES;
  const ev = state.evaluaciones.find(e => e.estado === 'en-evaluacion') || state.evaluaciones.find(e => e.estado !== 'corregida') || state.evaluaciones[0];
  const est = ests[Math.min(3, ests.length - 1)];
  const niveles = Cm.nivelesSetForEval(ev);
  const respEst = state.niveles[ev.id]?.[est.id] || {};
  const r = Cm.calcNotaEvaluacion(ev, respEst, state.atrasos[ev.id]?.[est.id]);

  return (
    <>
      <div style={{ background: primary, color: '#fff', padding: '14px 16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ color: '#fff' }}><I.arrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{window.grupoDef(ev.grupo).singular} {ev.numero}</div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{ev.titulo}</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
          {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{est.nombre}</div>
          <div className="muted" style={{ fontSize: 11 }}>{est.rut} · 4 de 5</div>
        </div>
        <div className="muted" style={{ fontSize: 11 }}><I.arrowRight size={14} /></div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ev.criterios.slice(0, 4).map((cr, i) => {
          const k = respEst[cr.id];
          return (
            <div key={cr.id} className="m-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: window.grupoEsTeal(ev.grupo) ? 'var(--teal-700)' : 'var(--orange-700)', fontSize: 12, lineHeight: '20px' }}>
                  C{i+1}{cr.doble && ' ×2'}
                </span>
                <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.4 }}>{cr.texto}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${niveles.length}, 1fr)`, gap: 4 }}>
                {niveles.map(n => {
                  const on = k === n.key;
                  const colors = { E:'#2F9E5E', B:'#4FA9D9', S:'#E0A833', D:'#C84142', L:'#2F9E5E', ML:'#4FA9D9', NL:'#E0A833', I:'#D97840', NO:'#8A94A6', CS:'#3FA070', O:'#E0A833', CN:'#D97840', N:'#C84142', P:'#4FA9D9' };
                  return (
                    <button key={n.key}
                            style={{
                              padding: '8px 4px', borderRadius: 8,
                              border: on ? `2px solid ${colors[n.key]}` : '1px solid var(--border)',
                              background: on ? colors[n.key] : '#fff',
                              color: on ? '#fff' : 'var(--ink-700)',
                              fontWeight: 700, fontSize: 11.5,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            }}>
                      <span style={{ fontSize: 14 }}>{n.key}</span>
                      <span style={{ fontSize: 9.5, fontWeight: 500, opacity: 0.85 }}>{n.pts}pt</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div>
            <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Puntos · Nota</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }} className="tnum">{r?.puntos ?? 0}<span className="muted" style={{ fontSize: 12 }}>/{ev.maxPuntos}</span></span>
              <span className={`nota ${notaClass(r?.notaFinal)}`}>{formatNota(r?.notaFinal)}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>Anterior</button>
          <button className="btn btn-primary btn-sm">Siguiente <I.arrowRight size={14} /></button>
        </div>
      </div>
    </>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────
function MobileNav({ active, primary }) {
  const items = [
    { id: 'home',  l: 'Inicio', i: 'home'      },
    { id: 'evals', l: 'Evals.', i: 'clipboard' },
    { id: 'notas', l: 'Notas',  i: 'table'     },
    { id: 'est',   l: 'Estud.', i: 'users'     },
    { id: 'more',  l: 'Más',    i: 'settings'  },
  ];
  return (
    <div style={{ position: 'sticky', bottom: 0 }} className="m-nav">
      {items.map(it => {
        const IconC = I[it.i];
        const isActive = active === it.id;
        return (
          <button key={it.id} className={isActive ? 'active' : ''} style={isActive ? { color: primary } : {}}>
            <IconC size={18} />
            {it.l}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { MobileScreens });
