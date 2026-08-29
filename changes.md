# Changes

Running log of notable work, newest first. Fuller reasoning and verification
notes for each item live in `todo.md`; per-commit detail is in git history.

## Builder usability pass — 2026-08-29 (v1.1.1 → v1.1.16)

From an interactive walkthrough of the running builder (`todo.md` items 39–54).
One commit per item; version bumped one patch per item. All checks green:
`lint`, `build`, `check:share`, `check:reducers`, `check:feedback`,
`test:e2e` (21/21). Branch `v1.1.0`, not pushed.

### High impact

- **v1.1.1 — Duplicate ATS-mode toggle removed.** The editor's disclosure
  showed two near-identical ATS toggles ~400px apart; dropped the standalone
  "Export mode" section. ATS mode is now in two clearly separate contexts (the
  ATS score panel + Settings), not three.
- **v1.1.2 — "Import & export mode" disclosure split.** It hid Quick Import,
  the whole ATS breakdown, JD keyword match, and Smart Suggestions under one
  mislabelled summary. Now two disclosures: **"Import CV"** and **"ATS score &
  suggestions"** (the latter keeps the score + suggestion count in its
  collapsed summary).
- **v1.1.3 — ATS keywords no longer include employer names.** `extractKeywords`
  tokenized every experience entry's company, so the demo CV was told it was
  "missing" the keywords `atlas`, `labs`, `north`, `studio`. Dropped `company`;
  titles and skills remain.
- **v1.1.4 — Cover-letter draft textarea fixed.** It carried `min-h-72` but no
  such utility rule existed, so it fell back to `rows=2`. Added
  `.min-h-72 { min-height: 18rem }`; the whole draft is visible on open.
- **v1.1.5 — "Reset form" is a two-step confirm.** First click arms it (label
  → "Confirm reset", button turns solid red); a second click within 4s clears
  the form, else it disarms. The post-reset toast points at the undo arrow.

### Medium

- **v1.1.6 — "Section NN" numbers dropped.** The 21 panels carried hardcoded
  `Section 00`…`Section 20` eyebrows; templates that hide sections left the
  visible ones non-contiguous ("06" then "13"), reading as missing sections.
- **v1.1.7 — Required-field errors deferred.** `Full name` / `Professional
  title` showed red "is required" on a blank form before any interaction; now
  gated on the field's `onBlur`. The `*` on the label still shows immediately.
- **v1.1.8 — Heading-colour control relabelled + presets.** Toolbar "Color" →
  **"Headings"** (it only ever coloured the name and section titles). The
  picker gained 6 one-click presets (Slate / Ink / Navy / Burgundy / Forest /
  Violet) above the existing wheel + hex field.
- **v1.1.9 — Links section collapsed to platforms in use.** Was 15 mostly-empty
  URL fields, each with a HIDE button. Now shows the 4 common platforms plus
  any field with a value; the rest sit behind "Show more platforms (N)". The
  per-field HIDE button only appears when the field has a value.
- **v1.1.10 — Section order/visibility rows rebuilt.** Each row was
  `[DRAG] [ABOUT: ON] [UP] [DOWN]` with the "toggle" being a button whose label
  doubled as its state. Now: drag handle, plain section name, ChevronUp/Down
  icon buttons, and a real `ToggleSwitch`. Photo row too. `ToggleSwitch` gained
  an `ariaLabel` prop.

### Polish

- **v1.1.11 — Font picker is a plain dropdown list.** Was a horizontal
  filmstrip with nav arrows showing ~3 at a time. Now a vertical list of all 7,
  each name set in its own face, active one checked.
- **v1.1.12 — Export menu items got hints.** PDF / HTML / JSON each carry a
  one-line description (e.g. JSON → "Backup you can import again later").
- **v1.1.13 — Settings → "Manage" expands its target.** It scrolled to the
  collapsed-by-default "Visible sections" panel and left it shut. `PanelSection`
  gained an `expandSignal` prop; `handleManageSections` bumps it.
- **v1.1.14 — Fullscreen zoom stepper no longer hidden.** The fixed
  "Exit fullscreen" button overlapped the zoom bar's +/- group; the bar now
  reserves right padding in fullscreen.
- **v1.1.15 — Editor scrolls to top on a template switch.** A switch can
  add/remove sections; the editor now jumps to the top so the change is
  visible. Instant scroll (smooth is no-op'd in the Chrome test setup).
- **v1.1.16 — "Responsive preview" → "Narrow preview".** The toggle shows the
  template squished, not the HTML export's real mobile layout; renamed with an
  honest tooltip. Feature kept.

### Tests

- Updated `e2e/editor.spec.js` (two-step reset needs a second click) and
  `e2e/responsive.spec.js` (font panel is now `role="listbox"`).
