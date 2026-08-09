(function () {
  "use strict";

  window.Nourish = window.Nourish || {};

  const nutrients = ["calories", "protein", "carbs", "fat", "fiber", "calcium", "iron", "potassium", "vitaminC"];

  function round(value, places) {
    const factor = Math.pow(10, places == null ? 1 : places);
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getFoods() {
    const custom = window.Nourish.storage ? window.Nourish.storage.getState().customFoods : [];
    return (window.Nourish.foods || []).concat(custom || []);
  }

  function getFood(foodId) {
    return getFoods().find((food) => food.id === foodId) || null;
  }

  function scaleFood(food, portion) {
    const multiplier = Math.max(0.1, Number(portion) || 1);
    const scaled = Object.assign({}, food);
    nutrients.forEach((key) => { scaled[key] = round((Number(food[key]) || 0) * multiplier, 1); });
    scaled.portion = multiplier;
    return scaled;
  }

  function calculateTargets(profile) {
    const weight = clamp(Number(profile.weight) || 70, 35, 250);
    const height = clamp(Number(profile.height) || 170, 120, 230);
    const age = clamp(Number(profile.age) || 30, 16, 100);
    const activity = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }[profile.activity] || 1.375;
    const sexOffset = profile.sex === "male" ? 5 : profile.sex === "female" ? -161 : -78;
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + sexOffset;
    const goalAdjustment = profile.goal === "lose" ? -300 : profile.goal === "gain" ? 250 : 0;
    const calories = Math.round(clamp((bmr * activity) + goalAdjustment, 1200, 4500) / 10) * 10;
    const proteinFactor = profile.goal === "gain" ? 1.7 : profile.goal === "lose" ? 1.6 : 1.4;
    return {
      calories,
      protein: Math.round(weight * proteinFactor),
      carbs: Math.round((calories * 0.45) / 4),
      fat: Math.round((calories * 0.3) / 9),
      fiber: profile.sex === "female" ? 25 : profile.sex === "male" ? 30 : 28,
      water: Math.round(clamp(weight * 35, 1800, 4500) / 50) * 50,
      calcium: 1000,
      iron: profile.sex === "female" ? 18 : profile.sex === "male" ? 8 : 12,
      potassium: 3500,
      vitaminC: 75
    };
  }

  function emptyTotals() {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, iron: 0, potassium: 0, vitaminC: 0, water: 0 };
  }

  function totalsForDay(dateKey) {
    const state = window.Nourish.storage.getState();
    const key = dateKey || window.Nourish.storage.getDayKey();
    const totals = emptyTotals();
    state.logs.filter((entry) => entry.date === key).forEach((entry) => {
      const food = getFood(entry.foodId);
      if (!food) return;
      const scaled = scaleFood(food, entry.portion);
      nutrients.forEach((nutrient) => { totals[nutrient] += scaled[nutrient] || 0; });
    });
    totals.water = state.waterLogs.filter((entry) => entry.date === key).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    Object.keys(totals).forEach((keyName) => { totals[keyName] = round(totals[keyName], 1); });
    return totals;
  }

  function percent(value, target) {
    return clamp(Math.round(((Number(value) || 0) / Math.max(1, Number(target) || 1)) * 100), 0, 999);
  }

  function compatibleWithProfile(food, profile) {
    const diet = profile.diet || "omnivore";
    if (diet === "vegan" && !(food.diets || []).includes("vegan")) return false;
    if (diet === "vegetarian" && !((food.diets || []).includes("vegetarian") || (food.diets || []).includes("vegan"))) return false;
    const allergies = String(profile.allergies || "").toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
    if ((food.allergens || []).some((allergen) => allergies.some((declared) => allergen.includes(declared) || declared.includes(allergen)))) return false;
    const dislikes = String(profile.dislikes || "").toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
    return !dislikes.some((dislike) => `${food.name} ${food.category} ${(food.tags || []).join(" ")}`.toLowerCase().includes(dislike));
  }

  function recommendationReason(food, gaps) {
    const benefits = [];
    if (gaps.protein > 8 && food.protein >= 10) benefits.push(`${round(food.protein, 0)}g protein`);
    if (gaps.fiber > 4 && food.fiber >= 3) benefits.push(`${round(food.fiber, 0)}g fibre`);
    if (gaps.potassium > 500 && food.potassium >= 300) benefits.push("potassium");
    if (gaps.vitaminC > 20 && food.vitaminC >= 20) benefits.push("vitamin C");
    if (!benefits.length) benefits.push("balanced energy");
    const joined = benefits.length === 1 ? benefits[0] : `${benefits.slice(0, -1).join(", ")} and ${benefits[benefits.length - 1]}`;
    return `Adds ${joined} while fitting the shape of your remaining day.`;
  }

  function recommendations(dateKey, limit) {
    const state = window.Nourish.storage.getState();
    const key = dateKey || window.Nourish.storage.getDayKey();
    const profile = state.profile || { targets: calculateTargets({}) };
    const targets = profile.targets || calculateTargets(profile);
    const totals = totalsForDay(key);
    const foodsLoggedToday = new Set(state.logs.filter((entry) => entry.date === key).map((entry) => entry.foodId));
    const gaps = {
      calories: Math.max(0, targets.calories - totals.calories),
      protein: Math.max(0, targets.protein - totals.protein),
      fiber: Math.max(0, targets.fiber - totals.fiber),
      potassium: Math.max(0, (targets.potassium || 3500) - totals.potassium),
      vitaminC: Math.max(0, (targets.vitaminC || 75) - totals.vitaminC)
    };

    return getFoods().filter((food) => compatibleWithProfile(food, profile) && !foodsLoggedToday.has(food.id)).map((food) => {
      const calorieFit = gaps.calories > 0 ? 1 - Math.min(1, Math.abs(gaps.calories * 0.3 - food.calories) / Math.max(300, gaps.calories)) : 0;
      let score = calorieFit * 2;
      score += Math.min(4, (food.protein / Math.max(8, gaps.protein)) * 4);
      score += Math.min(3, (food.fiber / Math.max(4, gaps.fiber)) * 3);
      score += Math.min(1, (food.potassium / Math.max(400, gaps.potassium)));
      score += Math.min(1, (food.vitaminC / Math.max(20, gaps.vitaminC)));
      if (gaps.calories > 0 && food.calories > gaps.calories * 1.25) score -= 4;
      if (gaps.calories < 200 && food.calories > 250) score -= 3;
      return { food, score, reason: recommendationReason(food, gaps), gaps };
    }).sort((a, b) => b.score - a.score).slice(0, limit || 5);
  }

  function daysBack(count) {
    const result = [];
    for (let index = count - 1; index >= 0; index -= 1) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - index);
      result.push({ date, key: window.Nourish.storage.getDayKey(date) });
    }
    return result;
  }

  function currentStreak() {
    const state = window.Nourish.storage.getState();
    const loggedDays = new Set(state.logs.map((entry) => entry.date).concat(state.waterLogs.map((entry) => entry.date)));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!loggedDays.has(window.Nourish.storage.getDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (loggedDays.has(window.Nourish.storage.getDayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function daySummary(dateKey) {
    const state = window.Nourish.storage.getState();
    const profile = state.profile || {};
    const targets = profile.targets || calculateTargets(profile);
    const totals = totalsForDay(dateKey);
    return {
      date: dateKey || window.Nourish.storage.getDayKey(),
      goal: profile.goal || "maintain",
      diet: profile.diet || "omnivore",
      allergens: profile.allergies || "none declared",
      preferences: { dislikes: profile.dislikes || "none", mealTimes: profile.mealTimes || "not set", cookTime: profile.cookTime || "quick", budget: profile.budget || "balanced" },
      totals,
      targets,
      remaining: {
        calories: Math.max(0, round(targets.calories - totals.calories, 0)),
        protein: Math.max(0, round(targets.protein - totals.protein, 1)),
        fiber: Math.max(0, round(targets.fiber - totals.fiber, 1)),
        water: Math.max(0, round(targets.water - totals.water, 0))
      },
      topSuggestions: recommendations(dateKey, 3).map((item) => ({ name: item.food.name, serving: item.food.servingLabel, reason: item.reason }))
    };
  }

  window.Nourish.nutrition = { round, clamp, getFoods, getFood, scaleFood, calculateTargets, totalsForDay, percent, recommendations, compatibleWithProfile, daysBack, currentStreak, daySummary };
}());
