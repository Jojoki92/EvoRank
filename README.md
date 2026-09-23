# EvoRank X5.7

Dieser Ordner enthält den vollständigen Projektstand X5.7
(`x5.7-r1`) für die weitere Entwicklung in Codex. Die App liegt in
`public/rankforge/`; Framework, Grafiken, Datenbankskripte, Integrationen und
Tests sind ebenfalls enthalten. Das nächste App-Update ist X5.7.

## Lokal starten

Fertige Versionen werden direkt entpackt unter
`C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x<major>\X<release>\` gespeichert.
Die Windows-App X5.7 liegt unter `x5\X5.7\EVORANK-X5.7-WINDOWS`.
Start: `EVORANK-STARTEN.bat` (ohne Node). ZIP-Dateien entstehen nur noch auf Wunsch.
Der Ablauf ist in `scripts/save-release.mjs` und `packaging/release-targets.json`
hinterlegt: nach Tests und Build `npm.cmd run release:prepare`, danach
`npm.cmd run release:save`. Der zweite Schritt kann eine Dateisystemfreigabe
für den gewünschten Ordner außerhalb des Arbeitsbereichs benötigen.

Für die Weiterentwicklung: Node.js ab 22.13. In Windows PowerShell:

```powershell
npm.cmd ci
npm.cmd run test:x5
npm.cmd run preview:app
```

`npm.cmd ci` wird nur bei der ersten Einrichtung oder nach Änderungen am Lockfile
benötigt. Die statische App-Vorschau selbst benötigt nur Node.js.
In anderen Shells kann `npm` statt `npm.cmd` verwendet werden.

Die Vorschau öffnet `http://127.0.0.1:8123/`. Das Terminal geöffnet lassen;
zum Beenden `Strg+C` drücken. Bei der Einrichtung lief auf dieser Adresse
bereits EvoRank X4: Diese ältere Serverinstanz vor dem Start der Arbeitskopie
schließen. Änderungen werden aus den Quelldateien geladen;
anschließend die Seite neu laden. Ein vorhandener Service Worker kann alte
Dateien zwischenspeichern. Für die Entwicklung gegebenenfalls in den
Browser-Entwicklertools den Service Worker für Netzwerkanfragen umgehen
("Bypass for network"), ohne Website-Daten zu löschen.

Die Vorschau dient der PWA-Entwicklung. Netlify-Serverfunktionen werden damit
nicht ausgeführt. Der bestehende vollständige Framework-Build
(`npm run build`) benötigt die Linux-/WSL-Werkzeuge seiner Shell-Skripte.
Unter Windows funktioniert derselbe Build direkt mit
`.\node_modules\.bin\vinext.cmd build`.

## Im Code weiterarbeiten

| Bereich | Einstieg |
| --- | --- |
| App-Einstieg und geladene Dateien | `public/rankforge/index.html` |
| Aktuelle Rangberechnung | `public/rankforge/assets/evorank-x2-ranks.js` |
| Workout-, Profil- und Muskelansichten | `public/rankforge/assets/evorank-x2-ui.js` |
| Aktueller Workout-Stil | `public/rankforge/assets/evorank-x4.1-ui.css` |
| Grafiken und App-Symbole | `public/rankforge/assets/`, `icons/`, `splash/` |
| Konten, Garmin und Serverfunktionen | `public/rankforge/netlify/functions/` |
| Supabase-Datenbankskripte | `db/` |
| Framework und Hosting | `app/`, `worker/`, `vite.config.ts` |
| 129 aktuelle Prüfungen | Aktuelles X5.7-Verhalten und Strava-Serverlogik über `npm run test:x5` |
| Live-Tracking | `public/rankforge/assets/endurance-tracker-x4.2.js` |
| Aktuelle Ansichten | `public/rankforge/assets/evorank-x5.1-ui.css`, `interface-x5.5.js` |
| Vollständiger Katalog-Audit | `npm run audit:x4.2` |

Die Dateinamen mit X2 sind weiterhin Teil der aktuellen App. Ältere
Versionsanleitungen sind historisch; die aktuelle Übergabe hat Vorrang.

- [Aktuelle Projektübergabe](CONTINUE-HERE-X5.7.md)
- [Felix: Code ansehen und optimieren](FELIX-START-HIER-X4.5.md)
- [Strava, Garmin und Freunde einrichten](docs/EVORANK-X4.5-VERBINDUNGEN.md)
- [Projektregeln](AGENTS.md)
- [Anleitung X5.7](EVORANK-X5.7-ANLEITUNG.md)
- [Rangprüfung und Quellen](docs/EVORANK-X4.2-RANGPRUEFUNG.md)
- [Prüfbericht X5.7](docs/EVORANK-X5.7-VALIDIERUNG.md)
- [Einrichtung dieses Arbeitsordners](docs/LOKALE-ENTWICKLUNG.md)
- [Historischer Prüfbericht X4.1](docs/EVORANK-X4.1-VALIDATION.json)

## Daten und Sicherung

Das vollständige Original-ZIP einschließlich seiner Git-Daten ist zusätzlich in
`.local-backup/EVORANK-X4.1-CODEX-PROJEKT.zip` gesichert. Dieser lokale
Sicherungsordner wird von Git ignoriert. Die beiden vorhandenen Commits X4 und
X4.1 sind in das aktive Repository übernommen. Der aktuelle Arbeitsbranch heißt
`codex/evorank-x5.7`.

Persönliche Trainingsaufzeichnungen aus der bisherigen App sind nicht im
Quellcode-Paket enthalten. Sie bleiben im jeweiligen Browser-/App-Speicher oder
Cloud-Konto. Ein Geräte- oder Browserwechsel erfordert gegebenenfalls einen
Export aus der bisherigen App und einen Import in die lokale App.
Die Adresse `127.0.0.1:8123` beibehalten und keine Website-Daten löschen.

Supabase- und Garmin-Code sowie die Konfigurationsvorlagen wurden übernommen.
Produktive Server-Zugangsdaten sind nicht Teil des Backups. Der bestehende
Sites-Bezug und die Netlify-Konfiguration bleiben erhalten. Die lokale
Einrichtung veröffentlicht keine neue App-Version.

