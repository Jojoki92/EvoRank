/* EvoRank X1 — proportional bodygraph selection and automatic account identity. */
(() => {
  "use strict";

  const VERSION = "X1";
  const LEFT_LAT = "M146 434 C167 438 190 452 210 472 C222 487 228 505 230 525 C228 554 221 582 210 609 C193 627 176 624 163 607 C153 584 146 558 142 528 C139 493 140 462 146 434 Z";

  const escapeAttribute = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function femaleLatMarkup(interactive) {
    const action = interactive
      ? ' data-action="select-muscle" data-muscle="lats" role="button" tabindex="0" aria-label="Latissimus"'
      : ' aria-hidden="true"';
    const visible = side => `<path${action} class="rfx1-lat-shape" d="${escapeAttribute(LEFT_LAT)}"${side === "right" ? ' transform="translate(512 0) scale(-1 1)"' : ""}/>`;
    const hit = side => interactive
      ? `<path class="rfx1-muscle-hit" data-action="select-muscle" data-muscle="lats" d="${escapeAttribute(LEFT_LAT)}"${side === "right" ? ' transform="translate(512 0) scale(-1 1)"' : ""}/>`
      : "";
    return `${visible("left")}${visible("right")}${hit("left")}${hit("right")}`;
  }

  function fitFemaleLats(markup, interactive) {
    return String(markup).replace(
      /(<g class="muscle-region muscle-region--lats\b[^>]*>)[\s\S]*?(<\/g>)/u,
      `$1${femaleLatMarkup(interactive)}$2`
    );
  }

  if (typeof bodyFigure === "function") {
    const previousBodyFigure = bodyFigure;
    bodyFigure = function(view, statuses, selected, options = {}) {
      const markup = previousBodyFigure(view, statuses, selected, options);
      if (view !== "back" || !markup.includes("body-figure--female")) return markup;
      return fitFemaleLats(markup, options.interactive !== false);
    };
  }

  const cleanName = value => String(value || "").trim().replace(/\s+/g, " ").slice(0, 60);
  const isPlaceholder = value => /^(athlet|trainingspartner|yoyo)$/iu.test(cleanName(value));

  function configuredAccountName(app) {
    return cleanName(window.LIFTOFF_CONFIG?.allowedAccounts?.[app?.accountKey]?.name);
  }

  function accountIdentity(app, accountProfile = null) {
    if (!app?.state?.profile) return false;
    const status = window.RANKFORGE_ACCOUNT?.status?.() || {};
    const signedInName = cleanName(accountProfile?.displayName || status.displayName || accountProfile?.nickname || status.nickname);
    const current = cleanName(app.state.profile.name);
    const fallback = configuredAccountName(app);
    const name = signedInName || (isPlaceholder(current) ? fallback : "");
    let changed = false;

    if (name && name !== current) {
      app.state.profile.name = name;
      changed = true;
    }
    const nickname = cleanName(accountProfile?.nickname || status.nickname).replace(/^@+/, "");
    if (nickname && app.state.profile.handle !== `@${nickname}`) {
      app.state.profile.handle = `@${nickname}`;
      changed = true;
    }
    const email = cleanName(status.email);
    if (email && app.state.profile.email !== email) {
      app.state.profile.email = email;
      changed = true;
    }
    return changed;
  }

  async function syncAccountIdentity(app) {
    if (!app?.state || app.__rfx1IdentitySync) return app?.__rfx1IdentitySync;
    const account = window.RANKFORGE_ACCOUNT;
    if (!account?.status?.().signedIn) {
      const changed = accountIdentity(app);
      if (changed) app.scheduleSave?.();
      return changed;
    }
    const expectedEmail=account.status().email,expectedKey=app.accountKey;
    app.__rfx1IdentitySync = (async () => {
      let profile = null;
      try { profile = await account.getProfile?.(); } catch { /* Cached account data remains usable offline. */ }
      if(!account.status().signedIn||account.status().email!==expectedEmail||app.accountKey!==expectedKey||(window.RANKFORGE_APP&&window.RANKFORGE_APP!==app))return false;
      const changed = accountIdentity(app, profile);
      if (changed) {
        app.scheduleSave?.();
        app.render?.();
      }
      return changed;
    })().finally(() => { app.__rfx1IdentitySync = null; });
    return app.__rfx1IdentitySync;
  }

  if (typeof LiftoffApp !== "undefined") {
    const prototype = LiftoffApp.prototype;
    const previousInit = prototype.init;
    const previousRender = prototype.render;

    prototype.render = function(...args) {
      if (this.state) {
        accountIdentity(this);
      }
      const result = previousRender.apply(this, args);
      if (this.state) this.state.appVersion = VERSION;
      return result;
    };

    prototype.init = async function(...args) {
      await previousInit.apply(this, args);
      if (this.state) this.state.appVersion = VERSION;
      // Opening the local app is independent of a slow or offline account API.
      syncAccountIdentity(this).catch(() => {});
    };
  }

  window.RANKFORGE_ACCOUNT?.onChange?.(status => {
    if (status.signedIn) syncAccountIdentity(window.RANKFORGE_APP);
  });

  window.EVORANK_X1 = Object.freeze({
    version: VERSION,
    femaleLatPath: LEFT_LAT,
    fitFemaleLats,
    syncAccountIdentity
  });
})();
