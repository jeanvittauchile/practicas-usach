// screens-eval.jsx — Detalle evaluación · Rúbrica batch · Supervisor · Autoevaluación
// Uses globals: I, USACH_DATA, USACH_CALC, notaClass, formatNota, fechaFmt, PdfPreviewModal

const Dd = window.USACH_DATA;
const Cc = window.USACH_CALC;

// ═════════════════════════════════════════════════════════════
// DETALLE DE EVALUACIÓN
// ═════════════════════════════════════════════════════════════

function EvalDetail({ evalId, ctx, onBack, onGrade }) {
  const ev = ctx.state.evaluaciones.find(e => e.id === evalId);
  const [tab, setTab] = useState('detalle');
  const [openSec, setOpenSec] = useState(['ra', 'oe']); // open by default
  const [showEdit, setShowEdit] = useState(false);
  const [showEditFecha, setShowEditFecha] = useState(false);
  const [showInforme, setShowInforme] = useState(false);

  if (!ev) return null;
  const esTeal = window.grupoEsTeal(ev.grupo);
  const grupo = window.grupoDef(ev.grupo);
  const todosEst = ctx.state.estudiantes || Dd.ESTUDIANTES;
  const estudiantes = ev.menciones ? todosEst.filter(e => ev.menciones.includes(e.area || 'deportiva')) : todosEst;

  const toggle = (k) => setOpenSec(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);

  // Compute progress
  const total = estudiantes.length;
  const esPresent = ev.grupo === 'presentacion';
  const presentIds = ['p1','p2','p3','p4'];
  const completados = esPresent
    ? estudiantes.filter(est => {
        const resp = ctx.state.supervisor?.[est.id] || {};
        return presentIds.every(id => resp[id]);
      }).length
    : estudiantes.filter(est => {
        const r = Cc.calcNotaEvaluacion(ev, ctx.state.niveles[ev.id]?.[est.id], ctx.state.atrasos[ev.id]?.[est.id]);
        return r && !r.parcial;
      }).length;

  return (
    <div data-screen-label="Detalle evaluación">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.arrowLeft /> Volver</button>
        <span className="muted" style={{ fontSize: 12 }}>Evaluaciones / {grupo.label}</span>
      </div>

      {/* Hero */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 18 }}>
        <div className="eval-hero" style={{
          padding: '24px 28px',
          background: esTeal
            ? 'linear-gradient(105deg, var(--teal-700), var(--teal-500))'
            : 'linear-gradient(105deg, var(--orange-700), var(--orange-500))',
          color: '#fff',
          display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, flex: '0 0 64px' }}>
            {window.evalSigla(ev)}
          </div>
          <div style={{ flex: '1 1 180px', minWidth: 0 }}>
            <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 600 }}>
              {grupo.singular} {ev.numero} · {ev.tipo}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '4px 0', color: '#fff', letterSpacing: '-0.005em' }}>{ev.titulo}</h1>
            <div style={{ fontSize: 13, opacity: 0.92, marginTop: 4 }}>{ev.descripcion}</div>
          </div>
          <div style={{ flex: '0 0 auto', minWidth: 130, whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 600 }}>
              Fecha entrega{ev.semanaEntrega ? ` · Semana ${ev.semanaEntrega}` : ''}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{window.evalFechaInfo(ev, ctx.state).label}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{ev.duracion}</div>
          </div>
        </div>
        <div className="eval-hero-meta" style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '16px 28px', background: 'var(--surface-1)' }}>
          <Metric label="Calificación" value={`${completados}/${total}`} sub={esPresent ? 'con dim. 7 completa' : 'estudiantes'} />
          {!esPresent && <Metric label="Puntaje máx." value={ev.maxPuntos} sub="puntos" />}
          {!esPresent && <Metric label="Criterios" value={ev.criterios.length} sub={`${ev.criterios.filter(c=>c.doble).length} con doble puntaje`} />}
          {ev.ponderacion > 0 && <Metric label="Ponderación" value={`${Math.round(ev.ponderacion*100)}%`} sub="de la nota final" />}
          {esPresent && <Metric label="Indicadores" value={4} sub="Dim. 7 del supervisor" />}
          {esPresent && <Metric label="Escala" value="S/CS/O/CN/N" sub="máx. 16 pts" />}
          {ev.variantes && <VariantToggle ev={ev} ctx={ctx} />}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {!esPresent && <button className="btn btn-secondary" onClick={() => setShowEdit(true)}><I.edit /> Editar</button>}
            {esPresent && <button className="btn btn-secondary" onClick={() => setShowEditFecha(true)}><I.edit /> Editar fecha</button>}
            {!esPresent && <button className="btn btn-secondary" onClick={() => setShowInforme(true)}><I.print /> Generar informe</button>}
            {esPresent
              ? <button className="btn btn-primary" onClick={() => ctx.navTo && ctx.navTo('supervisor')}>
                  <I.checkSquare /> Ir a Eval. Supervisor → Dim. 7
                </button>
              : <button className="btn btn-primary" onClick={() => onGrade(ev.id)}>
                  <I.checkSquare /> Calificar estudiantes
                </button>
            }
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={tab === 'detalle' ? 'active' : ''} onClick={() => setTab('detalle')}>Detalle</button>
        <button className={tab === 'rubrica' ? 'active' : ''} onClick={() => setTab('rubrica')}>Rúbrica</button>
        <button className={tab === 'estudiantes' ? 'active' : ''} onClick={() => setTab('estudiantes')}>Estudiantes ({total})</button>
        <button className={tab === 'anexos' ? 'active' : ''} onClick={() => setTab('anexos')}>Anexos</button>
      </div>

      {tab === 'detalle' && (
        <div className="col" style={{ gap: 10 }}>
          {esPresent && (
            <div style={{ padding: '14px 18px', background: 'linear-gradient(105deg, var(--teal-50), var(--orange-50))', border: '1px solid var(--teal-200)', borderRadius: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <I.mapPin size={22} style={{ color: 'var(--teal-600)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--teal-800)', marginBottom: 4 }}>Esta evaluación se califica en Eval. Supervisor → Dimensión 7</div>
                <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  La nota de la presentación forma parte del instrumento del Supervisor (30%). Para registrar las calificaciones, ve a
                  <strong> Procesos → Eval. Supervisor</strong> y completa la Dimensión 7 de cada estudiante.
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => ctx.navTo && ctx.navTo('supervisor')}>
                  <I.checkSquare size={14} /> Ir a Eval. Supervisor → Dim. 7
                </button>
              </div>
            </div>
          )}
          <DetailSection sec="ra" open={openSec.includes('ra')} toggle={toggle} isTaller={!esTeal}
                         icon="zap" title="Resultados de aprendizaje">
            <ul>{ev.resultadosAprendizaje.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </DetailSection>
          <DetailSection sec="oe" open={openSec.includes('oe')} toggle={toggle} isTaller={!esTeal}
                         icon="checkSquare" title="Objetivos específicos">
            <ul>{ev.objetivosEspecificos.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </DetailSection>
          <DetailSection sec="in" open={openSec.includes('in')} toggle={toggle} isTaller={!esTeal}
                         icon="list" title="Instrucciones">
            <ol style={{ margin: 0, paddingLeft: 18 }}>{ev.instrucciones.map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}</ol>
          </DetailSection>
          <DetailSection sec="af" open={openSec.includes('af')} toggle={toggle} isTaller={!esTeal}
                         icon="doc" title="Aspectos formales">
            <ul>{ev.aspectosFormales.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </DetailSection>
          {ev.pautasEstudiante && ev.pautasEstudiante.length > 0 && (
            <DetailSection sec="pe" open={openSec.includes('pe')} toggle={toggle} isTaller={!esTeal}
                           icon="zap" title="Recomendaciones para el estudiante">
              <div style={{ padding: '8px 12px', background: esTeal ? 'var(--teal-50)' : 'var(--orange-50)', borderLeft: `3px solid ${esTeal ? 'var(--teal-500)' : 'var(--orange-500)'}`, borderRadius: 4, marginBottom: 10, fontSize: 12, color: 'var(--ink-700)' }}>
                Sugerencias prácticas para el estudiante. Se incluyen en el informe entregado.
              </div>
              <ul>{ev.pautasEstudiante.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </DetailSection>
          )}
          {ev.pautas && ev.pautas.length > 0 && (
            <DetailSection sec="pa" open={openSec.includes('pa')} toggle={toggle} isTaller={!esTeal}
                           icon="checkSquare" title="Pautas para el evaluador (uso interno)">
              <div style={{ padding: '8px 12px', background: 'var(--warn-bg)', borderLeft: '3px solid var(--warn)', borderRadius: 4, marginBottom: 10, fontSize: 12, color: 'var(--warn)' }}>
                <strong>Confidencial:</strong> estas pautas son referencia para el profesor/a evaluador y no se comparten con los estudiantes.
              </div>
              <ul>{ev.pautas.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </DetailSection>
          )}
        </div>
      )}

      {showEdit && <EditEvalModal ev={ev} ctx={ctx} onClose={() => setShowEdit(false)} />}
      {showEditFecha && <EditFechaModal ev={ev} ctx={ctx} onClose={() => setShowEditFecha(false)} />}
      {showInforme && <InformeAcademicoModal ev={ev} ctx={ctx} onClose={() => setShowInforme(false)} />}

      {tab === 'rubrica' && <RubricaPreview ev={ev} />}

      {tab === 'estudiantes' && <EvalStudentList ev={ev} ctx={ctx} onOpenPdf={(est) => ctx.openStudentPdf(ev, est)} />}

      {tab === 'anexos' && <EvalAnexos ev={ev} ctx={ctx} />}
    </div>
  );
}

function VariantToggle({ ev, ctx, compact }) {
  if (!ev.variantes) return null;
  const keys = Object.keys(ev.variantes);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: compact ? 'rgba(255,255,255,0.88)' : 'var(--ink-500)' }}>Tipo de deporte</span>
      <div style={{ display: 'inline-flex', background: compact ? 'rgba(255,255,255,0.18)' : 'var(--surface-2)', borderRadius: 8, padding: 3, gap: 3 }}>
        {keys.map(k => {
          const on = ev.variante === k;
          return (
            <button key={k} onClick={() => !on && ctx.setEvalVariante(ev.id, k)}
                    style={{ border: 'none', cursor: on ? 'default' : 'pointer', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                             background: on ? (compact ? '#fff' : 'var(--teal-600)') : 'transparent',
                             color: on ? (compact ? 'var(--teal-700)' : '#fff') : (compact ? '#fff' : 'var(--ink-600)') }}>
              {ev.variantes[k].label} <span style={{ opacity: 0.7, fontWeight: 500 }}>· {ev.variantes[k].maxPuntos} pts</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, sub }) {
  return (
    <div style={{ minWidth: 0, flexShrink: 0 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-900)', whiteSpace: 'nowrap' }} className="tnum">{value}</div>
      <div className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>{sub}</div>
    </div>
  );
}

function DetailSection({ open, toggle, sec, icon, title, isTaller, children }) {
  const IconC = I[icon];
  return (
    <div className={`detail-section ${open ? 'open' : ''} ${isTaller ? 'is-taller' : ''}`}>
      <button className="head" onClick={() => toggle(sec)}>
        <div className="icon-dot"><IconC size={16} /></div>
        <span className="title">{title}</span>
        <I.chev className="chev" size={16} />
      </button>
      {open && <div className="body">{children}</div>}
    </div>
  );
}

function RubricaPreview({ ev }) {
  const nivelesSet = Cc.nivelesSetForEval(ev);
  const esTeal = window.grupoEsTeal(ev.grupo);
  return (
    <div className="card" style={{ padding: 0, overflow: 'auto' }}>
      <table className="tbl" style={{ minWidth: 800 }}>
        <thead>
          <tr>
            <th style={{ minWidth: 280 }}>Criterio</th>
            {nivelesSet.map(n => (
              <th key={n.key} style={{ minWidth: 130 }}>
                <span className={`lvl lvl-${n.key}`} style={{ marginRight: 6 }}>{n.key}</span>
                {n.label} <span className="muted">({n.pts} pts)</span>
              </th>
            ))}
            <th className="numeric">Máx.</th>
          </tr>
        </thead>
        <tbody>
          {ev.criterios.map((cr, i) => (
            <tr key={cr.id}>
              <td>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, color: esTeal ? 'var(--teal-700)' : 'var(--orange-700)' }} className="tnum">{i+1}.</span>
                  <span>{cr.texto}{cr.doble && <span className="tag tag-orange" style={{ marginLeft: 6 }}>×2</span>}</span>
                </div>
              </td>
              {nivelesSet.map(n => (
                <td key={n.key} style={{ fontSize: 12, color: 'var(--ink-600)' }}>
                  {cr.niveles && cr.niveles[n.key] ? cr.niveles[n.key]
                    : i === 0 ? n.desc
                    : <span className="muted">según criterio</span>}
                </td>
              ))}
              <td className="numeric tnum"><strong>{nivelesSet[0].pts * (cr.doble ? 2 : 1)} pts</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EvalStudentList({ ev, ctx, onOpenPdf }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th className="numeric">Puntaje</th>
            <th className="numeric">Atraso</th>
            <th className="numeric">Nota</th>
            <th>Estado</th>
            <th style={{ width: 100 }}></th>
          </tr>
        </thead>
        <tbody>
          {(ctx.state.estudiantes || Dd.ESTUDIANTES).map(est => {
            const r = Cc.calcNotaEvaluacion(ev, ctx.state.niveles[ev.id]?.[est.id], ctx.state.atrasos[ev.id]?.[est.id]);
            const atraso = ctx.state.atrasos[ev.id]?.[est.id] || 0;
            return (
              <tr key={est.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                      {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{est.nombre}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{est.rut}</div>
                    </div>
                  </div>
                </td>
                <td className="numeric tnum">{r ? `${r.puntos}/${ev.maxPuntos}` : <span className="muted">—</span>}</td>
                <td className="numeric">{atraso > 0 ? <span className="tag tag-warn">{atraso}d</span> : <span className="muted">—</span>}</td>
                <td className="numeric">
                  <span className={`nota ${notaClass(r?.notaFinal)}`}>{formatNota(r?.notaFinal)}</span>
                </td>
                <td>
                  {r == null || r.parcial ? <span className="tag tag-outline">Sin calificar</span> :
                                            <span className="tag tag-success"><I.check size={11} /> Corregido</span>}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => onOpenPdf(est)}><I.pdf /> PDF</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EvalAnexos({ ev, ctx }) {
  const [showAdd, setShowAdd] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const items = (ctx.state.evalAnexos || {})[ev.id] || [];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          {items.length === 0 ? 'Aún no hay anexos para esta evaluación.' : `${items.length} archivo${items.length === 1 ? '' : 's'} compartido${items.length === 1 ? '' : 's'} con los estudiantes`}
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><I.upload /> Subir anexo</button>
      </div>
      <div className="col" style={{ gap: 10 }}>
        {items.length === 0 ? (
          <button className="anexo-row" style={{ borderStyle: 'dashed', justifyContent: 'center', color: 'var(--ink-500)', cursor: 'pointer', background: 'transparent', padding: 28, flexDirection: 'column', gap: 6 }}
                  onClick={() => setShowAdd(true)}>
            <I.upload size={24} />
            <strong style={{ fontSize: 13 }}>Arrastra archivos PDF aquí o haz clic para seleccionar</strong>
            <span className="muted" style={{ fontSize: 11.5 }}>Máximo 10 MB por archivo</span>
          </button>
        ) : (
          <>
            {items.map(a => (
              <div key={a.id} className="anexo-row">
                <div className="file-icon">PDF</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {renaming?.id === a.id ? (
                    <input className="input input-sm" autoFocus
                           style={{ width: '100%', fontSize: 14, fontWeight: 600 }}
                           value={renaming.titulo}
                           onChange={e => setRenaming({ ...renaming, titulo: e.target.value })}
                           onBlur={() => { ctx.renameEvalAnexo(ev.id, a.id, renaming.titulo); setRenaming(null); }}
                           onKeyDown={e => { if (e.key === 'Enter') { ctx.renameEvalAnexo(ev.id, a.id, renaming.titulo); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</div>
                  )}
                  <div className="muted" style={{ fontSize: 12 }}>Subido el {a.subido} · {a.por || 'Andrés Tapia'}</div>
                </div>
                <span className="tag tag-outline">{a.tamano}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setRenaming({ id: a.id, titulo: a.titulo })} title="Renombrar"><I.edit size={14} /></button>
                <button className="btn btn-secondary btn-sm" onClick={() => ctx.toast(`Descargando "${a.titulo}"…`)}><I.download size={14} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm(`¿Eliminar "${a.titulo}"?`)) { ctx.removeEvalAnexo(ev.id, a.id); ctx.toast('Anexo eliminado'); } }} title="Eliminar">
                  <I.trash size={14} stroke="var(--danger)" />
                </button>
              </div>
            ))}
            <button className="anexo-row" style={{ borderStyle: 'dashed', justifyContent: 'center', color: 'var(--ink-500)', cursor: 'pointer', background: 'transparent' }}
                    onClick={() => setShowAdd(true)}>
              <I.plus /> Añadir otro anexo
            </button>
          </>
        )}
      </div>
      {showAdd && <UploadAnexoModal evalId={ev.id} ctx={ctx} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// RÚBRICA BATCH — vista Excel para calificar todo el curso
// ═════════════════════════════════════════════════════════════

function RubricaBatch({ evalId, ctx, onBack }) {
  const ev = ctx.state.evaluaciones.find(e => e.id === evalId);
  if (!ev) return null;
  const nivelesSet = Cc.nivelesSetForEval(ev);
  const grupo = window.grupoDef(ev.grupo);
  const esTeal = window.grupoEsTeal(ev.grupo);
  const todosEst = ctx.state.estudiantes || Dd.ESTUDIANTES;
  const estudiantes = ev.menciones ? todosEst.filter(e => ev.menciones.includes(e.area || 'deportiva')) : todosEst;
  const [showDescPara, setShowDescPara] = useState(null); // criterioId — open desc popover
  const [showFeedback, setShowFeedback] = useState(null);

  return (
    <div data-screen-label="Rúbrica batch">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><I.arrowLeft /> Volver al detalle</button>
        <span className="muted" style={{ fontSize: 12 }}>
          {grupo.singular} {ev.numero}
        </span>
      </div>

      <div className="section-head">
        <div>
          <h1>Calificar: {ev.titulo}</h1>
          <div className="subtitle">
            Vista batch: ingreso rápido tipo Excel. Las notas se recalculan al instante.
            <span className="kbd" style={{ marginLeft: 8 }}>Tab</span> para avanzar ·
            <span className="kbd" style={{ marginLeft: 4 }}>1·2·3·4</span> para asignar nivel
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => ctx.fillSuggested(ev.id)}>
            <I.zap /> Sugerir niveles
          </button>
          <button className="btn btn-secondary" onClick={() => ctx.clearEval(ev.id)}>
            Limpiar todo
          </button>
          <button className="btn btn-primary" onClick={() => ctx.toast('Notas guardadas y publicadas a estudiantes')}>
            <I.send /> Guardar y publicar
          </button>
        </div>
      </div>

      {ev.variantes && (
        <div className="card" style={{ padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <VariantToggle ev={ev} ctx={ctx} />
          <span className="muted" style={{ fontSize: 12 }}>El conjunto de criterios y el puntaje ideal cambian según el tipo de deporte del informe.</span>
        </div>
      )}

      {ev.menciones && ev.menciones.length < 3 && (
        <div className="card" style={{ padding: '10px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: 'var(--teal-50)', border: '1px solid var(--teal-200)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-700)' }}>Mención: {ev.menciones.map(m => m === 'deportiva' ? 'Entrenador (Deportiva)' : m === 'ciencias' ? 'Ciencias del Deporte' : 'Gestión Deportiva').join(' · ')}</span>
          <span className="muted" style={{ fontSize: 12 }}>Solo se muestran los estudiantes de esta mención ({estudiantes.length} de {todosEst.length}).</span>
        </div>
      )}

      {/* Leyenda */}
      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Niveles:</strong>
          {nivelesSet.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className={`lvl lvl-${n.key}`}>{n.key}</span>
              {n.label} <span className="muted">({n.pts}pt)</span>
            </span>
          ))}
        </div>
        <div className="right">
          <span className="muted" style={{ fontSize: 12 }}>
            Doble puntaje: <span className="tag tag-orange" style={{ marginLeft: 4 }}>×2</span>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="rubric-grid-wrap">
        <table className="rubric-grid">
          <thead>
            <tr>
              <th className="student" style={{ width: 220 }}>Estudiante</th>
              {ev.criterios.map((cr, i) => (
                <th key={cr.id} className={`crit ${cr.doble ? 'doble' : ''} ${!esTeal ? 'is-taller' : ''}`}>
                  <span className="crit-num">CRITERIO {i+1}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-700)', fontWeight: 500, lineHeight: 1.3, marginTop: 2 }}>
                    {cr.texto.length > 80 ? cr.texto.slice(0, 80) + '…' : cr.texto}
                  </span>
                </th>
              ))}
              <th className="crit atraso-cell" style={{ width: 80 }}>
                <span className="crit-num" style={{ color: 'var(--warn)' }}>ATRASO</span>
                <span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-500)' }}>−0,5/día</span>
              </th>
              <th className="crit" style={{ width: 80, textAlign: 'right' }}>
                <span className="crit-num">PUNTOS</span>
                <span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-500)' }}>/{ev.maxPuntos}</span>
              </th>
              <th className="crit" style={{ width: 90, textAlign: 'center', background: 'var(--teal-50)' }}>
                <span className="crit-num" style={{ color: 'var(--teal-800)' }}>NOTA</span>
              </th>
              <th className="crit" style={{ width: 60, textAlign: 'center' }}>
                <span className="crit-num">FB</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map(est => {
              const nivelesEst = ctx.state.niveles[ev.id]?.[est.id] || {};
              const atraso = ctx.state.atrasos[ev.id]?.[est.id] || 0;
              const r = Cc.calcNotaEvaluacion(ev, nivelesEst, atraso);
              return (
                <tr key={est.id}>
                  <td className="student">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10.5, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                        {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5 }}>{est.nombre}</div>
                        <div className="muted" style={{ fontSize: 10.5 }}>{est.rut}</div>
                      </div>
                    </div>
                  </td>
                  {ev.criterios.map(cr => {
                    const k = nivelesEst[cr.id];
                    return (
                      <td key={cr.id} className="score-cell">
                        <div className="seg">
                          {nivelesSet.map(n => (
                            <button key={n.key} className={k === n.key ? `on-${n.key}` : ''}
                                    title={n.label + ' — ' + n.pts + ' pts'}
                                    onClick={() => ctx.setNivel(ev.id, est.id, cr.id, k === n.key ? null : n.key)}>
                              {n.key}
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                  <td className="atraso-cell">
                    <input type="number" min={0} max={30} value={atraso} className="input input-sm"
                           onChange={e => ctx.setAtraso(ev.id, est.id, parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="points-cell tnum">
                    {r ? r.puntos : <span className="muted">—</span>}
                    {r && r.parcial && <div style={{ fontSize: 9.5, color: 'var(--ink-400)' }}>parcial</div>}
                  </td>
                  <td className="nota-cell" style={{ background: 'var(--teal-50)' }}>
                    <span className={`nota ${notaClass(r?.notaFinal)}`}>{formatNota(r && !r.parcial ? r.notaFinal : null)}</span>
                    {r && r.ajuste > 0 && <div style={{ fontSize: 9.5, color: 'var(--warn)', marginTop: 1 }}>−{r.ajuste.toFixed(1)}</div>}
                  </td>
                  <td className="nota-cell">
                    <button className="btn btn-ghost btn-sm" style={{ position: 'relative' }} onClick={() => setShowFeedback(est)} title={ctx.state.evalFeedback?.[ev.id]?.[est.id] ? 'Editar feedback' : 'Agregar feedback'}>
                      <I.edit size={14} />
                      {ctx.state.evalFeedback?.[ev.id]?.[est.id] && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: 3, background: 'var(--teal-500)' }} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}>
              <td className="student" style={{ background: 'var(--surface-2)' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-700)' }}>Promedio del curso</span>
              </td>
              {ev.criterios.map(cr => {
                const vals = estudiantes.map(est => {
                  const k = ctx.state.niveles[ev.id]?.[est.id]?.[cr.id];
                  if (!k) return null;
                  return Cc.nivelInfo(ev, k)?.pts ?? null;
                }).filter(v => v != null);
                const avg = vals.length ? (vals.reduce((a,b)=>a+b,0) / vals.length) : null;
                return <td key={cr.id} className="score-cell tnum" style={{ fontSize: 12, color: 'var(--ink-700)' }}>
                  {avg != null ? avg.toFixed(1) : <span className="muted">—</span>}
                </td>;
              })}
              <td className="atraso-cell tnum" style={{ fontSize: 12, color: 'var(--warn)' }}>
                {Object.values(ctx.state.atrasos[ev.id] || {}).reduce((a,b)=>a+b,0)}
              </td>
              <td className="points-cell tnum" style={{ fontSize: 12, color: 'var(--ink-700)' }}>—</td>
              <td className="nota-cell" style={{ background: 'var(--teal-50)' }}>
                {(() => {
                  const ns = estudiantes.map(est => {
                    const r = Cc.calcNotaEvaluacion(ev, ctx.state.niveles[ev.id]?.[est.id], ctx.state.atrasos[ev.id]?.[est.id]);
                    return r && !r.parcial ? r.notaFinal : null;
                  }).filter(Boolean);
                  const avg = ns.length ? ns.reduce((a,b)=>a+b,0) / ns.length : null;
                  return <span className={`nota ${notaClass(avg)}`}>{formatNota(avg)}</span>;
                })()}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showFeedback && <FeedbackModal est={showFeedback} ev={ev} onClose={() => setShowFeedback(null)} ctx={ctx} />}
    </div>
  );
}

function FeedbackModal({ est, ev, onClose, ctx }) {
  const initial = ctx.state.evalFeedback?.[ev.id]?.[est.id] || '';
  const [text, setText] = useState(initial);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="h3">Feedback para {est.nombre}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
            {ev.titulo} · Aparecerá en el informe individual del estudiante.
          </div>
          <textarea className="input" style={{ width: '100%', minHeight: 160, resize: 'vertical', fontFamily: 'inherit', padding: 12 }}
                    placeholder="Observaciones sobre el desempeño en esta evaluación…"
                    value={text} onChange={function(e) { setText(e.target.value); }} autoFocus />
          <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{text.length} caracteres</div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={function() { ctx.setEvalFeedback(ev.id, est.id, text); ctx.toast('Feedback guardado'); onClose(); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SUPERVISOR / AUTOEVALUACIÓN
// ═════════════════════════════════════════════════════════════

function SupervisorScreen({ ctx, kind = 'supervisor' }) {
  const isAuto = kind === 'autoeval';
  const respKey = isAuto ? 'autoeval' : 'supervisor';
  const commentsKey = isAuto ? 'autoevalComments' : 'supervisorComments';
  const niveles = Dd.NIVELES_SUPERVISOR;
  const [commentFor, setCommentFor] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editCol, setEditCol] = useState(null); // {ind} editar · {nuevo:true} crear

  // Columnas vivas y editables (con fallback a las de la práctica)
  const dims = ctx.state.supervisorDims || Dd.SUPERVISOR_DIMENSIONES || [];
  const maxPts = niveles[0].pts;
  const ideal = Cc.idealDeDimensiones(dims, maxPts);
  const escala = Cc.escalaExigencia60(ideal);
  const nInd = dims.reduce((a, d) => a + d.indicadores.length, 0);
  const puedeEditar = !isAuto && !!ctx.state.supervisorDims;

  return (
    <div data-screen-label={isAuto ? 'Autoevaluación' : 'Evaluación supervisor'}>
      <div className="section-head">
        <div>
          <h1>{isAuto ? 'Autoevaluación del estudiante' : 'Evaluación del Profesor Supervisor'}</h1>
          <div className="subtitle">
            {dims.length} dimensiones · {nInd} indicadores · escala S/CS/O/CN/N · máx. {ideal} pts · exigencia 60%
            {!isAuto && ' · Pondera 30%: observación + presentación salidas a terreno'}
            {isAuto && ' · Pondera 5% de la nota final'}
          </div>
        </div>
        <div className="actions">
          {puedeEditar && (
            <button className={`btn ${editMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setEditMode(m => !m)}>
              <I.edit size={15} /> {editMode ? 'Listo' : 'Editar columnas'}
            </button>
          )}
          <button className="btn btn-secondary"><I.download /> Exportar respuestas</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala:</strong>
          {niveles.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className={`lvl lvl-${n.key === 'S' ? 'E' : n.key === 'CS' ? 'L' : n.key === 'O' ? 'S' : n.key === 'CN' ? 'P' : 'D'}`}
                    style={{ background: { S: '#2F9E5E', CS: '#3FA070', O: '#E0A833', CN: '#D97840', N: '#C84142' }[n.key] }}>{n.key}</span>
              {n.label} <span className="muted">({n.pts}pt)</span>
            </span>
          ))}
        </div>
      </div>

      {editMode && puedeEditar && (
        <SupDimEditor ctx={ctx} dims={dims} onNuevaColumna={(dimId) => setEditCol({ nuevo: true, dimId })} />
      )}

      {!isAuto && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
          <div className="card" style={{ padding: '12px 16px', background: 'var(--teal-50)', border: '1px solid var(--teal-200)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <I.checkSquare size={18} style={{ color: 'var(--teal-600)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--teal-800)', marginBottom: 3 }}>Pauta de observación (dims. 1–6)</div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                Registro continuo del desempeño del/la estudiante a lo largo del semestre: responsabilidad, participación, comunicación y actitud profesional.
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '12px 16px', background: 'var(--orange-50)', border: '1px solid var(--orange-200)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <I.mapPin size={18} style={{ color: 'var(--orange-600)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--orange-800)', marginBottom: 3 }}>Presentación: Salidas a terreno (dim. 7)</div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                Exposición reflexiva sobre las salidas a terreno en la comuna y las federaciones deportivas observadas. Evalúa estructura, análisis crítico y dominio del contenido.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rubric-grid-wrap">
        <table className="rubric-grid">
          <thead>
            <tr>
              <th className="student" style={{ width: 220 }}>Estudiante</th>
              {dims.flatMap(dim =>
                dim.indicadores.map((ind, i) => (
                  <th key={ind.id} className="crit" style={{ minWidth: 170, maxWidth: 220 }}>
                    <span className="crit-num">{(dim.label.split('.')[0] || '').trim()}.{i+1}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-700)', fontWeight: 500, lineHeight: 1.3, marginTop: 2 }}>
                      {ind.texto.length > 80 ? ind.texto.slice(0, 80) + '…' : ind.texto}
                    </span>
                    {editMode && puedeEditar && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} title="Editar columna" onClick={() => setEditCol({ ind, dimId: dim.id })}><I.edit size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', color: 'var(--danger)' }} title="Eliminar columna"
                                onClick={() => { if (confirm('¿Eliminar esta columna? Se borrarán sus calificaciones.')) ctx.removeSupIndicador(ind.id); }}><I.trash size={13} /></button>
                      </div>
                    )}
                  </th>
                ))
              )}
              {editMode && puedeEditar && (
                <th className="crit" style={{ width: 96, verticalAlign: 'middle' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditCol({ nuevo: true, dimId: dims[0]?.id })}>
                    <I.plus size={13} /> Columna
                  </button>
                </th>
              )}
              <th className="crit" style={{ textAlign: 'right', width: 80 }}>
                <span className="crit-num">PUNTOS</span><span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-500)' }}>/{ideal}</span>
              </th>
              <th className="crit" style={{ textAlign: 'center', width: 90, background: 'var(--teal-50)' }}>
                <span className="crit-num" style={{ color: 'var(--teal-800)' }}>NOTA</span>
              </th>
              <th className="crit" style={{ textAlign: 'center', width: 100 }}>
                <span className="crit-num">COMENT. / INFORME</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(ctx.state.estudiantes || Dd.ESTUDIANTES).map(est => {
              const respEst = ctx.state[respKey][est.id] || {};
              const r = Cc.calcInstrumento(respEst, dims, niveles, escala);
              return (
                <tr key={est.id}>
                  <td className="student">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10.5, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                        {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5 }}>{est.nombre}</div>
                        <div className="muted" style={{ fontSize: 10.5 }}>{est.rut}</div>
                      </div>
                    </div>
                  </td>
                  {dims.flatMap(dim =>
                    dim.indicadores.map(ind => {
                      const k = respEst[ind.id];
                      return (
                        <td key={ind.id} className="score-cell">
                          <div className="seg">
                            {niveles.map(n => (
                              <button key={n.key}
                                      className={k === n.key ? `on-${n.key}` : ''}
                                      title={n.label + ' — ' + n.pts + ' pts'}
                                      onClick={() => ctx.setSupervisor(respKey, est.id, ind.id, k === n.key ? null : n.key)}>
                                {n.key}
                              </button>
                            ))}
                          </div>
                        </td>
                      );
                    })
                  )}
                  {editMode && puedeEditar && <td className="score-cell"></td>}
                  <td className="points-cell tnum">{r ? `${r.puntos}` : <span className="muted">—</span>}</td>
                  <td className="nota-cell" style={{ background: 'var(--teal-50)' }}>
                    <span className={`nota ${notaClass(r?.nota)}`}>{formatNota(r && !r.parcial ? r.nota : null)}</span>
                  </td>
                  <td className="nota-cell">
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-sm"
                              onClick={() => setCommentFor(est)}
                              title={ctx.state[commentsKey]?.[est.id] ? 'Editar comentario' : 'Agregar comentario'}
                              style={{ position: 'relative' }}>
                        <I.edit size={14} />
                        {ctx.state[commentsKey]?.[est.id] && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: 3, background: 'var(--teal-500)' }} />}
                      </button>
                      {!isAuto && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setReportFor(est)} title="Generar informe individual">
                          <I.pdf size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editCol && <SupColumnEditModal ctx={ctx} dims={dims} col={editCol} onClose={() => setEditCol(null)} />}
      {commentFor && <SupervisorCommentModal est={commentFor}
                                              isAuto={isAuto}
                                              value={ctx.state[commentsKey]?.[commentFor.id] || ''}
                                              onSave={(text) => { ctx.setSupervisorComment(commentsKey, commentFor.id, text); ctx.toast('Comentario guardado'); }}
                                              onClose={() => setCommentFor(null)} />}
      {reportFor && <StudentReportModal est={reportFor} ctx={ctx} onClose={() => setReportFor(null)} />}
    </div>
  );
}

// Panel de edición de dimensiones (nombres + agregar/eliminar dimensión + restaurar)
function SupDimEditor({ ctx, dims, onNuevaColumna }) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 14, background: 'var(--teal-50)', border: '1px solid var(--teal-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <I.edit size={15} />
        <strong style={{ fontSize: 13 }}>Editar columnas del instrumento</strong>
        <span className="muted" style={{ fontSize: 12 }}>Cada columna es un indicador. La nota se recalcula con exigencia 60% según el número de columnas.</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { if (confirm('¿Restaurar las columnas originales? Se perderán los cambios y calificaciones de columnas nuevas.')) ctx.resetSupDims(); }}>
          <I.refresh size={13} /> Restaurar original
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {dims.map(dim => (
          <div key={dim.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input className="input input-sm" style={{ flex: 1, fontWeight: 600 }} value={dim.label}
                     onChange={e => ctx.setSupDimLabel(dim.id, e.target.value)} />
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px 6px' }}
                      title="Eliminar dimensión" disabled={dims.length <= 1}
                      onClick={() => { if (confirm('¿Eliminar la dimensión y todas sus columnas?')) ctx.removeSupDimension(dim.id); }}>
                <I.trash size={13} />
              </button>
            </div>
            <div className="muted" style={{ fontSize: 11, margin: '6px 0 4px' }}>{dim.indicadores.length} columna{dim.indicadores.length === 1 ? '' : 's'}</div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => onNuevaColumna(dim.id)}>
              <I.plus size={12} /> Agregar columna
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => ctx.addSupDimension()}>
        <I.plus size={13} /> Agregar dimensión
      </button>
    </div>
  );
}

// Modal para crear/editar una columna (indicador)
function SupColumnEditModal({ ctx, dims, col, onClose }) {
  const esNuevo = !!col.nuevo;
  const ind = col.ind;
  const [texto, setTexto] = useState(esNuevo ? '' : (ind.texto || ''));
  const [dimId, setDimId] = useState(col.dimId || dims[0]?.id);

  const guardar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    if (esNuevo) {
      ctx.addSupIndicador(dimId, limpio);
    } else {
      ctx.setSupIndicadorTexto(ind.id, limpio);
      const dimOrig = dims.find(d => d.indicadores.some(x => x.id === ind.id));
      if (dimOrig && dimOrig.id !== dimId) ctx.moveSupIndicador(ind.id, dimId);
      ctx.toast('Columna actualizada');
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="h3" style={{ margin: 0 }}>{esNuevo ? 'Nueva columna (indicador)' : 'Editar columna (indicador)'}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Descripción del indicador</label>
          <textarea className="input" style={{ width: '100%', minHeight: 120, resize: 'vertical', fontFamily: 'inherit', padding: 12, fontSize: 13.5, lineHeight: 1.5 }}
                    placeholder="Describe la característica que evalúa esta columna…"
                    value={texto} onChange={e => setTexto(e.target.value)} autoFocus />
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '16px 0 6px' }}>Dimensión</label>
          <select className="input" style={{ width: '100%' }} value={dimId} onChange={e => setDimId(e.target.value)}>
            {dims.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
            La escala (S/CS/O/CN/N · 0–4 pts) es común a todas las columnas. La nota máxima se ajusta automáticamente al total de columnas.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={guardar} disabled={!texto.trim()}>{esNuevo ? 'Agregar columna' : 'Guardar cambios'}</button>
        </div>
      </div>
    </div>
  );
}

function SupervisorCommentModal({ est, isAuto, value, onSave, onClose }) {
  const [text, setText] = useState(value);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
            {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
          </div>
          <h3 className="h3" style={{ margin: 0 }}>
            Comentario {isAuto ? 'de autoevaluación' : 'del profesor supervisor'}
          </h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
            Para <strong>{est.nombre}</strong> ({est.rut}). Este comentario se incluirá en el informe individual del estudiante.
          </div>
          <textarea className="input" style={{ width: '100%', minHeight: 180, resize: 'vertical', fontFamily: 'inherit', padding: 12, fontSize: 13.5, lineHeight: 1.5 }}
                    placeholder={isAuto ? 'Reflexiones del estudiante sobre su propio desempeño…' : 'Observaciones generales sobre el desempeño del estudiante durante la práctica…'}
                    value={text} onChange={e => setText(e.target.value)}
                    autoFocus />
          <div className="muted" style={{ fontSize: 11, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>{text.length} caracteres</span>
            <span>Recomendado: 200–800 caracteres</span>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { onSave(text); onClose(); }}>Guardar comentario</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  EvalDetail, RubricaBatch, SupervisorScreen, FeedbackModal, SupervisorCommentModal,
  SupDimEditor, SupColumnEditModal,
});
