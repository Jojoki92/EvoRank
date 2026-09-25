/* X6.1: Übungen einklappen, Spitzname im Profil speichern, verlorene Daten
   auf dem Gerät wiederfinden und ein echter Ladebildschirm (kein Flackern).
   Baut nur auf vorhandene Teile auf: LiftoffApp, RANKFORGE_ACCOUNT,
   RANKFORGE_BRIDGE und RANKFORGE_SPLASH. Speicher-Schlüssel bleiben gleich. */
(() => {
  'use strict';
  if (typeof LiftoffApp !== 'function') return;
  const proto = LiftoffApp.prototype;
  const old = {renderModal: proto.renderModal, renderProfile: proto.renderProfile, renderProfileEditModal: proto.renderProfileEditModal, handleClick: proto.handleClick, handleSubmit: proto.handleSubmit};
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const account = () => window.RANKFORGE_ACCOUNT;
  const signedIn = () => { const s = account()?.status?.() || {}; return Boolean(s.configured && s.signedIn); };
  const template = html => { const t = document.createElement('template'); t.innerHTML = html; return t; };

  // ------------------------------------------------------------ Übungen einklappen
  function collapsed(app) {
    app.ui ||= {};
    app.ui.x61Collapsed ||= new Set();
    return app.ui.x61Collapsed;
  }

  function decorate(root) {
    const app = window.RANKFORGE_APP;
    if (!app || !root?.querySelectorAll) return;
    const closed = collapsed(app);
    root.querySelectorAll('.rfx41-workout-exercise[data-exercise-instance]').forEach(card => {
      const id = card.dataset.exerciseInstance;
      const sets = card.querySelectorAll('.v72-set-card');
      const done = card.querySelectorAll('.v72-set-card.is-done').length;
      const isClosed = closed.has(id);
      card.classList.toggle('x61-collapsed', isClosed);
      // X6.2: kleiner Knopf oben in der Kopfzeile statt eigener Leiste.
      const header = card.querySelector(':scope > header');
      if (!header) return;
      let button = header.querySelector('.x61-collapse');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'x61-collapse';
        button.dataset.action = 'x61-collapse';
        // X6.3: Pfeil und drei Punkte sitzen gemeinsam oben rechts.
        const menu = header.querySelector('[data-action="workout-exercise-menu"]');
        const group = document.createElement('div');
        group.className = 'x63-head-actions';
        group.append(button);
        if (menu) group.append(menu);
        header.append(group);
      }
      button.dataset.instance = id;
      button.setAttribute('aria-expanded', String(!isClosed));
      button.setAttribute('aria-label', `${isClosed ? 'Sätze zeigen' : 'Sätze einklappen'} (${done} von ${sets.length} erledigt)`);
      // X6.3: nur ein kleines Pfeil-Symbol neben den drei Punkten.
      const html = typeof icon === 'function' ? icon(isClosed ? 'chevronDown' : 'chevronUp', 18) : (isClosed ? '▾' : '▴');
      // Nur neu schreiben, wenn sich der Zustand ändert (sonst Endlosschleife mit dem Beobachter).
      if (button.dataset.state !== String(isClosed)) { button.dataset.state = String(isClosed); button.innerHTML = html; }
      card.querySelector(':scope > .x61-collapse-bar')?.remove();
    });
  }

  // Kürzere Reiter-Namen, damit alle in eine Zeile passen.
  const TAB_WORDS = {'Dein Rank': 'Rang', 'Dein Rang': 'Rang', 'Gallery': 'Galerie'};
  function tabs(root) {
    root.querySelectorAll('.x53-rank-tabs > button').forEach(button => {
      const text = button.textContent.trim();
      if (TAB_WORDS[text]) button.textContent = TAB_WORDS[text];
    });
  }

  let pending = 0;
  function watch() {
    const root = document.getElementById('app');
    if (!root) return;
    decorate(root);
    tabs(root);
    new MutationObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = 0; decorate(root); tabs(root); });
    }).observe(root, {childList: true, subtree: true});
  }

  // ------------------------------------------------------------ Profil: Name & Spitzname
  proto.renderProfileEditModal = function (...args) {
    const t = template(old.renderProfileEditModal.apply(this, args));
    const form = t.content.querySelector('form[data-form="profile"]');
    if (!form) return t.innerHTML;
    const name = form.querySelector('[name="name"]')?.closest('label');
    const handle = form.querySelector('[name="handle"]')?.closest('label');
    const box = document.createElement('fieldset');
    box.className = 'x61-name-fields';
    box.innerHTML = '<legend>Name &amp; Spitzname</legend>';
    if (name) box.append(name);
    if (handle) {
      const input = handle.querySelector('input');
      handle.querySelector('span').textContent = signedIn() ? 'Spitzname (für Freunde sichtbar)' : 'Spitzname';
      input.setAttribute('autocapitalize', 'none');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('spellcheck', 'false');
      const nick = account()?.status?.()?.nickname;
      if (signedIn() && nick) input.value = '@' + nick;
      handle.insertAdjacentHTML('beforeend', signedIn() ? '<small>3–20 Zeichen: Kleinbuchstaben, Ziffern, Punkt, Unterstrich.</small>' : '');
      box.append(handle);
    }
    form.prepend(box);
    form.querySelector('.x56-profile-details summary')?.replaceChildren('Profilbild, Ort & Einheit');
    return t.innerHTML;
  };

  async function saveNickname(app, name, handle) {
    const acc = account();
    if (!signedIn() || !acc?.saveProfile) return;
    const nickname = String(handle || '').trim().replace(/^@+/, '').toLowerCase();
    const current = acc.status?.()?.nickname || '';
    if (!nickname && !current) return;
    try {
      const me = await acc.getProfile?.().catch(() => null);
      if ((nickname || current) === current && (me?.displayName || '') === name) return;
      await acc.saveProfile({nickname: nickname || current, displayName: name, avatar: me?.avatar || ''});
      app.showToast?.('Name und Spitzname gespeichert');
    } catch (error) {
      const text = String(error?.message || '');
      app.showToast?.(/taken|vergeben|unique|duplicate/i.test(text) ? 'Dieser Spitzname ist schon vergeben.' : text || 'Spitzname konnte nicht gespeichert werden.');
    }
  }

  proto.handleSubmit = function (event) {
    const form = event?.target?.closest?.('form[data-form="profile"]');
    const values = form ? {name: String(form.querySelector('[name="name"]')?.value || '').trim(), handle: form.querySelector('[name="handle"]')?.value || ''} : null;
    const result = old.handleSubmit.call(this, event);
    if (values) saveNickname(this, values.name, values.handle);
    return result;
  };

  // iPhone: Beim Tippen in ein Feld bleibt genau dieses Feld sichtbar.
  document.addEventListener('focusin', event => {
    const field = event.target;
    if (!field?.matches?.('.modal input:not([type=checkbox]):not([type=radio]):not([type=range]), .modal textarea')) return;
    const keep = () => field.isConnected && document.activeElement === field && field.scrollIntoView({block: 'center', behavior: 'auto'});
    setTimeout(keep, 320);
    window.visualViewport?.addEventListener('resize', keep, {once: true});
  });

  // ------------------------------------------------------------ Daten wiederfinden
  const DB = 'uprank-training-v6', STORE = 'states';

  function summary(key, state, source) {
    const workouts = Array.isArray(state?.workouts) ? state.workouts : [];
    const dates = workouts.map(w => Date.parse(w.finishedAt || w.completedAt || w.date || w.startedAt || '')).filter(Number.isFinite);
    const endurance = (state?.triathlon?.activities?.length || 0) + (state?.garmin?.activities?.length || 0);
    return {key, source, state, workouts: workouts.length, endurance, name: state?.profile?.name || '', last: dates.length ? Math.max(...dates) : Date.parse(state?.updatedAt || '') || 0};
  }

  function readDevice() {
    return new Promise(resolve => {
      let request;
      try { request = indexedDB.open(DB); } catch { resolve([]); return; }
      request.onerror = () => resolve([]);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) { db.close(); resolve([]); return; }
        const out = [];
        const tx = db.transaction(STORE, 'readonly');
        const cursor = tx.objectStore(STORE).openCursor();
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (!c) return;
          if (String(c.key).startsWith('state:')) out.push([String(c.key).slice(6), c.value]);
          c.continue();
        };
        tx.oncomplete = () => { db.close(); resolve(out); };
        tx.onerror = () => { db.close(); resolve(out); };
      };
    });
  }

  function readMirrors() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (!key.startsWith(DB + ':state:')) continue;
        try { out.push([key.slice(DB.length + 7), JSON.parse(localStorage.getItem(key))]); } catch {}
      }
    } catch {}
    return out;
  }

  async function findData(app) {
    const found = [];
    const seen = new Set();
    for (const [key, state] of [...await readDevice(), ...readMirrors()]) {
      if (!state || typeof state !== 'object' || key === app.accountKey) continue;
      const item = summary(key, state, 'Dieses Gerät');
      const id = `${key}:${item.workouts}:${item.last}`;
      if (seen.has(id) || (!item.workouts && !item.endurance)) continue;
      seen.add(id);
      found.push(item);
    }
    if (signedIn() && account()?.pull) {
      try {
        const cloud = await account().pull();
        if (cloud?.payload) {
          const item = summary('cloud', cloud.payload, 'Cloud-Sicherung');
          if (item.workouts || item.endurance) found.push(item);
        }
      } catch {}
    }
    return found.sort((a, b) => b.last - a.last);
  }

  function recoverUi(app) {
    app.ui ||= {};
    app.ui.x61Recover ||= {loading: false, items: null};
    return app.ui.x61Recover;
  }

  async function loadRecover(app) {
    const state = recoverUi(app);
    state.loading = true; state.items = null;
    app.render();
    try { state.items = await findData(app); } catch { state.items = []; }
    state.loading = false;
    if (app.ui?.modal?.type === 'x61-recover') app.render();
  }

  function renderRecover(app) {
    const state = recoverUi(app);
    const own = summary(app.accountKey, app.state, '');
    const date = ms => ms ? new Date(ms).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'unbekannt';
    const rows = state.loading || !state.items
      ? '<p class="x61-muted">Suche auf diesem Gerät und in der Cloud …</p>'
      : state.items.length
        ? state.items.map((item, index) => `<article class="x61-recover-row"><div><strong>${esc(item.source)}${item.name ? ' · ' + esc(item.name) : ''}</strong><small>${item.workouts} Workouts${item.endurance ? ` · ${item.endurance} Ausdauer-Einheiten` : ''} · zuletzt ${date(item.last)}</small></div><button class="button button--primary x60-small" type="button" data-action="x61-recover-take" data-index="${index}">Übernehmen</button></article>`).join('')
        : '<p class="x61-muted">Keine weiteren Trainingsdaten gefunden. Wenn deine Daten in einem anderen Konto liegen, melde dich dort an.</p>';
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true" aria-label="Meine Daten wiederfinden">${app.modalHeader('DATEN', 'Meine Daten wiederfinden')}<div class="modal-scroll x61-recover"><p>Jetzt geöffnet: <strong>${own.workouts} Workouts</strong>. Hier siehst du andere Trainingsstände auf diesem Gerät und deine Cloud-Sicherung.</p><p class="x61-muted">„Übernehmen“ fügt die Workouts zusammen. Nichts wird gelöscht; vorher wird eine Sicherheitskopie gespeichert.</p>${rows}<button class="button button--secondary button--wide" type="button" data-action="x61-recover-scan">Nochmal suchen</button></div></section></div>`;
  }

  async function takeOver(app, item) {
    const bridge = window.RANKFORGE_BRIDGE;
    if (!bridge?.mergeTrainingStates || typeof normalizeState !== 'function') { app.showToast?.('Zusammenführen ist gerade nicht möglich.'); return; }
    if (!window.confirm(`${item.workouts} Workouts aus „${item.source}“ zu deinem aktuellen Stand hinzufügen?`)) return;
    try {
      if (typeof repository === 'object' && repository?.set) await repository.set(`x61-backup-${Date.now()}`, app.state);
      const currentEmpty = !(app.state.workouts || []).length;
      const merged = currentEmpty ? bridge.mergeTrainingStates(item.state, app.state) : bridge.mergeTrainingStates(app.state, item.state);
      const draft = app.state.draft;
      app.state = normalizeState(merged, app.accountKey);
      if (draft) app.state.draft = draft;
      if (typeof getMetrics === 'function') app.metrics = getMetrics(app.state);
      await app.persist?.();
      app.closeModal?.();
      app.showToast?.('Daten übernommen');
      app.render();
    } catch (error) {
      app.showToast?.('Übernehmen fehlgeschlagen: ' + (error?.message || 'unbekannt'));
    }
  }

  proto.renderProfile = function (...args) {
    const t = template(old.renderProfile.apply(this, args));
    // X6.2: als Eintrag in „Daten & Hilfe“ statt als eigene Karte.
    const group = [...t.content.querySelectorAll('.rf880-profile-group')].find(g => g.querySelector('summary')?.textContent.includes('Daten & Hilfe'));
    const body = group?.querySelector('.rf880-profile-group__body');
    const ico = (name, size) => typeof icon === 'function' ? icon(name, size) : '';
    const entry = `<button data-action="x61-recover"><span>${ico('refresh', 20)}</span><div><strong>Daten wiederfinden</strong><small>Andere Trainingsstände auf diesem Gerät oder in der Cloud</small></div>${ico('chevronRight', 18)}</button>`;
    if (body) {
      body.insertAdjacentHTML('beforeend', entry);
      const count = group.querySelector('summary b');
      if (count) count.textContent = body.children.length;
    } else {
      (t.content.querySelector('.screen') || t.content.firstElementChild)?.insertAdjacentHTML('beforeend', `<section class="card x61-recover-card">${entry}</section>`);
    }
    return t.innerHTML;
  };

  proto.renderModal = function (...args) {
    if (this.ui?.modal?.type === 'x61-recover') return renderRecover(this);
    return old.renderModal.apply(this, args);
  };

  proto.handleClick = function (event) {
    const element = event?.target?.closest?.('[data-action]');
    const action = element?.dataset?.action || '';
    if (action === 'x61-collapse') {
      event.preventDefault?.();
      const set = collapsed(this), id = element.dataset.instance;
      if (set.has(id)) set.delete(id); else set.add(id);
      decorate(document.getElementById('app'));
      return;
    }
    if (action === 'x61-recover') { event.preventDefault?.(); this.openModal('x61-recover'); loadRecover(this); return; }
    if (action === 'x61-recover-scan') { event.preventDefault?.(); loadRecover(this); return; }
    if (action === 'x61-recover-take') {
      event.preventDefault?.();
      const item = recoverUi(this).items?.[Number(element.dataset.index)];
      if (item) takeOver(this, item);
      return;
    }
    return old.handleClick.call(this, event);
  };

  // ------------------------------------------------------------ Tempo
  // Ränge wurden bei jedem Neuzeichnen aus allen Workouts neu berechnet.
  // Jetzt nur, wenn sich Workouts, Profil, eigene Übungen oder der Tag ändern.
  // Schneller Fingerabdruck aller Werte, die in Ränge, XP und Serien einfließen.
  const SET_KEYS = ['done', 'type', 'weightKg', 'reps', 'assistanceKg', 'durationSeconds', 'distanceMeters', 'unilateral', 'cableRatio', 'cableInputMode', 'machineLoadFactor', 'machineStartingKg', 'machineInputMode', 'bodyweightFraction'];
  function fingerprint(state) {
    const parts = [new Date().toDateString(), JSON.stringify([state.profile, state.customExercises])];
    const add = value => { parts.push(value); };
    for (const w of state.workouts || []) {
      add(w.id); add(w.endedAt || w.date); add(w.startedAt); add(w.xp); add(w.bodyweightKg); add(w.bodyProfile); add(w.volumeKg ?? w.volume);
      if (w.bestLifts?.length) add(JSON.stringify(w.bestLifts));
      if (w.prs?.length) add(JSON.stringify(w.prs));
      for (const e of w.exercises || []) {
        add(e.exerciseId || e.id); add(e.isCustom);
        for (const set of e.sets || []) {
          for (const k of SET_KEYS) add(set[k]);
          if (set.unilateral) add(JSON.stringify([set.left, set.right]));
        }
      }
    }
    return parts.join('|');
  }

  if (typeof getMetrics === 'function') {
    const computeMetrics = getMetrics;
    const memo = new WeakMap();
    getMetrics = function (state) {
      if (!state || typeof state !== 'object') return computeMetrics(state);
      let key;
      try { key = fingerprint(state); }
      catch { return computeMetrics(state); }
      const hit = memo.get(state);
      if (hit && hit.workouts === state.workouts && hit.key === key) return hit.value;
      const value = computeMetrics(state);
      memo.set(state, {key, workouts: state.workouts, value});
      return value;
    };
  }

  // Speichern: der Text-Ersatz (JSON) wird nur noch gebaut, wenn IndexedDB
  // wirklich ausfällt – vorher entstand bei jedem Speichern eine unnötige Kopie.
  if (typeof repository === 'object' && repository && typeof deepClone === 'function' && typeof DB_STORE === 'string') {
    repository.set = async function (accountKey, state) {
      const key = `state:${accountKey}`;
      const snapshot = deepClone(state);
      this.memory.set(key, snapshot);
      const fallbackWrite = () => { safeStorageSet(`${DB_NAME}:${key}`, JSON.stringify(snapshot)); return true; };
      if (this.fallback || !this.db) return fallbackWrite();
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction(DB_STORE, 'readwrite');
          transaction.objectStore(DB_STORE).put(snapshot, key);
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error || new Error('IndexedDB-Speichervorgang abgebrochen'));
        });
        return true;
      } catch {
        this.fallback = true;
        return fallbackWrite();
      }
    };
  }

  // ------------------------------------------------------------ Ladebildschirm
  // Der Startbildschirm bleibt, bis die erste Ansicht samt Körpergrafik fertig ist.
  function holdSplash() {
    const splash = window.RANKFORGE_SPLASH;
    if (!splash || splash.x61) return;
    const finish = splash.finish.bind(splash);
    splash.x61 = true;
    splash.finish = async function (message) {
      splash.set(96, 'Ansicht vorbereiten', 'ready');
      // Fotos und Körpergrafiken (auch SVG-<image>) vorher fertig laden.
      const sources = new Set([...document.querySelectorAll('#app img')].map(img => img.currentSrc || img.src));
      document.querySelectorAll('#app svg image').forEach(node => sources.add(node.getAttribute('href') || node.getAttribute('xlink:href')));
      const decode = Promise.all([...sources].filter(Boolean).map(src => { const img = new Image(); img.src = src; return (img.decode ? img.decode() : Promise.resolve()).catch(() => {}); }));
      await Promise.race([decode, new Promise(r => setTimeout(r, 500))]);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      return finish(message);
    };
  }

  function start() { holdSplash(); watch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
  holdSplash();

  window.EVORANK_X61 = Object.freeze({decorate, findData, summary});
})();
