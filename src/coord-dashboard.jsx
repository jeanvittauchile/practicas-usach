// coord-dashboard.jsx — Dashboard del Coordinador

function DashboardScreen({ ctx }) {
  const { profs, students, cartas, centros, onNav } = ctx;
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const PNAMES = window.PRACTICE_NAMES || {};

  const assignedProfs = profs.filter(p => (p.practicasAsignadas||[]).length > 0).length;
  const emitidas = cartas.filter(c => c.estado === 'emitida').length;
  const pendientes = cartas.filter(c => c.estado === 'pendiente').length;
  const cohortes = [...new Set(students.map(s => s.cohorte).filter(Boolean))].sort();

  const profsByHours = profs.map(p => ({ ...p, horas: p.horasAsignadas||0 })).sort((a,b) => b.horas - a.horas);
  const totalHoras = profs.reduce((a,p) => a + (p.horasAsignadas||0), 0);
  const maxH = Math.max(1, ...profsByHours.map(p => p.horas));

  const pStats = PRACS.map(code => ({
    code, name: PNAMES[code] || code,
    profCount: profs.filter(p => (p.practicasAsignadas||[]).includes(code)).length,
    studCount: students.filter(s => s.practica === code).length,
    cartaCount: cartas.filter(c => c.practica === code && c.estado === 'emitida').length,
  }));

  return (
    <div data-screen-label="Dashboard">
      <div className="section-head">
        <div>
          <h1>Dashboard del Coordinador</h1>
          <div className="subtitle">Semestre 2025‑2 · Vista consolidada de todas las prácticas</div>
        </div>
        <div className="actions">
          <a href="App Prácticas USACH.html" className="btn btn-secondary btn-sm">↗ Entrar a las prácticas</a>
        </div>
      </div>

      <div className="coord-stats">
        <div className="stat-card accent">
          <div className="stat-lbl">Profesores registrados</div>
          <div className="stat-val">{profs.length}</div>
          <div className="stat-sub">{assignedProfs} con práctica asignada</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Centros deportivos</div>
          <div className="stat-val">{(centros||[]).length}</div>
          <div className="stat-sub">centros de práctica registrados</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-lbl">Estudiantes inscritos</div>
          <div className="stat-val">{students.length}</div>
          <div className="stat-sub">{cohortes.length} cohortes activas</div>
        </div>
        <div className="stat-card" style={{ borderLeft: pendientes > 0 ? '3px solid #b45309' : undefined }}>
          <div className="stat-lbl">Cartas emitidas</div>
          <div className="stat-val">{emitidas}</div>
          <div className="stat-sub" style={{ color: pendientes > 0 ? '#b45309' : undefined }}>
            {pendientes > 0 ? `⚠ ${pendientes} pendiente${pendientes>1?'s':''}` : 'Sin pendientes'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding:'14px 20px', fontWeight:700, fontSize:15, borderBottom:'1px solid var(--border)' }}>
          Estado por práctica
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="coord-prac-table" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface-1)' }}>
                <th style={{ padding:'9px 20px', textAlign:'left', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'var(--ink-500)' }}>Práctica</th>
                <th style={{ padding:'9px 20px', textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'var(--ink-500)' }}>Profesores</th>
                <th style={{ padding:'9px 20px', textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'var(--ink-500)' }}>Estudiantes</th>
                <th className="col-cartas" style={{ padding:'9px 20px', textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:'var(--ink-500)' }}>Cartas emitidas</th>
                <th className="col-action" style={{ padding:'9px 20px' }}></th>
              </tr>
            </thead>
            <tbody>
              {pStats.map(p => (
                <tr key={p.code} style={{ borderTop:'1px solid var(--border)' }}>
                  <td style={{ padding:'12px 20px' }}>
                    <span className={`practice-chip chip-${p.code}`}>{p.code}</span>
                    <span style={{ marginLeft:10, fontSize:13, fontWeight:500 }}>{p.name}</span>
                  </td>
                  <td style={{ padding:'12px 20px', textAlign:'right', fontSize:14, fontWeight:600 }}>
                    {p.profCount}
                    {p.profCount === 0 && <span style={{ marginLeft:6, fontSize:11, color:'#b45309', fontWeight:700 }}>⚠ sin asignar</span>}
                  </td>
                  <td style={{ padding:'12px 20px', textAlign:'right', fontSize:14, fontWeight:600 }}>{p.studCount}</td>
                  <td className="col-cartas" style={{ padding:'12px 20px', textAlign:'right', fontSize:14, fontWeight:600 }}>{p.cartaCount}</td>
                  <td className="col-action" style={{ padding:'10px 20px', textAlign:'right' }}>
                    <a href={`App Prácticas USACH.html?practica=${p.code}`} className="btn btn-secondary btn-sm" title={`Entrar a ${p.name} y editar`}>✎ Entrar / Editar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Carga horaria semanal por profesor/a</div>
          <span className="muted" style={{ fontSize:12.5 }}>{totalHoras} h asignadas en total</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => onNav('asignaciones')}>Gestionar →</button>
        </div>
        <div style={{ padding:'10px 20px 16px', maxHeight:300, overflowY:'auto' }}>
          {profsByHours.length === 0 && <div className="muted" style={{ fontSize:13 }}>Sin profesores registrados.</div>}
          {profsByHours.map(p => {
            const pct = Math.round(p.horas / maxH * 100);
            const nSt = students.filter(s => s.profesorId === p.id).length;
            return (
              <div key={p.id} className="hora-bar-row">
                <span className="hora-name" title={p.nombre}>{p.nombre.replace('Prof. ','')}</span>
                <div className="hora-track"><div className="hora-fill" style={{ width: pct+'%' }}></div></div>
                <span className="hora-val">{p.horas}h</span>
                <span className="muted hora-st">{nSt} est.</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="coord-bottom-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="card" style={{ padding:'16px 20px' }}>
          <div style={{ fontWeight:700, fontSize:14 }}>Estudiantes por cohorte</div>
          <div className="muted" style={{ fontSize:12, marginBottom:14 }}>Clic en una cohorte para ver su nómina filtrada.</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {cohortes.length === 0 && <div className="muted" style={{ fontSize:13 }}>Sin datos de cohorte</div>}
            {cohortes.map(c => {
              const cnt = students.filter(s => s.cohorte === c).length;
              return (
                <button key={c} className="cohorte-btn" onClick={() => onNav('estudiantes', { cohorte: c })}>
                  <div style={{ fontSize:22, fontWeight:800, color:'var(--teal-600)' }}>{cnt}</div>
                  <div style={{ fontSize:12, color:'var(--ink-500)', fontWeight:600 }}>{c}</div>
                  <div className="cohorte-go">Ver →</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding:'16px 20px' }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Acciones rápidas</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'👥 Gestionar asignaciones de profesores', nav:'asignaciones' },
              { label:'🎓 Ver y asignar estudiantes', nav:'estudiantes' },
              { label:'📄 Emitir carta de presentación', nav:'cartas' },
              { label:'📊 Descargar reporte consolidado', nav:'reportes' },
            ].map(a => (
              <button key={a.nav} className="btn btn-secondary" style={{ textAlign:'left', justifyContent:'flex-start' }}
                      onClick={() => onNav(a.nav)}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
