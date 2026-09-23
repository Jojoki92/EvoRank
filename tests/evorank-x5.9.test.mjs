import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';

const root = new URL('../public/rankforge/', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

test('a deleted built-in workout like Push Day stays deleted after reopening', async () => {
  const {dom, w, api} = appEnv();
  let next;
  try {
    const app = new api.LiftoffApp();
    app.accountKey = 'x59-routines';
    await app.init();
    app.state.onboardingComplete = true;
    for (const id of ['rf78-push-day', 'rf78-pull-day', 'rf78-legs-day']) {
      assert.ok(app.state.routines.some(r => r.id === id), id + ' exists before');
      app.deleteRoutine(id);
    }
    await app.persist(false);
    next = appEnv();
    for (let i = 0; i < w.localStorage.length; i++) {
      const key = w.localStorage.key(i);
      next.w.localStorage.setItem(key, w.localStorage.getItem(key));
    }
    const reopened = new next.api.LiftoffApp();
    reopened.accountKey = 'x59-routines';
    await reopened.init();
    const ids = reopened.state.routines.map(r => r.id);
    for (const id of ['rf78-push-day', 'rf78-pull-day', 'rf78-legs-day']) assert.ok(!ids.includes(id), id + ' came back');
    assert.ok(ids.includes('rf78-upper-body'), 'other built-in workouts stay');
    // A fresh profile still gets the built-in workouts.
    const fresh = next.api.normalizeState({routines: []}, 'fresh');
    assert.ok(fresh.routines.some(r => r.id === 'rf78-push-day'));
  } finally {
    next?.dom.window.close();
    dom.window.close();
  }
});

test('the interface is always detailed and the minimal switch is gone', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = new api.LiftoffApp();
    app.accountKey = 'x59-design';
    await app.init();
    app.state.settings.uiStyle = 'minimal';
    app.applyDesignSettings();
    assert.equal(app.state.settings.uiStyle, 'classic');
    assert.equal(w.document.documentElement.dataset.uiStyle, 'classic');
    const html = app.renderDesignModal();
    assert.doesNotMatch(html, /rf84-interface-section|data-ui-style="minimal"|Minimal/);
    assert.match(html, /EvoRank/);
    assert.match(read('assets/bootstrap-v9.1.1.js'), /uiStyle: "classic" \}/);
  } finally {
    dom.window.close();
  }
});

test('home greets personally instead of a slogan', async () => {
  const {dom, api} = appEnv();
  try {
    const app = new api.LiftoffApp();
    app.accountKey = 'x59-home';
    await app.init();
    app.state.onboardingComplete = true;
    app.state.profile.name = 'Johannes G.';
    const html = app.renderHome();
    assert.doesNotMatch(html, /nächste Level|LET'S GO/);
    assert.match(html, /(Guten Morgen|Hallo|Guten Abend|Gute Nacht),<br><span>Johannes<\/span>/);
  } finally {
    dom.window.close();
  }
});

test('all-caps labels are written naturally', () => {
  const {dom, w} = appEnv();
  try {
    const {natural, humanize} = w.EVORANK_X59;
    assert.equal(natural('DEINE NÄCHSTE EINHEIT'), 'Deine nächste Einheit');
    assert.equal(natural('ZEIT NACH DEM SATZ'), 'Zeit nach dem Satz');
    assert.equal(natural('DATENSCHUTZ · CLOUD · HILFE'), 'Datenschutz · Cloud · Hilfe');
    assert.equal(natural('YOUR RANK'), 'Dein Rang');
    assert.equal(natural('LIVE-VORSCHAU'), 'Vorschau');
    assert.equal(natural('SATZ-TYP'), 'Satz-Typ');
    assert.equal(natural('WOCHE 3 · 12 XP'), 'Woche 3 · 12 XP');
    const app = w.document.getElementById('app');
    app.innerHTML = '<header><small>DEINE RÄNGE</small><h2>Holz III</h2></header><div class="brand"><strong>EVORANK</strong></div><span>XP</span><input value="ABC DEF">';
    w.document.documentElement.lang = 'de';
    humanize(app);
    assert.equal(app.querySelector('small').textContent, 'Deine Ränge');
    assert.ok(app.querySelector('small').classList.contains('x59-label'));
    assert.equal(app.querySelector('h2').textContent, 'Holz III');
    assert.equal(app.querySelector('.brand strong').textContent, 'EVORANK');
    assert.equal(app.querySelector('span').textContent, 'XP');
    w.document.documentElement.lang = 'en';
    app.innerHTML = '<small>YOUR RANK</small>';
    humanize(app);
    assert.equal(app.querySelector('small').textContent, 'YOUR RANK', 'other languages stay untouched');
  } finally {
    dom.window.close();
  }
});

test('X5.9 files are loaded and cached offline', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.ok(html.indexOf('interface-x5.9.js') > html.indexOf('interface-x5.5.js'));
  assert.match(sw, /interface-x5\.9\.js/);
});
