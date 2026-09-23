/* =============================================================================
 * RANKFORGE 9.2 — Brücke zwischen Konto-Modul und bestehender App
 *
 * Diese Datei ist bewusst die EINZIGE Stelle, die beide Seiten kennt. Sie liest
 * und schreibt den Trainingsstand über die vorhandenen Speicherschlüssel, statt
 * in rankforge-v9.1.1.js einzugreifen. Dadurch bleibt die große Datei komplett
 * unverändert und das Refactoring später ungestört.
 *
 * Verhalten:
 *   - Nach der Anmeldung wird der Cloud-Stand geholt und mit dem lokalen verglichen.
 *   - Ist lokal nichts da  -> Cloud-Stand übernehmen.
 *   - Ist die Cloud leer   -> lokalen Stand hochladen.
 *   - Weichen beide ab     -> verlustfrei zusammenführen und automatisch sichern.
 *   - Danach: automatisch hochladen, wenn sich etwas geändert hat und Netz da ist.
 * ========================================================================== */
(function () {
  "use strict";

  const SAVE_DEBOUNCE_MS = 8000;
  const STATE_PREFIX = "uprank-training-v6:state:";
  const ACTIVE_ACCOUNT_KEY = "uprank-active-account";
  const DB_NAME = "uprank-training-v6";
  const DB_STORE = "states";

  let saveTimer = null;
  let lastPushed = "";
  let busy = false;

  const account = () => window.RANKFORGE_ACCOUNT;

  function read(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }

  function cloudConsent(state) {
    // If the account-scoped consent module failed to load, never fall back to
    // a device-wide legacy flag or an unverified local profile.
    return window.EVORANK_CLOUD_CONSENT_X49?.read?.(state) === true;
  }

  function setCloudConsent(enabled) {
    return window.EVORANK_CLOUD_CONSENT_X49?.set?.(enabled) === true;
  }

  function localKey() {
    const active = read(ACTIVE_ACCOUNT_KEY) || "";
    return active ? STATE_PREFIX + active : "";
  }

  function activeAccount() {
    return read(ACTIVE_ACCOUNT_KEY) || "";
  }

  function readLocalState() {
    const app = window.RANKFORGE_APP;
    if (app?.state && app.accountKey === activeAccount()) {
      try { return JSON.parse(JSON.stringify(app.state)); } catch { /* lokales Spiegelbild unten verwenden */ }
    }
    const key = localKey();
    if (!key) return null;
    try {
      const raw = read(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function openDatabase() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    return new Promise(resolve => {
      let request;
      try { request = window.indexedDB.open(DB_NAME, 1); } catch { resolve(null); return; }
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DB_STORE)) database.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }

  async function readIndexedState() {
    const accountKey = activeAccount();
    if (!accountKey) return null;
    const database = await openDatabase();
    if (!database) return null;
    try {
      return await new Promise(resolve => {
        const transaction = database.transaction(DB_STORE, "readonly");
        const request = transaction.objectStore(DB_STORE).get(`state:${accountKey}`);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
        transaction.onabort = () => resolve(null);
      });
    } catch {
      return null;
    } finally {
      database.close();
    }
  }

  async function readCurrentState() {
    const live = readLocalState();
    if (live) return live;
    return readIndexedState();
  }

  async function writeLocalState(state, accountKey = activeAccount()) {
    if (accountKey !== activeAccount()) return false;
    const key = accountKey ? STATE_PREFIX + accountKey : '';
    if (!key) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch { return false; }

    const database = await openDatabase();
    if (!database) return true;
    try {
      return await new Promise(resolve => {
        const transaction = database.transaction(DB_STORE, "readwrite");
        transaction.objectStore(DB_STORE).put(state, `state:${accountKey}`);
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      });
    } catch {
      return false;
    } finally {
      database.close();
    }
  }

  function recordKey(item, fallback) {
    if (!item || typeof item !== "object") return `value:${JSON.stringify(item)}`;
    return String(item.id || item.uuid || item.activityId || item.externalId ||
      item.startedAt || item.date || item.createdAt || fallback);
  }

  function recordTime(item) {
    if (!item || typeof item !== "object") return 0;
    for (const value of [item.updatedAt, item.completedAt, item.endedAt, item.startedAt, item.date, item.createdAt]) {
      const time = new Date(value || 0).getTime();
      if (Number.isFinite(time) && time > 0) return time;
    }
    return 0;
  }

  function mergeArray(local = [], remote = []) {
    const records = new Map();
    [...remote, ...local].forEach((item, index) => {
      const key = recordKey(item, index);
      const previous = records.get(key);
      if (!previous || recordTime(item) >= recordTime(previous)) records.set(key, item);
    });
    return [...records.values()].sort((a, b) => recordTime(a) - recordTime(b));
  }

  function mergeTrainingStates(local, remote) {
    const merged = { ...(remote || {}), ...(local || {}) };
    ["workouts", "sessions", "history", "log", "routines", "bodyMetrics"].forEach(field => {
      if (Array.isArray(local?.[field]) || Array.isArray(remote?.[field])) {
        merged[field] = mergeArray(local?.[field], remote?.[field]);
      }
    });
    for (const section of ["triathlon", "garmin"]) {
      if (!local?.[section] && !remote?.[section]) continue;
      merged[section] = { ...(remote?.[section] || {}), ...(local?.[section] || {}) };
      if (Array.isArray(local?.[section]?.activities) || Array.isArray(remote?.[section]?.activities)) {
        merged[section].activities = mergeArray(local?.[section]?.activities, remote?.[section]?.activities);
      }
    }
    return merged;
  }

  function toast(message) {
    // Nutzt die vorhandene Toast-Funktion der App, falls sie schon läuft.
    const app = window.RANKFORGE_APP;
    if (app && typeof app.showToast === "function") { app.showToast(message); return; }
    console.info("[RANKFORGE]", message);
  }

  // Merge into the most recent live state after network waits. Never reload a
  // page while someone is editing a workout or recording an endurance session.
  async function applyCloudState(remote, expectedAccount) {
    if (expectedAccount !== activeAccount()) return null;
    const app = window.RANKFORGE_APP;
    const latest = readLocalState();
    if (!cloudConsent(latest)) return null;
    const merged = latest ? mergeTrainingStates(latest, remote) : remote;
    if (app?.state && app.accountKey === expectedAccount) {
      const currentDraft = app.state.draft;
      app.state = typeof normalizeState === 'function'
        ? normalizeState(merged, expectedAccount) : merged;
      // Keep the active draft object: focused inputs and timer handlers may
      // still hold references to its sets while the cloud request is pending.
      if (currentDraft) app.state.draft = currentDraft;
      if (typeof getMetrics === 'function') app.metrics = getMetrics(app.state);
      app.scheduleSave?.();
      // New records are visible on the next ordinary render. Do not replace
      // forms, reset scrolling or interrupt the current screen in the background.
      window.dispatchEvent(new CustomEvent('evorank:cloud-merged'));
      await writeLocalState(app.state, expectedAccount);
      return expectedAccount === activeAccount() ? readLocalState() : null;
    }
    return await writeLocalState(merged, expectedAccount) ? merged : null;
  }

  /** Beim ersten Abgleich nach der Anmeldung. */
  async function reconcile() {
    if (busy || !account()?.status().signedIn) return;
    if (!cloudConsent(readLocalState())) return;
    busy = true;
    const expectedAccount = activeAccount();
    try {
      const remote = await account().pull();
      if (expectedAccount !== activeAccount()) return;
      const local = await readCurrentState();
      if (expectedAccount !== activeAccount()) return;
      if (!cloudConsent(local)) return;

      // Beide leer: nichts zu tun.
      if (!local && !remote) return;

      // Nur Cloud hat Daten: übernehmen.
      if (!local && remote) {
        const applied = await applyCloudState(remote.payload, expectedAccount);
        if (applied) lastPushed = JSON.stringify(applied);
        return;
      }

      // Nur lokal Daten: hochladen.
      if (local && !remote) {
        const result = await account().push(local);
        if (result.ok) {
          lastPushed = JSON.stringify(local);
          toast("Trainingsdaten in der Cloud gesichert");
        }
        return;
      }

      // Beides vorhanden: gleich? Dann fertig.
      const localJson = JSON.stringify(local);
      if (localJson === JSON.stringify(remote.payload)) {
        lastPushed = localJson;
        return;
      }

      // Unterschiede werden ohne blockierenden Dialog verlustfrei vereinigt.
      // Lokale Einstellungen gewinnen, Trainingslisten werden per ID/Datum
      // zusammengeführt. Dadurch geht weder der Geräte- noch der Cloud-Stand verloren.
      const merged = await applyCloudState(remote.payload, expectedAccount);
      if (merged && expectedAccount === activeAccount() && cloudConsent(readLocalState())) {
        const result = await account().push(merged, { force: true });
        if (result.ok) {
          lastPushed = JSON.stringify(merged);
        }
      }
    } catch (error) {
      console.warn("[RANKFORGE] Abgleich fehlgeschlagen:", error.message);
      // Bewusst still: Ein fehlgeschlagener Abgleich darf das Training nicht stören.
    } finally {
      busy = false;
    }
  }

  /** Läuft im Hintergrund, wenn sich der lokale Stand geändert hat. */
  async function pushIfChanged() {
    if (busy || !account()?.status().signedIn || navigator.onLine === false) return;
    const expectedAccount = activeAccount();
    const local = await readCurrentState();
    if (busy || expectedAccount !== activeAccount()) return;
    if (!cloudConsent(local)) return;
    if (!local) return;
    const json = JSON.stringify(local);
    if (json === lastPushed) return;

    busy = true;
    try {
      const result = await account().push(local);
      if (expectedAccount !== activeAccount()) return;
      if (result.ok) {
        lastPushed = json;
      } else if (result.conflict) {
        const merged = await applyCloudState(result.serverPayload || {}, expectedAccount);
        if (!merged || expectedAccount !== activeAccount() || !cloudConsent(readLocalState())) return;
        const saved = await account().push(merged, { force: true });
        if (saved.ok) {
          lastPushed = JSON.stringify(merged);
        }
      }
    } catch (error) {
      console.warn("[RANKFORGE] Hochladen fehlgeschlagen:", error.message);
    } finally {
      busy = false;
    }
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(pushIfChanged, SAVE_DEBOUNCE_MS);
  }

  function hookAppPersistence() {
    const app = window.RANKFORGE_APP;
    if (!app || app.__rf92CloudPersistenceHook || typeof app.persist !== "function") return false;
    const originalPersist = app.persist.bind(app);
    app.persist = async function(...args) {
      const result = await originalPersist(...args);
      scheduleSave();
      return result;
    };
    Object.defineProperty(app, "__rf92CloudPersistenceHook", { value: true });
    return true;
  }

  function start() {
    if (!account()?.status().configured) return;

    account().onChange(state => {
      if (state.signedIn) reconcile();
    });

    if (!hookAppPersistence()) {
      const hookTimer = window.setInterval(() => {
        if (hookAppPersistence()) window.clearInterval(hookTimer);
      }, 250);
    }

    // Auf lokale Änderungen reagieren, ohne die App anzufassen: localStorage.setItem
    // wird umschlossen. Das ist der am wenigsten invasive Weg.
    const original = window.localStorage.setItem.bind(window.localStorage);
    try {
      window.localStorage.setItem = function (key, value) {
        original(key, value);
        if (typeof key === "string" && key.startsWith(STATE_PREFIX)) scheduleSave();
      };
    } catch {
      // Manche Browser erlauben das nicht — dann greift der Intervall unten.
    }

    // Rückfallebene und Sicherung beim Verlassen der Seite.
    window.setInterval(pushIfChanged, 120_000);
    window.addEventListener("pagehide", () => { pushIfChanged(); });
    window.addEventListener("online", () => { pushIfChanged(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.RANKFORGE_BRIDGE = Object.freeze({
    version: "1.4.0",
    reconcile,
    pushNow: pushIfChanged,
    readLocalState,
    cloudConsent:() => cloudConsent(readLocalState()),
    setCloudConsent,
    mergeTrainingStates
  });
})();
