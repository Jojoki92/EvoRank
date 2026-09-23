# EvoRank X5.6 / x5.6-r1

Continue in this checkout, branch `codex/evorank-x5.6`. Next delivered update: X5.7.

- Read AGENTS.md. The user grants ongoing authorization for Git and the existing FREED release destinations. Use the sandbox review if required without asking an extra conversational question.
- X5.6 changes the existing X5.1/X5.3/X5.5 UI modules. No extra app or new framework dependency. Ranking models, IDs, workout records, account separation and rewards are unchanged.
- Sport-map labels are HTML buttons outside the existing SVG, two above and distance below. They use the existing `x53-area` handler and allow long names to wrap. Figures and supplied rank art are unchanged. Gallery badges use a dark presentation surface in both themes; all four sports share the same badge family for starts and chooser rows.
- Male forearm hit paths now follow alpha contours from the unchanged 1000×2048 masks, sampled every six rows, separately for front/back. Unlike the legacy paths, these use scale(1 1) and a 12px invisible stroke in native coordinates. Body art/proportions remain unchanged. The X5.5 incremental-selection path is retained.
- Muscle paint is opaque in light/dark mode; selection keeps the current rank hue and uses brightness(.72). Do not restore cyan selection, white mixing or bright selected outlines. Sport selections likewise darken their existing color.
- Profile fields stay in the original profile form with the same names and submit handler. Body data are first; other fields are in a details element. Birthdate hides/disables the legacy age field until cleared. The separate bodyweight card links to profile edit; it no longer edits immediately.
- Apple-touch and manifest icon URLs are versioned. PWA id/scope/start_url, icon bitmap and origin are unchanged. The installed icon remains metallic D+H; app accent color does not recolor it.
- Windows default: EVORANK-STARTEN.bat / EVORANK.exe, no Node required. Node fallback retained. PowerShell server accepts -NoBrowser for automated local verification. Keep UTF-8 BOM/CRLF compatibility for Windows PowerShell.
- Release gate: test:x5, direct Windows Vinext build, HTTP smoke, release:prepare, test prepared PowerShell server, release:save. New extracted Windows/Netlify folders under FREED/x/x5/X5.6. Current SQL setup remains X5.4.
- No deployment, private account access or real iPhone/GPS test is implied. Legal open items in docs/EVORANK-X5.5-RECHTSCHECK.md remain unresolved.
