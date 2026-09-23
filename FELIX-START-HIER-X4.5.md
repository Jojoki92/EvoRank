# Hallo Felix – hier ist der vollständige EvoRank-Quellstand X4.5

## Lokal ansehen

1. ZIP vollständig in einen eigenen Ordner entpacken. Es enthält
   `EVORANK-X4.5-CODEX-PROJEKT/` mit App, Assets, Quellcode, Lockfile und Tests.
2. Node.js >= 22.13 installieren. In diesem Ordner `npm ci` ausführen.
3. `npm run preview:app` startet die vollständige App unter
   `http://127.0.0.1:8123/`. Falls der Port belegt ist, alte EvoRank-Instanz schließen.
4. `npm run test:x4` prüft 52 aktuelle Fälle. Unter Windows:
   `.\node_modules\.bin\vinext.cmd build`; unter Linux/WSL `npm run build`.

Der native iPhone-Code braucht zusätzlich einen Mac, Xcode, passende Targets und
Signierung. Strava/Garmin/Freunde funktionieren online erst mit den zugehörigen
eigenen Serverkonten und Freigaben. Es sind keine privaten Zugangsdaten oder
Trainingsdaten von Johan im Codepaket enthalten. `node_modules` wird durch
`npm ci` aus dem mitgelieferten Lockfile erzeugt.

## Wo du anfangen solltest

| Aufgabe | Datei(en) |
|---|---|
| Aktueller Stand und Regeln | `AGENTS.md`, `CONTINUE-HERE-X4.5.md` |
| Tatsächliche App / Ladefolge | `public/rankforge/index.html` |
| Historische Basis und Erweiterungen | `assets/rankforge-v9.2.0.js` und danach geladene Module |
| Aktuelle Übungsränge / Lastumrechnung | `assets/evorank-x2-ranks.js`, `assets/strength-standards-x4.2.js` |
| Muskelaggregation | `getMuscleStatuses` in `assets/evorank-v10.11-r1.js` |
| Workout-Editor / Geräte | `assets/evorank-x2-ui.js`, `assets/evorank-x4.1-ui.css` |
| Grün für erledigte Sätze | `assets/evorank-x4.4-ui.css` |
| Neue Woche / Ton / Hilfe | `assets/evorank-x4.5.js`, `assets/evorank-x4.5-ui.css` |
| Übungsfamilien | `assets/exercise-families-x4.3.js` |
| Freunde / Konto | `assets/rf93-friends-v1.js`, `assets/account-*.js`, `db/` |
| Strava | `assets/strava-x4.5.js`, `netlify/functions/strava-*.mjs`, `_strava-common.mjs` |
| iPhone-Bausteine | `public/rankforge/native/ios/` |
| Framework-Hülle | `app/`, `vite.config.ts`, vorhandene Sites-Integration |
| Speicherung der Release-Dateien | `scripts/save-release.mjs`, `packaging/release-targets.json` |

`assets/`-Pfade in der Tabelle beziehen sich auf `public/rankforge/`.
Die komplette Quellenliste und SHA-256-Prüfung der ZIP liegt zusätzlich in
`QUELLCODE-DATEILISTE.json` im Quellordner (die Dateiliste selbst ist ausgenommen).

## Beim Optimieren wichtig

Die App enthält historisch viele hintereinander geladene Prototype-Erweiterungen.
Die tatsächliche Ladefolge entscheidet, welche Implementierung aktiv ist.
Vor einer Bereinigung erst das aktuelle Verhalten mit den vorhandenen Tests
absichern. Keine alte Datei nur wegen ihres Versionsnamens entfernen.

- IDs, Local-Storage-Keys, PWA-Scope/ID/Start-URL und bestehende Origins erhalten.
- Workout-Historie, verdiente XP und Belohnungen nicht beim Neuberechnen verändern.
- Kraftdaten verwenden aktuelle Vergleichsprofile, aber damaliges Körpergewicht
  sowie damalige Kabel-/Maschineneinstellungen.
- Öffentliches Ranking und persönliche Strava-Importe getrennt halten.
- Supabase-Service-Key und OAuth-Secrets ausschließlich auf dem Server.
- Frauenrücken nicht spiegeln: die Grafik ist asymmetrisch.

Die absoluten Ablagepfade in `packaging/release-targets.json` gehören zu Johans PC.
Auf deinem Rechner **vor `release:save`** eigene Ziele eintragen. Zum bloßen
Ansehen/Optimieren sind `release:prepare` und `release:save` nicht notwendig.

X4.5 wurde mit 52 Tests, darunter simulierten HTTP-/Datenbankantworten für Strava,
und dem Windows-Framework-Build geprüft. Kein realer iPhone-/Swift-Build,
Account-/OAuth-End-to-End-Test oder Deployment wurde durchgeführt.
