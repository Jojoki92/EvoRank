import dns from "node:dns/promises";
import net from "node:net";
import https from "node:https";
import http from "node:http";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 12_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 12;
const rateBuckets = globalThis.__RANKFORGE_IMPORT_RATE__ ||= new Map();

// FIX 9.1.2: Ohne Herkunftspruefung ist diese Function ein offener Web-Proxy, den jeder
// benutzen kann, um beliebige Seiten anonym ueber eure Netlify-Adresse abzurufen.
function allowedOrigins() {
  const configured = String(process.env.RANKFORGE_ALLOWED_ORIGINS || "").split(",");
  const netlify = [process.env.URL, process.env.DEPLOY_PRIME_URL];
  return new Set([...configured, ...netlify]
    .map(value => String(value || "").trim().replace(/\/$/, ""))
    .filter(Boolean));
}

function originAllowed(request) {
  const allowed = allowedOrigins();
  // Ist nichts konfiguriert (lokale Entwicklung), bleibt das Verhalten wie bisher.
  if (!allowed.size) return true;
  const origin = String(request.headers.get("origin") || "").replace(/\/$/, "");
  if (origin) return allowed.has(origin);
  const referer = String(request.headers.get("referer") || "");
  if (!referer) return false;
  try {
    return allowed.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

function clientKey(request) {
  const raw = request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for") || "unknown";
  return String(raw).split(",")[0].trim().slice(0, 80) || "unknown";
}

function allowRequest(request) {
  const now = Date.now();
  const key = clientKey(request);
  const recent = (rateBuckets.get(key) || []).filter(timestamp => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateBuckets.set(key, recent);
    return false;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  if (rateBuckets.size > 2000) {
    for (const [bucketKey, timestamps] of rateBuckets) {
      if (!timestamps.some(timestamp => now - timestamp < RATE_WINDOW_MS)) rateBuckets.delete(bucketKey);
      if (rateBuckets.size <= 1500) break;
    }
  }
  return true;
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "x-frame-options": "DENY",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    }
  });
}

function isPrivateAddress(address) {
  if (!address) return true;
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
      (parts[0] >= 224);
  }
  const normalized = address.toLowerCase().split("%")[0];
  if (normalized.startsWith("::ffff:")) return isPrivateAddress(normalized.slice(7));
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:");
}

// FIX 9.1.2: Schutz gegen DNS-Rebinding. Vorher wurde der Hostname einmal geprueft und
// danach von fetch() ein zweites Mal aufgeloest - dazwischen konnte ein Angreifer den
// DNS-Eintrag auf eine interne Adresse umstellen. Dieser lookup prueft jede Adresse
// genau in dem Moment, in dem die Verbindung tatsaechlich aufgebaut wird.
function guardedLookup(hostname, options, callback) {
  dns.lookup(hostname, { all: true, verbatim: true }).then(addresses => {
    const safe = addresses.filter(item => !isPrivateAddress(item.address));
    if (!safe.length) {
      callback(new Error("Private Netzwerkadressen sind nicht erlaubt"));
      return;
    }
    if (options && options.all) callback(null, safe);
    else callback(null, safe[0].address, safe[0].family);
  }).catch(() => callback(new Error("Adresse konnte nicht aufgeloest werden")));
}

async function validatePublicUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Ungültiger Link"); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Nur öffentliche http- oder https-Links sind erlaubt");
  if (url.username || url.password) throw new Error("Links mit Zugangsdaten werden nicht unterstützt");
  if (!["", "80", "443"].includes(url.port)) throw new Error("Dieser Port wird nicht unterstützt");
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (["localhost", "localhost.localdomain"].includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error("Lokale Adressen sind nicht erlaubt");
  }
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error("Private Netzwerkadressen sind nicht erlaubt");
  } else {
    let addresses;
    try { addresses = await dns.lookup(hostname, { all: true, verbatim: true }); }
    catch { throw new Error("Adresse konnte nicht aufgelöst werden"); }
    if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) throw new Error("Private Netzwerkadressen sind nicht erlaubt");
  }
  url.hash = "";
  return url;
}

function decodeEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Math.min(0x10ffff, Number(code))))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Math.min(0x10ffff, parseInt(code, 16))))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function htmlToText(html) {
  const source = String(html || "");
  const title = decodeEntities(source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  const cleaned = source
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|canvas|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|p|div|li|tr|section|article|header|footer|h[1-6])\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const text = decodeEntities(cleaned)
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 250_000);
  return { title, text };
}

// Ersetzt fetch() durch node:https/node:http, weil nur dort ein eigener lookup
// uebergeben werden kann. Verhalten und Fehlermeldungen bleiben gleich.
function requestOnce(url) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(url, {
      method: "GET",
      lookup: guardedLookup,
      timeout: TIMEOUT_MS,
      headers: {
        accept: "text/html,application/json,text/plain;q=0.9,*/*;q=0.2",
        "user-agent": "RANKFORGE-Workout-Importer/9.1",
        "accept-encoding": "identity"
      }
    }, response => {
      const declared = Number(response.headers["content-length"] || 0);
      if (declared > MAX_BYTES) {
        response.destroy();
        reject(new Error("Die Seite ist zu groß zum Importieren"));
        return;
      }
      const chunks = [];
      let total = 0;
      response.on("data", chunk => {
        total += chunk.length;
        if (total > MAX_BYTES) {
          response.destroy();
          reject(new Error("Die Seite ist zu groß zum Importieren"));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => resolve({
        status: response.statusCode || 0,
        headers: response.headers,
        body: Buffer.concat(chunks).toString("utf8")
      }));
      response.on("error", () => reject(new Error("Die Seite konnte nicht geladen werden")));
    });
    request.on("timeout", () => { request.destroy(); reject(new Error("Die Seite hat zu lange gebraucht")); });
    request.on("error", error => {
      reject(new Error(String(error?.message || "").includes("Private")
        ? "Private Netzwerkadressen sind nicht erlaubt"
        : "Die Seite konnte nicht geladen werden"));
    });
    request.end();
  });
}

async function fetchPublic(startUrl) {
  let current = await validatePublicUrl(startUrl);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await requestOnce(current);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirect === MAX_REDIRECTS) throw new Error("Zu viele Weiterleitungen");
      const location = response.headers.location;
      if (!location) throw new Error("Ungültige Weiterleitung");
      current = await validatePublicUrl(new URL(location, current).href);
      continue;
    }
    if (response.status < 200 || response.status >= 300) throw new Error(`Die Seite antwortet mit Status ${response.status}`);
    const contentType = String(response.headers["content-type"] || "").toLowerCase();
    if (!/(?:text\/html|text\/plain|application\/json|application\/ld\+json)/.test(contentType)) throw new Error("Dieser Dateityp kann nicht als Workout gelesen werden");
    if (/json/.test(contentType)) return { title: "", text: response.body, type: "json", sourceUrl: current.href };
    const parsed = /text\/html/.test(contentType) ? htmlToText(response.body) : { title: "", text: response.body.slice(0, 250_000) };
    if (parsed.text.length < 20) throw new Error("Auf der Seite wurde kein lesbarer Workout-Inhalt gefunden");
    return { ...parsed, type: "text", sourceUrl: current.href };
  }
  throw new Error("Link konnte nicht gelesen werden");
}

export { decodeEntities, htmlToText, isPrivateAddress, validatePublicUrl, originAllowed };

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { error: "Nur GET wird unterstützt" });
  if (!originAllowed(request)) return json(403, { error: "Diese Funktion ist nur aus der RANKFORGE-App nutzbar" });
  if (!allowRequest(request)) return json(429, { error: "Zu viele Importversuche. Bitte warte einige Minuten." });
  if (request.url.length > 4096) return json(414, { error: "Der Import-Link ist zu lang" });
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get("url");
  if (!target) return json(400, { error: "Link fehlt" });
  if (target.length > 2048) return json(400, { error: "Der Ziel-Link ist zu lang" });
  try {
    return json(200, await fetchPublic(target));
  } catch (error) {
    return json(400, { error: error?.message || "Link konnte nicht gelesen werden" });
  }
}
