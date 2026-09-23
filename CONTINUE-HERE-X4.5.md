# EvoRank X4.5 · Persönliches Training und verständliche Einstellungen

Aktuelle Version **X4.5 / x4.5-r1**, nächste Lieferung X4.6.
Die X4.4-Abschlussmarkierungen bleiben erhalten. Alle Übungs-IDs, technischen
Speicherschlüssel, Kontoanbindung, PWA-Identität und bisherige Origins bleiben bestehen.

## Was geändert wurde

- `getMuscleStatuses` in `evorank-v10.11-r1.js`: bester Beitrag 70 %, maximal
  drei weitere zusammen 30 %. Die Unterstützungsgewichte sind 1 / (Index + 1)^0,25.
  Bei einem einzigen Beitrag gilt 100 %. Nebenmuskel-Transfer bleibt 58 %.
  Beispiel 480 + 300 → 426 statt 398. Das ist eine Produktentscheidung, kein
  wissenschaftlich normierter Muskelkraftwert. Beste Übung und historische XP bleiben erhalten.
- `evorank-x2-ranks.js` und `evorank-x2-ui.js`: sichtbarer unbestätigter Kabelstandard
  1:1; Modellname; opt-in Standard für neue Kabelübungen in `settings.x45CableDefault`.
  Eigene Übungseinstellungen haben Vorrang. Fertige Sätze behalten ihre damalige
  Konfiguration. Keine pauschale Technogym-Übersetzung ohne genaue Modellangabe.
- `evorank-x4.5.js`: Lautstärke 0–100 %, Testsignal und eine einheitliche Audio-
  Wiedergabekette; Plan-/Ist-Woche mit lokalen Kalendertagen und passenden Startaktionen.
- `evorank-x4.5-ui.css`: nur etwas mehr graue Deckkraft im vorhandenen weichen
  Hintergrund. Feine schwarze Frauenkonturen; Männerkonturen werden anhand der
  echten Masken in `rankforge-v9.2.0-patch.js` gezeichnet. Hit-Flächen bleiben unsichtbar.
- `rf93-friends-v1.js`: 30-Sekunden-Aktualisierung im Vordergrund, Zeitstempel,
  manueller Abruf und Schutz vor verspäteten Antworten eines anderen Kontos.
- `strava-x4.5.js`, `netlify/functions/strava-*.mjs`, `_strava-common.mjs` und
  `db/SUPABASE-STRAVA-X4.5.sql`: optionale OAuth-Anbindung an bestehendes Supabase/
  Netlify. Browsergebundener einmaliger OAuth-State, AES-GCM-Tokenablage,
  Aktualisierungssperre gegen konkurrierende Refreshes, max. 500 Aktivitäten/
  90 Tage, 5-Minuten-Cache, Trennen mit Widerruf. Keine Tokens im Browser.
  Strava bleibt **nur im persönlichen Kalender**, außerhalb von Leistungsrängen.
- `calendar-plan-v10.0.js`: persönliche Strava-Aktivitäten in der vorhandenen
  Kalenderquelle. Garmin und lokale Workouts bleiben angebunden. Keine unsichere
  heuristische Zusammenführung verschiedener Provider: gleiche Aktivität nur aus
  einer Quelle importieren.
- `native/ios/`: Audiofelder werden von der Web-Bridge nicht mehr verworfen;
  lokale Benachrichtigungsplanung mit Generationen, AVAudioSession und Freigabe
  nach kurzem Ton; Native-Origin-Prüfung; keine Phantom-Live-Activities bei
  Configure-Nachrichten; Endzeit-Countdown im Widget; Swift-Text-Aufruf korrigiert.
  **Kein nativer Build/Signierung auf Windows**. Für Installation braucht es
  Xcode, App-/Widget-Targets, App Group, Signierung und einen echten iPhone-Test.

## Dateien und Prüfung

- In-App-Hilfe: `public/rankforge/hilfe-x4.5.html`.
- Nutzeranleitung: `EVORANK-X4.5-ANLEITUNG.md`.
- Übergabe an Felix: `FELIX-START-HIER-X4.5.md`.
- Servereinrichtung: `docs/EVORANK-X4.5-VERBINDUNGEN.md`.
- `npm.cmd run test:x4`: **52 Tests**, einschließlich neuem Verhalten und
  Strava-Serverlogik mit simulierten HTTP-/Datenbankantworten.
- `.\node_modules\.bin\vinext.cmd build`: vollständiger Windows-Framework-Build.
- Prüfbericht: `docs/EVORANK-X4.5-VALIDATION.json`.

Keine echte Cloud-/OAuth-Kontoverbindung, keine SQL-Migration, Veröffentlichung,
visuelle Browserprüfung oder Geräteprüfung behaupten. Der Nutzer hat diese
Version als lokale Dateien bestellt. Die bestehenden Online-Dienste werden
erst nach Betreiber-Einrichtung nutzbar; keine Zugangsdaten sind im Paket.

## Ablage

Weiterhin `npm.cmd run release:prepare`, danach `npm.cmd run release:save`:
entpackt unter `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x4\`.
**Für diese Lieferung ausdrücklich zusätzlich angefordert:**
`EVORANK-X4.5-FELIX-CODE.zip` unter `EvoRank\ZIP\x\x4\` mit dem kompletten
Quellpaket einschließlich Lockfile, Tests, SQL, Windows-Startern und iOS-Code.
Keine node_modules, privaten Browserdaten, lokalen Backups oder .env-Dateien.
ZIP bleibt ein ausdrücklich angeforderter Zusatz, kein geänderter Standard.
