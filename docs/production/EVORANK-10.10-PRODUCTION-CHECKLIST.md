# EVORANK 10.10 – Produktionscheckliste

## Vor dem öffentlichen Start

- [ ] `SUPABASE-KONTO-FREUNDE-9.8.sql` ausführen.
- [ ] `SUPABASE-GARMIN-AUTO-SYNC-10.8.sql` ausführen.
- [ ] `SUPABASE-LEADERBOARDS-10.9.sql` ausführen.
- [ ] `SUPABASE-PRODUCTION-10.10.sql` als letzte SQL-Datei ausführen.
- [ ] Supabase Site URL und Redirect URLs für die endgültige Domain setzen.
- [ ] SMTP-Absender und Testversand prüfen; für Produktion SPF, DKIM und DMARC einrichten.
- [ ] Garmin Developer Program, OAuth-Redirect und Push-Webhook freischalten.
- [ ] Alle Servervariablen setzen; Service Role, Garmin Secret und Token-Key niemals im Browser ablegen.
- [ ] Registrierung, Bestätigung, Anmeldung, Passwort-Reset und Kontolöschung testen.
- [ ] Cloud-, Bestenlisten-, Garmin- und Diagnosefreigabe jeweils an/aus testen.
- [ ] Bestenlisten-Widerruf, Melden und Blockieren testen.
- [ ] JSON-Backup exportieren und auf einem zweiten Browser importieren.
- [ ] Offline-Start und Wiederverbindung testen.
- [ ] Datenschutz, Bedingungen und Support rechtlich prüfen lassen.

## iPhone

- [ ] Xcode-App, Widget Extension, App Group und ActivityKit-Entitlement konfigurieren.
- [ ] Live Activity auf Sperrbildschirm und Dynamic Island testen.
- [ ] Deep Link `evorank://workout/current` testen.
- [ ] Signierung, Datenschutzangaben und App-Store-Review vorbereiten.

## Freigabekriterium

Veröffentlichen, wenn Build, automatisierte Tests und Sicherheitsprüfung ohne
Fehler laufen und die oben benötigten externen Konten tatsächlich freigeschaltet sind.
