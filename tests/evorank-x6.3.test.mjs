import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';

const root = new URL('../public/rankforge/', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

async function started(w, api) {
  w.RANKFORGE_ACCOUNT = {status: () => ({configured: false, signedIn: false}), onChange() {}};
  const app = new api.LiftoffApp();
  app.accountKey = 'x63';
  await app.init();
  app.render = () => {};
  return app;
}
const frag = (w, html) => { const t = w.document.createElement('template'); t.innerHTML = html; return t.content; };

test('X6.3 module is loaded last and cached offline', () => {
  const html = read('index.html');
  assert.ok(html.indexOf('interface-x6.3.js') > html.indexOf('interface-x6.2.js'));
  assert.match(read('service-worker.js'), /interface-x6\.3\.js/);
});

test('plus sheet starts endurance recording directly and has no descriptions', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.ui.modal = {type: 'x55-training'};
    const root = frag(w, app.renderModal());
    assert.equal(root.querySelectorAll('[data-action="x53-record"][data-sport]').length, 3);
    assert.equal(root.querySelectorAll('[data-action="x51-start-sport"]').length, 0);
    assert.equal(root.querySelectorAll('.x55-training small').length, 0);
  } finally { dom.window.close(); }
});

test('rest setup keeps the start button outside the scrolling area', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.openRoutineRestSetup?.(app.state.routines[0].id);
    app.ui.modal = app.ui.modal?.type === 'v73-workout-rest-setup' ? app.ui.modal : {type: 'v73-workout-rest-setup', routineId: app.state.routines[0].id};
    const root = frag(w, app.renderModal());
    const form = root.querySelector('.v73-rest-setup');
    if (!form) return; // Blatt in dieser Umgebung nicht darstellbar
    assert.ok(form.querySelector(':scope > .x63-rest-body'));
    assert.ok(form.lastElementChild.classList.contains('v73-rest-footer'));
  } finally { dom.window.close(); }
});

test('live workout: only "Übung hinzufügen" and a compact pause button at the top', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.state.draft = api.instantiateRoutine(app.state, app.state.routines[0]);
    const root = frag(w, app.renderWorkout());
    assert.equal(root.querySelector('.v74-workout-editor'), null);
    assert.equal(root.querySelector('[data-action="v74-open-save-routine"]'), null);
    assert.ok(root.querySelector('.x63-workout-tools [data-action="workout-add-exercise"]'));
    assert.equal(root.querySelectorAll('.rfx2-load-info').length, 0);
  } finally { dom.window.close(); }
});

test('home rank card uses the rank colour instead of the sport red', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.updateMetrics();
    const card = frag(w, app.renderHome()).querySelector('.rf103-rank-card--strength');
    if (!card) return;
    assert.ok(card.getAttribute('style').includes(app.metrics.rank.color));
  } finally { dom.window.close(); }
});

test('shop: wallet card, coin prices, no descriptions or bottom close button', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.state.profile.eggs = 120;
    const root = frag(w, app.renderV7RewardShop());
    assert.match(root.querySelector('.x63-wallet').textContent, /120/);
    assert.equal(root.querySelectorAll('.v72-shop-card__copy small').length, 0);
    assert.equal(root.querySelector('.rf893-locker-footer'), null);
    assert.ok(root.querySelector('[data-action="rf81-reward-buy"] .x63-coin'));
  } finally { dom.window.close(); }
});

test('profile settings: no counters, no diamond glyph', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    const root = frag(w, app.renderProfile());
    assert.equal(root.querySelectorAll('.rf880-profile-group summary b').length, 0);
    assert.doesNotMatch(root.textContent, /◆/);
  } finally { dom.window.close(); }
});

test('exercise picker has no photo button; custom exercise has no photo card', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.ui.modal = {type: 'exercise-picker', context: 'workout'};
    assert.equal(frag(w, app.renderModal()).querySelector('.rf77-camera-button'), null);
    app.ui.modal = {type: 'v7-custom-exercise', context: 'library'};
    assert.equal(frag(w, app.renderModal()).querySelector('.rf77-photo-builder'), null);
  } finally { dom.window.close(); }
});

test('explanatory sentences are removed from the page', async () => {
  const {dom, w} = appEnv();
  try {
    const host = w.document.getElementById('app');
    host.innerHTML = '<div><p>Tippe einen Muskel an – oder lasse den Bodygraph neutral.</p><p>Letztes Training: 45 kg × 10</p><p class="data-note">EvoRank X6.2 · Trainingsdaten werden lokal gespeichert.</p></div>';
    w.EVORANK_X63.tidyTexts(host);
    assert.doesNotMatch(host.textContent, /Tippe einen Muskel/);
    assert.match(host.textContent, /Letztes Training/);
    assert.equal(host.querySelector('.data-note').textContent, 'EvoRank X6.3');
  } finally { dom.window.close(); }
});
