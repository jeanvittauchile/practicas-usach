// coord-profesores.jsx — Gestión de profesores + asignación de prácticas

function AsignacionesScreen({ ctx }) {
  const { profs, students, saveProf, deleteProf, saveStudent, onNav, toast } = ctx;
  const [sel, setSel] = useState(profs[0]?.id || null);
  const [search, setSearch] = useState('');
  const [fPrac, setFPrac] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editProf, setEditProf] = useState(null);
  const [dragStudent, setDragStudent] = useState(null);
  const [dragOverProf, setDragOverProf] = useState(null);
  const [dragOverSelf, setDragOverSelf] = useState(false);
  const [picked, setPicked] = useState(null);  // estudiante elegido por clic

  const active = dragStudent || picked;
  const dragValid = (p) => active && (p.practicasAsignadas||[]).includes(active.practica);
  const togglePick = (s) => setPicked(prev => (prev && prev.id === s.id) ? null : s);
  // Núcleo de asignación (usado por drag y por clic)
  const assignTo = (p, s) => {
    if (!s || !p) return;
    if (!(p.practicasAsignadas||[]).includes(s.practica)) {
      toast(`${p.nombre.replace('Prof. ','')} no imparte la Práctica ${s.practica}`, 'error');
      return;
    }
    if (p.id === s.profesorId) { toast(`${s.nombre} ya está con ${p.nombre.replace('Prof. ','')}`); return; }
    saveStudent({ ...s, profesorId: p.id });
    toast(`${s.nombre} asignado/a a ${p.nombre.replace('Prof. ','')}`);
  };
  // Clic en un/a profesor/a del panel izquierdo
  const onProfClick = (p) => {
    if (picked) { assignTo(p, picked); setPicked(null); return; }
    setSel(p.id);
  };
  const handleDrop = (p) => {
    const s = dragStudent;
    setDragStudent(null); setDragOverProf(null);
    assignTo(p, s);
  };
  const unassign = (s) => {
    if (picked?.id === s.id) setPicked(null);
    saveStudent({ ...s, profesorId: '' });
    toast(`${s.nombre} quedó sin profesor/a`);
  };
  const assignToSel = (selProf) => {
    const s = dragStudent || picked;
    setDragStudent(null); setDragOverProf(null); setDragOverSelf(false); setPicked(null);
    assignTo(selProf, s);
  };

  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const PNAMES = window.PRACTICE_NAMES || {};

  const filtered = profs.filter(p =>
    (!search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())) &&
    (!fPrac || (p.practicasAsignadas||[]).includes(fPrac))
  );

  const selProf = profs.find(p => p.id === sel) || null;
  const selStudents = selProf ? students.filter(s => s.profesorId === selProf.id) : [];

  const togglePractica = (prof, code) => {
    const arr = prof.practicasAsignadas || [];
    const updated = arr.includes(code) ? arr.filter(c => c !== code) : [...arr, code];
    saveProf({ ...prof, practicasAsignadas: updated });
    toast(`Práctica ${code} ${updated.includes(code) ? 'asignada a' : 'removida de'} ${prof.nombre.split(' ')[1] || prof.nombre}`);
  };

  const avatar = (n) => n.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

  return (
    <div data-screen-label="Asignaciones">
      <div className="section-head">
        <div>
          <h1>Profesores y asignaciones</h1>
          <div className="subtitle">{profs.length} profesores registrados · asigna o retira prácticas con un clic</div>
        </div>
      </div>

      <div className="detail-panel">
        {/* Lista de profesores */}
        <div>
          <div className="card" style={{ padding:'10px 12px', marginBottom:10, display:'flex', flexDirection:'column', gap:8 }}>
            <input style={{ width:'100%', margin:0, padding:'8px 12px', fontSize:13, boxSizing:'border-box' }}
                   placeholder="Buscar por nombre o correo…"
                   value={search} onChange={e => setSearch(e.target.value)} />
            <select style={{ width:'100%', margin:0, padding:'8px 12px', fontSize:13, boxSizing:'border-box' }}
                    value={fPrac} onChange={e => setFPrac(e.target.value)}>
              <option value="">Todas las prácticas</option>
              {PRACS.map(c => <option key={c} value={c}>Práctica {c}</option>)}
            </select>
          </div>
          {active && <div className="drag-hint"><strong>{active.nombre}</strong> · Práctica {active.practica} — haz clic en (o arrastra hacia) un/a profesor/a que imparta esa práctica{picked ? <button className="btn btn-ghost btn-sm" style={{ marginLeft:8, padding:'1px 8px' }} onClick={() => setPicked(null)}>cancelar</button> : null}</div>}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {filtered.length === 0 && <div className="muted" style={{ padding:24, textAlign:'center', fontSize:13 }}>Sin resultados</div>}
            {filtered.map(p => {
              const nSt = students.filter(s => s.profesorId === p.id).length;
              const nPr = (p.practicasAsignadas||[]).length;
              const active = p.id === sel;
              return (
                <button key={p.id} onClick={() => onProfClick(p)}
                        className={active ? (dragValid(p) ? (dragOverProf===p.id ? 'prof-target prof-target-on' : 'prof-target') : 'prof-target-invalid') : ''}
                        onDragOver={e => { if (dragStudent) { e.preventDefault(); setDragOverProf(p.id); } }}
                        onDragLeave={() => setDragOverProf(prev => prev===p.id ? null : prev)}
                        onDrop={e => { e.preventDefault(); handleDrop(p); }}
                        style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                                 borderBottom:'1px solid var(--border)', background: active ? 'var(--teal-50)' : 'var(--bg)',
                                 borderLeft: active ? '3px solid var(--teal-500)' : '3px solid transparent',
                                 cursor:'pointer', border:'none', borderBottom:'1px solid var(--border)' }}>
                  <div className="avatar-sm">{avatar(p.nombre)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight: active ? 700 : 500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--ink-900)' }}>{p.nombre}</div>
                    <div className="muted" style={{ fontSize:11 }}>{nPr} práctica{nPr!==1?'s':''} · {nSt} estudiante{nSt!==1?'s':''} · {p.horasAsignadas||0}h</div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'flex-end', maxWidth:80 }}>
                    {(p.practicasAsignadas||[]).map(c => (
                      <span key={c} className={`practice-chip chip-${c}`} style={{ fontSize:10, padding:'1px 5px' }}>{c}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de detalle */}
        {!selProf ? (
          <div className="card" style={{ display:'grid', placeItems:'center', padding:48, color:'var(--ink-400)' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>👈</div>
              <div style={{ fontSize:15, fontWeight:600 }}>Selecciona un profesor</div>
              <div className="muted" style={{ fontSize:13, marginTop:4 }}>para ver y editar sus asignaciones</div>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Header */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', background:'linear-gradient(105deg,var(--teal-700),var(--teal-500))', color:'#fff', display:'flex', gap:14, alignItems:'center' }}>
                <div className="avatar-sm" style={{ width:46, height:46, fontSize:16, background:'rgba(255,255,255,.2)', borderRadius:10 }}>{avatar(selProf.nombre)}</div>
                <div style={{ flex:1 }}>
                  <h2 style={{ color:'#fff', fontSize:17, margin:0 }}>{selProf.nombre}</h2>
                  <div style={{ fontSize:12.5, opacity:.88 }}>{selProf.email}</div>
                  <div style={{ display:'flex', gap:8, marginTop:7 }}>
                    <span className="hdr-pill">{selProf.horasAsignadas||0} h asignadas</span>
                    <span className="hdr-pill">{selStudents.length} estudiante{selStudents.length!==1?'s':''}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ color:'#fff', borderColor:'rgba(255,255,255,.3)' }}
                          onClick={() => onNav('estudiantes', { profId: selProf.id })}>Ver estudiantes</button>
                  <button className="btn btn-ghost btn-sm" style={{ color:'#fff', borderColor:'rgba(255,255,255,.3)' }}
                          onClick={() => { setEditProf({ ...selProf }); setShowAdd(true); }}>Editar</button>
                  <button className="btn btn-ghost btn-sm" style={{ color:'#ffcdd2', borderColor:'rgba(255,255,255,.2)' }}
                          onClick={() => { if (window.confirm(`¿Eliminar a ${selProf.nombre}?`)) { deleteProf(selProf.id); setSel(filtered.find(p=>p.id!==selProf.id)?.id||null); toast('Profesor eliminado'); } }}>Eliminar</button>
                </div>
              </div>
            </div>

            {/* Horas + disponibilidad */}
            <div style={{ display:'grid', gridTemplateColumns:'minmax(180px,.8fr) 1.4fr', gap:14 }}>
              <HorasCard prof={selProf} saveProf={saveProf} toast={toast} />
              <DispoCard prof={selProf} saveProf={saveProf} toast={toast} />
            </div>

            {/* Asignación de prácticas */}
            <div className="card" style={{ padding:'16px 20px' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Prácticas asignadas · clic para activar/desactivar</div>
              <div className="toggle-grid">
                {PRACS.map(code => {
                  const on = (selProf.practicasAsignadas||[]).includes(code);
                  return (
                    <button key={code} className={`toggle-btn ${on?'on':''}`} onClick={() => togglePractica(selProf, code)}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{code}</div>
                      <div style={{ fontSize:11, opacity:.75, marginTop:2 }}>{PNAMES[code] || ''}</div>
                      <div style={{ fontSize:10.5, marginTop:4, fontWeight: on?700:400, color: on?'var(--teal-600)':'var(--ink-400)' }}>{on ? '✓ Asignada' : 'Sin asignar'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estudiantes del profesor — zona de asignación */}
            <div className={`card assign-drop ${active && (selProf.practicasAsignadas||[]).includes(active.practica) && active.profesorId!==selProf.id ? (dragOverSelf ? 'drop-on' : 'drop-ready') : ''}`}
                 style={{ padding:'14px 20px', cursor: (picked && (selProf.practicasAsignadas||[]).includes(picked.practica) && picked.profesorId!==selProf.id) ? 'copy' : undefined }}
                 onClick={() => { if (picked) assignToSel(selProf); }}
                 onDragOver={e => { if (dragStudent) { e.preventDefault(); setDragOverSelf(true); } }}
                 onDragLeave={() => setDragOverSelf(false)}
                 onDrop={e => { e.preventDefault(); assignToSel(selProf); }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>
                Estudiantes asignados <span className="muted">({selStudents.length})</span>
              </div>
              <div className="muted" style={{ fontSize:12, marginBottom:12 }}>Asigna con el buscador de abajo · para mover a alguien, haz clic en su píldora y luego en otro/a profesor/a del panel izquierdo (o arrástralo/a) · × para quitarlo/a.</div>
              {selStudents.length === 0 && <div className="muted" style={{ fontSize:13 }}>Sin estudiantes asignados a este profesor.</div>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {selStudents.map(s => (
                  <div key={s.id} className={`drag-pill ${dragStudent?.id===s.id ? 'dragging' : ''} ${picked?.id===s.id ? 'picked' : ''}`} draggable
                       onClick={e => { e.stopPropagation(); togglePick(s); }}
                       onDragStart={e => { setDragStudent(s); e.dataTransfer.effectAllowed='move'; try { e.dataTransfer.setData('text/plain', s.id); } catch(err){} }}
                       onDragEnd={() => { setDragStudent(null); setDragOverProf(null); setDragOverSelf(false); }}
                       title="Clic para elegir · o arrastra para reasignar">
                    <span className="grip">⠿</span>
                    <div className="avatar-sm" style={{ width:22, height:22, fontSize:9 }}>{avatar(s.nombre)}</div>
                    <span style={{ fontWeight:500 }}>{s.nombre}</span>
                    <span className={`practice-chip chip-${s.practica}`} style={{ fontSize:9.5, padding:'1px 5px' }}>{s.practica}</span>
                    <button className="pill-x" title="Quitar de este/a profesor/a"
                            onClick={e => { e.stopPropagation(); unassign(s); }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buscador y asignación de estudiantes */}
            <AssignStudentsCard prof={selProf} profs={profs} students={students}
                                saveStudent={saveStudent} toast={toast}
                                picked={picked}
                                dragStudent={dragStudent} setDragStudent={setDragStudent}
                                onDragEnd={() => { setDragStudent(null); setDragOverProf(null); setDragOverSelf(false); }} />
          </div>
        )}
      </div>

      {showAdd && (
        <ProfModal
          initial={editProf}
          onSave={p => { saveProf(p); toast(editProf ? 'Profesor actualizado' : 'Profesor agregado'); setShowAdd(false); setEditProf(null); if (!editProf) setSel(p.id || DB.getProfs().slice(-1)[0]?.id); }}
          onClose={() => { setShowAdd(false); setEditProf(null); }}
        />
      )}
    </div>
  );
}

function ProfModal({ initial, onSave, onClose }) {
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const ScheduleEditor = window.ScheduleEditor;
  const [form, setForm] = useState(initial || { nombre:'', email:'', practicasAsignadas:[], horasAsignadas:0, disponibilidad:[] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = code => {
    const arr = form.practicasAsignadas || [];
    set('practicasAsignadas', arr.includes(code) ? arr.filter(c=>c!==code) : [...arr, code]);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? 'Editar profesor/a' : 'Agregar profesor/a'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 140px', gap:10 }}>
            <div className="form-field"><label>Nombre completo</label><input value={form.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Prof. Nombre Apellido"/></div>
            <div className="form-field"><label>Horas asignadas</label><input type="number" min="0" value={form.horasAsignadas ?? 0} onChange={e=>set('horasAsignadas', Math.max(0, parseInt(e.target.value)||0))} placeholder="0"/></div>
          </div>
          <div className="form-field"><label>Correo institucional</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="nombre@usach.cl"/></div>
          <div className="form-field">
            <label>Prácticas asignadas</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
              {PRACS.map(code => {
                const on = (form.practicasAsignadas||[]).includes(code);
                return <button key={code} type="button" className={`toggle-btn ${on?'on':''}`} style={{ padding:'6px 12px', fontSize:12 }} onClick={() => toggle(code)}>{code}</button>;
              })}
            </div>
          </div>
          <div className="form-divider">Disponibilidad horaria</div>
          <ScheduleEditor blocks={form.disponibilidad||[]} onChange={v => set('disponibilidad', v)} />
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { if (!form.nombre||!form.email) return; onSave({ ...form, horasAsignadas: parseInt(form.horasAsignadas)||0 }); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Buscador + asignación de estudiantes al profesor/a seleccionado/a ──
const normTxt = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function AssignStudentsCard({ prof, profs, students, saveStudent, toast, picked, dragStudent, setDragStudent, onDragEnd }) {
  const PNAMES = window.PRACTICE_NAMES || {};
  const PAGE = 40;
  const pracs = prof.practicasAsignadas || [];
  const [q, setQ] = useState('');
  const [fPrac, setFPrac] = useState('');        // '' = todas las que imparte
  const [fEstado, setFEstado] = useState('sin'); // sin | otro | todos
  const [checked, setChecked] = useState([]);
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => { setChecked([]); setFPrac(''); setLimit(PAGE); }, [prof.id]);
  useEffect(() => { setLimit(PAGE); }, [q, fPrac, fEstado]);

  const profById = Object.fromEntries(profs.map(p => [p.id, p]));
  const hasProf = (s) => !!(s.profesorId && profById[s.profesorId]);
  const short = (n) => (n || '').replace('Prof. ', '');
  const avatar = (n) => n.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  const cleanRut = (t) => normTxt(t).replace(/[.\-\s]/g, '');

  // Universo: estudiantes de las prácticas que imparte y que aún no están con él/ella
  const base = students.filter(s => pracs.includes(s.practica) && s.profesorId !== prof.id)
                       .filter(s => !fPrac || s.practica === fPrac);
  const countSin = base.filter(s => !hasProf(s)).length;
  const countOtro = base.length - countSin;
  const nq = normTxt(q).trim();
  const nqRut = cleanRut(q);
  const list = base
    .filter(s => fEstado === 'todos' || (fEstado === 'sin' ? !hasProf(s) : hasProf(s)))
    .filter(s => !nq
      || normTxt(s.nombre).includes(nq)
      || normTxt(s.email).includes(nq)
      || (nqRut && cleanRut(s.rut).includes(nqRut))
      || normTxt(s.centro).includes(nq)
      || normTxt(short(profById[s.profesorId]?.nombre)).includes(nq))
    .sort((a, b) => (hasProf(a) - hasProf(b)) || a.nombre.localeCompare(b.nombre, 'es'));
  const shown = list.slice(0, limit);
  const checkedSet = new Set(checked);
  const allShownChecked = shown.length > 0 && shown.every(s => checkedSet.has(s.id));

  const toggleCheck = (id) => setChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  const toggleAll = () => setChecked(allShownChecked
    ? checked.filter(id => !shown.some(s => s.id === id))
    : [...new Set([...checked, ...shown.map(s => s.id)])]);

  const assignOne = (s) => {
    saveStudent({ ...s, profesorId: prof.id });
    setChecked(c => c.filter(x => x !== s.id));
    toast(`${s.nombre} asignado/a a ${short(prof.nombre)}`);
  };
  const assignChecked = () => {
    const sel = students.filter(s => checkedSet.has(s.id) && s.profesorId !== prof.id && pracs.includes(s.practica));
    if (!sel.length) { setChecked([]); return; }
    const moving = sel.filter(hasProf).length;
    if (moving && !window.confirm(`${moving} de los ${sel.length} estudiantes ya tienen otro/a profesor/a. ¿Reasignarlos a ${short(prof.nombre)}?`)) return;
    sel.forEach(s => saveStudent({ ...s, profesorId: prof.id }));
    setChecked([]);
    toast(`${sel.length} estudiante${sel.length!==1?'s':''} asignado${sel.length!==1?'s':''} a ${short(prof.nombre)}`);
  };

  const chip = (on, label, onClick, key) => (
    <button key={key} type="button" className={`filter-chip ${on ? 'on' : ''}`} onClick={onClick}>{label}</button>
  );

  return (
    <div className="card" style={{ padding:'14px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
        <div style={{ fontWeight:700, fontSize:14 }}>Asignar estudiantes</div>
        {pracs.length > 0 && <span className="tag" style={{ marginLeft:'auto' }}>{countSin} sin profesor/a</span>}
      </div>
      <div className="muted" style={{ fontSize:12, marginBottom:12 }}>
        Busca entre los estudiantes de las prácticas que imparte {short(prof.nombre)}. Pulsa «Asignar» en una fila, o marca varias y asígnalas juntas.
      </div>

      {pracs.length === 0 ? (
        <div className="muted" style={{ fontSize:13 }}>Activa al menos una práctica arriba para poder asignarle estudiantes.</div>
      ) : (<>
        <div className="assign-search">
          <span className="assign-search-ic">⌕</span>
          <input value={q} onChange={e => setQ(e.target.value)} autoComplete="off"
                 placeholder="Buscar por nombre, RUT, correo, centro o profesor/a actual…"
                 onKeyDown={e => { if (e.key === 'Escape') setQ(''); }} />
          {q && <button type="button" className="assign-search-x" onClick={() => setQ('')} title="Limpiar búsqueda">×</button>}
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center', margin:'10px 0 6px' }}>
          <span className="muted" style={{ fontSize:11.5, marginRight:2 }}>Práctica:</span>
          {pracs.length > 1 && chip(!fPrac, 'Todas', () => setFPrac(''), '_all')}
          {pracs.map(c => chip(fPrac === c || pracs.length === 1,
            <>{c}{PNAMES[c] && <span className="filter-chip-sub"> · {PNAMES[c]}</span>}</>,
            () => setFPrac(fPrac === c ? '' : c), c))}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center', marginBottom:12 }}>
          <span className="muted" style={{ fontSize:11.5, marginRight:2 }}>Estado:</span>
          {chip(fEstado === 'sin',   `Sin profesor/a (${countSin})`,          () => setFEstado('sin'),   'sin')}
          {chip(fEstado === 'otro',  `Con otro/a profesor/a (${countOtro})`,  () => setFEstado('otro'),  'otro')}
          {chip(fEstado === 'todos', `Todos (${base.length})`,                () => setFEstado('todos'), 'todos')}
        </div>

        <div className="assign-bar">
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, cursor: shown.length ? 'pointer' : 'default' }}>
            <input type="checkbox" checked={allShownChecked} disabled={!shown.length} onChange={toggleAll} style={{ margin:0, width:'auto' }} />
            Seleccionar visibles
          </label>
          <span className="muted" style={{ fontSize:12 }}>{list.length} resultado{list.length!==1?'s':''}</span>
          {checked.length > 0 && <>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => setChecked([])}>Desmarcar</button>
            <button className="btn btn-primary btn-sm" onClick={assignChecked}>Asignar {checked.length} seleccionado{checked.length!==1?'s':''}</button>
          </>}
        </div>

        {list.length === 0 ? (
          <div className="muted" style={{ fontSize:13, padding:'18px 4px', textAlign:'center' }}>
            {nq ? `Ningún estudiante coincide con «${q}».`
                : fEstado === 'sin' ? 'No quedan estudiantes sin profesor/a en estas prácticas.'
                : 'No hay estudiantes con estos filtros.'}
          </div>
        ) : (
          <div className="assign-list">
            {shown.map(s => {
              const cur = profById[s.profesorId];
              const on = checkedSet.has(s.id);
              return (
                <div key={s.id} className={`assign-row ${on ? 'checked' : ''} ${picked?.id===s.id ? 'picked' : ''} ${dragStudent?.id===s.id ? 'dragging' : ''}`}
                     draggable
                     onClick={() => toggleCheck(s.id)}
                     onDragStart={e => { setDragStudent(s); e.dataTransfer.effectAllowed='move'; try { e.dataTransfer.setData('text/plain', s.id); } catch(err){} }}
                     onDragEnd={onDragEnd}
                     title="Clic para marcar · o arrastra hacia un/a profesor/a">
                  <input type="checkbox" checked={on} readOnly tabIndex={-1} style={{ margin:0, width:'auto', pointerEvents:'none' }} />
                  <div className="avatar-sm" style={{ width:28, height:28, fontSize:10 }}>{avatar(s.nombre)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--ink-900)' }}>{s.nombre}</div>
                    <div className="muted" style={{ fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {[s.rut, s.cohorte && ('Cohorte ' + s.cohorte), s.centro].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <span className={`practice-chip chip-${s.practica}`} style={{ fontSize:10, padding:'1px 6px' }}>{s.practica}</span>
                  <span className={`assign-cur ${cur ? '' : 'none'}`}>{cur ? short(cur.nombre) : 'Sin profesor/a'}</span>
                  <button className="btn btn-sm btn-primary" style={{ padding:'3px 10px', whiteSpace:'nowrap' }}
                          onClick={e => { e.stopPropagation(); assignOne(s); }}>{cur ? 'Mover aquí' : 'Asignar'}</button>
                </div>
              );
            })}
            {list.length > shown.length && (
              <button className="btn btn-ghost btn-sm" style={{ alignSelf:'center', marginTop:6 }} onClick={() => setLimit(l => l + PAGE)}>
                Mostrar más ({list.length - shown.length} restantes)
              </button>
            )}
          </div>
        )}
      </>)}
    </div>
  );
}

// ─── Carga horaria (edición inline) ─────────────────────────────────
function HorasCard({ prof, saveProf, toast }) {
  const [val, setVal] = useState(prof.horasAsignadas ?? 0);
  useEffect(() => { setVal(prof.horasAsignadas ?? 0); }, [prof.id]);
  const commit = () => {
    const h = Math.max(0, parseInt(val) || 0);
    if (h === (prof.horasAsignadas ?? 0)) return;
    saveProf({ ...prof, horasAsignadas: h });
    toast(`Horas actualizadas a ${h}h`);
  };
  return (
    <div className="card" style={{ padding:'16px 20px' }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>Carga horaria semanal</div>
      <div className="muted" style={{ fontSize:11.5, marginBottom:10 }}>Horas asignadas (carga manual)</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
        <input type="number" min="0" value={val}
               onChange={e => setVal(e.target.value)}
               onBlur={commit}
               onKeyDown={e => { if (e.key==='Enter') e.target.blur(); }}
               style={{ width:84, padding:'8px 10px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:22, fontWeight:800, color:'var(--teal-600)', fontVariantNumeric:'tabular-nums' }} />
        <span style={{ fontSize:15, fontWeight:700, color:'var(--ink-500)' }}>horas</span>
      </div>
    </div>
  );
}

// ─── Disponibilidad horaria (edición inline) ──────────────────────────
function DispoCard({ prof, saveProf, toast }) {
  const ScheduleEditor = window.ScheduleEditor;
  const [blocks, setBlocks] = useState(prof.disponibilidad || []);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setBlocks(prof.disponibilidad || []); setDirty(false); }, [prof.id]);
  return (
    <div className="card" style={{ padding:'16px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ fontWeight:700, fontSize:14 }}>Disponibilidad horaria</div>
        <span className="muted" style={{ fontSize:11.5 }}>(se cruza con los horarios de los centros)</span>
        {dirty && <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }} onClick={() => { saveProf({ ...prof, disponibilidad: blocks }); setDirty(false); toast('Disponibilidad actualizada'); }}>Guardar</button>}
      </div>
      <ScheduleEditor blocks={blocks} onChange={b => { setBlocks(b); setDirty(true); }} />
    </div>
  );
}

Object.assign(window, { AsignacionesScreen });
