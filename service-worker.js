const CACHE_NAME = "don-botellon-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./clientes.html",
  "./infocliente.html",
  "./historial.html",
  "./estadisticas.html",
  "./inactivos.html",
  "./dashboard.css",
  "./app.js",
  "./dashboard.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});