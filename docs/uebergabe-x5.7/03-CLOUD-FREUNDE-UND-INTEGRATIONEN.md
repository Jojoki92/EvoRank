# Cloud, Freunde und Integrationen

## Tatsächlicher Status

Browsercode, SQL und Netlify-Funktionen sind vorhanden. Die letzte Arbeitsumgebung hat keine produktiven Zugangsdaten verwendet, keine Supabase-Tabellen geändert und keinen Netlify-Deploy durchgeführt. Funktionierender lokaler Code beweist nicht, dass das echte Backend entsprechend eingerichtet ist.

Die vorhandene öffentliche Supabase-URL und der Publishable Key in `public/rankforge/cloud-config.js` bleiben erhalten. Dieser Schlüssel ist für Browser vorgesehen, kein Service-Role-Secret. Schutz muss in Auth, RLS und Datenbankfunktionen liegen. Der aktuelle Zustand des genannten Projekts ist nicht aus der Konfigurationsdatei ableitbar.

## Wegweiser im Projekt

| Aufgabe | Dateien |
| --- | --- |
| Öffentliche Browserkonfiguration | `public/rankforge/cloud-config.js`, `garmin-connect-config.js` |
| Konto/Sync/Trennung | `public/rankforge/assets/account-bridge-v1.js`, `account-ui-v2.js`, `account-sync-v2.js`, `account-local-v10.7-r2.js` |
| Kontobezogene Cloud-Freigabe | `public/rankforge/assets/cloud-consent-x4.9.js` |
| Freunde | `public/rankforge/assets/rf93-friends-v1.js` und bestehende Account-/Ranking-Erweiterungen |
| Serverfunktionen und Routen | `public/rankforge/netlify/functions/`, `public/rankforge/netlify.toml` |
| Konten/Freunde SQL | `db/SUPABASE-KONTO-FREUNDE-9.8.sql` |
| Aktuelles zusammengefasstes Bestenlisten-Setup | `db/SUPABASE-BESTENLISTEN-X5.4.sql`, `docs/BESTENLISTEN-EINRICHTEN-X5.4.md` |
| Generator des Setups | `scripts/prepare-leaderboards-x5.4.mjs` |
| Garmin/Strava SQL | `db/SUPABASE-GARMIN-AUTO-SYNC-10.8.sql`, `db/SUPABASE-STRAVA-X4.5.sql` |
| Historische Produktionsabsicherung | `db/SUPABASE-PRODUCTION-10.10.sql`, `docs/production/` |
| Servervariable-Beispiele | `netlify.env.example`; Strava-Ergänzungen in `docs/EVORANK-X4.5-VERBINDUNGEN.md` |
| Lokale SQL-Regressionen | `tests/leaderboards-x5.4.test.mjs` |

## Einrichten ohne Datenverlust

1. Bestehendes Projekt und Domain bestätigen, aktuelle Schemas/Policies/RPCs aufnehmen. Nicht durch ein neues Projekt ersetzen.
2. Datenbankbackup und Migrationsplan erstellen. Historische Dateien sind keine pauschale Reihenfolge für jedes existierende Konto.
3. Das atomare X5.4-Bestenlisten-Setup setzt die vorhandene Kontodatenbank voraus. Es behandelt Gym, Lauf, Rad und Schwimmen. Das alte anonyme Freunde-Setup ist kein Ersatz dafür.
4. OAuth-Redirects, Site URL, SMTP und benötigte Servervariablen anhand des tatsächlichen Deploys einrichten. DNS-/Mailversand getrennt prüfen.
5. Netlify-Funktionen müssen beim Deployment gebaut werden. Ein beliebiger statischer ZIP-Upload garantiert keine bereitgestellten Functions. Zunächst lokalen Inhalt prüfen; Veröffentlichung erst gesondert durchführen.
6. Zwei Testkonten und getrennte Browserprofile verwenden. Keine privaten Trainings von Johannes für Tests auslesen oder überschreiben.

## Freigaben und Daten

- Login ist auch ohne optionales Cloud-Backup möglich. Die alte globale Freigabe `accepted` darf keinen anderen Account autorisieren.
- X5.7 verweigert Cloud-Freigabe, wenn das kontobezogene Modul fehlt; nach Aktivierung prüft die Oberfläche den gespeicherten Zustand.
- Öffentliche Bestenlisten und Freundes-Snapshots sind von privaten Kontodaten zu unterscheiden. Kein Geburtsdatum, keine E-Mail, Körpermaße oder Rohtrainings nachträglich öffentlich machen.
- Fehlende Ausdauerwerte alter Freunde-Snapshots zeigen „nicht verfügbar“, nicht einen übernommenen Gym-Rang.
- Bestenlisten sind überwiegend selbst gemeldete Leistungen, keine verifizierten Wettkampfergebnisse. Lokale JSON-Importe beweisen keine Garmin-Herkunft. Moderationsablehnungen dürfen nicht per Neuveröffentlichung aus dem Client verschwinden.
- Die Bestenliste ist kein garantierter Echtzeit-Ticker. Wiederöffnen/Aktualisieren sowie bestehende Cache-/Syncintervalle prüfen.
- Für Kontolöschung auch Providerverbindungen, Tokens, serverseitige Caches, öffentliche Einträge und vertragliche Aufbewahrungen berücksichtigen; nicht allein localStorage löschen.

## Strava

Code: `assets/strava-x4.5.js`, `netlify/functions/strava-*.mjs`, `_strava-common.mjs`.

Benötigte Servervariablen: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` bzw. `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`, `STRAVA_TOKEN_ENCRYPTION_KEY`. **Werte nicht in die Übergabe schreiben.**

Vorhandene Implementierung: serverseitiger OAuth-Ablauf mit zeitbegrenztem/einmaligem browsergebundenem State, verschlüsselte Tokens, Status/Sync/Trennen. Persönlicher Kalenderimport; höchstens 500 Aktivitäten aus 90 Tagen, fünfminütige Wiederverwendung/Synclogik. Kein dauerhaft laufender Strava-Webhookdienst in diesem Stand. Anbietergrenzen und Rechte erneut offiziell prüfen.

Strava-Daten dürfen nach der festgelegten Produktregel nicht in öffentliche Leistungsränge/Freundes-Snapshots eingehen. Beim Trennen lokale Anzeige erst nach bestätigter Servertrennung bereinigen; Fehler nicht als Erfolg melden. Token-/Schlüsselwechsel nicht ohne Migrationsplan.

## Garmin

Vorhanden: Connect/Callback/Status/Sync/Disconnect/Webhook, Verschlüsselung, freigegebener Push-/Pull-Vertrag. Die tatsächliche Garmin-Developer-Freigabe ist nicht nachgewiesen. Konkrete autorisierte OAuth-Endpunkte müssen aus dem Anbieterzugang stammen, nicht geraten werden.

Neben Basisvariablen nennt `_garmin-common.mjs`: `GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET`, `GARMIN_REDIRECT_URI`, `GARMIN_TOKEN_ENCRYPTION_KEY`, `GARMIN_WEBHOOK_SECRET`, Anbieter-URLs (`GARMIN_AUTHORIZATION_URL`, `GARMIN_TOKEN_URL`, `GARMIN_USER_INFO_URL`, `GARMIN_REVOCATION_URL`), `GARMIN_SCOPES`, `GARMIN_CLIENT_AUTH_METHOD`, `GARMIN_PULL_ALLOWED_HOSTS`. Welche davon nötig sind, ist mit der konkreten Freigabe zu prüfen.

TCX-/GPX-/JSON-Dateiimport ist vom echten Connect-Zugang getrennt. Ein Lauf aus zwei Quellen darf nicht unbemerkt zwei Einheiten erzeugen; bis zur gesicherten Deduplizierung eine Quelle pro Aufzeichnung nutzen.

## Testfälle vor Behauptung „Cloud fertig“

- Login/Logout, Passwortreset, nicht bestätigte Mail, Accountwechsel bei laufender Anfrage.
- Opt-in/Opt-out, fehlendes Consent-Modul, offline, Neustart, zweite Installation.
- Privatdatenzugriff A/B, Freundschaft A/B, Entfernen, Blockieren, Meldung, Moderation.
- Veröffentlichung/Widerruf aller vier Sportarten, keine Freigabe durch manipulierten Client.
- Abgelaufene/ungültige OAuth-States und Tokens, paralleler Refresh, Anbieterfehler, Rate-Limit, Trennen.
- Export, Löschung, Wiederherstellung und dokumentierte Lösch-/Backupfristen.

Alle Ergebnisse mit Datum, Umgebung und synthetischen Konten dokumentieren. Lokale PGlite-/Stubtests bleiben als Regressionen erhalten.
