# EvoRank X5.7

## Windows starten

Ordner: `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X5.7\EVORANK-X5.7-WINDOWS\`

**EVORANK-STARTEN.bat** oder **EVORANK.exe** doppelklicken. Node.js ist dafür nicht erforderlich. Das Serverfenster während der Nutzung geöffnet lassen. Eine alte EvoRank-Serverinstanz zuerst schließen; danach denselben Browser und `http://127.0.0.1:8123/` verwenden. Website-Daten nicht löschen.

## Was geändert wurde

- Dialoge reservieren oben Platz für die iPhone-Statusleiste. Auch längere Formulare können innerhalb des verfügbaren Bereichs scrollen.
- Die Apple-Leiste unten ist kompakter. Das Plus sitzt mittig in der Leiste; der untere Sicherheitsabstand wird nur einmal berücksichtigt.
- „Heutiges Training“ hat kleinere Schrift und kein Rangabzeichen mehr. Auch die großen Ausdauer-Startkarten bleiben ohne Abzeichen. Im Plus-Menü stehen weiterhin die vier eigenen Sportsymbole.
- Ausgewählte Muskeln werden direkt in derselben Rangfarbe abgedunkelt. Das funktioniert ohne die bisherige SVG-Filterabhängigkeit. Körpergrafiken und Trefferflächen bleiben erhalten.
- Der zusätzliche Körperdaten-Kasten im Profil entfällt. Gewicht, Größe, Geburtsdatum beziehungsweise Alter bleiben unter **Profil → Bearbeiten** veränderbar. Gespeicherte Trainingswerte bleiben unverändert.
- Alle 36 Rangabzeichen sind einzeln als transparente PNGs eingebunden. Die dunklen Kacheln und Browser-Hintergrundmasken entfallen. Die Namens- und Punktebereiche bleiben gleich.
- Die Cloud-Sicherung darf bei einem fehlenden Einwilligungsmodul keine alte geräteweite Freigabe verwenden. Eine fehlgeschlagene Aktivierung wird nicht mehr als Erfolg angezeigt.

## Website und iPhone aktualisieren

Der separate Ordner **EVORANK-X5.7-NETLIFY** enthält die Website für die bestehende Netlify-Seite. Diese Lieferung führt keinen Upload aus. Nach einem späteren Update dieselbe Adresse erneut öffnen und im Profil auf **X5.7** prüfen. Die Trainingsdaten vorher bei Bedarf exportieren, aber keine Website-Daten zum Aktualisieren löschen.

Das installierte Homescreen-Symbol bleibt das freigegebene metallische D+H-Logo. Es wechselt nicht mit der Akzentfarbe. Falls iOS ein altes Symbol behält, vor einem Entfernen zunächst ein Backup exportieren und anschließend die bestehende Adresse in Safari über „Teilen → Zum Home-Bildschirm“ erneut hinzufügen. Daten und neues Symbol prüfen.

## Prüfung und rechtlicher Stand

Getestet werden die lokale App, Edge, Windows-WebKit mit Touch-Eingaben und simulierten Sicherheitsabständen, die gespeicherten Pakete und der PowerShell-Server. Das ist kein Test auf deinem echten iPhone oder an deinem produktiven Konto.

**RECHTSCHECK.md** enthält den aktuellen Stand. Öffentliche Anschrift, Unternehmensstatus, Nutzungsrechte und konkrete Produktions-/Minderjährigenfragen fehlen weiterhin. Die neuen Rechtstexte sind keine rechtliche Gesamtfreigabe. Kontakt: evorank.fitness@gmail.com.

Quellcode und Git-Verlauf bleiben im bestehenden Entwicklungsordner. Es wird keine zusätzliche Codex-Kopie geliefert.
