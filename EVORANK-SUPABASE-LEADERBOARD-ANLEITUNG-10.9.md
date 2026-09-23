# EVORANK 10.9 – Bestenlisten in Supabase aktivieren

Du musst das nur **ein einziges Mal** machen.

## Was danach funktioniert

- Top 10 für **Gym**
- Top 10 für **Schwimmen**
- Top 10 für **Laufen**
- Top 10 für **Radfahren**
- Antippbare öffentliche Profile mit den Werten der ausgewählten Sportart
- Keine öffentliche E-Mail-Adresse und keine einzelnen privaten Workouts

## Ganz einfache Anleitung

1. Öffne <https://supabase.com/dashboard>.
2. Öffne genau das Supabase-Projekt, das EVORANK verwendet.
3. Klicke links auf **SQL Editor**.
4. Klicke auf **New query** oder **Neue Abfrage**.
5. Öffne auf deinem Computer die Datei
   `db/SUPABASE-LEADERBOARDS-10.9.sql` mit einem Textprogramm.
6. Markiere den gesamten Inhalt mit `Strg + A`.
7. Kopiere ihn mit `Strg + C`.
8. Füge ihn im großen Supabase-Feld mit `Strg + V` ein.
9. Klicke unten rechts auf **Run**.
10. Warte auf die grüne Erfolgsmeldung.

Fertig. Du musst in Supabase keine Zeilen händisch anlegen.

## Danach in EVORANK

1. Öffne die neue Version 10.9.
2. Melde dich mit deinem EVORANK-Konto an.
3. Lege unter Konto einmal einen öffentlichen **Spitznamen** an, falls noch
   keiner vorhanden ist.
4. Öffne **Ranks** und wähle Gym, Schwimmen, Laufen oder Radfahren.
5. Tippe in der Bestenliste auf **Aktualisieren**.

Am Anfang kann dort nur dein eigenes Profil stehen. Sobald weitere Nutzer ein
Profil besitzen und EVORANK 10.9 öffnen, werden automatisch bis zu zehn Nutzer
pro Sportart angezeigt.

## Sicherheit

Die Tabelle ist für den direkten Browserzugriff gesperrt. EVORANK verwendet nur
zwei geschützte Funktionen: eine zum Aktualisieren des eigenen Eintrags und eine
zum Lesen der Top 10. Die Ausgabe enthält keine E-Mail-Adresse.

Die Werte stammen aus den Trainingsdaten des jeweiligen Kontos. Garmin-Werte
werden gekennzeichnet, wenn Garmin verbunden ist. Lokale manuelle Daten sind
keine amtlich geprüften Wettkampfergebnisse.

## Falls „Einmalige Freischaltung fehlt“ angezeigt wird

Dann wurde die SQL-Datei noch nicht oder im falschen Supabase-Projekt
ausgeführt. Wiederhole die zehn Schritte oben im richtigen Projekt und tippe
danach in EVORANK auf **Danach neu laden**.
