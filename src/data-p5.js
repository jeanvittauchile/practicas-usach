// data-p5.js — Práctica IV · "Intervención deportiva con tutor/a"
// Se registra como 'IV' en el registro de prácticas definido en data.js.
// El/la estudiante interviene activamente en un centro de práctica deportivo
// (club, federación, escuela o selección), elaborando un informe del deporte,
// una planificación de un mesociclo y una presentación final reflexiva.
// Documentos fuente: consignas oficiales Práctica IV 2025 (Fac. Cs. Médicas · Entrenador Deportivo).

(function () {
  // ───────────────────────────────────────────────────────────
  // Escala lineal con 60% de exigencia (1,0 → 0 pts · 4,0 → 60% · 7,0 → 100%).
  // Reproduce con fidelidad las tablas oficiales de cada consigna (verificado
  // contra los puntos de corte 4,0 y los extremos de las tablas impresas).
  // ───────────────────────────────────────────────────────────
  function linScale(ideal) {
    const o = {}; const corte = 0.6 * ideal;
    for (let p = 0; p <= ideal; p++) {
      const nota = p <= corte ? 1 + (p / corte) * 3 : 4 + ((p - corte) / (ideal - corte)) * 3;
      o[p] = Math.round(nota * 10) / 10;
    }
    return o;
  }

  // ───────────────────────────────────────────────────────────
  // Niveles de logro
  // ───────────────────────────────────────────────────────────
  // Informe / Planificación / Presentación / Portafolio (rúbrica E·B·S·D)
  const NIVELES_EBSD = [
    { key: 'E', label: 'Excelente',  pts: 3, desc: 'Demuestra dominio de todos los elementos descritos en el indicador.' },
    { key: 'B', label: 'Bueno',      pts: 2, desc: 'Demuestra dominio de la mayoría de los elementos descritos en el indicador.' },
    { key: 'S', label: 'Suficiente', pts: 1, desc: 'Cumple parcialmente con los elementos establecidos o solo con alguno de ellos.' },
    { key: 'D', label: 'Deficiente', pts: 0, desc: 'Se evidencia dificultad para alcanzar el logro descrito, o no es observado.' },
  ];
  // Supervisión en terreno (escala de apreciación L·ML·NL·I·NO)
  const NIVELES_APREC = [
    { key: 'L',  label: 'Logrado',              pts: 4, desc: 'Cumple con el 100% de lo solicitado.' },
    { key: 'ML', label: 'Medianamente logrado', pts: 3, desc: 'Cumple parcialmente con lo solicitado.' },
    { key: 'NL', label: 'No logrado',           pts: 2, desc: 'El requerimiento no supera el 60% solicitado.' },
    { key: 'I',  label: 'Insuficiente',         pts: 1, desc: 'No demuestra dominio de la competencia solicitada.' },
    { key: 'NO', label: 'No observado',         pts: 0, desc: 'El indicador no ha sido posible de observar.' },
  ];
  // Evaluación del tutor/a + Autoevaluación (escala de frecuencia S·CS·O·CN·N)
  const NIVELES_FREC = [
    { key: 'S',  label: 'Siempre',        pts: 4 },
    { key: 'CS', label: 'Casi siempre',   pts: 3 },
    { key: 'O',  label: 'Ocasionalmente', pts: 2 },
    { key: 'CN', label: 'Casi nunca',     pts: 1 },
    { key: 'N',  label: 'Nunca',          pts: 0 },
  ];

  // ───────────────────────────────────────────────────────────
  // Escalas (puntaje → nota) · exigencia 60%
  // ───────────────────────────────────────────────────────────
  const ESCALA_INF_IND  = linScale(66);  // Informe · deporte individual
  const ESCALA_INF_COL  = linScale(63);  // Informe · deporte colectivo
  const ESCALA_PLANIF   = linScale(51);  // Planificación de entrenamiento
  const ESCALA_PRESENT  = linScale(48);  // Presentación final
  const ESCALA_TUTOR    = linScale(56);  // Evaluación entrenador/a tutor/a
  const ESCALA_AUTO     = linScale(64);  // Autoevaluación
  const ESCALA_PORT1    = linScale(36);  // Portafolio · Ev. N°1
  const ESCALA_PORT2    = linScale(27);  // Portafolio · Ev. N°2
  const ESCALA_PORT3    = linScale(30);  // Portafolio · Ev. N°3
  const ESCALA_TERR_PART = linScale(48); // Terreno · con participación
  const ESCALA_TERR_OBS  = linScale(24); // Terreno · con observación

  const RA = 'Intervenir activamente en el centro de práctica desarrollando una planificación de entrenamiento que se adapte al contexto deportivo, demostrando una actitud de compromiso con la institución y la mejora de su desempeño.';

  const crit = (id, texto, doble) => ({ id, texto, doble: !!doble });

  // ═══════════════════════════════════════════════════════════
  // 1 · INFORME — "Estructura organizacional y descripción del deporte" (20%)
  //     Rúbrica E·B·S·D · doble variante por tipo de deporte:
  //     · Deporte individual → 20 indicadores · ideal 66 pts
  //     · Deporte colectivo  → 19 indicadores · ideal 63 pts
  //     Las dimensiones 1, 2 y 4 son comunes; sólo cambia la dim. 3.
  // ═══════════════════════════════════════════════════════════
  const INF_S12 = [ // Dim 1 Formalidades + Dim 2 Estructura organizacional
    crit('c11', 'Entrega el informe en la fecha indicada.'),
    crit('c12', 'Cumple con todos los requisitos del informe descritos en la consigna.'),
    crit('c13', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
    crit('c14', 'Utiliza lenguaje técnico acorde al informe de práctica.'),
    crit('c15', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
    crit('c21', 'Entrega antecedentes concretos de la institución donde realiza la práctica.'),
    crit('c22', 'Presenta el organigrama completo del centro de práctica de manera gráfica y se ubica correctamente dentro de él.'),
    crit('c23', 'Formula un análisis FODA concreto del lugar de práctica, con un mínimo de 2 características por cada ítem.'),
  ];
  const INF_S4 = [ // Dim 4 Planificación del entrenamiento y control
    crit('c41', 'Detecta cómo se estructura una sesión de entrenamiento.'),
    crit('c42', 'Define el modelo de entrenamiento utilizado y los objetivos generales y específicos por periodo, con lenguaje técnico.', true),
    crit('c43', 'Identifica y describe las variaciones semanales: capacidades físicas y/o coordinativas e intensidad.'),
    crit('c44', 'Identifica y describe los test físicos y/o controles utilizados; si no se realizan, detalla el método de evaluación.'),
  ];
  const INF_S3_IND = [ // Dim 3 · deporte individual
    crit('c31', 'Describe de forma clara y breve el deporte, indicando medidas del lugar de competencia, duración y pruebas que se ejecutan, con imágenes ilustrativas.'),
    crit('c32', 'Identifica y describe las capacidades físicas predominantes y las vías energéticas involucradas, argumentando con al menos 2 publicaciones científicas.', true),
    crit('c33', 'Investiga los/las deportistas chilenos/as con ranking nacional (1º y 2º lugar) en la prueba/división de peso y categoría en que realiza la práctica.'),
    crit('c34', 'Investiga los ranking mundial, panamericano y sudamericano, indicando país y deportista en primer lugar y ubicando al/la mejor deportista chileno/a.'),
    crit('c35', 'Describe los campeonatos en que participa el equipo, los lugares conseguidos e indica el mejor equipo del campeonato más importante.'),
    crit('c36', 'Investiga quiénes ocupan el 1º lugar de los ranking Sudamericano, Panamericano y Mundial, en damas y varones, de su prueba/división y categoría.'),
    crit('c37', 'Menciona al menos 2 deportistas chilenos/as destacados/as a nivel internacional (una dama y un varón), con posición, edad y equipo.'),
    crit('c38', 'Averigua si el deporte se ejecuta también en el ámbito Paralímpico y nombra el mejor exponente dama y varón de Chile.'),
  ];
  const INF_S3_COL = [ // Dim 3 · deporte colectivo
    crit('c31', 'Describe de forma clara y breve el deporte, indicando medidas del lugar de competencia, duración, N° de jugadores, sus posiciones y función, con imágenes.'),
    crit('c32', 'Identifica y describe las capacidades físicas predominantes y las vías energéticas involucradas, argumentando con al menos 2 publicaciones científicas.', true),
    crit('c33', 'Averigua y describe la estructura del ranking nacional o liga más importante del deporte y sus mejores exponentes, en damas y varones.'),
    crit('c34', 'Describe los campeonatos en que participa el equipo, los lugares conseguidos e indica el mejor equipo del campeonato más importante.'),
    crit('c35', 'Investiga quiénes ocupan el 1º lugar de los ranking Sudamericano, Panamericano y Mundial, en damas y varones.'),
    crit('c36', 'Menciona al menos 2 deportistas chilenos/as destacados/as a nivel internacional (una dama y un varón), con posición, edad y equipo.'),
    crit('c37', 'Averigua si el deporte se ejecuta también en el ámbito Paralímpico y nombra el mejor exponente dama y varón de Chile.'),
  ];
  const INF_CRIT_IND = [...INF_S12, ...INF_S3_IND, ...INF_S4]; // 20 · ideal 66
  const INF_CRIT_COL = [...INF_S12, ...INF_S3_COL, ...INF_S4]; // 19 · ideal 63

  const INFORME = {
    id: 'INF', grupo: 'documento', numero: 1, nivelesKey: 'NIVELES_EBSD',
    titulo: 'Informe: Estructura organizacional y descripción del deporte', tipo: 'Informe (Word)', duracion: 'Máx. 8 pp.',
    fecha: '2025-10-01', semana: 6, estado: 'pendiente', maxPuntos: 66, ponderacion: 0.20,
    // ── Variante activa (Individual por defecto) ──
    variante: 'individual', escala: ESCALA_INF_IND, criterios: INF_CRIT_IND,
    variantes: {
      individual: { label: 'Deporte individual', criterios: INF_CRIT_IND, maxPuntos: 66, escala: ESCALA_INF_IND },
      colectivo:  { label: 'Deporte colectivo',  criterios: INF_CRIT_COL, maxPuntos: 63, escala: ESCALA_INF_COL },
    },
    descripcion: 'Indaga la estructura organizacional y el funcionamiento del centro de práctica, describe el deporte a intervenir, sus medios y métodos de entrenamiento, y los/las deportistas que frecuentan el centro.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Describir la estructura organizacional del centro (misión/visión, objetivo, organigrama y FODA).',
      'Caracterizar técnicamente el deporte: espacio, duración, pruebas, capacidades físicas y vías energéticas con base científica.',
      'Investigar el contexto competitivo del deporte: ranking nacional e internacional, campeonatos y participación paralímpica.',
      'Indagar la planificación y el control del entrenamiento que utiliza el/la entrenador/a tutor/a del centro.',
      'Plantear una reflexión inicial: expectativas, miedos y habilidades que desea desarrollar en la práctica.',
    ],
    instrucciones: [
      'Cargar en el portafolio DRIVE/MOODLE en formato Word editable (miércoles 01-10, 23:59).',
      'Datos del centro: nombre, dirección-comuna, profesor/a tutor/a, deporte, edad de beneficiarios, días/horarios de entrenamiento y de práctica.',
      'Estructura organizacional: descripción, años en el deporte, misión/visión, objetivo general, organigrama (ubicándose) y FODA (2 características por ítem).',
      'Reflexión inicial: expectativas de la práctica, miedos o preocupaciones y habilidades que le gustaría desarrollar.',
      'Descripción del deporte (individual o colectivo): definición, espacio y medidas, duración, pruebas/posiciones, capacidades y vías energéticas (≥2 referencias desde 2011), ranking nacional e internacional, paralímpico y campeonatos 2022–2023.',
      'Planificación y control: estructura de la sesión, modelo y por qué, objetivos y resultados esperados, variación semanal de cargas, eventos preparatorios/fundamentales y test/controles.',
    ],
    aspectosFormales: [
      'Portada con logo USACH, Facultad/Escuela/Carrera y datos del centro y del/la estudiante.',
      'Hoja carta, letra Arial o Calibri 10, espaciado 1.5, texto justificado; títulos en negrita 12.',
      'Tablas/gráficos auto explicativos y enumerados; bibliografía en orden alfabético o numérico.',
      'No sobrepasar 8 hojas totales. Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Seleccione la variante según el tipo de deporte: individual (ideal 66 pts) o colectivo (ideal 63 pts).',
      'Criterios con doble puntaje: capacidades y vías energéticas (3.2) y modelo de entrenamiento/objetivos (4.2).',
      'Verifique que el FODA tenga 2 características por ítem y la correcta ubicación en el organigrama.',
      'Valore la fundamentación científica (referencias desde 2011) de las capacidades físicas y vías energéticas.',
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // 2 · PLANIFICACIÓN DE ENTRENAMIENTO DEPORTIVO (20%)
  //     Rúbrica E·B·S·D · 17 indicadores · ideal 51 pts
  //     Mesociclo (4 semanas) de un objetivo concreto · 4 microciclos · 8 sesiones
  // ═══════════════════════════════════════════════════════════
  const PLANIFICACION = {
    id: 'PLAN', grupo: 'documento', numero: 2, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PLANIF',
    titulo: 'Planificación de entrenamiento deportivo', tipo: 'Excel editable', duracion: '8 sesiones',
    fecha: '2025-10-29', semana: 9, estado: 'pendiente', maxPuntos: 51, ponderacion: 0.20,
    descripcion: 'Diseña una planificación de un objetivo concreto acordado con el/la tutor/a: un mesociclo de 4 semanas con 4 microciclos y un mínimo de 8 sesiones (2 por semana), con progresión, distribución de cargas y evaluación.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Acordar con el/la tutor/a un objetivo concreto a mejorar (p. ej. técnica de carrera, técnica de nado).',
      'Confeccionar un mesociclo de 4 microciclos y un mínimo de 8 sesiones, ordenadas por intensidad.',
      'Definir metodología, medios y ejercicios progresivos por sesión, con distribución de cargas (volumen, intensidad, pausas).',
      'Incluir una sesión de diagnóstico inicial y una de evaluación final del objetivo concreto.',
    ],
    instrucciones: [
      'Cargar en DRIVE/MOODLE en formato Excel editable (miércoles 29-10, 23:59).',
      'Pestaña Portada: datos del centro, deporte y género, edad, días/horarios de entrenamiento y práctica.',
      'Pestaña Planificación general: deporte, periodo del macrociclo, objetivo general del mesociclo (1), tipo de mesociclo y microciclos.',
      'Pestañas por microciclo: tipo y objetivos específicos, metodología, ejercicios progresivos (diagnóstico en la 1ª y evaluación en la última) y distribución de cargas (volumen, intensidad, pausas). Puede apoyarse con imágenes/esquemas.',
    ],
    aspectosFormales: [
      'Portada con logo USACH e identificación institucional.',
      'Letra Arial o Calibri 10; recordar que el contexto es de 2 sesiones por semana.',
      'Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Rúbrica E·B·S·D de 17 indicadores. Puntaje ideal 51 (exigencia 60%).',
      'Valore la coherencia entre objetivo general, objetivos específicos por microciclo/sesión y la progresión de cargas.',
      'Verifique los 4 microciclos y las 8 sesiones mínimas, con diagnóstico inicial y evaluación final.',
    ],
    criterios: [
      crit('p11', 'Entrega la planificación en la fecha indicada cumpliendo con todos los requisitos descritos en la consigna.'),
      crit('p12', 'Desarrolla todas las partes de la planificación solicitadas en la consigna.'),
      crit('p13', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
      crit('p14', 'Utiliza lenguaje técnico acorde al nivel de las asignaturas cursadas hasta el momento en la carrera.'),
      crit('p15', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      crit('p21', 'Indica todos los datos del centro de práctica solicitados.'),
      crit('p22', 'Entrega un esquema general del mesociclo: periodo en que se inserta, objetivo general, tipo de mesociclo y microciclos a utilizar.'),
      crit('p23', 'Entrega un tipo de mesociclo acorde al periodo de entrenamiento en el que se encuentra actualmente.'),
      crit('p24', 'Los tipos de microciclos se encuentran ordenados de acuerdo a los niveles de intensidad.'),
      crit('p25', 'Detalla los objetivos específicos por cada microciclo y sesión, relacionados con el objetivo general del mesociclo.'),
      crit('p26', 'En cada sesión indica los medios y/o métodos a utilizar.'),
      crit('p27', 'En cada sesión realiza ejercicios de manera progresiva en relación al objetivo específico a cumplir.'),
      crit('p28', 'Realiza en su planificación 4 microciclos y 8 sesiones de entrenamiento como mínimo.'),
      crit('p29', 'Incluye una sesión de diagnóstico breve del objetivo concreto.'),
      crit('p210', 'Incluye una sesión de evaluación final de su trabajo.'),
      crit('p211', 'Utiliza imágenes, esquemas o iconos para explicar mejor los ejercicios o actividades.'),
      crit('p212', 'Se identifica claramente, en el mesociclo, la progresión de las actividades para cumplir el objetivo general.'),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // 3 · PRESENTACIÓN FINAL (15%)
  //     Rúbrica E·B·S·D · 13 indicadores · ideal 48 pts
  // ═══════════════════════════════════════════════════════════
  const PRESENTACION = {
    id: 'PRES', grupo: 'documento', numero: 3, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PRESENT',
    titulo: 'Presentación Final', tipo: 'Exposición (PPT/Canva/Prezi)', duracion: '15 min + 5 preguntas',
    fecha: '2025-11-28', semana: 14, estado: 'pendiente', maxPuntos: 48, ponderacion: 0.15,
    descripcion: 'Exposición de la experiencia personal de la intervención en el centro de práctica y la reflexión sobre la integración de las asignaturas teóricas a la práctica, en diálogo con la reflexión inicial del informe.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Comunicar las funciones desarrolladas y la experiencia personal en el centro de práctica.',
      'Contrastar la reflexión final con las expectativas, miedos y habilidades declaradas en la reflexión inicial.',
      'Reflexionar sobre la construcción del objetivo concreto planificado y su ejecución.',
      'Identificar las asignaturas de la carrera integradas y proponer mejoras a partir de una introspección crítica.',
    ],
    instrucciones: [
      'Cargar en DRIVE/MOODLE (viernes 28-11, 23:59). Formato individual o grupal según indique el/la supervisor/a.',
      'Vestimenta institucional (polera/polerón de la carrera, buzo o calza). 15 min + 5 min de preguntas.',
      'Datos del centro y población intervenida.',
      'Experiencia y reflexión: funciones, cumplimiento de expectativas, aporte al rol de entrenador/a, habilidades desarrolladas, valores, experiencia con la planificación, entorno, asignaturas integradas, descripción del/la tutor/a y del grupo, situaciones que sorprendieron, aspectos a mejorar y propuestas.',
    ],
    aspectosFormales: [
      'Soporte visual (PPT/Canva/Prezi/cápsula de video).',
      'Vestimenta institucional de la carrera.',
      'Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Puntaje ideal 48. Criterios ×2: poder de síntesis (1.4), coherencia con la reflexión inicial (2.2) y asignaturas de integración (2.4).',
      'Valore la profundidad de la reflexión y la coherencia con la reflexión inicial del informe.',
      'Considere la claridad, el lenguaje técnico y la calidad de las propuestas de mejora.',
    ],
    criterios: [
      crit('c11', 'Entrega la presentación en la fecha indicada.'),
      crit('c12', 'Cumple con todos los requisitos de la presentación descritos en la consigna.'),
      crit('c13', 'Desarrolla todas las partes de la presentación solicitadas en la consigna.'),
      crit('c14', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.', true),
      crit('c15', 'Utiliza lenguaje técnico y formal en su presentación.'),
      crit('c16', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      crit('c21', 'Explica las funciones realizadas en el centro de práctica de manera breve.'),
      crit('c22', 'La reflexión final tiene coherencia con la realizada al inicio de la práctica.', true),
      crit('c23', 'Entrega antecedentes importantes en relación a la planificación ejecutada.'),
      crit('c24', 'Identifica de manera clara las asignaturas de integración dentro de la práctica.', true),
      crit('c25', 'Su reflexión del centro de práctica es clara y coherente.'),
      crit('c26', 'Realiza una introspección indicando sus aspectos a mejorar como futuro entrenador/a.'),
      crit('c27', 'Otorga propuestas de mejora y sugerencias claras en relación a la asignatura.'),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // 4 · PORTAFOLIO — 3 evaluaciones (parte del 20% de supervisión)
  //     Rúbrica E·B·S·D · ideales 36 / 27 / 30
  // ═══════════════════════════════════════════════════════════
  const BITACORA = [
    crit('b1', 'Mantiene la bitácora actualizada.'),
    crit('b2', 'Anota el día, hora de inicio y término de la sesión.'),
    crit('b3', 'Identifica los objetivos de cada sesión.'),
    crit('b4', 'Describe las actividades de cada sesión en un orden lógico (inicio, desarrollo, final).'),
    crit('b5', 'Se identifican las actividades realizadas por él/la estudiante.'),
    crit('b6', 'Utiliza lenguaje técnico para describir el objetivo y la sesión de entrenamiento.'),
    crit('b7', 'Utiliza un lenguaje inclusivo y de equidad de género en su redacción.'),
    crit('b8', 'Mantiene una redacción gramatical coherente y sin faltas de ortografía.'),
    crit('b9', 'Realiza observaciones técnicas con actitud de indagación, usando conocimiento de asignaturas teóricas.'),
  ];
  const PORT1 = {
    id: 'PORT1', grupo: 'portafolio', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT1',
    titulo: 'Portafolio — Evaluación N°1 (Construcción + Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Construcción',
    fecha: '2025-10-01', semana: 6, estado: 'pendiente', maxPuntos: 36, ponderacion: 0,
    descripcion: 'Construcción del portafolio "PRÁCTICA IV - NOMBRE APELLIDO" en DRIVE con todas las carpetas indicadas y registro diario de la bitácora.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Construir el portafolio con todas las carpetas: Informe, Planificación, Presentación, Bitácora, Evaluaciones y Anexos.',
      'Compartir el portafolio al/la supervisor/a con opción de edición (miércoles 24-09).',
      'Registrar diariamente las sesiones en la bitácora.',
    ],
    instrucciones: [
      'Crear y compartir la carpeta DRIVE editable el miércoles 24-09 a las 23:59 con todas las carpetas indicadas.',
      'Mantener la bitácora (Excel proporcionado) con el registro diario de las acciones del centro de práctica.',
    ],
    aspectosFormales: ['Carpeta DRIVE editable con el nombre correcto.', 'Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 36 (Construcción 3 criterios + Bitácora 9 criterios). Se promedia con la supervisión en terreno (20%).'],
    criterios: [
      crit('c11', 'Construye el portafolio en la fecha indicada, con el nombre correcto descrito en la consigna.'),
      crit('c12', 'Comparte el portafolio al/la profesor/a supervisor/a en formato editar.'),
      crit('c13', 'Incluye todas las carpetas descritas en la tabla de la consigna de portafolio.'),
      ...BITACORA,
    ],
  };
  const PORT2 = {
    id: 'PORT2', grupo: 'portafolio', numero: 2, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT2',
    titulo: 'Portafolio — Evaluación N°2 (Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Aleatoria',
    fecha: '2025-10-22', semana: 8, estado: 'pendiente', maxPuntos: 27, ponderacion: 0,
    descripcion: 'Revisión aleatoria del registro diario de la bitácora en cualquier momento del semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Mantener actualizado el registro diario de la bitácora en cualquier momento del semestre.'],
    instrucciones: ['Tener actualizado el archivo Excel con el registro diario de las acciones del centro de práctica.'],
    aspectosFormales: ['Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 27 (Bitácora, 9 criterios). Se promedia con la supervisión en terreno (20%).'],
    criterios: [...BITACORA],
  };
  const PORT3 = {
    id: 'PORT3', grupo: 'portafolio', numero: 3, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT3',
    titulo: 'Portafolio — Evaluación N°3 (Carga completa + Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Cierre',
    fecha: '2025-11-28', semana: 14, estado: 'pendiente', maxPuntos: 30, ponderacion: 0,
    descripcion: 'Carga de la totalidad de los documentos del portafolio y registro completo de la bitácora al cierre del semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Cargar todos los documentos en las fechas estipuladas.', 'Completar la bitácora con todas las sesiones realizadas.'],
    instrucciones: ['Cargar la totalidad de los documentos indicados en la consigna (viernes 28-11, 12:00) y tener el registro completo de la bitácora.'],
    aspectosFormales: ['Todos los documentos cargados.', 'Bitácora completa.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 30 (Carga completa 1 criterio + Bitácora 9 criterios). Se promedia con la supervisión en terreno (20%).'],
    criterios: [
      crit('c11', 'Tiene cargados todos los documentos descritos en la consigna de portafolio y en las fechas estipuladas.'),
      ...BITACORA,
    ],
  };
  const PORTAFOLIO_EVAL_IDS = ['PORT1', 'PORT2', 'PORT3'];

  const EVALUACIONES = [INFORME, PLANIFICACION, PRESENTACION, PORT1, PORT2, PORT3];

  // ═══════════════════════════════════════════════════════════
  // SUPERVISIÓN EN TERRENO — área deporte · 2 modos
  // ═══════════════════════════════════════════════════════════
  const TERRENO_FORMALES = [
    crit('f1', 'Asiste puntualmente a la sesión y cumple con el horario establecido.', true),
    crit('f2', 'Utiliza vestimenta deportiva acorde al contexto, identificándose con el uniforme de la carrera o del centro de práctica.'),
    crit('f3', 'Presenta planificación clara y ordenada de la sesión (o la parte solicitada), o realiza activamente las actividades planificadas por el/la tutor/a, interviniendo y apoyando.'),
  ];
  const DISC_PARTICIPA = [
    crit('d1', 'Demuestra las actividades y/o ejercicios correctamente, utilizando su cuerpo.'),
    crit('d2', 'Se preocupa de corregir constantemente las ejecuciones de sus dirigidos, aplicando claves de corrección y/o refuerzos positivos.'),
    crit('d3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    crit('d4', 'Los ejercicios presentados se articulan en una secuencia metodológica coherente que permite alcanzar los objetivos propuestos.'),
    crit('d5', 'Organiza las actividades en forma óptima, aprovechando el espacio y los recursos materiales y favoreciendo el ritmo de la sesión.'),
    crit('d6', 'Utiliza un tono de voz adecuado que permite escuchar claramente sus instrucciones y correcciones.'),
    crit('d7', 'Entrega instrucciones con un lenguaje técnico claro y adecuado al contexto y a las características de los y las deportistas.'),
    crit('d8', 'Demuestra seguridad al explicar, corregir y dirigirse al grupo o al deportista.'),
  ];
  const DISC_OBSERVA = [
    crit('o1', 'Se encuentra observando la sesión, atento/a a las necesidades del/la entrenador/a tutor/a.'),
    crit('o2', 'Se demuestra proactivo/a preguntando durante la sesión si se necesita apoyo, ofreciendo asistencia.'),
  ];

  const AREAS = {
    deporte: {
      id: 'deporte', label: 'Deporte', desc: 'Intervención en club, federación, escuela deportiva, corporación municipal o selección.',
      modos: {
        part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', ideal: 48, escala: ESCALA_TERR_PART, disc: DISC_PARTICIPA },
        obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', ideal: 24, escala: ESCALA_TERR_OBS,  disc: DISC_OBSERVA },
      },
    },
  };
  function areaDef(area) { return AREAS[area] || AREAS.deporte; }
  function modosDeArea(area) { return Object.values(areaDef(area).modos); }
  function modoDef(area, modo) { const a = areaDef(area); return a.modos[modo] || a.modos[Object.keys(a.modos)[0]]; }
  function terrenoCriterios(area, modo) { return [...TERRENO_FORMALES, ...modoDef(area, modo).disc]; }

  function notaTerrenoVisita(area, v) {
    if (!v || !v.resp) return { nota: null, parcial: true, puntos: null, ideal: modoDef(area, v && v.modo).ideal };
    const md = modoDef(area, v.modo);
    const crs = terrenoCriterios(area, v.modo);
    let total = 0, answered = 0;
    crs.forEach(c => { const k = v.resp[c.id]; if (!k) return; const ni = NIVELES_APREC.find(n => n.key === k); if (!ni) return; total += ni.pts * (c.doble ? 2 : 1); answered++; });
    const parcial = answered < crs.length;
    const nota = parcial ? null : window.USACH_CALC.notaFromEscala(md.escala, total);
    return { nota, parcial, puntos: total, ideal: md.ideal };
  }

  // Supervisión (20%) = promedio de las visitas en terreno + las 3 evaluaciones del portafolio.
  function notaSupervisorP3(estId, state) {
    const est = (state.estudiantes || ESTUDIANTES).find(e => e.id === estId) || {};
    const area = est.area || 'deporte';
    const visitas = (state.terreno && state.terreno[estId]) || [];
    const notas = []; let parcial = false;
    visitas.forEach(v => { const r = notaTerrenoVisita(area, v); if (r.nota != null) notas.push(r.nota); else parcial = true; });
    PORTAFOLIO_EVAL_IDS.forEach(pid => {
      const ev = EVALUACIONES.find(e => e.id === pid);
      const res = window.USACH_CALC.calcNotaEvaluacion(ev, state.niveles[pid] && state.niveles[pid][estId], state.atrasos[pid] && state.atrasos[pid][estId]);
      if (res && !res.parcial) notas.push(res.notaFinal); else parcial = true;
    });
    if (notas.length === 0) return { nota: null, parcial: true };
    const nota = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10;
    return { nota, parcial };
  }

  // ═══════════════════════════════════════════════════════════
  // EVALUACIÓN ENTRENADOR/A TUTOR/A (20%) — frecuencia · ideal 56
  // ═══════════════════════════════════════════════════════════
  const TUTOR_DIMENSIONES = [
    { id: 't1', label: '1. Aspectos formales', indicadores: [
      { id: 't11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su entrenador/a o profesor/a tutor/a.' },
      { id: 't12', texto: 'Asiste puntualmente a todas las sesiones y actividades programadas, cumpliendo con el horario establecido.' },
      { id: 't13', texto: 'Respeta las normas y cumple con los protocolos establecidos en el centro de práctica.' },
      { id: 't14', texto: 'Participa vestido/a de manera acorde a su rol (buzo, polera o polerón institucional, o vestimenta del centro).' },
    ]},
    { id: 't2', label: '2. Aspectos disciplinares', indicadores: [
      { id: 't21', texto: 'Participa activamente de los entrenamientos, realizando intervenciones, apoyando las sesiones y/o desarrollando las tareas solicitadas.' },
      { id: 't22', texto: 'Demuestra correctamente los ejercicios, utilizando su lenguaje corporal y demostrando en diferentes planos.' },
      { id: 't23', texto: 'Se preocupa de corregir las ejecuciones de sus dirigidos aplicando claves de corrección.' },
      { id: 't24', texto: 'Demuestra preparación de los contenidos que le corresponde desarrollar en su práctica.' },
      { id: 't25', texto: 'Entrega instrucciones con un lenguaje claro y adecuado a las características de los y las deportistas o personas a cargo.' },
      { id: 't26', texto: 'Demuestra seguridad al dar instrucciones y en el manejo del grupo.' },
    ]},
    { id: 't3', label: '3. Aspectos actitudinales', indicadores: [
      { id: 't31', texto: 'Responde a las tareas y/o actividades solicitadas en los tiempos acordados.' },
      { id: 't32', texto: 'Manifiesta interés, iniciativa y motivación por aprender y adquirir nuevos conocimientos.' },
      { id: 't33', texto: 'Mantiene una actitud respetuosa y de cordialidad con el equipo de trabajo y deportistas a su cargo.' },
      { id: 't34', texto: 'Acepta la crítica y las sugerencias de manera positiva, considerándolas para la mejora de su desempeño.' },
    ]},
  ];

  // ═══════════════════════════════════════════════════════════
  // AUTOEVALUACIÓN (5%) — frecuencia · ideal 64
  // ═══════════════════════════════════════════════════════════
  const AUTOEVAL_DIMENSIONES = [
    { id: 'a1', label: '1. Responsabilidad y compromiso', indicadores: [
      { id: 'a11', texto: 'Asiste puntualmente a todas las sesiones programadas por su profesor/a tutor/a o supervisor/a (reuniones, clases online, seminarios, etc.).' },
      { id: 'a12', texto: 'Cumple en la fecha acordada con los compromisos adquiridos y las responsabilidades asignadas.' },
      { id: 'a13', texto: 'Demuestra compromiso con las diferentes labores asignadas procurando realizarlas lo mejor posible.' },
    ]},
    { id: 'a2', label: '2. Solución de problemas', indicadores: [
      { id: 'a21', texto: 'Se comunica oportunamente con el/la tutor/a y/o supervisor/a para informar de cualquier imprevisto o problema.' },
      { id: 'a22', texto: 'Resuelve o propone soluciones a situaciones problemáticas en el centro de práctica, desde una perspectiva constructiva.' },
      { id: 'a23', texto: 'Identifica sus debilidades y es capaz de solicitar ayuda para superar dificultades.' },
    ]},
    { id: 'a3', label: '3. Participación activa', indicadores: [
      { id: 'a31', texto: 'Participa activamente del proceso de prácticas demostrando interés por adquirir nuevos conocimientos y mejorar su desempeño.' },
      { id: 'a32', texto: 'Demuestra proactividad tomando la iniciativa y colaborando con el equipo de trabajo en tareas de su área.' },
    ]},
    { id: 'a4', label: '4. Desarrollo disciplinar', indicadores: [
      { id: 'a41', texto: 'Demuestra sus conocimientos y los relaciona con la experiencia práctica para responder a los desafíos impuestos por el/la tutor/a.' },
      { id: 'a42', texto: 'Prepara sus intervenciones con antelación evitando improvisar.' },
      { id: 'a43', texto: 'Demuestra seguridad en su rol de entrenador/a en práctica (indicaciones, manejo de grupo, correcciones y otros).' },
    ]},
    { id: 'a5', label: '5. Comunicación', indicadores: [
      { id: 'a51', texto: 'Comunica sus ideas utilizando un lenguaje verbal y no verbal adecuado para relacionarse en el contexto profesional.' },
      { id: 'a52', texto: 'Procura entregar indicaciones utilizando un lenguaje técnico apropiado a las características de sus dirigidos.' },
    ]},
    { id: 'a6', label: '6. Aspectos actitudinales', indicadores: [
      { id: 'a61', texto: 'Demuestra una conducta respetuosa con las normas de la institución, el equipo de trabajo y deportistas a su cargo.' },
      { id: 'a62', texto: 'Reflexiona permanentemente sobre su desempeño, identificando sus fortalezas y debilidades e intentando superarse.' },
      { id: 'a63', texto: 'Acepta la crítica de manera respetuosa como oportunidad de desarrollo y aplica las orientaciones recibidas.' },
    ]},
  ];

  // ───────────────────────────────────────────────────────────
  // Datos demo (roster con tipo de deporte) + pre-llenos
  // ───────────────────────────────────────────────────────────
  const ESTUDIANTES = [
    { id: 'e1', rut: '21.487.330-2', nombre: 'Martina Salinas Rojas',  email: 'martina.salinas@usach.cl',  telefono: '+56 9 6721 4408', area: 'deporte', tipoDeporte: 'individual', deporte: 'Atletismo (velocidad)', categoria: 'Sub-18 · Damas', centro: 'Club Atlético Santiago Centro', comuna: 'Santiago', tutorCentro: 'Prof. Rodrigo Maldonado', dias: 'Mar y Jue · 18:00–20:00' },
    { id: 'e2', rut: '21.052.778-K', nombre: 'Ignacio Vergara Lillo',  email: 'ignacio.vergara@usach.cl',  telefono: '+56 9 9043 1175', area: 'deporte', tipoDeporte: 'colectivo',  deporte: 'Vóleibol',            categoria: 'Cadetes · Varones', centro: 'Club Deportivo Manquehue', comuna: 'Las Condes', tutorCentro: 'Prof. Carla Bustos', dias: 'Lun y Mié · 19:00–21:00' },
    { id: 'e3', rut: '20.998.114-6', nombre: 'Catalina Pizarro Díaz',  email: 'catalina.pizarro@usach.cl', telefono: '+56 9 5562 7790', area: 'deporte', tipoDeporte: 'individual', deporte: 'Natación (libre)',      categoria: 'Juvenil · Damas',   centro: 'Estadio Español de Las Condes', comuna: 'Las Condes', tutorCentro: 'Prof. Felipe Arancibia', dias: 'Mar y Vie · 07:00–09:00' },
    { id: 'e4', rut: '21.640.205-1', nombre: 'Tomás Reyes Hernández',  email: 'tomas.reyes@usach.cl',     telefono: '+56 9 3318 6624', area: 'deporte', tipoDeporte: 'colectivo',  deporte: 'Básquetbol',          categoria: 'U-15 · Varones',    centro: 'Corp. Municipal de Deportes Maipú', comuna: 'Maipú', tutorCentro: 'Prof. Daniela Soto', dias: 'Mié y Vie · 18:30–20:30' },
    { id: 'e5', rut: '21.205.567-8', nombre: 'Valentina Cortés Mura',  email: 'valentina.cortes@usach.cl', telefono: '+56 9 8890 2231', area: 'deporte', tipoDeporte: 'individual', deporte: 'Judo (−57 kg)',        categoria: 'Cadete · Damas',    centro: 'Escuela de Judo Ñuñoa', comuna: 'Ñuñoa', tutorCentro: 'Prof. Sebastián Lagos', dias: 'Lun y Jue · 19:30–21:30' },
  ];

  const PROFESORES = [
    { id: 'p1', nombre: 'Prof. Andrés Tapia Vergara', email: 'andres.tapia@usach.cl', rol: 'Profesor Supervisor', activo: true },
    { id: 'p2', nombre: 'Prof. María Inés Cáceres',   email: 'maria.caceres@usach.cl', rol: 'Profesora Supervisora', activo: true },
  ];

  const ANEXOS_ADMIN = [
    { id: 'a1', titulo: 'Calendario Académico Práctica IV', desc: 'Fechas de cargas del portafolio, informe, planificación y presentación final.', tipo: 'PDF', tamano: '0.4 MB' },
    { id: 'a2', titulo: 'Formato de Bitácora (Excel)', desc: 'Planilla de registro diario de sesiones del centro de práctica.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a3', titulo: 'Plantilla de Planificación (Excel)', desc: 'Hoja de cálculo base para el mesociclo de 4 microciclos y 8 sesiones.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a4', titulo: 'Consentimiento Informado del Centro', desc: 'Autorización del centro de práctica deportivo.', tipo: 'PDF', tamano: '0.2 MB' },
    { id: 'a5', titulo: 'Declaración Individual de Accidentes Personales', desc: 'Documento obligatorio para actividades en terreno.', tipo: 'PDF', tamano: '0.3 MB' },
  ];

  const PONDERACIONES = [
    { id: 'q1', label: 'Informe (Estructura y descripción del deporte)', componentes: ['INF'],  peso: 0.20 },
    { id: 'q2', label: 'Planificación de entrenamiento',                 componentes: ['PLAN'], peso: 0.20 },
    { id: 'q3', label: 'Presentación Final',                             componentes: ['PRES'], peso: 0.15 },
    { id: 'q4', label: 'Eval. Entrenador/a Tutor/a',                     resolver: 'TUTOR', peso: 0.20 },
    { id: 'q5', label: 'Supervisión + Portafolio',                       resolver: 'SUP',   peso: 0.20 },
    { id: 'q6', label: 'Autoevaluación',                                 resolver: 'AUTO',  peso: 0.05 },
  ];

  // helper de pre-llenado pseudoaleatorio pero estable
  function R(seed) {
    return (key) => {
      const x = (Math.sin(seed * 9301 + String(key).split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0) * 49297) + 1) / 2;
      return x;
    };
  }
  function pick(set, x, topBias) {
    // topBias hacia los niveles más altos (índice bajo del set ordenado desc)
    if (x < 0.55) return set[0].key;
    if (x < 0.85) return set[1].key;
    if (x < 0.97) return set[Math.min(2, set.length - 1)].key;
    return set[Math.min(3, set.length - 1)].key;
  }

  function genDemo() {
    const niveles = {}, atrasos = {}, terreno = {}, tutor = {}, autoeval = {};
    // Evaluaciones documentales + portafolio con rúbrica E·B·S·D
    const evalsConRubrica = [INFORME, PLANIFICACION, PRESENTACION, PORT1, PORT2, PORT3];
    // estados demo por evaluación
    const estadoMap = { INF: 'corregida', PLAN: 'en-evaluacion', PRES: 'pendiente', PORT1: 'corregida', PORT2: 'corregida', PORT3: 'pendiente' };
    evalsConRubrica.forEach((ev, ei) => {
      if (estadoMap[ev.id] === 'pendiente') return;
      niveles[ev.id] = {}; atrasos[ev.id] = {};
      ESTUDIANTES.forEach((est, si) => {
        const enEval = estadoMap[ev.id] === 'en-evaluacion';
        if (enEval && si >= 3) return; // sólo 3 calificados si está en evaluación
        niveles[ev.id][est.id] = {};
        const rng = R((ei + 2) * 13 + (si + 1) * 29);
        // Informe demo siempre usa la variante individual activa por defecto
        ev.criterios.forEach((cr, ci) => {
          if (enEval && ci >= Math.ceil(ev.criterios.length * 0.7)) return;
          niveles[ev.id][est.id][cr.id] = pick(NIVELES_EBSD, rng(cr.id));
        });
        atrasos[ev.id][est.id] = (si === 1 ? 1 : si === 4 ? 2 : 0);
      });
    });
    // Terreno: 1–2 visitas por estudiante (las primeras 4 con datos)
    ESTUDIANTES.forEach((est, si) => {
      const arr = [];
      if (si < 4) {
        const rng = R(si * 47 + 5);
        const v1 = { id: 'v_' + est.id + '_1', fecha: '2025-10-14', modo: 'part', resp: {} };
        terrenoCriterios('deporte', 'part').forEach(c => { v1.resp[c.id] = pick(NIVELES_APREC, rng(c.id)); });
        arr.push(v1);
        if (si < 2) {
          const rng2 = R(si * 61 + 9);
          const v2 = { id: 'v_' + est.id + '_2', fecha: '2025-11-04', modo: 'obs', resp: {} };
          terrenoCriterios('deporte', 'obs').forEach(c => { v2.resp[c.id] = pick(NIVELES_APREC, rng2(c.id)); });
          arr.push(v2);
        }
      }
      terreno[est.id] = arr;
    });
    // Tutor + autoevaluación (frecuencia) para los primeros 4
    ESTUDIANTES.forEach((est, si) => {
      if (si >= 4) { tutor[est.id] = {}; autoeval[est.id] = {}; return; }
      const rt = R(si * 71 + 3), ra = R(si * 83 + 11);
      const t = {}; TUTOR_DIMENSIONES.forEach(d => d.indicadores.forEach(ind => { t[ind.id] = pick(NIVELES_FREC, rt(ind.id)); }));
      tutor[est.id] = t;
      const a = {}; AUTOEVAL_DIMENSIONES.forEach(d => d.indicadores.forEach(ind => { a[ind.id] = pick(NIVELES_FREC, ra(ind.id)); }));
      autoeval[est.id] = a;
    });
    return { niveles, atrasos, terreno, tutor, autoeval };
  }

  function buildPracticaIV() {
    const demo = genDemo();
    return {
      meta: {
        codigo: 'IV',
        nombre: 'Práctica IV',
        cursoTitulo: 'Práctica IV — Intervención deportiva con tutor/a',
        breadcrumb: 'Práctica IV',
        semestre: 'Semestre 2025-2',
        escuela: 'Facultad de Ciencias Médicas · Entrenador Deportivo',
        kind: 'deporte',
        terreno: true,
        supervisorScreen: 'P3',
        areaLabel: 'Deporte',
      },
      NIVELES: { NIVELES_EBSD, NIVELES_APREC, NIVELES_FREC, NIVELES_SUPERVISOR: NIVELES_FREC },
      ESCALAS: { ESCALA_INF_IND, ESCALA_INF_COL, ESCALA_PLANIF, ESCALA_PRESENT, ESCALA_TUTOR, ESCALA_AUTO, ESCALA_PORT1, ESCALA_PORT2, ESCALA_PORT3, ESCALA_TERR_PART, ESCALA_TERR_OBS },
      GRUPOS: [
        { id: 'documento', label: 'Entregas evaluativas', singular: 'Entrega', sigla: 'E', color: 'teal',
          desc: 'Informe del deporte (20%), Planificación (20%) y Presentación Final (15%) · rúbrica con exigencia 60%' },
        { id: 'portafolio', label: 'Portafolio', singular: 'Portafolio', sigla: 'P', color: 'orange',
          desc: 'Tres evaluaciones de portafolio y bitácora · se promedian con la supervisión en terreno (20%)' },
      ],
      EVALUACIONES,
      PONDERACIONES,
      PORTAFOLIO_EVAL_IDS,
      SUPERVISOR: { kind: 'deporte', areas: AREAS, formales: TERRENO_FORMALES, terrenoCriterios, notaTerrenoVisita,
                    tutorDimensiones: TUTOR_DIMENSIONES, nivelesKey: 'NIVELES_APREC' },
      TUTOR: { dimensiones: TUTOR_DIMENSIONES, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_TUTOR', maxPuntos: 56 },
      AUTOEVAL: { dimensiones: AUTOEVAL_DIMENSIONES, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_AUTO', maxPuntos: 64 },
      ANEXOS_ADMIN,
      ESTUDIANTES, PROFESORES,
      NOTAS_COLUMNS: [
        { key: 'INF',  label: 'Informe',    sub: '20%', kind: 'eval', evalId: 'INF',  color: 'teal' },
        { key: 'PLAN', label: 'Planif.',    sub: '20%', kind: 'eval', evalId: 'PLAN', color: 'teal' },
        { key: 'PRES', label: 'Present.',   sub: '15%', kind: 'eval', evalId: 'PRES', color: 'teal' },
        { key: 'TUTOR', label: 'Tutor',     sub: '20%', kind: 'tutor' },
        { key: 'SUP', label: 'Superv.+Port', sub: '20%', kind: 'sup' },
        { key: 'AUTO', label: 'Autoeval.',  sub: '5%',  kind: 'auto' },
      ],
      RESOLVERS: {
        SUP: (estId, state) => notaSupervisorP3(estId, state),
        TUTOR: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.tutor && state.tutor[estId], TUTOR_DIMENSIONES, NIVELES_FREC, ESCALA_TUTOR);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
        AUTO: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.autoeval && state.autoeval[estId], AUTOEVAL_DIMENSIONES, NIVELES_FREC, ESCALA_AUTO);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
      },
      // helpers expuestos a las pantallas P3
      AREAS, areaDef, modosDeArea, modoDef, terrenoCriterios, notaTerrenoVisita, notaSupervisorP3,
      TUTOR_DIMENSIONES, AUTOEVAL_DIMENSIONES,
      initialState: (kind) => {
        const base = {
          evaluaciones: EVALUACIONES.map(e => ({ ...e })),
          estudiantes: ESTUDIANTES.map(e => ({ ...e })),
          niveles: {}, atrasos: {}, terreno: {}, tutor: {}, autoeval: {},
          supervisor: {}, supervisorComments: {}, autoevalComments: {}, evalFeedback: {}, evalAnexos: {},
        };
        if (kind === 'vacio') {
          return { ...base, estudiantes: [] };
        }
        return {
          ...base,
          niveles: JSON.parse(JSON.stringify(demo.niveles)),
          atrasos: JSON.parse(JSON.stringify(demo.atrasos)),
          terreno: JSON.parse(JSON.stringify(demo.terreno)),
          tutor: JSON.parse(JSON.stringify(demo.tutor)),
          autoeval: JSON.parse(JSON.stringify(demo.autoeval)),
          supervisorComments: {
            e1: 'Martina muestra gran compromiso con el club. Su informe del deporte fue muy completo en la parte de ranking nacional; reforzar la fundamentación científica de las vías energéticas en futuras entregas.',
            e2: 'Ignacio domina el trabajo en cancha y participa activamente. Debe cuidar los plazos de entrega del portafolio y la actualización semanal de la bitácora.',
            e3: 'Catalina destaca por la calidad técnica de su planificación de natación. Buena integración de la teoría de fisiología del ejercicio.',
          },
        };
      },
    };
  }

  window.registerPractica('IV', buildPracticaIV);
})();
