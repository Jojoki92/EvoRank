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
