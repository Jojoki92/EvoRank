import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";
import { webcrypto } from "node:crypto";
import { TextEncoder } from "node:util";

const SYNC = fs.readFileSync("public/rankforge/assets/account-sync-v2.js", "utf8");
const UI = fs.readFileSync("public/rankforge/assets/account-ui-v2.js", "utf8");
let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => ok
  ? (pass += 1, console.log("ok    " + name))
  : (fail += 1, console.log("FAIL  " + name + (detail ? " — " + detail : "")));

function env({ configured = true, session = null, existingProfile = true, url = "https://rankforge.test/index.html" } = {}) {
  const calls = [];
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url,
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole(),
  });
  const { window } = dom;
  Object.defineProperty(window, "crypto", { value: webcrypto, configurable: true });
  Object.defineProperty(window, "TextEncoder", { value: TextEncoder, configurable: true });
  window.RANKFORGE_CLOUD = configured
    ? { supabaseUrl: "https://demo.supabase.co", supabasePublishableKey: "key" }
    : { supabaseUrl: "", supabasePublishableKey: "" };
  window.rf85EnsureLocalAccount = email => `account-${String(email).split("@")[0]}`;
  let cloudConsent = false;
  window.RANKFORGE_BRIDGE = {
    pushNow: async () => ({ ok: true }),
    reconcile: async () => ({ ok: true }),
    cloudConsent: () => cloudConsent,
    setCloudConsent: value => (cloudConsent = Boolean(value)),
  };
  window.fetch = async (url, options = {}) => {
    const path = String(url).replace("https://demo.supabase.co", "");
    const body = options.body ? JSON.parse(options.body) : {};
    calls.push({ path, body });
    const json = (status, data) => ({ ok: status < 300, status, text: async () => JSON.stringify(data) });
    if (path.startsWith("/auth/v1/signup?")) return json(200, { user: { id: "user-1", email: body.email } });
    if (path.includes("grant_type=password")) return json(200, {
      access_token: "token",
      refresh_token: "refresh",
      expires_in: 3600,
      user: { id: "user-1", email: body.email },
    });
    if (path.startsWith("/auth/v1/recover?")) return json(200, {});
    if (path.startsWith("/auth/v1/resend?")) return json(200, {});
    if (path === "/auth/v1/user") return json(200, { id: "user-1", email: "athlet@example.com" });
    if (path.includes("rf_profile_me")) return json(200, existingProfile
      ? { found: true, profile: { nickname: "ironbear", displayName: "Iron Bear" } }
      : { found: false });
    if (path.includes("rf_profile_upsert")) return json(200, {
      profile: { nickname: body.p_nickname, displayName: body.p_display_name },
    });
    if (path.includes("rf_state_load")) return json(200, { found: false, revision: 0 });
    return json(200, { ok: true });
  };
  if (session) window.localStorage.setItem("rankforge-auth-v1", session);
  window.eval(SYNC);
  window.eval(UI);
  return { window, calls };
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const root = window => window.document.querySelector(".rf92");
const visible = window => Boolean(root(window)) && root(window).hidden === false;
const validSession = JSON.stringify({
  access_token: "token",
  refresh_token: "refresh",
  expires_at: Date.now() + 3_600_000,
  email: "athlet@example.com",
  userId: "user-1",
});

{
  const { window, calls } = env({
    url: "https://rankforge.test/index.html#access_token=recovery-token&refresh_token=recovery-refresh&expires_in=3600&type=recovery",
  });
  await wait(120);
  check("Reset-Link zeigt Neues Passwort statt den alten Account", visible(window) && window.document.body.textContent.includes("Neues Passwort"));
  const form = window.document.querySelector('[data-rf92-form="neues-passwort"]');
  form.querySelector('[name="password"]').value = "recovery-passwort-2026";
  form.querySelector('[name="password2"]').value = "recovery-passwort-2026";
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await wait(180);
  check("neues Passwort wird aus dem Recovery-Formular gespeichert", calls.some(call => call.path === "/auth/v1/user" && call.body.password === "recovery-passwort-2026"));
  check("nach dem Speichern öffnet sich die App", !visible(window));
  window.close();
}

{
  const { window } = env({ configured: false });
  await wait(50);
  check("ohne Cloud-Konfiguration erscheint keine Kontooberfläche", root(window) === null);
  window.close();
}

{
  const { window } = env();
  await wait(50);
  check("abgemeldet: Anmeldebildschirm erscheint", visible(window));
  check("E-Mail- und Passwortfelder sind vorhanden", Boolean(window.document.querySelector("input[name=email]") && window.document.querySelector("input[name=password]")));
  check("Cloud-Sicherung verlangt eine ausdrückliche Freigabe", Boolean(window.document.querySelector('input[name="cloudConsent"][required]')));
  check("Registrierung ist erreichbar", window.document.body.textContent.includes("Neues Konto anlegen"));
  check("Passwort-Reset ist erreichbar", window.document.body.textContent.includes("Passwort vergessen"));
  const styles = window.document.getElementById("rf92-styles").textContent;
  check("iPhone-Safe-Area ist berücksichtigt", styles.includes("safe-area-inset"));
  check("iOS-Zoomschutz nutzt 16px", styles.includes("font-size:16px"));
  window.close();
}

{
  const { window, calls } = env();
  await wait(50);
  window.document.querySelector('[data-rf92="zu-registrieren"]').click();
  const form = window.document.querySelector('[data-rf92-form="registrieren"]');
  form.querySelector('[name="email"]').value = "neu@example.com";
  form.querySelector('[name="password"]').value = "starkes-passwort-98";
  form.querySelector('[name="password2"]').value = "starkes-passwort-98";
  form.querySelector('[name="cloudConsent"]').checked = true;
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await wait(120);
  check("Registrierung sendet E-Mail und Passwort", calls.some(call => call.path.startsWith("/auth/v1/signup?") && call.body.email === "neu@example.com" && call.body.password));
  check("danach erscheint die Bestätigungsansicht", window.document.body.textContent.includes("Konto angelegt"));
  check("Bestätigungsansicht bietet erneutes Senden", window.document.body.textContent.includes("Bestätigungs-E-Mail erneut senden"));
  window.document.querySelector('[data-rf92="bestaetigung-neu-senden"]').click();
  await wait(120);
  check("erneutes Senden nutzt Supabase signup-resend", calls.some(call => call.path.startsWith("/auth/v1/resend?") && call.body.type === "signup"));
  window.close();
}

{
  const { window } = env();
  await wait(50);
  const form = window.document.querySelector('[data-rf92-form="anmelden"]');
  form.querySelector('[name="email"]').value = "athlet@example.com";
  form.querySelector('[name="password"]').value = "starkes-passwort-98";
  form.querySelector('[name="cloudConsent"]').checked = true;
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await wait(250);
  check("Passwort-Anmeldung öffnet die App", !visible(window));
  check("lokaler Datenbereich wird gesetzt", window.localStorage.getItem("rankforge-device-session-v1") === "account-athlet");
  check("aktives Konto wird gesetzt", window.localStorage.getItem("uprank-active-account") === "account-athlet");
  window.close();
}

{
  const { window } = env({ session: validSession, existingProfile: false });
  await wait(200);
  check("neues Konto fragt nach einem Spitznamen", window.document.body.textContent.includes("Dein Spitzname"));
  check("erklärt, dass Freunde die E-Mail nicht sehen", window.document.body.textContent.includes("E-Mail-Adresse") && window.document.body.textContent.includes("sieht niemand"));
  window.close();
}

{
  const { window } = env({ session: validSession });
  await wait(200);
  check("bestehendes Konto überspringt die Anmeldung", !visible(window));
  window.RANKFORGE_ACCOUNT_UI.open();
  await wait(30);
  check("Konto-Fenster zeigt E-Mail und Spitznamen", window.document.body.textContent.includes("athlet@example.com") && window.document.body.textContent.includes("@ironbear"));
  check("Konto-Fenster bietet Sichern, Abmelden und Löschen", window.document.body.textContent.includes("Jetzt sichern") && window.document.body.textContent.includes("Abmelden") && window.document.body.textContent.includes("löschen"));
  window.RANKFORGE_ACCOUNT_UI.close();
  check("Konto-Fenster lässt sich schließen", [...window.document.querySelectorAll(".rf92")].every(node => node.hidden));
  window.close();
}

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
