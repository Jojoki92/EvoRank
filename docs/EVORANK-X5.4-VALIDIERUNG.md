# X5.4 – Umsetzung und lokale Prüfung

Die separate Tonaufnahme und das Bildschirmvideo vom 15.09.2026 wurden lokal transkribiert und zeitlich mit Mauszeiger und Oberfläche abgeglichen. Die Originalaufnahmen und die Arbeitsbilder sind nicht Bestandteil der App-Pakete oder des Git-Commits.

| Position in der Aufnahme | Umsetzung |
| --- | --- |
| 00:11–00:31 | Größeres Abzeichen rechts in der Home-Rangkarte; gemeinsamer Starttitel für alle vier Sportarten. |
| 00:35–00:47 | Community-Bestenliste verwendet im hellen Modus eine helle Fläche und lesbare Schrift. |
| 01:03–01:18 | Galeriekarten mit klarer neutraler Kante und lesbarem Sperrstatus; vorhandene Abzeichen bleiben erhalten. |
| 01:23–01:44, 04:47 | Ausdaueranalyse um Monatsvergleich, Gesamtwerte, Bestwerte und Trainingsrhythmus ergänzt. |
| 01:47–02:04 | Doppelten Profilbearbeiten-Schnellzugriff entfernt; Stift bleibt. Abmelden/Account wechseln als rote Schrift. |
| 02:15–02:25, 02:52–03:11 | Rang und Grafik fest sichtbar, Zusatzbereiche im Formular verschiebbar. Erst „Übernehmen“ speichert; Abbrechen verwirft die Änderungen. |
| 03:14–03:31 | ForgeDrop maximal 720 Pixel breit und 860 Pixel hoch, auf kleineren Viewports entsprechend begrenzt; Ende und Schließen bleiben erreichbar. |
| 03:40–03:58 | Separate dunkle Hintergrundkästen und Trennkanten der Formularfußleisten entfernt. |
| 03:58–04:24 | Körpergrafiken unverändert gelassen. |
| 04:24–04:43 | Übungsverlauf einklappbar; Muskelbalance kompakt mit allen Gruppen zum Aufklappen. |
| 04:50–05:11 | Ausdauer-Community-Bestenlisten eingebunden; ausführbare SQL-Datei und genaue Einrichtung im Windows-Paket. |

## Nachweise

- `npm.cmd run test:x5`: 116/116 bestanden, einschließlich realem App-Start/Wiederöffnen, Bestandsfunktionen, Formularreihenfolge, Analyse und vier sportbezogenen RPC-Aufrufen.
- Neue SQL-Datei tatsächlich in lokalem PostgreSQL über PGlite ausgeführt: Setup-Rollback bei fehlendem Profil, wiederholte Installation, Rollenrechte, erforderliche individuelle Einwilligung, getrennte Sporteinträge, Feldbegrenzung, Blockierung, Widerruf, Eingabeprüfung und Moderationsschutz bestanden.
- Älterer Garmin-Test verwendete einen zufallsabhängigen Teilstring einer UUID. Die Prüfung verwendet jetzt die exakte ID der importierten Aktivität; App-Importlogik blieb unverändert.
- Windows Vinext-Build erfolgreich. Framework meldet weiterhin die bekannte Einschränkung seiner statischen Routenklassifizierung.
- Headless Edge mit synthetischen Daten: 320×667, 430×932, 1360×900, jeweils Hell/Dunkel und Minimal/Detailreich; zwölf Kombinationen ohne JavaScript-Fehler. Formularverschiebung/Speichern, Shop-Ende, sichtbare Rangtabs, Profilstift, einklappbare Analyse, helle Bestenlistenfläche und horizontale Passform geprüft. Ansichten zusätzlich visuell kontrolliert.
- Lizenzmetadaten/Notices erneut erfasst. Neu ist ausschließlich die Testabhängigkeit `@electric-sql/pglite` (Apache-2.0 laut Paket), keine neue Laufzeitabhängigkeit in der statischen App. Bestehende Lizenz- und Bildrechte-Grenzen bleiben bestehen.

## Grenzen

Keine echte Supabase-Datenbank geändert, keine echten Benutzerkonten verwendet, kein Hosting veröffentlicht, kein iPhone/Garmin-Gerät getestet. Die tatsächliche Cloud-Einrichtung und der Test mit zwei angemeldeten und freiwillig freigegebenen Profilen stehen nach dem Ausführen der SQL-Datei im vorhandenen Projekt an. Public Rankings beruhen auf selbst gemeldeten Werten, nicht auf einem sportlichen Leistungsnachweis. Die bestehenden Rangformeln und gespeicherten Trainings wurden nicht verändert.
