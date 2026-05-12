const CACHE = 'deuda-v1';
const ASSETS = [
  '/Control-prestamo/',
  '/Control-prestamo/index.html',
  '/Control-prestamo/manifest.json'
];

// Instalar: guarda los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpia cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: sirve desde caché si no hay internet
self.addEventListener('fetch', e => {
  // Solo interceptar peticiones del mismo origen (no Firebase)
  if (!e.request.url.includes('firestore') &&
      !e.request.url.includes('googleapis') &&
      !e.request.url.includes('gstatic') &&
      !e.request.url.includes('fonts')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
