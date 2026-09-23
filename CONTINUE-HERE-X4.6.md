# EvoRank X4.6 · Einheitlicher Stil und übersichtliche Ablage

Aktuell **X4.6 / x4.6-r1**, nächste Lieferung **X4.7**.
Die Funktionalität von X4.5 bleibt erhalten; diese Lieferung vereinheitlicht die
Darstellung. Keine neue Rangformel, Datenmigration oder Kontoverbindung.

## Änderungen

- `assets/evorank-x4.5.js` und `assets/evorank-x4.5-ui.css`: Trainingswoche,
  Lautstärke, Hilfen und Verbindungen nutzen die vorhandenen Button-Varianten,
  Icons, Kartenfarben und Radien. Ruhige Tage sind kompakt; heutiger Tag und
  Startaktionen sind eindeutig markiert. Details bleiben einklappbar.
  Profileinträge werden in die aktuelle gruppierte Profilstruktur eingefügt;
  die entfernte alte `.settings-list` wird nur noch als Fallback verwendet.
- `assets/evorank-x4.6-ui.css`: weicher grauer Körperhintergrund im hellen Modus
  etwas stärker; am Mann nur geringerer Auswahlglanz, keine neue Körpergrafik
  und keine Änderung der Masken oder Konturgeometrie. Weibliche Geometrie und
  asymmetrische Rückenmasken bleiben erhalten.
- `applyDesignSettings` in `assets/rankforge-v9.2.0.js`: identischer Akzentverlauf
  und identische Akzent-Deckkraft in beiden Modi. Textkontrast und neutrale Flächen
  bleiben an den Modus angepasst. Im hellen Modus kräftigere Muskelfarben,
  ausgewählte Farboptionen und grüne Abschlussflächen.
- Training verwerfen: 56 px hohe, breite rote Schaltflächen im Kraft-Workout
  und Ausdauer-Tracker; bestehende Bestätigung bleibt unverändert.
- Ablage in `scripts/save-release.mjs` und `packaging/release-targets.json`:
  `FREED\x\x<major>\X<release>\EVORANK-X<release>-<Artefakt>`.
  Drei entpackte Artefakte pro Version; keine ZIP ohne ausdrückliche Anfrage.

## Arbeitsregeln

Neue Bereiche immer an den vorhandenen App-Stil anpassen: `button`-Varianten,
Inter/Systemschrift, bestehende Icons und CSS-Farbvariablen wiederverwenden.
Keine generischen CSS-Regeln, die Primärbuttons grau überschreiben.
Helle Flächen benötigen gut lesbare Schrift, ohne die Akzentfarbe zu entsättigen.
Keinen grauen Kasten hinter den Körpern ergänzen.

Bestand aus X4.5: 70/30-Muskelaggregation, unbestätigter Kabelstandard 1:1,
persönliche Strava-Importe, Quellcode für native iPhone-Funktionen.
Konten, IDs, Historie, XP, PWA-Identität und Ursprung unverändert lassen.
Die Integrationsanleitung bleibt `docs/EVORANK-X4.5-VERBINDUNGEN.md`.

## Prüfung und Auslieferung

`npm.cmd run test:x4`, dann `.\node_modules\.bin\vinext.cmd build`, danach
`npm.cmd run release:prepare` und `npm.cmd run release:save`.
Der Kopierschritt prüft SHA-256 und überschreibt keine abweichenden Dateien.
Er benötigt gegebenenfalls die Dateisystemfreigabe außerhalb des Arbeitsordners.
Keine Veröffentlichung ohne Auftrag. Kein visueller Browser- oder Gerätetest
wurde für diese Lieferung angefordert. Native iOS-Funktionen bleiben ungebauter
Quellcode; bestehende Hinweise aus X4.5 gelten weiter.
