# X5.3 – lokale Prüfung, 15.09.2026

- `npm.cmd run test:x5`: **102/102 bestanden**. Enthält echten App-Start, Speicherung und Wiederöffnung im bestehenden JSDOM-Testsystem; neue Teilwertberechnung, unveränderte Gesamtränge und Historie, aufgezeichnetes Radgewicht, keine/future Daten, getrennte Freundeswerte, alle Rangansichten, Tastaturfokus und unveränderte Farbdichte-Einstellung.
- `.\node_modules\.bin\vinext.cmd build`: **erfolgreich**, alle fünf Build-Phasen. Vinext weist weiterhin auf seine begrenzte automatische Routenklassifizierung hin; kein Buildfehler.
- `node scripts/smoke-release.mjs`: **179 Ressourcen über lokalen HTTP-Server erreichbar**, korrekte Version `X5.3`. Details in `EVORANK-X5.3-HTTP-CHECK.json`.
- Headless Microsoft Edge mit synthetischem, neu initialisiertem Testprofil: keine JavaScript-Seitenfehler. Home-Sportwechsel, Bereichsauswahl, Galerie, Analyse, Profil, Startseiten-Schalter, Freunde, Aufnahme und Rangkarte in hell/dunkel dargestellt. 320–430 Pixel breite Ansichten geprüft. Alle fünf Rangtabs passen auf 320 Pixel. Timer über echtes Formular ohne GPS gestartet und pausiert. Unveränderter Gym-Bodygraph nach dem Sportwechsel vorhanden.
- ForgeDrop: letzter Schließen-Button nach Scrollen bei 1360×610 und 375×667 erreichbar; kein horizontaler Überlauf des Scrollbereichs.
- Die ursprünglichen Rangbilder wurden nicht überschrieben; nur die SVG-Maskierung wurde geändert. Anatomische Bilder und ihre Überlagerungen bleiben unverändert. Es wurden keine neuen Laufzeit-Abhängigkeiten eingeführt.

Nicht geprüft: private Konten/Trainings, echter Freunde-Backend-Transport der zusätzlichen Sportfelder, OAuth-Anbieter, GPS/Schwimmbahnen auf realem Gerät, iPhone-Hintergrundverhalten, natives Swift/Xcode, veröffentlichtes Hosting oder App Store. Die Browserprüfung läuft in einem isolierten Testprofil; sie ist kein Zugriff auf den privaten Browser des Nutzers.

Die Video-/Audio-Auswertung und vorübergehende Spracherkennungsdateien gehören nicht zum Paket oder Git-Commit. Es wird keine Website veröffentlicht.
