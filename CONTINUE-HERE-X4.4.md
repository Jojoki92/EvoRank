# EvoRank X4.4 · Grün für erledigte Sätze und direkte Ablage

Aktuelle Version **X4.4 / x4.4-r1**, nächste Version X4.5.

`assets/evorank-x4.4-ui.css` lädt zuletzt und stellt die grüne Hinterlegung
erledigter Satzkarten, Nummern und Fertig-Schalter wieder her. In X4.1 hatte eine
neutrale Hintergrundregel den früheren grünen Satz-Hintergrund überlagert.
Grün ist unabhängig von der gewählten Akzentfarbe. Heller und dunkler Modus
verwenden ihre bestehenden Grünwerte; die feinen Rahmen bleiben erhalten.

Die bestehende Workout-Darstellung in `evorank-x2-ui.js` setzt zusätzlich die
abgeleitete Klasse `rfx44-complete`, sobald eine Übung mindestens einen Satz hat
und alle Sätze fertig sind. Dann ist die ganze Übung dezent grün. Rückgängig
machen oder einen offenen Satz hinzufügen entfernt diese Markierung wieder.
Die gespeicherte Satz-/Trainingslogik bleibt unverändert.

## Verbindliche Ablage auf Wunsch des Nutzers

Ab jetzt entpackte Versionen direkt nach:
`C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x<major>\`.

X4.4 erhält dort die eigenen Ordner `EVORANK-X4.4-WINDOWS`,
`EVORANK-X4.4-NETLIFY` und `EVORANK-X4.4-CODEX-PROJEKT` unter `x4`.
X5.8 würde unter `x5` abgelegt. Ältere Versionen bleiben bestehen.
Keine ZIP-Dateien erstellen oder in den ZIP-Ordner kopieren, solange der Nutzer
das nicht ausdrücklich wieder verlangt.

Der neue `scripts/save-release.mjs` liest die App-Version und die Zielkonfiguration
aus `packaging/release-targets.json`. `npm.cmd run release:prepare` bereitet alle
drei Ordner innerhalb des Arbeitsbereichs vor und schreibt eine SHA-256-Dateiliste.
`npm.cmd run release:save` validiert die vorbereiteten Dateien, kopiert sie in
FREED und prüft die Kopien erneut. Fremde/abweichende vorhandene Dateien werden
nicht überschrieben; wiederholte identische Kopien sind erlaubt. Der Ablauf
enthält keine Löschoperationen und keine Cloud-Veröffentlichung.

`delivery/EVORANK-X4.4-SAVED.json` enthält nach erfolgreicher Ablage den tatsächlichen
Zielpfad und die Anzahl überprüfter Dateien. ZIP-Erstellung ist nur noch ein
ausdrücklich angeforderter Zusatz. Der bisherige ZIP-Generator bleibt verfügbar.

## Prüfen

- `npm.cmd run test:x4`: 35 aktuelle Tests.
- `.\node_modules\.bin\vinext.cmd build`: vollständiger Build unter Windows.
- Die Ablage prüft Dateihashes aller drei gelieferten Ordner.

Kein visueller Browser-/Handytest, privater Konto-Test oder Deployment.
[Prüfbericht](docs/EVORANK-X4.4-VALIDATION.json).
