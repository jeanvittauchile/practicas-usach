// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN FIREBASE — Prácticas USACH
// ─────────────────────────────────────────────────────────────────────────────
// Pasos resumidos (guía completa en README.md):
// 1. console.firebase.google.com → crea el proyecto.
// 2. Agrega una app web (ícono </>) y copia la config en FIREBASE_CONFIG abajo.
// 3. Authentication → Sign-in method → activa "Correo electrónico/contraseña".
// 4. Firestore Database → crea la base (modo producción).
// 5. Publica las reglas del archivo firestore.rules.
// 6. Crea el documento  config/acceso  con (correos en MINÚSCULAS):
//      { coordinadores: ["jean.vitta@usach.cl", "natalia.osorior@usach.cl"] }
// 7. En Authentication crea esas dos cuentas (o que ingresen y se auto-registran).
// ─────────────────────────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyDDlu7KPcCVGmN0qxQZvf_DipwyhJEThYo',
  authDomain:        'practicas-usach.firebaseapp.com',
  projectId:         'practicas-usach',
  storageBucket:     'practicas-usach.firebasestorage.app',
  messagingSenderId: '536298256142',
  appId:             '1:536298256142:web:e443afba40e56695be895f',
};

// ─── Modo DEMO ─────────────────────────────────────────────────────────────
// Si apiKey es el placeholder, la app corre con localStorage sin Firebase.
// Cambia a tu config real para activar Firebase.
const DEMO_MODE = FIREBASE_CONFIG.apiKey.startsWith('PEGA_TU');

// Clave de localStorage para la sesión activa
const AUTH_KEY = 'usach_auth_v2';

// Credenciales en modo DEMO
const DEMO_USERS = {
  'coordinador@usach.cl':   { password: 'usach2025', rol: 'coordinador', nombre: 'Prof. Ana Martínez Vidal' },
  'andres.tapia@usach.cl':  { password: 'usach2025', rol: 'profesor',    nombre: 'Prof. Andrés Tapia Vergara' },
  'maria.caceres@usach.cl': { password: 'usach2025', rol: 'profesor',    nombre: 'Prof. María Inés Cáceres' },
};

// Helper: leer sesión actual
function getAuthUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}
// Helper: guardar sesión
function setAuthUser(u) {
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
}
