# EvoRank X5.4

Die Punkte aus deiner synchronisierten Aufnahme vom 15. September sind umgesetzt.

- Größere Rangabzeichen auf Home; derselbe Titel für Gym, Laufen, Radfahren und Schwimmen.
- Rangübersicht und Körper / Sportgrafik bleiben immer sichtbar. Unter „Ränge anpassen“ lassen sich zusätzliche Bereiche einblenden und mit Pfeilen ordnen. „Übernehmen“ speichert die Auswahl und Reihenfolge.
- Ausdaueranalyse mit Verlauf, Monatsvergleich, Gesamtwerten, Bestleistungen und Trainingsrhythmus. Es werden nur gespeicherte Einheiten verwendet.
- „Übungsverlauf“ ist einklappbar; „Muskelbalance“ zeigt eine kompakte Zusammenfassung mit allen Gruppen zum Aufklappen.
- Klare Galeriekarten und helle Bestenlisten im hellen Modus. ForgeDrop passt in die App-Spalte. Unter den Speichern-Buttons liegt kein eigener dunkler Kasten mehr.
- Profilbearbeitung über den Stift oben rechts; der doppelte Schnellzugriff entfällt. Account wechseln / Abmelden verwendet rote Schrift ohne rote Fläche.
- Community-Bestenlisten sind auch in den neuen Ausdauer-Rangansichten eingebunden.

## Windows starten

Eine noch laufende alte EvoRank-Serverinstanz schließen. Im bereits entpackten Ordner `EVORANK-X5.4-WINDOWS` auf **EVORANK-START-MIT-NODE.bat** doppelklicken; das Serverfenster geöffnet lassen. Alternativen: `EVORANK.exe` oder `EVORANK-STARTEN.bat`.

Weiter denselben Browser und **http://127.0.0.1:8123/** verwenden. Vorhandene lokale Trainings bleiben bei dieser Adresse. Website-Daten nicht löschen. Bei einer noch geöffneten älteren Ansicht einmal neu laden und das angebotene App-Update bestätigen.

## Bestenlisten einrichten

Im Windows-Ordner liegt **BESTENLISTEN-EINRICHTEN** mit `ANLEITUNG.md` und `1-BESTENLISTEN-EINRICHTEN.sql`. Die SQL-Datei vollständig im SQL Editor deines bestehenden Supabase-Projekts ausführen. Sie wird nicht auf Netlify hochgeladen. Danach in der App anmelden und die öffentliche Teilnahme unter **Sicherheit, Cloud & Support → Öffentliche Bestenlisten** freigeben.

Das Netlify-Paket aktualisiert deine bestehende Website. Die Datenbankeinrichtung ist ein eigener Schritt. Es wurde keine Veröffentlichung oder Änderung deiner echten Cloud-Datenbank vorgenommen.

Die lokale Prüfung verwendet Testdaten und eine lokale PostgreSQL-Instanz. Eine Prüfung deiner echten Cloud-Konten oder auf einem iPhone ist damit nicht ersetzt. Körpergrafiken, Rangformeln, Trainingshistorie, Geräteübersetzungen und verdiente Belohnungen bleiben erhalten.
