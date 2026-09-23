# EvoRank X4.3 · Ruhiger Bodygraph und Übungsgruppen

Aktuelle Version **X4.3 / x4.3-r1**. Nächstes Update X4.4.
X4.2-Funktionen und die X4.1-Workout-Gestaltung bleiben enthalten.

## Änderung

`assets/evorank-x4.3-ui.css` lädt zuletzt und entfernt im hellen Modus die
rechteckige graue Fläche samt zusätzlichem Innenabstand hinter den Körperfiguren.
Die bestehenden radialen, weich verschwimmenden Pseudoelemente und Schatten aus
der früheren Darstellung werden wieder sichtbar. Das gilt für Frau und Mann.
Anatomiepfade, Auswahlfarben und dunkler Modus bleiben erhalten.

`assets/exercise-families-x4.3.js` fasst Varianten im Übungspicker zusammen:
1.001 Kraftvarianten erscheinen als 163 Hauptlisteneinträge; 500 Mobilitätsvarianten
als 50 Einträge. Die 39 vorhandenen Bankdrückvarianten liegen beispielsweise unter
Bankdrücken. Winkel, Gerät, Griff und Ausführung bleiben darunter auswählbar.
Insgesamt bleiben alle 1.501 IDs erhalten.

Gruppiert wird nach benannter Bewegung vor einem Varianten-Trennzeichen und
gezielten Familienregeln, nicht pauschal nach dem ersten Wort. Eigene Übungen
bleiben einzeln. Suche und Filter wirken auf die einzelnen Varianten; eine Suche
nach `bankdrücken 30` findet deshalb gezielt den Winkel. Favoriten, letzte Nutzung,
Nichtverfügbarkeit, bereits hinzugefügte Übungen und Routine-/Ersetzungs-Kontext
bleiben erhalten. Die Seitengrenze gilt für ganze Gruppen. Varianten werden erst
beim Öffnen eingefügt, um die erste Liste kompakt zu halten.

Die Gruppierung verändert weder gespeicherte Trainings noch Referenzen,
Geräteeinstellungen oder Rangberechnung. Die Muskelanzeige verwendet weiterhin
die vorhandene Haupt-/Nebenmuskelgewichtung und bis zu vier Übungsrekorde.
Erklärung mit Beispiel: [Muskeln und Ränge](docs/EVORANK-X4.3-MUSKELRAENGE.md).

## Prüfung und Pakete

- `npm.cmd run test:x4`: 34 Tests für aktuelle App und Gruppierung.
- `.\node_modules\.bin\vinext.cmd build`: vollständiger Build unter Windows.
- `.\scripts\package-x4.2.ps1 -Release X4.3`: Windows, Netlify und Quellcode.

Der Paketgenerator behält seinen historischen Dateinamen und akzeptiert jetzt
eine Release-Nummer. Der Quellcode-Ordner bleibt der maßgebliche Arbeitsstand;
Pakete liegen unter `delivery/`. Eine zusätzliche entpackte Windows-Kopie wird
zur direkten Verwendung bereitgestellt, ohne Download aus dem Chat.

Keine Veröffentlichung, keine private Konto-/Trainingsinspektion und kein
visueller Browser-/Handytest. [Prüfbericht](docs/EVORANK-X4.3-VALIDATION.json).
