/* NOVA service worker - caches static assets for offline use. */
const CACHE = 'nova-v1';
const ASSETS = [
  './', './index.html', './shop.html', './product.html', './cart.html', './checkout.html',
  './wishlist.html', './login.html', './account.html', './contact.html', './about.html',
  './order-success.html', './404.html', './manifest.json',
  './assets/css/variables.css', './assets/css/base.css', './assets/css/layout.css',
  './assets/css/components.css', './assets/css/pages.css', './assets/css/responsive.css',
  './assets/css/rtl.css', './assets/css/dark.css',
  './assets/js/main.js', './assets/img/favicon.svg', './assets/img/logo.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});
