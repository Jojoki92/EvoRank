import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("identifies every public surface as EvoRank 10.11", async () => {
  const [html, version, worker] = await Promise.all([
    read("index.html"),
    read("version.txt"),
    read("service-worker.js"),
  ]);
  assert.match(html, /name="evorank-build" content="10\.11\.0"/);
  assert.equal(version.trim(), "10.11");
  assert.match(worker, /evorank-v10\.11\.0-r1/);
  assert.doesNotMatch(html, /build=(?:980-r1|920-r16-1)/);
  assert.doesNotMatch(worker, /build=(?:980-r1|920-r16-1)/);
});

test("loads the merged 9.8 modules before the 9.7 triathlon extension", async () => {
  const html = await read("index.html");
  const order = [
    "account-sync-v2.js",
    "account-bridge-v1.js",
    "account-ui-v2.js",
    "rankforge-v9.2.0.js",
    "rankforge-v9.2.0-patch.js",
    "rf93-unilateral-v1.js",
    "rf93-friends-v1.js",
    "triathlon-v9.7.js",
  ].map(name => html.indexOf(name));
  assert.ok(order.every(position => position > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(html, /garmin-connect-config\.js\?build=1110-r1/);
  assert.match(html, /triathlon-v9\.7\.css\?build=1020-r1/);
  assert.doesNotMatch(html, /account-(?:sync|ui)-v1\.js/);
});

test("caches all exclusive assets from both merged versions", async () => {
  const worker = await read("service-worker.js");
  for (const asset of [
    "account-sync-v2.js",
    "account-ui-v2.js",
  ]) {
    assert.match(worker, new RegExp(`${asset.replaceAll(".", "\\.")}\\?build=1110-r1`));
  }
  for (const asset of [
    "rf93-unilateral-v1.js",
    "rf93-friends-v1.js",
    "triathlon-v9.7.css",
    "triathlon-v9.7.js",
  ]) {
    assert.match(worker, new RegExp(`${asset.replaceAll(".", "\\.")}\\?build=1020-r1`));
  }
  assert.match(worker, /garmin-connect-config\.js\?build=1110-r1/);
});

test("keeps account/friends and triathlon state in separate namespaces", async () => {
  const [triathlon, account, friends, unilateral] = await Promise.all([
    read("assets/triathlon-v9.7.js"),
    read("assets/account-sync-v2.js"),
    read("assets/rf93-friends-v1.js"),
    read("assets/rf93-unilateral-v1.js"),
  ]);
  assert.match(triathlon, /app\.state\.triathlon/);
  assert.match(triathlon, /window\.RANKFORGE970/);
  assert.match(triathlon, /const VERSION = "10\.2"/);
  assert.match(account, /signIn/);
  assert.match(friends, /bestätigten Freunden/);
  assert.match(unilateral, /bothSidesVolume/);
});

test("keeps password recovery in its own UI until a new password is saved", async () => {
  const [account, accountUi] = await Promise.all([
    read("assets/account-sync-v2.js"),
    read("assets/account-ui-v2.js"),
  ]);
  assert.match(account, /rankforge-password-recovery-v1/);
  assert.match(account, /passwordRecovery:\s*recoveryPending/);
  assert.match(account, /cancelPasswordRecovery/);
  assert.match(accountUi, /status\.passwordRecovery/);
  assert.match(accountUi, /data-rf92-form="neues-passwort"/);
});
