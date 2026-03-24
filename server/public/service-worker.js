/**
 * Service worker.
 *
 * Caches the app shell and static assets,
 * supports offline fallback,
 * and updates cached files when a new version is available.
 */

const CACHE_NAME = "poll-app-static-v9";

const APP_SHELL_FILES = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/app.css",
  "/app.mjs",

  "/data/api.mjs",
  "/data/userStore.mjs",

  "/i18n/index.mjs",
  "/i18n/en.mjs",
  "/i18n/no.mjs",

  "/ui/user-create.mjs",
  "/ui/user-edit.mjs",
  "/ui/user-delete.mjs",
];

const STATIC_ASSETS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/privacy.html",
  "/terms.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const PRECACHE_URLS = [...APP_SHELL_FILES, ...STATIC_ASSETS];

function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname);
}

function shouldRuntimeCache(request, pathname) {
  return (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "document" ||
    request.destination === "image" ||
    pathname.endsWith(".mjs") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".html") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webmanifest")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn("Failed to cache:", url, err);
        }
      }
    })()
  );

  self.skipWaiting();
});

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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;


  if (url.pathname.startsWith("/api/")) return;


  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cachedPage =
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/offline.html"));

          return (
            cachedPage ||
            new Response("Offline", {
              status: 503,
              statusText: "Offline",
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })()
    );
    return;
  }

  // Static/module/style/image files:
  if (isStaticAsset(url.pathname) || shouldRuntimeCache(request, url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);

          if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }

          return response;
        } catch {
          return new Response("Offline", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      })()
    );
  }
});