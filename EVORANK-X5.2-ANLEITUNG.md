# EvoRank X5.2 – Startfehler behoben

## Öffnen unter Windows

1. Eine noch laufende alte EvoRank-Serverinstanz schließen (das zu EvoRank gehörende Serverfenster).
2. Im Ordner **EVORANK-X5.2-WINDOWS** die Datei **EVORANK-STARTEN.bat** doppelklicken. Alternativ funktioniert **EVORANK-START-MIT-NODE.bat** mit installiertem Node.js.
3. Den bisherigen Browser, dieselbe Adresse und dasselbe Konto verwenden. Standard: **http://127.0.0.1:8123/**. Das Serverfenster geöffnet lassen.

Falls noch die alte Seite angezeigt wird, einmal **Strg + F5** drücken. Browser-/Website-Daten nicht löschen: Dort liegen deine lokalen Trainings. Diese Korrektur benötigt keine Rücksetzung.

## Was wurde repariert?

X5.1 konnte beim Start mit „Cannot set property 0 of [object Array] which has only a getter“ abbrechen. Die neuen Rangabzeichen und eine ältere Initialisierung des Schwimmrangs gerieten aneinander. Die Abzeichen werden jetzt beim Anzeigen erzeugt, ohne die gemeinsam verwendeten Rangdaten schreibgeschützt zu machen.

Alle X5.1-Funktionen bleiben enthalten. An der Punkteberechnung, den Muskelbildern und gespeicherten Trainings wurde für diese Reparatur nichts geändert. Ein neuer Starttest prüft zusätzlich den erneuten Start mit gespeicherten Testdaten und die Ausdauerränge.

## Netlify und Weiterprogrammieren

**EVORANK-X5.2-NETLIFY** enthält die aktualisierte Website für dein bestehendes Netlify-Projekt. Es wurde nichts veröffentlicht; die bisher gehostete Website erhält die Reparatur erst durch dein Update.

Der Quellcode bleibt in `C:\Users\johan\OneDrive\Dokumente\ChatGPT\EvoRank`. Es gibt keine zusätzliche Codex-Projektkopie. Die bisherige Lizenzanalyse liegt unter `website/licenses/LIZENZANALYSE-X5.1.md` im Windows-Paket.

Die lokale Prüfung ersetzt keinen Test mit deinem privaten Konto, auf dem iPhone oder auf dem Live-Hosting.
