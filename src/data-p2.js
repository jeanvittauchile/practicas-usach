// data-p2.js — Práctica II · "Escuelas y talleres deportivos"
// Se registra en el registro de prácticas definido en data.js.
// Práctica en terreno con entrenador/a tutor/a en un centro deportivo.

(function () {
  const EF = window.escFromArray; // esc([...]) → {0:n0, 1:n1, …}

  // ───────────────────────────────────────────────────────────
  // Niveles
  // ───────────────────────────────────────────────────────────
  const NIVELES_EBSD = [
    { key: 'E', label: 'Excelente',  pts: 3, desc: 'Demuestra dominio de todos los elementos descritos en el indicador.' },
    { key: 'B', label: 'Bueno',      pts: 2, desc: 'Demuestra dominio de la mayoría de los elementos descritos en el indicador.' },
    { key: 'S', label: 'Suficiente', pts: 1, desc: 'Cumple parcialmente con los elementos establecidos o solo con alguno de ellos.' },
    { key: 'D', label: 'Deficiente', pts: 0, desc: 'Se evidencia dificultad para alcanzar el logro descrito, o no es observado.' },
  ];
  // Pauta de apreciación supervisor (terreno + proceso): L/ML/NL/I/NO
  const NIVELES_APREC = [
    { key: 'L',  label: 'Logrado',              pts: 4, desc: 'Cumple con el 100% de lo solicitado.' },
    { key: 'ML', label: 'Medianamente logrado', pts: 3, desc: 'Cumple parcialmente con lo solicitado.' },
    { key: 'NL', label: 'No logrado',           pts: 2, desc: 'El requerimiento no supera el 60% solicitado.' },
    { key: 'I',  label: 'Insuficiente',         pts: 1, desc: 'No demuestra dominio de la competencia solicitada.' },
    { key: 'NO', label: 'No observado',         pts: 0, desc: 'El indicador no ha sido posible de observar.' },
  ];
  // Autoevaluación: S/CS/O/CN/N
  const NIVELES_AUTO = [
    { key: 'S',  label: 'Siempre',        pts: 4 },
    { key: 'CS', label: 'Casi siempre',   pts: 3 },
    { key: 'O',  label: 'Ocasionalmente', pts: 2 },
    { key: 'CN', label: 'Casi nunca',     pts: 1 },
    { key: 'N',  label: 'Nunca',          pts: 0 },
  ];

  // ───────────────────────────────────────────────────────────
  // Escalas de conversión (puntaje → nota, exigencia 60%)
  // ───────────────────────────────────────────────────────────
  const ESCALA_INFORME = EF([1,1.1,1.2,1.3,1.4,1.6,1.7,1.8,1.9,2,2.1,2.2,2.3,2.4,2.6,2.7,2.8,2.9,3,3.1,3.2,3.3,3.4,3.6,3.7,3.8,3.9,4,4.2,4.3,4.5,4.7,4.8,5,5.2,5.3,5.5,5.7,5.8,6,6.2,6.3,6.5,6.7,6.8,7]); // 0..45
  const ESCALA_MANUAL = EF([1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,3,3.1,3.2,3.3,3.4,3.5,3.5,3.6,3.7,3.8,3.9,4.1,4.2,4.4,4.5,4.6,4.8,4.9,5.1,5.2,5.4,5.5,5.7,5.8,6,6.1,6.3,6.4,6.6,6.7,6.9,7]); // 0..51
  const ESCALA_PRESENT = EF([1,1.1,1.3,1.4,1.5,1.6,1.8,1.9,2,2.2,2.3,2.4,2.5,2.7,2.8,2.9,3.1,3.2,3.3,3.4,3.6,3.7,3.8,3.9,4.1,4.3,4.5,4.7,4.9,5.1,5.3,5.5,5.7,5.8,6,6.2,6.4,6.6,6.8,7]); // 0..39
  // Escala lineal 60% de exigencia (misma fórmula que reproduce las tablas oficiales EF anteriores).
  function linScale(ideal) {
    const o = {}; const corte = 0.6 * ideal;
    for (let p = 0; p <= ideal; p++) {
      const nota = p <= corte ? 1 + (p / corte) * 3 : 4 + ((p - corte) / (ideal - corte)) * 3;
      o[p] = Math.round(nota * 10) / 10;
    }
    return o;
  }
  const ESCALA_PORT = linScale(42); // 14 criterios (5 construcción/carga + 9 bitácora) × 3 pts
  const ESCALA_AUTOEVAL = EF([1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.1,2.3,2.4,2.5,2.6,2.7,2.8,2.9,3,3.1,3.2,3.3,3.4,3.5,3.6,3.7,3.8,3.9,4,4.2,4.3,4.5,4.7,4.8,5,5.1,5.3,5.4,5.6,5.8,5.9,6.1,6.2,6.4,6.5,6.7,6.8,7]); // 0..48
  const ESCALA_TERRENO_PART = EF([1,1.2,1.3,1.5,1.6,1.8,1.9,2.1,2.3,2.4,2.6,2.7,2.9,3,3.2,3.3,3.5,3.7,3.8,4,4.2,4.4,4.7,4.9,5.1,5.4,5.6,5.8,6.1,6.3,6.5,6.8,7]); // 0..32
  const ESCALA_TERRENO_OBS = EF([1,1.2,1.4,1.6,1.8,2,2.3,2.5,2.7,2.9,3.1,3.3,3.5,3.7,3.9,4.2,4.5,4.8,5.1,5.4,5.8,6.1,6.4,6.7,7]); // 0..24
  const ESCALA_PROCESO = EF([1,1.1,1.3,1.4,1.5,1.6,1.8,1.9,2,2.1,2.3,2.4,2.5,2.6,2.8,2.9,3,3.1,3.3,3.4,3.5,3.6,3.8,3.9,4,4.2,4.4,4.6,4.8,4.9,5.1,5.3,5.5,5.7,5.9,6.1,6.3,6.4,6.6,6.8,7]); // 0..40

  const RA = 'Intervenir en escuelas y/o talleres deportivos, diseñando una propuesta innovadora de manual técnico para el desarrollo de habilidades motrices, a partir de un diagnóstico general del centro de práctica, adaptándose a diversos contextos con un claro sentido de responsabilidad ética.';

  // ───────────────────────────────────────────────────────────
  // Evaluaciones documentales (Entregas + Portafolio)
  // ───────────────────────────────────────────────────────────
  const cr = (id, texto, doble) => ({ id, texto, doble: !!doble });

  const INFORME = {
    id: 'INF', grupo: 'entrega', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_INFORME',
    titulo: 'Informe: Diagnóstico y Desarrollo de Habilidades Motrices', tipo: 'Informe (Word)', duracion: 'Máx. 7 pp.',
    fecha: '2025-10-01', semanaEntrega: 1, estado: 'corregida', maxPuntos: 45, ponderacion: 0.15,
    descripcion: 'Informe que revela información general del centro de práctica e indaga en el desarrollo de habilidades motrices.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Diagnosticar el centro de práctica: estructura organizacional, deporte y beneficiarios.',
      'Reconocer las habilidades motrices presentes en el deporte y su desarrollo.',
      'Fundamentar con bibliografía la progresión de enseñanza de una habilidad motriz.',
    ],
    instrucciones: [
      'Cargar en DRIVE/MOODLE en formato Word con opción de edición.',
      'Datos del centro: nombre, dirección-comuna, profesor tutor, modalidad/género, edad de participantes, días y horarios.',
      'Estructura organizacional: descripción, objetivo, misión/visión y organigrama (ubicándose en él).',
      'Descripción del deporte: definición, pruebas, duración, mejores exponentes (incl. paralímpico si corresponde).',
      'Habilidades motrices: básicas y específicas, coherencia con bibliografía, ejemplos y progresión de enseñanza.',
    ],
    aspectosFormales: [
      'Portada con logo USACH, Facultad/Escuela/Carrera y datos del centro y estudiante.',
      'Hoja carta, letra Arial o Calibri 10, espaciado 1.5, texto justificado; títulos en negrita 12.',
      'Tablas/gráficos auto explicativos y enumerados; bibliografía en orden alfabético o numérico.',
      'No sobrepasar las 7 hojas totales. Atraso: descuento de 0,5 por día.',
    ],
    criterios: [
      cr('c11', 'Entrega el informe en la fecha indicada.'),
      cr('c12', 'Cumple con todos los requisitos del informe descritos en la consigna.'),
      cr('c13', 'Desarrolla todas las partes del informe solicitadas en la consigna.'),
      cr('c14', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
      cr('c15', 'Utiliza lenguaje técnico acorde al informe de práctica.'),
      cr('c16', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      cr('c21', 'Entrega antecedentes concretos de la institución donde realiza la práctica.'),
      cr('c22', 'Presenta el organigrama completo del centro de manera gráfica y se ubica correctamente en él.'),
      cr('c31', 'Describe de manera clara y breve el deporte (duración, pruebas) con imágenes ilustrativas.'),
      cr('c32', 'Investiga deportistas chilenos convencionales y paralímpicos, identificando a los/las mejores a nivel nacional e internacional.'),
      cr('c41', 'Reconoce las habilidades motrices básicas y específicas del deporte y las describe brevemente.'),
      cr('c42', 'Reconoce las habilidades motrices a trabajar según el grupo etáreo e incorpora referencias bibliográficas.'),
      cr('c43', 'Explica la coherencia entre las habilidades trabajadas en el centro y la bibliografía (o su ausencia).'),
      cr('c44', 'Desarrolla al menos 2 ejemplos de actividades de habilidades motrices realizadas en el centro.'),
      cr('c45', 'Explica de manera clara y lógica la progresión de la enseñanza de la habilidad motriz desarrollada.'),
    ],
  };

  const MANUAL = {
    id: 'MAN', grupo: 'entrega', numero: 2, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_MANUAL',
    titulo: 'Manual Técnico de Psicomotricidad en el Deporte', tipo: 'Manual técnico (PDF)', duracion: 'Digital didáctico',
    fecha: '2025-11-05', semanaEntrega: 6, estado: 'en-evaluacion', maxPuntos: 51, ponderacion: 0.20,
    descripcion: 'Manual técnico digital y didáctico sobre el desarrollo de habilidades motrices del deporte del centro de práctica.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Analizar el deporte: historia, ejecución, exponentes y capacidades físicas.',
      'Describir las habilidades motrices básicas y específicas del deporte.',
      'Diseñar 12 fichas de actividades o juegos para desarrollar habilidades motrices.',
    ],
    instrucciones: [
      'Datos del centro: nombre, dirección-comuna, profesor tutor, modalidad/género, edad, días y horarios.',
      'Introducción (máx. 300 caracteres) y análisis del deporte (historia, ejecución, exponentes).',
      'Capacidades físicas predominantes y habilidades motrices del deporte.',
      'Elaborar 12 fichas: 5 con dos habilidades, 4 con tres habilidades y 3 con cuatro habilidades.',
      'Cada ficha: nombre, objetivo, n° de personas, cualidad física, duración, materiales, organización, desarrollo, reglas, variantes y diagrama.',
    ],
    aspectosFormales: [
      'Portada con logo USACH y datos del centro y estudiante; título "MANUAL TÉCNICO DE PSICOMOTRICIDAD EN (DEPORTE)".',
      'Formato final en PDF, lo más didáctico posible.',
      'Letra Arial o Calibri 10–12, texto justificado; títulos y subtítulos en negrita.',
      'Bibliografía en orden alfabético o numérico. Atraso: descuento de 0,5 por día.',
    ],
    criterios: [
      cr('c11', 'Entrega el manual técnico en la fecha indicada.'),
      cr('c12', 'Cumple con todos los requisitos del manual técnico descritos en la consigna.'),
      cr('c13', 'Desarrolla todas las partes del manual técnico solicitadas en la consigna.'),
      cr('c14', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
      cr('c15', 'Utiliza lenguaje técnico acorde al nivel de las asignaturas cursadas en la carrera.'),
      cr('c16', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      cr('c21', 'Sintetiza la historia del deporte e integra el año de ingreso a Juegos Olímpicos (damas y varones) cuando corresponda.'),
      cr('c22', 'Describe brevemente el deporte (objetivo, superficie, indumentaria) incorporando imágenes alusivas.'),
      cr('c23', 'Identifica los mejores exponentes nacionales e internacionales, damas y varones, del deporte.'),
      cr('c31', 'Identifica las capacidades físicas predominantes del deporte.'),
      cr('c41', 'Describe brevemente las habilidades motrices básicas y específicas en el deporte.'),
      cr('c42', 'Elabora 12 fichas de actividades incorporando todos los puntos indicados en la consigna.'),
      cr('c43', 'Desarrolla las 12 fichas: cinco con dos habilidades, cuatro con tres y tres con cuatro habilidades.'),
      cr('c44', 'Elabora al menos 3 de las actividades o juegos con una variante.'),
      cr('c45', 'Desarrolla en cada ficha un diagrama explicativo o imágenes de la actividad o juego.'),
      cr('c46', 'Incorpora creatividad en las fichas, dejando un documento didáctico y fácil de comprender.', true),
    ],
  };

  const PRESENT = {
    id: 'PRE', grupo: 'entrega', numero: 3, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PRESENT',
    titulo: 'Presentación Final', tipo: 'Presentación (15 min)', duracion: '15 min + 5 preguntas',
    fecha: '2025-11-28', semanaEntrega: 9, estado: 'pendiente', maxPuntos: 39, ponderacion: 0.15,
    descripcion: 'Presentación que explica la experiencia personal de la intervención y la reflexión sobre la integración teoría-práctica.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Comunicar la experiencia personal de la intervención en el centro de práctica.',
      'Reflexionar sobre la integración de asignaturas teóricas a la práctica.',
      'Proponer mejoras y sugerencias a partir de la experiencia.',
    ],
    instrucciones: [
      'Formato PPT, Canva, Prezi u otro; cargar en el portafolio DRIVE/MOODLE.',
      'Tiempo de 15 minutos con 5 minutos de preguntas; vestimenta institucional deportiva.',
      'Datos del centro y experiencia personal: funciones, valores, relación con tutor y deportistas.',
      'Reflexión sobre el manual técnico, anécdotas, aprendizajes profesionales y propuestas de mejora.',
    ],
    aspectosFormales: [
      'Presentación clara y sintética con lenguaje técnico y formal.',
      'Vestimenta: polera/polerón de la Universidad con buzo o calza deportiva.',
      'Atraso: descuento de 0,5 por día.',
    ],
    criterios: [
      cr('c11', 'Entrega la presentación en la fecha indicada.'),
      cr('c12', 'Cumple con todos los requisitos de la presentación descritos en la consigna.'),
      cr('c13', 'Desarrolla todas las partes de la presentación solicitadas en la consigna.'),
      cr('c14', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
      cr('c15', 'Utiliza lenguaje técnico y formal en su presentación.'),
      cr('c21', 'Explica las funciones realizadas en el centro de práctica de manera breve.'),
      cr('c22', 'Explica y reflexiona con detalle su experiencia en la construcción del manual técnico.', true),
      cr('c23', 'Indica los elementos profesionales que aprendió en el centro de práctica.'),
      cr('c24', 'Explica e identifica las asignaturas ya cursadas que pudo integrar en la práctica.'),
      cr('c25', 'Su reflexión del centro de práctica es clara y coherente.', true),
      cr('c26', 'Otorga propuestas de mejora y/o sugerencias claras en relación a la asignatura.'),
    ],
  };

  const bitacora = (p) => ([
    cr(p + '1', 'Mantiene la bitácora actualizada.'),
    cr(p + '2', 'Anota el día, hora de inicio y término de la sesión.'),
    cr(p + '3', 'Identifica los objetivos metodológicos de cada sesión.'),
    cr(p + '4', 'Describe las actividades de cada sesión en orden lógico (inicio, desarrollo, final).'),
    cr(p + '5', 'Se identifican las actividades realizadas por el/la estudiante.'),
    cr(p + '6', 'Utiliza lenguaje técnico para describir el objetivo y la sesión de entrenamiento.'),
    cr(p + '7', 'Utiliza un lenguaje inclusivo y de equidad de género en su redacción.'),
    cr(p + '8', 'Mantiene una redacción gramatical coherente y sin faltas de ortografía.'),
    cr(p + '9', 'Realiza observaciones de carácter técnico con actitud de indagación, usando conocimiento de asignaturas teóricas.'),
  ]);

  const PORT = {
    id: 'PORT', grupo: 'portafolio', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT',
    titulo: 'Portafolio y Bitácora', tipo: 'Portafolio (Drive)', duracion: 'Semestral',
    fecha: '2025-11-28', semanaEntrega: 9, estado: 'pendiente', maxPuntos: 42, ponderacion: 0.10,
    descripcion: 'Evaluación única del portafolio: construcción y carga de documentos en DRIVE, y una sección dedicada al registro de la bitácora durante todo el semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Construir el portafolio en DRIVE con las carpetas indicadas y compartirlo con el/la supervisor/a.',
      'Cargar la totalidad de los documentos del portafolio en las fechas estipuladas.',
      'Registrar diariamente las sesiones en la bitácora.',
    ],
    instrucciones: [
      'Carpeta "PRÁCTICA II - NOMBRE APELLIDO" compartida al supervisor/a con opción de edición.',
      'Incluir todas las carpetas: Informe, Manual Técnico, Presentación, Bitácora, Evaluaciones y Anexos.',
      'Cargar el informe "Diagnóstico del centro de práctica" y el resto de los documentos en las fechas estipuladas.',
      'Mantener la bitácora de registro diario actualizada durante todo el semestre.',
    ],
    aspectosFormales: ['Carpeta DRIVE editable, nombre correcto.', 'Bitácora en archivo Excel proporcionado por los docentes.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 42: 1) Construcción y carga del portafolio (5 criterios) · 2) Bitácora (9 criterios).'],
    criterios: [
      // 1. Construcción y carga del portafolio
      cr('c11', 'Construye el portafolio en la fecha indicada, con el nombre correcto descrito en la consigna.'),
      cr('c12', 'Comparte el portafolio al/la profesor/a supervisor/a en formato editar.'),
      cr('c13', 'Incluye todas las carpetas descritas en la tabla de la consigna de portafolio.'),
      cr('c14', 'Carga el informe "Diagnóstico del centro de práctica" en formato Word editable, en la fecha descrita.'),
      cr('c15', 'Tiene cargados todos los documentos descritos en la consigna y en las fechas estipuladas.'),
      // 2. Bitácora
      ...bitacora('b'),
    ],
  };

  const ENTREGAS = [INFORME, MANUAL, PRESENT];
  const PORTAFOLIOS = [PORT];
  const EVALUACIONES = [...ENTREGAS, ...PORTAFOLIOS];

  // ───────────────────────────────────────────────────────────
  // Supervisión en terreno (2 modos) + Evaluación de proceso
  // ───────────────────────────────────────────────────────────
  const TERRENO_FORMALES = [
    cr('f1', 'Asiste puntualmente a la sesión y cumple con el horario establecido.', true),
    cr('f2', 'Utiliza vestimenta deportiva acorde al contexto, identificándose con uniforme de la carrera o del centro de práctica.'),
    cr('f3', 'Presenta planificación clara, limpia y ordenada de la sesión; o realiza activamente las actividades planificadas por el tutor/a.'),
  ];
  const TERRENO_PARTICIPACION = [
    cr('p1', 'Demuestra las actividades y/o ejercicios correctamente, utilizando su cuerpo.'),
    cr('p2', 'Corrige constantemente las ejecuciones de sus dirigidos, aplicando claves de corrección y/o refuerzos positivos.'),
    cr('p3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    cr('p4', 'Utiliza un tono de voz adecuado que permite escuchar claramente las instrucciones y correcciones.'),
  ];
  const TERRENO_OBSERVACION = [
    cr('o1', 'Se encuentra observando la sesión, atento/a a las necesidades del entrenador/a tutor/a.'),
    cr('o2', 'Se demuestra proactivo/a preguntando durante la sesión si se necesita apoyo, ofreciendo asistencia.'),
  ];
  const MODOS_TERRENO = {
    part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', maxPuntos: 32, escala: ESCALA_TERRENO_PART, grupos: TERRENO_PARTICIPACION },
    obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', maxPuntos: 24, escala: ESCALA_TERRENO_OBS,  grupos: TERRENO_OBSERVACION },
  };
  function terrenoCriterios(modo) { return [...TERRENO_FORMALES, ...MODOS_TERRENO[modo].grupos]; }
  function notaTerrenoVisita(v) {
    if (!v || !v.resp) return { nota: null, parcial: true, puntos: null };
    const crit = terrenoCriterios(v.modo);
    let total = 0, answered = 0;
    crit.forEach(c => { const k = v.resp[c.id]; if (!k) return; const ni = NIVELES_APREC.find(n => n.key === k); if (!ni) return; total += ni.pts * (c.doble ? 2 : 1); answered++; });
    const parcial = answered < crit.length;
    const nota = parcial ? null : window.USACH_CALC.notaFromEscala(MODOS_TERRENO[v.modo].escala, total);
    return { nota, parcial, puntos: total };
  }

  const PROCESO_DIMENSIONES = [
    { id: 'pf', label: '1. Criterios formales', indicadores: [
      { id: 'pf1', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su profesor/a supervisor/a.' },
      { id: 'pf2', texto: 'Asiste a todas las reuniones de prácticas coordinadas (presenciales o virtuales) y participa activamente generando feedback.' },
      { id: 'pf3', texto: 'Mantiene actualizada y al día su bitácora virtual integrando las sesiones de entrenamiento realizadas.' },
      { id: 'pf4', texto: 'Entrega las consignas (informes, manual técnico, entre otras) en el plazo indicado por su supervisor/a.' },
    ]},
    { id: 'pp', label: '2. Criterios profesionales', indicadores: [
      { id: 'pp1', texto: 'Demuestra las actividades y/o ejercicios correctamente, utilizando su cuerpo.' },
      { id: 'pp2', texto: 'Corrige constantemente las ejecuciones de sus dirigidos, aplicando claves de corrección y/o refuerzos positivos.' },
      { id: 'pp3', texto: 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.' },
      { id: 'pp4', texto: 'Utiliza un tono de voz adecuado (voces de mando, instrucciones y correcciones).' },
      { id: 'pp5', texto: 'Se adapta a situaciones imprevistas y resuelve dificultades durante la sesión.' },
      { id: 'pp6', texto: 'Demuestra una progresión positiva en sus intervenciones, considerando las observaciones de su supervisor/a.' },
    ]},
  ];
  function notaProceso(resp) {
    const r = window.USACH_CALC.calcInstrumento(resp, PROCESO_DIMENSIONES, NIVELES_APREC, ESCALA_PROCESO);
    return r && !r.parcial ? r.nota : null;
  }
  // Nota supervisor (15%) = promedio de visitas en terreno + evaluación de proceso
  function notaSupervisorP2(estId, state) {
    const visitas = (state.terreno && state.terreno[estId]) || [];
    const notas = [];
    let algoFalta = false;
    visitas.forEach(v => { const r = notaTerrenoVisita(v); if (r.nota != null) notas.push(r.nota); else algoFalta = true; });
    const proc = notaProceso(state.proceso && state.proceso[estId]);
    if (proc != null) notas.push(proc); else algoFalta = true;
    if (notas.length === 0) return { nota: null, parcial: true };
    const nota = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10;
    return { nota, parcial: algoFalta || proc == null };
  }

  // Pauta de Evaluación del Entrenador/a Tutor/a (instrumento del centro · ideal 44)
  const TUTOR_DIMENSIONES = [
    { id: 't1', label: '1. Aspectos formales', indicadores: [
      { id: 't11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su entrenador/a o profesor/a tutor/a.' },
      { id: 't12', texto: 'Asiste puntualmente a todas las sesiones y actividades programadas, cumpliendo con el horario establecido.' },
      { id: 't13', texto: 'Respeta las normas y cumple con los protocolos establecidos en el centro de práctica.' },
    ]},
    { id: 't2', label: '2. Aspectos disciplinares', indicadores: [
      { id: 't21', texto: 'Participa activamente de los entrenamientos, realizando intervenciones, apoyando las sesiones y/o desarrollando las tareas solicitadas por el entrenador/a o profesor/a.' },
      { id: 't22', texto: 'Demuestra correctamente los ejercicios, utilizando su lenguaje corporal y demostrando en diferentes planos.' },
      { id: 't23', texto: 'Se preocupa de corregir las ejecuciones de sus dirigidos aplicando claves de corrección.' },
      { id: 't24', texto: 'Demuestra preparación de los contenidos que le corresponde desarrollar en su práctica.' },
      { id: 't25', texto: 'Entrega instrucciones con un lenguaje claro y adecuado a las características de los y las deportistas o personas a cargo.' },
    ]},
    { id: 't3', label: '3. Aspectos actitudinales', indicadores: [
      { id: 't31', texto: 'Responde a las tareas y/o actividades solicitadas en los tiempos acordados.' },
      { id: 't32', texto: 'Manifiesta interés, iniciativa y motivación por aprender y adquirir nuevos conocimientos.' },
      { id: 't33', texto: 'Acepta la crítica y las sugerencias de manera positiva, considerándolas para la mejora de su desempeño.' },
    ]},
  ];

  const AUTOEVAL_DIMENSIONES = [
    { id: 'a1', label: '1. Responsabilidad', indicadores: [
      { id: 'a11', texto: 'Asiste puntualmente a todas las sesiones programadas por su profesor(a) tutor o supervisor(a) (reuniones, clases online, seminarios, etc.).' },
      { id: 'a12', texto: 'Cumple en la fecha acordada con los compromisos adquiridos y responsabilidades asignadas.' },
    ]},
    { id: 'a2', label: '2. Solución de problemas', indicadores: [
      { id: 'a21', texto: 'Se comunica oportunamente con el/la profesor(a) tutor y/o supervisor(a) para informar de cualquier imprevisto o problema.' },
      { id: 'a22', texto: 'Identifica sus debilidades y es capaz de solicitar ayuda para superar dificultades.' },
    ]},
    { id: 'a3', label: '3. Participación activa', indicadores: [
      { id: 'a31', texto: 'Participa activamente del proceso demostrando interés por adquirir nuevos conocimientos y mejorar su desempeño.' },
      { id: 'a32', texto: 'Demuestra proactividad tomando la iniciativa y colaborando con el equipo de trabajo en tareas de su área.' },
    ]},
    { id: 'a4', label: '4. Desarrollo disciplinar', indicadores: [
      { id: 'a41', texto: 'Demuestra sus conocimientos y los relaciona con la experiencia práctica para responder a los desafíos del tutor.' },
      { id: 'a42', texto: 'Prepara sus intervenciones con antelación evitando improvisar.' },
    ]},
    { id: 'a5', label: '5. Comunicación', indicadores: [
      { id: 'a51', texto: 'Comunica sus ideas con un lenguaje verbal y no verbal adecuado para relacionarse en el contexto profesional.' },
      { id: 'a52', texto: 'Procura entregar indicaciones utilizando un lenguaje técnico apropiado a las características de sus dirigidos.' },
    ]},
    { id: 'a6', label: '6. Aspectos actitudinales', indicadores: [
      { id: 'a61', texto: 'Demuestra una conducta respetuosa con las normas de la institución, el equipo de trabajo y deportistas a su cargo.' },
      { id: 'a62', texto: 'Acepta la crítica de manera respetuosa como oportunidad de desarrollo y aplica las orientaciones recibidas.' },
    ]},
  ];

  // ───────────────────────────────────────────────────────────
  // Estudiantes (con datos de centro de práctica)
  // ───────────────────────────────────────────────────────────
  const ESTUDIANTES = [
    { id: 'e1', rut: '21.345.678-9', nombre: 'Antonia Pérez Vega',     email: 'antonia.perez@usach.cl',  telefono: '+56 9 8245 1192',
      centro: 'Club Deportivo Estación Central', comuna: 'Estación Central', deporte: 'Vóleibol', categoria: 'Sub-14', tutorCentro: 'Marcela Ríos', dias: 'Lun y Mié · 17:00–19:00' },
    { id: 'e2', rut: '20.987.654-3', nombre: 'Benjamín Soto Carrasco', email: 'benjamin.soto@usach.cl',   telefono: '+56 9 6712 8403',
      centro: 'Escuela de Fútbol Maipú', comuna: 'Maipú', deporte: 'Fútbol', categoria: 'Sub-12', tutorCentro: 'Jorge Henríquez', dias: 'Mar y Jue · 18:00–20:00' },
    { id: 'e3', rut: '21.112.443-K', nombre: 'Camila Riquelme Núñez',  email: 'camila.riquelme@usach.cl', telefono: '+56 9 9018 5526',
      centro: 'Corporación Municipal de Quinta Normal', comuna: 'Quinta Normal', deporte: 'Atletismo', categoria: 'Sub-16', tutorCentro: 'Paula Vega', dias: 'Lun, Mié y Vie · 16:00–18:00' },
    { id: 'e4', rut: '22.456.789-1', nombre: 'Diego Fuentes Aguilera', email: 'diego.fuentes@usach.cl',   telefono: '+56 9 3344 7710',
      centro: 'Club de Básquetbol Santiago', comuna: 'Santiago Centro', deporte: 'Básquetbol', categoria: 'Sub-15', tutorCentro: 'Iván Morales', dias: 'Mar y Vie · 19:00–21:00' },
    { id: 'e5', rut: '21.890.123-7', nombre: 'Francisca Mella Jara',   email: 'francisca.mella@usach.cl', telefono: '+56 9 5567 9821',
      centro: 'Escuela de Natación USACH', comuna: 'Estación Central', deporte: 'Natación', categoria: 'Sub-13', tutorCentro: 'Andrea Soto', dias: 'Lun a Jue · 08:00–10:00' },
  ];
  const PROFESORES = [
    { id: 'p1', nombre: 'Prof. Andrés Tapia Vergara', email: 'andres.tapia@usach.cl', rol: 'Profesor Supervisor', activo: true },
    { id: 'p2', nombre: 'Prof. María Inés Cáceres',   email: 'maria.caceres@usach.cl', rol: 'Profesora Supervisora', activo: true },
  ];
  const ANEXOS_ADMIN = [
    { id: 'a1', titulo: 'Calendario Académico Práctica II', desc: 'Fechas de entregas, revisiones de portafolio y presentación final.', tipo: 'PDF', tamano: '0.4 MB' },
    { id: 'a2', titulo: 'Formato de Bitácora (Excel)', desc: 'Planilla de registro diario de sesiones del centro de práctica.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a3', titulo: 'Consentimiento Informado del Centro', desc: 'Autorización del centro deportivo para la práctica.', tipo: 'PDF', tamano: '0.2 MB' },
    { id: 'a4', titulo: 'Declaración Individual de Accidentes Personales', desc: 'Documento obligatorio para actividades en terreno.', tipo: 'PDF', tamano: '0.3 MB' },
    { id: 'a5', titulo: 'Pauta de Evaluación del Profesor/a Tutor/a', desc: 'Instrumento que completa el entrenador/a tutor/a del centro.', tipo: 'PDF', tamano: '0.5 MB' },
  ];

  const PONDERACIONES = [
    { id: 'q1', label: 'Informe de diagnóstico',          componentes: ['INF'], peso: 0.15 },
    { id: 'q2', label: 'Manual técnico',                  componentes: ['MAN'], peso: 0.20 },
    { id: 'q3', label: 'Presentación final',              componentes: ['PRE'], peso: 0.15 },
    { id: 'q4', label: 'Portafolio (Construcción + Bitácora)', componentes: ['PORT'], peso: 0.10 },
    { id: 'q5', label: 'Eval. Profesor/a Tutor/a (centro)', resolver: 'TUTOR', peso: 0.20 },
    { id: 'q6', label: 'Supervisión (terreno + proceso)', resolver: 'SUP', peso: 0.15 },
    { id: 'q7', label: 'Autoevaluación',                  resolver: 'AUTO', peso: 0.05 },
  ];

  // ───────────────────────────────────────────────────────────
  // Generación de datos demo
  // ───────────────────────────────────────────────────────────
  function R2(seed) {
    return (key) => {
      const x = (Math.sin(seed * 7193 + key.charCodeAt(0) * 36017 + (key.charCodeAt(1) || 7) * 911) + 1) / 2;
      if (x < 0.52) return 0; if (x < 0.82) return 1; if (x < 0.97) return 2; return 3;
    };
  }
  const FECHAS_VISITA = ['2025-09-18', '2025-10-09', '2025-10-30', '2025-11-13'];

  function genNiveles() {
    const niveles = {}, atrasos = {};
    EVALUACIONES.forEach((ev, idxEv) => {
      if (ev.estado === 'pendiente') return;
      niveles[ev.id] = {}; atrasos[ev.id] = {};
      ESTUDIANTES.forEach((est, idxEst) => {
        const enEval = ev.estado === 'en-evaluacion';
        if (enEval && idxEst >= 3) return;
        niveles[ev.id][est.id] = {};
        const rng = R2((idxEv + 2) * 13 + (idxEst + 1) * 29);
        ev.criterios.forEach((c, idxCr) => {
          if (enEval && idxCr >= Math.ceil(ev.criterios.length / 2)) return;
          niveles[ev.id][est.id][c.id] = NIVELES_EBSD[Math.min(rng(c.id), 3)].key;
        });
        atrasos[ev.id][est.id] = (idxEst === 1 && ev.id === 'MAN') ? 1 : (idxEst === 3 && ev.id === 'INF') ? 1 : 0;
      });
    });
    return { niveles, atrasos };
  }

  function genTerreno() {
    const terreno = {};
    ESTUDIANTES.forEach((est, idxEst) => {
      terreno[est.id] = [];
      const nVisitas = idxEst < 3 ? 3 : (idxEst === 3 ? 1 : 0);
      for (let i = 0; i < nVisitas; i++) {
        const modo = (i % 2 === 0) ? 'part' : 'obs';
        const completa = !(idxEst === 3); // la única visita del 4° queda parcial
        const rng = R2((idxEst + 1) * 53 + (i + 1) * 17);
        const resp = {};
        terrenoCriterios(modo).forEach((c, ci) => {
          if (!completa && ci >= 2) return;
          resp[c.id] = NIVELES_APREC[Math.min(rng(c.id), 1)].key; // sesgo a L/ML
        });
        terreno[est.id].push({ id: `v${idxEst}_${i}`, fecha: FECHAS_VISITA[i], modo, resp });
      }
    });
    return terreno;
  }

  function genProceso() {
    const proceso = {};
    ESTUDIANTES.forEach((est, idxEst) => {
      proceso[est.id] = {};
      if (idxEst >= 3) return;
      const rng = R2((idxEst + 1) * 71 + 5);
      PROCESO_DIMENSIONES.forEach(dim => dim.indicadores.forEach(ind => { proceso[est.id][ind.id] = NIVELES_APREC[Math.min(rng(ind.id), 1)].key; }));
    });
    return proceso;
  }

  function genAutoeval() {
    const autoeval = {};
    ESTUDIANTES.forEach((est, idxEst) => {
      autoeval[est.id] = {};
      if (idxEst >= 3) return;
      const rng = R2((idxEst + 1) * 89 + 11);
      AUTOEVAL_DIMENSIONES.forEach(dim => dim.indicadores.forEach(ind => { autoeval[est.id][ind.id] = NIVELES_AUTO[Math.min(rng(ind.id), 2)].key; }));
    });
    return autoeval;
  }

  function buildPracticaII() {
    const { niveles, atrasos } = genNiveles();
    const terreno = genTerreno();
    const proceso = genProceso();
    const autoeval = genAutoeval();
    const tutor = { e1: { nota: 6.2 }, e2: { nota: 5.4 }, e3: { nota: 6.6 } };

    return {
      meta: {
        codigo: 'II',
        nombre: 'Escuelas y Talleres Deportivos',
        cursoTitulo: 'Práctica II — Escuelas y Talleres Deportivos',
        breadcrumb: 'Práctica II',
        semestre: 'Semestre 2025-2',
        escuela: 'Escuela de Cs. de la Actividad Física, Deporte y Salud · Entrenador Deportivo',
        terreno: true,
      },
      NIVELES: { NIVELES_EBSD, NIVELES_APREC, NIVELES_AUTO, NIVELES_SUPERVISOR: NIVELES_AUTO },
      ESCALAS: {
        ESCALA_INFORME, ESCALA_MANUAL, ESCALA_PRESENT, ESCALA_PORT,
        ESCALA_AUTOEVAL, ESCALA_TERRENO_PART, ESCALA_TERRENO_OBS, ESCALA_PROCESO,
      },
      GRUPOS: [
        { id: 'entrega', label: 'Entregas', singular: 'Entrega', sigla: 'E', color: 'teal',
          desc: 'Informe, Manual Técnico y Presentación Final · rúbrica E/B/S/D · exigencia 60%' },
        { id: 'portafolio', label: 'Portafolio', singular: 'Portafolio', sigla: 'P', color: 'orange',
          desc: 'Evaluación única del portafolio y la bitácora durante el semestre · pondera 10%' },
      ],
      ENTREGAS, PORTAFOLIOS,
      EVALUACIONES,
      PONDERACIONES,
      // Instrumentos de proceso
      SUPERVISOR: { kind: 'terreno-proceso', modos: MODOS_TERRENO, formales: TERRENO_FORMALES,
                    terrenoCriterios, notaTerrenoVisita, procesoDimensiones: PROCESO_DIMENSIONES, notaProceso,
                    nivelesKey: 'NIVELES_APREC', escalaProcesoKey: 'ESCALA_PROCESO' },
      AUTOEVAL: { dimensiones: AUTOEVAL_DIMENSIONES, nivelesKey: 'NIVELES_AUTO', escalaKey: 'ESCALA_AUTOEVAL', maxPuntos: 48 },
      TUTOR: { dimensiones: TUTOR_DIMENSIONES, nivelesKey: 'NIVELES_AUTO', maxPuntos: 44 },
      ANEXOS_ADMIN,
      ESTUDIANTES, PROFESORES,
      NOTAS_COLUMNS: [
        { key: 'INF', label: 'Informe', sub: '15%', kind: 'eval', evalId: 'INF', color: 'teal' },
        { key: 'MAN', label: 'Manual',  sub: '20%', kind: 'eval', evalId: 'MAN', color: 'teal' },
        { key: 'PRE', label: 'Present.',sub: '15%', kind: 'eval', evalId: 'PRE', color: 'teal' },
        { key: 'PORT', label: 'Portaf.',sub: '10%', kind: 'portafolio' },
        { key: 'TUTOR', label: 'Tutor', sub: '20%', kind: 'tutor' },
        { key: 'SUP', label: 'Superv.', sub: '15%', kind: 'sup' },
        { key: 'AUTO', label: 'Autoev.',sub: '5%',  kind: 'auto' },
      ],
      RESOLVERS: {
        SUP: (estId, state) => notaSupervisorP2(estId, state),
        AUTO: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.autoeval[estId], AUTOEVAL_DIMENSIONES, NIVELES_AUTO, ESCALA_AUTOEVAL);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
        TUTOR: (estId, state) => {
          const t = state.tutor && state.tutor[estId];
          return (t && t.nota != null) ? { nota: t.nota, parcial: false } : { nota: null, parcial: true };
        },
      },
      // helpers expuestos para las pantallas P2
      terrenoCriterios, notaTerrenoVisita, notaProceso, notaSupervisorP2, MODOS_TERRENO,
      PROCESO_DIMENSIONES, AUTOEVAL_DIMENSIONES,
      initialState: (kind) => {
        if (kind === 'vacio') {
          return {
            evaluaciones: EVALUACIONES.map(e => ({ ...e, estado: 'pendiente' })),
            estudiantes: ESTUDIANTES.map(e => ({ ...e })),
            inicioPractica: null,
            niveles: {}, atrasos: {}, terreno: {}, proceso: {}, autoeval: {}, tutor: {},
            supervisor: {}, supervisorComments: {}, autoevalComments: {}, evalFeedback: {}, evalAnexos: {},
          };
        }
        return {
          evaluaciones: EVALUACIONES.map(e => ({ ...e })),
          estudiantes: ESTUDIANTES.map(e => ({ ...e })),
          inicioPractica: null,
          niveles: JSON.parse(JSON.stringify(niveles)),
          atrasos: JSON.parse(JSON.stringify(atrasos)),
          terreno: JSON.parse(JSON.stringify(terreno)),
          proceso: JSON.parse(JSON.stringify(proceso)),
          autoeval: JSON.parse(JSON.stringify(autoeval)),
          tutor: JSON.parse(JSON.stringify(tutor)),
          supervisor: {},
          supervisorComments: {
            e1: 'Antonia muestra excelente disposición en terreno y domina la conducción de la sesión. Mantiene la bitácora al día. Reforzar la fundamentación bibliográfica del informe de diagnóstico.',
            e2: 'Benjamín tiene buena llegada con los deportistas, pero presentó un atraso en el manual técnico. Debe mejorar la planificación previa de las sesiones.',
            e3: 'Camila destaca por su progresión positiva entre visitas y su capacidad para resolver imprevistos. Excelente relación con la entrenadora tutora.',
          },
          autoevalComments: {},
          evalAnexos: {
            INF: [{ id: 'inf-1', titulo: 'Consigna Informe — Práctica II', tipo: 'Pauta de la evaluación', tamano: '0.4 MB', subido: '15 sep 2025', por: 'Andrés Tapia' }],
            MAN: [{ id: 'man-1', titulo: 'Consigna Manual Técnico — Práctica II', tipo: 'Pauta de la evaluación', tamano: '0.4 MB', subido: '15 oct 2025', por: 'Andrés Tapia' },
                  { id: 'man-2', titulo: 'Plantilla de ficha de actividad', tipo: 'Material complementario', tamano: '0.2 MB', subido: '15 oct 2025', por: 'Andrés Tapia' }],
            PORT: [{ id: 'port-1', titulo: 'Formato de Bitácora (Excel)', tipo: 'Material complementario', tamano: '0.3 MB', subido: '10 sep 2025', por: 'Andrés Tapia' }],
          },
        };
      },
    };
  }

  window.registerPractica('II', buildPracticaII);
})();
