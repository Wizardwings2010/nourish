(function () {
  "use strict";
  const threshold = 76;
  let startY = 0;
  let distance = 0;
  let tracking = false;
  let refreshing = false;

  function indicator() { return document.querySelector("[data-pull-refresh]"); }
  function stage() { return document.querySelector(".app-stage"); }
  function canStart(event) {
    if (refreshing || window.scrollY > 0 || document.querySelector("dialog[open]")) return false;
    return !event.target.closest("input, textarea, select, button, [contenteditable='true'], .filter-row, .suggested-exercise-rail");
  }
  function setPull(value) {
    const amount = Math.max(0, Math.min(105, value));
    const node = indicator();
    if (!node) return;
    node.classList.toggle("is-visible", amount > 3);
    node.classList.toggle("is-ready", amount >= threshold);
    node.style.setProperty("--pull", `${amount}px`);
    node.querySelector("span").textContent = amount >= threshold ? "Release to refresh" : "Pull to refresh";
    const appStage = stage();
    if (appStage) appStage.style.transform = `translateY(${Math.min(24, amount * 0.25)}px)`;
  }
  function reset() {
    tracking = false; distance = 0;
    setPull(0);
    const appStage = stage();
    if (appStage) appStage.style.transform = "";
  }
  async function refresh() {
    refreshing = true;
    const node = indicator();
    if (node) { node.classList.add("is-refreshing", "is-visible"); node.querySelector("span").textContent = "Refreshing Nourish…"; }
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) await registration.update();
      }
    } catch (error) { /* Reload still works offline from the app shell. */ }
    window.setTimeout(() => window.location.reload(), 320);
  }

  document.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1 || !canStart(event)) return;
    startY = event.touches[0].clientY; tracking = true; distance = 0;
  }, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (!tracking || event.touches.length !== 1) return;
    const raw = event.touches[0].clientY - startY;
    if (raw <= 0) return reset();
    distance = Math.min(105, Math.pow(raw, 0.86));
    if (distance > 5) event.preventDefault();
    setPull(distance);
  }, { passive: false });
  document.addEventListener("touchend", () => {
    if (!tracking) return;
    if (distance >= threshold) refresh(); else reset();
  }, { passive: true });
  document.addEventListener("touchcancel", reset, { passive: true });
}());
