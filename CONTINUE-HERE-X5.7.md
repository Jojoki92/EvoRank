# EvoRank X5.7 / x5.7-r1

Current branch: codex/evorank-x5.7. Next delivery: X5.8.

- Read AGENTS.md. Save extracted Windows and Netlify packages under FREED/x/x5/X5.7 after the current release gate. No deployment is implied.
- X5.7 updates the existing interface-x5.5.js and final evorank-x5.1-ui.css. Muscle selection sets the actual SVG fill to 62% of all RGB channels; no filter is needed. Deselect restores the rank hue. Retain the incremental update and the existing body art and hit targets.
- Mobile sheets reserve the status-bar safe area. Navigation is 76px tall and counts the bottom inset once, with the Plus centered in the bar. Completed workout styles remain unchanged.
- Large workout/sport start cards no longer have badges. The Plus chooser retains the four custom sport badges. The redundant bodyweight-card is removed; body data are still editable through the existing profile form.
- rank-art-x5.1.js uses 36 transparent individual PNG exports in assets/ranks-x5.7. Generated source masters remain in the Codex generated_images folder. Export manifest: docs/EVORANK-X5.7-ICON-EXPORT.json. Original supplied sheets remain preserved; no body artwork was regenerated. Do not reintroduce browser luminance cutout masks or black gallery tiles.
- Cloud bridge and account UI fail closed if the account-scoped consent module is unavailable. The UI verifies the stored choice before saying it is activated. No legacy global accepted flag may authorize uploads.
- Legal pages have clearer media disclosure and data/age limitations. docs/EVORANK-X5.7-RECHTSCHECK.md records unresolved operator address, business status, rights, minors policy, production contracts/configuration. This release is NOT legal or App Store clearance. Do not invent these facts or publish a private address.
- Ranking models, saved history/weights/cable settings, rewards, PWA identity, account/storage keys and deployment origin remain unchanged.
- Run test:x5, Windows Vinext build, HTTP smoke, prepare, staged PowerShell test and hash-verified save. Browser checks include Edge and Windows WebKit; these are not a real iPhone/production account test.
