import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';

const root = new URL('../public/rankforge/', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

async function started(w, api, onRender) {
  w.RANKFORGE_ACCOUNT = {status: () => ({configured: false, signedIn: false}), onChange() {}};
  const app = new api.LiftoffApp();
  app.accountKey = 'x62';
  if (onRender) {
    const base = api.LiftoffApp.prototype.render;
    app.render = function (...args) { onRender(this); return base.apply(this, args); };
  }
  await app.init();
  return app;
}

test('X6.2 module is loaded last and cached; the app opens from the saved copy', () => {
  const html = read('index.html');
  assert.match(html, /interface-x6\.2\.js/);
  assert.ok(html.indexOf('interface-x6.2.js') > html.indexOf('interface-x6.1.js'));
  assert.match(html, /rf83-splash__logo" src="\.\/icons\/evorank-x4-192\.png/);
  const sw = read('service-worker.js');
  assert.match(sw, /interface-x6\.2\.js/);
  assert.doesNotMatch(sw, /setTimeout\(\(\)=>resolve\(null\),1500\)/);
});

test('startup draws the app once instead of once per layer', async () => {
  const {dom, w, api} = appEnv();
  try {
    let drawn = 0;
    const html = () => w.document.getElementById('app').innerHTML.length;
    const app = await started(w, api, () => { drawn++; });
    assert.ok(drawn >= 1);
    assert.equal(app.x62Booting, false);
    assert.ok(html() > 0);
    assert.ok(app.metrics);
  } finally { dom.window.close(); }
});

test('workout: top button cancels, bottom finishes, no second cancel button', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.render = () => {};
    const routine = app.state.routines[0];
    app.state.draft = api.instantiateRoutine(app.state, routine);
    const t = w.document.createElement('template');
    t.innerHTML = app.renderWorkout();
    assert.equal(t.content.querySelector('.workout-danger'), null);
    const top = t.content.querySelector('.workout-header .x62-cancel');
    assert.equal(top.dataset.action, 'workout-cancel');
    assert.equal(top.textContent.trim(), 'Abbrechen');
    assert.ok(t.content.querySelector('.workout-bottom [data-action="workout-open-finish"]'));
  } finally { dom.window.close(); }
});

test('home layout: no arrow buttons, rows can be toggled and reordered', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    app.render = () => {};
    app.ui.modal = {type: 'x51-home'};
    const t = w.document.createElement('template');
    t.innerHTML = app.renderModal();
    assert.equal(t.content.querySelectorAll('[data-action="x51-module-up"],[data-action="x51-module-down"]').length, 0);
    assert.ok(t.content.querySelectorAll('.x54-module-row .x62-grip').length > 3);
    // X6.3: Hinweistexte entfernt.
    assert.equal(t.content.querySelector('.x54-module-options .x51-help'), null);
  } finally { dom.window.close(); }
});

test('"Daten wiederfinden" sits inside "Daten & Hilfe"', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    const t = w.document.createElement('template');
    t.innerHTML = app.renderProfile();
    const group = [...t.content.querySelectorAll('.rf880-profile-group')].find(g => g.querySelector('summary')?.textContent.includes('Daten & Hilfe'));
    assert.ok(group.querySelector('[data-action="x61-recover"]'));
    assert.equal(t.content.querySelector('.x61-recover-card'), null);
  } finally { dom.window.close(); }
});

test('friends: nobody is suggested before searching', async () => {
  const {dom, w, api} = appEnv();
  try {
    const app = await started(w, api);
    w.RANKFORGE_ACCOUNT = {status: () => ({configured: true, signedIn: true, hasProfile: true, nickname: 'anna'}), onChange() {}, getAccessToken: async () => null};
    app.ui.x60 = {query: '', results: [{id: '1', nickname: 'ben', displayName: 'Ben', relation: ''}], loading: false, message: '', busy: '', loadedFor: 'anna'};
    const html = app.renderFriends();
    assert.doesNotMatch(html, /data-nickname="ben"/);
    assert.match(html, /Freunde finden/);
  } finally { dom.window.close(); }
});
