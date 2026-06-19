// data-p6.js — Práctica Profesional II · "Integración profesional avanzada"
// Se registra como 'PII' en el registro de prácticas definido en data.js.
// Práctica profesional con TRES menciones, cada una con sus propias entregas y
// ponderaciones, sobre una base común de supervisión en terreno, portafolio +
// bitácora, evaluación del/la tutor/a, evaluación semestral del/la supervisor/a,
// ensayo final + reflexión y autoevaluación.
//   · Entrenador (Deportiva): Planificación + Sesión + Manual
//   · Ciencias del Deporte:   Planificación + Proyecto de Investigación
//   · Gestión Deportiva:      Planificación + Rediseño de Procesos
// Documentos fuente: consignas oficiales Práctica Profesional II 2025.
// NOTA: las ponderaciones de las consignas individuales no suman 100% entre sí
// (inconsistencia del documento original); se reconciliaron por mención a 100%.

(function () {
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
  const NIVELES_EBSD = [
    { key: 'E', label: 'Excelente',  pts: 3, desc: 'Demuestra dominio de todos los elementos descritos en el indicador.' },
    { key: 'B', label: 'Bueno',      pts: 2, desc: 'Demuestra dominio de la mayoría de los elementos descritos en el indicador.' },
    { key: 'S', label: 'Suficiente', pts: 1, desc: 'Cumple parcialmente con los elementos establecidos o solo con alguno de ellos.' },
    { key: 'D', label: 'Deficiente', pts: 0, desc: 'Se evidencia dificultad para alcanzar el logro descrito, o no es observado.' },
  ];
  // Rúbrica analítica de 4 niveles (Sesión, Manual, Procesos)
  const NIVELES_DSBI = [
    { key: 'DE', label: 'Destacado',       pts: 4, desc: 'Cumple plenamente y de forma sobresaliente con el criterio.' },
    { key: 'ST', label: 'Satisfactorio',   pts: 3, desc: 'Cumple adecuadamente el criterio, con aspectos menores a mejorar.' },
    { key: 'BS', label: 'Básico',          pts: 2, desc: 'Cumple parcialmente; presenta debilidades relevantes.' },
    { key: 'IS', label: 'Insatisfactorio', pts: 1, desc: 'No cumple o cumple de forma deficiente el criterio.' },
  ];
  // Rúbrica analítica de 3 niveles (Planificación Deportiva, Proyecto de Investigación)
  const NIVELES_DSI = [
    { key: 'DE', label: 'Destacado',       pts: 3, desc: 'Cumple plenamente con el criterio.' },
    { key: 'ST', label: 'Satisfactorio',   pts: 2, desc: 'Cumple el criterio con imprecisiones u omisiones menores.' },
    { key: 'IS', label: 'Insatisfactorio', pts: 1, desc: 'No cumple el criterio u omite aspectos relevantes.' },
  ];
  // Escala de apreciación (supervisión en terreno + semestral)
  const NIVELES_APREC = [
    { key: 'L',  label: 'Logrado',              pts: 4, desc: 'Cumple con el 100% de lo solicitado.' },
    { key: 'ML', label: 'Medianamente logrado', pts: 3, desc: 'Cumple parcialmente con lo solicitado.' },
    { key: 'NL', label: 'No logrado',           pts: 2, desc: 'El requerimiento no supera el 60% solicitado.' },
    { key: 'I',  label: 'Insuficiente',         pts: 1, desc: 'No demuestra dominio de la competencia solicitada.' },
    { key: 'NO', label: 'No observado',         pts: 0, desc: 'El indicador no ha sido posible de observar.' },
  ];
  // Escala de frecuencia (tutor/a + autoevaluación)
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
  const ESCALA_PLANIF  = linScale(36);  // Planificación deportiva (DSI)
  const ESCALA_SESION  = linScale(32);  // Sesión de entrenamiento (DSBI)
  const ESCALA_MANUAL  = linScale(32);  // Manual de ejercicios (DSBI)
  const ESCALA_PROYECTO = linScale(36); // Proyecto de investigación (DSI)
  const ESCALA_PROCESO = linScale(32);  // Rediseño de procesos (DSBI)
  const ESCALA_ENSAYO  = linScale(51);  // Ensayo + reflexión (EBSD)
  const ESCALA_PORT1   = linScale(33);
  const ESCALA_PORT2   = linScale(24);
  const ESCALA_PORT3   = linScale(27);
  const ESCALA_TUTOR   = linScale(64);  // Tutor/a (ambas variantes, ideal 64)
  const ESCALA_AUTO    = linScale(68);  // Autoevaluación
  const ESCALA_SEMESTRAL = linScale(32);// Eval. semestral supervisor/a
  const ESCALA_TERR_DEP_P = linScale(52);
  const ESCALA_TERR_CIE_P = linScale(48);
  const ESCALA_TERR_OBS   = linScale(28);
  const ESCALA_TERR_GES   = linScale(36);

  const RA = 'Integrar equipos multidisciplinarios demostrando dominio de las competencias profesionales del rol de entrenador deportivo en una o varias disciplinas deportivas en el ámbito deportivo, de gestión o de ciencias del deporte, desarrollando actividades enfocadas en el centro de práctica y asumiendo una postura ética y profesional.';

  const crit = (id, texto, doble) => ({ id, texto, doble: !!doble });

  // ═══════════════════════════════════════════════════════════
  // ENTREGAS DOCUMENTALES
  // ═══════════════════════════════════════════════════════════

  // 1 · PLANIFICACIÓN DEPORTIVA (todas las menciones · 20%) — DSI · ideal 36
  const PLANIFICACION = {
    id: 'PLAN', grupo: 'documento', numero: 1, nivelesKey: 'NIVELES_DSI', escalaKey: 'ESCALA_PLANIF',
    titulo: 'Planificación Deportiva (macrociclo)', tipo: 'Excel + Presentación', duracion: 'Temporada · 3 meses',
    fecha: '2025-09-24', estado: 'corregida', maxPuntos: 36, ponderacion: 0.20,
    menciones: ['deportiva', 'ciencias', 'gestion'],
    descripcion: 'Elaboración y presentación de una planificación deportiva de una temporada (macrociclo) para el grupo intervenido, fundamentando las decisiones de diseño con las características del deporte y los/las deportistas.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Caracterizar el deporte y a los/las deportistas (edad, nivel, años de entrenamiento, frecuencia).',
      'Seleccionar un modelo de planificación coherente y organizar periodos/fases.',
      'Definir objetivos, calendario de competencias, controles y distribución de cargas.',
      'Exponer y fundamentar la propuesta en una presentación de hasta 20 minutos.',
    ],
    instrucciones: [
      'Cargar la planificación (Excel) y la presentación en el portafolio el miércoles 24-09, 12:00.',
      'Macrociclo de 3 meses con: características del deporte y deportistas, modelo, calendario de competencias (preparatorias/fundamentales), objetivos del macro/meso/micro, controles y distribución de la carga.',
      'Exponer con uniforme de la carrera, cámara encendida si es remoto, en máx. 20 min.',
      'Participar activamente en la ronda de preguntas y en la retroalimentación a los/las compañeros/as.',
    ],
    aspectosFormales: [
      'Planilla Excel con la periodización del macrociclo.',
      'Presentación PPT/Canva/Prezi con identificación institucional.',
      'Atraso: descuento de 0,5 por día.',
    ],
    pautas: [
      'Rúbrica analítica de 3 niveles (Destacado 3 / Satisfactorio 2 / Insatisfactorio 1). Puntaje ideal 36.',
      'El criterio "Descripción del deporte" pondera ×2 (≥3 referencias actualizadas).',
      'Valore la coherencia entre modelo, periodos, objetivos, calendario y distribución de cargas.',
    ],
    criterios: [
      crit('pl1', 'Descripción del deporte: características relevantes (origen, pruebas, vías energéticas, capacidades físicas, fundamentos técnicos/tácticos y reglamentación) con ≥3 referencias actualizadas.', true),
      crit('pl2', 'Características del grupo: edad, nivel de rendimiento, años de entrenamiento, frecuencia y otros aspectos relevantes para la planificación.'),
      crit('pl3', 'Modelo de planificación concordante con el deporte y el nivel; periodos y/o fases organizados coherentemente.'),
      crit('pl4', 'Planteamiento de objetivos correctos, alcanzables y articulados en un orden lógico por periodo/fase.'),
      crit('pl5', 'Calendario de competencias preparatorias y fundamentales distribuidas a lo largo del macrociclo.'),
      crit('pl6', 'Control y seguimiento: test y controles acordes a la modalidad, fundamentados por el/la estudiante.'),
      crit('pl7', 'Distribución de la carga (volumen e intensidad) en concordancia con el periodo y las características de los/las deportistas.'),
      crit('pl8', 'Actividades propuestas articuladas metodológicamente, adecuadas y atractivas para el logro de los objetivos.'),
      crit('pl9', 'Exposición con lenguaje técnico, claro y preciso que facilita la comprensión.'),
      crit('pl10', 'Argumentación e integración de saberes de su formación al responder la ronda de preguntas.'),
      crit('pl11', 'Participación activa en la situación de evaluación, con retroalimentación al trabajo de sus pares.'),
    ],
  };

  // 2 · SESIÓN DE ENTRENAMIENTO (Entrenador · 15%) — DSBI · ideal 32
  const SESION = {
    id: 'SESION', grupo: 'documento', numero: 2, nivelesKey: 'NIVELES_DSBI', escalaKey: 'ESCALA_SESION',
    titulo: 'Sesión de Entrenamiento (ejecución + ronda de preguntas)', tipo: 'Ejecución en terreno', duracion: 'Sesión completa',
    fecha: '2025-10-15', estado: 'en-evaluacion', maxPuntos: 32, ponderacion: 0.15,
    menciones: ['deportiva'],
    descripcion: 'Diseño y ejecución de una sesión de entrenamiento completa en el centro de práctica, observada por el/la tutor/a y el/la supervisor/a, seguida de una ronda de preguntas y análisis reflexivo.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Ejecutar la sesión planificada con estructura clara (inicio, parte principal, finalización).',
      'Aplicar los principios del entrenamiento y manejar técnica y comunicacionalmente al grupo.',
      'Justificar técnica y metodológicamente las decisiones tomadas durante la sesión.',
      'Analizar críticamente el propio desempeño, identificando aciertos, errores y mejoras.',
    ],
    instrucciones: [
      'Cargar la sesión de entrenamiento en el portafolio el miércoles 15-10, 12:00.',
      'Etapa 1: ejecución en terreno frente a grupo real (observada por tutor/a y supervisor/a).',
      'Etapa 2: ronda de preguntas y retroalimentación oral con análisis reflexivo.',
    ],
    aspectosFormales: ['Sesión ejecutada frente a grupo real.', 'Participación activa y fundamentada en la ronda de preguntas.', 'Atraso: descuento de 0,5 por día.'],
    pautas: [
      'Rúbrica analítica de 4 niveles (Destacado 4 … Insatisfactorio 1). Puntaje ideal 32.',
      'Etapa 1 (5 criterios) evaluada en conjunto por tutor/a y supervisor/a; Etapa 2 (3 criterios) en la ronda de preguntas.',
    ],
    criterios: [
      crit('se1', 'Organización y estructura de la sesión (inicio, parte principal, finalización) coherente con los objetivos.'),
      crit('se2', 'Aplicación correcta de los principios del entrenamiento según el contexto.'),
      crit('se3', 'Manejo del grupo: lidera con seguridad, regula al grupo y mantiene motivación y disciplina.'),
      crit('se4', 'Adaptabilidad durante la sesión ante imprevistos o cambios.'),
      crit('se5', 'Conducta ética y profesional en el trato con deportistas y equipo de trabajo.'),
      crit('se6', 'Fundamentación técnica y metodológica de las decisiones (ronda de preguntas).'),
      crit('se7', 'Comprensión del proceso deportivo y del lugar de la sesión dentro del plan general.'),
      crit('se8', 'Análisis crítico del desempeño: identifica aciertos y errores y propone mejoras realistas.'),
    ],
  };

  // 3 · MANUAL DE EJERCICIOS (Entrenador · 15%) — DSBI · ideal 32
  const MANUAL = {
    id: 'MANUAL', grupo: 'documento', numero: 3, nivelesKey: 'NIVELES_DSBI', escalaKey: 'ESCALA_MANUAL',
    titulo: 'Manual de Ejercicios', tipo: 'Manual (Word/PDF)', duracion: 'Máx. 20 pp.',
    fecha: '2025-11-12', estado: 'pendiente', maxPuntos: 32, ponderacion: 0.15,
    menciones: ['deportiva'],
    descripcion: 'Manual con ejercicios para mejorar una cualidad física y una cualidad técnica del deporte intervenido (mínimo 10 ejercicios), con descripción técnica y metodológica.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Identificar las principales cualidades físicas y técnicas del deporte intervenido.',
      'Seleccionar y justificar una cualidad física y una técnica según las necesidades del grupo.',
      'Diseñar ≥5 ejercicios para cada cualidad (10 en total), progresivos y aplicables.',
      'Estructurar el manual con formato profesional (portada, introducción, objetivos, bibliografía).',
    ],
    instrucciones: [
      'Cargar el Manual en el portafolio el miércoles 12-11, 12:00. Máx. 20 páginas.',
      'Por cada ejercicio: nombre, objetivo, descripción, duración/repeticiones, materiales y consideraciones técnicas.',
      'Incluir introducción, objetivos, cualidades del deporte, selección justificada, conclusiones y bibliografía.',
    ],
    aspectosFormales: ['Formato profesional con portada e identificación.', 'Bibliografía en orden alfabético o numérico.', 'Atraso: descuento de 0,5 por día.'],
    pautas: [
      'Rúbrica analítica de 4 niveles (Destacado 4 … Insatisfactorio 1). Puntaje ideal 32.',
      'El criterio "Originalidad y adecuación al contexto real" pondera ×2.',
    ],
    criterios: [
      crit('ma1', 'Identificación de las cualidades físicas y técnicas relevantes del deporte.'),
      crit('ma2', 'Selección justificada de una cualidad física y una cualidad técnica.'),
      crit('ma3', 'Diseño de ≥5 ejercicios para la cualidad física, estructurados, progresivos y aplicables.'),
      crit('ma4', 'Diseño de ≥5 ejercicios para la cualidad técnica, estructurados, progresivos y aplicables.'),
      crit('ma5', 'Descripción técnica y metodológica: objetivos, tiempos, repeticiones, materiales y aspectos técnicos.'),
      crit('ma6', 'Presentación y estructura del manual: organización, redacción técnica y formato.'),
      crit('ma7', 'Originalidad y adecuación al contexto real del grupo intervenido.', true),
    ],
  };

  // 4 · PROYECTO DE INVESTIGACIÓN (Ciencias del Deporte · 20%) — DSI · ideal 36
  const PROYECTO = {
    id: 'PROY', grupo: 'documento', numero: 4, nivelesKey: 'NIVELES_DSI', escalaKey: 'ESCALA_PROYECTO',
    titulo: 'Proyecto de Investigación (propuesta)', tipo: 'Propuesta (Word)', duracion: 'Propuesta',
    fecha: '2025-11-12', estado: 'pendiente', maxPuntos: 36, ponderacion: 0.20,
    menciones: ['ciencias'],
    descripcion: 'Propuesta de un proyecto de investigación que resuelva una necesidad específica del área de ciencias del deporte en el centro de práctica (sin resultados ni análisis).',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Plantear el problema: delimitación, objetivos (general y específicos) e hipótesis (investigación y nula).',
      'Definir la metodología: características, población y muestra, instrumentos, variables y plan de trabajo.',
      'Argumentar la factibilidad del proyecto y referenciar con gestor bibliográfico (Mendeley).',
    ],
    instrucciones: [
      'Cargar el proyecto en el portafolio el miércoles 12-11, 12:00.',
      'Estructura: Título · Planteamiento del problema · Metodología (población, instrumentos, variables, plan de trabajo, referencias).',
      'Solo se solicita la propuesta del proyecto (no resultados ni análisis).',
    ],
    aspectosFormales: ['Estructura clara y lógica de la propuesta.', 'Referencias con gestor bibliográfico Mendeley.', 'Atraso: descuento de 0,5 por día.'],
    pautas: [
      'Rúbrica analítica de 3 niveles (Destacado 3 / Satisfactorio 2 / Insatisfactorio 1). Puntaje ideal 36.',
      'Valore la coherencia entre problema, objetivos, hipótesis, metodología y factibilidad.',
    ],
    criterios: [
      crit('py1', 'Título concordante con el proyecto; identifica el tema principal y las variables.'),
      crit('py2', 'Planteamiento del problema: estado del arte, justificación y vacío/brecha.'),
      crit('py3', 'Delimitación del problema en forma de pregunta, mostrando la relación entre variables.'),
      crit('py4', 'Objetivo general (un verbo) y objetivos específicos (más de uno), claros.'),
      crit('py5', 'Hipótesis de investigación y nula.'),
      crit('py6', 'Características de la investigación: enfoque/paradigma, diseño, tipo y alcance.'),
      crit('py7', 'Población y muestra: tipo, tamaño muestral y criterios de elegibilidad.'),
      crit('py8', 'Instrumentos y materiales para evaluar, intervenir y recolectar datos.'),
      crit('py9', 'Variables descritas de manera conceptual y operacional.'),
      crit('py10', 'Plan de trabajo: describe el proceso de ejecución en el orden en que ocurrirá.'),
      crit('py11', 'Factibilidad del proyecto descrita de forma clara y precisa.'),
      crit('py12', 'Referencias en orden alfabético con gestor bibliográfico (Mendeley).'),
    ],
  };

  // 5 · REDISEÑO DE PROCESOS (Gestión Deportiva · 20%) — DSBI · ideal 32
  const PROCESO = {
    id: 'PROC', grupo: 'documento', numero: 5, nivelesKey: 'NIVELES_DSBI', escalaKey: 'ESCALA_PROCESO',
    titulo: 'Proceso en mi Centro de Práctica (rediseño)', tipo: 'Informe (Word)', duracion: 'Máx. 8 pp.',
    fecha: '2025-11-12', estado: 'pendiente', maxPuntos: 32, ponderacion: 0.20,
    menciones: ['gestion'],
    descripcion: 'Reconoce un proceso de gestión deportiva real del centro, identifica sus dificultades y propone una mejora que contribuya al funcionamiento eficiente de la institución (formato Antes/Después).',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Seleccionar y describir un proceso de gestión real (inscripción, horarios, asistencia, implementos, etc.).',
      'Detectar un problema concreto y su posible causa.',
      'Proponer una mejora aplicable al contexto real (Antes / Después).',
      'Reflexionar sobre el aprendizaje organizacional como entrenador/a.',
    ],
    instrucciones: [
      'Cargar el informe "Proceso en mi centro de práctica" (Word) el miércoles 12-11, 12:00. Máx. 8 páginas.',
      'Incluir: título, nombre del proceso, descripción del proceso actual, propuesta de mejora y reflexión final.',
      'Presentar el proceso en dos columnas: Antes (actual) y Después (propuesta).',
    ],
    aspectosFormales: ['Hoja carta, Arial/Calibri 10, espaciado 1.5, justificado.', 'Tablas/figuras auto explicativas y enumeradas; bibliografía citada.', 'Atraso: descuento de 0,5 por día.'],
    pautas: [
      'Rúbrica analítica de 4 niveles (Destacado 4 … Insatisfactorio 1). Puntaje ideal 32.',
      'El criterio "Análisis del proceso seleccionado" pondera ×2.',
    ],
    criterios: [
      crit('pr1', 'Presentación y claridad del informe (ordenado, fácil de leer, sin faltas importantes).'),
      crit('pr2', 'Formalidades: cumple con extensión, formato, entrega y redacción clara.'),
      crit('pr3', 'Análisis del proceso seleccionado: identifica un proceso clave y lo describe con profundidad.', true),
      crit('pr4', 'Fundamentación del problema: expone la dificultad y argumenta su impacto.'),
      crit('pr5', 'Propuesta de mejora concreta, viable y bien argumentada.'),
      crit('pr6', 'Aplicación de evidencia personal del centro de práctica como sustento.'),
      crit('pr7', 'Reflexión profesional crítica sobre su rol y su impacto en la gestión.'),
    ],
  };

  // 6 · ENSAYO FINAL Y REFLEXIÓN (todas · 10% Ent/Gest · 15% Ciencias) — EBSD · ideal 51
  const ENSAYO = {
    id: 'ENS', grupo: 'documento', numero: 6, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_ENSAYO',
    titulo: 'Ensayo Final y Reflexión', tipo: 'Ensayo + Presentación', duracion: 'Máx. 3 pp. + presentación',
    fecha: '2025-11-26', estado: 'pendiente', maxPuntos: 51, ponderacion: 0.10,
    menciones: ['deportiva', 'ciencias', 'gestion'],
    descripcion: 'Ensayo argumentativo sobre la intervención en el centro de práctica y una reflexión final sobre la integración de las asignaturas teóricas a la práctica. La nota suma ensayo + presentación final de reflexión.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: [
      'Construir un ensayo argumentativo con introducción, desarrollo y conclusión.',
      'Reflexionar sobre el cumplimiento de las expectativas iniciales y el desarrollo profesional.',
      'Identificar las asignaturas integradas y proponer mejoras a la formación y a la práctica.',
    ],
    instrucciones: [
      'Cargar el ensayo en el portafolio el miércoles 26-11, 12:00. Máx. 3 hojas (tamaño oficio).',
      'Estructura retórica: tema y polémica, argumentos y contraargumentos, tesis y reflexión final.',
      'Presentar la reflexión al/la supervisor/a en la presentación final (funciones, expectativas, asignaturas integradas, propuestas).',
    ],
    aspectosFormales: ['Portada con identificación; título "ENSAYO PRÁCTICA PROFESIONAL".', 'Hoja oficio, Arial/Calibri 10, espaciado 1.5, justificado.', 'Atraso: descuento de 0,5 por día.'],
    pautas: [
      'Rúbrica E·B·S·D, puntaje ideal 51. Criterios ×2: reflexión final argumentativa (1.7), coherencia con la reflexión inicial (2.2), asignaturas de integración (2.4) y propuestas de mejora (2.6).',
      'La calificación combina el Ensayo y la Presentación Final de Reflexión (10% Entrenamiento/Gestión, 15% Ciencias).',
    ],
    criterios: [
      crit('e11', 'Entrega el ensayo y la presentación de reflexión en la fecha indicada.'),
      crit('e12', 'Cumple con todos los requisitos del ensayo descritos en la consigna.'),
      crit('e13', 'Logra obtener un poder de síntesis, dando énfasis a lo más importante.'),
      crit('e14', 'Su redacción gramatical es coherente y sin faltas de ortografía.'),
      crit('e15', 'Presenta un tema agregando argumentos de base dentro del texto.'),
      crit('e16', 'Cumple con tener introducción, desarrollo y conclusiones dentro del ensayo.'),
      crit('e17', 'Efectúa una reflexión final argumentativa en el texto del ensayo.', true),
      crit('e21', 'Explica las funciones realizadas en el centro de práctica de manera breve.'),
      crit('e22', 'La reflexión final del ensayo tiene coherencia con la realizada al inicio de la práctica.', true),
      crit('e23', 'Entrega antecedentes importantes en relación a la planificación ejecutada y su experiencia.'),
      crit('e24', 'Identifica y describe de manera clara las asignaturas de integración dentro de la práctica.', true),
      crit('e25', 'Entrega elementos a considerar para incluir en la formación de la carrera.'),
      crit('e26', 'Otorga propuestas de mejora y sugerencias sólidas en relación a la asignatura.', true),
    ],
  };

  // ═══════════════════════════════════════════════════════════
  // PORTAFOLIO — 3 evaluaciones (parte de la supervisión)
  // ═══════════════════════════════════════════════════════════
  const BITACORA = [
    crit('b1', 'Mantiene la bitácora actualizada.'),
    crit('b2', 'Anota el día, hora de inicio y término de la sesión.'),
    crit('b3', 'Identifica los objetivos metodológicos generales y específicos de cada sesión.'),
    crit('b4', 'Utiliza lenguaje técnico para describir los objetivos de la sesión.'),
    crit('b5', 'Describe las funciones realizadas en cada sesión.'),
    crit('b6', 'Utiliza un lenguaje inclusivo y de equidad de género en su redacción.'),
    crit('b7', 'Mantiene una redacción gramatical coherente y sin faltas de ortografía.'),
    crit('b8', 'Realiza observaciones técnicas con actitud de indagación, usando conocimiento de asignaturas teóricas.'),
  ];
  const PORT1 = {
    id: 'PORT1', grupo: 'portafolio', numero: 1, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT1',
    titulo: 'Portafolio — Evaluación N°1 (Construcción + Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Construcción',
    fecha: '2025-09-24', estado: 'corregida', maxPuntos: 33, ponderacion: 0,
    menciones: ['deportiva', 'ciencias', 'gestion'],
    descripcion: 'Construcción del portafolio "PRÁCTICA PROFESIONAL II - NOMBRE APELLIDO" en DRIVE con todas las carpetas y registro diario de la bitácora.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Construir y compartir el portafolio con opción de edición.', 'Registrar diariamente las acciones del centro en la bitácora.'],
    instrucciones: ['Compartir la carpeta editable el 28-08 con todas las carpetas indicadas.', 'Mantener la bitácora (Excel) al día y cargar la planificación semestral.'],
    aspectosFormales: ['Carpeta DRIVE editable con el nombre correcto.', 'Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 33 (Construcción 3 criterios + Bitácora 8 criterios). Se promedia con la supervisión.'],
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
    fecha: '2025-10-29', estado: 'corregida', maxPuntos: 24, ponderacion: 0,
    menciones: ['deportiva', 'ciencias', 'gestion'],
    descripcion: 'Revisión aleatoria del registro diario de la bitácora en cualquier momento del semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Mantener actualizado el registro diario de la bitácora.'],
    instrucciones: ['Tener actualizado el archivo Excel con el registro diario de acciones del centro.'],
    aspectosFormales: ['Bitácora Excel al día.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 24 (Bitácora, 8 criterios). Se promedia con la supervisión.'],
    criterios: [...BITACORA],
  };
  const PORT3 = {
    id: 'PORT3', grupo: 'portafolio', numero: 3, nivelesKey: 'NIVELES_EBSD', escalaKey: 'ESCALA_PORT3',
    titulo: 'Portafolio — Evaluación N°3 (Carga completa + Bitácora)', tipo: 'Portafolio (Drive)', duracion: 'Cierre',
    fecha: '2025-11-26', estado: 'pendiente', maxPuntos: 27, ponderacion: 0,
    menciones: ['deportiva', 'ciencias', 'gestion'],
    descripcion: 'Carga de la totalidad de los documentos del portafolio y registro completo de la bitácora al cierre del semestre.',
    resultadosAprendizaje: [RA],
    objetivosEspecificos: ['Cargar todos los documentos en las fechas estipuladas.', 'Completar la bitácora con todas las sesiones realizadas.'],
    instrucciones: ['Cargar la totalidad de documentos (26-11) y tener el registro completo de la bitácora.'],
    aspectosFormales: ['Todos los documentos cargados.', 'Bitácora completa.', 'Atraso: descuento de 0,5 por día.'],
    pautas: ['Puntaje ideal 27 (Carga completa 1 criterio + Bitácora 8 criterios). Se promedia con la supervisión.'],
    criterios: [
      crit('c11', 'Tiene cargados todos los documentos descritos en la consigna y en las fechas estipuladas.'),
      ...BITACORA,
    ],
  };
  const PORTAFOLIO_EVAL_IDS = ['PORT1', 'PORT2', 'PORT3'];

  const EVALUACIONES = [PLANIFICACION, SESION, MANUAL, PROYECTO, PROCESO, ENSAYO, PORT1, PORT2, PORT3];

  // ═══════════════════════════════════════════════════════════
  // SUPERVISIÓN EN TERRENO — 3 áreas (formales comunes + disciplinares)
  // ═══════════════════════════════════════════════════════════
  const TERRENO_FORMALES = [
    crit('f1', 'Asiste puntualmente a la sesión / al centro y cumple con el horario establecido.', true),
    crit('f2', 'Utiliza vestimenta acorde al contexto, identificándose con el uniforme de la carrera o del centro.'),
    crit('f3', 'Presenta planificación clara y ordenada (o parte solicitada), o realiza activamente las actividades planificadas por el/la tutor/a.'),
    crit('f4', 'Tiene actualizada y al día su bitácora virtual integrando el objetivo de las sesiones / jornadas del lugar de práctica.'),
  ];
  const DISC_DEPORTIVA = [
    crit('d1', 'Demuestra las actividades y/o ejercicios correctamente, utilizando su cuerpo.'),
    crit('d2', 'Se preocupa de corregir constantemente las ejecuciones de sus dirigidos, aplicando claves de corrección y/o refuerzos positivos.'),
    crit('d3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    crit('d4', 'Los ejercicios presentados se articulan en una secuencia metodológica coherente que permite alcanzar los objetivos.'),
    crit('d5', 'Organiza las actividades en forma óptima, aprovechando el espacio y los recursos materiales, favoreciendo el ritmo de la sesión.'),
    crit('d6', 'Utiliza un tono de voz adecuado que permite escuchar claramente sus instrucciones y correcciones.'),
    crit('d7', 'Entrega instrucciones con un lenguaje técnico claro y adecuado al contexto y a las características de los y las deportistas.'),
    crit('d8', 'Demuestra seguridad al explicar, corregir y dirigirse al grupo o al deportista.'),
  ];
  const DISC_CIENCIAS = [
    crit('cd1', 'Entrega instrucciones con un lenguaje técnico claro y adecuado al contexto de la medición.'),
    crit('cd2', 'Se preocupa de corregir la ejecución según el protocolo establecido.'),
    crit('cd3', 'Demuestra preparación de los contenidos que le corresponde desarrollar en la sesión.'),
    crit('cd4', 'Organiza las actividades indicadas en forma óptima, aprovechando el espacio y los recursos.'),
    crit('cd5', 'Utiliza un tono de voz adecuado que permite escuchar claramente sus instrucciones y correcciones.'),
    crit('cd6', 'Entrega instrucciones con un lenguaje técnico adecuado al contexto de la medición.'),
    crit('cd7', 'Demuestra seguridad al explicar, corregir y dirigirse al grupo o deportista de la medición.'),
  ];
  const DISC_GESTION = [
    crit('g1', 'Demuestra preparación de los contenidos que le solicitan en el centro de práctica.'),
    crit('g2', 'Demuestra seguridad al explicar y dirigirse al grupo en el cual se encuentra trabajando.'),
    crit('g3', 'Se demuestra proactivo/a preguntando si se necesita apoyo, ofreciendo asistencia o realizando funciones propias de su rol.'),
    crit('g4', 'Organiza las actividades solicitadas por el centro de forma óptima, siendo eficiente y eficaz.'),
  ];
  const OBSERVACION = [
    crit('o1', 'Se encuentra observando, atento/a a las necesidades del/la entrenador/a o profesor/a tutor/a.'),
    crit('o2', 'Se demuestra proactivo/a preguntando durante la práctica si se necesita apoyo, ofreciendo asistencia.'),
  ];

  const AREAS = {
    deportiva: {
      id: 'deportiva', label: 'Entrenador (Deportiva)', desc: 'Práctica profesional deportiva (entrenamiento en club, escuela o selección).',
      modos: {
        part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', ideal: 52, escala: ESCALA_TERR_DEP_P, disc: DISC_DEPORTIVA },
        obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', ideal: 28, escala: ESCALA_TERR_OBS,   disc: OBSERVACION },
      },
    },
    ciencias: {
      id: 'ciencias', label: 'Ciencias del Deporte', desc: 'Práctica en ciencias del deporte (mediciones, evaluaciones, laboratorio).',
      modos: {
        part: { id: 'part', label: 'Con participación en sesión', sigla: 'P', ideal: 48, escala: ESCALA_TERR_CIE_P, disc: DISC_CIENCIAS },
        obs:  { id: 'obs',  label: 'Con observación',             sigla: 'O', ideal: 28, escala: ESCALA_TERR_OBS,   disc: OBSERVACION },
      },
    },
    gestion: {
      id: 'gestion', label: 'Gestión Deportiva', desc: 'Práctica en gestión deportiva (funciones administrativas y organizacionales).',
      modos: {
        unico: { id: 'unico', label: 'Supervisión', sigla: 'G', ideal: 36, escala: ESCALA_TERR_GES, disc: DISC_GESTION },
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
    const crs = terrenoCriterios(area, v.modo);
    let total = 0, answered = 0;
    crs.forEach(c => { const k = v.resp[c.id]; if (!k) return; const ni = NIVELES_APREC.find(n => n.key === k); if (!ni) return; total += ni.pts * (c.doble ? 2 : 1); answered++; });
    const parcial = answered < crs.length;
    const nota = parcial ? null : window.USACH_CALC.notaFromEscala(md.escala, total);
    return { nota, parcial, puntos: total, ideal: md.ideal };
  }

  // ═══════════════════════════════════════════════════════════
  // TUTOR/A — dos variantes (Entrenador/Ciencias · Gestión) · ideal 64
  // ═══════════════════════════════════════════════════════════
  const TUTOR_DEP = [
    { id: 't1', label: '1. Aspectos formales', indicadores: [
      { id: 't11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su entrenador/a o profesor/a tutor/a.' },
      { id: 't12', texto: 'Asiste puntualmente a todas las sesiones y actividades programadas, cumpliendo con el horario establecido.' },
      { id: 't13', texto: 'Respeta las normas y cumple con los protocolos establecidos en el centro de práctica.' },
      { id: 't14', texto: 'Realiza las horas de práctica: 12 horas pedagógicas (9 cronológicas) semanales; 180 pedagógicas (135 cronológicas) totales.' },
      { id: 't15', texto: 'Participa vestido/a de manera acorde a su rol (uniforme institucional de la carrera o del centro).' },
    ]},
    { id: 't2', label: '2. Aspectos disciplinares', indicadores: [
      { id: 't21', texto: 'Participa activamente de los entrenamientos, realizando intervenciones y apoyando las sesiones.' },
      { id: 't22', texto: 'Demuestra correctamente los ejercicios, utilizando su lenguaje corporal en diferentes planos.' },
      { id: 't23', texto: 'Se preocupa de corregir las ejecuciones de sus dirigidos aplicando claves de corrección.' },
      { id: 't24', texto: 'Demuestra conocimiento y preparación de los contenidos que le corresponde desarrollar.' },
      { id: 't25', texto: 'Entrega instrucciones con un lenguaje claro y adecuado a las características de los/las deportistas.' },
      { id: 't26', texto: 'Adapta su planificación a situaciones emergentes y/o al nivel de dificultad de los deportistas.' },
      { id: 't27', texto: 'Demuestra seguridad al dar instrucciones y en el manejo de grupo.' },
    ]},
    { id: 't3', label: '3. Aspectos actitudinales', indicadores: [
      { id: 't31', texto: 'Responde a las tareas y/o actividades solicitadas en los tiempos acordados.' },
      { id: 't32', texto: 'Manifiesta interés, iniciativa y motivación por aprender y adquirir nuevos conocimientos.' },
      { id: 't33', texto: 'Mantiene una actitud respetuosa y de cordialidad con el equipo de trabajo y deportistas a su cargo.' },
      { id: 't34', texto: 'Acepta la crítica y las sugerencias de manera positiva, considerándolas para la mejora de su desempeño.' },
    ]},
  ];
  const TUTOR_GES = [
    { id: 't1', label: '1. Aspectos formales', indicadores: [
      { id: 'g11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su tutor/a.' },
      { id: 'g12', texto: 'Asiste puntualmente a todas las sesiones y actividades programadas, cumpliendo con el horario establecido.' },
      { id: 'g13', texto: 'Respeta las normas y cumple con los protocolos establecidos en el centro de práctica.' },
      { id: 'g14', texto: 'Realiza las horas de práctica: al menos 12 horas pedagógicas semanales; 180 pedagógicas totales.' },
      { id: 'g15', texto: 'Participa vestido/a de manera acorde a su rol (uniforme institucional de la carrera o del centro).' },
    ]},
    { id: 't2', label: '2. Aspectos disciplinares', indicadores: [
      { id: 'g21', texto: 'Participa activamente, realizando intervenciones, apoyando y/o desarrollando las tareas solicitadas por el/la tutor/a.' },
      { id: 'g22', texto: 'Entrega la información solicitada en tiempo y forma, con un lenguaje claro y adecuado al centro.' },
      { id: 'g23', texto: 'Demuestra conocimiento y preparación de los contenidos que le corresponde desarrollar.' },
      { id: 'g24', texto: 'Se adapta a situaciones emergentes o a los desafíos que le presentan en el centro de práctica.' },
      { id: 'g25', texto: 'Demuestra seguridad en sus conocimientos y se aplica en recopilar la información si no la tiene.' },
    ]},
    { id: 't3', label: '3. Aspectos actitudinales', indicadores: [
      { id: 'g31', texto: 'Responde a las tareas y/o actividades solicitadas en los tiempos acordados.' },
      { id: 'g32', texto: 'Manifiesta interés, iniciativa y motivación por aprender y adquirir nuevos conocimientos.' },
      { id: 'g33', texto: 'Mantiene una actitud respetuosa y de cordialidad con el equipo de trabajo y/o deportistas.' },
      { id: 'g34', texto: 'Ejecuta tareas de manera proactiva, relacionadas con las funciones del puesto de trabajo.' },
      { id: 'g35', texto: 'Manifiesta sus ideas o preocupaciones con una actitud respetuosa.' },
      { id: 'g36', texto: 'Acepta la crítica y las sugerencias de manera positiva, considerándolas para la mejora de su desempeño.' },
    ]},
  ];
  function tutorDimsFor(area) { return area === 'gestion' ? TUTOR_GES : TUTOR_DEP; }
  function tutorCfgFor(est) {
    const area = (est && est.area) || 'deportiva';
    return { dimensiones: tutorDimsFor(area), nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_TUTOR', maxPuntos: 64 };
  }

  // ═══════════════════════════════════════════════════════════
  // EVALUACIÓN SEMESTRAL SUPERVISOR/A — apreciación · ideal 32
  // ═══════════════════════════════════════════════════════════
  const SEMESTRAL_DIMENSIONES = [
    { id: 's1', label: '1. Criterios formales', indicadores: [
      { id: 's11', texto: 'Promueve la comunicación y se mantiene en contacto permanente con su profesor/a supervisor/a.' },
      { id: 's12', texto: 'Asiste a todas las reuniones de prácticas coordinadas con su supervisor/a (presenciales o virtuales).' },
      { id: 's13', texto: 'Mantiene actualizada y al día su bitácora virtual integrando las sesiones realizadas.' },
      { id: 's14', texto: 'Entrega las consignas (informes, proyecto, entre otras) en el plazo indicado por su supervisor/a.' },
    ]},
    { id: 's2', label: '2. Criterios profesionales', indicadores: [
      { id: 's21', texto: 'Participa de las reuniones de práctica de manera activa, generando feedback de su proceso.' },
      { id: 's22', texto: 'Demuestra preparación de los contenidos a desarrollar en las reuniones, evitando improvisar.' },
      { id: 's23', texto: 'Acoge los comentarios y críticas de su supervisor/a de manera respetuosa como oportunidad de desarrollo.' },
      { id: 's24', texto: 'Demuestra una progresión positiva en sus intervenciones, considerando las observaciones de su supervisor/a.' },
    ]},
  ];

  // ═══════════════════════════════════════════════════════════
  // AUTOEVALUACIÓN — frecuencia · ideal 68
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
      { id: 'a71', texto: 'Aplica fundamentos de ciencias del deporte (fisiología, metodología, pedagogía o gestión) en su práctica.' },
    ]},
  ];

  // ───────────────────────────────────────────────────────────
  // Supervisión (bloque combinado) = promedio de visitas en terreno +
  // promedio de las 3 evaluaciones de portafolio + evaluación semestral.
  // ───────────────────────────────────────────────────────────
  function notaSupervisorP3(estId, state) {
    const est = (state.estudiantes || ESTUDIANTES).find(e => e.id === estId) || {};
    const area = est.area || 'deportiva';
    const visitas = (state.terreno && state.terreno[estId]) || [];
    const notas = []; let parcial = false;
    visitas.forEach(v => { const r = notaTerrenoVisita(area, v); if (r.nota != null) notas.push(r.nota); else parcial = true; });
    PORTAFOLIO_EVAL_IDS.forEach(pid => {
      const ev = EVALUACIONES.find(e => e.id === pid);
      const res = window.USACH_CALC.calcNotaEvaluacion(ev, state.niveles[pid] && state.niveles[pid][estId], state.atrasos[pid] && state.atrasos[pid][estId]);
      if (res && !res.parcial) notas.push(res.notaFinal); else parcial = true;
    });
    const sem = window.USACH_CALC.calcInstrumento(state.semestral && state.semestral[estId], SEMESTRAL_DIMENSIONES, NIVELES_APREC, ESCALA_SEMESTRAL);
    if (sem && !sem.parcial) notas.push(sem.nota); else parcial = true;
    if (notas.length === 0) return { nota: null, parcial: true };
    const nota = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10;
    return { nota, parcial };
  }

  // ───────────────────────────────────────────────────────────
  // Ponderaciones por mención (cada lista suma 1.00)
  // ───────────────────────────────────────────────────────────
  const PONDS_DEP = [
    { id: 'q1', label: 'Planificación Deportiva',          componentes: ['PLAN'],   peso: 0.20 },
    { id: 'q2', label: 'Sesión de Entrenamiento',          componentes: ['SESION'], peso: 0.15 },
    { id: 'q3', label: 'Manual de Ejercicios',             componentes: ['MANUAL'], peso: 0.15 },
    { id: 'q4', label: 'Ensayo Final + Reflexión',         componentes: ['ENS'],    peso: 0.10 },
    { id: 'q5', label: 'Eval. Entrenador/a Tutor/a',       resolver: 'TUTOR', peso: 0.20 },
    { id: 'q6', label: 'Supervisión + Portafolio + Semestral', resolver: 'SUP', peso: 0.15 },
    { id: 'q7', label: 'Autoevaluación',                   resolver: 'AUTO',  peso: 0.05 },
  ];
  const PONDS_CIE = [
    { id: 'q1', label: 'Planificación Deportiva',          componentes: ['PLAN'], peso: 0.20 },
    { id: 'q2', label: 'Proyecto de Investigación',        componentes: ['PROY'], peso: 0.20 },
    { id: 'q3', label: 'Ensayo Final + Reflexión',         componentes: ['ENS'],  peso: 0.15 },
    { id: 'q4', label: 'Eval. Tutor/a',                    resolver: 'TUTOR', peso: 0.25 },
    { id: 'q5', label: 'Supervisión + Portafolio + Semestral', resolver: 'SUP', peso: 0.15 },
    { id: 'q6', label: 'Autoevaluación',                   resolver: 'AUTO',  peso: 0.05 },
  ];
  const PONDS_GES = [
    { id: 'q1', label: 'Planificación Deportiva',          componentes: ['PLAN'], peso: 0.20 },
    { id: 'q2', label: 'Rediseño de Procesos',            componentes: ['PROC'], peso: 0.20 },
    { id: 'q3', label: 'Ensayo Final + Reflexión',         componentes: ['ENS'],  peso: 0.10 },
    { id: 'q4', label: 'Eval. Tutor/a',                    resolver: 'TUTOR', peso: 0.20 },
    { id: 'q5', label: 'Supervisión + Portafolio + Semestral', resolver: 'SUP', peso: 0.25 },
    { id: 'q6', label: 'Autoevaluación',                   resolver: 'AUTO',  peso: 0.05 },
  ];
  const PONDS_BY_AREA = { deportiva: PONDS_DEP, ciencias: PONDS_CIE, gestion: PONDS_GES };
  function pondsForArea(area) { return PONDS_BY_AREA[area] || PONDS_DEP; }

  // Columnas de la tabla de notas (incluye todas; las no aplicables muestran —)
  const NOTAS_COLUMNS = [
    { key: 'PLAN',  label: 'Planif.',  sub: '20%', kind: 'eval', evalId: 'PLAN',  color: 'teal' },
    { key: 'SESION', label: 'Sesión',  sub: '15%', kind: 'eval', evalId: 'SESION', color: 'teal' },
    { key: 'MANUAL', label: 'Manual',  sub: '15%', kind: 'eval', evalId: 'MANUAL', color: 'teal' },
    { key: 'PROY',  label: 'Proyecto', sub: '20%', kind: 'eval', evalId: 'PROY',  color: 'teal' },
    { key: 'PROC',  label: 'Procesos', sub: '20%', kind: 'eval', evalId: 'PROC',  color: 'teal' },
    { key: 'ENS',   label: 'Ensayo',   sub: '10–15%', kind: 'eval', evalId: 'ENS', color: 'orange' },
    { key: 'TUTOR', label: 'Tutor',    sub: '20–25%', kind: 'tutor' },
    { key: 'SUP',   label: 'Superv.+Port', sub: '15–25%', kind: 'sup' },
    { key: 'AUTO',  label: 'Autoev.',  sub: '5%',  kind: 'auto' },
  ];

  // ───────────────────────────────────────────────────────────
  // Roster demo (estudiantes en las 3 menciones)
  // ───────────────────────────────────────────────────────────
  const ESTUDIANTES = [
    { id: 'e1', rut: '20.118.245-6', nombre: 'Antonia Pérez Vega',      email: 'antonia.perez@usach.cl',  telefono: '+56 9 8245 1192',
      area: 'deportiva', centro: 'Club Deportivo Universidad de Santiago', comuna: 'Estación Central', deporte: 'Vóleibol', categoria: 'Damas Sub-18', tutorCentro: 'Marcela Ríos', dias: 'Lun, Mié y Vie · 18:00–21:00' },
    { id: 'e2', rut: '20.554.873-1', nombre: 'Benjamín Soto Carrasco',  email: 'benjamin.soto@usach.cl',  telefono: '+56 9 6712 8403',
      area: 'deportiva', centro: 'Escuela de Fútbol Maipú', comuna: 'Maipú', deporte: 'Fútbol', categoria: 'Varones Sub-16', tutorCentro: 'Jorge Henríquez', dias: 'Mar y Jue · 18:00–20:30' },
    { id: 'e3', rut: '20.901.337-K', nombre: 'Camila Riquelme Núñez',   email: 'camila.riquelme@usach.cl', telefono: '+56 9 9018 5526',
      area: 'ciencias', centro: 'Centro de Rendimiento Deportivo USACH', comuna: 'Estación Central', deporte: 'Evaluación física', categoria: 'Alto rendimiento', tutorCentro: 'Dr. Felipe Aravena', dias: 'Lun a Vie · 09:00–13:00' },
    { id: 'e4', rut: '20.776.118-9', nombre: 'Francisca Mella Jara',    email: 'francisca.mella@usach.cl', telefono: '+56 9 5567 9821',
      area: 'ciencias', centro: 'Laboratorio de Fisiología del Ejercicio', comuna: 'Santiago', deporte: 'Tests de laboratorio', categoria: 'Selecciones regionales', tutorCentro: 'Dra. Paula Fuentes', dias: 'Mar, Mié y Jue · 08:30–12:30' },
    { id: 'e5', rut: '20.337.901-4', nombre: 'Diego Fuentes Aguilera',  email: 'diego.fuentes@usach.cl',  telefono: '+56 9 3344 7710',
      area: 'gestion', centro: 'Corporación Municipal de Deportes de Maipú', comuna: 'Maipú', deporte: 'Gestión deportiva', categoria: 'Programas comunales', tutorCentro: 'Paula Vega', dias: 'Lun, Mié y Vie · 09:00–14:00' },
  ];
  const PROFESORES = [
    { id: 'p1', nombre: 'Prof. Andrés Tapia Vergara', email: 'andres.tapia@usach.cl', rol: 'Profesor Supervisor', activo: true },
    { id: 'p2', nombre: 'Prof. María Inés Cáceres',   email: 'maria.caceres@usach.cl', rol: 'Profesora Supervisora', activo: true },
  ];
  const ANEXOS_ADMIN = [
    { id: 'a1', titulo: 'Calendario Académico Práctica Profesional II', desc: 'Fechas de cargas del portafolio, entregas, supervisiones y presentación final.', tipo: 'PDF', tamano: '0.4 MB' },
    { id: 'a2', titulo: 'Formato de Bitácora (Excel)', desc: 'Planilla de registro diario de sesiones y funciones del centro de práctica.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a3', titulo: 'Plantilla de Planificación (Excel)', desc: 'Hoja de cálculo base para la periodización del macrociclo.', tipo: 'XLSX', tamano: '0.3 MB' },
    { id: 'a4', titulo: 'Consentimiento Informado del Centro', desc: 'Autorización del centro de práctica profesional.', tipo: 'PDF', tamano: '0.2 MB' },
    { id: 'a5', titulo: 'Declaración Individual de Accidentes Personales', desc: 'Documento obligatorio para actividades en terreno.', tipo: 'PDF', tamano: '0.3 MB' },
    { id: 'a6', titulo: 'Protocolo de Salud Mental', desc: 'Protocolo institucional de derivación y acompañamiento.', tipo: 'PDF', tamano: '0.6 MB' },
  ];

  // ───────────────────────────────────────────────────────────
  // Generación de datos demo
  // ───────────────────────────────────────────────────────────
  function hashUnit(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }
  function pickKey(set, seedStr, weights) {
    const x = hashUnit(seedStr); let acc = 0;
    for (let i = 0; i < weights.length; i++) { acc += weights[i]; if (x < acc) return set[Math.min(i, set.length - 1)].key; }
    return set[set.length - 1].key;
  }
  const W_EBSD  = [0.46, 0.40, 0.12, 0.02];
  const W_DSBI  = [0.44, 0.42, 0.12, 0.02];
  const W_DSI   = [0.50, 0.40, 0.10];
  const W_APREC = [0.50, 0.34, 0.12, 0.03, 0.01];
  const W_FREC  = [0.52, 0.36, 0.10, 0.02, 0.00];
  const FECHAS_VISITA = ['2025-09-17', '2025-10-15', '2025-11-12', '2025-11-26'];

  function weightsFor(nivelesKey) {
    if (nivelesKey === 'NIVELES_DSBI') return W_DSBI;
    if (nivelesKey === 'NIVELES_DSI') return W_DSI;
    if (nivelesKey === 'NIVELES_APREC') return W_APREC;
    return W_EBSD;
  }
  function setFor(nivelesKey) {
    return { NIVELES_DSBI, NIVELES_DSI, NIVELES_APREC, NIVELES_EBSD }[nivelesKey] || NIVELES_EBSD;
  }
  function appliesTo(ev, area) { return !ev.menciones || ev.menciones.indexOf(area) >= 0; }

  function genDemo() {
    const niveles = {}, atrasos = {}, terreno = {}, tutor = {}, autoeval = {}, semestral = {};
    EVALUACIONES.forEach(ev => {
      if (ev.estado === 'pendiente') return;
      niveles[ev.id] = {}; atrasos[ev.id] = {};
      const set = setFor(ev.nivelesKey), weights = weightsFor(ev.nivelesKey);
      ESTUDIANTES.forEach((est, si) => {
        if (!appliesTo(ev, est.area)) return;
        const enEval = ev.estado === 'en-evaluacion';
        if (enEval && si >= 2) return;
        niveles[ev.id][est.id] = {};
        ev.criterios.forEach((c, ci) => {
          if (enEval && ci >= Math.ceil(ev.criterios.length * 0.6)) return;
          niveles[ev.id][est.id][c.id] = pickKey(set, ev.id + est.id + c.id, weights);
        });
        atrasos[ev.id][est.id] = (si === 1 && ev.id === 'PLAN') ? 1 : 0;
      });
    });
    ESTUDIANTES.forEach((est, si) => {
      const area = est.area, modos = Object.keys(AREAS[area].modos);
      const nVis = si < 3 ? 3 : 2;
      const arr = [];
      for (let i = 0; i < nVis; i++) {
        const modo = modos[i % modos.length];
        const completa = !(si === 4 && i === 1);
        const resp = {};
        terrenoCriterios(area, modo).forEach((c, ci) => {
          if (!completa && ci >= 3) return;
          resp[c.id] = pickKey(NIVELES_APREC, est.id + 'v' + i + c.id, W_APREC);
        });
        arr.push({ id: `v${si}_${i}`, fecha: FECHAS_VISITA[i] || FECHAS_VISITA[0], modo, resp });
      }
      terreno[est.id] = arr;
    });
    ESTUDIANTES.forEach((est, si) => {
      if (si >= 4) { tutor[est.id] = {}; autoeval[est.id] = {}; semestral[est.id] = {}; return; }
      const td = {}; tutorDimsFor(est.area).forEach(d => d.indicadores.forEach(ind => { td[ind.id] = pickKey(NIVELES_FREC, 'tut' + est.id + ind.id, W_FREC); }));
      tutor[est.id] = td;
      const ad = {}; AUTOEVAL_DIMENSIONES.forEach(d => d.indicadores.forEach(ind => { ad[ind.id] = pickKey(NIVELES_FREC, 'aut' + est.id + ind.id, W_FREC); }));
      autoeval[est.id] = ad;
      if (si < 3) { const sd = {}; SEMESTRAL_DIMENSIONES.forEach(d => d.indicadores.forEach(ind => { sd[ind.id] = pickKey(NIVELES_APREC, 'sem' + est.id + ind.id, W_APREC); })); semestral[est.id] = sd; }
      else semestral[est.id] = {};
    });
    return { niveles, atrasos, terreno, tutor, autoeval, semestral };
  }

  function buildPracticaPII() {
    const demo = genDemo();
    return {
      meta: {
        codigo: 'PII',
        nombre: 'Práctica Profesional II',
        cursoTitulo: 'Práctica Profesional II — Integración profesional por mención',
        breadcrumb: 'Práctica Profesional II',
        semestre: 'Semestre 2025-2',
        escuela: 'Facultad de Ciencias Médicas · Entrenador Deportivo',
        kind: 'profesional',
        terreno: true,
        supervisorScreen: 'P3',
        multiMencion: true,
      },
      NIVELES: { NIVELES_EBSD, NIVELES_DSBI, NIVELES_DSI, NIVELES_APREC, NIVELES_FREC, NIVELES_SUPERVISOR: NIVELES_FREC },
      ESCALAS: { ESCALA_PLANIF, ESCALA_SESION, ESCALA_MANUAL, ESCALA_PROYECTO, ESCALA_PROCESO, ESCALA_ENSAYO, ESCALA_PORT1, ESCALA_PORT2, ESCALA_PORT3, ESCALA_TUTOR, ESCALA_AUTO, ESCALA_SEMESTRAL, ESCALA_TERR_DEP_P, ESCALA_TERR_CIE_P, ESCALA_TERR_OBS, ESCALA_TERR_GES },
      GRUPOS: [
        { id: 'documento', label: 'Entregas evaluativas', singular: 'Entrega', sigla: 'E', color: 'teal',
          desc: 'Planificación (todas) + entregas por mención (Sesión y Manual · Proyecto · Procesos) + Ensayo · rúbrica con exigencia 60%' },
        { id: 'portafolio', label: 'Portafolio', singular: 'Portafolio', sigla: 'P', color: 'orange',
          desc: 'Tres evaluaciones de portafolio y bitácora · se promedian con la supervisión en terreno y la evaluación semestral' },
      ],
      EVALUACIONES,
      PONDERACIONES: PONDS_DEP, // representativa (Dashboard); el cálculo usa PONDERACIONES_FOR
      PONDERACIONES_FOR: (estId, state) => {
        const est = (state.estudiantes || ESTUDIANTES).find(e => e.id === estId);
        return pondsForArea(est && est.area);
      },
      pondsForArea,
      PORTAFOLIO_EVAL_IDS,
      SUPERVISOR: { kind: 'profesional', areas: AREAS, formales: TERRENO_FORMALES, terrenoCriterios, notaTerrenoVisita,
                    semestralDimensiones: SEMESTRAL_DIMENSIONES, nivelesKey: 'NIVELES_APREC' },
      TUTOR: { dimensiones: TUTOR_DEP, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_TUTOR', maxPuntos: 64 },
      tutorCfgFor,
      AUTOEVAL: { dimensiones: AUTOEVAL_DIMENSIONES, nivelesKey: 'NIVELES_FREC', escalaKey: 'ESCALA_AUTO', maxPuntos: 68 },
      SEMESTRAL: { dimensiones: SEMESTRAL_DIMENSIONES, nivelesKey: 'NIVELES_APREC', escalaKey: 'ESCALA_SEMESTRAL', maxPuntos: 32 },
      ANEXOS_ADMIN,
      ESTUDIANTES, PROFESORES,
      NOTAS_COLUMNS,
      RESOLVERS: {
        SUP: (estId, state) => notaSupervisorP3(estId, state),
        TUTOR: (estId, state) => {
          const est = (state.estudiantes || ESTUDIANTES).find(e => e.id === estId) || {};
          const r = window.USACH_CALC.calcInstrumento(state.tutor && state.tutor[estId], tutorDimsFor(est.area), NIVELES_FREC, ESCALA_TUTOR);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
        AUTO: (estId, state) => {
          const r = window.USACH_CALC.calcInstrumento(state.autoeval && state.autoeval[estId], AUTOEVAL_DIMENSIONES, NIVELES_FREC, ESCALA_AUTO);
          return r ? { nota: r.nota, parcial: r.parcial } : { nota: null, parcial: true };
        },
      },
      // helpers expuestos a las pantallas P3
      AREAS, areaDef, modosDeArea, modoDef, terrenoCriterios, notaTerrenoVisita, notaSupervisorP3,
      TUTOR_DIMENSIONES: TUTOR_DEP, AUTOEVAL_DIMENSIONES, SEMESTRAL_DIMENSIONES,
      initialState: (estado) => {
        const base = {
          evaluaciones: EVALUACIONES.map(e => ({ ...e })),
          estudiantes: ESTUDIANTES.map(e => ({ ...e })),
          niveles: {}, atrasos: {}, terreno: {}, tutor: {}, autoeval: {}, semestral: {},
          supervisor: {}, supervisorComments: {}, autoevalComments: {}, evalAnexos: {},
        };
        if (estado === 'vacio') return { ...base, estudiantes: [] };
        return {
          ...base,
          niveles: JSON.parse(JSON.stringify(demo.niveles)),
          atrasos: JSON.parse(JSON.stringify(demo.atrasos)),
          terreno: JSON.parse(JSON.stringify(demo.terreno)),
          tutor: JSON.parse(JSON.stringify(demo.tutor)),
          autoeval: JSON.parse(JSON.stringify(demo.autoeval)),
          semestral: JSON.parse(JSON.stringify(demo.semestral)),
          supervisorComments: {
            e1: 'Antonia conduce la sesión con seguridad y mantiene excelente relación con el equipo. Bitácora al día. Reforzar la fundamentación bibliográfica de la planificación.',
            e3: 'Camila domina los protocolos de medición y se desempeña con rigor en el laboratorio. Excelente registro técnico en su bitácora; avanzar en la formulación de hipótesis del proyecto.',
            e5: 'Diego propone mejoras concretas a los procesos del centro y muestra iniciativa. Cuidar los plazos de carga del portafolio.',
          },
          evalAnexos: {
            PLAN: [{ id: 'plan-1', titulo: 'Consigna Planificación Deportiva', tipo: 'Pauta de la evaluación', tamano: '0.4 MB', subido: '01 sep 2025', por: 'Andrés Tapia' }],
            ENS:  [{ id: 'ens-1', titulo: 'Consigna Ensayo Final y Reflexión', tipo: 'Pauta de la evaluación', tamano: '0.3 MB', subido: '10 nov 2025', por: 'Andrés Tapia' }],
            PORT1:[{ id: 'port-1', titulo: 'Formato de Bitácora (Excel)', tipo: 'Material complementario', tamano: '0.3 MB', subido: '28 ago 2025', por: 'Andrés Tapia' }],
          },
        };
      },
    };
  }

  window.registerPractica('PII', buildPracticaPII);
})();
