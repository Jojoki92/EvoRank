# EvoRank X4.2 · Weiterentwicklung

Aktuelle Version **X4.2 / x4.2-r1**. Nächstes Update X4.3.
Der Arbeitsordner enthält den vollständigen Quellcode. X2-Dateinamen der aktiven
Rang-/Workout-Schicht und die X4.1-Workout-Grundgestaltung bleiben erhalten.

## Änderungen

- Übungsauswahl: eine Scrollfläche für Filter und Liste, kompakter mobiler Kopf,
  keine seitlichen Favoritensterne. Favoriten bleiben im Detaildialog zugänglich.
  Mobilität und geprüfte Einstiegsübungen liegen unter einer geschlossenen Aufklappzeile.
- Männlicher Bauch: Auswahlkontur auf der tatsächlichen maskierten Muskelfläche.
  Heller Modus: neutrale graue Fläche hinter beiden Körperdarstellungen.
- Profilwahl: keine leuchtende doppelte Kontur; Auswahl über Fläche und Häkchen.
- Designvorschau: vorhandenes ER-Logo statt Blitz, Farbe folgt dem Akzent.
- Laufen/Radfahren: Timer, Pause, Fortsetzen, GPS oder manuelle Distanz.
  Schwimmen: Timer, Beckenlänge, Bahnen +/−. Abschluss mit Korrektur von Zeit/Distanz.
- Aktive Aufnahme bleibt gerätelokal und kontogetrennt. Nach Neuladen wird sie
  pausiert wiederhergestellt. Abgeschlossene Einheiten verwenden bestehende Historie
  und Cloud-Synchronisation. Standortkoordinaten gelangen nicht in den Cloud-Trainingsstand.
- Cloud-Abgleich aktualisiert den Live-Zustand ohne erzwungenes Neuladen oder
  Hintergrund-Rendern. Aktiver Workout-Entwurf und Änderungen während Netzwerkwarten bleiben.
- Dip-/Klimmzugtabellen, bereinigte Beinübung-Zuordnungen, explizite
  Preacher-Curl-Maschine und gespeicherte Gerätefaktoren/Startwiderstände.

## Aktive Dateien

| Aufgabe | Datei unter public/rankforge/assets/ |
|---|---|
| Rangmodell und Gerätekonfiguration | evorank-x2-ranks.js |
| Community-Stützstellen | strength-standards-x4.2.js |
| Picker, Profil, Logo, Geräteeingaben | evorank-x2-ui.js |
| Neue Layoutregeln | evorank-x4.2-ui.css, nach evorank-x4.1-ui.css |
| Aufnahme und lokale Wiederherstellung | endurance-tracker-x4.2.js |
| Bestehende Sporthistorie und Ränge | triathlon-v9.7.js |
| Cloud-Merge ohne Reload | account-bridge-v1.js |
| Männliche Körpermaske | rankforge-v9.2.0-patch.js |

## Grenzen und Prüfung

`npm run test:x4` führt 27 aktuelle Prüfungen aus.
`npm run audit:x4.2` prüft alle 1.501 Einträge in 91.912 Score-Berechnungen.
[Rangprüfung mit Quellen](docs/EVORANK-X4.2-RANGPRUEFUNG.md) und
[Prüfbericht](docs/EVORANK-X4.2-VALIDATION.json) dokumentieren Ergebnisse und Grenzen.

Die UI wurde über erzeugtes HTML, DOM-Ereignisse und Modelltests geprüft.
Kein visueller Browser-/Handytest, echter GPS-Lauf, privater Kontoabgleich oder
Deployment wurde durchgeführt. GPS benötigt HTTPS oder localhost sowie die
Standortfreigabe. Mobile Browser garantieren bei gesperrtem Bildschirm keine
fortlaufende GPS-Aufzeichnung; die Oberfläche benennt diese Einschränkung.

Maschinenfaktoren schätzen äußere Lasten. 964 Kraftvarianten haben weiterhin
übertragene Referenzen; die Katalogprüfung validiert diese nicht wissenschaftlich.

Originalimport und Original-Git-Historie bleiben in `.local-backup/` gesichert.
Der bestehende Branch heißt weiterhin `codex/evorank-x4.1`; X4.2 liegt im
Arbeitsstand. Keine privaten Browser-Trainingsdaten sind im Quellpaket enthalten.
