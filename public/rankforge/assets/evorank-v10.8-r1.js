/* EVORANK 10.8 r1 — independent rank surfaces, Garmin push sync and seahorse rank art */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__evorank108Installed) return;

  const VERSION = "10.8";
  const BUILD = "1080-r1";
  const SCHEMA = 34;
  const SPORTS = Object.freeze(["strength", "swim", "run", "bike"]);
  const COLORS = Object.freeze({ strength:"#ff3b5f", swim:"#2f7dff", run:"#42c86b", bike:"#f2bd35" });
  const SEAHORSE_TOKEN = "EVORANK_SEAHORSE_V108";
  const SEAHORSE_MARKUP = '<img class="rf108-seahorse" src="./assets/rank-icons/evorank-seahorse-v10.8.png" alt="" aria-hidden="true">';
  const DEFAULT_AUTO_SYNC_SECONDS = 300;

  const COPY = Object.freeze({
    de: {
      title:"Ränge getrennt einstellen", subtitle:"HOME UND RANKS",
      intro:"Lege unabhängig fest, was auf dem Home-Bildschirm und was im Ranks-Bereich erscheint.",
      home:"Home-Bildschirm", homeHint:"Hier darf zum Beispiel nur dein Gym-Rang stehen.",
      ranks:"Ranks-Bereich", ranksHint:"Hier kannst du zusätzlich Schwimmen, Laufen oder Radfahren anzeigen.",
      strength:"Gym", swim:"Schwimmen", run:"Laufen", bike:"Radfahren",
      shownHome:"Nur auf Home sichtbar", shownRanks:"Unter Ranks sichtbar", focus:"Fokus",
      moveUp:"Nach oben", moveDown:"Nach unten", cancel:"Abbrechen", save:"Speichern",
      chooseHome:"Wähle mindestens einen Rang für Home.", chooseRanks:"Wähle mindestens einen Rang für Ranks.",
      saved:"Home und Ranks wurden getrennt gespeichert.",
      garminAuto:"Automatische Synchronisierung", garminAutoText:"Einmal mit Garmin verbinden. Neue Aktivitäten werden danach im Hintergrund übernommen und beim Öffnen der App automatisch angezeigt.",
      garminChecking:"Garmin wird aktualisiert …", garminUpdated:"Garmin ist aktuell", garminConnectFailed:"Garmin kann erst nach der Developer-Freigabe verbunden werden.",
      garminDisconnected:"Garmin wurde getrennt", disconnect:"Garmin trennen"
    },
    en: {
      title:"Set ranks separately", subtitle:"HOME AND RANKS",
      intro:"Choose independently what appears on Home and inside the Ranks area.",
      home:"Home screen", homeHint:"For example, Home can show only your Gym rank.",
      ranks:"Ranks area", ranksHint:"Swimming, running and cycling can additionally appear here.",
      strength:"Gym", swim:"Swimming", run:"Running", bike:"Cycling",
      shownHome:"Visible only on Home", shownRanks:"Visible in Ranks", focus:"Focus",
      moveUp:"Move up", moveDown:"Move down", cancel:"Cancel", save:"Save",
      chooseHome:"Select at least one Home rank.", chooseRanks:"Select at least one Ranks entry.",
      saved:"Home and Ranks were saved separately.",
      garminAuto:"Automatic synchronization", garminAutoText:"Connect Garmin once. New activities are then received in the background and appear automatically when the app opens.",
      garminChecking:"Updating Garmin …", garminUpdated:"Garmin is up to date", garminConnectFailed:"Garmin connection requires Developer Program approval.",
      garminDisconnected:"Garmin disconnected", disconnect:"Disconnect Garmin"
    }
  });

  const language = () => window.RANKFORGE_I18N?.language || "de";
  const text = key => (COPY[language()] || COPY.en)[key] || COPY.de[key] || key;
  const esc = value => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
  const attr = value => typeof escapeAttr === "function" ? escapeAttr(String(value ?? "")) : esc(value);

  function uniqueSports(values) {
    return [...new Set((Array.isArray(values) ? values : []).filter(sport => SPORTS.includes(sport)))].slice(0, 4);
  }

  function ensureRankState(app) {
    if (!app?.state) return { homeOrder:["strength"], rankOrder:["strength", "swim"] };
    app.ui ||= {};
    const legacy = uniqueSports(app.state.homeRanksV103?.order || app.state.homeRanksV103?.selected || app.state.homeRanksV102?.selected);
    let current = app.state.rankDisplayV108 && typeof app.state.rankDisplayV108 === "object" ? app.state.rankDisplayV108 : null;
    if (!current) {
      const rankOrder = legacy.length ? [...legacy] : ["strength", "swim"];
      current = { homeOrder:[rankOrder[0] || "strength"], rankOrder };
    }
    current.rankOrder = uniqueSports(current.rankOrder);
    if (!current.rankOrder.length) current.rankOrder = ["strength", "swim"];
    current.homeOrder = uniqueSports(current.homeOrder).filter(sport => current.rankOrder.includes(sport));
    if (!current.homeOrder.length) current.homeOrder = [current.rankOrder[0]];
    app.state.rankDisplayV108 = current;

    // The 10.3 dashboard remains the renderer. Its permanent compatibility
    // state represents the Ranks screen; Home receives a temporary view below.
    app.state.homeRanksV103 = { selected:[...current.rankOrder], order:[...current.rankOrder] };
    if (!Object.prototype.hasOwnProperty.call(app.ui, "rf108HomeSelectedMuscle")) {
      app.ui.rf108HomeSelectedMuscle = app.ui.selectedMuscle || null;
    }
    if (!Object.prototype.hasOwnProperty.call(app.ui, "rf108RankSelectedMuscle")) {
      app.ui.rf108RankSelectedMuscle = null;
    }
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.state.appVersion = VERSION;
    return current;
  }

  function withRankOrder(app, order, callback) {
    const state = ensureRankState(app);
    app.state.homeRanksV103 = { selected:[...order], order:[...order] };
    try {
      return callback();
    } finally {
      app.state.homeRanksV103 = { selected:[...state.rankOrder], order:[...state.rankOrder] };
    }
  }

  function selectionProperty(surface) {
    return surface === "ranks" ? "rf108RankSelectedMuscle" : "rf108HomeSelectedMuscle";
  }

  function bindSurfaceSelection(app, surface) {
    ensureRankState(app);
    const property = selectionProperty(surface);
    if (app.ui.rf108BoundSurface === surface && app.ui.selectedMuscle !== app.ui.rf108BoundValue) {
      app.ui[property] = app.ui.selectedMuscle || null;
    }
    app.ui.selectedMuscle = app.ui[property] || null;
    app.ui.rf108BoundSurface = surface;
    app.ui.rf108BoundValue = app.ui.selectedMuscle;
  }

  function setSurfaceSelection(app, surface, muscle) {
    ensureRankState(app);
    const property = selectionProperty(surface);
    app.ui[property] = muscle || null;
    app.ui.selectedMuscle = app.ui[property];
    app.ui.rf108BoundSurface = surface;
    app.ui.rf108BoundValue = app.ui.selectedMuscle;
  }

  function replaceSeahorse(html) {
    return typeof html === "string" ? html.replaceAll(SEAHORSE_TOKEN, SEAHORSE_MARKUP) : html;
  }

  function installSeahorse() {
    const firstSwimRank = window.RANKFORGE970?.animals?.swim?.[0];
    if (Array.isArray(firstSwimRank)) firstSwimRank[0] = SEAHORSE_TOKEN;
  }

  function rankMark(app, sport) {
    const data = window.RANKFORGE103?.rankData?.(app, sport);
    if (data?.mark) return sport === "strength" ? data.mark : data.mark.replace(/<small>[\s\S]*?<\/small>/, "");
    return `<span>${sport === "strength" ? "◆" : sport === "swim" ? SEAHORSE_TOKEN : sport === "run" ? "●" : "✦"}</span>`;
  }

  function draftState(app) {
    const current = ensureRankState(app);
    if (!app.ui.rf108RankDraft) {
      app.ui.rf108RankDraft = { homeOrder:[...current.homeOrder], rankOrder:[...current.rankOrder] };
    }
    return app.ui.rf108RankDraft;
  }

  function optionRows(app, scope, order) {
    const selected = new Set(order);
    const display = [...order, ...SPORTS.filter(sport => !selected.has(sport))];
    return `<div class="rf103-rank-options rf108-rank-options">${display.map(sport => {
      const checked = selected.has(sport);
      const index = order.indexOf(sport);
      const action = scope === "home" ? "rf108-home-choice" : "rf108-ranks-choice";
      const visibility = scope === "home" ? text("shownHome") : text("shownRanks");
      return `<article class="${checked ? "is-selected" : ""}" style="--rank:${COLORS[sport]}"><label><input type="checkbox" value="${sport}" data-action="${action}" ${checked ? "checked" : ""}><span>${rankMark(app, sport)}</span><div><strong>${esc(text(sport))}${index === 0 ? `<em>${esc(text("focus"))}</em>` : ""}</strong><small>${esc(visibility)}</small></div><i>✓</i></label><div class="rf103-order-controls"><button type="button" data-action="rf108-move-rank" data-scope="${scope}" data-sport="${sport}" data-direction="-1" aria-label="${attr(text("moveUp"))}" ${!checked || index <= 0 ? "disabled" : ""}>↑</button><button type="button" data-action="rf108-move-rank" data-scope="${scope}" data-sport="${sport}" data-direction="1" aria-label="${attr(text("moveDown"))}" ${!checked || index < 0 || index >= order.length - 1 ? "disabled" : ""}>↓</button></div></article>`;
    }).join("")}</div>`;
  }

  function rankSettings(app) {
    const draft = draftState(app);
    return `${app.modalHeader(text("subtitle"), text("title"))}<form class="modal-form rf103-rank-form rf108-rank-form" data-form="rf108-rank-settings"><p>${esc(text("intro"))}</p><div class="modal-scroll rf108-rank-scroll"><section class="rf108-rank-section"><header><span>1</span><div><strong>${esc(text("home"))}</strong><small>${esc(text("homeHint"))}</small></div></header>${optionRows(app, "home", draft.homeOrder)}</section><section class="rf108-rank-section"><header><span>2</span><div><strong>${esc(text("ranks"))}</strong><small>${esc(text("ranksHint"))}</small></div></header>${optionRows(app, "ranks", draft.rankOrder)}</section></div><footer class="modal-footer modal-footer--row"><button type="button" class="button button--secondary" data-action="close-modal">${esc(text("cancel"))}</button><button type="submit" class="button button--primary">${esc(text("save"))}</button></footer></form>`;
  }

  function sameOriginPath(value) {
    if (!value || typeof location === "undefined") return null;
    try {
      const url = new URL(String(value), location.origin);
      return url.origin === location.origin ? url : null;
    } catch { return null; }
  }

  async function garminToken() {
    const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
    if (!token) throw new Error(language() === "de" ? "Bitte zuerst anmelden." : "Please sign in first.");
    return token;
  }

  async function garminRequest(path, options = {}) {
    const endpoint = sameOriginPath(path);
    if (!endpoint) throw new Error(text("garminConnectFailed"));
    const token = await garminToken();
    const response = await fetch(endpoint, {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: {
        accept:"application/json",
        authorization:`Bearer ${token}`,
        ...(options.body ? { "content-type":"application/json" } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || body.message || text("garminConnectFailed"));
      error.status = response.status;
      error.code = body.code || "";
      throw error;
    }
    return body;
  }

  function garminConfig() {
    return window.RANKFORGE_GARMIN_CONNECT || {};
  }

  function applyGarminActivities(app, payload) {
    if (app.state?.privacyV110?.garminDataConsent !== true) return 0;
    const parsed = window.RANKFORGE970?.parseGarminActivities?.(payload?.activities || payload || [], "") || [];
    const count = window.RANKFORGE970?.storeGarminActivities?.(app, parsed) || 0;
    app.state.garmin ||= { activities:[], connection:{} };
    app.state.garmin.connection ||= {};
    app.state.garmin.connection.status = "connected";
    app.state.garmin.connection.lastSyncAt = payload?.lastSyncAt || new Date().toISOString();
    app.state.garmin.connection.syncMode = "push";
    app.scheduleSave?.();
    return count;
  }

  async function refreshGarmin(app, options = {}) {
    app.state.garmin ||= { activities:[], connection:{} };
    app.state.garmin.connection ||= {};
    try {
      const status = await garminRequest(garminConfig().statusPath);
      Object.assign(app.state.garmin.connection, {
        status: status.connected ? "connected" : "disconnected",
        accountLabel:String(status.accountLabel || ""),
        lastCheckedAt:new Date().toISOString(),
        lastSyncAt:status.lastSyncAt || app.state.garmin.connection.lastSyncAt || "",
        syncMode:status.syncMode || "push",
        configurationRequired:false
      });
      if (status.connected && options.download !== false) {
        const result = await garminRequest(garminConfig().syncPath, { method:"POST" });
        applyGarminActivities(app, result);
      }
      app.scheduleSave?.();
      if (options.render) app.render();
      return Boolean(status.connected);
    } catch (error) {
      if (error.status === 503 || error.code === "garmin_not_configured") {
        app.state.garmin.connection.configurationRequired = true;
      }
      if (!options.silent) throw error;
      return false;
    }
  }

  function clearGarminCallbackMarker() {
    if (typeof location === "undefined" || typeof history === "undefined") return;
    const url = new URL(location.href);
    if (!url.searchParams.has("garmin")) return;
    url.searchParams.delete("garmin");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function startGarminAutoSync(app) {
    if (app.ui.rf108GarminAutoStarted) return;
    app.ui.rf108GarminAutoStarted = true;
    const intervalSeconds = Math.max(60, Number(garminConfig().autoSyncIntervalSeconds || DEFAULT_AUTO_SYNC_SECONDS));
    const run = () => {
      if (navigator.onLine === false || !window.RANKFORGE_ACCOUNT?.status?.().signedIn || app.state?.privacyV110?.garminDataConsent !== true) return;
      refreshGarmin(app, { silent:true, download:true, render:true }).catch(() => {});
    };
    app.ui.rf108GarminTimer = window.setInterval(run, intervalSeconds * 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) run(); });
    window.addEventListener("online", run);
    window.addEventListener("pageshow", run);
    window.RANKFORGE_ACCOUNT?.onChange?.(status => { if (status.signedIn) run(); });
    window.setTimeout(run, 0);
  }

  function enhanceGarminModal(app, html) {
    if (app.ui?.modal?.type !== "rf970-garmin" || typeof html !== "string") return html;
    const connected = app.state?.garmin?.connection?.status === "connected";
    const note = `<section class="rf108-garmin-auto ${connected ? "is-active" : ""}"><span>${typeof icon === "function" ? icon(connected ? "check" : "refresh", 18) : "✓"}</span><div><strong>${esc(text("garminAuto"))}</strong><p>${esc(text("garminAutoText"))}</p></div></section>${connected && garminConfig().disconnectPath ? `<button class="button button--secondary button--wide rf108-garmin-disconnect" data-action="rf108-garmin-disconnect">${esc(text("disconnect"))}</button>` : ""}`;
    const marker = '<div class="rf970-garmin-divider">';
    return html.includes(marker) ? html.replace(marker, `${note}${marker}`) : `${html}${note}`;
  }

  installSeahorse();

  const proto = AppClass.prototype;
  proto.__evorank108Installed = true;
  const previous = {
    renderHome:proto.renderHome,
    renderRanks:proto.renderRanks,
    renderModal:proto.renderModal,
    handleClick:proto.handleClick,
    handleChange:proto.handleChange,
    handleSubmit:proto.handleSubmit,
    init:proto.init
  };

  proto.renderHome = function(...args) {
    const state = ensureRankState(this);
    if (!this.ui.view || this.ui.view === "home") bindSurfaceSelection(this, "home");
    return replaceSeahorse(withRankOrder(this, state.homeOrder, () => previous.renderHome.apply(this, args)));
  };

  proto.renderRanks = function(...args) {
    const state = ensureRankState(this);
    bindSurfaceSelection(this, "ranks");
    if (!state.rankOrder.includes(this.ui.rf103RankSport)) this.ui.rf103RankSport = state.rankOrder[0];
    return replaceSeahorse(withRankOrder(this, state.rankOrder, () => previous.renderRanks.apply(this, args)));
  };

  proto.renderModal = function(...args) {
    if (this.ui?.modal?.type === "rf108-rank-settings") {
      return replaceSeahorse(`<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet rf108-rank-modal" role="dialog" aria-modal="true">${rankSettings(this)}</section></div>`);
    }
    return replaceSeahorse(enhanceGarminModal(this, previous.renderModal.apply(this, args)));
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (["rf103-rank-settings", "rf102-rank-settings", "rf1004-home-settings", "rf108-rank-settings"].includes(action)) {
      event.preventDefault();
      const current = ensureRankState(this);
      this.ui.rf108RankDraft = { homeOrder:[...current.homeOrder], rankOrder:[...current.rankOrder] };
      this.openModal("rf108-rank-settings");
      return;
    }
    if (action === "rf108-move-rank") {
      event.preventDefault();
      const draft = draftState(this);
      const property = element.dataset.scope === "home" ? "homeOrder" : "rankOrder";
      const sport = String(element.dataset.sport || "");
      const from = draft[property].indexOf(sport);
      const to = from + Number(element.dataset.direction || 0);
      if (from >= 0 && to >= 0 && to < draft[property].length) {
        [draft[property][from], draft[property][to]] = [draft[property][to], draft[property][from]];
      }
      this.render();
      return;
    }
    if (["select-muscle", "clear-muscle"].includes(action) && ["home", "ranks"].includes(this.ui.view || "home")) {
      event.preventDefault();
      const surface = this.ui.view === "ranks" ? "ranks" : "home";
      const key = action === "select-muscle" ? String(element.dataset.muscle || "") : "";
      const current = this.ui[selectionProperty(surface)] || null;
      setSurfaceSelection(this, surface, key && key !== current ? key : null);
      if (!this.renderMuscleSelection?.(surface)) this.render();
      return;
    }
    if (action === "rf970-garmin-connect") {
      event.preventDefault();
      try {
        const result = await garminRequest(garminConfig().connectPath, {
          method:"POST",
          body:{ returnTo:`${location.pathname}${location.search}#sports` }
        });
        if (!result.authorizationUrl) throw new Error(text("garminConnectFailed"));
        location.assign(result.authorizationUrl);
      } catch (error) {
        this.showToast(error.status === 503 ? text("garminConnectFailed") : error.message || text("garminConnectFailed"));
      }
      return;
    }
    if (action === "rf970-garmin-sync") {
      event.preventDefault();
      this.showToast(text("garminChecking"));
      try {
        await refreshGarmin(this, { download:true, render:true });
        this.showToast(text("garminUpdated"));
      } catch (error) {
        this.showToast(error.status === 503 ? text("garminConnectFailed") : error.message || text("garminConnectFailed"));
      }
      return;
    }
    if (action === "rf108-garmin-disconnect") {
      event.preventDefault();
      try {
        await garminRequest(garminConfig().disconnectPath, { method:"POST" });
        this.state.garmin.connection = { status:"disconnected", lastSyncAt:"", lastCheckedAt:new Date().toISOString() };
        this.ui.modal = null;
        this.scheduleSave?.();
        this.render();
        this.showToast(text("garminDisconnected"));
      } catch (error) {
        this.showToast(error.message || text("garminConnectFailed"));
      }
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.handleChange = async function(event) {
    const action = event.target?.dataset?.action;
    if (["rf108-home-choice", "rf108-ranks-choice"].includes(action)) {
      const draft = draftState(this);
      const sport = String(event.target.value || "");
      if (!SPORTS.includes(sport)) return;
      if (action === "rf108-home-choice") {
        if (event.target.checked && !draft.homeOrder.includes(sport)) draft.homeOrder.push(sport);
        if (!event.target.checked) draft.homeOrder = draft.homeOrder.filter(item => item !== sport);
        if (event.target.checked && !draft.rankOrder.includes(sport)) draft.rankOrder.push(sport);
      } else {
        if (event.target.checked && !draft.rankOrder.includes(sport)) draft.rankOrder.push(sport);
        if (!event.target.checked) {
          draft.rankOrder = draft.rankOrder.filter(item => item !== sport);
          draft.homeOrder = draft.homeOrder.filter(item => item !== sport);
        }
      }
      this.render();
      return;
    }
    return previous.handleChange?.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.('form[data-form="rf108-rank-settings"]');
    if (form) {
      event.preventDefault();
      const draft = draftState(this);
      const rankOrder = uniqueSports(draft.rankOrder);
      const homeOrder = uniqueSports(draft.homeOrder).filter(sport => rankOrder.includes(sport));
      if (!homeOrder.length) return this.showToast(text("chooseHome"));
      if (!rankOrder.length) return this.showToast(text("chooseRanks"));
      this.state.rankDisplayV108 = { homeOrder, rankOrder };
      this.state.homeRanksV103 = { selected:[...rankOrder], order:[...rankOrder] };
      if (!rankOrder.includes(this.ui.rf103RankSport)) this.ui.rf103RankSport = rankOrder[0];
      this.ui.rf108RankDraft = null;
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
    ensureRankState(this);
    installSeahorse();
    clearGarminCallbackMarker();
    startGarminAutoSync(this);
    this.scheduleSave?.();
    this.render();
    return result;
  };

  window.EVORANK108 = Object.freeze({
    version:VERSION,
    build:BUILD,
    schema:SCHEMA,
    sports:SPORTS,
    seahorseToken:SEAHORSE_TOKEN,
    uniqueSports,
    ensureRankState,
    replaceSeahorse,
    refreshGarmin:(app = window.RANKFORGE_APP) => refreshGarmin(app, { download:true })
  });
  window.EVORANK = Object.freeze({
    name:"EVORANK",
    version:VERSION,
    build:BUILD,
    legacyStorageCompatible:true
  });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
