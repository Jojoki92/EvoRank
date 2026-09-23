import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function runtime109(source) {
  class LiftoffApp {}
  for (const method of ["renderRanks", "renderModal", "renderExercisePickerModal", "handleClick", "scheduleSave", "init"]) {
    LiftoffApp.prototype[method] = method.startsWith("render") ? () => "<section></section>" : async () => {};
  }
  const exercises = [];
  const exerciseIndex = new Map();
  const window = {
    LiftoffApp,
    setTimeout:() => 1,
    clearTimeout:() => {},
    RANKFORGE_ACCOUNT:{ status:() => ({ signedIn:false, hasProfile:false }) },
  };
  const context = {
    LiftoffApp,
    EXERCISES:exercises,
    exerciseIndex,
    EXERCISE_PICKER_PAGE_SIZE:60,
    window,
    navigator:{ onLine:true },
    fetch:async () => ({ ok:true, json:async () => [] }),
    escapeHtml:value => String(value),
    escapeAttr:value => String(value),
    Object, Array, Set, Map, Math, Number, String, RegExp, Date, Boolean, JSON, console,
  };
  vm.runInNewContext(source, context);
  return { api:window.EVORANK109, exercises, exerciseIndex };
}

test("keeps EVORANK 10.9 intact before the public 10.11 layer", async () => {
  const [html, worker, manifest, version, layout] = await Promise.all([
    read("index.html"),
    read("service-worker.js"),
    read("manifest.webmanifest"),
    read("version.txt"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(version.trim(), "10.11");
  assert.match(html, /evorank-v10\.8-r1\.js\?build=1080-r1[\s\S]*evorank-v10\.9-r1\.js\?build=1090-r3[\s\S]*evorank-v10\.10-r1\.js\?build=1100-r1/);
  assert.match(html, /evorank-v10\.9-r1\.css\?build=1090-r3[\s\S]*evorank-v10\.10-r1\.css\?build=1100-r1/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /evorank-v10\.9-r1\.js\?build=1090-r3/);
  assert.match(manifest, /EvoRank 10\.11/);
  assert.match(layout, /EvoRank 10\.11/);
});

test("adds exactly 500 unique stretching and mobility exercises", async () => {
  const { api, exercises, exerciseIndex } = runtime109(await read("assets/evorank-v10.9-r1.js"));
  assert.equal(api.version, "10.9");
  assert.equal(api.build, "1090-r3");
  assert.equal(api.stretchCount, 500);
  assert.equal(exercises.length, 500);
  assert.equal(exerciseIndex.size, 500);
  assert.equal(new Set(exercises.map(item => item.id)).size, 500);
  assert.equal(new Set(exercises.map(item => item.name)).size, 500);
  assert.ok(exercises.every(item => item.rankable === false));
  assert.ok(exercises.every(item => item.tracking === "time"));
  assert.ok(exercises.every(item => item.mobility === true));
  assert.ok(exercises.every(item => item.defaultSets[0].durationSeconds >= 20));
});

test("provides four separate top-10 lists and category-only profile copy", async () => {
  const [source, css] = await Promise.all([
    read("assets/evorank-v10.9-r1.js"),
    read("assets/evorank-v10.9-r1.css"),
  ]);
  for (const sport of ["strength", "swim", "run", "bike"]) assert.match(source, new RegExp(`"${sport}"`));
  assert.match(source, /p_limit:10/);
  assert.match(source, /slice\(0, 10\)/);
  assert.match(source, /sportbezogenes öffentliches Profil|ÖFFENTLICHES PROFIL/);
  assert.match(source, /keine E-Mail/i);
  assert.match(source, /keine privaten Trainingsdetails/i);
  assert.match(css, /rf109-leaderboard/);
  assert.match(css, /rf109-profile-stats/);
});

test("keeps the separated rank settings Save button visible while the lists scroll", async () => {
  const css = await read("assets/evorank-v10.9-r1.css");
  assert.match(css, /\.rf108-rank-modal\{[^}]*display:flex[^}]*flex-direction:column/);
  assert.match(css, /\.rf108-rank-form\{[^}]*display:flex[^}]*flex-direction:column[^}]*min-height:0[^}]*overflow:hidden/);
  assert.match(css, /\.rf108-rank-form>\.rf108-rank-scroll\{[^}]*flex:1 1 auto[^}]*min-height:0[^}]*max-height:none[^}]*overflow-y:auto/);
  assert.match(css, /\.rf108-rank-form>\.modal-footer\{[^}]*flex:0 0 auto/);
});

test("locks leaderboard tables behind authenticated RPCs and never selects email", async () => {
  const sql = await readFile(new URL("../db/SUPABASE-LEADERBOARDS-10.9.sql", import.meta.url), "utf8");
  assert.match(sql, /alter table public\.evorank_leaderboard_entries enable row level security/i);
  assert.match(sql, /revoke all on public\.evorank_leaderboard_entries from public, anon, authenticated/i);
  assert.match(sql, /if auth\.uid\(\) is null then raise exception 'not_authenticated'/i);
  assert.match(sql, /limit greatest\(1, least\(coalesce\(p_limit, 10\), 10\)\)/i);
  assert.match(sql, /grant execute on function public\.evorank_leaderboard_top\(text, integer\) to authenticated/i);
  const returnedObject = sql.match(/select jsonb_build_object\([\s\S]*?from public\.evorank_leaderboard_entries/i)?.[0] || "";
  assert.doesNotMatch(returnedObject, /email/i);
});

test("keeps Garmin, Apple Widget and Dynamic Island sources in the 10.9 tree", async () => {
  const [garmin, widget, activity, manager] = await Promise.all([
    read("assets/evorank-v10.8-r1.js"),
    read("native/ios/EvoRankWidgetBundle.swift"),
    read("native/ios/EvoRankLiveActivityWidget.swift"),
    read("native/ios/EvoRankLiveActivityManager.swift"),
  ]);
  assert.match(garmin, /startGarminAutoSync/);
  assert.match(widget, /WidgetBundle/);
  assert.match(activity, /DynamicIsland/);
  assert.match(manager, /Activity<.*EvoRankActivityAttributes|Activity\.request/s);
});
