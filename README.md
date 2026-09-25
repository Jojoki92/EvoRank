# EvoRank X6.3

Vollständiger Projektstand X6.3 (`x6.3-r1`). Die App liegt in
`public/rankforge/`. Framework, Grafiken, Datenbankskripte, Integrationen und
Tests sind ebenfalls enthalten. Nächstes App-Update: X6.1.

Einstieg für neue Sitzungen: [CLAUDE.md](CLAUDE.md).

## Lokal starten

Node.js ab 22.13:

```
npm ci
npm test              # aktuelles Testgate (143 Tests)
npm run preview:app   # App unter http://127.0.0.1:8123/
```

Build: `npm run build` (Linux) oder `.\node_modules\.bin\vinext.cmd build` (Windows).
Die Vorschau führt keine Netlify-Serverfunktionen aus. Keine Website-Daten löschen.

## Im Code weiterarbeiten

| Bereich | Einstieg |
| --- | --- |
| App-Einstieg und geladene Dateien | `public/rankforge/index.html` |
| Aktuelle Rangberechnung | `public/rankforge/assets/evorank-x2-ranks.js` |
| Workout-, Profil- und Muskelansichten | `public/rankforge/assets/evorank-x2-ui.js` |
| Aktueller Workout-Stil | `public/rankforge/assets/evorank-x4.1-ui.css` |
| Grafiken und App-Symbole | `public/rankforge/assets/`, `icons/`, `splash/` |
| Konten, Garmin und Serverfunktionen | `public/rankforge/netlify/functions/` |
| Supabase-Datenbankskripte | `db/` |
| Framework und Hosting | `app/`, `worker/`, `vite.config.ts` |
| 129 aktuelle Prüfungen | Aktuelles Verhalten, Supabase-SQL und Strava-Serverlogik über `npm run test:x5` |
| Live-Tracking | `public/rankforge/assets/endurance-tracker-x4.2.js` |
| Aktuelle Ansichten | `public/rankforge/assets/evorank-x5.1-ui.css`, `interface-x5.5.js` |
| Vollständiger Katalog-Audit | `npm run audit:x4.2` |

Die Dateinamen mit X2 sind weiterhin Teil der aktuellen App.

- [Gedächtnis und Arbeitsweise](CLAUDE.md)
- [Projektregeln](AGENTS.md)
- [Übergabe X5.7](CONTINUE-HERE-X5.7.md) und [Übergabe-Dokumente](docs/uebergabe-x5.7/)
- [Anleitung X6.3](EVORANK-X6.3-ANLEITUNG.md)
- [Strava, Garmin und Freunde einrichten](docs/EVORANK-X4.5-VERBINDUNGEN.md)
- [Rangprüfung und Quellen](docs/EVORANK-X4.2-RANGPRUEFUNG.md)
- [Prüfbericht X5.7](docs/EVORANK-X5.7-VALIDIERUNG.md)

## Daten

Persönliche Trainingsdaten sind nicht im Quellcode. Sie bleiben im Browser-/App-Speicher
oder im Cloud-Konto. Adresse und Website-Daten nicht löschen. Supabase-/Garmin-/Strava-
Geheimnisse sind absichtlich nicht enthalten (Vorlage: `netlify.env.example`).
