# EvoRank X4.7 · Altersvergleich und persönliche Pläne

Aktuell **X4.7 / x4.7-r1**, nächste Lieferung **X4.8**.

## Änderungen

- `public/rankforge/assets/age-ranking-x4.7.js`: dokumentierte altersbezogene
  Kraftpunktkorrektur, genaue Berechnung aus Geburtsdatum, datierter Fallback
  für ein vorhandenes Alter. Kraftkurve für Männer/Frauen, keine Ausdaueränderung.
  Quellen, Annahmen und Zahlen: `docs/EVORANK-X4.7-ALTER.md`.
- `assets/evorank-x2-ranks.js`: Geräte-/Körpergewichtsberechnung bleibt zuerst;
  danach Altersfaktor. `scoreDetails` gibt unveränderte Basispunkte und
  Alterspunkte zurück. Geschätzte Übungen bleiben auf 699 begrenzt.
- `assets/evorank-x4.7.js`: Anzeige im Kraft-Ranks-Bereich/Übungsdetails,
  Aktualisierung beim Tageswechsel und Rückkehr, ohne aktive Eingaben zu ersetzen.
  Planübersicht mit Bearbeiten/Löschen; bestehende Bestätigungsdialoge,
  Abbrechen beim Planassistenten, Profileintrag in bestehender Gruppe.
- Wochenplan löschen: deaktivieren, erzeugte Wochenzeilen entfernen; Einstellungen,
  Routinen und Trainingshistorie bleiben. Explizites Erstellen bleibt möglich.
- Schwimmplan löschen: `garmin.nextPlan=null`, `planDismissed=true`. Beide alten
  Generatoren im kompatiblen Hauptskript respektieren das Flag. Import und Start
  erzeugen ihn nicht neu; „Schwimmplan erstellen“/„Neu berechnen“ aktiviert ihn.
- `assets/home-rank-frame-v10.4-r1.js`: neutrale Home-Karten auch für bestehende
  Konten. Alte Rahmenauswahl entfällt; Ranks-Ansicht bleibt farbig.
- `assets/evorank-x4.7-ui.css` lädt zuletzt. Bestehende Button- und Surface-Tokens;
  Körpergrafiken, grüne Abschlüsse und X4.6-Akzentfarben bleiben bestehen.

## Invarianten

Alterskurve ist eine transparente EvoRank-Schätzung, keine genaue Norm für
jede Maschine. Aktuelles Profil bestimmt aktuelle Vergleiche; historische Last
bleibt mit damaligem Körpergewicht und gespeicherter Übersetzung berechnet.
Keine Änderung von Historie, XP, Belohnungen, IDs, Storage-Keys, PWA-Identität,
Konten oder Deployment-Ursprung. 70/30-Muskelaggregation und 58 % sekundär bleiben.
Garmin-Planlöschung niemals mit Aktivitätslöschung verwechseln.

## Prüfen und liefern

`npm.cmd run test:x4` (63 Tests), `.\node_modules\.bin\vinext.cmd build`,
`npm.cmd run release:prepare`, danach `npm.cmd run release:save`.
Gruppierte entpackte Ablage: `FREED\x\x4\X4.7\` mit Windows, Netlify und Quelle.
Keine ZIP, Veröffentlichung, Browserprüfung oder Gerätetest beauftragt.
Externe Integrationsgrenzen aus X4.5 gelten weiterhin.
