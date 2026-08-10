"use strict";

const CACHE_NAME = "nourish-shell-v2.8.0";
const REMINDER_CACHE = "nourish-reminder-state-v1";
const REMINDER_URL = new URL("./__hydration_reminder__", self.location.href).href;
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.html",
  "./privacy.html",
  "./manifest.webmanifest?v=2.2.0",
  "./assets/css/styles.css?v=2.8.0",
  "./assets/js/landing.js?v=1.0.1",
  "./assets/js/data.js?v=2.0.0",
  "./assets/js/foods-expanded.js?v=2.0.0",
  "./assets/js/foods-indian-specialties.js?v=2.6.0",
  "./assets/js/workout-data.js?v=2.0.0",
  "./assets/data/exercises-public-domain.json",
  "./assets/js/storage.js?v=2.0.0",
  "./assets/js/nutrition.js?v=2.0.0",
  "./assets/js/coach.js?v=2.0.0",
  "./assets/js/camera.js?v=2.0.0",
  "./assets/js/reminders.js?v=2.0.0",
  "./assets/js/features.js?v=2.0.0",
  "./assets/js/workout.js?v=2.5.0",
  "./assets/js/app.js?v=2.1.0",
  "./assets/icons/favicon-32.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192-v2.png",
  "./assets/icons/icon-192-maskable-v2.png",
  "./assets/icons/icon-512-v2.png",
  "./assets/icons/icon-512-maskable-v2.png",
  "./assets/images/nourish-social-card.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== REMINDER_CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

async function saveReminderConfig(config) {
  const cache = await caches.open(REMINDER_CACHE);
  await cache.put(REMINDER_URL, new Response(JSON.stringify(config), { headers: { "content-type": "application/json" } }));
}

async function readReminderConfig() {
  const cache = await caches.open(REMINDER_CACHE);
  const response = await cache.match(REMINDER_URL);
  return response ? response.json() : null;
}

function timeParts(value) {
  const parts = String(value || "00:00").split(":").map(Number);
  return { hours: parts[0] || 0, minutes: parts[1] || 0 };
}

function isWithinActiveHours(date, config) {
  const nowMinutes = (date.getHours() * 60) + date.getMinutes();
  const start = timeParts(config.startTime);
  const end = timeParts(config.endTime);
  const startMinutes = (start.hours * 60) + start.minutes;
  const endMinutes = (end.hours * 60) + end.minutes;
  return endMinutes <= startMinutes ? nowMinutes >= startMinutes || nowMinutes <= endMinutes : nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "HYDRATION_CONFIG") return;
  event.waitUntil(saveReminderConfig(event.data.config));
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== "nourish-hydration") return;
  event.waitUntil((async () => {
    const config = await readReminderConfig();
    const now = new Date();
    if (!config || !config.enabled || !isWithinActiveHours(now, config)) return;
    const dueAt = config.nextReminderAt ? new Date(config.nextReminderAt).getTime() : 0;
    if (dueAt && dueAt > now.getTime()) return;
    await self.registration.showNotification("Time to drink water", {
      body: `${config.amount || 250} ml is a good next step. Tap to open Nourish.`,
      icon: "assets/icons/icon-192.png",
      badge: "assets/icons/icon-192.png",
      tag: "nourish-hydration",
      renotify: true,
      vibrate: config.vibration ? [180, 80, 180] : undefined,
      data: { url: "app.html#today" }
    });
    config.lastReminderAt = now.toISOString();
    config.nextReminderAt = new Date(now.getTime() + (Math.max(15, Number(config.intervalMinutes) || 60) * 60000)).toISOString();
    await saveReminderConfig(config);
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if ("focus" in client) {
        await client.navigate("./app.html#today");
        return client.focus();
      }
    }
    return self.clients.openWindow("./app.html#today");
  })());
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
