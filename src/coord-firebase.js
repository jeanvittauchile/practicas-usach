// coord-firebase.js — Capa de datos del Coordinador
// Abstrae Firebase Firestore ↔ localStorage (demo mode).
// Exporta el objeto global DB.

(function () {
  const PRACTICES = ['I', 'II', 'III', 'IV', 'PI', 'PII'];
  const PRACTICE_NAMES = { I: 'Práctica I', II: 'Práctica II', III: 'Práctica III', IV: 'Práctica IV', PI: 'Práctica Profesional I', PII: 'Práctica Profesional II' };
  const COHORTES = [2021, 2022, 2023, 2024, 2025];

  // ─── Datos demo ───────────────────────────────────────────────────────────
  const DEMO_PROFS = [
    { id:'p01', nombre:'Prof. Andrés Tapia Vergara',    email:'andres.tapia@usach.cl',    rol:'profesor', practicasAsignadas:['I','II','III'] },
    { id:'p02', nombre:'Prof. María Inés Cáceres',      email:'maria.caceres@usach.cl',    rol:'profesora', practicasAsignadas:['IV','PI','PII'] },
    { id:'p03', nombre:'Prof. Roberto Sánchez Muñoz',   email:'roberto.sanchez@usach.cl',  rol:'profesor', practicasAsignadas:['I','II'] },
    { id:'p04', nombre:'Prof. Carmen López Torres',     email:'carmen.lopez@usach.cl',     rol:'profesora', practicasAsignadas:['III','PI'] },
    { id:'p05', nombre:'Prof. Jorge Vega Morales',      email:'jorge.vega@usach.cl',       rol:'profesor', practicasAsignadas:['I'] },
    { id:'p06', nombre:'Prof. Claudia Ramos Araya',     email:'claudia.ramos@usach.cl',    rol:'profesora', practicasAsignadas:['II','IV'] },
    { id:'p07', nombre:'Prof. Luis Fuentes Pinto',      email:'luis.fuentes@usach.cl',     rol:'profesor', practicasAsignadas:['PII'] },
    { id:'p08', nombre:'Prof. Valentina Cruz Meza',     email:'valentina.cruz@usach.cl',   rol:'profesora', practicasAsignadas:['PI','PII'] },
    { id:'p09', nombre:'Prof. Marco Ortega Díaz',       email:'marco.ortega@usach.cl',     rol:'profesor', practicasAsignadas:['I','III'] },
    { id:'p10', nombre:'Prof. Andrea Molina Lagos',     email:'andrea.molina@usach.cl',    rol:'profesora', practicasAsignadas:['II','PI'] },
    { id:'p11', nombre:'Prof. Felipe Rojas Espinoza',   email:'felipe.rojas@usach.cl',     rol:'profesor', practicasAsignadas:['IV'] },
    { id:'p12', nombre:'Prof. Natalia Peña Vargas',     email:'natalia.pena@usach.cl',     rol:'profesora', practicasAsignadas:['I','II','IV'] },
    { id:'p13', nombre:'Prof. Sebastián Ríos Pizarro',  email:'sebastian.rios@usach.cl',   rol:'profesor', practicasAsignadas:['III','PII'] },
    { id:'p14', nombre:'Prof. Daniela Castro Bravo',    email:'daniela.castro@usach.cl',   rol:'profesora', practicasAsignadas:['PI'] },
    { id:'p15', nombre:'Prof. Rodrigo Alvarado Silva',  email:'rodrigo.alvarado@usach.cl', rol:'profesor', practicasAsignadas:['I','II','III','IV'] },
    { id:'p16', nombre:'Prof. Javiera Godoy Reyes',     email:'javiera.godoy@usach.cl',    rol:'profesora', practicasAsignadas:['PII'] },
    { id:'p17', nombre:'Prof. Cristóbal Navas Flores',  email:'cristobal.navas@usach.cl',  rol:'profesor', practicasAsignadas:['I'] },
    { id:'p18', nombre:'Prof. Alejandra Ruiz Vera',     email:'alejandra.ruiz@usach.cl',   rol:'profesora', practicasAsignadas:['II','III','PI'] },
    { id:'p19', nombre:'Prof. Diego Herrera Muñoz',     email:'diego.herrera@usach.cl',    rol:'profesor', practicasAsignadas:['IV','PII'] },
    { id:'p20', nombre:'Prof. Isabel Araya Contreras',  email:'isabel.araya@usach.cl',     rol:'profesora', practicasAsignadas:['I','PI'] },
  ];

  const FIRST = ['Martina','Ignacio','Catalina','Tomás','Valentina','Benjamín','Camila','Sebastián','Fernanda','Matías','Carolina','Felipe','Daniela','Andrés','Francisca','Diego','Javiera','Cristóbal','Antonia','Rodrigo'];
  const LAST  = ['Salinas Rojas','Vergara Lillo','Pizarro Díaz','Reyes Hernández','Cortés Mura','Soto Carrasco','Riquelme Núñez','Mella Jara','Fuentes Aguilera','Pérez Vega','López Torres','González Muñoz','Ramírez Silva','Castro Bravo','Morales Ríos','Flores Araya','Vega Molina','Ortega Pinto','Cruz Meza','Herrera Lagos'];

  function seedStudents(profs) {
    const students = [];
    for (let i = 0; i < 60; i++) {
      const fn = FIRST[i % FIRST.length];
      const ln = LAST[Math.floor(i / FIRST.length) % LAST.length];
      const practica = PRACTICES[i % PRACTICES.length];
      const eligible = profs.filter(p => p.practicasAsignadas.includes(practica));
      const prof = eligible[i % (eligible.length || 1)] || profs[0];
      const cohorte = COHORTES[i % COHORTES.length];
      const rut = `${20 + Math.floor(i/10)}.${String(100 + (i*17) % 900).padStart(3,'0')}.${String((i*33)%999+1).padStart(3,'0')}-${i%9}`;
      students.push({
        id: `s${String(i+1).padStart(2,'0')}`,
        nombre: `${fn} ${ln}`,
        rut,
        email: `${fn.toLowerCase()}.${ln.split(' ')[0].toLowerCase()}${i}@usach.cl`,
        telefono: `+56 9 ${String(6000 + i*17).slice(0,4)} ${String(1000 + i*53).slice(0,4)}`,
        cohorte,
        practica,
        profesorId: prof.id,
        area: practica === 'PII' ? ['deportiva','ciencias','gestion'][i % 3] : null,
        centro: ['Club Deportivo Santiago','Escuela Municipal Deportes','Corp. Municipal Maipú','USACH Rendimiento','Club Atlético'][i % 5],
      });
    }
    return students;
  }

  const INSTITUCIONES = ['Club Atlético Santiago Centro','Escuela de Fútbol Maipú','Centro de Rendimiento Deportivo USACH','Corporación Municipal de Deportes Maipú','Club Deportivo Universidad de Santiago'];
  function seedCartas(students, profs) {
    const sample = students.slice(0, 12);
    return sample.map((s, i) => {
      const prof = profs.find(p => p.id === s.profesorId) || profs[0];
      const d = new Date(2025, 7 + Math.floor(i/4), 15 + (i % 12));
      return {
        id: `c${String(i+1).padStart(2,'0')}`,
        estudianteId: s.id,
        estudianteNombre: s.nombre,
        rut: s.rut,
        practica: s.practica,
        profesorId: prof.id,
        profesorNombre: prof.nombre,
        institucion: INSTITUCIONES[i % INSTITUCIONES.length],
        fechaEmision: d.toISOString().slice(0,10),
        vigencia: '2025-12-31',
        estado: i < 8 ? 'emitida' : i < 10 ? 'pendiente' : 'cancelada',
        nota: i >= 8 && i < 10 ? 'Pendiente firma de director' : '',
      };
    });
  }

  // ─── Disponibilidad horaria + Centros de práctica ─────────────────────────
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const AV_SLOTS = [
    { dia:'Lun', desde:'08:30', hasta:'12:30' },
    { dia:'Lun', desde:'14:00', hasta:'18:00' },
    { dia:'Mar', desde:'09:00', hasta:'13:00' },
    { dia:'Mar', desde:'15:00', hasta:'19:00' },
    { dia:'Mié', desde:'14:00', hasta:'19:00' },
    { dia:'Jue', desde:'08:00', hasta:'12:00' },
    { dia:'Jue', desde:'16:00', hasta:'20:00' },
    { dia:'Vie', desde:'15:00', hasta:'19:00' },
  ];
  function genDisponibilidad(i) {
    const n = 2 + (i % 2);
    const out = [];
    for (let k = 0; k < n; k++) out.push({ ...AV_SLOTS[(i * 3 + k * 2) % AV_SLOTS.length] });
    return out.filter((b, idx, arr) => arr.findIndex(x => x.dia === b.dia && x.desde === b.desde) === idx);
  }

  const DEMO_CENTROS = [
    { id:'ct01', nombre:'Club Deportivo Santiago', direccion:'Av. Matucana 1020', comuna:'Santiago Centro', area:'Deportiva',
      encargado:{ nombre:'Patricio Salas Mena', cargo:'Director deportivo' },
      tutor:{ nombre:'Camilo Reyes Ortiz', email:'creyes@cdsantiago.cl', telefono:'+56 9 8431 2290' },
      horarios:[ { dia:'Lun', desde:'16:00', hasta:'20:00' }, { dia:'Mié', desde:'16:00', hasta:'20:00' } ] },
    { id:'ct02', nombre:'Escuela Municipal Deportes', direccion:'Pajaritos 2530', comuna:'Estación Central', area:'Formativa',
      encargado:{ nombre:'Verónica Aguilar Pino', cargo:'Coordinadora de talleres' },
      tutor:{ nombre:'Daniela Soto Maldonado', email:'dsoto@emdeportes.cl', telefono:'+56 9 7712 0584' },
      horarios:[ { dia:'Mar', desde:'09:00', hasta:'13:00' }, { dia:'Jue', desde:'09:00', hasta:'13:00' } ] },
    { id:'ct03', nombre:'Corp. Municipal Maipú', direccion:'Av. 5 de Abril 0260', comuna:'Maipú', area:'Gestión / Comunitaria',
      encargado:{ nombre:'Rodrigo Fuenzalida Vera', cargo:'Jefe de deportes municipal' },
      tutor:{ nombre:'Marcela Tapia Riquelme', email:'mtapia@maipu.cl', telefono:'+56 9 6320 1147' },
      horarios:[ { dia:'Lun', desde:'08:30', hasta:'13:30' }, { dia:'Mié', desde:'14:00', hasta:'18:00' } ] },
    { id:'ct04', nombre:'USACH Rendimiento', direccion:'Av. L. B. O\u2019Higgins 3363', comuna:'Estación Central', area:'Ciencias del Deporte',
      encargado:{ nombre:'Ignacio Bravo León', cargo:'Encargado laboratorio rendimiento' },
      tutor:{ nombre:'Paula Cárcamo Vidal', email:'paula.carcamo@usach.cl', telefono:'+56 9 9045 7723' },
      horarios:[ { dia:'Mié', desde:'14:00', hasta:'19:00' }, { dia:'Vie', desde:'15:00', hasta:'19:00' } ] },
    { id:'ct05', nombre:'Club Atlético', direccion:'Irarrázaval 4200', comuna:'Ñuñoa', area:'Atletismo',
      encargado:{ nombre:'Héctor Miranda Cea', cargo:'Presidente del club' },
      tutor:{ nombre:'Andrés Lillo Faúndez', email:'alillo@clubatletico.cl', telefono:'+56 9 5567 8810' },
      horarios:[ { dia:'Mar', desde:'09:00', hasta:'13:00' }, { dia:'Jue', desde:'16:00', hasta:'20:00' } ] },
  ];

  // Solapamiento de bloques horarios (mismo día, rangos que se intersectan)
  function overlap(a, b) { return a.dia === b.dia && a.desde < b.hasta && b.desde < a.hasta; }
  function fmtBlock(b) { return `${b.dia} ${b.desde}–${b.hasta}`; }
  // Devuelve los cruces disponibilidad-profesor ↔ horario-centro
  function profMatchCentro(prof, centro) {
    const matches = [];
    (centro.horarios || []).forEach(h => {
      (prof.disponibilidad || []).forEach(d => { if (overlap(d, h)) matches.push({ centro:h, prof:d }); });
    });
    return matches;
  }

  // ─── localStorage keys ────────────────────────────────────────────────────
  const K = { profs:'coord_profs', students:'coord_students', cartas:'coord_cartas', centros:'coord_centros', init:'coord_init_v3' };
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // La app arranca con base de datos VACÍA. Los datos reales se cargan desde
  // la UI (Profesores, Estudiantes, Centros). init() ya no siembra nada.
  function initDemo() { /* no-op: base de datos vacía por defecto */ }

  // Siembra opcional de datos de ejemplo (útil para demos / pruebas locales).
  // Llamar desde la consola: DB.seedEjemplo()
  function seedEjemplo() {
    const profs = DEMO_PROFS.map((p, i) => ({
      ...p,
      horasAsignadas: (p.practicasAsignadas.length * 22) + (i % 3) * 6,
      disponibilidad: genDisponibilidad(i),
    }));
    const students = seedStudents(profs);
    const cartas = seedCartas(students, profs);
    write(K.profs, profs);
    write(K.students, students);
    write(K.cartas, cartas);
    write(K.centros, DEMO_CENTROS);
    write(K.init, '1');
    return { profs: profs.length, students: students.length, cartas: cartas.length, centros: DEMO_CENTROS.length };
  }

  // ─── DB API ───────────────────────────────────────────────────────────────
  const DB = {
    PRACTICES, PRACTICE_NAMES, COHORTES,
    init: initDemo,
    seedEjemplo,
    // Professors
    getProfs()         { return read(K.profs) || []; },
    saveProf(p) {
      const list = this.getProfs();
      const idx = list.findIndex(x => x.id === p.id);
      if (idx >= 0) list[idx] = p;
      else list.push({ ...p, id: 'p_' + Date.now() });
      write(K.profs, list);
    },
    deleteProf(id) { write(K.profs, this.getProfs().filter(p => p.id !== id)); },
    // Students
    getStudents()      { return read(K.students) || []; },
    saveStudent(s) {
      const list = this.getStudents();
      const idx = list.findIndex(x => x.id === s.id);
      if (idx >= 0) list[idx] = s;
      else list.push({ ...s, id: 's_' + Date.now() });
      write(K.students, list);
    },
    deleteStudent(id) { write(K.students, this.getStudents().filter(s => s.id !== id)); },
    importStudents(rows, profesorId, practica) {
      // rows: [{nombre, rut, email, cohorte, ...}]
      // profesorId/practica son solo el respaldo cuando la fila no trae uno propio.
      const list = this.getStudents();
      rows.forEach(r => {
        list.push({
          ...r,
          id: 's_' + Date.now() + Math.random(),
          profesorId: r.profesorId || profesorId || '',
          practica: r.practica || practica || 'I',
        });
      });
      write(K.students, list);
    },
    // Cartas
    getCartas()        { return read(K.cartas) || []; },
    saveCarta(c) {
      const list = this.getCartas();
      const idx = list.findIndex(x => x.id === c.id);
      if (idx >= 0) list[idx] = c;
      else list.push({ ...c, id: 'c_' + Date.now() });
      write(K.cartas, list);
    },
    deleteCarta(id) { write(K.cartas, this.getCartas().filter(c => c.id !== id)); },
    // Centros de práctica
    getCentros()       { return read(K.centros) || []; },
    saveCentro(c) {
      const list = this.getCentros();
      const idx = list.findIndex(x => x.id === c.id);
      if (idx >= 0) list[idx] = c;
      else list.push({ ...c, id: 'ct_' + Date.now() });
      write(K.centros, list);
    },
    deleteCentro(id) { write(K.centros, this.getCentros().filter(c => c.id !== id)); },
    // Visitas en terreno (fotos)
    getVisitas()       { return read('usach_visitas_v1') || []; },
    saveVisita(v)      { const list = this.getVisitas(); list.push(v); write('usach_visitas_v1', list); },
    deleteVisita(id)   { write('usach_visitas_v1', this.getVisitas().filter(v => v.id !== id)); },
  };

  window.DB = DB;
  window.SCHED = { DIAS, overlap, fmtBlock, profMatchCentro };
  window.PRACTICE_NAMES = PRACTICE_NAMES;
  window.PRACTICES = PRACTICES;

  // ─── Catálogo estático de evaluaciones (todas las prácticas) ──────────────
  window.EVAL_CATALOG = [
    {
      codigo:'I', nombre:'Práctica I \u2014 Introducción al Campo Laboral', color:'#009688',
      ra: 'Introducirse al campo laboral deportivo mediante actividades de observación, análisis y reflexión en instituciones y centros deportivos.',
      evaluaciones: [
        { id:'S1', titulo:'Cápsula de video: Entrevista a un entrenador/a', tipo:'Audiovisual (15 min)', puntos:30, descripcion:'Entrevista en formato audiovisual con análisis y reflexión sobre la experiencia profesional del entrenador/a.' },
        { id:'T2', titulo:'Preguntas para entrevista a entrenador/a', tipo:'Informe escrito', puntos:18, descripcion:'Elaboración fundamentada de preguntas para la entrevista, con análisis de fuentes y reflexión crítica.' },
        { id:'S2', titulo:'Investigación en terreno: Corporación de Deportes Municipal', tipo:'Terreno + Informe (6–8 pp.)', puntos:30, descripcion:'Visita a la corporación de deportes de la comuna e informe descriptivo del funcionamiento institucional.' },
        { id:'S3', titulo:'Investigación en terreno: Comité Olímpico o Paralímpico', tipo:'Terreno + Informe (6–8 pp.)', puntos:30, descripcion:'Investigación sobre un deporte en el Estadio Nacional, Comité Olímpico o Paralímpico de Chile.' },
        { id:'T1', titulo:'Ensayo personal: Buscando tu identidad', tipo:'Ensayo (3–5 pp.)', puntos:18, descripcion:'Reflexión narrativa sobre identidad y vocación profesional como futuro/a entrenador/a deportivo/a.' },
        { id:'T3', titulo:'Cápsula de video sobre motivaciones a futuro', tipo:'Audiovisual (5–8 min)', puntos:18, descripcion:'Cápsula audiovisual sobre motivaciones y metas en la carrera de entrenador/a deportivo/a.' },
        { id:'SUP', titulo:'Evaluación del/la Supervisor/a', tipo:'Instrumento de apreciación', puntos:'—', descripcion:'Evaluación del desempeño en reuniones, actividades y actitud a lo largo del semestre.' },
      ],
      ponderaciones: [
        { label:'Evaluación 1 (S1) + Taller 2 (T2)', peso:'15%' },
        { label:'Evaluación 2 (S2)', peso:'15%' },
        { label:'Evaluación 3 (S3)', peso:'20%' },
        { label:'Taller 1 (T1) + Taller 3 (T3)', peso:'20%' },
        { label:'Evaluación Supervisor/a', peso:'30%' },
      ],
    },
    {
      codigo:'II', nombre:'Práctica II \u2014 Escuelas y Talleres Deportivos', color:'#1565C0',
      ra: 'Intervenir en escuelas y talleres deportivos, realizando diagnóstico de habilidades motrices y diseñando estrategias para su desarrollo.',
      evaluaciones: [
        { id:'INF', titulo:'Informe: Diagnóstico y Desarrollo de Habilidades Motrices', tipo:'Informe Word (máx. 7 pp.)', puntos:45, descripcion:'Diagnóstico del centro e indagación en el desarrollo de habilidades motrices de los usuarios.' },
        { id:'MAN', titulo:'Manual Técnico de Psicomotricidad en el Deporte', tipo:'Manual técnico PDF', puntos:51, descripcion:'Manual digital con actividades para el desarrollo de habilidades motrices del deporte del centro.' },
        { id:'PRE', titulo:'Presentación Final', tipo:'Presentación (15 min + 5 preguntas)', puntos:39, descripcion:'Exposición de la experiencia de intervención y reflexión sobre la integración teoría-práctica.' },
        { id:'PORT', titulo:'Portafolio y Bitácora', tipo:'Portafolio Drive', puntos:42, descripcion:'Evaluación única: construcción y carga del portafolio, con una sección dedicada a la bitácora de registro diario (9 indicadores).' },
        { id:'TUTOR', titulo:'Evaluación Entrenador/a Tutor/a del centro', tipo:'Instrumento de frecuencia', puntos:'—', descripcion:'Evaluación del desempeño formal, disciplinar y actitudinal del estudiante en el centro.' },
        { id:'SUP', titulo:'Supervisión en terreno + Proceso', tipo:'Escala de apreciación', puntos:'—', descripcion:'Visitas del supervisor/a al terreno más evaluación del proceso (bitácora y asistencia).' },
        { id:'AUTO', titulo:'Autoevaluación', tipo:'Instrumento de frecuencia', puntos:'—', descripcion:'Reflexión del estudiante sobre su propio desempeño durante la práctica.' },
      ],
      ponderaciones: [
        { label:'Informe de diagnóstico', peso:'15%' },
        { label:'Manual técnico', peso:'20%' },
        { label:'Presentación Final', peso:'15%' },
        { label:'Portafolio (Construcción + Bitácora)', peso:'10%' },
        { label:'Evaluación Entrenador/a Tutor/a del centro', peso:'20%' },
        { label:'Supervisión en terreno + Proceso', peso:'15%' },
        { label:'Autoevaluación', peso:'5%' },
      ],
    },
    {
      codigo:'III', nombre:'Práctica III \u2014 Intervención en Fitness y Actividad Física', color:'#880E4F',
      ra: 'Intervenir en centros de fitness y actividad física, diseñando y ejecutando planificaciones de entrenamiento adaptadas al contexto.',
      evaluaciones: [
        { id:'INF', titulo:'Informe: Descripción administrativa y técnica de la actividad', tipo:'Informe Word (máx. 8 pp.)', puntos:54, descripcion:'Descripción del centro de práctica, la disciplina, los métodos de entrenamiento y los usuarios del servicio.' },
        { id:'PLAN', titulo:'Planificación de entrenamiento (8 sesiones)', tipo:'Excel + Word (anexo)', puntos:40, descripcion:'Planificación basada en las capacidades físicas predominantes, según instrucciones del tutor/a del centro.' },
        { id:'PRES', titulo:'Presentación Final', tipo:'Exposición PPT/Canva/Prezi (15 min)', puntos:42, descripcion:'Exposición de la experiencia de intervención y reflexión sobre la integración teoría-práctica.' },
        { id:'PORT', titulo:'Portafolio y Bitácora', tipo:'Portafolio Drive', puntos:39, descripcion:'Evaluación única: construcción y carga del portafolio, con una sección dedicada a la bitácora de sesiones (9 indicadores).' },
        { id:'TUTOR', titulo:'Evaluación Entrenador/a Tutor/a', tipo:'Instrumento de frecuencia', puntos:'—', descripcion:'Evaluación del desempeño realizada por el entrenador/a tutor/a del centro de práctica.' },
        { id:'SUP', titulo:'Supervisión en terreno + Portafolio', tipo:'Escala de apreciación', puntos:'—', descripcion:'Visitas del supervisor/a al terreno promediadas con la evaluación del portafolio.' },
      ],
      ponderaciones: [
        { label:'Informe (descripción admin. y técnica)', peso:'20%' },
        { label:'Planificación de entrenamiento', peso:'20%' },
        { label:'Presentación Final', peso:'20%' },
        { label:'Evaluación Entrenador/a Tutor/a', peso:'20%' },
        { label:'Supervisión en terreno + Portafolio', peso:'20%' },
      ],
    },
    {
      codigo:'IV', nombre:'Práctica IV \u2014 Intervención deportiva con tutor/a', color:'#E65100',
      ra: 'Intervenir activamente en el centro de práctica desarrollando una planificación de entrenamiento adaptada al contexto deportivo.',
      evaluaciones: [
        { id:'INF', titulo:'Informe: Estructura organizacional y descripción del deporte', tipo:'Informe Word (máx. 8 pp.)', puntos:'66 (indiv.) / 63 (col.)', descripcion:'Describe el centro y el deporte. Dos variantes: deporte individual (20 criterios, 66 pts) o colectivo (19 criterios, 63 pts).' },
        { id:'PLAN', titulo:'Planificación de entrenamiento deportivo', tipo:'Excel editable', puntos:51, descripcion:'Mesociclo de 4 microciclos con mínimo 8 sesiones para el objetivo concreto acordado con el tutor/a.' },
        { id:'PRES', titulo:'Presentación Final', tipo:'Exposición PPT/Canva/Prezi (15 min)', puntos:48, descripcion:'Exposición reflexiva contrastando las expectativas iniciales del informe con la experiencia de intervención.' },
        { id:'PORT', titulo:'Portafolio y Bitácora', tipo:'Portafolio Drive', puntos:39, descripcion:'Evaluación única: construcción y carga del portafolio (4 criterios), con una sección dedicada a la bitácora de sesiones (9 indicadores).' },
        { id:'TUTOR', titulo:'Evaluación Entrenador/a Tutor/a', tipo:'Escala de frecuencia (S/CS/O/CN/N)', puntos:56, descripcion:'3 dimensiones: aspectos formales, disciplinares y actitudinales, evaluadas por el tutor/a del centro.' },
        { id:'SUP', titulo:'Supervisión + Portafolio', tipo:'Escala de apreciación (L/ML/NL/I/NO)', puntos:'—', descripcion:'Visitas en terreno (participación ideal 48 pts / observación ideal 24 pts) promediadas con el portafolio.' },
        { id:'AUTO', titulo:'Autoevaluación', tipo:'Escala de frecuencia (S/CS/O/CN/N)', puntos:64, descripcion:'6 dimensiones: responsabilidad, solución de problemas, participación, desarrollo disciplinar, comunicación, actitud.' },
      ],
      ponderaciones: [
        { label:'Informe (estructura y descripción del deporte)', peso:'20%' },
        { label:'Planificación de entrenamiento', peso:'20%' },
        { label:'Presentación Final', peso:'15%' },
        { label:'Evaluación Entrenador/a Tutor/a', peso:'20%' },
        { label:'Supervisión + Portafolio', peso:'20%' },
        { label:'Autoevaluación', peso:'5%' },
      ],
    },
    {
      codigo:'PI', nombre:'Práctica Profesional I \u2014 Integración al Campo Profesional', color:'#4A148C',
      ra: 'Integrarse al campo profesional desarrollando acciones de intervención y elaborando un proyecto de mejora para el centro de práctica, según mención.',
      nota: '3 menciones: Deportiva, Fitness/Comunitaria y Gestión Deportiva. Las supervisiones en terreno difieren por área, pero las evaluaciones documentales y ponderaciones son comunes.',
      evaluaciones: [
        { id:'INF', titulo:'Informe: Estructura Organizacional y Descripción del Deporte/Área', tipo:'Informe Word (máx. 8 pp.)', puntos:51, descripcion:'Descripción del centro, la estructura organizacional y caracterización técnica de la disciplina o área profesional.' },
        { id:'PRO', titulo:'Proyecto de Mejora, Presentación y Reflexión', tipo:'Informe + Presentación (15 min)', puntos:104, descripcion:'Proyecto de mejora con fundamentación técnica y económica + reflexión de la intervención semestral.' },
        { id:'PORT', titulo:'Portafolio Virtual y Bitácora', tipo:'Portafolio Drive', puntos:33, descripcion:'Portafolio en DRIVE con registro diario de la bitácora, revisado en las supervisiones en terreno.' },
        { id:'TUTOR', titulo:'Evaluación Entrenador/a Tutor/a o Guía', tipo:'Escala de frecuencia', puntos:'—', descripcion:'Evaluación del desempeño formal, disciplinar y actitudinal realizada por el guía del centro.' },
        { id:'SUP', titulo:'Supervisión + Portafolio', tipo:'Escala de apreciación', puntos:'—', descripcion:'Visitas del supervisor/a diferenciadas por mención (Deportiva/Fitness/Gestión) + portafolio.' },
        { id:'AUTO', titulo:'Autoevaluación', tipo:'Escala de frecuencia', puntos:'—', descripcion:'6 dimensiones de autoevaluación del desempeño profesional durante la práctica.' },
      ],
      ponderaciones: [
        { label:'Informe (estructura organizacional)', peso:'15%' },
        { label:'Proyecto de Mejora + Presentación + Reflexión', peso:'30%' },
        { label:'Evaluación Entrenador/a Tutor/a', peso:'25%' },
        { label:'Supervisión + Portafolio', peso:'25%' },
        { label:'Autoevaluación', peso:'5%' },
      ],
    },
    {
      codigo:'PII', nombre:'Práctica Profesional II \u2014 Integración profesional por mención', color:'#1B5E20',
      ra: 'Integrar equipos multidisciplinarios demostrando dominio de las competencias profesionales en el ámbito deportivo, de gestión o de ciencias del deporte.',
      nota: 'Las ponderaciones varían por mención. Evaluación Entrenador/a Tutor/a incluye Eval. Semestral del Supervisor/a.',
      evaluaciones: [
        { id:'PLAN', titulo:'Planificación Deportiva (macrociclo)', tipo:'Excel + Presentación (20 min)', puntos:36, descripcion:'Planificación de una temporada para el grupo intervenido, con periodización, objetivos y distribución de cargas.' },
        { id:'SESION', titulo:'Sesión de Entrenamiento (ejecución + preguntas)', tipo:'Ejecución en terreno', puntos:32, descripcion:'[Solo Entrenador] Diseño y ejecución de sesión completa con fundamentación técnica y análisis reflexivo.' },
        { id:'MANUAL', titulo:'Manual de Ejercicios', tipo:'Manual Word/PDF (máx. 20 pp.)', puntos:32, descripcion:'[Solo Entrenador] ≥10 ejercicios para una cualidad física y una técnica, con descripción metodológica.' },
        { id:'PROY', titulo:'Proyecto de Investigación (propuesta)', tipo:'Propuesta Word', puntos:36, descripcion:'[Solo Ciencias] Propuesta sin resultados: planteamiento, metodología, variables, factibilidad y referencias.' },
        { id:'PROC', titulo:'Proceso en mi Centro de Práctica (rediseño)', tipo:'Informe Word (máx. 8 pp.)', puntos:32, descripcion:'[Solo Gestión] Diagnóstico de un proceso de gestión real y propuesta de mejora (formato Antes/Después).' },
        { id:'ENS', titulo:'Ensayo Final y Reflexión', tipo:'Ensayo (máx. 3 pp.) + Presentación', puntos:51, descripcion:'Ensayo argumentativo y presentación de reflexión sobre la integración teoría-práctica y desarrollo profesional.' },
        { id:'TUTOR', titulo:'Evaluación Tutor/a o Guía + Eval. Semestral', tipo:'Escala de frecuencia', puntos:64, descripcion:'Desempeño formal, disciplinar y actitudinal. El instrumento varía para Gestión vs. Entrenador/Ciencias.' },
        { id:'SUP', titulo:'Supervisión + Portafolio (3 evaluaciones)', tipo:'Escala de apreciación', puntos:'—', descripcion:'Visitas en terreno diferenciadas por área + 3 evaluaciones del portafolio + Eval. Semestral del Supervisor.' },
        { id:'AUTO', titulo:'Autoevaluación', tipo:'Escala de frecuencia', puntos:68, descripcion:'7 dimensiones: responsabilidad, solución de problemas, participación, desarrollo disciplinar, comunicación, actitud y reflexión profesional.' },
      ],
      ponderacionesMencion: [
        { mencion:'Entrenador (Deportiva)', ponds:[
          { label:'Planificación Deportiva', peso:'20%' }, { label:'Sesión de Entrenamiento', peso:'15%' },
          { label:'Manual de Ejercicios', peso:'15%' }, { label:'Ensayo Final + Reflexión', peso:'10%' },
          { label:'Evaluación Tutor/a', peso:'20%' }, { label:'Superv. + Portafolio + Semestral', peso:'15%' }, { label:'Autoevaluación', peso:'5%' },
        ]},
        { mencion:'Ciencias del Deporte', ponds:[
          { label:'Planificación Deportiva', peso:'20%' }, { label:'Proyecto de Investigación', peso:'20%' },
          { label:'Ensayo Final + Reflexión', peso:'15%' }, { label:'Evaluación Tutor/a', peso:'25%' },
          { label:'Superv. + Portafolio + Semestral', peso:'15%' }, { label:'Autoevaluación', peso:'5%' },
        ]},
        { mencion:'Gestión Deportiva', ponds:[
          { label:'Planificación Deportiva', peso:'20%' }, { label:'Rediseño de Procesos', peso:'20%' },
          { label:'Ensayo Final + Reflexión', peso:'10%' }, { label:'Evaluación Tutor/a', peso:'20%' },
          { label:'Superv. + Portafolio + Semestral', peso:'25%' }, { label:'Autoevaluación', peso:'5%' },
        ]},
      ],
    },
  ];
})();
