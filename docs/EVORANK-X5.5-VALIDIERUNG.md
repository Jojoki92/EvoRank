# EvoRank X5.5 – lokale Validierung

Stand: 17.09.2026. Branch: `codex/evorank-x5.5`. App-Build: `x5.5-r1`.

## Ergebnis

- `npm.cmd run test:x5`: **123 bestanden, 0 fehlgeschlagen**. Enthält echte App-Initialisierung, Rendern und Wiederöffnen, bisherige Rang-/Kabel-/Trainings-/Plan-/Kontentrennung sowie sieben neue X5.5-Regressionsfälle.
- `.\node_modules\.bin\vinext.cmd build`: erfolgreich. Der bekannte Hinweis zur noch unvollständigen statischen Route-Klassifizierung von Vinext bleibt; kein Buildfehler.
- `node scripts/smoke-release.mjs`: 180 lokale HTTP-Ressourcen aus dem Offline-Katalog erfolgreich geladen, Versionskennung X5.5 geprüft. Einzelbericht: `EVORANK-X5.5-HTTP-CHECK.json`.
- `git -c core.whitespace=cr-at-eol diff --check`: erfolgreich.
- Lizenzinventar aus dem unveränderten Lockfile neu erstellt: 744 Einträge, 493 Lizenztextdateien; keine neuen Abhängigkeiten installiert. Die vorhandenen Lizenzpflichten und offenen Bildrechte werden dadurch nicht aufgehoben.

## Neue Regressionen

1. Tatsächliches SVG-Pfad-Ziel bei Mann/Frau auf Home und im Bodygraph: Auswählen/Abwählen, ARIA-Zustand und unveränderte SVG-Knoten sowie Trainingshistorie.
2. Vier Sportarten über Plus, große Ausdauer-Startkarte unmittelbar nach der Sportübersicht.
3. Einführung überspringen, schließen und erneut öffnen; keine implizite Freigabe und kein Öffnen bei jedem Rendern.
4. Lokale Initialisierung beendet sich auch bei dauerhaft ausstehender Konto-/Token-Antwort.
5. Simulierte ungenaue GPS-Positionen zählen nicht als Strecke. Aktuelle Koordinate wird nicht persistiert; auch ein alter Entwurf verliert sie bei Wiederherstellung. Größen-/Gewichtsänderung erzeugt beim Laufen keinen Bonus, Alter bleibt wirksam.
6. Service Worker liefert bei hängendem Netz den gespeicherten Seitenstand, behandelt keine API-Antworten und erhält fremde Cache-Namensräume.
7. Offline-Rechtstextnavigation bleibt auf der jeweiligen Seite, auch bei HTTP-Fehlern des Servers.

## Browserprüfung

Lokaler Edge/Chromium-Prozess mit Playwright, frischem Testprofil und ausschließlich synthetischen Daten. Keine privaten Trainings-/Anmeldedaten übernommen, externe Anfragen blockiert bzw. durch Testantworten ersetzt.

- Touch-Emulation bei 430 × 932: auf tatsächlich sichtbare Bauch-Pfadpunkte getippt, Mann und Frau; Auswahl und Abwahl funktionieren, die SVG-Referenz bleibt erhalten.
- Plus in jeder Sportart geöffnet; Ausdauer-Startkarte an der vorgesehenen Stelle.
- Profil und Einführung bei 320, 430 und 1360 Pixeln, hell/dunkel: kein horizontaler Überlauf. Screenshots von Körperauswahl, Sportgrafik, Einstiegsfarben, Profil-Schnellzugriffen, Einführung und Gym-Analyse kontrolliert.
- Vollständiges originales HTML samt Start-/Konto-UI geladen. Ein synthetisch angemeldetes Konto mit absichtlich nie aufgelöstem `getProfile()` blockiert die App nicht; Plus bedienbar, kein JavaScript-Seitenfehler. Der Splash deckt alle 430 × 932 Pixel ab.
- Ein kurzer Render-Test mit sechsfacher CPU-Drosselung lag je nach parallel laufenden Prüfungen ungefähr bei 40–63 ms pro Home-Render mit kleinem Testdatensatz. Das ist keine Messung eines echten iPhones oder großer privater Trainingshistorien.

Testskripte, Screenshots und Logs liegen in der ignorierten `.sites-runtime/`-Ablage und werden nicht mit dem App-Paket ausgeliefert. Die automatischen Regressionstests sind im Git-Projekt enthalten.

## Grenzen

Kein reales iPhone/Safari, keine GPS-Laufstrecke, kein gesperrtes Gerät, keine produktive Anmeldung, Cloud-, Strava- oder Garmin-Verbindung, keine neue SQL-Ausführung auf einer produktiven Datenbank, kein Netlify-Deploy und keine App-Store-Prüfung. Die bestehenden Ursprung-/PWA-/Speicherschlüssel bleiben erhalten. Den tatsächlichen Stand vor rechtlicher Veröffentlichung beschreibt `EVORANK-X5.5-RECHTSCHECK.md`.

`release:prepare` und `release:save` wurden erfolgreich ausgeführt. **613 Dateien** wurden per SHA-256 am Ziel verifiziert: `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X5.5\`. Dort liegen getrennte Windows- und Netlify-Ordner, kein ZIP und keine zusätzliche Codex-Quellkopie. Das lokale Auslieferungsprotokoll ist `delivery/EVORANK-X5.5-SAVED.json`; die Manifestdatei enthält die Einzelprüfsummen.
