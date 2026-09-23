/* EVORANK 10.7 r2 — lokale Datenbereiche fuer bestaetigte Cloud-Konten.
 *
 * Aeltere RankForge-Schichten beschraenkten lokale Profile auf drei Testkonten.
 * Die Supabase-Anmeldung ist inzwischen oeffentlich; deshalb erhaelt jetzt jede
 * gueltige, bestaetigte E-Mail-Adresse wieder einen deterministischen lokalen
 * Bereich. Bestehende Legacy-Konten und deren Daten bleiben unveraendert.
 */
(function installAuthenticatedLocalAccounts() {
  "use strict";

  const PUBLIC_FALLBACK_KEY = "rankforge-local";

  function ensureAuthenticatedLocalAccount(email) {
    const normalized = typeof rf85NormalizeEmail === "function"
      ? rf85NormalizeEmail(email)
      : String(email || "").trim().toLowerCase();
    if (typeof rf85ValidEmail !== "function" || !rf85ValidEmail(normalized)) return "";

    const existing = typeof rf85ExistingAccountKey === "function"
      ? rf85ExistingAccountKey(normalized)
      : "";
    if (existing && existing !== PUBLIC_FALLBACK_KEY) return existing;

    if (
      typeof rf85ReadRegistry !== "function" ||
      typeof rf85WriteRegistry !== "function" ||
      typeof rf85InjectAccount !== "function" ||
      typeof rf85HashEmail !== "function"
    ) return "";

    const registry = rf85ReadRegistry();
    let record = (registry.accounts || []).find(item =>
      rf85NormalizeEmail(item?.email) === normalized
    );
    if (!record) {
      record = {
        key: `local-${rf85HashEmail(normalized)}`,
        email: normalized,
        name: typeof rf85NameFromEmail === "function" ? rf85NameFromEmail(normalized) : "Athlet",
        handle: typeof rf85HandleFromEmail === "function" ? rf85HandleFromEmail(normalized) : "@athlet",
        location: "",
        createdAt: new Date().toISOString()
      };
      registry.accounts ||= [];
      registry.accounts.push(record);
      rf85WriteRegistry(registry);
    }
    return rf85InjectAccount(record);
  }

  // Die alten, spaeter geladenen Freigabelisten gezielt durch die oeffentliche
  // Kontoabbildung ersetzen. account-ui-v2 greift zur Laufzeit auf diese
  // Bindung zu und kann damit auch neue Supabase-Nutzer oeffnen.
  if (typeof rf85EnsureLocalAccount !== "undefined") {
    rf85EnsureLocalAccount = ensureAuthenticatedLocalAccount;
  }
  if (typeof rf75AccountKeyForEmail !== "undefined") {
    rf75AccountKeyForEmail = ensureAuthenticatedLocalAccount;
  }

  if (typeof rf75ReadSession !== "undefined") {
    rf75ReadSession = function readAuthenticatedLocalSession() {
      const stored = typeof safeStorageGet === "function"
        ? safeStorageGet("rankforge-device-session-v1", "sessionStorage") ||
          safeStorageGet("rankforge-device-session-v1") || ""
        : "";
      if (stored && typeof rf75Account === "function" && rf75Account(stored)) return stored;

      const email = window.RANKFORGE_ACCOUNT?.status?.().email || "";
      return ensureAuthenticatedLocalAccount(email) || PUBLIC_FALLBACK_KEY;
    };
  }

  // Bei einem normalen Neuladen kennt das Konto-Modul die E-Mail bereits.
  // So ist der lokale Bereich angelegt, bevor die eigentliche App startet.
  const currentEmail = window.RANKFORGE_ACCOUNT?.status?.().email || "";
  if (currentEmail) ensureAuthenticatedLocalAccount(currentEmail);

  window.EVORANK_LOCAL_ACCOUNTS = Object.freeze({
    version: "10.7-r2",
    ensure: ensureAuthenticatedLocalAccount
  });
})();
