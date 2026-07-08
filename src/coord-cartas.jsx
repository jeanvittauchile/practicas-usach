// coord-cartas.jsx — Cartas de presentación + Reportes
// Formato oficial ECIADES — Solicitud de autorización de práctica

// ─── Configuración de prácticas (título completo + año de la malla) ─────────
const CARTA_PRACTICA_TITULO = {
  I:   'Práctica I: Introducción al Campo Laboral',
  II:  'Práctica II: Escuelas y Talleres Deportivos',
  III: 'Práctica III: Intervención en Fitness y Actividad Física',
  IV:  'Práctica IV: Deportes Individuales/Colectivos',
  PI:  'Práctica Profesional I',
  PII: 'Práctica Profesional II',
};
const CARTA_PRACTICA_ANIO = { I:1, II:2, III:3, IV:4, PI:5, PII:5 };
const CARTA_COORD_DEFAULT = 'Natalia Osorio Riquelme';
const CARTA_COORD_CARGO_DEFAULT = 'Coordinadora de Prácticas';
const CARTA_PERIODO_DEFAULT = 'desde el mes de septiembre hasta la primera semana del mes de diciembre del presente año';
const CARTA_OBJETIVO_DEFAULT = 'La labor inicial del/de la estudiante es de apoyo al entrenador/a tutor/a, con el objetivo de conocer y desempeñarse en un contexto laboral, desarrollando labores de carácter profesional, técnicas y metodológicas en su centro, de forma responsable y comprometida, vivenciando la realidad del deporte y ejecutando una planificación en relación a un objetivo planteado por el entrenador/a tutor/a.';

// Divide "Antonia Pérez Vega" → { nombres:'Antonia', apPaterno:'Pérez', apMaterno:'Vega' }
function splitNombre(full) {
  const t = (full || '').trim().split(/\s+/).filter(Boolean);
  if (t.length === 0) return { nombres:'', apPaterno:'', apMaterno:'' };
  if (t.length === 1) return { nombres:t[0], apPaterno:'', apMaterno:'' };
  if (t.length === 2) return { nombres:t[0], apPaterno:t[1], apMaterno:'' };
  // últimos 2 = apellidos, el resto = nombres
  return { nombres: t.slice(0, -2).join(' '), apPaterno: t[t.length-2], apMaterno: t[t.length-1] };
}

const _esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const _mesAnio = iso => {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  if (!iso) { const d = new Date(); return `${meses[d.getMonth()][0].toUpperCase()+meses[d.getMonth()].slice(1)} de ${d.getFullYear()}`; }
  const [y,m] = iso.split('-');
  const mes = meses[parseInt(m)-1] || '';
  return `${mes ? mes[0].toUpperCase()+mes.slice(1) : ''} de ${y}`;
};

// ─── Construye el HTML de la carta (1 o varios estudiantes) ─────────────────
function buildCartaHTML(p) {
  const LH = window.ECIADES_LETTERHEAD || '';
  const plural = p.students.length > 1;
  const titulo = p.tituloPractica || CARTA_PRACTICA_TITULO[p.practica] || ('Práctica ' + p.practica);
  const anio = p.anio || CARTA_PRACTICA_ANIO[p.practica] || 4;
  const sujeto      = plural ? 'de los/las estudiantes' : 'del/de la estudiante';
  const sujetoEstar = plural ? 'Los/Las estudiantes estarán presentes' : 'El/La estudiante estará presente';
  const sujetoDatos = plural ? 'Los datos de los/las estudiantes son los siguientes:' : 'Los datos del/de la estudiante son los siguientes:';
  const sujetoSeguro = plural
    ? 'Es relevante mencionar que los/las estudiantes están protegidos/as por el Seguro de Accidente Escolar Ley N° 16.744 DS 313.'
    : 'Es relevante mencionar que el/la estudiante está protegido/a por el Seguro de Accidente Escolar Ley N° 16.744 DS 313.';
  const filas = p.students.map(s => `<tr>
    <td>${_esc(s.apPaterno)}</td>
    <td>${_esc(s.apMaterno)}</td>
    <td>${_esc(s.nombres)}</td>
    <td class="rut">${_esc(s.rut) || '—'}</td>
    <td>${_esc(s.deporte) || '—'}</td>
    <td class="hor">${_esc(s.horario) || '—'}</td></tr>`).join('');

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/>
<title>Carta de Presentación – ${_esc(p.institucion)}</title>
<style>
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
  @page { size: letter; margin: 20mm 24mm 18mm; }
  html, body { margin: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11.5pt; color: #1c1c1c; line-height: 1.5; }
  .topbar { background:#0f8a8a; color:#fff; padding:10px 18px; display:flex; align-items:center; gap:10px; font-size:9.5pt; position:sticky; top:0; }
  .topbar button { margin-left:auto; background:#fff; color:#0f8a8a; border:none; padding:7px 18px; border-radius:4px; font-weight:700; cursor:pointer; font-size:9.5pt; }
  @media print { .topbar { display:none; } }
  .sheet { max-width: 168mm; margin: 0 auto; padding: 26px 0 40px; }
  .lh { margin-bottom: 30px; }
  .lh img { height: 60px; width: auto; display: block; }
  .lh .fallback { color:#0f8a8a; font-weight:800; font-size:12pt; line-height:1.25; letter-spacing:.01em; }
  .fecha { text-align: right; margin: 0 0 26px; }
  .dest { margin-bottom: 22px; line-height: 1.32; }
  .dest .sal { margin-bottom: 1px; }
  .dest .nm { font-weight: 700; text-transform: uppercase; }
  .cuerpo p { margin: 0 0 13px; text-align: justify; }
  .datos-lbl { margin: 4px 0 7px; }
  table.datos { width: 100%; border-collapse: collapse; margin: 0 0 16px; font-size: 9.5pt; }
  table.datos th { background: #0f8a8a; color: #fff; padding: 7px 8px; text-align: center; font-size: 7.6pt; font-weight: 700; text-transform: uppercase; letter-spacing: .02em; border: 1px solid #0c7273; line-height: 1.22; }
  table.datos td { padding: 6px 8px; border: 1px solid #cdd9d9; text-align: center; vertical-align: middle; }
  table.datos td.rut { white-space: nowrap; }
  table.datos td.hor { text-align: left; white-space: pre-line; font-size: 9pt; line-height: 1.3; }
  table.datos tr:nth-child(even) td { background: #f4f9f9; }
  .despedida { margin: 16px 0 0; text-align: justify; }
  .firma { margin-top: 64px; text-align: center; }
  .firma .ln { width: 230px; margin: 0 auto 6px; border-top: 1px solid #555; }
  .firma .nm { font-weight: 700; }
  .firma .rl { font-size: 10pt; color: #444; }
</style></head><body>
<div class="topbar">Carta de presentación — ${_esc(p.institucion)}${plural ? ` · ${p.students.length} estudiantes` : ''}
  <button onclick="window.print()">Guardar como PDF</button></div>
<div class="sheet">
  <div class="lh">${LH ? `<img src="${LH}" alt="ECIADES · Universidad de Santiago de Chile"/>` : `<div class="fallback">ESCUELA DE CIENCIAS DE LA ACTIVIDAD<br/>FÍSICA, LA SALUD Y EL DEPORTE</div>`}</div>
  <div style="font-weight:700; margin-bottom:2px;">Facultad de Ciencias Médicas</div>
  <div style="margin-bottom:24px;">Carrera: Entrenador Deportivo</div>
  <div class="fecha">Santiago, ${_mesAnio(p.fechaEmision)}</div>
  <div class="dest">
    <div class="sal">${_esc(p.salutation || 'Señor/a')}</div>
    <div class="nm">${_esc(p.destinatario) || '—'}</div>
    ${p.cargoDestinatario ? `<div>${_esc(p.cargoDestinatario)}</div>` : ''}
    <div>${_esc(p.institucion)}</div>
    <div>Presente</div>
  </div>
  <div class="cuerpo">
    <p>Junto con saludar, en nombre de la Escuela de Ciencias de la Actividad Física, el Deporte y la Salud (ECIADES), dependiente de la Facultad de Ciencias Médicas de la Universidad de Santiago de Chile, me dirijo a Ud. para solicitar la autorización de la realización de la “${_esc(titulo)}” ${sujeto} de ${anio}° año de la Carrera Entrenador Deportivo de nuestra Universidad. Práctica que corresponde a una asignatura regular de la malla curricular.</p>
    <p>${sujetoEstar} en el centro de práctica cumpliendo con ${_esc(p.horasSemanales)} horas semanales por ${_esc(p.semanas)} semanas, con un total de ${_esc(p.totalHoras)} horas, en día y horario ya establecido en la tabla adjunta. Este proceso se realizará formalmente ${_esc(p.periodo || CARTA_PERIODO_DEFAULT)}.</p>
    <p>${_esc(p.objetivo || CARTA_OBJETIVO_DEFAULT)}</p>
    <p class="datos-lbl">${sujetoDatos}</p>
    <table class="datos">
      <thead><tr>
        <th>Apellido<br/>Paterno</th><th>Apellido<br/>Materno</th><th>Nombres</th>
        <th>RUT</th><th>Deporte</th><th>Horario</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <p>${sujetoSeguro}</p>
    <p class="despedida">Sin otro particular y agradeciendo desde ya su apoyo y colaboración en la formación ${sujeto} de nuestra Escuela, se despide atentamente,</p>
  </div>
  <div class="firma">
    <div class="ln"></div>
    <div class="nm">${_esc(p.coordinadora || CARTA_COORD_DEFAULT)}</div>
    <div class="rl">${_esc(p.coordinadoraCargo || CARTA_COORD_CARGO_DEFAULT)}</div>
    <div class="rl">Entrenador Deportivo – U. Santiago de Chile</div>
  </div>
</div>
${p.autoprint ? '<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script>' : ''}
</body></html>`;
  if (p.returnHTML) return html;
  const w = window.open('', '_blank', 'width=920,height=760');
  if (!w) { alert('Habilita las ventanas emergentes para generar el PDF.'); return; }
  w.document.write(html);
  w.document.close();
}

// Mapea una carta guardada → payload y abre el PDF (1 estudiante)
function generarCartaPDF(carta, opts) {
  const sp = splitNombre(carta.estudianteNombre);
  buildCartaHTML({
    salutation: carta.salutation || 'Señor/a',
    destinatario: carta.destinatario || '',
    cargoDestinatario: carta.cargoDestinatario || '',
    institucion: carta.institucion,
    practica: carta.practica,
    tituloPractica: carta.tituloPractica,
    anio: carta.anio,
    fechaEmision: carta.fechaEmision,
    horasSemanales: carta.horasSemanales || 4,
    semanas: carta.semanas || 12,
    totalHoras: carta.totalHoras || ((carta.horasSemanales||4) * (carta.semanas||12)),
    periodo: carta.periodo,
    objetivo: carta.objetivo,
    coordinadora: carta.coordinadora,
    coordinadoraCargo: carta.coordinadoraCargo,
    students: [{
      apPaterno: carta.apPaterno != null ? carta.apPaterno : sp.apPaterno,
      apMaterno: carta.apMaterno != null ? carta.apMaterno : sp.apMaterno,
      nombres:   carta.nombres   != null ? carta.nombres   : sp.nombres,
      rut: carta.rut,
      deporte: carta.deporte || '',
      horario: carta.horario || '',
    }],
    autoprint: opts && opts.autoprint,
  });
}

// Carta masiva: una sola carta con varios estudiantes en la tabla adjunta
function generarCartaMasivaPDF(payload) {
  buildCartaHTML({
    salutation: payload.salutation || 'Señor/a',
    destinatario: payload.destinatario || '',
    cargoDestinatario: payload.cargoDestinatario || '',
    institucion: payload.institucion,
    practica: payload.students[0] ? payload.students[0].practica : 'IV',
    tituloPractica: payload.tituloPractica,
    anio: payload.anio,
    fechaEmision: payload.fechaEmision,
    horasSemanales: payload.horasSemanales || 4,
    semanas: payload.semanas || 12,
    totalHoras: payload.totalHoras || ((payload.horasSemanales||4) * (payload.semanas||12)),
    periodo: payload.periodo,
    objetivo: payload.objetivo,
    coordinadora: payload.coordinadora,
    coordinadoraCargo: payload.coordinadoraCargo,
    students: payload.students.map(s => {
      const sp = splitNombre(s.nombre);
      return {
        apPaterno: s.apPaterno != null ? s.apPaterno : sp.apPaterno,
        apMaterno: s.apMaterno != null ? s.apMaterno : sp.apMaterno,
        nombres:   s.nombres   != null ? s.nombres   : sp.nombres,
        rut: s.rut, deporte: s.deporte || '', horario: s.horario || '',
      };
    }),
    autoprint: payload.autoprint,
  });
}

// ─── Catálogo PDF ────────────────────────────────────────────────
function generarCatalogoPDF(practicaCodigo) {
  const full = window.EVAL_CATALOG || [];
  const catalog = practicaCodigo ? full.filter(p => p.codigo === practicaCodigo) : full;
  const scopeTitle = practicaCodigo ? (catalog[0] ? catalog[0].nombre.replace(/—.*/, '').trim() : practicaCodigo) : 'Todas las Prácticas';
  const fecha = new Date().toLocaleDateString('es-CL');
  const col = (ev) => `<tr>
    <td class="ev-id">${ev.id}</td>
    <td><strong>${ev.titulo}</strong><br><span class="dsc">${ev.descripcion}</span></td>
    <td>${ev.tipo}</td>
    <td class="c">${ev.puntos}</td></tr>`;
  const prow = (p) => `<tr><td>${p.label}</td><td class="c w">${p.peso}</td></tr>`;
  const sec = (p) => `<div class="blk">
    <div class="ph" style="background:${p.color}">
      <span class="pc">${p.codigo}</span>
      <div><div class="pn">${p.nombre}</div><div class="ra">RA: ${p.ra}</div></div></div>
    ${p.nota ? `<div class="nbox">ℹ ${p.nota}</div>` : ''}
    <table class="et">
      <thead><tr><th>ID</th><th>Evaluación / descripción</th><th>Tipo</th><th>Pts.</th></tr></thead>
      <tbody>${p.evaluaciones.map(col).join('')}</tbody></table>
    ${ p.ponderacionesMencion
      ? `<div class="pw">${p.ponderacionesMencion.map(m=>`<div style="flex:1;min-width:195px"><div class="pl">Ponderaciones · ${m.mencion}</div><table class="pt"><tbody>${m.ponds.map(prow).join('')}</tbody><tfoot><tr><td><b>Total</b></td><td class="c"><b>100%</b></td></tr></tfoot></table></div>`).join('')}</div>`
      : `<div class="pw"><div style="flex:1"><div class="pl">Ponderaciones (nota final)</div><table class="pt"><tbody>${(p.ponderaciones||[]).map(prow).join('')}</tbody><tfoot><tr><td><b>Total</b></td><td class="c"><b>100%</b></td></tr></tfoot></table></div></div>`
    }</div>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<title>Catálogo de Evaluaciones — ${_esc(scopeTitle)}</title>
<style>@page{size:letter;margin:18mm 16mm}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:9pt;color:#111;line-height:1.45}
.topbar{background:#003366;color:#fff;padding:9px 16px;display:flex;align-items:center;gap:10px;font-size:9pt}
.topbar button{margin-left:auto;background:#fff;color:#003366;border:none;padding:6px 16px;border-radius:3px;font-weight:700;cursor:pointer}
.dhead{border-bottom:2.5px solid #003366;padding-bottom:10px;margin:14px 0 6px}
.dhead h1{font-size:13pt;color:#003366;margin-bottom:2px}.dhead p{font-size:8pt;color:#555}
.meta{font-size:7.5pt;color:#888;text-align:right;margin-bottom:14px;border-bottom:1px solid #e0e0e0;padding-bottom:6px}
.blk{margin-bottom:24px;break-inside:avoid;page-break-inside:avoid}
.ph{color:#fff;padding:9px 13px;border-radius:4px 4px 0 0;display:flex;gap:12px;align-items:flex-start}
.pc{font-size:19pt;font-weight:900;opacity:.95;min-width:42px;text-align:center;line-height:1;margin-top:2px}
.pn{font-size:11pt;font-weight:700}.ra{font-size:7.5pt;opacity:.87;margin-top:2px;line-height:1.3}
.nbox{background:#fff8e1;border-left:3px solid #f9a825;padding:5px 9px;font-size:8pt;color:#555}
.et{width:100%;border-collapse:collapse;font-size:8.5pt}
.et thead tr{background:#f5f5f5}.et th{padding:5px 7px;text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;color:#555;border:1px solid #ddd}
.et td{padding:5px 7px;border:1px solid #ddd;vertical-align:top}.ev-id{font-weight:700;color:#555;white-space:nowrap}
.dsc{font-size:7.5pt;color:#555;display:block;margin-top:2px}.c{text-align:center}
.pw{display:flex;gap:10px;flex-wrap:wrap;margin-top:7px}
.pl{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#555;margin-bottom:3px}
.pt{width:100%;border-collapse:collapse;font-size:8.5pt}
.pt td{padding:3px 7px;border:1px solid #e0e0e0}.pt tfoot td{background:#f5f5f5;font-size:8.5pt;border:1px solid #ccc}
.w{font-weight:700;color:#003366;text-align:center;white-space:nowrap}
.pie{margin-top:20px;border-top:1px solid #ddd;padding-top:5px;font-size:7.5pt;color:#999;text-align:center}
@media print{.topbar{display:none}}</style></head><body>
<div class="topbar">ℹ Catálogo de Evaluaciones — ${_esc(scopeTitle)}
  <button onclick="window.print()">🖨 Guardar como PDF</button></div>
<div class="dhead"><h1>Catálogo de Evaluaciones — ${_esc(scopeTitle)}</h1>
  <p>Universidad de Santiago de Chile &middot; Facultad de Ciencias Médicas &middot; Carrera de Entrenador Deportivo</p>
  <p>Escala de exigencia 60% en evaluaciones con rúbrica &middot; Semestre 2025-2</p></div>
<div class="meta">Generado el ${fecha} &middot; ${catalog.length} práctica${catalog.length!==1?'s':''} documentada${catalog.length!==1?'s':''}</div>
${catalog.map(sec).join('')}
<div class="pie">Universidad de Santiago de Chile &middot; Facultad de Ciencias Médicas &middot; www.usach.cl</div>
</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const w = window.open(url, '_blank', 'width=1000,height=750');
  if (!w) { window.location.href = url; return; }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ─── Calendario de fechas de entrega ────────────────────────────────────
// Arma el calendario leyendo el estado real que cada profesor/a guardó (y que
// cloud.js ya sincroniza vía localStorage ↔ Firestore, clave usach_state_v1_*).
// Si una práctica aún no tiene datos guardados, usa la fecha semilla por defecto.
function buildFechasEntrega() {
  const codigos = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const catalog = window.EVAL_CATALOG || [];
  return codigos.map(codigo => {
    const meta = catalog.find(c => c.codigo === codigo) || {};
    let evaluaciones = null;
    try {
      const raw = localStorage.getItem(`usach_state_v1_${codigo}_demo`);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Array.isArray(parsed.evaluaciones) && parsed.evaluaciones.length) evaluaciones = parsed.evaluaciones;
    } catch (e) { /* localStorage corrupto o inaccesible: usar respaldo */ }
    if (!evaluaciones) {
      if (window.activatePractica) window.activatePractica(codigo);
      evaluaciones = (window.USACH_DATA && window.USACH_DATA.EVALUACIONES) || [];
    }
    return {
      codigo,
      nombre: meta.nombre || codigo,
      color: meta.color || '#666',
      entregas: evaluaciones.filter(e => e.fecha).map(e => ({ id: e.id, titulo: e.titulo, tipo: e.tipo, fecha: e.fecha })),
    };
  });
}

function generarFechasEntregaPDF(practicaCodigo) {
  const full = buildFechasEntrega();
  const practicas = practicaCodigo ? full.filter(p => p.codigo === practicaCodigo) : full;
  const scopeTitle = practicaCodigo ? (practicas[0] ? practicas[0].nombre.replace(/—.*/, '').trim() : practicaCodigo) : 'Todas las Prácticas';
  const fecha = new Date().toLocaleDateString('es-CL');
  const filaFmt = d => {
    const [y,m,dd] = d.split('-');
    return new Date(+y, +m-1, +dd).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' });
  };
  const rows = practicas
    .flatMap(p => p.entregas.map(e => ({ ...e, practica: p })))
    .sort((a,b) => a.fecha.localeCompare(b.fecha))
    .map(e => `<tr>
      <td class="fc">${filaFmt(e.fecha)}</td>
      <td><span class="pr" style="background:${e.practica.color}">${e.practica.codigo}</span></td>
      <td><strong>${_esc(e.titulo)}</strong></td>
      <td>${_esc(e.tipo)}</td></tr>`).join('');
  const totalEntregas = practicas.reduce((a,p) => a + p.entregas.length, 0);
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<title>Calendario de Fechas de Entrega — ${_esc(scopeTitle)}</title>
<style>@page{size:letter;margin:18mm 16mm}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:9.5pt;color:#111;line-height:1.45}
.topbar{background:#003366;color:#fff;padding:9px 16px;display:flex;align-items:center;gap:10px;font-size:9pt}
.topbar button{margin-left:auto;background:#fff;color:#003366;border:none;padding:6px 16px;border-radius:3px;font-weight:700;cursor:pointer}
.dhead{border-bottom:2.5px solid #003366;padding-bottom:10px;margin:14px 0 6px}
.dhead h1{font-size:13pt;color:#003366;margin-bottom:2px}.dhead p{font-size:8pt;color:#555}
.meta{font-size:7.5pt;color:#888;text-align:right;margin-bottom:14px;border-bottom:1px solid #e0e0e0;padding-bottom:6px}
table{width:100%;border-collapse:collapse;font-size:9pt}
thead tr{background:#f5f5f5}
th{padding:7px 10px;text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;color:#555;border:1px solid #ddd}
td{padding:7px 10px;border:1px solid #ddd;vertical-align:top}
td.fc{white-space:nowrap;font-weight:700;color:#003366}
.pr{display:inline-block;color:#fff;font-weight:700;font-size:8pt;padding:2px 9px;border-radius:10px}
tr:nth-child(even) td{background:#fafcfe}
.pie{margin-top:18px;border-top:1px solid #ddd;padding-top:5px;font-size:7.5pt;color:#999;text-align:center}
@media print{.topbar{display:none}}</style></head><body>
<div class="topbar">📅 Calendario de Fechas de Entrega — ${_esc(scopeTitle)}
  <button onclick="window.print()">🖨 Guardar como PDF</button></div>
<div class="dhead"><h1>Calendario de Fechas de Entrega — ${_esc(scopeTitle)}</h1>
  <p>Universidad de Santiago de Chile &middot; Facultad de Ciencias Médicas &middot; Carrera de Entrenador Deportivo</p></div>
<div class="meta">Generado el ${fecha} &middot; ${totalEntregas} entrega${totalEntregas!==1?'s':''} &middot; ${practicas.length} práctica${practicas.length!==1?'s':''}</div>
<table><thead><tr><th>Fecha</th><th>Práctica</th><th>Trabajo / Evaluación</th><th>Tipo</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="pie">Universidad de Santiago de Chile &middot; Facultad de Ciencias Médicas &middot; www.usach.cl</div>
</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const w = window.open(url, '_blank', 'width=1000,height=750');
  if (!w) { window.location.href = url; return; }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ─── Reporte: disponibilidad horaria de profesores ─────────────────────
function generarDisponibilidadPDF(profs) {
  const fmt = (window.SCHED && window.SCHED.fmtBlock) || (b => `${b.dia} ${b.desde}–${b.hasta}`);
  const DIAS = (window.SCHED && window.SCHED.DIAS) || ['Lun','Mar','Mié','Jue','Vie','Sáb'];
  const fecha = new Date().toLocaleDateString('es-CL');
  const orden = arr => [...(arr||[])].sort((a,b) => (DIAS.indexOf(a.dia)-DIAS.indexOf(b.dia)) || a.desde.localeCompare(b.desde));
  const totalHoras = profs.reduce((a,p) => a + (p.horasAsignadas||0), 0);
  const conDispo = profs.filter(p => (p.disponibilidad||[]).length > 0).length;
  const rows = profs.map(p => {
    const bloques = orden(p.disponibilidad);
    const chips = bloques.length
      ? bloques.map(b => `<span class="ch">${fmt(b)}</span>`).join(' ')
      : '<span class="na">Sin disponibilidad registrada</span>';
    return `<tr>
      <td><strong>${p.nombre}</strong><br><span class="em">${p.email||''}</span></td>
      <td>${(p.practicasAsignadas||[]).map(c => `<span class="pr">${c}</span>`).join(' ') || '—'}</td>
      <td class="c">${p.horasAsignadas||0} h</td>
      <td class="dispo">${chips}</td></tr>`;
  }).join('');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/>
<title>Disponibilidad horaria de profesores — Prácticas USACH</title>
<style>@page{size:letter landscape;margin:16mm}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:9.5pt;color:#111;line-height:1.45}
.topbar{background:#003366;color:#fff;padding:9px 16px;display:flex;align-items:center;gap:10px;font-size:9pt}
.topbar button{margin-left:auto;background:#fff;color:#003366;border:none;padding:6px 16px;border-radius:3px;font-weight:700;cursor:pointer}
.dhead{border-bottom:2.5px solid #003366;padding-bottom:10px;margin:14px 0 6px}
.dhead h1{font-size:13pt;color:#003366;margin-bottom:2px}.dhead p{font-size:8pt;color:#555}
.meta{font-size:8pt;color:#888;margin:8px 0 14px;display:flex;gap:18px}
.meta b{color:#003366}
table{width:100%;border-collapse:collapse;font-size:9pt}
thead tr{background:#f5f5f5}
th{padding:7px 10px;text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;color:#555;border:1px solid #ddd}
td{padding:7px 10px;border:1px solid #ddd;vertical-align:top}
td.c{text-align:center;font-weight:700;color:#003366;white-space:nowrap}
.em{font-size:7.5pt;color:#888}
.pr{display:inline-block;background:#e0f2f1;color:#00695C;font-weight:700;font-size:8pt;padding:1px 6px;border-radius:10px;margin:1px}
.ch{display:inline-block;background:#fff3e0;color:#9a5b00;font-weight:600;font-size:8pt;padding:2px 8px;border-radius:10px;margin:2px}
.na{color:#b00;font-size:8pt;font-style:italic}
tr:nth-child(even) td{background:#fafcfe}
.pie{margin-top:18px;border-top:1px solid #ddd;padding-top:5px;font-size:7.5pt;color:#999;text-align:center}
@media print{.topbar{display:none}}</style></head><body>
<div class="topbar">🕒 Disponibilidad horaria de profesores
  <button onclick="window.print()">🖨 Guardar como PDF</button></div>
<div class="dhead"><h1>Disponibilidad horaria de profesores</h1>
  <p>Universidad de Santiago de Chile &middot; Carrera de Entrenador Deportivo &middot; Semestre 2025-2</p></div>
<div class="meta"><span>Generado el <b>${fecha}</b></span><span><b>${profs.length}</b> profesores</span><span><b>${conDispo}</b> con disponibilidad registrada</span><span><b>${totalHoras} h</b> asignadas en total</span></div>
<table><thead><tr><th>Profesor/a</th><th>Prácticas</th><th>Horas sem.</th><th>Bloques de disponibilidad</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="pie">Universidad de Santiago de Chile &middot; Facultad de Ciencias Médicas &middot; www.usach.cl &middot; Los profesores registran su disponibilidad desde su propia plataforma.</div>
</body></html>`;
  const w = window.open('','_blank','width=1100,height=720');
  if (!w) { alert('Habilita las ventanas emergentes para generar el PDF.'); return; }
  w.document.write(html); w.document.close();
}

// ─── CartasScreen ─────────────────────────────────────────────────────────
function CartasScreen({ ctx }) {
  const { profs, students, cartas, saveCarta, deleteCarta, toast } = ctx;
  const [showNew, setShowNew] = useState(false);
  const [showMasiva, setShowMasiva] = useState(false);
  const [filter, setFilter] = useState('');
  const [fStatus, setFStatus] = useState('');

  const filtered = cartas.filter(c => {
    if (fStatus && c.estado !== fStatus) return false;
    if (filter) {
      const lf = filter.toLowerCase();
      if (!c.estudianteNombre.toLowerCase().includes(lf) && !c.institucion.toLowerCase().includes(lf)) return false;
    }
    return true;
  });

  const statusBadge = s => {
    const map = {
      emitida:   { bg:'#dcfce7', color:'#166534', label:'Emitida' },
      pendiente: { bg:'#fef9c3', color:'#854d0e', label:'Pendiente' },
      cancelada: { bg:'#fee2e2', color:'#991b1b', label:'Cancelada' },
    };
    return map[s] || { bg:'#f3f4f6', color:'#374151', label: s };
  };

  return (
    <div data-screen-label="Cartas de Presentación">
      <div className="section-head">
        <div>
          <h1>Cartas de Presentación</h1>
          <div className="subtitle">{cartas.length} cartas registradas · descarga el PDF con el botón de impresión</div>
        </div>
        <div className="actions">
          <button className="btn btn-secondary" onClick={() => setShowMasiva(true)}>✉ Carta masiva</button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Nueva carta</button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom:14 }}>
        <input placeholder="Buscar estudiante o institución…" value={filter} onChange={e=>setFilter(e.target.value)} style={{ flex:'1 1 200px' }}/>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="emitida">Emitidas</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
        </select>
        {(filter||fStatus) && <button className="btn btn-ghost btn-sm" onClick={()=>{setFilter('');setFStatus('');}}>✕</button>}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="carta-row student-head" style={{ background:'var(--surface-1)', borderBottom:'1px solid var(--border)' }}>
          <span>Estudiante / RUT</span>
          <span>Institución</span>
          <span>Práctica</span>
          <span>Fecha emisión</span>
          <span></span>
        </div>
        {filtered.length === 0 && (
          <div className="muted" style={{ padding:32, textAlign:'center', fontSize:13 }}>
            {cartas.length === 0 ? 'Aún no hay cartas registradas. Crea la primera con el botón "Nueva carta".' : 'Sin resultados con los filtros actuales.'}
          </div>
        )}
        {filtered.map(c => {
          const sb = statusBadge(c.estado);
          const prof = profs.find(p => p.id === c.profesorId);
          return (
            <div key={c.id} className="carta-row">
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{c.estudianteNombre}</div>
                <div className="muted" style={{ fontSize:11 }}>{c.rut}</div>
              </div>
              <div style={{ fontSize:13 }}>{c.institucion}</div>
              <div><span className={`practice-chip chip-${c.practica}`}>{c.practica}</span></div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:500 }}>{c.fechaEmision}</div>
                <div style={{ display:'inline-block', fontSize:10.5, fontWeight:700, padding:'1px 7px', borderRadius:10, background:sb.bg, color:sb.color, marginTop:2 }}>{sb.label}</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-secondary btn-sm" title="Descargar PDF" onClick={() => generarCartaPDF(c, {autoprint:true})}>🖨 PDF</button>
                <button className="btn btn-ghost btn-sm" style={{ color:'var(--err)' }} title="Eliminar"
                        onClick={()=>{ if(window.confirm('¿Eliminar esta carta?')) { deleteCarta(c.id); toast('Carta eliminada'); } }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <NuevaCartaModal profs={profs} students={students}
          onSave={c => { saveCarta(c); toast('Carta registrada'); setShowNew(false); }}
          onClose={() => setShowNew(false)}
        />
      )}
      {showMasiva && (
        <CartaMasivaModal profs={profs} students={students}
          onRegister={(rows) => { rows.forEach(c => saveCarta(c)); toast(`${rows.length} carta${rows.length!==1?'s':''} registrada${rows.length!==1?'s':''}`); }}
          onClose={() => setShowMasiva(false)}
        />
      )}
    </div>
  );
}

function NuevaCartaModal({ profs, students, onSave, onClose }) {
  const centros = (window.DB && window.DB.getCentros && window.DB.getCentros()) || [];
  const [studId, setStudId] = useState(students[0]?.id || '');
  const student = students.find(s => s.id === studId);
  const prof = student ? profs.find(p => p.id === student.profesorId) : null;
  const sp0 = splitNombre(student?.nombre || '');

  // Datos del estudiante (editables)
  const [nombres, setNombres]   = useState(sp0.nombres);
  const [apPat, setApPat]       = useState(sp0.apPaterno);
  const [apMat, setApMat]       = useState(sp0.apMaterno);
  const [rut, setRut]           = useState(student?.rut || '');
  const [practica, setPractica] = useState(student?.practica || 'IV');
  const [deporte, setDeporte]   = useState('');
  const [horario, setHorario]   = useState('');

  // Destinatario
  const [salutation, setSalutation] = useState('Señor');
  const [destinatario, setDestinatario] = useState('');
  const [cargoDest, setCargoDest] = useState('');
  const [inst, setInst] = useState('');

  // Parámetros de la práctica
  const [fe, setFe] = useState(new Date().toISOString().slice(0,10));
  const [horasSem, setHorasSem] = useState(4);
  const [semanas, setSemanas] = useState(12);
  const [periodo, setPeriodo] = useState(CARTA_PERIODO_DEFAULT);
  const [coord, setCoord] = useState(CARTA_COORD_DEFAULT);
  const [coordCargo, setCoordCargo] = useState(CARTA_COORD_CARGO_DEFAULT);
  const [nota, setNota] = useState('');

  const totalHoras = (parseInt(horasSem)||0) * (parseInt(semanas)||0);

  // Al cambiar de estudiante: re-prefill nombre/rut/práctica/centro
  const onPickStudent = id => {
    setStudId(id);
    const s = students.find(x => x.id === id);
    if (!s) return;
    const sp = splitNombre(s.nombre);
    setNombres(sp.nombres); setApPat(sp.apPaterno); setApMat(sp.apMaterno);
    setRut(s.rut || ''); setPractica(s.practica || 'IV');
    // Prefill destinatario desde el centro si coincide
    const c = centros.find(x => x.nombre === s.centro);
    if (c) {
      setInst(c.nombre);
      if (c.encargado) { setDestinatario((c.encargado.nombre||'').toUpperCase()); setCargoDest(c.encargado.cargo||''); }
    }
  };

  const buildPayload = (autoprint) => ({
    salutation, destinatario, cargoDestinatario: cargoDest, institucion: inst,
    practica, fechaEmision: fe,
    horasSemanales: parseInt(horasSem)||0, semanas: parseInt(semanas)||0, totalHoras,
    periodo, coordinadora: coord, coordinadoraCargo: coordCargo,
    students: [{ apPaterno: apPat, apMaterno: apMat, nombres, rut, deporte, horario }],
    autoprint,
  });

  const preview = () => { if (inst && (nombres||apPat)) generarCartaMasivaPDF(buildPayload(false)); };

  const handleSave = () => {
    if (!inst || (!nombres && !apPat)) return;
    const nombreCompleto = [nombres, apPat, apMat].filter(Boolean).join(' ');
    onSave({
      estudianteId: studId,
      estudianteNombre: nombreCompleto,
      nombres, apPaterno: apPat, apMaterno: apMat,
      rut, practica,
      profesorId: prof?.id || '', profesorNombre: prof?.nombre || '',
      salutation, destinatario, cargoDestinatario: cargoDest,
      institucion: inst, deporte, horario,
      fechaEmision: fe, horasSemanales: parseInt(horasSem)||0, semanas: parseInt(semanas)||0, totalHoras,
      periodo, coordinadora: coord, coordinadoraCargo: coordCargo,
      vigencia: fe, estado: 'emitida', nota,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:620 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Nueva carta de presentación</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">

          <div className="form-divider">Destinatario</div>
          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:12 }}>
            <div className="form-field"><label>Tratamiento</label>
              <select value={salutation} onChange={e=>setSalutation(e.target.value)}>
                <option>Señor</option><option>Señora</option><option>Señor/a</option><option>Señores</option>
              </select>
            </div>
            <div className="form-field"><label>Nombre del/de la destinatario/a</label>
              <input value={destinatario} onChange={e=>setDestinatario(e.target.value)} placeholder="Ej: Felipe Muñoz"/>
            </div>
          </div>
          <div className="form-field"><label>Cargo del/de la destinatario/a</label>
            <input value={cargoDest} onChange={e=>setCargoDest(e.target.value)} placeholder="Ej: Jefe de Entrenadores"/>
          </div>
          <div className="form-field"><label>Institución / centro de práctica</label>
            <input value={inst} onChange={e=>setInst(e.target.value)} placeholder="Ej: Club de Básquetbol INBA" list="cartas-centros"/>
            <datalist id="cartas-centros">{centros.map(c=><option key={c.id} value={c.nombre}/>)}</datalist>
          </div>

          <div className="form-divider">Estudiante</div>
          <div className="form-field"><label>Seleccionar estudiante (autocompleta los datos)</label>
            <select value={studId} onChange={e=>onPickStudent(e.target.value)}>
              {students.map(s=><option key={s.id} value={s.id}>{s.nombre} — {s.practica} ({s.rut})</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-field"><label>Apellido paterno</label><input value={apPat} onChange={e=>setApPat(e.target.value)}/></div>
            <div className="form-field"><label>Apellido materno</label><input value={apMat} onChange={e=>setApMat(e.target.value)}/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-field"><label>Nombres</label><input value={nombres} onChange={e=>setNombres(e.target.value)}/></div>
            <div className="form-field"><label>RUT</label><input value={rut} onChange={e=>setRut(e.target.value)} placeholder="21.013.717-3"/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:12 }}>
            <div className="form-field"><label>Práctica</label>
              <select value={practica} onChange={e=>setPractica(e.target.value)}>
                {(window.PRACTICES||['I','II','III','IV','PI','PII']).map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Deporte</label><input value={deporte} onChange={e=>setDeporte(e.target.value)} placeholder="Ej: Básquetbol"/></div>
          </div>
          <div className="form-field"><label>Horario (una línea por bloque)</label>
            <textarea value={horario} onChange={e=>setHorario(e.target.value)} rows="2" style={{ resize:'vertical' }} placeholder={"Miér y Vie 16:30 a 18:00 hrs\nSáb 10:30 a 12:00"}/>
          </div>

          <div className="form-divider">Parámetros de la práctica</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div className="form-field"><label>Horas semanales</label><input type="number" min="1" value={horasSem} onChange={e=>setHorasSem(e.target.value)}/></div>
            <div className="form-field"><label>N° de semanas</label><input type="number" min="1" value={semanas} onChange={e=>setSemanas(e.target.value)}/></div>
            <div className="form-field"><label>Total horas</label><input value={totalHoras} disabled style={{ background:'var(--surface-1)', color:'var(--ink-600)' }}/></div>
          </div>
          <div className="form-field"><label>Período (texto del cuerpo)</label>
            <textarea value={periodo} onChange={e=>setPeriodo(e.target.value)} rows="2" style={{ resize:'vertical' }}/>
          </div>
          <div className="form-field"><label>Mes de emisión (encabezado de la carta)</label><input type="date" value={fe} onChange={e=>setFe(e.target.value)}/></div>

          <div className="form-divider">Firma</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-field"><label>Coordinador/a</label><input value={coord} onChange={e=>setCoord(e.target.value)}/></div>
            <div className="form-field"><label>Cargo</label><input value={coordCargo} onChange={e=>setCoordCargo(e.target.value)}/></div>
          </div>
          <div className="form-field"><label>Nota interna (opcional, no aparece en el PDF)</label>
            <textarea value={nota} onChange={e=>setNota(e.target.value)} rows="1" style={{ resize:'vertical' }}/>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-secondary" disabled={!inst||(!nombres&&!apPat)} onClick={preview}>🖨 Vista previa PDF</button>
          <button className="btn btn-primary" disabled={!inst||(!nombres&&!apPat)} onClick={handleSave}>Registrar carta</button>
        </div>
      </div>
    </div>
  );
}

// ─── CartaMasivaModal ─────────────────────────────────────────────────────
function CartaMasivaModal({ profs, students, onRegister, onClose }) {
  const PRACS = window.PRACTICES || ['I','II','III','IV','PI','PII'];
  const centros = (window.DB && window.DB.getCentros && window.DB.getCentros()) || [];
  const [sel, setSel] = useState(() => new Set());
  const [meta, setMeta] = useState({});   // id → { deporte, horario }
  const [q, setQ] = useState('');
  const [fPrac, setFPrac] = useState('');

  // Destinatario + parámetros
  const [salutation, setSalutation] = useState('Señor');
  const [destinatario, setDestinatario] = useState('');
  const [cargoDest, setCargoDest] = useState('');
  const [inst, setInst] = useState('');
  const [fe, setFe] = useState(new Date().toISOString().slice(0,10));
  const [horasSem, setHorasSem] = useState(4);
  const [semanas, setSemanas] = useState(12);
  const [periodo, setPeriodo] = useState(CARTA_PERIODO_DEFAULT);
  const [coord, setCoord] = useState(CARTA_COORD_DEFAULT);
  const [coordCargo, setCoordCargo] = useState(CARTA_COORD_CARGO_DEFAULT);
  const totalHoras = (parseInt(horasSem)||0) * (parseInt(semanas)||0);

  const filtered = students.filter(s => {
    if (fPrac && s.practica !== fPrac) return false;
    if (q) {
      const lq = q.toLowerCase();
      if (!s.nombre.toLowerCase().includes(lq) && !(s.rut||'').toLowerCase().includes(lq)) return false;
    }
    return true;
  });
  const toggle = id => setSel(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allVisibleSelected = filtered.length > 0 && filtered.every(s => sel.has(s.id));
  const toggleAll = () => setSel(prev => {
    const n = new Set(prev);
    if (allVisibleSelected) filtered.forEach(s => n.delete(s.id));
    else filtered.forEach(s => n.add(s.id));
    return n;
  });
  const selStudents = students.filter(s => sel.has(s.id));
  const avatar = n => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const setM = (id, k, v) => setMeta(prev => ({ ...prev, [id]: { ...(prev[id]||{}), [k]: v } }));

  const rowsPayload = () => selStudents.map(s => ({
    nombre: s.nombre, rut: s.rut, practica: s.practica,
    deporte: (meta[s.id]||{}).deporte || '', horario: (meta[s.id]||{}).horario || '',
  }));
  const basePayload = (autoprint) => ({
    salutation, destinatario, cargoDestinatario: cargoDest, institucion: inst,
    fechaEmision: fe, horasSemanales: parseInt(horasSem)||0, semanas: parseInt(semanas)||0, totalHoras,
    periodo, coordinadora: coord, coordinadoraCargo: coordCargo,
    students: rowsPayload(), autoprint,
  });

  const generar = () => { if (inst && selStudents.length) generarCartaMasivaPDF(basePayload(false)); };
  const registrar = () => {
    if (!inst || selStudents.length === 0) return;
    const rows = selStudents.map(s => {
      const prof = profs.find(p => p.id === s.profesorId);
      const sp = splitNombre(s.nombre);
      const m = meta[s.id] || {};
      return { estudianteId:s.id, estudianteNombre:s.nombre,
        nombres:sp.nombres, apPaterno:sp.apPaterno, apMaterno:sp.apMaterno,
        rut:s.rut, practica:s.practica, deporte:m.deporte||'', horario:m.horario||'',
        profesorId:prof?.id||'', profesorNombre:prof?.nombre||'',
        salutation, destinatario, cargoDestinatario:cargoDest, institucion:inst,
        fechaEmision:fe, horasSemanales:parseInt(horasSem)||0, semanas:parseInt(semanas)||0, totalHoras,
        periodo, coordinadora:coord, coordinadoraCargo:coordCargo,
        vigencia:fe, estado:'emitida', nota:'Carta masiva' };
    });
    onRegister(rows);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:680 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Carta de presentación masiva</h2><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">

          <div className="form-divider">Destinatario</div>
          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:12 }}>
            <div className="form-field"><label>Tratamiento</label>
              <select value={salutation} onChange={e=>setSalutation(e.target.value)}>
                <option>Señor</option><option>Señora</option><option>Señor/a</option><option>Señores</option>
              </select>
            </div>
            <div className="form-field"><label>Nombre del/de la destinatario/a</label>
              <input value={destinatario} onChange={e=>setDestinatario(e.target.value)} placeholder="Ej: Felipe Muñoz"/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-field"><label>Cargo del/de la destinatario/a</label>
              <input value={cargoDest} onChange={e=>setCargoDest(e.target.value)} placeholder="Ej: Jefe de Entrenadores"/>
            </div>
            <div className="form-field"><label>Institución / centro</label>
              <input value={inst} onChange={e=>setInst(e.target.value)} placeholder="Ej: Club de Básquetbol INBA" list="cartas-centros-m"/>
              <datalist id="cartas-centros-m">{centros.map(c=><option key={c.id} value={c.nombre}/>)}</datalist>
            </div>
          </div>

          <div className="form-divider">Parámetros de la práctica</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1.4fr', gap:12 }}>
            <div className="form-field"><label>Horas/sem</label><input type="number" min="1" value={horasSem} onChange={e=>setHorasSem(e.target.value)}/></div>
            <div className="form-field"><label>Semanas</label><input type="number" min="1" value={semanas} onChange={e=>setSemanas(e.target.value)}/></div>
            <div className="form-field"><label>Total</label><input value={totalHoras} disabled style={{ background:'var(--surface-1)', color:'var(--ink-600)' }}/></div>
            <div className="form-field"><label>Mes de emisión</label><input type="date" value={fe} onChange={e=>setFe(e.target.value)}/></div>
          </div>

          <div className="form-divider">Estudiantes — selecciónalos y completa deporte / horario</div>
          <div className="filter-bar" style={{ marginBottom:10 }}>
            <input placeholder="Buscar nombre o RUT…" value={q} onChange={e=>setQ(e.target.value)} style={{ flex:'1 1 160px' }}/>
            <select value={fPrac} onChange={e=>setFPrac(e.target.value)}>
              <option value="">Todas las prácticas</option>
              {PRACS.map(p=><option key={p} value={p}>Práctica {p}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={toggleAll}>{allVisibleSelected ? 'Quitar todos' : 'Seleccionar todos'}</button>
          </div>

          <div className="masiva-list">
            {filtered.length === 0 && <div className="muted" style={{ padding:18, textAlign:'center', fontSize:13 }}>Sin estudiantes con esos filtros.</div>}
            {filtered.map(s => {
              const on = sel.has(s.id);
              const m = meta[s.id] || {};
              return (
                <div key={s.id} className={`masiva-row ${on?'on':''}`} style={{ flexWrap:'wrap', cursor:'default' }}>
                  <button type="button" onClick={() => toggle(s.id)} style={{ display:'flex', alignItems:'center', gap:10, flex:'1 1 220px', minWidth:0, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0 }}>
                    <span className={`masiva-check ${on?'on':''}`}>{on ? '✓' : ''}</span>
                    <div className="avatar-sm" style={{ width:26, height:26, fontSize:10 }}>{avatar(s.nombre)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{s.nombre}</div>
                      <div className="muted" style={{ fontSize:11 }}>{s.rut}</div>
                    </div>
                    <span className={`practice-chip chip-${s.practica}`} style={{ fontSize:10 }}>{s.practica}</span>
                  </button>
                  {on && (
                    <div style={{ display:'flex', gap:8, flex:'1 1 100%', marginTop:4, paddingLeft:36 }}>
                      <input value={m.deporte||''} onChange={e=>setM(s.id,'deporte',e.target.value)} placeholder="Deporte"
                        style={{ flex:'0 0 140px', padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:12.5, fontFamily:'inherit' }}/>
                      <input value={m.horario||''} onChange={e=>setM(s.id,'horario',e.target.value)} placeholder="Horario (ej: Mar y Jue 16:00–18:00)"
                        style={{ flex:1, padding:'6px 9px', border:'1.5px solid var(--border)', borderRadius:7, fontSize:12.5, fontFamily:'inherit' }}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-foot" style={{ justifyContent:'space-between' }}>
          <span className="muted" style={{ fontSize:13, fontWeight:600 }}>{sel.size} seleccionado{sel.size!==1?'s':''}</span>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-secondary" disabled={!inst||sel.size===0} onClick={registrar}>Registrar emitidas</button>
            <button className="btn btn-primary" disabled={!inst||sel.size===0} onClick={generar}>🖨 Generar carta</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ReportesScreen ───────────────────────────────────────────────────────
function ReportesScreen({ ctx }) {
  const { profs, students, cartas, toast } = ctx;
  const PNAMES = window.PRACTICE_NAMES || {};

  const exportNomina = () => {
    const sep = ';';
    const q = s => `"${String(s||'').replace(/"/g,'""')}"`;
    const profName = id => profs.find(p=>p.id===id)?.nombre||'—';
    const rows = [
      ['Nombre','RUT','Email','Cohorte','Práctica','Área/Mención','Profesor/a','Centro de práctica'].map(q).join(sep),
      ...students.map(s=>[s.nombre,s.rut,s.email||'',s.cohorte,s.practica,s.area||'',profName(s.profesorId),s.centro||''].map(q).join(sep)),
    ];
    const blob = new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='Nómina_Consolidada_USACH.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast('Nómina consolidada descargada');
  };

  const exportProfReporte = (prof) => {
    const sep = ';';
    const q = s => `"${String(s||'').replace(/"/g,'""')}"`;
    const sts = students.filter(s=>s.profesorId===prof.id);
    const rows = [
      [q('REPORTE DE PROFESOR/A'), q(prof.nombre), q(new Date().toLocaleDateString('es-CL'))].join(sep),
      [q('Prácticas asignadas:'), q((prof.practicasAsignadas||[]).map(c=>PNAMES[c]||c).join(', '))].join(sep),
      [],
      ['Nombre','RUT','Cohorte','Práctica','Centro'].map(q).join(sep),
      ...sts.map(s=>[s.nombre,s.rut,s.cohorte,s.practica,s.centro||''].map(q).join(sep)),
    ];
    const blob = new Blob(['\uFEFF'+rows.join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`Reporte_${prof.nombre.replace(/\s+/g,'_')}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast(`Reporte de ${prof.nombre.split(' ')[1]||prof.nombre} descargado`);
  };

  const [selProf, setSelProf] = useState(profs[0]?.id||'');
  const [catalogScope, setCatalogScope] = useState('');
  const catalog = window.EVAL_CATALOG || [];
  const [fechasScope, setFechasScope] = useState('');
  const fechasCatalog = buildFechasEntrega();

  return (
    <div data-screen-label="Reportes">
      <div className="section-head">
        <div><h1>Reportes y exportaciones</h1>
          <div className="subtitle">Descarga nóminas y reportes en formato CSV (compatible con Excel y Google Sheets)</div>
        </div>
      </div>

      <div className="report-card" style={{ borderLeft:'3px solid var(--teal-500)' }}>
        <div className="report-icon" style={{ background:'#e8f5e9' }}>📋</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Catálogo de evaluaciones</div>
          <div className="muted" style={{ fontSize:13, marginTop:3 }}>Descripción completa de las evaluaciones, tipos, puntos ideales y ponderaciones. Elige el reporte completo o una práctica específica.</div>
          <div style={{ marginTop:10 }}>
            <select value={catalogScope} onChange={e=>setCatalogScope(e.target.value)} style={{ padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'inherit' }}>
              <option value="">Reporte completo (todas las prácticas)</option>
              {catalog.map(p => <option key={p.codigo} value={p.codigo}>Solo {p.nombre}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => generarCatalogoPDF(catalogScope)}>📋 Generar PDF</button>
      </div>

      <div className="report-card" style={{ borderLeft:'3px solid #003366' }}>
        <div className="report-icon" style={{ background:'#e3f2fd' }}>📅</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Calendario de fechas de entrega</div>
          <div className="muted" style={{ fontSize:13, marginTop:3 }}>Listado cronológico de las fechas de entrega de los trabajos y evaluaciones. Elige el reporte general (todas las prácticas) o una práctica específica.</div>
          <div style={{ marginTop:10 }}>
            <select value={fechasScope} onChange={e=>setFechasScope(e.target.value)} style={{ padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'inherit' }}>
              <option value="">Reporte general (todas las prácticas)</option>
              {fechasCatalog.map(p => <option key={p.codigo} value={p.codigo}>Solo {p.nombre}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => generarFechasEntregaPDF(fechasScope)}>📅 Generar PDF</button>
      </div>

      <div className="report-card">
        <div className="report-icon" style={{ background:'var(--teal-50)' }}>📊</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Nómina consolidada de estudiantes</div>
          <div className="muted" style={{ fontSize:13, marginTop:3 }}>Todos los estudiantes de todas las prácticas con su asignación de profesor/a y centro. {students.length} registros.</div>
        </div>
        <button className="btn btn-primary" onClick={exportNomina}>⬇ Descargar CSV</button>
      </div>

      <div className="report-card" style={{ borderLeft:'3px solid var(--orange-500)' }}>
        <div className="report-icon" style={{ background:'#fff3e0' }}>🕒</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Disponibilidad horaria de profesores</div>
          <div className="muted" style={{ fontSize:13, marginTop:3 }}>Reporte imprimible con los bloques horarios disponibles de cada profesor/a, sus prácticas y carga horaria. Los horarios que cada profesor/a registra en su propia plataforma se reflejan aquí.</div>
        </div>
        <button className="btn btn-orange" onClick={() => generarDisponibilidadPDF(profs)}>🕒 Generar PDF</button>
      </div>

      <div className="report-card">
        <div className="report-icon" style={{ background:'#e0f2f1' }}>👤</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Reporte por profesor/a</div>
          <div className="muted" style={{ fontSize:13, marginTop:3 }}>Lista de estudiantes asignados al/la profesor/a seleccionado/a, con prácticas y centros.</div>
          <div style={{ marginTop:10 }}>
            <select value={selProf} onChange={e=>setSelProf(e.target.value)} style={{ padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontFamily:'inherit' }}>
              {profs.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={()=>{ const p=profs.find(x=>x.id===selProf); if(p) exportProfReporte(p); }}>⬇ Generar reporte</button>
      </div>

      <div className="report-card">
        <div className="report-icon" style={{ background:'#fff3e0' }}>📄</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Cartas de presentación emitidas</div>
          <div className="muted" style={{ fontSize:13, marginTop:3 }}>{cartas.filter(c=>c.estado==='emitida').length} cartas emitidas · {cartas.filter(c=>c.estado==='pendiente').length} pendientes. Las cartas se generan individualmente en PDF desde la sección Cartas.</div>
        </div>
        <button className="btn btn-secondary" onClick={() => ctx.onNav('cartas')}>Ver cartas →</button>
      </div>

      <div style={{ padding:'14px 18px', background:'var(--surface-1)', borderRadius:10, border:'1px solid var(--border)', marginTop:20, fontSize:13, color:'var(--ink-600)' }}>
        <strong style={{ display:'block', marginBottom:6, fontSize:14, color:'var(--ink-800)' }}>ℹ Sobre los datos de calificaciones</strong>
        Los datos de evaluaciones y notas viven en la plataforma de cada profesor/a (App Prácticas USACH). Para acceder a ellos, cada profesor debe exportarlos desde su plataforma.
        Con Firebase configurado, las notas pueden consolidarse aquí automáticamente en la próxima versión.
      </div>
    </div>
  );
}

Object.assign(window, { CartasScreen, ReportesScreen });
