// cloud.js — Capa de sincronización Firebase ↔ localStorage (espejo KV)
// ─────────────────────────────────────────────────────────────────────────
// Estrategia: mantener localStorage como caché SÍNCRONA (las pantallas siguen
// leyendo DB.getX() sin reescribirse) y espejar ciertas claves a Firestore
// (colección `kv`), de modo que los datos vivan en la nube y se sincronicen
// entre dispositivos y cuentas.
//
// Carga DESPUÉS de firebase-config.js y de los SDK de Firebase, y ANTES de
// los scripts de datos/app. Expone window.CLOUD.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  // Claves de localStorage que se espejan a Firestore. Coinciden por prefijo.
  // (Las fotos de visitas NO se espejan: son base64 pesado → usar Firebase
  //  Storage en una fase posterior.)
  const MIRROR = ['coord_profs', 'coord_students', 'coord_cartas', 'coord_centros', 'usach_state_v1_', 'usach_usuarios'];
  const KV_COLLECTION = 'kv';
  const DEBOUNCE_MS = 600;

  const isFirebase = (typeof DEMO_MODE !== 'undefined') ? !DEMO_MODE : false;

  // Guardamos referencias nativas ANTES de parchar.
  const _setItem = Storage.prototype.setItem.bind(window.localStorage);
  const _removeItem = Storage.prototype.removeItem.bind(window.localStorage);

  const matches = (key) => MIRROR.some(p => key === p || key.startsWith(p));

  let fs = null;            // firestore handle
  let authUser = null;      // firebase auth user
  const pushTimers = {};    // key → timeout
  let ready;                // resolved cuando boot termina

  // ─── Empuje con debounce a Firestore ────────────────────────────────────
  function schedulePush(key, value) {
    if (!isFirebase || !fs) return;
    clearTimeout(pushTimers[key]);
    pushTimers[key] = setTimeout(() => {
      fs.collection(KV_COLLECTION).doc(key).set({
        value: value == null ? null : String(value),
        updatedAt: Date.now(),
        updatedBy: (authUser && authUser.email) || null,
      }).catch(err => console.warn('[CLOUD] push falló', key, err.message));
    }, DEBOUNCE_MS);
  }
  function scheduleDelete(key) {
    if (!isFirebase || !fs) return;
    clearTimeout(pushTimers[key]);
    fs.collection(KV_COLLECTION).doc(key).delete()
      .catch(err => console.warn('[CLOUD] delete falló', key, err.message));
  }

  // ─── Parche de localStorage: write-through al espejo ─────────────────────
  Storage.prototype.setItem = function (key, value) {
    _setItem(key, value);
    if (matches(key)) schedulePush(key, value);
  };
  Storage.prototype.removeItem = function (key) {
    _removeItem(key);
    if (matches(key)) scheduleDelete(key);
  };

  // ─── Pull inicial: Firestore → localStorage (sin re-disparar push) ───────
  async function pullAll() {
    if (!isFirebase || !fs) return;
    try {
      const snap = await fs.collection(KV_COLLECTION).get();
      snap.forEach(doc => {
        const data = doc.data();
        if (data && data.value != null && matches(doc.id)) {
          _setItem(doc.id, data.value);   // nativo: no re-espeja
        }
      });
      console.log('[CLOUD] sincronizado desde Firestore:', snap.size, 'claves');
    } catch (err) {
      console.warn('[CLOUD] pull inicial falló:', err.message);
    }
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────
  function boot() {
    if (!isFirebase) {
      console.log('[CLOUD] modo DEMO — solo localStorage');
      return Promise.resolve({ mode: 'demo', user: null });
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    fs = firebase.firestore();
    // Sesión persistente en el navegador
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

    return new Promise((resolve) => {
      const unsub = firebase.auth().onAuthStateChanged(async (u) => {
        unsub();
        authUser = u;
        if (!u) {
          // Sin sesión Firebase válida → volver al login (salvo que ya estemos ahí)
          if (!/Login\.html$/i.test(location.pathname) && !location.pathname.endsWith('/')) {
            const local = (function () { try { return JSON.parse(localStorage.getItem('usach_auth_v2')); } catch { return null; } })();
            if (local) { localStorage.removeItem('usach_auth_v2'); }
            location.replace('Login.html');
          }
          resolve({ mode: 'firebase', user: null });
          return;
        }
        await pullAll();
        resolve({ mode: 'firebase', user: u });
      });
    });
  }

  ready = boot();

  // ─── Helpers de administración de usuarios (Auth + Firestore) ────────────
  // Crea un usuario sin desconectar al coordinador (usa app secundaria).
  async function createUser({ email, password, nombre, rol, practicasAsignadas }) {
    if (!isFirebase) {
      // Demo: persistir en localStorage usuarios
      const list = readUsuarios();
      if (list.some(u => u.email === email)) throw new Error('Ya existe un usuario con ese correo.');
      list.push({ uid: 'demo_' + Date.now(), email, nombre, rol, practicasAsignadas: practicasAsignadas || [] });
      localStorage.setItem('usach_usuarios', JSON.stringify(list));
      return { uid: 'demo_' + Date.now() };
    }
    const secondary = firebase.apps.find(a => a.name === 'secondary')
      || firebase.initializeApp(FIREBASE_CONFIG, 'secondary');
    try {
      const cred = await secondary.auth().createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      await fs.collection('usuarios').doc(uid).set({
        email, nombre, rol: rol || 'profesor',
        practicasAsignadas: practicasAsignadas || [],
        creadoPor: (authUser && authUser.email) || null,
        creadoEn: Date.now(),
      });
      await secondary.auth().signOut();
      return { uid };
    } finally {
      // Mantener la app secundaria; signOut ya limpió su sesión.
    }
  }

  async function listUsuarios() {
    if (!isFirebase) return readUsuarios();
    const snap = await fs.collection('usuarios').get();
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }
  async function deleteUsuarioDoc(uid) {
    // Nota: elimina solo el documento de rol; la cuenta de Auth se borra en consola.
    if (!isFirebase) {
      localStorage.setItem('usach_usuarios', JSON.stringify(readUsuarios().filter(u => u.uid !== uid)));
      return;
    }
    await fs.collection('usuarios').doc(uid).delete();
  }
  async function sendReset(email) {
    if (!isFirebase) { alert('Modo demo: no se envían correos.'); return; }
    await firebase.auth().sendPasswordResetEmail(email);
  }
  function readUsuarios() { try { return JSON.parse(localStorage.getItem('usach_usuarios') || '[]') || []; } catch { return []; } }

  window.CLOUD = {
    mode: isFirebase ? 'firebase' : 'demo',
    isFirebase,
    ready,
    get user() { return authUser; },
    createUser, listUsuarios, deleteUsuarioDoc, sendReset,
    // Fuerza un pull manual (p.ej. tras login en otra pestaña)
    refresh: pullAll,
  };
})();
