import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../public/rankforge/", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("uses current redirect query for signup and password recovery", async () => {
  const [sync, cloud] = await Promise.all([read("assets/account-sync-v2.js"), read("cloud-config.js")]);
  assert.match(sync, /authPath\("\/auth\/v1\/signup"\)/);
  assert.match(sync, /authPath\("\/auth\/v1\/recover"\)/);
  assert.match(sync, /redirect_to=\$\{encodeURIComponent\(redirectTarget\(\)\)\}/);
  assert.doesNotMatch(sync, /email_redirect_to/);
  assert.match(cloud, /build=1100-r1/);
});

test("lets an unconfirmed user resend the signup confirmation", async () => {
  const [sync, ui] = await Promise.all([read("assets/account-sync-v2.js"), read("assets/account-ui-v2.js")]);
  assert.match(sync, /resendSignupConfirmation/);
  assert.match(sync, /authPath\("\/auth\/v1\/resend"\)/);
  assert.match(sync, /type: "signup"/);
  assert.match(ui, /Bestätigungs-E-Mail erneut senden/);
  assert.match(ui, /email_not_confirmed/);
  assert.match(ui, /Spam\/Junk/);
});

