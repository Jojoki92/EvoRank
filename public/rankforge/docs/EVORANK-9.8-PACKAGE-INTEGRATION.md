# EvoRank 9.8 – Paketintegration

Stand: 25. August 2026

## Quelle

EvoRank 9.8 integriert die Funktionen aus `EVORANK-9.3.0-NETLIFY.zip` in den stabilen EvoRank-9.6-Stand mit technischem Kern 9.2.0.

## Übernommene Funktionen

- Links-/Rechts-Erfassung pro Satz für einseitige Übungen
- Durchschnitt der ausgefüllten Seiten für Rank und e1RM
- Tatsächliche Summe beider Seiten für das sichtbare Trainingsvolumen
- E-Mail-/Passwort-Registrierung und -Anmeldung
- E-Mail-Bestätigung und Passwort-Zurücksetzung
- Eindeutige Spitznamen und Anzeigenamen
- Freundschaftsanfragen mit Annahme, Ablehnung und Entfernen
- Teilen von Trainings-Momentaufnahmen erst nach bestätigter Freundschaft
- Sperren interner Dokumentations-, Werkzeug- und Native-Pfade im Netlify-Deployment

## Bewusst beibehalten

Die älteren Kern-, Patch- und Übersetzungsdateien des Quellpakets wurden nicht über den neueren Stand kopiert. Dadurch bleiben insbesondere erhalten:

- Timer pro Workout optional
- korrekte Berechnung einseitiger Übungen ohne künstlichen Faktor 1,9
- Schutz vor unkontrollierten Olympian-Sprüngen bei automatisch geschätzten Referenzen
- rollende Sieben-Tage-Streak
- aktuelle Bodygraph-, Latissimus-, iPhone- und Navigationskorrekturen
- aktuelles Hell-/Dunkelmodus-Design

## Cloud-Voraussetzungen

Die neue Konto- und Freundesoberfläche erwartet passende Supabase-RPCs und Row-Level-Security-Regeln. Der Browser enthält ausschließlich den Publishable-Key. Service-Role-Schlüssel dürfen niemals in Web-, Netlify- oder Windows-Pakete aufgenommen werden.

## Zusammenführung in 9.9

Diese 9.8-Funktionsschicht wurde in EvoRank 9.9 mit dem fertigen 9.7-Triathlon-Stand zusammengeführt. Build, Rank-Logik, Konto, Freunde, Offline-Verhalten und Service Worker werden im gemeinsamen 9.9-Testlauf geprüft.
