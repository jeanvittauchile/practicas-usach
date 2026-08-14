// Service Worker — Prácticas USACH
// Estrategia: network-first para código fuente local (html/js/jsx/css) para
// que un deploy nuevo se vea de inmediato; cache-first para el resto de
// assets locales (imágenes/íconos, que casi no cambian); network-first
// para CDN.

const CACHE = 'practicas-usach-v2';

const LOCAL_ASSETS = [
  './Login.html',
  './manifest.json',
  './src/styles.css',
  './src/firebase-config.js',
  './src/cloud.js',
  './src/data.js',
  './src/data-p2.js',
  './src/data-p3.js',
  './src/data-p4.js',
  './src/data-p5.js',
  './src/data-p6.js',
  './src/icons.jsx',
  './src/shell.jsx',
  './src/tweaks-panel.jsx',
  './src/ios-frame.jsx',
  './src/mobile.jsx',
  './src/screens-extra.jsx',
  './src/screens-eval.jsx',
  './src/screens-visitas.jsx',
  './src/app.jsx',
  './src/usach-logo.png',
  './src/eciades-letterhead.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // addAll falla silenciosamente si algún recurso no existe todavía
      Promise.allSettled(LOCAL_ASSETS.map(url => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Solo interceptar GET
  if (request.method !== 'GET') return;

  // CDN (unpkg, gstatic, fonts, firebase) → network-first, sin cache
  const isCDN = url.hostname !== self.location.hostname;
  if (isCDN) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Código fuente local (HTML/JS/JSX/CSS) → network-first: siempre trae la
  // versión más nueva cuando hay conexión; cae a caché solo si falla la red
  // (offline). Evita quedar pegado a una versión vieja tras cada deploy.
  const isSource = /\.(html|jsx?|css)$/i.test(url.pathname) || url.pathname === '/' || url.pathname.endsWith('/');
  if (isSource) {
    e.respondWith(
      fetch(request).then(response => {
        if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Resto de assets locales (imágenes, íconos) → cache-first, luego actualiza en background
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkPromise = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => null);

      return cached || networkPromise;
    })
  );
});
