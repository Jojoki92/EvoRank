# EVORANK 10.10 – Garmin-Dauersynchronisierung

EVORANK verwendet die Garmin Activity API serverseitig. Der Nutzer verbindet
Garmin einmal per OAuth; danach übernimmt der Webhook neue Aktivitäten und die
App lädt sie beim Öffnen oder Wiederverbinden nach.

## Voraussetzungen

1. Garmin Developer Program und Activity API beantragen.
2. Die endgültige Callback-URL registrieren:
   `https://DEINE-DOMAIN/.netlify/functions/garmin-callback`
3. Die Werte aus `netlify.env.example` in den Hosting-Einstellungen setzen.
   Dazu gehören insbesondere `GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET`,
   `GARMIN_REDIRECT_URI`, `GARMIN_TOKEN_ENCRYPTION_KEY` und
   `GARMIN_WEBHOOK_SECRET`. Alle diese Werte bleiben ausschließlich auf dem
   Server und gehören niemals in `cloud-config.js` oder in den Browser-Code.
4. `SUPABASE-GARMIN-AUTO-SYNC-10.8.sql` und danach
   `SUPABASE-PRODUCTION-10.10.sql` ausführen.
5. Webhook/Ping-Pull in Garmin auf
   `https://DEINE-DOMAIN/.netlify/functions/garmin-webhook` richten.

## Sicherheitsregeln

- Client Secret, Service Role und Verschlüsselungsschlüssel bleiben ausschließlich serverseitig.
- OAuth-Tokens werden verschlüsselt abgelegt.
- Ohne Garmin-Freigabe startet die App weder Verbindung noch automatischen Abruf.
- Beim Widerruf wird die Serververbindung getrennt.

Garmin-Freigabe und echte Zugangsdaten können nicht durch die App-Datei ersetzt
werden. Offizielle API-Übersicht: https://developer.garmin.com/gc-developer-program/activity-api/
