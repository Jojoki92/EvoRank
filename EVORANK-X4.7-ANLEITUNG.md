# EvoRank X4.7

## Öffnen

Alle drei entpackten Pakete liegen nach erfolgreicher Auslieferung unter:
`C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x4\X4.7\`

Im Ordner `EVORANK-X4.7-WINDOWS` die Datei **EVORANK-START-MIT-NODE.bat** öffnen.
Node.js ab 22.13 ist erforderlich. Falls noch eine alte EvoRank-Konsole läuft,
diese zuerst schließen und danach X4.7 starten. Browserdaten nicht löschen;
dieselbe lokale Adresse behält deine vorhandenen Daten.

`EVORANK-X4.7-NETLIFY` ist für die spätere Aktualisierung der bestehenden Website.
`EVORANK-X4.7-CODEX-PROJEKT` enthält den vollständigen bearbeitbaren Quellcode.
Es wurde nichts online veröffentlicht.

## Alter und Ränge

Im Profil „Profil bearbeiten“ öffnen und das Geburtsdatum prüfen. Kraft-Ränge
verwenden jetzt das aktuelle Alter. Ohne Geburtsdatum wächst ein zuvor eingetragenes
Alter ab einem gespeicherten Bezugsdatum näherungsweise weiter.

In **Ranks → Kraft** und in den Details eines Übungsrekords lässt sich die
Altersbewertung aufklappen. Du siehst Faktor, Basis- und Alterspunkte sowie die
Datengrundlage. Der Altersfaktor ist eine geschätzte Vergleichskurve für Kraft;
Schwimmen, Laufen und Radfahren bleiben vorerst bei ihren bisherigen Modellen.
Die genaue Erklärung und das Dips-Beispiel stehen in `docs/EVORANK-X4.7-ALTER.md`.

## Pläne bearbeiten oder löschen

- Startseite → **Deine Trainingswoche → Plan verwalten**, oder Profil → **Meine Pläne**.
- Dort **Plan bearbeiten** bzw. **Plan löschen** beim Wochenplan wählen.
- Für den gespeicherten Schwimmplan ebenfalls **Plan löschen** wählen. Das geht
  auch direkt in der Schwimmplan-Analyse.
- Die Löschabfrage bestätigen oder abbrechen. Deine abgeschlossenen Trainings
  bleiben erhalten. Einen gelöschten Schwimmplan erzeugt erst dein ausdrücklicher
  Klick auf **Schwimmplan erstellen** wieder.
- Die Bearbeitung lässt sich jederzeit mit **Abbrechen** verlassen. Details zu
  einzelnen Wochen-Einheiten und Schwimmschritten sind einklappbar.

Die bunten Kartenumrandungen auf der Startseite sind entfernt. Die Farbcodierung
im eigentlichen Ranks-Bereich bleibt erhalten.

## Prüfung

Lokale Tests und vollständiger Framework-Build werden vor der Auslieferung
durchgeführt; Ergebnis in `docs/EVORANK-X4.7-VALIDATION.json`.
Kein Live-Konto, iPhone, Browserlayout oder Hosting wurde in dieser Lieferung getestet.
