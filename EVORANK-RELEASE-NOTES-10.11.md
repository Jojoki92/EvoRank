# EvoRank 10.11

## Behoben

- Abmelden bleibt auch nach Neuladen oder Neustart bestehen.
- Der Workout-Timer aktualisiert alle sichtbaren Anzeigen und korrigiert sich nach App-Wechsel, Fokus und `pageshow`.
- Die iPhone-Kopfzeile berücksichtigt Dynamic Island und Safe Area; „Beenden“ und der untere Abschlussknopf bleiben erreichbar.
- Die Übungssuche erzeugt keinen horizontalen Layoutsprung mehr.
- Unterschiedliche Geräte-/Cloud-Stände werden ohne blockierendes Systemfenster zusammengeführt.
- Im Gym-Rank-Switcher erscheint das tatsächliche Rank-Abzeichen statt der weißen Platzhalter-Raute.

## Neu

- Geburtsdatum mit nativer Tag-/Monat-/Jahr-Auswahl und automatisch berechnetem Alter.
- Körpergewicht startet bei der Ersteinrichtung leer und muss bewusst eingetragen werden.
- Einmalig 20 Coins pro Geburtstag; tägliche optionale Geburtstagsmail über Netlify und Resend.
- Direkter „Ersetzen“-Knopf an jeder Übung im laufenden Workout.
- Sichtbare Übungsaliase („Auch bekannt als“) und Alias-Feld für eigene Übungen.
- Gewichtet ausgewertete Nebenmuskeln; Rudervarianten zählen nun auch für Lat, Bizeps und oberen Rücken.
- „Produktionscenter“ heißt verständlich „Sicherheit, Cloud & Support“ und erklärt seinen Zweck direkt.
- Neue PWA-Icon-Dateien und sichtbarer Produktname „EvoRank“.

## Betrieb

Für Geburtstagsmails `db/SUPABASE-BIRTHDAY-10.11.sql` ausführen und die Mailvariablen aus `netlify.env.example` setzen. Die Zustellhinweise stehen in `docs/EVORANK-EMAIL-ZUSTELLUNG-10.11.md`.
