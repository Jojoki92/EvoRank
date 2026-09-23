# RANKFORGE 9.0.0 – Release-Status

## Umgesetzt

- Die 20 Sicherheitsmaßnahmen aus dem ersten bereitgestellten Video wurden einzeln auf die tatsächliche Architektur geprüft.
- Secret-/Service-Role-Schlüssel werden im Browser blockiert; Live-Freunde verwenden nur einen Supabase Publishable Key.
- RLS, entzogener Tabellenzugriff, RPC-Grenzen, Feld-Allowlist und gehashte Schreibtokens schützen öffentliche Freundesprofile.
- Sicherheitsheader, HTTPS-Regeln, verschlüsselte Backups, Bildsignaturprüfung, Importlimits und Dependency-Pinning sind enthalten.
- Texte und Oberflächen wurden auf generische AI-/SaaS-Muster geprüft und konkreter auf Training, Ranks, Sätze und Verlauf ausgerichtet.

## Bewusst nicht vorgetäuscht

- Die lokale E-Mail-Auswahl ist keine serverseitig bestätigte Anmeldung.
- Ohne Backend gibt es keine Passwort- oder Session-Cookies, daher sind Passwort-Hashing und Cookie-Härtung nicht direkt anwendbar.
- Bot-Schutz besteht derzeit aus Honeypot und begrenzten Importanfragen; öffentliche Massenregistrierung bräuchte zusätzlich Turnstile/Captcha.
- Native iOS-Funktionen sind vorbereitet, aber nicht in dieser Umgebung signiert oder auf einem echten iPhone getestet.

## Tests

Siehe `TEST-RESULTS-9.0.json`. Insgesamt 61 von 61 automatisierten Prüfungen bestanden.
