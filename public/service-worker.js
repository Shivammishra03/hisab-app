const CACHE_NAME = 'hisab-cache-v1'; // Cache versioning
const urlsToCache = [
  './',
  './index.html',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

// Install event: Precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Whitelist the current cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete outdated caches
          }
        })
      );
    })
  );
});

// Fetch event: Serve requests from cache or network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request); // Fetch from network if not cached
    })
  );
});