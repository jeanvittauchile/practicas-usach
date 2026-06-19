// coord-visitas.jsx — Galería de visitas en terreno (coordinadora)

function CoordVisitasScreen({ ctx }) {
  const { profs, toast } = ctx;
  const VISITAS_KEY = 'usach_visitas_v1';
  const readAll  = () => { try { return JSON.parse(localStorage.getItem(VISITAS_KEY) || '[]') || []; } catch { return []; } };
  const writeAll = (arr) => { try { localStorage.setItem(VISITAS_KEY, JSON.stringify(arr)); } catch {} };

  const [visitas, setVisitas] = useState(readAll());
  const [fProf, setFProf] = useState('');
  const [fPrac, setFPrac] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const reload = () => setVisitas(readAll());

  const delVisita = (id) => { writeAll(readAll().filter(v => v.id !== id)); reload(); toast('Visita eliminada'); };

  const filtered = visitas.filter(v => {
    if (fProf && v.autorEmail !== fProf) return false;
    if (fPrac && v.practica !== fPrac) return false;
    return true;
  }).sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const autores = [...new Map(visitas.map(v => [v.autorEmail, { email: v.autorEmail, nombre: v.autorNombre }])).values()];
  const fmtFecha = iso => { if (!iso) return '—'; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
  const avatar = n => (n || '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

  // Agrupado por profesor
  const byProf = filtered.reduce((acc, v) => {
    const k = v.autorEmail || v.autorNombre || 'Sin nombre';
    if (!acc[k]) acc[k] = { nombre: v.autorNombre, email: v.autorEmail, items: [] };
    acc[k].items.push(v);
    return acc;
  }, {});

  return (
    <div data-screen-label="Visitas en terreno">
      <div className="section-head">
        <div>
          <h1>Visitas en terreno</h1>
          <div className="subtitle">{visitas.length} foto{visitas.length !== 1 ? 's' : ''} · subidas por los profesores desde su plataforma</div>
        </div>
        <button className="btn btn-secondary" onClick={reload}>↻ Actualizar</button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ padding:'12px 16px', marginBottom:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <select value={fProf} onChange={e => setFProf(e.target.value)} style={{ padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'var(--bg)', color:'var(--ink-900)', minWidth:200 }}>
          <option value="">Todos los profesores</option>
          {autores.map(a => <option key={a.email} value={a.email}>{a.nombre || a.email}</option>)}
        </select>
        <select value={fPrac} onChange={e => setFPrac(e.target.value)} style={{ padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'var(--bg)', color:'var(--ink-900)' }}>
          <option value="">Todas las prácticas</option>
          {PRACS.map(p => <option key={p} value={p}>Práctica {p}</option>)}
        </select>
        <span className="muted" style={{ fontSize:13, marginLeft:'auto' }}>{filtered.length} foto{filtered.length!==1?'s':''}</span>
      </div>

      {visitas.length === 0 ? (
        <div className="card" style={{ padding:48, textAlign:'center', color:'var(--ink-400)' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📷</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Sin visitas registradas</div>
          <div className="muted" style={{ fontSize:13 }}>Los profesores subirán fotos desde la pestaña "Visitas en terreno" de su plataforma.</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding:32, textAlign:'center', color:'var(--ink-400)' }}>
          <div className="muted" style={{ fontSize:13 }}>Sin fotos con esos filtros.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
          {Object.values(byProf).map(group => (
            <div key={group.email}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div className="avatar-sm" style={{ width:30, height:30, fontSize:11 }}>{avatar(group.nombre)}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{group.nombre || group.email}</div>
                  <div className="muted" style={{ fontSize:11.5 }}>{group.email} · {group.items.length} foto{group.items.length!==1?'s':''}</div>
                </div>
              </div>
              <div className="coord-vis-grid">
                {group.items.map(v => (
                  <div key={v.id} className="vis-card">
                    <div className="vis-img-wrap" onClick={() => setLightbox(v)}>
                      <img src={v.dataUrl} alt={v.caption || 'Visita'} className="vis-img" />
                      <div className="vis-img-overlay">🔍 Ver</div>
                    </div>
                    <div className="vis-card-body">
                      <div className="vis-caption">{v.caption || 'Sin descripción'}</div>
                      <div className="vis-meta">
                        <span>📅 {fmtFecha(v.fecha)}</span>
                        {v.centro && <span>🏢 {v.centro}</span>}
                        <span className={`practice-chip chip-${v.practica}`} style={{ fontSize:10 }}>{v.practica}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--err)', fontSize:11, padding:'2px 6px' }}
                                onClick={() => { if (window.confirm('¿Eliminar esta visita?')) delVisita(v.id); }}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="vis-lightbox" onClick={() => setLightbox(null)}>
          <div className="vis-lb-box" onClick={e => e.stopPropagation()}>
            <button className="vis-lb-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.dataUrl} alt={lightbox.caption} className="vis-lb-img" />
            <div className="vis-lb-info">
              <div style={{ fontWeight:700, fontSize:15 }}>{lightbox.caption || 'Sin descripción'}</div>
              <div className="muted" style={{ fontSize:12.5, marginTop:4 }}>
                {fmtFecha(lightbox.fecha)}{lightbox.centro ? ` · ${lightbox.centro}` : ''} · {lightbox.autorNombre}
                <span className={`practice-chip chip-${lightbox.practica}`} style={{ fontSize:10, marginLeft:8 }}>{lightbox.practica}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CoordVisitasScreen });
