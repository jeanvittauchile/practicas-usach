// coord-centros.jsx — Centros de práctica + editor de horarios reutilizable

// ─── ScheduleEditor: edición de bloques {dias, desde, hasta, practicas?} ───
function ScheduleEditor({ blocks, onChange, accent, showPracticas }) {
  const DIAS = (window.SCHED && window.SCHED.DIAS) || ['Lun','Mar','Mié','Jue','Vie','Sáb'];
  const blockDias = (window.SCHED && window.SCHED.blockDias) || (b => b.dias && b.dias.length ? b.dias : (b.dia ? [b.dia] : []));
  const PRACTICES = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const list = blocks || [];
  const upd = (i, k, v) => onChange(list.map((b, idx) => idx === i ? { ...b, [k]: v } : b));
  const updTutor = (i, k, v) => upd(i, 'tutor', { ...(list[i].tutor || {}), [k]: v });
  const add = () => onChange([...list, { dias:['Lun'], desde:'09:00', hasta:'13:00', ...(showPracticas ? { disciplina:'', practicas: [], cupos: 1, tutor: { nombre:'', email:'', telefono:'' } } : {}) }]);
  const rm  = (i) => onChange(list.filter((_, idx) => idx !== i));
  const togglePractica = (i, code) => {
    const cur = list[i].practicas || [];
    upd(i, 'practicas', cur.includes(code) ? cur.filter(c => c !== code) : [...cur, code]);
  };
  const toggleDia = (i, dia) => {
    const cur = blockDias(list[i]);
    const next = cur.includes(dia) ? cur.filter(d => d !== dia) : DIAS.filter(d => cur.includes(d) || d === dia);
    if (next.length === 0) return;
    onChange(list.map((b, idx) => idx === i ? { ...b, dias: next, dia: undefined } : b));
  };
  const col = accent || 'var(--teal-500)';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {list.length === 0 && <div className="muted" style={{ fontSize:12.5 }}>Sin bloques horarios. Agrega el primero ↓</div>}
      {list.map((b, i) => (
        <div key={i} style={{ border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', display:'flex', flexDirection:'column', gap:7 }}>
          {showPracticas && (
            <input type="text" value={b.disciplina || ''} onChange={e => upd(i, 'disciplina', e.target.value)}
                   placeholder="Disciplina (ej: Boxeo juvenil mixto)"
                   style={{ padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit', fontWeight:600 }} />
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {DIAS.map(d => {
              const active = blockDias(b).includes(d);
              return (
                <button key={d} type="button" onClick={() => toggleDia(i, d)}
                        className="day-chip"
                        style={{ cursor:'pointer', fontFamily:'inherit',
                                 border: active ? '1.5px solid currentColor' : '1.5px solid transparent',
                                 opacity: active ? 1 : .35 }}>
                  {d}
                </button>
              );
            })}
          </div>
          <div className="sched-row">
            <input type="time" value={b.desde} onChange={e => upd(i, 'desde', e.target.value)} />
            <span className="sched-dash">→</span>
            <input type="time" value={b.hasta} onChange={e => upd(i, 'hasta', e.target.value)} />
            {showPracticas && (
              <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink-500)', marginLeft:6 }}>
                Cupos
                <input type="number" min="0" value={b.cupos ?? 1} onChange={e => upd(i, 'cupos', Math.max(0, parseInt(e.target.value) || 0))}
                       style={{ width:52, padding:'5px 6px', border:'1.5px solid var(--border)', borderRadius:6, fontSize:13 }} />
              </label>
            )}
            <button type="button" className="btn btn-ghost btn-sm" style={{ color:'var(--err)', marginLeft: showPracticas ? 0 : 'auto' }} onClick={() => rm(i)}>✕</button>
          </div>
          {showPracticas && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {PRACTICES.map(code => {
                const active = (b.practicas || []).includes(code);
                return (
                  <button key={code} type="button" onClick={() => togglePractica(i, code)}
                          className={`practice-chip chip-${code}`}
                          style={{ cursor:'pointer', fontFamily:'inherit',
                                   border: active ? '1.5px solid currentColor' : '1.5px solid transparent',
                                   opacity: active ? 1 : .35 }}>
                    {code}
                  </button>
                );
              })}
              {(b.practicas || []).length === 0 && <span className="muted" style={{ fontSize:11 }}>Sin práctica asignada · aplica a todas</span>}
            </div>
          )}
          {showPracticas && (
            <div style={{ borderTop:'1px dashed var(--border)', paddingTop:7, display:'flex', flexDirection:'column', gap:6 }}>
              <div className="muted" style={{ fontSize:11, fontWeight:600 }}>Tutor/a de esta disciplina</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input value={b.tutor?.nombre || ''} onChange={e => updTutor(i, 'nombre', e.target.value)} placeholder="Nombre del tutor/a"
                       style={{ padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit', fontWeight:600 }} />
                <input type="email" value={b.tutor?.email || ''} onChange={e => updTutor(i, 'email', e.target.value)} placeholder="correo@centro.cl"
                       style={{ padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit' }} />
              </div>
              <input value={b.tutor?.telefono || ''} onChange={e => updTutor(i, 'telefono', e.target.value)} placeholder="+56 9 ..."
                     style={{ padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit' }} />
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf:'flex-start', borderColor:col, color:col }} onClick={add}>+ Agregar bloque</button>
    </div>
  );
}

// Vista de chips de horario (solo lectura)
function SchedChips({ blocks, tone }) {
  const SCHED = window.SCHED || {};
  const fmt = SCHED.fmtBlock || (b => `${(b.dias||[b.dia]).join(', ')} ${b.desde}–${b.hasta}`);
  if (!blocks || blocks.length === 0) return <span className="muted" style={{ fontSize:12.5 }}>—</span>;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {blocks.map((b, i) => <span key={i} className={`sched-chip ${tone === 'orange' ? 'sched-chip-orange' : ''}`}>{fmt(b)}</span>)}
    </div>
  );
}

// Tutores "sueltos" de un centro (no asociados a un bloque horario), con
// compatibilidad hacia atrás para centros antiguos guardados con un solo
// `tutor`, o con un arreglo `tutores` independiente de los horarios.
function centroTutoresSueltos(c) {
  if (c.tutores && c.tutores.length) return c.tutores;
  return c.tutor && (c.tutor.nombre || c.tutor.email || c.tutor.telefono) ? [c.tutor] : [];
}

// Empareja cada bloque horario con su tutor/a: usa el campo `horario.tutor`
// (nuevo, cargado directo en el bloque) o, si el centro aún no fue migrado,
// intenta calzarlo con los tutores "sueltos" antiguos por texto de disciplina
// (igual o uno contenido en el otro, ej. "Boxeo" ↔ "Boxeo juvenil mixto") y,
// como último recurso, si queda un solo bloque y un solo tutor sin calzar,
// los asocia por descarte. Devuelve { grupos: [{ horario, tutor }], sueltos }.
function centroGrupos(c) {
  const horarios = c.horarios || [];
  const legacy = centroTutoresSueltos(c);
  const norm = s => (s || '').trim().toLowerCase();
  const usados = new Array(legacy.length).fill(false);
  const tieneTutor = t => t && (t.nombre || t.email || t.telefono);
  const matchIdx = (disc) => {
    if (!disc) return -1;
    const d = norm(disc);
    let idx = legacy.findIndex((t, i) => !usados[i] && norm(t.disciplina) === d);
    if (idx < 0) idx = legacy.findIndex((t, i) => !usados[i] && t.disciplina && (d.includes(norm(t.disciplina)) || norm(t.disciplina).includes(d)));
    return idx;
  };
  const grupos = horarios.map(h => {
    if (tieneTutor(h.tutor)) return { horario: h, tutor: h.tutor };
    const idx = matchIdx(h.disciplina);
    if (idx >= 0) { usados[idx] = true; return { horario: h, tutor: legacy[idx] }; }
    return { horario: h, tutor: null };
  });
  const sinTutor = grupos.filter(g => !g.tutor);
  const restantes = legacy.map((t, i) => ({ t, i })).filter(({ i }) => !usados[i]);
  if (sinTutor.length === 1 && restantes.length === 1) {
    usados[restantes[0].i] = true;
    sinTutor[0].tutor = restantes[0].t;
  }
  const sueltos = legacy.filter((_, i) => !usados[i]);
  return { grupos, sueltos };
}

// Todos los tutores de un centro (embebidos en horarios + sueltos), para
// contadores y listados planos (reportes, resúmenes).
function centroTutores(c) {
  const { grupos, sueltos } = centroGrupos(c);
  return grupos.filter(g => g.tutor).map(g => g.tutor).concat(sueltos);
}

// ─── CentrosScreen ─────────────────────────────────────────────────────────
function CentrosScreen({ ctx }) {
  const { centros, profs, students, saveCentro, deleteCentro, toast } = ctx;
  const SCHED = window.SCHED || {};
  const [sel, setSel] = useState(centros[0]?.id || null);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editCentro, setEditCentro] = useState(null);

  const filtered = centros.filter(c =>
    !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.comuna||'').toLowerCase().includes(search.toLowerCase())
  );
  const selCentro = centros.find(c => c.id === sel) || null;

  const assignedStudents = selCentro ? students.filter(s => s.centro === selCentro.nombre) : [];
  const disciplinas = selCentro ? [...new Set((selCentro.horarios || []).map(h => h.disciplina).filter(Boolean))] : [];
  const { grupos: horarioGrupos, sueltos: tutoresSueltos } = selCentro ? centroGrupos(selCentro) : { grupos: [], sueltos: [] };
  const tutores = selCentro ? centroTutores(selCentro) : [];
  const capTotal = selCentro ? (SCHED.centroCapacidad ? SCHED.centroCapacidad(selCentro) : 0) : 0;
  const ocupTotal = selCentro ? (SCHED.centroOcupados ? SCHED.centroOcupados(selCentro, students) : assignedStudents.length) : 0;
  const compatProfs = selCentro
    ? profs.map(p => ({ p, matches: SCHED.profMatchCentro ? SCHED.profMatchCentro(p, selCentro) : [] }))
        .filter(x => x.matches.length > 0)
        .sort((a, b) => b.matches.length - a.matches.length)
    : [];

  const avatar = n => (n||'').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

  return (
    <div data-screen-label="Centros de práctica">
      <div className="section-head">
        <div>
          <h1>Centros de práctica</h1>
          <div className="subtitle">{centros.length} centros · horarios, contactos y profesores USACH compatibles</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => { setEditCentro(null); setShowEdit(true); }}>+ Agregar centro</button>
        </div>
      </div>

      <div className="detail-panel">
        {/* Lista de centros */}
        <div>
          <div className="card" style={{ padding:'10px 12px', marginBottom:10 }}>
            <input style={{ width:'100%', padding:'8px 12px', fontSize:13, border:'1.5px solid var(--border)', borderRadius:8 }}
                   placeholder="Buscar centro o comuna…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {filtered.length === 0 && <div className="muted" style={{ padding:24, textAlign:'center', fontSize:13 }}>Sin resultados</div>}
            {filtered.map(c => {
              const nSt = students.filter(s => s.centro === c.nombre).length;
              const cap = SCHED.centroCapacidad ? SCHED.centroCapacidad(c) : 0;
              const active = c.id === sel;
              return (
                <button key={c.id} onClick={() => setSel(c.id)}
                        style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                                 background: active ? 'var(--teal-50)' : 'var(--bg)',
                                 borderLeft: active ? '3px solid var(--teal-500)' : '3px solid transparent',
                                 cursor:'pointer', border:'none', borderBottom:'1px solid var(--border)' }}>
                  <div className="centro-ic">{(c.nombre||'?')[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight: active ? 700 : 500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--ink-900)' }}>{c.nombre}</div>
                    <div className="muted" style={{ fontSize:11 }}>{c.comuna || '—'} · {cap > 0 ? `${nSt}/${cap} cupos` : `${nSt} est.`}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalle del centro */}
        {!selCentro ? (
          <div className="card" style={{ display:'grid', placeItems:'center', padding:48, color:'var(--ink-400)' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🏢</div>
              <div style={{ fontSize:15, fontWeight:600 }}>Selecciona un centro</div>
              <div className="muted" style={{ fontSize:13, marginTop:4 }}>para ver sus datos y horarios</div>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Header */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', background:'linear-gradient(105deg,var(--ink-800),var(--ink-600))', color:'#fff', display:'flex', gap:14, alignItems:'center' }}>
                <div className="centro-ic" style={{ width:46, height:46, fontSize:20, background:'rgba(255,255,255,.16)', color:'#fff' }}>{(selCentro.nombre||'?')[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h2 style={{ color:'#fff', fontSize:18, margin:0 }}>{selCentro.nombre}</h2>
                  <div style={{ fontSize:12.5, opacity:.85 }}>{selCentro.direccion || '—'}{selCentro.comuna ? ` · ${selCentro.comuna}` : ''}</div>
                  {disciplinas.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:7 }}>
                      {disciplinas.map(d => <span key={d} className="tag" style={{ background:'rgba(255,255,255,.16)', color:'#fff', fontSize:11 }}>{d}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {selCentro.area && <span className="tag" style={{ background:'rgba(255,255,255,.16)', color:'#fff' }}>{selCentro.area}</span>}
                  <button className="btn btn-ghost btn-sm" style={{ color:'#fff', borderColor:'rgba(255,255,255,.3)' }}
                          onClick={() => { setEditCentro({ ...selCentro }); setShowEdit(true); }}>Editar</button>
                  <button className="btn btn-ghost btn-sm" style={{ color:'#ffcdd2', borderColor:'rgba(255,255,255,.2)' }}
                          onClick={() => { if (window.confirm(`¿Eliminar el centro ${selCentro.nombre}?`)) { deleteCentro(selCentro.id); setSel(filtered.find(c=>c.id!==selCentro.id)?.id||null); toast('Centro eliminado'); } }}>Eliminar</button>
                </div>
              </div>
            </div>

            {/* Encargado */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div className="centro-block-lbl">Encargado del centro</div>
              <div style={{ fontWeight:700, fontSize:14.5, marginTop:4 }}>{selCentro.encargado?.nombre || '—'}</div>
              <div className="muted" style={{ fontSize:12.5 }}>{selCentro.encargado?.cargo || ''}</div>
            </div>

            {/* Disciplinas, horarios y tutores/as (agrupados) */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div className="centro-block-lbl" style={{ margin:0 }}>Disciplinas, horarios y tutores/as</div>
                {capTotal > 0 && (
                  <span className="tag" style={{ color: ocupTotal >= capTotal ? 'var(--err)' : 'var(--teal-700)' }}>
                    {ocupTotal}/{capTotal} cupos
                  </span>
                )}
              </div>
              {horarioGrupos.length === 0 ? (
                <span className="muted" style={{ fontSize:12.5 }}>—</span>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {horarioGrupos.map(({ horario: h, tutor: t }, i) => {
                    const cap = h.cupos != null ? Number(h.cupos) : null;
                    const ocup = cap != null
                      ? assignedStudents.filter(s => !h.practicas?.length || h.practicas.includes(s.practica)).length
                      : null;
                    const lleno = cap != null && cap > 0 && ocup >= cap;
                    return (
                      <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? 10 : 0, display:'flex', flexWrap:'wrap', alignItems:'center', gap:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span className="sched-chip sched-chip-orange">{SCHED.fmtBlock ? SCHED.fmtBlock(h) : `${(h.dias||[h.dia]).join(', ')} ${h.desde}–${h.hasta}`}</span>
                          {cap != null && (
                            <span style={{ fontSize:11.5, fontWeight:700, color: lleno ? 'var(--err)' : 'var(--teal-700)' }}>
                              {ocup}/{cap} cupos{lleno ? ' · LLENO' : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ marginLeft: 'auto', minWidth: 180 }}>
                          {t ? (
                            <div>
                              <div style={{ fontSize:12.5, fontWeight:700 }}>👤 {t.nombre || '—'}</div>
                              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                {t.email && <a href={`mailto:${t.email}`} style={{ fontSize:11.5 }}>✉ {t.email}</a>}
                                {t.telefono && <span className="muted" style={{ fontSize:11.5 }}>☎ {t.telefono}</span>}
                              </div>
                            </div>
                          ) : (
                            <span className="muted" style={{ fontSize:12 }}>Sin tutor/a asignado</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {tutoresSueltos.length > 0 && (
                <div style={{ marginTop:12, paddingTop:10, borderTop:'1px dashed var(--border)' }}>
                  <div className="muted" style={{ fontSize:11, fontWeight:700, marginBottom:6 }}>OTROS TUTORES/AS (SIN HORARIO ASOCIADO)</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {tutoresSueltos.map((t, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontWeight:700, fontSize:13 }}>{t.nombre || '—'}</span>
                        {t.disciplina && <span className="tag" style={{ fontSize:10.5 }}>{t.disciplina}</span>}
                        {t.email && <a href={`mailto:${t.email}`} style={{ fontSize:12 }}>✉ {t.email}</a>}
                        {t.telefono && <span className="muted" style={{ fontSize:12 }}>☎ {t.telefono}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profesores compatibles */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div className="centro-block-lbl" style={{ margin:0 }}>Profesores/as USACH compatibles</div>
                <span className="tag tag-teal">{compatProfs.length}</span>
              </div>
              {compatProfs.length === 0 ? (
                <div className="muted" style={{ fontSize:13 }}>Ningún profesor/a tiene disponibilidad que coincida con estos horarios. Ajusta la disponibilidad en la pestaña Profesores.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {compatProfs.map(({ p, matches }) => (
                    <div key={p.id} className="compat-row">
                      <div className="avatar-sm" style={{ width:30, height:30, fontSize:11 }}>{avatar(p.nombre)}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{p.nombre}</div>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:3 }}>
                          {(p.practicasAsignadas||[]).map(c => <span key={c} className={`practice-chip chip-${c}`} style={{ fontSize:9.5, padding:'1px 5px' }}>{c}</span>)}
                        </div>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'flex-end', maxWidth:'45%' }}>
                        {matches.map((m, i) => <span key={i} className="match-chip">✓ {window.SCHED.fmtBlock(m.centro)}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estudiantes en el centro */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div className="centro-block-lbl" style={{ margin:0 }}>Estudiantes asignados al centro</div>
                <span className="tag">{assignedStudents.length}</span>
              </div>
              {assignedStudents.length === 0 ? (
                <div className="muted" style={{ fontSize:13 }}>Sin estudiantes asignados a este centro.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {assignedStudents.map(s => {
                    const prof = profs.find(p => p.id === s.profesorId);
                    return (
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13 }}>
                        <div className="avatar-sm" style={{ width:24, height:24, fontSize:9 }}>{avatar(s.nombre)}</div>
                        <span style={{ flex:1 }}>{s.nombre}</span>
                        <span className={`practice-chip chip-${s.practica}`} style={{ fontSize:10 }}>{s.practica}</span>
                        <span className="muted" style={{ fontSize:11.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160 }}>{prof ? prof.nombre.replace('Prof. ','') : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <CentroModal initial={editCentro}
          onSave={c => { saveCentro(c); toast(editCentro ? 'Centro actualizado' : 'Centro agregado'); setShowEdit(false); setEditCentro(null); if (!editCentro) setSel(DB.getCentros().slice(-1)[0]?.id); }}
          onClose={() => { setShowEdit(false); setEditCentro(null); }}
        />
      )}
    </div>
  );
}

// ─── CentroModal ───────────────────────────────────────────────────────────
function CentroModal({ initial, onSave, onClose }) {
  const [f, setF] = useState(() => {
    if (!initial) return { nombre:'', direccion:'', comuna:'', area:'', encargado:{ nombre:'', cargo:'' }, horarios:[], tutoresSueltos:[] };
    const { tutor, tutores, ...rest } = initial;
    // Migra tutores antiguos (arreglo suelto) al bloque horario de su misma disciplina,
    // para que en el formulario queden justo al lado del deporte correspondiente.
    const { grupos, sueltos } = centroGrupos(initial);
    const horarios = grupos.map(({ horario, tutor: t }) => ({
      ...horario,
      tutor: { nombre: t?.nombre || '', email: t?.email || '', telefono: t?.telefono || '' },
    }));
    return { ...rest, horarios, tutoresSueltos: sueltos };
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setNested = (group, k, v) => setF(p => ({ ...p, [group]: { ...(p[group]||{}), [k]: v } }));
  const updSuelto = (i, k, v) => set('tutoresSueltos', (f.tutoresSueltos||[]).map((t, idx) => idx === i ? { ...t, [k]: v } : t));
  const addSuelto = () => set('tutoresSueltos', [...(f.tutoresSueltos||[]), { nombre:'', disciplina:'', email:'', telefono:'' }]);
  const rmSuelto  = (i) => set('tutoresSueltos', (f.tutoresSueltos||[]).filter((_, idx) => idx !== i));
  const guardar = () => {
    if (!f.nombre) return;
    // Limpia tutores vacíos de cada bloque para no guardar objetos {nombre:'',email:'',telefono:''}.
    const horarios = (f.horarios||[]).map(h => {
      const t = h.tutor;
      const tieneTutor = t && (t.nombre || t.email || t.telefono);
      if (tieneTutor) return { ...h, tutor: t };
      const { tutor: _drop, ...rest } = h;
      return rest;
    });
    const { tutoresSueltos, ...rest } = f;
    onSave({ ...rest, horarios, tutores: tutoresSueltos || [] });
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h2>{initial ? 'Editar centro' : 'Agregar centro de práctica'}</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-field" style={{ gridColumn:'1/-1' }}><label>Nombre del centro</label><input value={f.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Nombre del centro"/></div>
            <div className="form-field"><label>Dirección</label><input value={f.direccion||''} onChange={e=>set('direccion',e.target.value)} placeholder="Calle 123"/></div>
            <div className="form-field"><label>Comuna</label><input value={f.comuna||''} onChange={e=>set('comuna',e.target.value)} placeholder="Comuna"/></div>
            <div className="form-field" style={{ gridColumn:'1/-1' }}><label>Área deportiva</label><input value={f.area||''} onChange={e=>set('area',e.target.value)} placeholder="Deportiva, Gestión, Ciencias del Deporte…"/></div>
          </div>

          <div className="form-divider">Encargado del centro</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-field"><label>Nombre</label><input value={f.encargado?.nombre||''} onChange={e=>setNested('encargado','nombre',e.target.value)} placeholder="Nombre"/></div>
            <div className="form-field"><label>Cargo</label><input value={f.encargado?.cargo||''} onChange={e=>setNested('encargado','cargo',e.target.value)} placeholder="Cargo"/></div>
          </div>

          <div className="form-divider">Disciplinas, horarios y tutores/as</div>
          <div className="muted" style={{ fontSize:12, marginTop:-6, marginBottom:2 }}>
            Cada bloque es una disciplina o deporte con su horario y cupos; agrega el tutor/a a cargo justo debajo, en el mismo bloque
            (ej: I y II de 13 a 14 con su tutor de Natación, IV de 15 a 16 con su tutor de Boxeo).
          </div>
          <ScheduleEditor blocks={f.horarios} onChange={v => set('horarios', v)} accent="var(--orange-600)" showPracticas />

          {(f.tutoresSueltos||[]).length > 0 && (
            <>
              <div className="form-divider">Otros tutores/as (sin horario asociado)</div>
              <div className="muted" style={{ fontSize:12, marginTop:-6, marginBottom:2 }}>
                Tutores registrados antes de asociar sus horarios, o que apoyan al centro sin un bloque propio.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(f.tutoresSueltos||[]).map((t, i) => (
                  <div key={i} style={{ border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px', display:'flex', flexDirection:'column', gap:7 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <input value={t.nombre||''} onChange={e=>updSuelto(i,'nombre',e.target.value)} placeholder="Nombre del tutor/a"
                             style={{ padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit', fontWeight:600 }} />
                      <input value={t.disciplina||''} onChange={e=>updSuelto(i,'disciplina',e.target.value)} placeholder="Disciplina (ej: Natación infantil)"
                             style={{ padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit' }} />
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <input type="email" value={t.email||''} onChange={e=>updSuelto(i,'email',e.target.value)} placeholder="correo@centro.cl"
                             style={{ flex:1, padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit' }} />
                      <input value={t.telefono||''} onChange={e=>updSuelto(i,'telefono',e.target.value)} placeholder="+56 9 ..."
                             style={{ flex:1, padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:13, fontFamily:'inherit' }} />
                      <button type="button" className="btn btn-ghost btn-sm" style={{ color:'var(--err)' }} onClick={() => rmSuelto(i)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf:'flex-start', marginTop:6 }} onClick={addSuelto}>+ Agregar tutor/a sin horario asociado</button>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={guardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CentrosScreen, CentroModal, ScheduleEditor, SchedChips, centroTutores, centroGrupos, centroTutoresSueltos });
