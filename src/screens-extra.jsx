// screens-extra.jsx — EditEvalModal · CalendarModal · InformeAcademicoModal
// Uses globals: I, USACH_DATA, USACH_CALC, USACHCrest, formatNota, notaClass, fechaFmt, Field

const De = window.USACH_DATA;
const Ce = window.USACH_CALC;

// ═════════════════════════════════════════════════════════════
// EDIT EVAL MODAL
// ═════════════════════════════════════════════════════════════

function EditEvalModal({ ev, ctx, onClose }) {
  // Local working copy
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(ev)));
  const [tab, setTab] = useState('basico');
  const esTeal = window.grupoEsTeal(ev.grupo);
  const grupo = window.grupoDef(ev.grupo);
  const nivelesSetEv = Ce.nivelesSetForEval(ev);

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const setListItem = (key, i, val) => setDraft(d => {
    const arr = [...(d[key] || [])];
    arr[i] = val;
    return { ...d, [key]: arr };
  });
  const addListItem = (key) => setDraft(d => ({ ...d, [key]: [...(d[key] || []), ''] }));
  const removeListItem = (key, i) => setDraft(d => {
    const arr = [...(d[key] || [])];
    arr.splice(i, 1);
    return { ...d, [key]: arr };
  });

  const setCriterio = (i, val) => setDraft(d => {
    const cr = [...d.criterios];
    cr[i] = { ...cr[i], texto: val };
    return { ...d, criterios: cr };
  });
  const toggleDoble = (i) => setDraft(d => {
    const cr = [...d.criterios];
    cr[i] = { ...cr[i], doble: !cr[i].doble };
    return { ...d, criterios: cr };
  });

  const save = () => {
    ctx.updateEval(ev.id, draft);
    ctx.toast(`"${draft.titulo}" actualizada`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 880 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className={`lvl ${esTeal ? 'lvl-E' : 'lvl-B'}`}
                style={{ background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)', width: 28, height: 28, fontSize: 11 }}>
            {window.evalSigla(ev)}
          </span>
          <h3 className="h3" style={{ margin: 0 }}>Editar evaluación</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body" style={{ background: 'var(--bg)', padding: 0 }}>
          <div className="tabs" style={{ padding: '0 22px', margin: 0 }}>
            <button className={tab === 'basico' ? 'active' : ''} onClick={() => setTab('basico')}>Datos básicos</button>
            <button className={tab === 'contenido' ? 'active' : ''} onClick={() => setTab('contenido')}>Contenido</button>
            <button className={tab === 'criterios' ? 'active' : ''} onClick={() => setTab('criterios')}>Criterios ({draft.criterios.length})</button>
          </div>

          <div style={{ padding: '22px 24px' }}>
            {tab === 'basico' && (
              <div className="col" style={{ gap: 16 }}>
                <Field label="Título de la evaluación">
                  <input className="input" value={draft.titulo} onChange={e => set('titulo', e.target.value)} />
                </Field>
                <Field label="Descripción">
                  <textarea className="input" style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit', padding: 10 }}
                            value={draft.descripcion} onChange={e => set('descripcion', e.target.value)} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Field label="Tipo">
                    <select className="input" value={draft.tipo} onChange={e => set('tipo', e.target.value)}>
                      <option>Audiovisual</option>
                      <option>Informe</option>
                      <option>Terreno + Informe</option>
                      <option>Ensayo</option>
                      <option>Práctico</option>
                    </select>
                  </Field>
                  <Field label="Duración / extensión">
                    <input className="input" value={draft.duracion} onChange={e => set('duracion', e.target.value)} />
                  </Field>
                  <Field label="Fecha de entrega">
                    <input className="input" type="date" value={draft.fecha} onChange={e => set('fecha', e.target.value)} />
                    {draft.fechaManual && ctx.state.inicioPractica && draft.semanaEntrega && (
                      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6, padding: '3px 6px', fontSize: 11 }}
                              onClick={() => set('fechaManual', false)}>
                        <I.refresh size={12} /> Fecha fijada manualmente · Volver a automático (Semana {draft.semanaEntrega})
                      </button>
                    )}
                    {!draft.fechaManual && ctx.state.inicioPractica && draft.semanaEntrega && (() => {
                      const r = window.semanaRango(ctx.state.inicioPractica, draft.semanaEntrega);
                      return (
                        <small className="muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                          Automático: {window.fechaRangoFmt(r.startISO, r.endISO)}
                        </small>
                      );
                    })()}
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Puntaje máximo">
                    <input className="input" type="number" value={draft.maxPuntos} readOnly
                           style={{ background: 'var(--surface-1)', color: 'var(--ink-500)' }} />
                    <small className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                      Calculado desde la rúbrica · {ev.criterios.length} criterios × {nivelesSetEv.length} niveles
                    </small>
                  </Field>
                  <Field label="Estado">
                    <select className="input" value={draft.estado} onChange={e => set('estado', e.target.value)}>
                      <option value="pendiente">Pendiente</option>
                      <option value="en-evaluacion">En evaluación</option>
                      <option value="corregida">Corregida</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {tab === 'contenido' && (
              <div className="col" style={{ gap: 18 }}>
                <EditableList label="Resultados de aprendizaje" items={draft.resultadosAprendizaje}
                              onChange={(i, v) => setListItem('resultadosAprendizaje', i, v)}
                              onAdd={() => addListItem('resultadosAprendizaje')}
                              onRemove={(i) => removeListItem('resultadosAprendizaje', i)} />
                <EditableList label="Objetivos específicos" items={draft.objetivosEspecificos}
                              onChange={(i, v) => setListItem('objetivosEspecificos', i, v)}
                              onAdd={() => addListItem('objetivosEspecificos')}
                              onRemove={(i) => removeListItem('objetivosEspecificos', i)} />
                <EditableList label="Instrucciones" ordered items={draft.instrucciones}
                              onChange={(i, v) => setListItem('instrucciones', i, v)}
                              onAdd={() => addListItem('instrucciones')}
                              onRemove={(i) => removeListItem('instrucciones', i)} />
                <EditableList label="Aspectos formales" items={draft.aspectosFormales}
                              onChange={(i, v) => setListItem('aspectosFormales', i, v)}
                              onAdd={() => addListItem('aspectosFormales')}
                              onRemove={(i) => removeListItem('aspectosFormales', i)} />
                <EditableList label="Pautas para el estudiante" items={draft.pautasEstudiante || []}
                              onChange={(i, v) => setListItem('pautasEstudiante', i, v)}
                              onAdd={() => addListItem('pautasEstudiante')}
                              onRemove={(i) => removeListItem('pautasEstudiante', i)}
                              hint="Recomendaciones prácticas. Aparecen en el informe entregado al estudiante." />
                <EditableList label="Pautas para el evaluador" items={draft.pautas || []}
                              onChange={(i, v) => setListItem('pautas', i, v)}
                              onAdd={() => addListItem('pautas')}
                              onRemove={(i) => removeListItem('pautas', i)}
                              hint="Consideraciones internas del evaluador, no visibles para el estudiante." />
              </div>
            )}

            {tab === 'criterios' && (
              <div className="col" style={{ gap: 10 }}>
                <div className="muted" style={{ fontSize: 12.5, marginBottom: 4 }}>
                  Los criterios usan la escala estándar ({nivelesSetEv.map(n => `${n.label} (${n.pts})`).join(' · ')}). Marca "×2" para criterios con doble puntaje.
                </div>
                {draft.criterios.map((cr, i) => (
                  <div key={cr.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, background: 'var(--surface-1)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700, color: esTeal ? 'var(--teal-700)' : 'var(--orange-700)', minWidth: 28, paddingTop: 7 }} className="tnum">{i+1}.</span>
                    <textarea className="input" style={{ flex: 1, minHeight: 50, resize: 'vertical', fontFamily: 'inherit', padding: 8 }}
                              value={cr.texto} onChange={e => setCriterio(i, e.target.value)} />
                    <button className={`btn btn-sm ${cr.doble ? 'btn-orange' : 'btn-secondary'}`}
                            onClick={() => toggleDoble(i)} title="Doble puntaje">
                      ×2
                    </button>
                  </div>
                ))}
                <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  <I.warn size={13} /> Agregar o quitar criterios desde aquí afecta el puntaje máximo y la escala de notas. Coordina este cambio con la jefatura de carrera.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// EDIT FECHA MODAL — lightweight date-only editor (p. ej. evaluaciones
// sin rúbrica propia, como Presentación: Salidas a terreno)
// ═════════════════════════════════════════════════════════════

function EditFechaModal({ ev, ctx, onClose }) {
  const [fecha, setFecha] = useState(ev.fecha || '');
  const esTeal = window.grupoEsTeal(ev.grupo);

  const save = () => {
    ctx.updateEval(ev.id, { fecha });
    ctx.toast(`Fecha de "${ev.titulo}" actualizada`);
    onClose();
  };

  const volverAutomatico = () => {
    ctx.updateEval(ev.id, { fechaManual: false });
    ctx.toast(`Fecha de "${ev.titulo}" vuelta a automático`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className={`lvl ${esTeal ? 'lvl-E' : 'lvl-B'}`}
                style={{ background: esTeal ? 'var(--teal-500)' : 'var(--orange-500)', width: 28, height: 28, fontSize: 11 }}>
            {window.evalSigla(ev)}
          </span>
          <h3 className="h3" style={{ margin: 0 }}>Editar fecha de entrega</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ padding: 22 }}>
          <Field label="Fecha de entrega">
            <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </Field>
          {ev.fechaManual && ctx.state.inicioPractica && ev.semanaEntrega && (
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8, padding: '3px 6px', fontSize: 11 }}
                    onClick={volverAutomatico}>
              <I.refresh size={12} /> Fecha fijada manualmente · Volver a automático (Semana {ev.semanaEntrega})
            </button>
          )}
          {!ev.fechaManual && ctx.state.inicioPractica && ev.semanaEntrega && (() => {
            const r = window.semanaRango(ctx.state.inicioPractica, ev.semanaEntrega);
            return (
              <small className="muted" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
                Automático: {window.fechaRangoFmt(r.startISO, r.endISO)}
              </small>
            );
          })()}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

function EditableList({ label, items, onChange, onAdd, onRemove, ordered, hint }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>{label}</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onAdd}>
          <I.plus size={13} /> Añadir
        </button>
      </div>
      {hint && <div className="muted" style={{ fontSize: 11.5, marginBottom: 8 }}>{hint}</div>}
      <div className="col" style={{ gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ minWidth: 22, paddingTop: 7, color: 'var(--ink-400)', fontSize: 12, fontWeight: 600 }} className="tnum">
              {ordered ? `${i+1}.` : '·'}
            </span>
            <input className="input" style={{ flex: 1 }} value={it} onChange={e => onChange(i, e.target.value)} />
            <button className="btn btn-ghost btn-sm" onClick={() => onRemove(i)} title="Quitar"><I.trash size={13} /></button>
          </div>
        ))}
        {items.length === 0 && <div className="muted" style={{ fontSize: 12, fontStyle: 'italic', padding: 8 }}>Sin elementos. Añade el primero.</div>}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CALENDAR MODAL — drag/edit dates
// ═════════════════════════════════════════════════════════════

function CalendarModal({ ctx, onClose }) {
  const [year, setYear] = useState(2025);
  const [semester, setSemester] = useState('s2'); // 's1' (mar–jul) | 's2' (ago–dic)
  const months = semester === 's1'
    ? [2, 3, 4, 5, 6].map(m => ({ y: year, m }))   // Mar, Abr, May, Jun, Jul
    : [7, 8, 9, 10, 11].map(m => ({ y: year, m })); // Ago, Sep, Oct, Nov, Dic
  const [editing, setEditing] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const evals = ctx.state.evaluaciones;

  const onDrop = (iso) => {
    if (editing) {
      ctx.setEvalDate(editing.id, iso);
      ctx.toast(`"${editing.titulo}" reprogramada manualmente para ${fechaFmt(iso)}`);
      setEditing(null);
      setDragOver(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 1180, maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.calendar />
          <h3 className="h3" style={{ margin: 0 }}>Calendario de evaluaciones</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body" style={{ background: 'var(--bg)', padding: 24 }}>
          {/* Year + semester selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 4, background: 'var(--surface-1)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => setYear(y => y - 1)} title="Año anterior"><I.arrowLeft size={14} /></button>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-900)', minWidth: 50, textAlign: 'center' }} className="tnum">{year}</span>
              <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => setYear(y => y + 1)} title="Año siguiente"><I.arrowRight size={14} /></button>
            </div>
            <div style={{ display: 'inline-flex', background: 'var(--surface-1)', borderRadius: 8, border: '1px solid var(--border)', padding: 3 }}>
              <button onClick={() => setSemester('s1')}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                        background: semester === 's1' ? 'var(--bg)' : 'transparent',
                        color: semester === 's1' ? 'var(--ink-900)' : 'var(--ink-500)',
                        boxShadow: semester === 's1' ? 'var(--shadow-sm)' : 'none',
                      }}>1er semestre <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>mar–jul</span></button>
              <button onClick={() => setSemester('s2')}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                        background: semester === 's2' ? 'var(--bg)' : 'transparent',
                        color: semester === 's2' ? 'var(--ink-900)' : 'var(--ink-500)',
                        boxShadow: semester === 's2' ? 'var(--shadow-sm)' : 'none',
                      }}>2do semestre <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>ago–dic</span></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
              {(De.GRUPOS || []).map(g => <span key={g.id} className={`tag ${g.color === 'teal' ? 'tag-teal' : 'tag-orange'}`}><span className="tag-dot" />{g.label}</span>)}
            </div>
          </div>

          <div className="cal-months-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {months.map(m => (
              <MonthGrid key={`${m.y}-${m.m}`} year={m.y} month={m.m}
                         evals={evals} onDateClick={(iso) => {/* allow click to pick */}}
                         dragging={editing} dragOver={dragOver}
                         onDragStartEval={setEditing}
                         onDragOverDate={setDragOver}
                         onDropDate={onDrop}
                         onCellClick={(iso) => {
                           // if an eval is "selected" via click, move it
                           if (editing) {
                             onDrop(iso);
                           }
                         }} />
            ))}
          </div>

          <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-1)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-700)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <I.zap size={16} stroke="var(--teal-600)" />
            <div>
              <strong>Cómo reprogramar:</strong> arrastra una píldora de evaluación al nuevo día, o haz clic en la píldora y luego clic en la fecha destino.
              Las fechas se sincronizan automáticamente con el detalle de cada evaluación.
            </div>
          </div>
        </div>

        <div className="modal-foot">
          {editing && <span className="muted" style={{ marginRight: 'auto', fontSize: 13 }}>
            Moviendo: <strong>{editing.titulo}</strong>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setEditing(null)}>Cancelar</button>
          </span>}
          <button className="btn btn-secondary"><I.download /> Exportar calendario (.ics)</button>
          <button className="btn btn-primary" onClick={onClose}>Listo</button>
        </div>
      </div>
    </div>
  );
}

function MonthGrid({ year, month, evals, onCellClick, dragging, dragOver, onDragStartEval, onDragOverDate, onDropDate }) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // weekday: 0 = Mon, 6 = Sun (ISO)
  const startWeekday = (first.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isoOf = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: 'var(--surface-1)', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>
        {meses[month]} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
        {dias.map(d => (
          <div key={d} style={{ padding: '6px 0', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (d == null) return <div key={i} style={{ minHeight: 76, background: 'var(--surface-1)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />;
          const iso = isoOf(d);
          const evHere = evals.filter(e => e.fecha === iso);
          const isOver = dragOver === iso;
          const isToday = iso === '2025-09-15';
          return (
            <div key={i}
                 onDragOver={e => { e.preventDefault(); onDragOverDate(iso); }}
                 onDragLeave={() => onDragOverDate(null)}
                 onDrop={e => { e.preventDefault(); onDropDate(iso); }}
                 onClick={() => onCellClick(iso)}
                 style={{
                   minHeight: 76, padding: 4,
                   borderRight: '1px solid var(--border)',
                   borderBottom: '1px solid var(--border)',
                   background: isOver ? 'var(--teal-50)' : isToday ? 'rgba(0,150,136,0.04)' : 'var(--bg)',
                   cursor: dragging ? 'copy' : 'default',
                   transition: 'background 0.1s',
                   position: 'relative',
                 }}>
              <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--teal-700)' : 'var(--ink-700)', padding: '2px 4px' }}>
                {d}
              </div>
              <div className="col" style={{ gap: 2 }}>
                {evHere.map(ev => (
                  <div key={ev.id}
                       draggable
                       onDragStart={() => onDragStartEval(ev)}
                       onClick={(e) => { e.stopPropagation(); onDragStartEval(dragging?.id === ev.id ? null : ev); }}
                       title={ev.titulo + ' — arrastra o haz clic para reprogramar'}
                       style={{
                         padding: '3px 6px',
                         fontSize: 10.5, fontWeight: 600,
                         color: '#fff',
                         background: window.grupoEsTeal(ev.grupo) ? 'var(--teal-500)' : 'var(--orange-500)',
                         borderRadius: 4,
                         cursor: 'grab',
                         overflow: 'hidden',
                         textOverflow: 'ellipsis',
                         whiteSpace: 'nowrap',
                         outline: dragging?.id === ev.id ? '2px solid var(--ink-900)' : 'none',
                         outlineOffset: 1,
                       }}>
                    {window.evalSigla(ev)} · {ev.titulo.length > 16 ? ev.titulo.slice(0, 16) + '…' : ev.titulo}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// INFORME ACADÉMICO COMPLETO (rúbrica + escala + detalles)
// ═════════════════════════════════════════════════════════════

function InformeAcademicoModal({ ev, ctx, onClose }) {
  const meta = De.meta || {};
  const isSolemne = window.grupoEsTeal(ev.grupo); // usa color teal como acento principal
  const grupo = window.grupoDef(ev.grupo);
  const nivelesSet = Ce.nivelesSetForEval(ev);
  const escala = Ce.escalaForEval(ev);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 1000, maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.print />
          <h3 className="h3" style={{ margin: 0 }}>Informe académico — {grupo.singular} {ev.numero}</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>

        <div className="modal-body">
          {/* PORTADA */}
          <div className="pdf-page" style={{ padding: '72px 64px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 60 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-500)', fontWeight: 700 }}>Universidad de Santiago de Chile</div>
                <div style={{ fontSize: 13, color: 'var(--ink-600)', marginTop: 2 }}>Escuela de Cs. de la Actividad Física, Deporte y Salud · Entrenador Deportivo</div>
              </div>
              <USACHCrest size={56} />
            </div>

            <div style={{ marginTop: 80, marginBottom: 80 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: isSolemne ? 'var(--teal-700)' : 'var(--orange-700)', fontWeight: 700 }}>
                Informe académico de evaluación
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink-900)', margin: '12px 0 8px', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                {ev.titulo}
              </h1>
              <div style={{ fontSize: 14, color: 'var(--ink-600)' }}>
                {meta.cursoTitulo || 'Práctica'} · {grupo.singular} N° {ev.numero}
              </div>
              <div style={{ height: 3, width: 80, background: isSolemne ? 'var(--teal-500)' : 'var(--orange-500)', marginTop: 24 }} />
            </div>

            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <tbody>
                <CoverRow k="Profesor evaluador" v="Andrés Tapia Vergara" />
                <CoverRow k="Email institucional" v="andres.tapia@usach.cl" />
                <CoverRow k="Semestre" v="2025 — Segundo semestre" />
                <CoverRow k="Fecha de entrega" v={window.evalFechaInfo(ev, ctx.state).label} />
                <CoverRow k="Tipo de evaluación" v={ev.tipo} />
                <CoverRow k="Duración / extensión" v={ev.duracion} />
                <CoverRow k="Puntaje máximo" v={`${ev.maxPuntos} puntos`} />
                <CoverRow k="Exigencia" v="60%" />
              </tbody>
            </table>
            <div style={{ position: 'absolute', bottom: 40, left: 64, right: 64, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 10.5, color: 'var(--ink-500)' }}>
              Documento generado el {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })} · Sistema de gestión de prácticas evaluativas USACH
            </div>
          </div>

          {/* 1. CARACTERIZACIÓN */}
          <div className="pdf-page">
            <SectionPdf title="1. Caracterización de la evaluación" accent={isSolemne ? 'teal' : 'orange'}>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, margin: '0 0 14px' }}>{ev.descripcion}</p>
              <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
                <tbody>
                  <CoverRow k="Grupo" v={grupo.label} />
                  <CoverRow k="Tipo" v={ev.tipo} />
                  <CoverRow k="Cantidad de criterios" v={`${ev.criterios.length} criterios (${ev.criterios.filter(c=>c.doble).length} con doble puntaje)`} />
                  <CoverRow k="Niveles de desempeño" v={nivelesSet.map(n => `${n.label} (${n.pts} pt)`).join(' · ')} />
                </tbody>
              </table>
            </SectionPdf>

            <SectionPdf title="2. Resultados de aprendizaje" accent={isSolemne ? 'teal' : 'orange'}>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
                {ev.resultadosAprendizaje.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
              </ol>
            </SectionPdf>

            <SectionPdf title="3. Objetivos específicos" accent={isSolemne ? 'teal' : 'orange'}>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
                {ev.objetivosEspecificos.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
              </ol>
            </SectionPdf>

            <SectionPdf title="4. Instrucciones para el estudiante" accent={isSolemne ? 'teal' : 'orange'}>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
                {ev.instrucciones.map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}
              </ol>
            </SectionPdf>

            <SectionPdf title="5. Aspectos formales" accent={isSolemne ? 'teal' : 'orange'}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
                {ev.aspectosFormales.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
              </ul>
            </SectionPdf>

            {ev.pautasEstudiante && ev.pautasEstudiante.length > 0 && (
              <SectionPdf title="6. Recomendaciones para el estudiante" accent={isSolemne ? 'teal' : 'orange'}>
                <div style={{ padding: 12, background: isSolemne ? 'var(--teal-50)' : 'var(--orange-50)', borderLeft: `3px solid ${isSolemne ? 'var(--teal-500)' : 'var(--orange-500)'}`, fontSize: 11.5, color: 'var(--ink-700)', marginBottom: 10, borderRadius: '0 4px 4px 0' }}>
                  Sugerencias prácticas para abordar la evaluación. No son criterios de calificación.
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
                  {ev.pautasEstudiante.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                </ul>
              </SectionPdf>
            )}

            {ev.pautas && ev.pautas.length > 0 && false && (
              <SectionPdf title="— oculto" accent={isSolemne ? 'teal' : 'orange'}>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
                  {ev.pautas.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                </ul>
              </SectionPdf>
            )}
          </div>

          {/* RÚBRICA */}
          <div className="pdf-page">
            <SectionPdf title="7. Rúbrica de evaluación" accent={isSolemne ? 'teal' : 'orange'}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-1)' }}>
                    <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left', width: 28 }}>N°</th>
                    <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'left' }}>Criterio</th>
                    {nivelesSet.map(n => (
                      <th key={n.key} style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'center', minWidth: 70 }}>
                        {n.label}<br /><span style={{ fontWeight: 400, color: 'var(--ink-500)' }}>{n.pts} pt</span>
                      </th>
                    ))}
                    <th style={{ padding: '8px 6px', borderBottom: '2px solid var(--ink-700)', textAlign: 'right', width: 50 }}>Máx.</th>
                  </tr>
                </thead>
                <tbody>
                  {ev.criterios.map((cr, i) => (
                    <tr key={cr.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 6px', verticalAlign: 'top', fontWeight: 700, color: isSolemne ? 'var(--teal-700)' : 'var(--orange-700)' }} className="tnum">{i+1}</td>
                      <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                        {cr.texto}
                        {cr.doble && <span style={{ display: 'inline-block', marginLeft: 6, fontSize: 9, fontWeight: 700, color: 'var(--orange-700)', background: 'var(--orange-50)', padding: '1px 5px', borderRadius: 999 }}>×2</span>}
                      </td>
                      {nivelesSet.map(n => (
                        <td key={n.key} style={{ padding: '8px 6px', verticalAlign: 'top', textAlign: 'center', fontSize: 10, color: 'var(--ink-600)' }}>
                          {i === 0 ? n.desc.length > 70 ? n.desc.slice(0,68) + '…' : n.desc : '—'}
                        </td>
                      ))}
                      <td style={{ padding: '8px 6px', verticalAlign: 'top', textAlign: 'right', fontWeight: 700 }} className="tnum">
                        {nivelesSet[0].pts * (cr.doble ? 2 : 1)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--surface-2)', borderTop: '2px solid var(--ink-700)' }}>
                    <td colSpan={2 + nivelesSet.length} style={{ padding: '10px 6px', fontWeight: 700, fontSize: 12 }}>Puntaje máximo total</td>
                    <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700, fontSize: 13 }} className="tnum">{ev.maxPuntos}</td>
                  </tr>
                </tbody>
              </table>
            </SectionPdf>

            <SectionPdf title="8. Escala de conversión de puntaje a nota (60% exigencia)" accent={isSolemne ? 'teal' : 'orange'}>
              <p style={{ fontSize: 11.5, color: 'var(--ink-600)', margin: '0 0 10px' }}>
                La nota se asigna en escala 1,0 – 7,0 con nota mínima de aprobación 4,0 al obtener el {Math.round(ev.maxPuntos * 0.6)}% del puntaje (60%).
              </p>
              <EscalaTable escala={escala} maxPuntos={ev.maxPuntos} />
            </SectionPdf>

            <SectionPdf title="9. Penalización por atraso" accent={isSolemne ? 'teal' : 'orange'}>
              <p style={{ fontSize: 12.5, margin: 0, lineHeight: 1.55 }}>
                Cada día calendario de atraso en la entrega descuenta <strong>0,5 puntos</strong> de la nota final de la evaluación, sin tope. La nota mínima posible tras descuento es <strong>1,0</strong>.
              </p>
            </SectionPdf>

            <SectionPdf title="10. Ponderación en la nota final del curso" accent={isSolemne ? 'teal' : 'orange'}>
              <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--ink-700)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Componente</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Ponderación</th>
                  </tr>
                </thead>
                <tbody>
                  {De.PONDERACIONES.map(p => {
                    const incluye = (p.componentes || []).includes(ev.id);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px dashed var(--border)', background: incluye ? (isSolemne ? 'var(--teal-50)' : 'var(--orange-50)') : 'transparent' }}>
                        <td style={{ padding: '6px 8px', fontWeight: incluye ? 700 : 400 }}>
                          {getPonderacionLabel(p, ctx.state.evaluaciones)} {incluye && <span style={{ fontSize: 10, color: isSolemne ? 'var(--teal-700)' : 'var(--orange-700)', marginLeft: 6 }}>← incluye esta evaluación</span>}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }} className="tnum">{Math.round(p.peso * 100)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </SectionPdf>

            <div style={{ marginTop: 28, padding: 14, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--ink-500)', textAlign: 'center' }}>
              USACH · Entrenador Deportivo · Lic. en Cs. de la Actividad Física y Deportes · Página de cierre · {new Date().getFullYear()}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-secondary"><I.print /> Imprimir</button>
          <button className="btn btn-primary"><I.download /> Descargar PDF</button>
        </div>
      </div>
    </div>
  );
}

function CoverRow({ k, v }) {
  return (
    <tr style={{ borderBottom: '1px dashed var(--border)' }}>
      <td style={{ padding: '7px 0', color: 'var(--ink-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, width: 200 }}>{k}</td>
      <td style={{ padding: '7px 0', color: 'var(--ink-800)', fontSize: 12.5, fontWeight: 500 }}>{v}</td>
    </tr>
  );
}

function SectionPdf({ title, accent = 'teal', children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em', color: accent === 'teal' ? 'var(--teal-700)' : 'var(--orange-700)', borderBottom: `2px solid ${accent === 'teal' ? 'var(--teal-500)' : 'var(--orange-500)'}`, paddingBottom: 4, marginBottom: 12, fontWeight: 700 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function EscalaTable({ escala, maxPuntos }) {
  const entries = Object.entries(escala).map(([p, n]) => ({ p: parseInt(p), n }));
  // Split into columns
  const half = Math.ceil(entries.length / 2);
  const cols = [entries.slice(0, half), entries.slice(half)];
  const aprobacion = entries.find(e => e.n >= 4.0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 18 }}>
        {cols.map((col, ci) => (
          <table key={ci} style={{ flex: 1, borderCollapse: 'collapse', fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--ink-700)' }}>
                <th style={{ padding: '4px 6px', textAlign: 'right', width: 60 }}>Puntos</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', width: 60 }}>Nota</th>
                <th style={{ padding: '4px 6px', textAlign: 'left' }}>Desempeño</th>
              </tr>
            </thead>
            <tbody>
              {col.map(e => (
                <tr key={e.p} style={{ borderBottom: '1px dashed var(--border)', background: e.p === aprobacion?.p ? 'var(--success-bg)' : 'transparent' }}>
                  <td style={{ padding: '3px 6px', textAlign: 'right' }} className="tnum">{e.p}</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: e.n >= 4.0 ? 700 : 500, color: e.n >= 4.0 ? 'var(--success)' : 'var(--danger)' }} className="tnum">{e.n.toFixed(1).replace('.', ',')}</td>
                  <td style={{ padding: '3px 6px', color: 'var(--ink-600)', fontSize: 10 }}>
                    {e.n >= 6.0 ? 'Sobresaliente' : e.n >= 5.0 ? 'Bueno' : e.n >= 4.0 ? 'Suficiente' : 'Insuficiente'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--ink-500)' }}>
        <span style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '1px 6px', borderRadius: 4, fontWeight: 600, marginRight: 6 }}>
          Aprobación: {aprobacion?.p} pts → 4,0
        </span>
        — equivalente al 60% del puntaje máximo ({maxPuntos} pts).
      </div>
    </div>
  );
}

Object.assign(window, {
  EditEvalModal, CalendarModal, InformeAcademicoModal, CoverRow, SectionPdf,
});
