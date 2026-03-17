const CACHE_NAME = "poll-app-static-v2";

/*
Files that should be available offline.
This is called the "app shell".
*/
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/app.css",
  "/app.mjs",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/*
Check if request is a static file (not API)
*/
function isStaticAsset(requestUrl) {
  const url = new URL(requestUrl);

  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;

  return ASSETS_TO_CACHE.includes(url.pathname);
}

/*
INSTALL:
Cache important static files
*/
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );

  self.skipWaiting();
});

/*
ACTIVATE:
Delete old caches and take control
*/
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

/*
FETCH:
Handle requests
*/
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /*
  Never cache API calls
  Always go to network
  */
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  /*
  Page navigation:
  Try network first
  If offline → show offline page
  */
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const offline = await caches.match("/offline.html");
          return (
            offline ||
            new Response("Offline", {
              status: 503
            })
          );
        }
      })()
    );
    return;
  }

  /*
  Static files:
  Cache first strategy
  */
  if (isStaticAsset(request.url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());

        return response;
      })()
    );
  }
});