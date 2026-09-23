import crypto from "node:crypto";

const MAX_WEBHOOK_BYTES = 2 * 1024 * 1024;
const ACTIVITY_KEYS = ["activities", "activityDetails", "activitySummaries", "summaries", "data", "results"];

function cleanBase(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-store",
      "x-content-type-options":"nosniff",
      "referrer-policy":"no-referrer",
      "x-frame-options":"DENY",
      "content-security-policy":"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    }
  });
}

export function serverError(error, fallback = "Serverfehler") {
  console.error("[EVORANK Garmin]", error);
  return json(Number(error?.status || 500), {
    error: error?.publicMessage || fallback,
    code: error?.code || "garmin_server_error"
  });
}

function httpError(status, publicMessage, code) {
  const error = new Error(publicMessage);
  error.status = status;
  error.publicMessage = publicMessage;
  error.code = code;
  return error;
}

export function supabaseConfig() {
  const url = cleanBase(process.env.SUPABASE_URL);
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const publishableKey = String(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
  if (!url || !serviceKey || !publishableKey) {
    throw httpError(503, "Die sichere Garmin-Datenbank ist noch nicht eingerichtet.", "garmin_not_configured");
  }
  return { url, serviceKey, publishableKey };
}

function bearer(request) {
  const match = String(request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

export async function authenticatedUser(request) {
  const token = bearer(request);
  if (!token) throw httpError(401, "Bitte zuerst in EVORANK anmelden.", "not_authenticated");
  const { url, publishableKey } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey:publishableKey, authorization:`Bearer ${token}`, accept:"application/json" }
  });
  const user = await response.json().catch(() => null);
  if (!response.ok || !user?.id) throw httpError(401, "Die Anmeldung ist abgelaufen. Bitte erneut anmelden.", "invalid_session");
  return user;
}

export async function adminRequest(path, options = {}) {
  const { url, serviceKey } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${String(path).replace(/^\/+/, "")}`, {
    method:options.method || "GET",
    headers: {
      apikey:serviceKey,
      authorization:`Bearer ${serviceKey}`,
      accept:"application/json",
      ...(options.body !== undefined ? { "content-type":"application/json" } : {}),
      ...(options.prefer ? { prefer:options.prefer } : {})
    },
    body:options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.hint || `Supabase ${response.status}`;
    const error = httpError(response.status >= 500 ? 503 : 500, "Die Garmin-Daten konnten nicht gespeichert werden.", "garmin_database_error");
    error.message = message;
    throw error;
  }
  return data;
}

function queryValue(value) {
  return encodeURIComponent(String(value || ""));
}

export async function getConnection(userId) {
  const rows = await adminRequest(`rf_garmin_connections?select=*&user_id=eq.${queryValue(userId)}&limit=1`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function getConnectionByGarminUser(garminUserId) {
  if (!garminUserId) return null;
  const rows = await adminRequest(`rf_garmin_connections?select=*&garmin_user_id=eq.${queryValue(garminUserId)}&limit=1`);
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function saveConnection(record) {
  const rows = await adminRequest("rf_garmin_connections?on_conflict=user_id", {
    method:"POST",
    prefer:"resolution=merge-duplicates,return=representation",
    body:record
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function deleteConnection(userId) {
  await adminRequest(`rf_garmin_connections?user_id=eq.${queryValue(userId)}`, { method:"DELETE", prefer:"return=minimal" });
}

export async function updateConnection(userId, patch) {
  await adminRequest(`rf_garmin_connections?user_id=eq.${queryValue(userId)}`, {
    method:"PATCH",
    prefer:"return=minimal",
    body:{ ...patch, updated_at:new Date().toISOString() }
  });
}

function encryptionKey() {
  const source = String(process.env.GARMIN_TOKEN_ENCRYPTION_KEY || "");
  if (source.length < 24) throw httpError(503, "Die Garmin-Verschlüsselung ist noch nicht eingerichtet.", "garmin_not_configured");
  return crypto.createHash("sha256").update(source).digest();
}

export function encryptSecret(value) {
  if (!value) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptSecret(value) {
  if (!value) return "";
  const [version, iv, tag, encrypted] = String(value).split(".");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Ungültiges Tokenformat");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("base64url");
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function oauthConfig() {
  const config = {
    clientId:String(process.env.GARMIN_CLIENT_ID || "").trim(),
    clientSecret:String(process.env.GARMIN_CLIENT_SECRET || "").trim(),
    authorizationUrl:String(process.env.GARMIN_AUTHORIZATION_URL || "").trim(),
    tokenUrl:String(process.env.GARMIN_TOKEN_URL || "").trim(),
    userInfoUrl:String(process.env.GARMIN_USER_INFO_URL || "").trim(),
    revocationUrl:String(process.env.GARMIN_REVOCATION_URL || "").trim(),
    redirectUri:String(process.env.GARMIN_REDIRECT_URI || "").trim(),
    scope:String(process.env.GARMIN_SCOPES || "activity:read").trim(),
    clientAuthMethod:String(process.env.GARMIN_CLIENT_AUTH_METHOD || "basic").trim().toLowerCase()
  };
  if (!config.clientId || !config.clientSecret || !config.authorizationUrl || !config.tokenUrl || !config.redirectUri) {
    throw httpError(503, "Garmin kann erst nach der Freigabe des Developer Programs verbunden werden.", "garmin_not_configured");
  }
  for (const value of [config.authorizationUrl, config.tokenUrl, config.redirectUri]) {
    let url;
    try { url = new URL(value); } catch { throw httpError(503, "Die Garmin-Serveradressen sind noch nicht vollständig.", "garmin_not_configured"); }
    if (url.protocol !== "https:") throw httpError(503, "Garmin-Serveradressen müssen HTTPS verwenden.", "garmin_not_configured");
  }
  encryptionKey();
  supabaseConfig();
  return config;
}

export function normalizeReturnTo(request, value) {
  const requestUrl = new URL(request.url);
  try {
    const target = new URL(String(value || "/#sports"), requestUrl.origin);
    if (target.origin !== requestUrl.origin) return "/#sports";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/#sports";
  }
}

export async function tokenRequest(params) {
  const config = oauthConfig();
  const body = new URLSearchParams(params);
  const headers = { accept:"application/json", "content-type":"application/x-www-form-urlencoded" };
  if (config.clientAuthMethod === "post") {
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
  } else {
    headers.authorization = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`;
  }
  const response = await fetch(config.tokenUrl, { method:"POST", headers, body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    const error = httpError(502, "Garmin hat die Verbindung nicht bestätigt. Bitte erneut versuchen.", "garmin_token_error");
    error.message = data.error_description || data.error || `Garmin token ${response.status}`;
    throw error;
  }
  return data;
}

export async function garminUserInfo(accessToken) {
  const config = oauthConfig();
  if (!config.userInfoUrl) return null;
  const response = await fetch(config.userInfoUrl, {
    headers:{ accept:"application/json", authorization:`Bearer ${accessToken}` }
  });
  if (!response.ok) return null;
  return response.json().catch(() => null);
}

export function garminUserId(...sources) {
  for (const source of sources) {
    const value = source?.garmin_user_id ?? source?.garminUserId ?? source?.user_id ?? source?.userId ?? source?.sub ?? source?.id ?? source?.user?.id;
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim().slice(0, 200);
  }
  return "";
}

export function accountLabel(...sources) {
  for (const source of sources) {
    const value = source?.display_name ?? source?.displayName ?? source?.name ?? source?.username ?? source?.email;
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim().slice(0, 160);
  }
  return "Garmin Connect";
}

export async function freshAccessToken(connection) {
  const expiresAt = Date.parse(connection?.token_expires_at || "");
  if (connection?.access_token_enc && (!Number.isFinite(expiresAt) || expiresAt > Date.now() + 60_000)) {
    return decryptSecret(connection.access_token_enc);
  }
  const refreshToken = decryptSecret(connection?.refresh_token_enc || "");
  if (!refreshToken) throw httpError(401, "Garmin muss erneut verbunden werden.", "garmin_reconnect_required");
  const token = await tokenRequest({ grant_type:"refresh_token", refresh_token:refreshToken });
  await updateConnection(connection.user_id, {
    access_token_enc:encryptSecret(token.access_token),
    refresh_token_enc:encryptSecret(token.refresh_token || refreshToken),
    token_expires_at:new Date(Date.now() + Math.max(60, Number(token.expires_in || 3600)) * 1000).toISOString(),
    scope:String(token.scope || connection.scope || "")
  });
  return token.access_token;
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function activitySport(item) {
  const raw = String(item?.sport || item?.sportType || item?.activityType?.typeKey || item?.activityType?.type || item?.type || item?.name || "").toLowerCase();
  if (/swim|pool|open.?water/.test(raw)) return "swim";
  if (/run|jog|trail/.test(raw)) return "run";
  if (/bike|bik|cycl|ride|velo/.test(raw)) return "bike";
  if (/strength|weight|gym/.test(raw)) return "strength";
  return "";
}

export function normalizeActivity(item) {
  const summary = item?.summary || item?.summaryDTO || item?.activitySummary || {};
  const sport = activitySport({ ...summary, ...item });
  if (!sport) return null;
  const externalId = item?.id || item?.activityId || item?.activityUUID || summary?.id || summary?.activityId;
  const startedRaw = item?.date || item?.startTime || item?.startTimeLocal || item?.startTimeGMT || item?.startedAt || item?.timestamp || summary?.startTime;
  const started = new Date(startedRaw || Date.now());
  let durationSeconds = finite(item?.durationSeconds || item?.elapsedDuration || item?.movingDuration || item?.duration || summary?.durationSeconds || summary?.duration);
  if (durationSeconds > 604800) durationSeconds /= 1000;
  const distanceMeters = finite(item?.distanceMeters || item?.distance || summary?.distanceMeters || summary?.distance);
  if (!externalId || Number.isNaN(started.getTime()) || !(durationSeconds > 0) || !(distanceMeters > 0)) return null;
  return {
    external_id:String(externalId).slice(0, 240),
    sport,
    started_at:started.toISOString(),
    distance_m:Math.round(distanceMeters * 100) / 100,
    duration_s:Math.round(durationSeconds),
    raw:item
  };
}

export function webhookItems(payload, inheritedUserId = "") {
  const results = [];
  function visit(value, inherited) {
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, inherited));
      return;
    }
    if (!value || typeof value !== "object") return;
    const userId = garminUserId(value) || inherited;
    const callbackUrl = value.callbackURL || value.callbackUrl || value.callback_uri || "";
    if (callbackUrl) results.push({ kind:"ping", garminUserId:userId, callbackUrl:String(callbackUrl) });
    let descended = false;
    for (const key of ACTIVITY_KEYS) {
      if (value[key] && (Array.isArray(value[key]) || typeof value[key] === "object")) {
        descended = true;
        visit(value[key], userId);
      }
    }
    if (!descended && normalizeActivity(value)) results.push({ kind:"activity", garminUserId:userId, item:value });
  }
  visit(payload, inheritedUserId);
  return results;
}

export async function saveActivity(userId, activity) {
  const record = normalizeActivity(activity);
  if (!record) return false;
  await adminRequest("rf_garmin_activities?on_conflict=user_id,external_id", {
    method:"POST",
    prefer:"resolution=merge-duplicates,return=minimal",
    body:{ user_id:userId, ...record, received_at:new Date().toISOString() }
  });
  return true;
}

export async function listActivities(userId, limit = 500) {
  return adminRequest(`rf_garmin_activities?select=external_id,sport,started_at,distance_m,duration_s,received_at&user_id=eq.${queryValue(userId)}&order=started_at.desc&limit=${Math.min(500, Math.max(1, Number(limit || 500)))}`);
}

export function webhookAuthorized(request) {
  const configured = String(process.env.GARMIN_WEBHOOK_SECRET || "").trim();
  if (configured.length < 24) return false;
  const requestUrl = new URL(request.url);
  const supplied = bearer(request) || request.headers.get("x-garmin-webhook-secret") || requestUrl.searchParams.get("secret") || "";
  const a = Buffer.from(String(supplied));
  const b = Buffer.from(configured);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function webhookBodyAllowed(request) {
  const size = Number(request.headers.get("content-length") || 0);
  return !size || size <= MAX_WEBHOOK_BYTES;
}

function allowedPullHost(hostname) {
  const allowed = String(process.env.GARMIN_PULL_ALLOWED_HOSTS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(String(hostname || "").toLowerCase());
}

export async function pullPing(callbackUrl, connection) {
  let url;
  try { url = new URL(callbackUrl); } catch { throw new Error("Ungültige Garmin-Pull-Adresse"); }
  if (url.protocol !== "https:" || !allowedPullHost(url.hostname)) throw new Error("Nicht erlaubte Garmin-Pull-Adresse");
  const accessToken = await freshAccessToken(connection);
  const response = await fetch(url, { headers:{ accept:"application/json", authorization:`Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Garmin pull ${response.status}`);
  return response.json();
}
