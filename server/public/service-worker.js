// Name of the cache used by the service worker
const CACHE_NAME = "poll-app-v1";

// Files that should be cached for offline usage
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/app.css",
  "/app.mjs",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install event - cache all required files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event - remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve cached files when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response so it can be stored in cache
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(async () => {
        // If network fails, try to return cached version
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigating and nothing cached, show offline page
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      })
  );
});