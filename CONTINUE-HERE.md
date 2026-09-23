> Historischer Stand. Die aktuelle Übergabe steht in **CONTINUE-HERE-X3.md**.

# EVORANK – Fortsetzung und Wiederherstellung

## Aktueller Stand: EvoRank 10.11

Version 10.11 ergänzt persistentes Abmelden, Geburtsdatum und Geburtstagsbonus,
automatischen Cloud-Merge, zuverlässige Workout-Timer, direkten Übungstausch,
Alias-Suche, gewichtete Nebenmuskeln und das iPhone-Safe-Area-Layout. Details:
`EVORANK-RELEASE-NOTES-10.11.md`.

- Build: `1090-r3`
- Offline-Cache: `evorank-v10.9.0-r3`
- Schema: `35`
- Neu: Gym, Schwimmen, Laufen und Radfahren besitzen je eine echte Top-10-
  Bestenliste mit antippbaren sportbezogenen öffentlichen Profilen.
- Neu: Öffentliche Ranglistenprofile enthalten keine E-Mail und keine privaten
  Einzelworkouts. Beim Antippen werden nur Werte der gewählten Sportart gezeigt.
- Neu: 500 zusätzliche Dehn- und Mobilitätsvarianten mit Zeit-Tracking und
  Schnellfilter; sie beeinflussen den Gym-Rank nicht.
- Neu: Home und Ranks besitzen getrennte Sportauswahlen und Reihenfolgen. Home
  kann beispielsweise nur Gym anzeigen, während Ranks Gym und Schwimmen zeigt.
- Neu: Die gewählte Muskelgruppe wird getrennt für Home und Ranks gespeichert;
  ein Antippen in Ranks markiert deshalb nicht automatisch denselben Muskel auf Home.
- Neu: Der erste Schwimmrang Seepferdchen verwendet ein eigenes transparentes
  Tier-Piktogramm statt des alten Blasen-Platzhalters.
- Neu: Garmin OAuth 2.0, verschlüsselte serverseitige Tokens, Activity-Webhook,
  Supabase-Ablage und automatisches Nachladen sind implementiert. Die
  Produktivaktivierung benötigt Garmins Developer-Freigabe und Zugangsdaten;
  siehe `GARMIN-CONNECT-SETUP.md`.
- Neu: Die aktuell ausgewählte Muskelgruppe wird mit höherer Helligkeit, Sättigung, weißer Kontur und weichem Farbschein deutlich hervorgehoben. Normale Muskelfarben, Proportionen und beide Themes bleiben unverändert.
- Neu: Das Home-Bildschirm-, PWA- und Browser-Symbol verwendet den gewünschten dunklen Hintergrund mit pink-rotem Blitz und weißem Mittelteil. Versionsgebundene Dateinamen verhindern, dass iPhone oder Safari das alte Symbol aus dem Cache weiterverwenden.
- Neu: Konto-Bestätigung und Passwort-Reset verwenden automatisch die Domain, auf der EvoRank geöffnet wurde. Damit funktioniert dieselbe 10.7-Datei auf Netlify und Sites.
- Neu: `EVORANK-SUPABASE-GMAIL-ANLEITUNG-10.7.md` erklärt Custom SMTP, Gmail-App-Passwort, Netlify-Redirects, E-Mail-Bestätigung und SQL-Einrichtung anfängertauglich.
- Bestehend: Der sichtbare Produktname, die Startbilder und alle neuen Lieferpakete heißen **EvoRank**. Bestehende technische Speicher- und Rücksprungpfade bleiben kompatibel, damit Konten und Trainingsdaten nicht verloren gehen.
- Bestehend: In **Ränge anpassen** gibt es für die Startseite die Designoption **Mit Rahmen / Ohne Rahmen**. Ohne Rahmen werden nur die dominanten sportfarbenen Kartenflächen und Umrandungen neutral; kleine Sport-Akzente und alle anderen Ansichten bleiben erhalten.
- Neu: Der weibliche linke und rechte Latissimus verwenden eine gemeinsame, exakt gespiegelte Grundform; Fläche, Kontur und Antippbereich stimmen überein.
- Neu: Ein bis vier echte Ränge können gewählt und frei sortiert werden. Der erste Rang ist der Fokus.
- Neu: Ein Rang ist breit, zwei stehen nebeneinander, drei bilden eine Pyramide und vier ein 2×2-Raster.
- Neu: Die Rank-Seite zeigt genau die ausgewählten Gym-, Schwimm-, Lauf- und Rad-Ränge und öffnet die vollständige Leiter des angetippten Sports.
- Neu: iPhone-Abstände sind für 375, 390, 393 und 402 CSS-Pixel Breite abgesichert.
- Neu: gemeinsamer Trainingskalender für Gym, Schwimmen, Laufen und Radfahren.
- Neu: optionaler, progressiver Multi-Sport-Assistent ohne sichtbare Fragenanzahl.
- Neu: persönlicher Wochenplan aus Ziel, Zeit, Häufigkeit, Trainingstagen und sportabhängigen Angaben.
- Neu: echte Gym-, Schwimm-, Lauf- oder Rad-Rank-Karten auf der Startseite; die alten farbigen Bereichskarten sind entfernt.
- Neu: alle drei Ausdauer-Ränge im Rank-Bereich sowie geprüfte Profilkalibrierung für Männer und Frauen.
- Neu: prominente rote Abmeldeaktion, symmetrische Navigation und mehrstufig abgesichertes Verwerfen gespeicherter Workouts.
- Einstiegspunkte: `public/rankforge/assets/evorank-v10.9-r1.js` ergänzt Bestenlisten und Mobilitätsbibliothek; `public/rankforge/assets/evorank-v10.8-r1.js` trennt Home/Rank-Zustände und startet die Garmin-Aktualisierung; `public/rankforge/netlify/functions/garmin-*.mjs` bildet das sichere Garmin-Backend. Der technische Ordnername `public/rankforge/` bleibt zur Daten- und Installationskompatibilität bestehen.
- Bestehendes Design, Bodygraph, Rank-Logik, Konten, Freunde, Garmin und Offline-Funktion bleiben erhalten.

Bei der nächsten Fortsetzung zuerst `EVORANK-VERSION-10.9.json`, `EVORANK-RELEASE-NOTES-10.9.md`, `EVORANK-SUPABASE-LEADERBOARD-ANLEITUNG-10.9.md`, `GARMIN-CONNECT-SETUP.md` und danach bei Bedarf `EVORANK-SUPABASE-GMAIL-ANLEITUNG-10.7.md` lesen.

## Versionsregel

Jede ausgelieferte Aktualisierung erhält eine neue sichtbare Versionsnummer. Interne Zwischenstände werden nicht als Downloadnamen verwendet. Der vollständige Funktionsstand dieses Updates ist daher einheitlich als EVORANK 10.9 gekennzeichnet.

## Vorheriger Stand 9.9

Stand: 26. August 2026

Paketversion: RankForge 9.9

Technischer Kern: 9.2.0

Gemeinsamer Build/Cache: `990-r2` / `rankforge-v9.9.0-r2`

Öffentliche App: https://rankforge-app.rnanalytics-1093.chatgpt.site

## Aktueller Stabilitätsfix (Build 990-r2)

- Ein Passwort-Zurücksetzen-Link öffnet immer zuerst die Ansicht **Neues Passwort** und nicht den bereits bekannten Account.
- Der Recovery-Zustand bleibt während der Weiterleitung erhalten und endet erst, wenn das neue Passwort gespeichert oder der Vorgang ausdrücklich abgebrochen wurde.
- Der neue Service-Worker-Cache `rankforge-v9.9.0-r2` verhindert, dass installierte iPhone-/Homescreen-Versionen weiter die fehlerhafte Anmeldedatei aus dem alten Cache verwenden.

## Ausgangslage

RankForge 9.9 ist die geprüfte Zusammenführung zweier Entwicklungslinien mit gemeinsamem Ausgangsstand RankForge 9.6:

- RankForge 9.7: Sportbereich für Muskelaufbau, Schwimmen, Laufen und Radfahren, 27 Tier-Ränge, lokale Ausdauer-Workouts, Garmin-Dateiimport und vorbereitete serverseitige Garmin-OAuth-Anbindung.
- RankForge 9.8: Passwortkonto und Wiederherstellung, eindeutige Spitznamen, bestätigte Freundschaften, Links-/Rechts-Erfassung bei einseitigen Übungen sowie korrigierte Rank- und Volumenberechnung.

Keine der beiden Linien wurde pauschal über die andere kopiert. Die neuen Module werden nach dem stabilen Kern geladen: zuerst die 9.8-Konto- und Trainingsmodule, danach die gekapselte 9.7-Triathlon-Erweiterung.

## Enthaltene Funktionen

- Unverändertes RankForge-Grunddesign mit Bodygraph, Startspruch, Hell-/Dunkelmodus und anklickbaren Muskelgruppen.
- Einheitliche Wood-Startfarbe für Muskeln ohne Rank.
- Timer pro Workout ein-/ausschaltbar und Pausenzeit wählbar.
- Rollende Sieben-Tage-Streak mit ausgefüllter Flamme.
- Links-/Rechts-Sätze für einseitige Übungen; Rank aus dem Mittelwert der ausgefüllten Seiten, Volumen als Summe der tatsächlichen Seiten.
- Konto mit E-Mail/Passwort, E-Mail-Bestätigung, Passwort-Zurücksetzung und optionaler Supabase-Sicherung.
- Eindeutige Spitznamen und bestätigte Freundschaftsanfragen vor Freigabe von Trainings-Momentaufnahmen.
- Vier Sportkategorien: Muskelaufbau, Schwimmen, Laufen und Radfahren.
- Je neun Tier-Ränge für Schwimmen, Laufen und Radfahren, inklusive Fortschritt, 28-Tage-Werten, Verlauf und nächster Einheit.
- Lokaler Garmin-Import für JSON, TCX und GPX; direkte Synchronisierung nur nach Garmin-Freigabe und serverseitiger OAuth-Konfiguration.
- Sechs Offline-Sprachen: Deutsch, Englisch, Chinesisch, Hindi, Spanisch und Arabisch.

## Wichtige Einrichtung

Für Konto, Cloud-Sicherung und Freunde muss `db/SUPABASE-KONTO-FREUNDE-9.8.sql` im verwendeten Supabase-Projekt ausgeführt und geprüft werden. Für die vier Top-10-Listen kommt einmalig `db/SUPABASE-LEADERBOARDS-10.9.sql` dazu. Der Browser-Build enthält ausschließlich den dafür vorgesehenen Publishable-Key, niemals Service-Role- oder private Schlüssel.

Für die direkte Garmin-Verbindung gilt `GARMIN-CONNECT-SETUP.md`. Client Secret und Tokens bleiben serverseitig. Der lokale Dateiimport funktioniert unabhängig davon.

Trainingsdaten liegen vorrangig lokal in IndexedDB. Ein Quellcode-Backup enthält nicht automatisch die persönlichen Workouts eines Geräts. Dafür in der App unter **Profil → Daten & Hilfe → Backup** zusätzlich einen Export erstellen.

## Verbindliche Designregeln

- Design, Körper, Startspruch, Farben und Layout nur ändern, wenn der Nutzer es ausdrücklich verlangt.
- Mann und Frau müssen in Hell- und Dunkelmodus sauber mit dem Hintergrund verblenden; keine schwarzen Randlinien.
- Alle Muskelflächen bleiben proportional und antippbar.
- Rank-Icons behalten ihren bekannten aufwendigen Stil; nur Artefakte und unruhige Ränder bereinigen.
- Die aktive Navigation wird nur mit der Akzentfarbe markiert, ohne zusätzliche Kachel.
- Onboarding zeigt immer nur eine Frage und einen Fortschrittsbalken, niemals die sichtbare Fragenanzahl.
- Nach visuellen Änderungen echte Screenshots aus der App zeigen.

## Projektstruktur

- `public/rankforge/` – direkt deploybare PWA/Netlify-Version.
- `public/rankforge/assets/triathlon-v9.7.js` und `.css` – gekapselte Sport-/Triathlon-Erweiterung.
- `public/rankforge/assets/account-*-v2.js`, `rf93-unilateral-v1.js`, `rf93-friends-v1.js` – Konto-, Freunde- und Links-/Rechts-Erweiterungen.
- `db/SUPABASE-KONTO-FREUNDE-9.8.sql` – Cloud-Datenbanksetup.
- `MERGE-MANIFEST-9.9.md` und `VERSION-9.9.json` – verbindliche Beschreibung des gemeinsamen Releases.
- `tests/` – Release- und Integrationstests.

## Prüfen

```bash
npm install
npm test
node tests/test-account.mjs
node tests/test-bridge.mjs
node tests/test-ui.mjs
node public/rankforge/tools/security-audit.mjs
npm run lint
```

Die fertige Windows-Version benötigt beim Endnutzer kein separat installiertes Node.js.

## In einem neuen Chat fortsetzen

Diese vollständige Backup-ZIP hochladen und folgenden Auftrag senden:

> Öffne zuerst `CONTINUE-HERE.md`, danach `EVORANK-VERSION-10.9.json`, `EVORANK-RELEASE-NOTES-10.9.md`, `EVORANK-SUPABASE-LEADERBOARD-ANLEITUNG-10.9.md` und `GARMIN-CONNECT-SETUP.md`. Setze exakt bei EVORANK 10.9 / technischem Kern 9.2.0 / Build 1090-r3 fort. Alte technische Speicherpfade bleiben nur zur Datenkompatibilität bestehen. Verändere das bestehende Design nur dort, wo ich es ausdrücklich sage. Zeige nach visuellen Änderungen echte App-Screenshots und erstelle wieder Netlify-, Windows- und vollständige Backup-Dateien.

Falls persönliche Trainingsdaten benötigt werden, zusätzlich den separaten Export aus der App hochladen.
