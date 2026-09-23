# EvoRank X5.6 – lokale Validierung

Stand: 17.09.2026. Branch: `codex/evorank-x5.6`. App-Build: `x5.6-r1`.

## Ergebnis

- `npm.cmd run test:x5`: **126 bestanden, 0 fehlgeschlagen**. Enthält die echte App-Initialisierung, Rendern und Wiederöffnen sowie die bisherigen Rang-, Trainings-, Kabel-, Plan- und Kontentrennungstests.
- `.\node_modules\.bin\vinext.cmd build`: erfolgreich. Der bekannte Hinweis auf unvollständige statische Route-Klassifizierung bleibt; kein Buildfehler.
- `node scripts/smoke-release.mjs`: **180 HTTP-Ressourcen** des Offline-Katalogs über den lokalen Node-Server geladen und Version geprüft. Bericht: `EVORANK-X5.6-HTTP-CHECK.json`.
- Der vorbereitete Windows-Ordner wurde zusätzlich mit **Windows PowerShell 5.1** und `-NoBrowser` gestartet. Alle 180 Ressourcen wurden über HTTP geladen und mit den Dateiinhalten per SHA-256 verglichen. Versionskennung, JavaScript-MIME-Typen, Icon-URLs mit Versionsparametern und 404-Antwort geprüft. Bericht: `EVORANK-X5.6-WINDOWS-CHECK.json`. Der normale Starter benötigt damit kein Node; die Tests selbst verwenden Node.
- `git -c core.whitespace=cr-at-eol diff --check`: erfolgreich.
- Lizenzinventar aus unverändertem Lockfile: 744 Einträge, 493 Lizenztextdateien; keine neue Abhängigkeit. Vorhandene Lizenzpflichten und offene Bildrechte bleiben bestehen.

## Neue Regressionen

1. Die drei Kompetenzbeschriftungen stehen außerhalb des SVG. Antippen wählt den zugehörigen Bereich und aktualisiert dessen ARIA-Zustand bei Radfahren, Laufen und Schwimmen.
2. Alle vier Plus-Menü-Einträge verwenden die gelieferten Abzeichen. Der gewählte Ausdauereintrag öffnet die passende Aufzeichnung.
3. Gewicht steht zuerst im Profilformular und wird über dessen ursprünglichen Speichervorgang übernommen. Geburtsdatum und Altersersatz wechseln korrekt. Frühere Trainingsgewichte bleiben erhalten; keine separate Soforteingabe außerhalb des Formulars.

## Browser und Darstellung

Headless Edge/Chromium mit Playwright, frischem Testprofil und synthetischen Trainingsdaten. Kontoanfragen sind Testantworten. Kein Zugriff auf private Trainingsdaten.

- Touch-Emulation bei 430 × 932: linker und rechter Unterarm bei Mann/Frau, vorne/hinten, hell/dunkel tatsächlich an Pfadpunkten angetippt. Auswahl und Abwahl funktionieren. Die Muskelfüllung behält ihren RGB-Wert und dunkelt mit `brightness(.72)` ab; normale Deckkraft beträgt 1.
- 320, 430 und 1360 Pixel Breite, beide Darstellungen, alle vier Sportarten: kein horizontaler Seitenüberlauf, Rangtitel ohne abgeschnittene Textbox, alle neun Galerieränge vorhanden, einheitliche Startabzeichen und Plus-Auswahl.
- Bei allen drei Ausdauersportarten liegen die drei HTML-Beschriftungen vollständig oberhalb bzw. unterhalb des SVG. Keine Textbeschriftung mehr innerhalb der Grafik.
- Gewicht über die sichtbare Profileingabe von 70 auf 73,5 kg geändert und gespeichert. Keine JavaScript-Seitenfehler.
- Screenshots von Galerie im hellen Modus, Rad-/Laufgrafik, männlichem Körper und kompaktem Profil visuell kontrolliert.

Temporäre Browser-Skripte, Logs und Bilder liegen unter `.sites-runtime/` und werden nicht ausgeliefert. Wiederholbare Regressionstests stehen unter `tests/evorank-x5.6.test.mjs`.

## Auslieferung und Grenzen

`release:prepare` und `release:save` erfolgreich: **612 Dateien per SHA-256 am Ziel geprüft**. Getrennte ausgepackte Ordner unter `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X5.6\`, keine ZIP und keine zusätzliche Codex-Quellkopie. Hash-geprüfte Vorbereitungskopie anschließend durch den bestehenden Cleanup-Hook entfernt. Protokoll: `delivery/EVORANK-X5.6-SAVED.json`.

Kein reales iPhone/Safari, kein GPS-Lauf, keine produktive Konto-/Cloud-Verbindung, kein Netlify-Deploy und keine App-Store-Prüfung. Identische CSS-Farben garantieren keinen identischen Farbeindruck bei unterschiedlichen Displays/Systemeinstellungen. Ob iOS ein bereits installiertes Icon aktualisiert, wurde nicht am Gerät geprüft; die Anleitung erklärt Backup und erneutes Hinzufügen. PWA-Identität, Ursprung, lokale Speicherschlüssel, Bilder, Rangmodelle und Trainingshistorie bleiben unverändert. Rechtliche offene Punkte aus `EVORANK-X5.5-RECHTSCHECK.md` bleiben offen.
