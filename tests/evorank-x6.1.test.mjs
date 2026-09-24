import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {appEnv} from './helpers/x2-app-env.mjs';

const root = new URL('../public/rankforge/', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

async function started(w, api) {
  w.RANKFORGE_ACCOUNT = {status: () => ({configured: false, signedIn: false}), onChange() {}};
  const app = new api.LiftoffApp();
  app.accountKey = 'x61';
  await app.init();
  app.render = () => {};
  return app;
}

test('X6.1 module is loaded last and cached offline, small logo is used', () => {
  const html = read('index.html');
  assert.match(html, /interface-x6\.1\.js\?build=x6\.2-r1/);
  assert.ok(html.indexOf('interface-x6.1.js') > html.indexOf('friends-x6.0.js'));
  const sw = read('service-worker.js');
  assert.match(sw, /interface-x6\.1\.js/);
  assert.match(sw, /evorank-er-flat-256\.png/);
  assert.match(read('assets/evorank-x2-ui.js'), /evorank-er-flat-256\.png/);
});

test('legacy account hashes use the same SHA-256 as the account screen', () => {
  const {dom, w} = appEnv();
  try {
    const source = read('assets/account-local-v10.7-r2.js');
    new dom.window.Function(source).call(w);
    const {sha256Hex} = w.EVORANK_LOCAL_ACCOUNTS;
    for (const text of ['', 'abc', 'someone@example.at', 'ä'.repeat(70)]) {
      assert.equal(sha256Hex(text), createHash('sha256').update(text).digest('hex'));
    }
    const ui = read('assets/account-ui-v2.js');
    for (const hash of source.match(/[0-9a-f]{64}/g)) assert.ok(ui.includes(hash));
  } finally { dom.window.close(); }
});

test('profile saves name without a body weight and puts name fields first', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.state.profile.bodyweightKg = null;
    const t = w.document.createElement('template');
    t.innerHTML = app.renderProfileEditModal();
    const form = t.content.querySelector('form');
    w.document.body.append(form);
    assert.ok(form.firstElementChild.classList.contains('x61-name-fields'));
    assert.ok(form.querySelector('.x61-name-fields [name="handle"]'));
    form.elements.name.value = 'Kevin';
    form.elements.x51Weight.value = '';
    await app.handleSubmit({target: form, preventDefault() {}});
    assert.equal(app.state.profile.name, 'Kevin');
  } finally { dom.window.close(); }
});

test('untrained muscles are drawn in wood colour', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    const wood = api.rankFromScore(0).color;
    const svg = api.bodyFigure('front', api.getMuscleStatuses([]), null, {bodyProfile: 'female'});
    assert.ok(svg.includes(wood));
    assert.ok(app);
  } finally { dom.window.close(); }
});

test('rank metrics are cached until workouts change', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    const first = api.getMetrics(app.state);
    assert.equal(api.getMetrics(app.state), first);
    app.state.workouts.push({id: 'w1', endedAt: '2026-09-20T10:00:00Z', xp: 40, exercises: []});
    const second = api.getMetrics(app.state);
    assert.notEqual(second, first);
    assert.equal(second.totalXp, first.totalXp + 40);
  } finally { dom.window.close(); }
});

test('exercise sets can be collapsed per exercise', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    w.RANKFORGE_APP = app;
    const host = w.document.getElementById('app');
    host.innerHTML = '<article class="rfx41-workout-exercise" data-exercise-instance="e1"><header>Bankdrücken</header><div class="v72-set-stack"><section class="v72-set-card is-done"></section><section class="v72-set-card"></section></div></article>';
    w.EVORANK_X61.decorate(host);
    const button = host.querySelector('[data-action="x61-collapse"]');
    // X6.2: der Knopf sitzt in der Kopfzeile und zeigt erledigt/gesamt.
    assert.ok(host.querySelector('header .x61-collapse'));
    assert.match(button.textContent, /1\/2/);
    app.handleClick({target: button, preventDefault() {}});
    assert.ok(host.querySelector('.rfx41-workout-exercise').classList.contains('x61-collapsed'));
    app.handleClick({target: host.querySelector('[data-action="x61-collapse"]'), preventDefault() {}});
    assert.ok(!host.querySelector('.rfx41-workout-exercise').classList.contains('x61-collapsed'));
  } finally { dom.window.close(); }
});

test('tapping a friend card opens the friend detail', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.state.friendProfiles = [{athleteId: 'f1', name: 'Ben'}];
    let opened = null;
    app.openModal = (type, data) => { opened = [type, data]; };
    const card = w.document.createElement('article');
    card.dataset.action = 'x61-friend';
    card.dataset.friendId = 'f1';
    await app.handleClick({target: card, preventDefault() {}});
    assert.equal(opened?.[0], 'rf87-friend');
    assert.equal(opened?.[1]?.athleteId, 'f1');
  } finally { dom.window.close(); }
});
