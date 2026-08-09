(function () {
  "use strict";

  window.Nourish = window.Nourish || {};

  const TF_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
  const MOBILENET_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1";
  let modelPromise = null;
  let currentPhotoUrl = "";

  const FOOD_MATCHES = [
    { pattern: /banana|plantain/, ids: ["banana"] },
    { pattern: /apple|granny smith/, ids: ["apple"] },
    { pattern: /orange|mandarin|clementine/, ids: ["orange"] },
    { pattern: /strawberry|blueberry|raspberry|blackberry/, ids: ["berries"] },
    { pattern: /mango/, ids: ["mango"] },
    { pattern: /pineapple/, ids: ["pineapple"] },
    { pattern: /pomegranate/, ids: ["pomegranate"] },
    { pattern: /watermelon|melon/, ids: ["watermelon", "papaya"] },
    { pattern: /grape/, ids: ["grapes"] },
    { pattern: /pear/, ids: ["pear"] },
    { pattern: /broccoli|cauliflower|cabbage/, ids: ["broccoli", "cauliflower", "vegetable-sabzi"] },
    { pattern: /spinach|leaf vegetable|salad/, ids: ["spinach", "vegetable-sabzi", "cucumber"] },
    { pattern: /cucumber|zucchini/, ids: ["cucumber"] },
    { pattern: /bell pepper|capsicum/, ids: ["bell-pepper"] },
    { pattern: /mushroom/, ids: ["mushrooms"] },
    { pattern: /corn/, ids: ["sweet-corn"] },
    { pattern: /sweet potato|yam/, ids: ["sweet-potato"] },
    { pattern: /avocado|guacamole/, ids: ["avocado"] },
    { pattern: /pizza/, ids: ["vegetable-pizza", "pepperoni-pizza"] },
    { pattern: /cheeseburger|hamburger/, ids: ["burger", "veggie-burger"] },
    { pattern: /hotdog|hot dog/, ids: ["hot-dog"] },
    { pattern: /french fries|chips|crisps/, ids: ["french-fries", "potato-chips"] },
    { pattern: /bagel|french loaf|bread|pretzel/, ids: ["wholegrain-toast", "roti"] },
    { pattern: /burrito|wrap/, ids: ["roti", "aloo-paratha"] },
    { pattern: /rice|plate|dish/, ids: ["chicken-biryani", "veg-biryani", "rajma-rice", "curd-rice"] },
    { pattern: /chicken|hen|drumstick/, ids: ["chicken", "chicken-curry", "chicken-biryani"] },
    { pattern: /fish|salmon/, ids: ["salmon", "fish-curry"] },
    { pattern: /omelet|egg/, ids: ["eggs"] },
    { pattern: /soup|stew|potpie/, ids: ["dal", "khichdi", "chole"] },
    { pattern: /pancake|crepe/, ids: ["dosa", "aloo-paratha"] },
    { pattern: /custard|yogurt|yoghurt/, ids: ["greek-yogurt", "curd-rice"] },
    { pattern: /ice cream|trifle/, ids: ["ice-cream", "chocolate-cake"] },
    { pattern: /cake|cupcake/, ids: ["chocolate-cake", "brownie"] },
    { pattern: /chocolate|candy/, ids: ["chocolate-bar", "cadbury-dairy-milk", "brownie"] },
    { pattern: /cookie|biscuit/, ids: ["cookies", "oreo"] },
    { pattern: /doughnut|donut/, ids: ["doughnut"] },
    { pattern: /popcorn/, ids: ["popcorn"] },
    { pattern: /carbonara|spaghetti/, ids: ["white-sauce-pasta", "instant-noodles"] },
    { pattern: /dumpling/, ids: ["momos"] }
  ];

  function loadScript(url, readyCheck) {
    if (readyCheck()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-ml-src="${url}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.mlSrc = url;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error("The free recognition model could not be downloaded.")), { once: true });
      document.head.appendChild(script);
    });
  }

  function loadModel() {
    if (!modelPromise) {
      modelPromise = loadScript(TF_URL, () => Boolean(window.tf))
        .then(() => loadScript(MOBILENET_URL, () => Boolean(window.mobilenet)))
        .then(() => window.mobilenet.load({ version: 2, alpha: 0.5 }))
        .catch((error) => {
          modelPromise = null;
          throw error;
        });
    }
    return modelPromise;
  }

  function candidateFoods(predictions) {
    const scores = new Map();
    predictions.forEach((prediction) => {
      const label = String(prediction.className || "").toLowerCase();
      FOOD_MATCHES.forEach((match) => {
        if (!match.pattern.test(label)) return;
        match.ids.forEach((id, index) => {
          const adjusted = Number(prediction.probability || 0) * (1 - (index * 0.08));
          scores.set(id, Math.max(scores.get(id) || 0, adjusted));
        });
      });
    });

    const profile = window.Nourish.storage.getState().profile || {};
    return Array.from(scores.entries())
      .map(([id, score]) => ({ food: window.Nourish.nutrition.getFood(id), score }))
      .filter((item) => item.food && window.Nourish.nutrition.compatibleWithProfile(item.food, profile))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  function suggestionMarkup(item, index) {
    const food = item.food;
    const confidence = Math.max(1, Math.min(99, Math.round(item.score * 100)));
    const label = index === 0 ? "Best match" : "Possible match";
    return `<button class="camera-food-match" type="button" data-food-id="${food.id}">
      <span class="food-emoji" aria-hidden="true">${food.emoji || "🍽️"}</span>
      <span><small>${label} · ${confidence}% visual confidence</small><strong>${food.name}</strong><em>${food.servingLabel} · ${Math.round(food.calories)} kcal · ${Math.round(food.protein)}g protein</em></span>
      <i aria-hidden="true">›</i>
    </button>`;
  }

  function setStatus(container, title, detail, state) {
    container.className = `camera-status ${state || ""}`.trim();
    container.innerHTML = `${state === "loading" ? '<span class="camera-spinner" aria-hidden="true"></span>' : '<span class="camera-status-icon" aria-hidden="true">' + (state === "error" ? "!" : "✓") + "</span>"}<div><strong>${title}</strong><small>${detail}</small></div>`;
  }

  async function analyze(image, status, suggestions) {
    setStatus(status, "Analyzing on your phone...", "No photo is uploaded. This can take a moment on the first scan.", "loading");
    suggestions.innerHTML = "";
    try {
      const model = await loadModel();
      const predictions = await model.classify(image, 8);
      const candidates = candidateFoods(predictions);
      if (candidates.length) {
        setStatus(status, "Choose the closest match", "Camera estimates are a starting point. Confirm the food and adjust its portion next.", "success");
        suggestions.innerHTML = `<div class="camera-suggestion-heading"><strong>Suggested foods</strong><span>Tap one to review nutrition</span></div>${candidates.map(suggestionMarkup).join("")}<button class="camera-search-manually" type="button" data-camera-manual>Not right? Search the full library</button>`;
      } else {
        setStatus(status, "I could not match this meal confidently", "Mixed dishes are difficult for a small on-device model. Use the Indian food library below to pick the closest dish.", "error");
        suggestions.innerHTML = '<button class="camera-search-manually" type="button" data-camera-manual>Search the food library</button>';
      }
    } catch (error) {
      const offline = !navigator.onLine;
      setStatus(status, offline ? "Connect once for your first scan" : "Recognition is temporarily unavailable", offline ? "The free on-device model must download once. Your photo still stays private." : "You can still use the camera preview and choose a food manually below.", "error");
      suggestions.innerHTML = '<button class="camera-search-manually" type="button" data-camera-manual>Choose food manually</button>';
    }
  }

  function init() {
    const input = document.querySelector("[data-meal-camera]");
    const panel = document.querySelector("[data-camera-analysis]");
    const preview = document.querySelector("[data-camera-preview]");
    const status = document.querySelector("[data-camera-status]");
    const suggestions = document.querySelector("[data-camera-suggestions]");
    if (!input || !panel || !preview || !status || !suggestions) return;

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (currentPhotoUrl) URL.revokeObjectURL(currentPhotoUrl);
      currentPhotoUrl = URL.createObjectURL(file);
      panel.hidden = false;
      preview.onload = () => analyze(preview, status, suggestions);
      preview.src = currentPhotoUrl;
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-camera-reset]")) {
        input.value = "";
        panel.hidden = true;
        suggestions.innerHTML = "";
        if (currentPhotoUrl) URL.revokeObjectURL(currentPhotoUrl);
        currentPhotoUrl = "";
      }
      if (event.target.closest("[data-camera-manual]")) {
        const search = document.querySelector("[data-food-search]");
        if (search) {
          search.focus();
          search.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }

  window.Nourish.camera = { init };
}());
