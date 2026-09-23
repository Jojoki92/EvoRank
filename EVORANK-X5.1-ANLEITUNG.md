# EvoRank X5.1

## Starten

Im Ordner **EVORANK-X5.1-WINDOWS** die Datei **EVORANK-STARTEN.bat** öffnen. Eine noch laufende ältere EvoRank-Serverinstanz vorher schließen. Die bisherige Browseradresse und dein Konto beibehalten; Website-Daten nicht löschen. Vor einem Gerätewechsel im Profil eine Datensicherung exportieren.

Die zusätzliche ZIP enthält Windows und Netlify. Für Netlify den Inhalt von **EVORANK-X5.1-NETLIFY** auf dem bisherigen Projekt verwenden. Hier wurde nichts veröffentlicht.

## Deine Startseite

- **Home → Ansicht:** Sportarten und sichtbare Bereiche auswählen. Laufen, Radfahren oder Schwimmen funktionieren auch ohne Gym auf der Startseite. Die Sportauswahl wechselt zwischen deinem unveränderten Muskelkörper und Laufbahn, Rad oder Schwimmbahn.
- **Tempo, Langstrecke, Konstanz:** Bereich antippen. Die Anzeige vergleicht jeweils die letzten 28 Tage mit den 28 Tagen davor. Langstrecke bedeutet längste aufgezeichnete Einheit, nicht nachgewiesen pausenloses Training.
- **Home → Fortschritt:** Jede Katalog- oder eigene Übung suchen. Im Verlauf Messwert und Zeitraum auswählen. Mit dem Plus oben bis zu sechs Grafiken auf Home merken; mit dem Häkchen wieder entfernen.
- Das Trainingsvolumen zählt abgeschlossenes Zusatzgewicht × Wiederholungen ohne Aufwärmsätze. Bei Kabel/Maschine gelten die am Satz gespeicherten Einstellungen. Gewicht am Griff ist bei Dips das Zusatzgewicht; bei Unterstützung ist weniger stärker. e1RM ist eine Schätzung aus 1–12 Wiederholungen.
- **Profil → Größe, Gewicht & Alter:** Körperdaten ändern. Ein Geburtsdatum aktualisiert das Vergleichsalter automatisch. Körpergröße wird angezeigt, verändert wie besprochen aber keine Rangpunkte. Historische Trainings bleiben unverändert.

Alle vier Sportarten haben je neun neue Abzeichen und Namen. Die bisherigen Punkteschwellen, Körperfarben, Muskelbilder und Trainingsabschlüsse bleiben erhalten. Apple ist jetzt die einzige Oberfläche; deine Farbe, heller/dunkler Modus und Bedienhilfen bleiben wählbar. Die untere Navigation ist rund und schwebend. Rechtslinks haben blaue Schrift ohne gefüllte Fläche.

## Lizenzen und Git

Die vollständige [Lizenzanalyse](website/licenses/LIZENZANALYSE-X5.1.md) nennt kostenlose Bibliotheken, Pflichten und offene Bild-/Datenrechte. Git ist ein lokales Änderungsprotokoll: Es hält nachvollziehbare Entwicklungsstände fest und zeigt Zeilenunterschiede. Es veröffentlicht nichts automatisch.

Der vollständige Entwicklungsstand bleibt im bisherigen Projektordner `C:\Users\johan\OneDrive\Dokumente\ChatGPT\EvoRank`. Dort kannst du weiterprogrammieren. Es wird keine zusätzliche Kopie „CODEX-PROJEKT“ mehr geliefert. Im Projekt gibt es den Zweig `codex/evorank-x5.1`; `e8b6318` ist der gesicherte X5.0-Ausgangspunkt. `git log --oneline` zeigt die Stände, `git diff e8b6318 HEAD` die Änderungen seit X5.0. Git ersetzt keine separate Datensicherung und speichert keine privaten Browser-Trainingsdaten.

Es wurden keine Cloud-, Hosting-, iPhone- oder App-Store-Funktionen live freigegeben oder getestet. Die native Apple-Erweiterung bleibt ein separates, in Xcode zu prüfendes Projekt. Die Weboberfläche bildet Glasmaterialien mit CSS nach.
