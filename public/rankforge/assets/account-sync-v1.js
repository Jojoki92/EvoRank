/* =============================================================================
 * RANKFORGE 9.2 — Konto und Cloud-Sicherung
 *
 * Eigenständiges Modul. Es hängt NICHT von rankforge-v9.1.1.js ab und wird von
 * dort auch nicht aufgerufen — die Verbindung entsteht ausschließlich über
 * window.RANKFORGE_ACCOUNT. Damit übersteht dieses Modul das Refactoring der
 * großen Datei unbeschadet.
 *
 * Anmeldung per Magic Link: E-Mail eintippen, Link anklicken, fertig.
 * Keine Passwörter, also auch nichts zu vergessen, zurückzusetzen oder zu leaken.
 *
 * Nutzt die Supabase-REST-Schnittstelle direkt statt des SDK. Grund: kein
 * zusätzliches Skript von einem CDN, damit bleibt die Content-Security-Policy
 * unverändert und es entsteht keine neue Lieferketten-Abhängigkeit.
 * ========================================================================== */
(function () {
  "use strict";

  const AUTH_KEY = "rankforge-auth-v1";
  const DEVICE_KEY = "rankforge-device-id-v1";
  const REVISION_KEY = "rankforge-cloud-revision-v1";
  const REFRESH_MARGIN_MS = 60_000;

  const listeners = new Set();
  let session = null;
  let refreshTimer = null;

  // ---------------------------------------------------------------- Konfiguration
  function config() {
    const raw = window.RANKFORGE_CLOUD || {};
    const url = String(raw.supabaseUrl || "").replace(/\/+$/, "");
    const key = String(raw.supabasePublishableKey || "");
    return { url, key, ready: Boolean(url && key) };
  }

  function store(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch { /* privater Modus o. Ä. — dann eben nur für diese Sitzung */ }
  }

  function read(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }

  function deviceId() {
    let id = read(DEVICE_KEY);
    if (!id) {
      id = (window.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2));
      store(DEVICE_KEY, id);
    }
    return id;
  }

  function deviceName() {
    const ua = String(navigator.userAgent || "");
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Macintosh/i.test(ua)) return "Mac";
    if (/Windows/i.test(ua)) return "Windows-PC";
    return "Unbekanntes Gerät";
  }

  // ---------------------------------------------------------------- Sitzung
  function loadSession() {
    try {
      const parsed = JSON.parse(read(AUTH_KEY) || "null");
      if (parsed && parsed.access_token && parsed.expires_at) return parsed;
    } catch { /* kaputter Eintrag wird unten überschrieben */ }
    return null;
  }

  function saveSession(next) {
    session = next;
    store(AUTH_KEY, next ? JSON.stringify(next) : null);
    scheduleRefresh();
    emit();
  }

  function emit() {
    const snapshot = status();
    listeners.forEach(fn => { try { fn(snapshot); } catch (error) { console.error("[RANKFORGE] Listener-Fehler:", error); } });
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    if (!session?.expires_at) return;
    const delay = Math.max(5000, session.expires_at - Date.now() - REFRESH_MARGIN_MS);
    refreshTimer = window.setTimeout(() => { refreshSession().catch(() => {}); }, delay);
  }

  function sessionFrom(data) {
    if (!data?.access_token) return null;
    const lifetime = Number(data.expires_in || 3600) * 1000;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || session?.refresh_token || "",
      expires_at: Date.now() + lifetime,
      email: data.user?.email || session?.email || "",
      userId: data.user?.id || session?.userId || ""
    };
  }

  // ---------------------------------------------------------------- HTTP
  async function call(path, options = {}) {
    const { url, key, ready } = config();
    if (!ready) throw new Error("Cloud ist nicht konfiguriert");

    const headers = Object.assign({
      "apikey": key,
      "content-type": "application/json"
    }, options.headers || {});

    if (options.auth !== false) {
      const token = await validToken();
      if (!token) throw new Error("Nicht angemeldet");
      headers.authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    let response;
    try {
      response = await fetch(url + path, {
        method: options.method || "POST",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
    } catch (error) {
      throw new Error(error?.name === "AbortError" ? "Zeitüberschreitung" : "Keine Verbindung");
    } finally {
      window.clearTimeout(timeout);
    }

    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }

    if (!response.ok) {
      const message = data?.msg || data?.message || data?.error_description || data?.error || `Fehler ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function refreshSession() {
    if (!session?.refresh_token) return null;
    try {
      const data = await call("/auth/v1/token?grant_type=refresh_token", {
        auth: false,
        body: { refresh_token: session.refresh_token }
      });
      saveSession(sessionFrom(data));
      return session;
    } catch (error) {
      // Nur abmelden, wenn der Server die Sitzung tatsächlich abgelehnt hat.
      // Ohne Netz gibt es keine Antwort — dann die Sitzung UNBEDINGT behalten,
      // sonst wäre man ausgesperrt und könnte sich offline nicht neu anmelden.
      const abgelehnt = error.status && error.status >= 400 && error.status < 500;
      if (abgelehnt && navigator.onLine !== false) saveSession(null);
      throw error;
    }
  }

  async function validToken() {
    if (!session) return null;
    if (session.expires_at - Date.now() > REFRESH_MARGIN_MS) return session.access_token;
    try { await refreshSession(); } catch { return null; }
    return session?.access_token || null;
  }

  // ---------------------------------------------------------------- Anmeldung
  async function signIn(email) {
    const address = String(email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(address)) throw new Error("Bitte eine gültige E-Mail-Adresse eingeben");

    // Kein Anhängen von Parametern an die Rücksprungadresse: Supabase hängt die
    // Tokens selbst als Fragment an, und Fragmente werden nie zum Server geschickt.
    const redirect = location.origin + location.pathname;
    await call("/auth/v1/otp", {
      auth: false,
      body: { email: address, create_user: true, options: { email_redirect_to: redirect } }
    });
    return { sent: true, email: address };
  }

  function signOut() {
    // Kein Server-Aufruf nötig; das lokale Verwerfen der Tokens genügt und
    // funktioniert auch offline. Lokale Trainingsdaten bleiben unangetastet.
    store(REVISION_KEY, null);
    saveSession(null);
  }

  /** Fängt die Tokens ab, die Supabase nach dem Klick auf den Magic Link anhängt. */
  function consumeCallback() {
    const hash = String(location.hash || "").replace(/^#/, "");
    if (!hash || !/access_token=/.test(hash)) return false;

    const params = new URLSearchParams(hash);
    const next = sessionFrom({
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      expires_in: params.get("expires_in")
    });
    if (!next) return false;

    // Tokens sofort aus der Adresszeile entfernen, damit sie nicht im Verlauf,
    // in Lesezeichen oder in einem Screenshot landen.
    history.replaceState(null, "", location.pathname + location.search);
    saveSession(next);
    loadProfile().catch(() => {});
    return true;
  }

  async function loadProfile() {
    const data = await call("/auth/v1/user", { method: "GET" });
    if (data?.email && session) {
      session.email = data.email;
      session.userId = data.id || session.userId;
      store(AUTH_KEY, JSON.stringify(session));
      emit();
    }
    return data;
  }

  // ---------------------------------------------------------------- Daten
  function rpc(name, args) {
    return call(`/rest/v1/rpc/${name}`, { body: args || {} });
  }

  function localRevision() {
    return Number(read(REVISION_KEY) || 0) || 0;
  }

  /** Holt den Stand aus der Cloud. Gibt null zurück, wenn dort noch nichts liegt. */
  async function pull() {
    const result = await rpc("rf_state_load");
    if (!result?.found) return null;
    store(REVISION_KEY, String(result.revision));
    return {
      payload: result.payload,
      revision: result.revision,
      updatedAt: result.updatedAt,
      deviceName: result.deviceName
    };
  }

  /**
   * Lädt den Stand hoch.
   * Ergebnis { ok: true } oder { ok: false, conflict: true, ... } — im
   * Konfliktfall wurde NICHTS überschrieben; die App muss den Benutzer fragen.
   * Mit { force: true } gewinnt der lokale Stand.
   */
  async function push(state, options = {}) {
    if (!state || typeof state !== "object") throw new Error("Kein gültiger Trainingsstand");

    const result = await rpc("rf_state_save", {
      p_payload: state,
      p_revision: options.force ? 0 : localRevision(),
      p_device_id: deviceId(),
      p_device_name: deviceName(),
      p_force: Boolean(options.force)
    });

    if (result?.ok) {
      store(REVISION_KEY, String(result.revision));
      return { ok: true, revision: result.revision };
    }
    return {
      ok: false,
      conflict: true,
      serverRevision: result?.serverRevision,
      serverUpdatedAt: result?.serverUpdatedAt,
      serverDevice: result?.serverDevice,
      serverPayload: result?.serverPayload
    };
  }

  async function deleteAccount() {
    const result = await rpc("rf_account_delete");
    if (result?.ok) signOut();
    return result;
  }

  // ---------------------------------------------------------------- Status
  function status() {
    const { ready } = config();
    return {
      configured: ready,
      signedIn: Boolean(session?.access_token),
      email: session?.email || "",
      userId: session?.userId || "",
      revision: localRevision(),
      online: navigator.onLine !== false
    };
  }

  function onChange(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    try { fn(status()); } catch { /* ignorieren */ }
    return () => listeners.delete(fn);
  }

  // ---------------------------------------------------------------- Start
  session = loadSession();
  scheduleRefresh();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { consumeCallback(); }, { once: true });
  } else {
    consumeCallback();
  }
  window.addEventListener("online", emit);
  window.addEventListener("offline", emit);

  window.RANKFORGE_ACCOUNT = Object.freeze({
    version: "1.0.0",
    status, onChange,
    signIn, signOut, consumeCallback,
    pull, push, deleteAccount,
    deviceId, deviceName
  });
})();
