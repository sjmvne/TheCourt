/**
 * THE COURT — Service Worker (Offline Cache)
 * Caches all app assets for offline use.
 */

const CACHE_NAME = 'the-court-v1.3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/sounds.js',
  '/js/swipe.js',
  '/js/storage.js',
  '/js/verdict.js',
  '/js/editor.js',
  '/js/app.js',
  '/assets/logo.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
