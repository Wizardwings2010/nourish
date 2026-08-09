"use strict";

const CACHE_NAME = "nourish-shell-v1.2.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.html",
  "./privacy.html",
  "./manifest.webmanifest",
  "./assets/css/styles.css?v=1.2.0",
  "./assets/js/landing.js?v=1.0.1",
  "./assets/js/data.js?v=1.2.0",
  "./assets/js/storage.js?v=1.2.0",
  "./assets/js/nutrition.js?v=1.2.0",
  "./assets/js/coach.js?v=1.2.0",
  "./assets/js/camera.js?v=1.2.0",
  "./assets/js/app.js?v=1.2.0",
  "./assets/icons/favicon-32.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-192-maskable.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-512-maskable.png",
  "./assets/images/nourish-social-card.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match("./app.html"))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => {
    const network = fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || network;
  }));
});
