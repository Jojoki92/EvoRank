import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function runtime(source) {
  class LiftoffApp {}
  LiftoffApp.prototype.renderHome = () => '<section class="screen home-screen rf1004-home-without-strength"><section class="rf1004-home-modules is-compact"><header></header><div></div></section><button class="home-rank-card" style="--rank-color:#a66" data-action="navigate" data-view="ranks"><div class="home-rank-card__copy"><small>DEIN GYM-RANK</small><h2>Wood III</h2></div><div class="home-rank-card__mark"><span class="rank-mark"></span></div></button><section class="home-bodygraph-section"></section></section>';
  LiftoffApp.prototype.renderProfile = () => '<section><button data-action="rf1004-home-settings"><span></span><div><strong>Startseite anpassen</strong></div></button><button data-action="switch-account"></button></section>';
  LiftoffApp.prototype.renderRanks = () => '<section class="screen ranks-screen"><div class="rank-view"></div></section>';
  LiftoffApp.prototype.renderModal = () => "";
  LiftoffApp.prototype.handleClick = async () => {};
  LiftoffApp.prototype.handleChange = async () => {};
  LiftoffApp.prototype.handleSubmit = async () => {};
  LiftoffApp.prototype.init = async () => {};
  const metrics = sport => ({ score:sport === "run" ? 225 : 0, index:sport === "run" ? 2 : 0, recent:[], current:sport === "run" ? ["🦡","Dachs"] : ["•",sport], next:["→",`${sport} next`] });
  const context = {
    LiftoffApp,
    window:{ LiftoffApp, RANKFORGE_I18N:{ language:"de" }, RANKFORGE970:{ sportMetrics:(sport) => metrics(sport) }, scrollTo(){} },
    escapeHtml:value => String(value), escapeAttr:value => String(value), icon:() => "",
    FormData:class { constructor(form){ this.form=form; } getAll(){ return this.form.values || []; } },
    Object, Array, Set, Map, Math, Number, String, RegExp, console
  };
  vm.runInNewContext(source, context);
  return { LiftoffApp, api:context.window.RANKFORGE102 };
}

function appFrom(LiftoffApp) {
  const app = new LiftoffApp();
  app.state = { schemaVersion:30, triathlon:{ activeSport:"swim", activities:[] } };
  app.ui = { view:"home", rankTab:"rank", modal:null };
  app.metrics = { rank:{ title:"Wood III", lp:0 } };
  app.modalHeader = (a,b) => `<header>${a}${b}</header>`;
  app.openModal = type => { app.ui.modal = { type }; };
  app.render = () => {};
  app.scheduleSave = () => {};
  app.showToast = value => { app.toast=value; };
  return app;
}

test("loads the 10.2 rank layer last and caches it offline", async () => {
  const [html, worker] = await Promise.all([read("index.html"), read("service-worker.js")]);
  assert.match(html, /home-control-v10\.1-r1\.css\?build=1020-r1[\s\S]*rank-dashboard-v10\.2-r1\.css\?build=1020-r1/);
  assert.match(html, /home-control-v10\.1-r1\.js\?build=1020-r1[\s\S]*rank-dashboard-v10\.2-r1\.js\?build=1020-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /rank-dashboard-v10\.2-r1\.js\?build=1020-r1/);
});

test("removes the old colored home modules and keeps the original Gym rank card by default", async () => {
  const { LiftoffApp, api } = runtime(await read("assets/rank-dashboard-v10.2-r1.js"));
  const app = appFrom(LiftoffApp);
  assert.deepEqual(Array.from(api.ensure(app).selected), ["strength"]);
  assert.equal(app.state.schemaVersion, 31);
  const html = app.renderHome();
  assert.doesNotMatch(html, /rf1004-home-modules/);
  assert.doesNotMatch(html, /rf1004-home-without-strength/);
  assert.match(html, /DEIN GYM-RANK/);
  assert.equal((html.match(/<button class="home-rank-card/g) || []).length, 1);
});

test("shows any one or two real ranks in the large rank-card area", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.2-r1.js"));
  const app = appFrom(LiftoffApp);
  app.state.homeRanksV102 = { selected:["run", "swim"] };
  const html = app.renderHome();
  assert.match(html, /rf102-home-ranks is-dual/);
  assert.match(html, /rf102-rank-card--run/);
  assert.match(html, /Dachs/);
  assert.match(html, /rf102-rank-card--swim/);
  assert.equal((html.match(/<button class="home-rank-card/g) || []).length, 2);
});

test("adds swimming, running and cycling ranks to the main Ranks screen", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.2-r1.js"));
  const app = appFrom(LiftoffApp);
  const html = app.renderRanks();
  assert.match(html, /rf102-endurance-ranks/);
  for (const sport of ["swim", "run", "bike"]) assert.match(html, new RegExp(`rf102-endurance-card--${sport}`));
  assert.equal((html.match(/rf102-mini-ladder/g) || []).length, 3);
});

test("the selector enforces at least one and at most two Home ranks", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.2-r1.js"));
  const app = appFrom(LiftoffApp);
  const submit = values => app.handleSubmit({ preventDefault(){}, target:{ closest(){ return { values }; } } });
  await submit([]);
  assert.match(app.toast, /Mindestens/);
  await submit(["strength", "run", "swim"]);
  assert.match(app.toast, /höchstens zwei/);
  await submit(["strength", "run"]);
  assert.deepEqual(Array.from(app.state.homeRanksV102.selected), ["strength", "run"]);
});

test("keeps the new controls available in all six app languages", async () => {
  const source = await read("assets/rank-dashboard-v10.2-r1.js");
  for (const language of ["de", "en", "zh", "hi", "es", "ar"]) assert.match(source, new RegExp(`\\n\\s*${language}:`));
});
