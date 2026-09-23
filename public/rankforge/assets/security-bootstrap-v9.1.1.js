(() => {
  "use strict";
  // terminal.local is the supervised in-chat preview origin. It is intentionally
  // HTTP inside the isolated preview network; public deployments still upgrade.
  if (location.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]", "terminal.local"].includes(location.hostname)) {
    location.replace(`https://${location.host}${location.pathname}${location.search}${location.hash}`);
    return;
  }
  const raw = window.RANKFORGE_CLOUD && typeof window.RANKFORGE_CLOUD === "object" ? window.RANKFORGE_CLOUD : {};
  const key = String(raw.supabasePublishableKey || "").trim();
  let blocked = false;
  let reason = "";
  if (/^sb_secret_/i.test(key)) {
    blocked = true;
    reason = "Supabase Secret Key darf nicht im Browser stehen";
  } else if (/service[_-]?role/i.test(key)) {
    blocked = true;
    reason = "Supabase Service-Role-Key darf nicht im Browser stehen";
  } else if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (String(payload.role || "").toLowerCase() === "service_role") {
        blocked = true;
        reason = "Legacy Service-Role-Key wurde blockiert";
      }
    } catch { /* opaque publishable keys are expected */ }
  }
  if (blocked) {
    window.RANKFORGE_CLOUD = Object.freeze({ ...raw, supabasePublishableKey: "" });
    console.error(`[RANKFORGE] ${reason}`);
  }
  window.RANKFORGE_CLOUD_SECURITY = Object.freeze({ blocked, reason, checkedAt: new Date().toISOString() });
  window.RANKFORGE_SECURITY_BUILD = Object.freeze({ version: "9.0.0", csp: true, encryptedBackups: true, uploadMagicCheck: true });
})();
