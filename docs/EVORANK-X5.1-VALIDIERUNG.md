# X5.1 – Prüfung am 14.09.2026

- 94/94 aktuelle Verhaltenstests bestanden (`npm.cmd run test:x5`).
- Katalogprüfung: 1.501 Einträge, 91.912 Score-Vergleiche, keine Fehler.
- Windows-Vinext-Build erfolgreich. Die vorhandene Meldung zur noch nicht bestimmbaren Routenklassifizierung ist eine Build-Tool-Einschränkung, kein fehlgeschlagener Build.
- Lokaler Windows-Node-Server: 178 Offline-Ressourcen per HTTP erfolgreich geladen; Versionsdatei X5.1. Testserver anschließend beendet, kein Browser geöffnet. Ergebnis in `EVORANK-X5.1-HTTP-CHECK.json`.
- Der bestehende Netlify-Header sperrte GPS generell. Er erlaubt nun ausschließlich Standortabfragen durch die eigene Seite; eine Nutzerberechtigung ist weiterhin erforderlich. Echter GPS-Empfang wurde nicht getestet.
- Originalbilder visuell gelesen; Ausschnitte getrennt pro Sport und Reihe definiert. Die bestehende Muskelgrafik und ihre Dateien wurden nicht geändert. Keine visuelle Prüfung der fertig gerenderten App in einem Browser oder auf einem echten Telefon durchgeführt.
- Neue Verlaufstests prüfen unregelmäßige Zeitabstände, abgeschlossene Sätze, damalige Kabelübersetzung, fehlendes historisches Körpergewicht, einseitiges Training und korrektes Volumen. Rangschwellen und Alter-/Gewichtsmodelle bleiben erhalten.
- Profil-/Ansichtstests prüfen Normalisierung, kontogetrennte Auswahl und ungültige Eingaben. Frühere UI-Tests wurden für die ausdrücklich gewünschte alleinige Apple-Ansicht und optional eingeblendete Trainingswoche angepasst; deren Funktionen bleiben geprüft.
- Keine echte Anmeldung, Cloudübertragung, Garmin-/Strava-Verbindung, Veröffentlichung oder App-Store-Prüfung. Rechtliche Freigaben für Bilder/Referenzdaten bleiben offen; siehe Lizenzanalyse.
- Auslieferung wird anschließend getrennt vorbereitet und Datei für Datei per SHA-256 geprüft. Der tatsächliche Speicherbeleg liegt nach erfolgreichem Speichern im ignorierten `delivery`-Ordner.
