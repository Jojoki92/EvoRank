/**
 * Testet account-sync-v2.js gegen eine nachgebaute Supabase-Gegenstelle.
 * Prüft Passwortkonto, Token-Erneuerung, Cloud-Sicherung, Profil und Freunde.
 */
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";

const MODULE = fs.readFileSync("public/rankforge/assets/account-sync-v2.js", "utf8");
let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) { pass += 1; console.log("ok    " + name); }
  else { fail += 1; console.log("FAIL  " + name + (detail ? " — " + detail : "")); }
};

function makeServer() {
  const db = { row: null, profile: null, deleted: false };
  const calls = [];
  let tokenCounter = 0;
  return {
    db,
    calls,
    async fetch(url, options = {}) {
      const path = String(url).replace("https://demo.supabase.co", "");
      const body = options.body ? JSON.parse(options.body) : {};
      const headers = options.headers || {};
      const authed = String(headers.authorization || "").startsWith("Bearer ");
      calls.push({ path, body, headers });
      const json = (status, data) => ({
        ok: status >= 200 && status < 300,
        status,
        text: async () => JSON.stringify(data),
      });

      if (path.startsWith("/auth/v1/signup?")) {
        return json(200, { user: { id: "user-1", email: body.email } });
      }
      if (path.includes("grant_type=password")) {
        if (body.password === "falsch") return json(400, { error_description: "Invalid login credentials" });
        return json(200, {
          access_token: "token-1",
          refresh_token: "gueltiger-refresh",
          expires_in: 3600,
          user: { id: "user-1", email: body.email },
        });
      }
      if (path.includes("grant_type=refresh_token")) {
        if (body.refresh_token !== "gueltiger-refresh") return json(400, { error: "invalid_grant" });
        tokenCounter += 1;
        return json(200, {
          access_token: `erneuert-${tokenCounter}`,
          refresh_token: "gueltiger-refresh",
          expires_in: 3600,
        });
      }
      if (path.startsWith("/auth/v1/recover?")) return json(200, {});
      if (path.startsWith("/auth/v1/resend?")) return json(200, {});
      if (path === "/auth/v1/user" && options.method === "PUT") return json(200, { ok: true });
      if (path === "/auth/v1/user") return authed
        ? json(200, { id: "user-1", email: "athlet@example.com" })
        : json(401, { msg: "nicht angemeldet" });
      if (path.includes("rf_state_load")) {
        if (!db.row) return json(200, { found: false, revision: 0 });
        return json(200, {
          found: true,
          revision: db.row.revision,
          payload: db.row.payload,
          updatedAt: "2026-08-25T10:00:00Z",
          deviceName: db.row.device,
        });
      }
      if (path.includes("rf_state_save")) {
        if (!db.row) {
          db.row = { payload: body.p_payload, revision: 1, device: body.p_device_name };
          return json(200, { ok: true, revision: 1 });
        }
        if (!body.p_force && db.row.revision !== body.p_revision) {
          return json(200, {
            ok: false,
            conflict: true,
            serverRevision: db.row.revision,
            serverPayload: db.row.payload,
          });
        }
        db.row = { payload: body.p_payload, revision: db.row.revision + 1, device: body.p_device_name };
        return json(200, { ok: true, revision: db.row.revision });
      }
      if (path.includes("rf_profile_me")) return json(200, db.profile ? { found: true, profile: db.profile } : { found: false });
      if (path.includes("rf_profile_upsert")) {
        db.profile = { nickname: body.p_nickname, displayName: body.p_display_name };
        return json(200, { profile: db.profile });
      }
      if (path.includes("rf_profile_search")) return json(200, [{ id: "user-2", nickname: "stefan" }]);
      if (path.includes("rf_friend_request")) return json(200, { ok: true });
      if (path.includes("rf_friend_list")) return json(200, { friends: [], incoming: [], outgoing: [] });
      if (path.includes("rf_account_delete")) {
        db.row = null;
        db.profile = null;
        db.deleted = true;
        return json(200, { ok: true });
      }
      return json(200, { ok: true });
    },
  };
}

function boot(server, { configured = true, seed = {}, url = "https://rankforge.test/index.html" } = {}) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url,
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole(),
  });
  const { window } = dom;
  window.fetch = server.fetch;
  window.RANKFORGE_CLOUD = configured
    ? {
        supabaseUrl: "https://demo.supabase.co",
        supabasePublishableKey: "demo-key",
        authRedirectUrl: "https://evorank.netlify.app/index.html?auth=recovery&build=1070-r2",
      }
    : { supabaseUrl: "", supabasePublishableKey: "" };
  for (const [key, value] of Object.entries(seed)) window.localStorage.setItem(key, value);
  window.eval(MODULE);
  return window;
}

const validSession = JSON.stringify({
  access_token: "token-1",
  refresh_token: "gueltiger-refresh",
  expires_at: Date.now() + 3_600_000,
  email: "athlet@example.com",
  userId: "user-1",
});

{
  const server = makeServer();
  const window = boot(server, { configured: false });
  check("ohne Konfiguration: configured=false", window.RANKFORGE_ACCOUNT.status().configured === false);
  window.close();
}

{
  const server = makeServer();
  const window = boot(server, {
    url: "https://rankforge.test/index.html#access_token=recovery-token&refresh_token=recovery-refresh&expires_in=3600&type=recovery",
  });
  window.RANKFORGE_ACCOUNT.consumeCallback();
  check("Reset-Link bleibt als Passwort-Recovery markiert", window.RANKFORGE_ACCOUNT.status().passwordRecovery === true);
  check("Recovery-Tokens verschwinden aus der Adresszeile", window.location.hash === "");
  await window.RANKFORGE_ACCOUNT.updatePassword("recovery-passwort-2026");
  check("Recovery endet erst nach gespeichertem Passwort", window.RANKFORGE_ACCOUNT.status().passwordRecovery === false);
  window.close();
}

{
  const server = makeServer();
  const window = boot(server);
  check("frisch: nicht angemeldet", window.RANKFORGE_ACCOUNT.status().signedIn === false);
  check("kurzes Passwort wird abgelehnt", window.RANKFORGE_ACCOUNT.checkPassword("kurz", "a@b.de").includes("Mindestens"));
  check("E-Mail im Passwort wird abgelehnt", window.RANKFORGE_ACCOUNT.checkPassword("athlet-123456", "athlet@example.com").includes("E-Mail"));

  let invalidEmail = false;
  try { await window.RANKFORGE_ACCOUNT.signIn("keine-email", "starkes-passwort-98"); }
  catch { invalidEmail = true; }
  check("ungültige E-Mail wird abgelehnt", invalidEmail);

  const signup = await window.RANKFORGE_ACCOUNT.signUp("neu@example.com", "starkes-passwort-98");
  check("Registrierung verlangt Bestätigung", signup.confirmationRequired === true);
  check("Bestätigungslink führt zur aktuellen RankForge-App", server.calls.some(call =>
    call.path.startsWith("/auth/v1/signup?") &&
    new URLSearchParams(call.path.split("?")[1]).get("redirect_to") === "https://evorank.netlify.app/index.html?auth=recovery&build=1070-r2"
  ));

  await window.RANKFORGE_ACCOUNT.resendSignupConfirmation("neu@example.com");
  check("Bestätigungs-E-Mail kann erneut angefordert werden", server.calls.some(call =>
    call.path.startsWith("/auth/v1/resend?") && call.body.type === "signup" && call.body.email === "neu@example.com"
  ));

  let badLogin = "";
  try { await window.RANKFORGE_ACCOUNT.signIn("athlet@example.com", "falsch"); }
  catch (error) { badLogin = error.message; }
  check("falsche Zugangsdaten werden verständlich übersetzt", badLogin.includes("stimmt nicht"), badLogin);

  await window.RANKFORGE_ACCOUNT.signIn("athlet@example.com", "starkes-passwort-98");
  check("Passwort-Anmeldung erstellt eine Sitzung", window.RANKFORGE_ACCOUNT.status().signedIn === true);
  check("E-Mail wird normalisiert", window.RANKFORGE_ACCOUNT.status().email === "athlet@example.com");

  await window.RANKFORGE_ACCOUNT.requestPasswordReset("athlet@example.com");
  check("Passwort-Reset wird angefordert", server.calls.some(call => call.path.startsWith("/auth/v1/recover?")));
  check("Passwort-Reset führt immer zur aktuellen RankForge-App", server.calls.some(call =>
    call.path.startsWith("/auth/v1/recover?") &&
    new URLSearchParams(call.path.split("?")[1]).get("redirect_to") === "https://evorank.netlify.app/index.html?auth=recovery&build=1070-r2"
  ));
  await window.RANKFORGE_ACCOUNT.updatePassword("noch-staerker-2026");
  check("neues Passwort wird gespeichert", server.calls.some(call => call.path === "/auth/v1/user" && call.body.password));
  window.close();
}

{
  const server = makeServer();
  const window = boot(server, { seed: { "rankforge-auth-v1": validSession } });
  check("gespeicherte Sitzung wird geladen", window.RANKFORGE_ACCOUNT.status().signedIn === true);
  check("Cloud ist zunächst leer", (await window.RANKFORGE_ACCOUNT.pull()) === null);

  const first = await window.RANKFORGE_ACCOUNT.push({ workouts: [{ id: 1 }] });
  check("erster Upload klappt", first.ok === true && first.revision === 1);
  const loaded = await window.RANKFORGE_ACCOUNT.pull();
  check("Cloud liefert denselben Trainingsstand", loaded.payload.workouts[0].id === 1);

  const profile = await window.RANKFORGE_ACCOUNT.saveProfile({ nickname: "iron.bear", displayName: "Iron Bear" });
  check("Spitzname wird gespeichert", profile.nickname === "iron.bear");
  check("Status kennt den Spitznamen", window.RANKFORGE_ACCOUNT.status().nickname === "iron.bear");
  const found = await window.RANKFORGE_ACCOUNT.searchProfiles("ste");
  check("Freundessuche liefert Spitznamen", found[0].nickname === "stefan");
  await window.RANKFORGE_ACCOUNT.sendFriendRequest("stefan");
  check("Freundschaftsanfrage nutzt den normalisierten Spitznamen", server.calls.some(call => call.path.includes("rf_friend_request") && call.body.p_nickname === "stefan"));
  const friends = await window.RANKFORGE_ACCOUNT.listFriends();
  check("Freundeslisten werden normalisiert", Array.isArray(friends.friends) && Array.isArray(friends.incoming));

  window.localStorage.setItem("uprank-training-v6:state:test", "lokal");
  window.RANKFORGE_ACCOUNT.signOut();
  check("Abmelden entfernt die Sitzung", window.RANKFORGE_ACCOUNT.status().signedIn === false);
  check("Abmelden behält lokale Trainingsdaten", window.localStorage.getItem("uprank-training-v6:state:test") === "lokal");
  window.close();
}

{
  const server = makeServer();
  const expired = JSON.stringify({
    access_token: "alt",
    refresh_token: "gueltiger-refresh",
    expires_at: Date.now() - 1000,
    email: "athlet@example.com",
    userId: "user-1",
  });
  const window = boot(server, { seed: { "rankforge-auth-v1": expired } });
  await window.RANKFORGE_ACCOUNT.push({ test: true });
  check("abgelaufenes Token wird erneuert", JSON.parse(window.localStorage.getItem("rankforge-auth-v1")).access_token.startsWith("erneuert-"));
  window.close();
}

{
  const server = makeServer();
  const window = boot(server, { seed: { "rankforge-auth-v1": validSession } });
  await window.RANKFORGE_ACCOUNT.push({ daten: "da" });
  const result = await window.RANKFORGE_ACCOUNT.deleteAccount();
  check("Kontolöschung meldet Erfolg", result.ok === true);
  check("Kontolöschung entfernt Cloud-Daten", server.db.deleted === true && server.db.row === null);
  check("Kontolöschung meldet lokal ab", window.RANKFORGE_ACCOUNT.status().signedIn === false);
  window.close();
}

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
