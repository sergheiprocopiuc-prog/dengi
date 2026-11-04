// Кэш оболочки приложения — чтобы открывалось мгновенно, даже без сети
const CACHE = 'dengi-v16';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png','./fonts/manrope-cyrillic-wght-normal.woff2','./fonts/manrope-latin-wght-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // сразу отдаём из кэша, а в фоне обновляем
  e.respondWith(caches.open(CACHE).then(async c => {
    const cached = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => cached);
    return cached || net;
  }));
});
