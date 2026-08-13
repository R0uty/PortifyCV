# PortifyCV 1.0.2 pre-release audit

**Date:** 2026-08-11
**Scope:** A fresh audit pass over the state left by `audit-1.0.1.md`, using
the same interactive-plus-static methodology as both prior audits, extended
this time with the new `e2e/` suite as an actual verification tool rather
than just something being added. No changes to the share-link codec or the
CV data schema.

This document records what was checked, what was found, how each fix was
verified, and — twice, this time — a case where the first verification
attempt itself was wrong and had to be corrected before the finding could be
trusted. Same format as
[`audit-1.0.0.md`](audit-1.0.0.md)/[`audit-1.0.1.md`](audit-1.0.1.md).

---

## How the audit was run

| Area | Method |
| --- | --- |
| Regression suite | `npm run check:reducers`, `npm run check:share`, `npm run test:e2e` — all run first, as a baseline, before looking for anything new |
| Static widget audit | Grepped for every `role="menu"`/`aria-haspopup` in the app to find ARIA widgets whose full keyboard pattern might not be implemented |
| Console/network audit | Playwright script driving the landing page → builder → demo CV → every template → Export menu, collecting `console.error`/`console.warning`/`pageerror` events |
| Overflow audit | Playwright script at a phone-sized viewport (390×844, no device emulation needed) checking `document.documentElement.scrollWidth` against `clientWidth` on the landing page and the builder |
| Fix verification | For each finding: reproduce with a failing automated test *before* fixing, confirm the same test passes after — not just "looks fixed in a screenshot" |

---

## Findings

Ordered by severity.

### 1. Mobile builder toolbar overflowed horizontally — but only once the web font loaded

**Severity:** high — every mobile visitor to `/cv`, the app's primary page,
got a horizontal scrollbar on first load.

**Root cause:** `.app-toolbar__group` (the flex row holding the template
select, locale toggle, print, responsive/fullscreen toggles, copy-link, and
the Export button) had no `flex-wrap`. `.app-toolbar__inner`, one level up,
does wrap — but wrapping happens per flex *item*, and each `.app-toolbar__group`
is one item, so its ~7 children stayed in a single unbreakable row 488px
wide inside a 390px viewport.

**Why this wasn't caught by two prior audits' "responsive layout is handled"
sign-off:** it's timing-dependent on the self-hosted Inter font (added in
finding 8 of `audit-1.0.1.md`). The uppercase, letter-spaced button labels
render narrower on the fallback system font than on Inter once it swaps in.
Manual testing that glances at the toolbar before the font finishes loading,
or that never happens to catch the swap, sees no overflow. This also broke
my own first attempt at an automated regression test for it — see the
"Notable" section below.

**Fix:** `flex-wrap: wrap` on `.app-toolbar__group`. The group now wraps
onto additional rows on narrow viewports instead of overflowing.

**Verified:** `e2e/responsive.spec.js` — reproduced the overflow with a
failing test against the un-fixed CSS (`scrollWidth: 504` vs `clientWidth:
390`), confirmed the fix makes it pass reliably across 3 repeated full
test runs, confirmed the landing page (unaffected either way) stays passing
throughout.

---

### 2. The Export menu wasn't actually keyboard-navigable, despite claiming to be

**Severity:** medium — `role="menu"`/`role="menuitem"`/`aria-haspopup="menu"`
tell assistive technology this is a full ARIA menu-button widget, which sets
an expectation of arrow-key navigation between items and focus management on
open/close. None of that was implemented — it was 3 plain buttons in a
positioned `<div>`, reachable only by Tab. A screen reader announcing "menu,
3 items" and then having Arrow keys do nothing is arguably worse than not
claiming the `menu` role at all.

**Fix:** implemented the ARIA menu-button pattern properly in
`Toolbar.jsx`: opening the menu (click or Enter/Space on the trigger) moves
focus to the first item; `ArrowDown`/`ArrowUp` cycle between items and wrap
at the ends; `Home`/`End` jump to the first/last item; `Escape` closes the
menu and returns focus to the trigger; tabbing out of the widget (checked
via `onBlur` + `relatedTarget`, not by intercepting Tab, since intercepting
Tab races the browser's own default-focus computation against React's
render) also closes it.

**Verified:** `e2e/export.spec.js`, two new tests — one drives
Down/Down/Down (wraps to first)/Up/Home/End and asserts focus at each step;
the other asserts Escape closes the menu and returns focus to the trigger
button. Both pass; the existing click-based Export tests (list contents,
outside-click-close, JSON/HTML download) still pass unchanged.

---

### 3. `X-Frame-Options` and `X-Content-Type-Options` were set as `<meta>` tags, which does nothing

**Severity:** medium — no active exploit, but the app appeared to have
clickjacking and MIME-sniffing protection it did not actually have. A CV
builder whose share links embed the CV's contents in the URL is a
plausible-enough clickjacking target that this is worth being honest about
rather than leaving a placebo in place.

**Root cause:** `X-Frame-Options` and `X-Content-Type-Options` are only
meaningful as real HTTP response headers — the spec for `<meta
http-equiv>` doesn't cover them, and Chrome logs a console error and drops
the directive (`X-Frame-Options may only be set via an HTTP header sent
along with a document. It may not be set inside <meta>.`) rather than
applying it. `vite.config.js`'s `server.headers` sets the real header, but
only for `npm run dev` — a static production deployment (which is what this
project's own README documents: GitHub Pages, Vercel/Netlify, a plain
`scp`'d directory) has no Vite server in front of it at all, so that
middleware never runs for a real user.

**First fix attempt, also wrong:** tried `<meta http-equiv="Content-Security-Policy"
content="frame-ancestors 'none';">` as a meta-compatible substitute for
`X-Frame-Options`. This *also* produces a console error —
`frame-ancestors` is one of the directives the CSP3 spec explicitly excludes
from `<meta>` delivery (along with `sandbox` and `report-uri`/`report-to`).
There is no meta-tag path to clickjacking protection at all; it is
inherently a hosting-layer concern for a static site.

**Actual fix:** removed both non-functional meta tags from `index.html`.
Added [`public/_headers`](../public/_headers) (the convention Netlify reads
automatically from the publish directory) and [`vercel.json`](../vercel.json)
(same, for Vercel) with the real headers. Documented in the README's
Deployment section that GitHub Pages has no custom-header mechanism at all —
that hosting path genuinely cannot have this protection — and that a
traditional server needs the equivalent added at the nginx/Apache/Caddy
config layer.

**Verified:** the Playwright console-audit script (landing → builder → demo
CV → every template → Export menu) reported zero console errors/warnings
after the fix, versus the one `X-Frame-Options` error before it.
`public/_headers` confirmed present in `dist/` after `npm run build`
(Vite copies `public/` verbatim); `vercel.json` confirmed correctly *not*
in `dist/` (Vercel reads it from the repo root, not the build output).

---

## Notable: a test that passed for the wrong reason, twice

Worth recording in detail, since it's a trap this repo's own font-loading
setup (finding 8, `audit-1.0.1.md`) creates for anyone writing a viewport
test here in the future.

Writing the regression test for finding 1 above went through three versions:

1. Checked `scrollWidth > clientWidth` immediately after `page.goto()`.
   Passed — even with the bug still present and unfixed. False negative:
   measured on the fallback font, before Inter swapped in.
2. Added `await page.evaluate(() => document.fonts.ready)` before
   measuring. Still passed with the bug present, but *inconsistently* —
   failing to reproduce depended on unrelated factors like whether a
   `chromium.launch()` reused warm state from a previous run. `fonts.ready`
   resolving doesn't guarantee the resulting relayout has happened yet
   relative to when the next line runs.
3. Added `await page.waitForLoadState('networkidle')` *before* the
   `fonts.ready` check. Reproduced the bug reliably across every repeated
   run, both with and without the fix.

The lesson isn't "always use networkidle" as a blanket rule — it's that a
layout assertion sensitive to web-font metrics needs a stronger
synchronization point than `fonts.ready` alone in this specific harness, and
that a regression test should always be confirmed to *fail* against the
unfixed code before being trusted to pass against the fix. Step 1 and step 2
above would each have shipped as a green test that silently didn't test
anything.

---

## Verification results

- `npm run lint` — clean.
- `npm run build` — succeeds; `dist/_headers` present, `dist/vercel.json`
  correctly absent.
- `npm run check:reducers` — 54/54 pass.
- `npm run check:share` — 15/15 pass.
- `npm run test:e2e` — 14/14 pass (10 carried over from `audit-1.0.1.md`
  plus 4 new: 2 for Export-menu keyboard navigation, 2 for mobile overflow),
  confirmed 3 repeated runs with no flakiness.
- Console/network audit (Playwright, landing → builder → demo CV → 5
  templates → Export menu → Escape) — 0 errors, 0 warnings, 0 page errors.
  1 error before this pass's fixes (finding 3).

---

## Known limitations carried into 1.0.2

- **GitHub Pages deployments have no `X-Frame-Options`/`X-Content-Type-Options`
  protection.** Not fixable from this repo — the host has no custom-header
  mechanism. Documented in the README rather than silently gapped.
- **The `test:e2e` mobile-overflow check covers the builder and landing
  page only.** Other views (template gallery modal, settings modal) were
  eyeballed during the console/interaction audit but don't have their own
  overflow assertions yet.
- Everything carried as a limitation in `audit-1.0.1.md` was closed in that
  document's own follow-up pass and stayed closed through this one — not
  re-litigated here.

---

## Release readiness

**9.5/10 — same as `audit-1.0.1.md`'s final score, held there deliberately.**

Three real findings this pass, all fixed and verified with a
failing-test-first process, not just visual inspection — including one
(finding 1) invisible to every prior manual and automated check because of
exactly how its root cause interacted with test timing. That's the audit
process working as intended, not evidence the project is less ready than
the last document claimed.

The score stays where the previous document left it rather than moving
because the one thing holding it at 9.5 instead of 10 is unchanged:
**everything in this repository, across all three audit passes now, is
still uncommitted.** Extending an audit indefinitely doesn't get closer to
"ready" if none of it ever lands as a real commit — at some point the fixes
have to actually ship, and this document takes no view on when that should
happen versus continuing to look for more.
