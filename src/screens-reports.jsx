// screens-reports.jsx — ReportsCenterModal · EditStudentModal · DeleteStudentConfirm · StudentReportModal
// Uses globals: I, USACH_DATA, USACH_CALC, USACHCrest, Field, formatNota, notaClass, fechaFmt, CoverRow, SectionPdf

const Dr = window.USACH_DATA;
const Cr = window.USACH_CALC;

// ═════════════════════════════════════════════════════════════
// REPORTS CENTER — central hub for all reports
// ═════════════════════════════════════════════════════════════

function ReportsCenterModal({ ctx, onClose }) {
  const [pick, setPick] = useState(null);
  // pick: { type: 'general' | 'eval' | 'student' | 'notas', target: id }

  const cards = [
    {
      id: 'general',
      icon: 'doc',
      title: 'Informe general del curso',
      desc: 'Características y ponderaciones de las 6 evaluaciones de Práctica I.',
      action: () => setPick({ type: 'general' }),
    },
    {
      id: 'evaluacion',
      icon: 'clipboard',
      title: 'Informe por evaluación',
      desc: 'Informe académico completo de una evaluación: rúbrica, escala y pautas.',
      pick: 'eval',
    },
    {
      id: 'estudiante',
      icon: 'user',
      title: 'Informe individual por estudiante',
      desc: 'Consolidado de notas, rúbricas completadas, comentarios y nota final.',
      pick: 'student',
    },
    {
      id: 'notas',
      icon: 'table',
      title: 'Tabla de notas del curso',
      desc: 'Notas parciales y nota final de todos los estudiantes, exportable a PDF/Excel.',
      action: () => setPick({ type: 'notas' }),
    },
  ];

  // Show selector for eval or student
  if (pick?.type === 'eval' || pick?.type === 'student') {
    return <ReportTargetPicker pick={pick} ctx={ctx} onBack={() => setPick(null)} onClose={onClose} />;
  }
  if (pick?.type === 'general') return <GeneralReportModal ctx={ctx} onClose={onClose} />;
  if (pick?.type === 'notas') return <NotasReportModal ctx={ctx} onClose={onClose} />;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.pdf />
          <h3 className="h3" style={{ margin: 0 }}>Centro de reportes</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body" style={{ background: 'var(--bg)', padding: 24 }}>
          <p className="muted" style={{ margin: '0 0 18px', fontSize: 13.5 }}>
            Genera reportes PDF para entrega académica, archivo institucional o feedback al estudiante.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {cards.map(c => {
              const IconC = I[c.icon];
              return (
                <button key={c.id}
                        className="card card-pad"
                        style={{ textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s', border: '1px solid var(--border)', background: 'var(--bg)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal-400)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        onClick={() => c.action ? c.action() : setPick({ type: c.pick })}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <IconC size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)', marginBottom: 4 }}>{c.title}</div>
                      <div className="muted" style={{ fontSize: 12, lineHeight: 1.4 }}>{c.desc}</div>
                    </div>
                    <I.arrowRight size={16} stroke="var(--ink-400)" />
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-1)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-600)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <I.zap size={16} stroke="var(--teal-600)" />
            <div>
              <strong>Generación masiva:</strong> los informes individuales pueden generarse en lote para todo el curso desde la opción correspondiente.
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function ReportTargetPicker({ pick, ctx, onBack, onClose }) {
  const [selectedId, setSelectedId] = useState(null);
  if (selectedId) {
    if (pick.type === 'eval') {
      const ev = ctx.state.evaluaciones.find(e => e.id === selectedId);
      return <window.InformeAcademicoModal ev={ev} ctx={ctx} onClose={onClose} />;
    }
    if (pick.type === 'student') {
      const est = (ctx.state.estudiantes || Dr.ESTUDIANTES).find(e => e.id === selectedId);
      return <StudentReportModal est={est} ctx={ctx} onClose={onClose} />;
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack}><I.arrowLeft /></button>
          <h3 className="h3" style={{ margin: 0 }}>
            {pick.type === 'eval' ? 'Selecciona una evaluación' : 'Selecciona un estudiante'}
          </h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 24 }}>
          <div className="col" style={{ gap: 8 }}>
            {pick.type === 'eval' && ctx.state.evaluaciones.map(ev => (
              <button key={ev.id} className="anexo-row" onClick={() => setSelectedId(ev.id)}>
                <span className="lvl" style={{ background: window.grupoEsTeal(ev.grupo) ? 'var(--teal-500)' : 'var(--orange-500)', width: 30, height: 30, fontSize: 11 }}>
                  {window.evalSigla(ev)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.titulo}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{ev.tipo} · {window.evalFechaInfo(ev, ctx.state).label}</div>
                </div>
                <I.arrowRight size={16} stroke="var(--ink-400)" />
              </button>
            ))}
            {pick.type === 'student' && (ctx.state.estudiantes || Dr.ESTUDIANTES).map(est => {
              const r = Cr.calcNotaFinal(est.id, ctx.state);
              return (
                <button key={est.id} className="anexo-row" onClick={() => setSelectedId(est.id)}>
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                    {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{est.nombre}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{est.rut} · {est.email}</div>
                  </div>
                  <span className={`nota ${notaClass(r?.notaFinal)}`}>{formatNota(r?.notaFinal)}</span>
                  <I.arrowRight size={16} stroke="var(--ink-400)" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onBack}>Volver</button>
        </div>
      </div>
    </div>
  );
}

function GeneralReportModal({ ctx, onClose }) {
  const bodyRef = React.useRef(null);
  const title = 'Informe general — ' + ((window.USACH_DATA.meta || {}).breadcrumb || 'Practica');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.pdf />
          <h3 className="h3" style={{ margin: 0 }}>Informe general del curso — {(window.USACH_DATA.meta || {}).breadcrumb || 'Práctica'}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" ref={bodyRef}>
          <window.PdfGeneral />
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, title, false); }}><I.print /> Imprimir</button>
          <button className="btn btn-primary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, title, true); }}><I.download /> Descargar PDF</button>
        </div>
      </div>
    </div>
  );
}

function NotasReportModal({ ctx, onClose }) {
  const D = window.USACH_DATA;
  const meta = D.meta || {};
  const cols = D.NOTAS_COLUMNS || [];
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  const prof = window.readProfProfile ? window.readProfProfile() : {};
  const bodyRef = React.useRef(null);
  const title = 'Tabla de notas — ' + (meta.breadcrumb || 'Practica');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.table />
          <h3 className="h3" style={{ margin: 0 }}>Tabla de notas — {meta.breadcrumb || 'Práctica'}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" ref={bodyRef}>
          <div className="pdf-page" style={{ padding: '40px 48px' }}>
            <div className="pdf-head">
              <div>
                <h1>Tabla de notas — {meta.cursoTitulo || 'Práctica'}</h1>
                <div className="muted" style={{ fontSize: 11 }}>USACH · {meta.escuela || 'Entrenador Deportivo'} · {meta.semestre || ''}</div>
              </div>
              <USACHCrest size={48} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)' }}>
                  <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left' }}>Estudiante</th>
                  <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left', width: 80 }}>RUT</th>
                  {cols.map(col => <th key={col.key} style={{ padding: '8px 4px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', minWidth: 40 }}>{col.label}</th>)}
                  <th style={{ padding: '8px 4px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', minWidth: 60, background: 'var(--teal-50)' }}>Final</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map(est => {
                  const r = Cr.calcNotaFinal(est.id, ctx.state);
                  return (
                    <tr key={est.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px', fontWeight: 600 }}>{est.nombre}</td>
                      <td style={{ padding: '6px', color: 'var(--ink-500)' }} className="tnum">{est.rut}</td>
                      {cols.map(col => {
                        const cn = window.notaColumna(col, est.id, ctx.state);
                        const n = cn.nota;
                        return <td key={col.key} style={{ padding: '6px', textAlign: 'center', color: n == null ? 'var(--ink-400)' : n < 4 ? 'var(--danger)' : 'var(--ink-800)' }} className="tnum">{formatNota(n)}</td>;
                      })}
                      <td style={{ padding: '6px', textAlign: 'center', background: 'var(--teal-50)', fontWeight: 700, fontSize: 12, color: r?.notaFinal == null ? 'var(--ink-400)' : r.notaFinal < 4 ? 'var(--danger)' : 'var(--success)' }} className="tnum">{formatNota(r?.notaFinal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 18, fontSize: 10.5, color: 'var(--ink-500)' }}>
              Exigencia 60% · Aprobación con nota 4,0 · Las notas en rojo indican reprobación.
            </div>
            <div style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--ink-500)' }}>
              {prof.nombre
                ? <span>Firma: <strong>{prof.nombre}</strong>{prof.titulo ? ' · ' + prof.titulo : ''} ________________________________</span>
                : <span>Firma profesor evaluador: ________________________________</span>}
              <span style={{ marginLeft: 48 }}>Fecha: ________________</span>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, title, false); }}><I.print /> Imprimir</button>
          <button className="btn btn-primary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, title, true); }}><I.download /> PDF</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STUDENT REPORT — comprehensive per-student
// ═════════════════════════════════════════════════════════════

function StudentReportModal({ est, ctx, onClose }) {
  const D = window.USACH_DATA;
  const meta = D.meta || {};
  const { evaluaciones, niveles, atrasos, supervisor, autoeval, supervisorComments, evalFeedback } = ctx.state;
  const finalR = Cr.calcNotaFinal(est.id, ctx.state);
  const supResolver = (D.RESOLVERS || {}).SUP ? D.RESOLVERS.SUP(est.id, ctx.state) : null;
  const autoResolver = (D.RESOLVERS || {}).AUTO ? D.RESOLVERS.AUTO(est.id, ctx.state) : null;
  const supComment = supervisorComments?.[est.id] || '';
  const prof = window.readProfProfile ? window.readProfProfile() : {};
  const feedbacks = (evaluaciones || []).map(function(ev) {
    return { ev, text: evalFeedback?.[ev.id]?.[est.id] || '' };
  }).filter(function(f) { return f.text; });
  const bodyRef = React.useRef(null);
  const title = 'Informe individual — ' + est.nombre;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 1000, maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.user />
          <h3 className="h3" style={{ margin: 0 }}>Informe individual — {est.nombre}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body" ref={bodyRef}>
          {/* PORTADA */}
          <div className="pdf-page" style={{ padding: '64px 64px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 50 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-500)', fontWeight: 700 }}>Universidad de Santiago de Chile</div>
                <div style={{ fontSize: 13, color: 'var(--ink-600)', marginTop: 2 }}>Escuela de Cs. de la Actividad Física, Deporte y Salud · Entrenador Deportivo</div>
              </div>
              <USACHCrest size={56} />
            </div>

            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--teal-700)', fontWeight: 700 }}>
              Informe individual de prácticas
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink-900)', margin: '8px 0 8px', letterSpacing: '-0.01em' }}>{est.nombre}</h1>
            <div style={{ fontSize: 14, color: 'var(--ink-600)' }}>{meta.cursoTitulo || 'Práctica'} · {meta.semestre || ''}</div>
            <div style={{ height: 3, width: 80, background: 'var(--teal-500)', marginTop: 18, marginBottom: 32 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', marginBottom: 8 }}>Datos del estudiante</h4>
                <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
                  <tbody>
                    <CoverRow k="RUT" v={est.rut} />
                    <CoverRow k="Email" v={est.email} />
                    <CoverRow k="Teléfono" v={est.telefono} />
                  </tbody>
                </table>
              </div>
              <div>
                <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', marginBottom: 8 }}>Resultado global</h4>
                <div style={{ padding: '20px 16px', background: finalR?.notaFinal >= 4 ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: finalR?.notaFinal >= 4 ? 'var(--success)' : 'var(--danger)' }}>
                    Nota final
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 700, color: finalR?.notaFinal >= 4 ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }} className="tnum">
                    {formatNota(finalR?.notaFinal)}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-600)', marginTop: 4 }}>
                    {finalR?.notaFinal == null ? 'Sin nota calculada' : finalR.notaFinal >= 4 ? 'APROBADO' : 'REPROBADO'}
                    {finalR && !finalR.completa && <span style={{ display: 'block', marginTop: 2, color: 'var(--warn)' }}>(cálculo parcial — faltan evaluaciones)</span>}
                  </div>
                </div>
              </div>
            </div>

            {(prof.nombre || prof.titulo) && (
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--surface-1)', borderRadius: 8, display: 'flex', gap: 24, alignItems: 'flex-start', fontSize: 11.5 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 4 }}>Profesor Supervisor</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{prof.nombre}</div>
                  {prof.titulo && <div style={{ color: 'var(--ink-600)', marginTop: 1 }}>{prof.titulo}</div>}
                </div>
                {prof.email && <div style={{ minWidth: 0 }}><div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 4 }}>Email</div><div style={{ color: 'var(--ink-700)' }}>{prof.email}</div></div>}
                {prof.telefono && <div style={{ minWidth: 0 }}><div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 4 }}>Telefono</div><div style={{ color: 'var(--ink-700)' }}>{prof.telefono}</div></div>}
              </div>
            )}

            <div style={{ marginTop: 32 }}>
              <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', marginBottom: 8 }}>Resumen por componente</h4>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--ink-700)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Componente</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', width: 70 }}>Nota</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', width: 80 }}>Peso</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', width: 90 }}>Aporte</th>
                  </tr>
                </thead>
                <tbody>
                  {Dr.PONDERACIONES.map(p => {
                    const parte = finalR?.partes.find(x => x.id === p.id);
                    const nota = parte?.nota;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                        <td style={{ padding: '6px 8px' }}>{getPonderacionLabel(p, ctx.state.evaluaciones)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: nota == null ? 'var(--ink-400)' : nota < 4 ? 'var(--danger)' : 'var(--ink-800)' }} className="tnum">{formatNota(nota)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }} className="tnum">{Math.round(p.peso * 100)}%</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }} className="tnum">{nota != null ? (nota * p.peso).toFixed(2).replace('.', ',') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rúbricas por evaluación */}
          {evaluaciones.map((ev, idx) => {
            const nivelesSet = Cr.nivelesSetForEval(ev);
            const nivelesEst = niveles[ev.id]?.[est.id] || {};
            const atraso = atrasos[ev.id]?.[est.id] || 0;
            const evR = Cr.calcNotaEvaluacion(ev, nivelesEst, atraso);
            const hasGrades = Object.keys(nivelesEst).length > 0;
            const esTeal = window.grupoEsTeal(ev.grupo);
            const grupo = window.grupoDef(ev.grupo);

            return (
              <div key={ev.id} className="pdf-page">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span className="lvl" style={{ background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)', width: 34, height: 34, fontSize: 13 }}>
                    {window.evalSigla(ev)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)', fontWeight: 700 }}>
                      {grupo.singular} {ev.numero} · {ev.tipo}
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, margin: '2px 0', color: 'var(--ink-900)' }}>{ev.titulo}</h2>
                  </div>
                  <span className={`nota nota-lg ${notaClass(evR?.notaFinal)}`}>{formatNota(evR && !evR.parcial ? evR.notaFinal : null)}</span>
                </div>

                {!hasGrades ? (
                  <div style={{ padding: 30, background: 'var(--surface-1)', borderRadius: 8, textAlign: 'center', color: 'var(--ink-500)', fontSize: 13 }}>
                    Sin calificación ingresada.
                  </div>
                ) : (
                  <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, marginBottom: 14 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-1)' }}>
                          <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left', width: 24 }}>N°</th>
                          <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left' }}>Criterio</th>
                          <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', width: 100 }}>Nivel</th>
                          <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'right', width: 50 }}>Pts</th>
                          <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'right', width: 40 }}>Máx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ev.criterios.map((cr, i) => {
                          const k = nivelesEst[cr.id];
                          const ni = nivelesSet.find(n => n.key === k);
                          const pts = ni ? ni.pts * (cr.doble ? 2 : 1) : 0;
                          const max = nivelesSet[0].pts * (cr.doble ? 2 : 1);
                          return (
                            <tr key={cr.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                              <td style={{ padding: '6px', fontWeight: 700, color: esTeal ? 'var(--teal-700)' : 'var(--orange-700)' }} className="tnum">{i+1}</td>
                              <td style={{ padding: '6px' }}>
                                {cr.texto}
                                {cr.doble && <span style={{ display: 'inline-block', marginLeft: 6, fontSize: 9, color: 'var(--orange-700)', background: 'var(--orange-50)', padding: '1px 5px', borderRadius: 999, fontWeight: 700 }}>×2</span>}
                              </td>
                              <td style={{ padding: '6px', textAlign: 'center' }}>
                                {ni ? <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: { E: '#E4F4EB', L: '#E4F4EB', B: '#E5F0FC', P: '#E5F0FC', S: '#FCF1DD', D: '#FBE6E6', N: '#FBE6E6' }[ni.key] || 'var(--ink-100)', color: { E: '#2F9E5E', L: '#2F9E5E', B: '#2C73C7', P: '#2C73C7', S: '#C97A0E', D: '#C84142', N: '#C84142' }[ni.key] || 'var(--ink-600)', fontWeight: 700, fontSize: 10 }}>{ni.label}</span> : <span className="muted">—</span>}
                              </td>
                              <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600 }} className="tnum">{ni ? pts : '—'}</td>
                              <td style={{ padding: '6px', textAlign: 'right', color: 'var(--ink-500)' }} className="tnum">{max}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: 12, background: 'var(--surface-1)', borderRadius: 8, fontSize: 11.5 }}>
                      <MetricBlock label="Puntaje" value={`${evR?.puntos ?? '—'}/${ev.maxPuntos}`} />
                      <MetricBlock label="Nota base" value={formatNota(evR?.notaBase)} />
                      <MetricBlock label="Atraso" value={`−${(evR?.ajuste ?? 0).toFixed(1).replace('.',',')}`}
                                   sub={`${atraso} día${atraso !== 1 ? 's' : ''}`} warn={atraso > 0} />
                      <MetricBlock label="Nota final" value={formatNota(evR?.notaFinal)} big accent />
                    </div>
                  </>
                )}

                {idx === evaluaciones.length - 1 && (
                  <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 10.5, color: 'var(--ink-500)' }}>
                    Página {idx + 2} de {evaluaciones.length + 2}
                  </div>
                )}
              </div>
            );
          })}

          {/* Eval. Supervisor + Autoevaluación + Comentarios */}
          <div className="pdf-page">
            {meta.terreno && D.SUPERVISOR && D.SUPERVISOR.areas ? (
              <SectionPdf title="Supervisión en terreno" accent="teal">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, padding: 12, background: 'var(--surface-1)', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Visitas en terreno ({D.areaDef(est.area).label}) + portafolio (promedio)</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-700)', marginTop: 2 }}>
                      {((ctx.state.terreno && ctx.state.terreno[est.id]) || []).length} visita(s) registrada(s)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Nota ({Math.round(((Dr.PONDERACIONES.find(p => p.resolver === 'SUP') || {}).peso || 0) * 100)}%)</div>
                    <div className={`nota nota-lg ${notaClass(supResolver?.nota)}`}>{formatNota(supResolver && !supResolver.parcial ? supResolver.nota : null)}</div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <tbody>
                    {((ctx.state.terreno && ctx.state.terreno[est.id]) || []).map((v, i) => {
                      const md = D.modoDef(est.area, v.modo);
                      const rv = D.notaTerrenoVisita(est.area, v);
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                          <td style={{ padding: '5px 0' }}>Visita {i + 1} · {md.label}</td>
                          <td style={{ padding: '5px 0', textAlign: 'center', color: 'var(--ink-500)' }} className="tnum">{fechaFmt(v.fecha)}</td>
                          <td style={{ padding: '5px 0', textAlign: 'right', width: 90 }}><span className={`nota ${notaClass(rv.nota)}`}>{formatNota(rv.nota)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </SectionPdf>
            ) : meta.terreno ? (
              <SectionPdf title="Supervisión en terreno y proceso" accent="teal">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, padding: 12, background: 'var(--surface-1)', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Visitas en terreno + evaluación de proceso (promedio)</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-700)', marginTop: 2 }}>
                      {((ctx.state.terreno && ctx.state.terreno[est.id]) || []).length} visita(s) registrada(s) · proceso {D.notaProceso(ctx.state.proceso && ctx.state.proceso[est.id]) != null ? formatNota(D.notaProceso(ctx.state.proceso[est.id])) : 'pendiente'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Nota (15%)</div>
                    <div className={`nota nota-lg ${notaClass(supResolver?.nota)}`}>{formatNota(supResolver && !supResolver.parcial ? supResolver.nota : null)}</div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <tbody>
                    {((ctx.state.terreno && ctx.state.terreno[est.id]) || []).map((v, i) => {
                      const modo = D.MODOS_TERRENO[v.modo];
                      const rv = D.notaTerrenoVisita(v);
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                          <td style={{ padding: '5px 0' }}>Visita {i + 1} · {modo.label}</td>
                          <td style={{ padding: '5px 0', textAlign: 'center', color: 'var(--ink-500)' }} className="tnum">{fechaFmt(v.fecha)}</td>
                          <td style={{ padding: '5px 0', textAlign: 'right', width: 90 }}><span className={`nota ${notaClass(rv.nota)}`}>{formatNota(rv.nota)}</span></td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td style={{ padding: '5px 0', fontWeight: 600 }}>Evaluación de proceso (40 pts)</td>
                      <td></td>
                      <td style={{ padding: '5px 0', textAlign: 'right' }}><span className={`nota ${notaClass(D.notaProceso(ctx.state.proceso && ctx.state.proceso[est.id]))}`}>{formatNota(D.notaProceso(ctx.state.proceso && ctx.state.proceso[est.id]))}</span></td>
                    </tr>
                  </tbody>
                </table>
              </SectionPdf>
            ) : (
              <SectionPdf title="Evaluación del Profesor Supervisor" accent="teal">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, padding: 12, background: 'var(--surface-1)', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Puntaje obtenido</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }} className="tnum">{Cr.calcSupervisor(supervisor[est.id])?.puntos ?? '—'} / 48</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Nota</div>
                    <div className={`nota nota-lg ${notaClass(supResolver?.nota)}`}>{formatNota(supResolver && !supResolver.parcial ? supResolver.nota : null)}</div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <tbody>
                    {(Dr.SUPERVISOR_DIMENSIONES || []).map(dim => (
                      <React.Fragment key={dim.id}>
                        <tr><td colSpan={2} style={{ padding: '8px 0 4px', fontWeight: 700, color: 'var(--teal-700)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dim.label}</td></tr>
                        {dim.indicadores.map(ind => {
                          const k = supervisor[est.id]?.[ind.id];
                          const ni = (Dr.NIVELES_SUPERVISOR || []).find(n => n.key === k);
                          return (
                            <tr key={ind.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                              <td style={{ padding: '4px 0 4px 14px' }}>{ind.texto}</td>
                              <td style={{ padding: '4px 0', textAlign: 'right', width: 110 }}>
                                {ni ? <span style={{ fontWeight: 600, fontSize: 10.5, padding: '1px 8px', borderRadius: 999, background: { S: 'var(--success-bg)', CS: 'var(--success-bg)', O: 'var(--warn-bg)', CN: 'var(--danger-bg)', N: 'var(--danger-bg)' }[ni.key], color: { S: 'var(--success)', CS: 'var(--success)', O: 'var(--warn)', CN: 'var(--danger)', N: 'var(--danger)' }[ni.key] }}>{ni.label}</span> : <span className="muted">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </SectionPdf>
            )}

            {feedbacks.length > 0 && (
              <SectionPdf title="Feedback por evaluación" accent="teal">
                <div className="col" style={{ gap: 10 }}>
                  {feedbacks.map(function(f) {
                    return (
                      <div key={f.ev.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 4 }}>{f.ev.titulo}</div>
                        <div style={{ fontSize: 12, lineHeight: 1.55 }}>{f.text}</div>
                      </div>
                    );
                  })}
                </div>
              </SectionPdf>
            )}

            <SectionPdf title="Comentarios del profesor supervisor" accent="teal">
              <div style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, lineHeight: 1.55, minHeight: 80, background: 'var(--bg)' }}>
                {supComment || <span className="muted" style={{ fontStyle: 'italic' }}>Sin comentarios registrados.</span>}
              </div>
            </SectionPdf>

            <SectionPdf title="Autoevaluación del estudiante" accent="teal">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: 'var(--surface-1)', borderRadius: 8 }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-600)' }}>
                  Autoevaluación del estudiante (escala de apreciación)
                </div>
                <div>
                  <span className={`nota nota-lg ${notaClass(autoResolver?.nota)}`}>{formatNota(autoResolver && !autoResolver.parcial ? autoResolver.nota : null)}</span>
                </div>
              </div>
            </SectionPdf>

            <SectionPdf title="Cierre" accent="teal">
              <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse', marginBottom: 24 }}>
                <tbody>
                  <CoverRow k="Atrasos acumulados" v={`${Object.values(atrasos).reduce((acc, m) => acc + (m[est.id] || 0), 0)} día(s) — descuento de 0,5 pts/día por evaluación`} />
                  <CoverRow k="Estado final" v={finalR?.notaFinal == null ? 'Pendiente' : finalR.notaFinal >= 4 ? 'Aprobado' : 'Reprobado'} />
                  <CoverRow k="Documento generado" v={new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })} />
                </tbody>
              </table>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 40, fontSize: 10.5, color: 'var(--ink-600)' }}>
                <div style={{ borderTop: '1px solid var(--ink-700)', paddingTop: 6, textAlign: 'center' }}>Firma profesor supervisor</div>
                <div style={{ borderTop: '1px solid var(--ink-700)', paddingTop: 6, textAlign: 'center' }}>Firma estudiante</div>
              </div>
            </SectionPdf>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={() => ctx.toast('Informe enviado al email del estudiante')}>
            <I.send /> Enviar por email
          </button>
          <button className="btn btn-secondary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, title, false); }}><I.print /> Imprimir</button>
          <button className="btn btn-primary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, title, true); }}><I.download /> Descargar PDF</button>
        </div>
      </div>
    </div>
  );
}

function MetricBlock({ label, value, sub, warn, big, accent }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)' }}>{label}</div>
      <div style={{ fontSize: big ? 20 : 15, fontWeight: 700, color: accent ? 'var(--teal-700)' : warn ? 'var(--warn)' : 'var(--ink-900)' }} className="tnum">{value}</div>
      {sub && <div style={{ fontSize: 10, color: warn ? 'var(--warn)' : 'var(--ink-500)' }}>{sub}</div>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STUDENT EDIT / DELETE MODALS
// ═════════════════════════════════════════════════════════════

function EditStudentModal({ student, ctx, onClose }) {
  const [draft, setDraft] = useState({ ...student });
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
            {student.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
          </div>
          <h3 className="h3" style={{ margin: 0 }}>Editar estudiante</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 24 }}>
          <div className="col" style={{ gap: 14 }}>
            <Field label="RUT"><input className="input" value={draft.rut} onChange={e => set('rut', e.target.value)} /></Field>
            <Field label="Nombre completo"><input className="input" value={draft.nombre} onChange={e => set('nombre', e.target.value)} /></Field>
            <Field label="Email institucional"><input className="input" value={draft.email} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Teléfono"><input className="input" value={draft.telefono} onChange={e => set('telefono', e.target.value)} /></Field>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { ctx.updateStudent(student.id, draft); ctx.toast('Estudiante actualizado'); onClose(); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function DeleteStudentConfirm({ student, ctx, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.warn stroke="var(--danger)" />
          <h3 className="h3" style={{ margin: 0 }}>Eliminar estudiante</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: 14 }}>
            ¿Confirmas eliminar a <strong>{student.nombre}</strong>?
          </p>
          <div style={{ padding: 12, background: 'var(--danger-bg)', borderRadius: 8, fontSize: 12.5, color: 'var(--danger)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <I.warn size={16} />
            <div>
              <strong>Esta acción no se puede deshacer.</strong> Se eliminarán todas las calificaciones, atrasos, evaluaciones del supervisor, autoevaluación y comentarios asociados.
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => { ctx.deleteStudent(student.id); ctx.toast('Estudiante eliminado'); onClose(); }}>Eliminar definitivamente</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ReportsCenterModal, StudentReportModal,
  EditStudentModal, DeleteStudentConfirm,
});
