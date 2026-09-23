/* RankForge 10.2 r1 — configurable home, balanced navigation and deliberate workout discard */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__rf1004Installed) return;

  const VERSION = "10.2";
  const BUILD = "1020-r1";
  const SCHEMA = 30;
  const SPORTS = Object.freeze(["strength", "swim", "run", "bike"]);
  const COLORS = Object.freeze({ strength: "#ff3b5f", swim: "#2f7dff", run: "#42c86b", bike: "#f2bd35" });
  const COPY = Object.freeze({
    de: {
      homeArea: "DEINE STARTSEITE", customize: "Anpassen", strength: "Muskelaufbau", swim: "Schwimmen", run: "Laufen", bike: "Radfahren",
      homeSettings: "Startseite anpassen", homeHint: "Wähle selbst, welche Trainingsbereiche vorne erscheinen. Mehrere Bereiche werden automatisch kompakt dargestellt.",
      visible: "Auf der Startseite", priority: "Zuerst anzeigen", chooseOne: "Wähle mindestens einen Bereich.", saved: "Startseite gespeichert",
      gymRank: "Dein Gym-Rank", sessions: "Einheiten in 28 Tagen", score: "Leistungspunkte", accountTitle: "Abmelden oder Account wechseln",
      accountHint: "Aktiven Account verwalten", discard: "Workout verwerfen", discardHint: "Test- oder Fehleintrag gezielt entfernen",
      discardReviewKicker: "SICHERHEITSPRÜFUNG", discardReviewTitle: "Workout wirklich verwerfen?", discardReviewText: "Das Workout wird aus deinem Verlauf entfernt. Gym-Rank, Muskel-Ranks, XP, PRs und Statistiken werden anschließend aus den verbleibenden Workouts neu berechnet.",
      inspect: "Auswirkungen prüfen", discardConfirmKicker: "LETZTE BESTÄTIGUNG", discardConfirmTitle: "Endgültig verwerfen", discardConfirmText: "Dieser Schritt kann nicht rückgängig gemacht werden. Dein Rang kann dadurch wieder sinken.",
      understand: "Ich verstehe, dass das Workout und seine Fortschritte entfernt werden.", discardFinal: "Workout endgültig verwerfen", cancelled: "Abbrechen", discarded: "Workout verworfen – Ranks neu berechnet"
    },
    en: {
      homeArea: "YOUR HOME", customize: "Customize", strength: "Strength", swim: "Swimming", run: "Running", bike: "Cycling",
      homeSettings: "Customize home", homeHint: "Choose which training areas appear first. Multiple areas are shown in a compact layout.",
      visible: "Shown on Home", priority: "Show first", chooseOne: "Choose at least one area.", saved: "Home saved", gymRank: "Your gym rank", sessions: "Sessions in 28 days", score: "Performance points", accountTitle: "Sign out or switch account", accountHint: "Manage active account",
      discard: "Discard workout", discardHint: "Deliberately remove a test or incorrect entry", discardReviewKicker: "SAFETY CHECK", discardReviewTitle: "Really discard this workout?", discardReviewText: "The workout will be removed from your history. Gym rank, muscle ranks, XP, PRs and statistics will then be recalculated from your remaining workouts.", inspect: "Review effects", discardConfirmKicker: "FINAL CONFIRMATION", discardConfirmTitle: "Discard permanently", discardConfirmText: "This cannot be undone. Your rank may decrease.", understand: "I understand that this workout and its progress will be removed.", discardFinal: "Discard workout permanently", cancelled: "Cancel", discarded: "Workout discarded – ranks recalculated"
    },
    zh: {
      homeArea:"你的首页",customize:"自定义",strength:"力量训练",swim:"游泳",run:"跑步",bike:"骑行",homeSettings:"自定义首页",homeHint:"选择首页显示的训练项目。多个项目会自动以紧凑布局显示。",visible:"显示在首页",priority:"优先显示",chooseOne:"请至少选择一个项目。",saved:"首页已保存",gymRank:"你的健身等级",sessions:"28天内训练",score:"表现分",accountTitle:"退出或切换账户",accountHint:"管理当前账户",discard:"删除训练",discardHint:"谨慎删除测试或错误记录",discardReviewKicker:"安全检查",discardReviewTitle:"确定删除这次训练？",discardReviewText:"训练将从历史中移除，等级、肌肉等级、XP、纪录和统计会重新计算。",inspect:"查看影响",discardConfirmKicker:"最终确认",discardConfirmTitle:"永久删除",discardConfirmText:"此操作无法撤销，等级可能下降。",understand:"我明白训练及其进度会被删除。",discardFinal:"永久删除训练",cancelled:"取消",discarded:"训练已删除，等级已重新计算"
    },
    hi: {
      homeArea:"आपका होम",customize:"बदलें",strength:"स्ट्रेंथ",swim:"तैराकी",run:"दौड़",bike:"साइकिल",homeSettings:"होम बदलें",homeHint:"चुनें कि होम पर कौन से ट्रेनिंग क्षेत्र दिखें। कई क्षेत्र अपने आप कॉम्पैक्ट दिखेंगे।",visible:"होम पर दिखाएँ",priority:"पहले दिखाएँ",chooseOne:"कम से कम एक क्षेत्र चुनें।",saved:"होम सेव हो गया",gymRank:"आपका जिम रैंक",sessions:"28 दिनों के सेशन",score:"प्रदर्शन अंक",accountTitle:"साइन आउट या अकाउंट बदलें",accountHint:"सक्रिय अकाउंट प्रबंधित करें",discard:"वर्कआउट हटाएँ",discardHint:"टेस्ट या गलत एंट्री सोच-समझकर हटाएँ",discardReviewKicker:"सुरक्षा जाँच",discardReviewTitle:"वर्कआउट सच में हटाएँ?",discardReviewText:"वर्कआउट इतिहास से हटेगा और रैंक, XP, PR व आँकड़े दोबारा गिने जाएँगे।",inspect:"प्रभाव जाँचें",discardConfirmKicker:"अंतिम पुष्टि",discardConfirmTitle:"हमेशा के लिए हटाएँ",discardConfirmText:"यह वापस नहीं हो सकता और रैंक घट सकता है।",understand:"मैं समझता हूँ कि वर्कआउट और उसकी प्रगति हट जाएगी।",discardFinal:"वर्कआउट हमेशा के लिए हटाएँ",cancelled:"रद्द करें",discarded:"वर्कआउट हटाया गया – रैंक दोबारा गिने गए"
    },
    es: {
      homeArea:"TU INICIO",customize:"Personalizar",strength:"Musculación",swim:"Natación",run:"Carrera",bike:"Ciclismo",homeSettings:"Personalizar inicio",homeHint:"Elige qué áreas aparecen al principio. Varias áreas se muestran automáticamente de forma compacta.",visible:"Mostrar en Inicio",priority:"Mostrar primero",chooseOne:"Elige al menos un área.",saved:"Inicio guardado",gymRank:"Tu rango de gimnasio",sessions:"Sesiones en 28 días",score:"Puntos de rendimiento",accountTitle:"Cerrar sesión o cambiar cuenta",accountHint:"Gestionar cuenta activa",discard:"Descartar entrenamiento",discardHint:"Eliminar de forma consciente una prueba o entrada errónea",discardReviewKicker:"CONTROL DE SEGURIDAD",discardReviewTitle:"¿Descartar este entrenamiento?",discardReviewText:"Se eliminará del historial y se recalcularán rango, rangos musculares, XP, récords y estadísticas.",inspect:"Revisar efectos",discardConfirmKicker:"CONFIRMACIÓN FINAL",discardConfirmTitle:"Descartar definitivamente",discardConfirmText:"No se puede deshacer y tu rango puede bajar.",understand:"Entiendo que se eliminarán el entrenamiento y su progreso.",discardFinal:"Descartar definitivamente",cancelled:"Cancelar",discarded:"Entrenamiento descartado; rangos recalculados"
    },
    ar: {
      homeArea:"صفحتك الرئيسية",customize:"تخصيص",strength:"القوة",swim:"السباحة",run:"الجري",bike:"الدراجة",homeSettings:"تخصيص الصفحة الرئيسية",homeHint:"اختر مجالات التدريب التي تظهر أولاً. تظهر المجالات المتعددة بتصميم مضغوط تلقائياً.",visible:"إظهار في الرئيسية",priority:"إظهار أولاً",chooseOne:"اختر مجالاً واحداً على الأقل.",saved:"تم حفظ الرئيسية",gymRank:"رتبتك في النادي",sessions:"جلسات خلال 28 يوماً",score:"نقاط الأداء",accountTitle:"تسجيل الخروج أو تبديل الحساب",accountHint:"إدارة الحساب الحالي",discard:"حذف التمرين",discardHint:"إزالة إدخال تجريبي أو خاطئ بشكل مقصود",discardReviewKicker:"فحص الأمان",discardReviewTitle:"هل تريد حذف التمرين؟",discardReviewText:"سيُحذف التمرين من السجل وتُعاد حساب الرتب وXP والأرقام القياسية والإحصاءات.",inspect:"مراجعة التأثير",discardConfirmKicker:"التأكيد الأخير",discardConfirmTitle:"حذف نهائي",discardConfirmText:"لا يمكن التراجع وقد تنخفض رتبتك.",understand:"أفهم أن التمرين وتقدمه سيُحذفان.",discardFinal:"حذف التمرين نهائياً",cancelled:"إلغاء",discarded:"حُذف التمرين وأُعيد حساب الرتب"
    }
  });

  const language = () => window.RANKFORGE_I18N?.language || "de";
  const text = key => (COPY[language()] || COPY.de)[key] || COPY.en[key] || key;
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
  const ordered = state => [state.primary, ...state.selected].filter((sport, index, list) => SPORTS.includes(sport) && list.indexOf(sport) === index);
  const glyph = (sport, size = 22) => {
    const paths = {
      strength:'<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',
      swim:'<path d="M2 8c2 0 2 1.5 4 1.5S8 8 10 8s2 1.5 4 1.5S16 8 18 8s2 1.5 4 1.5M2 16c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5"/>',
      run:'<circle cx="14" cy="4" r="2"/><path d="m12 8 3 2 3 1M12 8l-3 5 4 2-2 5M13 15l4 5M9 13l-4 3"/>',
      bike:'<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="m5.5 17.5 4-8h4l5 8M9.5 9.5l4 8M8 17.5h5.5M13.5 9.5 16 6h2"/>'
    };
    return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[sport] || paths.strength}</svg>`;
  };

  function ensure(app) {
    const planned = app.state?.trainingPlanV10?.activeSports;
    const fallback = Array.isArray(planned) && planned.length ? planned : ["strength"];
    const current = app.state.homeModulesV10 && typeof app.state.homeModulesV10 === "object" ? app.state.homeModulesV10 : {};
    const selected = Array.isArray(current.selected) ? current.selected.filter(sport => SPORTS.includes(sport)) : fallback.filter(sport => SPORTS.includes(sport));
    current.selected = [...new Set(selected.length ? selected : ["strength"])];
    current.primary = current.selected.includes(current.primary) ? current.primary : current.selected[0];
    app.state.homeModulesV10 = current;
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.state.appVersion = VERSION;
    return current;
  }

  function rankLabel(app) {
    const rank = app.metrics?.rank || {};
    const base = rank.title || rank.name || rank.key || "Gym-Rank";
    const division = rank.division && !String(base).includes(String(rank.division)) ? ` ${rank.division}` : "";
    return `${base}${division}`;
  }

  function moduleMeta(app, sport) {
    if (sport === "strength") return { symbol:glyph(sport,24), title:rankLabel(app), detail:`${Number(app.metrics?.rank?.lp || 0)} LP · ${text("gymRank")}` };
    const metrics = window.RANKFORGE970?.sportMetrics?.(sport, app);
    return {
      symbol: metrics?.current?.[0] || glyph(sport,24),
      title: metrics?.current?.[1] || text(sport),
      detail: `${Number(metrics?.recent?.length || 0)} ${text("sessions")} · ${Number(metrics?.score || 0)} ${text("score")}`
    };
  }

  function renderHomeModules(app) {
    const state = ensure(app);
    const sports = ordered(state);
    if (sports.length === 1 && sports[0] === "strength") {
      return `<section class="rf1004-home-modules rf1004-home-modules--strength-only" aria-label="${escape(text("homeArea"))}"><header><small>${escape(text("homeArea"))} · ${escape(text("strength"))}</small><button data-action="rf1004-home-settings">${escape(text("customize"))}</button></header></section>`;
    }
    const compact = sports.length > 1;
    const cards = sports.map(sport => {
      const meta = moduleMeta(app, sport);
      return `<button class="rf1004-home-module rf1004-home-module--${sport}" style="--module:${COLORS[sport]}" data-action="rf1004-open-sport" data-sport="${sport}"><span>${meta.symbol}</span><div><small>${escape(text(sport))}</small><strong>${escape(meta.title)}</strong><em>${escape(meta.detail)}</em></div><b aria-hidden="true">›</b></button>`;
    }).join("");
    return `<section class="rf1004-home-modules ${compact ? "is-compact" : "is-single"}" aria-label="${escape(text("homeArea"))}"><header><small>${escape(text("homeArea"))}</small><button data-action="rf1004-home-settings">${escape(text("customize"))}</button></header><div>${cards}</div></section>`;
  }

  function renderHomeSettings(app) {
    const state = ensure(app);
    return `${app.modalHeader(text("homeArea"), text("homeSettings"))}<form class="modal-form rf1004-home-form" data-form="rf1004-home-settings"><p>${escape(text("homeHint"))}</p><div class="rf1004-home-options">${SPORTS.map(sport => `<article style="--module:${COLORS[sport]}"><label class="rf1004-home-check"><input type="checkbox" name="homeSport" value="${sport}" ${state.selected.includes(sport) ? "checked" : ""}><span>${glyph(sport,22)}</span><strong>${escape(text(sport))}</strong><i>${escape(text("visible"))}</i></label><label class="rf1004-home-primary"><input type="radio" name="homePrimary" value="${sport}" ${state.primary === sport ? "checked" : ""}><span>${escape(text("priority"))}</span></label></article>`).join("")}</div><footer class="modal-footer modal-footer--row"><button type="button" class="button button--secondary" data-action="close-modal">${escape(text("cancelled"))}</button><button type="submit" class="button button--primary">${escape(text("saved"))}</button></footer></form>`;
  }

  function workoutName(app, workoutId) {
    return app.state.workouts?.find(item => String(item.id) === String(workoutId))?.name || "Workout";
  }

  function renderDiscardReview(app, workoutId) {
    return `${app.modalHeader(text("discardReviewKicker"), text("discardReviewTitle"))}<div class="modal-scroll rf1004-discard"><span class="rf1004-discard__icon">!</span><h3>${escape(workoutName(app, workoutId))}</h3><p>${escape(text("discardReviewText"))}</p><ul><li>Gym-Rank & Muskel-Ranks</li><li>XP, PRs & Trainingsstatistik</li><li>Kalender & Streak-Auswertung</li></ul></div><div class="modal-footer modal-footer--row"><button class="button button--secondary" data-action="close-modal">${escape(text("cancelled"))}</button><button class="button rf1004-danger-button" data-action="rf1004-discard-next" data-workout-id="${escape(workoutId)}">${escape(text("inspect"))}</button></div>`;
  }

  function renderDiscardConfirm(app, workoutId) {
    return `${app.modalHeader(text("discardConfirmKicker"), text("discardConfirmTitle"))}<form class="modal-form rf1004-discard-form" data-form="rf1004-discard" data-workout-id="${escape(workoutId)}"><p>${escape(text("discardConfirmText"))}</p><label><input type="checkbox" name="understood" required><span>✓</span><strong>${escape(text("understand"))}</strong></label><footer class="modal-footer modal-footer--row"><button type="button" class="button button--secondary" data-action="close-modal">${escape(text("cancelled"))}</button><button type="submit" class="button rf1004-danger-button">${escape(text("discardFinal"))}</button></footer></form>`;
  }

  function addClassToAction(html, action, className) {
    const expression = new RegExp(`<button([^>]*data-action=["']${action}["'][^>]*)>`, "i");
    return html.replace(expression, (match, attributes) => {
      if (/\bclass=["']/.test(attributes)) return match.replace(/class=["']([^"']*)["']/, `class="$1 ${className}"`);
      return `<button class="${className}"${attributes}>`;
    });
  }

  const proto = AppClass.prototype;
  proto.__rf1004Installed = true;
  const previous = {
    renderHome: proto.renderHome,
    renderProfile: proto.renderProfile,
    renderBottomNav: proto.renderBottomNav,
    renderModal: proto.renderModal,
    renderWorkoutDetailModal: proto.renderWorkoutDetailModal,
    renderWorkoutMenuModal: proto.renderWorkoutMenuModal,
    handleClick: proto.handleClick,
    handleSubmit: proto.handleSubmit,
    init: proto.init
  };

  proto.renderHome = function(...args) {
    ensure(this);
    let html = previous.renderHome.apply(this, args);
    if (["sports", "triathlon", "calendar"].includes(this.ui.view)) return html;
    html = html.replace(/<button class="rf970-home-card"[\s\S]*?<\/button>/, "");
    const state = this.state.homeModulesV10;
    if (!state.selected.includes("strength")) html = html.replace('class="screen home-screen"', 'class="screen home-screen rf1004-home-without-strength"');
    const modules = renderHomeModules(this);
    const rankMarker = '<button class="home-rank-card"';
    return html.includes(rankMarker) ? html.replace(rankMarker, `${modules}${rankMarker}`) : `${modules}${html}`;
  };

  proto.renderProfile = function(...args) {
    ensure(this);
    let html = previous.renderProfile.apply(this, args);
    const entry = `<button data-action="rf1004-home-settings"><span>${glyph("strength",20)}</span><div><strong>${escape(text("homeSettings"))}</strong><small>${escape(text("homeHint"))}</small></div><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>`;
    if (!html.includes('data-action="rf1004-home-settings"')) html = html.replace(/(<button[^>]*data-action="switch-account")/i, `${entry}$1`);
    html = addClassToAction(html, "switch-account", "rf1004-account-danger");
    html = html.replace(/<strong>Account wechseln(?: oder abmelden)?<\/strong>/i, `<strong>${escape(text("accountTitle"))}</strong>`).replace(/<small>Aktiv:[\s\S]*?<\/small>/i, `<small>${escape(text("accountHint"))}</small>`);
    return html;
  };

  proto.renderBottomNav = function(...args) {
    let html = previous.renderBottomNav.apply(this, args);
    html = html.replace(/<button class="nav-item rf970-nav[^"]*"[^>]*>[\s\S]*?<\/button>/, "");
    if (["sports", "triathlon", "calendar"].includes(this.ui.view)) {
      html = html.replace(/class="nav-item(?: is-active)?"([^>]*data-view="home")/, 'class="nav-item is-active"$1');
    }
    return html;
  };

  proto.renderWorkoutDetailModal = function(workoutId) {
    let html = previous.renderWorkoutDetailModal.call(this, workoutId);
    const action = `<button class="rf1004-discard-entry" data-action="confirm-delete-workout" data-workout-id="${escape(workoutId)}"><span>!</span><div><strong>${escape(text("discard"))}</strong><small>${escape(text("discardHint"))}</small></div></button>`;
    return html.includes("rf1004-discard-entry") ? html : html.replace('<div class="modal-footer modal-footer--row">', `${action}<div class="modal-footer modal-footer--row">`);
  };

  proto.renderWorkoutMenuModal = function(workoutId) {
    return previous.renderWorkoutMenuModal.call(this, workoutId)
      .replace(/Workout löschen/g, text("discard"))
      .replace(/Kann nicht rückgängig gemacht werden/g, text("discardHint"));
  };

  proto.renderModal = function(...args) {
    const modal = this.ui?.modal;
    if (modal?.type === "rf1004-home-settings") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${renderHomeSettings(this)}</section></div>`;
    if (modal?.type === "rf1004-discard-review") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${renderDiscardReview(this, modal.workoutId)}</section></div>`;
    if (modal?.type === "rf1004-discard-confirm") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${renderDiscardConfirm(this, modal.workoutId)}</section></div>`;
    return previous.renderModal.apply(this, args);
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (action === "rf1004-home-settings") {
      event.preventDefault();
      ensure(this);
      this.openModal("rf1004-home-settings");
      return;
    }
    if (action === "rf1004-open-sport") {
      event.preventDefault();
      const sport = String(element.dataset.sport || "strength");
      if (sport === "strength") this.ui.view = "ranks";
      else {
        this.ui.rf970Sport = sport;
        if (this.state.triathlon) this.state.triathlon.activeSport = sport;
        this.ui.view = "triathlon";
      }
      this.render();
      window.scrollTo?.({ top:0, behavior:"smooth" });
      return;
    }
    if (action === "confirm-delete-workout") {
      event.preventDefault();
      this.openModal("rf1004-discard-review", { workoutId:element.dataset.workoutId });
      return;
    }
    if (action === "rf1004-discard-next") {
      event.preventDefault();
      this.openModal("rf1004-discard-confirm", { workoutId:element.dataset.workoutId });
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const homeForm = event.target?.closest?.('form[data-form="rf1004-home-settings"]');
    if (homeForm) {
      event.preventDefault();
      const data = new FormData(homeForm);
      const selected = data.getAll("homeSport").filter(sport => SPORTS.includes(sport));
      if (!selected.length) {
        this.showToast(text("chooseOne"));
        return;
      }
      const primaryChoice = String(data.get("homePrimary") || "");
      this.state.homeModulesV10 = { selected, primary:selected.includes(primaryChoice) ? primaryChoice : selected[0] };
      this.ui.modal = null;
      this.scheduleSave?.();
      this.render();
      this.showToast(text("saved"));
      return;
    }
    const discardForm = event.target?.closest?.('form[data-form="rf1004-discard"]');
    if (discardForm) {
      event.preventDefault();
      const data = new FormData(discardForm);
      if (data.get("understood") !== "on") return;
      const workoutId = discardForm.dataset.workoutId;
      this.deleteWorkout(workoutId);
      this.showToast(text("discarded"));
      return;
    }
    return previous.handleSubmit.call(this, event);
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    ensure(this);
    return result;
  };

  window.RANKFORGE1004 = Object.freeze({ version:VERSION, build:BUILD, schema:SCHEMA, sports:SPORTS, colors:COLORS, copy:COPY, ensure });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
