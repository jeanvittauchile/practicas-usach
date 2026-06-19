// data.js — Núcleo de datos + lógica de cálculo para Prácticas USACH
// Arquitectura "consciente de práctica": un registro de prácticas (I, II, …)
// alimenta un objeto USACH_DATA mutable cuya IDENTIDAD se conserva al cambiar
// de práctica (así los `const D = window.USACH_DATA` de cada pantalla siguen
// siendo válidos). El cálculo es genérico y lee escala/niveles de cada eval.

// ───────────────────────────────────────────────────────────────
// Helper: construye un mapa puntaje→nota desde un arreglo indexado
// ───────────────────────────────────────────────────────────────
function esc(arr) {
  const o = {};
  arr.forEach((n, i) => { o[i] = n; });
  return o;
}

// ═══════════════════════════════════════════════════════════════
// CÁLCULO GENÉRICO (opera sobre la práctica activa)
// ═══════════════════════════════════════════════════════════════

function nivelesSetForEval(ev) {
  if (!ev) return [];
  if (ev.nivelesSet) return ev.nivelesSet;
  return (window.USACH_DATA.NIVELES || {})[ev.nivelesKey] || [];
}
function nivelInfoEv(ev, key) {
  return nivelesSetForEval(ev).find(n => n.key === key) || null;
}
function escalaForEval(ev) {
  if (!ev) return null;
  return ev.escala || (window.USACH_DATA.ESCALAS || {})[ev.escalaKey] || null;
}
function notaFromEscala(escala, pts) {
  if (!escala || pts == null) return null;
  if (escala[pts] != null) return escala[pts];
  const lo = Math.floor(pts), hi = Math.ceil(pts);
  const a = escala[lo], b = escala[hi];
  if (a == null || b == null) return null;
  return Math.round((a + (b - a) * (pts - lo)) * 10) / 10;
}

// Escala lineal con 60% de exigencia (1,0 → 0 pts · 4,0 → 60% · 7,0 → 100%).
// Se usa para instrumentos cuyas columnas pueden editarse (p. ej. supervisor P1),
// de modo que la nota se adapte automáticamente al número de columnas.
function escalaExigencia60(ideal) {
  const o = {}; const corte = 0.6 * ideal;
  for (let p = 0; p <= ideal; p++) {
    const nota = p <= corte ? 1 + (p / corte) * 3 : 4 + ((p - corte) / (ideal - corte)) * 3;
    o[p] = Math.round(nota * 10) / 10;
  }
  return o;
}
// Ideal (puntaje máximo) de un set de dimensiones, dado el nivel superior.
function idealDeDimensiones(dims, maxPts) {
  return dims.reduce((a, d) => a + d.indicadores.length, 0) * maxPts;
}

function puntajeEvaluacion(ev, nivelesEst) {
  if (!nivelesEst) return null;
  const set = nivelesSetForEval(ev);
  let total = 0, count = 0;
  for (const cr of ev.criterios) {
    const k = nivelesEst[cr.id];
    if (!k) continue;
    const ni = set.find(n => n.key === k);
    if (!ni) continue;
    total += ni.pts * (cr.doble ? 2 : 1);
    count++;
  }
  if (count < ev.criterios.length) return { puntos: total, parcial: true, count };
  return { puntos: total, parcial: false, count };
}

function calcNotaEvaluacion(ev, nivelesEst, diasAtraso) {
  const r = puntajeEvaluacion(ev, nivelesEst);
  if (!r) return null;
  const baseNota = notaFromEscala(escalaForEval(ev), r.puntos);
  if (baseNota == null) return null;
  const ajuste = (diasAtraso || 0) * 0.5;
  const notaFinal = Math.max(1.0, Math.round((baseNota - ajuste) * 10) / 10);
  return { puntos: r.puntos, parcial: r.parcial, notaBase: baseNota, ajuste, notaFinal };
}

// Instrumento de escala de apreciación (supervisor P1, proceso/terreno/autoeval P2).
// dimensiones: [{ indicadores:[{id}] }]  ·  nivelesSet + escala explícitos.
function calcInstrumento(respEst, dimensiones, nivelesSet, escala) {
  if (!respEst) return null;
  let total = 0, count = 0, maxCount = 0;
  dimensiones.forEach(dim => dim.indicadores.forEach(ind => {
    maxCount++;
    const k = respEst[ind.id];
    if (!k) return;
    const ni = nivelesSet.find(n => n.key === k);
    if (!ni) return;
    total += ni.pts;
    count++;
  }));
  if (count === 0) return null;
  return { puntos: total, parcial: count < maxCount, count, maxCount, nota: notaFromEscala(escala, total) };
}

// Compat P1: calcSupervisor usa la config "supervisor" de la práctica activa.
function calcSupervisor(respEst) {
  const cfg = window.USACH_DATA.SUPERVISOR;
  if (!cfg) return null;
  return calcInstrumento(respEst, cfg.dimensiones, window.USACH_DATA.NIVELES[cfg.nivelesKey], window.USACH_DATA.ESCALAS[cfg.escalaKey]);
}

// Nota final ponderada. Recibe el estado completo de la app.
// Cada ponderación usa `componentes` (ids de eval, promedio simple) o
// `resolver` (clave en USACH_DATA.RESOLVERS que devuelve {nota, parcial}).
function calcNotaFinal(estId, state) {
  const D = window.USACH_DATA;
  const partes = [];
  // Algunas prácticas (p. ej. Profesional II) ponderan distinto según la mención
  // del/la estudiante: si existe PONDERACIONES_FOR se usa esa lista por-estudiante.
  const ponderaciones = D.PONDERACIONES_FOR ? D.PONDERACIONES_FOR(estId, state) : D.PONDERACIONES;
  for (const pond of ponderaciones) {
    let nota = null, completa = true;
    if (pond.resolver) {
      const fn = (D.RESOLVERS || {})[pond.resolver];
      const r = fn ? fn(estId, state) : null;
      if (r && !r.parcial && r.nota != null) nota = r.nota; else completa = false;
    } else {
      const subnotas = [];
      for (const evid of pond.componentes) {
        const ev = D.EVALUACIONES.find(e => e.id === evid);
        const r = calcNotaEvaluacion(ev, state.niveles[evid]?.[estId], state.atrasos[evid]?.[estId]);
        if (!r || r.parcial) { completa = false; break; }
        subnotas.push(r.notaFinal);
      }
      if (completa && subnotas.length) nota = Math.round(subnotas.reduce((a, b) => a + b, 0) / subnotas.length * 10) / 10;
      else completa = false;
    }
    if (completa && nota != null) partes.push({ id: pond.id, label: pond.label, nota, peso: pond.peso });
  }
  if (partes.length === 0) return null;
  const ponderado = partes.reduce((a, p) => a + p.nota * p.peso, 0);
  const pesoTotal = partes.reduce((a, p) => a + p.peso, 0);
  return { partes, notaFinal: Math.round(ponderado * 10) / 10, completa: pesoTotal >= 0.99 };
}

// ═══════════════════════════════════════════════════════════════
// REGISTRO DE PRÁCTICAS + ACTIVACIÓN
// ═══════════════════════════════════════════════════════════════
const PRACTICAS = {};
function registerPractica(codigo, builder) { PRACTICAS[codigo] = builder; }

const USACH_DATA = {};
function activatePractica(codigo) {
  const builder = PRACTICAS[codigo];
  if (!builder) return;
  const data = builder();
  Object.keys(USACH_DATA).forEach(k => delete USACH_DATA[k]);
  Object.assign(USACH_DATA, data, { activeCodigo: codigo });
}

// Lista de prácticas para el selector del sidebar
const PRACTICAS_INDEX = [
  { codigo: 'I',   nombre: 'Introducción al campo laboral',          disponible: true },
  { codigo: 'II',  nombre: 'Escuelas y talleres deportivos',          disponible: true },
  { codigo: 'III', nombre: 'Intervención en fitness y act. física', disponible: true },
  { codigo: 'IV',  nombre: 'Intervención deportiva con tutor/a',       disponible: true },
  { codigo: 'PI',  nombre: 'Práctica Profesional I',                  disponible: true },
  { codigo: 'PII', nombre: 'Práctica Profesional II',                 disponible: true },
];

// ═══════════════════════════════════════════════════════════════
// PRÁCTICA I — Introducción al Campo Laboral
// ═══════════════════════════════════════════════════════════════

const NIVELES_SOLEMNE_P1 = [
  { key: 'E', label: 'Excelente', desc: 'Demuestra dominio de todos los elementos descritos en el indicador.', pts: 3 },
  { key: 'B', label: 'Bueno',     desc: 'Demuestra dominio de la mayoría de los elementos descritos.', pts: 2 },
  { key: 'S', label: 'Suficiente',desc: 'Cumple parcialmente con los elementos establecidos.', pts: 1 },
  { key: 'D', label: 'Deficiente',desc: 'Se evidencia dificultad para alcanzar el logro descrito.', pts: 0 },
];
const NIVELES_TALLER_P1 = [
  { key: 'L', label: 'Logrado',    desc: 'Cumple totalmente con lo solicitado.', pts: 3 },
  { key: 'P', label: 'Parcial',    desc: 'Cumple parcialmente con lo solicitado.', pts: 2 },
  { key: 'N', label: 'No logrado', desc: 'No cumple con lo solicitado.', pts: 1 },
];
const NIVELES_SUPERVISOR_P1 = [
  { key: 'S',  label: 'Siempre',        pts: 4 },
  { key: 'CS', label: 'Casi siempre',   pts: 3 },
  { key: 'O',  label: 'Ocasionalmente', pts: 2 },
  { key: 'CN', label: 'Casi nunca',     pts: 1 },
  { key: 'N',  label: 'Nunca',          pts: 0 },
];

const ESCALA_SOLEMNES_P1 = {
  0: 1.0, 1: 1.2, 2: 1.3, 3: 1.5, 4: 1.7, 5: 1.8, 6: 2.0, 7: 2.2,
  8: 2.3, 9: 2.5, 10: 2.7, 11: 2.8, 12: 3.0, 13: 3.2, 14: 3.3, 15: 3.5,
  16: 3.7, 17: 3.8, 18: 4.0, 19: 4.3, 20: 4.5, 21: 4.8, 22: 5.0, 23: 5.3,
  24: 5.5, 25: 5.8, 26: 6.0, 27: 6.3, 28: 6.5, 29: 6.8, 30: 7.0,
};
const ESCALA_TALLERES_P1 = {
  0: 1.0, 1: 1.3, 2: 1.6, 3: 1.8, 4: 2.1, 5: 2.4, 6: 2.7, 7: 2.9,
  8: 3.2, 9: 3.5, 10: 3.8, 11: 4.1, 12: 4.5, 13: 4.9, 14: 5.3, 15: 5.8,
  16: 6.2, 17: 6.6, 18: 7.0,
};
const ESCALA_SUPERVISOR_P1 = {
  0: 1.0, 1: 1.1, 2: 1.2, 3: 1.3, 4: 1.4, 5: 1.5, 6: 1.6, 7: 1.7, 8: 1.8,
  9: 1.9, 10: 2.0, 11: 2.1, 12: 2.3, 13: 2.4, 14: 2.5, 15: 2.6, 16: 2.7,
  17: 2.8, 18: 2.9, 19: 3.0, 20: 3.1, 21: 3.2, 22: 3.3, 23: 3.4, 24: 3.5,
  25: 3.6, 26: 3.7, 27: 3.8, 28: 3.9, 29: 4.0, 30: 4.2, 31: 4.3, 32: 4.5,
  33: 4.7, 34: 4.8, 35: 5.0, 36: 5.1, 37: 5.3, 38: 5.4, 39: 5.6, 40: 5.8,
  41: 5.9, 42: 6.1, 43: 6.2, 44: 6.4, 45: 6.5, 46: 6.7, 47: 6.8, 48: 7.0,
};

const SUPERVISOR_DIMENSIONES_P1 = [
  { id: 'd1', label: '1. Responsabilidad', indicadores: [
    { id: 'i1', texto: 'Asiste puntualmente a todas las sesiones programadas por su profesor/a tutor o supervisor/a.' },
    { id: 'i2', texto: 'Entrega las evaluaciones, talleres y cápsula en el plazo indicado.' },
  ]},
  { id: 'd2', label: '2. Solución de problemas', indicadores: [
    { id: 'i3', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su profesor/a supervisor/a.' },
    { id: 'i4', texto: 'Identifica sus debilidades y es capaz de solicitar ayuda para superar dificultades.' },
  ]},
  { id: 'd3', label: '3. Participación activa', indicadores: [
    { id: 'i5', texto: 'Participa activamente del proceso de práctica demostrando interés por adquirir nuevos aprendizajes.' },
  ]},
  { id: 'd4', label: '4. Desarrollo disciplinar', indicadores: [
    { id: 'i6', texto: 'Demuestra sus conocimientos y los relaciona con la experiencia práctica.' },
    { id: 'i7', texto: 'Prepara sus intervenciones con antelación evitando improvisar.' },
  ]},
  { id: 'd5', label: '5. Comunicación', indicadores: [
    { id: 'i8', texto: 'Comunica sus ideas con un lenguaje verbal y no verbal adecuado.' },
  ]},
  { id: 'd6', label: '6. Aspectos actitudinales', indicadores: [
    { id: 'i9',  texto: 'Demuestra una conducta respetuosa.' },
    { id: 'i10', texto: 'Acepta la crítica de manera respetuosa como oportunidad de desarrollo.' },
  ]},
  { id: 'd7', label: '7. Presentación: Salidas a terreno', indicadores: [
    { id: 'p1', texto: 'Organiza y estructura la presentación de manera clara, con introducción, desarrollo y conclusión.' },
    { id: 'p2', texto: 'Reflexiona críticamente sobre las experiencias vividas en las salidas a terreno en su comuna, identificando aprendizajes y áreas de mejora.' },
    { id: 'p3', texto: 'Describe y analiza las federaciones deportivas observadas, reconociendo su estructura, funciones y relevancia en el deporte local.' },
    { id: 'p4', texto: 'Demuestra dominio del contenido expuesto, respondiendo con fundamento las preguntas del/la supervisor/a.' },
  ]},
];

// ═══════════════════════════════════════════════════════════
// PRESENTACIÓN: SALIDAS A TERRENO (evaluada en Eval. Supervisor, Dim. 7)
// ═══════════════════════════════════════════════════════════
const PRESENTACION_TERRENO_P1 = {
  id: 'PT', grupo: 'presentacion', numero: 1,
  titulo: 'Presentación: Salidas a terreno',
  tipo: 'Exposición oral', duracion: '10–15 min + 5 min preguntas',
  fecha: '2025-11-05', semana: 14, estado: 'pendiente',
  maxPuntos: 16, ponderacion: 0,
  vinculado: 'supervisor-d7',
  descripcion: 'Exposición oral y reflexiva sobre las experiencias vividas en las salidas a terreno en la comuna y las federaciones deportivas observadas durante el semestre. Se evalúa mediante la Dimensión 7 del instrumento del Supervisor.',
  resultadosAprendizaje: [
    'Reflexionar críticamente sobre el campo laboral del entrenador deportivo a partir de la observación directa de organizaciones e instituciones del deporte en la comunidad.',
    'Comunicar aprendizajes y conclusiones con claridad, lenguaje técnico y fundamento profesional.',
  ],
  objetivosEspecificos: [
    'Describir el contexto institucional de cada salida a terreno (organismo visitado, funciones, estructura y relevancia deportiva local).',
    'Reflexionar sobre las federaciones deportivas observadas: su rol en el desarrollo del deporte, la relación con el entrenador y los desafíos del sistema deportivo en Chile.',
    'Identificar aprendizajes significativos de las salidas a terreno relacionándolos con los contenidos del curso.',
    'Comunicar la experiencia con estructura clara, lenguaje técnico y soporte visual de calidad.',
  ],
  instrucciones: [
    'Preparar una exposición oral de 10 a 15 min sobre las salidas a terreno realizadas en la comuna durante el semestre.',
    'Incluir en la presentación: (a) contexto de cada visita (lugar, fecha, organismo/federación visitada); (b) descripción de la institución u organización observada (estructura, funciones, programas); (c) análisis crítico de lo observado (fortalezas, debilidades, relevancia para el deporte local); (d) reflexión personal sobre aprendizajes y su conexión con el rol del entrenador.',
    'Utilizar soporte visual obligatorio (PPT, Canva o Prezi), mínimo 8 diapositivas, con imágenes ilustrativas y texto síntesis.',
    'Responder 5 preguntas del/la supervisor/a al finalizar la exposición.',
  ],
  pautasEstudiante: [
    'Prepara tu exposición con anticipación; practica en voz alta para respetar el tiempo.',
    'Usa lenguaje técnico-deportivo apropiado; evita el lenguaje coloquial.',
    'El soporte visual es un apoyo, no un guión: no leas las diapositivas.',
    'Conecta lo observado con los contenidos teóricos del curso (fisiología, pedagogía, metodología del entrenamiento).',
    'Reflexiona con profundidad: ¿qué aprendiste? ¿qué te sorprendió? ¿cómo aporta esto a tu formación como entrenador/a?',
  ],
  pautas: [
    'La nota se registra en la Dimensión 7 del instrumento del Supervisor (4 indicadores, escala S/CS/O/CN/N, ideal 16 pts).',
    'Evalúe estructura y claridad expositiva, profundidad de la reflexión, calidad del análisis de las federaciones y dominio al responder preguntas.',
    'Considere la coherencia entre lo observado en terreno y los aprendizajes declarados.',
    'Penalice la lectura literal de las diapositivas o la ausencia de reflexión crítica.',
  ],
  aspectosFormales: [
    'Soporte visual obligatorio (PPT/Canva/Prezi), mínimo 8 diapositivas.',
    'Vestimenta institucional: polera o polerón de la carrera.',
    'Lenguaje técnico, claro y profesional durante toda la exposición.',
    'Puntualidad: presentarse 5 min antes del horario acordado con el/la supervisor/a.',
  ],
  criterios: [], // calificación vía supervisor dim 7 → indicadores p1–p4
};

const SOLEMNES_P1 = [
  {
    id: 'S1', grupo: 'solemne', numero: 1, nivelesKey: 'NIVELES_SOLEMNE', escalaKey: 'ESCALA_SOLEMNES',
    titulo: 'Cápsula de video: Entrevista a un entrenador', tipo: 'Audiovisual', duracion: '15 min máx.',
    fecha: '2025-08-15', semana: 3.15, estado: 'corregida', maxPuntos: 30,
    descripcion: 'Realizar una entrevista en formato audiovisual a un entrenador o entrenadora, con análisis y reflexión.',
    resultadosAprendizaje: [
      'Reconocer el campo laboral del entrenador deportivo a través del contacto directo con profesionales en ejercicio.',
      'Desarrollar habilidades comunicacionales y de síntesis en formato audiovisual.',
    ],
    objetivosEspecificos: [
      'Formular preguntas pertinentes para una entrevista profesional.',
      'Editar material audiovisual con criterios técnicos básicos.',
      'Analizar y comparar respuestas obtenidas según marcos teóricos del curso.',
    ],
    instrucciones: [
      'Contactar a un entrenador/a con experiencia mínima de 3 años en su disciplina.',
      'Grabar la entrevista (máx. 15 minutos) abordando al menos las 14 preguntas trabajadas en talleres.',
      'Editar el video respetando ritmo, encuadre y audio.',
      'Cargar el archivo en la plataforma Moodle en la fecha indicada.',
    ],
    pautasEstudiante: [
      'Coordina la entrevista con al menos dos semanas de anticipación.',
      'Solicita autorización expresa para grabar y publicar el contenido.',
      'Prepara las preguntas antes de la sesión; evita improvisar.',
      'Revisa el audio antes de finalizar la grabación.',
      'Edita el video usando software gratuito si no tienes uno; lo importante es la claridad, no los efectos.',
    ],
    pautas: [
      'Considere claridad de audio y encuadre como criterio técnico mínimo.',
      'Evalúe la pertinencia y profundidad de las preguntas, no solo la cantidad.',
      'Penalice formalmente cualquier ausencia de bibliografía o citación.',
      'Atención a la coherencia entre el análisis comparado y las conclusiones.',
    ],
    aspectosFormales: [
      'Formato MP4, resolución mínima 720p.',
      'Subtítulos opcionales pero recomendados.',
      'Carátula con datos del estudiante y entrevistado.',
      'Bibliografía o fuentes consultadas.',
    ],
    criterios: [
      { id: 'c1', texto: 'Entrega las entrevistas en la fecha indicada.', doble: false },
      { id: 'c2', texto: 'Cumple con todos los requisitos, instrucciones y aspectos formales de la entrevista.', doble: true },
      { id: 'c3', texto: 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.', doble: false },
      { id: 'c4', texto: 'Utiliza lenguaje técnico y formal en la entrevista.', doble: false },
      { id: 'c5', texto: 'Su redacción gramatical es coherente y sin faltas de ortografía.', doble: false },
      { id: 'c6', texto: 'Análisis comparado por pregunta, aportando una visión propia y fundamentación teórica.', doble: true },
      { id: 'c7', texto: 'Conclusión, reflexionando sobre los principales conocimientos adquiridos.', doble: true },
    ],
  },
  {
    id: 'S2', grupo: 'solemne', numero: 2, nivelesKey: 'NIVELES_SOLEMNE', escalaKey: 'ESCALA_SOLEMNES',
    titulo: 'Investigación en terreno: Corporación de Deportes Municipal', tipo: 'Terreno + Informe', duracion: 'Visita + 6-8 pp.',
    fecha: '2025-10-10', semana: 4.7, estado: 'en-evaluacion', maxPuntos: 30,
    descripcion: 'Visita a terreno a la corporación de deportes de la comuna del estudiante e informe descriptivo.',
    resultadosAprendizaje: [
      'Identificar la institucionalidad deportiva local y los actores que la conforman.',
      'Aplicar herramientas básicas de investigación en terreno.',
    ],
    objetivosEspecificos: [
      'Describir la infraestructura deportiva comunal.',
      'Identificar a los responsables de la oferta deportiva comunal.',
      'Proponer mejoras desde la mirada del futuro entrenador.',
    ],
    instrucciones: [
      'Coordinar visita formal a la corporación municipal de deportes.',
      'Tomar registro fotográfico (con autorización) de las instalaciones.',
      'Entrevistar al menos a un responsable de programación deportiva.',
      'Elaborar informe estructurado (intro, hallazgos, análisis, sugerencias).',
    ],
    pautasEstudiante: [
      'Identifica con anticipación la corporación o departamento municipal a visitar.',
      'Asiste con credencial USACH y una carta tipo si la corporación lo requiere.',
      'Toma notas de campo durante la visita; no confíes solo en la memoria.',
      'Las fotografías deben tener autorización explícita del lugar visitado.',
      'Estructura el informe siguiendo el orden: introducción → hallazgos → análisis → sugerencias.',
    ],
    pautas: [
      'Verifique que las fotografías estén numeradas y con epígrafe descriptivo.',
      'Las sugerencias deben estar fundamentadas en datos observados en terreno.',
      'No considere válidas las visitas sin coordinación previa documentada.',
      'Valore la mirada crítica por sobre la mera descripción.',
    ],
    aspectosFormales: [
      'Mínimo 6 páginas, máximo 8 (excluyendo anexos).',
      'Times New Roman 12, interlineado 1.5.',
      'Anexar fotos numeradas con epígrafe.',
      'Citación APA 7.',
    ],
    criterios: [
      { id: 'c1', texto: 'Entrega el informe en la fecha indicada.', doble: false },
      { id: 'c2', texto: 'Cumple con todos los requisitos, instrucciones y aspectos formales.', doble: true },
      { id: 'c3', texto: 'Logra poder de síntesis, dando énfasis a lo más importante.', doble: false },
      { id: 'c4', texto: 'Describe cada infraestructura deportiva comunal pública o privada, incluyendo fotografías.', doble: false },
      { id: 'c5', texto: 'Entrega información sobre los responsables de la actividad deportiva comunal.', doble: false },
      { id: 'c6', texto: 'Análisis de toda la información recopilada con sugerencias fundamentadas.', doble: true },
      { id: 'c7', texto: 'Entrega sugerencias de actividades recreativas o deportivas que aporten a la comuna.', doble: true },
    ],
  },
  {
    id: 'S3', grupo: 'solemne', numero: 3, nivelesKey: 'NIVELES_SOLEMNE', escalaKey: 'ESCALA_SOLEMNES',
    titulo: 'Investigación en terreno: Comité Olímpico o Paralímpico', tipo: 'Terreno + Informe', duracion: 'Visita + 6-8 pp.',
    fecha: '2025-11-21', semana: 9.0, estado: 'pendiente', maxPuntos: 30,
    descripcion: 'Investigación en terreno sobre un deporte del Estadio Nacional, Comité Olímpico o Paralímpico.',
    resultadosAprendizaje: [
      'Conocer la institucionalidad deportiva nacional de alto rendimiento.',
      'Vincular teoría del curso con observación directa.',
    ],
    objetivosEspecificos: [
      'Seleccionar un deporte de interés y caracterizar su organización institucional.',
      'Visitar las instalaciones donde se desarrolla.',
      'Producir informe con mirada crítica.',
    ],
    instrucciones: [
      'Seleccionar un deporte presente en el Estadio Nacional, COCh o Coparalimpico.',
      'Coordinar visita o entrevista virtual con un responsable.',
      'Documentar con fotografías y notas de campo.',
      'Cargar informe en formato PDF.',
    ],
    pautasEstudiante: [
      'Elige un deporte con el que tengas cierta afinidad para facilitar el desarrollo.',
      'Si no puedes visitar el Estadio Nacional, gestiona una entrevista virtual con un dirigente.',
      'Vincula tus observaciones con los marcos teóricos vistos en clases.',
      'Cita correctamente todas las fuentes en formato APA 7.',
      'Reserva tiempo para una revisión ortográfica final antes de subir el informe.',
    ],
    pautas: [
      'Verifique pertinencia del deporte elegido respecto a los criterios COCh/Coparalimpico.',
      'El análisis comparado debe sustentarse con referencias APA 7.',
      'Considere la conexión teoría-práctica como criterio diferenciador.',
      'Atención a la calidad reflexiva de la conclusión personal.',
    ],
    aspectosFormales: [
      'Portada institucional USACH.',
      'Mínimo 6 páginas, máximo 8.',
      'Referencias APA 7.',
    ],
    criterios: [
      { id: 'c1', texto: 'Entrega el informe en la fecha indicada.', doble: false },
      { id: 'c2', texto: 'Cumple con todos los requisitos, instrucciones y aspectos formales.', doble: true },
      { id: 'c3', texto: 'Logra poder de síntesis dando énfasis a lo más importante.', doble: false },
      { id: 'c4', texto: 'Utiliza lenguaje técnico y formal en el informe.', doble: false },
      { id: 'c5', texto: 'Su redacción gramatical es coherente y sin faltas de ortografía.', doble: false },
      { id: 'c6', texto: 'Análisis comparado, aportando una visión propia y fundamentación.', doble: true },
      { id: 'c7', texto: 'Conclusión que reflexiona sobre los principales conocimientos adquiridos.', doble: true },
    ],
  },
];

const TALLERES_P1 = [
  {
    id: 'T1', grupo: 'taller', numero: 1, nivelesKey: 'NIVELES_TALLER', escalaKey: 'ESCALA_TALLERES',
    titulo: 'Ensayo personal: Buscando tu identidad', tipo: 'Ensayo', duracion: '3-5 pp.',
    fecha: '2025-08-29', semana: 14.0, estado: 'corregida', maxPuntos: 18,
    descripcion: 'Ensayo personal narrativo sobre la propia identidad y vocación profesional.',
    resultadosAprendizaje: ['Reflexionar sobre la motivación personal hacia la carrera de Entrenador Deportivo.'],
    objetivosEspecificos: [
      'Identificar los factores que impulsaron la elección de la carrera.',
      'Contextualizar las motivaciones personales.',
      'Proyectarse profesionalmente.',
    ],
    instrucciones: [
      'Redactar en primera persona un ensayo introspectivo de 3 a 5 páginas.',
      'Incluir al menos dos frases significativas o citas que te representen.',
      'Subir a la plataforma en formato PDF.',
    ],
    pautasEstudiante: [
      'Escribe en primera persona y de forma honesta; el ensayo es introspectivo.',
      'Recolecta las dos frases significativas antes de empezar a redactar.',
      'Lee tu ensayo en voz alta para detectar inconsistencias.',
      'Pide a otra persona que lo lea para retroalimentación general.',
      'Cumple estrictamente con la extensión solicitada (3-5 páginas).',
    ],
    pautas: [
      'El ensayo es introspectivo: valore autenticidad y profundidad reflexiva.',
      'Las dos frases significativas son requisito mínimo, no opcional.',
      'Cuide la corrección ortográfica como criterio formal.',
      'Considere la coherencia entre motivación inicial y proyección profesional.',
    ],
    aspectosFormales: ['Times New Roman 12, interlineado 1.5.', 'Mínimo 3 páginas, máximo 5.', 'Portada con datos personales.'],
    criterios: [
      { id: 'c1', texto: 'Contenido del relato: factores, motivos, anhelos o fuerzas impulsoras de la vocación.' },
      { id: 'c2', texto: 'Contexto del relato: personas, lugares, edades y emociones que enmarcan los hechos.' },
      { id: 'c3', texto: 'Personas influyentes en su formación personal.' },
      { id: 'c4', texto: 'Proyecciones: cómo se imagina como entrenador/a.' },
      { id: 'c5', texto: 'Frases significativas (al menos dos en el relato).' },
      { id: 'c6', texto: 'Aspectos formales (portada, extensión, ortografía, citación).' },
    ],
  },
  {
    id: 'T2', grupo: 'taller', numero: 2, nivelesKey: 'NIVELES_TALLER', escalaKey: 'ESCALA_TALLERES',
    titulo: 'Preguntas para entrevista a entrenador', tipo: 'Informe', duracion: '14 preguntas + análisis',
    fecha: '2025-09-12', semana: 3.15, estado: 'corregida', maxPuntos: 18,
    descripcion: 'Recopilación, selección y elaboración de preguntas para entrevistar a un entrenador.',
    resultadosAprendizaje: ['Desarrollar habilidades de diseño de instrumentos cualitativos.'],
    objetivosEspecificos: [
      'Recopilar preguntas base relevantes para la entrevista profesional.',
      'Fundamentar la selección con marcos teóricos del curso.',
      'Crear preguntas originales pertinentes al contexto.',
    ],
    instrucciones: [
      'Investigar y recopilar al menos 14 preguntas de fuentes nacionales e internacionales.',
      'Seleccionar 10 vinculadas a identidad profesional del entrenador.',
      'Fundamentar la elección.',
      'Agregar 5 preguntas de creación propia.',
      'Cargar en Moodle/Drive en la fecha indicada.',
    ],
    pautasEstudiante: [
      'Diversifica las fuentes: al menos 7 nacionales y 7 internacionales.',
      'No te limites a copiar preguntas: parafrasea y adapta al contexto chileno.',
      'Justifica cada selección con un argumento breve pero claro.',
      'Las 5 preguntas propias deben aportar algo distinto a las 14 base.',
      'Cita todas las fuentes con formato APA 7.',
    ],
    pautas: [
      'Verifique que las 14 preguntas tengan fuentes citadas (nacionales e internacionales).',
      'La fundamentación debe vincularse con marcos teóricos del curso.',
      'Las 5 preguntas propias deben ser originales y pertinentes.',
      'Considere claridad y pertinencia por sobre cantidad.',
    ],
    aspectosFormales: ['Documento PDF, mínimo 3 páginas.', 'Citación de las fuentes de origen de cada pregunta.'],
    criterios: [
      { id: 'c1', texto: 'Recopila las 14 preguntas para la entrevista (nacionales e internacionales).' },
      { id: 'c2', texto: 'Selecciona 10 preguntas vinculadas a la identidad profesional.' },
      { id: 'c3', texto: 'Fundamenta de manera clara las razones de la elección con base teórica del curso.' },
      { id: 'c4', texto: 'Elabora cinco preguntas de creación propia.' },
      { id: 'c5', texto: 'Carga las preguntas en la plataforma en el plazo estipulado.' },
      { id: 'c6', texto: 'Cumple con los aspectos formales indicados.' },
    ],
  },
  {
    id: 'T3', grupo: 'taller', numero: 3, nivelesKey: 'NIVELES_TALLER', escalaKey: 'ESCALA_TALLERES',
    titulo: 'Cápsula de video sobre motivaciones a futuro', tipo: 'Audiovisual', duracion: '5-8 min',
    fecha: '2025-11-07', semana: 14.0, estado: 'pendiente', maxPuntos: 18,
    descripcion: 'Cápsula audiovisual sobre las motivaciones a futuro del/la estudiante en la carrera.',
    resultadosAprendizaje: ['Comunicar proyecciones profesionales en formato audiovisual.'],
    objetivosEspecificos: [
      'Sintetizar aprendizajes del semestre.',
      'Describir actividades significativas del proceso.',
      'Caracterizar al entrenador/a que se aspira a ser.',
    ],
    instrucciones: [
      'Cumplir con los 6 primeros puntos del documento de instrucciones.',
      'Describir al menos 3 actividades del semestre.',
      'Expresarse con vocabulario técnico y formal.',
      'Cerrar con conclusión sobre el entrenador/a ideal.',
    ],
    pautasEstudiante: [
      'Revisa los 6 puntos del documento antes de filmar.',
      'Practica el guion al menos dos veces antes de grabar.',
      'Mantén buena iluminación y audio claro; un teléfono moderno basta.',
      'Respeta el rango de 5-8 minutos; los videos cortos no muestran tu trabajo y los largos pierden foco.',
      'Cierra con una conclusión clara y mirando a cámara.',
    ],
    pautas: [
      'Verifique que los 6 puntos de las instrucciones estén cubiertos.',
      'La duración debe estar entre 5 y 8 minutos sin excepciones.',
      'Valore vocabulario técnico y formal sobre el coloquial.',
      'La conclusión debe ser coherente con las actividades expuestas.',
    ],
    aspectosFormales: ['Duración 5-8 minutos.', 'Recursos didácticos con redacción y ortografía correctas.', 'Formato MP4 720p mínimo.'],
    criterios: [
      { id: 'c1', texto: 'Cumple en su totalidad con los 6 primeros puntos de las instrucciones.' },
      { id: 'c2', texto: 'Recursos didácticos del video con redacción y ortografía correctas.' },
      { id: 'c3', texto: 'Describe al menos tres actividades significativas realizadas durante el semestre.' },
      { id: 'c4', texto: 'Se expresa con fluidez, vocabulario técnico y formal.' },
      { id: 'c5', texto: 'Explica las características que debiese tener el entrenador/a deseado.' },
      { id: 'c6', texto: 'Realiza conclusión coherente con lo expuesto.' },
    ],
  },
];

const ESTUDIANTES_P1 = [
  { id: 'e1', rut: '21.345.678-9', nombre: 'Antonia Pérez Vega',     email: 'antonia.perez@usach.cl',    telefono: '+56 9 8245 1192' },
  { id: 'e2', rut: '20.987.654-3', nombre: 'Benjamín Soto Carrasco', email: 'benjamin.soto@usach.cl',     telefono: '+56 9 6712 8403' },
  { id: 'e3', rut: '21.112.443-K', nombre: 'Camila Riquelme Núñez',  email: 'camila.riquelme@usach.cl',   telefono: '+56 9 9018 5526' },
  { id: 'e4', rut: '22.456.789-1', nombre: 'Diego Fuentes Aguilera', email: 'diego.fuentes@usach.cl',     telefono: '+56 9 3344 7710' },
  { id: 'e5', rut: '21.890.123-7', nombre: 'Francisca Mella Jara',   email: 'francisca.mella@usach.cl',   telefono: '+56 9 5567 9821' },
];
const PROFESORES_P1 = [
  { id: 'p1', nombre: 'Prof. Andrés Tapia Vergara', email: 'andres.tapia@usach.cl',  rol: 'Profesor Supervisor', activo: true },
  { id: 'p2', nombre: 'Prof. María Inés Cáceres',   email: 'maria.caceres@usach.cl', rol: 'Profesora Tutora',    activo: true },
];
const ANEXOS_ADMIN_P1 = [
  { id: 'a1', titulo: 'Calendario Académico', desc: 'Calendario oficial USACH para el semestre en curso.', tipo: 'PDF', tamano: '0.4 MB' },
  { id: 'a2', titulo: 'Consentimiento Informado',          desc: 'Formato de consentimiento para visitas a terreno.', tipo: 'PDF', tamano: '0.2 MB' },
  { id: 'a3', titulo: 'Declaración Individual de Accidentes Personales', desc: 'Documento obligatorio para actividades en terreno.', tipo: 'PDF', tamano: '0.3 MB' },
  { id: 'a4', titulo: 'Manual ABCDE — Primeros Auxilios', desc: 'Manual de evaluación y atención inicial.', tipo: 'PDF', tamano: '1.8 MB' },
  { id: 'a5', titulo: 'Protocolo de Salud Mental',         desc: 'Protocolo institucional de derivación y acompañamiento.', tipo: 'PDF', tamano: '0.6 MB' },
];

const EVALUACIONES_P1 = [...SOLEMNES_P1, ...TALLERES_P1];

const PONDERACIONES_P1 = [
  { id: 'p1', label: 'Evaluación 1 + Taller 2', componentes: ['S1', 'T2'], peso: 0.15 },
  { id: 'p2', label: 'Evaluación 2',            componentes: ['S2'],        peso: 0.15 },
  { id: 'p3', label: 'Evaluación 3',            componentes: ['S3'],        peso: 0.20 },
  { id: 'p4', label: 'Taller 1 + 3',            componentes: ['T1', 'T3'], peso: 0.20 },
  { id: 'p5', label: 'Evaluación Supervisor/a', resolver: 'SUP',            peso: 0.30 },
];

// helper para generar niveles aleatorios pero realistas
function R(seed) {
  return (key) => {
    const x = (Math.sin(seed * 9301 + key.charCodeAt(0) * 49297) + 1) / 2;
    if (x < 0.50) return 0;
    if (x < 0.80) return 1;
    if (x < 0.98) return 2;
    return 3;
  };
}

function buildPracticaI() {
  // Pre-llenos de niveles por (evalId, estId, critId) y atrasos
  const niveles = {}, atrasos = {};
  EVALUACIONES_P1.forEach((ev, idxEv) => {
    if (ev.estado === 'pendiente') return;
    niveles[ev.id] = {}; atrasos[ev.id] = {};
    ESTUDIANTES_P1.forEach((est, idxEst) => {
      const esEnEvaluacion = ev.estado === 'en-evaluacion';
      if (esEnEvaluacion && idxEst >= 3) return;
      niveles[ev.id][est.id] = {};
      const rng = R((idxEv + 1) * 17 + (idxEst + 1) * 31);
      const levelSet = ev.grupo === 'solemne' ? NIVELES_SOLEMNE_P1 : NIVELES_TALLER_P1;
      ev.criterios.forEach((cr, idxCr) => {
        if (esEnEvaluacion && idxCr >= 4) return;
        const lvIdx = Math.min(rng(cr.id), levelSet.length - 1);
        niveles[ev.id][est.id][cr.id] = levelSet[lvIdx].key;
      });
      atrasos[ev.id][est.id] = (idxEst === 1) ? 1 : (idxEst === 4 ? 2 : 0);
    });
  });

  const supervisor = {}, autoeval = {};
  ESTUDIANTES_P1.forEach((est, idxEst) => {
    supervisor[est.id] = {}; autoeval[est.id] = {};
    if (idxEst >= 3) return;
    const rng = R(idxEst * 41 + 7), rngA = R(idxEst * 53 + 13);
    SUPERVISOR_DIMENSIONES_P1.forEach(dim => dim.indicadores.forEach(ind => {
      supervisor[est.id][ind.id] = NIVELES_SUPERVISOR_P1[Math.min(rng(ind.id), 2)].key;
      autoeval[est.id][ind.id]   = NIVELES_SUPERVISOR_P1[Math.min(rngA(ind.id), 2)].key;
    }));
  });

  return {
    meta: {
      codigo: 'I',
      nombre: 'Introducción al Campo Laboral',
      cursoTitulo: 'Práctica I — Introducción al Campo Laboral',
      breadcrumb: 'Práctica I',
      semestre: 'Semestre 2025-2',
      escuela: 'Escuela de Cs. de la Actividad Física, Deporte y Salud · Entrenador Deportivo',
    },
    NIVELES: { NIVELES_SOLEMNE: NIVELES_SOLEMNE_P1, NIVELES_TALLER: NIVELES_TALLER_P1, NIVELES_SUPERVISOR: NIVELES_SUPERVISOR_P1 },
    ESCALAS: { ESCALA_SOLEMNES: ESCALA_SOLEMNES_P1, ESCALA_TALLERES: ESCALA_TALLERES_P1, ESCALA_SUPERVISOR: ESCALA_SUPERVISOR_P1 },
    // compat directo (algunas pantallas/los PDF leen estos)
    NIVELES_SOLEMNE: NIVELES_SOLEMNE_P1, NIVELES_TALLER: NIVELES_TALLER_P1, NIVELES_SUPERVISOR: NIVELES_SUPERVISOR_P1,
    ESCALA_SOLEMNES: ESCALA_SOLEMNES_P1, ESCALA_TALLERES: ESCALA_TALLERES_P1, ESCALA_SUPERVISOR: ESCALA_SUPERVISOR_P1,
    GRUPOS: [
      { id: 'solemne', label: 'Solemnes', singular: 'Solemne', sigla: 'S', color: 'teal',
        desc: 'Evaluaciones formales con rúbrica común (7 criterios × 4 niveles) · máx. 30 pts' },
      { id: 'taller', label: 'Talleres', singular: 'Taller', sigla: 'T', color: 'orange',
        desc: 'Evaluaciones con consignas distintas (6 criterios × 3 niveles) · máx. 18 pts' },
      { id: 'presentacion', label: 'Presentaciones', singular: 'Presentación', sigla: 'P', color: 'teal',
        desc: 'Exposición oral reflexiva sobre las salidas a terreno en la comuna y las federaciones deportivas observadas · evaluada en Eval. Supervisor (Dim. 7)' },
    ],
    SOLEMNES: SOLEMNES_P1, TALLERES: TALLERES_P1,
    EVALUACIONES: [...EVALUACIONES_P1, PRESENTACION_TERRENO_P1],
    PONDERACIONES: PONDERACIONES_P1,
    SUPERVISOR: { dimensiones: SUPERVISOR_DIMENSIONES_P1, nivelesKey: 'NIVELES_SUPERVISOR', escalaKey: 'ESCALA_SUPERVISOR', maxPuntos: 48 },
    SUPERVISOR_DIMENSIONES: SUPERVISOR_DIMENSIONES_P1,
    AUTOEVAL: { dimensiones: SUPERVISOR_DIMENSIONES_P1, nivelesKey: 'NIVELES_SUPERVISOR', escalaKey: 'ESCALA_SUPERVISOR', maxPuntos: 48 },
    ANEXOS_ADMIN: ANEXOS_ADMIN_P1,
    ESTUDIANTES: ESTUDIANTES_P1,
    PROFESORES: PROFESORES_P1,
    // Columnas de la tabla de notas
    NOTAS_COLUMNS: [
      ...SOLEMNES_P1.map(ev => ({ key: ev.id, label: `Solemne ${ev.numero}`, sub: ev.numero === 3 ? '20%' : '15%', kind: 'eval', evalId: ev.id, color: 'teal' })),
      ...TALLERES_P1.map(ev => ({ key: ev.id, label: `Taller ${ev.numero}`, sub: '—', kind: 'eval', evalId: ev.id, color: 'orange' })),
      { key: 'SUP', label: 'Superv.+Present.', sub: '30%', kind: 'sup' },
    ],
    RESOLVERS: {
      SUP: (estId, state) => {
        const dims = state.supervisorDims || SUPERVISOR_DIMENSIONES_P1;
        const escala = escalaExigencia60(idealDeDimensiones(dims, NIVELES_SUPERVISOR_P1[0].pts));
        const r = calcInstrumento(state.supervisor[estId], dims, NIVELES_SUPERVISOR_P1, escala);
        return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
      },
      AUTO: (estId, state) => {
        const dims = state.supervisorDims || SUPERVISOR_DIMENSIONES_P1;
        const escala = escalaExigencia60(idealDeDimensiones(dims, NIVELES_SUPERVISOR_P1[0].pts));
        const r = calcInstrumento(state.autoeval[estId], dims, NIVELES_SUPERVISOR_P1, escala);
        return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
      },
    },
    // Estado inicial demo / vacío (factory)
    initialState: (kind) => {
      if (kind === 'vacio') {
        return {
          evaluaciones: [...EVALUACIONES_P1, PRESENTACION_TERRENO_P1].map(e => ({ ...e, estado: 'pendiente' })),
          estudiantes: ESTUDIANTES_P1.map(e => ({ ...e })),
          niveles: {}, atrasos: {}, supervisor: {}, autoeval: {},
          supervisorDims: JSON.parse(JSON.stringify(SUPERVISOR_DIMENSIONES_P1)),
          supervisorComments: {}, autoevalComments: {}, evalAnexos: {},
        };
      }
      return {
        evaluaciones: [...EVALUACIONES_P1, PRESENTACION_TERRENO_P1].map(e => ({ ...e })),
        estudiantes: ESTUDIANTES_P1.map(e => ({ ...e })),
        niveles: JSON.parse(JSON.stringify(niveles)),
        atrasos: JSON.parse(JSON.stringify(atrasos)),
        supervisor: JSON.parse(JSON.stringify(supervisor)),
        autoeval: JSON.parse(JSON.stringify(autoeval)),
        supervisorDims: JSON.parse(JSON.stringify(SUPERVISOR_DIMENSIONES_P1)),
        supervisorComments: {
          e1: 'Antonia ha demostrado excelente compromiso con el proceso de práctica. Sus entregas son puntuales y muestra notable capacidad reflexiva. Recomendable continuar fortaleciendo la fundamentación teórica en sus análisis.',
          e2: 'Benjamín cumple con los plazos aunque ha presentado dos atrasos menores. Su trabajo en terreno es destacable, pero requiere reforzar aspectos formales de redacción.',
          e3: 'Camila se destaca por la calidad de sus reflexiones personales y participación en clases. Ha logrado vincular adecuadamente la teoría con la observación práctica.',
        },
        autoevalComments: {},
        evalAnexos: {
          S1: [
            { id: 's1-1', titulo: 'Pauta de la evaluación', tipo: 'Pauta de la evaluación', tamano: '0.3 MB', subido: '12 ago 2025', por: 'Andrés Tapia' },
            { id: 's1-2', titulo: 'Lectura complementaria — Marco teórico', tipo: 'Lectura obligatoria', tamano: '0.8 MB', subido: '12 ago 2025', por: 'Andrés Tapia' },
          ],
          S2: [{ id: 's2-1', titulo: 'Carta de presentación municipal', tipo: 'Material complementario', tamano: '0.2 MB', subido: '20 sep 2025', por: 'Andrés Tapia' }],
          T2: [{ id: 't2-1', titulo: 'Listado preliminar de fuentes', tipo: 'Material complementario', tamano: '0.5 MB', subido: '5 sep 2025', por: 'Andrés Tapia' }],
        },
      };
    },
  };
}
registerPractica('I', buildPracticaI);

// ───────────────────────────────────────────────────────────────
// Helpers de presentación (consciencia de práctica)
// ───────────────────────────────────────────────────────────────
function grupoDef(grupoId) {
  return (window.USACH_DATA.GRUPOS || []).find(g => g.id === grupoId) || { id: grupoId, label: grupoId, singular: grupoId, sigla: '?', color: 'teal', desc: '' };
}
function grupoEsTeal(grupoId) { return grupoDef(grupoId).color === 'teal'; }
function evalSigla(ev) { return `${grupoDef(ev.grupo).sigla}${ev.numero}`; }

// Activar Práctica I por defecto (las pantallas leen USACH_DATA al renderizar)
activatePractica('I');

// Export to window
Object.assign(window, {
  USACH_DATA,
  USACH_CALC: {
    puntajeEvaluacion, calcNotaEvaluacion, calcSupervisor, calcInstrumento, calcNotaFinal,
    nivelInfoEv, nivelesSetForEval, escalaForEval, notaFromEscala,
    escalaExigencia60, idealDeDimensiones,
    // compat: nivelInfo(grupo,key) usado por código antiguo
    nivelInfo: (grupoOrEv, key) => {
      if (grupoOrEv && grupoOrEv.criterios) return nivelInfoEv(grupoOrEv, key);
      // forma antigua: ('solemne'|'taller', key)
      const set = grupoOrEv === 'solemne' ? (window.USACH_DATA.NIVELES_SOLEMNE || [])
                : grupoOrEv === 'taller' ? (window.USACH_DATA.NIVELES_TALLER || [])
                : [];
      return set.find(n => n.key === key) || null;
    },
  },
  PRACTICAS, PRACTICAS_INDEX, activatePractica, registerPractica,
  grupoDef, grupoEsTeal, evalSigla, escFromArray: esc,
});
