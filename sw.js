// Offline cache for the thesis tracker. Change VERSION when you upload a new index.html.
var VERSION = 'thesis-tracker-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
             './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-48.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Serve from the cache first (works offline), refresh the cache in the background when online.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (r) { if (r && r.ok) cache.put(req, r.clone()); return r; })
                          .catch(function () { return hit || cache.match('./index.html'); });
      return hit || net;
    });
  }));
});
