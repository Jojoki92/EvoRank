# EvoRank X5.5

## Öffnen

Diese Version liegt entpackt unter:
`C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X5.5\EVORANK-X5.5-WINDOWS\`

Starte **EVORANK-START-MIT-NODE.bat** (Node.js ab 22.13). Der bestehende Windows-Starter bleibt ebenfalls enthalten. Falls noch eine ältere lokale Serverinstanz läuft, diese zuerst schließen. Die gewohnte Browseradresse beibehalten und neu laden. **Website-Daten nicht löschen**: Dort liegen deine lokalen Trainingsdaten. Der Offline-Cache aktualisiert sich getrennt davon. Die Netlify-Ausgabe ist vorbereitet, aber noch nicht veröffentlicht; am iPhone erscheint X5.5 erst nach Aktualisierung derselben Website.

## Änderungen aus den Videos

- Der Ladebildschirm deckt den ganzen sichtbaren Bereich ab. Lokale Daten warten nicht mehr auf Profil-/Garmin-Abfragen. Mit bereits gespeichertem Offline-Stand greift der Seitenstart nach 1,5 Sekunden auf diesen zurück, wenn das Netzwerk hängt. Die App lädt dabei nicht automatisch neu.
- Muskel-Auswahl reagiert auf den eigentlichen Bereich. Beim Mann wurden übergroße unsichtbare Trefferflächen korrigiert. Der ausgewählte Muskel hebt sich deutlich ab; erneutes Antippen wählt ihn ab. Die SVG-Grafik bleibt dabei bestehen. Langes Drücken auf dem Körper markiert keinen Text mehr.
- Das Plus sitzt etwas tiefer und öffnet Gym, Laufen, Radfahren und Schwimmen. Das nächste Gym-Workout bzw. die große Ausdauer-Startkarte folgt direkt auf die Körper-/Sportübersicht. Über „Schnelles Workout“ erreichst du ebenfalls alle Sportarten.
- Kleinere, klarer gegliederte Überschriften und Rang-Tabs; eine ruhigere Darstellung der Analysewerte. Profil-Schnellzugriffe stehen in zwei Reihen, die dritte Karte mittig. Abgewählte Startseitenmodule sind dezent grau. Rechtliche Links folgen der Akzentfarbe. Der grüne Pay-to-win-Hinweis ist entfernt.
- Sportbereiche ohne Messwerte erscheinen in Braun mit dem jeweiligen Einsteigernamen. Dabei steht „noch keine Messwerte“. Es werden keine Punkte, Aufzeichnungen oder Abzeichen erfunden. Die großen Sportgrafiken und die Körperbilder bleiben erhalten.
- Neue Profile erhalten nach der Einrichtung eine kurze überspringbare Einführung. Erneut öffnen: **Profil → Daten & Hilfe → EvoRank entdecken**. Sie schaltet keine Freigaben ein.

## Laufen und Radfahren mit Standort

1. Plus → Laufen oder Radfahren → **Timer + GPS-Distanz** → Starten.
2. Die Standortanfrage erlauben. GPS benötigt HTTPS oder einen lokalen Browser auf localhost. Eine unverschlüsselte LAN-Adresse vom Computer ist am Handy normalerweise kein geeigneter GPS-Zugang.
3. Im Freien auf die Anzeige **GPS ± … m** warten. Messungen über 50 m Ungenauigkeit, unrealistische Sprünge und große Zeitlücken werden nicht einfach als zurückgelegte Strecke gezählt. Sehr langsame Bewegung kann durch die Rauschunterdrückung unterschätzt werden.
4. Die App sichtbar und den Bildschirm eingeschaltet lassen. Beim Sperren oder Wechsel zu TikTok kann die Web-App keine zuverlässige GPS-Aufzeichnung garantieren. Nach einer Unterbrechung die Strecke vor dem Speichern prüfen.
5. Bei verweigerter Berechtigung: Standortfreigabe für die Website in den Browser-/Systemeinstellungen prüfen, dann die Aufnahme pausieren und fortsetzen. Alternativ nur den Timer verwenden und die Distanz eingeben.

Die GPS-Anzeige wurde mit simulierten Positionen geprüft, nicht auf einer realen Laufstrecke. Die aktuelle Koordinate bleibt nur im Arbeitsspeicher. Der Wiederherstellungsentwurf speichert Zeit/Distanz, keine Route. Die [Geolocation-Spezifikation](https://www.w3.org/TR/geolocation/#request-a-position) sieht Positionsupdates nur für aktive, sichtbare Dokumente vor.

## Welche Körperdaten beeinflussen den Rang?

Beim Laufen und Schwimmen zählen Zeit, Strecke, Alterskurve und das gewählte Körperprofil. Die Rangdetails nennen die Referenz und die Grenzen der Schätzung. Größe und Gewicht erzeugen dort keinen erfundenen Bonus. Gemessene Radleistung kann ab 20 Minuten über Watt pro gespeichertem Kilogramm verglichen werden; sonst zählt Tempo. Gym berücksichtigt weiterhin Leistung, Körpergewicht, Alter und die bestätigten Geräte-/Kabel-Einstellungen. Die aktuellen Profildaten verändern den heutigen Vergleich, nicht die gespeicherten Trainingswerte oder Belohnungen.

## Vor einer öffentlichen Veröffentlichung

Die beiliegende **RECHTSCHECK.md** enthält den Abgleich mit RIS und EU-Recht. Besonders offen sind Betreiberanschrift, tatsächliche Hosting-/Cloud-Verträge und Löschfristen, der Umgang mit minderjährigen Nutzern und Nachweise für Bildrechte. Für spätere Käufe sind eigene Kauf-/Verbraucherprozesse erforderlich. Diese Version wurde weder rechtlich insgesamt freigegeben noch im App Store veröffentlicht.

Der vorhandene SQL-Setup-Ordner für Bestenlisten bleibt erhalten. Native iPhone-Funktionen, echte Konto-/Cloud-Verbindungen und Netlify-Veröffentlichung wurden nicht durch lokale Tests ersetzt.
