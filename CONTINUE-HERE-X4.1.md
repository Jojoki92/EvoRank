# EvoRank X4.1 — Workout wie X2, ruhige Rahmen, flaches Logo

Aktuelle Version X4.1, Build x4.1-r1. Nächstes Update X4.2, weiter bis X4.9, dann X5.0.

## Umsetzung
- Die vorhandenen X2-Grundstyles sind bytegleich erhalten. Workout-Karten erhalten
  die Klasse rfx41-workout-exercise statt rfx3-workout-exercise, wodurch die abgelehnten
  X3-Kontrast-/Grid-Overrides nicht mehr greifen. X3-Splash und Profilstyles bleiben.
- Neue assets/evorank-x4.1-ui.css: dünner 1px-Rahmen pro Satz, rgba(255,255,255,.17)
  im dunklen Modus, dezenter dunkler Rahmen im hellen Modus. Keine Zebra-Flächen.
- Übungen behalten die X2-Aufteilung mit zurückgenommener Außenkontur und Akzentlinie.
- Positionsauswahl und Drag-Griff sind in die Überschrift integriert. Auf kleinen
  Displays bleiben Name, Menü sowie Löschen/Ersetzen auf passenden Rasterzeilen.
- Reorder-, Kabelzug- und Satz-Handler bleiben erhalten. Ranglogik wurde nicht geändert.
- Das kleine Logo in der App/Anmeldung nutzt die vorhandene flache H-Grundform
  assets/brand-x4.1/evorank-er-flat.png. Farbflächen statt Metalltextur. CSS screen/multiply
  passt den dunklen Bildhintergrund an App-Flächen bzw. den hellen Modus an.
- Das detaillierte D+H-Homescreen-Icon, PWA-Identität und Startbilder aus X4 bleiben erhalten.

## Logoherkunft
Ein einzelner Imagegen-Versuch für transparente Vereinfachung lieferte ein eingebranntes
Schachbrett und wurde verworfen. Stattdessen wurde der vorhandene geeignete H-Entwurf
wiederverwendet. Er ist die flache Grundform des vom Nutzer gewählten D+H-Logos.
Kein Schachbrettbild wurde eingebaut. Das Original-H wurde unverändert kopiert.

## Prüfung und Lieferung
12 vorhandene Verhalten-/PWA-Tests bestehen. Zusätzliche Strukturprüfung: genau ein
Positionswähler und Griff im Header; Kabelpanel bleibt außerhalb des Headers.
Alle lokalen HTML-/Precache-Verweise existieren. Vollständiger Framework-Build bestanden.
Kein Browser-/Geräte-/Cloud-Kontotest. Netlify wurde nicht veröffentlicht.
Die Wiederherstellung des älteren Quellcodes ist in CONTINUE-HERE-X4.md dokumentiert.

Dateien: EVORANK-X4.1-NETLIFY.zip, EVORANK-X4.1-WINDOWS.zip, EVORANK-X4.1-CODEX-PROJEKT.zip.
