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

  // X6.1: Die drei ältesten Konten haben ihre Daten unter festen Schlüsseln.
  // account-ui-v2 ordnet sie über denselben E-Mail-Hash zu. Ohne diese Zuordnung
  // öffnete ein Neustart einen leeren Bereich und die Cloud-Freigabe griff nie.
  const LEGACY_HASHES = {
    e7bf8f26186df9752cdd375325b2908e7bb6bfd7e5b3a0923d199eeddb950a67: "johannes",
    "21e84e6d2126f3f255a5f27c247a14eefb5d9ec822ff005242a0d8cbae091205": "stefan",
    "1c8c5753363689a63e91e3ac9a7a8636cee98152b7b9b9cbdd120d3caac5afc4": "felix"
  };

  function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const length = bytes.length, total = ((length + 9 + 63) >> 6) << 6, data = new Uint8Array(total);
    data.set(bytes); data[length] = 0x80;
    const view = new DataView(data.buffer);
    view.setUint32(total - 4, length * 8); view.setUint32(total - 8, Math.floor(length / 0x20000000));
    const W = new Uint32Array(64), rot = (x, n) => (x >>> n) | (x << (32 - n));
    for (let offset = 0; offset < total; offset += 64) {
      for (let i = 0; i < 16; i++) W[i] = view.getUint32(offset + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rot(W[i - 15], 7) ^ rot(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        const s1 = rot(W[i - 2], 17) ^ rot(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0;
        const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((value, i) => { H[i] = (H[i] + value) >>> 0; });
    }
    return H.map(value => value.toString(16).padStart(8, "0")).join("");
  }

  function legacyKey(normalized) {
    try { return LEGACY_HASHES[sha256Hex(normalized)] || ""; } catch { return ""; }
  }

  function ensureAuthenticatedLocalAccount(email) {
    const normalized = typeof rf85NormalizeEmail === "function"
      ? rf85NormalizeEmail(email)
      : String(email || "").trim().toLowerCase();
    if (typeof rf85ValidEmail !== "function" || !rf85ValidEmail(normalized)) return "";
    const legacy = legacyKey(normalized);
    if (legacy) return legacy;

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
    ensure: ensureAuthenticatedLocalAccount,
    sha256Hex
  });
})();
