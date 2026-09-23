# Paketumfang, Vollständigkeit und Quellen

## Enthalten

- Vollständiger versionierter Projekt-Snapshot einschließlich versteckter Projektkonfiguration, npm-Lockfile, aktiver und historisch erhaltener Quellmodule, Tests, SQL, Serverfunktionen, iOS-Quellen, Assets, Packskripte und Lizenzhinweise.
- Alle 36 aktuellen transparenten App-Icons plus deren ausgewählte hochauflösende Generierungsmaster, mit Zuordnung zum Exportmanifest.
- Bestehende Körperbilder/Masken, ursprüngliche Rangtafeln und Brand-Master aus dem Quellprojekt.
- Freigegebener Entwurf `evorank-kompetenzfarben-entwurf.png` samt zugehörigem Prompt als zusätzliche Gestaltungsreferenz. Der ältere, vom Nutzer als zu wenig verändert kritisierte Fortschrittsentwurf ist nicht der maßgebliche Entwurf.
- Aktueller Gesamtüberblick, offene Aufgaben, Cloud-/iPhone-Anleitung, Architektur-/Designentscheidungen, Test-/Lieferworkflow und rechtliche Lücken.
- Git-Commitliste, Datei-Manifest mit Hash/Bytes/ZIP-Zuordnung und prüfbarer Größenbericht.

Die Themen-ZIPs enthalten Dateien unter derselben Wurzel `EVORANK-UEBERGABE-X5.7/`. Es gibt keine mehrfach verteilten Projektdateien, die sich beim Zusammenführen mit verschiedenen Inhalten überschreiben könnten. Neue Übergabetexte erscheinen sowohl als Einstieg in `00-UEBERGABE/` als auch an ihrem versionierten Dokumentationsort in `projekt/docs/uebergabe-x5.7/`; das sind bewusst verschiedene Pfade.

## Nicht enthalten und warum

- `node_modules`, Buildcaches, `.sites-runtime`, `.local-backup`, duplizierte entpackte Releases: reproduzierbar bzw. nur lokale Arbeitsdaten; nicht erforderlich für den Quellstand.
- `.git` mit vollständigem historischem Objektbestand: Übergabe ist ein Quell-Snapshot. Der lokale Originalcheckout behält den echten Verlauf; die Commitliste macht historische Versionen nachvollziehbar, ersetzt aber kein Git-Backup.
- Persönliche Screenrecordings, Audiodateien, unkuratierte Screenshots/Uploads, Browserprofile, echte Trainings/Accounts, Datenbankbackups, `.env`-Secrets, Tokens und Zertifikate: weder notwendig noch für die Weitergabe als allgemeines KI-Paket bestimmt.
- Unversionierte fremde Restdateien: `docs/EVORANK-X5.4-HTTP-CHECK.json` und übriges `output/` werden nicht pauschal aufgenommen. Nur die ausdrücklich bezeichnete freigegebene Designreferenz aus `output/designs/` ist enthalten.
- Vollständiges ursprüngliches Chatprotokoll: Die Übergabe ist eine fachliche Zusammenfassung der sichtbaren Anforderungen und verifizierten Dateien, kein vorgetäuschtes Volltranskript.
- Apple-Zertifikate, `.ipa`, fertiges Xcode-Projekt, echte Supabase-/Netlify-/Garmin-/Strava-Zugangsdaten: liegen nicht als freigegebene fertige Artefakte vor.

## Herkunft der Aussagen

- Aktueller Code sowie `AGENTS.md`, `CONTINUE-HERE-X5.7.md`, `EVORANK-X5.7-ANLEITUNG.md`.
- `docs/EVORANK-X5.7-VALIDIERUNG.md` und die vier Prüf-/Exportberichte, `docs/EVORANK-X5.7-RECHTSCHECK.md`.
- Versionshistorie in `CONTINUE-HERE-X4.*.md`, `CONTINUE-HERE-X5.*.md` und Releaseanleitungen – nur für die Entwicklungsgeschichte.
- Aktuelle fachliche Regeln in AGENTS; Details/Herkunft der Modelle in `docs/EVORANK-X4.7-ALTER.md`, `docs/EVORANK-X4.8-AUSDAUER.md` und Rangmodulen.
- Integrationen: `docs/EVORANK-X4.5-VERBINDUNGEN.md`, `docs/BESTENLISTEN-EINRICHTEN-X5.4.md`, konkrete Netlify-/SQL-Dateien.
- Native iOS-Dateien und deren README. Historische App-Store-Entwürfe müssen gegen den tatsächlich vorhandenen Bestand geprüft werden.
- Nutzerentscheidungen aus der Projektarbeit: deutsches Feedback, einheitlicher Appstil, Apple als einzige Optik, Geräte-/Accountgrenzen ehrlich darstellen, transparente Badge-Assets, Gewicht/Alter/Größe im Profil, kein erfundener Größenbonus, lokale Git-/Releasefreigabe.

## Widersprüche älterer Unterlagen auflösen

- X4.3 beschreibt frühere Muskelaggregation; heute gilt 70/30 aus X4.5 und AGENTS.
- X5.1/X5.3 beschreiben Masken für Rangtafeln; heute individuelle PNGs aus X5.7.
- X5.6 beschreibt dunkle Badge-Kacheln und CSS-Brightness; heute transparente Kacheln und direkte SVG-Füllung.
- Alte Readmes nennen fehlenden Windows-Build; später wurde Vinext direkt auf Windows erfolgreich gebaut.
- Alte „nächste Version“-Zeilen sind historisch. Aktuelle App X5.7, nächste App-Lieferung X5.8.
- Alter App-Store-Text nennt Vorbereitungen; tatsächlich existieren Swift-Bausteine ohne signiertes Xcode-Gesamtprojekt.

Beim Weiterarbeiten einen Widerspruch anhand des aktuellen Codes und der jüngsten Nutzerentscheidung lösen, nicht still den ältesten Text befolgen.
