# Merge-Manifest – RankForge 9.9

## Ergebnis

RankForge 9.9 ist eine dreiseitige Zusammenführung der fertigen Versionen 9.7 und 9.8 gegen ihren gemeinsamen Ausgangsstand RankForge 9.6. Beide Funktionslinien bleiben vollständig erhalten.

## Übernommene Linie 9.7

- `assets/triathlon-v9.7.js` und `assets/triathlon-v9.7.css`
- Sportnavigation für Muskelaufbau, Schwimmen, Laufen und Radfahren
- 27 Tier-Ränge, lokale Ausdauer-Einheiten, Fortschritt und nächste Einheit
- Garmin-JSON-/TCX-/GPX-Import und sichere Vorbereitung gleichursprünglicher OAuth-Endpunkte
- Zustand unter `state.triathlon`, Garmin-Zustand unter `state.garmin`

## Übernommene Linie 9.8

- `account-sync-v2.js`, `account-ui-v2.js`, `account-bridge-v1.js`
- `rf93-unilateral-v1.js` und `rf93-friends-v1.js`
- E-Mail-/Passwortkonto, Wiederherstellung, Profil und bestätigte Freunde
- Links-/Rechts-Sätze sowie getrennte Rank- und Volumenberechnung
- Supabase-Schema `db/SUPABASE-KONTO-FREUNDE-9.8.sql`

## Verbindliche Ladefolge

1. Cloud- und Garmin-Konfiguration
2. Konto v2 und Konto-Brücke
3. stabiler Sicherheits-, App- und Bodygraph-Kern
4. RankForge-Kern, Übersetzungen und stabiler Patch
5. Links-/Rechts- und Freunde-Erweiterung
6. Triathlon-Erweiterung zuletzt, damit sie die bereits erweiterte Navigation ergänzt statt ersetzt

Alle Dateien verwenden `990-r2`; der Offline-Cache heißt `rankforge-v9.9.0-r2`.

## Abnahme

- Tests beider Entwicklungslinien müssen gemeinsam laufen.
- Ein Integrationstest prüft Reihenfolge, Cache, Version und das Vorhandensein aller exklusiven Module.
- Das bestehende 9.6-Design darf durch die Zusammenführung nicht verändert werden.
- Browser-Builds enthalten weder Supabase-Service-Role-Schlüssel noch Garmin-Client-Secrets oder OAuth-Tokens.
