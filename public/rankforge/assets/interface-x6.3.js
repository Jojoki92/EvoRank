/* X6.3: ruhigere Oberfläche. Erklärtexte raus (stehen in der Anleitung),
   Plus-Menü startet Ausdauer direkt, Pausentimer mit fester Startleiste,
   schlichteres Live-Workout, Rangkarte in Rangfarbe, neuer Forge Shop.
   Nur Darstellung und Weiterleitung auf vorhandene Aktionen – keine Daten-
   oder Speicheränderung. */
(() => {
  'use strict';
  if (typeof LiftoffApp !== 'function') return;
  const proto = LiftoffApp.prototype;
  const old = {renderModal: proto.renderModal, renderWorkout: proto.renderWorkout, renderHome: proto.renderHome, renderProfile: proto.renderProfile, renderV7RewardShop: proto.renderV7RewardShop, renderRanks: proto.renderRanks, render: proto.render};
  const ico = (name, size = 18) => typeof icon === 'function' ? icon(name, size) : '';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
  const template = html => { const t = document.createElement('template'); t.innerHTML = html; return t; };
  const drop = (root, selector) => root.querySelectorAll(selector).forEach(node => node.remove());

  // ------------------------------------------------------------ Fenster (Modals)
  proto.renderModal = function (...args) {
    const html = old.renderModal.apply(this, args);
    const type = this.ui?.modal?.type;
    if (!type || !html) return html;
    const t = template(html);
    const root = t.content;

    if (type === 'x55-training') {
      // Laufen, Rad, Schwimmen: direkt zu „Jetzt aufnehmen“.
      root.querySelectorAll('[data-action="x51-start-sport"][data-sport]').forEach(row => { row.dataset.action = 'x53-record'; });
      drop(root, '.x55-training small');
    }

    if (type === 'v73-workout-rest-setup') {
      // Startknopf fest unten; nur der Inhalt darüber scrollt.
      const form = root.querySelector('.v73-rest-setup');
      const footer = form?.querySelector(':scope > .v73-rest-footer');
      if (form && footer && !form.querySelector(':scope > .x63-rest-body')) {
        const body = document.createElement('div');
        body.className = 'x63-rest-body';
        [...form.children].filter(child => child !== footer).forEach(child => body.append(child));
        form.prepend(body);
        form.append(footer);
      }
      drop(root, '.v73-rest-setup small, .v73-rest-setup .v73-rest-hero p');
    }

    if (type === 'x53-component') {
      // Nur Kennzahlen – keine Erklärungen und Rechenwege.
      const scroll = root.querySelector('.modal-scroll');
      if (scroll) {
        drop(scroll, 'details, .rfx48-endurance, .x51-explanation');
        // Behalten: Messwert, Bereichspunkte, Grundlage. Alles Erklärende fällt weg.
        scroll.querySelectorAll('p').forEach(p => {
          const text = p.textContent.trim();
          if (!(p.classList.contains('x53-value') || /Bereichspunkte/.test(text) || /^Grundlage:/.test(text))) p.remove();
        });
      }
    }

    if (type === 'v7-custom-exercise') {
      drop(root, '.rf77-photo-builder, .v72-custom-set-plan > small, .modal-field > small');
    }

    if (type === 'exercise-picker' || root.querySelector('.rf77-picker-search')) {
      drop(root, '.rf77-camera-button');
    }

    if (root.querySelector('[data-form="x42-tracker-save"]')) {
      drop(root, '.rfx42-tracker-summary > p');
      const footer = root.querySelector('[data-form="x42-tracker-save"] .modal-footer');
      const back = footer?.querySelector('[data-action="close-modal"]');
      if (footer && back) { back.classList.add('x63-text-button'); footer.append(back); }
    }

    if (type === 'profile-edit') drop(root, '.x51-help, .x61-name-fields small, .modal-field > small');
    if (type === 'x51-home') drop(root, '.x51-help');
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Live-Workout
  proto.renderWorkout = function (...args) {
    const t = template(old.renderWorkout.apply(this, args));
    const root = t.content;
    const editor = root.querySelector('.v74-workout-editor');
    const strip = root.querySelector('.v73-workout-rest-strip');
    if (editor) {
      // Nur noch „Übung hinzufügen“; Routine speichern gibt es beim Abschließen.
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'x63-add-exercise';
      add.dataset.action = 'workout-add-exercise';
      add.innerHTML = `${ico('plus', 18)}<span>Übung hinzufügen</span>`;
      if (strip) {
        // Pause: nur Symbol und Zeit, gleiche Aktion wie bisher.
        const time = strip.querySelector('em')?.textContent || '';
        const rest = document.createElement('button');
        rest.type = 'button';
        rest.className = 'x63-rest-mini';
        rest.dataset.action = strip.dataset.action || 'v73-edit-workout-rest';
        rest.setAttribute('aria-label', 'Satzpause ändern');
        rest.innerHTML = `${ico('timer', 18)}<b>${esc(time)}</b>`;
        const row = document.createElement('div');
        row.className = 'x63-workout-tools';
        strip.replaceWith(row);
        row.append(rest, add);
        editor.remove();
      } else editor.replaceWith(add);
    }
    drop(root, '.rfx41-workout-exercise .rfx2-load-info');
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Startseite: Rangkarte in Rangfarbe
  proto.renderHome = function (...args) {
    const t = template(old.renderHome.apply(this, args));
    const rank = this.metrics?.rank;
    if (rank?.color) {
      t.content.querySelectorAll('.rf103-rank-card--strength').forEach(card => {
        card.style.setProperty('--rank', rank.color);
        card.style.setProperty('--rank-2', `color-mix(in srgb, ${rank.color} 70%, #000)`);
      });
    }
    drop(t.content, '.x53-figure-hint, .x53-profile > header p');
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Profil: Einstellungen aufgeräumt
  proto.renderProfile = function (...args) {
    const t = template(old.renderProfile.apply(this, args));
    const root = t.content;
    drop(root, '.rf880-profile-group summary b');
    root.querySelectorAll('[data-action="rf103-rank-settings"] > span:first-child').forEach(span => { span.innerHTML = ico('ranks', 20); });
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Sportprofil (Laufen/Rad/Schwimmen) ohne Hinweistexte
  proto.renderRanks = function (...args) {
    const t = template(old.renderRanks.apply(this, args));
    drop(t.content, '.x53-figure-hint, .x53-profile > header p');
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Forge Shop
  proto.renderV7RewardShop = function (...args) {
    const t = template(old.renderV7RewardShop.apply(this, args));
    const root = t.content;
    const coins = Math.max(0, Math.round(Number(this.state?.profile?.eggs || 0)));
    const header = root.querySelector('.modal-header');
    if (header) {
      const kicker = header.querySelector('small, p');
      const title = header.querySelector('h2, h1');
      if (kicker) kicker.textContent = 'Belohnungen';
      if (title) title.textContent = 'Forge Shop';
    }
    const wallet = `<section class="x63-wallet"><span class="x63-coin" aria-hidden="true"></span><div><strong>${coins.toLocaleString('de-DE')}</strong><span>Forge Coins</span></div><em>Kein Pay-to-win</em></section>`;
    const hero = root.querySelector('.v72-shop-hero');
    if (hero) hero.outerHTML = wallet;
    drop(root, '.v72-shop-fair, .rf893-locker-footer, .v72-shop-section header p, .v72-shop-card__copy small');
    root.querySelectorAll('[data-action="rf81-reward-reset"]').forEach(button => { button.textContent = 'Zurücksetzen'; button.classList.add('x63-reset'); });
    root.querySelectorAll('.v72-shop-card [data-action="rf81-reward-buy"]').forEach(button => {
      const cost = button.querySelector('b')?.textContent || '';
      button.innerHTML = `<span class="x63-coin x63-coin--small" aria-hidden="true"></span>${esc(cost)}`;
    });
    root.querySelector('.modal-scroll')?.classList.add('x63-shop');
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Tastatur: Leisten ausblenden, Hintergrund abdecken
  function keyboardOpen() {
    const vv = window.visualViewport;
    return Boolean(vv && vv.height < window.innerHeight * 0.78);
  }
  function syncKeyboard() {
    const field = document.activeElement;
    const typing = Boolean(field?.matches?.('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea')) || keyboardOpen();
    document.documentElement.classList.toggle('x63-typing', typing);
  }
  document.addEventListener('focusin', () => setTimeout(syncKeyboard, 0));
  document.addEventListener('focusout', () => setTimeout(syncKeyboard, 120));
  window.visualViewport?.addEventListener('resize', syncKeyboard);

  // ------------------------------------------------------------ Erklärtexte ohne eigene Klasse
  // Die Texte stehen jetzt in der Anleitung (EVORANK-ERKLAERUNGEN.md), nicht mehr in der App.
  const DROP_TEXTS = [
    'Tippe einen Muskel an', 'Gym, Laufen, Radfahren oder Schwimmen auswählen', 'Zeit und Strecke aufzeichnen',
    'Beim Start Standortzugriff', 'Garmin-Aktivitäten können', 'Der Vorschlag wächst', 'Die gesamte Oberfläche wird',
    'Einstiegsfarbe', 'Zeichne eine passende Einheit', 'kg Körpergewicht · e1RM', 'Warm-up, Cool-down und Atemfokus',
    'Sanfte Standardvarianten', 'Die Medienlautstärke deines Handys', 'Deine Stärken auf einen Blick',
    'Farbe = Bereichsrang', 'Zeit und Strecke · GPS', 'Zeit und Bahnen zählen', 'Abgeschlossene Historie bleibt'
  ];
  function tidyTexts(root) {
    root.querySelectorAll('p, small, span, em').forEach(el => {
      if (el.childElementCount) return;
      const text = el.textContent.trim();
      if (text && DROP_TEXTS.some(start => text.startsWith(start))) el.remove();
    });
    root.querySelectorAll('.rf880-profile-group summary small').forEach(el => { if (/antippen zum Aufklappen/.test(el.textContent)) el.remove(); });
    root.querySelectorAll('.data-note').forEach(el => { if (!/^EvoRank X6\.3$/.test(el.textContent)) el.textContent = 'EvoRank X6.3'; });
    // Einheitliche Kacheln: Sonderknöpfe bekommen denselben Stil wie ihre Nachbarn.
    root.querySelectorAll('.rf880-profile-group__body > .x53-setting-link').forEach(button => {
      button.classList.remove('x53-setting-link');
      if (button.dataset.action === 'rf110-open-production') {
        const title = button.querySelector('strong');
        if (title) title.textContent = 'Cloud & Freigaben';
        const glyph = button.querySelector('span');
        if (glyph) glyph.innerHTML = ico('cloud', 20);
      }
    });
  }
  function watchTexts() {
    const root = document.getElementById('app');
    if (!root) return;
    let queued = 0;
    tidyTexts(root);
    new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; tidyTexts(root); });
    }).observe(root, {childList: true, subtree: true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchTexts, {once: true});
  else watchTexts();

  window.EVORANK_X63 = Object.freeze({version: 'X6.3', tidyTexts});
})();
