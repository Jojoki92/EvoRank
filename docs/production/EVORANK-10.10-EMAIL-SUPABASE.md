# EVORANK 10.10 – Supabase und Gmail

## 1. Gmail vorbereiten

1. Mit `evorank.fitness@gmail.com` bei Google anmelden.
2. Zwei-Schritt-Bestätigung aktivieren.
3. In den Google-Kontoeinstellungen ein **App-Passwort** für EVORANK erzeugen.
4. Das 16-stellige App-Passwort nur in Supabase eintragen – niemals in App-Dateien.

## 2. Supabase SMTP

Unter **Authentication → Emails / SMTP** eintragen:

| Feld | Wert |
| --- | --- |
| Sender email address | `evorank.fitness@gmail.com` |
| Sender name | `EVORANK` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | `evorank.fitness@gmail.com` |
| Password | das Google-App-Passwort |
| Minimum interval per user | `60` Sekunden |

Wichtig: In deinem früheren Screenshot waren Absendername und Absenderadresse
vertauscht. Im Feld **Sender email address** muss wirklich die E-Mail-Adresse
stehen; **Sender name** ist `EVORANK`.

Gmail eignet sich für kleine Tests. Für eine öffentliche App ist ein
Transaktionsmail-Anbieter mit eigener Domain, SPF, DKIM und DMARC zuverlässiger.

## 3. URLs

- **Site URL:** endgültige HTTPS-Adresse der App.
- **Redirect URLs:** dieselbe Adresse sowie `/**` und jede tatsächlich verwendete Domain.
- Keine fremden oder alten Domains unnötig freigeben.

## 4. Test

Neues Testkonto registrieren, Bestätigungslink öffnen, abmelden, erneut anmelden
und anschließend „Passwort vergessen“ vollständig testen.

Offizielle Hinweise:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://support.google.com/accounts/answer/185833
