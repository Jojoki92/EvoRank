(() => {
  'use strict';
  const proto = LiftoffApp.prototype, old = proto.renderProfile;
  const links = [['privacy.html','Datenschutz'],['privacy-choices.html','Freigaben'],['cookies.html','Cookies & Speicher'],['terms.html','Nutzung'],['refunds.html','Käufe & Erstattung'],['impressum.html','Impressum'],['accessibility.html','Barrierefreiheit']];
  function navigation(app) {
    const settings = app.state?.settings || {};
    const accent = /^#[0-9a-f]{6}$/i.test(settings.accentColor || '') ? settings.accentColor : '#ff3762';
    const theme = ['light','dark'].includes(settings.appearance) ? settings.appearance : (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const query = new URLSearchParams({accent,theme}).toString();
    return `<nav class="rfx49-legal-links" aria-label="Rechtliches und Hilfe">${links.map(([url,label]) => `<a href="./${url}?${query}" target="_blank" rel="noopener">${label}</a>`).join('')}</nav>`;
  }
  proto.renderProfile = function(...args) {
    const template = document.createElement('template'); template.innerHTML = old.apply(this,args);
    const target = template.content.querySelector('.profile-footer') || template.content.lastElementChild;
    target?.insertAdjacentHTML('beforeend',navigation(this)); return template.innerHTML;
  };
  proto.renderRf80Legal = function() {
    return `${this.modalHeader('DEINE DATEN','Rechtliches & Daten')}<div class="modal-scroll"><p>Training bleibt lokal nutzbar. Cloud-Sicherung, öffentliche Bestenlisten und externe Verbindungen haben eigene Freigaben. Beim Feedback bestimmst du, welche Angaben du sendest.</p>${navigation(this)}</div>`;
  };
})();
