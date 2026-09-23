# Wie Muskelanzeige und Übungsrang zusammenhängen

## Ein Übungsrang

EvoRank verwendet den besten abgeschlossenen Arbeitssatz pro genauer Übung.
Aufwärmsätze zählen dabei nicht. Aus Last und Wiederholungen wird ein 1RM
geschätzt: bei acht Wiederholungen `Last × (1 + 8/30)`.
Körpergewicht, Körperprofil und Übungsreferenz bestimmen den Vergleich.
Bei Dips zählt die bewegte Gesamtlast aus Körpergewicht plus Zusatzgewicht.
Bei unterstützten Dips wird die Hilfe abgezogen. Für Maschinen und Kabel gelten
die jeweils gespeicherten Einstellungen des Satzes.

**Beispiel: männliches Profil, 70 kg Körpergewicht, normale Dips mit +40 kg × 8.**

| Schritt | Ergebnis |
|---|---|
| Bewegte Last | 70 + 40 = 110 kg |
| Geschätztes Gesamt-1RM | 110 × (1 + 8/30) = 139,33 kg |
| Geschätztes Zusatz-1RM | 139,33 − 70 = 69,33 kg |
| Aktueller EvoRank-Score | 480 |
| Übungsrang | Platinum; Diamond beginnt bei 500 |

Die [Dip-Vergleichstabelle von Strength Level](https://strengthlevel.com/strength-standards/dips/kg)
nennt für Männer mit 70 kg als Intermediate +46 kg und als Advanced +73 kg
Zusatz-1RM. Dein Beispiel liegt mit der App-Schätzung knapp unter dem zweiten
Wert. Die Quelle beruht auf Community-Einträgen. EvoRanks Gold-/Platinum-/Diamond-
Grenzen sind eine eigene Zuordnung, keine objektiv verbindlichen Rangklassen.
Technik, Bewegungsumfang und die Unsicherheit der 1RM-Schätzung bleiben relevant.
Das Beispiel bezieht sich auf freie Dips, nicht auf Bench Dips oder eine Maschine.

## Ein Muskelrang

Die eingefärbte Körperfigur zeigt einen zusammengefassten Muskelrang. Im
aktuellen Code (`getMuscleStatuses` in `evorank-v10.11-r1.js`) gilt:

1. Ein Übungsrekord zählt für den Hauptmuskel mit seinem vollen Score.
2. Für einen mitarbeitenden Nebenmuskel werden 58 % dieses Scores angesetzt.
3. Die bis zu vier höchsten Beiträge werden gemittelt. Der höchste erhält
   Gewicht 1, die weiteren ungefähr 0,84 / 0,76 / 0,71.
4. Dieser zusammengefasste Score bestimmt die Farbe und den Rang des Muskels.

Beispiel: Ein direkter Trizepsbeitrag von 480 aus Dips und ein weiterer direkter
Trizepsbeitrag von 300 ergeben zusammen rund **398, also Gold**. Der Dip-Rekord
selbst bleibt gleichzeitig **Platinum**. Ein Nebenmuskel erhält aus dem Dip-Score
480 zunächst 278 Punkte, bevor er mit seinen weiteren Beiträgen zusammengeführt wird.

Die 58 % sind eine Produktgewichtung und keine gemessene Muskelaktivierung.
Die Körperfigur misst auch nicht Muskelgröße, Körperfett oder momentane Erholung.
Ohne passende Rekorde werden Bereiche neutral bzw. in ihrer Grundfarbe gezeigt.
Mehrere Varianten einer Familie bleiben derzeit getrennte Übungsrekorde. Die
neue Zusammenfassung betrifft ausschließlich die Auswahloberfläche.

## Warum Winkel als Varianten erhalten bleiben

Die neue Auswahl zeigt einen Eintrag Bankdrücken; darin liegen unter anderem
flach, 15°, 30°, 45°, Negativbank und verschiedene Geräte. Die Angabe ist ein
**Winkel in Grad**, kein Prozentwert.

Die Ausführungen sind verwandt, aber nicht biomechanisch identisch. Eine
[Studie mit 30 trainierten Erwachsenen](https://pubmed.ncbi.nlm.nih.gov/33049982/)
verglich die Muskelaktivierung bei fünf Bankwinkeln. In dieser Untersuchung
zeigte 30° mehr Aktivierung der oberen Brust, größere Neigungen stärkere
Beteiligung der vorderen Schulter. Die Messung liefert keine universellen
Kraftränge oder Prozentfaktoren für die App.

Deshalb werden Namen in der Hauptliste zusammengefasst, während die genaue
Ausführung, ihr bisheriger Verlauf und ihre Referenz erhalten bleiben.
