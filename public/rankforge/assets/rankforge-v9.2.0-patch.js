/* RANKFORGE 9.2.0 — proportionate bodygraphs, progressive onboarding and themed UI */
((AppClass) => {
  "use strict";

  const VERSION = "9.2.0";
  const SCHEMA = 27;
  const WOOD = RANKS.find(rank => rank.key === "wood")?.color || "#e7a05d";
  const I18N = window.RANKFORGE_I18N;
  const t = value => I18N?.t(value) || value;
  const MALE_ROOT = "./assets/body";
  const MASK_ROOT = `${MALE_ROOT}/masks-v9.2.0`;
  const MALE_BUILD_TRANSFORM = "translate(-35 0) scale(1.07 1)";
  // One approved contour is the source of truth for both sides. The second lat
  // reuses this exact geometry instead of maintaining an independently edited
  // path. A small whole-shape offset follows the asymmetrical base artwork
  // without widening the outer edge into the arm.
  const FEMALE_LAT_LEFT = "M187 454 C174 449 162 439 153 428 C146 420 138 416 131 418 C128 428 128 440 131 448 C127 471 128 494 133 518 C139 543 153 569 174 594 L207 618 C218 604 225 581 230 555 C234 532 226 507 211 485 Z";
  const FEMALE_LAT_LINE_LEFT = "M155 474 C168 502 186 539 207 584 M207 584 L219 610";
  const FEMALE_LAT_HIT_LEFT = "M135 420 C165 432 198 470 230 526 L238 575 L216 646 C184 681 149 651 133 607 L118 515 Z";
  const FEMALE_LAT_RIGHT_TRANSFORM = "translate(-16 0) translate(512 0) scale(-1 1)";
  const FEMALE_GROIN_DETAIL = "M246 748L256 763L265 773L266 776L266 782L267 783L267 790L268 791L268 808L268 806L271 804L273 804L274 802L276 804L277 811L279 814L278 815L279 818L280 788L281 787L281 782L282 781L283 773L294 761L304 745L291 763L284 770L276 774L269 773L264 770L259 765Z";
  const PUBLIC_ACCOUNT_KEY = "rankforge-local";
  const STREAK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  // Hit contours sampled from the alpha channel of the unchanged forearm masks.
  const MALE_FOREARM_HIT = {"front":"M239,729L233,735L229,741L227,747L224,753L222,759L220,765L219,771L217,777L216,783L215,789L214,795L213,801L213,807L212,813L212,819L212,825L212,831L211,837L212,843L212,849L212,855L212,861L213,867L213,873L213,879L213,885L213,891L213,897L214,903L214,909L214,915L213,921L213,927L213,933L214,939L236,945L235,951L234,957L235,963L237,968L241,968L243,963L245,957L247,951L248,945L248,939L248,933L248,927L247,921L260,915L262,909L265,903L268,897L270,891L273,885L276,879L278,873L281,867L284,861L286,855L289,849L292,843L294,837L295,831L298,825L300,819L301,813L302,807L303,801L304,795L305,789L306,783L306,777L306,771L306,765L306,759L305,753L305,747L302,741L248,735L243,729Z M765,729L760,735L705,741L703,747L702,753L702,759L701,765L701,771L702,777L702,783L702,789L703,795L703,801L705,807L706,813L707,819L709,825L711,831L713,837L715,843L717,849L719,855L722,861L725,867L727,873L730,879L733,885L736,891L738,897L741,903L744,909L746,915L758,921L757,927L757,933L757,939L757,945L758,951L759,957L762,963L764,967L768,967L770,963L771,957L771,951L770,945L793,939L793,933L793,927L793,921L792,915L792,909L792,903L792,897L792,891L792,885L792,879L793,873L793,867L793,861L793,855L794,849L794,843L794,837L794,831L794,825L794,819L794,813L794,807L793,801L792,795L792,789L791,783L790,777L788,771L787,765L786,759L784,753L781,747L778,741L776,735L769,729Z","back":"M233,713L229,719L225,725L221,731L219,737L216,743L214,749L212,755L211,761L209,767L207,773L207,779L206,785L205,791L205,797L204,803L204,809L204,815L204,821L204,827L204,833L205,839L205,845L205,851L205,857L205,863L205,869L205,875L205,881L205,887L205,893L205,899L205,905L205,911L205,917L204,923L203,929L202,935L221,941L221,946L224,946L226,941L228,935L231,929L233,923L236,917L239,911L241,905L245,899L247,893L250,887L254,881L257,875L260,869L263,863L266,857L269,851L271,845L274,839L277,833L279,827L281,821L284,815L286,809L287,803L288,797L289,791L291,785L291,779L291,773L292,767L292,761L291,755L291,749L290,743L289,737L289,731L239,725L239,719L237,713Z M759,712L757,718L757,724L708,730L706,736L706,742L705,748L704,754L704,760L704,766L704,772L704,778L705,784L705,790L706,796L708,802L710,808L711,814L713,820L716,826L718,832L720,838L723,844L726,850L729,856L732,862L735,868L738,874L741,880L744,886L747,892L750,898L752,904L755,910L758,916L760,922L763,928L765,934L768,940L770,946L770,946L773,946L773,946L773,940L791,934L791,928L790,922L789,916L789,910L789,904L789,898L789,892L789,886L789,880L789,874L789,868L789,862L789,856L789,850L790,844L790,838L790,832L790,826L790,820L790,814L790,808L790,802L790,796L789,790L789,784L788,778L787,772L786,766L785,760L783,754L781,748L779,742L777,736L774,730L770,724L767,718L762,712Z"};
  let figureSequence = 0;

  function rollingStreakStatus(workouts = [], now = new Date()) {
    const nowMs = new Date(now).getTime();
    const completions = workouts
      .map(workout => workoutDate(workout))
      .filter(date => Number.isFinite(date?.getTime?.()) && date.getTime() <= nowMs)
      .sort((left, right) => left - right);
    const latest = completions.at(-1);
    if (!latest || nowMs - latest.getTime() > STREAK_WINDOW_MS) {
      return Object.freeze({ count: 0, active: false, daysRemaining: 0, expiresAt: null, lastWorkoutAt: latest?.toISOString?.() || null });
    }

    let count = 1;
    let cursor = latest;
    for (let index = completions.length - 2; index >= 0; index -= 1) {
      const previous = completions[index];
      if (cursor.getTime() - previous.getTime() > STREAK_WINDOW_MS) break;
      count += 1;
      cursor = previous;
    }

    const expiresAt = new Date(latest.getTime() + STREAK_WINDOW_MS);
    const remainingMs = Math.max(0, expiresAt.getTime() - nowMs);
    return Object.freeze({
      count,
      active: true,
      daysRemaining: Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
      expiresAt: expiresAt.toISOString(),
      lastWorkoutAt: latest.toISOString()
    });
  }

  function rollingStreakLabel(status) {
    if (!status.active) return "Noch keine Streak";
    if (status.daysRemaining <= 1) return `${status.count}er Streak · heute trainieren`;
    return `${status.count}er Streak · noch ${status.daysRemaining} Tage`;
  }

  function streakFlameIcon(size = 18) {
    const dimension = Math.max(12, Number(size) || 18);
    return `<svg class="icon rf920-flame-icon" width="${dimension}" height="${dimension}" viewBox="0 0 24 24" aria-hidden="true"><path class="rf920-flame-shell" d="M13.6 2.2c.6 3-1 4.4-2.7 6.1-1.4-1.2-1.8-2.6-1.6-4.1C5.7 7.2 3.7 10.4 4 14c.3 4.6 3.8 7.8 8.2 7.8 4.6 0 7.8-3.2 7.8-7.5 0-4.4-2.6-8.4-6.4-12.1Z"/><path class="rf920-flame-core" d="M12.3 11.2c-2 1.7-3.1 3.2-2.9 5 .1 1.7 1.4 3 3 3 1.9 0 3.1-1.4 3.1-3 0-1.9-1.3-3.7-3.2-5Z"/></svg>`;
  }

  // Version 9.2 is public and uses one device-local profile. The key only selects
  // an IndexedDB namespace inside the current browser; no visitor shares training
  // data with another browser or device. Existing approved local profiles remain
  // available when their old session is already present.
  if (typeof rf75ReadSession === "function") {
    document.documentElement.dataset.accessMode = "public";
    config.allowedAccounts ||= {};
    config.allowedAccounts[PUBLIC_ACCOUNT_KEY] = {
      name: "Athlet",
      handle: "@athlet",
      location: "",
      email: ""
    };
    rf75ReadSession = function() {
      const stored = safeStorageGet(RF75_SESSION_KEY, "sessionStorage") || safeStorageGet(RF75_SESSION_KEY) || "";
      return rf75Account(stored) ? stored : PUBLIC_ACCOUNT_KEY;
    };
  }

  function profileOf(options = {}) {
    return window.RANKFORGE890?.normalizeBodyProfile?.(
      options.bodyProfile || options.sex || window.RANKFORGE_APP?.state?.profile?.bodyProfile || "male",
      "male"
    ) || "male";
  }

  function maskFiles(view, key) {
    // The small lateral strip on the male front belongs visually to the upper-arm
    // selection. Combining it with biceps keeps every painted pixel interactive
    // without inventing a second front-only muscle category.
    const keys = view === "front" && key === "biceps" ? ["biceps", "triceps"] : [key];
    return keys.map(maskKey => `${MASK_ROOT}/male-${view}-${maskKey}-v${VERSION}.png`);
  }

  function maleRegion(view, key, statuses, selected, pathData, prefix, interactive, scaleX, scaleY) {
    const status = statuses?.[key];
    const hasRank = Boolean(status?.score);
    const color = hasRank ? status.rank.color : WOOD;
    const group = MUSCLE_GROUPS.find(item => item.key === key);
    const name = status?.group?.name || group?.name || key;
    const maskId = `${prefix}-${key}`;
    const interaction = interactive
      ? ` data-action="select-muscle" data-muscle="${escapeAttr(key)}" role="button" tabindex="0" aria-pressed="${selected === key}" aria-label="${escapeAttr(name)}"`
      : ` aria-hidden="true"`;
    const exactForearm = key === "forearms";
    if (exactForearm) { pathData=MALE_FOREARM_HIT[view]; scaleX=1; scaleY=1; }
    const hit = pathData
      ? `<g transform="scale(${scaleX} ${scaleY})"><path class="rf920-muscle-hit${exactForearm ? ' x56-forearm-hit' : ''}"${interactive ? ` data-action="select-muscle" data-muscle="${escapeAttr(key)}"` : ''} d="${escapeAttr(pathData)}" fill-rule="evenodd"/></g>`
      : "";
    // The source quads mask contains a tiny disconnected centre component. It
    // is not a selectable thigh muscle and looked like a coloured photo/detail
    // in the groin. Remove only that component from the visible mask.
    const groinCutout = view === "front" && key === "quads"
      ? '<rect class="rf920-groin-cutout" x="489" y="987" width="32" height="49" rx="10" fill="#000"/>'
      : "";
    const core = view === 'front' && key === 'core';
    // The original mask already contains the anatomical segments. Slightly
    // tighten their raster gaps and outline the masked shape, not its full-size
    // source rectangle (a stroke on that rectangle cannot outline the muscles).
    const coreFilters = core ? `<filter id="${maskId}-expand"><feMorphology operator="dilate" radius="2"/></filter><filter id="${maskId}-edge" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.7" result="outer"/><feComposite in="outer" in2="SourceAlpha" operator="out" result="edge"/><feFlood flood-color="#000" flood-opacity=".3"/><feComposite in2="edge" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
    const outline = `<filter id="${maskId}-outline" x="-2%" y="-2%" width="104%" height="104%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="outer"/><feComposite in="outer" in2="SourceAlpha" operator="out" result="edge"/><feFlood flood-color="#000" flood-opacity=".48"/><feComposite in2="edge" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    const paint = `<g class="rfx45-anatomy-outline" filter="url(#${maskId}-outline)"><rect class="rf920-muscle-fill" x="0" y="0" width="1000" height="2048" mask="url(#${maskId})"/></g>`;
    return {
      definition: `${outline}${coreFilters}<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="2048">${maskFiles(view, key).map(source => `<image href="${escapeAttr(source)}" x="0" y="0" width="1000" height="2048" preserveAspectRatio="none"${core?` filter="url(#${maskId}-expand)"`:''}/>`).join("")}${groinCutout}</mask>`,
      markup: `<g class="muscle-region rf920-muscle-region muscle-region--${escapeAttr(key)} ${hasRank ? "has-rank" : "is-unranked"} ${selected === key ? "is-selected" : ""}" style="--muscle-color:${escapeAttr(color)}"${interaction}>${core?`<g class="rfx42-core-paint"${selected===key?` filter="url(#${maskId}-edge)"`:''}>${paint}</g>`:paint}${hit}</g>`
    };
  }

  function maleBodyFigure(view, statuses, selected, options = {}) {
    const assets = window.UPRANK_BODYGRAPH_ASSETS || bodygraphAssets;
    const paths = assets?.paths?.[view] || {};
    const legacyWidth = Number(assets?.width || 118);
    const legacyHeight = Number(assets?.height || 288);
    const scaleX = (1000 / legacyWidth).toFixed(6);
    const scaleY = (2048 / legacyHeight).toFixed(6);
    const order = view === "front"
      ? ["shoulders", "chest", "biceps", "forearms", "core", "adductors", "quads", "calves"]
      : ["shoulders", "upperBack", "lats", "triceps", "forearms", "lowerBack", "glutes", "hamstrings", "calves"];
    const prefix = `rf920-${view}-${++figureSequence}`;
    const regions = order.map(key => maleRegion(view, key, statuses, selected, paths[key], prefix, options.interactive !== false, scaleX, scaleY));
    const label = options.hideLabel ? "" : `<span>${view === "front" ? "VORNE" : "HINTEN"}</span>`;
    const extraClass = options.className ? ` ${escapeAttr(options.className)}` : "";
    const light = view === "front"
      ? `${MALE_ROOT}/male-front-neutral-light-v${VERSION}-groin-clean.png`
      : `${MALE_ROOT}/male-back-neutral-light-v${VERSION}.webp`;
    const dark = view === "front"
      ? `${MALE_ROOT}/male-front-neutral-dark-v${VERSION}-groin-clean.png`
      : `${MALE_ROOT}/male-back-neutral-dark-v${VERSION}.webp`;
    return `<div class="body-figure body-figure--male-v920${extraClass}">${label}<svg viewBox="160 64 680 1840" role="img" aria-label="${view === "front" ? "Männliche Vorderseite" : "Männliche Rückseite"} des Muskelstatus"><defs>${regions.map(item => item.definition).join("")}</defs><g class="rf921-male-build" transform="${MALE_BUILD_TRANSFORM}"><image class="rf920-male-base rf920-male-base--light" href="${escapeAttr(light)}" x="0" y="0" width="1000" height="2048" preserveAspectRatio="none" aria-hidden="true"/><image class="rf920-male-base rf920-male-base--dark" href="${escapeAttr(dark)}" x="0" y="0" width="1000" height="2048" preserveAspectRatio="none" aria-hidden="true"/>${regions.map(item => item.markup).join("")}</g></svg></div>`;
  }

  function fitFemaleLat(markup, interactive) {
    const action = interactive ? ' data-action="select-muscle" data-muscle="lats"' : "";
    const expression = new RegExp('(<g class="muscle-region muscle-region--lats\\b[^>]*>)[\\s\\S]*?(</g>)');
    return markup.replace(expression, `$1<path${action} data-lat-side="left" d="${FEMALE_LAT_LEFT}" fill-rule="evenodd" clip-rule="evenodd"/><path${action} data-lat-side="right" d="${FEMALE_LAT_LEFT}" transform="${FEMALE_LAT_RIGHT_TRANSFORM}" fill-rule="evenodd" clip-rule="evenodd"/><path class="rf911-anatomy-lines" data-lat-side="left" d="${FEMALE_LAT_LINE_LEFT}"/><path class="rf911-anatomy-lines" data-lat-side="right" d="${FEMALE_LAT_LINE_LEFT}" transform="${FEMALE_LAT_RIGHT_TRANSFORM}"/><path class="rf911-muscle-hit"${action} data-lat-side="left" d="${FEMALE_LAT_HIT_LEFT}"/><path class="rf911-muscle-hit"${action} data-lat-side="right" d="${FEMALE_LAT_HIT_LEFT}" transform="${FEMALE_LAT_RIGHT_TRANSFORM}"/>$2`);
  }

  function cleanFemaleGroin(markup) {
    // The third adductor sub-path is an isolated centre ornament. Removing that
    // sub-path keeps both real adductors clickable and leaves a clean neutral
    // transition between the legs.
    return markup.replace(FEMALE_GROIN_DETAIL, "");
  }

  const previousBodyFigure = bodyFigure;
  bodyFigure = function(view, statuses, selected, options = {}) {
    if (profileOf(options) === "male") return maleBodyFigure(view, statuses, selected, options);
    const markup = previousBodyFigure(view, statuses, selected, options);
    return view === "back"
      ? fitFemaleLat(markup, options.interactive !== false)
      : cleanFemaleGroin(markup);
  };

  function onboardingState(app) {
    const profile = app.state?.profile || {};
    app.ui.rf920Onboarding ||= {
      step: 0,
      answers: {
        language: I18N?.language || "de",
        age: Number(profile.age || 25),
        goal: profile.goal || "Muskelaufbau",
        source: app.state?.personalization?.source || "",
        bodyProfile: profile.bodyProfile === "female" ? "female" : "male",
        bodyweight: round(toDisplayWeight(profile.bodyweightKg || 75, profile.unit || "kg"), 1),
        unit: profile.unit === "lb" ? "lb" : "kg",
        experience: profile.experience || "Fortgeschritten",
        sessions: clamp(Number(app.state?.personalization?.sessionsPerWeek || profile.trainingDays?.length || 3), 1, 7),
        trainingDays: Array.isArray(profile.trainingDays) && profile.trainingDays.length ? [...profile.trainingDays] : [1, 3, 5]
      }
    };
    return app.ui.rf920Onboarding;
  }

  function radioCards(name, entries, selected, className = "") {
    return `<div class="rf920-onboarding__choices ${className}">${entries.map(([value, label, symbol = ""]) => `<label><input type="radio" name="${escapeAttr(name)}" value="${escapeAttr(value)}" ${String(selected) === String(value) ? "checked" : ""} required><span>${symbol ? `<b aria-hidden="true">${symbol}</b>` : ""}<strong>${escapeHtml(label)}</strong></span></label>`).join("")}</div>`;
  }

  function onboardingQuestion(app, step) {
    const data = onboardingState(app).answers;
    const days = [[1, "Montag"], [2, "Dienstag"], [3, "Mittwoch"], [4, "Donnerstag"], [5, "Freitag"], [6, "Samstag"], [0, "Sonntag"]];
    switch (step) {
      case 0:
        return {
          title: t("Welche Sprache möchtest du verwenden?"),
          body: `<div class="rf920-onboarding__choices rf920-onboarding__choices--languages" data-rf920-no-translate>${I18N.languages.map(language => `<label><input type="radio" name="language" value="${language.code}" ${data.language === language.code ? "checked" : ""} required><span><b aria-hidden="true">${language.code === "de" ? "DE" : language.code === "en" ? "EN" : language.code === "zh" ? "中" : language.code === "hi" ? "हि" : language.code === "es" ? "ES" : "ع"}</b><strong>${language.label}</strong></span></label>`).join("")}</div>`
        };
      case 1:
        return { title: t("Wie alt bist du?"), body: `<label class="rf920-onboarding__number"><span>${t("Alter")}</span><input name="age" type="number" inputmode="numeric" min="13" max="100" value="${escapeAttr(data.age)}" required autofocus><em>${t("Deine Antworten bleiben lokal auf diesem Gerät.")}</em></label>` };
      case 2:
        return { title: t("Warum trainierst du?"), body: radioCards("goal", [["Muskelaufbau", t("Muskelaufbau"), "◒"], ["Stärker werden", t("Stärker werden"), "↗"], ["Allgemeine Fitness", t("Allgemeine Fitness"), "◎"], ["Kraft & Technik", t("Kraft & Technik"), "◇"]], data.goal) };
      case 3:
        return { title: t("Wie hast du EVORANK entdeckt?"), body: radioCards("source", [["social", t("Social Media"), "#"], ["friends", t("Freunde oder Familie"), "☺"], ["store", t("App Store oder Google Play"), "▣"], ["search", t("Google oder Websuche"), "⌕"], ["gym", t("Gym oder Trainer"), "◆"], ["other", t("Sonstiges"), "+"]], data.source, "rf920-onboarding__choices--compact") };
      case 4:
        return { title: t("Welcher Körper soll deinen Bodygraph zeigen?"), body: radioCards("bodyProfile", [["female", t("Frau"), "♀"], ["male", t("Mann"), "♂"]], data.bodyProfile, "rf920-onboarding__choices--profiles") };
      case 5:
        return { title: t("Wie viel wiegst du?"), body: `<div class="rf920-onboarding__weight"><label class="rf920-onboarding__number"><span>${t("Körpergewicht")}</span><input name="bodyweight" type="number" inputmode="decimal" min="30" max="550" step="0.1" value="${escapeAttr(data.bodyweight)}" required autofocus></label><label><span>${t("Einheit")}</span><select name="unit"><option value="kg" ${data.unit === "kg" ? "selected" : ""}>kg</option><option value="lb" ${data.unit === "lb" ? "selected" : ""}>lb</option></select></label></div>` };
      case 6:
        return { title: t("Wie viel Trainingserfahrung hast du?"), body: radioCards("experience", [["Einsteiger", t("Einsteiger"), "1"], ["Fortgeschritten", t("Fortgeschritten"), "2"], ["Erfahren", t("Erfahren"), "3"]], data.experience) };
      case 7:
        return { title: t("Wie oft möchtest du pro Woche trainieren?"), body: radioCards("sessions", [1, 2, 3, 4, 5, 6, 7].map(value => [String(value), String(value), "×"]), data.sessions, "rf920-onboarding__choices--sessions") };
      default:
        return {
          title: t("An welchen Tagen trainierst du meistens?"),
          body: `<div class="rf920-onboarding__days">${days.map(([value, label]) => `<label><input type="checkbox" name="trainingDay" value="${value}" ${data.trainingDays.includes(value) ? "checked" : ""}><span>${escapeHtml(t(label))}</span></label>`).join("")}</div>`
        };
    }
  }

  function renderOnboarding(app) {
    const state = onboardingState(app);
    const total = 9;
    const step = clamp(Number(state.step || 0), 0, total - 1);
    const question = onboardingQuestion(app, step);
    const progress = Math.round(((step + 1) / total) * 100);
    const root = document.getElementById("app");
    root.innerHTML = `<main class="v7-gate rf920-onboarding"><section class="rf920-onboarding__card"><header class="rf920-onboarding__brand"><span class="brand__mark rf82-brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path class="rf82-mark-main" d="M7 18 52 7 35 25h15L19 57l8-22H12l13-10Z"/><path class="rf82-mark-cut" d="M23 24h16l-8 8H17Z"/></svg></span><div><strong>EVORANK</strong><small>${escapeHtml(t("Dein Training. Dein Rank."))}</small></div></header><div class="rf920-onboarding__progress" role="progressbar" aria-label="${escapeAttr(t("Einrichtung"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i><b style="width:${progress}%"></b></i></div><div class="rf920-onboarding__intro"><small>${escapeHtml(t("DEIN START"))}</small><p>${escapeHtml(t("Nur eine kurze Frage nach der anderen."))}</p></div><form data-form="rf920-onboarding" class="rf920-onboarding__form"><h1>${escapeHtml(question.title)}</h1><div class="rf920-onboarding__question">${question.body}</div><footer>${step > 0 ? `<button type="button" class="button button--ghost" data-action="rf920-onboarding-back">${icon("chevronLeft", 17)} ${escapeHtml(t("Zurück"))}</button>` : "<span></span>"}<button class="button button--primary" type="submit">${escapeHtml(step === total - 1 ? t("EVORANK starten") : t("Weiter"))} ${icon("chevronRight", 17)}</button></footer></form><div class="rf920-onboarding__privacy">${icon("lock", 15)} <span>${escapeHtml(t("Deine Antworten bleiben lokal auf diesem Gerät."))}</span></div></section></main>${app.renderToast?.() || ""}`;
    I18N?.translateRoot?.(root);
  }

  function readStep(app, form) {
    const state = onboardingState(app);
    const data = new FormData(form);
    const step = Number(state.step || 0);
    if (step === 0) {
      state.answers.language = String(data.get("language") || "de");
      I18N?.setLanguage?.(state.answers.language, { rerender: false });
    } else if (step === 1) state.answers.age = clamp(Math.round(Number(data.get("age") || 25)), 13, 100);
    else if (step === 2) state.answers.goal = String(data.get("goal") || "Muskelaufbau");
    else if (step === 3) state.answers.source = String(data.get("source") || "other");
    else if (step === 4) state.answers.bodyProfile = data.get("bodyProfile") === "female" ? "female" : "male";
    else if (step === 5) {
      state.answers.unit = data.get("unit") === "lb" ? "lb" : "kg";
      state.answers.bodyweight = clamp(Number(data.get("bodyweight") || 75), 30, state.answers.unit === "lb" ? 550 : 250);
    } else if (step === 6) state.answers.experience = ["Einsteiger", "Fortgeschritten", "Erfahren"].includes(String(data.get("experience"))) ? String(data.get("experience")) : "Fortgeschritten";
    else if (step === 7) state.answers.sessions = clamp(Math.round(Number(data.get("sessions") || 3)), 1, 7);
    else {
      const days = data.getAll("trainingDay").map(Number).filter(day => day >= 0 && day <= 6);
      if (!days.length) {
        app.showToast(t("Bitte wähle mindestens einen Trainingstag."));
        return false;
      }
      state.answers.trainingDays = days;
    }
    return true;
  }

  function completeOnboarding(app) {
    const answers = onboardingState(app).answers;
    const goalSettings = {
      "Muskelaufbau": { rest: 90, rir: 2, reps: "8–12" },
      "Stärker werden": { rest: 150, rir: 2, reps: "3–6" },
      "Allgemeine Fitness": { rest: 75, rir: 3, reps: "10–15" },
      "Kraft & Technik": { rest: 120, rir: 3, reps: "4–8" }
    };
    const preset = goalSettings[answers.goal] || goalSettings.Muskelaufbau;
    const unit = answers.unit === "lb" ? "lb" : "kg";
    app.state.profile.age = answers.age;
    app.state.profile.unit = unit;
    app.state.profile.bodyweightKg = clamp(fromDisplayWeight(Number(answers.bodyweight || 75), unit), 30, 250) || 75;
    app.state.profile.goal = answers.goal;
    app.state.profile.experience = answers.experience;
    app.state.profile.bodyProfile = answers.bodyProfile;
    app.state.profile.sex = answers.bodyProfile;
    app.state.profile.trainingDays = [...answers.trainingDays];
    app.state.personalization = {
      ...(app.state.personalization || {}),
      source: answers.source,
      sessionsPerWeek: answers.sessions,
      focus: answers.goal,
      coachingStyle: "balanced",
      feeling: "motivated",
      repRange: preset.reps,
      completedAt: new Date().toISOString()
    };
    app.state.settings.defaultRestSeconds = preset.rest;
    app.state.settings.targetRir = preset.rir;
    if (app.state.reminders) app.state.reminders.days = [...answers.trainingDays];
    app.state.onboardingComplete = true;
    app.state.settings.introX55Pending = true;
    app.state.appVersion = VERSION;
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.ui.rf920Onboarding = null;
    app.scheduleSave?.();
    app.render();
    applyLaunchShortcut(app);
    app.showToast(t("Profil eingerichtet"));
  }

  function applyLaunchShortcut(app) {
    if (!app?.state?.onboardingComplete || app.ui.rf920LaunchShortcutApplied) return;
    const hash = String(location.hash || "").toLowerCase();
    if (!hash) return;
    app.ui.rf920LaunchShortcutApplied = true;
    if (hash === "#bodygraph") {
      app.ui.view = "ranks";
      app.ui.rankTab = "bodygraph";
      app.render();
    } else if (hash === "#quick-workout") {
      app.startBlankWorkout?.();
    }
    try {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    } catch {}
  }

  const proto = AppClass.prototype;
  const previous = {
    render: proto.render,
    init: proto.init,
    updateMetrics: proto.updateMetrics,
    renderHome: proto.renderHome,
    renderProfile: proto.renderProfile,
    renderBodygraph: proto.renderBodygraph,
    handleClick: proto.handleClick,
    handleSubmit: proto.handleSubmit,
    renderWhatsNew: proto.renderRf80WhatsNew
  };

  proto.updateMetrics = function(...args) {
    const result = previous.updateMetrics.apply(this, args);
    const status = rollingStreakStatus(this.metrics?.workouts || this.state?.workouts || []);
    this.metrics.streak = status.count;
    this.metrics.rollingStreak = status;
    if (this.state?.cachedMetrics) this.state.cachedMetrics.streak = status.count;
    return result;
  };

  proto.renderStreakModal = function() {
    const status = this.metrics?.rollingStreak || rollingStreakStatus(this.state?.workouts || []);
    const deadline = status.active
      ? (status.daysRemaining <= 1 ? t("Heute trainieren, um die Streak zu halten") : `${t("Nächstes Training in")} ${status.daysRemaining} ${t("Tagen")}`)
      : t("Das nächste abgeschlossene Training startet deine Streak");
    return `<button class="modal-card-close" data-action="close-modal">${icon("x", 20)}</button><div class="streak-big ${status.active ? "is-streak-active" : ""}">${streakFlameIcon(45)}</div><small>${escapeHtml(t("DEINE TRAININGS-STREAK"))}</small><h2>${status.active ? `${status.count}er ${escapeHtml(t("Streak"))}` : escapeHtml(t("Noch keine Streak"))}</h2><p class="modal-card-copy">${escapeHtml(t("Dein erstes abgeschlossenes Training zündet die Flamme. Danach hält jeweils ein weiteres Training innerhalb von sieben Tagen deine Streak am Leben."))}</p><div class="rf920-streak-window ${status.active ? "is-active" : ""}"><strong>${escapeHtml(deadline)}</strong><span>${escapeHtml(t("Der Zeitraum beginnt immer mit deinem letzten abgeschlossenen Training – nicht am Montag."))}</span></div><button class="button button--primary button--wide" data-action="open-routine-picker">${escapeHtml(t("Nächstes Workout starten"))}</button>`;
  };

  function applyRollingStreakUi(app) {
    const status = app.metrics?.rollingStreak || rollingStreakStatus(app.state?.workouts || []);
    const root = document.getElementById("app");
    if (!root) return;

    const header = root.querySelector('[data-action="open-streak"]');
    if (header) {
      header.classList.toggle("is-streak-active", status.active);
      const flame = header.querySelector(".icon");
      if (flame) flame.outerHTML = streakFlameIcon(18);
      header.setAttribute("aria-label", status.active
        ? `${status.count}er Trainings-Streak, noch ${status.daysRemaining} Tage bis zum nächsten Training`
        : "Keine aktive Trainings-Streak");
    }

    const weeklyLabel = root.querySelector(".week-section .section-heading > span");
    if (weeklyLabel) {
      weeklyLabel.classList.toggle("is-streak-active", status.active);
      weeklyLabel.innerHTML = `${escapeHtml(rollingStreakLabel(status))} ${streakFlameIcon(15)}`;
    }

    for (const article of root.querySelectorAll(".analysis-grid article")) {
      if (article.querySelector("small")?.textContent?.trim() !== "STREAK") continue;
      const unit = article.querySelector("span");
      if (unit) unit.textContent = t("Trainings");
    }
  }

  proto.renderV7Onboarding = function() {
    renderOnboarding(this);
  };

  proto.renderHome = function(...args) {
    return previous.renderHome.apply(this, args)
      .replace("Sicherheit verbessert", "Bodygraph & Einstieg verfeinert")
      .replace("Verschlüsselte Backups · geprüfte Imports", "Exakte Körperflächen · Holz-Start · sechs Sprachen");
  };

  proto.renderProfile = function(...args) {
    let html = previous.renderProfile.apply(this, args);
    const language = I18N?.language || "de";
    const card = `<section class="rf920-language-card"><span>${icon("settings", 20)}</span><div><strong>${escapeHtml(t("App-Sprache"))}</strong><small>${escapeHtml(t("Die gesamte Oberfläche wird auf diesem Gerät umgestellt."))}</small></div><select data-rf920-language aria-label="${escapeAttr(t("Sprache"))}" data-rf920-no-translate>${I18N?.optionsMarkup?.(language) || ""}</select></section>`;
    if (/<p class="data-note">/.test(html)) return html.replace(/<p class="data-note">/, `${card}<p class="data-note">`);
    return `${html}${card}`;
  };

  proto.renderBodygraph = function(...args) {
    const template = document.createElement("template");
    template.innerHTML = previous.renderBodygraph.apply(this, args)
      .replace("Jede Muskelgruppe hat eine klare, matte Farbe. Dein Exercise Rank ersetzt diese Basisfarbe durch die passende Rank-Farbe; die Kontur zeigt die Auswahl zusätzlich an.", "Holz ist die einheitliche Startfarbe ohne Rank. Erst dein Exercise Rank färbt die jeweilige Muskelfläche in der passenden Rank-Farbe.")
      .replace("Farben der Muskelgruppen", "Startfarbe der Muskeln")
      .replace("14 eindeutige Basisfarben als Legende", "Holz bedeutet: noch kein Rank");
    template.content.querySelector(".rf80-muscle-key")?.remove();
    return template.innerHTML;
  };

  proto.handleClick = async function(event) {
    const action = event.target?.closest?.("[data-action]")?.dataset?.action;
    if (action === "rf920-onboarding-back") {
      event.preventDefault();
      const state = onboardingState(this);
      state.step = Math.max(0, Number(state.step || 0) - 1);
      this.render();
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.('form[data-form="rf920-onboarding"]');
    if (!form) return previous.handleSubmit.call(this, event);
    event.preventDefault();
    const state = onboardingState(this);
    if (!readStep(this, form)) return;
    if (Number(state.step || 0) >= 8) completeOnboarding(this);
    else {
      state.step = Number(state.step || 0) + 1;
      this.render();
    }
  };

  proto.render = function(...args) {
    if (this.state) {
      this.state.appVersion = VERSION;
      this.state.schemaVersion = Math.max(SCHEMA, Number(this.state.schemaVersion || 0));
    }
    const result = previous.render.apply(this, args);
    applyRollingStreakUi(this);
    document.documentElement.dataset.rfVersion = VERSION;
    document.documentElement.dataset.designLock = "stable";
    queueMicrotask(() => I18N?.translateRoot?.());
    return result;
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    if (this.state) {
      this.state.appVersion = VERSION;
      this.state.schemaVersion = Math.max(SCHEMA, Number(this.state.schemaVersion || 0));
      this.state.profile ||= {};
      this.state.profile.language ||= I18N?.language || "de";
      this.scheduleSave?.();
    }
    this.render();
    applyLaunchShortcut(this);
    return result;
  };

  proto.renderRf80WhatsNew = function() {
    return `${this.modalHeader("EVORANK 9.2.0", t("Neu in dieser Version"))}<div class="modal-scroll rf80-centre"><div class="rf80-release-list"><article><span>${icon("bodygraph", 18)}</span><div><strong>Körperflächen exakt angepasst</strong><small>Der Männerkörper nutzt pixelgenaue Muskelmasken; der rechte weibliche Lat folgt jetzt seiner eigenen Kontur.</small></div></article><article><span>${icon("palette", 18)}</span><div><strong>Holz als neutraler Start</strong><small>Ungewertete Muskeln besitzen überall dieselbe Wood-Farbe. Erst ein Rank verändert die Farbe.</small></div></article><article><span>${icon("settings", 18)}</span><div><strong>Sechs App-Sprachen</strong><small>Deutsch plus Englisch, Chinesisch, Hindi, Spanisch und Arabisch funktionieren offline.</small></div></article><article><span>${icon("chevronRight", 18)}</span><div><strong>Frage für Frage</strong><small>Neue Profile werden mit einer einzigen kurzen Frage pro Schritt eingerichtet.</small></div></article></div><div class="rf80-centre-actions"><button class="button button--primary button--wide" data-action="rf80-whats-new-done">${escapeHtml(t("Verstanden"))}</button></div></div>`;
  };

  document.addEventListener("rankforge:language", event => {
    const app = window.RANKFORGE_APP;
    if (!app?.state) return;
    app.state.profile.language = event.detail?.language || "de";
    if (app.ui?.rf920Onboarding?.answers) app.ui.rf920Onboarding.answers.language = app.state.profile.language;
    app.scheduleSave?.();
  });

  window.RANKFORGE920 = Object.freeze({
    version: VERSION,
    schema: SCHEMA,
    woodColor: WOOD,
    maleBodyFigure,
    femaleLat: Object.freeze({ left: FEMALE_LAT_LEFT, right: FEMALE_LAT_LEFT, rightTransform: FEMALE_LAT_RIGHT_TRANSFORM }),
    streakWindowMs: STREAK_WINDOW_MS,
    rollingStreakStatus,
    languages: I18N?.languages || []
  });

  if (window.RANKFORGE_APP?.state) {
    window.RANKFORGE_APP.state.appVersion = VERSION;
    window.RANKFORGE_APP.state.schemaVersion = Math.max(SCHEMA, Number(window.RANKFORGE_APP.state.schemaVersion || 0));
    window.RANKFORGE_APP.render();
  }
})(LiftoffApp);
/* end-rankforge-v920 */

/* rankforge-v960-runtime */
/* RANKFORGE 9.6 - optional workout timer and conservative unilateral rank calibration. */
(function installRankforge960(AppClass) {
  "use strict";

  const proto = AppClass.prototype;
  const previous = {
    applyV73WorkoutRest: proto.applyV73WorkoutRest,
    renderV73RestSetup: proto.renderV73RestSetup,
    renderWorkout: proto.renderWorkout,
    renderWorkoutExercise: proto.renderWorkoutExercise,
    renderRestTimer: proto.renderRestTimer,
    renderV7CustomExercise: proto.renderV7CustomExercise,
    startRest: proto.startRest,
    handleInput: proto.handleInput,
    handleChange: proto.handleChange,
    handleSubmit: proto.handleSubmit,
    render: proto.render,
    init: proto.init,
    scoreLift
  };

  const PROVISIONAL_RANK_CAP = 699;
  const REST_PRESETS = [30, 60, 90, 120, 180, 300];

  function workoutTimerEnabled(app) {
    if (app.state?.draft && typeof app.state.draft.restTimerEnabled === "boolean") {
      return app.state.draft.restTimerEnabled;
    }
    return app.state?.settings?.workoutTimerEnabled !== false;
  }

  function stopWorkoutTimer(app, reason = "timer-disabled") {
    if (!app.ui?.restTimer) return;
    app.postNativeTimer?.("end", { ...app.timerSnapshot?.(), reason });
    app.ui.restTimer = null;
    app.persistRestTimer?.();
  }

  function ensureRankforge960(app) {
    if (!app?.state) return;
    app.state.settings ||= {};
    app.state.settings.workoutTimerEnabled ??= true;
    if (app.state.draft) app.state.draft.restTimerEnabled ??= app.state.settings.workoutTimerEnabled !== false;

    for (const exercise of app.state.customExercises || []) {
      const automaticReference = Number(defaultReferenceForMuscle(exercise.muscle) || 25);
      if (typeof exercise.referenceManual !== "boolean") {
        exercise.referenceManual = exercise.rankCalibration === "calibrated"
          && Math.abs(Number(exercise.reference1RMKg || 0) - automaticReference) > 0.25;
      }
      if (!exercise.referenceManual) exercise.rankCalibration = "estimated";
      exercise.executionMode = exercise.executionMode === "unilateral" ? "unilateral" : "bilateral";
    }

    for (const draftExercise of app.state.draft?.exercises || []) {
      const custom = (app.state.customExercises || []).find(item => item.id === draftExercise.exerciseId);
      if (!custom) continue;
      draftExercise.executionMode = custom.executionMode;
      draftExercise.rankCalibration = custom.rankCalibration;
      draftExercise.referenceManual = custom.referenceManual;
      draftExercise.reference1RMKg = custom.reference1RMKg;
    }
  }

  function updateTimerForm(form) {
    if (!form) return;
    const enabled = Boolean(form.elements?.timerEnabled?.checked);
    form.classList.toggle("is-timer-disabled", !enabled);
    form.querySelectorAll("[data-rf960-timer-options]").forEach(element => { element.hidden = !enabled; });
    const preview = form.querySelector("[data-v73-rest-preview]");
    if (preview && !enabled) preview.textContent = "Aus";
    else if (preview) preview.textContent = formatDuration(window.RANKFORGE_APP?.readV73RestForm?.(form) || 120);
    const button = form.querySelector(".v73-rest-footer .button");
    if (button) {
      const active = form.dataset.mode === "active";
      button.textContent = enabled
        ? (active ? "Timer übernehmen" : `Workout mit ${preview?.textContent || "Timer"} starten`)
        : (active ? "Timer ausschalten" : "Workout ohne Timer starten");
    }
  }

  function exerciseForLift(lift = {}) {
    const liveCustom = window.RANKFORGE_APP?.state?.customExercises?.find(item => item.id === lift.exerciseId);
    return liveCustom || lift.exercise || exerciseIndex.get(lift.exerciseId) || {};
  }

  function isProvisionalRank(lift, exercise) {
    if (exercise?.rankCalibration === "estimated" || lift?.rankCalibration === "estimated") return true;
    if (exercise?.isCustom && exercise.referenceManual !== true) return true;
    if (/^custom(?:-|$)/i.test(String(lift?.exerciseId || "")) && exercise?.referenceManual !== true) return true;
    return false;
  }

  scoreLift = function(lift, bodyweightKg) {
    const exercise = exerciseForLift(lift);
    const mode = lift?.executionMode || exercise?.executionMode || "bilateral";
    const normalizedLift = mode === "unilateral"
      ? { ...lift, executionMode: "bilateral", exercise: { ...exercise, executionMode: "bilateral" } }
      : lift;
    const score = previous.scoreLift(normalizedLift, bodyweightKg);
    return isProvisionalRank(lift, exercise) ? Math.min(PROVISIONAL_RANK_CAP, score) : score;
  };

  proto.applyV73WorkoutRest = function(seconds, enabled = workoutTimerEnabled(this)) {
    const value = previous.applyV73WorkoutRest.call(this, seconds);
    const active = Boolean(enabled);
    this.state.settings.workoutTimerEnabled = active;
    this.state.settings.autoStartRest = active;
    if (this.state.draft) this.state.draft.restTimerEnabled = active;
    if (!active) stopWorkoutTimer(this);
    return value;
  };

  proto.renderV73RestSetup = function(modal = {}) {
    const value = normalizeRestSeconds(modal.seconds || this.getV73WorkoutRestSeconds());
    const parts = splitRestSeconds(value);
    const active = modal.mode === "active";
    const enabled = active ? workoutTimerEnabled(this) : this.state.settings.workoutTimerEnabled !== false;
    const title = active ? "Pausentimer ändern" : "Pausentimer";
    return `${this.modalHeader(active ? "LIVE WORKOUT" : "WORKOUT STARTEN", title)}
      <form class="modal-form v73-rest-setup rf960-timer-setup ${enabled ? "" : "is-timer-disabled"}" data-form="v73-workout-rest-setup" data-mode="${active ? "active" : "start"}" data-launch="${escapeAttr(modal.launch || "")}" data-routine-id="${escapeAttr(modal.routineId || "")}" data-exercise-id="${escapeAttr(modal.exerciseId || "")}">
        <section class="v73-rest-hero"><div class="v73-rest-hero__icon">${icon("timer", 25)}</div><div class="v73-rest-hero__copy"><strong>Timer verwenden?</strong><small>Du entscheidest bei jedem Workout neu.</small></div><output data-v73-rest-preview>${enabled ? formatDuration(value) : "Aus"}</output></section>
        <div class="modal-scroll v73-rest-scroll">
          <label class="toggle-field rf960-timer-toggle"><input data-action="rf960-timer-enabled" name="timerEnabled" type="checkbox" ${enabled ? "checked" : ""}><span></span><div><strong>${enabled ? "Ja, Pausentimer verwenden" : "Nein, ohne Timer trainieren"}</strong><small>Ist der Timer aus, startet nach einem Satz keine Pause.</small></div></label>
          <div class="rf960-timer-options" data-rf960-timer-options ${enabled ? "" : "hidden"}>
            <div class="v73-time-fields"><label class="v73-time-field"><span>Minuten</span><input data-action="v73-rest-input" name="minutes" type="number" inputmode="numeric" min="0" max="5" step="1" value="${parts.minutes}" aria-label="Pausenminuten"><b>MIN</b></label><label class="v73-time-field"><span>Sekunden</span><input data-action="v73-rest-input" name="seconds" type="number" inputmode="numeric" min="0" max="59" step="1" value="${parts.seconds}" aria-label="Pausensekunden"><b>SEK</b></label></div>
            <div class="v73-rest-presets" aria-label="Schnellauswahl">${REST_PRESETS.map(seconds => `<button type="button" data-action="v73-rest-preset" data-seconds="${seconds}" class="${seconds === value ? "is-active" : ""}">${formatDuration(seconds)}</button>`).join("")}</div>
            <div class="v73-auto-rest-note"><span>${icon("check", 16)}</span><div><strong>Automatischer Start</strong>Nach jedem abgehakten Satz beginnt die gewählte Pause.</div></div>
            <section class="v73-signal-card"><small>SIGNAL AM ENDE</small><label class="toggle-field"><input name="sound" type="checkbox" ${this.state.settings.sound ? "checked" : ""}><span></span><div><strong>Kräftiger Ding-Ton</strong><small>Mehrstufiges Signal, das sich von Musik abhebt.</small></div></label><label class="toggle-field"><input name="haptics" type="checkbox" ${this.state.settings.haptics ? "checked" : ""}><span></span><div><strong>Vibration</strong><small>Wenn Gerät und Browser Vibration unterstützen.</small></div></label><label class="toggle-field"><input name="restNotifications" type="checkbox" ${this.state.settings.restNotifications ? "checked" : ""}><span></span><div><strong>Mitteilung</strong><small>Zusätzlicher Hinweis, wenn Mitteilungen erlaubt sind.</small></div></label><button class="v73-test-signal" type="button" data-action="v73-test-alarm">${icon("bell", 17)} Signal testen</button></section>
          </div>
          <div class="rf960-no-timer-note" data-rf960-timer-options-off ${enabled ? "hidden" : ""}>${icon("check", 18)}<div><strong>Training ohne Pausentimer</strong><small>Alle Übungen und Ranks funktionieren weiter. Es läuft nur kein Countdown.</small></div></div>
        </div>
        <footer class="v73-rest-footer"><button class="button button--primary button--wide" type="submit">${enabled ? (active ? "Timer übernehmen" : `Workout mit ${formatDuration(value)} starten`) : (active ? "Timer ausschalten" : "Workout ohne Timer starten")}</button></footer>
      </form>`;
  };

  proto.renderWorkout = function(...args) {
    ensureRankforge960(this);
    let html = previous.renderWorkout.apply(this, args);
    if (workoutTimerEnabled(this)) return html;
    const strip = `<button class="v73-workout-rest-strip rf960-timer-off-strip" data-action="v73-edit-workout-rest" aria-label="Pausentimer einschalten"><span>${icon("timer", 19)}</span><div><small>TIMER AUS</small><strong>Workout ohne Pausentimer</strong></div><em>Aus</em>${icon("chevronRight", 17)}</button>`;
    return html.replace(/<button class="v73-workout-rest-strip"[\s\S]*?<\/button>/, strip);
  };

  proto.renderWorkoutExercise = function(...args) {
    let html = previous.renderWorkoutExercise.apply(this, args);
    if (workoutTimerEnabled(this)) return html;
    return html.replace(/<button data-action="start-rest"[\s\S]*?<\/button><button class="exercise-rest-edit"[\s\S]*?<\/button>/, '<span class="rf960-exercise-timer-off">Timer aus</span>');
  };

  proto.renderRestTimer = function(...args) {
    if (!workoutTimerEnabled(this)) return "";
    return previous.renderRestTimer.apply(this, args);
  };

  proto.startRest = function(...args) {
    if (this.state?.draft && !workoutTimerEnabled(this)) return;
    return previous.startRest.apply(this, args);
  };

  proto.renderV7CustomExercise = function(modal = {}) {
    let html = previous.renderV7CustomExercise.call(this, modal);
    const editing = modal.editId ? this.state.customExercises.find(item => item.id === modal.editId) : null;
    const mode = editing?.executionMode === "unilateral" ? "unilateral" : "bilateral";
    const selector = `<fieldset class="rf960-custom-mode"><legend>AUSFÜHRUNG & GEWICHT</legend><div><label><input type="radio" name="executionMode" value="bilateral" ${mode === "bilateral" ? "checked" : ""}><span>Beidseitig<small>Eingegebenes Gesamtgewicht</small></span></label><label><input type="radio" name="executionMode" value="unilateral" ${mode === "unilateral" ? "checked" : ""}><span>Einseitig<small>Gewicht pro Seite</small></span></label></div><p>Einseitiges Gewicht wird nicht mehr künstlich verdoppelt. So entstehen keine unrealistischen Schulter-Ranks.</p></fieldset>`;
    if (editing && editing.referenceManual !== true) {
      html = html.replace(/(name="reference1RMKg"[^>]*value=")[^"]*/, "$1");
    }
    return html.replace('<details class="advanced-exercise-settings"', `${selector}<details class="advanced-exercise-settings"`)
      .replace("Referenz-1RM (kg)", "Referenz-1RM (kg, optional)")
      .replace('placeholder="automatisch"', 'placeholder="automatisch und konservativ"');
  };

  proto.handleInput = function(event) {
    const result = previous.handleInput.call(this, event);
    if (event.target?.closest?.('form[data-form="v73-workout-rest-setup"]')) updateTimerForm(event.target.form);
    return result;
  };

  proto.handleChange = async function(event) {
    if (event.target?.dataset?.action === "rf960-timer-enabled") {
      const form = event.target.form;
      const copy = form?.querySelector(".rf960-timer-toggle div strong");
      if (copy) copy.textContent = event.target.checked ? "Ja, Pausentimer verwenden" : "Nein, ohne Timer trainieren";
      form?.querySelectorAll("[data-rf960-timer-options]").forEach(element => { element.hidden = !event.target.checked; });
      form?.querySelectorAll("[data-rf960-timer-options-off]").forEach(element => { element.hidden = event.target.checked; });
      updateTimerForm(form);
      return;
    }
    return previous.handleChange.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.("form[data-form]");
    if (form?.dataset?.form === "v73-workout-rest-setup") {
      const enabled = new FormData(form).get("timerEnabled") === "on";
      this.state.settings.workoutTimerEnabled = enabled;
      if (!enabled) this.state.settings.autoStartRest = false;
      const result = await previous.handleSubmit.call(this, event);
      if (this.state.draft) this.state.draft.restTimerEnabled = enabled;
      this.state.settings.workoutTimerEnabled = enabled;
      this.state.settings.autoStartRest = enabled;
      if (!enabled) stopWorkoutTimer(this);
      this.scheduleSave?.();
      this.render();
      this.showToast(enabled ? `Pausentimer ${formatDuration(this.getV73WorkoutRestSeconds())} aktiv` : "Workout ohne Timer gestartet");
      return result;
    }

    if (form?.dataset?.form === "v7-custom-exercise") {
      const data = new FormData(form);
      const editId = form.dataset.editId || "";
      const name = String(data.get("name") || "").trim();
      const mode = data.get("executionMode") === "unilateral" ? "unilateral" : "bilateral";
      const manualReference = Number(data.get("reference1RMKg")) > 0;
      const customIdsBefore = new Set((this.state.customExercises || []).map(item => item.id));
      const result = await previous.handleSubmit.call(this, event);
      const exercise = editId
        ? this.state.customExercises.find(item => item.id === editId)
        : [...(this.state.customExercises || [])].reverse().find(item => item.name === name && !customIdsBefore.has(item.id));
      if (exercise) {
        exercise.executionMode = mode;
        exercise.referenceManual = manualReference;
        exercise.rankCalibration = manualReference ? "calibrated" : "estimated";
        if (!manualReference) {
          exercise.reference1RMKg = Math.max(Number(exercise.reference1RMKg || 0), Number(defaultReferenceForMuscle(exercise.muscle) || 25));
        }
        for (const draftExercise of this.state.draft?.exercises || []) {
          if (draftExercise.exerciseId !== exercise.id) continue;
          draftExercise.executionMode = mode;
          draftExercise.referenceManual = manualReference;
          draftExercise.rankCalibration = exercise.rankCalibration;
          draftExercise.reference1RMKg = exercise.reference1RMKg;
        }
        for (const routine of this.state.routines || []) {
          for (const routineExercise of routine.exercises || []) {
            if (routineExercise.exerciseId === exercise.id) routineExercise.executionMode = mode;
          }
        }
        this.scheduleSave?.();
        this.render();
      }
      return result;
    }

    return previous.handleSubmit.call(this, event);
  };

  proto.render = function(...args) {
    ensureRankforge960(this);
    return previous.render.apply(this, args);
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    ensureRankforge960(this);
    this.scheduleSave?.();
    this.render();
    return result;
  };

  window.RANKFORGE960 = Object.freeze({
    version: "9.6",
    provisionalRankCap: PROVISIONAL_RANK_CAP,
    workoutTimerEnabled,
    ensure: ensureRankforge960
  });
})(LiftoffApp);
/* end-rankforge-v960-runtime */
