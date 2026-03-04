const CACHE_NAME = 'tasbih-cache-v2'; // 👈 version change karte rehna

const urlsToCache = [
  '/',
  '/index.html'
];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH (Network First for HTML)
self.addEventListener('fetch', event => {

  if (event.request.mode === 'navigate') {
    // Always try network first for page loads
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put('/index.html', clone);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache First for other assets
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});