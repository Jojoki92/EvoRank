/* EVORANK 10.10 r1 — production privacy, diagnostics and native handoff */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__evorank110Installed) return;

  const VERSION = "10.10";
  const BUILD = "1100-r1";
  const SCHEMA = 36;
  const SUPPORT_EMAIL = "evorank.fitness@gmail.com";
  const SPORTS = Object.freeze(["strength", "swim", "run", "bike"]);
  const CONSENT_KEY = "evorank-health-cloud-consent-v1";
  const CONSENT_VERSION = "10.10-2026-08";

  const esc = value => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
  const attr = value => typeof escapeAttr === "function" ? escapeAttr(String(value ?? "")) : esc(value);
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function localCloudConsent() {
    if (window.EVORANK_CLOUD_CONSENT_X49) return window.EVORANK_CLOUD_CONSENT_X49.read(window.RANKFORGE_APP?.state);
    try { return localStorage.getItem(CONSENT_KEY) === "accepted"; } catch { return false; }
  }

  function privacy(app) {
    app.state ||= {};
    const previous = app.state.privacyV110 && typeof app.state.privacyV110 === "object" ? app.state.privacyV110 : {};
    const pending = previous.pendingRevocations && typeof previous.pendingRevocations === "object" ? previous.pendingRevocations : {};
    app.state.privacyV110 = {
      cloudHealthConsent: window.EVORANK_CLOUD_CONSENT_X49 && window.RANKFORGE_APP === app && accountStatus().signedIn
        ? window.EVORANK_CLOUD_CONSENT_X49.read(app.state)
        : previous.cloudHealthConsent === true || localCloudConsent(),
      leaderboardConsent: previous.leaderboardConsent === true,
      garminDataConsent: previous.garminDataConsent === true,
      diagnosticsConsent: previous.diagnosticsConsent === true,
      consentVersion: String(previous.consentVersion || CONSENT_VERSION),
      consentUpdatedAt: String(previous.consentUpdatedAt || ""),
      lastBackupAt: String(previous.lastBackupAt || ""),
      lastValidationAt: String(previous.lastValidationAt || ""),
      lastValidationOk: previous.lastValidationOk !== false,
      blockedLeaderboardIds: [...new Set((Array.isArray(previous.blockedLeaderboardIds) ? previous.blockedLeaderboardIds : []).map(String).filter(Boolean))].slice(0, 200),
      pendingRevocations: {
        leaderboard:Boolean(pending.leaderboard),
        garmin:Boolean(pending.garmin)
      }
    };
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.state.appVersion = VERSION;
    return app.state.privacyV110;
  }

  function accountStatus() {
    return window.RANKFORGE_ACCOUNT?.status?.() || { signedIn:false, hasProfile:false, online:navigator.onLine !== false };
  }

  function relativeDate(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "Noch kein Backup";
    const days = Math.floor((Date.now() - timestamp) / 86_400_000);
    if (days <= 0) return "Heute";
    if (days === 1) return "Gestern";
    return `Vor ${days} Tagen`;
  }

  function cloudConfig() {
    const raw = window.RANKFORGE_CLOUD || {};
    const url = String(raw.supabaseUrl || "").replace(/\/+$/, "");
    const key = String(raw.supabasePublishableKey || "");
    return { url, key, ready:Boolean(url && key) };
  }

  async function rpc(name, args = {}) {
    const config = cloudConfig();
    if (!config.ready) throw Object.assign(new Error("Supabase ist noch nicht vollständig eingerichtet."), { code:"cloud_not_configured" });
    const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
    if (!token) throw Object.assign(new Error("Bitte zuerst anmelden."), { code:"not_authenticated" });
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method:"POST",
      headers:{ apikey:config.key, authorization:`Bearer ${token}`, "content-type":"application/json" },
      body:JSON.stringify(args)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const setup = response.status === 404 || /schema cache|could not find/i.test(String(body?.message || ""));
      throw Object.assign(new Error(setup ? "Bitte die 10.10-Supabase-Datei einmal ausführen." : body?.message || `Cloud-Fehler ${response.status}`), { code:setup ? "production_setup_required" : body?.code || `http_${response.status}` });
    }
    return body;
  }

  function validation(app) {
    const codes = [];
    const state = app?.state;
    if (!state || typeof state !== "object") codes.push("state_missing");
    if (!Array.isArray(state?.workouts)) codes.push("workouts_invalid");
    if (!Array.isArray(state?.routines)) codes.push("routines_invalid");
    if (!state?.profile || typeof state.profile !== "object") codes.push("profile_invalid");
    const duplicateWorkoutCount = (() => {
      const ids = (state?.workouts || []).map(item => String(item?.id || "")).filter(Boolean);
      return ids.length - new Set(ids).size;
    })();
    if (duplicateWorkoutCount > 0) codes.push("duplicate_workout_ids");
    try {
      if (JSON.stringify(state).length > 9_000_000) codes.push("state_near_storage_limit");
    } catch { codes.push("state_not_serializable"); }
    const p = privacy(app);
    p.lastValidationAt = new Date().toISOString();
    p.lastValidationOk = codes.length === 0;
    return { ok:codes.length === 0, codes };
  }

  function runtimeStore(app) {
    app.state.supportV110 ||= { runtimeErrors:[] };
    app.state.supportV110.runtimeErrors = Array.isArray(app.state.supportV110.runtimeErrors) ? app.state.supportV110.runtimeErrors.slice(-20) : [];
    return app.state.supportV110.runtimeErrors;
  }

  function recordRuntimeIssue(app, event, fallbackCode) {
    if (!app?.state) return;
    const code = String(event?.error?.name || event?.reason?.name || fallbackCode || "runtime_error").replace(/[^a-z0-9_.-]/gi, "_").slice(0, 60);
    const file = String(event?.filename || "").split(/[\\/]/).pop().slice(0, 100);
    runtimeStore(app).push({ code, file, line:Math.max(0, Math.round(finite(event?.lineno))), column:Math.max(0, Math.round(finite(event?.colno))), at:new Date().toISOString() });
  }

  function supportBundle(app) {
    const p = privacy(app);
    const checked = validation(app);
    const account = accountStatus();
    const workouts = Array.isArray(app.state?.workouts) ? app.state.workouts : [];
    const routines = Array.isArray(app.state?.routines) ? app.state.routines : [];
    const garminActivities = Array.isArray(app.state?.garmin?.activities) ? app.state.garmin.activities : [];
    return {
      generatedAt:new Date().toISOString(),
      app:{ name:"EVORANK", version:VERSION, build:BUILD, schema:SCHEMA },
      environment:{
        online:navigator.onLine !== false,
        standalone:Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone),
        language:String(document.documentElement.lang || "de").slice(0, 8),
        touch:"ontouchstart" in window,
        serviceWorker:"serviceWorker" in navigator,
        nativeActivityBridge:Boolean(window.webkit?.messageHandlers?.evorankLiveActivity || window.EVORANK_NATIVE_ACTIVITY?.postMessage)
      },
      counts:{ workouts:workouts.length, routines:routines.length, garminActivities:garminActivities.length },
      connections:{
        account:Boolean(account.signedIn),
        cloudConsent:Boolean(p.cloudHealthConsent),
        leaderboardConsent:Boolean(p.leaderboardConsent),
        garminConsent:Boolean(p.garminDataConsent),
        garminConnected:app.state?.garmin?.connection?.status === "connected"
      },
      validation:checked,
      recentIssueCodes:p.diagnosticsConsent ? runtimeStore(app).slice(-10) : [],
      privacy:"Enthält keine E-Mail, Namen, Profil- oder Geräte-ID, Trainingsinhalte, Gewichte, Notizen oder Zugangsdaten."
    };
  }

  function downloadJson(name, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function stateBadge(ok, yes, no) {
    return `<span class="rf110-status ${ok ? "is-ok" : "is-warn"}">${ok ? "✓" : "!"} ${esc(ok ? yes : no)}</span>`;
  }

  function consentRow(key, title, copy, active, tone = "blue") {
    return `<button type="button" class="rf110-consent ${active ? "is-on" : ""}" data-action="rf110-toggle-consent" data-consent="${attr(key)}" style="--tone:var(--rf110-${tone})" aria-pressed="${active ? "true" : "false"}"><span class="rf110-switch"><i></i></span><div><strong>${esc(title)}</strong><small>${esc(copy)}</small></div><b>${active ? "AN" : "AUS"}</b></button>`;
  }

  function productionModal(app) {
    const p = privacy(app);
    const account = accountStatus();
    const checked = validation(app);
    const cloud = p.cloudHealthConsent && account.signedIn;
    const garmin = app.state?.garmin?.connection?.status === "connected";
    const native = Boolean(window.webkit?.messageHandlers?.evorankLiveActivity || window.EVORANK_NATIVE_ACTIVITY?.postMessage || app.ui?.nativeTimerAvailable);
    return `${app.modalHeader("SICHERHEIT & BEREITSCHAFT", "Produktionscenter")}<div class="modal-scroll rf110-production">
      <section class="rf110-readiness">
        <article><small>KONTO</small><strong>${account.signedIn ? "Verbunden" : "Lokal"}</strong>${stateBadge(account.signedIn, "angemeldet", "nicht angemeldet")}</article>
        <article><small>CLOUD</small><strong>${cloud ? "Aktiv" : "Pausiert"}</strong>${stateBadge(cloud, "freigegeben", "keine Freigabe")}</article>
        <article><small>BACKUP</small><strong>${esc(relativeDate(p.lastBackupAt))}</strong>${stateBadge(Boolean(p.lastBackupAt), "vorhanden", "jetzt exportieren")}</article>
        <article><small>GARMIN</small><strong>${garmin ? "Verbunden" : "Nicht verbunden"}</strong>${stateBadge(garmin, "Push-Sync", "optional")}</article>
        <article><small>BESTENLISTE</small><strong>${p.leaderboardConsent ? "Sichtbar" : "Privat"}</strong>${stateBadge(p.leaderboardConsent, "freigegeben", "nicht freigegeben")}</article>
        <article><small>APP-CHECK</small><strong>${checked.ok ? "In Ordnung" : "Prüfen"}</strong>${stateBadge(checked.ok, "keine Fehler", `${checked.codes.length} Hinweis(e)`)}</article>
        <article><small>IPHONE LIVE</small><strong>${native ? "Bereit" : "Quellcode dabei"}</strong>${stateBadge(native, "verbunden", "native App nötig")}</article>
      </section>

      <section class="rf110-block"><header><small>DEINE ENTSCHEIDUNG</small><h3>Datenfreigaben</h3><p>Alle vier Bereiche sind unabhängig. Ohne Freigabe werden dort keine neuen Daten übertragen.</p></header>
        ${consentRow("cloud", "Cloud-Sicherung", "Trainings- und Körperdaten verschlüsselt im eigenen Supabase-Konto sichern.", p.cloudHealthConsent, "blue")}
        ${consentRow("leaderboard", "Öffentliche Bestenlisten", "Nur Spitzname, Avatar, Rang und zusammengefasste Werte der gewählten Sportart.", p.leaderboardConsent, "pink")}
        ${consentRow("garmin", "Garmin-Aktivitäten", "Nach einmaligem Verbinden neue Aktivitäten laufend über die Garmin Push API übernehmen.", p.garminDataConsent, "green")}
        ${consentRow("diagnostics", "Technische Diagnosecodes", "Nur technische Codes und Zähler in ein Supportpaket aufnehmen – keine Trainingsinhalte.", p.diagnosticsConsent, "gold")}
      </section>

      <section class="rf110-block"><header><small>SICHERN & PRÜFEN</small><h3>Deine Daten bleiben portabel</h3></header><div class="rf110-actions">
        <button type="button" class="button button--primary" data-action="rf110-backup">JSON-Backup erstellen</button>
        <button type="button" class="button button--secondary" data-action="rf110-validate">Daten prüfen</button>
        <button type="button" class="button button--secondary" data-action="rf110-support-bundle">Supportpaket</button>
        <button type="button" class="button button--secondary" data-action="rf110-support-mail">Support kontaktieren</button>
      </div><p class="rf110-privacy-note">Das Supportpaket enthält keine E-Mail-Adresse, Namen, IDs, Gewichte, Übungen, Notizen oder Zugangsdaten.</p></section>

      <section class="rf110-mobility-note"><strong>500 Mobilitätsübungen</strong><p>50 kuratierte Basisvarianten sind mit „Geprüfte Basis“ auffindbar. Alle Varianten bleiben allgemeine Fitnesshinweise und ersetzen keine medizinische Beratung.</p></section>
    </div>`;
  }

  function injectBeforeScreenEnd(html, addition) {
    return typeof html === "string" && /<\/section>\s*$/u.test(html) ? html.replace(/<\/section>\s*$/u, `${addition}</section>`) : `${html}${addition}`;
  }

  function productionEntry() {
    return `<section class="rf110-entry"><button type="button" data-action="rf110-open-production"><span>10.10</span><div><small>SICHERHEIT · BACKUP · VERBINDUNGEN</small><strong>Produktionscenter</strong><p>Freigaben verwalten, Daten prüfen und ein sicheres Supportpaket erstellen.</p></div><i>›</i></button></section>`;
  }

  function enhanceLeaderboardProfile(app, html) {
    if (app.ui?.modal?.type !== "rf109-leader-profile" || typeof html !== "string") return html;
    const entryId = String(app.ui.modal.entryId || "");
    const isMe = SPORTS.some(sport => (app.ui?.rf109Leaderboards?.[sport]?.rows || []).some(row => String(row?.id) === entryId && row?.isMe));
    if (!entryId || isMe) return html;
    const actions = `<div class="rf110-community-actions"><button type="button" data-action="rf110-report-profile" data-entry-id="${attr(entryId)}" data-sport="${attr(app.ui.modal.sport || "strength")}">Profil melden</button><button type="button" data-action="rf110-block-profile" data-entry-id="${attr(entryId)}">Profil blockieren</button></div>`;
    return html.replace(/(<p class="rf109-profile-privacy">)/u, `${actions}$1`);
  }

  async function withdrawLeaderboard(app) {
    const p = privacy(app);
    p.leaderboardConsent = false;
    Object.values(app.ui?.rf109Leaderboards || {}).forEach(state => { if (state) { state.rows = []; state.loadedAt = 0; } });
    try {
      if (navigator.onLine !== false && accountStatus().signedIn) {
        await rpc("evorank_leaderboard_consent", { p_enabled:false });
        p.pendingRevocations.leaderboard = false;
      } else p.pendingRevocations.leaderboard = true;
    } catch {
      p.pendingRevocations.leaderboard = true;
    }
  }

  async function disconnectGarmin(app) {
    const p = privacy(app);
    p.garminDataConsent = false;
    try {
      const config = window.RANKFORGE_GARMIN_CONNECT || {};
      if (navigator.onLine !== false && app.state?.garmin?.connection?.status === "connected" && config.disconnectPath) {
        const endpoint = new URL(config.disconnectPath, location.origin);
        if (endpoint.origin !== location.origin) throw new Error("invalid_endpoint");
        const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
        if (!token) throw new Error("not_authenticated");
        const response = await fetch(endpoint, { method:"POST", credentials:"same-origin", headers:{ accept:"application/json", authorization:`Bearer ${token}` } });
        if (!response.ok) throw new Error("disconnect_failed");
        p.pendingRevocations.garmin = false;
      } else if (app.state?.garmin?.connection?.status === "connected") p.pendingRevocations.garmin = true;
    } catch { p.pendingRevocations.garmin = true; }
    if (app.state?.garmin?.connection) app.state.garmin.connection.status = "disconnected";
  }

  async function toggleConsent(app, type) {
    const p = privacy(app);
    if (type === "cloud") {
      const next = !p.cloudHealthConsent;
      if (!next && !confirm("Cloud-Sicherung pausieren?\n\nNeue Änderungen bleiben danach auf diesem Gerät. Bereits gespeicherte Cloud-Daten werden nicht automatisch gelöscht.")) return;
      p.cloudHealthConsent = next;
      window.RANKFORGE_BRIDGE?.setCloudConsent?.(next);
      if (next && !accountStatus().signedIn) window.RANKFORGE_ACCOUNT_UI?.open?.();
      else if (next) await window.RANKFORGE_BRIDGE?.reconcile?.();
    }
    if (type === "leaderboard") {
      if (p.leaderboardConsent) await withdrawLeaderboard(app);
      else {
        const status = accountStatus();
        if (!status.signedIn || !status.hasProfile) { window.RANKFORGE_ACCOUNT_UI?.open?.(); return app.showToast("Bitte zuerst anmelden und einen Spitznamen anlegen."); }
        if (navigator.onLine === false) return app.showToast("Zum Freigeben der Bestenliste wird Internet benötigt.");
        try {
          await rpc("evorank_leaderboard_consent", { p_enabled:true });
          p.leaderboardConsent = true;
          p.pendingRevocations.leaderboard = false;
          await window.EVORANK109?.publishLeaderboards?.(app);
        } catch (error) { return app.showToast(error.message || "Freigabe nicht möglich."); }
      }
    }
    if (type === "garmin") {
      if (p.garminDataConsent) await disconnectGarmin(app);
      else p.garminDataConsent = true;
    }
    if (type === "diagnostics") p.diagnosticsConsent = !p.diagnosticsConsent;
    p.consentVersion = CONSENT_VERSION;
    p.consentUpdatedAt = new Date().toISOString();
    app.scheduleSave?.();
    app.render?.();
  }

  async function flushRevocations(app) {
    const p = privacy(app);
    if (navigator.onLine === false || !accountStatus().signedIn) return;
    if (p.pendingRevocations.leaderboard) await withdrawLeaderboard(app);
    if (p.pendingRevocations.garmin) await disconnectGarmin(app);
    app.scheduleSave?.();
  }

  function postNativeActivity(app, action, payload = {}) {
    const allowed = {
      action:String(action || "update").slice(0, 30),
      status:String(payload.status || "").slice(0, 20),
      label:String(payload.label || "Satzpause").slice(0, 80),
      durationSeconds:Math.max(0, Math.round(finite(payload.durationSeconds))),
      remainingSeconds:Math.max(0, Math.round(finite(payload.remainingSeconds))),
      currentSet:Math.max(0, Math.round(finite(payload.currentSet ?? (app?.state?.draft ? completedSetCount(app.state.draft) : 0)))),
      totalSets:Math.max(0, Math.round(finite(payload.totalSets ?? (app?.state?.draft ? totalSetCount(app.state.draft) : 0)))),
      endTimestamp:Number.isFinite(Number(payload.endTimestamp)) ? Number(payload.endTimestamp) : null,
      isPaused:Boolean(payload.isPaused),
      timerId:String(payload.timerId ?? payload.id ?? app?.ui?.restTimer?.id ?? '').slice(0,90),
      sound:payload.sound ?? Boolean(app?.state?.settings?.sound),
      notifications:payload.notifications ?? Boolean(app?.state?.settings?.restNotifications),
      haptics:payload.haptics ?? Boolean(app?.state?.settings?.haptics),
      interruptOtherAudio:payload.interruptOtherAudio ?? (app?.state?.settings?.interruptMusicOnAlarm !== false),
      alarmVolume:Math.min(1,Math.max(0,Number(payload.alarmVolume ?? app?.state?.settings?.alarmVolume ?? .8)))
    };
    try {
      if (window.webkit?.messageHandlers?.evorankLiveActivity) {
        window.webkit.messageHandlers.evorankLiveActivity.postMessage(allowed);
        if (app?.ui) app.ui.nativeTimerAvailable = true;
        return true;
      }
      if (window.EVORANK_NATIVE_ACTIVITY?.postMessage) {
        window.EVORANK_NATIVE_ACTIVITY.postMessage(allowed);
        if (app?.ui) app.ui.nativeTimerAvailable = true;
        return true;
      }
    } catch { /* the web timer remains available */ }
    return false;
  }

  const proto = AppClass.prototype;
  proto.__evorank110Installed = true;
  const previous = {
    renderProfile:proto.renderProfile,
    renderModal:proto.renderModal,
    renderExercisePickerModal:proto.renderExercisePickerModal,
    handleClick:proto.handleClick,
    postNativeTimer:proto.postNativeTimer,
    exportData:proto.exportData,
    init:proto.init
  };

  proto.renderProfile = function(...args) {
    privacy(this);
    return injectBeforeScreenEnd(previous.renderProfile.apply(this, args), productionEntry());
  };

  proto.renderModal = function(...args) {
    if (this.ui?.modal?.type === "rf110-production") {
      return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet rf110-production-modal" role="dialog" aria-modal="true">${productionModal(this)}</section></div>`;
    }
    return enhanceLeaderboardProfile(this, previous.renderModal.apply(this, args));
  };

  proto.renderExercisePickerModal = function(...args) {
    const html = previous.renderExercisePickerModal.apply(this, args);
    const quick = `<button type="button" class="rf110-reviewed-filter ${String(this.ui.exerciseSearch || "").toLocaleLowerCase("de").includes("geprüfte basis") ? "is-active" : ""}" data-action="rf110-reviewed-filter"><span>✓</span><div><strong>50 Basisübungen</strong><small>Sanfte Standardvarianten für den Einstieg</small></div></button>`;
    return typeof html === "string" ? html.replace(/(<button[^>]+class="rf109-stretch-filter[\s\S]*?<\/button>)/u, `$1${quick}`) : html;
  };

  proto.postNativeTimer = function(action, payload = {}) {
    const originalResult = typeof previous.postNativeTimer === "function" ? previous.postNativeTimer.call(this, action, payload) : false;
    return postNativeActivity(this, action, payload) || originalResult;
  };

  proto.exportData = function(...args) {
    const p = privacy(this);
    p.lastBackupAt = new Date().toISOString();
    this.scheduleSave?.();
    return previous.exportData.apply(this, args);
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (action === "rf110-open-production") { event.preventDefault(); this.openModal("rf110-production"); return; }
    if (action === "rf110-toggle-consent") { event.preventDefault(); await toggleConsent(this, element.dataset.consent); return; }
    if (action === "rf110-backup") { event.preventDefault(); this.exportData(); this.render(); return; }
    if (action === "rf110-validate") {
      event.preventDefault();
      const result = validation(this);
      this.scheduleSave?.();
      this.render();
      this.showToast(result.ok ? "Datenprüfung abgeschlossen: alles in Ordnung." : `Datenprüfung: ${result.codes.length} Hinweis(e).`);
      return;
    }
    if (action === "rf110-support-bundle") {
      event.preventDefault();
      downloadJson(`evorank-support-10.10-${new Date().toISOString().slice(0, 10)}.json`, supportBundle(this));
      this.showToast("Sicheres Supportpaket erstellt.");
      return;
    }
    if (action === "rf110-support-mail") {
      event.preventDefault();
      location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("EVORANK 10.10 Support")}&body=${encodeURIComponent("Bitte beschreibe kurz, was passiert ist. Hänge bei Bedarf das sichere Supportpaket an.\n\nKeine Passwörter oder Zugangsdaten mitsenden.")}`;
      return;
    }
    if (action === "rf110-reviewed-filter") {
      event.preventDefault();
      this.ui.exerciseSearch = "geprüfte basis";
      this.ui.exerciseMuscle = "Alle";
      this.ui.exerciseEquipment = "Alle";
      this.render();
      return;
    }
    if (action === "rf110-report-profile") {
      event.preventDefault();
      const reason = prompt("Warum möchtest du dieses Profil melden?\n\nBitte keine privaten oder medizinischen Daten eingeben.", "Unangemessener Profilinhalt");
      if (!reason) return;
      try {
        await rpc("evorank_leaderboard_report", { p_reported_user_id:element.dataset.entryId, p_sport:element.dataset.sport, p_reason:String(reason).slice(0, 500) });
        this.showToast("Profil wurde zur Prüfung gemeldet.");
      } catch (error) { this.showToast(error.message || "Meldung nicht möglich."); }
      return;
    }
    if (action === "rf110-block-profile") {
      event.preventDefault();
      if (!confirm("Dieses Profil blockieren? Es wird auf diesem Gerät nicht mehr in Bestenlisten angezeigt.")) return;
      const id = String(element.dataset.entryId || "");
      const p = privacy(this);
      p.blockedLeaderboardIds = [...new Set([...p.blockedLeaderboardIds, id])].filter(Boolean).slice(-200);
      Object.values(this.ui?.rf109Leaderboards || {}).forEach(state => { if (state?.rows) state.rows = state.rows.filter(row => String(row?.id || "") !== id); });
      try { await rpc("evorank_leaderboard_block", { p_blocked_user_id:id, p_blocked:true }); } catch { /* local block remains active */ }
      this.ui.modal = null;
      this.scheduleSave?.();
      this.render();
      this.showToast("Profil blockiert.");
      return;
    }
    if (["rf970-garmin-connect", "rf970-garmin-sync"].includes(action) && !privacy(this).garminDataConsent) {
      event.preventDefault();
      this.showToast("Bitte Garmin zuerst im Produktionscenter freigeben.");
      this.openModal("rf110-production");
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    privacy(this);
    runtimeStore(this);
    window.addEventListener("error", event => recordRuntimeIssue(this, event, "runtime_error"));
    window.addEventListener("unhandledrejection", event => recordRuntimeIssue(this, event, "promise_rejection"));
    window.addEventListener("online", () => flushRevocations(this).catch(() => {}));
    window.setTimeout(() => flushRevocations(this).catch(() => {}), 1200);
    this.scheduleSave?.();
    return result;
  };

  window.EVORANK110 = Object.freeze({
    version:VERSION,
    build:BUILD,
    schema:SCHEMA,
    ensurePrivacy:(app = window.RANKFORGE_APP) => privacy(app),
    validate:(app = window.RANKFORGE_APP) => validation(app),
    supportBundle:(app = window.RANKFORGE_APP) => supportBundle(app),
    postNativeActivity:(action, payload, app = window.RANKFORGE_APP) => postNativeActivity(app, action, payload)
  });
  window.EVORANK = Object.freeze({ name:"EVORANK", version:VERSION, build:BUILD, legacyStorageCompatible:true });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
