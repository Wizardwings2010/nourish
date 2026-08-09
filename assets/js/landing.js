(function () {
  "use strict";

  let installPrompt = null;

  function showToast(message) {
    const toast = document.querySelector("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function setupInstall() {
    const buttons = document.querySelectorAll("[data-install-button]");
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (standalone) buttons.forEach((button) => { button.hidden = true; });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      buttons.forEach((button) => { button.hidden = false; });
    });

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        if (installPrompt) {
          installPrompt.prompt();
          await installPrompt.userChoice;
          installPrompt = null;
          return;
        }
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        showToast(isIOS ? "On iPhone: tap Share, then Add to Home Screen." : "Open your browser menu and choose Install app or Add to Home screen.");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-current-year]").forEach((item) => { item.textContent = new Date().getFullYear(); });
    setupInstall();

    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  });
}());
