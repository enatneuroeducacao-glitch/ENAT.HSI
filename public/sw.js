/* NeuroDrive PWA: never cache authenticated pages, API responses, or user data. */
const CACHE_NAME = "neurodrive-static-v1";
const OFFLINE_URL = "/offline.html";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, "/favicon-neuro.png", "/neuro-favicon.svg"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("neurodrive-static-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Never cache API, auth, or app navigation responses: avoid stale/private data.
  if (url.pathname.startsWith("/api/") || url.pathname.includes("auth") || request.mode === "navigate") {
    if (request.mode === "navigate") {
      event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()));
    }
    return;
  }
  // Only use cache for the explicitly bundled static PWA support assets.
  if ([OFFLINE_URL, "/favicon-neuro.png", "/neuro-favicon.svg"].includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
