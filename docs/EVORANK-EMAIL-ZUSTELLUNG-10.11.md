# EvoRank E-Mail-Zustellung und Geburtstagsgrüße

Damit Konto- und Geburtstagsmails nicht als Junk erscheinen, sollte EvoRank über eine eigene, verifizierte Absenderdomain senden. Ein privates Gmail-Postfach als SMTP-Absender ist für Produktmails nur eine Übergangslösung.

## Einmalige Einrichtung

1. Eine Absenderdomain bzw. Subdomain verwenden, z. B. `mail.evorank.app`.
2. Beim Mailanbieter (für die Geburtstagsfunktion ist Resend vorbereitet) Domain hinzufügen.
3. Die dort angezeigten SPF- und DKIM-DNS-Einträge beim Domainanbieter setzen.
4. Einen DMARC-Eintrag ergänzen, zunächst mit Monitoring: `v=DMARC1; p=none; rua=mailto:dmarc@evorank.app`.
5. In Supabase unter **Authentication → SMTP Settings** dieselbe verifizierte Domain als Custom SMTP verwenden. Dadurch kommen auch Registrierung, Bestätigung und Passwort-Reset von EvoRank statt vom Standardabsender.
6. Auf Netlify die Variablen `RESEND_API_KEY` und `EVORANK_EMAIL_FROM` setzen. Beispiel: `EvoRank <hallo@mail.evorank.app>`.
7. `db/SUPABASE-BIRTHDAY-10.11.sql` einmal im Supabase SQL Editor ausführen.

Netlify startet `birthday-email.mjs` täglich um 07:00 UTC. Die Datenbank verhindert doppelte Mails und doppelte Coin-Gutschriften im selben Kalenderjahr.

## Vor dem echten Versand testen

- Testadresse bei Gmail, Outlook und iCloud verwenden.
- Absender, Reply-To, Logo und Links prüfen.
- SPF, DKIM und DMARC mit den Diagnosefunktionen des Mailanbieters kontrollieren.
- Keine gekauften Verteiler verwenden und nur notwendige Produktmails senden.
