# Swedish in the builder: what a fluent reader should check (1.7.14)

The Swedish was written without a native reviewer. Read it before any
`/sv/` content pages are released.

## Files to read

- Every `src/i18n/*/sv.js` (all builder and CV namespaces; the content
  pages have no Swedish).
- The `sv` labels in `src/utils/templateVariants.js`,
  `templateAccents.js`, `templateFields.js`, `cvHeadingColors.js` and
  `cvTemplates.js`.
- The Swedish phrase lists in `src/utils/cvFeedback.js` (duty phrases,
  weak openers, filler, `WHOLE_WORD_WEAK_PHRASES`).
- The Swedish skill-category patterns in
  `src/components/templates/shared.jsx`.

## Open wording points

- "Prestationer" for achievements, against "Meriter" or "Resultat".
- The techExec `footerQuote` typography (the closing mark, ”…”).
- "Teknologier" against "Teknik".
- The editor placeholders for the summary and the links.
- The letter mixes "du" and "ert team".
- Adjective-only template names: Modern professionell, Klassisk
  professionell, Marinblå professionell, Färgglad kompakt.
- Quadrant's "2x2" and "arbetslivserfarenhet".
- The European template's description lacks a subject.
- "Kolumn" against "spalt".
- The "Redan en" calque in the form and feedback empty texts.
- "Behöver arbete" (feedback status).
- The `atsPanel` title and the `saveCopyNew` wording.
- ASCII quotes are used throughout.
- The manager placeholder "Jane Doe".

## Known limits

- The paste parser, the PDF/Word import and the job-ad match read English
  and Finnish only, so a Swedish "Kompetenser:" line is not read.
- A pre-existing Finnish slip: the feedback `sectionBadge.tips.one` says
  "vinkkiä" and should be "vinkki". The Finnish paste placeholder
  "Taidot:" is not read by the parser either.
