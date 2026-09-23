# Lokale Einrichtung für die Weiterentwicklung

Stand: 7. September 2026. App-Version: X4.1 / `x4.1-r1`.

## Arbeitsordner und Herkunft

Der aktive Codex-Projektordner ist:

```text
C:\Users\johan\OneDrive\Dokumente\ChatGPT\EvoRank
```

Übernommen aus:

```text
C:\Users\johan\OneDrive\Dokumente\EvoRank\Other\EVORANK-X4.1-CODEX-PROJEKT.zip
```

399 Projektdateien wurden direkt in den Arbeitsordner entpackt. App-Code,
Grafiken, Tests, SQL-Skripte, Windows-Starter, iOS-Quellen und die vorhandene
Hosting-Konfiguration stammen aus diesem Archiv. Die Einrichtung selbst
ändert weder das App-Verhalten noch die Versionsnummer.

Das Original ist unverändert unter
`.local-backup/EVORANK-X4.1-CODEX-PROJEKT.zip` gesichert. Die SHA-256-Prüfsumme
von Original und Kopie ist identisch:

```text
eff1e7ff2ad8b994be924fefab4884bbf80e8325cb5ab00607fc8c53572d8b1a
```

Das Archiv enthält zwei Git-Commits: `3b06788` (X4) und `4d1881a` (X4.1).
Frühere Git-Versionen sind laut `CONTINUE-HERE-X4.md` nicht mehr vollständig
verfügbar. Die zusätzlich entpackten Git-Daten liegen unter
`.local-backup/git-history/`.
Die beiden Commits sind außerdem im aktiven Repository verfügbar.
Der Arbeitsbranch `codex/evorank-x4.1` beginnt bei `4d1881a`.
Die Einrichtung ergänzt die README, diese Dokumentation und den Git-Ausschluss
für lokale Sicherungen; der App-Quellstand entspricht weiterhin dem Import.

## Entwicklung unter Windows

Node.js v24.19.0 und npm 11.17.0 sind auf diesem Rechner vorhanden und erfüllen
die Projektvorgabe Node.js >=22.13. Der npm-Lockfile bleibt maßgeblich.

```powershell
npm.cmd ci
npm.cmd run test:x4
npm.cmd run preview:app
```

Die Vorschau läuft unter `http://127.0.0.1:8123/`. Sie kann auch direkt mit
`node packaging/windows/EVORANK-NODE-SERVER.mjs` gestartet werden.
`EVORANK_NO_OPEN=1` unterdrückt bei Bedarf das automatische Öffnen des Browsers.
Keinen zweiten Server auf derselben Adresse starten.
Bei der Einrichtung antwortete dort bereits eine ältere Instanz mit
`EvoRank X4 / build=x4-r1`. Diese alte Serverinstanz vor dem regulären Start
der neuen Arbeitskopie schließen. Der lokale Starttest verwendete deshalb
vorübergehend Port 18123; dieser Testserver wurde anschließend beendet.

`npm run build`, `dev`, `lint` und `install:ci` enthalten bisher Linux-spezifische
Shell-Aufrufe beziehungsweise Umgebungsvariablen-Syntax. Für den ursprünglichen
vollständigen Framework-Build ist eine separate Linux-/WSL-Umgebung erforderlich.
WSL und RTK sind auf diesem Rechner derzeit nicht installiert. Für Änderungen an
der statischen PWA sind der Node-Vorschauserver und `test:x4` direkt unter Windows
nutzbar.

## Hier tatsächlich geprüft

- `npm.cmd ci`: erfolgreich, 537 Pakete anhand des vorhandenen Lockfiles installiert.
- `npm.cmd run test:x4`: alle 12 Tests bestanden, keine fehlgeschlagenen Tests.
  Darunter sind Rangberechnungen für alle 1.500 Übungen, Kabelzug-Einstellungen,
  Workout-Reihenfolge, Datenerhalt und PWA-Dateiverweise.
- Lokaler Node-Server: App-Einstieg und X4.1-Stylesheet antworten mit HTTP 200;
  `version.txt` meldet `EvoRank X4.1 / build=x4.1-r1`.
- Git-Vergleich: keine Änderungen am übernommenen App-Code, Lockfile oder den
  Integrations- und Hosting-Dateien.
- Kein vollständiger Framework-Build in dieser Windows-Umgebung, keine
  Browser-Sichtprüfung, keine echten Konto-/Garmin-/Handytests und kein Deployment.

npm meldete noch nicht freigegebene Installationsskripte für mehrere Build-Werkzeuge.
Die aktuellen PWA-Tests und der Node-Vorschauserver funktionieren trotzdem.
Vor der Einrichtung eines vollständigen Framework-Builds sind die benötigten
Installationsskripte in dessen Zielumgebung zu prüfen und gegebenenfalls freizugeben.

## Daten und bestehende Dienste

- Das Archiv enthält 1.500 Übungen und die zugehörigen App-Ressourcen, aber keine
  privaten Trainingsaufzeichnungen vom Handy.
- Browser-Speicher gehört zur jeweiligen App-Adresse und zum Browserprofil.
  Ein Export/Import über die App überträgt vorhandene persönliche Daten.
- Die statische Vorschau startet keine Netlify-Funktionen. Garmin-OAuth,
  Webhooks und produktive E-Mail-Dienste benötigen ihre bestehende Serverumgebung.
- Supabase-SQL und Vorlagen sind vorhanden; die Einrichtung führt keine SQL-Dateien
  aus und richtet keine Cloud-Dienste neu ein.
- Die ursprüngliche Sites-ID bleibt erhalten. Laut bisheriger Übergabe war die
  Site dort nicht abrufbar; die lokale Einrichtung prüft diesen alten Befund nicht neu.

## Aktualisierung X4.2

Der anschließende X4.2-Arbeitsstand hat 27 aktuelle Tests und den vollständigen
Vinext-Build direkt unter Windows bestanden:
`.\node_modules\.bin\vinext.cmd build`. Die oben dokumentierten Build-Grenzen
betreffen den ursprünglichen Import und dessen Bash-Starter. Installationsskripte
mussten für diesen erfolgreichen direkten Build nicht zusätzlich freigegeben werden.
Der aktuelle Katalog enthält 1.501 Einträge einschließlich der neuen Preacher-Maschine.

## Weiterarbeiten

Vor fachlichen Änderungen `AGENTS.md` und `CONTINUE-HERE-X4.2.md` lesen.
In Codex können Änderungen jetzt direkt für dieses Projekt beauftragt werden.
Das nächste ausgelieferte App-Update erhält X4.3. Die lokalen Einrichtungshinweise
sind kein neues App-Release.
