# EvoRank X4 · D + H aktiviert

Der Nutzer hat das kombinierte D+H-Design ausdrücklich zur Implementierung gewählt.
Aktuelle App: `public/rankforge/index.html`; Buildkennung `x4-r1`.

## Änderung
- Originalgrafik unverändert in `docs/brand-x4/evorank-dh-master.png`.
- Neue versionierte Icons (32/180/192/512 und maskable), Apple-Fallback und 11 iPhone-Startbilder.
- Logo in App, Splash und Framework-Weiterleitung; D+H im Profil als aktiv.
- Neue Cachekennung und Bildpfade; PWA-ID, Startadresse und Scope bleiben identisch.
- Ranglogik, Trainingsdatenmodelle, Cloud-Integrationen und X3-Workoutstile unverändert.
- Keine Veröffentlichung; Netlify aktualisiert der Nutzer später an derselben Adresse.

## Wiederherstellung und Grenzen
Das gespeicherte X3-Codex-ZIP ist bereits in der gespeicherten Fassung nach
37.584.896 Bytes abgeschnitten (ursprüngliche Prüfsumme nennt 89.773.865 Bytes).
311 vollständige Einträge wurden anhand ZIP-CRC und Länge geprüft und extrahiert.
Die vollständige X3-PWA stammt aus dem intakten X3-Netlify-Paket.
Fehlende Framework-Konfiguration, Skripte und vorhandene ältere Tests stammen aus
dem CRC-geprüften X2-Komplettbackup. Kein vorhandener X3-Appcode wurde durch X2 ersetzt.
Alle nicht durch das Branding betroffenen App-Dateien wurden bytegleich zu X3 geprüft.

Die zusätzliche X3-Testdatei, audit-x3.mjs und der frühere Git-Verlauf konnten
nicht aus dem abgeschnittenen Archiv wiederhergestellt werden. X3-Berichte sind
historisch; die damaligen 19 Tests werden nicht als aktuelle Prüfung ausgegeben.
Die nicht mehr ausführbaren package.json-Kommandos test:x3 und audit:x3 wurden entfernt.
Aktuelles Kommando: `npm run test:x4` (12 vorhandene Prüfungen; Icon-Erwartung aktualisiert).
Der vollständige Framework-Build wurde erfolgreich durchgeführt.
Ein neuer lokaler Git-Verlauf beginnt mit dem wiederhergestellten X4-Stand.

RTK war in dieser Umgebung nicht vorhanden; normale Entwicklungsbefehle wurden verwendet.
Kein echter Windows-/iPhone-Test und keine Live-Konto-/Cloudprüfung.
Die ursprüngliche Sites-ID bleibt erhalten, get_site liefert weiterhin NOT_FOUND.
Nicht durch eine neu erstellte Site ersetzen. Node-Abhängigkeiten: vorhandener Lockfile.

## Weiterarbeiten
`npm ci`, `npm run test:x4`, `npm run build` (Linux/WSL).
Logoexporte bei Bedarf: `python scripts/generate-x4-brand.py` mit Pillow und DejaVu Sans.
Die X4-ZIPs enthalten Code und Bilder, keine privaten Handy-Trainingsaufzeichnungen.
