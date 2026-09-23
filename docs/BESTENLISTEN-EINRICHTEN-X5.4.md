# Bestenlisten freischalten

Die App enthält Community-Bestenlisten für Gym, Laufen, Radfahren und Schwimmen. Die zugehörige Datenbank muss einmal im bestehenden Supabase-Projekt eingerichtet werden. Ein Website-Upload allein erledigt das nicht.

## Einmal im Supabase-Projekt

1. Öffne dein bestehendes Projekt auf https://supabase.com/dashboard. Verwende dasselbe Projekt, mit dem deine EvoRank-Konten verbunden sind. Kein neues Projekt anlegen.
2. Öffne **SQL Editor → New query**.
3. Öffne die beigefügte **1-BESTENLISTEN-EINRICHTEN.sql**, kopiere den gesamten Inhalt in das SQL-Feld und klicke **Run**. Die Datei wird in Supabase ausgeführt, nicht auf Netlify hochgeladen.
4. Am Ende erscheint **Bestenlisten eingerichtet: Gym, Laufen, Radfahren, Schwimmen**. Die Einrichtung ist als eine Transaktion verpackt: Bei einem Fehler wird keine halbfertige Freischaltung übernommen. Wiederholtes Ausführen löscht keine bestehenden Einträge oder Einwilligungen.
5. Aktualisiere deine bestehende Website mit dem Inhalt des Ordners **EVORANK-X5.4-NETLIFY**. Behalte deine Domain und bestehende Supabase-Konfiguration bei.

Steht dort „EvoRank-Kontoeinrichtung fehlt“, ist im ausgewählten Projekt die bisherige Kontodatenbank nicht vorhanden. Prüfe zuerst, ob du das richtige Projekt geöffnet hast. Im Quellprojekt liegt die frühere Einrichtung unter `db/SUPABASE-KONTO-FREUNDE-9.8.sql`; sie gehört nur in ein Projekt, das tatsächlich neu eingerichtet werden soll. Keine vorhandenen Tabellen löschen.

## In der App

1. Mit deinem Cloud-Konto anmelden und einen öffentlichen Spitznamen anlegen, falls noch keiner existiert.
2. Im Profil **Sicherheit, Cloud & Support** öffnen und **Öffentliche Bestenlisten** ausdrücklich aktivieren. Ohne Freigabe bleibt dein Profil privat. Das SQL schaltet niemanden automatisch öffentlich.
3. Unter **Ränge** eine Sportart wählen und **Dein Rang** öffnen. Unter dem Rang steht die **Bestenliste**. Mit dem runden Aktualisieren-Button abrufen. Sie aktualisiert sich beim erneuten Öffnen nach Ablauf des kurzen Zwischenspeichers; es ist kein Live-Ticker.
4. Ein zweiter Account muss seine eigenen Werte selbst freigeben. Dann lassen sich Platzierung und öffentliches Profil vergleichen. Die Freundesliste ist davon getrennt.

Eine leere Liste bedeutet: Noch niemand hat Werte freigegeben. „Noch nicht eingerichtet“ deutet auf fehlende Datenbankfunktionen hin; „Gerade nicht erreichbar“ kann durch Verbindung oder Anmeldung entstehen. Nach dem SQL kurz warten und erneut aktualisieren.

## Was sichtbar wird

Spitzname, Anzeigename, Avatar, Sport, Rangpunkte und zusammengefasste Sportwerte. Keine E-Mail, Geburtsdaten, Körpermaße oder vollständigen Trainings. Teilnahme ist widerrufbar; Blockieren und Melden bleiben vorhanden. Alle vier Sportarten teilen dieselbe Freigabe. Strava-Importe bleiben außerhalb der öffentlichen Rangberechnung.

Die Werte sind überwiegend selbst erfasst und keine unabhängig geprüften Wettkampfergebnisse. Die Datenbank begrenzt Eingaben, verlangt Anmeldung und Freigabe und unterstützt Moderation; sie kann eine tatsächlich erbrachte Leistung nicht beweisen. Ein lokal importierter Garmin-Datensatz ist kein serverseitiger Nachweis. Für als Garmin ausgewiesene Veröffentlichungen muss die vorhandene Garmin-Anbindung auf dem Server passende Aktivitäten besitzen.

Die SQL-Datei erweitert nur die bestehende Bestenlisten-Einrichtung. Die Website erhält weder Datenbankpasswort noch Service-Role-Schlüssel. Die Cloud- und Zweitkonto-Prüfung muss nach der Einrichtung im tatsächlichen Supabase-Projekt erfolgen; sie ist mit dem lokalen App-Test nicht erledigt.

Quellen für die Einrichtung: [Supabase SQL-Funktionen und SQL Editor](https://supabase.com/docs/guides/database/functions), [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
