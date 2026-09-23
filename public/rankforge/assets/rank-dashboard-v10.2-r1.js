/* RankForge 10.2 r1 — optional dual rank dashboard and endurance rank overview */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__rf102Installed) return;

  const VERSION = "10.2";
  const BUILD = "1020-r1";
  const SCHEMA = 31;
  const SPORTS = Object.freeze(["strength", "swim", "run", "bike"]);
  const COLORS = Object.freeze({ strength:"#ff3b5f", swim:"#2f7dff", run:"#42c86b", bike:"#f2bd35" });
  const COLOR_2 = Object.freeze({ strength:"#c21f44", swim:"#10b7ee", run:"#149b4d", bike:"#ee8f2c" });
  const LANGUAGE_INDEX = Object.freeze({ de:1, en:2, zh:3, hi:4, es:5, ar:6 });
  const COPY = Object.freeze({
    de:{ title:"Deine Ränge", customize:"Ränge anpassen", settings:"Ränge auf der Startseite", hint:"Wähle einen oder zwei Ränge. Die große Rank-Karte bleibt der einzige Bereich über dem Bodygraph.", choose:"Mindestens einen Rang auswählen.", max:"Du kannst höchstens zwei Ränge gleichzeitig anzeigen.", saved:"Startseiten-Ränge gespeichert", strength:"Gym", swim:"Schwimmen", run:"Laufen", bike:"Radfahren", endurance:"Ausdauer-Ränge", open:"Alle Stufen öffnen", score:"Punkte", next:"bis", visible:"Anzeigen", cancel:"Abbrechen", save:"Speichern", profileHint:"Ein oder zwei echte Ränge gleichzeitig anzeigen" },
    en:{ title:"Your ranks", customize:"Customize ranks", settings:"Ranks on Home", hint:"Choose one or two ranks. The large rank card remains the only area above the bodygraph.", choose:"Select at least one rank.", max:"You can show no more than two ranks at once.", saved:"Home ranks saved", strength:"Gym", swim:"Swimming", run:"Running", bike:"Cycling", endurance:"Endurance ranks", open:"Open all levels", score:"points", next:"to", visible:"Show", cancel:"Cancel", save:"Save", profileHint:"Show one or two real ranks together" },
    zh:{ title:"你的等级", customize:"自定义等级", settings:"首页等级", hint:"选择一个或两个等级。身体图上方只保留大型等级卡。", choose:"请至少选择一个等级。", max:"最多可同时显示两个等级。", saved:"首页等级已保存", strength:"健身", swim:"游泳", run:"跑步", bike:"骑行", endurance:"耐力等级", open:"查看所有等级", score:"分", next:"距离", visible:"显示", cancel:"取消", save:"保存", profileHint:"同时显示一个或两个真实等级" },
    hi:{ title:"आपकी रैंक", customize:"रैंक बदलें", settings:"होम पर रैंक", hint:"एक या दो रैंक चुनें। बॉडीग्राफ के ऊपर केवल बड़ी रैंक कार्ड रहेगी।", choose:"कम से कम एक रैंक चुनें।", max:"एक साथ अधिकतम दो रैंक दिख सकती हैं।", saved:"होम रैंक सहेजी गई", strength:"जिम", swim:"तैराकी", run:"दौड़", bike:"साइक्लिंग", endurance:"एंड्योरेंस रैंक", open:"सभी स्तर खोलें", score:"अंक", next:"तक", visible:"दिखाएँ", cancel:"रद्द करें", save:"सहेजें", profileHint:"एक या दो असली रैंक साथ दिखाएँ" },
    es:{ title:"Tus rangos", customize:"Personalizar rangos", settings:"Rangos en Inicio", hint:"Elige uno o dos rangos. La tarjeta grande seguirá siendo la única sección sobre el bodygraph.", choose:"Selecciona al menos un rango.", max:"Puedes mostrar como máximo dos rangos a la vez.", saved:"Rangos de inicio guardados", strength:"Gym", swim:"Natación", run:"Carrera", bike:"Ciclismo", endurance:"Rangos de resistencia", open:"Ver todos los niveles", score:"puntos", next:"hasta", visible:"Mostrar", cancel:"Cancelar", save:"Guardar", profileHint:"Muestra uno o dos rangos reales juntos" },
    ar:{ title:"رتبك", customize:"تخصيص الرتب", settings:"رتب الصفحة الرئيسية", hint:"اختر رتبة واحدة أو رتبتين. تبقى بطاقة الرتبة الكبيرة هي القسم الوحيد فوق مخطط الجسم.", choose:"اختر رتبة واحدة على الأقل.", max:"يمكن عرض رتبتين كحد أقصى في الوقت نفسه.", saved:"تم حفظ رتب الصفحة الرئيسية", strength:"النادي", swim:"السباحة", run:"الجري", bike:"ركوب الدراجة", endurance:"رتب التحمل", open:"فتح كل المستويات", score:"نقطة", next:"حتى", visible:"عرض", cancel:"إلغاء", save:"حفظ", profileHint:"اعرض رتبة أو رتبتين حقيقيتين معاً" }
  });

  const language = () => window.RANKFORGE_I18N?.language || "de";
  const text = key => (COPY[language()] || COPY.de)[key] || COPY.de[key] || key;
  const esc = value => typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
  const attr = value => typeof escapeAttr === "function" ? escapeAttr(String(value ?? "")) : esc(value);

  function ensure(app) {
    if (!app?.state) return { selected:["strength"] };
    const current = app.state.homeRanksV102 && typeof app.state.homeRanksV102 === "object" ? app.state.homeRanksV102 : {};
    const selected = Array.isArray(current.selected) ? current.selected.filter(sport => SPORTS.includes(sport)) : [];
    current.selected = [...new Set(selected)].slice(0, 2);
    if (!current.selected.length) current.selected = ["strength"];
    app.state.homeRanksV102 = current;
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.state.appVersion = VERSION;
    return current;
  }

  function animalName(entry) {
    return entry?.[LANGUAGE_INDEX[language()] || 1] || entry?.[1] || "—";
  }

  function sportMetrics(app, sport) {
    return window.RANKFORGE970?.sportMetrics?.(sport, app) || { score:0, index:0, recent:[], current:["•", text(sport)], next:null };
  }

  function sportCard(app, sport) {
    const metrics = sportMetrics(app, sport);
    const progress = metrics.index >= 8 ? 100 : metrics.score % 100;
    const remaining = metrics.index >= 8 ? 0 : 100 - progress;
    const next = metrics.next ? `${remaining} ${text("score")} ${text("next")} ${animalName(metrics.next)}` : `${metrics.score} / 899 ${text("score")}`;
    return `<button class="home-rank-card rf102-rank-card rf102-rank-card--${sport}" style="--rank-color:${COLORS[sport]};--rf102-color-2:${COLOR_2[sport]}" data-action="rf102-open-sport" data-sport="${sport}" aria-label="${attr(text(sport))}">
      <div class="home-rank-card__copy"><small>${esc(text(sport).toUpperCase())}-RANK</small><h2>${esc(animalName(metrics.current))}</h2><div class="rf102-card-progress"><div><strong>${metrics.score} ${esc(text("score"))}</strong><span>${esc(next)}</span></div><i><b style="width:${progress}%"></b></i></div></div>
      <div class="home-rank-card__mark rf102-animal-mark"><span>${window.RANKFORGE970?.rankBadge?.(sport, metrics.index) || metrics.current?.[0] || "•"}</span><small>RANK ${Number(metrics.index || 0) + 1}</small></div>
    </button>`;
  }

  function strengthFallback(app) {
    const rank = app.metrics?.rank || {};
    const label = rank.title || rank.name || rank.key || "Wood";
    return `<button class="home-rank-card rf102-rank-card rf102-rank-card--strength" style="--rank-color:${COLORS.strength}" data-action="navigate" data-view="ranks"><div class="home-rank-card__copy"><small>DEIN GYM-RANK</small><h2>${esc(label)}</h2><div class="rf102-card-progress"><div><strong>${Number(rank.lp || 0)} LP</strong><span>Gym-Rank</span></div><i><b style="width:${Math.max(0, Math.min(100, Number(rank.lp || 0) % 100))}%"></b></i></div></div></button>`;
  }

  function rankDashboard(app, originalStrengthCard = "") {
    const selected = ensure(app).selected;
    const cards = selected.map(sport => {
      if (sport !== "strength") return sportCard(app, sport);
      const source = originalStrengthCard || strengthFallback(app);
      return source.replace('class="home-rank-card"', 'class="home-rank-card rf102-rank-card rf102-rank-card--strength"');
    }).join("");
    return `<section class="rf102-home-ranks ${selected.length === 2 ? "is-dual" : "is-single"}" aria-label="${attr(text("title"))}"><header><small>${esc(text("title").toUpperCase())}</small><button data-action="rf102-rank-settings">${esc(text("customize"))}</button></header><div class="rf102-home-rank-grid">${cards}</div></section>`;
  }

  function rankSettings(app) {
    const state = ensure(app);
    return `${app.modalHeader(text("title"), text("settings"))}<form class="modal-form rf102-rank-form" data-form="rf102-rank-settings"><p>${esc(text("hint"))}</p><div class="rf102-rank-options">${SPORTS.map(sport => `<label style="--rank:${COLORS[sport]}"><input type="checkbox" name="homeRank" value="${sport}" data-action="rf102-rank-choice" ${state.selected.includes(sport) ? "checked" : ""}><span>${sport === "strength" ? "◆" : window.RANKFORGE970?.rankBadge?.(sport, sportMetrics(app, sport).index) || sportMetrics(app, sport).current?.[0] || "•"}</span><div><strong>${esc(text(sport))}</strong><small>${esc(text("visible"))}</small></div><i>✓</i></label>`).join("")}</div><footer class="modal-footer modal-footer--row"><button type="button" class="button button--secondary" data-action="close-modal">${esc(text("cancel"))}</button><button type="submit" class="button button--primary">${esc(text("save"))}</button></footer></form>`;
  }

  function rankProfileEntry() {
    return `<button data-action="rf102-rank-settings"><span>◆</span><div><strong>${esc(text("settings"))}</strong><small>${esc(text("profileHint"))}</small></div>${typeof icon === "function" ? icon("chevronRight", 18) : "›"}</button>`;
  }

  function enduranceCard(app, sport) {
    const metrics = sportMetrics(app, sport);
    const progress = metrics.index >= 8 ? 100 : metrics.score % 100;
    const ladder = Array.from({ length:9 }, (_, index) => `<i class="${index < metrics.index ? "is-done" : index === metrics.index ? "is-current" : ""}"></i>`).join("");
    return `<button class="rf102-endurance-card rf102-endurance-card--${sport}" style="--rank:${COLORS[sport]};--rank-2:${COLOR_2[sport]}" data-action="rf102-open-sport" data-sport="${sport}"><span class="rf102-endurance-card__animal">${window.RANKFORGE970?.rankBadge?.(sport, metrics.index) || metrics.current?.[0] || "•"}</span><div><small>${esc(text(sport).toUpperCase())} · RANG ${Number(metrics.index || 0) + 1}</small><strong>${esc(animalName(metrics.current))}</strong><p>${metrics.score} / 899 ${esc(text("score"))} · ${Number(metrics.recent?.length || 0)} Einheiten</p><div class="rf102-mini-ladder">${ladder}</div><div class="rf102-endurance-progress"><i style="width:${progress}%"></i></div></div>${typeof icon === "function" ? icon("chevronRight", 18) : "›"}</button>`;
  }

  function enduranceRanks(app) {
    return `<section class="rf102-endurance-ranks"><div class="section-heading"><div><small>TRIATHLON</small><h2>${esc(text("endurance"))}</h2></div><span>${esc(text("open"))}</span></div><div class="rf102-endurance-grid">${["swim", "run", "bike"].map(sport => enduranceCard(app, sport)).join("")}</div></section>`;
  }

  const proto = AppClass.prototype;
  proto.__rf102Installed = true;
  const previous = {
    renderHome:proto.renderHome,
    renderProfile:proto.renderProfile,
    renderRanks:proto.renderRanks,
    renderModal:proto.renderModal,
    handleClick:proto.handleClick,
    handleChange:proto.handleChange,
    handleSubmit:proto.handleSubmit,
    init:proto.init
  };

  proto.renderHome = function(...args) {
    ensure(this);
    let html = previous.renderHome.apply(this, args);
    if (["sports", "triathlon", "calendar"].includes(this.ui?.view)) return html;
    html = html.replace(/\s*rf1004-home-without-strength/g, "");
    html = html.replace(/<section class="rf1004-home-modules[^>]*>[\s\S]*?<\/section>/g, "");
    const original = html.match(/<button class="home-rank-card"[\s\S]*?<\/button>/)?.[0] || "";
    const dashboard = rankDashboard(this, original);
    if (original) return html.replace(original, dashboard);
    const marker = '<section class="home-bodygraph-section"';
    return html.includes(marker) ? html.replace(marker, `${dashboard}${marker}`) : `${dashboard}${html}`;
  };

  proto.renderProfile = function(...args) {
    ensure(this);
    let html = previous.renderProfile.apply(this, args);
    const legacy = /<button data-action="rf1004-home-settings"[\s\S]*?<\/button>/;
    if (legacy.test(html)) return html.replace(legacy, rankProfileEntry());
    const marker = /(<button[^>]*data-action="switch-account")/i;
    return html.replace(marker, `${rankProfileEntry()}$1`);
  };

  proto.renderRanks = function(...args) {
    ensure(this);
    let html = previous.renderRanks.apply(this, args);
    if (this.ui?.rankTab && this.ui.rankTab !== "rank") return html;
    return html.replace(/<\/section>\s*$/u, `${enduranceRanks(this)}</section>`);
  };

  proto.renderModal = function(...args) {
    if (this.ui?.modal?.type === "rf102-rank-settings") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${rankSettings(this)}</section></div>`;
    return previous.renderModal.apply(this, args);
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (["rf102-rank-settings", "rf1004-home-settings"].includes(action)) {
      event.preventDefault();
      ensure(this);
      this.openModal("rf102-rank-settings");
      return;
    }
    if (action === "rf102-open-sport") {
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
    return previous.handleClick.call(this, event);
  };

  proto.handleChange = async function(event) {
    if (event.target?.dataset?.action === "rf102-rank-choice") {
      const form = event.target.closest?.('form[data-form="rf102-rank-settings"]');
      const selected = form ? [...form.querySelectorAll('input[name="homeRank"]:checked')] : [];
      if (selected.length > 2) {
        event.target.checked = false;
        this.showToast(text("max"));
      }
      return;
    }
    return previous.handleChange?.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.('form[data-form="rf102-rank-settings"]');
    if (form) {
      event.preventDefault();
      const selected = new FormData(form).getAll("homeRank").filter(sport => SPORTS.includes(sport));
      if (!selected.length) return this.showToast(text("choose"));
      if (selected.length > 2) return this.showToast(text("max"));
      this.state.homeRanksV102 = { selected:[...new Set(selected)].slice(0, 2) };
      this.ui.modal = null;
      this.scheduleSave?.();
      this.render();
      this.showToast(text("saved"));
      return;
    }
    return previous.handleSubmit.call(this, event);
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    ensure(this);
    this.scheduleSave?.();
    return result;
  };

  window.RANKFORGE102 = Object.freeze({ version:VERSION, build:BUILD, schema:SCHEMA, sports:SPORTS, colors:COLORS, ensure, sportMetrics:(app, sport) => sportMetrics(app, sport) });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
