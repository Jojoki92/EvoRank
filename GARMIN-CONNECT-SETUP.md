# EVORANK 10.9 – Garmin dauerhaft verbinden

## Was Version 10.9 bereits kann

EVORANK ist jetzt für eine dauerhafte Garmin-Verbindung vorbereitet:

1. Der Nutzer meldet sich einmal bei Garmin an und stimmt der Verbindung zu.
2. Garmin sendet neue Aktivitäten an eine geschützte Netlify Function.
3. Die Function speichert die Aktivitäten sicher in Supabase.
4. EVORANK holt die gespeicherten Aktivitäten beim Start, beim Zurückkehren in
   die App, nach einer erneuten Internetverbindung und zusätzlich regelmäßig ab.

Der lokale Import von Garmin-JSON-, TCX- und GPX-Dateien bleibt weiterhin
nutzbar.

## Wichtig: Was noch von Garmin benötigt wird

Die automatische Verbindung kann nicht allein mit einem normalen Garmin-Konto
aktiviert werden. Garmin vergibt die Activity API über das Garmin Connect
Developer Program an zugelassene Unternehmen. Nach der Freigabe erhältst du die
Client-ID, das Client-Secret und die exakten OAuth-Adressen.

Offizielle Anmeldung:
https://developer.garmin.com/gc-developer-program/

Garmin Activity API:
https://developer.garmin.com/gc-developer-program/activity-api/

Gib dort als Anwendung **EVORANK** und als Website diese Adresse an:

`https://clinquant-ganache-551532.netlify.app`

## Schritt 1 – Garmin-Freigabe beantragen

1. Öffne die Seite des Garmin Connect Developer Programs.
2. Melde dich mit deinem Garmin-Konto an.
3. Beantrage Zugriff für EVORANK als Fitness-App.
4. Wähle die **Activity API** für Schwimmen, Laufen und Radfahren.
5. Gib als Rücksprungadresse genau Folgendes an:

   `https://clinquant-ganache-551532.netlify.app/api/garmin/callback`

6. Gib als Benachrichtigungs-/Webhook-Adresse genau Folgendes an:

   `https://clinquant-ganache-551532.netlify.app/api/garmin/webhook?secret=DEIN_WEBHOOK_GEHEIMNIS`

`DEIN_WEBHOOK_GEHEIMNIS` wird in Schritt 3 erstellt. Falls Garmin zuerst eine
Webhook-Adresse verlangt, kannst du diesen Schritt nach dem Netlify-Setup
ergänzen.

## Schritt 2 – Garmin-Tabellen in Supabase anlegen

1. Öffne dein Supabase-Projekt.
2. Links **SQL Editor** öffnen.
3. **New query** wählen.
4. Die Datei `db/SUPABASE-GARMIN-AUTO-SYNC-10.8.sql` öffnen.
5. Den gesamten Inhalt kopieren und in den SQL Editor einfügen.
6. **Run** anklicken.

Die drei Garmin-Tabellen sind absichtlich nicht direkt aus dem Browser
erreichbar. Nur die serverseitigen Netlify Functions dürfen sie lesen.

## Schritt 3 – geheime Werte in Netlify eintragen

1. Öffne in Netlify dein Projekt **clinquant-ganache-551532**.
2. Öffne **Project configuration → Environment variables**.
3. Lege die folgenden Variablen an.

| Name | Wert |
|---|---|
| `SUPABASE_URL` | Deine Supabase Project URL, zum Beispiel `https://…supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Der Publishable Key deines Supabase-Projekts |
| `SUPABASE_SERVICE_ROLE_KEY` | Der geheime Service-Role-Key aus Supabase |
| `GARMIN_CLIENT_ID` | Von Garmin nach der Freigabe |
| `GARMIN_CLIENT_SECRET` | Von Garmin nach der Freigabe |
| `GARMIN_AUTHORIZATION_URL` | Exakt aus der Garmin-Developer-Dokumentation |
| `GARMIN_TOKEN_URL` | Exakt aus der Garmin-Developer-Dokumentation |
| `GARMIN_USER_INFO_URL` | Garmins freigegebener Endpunkt für die Benutzerkennung |
| `GARMIN_REDIRECT_URI` | `https://clinquant-ganache-551532.netlify.app/api/garmin/callback` |
| `GARMIN_SCOPES` | Exakt die von Garmin freigegebenen Activity-Scopes |
| `GARMIN_CLIENT_AUTH_METHOD` | `basic` oder `post`, genau wie Garmin es vorgibt |
| `GARMIN_TOKEN_ENCRYPTION_KEY` | Ein selbst erzeugtes zufälliges Geheimnis mit mindestens 32 Zeichen |
| `GARMIN_WEBHOOK_SECRET` | Ein zweites zufälliges Geheimnis mit mindestens 32 Zeichen |
| `GARMIN_PULL_ALLOWED_HOSTS` | Die in Garmins Unterlagen genannte Callback-Domain, ohne `https://` |

Für die beiden selbst erzeugten Geheimnisse zwei unterschiedliche lange,
zufällige Passwörter verwenden. Niemals dein Garmin-Passwort, Gmail-Passwort
oder Supabase-Passwort dafür benutzen.

**Diese geheimen Werte niemals in `cloud-config.js`, in einen Screenshot oder
in einen Chat kopieren.** Der Browser darf nur den bereits vorhandenen Supabase
Publishable Key kennen.

## Schritt 4 – Version 10.9 bei Netlify bereitstellen

1. Das Paket `EVORANK-10.9-NETLIFY.zip` entpacken.
2. Netlify öffnen und das bestehende EVORANK-Projekt auswählen.
3. Unter **Deploys** den entpackten Ordner hochladen.
4. Darauf achten, dass `index.html`, `netlify.toml` und der Ordner `netlify`
   direkt auf der ersten Ebene liegen.
5. Nach Änderungen an den Environment Variables einmal neu deployen.

## Schritt 5 – Verbindung testen

1. EVORANK über die Netlify-Adresse öffnen und im EVORANK-Konto anmelden.
2. **Sport → Garmin öffnen → Garmin verbinden** wählen.
3. Bei Garmin anmelden und den Zugriff bestätigen.
4. Eine Aktivität mit der Garmin-Uhr aufzeichnen.
5. Die Uhr mit Garmin Connect synchronisieren.
6. EVORANK schließen und wieder öffnen.

Die neue Aktivität sollte ohne erneute Garmin-Anmeldung erscheinen. Bei einem
Fehler in Netlify **Logs & Metrics → Functions** öffnen und zuerst die Logs von
`garmin-callback` und `garmin-webhook` prüfen.

## Wenn die Garmin-Freigabe noch fehlt

Das ist kein Fehler in EVORANK. Bis Garmin die Developer-Zugangsdaten freigibt,
zeigt die App einen entsprechenden Hinweis. Verwende in dieser Zeit weiterhin
**Garmin-Datei importieren**.
