# EvoRank X3

X3 enthält die vorhandene X2-App mit den folgenden Korrekturen. Du kannst mit
deinen bisherigen App-Daten weiterarbeiten, wenn du die bestehende App-Adresse
und denselben Browser/App-Speicher verwendest. Das Projektpaket enthält den Code
und die Bilder. Deine privaten Trainingsdaten wurden nicht vom Handy ausgelesen.

## Was geändert wurde

- **Frauen-Latissimus:** linke und rechte Markierung an die vorhandene Modellkontur
  angepasst. Die versetzte Spiegelung der rechten Seite ist entfernt. Das Originalbild
  bleibt die Grundlage; der Mann und die anderen Muskelgruppen bleiben vorhanden.
- **Splash Screen:** Logo in fester Größe, klarer EvoRank-Schriftzug, ruhiger
  Ladebalken. Das alte Hintergrundbild mit riesig vergrößertem Logo entfällt.
  Die elf hinterlegten iPhone-Startbildgrößen verwenden die neue Komposition.
- **Workout:** abwechselnde helle/dunkle Grauflächen pro Satz, größere Zahlen,
  klare Satznummern, sichtbarer Abschlussstatus. Auch erledigte Sätze und L/R-Felder
  verwenden neutrale Kontraste. Übungen lassen sich weiterhin per Griff oder
  Positionsfeld frei verschieben.
- **Profilwechsel:** vorhandene Übungs-, Muskel- und Gesamtränge werden nach dem
  aktuell gewählten Männer-/Frauenprofil neu berechnet. Das funktioniert auch für
  alte Einträge. Die ursprünglichen Trainingsaufzeichnungen und verdienten XP/
  Belohnungen werden dadurch nicht umgeschrieben.
- **Drei Designs:** Profil → „App-Designs ansehen“ öffnet A Graphit, B Magenta
  und C Titan mit Vorschau als Icon und Startbildschirm. Du kannst jedes Originalbild
  herunterladen. Bis zu deiner Auswahl bleibt das vorhandene Icon aktiv.

## Ränge und Plausibilitätsprüfung

Der komplette Katalog umfasst 1.500 Übungen. 500 Mobilitätsübungen haben keinen
Kraftrang. Die Berechnung wurde für beide Körperprofile, mehrere Körpergewichte
und Wiederholungszahlen geprüft: mehr Wiederholungen oder mehr wirksame Last
senken den Kraftscore nicht; Unterstützung reduziert die bewegte Last. Frauen-
Referenzen unterscheiden sich nach Muskelgruppe/Bewegung statt überall denselben
Abschlag anzuwenden.

Beispiele bei **75 kg Körpergewicht**, jeweils mit derselben Leistung:

| Übung | Zusatzgewicht × Wiederholungen | Männerprofil | Frauenprofil |
|---|---|---|---|
| Klimmzug | +10 kg × 8 | 343 Punkte · Gold | 451 Punkte · Platinum |
| Dips | +40 kg × 8 | 408 Punkte · Platinum | 583 Punkte · Diamond |
| Klimmzug | 0 kg × 8 | 302 Punkte · Gold | 398 Punkte · Gold |
| Dips | 0 kg × 8 | 266 Punkte · Silver | 380 Punkte · Gold |

Eine höhere Punktzahl muss nicht sofort eine andere Medaille ergeben, wie beim
Klimmzug ohne Zusatzgewicht. Bei geschätzten Übungsreferenzen bleibt die Obergrenze
von 699 Punkten bestehen. Das ist keine defekte Profilumschaltung.

Die weiblichen relativen Normanker für Langhantel-Bankdrücken, Kniebeuge und
Kreuzheben wurden mit der [veröffentlichten Powerlifting-Untersuchung von van den
Hoek et al.](https://pubmed.ncbi.nlm.nih.gov/39060209/) abgeglichen. Die meisten
weiteren Übungen verwenden übertragene Faktoren und geräteabhängige Schätzungen.
**EvoRank-Medaillen sind die Spielkalibrierung der App; nicht jede Übung besitzt
eine wissenschaftlich validierte Normtabelle.** Im vollständigen Projekt steht
die Einordnung pro Übung in `docs/EVORANK-X3-EXERCISE-AUDIT.json`.

Bei Klimmzügen/Dips zählt Körpergewicht plus Zusatzgewicht; bei unterstützten
Varianten wird Unterstützung abgezogen. Bei Kabelübungen kannst du weiterhin
die Übersetzung und die Art deiner Gewichtseingabe wählen. 40 kg Stapel bei
2:1 entsprechen ungefähr 20 kg am Griff. Sichtbare Rollen allein bestimmen die
Übersetzung nicht. Alte abgeschlossene Sätze behalten die damalige Einstellung.

## Welche ZIP ist für dich?

| Datei | Verwendung |
|---|---|
| EVORANK-X3-WINDOWS.zip | Entpacken und die App am Windows-PC starten |
| EVORANK-X3-NETLIFY.zip | Deine bisherige Netlify-Site später aktualisieren |
| EVORANK-X3-CODEX-PROJEKT.zip | Vollständiger Quellcode, Git-Verlauf, Anleitung, Tests und RTK-Paket für die weitere Entwicklung |
| EVORANK-X3-DESIGNS.zip | Drei Bildentwürfe mit lokaler Vergleichsseite |

## Windows starten

1. `EVORANK-X3-WINDOWS.zip` vollständig entpacken.
2. Im entpackten Ordner `EVORANK.exe` doppelklicken. Alternativ
   `EVORANK-STARTEN.bat` verwenden.
3. Das Serverfenster geöffnet lassen. Die App läuft in deinem Browser.
4. Mit installiertem Node.js funktioniert auch `EVORANK-START-MIT-NODE.bat`.

Der PowerShell-Starter und die EXE sind aus deinem bisherigen Paket übernommen.
Standardadresse ist `http://127.0.0.1:8123/`. Der Node-Starter verwendet jetzt ebenfalls
einen festen Port. Schließe eine noch laufende alte App-Serverinstanz zuerst.
Wenn du früher eine andere lokale Adresse verwendet hast, liegen deren Daten
weiterhin unter jener Adresse; sichere sie dort als App-Export und importiere sie
bei einem Wechsel. Der Node-Port lässt sich über `EVORANK_PORT` einstellen.

## Netlify und Handy aktualisieren

1. In der bisherigen App einen aktuellen **Trainingsdaten-Export** sichern.
2. `EVORANK-X3-NETLIFY.zip` entpacken. Der enthaltene Ordner hat seine `index.html`
   direkt auf der obersten Ebene.
3. Diesen Ordner bei deiner **bestehenden Netlify-Site** als Update bereitstellen,
   sobald du wieder deployen möchtest. Die bisherige Adresse beibehalten.
4. EvoRank online öffnen, schließen und erneut öffnen, damit die neue Version
   geladen werden kann. Keine Website-/Browserdaten löschen.
5. Wenn du bereits Netlify-Funktionen für Garmin verwendest, deinen bestehenden
   Deploy-Weg und die Funktions-/Umgebungsvariablen beibehalten. Ein manueller
   Upload statischer Dateien allein richtet keine Serverfunktionen ein.

Name und Apple-/PWA-Metadaten tragen **EvoRank**. Ein bereits angelegtes Homescreen-
Symbol kann vom Betriebssystem weiter zwischengespeichert werden. Die spätere
Auswahl A/B/C muss erst als aktives Icon eingebaut und neu bereitgestellt werden.
Entferne die bisherige App-Verknüpfung nicht ohne gesicherten Trainingsdaten-Export.

Aus diesem Chat wurde kein Netlify-Update veröffentlicht. Die App wurde hier
nicht auf deinem echten Handy oder Windows-PC ausgeführt.

## In Codex weiterentwickeln

**Ja, für die dauerhafte App-Entwicklung empfehle ich dir Codex mit einem festen
Projektordner.** Dann arbeitet der Agent direkt in deinen Dateien; Änderungen
lassen sich vergleichen, testen und im Git-Verlauf sichern.

1. `EVORANK-X3-CODEX-PROJEKT.zip` herunterladen und dauerhaft entpacken, zum Beispiel
   in `Dokumente/EvoRank`. Der darin enthaltene Ordner mit `package.json` und
   `AGENTS.md` ist das Projekt.
2. Die ChatGPT-Desktop-App öffnen und anmelden. Im Produktmenü **Codex** wählen
   und diesen Ordner als Arbeitsort öffnen. Die aktuelle [offizielle
   Schnellstart-Anleitung](https://learn.chatgpt.com/docs/quickstart) beschreibt
   die Ordnerauswahl und Codex-Auswahl. Alternativ geht es über die Codex-Erweiterung
   in deinem Code-Editor.
3. Den folgenden Auftrag in einem neuen Codex-Chat senden:

> Lies AGENTS.md, CONTINUE-HERE-X3.md und EVORANK-X3-ANLEITUNG.md. Das ist mein
> bestehendes EvoRank-Projekt X3. Arbeite in diesem Ordner weiter. Richte die
> nötigen Abhängigkeiten ein und führe npm run test:x3 aus. Bewahre meine
> vorhandenen Datenformate und den Git-Verlauf. Als Nächstes möchte ich: …

4. Für weitere Arbeiten denselben Projektordner verwenden. Den bisherigen
   Chatverlauf musst du nicht vollständig hineinkopieren: die Übergabe beschreibt
   den Stand und offene Entscheidungen. Nicht enthaltene Sonderwünsche kannst
   du ergänzen. Ein Dateitransfer überträgt nicht automatisch jede alte Unterhaltung.

Für das direkte Ausprobieren aus dem Quellcode gibt es `npm run preview:app`.
Das benötigt Node.js, startet die App an der festen lokalen Adresse und funktioniert
auch unter Windows. Die aktuellen Tests benötigen nach `npm ci` keine Linux-Shell.
Der vollständige Framework-Build verwendet die vorhandenen Linux-Skripte; dafür
unter Windows WSL verwenden. Diese Einrichtung kann Codex anhand der Projektdateien
übernehmen. Fertige Windows-/Netlify-Pakete benötigen keinen Framework-Build.

**Codex im Browser:** Dafür das Projekt in ein eigenes Repository übernehmen,
GitHub oder GitLab mit Codex verbinden und eine Umgebung für das Repository
einrichten. Die [offizielle Cloud-Anleitung](https://learn.chatgpt.com/docs/cloud)
beschreibt diese Schritte. Es wurde hier kein Repository in deinem Namen
veröffentlicht oder verbunden.

## RTK: installiert und angewendet

Das hochgeladene Paket wurde geprüft. Die enthaltene Linux-Binärdatei stimmt mit
dem hier installierten **RTK 0.48.0** überein; Telemetrie ist deaktiviert. RTK wurde
für Entwicklungsprüfungen verwendet. Es fasst Terminalausgaben für den Agenten
zusammen und ist kein Bestandteil der Handy-App.

Die Installation gilt für diese Arbeitsumgebung. Das ZIP enthält **Linux x86_64**,
keine Windows-EXE. Auf deinem PC muss RTK für dessen Ausführungsumgebung vorhanden
sein. Das originale Setup-Paket liegt unter `dev-tools/RTK-Codex-Setup.zip` im
Codex-Projekt. Unter Linux/WSL kann Codex dessen README befolgen; unter nativem
Windows eine passende unterstützte RTK-Version verwenden oder ohne RTK starten.
Die EvoRank-Entwicklung und die App funktionieren auch ohne RTK.

## Prüfung

19 aktuelle Verhaltenstests bestanden. Geprüft wurden unter anderem beide
Körperprofile, alte Bestsätze, Speichern/Neuladen, Muskel-/Gesamtränge, unveränderte
Belohnungen, Kabelübersetzung, Übungsreihenfolge, getrennte Satzfelder, erhaltene
Muskelgruppen und vollständige lokale App-Dateien. Abschlussdetails stehen in
`docs/EVORANK-X3-VALIDATION.json` im vollständigen Projekt.

Offen bleibt die Auswahl A/B/C und die Sicht-/Nutzungsprüfung auf deinem Gerät.
