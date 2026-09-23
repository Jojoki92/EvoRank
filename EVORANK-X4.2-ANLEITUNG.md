# EvoRank X4.2

## Lokal weiterprogrammieren

Dieser Projektordner ist die vollständige Arbeitskopie. Zum Start in PowerShell:

```powershell
npm.cmd run test:x4
npm.cmd run preview:app
```

Node.js ab 22.13 ist nötig. In einer frisch entpackten Quellkopie zuerst
`npm.cmd ci` ausführen. Der Starter verwendet dieselbe Adresse
`http://127.0.0.1:8123/`. Eine dort laufende ältere EvoRank-Serverinstanz zuerst
beenden. Das Serverterminal muss geöffnet bleiben.

Alternativ `delivery/EVORANK-X4.2-WINDOWS.zip` vollständig entpacken und den
mitgelieferten Starter verwenden. `EVORANK-START-MIT-NODE.bat` nutzt Node.js.
Die EXE und bisherigen PowerShell-Starter sind ebenfalls enthalten.

## Sport aufnehmen

Unter Sport die Disziplin öffnen und „Jetzt aufnehmen“ verwenden. Für Laufen
und Radfahren zwischen GPS und reinem Timer wählen. Start, Pause und Fortsetzen
halten die aktive Zeit fest. Beim Schwimmen Beckenlänge einstellen und pro
geschwommener Bahn auf + tippen; − korrigiert eine versehentliche Eingabe.
Eine Bahn ist der Weg zu einem Beckenende, nicht hin und zurück.

„Beenden & speichern“ öffnet die Prüfung von Dauer, Distanz und Belastung.
Die gespeicherte Einheit erscheint in der bestehenden Sporthistorie und zählt
für deren Auswertung. Bei Neuladen wird eine aktive Aufnahme pausiert angeboten.

Für GPS die App sichtbar und den Bildschirm an lassen. Der Browser fragt nach
Standortfreigabe; die Funktion benötigt eine sichere Verbindung bzw. localhost.
Bei fehlendem GPS funktioniert der Timer weiter, die Distanz kann ergänzt werden.
Schwimmbahnen werden per Antippen gezählt, nicht automatisch über Sensoren.

## Maschine und Kabel einstellen

„Preacher Curl (Maschine)“ in der Übungssuche auswählen. Im Workout das Feld
„Maschine · Gerät einstellen“ öffnen. Gerätefaktor und zusätzlichen Startwiderstand
am Griff gemäß Herstellerangabe oder Messung hinterlegen; der Gerätename ist optional.
Die Näherung lautet `Gewicht × Faktor + Startwiderstand`.

Am Kabelturm den ausdrücklichen Teiler eingeben: 40 kg ÷ 2 ergibt ungefähr 20 kg
am Griff. Bei bereits umgerechneter Last den entsprechenden Eingabemodus wählen.
Fertige Sätze behalten ihre damaligen Einstellungen. Angaben aus alten Aufnahmen
werden nicht nachträglich erfunden. Geräte- und Muskelkraft sind nicht identisch;
die Ränge bleiben geräteabhängige Schätzungen.

## Handy / bestehende Netlify-Site aktualisieren

Das Paket `delivery/EVORANK-X4.2-NETLIFY.zip` enthält die PWA und die bestehenden
Funktionsdateien samt Netlify-Konfiguration. Es wurde nicht veröffentlicht.
Für ein späteres Update den bisherigen Deploy-Weg der bestehenden Site verwenden;
URL, Funktionskonfiguration und deren Umgebungsvariablen beibehalten. Ein bloßer
statischer Drag-and-drop-Upload installiert Netlify Functions nicht automatisch.

Vor dem Austausch ein Trainingsbackup über die bestehende App exportieren.
Website-Daten nicht löschen. Nach dem Update EvoRank online neu öffnen; im Profil
muss X4.2 stehen. Die Paketdateien enthalten Quellcode und Assets, keine privaten
Trainingsdaten aus deinem Browser.

Details: [Weiterentwicklung](CONTINUE-HERE-X4.2.md),
[Rangprüfung und Quellen](docs/EVORANK-X4.2-RANGPRUEFUNG.md).

Das zusätzliche CODEX-PROJEKT-ZIP enthält den aktuellen Quellstand, Tests und
Anleitungen. Installierte Abhängigkeiten, private Trainingsdaten und der interne
Git-Ordner sind darin nicht enthalten. Originalarchiv und importierte Git-Historie
bleiben im eingerichteten Arbeitsordner erhalten.
