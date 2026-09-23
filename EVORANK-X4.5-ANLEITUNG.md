# EvoRank X4.5

## Starten und Ablage

Windows-App:
`C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x4\EVORANK-X4.5-WINDOWS`

`EVORANK-START-MIT-NODE.bat` doppelklicken. Eine vorherige EvoRank-Serverinstanz
auf Port 8123 vorher schließen; denselben Browser und die Adresse
`http://127.0.0.1:8123/` weiterverwenden, damit lokale Trainingsdaten verfügbar bleiben.
Das Serverfenster offen lassen.

Daneben liegen die entpackten Pakete `EVORANK-X4.5-NETLIFY` und
`EVORANK-X4.5-CODEX-PROJEKT`. Felix bekommt zusätzlich den vollständigen Code in:
`C:\Users\johan\OneDrive\Dokumente\EvoRank\ZIP\x\x4\EVORANK-X4.5-FELIX-CODE.zip`.

## Neu

- Beste Muskel-Leistung zählt jetzt zu 70 %, weitere beste Beiträge zusammen
  zu 30 %. Beispiel: Dips 480 + weiterer Trizepsbeitrag 300 → **426** Muskelpunkte.
  Dips selbst bleiben im Beispiel +40 kg × 8 bei 70 kg, männlich, bei **480 / Platinum**.
- Kabelübersetzung steht sichtbar an der Übung. 1:1 ist unbestätigter Standard;
  korrektes Modell bzw. Geräteschild prüfen. Du kannst eine Einstellung als
  Standard für neue Kabelübungen speichern. Fertige Sätze werden nicht umgerechnet.
- Weicher Hintergrund etwas grauer, anatomische Konturen fein schwarz.
- Pausentimer mit Lautstärkeregler und Testton; 0 % ist stumm.
- Plan und aufgezeichnete Einheiten gemeinsam in deiner Trainingswoche.
- Freundesliste mit Aktualisierungszeitpunkt und 30-Sekunden-Abruf im Vordergrund.
- Strava-Verbindung vorbereitet; vorhandene Garmin-Anbindung bleibt erhalten.
- Native iPhone-Alarm-/Widget-Anbindung korrigiert und erweitert.

## Einrichtung direkt lesen

In der App: **Profil → Punkte, Freunde & iPhone** oder `website/hilfe-x4.5.html`.
Die ausführliche Hilfe erklärt Schritt für Schritt:

1. Pausenton testen und Lautstärke einstellen.
2. Warum Safari im Hintergrund keinen sicheren Alarm garantieren kann.
3. Native iPhone-Mitteilungen, Musikunterbrechung, Dynamic Island und Widgets.
4. Freunde per Spitzname suchen, Anfrage annehmen und neue Werte synchronisieren.
5. Öffentliche Bestenlisten separat freigeben.
6. Strava/Garmin mit der persönlichen Trainingswoche verbinden.

Strava/Garmin benötigen die beschriebenen Serverkonten und Freigaben.
Für Dynamic Island, Widget und zuverlässige lokale iPhone-Alarme muss der
beiliegende native Code auf einem Mac in Xcode gebaut, signiert und installiert
werden. Das lässt sich durch eine Einstellung in der Windows-/Web-App nicht ersetzen.
Die normale iPhone-Mitteilungslautstärke, Fokus und Stummmodus bleiben wirksam.

52 automatisierte Tests und Framework-Build erfolgreich. Kein echter
iPhone-/OAuth-/Kontotest und keine Online-Veröffentlichung durchgeführt.
