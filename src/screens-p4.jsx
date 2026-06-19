// screens-p4.jsx — Pantallas específicas de Práctica III
//  · SupervisorP3Screen: supervisión en terreno (fitness · participación/observación)
//    + evaluación del entrenador/a tutor/a (instrumento) + portafolio (3 evals) promediado.
// Reutiliza helpers de screens-p3.jsx expuestos en window:
//   TerrenoTabPI, InstrumentoTabPI, PiAvatar, PiField, FREC_COLORS_PI

function SupervisorP3Screen({ ctx }) {
  const D = window.USACH_DATA;
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  const [sel, setSel] = useState(estudiantes[0]?.id);
  const [tab, setTab] = useState('terreno');
  const [commentFor, setCommentFor] = useState(null);
  const [reportFor, setReportFor] = useState(null);

  const PiAvatar = window.PiAvatar, PiField = window.PiField;
  const TerrenoTabPI = window.TerrenoTabPI, InstrumentoTabPI = window.InstrumentoTabPI;

  // Estado vacío (estructura sin estudiantes)
  if (!estudiantes.length) {
    return (
      <div data-screen-label="Supervisión Práctica III">
        <div className="section-head">
          <div>
            <h1>Supervisión en terreno + Portafolio</h1>
            <div className="subtitle">Visitas al centro (participación/observación) + 3 evaluaciones de portafolio · se promedian y ponderan 20% · incluye la evaluación del/la tutor/a (20%)</div>
          </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => window.descargarPautaInstrumento({ cfg: D.TUTOR, niveles: D.NIVELES.NIVELES_FREC, est: null, titulo: 'Pauta de Evaluación del Entrenador/a Tutor/a' })}><I.download /> Descargar pauta del tutor/a</button>
        </div>
      </div>
        <div className="card" style={{ textAlign: 'center', padding: 56, color: 'var(--ink-500)' }}>
          <I.mapPin size={32} />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-700)' }}>Aún no hay estudiantes en esta práctica</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6, maxWidth: 460, marginInline: 'auto', lineHeight: 1.55 }}>
            Agrega estudiantes desde <strong>Estudiantes</strong> para registrar las visitas en terreno, la evaluación del/la tutor/a y el portafolio.
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => window.descargarPautaInstrumento({ cfg: D.TUTOR, niveles: D.NIVELES.NIVELES_FREC, est: null, titulo: 'Pauta de Evaluación del Entrenador/a Tutor/a' })}>
            <I.download size={14} /> Descargar pauta del tutor/a (en blanco)
          </button>
        </div>
      </div>
    );
  }

  const est = estudiantes.find(e => e.id === sel) || estudiantes[0];
  const visitas = (ctx.state.terreno && ctx.state.terreno[est.id]) || [];
  const supRes = D.notaSupervisorP3(est.id, ctx.state);
  const tutorCfg = D.tutorCfgFor ? D.tutorCfgFor(est) : D.TUTOR;
  const tutorRes = window.USACH_CALC.calcInstrumento(ctx.state.tutor?.[est.id], tutorCfg.dimensiones, D.NIVELES.NIVELES_FREC, D.ESCALAS.ESCALA_TUTOR);
  const semestralRes = D.SEMESTRAL ? window.USACH_CALC.calcInstrumento(ctx.state.semestral?.[est.id], D.SEMESTRAL.dimensiones, D.NIVELES.NIVELES_APREC, D.ESCALAS.ESCALA_SEMESTRAL) : null;
  const APREC_COLORS_P4 = { L: '#2F9E5E', ML: '#4FA9D9', NL: '#E0A833', I: '#D97840', NO: '#9e9e9e' };

  // Promedio de las 3 evaluaciones de portafolio
  const portNotas = (D.PORTAFOLIO_EVAL_IDS || []).map(pid => {
    const ev = D.EVALUACIONES.find(e => e.id === pid);
    const r = window.USACH_CALC.calcNotaEvaluacion(ev, ctx.state.niveles[pid]?.[est.id], ctx.state.atrasos[pid]?.[est.id]);
    return r && !r.parcial ? r.notaFinal : null;
  });
  const portDone = portNotas.filter(n => n != null);
  const portProm = portDone.length ? Math.round(portDone.reduce((a, b) => a + b, 0) / portDone.length * 10) / 10 : null;

  return (
    <div data-screen-label="Supervisión Práctica III">
      <div className="section-head">
        <div>
          <h1>Supervisión en terreno + Portafolio</h1>
          <div className="subtitle">
            Visitas al centro (participación/observación) + 3 evaluaciones de portafolio · se promedian y ponderan 20% · incluye la evaluación del/la tutor/a (20%)
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => window.descargarPautaInstrumento({ cfg: D.TUTOR, niveles: D.NIVELES.NIVELES_FREC, est: estudiantes.find(e => e.id === sel) || null, titulo: 'Pauta de Evaluación del Entrenador/a Tutor/a' })}><I.download /> Descargar pauta del tutor/a</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Roster lateral */}
        <div className="card" style={{ padding: 8 }}>
          {estudiantes.map(e => {
            const r = D.notaSupervisorP3(e.id, ctx.state);
            const nVis = ((ctx.state.terreno && ctx.state.terreno[e.id]) || []).length;
            const active = e.id === sel;
            return (
              <button key={e.id} onClick={() => setSel(e.id)}
                      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8,
                               background: active ? 'var(--teal-50)' : 'transparent', border: active ? '1px solid var(--teal-200)' : '1px solid transparent', cursor: 'pointer', marginBottom: 2 }}>
                <PiAvatar nombre={e.nombre} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nombre}</div>
                  <div className="muted" style={{ fontSize: 10.5 }}>{nVis} visita{nVis === 1 ? '' : 's'} · {e.centro || 'Centro de práctica'}</div>
                  {D.meta && D.meta.multiMencion && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal-600)', letterSpacing: '0.04em' }}>{e.area === 'ciencias' ? 'CIENCIAS' : e.area === 'gestion' ? 'GESTIÓN' : 'ENTRENADOR'}</div>}
                </div>
                <span className={`nota ${notaClass(r?.nota)}`} style={{ fontSize: 13 }}>{formatNota(r && !r.parcial ? r.nota : null)}</span>
              </button>
            );
          })}
        </div>

        {/* Panel del estudiante */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', background: 'linear-gradient(105deg, var(--teal-700), var(--teal-500))', color: '#fff', display: 'flex', gap: 16, alignItems: 'center' }}>
              <PiAvatar nombre={est.nombre} size={52} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: '#fff' }}>{est.nombre}</h2>
                <div style={{ fontSize: 12.5, opacity: 0.92 }}>{est.rut} · {est.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.85, fontWeight: 600 }}>Supervisión + Portafolio (20%)</div>
                <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }} className="tnum">{formatNota(supRes && !supRes.parcial ? supRes.nota : null)}</div>
                {supRes && supRes.parcial && <div style={{ fontSize: 11, opacity: 0.85 }}>parcial</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: 'var(--surface-1)' }}>
              <PiField label="Centro de práctica" value={est.centro || '—'} span={2} />
              <PiField label="Comuna" value={est.comuna || '—'} />
              <PiField label="Actividad / población" value={est.deporte || '—'} />
              <PiField label="Entrenador/a tutor/a" value={est.tutorCentro || '—'} span={2} />
              <PiField label="Días / horario" value={est.dias || '—'} span={2} />
              <PiField label="Visitas en terreno" value={`${visitas.length}`} />
              <PiField label="Portafolio (3 evals)" value={`${portDone.length}/3 · ${portProm != null ? formatNota(portProm) : '—'}`} />
              <PiField label="Nota tutor" value={tutorRes && !tutorRes.parcial ? formatNota(tutorRes.nota) : 'Pendiente'} />
              {D.SEMESTRAL && <PiField label="Eval. Semestral" value={semestralRes && !semestralRes.parcial ? formatNota(semestralRes.nota) : 'Pendiente'} />}
            </div>
          </div>

          <div className="tabs">
            <button className={tab === 'terreno' ? 'active' : ''} onClick={() => setTab('terreno')}>Visitas en terreno ({visitas.length})</button>
            <button className={tab === 'tutor' ? 'active' : ''} onClick={() => setTab('tutor')}>Eval. Entrenador/a Tutor/a</button>
            <button className={tab === 'portafolio' ? 'active' : ''} onClick={() => setTab('portafolio')}>Portafolio ({portDone.length}/3)</button>
            {D.SEMESTRAL && <button className={tab === 'semestral' ? 'active' : ''} onClick={() => setTab('semestral')}>Eval. Semestral</button>}
          </div>

          {tab === 'terreno' && <TerrenoTabPI est={est} ctx={ctx} onComment={() => setCommentFor(est)} onReport={() => setReportFor(est)} />}
          {tab === 'tutor' && <InstrumentoTabPI est={est} ctx={ctx} respKey="tutor" cfg={tutorCfg} colors={window.FREC_COLORS_PI}
                                                       titulo="Pauta del entrenador/a tutor/a del centro" pondera="20%" />}
          {tab === 'portafolio' && <PortafolioTabP3 est={est} ctx={ctx} onOpenEval={(id) => ctx.openEval && ctx.openEval(id)} />}
          {tab === 'semestral' && D.SEMESTRAL && <InstrumentoTabPI est={est} ctx={ctx} respKey="semestral" cfg={D.SEMESTRAL} colors={APREC_COLORS_P4}
                                                  titulo="Evaluación Semestral del/la Supervisor/a" pondera="(incluida en Superv. 20%)" />}
        </div>
      </div>

      {commentFor && <SupervisorCommentModal est={commentFor} isAuto={false}
                                              value={ctx.state.supervisorComments?.[commentFor.id] || ''}
                                              onSave={(text) => { ctx.setSupervisorComment('supervisorComments', commentFor.id, text); ctx.toast('Comentario guardado'); }}
                                              onClose={() => setCommentFor(null)} />}
      {reportFor && <StudentReportModal est={reportFor} ctx={ctx} onClose={() => setReportFor(null)} />}
    </div>
  );
}

// ─── Pestaña: resumen de las 3 evaluaciones de portafolio ─────
function PortafolioTabP3({ est, ctx, onOpenEval }) {
  const D = window.USACH_DATA;
  const evals = (D.PORTAFOLIO_EVAL_IDS || []).map(pid => D.EVALUACIONES.find(e => e.id === pid)).filter(Boolean);
  return (
    <div className="col" style={{ gap: 12 }}>
      <div style={{ padding: '10px 14px', background: 'var(--orange-50)', borderLeft: '3px solid var(--orange-400)', borderRadius: 4, fontSize: 12.5, color: 'var(--orange-800)' }}>
        Las 3 evaluaciones de portafolio (E/B/S/D) se califican en <strong>Evaluaciones</strong> y se promedian con las visitas en terreno para formar el 20% de supervisión.
      </div>
      {evals.map(ev => {
        const r = window.USACH_CALC.calcNotaEvaluacion(ev, ctx.state.niveles[ev.id]?.[est.id], ctx.state.atrasos[ev.id]?.[est.id]);
        return (
          <div key={ev.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="icon-dot" style={{ background: 'var(--orange-50)', color: 'var(--orange-700)' }}>
              <span style={{ fontWeight: 700 }}>{ev.numero}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{ev.titulo}</div>
              <div className="muted" style={{ fontSize: 12 }}>{fechaFmt(ev.fecha)} · ideal {ev.maxPuntos} pts</div>
            </div>
            <span className={`nota ${notaClass(r?.nota)}`}>{formatNota(r && !r.parcial ? r.notaFinal : null)}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenEval(ev.id)}><I.chev size={14} style={{ transform: 'rotate(-90deg)' }} /> Calificar</button>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { SupervisorP3Screen, PortafolioTabP3 });
