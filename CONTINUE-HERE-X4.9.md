# EvoRank X4.9 · Apple-inspirierte Bedienung und bereinigte Pakete

Aktuell **X4.9 / x4.9-r1**, nächste Lieferung **X5.0**.

- `assets/apple-interface-x4.9.js`: wählbare Material-/Systemschrift-Darstellung,
  kritische Feder, Pointer-Gesten nur am Griff geeigneter Informationsdialoge,
  Tastatur- und Kontrastverbesserungen. `settings.interfaceX49` speichert die Wahl.
- `assets/evorank-x4.9-ui.css` lädt zuletzt. Bestehende Körpergrafik, Farben,
  grünen Abschlüsse, Geräte-/Altersränge und Daten bleiben erhalten.
- `assets/cloud-consent-x4.9.js` lädt vor Kontobrücke/UI. Der bestehende Consent-Key
  enthält nun Version 2 mit Entscheidungen je Auth-User-ID. Ein alter globaler
  `accepted`-Wert reicht nicht mehr für andere Konten. Auth-/lokale Kontozuordnung
  muss stimmen; Widerruf hat Vorrang vor alten Profilflags.
- Konto-Anmeldung/Registrierung darf ohne Cloud-Zustimmung gelingen. Gewählte
  Freigabe erst nach erfolgreicher Authentifizierung dem angemeldeten Konto geben.
- Feedback übermittelt keine automatische Account-E-Mail/Profilnamen mehr;
  Antwortadresse und begrenzte technische Zähler optional. Auch alte Warteschlange
  vor Versand minimieren. Bestehender expliziter Versand-Opt-in bleibt erforderlich.
- `scripts/build-legal-pages.mjs`, `packaging/legal-operator.json`: acht einheitliche
  rechtliche/Hilfe-Seiten. Adresse noch leer; keine öffentliche Rechtsfreigabe behaupten.
- `scripts/audit-x4.9.mjs`: aktive Ressourcen-/Tracker- und Bildinventur. Keine
  Browserprüfung, Lizenzfreigabe oder Prüfung produktiver Konten daraus ableiten.
- `scripts/save-release.mjs`: Windows erhält nur aktuelle Anleitung.
  `scripts/cleanup-delivery.ps1` entfernt ausschließlich identisch nachgewiesene
  Vorbereitungskopien und explizit angefragte doppelte X4.8-Windows-Dokumente.
  Post-Save-Bereinigung erhält Quellpakete und ältere Releases.

83 Tests: `npm.cmd run test:x4`. Build unter Windows:
`.\node_modules\.bin\vinext.cmd build`.
Danach `npm.cmd run release:prepare` und `npm.cmd run release:save`.
Entpacktes Ziel: `FREED\x\x4\X4.9\` mit Windows, Netlify und Codex-Quellpaket.
Details/Quellen/offene Punkte: `docs/EVORANK-X4.9-DESIGN-UND-PRUEFUNG.md`.
Keine Veröffentlichung, Live-Konto- oder iPhone-Prüfung durchgeführt.
