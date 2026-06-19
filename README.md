# Prácticas USACH — Sistema de Gestión

Plataforma de gestión de prácticas de la carrera **Entrenador Deportivo** (Facultad de Ciencias Médicas, Universidad de Santiago de Chile).

- **Login** (`Login.html`) — ingreso con correo institucional.
- **Coordinador** (`Coordinador.html`) — profesores, estudiantes, centros, visitas en terreno, cartas de presentación, reportes y gestión de usuarios.
- **Prácticas** (`App Prácticas USACH.html`) — evaluación por práctica (I, II, III, IV, PI, PII) usada por profesores supervisores.

Es un sitio **HTML estático** (sin paso de compilación). Funciona en dos modos:

| Modo | Cuándo | Dónde viven los datos |
|------|--------|----------------------|
| **Demo** | `firebase-config.js` tiene la API key de ejemplo | `localStorage` del navegador |
| **Firebase** | pegaste tu config real | Firestore (nube), sincronizado entre dispositivos |

---

## 1) Crear el proyecto Firebase

1. Entra a <https://console.firebase.google.com> → **Agregar proyecto**.
2. Dentro del proyecto, pulsa el ícono **`</>`** (Agregar app web), ponle un apodo y **registra la app**. Copia el objeto `firebaseConfig` que te muestra.
3. Pega esos valores en **`src/firebase-config.js`** → `FIREBASE_CONFIG`. (Con esto, la app sale de “modo demo” automáticamente.)
4. **Authentication** → *Sign-in method* → activa **Correo electrónico/contraseña**.
5. **Firestore Database** → **Crear base de datos** → modo **producción** → elige región (ej. `southamerica-east1`).
6. **Firestore → Reglas** → pega el contenido de **`firestore.rules`** de este repo → **Publicar**.

### Coordinadores

7. **Firestore → Iniciar colección** → ID de colección `config`, ID de documento `acceso`, con un campo:
   - `coordinadores` (tipo *array*) = `["jean.vitta@usach.cl", "natalia.osorior@usach.cl"]`
   - ⚠️ en **minúsculas**.
8. **Authentication → Users → Agregar usuario**: crea las cuentas de los dos coordinadores con una contraseña inicial.
   - La primera vez que ingresen, el sistema crea su perfil (`usuarios/{uid}` con rol `coordinador`) automáticamente.
9. Los **profesores** se crean desde la propia app: Coordinador → **Usuarios → + Nuevo profesor**.

> La base arranca **vacía**: estudiantes, profesores y centros se cargan desde la interfaz del coordinador.

---

## 2) Subir el código a GitHub

Si lo conectas desde el editor, el repositorio se crea y sube solo. Manualmente:

```bash
git init
git add .
git commit -m "Prácticas USACH — versión inicial"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/practicas-usach.git
git push -u origin main
```

`.gitignore` ya excluye `node_modules/`, secretos y carpetas de trabajo.

---

## 3) Desplegar en Vercel

1. Entra a <https://vercel.com> → **Add New… → Project** → importa tu repositorio de GitHub.
2. **Framework Preset:** `Other`. No hay build:
   - Build Command: *(vacío)*
   - Output Directory: `.` (raíz)
3. **Deploy.** Vercel publica el sitio y te da una URL (`https://practicas-usach.vercel.app`).
4. Cada `git push` a `main` vuelve a desplegar automáticamente.

### Importante: autorizar el dominio en Firebase

Tras el primer deploy, en **Firebase → Authentication → Settings → Dominios autorizados**, agrega tu dominio de Vercel (`practicas-usach.vercel.app`) para que el inicio de sesión funcione.

---

## Arquitectura de datos (resumen técnico)

- `src/cloud.js` mantiene `localStorage` como caché síncrona y **espeja** las claves de datos a la colección **`kv`** de Firestore (un documento por clave). Así las pantallas leen datos al instante y la nube los sincroniza entre equipos.
- Claves espejadas: `coord_profs`, `coord_students`, `coord_cartas`, `coord_centros`, `usach_state_v1_*` (notas por práctica), `usach_usuarios`.
- **Roles** en la colección `usuarios/{uid}` (`coordinador` | `profesor`).
- **Pendiente (fase 2):** las fotos de *Visitas en terreno* se guardan solo en el navegador (son pesadas); para sincronizarlas conviene usar **Firebase Storage**.

## Probar en local

```bash
npm run dev        # sirve la carpeta en http://localhost:3000
```

Credenciales de **modo demo** (sin Firebase): `coordinador@usach.cl` / `usach2025`.
