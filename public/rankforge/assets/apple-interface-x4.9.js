/* X4.9: Apple-inspired materials and interruptible sheets, within the same app. */
(() => {
  'use strict';
  const proto = LiftoffApp.prototype;
  const old = { render: proto.render, renderModal: proto.renderModal, handleClick: proto.handleClick };
  const active = new WeakMap();
  const enabled = () => true;
  const reduced = app => app.state?.settings?.reducedMotion === 'reduce' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const project = velocity => velocity / 1000 * .998 / (1 - .998);
  const rubberband = (distance, size) => distance * size * .55 / (size + .55 * Math.abs(distance));
  function luminance(hex) {
    const color = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : '#ff3762';
    const rgb = [1,3,5].map(i => parseInt(color.slice(i,i+2),16)/255).map(n => n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4);
    return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  }
  function foreground(hex) { const l = luminance(hex); return (l+.05)/.05 >= 1.05/(l+.05) ? '#000000' : '#ffffff'; }
  function step(position, velocity, target, dt) {
    // Exact critically damped spring; no frame-dependent Euler overshoot.
    const w = 22, t = clamp(dt, 0, .05), x = position - target, c = velocity + w * x, e = Math.exp(-w * t);
    return { position: target + (x + c * t) * e, velocity: (velocity - w * c * t) * e };
  }
  function apply(app) {
    const settings = app.state?.settings;
    // X5.1 uses one appearance. Color, contrast and motion preferences remain independent.
    if (settings && (settings.interfaceX49 !== 'apple' || settings.interfaceDefaultX50 !== true)) {
      settings.interfaceX49 = 'apple';
      settings.interfaceDefaultX50 = true;
      app.scheduleSave?.();
    }
    document.documentElement.dataset.interface = enabled(app) ? 'apple' : 'classic';
    document.documentElement.style.setProperty('--x49-accent-ink', foreground(app.state?.settings?.accentColor));
  }
  function eligible(app, sheet) {
    return enabled(app) && sheet?.matches('.modal--sheet') && !sheet.querySelector('form') &&
      !/confirm|finish|color-picker|recovery/.test(app.ui.modal?.type || '') &&
      !!sheet.querySelector('[data-action="close-modal"]');
  }
  function paint(state) {
    state.sheet.style.transform = `translate3d(0,${state.position}px,0)`;
  }
  function stop(state) { if (state.frame) window.cancelAnimationFrame?.(state.frame); state.frame = 0; }
  function settle(state, target, completion) {
    stop(state); state.target = target; state.completion = completion;
    if (reduced(state.app)) { state.position = target; state.velocity = 0; paint(state); completion?.(); return; }
    let previous = performance.now();
    const tick = now => {
      if (!state.sheet.isConnected || state.app.ui.modal !== state.modal) return stop(state);
      const next = step(state.position, state.velocity, target, (now - previous) / 1000);
      previous = now; Object.assign(state, next); paint(state);
      if (Math.abs(state.position - target) < .3 && Math.abs(state.velocity) < 3) {
        state.position = target; state.velocity = 0; state.frame = 0; paint(state); completion?.();
      } else state.frame = requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
  }
  function close(state) {
    if (state.app.ui.modal !== state.modal) return;
    settle(state, state.sheet.getBoundingClientRect().height + 24, () => {
      if (state.app.ui.modal !== state.modal) return;
      const button = state.sheet.querySelector('[data-action="close-modal"]');
      old.handleClick.call(state.app, { target: button, preventDefault() {}, stopPropagation() {} });
    });
  }
  function bindSheet(app, sheet, previous) {
    if (!eligible(app, sheet)) return;
    const handle = sheet.querySelector('.sheet-handle'); if (!handle) return;
    const same = previous?.modal === app.ui.modal;
    const state = { app, sheet, modal: app.ui.modal, position: same ? previous.position : 48, velocity: same ? previous.velocity : 0, frame: 0, pointer: null, dragged: false };
    active.set(app, state); sheet.classList.add('rfx49-motion-sheet');
    handle.setAttribute('role', 'button'); handle.tabIndex = 0;
    handle.setAttribute('aria-label', 'Dialog schließen; zum Verschieben ziehen');
    handle.dataset.x49Handle = 'true';
    paint(state);
    if (!same || state.position) settle(state, 0);
    let origin = 0, downY = 0, downX = 0, samples = [];
    handle.addEventListener('pointerdown', event => {
      if (event.isPrimary === false || event.button > 0 || state.pointer != null) return;
      stop(state); state.completion = null; state.pointer = event.pointerId; state.dragged = false; state.suppressClick = false;
      origin = state.position; downY = event.clientY; downX = event.clientX;
      samples = [{ y: event.clientY, time: event.timeStamp }];
      handle.setPointerCapture?.(event.pointerId);
    });
    handle.addEventListener('pointermove', event => {
      if (event.pointerId !== state.pointer) return;
      const dy = event.clientY - downY;
      if (!state.dragged && Math.abs(dy) < 8) return;
      if (!state.dragged && Math.abs(event.clientX - downX) > Math.abs(dy)) return;
      state.dragged = true;
      const position = origin + dy;
      state.position = position < 0 ? rubberband(position, 150) : position;
      samples.push({ y: event.clientY, time: event.timeStamp });
      samples = samples.filter(sample => event.timeStamp - sample.time <= 100).slice(-8);
      const first = samples[0], elapsed = event.timeStamp - first.time;
      state.velocity = elapsed > 0 ? clamp((event.clientY - first.y) / elapsed * 1000, -2500, 2500) : 0;
      paint(state);
    });
    const release = event => {
      if (event.pointerId !== state.pointer) return;
      state.pointer = null;
      const moved = state.dragged;
      if (samples.length && event.timeStamp - samples.at(-1).time > 100) state.velocity = 0;
      try { handle.releasePointerCapture?.(event.pointerId); } catch { /* already released */ }
      const distance = state.sheet.getBoundingClientRect().height;
      const dismiss = event.type === 'pointerup' && moved && state.velocity >= -80 &&
        state.position + project(state.velocity) > Math.max(100, distance * .32);
      if (dismiss) close(state); else settle(state, 0);
      if (moved) state.suppressClick = true;
    };
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
    handle.addEventListener('lostpointercapture', event => { if (state.pointer === event.pointerId) { state.pointer = null; state.velocity = 0; settle(state, 0); } });
    handle.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation();
      if (state.suppressClick) { state.suppressClick = false; return; }
      close(state);
    });
    handle.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); close(state); }
    });
  }
  proto.renderModal = function(...args) {
    const template = document.createElement('template'); template.innerHTML = old.renderModal.apply(this, args);
    const sheet = template.content.querySelector('.modal[role="dialog"]');
    if (sheet && !sheet.hasAttribute('aria-label') && !sheet.hasAttribute('aria-labelledby')) {
      const heading = sheet.querySelector('h2,h1,h3');
      if (heading) { heading.id ||= 'x49-dialog-title'; sheet.setAttribute('aria-labelledby', heading.id); }
    }
    return template.innerHTML;
  };
  proto.render = function(...args) {
    const previous = active.get(this); if (previous) stop(previous);
    apply(this); const result = old.render.apply(this, args);
    bindSheet(this, document.querySelector('#app .modal--sheet'), previous);
    if (!this.ui.modal) active.delete(this);
    return result;
  };
  proto.handleClick = function(event) {
    const el = event.target.closest?.('[data-action]'), action = el?.dataset.action;
    if (action === 'x49-interface') {
      event.preventDefault(); this.state.settings.interfaceX49 = 'apple';
      this.state.settings.interfaceDefaultX50 = true;
      this.scheduleSave(); this.render(); return;
    }
    if (action === 'close-modal') {
      const state = active.get(this);
      if (state && state.sheet.isConnected && state.modal === this.ui.modal && eligible(this, state.sheet)) {
        if (el.classList.contains('modal-backdrop') && event.target !== el) return old.handleClick.call(this, event);
        event.preventDefault(); close(state); return;
      }
    }
    return old.handleClick.call(this, event);
  };
  // Keep keyboard focus within the visible dialog; this never submits a form.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector('.rf92:not([hidden]) [role="dialog"],#app .modal[role="dialog"]');
    if (!dialog) return;
    const items = [...dialog.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')]
      .filter(el => {
        if (el.disabled || el.hidden || el.type === 'hidden' || el.closest('[hidden]')) return false;
        for (let parent = el.parentElement; parent && parent !== dialog; parent = parent.parentElement) {
          if (parent.tagName === 'DETAILS' && !parent.open && !parent.querySelector(':scope>summary')?.contains(el)) return false;
        }
        return true;
      });
    if (!items.length) return;
    const first = items[0], last = items.at(-1), current = document.activeElement;
    if (!dialog.contains(current) || (!event.shiftKey && current === last) || (event.shiftKey && current === first)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  });
  window.EVORANK_APPLE_X49 = Object.freeze({ step, project, rubberband, eligible, apply, bindSheet, luminance, foreground });
})();
