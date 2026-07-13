const CACHE = 'faris-v7';
const FILES = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'config.js',
  'assets/creators.svg',
  'assets/paypal.svg',
  'assets/tiktok.svg',
  'assets/telegram.svg',
  'assets/discord.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => key !== CACHE ? caches.delete(key) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Always fetch visual identity files fresh so logo/favicon updates appear quickly.
  if (url.pathname.includes('/assets/logo.png') ||
      url.pathname.includes('/assets/favicon.png') ||
      url.pathname.endsWith('/manifest.json')) {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)));
    return;
  }

  // Network first: keeps GitHub updates visible, with cache fallback if offline.
  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
