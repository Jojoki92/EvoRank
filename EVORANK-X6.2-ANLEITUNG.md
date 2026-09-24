# EvoRank X6.2

## Windows starten

Ordner **EVORANK-X6.2-WINDOWS** öffnen und **EVORANK-STARTEN.bat** oder **EVORANK.exe** doppelklicken. Node.js ist nicht nötig. Das Serverfenster offen lassen, solange du die App nutzt. Eine alte EvoRank-Version vorher schließen. Danach im selben Browser `http://127.0.0.1:8123/` öffnen. Website-Daten nicht löschen.

## Was neu ist

- **Viel schnellerer Start:** Die App zeichnete sich beim Öffnen über 20-mal neu, jetzt nur einmal (Start etwa 3–4× schneller). Außerdem öffnet sie sofort die gespeicherte Version, statt bis zu 1,5 Sekunden auf das Internet zu warten. Updates kommen beim nächsten Öffnen.
- **Ladebildschirm:** kleineres Logo (lädt sofort), kein langes Warten mehr.
- **Tastatur:** Beim Tippen scheint nichts mehr (z. B. „Titan III“) zwischen Fenster und Tastatur durch.
- **Daten wiederfinden** liegt jetzt in **Profil → Daten & Hilfe**.
- **Pausentimer:** Der Startknopf ist eine ruhige Leiste ganz unten, nichts mehr darunter.
- **Workout:**
  - Oben heißt der Knopf jetzt **Abbrechen** (fragt nach, verwirft das Training). Unten bleibt **Training abschließen**. Der doppelte „Training abbrechen“-Knopf am Ende ist weg.
  - Einklappen sitzt oben in jeder Übung (z. B. „1/3 ▴“). Eingeklappt bleibt nur die Kopfzeile.
  - Übungsoptionen (z. B. Sitzendes Rudern) sind eine schlichte Liste; „Training abschließen“ liegt nicht mehr darüber.
  - Die laufende Pause ist eine schmale Leiste **über** der unteren Leiste, nicht mehr darauf.
- **Gespeicherte Workouts:** nach links oder rechts wischen → rot → gelöscht.
- **Startseite gestalten:** keine Pfeile und Schalter mehr. Antippen = ein/aus (Häkchen). Halten und ziehen = verschieben.
- **Freunde:** Es werden keine fremden Nutzer mehr vorgeschlagen. Du suchst gezielt nach Name oder @spitzname.

Aus X6.1:

- Name und Spitzname oben in *Profil bearbeiten*, Speichern ohne Körpergewicht, altes Gmail-Konto öffnet wieder deine Daten, Freunde mit Muskel-Körper, Frauen-Figur untrainiert = Holz, Ranks-Reiter in einer Zeile.

Aus X6.0:

- Freunde ohne Links (suchen, anfragen, annehmen), Bestenlisten mit **Mitmachen**.

Aus X5.9:

- **Workouts löschen:** Auch mitgelieferte Workouts wie Push Day, Pull Day oder Leg Day bleiben gelöscht. Früher kamen sie nach dem Neustart zurück. So geht's: **Profil → Gespeicherte Workouts** → Stift-Symbol beim Workout → ganz unten **Workout löschen**.
- **Immer detailliert:** Die Auswahl „Minimal / Detailreich“ ist weg. Die App nutzt immer die detaillierte Darstellung.
- **Natürlicher:** Begrüßung mit Name und Datum statt „Bereit für das nächste Level?“. Kleine Überschriften in normaler Schreibweise statt GROSSBUCHSTABEN. Einige englische Begriffe auf Deutsch.
- **Konto löschen** löscht jetzt wirklich alles in der Cloud (vorher blieben Profil und Freundschaften).
- **Server eingerichtet:** Bestenlisten, Geburtstagsbonus, Garmin- und Strava-Speicher. Garmin und Strava brauchen zusätzlich die Freigabe der Anbieter.
- **Rechtstexte ergänzt:** Gesundheitshinweis, Mindestalter 14, Haftung, Server-Standorte, vollständige Löschung.

## Website und iPhone aktualisieren

Der Ordner **EVORANK-X6.2-NETLIFY** ist die Website für deine bestehende Netlify-Seite. Nach dem Hochladen dieselbe Adresse öffnen und im Profil prüfen, ob **X6.2** angezeigt wird. Keine Website-Daten löschen.

Ab X6.2 gilt: Nach einem Update die App **einmal öffnen, schließen und nochmal öffnen** – beim ersten Öffnen lädt sie das Update im Hintergrund, beim zweiten ist es da. Dafür startet sie jedes Mal sofort.

## Geprüft

156 automatische Tests bestanden, Build erfolgreich, alle Dateien der App erreichbar. Im Browser (iPhone-Größe) geprüft: Start, Workout mit Pause, Einklappen, Übungsoptionen, Abbrechen, Wischen zum Löschen, Startseite ordnen, Freunde mit zwei Testkonten. Nicht geprüft: echtes iPhone.

## Rechtliches

**RECHTSCHECK.md** nennt, was noch fehlt: vor allem die Anschrift im Impressum. Kontakt: evorank.fitness@gmail.com.
