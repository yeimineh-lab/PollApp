const CACHE_NAME = "poll-app-static-v3";

const APP_SHELL_FILES = [
  "/",
  "/index.html",
  "/app.css",
  "/app.mjs",
];

const STATIC_ASSETS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname);
}

function isAppShell(pathname) {
  return APP_SHELL_FILES.includes(pathname);
}

/*
INSTALL
*/
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([...APP_SHELL_FILES, ...STATIC_ASSETS])
    )
  );

  self.skipWaiting();
});

/*
ACTIVATE
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
ALLOW FORCE UPDATE FROM CLIENT
*/
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/*
FETCH
*/
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // aldri cache API
  if (url.pathname.startsWith("/api/")) return;

  /*
  APP SHELL + NAVIGATION
  -> network first (gir fresh side)
  */
  if (request.mode === "navigate" || isAppShell(url.pathname)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          const offline = await caches.match("/offline.html");

          return (
            cached ||
            offline ||
            new Response("Offline", {
              status: 503,
              statusText: "Offline",
            })
          );
        }
      })()
    );
    return;
  }

  /*
  STATIC FILES
  -> cache first
  */
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        } catch {
          return new Response("Offline", {
            status: 503,
          });
        }
      })()
    );
  }
});