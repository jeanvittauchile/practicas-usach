// mobile.jsx — Three mobile screens for terreno (inside iOS frame)
// Uses globals: I, USACH_DATA, USACH_CALC, IOSDevice, formatNota, notaClass, fechaFmt

const Dm = window.USACH_DATA;
const Cm = window.USACH_CALC;

function MobileScreens({ state, primary }) {
  return (
    <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', padding: '28px 0' }}>
      <MobilePhone label="1 · Inicio">
        <MobileHome state={state} primary={primary} />
      </MobilePhone>
      <MobilePhone label="2 · Calificar rápido">
        <MobileGrade state={state} primary={primary} />
      </MobilePhone>
      <MobilePhone label="3 · Detalle evaluación">
        <MobileEvalDetail state={state} primary={primary} />
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

// ─── Screen 1: Home (mobile) ──────────────────────────────
function MobileHome({ state, primary }) {
  const proxima = state.evaluaciones.filter(e => e.estado !== 'corregida').sort((a,b) => a.fecha.localeCompare(b.fecha))[0];
  return (
    <>
      <div style={{ background: primary, color: '#fff', padding: '16px 16px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <USACHCrest size={28} />
          <div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>{(Dm.meta||{}).breadcrumb || 'Práctica'} · USACH</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Hola, Andrés</div>
          </div>
          <button style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', borderRadius: 18, width: 36, height: 36, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <I.bell size={16} />
          </button>
        </div>
      </div>

      <div className="m-card" style={{ marginTop: -16, position: 'relative' }}>
        <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Promedio del curso</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink-900)' }} className="tnum">5,3</div>
          <div className="muted" style={{ fontSize: 12 }}>sobre 7,0</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, padding: 8, background: 'var(--surface-1)', borderRadius: 8 }}>
            <div className="muted" style={{ fontSize: 10 }}>Por calificar</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>2</div>
          </div>
          <div style={{ flex: 1, padding: 8, background: 'var(--surface-1)', borderRadius: 8 }}>
            <div className="muted" style={{ fontSize: 10 }}>Atrasos</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--warn)' }}>3</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', margin: '6px 0' }}>
          Próxima evaluación
        </div>
      </div>

      <div className="m-card" style={{ marginTop: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: window.grupoEsTeal(proxima.grupo) ? 'var(--teal-500)' : 'var(--orange-500)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
            {window.evalSigla(proxima)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.25 }}>{proxima.titulo}</div>
            <div className="muted" style={{ fontSize: 11 }}>{fechaFmt(proxima.fecha)} · {proxima.tipo}</div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
          <I.checkSquare size={14} /> Calificar ahora
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', margin: '10px 0 6px' }}>
          Acciones rápidas
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' }}>
        {[
          { i: 'users', l: 'Estudiantes' },
          { i: 'archive', l: 'Anexos' },
          { i: 'paperclip', l: 'Consentim.' },
          { i: 'pdf', l: 'Reportes' },
        ].map((a, idx) => {
          const IconC = I[a.i];
          return (
            <button key={idx} className="m-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: 0, padding: 12, cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'grid', placeItems: 'center' }}>
                <IconC size={16} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>{a.l}</div>
            </button>
          );
        })}
      </div>

      <div style={{ height: 60 }} />
      <MobileNav active="home" />
    </>
  );
}

// ─── Screen 2: Quick grade (1 student × 1 criterio per card) ──────────────────────────────
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
                  const colors = { E: '#2F9E5E', B: '#4FA9D9', S: '#E0A833', D: '#C84142', L: '#2F9E5E', ML: '#4FA9D9', NL: '#E0A833', I: '#D97840', NO: '#8A94A6', CS: '#3FA070', O: '#E0A833', CN: '#D97840', N: '#C84142', P: '#4FA9D9' };
                  return (
                    <button key={n.key}
                            style={{
                              padding: '8px 4px',
                              borderRadius: 8,
                              border: on ? `2px solid ${colors[n.key]}` : '1px solid var(--border)',
                              background: on ? colors[n.key] : '#fff',
                              color: on ? '#fff' : 'var(--ink-700)',
                              fontWeight: 700,
                              fontSize: 11.5,
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

// ─── Screen 3: Eval detail (sections) ──────────────────────────────
function MobileEvalDetail({ state, primary }) {
  const ev = state.evaluaciones.find(e => e.estado === 'corregida') || state.evaluaciones[0];
  return (
    <>
      <div style={{ background: primary, color: '#fff', padding: '14px 16px 56px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ color: '#fff' }}><I.arrowLeft size={20} /></button>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{window.grupoDef(ev.grupo).singular} {ev.numero}</div>
          <button style={{ color: '#fff' }}><I.download size={18} /></button>
        </div>
      </div>
      <div style={{ background: '#fff', margin: '-40px 16px 0', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className="tag tag-teal">{ev.tipo}</span>
          <span className="tag tag-success"><I.check size={10} /> Corregida</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: 'var(--ink-900)' }}>{ev.titulo}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{ev.descripcion}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div>
            <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Fecha</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{fechaFmt(ev.fecha).split(' ').slice(0,2).join(' ')}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Máx.</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.maxPuntos} pts</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Promedio</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>5,4</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { i: 'zap',         l: 'Resultados de aprendizaje', open: true, n: 2 },
          { i: 'checkSquare', l: 'Objetivos específicos', n: 3 },
          { i: 'list',        l: 'Instrucciones', n: 4 },
          { i: 'doc',         l: 'Aspectos formales', n: 4 },
          { i: 'paperclip',   l: 'Anexos', n: 2 },
        ].map((s, i) => {
          const IconC = I[s.i];
          return (
            <div key={i} className="m-card" style={{ margin: 0, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'grid', placeItems: 'center' }}>
                  <IconC size={14} />
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.l}</div>
                <span className="muted" style={{ fontSize: 11 }}>{s.n}</span>
                <I.chev size={14} stroke="var(--ink-400)" />
              </div>
              {s.open && (
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-700)' }}>
                  {ev.resultadosAprendizaje.map((t, ix) => <li key={ix} style={{ marginBottom: 4 }}>{t}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: 16, position: 'sticky', bottom: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <I.checkSquare size={14} /> Calificar estudiantes
        </button>
      </div>
    </>
  );
}

function MobileNav({ active }) {
  const items = [
    { id: 'home', l: 'Inicio', i: 'home' },
    { id: 'evals', l: 'Evals.', i: 'clipboard' },
    { id: 'notas', l: 'Notas', i: 'table' },
    { id: 'est', l: 'Estud.', i: 'users' },
    { id: 'more', l: 'Más', i: 'settings' },
  ];
  return (
    <div style={{ position: 'sticky', bottom: 0 }} className="m-nav">
      {items.map(it => {
        const IconC = I[it.i];
        return (
          <button key={it.id} className={active === it.id ? 'active' : ''}>
            <IconC size={18} />
            {it.l}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { MobileScreens });
