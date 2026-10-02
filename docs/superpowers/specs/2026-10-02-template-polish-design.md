# Template polish — design (v1.5, Phase 2)

**Date:** 2026-10-02
**Branch:** `v1.5.0`, stacked on `v1.4.0` (rebase onto `main` once the 1.4.0 PR merges)
**Status:** draft, awaiting review

## Goal

Make all 18 templates hold up against realistic content, and keep them that
way. Phase 1 gave us 24 example people (49 template × example pairs) plus a
page that renders any of them in any of their templates. Phase 2 turns that
into a measurable audit. It fixes every layout defect the audit finds, and it
leaves the audit running in CI as a regression net.

"Holds up" means the rules already written in `docs/template-design-system.md`:
the §2 type ramp, the §7 content edge-case checklist and the §8 export-safety
checklist, scored with the §9 rubric. Phase 2 enforces that document. It does
not rewrite it. If a rule turns out to be wrong, amend the document
explicitly, in the same commit as the change that needed it.

## Decisions (made 2026-10-02)

- **Branch:** `v1.5.0` off `v1.4.0`. Version bumps are 1.4.1, 1.4.2, … per
  unit of work, with 1.5.0 at the end. It gets its own PR after 1.4.0 merges.
- **Regression net:** deterministic layout assertions, not screenshot diffs.
- **Length budget:** a typical example CV renders in at most 2 A4 pages.
- **Export:** a PDF smoke test per template. Word export is already covered
  by `check:docx-export`.

## Non-goals

- New templates, colour/font variants (Phase 3), gallery filters and tags
  (Phase 4).
- Redesigning a template's identity. When the audit finds a structural
  problem that needs a redesign rather than a fix, log it in the audit doc
  as a follow-up and don't do it here.
- Pixel-level visual regression (screenshot baselines).
- Changing example content to dodge a layout bug. Examples change only when
  the content itself is wrong.

## Known inputs

From `todo.md` → "Phase 2 inputs (from template-page examples)":

1. Sidebar link values are ellipsis-truncated in Modern Professional,
   Portfolio Hybrid, Executive and Tech Executive.
2. Navy Professional: a long name wraps to 4 lines in the narrow sidebar
   header. That violates §7.1, which allows at most 2.
3. Long previews: Portfolio Hybrid 2.25–2.6 A4 pages (over budget);
   Developer 1.99 and Graduate 1.81 (within budget, watch).
4. Modern Orange clips long skill names with an ellipsis.

The audit will find more. These four are the floor, not the scope.

## The layout harness (audit and regression net)

One Playwright spec, `e2e/template-layout.spec.js`, plus a helper module
`e2e/helpers/layoutAudit.js`. Like the rest of the suite, it runs against
the production build.

### What it renders

1. **Example tier (49 pairs).** For every template and each of its examples,
   open `/free-cv-templates/<slug>?example=<id>`, wait for the example's own
   name to appear in `.template-page__preview` (not the loading placeholder),
   and audit `.scaled-preview__page`. Repeat with the page's ATS view toggle
   on. English only: layout behaviour doesn't depend on locale, and Finnish
   rendering is already covered by the template-pages spec.
2. **Stress tier (3 fixtures × 18 templates).** Three synthetic CVs in
   `e2e/fixtures/stressCvs.js` cover §7 items the examples don't:
   - `long-single-word`: name "Kristiansen-Vandenberghe Oyelaran-Lindqvist",
     a 60-character skill string, and a URL-heavy links block.
   - `ten-jobs`: ten experience entries with 3 achievements each (§7.4).
   - `sparse`: name, title, one job and nothing else; every optional section
     empty (§7.3, §7.5).

   Each loads into the builder through a share link built with
   `buildShareUrl` (`src/utils/shareLinks.js`), using
   `/cv?template=<id>#data=…`. The audit then runs on the builder's
   read-only preview. Before this tier is written, the plan step must confirm
   which element that is: the Direct Edit read-only copy or Classic mode's
   preview. The length budget does not apply to `ten-jobs`.

### What it asserts

A function `auditLayout(page, rootSelector, options)` returns a list of
violations. The test fails with that list, so a single run reads as the
audit report. Rules:

| Rule | Check | Design-system ref |
|---|---|---|
| `clipped-text` | a text-bearing element whose `scrollWidth > clientWidth + 1` and whose computed `overflow`/`overflow-x` is `hidden` or `text-overflow` is `ellipsis` | §7.6, Phase 2 inputs 1 and 4 |
| `beyond-page` | any rendered element whose right edge passes the page's right edge by more than 2px (in unscaled px) | §7.6 |
| `placeholder` | the page text matches the en/fi "… will appear here" placeholder phrasings | §7.5 |
| `name-lines` | the name element (located through a `data-cv-name` attribute; see below) renders on more than 2 lines | §7.1 |
| `mid-word-break` | the name or any entry title breaks inside a word; detected by comparing rendered line boxes (Range client rects) with word boundaries | §7.1 |
| `length` | page height / (page width × 1.414) > 2.0 (example tier only) | Decision: ≤ 2 A4 pages |

**Decorative elements** (gradient blobs, accent bars) are excluded by an
explicit `data-decorative` attribute on those elements in the Showcase
markup, not by a class-name regex.

**Locating the name.** Every Showcase gets `data-cv-name` on its name
element. That is a small markup change per template, and it makes the
`name-lines` rule exact.

**Thresholds** live in one exported object in the helper: max name lines,
max pages, pixel tolerances. No numbers are scattered through the spec.

### Known-failure handling during the fix pass

While the audit is red, the spec reads `e2e/fixtures/layoutAllowlist.js`,
a list of `{ template, example|fixture, rule, reason }` entries, so that CI
stays green between fix tasks. The fix pass empties it. The final state is
an empty allowlist. Any entry that remains needs a written justification in
the audit doc, and the PR description must call it out.

## The audit doc

`docs/template-audit-phase2.md` is written right after the harness first
runs. It contains:

- the harness output as a table: template × rule → count of failing pairs;
- a re-scored §9 rubric per template, using the same 7 axes and 0–3 scale as
  `template-audit-a2.md`, scored from harness evidence plus the PDF smoke
  test;
- a fix list grouped by root cause, each item naming the templates it
  touches;
- follow-ups that are out of scope (redesign-level problems).

The doc is updated at the end of the work with the final scores.

## The fix pass

Fixes are grouped by **root cause**, not by template, so one cause is fixed
once in one place. A shared primitive (§6) is preferred over 18 copies.
Expected groups, to be confirmed by the audit:

- **Long unbreakable values** (links, emails, long skills). Allow wrapping
  where the value has no spaces (`overflow-wrap: anywhere` on URL/email
  values only), and don't truncate. This covers Phase 2 inputs 1 and 4.
- **Name in narrow columns.** When the name sits in a column narrower than a
  stated floor, step down the §2 ramp (`--tpl-name-size` from the template's
  density class to the next one down) instead of setting an ad-hoc size.
  This covers Phase 2 input 2 and the `long-single-word` fixture.
- **Density.** A template whose examples exceed 2 A4 pages moves to the next
  denser class in §2, or reduces its own entry/section spacing, whichever
  the audit shows is the cause. This covers Phase 2 input 3.
- **Sparse layouts.** Collapse empty rails and dividers (§7.5).
- **Whatever else the harness reports.**

Every fix keeps the template's identity (§5 family, §3 colour rule, §4
heading treatment). Each fix task removes its entries from the allowlist,
and the harness proves the fix.

## PDF smoke test

`e2e/template-pdf.spec.js` runs once per template, using its first example,
through the builder's real Export → PDF path:

- the download arrives within a timeout (there must be no hang; see the
  clip-path hang in the template work log);
- the PDF's page count (counted from the file's `/Type /Page` objects)
  equals the preview's A4 page estimate, rounded up, ±1;
- the file size is above a floor, so a blank render fails.

The export is image-based (html2canvas), so a test can't read text from
it. §7.8 is satisfied by a manual step in the plan: render each template's
PDF page 1 to an image and look at it (name visible, nothing clipped). The
step's result is recorded in the audit doc.

## Testing summary

- `e2e/template-layout.spec.js`: 49 example pairs × {normal, ATS} plus
  54 stress renders, all rules, with an empty allowlist at the end.
- `e2e/template-pdf.spec.js`: 18 exports.
- The existing suite stays green. In particular, `templates.spec.js`
  (accent swatches, name alignment, link formatting, Colorful Compact
  contrast).
- Runtime: the new specs must not more than double `npm run test:e2e`
  (currently about 1 minute). If they do, the stress tier and the PDF spec
  move behind a `@slow` tag that CI still runs, in a second job.

## Risks

- **Flaky geometry.** Fonts must be loaded before measuring (wait for
  network idle, then `document.fonts.ready`, per the existing
  font-load-timing lesson). Tolerances live in the thresholds object, not
  inline.
- **The fix cascade.** Changing a density class moves every example on that
  template, so the harness re-runs all pairs after every fix.
- **Export differs from preview.** The PDF smoke test plus the manual image
  check catch this. Known html2canvas hazards are in §8.
