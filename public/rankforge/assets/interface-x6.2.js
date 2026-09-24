/* X6.2: schneller Start, ruhigeres Workout, Wischen zum Löschen, Startseite per
   Tippen/Halten ordnen, Freunde nur über die Suche. Baut auf vorhandene Teile auf;
   Speicher-Schlüssel, Übungs-IDs und Sync bleiben unverändert. */
(() => {
  'use strict';
  if (typeof LiftoffApp !== 'function') return;
  const proto = LiftoffApp.prototype;
  const old = {init: proto.init, render: proto.render, renderProfile: proto.renderProfile, renderModal: proto.renderModal, handleClick: proto.handleClick};
  const ico = (name, size = 18) => typeof icon === 'function' ? icon(name, size) : '';
  const template = html => { const t = document.createElement('template'); t.innerHTML = html; return t; };

  // ------------------------------------------------------------ Schneller Start
  // Jede Programmschicht zeichnete am Ende ihres Starts die ganze App neu
  // (über 20-mal). Jetzt wird während des Starts nur gerechnet und am Ende
  // genau einmal gezeichnet.
  proto.init = async function (...args) {
    this.x62Booting = true;
    // Sicherheitsnetz: hängt ein Start-Schritt (z. B. Netz), wird nach 4 s trotzdem gezeichnet.
    const guard = setTimeout(() => { if (this.x62Booting) { this.x62Booting = false; if (this.state) this.render(); } }, 4000);
    try { return await old.init.apply(this, args); }
    finally { clearTimeout(guard); this.x62Booting = false; if (this.state) this.render(); }
  };
  proto.render = function (...args) {
    if (this.x62Booting) { this.updateMetrics?.(); return undefined; }
    return old.render.apply(this, args);
  };

  // ------------------------------------------------------------ Workout: klarer beenden
  // Oben „Abbrechen“ (verwirft nach Rückfrage), unten „Training abschließen“.
  // Der doppelte Knopf „Training abbrechen“ am Ende der Liste entfällt.
  const oldWorkout = proto.renderWorkout;
  proto.renderWorkout = function (...args) {
    const t = template(oldWorkout.apply(this, args));
    t.content.querySelectorAll('.workout-danger').forEach(node => node.remove());
    const top = t.content.querySelector('.workout-header [data-action="workout-open-finish"]');
    if (top) {
      top.dataset.action = 'workout-cancel';
      top.textContent = 'Abbrechen';
      top.classList.add('x62-cancel');
      top.setAttribute('aria-label', 'Training abbrechen');
    }
    return t.innerHTML;
  };

  // ------------------------------------------------------------ Startseite gestalten
  // Tippen blendet ein/aus, Halten und Ziehen ordnet. Keine Pfeile mehr.
  proto.renderModal = function (...args) {
    const html = old.renderModal.apply(this, args);
    if (this.ui?.modal?.type !== 'x51-home') return html;
    const t = template(html);
    t.content.querySelectorAll('.x54-module-options .x51-help').forEach(help => { help.textContent = 'Tippen zum Ein- und Ausblenden. Halten und ziehen zum Ordnen.'; });
    t.content.querySelectorAll('.x54-module-row').forEach(row => {
      row.querySelector('.x54-order-buttons')?.remove();
      row.insertAdjacentHTML('beforeend', `<span class="x62-grip" aria-hidden="true"><i></i><i></i><i></i></span>`);
    });
    return t.innerHTML;
  };

  let drag = null;
  function startDrag(row, event) {
    const list = row.parentElement;
    const rect = row.getBoundingClientRect();
    drag = {row, list, pointerId: event.pointerId, offset: event.clientY - rect.top, moved: false};
    row.classList.add('x62-lifted');
    navigator.vibrate?.(10);
  }
  document.addEventListener('pointerdown', event => {
    const row = event.target.closest?.('.x54-module-row');
    if (!row || event.button > 0) return;
    const hold = {row, x: event.clientX, y: event.clientY, id: event.pointerId};
    hold.timer = setTimeout(() => { startDrag(row, event); }, 280);
    const cancel = e => {
      if (drag) return;
      if (e.type === 'pointermove' && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) < 8) return;
      clearTimeout(hold.timer);
      document.removeEventListener('pointermove', cancel);
      document.removeEventListener('pointerup', cancel);
      document.removeEventListener('pointercancel', cancel);
    };
    document.addEventListener('pointermove', cancel);
    document.addEventListener('pointerup', cancel);
    document.addEventListener('pointercancel', cancel);
  });
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    drag.moved = true;
    const rows = [...drag.list.children].filter(el => el !== drag.row);
    const target = rows.find(el => { const r = el.getBoundingClientRect(); return event.clientY < r.top + r.height / 2; });
    if (target) { if (drag.row.nextElementSibling !== target) drag.list.insertBefore(drag.row, target); }
    else if (drag.list.lastElementChild !== drag.row) drag.list.append(drag.row);
  }, {passive: false});
  const endDrag = event => {
    if (!drag || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
    const {row} = drag;
    row.classList.remove('x62-lifted');
    row.dataset.x62Dragged = '1';
    setTimeout(() => { delete row.dataset.x62Dragged; }, 50);
    drag = null;
  };
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  // Nach dem Ziehen nicht zusätzlich ein-/ausschalten.
  document.addEventListener('click', event => {
    const row = event.target.closest?.('.x54-module-row');
    if (row?.dataset.x62Dragged) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  document.addEventListener('touchmove', event => { if (drag) event.preventDefault(); }, {passive: false});

  // ------------------------------------------------------------ Wischen zum Löschen
  // Gespeichertes Workout nach links oder rechts wischen: rot hinterlegt, gelöscht.
  let swipe = null;
  document.addEventListener('pointerdown', event => {
    const row = event.target.closest?.('.routine-row');
    if (!row || event.pointerType === 'mouse' && event.button > 0) return;
    swipe = {row, x: event.clientX, y: event.clientY, dx: 0, active: false, id: event.pointerId};
  });
  document.addEventListener('pointermove', event => {
    if (!swipe || event.pointerId !== swipe.id) return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    if (!swipe.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { swipe = null; return; }
      if (Math.abs(dx) < 12) return;
      swipe.active = true;
      swipe.row.classList.add('x62-swiping');
    }
    swipe.dx = dx;
    swipe.row.style.setProperty('--x62-dx', `${dx}px`);
    swipe.row.style.setProperty('--x62-side', dx > 0 ? 'flex-start' : 'flex-end');
    swipe.row.classList.toggle('x62-will-delete', Math.abs(dx) > swipe.row.offsetWidth * 0.4);
  });
  const endSwipe = () => {
    if (!swipe) return;
    const {row, dx, active} = swipe;
    swipe = null;
    if (!active) return;
    row.dataset.x62Swiped = '1';
    setTimeout(() => { delete row.dataset.x62Swiped; }, 60);
    const id = row.querySelector('[data-routine-id]')?.dataset.routineId;
    if (Math.abs(dx) > row.offsetWidth * 0.4 && id) {
      row.style.setProperty('--x62-dx', `${dx > 0 ? 110 : -110}%`);
      row.classList.add('x62-deleting');
      setTimeout(() => window.RANKFORGE_APP?.deleteRoutine?.(id), 180);
    } else {
      row.classList.remove('x62-swiping', 'x62-will-delete');
      row.style.removeProperty('--x62-dx');
    }
  };
  document.addEventListener('pointerup', endSwipe);
  document.addEventListener('pointercancel', endSwipe);
  document.addEventListener('click', event => {
    if (event.target.closest?.('.routine-row')?.dataset.x62Swiped) { event.preventDefault(); event.stopPropagation(); }
  }, true);

  // ------------------------------------------------------------ Layout-Helfer
  // Pausen-Leiste sitzt direkt über der unteren Leiste (echte Höhe, auch mit iPhone-Rand).
  function placeDock() {
    const root = document.documentElement;
    const bars = [...document.querySelectorAll('.bottom-nav, .workout-bottom')].filter(el => el.offsetParent !== null || getComputedStyle(el).position === 'fixed');
    const top = Math.min(...bars.map(el => el.getBoundingClientRect().top).filter(v => v > 0 && v < innerHeight));
    root.style.setProperty('--x62-dock-bottom', `${Number.isFinite(top) ? Math.max(0, Math.round(innerHeight - top)) + 6 : 90}px`);
  }
  // Pausentimer: Startknopf gehört ans Ende des Blatts, nicht in die Mitte.
  function tidy(root) {
    root.querySelectorAll('.v73-rest-setup > .v73-rest-footer').forEach(footer => {
      if (footer.nextElementSibling) footer.parentElement.append(footer);
    });
    placeDock();
  }
  // iPhone-Tastatur: Hintergrund abdecken, damit nichts zwischen Blatt und Tastatur durchscheint.
  document.addEventListener('focusin', event => {
    if (event.target?.matches?.('.modal input:not([type=checkbox]):not([type=radio]):not([type=range]), .modal textarea')) document.documentElement.classList.add('x62-typing');
  });
  document.addEventListener('focusout', () => {
    setTimeout(() => { if (!document.activeElement?.matches?.('.modal input:not([type=checkbox]):not([type=radio]):not([type=range]), .modal textarea')) document.documentElement.classList.remove('x62-typing'); }, 80);
  });

  function watch() {
    const root = document.getElementById('app');
    if (!root) return;
    let queued = 0;
    tidy(root);
    new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; tidy(root); });
    }).observe(root, {childList: true, subtree: true});
    addEventListener('resize', placeDock);
    window.visualViewport?.addEventListener('resize', placeDock);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch, {once: true});
  else watch();

  window.EVORANK_X62 = Object.freeze({version: 'X6.2', tidy, placeDock});
})();
