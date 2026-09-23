import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function runtime(source103, source104) {
  class LiftoffApp {}
  LiftoffApp.prototype.renderHome = () => '<section><section class="rf102-home-ranks is-dual"></section><section class="home-bodygraph-section"></section></section>';
  LiftoffApp.prototype.renderProfile = () => '<button data-action="rf102-rank-settings"></button>';
  LiftoffApp.prototype.renderRanks = () => '<section><div class="screen-title"></div><div class="rank-tabs"></div><section class="rf102-endurance-ranks"></section></section>';
  LiftoffApp.prototype.renderModal = () => "";
  LiftoffApp.prototype.handleClick = async () => {};
  LiftoffApp.prototype.handleChange = async () => {};
  LiftoffApp.prototype.handleSubmit = async () => {};
  LiftoffApp.prototype.init = async () => {};
  const context = {
    LiftoffApp,
    window:{ LiftoffApp, RANKFORGE_I18N:{ language:"de" }, RANKFORGE970:{ sportMetrics:() => ({ score:0,index:0,recent:[],current:["•","Start"],next:null }), animals:{} }, scrollTo(){} },
    escapeHtml:value => String(value), escapeAttr:value => String(value), icon:() => "", rankTitle:rank => rank.title || "Wood III", rankMark:() => '<span class="rank-mark"></span>',
    Object, Array, Set, Map, Math, Number, String, RegExp, console
  };
  vm.runInNewContext(source103, context);
  vm.runInNewContext(source104, context);
  return { LiftoffApp, api:context.window.RANKFORGE104 };
}

function appFrom(LiftoffApp) {
  const app = new LiftoffApp();
  app.state = { schemaVersion:32, homeRanksV103:{ order:["strength","swim"], selected:["strength","swim"] }, trainingPlanV10:{ activeSports:["strength","swim"], primarySport:"strength" } };
  app.ui = { view:"home", modal:null };
  app.metrics = { rank:{ title:"Wood III", lp:0, score:0 } };
  app.modalHeader = () => "<header></header>";
  app.openModal = type => { app.ui.modal = { type }; };
  app.render = () => {};
  app.scheduleSave = () => {};
  app.showToast = () => {};
  return app;
}

test("loads the 10.4 Home design layer last and caches it offline", async () => {
  const [html, worker] = await Promise.all([read("index.html"), read("service-worker.js")]);
  assert.match(html, /rank-dashboard-v10\.3-r1\.css\?build=1110-r1[\s\S]*home-rank-frame-v10\.4-r1\.css\?build=1040-r1/);
  assert.match(html, /rank-dashboard-v10\.3-r1\.js\?build=1110-r1[\s\S]*home-rank-frame-v10\.4-r1\.js\?build=1040-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /home-rank-frame-v10\.4-r1\.js\?build=1040-r1/);
});

test("keeps colored Home frames enabled for existing profiles", async () => {
  const { LiftoffApp, api } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"), await read("assets/home-rank-frame-v10.4-r1.js"));
  const app = appFrom(LiftoffApp);
  assert.equal(api.ensure(app).framed, true);
  assert.equal(app.state.appVersion, "10.4");
  assert.equal(app.state.schemaVersion, 33);
  assert.match(app.renderHome(), /rf104-home-ranks--framed/);
});

test("adds a framed or frameless choice to the existing rank settings", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"), await read("assets/home-rank-frame-v10.4-r1.js"));
  const app = appFrom(LiftoffApp);
  app.ui.modal = { type:"rf103-rank-settings" };
  app.ui.rf103RankDraft = { order:["strength","swim"] };
  const html = app.renderModal();
  assert.match(html, /Mit Rahmen/);
  assert.match(html, /Ohne Rahmen/);
  assert.match(html, /data-action="rf104-frame-style"/);
});

test("persists the frameless choice only for Home rank cards", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"), await read("assets/home-rank-frame-v10.4-r1.js"));
  const app = appFrom(LiftoffApp);
  app.ui.rf103RankDraft = { order:["strength","swim"] };
  await app.handleChange({ target:{ dataset:{ action:"rf104-frame-style" }, value:"plain" } });
  const form = { dataset:{ form:"rf103-rank-settings" }, closest(){ return this; } };
  await app.handleSubmit({ preventDefault(){}, target:{ closest(){ return form; } } });
  assert.equal(app.state.homeRankDesignV104.framed, false);
  assert.match(app.renderHome(), /rf104-home-ranks--plain/);
  assert.doesNotMatch(app.renderRanks(), /rf104-home-ranks--plain/);
});

test("removes only the colored Home frame while retaining sport accents", async () => {
  const css = await read("assets/home-rank-frame-v10.4-r1.css");
  assert.match(css, /\.rf104-home-ranks--plain \.rf103-rank-card\{border-color:transparent;background:var\(--surface\)/);
  assert.match(css, /\.rf104-home-ranks--plain \.rf103-rank-card:before\{display:none\}/);
  assert.doesNotMatch(css, /rf103-rank-switcher[^\n]*rf104-home-ranks--plain/);
});
