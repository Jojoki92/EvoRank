import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import {
  activitySport,
  decryptSecret,
  encryptSecret,
  normalizeActivity,
  webhookItems,
} from "../public/rankforge/netlify/functions/_garmin-common.mjs";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

function runtime108(source) {
  class LiftoffApp {}
  for (const method of ["renderHome", "renderRanks", "renderModal", "handleClick", "handleChange", "handleSubmit", "init"]) {
    LiftoffApp.prototype[method] = method.startsWith("render") ? () => "" : async () => {};
  }
  const animals = { swim:[["🫧", "Seepferdchen"]] };
  const context = {
    LiftoffApp,
    window:{ LiftoffApp, RANKFORGE_I18N:{ language:"de" }, RANKFORGE970:{ animals } },
    escapeHtml:value => String(value),
    escapeAttr:value => String(value),
    Object, Array, Set, Map, Math, Number, String, RegExp, Date, console,
  };
  vm.runInNewContext(source, context);
  return context.window.EVORANK108;
}

test("migrates existing rank choices without silently adding another sport", async () => {
  const api = runtime108(await read("assets/evorank-v10.8-r1.js"));
  const existing = { state:{ homeRanksV103:{ order:["strength"], selected:["strength"] } }, ui:{} };
  const migrated = api.ensureRankState(existing);
  assert.deepEqual(Array.from(migrated.homeOrder), ["strength"]);
  assert.deepEqual(Array.from(migrated.rankOrder), ["strength"]);

  const fresh = { state:{}, ui:{} };
  const defaults = api.ensureRankState(fresh);
  assert.deepEqual(Array.from(defaults.homeOrder), ["strength"]);
  assert.deepEqual(Array.from(defaults.rankOrder), ["strength", "swim"]);
});

test("ships and caches a real transparent seahorse pictogram", async () => {
  const [source, worker, image] = await Promise.all([
    read("assets/evorank-v10.8-r1.js"),
    read("service-worker.js"),
    readFile(new URL("assets/rank-icons/evorank-seahorse-v10.8.png", root)),
  ]);
  assert.match(source, /evorank-seahorse-v10\.8\.png/);
  assert.match(source, /firstSwimRank\[0\] = SEAHORSE_TOKEN/);
  assert.match(worker, /assets\/rank-icons\/evorank-seahorse-v10\.8\.png/);
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
  await access(new URL("assets/rank-icons/evorank-seahorse-v10.8.png", root));
});

test("configures authenticated same-origin Garmin endpoints and automatic refresh", async () => {
  const [config, client, account, netlify] = await Promise.all([
    read("garmin-connect-config.js"),
    read("assets/evorank-v10.8-r1.js"),
    read("assets/account-sync-v2.js"),
    read("netlify.toml"),
  ]);
  for (const route of ["connect", "status", "sync", "disconnect", "webhook"]) {
    assert.match(config, new RegExp(`/api/garmin/${route}`));
    assert.match(netlify, new RegExp(`/api/garmin/${route}`));
  }
  assert.match(client, /authorization:`Bearer \$\{token\}`/);
  assert.match(client, /setInterval\(run, intervalSeconds \* 1000\)/);
  assert.match(client, /visibilitychange/);
  assert.match(client, /addEventListener\("online", run\)/);
  assert.match(account, /getAccessToken: validToken/);
});

test("normalizes Garmin Activity API push and ping payloads", () => {
  const activity = {
    userId:"garmin-user-1",
    activityId:9981,
    activityType:{ typeKey:"lap_swimming" },
    startTime:"2026-08-27T08:00:00Z",
    distance:1500,
    duration:2100,
  };
  assert.equal(activitySport(activity), "swim");
  assert.deepEqual(normalizeActivity(activity), {
    external_id:"9981",
    sport:"swim",
    started_at:"2026-08-27T08:00:00.000Z",
    distance_m:1500,
    duration_s:2100,
    raw:activity,
  });
  const push = webhookItems({ activities:[activity] });
  assert.equal(push.length, 1);
  assert.equal(push[0].kind, "activity");
  assert.equal(push[0].garminUserId, "garmin-user-1");

  const ping = webhookItems({ userId:"garmin-user-1", callbackURL:"https://apis.garmin.com/pull/123" });
  assert.deepEqual(ping, [{ kind:"ping", garminUserId:"garmin-user-1", callbackUrl:"https://apis.garmin.com/pull/123" }]);
});

test("encrypts Garmin OAuth tokens and keeps Garmin tables server-only", async () => {
  process.env.GARMIN_TOKEN_ENCRYPTION_KEY = "test-only-encryption-key-with-at-least-32-characters";
  const encrypted = encryptSecret("refresh-token-secret");
  assert.notEqual(encrypted, "refresh-token-secret");
  assert.equal(decryptSecret(encrypted), "refresh-token-secret");

  const sql = await readFile(new URL("../db/SUPABASE-GARMIN-AUTO-SYNC-10.8.sql", import.meta.url), "utf8");
  for (const table of ["rf_garmin_connections", "rf_garmin_oauth_states", "rf_garmin_activities"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(sql, new RegExp(`revoke all on table public\\.${table} from anon, authenticated`, "i"));
  }
  assert.match(sql, /grant all on table public\.rf_garmin_connections to service_role/i);
});
