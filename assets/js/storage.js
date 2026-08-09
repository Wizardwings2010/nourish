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
