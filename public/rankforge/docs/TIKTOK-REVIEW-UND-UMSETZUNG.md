# RANKFORGE 9.0.0 – Prüfung der beiden TikTok-Videos

## Ergebnis in einem Satz

Die Sicherheitsliste aus Video 1 ist grundsätzlich sinnvoll, aber nicht jeder Punkt passt auf eine lokale Web-App ohne Passwort-Login. Die Hinweise aus Video 2 sind als Designwarnung sinnvoll, dürfen aber nicht zu einem austauschbaren „Anti-AI“-Look führen. RANKFORGE behält deshalb seine klare Gym-Rank-Identität und entfernt nur generische Muster.

## Video 1: 20 Sicherheitsmaßnahmen

| Nr. | Aussage aus dem Video | Bewertung für RANKFORGE | Umsetzung in 9.0.0 |
|---:|---|---|---|
| 1 | Hide API keys | Richtig, aber öffentliche und geheime Schlüssel unterscheiden | Secret-/Service-Role-Keys werden im Browser blockiert. Nur ein Supabase Publishable Key ist zulässig. |
| 2 | Purge Git secrets | Richtig | Automatischer Secret-Scan durchsucht Release und Quellcode nach typischen Schlüsselmustern. |
| 3 | Use public DB key | Richtig | Frontend akzeptiert nur einen Publishable/anon-artigen Schlüssel. |
| 4 | Enable row-level security | Richtig | Supabase-Tabelle hat RLS; direkter Tabellenzugriff für anon/authenticated ist entzogen. |
| 5 | Encrypt sensitive data | Sinnvoll, aber differenziert | Vollständige Backups können mit PBKDF2 + AES-GCM und eigener Passphrase verschlüsselt werden. Trainingsdaten bleiben lokal. |
| 6 | Enforce server-side auth | Für echte Cloud-Konten richtig | Aktuelle Accounts sind lokal und haben keine serverseitige Anmeldung. Für eine spätere Voll-Cloud-Version bleibt E-Mail-/Apple-Auth notwendig. |
| 7 | Lock record access | Richtig | Supabase-Zugriff erfolgt nur über eng begrenzte RPC-Funktionen; Schreibzugriff benötigt ein gehashtes Profil-Token. |
| 8 | Block field tampering | Richtig | Die Datenbank baut das öffentliche Profil aus einer festen Feldliste neu auf und verwirft unbekannte Felder. Rankname, Farbe und Division werden aus dem Score abgeleitet. |
| 9 | Secure session cookies | Nur bei serverseitigen Sessions relevant | RANKFORGE verwendet aktuell keine Session-Cookies. |
| 10 | Hash passwords | Nur bei Passwörtern relevant | Es werden keine Passwörter gespeichert. Das private Profil-Schreibtoken liegt serverseitig nur als SHA-256-Hash vor. |
| 11 | Rate limit login | Nur bei einem echten Login-Endpunkt relevant | Kein zentraler Login-Endpunkt. Der Serverless Workout-Link-Import besitzt jetzt Burst-Limits. |
| 12 | Add bot protection | Teilweise sinnvoll | Feedback nutzt Netlify-Honeypot. Für spätere öffentliche Registrierung wäre zusätzlich Captcha/Turnstile sinnvoll. |
| 13 | Parameterize queries | Richtig | Supabase verwendet feste RPC-Parameter; keine vom Nutzer zusammengesetzten SQL-Strings. |
| 14 | Validate all input | Richtig | Größen-, Bereichs-, Typ-, URL-, Dateiformat- und Profilprüfungen sind vorhanden. |
| 15 | Escape user content | Richtig | Namen, Notizen und importierte Texte werden vor HTML-Ausgabe escaped. |
| 16 | Restrict file uploads | Richtig | Bildtyp, Dateigröße und echte Magic Bytes werden geprüft; Importdateien besitzen Größenlimits. |
| 17 | Trim API responses | Richtig | Live-Freunde erhalten nur feste Zusammenfassungen; Workout-Link-Import begrenzt Antwortgröße und Textlänge. |
| 18 | Add security headers | Richtig | CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, Frame-Schutz und restriktive Ressourcenregeln wurden ergänzt. |
| 19 | Force HTTPS | Richtig | Netlify liefert HTTPS; HSTS und `upgrade-insecure-requests` sind gesetzt. Lokaler Windows-Start ist die einzige vorgesehene Ausnahme. |
| 20 | Scan dependencies | Richtig | Tesseract ist auf eine feste Version gepinnt; automatischer Release-Scan prüft externe Quellen, Secret-Muster und Sicherheitsdateien. |

## Video 2: Woran „AI Slop“ erkennbar wird

Aus dem Video wurden nur die Punkte übernommen, die für RANKFORGE wirklich relevant sind:

- keine austauschbare Lila-Blau-Verlaufs-Landingpage als Hauptdesign;
- keine unklare Werbesprache wie „AI-powered intelligence“ ohne konkrete Funktion;
- keine erfundenen Nutzerzahlen, Erfolgsquoten oder Early-Access-Badges;
- keine immer gleichen Pillen, Karten und Textblöcke nur als Dekoration;
- keine Platzhalter-Rechtsseiten;
- unnötige Gedankenstriche in Werbesätzen vermeiden;
- echte Produktdaten und Handlungen zeigen: Rank, Satz, Pause, Übung, Verlauf, Bodygraph.

Nicht übernommen wurde die Idee, jedes moderne UI-Muster zu vermeiden. Karten, Tabs und klare Status-Chips sind in einer Trainings-App funktional. Entscheidend ist, dass sie konkrete Daten zeigen und nicht bloß eine generische Vorlage füllen.

## Sichtbare Produktentscheidung

Die Home-Seite bleibt bewusst RANKFORGE: schwarzer Gym-Look, echte Rank-Abzeichen, anklickbarer Bodygraph, aktuelle Trainingsdaten und eine frei wählbare Akzentfarbe. Das Design wurde nicht in eine beliebige SaaS-Landingpage umgebaut.
