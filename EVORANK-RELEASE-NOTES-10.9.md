# EVORANK 10.9

## Neu

- Eigene **Top-10-Bestenliste** für Gym, Schwimmen, Laufen und Radfahren.
- Ein Ranglisten-Eintrag öffnet ein **sportbezogenes öffentliches Profil**. Es
  zeigt nur Rang, Punkte und zusammengefasste Werte der gewählten Sportart.
- E-Mail-Adressen, einzelne Workouts und Daten anderer Sportarten bleiben privat.
- Die Übungsbibliothek enthält **500 zusätzliche Dehn- und
  Mobilitätsvarianten**. Sie nutzen Zeit-Tracking und verändern den Gym-Rank
  nicht.
- Schneller Filter **„500× Dehnen & Mobilität“** in der Übungsauswahl.

## Optimierte Ranglisten-Regel

Ein Nutzer kann in jeder Sportart erscheinen, in der sein Wert für die Top 10
reicht. Beim Antippen wird immer ausschließlich das Profil der gerade geöffneten
Sportart gezeigt. Dadurch geht eine gute Leistung in einer zweiten Sportart
nicht verloren, ohne private oder unpassende Daten zu vermischen.

## Beibehalten

- Getrennte Home-/Ranks-Auswahl und getrennte Muskelmarkierung aus 10.8.
- Seepferdchen-Piktogramm.
- Garmin Connect OAuth, Webhook und automatische Aktualisierung.
- Apple Widget, Live Activity und Dynamic Island im nativen iOS-Ordner.
- Offline-PWA, Netlify, Windows-ohne-Node und vollständige Sicherung.

## Einmalige Einrichtung

Für echte gemeinsame Bestenlisten muss
`db/SUPABASE-LEADERBOARDS-10.9.sql` einmal im Supabase SQL Editor ausgeführt
werden. Danach veröffentlichen angemeldete Nutzer mit öffentlichem Spitznamen
ihre vier kompakten Ranglistenwerte automatisch.

Garmin bleibt bis zur Freigabe des Garmin Connect Developer Program im
Dateiimport-Modus. Die vorbereitete dauerhafte Verbindung wird dadurch nicht
entfernt.
