// data-p3.js — Práctica Profesional I · "Integración al Campo Profesional"
// Se registra como 'PI' en el registro de prácticas definido en data.js.
// Práctica profesional en un centro real, con entrenador/a tutor/a, supervisión
// en terreno (3 áreas: deportiva / ciencias / gestión), portafolio + bitácora,
// proyecto de mejora y reflexión. Documentos fuente: consignas 2026.

(function () {
  // ───────────────────────────────────────────────────────────
  // Escala 60% de exigencia generada (1,0 → 0 pts · 4,0 → 60% · 7,0 → 100%)
  // Reproduce las tablas oficiales de las consignas (verificado).
  // ───────────────────────────────────────────────────────────
  function linScale(ideal) {
    const o = {}; const corte = 0.6 * ideal;
    for (let p = 0; p <= ideal; p++) {
      let nota = p <= corte ? 1 + (p / corte) * 3 : 4 + ((p - corte) / (ideal - corte)) * 3;
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
  const ESCALA_INF_DEP = linScale(51);
  const ESCALA_INF_FUN = linScale(36);
  const ESCALA_PROYECTO = linScale(104);
  const ESCALA_PORT = linScale(33);
  const ESCALA_TUTOR = linScale(68);
  const ESCALA_AUTO = linScale(68);
  const ESCALA_SEMESTRAL = linScale(36);

  const RA = 'Integrar equipos multidisciplinarios demostrando dominio de las competencias profesionales del rol de entrenador deportivo en una o varias disciplinas deportivas, desarrollando un proyecto de mejora enfocado en el centro de práctica, asumiendo una postura ética y profesional.';

  const cr = (id, texto, doble) => ({ id, texto, doble: !!doble });

  // ═══════════════════════════════════════════════════════════
  // INFORME — Estructura Organizacional y Descripción del Deporte (15%)
  // Rúbrica doble: modalidad DEPORTE (51 pts) o FUNCIONES (36 pts).
  // ═══════════════════════════════════════════════════════════
  const INF_SEC123 = [
    cr('c11', 'Entrega el informe en la fecha indicada.'),
    cr('c12', 'Cumple con todos los requisitos del informe descritos en la consigna.'),
    cr('c13', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
    cr('c14', 'Utiliza lenguaje técnico acorde al informe de práctica.'),
    cr('c15', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
    cr('c21', 'Entrega antecedentes concretos de la institución donde realiza la práctica.'),
    cr('c22', 'Presenta el organigrama completo del centro de manera gráfica y se ubica correctamente dentro de él.'),
    cr('c23', 'Formula un análisis FODA concreto del lugar de práctica, con un mínimo de 2 características por cada ítem.'),
    cr('c31', 'Reflexiona desarrollando los 3 puntos asociados a la reflexión inicial del centro de práctica.'),
  ];
  const INF_DEPORTE = [
    ...INF_SEC123,
    cr('c41', 'Describe clara y brevemente el deporte (medidas del lugar, duración y pruebas) con imágenes ilustrativas.'),
    cr('c42', 'Identifica y describe las capacidades físicas predominantes y las vías energéticas, argumentando con al menos 2 publicaciones científicas.', true),
    cr('c43', 'Averigua y describe la estructura del ranking nacional del deporte.'),
    cr('c44', 'Investiga los/las deportistas chilenos/as con ranking nacional 1° y 2° lugar e internacional (o la selección nacional en deportes colectivos).'),
    cr('c45', 'Investiga los rankings mundial, panamericano y sudamericano, indicando país y deportista en primer lugar y la ubicación del/la mejor chileno/a.'),
    cr('c46', 'Averigua la mejor posición del centro como club/selección y describe los campeonatos en que participa.'),
    cr('c47', 'Averigua si el deporte se ejecuta en el ámbito Paralímpico y nombra el mejor exponente dama y varón de Chile.'),
  ];
  const INF_FUNCIONES = [
    ...INF_SEC123,
    cr('c51', 'Describe de manera clara las funciones que desarrolla en el centro de práctica.'),
    cr('c52', 'Identifica el objetivo principal de las funciones que ejecuta en el centro de práctica.'),
    cr('c53', 'Identifica quiénes son los beneficiarios de las funciones ejecutadas.'),
  ];

  const INFORME = {
    id: 'INF', grupo: 'documento', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_INF_DEP',
    titulo: 'Informe: Estructura Organizacional y Descripción del Deporte', tipo: 'Informe (Word)', duracion: 'Máx. 8 pp.',
    fecha: '2026-05-27', estado: 'corregida', maxPuntos: 51, ponderacion: 0.15,
    descripcion: 'Indaga la estructura organizacional y el funcionamiento del centro de práctica, describiendo la disciplina o función a intervenir, los métodos de entrenamiento y los usuarios.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Diagnosticar la estructura organizacional del centro de práctica (descripción, misión/visión, objetivo, organigrama y FODA).',
      'Reflexionar inicialmente sobre expectativas, temores y habilidades a desarrollar en la práctica.',
      'Describir técnicamente el deporte (rankings, capacidades físicas, exponentes) o, si no es deporte, las funciones del cargo.',
    ],
    instrucciones: [
      'Cargar en el portafolio DRIVE/MOODLE en formato Word con opción de edición.',
      'Datos del centro: nombre, dirección-comuna, profesor tutor, actividad/función, edad de beneficiarios, días y horarios.',
      'Estructura organizacional: descripción, años en el deporte, misión/visión, objetivo general, organigrama (ubicándose) y FODA (2 características por ítem).',
      'Reflexión inicial: expectativas, miedos o preocupaciones, y habilidades a desarrollar.',
      'Descripción del deporte (cuando corresponda) o de las funciones (cuando la práctica no se realice en deporte).',
    ],
    aspectosFormales: [
      'Portada con logo USACH, Facultad/Escuela/Carrera y datos del centro y estudiante.',
      'Hoja carta, letra Arial o Calibri 10, espaciado 1.5, texto justificado; títulos en negrita 12.',
      'Tablas/gráficos auto explicativos y enumerados; bibliografía en orden alfabético o numérico.',
      'No sobrepasar las 8 hojas totales. Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Rúbrica DEPORTE (puntaje ideal 51): evalúa secciones 1, 2, 3 y 4 (descripción del deporte). El criterio de capacidades físicas pondera ×2.',
      'Rúbrica FUNCIONES (puntaje ideal 36): para prácticas que NO se realizan en un deporte, reemplaza la sección 4 por la 5 (descripción de funciones).',
      'Verifique que el FODA tenga 2 características por ítem y que el/la estudiante se ubique correctamente en el organigrama.',
    ],
    criterios: INF_DEPORTE,
    // metadatos de modalidad (la sección 5 se documenta para prácticas sin deporte)
    modalidades: {
      deporte:   { label: 'Deporte', maxPuntos: 51, escalaKey: 'ESCALA_INF_DEP', criterios: INF_DEPORTE },
      funciones: { label: 'Funciones (sin deporte)', maxPuntos: 36, escalaKey: 'ESCALA_INF_FUN', criterios: INF_FUNCIONES },
    },
  };

  // ═══════════════════════════════════════════════════════════
  // PROYECTO DE MEJORA + PRESENTACIÓN + REFLEXIÓN (30%)
  // Escala de apreciación L/ML/NL/I/NO · ideal 104
  // ═══════════════════════════════════════════════════════════
  const PROYECTO = {
    id: 'PRO', grupo: 'documento', numero: 2, nivelesKey: 'NIVELES_APREC', escalaKey: 'ESCALA_PROYECTO',
    titulo: 'Proyecto de Mejora, Presentación y Reflexión', tipo: 'Informes + Presentación', duracion: '15 min + 5 preguntas',
    fecha: '2026-06-24', estado: 'en-evaluacion', maxPuntos: 104, ponderacion: 0.30,
    descripcion: 'Proyecto de mejora para el centro de práctica más la reflexión de la intervención del semestre, entregados como informe escrito y presentación.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Detectar problemáticas del centro y desarrollar un proyecto de mejora (justificación, diagnóstico, objetivo, destinatarios, actividades y presupuesto).',
      'Reflexionar sobre la experiencia personal de la intervención y la relación con el/la tutor/a.',
      'Comunicar el proyecto y la reflexión en una presentación clara y técnica.',
    ],
    instrucciones: [
      'Proyecto de mejora: título, justificación, diagnóstico (árbol de problemas/FODA), objetivo general, destinatarios, actividades y presupuesto.',
      'Reflexión: datos del centro, funciones desarrolladas, fortalezas/debilidades, aprendizajes para el 2° semestre y experiencia con el/la tutor/a.',
      'Cargar los 2 informes (Word editable) en el portafolio el 24-06; la presentación el 02-07.',
      'Presentación en PPT/Canva/Prezi, vestimenta institucional, 15 min + 5 min de preguntas.',
    ],
    aspectosFormales: [
      'Letra Arial 10; títulos en mayúscula, subtítulos tipo oración, en negrilla.',
      'Tapa con logo USACH e identificación completa.',
      'Proyecto de Mejora: máx. 10 planas; Reflexión: máx. 2 planas (sin contar tapa).',
      'Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Puntaje ideal 104. Criterios ×2: síntesis (1.3), problema (2.1), solución (2.4), actividades (2.6), presupuesto (2.7), reflexión crítica (3.2) y aprendizajes 2° semestre (3.6).',
      'El diagnóstico debe sustentarse en una herramienta concreta (árbol de problemas, FODA o entrevistas).',
      'Valore la coherencia entre problema → objetivo → actividades → presupuesto.',
    ],
    criterios: [
      cr('c11', 'Cumple con todos los requisitos de presentación descritos en la consigna.'),
      cr('c12', 'Desarrolla todas las partes de la presentación solicitadas en la consigna.'),
      cr('c13', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.', true),
      cr('c14', 'Utiliza lenguaje técnico y formal en su presentación.'),
      cr('c15', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      cr('c16', 'Utiliza polera o polerón de la carrera, además de buzo o calza deportiva.'),
      cr('c17', 'La presentación es atractiva, se apoya con imágenes, tablas o gráficos.'),
      cr('c21', 'Identifica claramente el problema o necesidad a resolver en el proyecto.', true),
      cr('c22', 'Elabora un análisis reflexivo utilizando árbol de problemas, FODA o entrevistas.'),
      cr('c23', 'El objetivo general está bien planteado y se relaciona con el problema.'),
      cr('c24', 'La solución o propuesta se relaciona directamente con la problemática y está claramente explicada.', true),
      cr('c25', 'Identifica a los beneficiarios directos e indirectos y el impacto del proyecto.'),
      cr('c26', 'Las actividades están vinculadas estrechamente con el objetivo general del proyecto.', true),
      cr('c27', 'Describe los costos del proyecto y su factibilidad.', true),
      cr('c31', 'Explica las funciones realizadas en el centro de práctica de manera breve.'),
      cr('c32', 'La reflexión sobre sus aspectos a mejorar es crítica y plantea estrategias de mejora.', true),
      cr('c33', 'Entrega antecedentes importantes en relación a las funciones realizadas en el centro.'),
      cr('c34', 'Su reflexión del centro de práctica y de su entrenador/a tutor/a es clara y coherente.'),
      cr('c35', 'Identifica de manera clara las habilidades y conocimientos a adquirir para un mejor desempeño en el 2° semestre.', true),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // PORTAFOLIO — Construcción + Bitácora (parte del 25% de supervisión)
  // Escala E/B/S/D · ideal 33
  // ═══════════════════════════════════════════════════════════
  const PORTAFOLIO = {
    id: 'PORT', grupo: 'portafolio', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT',
    titulo: 'Portafolio Virtual y Bitácora', tipo: 'Portafolio (Drive)', duracion: 'Construcción + Bitácora',
    fecha: '2026-05-07', estado: 'corregida', maxPuntos: 33, ponderacion: 0,
    descripcion: 'Construcción del portafolio en DRIVE y registro diario de las acciones del centro de práctica en la bitácora, revisado en las supervisiones en terreno.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Construir el portafolio "PRÁCTICA PROFESIONAL - NOMBRE APELLIDO" con todas las carpetas indicadas.',
      'Compartir el portafolio al/la supervisor/a con opción de edición.',
      'Registrar diariamente las sesiones y funciones en la bitácora.',
    ],
    instrucciones: [
      'Carpeta compartida al/la supervisor/a con opción de edición, con todas las carpetas de la consigna.',
      'Cargar cada documento (Informe, Proyecto, Presentación, Evaluaciones, Anexos) en su carpeta y fecha.',
      'Completar la bitácora (Excel proporcionado por los docentes) con el registro diario.',
    ],
    aspectosFormales: ['Carpeta DRIVE editable con el nombre correcto.', 'Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: [
      'Puntaje ideal 33 (Construcción 3 criterios + Bitácora 8 criterios). Esta nota se promedia con las visitas en terreno para formar el 25% de supervisión.',
      'Verifique que el portafolio esté compartido con permiso de edición y contenga todas las carpetas.',
    ],
    criterios: [
      cr('c11', 'Construye el portafolio en la fecha indicada, con el nombre correcto descrito en la consigna.'),
      cr('c12', 'Comparte el portafolio al/la profesor/a supervisor/a en formato editar.'),
      cr('c13', 'Incluye todas las carpetas descritas en la tabla de la consigna de portafolio.'),
      cr('b1', 'Mantiene la bitácora actualizada.'),
      cr('b2', 'Anota el día, hora de inicio y término de la sesión u horario de práctica.'),
      cr('b3', 'Identifica los objetivos metodológicos generales y específicos de cada sesión o jornada.'),
      cr('b4', 'Utiliza lenguaje técnico para describir los objetivos de la sesión o jornada.'),
      cr('b5', 'Describe las funciones realizadas en cada sesión o jornada de práctica.'),
      cr('b6', 'Utiliza un lenguaje inclusivo y de equidad de género en su redacción.'),
      cr('b7', 'Mantiene una redacción gramatical coherente y sin faltas de ortografía.'),
      cr('b8', 'Realiza observaciones de carácter técnico con actitud de indagación, usando conocimiento de asignaturas teóricas.'),
    ],
  };

  const EVALUACIONES = [INFORME, PROYECTO, PORTAFOLIO];

  // ═══════════════════════════════════════════════════════════
  // SUPERVISIÓN EN TERRENO — 3 áreas, formales comunes + disciplinares
  // ═══════════════════════════════════════════════════════════
  const TERRENO_FORMALES = [
    cr('f1', 'Asiste puntualmente a la sesión y cumple con el horario establecido.', true),
    cr('f2', 'Utiliza de manera consistente vestimenta deportiva adecuada, identificándose con el uniforme de la carrera o del centro.', true),
    cr('f3', 'Presenta planificación clara y ordenada de la sesión (o parte solicitada), o realiza activamente las actividades planificadas por el/la tutor/a.'),
  ];
  const DISC_DEPORTIVA = [
    cr('d1', 'Demuestra las actividades y/o ejercicios correctamente, utilizando su cuerpo.'),
    cr('d2', 'Corrige constantemente las ejecuciones de sus dirigidos, aplicando claves de corrección y/o refuerzos positivos.'),
    cr('d3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    cr('d4', 'Los ejercicios presentados se articulan en una secuencia metodológica coherente con los objetivos.'),
    cr('d5', 'Organiza las actividades de forma óptima, aprovechando el espacio y los recursos materiales.'),
    cr('d6', 'Utiliza un tono de voz adecuado que permite escuchar claramente instrucciones y correcciones.'),
    cr('d7', 'Entrega instrucciones con un lenguaje técnico claro y adecuado a las características de los/las deportistas.'),
    cr('d8', 'Demuestra seguridad al explicar, corregir y dirigirse al grupo o al deportista.'),
  ];
  const DISC_CIENCIAS = [
    cr('cd1', 'Entrega instrucciones con un lenguaje técnico claro y adecuado al contexto de la medición.'),
    cr('cd2', 'Se preocupa de corregir la ejecución según el protocolo establecido.'),
    cr('cd3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    cr('cd4', 'Organiza las actividades indicadas de forma óptima, aprovechando el espacio y los recursos.'),
    cr('cd5', 'Utiliza un tono de voz adecuado que permite escuchar claramente instrucciones y correcciones.'),
    cr('cd6', 'Entrega instrucciones con un lenguaje técnico adecuado al contexto de la medición.'),
    cr('cd7', 'Demuestra seguridad al explicar, corregir y dirigirse al grupo o deportista de la medición.'),
  ];
  const DISC_GESTION = [
    cr('g1', 'Demuestra preparación de los contenidos que le solicitan en el centro de práctica.'),
    cr('g2', 'Demuestra seguridad al explicar y dirigirse al grupo en el cual se encuentra trabajando.'),
    cr('g3', 'Se demuestra proactivo/a preguntando y ofreciendo asistencia o realizando funciones propias de su rol.'),
    cr('g4', 'Organiza las actividades solicitadas por el centro de forma óptima, siendo eficiente y eficaz.'),
  ];
  const OBSERVACION = [
    cr('o1', 'Se encuentra observando la sesión, atento/a a las necesidades del/la entrenador/a tutor/a.'),
    cr('o2', 'Se demuestra proactivo/a preguntando durante la sesión si se necesita apoyo, ofreciendo asistencia.'),
  ];

  const AREAS = {
    deportiva: {
      id: 'deportiva', label: 'Deportiva', desc: 'Práctica profesional deportiva (entrenamiento).',
      modos: {
        part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', ideal: 52, escala: linScale(52), disc: DISC_DEPORTIVA },
        obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', ideal: 28, escala: linScale(28), disc: OBSERVACION },
      },
    },
    ciencias: {
      id: 'ciencias', label: 'Ciencias del Deporte', desc: 'Práctica en el área de ciencias del deporte (mediciones/evaluaciones).',
      modos: {
        part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', ideal: 48, escala: linScale(48), disc: DISC_CIENCIAS },
        obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', ideal: 28, escala: linScale(28), disc: OBSERVACION },
      },
    },
    gestion: {
      id: 'gestion', label: 'Gestión Deportiva', desc: 'Práctica en gestión deportiva (funciones administrativas/organizacionales).',
      modos: {
        unico: { id: 'unico', label: 'Supervisión', sigla: 'G', ideal: 36, escala: linScale(36), disc: DISC_GESTION },
      },
    },
  };
  function areaDef(area) { return AREAS[area] || AREAS.deportiva; }
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

  // Supervisión (25%) = promedio de visitas en terreno + nota del portafolio (Construcción + Bitácora).
  function notaSupervisorPI(estId, state) {
    const est = (state.estudiantes || ESTUDIANTES).find(e => e.id === estId) || {};
    const area = est.area || 'deportiva';
    const visitas = (state.terreno && state.terreno[estId]) || [];
    const notas = []; let parcial = false;
    visitas.forEach(v => { const r = notaTerrenoVisita(area, v); if (r.nota != null) notas.push(r.nota); else parcial = true; });
    const port = window.USACH_CALC.calcNotaEvaluacion(PORTAFOLIO, state.niveles['PORT'] && state.niveles['PORT'][estId], state.atrasos['PORT'] && state.atrasos['PORT'][estId]);
    if (port && !port.parcial) notas.push(port.notaFinal); else parcial = true;
    if (notas.length === 0) return { nota: null, parcial: true };
    const nota = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10;
    return { nota, parcial };
  }

  // ═══════════════════════════════════════════════════════════
  // EVALUACIÓN ENTRENADOR/A TUTOR/A (25%) — frecuencia · ideal 68
  // ═══════════════════════════════════════════════════════════
  const TUTOR_DIMENSIONES = [
    { id: 't1', label: '1. Aspectos formales', indicadores: [
      { id: 't11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su entrenador/a o profesor/a tutor/a.' },
      { id: 't12', texto: 'Asiste puntualmente a todas las sesiones y actividades programadas, cumpliendo con el horario establecido.' },
      { id: 't13', texto: 'Respeta las normas y cumple con los protocolos establecidos en el centro de práctica.' },
      { id: 't14', texto: 'Realiza las horas de práctica (12 hrs pedagógicas semanales; 180 hrs pedagógicas totales).' },
      { id: 't15', texto: 'Participa vestido/a de manera acorde a su rol (uniforme institucional de la carrera o del centro).' },
    ]},
    { id: 't2', label: '2. Aspectos disciplinares', indicadores: [
      { id: 't21', texto: 'Participa activamente de los entrenamientos, realizando intervenciones y apoyando las sesiones.' },
      { id: 't22', texto: 'Demuestra correctamente los ejercicios, utilizando su lenguaje corporal en diferentes planos.' },
      { id: 't23', texto: 'Se preocupa de corregir las ejecuciones de sus dirigidos aplicando claves de corrección.' },
      { id: 't24', texto: 'Demuestra conocimiento y preparación de los contenidos que le corresponde desarrollar.' },
      { id: 't25', texto: 'Entrega instrucciones con un lenguaje claro y adecuado a las características de los/las deportistas.' },
      { id: 't26', texto: 'Adapta su planificación a situaciones emergentes y/o al nivel de dificultad de los deportistas.' },
      { id: 't27', texto: 'Organiza y gestiona eficientemente el grupo, optimizando tiempos y recursos durante la sesión.' },
    ]},
    { id: 't3', label: '3. Aspectos actitudinales', indicadores: [
      { id: 't31', texto: 'Responde a las tareas y/o actividades solicitadas en los tiempos acordados.' },
      { id: 't32', texto: 'Manifiesta interés, iniciativa y motivación por aprender y adquirir nuevos conocimientos.' },
      { id: 't33', texto: 'Mantiene una actitud respetuosa y de cordialidad con el equipo de trabajo y deportistas a su cargo.' },
      { id: 't34', texto: 'Acepta la crítica y las sugerencias de manera positiva, considerándolas para la mejora de su desempeño.' },
      { id: 't35', texto: 'Actúa con responsabilidad y ética profesional en el contexto de práctica.' },
    ]},
  ];

  // ═══════════════════════════════════════════════════════════
  // AUTOEVALUACIÓN (5%) — frecuencia · ideal 68
  // ═══════════════════════════════════════════════════════════
  const AUTOEVAL_DIMENSIONES = [
    { id: 'a1', label: '1. Responsabilidad y compromiso', indicadores: [
      { id: 'a11', texto: 'Asiste puntualmente a todas las sesiones programadas por su profesor(a) tutor o supervisor(a).' },
      { id: 'a12', texto: 'Cumple en la fecha acordada con los compromisos adquiridos y responsabilidades asignadas.' },
      { id: 'a13', texto: 'Demuestra compromiso con las diferentes labores asignadas procurando realizarlas lo mejor posible.' },
    ]},
    { id: 'a2', label: '2. Solución de problemas', indicadores: [
      { id: 'a21', texto: 'Se comunica oportunamente con el/la tutor y/o supervisor(a) para informar de cualquier imprevisto.' },
      { id: 'a22', texto: 'Resuelve o propone soluciones a situaciones problemáticas desde una perspectiva constructiva.' },
      { id: 'a23', texto: 'Identifica sus debilidades y es capaz de solicitar ayuda para superar dificultades.' },
    ]},
    { id: 'a3', label: '3. Participación activa', indicadores: [
      { id: 'a31', texto: 'Participa activamente del proceso de prácticas demostrando interés por adquirir nuevos conocimientos.' },
      { id: 'a32', texto: 'Demuestra proactividad tomando la iniciativa y colaborando con el equipo de trabajo.' },
    ]},
    { id: 'a4', label: '4. Desarrollo disciplinar', indicadores: [
      { id: 'a41', texto: 'Demuestra sus conocimientos y los relaciona con la experiencia práctica para responder a los desafíos del tutor.' },
      { id: 'a42', texto: 'Prepara sus intervenciones con antelación evitando improvisar.' },
      { id: 'a43', texto: 'Demuestra seguridad en su rol dentro de la práctica (indicaciones, manejo de grupo, correcciones).' },
    ]},
    { id: 'a5', label: '5. Comunicación', indicadores: [
      { id: 'a51', texto: 'Comunica sus ideas utilizando un lenguaje verbal y no verbal adecuado al contexto profesional.' },
      { id: 'a52', texto: 'Utiliza un lenguaje técnico apropiado a las características de sus dirigidos y del entorno.' },
    ]},
    { id: 'a6', label: '6. Aspectos actitudinales', indicadores: [
      { id: 'a61', texto: 'Demuestra una conducta respetuosa con las normas de la institución, el equipo y los deportistas.' },
      { id: 'a62', texto: 'Reflexiona permanentemente sobre su desempeño, identificando fortalezas y debilidades.' },
      { id: 'a63', texto: 'Acepta la crítica como oportunidad de desarrollo y aplica las orientaciones recibidas.' },
    ]},
    { id: 'a7', label: '7. Reflexión y desarrollo profesional', indicadores: [
      { id: 'a71', texto: 'Aplica fundamentos básicos de ciencias del deporte (fisiología, metodología del entrenamiento, pedagogía) en su práctica.' },
    ]},
  ];

  // ═══════════════════════════════════════════════════════════
  // EVALUACIÓN SEMESTRAL SUPERVISOR/A (instrumento adicional, ideal 36)
  // Disponible como referencia; no pondera en la nota por defecto.
  // ═══════════════════════════════════════════════════════════
  const SEMESTRAL_DIMENSIONES = [
    { id: 's1', label: '1. Criterios formales', indicadores: [
      { id: 's11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su profesor/a supervisor/a.' },
      { id: 's12', texto: 'Asiste a todas las reuniones de prácticas coordinadas con su supervisor/a (presenciales o virtuales).' },
      { id: 's13', texto: 'Tiene actualizada su bitácora virtual con los objetivos de las sesiones e integra informes/presentaciones en el portafolio.', doble: true },
      { id: 's14', texto: 'Entrega las consignas (informes, proyecto, entre otras) en el plazo indicado por su supervisor/a.' },
    ]},
    { id: 's2', label: '2. Criterios profesionales', indicadores: [
      { id: 's21', texto: 'Participa de las reuniones de práctica de manera activa, generando feedback de su proceso.' },
      { id: 's22', texto: 'Demuestra preparación de los contenidos a desarrollar en las reuniones, evitando improvisar.' },
      { id: 's23', texto: 'Acoge los comentarios y críticas de su supervisor/a de manera respetuosa como oportunidad de desarrollo.' },
      { id: 's24', texto: 'Demuestra una progresión positiva en sus intervenciones, considerando las observaciones de su supervisor/a.' },
    ]},
  ];

  // ───────────────────────────────────────────────────────────
  // Estudiantes (con datos de centro de práctica + área)
  // ───────────────────────────────────────────────────────────
  const ESTUDIANTES = [
    { id: 'e1', rut: '20.118.245-6', nombre: 'Antonia Pérez Vega',     email: 'antonia.perez@usach.cl',  telefono: '+56 9 8245 1192',
      area: 'deportiva', centro: 'Club Deportivo Universidad de Santiago', comuna: 'Estación Central', deporte: 'Vóleibol', categoria: 'Damas Sub-18', tutorCentro: 'Marcela Ríos', dias: 'Lun, Mié y Vie · 18:00–21:00' },
    { id: 'e2', rut: '20.554.873-1', nombre: 'Benjamín Soto Carrasco', email: 'benjamin.soto@usach.cl',   telefono: '+56 9 6712 8403',
      area: 'deportiva', centro: 'Escuela de Fútbol Maipú', comuna: 'Maipú', deporte: 'Fútbol', categoria: 'Varones Sub-16', tutorCentro: 'Jorge Henríquez', dias: 'Mar y Jue · 18:00–20:30' },
    { id: 'e3', rut: '20.901.337-K', nombre: 'Camila Riquelme Núñez',  email: 'camila.riquelme@usach.cl', telefono: '+56 9 9018 5526',
      area: 'ciencias', centro: 'Centro de Rendimiento Deportivo USACH', comuna: 'Estación Central', deporte: 'Evaluación física', categoria: 'Alto rendimiento', tutorCentro: 'Dr. Felipe Aravena', dias: 'Lun a Vie · 09:00–13:00' },
    { id: 'e4', rut: '20.337.901-4', nombre: 'Diego Fuentes Aguilera', email: 'diego.fuentes@usach.cl',   telefono: '+56 9 3344 7710',
      area: 'gestion', centro: 'Corporación Municipal de Deportes de Maipú', comuna: 'Maipú', deporte: 'Gestión deportiva', categoria: 'Programas comunales', tutorCentro: 'Paula Vega', dias: 'Lun, Mié y Vie · 09:00–14:00' },
    { id: 'e5', rut: '20.776.118-9', nombre: 'Francisca Mella Jara',   email: 'francisca.mella@usach.cl', telefono: '+56 9 5567 9821',
      area: 'deportiva', centro: 'Escuela de Natación Estación Central', comuna: 'Estación Central', deporte: 'Natación', categoria: 'Infantil Sub-14', tutorCentro: 'Andrea Soto', dias: 'Lun a Jue · 08:00–10:00' },
  ];
  const PROFESORES = [
    { id: 'p1', nombre: 'Prof. Andrés Tapia Vergara', email: 'andres.tapia@usach.cl', rol: 'Profesor Supervisor', activo: true },
    { id: 'p2', nombre: 'Prof. María Inés Cáceres',   email: 'maria.caceres@usach.cl', rol: 'Profesora Supervisora', activo: true },
  ];
  const ANEXOS_ADMIN = [
    { id: 'a1', titulo: 'Calendario Académico Práctica Profesional I', desc: 'Fechas de cargas del portafolio, supervisiones y presentación final.', tipo: 'PDF', tamano: '0.4 MB' },
    { id: 'a2', titulo: 'Formato de Bitácora (Excel)', desc: 'Planilla de registro diario de sesiones y funciones del centro de práctica.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a3', titulo: 'Consentimiento Informado del Centro', desc: 'Autorización del centro de práctica para la práctica profesional.', tipo: 'PDF', tamano: '0.2 MB' },
    { id: 'a4', titulo: 'Declaración Individual de Accidentes Personales', desc: 'Documento obligatorio para actividades en terreno.', tipo: 'PDF', tamano: '0.3 MB' },
    { id: 'a5', titulo: 'Manual ABCDE — Primeros Auxilios', desc: 'Manual de evaluación y atención inicial.', tipo: 'PDF', tamano: '1.8 MB' },
    { id: 'a6', titulo: 'Protocolo de Salud Mental', desc: 'Protocolo institucional de derivación y acompañamiento.', tipo: 'PDF', tamano: '0.6 MB' },
  ];

  const PONDERACIONES = [
    { id: 'q1', label: 'Informe (Estructura Organizacional)', componentes: ['INF'], peso: 0.15 },
    { id: 'q2', label: 'Proyecto de Mejora + Reflexión',      componentes: ['PRO'], peso: 0.30 },
    { id: 'q3', label: 'Eval. Entrenador/a Tutor/a (centro)', resolver: 'TUTOR', peso: 0.25 },
    { id: 'q4', label: 'Supervisión + Portafolio',           resolver: 'SUP',   peso: 0.25 },
    { id: 'q5', label: 'Autoevaluación',                     resolver: 'AUTO',  peso: 0.05 },
  ];

  // ───────────────────────────────────────────────────────────
  // Generación de datos demo (RNG por clave + sesgo a buenos niveles)
  // ───────────────────────────────────────────────────────────
  function hashUnit(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }
  // weights: probabilidad por índice (de mejor a peor); devuelve la key del set.
  function pickKey(set, seedStr, weights) {
    const x = hashUnit(seedStr);
    let acc = 0;
    for (let i = 0; i < weights.length; i++) { acc += weights[i]; if (x < acc) return set[Math.min(i, set.length - 1)].key; }
    return set[set.length - 1].key;
  }
  const W_EBSD  = [0.46, 0.40, 0.12, 0.02];        // E B S D
  const W_APREC = [0.50, 0.34, 0.12, 0.03, 0.01];  // L ML NL I NO
  const W_FREC  = [0.52, 0.36, 0.10, 0.02, 0.00];  // S CS O CN N
  const FECHAS_VISITA = ['2026-04-15', '2026-05-13', '2026-06-10', '2026-06-25'];

  function genNiveles() {
    const niveles = {}, atrasos = {};
    EVALUACIONES.forEach((ev) => {
      if (ev.estado === 'pendiente') return;
      niveles[ev.id] = {}; atrasos[ev.id] = {};
      const set = ev.nivelesKey === 'NIVELES_APREC' ? NIVELES_APREC : NIVELES_EBSD;
      const weights = ev.nivelesKey === 'NIVELES_APREC' ? W_APREC : W_EBSD;
      ESTUDIANTES.forEach((est, idxEst) => {
        const enEval = ev.estado === 'en-evaluacion';
        if (enEval && idxEst >= 3) return; // en evaluación: solo los 3 primeros
        niveles[ev.id][est.id] = {};
        ev.criterios.forEach((c, idxCr) => {
          if (enEval && idxCr >= Math.ceil(ev.criterios.length * 0.6)) return; // criterios a medio corregir
          niveles[ev.id][est.id][c.id] = pickKey(set, ev.id + est.id + c.id, weights);
        });
        atrasos[ev.id][est.id] = (idxEst === 1 && ev.id === 'PRO') ? 1 : (idxEst === 3 && ev.id === 'INF') ? 1 : 0;
      });
    });
    return { niveles, atrasos };
  }
  function genTerreno() {
    const terreno = {};
    ESTUDIANTES.forEach((est, idxEst) => {
      terreno[est.id] = [];
      const area = est.area;
      const modos = Object.keys(AREAS[area].modos);
      const nVisitas = idxEst < 3 ? 3 : (idxEst === 3 ? 2 : 1);
      for (let i = 0; i < nVisitas; i++) {
        const modo = modos[i % modos.length];
        const completa = !(idxEst === 4 && i === 0); // primera del 5° queda parcial
        const resp = {};
        terrenoCriterios(area, modo).forEach((c, ci) => {
          if (!completa && ci >= 2) return;
          resp[c.id] = pickKey(NIVELES_APREC, est.id + 'v' + i + c.id, W_APREC);
        });
        terreno[est.id].push({ id: `v${idxEst}_${i}`, fecha: FECHAS_VISITA[i] || FECHAS_VISITA[0], modo, resp });
      }
    });
    return terreno;
  }
  function genInstrumento(dims, set, weights, tag, cubiertos) {
    const out = {};
    ESTUDIANTES.forEach((est, idxEst) => {
      out[est.id] = {};
      if (idxEst >= cubiertos) return; // los últimos quedan pendientes
      dims.forEach(dim => dim.indicadores.forEach(ind => { out[est.id][ind.id] = pickKey(set, tag + est.id + ind.id, weights); }));
    });
    return out;
  }

  function buildPracticaPI() {
    const { niveles, atrasos } = genNiveles();
    const terreno = genTerreno();
    const tutor = genInstrumento(TUTOR_DIMENSIONES, NIVELES_FREC, W_FREC, 'tut', 4);
    const autoeval = genInstrumento(AUTOEVAL_DIMENSIONES, NIVELES_FREC, W_FREC, 'aut', 4);
    const semestral = genInstrumento(SEMESTRAL_DIMENSIONES, NIVELES_APREC, W_APREC, 'sem', 3);

    return {
      meta: {
        codigo: 'PI',
        nombre: 'Práctica Profesional I',
        cursoTitulo: 'Práctica Profesional I — Integración al Campo Profesional',
        breadcrumb: 'Práctica Profesional I',
        semestre: 'Semestre 2026-1',
        escuela: 'Facultad de Ciencias Médicas · Entrenador Deportivo',
        kind: 'profesional',
        terreno: true,
      },
      NIVELES: { NIVELES_EBSD, NIVELES_APREC, NIVELES_FREC, NIVELES_SUPERVISOR: NIVELES_FREC },
      ESCALAS: { ESCALA_INF_DEP, ESCALA_INF_FUN, ESCALA_PROYECTO, ESCALA_PORT, ESCALA_TUTOR, ESCALA_AUTO, ESCALA_SEMESTRAL },
      GRUPOS: [
        { id: 'documento', label: 'Entregas evaluativas', singular: 'Entrega', sigla: 'E', color: 'teal',
          desc: 'Informe (15%) y Proyecto de Mejora + Reflexión (30%) · rúbrica con exigencia 60%' },
        { id: 'portafolio', label: 'Portafolio', singular: 'Portafolio', sigla: 'P', color: 'orange',
          desc: 'Construcción del portafolio y bitácora · se promedia con la supervisión en terreno (25%)' },
      ],
      EVALUACIONES,
      PONDERACIONES,
      // Instrumentos de proceso
      SUPERVISOR: { kind: 'profesional', areas: AREAS, formales: TERRENO_FORMALES, terrenoCriterios, notaTerrenoVisita,
                    tutorDimensiones: TUTOR_DIMENSIONES, semestralDimensiones: SEMESTRAL_DIMENSIONES,
                    nivelesKey: 'NIVELES_APREC' },
      AUTOEVAL: { dimensiones: AUTOEVAL_DIMENSIONES, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_AUTO', maxPuntos: 68 },
      TUTOR: { dimensiones: TUTOR_DIMENSIONES, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_TUTOR', maxPuntos: 68 },
      SEMESTRAL: { dimensiones: SEMESTRAL_DIMENSIONES, nivelesKey: 'NIVELES_APREC', escalaKey: 'ESCALA_SEMESTRAL', maxPuntos: 36 },
      ANEXOS_ADMIN,
      ESTUDIANTES, PROFESORES,
      NOTAS_COLUMNS: [
        { key: 'INF', label: 'Informe',  sub: '15%', kind: 'eval', evalId: 'INF', color: 'teal' },
        { key: 'PRO', label: 'Proyecto', sub: '30%', kind: 'eval', evalId: 'PRO', color: 'orange' },
        { key: 'TUTOR', label: 'Tutor',  sub: '25%', kind: 'tutor' },
        { key: 'SUP', label: 'Superv.+Port', sub: '25%', kind: 'sup' },
        { key: 'AUTO', label: 'Autoev.', sub: '5%',  kind: 'auto' },
      ],
      RESOLVERS: {
        SUP: (estId, state) => notaSupervisorPI(estId, state),
        TUTOR: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.tutor && state.tutor[estId], TUTOR_DIMENSIONES, NIVELES_FREC, ESCALA_TUTOR);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
        AUTO: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.autoeval && state.autoeval[estId], AUTOEVAL_DIMENSIONES, NIVELES_FREC, ESCALA_AUTO);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
      },
      // helpers expuestos a las pantallas PI
      AREAS, areaDef, modosDeArea, modoDef, terrenoCriterios, notaTerrenoVisita, notaSupervisorPI,
      TUTOR_DIMENSIONES, AUTOEVAL_DIMENSIONES, SEMESTRAL_DIMENSIONES,
      initialState: (estado) => {
        if (estado === 'vacio') {
          return {
            evaluaciones: EVALUACIONES.map(e => ({ ...e, estado: 'pendiente' })),
            estudiantes: ESTUDIANTES.map(e => ({ ...e })),
            niveles: {}, atrasos: {}, terreno: {}, tutor: {}, autoeval: {}, semestral: {},
            supervisor: {}, supervisorComments: {}, autoevalComments: {}, evalAnexos: {},
          };
        }
        return {
          evaluaciones: EVALUACIONES.map(e => ({ ...e })),
          estudiantes: ESTUDIANTES.map(e => ({ ...e })),
          niveles: JSON.parse(JSON.stringify(niveles)),
          atrasos: JSON.parse(JSON.stringify(atrasos)),
          terreno: JSON.parse(JSON.stringify(terreno)),
          tutor: JSON.parse(JSON.stringify(tutor)),
          autoeval: JSON.parse(JSON.stringify(autoeval)),
          semestral: JSON.parse(JSON.stringify(semestral)),
          supervisor: {},
          supervisorComments: {
            e1: 'Antonia conduce la sesión con seguridad y mantiene una excelente relación con el equipo. Bitácora al día. Reforzar la fundamentación bibliográfica del informe de diagnóstico.',
            e2: 'Benjamín tiene buena llegada con los deportistas, pero entregó el proyecto con un día de atraso. Debe mejorar la planificación previa de las sesiones.',
            e3: 'Camila domina los protocolos de medición y se desempeña con rigor en el laboratorio. Excelente registro técnico en su bitácora.',
          },
          autoevalComments: {},
          evalAnexos: {
            INF: [{ id: 'inf-1', titulo: 'Consigna Informe — Estructura Organizacional', tipo: 'Pauta de la evaluación', tamano: '0.4 MB', subido: '20 mar 2026', por: 'Andrés Tapia' }],
            PRO: [{ id: 'pro-1', titulo: 'Consigna Proyecto de Mejora y Reflexión', tipo: 'Pauta de la evaluación', tamano: '0.5 MB', subido: '02 jun 2026', por: 'Andrés Tapia' },
                  { id: 'pro-2', titulo: 'Plantilla de presupuesto del proyecto', tipo: 'Material complementario', tamano: '0.2 MB', subido: '02 jun 2026', por: 'Andrés Tapia' }],
            PORT: [{ id: 'port-1', titulo: 'Formato de Bitácora (Excel)', tipo: 'Material complementario', tamano: '0.3 MB', subido: '07 abr 2026', por: 'Andrés Tapia' }],
          },
        };
      },
    };
  }

  window.registerPractica('PI', buildPracticaPI);
})();
