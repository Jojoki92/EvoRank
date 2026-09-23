# EvoRank X4.3

Der Hintergrund im hellen Modus läuft wieder weich um Frau und Mann aus.
Die graue Rechteckfläche aus X4.2 ist entfernt.

In „Übung hinzufügen“ stehen ähnliche Übungen unter einem gemeinsamen Eintrag.
Bankdrücken aufklappen, dann Winkel, Griff und Gerät auswählen. Eine Suche wie
`bankdrücken 30` findet die passende Ausführung direkt. Eigene Übungen bleiben
einzeln, Favoriten und vorhandene Trainings bleiben erhalten.

Die Kraftliste hat 163 Hauptlisteneinträge für 1.001 Varianten; Mobilität hat 50
Einträge für 500 Varianten. Das Zusammenfassen ändert keine Trainingsdaten oder Ränge.

**Dips mit +40 kg × 8 bei 70 kg Körpergewicht ergeben beim männlichen Profil
480 Punkte, Platinum.** Der zusammengefasste Muskelrang kann davon abweichen.
[Erklärung der Muskelränge](docs/EVORANK-X4.3-MUSKELRAENGE.md).

## Windows öffnen

Die bereits entpackte App liegt im Arbeitsordner unter
`delivery/EVORANK-X4.3-WINDOWS/`. Dort `EVORANK-START-MIT-NODE.bat` doppelklicken
und das Serverfenster geöffnet lassen. Node.js ist auf diesem Computer vorhanden.
Alternativ die ZIP-Datei gleichen Namens vollständig entpacken.

Die App-Adresse bleibt `http://127.0.0.1:8123/`. Eine dort noch laufende ältere
EvoRank-Serverinstanz vor dem neuen Start beenden. Denselben Browser verwenden
und gespeicherte Website-Daten behalten. Die App-Dateien enthalten keine privaten
Trainingsaufzeichnungen; diese bleiben im Browser oder vorhandenen Cloud-Konto.

## Hier weiterprogrammieren

Der vollständige Quellcode liegt weiterhin im eingerichteten EvoRank-Projekt.
Aktueller Einstieg: `AGENTS.md` und `CONTINUE-HERE-X4.3.md`.

```powershell
npm.cmd run test:x4
npm.cmd run preview:app
```

Das Quellcode-ZIP enthält die aktuelle Arbeitskopie ohne installierte
Abhängigkeiten, internen Git-Ordner oder private Trainingsdaten. Nach Entpacken
auf einem anderen Computer zuerst `npm.cmd ci` ausführen.

## Netlify

`EVORANK-X4.3-NETLIFY.zip` enthält die App und bisherigen Funktionsdateien.
Für ein späteres Update denselben Deploy-Weg und dieselbe Site-Adresse verwenden.
Netlify-Funktionen und deren Umgebungsvariablen beibehalten; ein rein statischer
Datei-Upload installiert keine Funktionen. Es wurde nichts veröffentlicht.

Die Aufnahmefunktionen und Maschineneinstellungen aus X4.2 bleiben enthalten.
Bedienung: [Anleitung X4.2](EVORANK-X4.2-ANLEITUNG.md).
