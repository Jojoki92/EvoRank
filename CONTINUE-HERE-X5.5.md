# EvoRank X5.5 / x5.5-r1

Continue in this checkout. Read AGENTS.md. Next delivered update: X5.6.

- Feedback: two WhatsApp screen recordings from 2026-09-16 and the supplied German spoken transcript. Recordings/QA stay in ignored `.sites-runtime` and are never packaged.
- X5.5 edits existing modules. `interface-x5.5.js` adds one shared training chooser, the optional first-profile introduction and incremental muscle selection. No duplicate app, IDs or stored workout/rank changes.
- Male hit paths use legacy 118px coordinates scaled about 8x. The former 34px transparent stroke overlapped unrelated muscles; final CSS limits it to 2px. Actual geometry/art is unchanged. `renderMuscleSelection` retains SVG nodes and updates selection classes/ARIA and small detail blocks, preserving scroll.
- All sports use the Plus chooser; Gym starts and endurance hero follow the figure before optional Home modules. Empty endurance components keep `score/index=null`, use the wood color and sport-specific beginner name, with an explicit no-measurements note. They remain unearned.
- Three old init paths no longer await remote profile/Garmin status. The account UI waits at most 1.5s for profile lookup and only starts nickname setup on confirmed absence. Identity updates check account ownership after awaiting. The service worker caches only public app files; navigation falls back to a previously saved page after 1.5s and never reloads automatically. No offline API cache.
- Tracker still runs only in foreground reliably. Poor GPS accuracy is explained. Only the current point is kept in memory; persisted drafts set `lastPoint:null`. Saved activity fields and age/sex/power comparison rules are preserved.
- `settings.introX55Pending` is set when a new profile finishes its existing questionnaire. Dismissal clears it. Existing profiles do not get forced through the tour; Profile → Daten & Hilfe can reopen it. No consent is granted by the tour.
- Legal review: `docs/EVORANK-X5.5-RECHTSCHECK.md`, also copied as Windows `RECHTSCHECK.md`. Address, host contracts/regions/retention, minor consent flow and artwork rights remain unresolved. No public deploy or legal certification.
- Use `npm.cmd run test:x5`, direct Windows Vinext build, smoke check, release:prepare then release:save. Deliver only Windows and Netlify extracted to FREED/x/x5/X5.5. Retain the X5.4 SQL setup unchanged as the current compatible database setup.
