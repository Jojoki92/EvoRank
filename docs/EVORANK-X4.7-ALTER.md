# Altersvergleich in X4.7

Seit X4.7 beeinflusst das aktuelle Profilalter alle Kraftscores und damit
Muskel- und Gym-Ränge. Das ist ein **EvoRank-Vergleichsmodell**, keine Messung
individueller Muskelkraft oder sportwissenschaftlich validierte Dips-Altersnorm.
Ausdauer- und reine Zeit-/Distanzübungen behalten ihre bisherigen Rangmodelle.

## Datengrundlage und Grenzen

Die Alterskurve verwendet die „Intermediate“-Altersreferenzen für Männer und
Frauen von [Strength Level: Bankdrücken](https://strengthlevel.com/strength-standards/bench-press/kg),
abgerufen am 10.09.2026. Wir teilen die jeweilige Referenz für 25–40 Jahre durch
die Referenz für das aktuelle Alter. Zwischen den Stützstellen interpolieren
wir linear. Die tabellarischen Werte sind in `age-ranking-x4.7.js` dokumentiert.

**Die Übertragung dieser Kurve auf andere Kraftübungen ist unsere Näherung.**
Bankdrückdaten belegen keine exakten altersbedingten Unterschiede bei Dips,
Beinübungen oder einer bestimmten Maschine. Die Quelle ist eine Trainingscommunity,
keine repräsentative Stichprobe der Gesamtbevölkerung. Die App behauptet daher
weder ein präzises Altersperzentil noch eine universelle physiologische Korrektur.
Eigene altersbezogene App-Punkte und Quellreferenzen sind nicht dasselbe.

13–14-Jährige erhalten konservativ den Faktor für 15, über 90-Jährige den für 90;
keine Extrapolation darüber hinaus. Ohne gültiges Alter oder unter 13 keine
Korrektur. Geschätzte Geräte-/Übungsränge bleiben auf 699 Punkte begrenzt.

## Rechenweg

1. Eingetragene Last mit **gespeicherter** Kabelübersetzung/Maschinenkonfiguration
   umrechnen. Bei Dips das damalige Körpergewicht zur Zusatzlast addieren.
2. Wie bisher das geschätzte 1RM und die körpergewichts-/geschlechtsbezogenen
   Basispunkte bestimmen. Die Referenz für normale Dips stammt weiterhin aus
   [Strength Level: Dips](https://strengthlevel.com/strength-standards/dips/kg).
3. `Alterspunkte = runden(Basispunkte × Altersfaktor)`, bestehende Geräteobergrenze
   beibehalten. Erst danach die unveränderte Muskelübertragung und 70/30-Gewichtung.

Beispiel männlich, 70 kg Körpergewicht, Dips +40 kg × 8: 110 kg bewegte
Gesamtmasse, geschätztes 1RM 139,33 kg, 480 Basispunkte.

| Genaues Alter | Faktor ungefähr | Übungspunkte | App-Rang |
| --- | ---: | ---: | --- |
| 17 | 1,106 | 531 | Diamond |
| 20 | 1,021 | 490 | Platinum |
| 60 | 1,333 | 640 | Champion |

Die Zahlen beschreiben den **Übungsrang**, nicht automatisch den gesamten
Trizepsrang. Mit mehreren Übungen zählt dessen bester Beitrag 70 %, bis zu drei
weitere Beiträge zusammen 30 %. Ein einziger Beitrag zählt vollständig.
Bei Nebenmuskeln bleiben 58 % Übertragung. Die Übersetzung wird genau einmal
vor der Rangberechnung angewandt, nicht erneut beim Muskelvergleich.

## Alter und Fortschritt im Zeitverlauf

- Mit Geburtsdatum wird das genaue Vergleichsalter aus dem lokalen Kalendertag
  berechnet. Die Alterskurve verläuft auch zwischen Geburtstagen kontinuierlich;
  das sichtbare Profilalter zeigt volle Jahre. Für den 29. Februar liegt der
  Jahrestag in Nichtschaltjahren am 1. März.
- Ohne Geburtsdatum erhält ein vorhandenes Alter einmalig ein gespeichertes
  Bezugsdatum (`ageReferenceDate`, `ageReferenceValue`). Es wächst danach als
  Näherung mit. Für genaue Zuordnung im Profil das Geburtsdatum ergänzen.
- Bei Berechnung, Öffnen, Rückkehr und täglichem Wechsel wird neu verglichen.
  Offene Eingaben und aktive Workouts werden beim Tageswechsel nicht neu gerendert.
- Die heutigen Ränge vergleichen alle Rekorde mit dem **heutigen Profilalter**.
  Historische Körpergewichte und Gerätekonfigurationen bleiben Bestandteil der
  ursprünglichen Leistung. Workouts, Sätze, verdiente XP und Belohnungen werden
  nicht rückwirkend geändert.
- Für tatsächlichen Kraftfortschritt Gewicht, Wiederholungen und geschätztes 1RM
  vergleichen. Alterspunkte können sich auch ohne ein neues Training ändern.
  Die Übungsdetails zeigen Basispunkte, Alterspunkte und Faktor nebeneinander.
- Freunde benötigen ebenfalls X4.7 und einen aktualisierten synchronisierten
  Stand für denselben Berechnungsstand. Keine neue Cloud-Bestenliste angelegt;
  reale Konto-/Cloud-Synchronisation wurde nicht getestet.
