// data-p4.js — Práctica III · "Intervención en Fitness y Actividad Física"
// Se registra como 'III' en el registro de prácticas definido en data.js.
// Intervención en clubes, gimnasios, centros de entrenamiento o corporaciones
// municipales, diseñando una planificación de entrenamiento con bases científicas.
// Documentos fuente: consignas Práctica III 2025.

(function () {
  // ───────────────────────────────────────────────────────────
  // Escala lineal 60% de exigencia (1,0 → 0 pts · 4,0 → 60% · 7,0 → 100%)
  // Reproduce las tablas oficiales de las consignas (verificado).
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
  // Niveles
  // ───────────────────────────────────────────────────────────
  const NIVELES_EBSD = [
    { key: 'E', label: 'Excelente',  pts: 3, desc: 'Demuestra dominio de todos los elementos descritos en el indicador.' },
    { key: 'B', label: 'Bueno',      pts: 2, desc: 'Demuestra dominio de la mayoría de los elementos descritos en el indicador.' },
    { key: 'S', label: 'Suficiente', pts: 1, desc: 'Cumple parcialmente con los elementos establecidos o solo con alguno de ellos.' },
    { key: 'D', label: 'Deficiente', pts: 0, desc: 'Se evidencia dificultad para alcanzar el logro descrito, o no es observado.' },
  ];
  // Rúbrica analítica de la Planificación (4·3·2·1) — cada criterio tiene su propia descripción por nivel.
  const NIVELES_PLANIF = [
    { key: 'L',  label: 'Nivel 4', pts: 4, desc: 'Cumple plenamente con el criterio.' },
    { key: 'ML', label: 'Nivel 3', pts: 3, desc: 'Cumple en gran medida con el criterio.' },
    { key: 'NL', label: 'Nivel 2', pts: 2, desc: 'Cumple parcialmente con el criterio.' },
    { key: 'I',  label: 'Nivel 1', pts: 1, desc: 'Cumple de forma incipiente o no cumple el criterio.' },
  ];
  const NIVELES_APREC = [
    { key: 'L',  label: 'Logrado',              pts: 4, desc: 'Cumple con el 100% de lo solicitado.' },
    { key: 'ML', label: 'Medianamente logrado', pts: 3, desc: 'Cumple parcialmente con lo solicitado.' },
    { key: 'NL', label: 'No logrado',           pts: 2, desc: 'El requerimiento no supera el 60% solicitado.' },
    { key: 'I',  label: 'Insuficiente',         pts: 1, desc: 'No demuestra dominio de la competencia solicitada.' },
    { key: 'NO', label: 'No observado',         pts: 0, desc: 'El indicador no ha sido posible de observar.' },
  ];
  const NIVELES_FREC = [
    { key: 'S',  label: 'Siempre',        pts: 4 },
    { key: 'CS', label: 'Casi siempre',   pts: 3 },
    { key: 'O',  label: 'Ocasionalmente', pts: 2 },
    { key: 'CN', label: 'Casi nunca',     pts: 1 },
    { key: 'N',  label: 'Nunca',          pts: 0 },
  ];

  // ───────────────────────────────────────────────────────────
  // Escalas (puntaje → nota)
  // ───────────────────────────────────────────────────────────
  const ESCALA_INFORME = linScale(54);
  const ESCALA_PLANIF  = linScale(40);
  const ESCALA_PRESENT = linScale(42);
  const ESCALA_TUTOR   = linScale(44);
  const ESCALA_PORT1   = linScale(36);
  const ESCALA_PORT2   = linScale(27);
  const ESCALA_PORT3   = linScale(30);
  const ESCALA_TERR_PART = linScale(36);
  const ESCALA_TERR_OBS  = linScale(24);

  const RA = 'Intervenir en sectores donde el entrenamiento se relacione al fitness (clubes, gimnasios, centros de entrenamiento o corporaciones municipales), diseñando una propuesta de planificación de entrenamiento con bases científicas, adaptándose a diversos contextos deportivos.';

  const cr = (id, texto, doble, niveles) => ({ id, texto, doble: !!doble, niveles: niveles || null });

  // ═══════════════════════════════════════════════════════════
  // 1 · INFORME — Descripción administrativa y técnica de la actividad (20%)
  //     Rúbrica E/B/S/D · ideal 54 pts
  // ═══════════════════════════════════════════════════════════
  const INFORME = {
    id: 'INF', grupo: 'documento', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_INFORME',
    titulo: 'Informe: Descripción administrativa y técnica de la actividad', tipo: 'Informe (Word)', duracion: 'Máx. 8 pp.',
    fecha: '2025-10-08', semana: 6, estado: 'pendiente', maxPuntos: 54, ponderacion: 0.20,
    descripcion: 'Indaga la estructura organizacional y el funcionamiento del centro de práctica, describiendo la disciplina a intervenir, los medios y métodos de entrenamiento utilizados y los usuarios que frecuentan el centro.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Describir la estructura organizacional del centro (misión/visión, objetivo, organigrama y FODA).',
      'Caracterizar técnicamente la actividad física: espacio, metodología, capacidades físicas y vías energéticas predominantes con base científica.',
      'Analizar mitos, características de la población, lesiones frecuentes/prevención e inclusión de la disciplina.',
      'Indagar la planificación y control del entrenamiento utilizado por el/la tutor/a del centro.',
    ],
    instrucciones: [
      'Cargar en el portafolio DRIVE/MOODLE en formato Word editable (miércoles 08-10, 23:59).',
      'Datos del centro: nombre, dirección-comuna, profesor tutor, actividad, edad de beneficiarios, días y horarios de entrenamiento y de práctica.',
      'Estructura organizacional: descripción, objetivo, misión/visión, organigrama (ubicándose) y FODA (2 características por ítem).',
      'Descripción de la actividad física: definición y origen, espacio, metodología y duración de sesiones, capacidades físicas y vías energéticas (≥2 referencias desde 2011), mitos, población, lesiones/prevención e inclusión.',
      'Planificación y control: estructura de la sesión y modelo, objetivos, resultados esperados, variación semanal de cargas y test/controles utilizados.',
    ],
    aspectosFormales: [
      'Portada con logo USACH, Facultad/Escuela/Carrera y datos del centro y estudiante.',
      'Hoja carta, letra Arial o Calibri 10, espaciado 1.5, texto justificado; títulos en negrita 12.',
      'Tablas/gráficos auto explicativos y enumerados; bibliografía en orden alfabético o numérico.',
      'No sobrepasar 8 hojas totales. Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Puntaje ideal 54. Criterios ×2: vías energéticas (3.3) y modelo de entrenamiento/objetivos (4.2).',
      'Verifique que el FODA tenga 2 características por ítem y la correcta ubicación en el organigrama.',
      'Valore la fundamentación científica (referencias desde 2011) de las capacidades físicas y vías energéticas.',
    ],
    criterios: [
      cr('c11', 'Entrega el informe en la fecha indicada.'),
      cr('c12', 'Cumple con todos los requisitos del informe descritos en la consigna.'),
      cr('c13', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
      cr('c14', 'Utiliza lenguaje técnico acorde al informe de práctica.'),
      cr('c15', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      cr('c21', 'Entrega antecedentes concretos de la institución donde realiza la práctica.'),
      cr('c22', 'Presenta el organigrama completo del centro de manera gráfica y se ubica correctamente dentro de él.'),
      cr('c23', 'Formula un análisis FODA concreto del lugar de práctica, con un mínimo de 2 características por cada ítem.'),
      cr('c24', 'Considera la retroalimentación entregada por el/la supervisor/a y el/la tutor/a y la pone en práctica.'),
      cr('c31', 'Describe de manera clara y breve la actividad física del centro, indicando espacio físico y duración, con imágenes ilustrativas.'),
      cr('c32', 'Identifica y describe las capacidades físicas predominantes de la actividad física.'),
      cr('c33', 'Identifica y describe las vías energéticas involucradas, argumentando con al menos 3 publicaciones científicas.', true),
      cr('c41', 'Detecta cómo se estructura una sesión de entrenamiento.'),
      cr('c42', 'Define el modelo de entrenamiento utilizado y los objetivos generales y específicos por periodo, con lenguaje técnico.', true),
      cr('c43', 'Identifica y describe las variaciones semanales: capacidades físicas y/o coordinativas, intensidad.'),
      cr('c44', 'Identifica y describe los test físicos y/o controles utilizados; si no se realizan, detalla el método de evaluación.'),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // 2 · PLANIFICACIÓN DE ENTRENAMIENTO (20%)
  //     Rúbrica analítica 4·3·2·1 · ideal 40 pts
  // ═══════════════════════════════════════════════════════════
  const PLANIFICACION = {
    id: 'PLAN', grupo: 'documento', numero: 2, nivelesKey: 'NIVELES_PLANIF', escalaKey: 'ESCALA_PLANIF',
    titulo: 'Planificación de entrenamiento', tipo: 'Excel + Word (anexo)', duracion: '8 sesiones',
    fecha: '2025-10-29', semana: 9, estado: 'pendiente', maxPuntos: 40, ponderacion: 0.20,
    descripcion: 'Diseño de una planificación de entrenamiento basada en el mejoramiento de las capacidades físicas predominantes, de acuerdo a las instrucciones del/la profesor/a tutor/a del centro de práctica.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Determinar las capacidades físicas y/o coordinativas predominantes de la actividad.',
      'Confeccionar una planificación de 8 sesiones con asignación porcentual de habilidades biomotoras y variación de cargas.',
      'Establecer controles biomédicos y test específicos con argumento científico.',
      'Ejecutar 2 de las 8 sesiones en el centro de práctica (idealmente las últimas dos semanas).',
    ],
    instrucciones: [
      'Cargar en DRIVE en formato Excel (planificación) + Word (anexo), editable (miércoles 29-10, 23:59).',
      'Excel: capacidades predominantes, 8 sesiones con objetivo y habilidades biomotoras, % de trabajo semanal y variación de cargas (tonelaje, tiempo, RPE u otro).',
      'Word: controles biomédicos y test específicos (≤2 planas) y argumentación de capacidades predominantes (≤3 planas, ≥2 referencias APA).',
      'Ejecutar completas 2 de las 8 sesiones en el centro, conversándolas con el/la tutor/a.',
    ],
    aspectosFormales: [
      'Portada con logo USACH e identificación institucional en Excel y Word.',
      'Letra Arial o Calibri 10; referencias en formato APA.',
      'Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Rúbrica analítica de 10 criterios, cada uno evaluado en 4 niveles (4·3·2·1 pts). Puntaje ideal 40.',
      'Cada criterio define su propia descripción por nivel (ver descripción de cada indicador).',
      'Valore la coherencia entre capacidades predominantes, asignación porcentual y variación de cargas.',
    ],
    criterios: [
      cr('p1', 'Aspectos de forma: identificación institucional completa y escritura según los criterios entregados.', false,
        { L: 'Toda la identificación institucional e identifica al docente del módulo.', ML: 'Toda la identificación institucional pero no identifica al docente.', NL: 'Presenta parcialmente la información institucional y/o del docente.', I: 'No presenta la información institucional correspondiente.' }),
      cr('p2', 'Capacidades físicas y/o coordinativas predominantes seleccionadas.', false,
        { L: 'Selecciona correctamente 3 capacidades predominantes.', ML: 'Selecciona 2 capacidades de la disciplina.', NL: 'Selecciona 1 capacidad de la disciplina.', I: 'No selecciona capacidades acordes a la disciplina.' }),
      cr('p3', 'Planificación: asignación porcentual de habilidades biomotoras en 8 sesiones.', false,
        { L: 'Planificación de 8 sesiones con % correcto de habilidades biomotoras por semana.', ML: 'Planificación de 8 sesiones describiendo las habilidades biomotoras.', NL: 'Planificación de 8 sesiones de entrenamiento.', I: 'Planificación con menos de 8 sesiones.' }),
      cr('p4', 'Variaciones de las cargas de entrenamiento a lo largo de una semana.', false,
        { L: 'Establece correctamente las variaciones de carga semanal (tonelaje, tiempo, RPE u otro).', ML: 'Establece variaciones de carga no del todo adecuadas para la disciplina.', NL: 'Establece variaciones de carga inadecuadas, en menos de una semana.', I: 'No establece las variaciones de las cargas de entrenamiento.' }),
      cr('p5', 'Controles biomédicos y test específicos.', false,
        { L: 'Controles y test claramente establecidos, con argumento científico que los valida.', ML: 'Controles y test establecidos, sin argumento científico que los valide.', NL: 'Controles y test no claramente establecidos.', I: 'No incluye controles biomédicos ni test específicos.' }),
      cr('p6', 'Objetivo principal de las 8 sesiones y ejecución de 2 sesiones en el centro.', false,
        { L: 'Objetivo de las 8 sesiones y ejecuta 2 sesiones completas en el centro.', ML: 'Objetivo de las 8 sesiones y ejecuta solo 1 sesión completa.', NL: 'Establece menos de 8 objetivos principales.', I: 'No establece objetivos.' }),
      cr('p7', 'Base científica de las capacidades predominantes utilizadas.', false,
        { L: 'Argumenta con ≥2 referencias en ≤3 planas anexas, formato APA.', ML: 'Argumenta con ≥2 referencias en >3 planas anexas, formato APA.', NL: 'Argumenta con <2 referencias en >3 planas sin formato APA.', I: 'No incluye argumento con ≥2 referencias.' }),
      cr('p8', 'Formato: cumplimiento de requerimientos de formato y estructura del informe.', false,
        { L: 'Cumple con todos los requerimientos de formato y estructura.', ML: 'Cumple con un 75% de los requerimientos.', NL: 'Cumple con un 50% de los requerimientos.', I: 'No cumple con los requerimientos de formato.' }),
      cr('p9', 'Plazos: cumplimiento de los plazos establecidos.', false,
        { L: 'Cumple con el plazo de entrega.', ML: 'Se retrasa un día con explicación pertinente.', NL: 'Se retrasa dos días con explicación pertinente.', I: 'Se retrasa más de dos días.' }),
      cr('p10', 'Ortografía y redacción: uso correcto de ortografía, puntuación y redacción.', false,
        { L: 'Correcto uso de ortografía, puntuación y redacción.', ML: '<2 errores; redacción hilvanada y coherente.', NL: 'Hasta 3 errores; redacción hilvanada, falta coherencia.', I: 'Hasta 4 errores; redacción sin coherencia en las ideas.' }),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // 3 · PRESENTACIÓN FINAL (20%)
  //     Rúbrica E/B/S/D · ideal 42 pts
  // ═══════════════════════════════════════════════════════════
  const PRESENTACION = {
    id: 'PRES', grupo: 'documento', numero: 3, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PRESENT',
    titulo: 'Presentación Final', tipo: 'Exposición (PPT/Canva/Prezi)', duracion: '15 min + 5 preguntas',
    fecha: '2025-11-28', semana: 14, estado: 'pendiente', maxPuntos: 42, ponderacion: 0.20,
    descripcion: 'Exposición de la experiencia personal de la intervención en el centro de práctica y la reflexión sobre la integración de las asignaturas teóricas a la práctica.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Comunicar las funciones desarrolladas y la experiencia personal en el centro de práctica.',
      'Reflexionar sobre la construcción de la planificación específica y el aporte de la práctica al rol de entrenador/a.',
      'Identificar las asignaturas de la carrera integradas y aplicadas directamente.',
      'Proponer mejoras y sugerencias a partir de una introspección crítica.',
    ],
    instrucciones: [
      'Cargar en DRIVE/MOODLE (viernes 28-11, 12:00). Formato individual o grupal según indique el/la supervisor/a.',
      'Vestimenta institucional (polera/polerón de la carrera, buzo o calza). 15 min + 5 min de preguntas.',
      'Datos del centro y población intervenida.',
      'Experiencia personal y reflexión: funciones, valores, experiencia con la planificación, entorno de práctica, asignaturas integradas, descripción del/la tutor/a y del grupo, situaciones que sorprendieron, aspectos a mejorar y propuestas.',
    ],
    aspectosFormales: [
      'Soporte visual (PPT/Canva/Prezi/cápsula de video).',
      'Vestimenta institucional de la carrera.',
      'Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Puntaje ideal 42. Criterios ×2: poder de síntesis (1.4) y asignaturas de integración (2.4).',
      'Valore la profundidad de la reflexión y la integración de asignaturas teóricas a la práctica.',
      'Considere la claridad, el lenguaje técnico y la calidad de las propuestas de mejora.',
    ],
    criterios: [
      cr('c11', 'Entrega la presentación en la fecha indicada.'),
      cr('c12', 'Cumple con todos los requisitos de la presentación descritos en la consigna.'),
      cr('c13', 'Desarrolla todas las partes de la presentación solicitadas en la consigna.'),
      cr('c14', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.', true),
      cr('c15', 'Utiliza lenguaje técnico y formal en su presentación.'),
      cr('c16', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      cr('c21', 'Explica las funciones realizadas en el centro de práctica de manera breve.'),
      cr('c22', 'Entrega antecedentes importantes en relación a la planificación ejecutada.'),
      cr('c24', 'Identifica de manera clara las asignaturas de integración dentro de la práctica.', true),
      cr('c25', 'Su reflexión del centro de práctica es clara y coherente.'),
      cr('c26', 'Realiza una introspección indicando sus aspectos a mejorar como futuro entrenador/a.'),
      cr('c27', 'Otorga propuestas de mejora y sugerencias claras en relación a la asignatura.'),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // 4 · PORTAFOLIO — 3 evaluaciones (parte del 20% de supervisión)
  //     Rúbrica E/B/S/D · ideales 36 / 27 / 30
  // ═══════════════════════════════════════════════════════════
  const BITACORA_FULL = [
    cr('b1', 'Mantiene la bitácora actualizada.'),
    cr('b2', 'Anota el día, hora de inicio y término de la sesión.'),
    cr('b3', 'Identifica los objetivos de cada sesión.'),
    cr('b4', 'Describe las actividades de cada sesión en un orden lógico (inicio, desarrollo, final).'),
    cr('b5', 'Se identifican las actividades realizadas por él/la estudiante.'),
    cr('b6', 'Utiliza lenguaje técnico para describir el objetivo y la sesión de entrenamiento.'),
    cr('b7', 'Utiliza un lenguaje inclusivo y de equidad de género en su redacción.'),
    cr('b8', 'Mantiene una redacción gramatical coherente y sin faltas de ortografía.'),
    cr('b9', 'Realiza observaciones técnicas con actitud de indagación, usando conocimiento de asignaturas teóricas.'),
  ];
  const PORT1 = {
    id: 'PORT1', grupo: 'portafolio', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT1',
    titulo: 'Portafolio — Evaluación N°1 (Construcción + Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Construcción',
    fecha: '2025-10-08', semana: 6, estado: 'pendiente', maxPuntos: 36, ponderacion: 0,
    descripcion: 'Construcción del portafolio en DRIVE con todas las carpetas indicadas y registro diario de la bitácora.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Construir el portafolio "PRÁCTICA III - NOMBRE APELLIDO" con todas las carpetas indicadas.',
      'Compartir el portafolio al/la supervisor/a con opción de edición.',
      'Registrar diariamente las sesiones en la bitácora.',
    ],
    instrucciones: [
      'Crear y compartir la carpeta DRIVE (editable) el miércoles 24-09 con todas las carpetas: Informe, Planificación, Presentación, Bitácora, Evaluaciones, Anexos.',
      'Mantener la bitácora (Excel proporcionado) con el registro diario de las acciones del centro.',
    ],
    aspectosFormales: ['Carpeta DRIVE editable con el nombre correcto.', 'Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 36 (Construcción 3 criterios + Bitácora 9 criterios). Se promedia con la supervisión en terreno (20%).'],
    criterios: [
      cr('c11', 'Construye el portafolio en la fecha indicada, con el nombre correcto descrito en la consigna.'),
      cr('c12', 'Comparte el portafolio al/la profesor/a supervisor/a en formato editar.'),
      cr('c13', 'Incluye todas las carpetas descritas en la tabla de la consigna de portafolio.'),
      ...BITACORA_FULL,
    ],
  };
  const PORT2 = {
    id: 'PORT2', grupo: 'portafolio', numero: 2, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT2',
    titulo: 'Portafolio — Evaluación N°2 (Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Aleatoria',
    fecha: '2025-10-22', semana: 8, estado: 'pendiente', maxPuntos: 27, ponderacion: 0,
    descripcion: 'Revisión aleatoria del registro diario de la bitácora durante el semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Mantener actualizado el registro diario de la bitácora en cualquier momento del semestre.'],
    instrucciones: ['Tener actualizado el archivo Excel con el registro diario de las acciones del centro de práctica.'],
    aspectosFormales: ['Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 27 (Bitácora, 9 criterios). Se promedia con la supervisión en terreno (20%).'],
    criterios: [...BITACORA_FULL],
  };
  const PORT3 = {
    id: 'PORT3', grupo: 'portafolio', numero: 3, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT3',
    titulo: 'Portafolio — Evaluación N°3 (Carga completa + Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Cierre',
    fecha: '2025-11-28', semana: 14, estado: 'pendiente', maxPuntos: 30, ponderacion: 0,
    descripcion: 'Carga de la totalidad de documentos del portafolio y registro completo de la bitácora al cierre del semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Cargar todos los documentos en las fechas estipuladas.', 'Completar la bitácora con todas las sesiones realizadas.'],
    instrucciones: ['Cargar la totalidad de los documentos indicados en la consigna (viernes 28-11, 12:00) y tener el registro completo de la bitácora.'],
    aspectosFormales: ['Todos los documentos cargados.', 'Bitácora completa.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 30 (Carga completa 1 criterio + Bitácora 9 criterios). Se promedia con la supervisión en terreno (20%).'],
    criterios: [
      cr('c11', 'Tiene cargados todos los documentos descritos en la consigna de portafolio y en las fechas estipuladas.'),
      ...BITACORA_FULL,
    ],
  };
  const PORTAFOLIO_EVAL_IDS = ['PORT1', 'PORT2', 'PORT3'];

  const EVALUACIONES = [INFORME, PLANIFICACION, PRESENTACION, PORT1, PORT2, PORT3];

  // ═══════════════════════════════════════════════════════════
  // SUPERVISIÓN EN TERRENO — área única (fitness) · 2 modos
  // ═══════════════════════════════════════════════════════════
  const TERRENO_FORMALES = [
    cr('f1', 'Asiste puntualmente a la sesión y cumple con el horario establecido.', true),
    cr('f2', 'Utiliza vestimenta deportiva acorde al contexto, identificándose con el uniforme de la carrera o del centro.'),
    cr('f3', 'Presenta planificación clara y ordenada de la sesión (o la parte solicitada), o realiza activamente las actividades planificadas por el/la tutor/a.'),
  ];
  const DISC_PARTICIPA = [
    cr('d1', 'Demuestra las actividades y/o ejercicios correctamente, utilizando su cuerpo.'),
    cr('d2', 'Se preocupa de corregir constantemente las ejecuciones de sus dirigidos, aplicando claves de corrección y/o refuerzos positivos.'),
    cr('d3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    cr('d4', 'Utiliza un tono de voz adecuado que permite escuchar claramente voces de mando, instrucciones y correcciones.'),
    cr('d5', 'Demuestra seguridad al explicar, corregir y dirigirse al grupo o al deportista.'),
  ];
  const DISC_OBSERVA = [
    cr('o1', 'Se encuentra observando la sesión, atento/a a las necesidades del/la entrenador/a tutor/a.'),
    cr('o2', 'Se demuestra proactivo/a preguntando durante la sesión si se necesita apoyo, ofreciendo asistencia.'),
  ];

  const AREAS = {
    fitness: {
      id: 'fitness', label: 'Fitness / Actividad física', desc: 'Intervención en club, gimnasio, centro de entrenamiento o corporación municipal.',
      modos: {
        part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', ideal: 36, escala: ESCALA_TERR_PART, disc: DISC_PARTICIPA },
        obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', ideal: 24, escala: ESCALA_TERR_OBS,  disc: DISC_OBSERVA },
      },
    },
  };
  function areaDef(area) { return AREAS[area] || AREAS.fitness; }
  function modosDeArea(area) { return Object.values(areaDef(area).modos); }
  function modoDef(area, modo) { const a = areaDef(area); return a.modos[modo] || a.modos[Object.keys(a.modos)[0]]; }
  function terrenoCriterios(area, modo) { return [...TERRENO_FORMALES, ...modoDef(area, modo).disc]; }

  function notaTerrenoVisita(area, v) {
    if (!v || !v.resp) return { nota: null, parcial: true, puntos: null, ideal: modoDef(area, v && v.modo).ideal };
    const md = modoDef(area, v.modo);
    const crit = terrenoCriterios(area, v.modo);
    let total = 0, answered = 0;
    crit.forEach(c => { const k = v.resp[c.id]; if (!k) return; const ni = NIVELES_APREC.find(n => n.key === k); if (!ni) return; total += ni.pts * (c.doble ? 2 : 1); answered++; });
    const parcial = answered < crit.length;
    const nota = parcial ? null : window.USACH_CALC.notaFromEscala(md.escala, total);
    return { nota, parcial, puntos: total, ideal: md.ideal };
  }

  // Supervisión (20%) = promedio de las visitas en terreno + las 3 evaluaciones del portafolio.
  function notaSupervisorP3(estId, state) {
    const est = (state.estudiantes || ESTUDIANTES).find(e => e.id === estId) || {};
    const area = est.area || 'fitness';
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
  // EVALUACIÓN ENTRENADOR/A TUTOR/A (20%) — frecuencia · ideal 44
  // ═══════════════════════════════════════════════════════════
  const TUTOR_DIMENSIONES = [
    { id: 't1', label: '1. Aspectos formales', indicadores: [
      { id: 't11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su entrenador/a o profesor/a tutor/a.' },
      { id: 't12', texto: 'Asiste puntualmente a todas las sesiones y actividades programadas, cumpliendo con el horario establecido.' },
      { id: 't13', texto: 'Respeta las normas y cumple con los protocolos establecidos en el centro de práctica.' },
    ]},
    { id: 't2', label: '2. Aspectos disciplinares', indicadores: [
      { id: 't21', texto: 'Participa activamente de los entrenamientos, realizando intervenciones, apoyando las sesiones y/o desarrollando las tareas solicitadas.' },
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

  // ───────────────────────────────────────────────────────────
  // Estructura (sin datos de ejemplo) — roster vacío
  // ───────────────────────────────────────────────────────────
  const ESTUDIANTES = [];
  const PROFESORES = [];
  const ANEXOS_ADMIN = [
    { id: 'a1', titulo: 'Calendario Académico Práctica III', desc: 'Fechas de cargas del portafolio, informe, planificación y presentación final.', tipo: 'PDF', tamano: '0.4 MB' },
    { id: 'a2', titulo: 'Formato de Bitácora (Excel)', desc: 'Planilla de registro diario de sesiones del centro de práctica.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a3', titulo: 'Plantilla de Planificación (Excel)', desc: 'Hoja de cálculo base para la planificación de 8 sesiones.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a4', titulo: 'Consentimiento Informado del Centro', desc: 'Autorización del centro de práctica.', tipo: 'PDF', tamano: '0.2 MB' },
    { id: 'a5', titulo: 'Declaración Individual de Accidentes Personales', desc: 'Documento obligatorio para actividades en terreno.', tipo: 'PDF', tamano: '0.3 MB' },
  ];

  const PONDERACIONES = [
    { id: 'q1', label: 'Informe (Descripción admin. y técnica)', componentes: ['INF'], peso: 0.20 },
    { id: 'q2', label: 'Planificación de entrenamiento',        componentes: ['PLAN'], peso: 0.20 },
    { id: 'q3', label: 'Presentación Final',                    componentes: ['PRES'], peso: 0.20 },
    { id: 'q4', label: 'Eval. Entrenador/a Tutor/a',            resolver: 'TUTOR', peso: 0.20 },
    { id: 'q5', label: 'Supervisión + Portafolio',             resolver: 'SUP',   peso: 0.20 },
  ];

  function buildPracticaIII() {
    return {
      meta: {
        codigo: 'III',
        nombre: 'Práctica III',
        cursoTitulo: 'Práctica III — Intervención en Fitness y Actividad Física',
        breadcrumb: 'Práctica III',
        semestre: 'Semestre 2025-2',
        escuela: 'Facultad de Ciencias Médicas · Entrenador Deportivo',
        kind: 'fitness',
        terreno: true,
        supervisorScreen: 'P3',
        areaLabel: 'Fitness / Actividad física',
      },
      NIVELES: { NIVELES_EBSD, NIVELES_PLANIF, NIVELES_APREC, NIVELES_FREC, NIVELES_SUPERVISOR: NIVELES_FREC },
      ESCALAS: { ESCALA_INFORME, ESCALA_PLANIF, ESCALA_PRESENT, ESCALA_TUTOR, ESCALA_PORT1, ESCALA_PORT2, ESCALA_PORT3, ESCALA_TERR_PART, ESCALA_TERR_OBS },
      GRUPOS: [
        { id: 'documento', label: 'Entregas evaluativas', singular: 'Entrega', sigla: 'E', color: 'teal',
          desc: 'Informe (20%), Planificación (20%) y Presentación Final (20%) · rúbrica con exigencia 60%' },
        { id: 'portafolio', label: 'Portafolio', singular: 'Portafolio', sigla: 'P', color: 'orange',
          desc: 'Tres evaluaciones de portafolio y bitácora · se promedian con la supervisión en terreno (20%)' },
      ],
      EVALUACIONES,
      PONDERACIONES,
      PORTAFOLIO_EVAL_IDS,
      // Instrumentos de proceso
      SUPERVISOR: { kind: 'fitness', areas: AREAS, formales: TERRENO_FORMALES, terrenoCriterios, notaTerrenoVisita,
                    tutorDimensiones: TUTOR_DIMENSIONES, nivelesKey: 'NIVELES_APREC' },
      TUTOR: { dimensiones: TUTOR_DIMENSIONES, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_TUTOR', maxPuntos: 44 },
      ANEXOS_ADMIN,
      ESTUDIANTES, PROFESORES,
      NOTAS_COLUMNS: [
        { key: 'INF',  label: 'Informe',   sub: '20%', kind: 'eval', evalId: 'INF',  color: 'teal' },
        { key: 'PLAN', label: 'Planif.',   sub: '20%', kind: 'eval', evalId: 'PLAN', color: 'teal' },
        { key: 'PRES', label: 'Present.',  sub: '20%', kind: 'eval', evalId: 'PRES', color: 'teal' },
        { key: 'TUTOR', label: 'Tutor',    sub: '20%', kind: 'tutor' },
        { key: 'SUP', label: 'Superv.+Port', sub: '20%', kind: 'sup' },
      ],
      RESOLVERS: {
        SUP: (estId, state) => notaSupervisorP3(estId, state),
        TUTOR: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.tutor && state.tutor[estId], TUTOR_DIMENSIONES, NIVELES_FREC, ESCALA_TUTOR);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
      },
      // helpers expuestos a las pantallas P3
      AREAS, areaDef, modosDeArea, modoDef, terrenoCriterios, notaTerrenoVisita, notaSupervisorP3,
      TUTOR_DIMENSIONES,
      initialState: () => ({
        evaluaciones: EVALUACIONES.map(e => ({ ...e })),
        estudiantes: [],
        niveles: {}, atrasos: {}, terreno: {}, tutor: {},
        supervisor: {}, supervisorComments: {}, autoevalComments: {}, evalFeedback: {}, evalAnexos: {},
      }),
    };
  }

  window.registerPractica('III', buildPracticaIII);
})();
