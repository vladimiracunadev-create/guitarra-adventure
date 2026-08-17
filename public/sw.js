const CACHE_NAME = "guitarra-adventure-v3-audio";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icons/guitarra.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/illustrations/guitar-parts.svg",
  "/illustrations/posture.svg",
  "/illustrations/right-hand.svg",
  "/illustrations/left-hand.svg",
  "/illustrations/chord-diagram.svg",
  "/illustrations/staff.svg",
  "/audio/guitarra/e2.mp3",
  "/audio/guitarra/a2.mp3",
  "/audio/guitarra/d3.mp3",
  "/audio/guitarra/g3.mp3",
  "/audio/guitarra/a3.mp3",
  "/audio/guitarra/b3.mp3",
  "/audio/guitarra/c4.mp3",
  "/audio/guitarra/d4.mp3",
  "/audio/guitarra/e4.mp3",
  "/audio/guitarra/fs4.mp3",
  "/audio/guitarra/g4.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put("/", response.clone()));
          return response;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
