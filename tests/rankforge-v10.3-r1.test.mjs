import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function runtime(source) {
  class LiftoffApp {}
  LiftoffApp.prototype.renderHome = () => '<section class="screen home-screen"><section class="rf102-home-ranks is-dual"><header></header><div></div></section><section class="home-bodygraph-section"></section></section>';
  LiftoffApp.prototype.renderProfile = () => '<section><button data-action="rf102-rank-settings"><span></span><div><strong>Ränge</strong></div></button><button data-action="switch-account"></button></section>';
  LiftoffApp.prototype.renderRanks = () => '<section class="screen ranks-screen"><div class="screen-title"><div><p>STRENGTH</p><h1>Ranks</h1></div></div><div class="rank-tabs"></div><div class="rank-view"></div><section class="rf102-endurance-ranks"><div>old</div></section></section>';
  LiftoffApp.prototype.renderModal = () => "";
  LiftoffApp.prototype.handleClick = async () => {};
  LiftoffApp.prototype.handleChange = async () => {};
  LiftoffApp.prototype.handleSubmit = async () => {};
  LiftoffApp.prototype.init = async () => {};
  const metrics = sport => ({ score:sport === "run" ? 225 : 0, index:sport === "run" ? 2 : 0, recent:[], current:sport === "run" ? ["🦡","Dachs"] : ["•",sport], next:["→",`${sport} next`] });
  const animals = Object.fromEntries(["swim","run","bike"].map(sport => [sport, Array.from({ length:9 }, (_, index) => ["•", `${sport}-${index}`])]));
  const context = {
    LiftoffApp,
    window:{ LiftoffApp, RANKFORGE_I18N:{ language:"de" }, RANKFORGE970:{ sportMetrics:(sport) => metrics(sport), animals }, scrollTo(){} },
    escapeHtml:value => String(value), escapeAttr:value => String(value), icon:() => "", rankTitle:rank => rank.title || "Wood III", rankMark:() => '<span class="rank-mark"></span>',
    Object, Array, Set, Map, Math, Number, String, RegExp, console
  };
  vm.runInNewContext(source, context);
  return { LiftoffApp, api:context.window.RANKFORGE103 };
}

function appFrom(LiftoffApp) {
  const app = new LiftoffApp();
  app.state = { schemaVersion:31, triathlon:{ activities:[] }, trainingPlanV10:{ activeSports:["strength","swim","run","bike"], primarySport:"run" } };
  app.ui = { view:"home", rankTab:"rank", modal:null };
  app.metrics = { rank:{ title:"Wood III", lp:0, score:0 } };
  app.modalHeader = (a,b) => `<header>${a}${b}</header>`;
  app.openModal = type => { app.ui.modal = { type }; };
  app.render = () => {};
  app.scheduleSave = () => {};
  app.showToast = value => { app.toast=value; };
  return app;
}

test("uses the selected onboarding focus as the first of up to four ranks", async () => {
  const { LiftoffApp, api } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"));
  const app = appFrom(LiftoffApp);
  assert.deepEqual(Array.from(api.ensure(app).order), ["run","strength","swim","bike"]);
  assert.equal(app.state.schemaVersion, 32);
  assert.equal(app.state.appVersion, "10.3");
});

test("renders one, two, three and four rank layouts without changing the bodygraph", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"));
  const app = appFrom(LiftoffApp);
  for (const order of [["strength"],["strength","run"],["run","swim","bike"],["strength","swim","run","bike"]]) {
    app.state.homeRanksV103 = { order, selected:order };
    const html = app.renderHome();
    assert.match(html, new RegExp(`rf103-home-ranks count-${order.length}`));
    assert.equal((html.match(/rf103-rank-card rf103-rank-card--/g) || []).length, order.length);
    assert.match(html, /home-bodygraph-section/);
  }
});

test("shows the selected sport ranks under the bottom Ranks destination", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"));
  const app = appFrom(LiftoffApp);
  app.state.homeRanksV103 = { order:["run","swim","bike"], selected:["run","swim","bike"] };
  let html = app.renderRanks();
  assert.match(html, /rf103-rank-switcher count-3/);
  assert.match(html, /rf103-sport-rank-view/);
  assert.match(html, /Dachs/);
  assert.doesNotMatch(html, /rank-tabs/);
  app.state.homeRanksV103 = { order:["strength","run"], selected:["strength","run"] };
  app.ui.rf103RankSport = "strength";
  html = app.renderRanks();
  assert.match(html, /rf103-rank-switcher count-2/);
  assert.match(html, /rank-tabs/);
  assert.doesNotMatch(html, /rf102-endurance-ranks/);
});

test("supports free ordering and synchronizes rank focus with the training plan", async () => {
  const { LiftoffApp } = runtime(await read("assets/rank-dashboard-v10.3-r1.js"));
  const app = appFrom(LiftoffApp);
  app.state.homeRanksV103 = { order:["strength","run","swim"], selected:["strength","run","swim"] };
  app.ui.rf103RankDraft = { order:["strength","run","swim"] };
  await app.handleClick({ preventDefault(){}, target:{ closest(){ return { dataset:{ action:"rf103-move-rank", sport:"swim", direction:"-1" } }; } } });
  assert.deepEqual(Array.from(app.ui.rf103RankDraft.order), ["strength","swim","run"]);
  await app.handleSubmit({ preventDefault(){}, target:{ closest(){ return {}; } } });
  assert.deepEqual(Array.from(app.state.homeRanksV103.order), ["strength","swim","run"]);
  assert.equal(app.state.trainingPlanV10.primarySport, "strength");
});

test("targets normal iPhone 14/15 and Pro widths with calmer card geometry", async () => {
  const [css, calendar] = await Promise.all([read("assets/rank-dashboard-v10.3-r1.css"), read("assets/calendar-plan-v10.0.js")]);
  assert.match(css, /\.count-3 \.rf103-rank-card:first-child\{grid-column:1\/-1;width:calc\(50% - 6px\);justify-self:center\}/);
  assert.match(css, /@media\(min-width:371px\) and \(max-width:405px\)/);
  assert.match(css, /min-height:124px/);
  assert.match(calendar, /name="primarySport"/);
  assert.match(calendar, /app\.state\.homeRanksV103=\{selected:\[\.\.\.rankOrder\],order:\[\.\.\.rankOrder\]\}/);
});
