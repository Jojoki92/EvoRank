/* =============================================================================
 * RANKFORGE 9.3 — Einseitige Übungen (links / rechts)
 *
 * Fügt Sätzen eine Seiten-Erfassung hinzu, ohne die vorhandene Mathematik
 * anzufassen. Der Satz behält weightKg und reps als abgeleitete Werte:
 *
 *   weightKg = Mittel der befüllten Seiten
 *   reps     = Mittel der befüllten Seiten (gerundet)
 *
 * Damit rechnen Volumen, e1RM, Rang, PRs, Progression und CSV-Export exakt
 * weiter wie bisher — ein einseitiger Satz gilt als "pro Seite", genau so wie
 * ihn Nutzer bis jetzt notgedrungen eingetragen haben. Die Historie bleibt
 * vergleichbar; es gibt keinen Sprung in den Statistiken.
 *
 * Bewusst NICHT gemacht: reps = links + rechts. Das wäre volumetrisch näher an
 * der Wahrheit, würde aber e1RM (Epley rechnet mit der Wiederholungszahl) um
 * den Faktor zwei verfälschen und alle bisherigen Werte entwerten.
 * ========================================================================== */
(function (AppClass) {
  "use strict";
  if (!AppClass || AppClass.prototype.__rf93UnilateralInstalled) return;

  const proto = AppClass.prototype;
  proto.__rf93UnilateralInstalled = true;

  const previous = {
    renderWorkoutExercise: proto.renderWorkoutExercise,
    handleInput: proto.handleInput,
    handleClick: proto.handleClick,
    toggleSet: proto.toggleSet,
    addSet: proto.addSet
  };

  // Die großen Grenzwerte sind top-level const in rankforge-v9.2.0.js und damit
  // im globalen lexikalischen Scope sichtbar. Fallbacks, falls sich das ändert.
  const MAX_W = typeof MAX_SET_WEIGHT_KG === "number" ? MAX_SET_WEIGHT_KG : 1000;
  const MAX_R = typeof MAX_SET_REPS === "number" ? MAX_SET_REPS : 999;

  const clampNumber = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

  /** Übungen, die praktisch immer einseitig trainiert werden. */
  const UNILATERAL_PATTERN = /(einarm|einbein|ein-arm|ein-bein|single[ -]?arm|single[ -]?leg|one[ -]?arm|one[ -]?leg|unilateral|bulgarian|split squat|pistol|suitcase|curtsy|meadows|b-stance|copenhagen|lean-away)/i;

  function detectUnilateral(exercise) {
    if (!exercise) return false;
    const haystack = [exercise.name, ...(Array.isArray(exercise.aliases) ? exercise.aliases : [])]
      .filter(Boolean).join(" ");
    return UNILATERAL_PATTERN.test(haystack);
  }

  function isUnilateralExercise(exercise) {
    if (!exercise) return false;
    if ((exercise.tracking || "weight-reps") !== "weight-reps") return false;
    if (exercise.unilateral === true) return true;
    if (exercise.unilateral === false) return false;
    if (exercise.executionMode === "unilateral") return true;
    if (exercise.executionMode === "bilateral") return false;
    return detectUnilateral(exercise);
  }

  // ------------------------------------------------------------------ Datenmodell

  function emptySide() {
    return { weightKg: 0, reps: 0 };
  }

  function normalizeSide(raw) {
    if (!raw || typeof raw !== "object") return emptySide();
    return {
      weightKg: clampNumber(raw.weightKg ?? raw.weight ?? 0, 0, MAX_W),
      reps: clampNumber(Math.round(Number(raw.reps ?? 0)), 0, MAX_R)
    };
  }

  /**
   * Liest Seitendaten aus einem rohen Satz. Akzeptiert sowohl die verschachtelte
   * Form { left: {...}, right: {...} } als auch die flache Form aus alten
   * Sicherungen. Gibt null zurück, wenn der Satz nicht einseitig ist.
   */
  function readSides(raw) {
    if (!raw || typeof raw !== "object") return null;
    const hasNested = raw.left || raw.right;
    const hasFlat = raw.leftWeightKg != null || raw.leftReps != null
      || raw.rightWeightKg != null || raw.rightReps != null;
    if (!raw.unilateral && !hasNested && !hasFlat) return null;
    const left = hasNested
      ? normalizeSide(raw.left)
      : normalizeSide({ weightKg: raw.leftWeightKg, reps: raw.leftReps });
    const right = hasNested
      ? normalizeSide(raw.right)
      : normalizeSide({ weightKg: raw.rightWeightKg, reps: raw.rightReps });
    return { left, right };
  }

  const sideFilled = side => Boolean(side && (side.weightKg > 0 || side.reps > 0));

  /**
   * Schreibt die abgeleiteten Werte weightKg und reps aus den Seiten zurück.
   * Gemittelt wird nur über Seiten, in denen tatsächlich etwas steht — sonst
   * würde ein noch leeres rechtes Feld das Gewicht halbieren.
   */
  function syncDerived(set) {
    if (!set?.unilateral) return set;
    const sides = [set.left, set.right].filter(sideFilled);
    if (!sides.length) {
      set.weightKg = 0;
      set.reps = 0;
      return set;
    }
    const weight = sides.reduce((total, side) => total + side.weightKg, 0) / sides.length;
    const reps = sides.reduce((total, side) => total + side.reps, 0) / sides.length;
    set.weightKg = clampNumber(Math.round(weight * 100) / 100, 0, MAX_W);
    set.reps = clampNumber(Math.round(reps), 0, MAX_R);
    return set;
  }

  /** Echtes Gesamtvolumen des Satzes über beide Seiten — nur für die Anzeige. */
  function bothSidesVolume(set) {
    if (!set?.unilateral) return Number(set?.weightKg || 0) * Number(set?.reps || 0);
    return (Number(set.left?.weightKg || 0) * Number(set.left?.reps || 0))
      + (Number(set.right?.weightKg || 0) * Number(set.right?.reps || 0));
  }

  /** Macht aus einem beidseitigen Satz einen einseitigen und umgekehrt. */
  function convertSet(set, unilateral) {
    if (unilateral) {
      if (set.unilateral) return set;
      set.unilateral = true;
      // Der bisherige Wert galt bereits "pro Seite" — also auf beide übernehmen.
      set.left = { weightKg: Number(set.weightKg || 0), reps: Number(set.reps || 0) };
      set.right = { weightKg: Number(set.weightKg || 0), reps: Number(set.reps || 0) };
      return syncDerived(set);
    }
    if (!set.unilateral) return set;
    syncDerived(set);
    delete set.unilateral;
    delete set.left;
    delete set.right;
    return set;
  }

  // ------------------------------------------------------------------ Normalisierung
  // normalizeSet und normalizeDraftExercise werfen unbekannte Felder weg. Ohne
  // diese beiden Wrapper wären die Seitendaten nach jedem Neuladen verschwunden.

  const baseNormalizeSet = typeof window.normalizeSet === "function" ? window.normalizeSet : null;
  if (baseNormalizeSet && !baseNormalizeSet.__rf93Wrapped) {
    const wrappedSet = function (set = {}, index = 0) {
      const result = baseNormalizeSet(set, index);
      const sides = readSides(set);
      if (sides) {
        result.unilateral = true;
        result.left = sides.left;
        result.right = sides.right;
        syncDerived(result);
      }
      return result;
    };
    wrappedSet.__rf93Wrapped = true;
    window.normalizeSet = wrappedSet;
  }

  const baseNormalizeExercise = typeof window.normalizeDraftExercise === "function" ? window.normalizeDraftExercise : null;
  if (baseNormalizeExercise && !baseNormalizeExercise.__rf93Wrapped) {
    const wrappedExercise = function (item = {}, index = 0) {
      const result = baseNormalizeExercise(item, index);
      if (item.unilateral === true || item.unilateral === false) result.unilateral = item.unilateral;
      if (Array.isArray(item.aliases)) result.aliases = item.aliases.slice(0, 10);
      return result;
    };
    wrappedExercise.__rf93Wrapped = true;
    window.normalizeDraftExercise = wrappedExercise;
  }

  // ------------------------------------------------------------------ Darstellung

  const STYLE_ID = "rf93-unilateral-styles";
  const CSS = `
.rf93-uni{display:grid;gap:8px;grid-template-columns:1fr auto;align-items:end}
.rf93-uni__rows{display:grid;gap:7px;min-width:0}
.rf93-uni__row{display:grid;grid-template-columns:26px 1fr 1fr;gap:7px;align-items:end;min-width:0}
.rf93-uni__side{height:44px;display:grid;place-items:center;border-radius:11px;
  font-size:.62rem;font-weight:900;letter-spacing:.04em;
  background:color-mix(in srgb,currentColor 8%,transparent);opacity:.72}
.rf93-uni__row .v72-set-field{min-width:0}
.rf93-uni__row .v72-set-field>span{font-size:.5rem}
.rf93-uni__row:not(:first-child) .v72-set-field>span{visibility:hidden;height:0;margin:0}
.rf93-uni__aside{display:grid;gap:7px;justify-items:stretch}
.rf93-uni__mirror{min-height:34px;padding:0 9px;border-radius:11px;cursor:pointer;
  border:1px solid color-mix(in srgb,currentColor 18%,transparent);background:transparent;
  color:inherit;opacity:.72;font-family:inherit;font-size:.55rem;font-weight:850;
  letter-spacing:.03em;white-space:nowrap}
.rf93-uni__mirror:active{transform:scale(.97)}
.rf93-uni__total{font-size:.55rem;opacity:.6;font-weight:700}
.rf93-uni-flag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;
  font-size:.5rem;font-weight:900;letter-spacing:.06em;
  background:color-mix(in srgb,currentColor 10%,transparent);opacity:.8;margin-left:6px}
button[data-action="rf93-toggle-unilateral"].is-active{
  outline:1px solid color-mix(in srgb,currentColor 35%,transparent)}
@media (max-width:360px){
  .rf93-uni{grid-template-columns:1fr}
  .rf93-uni__aside{grid-auto-flow:column;justify-content:start}
}
@media (prefers-reduced-motion:reduce){.rf93-uni__mirror:active{transform:none}}
`;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const node = document.createElement("style");
    node.id = STYLE_ID;
    node.textContent = CSS;
    document.head.append(node);
  }

  const attr = value => (typeof escapeAttr === "function" ? escapeAttr(value) : String(value ?? ""));
  const text = value => (typeof escapeHtml === "function" ? escapeHtml(value) : String(value ?? ""));

  function sideInput(app, exercise, set, side, field, label, step, unit) {
    const raw = set[side]?.[field === "weightKg" ? "weightKg" : "reps"] || 0;
    const shown = field === "weightKg"
      ? round(toDisplayWeight(raw, app.unit), 2)
      : Math.round(raw);
    const name = `${side}${field === "weightKg" ? "WeightKg" : "Reps"}`;
    const sideWord = side === "left" ? "links" : "rechts";
    return `<label class="v72-set-field"><span>${text(label)}</span><div class="v72-set-input">` +
      `<input data-action="set-input" data-rf93-field="${attr(name)}"` +
      ` data-rf93-exercise-id="${attr(exercise.id)}" data-rf93-set-id="${attr(set.id)}"` +
      ` aria-label="${attr(`${label} ${sideWord}`)}" type="number" inputmode="decimal"` +
      ` min="0" step="${attr(step)}" value="${attr(shown)}">` +
      `<em>${text(unit)}</em></div></label>`;
  }

  function fieldsMarkup(app, exercise, set) {
    const weightUnit = app.unit;
    const total = bothSidesVolume(set);
    const detail = `<button class="v72-set-detail ${set.rir != null || set.rpe || set.note || set.pain ? "has-data" : ""}"` +
      ` data-action="v7-set-details" data-exercise-id="${attr(exercise.id)}" data-set-id="${attr(set.id)}"` +
      ` aria-label="Satzdetails">${set.rir != null ? `<b>${set.rir}</b><small>RIR</small>` : (typeof icon === "function" ? icon("note", 16) : "·")}</button>`;

    const row = side => `<div class="rf93-uni__row">` +
      `<span class="rf93-uni__side" aria-hidden="true">${side === "left" ? "L" : "R"}</span>` +
      sideInput(app, exercise, set, side, "weightKg", "Gewicht", "0.5", weightUnit) +
      sideInput(app, exercise, set, side, "reps", "Wdh", "1", "Wdh") +
      `</div>`;

    return `<div class="v72-set-card__fields rf93-uni">` +
      `<div class="rf93-uni__rows">${row("left")}${row("right")}</div>` +
      `<div class="rf93-uni__aside">` +
        `<button type="button" class="rf93-uni__mirror" data-action="rf93-mirror"` +
        ` data-exercise-id="${attr(exercise.id)}" data-set-id="${attr(set.id)}"` +
        ` aria-label="Werte von links auf rechts übernehmen">L → R</button>` +
        detail +
      `</div>` +
      `<span class="rf93-uni__total">Gesamt ${text(formatNumber(round(toDisplayWeight(total, weightUnit), 1)))} ${text(weightUnit)}</span>` +
    `</div>`;
  }

  proto.renderWorkoutExercise = function (exercise, exercisePosition) {
    let html = previous.renderWorkoutExercise.call(this, exercise, exercisePosition);
    const unilateral = isUnilateralExercise(exercise);

    // Umschalter in die Fußzeile der Übung, direkt vor den Satz-Zähler.
    const toggle = `<button type="button" class="${unilateral ? "is-active" : ""}"` +
      ` data-action="rf93-toggle-unilateral" data-exercise-id="${attr(exercise.id)}"` +
      ` aria-pressed="${unilateral ? "true" : "false"}"` +
      ` title="Ein- oder beidseitige Eingabe">${unilateral ? "L/R an" : "L/R"}</button>`;
    html = html.replace(
      /(<footer>)([\s\S]*?)(<span>\d+\/\d+<\/span>\s*<\/footer>)/,
      (match, open, middle, tail) => `${open}${middle}${toggle}${tail}`
    );

    if (!unilateral) return html;

    // Titelzeile markieren, damit auch im Rückblick klar ist, wie erfasst wurde.
    html = html.replace(/(<h2>)([\s\S]*?)(<\/h2>)/, (match, open, title, close) =>
      `${open}${title}<span class="rf93-uni-flag">L / R</span>${close}`);

    let index = 0;
    html = html.replace(
      /<div class="v72-set-card__fields">[\s\S]*?<\/div>(?=\s*<div class="v72-set-card__hint">)/g,
      match => {
        const set = exercise.sets[index++];
        if (!set) return match;
        if (!set.unilateral) convertSet(set, true);
        return fieldsMarkup(this, exercise, set);
      }
    );
    return html;
  };

  // ------------------------------------------------------------------ Eingabe

  function applySideValue(app, set, fieldName, rawValue) {
    const side = fieldName.startsWith("left") ? "left" : "right";
    const isWeight = fieldName.endsWith("WeightKg");
    if (!set.unilateral) convertSet(set, true);
    if (!set[side]) set[side] = emptySide();
    const numeric = Math.max(0, Number(String(rawValue).replace(",", ".")) || 0);
    if (isWeight) {
      set[side].weightKg = clampNumber(fromDisplayWeight(numeric, app.unit), 0, MAX_W);
    } else {
      set[side].reps = clampNumber(Math.round(numeric), 0, MAX_R);
    }
    syncDerived(set);
  }

  proto.handleInput = function (event) {
    const element = event?.target;
    const fieldName = element?.dataset?.rf93Field;
    if (!fieldName) return previous.handleInput.call(this, event);
    const { set } = this.findDraftSet(element.dataset.rf93ExerciseId, element.dataset.rf93SetId);
    if (!set) return;
    applySideValue(this, set, fieldName, element.value);
    this.scheduleSave();
    // Bewusst kein render(): das würde den Fokus und die Tastatur wegnehmen.
  };

  /**
   * Übernimmt die noch nicht übertragenen Feldwerte aus dem DOM, bevor ein Satz
   * abgeschlossen wird. Die eingebaute Variante in toggleSet greift nur auf
   * Felder mit data-field zu und würde unsere Seitenfelder sonst übersehen.
   */
  function flushSideInputs(app) {
    document.querySelectorAll("input[data-rf93-field]").forEach(input => {
      const { set } = app.findDraftSet(input.dataset.rf93ExerciseId, input.dataset.rf93SetId);
      if (!set) return;
      applySideValue(app, set, input.dataset.rf93Field, input.value);
    });
  }

  proto.toggleSet = function (exerciseId, setId) {
    flushSideInputs(this);
    return previous.toggleSet.call(this, exerciseId, setId);
  };

  proto.addSet = function (exerciseId) {
    const result = previous.addSet.call(this, exerciseId);
    const exercise = this.state.draft?.exercises.find(item => item.id === exerciseId);
    if (!exercise || exercise.sets.length < 2) return result;
    const source = exercise.sets.at(-2);
    const target = exercise.sets.at(-1);
    if (source?.unilateral && target && !target.unilateral) {
      target.unilateral = true;
      target.left = { ...source.left };
      target.right = { ...source.right };
      syncDerived(target);
      this.scheduleSave();
      this.render();
    }
    return result;
  };

  proto.handleClick = async function (event) {
    const element = event?.target instanceof Element ? event.target.closest("[data-action]") : null;
    const action = element?.dataset?.action;

    if (action === "rf93-mirror") {
      event.preventDefault();
      flushSideInputs(this);
      const { set } = this.findDraftSet(element.dataset.exerciseId, element.dataset.setId);
      if (!set) return;
      if (!set.unilateral) convertSet(set, true);
      set.right = { ...set.left };
      syncDerived(set);
      this.scheduleSave();
      this.render();
      return;
    }

    if (action === "rf93-toggle-unilateral") {
      event.preventDefault();
      flushSideInputs(this);
      const exercise = this.state.draft?.exercises.find(item => item.id === element.dataset.exerciseId);
      if (!exercise) return;
      const next = !isUnilateralExercise(exercise);
      exercise.unilateral = next;
      exercise.executionMode = next ? "unilateral" : "bilateral";
      exercise.sets.forEach(set => convertSet(set, next));
      this.scheduleSave();
      this.render();
      this.showToast?.(next
        ? "Eingabe pro Seite aktiv — links und rechts getrennt"
        : "Eingabe wieder beidseitig");
      return;
    }

    if (action === "set-copy-previous") {
      // Erst die eingebaute Übernahme laufen lassen, dann die Seiten nachziehen.
      const result = await previous.handleClick.call(this, event);
      const exercise = this.state.draft?.exercises.find(item => item.id === element.dataset.exerciseId);
      const index = exercise?.sets.findIndex(item => item.id === element.dataset.setId) ?? -1;
      if (exercise && index > 0) {
        const source = exercise.sets[index - 1];
        const target = exercise.sets[index];
        if (source?.unilateral) {
          target.unilateral = true;
          target.left = { ...source.left };
          target.right = { ...source.right };
          syncDerived(target);
          this.scheduleSave();
          this.render();
        }
      }
      return result;
    }

    return previous.handleClick.call(this, event);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectStyles, { once: true });
  } else {
    injectStyles();
  }

  window.RANKFORGE93_UNILATERAL = Object.freeze({
    version: "1.0.0",
    isUnilateral: isUnilateralExercise,
    detect: detectUnilateral,
    convertSet,
    syncDerived,
    bothSidesVolume,
    readSides
  });
})(typeof LiftoffApp === "function" ? LiftoffApp : null);
/* end-rankforge-v93-unilateral */
