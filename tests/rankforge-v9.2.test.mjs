import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("ships the six requested offline languages", async () => {
  const i18n = await read("assets/i18n-v9.2.0.js");
  for (const code of ["de", "en", "zh", "hi", "es", "ar"]) {
    assert.match(i18n, new RegExp(`code: ["']${code}["']`));
  }
  assert.match(i18n, /dir: ["']rtl["']/);
});

test("uses one Wood start state and progressive onboarding", async () => {
  const patch = await read("assets/rankforge-v9.2.0-patch.js");
  const styles = await read("assets/rankforge-v9.2.0-patch.css");
  assert.match(patch, /const WOOD =/);
  assert.match(patch, /const total = 9/);
  assert.match(patch, /Wie alt bist du\?/);
  assert.match(patch, /Wie viel wiegst du\?/);
  assert.doesNotMatch(patch, /\$\{step \+ 1\} \/ \$\{total\}/);
  assert.match(patch, /role="progressbar"/);
  assert.match(styles, /\.muscle-region\.is-unranked[\s\S]*#e7a05d/);
});

test("keeps the device-local profile as the offline source behind account sign-in", async () => {
  const patch = await read("assets/rankforge-v9.2.0-patch.js");
  const html = await read("index.html");
  assert.match(patch, /const PUBLIC_ACCOUNT_KEY = "rankforge-local"/);
  assert.match(patch, /config\.allowedAccounts\[PUBLIC_ACCOUNT_KEY\]/);
  assert.match(patch, /return rf75Account\(stored\) \? stored : PUBLIC_ACCOUNT_KEY/);
  assert.match(html, /account-sync-v2\.js[\s\S]*account-bridge-v1\.js[\s\S]*account-ui-v2\.js[\s\S]*rankforge-v9\.2\.0\.js/);
});

test("ships pixel-aligned male masks and one mirrored, inward-fitted female lat shape", async () => {
  const patch = await read("assets/rankforge-v9.2.0-patch.js");
  const styles = await read("assets/rankforge-v9.2.0-patch.css");
  assert.match(patch, /viewBox="160 64 680 1840"/);
  assert.match(patch, /const MALE_BUILD_TRANSFORM = "translate\(-35 0\) scale\(1\.07 1\)"/);
  assert.match(patch, /class="rf921-male-build" transform="\$\{MALE_BUILD_TRANSFORM\}"/);
  assert.match(patch, /male-front-neutral-light-v\$\{VERSION\}-groin-clean\.png/);
  assert.match(patch, /male-front-neutral-dark-v\$\{VERSION\}-groin-clean\.png/);
  assert.match(patch, /const FEMALE_LAT_LEFT = "M187 454 C174 449 162 439 153 428/);
  assert.match(patch, /const FEMALE_LAT_RIGHT_TRANSFORM = "translate\(-16 0\) translate\(512 0\) scale\(-1 1\)"/);
  assert.match(patch, /data-lat-side="right" d="\$\{FEMALE_LAT_LEFT\}" transform="\$\{FEMALE_LAT_RIGHT_TRANSFORM\}"/);
  assert.doesNotMatch(patch, /const FEMALE_LAT_RIGHT =/);
  assert.doesNotMatch(patch, /const FEMALE_LAT_HIT_RIGHT =/);
  assert.match(patch, /class="rf920-groin-cutout" x="489" y="987" width="32" height="49"/);
  assert.match(patch, /return markup\.replace\(FEMALE_GROIN_DETAIL, ""\)/);
  assert.match(styles, /drop-shadow\(0 0 1\.25px rgba\(71, 85, 105, \.26\)\)/);
  assert.match(styles, /\.rf920-male-base--light[\s\S]*contrast\(1\.1\)/);
  assert.match(styles, /\.rf893-female-art[\s\S]*contrast\(1\.1\)/);
  assert.match(styles, /\.rf920-muscle-fill \{[\s\S]*mix-blend-mode: normal/);
  assert.match(patch, /querySelector\("\.rf80-muscle-key"\)\?\.remove\(\)/);

  const required = [
    "assets/body/male-front-neutral-light-v9.2.0-groin-clean.png",
    "assets/body/male-front-neutral-dark-v9.2.0-groin-clean.png",
    "assets/body/male-back-neutral-light-v9.2.0.webp",
    "assets/body/male-back-neutral-dark-v9.2.0.webp",
    "assets/body/masks-v9.2.0/male-front-chest-v9.2.0.png",
    "assets/body/masks-v9.2.0/male-back-lats-v9.2.0.png",
  ];
  await Promise.all(required.map(path => access(new URL(path, root))));
});

test("ships clean ornate high-rank art and adaptive shell assets", async () => {
  const paths = [
    "assets/ranks/platinum-v9.2.0.png",
    "assets/ranks/diamond-v9.2.0.png",
    "assets/ranks/champion-v9.2.0.png",
    "assets/ranks/titan-v9.2.0.png",
    "icons/favicon-light-v9.2.0.svg",
    "icons/favicon-dark-v9.2.0.svg",
    "native/ios/EvoRankLiveActivityWidget.swift",
    "native/ios/EvoRankLiveActivityManager.swift",
    "native/home-screen/home-screen-assets.json",
  ];
  await Promise.all(paths.map(path => access(new URL(path, root))));

  const styles = await read("assets/rankforge-v9.2.0-patch.css");
  assert.match(styles, /:root\[data-theme="light"\] \.bottom-nav \.nav-item\.is-active/);
  assert.match(styles, /\.bottom-nav \.nav-item\.is-active[\s\S]*color: var\(--accent\) !important;[\s\S]*background: transparent !important;/);
  assert.match(styles, /\.brand__mark\.rf82-brand-mark[\s\S]*color: var\(--accent\) !important;/);
  assert.doesNotMatch(styles, /\.bottom-nav \.nav-item\.is-active[\s\S]{0,180}background: #ff3658 !important/);
});

test("forces Netlify to load one coherent 10.11 release with all feature lines", async () => {
  const html = await read("index.html");
  const headers = await read("_headers");
  const worker = await read("service-worker.js");

  assert.match(html, /rankforge-v9\.2\.0\.css\?build=1020-r1/);
  assert.match(html, /rankforge-v9\.2\.0-patch\.css\?build=1020-r1/);
  assert.match(html, /triathlon-v9\.7\.css\?build=1020-r1/);
  assert.match(html, /rankforge-v9\.2\.0\.js\?build=1020-r1/);
  assert.match(html, /rankforge-v9\.2\.0-patch\.js\?build=1020-r1/);
  assert.match(html, /rf93-unilateral-v1\.js\?build=1020-r1/);
  assert.match(html, /rf93-friends-v1\.js\?build=1020-r1/);
  assert.match(html, /triathlon-v9\.7\.js\?build=1020-r1/);
  assert.match(html, /calendar-plan-v10\.0\.js\?build=1020-r1/);
  assert.match(html, /garmin-connect-config\.js\?build=1110-r1/);
  assert.match(headers, /\/assets\/\*[\s\S]*max-age=0, must-revalidate/);
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.match(worker, /garmin-connect-config\.js\?build=1110-r1/);
  assert.match(worker, /account-sync-v2\.js\?build=1110-r1/);
  assert.match(worker, /account-bridge-v1\.js\?build=1110-r1/);
  assert.match(worker, /account-ui-v2\.js\?build=1110-r1/);
  assert.match(worker, /rankforge-v9\.2\.0-patch\.js\?build=1020-r1/);
  assert.match(worker, /rf93-unilateral-v1\.js\?build=1020-r1/);
  assert.match(worker, /rf93-friends-v1\.js\?build=1020-r1/);
  assert.match(worker, /triathlon-v9\.7\.js\?build=1020-r1/);
  assert.match(worker, /calendar-plan-v10\.0\.js\?build=1020-r1/);
});

test("opens the iPhone layout without changing the desktop composition", async () => {
  const styles = await read("assets/rankforge-v9.2.0-patch.css");
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*\.screen \{[\s\S]*padding: 18px 8px/);
  assert.match(styles, /\.bodygraph-card--home \.body-figure--male-v920 svg \{[\s\S]*width: min\(59vw, 210px\)/);
  assert.match(styles, /\.bodygraph-card--home \.body-figure--female-893 svg,[\s\S]*width: min\(57vw, 202px\)/);
  assert.match(styles, /\.bottom-nav,[\s\S]*grid-template-columns: 1fr 1fr 68px 1fr 1fr/);
});

test("starts a filled flame after one workout and keeps a rolling seven-day streak", async () => {
  const patch = await read("assets/rankforge-v9.2.0-patch.js");
  const styles = await read("assets/rankforge-v9.2.0-patch.css");
  const start = patch.indexOf("const STREAK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;");
  const end = patch.indexOf("// Version 9.2 is public", start);
  assert.ok(start >= 0 && end > start);

  const helpers = `
    function workoutDate(workout) { return new Date(workout.endedAt); }
  `;
  const context = {};
  vm.runInNewContext(`${helpers}\n${patch.slice(start, end)}\nglobalThis.calculate = rollingStreakStatus;`, context);

  const workout = endedAt => ({ endedAt });
  const now = new Date("2026-08-25T12:00:00");
  const firstWorkout = context.calculate([workout("2026-08-25T10:00:00")], now);
  assert.equal(firstWorkout.count, 1);
  assert.equal(firstWorkout.active, true);
  assert.equal(firstWorkout.daysRemaining, 7);

  const acrossCalendarBoundary = context.calculate([
    workout("2026-08-23T20:00:00"),
    workout("2026-08-25T10:00:00")
  ], now);
  assert.equal(acrossCalendarBoundary.count, 2);
  assert.equal(acrossCalendarBoundary.active, true);

  const restartedAfterMiss = context.calculate([
    workout("2026-08-10T10:00:00"),
    workout("2026-08-25T10:00:00")
  ], now);
  assert.equal(restartedAfterMiss.count, 1);

  const expired = context.calculate([workout("2026-08-17T10:00:00")], now);
  assert.equal(expired.count, 0);
  assert.equal(expired.active, false);

  assert.match(styles, /\.is-streak-active \.rf920-flame-shell \{[\s\S]*fill: currentColor/);
  assert.match(styles, /\.is-streak-active \.rf920-flame-core \{[\s\S]*fill: #ff9aa6/);
});

test("offers a per-workout timer off switch and keeps disabled workouts timer-free", async () => {
  const patch = await read("assets/rankforge-v9.2.0-patch.js");
  const styles = await read("assets/rankforge-v9.2.0-patch.css");
  const i18n = await read("assets/i18n-v9.2.0.js");

  assert.match(patch, /name="timerEnabled" type="checkbox"/);
  assert.match(patch, /Workout ohne Timer starten/);
  assert.match(patch, /draft\.restTimerEnabled = active/);
  assert.match(patch, /settings\.autoStartRest = active/);
  assert.match(patch, /if \(this\.state\?\.draft && !workoutTimerEnabled\(this\)\) return;/);
  assert.match(patch, /rf960-exercise-timer-off/);
  assert.match(styles, /\.rf960-no-timer-note/);
  assert.match(styles, /\.rf960-timer-off-strip/);
  for (const language of ["Rest timer", "休息计时器", "रेस्ट टाइमर", "Temporizador de descanso", "مؤقت الراحة"]) {
    assert.ok(i18n.includes(language));
  }
});

test("does not double unilateral loads and protects estimated ranks from Olympian jumps", async () => {
  const core = await read("assets/rankforge-v9.2.0.js");
  const patch = await read("assets/rankforge-v9.2.0-patch.js");

  const factorStart = core.indexOf("function rf82ExecutionFactor");
  const factorEnd = core.indexOf("scoreLift = function", factorStart);
  assert.ok(factorStart >= 0 && factorEnd > factorStart);
  const factorSource = core.slice(factorStart, factorEnd);
  assert.match(factorSource, /return 1;/);
  assert.doesNotMatch(factorSource, /1\.9/);

  assert.match(patch, /const PROVISIONAL_RANK_CAP = 699/);
  assert.match(patch, /mode === "unilateral"[\s\S]*executionMode: "bilateral"/);
  assert.match(patch, /Math\.min\(PROVISIONAL_RANK_CAP, score\)/);
  assert.match(patch, /name="executionMode" value="unilateral"/);
  assert.match(patch, /referenceManual = manualReference/);
  assert.match(patch, /rankCalibration = manualReference \? "calibrated" : "estimated"/);
});

test("audits every shipped exercise library for unilateral rank coverage", async () => {
  const core = await read("assets/rankforge-v9.2.0.js");
  const declarations = [...core.matchAll(/const\s+([A-Z0-9_]*EXERCISES)\s*=\s*\[/g)];
  const libraries = [];

  for (const declaration of declarations) {
    const start = declaration.index + declaration[0].lastIndexOf("[");
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let index = start; index < core.length; index += 1) {
      const character = core[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === "[") depth += 1;
      else if (character === "]" && --depth === 0) { end = index + 1; break; }
    }
    if (end > start) libraries.push(JSON.parse(core.slice(start, end)));
  }

  const exercises = libraries.flat();
  const explicitUnilateral = exercises.filter(exercise => /(einarm|einbein|einseit|unilateral|single[ -]?(arm|leg)|b-stance|bulgar)/i.test(exercise.name || ""));
  const rankableWithoutReference = explicitUnilateral.filter(exercise => exercise.rankable !== false && !(Number(exercise.reference1RMKg) > 0));

  assert.equal(exercises.length, 1000);
  assert.ok(explicitUnilateral.length >= 100);
  assert.equal(rankableWithoutReference.length, 0);
  assert.match(core, /EXERCISES\.forEach\(rf82CalibrateExercise\)/);
});
