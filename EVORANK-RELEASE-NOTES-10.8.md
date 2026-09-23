# EVORANK 10.8

## Neu

- **Home und Ranks getrennt:** Für den Home-Bildschirm und den Ranks-Bereich
  gibt es nun zwei eigene Auswahlen und Reihenfolgen. Beispiel: Home zeigt nur
  Gym, während Ranks Gym und Schwimmen enthält.
- **Getrennte Muskelmarkierung:** Eine im Ranks-Bereich angetippte Muskelgruppe
  wird nicht automatisch auf Home ausgewählt und umgekehrt.
- **Seepferdchen-Piktogramm:** Der erste Schwimmrang besitzt jetzt ein eigenes
  transparentes Tier-Piktogramm statt der bisherigen Blasen.
- **Garmin-Dauersynchronisierung:** OAuth-Verbindung, verschlüsselte Tokens,
  Activity-Webhook, sichere Supabase-Ablage, automatische Aktualisierung beim
  App-Start und manueller Abruf sind vorbereitet.
- **Sicherheitsmodell:** Garmin-Tokens bleiben ausschließlich in Netlify und
  werden mit AES-256-GCM verschlüsselt. Die Garmin-Tabellen sind für Browser-
  Rollen gesperrt.

## Garmin-Hinweis

Die technische Integration ist vollständig vorbereitet. Produktiv aktiv wird
sie erst nach der Freigabe des Garmin Connect Developer Programs und dem
Eintragen der von Garmin vergebenen Zugangsdaten. Bis dahin funktioniert der
lokale Garmin-Dateiimport weiterhin.

## Kompatibilität

Konten, Passwörter, Trainingsdaten, Freunde, Bodygraph, bestehende Ränge,
Kalender, Trainingspläne, Themes, das EVORANK-App-Symbol und alte technische
Speicherschlüssel bleiben kompatibel.
