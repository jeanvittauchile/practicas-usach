// coord-notas.jsx — Notas registradas por profesores (vista consolidada, coordinador)

function formatNotaCoord(n) {
  return n == null ? '—' : n.toFixed(1).replace('.', ',');
}

function notaColumnaCoord(col, estId, state, D, Cr) {
  if (col.kind === 'eval') {
    const ev = D.EVALUACIONES.find(e => e.id === col.evalId);
    const er = Cr.calcNotaEvaluacion(ev, state.niveles?.[col.evalId]?.[estId], state.atrasos?.[col.evalId]?.[estId]);
    return { nota: er && !er.parcial ? er.notaFinal : null };
  }
  if (col.kind === 'portafolio') {
    const pfs = D.EVALUACIONES.filter(e => e.grupo === 'portafolio');
    const notas = [];
    pfs.forEach(ev => {
      const er = Cr.calcNotaEvaluacion(ev, state.niveles?.[ev.id]?.[estId], state.atrasos?.[ev.id]?.[estId]);
      if (er && !er.parcial) notas.push(er.notaFinal);
    });
    return { nota: notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10 : null };
  }
  const key = col.kind === 'sup' ? 'SUP' : col.kind === 'auto' ? 'AUTO' : col.kind === 'tutor' ? 'TUTOR' : col.kind === 'semestral' ? 'SEMESTRAL' : null;
  const fn = key && (D.RESOLVERS || {})[key];
  if (fn) { const r = fn(estId, state); return { nota: r && !r.parcial ? r.nota : null }; }
  return { nota: null };
}

// Abre una ventana con el contenido de impresión/PDF (mismo mecanismo que usan los reportes de profesores).
function openPrintWindow(contentEl, title, autoClose) {
  const w = window.open('', '_blank', 'width=960,height=760');
  if (!w) return;
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML).join('\n');
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' + styles + '<style>body{background:#fff;margin:0;padding:0;}</style></head><body>' + contentEl.innerHTML + '</body></html>');
  w.document.close();
  w.focus();
  if (autoClose) w.onafterprint = () => w.close();
  setTimeout(() => w.print(), 600);
}

function NotasExportModal({ practica, D, cols, filas, onClose }) {
  const meta = D.meta || {};
  const bodyRef = React.useRef(null);
  const title = 'Tabla de notas — ' + (meta.breadcrumb || practica);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.table />
          <h3 className="h3" style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" ref={bodyRef}>
          <div className="pdf-page" style={{ padding: '40px 48px' }}>
            <div className="pdf-head">
              <div>
                <h1>{title}</h1>
                <div className="muted" style={{ fontSize: 11 }}>USACH · {meta.escuela || 'Entrenador Deportivo'} · {meta.semestre || ''}</div>
              </div>
              <USACHCrest size={48} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
              <thead>
                <tr style={{ background: 'var(--surface-1)' }}>
                  <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left' }}>Estudiante</th>
                  <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left', width: 80 }}>RUT</th>
                  {cols.map(col => <th key={col.key} style={{ padding: '8px 4px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', minWidth: 40 }}>{col.label}</th>)}
                  <th style={{ padding: '8px 4px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', minWidth: 60, background: 'var(--teal-50)' }}>Final</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ est, partes, final }) => (
                  <tr key={est.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>{est.nombre}</td>
                    <td style={{ padding: '6px', color: 'var(--ink-500)' }} className="tnum">{est.rut || '—'}</td>
                    {partes.map((p, i) => (
                      <td key={cols[i].key} style={{ padding: '6px', textAlign: 'center', color: p.nota == null ? 'var(--ink-400)' : p.nota < 4 ? 'var(--danger)' : 'var(--ink-800)' }} className="tnum">{formatNotaCoord(p.nota)}</td>
                    ))}
                    <td style={{ padding: '6px', textAlign: 'center', background: 'var(--teal-50)', fontWeight: 700, fontSize: 12, color: !final || final.notaFinal == null ? 'var(--ink-400)' : final.notaFinal < 4 ? 'var(--danger)' : 'var(--success)' }} className="tnum">{formatNotaCoord(final && final.notaFinal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 18, fontSize: 10.5, color: 'var(--ink-500)' }}>
              Exigencia 60% · Aprobación con nota 4,0 · Las notas en rojo indican reprobación.
            </div>
            <div style={{ marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--ink-500)' }}>
              Firma coordinador/a: ________________________________
              <span style={{ marginLeft: 48 }}>Fecha: ________________</span>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary" onClick={() => bodyRef.current && openPrintWindow(bodyRef.current, title, false)}><I.print /> Imprimir</button>
          <button className="btn btn-primary" onClick={() => bodyRef.current && openPrintWindow(bodyRef.current, title, true)}><I.download /> PDF</button>
        </div>
      </div>
    </div>
  );
}

function NotasCoordScreen({ ctx }) {
  const { useState } = React;
  const PRACS_INDEX = window.PRACTICAS_INDEX || [];
  const [practica, setPractica] = useState((PRACS_INDEX[0] && PRACS_INDEX[0].codigo) || 'I');
  const [exportOpen, setExportOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  window.activatePractica(practica);
  const D = window.USACH_DATA || {};
  const Cr = window.USACH_CALC || {};

  const state = (() => {
    try {
      const raw = localStorage.getItem(`usach_state_v1_${practica}_demo`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  })();

  // Roster real: estudiantes de la práctica activa según la base del coordinador.
  const realRoster = (ctx.students || []).filter(s => s.practica === practica);
  const estudiantes = (state && state.estudiantes && state.estudiantes.length) ? state.estudiantes : realRoster;
  const cols = D.NOTAS_COLUMNS || [];

  const filas = estudiantes.map(est => ({
    est,
    partes: state ? cols.map(col => notaColumnaCoord(col, est.id, state, D, Cr)) : cols.map(() => ({ nota: null })),
    final: state && Cr.calcNotaFinal ? Cr.calcNotaFinal(est.id, state) : null,
  }));

  const conNota = filas.filter(f => f.final && f.final.notaFinal != null).length;
  const reprobados = filas.filter(f => f.final && f.final.notaFinal != null && f.final.notaFinal < 4).length;

  return (
    <div data-screen-label="Notas">
      <div className="section-head">
        <div>
          <h1>Notas registradas por profesores</h1>
          <div className="subtitle">Vista consolidada de las evaluaciones ingresadas en cada práctica</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setConfigOpen(true)}>
            <I.calendar /> Configurar inicio de práctica
          </button>
          <button className="btn btn-secondary btn-sm" disabled={estudiantes.length === 0} onClick={() => setExportOpen(true)}>
            <I.download /> Exportar / Imprimir
          </button>
        </div>
      </div>

      <div className="tabs">
        {PRACS_INDEX.map(p => (
          <button key={p.codigo} className={practica === p.codigo ? 'active' : ''} onClick={() => setPractica(p.codigo)}>
            {p.codigo}
          </button>
        ))}
      </div>

      {estudiantes.length === 0 && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: 13.5 }}>
            No hay estudiantes asignados a esta práctica todavía.
          </div>
        </div>
      )}

      {estudiantes.length > 0 && (
        <>
          {!state && (
            <div className="drag-hint" style={{ marginBottom: 16 }}>
              El profesor a cargo aún no ha ingresado evaluaciones para esta práctica. Se muestra la nómina asignada sin notas.
            </div>
          )}

          <div className="coord-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
            <div className="stat-card">
              <div className="stat-lbl">Estudiantes</div>
              <div className="stat-val">{estudiantes.length}</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-lbl">Con nota final</div>
              <div className="stat-val">{conNota}</div>
              <div className="stat-sub">de {estudiantes.length}</div>
            </div>
            <div className="stat-card" style={{ borderLeft: reprobados > 0 ? '3px solid #dc2626' : undefined }}>
              <div className="stat-lbl">Reprobados</div>
              <div className="stat-val" style={{ color: reprobados > 0 ? 'var(--danger)' : undefined }}>{reprobados}</div>
            </div>
          </div>

          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-1)' }}>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-500)' }}>Estudiante</th>
                    {cols.map(col => (
                      <th key={col.key} style={{ padding: '9px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-500)' }} title={col.sub}>
                        {col.label}
                      </th>
                    ))}
                    <th style={{ padding: '9px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-500)', background: 'var(--teal-50)' }}>Final</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(({ est, partes, final }) => (
                    <tr key={est.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{est.nombre}</td>
                      {partes.map((p, i) => (
                        <td key={cols[i].key} style={{ padding: '10px 8px', textAlign: 'center', color: p.nota == null ? 'var(--ink-400)' : p.nota < 4 ? 'var(--danger)' : 'var(--ink-800)' }} className="tnum">
                          {formatNotaCoord(p.nota)}
                        </td>
                      ))}
                      <td style={{ padding: '10px 8px', textAlign: 'center', background: 'var(--teal-50)', fontWeight: 700, color: !final || final.notaFinal == null ? 'var(--ink-400)' : final.notaFinal < 4 ? 'var(--danger)' : 'var(--success)' }} className="tnum">
                        {formatNotaCoord(final && final.notaFinal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {exportOpen && <NotasExportModal practica={practica} D={D} cols={cols} filas={filas} onClose={() => setExportOpen(false)} />}
      {configOpen && (
        <ConfigurarInicioModal codigo={practica} D={D} state={state}
          onSaved={() => { setConfigOpen(false); ctx.toast && ctx.toast(`Semana 1 de ${practica} configurada`); }}
          onClose={() => setConfigOpen(false)} />
      )}
    </div>
  );
}

// Siembra un estado completo si aún no existe (para no escribir un objeto parcial que
// rompa la próxima lectura del profesor), y guarda inicioPractica. El setItem ya está
// parcheado por cloud.js (prefijo usach_state_v1_), así que sincroniza a Firestore solo.
function setInicioPracticaFor(codigo, iso) {
  window.activatePractica(codigo);
  const D = window.USACH_DATA;
  const key = `usach_state_v1_${codigo}_demo`;
  let state = null;
  try {
    const raw = localStorage.getItem(key);
    state = raw ? JSON.parse(raw) : null;
  } catch (e) { state = null; }
  if (!state || !Array.isArray(state.evaluaciones)) {
    state = D.initialState ? D.initialState('demo') : { evaluaciones: [], estudiantes: [] };
  }
  localStorage.setItem(key, JSON.stringify({ ...state, inicioPractica: iso }));
}

function ConfigurarInicioModal({ codigo, D, state, onSaved, onClose }) {
  const { useState } = React;
  const [iso, setIso] = useState((state && state.inicioPractica) || '');
  const evals = (state && state.evaluaciones && state.evaluaciones.length) ? state.evaluaciones : (D.EVALUACIONES || []);
  const earliest = evals.reduce((min, e) => (e.fecha && (!min || e.fecha < min)) ? e.fecha : min, null);
  const preview = iso
    ? evals
        .filter(e => e.semanaEntrega)
        .map(e => {
          const r = window.semanaRango(iso, e.semanaEntrega);
          return { ...e, startISO: r.startISO, endISO: r.endISO };
        })
        .sort((a, b) => a.semanaEntrega - b.semanaEntrega)
    : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.calendar />
          <h3 className="h3" style={{ margin: 0 }}>Configurar inicio de práctica — {codigo}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body">
          <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            Ingresa la fecha de inicio de la <strong>Semana 1</strong>. El sistema calculará automáticamente
            el rango de fechas de cada evaluación (7 días por semana) en todas las vistas. Las evaluaciones
            con una fecha fijada manualmente no se ven afectadas.
          </p>
          <div className="form-field">
            <label>Inicio de Semana 1</label>
            <input type="date" value={iso} onChange={e => setIso(e.target.value)} />
          </div>
          {earliest && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => setIso(earliest)}>
              Usar fecha más temprana registrada ({fechaFmt(earliest)})
            </button>
          )}
          {preview.length > 0 && (
            <div style={{ marginTop: 16, maxHeight: 260, overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '4px 6px' }}>Sem.</th>
                    <th style={{ textAlign: 'left', padding: '4px 6px' }}>Evaluación</th>
                    <th style={{ textAlign: 'left', padding: '4px 6px' }}>Rango calculado</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map(e => (
                    <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="tnum" style={{ padding: '4px 6px' }}>{e.semanaEntrega}</td>
                      <td style={{ padding: '4px 6px' }}>{e.titulo}</td>
                      <td style={{ padding: '4px 6px' }}>{window.fechaRangoFmt(e.startISO, e.endISO)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!iso} onClick={() => { setInicioPracticaFor(codigo, iso); onSaved(); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotasCoordScreen });
