// coord-usuarios.jsx — Gestión de cuentas (Auth + Firestore /usuarios)
// El coordinador da de alta a profesores: crea su cuenta de acceso y su rol.

function UsuariosScreen({ ctx }) {
  const { toast } = ctx;
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const isFB = window.CLOUD && window.CLOUD.isFirebase;

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const reload = () => {
    setLoading(true);
    (window.CLOUD ? window.CLOUD.listUsuarios() : Promise.resolve([]))
      .then(list => { setUsuarios(list); setLoading(false); })
      .catch(err => { toast('No se pudieron cargar los usuarios: ' + err.message, 'error'); setLoading(false); });
  };
  useEffect(reload, []);

  const onDelete = (u) => {
    if (!confirm(`¿Quitar el acceso de ${u.nombre || u.email}?\n\nNota: esto elimina su ROL. La cuenta de inicio de sesión se borra desde la consola de Firebase Authentication.`)) return;
    window.CLOUD.deleteUsuarioDoc(u.uid).then(() => { toast('Acceso eliminado'); reload(); })
      .catch(err => toast('Error: ' + err.message, 'error'));
  };
  const onReset = (u) => {
    window.CLOUD.sendReset(u.email).then(() => toast(`Correo de restablecimiento enviado a ${u.email}`))
      .catch(err => toast('Error: ' + err.message, 'error'));
  };

  const coords = usuarios.filter(u => u.rol === 'coordinador');
  const profes = usuarios.filter(u => u.rol !== 'coordinador');
  const avatar = n => (n||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

  const Row = ({ u }) => (
    <div className="prof-row" style={{ gridTemplateColumns:'1fr auto auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
        <div className="avatar-sm" style={{ width:34, height:34, fontSize:12, flexShrink:0 }}>{avatar(u.nombre)}</div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.nombre || '—'}</div>
          <div className="muted" style={{ fontSize:12.5 }}>{u.email}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center', justifyContent:'flex-end' }}>
        {u.rol === 'coordinador'
          ? <span className="practice-chip chip-IV" style={{ fontSize:10.5 }}>Coordinador/a</span>
          : (u.practicasAsignadas && u.practicasAsignadas.length
              ? u.practicasAsignadas.map(p => <span key={p} className={`practice-chip chip-${p}`} style={{ fontSize:10 }}>{p}</span>)
              : <span className="muted" style={{ fontSize:11.5 }}>Sin prácticas</span>)}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {isFB && <button className="btn btn-ghost btn-sm" title="Enviar correo de restablecimiento" onClick={() => onReset(u)}>Reset clave</button>}
        <button className="btn btn-ghost btn-sm" style={{ color:'#dc2626' }} onClick={() => onDelete(u)}>Quitar</button>
      </div>
    </div>
  );

  return (
    <div data-screen-label="Usuarios">
      <div className="section-head">
        <div>
          <h1>Usuarios y accesos</h1>
          <div className="subtitle">{usuarios.length} cuenta{usuarios.length!==1?'s':''} · {coords.length} coordinación · {profes.length} profesores</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Nuevo profesor</button>
      </div>

      {!isFB && (
        <div style={{ padding:'12px 16px', background:'rgba(255,152,0,.12)', border:'1px solid #ffcc80', borderRadius:10, marginBottom:18, fontSize:13, color:'#a15c00', lineHeight:1.45 }}>
          <strong>⬡ Modo demo.</strong> Los usuarios creados aquí se guardan solo en este navegador. Conecta Firebase (ver <em>README</em>) para crear cuentas reales de inicio de sesión.
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--ink-400)' }}>Cargando usuarios…</div>
      ) : (
        <>
          <div className="nav-section-label" style={{ margin:'4px 0 8px', color:'var(--ink-500)' }}>COORDINACIÓN</div>
          <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:20 }}>
            {coords.length ? coords.map(u => <Row key={u.uid} u={u} />)
              : <div style={{ padding:24, textAlign:'center', color:'var(--ink-400)', fontSize:13 }}>Sin coordinadores registrados. Crea el primero desde la consola de Firebase (ver README).</div>}
          </div>

          <div className="nav-section-label" style={{ margin:'4px 0 8px', color:'var(--ink-500)' }}>PROFESORES</div>
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {profes.length ? profes.map(u => <Row key={u.uid} u={u} />)
              : <div style={{ padding:24, textAlign:'center', color:'var(--ink-400)', fontSize:13 }}>Aún no hay profesores. Usa <strong>+ Nuevo profesor</strong> para crear el primer acceso.</div>}
          </div>
        </>
      )}

      {showAdd && <NuevoUsuarioModal PRACS={PRACS} onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); reload(); }} toast={toast} />}
    </div>
  );
}

function NuevoUsuarioModal({ PRACS, onClose, onCreated, toast }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pracs, setPracs] = useState([]);
  const [busy, setBusy] = useState(false);

  const genPw = () => {
    const s = 'usach-' + Math.random().toString(36).slice(2, 8);
    setPw(s);
  };
  const togglePrac = (p) => setPracs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const submit = () => {
    if (!nombre.trim() || !email.trim() || pw.length < 6) { toast('Completa nombre, correo y una contraseña de 6+ caracteres.', 'error'); return; }
    setBusy(true);
    window.CLOUD.createUser({
      email: email.trim().toLowerCase(), password: pw,
      nombre: nombre.trim().startsWith('Prof.') ? nombre.trim() : 'Prof. ' + nombre.trim(),
      rol: 'profesor', practicasAsignadas: pracs,
    }).then(() => {
      toast(`Profesor ${nombre} creado. Comparte la contraseña: ${pw}`);
      onCreated();
    }).catch(err => {
      const m = /email-already-in-use/.test(err.code || err.message) ? 'Ya existe una cuenta con ese correo.'
        : /invalid-email/.test(err.code || err.message) ? 'El correo no es válido.'
        : err.message;
      toast('Error: ' + m, 'error');
      setBusy(false);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:480 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Nuevo profesor</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="form-field"><label>Nombre completo</label>
            <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Andrés Tapia Vergara" autoFocus/>
          </div>
          <div className="form-field"><label>Correo institucional</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nombre@usach.cl"/>
          </div>
          <div className="form-field"><label>Contraseña inicial</label>
            <div style={{ display:'flex', gap:8 }}>
              <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ flex:1 }}/>
              <button type="button" className="btn btn-ghost btn-sm" onClick={genPw}>Generar</button>
            </div>
            <div className="muted" style={{ fontSize:11.5, marginTop:4 }}>El profesor podrá cambiarla luego con “¿Olvidaste tu contraseña?”.</div>
          </div>
          <div className="form-field"><label>Prácticas que imparte</label>
            <div className="toggle-grid">
              {PRACS.map(p => (
                <button key={p} type="button" className={`toggle-btn ${pracs.includes(p)?'on':''}`} onClick={() => togglePrac(p)}>
                  Práctica {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Creando…' : 'Crear acceso'}</button>
        </div>
      </div>
    </div>
  );
}

window.UsuariosScreen = UsuariosScreen;
