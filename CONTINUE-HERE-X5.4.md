# EvoRank X5.4 / x5.4-r1

Continue in this source checkout. Next delivered release: X5.5. Read AGENTS.md; all retained identity, history, ranking, style and delivery rules apply.

- Feedback from synchronized video/audio 2026-09-15. No new image generation: approved figures and bodygraphs are unchanged.
- `evorank-x5.1.js` forces the two core Home modules visible and normalizes `settings.homeX51.moduleOrder`. Reorder edits form DOM only; save on submit, cancel discards. Additional sections follow the figure. Existing saved sports/pins stay intact.
- `sports-profile-x5.3.js` retains its compatibility filename. Endurance Home no longer suppresses the common heading. Analysis adds actual monthly/lifetime/weekly statistics. `analysisReport` uses local calendar periods and existing eligible sport lists, excluding future records. Gym history folds and muscle balance keeps all groups behind details.
- `EVORANK109.renderLeaderboard` reuses the existing authenticated API for the new endurance rank views. Public consent remains optional, account-specific and server-required. Public rankings are self-reported, not verified competitions.
- `scripts/prepare-leaderboards-x5.4.mjs` builds one atomic setup from the historical table definition and production functions. Its output is `db/SUPABASE-BESTENLISTEN-X5.4.sql` and the matching Windows setup file. Existing profile setup is a precondition. Garmin table is optional for manual publication; claimed Garmin data still needs a server record. An existing moderation rejection cannot be cleared by client republishing.
- `@electric-sql/pglite` is development-only (Apache-2.0 metadata), used for real local PostgreSQL regression tests. No database engine ships in the PWA. Supabase itself has not been modified or tested here.
- `npm.cmd run test:x5`, direct Windows Vinext build, `node scripts/smoke-release.mjs`, then `npm.cmd run release:prepare` and `npm.cmd run release:save`. Prepare regenerates the SQL setup folder before staging. Deliver two extracted folders under FREED/x/x5/X5.4. No ZIP or duplicate source copy.
- Temporary private media, transcription and visual QA remain under ignored `.sites-runtime`; never package or commit them. Public notes describe changes only.
