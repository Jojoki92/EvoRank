# EVORANK 10.7 – Supabase und Gmail ganz einfach einrichten

Diese Anleitung sorgt dafür, dass neue Nutzer nach der Registrierung wirklich
eine Bestätigungs-E-Mail von EVORANK erhalten. Sie richtet außerdem den Link
„Passwort vergessen“ ein.

## Was du bereithalten musst

- den Login zu deinem Supabase-Konto
- deine feste Netlify-Adresse, zum Beispiel `https://dein-name.netlify.app`
- den Login zu deinem neuen EVORANK-Gmail-Konto
- ungefähr 10 bis 15 Minuten Zeit

Wichtig: Sende niemandem dein Gmail-Passwort, dein App-Passwort oder einen
geheimen Supabase-Schlüssel. Diese Werte gehören nur in die geschützten
Einstellungen von Google beziehungsweise Supabase.

## Teil 1 – Gmail für Supabase vorbereiten

1. Melde dich im Browser bei deinem neuen EVORANK-Gmail-Konto an.
2. Öffne <https://myaccount.google.com/security>.
3. Suche **Bestätigung in zwei Schritten** und schalte sie ein.
4. Öffne danach <https://myaccount.google.com/apppasswords>.
5. Falls Google erneut nach deinem Passwort fragt, melde dich an.
6. Gib als Namen **EVORANK Supabase** ein.
7. Klicke auf **Erstellen**.
8. Google zeigt jetzt ein 16-stelliges App-Passwort an. Kopiere es sofort und
   speichere es vorübergehend an einem sicheren Ort.

Dieses App-Passwort ist nicht dein normales Gmail-Passwort. Genau dieses
16-stellige App-Passwort wird später einmalig in Supabase eingefügt.

Wenn **App-Passwörter** nicht angezeigt wird, ist meistens die Bestätigung in
zwei Schritten noch nicht vollständig aktiviert. Bei Schul-, Firmen- oder
besonders geschützten Google-Konten kann Google App-Passwörter sperren.

Offizielle Google-Hilfe:
<https://support.google.com/mail/answer/185833>

## Teil 2 – Gmail als Absender in Supabase eintragen

1. Öffne <https://supabase.com/dashboard>.
2. Öffne das Supabase-Projekt, das EVORANK verwendet.
3. Klicke links auf **Authentication**.
4. Öffne **SMTP Settings**. Je nach Supabase-Ansicht liegt dieser Punkt unter
   **Emails**, **Settings** oder **Project Settings → Authentication**.
5. Schalte **Custom SMTP** beziehungsweise **Enable Custom SMTP** ein.
6. Trage die Felder genau so ein:

| Feld in Supabase | Eintrag |
| --- | --- |
| Sender name | `EVORANK` |
| Sender email | deine vollständige neue EVORANK-Gmail-Adresse |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | dieselbe vollständige EVORANK-Gmail-Adresse |
| Password | das 16-stellige Google-App-Passwort aus Teil 1 |

7. Falls Supabase nach Verschlüsselung fragt, wähle **SSL/TLS**.
8. Klicke auf **Save**.

Verwende im Passwortfeld keine Leerzeichen. Verwende dort niemals dein normales
Gmail-Passwort.

Offizielle Supabase-Hilfe:
<https://supabase.com/docs/guides/auth/auth-smtp>

## Teil 3 – E-Mail-Anmeldung einschalten

1. Bleibe in Supabase unter **Authentication**.
2. Öffne **Providers** oder **Sign In / Providers**.
3. Öffne **Email**.
4. Schalte **Enable Email provider** ein.
5. Schalte **Confirm email** ein. Dadurch muss ein neuer Nutzer seine Adresse
   bestätigen, bevor das Konto vollständig freigeschaltet wird.
6. Speichere die Einstellung.

## Teil 4 – Deine Netlify-Adresse eintragen

Nimm deine echte Netlify-Adresse. In diesem Beispiel ist sie
`https://dein-name.netlify.app`. Ersetze nur `dein-name` durch deinen echten
Netlify-Namen.

1. Öffne in Supabase **Authentication → URL Configuration**.
2. Trage bei **Site URL** deine feste Netlify-Adresse ein:

   `https://dein-name.netlify.app`

3. Füge bei **Redirect URLs** diese Adresse hinzu:

   `https://dein-name.netlify.app/**`

4. Klicke auf **Save**.

Das `/**` am Ende ist absichtlich dort. Es erlaubt Supabase, nach der
Bestätigung wieder die richtige EVORANK-Seite auf deiner Netlify-Adresse zu
öffnen. EVORANK 10.7 erkennt die Domain automatisch; du musst die Netlify-Adresse
nicht mehr in den Programmcode schreiben.

Offizielle Supabase-Hilfe:
<https://supabase.com/docs/guides/auth/redirect-urls>

## Teil 5 – Datenbank einmalig vorbereiten

Dieser Teil ist für Konto-Sicherung und Freunde nötig.

1. Öffne im vollständigen EVORANK-Backup die Datei
   `db/SUPABASE-KONTO-FREUNDE-9.8.sql`.
2. Öffne in Supabase links den **SQL Editor**.
3. Klicke auf **New query**.
4. Kopiere den gesamten Inhalt der SQL-Datei hinein.
5. Klicke auf **Run**.
6. Warte auf die grüne Erfolgsmeldung.

In die Website gehören nur die **Project URL** und der öffentliche
**Publishable Key**. Ein `service_role`-, `sb_secret_`- oder anderer geheimer
Schlüssel darf niemals in `cloud-config.js` stehen.

## Teil 6 – Einen echten Test machen

1. Lade EVORANK 10.7 auf deine bestehende Netlify-Seite hoch.
2. Öffne die Netlify-Adresse in Safari oder Chrome.
3. Registriere ein Testkonto mit einer anderen E-Mail-Adresse als der
   EVORANK-Support-Adresse.
4. Warte ein bis zwei Minuten und prüfe auch Spam/Junk.
5. Öffne die EVORANK-Bestätigungs-E-Mail und tippe auf den Link.
6. Der Link muss wieder deine Netlify-App öffnen.
7. Melde dich mit dem Testkonto an.
8. Teste danach zusätzlich **Passwort vergessen**.
9. Öffne in Supabase **Authentication → Users**. Beim Testnutzer sollte die
   E-Mail als bestätigt angezeigt werden.

## Wenn keine E-Mail kommt

| Meldung oder Problem | Lösung |
| --- | --- |
| `Email address not authorized` | Custom SMTP wurde noch nicht gespeichert; ohne eigenes SMTP sendet Supabase nur an Projekt-Teammitglieder. |
| Gmail meldet falsches Passwort | Das 16-stellige App-Passwort verwenden, nicht das normale Gmail-Passwort. |
| Link öffnet die falsche Seite | Site URL und Redirect URL in Teil 4 nochmals exakt prüfen. |
| Zu viele E-Mail-Anfragen | Einige Minuten warten und nur einmal erneut senden. |
| App-Passwörter fehlen bei Google | Bestätigung in zwei Schritten vollständig aktivieren; bei Schul-/Firmenkonten kann die Funktion gesperrt sein. |
| E-Mail landet im Spam | Absendername kurz halten, Betreff klar formulieren und die Nachricht aus Spam als „Kein Spam“ markieren. |

Supabase begrenzt den eingebauten Testversand stark und sendet ohne eigenes
SMTP nur an freigegebene Projektadressen. Deshalb hatten neue Nutzer vorher oft
keine Nachricht erhalten. Für die ersten Tests und eine kleine Nutzerzahl kann
dein eigenes Gmail-Konto verwendet werden. Eine eigene Domain ist dafür noch
nicht zwingend erforderlich.

