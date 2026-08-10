(function () {
  "use strict";

  window.Nourish = window.Nourish || {};
  const N = window.Nourish;
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  const toast = (message) => window.dispatchEvent(new CustomEvent("nourish:toast", { detail: { message } }));

  function state() { return N.storage.getState(); }

  function adaptiveTargets(base) {
    const targets = Object.assign({}, base);
    if (!state().settings.adaptiveTargets) return targets;
    const today = N.storage.getDayKey();
    const recovery = state().recoveryLogs.find((item) => item.date === today);
    const workout = state().workout.plans.find((item) => item.date === today && item.exercises && item.exercises.length);
    let energyChange = workout ? 150 : 0;
    if (recovery) {
      const readiness = (Number(recovery.sleep) + Number(recovery.energy) + (6 - Number(recovery.soreness))) / 3;
      if (readiness < 2.5) energyChange -= 150;
      if (readiness > 4 && workout) energyChange += 75;
    }
    targets.calories = Math.max(1200, Number(targets.calories || 2000) + energyChange);
    targets.water = Number(targets.water || 2500) + (workout ? 250 : 0);
    targets.adaptiveChange = energyChange;
    return targets;
  }

  function renderCommandCentre() {
    const stats = $("[data-command-stats]");
    if (!stats || !state().profile) return;
    const targets = adaptiveTargets(state().profile.targets || N.nutrition.calculateTargets(state().profile));
    const totals = N.nutrition.totalsForDay();
    const recovery = state().recoveryLogs.find((item) => item.date === N.storage.getDayKey());
    stats.innerHTML = `<div><strong>${Math.max(0, Math.round(targets.calories - totals.calories))}</strong><small>kcal left</small></div><div><strong>${Math.max(0, Math.round(targets.protein - totals.protein))}g</strong><small>protein left</small></div><div><strong>${Math.max(0, Math.round((targets.water - totals.water) / 100) * 100)}ml</strong><small>water left</small></div>`;
    const suggestion = N.nutrition.recommendations(null, 1)[0];
    $("[data-command-title]").textContent = suggestion ? `A good next option: ${suggestion.food.name}` : "Your day is taking shape";
    $("[data-command-copy]").textContent = recovery ? `Recovery saved · energy ${recovery.energy}/5${targets.adaptiveChange ? ` · target adjusted ${targets.adaptiveChange > 0 ? "+" : ""}${targets.adaptiveChange} kcal` : ""}.` : "Log, repeat or check in without leaving this screen.";
    const adaptive = $("[data-adaptive-targets]");
    if (adaptive) adaptive.checked = Boolean(state().settings.adaptiveTargets);
  }

  function repeatLastMeal() {
    const logs = state().logs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!logs.length) return toast("Log one meal first, then Nourish can repeat it in one tap.");
    const latest = logs[0];
    const group = logs.filter((item) => item.date === latest.date && item.meal === latest.meal);
    group.forEach((item) => N.storage.addLog(item.foodId, item.portion, item.meal));
    toast(`${group.length} ${group.length === 1 ? "item" : "items"} repeated from your last ${latest.meal}.`);
  }

  function numberFromText(text) {
    const words = { one: 1, two: 2, three: 3, four: 4, half: 0.5 };
    const match = String(text).toLowerCase().match(/\b(\d+(?:\.\d+)?|one|two|three|four|half)\b/);
    return match ? Number(words[match[1]] || match[1]) : 1;
  }

  function voiceMatches(text) {
    const normalized = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const chunks = normalized.split(/\band\b|,/).map((item) => item.trim()).filter(Boolean);
    const foods = N.nutrition.getFoods();
    const matches = [];
    chunks.forEach((chunk) => {
      const words = chunk.split(/\s+/).filter((word) => word.length > 2 && !/^(one|two|three|four|half|bowl|plate|cup|piece|pieces)$/.test(word));
      const ranked = foods.map((food) => {
        const haystack = `${food.name} ${(food.tags || []).join(" ")}`.toLowerCase();
        return { food, score: words.reduce((sum, word) => sum + (haystack.includes(word) ? word.length : 0), 0) + (normalized.includes(food.name.toLowerCase()) ? 30 : 0) };
      }).sort((a, b) => b.score - a.score);
      if (ranked[0] && ranked[0].score > 2 && !matches.some((item) => item.food.id === ranked[0].food.id)) matches.push({ food: ranked[0].food, portion: numberFromText(chunk) });
    });
    return matches.slice(0, 8);
  }

  function renderPantry() {
    const container = $("[data-pantry-list]");
    if (!container) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const items = state().pantryItems.slice().sort((a, b) => String(a.expiry || "9999").localeCompare(String(b.expiry || "9999")));
    container.innerHTML = items.length ? items.map((item) => {
      const days = item.expiry ? Math.ceil((new Date(`${item.expiry}T00:00:00`) - today) / 86400000) : null;
      const label = days == null ? "No expiry" : days < 0 ? "Expired" : days === 0 ? "Use today" : `${days} days left`;
      return `<div class="pantry-row ${days != null && days <= 2 ? "is-due" : ""}"><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(label)}</small></div><button type="button" data-remove-pantry="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}">×</button></div>`;
    }).join("") : '<div class="feature-empty compact">Add foods you already have at home.</div>';
  }

  function pantrySuggestions() {
    const terms = state().pantryItems.map((item) => item.name.toLowerCase()).filter(Boolean);
    if (!terms.length) return toast("Add a few pantry foods first.");
    const matches = N.nutrition.getFoods().map((food) => ({ food, score: terms.reduce((sum, term) => sum + (`${food.name} ${(food.tags || []).join(" ")}`.toLowerCase().includes(term) ? 1 : 0), 0) })).filter((item) => item.score).sort((a, b) => b.score - a.score).slice(0, 4);
    const result = matches.length ? matches.map((item) => item.food.name).join(", ") : N.nutrition.recommendations(null, 3).map((item) => item.food.name).join(", ");
    toast(result ? `Try: ${result}` : "Add more specific pantry items for suggestions.");
  }

  function startVoice() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return toast("Voice recognition is unavailable here. You can type the meal instead.");
    const recognition = new Recognition();
    recognition.lang = "en-IN"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    const button = $("[data-start-voice]"); button.textContent = "Listening…";
    recognition.onresult = (event) => { $("[data-voice-form] textarea[name='speech']").value = event.results[0][0].transcript; button.textContent = "Listen again"; };
    recognition.onerror = () => { button.textContent = "Start listening"; toast("I couldn’t hear that clearly. Try again or type it."); };
    recognition.onend = () => { if (button.textContent === "Listening…") button.textContent = "Start listening"; };
    recognition.start();
  }

  function bind() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-repeat-last]")) repeatLastMeal();
      if (event.target.closest("[data-open-voice]")) $("[data-voice-dialog]").showModal();
      if (event.target.closest("[data-open-recovery]")) $("[data-recovery-dialog]").showModal();
      if (event.target.closest("[data-open-pantry]")) { renderPantry(); $("[data-pantry-dialog]").showModal(); }
      if (event.target.closest("[data-close-life]")) event.target.closest("dialog").close();
      if (event.target.closest("[data-start-voice]")) startVoice();
      if (event.target.closest("[data-pantry-suggest]")) pantrySuggestions();
      const remove = event.target.closest("[data-remove-pantry]"); if (remove) { N.storage.removePantryItem(remove.dataset.removePantry); renderPantry(); }
      if (event.target.closest("[data-mark-flex]")) { N.storage.setFlexibleDay("planned-flex"); toast("Today is marked flexible. Consistency matters more than perfection."); }
    });
    $("[data-voice-form]").addEventListener("submit", (event) => {
      event.preventDefault(); const values = new FormData(event.currentTarget); const matches = voiceMatches(values.get("speech"));
      const result = $("[data-voice-result]");
      if (!matches.length) { result.textContent = "No confident matches yet. Try simpler food names."; return; }
      matches.forEach((item) => N.storage.addLog(item.food.id, item.portion, values.get("meal")));
      result.innerHTML = `<strong>Logged ${matches.length} ${matches.length === 1 ? "food" : "foods"}</strong><span>${matches.map((item) => `${item.portion}× ${escapeHtml(item.food.name)}`).join(" · ")}</span>`;
      toast("Voice meal added. You can edit portions from today’s log.");
    });
    $("[data-recovery-form]").addEventListener("submit", (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      N.storage.addRecovery({ sleep: Number(values.sleep), energy: Number(values.energy), soreness: Number(values.soreness), note: String(values.note || "").trim() });
      event.currentTarget.closest("dialog").close(); renderCommandCentre(); toast("Recovery saved. Today’s guidance has adapted.");
    });
    $("[data-pantry-form]").addEventListener("submit", (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); N.storage.addPantryItem(values.name, values.expiry); event.currentTarget.reset(); renderPantry();
    });
    $("[data-adaptive-targets]").addEventListener("change", (event) => { N.storage.updateSettings({ adaptiveTargets: event.target.checked }); renderCommandCentre(); toast(event.target.checked ? "Adaptive targets are on." : "Your fixed targets are restored."); });
    window.addEventListener("nourish:state", renderCommandCentre);
  }

  document.addEventListener("DOMContentLoaded", () => { bind(); renderCommandCentre(); renderPantry(); });
  N.lifeTools = { adaptiveTargets, render: renderCommandCentre };
}());
