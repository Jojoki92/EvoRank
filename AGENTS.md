# EvoRank project instructions

Current release: **X6.2 / x6.2-r1**. Read `CLAUDE.md`
and `CONTINUE-HERE-X5.7.md` before changing code. Next delivery: X6.3.
Communicate in German. The user prefers concrete completed app packages and a
short explanation. The complete source is authoritative; older release notes
are historical. Do not claim access to private phone workouts or prior chats.

## Source and delivery

- Main PWA: `public/rankforge/index.html` and its linked assets.
- Framework wrapper: `app/`, Vite/Vinext and the existing Sites build integration.
- Current ranking/workout logic still uses `assets/evorank-x2-ranks.js` and
  `assets/evorank-x2-ui.js` for compatibility. X4.1 restores the X2 workout layout via `rfx41-workout-exercise`;
  `assets/evorank-x5.1-ui.css` loads last; X4.4 completion styles remain active. Completed sets and fully completed exercises stay green. Exercise families affect only the picker, not saved exercise IDs or ranks. X3 workout overrides must stay inactive. Avoid adding another whole duplicate app.
  New features must reuse the existing typography, surface/radius tokens, icon set
  and `button` variants. No separate visual language for plans, alarm settings or
  connections. Keep light-mode accents as saturated as dark-mode accents, with
  readable text contrast. Bodygraph backdrops stay feathered, never rectangular.
- Preserve package manager, lockfile, all existing account/sync integrations,
  exercise IDs, local storage keys, PWA id/scope/start_url and deployment origin.
- Current profile determines current ranks; saved workout bodyweight and cable
  and machine settings determine effective load. Historical workout profile remains metadata.
  Recalculation must not rewrite workout history, XP or earned rewards.
- X4.7 strength ranks apply the documented age-points model after load normalization.
  Date of birth drives current age; legacy ages retain a dated reference.
  X4.8 endurance ranks use separate sport-specific age curves. Measured cycling watts
  use saved activity bodyweight for W/kg from 20 minutes; otherwise use pace. Do not
  invent past weights or apply an arbitrary weight bonus to running/swimming times.
  Preserve raw performance and disclose the estimation limits of both models.
- Deleted weekly plans stay disabled; deleted Garmin plans set `planDismissed`.
  Imports and startup must not undo deletion; explicit regeneration clears the flag.
- X5.1 uses Apple as the only appearance; existing classic choices migrate. Accent, light/dark and accessibility settings persist.
  Dragging belongs only on safe informational sheet handles, never unsaved forms or
  confirmations. Respect reduced motion/transparency and keep keyboard close controls.
- Cloud consent is optional at login and scoped to the authenticated user. The old
  global `accepted` flag must not authorize other accounts. Feedback only sends an
  explicitly entered reply email and bounded optional diagnostics.
- Confirmed operator: Johannes Gumplmayr, Austria, evorank.fitness@gmail.com.
  Public address is missing; never infer or publish it. App is free, IAP is planned
  but not implemented. Native/App Store readiness and image rights remain unverified.
- X5.9: the interface is always the detailed style (`uiStyle` = classic); the
  minimal/detailed switch is removed. `interface-x5.9.js` rewrites all-caps eyebrow
  labels into natural German (only when the app language is German). Deleted
  built-in routines stay deleted via existing sync tombstones.
- Live Supabase uses `rf_profiles`/`rf_friendships` (key `id`), not the older
  `rankforge_profiles` of the repository SQL. Use `db/SUPABASE-LIVE-X5.9.sql`.
- X6.0: the Friends tab is `assets/friends-x6.0.js` (account-based search/request/accept, no
  link invitations). Leaderboard participation needs an explicit "Mitmachen" confirmation.
  Local backend tests: `tests/helpers/supabase-mock.mjs`.
- X6.1: `assets/interface-x6.1.js` loads last: per-exercise set collapse, name/nickname
  first in the profile form (server nickname via `saveProfile`), "Daten wiederfinden" (device
  IndexedDB states + cloud backup, merge via `RANKFORGE_BRIDGE.mergeTrainingStates` after a backup),
  splash held until images decode, memoized `getMetrics` (fingerprint of workouts/profile/day).
  Legacy e-mail hashes map to the old local keys (johannes/stefan/felix) in `account-local-v10.7-r2.js`.
- X6.2: `assets/interface-x6.2.js` loads after X6.1: renders are suppressed during `init` and drawn once
  at the end (4 s guard); the service worker serves the cached shell immediately (refresh for next start).
  Workout header button = cancel (confirm), bottom = finish, no `.workout-danger`. Swipe a `.routine-row`
  to delete (existing `deleteRoutine`). Home layout: tap toggles, long-press drag reorders (user request,
  form-only until "Übernehmen"). Friends: no suggestions before a search term.
- Muscle aggregation: best contribution 70%, up to three supporting contributions
  together 30%; one contribution counts fully. Secondary transfer remains 58%.
- Cable defaults remain visibly unconfirmed 1:1 unless the user configures them.
  Do not assign a universal Technogym ratio without a verified model specification.
- Strava X4.5 imports feed the personal calendar only, never public performance
  ranks or friend snapshots. Secrets and provider tokens stay server-side.
- Native Swift changes are source-only until Xcode/device verification. Do not
  claim that a PWA can install WidgetKit or reliably ring under iOS suspension.
- Female back artwork is asymmetric. Latissimus overlays are independently
  traced. Do not mirror them around the 512-pixel viewport midpoint.
- Workout design follows the X2 screenshot: original dark surfaces and compact controls,
  one subtle light 1px outline per set. No bright zebra rows or thick white borders.
  Reordering belongs in the exercise header, never a detached Position row.
- Versioning requested by user: X4.1, X4.2, ... X4.9, then X5.0.
  Increment the decimal release for each delivered update; do not jump majors.
- Small in-app branding uses the flat white/magenta ER from design H; the
  installed home-screen icon remains the approved metallic D+H design.
- The user approved D + H (Obsidian + Aufstieg). X4 installs this design.
  Master: `docs/brand-x4/evorank-dh-master.png`; exports: `icons/evorank-x4-*`.
- No Google Stitch work is requested.

## Development

### User's release storage preference

- The user explicitly grants ongoing authorization for local Git saves and the
  existing release destinations. Do not ask an extra conversational confirmation
  for these steps. Required sandbox escalation still follows the environment's
  review mechanism; never bypass it. New destinations/actions require separate
  authorization when appropriate.

- Deliver every new release as extracted folders, not ZIP archives by default.
- Destination: `C:\Users\johan\OneDrive\Dokumente\EvoRank\FREED\x\x<major>\X<release>\`.
  For example X4.6 goes in `x4\X4.6`, X5.8 in `x5\X5.8`.
  Create both the major and release folder if missing; put both extracted
  artifacts inside the release folder. `groupByRelease` is mandatory.
- Keep a separate versioned Windows and Netlify folder there. The user no longer wants extra Codex source copies; source and history remain in the existing Git checkout.
  Never overwrite a different existing release or delete older versions.
- After tests and build, run `npm.cmd run release:prepare` to make a reviewable
  local snapshot, then `npm.cmd run release:save` to copy and hash-verify it in
  the user's FREED folder. Do not report a release saved until this succeeds.
  Windows contains only the current guide; historical developer docs stay in the
  Git checkout. The post-save hook removes only hash-verified staging duplicates.
  External filesystem permission may still be required by the environment;
  the user's request already authorizes this delivery destination and workflow.
- These paths and the extracted default are also in `packaging/release-targets.json`.
- Only if explicitly requested, place ZIP files in
  `C:\Users\johan\OneDrive\Dokumente\EvoRank\ZIP\x\x<major>\`.
- Tell the user the actual saved Windows folder and starter file. `delivery/`
  is now a preparation area, not the final user-facing release location.

Node >=22.13 is declared. Install missing dependencies with `npm ci` in ordinary
local Codex checkouts. When running within ChatGPT Work/Sites, follow its installed
Sites skill and required helpers instead. The historical framework build scripts
require Linux tools. The same Vinext build also passed directly on Windows via
`node_modules\.bin\vinext.cmd build`; this path does not need Linux/WSL.

Useful commands:

- `npm run test:x5` — includes real init/render/reopen regression coverage; keep startup in the release gate.
- `npm run audit:x4.2` — consistency audit of all 1,501 catalog entries.
- `npm run preview:app` — local static app for Windows/macOS/Linux; Node only.
  Use only when a preview is requested and allowed by the execution environment.
- `npm run build` — complete framework build under Linux/WSL.
- `node_modules\.bin\vinext.cmd build` — the same framework build on Windows.

Use relevant tests to resolve concrete risks. `npm test` runs the current X5 gate
(`test:x5`); `npm run test:alle` also runs the retained historical suites. Re-run the project build
after source changes. Record honest limits: no real-device, account or hosting
test should be claimed unless actually performed.

## Cleanup (after X5.7 handover)

Unused files were removed on the evidence of a reference scan from `index.html`,
legal pages, manifest, Netlify config and dynamic path templates: old v9.1.1 app
bundle and v1 account modules, superseded icons/splash sets, the unlinked
`designs-x3.html` gallery, public historical docs and root release notes.
Superseded X5.1 rank sheets are preserved in `design-master/ranks-x5.1-originale/`.
Full history remains in Git commit `611d7f0`. Keep `service-worker.js` CORE in
sync with existing files; a missing entry makes the install fail.

## Hosting

The retained `.openai/hosting.json` identifies the original Site, which returned
NOT_FOUND in the current environment. Do not create a replacement to hide that
failure. The user plans to update the existing Netlify site later. No publication
is requested merely by asking for code changes. Preserve the existing origin and
function configuration when preparing a Netlify package.

