# EvoRank X4.8

Die entpackte Windows-Version wird hier gespeichert:

`C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x4\X4.8\EVORANK-X4.8-WINDOWS\`

Dort **EVORANK-START-MIT-NODE.bat** doppelklicken. Node.js ab 22.13 ist erforderlich.
Eine noch laufende ältere EvoRank-Serverinstanz vorher schließen. Die Adresse
`http://127.0.0.1:8123/` beibehalten, damit derselbe lokale App-Speicher verwendet wird.
Trainingsdaten sind im Browser/Konto, nicht im Quellcodepaket. Keine Website-Daten löschen.
Im selben Versionsordner liegen die Netlify-Dateien und das vollständige Codex-Projekt.

## Änderungen

- **Ausdauerränge:** Laufen, Schwimmen und Radfahren berücksichtigen jetzt Alter
  und Körperprofil mit eigenen Vergleichskurven. Im Profil das Geburtsdatum
  eintragen; der Vergleich wächst mit dem Alter mit. Unter dem Rang lässt sich
  die Erklärung zur Berechnung aufklappen.
- **Radfahren:** Beim Eintragen oder Speichern „Leistung & Körpergewicht ergänzen“
  öffnen. Gemessene Durchschnittswatt und damaliges Körpergewicht eintragen.
  Ab 20 Minuten kann W/kg verwendet werden. Ohne Messwerte zählt das Tempo.
  Für Lauf-/Schwimmzeiten gibt es keinen künstlichen Gewichtsbonus.
- **Trainingswoche:** Auf die Überschrift tippen, um den ganzen Plan ein- oder
  auszuklappen. Alle bisherigen Funktionen bleiben im aufgeklappten Bereich.
- **Wochen-Challenge:** Die frühere Anzeige 67 % war der Durchschnitt aus 100 %
  beim Workout-Ziel und 33 % beim Satz-Ziel. Jetzt stehen beide Ziele getrennt da:
  „3/3 Workouts“ und „12/36 Sätze“, dazu „Noch 24 Sätze“. Zusätzliche Workouts
  werden separat genannt. Die Belohnung gibt es weiterhin erst bei beiden Zielen.
- **Forge Drop:** Ein durchgehender Scrollbereich mit erreichbarem Abschluss.
- **Profil:** Die zusätzliche „Dein App-Design“-Karte ganz unten entfällt.

Das Rangmodell ist eine dokumentierte EvoRank-Schätzung, kein offizieller
Wettkampfvergleich. Details und Quellen: `docs/EVORANK-X4.8-AUSDAUER.md` im Quellpaket.
Die tatsächlichen Trainingswerte und verdienten Belohnungen werden nicht umgeschrieben.

## Prüfung

73 lokale Tests und der vollständige Framework-Build bestanden. Der lokale
HTTP-Test prüfte alle 157 vorgeladenen Ressourcen. Keine visuelle Browserprüfung,
kein iPhone-/Android-Test und keine Live-Prüfung von Konten oder Hosting durchgeführt.
Prüfbericht: `docs/EVORANK-X4.8-VALIDATION.json` im Quellpaket.
