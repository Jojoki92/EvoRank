/* EvoRank 10.11.5 — anatomical bodygraph, binary profile choice and account identity. */
(() => {
  "use strict";

  const VERSION = "10.11.5";
  const SUPPORTED_PROFILES = new Set(["male", "female"]);

  const escapeAttribute = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function exactFemaleLat(markup, interactive) {
    const path = window.RANKFORGE893?.femalePaths?.back?.lats;
    if (!path) return markup;
    const action = interactive
      ? ' data-action="select-muscle" data-muscle="lats" role="button" tabindex="0" aria-label="Latissimus"'
      : ' aria-hidden="true"';
    const visible = `<path${action} d="${escapeAttribute(path)}" fill-rule="evenodd" clip-rule="evenodd"/>`;
    const hit = interactive
      ? `<path class="rf115-muscle-hit" data-action="select-muscle" data-muscle="lats" d="${escapeAttribute(path)}" fill-rule="evenodd"/>`
      : "";
    return String(markup).replace(
      /(<g class="muscle-region muscle-region--lats\b[^>]*>)[\s\S]*?(<\/g>)/u,
      `$1${visible}${hit}$2`
    );
  }

  function shoulderTargets(markup, profile, view, interactive) {
    const cleaned = String(markup)
      .replace(/<g class="rf113-shoulder-overlay"[\s\S]*?<\/g>/gu, "")
      .replace(/<g class="rf114-shoulder-targets"[\s\S]*?<\/g>/gu, "")
      .replace(/<g class="rf115-shoulder-targets"[\s\S]*?<\/g>/gu, "");
    if (!interactive) return cleaned;

    const female = profile === "female";
    const y = female ? (view === "front" ? 365 : 370) : (view === "front" ? 420 : 410);
    const left = female ? 114 : 275;
    const right = female ? 370 : 725;
    const rx = female ? 54 : 112;
    const ry = female ? 50 : 98;
    const target = (side, label) => `<ellipse data-action="select-muscle" data-muscle="shoulders" role="button" tabindex="0" aria-label="${label}" cx="${side}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
    return cleaned.replace(
      "</svg>",
      `<g class="rf115-shoulder-targets" aria-label="Schultern">${target(left, "Linke Schulter")}${target(right, "Rechte Schulter")}</g></svg>`
    );
  }

  if (typeof bodyFigure === "function") {
    const previousBodyFigure = bodyFigure;
    bodyFigure = function(view, statuses, selected, options = {}) {
      let markup = previousBodyFigure(view, statuses, selected, options);
      const female = markup.includes("body-figure--female");
      const interactive = options.interactive !== false;
      if (female && view === "back") markup = exactFemaleLat(markup, interactive);
      return shoulderTargets(markup, female ? "female" : "male", view, interactive);
    };
  }

  function normalizeProfile(app) {
    const profile = app?.state?.profile;
    if (!profile) return false;
    const current = String(profile.bodyProfile || profile.sex || "").toLowerCase();
    const next = SUPPORTED_PROFILES.has(current) ? current : "male";
    const changed = profile.bodyProfile !== next || profile.sex !== next;
    profile.bodyProfile = next;
    profile.sex = next;
    return changed;
  }

  function removeUnsupportedProfile(markup) {
    return String(markup || "").replace(
      /<label><input\s+type="radio"\s+name="bodyProfile"\s+value="unspecified"[\s\S]*?<\/label>/gu,
      ""
    );
  }

  function cleanProfileControls() {
    document.querySelectorAll('input[name="bodyProfile"][value="unspecified"]').forEach(input => {
      input.closest("label")?.remove();
    });
    document.querySelectorAll('select[name="bodyProfile"] option').forEach(option => {
      if (!SUPPORTED_PROFILES.has(String(option.value).toLowerCase())) option.remove();
    });
  }

  function preferredAccountName(profile = {}, status = {}) {
    return String(profile.displayName || status.displayName || profile.nickname || status.nickname || "").trim().slice(0, 60);
  }

  function applyAccountIdentity(app, accountProfile = null) {
    if (!app?.state?.profile) return false;
    const status = window.RANKFORGE_ACCOUNT?.status?.() || {};
    const name = preferredAccountName(accountProfile || {}, status);
    const current = String(app.state.profile.name || "").trim();
    if (!name || (current && !/^(athlet|trainingspartner)$/iu.test(current))) return false;

    app.state.profile.name = name;
    const nickname = String(accountProfile?.nickname || status.nickname || "").trim().replace(/^@+/, "");
    if (nickname) app.state.profile.handle = `@${nickname}`;
    const email = String(status.email || "").trim();
    if (email) app.state.profile.email = email;
    return true;
  }

  async function syncAccountIdentity(app) {
    if (!app?.state || app.__rf115IdentitySync) return app?.__rf115IdentitySync;
    const account = window.RANKFORGE_ACCOUNT;
    if (!account?.status?.().signedIn) return false;
    const expectedEmail=account.status().email,expectedKey=app.accountKey;
    app.__rf115IdentitySync = (async () => {
      let accountProfile = null;
      try { accountProfile = await account.getProfile?.(); } catch { /* Offline: cached status may still be enough. */ }
      if(!account.status().signedIn||account.status().email!==expectedEmail||app.accountKey!==expectedKey||(window.RANKFORGE_APP&&window.RANKFORGE_APP!==app))return false;
      const changed = applyAccountIdentity(app, accountProfile);
      if (changed) {
        app.scheduleSave?.();
        app.render();
      }
      return changed;
    })().finally(() => { app.__rf115IdentitySync = null; });
    return app.__rf115IdentitySync;
  }

  if (typeof LiftoffApp !== "undefined") {
    const proto = LiftoffApp.prototype;
    const previous = {
      init: proto.init,
      render: proto.render,
      renderProfileEditModal: proto.renderProfileEditModal,
      renderV7Onboarding: proto.renderV7Onboarding,
      renderV77Personalization: proto.renderV77Personalization
    };

    if (typeof previous.renderProfileEditModal === "function") {
      proto.renderProfileEditModal = function(...args) {
        normalizeProfile(this);
        return removeUnsupportedProfile(previous.renderProfileEditModal.apply(this, args));
      };
    }
    if (typeof previous.renderV7Onboarding === "function") {
      proto.renderV7Onboarding = function(...args) {
        normalizeProfile(this);
        return removeUnsupportedProfile(previous.renderV7Onboarding.apply(this, args));
      };
    }
    if (typeof previous.renderV77Personalization === "function") {
      proto.renderV77Personalization = function(...args) {
        normalizeProfile(this);
        return removeUnsupportedProfile(previous.renderV77Personalization.apply(this, args));
      };
    }

    proto.render = function(...args) {
      if (this.state) {
        this.state.appVersion = VERSION;
        normalizeProfile(this);
        applyAccountIdentity(this);
      }
      const result = previous.render.apply(this, args);
      queueMicrotask(cleanProfileControls);
      return result;
    };

    proto.init = async function(...args) {
      await previous.init.apply(this, args);
      const changed = normalizeProfile(this);
      if (this.state) this.state.appVersion = VERSION;
      if (changed) this.scheduleSave?.();
      // Cached identity is applied during render; refresh independently of boot.
      syncAccountIdentity(this).catch(() => {});
      cleanProfileControls();
    };
  }

  window.RANKFORGE_ACCOUNT?.onChange?.(status => {
    if (status.signedIn) syncAccountIdentity(window.RANKFORGE_APP);
  });

  window.EVORANK115 = Object.freeze({
    version: VERSION,
    restoreFemaleLat: exactFemaleLat,
    syncAccountIdentity
  });
})();
