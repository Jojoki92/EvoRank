# EvoRank X3 — Übergabe an Codex

Stand: X3, Build `x3-r1`, 6. September 2026. Grundlage: gesicherter X2-Quellcode,
der die X1-App und das vollständige frühere Projekt enthält. Der lokale Git-Verlauf
enthält den X2-Ausgangspunkt und die X3-Änderungen. Es ist kein GitHub-Remote verbunden.

## Erledigt

1. Aktuelle Übungs-, Muskel- und Gesamtränge folgen dem aktuellen Körperprofil.
   Der alte Fehler war `lift.bodyProfile || getProfile()`: ein gespeicherter
   Männer-Bestsatz überstimmte das neu gewählte Frauenprofil. Der aktuelle
   Auswertungskontext hat jetzt Vorrang, ohne die historischen Sätze umzuschreiben.
   Auch alte Backups mit ausschließlich Bestsätzen werden neu ausgewertet.
2. Frauen-Latissimus: zwei eigene SVG-Pfade am vorhandenen Modell. Die rechte
   Kontur wird nicht mehr um x=256 gespiegelt; das Modell hat seine Rückenmitte
   ungefähr bei x=242. Die alte doppelte Korrekturebene bleibt entfernt.
3. Workout-Sätze: abwechselnde neutrale Grauflächen, größere Eingabezahlen,
   getrennte Kopf-/Eingabezeilen, Satznummern und zugänglicher Erledigt-Zustand.
   Auch L/R-Felder sind neutral. Reihenfolge und Kabelübersetzung aus X2 bleiben.
4. Splash: echtes Logo in fester Größe, EvoRank-Schriftzug und ruhiger Ladebalken.
   Kein bildschirmfüllend vergrößertes Logo mehr. Elf iPhone-Startbilder erneuert.
5. Drei eigenständige Bildentwürfe: A Graphit, B Magenta, C Titan. Eine Auswahlgalerie
   ist im Profil verlinkt. **Noch kein Entwurf ausgewählt oder als neues Icon aktiviert.**
6. RTK-Archiv geprüft: acht Datei-Prüfsummen korrekt, installierte Linux-Binärdatei
   identisch, Version 0.48.0, Telemetrie aus. Bei Git-Status und Tests eingesetzt.

## Wichtige Dateien

| Zweck | Pfad |
|---|---|
| Aktuelle Ranglogik | public/rankforge/assets/evorank-x2-ranks.js |
| Workout/Lat/Profil-Ergänzungen | public/rankforge/assets/evorank-x2-ui.js |
| X3-Kontraste und Splash | public/rankforge/assets/evorank-x3-ui.css |
| Designauswahl | public/rankforge/designs-x3.html |
| Gesamter Katalogvergleich | docs/EVORANK-X3-EXERCISE-AUDIT.json |
| Aktuelle Tests | tests/evorank-x3.test.mjs und tests/evorank-x2.test.mjs |
| Bedienung/Umzug | EVORANK-X3-ANLEITUNG.md |
| Windows-Startdateien | packaging/windows/ |
| Ursprüngliches RTK-Paket | dev-tools/RTK-Codex-Setup.zip |

## Ränge: fachliche Einordnung

1.500 Katalogeinträge, davon 500 Mobilitätsübungen ohne Kraftrang. 783 der 1.000
rangfähigen Übungen sind als geschätzt markiert. Weibliche Referenzen unterscheiden
sich nach Bewegung/Muskelgruppe; Bankdrücken, Kniebeuge und Kreuzheben nutzen die
vorhandenen direkten relativen Normanker. Die weiteren Faktoren sind Übertragungen,
keine einzeln wissenschaftlich validierten Normtabellen. Der Auditbericht benennt
das pro Übung. Keine pauschale Behauptung, alle 1.500 Ränge seien wissenschaftlich exakt.

Bei 75 kg Körpergewicht: Klimmzug +10 kg × 8 = männlich 343 (Gold), weiblich 451
(Platinum); Dips +40 kg × 8 = männlich 408 (Platinum), weiblich 583 (Diamond).
Gleiche Medaille kann trotz höherer Punkte vorkommen; Schätzungen haben weiterhin
eine Obergrenze von 699. Reps über 30 verbessern die 1RM-Schätzung nicht weiter.

## Offen / nächster sinnvoller Schritt

- Nutzer wählt A, B oder C. Danach Icons in allen benötigten Größen exportieren,
  Manifest-/Apple-Verweise versionieren und die neue Startbildkomposition aktualisieren.
- Sichtprüfung und Nutzung auf seinem echten Handy, insbesondere weibliche Kontur,
  Hell-/Dunkelmodus im Workout und Start nach einem Netlify-Update.
- Echtes Netlify-Deployment führt der Nutzer später auf seiner bestehenden Site aus.
  Weder sein privates Konto noch echte Cloud-Synchronisation wurden hier getestet.
- Persönliche Handy-Trainingsdaten sind kein Teil des Quellcodes. Vor Updates einen
  App-Export sichern und bei einem Gerätewechsel gezielt importieren.

## Prüfung

19 aktuelle Verhaltenstests bestanden; Rangprüfung beider Profile über verschiedene
Wiederholungen und Körpergewichte, historische Daten unverändert, Kabel/Reihenfolge
aus X2 weiterhin geprüft. Genauer Abschlussstand: `docs/EVORANK-X3-VALIDATION.json`.
Kein Browser- oder echtes Geräte-Testing in dieser Runde. Die Original-Site war
hier nicht abrufbar; ihr Projektbezug wurde erhalten, nichts veröffentlicht.

Ältere CONTINUE-HERE-/Release-Dateien beschreiben historische Versionen.
