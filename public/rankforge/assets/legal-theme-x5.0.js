/* Only appearance crosses into these pages; no account or training state. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const accent = /^#[0-9a-f]{6}$/i.test(params.get('accent') || '') ? params.get('accent') : '#ff3762';
  const theme = ['light','dark'].includes(params.get('theme')) ? params.get('theme') : (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const root = document.documentElement;
  const rgb = [1,3,5].map(i => parseInt(accent.slice(i,i+2),16)/255).map(n => n<=.04045 ? n/12.92 : ((n+.055)/1.055)**2.4);
  const luminance = rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  root.dataset.theme = theme;
  root.style.setProperty('--accent',accent);
  root.style.setProperty('--accent-ink',(luminance+.05)/.05 >= 1.05/(luminance+.05) ? '#000000' : '#ffffff');
  function linkAppearance() {
    for (const anchor of document.querySelectorAll('a[href]')) {
      const url = new URL(anchor.getAttribute('href'),location.href);
      if (url.origin !== location.origin || !/\/(privacy|privacy-choices|cookies|terms|refunds|impressum|accessibility|support)\.html$/.test(url.pathname)) continue;
      url.searchParams.set('accent',accent); url.searchParams.set('theme',theme);
      anchor.href = url.pathname+url.search+url.hash;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',linkAppearance,{once:true});
  else linkAppearance();
})();
