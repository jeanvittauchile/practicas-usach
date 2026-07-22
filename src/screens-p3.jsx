// screens-p3.jsx — Pantallas específicas de Práctica Profesional I
//  · SupervisorPIScreen: supervisión en terreno por área (3 variantes) +
//    evaluación del entrenador/a tutor/a (instrumento completo) + eval. semestral.
// Usa globals: I, USACH_DATA, USACH_CALC, notaClass, formatNota, fechaFmt, SupervisorCommentModal, StudentReportModal

const APREC_COLORS_PI = { L: '#2F9E5E', ML: '#4FA9D9', NL: '#E0A833', I: '#D97840', NO: '#8A94A6' };
const FREC_COLORS_PI  = { S: '#2F9E5E', CS: '#3FA070', O: '#E0A833', CN: '#D97840', N: '#C84142' };

function piInitials(nombre) { return nombre.split(' ').slice(0, 2).map(n => n[0]).join(''); }
function PiAvatar({ nombre, size = 26 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
      {piInitials(nombre)}
    </div>
  );
}
function PiField({ label, value, span = 1 }) {
  return (
    <div style={{ padding: '12px 18px', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-900)', fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}
const AREA_TAG = { deportiva: 'tag-teal', ciencias: 'tag-info', gestion: 'tag-orange' };

// ═════════════════════════════════════════════════════════════
// SUPERVISIÓN — Práctica Profesional I
// ═════════════════════════════════════════════════════════════
function SupervisorPIScreen({ ctx }) {
  const D = window.USACH_DATA;
  const meta = D.meta || {};
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  const [sel, setSel] = useState(estudiantes[0]?.id);
  const [tab, setTab] = useState('terreno');
  const [commentFor, setCommentFor] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [filterArea, setFilterArea] = useState('todas');

  if (!estudiantes.length) {
    return (
      <div data-screen-label="Supervisión profesional">
        <div className="section-head"><div><h1>Supervisión en terreno</h1><div className="subtitle">Visitas al centro por área + portafolio · pondera 25% · incluye evaluación del/la tutor/a (25%)</div></div></div>
        <div className="card" style={{ textAlign: 'center', padding: 56, color: 'var(--ink-500)' }}>
          <I.mapPin size={32} />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-700)' }}>Aún no hay estudiantes en esta práctica</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>Agrega estudiantes desde <strong>Estudiantes</strong> para comenzar.</div>
        </div>
      </div>
    );
  }

  const AREA_DEFS = meta.multiMencion ? [
    { id:'todas',     label:'Todas' },
    { id:'deportiva', label:'Entrenador' },
    { id:'ciencias',  label:'Ciencias' },
    { id:'gestion',   label:'Gestión' },
  ] : [];

  const studentsFiltered = filterArea === 'todas' ? estudiantes
    : estudiantes.filter(e => e.area === filterArea);

  const byArea = meta.multiMencion
    ? ['deportiva','ciencias','gestion'].reduce((acc, a) => {
        const lst = studentsFiltered.filter(e => e.area === a);
        if (lst.length) acc.push({ area: a, label: D.areaDef(a).label, items: lst });
        return acc;
      }, [])
    : [{ area: null, label: null, items: studentsFiltered }];

  const est = estudiantes.find(e => e.id === sel) || estudiantes[0];
  const area = D.areaDef(est.area);
  const visitas = (ctx.state.terreno && ctx.state.terreno[est.id]) || [];
  const supRes = D.notaSupervisorPI(est.id, ctx.state);
  const tutorRes = window.USACH_CALC.calcInstrumento(ctx.state.tutor?.[est.id], D.TUTOR_DIMENSIONES, D.NIVELES.NIVELES_FREC, D.ESCALAS.ESCALA_TUTOR);
  const portRes = window.USACH_CALC.calcNotaEvaluacion(D.EVALUACIONES.find(e => e.id === 'PORT'), ctx.state.niveles['PORT']?.[est.id], ctx.state.atrasos['PORT']?.[est.id]);

  return (
    <div data-screen-label="Supervisión profesional">
      <div className="section-head">
        <div>
          <h1>Supervisión en terreno</h1>
          <div className="subtitle">
            Visitas al centro por área (Deportiva · Ciencias · Gestión) + portafolio · se promedian y ponderan 25% · incluye la evaluación del/la tutor/a (25%)
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary"><I.download /> Exportar pautas</button>
        </div>
      </div>

      <div className="panel-split" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Roster lateral */}
        <div className="card" style={{ padding: 8 }}>
          {/* Filtro por área (solo PII) */}
          {meta.multiMencion && (
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', padding:'4px 6px 8px', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
              {AREA_DEFS.map(a => (
                <button key={a.id}
                        style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, cursor:'pointer', border:'1.5px solid',
                                 borderColor: filterArea===a.id ? 'var(--teal-500)' : 'var(--border)',
                                 background: filterArea===a.id ? 'var(--teal-50)' : 'transparent',
                                 color: filterArea===a.id ? 'var(--teal-700)' : 'var(--ink-500)' }}
                        onClick={() => { setFilterArea(a.id); const first = a.id==='todas' ? estudiantes[0] : estudiantes.find(e=>e.area===a.id); if (first) setSel(first.id); }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {byArea.map(group => (
            <React.Fragment key={group.area || 'all'}>
              {group.label && (
                <div style={{ fontSize:9.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em',
                              color:'var(--ink-400)', padding:'8px 10px 4px', marginTop:4 }}>
                  {group.label}
                </div>
              )}
              {group.items.map(e => {
                const r = D.notaSupervisorPI(e.id, ctx.state);
                const nVis = ((ctx.state.terreno && ctx.state.terreno[e.id]) || []).length;
                const active = e.id === sel;
                const ar = D.areaDef(e.area);
                return (
                  <button key={e.id} onClick={() => setSel(e.id)}
                          style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8,
                                   background: active ? 'var(--teal-50)' : 'transparent', border: active ? '1px solid var(--teal-200)' : '1px solid transparent', cursor:'pointer', marginBottom:2 }}>
                    <PiAvatar nombre={e.nombre} size={32} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight: active ? 700 : 500, color:'var(--ink-900)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.nombre}</div>
                      <div className="muted" style={{ fontSize:10.5, display:'flex', alignItems:'center', gap:5 }}>
                        <span className={`tag ${AREA_TAG[e.area]}`} style={{ fontSize:9, padding:'0 5px' }}>{ar.label.split('(')[0].trim()}</span>
                        {nVis} visita{nVis===1?'':'s'}
                      </div>
                    </div>
                    <span className={`nota ${notaClass(r?.nota)}`} style={{ fontSize:13 }}>{formatNota(r&&!r.parcial?r.nota:null)}</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
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
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.85, fontWeight: 600 }}>Supervisión (25%)</div>
                <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }} className="tnum">{formatNota(supRes && !supRes.parcial ? supRes.nota : null)}</div>
                {supRes && supRes.parcial && <div style={{ fontSize: 11, opacity: 0.85 }}>parcial</div>}
              </div>
            </div>
            <div className="centro-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: 'var(--surface-1)' }}>
              <PiField label="Centro de práctica" value={est.centro} span={2} />
              <PiField label="Comuna" value={est.comuna} />
              <PiField label="Área de práctica" value={area.label} />
              <PiField label="Disciplina / función" value={`${est.deporte} · ${est.categoria}`} span={2} />
              <PiField label="Entrenador/a tutor/a" value={est.tutorCentro} />
              <PiField label="Días / horario" value={est.dias} />
              <PiField label="Visitas / Portafolio" value={`${visitas.length} · ${portRes && !portRes.parcial ? formatNota(portRes.notaFinal) : '—'}`} />
              <PiField label="Nota tutor (25%)" value={tutorRes && !tutorRes.parcial ? formatNota(tutorRes.nota) : 'Pendiente'} />
            </div>
          </div>

          {(!portRes || portRes.parcial) && (
            <div style={{ padding: '14px 18px', background: 'linear-gradient(105deg, var(--teal-50), var(--orange-50))', border: '1px solid var(--teal-200)', borderRadius: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <I.mapPin size={22} style={{ color: 'var(--teal-600)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--teal-800)', marginBottom: 4 }}>Falta calificar el Portafolio evaluación.</div>
                <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  La nota de "Superv.+Port" (25%) promedia las visitas en terreno con la evaluación del Portafolio. Esta última no se llena aquí, sino en
                  <strong> Evaluaciones → Portafolio Virtual y Bitácora</strong>.
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={() => ctx.openEval && ctx.openEval('PORT')}>
                  <I.checkSquare size={14} /> Ir a Evaluaciones → Portafolio
                </button>
              </div>
            </div>
          )}

          <div className="tabs">
            <button className={tab === 'terreno' ? 'active' : ''} onClick={() => setTab('terreno')}>Visitas en terreno ({visitas.length})</button>
            <button className={tab === 'tutor' ? 'active' : ''} onClick={() => setTab('tutor')}>Eval. Entrenador/a Tutor/a</button>
            <button className={tab === 'semestral' ? 'active' : ''} onClick={() => setTab('semestral')}>Eval. semestral</button>
          </div>

          {tab === 'terreno' && <TerrenoTabPI est={est} ctx={ctx} onComment={() => setCommentFor(est)} onReport={() => setReportFor(est)} />}
          {tab === 'tutor' && <InstrumentoTabPI est={est} ctx={ctx} respKey="tutor" cfg={D.TUTOR} colors={FREC_COLORS_PI}
                                                titulo="Pauta del entrenador/a tutor/a del centro" pondera="25%" />}
          {tab === 'semestral' && <InstrumentoTabPI est={est} ctx={ctx} respKey="semestral" cfg={D.SEMESTRAL} colors={APREC_COLORS_PI}
                                                    titulo="Evaluación semestral del/la supervisor/a" pondera="incl. en Superv. 25%" />}
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

// ─── Pestaña: Visitas en terreno (área-aware) ─────────────────
function TerrenoTabPI({ est, ctx, onComment, onReport }) {
  const D = window.USACH_DATA;
  const area = D.areaDef(est.area);
  const modos = D.modosDeArea(est.area);
  const visitas = (ctx.state.terreno && ctx.state.terreno[est.id]) || [];
  const [openId, setOpenId] = useState(visitas[0]?.id || null);

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala:</strong>
          {D.NIVELES.NIVELES_APREC.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className="lvl" style={{ background: APREC_COLORS_PI[n.key] }}>{n.key}</span>
              {n.label} <span className="muted">({n.pts}pt)</span>
            </span>
          ))}
        </div>
        <div className="right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={onComment}><I.edit size={13} /> Comentario</button>
          <button className="btn btn-secondary btn-sm" onClick={onReport}><I.pdf size={13} /> Informe</button>
          {modos.map(m => (
            <button key={m.id} className="btn btn-secondary btn-sm" onClick={() => ctx.addVisita(est.id, m.id)}>
              <I.plus /> {m.id === 'obs' ? 'Observación' : m.id === 'unico' ? 'Nueva visita' : 'Participación'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--ink-500)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <I.mapPin size={14} /> Área <strong style={{ color: 'var(--ink-800)' }}>{area.label}</strong> · {area.desc}
      </div>

      {visitas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 36, color: 'var(--ink-500)' }}>
          <I.mapPin size={28} />
          <div style={{ marginTop: 8, fontSize: 14 }}>Aún no hay visitas registradas para {est.nombre.split(' ')[0]}.</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Agrega una visita según la modalidad de la sesión supervisada.</div>
        </div>
      )}

      {visitas.map((v, i) => (
        <VisitaCardPI key={v.id} v={v} idx={i} est={est} ctx={ctx} open={openId === v.id} onToggle={() => setOpenId(openId === v.id ? null : v.id)} />
      ))}
    </div>
  );
}

function VisitaCardPI({ v, idx, est, ctx, open, onToggle }) {
  const D = window.USACH_DATA;
  const area = est.area;
  const modos = D.modosDeArea(area);
  const md = D.modoDef(area, v.modo);
  const crit = D.terrenoCriterios(area, v.modo);
  const r = D.notaTerrenoVisita(area, v);
  const niveles = D.NIVELES.NIVELES_APREC;

  return (
    <div className={`detail-section ${open ? 'open' : ''}`}>
      <button className="head" onClick={onToggle} style={{ gap: 12 }}>
        <div className="icon-dot" style={{ background: md.id === 'obs' ? 'var(--orange-50)' : 'var(--teal-100)', color: md.id === 'obs' ? 'var(--orange-700)' : 'var(--teal-700)' }}>
          <span style={{ fontWeight: 700 }}>{md.sigla}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div className="title">Visita {idx + 1} · {md.label}</div>
          <div className="muted" style={{ fontSize: 12 }}>{fechaFmt(v.fecha)} · ideal {md.ideal} pts</div>
        </div>
        <span className={`nota ${notaClass(r.nota)}`} style={{ marginRight: 10 }}>{formatNota(r.nota)}</span>
        {r.puntos != null && <span className="muted tnum" style={{ marginRight: 10, fontSize: 12.5 }}>{r.puntos}/{md.ideal} pts</span>}
        <I.chev className="chev" size={16} />
      </button>
      {open && (
        <div className="body">
          <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</span>
              <input type="date" className="input input-sm" value={v.fecha} onChange={e => ctx.setVisitaCampo(est.id, v.id, 'fecha', e.target.value)} />
            </label>
            {modos.length > 1 && (
              <label style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modalidad</span>
                <select className="input input-sm" value={v.modo} onChange={e => ctx.setVisitaCampo(est.id, v.id, 'modo', e.target.value)}>
                  {modos.map(m => <option key={m.id} value={m.id}>{m.label} (ideal {m.ideal})</option>)}
                </select>
              </label>
            )}
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => ctx.removeVisita(est.id, v.id)}>
              <I.trash size={14} /> Eliminar visita
            </button>
          </div>

          <table className="tbl" style={{ width: '100%' }}>
            <tbody>
              {crit.map((c, ci) => {
                const k = v.resp[c.id];
                const esFormal = c.id.startsWith('f');
                return (
                  <tr key={c.id}>
                    <td style={{ width: '54%' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span className="tnum" style={{ fontWeight: 700, color: 'var(--ink-400)' }}>{ci + 1}.</span>
                        <span style={{ fontSize: 12.5 }}>
                          {c.texto}
                          {c.doble && <span className="tag tag-orange" style={{ marginLeft: 6 }}>×2</span>}
                          {esFormal && <span className="tag tag-teal" style={{ marginLeft: 6 }}>Formal</span>}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="seg">
                        {niveles.map(n => (
                          <button key={n.key} className={k === n.key ? `on-${n.key}` : ''}
                                  title={n.label + ' — ' + n.pts + ' pts'}
                                  onClick={() => ctx.setVisitaNivel(est.id, v.id, c.id, k === n.key ? null : n.key)}>
                            {n.key}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 12, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Puntaje: <strong className="tnum" style={{ color: 'var(--ink-800)' }}>{r.puntos ?? '—'}/{md.ideal}</strong></span>
            <span style={{ fontSize: 12.5 }}>Nota visita: <span className={`nota ${notaClass(r.nota)}`}>{formatNota(r.nota)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pestaña: instrumento por dimensiones (tutor / semestral) ─
function InstrumentoTabPI({ est, ctx, respKey, cfg, colors, titulo, pondera, referencial }) {
  const D = window.USACH_DATA;
  const niveles = D.NIVELES[cfg.nivelesKey];
  const escala = D.ESCALAS[cfg.escalaKey];
  const resp = (ctx.state[respKey] && ctx.state[respKey][est.id]) || {};
  const r = window.USACH_CALC.calcInstrumento(resp, cfg.dimensiones, niveles, escala);
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala:</strong>
          {niveles.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className="lvl" style={{ background: colors[n.key] }}>{n.key}</span>
              {n.label}
            </span>
          ))}
        </div>
        <div className="right">
          <span className="muted" style={{ fontSize: 12.5 }}>Ideal {cfg.maxPuntos} pts · exigencia 60% · {pondera}</span>
        </div>
      </div>

      {referencial && (
        <div style={{ padding: '8px 12px', background: 'var(--info-bg)', borderLeft: '3px solid var(--info)', borderRadius: 4, fontSize: 12, color: 'var(--info)' }}>
          Instrumento de referencia: registra la evaluación semestral del/la supervisor/a. No se incluye en la nota final por defecto.
        </div>
      )}

      <div className="card" style={{ padding: '14px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 className="h3" style={{ marginTop: 0, fontSize: 14.5 }}>{titulo}</h3>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
              {est.nombre} · {est.centro}{respKey === 'tutor' ? ` · Tutor/a: ${est.tutorCentro || '—'}` : ''}
            </div>
          </div>
          {respKey === 'tutor' && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReport(true)}>
                <I.pdf size={14} /> Informe PDF
              </button>
              <button className="btn btn-secondary btn-sm"
                      onClick={() => window.descargarPautaInstrumento({ cfg, niveles, est, titulo: 'Pauta de Evaluación del Entrenador/a Tutor/a' })}>
                <I.download size={14} /> Descargar pauta
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl" style={{ width: '100%' }}>
          <tbody>
            {cfg.dimensiones.map(dim => (
              <React.Fragment key={dim.id}>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <td colSpan={2} style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--ink-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dim.label}</td>
                </tr>
                {dim.indicadores.map(ind => {
                  const k = resp[ind.id];
                  return (
                    <tr key={ind.id}>
                      <td style={{ width: '60%', fontSize: 12.5 }}>
                        {ind.texto}{ind.doble && <span className="tag tag-orange" style={{ marginLeft: 6 }}>×2</span>}
                      </td>
                      <td>
                        <div className="seg">
                          {niveles.map(n => (
                            <button key={n.key} className={k === n.key ? `on-${n.key}` : ''}
                                    title={n.label + ' — ' + n.pts + ' pts'}
                                    onClick={() => ctx.setSupervisor(respKey, est.id, ind.id, k === n.key ? null : n.key)}>
                              {n.key}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--teal-50)', fontWeight: 700 }}>
              <td style={{ fontSize: 12.5, color: 'var(--ink-700)' }}>
                Puntaje total: <span className="tnum">{r ? r.puntos : 0}</span>/{cfg.maxPuntos} {r && r.parcial && <span className="muted" style={{ fontWeight: 400 }}>· faltan indicadores</span>}
              </td>
              <td style={{ textAlign: 'center' }}>
                Nota: <span className={`nota ${notaClass(r?.nota)}`}>{formatNota(r && !r.parcial ? r.nota : null)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showReport && <InstrumentoReportModal est={est} ctx={ctx} respKey={respKey} cfg={cfg} niveles={niveles}
                                              titulo={titulo} pondera={pondera} resp={resp} r={r}
                                              onClose={() => setShowReport(false)} />}
    </div>
  );
}

// ─── Informe PDF de una evaluación por instrumento ya realizada (tutor / semestral) ───
function InstrumentoReportModal({ est, ctx, respKey, cfg, niveles, titulo, pondera, resp, r, onClose }) {
  const D = window.USACH_DATA;
  const meta = D.meta || {};
  const prof = window.readProfProfile ? window.readProfProfile() : {};
  const bodyRef = React.useRef(null);
  const reportTitle = titulo + ' — ' + est.nombre;
  const totalIndicadores = cfg.dimensiones.reduce((a, d) => a + d.indicadores.length, 0);
  const respondidos = cfg.dimensiones.reduce((a, d) => a + d.indicadores.filter(ind => resp[ind.id]).length, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 900, maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.pdf />
          <h3 className="h3" style={{ margin: 0 }}>{reportTitle}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body" ref={bodyRef}>
          <div className="pdf-page" style={{ padding: '48px 56px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-500)', fontWeight: 700 }}>Universidad de Santiago de Chile</div>
                <div style={{ fontSize: 13, color: 'var(--ink-600)', marginTop: 2 }}>{meta.escuela || 'Facultad de Ciencias Médicas · Entrenador Deportivo'}</div>
              </div>
              <USACHCrest size={48} />
            </div>

            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--teal-700)', fontWeight: 700 }}>
              {meta.cursoTitulo || meta.nombre || 'Práctica'}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', margin: '8px 0 4px', letterSpacing: '-0.01em' }}>{titulo}</h1>
            <div style={{ fontSize: 13.5, color: 'var(--ink-600)' }}>{est.nombre} · {est.rut}</div>
            <div style={{ height: 3, width: 70, background: 'var(--teal-500)', marginTop: 14, marginBottom: 24 }} />

            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 20 }}>
              <tbody>
                <CoverRow k="Estudiante" v={est.nombre} />
                <CoverRow k="Centro de práctica" v={est.centro || '—'} />
                {respKey === 'tutor' && <CoverRow k="Entrenador/a tutor/a" v={est.tutorCentro || '—'} />}
                <CoverRow k="Ponderación" v={pondera} />
                <CoverRow k="Fecha del informe" v={new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })} />
              </tbody>
            </table>

            <SectionPdf title={titulo} accent="teal">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-1)' }}>
                    <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left' }}>Indicador</th>
                    <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', width: 110 }}>Resultado</th>
                    <th style={{ padding: '6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'right', width: 60 }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.dimensiones.map(dim => (
                    <React.Fragment key={dim.id}>
                      <tr><td colSpan={3} style={{ padding: '8px 0 4px', fontWeight: 700, color: 'var(--teal-700)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dim.label}</td></tr>
                      {dim.indicadores.map(ind => {
                        const k = resp[ind.id];
                        const ni = niveles.find(n => n.key === k);
                        const pts = ni ? ni.pts * (ind.doble ? 2 : 1) : null;
                        return (
                          <tr key={ind.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                            <td style={{ padding: '5px 0' }}>{ind.texto}{ind.doble && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--orange-700)' }}>×2</span>}</td>
                            <td style={{ padding: '5px 0', textAlign: 'center' }}>{ni ? ni.label : <span className="muted">Sin registrar</span>}</td>
                            <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }} className="tnum">{pts ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, padding: 12, background: 'var(--surface-1)', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Puntaje obtenido</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }} className="tnum">{r ? r.puntos : 0} / {cfg.maxPuntos}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{respondidos}/{totalIndicadores} indicadores respondidos</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Nota</div>
                  <div className={`nota nota-lg ${notaClass(r?.nota)}`}>{formatNota(r && !r.parcial ? r.nota : null)}</div>
                  {r && r.parcial && <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>Evaluación incompleta</div>}
                </div>
              </div>
            </SectionPdf>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 40, fontSize: 10.5, color: 'var(--ink-600)' }}>
              <div style={{ borderTop: '1px solid var(--ink-700)', paddingTop: 6, textAlign: 'center' }}>
                {respKey === 'tutor' ? 'Firma entrenador/a tutor/a' : 'Firma supervisor/a'}
              </div>
              <div style={{ borderTop: '1px solid var(--ink-700)', paddingTop: 6, textAlign: 'center' }}>
                Firma {prof.nombre ? prof.nombre : 'profesor/a supervisor/a'}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, reportTitle, false); }}><I.print /> Imprimir</button>
          <button className="btn btn-primary" onClick={function() { if (bodyRef.current) window.openPrintWindow(bodyRef.current, reportTitle, true); }}><I.download /> Descargar PDF</button>
        </div>
      </div>
    </div>
  );
}

// ─── Generador de pauta imprimible y autocalculable (descarga HTML) ───
function descargarPautaInstrumento({ cfg, niveles, est, titulo }) {
  const meta = (window.USACH_DATA && window.USACH_DATA.meta) || {};
  const ideal = cfg.maxPuntos;
  const dims = cfg.dimensiones;
  const esc = JSON.stringify((function () { const o = {}; const corte = 0.6 * ideal; for (let p = 0; p <= ideal; p++) { const nota = p <= corte ? 1 + (p / corte) * 3 : 4 + ((p - corte) / (ideal - corte)) * 3; o[p] = Math.round(nota * 10) / 10; } return o; })());
  const nivJson = JSON.stringify(niveles.map(n => ({ key: n.key, label: n.label, pts: n.pts })));
  const esc2 = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let rows = '';
  dims.forEach((dim, di) => {
    rows += `<tr class="dim"><td colspan="${niveles.length + 2}">${esc2(dim.label)}</td></tr>`;
    dim.indicadores.forEach((ind, ii) => {
      const num = (dim.label.split('.')[0] || (di + 1)).trim() + '.' + (ii + 1);
      let cells = '';
      niveles.forEach(n => { cells += `<td class="opt"><input type="radio" name="${ind.id}" value="${n.pts}" onchange="recalc()"></td>`; });
      rows += `<tr><td class="num">${num}</td><td class="txt">${esc2(ind.texto)}</td>${cells}</tr>`;
    });
  });
  const legend = niveles.map(n => `<span><b>${n.key}</b> ${esc2(n.label)} (${n.pts})</span>`).join('');
  const ths = niveles.map(n => `<th class="opt">${n.key}</th>`).join('');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc2(titulo)}</title>
<style>
  :root{--teal:#0e7c6b;--ink:#1c2630;--mut:#5b6675;--bd:#d7dde4;--bg:#eef2f5;}
  *{box-sizing:border-box;} body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--ink);margin:0;background:var(--bg);padding:28px;}
  .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid var(--bd);border-radius:10px;overflow:hidden;}
  .head{background:linear-gradient(105deg,#0e7c6b,#13a08a);color:#fff;padding:22px 26px;}
  .head .sub{font-size:12px;opacity:.9;text-transform:uppercase;letter-spacing:.08em;font-weight:600;}
  .head h1{margin:6px 0 2px;font-size:20px;} .head .esc{font-size:12.5px;opacity:.92;}
  .body{padding:22px 26px;}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;margin-bottom:16px;}
  .meta label{font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:.05em;font-weight:700;display:block;margin-bottom:3px;}
  .meta input{width:100%;border:none;border-bottom:1.5px solid var(--bd);padding:5px 2px;font-size:13.5px;font-family:inherit;}
  .meta input:focus{outline:none;border-color:var(--teal);}
  .instr{font-size:12px;color:var(--mut);line-height:1.55;background:#f6f9f9;border-left:3px solid var(--teal);border-radius:4px;padding:10px 12px;margin-bottom:14px;}
  .legend{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--mut);margin-bottom:12px;} .legend b{color:var(--ink);}
  table{width:100%;border-collapse:collapse;font-size:12.5px;}
  th,td{border:1px solid var(--bd);padding:7px 9px;text-align:left;vertical-align:middle;}
  thead th{background:#f0f4f6;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--mut);}
  th.opt,td.opt{width:42px;text-align:center;} td.num{width:38px;font-weight:700;color:var(--mut);text-align:center;}
  tr.dim td{background:#eaf2f0;font-weight:700;text-transform:uppercase;letter-spacing:.03em;font-size:11.5px;color:#0e7c6b;}
  td.opt input{width:17px;height:17px;accent-color:var(--teal);cursor:pointer;}
  .result{display:flex;gap:18px;align-items:center;justify-content:flex-end;margin-top:16px;padding:14px 16px;background:#eaf2f0;border-radius:8px;}
  .result .pun{font-size:13px;color:var(--mut);} .result .pun b{color:var(--ink);font-size:15px;}
  .result .nota{font-size:13px;color:var(--mut);} .result .nota b{font-size:24px;color:#0e7c6b;margin-left:6px;}
  .result .nota b.rojo{color:#c0392b;}
  .foot{font-size:11px;color:var(--mut);margin-top:10px;line-height:1.5;}
  .actions{max-width:900px;margin:0 auto 14px;display:flex;gap:10px;justify-content:flex-end;}
  .btn{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--bd);background:#fff;color:var(--ink);border-radius:7px;padding:9px 14px;cursor:pointer;}
  .btn.p{background:var(--teal);color:#fff;border-color:var(--teal);}
  @media print{body{background:#fff;padding:0;} .actions{display:none;} .sheet{border:none;} .head{-webkit-print-color-adjust:exact;print-color-adjust:exact;} tr.dim td,thead th,.result{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>
<div class="actions"><button class="btn" onclick="window.print()">Imprimir / Guardar PDF</button></div>
<div class="sheet">
  <div class="head"><div class="sub">${esc2(meta.escuela || 'Facultad de Ciencias Médicas · Entrenador Deportivo')}</div><h1>${esc2(titulo)}</h1><div class="esc">${esc2(meta.cursoTitulo || meta.nombre || 'Práctica')}</div></div>
  <div class="body">
    <div class="meta">
      <div><label>Nombre del/de la estudiante</label><input value="${esc2(est && est.nombre || '')}"></div>
      <div><label>Fecha</label><input type="date"></div>
      <div><label>Centro de práctica</label><input value="${esc2(est && est.centro || '')}"></div>
      <div><label>Nombre del/de la entrenador/a tutor/a</label><input value="${esc2(est && est.tutorCentro || '')}"></div>
    </div>
    <div class="instr">Marque para cada indicador la alternativa que mejor identifique el desempeño del/la estudiante. Escala de 1,0 a 7,0 con 60% de exigencia (nota mínima de aprobación 4,0). El puntaje y la nota se calculan automáticamente al completar todos los indicadores.</div>
    <div class="legend">${legend}</div>
    <table>
      <thead><tr><th>N°</th><th>Indicador</th>${ths}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="result"><div class="pun">Puntaje: <b><span id="pun">0</span>/${ideal}</b></div><div class="nota">Nota: <b id="nota">—</b></div></div>
    <div class="foot">Total de indicadores: <span id="tot">0</span>/${dims.reduce((a, d) => a + d.indicadores.length, 0)} respondidos. Una vez completada la pauta, ingrese las marcas en la aplicación para registrar la nota en el proceso de práctica.</div>
    <div class="foot" style="margin-top:14px;"><b>Comentarios:</b><br><br>__________________________________________________________________________________<br><br>__________________________________________________________________________________</div>
  </div>
</div>
<script>
  var ESC=${esc}, NIV=${nivJson}, TOTAL=${dims.reduce((a, d) => a + d.indicadores.length, 0)};
  function recalc(){
    var inputs=document.querySelectorAll('input[type=radio]:checked');
    var pun=0; inputs.forEach(function(i){pun+=parseInt(i.value,10);});
    document.getElementById('pun').textContent=pun;
    document.getElementById('tot').textContent=inputs.length;
    var nEl=document.getElementById('nota');
    if(inputs.length<TOTAL){ nEl.textContent='—'; nEl.className=''; return; }
    var nota=ESC[pun]; nEl.textContent=(nota!=null?nota.toFixed(1):'—'); nEl.className=(nota!=null&&nota<4)?'rojo':'';
  }
</script></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = (est && est.nombre ? est.nombre.replace(/\s+/g, '_') + '_' : '') + 'Pauta_Tutor_' + (meta.codigo || 'III') + '.html';
  a.href = url; a.download = slug; document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
}

Object.assign(window, { SupervisorPIScreen, TerrenoTabPI, VisitaCardPI, InstrumentoTabPI, InstrumentoReportModal, PiAvatar, PiField, APREC_COLORS_PI, FREC_COLORS_PI, AREA_TAG, descargarPautaInstrumento });
