# EvoRank X5.1 / x5.1-r1

Next release: X5.2. Authoritative source stays in this Git checkout.

- New scripts, loaded last: `progress-x5.1.js`, `rank-art-x5.1.js`, `evorank-x5.1.js`; CSS `evorank-x5.1-ui.css` last.
- Progress uses actual workout dates and completed non-warmup set snapshots. Cable/machine conversion uses EVORANK_X2_RANKS; estimated 1RM requires 1–12 reps and recorded bodyweight where needed. Volume means external resistance × reps, not total body mass moved.
- `settings.homeX51` stores sports, active sport, visible modules and up to six pins per account; no new storage key. `homeRanksV103` remains synchronized. The bodygraph is unchanged. Endurance-only Home and the central plus button open the selected sport recorder.
- Four original raster sheets from the supplied design handoff are in `assets/ranks-x5.1/`. Unique inline SVG masks and per-sport viewports show 36 badges. Do not replace the original motifs or change bodygraph colors. Names change; score IDs and numeric thresholds do not.
- `profile.heightCm` is informational by user confirmation: no height score factor. Profile editor also handles bodyweightKg, birthDate and the legacy dated age. No history, XP or reward rewriting.
- Apple is the only appearance; classic is migrated. Accent, light/dark and accessibility choices remain. Bottom navigation is rounded, floating and respects safe areas.
- License report: `public/rankforge/licenses/LIZENZANALYSE-X5.1.md`; machine-readable audit in `docs/EVORANK-X5.1-LICENSE-AUDIT.json`; original dependency notices ship in the app. Image and reference-table commercial rights remain unresolved. No license was assigned to the whole project.
- Local Git branch `codex/evorank-x5.1`; baseline commit `e8b6318`. No remote publishing. Generic local commit identity used only per command.
- Delivery changed at user's request: WINDOWS and NETLIFY only, no extra CODEX-PROJEKT copies. `release:prepare`, `release:save` retain grouped version folders and hash verification. X5.1 additionally gets one ZIP via `scripts/zip-release.ps1`; ZIPs stay opt-in.
- Run `npm.cmd run test:x5`, `npm.cmd run audit:x4.2` and `.\node_modules\.bin\vinext.cmd build`. New tests include dates, equipment snapshots, unilateral volume, profile saves, account persistence and badge indices. Device/browser visual QA and external accounts are not verified unless separately recorded.
- Verification: 94 tests, 91,912 catalog comparisons, Windows Vinext build and 178 local HTTP resources passed. See `docs/EVORANK-X5.1-VALIDIERUNG.md`. Netlify now permits same-origin geolocation, still subject to user permission.
