/* RankForge 10.3 r1 — ordered multi-sport ranks and calmer iPhone layouts */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__rf103Installed) return;

  const VERSION = "10.3";
  const BUILD = "1030-r1";
  const SCHEMA = 32;
  const SPORTS = Object.freeze(["strength", "swim", "run", "bike"]);
  const COLORS = Object.freeze({ strength:"#ff3b5f", swim:"#2f7dff", run:"#42c86b", bike:"#f2bd35" });
  const COLOR_2 = Object.freeze({ strength:"#c21f44", swim:"#10b7ee", run:"#149b4d", bike:"#ee8f2c" });
  const SYMBOLS = Object.freeze({ strength:"◆", swim:"◉", run:"●", bike:"✦" });
  const LANGUAGE_INDEX = Object.freeze({ de:1, en:2, zh:3, hi:4, es:5, ar:6 });
  const COPY = Object.freeze({
    de:{ title:"Deine Ränge", customize:"Ränge anpassen", settings:"Sportarten & Reihenfolge", hint:"Wähle bis zu vier Ränge. Der erste Rang ist dein Fokus. Mit den Pfeilen legst du die Reihenfolge fest.", choose:"Mindestens einen Rang auswählen.", saved:"Ränge und Fokus gespeichert", strength:"Gym", swim:"Schwimmen", run:"Laufen", bike:"Radfahren", score:"Punkte", next:"bis", visible:"Auf Startseite und unter Ranks", focus:"Fokus", moveUp:"Nach oben", moveDown:"Nach unten", cancel:"Abbrechen", save:"Speichern", profileHint:"Gym, Schwimmen, Laufen und Radfahren ordnen", overview:"Rangübersicht", details:"Dein Fortschritt", sessions:"Einheiten", current:"Aktuell", maxRank:"Höchster Rang", allLevels:"Alle Rangstufen" },
    en:{ title:"Your ranks", customize:"Customize ranks", settings:"Sports & order", hint:"Choose up to four ranks. The first rank is your focus. Use the arrows to set the order.", choose:"Select at least one rank.", saved:"Ranks and focus saved", strength:"Gym", swim:"Swimming", run:"Running", bike:"Cycling", score:"points", next:"to", visible:"On Home and in Ranks", focus:"Focus", moveUp:"Move up", moveDown:"Move down", cancel:"Cancel", save:"Save", profileHint:"Order Gym, Swimming, Running and Cycling", overview:"Rank overview", details:"Your progress", sessions:"sessions", current:"Current", maxRank:"Highest rank", allLevels:"All rank levels" },
    zh:{ title:"你的等级", customize:"自定义等级", settings:"运动与顺序", hint:"最多选择四个等级。第一个是你的重点，可用箭头调整顺序。", choose:"请至少选择一个等级。", saved:"等级和重点已保存", strength:"健身", swim:"游泳", run:"跑步", bike:"骑行", score:"分", next:"距离", visible:"首页和等级页显示", focus:"重点", moveUp:"上移", moveDown:"下移", cancel:"取消", save:"保存", profileHint:"排列健身、游泳、跑步和骑行", overview:"等级概览", details:"你的进度", sessions:"次训练", current:"当前", maxRank:"最高等级", allLevels:"全部等级" },
    hi:{ title:"आपकी रैंक", customize:"रैंक बदलें", settings:"खेल और क्रम", hint:"चार रैंक तक चुनें। पहली रैंक आपका फोकस है। क्रम बदलने के लिए तीर इस्तेमाल करें।", choose:"कम से कम एक रैंक चुनें।", saved:"रैंक और फोकस सहेजे गए", strength:"जिम", swim:"तैराकी", run:"दौड़", bike:"साइक्लिंग", score:"अंक", next:"तक", visible:"होम और रैंक में", focus:"फोकस", moveUp:"ऊपर", moveDown:"नीचे", cancel:"रद्द करें", save:"सहेजें", profileHint:"जिम, तैराकी, दौड़ और साइक्लिंग क्रम में रखें", overview:"रैंक सारांश", details:"आपकी प्रगति", sessions:"सेशन", current:"मौजूदा", maxRank:"सबसे ऊंची रैंक", allLevels:"सभी स्तर" },
    es:{ title:"Tus rangos", customize:"Personalizar rangos", settings:"Deportes y orden", hint:"Elige hasta cuatro rangos. El primero será tu enfoque. Usa las flechas para ordenar.", choose:"Selecciona al menos un rango.", saved:"Rangos y enfoque guardados", strength:"Gym", swim:"Natación", run:"Carrera", bike:"Ciclismo", score:"puntos", next:"hasta", visible:"En Inicio y Rangos", focus:"Enfoque", moveUp:"Subir", moveDown:"Bajar", cancel:"Cancelar", save:"Guardar", profileHint:"Ordena Gym, Natación, Carrera y Ciclismo", overview:"Resumen de rangos", details:"Tu progreso", sessions:"sesiones", current:"Actual", maxRank:"Rango máximo", allLevels:"Todos los niveles" },
    ar:{ title:"رتبك", customize:"تخصيص الرتب", settings:"الرياضات والترتيب", hint:"اختر حتى أربع رتب. الرتبة الأولى هي تركيزك. استخدم الأسهم لتغيير الترتيب.", choose:"اختر رتبة واحدة على الأقل.", saved:"تم حفظ الرتب والتركيز", strength:"النادي", swim:"السباحة", run:"الجري", bike:"ركوب الدراجة", score:"نقطة", next:"حتى", visible:"في الرئيسية والرتب", focus:"التركيز", moveUp:"للأعلى", moveDown:"للأسفل", cancel:"إلغاء", save:"حفظ", profileHint:"رتّب النادي والسباحة والجري والدراجة", overview:"ملخص الرتب", details:"تقدمك", sessions:"جلسات", current:"الحالية", maxRank:"أعلى رتبة", allLevels:"كل المستويات" }
  });

  const language = () => window.RANKFORGE_I18N?.language || "de";
  const text = key => (COPY[language()] || COPY.de)[key] || COPY.de[key] || key;
  const esc = value => typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
  const attr = value => typeof escapeAttr === "function" ? escapeAttr(String(value ?? "")) : esc(value);

  function uniqueSports(values) {
    return [...new Set((Array.isArray(values) ? values : []).filter(sport => SPORTS.includes(sport)))].slice(0, 4);
  }

  function planOrder(app) {
    const plan = app.state?.trainingPlanV10 || {};
    const active = uniqueSports(plan.activeSports);
    const primary = SPORTS.includes(plan.primarySport) ? plan.primarySport : active[0];
    return primary ? [primary, ...active.filter(sport => sport !== primary)] : active;
  }

  function ensure(app) {
    if (!app?.state) return { selected:["strength"], order:["strength"] };
    const current = app.state.homeRanksV103 && typeof app.state.homeRanksV103 === "object" ? app.state.homeRanksV103 : {};
    const legacy = uniqueSports(app.state.homeRanksV102?.selected);
    const planned = planOrder(app);
    let order = uniqueSports(current.order?.length ? current.order : current.selected?.length ? current.selected : legacy.length ? legacy : planned);
    if (!order.length) order = ["strength"];
    current.order = order;
    current.selected = [...order];
    app.state.homeRanksV103 = current;
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.state.appVersion = VERSION;
    return current;
  }

  function animalName(entry) {
    return entry?.[LANGUAGE_INDEX[language()] || 1] || entry?.[1] || "—";
  }

  function sportMetrics(app, sport) {
    return window.RANKFORGE970?.sportMetrics?.(sport, app) || { score:0, index:0, recent:[], current:[SYMBOLS[sport], text(sport)], next:null };
  }

  function strengthData(app) {
    const rank = app.metrics?.rank || {};
    const label = typeof rankTitle === "function" ? rankTitle(rank) : rank.title || rank.name || rank.key || "Wood III";
    const score = Number(rank.score || 0);
    const lp = Number(rank.lp || 0);
    const progress = Math.max(0, Math.min(100, lp || score % 100));
    const mark = typeof rankMark === "function" ? rankMark(rank, true) : `<span>${SYMBOLS.strength}</span>`;
    const nextLabel = rank.next
      ? `${Math.max(0, 100 - lp)} LP ${text("next")} ${typeof rankTitle === "function" ? rankTitle(rank.next) : rank.next.name || ""}`
      : text("maxRank");
    return { label, score, progress, mark, unit:"LP", sub:`${lp} LP`, next:nextLabel };
  }

  function enduranceData(app, sport) {
    const metrics = sportMetrics(app, sport);
    const progress = metrics.index >= 8 ? 100 : Math.max(0, Number(metrics.score || 0) % 100);
    const remaining = metrics.index >= 8 ? 0 : 100 - progress;
    return {
      label:animalName(metrics.current),
      score:Number(metrics.score || 0),
      progress,
      mark:`<span>${window.RANKFORGE970?.rankBadge?.(sport, metrics.index) || metrics.current?.[0] || SYMBOLS[sport]}</span><small>RANK ${Number(metrics.index || 0) + 1}</small>`,
      unit:text("score"),
      sub:`${Number(metrics.score || 0)} ${text("score")}`,
      next:metrics.next ? `${remaining} ${text("next")} ${animalName(metrics.next)}` : text("maxRank"),
      metrics
    };
  }

  function rankData(app, sport) {
    return sport === "strength" ? strengthData(app) : enduranceData(app, sport);
  }

  function rankCard(app, sport, single) {
    const data = rankData(app, sport);
    const label = sport === "strength" ? `${text("strength").toUpperCase()}-RANK` : `${text(sport).toUpperCase()}-RANK`;
    return `<button class="rf103-rank-card rf103-rank-card--${sport} ${single ? "is-wide" : "is-compact"}" style="--rank:${COLORS[sport]};--rank-2:${COLOR_2[sport]}" data-action="rf103-open-sport" data-sport="${sport}" aria-label="${attr(text(sport))}">
      <div class="rf103-rank-card__copy"><small>${esc(label)}</small><strong>${esc(data.label)}</strong><div class="rf103-rank-card__meta"><b>${esc(data.sub)}</b><span>${esc(data.next)}</span></div><i><em style="width:${data.progress}%"></em></i></div>
      <div class="rf103-rank-card__mark">${data.mark}</div>
    </button>`;
  }

  function rankDashboard(app) {
    const order = ensure(app).order;
    return `<section class="rf103-home-ranks count-${order.length}" aria-label="${attr(text("title"))}"><header><small>${esc(text("title").toUpperCase())}</small><button data-action="rf103-rank-settings">${esc(text("customize"))}</button></header><div class="rf103-home-rank-grid">${order.map(sport => rankCard(app, sport, order.length === 1)).join("")}</div></section>`;
  }

  function draftState(app) {
    const state = ensure(app);
    if (!app.ui.rf103RankDraft) app.ui.rf103RankDraft = { order:[...state.order] };
    return app.ui.rf103RankDraft;
  }

  function rankSettings(app) {
    const draft = draftState(app);
    const selected = new Set(draft.order);
    const displayOrder = [...draft.order, ...SPORTS.filter(sport => !selected.has(sport))];
    return `${app.modalHeader(text("title"), text("settings"))}<form class="modal-form rf103-rank-form" data-form="rf103-rank-settings"><p>${esc(text("hint"))}</p><div class="rf103-rank-options">${displayOrder.map(sport => {
      const checked = selected.has(sport);
      const data = rankData(app, sport);
      const orderIndex = draft.order.indexOf(sport);
      return `<article class="${checked ? "is-selected" : ""}" style="--rank:${COLORS[sport]}"><label><input type="checkbox" value="${sport}" data-action="rf103-rank-choice" ${checked ? "checked" : ""}><span>${sport === "strength" ? data.mark : data.mark.replace(/<small>[\s\S]*?<\/small>/, "")}</span><div><strong>${esc(text(sport))}${orderIndex === 0 ? `<em>${esc(text("focus"))}</em>` : ""}</strong><small>${esc(text("visible"))}</small></div><i>✓</i></label><div class="rf103-order-controls"><button type="button" data-action="rf103-move-rank" data-sport="${sport}" data-direction="-1" aria-label="${attr(text("moveUp"))}" ${!checked || orderIndex <= 0 ? "disabled" : ""}>↑</button><button type="button" data-action="rf103-move-rank" data-sport="${sport}" data-direction="1" aria-label="${attr(text("moveDown"))}" ${!checked || orderIndex < 0 || orderIndex >= draft.order.length - 1 ? "disabled" : ""}>↓</button></div></article>`;
    }).join("")}</div><footer class="modal-footer modal-footer--row"><button type="button" class="button button--secondary" data-action="close-modal">${esc(text("cancel"))}</button><button type="submit" class="button button--primary">${esc(text("save"))}</button></footer></form>`;
  }

  function rankProfileEntry() {
    return `<button data-action="rf103-rank-settings"><span>◆</span><div><strong>${esc(text("settings"))}</strong><small>${esc(text("profileHint"))}</small></div>${typeof icon === "function" ? icon("chevronRight", 18) : "›"}</button>`;
  }

  function activeSport(app) {
    const order = ensure(app).order;
    return order.includes(app.ui.rf103RankSport) ? app.ui.rf103RankSport : order[0];
  }

  function rankSwitcher(app, active) {
    const order = ensure(app).order;
    return `<section class="rf103-rank-switcher count-${order.length}" aria-label="${attr(text("overview"))}"><div class="rf103-rank-switcher__heading"><small>${esc(text("overview").toUpperCase())}</small><button data-action="rf103-rank-settings">${esc(text("customize"))}</button></div><div>${order.map((sport, index) => {
      const data = rankData(app, sport);
      return `<button class="${active === sport ? "is-active" : ""}" style="--rank:${COLORS[sport]}" data-action="rf103-rank-sport" data-sport="${sport}" aria-pressed="${active === sport}"><span>${sport === "strength" ? data.mark : window.RANKFORGE970?.rankBadge?.(sport, data.metrics?.index) || data.metrics?.current?.[0] || SYMBOLS[sport]}</span><div><small>${index === 0 ? esc(text("focus")) : esc(text(sport))}</small><strong>${esc(data.label)}</strong><em>${esc(data.sub)}</em></div></button>`;
    }).join("")}</div></section>`;
  }

  function enduranceDetail(app, sport) {
    const data = enduranceData(app, sport);
    const animals = window.RANKFORGE970?.animals?.[sport] || [];
    const rows = animals.map((animal, index) => `<article class="${index < data.metrics.index ? "is-done" : index === data.metrics.index ? "is-current" : ""}" style="--rank:${COLORS[sport]}"><span>${window.RANKFORGE970?.rankBadge?.(sport, index) || animal?.[0] || "•"}</span><div><strong>${esc(animalName(animal))}</strong><small>${index === animals.length - 1 ? `${index * 100}+ ${esc(text("score"))}` : `${index * 100}–${index * 100 + 99} ${esc(text("score"))}`}</small></div>${index < data.metrics.index ? "✓" : index === data.metrics.index ? `<em>${esc(text("current"))}</em>` : ""}</article>`).reverse().join("");
    return `<div class="rf103-sport-rank-view" style="--rank:${COLORS[sport]};--rank-2:${COLOR_2[sport]}"><article class="rf103-sport-rank-hero"><small>${esc(text(sport).toUpperCase())}-RANK</small><div class="rf103-sport-rank-hero__main"><span>${window.RANKFORGE970?.rankBadge?.(sport, data.metrics.index) || data.metrics.current?.[0] || SYMBOLS[sport]}</span><div><h2>${esc(data.label)}</h2><p>${data.score} ${esc(text("score"))}</p></div></div><div class="rf103-sport-rank-progress"><i><b style="width:${data.progress}%"></b></i><span>${esc(data.next)}</span></div><footer><b>${Number(data.metrics.recent?.length || 0)}</b><span>${esc(text("sessions"))}</span></footer></article><section class="rf103-sport-ladder"><div><small>${esc(text("details").toUpperCase())}</small><h2>${esc(text("allLevels"))}</h2></div>${rows}</section></div>`;
  }

  function enduranceRanksScreen(app, sport) {
    return `<section class="screen ranks-screen rf103-ranks-screen"><div class="screen-title"><div><p>MULTI-SPORT RANKING</p><h1>Ranks</h1></div><button class="circle-button" data-action="rf103-rank-settings" aria-label="${attr(text("customize"))}">${typeof icon === "function" ? icon("settings", 20) : "•••"}</button></div>${rankSwitcher(app, sport)}${enduranceDetail(app, sport)}</section>`;
  }

  function removeLegacyRankSection(html) {
    return html.replace(/<section class="rf102-endurance-ranks">[\s\S]*?<\/section>(?=<\/section>\s*$)/u, "");
  }

  const proto = AppClass.prototype;
  proto.__rf103Installed = true;
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
    const dashboard = rankDashboard(this);
    const legacy = /<section class="rf102-home-ranks\b[\s\S]*?<\/section>/u;
    if (legacy.test(html)) return html.replace(legacy, dashboard);
    const original = /<button class="home-rank-card"[\s\S]*?<\/button>/u;
    if (original.test(html)) return html.replace(original, dashboard);
    const marker = '<section class="home-bodygraph-section"';
    return html.includes(marker) ? html.replace(marker, `${dashboard}${marker}`) : `${dashboard}${html}`;
  };

  proto.renderProfile = function(...args) {
    ensure(this);
    let html = previous.renderProfile.apply(this, args);
    const legacy = /<button data-action="rf102-rank-settings"[\s\S]*?<\/button>/u;
    if (legacy.test(html)) return html.replace(legacy, rankProfileEntry());
    const marker = /(<button[^>]*data-action="switch-account")/i;
    return html.replace(marker, `${rankProfileEntry()}$1`);
  };

  proto.renderRanks = function(...args) {
    const active = activeSport(this);
    if (active !== "strength") return enduranceRanksScreen(this, active);
    let html = removeLegacyRankSection(previous.renderRanks.apply(this, args));
    const switcher = rankSwitcher(this, active);
    const tabs = '<div class="rank-tabs"';
    return html.includes(tabs) ? html.replace(tabs, `${switcher}${tabs}`) : html.replace(/(<div class="screen-title"[\s\S]*?<\/div>)/u, `$1${switcher}`);
  };

  proto.renderModal = function(...args) {
    if (this.ui?.modal?.type === "rf103-rank-settings") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${rankSettings(this)}</section></div>`;
    return previous.renderModal.apply(this, args);
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (["rf103-rank-settings", "rf102-rank-settings", "rf1004-home-settings"].includes(action)) {
      event.preventDefault();
      const state = ensure(this);
      this.ui.rf103RankDraft = { order:[...state.order] };
      this.openModal("rf103-rank-settings");
      return;
    }
    if (action === "rf103-move-rank") {
      event.preventDefault();
      const draft = draftState(this);
      const sport = String(element.dataset.sport || "");
      const from = draft.order.indexOf(sport);
      const to = from + Number(element.dataset.direction || 0);
      if (from >= 0 && to >= 0 && to < draft.order.length) [draft.order[from], draft.order[to]] = [draft.order[to], draft.order[from]];
      this.render();
      return;
    }
    if (["rf103-open-sport", "rf103-rank-sport"].includes(action)) {
      event.preventDefault();
      const sport = SPORTS.includes(element.dataset.sport) ? element.dataset.sport : ensure(this).order[0];
      this.ui.rf103RankSport = sport;
      this.ui.rankTab = "rank";
      this.ui.view = "ranks";
      this.render();
      if (action === "rf103-open-sport") window.scrollTo?.({ top:0, behavior:"smooth" });
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.handleChange = async function(event) {
    if (event.target?.dataset?.action === "rf103-rank-choice") {
      const draft = draftState(this);
      const sport = String(event.target.value || "");
      if (event.target.checked && SPORTS.includes(sport) && !draft.order.includes(sport)) draft.order.push(sport);
      if (!event.target.checked) draft.order = draft.order.filter(item => item !== sport);
      this.render();
      return;
    }
    return previous.handleChange?.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.('form[data-form="rf103-rank-settings"]');
    if (form) {
      event.preventDefault();
      const order = uniqueSports(draftState(this).order);
      if (!order.length) return this.showToast(text("choose"));
      this.state.homeRanksV103 = { selected:[...order], order:[...order] };
      this.state.trainingPlanV10 ||= {};
      this.state.trainingPlanV10.activeSports = [...order];
      this.state.trainingPlanV10.primarySport = order[0];
      this.ui.rf103RankSport = order[0];
      this.ui.rf103RankDraft = null;
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

  window.RANKFORGE103 = Object.freeze({ version:VERSION, build:BUILD, schema:SCHEMA, sports:SPORTS, colors:COLORS, ensure, rankData:(app, sport) => rankData(app, sport) });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
