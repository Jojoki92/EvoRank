import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("./", import.meta.url));
// The same launcher serves a Windows delivery or the editable source checkout.
const websiteRoot = existsSync(resolve(packageRoot, "website"))
  ? resolve(packageRoot, "website")
  : resolve(packageRoot, "../../public/rankforge");
// A stable origin keeps local training data associated with the same app.
const requestedPort = Number.parseInt(process.env.EVORANK_PORT || "8123", 10);
const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort <= 65535 ? requestedPort : 8123;

if (!existsSync(websiteRoot) || !statSync(websiteRoot).isDirectory()) {
  console.error("FEHLER: Der Ordner 'website' fehlt. Bitte die ZIP-Datei vollständig entpacken.");
  process.exit(1);
}

const mime = new Map([
  [".html", "text/html; charset=utf-8"], [".htm", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"], [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"], [".webp", "image/webp"], [".gif", "image/gif"],
  [".ico", "image/x-icon"], [".woff", "font/woff"], [".woff2", "font/woff2"],
  [".ttf", "font/ttf"], [".wasm", "application/wasm"], [".mp4", "video/mp4"],
]);

const securityHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
};

function send(response, status, body, type = "text/plain; charset=utf-8", headOnly = false) {
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  response.writeHead(status, { ...securityHeaders, "Content-Type": type, "Content-Length": bytes.length });
  response.end(headOnly ? undefined : bytes);
}

function resolvedRequestPath(requestUrl) {
  let decoded;
  try { decoded = decodeURIComponent(new URL(requestUrl || "/", "http://127.0.0.1").pathname); }
  catch { return null; }
  const clean = decoded.replaceAll("\\", "/");
  const parts = clean.split("/").filter(Boolean);
  if (parts.some(part => part === "." || part === "..")) return null;
  if (parts.some(part => part.toLowerCase() === "internal")) return null;
  if (parts.some(part => /\.sql$/i.test(part) || /^approved-emails/i.test(part))) return null;
  const relative = parts.join("/") || "index.html";
  const candidate = normalize(join(websiteRoot, relative));
  if (isAbsolute(relative) || (candidate !== websiteRoot && !candidate.startsWith(websiteRoot + sep))) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  if (!extname(relative)) return join(websiteRoot, "index.html");
  return "";
}

const server = createServer((request, response) => {
  const method = String(request.method || "GET").toUpperCase();
  const headOnly = method === "HEAD";
  if (method !== "GET" && !headOnly) return send(response, 405, "Nur GET und HEAD sind erlaubt.");
  const target = resolvedRequestPath(request.url);
  if (target === null) return send(response, 403, "Zugriff verweigert.", undefined, headOnly);
  if (!target || !existsSync(target)) return send(response, 404, "Datei nicht gefunden.", undefined, headOnly);
  const size = statSync(target).size;
  response.writeHead(200, { ...securityHeaders, "Content-Type": mime.get(extname(target).toLowerCase()) || "application/octet-stream", "Content-Length": size });
  if (headOnly) return response.end();
  createReadStream(target).on("error", () => response.destroy()).pipe(response);
});

server.on("error", error => {
  console.error(`EVORANK konnte nicht gestartet werden: ${error.message}`);
  process.exitCode = 2;
});

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/`;
  console.log("\n  EvoRank X5.8 ist bereit");
  console.log(`  ${url}\n`);
  console.log("  Dieses Fenster geöffnet lassen. Zum Beenden Strg+C drücken.\n");
  if (process.env.EVORANK_NO_OPEN !== "1") {
    const opener = process.platform === "win32"
      ? spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" });
    opener.on("error", () => console.log(`Browser bitte manuell öffnen: ${url}`));
    opener.unref();
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
