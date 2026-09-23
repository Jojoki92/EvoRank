# Online- und iPhone-Einrichtung X4.5

Die lokale Lieferung veröffentlicht nichts und richtet keine fremden Konten ein.
Alle nachstehenden Arbeiten erfolgen am **bestehenden** Netlify-/Supabase-Projekt.
Weder Domain noch Supabase-Projekt ersetzen, damit Konten und gespeicherte Daten bleiben.

## Freunde und Bestenlisten

1. Bestehendes `public/rankforge/cloud-config.js` beibehalten; keine geheimen
   Service-Schlüssel in diese öffentliche Datei schreiben.
2. Falls noch nicht eingerichtet, im bestehenden Supabase-Projekt die vorhandenen
   SQL-Dateien in ihrer dokumentierten Reihenfolge anwenden:
   `db/SUPABASE-KONTO-FREUNDE-9.8.sql`, `db/SUPABASE-GARMIN-AUTO-SYNC-10.8.sql`,
   `db/SUPABASE-LEADERBOARDS-10.9.sql`, `db/SUPABASE-PRODUCTION-10.10.sql` und
   gegebenenfalls `db/SUPABASE-BIRTHDAY-10.11.sql`. Historische anonyme
   `SUPABASE-FREUNDE-SETUP.sql` nicht als Ersatz verwenden.
3. Nutzer registrieren sich an derselben Website, wählen eigene Spitznamen und
   bestätigen Freundschaftsanfragen beidseitig. Öffentliche Bestenlisten benötigen
   zusätzlich die eigene Freigabe in „Sicherheit, Cloud & Support“.
4. Mit zwei Testkonten prüfen: Anfrage, Annahme, gegenseitige Sichtbarkeit,
   aktualisierte Leistung, Ablehnung/Entfernen und Privatsphäre ohne Freundschaft.
   Diese Online-Prüfung wurde für X4.5 noch nicht durchgeführt.

## Strava

Primärquellen: [Getting Started](https://developers.strava.com/docs/getting-started/),
[OAuth](https://developers.strava.com/docs/authentication/).

1. Eine eigene API-App bei Strava registrieren und die Callback-Domain der
   bestehenden EvoRank-Seite hinterlegen. Neue Apps sind in ihrer Nutzerzahl
   begrenzt; Felix muss innerhalb der freigegebenen Kapazität liegen. Aktuelle
   Voraussetzungen und Kapazität im Strava-Dashboard prüfen.
2. `db/SUPABASE-STRAVA-X4.5.sql` im bestehenden Supabase SQL Editor ausführen.
   Tabellen sind per RLS geschützt und für anon/authenticated gesperrt. Nur
   serverseitige Funktionen mit `service_role` lesen Token-/Aktivitätsdaten.
3. In **Netlify Environment Variables**, nur serverseitig, konfigurieren:

   | Variable | Inhalt |
   |---|---|
   | `SUPABASE_URL` | Bestehende Supabase-URL |
   | `SUPABASE_PUBLISHABLE_KEY` | Öffentlicher Projekt-Key, alternativ bestehender ANON-Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Geheimer Server-Key |
   | `STRAVA_CLIENT_ID` | Eigene Strava-App-ID |
   | `STRAVA_CLIENT_SECRET` | Geheimes Strava-Client-Secret |
   | `STRAVA_REDIRECT_URI` | `https://<bestehende-domain>/api/strava/callback` |
   | `STRAVA_TOKEN_ENCRYPTION_KEY` | Neuer zufälliger Schlüssel mit mindestens 32 Zeichen |

   Beispiel zur lokalen Erzeugung eines Schlüssels mit Node:
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
   Den Wert nur im Server-Dashboard speichern; nicht an Felix, ins Git oder in die
   Browser-Konfiguration geben. Ein späterer Schlüsselwechsel erfordert Neuverbinden
   bestehender Strava-Verbindungen, sofern keine kontrollierte Tokenmigration erfolgt.
4. Das vollständige Netlify-Paket einschließlich `netlify.toml` und
   `netlify/functions/` auf dem bestehenden Site veröffentlichen. ZIP-Inhalte nur
   als statische Dateien hochzuladen genügt nicht, wenn Netlify dabei die Funktionen
   nicht baut. Git-/CLI-Deployment mit Functions-Build verwenden.
5. In EvoRank anmelden → Profil → Strava & Garmin → Mit Strava verbinden.
   Strava-Zustimmung erfolgt beim Anbieter. Angefragt ist nur `activity:read`:
   keine Veröffentlichung, keine privaten „Nur du“-Aktivitäten, keine Strecken-
   Geometrien im gespeicherten Import.
6. Nach Rückkehr werden maximal 500 Aktivitäten aus 90 Tagen geladen. Weitere
   Aufrufe nutzen fünf Minuten denselben Stand, danach wird neu gelesen. Der
   nächste vollständige Abruf ersetzt den Importstand in diesem Zeitfenster.
7. „Verbindung trennen“ widerruft die Autorisierung und entfernt den serverseitigen
   Importcache. Die lokale Anzeige wird nach bestätigtem Trennen gelöscht.
   Änderungen auf Strava werden beim nächsten erfolgreichen Abruf übernommen.

Authentifizierte API-Routen: GET `/api/strava/status`, POST `/api/strava/connect`,
`/sync`, `/disconnect`. Nur der OAuth-Callback ist öffentlich; er verlangt
ein browsergebundenes, einmaliges und zeitlich begrenztes State-Token.
Kein Strava-Webhooks-/Dauer-Hintergrunddienst in X4.5. Im sichtbaren Client läuft
ein fünfminütiger Sync für verbundene Konten. Rate-Limits und Anbieterfehler
werden angezeigt. Alte Daten werden bei einem Abruffehler nicht überschrieben.
Abgelaufene OAuth-State-Zeilen können regelmäßig serverseitig bereinigt werden.

## Garmin

Die bestehende Einrichtung bleibt in
`docs/production/EVORANK-10.10-GARMIN-NETLIFY.md` dokumentiert.
Automatische Datenübernahme setzt Garmin-Developer-Freigabe und die dort
beschriebenen Servervariablen voraus. [Offizielles Programm](https://developer.garmin.com/gc-developer-program/overview/).
TCX-/GPX-/JSON-Import benötigt diese API-Freigabe nicht. Derselbe Lauf aus Garmin
und Strava würde zwei Einträge erzeugen; für dieselbe Aufzeichnung eine Quelle wählen.

## iPhone

`public/rankforge/native/ios/README.md` beschreibt Targets, Entitlements,
Signierung, Alarmdatei und verpflichtende Geräteprüfungen. X4.5 enthält Swift-
Quellbausteine, keine fertige `.ipa` und kein automatisch eingerichtetes Xcode-Projekt.
