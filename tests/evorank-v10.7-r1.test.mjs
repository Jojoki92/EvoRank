import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("keeps the EvoRank 10.6 selection layer and loads the 10.10 override last", async () => {
  const [html, worker, css] = await Promise.all([
    read("index.html"),
    read("service-worker.js"),
    read("assets/bodygraph-selection-v10.6-r1.css"),
  ]);
  assert.match(html, /home-rank-frame-v10\.4-r1\.css\?build=1040-r1[\s\S]*bodygraph-selection-v10\.6-r1\.css\?build=1060-r1[\s\S]*evorank-v10\.8-r1\.css\?build=1080-r1[\s\S]*evorank-v10\.9-r1\.css\?build=1090-r3[\s\S]*evorank-v10\.10-r1\.css\?build=1100-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /bodygraph-selection-v10\.6-r1\.css\?build=1060-r1/);
  assert.match(css, /\.rf920-muscle-region\.is-selected[\s\S]*brightness\(1\.22\)[\s\S]*drop-shadow/);
  assert.match(css, /\.body-figure--female-893[\s\S]*\.muscle-region\.is-selected/);
});

test("uses the current domain for signup and password recovery redirects", async () => {
  const [sync, cloud] = await Promise.all([read("assets/account-sync-v2.js"), read("cloud-config.js")]);
  assert.match(sync, /authPath\("\/auth\/v1\/signup"\)/);
  assert.match(sync, /authPath\("\/auth\/v1\/recover"\)/);
  assert.match(sync, /redirect_to=\$\{encodeURIComponent\(redirectTarget\(\)\)\}/);
  assert.doesNotMatch(sync, /email_redirect_to/);
  assert.match(cloud, /new URL\(`\.\/index\.html\?auth=recovery&build=1100-r1`, location\.href\)\.href/);
  assert.doesNotMatch(cloud, /chatgpt\.site\/rankforge\/index\.html\?auth=recovery/);
});

test("lets an unconfirmed user resend the signup confirmation", async () => {
  const [sync, ui] = await Promise.all([read("assets/account-sync-v2.js"), read("assets/account-ui-v2.js")]);
  assert.match(sync, /resendSignupConfirmation/);
  assert.match(sync, /authPath\("\/auth\/v1\/resend"\)/);
  assert.match(sync, /type: "signup"/);
  assert.match(ui, /Bestätigungs-E-Mail erneut senden/);
  assert.match(ui, /email_not_confirmed/);
  assert.match(ui, /Spam\/Junk/);
});

test("identifies the public release as EvoRank 10.11", async () => {
  const [html, version] = await Promise.all([read("index.html"), read("version.txt")]);
  assert.match(html, /name="evorank-build" content="10\.11\.0"/);
  assert.equal(version.trim(), "10.11");
});

test("ships the requested red-white lightning icon in every home-screen size", async () => {
  const [html, manifest, worker, brand, darkFavicon, icon180, icon192, icon512] = await Promise.all([
    read("index.html"),
    read("manifest.webmanifest"),
    read("service-worker.js"),
    read("assets/evorank-brand-v10.7-r1.js"),
    read("icons/favicon-dark-evorank-v10.7.svg"),
    readFile(new URL("icons/evorank-icon-v10.7-180.png", root)),
    readFile(new URL("icons/evorank-icon-v10.7-192.png", root)),
    readFile(new URL("icons/evorank-icon-v10.7-512.png", root)),
  ]);
  assert.match(html, /<title>EvoRank<\/title>/);
  assert.match(html, /evorank-icon-v10\.11-192\.png/);
  assert.match(html, /apple-touch-icon[^>]*evorank-icon-v10\.11-180\.png/);
  assert.match(html, /evorank-splash-390x844@3x\.png/);
  assert.match(html, /account-local-v10\.7-r2\.js\?build=1070-r2/);
  assert.match(html, /evorank-brand-v10\.7-r1\.js\?build=1070-r2/);
  assert.match(manifest, /"short_name": "EvoRank"/);
  assert.match(manifest, /evorank-icon-v10\.11-512\.png/);
  assert.match(worker, /account-local-v10\.7-r2\.js\?build=1070-r2/);
  assert.match(worker, /evorank-brand-v10\.7-r1\.js\?build=1070-r2/);
  assert.match(brand, /replace\(\/RANKFORGE\/g, "EVORANK"\)/);
  assert.match(brand, /version: "10\.7"/);
  assert.match(brand, /legacyStorageCompatible: true/);
  assert.match(darkFavicon, /fill="#ff3658"/);
  assert.match(darkFavicon, /fill="#f7f9fc"/);
  const pngSize = buffer => [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  assert.deepEqual(pngSize(icon180), [180, 180]);
  assert.deepEqual(pngSize(icon192), [192, 192]);
  assert.deepEqual(pngSize(icon512), [512, 512]);
});

test("includes the beginner Supabase and Gmail setup guide", async () => {
  const guide = await readFile(new URL("../EVORANK-SUPABASE-GMAIL-ANLEITUNG-10.7.md", import.meta.url), "utf8");
  assert.match(guide, /smtp\.gmail\.com/);
  assert.match(guide, /Port \| `465`/);
  assert.match(guide, /16-stellige App-Passwort/);
  assert.match(guide, /netlify\.app\/\*\*/);
  assert.match(guide, /SUPABASE-KONTO-FREUNDE-9\.8\.sql/);
  assert.match(guide, /Niemals dein normales\s+Gmail-Passwort/i);
});
