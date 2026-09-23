import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";
import { webcrypto } from "node:crypto";
const SYNC = fs.readFileSync("public/rankforge/assets/account-sync-v2.js", "utf8");
const BRIDGE = fs.readFileSync("public/rankforge/assets/account-bridge-v1.js", "utf8");
let pass = 0, fail = 0;
const check = (n, ok, d = "") => ok ? (pass++, console.log("ok    " + n)) : (fail++, console.log("FAIL  " + n + (d ? " — " + d : "")));

function makeEnv({ localState = null, cloudRow = null, confirmAnswer = true, cloudConsent = true } = {}) {
  const db = { row: cloudRow };
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://rankforge.test/index.html", runScripts: "outside-only",
    pretendToBeVisual: true, virtualConsole: new VirtualConsole()
  });
  const w = dom.window;
  Object.defineProperty(w, "crypto", { value: webcrypto, configurable: true });
  w.RANKFORGE_CLOUD = { supabaseUrl: "https://demo.supabase.co", supabasePublishableKey: "k" };
  w.confirm = () => confirmAnswer;
  const reloads = { count: 0 };
  const echterTimeout = w.setTimeout.bind(w);
  w.setTimeout = function (fn, ms) {
    // Der Reload nach dem Laden aus der Cloud laeuft ueber setTimeout(..., 1200).
    if (ms === 1200) { reloads.count++; return 0; }
    return echterTimeout(fn, ms);
  };
  w.fetch = async (url, options = {}) => {
    const path = String(url).replace("https://demo.supabase.co", "");
    const body = options.body ? JSON.parse(options.body) : {};
    const json = (s, d) => ({ ok: s < 300, status: s, text: async () => JSON.stringify(d) });
    if (path.includes("rf_state_load")) return db.row ? json(200, { found: true, revision: db.row.revision, payload: db.row.payload, updatedAt: "2026-08-24T10:00:00Z", deviceName: "iPhone" }) : json(200, { found: false, revision: 0 });
    if (path.includes("rf_state_save")) {
      if (!db.row) { db.row = { payload: body.p_payload, revision: 1 }; return json(200, { ok: true, revision: 1 }); }
      if (!body.p_force && db.row.revision !== body.p_revision) return json(200, { ok: false, conflict: true, serverRevision: db.row.revision, serverPayload: db.row.payload });
      db.row = { payload: body.p_payload, revision: db.row.revision + 1 };
      return json(200, { ok: true, revision: db.row.revision });
    }
    return json(200, {});
  };
  w.localStorage.setItem("rankforge-auth-v1", JSON.stringify({ access_token: "t", refresh_token: "r", expires_at: Date.now() + 3600000, email: "a@b.de", userId: "u1" }));
  w.localStorage.setItem("uprank-active-account", "felix");
  if (cloudConsent) w.localStorage.setItem("evorank-health-cloud-consent-v1", "accepted");
  if (localState) w.localStorage.setItem("uprank-training-v6:state:felix", JSON.stringify(localState));
  w.eval(SYNC); w.eval(BRIDGE);
  return { w, db, reloads };
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const localOf = w => JSON.parse(w.localStorage.getItem("uprank-training-v6:state:felix") || "null");

{ // Lokal Daten, Cloud leer -> hochladen
  const { w, db } = makeEnv({ localState: { workouts: [{ id: 1 }, { id: 2 }] } });
  await w.RANKFORGE_BRIDGE.reconcile(); await wait(200);
  check("lokal vorhanden, Cloud leer -> wird hochgeladen", db.row?.payload?.workouts?.length === 2);
  w.close();
}
{ // Cloud Daten, lokal leer -> herunterladen
  const { w, reloads } = makeEnv({ cloudRow: { payload: { workouts: [{ id: 9 }] }, revision: 4 } });
  await w.RANKFORGE_BRIDGE.reconcile(); await wait(1600);
  check("Cloud vorhanden, lokal leer -> wird geladen", localOf(w)?.workouts?.[0]?.id === 9);
  check("und die App wird neu geladen", reloads.count === 1);
  w.close();
}
{ // Beide unterschiedlich, Benutzer waehlt Cloud
  const { w } = makeEnv({ localState: { workouts: [{ id: 1 }] }, cloudRow: { payload: { workouts: [{ id: 7 }, { id: 8 }] }, revision: 3 }, confirmAnswer: true });
  await w.RANKFORGE_BRIDGE.reconcile(); await wait(1600);
  check("Konflikt + OK -> Cloud gewinnt lokal", localOf(w)?.workouts?.length === 2);
  w.close();
}
{ // Beide unterschiedlich, Benutzer waehlt Geraet
  const { w, db } = makeEnv({ localState: { workouts: [{ id: 1 }] }, cloudRow: { payload: { workouts: [{ id: 7 }, { id: 8 }] }, revision: 3 }, confirmAnswer: false });
  await w.RANKFORGE_BRIDGE.reconcile(); await wait(400);
  check("Konflikt + Abbrechen -> Gerät gewinnt in der Cloud", db.row.payload.workouts.length === 1);
  check("und lokal bleibt unverändert", localOf(w).workouts.length === 1);
  w.close();
}
{ // Nichts vorhanden
  const { w, db } = makeEnv({});
  await w.RANKFORGE_BRIDGE.reconcile(); await wait(200);
  check("beide leer -> nichts passiert", db.row === null);
  w.close();
}
{ // Ohne ausdrückliche Freigabe darf nichts übertragen werden
  const { w, db } = makeEnv({ localState: { workouts: [{ id: 1 }] }, cloudConsent: false });
  await w.RANKFORGE_BRIDGE.reconcile(); await wait(200);
  check("ohne Cloud-Freigabe bleibt der lokale Stand lokal", db.row === null);
  w.close();
}
{ // Netzfehler darf nicht stoeren
  const { w } = makeEnv({ localState: { workouts: [{ id: 1 }] } });
  w.fetch = async () => { throw new Error("Failed to fetch"); };
  let threw = false;
  try { await w.RANKFORGE_BRIDGE.reconcile(); } catch { threw = true; }
  check("Netzfehler wirft nicht nach außen", !threw);
  check("lokale Daten bleiben unangetastet", localOf(w).workouts.length === 1);
  w.close();
}
console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail ? 1 : 0);
