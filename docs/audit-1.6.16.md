# PortifyCV 1.6.16 release audit

**Date:** 2026-10-12
**Scope:** The 1.6 release (R0uty/PortifyCV#2, merged into `main` as
`83d296c`): template looks everywhere (1.6.0-1.6.8, 1.6.11), the
first-look contrast fixes (1.6.9-1.6.10), field filters (1.6.12,
1.6.14-1.6.16) and the dialog focus-trap hardening (1.6.13), checked on
the **live site** (`portifycv.app`, which serves 1.6.16), plus the full
regression suite and a dependency audit. It also closes a gap carried
since `security-audit-1.0.md`: production response headers had never been
checked against a real deployment.

Not re-audited: the 1.1-1.5 features (Direct Edit builder, per-template
pages, Word export, template polish, cover letters), beyond what the
regression suite covers. A full pass over those is a separate, larger
audit.

**Mode:** report first. Nothing was changed while auditing; each finding
below carries a proposed fix for the project owner to accept or reject.
Item 23 (branch protection) is a GitHub setting, not code, and stays out
of scope as in `audit-1.0.3.md`.

---

## How the audit was run

| Area | Method |
| --- | --- |
| Regression | `npm run lint`, all 8 `check:*` scripts, `npm run build`, full `CI=1 npm run test:e2e` on `main` at `3c84ca4` |
| Dependencies | `npm audit` (all) and `npm audit --omit=dev`, then traced each advisory to whether the shipped app can reach it |
| Live deployment | `curl` against `portifycv.app`: status codes, response headers, bodies, canonical links, HTTP vs HTTPS, `www` host |
| Share-link tampering | Built links with the real encoder (`encodeCvStateForUrl`), mutated `tp`/`va` (HTML injection string, `__proto__`, `constructor`, a `<script>` value, a non-object), loaded each on the live site in headless Chromium, recording dialogs, page errors, the template it opened on and any message |
| New UI, desktop and phone, en and fi | Headless Chromium on the live site at 1280px and 375px: horizontal overflow, chip rows, computed text contrast of chips and the status line, chip height |
| Keyboard | Arrow keys in the gallery's field chips: focus, selection, status line, focus ring |
| Screen readers | Playwright accessibility snapshots of the landing strip and hero |
| Network | Resource timing on the live landing page: which fonts and how many chunks load |

---

## Findings

Severity is about impact on real visitors, not effort to fix.

### 1. A broken link shows a blank page

**Status:** fixed in 1.6.17 (`worker/index.js` fetches `/404`; verified
on `wrangler dev`: unknown paths return 404 with the full page and no
`Location` header, real routes unchanged).

**Severity:** medium. Any visitor who follows a stale or mistyped link
(old shares, search results for a removed page, typos) gets a white page
with nothing on it: no message, no navigation, no way back except the
browser.

**What happens:** `https://portifycv.app/anything-unknown` returns
`404` with an empty body and a `location: /404` header. In a real browser
the document is 39 bytes, with no title and no text. `worker/index.js:130`
fetches `/404.html` from the static assets, but Cloudflare's asset handler
answers that path with a `307` redirect to `/404`; the worker then wraps
that empty redirect response in a `404` status, keeping its `Location`
header, and browsers don't follow `Location` on a 404. The worker already
avoids exactly this trap for `/` (the comment at `worker/index.js:118-123`
explains it), but not for the 404 page.

**Proposed fix:** fetch `/404` (the extensionless path) instead of
`/404.html`, the same way the route branch fetches `/`. Verify with
`npm run worker:dev`: an unknown path returns 404, a non-empty body with
the "Page Not Found" title, and no `Location` header. A small e2e or
worker check would keep it fixed; today no test exercises the worker.

### 2. Plain HTTP isn't upgraded to HTTPS

**Status:** fixed 2026-10-17 in the Cloudflare dashboard ("Always Use HTTPS" and HSTS; verified with `curl`: `http://` answers `301` to the same `https://` URL, path and query kept, and HTTPS sends `strict-transport-security: max-age=15552000; includeSubDomains` plus `x-content-type-options: nosniff`). HSTS preload left off on purpose.

**Severity:** medium (transport security). `http://portifycv.app/`
answers `200 OK` with the full page over unencrypted HTTP, and HTTPS
responses send no `Strict-Transport-Security` header. A visitor who types
`portifycv.app` on a hostile network (public Wi-Fi) can be served a
modified copy of the app, which could read the CV they type, the very
data the site promises never leaves the browser.

**Proposed fix (project owner, Cloudflare dashboard):** turn on "Always
Use HTTPS" for the zone, and HSTS (start with a short `max-age`, then
raise it). Optionally also add `Strict-Transport-Security` to
`public/_headers` so it's in the repo. Neither is a code change in the
app itself.

### 3. Hashed assets are never cached

**Status:** fixed in 1.6.18 (`public/_headers`; verified on `wrangler dev`: hashed assets `max-age=31536000, immutable`, pages and the 404 unchanged at `max-age=0`).

**Severity:** low (performance). Every content-hashed file under
`/assets/` (for example `index-DAtX3vG6.js`) is served with
`cache-control: public, max-age=0, must-revalidate`. Their names change
whenever their content does, so they could be cached for a year; instead
every visit revalidates each of the roughly 30 JavaScript chunks the
landing page loads.

**Proposed fix:** add to `public/_headers` (Cloudflare Workers static
assets read it):

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

Leave HTML on the current `max-age=0` so new releases appear at once.

### 4. The landing page downloads a font for one strip card

**Status:** fixed in 1.6.18 (first option: a strip card whose look needs a font download takes the next look in its rotation; e2e checks the landing page requests no Carlito or Lato).

**Severity:** low (performance). Since 1.6.11 the landing strip shows
template looks, and card 15 (Quadrant) shows its Indigo look, whose font
is Calibri. The thumbnail loads that font's self-hosted fallback, so every
first visit to the landing page downloads three Carlito files (about
92 KB) for one small, scrolling, below-the-fold thumbnail. It doesn't
delay first paint.

**Proposed fix:** either skip looks with a downloadable font (Calibri,
Lato) when the strip picks card *n*'s look, falling back to the next look
in rotation, or let the strip's thumbnails render a look's font stack
without loading its font file. The first keeps the "card *n* shows look
*n* mod 3" rule simple to state with one exception; the second changes
`TemplateThumbnail` for one caller.

### 5. Screen readers hear the landing strip twice

**Status:** fixed in 1.6.18 (the loop copy is `aria-hidden`; e2e checks each template name appears once in the accessibility snapshot).

**Severity:** low (accessibility). The strip duplicates its cards so the
scroll can loop seamlessly, and the copy is exposed to assistive
technology: the accessibility tree holds 72 lines, every template name and
look name twice. The CV thumbnails themselves are correctly hidden. The
duplicate predates 1.6, but the look captions added in 1.6.11 doubled
what's read out.

**Proposed fix:** mark the second copy's cards `aria-hidden="true"` in
`LandingTemplatesPreview.jsx` (they're purely visual), and add an e2e
check that each template name appears once in the strip's accessibility
snapshot.

### 6. Dependency advisories

**Status:** fixed in 1.6.19 (`npm audit fix`; lockfile-only, 67 patch/minor bumps; `npm audit` reports 0).

**Severity:** low. `npm audit` reports 7 advisories (1 low, 6 high), all
with non-breaking fixes available through `npm audit fix`:

- **Shipped to visitors:** `dompurify` 3.4.13 (low). It's an optional
  dependency of jsPDF, used only by `jsPDF.html()`; the app exports PDFs
  through html2canvas and never calls `.html()` or DOMPurify, so the
  advisories (both about its `IN_PLACE` mode) aren't reachable.
- **Build and tooling only:** `brace-expansion` and `source-map-js`
  (denial of service in build tools), and `sharp` and `undici` through
  `wrangler`'s local dev server (`miniflare`). None ships to visitors.

**Proposed fix:** `npm audit fix`, then the full verification (lint, 8
checks, build, e2e), as its own patch release.

### 7. `www.portifycv.app` doesn't resolve

**Severity:** informational. The `www` host has no DNS record, so anyone
who types it gets a browser error. If wanted, add a DNS record and a
redirect to the apex domain in Cloudflare. Not a code change.

---

## Tested and held

- **Tampered share links.** On the live site: a `tp` holding an HTML
  injection string, or `__proto__`, opens on Minimalist with nothing
  injected; a `va` holding `__proto__`, `constructor` and a `<script>`
  value opens normally on the link's real template; a `va` that isn't an
  object is rejected with "Shared CV link is invalid or corrupted." No
  dialogs, page errors or console errors in any case.
- **`?field=` and `?style=` don't create duplicate pages.** On the live
  site both resolve their canonical link to the clean path, with the right
  title and `index, follow`. Both values are only ever read through
  allow-list parsers (`parseFieldParam`, `parseStyleVariantParam`) and
  never rendered.
- **Field chips at every size.** Desktop, phone and Finnish phone: no
  horizontal scroll, chips wrap onto 1, 2 and 3 rows; chip and status-line
  text contrast is 17-18:1.
- **Keyboard in the gallery.** Arrow keys move between chips and select
  them, the status line updates ("Showing 4 of 18 templates"), the focused
  chip shows a focus ring, and nothing overflows at 375px.
- **Production headers.** `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff` and `Referrer-Policy:
  strict-origin-when-cross-origin` are delivered on pages, assets and the
  404 response, closing the "headers unverified on a real deployment" gap
  carried since `security-audit-1.0.md`.
- **Hero preview.** Exposed to screen readers as a single labelled image.

## Considered and not changed

- **No `Content-Security-Policy`.** A CSP would add defence in depth, but
  the site loads AdSense, whose script and frame sources change often; a
  CSP that doesn't break ads needs its own design and testing. Worth a
  separate task, not a quick fix.
- **Chips are 36px tall.** That meets WCAG 2.2 AA's 24px minimum target
  size, not the 44px AAA guideline; consistent with the site's other
  pills.
- **"Kaikki" (All) beside "Kaikki alat" (Any field) in Finnish.** Approved
  wording; reads clearly in context, flagged during design.
- **A user can still hand-pick a light accent swatch** with low contrast,
  as recorded in the 1.6.9 changelog.

---

## Verification results

On `main` at `3c84ca4` (1.6.16 plus a `todo.md` tidy):

- `npm run lint`: clean.
- All 8 `check:*` scripts (share, reducers, feedback, docx-export,
  section-schema, section-columns, template-pages, template-variants):
  pass.
- `npm run build`: succeeds. Entry chunk `index-*.js` 124.79 kB
  (37.22 kB gzip); `ResumeBuilderPage` 186.99 kB (50.56 kB gzip).
- `CI=1 npm run test:e2e`: 872 passed (4.6m), 0 failed, 0 flaky.
- CI on `main` for the merge commit: green.

---

## Release readiness

**8.5/10.**

The 1.6 features themselves hold up: every one behaved correctly on the
live site, at phone width, in Finnish and from the keyboard, the new
share-link keys survive tampering, and the full suite is green. Nothing
found is a defect in the 1.6 code paths' main behaviour.

The score is held back by the deployment rather than the app. Findings 1
(blank page for broken links) and 2 (plain HTTP not upgraded) both affect
real visitors today and are small to fix: one line in the worker, two
switches in the Cloudflare dashboard. Findings 3-6 are low-impact polish,
and 7 is a domain decision. With 1 and 2 fixed this would be a 9.5.

Suggested order: 1 and 2 first (2 is in the dashboard, yours), then 3, 5
and 4 together as one small release, then 6 as its own dependency-bump
release.
