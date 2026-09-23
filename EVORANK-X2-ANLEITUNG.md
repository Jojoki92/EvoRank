# EvoRank X2

X2 baut auf den gesicherten X1-Dateien auf. Deine persönlichen Trainingsdaten liegen weiterhin im vorhandenen Browser-/App-Speicher beziehungsweise im eingerichteten Cloud-Konto. Dieses Paket enthält den App-Code und die Bilder, keinen aus deinem Handy ausgelesenen Trainingsdatenexport.

## Änderungen

- Frauen-Bodygraph: Latissimus-Markierung auf zwei symmetrische, körpernahe Flächen begrenzt. Kein Verlauf entlang der Arme, keine weiße Auswahlfläche. Der bestehende Mann und die übrigen Muskelmasken bleiben erhalten.
- Freunde: Rangabzeichen fest im Kopfbereich ausgerichtet. Der zusätzliche Kreis mit „II“ unter dem Abzeichen entfällt; die Division bleibt im Rangnamen sichtbar.
- Training: Jede Übung hat einen Griff zum Ziehen und ein Positionsfeld. Du kannst sie direkt an jede beliebige Stelle setzen, auch während des Trainings. Mit fokussiertem Griff funktionieren die Pfeiltasten. Die Reihenfolge wird gespeichert und beim Speichern als Routine übernommen.
- Kabelturm: In der Übung „Kabelturm“ aufklappen, Übersetzung eingeben (1:1 bis 10:1, halbe Schritte möglich) und zwischen Stapelanzeige und bereits umgerechnetem Griffgewicht wählen. Die Einstellung gilt für offene und neue Sätze und wird je Übung gemerkt. Abgeschlossene Sätze behalten ihre bisherige Übersetzung. Die Zahl sichtbarer Rollen ist kein ausreichendes Maß für die Übersetzung.
- Neue eigenständige E-Marke in Weiß/Magenta auf Schwarz. Neues App-Symbol, Browser-Symbol und Startbildschirm. 11 iPhone-Startbildgrößen und ein Symbol mit zusätzlichem Sicherheitsrand für Android sind enthalten.
- Google Stitch: Kein neues Stitch-Paket.

## Ränge und Stats

Der komplette Katalog mit 1.500 Übungen wurde rechnerisch geprüft; bei 93 Einträgen wurden Kalibrierungs-/Trackingfelder korrigiert. 500 Mobilitätsübungen bleiben ohne Kraftrang. Der vollständige Vergleich steht in `docs/EVORANK-X2-EXERCISE-AUDIT.json` im vollständigen Backup.

Klimmzüge und Dips verwenden Körpergewicht plus Zusatzgewicht. Normale und gewichtete Varianten haben dieselbe Referenz. Bei unterstützten Klimmzügen wird die Unterstützung abgezogen. Bei Crunches, Beinheben und vergleichbaren Körpergewichtsübungen wird ein geschätzter bewegter Körperanteil verwendet. Die Auswahl des besten Satzes berücksichtigt das tatsächliche Körpergewicht statt pauschal 75 kg. Eine echte Einzelwiederholung wird nicht mehr um 3,3 % hochgerechnet. Ältere gespeicherte Übungsdefinitionen überschreiben die korrigierte Referenz nicht mehr.

Beispiele für ein männliches Profil mit 75 kg Körpergewicht:

| Übung | Eingabe | Last für die Berechnung | Geschätztes 1RM | Rang |
|---|---:|---:|---:|---|
| Klimmzug | +10 kg × 8 | 85 kg | 107,7 kg | Gold II, 343 Punkte |
| Dips | +40 kg × 8 | 115 kg | 145,7 kg | Platinum III, 408 Punkte |
| Kabelzug 2:1 | Stapel 40 kg | 20 kg am Griff | abhängig von Wiederholungen | abhängig von Übung |

Beste Leistungen werden aus abgeschlossenen Arbeitssätzen neu berechnet, sofern diese vorhanden sind. Alte Einträge ohne einzelne Sätze behalten ihren vorhandenen Bestsatz als Grundlage. Bereits verdiente XP und Belohnungen werden durch diese Neuberechnung nicht rückwirkend verändert. Neue Volumenberechnungen berücksichtigen die Kabelübersetzung und beide getrennt erfassten Seiten; das Körpergewicht wird nicht als zusätzliches externes Trainingsvolumen gezählt. Historische gespeicherte Volumenwerte bleiben erhalten.

Die Rangstufen sind EvoRanks Spielkalibrierung. Sie sind keine wissenschaftlich validierten Leistungsnormen für jede der 1.500 Übungen. Geschätzte Gerätereferenzen und bewegte Körperanteile bleiben Näherungen; Seilreibung, Hebelarme und Ausführung können sich unterscheiden. Bei Bändern ist auch das Unterstützungsgewicht eine Näherung.

Zur Plausibilitätskontrolle wurden die vom Anbieter veröffentlichten [Klimmzug-Daten](https://strengthlevel.com/strength-standards/pull-ups/kg) und [Dip-Daten](https://strengthlevel.com/strength-standards/dips/kg) von Strength Level herangezogen. Es handelt sich um Community-Daten, nicht um eine direkte Zuordnung zu EvoRank-Medaillen. Die eigene Referenz beträgt für Klimmzüge 110 kg und für Dips 125 kg effektives 1RM bei 350 Punkten und 75 kg Körpergewicht. Als Gerätebeispiel dokumentiert [Rogue beim FM-6](https://www.roguefitness.com/rogue-fm-6-functional-trainer) unterschiedliche Übersetzungen für verschiedene Zugstationen.

## Netlify aktualisieren

1. In deiner bisherigen EvoRank-App einen aktuellen Trainingsdaten-Backup-Export erstellen und sicher aufbewahren.
2. `EVORANK-X2-NETLIFY.zip` vollständig entpacken. Im Ordner `EVORANK-X2-NETLIFY` liegt direkt die `index.html`.
3. Diesen Ordner bei deiner **bestehenden Netlify-Site** als neues Deployment hochladen. Dieselbe Adresse verwenden, damit der lokale App-Speicher weiter zugeordnet bleibt.
4. Nach erfolgreichem Deployment EvoRank online öffnen, anschließend schließen und erneut öffnen. Der aktualisierte Service Worker lädt die X2-Dateien. Keine Browserdaten löschen.
5. Falls du bisher Netlify-Funktionen für Garmin nutzt, deinen bisherigen Deploy-Weg samt Funktionen und Umgebungsvariablen beibehalten. Ein reiner Datei-Upload richtet keine neuen Garmin- oder Supabase-Dienste ein.

Das Paket ist vorbereitet; aus diesem Chat wurde nichts auf deiner Netlify-Site veröffentlicht.

## iPhone: Name und Symbol

Manifest und Apple-Metadaten tragen „EvoRank“. Die neuen Bilder verwenden neue Dateinamen, damit die App sie nach dem Update frisch laden kann. Die vorhandene App-ID und der Speicher bleiben gleich. [Apple dokumentiert Namen, Homescreen-Symbole und Startbilder hier](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).

Ob ein bereits gespeichertes Homescreen-Symbol und dessen Beschriftung automatisch ersetzt werden, lässt sich aus der Webseite nicht garantieren. Prüfe nach dem Update zuerst die bestehende App. Falls das alte Symbol bleibt: vor jeder Entfernung einen aktuellen App-Datenexport sichern; danach die bestehende Adresse in Safari öffnen und über „Teilen → Zum Home-Bildschirm“ mit dem Namen „EvoRank“ hinzufügen. Bei Bedarf den Export wieder importieren. Nicht vorsorglich Website-Daten löschen.

## Windows

`EVORANK-X2-WINDOWS.zip` vollständig entpacken und `EVORANK.exe` doppelklicken. Die vorhandenen Startdateien aus X1 sind enthalten; alternativ `EVORANK-STARTEN.bat` oder der Node-Starter. Browserprofil und lokale Adresse bleiben wie in X1. Das Serverfenster während der Nutzung geöffnet lassen.

## Prüfung und Grenzen

12 Verhaltenstests bestanden: 1.500 Katalogeinträge bei drei Körpergewichten, Ranggleichheit, alte Übungssnapshots, unterstützte Klimmzüge, weibliches Profil, tatsächliches Körpergewicht bei der Bestsatzwahl, Kabelumrechnung, Speichern/Neuladen, Routineübernahme, DOM-Bedienung der Reihenfolge, Erhalt von XP/Belohnungen, SVG-Struktur und vorhandene PWA-Dateien. JavaScript-Syntax und das vollständige Projekt-Build wurden geprüft.

Die App wurde in dieser Runde nicht auf einem echten iPhone oder Windows ausgeführt. Ein Netlify-Live-Deployment, dein echtes Konto und deine privaten Trainingsaufzeichnungen waren nicht Teil dieser Prüfung.
