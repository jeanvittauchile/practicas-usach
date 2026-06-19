// settings-modals.jsx — Profile, Course prefs, Notifications, Integrations, Export, Help, Logout
// Uses globals: I, USACH_DATA, Field, GDriveIcon

const { useState: useStateS } = React;

// ═══ PROFILE ═════════════════════════════════════════════════
function ProfileModal({ ctx, onClose }) {
  const [name, setName] = useStateS('Andrés Tapia Vergara');
  const [email, setEmail] = useStateS('andres.tapia@usach.cl');
  const [phone, setPhone] = useStateS('+56 9 8412 3344');
  const [title, setTitle] = useStateS('Profesor Supervisor');
  const [bio, setBio] = useStateS('Magíster en Ciencias de la Actividad Física. 12 años acompañando prácticas de pregrado.');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.user />
          <h3 className="h3" style={{ margin: 0 }}>Perfil del docente</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22, padding: 14, background: 'var(--surface-1)', borderRadius: 10 }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, background: 'linear-gradient(135deg, var(--teal-400), var(--orange-500))' }}>
              {name.split(' ').slice(0,2).map(n => n[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{title} · {email}</div>
            </div>
            <button className="btn btn-secondary btn-sm"><I.upload size={14} /> Cambiar foto</button>
          </div>
          <div className="col" style={{ gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nombre completo"><input className="input" value={name} onChange={e => setName(e.target.value)} /></Field>
              <Field label="Cargo"><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Email institucional"><input className="input" value={email} onChange={e => setEmail(e.target.value)} /></Field>
              <Field label="Teléfono"><input className="input" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
            </div>
            <Field label="Biografía breve">
              <textarea className="input" style={{ minHeight: 80, resize: 'vertical', fontFamily: 'inherit', padding: 10 }} value={bio} onChange={e => setBio(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { ctx.toast('Perfil actualizado'); onClose(); }}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

// ═══ COURSE PREFS ════════════════════════════════════════════
function CoursePrefsModal({ ctx, onClose }) {
  const [courseName, setCourseName] = useStateS('Práctica I — Introducción al Campo Laboral');
  const [year, setYear] = useStateS(2025);
  const [semester, setSemester] = useStateS('2');
  const [startDate, setStartDate] = useStateS('2025-08-04');
  const [endDate, setEndDate] = useStateS('2025-12-12');
  const [exigencia, setExigencia] = useStateS(60);
  const [penalty, setPenalty] = useStateS(0.5);
  const [retroactive, setRetroactive] = useStateS(true);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.settings />
          <h3 className="h3" style={{ margin: 0 }}>Preferencias del curso</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div className="col" style={{ gap: 14 }}>
            <Field label="Nombre del curso">
              <input className="input" value={courseName} onChange={e => setCourseName(e.target.value)} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Año académico">
                <input className="input" type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || year)} />
              </Field>
              <Field label="Semestre">
                <select className="input" value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="1">Primero (marzo–julio)</option>
                  <option value="2">Segundo (agosto–diciembre)</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Fecha de inicio">
                <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </Field>
              <Field label="Fecha de cierre">
                <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </Field>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Exigencia (%)">
                <input className="input" type="number" min="40" max="80" value={exigencia} onChange={e => setExigencia(parseInt(e.target.value) || 60)} />
              </Field>
              <Field label="Descuento por día de atraso (pts)">
                <input className="input" type="number" min="0" max="2" step="0.1" value={penalty} onChange={e => setPenalty(parseFloat(e.target.value) || 0.5)} />
              </Field>
            </div>
            <ToggleRow checked={retroactive} onChange={setRetroactive}
                       title="Recalcular notas retroactivamente"
                       desc="Al cambiar exigencia o descuentos, recalcula todas las notas ya ingresadas." />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { ctx.toast('Preferencias guardadas'); onClose(); }}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

// ═══ NOTIFICATIONS ═══════════════════════════════════════════
function NotificationsSettingsModal({ ctx, onClose }) {
  const [emailDigest, setEmailDigest] = useStateS('daily');
  const [submission, setSubmission] = useStateS(true);
  const [late, setLate] = useStateS(true);
  const [comments, setComments] = useStateS(true);
  const [reminders, setReminders] = useStateS(true);
  const [reportReady, setReportReady] = useStateS(false);
  const [quietHours, setQuietHours] = useStateS(true);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.bell />
          <h3 className="h3" style={{ margin: 0 }}>Notificaciones</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div className="col" style={{ gap: 6 }}>
            <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', margin: '0 0 6px' }}>Resumen por email</h4>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface-1)', borderRadius: 8, marginBottom: 14 }}>
              {[
                { v: 'realtime', l: 'En tiempo real' },
                { v: 'daily',    l: 'Diario' },
                { v: 'weekly',   l: 'Semanal' },
                { v: 'none',     l: 'Desactivado' },
              ].map(o => (
                <button key={o.v}
                        onClick={() => setEmailDigest(o.v)}
                        style={{
                          flex: 1, padding: '6px 8px', borderRadius: 6,
                          background: emailDigest === o.v ? 'var(--bg)' : 'transparent',
                          color: emailDigest === o.v ? 'var(--ink-900)' : 'var(--ink-500)',
                          fontSize: 12, fontWeight: 600,
                          boxShadow: emailDigest === o.v ? 'var(--shadow-sm)' : 'none',
                        }}>{o.l}</button>
              ))}
            </div>

            <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', margin: '6px 0 6px' }}>Eventos del curso</h4>
            <ToggleRow checked={submission} onChange={setSubmission}
                       title="Entregas de estudiantes" desc="Cada vez que un estudiante sube material." />
            <ToggleRow checked={late} onChange={setLate}
                       title="Atrasos detectados" desc="Cuando una entrega supera la fecha límite." />
            <ToggleRow checked={comments} onChange={setComments}
                       title="Comentarios y feedback" desc="Cuando recibes comentarios del coordinador." />
            <ToggleRow checked={reminders} onChange={setReminders}
                       title="Recordatorios de fechas" desc="3 / 7 / 15 días antes de cada evaluación." />
            <ToggleRow checked={reportReady} onChange={setReportReady}
                       title="Informes generados" desc="Cuando un informe PDF queda listo para descarga." />

            <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', margin: '14px 0 6px' }}>Horario tranquilo</h4>
            <ToggleRow checked={quietHours} onChange={setQuietHours}
                       title="Pausar entre 22:00 y 08:00" desc="No se envían emails ni notificaciones push durante este horario." />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { ctx.toast('Preferencias de notificaciones guardadas'); onClose(); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ═══ INTEGRATIONS ════════════════════════════════════════════
function IntegrationsModal({ ctx, onClose }) {
  const [driveEdit, setDriveEdit] = useStateS(false);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.paperclip />
          <h3 className="h3" style={{ margin: 0 }}>Integraciones</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div className="col" style={{ gap: 12 }}>
            <IntegrationRow
              icon={<GDriveIcon size={28} />}
              name="Google Drive"
              status="connected"
              desc="Carpeta sincronizada con las entregas y feedback del curso."
              meta={ctx.driveUrl}
              actions={
                <>
                  <a className="btn btn-secondary btn-sm" href={ctx.driveUrl || '#'} target="_blank" rel="noopener noreferrer">Abrir <I.arrowRight size={12} /></a>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDriveEdit(true)}>Reconfigurar</button>
                </>
              }
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>

      {driveEdit && <DriveConfigModal ctx={ctx} onClose={() => setDriveEdit(false)} />}
    </div>
  );
}

function IntegrationRow({ icon, name, status, desc, meta, actions }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 10, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <strong style={{ fontSize: 14 }}>{name}</strong>
          {status === 'connected' && <span className="tag tag-success" style={{ fontSize: 10 }}>Conectado</span>}
          {status === 'disconnected' && <span className="tag tag-outline" style={{ fontSize: 10 }}>Desconectado</span>}
        </div>
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.4 }}>{desc}</div>
        {meta && <div className="muted tnum" style={{ fontSize: 11, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>{actions}</div>
    </div>
  );
}

function DriveConfigModal({ ctx, onClose }) {
  const [url, setUrl] = useStateS(ctx.driveUrl || '');
  const [name, setName] = useStateS('Práctica I 2025-2');
  const valid = /^https?:\/\/(drive|docs)\.google\.com\//.test(url.trim());
  const save = () => {
    ctx.setDriveUrl(url.trim());
    ctx.toast('Drive del curso reconfigurado');
    onClose();
  };
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <GDriveIcon size={22} />
          <h3 className="h3" style={{ margin: 0 }}>Reconfigurar Google Drive</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
            Pega la URL de la carpeta compartida que contiene las subcarpetas de cada estudiante. La URL se guarda y se reutiliza en todos los accesos rápidos.
          </p>
          <div className="col" style={{ gap: 14 }}>
            <Field label="Nombre identificable de la carpeta">
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Práctica I 2025-2" />
            </Field>
            <Field label="URL de la carpeta">
              <input className="input" autoFocus value={url} onChange={e => setUrl(e.target.value)}
                     placeholder="https://drive.google.com/drive/folders/…"
                     style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }} />
              {url.trim() && !valid && (
                <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--warn)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <I.warn size={12} /> La URL no parece de Google Drive — verifica el enlace.
                </div>
              )}
            </Field>
            <div style={{ padding: 12, background: 'var(--surface-1)', borderRadius: 8, fontSize: 12, color: 'var(--ink-600)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <I.zap size={16} stroke="var(--teal-600)" />
              <div>
                <strong>Cómo obtener la URL:</strong> en Drive abre tu carpeta, copia la dirección del navegador o usa "Compartir → Copiar enlace". Asegúrate que los estudiantes tengan permisos de acceso.
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          {ctx.driveUrl && (
            <button className="btn btn-ghost" style={{ marginRight: 'auto', color: 'var(--danger)' }}
                    onClick={() => { ctx.setDriveUrl(''); ctx.toast('Drive desconectado'); onClose(); }}>
              Desconectar
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!url.trim()}
                  style={!url.trim() ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                  onClick={save}>Guardar URL</button>
        </div>
      </div>
    </div>
  );
}

// ═══ EXPORT ══════════════════════════════════════════════════
function ExportModal({ ctx, onClose }) {
  const [format, setFormat] = useStateS('zip');
  const [include, setInclude] = useStateS({
    estudiantes: true, evaluaciones: true, rubricas: true,
    supervisor: true, anexos: true, comentarios: true,
  });
  const toggle = (k) => setInclude(o => ({ ...o, [k]: !o[k] }));

  const startExport = () => {
    ctx.toast('Exportación iniciada. Recibirás un email al finalizar.');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.download />
          <h3 className="h3" style={{ margin: 0 }}>Exportar datos del curso</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
            Genera un respaldo completo o parcial de Práctica I para archivo institucional o migración.
          </p>

          <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', margin: '0 0 8px' }}>Formato de salida</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
            {[
              { v: 'zip',   l: 'ZIP completo',  d: 'Incluye PDFs y CSVs.' },
              { v: 'xlsx',  l: 'Excel',         d: 'Una hoja por sección.' },
              { v: 'json',  l: 'JSON',          d: 'Para migración a otro sistema.' },
            ].map(o => (
              <button key={o.v} onClick={() => setFormat(o.v)}
                      style={{
                        padding: 12, borderRadius: 10,
                        border: format === o.v ? '2px solid var(--teal-500)' : '1px solid var(--border)',
                        background: format === o.v ? 'var(--teal-50)' : 'var(--bg)',
                        textAlign: 'left',
                      }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: format === o.v ? 'var(--teal-800)' : 'var(--ink-900)' }}>{o.l}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{o.d}</div>
              </button>
            ))}
          </div>

          <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', margin: '0 0 8px' }}>Contenido a incluir</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { k: 'estudiantes', l: 'Lista de estudiantes', n: '5 registros' },
              { k: 'evaluaciones', l: 'Definición de evaluaciones', n: '6 rúbricas' },
              { k: 'rubricas', l: 'Rúbricas completadas', n: '30 calificaciones' },
              { k: 'supervisor', l: 'Eval. supervisor y autoeval.', n: '10 fichas' },
              { k: 'anexos', l: 'Anexos (PDFs)', n: '5 archivos' },
              { k: 'comentarios', l: 'Comentarios y feedback', n: '12 entradas' },
            ].map(o => (
              <label key={o.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: include[o.k] ? 'var(--teal-50)' : 'var(--bg)' }}>
                <input type="checkbox" checked={include[o.k]} onChange={() => toggle(o.k)}
                       style={{ accentColor: 'var(--teal-500)', width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{o.l}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{o.n}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={startExport}>
            <I.download /> Iniciar exportación
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ HELP ════════════════════════════════════════════════════
function HelpModal({ ctx, onClose }) {
  const faqs = [
    { q: '¿Cómo se calcula la nota final?', a: 'Se aplica la escala 60% de exigencia a cada evaluación. Las 6 evaluaciones se ponderan según el reglamento del curso (S1+T2: 20%, S2: 20%, S3: 20%, T1+T3: 20%, Supervisor: 15%, Autoevaluación: 5%).' },
    { q: '¿Cómo cambio una fecha de entrega?', a: 'Desde el Calendario (botón en Evaluaciones) arrastra una píldora a otro día, o desde el detalle de la evaluación haz clic en Editar.' },
    { q: '¿El descuento por atraso se puede deshabilitar?', a: 'Sí, en Preferencias del curso pon el descuento en 0,0 pts/día.' },
    { q: '¿Cómo agrego un nuevo estudiante a mitad de semestre?', a: 'Estudiantes → Agregar estudiante. Queda inscrito automáticamente en las 6 evaluaciones + Supervisor + Autoeval.' },
    { q: '¿Puedo exportar el curso completo?', a: 'Sí, en Configuración → Exportar datos. Soporta ZIP, Excel y JSON.' },
  ];
  const [openIdx, setOpenIdx] = useStateS(0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.doc />
          <h3 className="h3" style={{ margin: 0 }}>Ayuda y documentación</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
            <HelpQuick icon="doc" label="Guía completa" sub="PDF · 24 pp." />
            <HelpQuick icon="video" label="Videos tutoriales" sub="5 lecciones" />
            <HelpQuick icon="mail" label="Contactar soporte" sub="soporte@usach.cl" />
          </div>
          <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-500)', margin: '0 0 8px' }}>Preguntas frecuentes</h4>
          <div className="col" style={{ gap: 6 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                        style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', textAlign: 'left' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{f.q}</span>
                  <I.chev size={14} style={{ transform: openIdx === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openIdx === i && (
                  <div style={{ padding: '0 14px 14px 14px', fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 14, background: 'var(--surface-1)', borderRadius: 8, fontSize: 12, color: 'var(--ink-600)', textAlign: 'center' }}>
            ¿No encuentras lo que buscas? <strong style={{ color: 'var(--teal-700)' }}>Escríbenos a soporte@usach.cl</strong>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function HelpQuick({ icon, label, sub }) {
  const IconC = I[icon];
  return (
    <button style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', textAlign: 'center', cursor: 'pointer' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'grid', placeItems: 'center', margin: '0 auto 6px' }}>
        <IconC size={16} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{label}</div>
      <div className="muted" style={{ fontSize: 11 }}>{sub}</div>
    </button>
  );
}

// ═══ LOGOUT ═════════════════════════════════════════════════
function LogoutModal({ ctx, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.x stroke="var(--danger)" />
          <h3 className="h3" style={{ margin: 0 }}>Cerrar sesión</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <p style={{ margin: '0 0 14px', fontSize: 14 }}>¿Confirmas que quieres cerrar tu sesión?</p>
          <div style={{ padding: 12, background: 'var(--surface-1)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-600)' }}>
            Tus cambios sin guardar se perderán. Asegúrate de haber guardado todas las calificaciones antes de salir.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => { ctx.toast('Sesión cerrada (demo)'); onClose(); }}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

// ═══ MI DISPONIBILIDAD HORARIA ═══════════════════════════════
// Cada profesor registra sus bloques disponibles; se escriben en el store
// compartido (localStorage 'coord_profs') y aparecen en la plataforma del
// coordinador (Profesores → Disponibilidad horaria) emparejados por correo.
function DisponibilidadModal({ ctx, onClose }) {
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const KEY = 'coord_profs';
  const auth = window.__authUser || {};
  const readProfs = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } };
  const findIdx = (list) => list.findIndex(p => (p.email || '').toLowerCase() === (auth.email || '').toLowerCase());

  const [blocks, setBlocks] = useStateS(() => {
    const list = readProfs(); const i = findIdx(list);
    return i >= 0 ? (list[i].disponibilidad || []) : [];
  });
  const add = () => setBlocks(b => [...b, { dia: 'Lun', desde: '09:00', hasta: '13:00' }]);
  const upd = (i, k, v) => setBlocks(b => b.map((x, ix) => ix === i ? { ...x, [k]: v } : x));
  const rm  = (i) => setBlocks(b => b.filter((_, ix) => ix !== i));

  const save = () => {
    const list = readProfs();
    const i = findIdx(list);
    if (i >= 0) list[i] = { ...list[i], disponibilidad: blocks };
    else list.push({ id: 'p_' + Date.now(), nombre: auth.nombre || auth.email || 'Profesor/a', email: auth.email || '', rol: 'profesor', practicasAsignadas: [], horasAsignadas: 0, disponibilidad: blocks });
    localStorage.setItem(KEY, JSON.stringify(list));
    ctx.toast('Disponibilidad guardada · visible para coordinación');
    onClose();
  };

  const inputStyle = { padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--ink-900)' };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <I.clock />
          <h3 className="h3" style={{ margin: 0 }}>Mi disponibilidad horaria</h3>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body" style={{ background: 'var(--bg)', padding: 22 }}>
          <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
            Registra los bloques de días y horas en que puedes realizar supervisión en terreno. La coordinación los verá para asignarte a centros de práctica compatibles.
          </p>
          <div className="col" style={{ gap: 8 }}>
            {blocks.length === 0 && <div className="muted" style={{ fontSize: 13, padding: '6px 0' }}>Aún no registras bloques. Agrega el primero ↓</div>}
            {blocks.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select value={b.dia} onChange={e => upd(i, 'dia', e.target.value)} style={{ ...inputStyle, minWidth: 80 }}>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" value={b.desde} onChange={e => upd(i, 'desde', e.target.value)} style={inputStyle} />
                <span style={{ color: 'var(--ink-400)' }}>→</span>
                <input type="time" value={b.hasta} onChange={e => upd(i, 'hasta', e.target.value)} style={inputStyle} />
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => rm(i)}><I.x size={14} /></button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={add}><I.plus size={14} /> Agregar bloque</button>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Guardar disponibilidad</button>
        </div>
      </div>
    </div>
  );
}

// ═══ Shared toggle row ═══════════════════════════════════════
function ToggleRow({ checked, onChange, title, desc }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: 'var(--bg)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{title}</div>
        {desc && <div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{desc}</div>}
      </div>
      <div style={{ position: 'relative' }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, position: 'absolute' }} />
        <div style={{
          width: 38, height: 22, borderRadius: 999,
          background: checked ? 'var(--teal-500)' : 'var(--ink-200)',
          transition: 'background 0.15s', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: checked ? 18 : 2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', transition: 'left 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>
    </label>
  );
}

Object.assign(window, {
  ProfileModal, CoursePrefsModal, NotificationsSettingsModal,
  IntegrationsModal, DriveConfigModal, ExportModal, HelpModal, LogoutModal,
  DisponibilidadModal, ToggleRow,
});
