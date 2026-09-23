# Priorisierte nächste Schritte

Diese Liste fasst bestehende Wünsche und noch offene Voraussetzungen zusammen. Die Priorität ist eine vorgeschlagene Arbeitsreihenfolge, kein neuer Auftrag zu ungefragten Veröffentlichungen oder Käufen. In dieser Übergabe wird keine zusätzliche Funktion gebaut.

## 1. Übernahme und reale iPhone-Prüfung

- Alle ZIPs zusammenführen; Manifest prüfen; `npm ci`, `npm run test:x5`, Build ausführen.
- Bestehende Website-Origin und Daten sichern/erhalten. Ein Upgrade nicht durch Löschen der Browserdaten erzwingen.
- X5.7 auf einem echten iPhone in Safari **und** als Home-Screen-PWA prüfen: Formular unter Statusleiste, Tastatur, Querformat, Scrollen, Erreichbarkeit Speichern/Schließen; Leiste und Plus; Core und beide Unterarme bei Mann/Frau vorne/hinten; Helligkeit/Farbe bei Auswahl; 36 Icons im hellen Modus.
- Vorher/nachher Screenshots mit Testprofil aufnehmen. Falls etwas nicht passt, vorhandene Module korrigieren; keine zweite Figur oder neue Designvariante.
- Fertig, wenn die gemeldeten Stellen auf dem realen Gerät bedienbar und sichtbar sind und die automatisierten Regressionen weiterhin bestehen. Windows-WebKit allein reicht dafür nicht.

## 2. Cloud, Freunde und Bestenlisten wirklich einrichten und prüfen

- Mit Johannes den Zugang zum **bestehenden** Netlify-/Supabase-Projekt und dessen aktuellen Zustand klären. Keine Secrets in den Chat oder in die ZIPs kopieren.
- Bestehende Tabellen/RPCs/RLS/Einwilligungen feststellen; Backup vor notwendigen Migrationen. X5.4-Bestenlisten-Setup gezielt nutzen, nicht sämtliche historischen SQL-Dateien blind neu ausführen.
- Zwei getrennte Testkonten: Registrierung, Mailbestätigung, Login/Reset, private Datenisolation, Cloud-Opt-in/Opt-out, Freunde anfragen/akzeptieren/entfernen, Sport-Snapshots, Rankingfreigabe/Widerruf, Blockieren/Melden, Löschen und Wiederherstellen prüfen.
- Fertig, wenn Ergebnisse am realen Backend belegt sind, kein Account fremde/private Daten erhält und serverseitige Freigaben auch bei manipuliertem Client greifen.

## 3. Native iPhone-App mit Dynamic Island und Widgets fertigstellen

- Auf Mac/Xcode ein richtiges Projekt mit Haupt-App und Widget Extension erstellen; vorhandene Swift-Dateien integrieren (siehe 04).
- Eigene Bundle IDs, App Group, Team/Signierung, Entitlements, Deep Links, Originbegrenzung und System-OAuth einrichten.
- Vordergrundton, Musikabsenkung/Unterbrechung, geplante lokale Mitteilung bei Sperre, Live Activity, Dynamic Island und Widget auf Gerät testen.
- Kein erfundenes Versprechen über Stummmodus/Fokus/erzwungenes Weiterlaufen anderer Musik-Apps. Webtimer allein ist kein Hintergrundwecker.
- Fertig, wenn reproduzierbar gebaut/signiert, auf echtem Gerät getestet und die Prüfmatrix dokumentiert ist. Erst danach TestFlight, später App Store. Swift-Quelldateien allein erfüllen diesen Punkt nicht.

## 4. GPS und Sportimporte in echten Bedingungen prüfen

- Lauf/Rad mit genehmigtem Standort im Vordergrund: Start, Pause, Fortsetzen, ungenaues GPS, Standort verweigert, Empfangslücke, Distanz, Zeit, Wiederöffnen/Abbruch prüfen.
- Schwimmen: Bahnlänge, Zählung, Pausen, manuelle Korrektur und Speichern prüfen. Keine nicht vorhandene automatische Sensorauswertung behaupten.
- Für zuverlässige Aufzeichnung bei gesperrtem iPhone ist ein gesondertes natives Trackingkonzept nötig. Derzeit gibt es keine fertig gelieferte native Hintergrund-GPS-Strecke.
- Garmin-Partnerfreigabe und Strava-Appzugang klären; echte OAuth-/Sync-/Trenn-/Fehlerfälle prüfen. Gleiche Aktivität nicht doppelt aus beiden Anbietern zählen.
- Fitnessdaten korrekt kennzeichnen: manuell, gemessen, geschätzt, importiert. Strava bleibt persönlicher Kalender, nicht öffentliche Leistungsränge.

## 5. Öffentliche Veröffentlichung vorbereiten

- Fehlende Betreiberanschrift und Unternehmensstatus, Bild-/Tabellenrechte, Produktions-Datenschutz und Zielalter klären (07).
- Konkrete Anbieter-/App-Store-Regeln zum Zeitpunkt der Umsetzung neu prüfen; historische Links/Preise sind keine aktuelle Freigabe.
- Rechtstexte anhand bestätigter Fakten aktualisieren, Lösch-/Export-/Widerrufsprozesse am echten Dienst nachweisen; gegebenenfalls fachlich prüfen lassen.
- Veröffentlichung ist eine eigenständige externe Aktion. Der Übergabeauftrag veröffentlicht nichts.

## 6. Spätere Käufe und weitere Produktpflege

- Johannes will zunächst eine kostenlose App; zusätzliche kostenpflichtige Inhalte sind **geplant, nicht implementiert**. Vorher konkrete Produkte, Entitlements, StoreKit, Wiederherstellung, Preise, Verbraucherschutz und Datenschutz festlegen. Keine Bezahlfunktion aus einer bloßen UI-Schaltfläche ableiten.
- Apple Health wurde als mögliche Verbindung gewünscht; es gibt hier keinen belegten fertig getesteten HealthKit-Import. Als separates natives Integrationsprojekt behandeln, nicht mit Garmin-/Strava-Sync verwechseln.
- Rohleistungs-Fortschritt und altersangepassten Rang weiterhin getrennt erklären. Keine beliebigen Größen-/Gewichtsboni einbauen.
- Codepflege ist sinnvoll, aber erst nach gesicherter Übernahme: viele historische Wrapper sind aktiv. Nur schrittweise und mit Init-, Speicher- und Rangregressionen vereinfachen.

## Nicht wieder rückgängig machen

Grüne fertige Sätze/Übungen; sanft grauer statt rechteckiger Körperhintergrund; dunklere Auswahl derselben Muskelrangfarbe; äußere Beschriftungen aller Sportgrafiken; transparente Rangbilder im hellen Modus; keine Rangabzeichen in großen Startkarten; Körperdaten nur im Bearbeiten-Formular; konfigurierbare Startseite; kein eigener Stil für neue Plan-/Audio-/Cloud-Elemente; keine Reload-Schleife beim Service-Worker-Update.
