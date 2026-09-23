# Stand und bisherige Arbeit

## Produktziel und aktueller Umfang

EvoRank ist eine Fitness-PWA für Gym, Laufen, Radfahren und Schwimmen. Johannes möchte auch eine reine Lauf-, Rad- oder Schwimmnutzung ermöglichen. Die Startseite ist nach Sportarten und Modulen anpassbar. Das bestehende Apple-inspirierte Design mit eigener Akzentfarbe ist die einzige Gestaltung; es gibt keinen zweiten Classic-Modus mehr.

| Bereich | Im Quellcode vorhanden | Nachweis / Grenze |
| --- | --- | --- |
| Gym | Übungskatalog mit 1.501 Einträgen, Variantenfamilien, Pläne, Satzprotokoll, grüne abgeschlossene Sätze/Übungen, Rangvergleich, Kabel-/Maschinenkonfiguration | Lokale Regressionen; keine Aussage über private Handy-Daten |
| Bodygraph | Mann/Frau, Vorder-/Rückseite, Muskelränge und antippbare Regionen | Edge und Windows-WebKit geprüft; echtes iPhone noch offen |
| Ausdauer | Aufnahme mit Start/Pause/Speichern, manuelle Einheiten, GPS bei Lauf/Rad, Bahnen beim Schwimmen, getrennte Ränge | Browserfunktionen vorhanden; zuverlässiger Hintergrund-GPS-Betrieb nicht geliefert |
| Fortschritt | Zeitachse je Übung, Last/geschätztes 1RM/Volumen, Startseiten-Pins, Verlauf | Bestehende tatsächliche Arbeitssätze; Schätzungen sind gekennzeichnet |
| Woche/Pläne | Persönliche Trainingswoche, ein-/ausklappbare Übersicht, Planlöschung, Kalender, Strava-Importanzeige | Gelöschte Pläne dürfen beim Start/Import nicht wieder erscheinen |
| Ränge | Kraft: Alter, Gewicht und Körperprofil; Ausdauer: eigene Altersmodelle, Rad optional gemessene W/kg | Eigene Vergleichsmodelle mit Grenzen, keine wissenschaftliche Gesamtvalidierung |
| Freunde/Bestenlisten | Konten, Freigaben, Freunde, Veröffentlichungen, vier Sportarten, Meldungen/Blockieren, SQL | Lokale App- und Datenbanktests; tatsächliches Supabase-Backend nicht hier verifiziert |
| Cloud/OAuth | Account-Sync, getrennte Einwilligungen, Serverfunktionen für Garmin und Strava | Zugangsdaten, Partnerfreigaben, produktive Einrichtung und Zweitkonto-Tests offen |
| iPhone-PWA | Installation, versionierte Icons, responsive Ansichten, Sicherheitsabstände | Keine native App; Home-Screen-PWA allein hat keine WidgetKit-/ActivityKit-Integration |
| Native iOS-Bausteine | Swift-Bridge, Alarm, Live Activity, Dynamic Island, Widget, gemeinsamer Store | **Quellbausteine, kein fertiges Xcode-Projekt, keine signierte IPA, kein Gerätetest** |
| Rechtliches | Rechtstexte, Freigaben, lokale Datenfunktionen, Lizenzinventar, dokumentierte Lücken | Keine rechtliche Gesamtfreigabe; fehlende Tatsachen siehe 07 |

## Entwicklung in zeitlicher Reihenfolge

- **Import / X4.1:** bestehendes Projekt aus dem gelieferten Archiv übernommen, lokales Weiterprogrammieren eingerichtet. Das kompakte X2-Workoutlayout blieb Grundlage. Metallic D+H als installiertes Icon; flaches weiß/magenta ER für kleine In-App-Markenanzeige.
- **X4.2:** kompaktere mobile Übungsauswahl, Ausdaueraufnahme, Prüfung der Übungsreferenzen, Maschinen-/Kabelangaben einschließlich Preacher-Maschine. Einstellungen gehören zur konkreten gespeicherten Leistung. Keine pauschale Technogym-Übersetzung.
- **X4.3:** verwandte Übungen in der Auswahl gruppiert, genaue Varianten/IDs und deren Verlauf erhalten; Erklärung zu Dips und Muskelrängen. Diese historische Muskelgewichtung wurde später durch 70/30 ersetzt.
- **X4.4:** fertige Sätze und vollständig erledigte Übungen wieder grün. Versionsbezogene lokale Lieferung.
- **X4.5:** stärkste Muskelbeiträge 70/30 gewichtet; persönliche Trainingswoche, Strava-Anbindung, Audio-Einstellungen und native iOS-Bausteine vorbereitet. Keine externe Freischaltung oder Xcode-Prüfung.
- **X4.6:** neue Plan-/Alarmbereiche stärker an den App-Stil angepasst; hellen Modus, Bodygraph-Kontrast und Verwerfen-Bedienung verbessert.
- **X4.7:** Altersvergleich für Kraft mit Geburtsdatum/fortgeschriebener Altersangabe, löschbare Pläne, ruhigere Startseite.
- **X4.8:** eigene altersbezogene Ausdauermodelle, Radleistung mit gespeichertem Gewicht; zusammenklappbare Woche, klarere Wochen-Challenge und Modaldarstellung.
- **X4.9 / X5.0:** Apple-inspirierte Oberflächen, geordnete Profil-/Rechtsbereiche, Einwilligungstrennung und Aufräumen der ausgelieferten Dokumente. Historische Anleitungen bleiben im Quellprojekt, nicht alle im Windows-Paket.
- **X5.1:** Apple als einzige Gestaltung; wählbare Sportarten/Home-Module; Fortschrittsgrafiken und Pins; neue Rangmotive und Sportnamen; Profilangaben; Lizenzanalyse und lokale Git-Sicherung. Größe bleibt nach ausdrücklicher Rückfrage rein informativ.
- **X5.2:** Startabsturz „Cannot set property 0 ... only a getter“ reproduziert und behoben. Gemeinsame Rangarrays müssen schreibbar bleiben. Echter Init-/Wiederöffnungs-Regressionspfad ergänzt.
- **X5.3:** Sportkompetenzen in Rad/Laufbahn/Schwimmbahn farblich dargestellt; fünf konsistente Rangansichten; Sportwerte in Freundes-Snapshots; Farben bedeuten den jeweiligen Bereichsrang.
- **X5.4:** Startseitenmodule sortierbar, zusätzliche persönliche Auswertungen und Ausdauer-Bestenlisten. Atomare SQL-Einrichtung plus echte lokale PostgreSQL-Regressionen via PGlite.
- **X5.5:** gemeinsame Plus-Auswahl, Training direkt unter der Figur, Einsteigerfarbe für Bereiche ohne Messwerte, schnellere Initialisierung ohne langes Warten auf entfernte Profile; inkrementelle Muskel-Auswahl; Einführungstour. Keine automatischen Reloads bei Updates.
- **X5.6:** Beschriftungen aller Sportgrafiken nach außen, Unterarm-Trefferflächen verbessert, Profilformular aufgeräumt, Windows-Start ohne Node als Standard. Der damalige dunkle Badge-Hintergrund wird in X5.7 ausdrücklich ersetzt.
- **X5.7:** siehe nachstehende Liste. Lokal geliefert am 23.09.2026, App-Code-Commit 983cefb.

## Die letzten iPhone-Rückmeldungen und X5.7

1. Profilformular lag unter Uhr/WLAN/Batterie: Dialoge berücksichtigen jetzt den oberen Sicherheitsbereich und bleiben innen scrollbar.
2. Navigation/Plus saßen zu hoch: Leiste ist kompakter, Plus liegt mittig, unterer Sicherheitsabstand wird einmal berücksichtigt.
3. Trainingstext war zu groß und Rangicon auf schwarzer Kachel störte: Schrift verkleinert, Rangbadge aus großen Gym-/Ausdauer-Startkarten entfernt. Sportwahl im Plus-Menü behält ihre vier Motive.
4. Muskelklick war auf iPhone optisch nicht erkennbar: tatsächliche SVG-Füllfarbe wird auf 62 % aller RGB-Kanäle gesetzt und bei Abwahl restauriert. Gleicher Farbton, keine Abhängigkeit von einem Safari-SVG-Helligkeitsfilter. Figur wird dabei nicht ersetzt.
5. Körperdaten-Kasten im Profil redundant: Kasten entfernt, Gewicht/Größe/Alter bleiben im vorhandenen Bearbeiten-Formular.
6. Rangicons im hellen Modus hatten störende Ränder: 36 Motive einzeln neu generiert, transparent als PNG eingebunden, keine schwarzen Galeriekacheln und keine Browser-Luminanzmasken. Körpergrafiken unverändert.
7. Cloud-Einwilligung: ohne kontobezogenes Modul keine Freigabe über alten globalen `accepted`-Wert; UI bestätigt erst den tatsächlich gespeicherten Zustand.
8. Rechtstexte präzisiert, fehlende Betreiber-/Rechte-/Produktionsangaben weiterhin ausdrücklich als offen dokumentiert.

## Zuletzt tatsächlich geprüft

- 129/129 Tests in `npm.cmd run test:x5`, Vinext-Build erfolgreich.
- Edge und Windows-WebKit: beide Körper, Vorder-/Rückseite, Unterarme und Core, hell/dunkel, 320/430/1360 CSS-Pixel, Profileingaben, Rangnamen, äußere Sportbeschriftungen und Plus-Menü.
- Simulierter Sicherheitsabstand 59 px oben / 34 px unten, verschiedene Formularhöhen. Kein echter iOS-Tastaturtest.
- HTTP-Prüfung von 212 Ressourcen und vorbereiteter PowerShell-5.1-Server einschließlich Datei-Hashes.
- 36 transparente PNG-Exporte, insgesamt 5.952.215 Bytes; Master separat erhalten.
- Windows-/Netlify-Lieferung: 685 Dateien am endgültigen Ziel per Hash geprüft.

Details liegen im Projekt unter `docs/EVORANK-X5.7-*`. Diese Übergabe nimmt keine erneuten Konto-, Cloud- oder iPhone-Tests vor.
