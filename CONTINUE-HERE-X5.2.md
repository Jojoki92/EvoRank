# EvoRank X5.2 / x5.2-r1

Next release: X5.3. X5.1 features and product rules remain; see CONTINUE-HERE-X5.1.md for their implementation context.

- Fixes a reproduced X5.1 startup crash: `installSeahorse()` writes to shared `RANKFORGE970.animals.swim[0][0]` during init. X5.1 had made this entry getter-only.
- Rank data remains ordinary writable arrays. `RANKFORGE970.rankBadge(sport,index)` requests artwork at render time and generates unique SVG IDs. Triathlon and both retained rank dashboards use it. Do not reintroduce getters on shared rank data. The asset generator follows the same rule.
- `tests/evorank-startup.test.mjs` runs the complete init chain, renders onboarding, persists a synthetic completed account, reloads scripts in a fresh document, restores local storage, and checks Home, history/rewards and all endurance rank screens. This reproduced the user's exact exception before the fix. Network/device APIs are stubbed and IndexedDB uses the repository's real localStorage fallback; this is not real-browser, cloud or phone validation.
- Release gate: `npm.cmd run test:x5`, `.\node_modules\.bin\vinext.cmd build`, `node scripts/smoke-release.mjs`, `npm.cmd run release:prepare`, `npm.cmd run release:save`.
- Destination: `FREED\x\x5\X5.2`, extracted WINDOWS and NETLIFY only. No new source copy, no publication. Preserve the user's existing browser origin and data. Old server instances must be closed before launching the new Windows starter.
