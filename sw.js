/* JavierSL PWA - Service Worker
   Para publicar una actualización de la app: cambia el número de VERSION. */
const VERSION = 'v1';
const CACHE = 'javiersl-capital-' + VERSION;
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('javiersl-capital-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Abre al instante desde caché y actualiza en segundo plano si hay internet */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const net = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => null);
        if (hit) { e.waitUntil(net); return hit; }
        return net.then(res => res || (req.mode === 'navigate' ? cache.match('index.html') : Response.error()));
      })
    )
  );
});
