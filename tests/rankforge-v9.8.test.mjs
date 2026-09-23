import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { JSDOM, VirtualConsole } from "jsdom";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const readProject = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("loads every 9.8 package module before the merged 9.7 triathlon module", async () => {
  const html = await read("index.html");
  const patchPosition = html.indexOf("rankforge-v9.2.0-patch.js");
  const unilateralPosition = html.indexOf("rf93-unilateral-v1.js");
  const friendsPosition = html.indexOf("rf93-friends-v1.js");
  const triathlonPosition = html.indexOf("triathlon-v9.7.js");

  assert.ok(patchPosition > 0);
  assert.ok(unilateralPosition > patchPosition);
  assert.ok(friendsPosition > unilateralPosition);
  assert.ok(triathlonPosition > friendsPosition);
  assert.match(html, /account-sync-v2\.js[\s\S]*account-bridge-v1\.js[\s\S]*account-ui-v2\.js/);
  assert.doesNotMatch(html, /account-sync-v1\.js/);
});

test("keeps left and right set values separate while ranking by the per-side average", async () => {
  const source = await read("assets/rf93-unilateral-v1.js");
  class LiftoffApp {}
  for (const method of ["renderWorkoutExercise", "handleInput", "handleClick", "toggleSet", "addSet"]) {
    LiftoffApp.prototype[method] = function () {};
  }
  const context = {
    LiftoffApp,
    document: { readyState: "loading", addEventListener() {}, getElementById() { return null; } },
    console,
  };
  context.window = context;
  vm.runInNewContext(source, context);

  const api = context.RANKFORGE93_UNILATERAL;
  assert.ok(api);
  assert.equal(api.isUnilateral({ tracking: "weight-reps", executionMode: "unilateral" }), true);
  assert.equal(api.isUnilateral({ tracking: "weight-reps", executionMode: "bilateral", name: "Einarmiges Rudern" }), false);

  const set = { weightKg: 20, reps: 10 };
  api.convertSet(set, true);
  assert.deepEqual({ ...set.left }, { weightKg: 20, reps: 10 });
  assert.deepEqual({ ...set.right }, { weightKg: 20, reps: 10 });
  set.left = { weightKg: 22, reps: 8 };
  set.right = { weightKg: 18, reps: 10 };
  api.syncDerived(set);
  assert.equal(set.weightKg, 20);
  assert.equal(set.reps, 9);
  assert.equal(api.bothSidesVolume(set), 356);
});

test("ships password accounts, profile nicknames and confirmed-friend APIs", async () => {
  const sync = await read("assets/account-sync-v2.js");
  const ui = await read("assets/account-ui-v2.js");
  const friends = await read("assets/rf93-friends-v1.js");

  assert.match(sync, /grant_type=password/);
  assert.match(sync, /requestPasswordReset/);
  assert.match(sync, /saveProfile/);
  assert.match(sync, /sendFriendRequest/);
  assert.match(sync, /acceptFriendRequest/);
  assert.match(sync, /listFriends/);
  assert.match(ui, /Konto anlegen/);
  assert.match(ui, /Dein Spitzname/);
  assert.match(ui, /Deine E-Mail-Adresse\s+sieht niemand/);
  assert.match(friends, /bestätigten Freunden/);
  assert.match(friends, /Annehmen/);
  assert.match(friends, /Ablehnen/);
});

test("account v2 validates passwords and uses authenticated RPC calls", async () => {
  const source = await read("assets/account-sync-v2.js");
  const calls = [];
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://rankforge.test/index.html",
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole(),
  });
  const { window } = dom;
  window.RANKFORGE_CLOUD = {
    supabaseUrl: "https://demo.supabase.co",
    supabasePublishableKey: "publishable-key",
  };
  window.fetch = async (url, options = {}) => {
    const path = String(url).replace("https://demo.supabase.co", "");
    const body = options.body ? JSON.parse(options.body) : {};
    calls.push({ path, body, headers: options.headers || {} });
    const response = data => ({ ok: true, status: 200, text: async () => JSON.stringify(data) });
    if (path.includes("grant_type=password")) {
      return response({
        access_token: "access",
        refresh_token: "refresh",
        expires_in: 3600,
        user: { id: "user-1", email: "athlet@example.com" },
      });
    }
    if (path === "/auth/v1/user") return response({ id: "user-1", email: "athlet@example.com" });
    if (path.includes("rf_profile_me")) return response({ found: false });
    if (path.includes("rf_friend_list")) return response({ friends: [], incoming: [], outgoing: [] });
    return response({ ok: true });
  };
  window.eval(source);

  assert.match(window.RANKFORGE_ACCOUNT.checkPassword("short", "a@b.de"), /Mindestens/);
  await window.RANKFORGE_ACCOUNT.signIn("athlet@example.com", "starkes-passwort-98");
  assert.equal(window.RANKFORGE_ACCOUNT.status().signedIn, true);
  await window.RANKFORGE_ACCOUNT.listFriends();
  const friendCall = calls.find(call => call.path.includes("rf_friend_list"));
  assert.ok(friendCall);
  assert.match(String(friendCall.headers.authorization), /^Bearer access$/);
  dom.window.close();
});

test("blocks internal source folders in the deployable Netlify package", async () => {
  const redirects = await read("_redirects");
  assert.match(redirects, /\/docs\/\*\s+\/index\.html\s+404/);
  assert.match(redirects, /\/tools\/\*\s+\/index\.html\s+404/);
  assert.match(redirects, /\/native\/\*\s+\/index\.html\s+404/);
});

test("includes the authenticated Supabase schema required by account v2", async () => {
  const sql = await readProject("db/SUPABASE-KONTO-FREUNDE-9.8.sql");
  for (const name of [
    "rf_state_load",
    "rf_state_save",
    "rf_account_delete",
    "rf_profile_me",
    "rf_profile_upsert",
    "rf_profile_publish",
    "rf_profile_search",
    "rf_friend_request",
    "rf_friend_accept",
    "rf_friend_decline",
    "rf_friend_remove",
    "rf_friend_list",
  ]) {
    assert.match(sql, new RegExp(`function public\\.${name}\\(`));
  }
  assert.match(sql, /grant execute[\s\S]+to authenticated/);
  assert.match(sql, /revoke all[\s\S]+from public, anon/);
  assert.match(sql, /rankforge_friend_pair_unique/);
  assert.doesNotMatch(sql, /grant execute[\s\S]+to anon/);
});
