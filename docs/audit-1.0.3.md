# PortifyCV 1.0.3 pre-release audit

**Date:** 2026-08-15
**Scope:** A fresh pass over everything shipped since `audit-1.0.2.md`
(2026-08-11) — the templates visual-polish backlog (`../todo.md` items
12-17), the feedback-engine extension (item 18), and six new features added
in the same session as this audit: ATS keyword match breakdown (19), a cover
letter generator (20), a reworked privacy-forward landing page (21), an
embeddable "made with PortifyCV" badge (22), an opt-in session-restore
feature (24), and per-template code-splitting (25). Item 23 (branch
protection) is a GitHub repository setting, not code, and is out of scope
here — handed to the project owner directly, not tracked as a finding.

Rather than re-auditing the core CV-building/export/share flow (already
covered by three prior audits and an adversarial pentest — see
[`audit-1.0.2.md`](audit-1.0.2.md) and
[`security-audit-1.0.md`](security-audit-1.0.md)), this pass targeted what's
actually new: the six features above, plus a full regression run (lint,
build, all three `check:*` scripts, and — for the first time this
session — the Playwright e2e suite) to confirm nothing broke along the way.

---

## How the audit was run

| Area | Method |
| --- | --- |
| Regression suite | `npm run lint`, `npm run build`, `check:reducers`, `check:share`, `check:feedback`, `test:e2e` — run as a baseline before looking for anything new |
| Mobile reachability | Read `src/styles/app-shell.css`'s breakpoints directly rather than fighting this environment's unreliable `resize_window` tool (see `chrome-resize-window-noop` in project memory) — confirmed `.app-shell__nav { display: none }` below 1024px, then checked every nav-rail-only action against whether the mobile bottom bar (`ResumeBuilderPage.jsx`, `lg:hidden`) has an equivalent entry point |
| New-feature security spot-check | Traced every new user-input surface (cover letter company/role/hiring-manager fields, badge modal) for injection risk; confirmed the only `dangerouslySetInnerHTML` added this session (`BadgeModal.jsx`) renders a fixed, app-authored string with no user-controlled interpolation |
| CI completeness | Diffed `.github/workflows/ci.yml`'s steps against `package.json`'s `check:*` scripts |
| Live verification | Real browser session (not just source reading) for each finding below |

---

## Findings

### 1. The cover letter generator had no mobile entry point

**Severity:** high — Cover letter (item 20) is the single largest feature
added this session, and it was completely unreachable below the 1024px
breakpoint where the nav rail (its only entry point) is `display: none`.
Templates, Export (PDF/HTML/JSON), and the share link all have their own
buttons in the mobile bottom action bar; Cover letter did not. A phone user
— plausibly a large share of this app's actual traffic, given the use case —
could not use it at all.

**Why the badge feature (added the same session) didn't have the same
problem:** it's reachable through the Template Gallery's "Get the badge" CTA,
and the gallery already has its own mobile bottom-bar entry point
("Templates"). Cover letter had no such secondary path.

**Fix:** added a fifth button ("Cover letter" / "Hakemuskirje") to the
mobile bottom action bar's existing horizontally-scrollable action row
(`ResumeBuilderPage.jsx`), alongside PDF/HTML/JSON/Link, opening the same
`CoverLetterModal` the desktop nav rail does.

**Verified:** confirmed via DOM query (not a screenshot — see the mobile
reachability method above) that the button renders inside the
`lg:hidden` mobile action bar container and that clicking it opens the
modal (`.modal-panel__title` reads "Hakemuskirje"). `e2e/responsive.spec.js`
(builder horizontal-overflow check) still passes — the row already scrolls
horizontally, so a fifth button doesn't introduce overflow.

---

### 2. `check:feedback` (item 18's regression script) was never wired into CI

**Severity:** medium — `npm run check:feedback` (16 checks covering the
weak-phrase/action-verb CV feedback rules) has existed since item 18 landed,
but `.github/workflows/ci.yml`'s `checks` job only ran `check:reducers` and
`check:share`. A regression in the feedback rules would pass CI silently.

**Fix:** added a `CV feedback regression checks` step running
`npm run check:feedback` to the `checks` job, alongside the other two.

**Verified:** ran the updated step locally; 16/16 pass.

---

## Findings considered and not changed

- **Settings modal now has 3 rows (was 2) with the new "Restore last
  session" toggle** — checked in a real browser, no layout crowding or
  overflow at the modal's existing width.
- **NavRail now has 14 items total** (10 scrollable sections + Settings,
  Templates, Cover letter, Export) — the rail already scrolls its own
  overflow (`max-height: calc(100dvh - 4rem); overflow-y: auto` at the
  desktop breakpoint), so this doesn't create a new problem, just a longer
  list.
- **Cover letter and badge input surfaces (company name, role, hiring
  manager name) render as plain React children, not `dangerouslySetInnerHTML`**
  — auto-escaped by React, no injection path. The one `dangerouslySetInnerHTML`
  added this session (`BadgeModal.jsx`'s live badge preview) interpolates
  only `locale` (a closed `'en' | 'fi'` value) and a hardcoded URL constant,
  never anything from `formData` or user input.
- **Session-restore's sessionStorage snapshot is parsed through
  `parseImportedCvData()`** — the same validator already adversarially
  tested against prototype pollution and malformed-JSON payloads in
  `security-audit-1.0.md`'s JSON-import finding — rather than trusted
  directly, so a corrupted or hand-edited snapshot fails closed into the
  normal blank/demo flow instead of crashing or executing anything.

---

## Verification results

- `npm run lint` — clean.
- `npm run build` — succeeds. `ResumeBuilderPage` chunk: 250.89 KB / 64.23 KB
  gzip (down from 365.96 KB / 79.57 KB gzip before item 25's per-template
  code-splitting, confirmed by direct before/after build comparison this
  session).
- `npm run check:reducers` — 23/23 pass (9 new this session: 4 cover-letter
  fields, 4 session-restore, 1 default-state check).
- `npm run check:share` — unchanged, all pass.
- `npm run check:feedback` — 16/16 pass, now actually gated in CI (finding 2).
- `npm run test:e2e` — 14/14 pass, zero regressions from this session's
  changes across `CVPreview.jsx`, `ResumeBuilderPage.jsx`,
  `TemplateGalleryModal.jsx`, `SettingsModal.jsx`, and the mobile action bar.

---

## Known limitations carried into 1.0.3

- **Zero e2e coverage for the six features added this session.** All got
  `check:reducers` unit-style coverage for their state transitions, and each
  was manually verified in a real browser during its own implementation
  (see `../todo.md` items 19-25), but none has a Playwright spec — unlike
  the core editor/export/landing/template/responsive flows, which do. Added
  as `../todo.md` item 26.
- **GitHub Pages deployments still have no `X-Frame-Options`/
  `X-Content-Type-Options` protection** — carried unchanged from
  `audit-1.0.2.md`; not fixable from this repo.
- **Production hosting header delivery still unverified** — carried
  unchanged from `security-audit-1.0.md`; no live deployment exists yet.
- **`portifycv.app` (the canonical domain referenced throughout the app —
  `SITE_ORIGIN`, the badge link, `sitemap.xml`, `robots.txt`, the privacy
  contact email) does not currently resolve.** Discovered this session while
  building the badge feature (item 22) — see project memory
  `portifycv-domain-not-live`. Not a code defect, but worth re-checking
  before treating any of the above as verified against a real deployment.

---

## Release readiness

**9/10.**

Two real findings this pass, both fixed and verified live rather than just
read as source — one of them (finding 1) a genuine "a whole feature is
unusable for a likely-large share of users" gap, not a cosmetic nit. The
full regression suite, including e2e for the first time this session, is
green with zero flakiness across the run.

The score sits slightly below `audit-1.0.2.md`'s held 9.5 for two reasons,
neither of which is a code defect:

1. **Every change across this entire session — item 12 through this
   document — is still uncommitted.** `git status` at the time of writing
   shows 15 modified files and 4 new untracked files, none staged. This is
   the same blocker `audit-1.0.2.md` flagged and it has only grown since:
   at some point this has to actually land as commits, or "ready to
   release" is a claim about code that only exists in a working tree.
2. **The new e2e-coverage gap above** is a real, if minor, regression in
   this project's own testing discipline compared to the core flows — worth
   closing before calling six new features release-ready in the same sense
   as everything audited before them.
