var CACHE = 'mediintake-v4';
var SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(SHELL); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('supabase')) return;
  if (req.url.includes('chrome-extension')) return;
  if (req.url.includes('fonts.googleapis')) return;
  if (req.url.includes('fonts.gstatic')) return;
  if (req.url.includes('overpass-api')) return;

  // For navigation requests (HTML pages) - network first, fallback to cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // For everything else - cache first, fallback to network
  e.respondWith(
    caches.match(req).then(function(cached) {
      if (cached) return cached;
      return fetch(req).then(function(res) {
        if (res && res.status === 200 && res.type !== 'opaque') {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(req, clone); });
        }
        return res;
      });
    })
  );
});
