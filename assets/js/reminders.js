(function () {
  "use strict";

  window.Nourish = window.Nourish || {};
  const N = window.Nourish;
  const TAG = "nourish-hydration";
  let reminderTimer = null;
  let statusTimer = null;
  let bound = false;

  const $ = (selector) => document.querySelector(selector);

  function config() {
    return N.storage.getState().settings.hydrationReminder;
  }

  function minutesToMs(value) {
    return Math.max(15, Number(value) || 60) * 60 * 1000;
  }

  function timeOnDate(value, base) {
    const parts = String(value || "00:00").split(":").map(Number);
    const date = new Date(base || Date.now());
    date.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
    return date;
  }

  function isActiveTime(date, current) {
    const start = timeOnDate(current.startTime, date);
    const end = timeOnDate(current.endTime, date);
    if (end <= start) return date >= start || date <= end;
    return date >= start && date <= end;
  }

  function nextActiveTime(from, current) {
    const candidate = new Date(from);
    const start = timeOnDate(current.startTime, candidate);
    const end = timeOnDate(current.endTime, candidate);
    if (end <= start) return candidate;
    if (candidate < start) return start;
    if (candidate > end) {
      start.setDate(start.getDate() + 1);
      return start;
    }
    return candidate;
  }

  function calculateNext(current, from) {
    const proposed = new Date((from || Date.now()) + minutesToMs(current.intervalMinutes));
    return nextActiveTime(proposed, current).toISOString();
  }

  function toast(message) {
    window.dispatchEvent(new CustomEvent("nourish:toast", { detail: { message } }));
  }

  function beep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 720;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, audio.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.45);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.48);
      oscillator.addEventListener("ended", () => audio.close());
    } catch (error) { /* Sound is an optional enhancement. */ }
  }

  async function postConfig(current) {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active || navigator.serviceWorker.controller;
      if (worker) worker.postMessage({ type: "HYDRATION_CONFIG", config: current });
      if (registration.periodicSync) {
        if (current.enabled) await registration.periodicSync.register(TAG, { minInterval: minutesToMs(current.intervalMinutes) });
        else await registration.periodicSync.unregister(TAG);
      }
    } catch (error) { /* Background scheduling is browser-controlled. */ }
  }

  async function showReminder(testOnly) {
    const current = config();
    const body = `${current.amount} ml is a good next step. Tap to open Nourish.`;
    if (current.sound && document.visibilityState === "visible") beep();
    if (current.vibration && navigator.vibrate) navigator.vibrate([180, 80, 180]);

    if ("Notification" in window && Notification.permission === "granted" && "serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(testOnly ? "Nourish reminder test" : "Time to drink water", {
          body,
          icon: "assets/icons/icon-192.png",
          badge: "assets/icons/icon-192.png",
          tag: testOnly ? "nourish-water-test" : TAG,
          renotify: true,
          vibrate: current.vibration ? [180, 80, 180] : undefined,
          data: { url: "app.html#today" }
        });
      } catch (error) { toast("Time to drink water."); }
    } else {
      toast(testOnly ? "Reminder test: time to drink water." : "Time to drink water.");
    }

    if (!testOnly) {
      const now = Date.now();
      const updated = { lastReminderAt: new Date(now).toISOString(), nextReminderAt: calculateNext(current, now) };
      N.storage.updateHydrationReminder(updated);
      postConfig(Object.assign({}, current, updated));
      schedule();
    }
  }

  function schedule() {
    if (reminderTimer) window.clearTimeout(reminderTimer);
    const current = config();
    if (!current.enabled) return render();
    let due = current.nextReminderAt ? new Date(current.nextReminderAt).getTime() : 0;
    if (!Number.isFinite(due) || due <= 0) {
      const updated = { nextReminderAt: calculateNext(current, Date.now()) };
      N.storage.updateHydrationReminder(updated);
      due = new Date(updated.nextReminderAt).getTime();
      postConfig(Object.assign({}, current, updated));
    }
    const delay = Math.max(500, due - Date.now());
    reminderTimer = window.setTimeout(() => {
      const latest = config();
      if (latest.enabled && isActiveTime(new Date(), latest)) showReminder(false);
      else {
        const updated = { nextReminderAt: calculateNext(latest, Date.now()) };
        N.storage.updateHydrationReminder(updated);
        schedule();
      }
    }, Math.min(delay, 2147483647));
    render();
  }

  function permissionText() {
    if (!("Notification" in window)) return "Notifications are not supported by this browser.";
    if (Notification.permission === "granted") return "Notifications allowed on this device.";
    if (Notification.permission === "denied") return "Notifications are blocked. Allow them in Android site settings.";
    return "Nourish will ask for notification permission when you turn reminders on.";
  }

  function render() {
    const enabled = $("[data-reminder-enabled]");
    if (!enabled) return;
    const current = config();
    enabled.checked = Boolean(current.enabled);
    $("[data-reminder-options]").hidden = !current.enabled;
    $("[data-reminder-interval]").value = String(current.intervalMinutes);
    $("[data-reminder-start]").value = current.startTime;
    $("[data-reminder-end]").value = current.endTime;
    $("[data-reminder-amount]").value = String(current.amount);
    $("[data-reminder-sound]").checked = Boolean(current.sound);
    $("[data-reminder-vibration]").checked = Boolean(current.vibration);
    $("[data-reminder-permission]").textContent = permissionText();
    const status = $("[data-reminder-status]");
    if (!current.enabled) status.textContent = "Reminders are off.";
    else if (current.nextReminderAt) {
      const next = new Date(current.nextReminderAt);
      const remaining = Math.max(0, Math.ceil((next.getTime() - Date.now()) / 60000));
      status.textContent = remaining > 1 ? `Next reminder in about ${remaining} minutes (${next.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}).` : "Your next reminder is due soon.";
    } else status.textContent = "Preparing your next reminder…";
  }

  async function enableChanged(event) {
    const enabled = event.target.checked;
    if (enabled && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (error) { /* In-app reminders still work. */ }
    }
    const current = config();
    const updated = { enabled, nextReminderAt: enabled ? calculateNext(current, Date.now()) : null };
    N.storage.updateHydrationReminder(updated);
    postConfig(Object.assign({}, current, updated));
    schedule();
    toast(enabled ? "Water reminders are on." : "Water reminders are off.");
  }

  function optionChanged() {
    const current = config();
    const updated = {
      intervalMinutes: Number($("[data-reminder-interval]").value),
      startTime: $("[data-reminder-start]").value,
      endTime: $("[data-reminder-end]").value,
      amount: Number($("[data-reminder-amount]").value),
      sound: $("[data-reminder-sound]").checked,
      vibration: $("[data-reminder-vibration]").checked
    };
    if (current.enabled) updated.nextReminderAt = calculateNext(Object.assign({}, current, updated), Date.now());
    N.storage.updateHydrationReminder(updated);
    postConfig(Object.assign({}, current, updated));
    schedule();
  }

  async function test() {
    if ("Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (error) { /* Toast remains available. */ }
    }
    render();
    showReminder(true);
  }

  function init() {
    if (bound || !$("[data-reminder-enabled]")) return;
    bound = true;
    $("[data-reminder-enabled]").addEventListener("change", enableChanged);
    ["[data-reminder-interval]", "[data-reminder-start]", "[data-reminder-end]", "[data-reminder-amount]", "[data-reminder-sound]", "[data-reminder-vibration]"].forEach((selector) => $(selector).addEventListener("change", optionChanged));
    $("[data-test-reminder]").addEventListener("click", test);
    document.addEventListener("visibilitychange", () => {
      const current = config();
      if (document.visibilityState === "visible" && current.enabled && current.nextReminderAt && new Date(current.nextReminderAt) <= new Date() && isActiveTime(new Date(), current)) showReminder(false);
    });
    statusTimer = window.setInterval(render, 60000);
    schedule();
    postConfig(config());
  }

  N.reminders = { init, render, test };
}());
