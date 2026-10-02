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

  // Conteo de estados. Asistencia = (presentes + atrasos) / registros; los
  // justificados no cuentan en contra (se excluyen del denominador).
  function contar(valores) {
    const c = { P: 0, T: 0, A: 0, J: 0, total: 0 };
    valores.forEach(v => { if (c[v] != null) { c[v]++; c.total++; } });
    const base = c.P + c.T + c.A;
    c.pct = base ? Math.round((c.P + c.T) / base * 100) : null;
    return c;
  }

  // Resumen por estudiante a partir de las sesiones de un documento.
  function porEstudiante(doc) {
    const vals = {};
    Object.values(doc.sesiones || {}).forEach(s => {
      Object.entries(s.registros || {}).forEach(([estId, v]) => { (vals[estId] = vals[estId] || []).push(v); });
    });
    const out = {};
    Object.keys(vals).forEach(estId => { out[estId] = contar(vals[estId]); });
    return out;
  }

  window.ASISTENCIA = { PREFIX, ESTADOS, UMBRAL: 75, key, read, write, readAll, contar, porEstudiante };
})();
