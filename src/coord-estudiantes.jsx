// coord-estudiantes.jsx — Gestión de estudiantes + CSV import

function EstudiantesCoordScreen({ ctx }) {
  const { profs, students, saveStudent, deleteStudent, importStudents, toast } = ctx;
  const [q, setQ] = useState('');
  const [fPrac, setFPrac] = useState('');
  const [fProf, setFProf] = useState('');
  const [fCoh, setFCoh] = useState('');
  const [page, setPage] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editSt, setEditSt] = useState(null);
  const [moving, setMoving] = useState(null);
  const [importing, setImporting] = useState(false);
  const PAGE = 15;

  useEffect(() => {
    const np = ctx.navParams || {};
    if (np.cohorte != null) { setFCoh(String(np.cohorte)); setPage(0); }
    if (np.profId) { setFProf(np.profId); setPage(0); }
  }, [ctx.navParams]);

  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const cohortes = [...new Set(students.map(s => s.cohorte).filter(Boolean))].sort();

  const filtered = students.filter(s => {
    if (fPrac && s.practica !== fPrac) return false;
    if (fProf && s.profesorId !== fProf) return false;
    if (fCoh && String(s.cohorte) !== String(fCoh)) return false;
    if (q) {
      const lq = q.toLowerCase();
      if (!s.nombre.toLowerCase().includes(lq) && !s.rut.toLowerCase().includes(lq) && !(s.email||'').toLowerCase().includes(lq)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE);
  const visible = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const profName = id => profs.find(p=>p.id===id)?.nombre || '—';
  const avatar = n => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
      if (lines.length < 2) { toast('CSV vacío o sin filas de datos','error'); return; }
      const headers = lines[0].split(/[,;]/).map(h=>h.trim().toLowerCase().replace(/["\r]/g,''));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(/[,;]/).map(v=>v.trim().replace(/["\r]/g,''));
        const obj = {};
        headers.forEach((h,i) => { obj[h] = vals[i]||''; });
        return obj;
      }).filter(r => r.nombre || r.name);
      if (rows.length === 0) { toast('No se encontraron filas válidas','error'); return; }
      // Map fields
      const normalized = rows.map(r => ({
        nombre:  r.nombre || r.name || '',
        rut:     r.rut || r['rut/run'] || '',
        email:   r.email || r.correo || '',
        telefono:r.telefono || r.tel || '',
        cohorte: parseInt(r.cohorte || r.año || r.year) || new Date().getFullYear(),
        practica:r.practica || fPrac || 'I',
        profesorId: r.profesorid || r.profesor || fProf || '',
        area:    r.area || null,
        centro:  r.centro || r.institucion || '',
      })).filter(r => r.nombre);
      importStudents(normalized, fProf || '', fPrac || 'I');
      toast(`${normalized.length} estudiante${normalized.length!==1?'s':''} importados desde CSV`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const sep = ';';
    const q2 = s => `"${String(s||'').replace(/"/g,'""')}"`;
    const rows = [
      ['Nombre','RUT','Email','Teléfono','Cohorte','Práctica','Área','Profesor/a','Centro'].map(q2).join(sep),
      ...filtered.map(s => [
        s.nombre, s.rut, s.email, s.telefono||'', s.cohorte,
        s.practica, s.area||'', profName(s.profesorId), s.centro||'',
      ].map(q2).join(sep)),
    ];
    const blob = new Blob(['\uFEFF'+rows.join('\r\n')], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='Estudiantes_USACH.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Nómina exportada como CSV');
  };

  return (
    <div data-screen-label="Estudiantes">
      <div className="section-head">
        <div>
          <h1>Estudiantes</h1>
          <div className="subtitle">{students.length} inscritos · {total !== students.length ? `${total} filtrados` : ''}</div>
        </div>
        <div className="actions">
          <label className="btn btn-secondary" style={{ cursor:'pointer' }}>
            ⬆ Importar CSV
            <input type="file" accept=".csv,.txt" style={{ display:'none' }} onChange={handleCSV}/>
          </label>
          <button className="btn btn-secondary" onClick={exportCSV}>⬇ Exportar CSV</button>
          <button className="btn btn-primary" onClick={() => { setEditSt(null); setShowAdd(true); }}>+ Agregar</button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ marginBottom:16 }}>
        <div style={{ position:'relative', flex:'1 1 200px' }}>
          <input placeholder="Buscar nombre, RUT o correo…" value={q} onChange={e=>{setQ(e.target.value);setPage(0);}} style={{ paddingLeft:32 }}/>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)', pointerEvents:'none' }}>🔍</span>
        </div>
        <select value={fPrac} onChange={e=>{setFPrac(e.target.value);setPage(0);}}>
          <option value="">Todas las prácticas</option>
          {PRACS.map(p => <option key={p} value={p}>Práctica {p}</option>)}
        </select>
        <select value={fProf} onChange={e=>{setFProf(e.target.value);setPage(0);}}>
          <option value="">Todos los profesores</option>
          {profs.map(p => <option key={p.id} value={p.id}>{p.nombre.replace('Prof. ','')}</option>)}
        </select>
        <select value={fCoh} onChange={e=>{setFCoh(e.target.value);setPage(0);}}>
          <option value="">Todas las cohortes</option>
          {cohortes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(q||fPrac||fProf||fCoh) && <button className="btn btn-ghost btn-sm" onClick={()=>{setQ('');setFPrac('');setFProf('');setFCoh('');setPage(0);}}>✕ Limpiar</button>}
      </div>

      {/* CSV hint */}
      <div style={{ fontSize:12, color:'var(--ink-400)', marginBottom:10, padding:'8px 12px', background:'var(--surface-1)', borderRadius:8 }}>
        <strong>Formato CSV para importación:</strong> columnas Nombre, RUT, Email, Cohorte, Práctica, Centro — separadas por coma o punto y coma.
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden', overflowX:'auto' }}>
        {/* Header */}
        <div className="student-row student-head" style={{ background:'var(--surface-1)', borderBottom:'1px solid var(--border)', minWidth:480 }}>
          <span>Estudiante</span>
          <span>Cohorte</span>
          <span>Práctica</span>
          <span>Profesor/a</span>
          <span>Centro</span>
          <span></span>
        </div>
        {visible.length === 0 && (
          <div className="muted" style={{ padding:32, textAlign:'center', fontSize:13 }}>Sin estudiantes con los filtros actuales.</div>
        )}
        {visible.map(s => (
          <div key={s.id} className="student-row" style={{ minWidth:480 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div className="avatar-sm" style={{ width:26, height:26, fontSize:10 }}>{avatar(s.nombre)}</div>
              <div>
                <div style={{ fontWeight:500, fontSize:13 }}>{s.nombre}</div>
                <div className="muted" style={{ fontSize:11 }}>{s.rut}</div>
              </div>
            </div>
            <span style={{ fontWeight:500 }}>{s.cohorte}</span>
            <span><span className={`practice-chip chip-${s.practica}`}>{s.practica}</span></span>
            <span className="muted" style={{ fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{profName(s.profesorId).replace('Prof. ','')}</span>
            <span className="muted" style={{ fontSize:12 }}>{s.centro||'—'}</span>
            <div style={{ display:'flex', gap:4 }}>
              <button className="btn btn-ghost btn-sm" title="Editar" onClick={()=>{setEditSt({...s});setShowAdd(true);}}>✏</button>
              <button className="btn btn-ghost btn-sm" title="Reasignar" onClick={()=>setMoving({...s})}>⇄</button>
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--err)' }} title="Eliminar"
                      onClick={()=>{ if(window.confirm(`¿Eliminar a ${s.nombre}?`)) { deleteStudent(s.id); toast('Estudiante eliminado'); } }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display:'flex', gap:8, marginTop:12, alignItems:'center', justifyContent:'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Anterior</button>
          <span className="muted" style={{ fontSize:13 }}>Página {page+1} de {pages} ({total} total)</span>
          <button className="btn btn-ghost btn-sm" disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)}>Siguiente →</button>
        </div>
      )}

      {showAdd && (
        <StudentModal initial={editSt} profs={profs}
          onSave={s => { saveStudent(s); toast(editSt?'Estudiante actualizado':'Estudiante agregado'); setShowAdd(false); setEditSt(null); }}
          onClose={() => { setShowAdd(false); setEditSt(null); }}
        />
      )}
      {moving && (
        <MoveModal student={moving} profs={profs}
          onSave={s => { saveStudent(s); toast(`${s.nombre} reasignado/a`); setMoving(null); }}
          onClose={() => setMoving(null)}
        />
      )}
    </div>
  );
}

function StudentModal({ initial, profs, onSave, onClose }) {
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const [f, setF] = useState(initial || { nombre:'', rut:'', email:'', telefono:'', cohorte:2024, practica:'I', profesorId: profs[0]?.id||'', area:null, centro:'' });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>{initial?'Editar estudiante':'Agregar estudiante'}</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-field" style={{ gridColumn:'1/-1' }}><label>Nombre completo</label><input value={f.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Nombre Apellido"/></div>
            <div className="form-field"><label>RUT</label><input value={f.rut} onChange={e=>set('rut',e.target.value)} placeholder="12.345.678-9"/></div>
            <div className="form-field"><label>Cohorte (año ingreso)</label><input type="number" value={f.cohorte} onChange={e=>set('cohorte',parseInt(e.target.value)||new Date().getFullYear())} min="2018" max="2030"/></div>
            <div className="form-field" style={{ gridColumn:'1/-1' }}><label>Correo</label><input type="email" value={f.email||''} onChange={e=>set('email',e.target.value)} placeholder="nombre@usach.cl"/></div>
            <div className="form-field"><label>Práctica</label>
              <select value={f.practica} onChange={e=>set('practica',e.target.value)}>
                {PRACS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Profesor/a</label>
              <select value={f.profesorId} onChange={e=>set('profesorId',e.target.value)}>
                {profs.filter(p=>(p.practicasAsignadas||[]).includes(f.practica)||!f.practica).map(p=><option key={p.id} value={p.id}>{p.nombre.replace('Prof. ','')}</option>)}
                {profs.filter(p=>(p.practicasAsignadas||[]).includes(f.practica)).length===0 && profs.map(p=><option key={p.id} value={p.id}>{p.nombre.replace('Prof. ','')}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn:'1/-1' }}><label>Centro de práctica</label><input value={f.centro||''} onChange={e=>set('centro',e.target.value)} placeholder="Nombre del centro"/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>{ if(!f.nombre||!f.rut) return; onSave(f); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function MoveModal({ student, profs, onSave, onClose }) {
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const [practica, setPractica] = useState(student.practica);
  const [profesorId, setProfesorId] = useState(student.profesorId);
  const elegibles = profs.filter(p => (p.practicasAsignadas||[]).includes(practica));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Reasignar estudiante</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{ fontWeight:600, marginBottom:14, color:'var(--ink-700)' }}>{student.nombre}</div>
          <div className="form-field"><label>Nueva práctica</label>
            <select value={practica} onChange={e=>{ setPractica(e.target.value); setProfesorId(profs.find(p=>(p.practicasAsignadas||[]).includes(e.target.value))?.id||''); }}>
              {PRACS.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-field"><label>Nuevo/a profesor/a</label>
            <select value={profesorId} onChange={e=>setProfesorId(e.target.value)}>
              {(elegibles.length>0?elegibles:profs).map(p=><option key={p.id} value={p.id}>{p.nombre.replace('Prof. ','')}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave({...student,practica,profesorId})}>Reasignar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EstudiantesCoordScreen });
