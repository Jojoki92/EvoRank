# EvoRank X4.8 · Ausdauer und kompaktere Übersicht

Aktuell **X4.8 / x4.8-r1**, nächste Lieferung **X4.9**.

- `assets/endurance-ranking-x4.8.js`: separate Alterszeitkurven je Ausdauersport
  und Körperprofil, aktuelle Altersberechnung aus X4.7. Eigene geschätzte
  Rangkalibrierung; Quellen und Formel in `docs/EVORANK-X4.8-AUSDAUER.md`.
- `assets/triathlon-v9.7.js`: bestehende Ausdauerränge nutzen das neue Modell.
  Gemessene Radleistung plus gespeichertes Gewicht wird ab 20 Minuten als W/kg
  bewertet. Sonst Tempo. Lauf-/Schwimmzeiten erhalten keinen pauschalen Gewichtsbonus.
  Garmin-JSON erhält vorhandene Leistungsfelder. Kein neuer Anbieterzugriff.
- `assets/endurance-tracker-x4.2.js`: Gewicht am Start merken, beim Speichern einer
  Radeinheit optionale Messwerte ergänzen. Fehlgeschlagene Speicherung bleibt
  korrigierbar und erzeugt beim Wiederholen keine zweite Aktivität.
- `assets/evorank-x4.8.js`: gesamte Trainingswoche standardmäßig eingeklappt;
  Zustand in `settings.x48WeekExpanded`. Kalender, Pläne, Verbindungen und
  sieben Tage bleiben enthalten. Sport-Rangerklärung auf beiden Rangansichten.
  Forge Drop bekommt einen einzigen Scrollbereich und festen sichtbaren Kopf.
- `assets/rankforge-v9.2.0.js`: Challenge zeigt zwei getrennte Ziele mit klaren
  Zählern statt einer gemittelten Prozentzahl. Ziele und 75-Coins-Belohnung bleiben.
- `assets/evorank-x2-ui.js`: redundante Design-Karte am Profilende entfernt.
  Design-Einstellungen und genehmigte Symbole bleiben vorhanden.
- `assets/evorank-x4.8-ui.css` lädt zuletzt und nutzt die bestehenden Stilvariablen.

Kraftmodell, 70/30-Aggregation, Kabelkonfigurationen, grüne Abschlüsse, Körpergrafik,
Historie, XP, Belohnungen, IDs, Storage-Keys und PWA-Identität bleiben erhalten.
Aktuelles Profil steuert Vergleiche, damaliges Gewicht steuert gemessene W/kg.
Strava bleibt im persönlichen Kalender. Gelöschte Pläne bleiben gelöscht.

Prüfen: `npm.cmd run test:x4` (73 Tests),
`.\node_modules\.bin\vinext.cmd build`.
Liefern: `npm.cmd run release:prepare`, anschließend `npm.cmd run release:save`.
Ziel: `FREED\x\x4\X4.8\` mit Windows, Netlify und vollständiger Quelle.
Keine ZIP oder Veröffentlichung beauftragt. Keine Browser-/Geräteprüfung erfolgt.
