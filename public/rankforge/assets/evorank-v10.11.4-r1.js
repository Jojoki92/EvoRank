/* EvoRank 10.11.4 — neutral body art, exact selections and athletic dip ranks. */
(() => {
  "use strict";

  const VERSION = "10.11.4";
  const WEIGHTED_DIP_REFERENCE_KG = 125;
  const FEMALE_LAT_LEFT = "M145 430C175 449 202 485 228 530L212 621C190 648 165 636 151 604L139 516Z";
  const FEMALE_LAT_RIGHT = "M367 430C337 449 310 485 284 530L300 621C322 648 347 636 361 604L373 516Z";

  const actionAttrs = (muscle, interactive) => interactive
    ? ` data-action="select-muscle" data-muscle="${muscle}"`
    : "";

  function restoreFemaleLat(markup, interactive) {
    const action = actionAttrs("lats", interactive);
    const region = /(<g class="muscle-region muscle-region--lats\b[^>]*>)[\s\S]*?(<\/g>)/u;
    const visible = `<path${action} data-lat-side="left" d="${FEMALE_LAT_LEFT}"/><path${action} data-lat-side="right" d="${FEMALE_LAT_RIGHT}"/>`;
    const hits = `<path class="rf114-muscle-hit"${action} data-lat-side="left" d="${FEMALE_LAT_LEFT}"/><path class="rf114-muscle-hit"${action} data-lat-side="right" d="${FEMALE_LAT_RIGHT}"/>`;
    return markup.replace(region, `$1${visible}${hits}$2`);
  }

  function makeFemaleShapesClickable(markup, interactive) {
    if (!interactive) return markup;
    return markup.replace(/(<g class="muscle-region\b[^>]*data-muscle="([^"]+)"[^>]*>)([\s\S]*?)(<\/g>)/gu,
      (_match, open, muscle, content, close) => {
        const updated = content.replace(/<(path|rect)\b(?![^>]*\bdata-action=)/gu,
          `<$1 data-action="select-muscle" data-muscle="${muscle}"`);
        return `${open}${updated}${close}`;
      });
  }

  function addShoulderTargets(markup, profile, view, interactive) {
    markup = markup.replace(/<g class="rf113-shoulder-overlay"[\s\S]*?<\/g>/gu, "");
    if (!interactive || markup.includes("rf114-shoulder-targets")) return markup;
    const female = profile === "female";
    const y = female ? (view === "front" ? 360 : 365) : (view === "front" ? 420 : 405);
    const left = female ? 113 : 260;
    const right = female ? 399 : 740;
    const rx = female ? 66 : 126;
    const ry = female ? 58 : 106;
    const target = side => `<ellipse data-action="select-muscle" data-muscle="shoulders" role="button" tabindex="0" aria-label="${side === left ? "Linke" : "Rechte"} Schulter" cx="${side}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
    return markup.replace("</svg>", `<g class="rf114-shoulder-targets" aria-label="Schultern">${target(left)}${target(right)}</g></svg>`);
  }

  if (typeof bodyFigure === "function") {
    const previousBodyFigure = bodyFigure;
    bodyFigure = function(view, statuses, selected, options = {}) {
      let markup = previousBodyFigure(view, statuses, selected, options);
      const female = markup.includes("body-figure--female");
      const interactive = options.interactive !== false;
      if (female) {
        if (view === "back") markup = restoreFemaleLat(markup, interactive);
        markup = makeFemaleShapesClickable(markup, interactive);
      }
      return addShoulderTargets(markup, female ? "female" : "male", view, interactive);
    };
  }

  function isWeightedDip(exercise = {}, lift = {}) {
    const id = String(exercise.id || lift.exerciseId || "").toUpperCase();
    const name = String(exercise.name || lift.name || "").toLocaleLowerCase("de");
    return id === "10347BAC" || /(?:trizeps\s*)?dips?.*(?:gewicht|weighted)/u.test(name);
  }

  function auditExerciseMuscles(exercise) {
    const name = String(exercise.name || "").toLocaleLowerCase("de");
    const secondary = new Set(Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : []);
    const add = (...muscles) => muscles.forEach(muscle => {
      if (muscle && muscle !== exercise.muscle) secondary.add(muscle);
    });
    const remove = (...muscles) => muscles.forEach(muscle => secondary.delete(muscle));

    if (/rudern|\brow\b/u.test(name)) add("Lat", "Oberer Rücken", "Bizeps");
    if (/lat.?zug|latziehen|klimmzug|pull.?up|chin.?up/u.test(name)) add("Lat", "Oberer Rücken", "Bizeps");
    if (/face.?pull|reverse.?fly|butterfly.?reverse/u.test(name)) add("Oberer Rücken", "Schultern");
    if (/pullover/u.test(name)) add("Lat", "Brust");
    if (/\bdips?\b/u.test(name)) add("Trizeps", "Brust", "Schultern");

    /* A generic "curl" rule must never turn a leg curl into a biceps exercise. */
    if (/leg.?curl|hamstring.?curl|nordic.?hamstring|beinbeuger/u.test(name)) {
      remove("Bizeps", "Unterarme");
      add("Beinbeuger");
    }

    /* Isolation work does not meaningfully train chest just because "triceps" is in the name. */
    if (!/\bdips?\b/u.test(name) && /trizeps|pushdown|skull.?crusher|french.?press/u.test(name)) {
      remove("Brust", "Schultern");
      add("Trizeps");
    }

    secondary.delete(exercise.muscle);
    exercise.secondaryMuscles = [...secondary].slice(0, 6);
  }

  if (typeof EXERCISES !== "undefined") {
    EXERCISES.forEach(exercise => {
      auditExerciseMuscles(exercise);
      if (!isWeightedDip(exercise)) return;
      exercise.reference1RMKg = WEIGHTED_DIP_REFERENCE_KG;
      exercise.rankCalibration = "calibrated";
    });
  }

  if (typeof scoreLift === "function") {
    const previousScoreLift = scoreLift;
    scoreLift = function(lift = {}, bodyweightKg) {
      const exercise = lift.exercise || (typeof exerciseIndex !== "undefined" ? exerciseIndex.get(lift.exerciseId) : null) || {};
      if (!isWeightedDip(exercise, lift)) return previousScoreLift(lift, bodyweightKg);
      const calibrated = {
        ...exercise,
        reference1RMKg: WEIGHTED_DIP_REFERENCE_KG,
        rankCalibration: "calibrated"
      };
      return previousScoreLift({ ...lift, reference1RMKg: calibrated.reference1RMKg, exercise: calibrated }, bodyweightKg);
    };
  }

  if (typeof LiftoffApp !== "undefined") {
    const proto = LiftoffApp.prototype;
    const previousRenderProfile = proto.renderProfile;
    const previousRender = proto.render;

    proto.renderProfile = function(...args) {
      return previousRenderProfile.apply(this, args)
        .replace(/<section class="rf110-entry rf111-safety-entry">[\s\S]*?<\/section>/u, "");
    };

    proto.render = function(...args) {
      if (this.state) this.state.appVersion = VERSION;
      return previousRender.apply(this, args);
    };
  }
})();
