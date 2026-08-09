(function () {
  "use strict";

  window.Nourish = window.Nourish || {};

  let elements = {};
  let busy = false;

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  function timeLabel(iso) {
    const date = iso ? new Date(iso) : new Date();
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function initialMessage() {
    const state = window.Nourish.storage.getState();
    const firstName = state.profile && state.profile.name ? state.profile.name.split(" ")[0] : "there";
    return `Hi ${firstName}. I can use today’s nutrition summary to help you choose what to eat, close a nutrient gap, or plan around your routine. What would be useful right now?`;
  }

  function messageMarkup(message) {
    const role = message.role === "user" ? "user" : "assistant";
    const avatar = role === "assistant" ? '<span class="coach-avatar" aria-hidden="true">✦</span>' : "";
    const source = message.source === "offline" ? " · offline guidance" : "";
    return `<div class="coach-message ${role}">${avatar}<div class="message-bubble"><p>${escapeHtml(message.content)}</p><span class="message-meta">${timeLabel(message.createdAt)}${source}</span></div></div>`;
  }

  function renderMessages() {
    if (!elements.messages) return;
    const messages = window.Nourish.storage.getState().coachMessages;
    if (!messages.length) {
      elements.messages.innerHTML = messageMarkup({ role: "assistant", content: initialMessage(), source: "local", createdAt: new Date().toISOString() });
    } else {
      elements.messages.innerHTML = messages.map(messageMarkup).join("");
    }
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function renderContext() {
    if (!elements.context) return;
    const summary = window.Nourish.nutrition.daySummary();
    const totals = summary.totals;
    const targets = summary.targets;
    elements.context.innerHTML = [
      ["Calories", `${Math.round(totals.calories)} / ${targets.calories} kcal`],
      ["Protein", `${Math.round(totals.protein)} / ${targets.protein} g`],
      ["Fibre", `${Math.round(totals.fiber)} / ${targets.fiber} g`],
      ["Water", `${(totals.water / 1000).toFixed(1)} / ${(targets.water / 1000).toFixed(1)} L`],
      ["Goal", String(summary.goal).replace(/^./, (letter) => letter.toUpperCase())],
      ["Eating style", String(summary.diet).replace(/^./, (letter) => letter.toUpperCase())]
    ].map(([label, value]) => `<div class="context-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  }

  function offlineResponse(question) {
    const text = question.toLowerCase();
    const summary = window.Nourish.nutrition.daySummary();
    const remaining = summary.remaining;
    const suggestions = summary.topSuggestions;
    const first = suggestions[0];
    const second = suggestions[1];

    if (/emergency|faint|chest pain|can.t breathe|severe reaction|anaphyl/.test(text)) {
      return "This could need urgent medical help. Contact your local emergency service now. Nourish cannot assess emergencies.";
    }
    if (/eating disorder|purge|vomit|starv|not eat|extreme|500 calories|800 calories/.test(text)) {
      return "I can’t help with extreme restriction or compensating for food. Your wellbeing matters more than a target—please speak with a qualified clinician or eating-disorder support service. I can help you plan a balanced, regular meal instead.";
    }
    if (/allerg|medical|diabet|pregnan|kidney|medication|disease/.test(text)) {
      return "For allergies, pregnancy, medication, or a medical condition, a clinician or registered dietitian should guide specific food choices. I can still help explain your general tracking summary, but I won’t override medical advice.";
    }
    if (/water|hydrat|drink/.test(text)) {
      if (remaining.water <= 0) return "You’ve reached today’s hydration target. Continue drinking to thirst and adjust for heat or activity without forcing excessive water.";
      return `You have about ${Math.round(remaining.water)} ml left for today. Try ${remaining.water > 700 ? "two or three smaller drinks across the next few hours" : "one or two comfortable servings"} rather than drinking it all at once.`;
    }
    if (/protein|workout|gym|muscle/.test(text)) {
      if (remaining.protein <= 3) return "You’re essentially at today’s protein target. Choose your next food for hunger, fibre, variety, and enjoyment rather than adding protein just for the number.";
      const highProtein = window.Nourish.nutrition.recommendations(null, 8).map((item) => item.food).sort((a, b) => b.protein - a.protein)[0];
      return `You have about ${Math.round(remaining.protein)}g protein remaining. ${highProtein ? `${highProtein.name} (${highProtein.servingLabel}) adds roughly ${Math.round(highProtein.protein)}g.` : "Choose a protein-rich food that fits your dietary preference."} Pair it with vegetables or a fibre-rich carbohydrate for a more complete meal.`;
    }
    if (/fib|digestion|constipat/.test(text)) {
      if (remaining.fiber <= 2) return "You’re close to today’s fibre target. Keep variety high and increase fibre gradually alongside enough fluid.";
      const fibreFood = window.Nourish.nutrition.recommendations(null, 8).map((item) => item.food).sort((a, b) => b.fiber - a.fiber)[0];
      return `You have about ${Math.round(remaining.fiber)}g fibre remaining. ${fibreFood ? `${fibreFood.name} offers around ${Math.round(fibreFood.fiber)}g per ${fibreFood.servingLabel}.` : "Fruit, legumes, whole grains, seeds, and vegetables can help."} Increase fibre gradually and keep hydration steady.`;
    }
    if (/calor|over|too much|remaining/.test(text)) {
      if (remaining.calories <= 0) return "You’re at or above the current calorie estimate. One day does not define your progress—respond to genuine hunger, avoid compensating through extreme restriction, and return to your usual rhythm tomorrow.";
      return `You have about ${Math.round(remaining.calories)} kcal remaining. Treat that as a planning estimate, not a hard limit. ${first ? `${first.name} is currently a strong fit because it adds useful nutrients within that space.` : "Choose something satisfying with protein and fibre."}`;
    }
    if (/breakfast/.test(text)) {
      return "For a focused breakfast, combine protein, fibre, and an easy energy source—for example Greek yoghurt with oats and berries, or idli with sambar. Adjust the choice to your dietary preference and appetite.";
    }
    if (/dinner|lunch|meal|eat next|what should|suggest|recommend/.test(text)) {
      if (!first) return "A balanced next meal usually combines a protein source, vegetables, a fibre-rich carbohydrate, and enough energy to satisfy you. Add a few logs first and I can make the suggestion more specific.";
      return `${first.name} is your strongest next fit. ${first.reason}${second ? ` Another good option is ${second.name}.` : ""} You have roughly ${Math.round(remaining.calories)} kcal, ${Math.round(remaining.protein)}g protein, and ${Math.round(remaining.fiber)}g fibre remaining.`;
    }
    if (/hello|hi|hey|help/.test(text)) {
      return "I can help choose your next food, review protein or fibre, check hydration, or shape a meal around what remains today. Try asking, “What should I eat next?”";
    }
    return first
      ? `Based on today’s summary, ${first.name} is a useful next option. ${first.reason} You can also ask me specifically about protein, fibre, hydration, calories, or a meal.`
      : "I can help once you log a little context. Ask about protein, fibre, hydration, calories, or how to build a balanced meal.";
  }

  function typingMarkup() {
    return '<div class="coach-message assistant" data-typing><span class="coach-avatar" aria-hidden="true">✦</span><div class="message-bubble"><span class="coach-typing" aria-label="Nourish Coach is responding"><i></i><i></i><i></i></span></div></div>';
  }

  function setBusy(value) {
    busy = value;
    if (elements.send) elements.send.disabled = value;
    if (elements.input) elements.input.disabled = value;
  }

  async function requestLiveReply(question) {
    const state = window.Nourish.storage.getState();
    // The current question was just saved as the last local message; omit it from
    // history because it is sent separately as the current API input.
    const recent = state.coachMessages.slice(-9, -1).map((item) => ({ role: item.role, content: item.content }));
    const response = await fetch("api/coach.php", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ message: question, conversation: recent, context: window.Nourish.nutrition.daySummary() })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.reply) throw new Error(payload.error || "Live Coach is unavailable.");
    return payload.reply;
  }

  async function send(question) {
    const clean = String(question || "").trim();
    if (!clean || busy) return;
    window.Nourish.storage.addCoachMessage("user", clean, "user");
    renderMessages();
    elements.messages.insertAdjacentHTML("beforeend", typingMarkup());
    elements.messages.scrollTop = elements.messages.scrollHeight;
    setBusy(true);

    let reply;
    let source = "live";
    try {
      if (!navigator.onLine) throw new Error("offline");
      reply = await requestLiveReply(clean);
      if (elements.mode) elements.mode.innerHTML = "<span></span> Live AI guidance";
    } catch (error) {
      reply = offlineResponse(clean);
      source = "offline";
      if (elements.mode) elements.mode.innerHTML = "<span></span> Smart offline guidance";
    }

    const typing = elements.messages.querySelector("[data-typing]");
    if (typing) typing.remove();
    window.Nourish.storage.addCoachMessage("assistant", reply, source);
    renderMessages();
    renderContext();
    setBusy(false);
    if (elements.input) elements.input.focus();
  }

  function init() {
    elements = {
      messages: document.querySelector("[data-coach-messages]"),
      context: document.querySelector("[data-coach-context]"),
      form: document.querySelector("[data-coach-form]"),
      input: document.querySelector("[data-coach-input]"),
      send: document.querySelector("[data-coach-send]"),
      prompts: document.querySelector("[data-coach-prompts]"),
      mode: document.querySelector("[data-coach-mode]")
    };
    if (!elements.form) return;

    renderMessages();
    renderContext();

    elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = elements.input.value;
      elements.input.value = "";
      elements.input.style.height = "auto";
      send(value);
    });

    elements.input.addEventListener("input", () => {
      elements.input.style.height = "auto";
      elements.input.style.height = `${Math.min(120, elements.input.scrollHeight)}px`;
    });
    elements.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        elements.form.requestSubmit();
      }
    });
    elements.prompts.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (button) send(button.textContent);
    });
  }

  window.Nourish.coach = { init, render: () => { renderMessages(); renderContext(); }, offlineResponse };
}());
