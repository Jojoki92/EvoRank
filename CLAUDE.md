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

- Aktuelle App: **X5.8 / x5.8-r1**. Nächste Lieferung: **X5.9**.
- Git: einziger Branch `claude/zealous-galileo-eb7l67` (Standardbranch des Repos).
  - `611d7f0` X5.7-Übergabe aus 9 ZIPs übernommen (alle 652 Dateien per SHA-256 geprüft).
  - Aufräum-Commit: ~39 MB ungenutzte Dateien entfernt (siehe AGENTS.md → Cleanup).
  - X5.8: Versionsnummer, Anleitung, Rechtscheck-Datei umbenannt, README/CLAUDE.md.
- Prüfung X5.8: `npm test` 129/129, Vinext-Build ok, Smoke 194 Ressourcen,
  Windows-Paket per Node-Server getestet (zeigt X5.8). PowerShell-Server hier nicht testbar.
- Nicht geprüft: echtes iPhone, echtes Konto, echte Netlify-/Supabase-Umgebung.

## Offene Entscheidungen von Johannes

1. **Einwilligungs-Tests** (Sicherheits-/Datenschutztests, Entfernen wurde von der
   Umgebung blockiert – nicht ohne ausdrückliche Zustimmung löschen):
   - `tests/evorank-v10.10-r1.test.mjs` „keeps cloud and leaderboard publishing off until explicit consent“
   - `tests/evorank-v10.11-r1.test.mjs` „cloud reconciliation is automatic, non-blocking and loss-averse“
   - `tests/test-ui.mjs` Prüfung „Cloud-Sicherung verlangt eine ausdrückliche Freigabe“
   - `tests/test-bridge.mjs` (5 von 10 Prüfungen scheitern)
   Vermutlich veraltet (Einwilligung liegt seit X4.9 in `cloud-consent-x4.9.js` und ist beim
   Login optional). Empfehlung: auf die aktuelle Logik umschreiben statt löschen.
   Diese laufen nur in `npm run test:alle`, nicht im Gate `npm test`.
2. **Nächster Schritt X5.9 (vorgeschlagen):** ~30 CSS- und ~45 JS-Schichten in
   `index.html` überschreiben sich gegenseitig. Zusammenlegen ist möglich, kann aber
   die Optik auf dem iPhone verändern → nur mit Handy-Prüfung durch Johannes.
3. Konnektoren **Netlify** und **Supabase**: Johannes verbindet sie unter
   https://claude.ai/customize/connectors und startet dann eine neue Sitzung.
   Vor jeder Veröffentlichung oder Datenbankänderung ausdrücklich fragen. Vorher Backup.
4. Aus der Übergabe weiterhin offen: Betreiberanschrift/Unternehmensstatus, Bildrechte,
   Mindestalter, Mac/Xcode für Dynamic Island, echte iPhone-/Cloud-Tests.

## Lieferung (so will es Johannes)

Jede neue Version (X5.9, X6.0, …) als **Windows**- und **Netlify**-Ordner.

- Johannes' PC-Ziel (nur Doku): `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x5\X<version>\`.
- **Google Drive** (verbunden): gleiche Struktur `EvoRank/FREED/x/x5/X<version>/`.
  - Ordner-IDs: `EvoRank` 10-hfnxncRLnX54LYD2NnvhJdKX9PCspl, `FREED` 131G7OSL2uTZmWIAdJ3619ucWy5Ff6Ahu,
    `x` 1hsM8icTw0JAz0q5yMmSfNxFfj8QZCPKJ, `x5` 1kmFAyLj6-x_D1gmqfwbODjikbpsZ_T9n,
    `X5.8` 1kQZTWvuwrj-DyysWaliGP1KShhnpl33u.
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
