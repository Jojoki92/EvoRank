import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const MODULE = fs.readFileSync("public/rankforge/assets/account-local-v10.7-r2.js", "utf8");

function boot(email = "new.user@example.com") {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://evorank.example/index.html",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.eval(`
    var config = { allowedAccounts: { "rankforge-local": { name: "Athlet", email: "" } } };
    var registry = { version: 1, accounts: [] };
    var rf85NormalizeEmail = value => String(value || "").trim().toLowerCase();
    var rf85ValidEmail = value => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(rf85NormalizeEmail(value));
    var rf85HashEmail = value => rf85NormalizeEmail(value) === "second@example.com" ? "secondhash" : "firsthash";
    var rf85NameFromEmail = value => rf85NormalizeEmail(value).split("@")[0];
    var rf85HandleFromEmail = value => "@" + rf85NormalizeEmail(value).split("@")[0];
    var rf85ReadRegistry = () => registry;
    var rf85WriteRegistry = next => { registry = JSON.parse(JSON.stringify(next)); return true; };
    var rf85ExistingAccountKey = value => Object.entries(config.allowedAccounts).find(([, account]) => account.email === rf85NormalizeEmail(value))?.[0] || "";
    var rf85InjectAccount = record => { config.allowedAccounts[record.key] = { ...record }; return record.key; };
    var rf85EnsureLocalAccount = () => "";
    var rf75AccountKeyForEmail = rf85EnsureLocalAccount;
    var rf75Account = key => config.allowedAccounts[key] || null;
    var safeStorageGet = (key, area) => (area === "sessionStorage" ? sessionStorage : localStorage).getItem(key);
    var rf75ReadSession = () => "rankforge-local";
  `);
  window.RANKFORGE_ACCOUNT = { status: () => ({ signedIn: true, email }) };
  window.eval(MODULE);
  return window;
}

test("new Supabase users receive separate deterministic local areas", () => {
  const window = boot();
  assert.equal(window.EVORANK_LOCAL_ACCOUNTS.ensure(" New.User@Example.com "), "local-firsthash");
  assert.equal(window.EVORANK_LOCAL_ACCOUNTS.ensure("second@example.com"), "local-secondhash");
  assert.notEqual(
    window.EVORANK_LOCAL_ACCOUNTS.ensure("new.user@example.com"),
    window.EVORANK_LOCAL_ACCOUNTS.ensure("second@example.com")
  );
  window.close();
});

test("the signed-in user is injected before app startup", () => {
  const window = boot("new.user@example.com");
  window.localStorage.setItem("rankforge-device-session-v1", "local-firsthash");
  assert.equal(window.eval("rf75ReadSession()"), "local-firsthash");
  assert.equal(window.eval("config.allowedAccounts['local-firsthash'].email"), "new.user@example.com");
  window.close();
});

test("invalid addresses never receive a local area", () => {
  const window = boot();
  assert.equal(window.EVORANK_LOCAL_ACCOUNTS.ensure("not-an-email"), "");
  window.close();
});
