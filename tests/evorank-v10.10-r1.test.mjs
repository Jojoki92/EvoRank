import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("keeps EVORANK 10.10 loaded before the current final layer", async () => {
  const [html, worker, version, manifest, layout] = await Promise.all([
    read("index.html"), read("service-worker.js"), read("version.txt"), read("manifest.webmanifest"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(version.trim(), "10.11");
  assert.match(html, /evorank-v10\.9-r1\.js\?build=1090-r3[\s\S]*evorank-v10\.10-r1\.js\?build=1100-r1[\s\S]*evorank-v10\.11-r1\.js\?build=1110-r1/);
  assert.match(html, /evorank-v10\.9-r1\.css\?build=1090-r3[\s\S]*evorank-v10\.10-r1\.css\?build=1100-r1[\s\S]*evorank-v10\.11-r1\.css\?build=1110-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /evorank-v10\.10-r1\.js\?build=1100-r1/);
  assert.match(manifest, /EvoRank 10\.11/);
  assert.match(layout, /EvoRank 10\.11/);
});

test("keeps cloud and leaderboard publishing off until explicit consent", async () => {
  const [bridge, leaderboard, production] = await Promise.all([
    read("assets/account-bridge-v1.js"),
    read("assets/evorank-v10.9-r1.js"),
    read("assets/evorank-v10.10-r1.js"),
  ]);
  assert.match(bridge, /CLOUD_CONSENT_KEY/);
  assert.match(bridge, /if \(!cloudConsent\(local\)\) return/);
  assert.match(leaderboard, /leaderboardConsent !== true/);
  assert.match(production, /leaderboardConsent:false|leaderboardConsent: previous\.leaderboardConsent === true/);
  assert.match(production, /garminDataConsent: previous\.garminDataConsent === true/);
});

test("creates a support bundle without names, email, IDs or workout contents", async () => {
  const source = await read("assets/evorank-v10.10-r1.js");
  class LiftoffApp {}
  for (const method of ["renderProfile", "renderModal", "renderExercisePickerModal"]) LiftoffApp.prototype[method] = () => "<section></section>";
  for (const method of ["handleClick", "postNativeTimer", "exportData", "init"]) LiftoffApp.prototype[method] = async () => {};
  const storage = new Map();
  const navigator = { onLine:true, language:"de", serviceWorker:{}, standalone:false };
  const document = { documentElement:{ lang:"de" } };
  const window = {
    LiftoffApp, navigator, document,
    localStorage:{ getItem:key => storage.get(key) || null, setItem:(key, value) => storage.set(key, value), removeItem:key => storage.delete(key) },
    matchMedia:() => ({ matches:false }),
    RANKFORGE_ACCOUNT:{ status:() => ({ signedIn:true, hasProfile:true }) },
  };
  const context = { LiftoffApp, window, navigator, document, localStorage:window.localStorage, escapeHtml:String, escapeAttr:String, Blob, URL, Object, Array, Set, Map, Math, Number, String, RegExp, Date, Boolean, JSON, console, fetch:async () => ({}), location:{ origin:"https://example.test" }, confirm:() => true, prompt:() => "", matchMedia:window.matchMedia };
  vm.runInNewContext(source, context);
  const app = {
    state:{
      workouts:[{ id:"secret-workout-id", name:"Secret Leg Day", notes:"Private note", weightKg:180 }],
      routines:[{ id:"routine-secret", name:"Private Routine" }],
      profile:{ name:"Johannes Secret", email:"secret@example.com" },
      garmin:{ activities:[{ id:"garmin-secret" }], connection:{ status:"connected" } },
    },
    ui:{}, scheduleSave() {},
  };
  const output = JSON.stringify(window.EVORANK110.supportBundle(app));
  for (const secret of ["secret@example.com", "Johannes Secret", "secret-workout-id", "Secret Leg Day", "Private note", "180", "routine-secret", "garmin-secret"]) {
    assert.doesNotMatch(output, new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(output, /keine E-Mail/i);
});

test("marks 50 reviewed mobility basics and keeps all 500 names unique", async () => {
  const source = await read("assets/evorank-v10.9-r1.js");
  class LiftoffApp {}
  for (const method of ["renderRanks", "renderModal", "renderExercisePickerModal"]) LiftoffApp.prototype[method] = () => "<section></section>";
  for (const method of ["handleClick", "scheduleSave", "init"]) LiftoffApp.prototype[method] = async () => {};
  const exercises = [];
  const exerciseIndex = new Map();
  const window = { LiftoffApp, setTimeout:() => 1, clearTimeout() {}, RANKFORGE_ACCOUNT:{ status:() => ({ signedIn:false, hasProfile:false }) } };
  vm.runInNewContext(source, { LiftoffApp, EXERCISES:exercises, exerciseIndex, EXERCISE_PICKER_PAGE_SIZE:60, window, navigator:{ onLine:true }, fetch:async () => ({ ok:true, json:async () => [] }), escapeHtml:String, escapeAttr:String, Object, Array, Set, Map, Math, Number, String, RegExp, Date, Boolean, JSON, console });
  assert.equal(exercises.length, 500);
  assert.equal(new Set(exercises.map(item => item.name)).size, 500);
  assert.equal(exercises.filter(item => item.curation === "reviewed-base").length, 50);
  assert.ok(exercises.every(item => item.safetyLevel === "general-wellness"));
});

test("installs server-side consent, moderation, reporting and Garmin verification", async () => {
  const sql = await readFile(new URL("../db/SUPABASE-PRODUCTION-10.10.sql", import.meta.url), "utf8");
  for (const pattern of [
    /evorank_data_consents/i,
    /leaderboard_consent_required/i,
    /moderation_state/i,
    /evorank_leaderboard_report/i,
    /evorank_leaderboard_block/i,
    /rf_garmin_activities/i,
    /garmin_activity_not_verified/i,
    /revoke all on public\.evorank_leaderboard_entries from public, anon, authenticated/i,
  ]) assert.match(sql, pattern);
  const top = sql.match(/create or replace function public\.evorank_leaderboard_top[\s\S]*?\$\$;/i)?.[0] || "";
  assert.doesNotMatch(top, /email/i);
});

test("ships WidgetKit, ActivityKit, Dynamic Island and the WKWebView bridge", async () => {
  const [bundle, widget, activity, bridge, store] = await Promise.all([
    read("native/ios/EvoRankWidgetBundle.swift"), read("native/ios/EvoRankWorkoutWidget.swift"),
    read("native/ios/EvoRankLiveActivityWidget.swift"), read("native/ios/EvoRankWebBridge.swift"),
    read("native/ios/EvoRankSharedWorkoutStore.swift"),
  ]);
  assert.match(bundle, /EvoRankWorkoutWidget/);
  assert.match(widget, /StaticConfiguration/);
  assert.match(activity, /DynamicIsland/);
  assert.match(bridge, /evorankLiveActivity/);
  assert.match(store, /WidgetCenter\.shared\.reloadTimelines/);
});

test("includes production setup and a secret-free environment template", async () => {
  const [checklist, email, garmin, env] = await Promise.all([
    readFile(new URL("../docs/production/EVORANK-10.10-PRODUCTION-CHECKLIST.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/production/EVORANK-10.10-EMAIL-SUPABASE.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/production/EVORANK-10.10-GARMIN-NETLIFY.md", import.meta.url), "utf8"),
    readFile(new URL("../netlify.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(checklist, /SUPABASE-PRODUCTION-10\.10\.sql/);
  assert.match(email, /Sender email address/);
  assert.match(garmin, /GARMIN_CLIENT_SECRET/);
  assert.match(env, /REPLACE_SERVER_ONLY/);
  assert.doesNotMatch(env, /sb_secret_|eyJ[a-zA-Z0-9_-]{20,}/);
});

test("ships a normal Windows package with a safe optional Node fallback", async () => {
  const [server, launcher, guide] = await Promise.all([
    readFile(new URL("../packaging/windows/EVORANK-NODE-SERVER.mjs", import.meta.url), "utf8"),
    readFile(new URL("../packaging/windows/EVORANK-START-MIT-NODE.bat", import.meta.url), "utf8"),
    readFile(new URL("../packaging/windows/EVORANK-STARTANLEITUNG-WINDOWS.txt", import.meta.url), "utf8"),
  ]);
  assert.match(server, /listen\(port, "127\.0\.0\.1"/);
  assert.match(server, /part === "\.\."/);
  assert.match(launcher, /where node/i);
  assert.match(guide, /EVORANK\.exe/);
  assert.match(guide, /Node-Fallback|Node\.js/i);
});
