import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("publishes EvoRank 10.11 with a fresh install identity", async () => {
  const [html, manifestText, worker, version] = await Promise.all([
    read("index.html"),read("manifest.webmanifest"),read("service-worker.js"),read("version.txt")
  ]);
  const manifest = JSON.parse(manifestText);
  assert.equal(version.trim(),"10.11");
  assert.equal(manifest.name,"EvoRank");
  assert.equal(manifest.short_name,"EvoRank");
  assert.ok(manifest.icons.some(item => /evorank-icon-v10\.11-512\.png/.test(item.src)));
  assert.match(html,/evorank-v10\.11-r1\.js\?build=1110-r1/);
  assert.match(worker,/evorank-v10\.11\.0-r1/);
});

test("explicit logout survives reload and a later login clears the marker", async () => {
  const source = await read("assets/account-sync-v2.js");
  assert.match(source,/EXPLICIT_LOGOUT_KEY/);
  assert.match(source,/if \(read\(EXPLICIT_LOGOUT_KEY\) === "1"\) return null/);
  assert.match(source,/store\(EXPLICIT_LOGOUT_KEY, "1"\)[\s\S]*saveSession\(null\)/);
  assert.match(source,/store\(EXPLICIT_LOGOUT_KEY, null\)[\s\S]*saveSession\(sessionFrom\(data\)\)/);
});

test("cloud reconciliation is automatic, non-blocking and loss-averse", async () => {
  const source = await read("assets/account-bridge-v1.js");
  assert.match(source,/function mergeTrainingStates/);
  assert.match(source,/mergeArray\(local\?\.\[field\], remote\?\.\[field\]\)/);
  assert.match(source,/Cloud und Gerät automatisch zusammengeführt/);
  assert.doesNotMatch(source,/window\.confirm\(frage\)/);
});

test("birthday profile uses wheel-friendly selects and grants 20 coins once per year", async () => {
  const [client, sql, job] = await Promise.all([
    read("assets/evorank-v10.11-r1.js"),
    readFile(new URL("../db/SUPABASE-BIRTHDAY-10.11.sql",import.meta.url),"utf8"),
    read("netlify/functions/birthday-email.mjs")
  ]);
  for (const field of ["birthDay","birthMonth","birthYear"]) assert.match(client,new RegExp(`select name=\\"${field}\\"`));
  assert.match(client,/BIRTHDAY_COINS = 20/);
  assert.match(sql,/primary key \(user_id, reward_year\)/i);
  assert.match(sql,/evorank_birthday_claim/i);
  assert.match(job,/schedule:"0 7 \* \* \*"/);
  assert.match(job,/RESEND_API_KEY/);
});

test("workout and exercise fixes remain visible and timer updates every copy", async () => {
  const [client, css] = await Promise.all([read("assets/evorank-v10.11-r1.js"),read("assets/evorank-v10.11-r1.css")]);
  assert.match(client,/rf111-exercise-replace/);
  assert.match(client,/querySelectorAll\("\.live-duration"\)/);
  assert.match(client,/Auch bekannt als/);
  assert.match(client,/rudern\|\\brow\\b/);
  assert.match(client,/\["Lat", "Oberer Rücken", "Bizeps"\]/);
  assert.match(css,/max\(env\(safe-area-inset-top,0px\),44px\)/);
  assert.match(css,/overflow-x:clip/);
  assert.match(css,/place-items:center/);
});

test("rank overview shows the real strength badge and safety area is understandable", async () => {
  const [ranks,client] = await Promise.all([read("assets/rank-dashboard-v10.3-r1.js"),read("assets/evorank-v10.11-r1.js")]);
  assert.match(ranks,/sport === "strength" \? data\.mark/);
  assert.match(client,/Sicherheit, Cloud & Support/);
  assert.match(client,/Hier steuerst du Freigaben, sicherst deine Daten/);
});
