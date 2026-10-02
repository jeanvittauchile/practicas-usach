// coord-asistencia.jsx — Resumen de asistencia a las clases de los supervisores (coordinador)
// Lee los documentos usach_asist_v1_* que cada profesor guarda desde Inicio → Asistencia.

function AsistenciaCoordScreen({ ctx }) {
  const { useState } = React;
  const { profs, students, toast } = ctx;
  const A = window.ASISTENCIA;
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const [docs, setDocs] = useState(() => A.readAll());
  const [fPrac, setFPrac] = useState('');
  const [fProf, setFProf] = useState('');
  const [soloRiesgo, setSoloRiesgo] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Trae lo último de Firestore (los profesores pueden haber pasado lista después de abrir esta pantalla).
  const actualizar = async () => {
    setCargando(true);
    try { if (window.CLOUD && window.CLOUD.refresh) await window.CLOUD.refresh(); } catch (e) {}
    setDocs(A.readAll());
    setCargando(false);
    toast('Asistencia actualizada');
  };

  const profNombre = (d) => {
    const p = profs.find(x => (x.email || '').toLowerCase() === (d.profesorEmail || '').toLowerCase());
    return (p && p.nombre) || d.profesorNombre || d.profesorEmail || 'Sin nombre';
  };
  const fmt = iso => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
  const pctTag = pct => pct == null ? <span className="muted">—</span>
    : <span className={`tag ${pct < A.UMBRAL ? 'tag-danger' : 'tag-teal'} tnum`}>{pct}%</span>;

  const filtrados = docs.filter(d => (!fPrac || d.practica === fPrac) && (!fProf || (d.profesorEmail || '') === fProf)
    && Object.keys(d.sesiones || {}).length > 0);

  // Por profesor y práctica
  const filasProf = filtrados.map(d => {
    const ses = Object.values(d.sesiones || {});
    const c = A.contar(ses.flatMap(s => Object.values(s.registros || {})));
    const ultima = ses.reduce((m, s) => (s.fecha && (!m || s.fecha > m)) ? s.fecha : m, null);
    return { key: A.key(d.practica, d.profesorEmail), nombre: profNombre(d), practica: d.practica, clases: ses.length, ultima, c };
  }).sort((a, b) => a.nombre.localeCompare(b.nombre) || a.practica.localeCompare(b.practica));

  // Por estudiante
  const filasEst = [];
  filtrados.forEach(d => {
    const res = A.porEstudiante(d);
    Object.keys(res).forEach(estId => {
      const s = students.find(x => x.id === estId);
      const info = (d.estudiantes || {})[estId] || {};
      filasEst.push({
        key: d.practica + '_' + d.profesorEmail + '_' + estId,
        nombre: (s && s.nombre) || info.nombre || estId,
        rut: (s && s.rut) || info.rut || '',
        practica: d.practica, profesor: profNombre(d), c: res[estId],
      });
    });
  });
  filasEst.sort((a, b) => (a.c.pct ?? 101) - (b.c.pct ?? 101) || a.nombre.localeCompare(b.nombre));
  const enRiesgo = filasEst.filter(f => f.c.pct != null && f.c.pct < A.UMBRAL);
  const visiblesEst = soloRiesgo ? enRiesgo : filasEst;

  const general = A.contar(filtrados.flatMap(d => Object.values(d.sesiones || {}).flatMap(s => Object.values(s.registros || {}))));
  const totalClases = filasProf.reduce((a, f) => a + f.clases, 0);
  const autores = [...new Map(docs.filter(d => Object.keys(d.sesiones || {}).length).map(d => [d.profesorEmail, { email: d.profesorEmail, nombre: profNombre(d) }])).values()];

  const exportarCSV = () => {
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const head = ['Estudiante', 'RUT', 'Práctica', 'Profesor', 'Presente', 'Atraso', 'Ausente', 'Justificado', '% asistencia'];
    const rows = visiblesEst.map(f => [f.nombre, f.rut, f.practica, f.profesor, f.c.P, f.c.T, f.c.A, f.c.J, f.c.pct == null ? '' : f.c.pct].map(q).join(';'));
    const blob = new Blob(['﻿' + [head.map(q).join(';'), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `asistencia_${fPrac || 'todas'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const selStyle = { padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'var(--bg)', color:'var(--ink-900)' };

  return (
    <div data-screen-label="Asistencia">
      <div className="section-head">
        <div>
          <h1>Asistencia</h1>
          <div className="subtitle">Asistencia a las clases de los profesores supervisores · registrada desde Inicio → Asistencia</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={actualizar} disabled={cargando}>{cargando ? 'Actualizando…' : '↻ Actualizar'}</button>
          <button className="btn btn-secondary" onClick={exportarCSV} disabled={!visiblesEst.length}>Exportar CSV</button>
        </div>
      </div>

      <div className="card" style={{ padding:'12px 16px', marginBottom:16, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <select value={fPrac} onChange={e => setFPrac(e.target.value)} style={selStyle}>
          <option value="">Todas las prácticas</option>
          {PRACS.map(p => <option key={p} value={p}>Práctica {p}</option>)}
        </select>
        <select value={fProf} onChange={e => setFProf(e.target.value)} style={{ ...selStyle, minWidth:200 }}>
          <option value="">Todos los profesores</option>
          {autores.map(a => <option key={a.email} value={a.email}>{a.nombre}</option>)}
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
          <input type="checkbox" checked={soloRiesgo} onChange={e => setSoloRiesgo(e.target.checked)} /> Solo bajo {A.UMBRAL}%
        </label>
      </div>

      <div className="coord-stats">
        <div className="stat-card accent">
          <div className="stat-lbl">Clases registradas</div>
          <div className="stat-val">{totalClases}</div>
          <div className="stat-sub">{filasProf.length} profesor{filasProf.length !== 1 ? 'es' : ''}/práctica con registros</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Asistencia general</div>
          <div className="stat-val">{general.pct != null ? general.pct + '%' : '—'}</div>
          <div className="stat-sub">presentes + atrasos; justificados no cuentan</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Inasistencias</div>
          <div className="stat-val">{general.A}</div>
          <div className="stat-sub">{general.J} justificadas · {general.T} atrasos</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-lbl">Estudiantes bajo {A.UMBRAL}%</div>
          <div className="stat-val">{enRiesgo.length}</div>
          <div className="stat-sub">de {filasEst.length} con registros</div>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="card" style={{ padding:48, textAlign:'center', color:'var(--ink-400)' }}>
          Aún no hay asistencia registrada{fPrac || fProf ? ' con estos filtros' : ''}. Los profesores la pasan desde Inicio → Asistencia en su plataforma.
        </div>
      ) : <>
        <div className="card" style={{ padding:0, overflow:'auto', marginBottom:16 }}>
          <div style={{ padding:'14px 18px', fontWeight:700 }}>Por profesor</div>
          <table className="tbl">
            <thead><tr>
              <th>Profesor</th><th>Práctica</th><th className="numeric">Clases</th><th>Última clase</th>
              <th className="numeric">Ausentes</th><th className="numeric">Justif.</th><th className="numeric">Asistencia</th>
            </tr></thead>
            <tbody>
              {filasProf.map(f => (
                <tr key={f.key}>
                  <td style={{ fontWeight:600 }}>{f.nombre}</td>
                  <td>{f.practica}</td>
                  <td className="numeric tnum">{f.clases}</td>
                  <td className="tnum muted">{fmt(f.ultima)}</td>
                  <td className="numeric tnum">{f.c.A}</td>
                  <td className="numeric tnum">{f.c.J}</td>
                  <td className="numeric">{pctTag(f.c.pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding:0, overflow:'auto' }}>
          <div style={{ padding:'14px 18px', fontWeight:700 }}>Por estudiante <span className="muted" style={{ fontWeight:400, fontSize:12.5 }}>· ordenado de menor a mayor asistencia</span></div>
          <table className="tbl">
            <thead><tr>
              <th>Estudiante</th><th>RUT</th><th>Práctica</th><th>Profesor</th>
              <th className="numeric">P</th><th className="numeric">T</th><th className="numeric">A</th><th className="numeric">J</th><th className="numeric">Asistencia</th>
            </tr></thead>
            <tbody>
              {visiblesEst.map(f => (
                <tr key={f.key}>
                  <td style={{ fontWeight:600 }}>{f.nombre}</td>
                  <td className="tnum muted">{f.rut}</td>
                  <td>{f.practica}</td>
                  <td className="muted">{f.profesor}</td>
                  <td className="numeric tnum">{f.c.P}</td>
                  <td className="numeric tnum">{f.c.T}</td>
                  <td className="numeric tnum">{f.c.A}</td>
                  <td className="numeric tnum">{f.c.J}</td>
                  <td className="numeric">{pctTag(f.c.pct)}</td>
                </tr>
              ))}
              {visiblesEst.length === 0 && <tr><td colSpan={9} className="muted" style={{ textAlign:'center', padding:24 }}>Ningún estudiante bajo {A.UMBRAL}%.</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
    </div>
  );
}
window.AsistenciaCoordScreen = AsistenciaCoordScreen;
