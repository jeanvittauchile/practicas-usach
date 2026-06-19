// coord-centros.jsx — Centros de práctica + editor de horarios reutilizable

// ─── ScheduleEditor: edición de bloques {dia, desde, hasta} ────────────────
function ScheduleEditor({ blocks, onChange, accent }) {
  const DIAS = (window.SCHED && window.SCHED.DIAS) || ['Lun','Mar','Mié','Jue','Vie','Sáb'];
  const list = blocks || [];
  const upd = (i, k, v) => onChange(list.map((b, idx) => idx === i ? { ...b, [k]: v } : b));
  const add = () => onChange([...list, { dia:'Lun', desde:'09:00', hasta:'13:00' }]);
  const rm  = (i) => onChange(list.filter((_, idx) => idx !== i));
  const col = accent || 'var(--teal-500)';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {list.length === 0 && <div className="muted" style={{ fontSize:12.5 }}>Sin bloques horarios. Agrega el primero ↓</div>}
      {list.map((b, i) => (
        <div key={i} className="sched-row">
          <select value={b.dia} onChange={e => upd(i, 'dia', e.target.value)}>
            {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={b.desde} onChange={e => upd(i, 'desde', e.target.value)} />
          <span className="sched-dash">→</span>
          <input type="time" value={b.hasta} onChange={e => upd(i, 'hasta', e.target.value)} />
          <button type="button" className="btn btn-ghost btn-sm" style={{ color:'var(--err)', marginLeft:'auto' }} onClick={() => rm(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf:'flex-start', borderColor:col, color:col }} onClick={add}>+ Agregar bloque</button>
    </div>
  );
}

// Vista de chips de horario (solo lectura)
function SchedChips({ blocks, tone }) {
  const SCHED = window.SCHED || {};
  const fmt = SCHED.fmtBlock || (b => `${b.dia} ${b.desde}–${b.hasta}`);
  if (!blocks || blocks.length === 0) return <span className="muted" style={{ fontSize:12.5 }}>—</span>;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {blocks.map((b, i) => <span key={i} className={`sched-chip ${tone === 'orange' ? 'sched-chip-orange' : ''}`}>{fmt(b)}</span>)}
    </div>
  );
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
                    <div className="muted" style={{ fontSize:11 }}>{c.comuna || '—'} · {nSt} est.</div>
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

            {/* Contactos */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="card" style={{ padding:'16px 20px' }}>
                <div className="centro-block-lbl">Encargado del centro</div>
                <div style={{ fontWeight:700, fontSize:14.5, marginTop:4 }}>{selCentro.encargado?.nombre || '—'}</div>
                <div className="muted" style={{ fontSize:12.5 }}>{selCentro.encargado?.cargo || ''}</div>
              </div>
              <div className="card" style={{ padding:'16px 20px' }}>
                <div className="centro-block-lbl">Tutor/a de práctica</div>
                <div style={{ fontWeight:700, fontSize:14.5, marginTop:4 }}>{selCentro.tutor?.nombre || '—'}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:2, marginTop:4 }}>
                  {selCentro.tutor?.email && <a href={`mailto:${selCentro.tutor.email}`} style={{ fontSize:12.5 }}>✉ {selCentro.tutor.email}</a>}
                  {selCentro.tutor?.telefono && <span className="muted" style={{ fontSize:12.5 }}>☎ {selCentro.tutor.telefono}</span>}
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div className="centro-block-lbl" style={{ marginBottom:10 }}>Horarios de atención / disponibilidad</div>
              <SchedChips blocks={selCentro.horarios} tone="orange" />
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
  const [f, setF] = useState(initial || {
    nombre:'', direccion:'', comuna:'', area:'',
    encargado:{ nombre:'', cargo:'' }, tutor:{ nombre:'', email:'', telefono:'' }, horarios:[],
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setNested = (group, k, v) => setF(p => ({ ...p, [group]: { ...(p[group]||{}), [k]: v } }));
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

          <div className="form-divider">Tutor/a de práctica</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-field" style={{ gridColumn:'1/-1' }}><label>Nombre</label><input value={f.tutor?.nombre||''} onChange={e=>setNested('tutor','nombre',e.target.value)} placeholder="Nombre del tutor/a"/></div>
            <div className="form-field"><label>Correo</label><input type="email" value={f.tutor?.email||''} onChange={e=>setNested('tutor','email',e.target.value)} placeholder="correo@centro.cl"/></div>
            <div className="form-field"><label>Teléfono</label><input value={f.tutor?.telefono||''} onChange={e=>setNested('tutor','telefono',e.target.value)} placeholder="+56 9 ..."/></div>
          </div>

          <div className="form-divider">Horarios de atención / disponibilidad</div>
          <ScheduleEditor blocks={f.horarios} onChange={v => set('horarios', v)} accent="var(--orange-600)" />
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { if (!f.nombre) return; onSave(f); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CentrosScreen, CentroModal, ScheduleEditor, SchedChips });
