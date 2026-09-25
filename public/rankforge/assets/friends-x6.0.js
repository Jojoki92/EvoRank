/* X6.0: Freunde ohne Links. Suchen (Name oder @spitzname, Vorschläge ohne Tippen),
   anfragen, annehmen und den Stand der Freunde sehen – alles direkt im Freunde-Tab.
   Daten kommen aus dem bestehenden Konto-Modul (RANKFORGE_ACCOUNT) und dem
   Freunde-Abgleich (RANKFORGE93_FRIENDS, alle 30 Sekunden). Bestenliste: Mitmachen
   mit einem Tipp und ausdrücklicher Bestätigung. */
(() => {
  'use strict';
  if (typeof LiftoffApp !== 'function') return;
  const proto = LiftoffApp.prototype;
  const old = {renderFriends: proto.renderFriends, renderRanks: proto.renderRanks, handleClick: proto.handleClick, handleSubmit: proto.handleSubmit};

  const account = () => window.RANKFORGE_ACCOUNT;
  const friendsApi = () => window.RANKFORGE93_FRIENDS;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const ico = (name, size = 18) => typeof icon === 'function' ? icon(name, size) : '';

  function status() {
    const s = account()?.status?.() || {};
    return {configured: Boolean(s.configured), signedIn: Boolean(s.configured && s.signedIn), hasProfile: Boolean(s.hasProfile), nickname: s.nickname || ''};
  }

  function ui(app) {
    app.ui ||= {};
    app.ui.x60 ||= {query: '', results: null, loading: false, message: '', busy: '', loadedFor: ''};
    return app.ui.x60;
  }

  function data() {
    try { return friendsApi()?.data?.() || {friends: [], incoming: [], outgoing: []}; }
    catch { return {friends: [], incoming: [], outgoing: []}; }
  }

  function avatar(person) {
    const name = String(person.displayName || person.nickname || '?').trim();
    return `<span class="x60-avatar" aria-hidden="true">${esc(name.charAt(0).toLocaleUpperCase('de-DE') || '?')}</span>`;
  }

  function personRow(person, action) {
    const name = person.displayName || person.nickname || 'Athlet';
    return `<article class="x60-person">${avatar(person)}<div><strong>${esc(name)}</strong><small>@${esc(person.nickname || '')}${person.rank ? ' · ' + esc(person.rank) : ''}</small></div>${action}</article>`;
  }

  function actionFor(person, state) {
    const busy = state.busy === person.nickname || state.busy === person.requestId ? 'disabled' : '';
    if (person.relation === 'friend') return `<span class="x60-tag">Befreundet</span>`;
    if (person.relation === 'outgoing') return `<span class="x60-tag">Angefragt</span>`;
    if (person.relation === 'incoming') return `<button class="button button--primary x60-small" data-action="x60-accept" data-request-id="${esc(person.requestId)}" ${busy}>Annehmen</button>`;
    return `<button class="button button--primary x60-small" data-action="x60-request" data-nickname="${esc(person.nickname)}" ${busy}>Anfragen</button>`;
  }

  function miniBody(snap) {
    if (typeof bodyFigure !== 'function' || !snap?.muscles || typeof snap.muscles !== 'object') return avatar({displayName: snap?.name || '?'});
    try {
      const statuses = Object.fromEntries(Object.entries(snap.muscles).map(([key, value]) => [key, {score: Number(value?.score || 0), rank: {color: value?.rank?.color || '#B9824E', name: value?.rank?.name || ''}, group: {name: key}}]));
      return bodyFigure('front', statuses, null, {hideLabel: true, interactive: false, className: 'x61-mini-figure', bodyProfile: snap.bodyProfile});
    } catch { return avatar({displayName: snap?.name || '?'}); }
  }

  function friendCard(friend) {
    const snap = friend.snapshot && typeof friend.snapshot === 'object' ? friend.snapshot : {};
    const name = friend.displayName || friend.nickname || 'Freund';
    // X6.3: nur Körper und Name – Details beim Antippen.
    return `<article class="x60-friend" data-action="x61-friend" data-friend-id="${esc(friend.id)}" role="button" tabindex="0" aria-label="${esc(name)} ansehen">
      <div class="x61-friend-body">${miniBody(snap)}</div>
      <div class="x61-friend-info"><header><div><strong>${esc(name)}</strong></div></header></div>
    </article>`;
  }

  function render(app) {
    const s = status();
    const state = ui(app);
    const title = `<div class="screen-title"><div><p>Trainingspartner</p><h1>Freunde</h1></div>${s.signedIn && s.hasProfile ? `<button class="circle-button" data-action="x60-refresh" aria-label="Aktualisieren">${ico('refresh', 20) || '↻'}</button>` : ''}</div>`;
    if (!s.configured) return `<section class="screen friends-screen x60-friends">${title}<article class="x60-card"><strong>Freunde sind gerade nicht verfügbar</strong><p class="x60-muted">Diese Version ist ohne Cloud-Verbindung gestartet.</p></article></section>`;
    if (!s.signedIn) return `<section class="screen friends-screen x60-friends">${title}<article class="x60-card"><strong>Mit Freunden trainieren</strong><p class="x60-muted">Melde dich an. Dann findest du deine Freunde direkt in der App und siehst ihren Stand.</p><button class="button button--primary button--wide" data-action="x60-account">Anmelden</button></article></section>`;
    if (!s.hasProfile) return `<section class="screen friends-screen x60-friends">${title}<article class="x60-card"><strong>Wähle einen Spitznamen</strong><p class="x60-muted">Über ihn finden dich andere. Deine E-Mail sieht niemand.</p><button class="button button--primary button--wide" data-action="x60-account">Spitznamen festlegen</button></article></section>`;

    // X6.2: keine Vorschläge mehr – Freunde werden gezielt gesucht.
    if (state.query && state.loadedFor !== s.nickname && !state.loading) queueMicrotask(() => search(app, state.query));
    const d = data();
    const results = Array.isArray(state.results) ? state.results : [];
    const incoming = d.incoming.length ? `<section class="x60-section"><h2>Anfragen an dich</h2>${d.incoming.map(r => personRow(r, `<div class="x60-actions"><button class="button button--primary x60-small" data-action="x60-accept" data-request-id="${esc(r.requestId)}">Annehmen</button><button class="button button--secondary x60-small" data-action="x60-decline" data-request-id="${esc(r.requestId)}">Ablehnen</button></div>`)).join('')}</section>` : '';
    const friends = `<section class="x60-section"><h2>Deine Freunde${d.friends.length ? ` (${d.friends.length})` : ''}</h2>${d.friends.length ? d.friends.map(friendCard).join('') : `<p class="x60-muted">Noch keine Freunde.</p>`}</section>`;
    const outgoing = d.outgoing.length ? `<section class="x60-section"><h2>Gesendete Anfragen</h2>${d.outgoing.map(r => personRow(r, `<button class="button button--secondary x60-small" data-action="x60-decline" data-request-id="${esc(r.requestId)}">Zurücknehmen</button>`)).join('')}</section>` : '';
    const list = !state.query ? ''
      : state.loading ? `<p class="x60-muted">Suche läuft …</p>`
      : results.length ? results.map(p => personRow(p, actionFor(p, state))).join('')
      : `<p class="x60-muted">Niemand gefunden.</p>`;
    const find = `<section class="x60-section x61-find"><h2>Freunde finden</h2>
      <form class="x60-search" data-form="x60-search"><input name="x60q" type="search" value="${esc(state.query)}" placeholder="Name oder @spitzname" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" maxlength="30"></form>
      ${list}</section>`;
    const msg = state.message ? `<p class="x60-note" role="status">${esc(state.message)}</p>` : '';
    // X6.3: Bestenliste hat hier ihren festen Platz (umschaltbar).
    const tab = state.tab === 'board' ? 'board' : 'friends';
    const tabs = `<div class="x63-social-tabs" role="tablist"><button role="tab" data-action="x63-social" data-tab="friends" class="${tab === 'friends' ? 'is-active' : ''}" aria-selected="${tab === 'friends'}">Freunde</button><button role="tab" data-action="x63-social" data-tab="board" class="${tab === 'board' ? 'is-active' : ''}" aria-selected="${tab === 'board'}">Bestenliste</button></div>`;
    if (tab === 'board') return `<section class="screen friends-screen x60-friends">${title}${tabs}${msg}${board(app)}</section>`;
    return `<section class="screen friends-screen x60-friends">${title}${tabs}${msg}${incoming}${friends}${find}${outgoing}</section>`;
  }

  async function search(app, query) {
    const state = ui(app);
    state.query = String(query || '').trim().replace(/^@+/, '').slice(0, 30);
    state.loadedFor = status().nickname;
    if (!state.query) { state.results = []; state.message = ''; if (app.ui?.view === 'friends') app.render?.(); return; }
    if (state.query.length === 1) { state.message = 'Bitte mindestens zwei Zeichen eingeben.'; app.render?.(); return; }
    state.loading = true;
    state.message = '';
    try {
      const rows = await rpc('rf_profile_search', {p_query: state.query.toLowerCase(), p_limit: 25});
      state.results = Array.isArray(rows) ? rows : [];
    } catch (error) {
      state.results = [];
      state.message = error?.message || 'Suche gerade nicht möglich.';
    } finally {
      state.loading = false;
      const focused = document.activeElement?.name === 'x60q';
      if (app.ui?.view === 'friends') app.render?.();
      if (focused) { const input = document.querySelector('[name="x60q"]'); if (input) { input.focus(); const end = input.value.length; try { input.setSelectionRange(end, end); } catch {} } }
    }
  }

  async function rpc(name, args) {
    const cloud = window.RANKFORGE_CLOUD || {};
    const url = String(cloud.supabaseUrl || '').replace(/\/+$/, '');
    const token = await account()?.getAccessToken?.();
    if (!url || !token) throw new Error('Bitte zuerst anmelden.');
    const response = await fetch(`${url}/rest/v1/rpc/${name}`, {method: 'POST', headers: {apikey: cloud.supabasePublishableKey, authorization: `Bearer ${token}`, 'content-type': 'application/json'}, body: JSON.stringify(args || {})});
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(translate(body?.message || `Fehler ${response.status}`));
    return body;
  }

  function translate(message) {
    const m = String(message);
    if (m.includes('already_requested')) return 'Es gibt schon eine Anfrage zwischen euch.';
    if (m.includes('profile_not_found')) return 'Dieses Profil gibt es nicht mehr.';
    if (m.includes('too_many_pending')) return 'Zu viele offene Anfragen. Warte, bis einige angenommen sind.';
    if (m.includes('query_too_short')) return 'Bitte mindestens zwei Zeichen eingeben.';
    return m;
  }

  async function act(app, task, busyKey, success) {
    const state = ui(app);
    state.busy = busyKey || '';
    state.message = '';
    app.render?.();
    try {
      const result = await task();
      state.message = typeof success === 'function' ? success(result) : success || '';
      await friendsApi()?.refresh?.();
      friendsApi()?.publish?.();
      state.loadedFor = '';
    } catch (error) {
      state.message = translate(error?.message || 'Das hat nicht geklappt.');
    } finally {
      state.busy = '';
      app.render?.();
    }
  }

  // ---------------------------------------------------------------- Bestenliste
  const BOARD_SPORTS = [['strength', 'Gym'], ['run', 'Laufen'], ['bike', 'Rad'], ['swim', 'Schwimmen']];
  function board(app) {
    const state = ui(app);
    const sport = BOARD_SPORTS.some(([key]) => key === state.boardSport) ? state.boardSport : 'strength';
    const chips = `<div class="x63-board-sports">${BOARD_SPORTS.map(([key, label]) => `<button data-action="x63-board-sport" data-sport="${key}" class="${key === sport ? 'is-active' : ''}">${label}</button>`).join('')}</div>`;
    const html = window.EVORANK109?.renderLeaderboard?.(sport, app) || '';
    const t = document.createElement('template');
    t.innerHTML = html;
    const section = t.content.querySelector('.rf109-leaderboard');
    if (section) {
      section.querySelectorAll('header p, header small, footer, [data-action="rf110-open-production"], .rf109-leader-copy small').forEach(node => node.remove());
      const empty = section.querySelector('.rf109-leader-empty p');
      if (empty && !section.querySelector('.rf109-leader-list')) empty.remove();
      const emptyTitle = section.querySelector('.rf109-leader-empty strong');
      if (emptyTitle && /Noch kein freigegebener/.test(emptyTitle.textContent)) emptyTitle.textContent = 'Noch niemand dabei.';
      const p = window.EVORANK110?.ensurePrivacy?.(app);
      if (p) section.insertAdjacentHTML('beforeend', p.leaderboardConsent
        ? `<button class="button button--secondary button--wide x63-join" data-action="x60-leader-leave">Nicht mehr mitmachen</button>`
        : `<button class="button button--primary button--wide x63-join" data-action="x60-leader-join">Mitmachen</button>`);
    }
    return `${chips}${section ? section.outerHTML : ''}`;
  }

  function toggleLeaderboard(app) {
    const temp = document.createElement('button');
    temp.dataset.action = 'rf110-toggle-consent';
    temp.dataset.consent = 'leaderboard';
    temp.hidden = true;
    (document.getElementById('app') || document.body).append(temp);
    const done = old.handleClick.call(app, {target: temp, preventDefault() {}, stopPropagation() {}});
    return Promise.resolve(done).finally(() => temp.remove());
  }

  async function reloadBoards(app) {
    for (const sport of ['strength', 'run', 'bike', 'swim']) {
      try { await window.EVORANK109?.loadLeaderboard?.(sport, app); } catch { /* Anzeige zeigt den Fehler */ }
    }
    app.render?.();
  }

  // ---------------------------------------------------------------- Einhängen
  proto.renderFriends = function (...args) {
    if (!status().configured) return old.renderFriends.apply(this, args);
    return render(this);
  };

  const oldModal = proto.renderModal;
  proto.renderModal = function (...args) {
    const html = oldModal.apply(this, args);
    if (this.ui?.modal?.type !== 'rf87-friend' || !status().signedIn) return html;
    const t = document.createElement('template');
    t.innerHTML = html;
    t.content.querySelectorAll('[data-action="rf87-add-friend"]').forEach(button => button.remove());
    const friend = data().friends.find(f => f.id === this.ui.modal.athleteId);
    t.content.querySelectorAll('[data-action="rf87-remove-friend-ask"]').forEach(button => {
      button.dataset.action = 'x60-remove';
      button.dataset.friendId = this.ui.modal.athleteId;
      button.dataset.name = friend?.displayName || friend?.nickname || 'Freund';
    });
    return t.innerHTML;
  };

  proto.renderRanks = function (...args) {
    // X6.3: Die Bestenliste steht nur noch im Freunde-Tab.
    const t = document.createElement('template');
    t.innerHTML = old.renderRanks.apply(this, args);
    t.content.querySelectorAll('.rf109-leaderboard').forEach(node => node.remove());
    return t.innerHTML;
  };

  proto.handleSubmit = function (event) {
    const form = event?.target?.closest?.('form[data-form="x60-search"]');
    if (form) {
      event.preventDefault();
      search(this, form.querySelector('[name="x60q"]')?.value || '');
      return;
    }
    return old.handleSubmit.call(this, event);
  };

  proto.handleClick = async function (event) {
    const element = event?.target?.closest?.('[data-action]');
    const action = element?.dataset?.action || '';
    if (!/^x6[013]-/.test(action)) return old.handleClick.call(this, event);
    event.preventDefault?.();
    const acc = account();
    if (action === 'x60-account') { window.RANKFORGE_ACCOUNT_UI?.open?.(); return; }
    if (action === 'x61-friend') {
      const id = element.dataset.friendId;
      if ((this.state.friendProfiles || []).some(f => f.athleteId === id)) this.openModal('rf87-friend', {athleteId: id});
      else this.showToast?.('Der Stand wird gerade geladen. Versuch es gleich nochmal.');
      return;
    }
    if (action === 'x63-social') { ui(this).tab = element.dataset.tab === 'board' ? 'board' : 'friends'; this.render(); return; }
    if (action === 'x63-board-sport') { ui(this).boardSport = element.dataset.sport; this.render(); return; }
    if (action === 'x60-refresh') { await act(this, () => Promise.resolve(), '', 'Aktualisiert.'); return; }
    if (action === 'x60-request') {
      const nick = element.dataset.nickname;
      await act(this, () => acc.sendFriendRequest(nick), nick, result => result?.accepted ? 'Ihr seid jetzt befreundet.' : 'Anfrage gesendet. Sobald sie angenommen wird, siehst du den Stand.');
      return;
    }
    if (action === 'x60-accept') { await act(this, () => acc.acceptFriendRequest(element.dataset.requestId), element.dataset.requestId, 'Ihr seid jetzt befreundet.'); return; }
    if (action === 'x60-decline') { await act(this, () => acc.declineFriendRequest(element.dataset.requestId), element.dataset.requestId, ''); return; }
    if (action === 'x60-remove') {
      if (!window.confirm(`${element.dataset.name || 'Diese Person'} als Freund entfernen?`)) return;
      this.closeModal?.();
      await act(this, () => acc.removeFriend(element.dataset.friendId), '', 'Freund entfernt.');
      return;
    }
    if (action === 'x60-leader-join') {
      const ok = window.confirm('In der Bestenliste mitmachen?\n\nAndere sehen deinen Spitznamen, Rang und deine Trainingswerte. Du kannst jederzeit wieder aussteigen.');
      if (!ok) return;
      await toggleLeaderboard(this);
      await reloadBoards(this);
      return;
    }
    if (action === 'x60-leader-leave') {
      if (!window.confirm('Nicht mehr mitmachen?')) return;
      await toggleLeaderboard(this);
      await reloadBoards(this);
    }
  };

  // X6.1: Liste filtert sich beim Tippen; kurz danach sucht der Server mit.
  let typing = 0;
  document.addEventListener('input', event => {
    const input = event.target;
    if (input?.name !== 'x60q') return;
    const term = input.value.trim().replace(/^@+/, '').toLocaleLowerCase('de-DE');
    document.querySelectorAll('.x61-find .x60-person').forEach(row => { row.hidden = term.length > 0 && !row.innerText.toLocaleLowerCase('de-DE').includes(term); });
    window.clearTimeout(typing);
    const app = window.RANKFORGE_APP;
    if (!app || term.length === 1) return;
    typing = window.setTimeout(() => search(app, term), 450);
  });

  window.EVORANK_X60_FRIENDS = Object.freeze({search: (q, app = window.RANKFORGE_APP) => search(app, q)});
})();
