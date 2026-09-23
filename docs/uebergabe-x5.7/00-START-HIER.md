# EvoRank – Übergabe an die nächste KI

Stand: 23.09.2026. Aktuelle ausgelieferte App: **X5.7 / x5.7-r1**.
Geprüfter App-Commit: **983cefb** auf `codex/evorank-x5.7`.
Diese Übergabe ist keine neue App-Version. Die nächste tatsächliche App-Lieferung heißt X5.8.

## Für Johannes

Alle ZIP-Dateien dieses Pakets gehören zusammen. Jede ist eine eigenständig lesbare ZIP, kein Teil einer technisch geteilten ZIP-Datei. Jede bleibt unter **30.000.000 Bytes**, auch nach der strengeren dezimalen MB-Auslegung. Die Nutzdaten je ZIP bleiben zusätzlich unter 28 MB.

1. Der nächsten KI zuerst die ZIP **01-KI-UEBERGABE** geben.
2. Dann auch die übrigen ZIPs hochladen. Bei einem Dateilimit in mehreren Nachrichten fortsetzen. Die KI soll die fehlenden Teile ausdrücklich benennen.
3. Zum lokalen Weiterarbeiten alle ZIPs in **denselben leeren Ordner** entpacken. Die Unterordner zusammenführen. Es gibt keine unterschiedlichen Versionen derselben Datei.
4. Ergebnis: `EVORANK-UEBERGABE-X5.7/projekt/` enthält den vollständigen versionierten Quellstand; `00-UEBERGABE/` enthält den Einstieg; `design-master/` die zusätzlichen Bildmaster und die freigegebene Entwurfsreferenz.
5. `00-UEBERGABE/DATEI-MANIFEST.json` ordnet jede Datei einer ZIP zu und nennt SHA-256 und Größe. Neben den ZIPs liegt ein Prüfbericht mit den tatsächlichen ZIP-Größen und Prüfsummen.

Die Themenpakete sind keine getrennten Apps. Insbesondere laufen App-Quellcode, Cloud-Funktionen und iPhone-Dateien nicht jeweils allein. Fehlende Grafiken können nach dem ersten Paket normal sein, nach dem Zusammenführen aller Pakete nicht.

## Diesen Auftrag an die nächste KI kopieren

> Übernimm EvoRank im vorhandenen Projektstand X5.7. Lies zuerst die vollständige Übergabe in 00-UEBERGABE und danach projekt/AGENTS.md und projekt/CONTINUE-HERE-X5.7.md. Rekonstruiere den Quellordner aus allen ZIPs und prüfe das Dateimanifest. Unterscheide bestehende Implementierung, lokale Prüfungen, echte Geräte-/Cloud-Prüfungen und noch nicht gebaute Funktionen. Alte Versionsnotizen sind Historie und dürfen aktuelle Entscheidungen nicht überschreiben. Erhalte Trainingsdaten, Konten, IDs, Ränge, Design und bestehende Hosting-Origin. Erstelle keine zweite App. Arbeite anschließend anhand der priorisierten Aufgaben in 02-NAECHSTE-SCHRITTE.md weiter. Behaupte keine funktionierende Dynamic Island, keinen App-Store-Release und keine rechtliche Freigabe ohne die dort genannten tatsächlichen Nachweise. Kommuniziere auf Deutsch und liefere konkrete, startbare Ergebnisse. Stelle nötige Fragen zu fehlenden Betreiber-/Apple-/Cloud-Angaben gebündelt; führe unabhängige lokale Arbeiten weiter aus.

## Lesereihenfolge

1. `01-STAND-UND-BISHERIGE-ARBEIT.md` – Funktionen, Historie, nachgewiesene Grenzen.
2. `02-NAECHSTE-SCHRITTE.md` – priorisierte Aufgaben und überprüfbare Fertig-Kriterien.
3. `03-CLOUD-FREUNDE-UND-INTEGRATIONEN.md` – Supabase, Netlify, Strava, Garmin.
4. `04-IPHONE-DYNAMIC-ISLAND-WIDGETS.md` – vorhandener Swift-Code, fehlende native App, Geräteplan.
5. `05-ARCHITEKTUR-RANGSYSTEM-UND-DESIGN.md` – Code-Orte und unveränderliche Produktregeln.
6. `06-START-TESTS-UND-LIEFERUNG.md` – Installation, Testgate, Speicherung, Git.
7. `07-RECHT-LIZENZEN-UND-FEHLENDE-ANGABEN.md` – ungeklärte Tatsachen und Veröffentlichungsvoraussetzungen.
8. `08-PAKETUMFANG-UND-QUELLEN.md` – Vollständigkeit und bewusste Ausschlüsse.

## Aktueller Wahrheitsmaßstab

- Maßgeblich sind der mitgelieferte Quellcode, die aktuelle Übergabe und die X5.7-Prüfberichte.
- Dokumente mit älteren Versionsnummern beschreiben frühere Stände. Ein dortiges „vorbereitet“ bedeutet nicht produktiv eingerichtet. Dateinamen mit X2, X4.5 oder X5.1 können weiterhin aktuelle, aktiv geladene Module sein.
- Alle beschriebenen Testergebnisse sind zeitgebundene Nachweise vom September 2026, keine Zusage für ein anderes Gerät, Konto oder eine spätere Plattformversion. Anbieteranforderungen vor der Einrichtung erneut anhand offizieller Quellen prüfen.
- Die ZIPs enthalten keine privaten Handytrainings, Login-Sitzungen, Server-Secrets oder Cloud-Datenbank-Backups. Der öffentliche Supabase-Projekt-Key bleibt wie im vorhandenen Browsercode erhalten.
- Es wurde durch diese Übergabe nichts veröffentlicht und kein externer Dienst eingerichtet.
