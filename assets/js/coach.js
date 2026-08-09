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
    return `Hey ${firstName}! I am your private on-device Nourish Coach. We can figure out your next meal, talk through cravings, check your protein or hydration, or build an Indian meal around today's goals. What is on your mind?`;
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
    const state = window.Nourish.storage.getState();
    const firstName = state.profile && state.profile.name ? state.profile.name.split(" ")[0] : "there";
    const summary = window.Nourish.nutrition.daySummary();
    const remaining = summary.remaining;
    const suggestions = summary.topSuggestions;
    const first = suggestions[0];
    const second = suggestions[1];
    const recent = state.coachMessages || [];
    const previousAssistant = [...recent].reverse().find((item) => item.role === "assistant");
    const foods = window.Nourish.nutrition.getFoods();
    const aliases = {
      biryani: "chicken-biryani", roti: "roti", chapati: "roti", dosa: "dosa", poha: "poha", upma: "upma",
      rajma: "rajma-rice", chole: "chole", khichdi: "khichdi", paratha: "aloo-paratha", paneer: "paneer",
      samosa: "samosa", dhokla: "dhokla", dal: "dal", idli: "idli", banana: "banana", apple: "apple",
      chicken: "chicken", salmon: "salmon", oats: "oats", yoghurt: "greek-yogurt", yogurt: "greek-yogurt"
    };
    const mentionedAlias = Object.keys(aliases).sort((a, b) => b.length - a.length).find((name) => text.includes(name));
    let mentionedFood = mentionedAlias ? window.Nourish.nutrition.getFood(aliases[mentionedAlias]) : null;
    if (mentionedAlias === "biryani" && /veg|vegetable/.test(text)) mentionedFood = window.Nourish.nutrition.getFood("veg-biryani");

    function describeFood(food) {
      const calorieFit = remaining.calories <= 0
        ? "You are already around today's calorie estimate, so let hunger and portion size guide you."
        : food.calories <= remaining.calories
          ? `It fits inside the roughly ${Math.round(remaining.calories)} kcal remaining.`
          : `It is above the roughly ${Math.round(remaining.calories)} kcal remaining, but that number is a guide rather than a strict limit.`;
      return `${food.name} is about ${Math.round(food.calories)} kcal with ${Math.round(food.protein)}g protein, ${Math.round(food.carbs)}g carbs, ${Math.round(food.fat)}g fat, and ${Math.round(food.fiber)}g fibre per ${food.servingLabel}. ${calorieFit} Preparation and serving size can change those numbers.`;
    }

    function indianSuggestion() {
      const profile = state.profile || {};
      const choices = foods.filter((food) => (food.tags || []).includes("indian") && window.Nourish.nutrition.compatibleWithProfile(food, profile));
      const score = (food) => (Math.min(food.protein, remaining.protein || 20) * 2) + (Math.min(food.fiber, remaining.fiber || 8) * 3) - Math.abs(Math.min(remaining.calories || 450, 650) - food.calories) / 40;
      return choices.sort((a, b) => score(b) - score(a));
    }

    if (/emergency|faint|chest pain|can.t breathe|severe reaction|anaphyl/.test(text)) {
      return "This could need urgent medical help. Contact your local emergency service now. Nourish cannot assess emergencies.";
    }
    if (/eating disorder|purge|vomit|starv|not eat|extreme|500 calories|800 calories/.test(text)) {
      return "I can’t help with extreme restriction or compensating for food. Your wellbeing matters more than a target—please speak with a qualified clinician or eating-disorder support service. I can help you plan a balanced, regular meal instead.";
    }
    if (/allerg|medical|diabet|pregnan|kidney|medication|disease/.test(text)) {
      return "For allergies, pregnancy, medication, or a medical condition, a clinician or registered dietitian should guide specific food choices. I can still help explain your general tracking summary, but I won’t override medical advice.";
    }
    if (/thank|thanks|thx|appreciate/.test(text)) {
      return `Anytime, ${firstName}. You are doing the useful part: paying attention without demanding perfection. Want to plan your next meal or check where today's nutrition stands?`;
    }
    if (/how are you|who are you|what can you do/.test(text)) {
      return `I am doing well and ready to help, ${firstName}. I am the private offline version of Nourish Coach, so I use your logs on this phone instead of sending them to an online AI. I can discuss meals, hunger, protein, fibre, hydration, calories, and Indian food choices.`;
    }
    if (/remember|preference|budget|cook time|cooking time|dislike|meal time/.test(text)) {
      const profile = state.profile || {};
      return `I remember the preferences saved in Profile: ${profile.dislikes ? `avoid ${profile.dislikes}; ` : ""}${profile.cookTime === "quick" ? "prefer meals under 15 minutes; " : profile.cookTime === "medium" ? "prefer meals within 30 minutes; " : "cooking time is flexible; "}${profile.budget === "budget" ? "keep choices budget-conscious" : "use a balanced food budget"}${profile.mealTimes ? `; usual meal times are ${profile.mealTimes}` : ""}. You can change these anytime in Coach memory.`;
    }
    if (/what (did|have) i (eat|log)|show.*log|today.s food/.test(text)) {
      const today = window.Nourish.storage.getDayKey();
      const names = state.logs.filter((entry) => entry.date === today).map((entry) => window.Nourish.nutrition.getFood(entry.foodId)).filter(Boolean).map((food) => food.name);
      return names.length
        ? `You have logged ${names.join(", ")} today. Together they bring you to about ${Math.round(summary.totals.calories)} kcal and ${Math.round(summary.totals.protein)}g protein. Want me to suggest what would balance that next?`
        : "You have not logged any food yet today. You can snap a meal in Log or choose one from the library, then I can respond to your actual totals.";
    }
    if (mentionedFood && /good|healthy|calor|protein|fibre|fiber|macro|what about|should i|can i|how much|nutri/.test(text)) {
      return describeFood(mentionedFood);
    }
    if (/another|something else|other option|don.t want|dont want/.test(text)) {
      if (second) return `Sure — try ${second.name} instead. ${second.reason} It gives you a different route without losing sight of today's protein, fibre, and energy needs.`;
      const indianAlternative = indianSuggestion()[1];
      return indianAlternative
        ? `Absolutely. ${indianAlternative.name} is another practical option: about ${Math.round(indianAlternative.calories)} kcal and ${Math.round(indianAlternative.protein)}g protein per ${indianAlternative.servingLabel}.`
        : "Absolutely. Tell me whether you want something light, filling, sweet, savoury, vegetarian, or high-protein and I will narrow it down.";
    }
    if (/^\s*(why|how so|really|are you sure)/.test(text) && previousAssistant) {
      return `Fair question. I am comparing your logged totals with what remains today: roughly ${Math.round(remaining.calories)} kcal, ${Math.round(remaining.protein)}g protein, and ${Math.round(remaining.fiber)}g fibre. My suggestion prioritizes the largest gap while still considering overall energy. It is an estimate, so your hunger and actual portion still matter.`;
    }
    if (/indian|desi|biryani|curry|sabzi|roti|chapati/.test(text) && /idea|meal|eat|suggest|recommend|dinner|lunch|breakfast/.test(text)) {
      const indian = indianSuggestion();
      if (indian.length) return `For an Indian option, I would start with ${indian[0].name} (${indian[0].servingLabel}). It is roughly ${Math.round(indian[0].calories)} kcal with ${Math.round(indian[0].protein)}g protein and ${Math.round(indian[0].fiber)}g fibre.${indian[1] ? ` If that does not sound good, ${indian[1].name} is another solid choice.` : ""} What kind of meal are you in the mood for?`;
    }
    if (/hungry|craving|starving|need food/.test(text)) {
      if (first) return `I hear you. If you are genuinely hungry, let us choose something satisfying rather than trying to out-discipline it. ${first.name} is a useful starting point; use a comfortable portion and add vegetables or fruit if that fits. Are you craving something savoury, sweet, light, or filling?`;
      return "If you are hungry, eat. A simple balanced choice has protein, a fibre-rich carbohydrate, and something colourful. Tell me what food you have available and I will help you assemble it.";
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
      return "For a focused breakfast, combine protein, fibre, and an easy energy source. Idli with sambar, vegetable poha with curd, dosa with extra sambar, or Greek yoghurt with oats can all work. Which of those sounds realistic today?";
    }
    if (/dinner|lunch|meal|eat next|what should|suggest|recommend/.test(text)) {
      if (!first) return "A balanced next meal usually combines a protein source, vegetables, a fibre-rich carbohydrate, and enough energy to satisfy you. Add a few logs first and I can make the suggestion more specific.";
      return `${first.name} is your strongest next fit. ${first.reason}${second ? ` Another good option is ${second.name}.` : ""} You have roughly ${Math.round(remaining.calories)} kcal, ${Math.round(remaining.protein)}g protein, and ${Math.round(remaining.fiber)}g fibre remaining.`;
    }
    if (/hello|hi|hey|help/.test(text)) {
      return `Hey ${firstName}! Tell me what is happening — are you planning a meal, feeling hungry, checking a nutrient, or deciding between two foods?`;
    }
    if (/^(yes|yeah|yep|okay|ok|sure)[.! ]*$/.test(text)) {
      return first
        ? `Great. Start with ${first.name}, use the portion that matches your hunger, and log it afterward. If you tell me what ingredients you actually have, I can help make the choice more practical.`
        : "Great. Tell me what food you have available or what kind of meal you want, and we will make a simple plan.";
    }
    return first
      ? `Let me connect that to your day: ${first.name} is currently a useful option because ${first.reason.charAt(0).toLowerCase()}${first.reason.slice(1)} If that is not what you meant, give me one more detail and I will adjust.`
      : "I want to give you a useful answer, but I need one more detail. Are you asking about a particular food, your next meal, protein, fibre, hydration, or calories?";
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
      if (window.location.hostname.endsWith("github.io")) throw new Error("static-host");
      reply = await requestLiveReply(clean);
      if (elements.mode) elements.mode.innerHTML = "<span></span> Live AI guidance";
    } catch (error) {
      reply = offlineResponse(clean);
      source = "offline";
      if (elements.mode) elements.mode.innerHTML = "<span></span> Private on-device coach";
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
