# Merge-Manifest — RankForge 9.7 Triathlon

Dieses Dokument macht die Entwicklungslinie 9.7 eindeutig mit einer parallel erzeugten RankForge-Version zusammenführbar.

## Auslöser und Ziel

Der Satz **„Verbinde die zwei“** bedeutet:

1. Dieses vollständige 9.7-Paket und das vollständige Paket der Parallelversion laden.
2. Beide Änderungen gegen den gemeinsamen Ausgangsstand RankForge 9.6 / R15 / Commit `67034ba` vergleichen.
3. Funktionen beider Seiten erhalten und Konflikte bewusst integrieren, nicht eine Version über die andere kopieren.
4. Produktversion auf **9.9** und Cache/Build mindestens auf **R17** erhöhen.
5. Alle Tests beider Linien plus neue Integrationstests ausführen.
6. Neue Netlify-, Windows- und vollständige Backup-Pakete erzeugen.

## Eigentum dieser Entwicklungslinie

Diese Dateien gehören ausschließlich zur 9.7-Triathlon-Erweiterung und sollen beim Merge vollständig übernommen werden:

- `public/rankforge/assets/triathlon-v9.7.js`
- `public/rankforge/assets/triathlon-v9.7.css`
- `public/rankforge/garmin-connect-config.js`
- `tests/triathlon-v9.7.test.mjs`

Neue persistente Daten gehören ausschließlich zum Namensraum:

- `state.triathlon`
- Schema-Version `28`
- Laufzeitkennung `window.RANKFORGE970`
- UI-Hilfsfelder mit Präfix `rf970`

## Gemeinsam bearbeitete Integrationsdateien

Diese Dateien enthalten nur kleine Einhängepunkte und müssen beim Merge dreiseitig integriert werden:

- `public/rankforge/index.html`: neue CSS-/JS-Dateien nach den vorhandenen 9.6-Patches laden.
- `public/rankforge/service-worker.js`: beide Entwicklungslinien in den neuen R17-Cache aufnehmen.
- `public/rankforge/manifest.webmanifest`: Beschreibungen und Shortcuts beider Linien erhalten.
- `public/rankforge/version.txt`, `package.json`, `package-lock.json`, `app/layout.tsx`: auf 9.9/R17 vereinheitlichen.
- `public/rankforge/README.txt`, `README.md`, `CONTINUE-HERE.md`: Funktionslisten beider Linien zusammenführen.
- `tests/rankforge-v9.2.test.mjs`: Cache-Erwartungen auf den gemeinsamen R17-Build aktualisieren.

## Konfliktregeln

- Der bestehende Gym-Rank, Bodygraph, Startspruch, Timer und die Korrekturen aus 9.6 bleiben erhalten.
- Der Triathlon-Zustand bleibt unter `state.triathlon`; fremde Zustandsfelder dürfen nicht umbenannt oder gelöscht werden.
- Der bestehende Garmin-Namensraum `state.garmin` bleibt für importierte Schwimmeinheiten und Verbindungsstatus erhalten; Lauf- und Radaktivitäten werden normalisiert unter `state.triathlon` gespeichert.
- Falls die Parallelversion ebenfalls Navigation ergänzt, die mobile Navigation funktional und lesbar neu aufteilen; keinen Navigationspunkt still entfernen.
- Falls beide Versionen denselben Service-Worker-Cache ändern, eine neue gemeinsame Kennung verwenden und sämtliche Assets beider Linien aufnehmen.
- Falls beide Schema-Versionen erhöhen, die höhere freie gemeinsame Nummer verwenden und Migrationen beider Seiten nacheinander ausführen.
- Tier-Rangwerte dürfen bei einem UI-Merge nicht in die bestehende Kraft-Ranglogik eingreifen.
- Garmin-Client-Geheimnisse und OAuth-Tokens dürfen nie in `garmin-connect-config.js` oder andere Browserdateien gelangen. Die konfigurierbaren Pfade zeigen nur auf gleichursprüngliche Server-Endpunkte.

## Abnahmekriterien für 9.9

- Muskelaufbau, Schwimmen, Laufen und Radfahren sind als vier getrennte Unterkategorien erreichbar und visuell unterscheidbar.
- Schwimmen, Laufen und Radfahren zeigen jeweils genau neun Tier-Ränge.
- Manuelle Aktivitäten bleiben nach Neustart erhalten; lokale Garmin-Dateien werden für alle drei Ausdauersportarten normalisiert und ohne Duplikate eingebunden.
- Ohne Garmin-Freigabe bleibt der lokale JSON-/TCX-/GPX-Import funktionsfähig; mit Serverkonfiguration funktionieren Verbindungsstatus und Synchronisierung über die dokumentierten Endpunkte.
- Alle Funktionen der Parallelversion sind ebenfalls vorhanden.
- Offline-Cache enthält Assets beider Linien.
- Bestehende 9.6-Tests, 9.7-Triathlon-Tests, Tests der Parallelversion und neue Merge-Tests bestehen.
