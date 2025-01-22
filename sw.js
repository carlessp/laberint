const CACHE_NAME = 'laberint-v1.5';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/imatges/d/amanida.png',
  '/imatges/d/banyador.png',
  // Afegeix aquí totes les rutes dels arxius que vulguis emmagatzemar en memòria cau
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
