# Start, Tests, Git und Lieferung

## Weiterentwickeln nach dem Entpacken

Alle ZIPs zunächst in dasselbe leere Verzeichnis entpacken. In `EVORANK-UEBERGABE-X5.7/projekt/` arbeiten. Die Dateien sind ein vollständiger Quell-Snapshot, kein installierter `node_modules`-Ordner und kein Git-Clone.

Node >= 22.13 und npm verwenden, vorhandenes `package-lock.json` erhalten. Unter Windows:

```powershell
npm.cmd ci
npm.cmd run test:x5
.\node_modules\.bin\vinext.cmd build
node scripts/smoke-release.mjs
```

Im ursprünglichen Checkout sind die Abhängigkeiten bereits installiert. Nicht jede Sitzung benötigt eine Neuinstallation. `npm test` führt historische versionsbezogene Tests und einen Bash-Build aus; es ist nicht das aktuelle X5-Gate. Unter Linux entsprechen `npm ci`, `npm run test:x5` und der bestehende Buildablauf der Umgebung; Bash-Helfer beachten.

Für eine angeforderte lokale Vorschau: `npm.cmd run preview:app` aus `projekt/`; standardmäßig `http://127.0.0.1:8123/`. Eine alte EvoRank-Serverinstanz zuerst geordnet schließen, keinen fremden Prozess blind beenden. Browserdaten gehören zur bisherigen Origin und zum Browserprofil.

Die statische Vorschau betreibt keine Netlify-Funktionen. Cloud/OAuth nicht durch lokale Mockresultate als produktiv geprüft melden.

## Letztes belegtes Gate

X5.7: 129/129 Tests, Vinext-Build erfolgreich, 212 HTTP-Ressourcen geprüft, vorbereiteter PowerShell-5.1-Server per Hash geprüft. Edge und Windows-WebKit mit Touch/simulierten Insets. 685 Dateien am tatsächlichen Releaseziel überprüft. Siehe `docs/EVORANK-X5.7-VALIDIERUNG.md` und zugehörige JSON-Berichte.

Im Build existiert eine bekannte Vinext-Meldung zur statischen Root-Klassifikation; der Build wurde trotzdem erfolgreich abgeschlossen. Nicht als echtes Geräte-/Hostingtestergebnis ausgeben.

Bei Übernahme zunächst dieselben Tests ausführen. Danach nur gezielte zusätzliche Prüfungen für Änderungen. Änderungen am aktiven Code erfordern erneuten Build. Keine beliebigen alten Suites löschen, nur weil historische Erwartungen abweichen.

## Git

- Ursprünglicher Checkout: `C:\Users\johan\OneDrive\Dokumente\ChatGPT\EvoRank`.
- Geprüfter App-Stand: Commit `983cefb`, Branch `codex/evorank-x5.7`.
- Die Übergabe ergänzt nur Dokumentation und Packwerkzeug. App bleibt X5.7.
- `00-UEBERGABE/GIT-VERLAUF.txt` liefert Commit-Übersicht; das Dateimanifest nennt den Snapshot-Commit.
- `.git` und komplette alte Git-Objekte sind nicht mitgepackt. Für echten historischen Checkout im ursprünglichen Repository arbeiten. In einer fremden Umgebung kann nach Prüfung ein neues lokales Repository für den Snapshot angelegt werden; das stellt alte Commits nicht wieder her.
- Johannes hat lokale Git-Sicherungen und die üblichen Releaseziele dauerhaft autorisiert. Keine zusätzliche Gesprächsbestätigung für diese bisherigen Aktionen. Sandbox-/Freigabemechanismen der Umgebung bleiben verbindlich. Keine Veröffentlichung, Remoteübertragung oder Käufe daraus ableiten.
- Die bisherigen lokalen Commits nutzen `EvoRank (lokal) <evorank@localhost>` pro Aufruf; keine globale Git-Identität ungefragt umstellen.

## Aktuelle startbare Lieferung bei Johannes

Windows: `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X5.7\EVORANK-X5.7-WINDOWS\`

Start: **EVORANK-STARTEN.bat** oder **EVORANK.exe**, kein Node erforderlich. PowerShell-Serverfenster während der Nutzung offen lassen. Node-Starter ist nur die erhaltene Alternative.

Website: daneben **EVORANK-X5.7-NETLIFY**. Diese Dateien wurden lokal gespeichert, nicht von dieser Arbeit auf Netlify veröffentlicht.

Die Übergabe vervielfacht diese beiden großen Lieferordner nicht. Ihr vollständiger Quellbestand plus Packskripte ist in `projekt/` enthalten; daraus können wieder startbare Pakete entstehen.

## Zukünftige Auslieferung

1. Tatsächliche nächste Änderung erhält X5.8, anschließend X5.9, X6.0. Kein Versionssprung nur wegen dieser Übergabe.
2. Aktuelle Anzeige/Buildmarker/Cacheversion und Anleitungen konsistent aktualisieren, PWA-Identität/Origin nicht ändern.
3. Tests, Build, HTTP-Prüfung; danach `npm.cmd run release:prepare`.
4. Den vorbereiteten Windows-Server prüfen; `npm.cmd run release:save` kopiert und hashprüft.
5. Standard: entpackte Windows- und Netlify-Ordner unter `EvoRank\FREED\x\x<major>\X<release>\`, beide in einem neuen Versionsordner. Ältere Versionen nicht überschreiben/löschen.
6. ZIP nur auf ausdrücklichen Wunsch unter `EvoRank\ZIP\x\x<major>\`. Dieser Übergabeauftrag ist eine solche Ausnahme; keine unnötige weitere Codex-Quellkopie bei normalen App-Releases.

Die Ziele stehen in `packaging/release-targets.json`. Auf fremden Rechnern die Windows-Pfade zunächst prüfen und passend vereinbaren. Ein „gespeichert“ erst nach erfolgreicher Kopie/Hashprüfung melden. Der Cleanup-Hook darf nur hashbestätigte Staging-Duplikate entfernen.

## Paketwerkzeug

`scripts/package-handoff-x5.7.py` baut diese Themen-ZIPs aus dem versionierten Snapshot, aktuellen Übergabedokumenten und ausdrücklich ausgewählten Designmastern. Es prüft Größe, CRC, eindeutige Pfade, SHA-256 und vollständige Zuordnung. Die lokalen Originalpfade der Bildmaster sind kein Bedarf der App: die tatsächlich erforderlichen 512px-Icons sind im Quellprojekt enthalten.
