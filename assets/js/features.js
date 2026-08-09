(function () {
  "use strict";

  window.Nourish = window.Nourish || {};
  const N = window.Nourish;
  const nutrients = ["calories", "protein", "carbs", "fat", "fiber", "calcium", "iron", "potassium", "vitaminC"];
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function toast(message) {
    window.dispatchEvent(new CustomEvent("nourish:toast", { detail: { message } }));
  }

  function profile() {
    return N.storage.getState().profile || {};
  }

  function compatibleFoods() {
    return N.nutrition.getFoods().filter((food) => N.nutrition.compatibleWithProfile(food, profile()));
  }

  function closestFood(candidates, targetCalories, used) {
    return candidates.filter((food) => !used.has(food.id)).sort((a, b) => {
      const score = (food) => Math.abs(food.calories - targetCalories) - (food.protein * 3) - (food.fiber * 5);
      return score(a) - score(b);
    })[0];
  }

  function generatePlan() {
    if (!profile().targets) return toast("Finish your Nourish profile first.");
    const totals = N.nutrition.totalsForDay();
    const remaining = Math.max(600, profile().targets.calories - totals.calories);
    const foods = compatibleFoods();
    const used = new Set();
    const definitions = [
      ["Breakfast", ["breakfast"], 0.25],
      ["Lunch", ["lunch"], 0.32],
      ["Dinner", ["dinner"], 0.32],
      ["Snack", ["snack"], 0.11]
    ];
    const items = definitions.map(([meal, tags, ratio]) => {
      const candidates = foods.filter((food) => tags.some((tag) => (food.tags || []).includes(tag)) && !(food.tags || []).includes("treat") && !/fast food|dessert|sweet/i.test(food.category));
      const food = closestFood(candidates.length ? candidates : foods, remaining * ratio, used);
      if (food) used.add(food.id);
      return food ? { meal: meal.toLowerCase(), label: meal, foodId: food.id, portion: 1 } : null;
    }).filter(Boolean);
    N.storage.setDailyPlan({ date: N.storage.getDayKey(), items });
    renderPlan();
    toast("A balanced plan is ready for today.");
  }

  function renderPlan() {
    const container = $("[data-daily-plan-list]");
    if (!container || !N.storage.getState().profile) return;
    const plan = N.storage.getState().dailyPlans.find((item) => item.date === N.storage.getDayKey());
    if (!plan || !plan.items.length) {
      container.innerHTML = '<div class="feature-empty">Generate a plan whenever you want a clear next step.</div>';
      return;
    }
    container.innerHTML = plan.items.map((item) => {
      const food = N.nutrition.getFood(item.foodId);
      if (!food) return "";
      return `<div class="plan-row"><span>${escapeHtml(food.emoji || "🍽️")}</span><div><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(food.name)}</strong><em>${Math.round(food.calories)} kcal · ${Math.round(food.protein)}g protein</em></div><button type="button" data-plan-log="${escapeHtml(food.id)}" data-plan-meal="${escapeHtml(item.meal)}">Log</button><button type="button" data-plan-shop="${escapeHtml(food.name)}" aria-label="Add ${escapeHtml(food.name)} to shopping list">＋</button></div>`;
    }).join("");
  }

  function saveTemplate(name) {
    const state = N.storage.getState();
    const today = N.storage.getDayKey();
    const items = state.logs.filter((item) => item.date === today).map(({ foodId, portion, meal }) => ({ foodId, portion, meal }));
    if (!items.length) return toast("Log at least one food before saving a template.");
    if (!name || !name.trim()) return;
    N.storage.addMealTemplate({ name: name.trim(), items });
    renderTemplates();
    toast("Meal template saved.");
  }

  function renderTemplates() {
    const container = $("[data-template-list]");
    if (!container) return;
    const templates = N.storage.getState().mealTemplates;
    const count = $("[data-template-count]");
    if (count) count.textContent = String(templates.length);
    container.innerHTML = templates.length ? templates.map((template) => `<div class="template-row"><button type="button" data-use-template="${escapeHtml(template.id)}"><strong>${escapeHtml(template.name)}</strong><small>${template.items.length} ${template.items.length === 1 ? "item" : "items"} · tap to log</small></button><button type="button" data-remove-template="${escapeHtml(template.id)}" aria-label="Delete ${escapeHtml(template.name)}">×</button></div>`).join("") : '<div class="feature-empty compact">No saved templates yet.</div>';
  }

  function useTemplate(id) {
    const template = N.storage.getState().mealTemplates.find((item) => item.id === id);
    if (!template) return;
    template.items.forEach((item) => N.storage.addLog(item.foodId, item.portion, item.meal));
    toast(`${template.name} added to today.`);
  }

  async function lookupBarcode(code) {
    const result = $("[data-barcode-result]");
    if (!/^\d{6,14}$/.test(code)) {
      result.innerHTML = '<span class="feature-error">Enter a valid 6–14 digit barcode.</span>';
      return;
    }
    result.textContent = "Looking up this product…";
    try {
      const fields = "product_name,brands,serving_size,nutriments,allergens_tags,image_front_small_url";
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`);
      const payload = await response.json();
      if (!payload.product || payload.status !== 1) throw new Error("Product not found");
      const product = payload.product;
      const values = product.nutriments || {};
      const food = N.storage.addCustomFood({
        name: [product.brands, product.product_name].filter(Boolean).join(" ") || `Product ${code}`,
        servingLabel: "100 g (adjust using portion)",
        calories: Number(values["energy-kcal_100g"] || values["energy-kcal"] || 0),
        protein: Number(values.proteins_100g || 0), carbs: Number(values.carbohydrates_100g || 0), fat: Number(values.fat_100g || 0), fiber: Number(values.fiber_100g || 0),
        barcode: code, source: "Open Food Facts", tags: ["packaged", "barcode"]
      });
      result.innerHTML = `<strong>${escapeHtml(food.name)}</strong><span>${Math.round(food.calories)} kcal · ${Math.round(food.protein)}g protein per 100 g</span><small>Saved to My foods. Adjust the portion using the package serving size.</small>`;
      toast("Packaged food saved to your library.");
    } catch (error) {
      result.innerHTML = '<span class="feature-error">That barcode was not found. You can still create the food manually.</span>';
    }
  }

  async function scanBarcode(file) {
    const result = $("[data-barcode-result]");
    if (!("BarcodeDetector" in window)) {
      result.textContent = "Automatic barcode reading is unavailable here. Enter the printed number below.";
      return;
    }
    result.textContent = "Reading barcode on this device…";
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
      const codes = await detector.detect(bitmap);
      bitmap.close();
      if (!codes.length) throw new Error("No barcode found");
      $("[data-barcode-form] input[name='barcode']").value = codes[0].rawValue;
      await lookupBarcode(codes[0].rawValue);
    } catch (error) {
      result.textContent = "I could not read that image. Try better lighting or enter the printed digits.";
    }
  }

  function saveRecipe(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const lines = String(values.ingredients).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const foods = N.nutrition.getFoods();
    const matched = [];
    const missing = [];
    lines.forEach((line) => {
      const [name, portionRaw] = line.split("|").map((part) => part.trim());
      const food = foods.find((item) => item.name.toLowerCase() === name.toLowerCase()) || foods.find((item) => item.name.toLowerCase().includes(name.toLowerCase()));
      if (!food) return missing.push(name);
      matched.push({ food, portion: Math.max(0.05, Number(portionRaw) || 1) });
    });
    const result = $("[data-recipe-result]");
    if (missing.length || !matched.length) {
      result.innerHTML = `<span class="feature-error">${missing.length ? `Could not find: ${escapeHtml(missing.join(", "))}.` : "Add at least one ingredient."} Use names from the Nourish library.</span>`;
      return;
    }
    const servings = Math.max(1, Number(values.servings) || 1);
    const totals = Object.fromEntries(nutrients.map((key) => [key, 0]));
    matched.forEach(({ food, portion }) => nutrients.forEach((key) => { totals[key] += (Number(food[key]) || 0) * portion; }));
    const perServing = Object.fromEntries(nutrients.map((key) => [key, Math.round((totals[key] / servings) * 10) / 10]));
    const record = N.storage.addCustomFood(Object.assign({ name: String(values.name).trim(), servingLabel: `1 of ${servings} servings`, recipe: true, recipeIngredients: matched.map((item) => ({ foodId: item.food.id, portion: item.portion })), tags: ["recipe"] }, perServing));
    result.innerHTML = `<strong>${escapeHtml(record.name)} saved</strong><span>${Math.round(record.calories)} kcal · ${Math.round(record.protein)}g protein · ${Math.round(record.fiber)}g fibre per serving</span>`;
    toast("Recipe calculated and saved to My foods.");
  }

  function portionEstimate(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const food = N.nutrition.getFoods().find((item) => item.name.toLowerCase() === String(values.food).toLowerCase()) || N.nutrition.getFoods().find((item) => item.name.toLowerCase().includes(String(values.food).toLowerCase()));
    const result = $("[data-portion-result]");
    if (!food) return result.innerHTML = '<span class="feature-error">Choose a food from the Nourish library.</span>';
    const dishFactor = { small: 0.8, medium: 1, large: 1.25 }[values.dish] || 1;
    const portion = Math.round((Number(values.portion) * dishFactor) * 100) / 100;
    const scaled = N.nutrition.scaleFood(food, portion);
    result.innerHTML = `<strong>Estimated ${portion}× serving</strong><span>${Math.round(scaled.calories)} kcal · ${Math.round(scaled.protein)}g protein · ${Math.round(scaled.carbs)}g carbs · ${Math.round(scaled.fiber)}g fibre</span><small>Use ${portion} as the portion multiplier when logging. Photos cannot determine weight precisely.</small>`;
  }

  function disciplineData() {
    if (!profile().targets) return { score: 0, parts: [] };
    const targets = profile().targets;
    const days = N.nutrition.daysBack(7).map((day) => N.nutrition.totalsForDay(day.key));
    const logged = days.filter((day) => day.calories > 0 || day.water > 0).length / 7;
    const average = (key, filter) => days.reduce((sum, day) => sum + (filter(day) ? 1 : 0), 0) / 7;
    const balance = average("calories", (day) => day.calories >= targets.calories * 0.7 && day.calories <= targets.calories * 1.2);
    const protein = average("protein", (day) => day.protein >= targets.protein * 0.75);
    const fiber = average("fiber", (day) => day.fiber >= targets.fiber * 0.7);
    const water = average("water", (day) => day.water >= targets.water * 0.7);
    const parts = [["Logging", logged, 30], ["Energy", balance, 20], ["Protein", protein, 20], ["Fibre", fiber, 15], ["Water", water, 15]];
    return { score: Math.round(parts.reduce((sum, part) => sum + part[1] * part[2], 0)), parts };
  }

  function renderInsightsExtras() {
    const scoreNode = $("[data-discipline-score]");
    if (!scoreNode || !N.storage.getState().profile) return;
    const data = disciplineData();
    scoreNode.textContent = String(data.score);
    $("[data-discipline-copy]").textContent = data.score >= 80 ? "Strong consistency—keep the rhythm flexible and repeatable." : data.score >= 50 ? "Your rhythm is forming. Focus on one small gap at a time." : "Consistency grows from honest logs, not perfect days.";
    $("[data-discipline-breakdown]").innerHTML = data.parts.map(([label, value]) => `<div><span>${label}</span><i><b style="width:${Math.round(value * 100)}%"></b></i><strong>${Math.round(value * 100)}%</strong></div>`).join("");
    const state = N.storage.getState();
    const achievements = [
      ["First step", state.logs.length >= 1, "Log your first food"],
      ["Food explorer", new Set(state.logs.map((item) => item.foodId)).size >= 10, "Try 10 different foods"],
      ["Hydration rhythm", N.nutrition.currentStreak() >= 3, "Track for 3 days"],
      ["Meal prepper", state.mealTemplates.length >= 1, "Save a meal template"],
      ["Recipe creator", state.customFoods.some((item) => item.recipe), "Build a recipe"],
      ["Progress minded", state.weightLogs.length >= 3, "Log weight 3 times"]
    ];
    $("[data-achievements]").innerHTML = achievements.map(([name, unlocked, detail]) => `<div class="achievement ${unlocked ? "is-unlocked" : ""}"><span>${unlocked ? "◆" : "◇"}</span><strong>${name}</strong><small>${detail}</small></div>`).join("");
  }

  function renderWeight() {
    const container = $("[data-weight-trend]");
    if (!container) return;
    const logs = N.storage.getState().weightLogs.slice(-8);
    if (!logs.length) return container.innerHTML = '<div class="feature-empty compact">No weight entries yet.</div>';
    const values = logs.map((item) => item.weight);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    container.innerHTML = `<div class="weight-summary"><strong>${values[values.length - 1].toFixed(1)} kg</strong><small>${logs.length > 1 ? `${(values[values.length - 1] - values[0]).toFixed(1)} kg across ${logs.length} entries` : "First entry saved"}</small></div><div class="weight-bars">${logs.map((item) => `<i style="height:${30 + ((item.weight - min) / Math.max(1, max - min)) * 45}%" title="${item.weight} kg"></i>`).join("")}</div>`;
  }

  function renderPhotos() {
    const container = $("[data-progress-photos]");
    if (!container) return;
    container.innerHTML = N.storage.getState().progressPhotos.slice().reverse().map((item) => `<figure><img src="${item.dataUrl}" alt="Private progress photo from ${escapeHtml(item.date)}"><button type="button" data-remove-progress-photo="${escapeHtml(item.id)}" aria-label="Delete progress photo">×</button><figcaption>${escapeHtml(item.date)}</figcaption></figure>`).join("");
  }

  async function saveProgressPhoto(file) {
    if (!file) return;
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await image.decode();
    const scale = Math.min(1, 480 / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(image.src);
    try {
      N.storage.addProgressPhoto(canvas.toDataURL("image/jpeg", 0.62));
      renderPhotos();
      toast("Private progress photo saved on this device.");
    } catch (error) { toast("This device does not have enough local storage for that photo."); }
  }

  function categoryFor(name) {
    if (/milk|yog|paneer|cheese|egg|chicken|fish|tofu|dal|bean/i.test(name)) return "Protein & dairy";
    if (/apple|banana|fruit|spinach|broccoli|vegetable|onion|tomato/i.test(name)) return "Produce";
    if (/rice|bread|roti|oat|pasta|flour/i.test(name)) return "Grains";
    return "Pantry";
  }

  function renderShopping() {
    const container = $("[data-shopping-list]");
    if (!container) return;
    const items = N.storage.getState().shoppingList;
    container.innerHTML = items.length ? items.map((item) => `<label class="shopping-row ${item.checked ? "is-checked" : ""}"><input type="checkbox" data-shop-toggle="${escapeHtml(item.id)}" ${item.checked ? "checked" : ""}><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)}</small></span><button type="button" data-shop-remove="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}">×</button></label>`).join("") : '<div class="feature-empty compact">Your list is empty.</div>';
  }

  function swapMarkup(food) {
    const treat = /snack|sweet|dessert|fast food|branded/i.test(food.category) || (food.tags || []).includes("treat") || food.calories >= 450;
    if (!treat) return "";
    const sweet = /cake|chocolate|cookie|brownie|doughnut|ice cream|sweet|dessert|jamun|jalebi|rasgulla/i.test(`${food.name} ${food.category}`);
    const savourySnack = /chips|crisps|fries|nachos|pakora|samosa|kachori/i.test(food.name);
    const fastMeal = /pizza|burger|hot dog|fried chicken|noodles|macaroni|pasta/i.test(food.name);
    const preferredIds = sweet ? ["greek-yogurt", "berries", "apple", "dates"] : savourySnack ? ["hummus", "almonds", "chickpeas", "garden-salad"] : fastMeal ? ["chicken-tacos", "tuna-sandwich", "falafel-wrap", "garden-salad"] : [];
    const compatible = compatibleFoods();
    let alternative = preferredIds.map((id) => compatible.find((item) => item.id === id)).find((item) => item && item.calories < food.calories);
    if (!alternative) alternative = compatible.filter((item) => item.id !== food.id && item.calories < food.calories * 0.78 && (item.protein > food.protein || item.fiber > food.fiber)).sort((a, b) => (b.protein + b.fiber * 2) - (a.protein + a.fiber * 2))[0];
    if (!alternative) return "";
    return `<div class="healthier-swap"><span>Want a lighter alternative?</span><button type="button" data-swap-food="${escapeHtml(alternative.id)}"><strong>${escapeHtml(alternative.name)}</strong><small>${Math.round(alternative.calories)} kcal · ${Math.round(alternative.protein)}g protein</small></button><em>No judgement—your original choice still fits a balanced life.</em></div>`;
  }

  function renderAll() {
    renderPlan(); renderTemplates(); renderInsightsExtras(); renderWeight(); renderPhotos(); renderShopping();
    const datalist = $("[data-portion-foods]");
    if (datalist && !datalist.children.length) datalist.innerHTML = N.nutrition.getFoods().map((food) => `<option value="${escapeHtml(food.name)}"></option>`).join("");
  }

  function bind() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-generate-plan]")) generatePlan();
      if (event.target.closest("[data-open-barcode]")) $("[data-barcode-dialog]").showModal();
      if (event.target.closest("[data-open-recipe]")) $("[data-recipe-dialog]").showModal();
      if (event.target.closest("[data-open-portion]")) $("[data-portion-dialog]").showModal();
      if (event.target.closest("[data-close-feature]")) event.target.closest("dialog").close();
      if (event.target.closest("[data-save-template]")) $("[data-template-dialog]").showModal();
      const planLog = event.target.closest("[data-plan-log]");
      if (planLog) { N.storage.addLog(planLog.dataset.planLog, 1, planLog.dataset.planMeal); toast("Planned food added to today."); }
      const planShop = event.target.closest("[data-plan-shop]");
      if (planShop) { N.storage.addShoppingItem(planShop.dataset.planShop, categoryFor(planShop.dataset.planShop)); renderShopping(); toast("Added to shopping list."); }
      const use = event.target.closest("[data-use-template]");
      if (use) useTemplate(use.dataset.useTemplate);
      const removeTemplate = event.target.closest("[data-remove-template]");
      if (removeTemplate) { N.storage.removeMealTemplate(removeTemplate.dataset.removeTemplate); renderTemplates(); }
      const shopToggle = event.target.closest("[data-shop-toggle]");
      if (shopToggle) { N.storage.toggleShoppingItem(shopToggle.dataset.shopToggle); renderShopping(); }
      const shopRemove = event.target.closest("[data-shop-remove]");
      if (shopRemove) { N.storage.removeShoppingItem(shopRemove.dataset.shopRemove); renderShopping(); }
      const photoRemove = event.target.closest("[data-remove-progress-photo]");
      if (photoRemove) { N.storage.removeProgressPhoto(photoRemove.dataset.removeProgressPhoto); renderPhotos(); }
    });

    $("[data-barcode-form]").addEventListener("submit", (event) => { event.preventDefault(); lookupBarcode(String(new FormData(event.currentTarget).get("barcode") || "").trim()); });
    $("[data-barcode-image]").addEventListener("change", (event) => { if (event.target.files[0]) scanBarcode(event.target.files[0]); });
    $("[data-recipe-form]").addEventListener("submit", (event) => { event.preventDefault(); saveRecipe(event.currentTarget); });
    $("[data-portion-form]").addEventListener("submit", (event) => { event.preventDefault(); portionEstimate(event.currentTarget); });
    $("[data-template-form]").addEventListener("submit", (event) => { event.preventDefault(); saveTemplate(String(new FormData(event.currentTarget).get("name") || "")); $("[data-template-dialog]").close(); event.currentTarget.reset(); });
    $("[data-weight-form]").addEventListener("submit", (event) => { event.preventDefault(); const weight = Number(new FormData(event.currentTarget).get("weight")); N.storage.addWeight(weight); renderWeight(); event.currentTarget.reset(); toast("Weight entry saved privately."); });
    $("[data-measurement-form]").addEventListener("submit", (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); N.storage.addMeasurements({ waist: Number(values.waist) || null, chest: Number(values.chest) || null }); event.currentTarget.reset(); toast("Measurements saved privately."); });
    $("[data-progress-photo]").addEventListener("change", (event) => { saveProgressPhoto(event.target.files[0]); event.target.value = ""; });
    $("[data-shopping-form]").addEventListener("submit", (event) => { event.preventDefault(); const name = String(new FormData(event.currentTarget).get("name") || "").trim(); if (name) N.storage.addShoppingItem(name, categoryFor(name)); event.currentTarget.reset(); renderShopping(); });
    window.addEventListener("nourish:state", renderAll);
  }

  document.addEventListener("DOMContentLoaded", () => { bind(); renderAll(); });
  N.features = { renderAll, generatePlan, swapMarkup };
}());
