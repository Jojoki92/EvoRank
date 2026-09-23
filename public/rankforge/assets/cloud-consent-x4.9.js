/* Consent belongs to an authenticated account, never to everyone on a device. */
(() => {
  'use strict';
  const key = 'evorank-health-cloud-consent-v1';
  function identity() {
    const status = window.RANKFORGE_ACCOUNT?.status?.() || {};
    return status.signedIn && status.userId ? status : null;
  }
  function records() {
    try { const data = JSON.parse(localStorage.getItem(key) || 'null'); return data?.version === 2 && data.accounts && typeof data.accounts === 'object' ? data.accounts : {}; }
    catch { return {}; }
  }
  function ownsCurrentState(status) {
    const app = window.RANKFORGE_APP;
    const expected = window.EVORANK_LOCAL_ACCOUNTS?.ensure?.(status.email);
    return !!expected && app?.accountKey === expected;
  }
  function read(state) {
    const status = identity(); if (!status || !ownsCurrentState(status)) return false;
    const entry = records()[status.userId];
    if (typeof entry?.enabled === 'boolean') return entry.enabled;
    // Preserve a prior explicit choice only in the matching local account.
    return ownsCurrentState(status) && state?.privacyV110?.cloudHealthConsent === true;
  }
  function set(enabled) {
    const status = identity(); if (!status) return false;
    const accounts = records(), updatedAt = new Date().toISOString();
    accounts[status.userId] = { enabled: !!enabled, updatedAt, version: 'X4.9' };
    try { localStorage.setItem(key, JSON.stringify({ version: 2, accounts })); }
    catch { return false; }
    const app = window.RANKFORGE_APP;
    if (ownsCurrentState(status)) {
      app.state.privacyV110 ||= {};
      Object.assign(app.state.privacyV110, { cloudHealthConsent: !!enabled, consentUpdatedAt: updatedAt });
      app.scheduleSave?.();
    }
    return !!enabled;
  }
  window.EVORANK_CLOUD_CONSENT_X49 = Object.freeze({ read, set });
})();
