// screens-visitas.jsx — Visitas en terreno (upload de fotos para el profesor)

const { useState, useEffect, useRef } = React;

function VisitasScreen({ ctx }) {
  const auth = window.__authUser || {};
  const VISITAS_KEY = 'usach_visitas_v1';
  const practica = window.USACH_DATA?.activeCodigo || 'I';

  const readAll  = () => { try { return JSON.parse(localStorage.getItem(VISITAS_KEY) || '[]') || []; } catch { return []; } };
  const writeAll = (arr) => { try { localStorage.setItem(VISITAS_KEY, JSON.stringify(arr)); } catch {} };

  const [visitas, setVisitas] = useState(() => readAll());
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const reload = () => setVisitas(readAll());

  // Solo las visitas de esta práctica
  const mine = visitas.filter(v => v.practica === practica);

  const saveVisita = (v) => {
    const arr = readAll();
    arr.push(v);
    writeAll(arr);
    reload();
    ctx.toast('Foto de visita guardada · visible para coordinación');
  };
  const delVisita = (id) => {
    writeAll(readAll().filter(v => v.id !== id));
    reload();
    ctx.toast('Visita eliminada');
  };

  const avatar = n => (n || '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  const fmtFecha = iso => { if (!iso) return '—'; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };

  return (
    <div className="visits-page">
      <div className="vis-header">
        <div>
          <h1 className="vis-title">Visitas en terreno</h1>
          <div className="muted" style={{ fontSize:13 }}>Sube fotos de tus visitas a los centros · Práctica {practica} · visible para la coordinación</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Agregar visita</button>
      </div>

      {mine.length === 0 ? (
        <div className="vis-empty">
          <div style={{ fontSize:36, marginBottom:12 }}>📷</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Sin visitas registradas</div>
          <div className="muted" style={{ fontSize:13 }}>Agrega tu primera foto de visita en terreno.</div>
          <button className="btn btn-primary" style={{ marginTop:18 }} onClick={() => setShowForm(true)}>+ Agregar visita</button>
        </div>
      ) : (
        <div className="vis-grid">
          {mine.map(v => (
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
                </div>
                <div className="vis-footer">
                  <div className="avatar-sm" style={{ width:22, height:22, fontSize:9 }}>{avatar(v.autorNombre)}</div>
                  <span className="muted" style={{ fontSize:11.5, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.autorNombre}</span>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--err)', padding:'2px 6px', fontSize:11 }}
                          onClick={() => { if (window.confirm('¿Eliminar esta visita?')) delVisita(v.id); }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <VisitaFormModal
          auth={auth}
          practica={practica}
          onSave={saveVisita}
          onClose={() => setShowForm(false)}
        />
      )}

      {lightbox && (
        <div className="vis-lightbox" onClick={() => setLightbox(null)}>
          <div className="vis-lb-box" onClick={e => e.stopPropagation()}>
            <button className="vis-lb-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.dataUrl} alt={lightbox.caption} className="vis-lb-img" />
            <div className="vis-lb-info">
              <div style={{ fontWeight:700, fontSize:15 }}>{lightbox.caption || 'Sin descripción'}</div>
              <div className="muted" style={{ fontSize:12.5, marginTop:4 }}>
                {fmtFecha(lightbox.fecha)}{lightbox.centro ? ` · ${lightbox.centro}` : ''} · {lightbox.autorNombre}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal de carga de visita ──────────────────────────────────────────────
function VisitaFormModal({ auth, practica, onSave, onClose }) {
  const [caption, setCaption] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [centro, setCentro] = useState('');
  const [preview, setPreview] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo se aceptan imágenes.'); return; }
    if (file.size > 8 * 1024 * 1024) { alert('La imagen no debe superar 8 MB.'); return; }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Comprimir a max 1200px para no saturar localStorage
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const url = c.toDataURL('image/jpeg', 0.78);
        setPreview(url); setDataUrl(url); setLoading(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!dataUrl) return;
    onSave({
      id: 'vis_' + Date.now(),
      practica,
      autorEmail: auth.email || '',
      autorNombre: auth.nombre || auth.email || 'Profesor/a',
      fecha,
      centro,
      caption,
      dataUrl,
      ts: Date.now(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Registrar visita en terreno</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Zona de carga de imagen */}
          <div className="vis-drop-zone" onClick={() => inputRef.current?.click()}
               onDragOver={e => e.preventDefault()}
               onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { inputRef.current.files = e.dataTransfer.files; onFile({ target: { files: e.dataTransfer.files } }); } }}>
            {loading && <div className="muted" style={{ textAlign:'center' }}>Procesando imagen…</div>}
            {!loading && !preview && (
              <div style={{ textAlign:'center', pointerEvents:'none' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📷</div>
                <div style={{ fontWeight:600, fontSize:14 }}>Haz clic o arrastra una foto aquí</div>
                <div className="muted" style={{ fontSize:12, marginTop:4 }}>JPG, PNG, HEIC · máx. 8 MB</div>
              </div>
            )}
            {!loading && preview && <img src={preview} alt="preview" style={{ maxWidth:'100%', maxHeight:260, borderRadius:8, objectFit:'contain' }} />}
            <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onFile} />
          </div>
          {preview && <button className="btn btn-ghost btn-sm" style={{ marginTop:4 }} onClick={() => { setPreview(null); setDataUrl(null); }}>Cambiar imagen</button>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
            <div className="form-field"><label>Fecha de la visita</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
            <div className="form-field"><label>Centro visitado</label><input value={centro} onChange={e => setCentro(e.target.value)} placeholder="Nombre del centro" /></div>
          </div>
          <div className="form-field"><label>Descripción / observación</label>
            <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3}
                      placeholder="Describe brevemente la visita, actividades observadas, observaciones, etc."
                      style={{ width:'100%', resize:'vertical', padding:'8px 10px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'inherit', fontSize:13 }} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!dataUrl || loading} onClick={save}>Guardar visita</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VisitasScreen, VisitaFormModal });
