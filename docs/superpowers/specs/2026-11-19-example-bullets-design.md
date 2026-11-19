# Example bullets ("Get ideas") — design

Approved 2026-11-19. Ships as 1.7.8 on `v1.7.0`.

## Intent

Competing builders sell phrase libraries (Kickresume: 20,000+ phrases;
Resume.io: click-to-add phrases). PortifyCV can offer the same help without
AI or a server: its 26 example CVs already hold 127 achievement bullets in
English and the same 127 in Finnish (52 jobs), each written to pass the
bullet hints (`check:feedback` enforces it). Let a person add one of them to
a job with one click, then make it their own.

## Goals

- Ideas under each job's achievements, in Classic (`ReorderableListInput`
  for `achievements`) and in Direct Edit's popup list
  (`SectionEditorPopup`, field `achievements`).
- The role closest to the job first; every role reachable from a picker.
- Ideas in the CV's language (`resolveCvLocale`, 1.7.5).
- Never let someone send another person's numbers by accident.

## Non-goals

- Ideas for the summary, skills or other sections.
- A user's own saved bullets.
- New example content (that comes with the role example pages).
- AI rewriting.

## Anti-goals

- An inserted bullet that reads as finished while carrying a stranger's
  facts.
- Loading the example CVs for people who never open the panel.

## Approaches

1. **Read the example CV modules when the panel opens (chosen).** The
   examples are already lazy modules (`EXAMPLES[id].load()` in
   `exampleCvs.js`); the panel imports them on first open and caches the
   result. One source of truth; no duplication.
2. Generate a bullet index at build time. Faster first open, but a second
   copy of the content that must be regenerated and checked whenever an
   example changes.
3. Hard-code a separate phrase list. Duplicates content and loses the
   check that every bullet passes the hints.

## Decisions (approved)

- **Numbers become blanks.** Amounts, percentages, ratings ("4.6/5"),
  counts ("25+"), money ("€1.2M") and years in a bullet become `[__]`; the
  words around them stay ("from [__] minutes to [__] minutes").
- **Add** appends the bullet to that job's achievements (undoable like any
  edit). Ideas already in that job are not offered again.
- **Matching:** word overlap between the job's role (or, if empty, the CV's
  title) and the 52 example job titles plus the 26 role names; best role
  first, the rest in the picker.
- **Unfilled blanks are flagged:** a new bullet hint ("Fill in the blank:
  [__] is still in this bullet.", Finnish too) and, on export, a warning
  toast naming how many bullets still hold `[__]`, like the hidden-section
  warning. Nothing is blocked.

## Shape

- `src/utils/bulletIdeas.js`: `blankNumbers(text)`,
  `rankIdeaRoles(roleText, roles)`, `loadBulletIdeas(locale)` (lazy, cached)
  returning `{ roleId, roleLabel, jobRole, bullets }` per example job.
  Cases in a check script (blanking, matching, both languages).
- One shared panel component (`fields/BulletIdeas.jsx`) used by both modes.
- `getBulletHints` gains a `blank` rule; the export path counts `[__]`.

## Left to the builder

Exact copy, panel styling, how many ideas show before "more", keyboard
order.
