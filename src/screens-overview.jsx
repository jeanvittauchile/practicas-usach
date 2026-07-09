// screens-overview.jsx — Dashboard + Evaluaciones list + Notas table + Students + Anexos
// Uses globals: I, USACH_DATA, USACH_CALC, notaClass, formatNota, fechaFmt

const D = window.USACH_DATA;
const C = window.USACH_CALC;

function openPrintWindow(contentEl, title, autoClose) {
  const w = window.open('', '_blank', 'width=960,height=760');
  if (!w) return;
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(function(el) { return el.outerHTML; }).join('\n');
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' + styles + '<style>body{background:#fff;margin:0;padding:0;}</style></head><body>' + contentEl.innerHTML + '</body></html>');
  w.document.close();
  w.focus();
  if (autoClose) w.onafterprint = function() { w.close(); };
  setTimeout(function() { w.print(); }, 600);
}

// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════

function Dashboard({ ctx, onNav }) {
  const { evaluaciones, niveles, atrasos, supervisor, autoeval } = ctx.state;
  const meta = D.meta || {};
  const grupos = D.GRUPOS || [];
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  // Stats
  const evalsCorregidas = evaluaciones.filter(e => e.estado === 'corregida').length;
  const evalsEnEval = evaluaciones.filter(e => e.estado === 'en-evaluacion').length;
  const evalsPend  = evaluaciones.filter(e => e.estado === 'pendiente').length;

  // Promedio del curso (sólo evals corregidas)
  const promediosEvals = evaluaciones.filter(e => e.estado === 'corregida').map(ev => {
    const notas = estudiantes.map(est => C.calcNotaEvaluacion(ev, niveles[ev.id]?.[est.id], atrasos[ev.id]?.[est.id])?.notaFinal).filter(Boolean);
    return notas.length ? notas.reduce((a,b)=>a+b,0) / notas.length : null;
  }).filter(Boolean);
  const promCurso = promediosEvals.length ? (promediosEvals.reduce((a,b)=>a+b,0)/promediosEvals.length) : null;

  // Próximas evaluaciones
  const today = new Date('2025-09-15');
  const proximas = [...evaluaciones]
    .filter(e => e.estado !== 'corregida')
    .sort((a, b) => window.evalFechaInfo(a, ctx.state).deadline.localeCompare(window.evalFechaInfo(b, ctx.state).deadline))
    .slice(0, 4);

  return (
    <div data-screen-label="Dashboard">
      <div className="section-head">
        <div>
          <h1>{meta.cursoTitulo || 'Práctica'}</h1>
          <div className="subtitle">{meta.semestre || ''} · {estudiantes.length} estudiantes · {D.PROFESORES.length} profesores supervisores</div>
        </div>
        <div className="actions">
          <a className="btn btn-secondary" href={ctx.driveUrl || 'https://drive.google.com'} target="_blank" rel="noopener noreferrer" title="Abrir Google Drive del curso">
            <GDriveIcon /> Drive del curso
          </a>
          <button className="btn btn-secondary" onClick={() => ctx.openReports()}><I.download /> Reportes</button>
          <button className="btn btn-primary" onClick={() => onNav('evaluaciones')}>
            Ir a evaluaciones <I.arrowRight />
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Promedio curso" value={promCurso != null ? formatNota(promCurso) : '—'}
                  delta="sobre evaluaciones corregidas" color="teal" />
        <StatCard label="Evaluaciones corregidas" value={`${evalsCorregidas}/${evaluaciones.length}`}
                  delta={`${evalsEnEval} en curso · ${evalsPend} pendientes`} color="ink" />
        <StatCard label="Estudiantes" value={estudiantes.length}
                  delta="inscripción automática a evals." color="ink" />
        <StatCard label="Atrasos detectados" value={
          Object.values(atrasos).reduce((acc, m) => acc + Object.values(m).filter(v => v>0).length, 0)
        } delta="–0,5 pts por día" color="orange" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Próximas evaluaciones</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('evaluaciones')}>Ver todo</button>
          </div>
          <div>
            {proximas.map(ev => {
              const info = window.evalFechaInfo(ev, ctx.state);
              const dias = Math.ceil((new Date(info.deadline) - today) / 86400000);
              const esTeal = window.grupoEsTeal(ev.grupo);
              return (
                <div key={ev.id} className="card-section" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="num"
                       style={{
                         width: 38, height: 38, borderRadius: 8,
                         background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)',
                         color: '#fff', display: 'grid', placeItems: 'center',
                         fontWeight: 700, fontSize: 13, flex: '0 0 38px',
                       }}>
                    {window.evalSigla(ev)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>{ev.titulo}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <I.calendar size={13} /> {info.label} · <I.clock size={13} /> {ev.tipo}
                    </div>
                  </div>
                  <span className={`tag ${dias <= 7 ? 'tag-warn' : dias <= 21 ? 'tag-info' : 'tag-outline'}`}>
                    {dias <= 0 ? 'En curso' : `en ${dias} días`}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => ctx.openEval(ev.id)}><I.arrowRight /></button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Estado de calificación</h3>
            <span className="tag tag-teal">{evalsCorregidas} de {evaluaciones.length} listas</span>
          </div>
          <div className="card-pad">
            {evaluaciones.map(ev => {
              const esTeal = window.grupoEsTeal(ev.grupo);
              const totalEst = estudiantes.length;
              const completados = estudiantes.filter(est => {
                const r = C.calcNotaEvaluacion(ev, niveles[ev.id]?.[est.id], atrasos[ev.id]?.[est.id]);
                return r && !r.parcial;
              }).length;
              const pct = totalEst ? Math.round(completados / totalEst * 100) : 0;
              return (
                <div key={ev.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, fontSize: 13 }}>
                    <span className={`lvl ${esTeal ? 'lvl-E' : 'lvl-B'}`} style={{ background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)', width: 20, height: 20, fontSize: 10 }}>
                      {window.evalSigla(ev)}
                    </span>
                    <span style={{ flex: 1, fontWeight: 500, color: 'var(--ink-800)' }}>{ev.titulo}</span>
                    <span className="muted tnum">{completados}/{totalEst}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="fill"
                         style={{ width: pct + '%', background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ height: 20 }} />
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Estudiantes con observaciones</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('estudiantes')}>Ver todo</button>
          </div>
          <div>
            {estudiantes.map(est => {
              const r = C.calcNotaFinal(est.id, ctx.state);
              const pAtrasos = Object.entries(atrasos).reduce((acc, [evid, m]) => acc + (m[est.id] || 0), 0);
              if (pAtrasos === 0 && (!r || r.notaFinal >= 4.0)) return null;
              return (
                <div key={est.id} className="card-section row">
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                    {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{est.nombre}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>{est.rut}</div>
                  </div>
                  {pAtrasos > 0 && <span className="tag tag-warn"><I.warn size={12} /> {pAtrasos} día{pAtrasos>1?'s':''} atraso</span>}
                  {r && r.notaFinal < 4.0 && <span className="tag tag-danger">Reprobando</span>}
                </div>
              );
            })}
            {estudiantes.every(est => {
              const r = C.calcNotaFinal(est.id, ctx.state);
              const pAtrasos = Object.entries(atrasos).reduce((acc, [evid, m]) => acc + (m[est.id] || 0), 0);
              return pAtrasos === 0 && (!r || r.notaFinal >= 4.0);
            }) && <div className="empty"><div className="title">Sin observaciones</div><div>Todos los estudiantes están al día.</div></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Ponderaciones del curso</h3>
            <span className="muted" style={{ fontSize: 12 }}>Total: 100%</span>
          </div>
          <div className="card-pad">
            {D.PONDERACIONES.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
                <div style={{ width: 50, fontWeight: 700, fontSize: 14, color: 'var(--ink-900)', textAlign: 'right' }} className="tnum">
                  {Math.round(p.peso * 100)}%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-800)' }}>{getPonderacionLabel(p, ctx.state.evaluaciones)}</div>
                </div>
                <div className="progress-bar" style={{ width: 100 }}>
                  <div className="fill" style={{ width: (p.peso * 100 / 0.2 * 100) + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, color = 'teal' }) {
  const bg = color === 'teal' ? 'var(--teal-50)' : color === 'orange' ? 'var(--orange-50)' : 'var(--ink-100)';
  const fg = color === 'teal' ? 'var(--teal-700)' : color === 'orange' ? 'var(--orange-700)' : 'var(--ink-700)';
  return (
    <div className="card card-pad" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: bg, borderRadius: '0 0 0 60px', opacity: 0.6 }} />
      <div className="stat">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-delta">{delta}</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// EVALUACIONES (lista por grupos)
// ═════════════════════════════════════════════════════════════

// ─── Exportar todas las evaluaciones como CSV ─────────────────────────────
function exportarTodasCSV(ctx) {
  const D = window.USACH_DATA, C = window.USACH_CALC;
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;
  const evaluaciones = ctx.state.evaluaciones || D.EVALUACIONES;
  const cols = D.NOTAS_COLUMNS || [];
  const practica = D.meta?.nombre || 'Práctica';
  const fecha = new Date().toLocaleDateString('es-CL');
  const sep = ';';
  const q  = s => `"${String(s == null ? '' : s).replace(/"/g, '""')}"`;
  const nv = v => v != null ? String(v).replace('.', ',') : '';
  const rows = [];

  // ── Sección 1: Tabla resumen de notas ──────────────────────────────────
  rows.push([q(practica + ' — Resumen de notas'), q(fecha)].join(sep));
  rows.push('');

  const hdrs = ['Nombre', 'RUT', 'Email'];
  if (D.meta?.multiMencion) hdrs.push('Mención');
  cols.forEach(c => hdrs.push(`${c.label} (${c.sub})`));
  hdrs.push('NOTA FINAL', 'Estado');
  rows.push(hdrs.map(q).join(sep));

  estudiantes.forEach(est => {
    const r = C.calcNotaFinal(est.id, ctx.state);
    const row = [est.nombre, est.rut || '', est.email || ''];
    if (D.meta?.multiMencion)
      row.push(est.area === 'ciencias' ? 'Ciencias del Deporte' : est.area === 'gestion' ? 'Gestión Deportiva' : 'Entrenador (Deportiva)');
    cols.forEach(col => {
      const cn = notaColumna(col, est.id, ctx.state);
      row.push(nv(cn.nota));
    });
    row.push(nv(r?.notaFinal), r?.completa ? 'Completa' : 'Parcial');
    rows.push(row.map(q).join(sep));
  });

  // ── Sección 2: Detalle por evaluación (solo las que tienen datos) ───────
  const evConDatos = evaluaciones.filter(ev =>
    ev.criterios?.length > 0 &&
    Object.keys(ctx.state.niveles?.[ev.id] || {}).some(eid =>
      Object.keys((ctx.state.niveles[ev.id] || {})[eid] || {}).length > 0
    )
  );

  if (evConDatos.length > 0) {
    rows.push(''); rows.push('');
    rows.push([q('DETALLE POR EVALUACIÓN')].join(sep));

    evConDatos.forEach(ev => {
      const lvSet = C.nivelesSetForEval(ev);
      // Filtrar estudiantes por mención si corresponde
      const evEsts = ev.menciones
        ? estudiantes.filter(e => ev.menciones.includes(e.area || 'deportiva'))
        : estudiantes;

      rows.push('');
      rows.push([
        q(ev.titulo),
        q(`${Math.round((ev.ponderacion || 0) * 100)}%`),
        q(`Máx. ${ev.maxPuntos} pts`),
        q(ev.estado || ''),
      ].join(sep));

      const critHdrs = ['Nombre', 'RUT'];
      if (D.meta?.multiMencion) critHdrs.push('Mención');
      ev.criterios.forEach((c, i) => critHdrs.push(`${i + 1}.${c.doble ? '×2' : ''} ${c.texto.slice(0, 55)}`));
      critHdrs.push('Puntaje', `/ ${ev.maxPuntos}`, 'Nota', 'Atraso (días)', 'Nota c/descuento');
      rows.push(critHdrs.map(q).join(sep));

      evEsts.forEach(est => {
        const resp   = (ctx.state.niveles?.[ev.id] || {})[est.id] || {};
        const atraso = (ctx.state.atrasos?.[ev.id] || {})[est.id] || 0;
        const r = C.calcNotaEvaluacion(ev, resp, atraso);
        const critVals = ev.criterios.map(c => {
          const k  = resp[c.id];
          const lv = lvSet.find(l => l.key === k);
          return lv != null ? lv.pts * (c.doble ? 2 : 1) : '';
        });
        const row = [est.nombre, est.rut || ''];
        if (D.meta?.multiMencion)
          row.push(est.area === 'ciencias' ? 'Ciencias del Deporte' : est.area === 'gestion' ? 'Gestión Deportiva' : 'Entrenador (Deportiva)');
        row.push(
          ...critVals,
          r ? nv(r.puntaje)   : '',
          r ? nv(r.maxPuntos) : '',
          r ? nv(r.nota)      : '',
          atraso > 0 ? atraso : '',
          r && !r.parcial ? nv(r.notaFinal) : '',
        );
        rows.push(row.map(q).join(sep));
      });
    });
  }

  // ── Descarga ─────────────────────────────────────────────────────────────
  const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${practica} — Evaluaciones ${fecha.replace(/\//g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function EvaluacionesScreen({ ctx, onOpen }) {
  const { evaluaciones, niveles, atrasos } = ctx.state;
  const meta = D.meta || {};
  const grupos = D.GRUPOS || [];
  const [showCal, setShowCal] = useState(false);
  const [mencion, setMencion] = useState('todas');

  const MENCIONES = meta.multiMencion ? [
    { id: 'todas',    label: 'Todas las menciones', color: '' },
    { id: 'deportiva', label: 'Entrenador Deportivo',  color: 'tag-teal' },
    { id: 'ciencias',  label: 'Ciencias del Deporte',  color: 'tag-info' },
    { id: 'gestion',   label: 'Gestión Deportiva',      color: 'tag-orange' },
  ] : [];

  const evsFiltradas = (evs) => mencion === 'todas' ? evs
    : evs.filter(ev => !ev.menciones || ev.menciones.includes(mencion));

  const subt = grupos.map(g => `${evaluaciones.filter(e => e.grupo === g.id).length} ${g.label}`).join(' + ');

  const mencionLabel = (ev) => {
    if (!meta.multiMencion || !ev.menciones) return null;
    const all = ev.menciones.length >= 3;
    if (all) return <span className="tag" style={{ fontSize:9.5, padding:'1px 6px', background:'var(--ink-100)', color:'var(--ink-600)' }}>Todas las menciones</span>;
    return ev.menciones.map(m => {
      const MAP = { deportiva:['tag-teal','Entrenador'], ciencias:['tag-info','Ciencias'], gestion:['tag-orange','Gestión'] };
      const [cls, lbl] = MAP[m] || ['',''];
      return <span key={m} className={`tag ${cls}`} style={{ fontSize:9.5, padding:'1px 6px' }}>{lbl}</span>;
    });
  };

  return (
    <div data-screen-label="Evaluaciones">
      <div className="section-head">
        <div>
          <h1>Evaluaciones</h1>
          <div className="subtitle">{subt} · escala de exigencia 60%</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => setShowCal(true)}><I.calendar /> Calendario</button>
          <button className="btn btn-secondary" onClick={() => { exportarTodasCSV(ctx); ctx.toast && ctx.toast('CSV descargado — ábrelo en Excel o Google Sheets'); }}><I.download /> Exportar todas</button>
        </div>
      </div>

      {meta.multiMencion && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20, alignItems:'center' }}>
          <span style={{ fontSize:11.5, fontWeight:700, color:'var(--ink-500)', textTransform:'uppercase', letterSpacing:'.05em', marginRight:4 }}>Mención:</span>
          {MENCIONES.map(m => (
            <button key={m.id}
                    className={`tag ${m.color} ${mencion===m.id ? 'active-mencion' : ''}`}
                    style={{ cursor:'pointer', fontSize:12.5, padding:'5px 14px', borderRadius:999,
                             border: mencion===m.id ? '2px solid currentColor' : '1.5px solid var(--border)',
                             fontWeight: mencion===m.id ? 700 : 500,
                             opacity: mencion===m.id ? 1 : .75,
                             transition:'all .12s' }}
                    onClick={() => setMencion(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {showCal && <CalendarModal ctx={ctx} onClose={() => setShowCal(false)} />}

      {grupos.map(g => {
        const evs = evsFiltradas(evaluaciones.filter(e => e.grupo === g.id));
        if (evs.length === 0) return null;
        return (
          <React.Fragment key={g.id}>
            <div className={`group-banner ${g.color === 'teal' ? 'solemnes' : 'talleres'}`}>
              <div style={{ width:44, height:44, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'grid', placeItems:'center', fontWeight:700, fontSize:18 }}>{g.sigla}</div>
              <div>
                <h2>{g.label}</h2>
                <div className="desc">{g.desc}</div>
              </div>
              <span className="count">{evs.length} evaluaciones</span>
            </div>
            <div className="grid-3" style={{ marginBottom:28 }}>
              {evs.map(ev => <EvalCard key={ev.id} ev={ev} state={ctx.state} onClick={() => onOpen(ev.id)} mencionBadge={mencionLabel(ev)} />)}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EvalCard({ ev, state, onClick, mencionBadge }) {
  const estudiantes = state.estudiantes || D.ESTUDIANTES;
  const total = estudiantes.length;
  // Para evaluaciones vinculadas al supervisor (dim 7), el progreso viene de esos indicadores
  const esPresent = ev.grupo === 'presentacion';
  const presentIds = ['p1','p2','p3','p4'];
  const completados = esPresent
    ? estudiantes.filter(est => {
        const resp = state.supervisor?.[est.id] || {};
        return presentIds.every(id => resp[id]);
      }).length
    : estudiantes.filter(est => {
        const r = C.calcNotaEvaluacion(ev, state.niveles[ev.id]?.[est.id], state.atrasos[ev.id]?.[est.id]);
        return r && !r.parcial;
      }).length;
  const pct = total ? Math.round(completados / total * 100) : 0;
  const esTeal = window.grupoEsTeal(ev.grupo);
  const estadoTag = esPresent
    ? <span className="tag tag-info" style={{ fontSize: 10.5 }}>Eval. Supervisor · Dim. 7</span>
    : ev.estado === 'corregida' ? <span className="tag tag-success"><I.check size={10} /> Corregida</span>
      : ev.estado === 'en-evaluacion' ? <span className="tag tag-warn">En evaluación</span>
      : <span className="tag tag-outline">Pendiente</span>;

  return (
    <button className={`eval-card ${esTeal ? 'is-solemne' : 'is-taller'}`} onClick={onClick}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="num">{window.evalSigla(ev)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="title">{ev.titulo}</h3>
          <div className="meta">
            {ev.tipo === 'Audiovisual' ? <I.video size={13} /> :
             ev.tipo === 'Terreno + Informe' ? <I.map size={13} /> : <I.doc size={13} />}
            {ev.tipo} · {ev.duracion}
          </div>
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {estadoTag}
        {mencionBadge && <span style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{mencionBadge}</span>}
        <span className="tag tag-outline"><I.calendar size={11} /> {window.evalFechaInfo(ev, state).label}{ev.semanaEntrega ? ` · Sem. ${ev.semanaEntrega}` : ''}</span>
        <span className="tag tag-outline">máx {ev.maxPuntos} pts</span>
      </div>
      <div className="progress-row">
        <span style={{ fontSize: 11.5, fontWeight: 600 }} className="tnum">{completados}/{total}</span>
        <div className="progress-bar"><div className="fill" style={{ width: pct + '%' }} /></div>
        <span className="muted tnum" style={{ fontSize: 11.5 }}>{pct}%</span>
      </div>
    </button>
  );
}

// ═════════════════════════════════════════════════════════════
// TABLA DE NOTAS CONSOLIDADA
// ═════════════════════════════════════════════════════════════

function notaColumna(col, estId, state) {
  const D = window.USACH_DATA, C = window.USACH_CALC;
  if (col.kind === 'eval') {
    const ev = D.EVALUACIONES.find(e => e.id === col.evalId);
    const er = C.calcNotaEvaluacion(ev, state.niveles[col.evalId]?.[estId], state.atrasos[col.evalId]?.[estId]);
    return { nota: er && !er.parcial ? er.notaFinal : null, parcial: !er || er.parcial, ajuste: er?.ajuste || 0 };
  }
  if (col.kind === 'portafolio') {
    const pfs = D.EVALUACIONES.filter(e => e.grupo === 'portafolio');
    const notas = []; let parcial = false;
    pfs.forEach(ev => { const er = C.calcNotaEvaluacion(ev, state.niveles[ev.id]?.[estId], state.atrasos[ev.id]?.[estId]); if (er && !er.parcial) notas.push(er.notaFinal); else parcial = true; });
    return { nota: notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10 : null, parcial };
  }
  const key = col.kind === 'sup' ? 'SUP' : col.kind === 'auto' ? 'AUTO' : col.kind === 'tutor' ? 'TUTOR' : null;
  const fn = key && (D.RESOLVERS || {})[key];
  if (fn) { const r = fn(estId, state); return { nota: r?.parcial ? null : r?.nota, parcial: !r || r.parcial }; }
  return { nota: null, parcial: true };
}

function NotasScreen({ ctx, onOpen }) {
  const [exportOpen, setExportOpen] = useState(false);
  const cols = D.NOTAS_COLUMNS || [];
  const estudiantes = ctx.state.estudiantes || D.ESTUDIANTES;

  return (
    <div data-screen-label="Tabla de notas">
      <div className="section-head">
        <div>
          <h1>Tabla de notas</h1>
          <div className="subtitle">Cálculo automático según ponderaciones (recalcula al editar rúbricas)</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary"><I.print /> Imprimir</button>
          <button className="btn btn-secondary" onClick={() => setExportOpen(true)}><I.download /> Exportar PDF</button>
          <button className="btn btn-primary"><I.send /> Publicar a estudiantes</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="rubric-grid-wrap" style={{ borderRadius: 'var(--r-lg)', maxHeight: 'unset' }}>
          <table className="rubric-grid">
            <thead>
              <tr>
                <th className="student">Estudiante</th>
                {cols.map(col => (
                  <th key={col.key} className={`crit ${col.color === 'orange' ? 'is-taller' : ''}`} style={{ textAlign: 'center', minWidth: 90 }}>
                    <span className="crit-num">{col.label.toUpperCase()}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-500)' }}>{col.sub}</span>
                  </th>
                ))}
                <th className="crit" style={{ textAlign: 'center', minWidth: 110, background: 'var(--teal-50)' }}>
                  <span className="crit-num" style={{ color: 'var(--teal-800)' }}>NOTA FINAL</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map(est => {
                const r = C.calcNotaFinal(est.id, ctx.state);
                return (
                  <tr key={est.id}>
                    <td className="student">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                          {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13 }}>{est.nombre}</div>
                          <div className="muted" style={{ fontSize: 11 }}>{est.rut}</div>
                        </div>
                      </div>
                    </td>
                    {cols.map(col => {
                      const cn = notaColumna(col, est.id, ctx.state);
                      const clickable = col.kind === 'eval';
                      return (
                        <td key={col.key} className="nota-cell" onClick={clickable ? () => onOpen(col.evalId) : undefined} style={clickable ? { cursor: 'pointer' } : {}}>
                          <span className={`nota ${notaClass(cn.nota)}`}>{formatNota(cn.nota)}</span>
                          {cn.ajuste > 0 && <div style={{ fontSize: 10, color: 'var(--warn)', marginTop: 2 }}>−{cn.ajuste.toFixed(1)} atraso</div>}
                        </td>
                      );
                    })}
                    <td className="nota-cell" style={{ background: 'var(--teal-50)' }}>
                      <span className={`nota nota-lg ${notaClass(r?.notaFinal)}`}>{formatNota(r?.notaFinal)}</span>
                      {r && !r.completa && <div style={{ fontSize: 10, color: 'var(--ink-500)', marginTop: 2 }}>parcial</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
        <I.warn size={14} /> Las notas se calculan en tiempo real desde las rúbricas. Una nota parcial significa que aún faltan criterios por evaluar. Haz clic en una celda de evaluación para abrir su rúbrica.
      </div>

      {exportOpen && <PdfPreviewModal kind="general" onClose={() => setExportOpen(false)} ctx={ctx} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ESTUDIANTES
// ═════════════════════════════════════════════════════════════

function EstudiantesScreen({ ctx, onOpen }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [filter, setFilter] = useState('');
  const lista = (ctx.state.estudiantes || D.ESTUDIANTES).filter(e => !filter || e.nombre.toLowerCase().includes(filter.toLowerCase()) || e.rut.includes(filter));

  return (
    <div data-screen-label="Estudiantes">
      <div className="section-head">
        <div>
          <h1>Estudiantes</h1>
          <div className="subtitle">{(ctx.state.estudiantes || D.ESTUDIANTES).length} estudiantes inscritos · se auto-inscriben en todas las evaluaciones</div>
        </div>
        <div className="actions">
        </div>
      </div>

      <div className="toolbar">
        <div className="left">
          <input className="input" placeholder="Buscar por nombre o RUT…" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 280 }} />
          <span className="muted" style={{ fontSize: 12.5 }}>{lista.length} resultado{lista.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="right">
          <button className="btn btn-ghost btn-sm"><I.filter /> Filtrar</button>
        </div>
      </div>
      <div className="card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 0, overflow: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              <th>Nombre completo</th>
              <th>RUT</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th className="numeric">Promedio actual</th>
              <th className="numeric">Atrasos</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {lista.map(est => {
              const r = C.calcNotaFinal(est.id, ctx.state);
              const totAtr = Object.values(ctx.state.atrasos).reduce((a, m) => a + (m[est.id]||0), 0);
              return (
                <tr key={est.id}>
                  <td>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
                      {est.nombre.split(' ').slice(0,2).map(n => n[0]).join('')}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{est.nombre}</td>
                  <td className="tnum muted">{est.rut}</td>
                  <td><a href={`mailto:${est.email}`}>{est.email}</a></td>
                  <td className="tnum muted">{est.telefono}</td>
                  <td className="numeric">
                    <span className={`nota ${notaClass(r?.notaFinal)}`}>{formatNota(r?.notaFinal)}</span>
                  </td>
                  <td className="numeric">
                    {totAtr > 0 ? <span className="tag tag-warn">{totAtr} día{totAtr>1?'s':''}</span> : <span className="muted">—</span>}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setReportFor(est)} title="Generar informe individual"><I.pdf /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(est)} title="Editar"><I.edit /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleting(est)} title="Eliminar"><I.trash /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <EditStudentModal student={editing} ctx={ctx} onClose={() => setEditing(null)} />}
      {deleting && <DeleteStudentConfirm student={deleting} ctx={ctx} onClose={() => setDeleting(null)} />}
      {reportFor && <StudentReportModal est={reportFor} ctx={ctx} onClose={() => setReportFor(null)} />}
    </div>
  );
}

function AddStudentModal({ onClose, ctx }) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3 className="h3">Agregar estudiante</h3><button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button></div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 24 }}>
          <div className="col" style={{ gap: 14 }}>
            <Field label="RUT"><input className="input" placeholder="12.345.678-9" value={rut} onChange={e=>setRut(e.target.value)} /></Field>
            <Field label="Nombre completo"><input className="input" placeholder="Nombres y apellidos" value={nombre} onChange={e=>setNombre(e.target.value)} /></Field>
            <Field label="Email institucional"><input className="input" placeholder="nombre.apellido@usach.cl" value={email} onChange={e=>setEmail(e.target.value)} /></Field>
            <Field label="Teléfono"><input className="input" placeholder="+56 9 …" value={tel} onChange={e=>setTel(e.target.value)} /></Field>
          </div>
          <div style={{ marginTop: 18, padding: 12, background: 'var(--teal-50)', borderRadius: 8, fontSize: 12.5, color: 'var(--teal-800)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <I.zap size={16} />
            <div>
              <strong>Inscripción automática:</strong> al agregar este estudiante quedará inscrito en todas las evaluaciones del curso, la supervisión en terreno/proceso y la autoevaluación.
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { ctx.addStudent({ rut, nombre, email, telefono: tel }); onClose(); }}>Agregar e inscribir</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-700)' }}>{label}</span>
      {children}
    </label>
  );
}

// ═════════════════════════════════════════════════════════════
// ANEXOS ADMINISTRATIVOS
// ═════════════════════════════════════════════════════════════

function AnexosScreen({ ctx }) {
  const [managing, setManaging] = useState(null); // eval id
  const [showUpload, setShowUpload] = useState(false);
  const evalAnexos = ctx.state.evalAnexos || {};
  return (
    <div data-screen-label="Anexos administrativos">
      <div className="section-head">
        <div>
          <h1>Anexos administrativos</h1>
          <div className="subtitle">Documentación común a todas las evaluaciones de {(D.meta || {}).breadcrumb || 'la práctica'}</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => setShowUpload(true)}><I.upload /> Subir documento</button>
        </div>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {D.ANEXOS_ADMIN.map(a => (
          <div key={a.id} className="anexo-row">
            <div className="file-icon">PDF</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.titulo}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{a.desc}</div>
            </div>
            <span className="tag tag-outline tnum">{a.tamano}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => ctx.toast(`Descargando "${a.titulo}"…`)}><I.download /> Descargar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => ctx.toast(`Editando "${a.titulo}"…`)}><I.edit /></button>
          </div>
        ))}
      </div>

      <div className="divider" />
      <h3 className="h3" style={{ marginBottom: 12 }}>Anexos por evaluación</h3>
      <div className="grid-3">
        {D.EVALUACIONES.map(ev => {
          const items = evalAnexos[ev.id] || [];
          return (
            <div key={ev.id} className="card card-pad">
              <div className="row" style={{ marginBottom: 10 }}>
                <span className={`lvl ${window.grupoEsTeal(ev.grupo) ? 'lvl-E' : 'lvl-B'}`}
                      style={{ background: window.grupoEsTeal(ev.grupo) ? 'var(--teal-500)' : 'var(--orange-500)', width: 24, height: 24, fontSize: 11 }}>
                  {window.evalSigla(ev)}
                </span>
                <strong style={{ fontSize: 13.5, flex: 1, minWidth: 0 }}>{ev.titulo}</strong>
              </div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
                {items.length === 0 ? 'Sin anexos' : `${items.length} anexo${items.length === 1 ? '' : 's'} cargado${items.length === 1 ? '' : 's'}`}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => setManaging(ev.id)}>
                <I.paperclip /> Gestionar anexos
              </button>
            </div>
          );
        })}
      </div>

      {managing && <EvalAnexosModal evalId={managing} ctx={ctx} onClose={() => setManaging(null)} />}
      {showUpload && <UploadAnexoModal evalId="admin" ctx={ctx} onClose={() => setShowUpload(false)} />}
    </div>
  );
}

// ─── Per-evaluation anexos modal ────────────────────────────
function EvalAnexosModal({ evalId, ctx, onClose }) {
  const ev = ctx.state.evaluaciones.find(e => e.id === evalId);
  const items = (ctx.state.evalAnexos || {})[evalId] || [];
  const [showAdd, setShowAdd] = useState(false);
  const [renaming, setRenaming] = useState(null); // {id, titulo}
  if (!ev) return null;
  const isSolemne = ev.grupo === 'solemne';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className={`lvl ${isSolemne ? 'lvl-E' : 'lvl-B'}`}
                style={{ background: isSolemne ? 'var(--teal-500)' : 'var(--orange-500)', width: 28, height: 28, fontSize: 11 }}>
            {isSolemne ? 'S' : 'T'}{ev.numero}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="h3" style={{ margin: 0 }}>Gestionar anexos</h3>
            <div className="muted" style={{ fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ev.titulo}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="muted" style={{ fontSize: 13 }}>
              {items.length === 0 ? 'Aún no hay anexos para esta evaluación.' : `${items.length} archivo${items.length === 1 ? '' : 's'} compartido${items.length === 1 ? '' : 's'} con los estudiantes`}
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <I.upload /> Subir anexo
            </button>
          </div>

          {items.length === 0 ? (
            <button className="anexo-row" style={{ borderStyle: 'dashed', justifyContent: 'center', color: 'var(--ink-500)', cursor: 'pointer', background: 'transparent', padding: 28, flexDirection: 'column', gap: 6 }}
                    onClick={() => setShowAdd(true)}>
              <I.upload size={24} />
              <strong style={{ fontSize: 13 }}>Arrastra archivos PDF aquí o haz clic para seleccionar</strong>
              <span className="muted" style={{ fontSize: 11.5 }}>Máximo 10 MB por archivo</span>
            </button>
          ) : (
            <div className="col" style={{ gap: 8 }}>
              {items.map(a => (
                <div key={a.id} className="anexo-row">
                  <div className="file-icon">PDF</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renaming?.id === a.id ? (
                      <input className="input input-sm" autoFocus
                             style={{ width: '100%', fontSize: 14, fontWeight: 600 }}
                             value={renaming.titulo}
                             onChange={e => setRenaming({ ...renaming, titulo: e.target.value })}
                             onBlur={() => { ctx.renameEvalAnexo(evalId, a.id, renaming.titulo); setRenaming(null); }}
                             onKeyDown={e => { if (e.key === 'Enter') { ctx.renameEvalAnexo(evalId, a.id, renaming.titulo); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }} />
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</div>
                    )}
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                      Subido el {a.subido} · {a.por || 'Andrés Tapia'}
                    </div>
                  </div>
                  <span className="tag tag-outline tnum">{a.tamano}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setRenaming({ id: a.id, titulo: a.titulo })} title="Renombrar"><I.edit size={14} /></button>
                  <button className="btn btn-secondary btn-sm" onClick={() => ctx.toast(`Descargando "${a.titulo}"…`)}><I.download size={14} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm(`¿Eliminar "${a.titulo}"?`)) { ctx.removeEvalAnexo(evalId, a.id); ctx.toast('Anexo eliminado'); } }} title="Eliminar">
                    <I.trash size={14} stroke="var(--danger)" />
                  </button>
                </div>
              ))}
              <button className="anexo-row" style={{ borderStyle: 'dashed', justifyContent: 'center', color: 'var(--ink-500)', cursor: 'pointer', background: 'transparent' }}
                      onClick={() => setShowAdd(true)}>
                <I.plus /> Añadir otro anexo
              </button>
            </div>
          )}

          <div style={{ marginTop: 16, padding: 12, background: 'var(--surface-1)', borderRadius: 8, fontSize: 12, color: 'var(--ink-600)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <I.zap size={16} stroke="var(--teal-600)" />
            <div>
              Los anexos quedan visibles para todos los estudiantes inscritos en esta evaluación y se descargan desde su vista de Moodle / portal estudiante.
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={() => ctx.toast('Notificación enviada a los estudiantes')}>
            <I.send /> Notificar a estudiantes
          </button>
        </div>
      </div>

      {showAdd && <UploadAnexoModal evalId={evalId} ctx={ctx} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function UploadAnexoModal({ evalId, ctx, onClose }) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('Material complementario');
  const submit = () => {
    if (!titulo.trim()) return;
    const sizeMb = (Math.random() * 1.6 + 0.2).toFixed(1);
    ctx.addEvalAnexo(evalId, {
      id: 'a_' + Date.now(),
      titulo: titulo.trim(),
      tipo,
      tamano: sizeMb + ' MB',
      subido: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', ''),
      por: 'Andrés Tapia',
    });
    ctx.toast(`"${titulo}" cargado correctamente`);
    onClose();
  };
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.upload />
          <h3 className="h3" style={{ margin: 0 }}>Subir nuevo anexo</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div className="col" style={{ gap: 14 }}>
            <Field label="Título del anexo">
              <input className="input" autoFocus placeholder="Ej: Pauta de la evaluación" value={titulo} onChange={e => setTitulo(e.target.value)} />
            </Field>
            <Field label="Tipo de material">
              <select className="input" value={tipo} onChange={e => setTipo(e.target.value)}>
                <option>Pauta de la evaluación</option>
                <option>Rúbrica para estudiantes</option>
                <option>Material complementario</option>
                <option>Lectura obligatoria</option>
                <option>Ejemplo / referencia</option>
                <option>Otro</option>
              </select>
            </Field>
            <div style={{ padding: 22, border: '2px dashed var(--border-strong)', borderRadius: 10, textAlign: 'center', background: 'var(--surface-1)' }}>
              <I.upload size={28} stroke="var(--ink-400)" />
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>Arrastra el archivo PDF aquí</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>o haz clic para seleccionar · máx. 10 MB</div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!titulo.trim()} onClick={submit}
                  style={!titulo.trim() ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            Subir anexo
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PDF Preview Modal
// ═════════════════════════════════════════════════════════════

function PdfPreviewModal({ kind, ev, est, ctx, onClose }) {
  const state = ctx.state;
  const isStudent = kind === 'student' && est && ev;
  const bodyRef = React.useRef(null);

  const title = kind === 'general'
    ? 'Reporte general'
    : isStudent ? 'Rubrica — ' + est.nombre : 'PDF';

  function handlePrint() {
    if (bodyRef.current) openPrintWindow(bodyRef.current, title, false);
  }
  function handleDownload() {
    if (bodyRef.current) openPrintWindow(bodyRef.current, title, true);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.pdf />
          <h3 className="h3">
            {kind === 'general' ? 'Reporte general — características de evaluaciones' :
             isStudent ? `Rúbrica completada — ${est.nombre}` : 'Vista previa PDF'}
          </h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" ref={bodyRef}>
          {kind === 'general' && <PdfGeneral state={state} />}
          {isStudent && <PdfRubrica ev={ev} est={est} state={state} />}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={handlePrint}><I.print /> Imprimir</button>
          <button className="btn btn-primary" onClick={handleDownload}><I.download /> Descargar PDF</button>
        </div>
      </div>
    </div>
  );
}

function PdfGeneral({ state }) {
  const meta = D.meta || {};
  const grupos = D.GRUPOS || [];
  return (
    <div className="pdf-page">
      <div className="pdf-head">
        <div>
          <h1>{meta.cursoTitulo || 'Práctica'}</h1>
          <div className="muted" style={{ fontSize: 11 }}>USACH · {meta.escuela || 'Entrenador Deportivo'} · {meta.semestre || ''}</div>
        </div>
        <USACHCrest size={48} />
      </div>
      {grupos.map(g => (
        <div className="pdf-section" key={g.id}>
          <h3>{g.label}</h3>
          {D.EVALUACIONES.filter(e => e.grupo === g.id).map(ev => (
            <div key={ev.id} style={{ marginBottom: 12 }}>
              <strong>{window.evalSigla(ev)}. {ev.titulo}</strong>
              <div className="muted" style={{ fontSize: 11 }}>{ev.tipo} · {ev.duracion} · Fecha: {window.evalFechaInfo(ev, state || {}).label} · Máx. {ev.maxPuntos} pts</div>
              <div style={{ fontSize: 11.5, marginTop: 4 }}>{ev.descripcion}</div>
            </div>
          ))}
        </div>
      ))}
      <div className="pdf-section">
        <h3>Ponderaciones</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
          <thead><tr style={{ borderBottom: '1px solid #ccc' }}><th align="left">Componente</th><th align="right">Peso</th></tr></thead>
          <tbody>
            {D.PONDERACIONES.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px dashed #eee' }}><td style={{ padding: '4px 0' }}>{getPonderacionLabel(p, D.EVALUACIONES)}</td><td align="right" className="tnum">{Math.round(p.peso * 100)}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PdfRubrica({ ev, est, state }) {
  const nivelesSet = C.nivelesSetForEval(ev);
  const grupo = window.grupoDef(ev.grupo);
  const r = C.calcNotaEvaluacion(ev, state.niveles[ev.id]?.[est.id], state.atrasos[ev.id]?.[est.id]);
  const prof = window.readProfProfile ? window.readProfProfile() : {};
  const feedback = state.evalFeedback?.[ev.id]?.[est.id] || '';
  return (
    <div className="pdf-page">
      <div className="pdf-head">
        <div>
          <h1>{grupo.singular.toUpperCase()} {ev.numero} — Rúbrica completada</h1>
          <div className="muted" style={{ fontSize: 11 }}>{ev.titulo}</div>
        </div>
        <USACHCrest size={48} />
      </div>
      <div className="pdf-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 11.5 }}>
        <div><strong>Estudiante:</strong> {est.nombre}<br /><strong>RUT:</strong> {est.rut}</div>
        <div><strong>Fecha entrega:</strong> {window.evalFechaInfo(ev, state).label}<br /><strong>Profesor:</strong> {prof.nombre || '—'}{prof.titulo ? ' · ' + prof.titulo : ''}</div>
      </div>
      <div className="pdf-section">
        <h3>Rúbrica</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
          <thead><tr style={{ background: '#f4f6f8' }}>
            <th align="left" style={{ padding: '6px 8px', borderBottom: '1px solid #ccc' }}>Criterio</th>
            <th style={{ padding: '6px 8px', borderBottom: '1px solid #ccc' }}>Nivel</th>
            <th align="right" style={{ padding: '6px 8px', borderBottom: '1px solid #ccc' }}>Pts</th>
          </tr></thead>
          <tbody>
            {ev.criterios.map((cr, i) => {
              const k = state.niveles[ev.id]?.[est.id]?.[cr.id];
              const ni = nivelesSet.find(n => n.key === k);
              const pts = ni ? ni.pts * (cr.doble ? 2 : 1) : 0;
              return (
                <tr key={cr.id} style={{ borderBottom: '1px dashed #eee' }}>
                  <td style={{ padding: '6px 8px' }}>{i+1}. {cr.texto}{cr.doble && <span style={{ color: '#D9831F', fontWeight: 700 }}> ×2</span>}</td>
                  <td align="center" style={{ padding: '6px 8px' }}>{ni ? ni.label : '—'}</td>
                  <td align="right" style={{ padding: '6px 8px' }} className="tnum">{pts}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #1B2A35', fontWeight: 700 }}>
              <td style={{ padding: '6px 8px' }} colSpan={2}>Total puntos (máx {ev.maxPuntos})</td>
              <td align="right" style={{ padding: '6px 8px' }} className="tnum">{r?.puntos ?? '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="pdf-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, padding: 14, background: '#f7f9fa', borderRadius: 6, fontSize: 11.5 }}>
        <div><div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nota base (60%)</div><div style={{ fontSize: 18, fontWeight: 700 }} className="tnum">{formatNota(r?.notaBase)}</div></div>
        <div><div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ajuste por atraso</div><div style={{ fontSize: 18, fontWeight: 700, color: r?.ajuste > 0 ? '#C97A0E' : 'inherit' }} className="tnum">−{(r?.ajuste ?? 0).toFixed(1)}</div></div>
        <div><div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nota final</div><div style={{ fontSize: 22, fontWeight: 700, color: '#009688' }} className="tnum">{formatNota(r?.notaFinal)}</div></div>
      </div>
      <div className="pdf-section">
        <h3>Feedback del docente</h3>
        <div style={{ fontSize: 11.5, lineHeight: 1.6, padding: 10, border: '1px dashed #ccc', borderRadius: 4, minHeight: 60, fontStyle: feedback ? 'normal' : 'italic', color: feedback ? 'inherit' : '#999' }}>
          {feedback || 'Sin feedback registrado para esta evaluación.'}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Dashboard, EvaluacionesScreen, EvalCard, NotasScreen, notaColumna,
  EstudiantesScreen, AnexosScreen, EvalAnexosModal, UploadAnexoModal,
  PdfPreviewModal, PdfGeneral, PdfRubrica, Field, openPrintWindow,
});
