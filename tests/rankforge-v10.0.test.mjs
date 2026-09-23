import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function runtime(source) {
  class LiftoffApp {}
  for (const method of ["render", "renderHome", "renderProfile", "renderBottomNav", "handleClick", "handleSubmit", "init"]) {
    LiftoffApp.prototype[method] = method.startsWith("handle") || method === "init" ? async () => {} : () => method === "renderHome" ? '<section class="week-section">' : "";
  }
  const context = { window:{ LiftoffApp, RANKFORGE_I18N:{ language:"de", translateRoot(){} } }, LiftoffApp, Intl, Date, Map, Set, Object, Math, Number, String, Array, console, document:{ documentElement:{ dataset:{} } }, FormData:class {}, queueMicrotask };
  vm.runInNewContext(source, context);
  return context.window.RANKFORGE1000;
}

test("keeps password recovery on the current public build, including root redirects", async () => {
  const [account, cloud, page] = await Promise.all([
    read("assets/account-sync-v2.js"),
    read("cloud-config.js"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(cloud, /new URL\(`\.\/index\.html\?auth=recovery&build=1100-r1`, location\.href\)\.href/);
  assert.doesNotMatch(cloud, /chatgpt\.site\/rankforge\/index\.html\?auth=recovery/);
  assert.match(account, /RANKFORGE_CLOUD\?\.authRedirectUrl/);
  assert.match(page, /window\.location\.search/);
  assert.match(page, /window\.location\.hash/);
});

test("uses a narrower calendar with round activity markers", async () => {
  const css = await read("assets/calendar-plan-v10.0.css");
  assert.match(css, /\.rf1000-calendar-screen\{width:min\(100%,560px\);margin-inline:auto/);
  assert.match(css, /\.rf1000-month-grid button\{[^}]*background:transparent/);
  assert.match(css, /\.rf1000-month-grid button i\{[^}]*width:8px;height:8px[^}]*border-radius:50%/);
});

test("keeps the bodygraph hidden behind iPhone account forms and exposes account sign-out", async () => {
  const [accountUi, core] = await Promise.all([
    read("assets/account-ui-v2.js"),
    read("assets/rankforge-v9.2.0.js"),
  ]);
  assert.match(accountUi, /html\[data-rf92-auth="true"\] #app\{visibility:hidden!important\}/);
  assert.match(accountUi, /height:100lvh;min-height:100lvh/);
  assert.match(accountUi, /document\.documentElement\.dataset\.rf92Auth = offen \? "true" : "false"/);
  assert.match(core, /Account wechseln oder abmelden/);
  assert.match(core, /\["rf75-logout", "v7-switch-account", "account-select", "switch-account"\]/);
  assert.match(core, /window\.RANKFORGE_ACCOUNT_UI\?\.open\?\.\(\)/);
});

test("combines strength and endurance history without losing same-day activities", async () => {
  const api = runtime(await read("assets/calendar-plan-v10.0.js"));
  const app = { state:{ profile:{ trainingDays:[1,3,5] }, workouts:[{ id:"gym", name:"Push", endedAt:"2026-08-25T12:00:00" }], triathlon:{ activities:[{ id:"run", sport:"run", date:"2026-08-25T17:00:00", distanceMeters:5000, durationSeconds:1500 }] }, garmin:{ activities:[] } }, ui:{} };
  api.ensure(app);
  const entries = api.calendarEntries(app);
  assert.equal(entries.length, 2);
  assert.equal(new Set(entries.map(item => item.date)).size, 1);
  assert.deepEqual(Array.from(entries, item => item.sport), ["strength", "run"]);
});

test("generates sessions exclusively from selected sports", async () => {
  const api = runtime(await read("assets/calendar-plan-v10.0.js"));
  const app = { state:{ profile:{}, trainingPlanV10:{ activeSports:["swim","bike"], primarySport:"swim", sessionsPerWeek:4, durationMinutes:45, days:[1,3,5,6], details:{ swimLevel:"intermediate", poolLength:25, bikeLevel:"beginner", bikePlace:"outdoor" } } }, ui:{} };
  api.ensure(app);
  const plan = api.generatePlan(app);
  assert.equal(plan.length, 4);
  assert.ok(plan.every(item => ["swim","bike"].includes(item.sport)));
  assert.ok(!plan.some(item => item.sport === "strength" || item.sport === "run"));
});

test("keeps every selected sport represented when weekly frequency is lower", async () => {
  const api = runtime(await read("assets/calendar-plan-v10.0.js"));
  const app = { state:{ profile:{}, trainingPlanV10:{ activeSports:["strength","swim","run","bike"], primarySport:"strength", sessionsPerWeek:3, durationMinutes:60, days:[1,3,5], details:{} } }, ui:{} };
  api.ensure(app);
  const plan = api.generatePlan(app);
  assert.equal(plan.length, 4);
  assert.deepEqual(new Set(plan.map(item => item.sport)), new Set(["strength","swim","run","bike"]));
});

test("keeps onboarding conditional, optional, progressive and available in six languages", async () => {
  const source = await read("assets/calendar-plan-v10.0.js");
  for (const language of ["de","en","zh","hi","es","ar"]) assert.match(source, new RegExp(`\\n\\s*${language}:`));
  assert.match(source, /a\.wantsPlan!==false/);
  assert.match(source, /a\.activeSports\.includes\("swim"\)/);
  assert.match(source, /a\.activeSports\.includes\("run"\)/);
  assert.match(source, /a\.activeSports\.includes\("bike"\)/);
  assert.match(source, /role="progressbar"/);
  assert.match(source, /NEU · VERSION 10\.9/);
  assert.doesNotMatch(source, /Frage\s+\$\{wizard\.step/);
});
