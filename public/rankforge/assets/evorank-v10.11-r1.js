/* EvoRank 10.11 — account continuity, birthday profile, workout reliability
   and exercise/rank clarity. Legacy storage keys intentionally stay intact. */
(function installEvoRank111(AppClass) {
  "use strict";
  if (!AppClass || AppClass.prototype.__evorank111Installed) return;

  const VERSION = "10.11";
  const BUILD = "1110-r1";
  const BIRTHDAY_COINS = 20;
  const proto = AppClass.prototype;
  proto.__evorank111Installed = true;

  const previous = {
    init: proto.init,
    render: proto.render,
    renderProfile: proto.renderProfile,
    renderModal: proto.renderModal,
    renderV7Onboarding: proto.renderV7Onboarding,
    renderV77Personalization: proto.renderV77Personalization,
    renderV7CustomExercise: proto.renderV7CustomExercise,
    renderV7ExerciseInfo: proto.renderV7ExerciseInfo,
    renderWorkoutExercise: proto.renderWorkoutExercise,
    handleSubmit: proto.handleSubmit,
    handleChange: proto.handleChange,
    tick: proto.tick
  };

  const esc = value => typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "").replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
  const attr = value => typeof escapeAttr === "function" ? escapeAttr(String(value ?? "")) : esc(value);

  function ageFromBirthDate(value, today = new Date()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    const date = new Date(year, month - 1, day, 12);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > today) return null;
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
    return age >= 0 && age <= 120 ? age : null;
  }

  function birthDateFromForm(form) {
    const data = new FormData(form);
    const day = String(data.get("birthDay") || "").padStart(2, "0");
    const month = String(data.get("birthMonth") || "").padStart(2, "0");
    const year = String(data.get("birthYear") || "");
    return /^\d{4}$/.test(year) && day !== "00" && month !== "00" ? `${year}-${month}-${day}` : "";
  }

  function birthFields(value = "") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    const selectedYear = Number(match?.[1] || 0), selectedMonth = Number(match?.[2] || 0), selectedDay = Number(match?.[3] || 0);
    const currentYear = new Date().getFullYear();
    const options = (from, to, selected, label) => `<option value="">${label}</option>${Array.from({length:to-from+1}, (_, index) => from + index).map(number => `<option value="${number}" ${number === selected ? "selected" : ""}>${number}</option>`).join("")}`;
    const age = ageFromBirthDate(value);
    return `<fieldset class="rf111-birthday"><legend>Geburtsdatum</legend><p>Tag, Monat und Jahr werden am Handy als Drehrad geöffnet. EvoRank berechnet daraus dein Alter und kann dir zum Geburtstag gratulieren.</p><div><label><span>Tag</span><select name="birthDay" required>${options(1,31,selectedDay,"Tag")}</select></label><label><span>Monat</span><select name="birthMonth" required>${options(1,12,selectedMonth,"Monat")}</select></label><label><span>Jahr</span><select name="birthYear" required><option value="">Jahr</option>${Array.from({length:currentYear-1899}, (_, index) => currentYear-index).map(number => `<option value="${number}" ${number === selectedYear ? "selected" : ""}>${number}</option>`).join("")}</select></label></div><small data-birth-age>${age == null ? "Bitte vollständig auswählen" : `${age} Jahre`}</small></fieldset>`;
  }

  function injectBirthFields(html, value) {
    if (typeof html !== "string" || html.includes("rf111-birthday")) return html;
    return html.replace(/(<div class="v7-field-grid"><label class="modal-field"><span>Körpergewicht<\/span>)/, `${birthFields(value)}$1`);
  }

  function prepareInitialForm(app, form) {
    if (!form || form.querySelector(".rf111-birthday")) return;
    const weightGrid = form.querySelector('input[name="bodyweight"]')?.closest(".v7-field-grid");
    weightGrid?.insertAdjacentHTML("beforebegin", birthFields(app.state?.profile?.birthDate || ""));
    const weight = form.querySelector('input[name="bodyweight"]');
    if (weight && !app.state?.onboardingComplete) {
      weight.value = "";
      weight.required = true;
      weight.placeholder = "z. B. 75";
    }
  }

  async function accountRpc(name, args = {}) {
    const config = window.RANKFORGE_CLOUD || {};
    const url = String(config.supabaseUrl || "").replace(/\/+$/, "");
    const key = String(config.supabasePublishableKey || "");
    const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
    if (!url || !key || !token || navigator.onLine === false) return null;
    const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method:"POST",
      headers:{apikey:key,authorization:`Bearer ${token}`,"content-type":"application/json"},
      body:JSON.stringify(args)
    });
    if (!response.ok) return null;
    return response.json().catch(() => null);
  }

  async function syncBirthday(app, { claim = true } = {}) {
    const birthDate = String(app.state?.profile?.birthDate || "");
    if (ageFromBirthDate(birthDate) == null) return;
    await accountRpc("evorank_profile_birth_date", { p_birth_date:birthDate });
    if (!claim) return;
    const today = new Date();
    const [, month, day] = birthDate.split("-").map(Number);
    if (today.getMonth() + 1 !== month || today.getDate() !== day) return;
    const result = await accountRpc("evorank_birthday_claim");
    const payload = Array.isArray(result) ? result[0] : result;
    const granted = Math.max(0, Number(payload?.coins || payload?.grantedCoins || 0));
    if (!payload?.granted || granted <= 0) return;
    app.state.profile.eggs = Math.max(0, Number(app.state.profile.eggs || 0)) + granted;
    app.state.notifications ||= [];
    app.state.notifications.unshift({id:`birthday-${today.getFullYear()}`,type:"gift",title:"Alles Gute zum Geburtstag! 🎉",body:`EvoRank schenkt dir ${granted} Coins.`,createdAt:new Date().toISOString(),read:false,data:{}});
    app.state.notifications = app.state.notifications.slice(0, 120);
    app.scheduleSave?.();
    app.render?.();
    app.showToast?.(`Alles Gute! +${granted} Coins`);
  }

  function addSecondary(exercise, muscles) {
    const next = new Set(Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : []);
    muscles.filter(muscle => muscle && muscle !== exercise.muscle).forEach(muscle => next.add(muscle));
    exercise.secondaryMuscles = [...next].slice(0, 6);
  }

  function addAliases(exercise, aliases) {
    const next = new Set(Array.isArray(exercise.aliases) ? exercise.aliases : []);
    aliases.filter(Boolean).forEach(alias => next.add(alias));
    exercise.aliases = [...next].slice(0, 12);
    exercise.searchText = `${exercise.name} ${exercise.muscle} ${exercise.equipment || ""} ${exercise.aliases.join(" ")}`.toLocaleLowerCase("de");
  }

  function applyExerciseTaxonomy() {
    const latGroup = (typeof MUSCLE_GROUPS !== "undefined" ? MUSCLE_GROUPS : []).find(group => group.key === "lats");
    if (latGroup) latGroup.name = "Latissimus";
    (typeof EXERCISES !== "undefined" ? EXERCISES : []).forEach(exercise => {
      const name = String(exercise.name || "").toLocaleLowerCase("de");
      if (/leg.?curl|beinbeug/.test(name)) exercise.secondaryMuscles=(exercise.secondaryMuscles||[]).filter(muscle=>!['Bizeps','Unterarme'].includes(muscle));
      if (/beinheben|leg.?raise/.test(name)&&/dip.station/.test(name+' '+exercise.equipment)) exercise.secondaryMuscles=(exercise.secondaryMuscles||[]).filter(muscle=>!['Bizeps','Trizeps','Brust','Schultern'].includes(muscle));
      if (/rudern|\brow\b/.test(name)) {
        addSecondary(exercise, ["Lat", "Oberer Rücken", "Bizeps"]);
        addAliases(exercise, ["Row", /einarm/.test(name) ? "One Arm Row" : "Rudern"]);
      }
      if (/lat.?zug|latziehen|klimmzug|pull.?up|chin.?up/.test(name)) {
        addSecondary(exercise, ["Lat", "Oberer Rücken", "Bizeps"]);
        addAliases(exercise, ["Lat Pulldown", "Pull-up", "Klimmzug"]);
      }
      if (/bankdrücken|chest press|brustpresse/.test(name)) {
        addSecondary(exercise, ["Brust", "Trizeps", "Schultern"]);
        addAliases(exercise, ["Bench Press", "Chest Press"]);
      }
      if (/schulterdrücken|shoulder press|overhead press/.test(name)) {
        addSecondary(exercise, ["Schultern", "Trizeps"]);
        addAliases(exercise, ["Shoulder Press", "Overhead Press", "OHP"]);
      }
      if (/kniebeuge|squat|beinpresse|leg press|ausfallschritt|lunge/.test(name)) addSecondary(exercise, ["Quadrizeps", "Gesäß", "Adduktoren"]);
      if (/kreuzheben|deadlift|rumän|romanian|rdl/.test(name)) addSecondary(exercise, ["Beinbeuger", "Gesäß", "Unterer Rücken", "Oberer Rücken"]);
      if (/hip thrust|glute bridge|beckenheben/.test(name)) addSecondary(exercise, ["Gesäß", "Beinbeuger"]);
      if (/curl/.test(name) && exercise.muscle === 'Bizeps') addSecondary(exercise, ["Unterarme"]);
      if (/trizeps|pushdown|\bdips?\b/.test(name) && !/beinheben|leg.?raise|dip.station/.test(name)) addSecondary(exercise, ["Trizeps", "Brust", "Schultern"]);
    });
  }

  applyExerciseTaxonomy();

  if (typeof getMuscleStatuses === "function") {
    getMuscleStatuses = function(exerciseRanks) {
      return Object.fromEntries(MUSCLE_GROUPS.map(group => {
        const matching = [];
        (exerciseRanks || []).forEach(item => {
          const exercise = (typeof exerciseIndex !== "undefined" ? exerciseIndex.get(item.exerciseId) : null) || item.exercise || {};
          const primary = group.muscles.includes(item.muscle || exercise.muscle);
          const secondary = (exercise.secondaryMuscles || []).some(muscle => group.muscles.includes(muscle));
          if (primary || secondary) matching.push({...item,score:Math.round(Number(item.score || 0) * (primary ? 1 : .58)),contribution:primary ? "primary" : "secondary"});
        });
        matching.sort((a,b) => b.score-a.score);
        const scores = matching.slice(0,4).map(item => item.score);
        // X4.5: the best contribution anchors the muscle rank. Up to three
        // supporting records share 30%; with only one record it counts fully.
        // Scores already include set-specific effective load and primary/secondary weighting.
        const support = scores.slice(1);
        const weights = support.map((_, index) => 1 / (index + 1) ** .25);
        const supportScore = support.length ? support.reduce((total,value,index) => total + value * weights[index],0) / weights.reduce((total,value) => total + value,0) : 0;
        const score = scores.length ? Math.round(support.length ? scores[0] * .7 + supportScore * .3 : scores[0]) : 0;
        return [group.key,{group,score,rank:rankFromScore(score),exerciseCount:matching.length,best:matching[0] || null,exercises:matching,aggregation:'best70-support30',bestWeight:support.length ? .7 : 1}];
      }));
    };
  }

  function clearerProductionEntry() {
    return `<section class="rf110-entry rf111-safety-entry"><button type="button" data-action="rf110-open-production"><span aria-hidden="true">${typeof icon === "function" ? icon("shield",24) : "✓"}</span><div><small>DATENSCHUTZ · CLOUD · HILFE</small><strong>Sicherheit, Cloud & Support</strong><p>Hier steuerst du Freigaben, sicherst deine Daten und erstellst bei Problemen ein Supportpaket.</p></div><i>›</i></button></section>`;
  }

  function enhanceRenderedUi(app) {
    document.querySelectorAll(".rf77-picker-row").forEach(row => {
      const id = row.querySelector("[data-exercise-id]")?.dataset.exerciseId;
      const exercise = id && (typeof lookupExercise === "function" ? lookupExercise(app.state,id) : null);
      const alias = row.querySelector(".v7-picker-row__copy em");
      if (alias && exercise?.aliases?.length) alias.textContent = `Auch bekannt als: ${exercise.aliases.slice(0,3).join(", ")}`;
    });
    document.querySelectorAll(".live-duration").forEach(element => element.setAttribute("aria-live", "off"));
  }

  proto.renderV7Onboarding = function(...args) {
    const result = previous.renderV7Onboarding.apply(this,args);
    prepareInitialForm(this, document.querySelector('form[data-form="v77-personalization"]'));
    return result;
  };

  proto.renderV77Personalization = function(...args) {
    return injectBirthFields(previous.renderV77Personalization.apply(this,args), this.state?.profile?.birthDate || "");
  };

  proto.renderV7CustomExercise = function(modal = {}) {
    let html = previous.renderV7CustomExercise.call(this,modal);
    const editing = modal.editId ? this.state.customExercises?.find(item => item.id === modal.editId) : null;
    const field = `<label class="modal-field rf111-alias-field"><span>Auch bekannt als (optional)</span><input name="aliases" maxlength="240" value="${attr((editing?.aliases || []).join(", "))}" placeholder="z. B. One Arm Row, Kurzhantelrudern"><small>Mehrere Namen mit Komma trennen. Sie werden bei der Suche berücksichtigt.</small></label>`;
    return html.includes("rf111-alias-field") ? html : html.replace(/(<label class="modal-field"><span>Tracking<\/span>)/, `${field}$1`);
  };

  proto.renderV7ExerciseInfo = function(modal) {
    let html = previous.renderV7ExerciseInfo.call(this,modal);
    const exercise = typeof lookupExercise === "function" ? lookupExercise(this.state,modal.exerciseId) : null;
    if (!exercise?.aliases?.length) return html;
    const aliases = `<p class="rf111-aliases"><strong>Auch bekannt als:</strong> ${esc(exercise.aliases.join(", "))}</p>`;
    return html.replace(/(<div class="rf77-detail-preview">[\s\S]*?<\/div>\s*<\/div>)/, `$1${aliases}`);
  };

  proto.renderWorkoutExercise = function(exercise,...args) {
    let html = previous.renderWorkoutExercise.call(this,exercise,...args);
    if (html.includes("rf111-exercise-replace")) return html;
    const button = `<button class="rf111-exercise-replace" data-action="v7-exercise-replace" data-exercise-id="${attr(exercise.id)}" aria-label="Übung ersetzen">${typeof icon === "function" ? icon("refresh",17) : "↻"}<span>Ersetzen</span></button>`;
    return html.replace(/(<button class="icon-button icon-button--ghost" data-action="workout-exercise-menu")/, `${button}$1`);
  };

  proto.renderProfile = function(...args) {
    let html = previous.renderProfile.apply(this,args);
    html = html.replace(/<section class="rf110-entry">[\s\S]*?<\/section>/, clearerProductionEntry());
    return html;
  };

  proto.renderModal = function(...args) {
    let html = previous.renderModal.apply(this,args);
    if (this.ui?.modal?.type === "rf110-production") {
      html = html.replace(/Produktionscenter/g,"Sicherheit, Cloud & Support")
        .replace("Alle vier Bereiche sind unabhängig.","Hier siehst du auf einen Blick, welche Daten EvoRank speichert oder überträgt. Alle vier Bereiche sind unabhängig.");
    }
    return html;
  };

  proto.handleChange = function(event,...args) {
    if (event.target?.name && ["birthDay","birthMonth","birthYear"].includes(event.target.name)) {
      const form = event.target.closest("form");
      const age = ageFromBirthDate(birthDateFromForm(form));
      const output = form?.querySelector("[data-birth-age]");
      if (output) output.textContent = age == null ? "Bitte vollständig und gültig auswählen" : `${age} Jahre`;
      return;
    }
    return previous.handleChange.call(this,event,...args);
  };

  proto.handleSubmit = async function(event,...args) {
    const form = event.target?.closest?.("form") || event.target;
    const type = form?.dataset?.form || "";
    let birthDate = "", aliases = "", editId = "", customName = "";
    if (type === "v77-personalization") {
      birthDate = birthDateFromForm(form);
      const age = ageFromBirthDate(birthDate);
      if (age == null) { event.preventDefault(); this.showToast("Bitte ein gültiges Geburtsdatum auswählen"); return; }
      const weight = String(new FormData(form).get("bodyweight") || "").trim();
      if (!weight || Number(weight) <= 0) { event.preventDefault(); this.showToast("Bitte dein Körpergewicht eintragen"); return; }
      this.state.profile.birthDate = birthDate;
      this.state.profile.age = age;
    }
    if (type === "v7-custom-exercise") {
      const data = new FormData(form);
      aliases = String(data.get("aliases") || "");
      editId = String(form.dataset.editId || "");
      customName = String(data.get("name") || "").trim();
    }
    const result = await previous.handleSubmit.call(this,event,...args);
    if (birthDate) syncBirthday(this).catch(() => {});
    if (type === "v7-custom-exercise" && aliases) {
      const saved = editId ? this.state.customExercises?.find(item => item.id === editId) : [...(this.state.customExercises || [])].reverse().find(item => item.name === customName);
      if (saved) {
        saved.aliases = [...new Set(aliases.split(",").map(value => value.trim()).filter(Boolean))].slice(0,12);
        saved.searchText = `${saved.name} ${saved.muscle} ${saved.equipment || ""} ${saved.aliases.join(" ")}`.toLocaleLowerCase("de");
        saved.updatedAt = new Date().toISOString();
        this.scheduleSave?.(); this.render?.();
      }
    }
    return result;
  };

  proto.tick = function(...args) {
    const result = previous.tick.apply(this,args);
    const started = new Date(this.state?.draft?.startedAt || 0).getTime();
    if (started > 0) {
      const value = formatDuration(Math.max(0,(Date.now()-started)/1000));
      document.querySelectorAll(".live-duration").forEach(element => { element.textContent = value; });
    }
    if (this.ui?.restTimer) {
      const remaining = this.ui.restTimer.pausedRemaining ?? Math.max(0,Math.ceil((this.ui.restTimer.endsAt-Date.now())/1000));
      document.querySelectorAll(".rest-time").forEach(element => { element.textContent = formatDuration(remaining); });
    }
    return result;
  };

  proto.render = function(...args) {
    const result = previous.render.apply(this,args);
    enhanceRenderedUi(this);
    return result;
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this,args);
    if (this.state) {
      this.state.appVersion = VERSION;
      this.state.schemaVersion = Math.max(25,Number(this.state.schemaVersion || 0));
      if (this.state.profile?.birthDate) this.state.profile.age = ageFromBirthDate(this.state.profile.birthDate);
    }
    if (!window.__evorank111Lifecycle) {
      window.__evorank111Lifecycle = true;
      const resume = () => window.RANKFORGE_APP?.tick?.();
      document.addEventListener("visibilitychange", () => { if (!document.hidden) resume(); });
      window.addEventListener("focus",resume);
      window.addEventListener("pageshow",resume);
    }
    window.setTimeout(() => syncBirthday(this).catch(() => {}),1600);
    this.scheduleSave?.();
    return result;
  };

  window.EVORANK111 = Object.freeze({version:VERSION,build:BUILD,birthdayCoins:BIRTHDAY_COINS,ageFromBirthDate});
  window.EVORANK = Object.freeze({name:"EvoRank",version:VERSION,build:BUILD,legacyStorageCompatible:true});
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
