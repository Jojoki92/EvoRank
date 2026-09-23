# EvoRank X5.7 – Validierung

Stand: 22.09.2026. Lokale Änderung auf codex/evorank-x5.7.

- `npm.cmd run test:x5`: 129 bestanden, keine Fehler. Einschließlich echtem App-Init/Render/Wiederöffnen im Testaufbau, vorhandener Rang-/Trainingsregressionen, PostgreSQL-Bestenlistenregeln, Einwilligungstrennung sowie neuer Tests für fehlendes Consent-Modul und direkte SVG-Auswahlfarbe.
- `node_modules\.bin\vinext.cmd build`: erfolgreich. Vinext meldet weiterhin die bekannte statische Einschränkung bei der Klassifikation der Root-Route; kein Buildfehler.
- Edge und Windows-WebKit: synthetisches Testprofil, Touch-Auswahl beider Unterarme bei Mann/Frau, vorne/hinten und hell/dunkel. Ausgewählte SVG-Füllung wird direkt auf 62% der RGB-Kanäle gesetzt; Deselect stellt sie wieder her, ohne die Figur auszutauschen. Core-Auswahl zusätzlich visuell geprüft.
- Vier Sportarten bei 320, 430 und 1360 CSS-Pixeln, hell/dunkel: keine horizontale Überbreite, Rangnamen passen, alle drei Sportbeschriftungen bleiben außerhalb der Grafik, Plus-Menü öffnet die richtigen Sportarten. Profileingaben speichern das Gewicht weiterhin über das Formular.
- Profiledit bei 430x932, 430x460 und 932x430: Dialog nach Öffnungsanimation unter dem simulierten oberen Sicherheitsbereich und innerhalb der Höhe; Speichern bleibt erreichbar. Sicherheitsabstände im Test: oben 59px, unten 34px. Das ist eine Layoutsimulation, keine echte iOS-Tastatur.
- 36 einzelne PNG-Exporte: RGBA, transparente Ecken, 512x512, insgesamt 5.952.215 Bytes. Die generierten Master bleiben erhalten. Keine Browser-Luminanzmaske und kein schwarzer Galeriehintergrund mehr. Körperkunst wurde nicht geändert.
- HTTP-Smoke: 212 Ressourcen, alle erreichbar. Vorbereiteter Windows-Server mit Windows PowerShell 5.1: dieselben 212 Ressourcen geprüft, Antwort-Hashes identisch mit den Paketdateien, versionierte Icon-URLs und 404 für fehlende Dateien geprüft. Kein Browser dafür geöffnet.

Details: EVORANK-X5.7-BROWSER-CHECK.json, EVORANK-X5.7-HTTP-CHECK.json, EVORANK-X5.7-WINDOWS-CHECK.json und EVORANK-X5.7-ICON-EXPORT.json.

Keine Prüfung eines echten iPhones, der nativen iOS-App, produktiver Konten, OAuth-Anbieter, GPS-Hintergrundaufzeichnung oder des öffentlichen Netlify-Deploys. Rechtliche Lücken sind in EVORANK-X5.7-RECHTSCHECK.md ausdrücklich dokumentiert. Die Lieferung ist keine App-Store- oder rechtliche Freigabe.
