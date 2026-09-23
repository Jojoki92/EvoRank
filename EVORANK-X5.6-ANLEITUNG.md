# EvoRank X5.6

## Öffnen auf Windows

Ordner: `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X5.6\EVORANK-X5.6-WINDOWS\`

**EVORANK-STARTEN.bat** oder **EVORANK.exe** doppelklicken. Dafür brauchst du **kein Node.js**. Windows PowerShell betreibt den lokalen Webserver. Das Fenster bleibt während der Nutzung offen. Der zusätzliche Node-Starter ist eine Alternative; Node wird außerdem für Entwicklung, Tests und Build benötigt.

Die App braucht einen lokalen Webserver für verlässliche Speicher- und Web-App-Funktionen; `index.html` direkt anzuklicken ist kein gleichwertiger Start. Die bisherige Adresse `http://127.0.0.1:8123/` und denselben Browser verwenden. Eine alte Serverinstanz zuerst schließen. Keine Website-Daten löschen.

## Änderungen

- Alle Abzeichen erhalten dieselbe klare Darstellung, auch im hellen Modus. Die gelieferten Grafiken und Rangnamen bleiben erhalten.
- Tempo, Langstrecke und Konstanz stehen bei Rad, Laufbahn und Schwimmbecken außerhalb der Grafik. Auch lange Rangnamen dürfen umbrechen. Die Beschriftungen sind antippbar.
- Gym und Ausdauersport verwenden in den großen Startkarten sowie im Plus-Menü durchgehend die eigenen Abzeichen.
- Rangüberschriften haben mehr Zeilenhöhe; Unterlängen wie das „g“ in „Einsteiger“ werden nicht abgeschnitten.
- Gewicht, Größe und Alter stehen zuerst unter **Profil → Bearbeiten**. Weitere Angaben findest du in „Profilbild, Name & Training“. Der separate Gewichtskasten führt ebenfalls dorthin. Änderungen gelten beim Speichern; alte Trainingswerte bleiben erhalten.
- Die Unterarm-Trefferflächen beim Mann entsprechen jetzt der sichtbaren Maske. Ausgewählte Muskeln werden dunkler in ihrer bestehenden Rangfarbe. Weißbeimischung und geringere Deckkraft im hellen Modus sind entfernt.

## Homescreen-Icon auf dem iPhone

Die Akzentwahl färbt die App. Das installierte Homescreen-Symbol ist weiterhin das freigegebene **metallische D+H-Logo**; es ist eine eigene Bilddatei und wechselt nicht mit der Akzentfarbe. X5.6 versieht die Icon-Adressen mit einer Versionskennung. Ein bestehendes iOS-Symbol muss dadurch nicht sofort neu eingelesen werden.

Nach dem Hochladen des X5.6-Netlify-Ordners auf **dieselbe bestehende Website**:

1. In der bisherigen App vorsichtshalber ein Trainings-Backup exportieren, bevor du sie entfernst oder neu hinzufügst. Website-Daten nicht löschen.
2. Die bisherige Webadresse in Safari öffnen und neu laden. Im Profil prüfen, ob X5.6 angezeigt wird. Solange dort eine ältere Version steht, zuerst das Website-Update prüfen.
3. Safari → **Teilen → Zu Home-Bildschirm hinzufügen**. Falls angeboten, **Als Web-App öffnen** aktivieren und hinzufügen. Das entspricht [Apples Anleitung](https://support.apple.com/de-at/guide/iphone/iph42ab2f3a7/ios).
4. Den neuen Eintrag und die Daten prüfen; danach gegebenenfalls den alten Eintrag entfernen. Falls iOS nur eine Neuinstallation erlaubt, das Backup vor dem Entfernen sicher aufbewahren und bei Bedarf importieren. Keine pauschale Datenlöschung zum Beheben des Icons durchführen.

Apple verwendet für Web-Apps unter anderem den [apple-touch-icon-Verweis](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/). Ein öffentlicher Netlify-Deploy wurde hier nicht ausgeführt. Die lokal gespeicherten Pakete aktualisieren die Website nicht von selbst.

## Farben zwischen Geräten vergleichen

Die App verwendet jetzt dieselben deckenden RGB-Farben und dieselbe Auswahl-Abdunklung in beiden Darstellungen. Ein echter iPhone-Test wurde dadurch nicht ersetzt. Für einen direkten Vergleich dieselbe Akzentfarbe und denselben Hell-/Dunkelmodus wählen. True Tone, Night Shift oder Farbfilter können die Bildschirmwirkung zusätzlich verändern; die App kann diese Systemeinstellungen nicht überschreiben. Apple erklärt diese Einstellungen unter [Helligkeit und Farben anpassen](https://support.apple.com/de-lu/guide/iphone/iph60ba71065/ios). Das betrifft die Anzeige, nicht deine gespeicherten Rangwerte.

Freigaben für die bisherigen Git- und Speicherorte sind dokumentiert. Eine nötige technische Sandbox-Prüfung erfolgt weiterhin über die Umgebung. Neue Speicherorte oder andersartige Aktionen sind davon nicht pauschal umfasst.
