(function () {
  "use strict";

  window.Nourish = window.Nourish || {};
  const STORAGE_KEY = "nourish-state-v1";
  const STATE_VERSION = 1;

  function uid(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return `${prefix}-${window.crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function localDayKey(date) {
    const value = date instanceof Date ? date : new Date(date || Date.now());
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function freshState() {
    return {
      version: STATE_VERSION,
      profile: null,
      logs: [],
      waterLogs: [],
      customFoods: [],
      favoriteFoodIds: [],
      mealTemplates: [],
      dailyPlans: [],
      shoppingList: [],
      weightLogs: [],
      measurementLogs: [],
      progressPhotos: [],
      workout: {
        profile: { types: ["strength"], goal: "build-muscle", experience: "beginner", duration: 60 },
        schedule: [
          { day: "monday", focus: "Chest & triceps", active: true }, { day: "tuesday", focus: "Back & biceps", active: true },
          { day: "wednesday", focus: "Rest / mobility", active: false }, { day: "thursday", focus: "Legs", active: true },
          { day: "friday", focus: "Shoulders & core", active: true }, { day: "saturday", focus: "Yoga or cardio", active: true },
          { day: "sunday", focus: "Rest", active: false }
        ],
        plans: [], logs: [], customExercises: []
      },
      coachMessages: [],
      settings: {
        theme: "system",
        reduceMotion: false,
        hydrationReminder: { enabled: false, intervalMinutes: 60, startTime: "08:00", endTime: "22:00", amount: 250, sound: true, vibration: true, lastReminderAt: null, nextReminderAt: null }
      },
      meta: { createdAt: new Date().toISOString(), lastOpenedAt: new Date().toISOString() }
    };
  }

  function sanitizeState(candidate) {
    const clean = freshState();
    if (!candidate || typeof candidate !== "object") return clean;
    clean.profile = candidate.profile && typeof candidate.profile === "object" ? candidate.profile : null;
    clean.logs = Array.isArray(candidate.logs) ? candidate.logs.filter((item) => item && item.id && item.foodId && item.date) : [];
    clean.waterLogs = Array.isArray(candidate.waterLogs) ? candidate.waterLogs.filter((item) => item && item.id && item.date && Number(item.amount) > 0) : [];
    clean.customFoods = Array.isArray(candidate.customFoods) ? candidate.customFoods.filter((item) => item && item.id && item.name) : [];
    clean.favoriteFoodIds = Array.isArray(candidate.favoriteFoodIds) ? candidate.favoriteFoodIds.filter((item) => typeof item === "string").slice(0, 500) : [];
    clean.mealTemplates = Array.isArray(candidate.mealTemplates) ? candidate.mealTemplates.filter((item) => item && item.id && item.name && Array.isArray(item.items)).slice(0, 100) : [];
    clean.dailyPlans = Array.isArray(candidate.dailyPlans) ? candidate.dailyPlans.filter((item) => item && item.date && Array.isArray(item.items)).slice(-14) : [];
    clean.shoppingList = Array.isArray(candidate.shoppingList) ? candidate.shoppingList.filter((item) => item && item.id && item.name).slice(0, 300) : [];
    clean.weightLogs = Array.isArray(candidate.weightLogs) ? candidate.weightLogs.filter((item) => item && item.id && Number(item.weight) > 0).slice(-365) : [];
    clean.measurementLogs = Array.isArray(candidate.measurementLogs) ? candidate.measurementLogs.filter((item) => item && item.id).slice(-365) : [];
    clean.progressPhotos = Array.isArray(candidate.progressPhotos) ? candidate.progressPhotos.filter((item) => item && item.id && item.dataUrl).slice(-12) : [];
    const workout = candidate.workout && typeof candidate.workout === "object" ? candidate.workout : {};
    clean.workout.profile = Object.assign({}, clean.workout.profile, workout.profile || {});
    clean.workout.profile.types = Array.isArray(clean.workout.profile.types) ? clean.workout.profile.types.slice(0, 8) : ["strength"];
    clean.workout.schedule = Array.isArray(workout.schedule) && workout.schedule.length ? workout.schedule.filter((item) => item && item.day).slice(0, 7) : clean.workout.schedule;
    clean.workout.plans = Array.isArray(workout.plans) ? workout.plans.filter((item) => item && item.id && Array.isArray(item.exercises)).slice(-30) : [];
    clean.workout.logs = Array.isArray(workout.logs) ? workout.logs.filter((item) => item && item.id && item.date).slice(-365) : [];
    clean.workout.customExercises = Array.isArray(workout.customExercises) ? workout.customExercises.filter((item) => item && item.id && item.name).slice(0, 200) : [];
    clean.coachMessages = Array.isArray(candidate.coachMessages) ? candidate.coachMessages.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-30) : [];
    clean.settings = Object.assign(clean.settings, candidate.settings || {});
    clean.settings.hydrationReminder = Object.assign(freshState().settings.hydrationReminder, candidate.settings && candidate.settings.hydrationReminder || {});
    clean.meta = Object.assign(clean.meta, candidate.meta || {}, { lastOpenedAt: new Date().toISOString() });
    return clean;
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? sanitizeState(JSON.parse(raw)) : freshState();
    } catch (error) {
      return freshState();
    }
  }

  let state = load();

  function save() {
    state.meta.lastOpenedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("nourish:state", { detail: state }));
    return state;
  }

  const storage = {
    getState: () => state,
    getDayKey: localDayKey,
    setProfile(profile) {
      state.profile = Object.assign({}, profile, { updatedAt: new Date().toISOString() });
      return save();
    },
    addLog(foodId, portion, meal) {
      const now = new Date();
      state.logs.push({ id: uid("meal"), foodId, portion: Number(portion) || 1, meal: meal || "snack", date: localDayKey(now), createdAt: now.toISOString() });
      return save();
    },
    removeLog(id) {
      state.logs = state.logs.filter((item) => item.id !== id);
      return save();
    },
    addWater(amount) {
      const now = new Date();
      state.waterLogs.push({ id: uid("water"), amount: Math.max(1, Number(amount) || 250), date: localDayKey(now), createdAt: now.toISOString() });
      return save();
    },
    undoWater(dateKey) {
      const key = dateKey || localDayKey();
      const index = [...state.waterLogs].map((item) => item.date).lastIndexOf(key);
      if (index >= 0) state.waterLogs.splice(index, 1);
      return save();
    },
    addCustomFood(food) {
      const record = Object.assign({
        id: uid("custom"), emoji: "🍽️", category: "custom", diets: ["omnivore", "vegetarian", "vegan"], allergens: [], calcium: 0, iron: 0, potassium: 0, vitaminC: 0, tags: ["custom"]
      }, food, { custom: true, createdAt: new Date().toISOString() });
      state.customFoods.push(record);
      save();
      return record;
    },
    toggleFavoriteFood(foodId) {
      const id = String(foodId || "");
      if (!id) return save();
      state.favoriteFoodIds = state.favoriteFoodIds.includes(id) ? state.favoriteFoodIds.filter((item) => item !== id) : state.favoriteFoodIds.concat(id);
      return save();
    },
    addMealTemplate(template) {
      state.mealTemplates.push(Object.assign({ id: uid("template"), createdAt: new Date().toISOString() }, template));
      return save();
    },
    removeMealTemplate(id) {
      state.mealTemplates = state.mealTemplates.filter((item) => item.id !== id);
      return save();
    },
    setDailyPlan(plan) {
      state.dailyPlans = state.dailyPlans.filter((item) => item.date !== plan.date).concat(Object.assign({}, plan, { createdAt: new Date().toISOString() })).slice(-14);
      return save();
    },
    setShoppingList(items) {
      state.shoppingList = (items || []).slice(0, 300);
      return save();
    },
    addShoppingItem(name, category) {
      state.shoppingList.push({ id: uid("shop"), name: String(name).trim(), category: category || "Pantry", checked: false });
      return save();
    },
    toggleShoppingItem(id) {
      state.shoppingList = state.shoppingList.map((item) => item.id === id ? Object.assign({}, item, { checked: !item.checked }) : item);
      return save();
    },
    removeShoppingItem(id) {
      state.shoppingList = state.shoppingList.filter((item) => item.id !== id);
      return save();
    },
    addWeight(weight) {
      state.weightLogs.push({ id: uid("weight"), weight: Number(weight), date: localDayKey(), createdAt: new Date().toISOString() });
      state.weightLogs = state.weightLogs.slice(-365);
      return save();
    },
    addMeasurements(values) {
      state.measurementLogs.push(Object.assign({ id: uid("measure"), date: localDayKey(), createdAt: new Date().toISOString() }, values));
      state.measurementLogs = state.measurementLogs.slice(-365);
      return save();
    },
    addProgressPhoto(dataUrl) {
      const previous = state.progressPhotos.slice();
      state.progressPhotos = previous.concat({ id: uid("photo"), dataUrl, date: localDayKey(), createdAt: new Date().toISOString() }).slice(-12);
      try { return save(); } catch (error) { state.progressPhotos = previous; throw error; }
    },
    removeProgressPhoto(id) {
      state.progressPhotos = state.progressPhotos.filter((item) => item.id !== id);
      return save();
    },
    updateWorkoutProfile(profile) {
      state.workout.profile = Object.assign({}, state.workout.profile, profile);
      return save();
    },
    updateWorkoutSchedule(schedule) {
      state.workout.schedule = (schedule || []).slice(0, 7);
      return save();
    },
    saveWorkoutPlan(plan) {
      const record = Object.assign({ id: uid("workout-plan"), createdAt: new Date().toISOString() }, plan);
      state.workout.plans = state.workout.plans.filter((item) => item.date !== record.date).concat(record).slice(-30);
      save();
      return record;
    },
    addWorkoutLog(log) {
      const record = Object.assign({ id: uid("workout"), date: localDayKey(), createdAt: new Date().toISOString() }, log);
      state.workout.logs.push(record);
      state.workout.logs = state.workout.logs.slice(-365);
      save();
      return record;
    },
    addCustomExercise(exercise) {
      const record = Object.assign({ id: uid("exercise"), custom: true, createdAt: new Date().toISOString() }, exercise);
      state.workout.customExercises.push(record);
      save();
      return record;
    },
    addCoachMessage(role, content, source) {
      state.coachMessages.push({ id: uid("chat"), role, content: String(content).slice(0, 4000), source: source || "local", createdAt: new Date().toISOString() });
      state.coachMessages = state.coachMessages.slice(-30);
      return save();
    },
    clearCoach() {
      state.coachMessages = [];
      return save();
    },
    updateSettings(settings) {
      state.settings = Object.assign({}, state.settings, settings);
      return save();
    },
    updateHydrationReminder(reminder) {
      state.settings.hydrationReminder = Object.assign({}, state.settings.hydrationReminder, reminder);
      return save();
    },
    exportData() {
      return JSON.stringify(Object.assign({}, state, { exportedAt: new Date().toISOString() }), null, 2);
    },
    importData(candidate) {
      const imported = sanitizeState(candidate);
      if (!imported.profile) throw new Error("This backup does not contain a Nourish profile.");
      state = imported;
      save();
      return state;
    },
    reset() {
      state = freshState();
      window.localStorage.removeItem(STORAGE_KEY);
      save();
      return state;
    }
  };

  window.Nourish.storage = storage;
}());
