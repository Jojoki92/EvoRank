import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

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
