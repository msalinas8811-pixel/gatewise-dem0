const CACHE = 'gatewise-v17';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './config.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Red primero, sin usar la caché del navegador (GitHub Pages guarda hasta 10 min);
// si no hay conexión, se usa la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const propio = url.origin === self.location.origin;
  const req = propio ? new Request(e.request, { cache: 'no-store' }) : e.request;
  e.respondWith(
    fetch(req)
      .then(r => { if (propio && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
