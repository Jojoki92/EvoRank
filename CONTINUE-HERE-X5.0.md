# EvoRank X5.0 · Ruhigere Apple-Ansicht

Aktuell **X5.0 / x5.0-r1**, nächste Lieferung **X5.1**.

- `assets/evorank-x5.0-ui.css` lädt zuletzt. Apple-Navigation ohne helle Kontur;
  übrige Glasfläche, Navigation und Dialoggesten bleiben bestehen.
- `assets/apple-interface-x4.9.js` setzt beim ersten Rendern eines Profils in X5.0
  `settings.interfaceX49 = 'apple'` und `settings.interfaceDefaultX50 = true`.
  Danach wird eine ausdrücklich gewählte klassische Ansicht weiterhin respektiert.
  Accountwechsel, Normalisierung und Speichern müssen die beiden Werte erhalten.
- `renderV7Challenge` in `rankforge-v9.2.0.js` zeigt nur Überschrift, Coins und
  zwei begrenzte Fortschrittsanzeigen. Anspruch und Einmaligkeit der Belohnung sind
  unverändert. Es gibt keine gemittelte Prozentzahl und keine doppelten Erklärungen.
- Freunde-Einstieg verwendet gemeinsame Button-Klassen sowie gewählte Akzentfarbe,
  kontrastberechneten Text und abgerundete Ecken.
- `legal-links-x4.9.js` übergibt ausschließlich Farbe und Darstellung als URL-Parameter.
  `legal-theme-x5.0.js` prüft die Parameter und übernimmt sie nur für lokale
  Rechts-/Hilfeseiten. Keine Kontodaten und kein neuer Speicherzugriff.
  Profilnavigation und Seitenkopf sind mittig; längere Rechtstexte bleiben linksbündig.
- `rankforge-v9.2.0-patch.js`: dezente schwarze Kontur entlang vorhandener männlicher
  Muskelmasken (Radius 1,6 Quellpixel, Deckkraft 0,48); ausgewählter Bauch ebenfalls
  schwarz statt weiß. Anatomie, Treffflächen und weibliche Grafik unverändert.

85 Tests über `npm.cmd run test:x5` (`test:x4` bleibt kompatibler Alias).
Build: `.\node_modules\.bin\vinext.cmd build`.
HTTP-Prüfung: 168 Offline-Ressourcen. Keine visuelle Browser-/Geräteprüfung.
Danach `npm.cmd run release:prepare` und `npm.cmd run release:save`.
Ziel: `FREED\x\x5\X5.0\`, drei entpackte Pakete, keine ZIP-Datei.

Ränge, Historie, grüne Trainingsabschlüsse und Zustimmungen bleiben erhalten.
Frühere Einschränkungen zur nativen App, öffentlichen Betreiberanschrift und
Server-/Bildrechteprüfung gelten weiter. Keine Veröffentlichung vorgenommen.
