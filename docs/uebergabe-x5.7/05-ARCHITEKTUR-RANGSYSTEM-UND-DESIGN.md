# Architektur, Rangsystem und Designregeln

Alle Pfade in diesem Dokument sind relativ zu `projekt/` im entpackten Übergabeordner.

## Architektur und wichtige Dateien

Die eigentliche PWA ist `public/rankforge/index.html` mit einer historisch gewachsenen, geordneten Script-/Stylesheet-Kette. `app/`, Vite/Vinext, `worker/`, `db/` und die vorhandene Hostingintegration umgeben sie. Nicht allein `app/page.tsx` neu bauen und die echte PWA ignorieren. Nicht aus Versionsnummern im Dateinamen auf unbenutzten Code schließen.

| Bereich | Wesentliche Dateien unter `public/rankforge/assets/` |
| --- | --- |
| Basis/Workout/Render | `rankforge-v9.2.0.js`, bestehende v10-Erweiterungen, `evorank-x2-ui.js` |
| Kraft/Lastnormalisierung | `evorank-x2-ranks.js`, `strength-standards-x4.2.js` |
| Kraftalter | `age-ranking-x4.7.js` |
| Ausdauer/Rangmodelle | `triathlon-v9.7.js`, `endurance-ranking-x4.8.js` |
| Aufnahme | `endurance-tracker-x4.2.js` |
| Übungsfamilien | `exercise-families-x4.3.js` |
| Wochenplan/Audio/native Bridge | `calendar-plan-v10.0.js`, `evorank-x4.5.js` |
| Fortschrittsgrafiken | `progress-x5.1.js` |
| Konfigurierbare Startseite | `evorank-x5.1.js` |
| Sportgrafiken/Analysen | `sports-profile-x5.3.js` |
| Gemeinsamer Start, Onboarding, Muskel-Auswahl | `interface-x5.5.js` – in X5.7 weiterentwickelt |
| Rangmotive | `rank-art-x5.1.js`, 36 Einzelbilder in `ranks-x5.7/` |
| Abschließender UI-Stil | `evorank-x5.1-ui.css` lädt zuletzt |
| Einwilligungen | `cloud-consent-x4.9.js`, Account-Module |

`index.html` entscheidet über aktive Dateien und Reihenfolge. Vor Änderungen dort lesen. Nicht alte X3-Workoutüberschreibungen wieder aktivieren. Gemeinsam verwendete Rangarrays bleiben normale schreibbare Arrays: getter-only-Einträge verursachten den behobenen X5.1-Startabsturz.

## Datenerhalt

- Übungs-IDs, Konten, lokale Schlüssel, PWA `id`/`scope`/`start_url`, Domain und Lockfile erhalten.
- Aktuelles Profil bestimmt den heutigen Vergleichsrang. Das gespeicherte Körpergewicht und die gespeicherten Kabel-/Maschineneinstellungen bestimmen die damalige Leistung.
- Neuberechnung darf Workouthistorie, Lasten, XP oder verdiente Belohnungen nicht umschreiben.
- Übungsfamilien fassen nur die Auswahl zusammen. Bankdrücken 15°, 30°, 45° und Gerätevarianten behalten genaue IDs, Referenzen und Verläufe.
- Gelöschte Wochenpläne bleiben deaktiviert; Garmin-Plan `planDismissed` darf beim Import/Start nicht verschwinden. Nur ausdrückliche Neuerzeugung hebt das auf.
- Accountwechsel und verspätete asynchrone Ergebnisse müssen die Kontozugehörigkeit erneut prüfen.

## Kraft- und Muskelränge

1. Abgeschlossenen Arbeitssatz auswählen; Aufwärmen zählt nicht als Leistungsrekord.
2. Tatsächliche Last nach gespeicherter Kabelübersetzung/Maschinenkonfiguration normalisieren. Freie Dips: damaliges Körpergewicht plus Zusatzlast; unterstützte Dips: Hilfe abziehen.
3. Geschätztes 1RM und Übungsreferenz ergeben Basispunkte. Beispiel-Epley bei acht Wiederholungen: Last × (1 + 8/30). Nicht jede Maschine ist biomechanisch mit freier Last gleichzusetzen; Schätzgrenzen behalten.
4. Kraft-Altersmodell aus X4.7 anwenden, dann bestehende Begrenzungen und Muskelübertragung.
5. Muskelaggregation aktuell: bester Beitrag **70 %**, bis zu drei weitere zusammen **30 %**. Bei nur einem Beitrag zählt er vollständig. Nebenmuskeltransfer **58 %**. Historische X4.3-Gewichtungen sind überholt.

Der Kabelstandard ist sichtbar **unbestätigt 1:1**, solange kein konkretes Gerät konfiguriert ist. Keine universelle Technogym-Übersetzung erfinden. Fertige Sätze behalten ihren damaligen Faktor; keine doppelte Umrechnung.

Das wiederkehrende Beispiel +40 kg Dips × 8 bei 70 kg Körpergewicht wurde historisch mit 110 kg Gesamtmasse und ca. 139,33 kg Gesamt-1RM erläutert. Daraus folgt nicht automatisch derselbe Muskel-/Gym-Rang. Alter, Übungsart, Körperprofil und andere Beiträge zählen. Beispielwerte älterer Dokumente vor Anwendung auf neue Daten erneut durch den aktuellen Code berechnen.

Die Alterskurve verwendet übertragene Community-Referenzen, keine universell validierte Dips-Altersnorm. Geschätzte Geräte-/Übungsränge sind im vorhandenen Modell begrenzt. Geburtsdatum bestimmt das laufende Vergleichsalter; alte reine Altersangaben haben einen datierten Bezug.

## Ausdauer

- Getrennte sportartspezifische Alters-/Körperprofilkurven aus X4.8; nicht die Kraftkurve verwenden.
- Gemessene durchschnittliche Radleistung mit vollständigem damals gespeichertem Gewicht ab 20 Minuten ermöglicht W/kg. Das ist kein automatisch gemessener FTP-Wert. Fehlende/geschätzte Wattwerte nutzen den bestehenden Tempopfad.
- Keine erfundenen historischen Gewichte. Kein pauschaler Gewichtsbonus beim Laufen/Schwimmen. **Körpergröße bleibt nach bestätigter Nutzerentscheidung informativ**, kein Punktefaktor.
- Rangformeln und Schwellen sind App-Modelle, keine offiziellen Perzentile. Zeit/Strecke/Watt als Rohleistung anzeigen und nicht durch Alterskorrekturen überschreiben.
- Strava-Kalenderimporte bleiben von öffentlicher Leistungswertung ausgeschlossen; zukünftige Einheiten zählen nicht als heutige Leistung.
- Kompetenzfiguren zeigen Tempo, Langstrecke, Konstanz. Ohne Daten: sportartspezifischer Einsteigername und Holzfarbe, aber **kein verdienter Messwert** (`score/index=null`).

## Design, das der Nutzer ausdrücklich behalten will

- Nur Apple-inspirierte Gestaltung, eigene Akzentfarbe, hell/dunkel, reduzierte Bewegung/Transparenz respektieren. Keine zweite „neue“ Formensprache für Ergänzungen.
- Vorhandene Typography-, Surface-, Radius- und Button-Tokens benutzen. Helle Akzentfarben kräftig und lesbar halten.
- Körpergrafiken und Proportionen nicht neu gestalten. Weicher, etwas stärker grauer Hintergrund, kein grauer rechteckiger Kasten. Feine dunkle Muskelkonturen, nicht dick/unscharf.
- Weibliche Rückseite ist asymmetrisch; Latissimus nicht blind um die Bildmitte spiegeln. Männliche Unterarmtrefferflächen aus X5.6 erhalten.
- X5.7-Auswahl malt Muskeln mit 62 % RGB direkt dunkler, gleiche Rangfarbe. Keine türkise Ersatzfarbe, kein weißes Leuchten. Inkrementell aktualisieren, SVG/Scrollposition nicht bei jedem Tap ersetzen.
- Beschriftungen von Rad/Laufbahn/Schwimmbahn stehen außerhalb der Grafik und dürfen umbrechen. Rangnamen nicht abschneiden.
- Große Startkarten ohne Rangbadge, kleinere Schrift. Plus-Auswahl einheitliche Sportmotive. Abgeschlossene Sätze und vollständig fertige Übungen bleiben grün.
- Aktuelle 36 Badge-PNGs transparent, keine dunkle Kachel und keine Browser-Hintergrundmaske. Master und ältere Referenztafeln sind zur Weiterarbeit enthalten; Darstellung nicht auf die alten Atlas-Crops zurücksetzen.
- Kleine Marke: flaches ER; installiertes Home-Screen-Icon: metallisches D+H. Akzentwechsel verändert das installierte Icon nicht automatisch.

Freigegebene visuelle Kompetenzreferenz liegt zusätzlich in `design-master/referenzen/`. Sie ist ein Gestaltungsbeleg, kein Screenshot der vollständig implementierten App.
