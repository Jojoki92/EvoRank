# EvoRank – Gedächtnis für neue Claude-Code-Sitzungen

Lies zuerst diese Datei, dann @AGENTS.md und `CONTINUE-HERE-X5.7.md`.
Die X5.7-Übergabe liegt vollständig in `docs/uebergabe-x5.7/` (02 = offene Aufgaben).

## Nutzer

- Johannes Gumplmayr, Betreiber von EvoRank (evorank.fitness@gmail.com).
- **Technisch nicht versiert.** Immer auf Deutsch, einfach, kurz und knapp antworten,
  ohne Informationen wegzulassen. Fachbegriffe vermeiden oder kurz erklären.
- Wenn etwas nicht geht: plausible Lösungsvorschläge nennen.
- Ziel: Verbesserungen vorschlagen und die App hier Schritt für Schritt weiterentwickeln.
- Nutzt die App seit einer sehr frühen Version auf dem eigenen iPhone
  (Home-Screen-PWA über die bestehende Netlify-Seite). Daten/Origin nie gefährden.

## Stand

- Aktuelle App: **X6.0 / x6.0-r1**. Nächste Lieferung: **X6.1**.
- **Veröffentlichung auf Netlify war am 23.09.2026 blockiert:** Netzwerk-Regel der Umgebung sperrt
  `api.netlify.com` und `netlify-mcp.netlify.app`. Deploy-Weg: Netlify-Tool `deploy-site` (siteId s. unten)
  liefert einen `npx @netlify/mcp …`-Befehl; im Ordner des Netlify-Pakets ausführen. Johannes wurde gebeten,
  die Hosts freizugeben. Johannes hat das Veröffentlichen von X6.0 ausdrücklich gewünscht.
- Git: einziger Branch `claude/zealous-galileo-eb7l67` (Standardbranch des Repos).
  - `611d7f0` X5.7-Übergabe aus 9 ZIPs übernommen (alle 652 Dateien per SHA-256 geprüft).
  - Aufräumen (~39 MB), X5.8 (nur Version), X5.9 (siehe unten).
- X5.9 geliefert am 23.09.2026:
  - Gelöschte Standard-Workouts (Push/Pull/Leg Day …) kommen nicht mehr zurück.
  - Design immer „detailliert“ (Minimal-Schalter entfernt).
  - „Menschlicher“: Begrüßung mit Name/Datum, Großbuchstaben-Labels natürlich
    (`assets/interface-x5.9.js`), englische Begriffe eingedeutscht.
  - Supabase eingerichtet (siehe unten), Rechtstexte ergänzt (`docs/EVORANK-X5.9-RECHTSCHECK.md`).
- X6.0 (23.09.2026): Freunde ohne Links (`assets/friends-x6.0.js`: Vorschläge, Suche nach Name/@spitzname,
  Anfragen/Annehmen, Stand der Freunde), gegenseitige Anfrage = befreundet, Bestenliste „Mitmachen“ mit
  Bestätigung. Server: `db/SUPABASE-LIVE-X6.0.sql` (eingespielt). Test-Server: `tests/helpers/supabase-mock.mjs`
  (PGlite + Live-Schema `db/SUPABASE-LIVE-BASE.sql`), Zwei-Konten-Ablauf mit Playwright geprüft.
- Prüfung X5.9: `npm test` 140/140, Build ok, Smoke ok, Browser-Screenshots (Chromium,
  iPhone-Größe). Nicht geprüft: echtes iPhone.
- Browser-Test hier: `packaging/windows/EVORANK-NODE-SERVER.mjs` starten, Playwright
  (global) mit `executablePath /opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `cloud-config.js` per Route leeren → lokaler Modus; dann in der Seite
  `RANKFORGE_APP.state.onboardingComplete = true` setzen und `render()`.

## Frage „Konto gelöscht“ (23.09.2026)

- Laut Datenbank existiert Johannes' Hauptkonto weiterhin, inklusive Cloud-Sicherung.
  Personenbezogene Details werden hier absichtlich nicht gespeichert (Datenschutz);
  bei Bedarf erneut in Supabase nachsehen. Genaue Anzeige am Handy noch unklar → nachfragen.

## Offene Entscheidungen von Johannes

1. **Impressum-Anschrift** und Unternehmensstatus (größtes Rechtsrisiko), **Bildrechte**
   (Körpergrafiken, Rangbilder, Logos), Mindestalter technisch prüfen (nur in AGB).
2. **Einwilligungs-Tests** (Entfernen wurde von der Umgebung blockiert – nicht ohne
   ausdrückliche Zustimmung löschen): `evorank-v10.10-r1` „explicit consent“,
   `evorank-v10.11-r1` „loss-averse“, `tests/test-ui.mjs` Pflicht-Freigabe,
   `tests/test-bridge.mjs`. Vermutlich veraltet; Empfehlung: umschreiben statt löschen.
   Laufen nur in `npm run test:alle`.
3. **X6.0 (vorgeschlagen):** ~30 CSS- und ~45 JS-Schichten zusammenlegen → nur mit
   Handy-Prüfung durch Johannes.
4. Veröffentlichen auf Netlify: X6.0 freigegeben (blockiert durch Netzwerk, s. oben); spätere Versionen erst nach OK.
5. Supabase-Dashboard: „Leaked password protection“ einschalten (Tarif-abhängig).
6. Garmin/Strava: Anbieter-Freigabe und Netlify-Umgebungsvariablen fehlen.
7. Aus der Übergabe: Mac/Xcode für Dynamic Island, echte iPhone-/Cloud-Tests.

## Supabase (Konnektor verbunden)

- Projekt `wbujkhjoxepglsmtwqrf` (eu-west-1, Irland), dasselbe wie in `cloud-config.js`.
- **Echte Tabellennamen:** `rankforge_state`, `rf_profiles` (Schlüssel `id`), `rf_friendships`.
  Die alten Repo-SQL-Dateien nutzen `rankforge_profiles` → nicht direkt ausführen.
  Maßgeblich: `db/SUPABASE-LIVE-X5.9.sql` (getestet in `tests/supabase-live-x5.9.test.mjs`).
- Am 23.09.2026 eingespielt (Migrationen `evorank_x59_*`): Bestenlisten + Einwilligungen,
  Geburtstag (`rf_profiles.birth_date`), Strava-/Garmin-Tabellen, vollständige
  Kontolöschung (`rf_account_delete` löscht jetzt auch Profil, Freundschaften,
  Bestenlisten, Verbindungen und das Login), `rls_auto_enable()` nicht mehr öffentlich.
- Sicherungskopie im Schema `evorank_backup_20260923` (ohne API-Zugriff); `pg_cron`-Job
  `evorank-drop-backup-20260923` löscht sie am 23.10.2026 automatisch (so steht es
  auch in der Datenschutzerklärung).
- Verbleibende Hinweise (bewusst): Funktionen für angemeldete Nutzer (so gebaut),
  Tabellen ohne Policies = nur Server-Zugriff, `citext` in `public` (Verschieben riskant).
- Das Supabase-Werkzeug kann keine Dateien hochladen.

## Netlify (Konnektor verbunden, nur gelesen)

- Echte Seite: `clinquant-ganache-551532` (https://clinquant-ganache-551532.netlify.app),
  Site-ID 1f762076-35e8-4b7b-b7d9-988548f12db3, letzter Deploy 17.09.2026 (Drop-Upload,
  15 Funktionen, Funktionen in us-east-2). Zweite alte Seite `animated-lokum-5ac17c`
  (14.08.2026, ohne Funktionen).
- Diese Container-Umgebung darf `*.netlify.app` nicht direkt abrufen (Proxy 403).

## Lieferung (so will es Johannes)

Jede neue Version (X6.1, X6.2, …) als **Windows**- und **Netlify**-Ordner.

- Johannes' PC-Ziel (nur Doku): `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X<version>\`.
- **Google Drive** (verbunden): gleiche Struktur `EvoRank/FREED/x/x5/X<version>/`.
  - Ordner-IDs: `EvoRank` 10-hfnxncRLnX54LYD2NnvhJdKX9PCspl, `FREED` 131G7OSL2uTZmWIAdJ3619ucWy5Ff6Ahu,
    `x` 1hsM8icTw0JAz0q5yMmSfNxFfj8QZCPKJ, `x5` 1kmFAyLj6-x_D1gmqfwbODjikbpsZ_T9n,
    `X5.8` 1kQZTWvuwrj-DyysWaliGP1KShhnpl33u, `X5.9` 1EkqgzOHK-mX3OWjMbqwbtViDzaj0MDyK,
    `x6` 1a9KOFsyRXOj33ApvucDJ35asIme8svYn, `X6.0` 1dnPfG832GTQqeIdJh6YYNohv-11jUb5z.
  - **Grenze:** Das Drive-Werkzeug kann nur kleine Textdateien hochladen (Inhalt läuft durch
    den Chat). Bilder, `EVORANK.exe` und ganze Pakete (~19 MB je ZIP) gehen so nicht.
  - Deshalb: Version-Ordner + Anleitung in Drive anlegen, die zwei Pakete als ZIP
    (`EVORANK-X<v>-WINDOWS.zip`, `EVORANK-X<v>-NETLIFY.zip`) per SendUserFile im Chat
    schicken. Johannes lädt sie selbst in den Drive-Ordner.
- Pakete bauen in dieser Linux-Umgebung: `scripts/save-release.mjs` erwartet Windows-Pfade.
  Mit Kopie des Skripts und eigener Ziel-Config im Scratchpad ausführen (prepare, dann
  `--publish`), ZIPs daraus bauen und mit `unzip -t` prüfen. Skript im Repo nicht ändern.

## Arbeitsweise

- Version bei jeder echten Änderung hochzählen (siehe AGENTS.md): `version.txt`,
  alle `?build=x5.N-r1` in HTML/Manifest/Service Worker, `CACHE` im Service Worker,
  `evorank-x2-ui.js` (appVersion/EVORANK-Objekte), `scripts/build-legal-pages.mjs` +
  Rechtsseiten, `packaging/windows/*`, `package.json` displayName, Anleitung
  `EVORANK-X<v>-ANLEITUNG.md`, `docs/EVORANK-X<v>-RECHTSCHECK.md`.
  Ordnernamen wie `assets/ranks-x5.7/` bleiben.
- Vor jedem Commit: `npm test`, Build (`./node_modules/.bin/vinext build`),
  `node scripts/smoke-release.mjs`. Jede Datei im Service-Worker-`CORE` muss existieren.
- Nichts veröffentlichen, nichts kaufen, keine Secrets in Chat oder Repo.
