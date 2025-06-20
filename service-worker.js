const CACHE_NAME = "crypto-cache-v1";
const urlsToCache = [
  "/EindOpdracht/",
  "/EindOpdracht/index.html",
  "/EindOpdracht/style.css",
  "/EindOpdracht/script.js",
  "/EindOpdracht/manifest.json",
  "/EindOpdracht/icons/icon-192.png",
  "/EindOpdracht/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
