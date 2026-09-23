import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function loadRuntime(source) {
  class LiftoffApp {}
  LiftoffApp.prototype.renderHome = () => '<section class="screen home-screen"><div class="home-title"></div><button class="rf970-home-card"></button><button class="home-rank-card"></button><section class="home-bodygraph-section"></section><section class="week-section"></section></section>';
  LiftoffApp.prototype.renderProfile = () => '<section class="settings-list"><button data-action="switch-account"><span></span><div><strong>Account wechseln oder abmelden</strong><small>Aktiv: Test</small></div></button></section>';
  LiftoffApp.prototype.renderBottomNav = () => '<nav class="bottom-nav"><button class="nav-item" data-view="home"></button><button class="nav-item" data-view="friends"></button><button class="nav-create"></button><button class="nav-item rf970-nav" data-view="sports"></button><button class="nav-item" data-view="ranks"></button><button class="nav-item" data-view="profile"></button></nav>';
  LiftoffApp.prototype.renderModal = () => "";
  LiftoffApp.prototype.renderWorkoutDetailModal = id => `<div>${id}</div><div class="modal-footer modal-footer--row"></div>`;
  LiftoffApp.prototype.renderWorkoutMenuModal = () => "<strong>Workout löschen</strong><small>Kann nicht rückgängig gemacht werden</small>";
  LiftoffApp.prototype.handleClick = async () => {};
  LiftoffApp.prototype.handleSubmit = async () => {};
  LiftoffApp.prototype.init = async () => {};
  const context = {
    LiftoffApp,
    window:{ LiftoffApp, RANKFORGE_I18N:{ language:"de" }, scrollTo(){} },
    FormData:class { get(name){ return name === "understood" ? "on" : null; } getAll(){ return []; } },
    Object, Array, Set, Map, Math, Number, String, RegExp, console
  };
  vm.runInNewContext(source, context);
  return { LiftoffApp, api:context.window.RANKFORGE1004 };
}

function appFrom(LiftoffApp) {
  const app = new LiftoffApp();
  app.state = { schemaVersion:29, workouts:[{ id:"test-workout", name:"Olympian Test" }], trainingPlanV10:{ activeSports:["strength"] }, triathlon:{} };
  app.ui = { view:"home", modal:null };
  app.metrics = { rank:{ title:"Wood", lp:0 } };
  app.modalHeader = (kicker, title) => `<header><small>${kicker}</small><h2>${title}</h2></header>`;
  app.openModal = (type, data={}) => { app.ui.modal = { type, ...data }; };
  app.render = () => {};
  app.scheduleSave = () => {};
  app.showToast = value => { app.toast = value; };
  return app;
}

test("loads the 10.2 release layer after the existing feature layers and caches it offline", async () => {
  const [html, worker] = await Promise.all([read("index.html"), read("service-worker.js")]);
  assert.match(html, /calendar-plan-v10\.0\.css\?build=1020-r1[\s\S]*home-control-v10\.1-r1\.css\?build=1020-r1/);
  assert.match(html, /calendar-plan-v10\.0\.js\?build=1020-r1[\s\S]*home-control-v10\.1-r1\.js\?build=1020-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /home-control-v10\.1-r1\.css\?build=1020-r1/);
  assert.match(worker, /home-control-v10\.1-r1\.js\?build=1020-r1/);
});

test("persists configurable home areas without changing the default strength design", async () => {
  const { LiftoffApp, api } = loadRuntime(await read("assets/home-control-v10.1-r1.js"));
  const app = appFrom(LiftoffApp);
  const settings = api.ensure(app);
  assert.deepEqual(Array.from(settings.selected), ["strength"]);
  assert.equal(settings.primary, "strength");
  assert.equal(app.state.schemaVersion, 30);
  const home = app.renderHome();
  assert.match(home, /rf1004-home-modules--strength-only/);
  assert.match(home, /home-rank-card/);
  assert.doesNotMatch(home, /rf970-home-card/);

  app.state.homeModulesV10 = { selected:["swim", "run", "bike"], primary:"run" };
  const multisport = app.renderHome();
  assert.match(multisport, /rf1004-home-without-strength/);
  assert.match(multisport, /rf1004-home-module--run/);
  assert.match(multisport, /is-compact/);
});

test("keeps exactly two navigation actions on each side of the create button", async () => {
  const { LiftoffApp } = loadRuntime(await read("assets/home-control-v10.1-r1.js"));
  const app = appFrom(LiftoffApp);
  const navigation = app.renderBottomNav();
  assert.doesNotMatch(navigation, /rf970-nav/);
  assert.equal((navigation.match(/class="nav-item/g) || []).length, 4);
  assert.equal((navigation.match(/class="nav-create/g) || []).length, 1);
  const css = await read("assets/home-control-v10.1-r1.css");
  assert.match(css, /grid-template-columns:1fr 1fr 66px 1fr 1fr!important/);
});

test("makes account sign-out prominent and adds the home selector to profile", async () => {
  const { LiftoffApp } = loadRuntime(await read("assets/home-control-v10.1-r1.js"));
  const app = appFrom(LiftoffApp);
  const profile = app.renderProfile();
  assert.match(profile, /data-action="rf1004-home-settings"/);
  assert.match(profile, /rf1004-account-danger/);
  assert.match(profile, /Abmelden oder Account wechseln/);
});

test("requires review and explicit confirmation before a saved workout is discarded", async () => {
  const { LiftoffApp } = loadRuntime(await read("assets/home-control-v10.1-r1.js"));
  const app = appFrom(LiftoffApp);
  let deleted = "";
  app.deleteWorkout = id => { deleted = id; app.ui.modal = null; };
  const click = action => app.handleClick({ preventDefault(){}, target:{ closest(){ return { dataset:{ action, workoutId:"test-workout" } }; } } });

  await click("confirm-delete-workout");
  assert.equal(app.ui.modal.type, "rf1004-discard-review");
  assert.equal(deleted, "");
  assert.match(app.renderModal(), /Auswirkungen prüfen/);

  await click("rf1004-discard-next");
  assert.equal(app.ui.modal.type, "rf1004-discard-confirm");
  assert.equal(deleted, "");
  assert.match(app.renderModal(), /required/);

  const form = { dataset:{ workoutId:"test-workout" } };
  await app.handleSubmit({ preventDefault(){}, target:{ closest(selector){ return selector.includes("rf1004-discard") ? form : null; } } });
  assert.equal(deleted, "test-workout");
  assert.match(app.toast, /Ranks neu berechnet/);
});

test("keeps all new user-facing controls available in six languages", async () => {
  const source = await read("assets/home-control-v10.1-r1.js");
  for (const language of ["de", "en", "zh", "hi", "es", "ar"]) assert.match(source, new RegExp(`\\n\\s*${language}:`));
});
