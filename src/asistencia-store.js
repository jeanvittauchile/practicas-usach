// asistencia-store.js — Asistencia a las clases del supervisor/a
// ─────────────────────────────────────────────────────────────────────────
// Cada profesor guarda su asistencia en una clave propia por práctica
// (usach_asist_v1_<práctica>_<email>), espejada a Firestore por cloud.js.
// Así dos profesores de la misma práctica nunca se sobrescriben entre sí, y
// el coordinador lee todas las claves para armar el resumen.
//
// Documento: { practica, profesorEmail, profesorNombre,
//              estudiantes: { estId: { nombre, rut } },
//              sesiones: { id: { id, fecha, tema, registros: { estId: 'P'|'T'|'A'|'J' } } } }
// ─────────────────────────────────────────────────────────────────────────

(function () {
  const PREFIX = 'usach_asist_v1_';
  const ATRASOS_POR_INASISTENCIA = 3;

  const ESTADOS = [
    { k: 'P', label: 'Presente',    cls: 'on-E' },
    { k: 'T', label: 'Atraso',      cls: 'on-S' },
    { k: 'A', label: 'Ausente',     cls: 'on-D' },
    { k: 'J', label: 'Justificado', cls: 'on-B' },
  ];

  function key(practica, email) {
    return PREFIX + practica + '_' + (email || 'sin-correo').toLowerCase();
  }

  function read(practica, email) {
    try {
      const d = JSON.parse(localStorage.getItem(key(practica, email)) || 'null');
      if (d && typeof d === 'object') return Object.assign({ estudiantes: {}, sesiones: {} }, d);
    } catch (e) {}
    return { practica, profesorEmail: email || '', profesorNombre: '', estudiantes: {}, sesiones: {} };
  }

  function write(practica, email, doc) {
    try { localStorage.setItem(key(practica, email), JSON.stringify(Object.assign({}, doc, { practica, profesorEmail: email || '', updatedAt: Date.now() }))); } catch (e) {}
  }

  // Todos los documentos de asistencia (para el coordinador).
  function readAll() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k.indexOf(PREFIX) !== 0) continue;
      try {
        const d = JSON.parse(localStorage.getItem(k));
        if (d && d.sesiones) out.push(Object.assign({ estudiantes: {} }, d));
      } catch (e) {}
    }
    return out;
  }

  // Reglas: los justificados no bajan el porcentaje (salen del denominador) y
  // los atrasos cuentan como asistencia, salvo que cada 3 atrasos de un mismo
  // estudiante el tercero se convierte en inasistencia (AT).
  // inasist = A + AT ;  pct = (P + T - AT) / (P + T + A)
  function calcular(c) {
    const base = c.P + c.T + c.A;
    c.inasist = c.A + c.AT;
    c.pct = base ? Math.floor((base - c.inasist) / base * 100) : null;
    return c;
  }

  // Conteo de una sola clase (sin conversión de atrasos: la regla es por estudiante).
  function contar(valores) {
    const c = { P: 0, T: 0, A: 0, J: 0, AT: 0, total: 0 };
    valores.forEach(v => { if (c[v] != null) { c[v]++; c.total++; } });
    return calcular(c);
  }

  // Conteo acumulado de un estudiante: aplica la regla de 3 atrasos.
  function contarEstudiante(valores) {
    const c = contar(valores);
    c.AT = Math.floor(c.T / ATRASOS_POR_INASISTENCIA);
    return calcular(c);
  }

  // Suma conteos de varios estudiantes (para totales generales).
  function sumar(conteos) {
    const c = { P: 0, T: 0, A: 0, J: 0, AT: 0, total: 0 };
    conteos.forEach(x => { ['P', 'T', 'A', 'J', 'AT', 'total'].forEach(k => { c[k] += x[k] || 0; }); });
    return calcular(c);
  }

  // Resumen por estudiante a partir de las sesiones de un documento.
  function porEstudiante(doc) {
    const vals = {};
    Object.values(doc.sesiones || {}).forEach(s => {
      Object.entries(s.registros || {}).forEach(([estId, v]) => { (vals[estId] = vals[estId] || []).push(v); });
    });
    const out = {};
    Object.keys(vals).forEach(estId => { out[estId] = contarEstudiante(vals[estId]); });
    return out;
  }

  window.ASISTENCIA = { PREFIX, ESTADOS, UMBRAL: 100, ATRASOS_POR_INASISTENCIA, key, read, write, readAll, contar, contarEstudiante, sumar, porEstudiante };
})();
