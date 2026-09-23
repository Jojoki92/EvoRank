# Rangprüfung X4.2 · 8. September 2026

## Umfang und Aussagekraft

Alle 1.501 Einträge wurden auf eindeutige IDs, Tracking-Modus, positive
Kraftreferenzen, endliche Ergebnisse und konsistente Last-/Wiederholungssteigerung
geprüft: 1.001 Kraftübungen und 500 Mobilitätsübungen. Letztere vergeben keinen
Kraftrang. Der reproduzierbare Durchlauf umfasst 91.912 Score-Berechnungen mit
männlichem/weiblichem Profil und 45, 70, 100 und 140 kg Körpergewicht.

37 Dip-/Klimmzugvarianten verwenden direkte Community-Tabellen. Die übrigen 964
Kraftvarianten behalten übertragene Übungsreferenzen. Für jede einzelne Variante
existieren keine belastbaren universellen Internet-Normen. Der vollständige
Prüflauf ist deshalb eine Konsistenzprüfung, keine wissenschaftliche Validierung
aller Übungen. Die Zuordnung jedes Eintrags steht in
[EVORANK-X4.2-EXERCISE-AUDIT.json](EVORANK-X4.2-EXERCISE-AUDIT.json).

## Dips und Klimmzüge

Quellen: [Strength Level Dips](https://strengthlevel.com/strength-standards/dips/kg)
und [Strength Level Pull Ups](https://strengthlevel.com/strength-standards/pull-ups/kg).
Es handelt sich um von Trainierenden gemeldete Vergleichsdaten, nicht um eine
repräsentative Stichprobe der Gesamtbevölkerung. Die App interpoliert zwischen
Körpergewichtsstufen; außerhalb der übernommenen Stützstellen verwendet sie deren
äußerste Zusatzlast. Sehr leichte/schwere Profile sind daher weniger gut abgedeckt.
Varianten, Griffwahl und Ausführung sind weitere Unsicherheiten.

Beispiel männlich, 70 kg Körpergewicht, Dips mit 40 kg Zusatzgewicht × 8:

- Bewegte Gesamtlast: 70 + 40 = 110 kg.
- Bisherige Epley-Schätzung: 110 × (1 + 8/30) = 139,33 kg Gesamt-1RM.
- Entsprechende geschätzte Zusatzlast: 69,33 kg.
- Die Quelle nennt bei 70 kg die Zusatz-1RM-Stufen 2 / 22 / 46 / 73 / 101 kg.
- EvoRank ordnet diese fünf Stufen selbst den Scores 100 / 220 / 350 / 500 / 650 zu.
  Das Beispiel ergibt **480 Punkte, Platinum**, nahe Diamond ab 500.

Diese Rangnamen und Score-Abstände sind Produktentscheidungen. Sie sind weder
Perzentile der Quelle noch eine Übernahme ihrer eigenen 1RM-Formel. Der alte
X4.1-Stand ergab für die normale Dip-Variante bereits Platinum; andere Versionen
und Bench Dips können anders bewertet werden. Bench Dips sind keine gleichwertige
Ausführung freier Dips und behalten eine Körperanteil-Schätzung.

## Maschinen und Kabel

[Life Fitness erklärt die mechanische Übersetzung](https://support.lifefitness.com/hc/en-us/articles/360037410013-Life-Fitness-Strength-Mechanical-Advantage).
Die Schreibweise von Verhältnissen variiert. Deshalb fragt die App nach dem
ausdrücklichen **Teiler**: 40 kg Stapelgewicht ÷ 2 = ungefähr 20 kg am Griff.
Wurde die Griffkraft bereits in kg-Äquivalent umgerechnet, wird nicht erneut geteilt.
Die Anzahl sichtbarer Umlenkrollen reicht zur Bestimmung nicht aus.

Für Maschinen gilt die Näherung:
`eingegebenes Gewicht × Gerätefaktor + Startwiderstand am Griff`.
Herstellerangabe oder Messung bestimmen diese Parameter. Kurvenscheiben,
Hebelarme, Reibung, Bewegungsumfang und Sitzposition können den Widerstand während
der Bewegung verändern. Das Ergebnis ist eine geschätzte äußere Last, keine
Messung der Muskelkraft. Maschinenränge bleiben als Schätzung markiert und bei
699 Punkten gedeckelt. Individuelle Geräte sind dadurch nicht vollständig normiert.

Die neue Übung `PREACHER_CURL_MACHINE` ergänzt die vorhandene Bizepsmaschine,
ohne deren ID zu ändern. Der Richtwert 52 kg ist von der bisherigen Referenz
übernommen. Zum Vergleich nennt [Strength Level Machine Bicep Curl](https://strengthlevel.com/strength-standards/machine-bicep-curl/kg)
52 kg als männliche mittlere 1RM-Stufe bei 70 kg Körpergewicht. Das bestätigt
keine Übertragbarkeit auf jedes Preacher-Gerät.
[Life Fitness Biceps Curl](https://www.lifefitness.com/en-eu/catalog/strength-training/plate-loaded/life-fitness-biceps-curl)
zeigt eine konkrete Geräteausführung mit eigener Armauflage und Griffmechanik.

Gerätekonfigurationen werden pro Übung und Satz gespeichert. Änderungen gelten
für offene und neue Sätze. Fertige Sätze und historische Lasten werden nicht
nachträglich auf eine neue Übersetzung umgerechnet. Alte Einträge ohne Angaben
verwenden kompatibel Faktor/Teiler 1 und zusätzlichen Startwiderstand 0.

## Muskelzuordnung und bestehende Referenzen

Beinbeuger/Leg Curls erhalten durch das Wort „Curl“ keine Bizepspunkte mehr.
Beinheben an der Dip-Station wird nicht als Dip mit Trizeps-/Brustbeteiligung
interpretiert. Die [NASM-Übungsbibliothek](https://www.nasm.org/workout-exercise-guidance)
führt Leg Curls als Beinübung und unterscheidet Bizepscurls davon.

Die bestehenden geschlechtsspezifischen Grundanker für Kniebeuge, Bankdrücken
und Kreuzheben bleiben erhalten. [Van den Hoek et al. 2024](https://pubmed.ncbi.nlm.nih.gov/39060209/)
untersuchten 809.986 Wettkampfeinträge. Solche Powerlifting-Daten gelten für diese
Wettkampfbewegungen und die untersuchte Population; ihre Übertragung auf andere
Übungen oder Maschinen bleibt eine Näherung.

## Reproduzieren

```powershell
npm.cmd run test:x4
npm.cmd run audit:x4.2
```

Die Prüfung schreibt ausschließlich den Auditbericht. Sie verändert keine
persönlichen Trainingsdaten. Aktuelle Ränge werden neu berechnet; gespeicherte
Workouts, damaliges Körpergewicht, XP und bereits erhaltene Belohnungen bleiben.
