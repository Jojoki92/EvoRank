# X4.8 · Ausdauerränge und ihre Grenzen

Stand: 10. September 2026. Die neun vorhandenen Ausdauerstufen bleiben erhalten.
Schwimmen, Laufen und Radfahren verwenden jetzt jeweils eigene Altersreferenzen.
Die Umsetzung ist eine nachvollziehbare EvoRank-Schätzung, keine offizielle
Wettkampfnorm und kein gemessenes Perzentil.

## Alter und Körperprofil

Grundlage sind die veröffentlichten Intermediate-Zeiten nach Alter und
Körperprofil: [5 km Laufen](https://runninglevel.com/running-times/5k-times),
[1.000 m Schwimmen](https://swimminglevel.com/swimming-times/1000m-times) und
[20 km Radfahren](https://cyclinglevel.com/cycling-times/20k-times).
Die vollständigen verwendeten Zahlen stehen in `assets/endurance-ranking-x4.8.js`.

Zwischen den Fünfjahreswerten von 15 bis 90 wird linear interpoliert. Alter wird
aus dem aktuellen Geburtsdatum taggenau berechnet und entwickelt sich weiter;
alte reine Altersangaben behalten die datierte Referenz aus X4.7. Ohne gültiges
Alter gibt es keinen Altersfaktor. Für 13–14 und über 90 gelten die Randwerte;
unter 13 wird keine Altersanpassung angewendet. Das ist in der App erläutert.

Sei T(a,p) die Referenzzeit für Alter a und Körperprofil p:

- Altersfaktor = T(a,p) / T(25,p).
- Körperprofilfaktor = T(25,p) / T(25,männlich).
- Bewertetes Tempo = tatsächliches Tempo × beide Faktoren.

Damit erhält dieselbe Leistung bei 17 oder 60 eine andere Einordnung als bei 25.
Die Kurven unterscheiden sich pro Sportart; die Kraftkurve wird nicht verwendet.
Die Übertragung einer Referenzstrecke auf andere Distanzen ist eine Annahme.
Das aktuelle Profil bestimmt den heutigen Rang auch für vorhandene Einheiten.
Die tatsächlichen Zeiten, Distanzen, XP und verdienten Belohnungen bleiben gleich.
Der Rang ist deshalb ein heutiger Vergleich, keine reine Verlaufskurve der Rohleistung.

## Körpergewicht und Radleistung

Beim Eintragen oder Speichern einer Radeinheit lässt sich **Leistung & Körpergewicht
ergänzen** aufklappen. Dort gemessene Durchschnittswatt von Powermeter/Smarttrainer
und das Körpergewicht bei dieser Einheit eintragen. Bei einer neuen Aufnahme wird
das Gewicht am Start vorgemerkt. Bei älteren Einheiten muss es geprüft werden;
unbekanntes früheres Gewicht wird nicht aus dem heutigen Profil nachgetragen.

Ab 20 Minuten mit vollständigen Messwerten wird Durchschnittswatt / gespeichertes
Körpergewicht bewertet, zum Beispiel 210 W / 70 kg = 3 W/kg. Spätere Änderungen
des Profilgewichts verändern diese Leistung nicht. Fehlende oder ausdrücklich als
geschätzt gekennzeichnete Wattwerte führen zur bisherigen Tempobewertung.
Garmin-JSON kann `averagePowerWatts`, `avgPowerWatts`, `averagePower` oder `avgPower`
und `bodyweightKg` liefern. `powerSource: "estimated"` oder `deviceWatts: false`
kennzeichnen geschätzte Leistung; sonst muss das Leistungsfeld einen Messwert
enthalten. TCX/GPX bleiben bei ihrem bisherigen Distanz-/Zeitimport.

Die W/kg-Komponente nutzt eine **eigene lineare App-Skala von 1 bis 6 W/kg**;
dies sind keine belegten Grenzen für die neun Ränge. Der gleiche Alters- und
Körperprofilfaktor wird auf W/kg übertragen. Diese Übertragung aus Zeitreferenzen
ist ebenfalls eine Modellannahme, keine validierte physiologische Umrechnung.
Durchschnittsleistung aus mindestens 20 Minuten ist kein FTP-Test. Unterschiedliche
Dauern, Strecken, Wind, Steigung, Fahrrad und Messgeräte begrenzen den Vergleich.

Beim Laufen und Schwimmen gibt es keinen pauschalen Gewichtsbonus. Gewicht allein
liefert dafür keine belastbare Zeitkorrektur. Zeit, Strecke, Alter und Körperprofil
bestimmen den Rang; es werden keine Wattwerte aus Geschwindigkeit geschätzt.

## Punkte und Anzeige

Die bisherige Formel bleibt bestehen: maximal 800 Leistungspunkte, davon 72 %
Tempo beziehungsweise W/kg und 28 % Distanzanteil, anschließend der bestehende
Mindestdistanzfaktor. Komponenten sind auf 0–1 begrenzt. Der Tempoanteil verwendet
die vorhandenen sportartspezifischen Grenzen. Der Distanzanteil ist die Quadratwurzel
der normalisierten Distanz; der Mindestdistanzfaktor liegt zwischen 0,25 und 1.
W/kg wird als `(W/kg × Faktoren − 1) / 5` normalisiert.

Zur besten Leistung kommen unverändert höchstens 99 Punkte für Regelmäßigkeit.
Dieser Bonus wird nicht durch Alter oder Gewicht erhöht. Zukünftige Einheiten
werden nicht für aktuelle Ränge verwendet. Persönliche Strava-Importe bleiben
im Kalender und werden nicht zu öffentlichen Leistungsrängen hinzugefügt.
Auf Sportseite und Ranks zeigt ein aufklappbarer Hinweis Basis-, Alters- und
Regelmäßigkeitspunkte sowie bei Radleistung die tatsächlich verwendeten W/kg.
