/* =============================================================================
 * RANKFORGE 9.3 — Konto, Cloud-Sicherung und Freunde
 *
 * Ersetzt account-sync-v1.js. Zwei Änderungen gegenüber der Vorversion:
 *
 *   1. Anmeldung per E-Mail und Passwort statt per Magic Link.
 *   2. Profile und Freundschaften hängen an auth.uid() statt an einem
 *      selbstvergebenen Token. Erst dadurch lassen sich Freundschaftsanfragen
 *      überhaupt sinnvoll bauen: "annehmen" braucht jemanden, dem der Server
 *      glauben kann.
 *
 * Die nach außen sichtbare Schnittstelle von Version 1 bleibt vollständig
 * erhalten (status, onChange, pull, push, deleteAccount, signOut), damit
 * account-bridge-v1.js unverändert weiterläuft.
 *
 * Weiterhin ohne Supabase-SDK, direkt über REST — die Content-Security-Policy
 * bleibt dadurch unangetastet und es kommt keine Lieferketten-Abhängigkeit dazu.
 * ========================================================================== */
(function () {
  "use strict";

  const AUTH_KEY = "rankforge-auth-v1";
  const EXPLICIT_LOGOUT_KEY = "evorank-explicit-logout-v1";
  const RECOVERY_KEY = "rankforge-password-recovery-v1";
  const DEVICE_KEY = "rankforge-device-id-v1";
  const REVISION_KEY = "rankforge-cloud-revision-v1";
  const REFRESH_MARGIN_MS = 60_000;
  const MIN_PASSWORD_LENGTH = 10;

  const listeners = new Set();
  let session = null;
  let recoveryPending = false;
  let refreshTimer = null;
  let profileCache = null;

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

  function readRecoveryPending() {
    try { return window.sessionStorage.getItem(RECOVERY_KEY) === "1"; }
    catch { return false; }
  }

  function setRecoveryPending(active) {
    recoveryPending = Boolean(active);
    try {
      if (recoveryPending) window.sessionStorage.setItem(RECOVERY_KEY, "1");
      else window.sessionStorage.removeItem(RECOVERY_KEY);
    } catch { /* in dieser Sitzung bleibt der Wert trotzdem erhalten */ }
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
    if (read(EXPLICIT_LOGOUT_KEY) === "1") return null;
    try {
      const parsed = JSON.parse(read(AUTH_KEY) || "null");
      if (parsed && parsed.access_token && parsed.expires_at) return parsed;
    } catch { /* kaputter Eintrag wird unten überschrieben */ }
    return null;
  }

  function saveSession(next) {
    session = next;
    if (!next) {
      profileCache = null;
      setRecoveryPending(false);
    }
    store(AUTH_KEY, next ? JSON.stringify(next) : null);
    scheduleRefresh();
    emit();
  }

  function emit() {
    const snapshot = status();
    listeners.forEach(fn => {
      try { fn(snapshot); } catch (error) { console.error("[RANKFORGE] Listener-Fehler:", error); }
    });
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
    } else {
      // Für nicht angemeldete Aufrufe (Registrierung, Anmeldung) verlangt
      // Supabase trotzdem einen Bearer — dort der öffentliche Schlüssel.
      headers.authorization = `Bearer ${key}`;
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
      const raw = data?.msg || data?.message || data?.error_description || data?.error || `Fehler ${response.status}`;
      const error = new Error(translateError(String(raw), response.status));
      error.status = response.status;
      error.code = data?.error_code || data?.code || "";
      if (/already registered|already exists/i.test(String(raw)) ||
          /user_already_exists|email_exists/i.test(error.code)) {
        error.alreadyRegistered = true;
      }
      throw error;
    }
    return data;
  }

  /** Supabase antwortet auf Englisch. Die häufigen Fälle hier übersetzen. */
  function translateError(message, status) {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials")) return "E-Mail oder Passwort stimmt nicht";
    if (lower.includes("email not confirmed")) return "Bitte zuerst die E-Mail-Adresse bestätigen — schau in dein Postfach";
    if (lower.includes("user already registered")) return "Für diese Adresse gibt es schon ein Konto. Melde dich einfach an.";
    if (lower.includes("password should be at least")) return `Das Passwort braucht mindestens ${MIN_PASSWORD_LENGTH} Zeichen`;
    if (lower.includes("pwned") || lower.includes("compromised") || lower.includes("weak")) {
      return "Dieses Passwort taucht in bekannten Datenlecks auf. Bitte ein anderes wählen.";
    }
    if (lower.includes("rate limit") || status === 429) return "Zu viele Versuche. Bitte ein paar Minuten warten.";
    if (lower.includes("nickname_taken")) return "Dieser Spitzname ist schon vergeben";
    if (lower.includes("nickname_invalid")) return "Spitzname: 3–20 Zeichen, nur Buchstaben, Ziffern, _ und .";
    if (lower.includes("not_friends")) return "Ihr seid (noch) nicht befreundet";
    if (lower.includes("self_request")) return "Du kannst dir nicht selbst eine Anfrage schicken";
    if (lower.includes("already_requested")) return "Es gibt schon eine Anfrage zwischen euch";
    if (lower.includes("blocked")) return "Diese Anfrage ist nicht möglich";
    return message;
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
      // sonst wäre man ausgesperrt und käme offline nicht mehr hinein.
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

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function assertEmail(address) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(address)) {
      throw new Error("Bitte eine gültige E-Mail-Adresse eingeben");
    }
  }

  /**
   * Prüft das Passwort clientseitig, damit der Nutzer sofort Rückmeldung
   * bekommt. Die verbindliche Prüfung passiert trotzdem serverseitig — diese
   * hier ist reine Bequemlichkeit und keine Sicherheitsmaßnahme.
   */
  function checkPassword(password, email) {
    const value = String(password || "");
    if (value.length < MIN_PASSWORD_LENGTH) {
      return `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen bitte`;
    }
    if (value.length > 72) {
      return "Höchstens 72 Zeichen";
    }
    if (email && value.toLowerCase().includes(normalizeEmail(email).split("@")[0])) {
      return "Das Passwort sollte nicht deine E-Mail-Adresse enthalten";
    }
    if (/^(\d+|[a-z]+)$/i.test(value)) {
      return "Bitte Buchstaben und Ziffern mischen";
    }
    return "";
  }

  async function signUp(email, password) {
    const address = normalizeEmail(email);
    assertEmail(address);
    const problem = checkPassword(password, address);
    if (problem) throw new Error(problem);

    const data = await call(authPath("/auth/v1/signup"), {
      auth: false,
      body: {
        email: address,
        password: String(password)
      }
    });

    // Ist die E-Mail-Bestätigung eingeschaltet, kommt hier noch kein Token.
    if (data?.access_token) {
      store(EXPLICIT_LOGOUT_KEY, null);
      setRecoveryPending(false);
      saveSession(sessionFrom(data));
      return { signedIn: true, email: address };
    }

    if (isObfuscatedUser(data)) {
      return { signedIn: false, alreadyRegistered: true, email: address };
    }
    return { signedIn: false, confirmationRequired: true, email: address };
  }

  function isObfuscatedUser(data) {
    const user = data?.user || data;
    return Array.isArray(user?.identities) && user.identities.length === 0;
  }

  async function signIn(email, password) {
    const address = normalizeEmail(email);
    assertEmail(address);
    if (!String(password || "")) throw new Error("Bitte das Passwort eingeben");

    const data = await call("/auth/v1/token?grant_type=password", {
      auth: false,
      body: { email: address, password: String(password) }
    });
    store(EXPLICIT_LOGOUT_KEY, null);
    setRecoveryPending(false);
    saveSession(sessionFrom(data));
    loadProfile().catch(() => {});
    return { signedIn: true, email: address };
  }

  async function requestPasswordReset(email) {
    const address = normalizeEmail(email);
    assertEmail(address);
    await call(authPath("/auth/v1/recover"), {
      auth: false,
      body: { email: address }
    });
    // Bewusst immer dieselbe Antwort, egal ob die Adresse existiert — sonst
    // ließe sich über dieses Formular herausfinden, wer ein Konto hat.
    return { sent: true, email: address };
  }

  async function resendSignupConfirmation(email) {
    const address = normalizeEmail(email);
    assertEmail(address);
    await call(authPath("/auth/v1/resend"), {
      auth: false,
      body: { type: "signup", email: address }
    });
    return { sent: true, email: address };
  }

  async function updatePassword(newPassword) {
    const problem = checkPassword(newPassword, session?.email);
    if (problem) throw new Error(problem);
    await call("/auth/v1/user", { method: "PUT", body: { password: String(newPassword) } });
    setRecoveryPending(false);
    emit();
    return { ok: true };
  }

  function redirectTarget() {
    const configured = String(window.RANKFORGE_CLOUD?.authRedirectUrl || "").trim();
    if (configured) {
      try {
        const target = new URL(configured, location.href);
        if (target.protocol === "https:" || target.hostname === "localhost" || target.hostname === "terminal.local") {
          return target.href;
        }
      } catch { /* ungültige optionale Konfiguration: sichere lokale Rückfallebene */ }
    }
    return new URL("./index.html?auth=recovery", location.href).href;
  }

  /** GoTrue erwartet die Rücksprungadresse als redirect_to-Abfrageparameter. */
  function authPath(path) {
    return `${path}?redirect_to=${encodeURIComponent(redirectTarget())}`;
  }

  function signOut() {
    // Kein Server-Aufruf nötig; das lokale Verwerfen der Tokens genügt und
    // funktioniert auch offline. Lokale Trainingsdaten bleiben unangetastet.
    store(REVISION_KEY, null);
    store(EXPLICIT_LOGOUT_KEY, "1");
    saveSession(null);
  }

  function cancelPasswordRecovery() {
    signOut();
    return { ok: true };
  }

  /**
   * Fängt Tokens ab, die Supabase nach einem Bestätigungs- oder
   * Zurücksetzen-Link im Fragment anhängt. Bei Magic Links war das der
   * Normalfall; jetzt nur noch für Bestätigung und Passwort-Reset.
   */
  function consumeCallback() {
    const hash = String(location.hash || "").replace(/^#/, "");
    if (!hash || !/access_token=/.test(hash)) return false;

    const params = new URLSearchParams(hash);
    const type = params.get("type") || "";
    const next = sessionFrom({
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      expires_in: params.get("expires_in")
    });
    if (!next) return false;

    store(EXPLICIT_LOGOUT_KEY, null);
    setRecoveryPending(type === "recovery");
    // Tokens sofort aus der Adresszeile entfernen, damit sie nicht im Verlauf,
    // in Lesezeichen oder in einem Screenshot landen.
    history.replaceState(null, "", location.pathname + location.search);
    saveSession(next);
    loadProfile().catch(() => {});
    if (type === "recovery") {
      window.dispatchEvent(new CustomEvent("rankforge:password-recovery"));
    }
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

  // ---------------------------------------------------------------- Profil & Freunde

  const NICKNAME_PATTERN = /^[a-z0-9._]{3,20}$/;

  function normalizeNickname(value) {
    return String(value || "").trim().replace(/^@+/, "").toLowerCase();
  }

  function checkNickname(value) {
    const nickname = normalizeNickname(value);
    if (!NICKNAME_PATTERN.test(nickname)) {
      return "3–20 Zeichen, nur Kleinbuchstaben, Ziffern, Punkt und Unterstrich";
    }
    if (/^[._]|[._]$/.test(nickname)) return "Darf nicht mit Punkt oder Unterstrich beginnen oder enden";
    if (/[._]{2,}/.test(nickname)) return "Keine zwei Sonderzeichen hintereinander";
    return "";
  }

  /** Eigenes Profil laden. Gibt null zurück, wenn noch keins angelegt wurde. */
  async function getProfile(options = {}) {
    if (profileCache && !options.fresh) return profileCache;
    const result = await rpc("rf_profile_me");
    profileCache = result?.found ? result.profile : null;
    return profileCache;
  }

  /** Spitzname und Anzeigename setzen. Der Spitzname ist global eindeutig. */
  async function saveProfile({ nickname, displayName, avatar } = {}) {
    const clean = normalizeNickname(nickname);
    const problem = checkNickname(clean);
    if (problem) throw new Error(problem);
    const result = await rpc("rf_profile_upsert", {
      p_nickname: clean,
      p_display_name: String(displayName || "").trim().slice(0, 40),
      p_avatar: String(avatar || "").slice(0, 4000)
    });
    profileCache = result?.profile || null;
    emit();
    return profileCache;
  }

  /** Trainings-Momentaufnahme für die Rangliste veröffentlichen. */
  async function publishSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return { ok: false };
    return rpc("rf_profile_publish", { p_snapshot: snapshot });
  }

  /** Nach einem Spitznamen suchen. Liefert nie E-Mail-Adressen. */
  async function searchProfiles(query) {
    const term = normalizeNickname(query).slice(0, 30);
    if (term.length < 3) throw new Error("Bitte mindestens drei Zeichen eingeben");
    const rows = await rpc("rf_profile_search", { p_query: term, p_limit: 20 });
    return Array.isArray(rows) ? rows : [];
  }

  const sendFriendRequest = nickname =>
    rpc("rf_friend_request", { p_nickname: normalizeNickname(nickname) });

  const acceptFriendRequest = requestId =>
    rpc("rf_friend_accept", { p_request_id: String(requestId) });

  const declineFriendRequest = requestId =>
    rpc("rf_friend_decline", { p_request_id: String(requestId) });

  const removeFriend = friendId =>
    rpc("rf_friend_remove", { p_friend_id: String(friendId) });

  /** Alles auf einmal: bestätigte Freunde, eingehende und ausgehende Anfragen. */
  async function listFriends() {
    const result = await rpc("rf_friend_list");
    return {
      friends: Array.isArray(result?.friends) ? result.friends : [],
      incoming: Array.isArray(result?.incoming) ? result.incoming : [],
      outgoing: Array.isArray(result?.outgoing) ? result.outgoing : []
    };
  }

  // ---------------------------------------------------------------- Status
  function status() {
    const { ready } = config();
    return {
      configured: ready,
      signedIn: Boolean(session?.access_token),
      email: session?.email || "",
      userId: session?.userId || "",
      nickname: profileCache?.nickname || "",
      displayName: profileCache?.displayName || "",
      hasProfile: Boolean(profileCache?.nickname),
      revision: localRevision(),
      online: navigator.onLine !== false,
      passwordRecovery: recoveryPending
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
  setRecoveryPending(readRecoveryPending() && Boolean(session?.access_token));
  scheduleRefresh();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { consumeCallback(); }, { once: true });
  } else {
    consumeCallback();
  }
  if (session) loadProfile().catch(() => {});
  window.addEventListener("online", emit);
  window.addEventListener("offline", emit);

  window.RANKFORGE_ACCOUNT = Object.freeze({
    version: "2.1.0",
    minPasswordLength: MIN_PASSWORD_LENGTH,

    status, onChange, getAccessToken: validToken,
    signUp, signIn, signOut, consumeCallback,
    requestPasswordReset, resendSignupConfirmation, updatePassword, cancelPasswordRecovery,
    checkPassword, checkNickname, normalizeNickname,

    pull, push, deleteAccount,
    deviceId, deviceName,

    getProfile, saveProfile, publishSnapshot, searchProfiles,
    listFriends, sendFriendRequest, acceptFriendRequest,
    declineFriendRequest, removeFriend
  });
})();
