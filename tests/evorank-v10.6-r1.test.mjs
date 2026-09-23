import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("keeps the EvoRank 10.6 selection layer cached in the current release", async () => {
  const [html, worker, css] = await Promise.all([
    read("index.html"),
    read("service-worker.js"),
    read("assets/bodygraph-selection-v10.6-r1.css"),
  ]);
  assert.match(html, /home-rank-frame-v10\.4-r1\.css\?build=1040-r1[\s\S]*bodygraph-selection-v10\.6-r1\.css\?build=1060-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /bodygraph-selection-v10\.6-r1\.css\?build=1060-r1/);
  assert.match(css, /\.rf920-muscle-region\.is-selected[\s\S]*brightness\(1\.22\)[\s\S]*drop-shadow/);
  assert.match(css, /\.body-figure--female-893[\s\S]*\.muscle-region\.is-selected/);
});

test("uses current redirect query for signup and password recovery", async () => {
  const [sync, cloud] = await Promise.all([read("assets/account-sync-v2.js"), read("cloud-config.js")]);
  assert.match(sync, /authPath\("\/auth\/v1\/signup"\)/);
  assert.match(sync, /authPath\("\/auth\/v1\/recover"\)/);
  assert.match(sync, /redirect_to=\$\{encodeURIComponent\(redirectTarget\(\)\)\}/);
  assert.doesNotMatch(sync, /email_redirect_to/);
  assert.match(cloud, /build=1100-r1/);
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

test("ships the EvoRank icon, splash screens and visible-brand migration", async () => {
  const [html, manifest, worker, brand] = await Promise.all([
    read("index.html"),
    read("manifest.webmanifest"),
    read("service-worker.js"),
    read("assets/evorank-brand-v10.7-r1.js"),
  ]);
  assert.match(html, /<title>EvoRank<\/title>/);
  assert.match(html, /evorank-icon-v10\.11-192\.png/);
  assert.match(html, /evorank-splash-390x844@3x\.png/);
  assert.match(html, /evorank-brand-v10\.7-r1\.js\?build=1070-r2/);
  assert.match(manifest, /"short_name": "EvoRank"/);
  assert.match(worker, /evorank-brand-v10\.7-r1\.js\?build=1070-r2/);
  assert.match(brand, /replace\(\/RANKFORGE\/g, "EVORANK"\)/);
  assert.match(brand, /legacyStorageCompatible: true/);
});
