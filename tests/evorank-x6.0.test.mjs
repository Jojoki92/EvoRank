import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';

test('friends tab has no link-based invitations and guides to sign in', async () => {
  const {dom, w, api} = appEnv();
  try {
    w.RANKFORGE_ACCOUNT = {status: () => ({configured: true, signedIn: false}), onChange() {}};
    const app = new api.LiftoffApp();
    app.accountKey = 'x60';
    await app.init();
    let html = app.renderFriends();
    assert.match(html, /x60-friends/);
    assert.match(html, /data-action="x60-account"/);
    assert.doesNotMatch(html, /Profil-Link|Live-Suche einrichten|Einladung/);
    w.RANKFORGE_ACCOUNT = {status: () => ({configured: true, signedIn: true, hasProfile: true, nickname: 'anna'}), onChange() {}, getAccessToken: async () => null};
    app.ui.x60 = {query: '', results: [{id: '1', nickname: 'ben', displayName: 'Ben', relation: ''}, {id: '2', nickname: 'cara', displayName: 'Cara', relation: 'incoming', requestId: 'r2'}], loading: false, message: '', busy: '', loadedFor: 'anna'};
    html = app.renderFriends();
    assert.match(html, /data-action="x60-request" data-nickname="ben"/);
    assert.match(html, /data-action="x60-accept" data-request-id="r2"/);
    assert.match(html, /Name oder @spitzname/);
  } finally {
    dom.window.close();
  }
});

test('friends module is loaded and cached offline', () => {
  const root = new URL('../public/rankforge/', import.meta.url);
  const html = readFileSync(new URL('index.html', root), 'utf8');
  assert.match(html, /friends-x6\.0\.js/);
  assert.match(readFileSync(new URL('service-worker.js', root), 'utf8'), /friends-x6\.0\.js/);
});
