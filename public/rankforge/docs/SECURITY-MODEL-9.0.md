# Sicherheitsmodell von RANKFORGE 9.0.0

## Lokale Daten

Vollständige Workouts, Sätze, Gewichte, Routinen, Körperdaten, Notizen und Einstellungen liegen im lokalen Browser-/App-Speicher des jeweiligen Geräts. Sie werden nicht automatisch in Supabase veröffentlicht.

## Optionale Live-Freunde

Supabase erhält nur eine kleine Profilzusammenfassung. Die SQL-Funktion verwirft unbekannte Felder und erzeugt Rank-, Muskel-, Statistik- und Garmin-Objekte aus einer festen Allowlist neu. Direkter Tabellenzugriff ist gesperrt. Ein Profil kann nur mit seinem privaten Schreibtoken aktualisiert oder gelöscht werden; serverseitig wird nur dessen Hash gespeichert.

## Schlüssel

Im Frontend ist ausschließlich ein Supabase Publishable Key zulässig. Secret- und Service-Role-Keys werden beim Start erkannt, entfernt und als Fehler angezeigt.

## Backups

Normale JSON-Backups bleiben für Kompatibilität verfügbar. Im Bereich „Sicherheit & Backup“ kann zusätzlich eine `.rfbackup`-Datei mit PBKDF2-SHA-256 und AES-GCM verschlüsselt werden. Die Passphrase verlässt das Gerät nicht und kann nicht wiederhergestellt werden.

## Imports

- Bilder: JPG, PNG oder WebP, maximal 8 MB, Prüfung von MIME-Typ und Magic Bytes.
- JSON/CSV/Text: Größen- und Strukturlimits.
- öffentliche Links: nur HTTP/HTTPS, keine privaten IP-Adressen, keine Zugangsdaten, beschränkte Weiterleitungen, Zeit- und Größenlimit.
- Link-Import: einfaches Burst-Limit pro Serverless-Instanz.

## Grenzen

RANKFORGE besitzt aktuell keinen zentralen Passwort- oder Apple-Login. Die lokale E-Mail dient zur Trennung der lokalen Accounts, nicht als verifizierte Identität. Für eine öffentliche Voll-Cloud-Version sind serverseitige Authentifizierung, globale Rate Limits und optional Bot-Schutz erforderlich.
