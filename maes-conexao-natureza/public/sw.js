/* Service worker do PWA. Cache-first para shell e fotos,
   network-first para navegação (fallback quando o sinal no sítio falha). */
const CACHE = 'mcn-v2';
const SHELL = [
  '/',
  '/cadastro',
  '/programa',
  '/massagem',
  '/checklist',
  '/local',
  '/facilitadoras',
  '/inscricao',
  '/galeria',
  '/mural',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((hit) =>
      hit || fetch(request).then((res) => {
        if (res.ok && new URL(request.url).origin === location.origin) {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
    )
  );
});
