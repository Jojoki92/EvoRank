/* =============================================================================
 * RANKFORGE 9.3 — Freunde über echte Konten
 *
 * Löst das alte Live-Freunde-System (RF880) ab. Dort konnte jeder mit dem
 * öffentlichen Schlüssel Profile schreiben und durchsuchen; der einzige
 * "Besitznachweis" war ein selbst erzeugtes Token im lokalen Speicher. Auf so
 * etwas lassen sich keine Freundschaftsanfragen bauen — "annehmen" braucht
 * jemanden, dem der Server glauben kann.
 *
 * Jetzt: Profile hängen an auth.uid(), Freundschaft ist beidseitig bestätigt,
 * und Trainingsdaten eines Freundes sieht nur, wer bestätigt befreundet ist.
 *
 * Die vorhandene Freundes- und Ranglisten-Oberfläche bleibt unverändert. Dieses
 * Modul füttert nur ihre Datenquelle (state.liveFriends) aus der neuen Tabelle.
 * ========================================================================== */
(function (AppClass) {
  "use strict";
  if (!AppClass || AppClass.prototype.__rf93FriendsInstalled) return;

  const proto = AppClass.prototype;
  proto.__rf93FriendsInstalled = true;

  const previous = {
    handleClick: proto.handleClick,
    renderFriends: proto.renderFriends,
    init: proto.init,
    scheduleSave: proto.scheduleSave
  };

  const SYNC_INTERVAL_MS = 30_000;
  const PUBLISH_DEBOUNCE_MS = 8_000;

  let panel = null;
  let ansicht = "uebersicht";
  let meldung = "";
  let erfolg = "";
  let laeuft = false;
  let suchtext = "";
  let suchergebnis = [];
  let daten = { friends: [], incoming: [], outgoing: [] };
  let syncTimer = null;
  let publishTimer = null;
  let letzterSnapshot = "";
  let syncGeneration = 0;
  let letzteAktualisierung = "";

  const konto = () => window.RANKFORGE_ACCOUNT;
  const app = () => window.RANKFORGE_APP;

  function angemeldet() {
    const status = konto()?.status?.();
    return Boolean(status?.configured && status.signedIn);
  }

  function escape(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, zeichen => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[zeichen]);
  }

  // ------------------------------------------------------------------ Altsystem stilllegen

  /**
   * Das alte, nicht authentifizierte Veröffentlichen bleibt aus. Die Funktionen
   * in RF880 prüfen alle auf liveFriends.enabled, laufen also ins Leere. Die
   * gespeicherten Freunde bleiben erhalten und werden weiter angezeigt — sie
   * werden ab jetzt nur von diesem Modul aktualisiert.
   */
  function altsystemStilllegen(instance) {
    const live = instance?.state?.liveFriends;
    if (!live) return;
    if (live.enabled) live.enabled = false;
    if (live.writeToken) live.writeToken = "";
  }

  // ------------------------------------------------------------------ Datenfluss

  /** Baut die eigene Momentaufnahme mit den vorhandenen Mitteln der App. */
  function eigenerSnapshot(instance) {
    try {
      const snapshot = window.RANKFORGE880?.ownSnapshot?.(instance);
      if (!snapshot || typeof snapshot !== "object") return null;
      const status = konto().status();
      return {
        ...snapshot,
        ...(window.EVORANK_SPORTS_X53 ? {sportRanks:window.EVORANK_SPORTS_X53.publicRanks(instance)} : {}),
        athleteId: status.userId,
        name: status.displayName || snapshot.name || status.nickname || "Athlet",
        nickname: status.nickname || "",
        updatedAt: new Date().toISOString()
      };
    } catch (fehler) {
      console.warn("[RANKFORGE] Momentaufnahme konnte nicht gebaut werden:", fehler);
      return null;
    }
  }

  async function veroeffentlichen(options = {}) {
    const instance = app();
    if (!instance || !angemeldet() || navigator.onLine === false) return false;
    const status = konto().status();
    if (!status.hasProfile) return false;

    const snapshot = eigenerSnapshot(instance);
    if (!snapshot) return false;

    const serialisiert = JSON.stringify(snapshot);
    // Zeitstempel herausrechnen, sonst gilt jede Aufnahme als verändert.
    const vergleich = serialisiert.replace(/"updatedAt":"[^"]*"/, "");
    if (!options.force && vergleich === letzterSnapshot) return false;

    try {
      await konto().publishSnapshot(snapshot);
      letzterSnapshot = vergleich;
      return true;
    } catch (fehler) {
      console.warn("[RANKFORGE] Profil konnte nicht veröffentlicht werden:", fehler?.message || fehler);
      return false;
    }
  }

  /** Holt Freunde und Anfragen und schreibt die Freunde in den App-Zustand. */
  async function synchronisieren(options = {}) {
    const instance = app();
    if (!instance || !angemeldet() || navigator.onLine === false) return false;
    const userId = konto().status().userId;
    const generation = ++syncGeneration;

    try {
      const received = await konto().listFriends();
      if (generation !== syncGeneration || app() !== instance || !angemeldet() || konto().status().userId !== userId) return false;
      daten = received;
      letzteAktualisierung = new Date().toISOString();
    } catch (fehler) {
      if (generation !== syncGeneration || !angemeldet() || konto().status().userId !== userId) return false;
      if (instance.state?.liveFriends) instance.state.liveFriends.lastError = 'Aktualisierung fehlgeschlagen';
      if (!options.silent) {
        meldung = fehler?.message || "Freunde konnten nicht geladen werden";
        zeichne();
      }
      return false;
    }

    const live = instance.state?.liveFriends;
    if (live) {
      const ids = [];
      daten.friends.forEach(freund => {
        const id = String(freund.id || "").slice(0, 90);
        if (!id) return;
        ids.push(id);
        const snapshot = freund.snapshot && typeof freund.snapshot === "object" ? freund.snapshot : {};
        const eintrag = {
          ...snapshot,
          athleteId: id,
          name: String(freund.displayName || freund.nickname || snapshot.name || "Freund").slice(0, 60),
          nickname: String(freund.nickname || "").slice(0, 30),
          updatedAt: freund.updatedAt || snapshot.updatedAt || new Date().toISOString()
        };
        live.snapshots[id] = eintrag;
        try { window.RANKFORGE87?.upsertFriend?.(instance, eintrag); } catch { /* Anzeige nur */ }
      });
      // Entfernte Freundschaften auch lokal wegräumen.
      live.friendIds = ids;
      Object.keys(live.snapshots).forEach(id => {
        if (!ids.includes(id)) delete live.snapshots[id];
      });
      live.lastSyncedAt = new Date().toISOString();
      live.lastError = "";
      instance.scheduleSave?.();
    }

    if (!options.silent || panelOffen()) zeichne();
    if (instance.ui?.view === "friends" || instance.ui?.rankTab === "leagues") instance.render?.();
    return true;
  }

  function starteZyklus() {
    window.clearInterval(syncTimer);
    if (!angemeldet()) return;
    syncTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      synchronisieren({ silent: true });
      veroeffentlichen({ });
    }, SYNC_INTERVAL_MS);
  }

  // ------------------------------------------------------------------ Oberfläche

  const CSS = `
.rf94{position:fixed;inset:0;z-index:9100;min-height:100dvh;
  padding:calc(20px + env(safe-area-inset-top,0px)) 16px calc(20px + env(safe-area-inset-bottom,0px));
  display:grid;place-items:start center;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:radial-gradient(circle at 50% -10%,rgba(47,125,255,.2),transparent 40%),linear-gradient(180deg,#070a10,#030509);
  color:#f6f8fc;font-family:inherit}
.rf94[hidden]{display:none!important}
.rf94__card{width:min(100%,460px);padding:20px;border:1px solid rgba(142,160,194,.18);
  border-radius:26px;background:rgba(14,18,27,.94);box-shadow:0 28px 80px rgba(0,0,0,.48)}
.rf94__head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.rf94__head small{display:block;color:#2f7dff;font-size:.5rem;font-weight:950;letter-spacing:.13em;text-transform:uppercase}
.rf94__head h1{margin:6px 0 0;font-size:1.35rem;font-weight:900}
.rf94__close{width:38px;height:38px;flex:0 0 38px;border-radius:12px;cursor:pointer;
  border:1px solid rgba(142,160,194,.18);background:transparent;color:#9aa7bd;font-size:1rem;font-family:inherit}
.rf94__me{margin:16px 0;padding:12px;border-radius:14px;background:#111722;
  border:1px solid rgba(142,160,194,.15);display:flex;justify-content:space-between;align-items:center;gap:10px}
.rf94__me span{color:#8e9aaf;font-size:.58rem;font-weight:800}
.rf94__me strong{font-size:.75rem;font-weight:900}
.rf94__tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px}
.rf94__tab{min-height:38px;border-radius:11px;cursor:pointer;font-family:inherit;
  border:1px solid rgba(142,160,194,.15);background:transparent;color:#9aa7bd;
  font-size:.6rem;font-weight:850}
.rf94__tab.is-active{background:rgba(47,125,255,.14);border-color:rgba(47,125,255,.4);color:#cfe0ff}
.rf94__tab b{display:inline-block;min-width:16px;margin-left:4px;padding:0 4px;border-radius:8px;
  background:#2f7dff;color:#fff;font-size:.52rem}
.rf94__search{display:grid;grid-template-columns:1fr auto;gap:8px;margin-bottom:12px}
.rf94__search input{height:48px;padding:0 14px;border-radius:13px;border:1px solid rgba(142,160,194,.18);
  background:#0b1019;color:#fff;font-size:16px;font-weight:600;outline:0;
  -webkit-appearance:none;appearance:none;min-width:0}
.rf94__search input:focus{border-color:#2f7dff}
.rf94__search button{padding:0 16px;border:0;border-radius:13px;cursor:pointer;font-family:inherit;
  background:linear-gradient(135deg,#3f8cff,#1d64e8);color:#fff;font-size:.62rem;font-weight:900}
.rf94__list{display:grid;gap:8px}
.rf94__item{padding:11px 12px;border-radius:14px;background:#111722;
  border:1px solid rgba(142,160,194,.15);display:flex;align-items:center;gap:10px}
.rf94__item div{flex:1;min-width:0}
.rf94__item strong{display:block;font-size:.7rem;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rf94__item small{display:block;color:#8e9aaf;font-size:.56rem;margin-top:2px}
.rf94__act{min-height:34px;padding:0 11px;border-radius:11px;cursor:pointer;font-family:inherit;
  border:0;background:rgba(47,125,255,.16);color:#9dc3ff;font-size:.58rem;font-weight:900;white-space:nowrap}
.rf94__act--ghost{background:transparent;border:1px solid rgba(142,160,194,.2);color:#8e9aaf}
.rf94__act--danger{background:transparent;border:1px solid rgba(255,126,134,.28);color:#ff7e86}
.rf94__act[disabled]{opacity:.5;cursor:default}
.rf94__empty{padding:22px 12px;text-align:center;color:#6f7788;font-size:.63rem;line-height:1.6}
.rf94__error{min-height:16px;color:#ff7e86;font-size:.62rem;line-height:1.4;margin:8px 0 0}
.rf94__ok{min-height:16px;color:#42d993;font-size:.62rem;line-height:1.4;margin:8px 0 0}
.rf94__note{margin-top:14px;padding:11px 12px;border-radius:13px;border:1px solid rgba(47,125,255,.16);
  background:rgba(47,125,255,.06);color:#9aa7bd;font-size:.6rem;line-height:1.5}
.rf94-open{width:100%;min-height:46px;margin:10px 0;border-radius:14px;cursor:pointer;font-family:inherit;
  border:0;background:linear-gradient(135deg,#3f8cff,#1d64e8);color:#fff;font-size:.68rem;font-weight:900}
@media (prefers-reduced-motion:reduce){.rf94__act:active{transform:none}}
`;

  function stylesEinbinden() {
    if (document.getElementById("rf94-styles")) return;
    const knoten = document.createElement("style");
    knoten.id = "rf94-styles";
    knoten.textContent = CSS;
    document.head.append(knoten);
  }

  const panelOffen = () => Boolean(panel && !panel.hidden);

  function personZeile(person, aktionen) {
    const name = person.displayName || person.nickname || "Athlet";
    return `<div class="rf94__item">
      <div>
        <strong>${escape(name)}</strong>
        <small>@${escape(person.nickname || "")}${person.rank ? " · " + escape(person.rank) : ""}</small>
      </div>
      ${aktionen}
    </div>`;
  }

  function uebersichtMarkup() {
    if (!daten.friends.length) {
      return `<div class="rf94__empty">
        Noch keine Freunde.<br>Such jemanden über seinen Spitznamen und schick eine Anfrage.
      </div>`;
    }
    return `<div class="rf94__list">${daten.friends.map(freund => personZeile(freund,
      `<button class="rf94__act rf94__act--danger" data-rf94="entfernen" data-id="${escape(freund.id)}" ${laeuft ? "disabled" : ""}>Entfernen</button>`
    )).join("")}</div>`;
  }

  function anfragenMarkup() {
    const eingehend = daten.incoming.length
      ? `<div class="rf94__list">${daten.incoming.map(anfrage => personZeile(anfrage,
          `<button class="rf94__act" data-rf94="annehmen" data-id="${escape(anfrage.requestId)}" ${laeuft ? "disabled" : ""}>Annehmen</button>` +
          `<button class="rf94__act rf94__act--ghost" data-rf94="ablehnen" data-id="${escape(anfrage.requestId)}" ${laeuft ? "disabled" : ""}>Ablehnen</button>`
        )).join("")}</div>`
      : `<div class="rf94__empty">Keine offenen Anfragen.</div>`;

    const ausgehend = daten.outgoing.length
      ? `<div class="rf94__list" style="margin-top:14px">${daten.outgoing.map(anfrage => personZeile(anfrage,
          `<button class="rf94__act rf94__act--ghost" data-rf94="zuruecknehmen" data-id="${escape(anfrage.requestId)}" ${laeuft ? "disabled" : ""}>Zurücknehmen</button>`
        )).join("")}</div>`
      : "";

    return eingehend + (ausgehend ? `<p class="rf94__note">Von dir gesendet, noch nicht bestätigt:</p>${ausgehend}` : "");
  }

  function suchenMarkup() {
    const treffer = suchergebnis.length
      ? `<div class="rf94__list">${suchergebnis.map(person => {
          const schonFreund = daten.friends.some(f => f.id === person.id);
          const schonAngefragt = daten.outgoing.some(f => f.id === person.id)
            || daten.incoming.some(f => f.id === person.id);
          const knopf = schonFreund
            ? `<button class="rf94__act rf94__act--ghost" disabled>Befreundet</button>`
            : schonAngefragt
              ? `<button class="rf94__act rf94__act--ghost" disabled>Angefragt</button>`
              : `<button class="rf94__act" data-rf94="anfragen" data-nickname="${escape(person.nickname)}" ${laeuft ? "disabled" : ""}>Anfrage</button>`;
          return personZeile(person, knopf);
        }).join("")}</div>`
      : suchtext
        ? `<div class="rf94__empty">Niemand mit diesem Spitznamen gefunden.</div>`
        : `<div class="rf94__empty">Such nach dem Spitznamen, den dir dein Trainingspartner gesagt hat.</div>`;

    return `<form class="rf94__search" data-rf94-form="suche">
      <input type="text" name="query" value="${escape(suchtext)}" maxlength="20"
             inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false"
             enterkeyhint="search" placeholder="@spitzname" ${laeuft ? "disabled" : ""}>
      <button type="submit" ${laeuft ? "disabled" : ""}>Suchen</button>
    </form>${treffer}`;
  }

  function panelMarkup() {
    const status = konto()?.status?.() || {};
    if (!status.signedIn) {
      return `<div class="rf94__card">
        <div class="rf94__head"><div><small>Freunde</small><h1>Anmeldung nötig</h1></div>
          <button class="rf94__close" data-rf94="schliessen" aria-label="Schließen">✕</button></div>
        <div class="rf94__empty">Freunde brauchen ein Konto — sonst könnte jeder in
          deinem Namen Anfragen annehmen.</div>
      </div>`;
    }
    if (!status.hasProfile) {
      return `<div class="rf94__card">
        <div class="rf94__head"><div><small>Freunde</small><h1>Spitzname fehlt</h1></div>
          <button class="rf94__close" data-rf94="schliessen" aria-label="Schließen">✕</button></div>
        <div class="rf94__empty">Vergib zuerst einen Spitznamen — darüber finden dich andere.</div>
        <button class="rf94-open" data-rf94="spitzname">Spitzname vergeben</button>
      </div>`;
    }

    const inhalt = ansicht === "anfragen" ? anfragenMarkup()
      : ansicht === "suchen" ? suchenMarkup()
      : uebersichtMarkup();

    return `<div class="rf94__card">
      <div class="rf94__head">
        <div><small>Freunde</small><h1>Deine Trainingsgruppe</h1></div>
        <button class="rf94__close" data-rf94="schliessen" aria-label="Schließen">✕</button>
      </div>
      <div class="rf94__me">
        <span>Dein Spitzname</span>
        <strong>@${escape(status.nickname)}</strong>
      </div>
      <div class="rf94__sync"><span>${letzteAktualisierung ? `Stand ${new Date(letzteAktualisierung).toLocaleTimeString('de',{hour:'2-digit',minute:'2-digit'})}` : 'Noch nicht aktualisiert'} · alle 30 Sek. bei geöffneter App</span><button class="rf94__act" data-rf94="aktualisieren">↻ Aktualisieren</button></div>
      <div class="rf94__tabs">
        <button class="rf94__tab ${ansicht === "uebersicht" ? "is-active" : ""}" data-rf94="tab" data-tab="uebersicht">Freunde</button>
        <button class="rf94__tab ${ansicht === "anfragen" ? "is-active" : ""}" data-rf94="tab" data-tab="anfragen">Anfragen${daten.incoming.length ? `<b>${daten.incoming.length}</b>` : ""}</button>
        <button class="rf94__tab ${ansicht === "suchen" ? "is-active" : ""}" data-rf94="tab" data-tab="suchen">Suchen</button>
      </div>
      ${inhalt}
      ${meldung ? `<p class="rf94__error">${escape(meldung)}</p>` : ""}
      ${erfolg ? `<p class="rf94__ok">${escape(erfolg)}</p>` : ""}
      <div class="rf94__note">
        Deine E-Mail-Adresse sieht niemand. Trainingsdaten teilst du nur mit
        bestätigten Freunden — eine Anfrage allein gibt noch keinen Einblick.
      </div>
    </div>`;
  }

  function zeichne() {
    if (panelOffen()) panel.innerHTML = panelMarkup();
  }

  function oeffnen() {
    stylesEinbinden();
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "rf94";
      panel.addEventListener("click", event => {
        const element = event.target.closest("[data-rf94]");
        if (element) aktion(element.dataset.rf94, element);
      });
      panel.addEventListener("submit", event => {
        const formular = event.target.closest("[data-rf94-form]");
        if (!formular) return;
        event.preventDefault();
        suchen(String(formular.querySelector("[name=query]")?.value || ""));
      });
      document.body.append(panel);
    }
    panel.hidden = false;
    meldung = "";
    erfolg = "";
    zeichne();
    if (angemeldet()) synchronisieren({ silent: true });
  }

  function schliessen() {
    if (panel) panel.hidden = true;
    if (location.hash === "#freunde") history.replaceState(null, "", location.pathname + location.search);
  }

  async function suchen(query) {
    suchtext = konto().normalizeNickname(query);
    meldung = "";
    erfolg = "";
    laeuft = true;
    zeichne();
    try {
      suchergebnis = await konto().searchProfiles(suchtext);
    } catch (fehler) {
      suchergebnis = [];
      meldung = fehler?.message || "Suche fehlgeschlagen";
    } finally {
      laeuft = false;
      zeichne();
    }
  }

  async function aktion(name, element) {
    if (name === "aktualisieren") { await synchronisieren(); return; }
    if (name === "schliessen") { schliessen(); return; }
    if (name === "tab") {
      ansicht = element.dataset.tab || "uebersicht";
      meldung = "";
      erfolg = "";
      zeichne();
      return;
    }
    if (name === "spitzname") {
      schliessen();
      location.hash = "#konto";
      window.RANKFORGE_ACCOUNT_UI?.open?.();
      return;
    }

    const bestaetigen = {
      entfernen: "Diese Freundschaft wirklich beenden?"
    }[name];
    if (bestaetigen && !window.confirm(bestaetigen)) return;

    meldung = "";
    erfolg = "";
    laeuft = true;
    zeichne();

    try {
      if (name === "anfragen") {
        await konto().sendFriendRequest(element.dataset.nickname);
        erfolg = "Anfrage gesendet.";
      } else if (name === "annehmen") {
        await konto().acceptFriendRequest(element.dataset.id);
        erfolg = "Ihr seid jetzt befreundet.";
        veroeffentlichen({ force: true });
      } else if (name === "ablehnen" || name === "zuruecknehmen") {
        await konto().declineFriendRequest(element.dataset.id);
      } else if (name === "entfernen") {
        await konto().removeFriend(element.dataset.id);
      }
      await synchronisieren({ silent: true });
    } catch (fehler) {
      meldung = fehler?.message || "Das hat nicht geklappt";
    } finally {
      laeuft = false;
      zeichne();
    }
  }

  // ------------------------------------------------------------------ Einhängen

  proto.renderFriends = function () {
    let html = previous.renderFriends.call(this);
    const status = konto()?.status?.() || {};
    const offen = daten.incoming.length;
    const label = !status.signedIn
      ? "Freunde brauchen ein Konto — jetzt anmelden"
      : offen
        ? `Freunde verwalten (${offen} offene Anfrage${offen === 1 ? "" : "n"})`
        : "Freunde suchen und verwalten";
    return `<button type="button" class="button button--primary rf94-open" data-action="rf93-friends-open">${escape(label)}</button>${html}`;
  };

  proto.handleClick = async function (event) {
    const element = event?.target instanceof Element ? event.target.closest("[data-action]") : null;
    const action = element?.dataset?.action;

    if (action === "rf93-friends-open") {
      event.preventDefault();
      if (!angemeldet()) { window.RANKFORGE_ACCOUNT_UI?.open?.(); return; }
      oeffnen();
      return;
    }

    // Die alten Einstiegspunkte auf das neue Fenster umbiegen, damit es keine
    // zweite, unauthentifizierte Tür zu denselben Daten mehr gibt.
    if (action === "rf880-open-live-settings" || action === "rf880-open-search"
      || action === "rf880-add-search-result" || action === "rf880-refresh") {
      event.preventDefault();
      event.stopPropagation();
      if (!angemeldet()) { window.RANKFORGE_ACCOUNT_UI?.open?.(); return; }
      ansicht = action === "rf880-open-search" ? "suchen" : "uebersicht";
      oeffnen();
      return;
    }

    return previous.handleClick.call(this, event);
  };

  proto.scheduleSave = function (...args) {
    const result = typeof previous.scheduleSave === "function"
      ? previous.scheduleSave.apply(this, args)
      : undefined;
    window.clearTimeout(publishTimer);
    publishTimer = window.setTimeout(() => veroeffentlichen({}), PUBLISH_DEBOUNCE_MS);
    return result;
  };

  proto.init = async function (...args) {
    const result = await previous.init.apply(this, args);
    altsystemStilllegen(this);
    if (angemeldet()) {
      synchronisieren({ silent: true }).then(() => veroeffentlichen({ force: true }));
      starteZyklus();
    }
    return result;
  };

  // Auf An- und Abmeldung reagieren.
  function beobachteKonto() {
    if (!konto()?.onChange) return;
    konto().onChange(status => {
      syncGeneration++;
      letzteAktualisierung = "";
      if (status.signedIn && status.hasProfile) {
        starteZyklus();
        synchronisieren({ silent: true });
      } else {
        window.clearInterval(syncTimer);
        daten = { friends: [], incoming: [], outgoing: [] };
        letzterSnapshot = "";
      }
      if (panelOffen()) zeichne();
    });
  }

  function start() {
    beobachteKonto();
    const pruefeHash = () => { if (location.hash === "#freunde") oeffnen(); };
    window.addEventListener("hashchange", pruefeHash);
    pruefeHash();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && angemeldet()) synchronisieren({ silent: true });
    });
    window.addEventListener("online", () => { if (angemeldet()) { synchronisieren({silent:true}); veroeffentlichen({}); } });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.RANKFORGE93_FRIENDS = Object.freeze({
    version: "X4.5",
    open: oeffnen,
    close: schliessen,
    refresh: () => synchronisieren({ silent: true }),
    publish: () => veroeffentlichen({ force: true }),
    data: () => JSON.parse(JSON.stringify(daten))
  });
})(typeof LiftoffApp === "function" ? LiftoffApp : null);
/* end-rankforge-v93-friends */
