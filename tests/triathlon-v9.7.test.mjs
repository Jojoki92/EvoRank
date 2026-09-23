import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function loadRuntime(source) {
  class LiftoffApp {}
  LiftoffApp.prototype.renderHome = () => '<section class="week-section">';
  LiftoffApp.prototype.renderBottomNav = () => '<nav><button class="nav-item " data-action="navigate" data-view="ranks"></button></nav>';
  LiftoffApp.prototype.renderModal = () => "";
  LiftoffApp.prototype.handleClick = async () => {};
  LiftoffApp.prototype.handleSubmit = async () => {};
  LiftoffApp.prototype.handleChange = async () => {};
  LiftoffApp.prototype.render = () => {};
  LiftoffApp.prototype.init = async () => {};

  const context = {
    LiftoffApp,
    window: { RANKFORGE_I18N: { language: "de", t: value => value } },
    icon: () => "",
    escapeHtml: value => String(value),
    escapeAttr: value => String(value),
    Intl,
    Date,
    Map,
    Set,
    Object,
    Math,
    Number,
    String,
    Array,
    console
  };
  vm.runInNewContext(source, context);
  return context.window.RANKFORGE970;
}

test("ships three disciplines with exactly nine progressively named animal ranks", async () => {
  const runtime = loadRuntime(await read("assets/triathlon-v9.7.js"));
  assert.equal(runtime.version, "10.2");
  assert.equal(runtime.build, "1020-r1");
  assert.equal([...runtime.sports].join(","), "swim,run,bike");
  for (const sport of runtime.sports) assert.equal(runtime.animals[sport].length, 9);
  assert.equal(runtime.animals.swim.at(-1)[1], "Segelfisch");
  assert.equal(runtime.animals.run.at(-1)[1], "Gepard");
  assert.equal(runtime.animals.bike.at(-1)[1], "Wanderfalke");
});

test("returns finite profile-calibrated results for women and men in every triathlon discipline", async () => {
  const runtime = loadRuntime(await read("assets/triathlon-v9.7.js"));
  const examples = {
    swim:{ sport:"swim", distanceMeters:1500, durationSeconds:1800 },
    run:{ sport:"run", distanceMeters:5000, durationSeconds:1500 },
    bike:{ sport:"bike", distanceMeters:30000, durationSeconds:3600 }
  };
  for (const [sport, activity] of Object.entries(examples)) {
    const male = runtime.activityPerformance({ ...activity, bodyProfile:"male" });
    const female = runtime.activityPerformance({ ...activity, bodyProfile:"female" });
    assert.ok(Number.isFinite(male) && male >= 0 && male <= 800, `${sport} male result`);
    assert.ok(Number.isFinite(female) && female >= 0 && female <= 800, `${sport} female result`);
    assert.ok(female >= male, `${sport} uses the female comparison factor`);
  }
  assert.equal(runtime.profileSpeedFactors.male.run, 1);
  assert.ok(runtime.profileSpeedFactors.female.run > 1);
});

test("uses the selected profile for legacy activities and stores it on new imports", async () => {
  const runtime = loadRuntime(await read("assets/triathlon-v9.7.js"));
  const activity = { id:"legacy-run", sport:"run", date:new Date().toISOString(), distanceMeters:5000, durationSeconds:1500, source:"manual" };
  const app = { state:{ schemaVersion:29, profile:{ bodyProfile:"female" }, triathlon:{ activities:[activity] }, garmin:{ activities:[] } }, ui:{} };
  const female = runtime.sportMetrics("run", app);
  app.state.profile.bodyProfile = "male";
  const male = runtime.sportMetrics("run", app);
  assert.ok(female.score >= male.score);

  app.state.profile.bodyProfile = "female";
  runtime.storeGarminActivities(app, [{ id:"bike-import", sport:"bike", date:new Date().toISOString(), distanceMeters:20000, durationSeconds:3000, source:"garmin", bodyProfile:"unspecified" }]);
  assert.equal(app.state.triathlon.activities.find(item => item.id === "bike-import").bodyProfile, "female");
});

test("uses an isolated merge-safe state namespace and includes Garmin swim sessions", async () => {
  const runtime = loadRuntime(await read("assets/triathlon-v9.7.js"));
  const app = {
    state: {
      schemaVersion: 27,
      triathlon: { activities: [{ id: "run-1", sport: "run", date: new Date().toISOString(), distanceMeters: 5000, durationSeconds: 1500, source: "manual" }] },
      garmin: { activities: [{ id: "swim-1", date: new Date().toISOString(), distanceMeters: 1500, durationSeconds: 1800 }] }
    },
    ui: {}
  };
  runtime.ensure(app);
  assert.equal(app.state.appVersion, "10.2");
  assert.equal(app.state.schemaVersion, 29);
  assert.equal(runtime.sportMetrics("swim", app).list.length, 1);
  assert.equal(runtime.sportMetrics("run", app).list.length, 1);
});

test("imports Garmin swim, run and bike activities through one normalized contract", async () => {
  const runtime = loadRuntime(await read("assets/triathlon-v9.7.js"));
  const imported = runtime.parseGarminActivities({
    activities: [
      { activityId: 101, activityType: { typeKey: "pool_swimming" }, distance: 1500, duration: 1800, startTimeLocal: "2026-08-24T07:00:00" },
      { activityId: 102, activityType: { typeKey: "running" }, distance: 5000, duration: 1500, startTimeLocal: "2026-08-24T08:00:00" },
      { activityId: 103, activityType: { typeKey: "cycling" }, distance: 30000, duration: 3600, startTimeLocal: "2026-08-24T09:00:00" }
    ]
  });
  assert.equal(imported.length, 3);
  assert.deepEqual(Array.from(imported, item => item.sport), ["swim", "run", "bike"]);
});

test("presents muscle building, swimming, running and cycling as separate visual categories", async () => {
  const runtime = loadRuntime(await read("assets/triathlon-v9.7.js"));
  const source = await read("assets/triathlon-v9.7.js");
  const styles = await read("assets/triathlon-v9.7.css");
  assert.deepEqual(Array.from(runtime.categories), ["strength", "swim", "run", "bike"]);
  assert.match(source, /data-view="sports"/);
  for (const category of ["strength", "swim", "run", "bike"]) {
    assert.match(styles, new RegExp(`\\.rf970-category--${category}`));
  }
  assert.match(styles, /\.rf970-screen--swim/);
  assert.match(styles, /\.rf970-screen--run/);
  assert.match(styles, /\.rf970-screen--bike/);
});

test("keeps Garmin credentials server-side and exposes only safe same-origin endpoints", async () => {
  const config = await read("garmin-connect-config.js");
  assert.match(config, /connectPath:\s*"\/api\/garmin\/connect"/);
  assert.match(config, /statusPath:\s*"\/api\/garmin\/status"/);
  assert.match(config, /syncPath:\s*"\/api\/garmin\/sync"/);
  assert.doesNotMatch(config, /clientSecret\s*:/i);
  assert.doesNotMatch(config, /accessToken\s*:/i);
});

