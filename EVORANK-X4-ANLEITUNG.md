# EvoRank X4 · Dein neues Design

D + H ist eingebaut: dunkle Obsidian-Oberfläche, silberne Kanten und magentafarbener Balken.
Das Design erscheint als App-Symbol, beim Start und in der App. Im Profil ist es als aktiv markiert.

## Handy / Netlify aktualisieren
1. In der bisherigen App einen Trainingsdaten-Export sichern.
2. EVORANK-X4-NETLIFY.zip vollständig entpacken.
3. Den enthaltenen Ordner mit index.html in deiner bestehenden Netlify-Site hochladen.
   Verwende dieselbe App-Adresse und deinen bisherigen Deploy-Weg.
4. EvoRank online öffnen, vollständig schließen und erneut öffnen.
5. Prüfe im Profil, dass EvoRank X4 und D + H angezeigt werden.

Das Update ist vorbereitet; aus diesem Chat wurde nichts bei Netlify veröffentlicht.
Bei Garmin-Serverfunktionen den bisherigen Funktions-Deploy und die Umgebungsvariablen beibehalten;
der statische Ordner ersetzt deren Einrichtung nicht.

### Wenn das iPhone noch das alte Symbol zeigt
Die App liefert neue Bildadressen, aber ein bestehendes iPhone-Homescreen-Symbol kann zwischengespeichert bleiben.
Sichere zuerst deinen Trainingsdaten-Export. Öffne danach die gleiche Adresse in Safari
und füge EvoRank über Teilen → Zum Home-Bildschirm erneut hinzu. Prüfe Konto und Trainingsdaten
im neuen Eintrag und importiere bei Bedarf das Backup, bevor du die alte Verknüpfung entfernst.
Keine Safari-/Website-Daten löschen.

## Windows
EVORANK-X4-WINDOWS.zip entpacken und EVORANK.exe bzw. EVORANK-STARTEN.bat öffnen.
Eine alte laufende Serverinstanz zuerst beenden. Die bisherige Adresse http://127.0.0.1:8123/ bleibt erhalten.
Alternativ funktioniert der vorhandene Node-Starter. Das Serverfenster offen lassen.

## Weiterentwicklung
EVORANK-X4-CODEX-PROJEKT.zip enthält den wiederhergestellten aktuellen Projektstand und das Originaldesign.
In Codex den entpackten Ordner öffnen und schreiben: „Lies AGENTS.md und CONTINUE-HERE-X4.md.“
Die Übergabe dokumentiert die Wiederherstellung und die Grenzen der alten Sicherung.

## Prüfung
Der vollständige Build, die elf vorhandenen Verhaltenstests und die auf X4 angepasste PWA-Dateiprüfung sind bestanden.
Alle Bildverweise und elf iPhone-Startbildgrößen sind geprüft. Nicht betroffene App-Dateien stimmen mit X3 überein.
Ranglogik und Trainingsdatenformate wurden nicht geändert. Auf einem echten iPhone oder Windows-PC wurde X4 hier nicht ausgeführt.
