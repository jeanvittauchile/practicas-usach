// semana-utils.js — Utilidades de fecha compartidas por ambas apps (coordinador y profesor/supervisor).
// Script plano (no JSX), cargado después de data.js…data-p6.js y antes de icons.jsx/shell.jsx/coord-*.jsx
// en los dos HTML de entrada, para que esté disponible en ambos sin duplicar lógica.

function fechaFmt(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

const MESES_LARGOS = ['enero','febrero','marzo','abril','mayo','junio','julio',
  'agosto','septiembre','octubre','noviembre','diciembre'];

// Suma/resta días a una fecha ISO (yyyy-mm-dd). Usa UTC para no depender de zona horaria local.
function addDiasISO(iso, dias) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + dias);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// Rango de 7 días (inicio..fin) de la Semana N, dado el inicio ISO de la Semana 1.
function semanaRango(inicioISO, semanaN) {
  if (!inicioISO || !semanaN) return null;
  const startISO = addDiasISO(inicioISO, (semanaN - 1) * 7);
  const endISO = addDiasISO(startISO, 6);
  return { startISO, endISO };
}

// "07 al 13 de septiembre de 2026" / "28 de septiembre al 04 de octubre de 2026"
// / "28 de diciembre de 2026 al 03 de enero de 2027" (cruce de año).
function fechaRangoFmt(startISO, endISO) {
  if (!startISO || !endISO) return '';
  const [ys, ms, ds] = startISO.split('-').map(Number);
  const [ye, me, de] = endISO.split('-').map(Number);
  const dd = n => String(n).padStart(2, '0');
  if (ys === ye && ms === me) return `${dd(ds)} al ${dd(de)} de ${MESES_LARGOS[ms - 1]} de ${ys}`;
  if (ys === ye) return `${dd(ds)} de ${MESES_LARGOS[ms - 1]} al ${dd(de)} de ${MESES_LARGOS[me - 1]} de ${ye}`;
  return `${dd(ds)} de ${MESES_LARGOS[ms - 1]} de ${ys} al ${dd(de)} de ${MESES_LARGOS[me - 1]} de ${ye}`;
}

// Versión compacta para espacios chicos (mobile): "07–13 sep" / "28 sep–04 oct".
function fechaRangoCorto(startISO, endISO) {
  if (!startISO || !endISO) return '';
  const [, ms, ds] = startISO.split('-').map(Number);
  const [, me, de] = endISO.split('-').map(Number);
  const mesesCorto = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const dd = n => String(n).padStart(2, '0');
  if (ms === me) return `${dd(ds)}–${dd(de)} ${mesesCorto[ms - 1]}`;
  return `${dd(ds)} ${mesesCorto[ms - 1]}–${dd(de)} ${mesesCorto[me - 1]}`;
}

// Resolver central: fecha "efectiva" de una evaluación.
// - Si fue fijada a mano (ev.fechaManual) o no hay inicioPractica configurado o la evaluación
//   no tiene semanaEntrega asignada → cae a la fecha simple actual (sin regresión).
// - Si no, calcula el rango de 7 días de su semana a partir de state.inicioPractica.
function evalFechaInfo(ev, state) {
  const semanaN = ev && ev.semanaEntrega;
  const inicio = state && state.inicioPractica;
  const manual = !!(ev && ev.fechaManual);
  if (manual || !inicio || !semanaN) {
    return { label: fechaFmt(ev && ev.fecha), deadline: ev && ev.fecha, semana: semanaN || null, auto: false };
  }
  const r = semanaRango(inicio, semanaN);
  return { label: fechaRangoFmt(r.startISO, r.endISO), deadline: r.endISO, semana: semanaN, startISO: r.startISO, endISO: r.endISO, auto: true };
}

Object.assign(window, {
  fechaFmt, addDiasISO, semanaRango, fechaRangoFmt, fechaRangoCorto, evalFechaInfo,
});
