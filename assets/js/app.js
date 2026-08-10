(function () {
  "use strict";

  const N = window.Nourish;
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const routes = ["today", "log", "workout", "coach", "insights", "profile"];
  const mealLabels = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snacks" };
  let installPrompt = null;
  let activeFoodFilter = "all";
  let activeRestaurant = "";
  let selectedRecommendation = null;

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  function formatNumber(value, maximumFractionDigits) {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: maximumFractionDigits == null ? 0 : maximumFractionDigits }).format(Number(value) || 0);
  }

  function showToast(message) {
    const toast = $("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  function applySettings() {
    const settings = N.storage.getState().settings;
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = settings.theme === "dark" || (settings.theme === "system" && systemDark);
    document.body.classList.toggle("is-dark", shouldDark);
    document.body.classList.toggle("reduce-motion", Boolean(settings.reduceMotion));
    const themeBox = $("[data-theme-checkbox]");
    const motionBox = $("[data-motion-checkbox]");
    if (themeBox) themeBox.checked = shouldDark;
    if (motionBox) motionBox.checked = Boolean(settings.reduceMotion);
    $("meta[name='theme-color']").setAttribute("content", shouldDark ? "#111713" : "#f7f8f5");
  }

  function profileTargets(profile) {
    const base = (profile && profile.targets) || N.nutrition.calculateTargets(profile || {});
    return N.lifeTools ? N.lifeTools.adaptiveTargets(base) : base;
  }

  function setupOnboarding() {
    const overlay = $("[data-onboarding]");
    const shell = $("[data-app-shell]");
    const form = $("[data-onboarding-form]");
    if (N.storage.getState().profile) {
      overlay.hidden = true;
      shell.hidden = false;
      return;
    }

    overlay.hidden = false;
    shell.hidden = true;
    let step = 1;

    function validateCurrentStep() {
      const section = $(`[data-step="${step}"]`, form);
      const fields = $$('input[required], select[required]', section);
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    }

    function profileFromForm() {
      const values = Object.fromEntries(new FormData(form).entries());
      return {
        name: String(values.name || "").trim(),
        age: Number(values.age),
        sex: values.sex,
        height: Number(values.height),
        weight: Number(values.weight),
        activity: values.activity,
        goal: values.goal,
        diet: values.diet || "omnivore",
        allergies: String(values.allergies || "").trim()
      };
    }

    function renderTargetPreview() {
      const targets = N.nutrition.calculateTargets(profileFromForm());
      $("[data-target-preview]").innerHTML = [
        [formatNumber(targets.calories), "Calories"],
        [`${targets.protein}g`, "Protein"],
        [`${targets.fiber}g`, "Fibre"],
        [`${(targets.water / 1000).toFixed(1)}L`, "Water"]
      ].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
    }

    function setStep(nextStep) {
      step = N.nutrition.clamp(nextStep, 1, 4);
      $$('[data-step]', form).forEach((section) => {
        const active = Number(section.dataset.step) === step;
        section.hidden = !active;
        section.classList.toggle("is-active", active);
      });
      $("[data-progress-bar]").style.width = `${step * 25}%`;
      $("[data-step-back]").hidden = step === 1;
      $("[data-step-next]").hidden = step === 4;
      $("[data-step-finish]").hidden = step !== 4;
      $("[data-onboarding-error]").textContent = "";
      if (step === 4) renderTargetPreview();
      const firstField = $(`input:not([type="radio"]):not([type="checkbox"]), select`, $(`[data-step="${step}"]`, form));
      if (firstField) window.setTimeout(() => firstField.focus(), 80);
    }

    $("[data-step-next]").addEventListener("click", () => {
      if (validateCurrentStep()) setStep(step + 1);
    });
    $("[data-step-back]").addEventListener("click", () => setStep(step - 1));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateCurrentStep()) return;
      try {
        const profile = profileFromForm();
        profile.targets = N.nutrition.calculateTargets(profile);
        N.storage.setProfile(profile);
        overlay.hidden = true;
        shell.hidden = false;
        applySettings();
        renderAll();
        window.location.hash = "today";
        showToast("Your Nourish plan is ready.");
      } catch (error) {
        $("[data-onboarding-error]").textContent = "Something went wrong while saving your profile. Please try again.";
      }
    });
    setStep(1);
  }

  function currentRoute() {
    const hash = window.location.hash.replace("#", "").split("?")[0];
    return routes.includes(hash) ? hash : "today";
  }

  function routeApp() {
    if (!N.storage.getState().profile) return;
    const route = currentRoute();
    $$('[data-view]').forEach((view) => { view.hidden = view.dataset.view !== route; });
    $$('[data-route]').forEach((link) => {
      const active = link.dataset.route === route;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    const title = route.replace(/^./, (letter) => letter.toUpperCase());
    document.title = `Nourish — ${title}`;
    if (route === "today") renderToday();
    if (route === "log") renderLog();
    if (route === "workout" && N.workout) N.workout.render();
    if (route === "coach" && N.coach) N.coach.render();
    if (route === "insights") renderInsights();
    if (route === "profile") renderProfile();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function greetingForHour() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function dailyMessage(totals, targets) {
    const streak = N.nutrition.currentStreak();
    if (!totals.calories && !totals.water) return "Start with one honest log. Momentum follows.";
    if (totals.water < targets.water * 0.35 && new Date().getHours() > 13) return "A little hydration would sharpen the rest of your day.";
    if (totals.protein < targets.protein * 0.45 && totals.calories > targets.calories * 0.55) return "Protein is today’s clearest opportunity.";
    if (streak >= 3) return `${streak} days of showing up. Keep the rhythm simple.`;
    return "You’re building the day one useful choice at a time.";
  }

  function renderToday() {
    const state = N.storage.getState();
    const profile = state.profile;
    const targets = profileTargets(profile);
    const totals = N.nutrition.totalsForDay();
    const caloriePercent = N.nutrition.percent(totals.calories, targets.calories);
    const waterPercent = N.nutrition.percent(totals.water, targets.water);
    const today = new Date();
    $("[data-today-date]").textContent = today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
    $("#today-title").firstChild.textContent = `${greetingForHour()}, `;
    $("[data-user-name]").textContent = profile.name.split(" ")[0];
    $("[data-daily-message]").textContent = dailyMessage(totals, targets);
    $("[data-calorie-percent]").textContent = `${Math.min(100, caloriePercent)}%`;
    $("[data-calorie-ring]").style.setProperty("--progress", `${Math.min(100, caloriePercent) * 3.6}deg`);
    $("[data-calorie-ring]").setAttribute("aria-valuenow", String(Math.min(100, caloriePercent)));
    $("[data-calories-eaten]").textContent = formatNumber(totals.calories);
    $("[data-calories-left]").textContent = formatNumber(Math.max(0, targets.calories - totals.calories));
    $("[data-calorie-target]").textContent = formatNumber(targets.calories);
    const status = $("[data-calorie-status]");
    status.textContent = caloriePercent > 110 ? "Above estimate" : caloriePercent >= 80 ? "Nearly there" : "On track";
    status.style.background = caloriePercent > 110 ? "color-mix(in srgb, var(--coral) 18%, var(--surface))" : "";
    status.style.color = caloriePercent > 110 ? "var(--coral)" : "";

    const macroRows = [
      ["protein", "Protein", totals.protein, targets.protein, "g"],
      ["fiber", "Fibre", totals.fiber, targets.fiber, "g"],
      ["carbs", "Carbs", totals.carbs, targets.carbs, "g"],
      ["fat", "Fat", totals.fat, targets.fat, "g"]
    ];
    $("[data-macro-list]").innerHTML = macroRows.map(([key, label, value, target, unit]) => `<div class="macro-row" data-nutrient="${key}"><span>${label}</span><div class="progress-track"><i style="width:${Math.min(100, N.nutrition.percent(value, target))}%"></i></div><strong>${formatNumber(value)} / ${target}${unit}</strong></div>`).join("");

    $("[data-water-summary]").textContent = `${(totals.water / 1000).toFixed(1)} / ${(targets.water / 1000).toFixed(1)} L`;
    $("[data-water-percent]").textContent = `${Math.min(100, waterPercent)}%`;
    $("[data-water-fill]").style.height = `${Math.min(100, waterPercent)}%`;
    $("[data-water-progress]").setAttribute("aria-valuenow", String(Math.min(100, waterPercent)));

    const recommendation = N.nutrition.recommendations(null, 1)[0];
    selectedRecommendation = recommendation ? recommendation.food : null;
    if (recommendation) {
      $("[data-recommendation-title]").textContent = recommendation.food.name;
      $("[data-recommendation-reason]").textContent = recommendation.reason;
      $("[data-recommendation-meta]").innerHTML = `<span>${recommendation.food.servingLabel}</span><span>${formatNumber(recommendation.food.calories)} kcal</span><span>${formatNumber(recommendation.food.protein)}g protein</span><span>${formatNumber(recommendation.food.fiber)}g fibre</span>`;
    }

    renderTodayMeals();
    renderSharedProfileBits();
  }

  function renderTodayMeals() {
    const state = N.storage.getState();
    const todayKey = N.storage.getDayKey();
    const entries = state.logs.filter((entry) => entry.date === todayKey);
    $("[data-today-meals]").innerHTML = Object.keys(mealLabels).map((meal) => {
      const items = entries.filter((entry) => entry.meal === meal);
      const calories = items.reduce((sum, entry) => {
        const food = N.nutrition.getFood(entry.foodId);
        return sum + (food ? N.nutrition.scaleFood(food, entry.portion).calories : 0);
      }, 0);
      const names = items.map((entry) => N.nutrition.getFood(entry.foodId)).filter(Boolean).map((food) => food.name).join(", ");
      return `<div class="meal-summary"><div><span>${mealLabels[meal]}</span><strong>${formatNumber(calories)} kcal</strong></div><p>${names ? escapeHtml(names) : "Nothing logged yet"}</p></div>`;
    }).join("");
  }

  function filteredFoods() {
    const state = N.storage.getState();
    const profile = state.profile;
    const query = String($("[data-food-search]").value || "").trim().toLowerCase();
    let foods = N.nutrition.getFoods().filter((food) => N.nutrition.compatibleWithProfile(food, profile));
    if (activeRestaurant) foods = foods.filter((food) => food.restaurant === activeRestaurant);
    if (query) foods = foods.filter((food) => `${food.name} ${food.category} ${(food.tags || []).join(" ")}`.toLowerCase().includes(query));
    if (activeFoodFilter === "recent") {
      const ids = [...state.logs].reverse().map((entry) => entry.foodId);
      foods = foods.filter((food) => ids.includes(food.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }
    if (activeFoodFilter === "favorites") foods = foods.filter((food) => state.favoriteFoodIds.includes(food.id));
    if (activeFoodFilter === "indian") foods = foods.filter((food) => (food.tags || []).includes("indian"));
    if (activeFoodFilter === "produce") foods = foods.filter((food) => food.category === "fruit" || String(food.category).includes("vegetable"));
    if (activeFoodFilter === "drinks") foods = foods.filter((food) => /drink|juice|tea|coffee/.test(String(food.category).toLowerCase()) || (food.tags || []).some((tag) => /drink|juice/.test(tag)));
    if (activeFoodFilter === "brands") foods = foods.filter((food) => String(food.category).toLowerCase().includes("branded") || (food.tags || []).includes("packaged"));
    if (activeFoodFilter === "treats") foods = foods.filter((food) => /snack|sweet|dessert|fast food|branded/.test(food.category) || (food.tags || []).includes("treat"));
    if (activeFoodFilter === "high-protein") foods = foods.filter((food) => food.protein >= 10).sort((a, b) => b.protein - a.protein);
    if (activeFoodFilter === "high-fibre") foods = foods.filter((food) => food.fiber >= 4).sort((a, b) => b.fiber - a.fiber);
    if (activeFoodFilter === "custom") foods = foods.filter((food) => food.custom);
    if (activeFoodFilter === "all" && !query) {
      const ranked = N.nutrition.recommendations(null, 10).map((item) => item.food.id);
      foods.sort((a, b) => (ranked.indexOf(a.id) < 0 ? 99 : ranked.indexOf(a.id)) - (ranked.indexOf(b.id) < 0 ? 99 : ranked.indexOf(b.id)));
    }
    return foods;
  }

  function foodCard(food) {
    const favorite = N.storage.getState().favoriteFoodIds.includes(food.id);
    return `<button class="food-card" type="button" data-food-id="${escapeHtml(food.id)}"><span class="food-emoji" aria-hidden="true">${escapeHtml(food.emoji || "🍽️")}</span><div><strong>${escapeHtml(food.displayName || food.name)}${favorite ? '<i class="favorite-mark" aria-label="Favorite">★</i>' : ""}</strong><small>${food.restaurant ? `${escapeHtml(food.restaurant)} · ` : ""}${escapeHtml(food.servingLabel)}</small></div><span>${formatNumber(food.calories)} kcal</span></button>`;
  }

  function renderLog() {
    const restaurantSelect = $("[data-restaurant-select]");
    if (restaurantSelect && restaurantSelect.options.length === 1) {
      const restaurants = [...new Set(N.nutrition.getFoods().map((food) => food.restaurant).filter(Boolean))].sort();
      restaurantSelect.insertAdjacentHTML("beforeend", restaurants.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join(""));
    }
    const foods = filteredFoods();
    $("[data-food-grid]").innerHTML = foods.length ? foods.map(foodCard).join("") : '<div class="empty-state"><strong>No matching foods</strong><p>Try another search or create a custom food.</p></div>';
    $("[data-food-count]").textContent = `${foods.length} ${foods.length === 1 ? "food" : "foods"}`;
    const restaurantCount = $("[data-restaurant-menu-count]");
    if (restaurantCount) restaurantCount.textContent = activeRestaurant ? `${foods.length} menu items` : `${N.nutrition.getFoods().filter((food) => food.restaurant).length} restaurant items`;
    $("[data-food-results-title]").textContent = activeFoodFilter === "all" ? "Suggested foods" : $(`[data-filter="${activeFoodFilter}"]`).textContent;

    const state = N.storage.getState();
    const todayKey = N.storage.getDayKey();
    const entries = state.logs.filter((entry) => entry.date === todayKey).slice().reverse();
    let calories = 0;
    $("[data-log-list]").innerHTML = entries.length ? entries.map((entry) => {
      const food = N.nutrition.getFood(entry.foodId);
      if (!food) return "";
      const scaled = N.nutrition.scaleFood(food, entry.portion);
      calories += scaled.calories;
      return `<div class="log-entry"><div><strong>${escapeHtml(food.name)}</strong><small>${escapeHtml(mealLabels[entry.meal] || "Meal")} · ${entry.portion}× · ${formatNumber(scaled.calories)} kcal</small></div><button type="button" data-remove-log="${escapeHtml(entry.id)}" aria-label="Remove ${escapeHtml(food.name)}">×</button></div>`;
    }).join("") : '<div class="log-empty">Your first meal is waiting.</div>';
    $("[data-log-calories]").textContent = `${formatNumber(calories)} kcal`;
    const water = N.nutrition.totalsForDay().water;
    $("[data-log-water-summary]").textContent = `${formatNumber(water)} ml today`;
  }

  function openFood(foodId) {
    const food = N.nutrition.getFood(foodId);
    const dialog = $("[data-food-dialog]");
    if (!food || !dialog) return;
    const totals = N.nutrition.totalsForDay();
    const targets = profileTargets(N.storage.getState().profile);
    const remainingCalories = Math.max(0, targets.calories - totals.calories);
    const isFavorite = N.storage.getState().favoriteFoodIds.includes(food.id);
    const preferredPortion = Number(N.storage.getState().preferredPortions[food.id]) || 1;
    const content = $("[data-food-dialog-content]");
    content.innerHTML = `<form class="food-dialog-inner" data-add-food-form>
      <div class="dialog-food-hero"><span class="food-emoji" aria-hidden="true">${escapeHtml(food.emoji || "🍽️")}</span><div><h2>${escapeHtml(food.name)}</h2><p>${escapeHtml(food.servingLabel)} · starter value estimate</p></div></div>
      <button class="favorite-button ${isFavorite ? "is-favorite" : ""}" type="button" data-favorite-food="${escapeHtml(food.id)}" aria-pressed="${isFavorite}"><span aria-hidden="true">${isFavorite ? "★" : "☆"}</span> ${isFavorite ? "Saved to favorites" : "Save to favorites"}</button>
      <div class="nutrition-facts" data-scaled-facts>
        <div><strong>${formatNumber(food.calories)}</strong><span>Calories</span></div><div><strong>${formatNumber(food.protein, 1)}g</strong><span>Protein</span></div><div><strong>${formatNumber(food.fiber, 1)}g</strong><span>Fibre</span></div><div><strong>${formatNumber(food.carbs, 1)}g</strong><span>Carbs</span></div>
      </div>
      <div class="portion-control"><label><span>Portion multiplier</span><span class="portion-stepper"><button type="button" data-portion-minus aria-label="Decrease portion">−</button><input name="portion" type="number" min="0.25" max="10" step="0.25" value="${preferredPortion}" aria-label="Portion multiplier"><button type="button" data-portion-plus aria-label="Increase portion">+</button></span></label><label><span>Meal</span><select class="select-input" name="meal"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></label></div>
      <div class="dialog-impact" data-dialog-impact>This serving uses ${formatNumber(food.calories)} of roughly ${formatNumber(remainingCalories)} remaining calories.</div>
      ${food.restaurant ? `<div class="restaurant-source ${food.nutritionVerified ? "is-verified" : ""}"><strong>${food.nutritionVerified ? "Published nutrition" : "Estimated serving"}</strong><span>${escapeHtml(food.restaurant)} · ${escapeHtml(food.nutritionSource || "Restaurant serving estimate")}. Availability and recipes can vary by Bengaluru outlet.</span></div>` : ""}
      ${N.features ? N.features.swapMarkup(food) : ""}
      <button class="button button-primary button-full" type="submit">Add to today</button>
    </form>`;
    const form = $("[data-add-food-form]", content);
    const portionInput = $('input[name="portion"]', form);
    $("[data-favorite-food]", form).addEventListener("click", (event) => {
      N.storage.toggleFavoriteFood(food.id);
      const favorite = N.storage.getState().favoriteFoodIds.includes(food.id);
      event.currentTarget.classList.toggle("is-favorite", favorite);
      event.currentTarget.setAttribute("aria-pressed", String(favorite));
      event.currentTarget.innerHTML = `<span aria-hidden="true">${favorite ? "★" : "☆"}</span> ${favorite ? "Saved to favorites" : "Save to favorites"}`;
      renderLog();
      showToast(favorite ? `${food.name} saved to favorites.` : `${food.name} removed from favorites.`);
    });
    const updateScaled = () => {
      const scaled = N.nutrition.scaleFood(food, portionInput.value);
      $("[data-scaled-facts]", form).innerHTML = `<div><strong>${formatNumber(scaled.calories)}</strong><span>Calories</span></div><div><strong>${formatNumber(scaled.protein, 1)}g</strong><span>Protein</span></div><div><strong>${formatNumber(scaled.fiber, 1)}g</strong><span>Fibre</span></div><div><strong>${formatNumber(scaled.carbs, 1)}g</strong><span>Carbs</span></div>`;
      $("[data-dialog-impact]", form).textContent = `This serving uses ${formatNumber(scaled.calories)} of roughly ${formatNumber(remainingCalories)} remaining calories.`;
    };
    $("[data-portion-minus]", form).addEventListener("click", () => { portionInput.value = Math.max(0.25, Number(portionInput.value) - 0.25); updateScaled(); });
    $("[data-portion-plus]", form).addEventListener("click", () => { portionInput.value = Math.min(10, Number(portionInput.value) + 0.25); updateScaled(); });
    portionInput.addEventListener("input", updateScaled);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(form);
      N.storage.addLog(food.id, values.get("portion"), values.get("meal"));
      dialog.close();
      renderAll();
      showToast(`${food.name} added to today.`);
    });
    dialog.showModal();
  }

  function renderInsights() {
    const state = N.storage.getState();
    const targets = profileTargets(state.profile);
    const days = N.nutrition.daysBack(7).map((item) => Object.assign(item, { totals: N.nutrition.totalsForDay(item.key) }));
    const activeDays = days.filter((day) => day.totals.calories > 0 || day.totals.water > 0);
    const qualifiedDays = activeDays.filter((day) => day.totals.calories > 0 && day.totals.calories <= targets.calories * 1.15 && day.totals.protein >= targets.protein * 0.75 && day.totals.water >= targets.water * 0.7);
    const consistency = activeDays.length ? Math.round((qualifiedDays.length / 7) * 100) : 0;
    $("[data-consistency-score]").textContent = `${consistency}%`;
    $("[data-consistency-ring]").style.setProperty("--score", `${consistency * 3.6}deg`);
    $("[data-consistency-ring]").setAttribute("aria-valuenow", String(consistency));
    $("[data-consistency-ring-text]").textContent = consistency;
    $("[data-consistency-copy]").textContent = activeDays.length ? `${qualifiedDays.length} balanced ${qualifiedDays.length === 1 ? "day" : "days"} in the current seven-day window.` : "Log your first meal to begin your weekly picture.";

    $("[data-week-chart]").innerHTML = days.map((day) => {
      const ratio = day.totals.calories / Math.max(1, targets.calories);
      return `<div class="day-bar ${ratio > 1.15 ? "is-over" : ""}" title="${day.date.toLocaleDateString()}: ${formatNumber(day.totals.calories)} calories"><i style="height:${Math.min(100, ratio * 80)}%"></i><small>${day.date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</small></div>`;
    }).join("");

    const divisor = Math.max(1, activeDays.length);
    const averageProtein = activeDays.reduce((sum, day) => sum + day.totals.protein, 0) / divisor;
    const averageWater = activeDays.reduce((sum, day) => sum + day.totals.water, 0) / divisor;
    $("[data-average-protein]").textContent = `${formatNumber(averageProtein)}g`;
    $("[data-average-water]").textContent = `${(averageWater / 1000).toFixed(1)}L`;
    $("[data-protein-insight]").textContent = activeDays.length ? (averageProtein >= targets.protein * 0.8 ? "A strong, repeatable protein rhythm." : "Protein is the clearest weekly opportunity.") : "No logged days yet.";
    $("[data-water-insight]").textContent = activeDays.length ? (averageWater >= targets.water * 0.75 ? "Hydration is holding steady." : "Try anchoring water to existing routines.") : "No logged days yet.";

    const trendRows = [
      ["Protein", averageProtein, targets.protein, "var(--green)"],
      ["Fibre", activeDays.reduce((sum, day) => sum + day.totals.fiber, 0) / divisor, targets.fiber, "var(--coral)"],
      ["Water", averageWater, targets.water, "var(--blue)"],
      ["Calories", activeDays.reduce((sum, day) => sum + day.totals.calories, 0) / divisor, targets.calories, "var(--amber)"]
    ];
    $("[data-nutrient-trends]").innerHTML = trendRows.map(([label, value, target, color]) => {
      const completion = Math.min(100, N.nutrition.percent(value, target));
      return `<div class="trend-row"><span>${label}</span><div class="progress-track"><i style="width:${completion}%;background:${color}"></i></div><strong>${completion}%</strong></div>`;
    }).join("");
    const focusHeading = $("[data-weekly-focus]");
    if (focusHeading) {
      const proteinRatio = averageProtein / Math.max(1, targets.protein); const waterRatio = averageWater / Math.max(1, targets.water);
      const fiberAverage = activeDays.reduce((sum, day) => sum + day.totals.fiber, 0) / divisor; const fiberRatio = fiberAverage / Math.max(1, targets.fiber);
      let heading = "Keep building your rhythm"; let copy = "Consistency beats perfection. Repeat the meals and routines that made healthy choices easier.";
      if (!activeDays.length) { heading = "Build your first pattern"; copy = "Log meals and water to reveal your clearest next step."; }
      else if (waterRatio < proteinRatio && waterRatio < fiberRatio) { heading = "Hydration is your easiest win"; copy = `Your seven-day average is ${(averageWater / 1000).toFixed(1)} L. Attach one glass of water to each meal.`; }
      else if (proteinRatio < fiberRatio) { heading = "Give protein a steadier rhythm"; copy = `You are averaging ${formatNumber(averageProtein)} g. Add one familiar protein source to the meal that usually falls short.`; }
      else { heading = "Make fibre the next small upgrade"; copy = `You are averaging ${formatNumber(fiberAverage)} g. Add fruit, vegetables, beans or whole grains once more each day.`; }
      focusHeading.textContent = heading; $("[data-weekly-focus-copy]").textContent = copy;
    }
  }

  function renderProfile() {
    const profile = N.storage.getState().profile;
    const targets = profileTargets(profile);
    const form = $("[data-profile-form]");
    Object.entries(profile).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field && typeof value !== "object") field.value = value;
    });
    Object.entries(targets).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = value;
    });
    $("[data-profile-name-heading]").textContent = profile.name;
    $("[data-profile-avatar]").textContent = profile.name.slice(0, 1).toUpperCase();
    applySettings();
    if (N.reminders) N.reminders.render();
  }

  function renderSharedProfileBits() {
    const state = N.storage.getState();
    if (!state.profile) return;
    $$('[data-profile-avatar], [data-open-profile]').forEach((item) => { item.textContent = state.profile.name.slice(0, 1).toUpperCase(); });
    const streak = N.nutrition.currentStreak();
    $("[data-streak-count]").textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
  }

  function renderAll() {
    if (!N.storage.getState().profile) return;
    renderToday();
    renderLog();
    renderInsights();
    renderProfile();
    if (N.coach) N.coach.render();
  }

  function bindEvents() {
    window.addEventListener("hashchange", routeApp);
    window.addEventListener("nourish:state", () => {
      const route = currentRoute();
      if (route === "today") renderToday();
      if (route === "log") renderLog();
      if (route === "insights") renderInsights();
      if (route === "coach" && N.coach) N.coach.render();
    });
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); installPrompt = event; });
    window.addEventListener("nourish:toast", (event) => showToast(event.detail && event.detail.message ? event.detail.message : "Nourish updated."));

    document.addEventListener("click", async (event) => {
      const foodCardButton = event.target.closest("[data-food-id]");
      if (foodCardButton) openFood(foodCardButton.dataset.foodId);
      const swapButton = event.target.closest("[data-swap-food]");
      if (swapButton) {
        const dialog = $("[data-food-dialog]");
        if (dialog && dialog.open) dialog.close();
        openFood(swapButton.dataset.swapFood);
      }

      const waterButton = event.target.closest("[data-add-water]");
      if (waterButton) {
        N.storage.addWater(waterButton.dataset.addWater);
        renderAll();
        showToast(`${waterButton.dataset.addWater} ml water added.`);
      }
      if (event.target.closest("[data-undo-water]")) {
        N.storage.undoWater();
        renderAll();
        showToast("Last water entry removed.");
      }
      const remove = event.target.closest("[data-remove-log]");
      if (remove) {
        N.storage.removeLog(remove.dataset.removeLog);
        renderAll();
        showToast("Food removed from today.");
      }
      if (event.target.closest("[data-quick-log]")) window.location.hash = "log";
      if (event.target.closest("[data-open-profile]")) window.location.hash = "profile";
      if (event.target.closest("[data-log-recommendation]") && selectedRecommendation) openFood(selectedRecommendation.id);
      if (event.target.closest("[data-create-food]")) $("[data-custom-food-dialog]").showModal();
      if (event.target.closest("[data-close-custom]")) $("[data-custom-food-dialog]").close();
      if (event.target.closest("[data-custom-water]")) $("[data-custom-water-dialog]").showModal();
      if (event.target.closest("[data-open-custom-water]")) $("[data-custom-water-dialog]").showModal();
      if (event.target.closest("[data-close-custom-water]")) $("[data-custom-water-dialog]").close();

      const filterButton = event.target.closest("[data-filter]");
      if (filterButton) {
        activeFoodFilter = filterButton.dataset.filter;
        $$('[data-filter]').forEach((button) => button.classList.toggle("is-active", button === filterButton));
        renderLog();
      }

      const installButton = event.target.closest("[data-install-button]");
      if (installButton) {
        if (installPrompt) {
          installPrompt.prompt();
          await installPrompt.userChoice;
          installPrompt = null;
        } else {
          const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
          showToast(isIOS ? "Tap Share, then Add to Home Screen." : "Open your browser menu and choose Install app.");
        }
      }

      if (event.target.closest("[data-export]")) exportBackup();
      if (event.target.closest("[data-reset]")) resetData();
      if (event.target.closest("[data-theme-toggle]")) {
        const isDark = document.body.classList.contains("is-dark");
        N.storage.updateSettings({ theme: isDark ? "light" : "dark" });
        applySettings();
      }
    });

    $("[data-food-search]").addEventListener("input", renderLog);
    $("[data-restaurant-select]").addEventListener("change", (event) => {
      activeRestaurant = event.target.value;
      activeFoodFilter = "all";
      $$('[data-filter]').forEach((button) => button.classList.toggle("is-active", button.dataset.filter === "all"));
      renderLog();
    });
    $("[data-custom-food-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const food = N.storage.addCustomFood({
        name: String(values.name).trim(), servingLabel: String(values.servingLabel).trim(), calories: Number(values.calories), protein: Number(values.protein), carbs: Number(values.carbs), fat: Number(values.fat), fiber: Number(values.fiber)
      });
      event.currentTarget.reset();
      $("[data-custom-food-dialog]").close();
      renderLog();
      showToast(`${food.name} saved to My foods.`);
    });

    $("[data-custom-water-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const amount = Number(new FormData(event.currentTarget).get("amount"));
      N.storage.addWater(amount);
      $("[data-custom-water-dialog]").close();
      renderAll();
      showToast(`${amount} ml water added.`);
    });

    $("[data-profile-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const previous = N.storage.getState().profile;
      const profile = Object.assign({}, previous, {
        name: String(values.name).trim(), age: Number(values.age), height: Number(values.height), weight: Number(values.weight), goal: values.goal, diet: values.diet, allergies: String(values.allergies || "").trim(),
        dislikes: String(values.dislikes || "").trim(), mealTimes: String(values.mealTimes || "").trim(), cookTime: values.cookTime || "quick", budget: values.budget || "balanced",
        targets: Object.assign({}, previous.targets, { calories: Number(values.calories), protein: Number(values.protein), fiber: Number(values.fiber), water: Number(values.water) })
      });
      N.storage.setProfile(profile);
      renderAll();
      showToast("Your Nourish settings are updated.");
    });

    $("[data-theme-checkbox]").addEventListener("change", (event) => {
      N.storage.updateSettings({ theme: event.target.checked ? "dark" : "light" });
      applySettings();
    });
    $("[data-motion-checkbox]").addEventListener("change", (event) => {
      N.storage.updateSettings({ reduceMotion: event.target.checked });
      applySettings();
    });
    $("[data-import]").addEventListener("change", importBackup);
  }

  function updateNetworkStatus() {
    const badge = $("[data-offline-badge]");
    if (badge) badge.hidden = navigator.onLine;
  }

  function exportBackup() {
    const blob = new Blob([N.storage.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nourish-backup-${N.storage.getDayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Private Nourish backup downloaded.");
  }

  function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        N.storage.importData(JSON.parse(reader.result));
        applySettings();
        renderAll();
        showToast("Your Nourish backup has been restored.");
      } catch (error) {
        showToast(error.message || "That backup could not be imported.");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function resetData() {
    const confirmed = window.confirm("Erase all Nourish profile, meal, water, custom food, and Coach data from this device? This cannot be undone without a backup.");
    if (!confirmed) return;
    N.storage.reset();
    window.location.hash = "today";
    window.location.reload();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applySettings();
    setupOnboarding();
    bindEvents();
    if (N.camera) N.camera.init();
    updateNetworkStatus();
    if (N.storage.getState().profile) {
      renderAll();
      if (N.coach) N.coach.init();
      routeApp();
    } else if (N.coach) {
      N.coach.init();
    }
    if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
      navigator.serviceWorker.register("sw.js").then((registration) => {
        registration.update();
        if (N.reminders) N.reminders.init();
      }).catch(() => { if (N.reminders) N.reminders.init(); });
    } else if (N.reminders) N.reminders.init();
  });
}());
