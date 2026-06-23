// screens-p2.jsx — Pantallas específicas de Práctica II
//  · SupervisorP2Screen: supervisión en terreno (2 modos) + evaluación de proceso + nota tutor
//  · InstrumentoScreen: instrumento de escala de apreciación genérico (autoevaluación)
// Usa globals: I, USACH_DATA, USACH_CALC, notaClass, formatNota, fechaFmt

const Dp = window.USACH_DATA;
const Cp = window.USACH_CALC;

const APREC_COLORS = { L: '#2F9E5E', ML: '#4FA9D9', NL: '#E0A833', I: '#D97840', NO: '#8A94A6' };
const AUTO_COLORS  = { S: '#2F9E5E', CS: '#3FA070', O: '#E0A833', CN: '#D97840', N: '#C84142' };

function initials(nombre) { return nombre.split(' ').slice(0, 2).map(n => n[0]).join(''); }
function Avatar({ nombre, size = 26 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
      {initials(nombre)}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SUPERVISIÓN P2 — terreno + proceso + tutor
// ═════════════════════════════════════════════════════════════
function SupervisorP2Screen({ ctx }) {
  const D = window.USACH_DATA;
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  const [sel, setSel] = useState(estudiantes[0]?.id);
  const [tab, setTab] = useState('terreno');
  const [commentFor, setCommentFor] = useState(null);
  const [reportFor, setReportFor] = useState(null);

  if (!estudiantes.length) {
    return (
      <div data-screen-label="Supervisión en terreno">
        <div className="section-head"><div><h1>Supervisión en terreno</h1><div className="subtitle">Visitas al centro + evaluación de proceso · pondera 15% de la nota final</div></div></div>
        <div className="card" style={{ textAlign: 'center', padding: 56, color: 'var(--ink-500)' }}>
          <I.mapPin size={32} />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-700)' }}>Aún no hay estudiantes en esta práctica</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>Agrega estudiantes desde <strong>Estudiantes</strong> para comenzar.</div>
        </div>
      </div>
    );
  }

  const est = estudiantes.find(e => e.id === sel) || estudiantes[0];
  const visitas = (ctx.state.terreno && ctx.state.terreno[est.id]) || [];
  const supRes = D.notaSupervisorP2(est.id, ctx.state);
  const procNota = D.notaProceso(ctx.state.proceso && ctx.state.proceso[est.id]);

  return (
    <div data-screen-label="Supervisión en terreno">
      <div className="section-head">
        <div>
          <h1>Supervisión en terreno</h1>
          <div className="subtitle">
            Visitas al centro de práctica (2 modos) + evaluación de proceso · se promedian y ponderan 15% de la nota final
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary"><I.download /> Exportar pautas</button>
        </div>
      </div>

      <div className="panel-split" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Roster lateral */}
        <div className="card" style={{ padding: 8 }}>
          {estudiantes.map(e => {
            const r = D.notaSupervisorP2(e.id, ctx.state);
            const nVis = ((ctx.state.terreno && ctx.state.terreno[e.id]) || []).length;
            const active = e.id === sel;
            return (
              <button key={e.id} onClick={() => setSel(e.id)}
                      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8,
                               background: active ? 'var(--teal-50)' : 'transparent', border: active ? '1px solid var(--teal-200)' : '1px solid transparent', cursor: 'pointer', marginBottom: 2 }}>
                <Avatar nombre={e.nombre} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nombre}</div>
                  <div className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.centro}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`nota ${notaClass(r?.nota)}`} style={{ fontSize: 13 }}>{formatNota(r && !r.parcial ? r.nota : null)}</span>
                  <div className="muted" style={{ fontSize: 10 }}>{nVis} visita{nVis === 1 ? '' : 's'}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panel del estudiante */}
        <div className="col" style={{ gap: 16 }}>
          {/* Ficha del centro */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', background: 'linear-gradient(105deg, var(--teal-700), var(--teal-500))', color: '#fff', display: 'flex', gap: 16, alignItems: 'center' }}>
              <Avatar nombre={est.nombre} size={52} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: '#fff' }}>{est.nombre}</h2>
                <div style={{ fontSize: 12.5, opacity: 0.92 }}>{est.rut} · {est.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.85, fontWeight: 600 }}>Nota supervisión (15%)</div>
                <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }} className="tnum">{formatNota(supRes && !supRes.parcial ? supRes.nota : null)}</div>
                {supRes && supRes.parcial && <div style={{ fontSize: 11, opacity: 0.85 }}>parcial</div>}
              </div>
            </div>
            <div className="centro-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: 'var(--surface-1)' }}>
              <CentroField label="Centro de práctica" value={est.centro} />
              <CentroField label="Comuna" value={est.comuna} />
              <CentroField label="Deporte · categoría" value={`${est.deporte} · ${est.categoria}`} />
              <CentroField label="Entrenador/a tutor/a" value={est.tutorCentro} />
              <CentroField label="Días / horario" value={est.dias} span={2} />
              <CentroField label="Visitas registradas" value={`${visitas.length}`} />
              <CentroField label="Eval. de proceso" value={procNota != null ? formatNota(procNota) : 'Pendiente'} />
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={tab === 'terreno' ? 'active' : ''} onClick={() => setTab('terreno')}>Visitas en terreno ({visitas.length})</button>
            <button className={tab === 'proceso' ? 'active' : ''} onClick={() => setTab('proceso')}>Evaluación de proceso</button>
            <button className={tab === 'tutor' ? 'active' : ''} onClick={() => setTab('tutor')}>Nota del tutor (centro)</button>
          </div>

          {tab === 'terreno' && <TerrenoTab est={est} ctx={ctx} />}
          {tab === 'proceso' && <ProcesoTab est={est} ctx={ctx} onComment={() => setCommentFor(est)} onReport={() => setReportFor(est)} />}
          {tab === 'tutor' && <TutorTab est={est} ctx={ctx} />}
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

function CentroField({ label, value, span = 1 }) {
  return (
    <div style={{ padding: '12px 18px', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-900)', fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ─── Pestaña: Visitas en terreno ──────────────────────────────
function TerrenoTab({ est, ctx }) {
  const D = window.USACH_DATA;
  const visitas = (ctx.state.terreno && ctx.state.terreno[est.id]) || [];
  const [openId, setOpenId] = useState(visitas[0]?.id || null);

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala:</strong>
          {D.NIVELES.NIVELES_APREC.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className="lvl" style={{ background: APREC_COLORS[n.key] }}>{n.key}</span>
              {n.label} <span className="muted">({n.pts}pt)</span>
            </span>
          ))}
        </div>
        <div className="right" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => ctx.addVisita(est.id, 'part')}><I.plus /> Visita con participación</button>
          <button className="btn btn-secondary btn-sm" onClick={() => ctx.addVisita(est.id, 'obs')}><I.plus /> Visita con observación</button>
        </div>
      </div>

      {visitas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 36, color: 'var(--ink-500)' }}>
          <I.mapPin size={28} />
          <div style={{ marginTop: 8, fontSize: 14 }}>Aún no hay visitas registradas para {est.nombre.split(' ')[0]}.</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Agrega una visita según la modalidad de la sesión observada.</div>
        </div>
      )}

      {visitas.map((v, i) => (
        <VisitaCard key={v.id} v={v} idx={i} est={est} ctx={ctx} open={openId === v.id} onToggle={() => setOpenId(openId === v.id ? null : v.id)} />
      ))}
    </div>
  );
}

function VisitaCard({ v, idx, est, ctx, open, onToggle }) {
  const D = window.USACH_DATA;
  const modo = D.MODOS_TERRENO[v.modo];
  const crit = D.terrenoCriterios(v.modo);
  const r = D.notaTerrenoVisita(v);
  const niveles = D.NIVELES.NIVELES_APREC;

  return (
    <div className={`detail-section ${open ? 'open' : ''}`}>
      <button className="head" onClick={onToggle} style={{ gap: 12 }}>
        <div className="icon-dot" style={{ background: modo.id === 'part' ? 'var(--teal-100)' : 'var(--orange-50)', color: modo.id === 'part' ? 'var(--teal-700)' : 'var(--orange-700)' }}>
          <span style={{ fontWeight: 700 }}>{modo.sigla}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div className="title">Visita {idx + 1} · {modo.label}</div>
          <div className="muted" style={{ fontSize: 12 }}>{fechaFmt(v.fecha)} · ideal {modo.maxPuntos} pts</div>
        </div>
        <span className={`nota ${notaClass(r.nota)}`} style={{ marginRight: 10 }}>{formatNota(r.nota)}</span>
        {r.puntos != null && <span className="muted tnum" style={{ marginRight: 10, fontSize: 12.5 }}>{r.puntos}/{modo.maxPuntos} pts</span>}
        <I.chev className="chev" size={16} />
      </button>
      {open && (
        <div className="body">
          <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</span>
              <input type="date" className="input input-sm" value={v.fecha} onChange={e => ctx.setVisitaCampo(est.id, v.id, 'fecha', e.target.value)} />
            </label>
            <label style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modalidad</span>
              <select className="input input-sm" value={v.modo} onChange={e => ctx.setVisitaCampo(est.id, v.id, 'modo', e.target.value)}>
                <option value="part">Con participación (ideal 32)</option>
                <option value="obs">Con observación (ideal 24)</option>
              </select>
            </label>
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
                    <td style={{ width: '52%' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span className="tnum" style={{ fontWeight: 700, color: 'var(--ink-400)' }}>{ci + 1}.</span>
                        <span style={{ fontSize: 12.5 }}>
                          {c.texto}
                          {c.doble && <span className="tag tag-orange" style={{ marginLeft: 6 }}>×2</span>}
                          {ci === 0 && <span className="tag tag-teal" style={{ marginLeft: 6 }}>Formal</span>}
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
            <span className="muted" style={{ fontSize: 12.5 }}>Puntaje: <strong className="tnum" style={{ color: 'var(--ink-800)' }}>{r.puntos ?? '—'}/{modo.maxPuntos}</strong></span>
            <span style={{ fontSize: 12.5 }}>Nota visita: <span className={`nota ${notaClass(r.nota)}`}>{formatNota(r.nota)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pestaña: Evaluación de proceso ───────────────────────────
function ProcesoTab({ est, ctx, onComment, onReport }) {
  const D = window.USACH_DATA;
  const resp = (ctx.state.proceso && ctx.state.proceso[est.id]) || {};
  const niveles = D.NIVELES.NIVELES_APREC;
  const r = Cp.calcInstrumento(resp, D.PROCESO_DIMENSIONES, niveles, D.ESCALAS.ESCALA_PROCESO);

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala:</strong>
          {niveles.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className="lvl" style={{ background: APREC_COLORS[n.key] }}>{n.key}</span>
              {n.label}
            </span>
          ))}
        </div>
        <div className="right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="muted" style={{ fontSize: 12.5 }}>Ideal 40 pts · exigencia 60%</span>
          <button className="btn btn-secondary btn-sm" onClick={onComment}><I.edit size={13} /> Comentario</button>
          <button className="btn btn-secondary btn-sm" onClick={onReport}><I.pdf size={13} /> Informe</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl" style={{ width: '100%' }}>
          <tbody>
            {D.PROCESO_DIMENSIONES.map(dim => (
              <React.Fragment key={dim.id}>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <td colSpan={2} style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--ink-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dim.label}</td>
                </tr>
                {dim.indicadores.map(ind => {
                  const k = resp[ind.id];
                  return (
                    <tr key={ind.id}>
                      <td style={{ width: '60%', fontSize: 12.5 }}>{ind.texto}</td>
                      <td>
                        <div className="seg">
                          {niveles.map(n => (
                            <button key={n.key} className={k === n.key ? `on-${n.key}` : ''}
                                    title={n.label + ' — ' + n.pts + ' pts'}
                                    onClick={() => ctx.setProcesoNivel(est.id, ind.id, k === n.key ? null : n.key)}>
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
                Puntaje total: <span className="tnum">{r ? r.puntos : 0}</span>/40 {r && r.parcial && <span className="muted" style={{ fontWeight: 400 }}>· faltan indicadores</span>}
              </td>
              <td style={{ textAlign: 'center' }}>
                Nota proceso: <span className={`nota ${notaClass(r?.nota)}`}>{formatNota(r && !r.parcial ? r.nota : null)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-500)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <I.warn size={14} /> La nota de proceso se promedia junto a las visitas en terreno para formar el 15% de supervisión.
      </div>
    </div>
  );
}

// ─── Pestaña: Nota del tutor del centro ───────────────────────
function TutorTab({ est, ctx }) {
  const t = (ctx.state.tutor && ctx.state.tutor[est.id]) || null;
  const [val, setVal] = useState(t?.nota != null ? String(t.nota) : '');

  return (
    <div className="card" style={{ padding: 24, maxWidth: 560 }}>
      <h3 className="h3" style={{ marginTop: 0 }}>Evaluación del profesor/a tutor/a del centro</h3>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
        El entrenador/a tutor/a del centro de práctica completa su propia pauta y entrega una nota.
        Esta evaluación pondera el <strong>20%</strong> de la nota final del estudiante. Registra aquí la nota informada.
      </p>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 4 }}
              onClick={() => window.descargarPautaInstrumento({ cfg: window.USACH_DATA.TUTOR, niveles: window.USACH_DATA.NIVELES.NIVELES_AUTO, est, titulo: 'Pauta de Evaluación del Entrenador/a Tutor/a' })}>
        <I.download size={14} /> Descargar pauta para el tutor/a
      </button>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span className="muted" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nota (1,0 – 7,0)</span>
          <input type="number" min={1} max={7} step={0.1} className="input" style={{ width: 120, fontSize: 18, fontWeight: 700, textAlign: 'center' }}
                 value={val} onChange={e => setVal(e.target.value)} placeholder="—" />
        </label>
        <button className="btn btn-primary" onClick={() => {
          const n = parseFloat(val);
          if (val === '' || isNaN(n)) { ctx.setTutorNota(est.id, null); ctx.toast('Nota del tutor eliminada'); }
          else { ctx.setTutorNota(est.id, Math.min(7, Math.max(1, Math.round(n * 10) / 10))); ctx.toast('Nota del tutor guardada'); }
        }}>Guardar</button>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registrada</div>
          <span className={`nota nota-lg ${notaClass(t?.nota)}`}>{formatNota(t?.nota)}</span>
        </div>
      </div>
      <div style={{ marginTop: 18, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--ink-600)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <I.archive size={14} /> Tutor del centro: <strong style={{ color: 'var(--ink-800)' }}>{est.tutorCentro}</strong> · {est.centro}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// INSTRUMENTO GENÉRICO (Autoevaluación P2)
// ═════════════════════════════════════════════════════════════
function InstrumentoScreen({ ctx, kind }) {
  const D = window.USACH_DATA;
  const cfg = D.AUTOEVAL;
  const respKey = 'autoeval';
  const commentsKey = 'autoevalComments';
  const niveles = D.NIVELES[cfg.nivelesKey];
  const escala = D.ESCALAS[cfg.escalaKey];
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  const [commentFor, setCommentFor] = useState(null);
  const nIndic = cfg.dimensiones.reduce((a, d) => a + d.indicadores.length, 0);

  return (
    <div data-screen-label="Autoevaluación">
      <div className="section-head">
        <div>
          <h1>Autoevaluación del estudiante</h1>
          <div className="subtitle">
            {cfg.dimensiones.length} dimensiones · {nIndic} indicadores · escala S/CS/O/CN/N · máx. {cfg.maxPuntos} pts · pondera 5% de la nota final
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary"><I.download /> Exportar respuestas</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="left">
          <strong style={{ fontSize: 12, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala:</strong>
          {niveles.map(n => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <span className="lvl" style={{ background: AUTO_COLORS[n.key] }}>{n.key}</span>
              {n.label} <span className="muted">({n.pts}pt)</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rubric-grid-wrap">
        <table className="rubric-grid">
          <thead>
            <tr>
              <th className="student" style={{ width: 220 }}>Estudiante</th>
              {cfg.dimensiones.flatMap(dim =>
                dim.indicadores.map((ind, i) => (
                  <th key={ind.id} className="crit" style={{ minWidth: 168, maxWidth: 220 }}>
                    <span className="crit-num">{dim.label.split('.')[0]}.{i + 1}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-700)', fontWeight: 500, lineHeight: 1.3, marginTop: 2 }}>
                      {ind.texto.length > 72 ? ind.texto.slice(0, 72) + '…' : ind.texto}
                    </span>
                  </th>
                ))
              )}
              <th className="crit" style={{ textAlign: 'right', width: 80 }}>
                <span className="crit-num">PUNTOS</span><span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-500)' }}>/{cfg.maxPuntos}</span>
              </th>
              <th className="crit" style={{ textAlign: 'center', width: 90, background: 'var(--teal-50)' }}>
                <span className="crit-num" style={{ color: 'var(--teal-800)' }}>NOTA</span>
              </th>
              <th className="crit" style={{ textAlign: 'center', width: 80 }}>
                <span className="crit-num">COMENT.</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map(est => {
              const respEst = ctx.state[respKey][est.id] || {};
              const r = Cp.calcInstrumento(respEst, cfg.dimensiones, niveles, escala);
              return (
                <tr key={est.id}>
                  <td className="student">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar nombre={est.nombre} />
                      <div>
                        <div style={{ fontSize: 12.5 }}>{est.nombre}</div>
                        <div className="muted" style={{ fontSize: 10.5 }}>{est.rut}</div>
                      </div>
                    </div>
                  </td>
                  {cfg.dimensiones.flatMap(dim =>
                    dim.indicadores.map(ind => {
                      const k = respEst[ind.id];
                      return (
                        <td key={ind.id} className="score-cell">
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
                      );
                    })
                  )}
                  <td className="points-cell tnum">{r ? `${r.puntos}` : <span className="muted">—</span>}</td>
                  <td className="nota-cell" style={{ background: 'var(--teal-50)' }}>
                    <span className={`nota ${notaClass(r?.nota)}`}>{formatNota(r && !r.parcial ? r.nota : null)}</span>
                  </td>
                  <td className="nota-cell">
                    <button className="btn btn-ghost btn-sm" onClick={() => setCommentFor(est)} style={{ position: 'relative' }}
                            title={ctx.state[commentsKey]?.[est.id] ? 'Editar comentario' : 'Agregar comentario'}>
                      <I.edit size={14} />
                      {ctx.state[commentsKey]?.[est.id] && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: 3, background: 'var(--teal-500)' }} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {commentFor && <SupervisorCommentModal est={commentFor} isAuto={true}
                                              value={ctx.state[commentsKey]?.[commentFor.id] || ''}
                                              onSave={(text) => { ctx.setSupervisorComment(commentsKey, commentFor.id, text); ctx.toast('Comentario guardado'); }}
                                              onClose={() => setCommentFor(null)} />}
    </div>
  );
}

Object.assign(window, { SupervisorP2Screen, InstrumentoScreen });
