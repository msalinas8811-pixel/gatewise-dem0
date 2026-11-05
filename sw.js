const CACHE = 'gatewise-v25';
// Archivos de la app (si agregas un módulo en js/app, agrégalo aquí)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './config.js',
  './css/base.css',
  './css/botones.css',
  './css/diseno.css',
  './css/residente.css',
  './js/app/01-nucleo.js',
  './js/app/02-administracion.js',
  './js/app/03-residente.js',
  './js/app/04-vigilancia.js',
  './js/app/05-plataforma.js',
  './js/app/06-cobrador.js',
  './js/app/07-importar-casas.js',
  './js/app/08-region-idioma.js',
  './js/app/09-pdf-reportes.js',
  './js/app/10-tienda.js',
  './js/app/11-marca.js',
  './js/app/12-nube-demo.js',
  './js/app/13-menu-movil.js',
  './js/app/14-opiniones.js',
  './js/app/15-votaciones.js',
  './js/app/16-dueno-app.js',
  './js/app/17-menu-lateral.js',
  './js/app/18-precios.js',
  './js/app/19-movimiento.js',
  './js/app/20-profundidad.js',
  './js/app/21-comunidad.js',
  './js/app/22-casas-autorizadas.js',
  './js/app/23-botones.js',
  './js/app/24-residente.js',
  './js/app/99-arranque.js',
  './js/prod.js',
];

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
