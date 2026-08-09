(function () {
  "use strict";

  window.Nourish = window.Nourish || {};
  const N = window.Nourish;
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  let catalogLimit = 24;

  const typeLabels = { strength: "Weight lifting", calisthenics: "Calisthenics", yoga: "Yoga", pilates: "Pilates", cardio: "Cardio", hiit: "HIIT", mobility: "Mobility" };
  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function toast(message) { window.dispatchEvent(new CustomEvent("nourish:toast", { detail: { message } })); }
  function state() { return N.storage.getState().workout; }
  function allExercises() { return (N.exerciseCatalog || []).concat(state().customExercises || []); }
  function todayName() { return new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(); }
  function todaySchedule() { return state().schedule.find((item) => item.day === todayName()) || { day: todayName(), focus: "Full body", active: true }; }
  function currentPlan() { return state().plans.find((item) => item.date === N.storage.getDayKey()) || null; }

  function focusMuscles(focus) {
    const text = String(focus || "").toLowerCase();
    const muscles = [];
    const map = {
      chest: ["chest"], back: ["back"], biceps: ["biceps"], triceps: ["triceps"], shoulders: ["shoulders"],
      legs: ["legs", "quadriceps"], quads: ["quadriceps", "legs"], glutes: ["legs"], hamstrings: ["legs"], core: ["core"], abs: ["core"],
      yoga: ["full body"], cardio: ["full body"], mobility: ["full body"], "full body": ["full body", "legs", "back", "chest", "core"]
    };
    Object.entries(map).forEach(([keyword, values]) => { if (text.includes(keyword)) muscles.push(...values); });
    return [...new Set(muscles.length ? muscles : ["full body", "legs", "back", "chest", "core"])];
  }

  function prescription(exercise, workoutProfile) {
    let sets = exercise.sets;
    let reps = exercise.reps;
    let rest = exercise.rest;
    if (exercise.type === "strength" || exercise.type === "calisthenics") {
      if (workoutProfile.goal === "strength") { sets = workoutProfile.experience === "beginner" ? 4 : 5; reps = "3–6"; rest = 150; }
      if (workoutProfile.goal === "build-muscle") { sets = workoutProfile.experience === "beginner" ? 3 : 4; reps = "8–12"; rest = 75; }
      if (workoutProfile.goal === "fat-loss") { sets = 3; reps = "12–15"; rest = 45; }
    }
    if (["yoga", "mobility", "pilates"].includes(exercise.type)) { sets = workoutProfile.experience === "beginner" ? 2 : 3; reps = workoutProfile.goal === "flexibility" ? "45–60 sec" : exercise.reps; rest = 20; }
    return { exerciseId: exercise.id, sets, reps, rest, done: false };
  }

  function generatePlan() {
    const workout = state();
    const schedule = todaySchedule();
    const profile = workout.profile;
    const restDay = !schedule.active || /rest/i.test(schedule.focus);
    const selectedTypes = restDay ? ["mobility", "yoga"] : profile.types.length ? profile.types : ["strength"];
    const muscles = focusMuscles(schedule.focus);
    const desiredCount = Math.max(4, Math.min(10, Math.round(Number(profile.duration || 60) / 8)));
    let candidates = allExercises().filter((exercise) => selectedTypes.includes(exercise.type) && (muscles.includes(exercise.muscle) || exercise.muscle === "full body"));
    if (candidates.length < desiredCount) candidates = allExercises().filter((exercise) => selectedTypes.includes(exercise.type));
    const experienceRank = { beginner: 0, intermediate: 1, advanced: 2 };
    candidates.sort((a, b) => Math.abs(experienceRank[a.level] - experienceRank[profile.experience]) - Math.abs(experienceRank[b.level] - experienceRank[profile.experience]) || a.name.localeCompare(b.name));
    const equipmentSeen = new Set();
    const chosen = [];
    candidates.forEach((exercise) => {
      if (chosen.length >= desiredCount) return;
      const diversityKey = `${exercise.muscle}-${exercise.equipment}`;
      if (!equipmentSeen.has(diversityKey) || chosen.length >= Math.floor(desiredCount / 2)) { chosen.push(exercise); equipmentSeen.add(diversityKey); }
    });
    const exercises = chosen.map((exercise) => prescription(exercise, profile));
    N.storage.saveWorkoutPlan({ date: N.storage.getDayKey(), focus: restDay ? "Recovery & mobility" : schedule.focus, exercises, duration: profile.duration, completed: false });
    render();
    toast(restDay ? "A recovery session is ready." : `${schedule.focus} workout generated.`);
  }

  function exerciseById(id) { return allExercises().find((exercise) => exercise.id === id); }

  function motionProfile(exercise) {
    const name = exercise.name.toLowerCase();
    if (/squat|lunge|step-up|chair pose|wall sit/.test(name)) return "squat";
    if (/press|push-up|dip|fly/.test(name)) return "press";
    if (/row|pull-up|pulldown|curl|deadlift/.test(name)) return "pull";
    if (/plank|crunch|sit-up|boat pose/.test(name) || exercise.muscle === "core") return "core";
    if (["yoga", "mobility", "pilates"].includes(exercise.type)) return "flow";
    if (["cardio", "hiit"].includes(exercise.type)) return "cardio";
    return "lift";
  }

  function suggestedExercises() {
    const schedule = todaySchedule();
    const types = state().profile.types.length ? state().profile.types : ["strength"];
    const muscles = focusMuscles(schedule.focus);
    return allExercises().filter((exercise) => types.includes(exercise.type) && (muscles.includes(exercise.muscle) || exercise.muscle === "full body")).sort((a, b) => Number(b.level === state().profile.experience) - Number(a.level === state().profile.experience)).slice(0, 8);
  }

  function renderSuggestions() {
    const container = $("[data-workout-suggestions]"); if (!container) return;
    const schedule = todaySchedule();
    $("[data-suggestion-reason]").textContent = `${schedule.focus || "Full body"} · ${state().profile.experience} · ${state().profile.types.map((type) => typeLabels[type] || type).join(" + ")}`;
    container.innerHTML = suggestedExercises().map((exercise) => `<article><div class="exercise-motion-icon type-${escapeHtml(exercise.type)}" aria-hidden="true"><i></i><b></b></div><small>${escapeHtml(exercise.muscle)}</small><strong>${escapeHtml(exercise.name)}</strong><div><button type="button" data-exercise-details="${escapeHtml(exercise.id)}">See form</button><button type="button" data-add-workout-exercise="${escapeHtml(exercise.id)}">＋</button></div></article>`).join("");
  }

  function renderHero() {
    const schedule = todaySchedule();
    const plan = currentPlan();
    const weekly = state().logs.filter((log) => Date.now() - new Date(log.createdAt).getTime() < 7 * 86400000);
    $("[data-workout-today-focus]").textContent = plan ? plan.focus : schedule.active ? schedule.focus : "Recovery day";
    $("[data-workout-today-copy]").textContent = plan ? `${plan.exercises.length} movements · about ${plan.duration} minutes · ${state().profile.experience} level` : schedule.active ? "Generate a plan using today’s focus and your preferences." : "Rest, walk gently, or generate a short mobility flow.";
    $("[data-workout-week-count]").textContent = String(weekly.length);
    $("[data-workout-streak]").textContent = String(workoutWeekStreak());
    $("[data-exercise-total]").textContent = String(allExercises().length);
  }

  function workoutWeekStreak() {
    const weekKeys = new Set(state().logs.map((log) => {
      const date = new Date(log.createdAt); const first = new Date(date); first.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      return N.storage.getDayKey(first);
    }));
    let streak = 0; const cursor = new Date(); cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
    while (weekKeys.has(N.storage.getDayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 7); }
    return streak;
  }

  function renderPlan() {
    const container = $("[data-generated-workout]");
    if (!container) return;
    const plan = currentPlan();
    if (!plan || !plan.exercises.length) {
      container.innerHTML = '<div class="workout-empty"><span>◇</span><strong>No plan yet</strong><p>Save your schedule, then generate a session tailored to today.</p><button class="button button-primary" type="button" data-generate-workout>Generate workout</button></div>';
      return;
    }
    const completed = plan.exercises.filter((item) => item.done).length;
    container.innerHTML = `<div class="workout-progress"><span><strong>${completed}</strong> of ${plan.exercises.length} completed</span><i><b style="width:${Math.round(completed / plan.exercises.length * 100)}%"></b></i></div>${plan.exercises.map((item, index) => {
      const exercise = exerciseById(item.exerciseId); if (!exercise) return "";
      return `<article class="plan-exercise ${item.done ? "is-done" : ""}" data-plan-exercise="${escapeHtml(item.exerciseId)}"><button class="exercise-check" type="button" data-toggle-workout-exercise="${escapeHtml(item.exerciseId)}" aria-label="${item.done ? "Mark incomplete" : "Mark complete"}">${item.done ? "✓" : index + 1}</button><div class="exercise-motion-icon type-${escapeHtml(exercise.type)}" aria-hidden="true"><i></i><b></b></div><button class="plan-exercise-name" type="button" data-exercise-details="${escapeHtml(exercise.id)}"><small>${escapeHtml(typeLabels[exercise.type] || exercise.type)} · ${escapeHtml(exercise.muscle)}</small><strong>${escapeHtml(exercise.name)}</strong><span>${escapeHtml(exercise.equipment)}</span></button><label><span>Sets</span><input type="number" min="1" max="12" value="${item.sets}" data-plan-field="sets"></label><label><span>Reps / time</span><input value="${escapeHtml(item.reps)}" data-plan-field="reps"></label><label><span>Rest</span><input type="number" min="0" max="600" value="${item.rest}" data-plan-field="rest"><em>sec</em></label><button class="plan-remove" type="button" data-remove-workout-exercise="${escapeHtml(exercise.id)}" aria-label="Remove ${escapeHtml(exercise.name)}">×</button></article>`;
    }).join("")}<p class="workout-safety">Use loads you can control. Stop for sharp pain, dizziness or unusual shortness of breath, and seek professional guidance when needed.</p>`;
  }

  function renderSchedule() {
    const container = $("[data-weekly-schedule]"); if (!container) return;
    const schedule = state().schedule;
    container.innerHTML = dayOrder.map((day) => {
      const item = schedule.find((entry) => entry.day === day) || { day, focus: "Rest", active: false };
      return `<div class="schedule-row"><label class="schedule-toggle"><input type="checkbox" name="active-${day}" ${item.active ? "checked" : ""}><i></i><span>${day.slice(0, 3)}</span></label><input class="text-input" name="focus-${day}" value="${escapeHtml(item.focus)}" maxlength="50" aria-label="${day} workout focus" placeholder="e.g. Chest & triceps"></div>`;
    }).join("");
  }

  function renderProfile() {
    const form = $("[data-workout-profile-form]"); if (!form) return;
    const profile = state().profile;
    $$('[data-training-types] input').forEach((input) => { input.checked = profile.types.includes(input.value); });
    form.elements.goal.value = profile.goal; form.elements.experience.value = profile.experience; form.elements.duration.value = String(profile.duration);
  }

  function filteredExercises() {
    const query = String($("[data-exercise-search]").value || "").trim().toLowerCase();
    const type = $("[data-exercise-type]").value; const muscle = $("[data-exercise-muscle]").value;
    return allExercises().filter((exercise) => (!query || `${exercise.name} ${exercise.muscle} ${exercise.equipment} ${exercise.type}`.toLowerCase().includes(query)) && (type === "all" || exercise.type === type) && (muscle === "all" || exercise.muscle === muscle || (muscle === "legs" && exercise.muscle === "quadriceps")));
  }

  function renderCatalog() {
    const container = $("[data-exercise-grid]"); if (!container) return;
    const exercises = filteredExercises();
    $("[data-exercise-count]").textContent = `${exercises.length} exercises found`;
    container.innerHTML = exercises.slice(0, catalogLimit).map((exercise) => `<article class="exercise-card premium-tilt"><div class="exercise-card-top"><div class="exercise-motion-icon type-${escapeHtml(exercise.type)}" aria-hidden="true"><i></i><b></b></div><span>${escapeHtml(exercise.level)}</span></div><small>${escapeHtml(typeLabels[exercise.type] || exercise.type)} · ${escapeHtml(exercise.muscle)}</small><h3>${escapeHtml(exercise.name)}</h3><p>${escapeHtml(exercise.equipment)}</p><div><button type="button" data-exercise-details="${escapeHtml(exercise.id)}">View guide</button><button type="button" data-add-workout-exercise="${escapeHtml(exercise.id)}">+ Add</button></div></article>`).join("");
    $("[data-exercise-more]").hidden = exercises.length <= catalogLimit;
  }

  function openDetails(id) {
    const exercise = exerciseById(id); if (!exercise) return;
    const profile = state().profile; const plan = prescription(exercise, profile);
    $("[data-exercise-dialog-content]").innerHTML = `<div class="exercise-detail"><div class="exercise-detail-visual"><div class="exercise-figure-3d type-${escapeHtml(exercise.type)}"><span></span><i></i><b></b><em></em></div><small>Illustrative movement guide</small></div><div class="exercise-detail-copy"><span class="card-kicker">${escapeHtml(typeLabels[exercise.type] || exercise.type)}</span><h2>${escapeHtml(exercise.name)}</h2><div class="exercise-tags"><span>${escapeHtml(exercise.muscle)}</span><span>${escapeHtml(exercise.equipment)}</span><span>${escapeHtml(exercise.level)}</span></div><p>${escapeHtml(exercise.cue)}</p><div class="exercise-prescription"><div><strong>${plan.sets}</strong><small>sets</small></div><div><strong>${escapeHtml(plan.reps)}</strong><small>reps / time</small></div><div><strong>${plan.rest}s</strong><small>rest</small></div></div><ol><li>Set up the equipment and choose a manageable starting resistance.</li><li>Brace, breathe and complete each repetition without rushing.</li><li>End the set with one or two good repetitions still possible when learning.</li></ol><button class="button button-primary button-full" type="button" data-add-workout-exercise="${escapeHtml(exercise.id)}">Add to today’s plan</button></div></div>`;
    const demo = $(".exercise-figure-3d", $("[data-exercise-dialog-content]"));
    demo.classList.add(`motion-${motionProfile(exercise)}`); demo.dataset.formDemo = "";
    demo.insertAdjacentHTML("afterend", '<small>Looped form guide · slow and controlled</small><button class="demo-control" type="button" data-toggle-form-demo>Pause animation</button>');
    $("[data-exercise-dialog]").showModal();
  }

  function updatePlan(mutator) {
    const plan = currentPlan(); if (!plan) return toast("Generate a workout first.");
    const exercises = plan.exercises.map((item) => Object.assign({}, item)); mutator(exercises);
    N.storage.saveWorkoutPlan(Object.assign({}, plan, { exercises })); renderPlan(); renderHero();
  }

  function addExercise(id) {
    const exercise = exerciseById(id); if (!exercise) return;
    let plan = currentPlan();
    if (!plan) plan = N.storage.saveWorkoutPlan({ date: N.storage.getDayKey(), focus: todaySchedule().focus || "Custom workout", exercises: [], duration: state().profile.duration, completed: false });
    if (plan.exercises.some((item) => item.exerciseId === id)) return toast("That exercise is already in today’s plan.");
    const exercises = plan.exercises.concat(prescription(exercise, state().profile));
    N.storage.saveWorkoutPlan(Object.assign({}, plan, { exercises }));
    if ($("[data-exercise-dialog]").open) $("[data-exercise-dialog]").close();
    renderPlan(); renderHero(); toast(`${exercise.name} added to today’s plan.`);
  }

  function finishWorkout() {
    const plan = currentPlan(); if (!plan || !plan.exercises.length) return toast("Generate a workout first.");
    if (plan.completed) return toast("This workout is already complete.");
    const completed = plan.exercises.filter((item) => item.done).length;
    N.storage.addWorkoutLog({ focus: plan.focus, exerciseCount: plan.exercises.length, completedCount: completed || plan.exercises.length, duration: Number(plan.duration), planId: plan.id });
    N.storage.saveWorkoutPlan(Object.assign({}, plan, { completed: true, exercises: plan.exercises.map((item) => Object.assign({}, item, { done: true })) }));
    render(); toast("Workout completed. Strong work—recover well.");
  }

  function renderHistory() {
    const container = $("[data-workout-history]"); if (!container) return;
    const logs = state().logs.slice(-6).reverse();
    container.innerHTML = logs.length ? logs.map((log) => `<div class="workout-history-row"><span>◆</span><div><strong>${escapeHtml(log.focus)}</strong><small>${escapeHtml(log.date)} · ${log.completedCount} exercises · ${log.duration} min</small></div></div>`).join("") : '<div class="feature-empty compact">Completed workouts will appear here.</div>';
  }

  function render() { if (!$("[data-view='workout']")) return; renderHero(); renderPlan(); renderProfile(); renderSchedule(); renderCatalog(); renderSuggestions(); renderHistory(); }

  function bind() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-generate-workout]")) generatePlan();
      const details = event.target.closest("[data-exercise-details]"); if (details) openDetails(details.dataset.exerciseDetails);
      const add = event.target.closest("[data-add-workout-exercise]"); if (add) addExercise(add.dataset.addWorkoutExercise);
      const toggle = event.target.closest("[data-toggle-workout-exercise]"); if (toggle) updatePlan((items) => { const item = items.find((entry) => entry.exerciseId === toggle.dataset.toggleWorkoutExercise); if (item) item.done = !item.done; });
      const remove = event.target.closest("[data-remove-workout-exercise]"); if (remove) updatePlan((items) => { const index = items.findIndex((entry) => entry.exerciseId === remove.dataset.removeWorkoutExercise); if (index >= 0) items.splice(index, 1); });
      if (event.target.closest("[data-finish-workout]")) finishWorkout();
      const demoToggle = event.target.closest("[data-toggle-form-demo]"); if (demoToggle) { const demo = $("[data-form-demo]"); demo.classList.toggle("is-paused"); demoToggle.textContent = demo.classList.contains("is-paused") ? "Play animation" : "Pause animation"; }
      if (event.target.closest("[data-open-custom-exercise]")) $("[data-custom-exercise-dialog]").showModal();
      if (event.target.closest("[data-close-workout-dialog]")) event.target.closest("dialog").close();
      if (event.target.closest("[data-exercise-more]")) { catalogLimit += 24; renderCatalog(); }
      if (event.target.closest("[data-edit-workout-plan]")) { $("[data-exercise-search]").focus(); $("[data-exercise-search]").scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
    $("[data-exercise-search]").addEventListener("input", () => { catalogLimit = 24; renderCatalog(); });
    $("[data-exercise-type]").addEventListener("change", () => { catalogLimit = 24; renderCatalog(); });
    $("[data-exercise-muscle]").addEventListener("change", () => { catalogLimit = 24; renderCatalog(); });
    $("[data-generated-workout]").addEventListener("change", (event) => {
      const field = event.target.closest("[data-plan-field]"); if (!field) return;
      const card = field.closest("[data-plan-exercise]");
      updatePlan((items) => { const item = items.find((entry) => entry.exerciseId === card.dataset.planExercise); if (item) item[field.dataset.planField] = field.dataset.planField === "reps" ? field.value : Number(field.value); });
    });
    $("[data-workout-profile-form]").addEventListener("submit", (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const types = $$('[data-training-types] input:checked').map((input) => input.value); if (!types.length) return toast("Choose at least one training style.");
      N.storage.updateWorkoutProfile({ types, goal: values.goal, experience: values.experience, duration: Number(values.duration) }); render(); toast("Workout preferences saved.");
    });
    $("[data-workout-schedule-form]").addEventListener("submit", (event) => {
      event.preventDefault(); const form = event.currentTarget;
      const schedule = dayOrder.map((day) => ({ day, active: form.elements[`active-${day}`].checked, focus: String(form.elements[`focus-${day}`].value || "Rest").trim() }));
      N.storage.updateWorkoutSchedule(schedule); render(); toast("Weekly workout split saved.");
    });
    $("[data-custom-exercise-form]").addEventListener("submit", (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      N.storage.addCustomExercise({ name: String(values.name).trim(), type: values.type, muscle: String(values.muscle).trim().toLowerCase(), equipment: String(values.equipment || "none").trim(), level: state().profile.experience, sets: Number(values.sets) || 3, reps: String(values.reps || "8–12"), rest: 60, cue: String(values.cue || "Use controlled technique and a comfortable range of motion.").trim() });
      event.currentTarget.reset(); $("[data-custom-exercise-dialog]").close(); renderCatalog(); toast("Custom exercise added to your catalogue.");
    });
    window.addEventListener("nourish:state", () => { if (window.location.hash.includes("workout")) render(); });
  }

  document.addEventListener("DOMContentLoaded", () => { bind(); render(); });
  N.workout = { render, generatePlan };
}());
