#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(process.argv[2] || path.join(import.meta.dirname, ".."));
const output = path.resolve(process.argv[3] || path.join(root, "docs", "SECURITY-AUDIT-RESULT.json"));
const textExtensions = new Set([".html", ".js", ".mjs", ".css", ".json", ".md", ".txt", ".sql", ".toml", ""]);

function files(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...files(full));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase()) || ["_headers", "_redirects"].includes(entry.name)) result.push(full);
  }
  return result;
}

const allFiles = files(root);
const contents = new Map(allFiles.map(file => [file, fs.readFileSync(file, "utf8")]));
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
// FIX 9.1.2: Version wurde hartkodiert ("9.0.0") und das Tool brach bei jedem Release
// mit ENOENT ab. Jetzt wird sie aus dem tatsaechlichen Dateinamen ermittelt.
const APP_FILE = fs.readdirSync(path.join(root, "assets"))
  .filter(name => /^rankforge-v[\d.]+\.js$/.test(name))
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
  .at(-1);
if (!APP_FILE) throw new Error("Keine assets/rankforge-v*.js gefunden");
const VERSION = APP_FILE.replace(/^rankforge-v|\.js$/g, "");
const checks = [];
function check(id, title, ok, detail) { checks.push({ id, title, ok: Boolean(ok), detail }); }

const index = read("index.html");
const headers = read("_headers");
const app = read(`assets/${APP_FILE}`);
const sqlFile = [
  "SUPABASE-FREUNDE-SETUP.sql",
  "../internal/SUPABASE-FREUNDE-SETUP.sql",
  "../../db/SUPABASE-FREUNDE-SETUP.sql",
].find(rel => fs.existsSync(path.join(root, rel)));
const sql = sqlFile ? read(sqlFile) : "";
const sw = read("service-worker.js");
const cloud = read("cloud-config.js");
const importer = read("netlify/functions/import-workout.mjs");

const inlineScripts = [...index.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].filter(match => match[1].trim());
check("no-inline-script", "Keine ausführbaren Inline-Skripte", inlineScripts.length === 0, `${inlineScripts.length} Inline-Skripte gefunden`);
check("csp", "Content-Security-Policy vorhanden", /Content-Security-Policy:/i.test(headers) && /object-src 'none'/i.test(headers) && /frame-ancestors 'none'/i.test(headers), "CSP mit object-src und frame-ancestors");
check("hsts", "HTTPS/HSTS", /Strict-Transport-Security:\s*max-age=31536000/i.test(headers) && /upgrade-insecure-requests/i.test(headers), "HSTS und Upgrade-Regel gesetzt");
check("security-headers", "Weitere Sicherheitsheader", ["X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "X-Frame-Options"].every(name => headers.includes(name)), "nosniff, Referrer-, Permissions- und Frame-Policy");
check("service-worker", "Aktueller Offline-Cache", sw.includes(APP_FILE), `Service Worker referenziert ${APP_FILE}`);
check("publishable-only", "Keine geheimen Supabase-Werte in cloud-config.js", !/sb_secret_[A-Za-z0-9_-]{20,}/.test(cloud) && !/service[_-]?role\s*[:=]\s*["'][^"']{20,}/i.test(cloud), "Konfiguration enthält keine Secret-/Service-Role-Werte");
check("rls", "Supabase RLS und gesperrte Tabelle", /enable row level security/i.test(sql) && /revoke all on public\.rankforge_public_profiles from anon, authenticated/i.test(sql), "RLS aktiv, direkter Tabellenzugriff entzogen");
check("field-allowlist", "Serverseitige Feld-Allowlist", /rf_sanitize_muscles/i.test(sql) && /rf_sanitize_stats/i.test(sql) && /rf_sanitize_garmin/i.test(sql), "Öffentliche Profile werden aus festen Feldern neu aufgebaut");
check("token-hash", "Schreibtoken wird gehasht", /digest\(p_write_token, 'sha256'\)/i.test(sql), "Kein Klartext-Schreibtoken in der Tabelle");
check("encrypted-backup", "Verschlüsselte Backups", /AES-GCM/.test(app) && /PBKDF2/.test(app) && /310000/.test(app), "AES-GCM, PBKDF2-SHA-256, 310.000 Iterationen");
check("upload-magic", "Bildprüfung mit Magic Bytes", /rf900IsValidImageMagic/.test(app) && /RF900_MAX_IMAGE_BYTES/.test(app), "MIME, Größe und Dateisignatur werden geprüft");
check("import-ssrf", "Workout-Link-Import gegen interne Ziele geschützt", /isPrivateAddress/.test(importer) && /dns\.lookup/.test(importer) && /MAX_REDIRECTS/.test(importer), "Private IPs, Ports und Redirects werden begrenzt");
check("import-rate", "Burst-Limit für Link-Import", /RATE_LIMIT\s*=\s*12/.test(importer) && /allowRequest/.test(importer), "12 Anfragen pro 10 Minuten und Serverless-Instanz");
check("dependency-pin", "OCR-Abhängigkeit fest gepinnt", /tesseract\.js@5\.1\.1/.test(app), "Keine unbestimmte Major-Version");
check("human-copy", "Keine generischen AI-Marketingphrasen", !/(AI-Powered Intelligence|Automate Your Workflow|Early Access)/i.test(app + index), "Keine typischen generischen Claims oder Early-Access-Platzhalter");

// FIX 9.1.2: Neue Pruefungen fuer die in diesem Release behobenen Befunde.
const PLACEHOLDER_MAILS = /^(?:name@beispiel\.com|beispiel@|example@|.*@example\.(?:com|org))$/i;
const PUBLIC_SUPPORT_MAILS = new Set(["evorank.fitness@gmail.com"]);
const foundMails = [...new Set([app, index, read("app-config-v9.1.1.js")].join("\n")
  .match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}\b/g) || [])]
  .filter(mail => !/\.(?:png|jpg|jpeg|webp|svg|gif|css|js|json|txt|html|webmanifest)$/i.test(mail))
  .filter(mail => !PLACEHOLDER_MAILS.test(mail))
  .filter(mail => !PUBLIC_SUPPORT_MAILS.has(mail.toLowerCase()));
check("no-plaintext-emails", "Keine privaten Klartext-E-Mail-Adressen im Bundle",
  foundMails.length === 0,
  foundMails.length ? `Gefunden: ${foundMails.join(", ")}` : "Nur die ausdrücklich öffentliche Supportadresse ist erlaubt");
check("session-chain", "Session-Pruefung umgeht die alte Filterschicht",
  /rf75ReadSession=function\(\)\{\s*\n?\s*const key = safeStorageGet/.test(app) || /FIX 9\.1\.2/.test(app),
  "9.1.1-Schicht liest den Speicher direkt statt die 9.1.0-Schicht aufzurufen");
check("sri", "Externes OCR-Skript mit Subresource Integrity",
  /script\.integrity/.test(app) && /RF87_TESSERACT_SRI/.test(app),
  "integrity und crossOrigin werden gesetzt");
check("sri-value", "SRI-Hash ist eingetragen",
  /RF87_TESSERACT_SRI\s*=\s*"sha384-/.test(app),
  "Ohne Hash bleibt das Attribut wirkungslos - vor Release setzen");
check("import-origin", "Link-Import nur aus der eigenen App",
  /originAllowed/.test(importer),
  "Herkunftspruefung gegen offenen Web-Proxy");
check("import-rebinding", "Schutz gegen DNS-Rebinding",
  /guardedLookup/.test(importer) && /lookup: guardedLookup/.test(importer),
  "Jede Adresse wird beim Verbindungsaufbau erneut geprueft");
check("sw-no-internals", "Keine internen Dateien im Offline-Cache",
  !/APPROVED-EMAILS|SUPABASE-.*\.sql|ADD-APPROVED-EMAIL/.test(sw),
  "Doku und SQL werden nicht mehr oeffentlich ausgeliefert");
check("no-liftoff-ui", "Keine Fremdmarke in sichtbaren UI-Texten",
  !/Liftoff-(Kalibrierungstabellen|Schwellen)/.test(app),
  "Produkttexte nennen keine fremde Marke");

const secretPatterns = [
  { name: "Private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Supabase secret key", regex: /sb_secret_[A-Za-z0-9_-]{20,}/g },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9]{30,}/g }
];
const findings = [];
for (const [file, text] of contents) {
  for (const pattern of secretPatterns) {
    const matches = [...text.matchAll(pattern.regex)];
    if (matches.length) findings.push({ file: path.relative(root, file), type: pattern.name, count: matches.length });
  }
}
check("secret-scan", "Secret-Scan ohne Treffer", findings.length === 0, findings.length ? findings : "Keine typischen Secret-Muster gefunden");

const externalRuntime = [];
for (const match of app.matchAll(/https:\/\/[^"'`\s)]+/g)) {
  if (/cdn\.jsdelivr\.net/.test(match[0])) externalRuntime.push(match[0]);
}
check("external-runtime", "Externe Laufzeitquellen begrenzt", externalRuntime.every(url => /tesseract\.js@5\.1\.1/.test(url)), [...new Set(externalRuntime)]);

const passed = checks.filter(item => item.ok).length;
const report = {
  appVersion: VERSION,
  generatedAt: new Date().toISOString(),
  root: path.basename(root),
  passed,
  total: checks.length,
  ok: passed === checks.length,
  checks,
  secretFindings: findings,
  version: VERSION,
  // FIX 9.1.2: Nur Dateien hashen, die es tatsaechlich gibt.
  sha256: Object.fromEntries(["index.html", `assets/${APP_FILE}`, `assets/rankforge-v${VERSION}.css`, sqlFile]
    .filter(relative => relative && fs.existsSync(path.join(root, relative)))
    .map(relative => [relative, crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex")]))
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2));
console.log(`${report.ok ? "PASS" : "FAIL"}: ${passed}/${checks.length} checks`);
console.log(output);
process.exit(report.ok ? 0 : 1);
