# EvoRank X5.2 – lokale Validierung, 14.09.2026

## Fehler und Korrektur

Der neue Test `tests/evorank-startup.test.mjs` reproduzierte vor der Korrektur exakt den gemeldeten TypeError in `installSeahorse()` während der `init()`-Kette. Die Ursache war ein getter-only Arrayelement aus `rank-art-x5.1.js`, das der ältere Initialisierer beschreiben wollte.

Die gemeinsamen Rangdaten bleiben jetzt beschreibbar. Alle betroffenen Renderpfade fragen das neue Artwork über `RANKFORGE970.rankBadge()` ab. Jede Darstellung bekommt weiterhin eigene SVG-Filter-/Masken-IDs. Generator und generierte Datei stimmen überein. Kein Eingriff in Rangformeln, Muskelgrafiken, Kontoschlüssel oder PWA-Identität.

## Ergebnisse

- `npm.cmd run test:x5`: **95/95 bestanden**. Der neue Starttest führt die vollständige Initialisierung aus, zeigt das Onboarding und lädt in einem frischen Dokument gespeicherte lokale Testdaten. Home wird gerendert, gespeicherte Workouts einschließlich XP und der Coin-Kontostand bleiben erhalten. Schwimm-, Lauf- und Fahrradränge zeigen alle neun Abzeichen ohne doppelte SVG-IDs.
- `.\node_modules\.bin\vinext.cmd build`: erfolgreich (Vite 8.0.13). Bestehender Vinext-Hinweis: Die Route `/` lässt sich statisch nicht klassifizieren.
- `node scripts/smoke-release.mjs`: **178 lokale HTTP-Ressourcen erfolgreich**, Version X5.2. Eigenen Testserver danach beendet. Bericht: `EVORANK-X5.2-HTTP-CHECK.json`.

## Grenzen

Die Startprüfung läuft in JSDOM mit echten App-Initialisierern, Renderern und dem vorhandenen localStorage-Fallback des Repositorys. Externe Konto-/Netzwerk-/Geräte-APIs sind Testdoubles; IndexedDB und Service-Worker-Lebenszyklus wurden nicht in einem echten Browser ausgeführt. Keine privaten Nutzerdaten gelesen oder verändert. Keine Live-Cloud-, Hosting-, iPhone- oder App-Store-Prüfung, keine Veröffentlichung.

Die vorherigen 94 isolierten Funktionsprüfungen erfassten den Startablauf nicht; ihr Erfolg war kein Nachweis für einen erfolgreichen App-Start. Der neue Starttest gehört dauerhaft zum Release-Gate.

## Auslieferung

`release:prepare` erstellt WINDOWS und NETLIFY; `release:save` prüft jede kopierte Datei per SHA-256. Der bestätigte Speicherbeleg liegt nach erfolgreichem Speichern unter `delivery/EVORANK-X5.2-SAVED.json`. Bestehende Releases werden nicht überschrieben. Für X5.2 wird standardmäßig kein zusätzliches ZIP erzeugt.
