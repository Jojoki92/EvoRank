# EvoRank X5.3 – Deine Sportprofile

## Öffnen

1. Eine noch laufende alte EvoRank-Serverinstanz schließen.
2. Im Ordner **EVORANK-X5.3-WINDOWS** die Datei **EVORANK-START-MIT-NODE.bat** doppelklicken. Node.js ist auf diesem Computer vorhanden. Alternativ: **EVORANK-STARTEN.bat**.
3. Das Serverfenster geöffnet lassen. Denselben Browser, dasselbe Konto und die bisherige Adresse verwenden: normalerweise **http://127.0.0.1:8123/**.

Falls noch die ältere Version erscheint: einmal **Strg + F5**. Die Website-Daten nicht löschen; darin liegen die lokalen Trainings.

## Sportgrafiken und Ränge

Auf Home wählst du Gym, Laufen, Radfahren oder Schwimmen. Die Rangkarte wechselt mit. Unter **Ränge anpassen** bestimmst du weiterhin deine Sportarten und sichtbaren Startseitenbereiche.

Die Laufbahn, das Rad mit Speichen und das Schwimmbecken zeigen gleichzeitig drei farbige Bereiche. Tippe Tempo, Langstrecke oder Konstanz an: Die Karte darunter zeigt den Bereichsrang und die gemessene Grundlage. Die weiße Kontur markiert deine Auswahl. Grau bedeutet: noch keine passende Aufzeichnung.

- **Tempo:** Tempokomponente des bestehenden Ausdauermodells, mit aktuellem Alters- und Körperprofilvergleich. Geeignete gemessene Radleistung ab 20 Minuten verwendet Watt je damals gespeichertem kg; sonst zählt Tempo.
- **Langstrecke:** Streckenkomponente der besten geeigneten Distanz; dieselben Streckenschwellen wie im bestehenden Modell.
- **Konstanz:** Ausschöpfung des bisherigen Bonus für aktive Tage der letzten 28 Tage. Acht Tage erreichen die höchste Teilfarbe. Das beschreibt Regelmäßigkeit, keine sportliche Eliteleistung.

Die Teilfarben sind EvoRank-Spielstufen auf 0–800 Punkten. Sie werden **nicht zusätzlich zum Gesamtrang addiert**. Dieser bleibt beste bewertete Einheit plus Konstanzbonus. Deine tatsächlichen Zeiten, Trainingshistorie, XP und Belohnungen bleiben erhalten. Antippen der Detailkarte oder **So wird dein Rang berechnet** öffnet die Erklärung einschließlich Quellen und Grenzen der Schätzung.

Alle Sportarten haben unter **Ranks** dieselben Bereiche: Dein Rang, Körper-/Sportprofil, Freunde, Galerie und Analyse. **Verlauf ansehen** öffnet das Diagramm mit echten Aufzeichnungen; Strecke, Dauer und Pace beziehungsweise Geschwindigkeit sind auswählbar. **Einheit aufnehmen** führt zum vorhandenen Timer/GPS beziehungsweise Bahnenzähler. **Manuell eintragen** öffnet das Eingabeformular.

## Aufgeräumte Bedienung

Die zusätzlichen Knopfreihen auf Home und Profil entfallen. Pläne bleiben im Profil unter Training erreichbar; die Übungsdiagramme sind dort unter **Fortschrittsgrafiken** gesammelt. Startseitenoptionen verwenden die Schalter und Farben der App. ForgeDrop passt sich der verfügbaren Bildschirmhöhe an und lässt sich bis zum Ende scrollen. Abzeichen erscheinen im hellen Modus ohne graue Bildkästen. Die Körpergrafiken wurden nicht verändert.

Freundesvergleiche können jetzt auch getrennte Ausdauerwerte aus neu geteilten Momentaufnahmen anzeigen. Ältere Momentaufnahmen enthalten diese Werte noch nicht. Die bestehenden Konto- und Freigaberegeln gelten weiter; ohne konfigurierte Cloud entsteht keine automatische Online-Freundesliste.

## Ablage und Prüfung

Diese Version liegt in **EvoRank\FREED\x\x5\X5.3**, getrennt in Windows und Netlify. Es gibt keine neue Codex-Kopie und keine ZIP-Datei. Der Quellcode bleibt im bestehenden Git-Projekt.

Lokal geprüft werden Start und Wiederöffnung, Berechnungen, Bedienung und Darstellung mit synthetischen Testdaten. Das ersetzt keinen Test mit deinem privaten Konto, GPS auf einem realen Handy oder dem veröffentlichten Hosting. Die Netlify-Version wurde vorbereitet, nicht veröffentlicht. Die vorhandene Lizenzanalyse ist unter **website/licenses/LIZENZANALYSE-X5.1.md** im Windows-Paket enthalten.
