# PortifyCV 1.6.19 security audit (penetration-test pass)

**Date:** 2026-10-12
**Scope:** A whole-application adversarial pass over the app as it stands
at 1.6.19, against a local production build and the live site
(`portifycv.app`). It builds on [`security-audit-1.0.md`](security-audit-1.0.md)
(2026-08-11), which found nothing to fix. Since then the app has gained a
Cloudflare edge worker, Google AdSense, per-template pages, a Word export,
the Direct Edit builder with inline editing and photo upload, template
looks and field filters with new address parameters (`?style=`,
`?field=`, `?example=`, `?template=`), and new share-link keys (`va`,
`tp`). Those new surfaces are the focus; the 1.0 attacks were re-run
where the code under them changed.

Release-readiness and transport findings already reported in
[`audit-1.6.16.md`](audit-1.6.16.md) (plain HTTP not upgraded, no HSTS)
are cross-referenced below, not repeated.

**Mode:** report first. No code was changed by this pass.

---

## How the audit was run

| Area | Method |
| --- | --- |
| Attack surface mapping | Static SPA, no backend, no accounts, no cookies of its own; an edge worker that rewrites HTML metadata from a fixed route table. Untrusted input enters through: form fields and Direct Edit inline fields, JSON import (and the opt-in session restore, which uses the same parser), share-link fragments, address parameters, and photo/image uploads. Sinks: the live React preview, the HTML export file, the Word export, the PDF export, `<img src>` for photos and project images, the worker's redirects. Third-party code: the AdSense script. |
| Image sources from imported data | Built a CV JSON with the real exporter shape (`demoCvData`), set `photo` and `projects[0].image` to URLs on a reserved `.invalid` domain, imported it through the real **Import JSON** control on a production build, and intercepted (never forwarded) every request to that host with Playwright |
| XSS, live preview and HTML export | Imported a CV whose name, title and project name carried `"><img src=x onerror=…><script>…</script>`, whose links were `javascript:` URLs and whose photo tried to break out of its attribute (`data:image/png;base64,AAAA" onerror="…`); checked the live DOM, then exported HTML through the real menu, read the downloaded file and opened it in the browser |
| Direct Edit inline fields | Read `EditableField.jsx`: values are read with `innerText`/`textContent` and paste is forced to plain text (`insertText`) |
| Word export | Read `docxExport.js`: link URLs are written as text only, with no hyperlink runs |
| Share links | `tp` set to an HTML injection string and `__proto__`; `va` with `__proto__`, `constructor` and a `<script>` value; `va` as a non-object (all on the live site, from `audit-1.6.16.md`); deeply nested arrays and objects in `s`, `va`, `sc` and `x` at depths 1,500-200,000 (local build) |
| JSON import, deep nesting | A 200,000-deep array in `experience`, through the real import control |
| Address parameters | Read every `searchParams.get`: `style`, `field`, `example`, `template` all go through allow-list parsers or registry lookups and are never rendered raw |
| Edge worker | `curl --path-as-is` against the live site with `//evil.example/`, `///evil.example`, `/%2F%2Fevil.example`, backslash and encoded-backslash paths, and case/trailing-slash variants of real routes |
| Privacy | Live site, Playwright: typed a unique marker into the CV's name field and put it in a share-link fragment, then searched every request URL and body (54 requests) for it, and classified hosts. The Google consent dialog was not accepted. |
| Dependencies | `npm audit`, run fresh: 0 vulnerabilities |

---

## Findings

### Medium: an imported CV file can make the app fetch remote images (tracking beacon)

**Location:** `src/utils/cvForm.js:1428` (`photo`) and `:1531`
(`projects[].image`) accept any string through `readOptionalString`;
`CVPreview.jsx:1382` and every Showcase render them as `<img src>`.

**Impact × likelihood:** A file-sharing workflow is normal for CVs
(a recruiter, a career coach or a colleague sends "my CV, edit it here").
Whoever crafts the file learns, when the recipient imports it, the
recipient's IP address, browser and the time, and can tag each copy
(`?who=…`) to tell recipients apart. No code runs and no CV data leaves,
so it's not worse than a tracking pixel, but it directly contradicts the
landing page's promise that the CV "never leaves your device", and it
happens silently.

**Reproduction:** a CV JSON with
`"photo": "https://pentest-beacon.invalid/photo.png?who=victim"` and a
project `"image": "https://pentest-beacon.invalid/project.png"`, imported
through **Import JSON** on the Developer template. Observed: the import
succeeds with "Imported CV data from beacon-cv.json.", two `<img>`
elements point at the remote host, and the browser requests both URLs
immediately. (The requests were intercepted in the test; nothing reached a
real host.)

**Not affected:** share links (they strip images entirely); the PDF
export, which only accepts `data:image/png` or `data:image/jpeg`
(`exporters.js:227`); the HTML export, which doesn't embed photos.

**Fix:** in `parseImportedCvData`, accept only `''` or an inline image
data URL for `photo` and `projects[].image` (the same
`^data:image/(png|jpe?g|webp|gif);base64,` family the app's own upload
produces; check `buildProfilePhotoDataUrl` and `DragDropUpload` for the
exact types), and reject or drop anything else with a clear message.
Optionally guard at render too, so no future path can reintroduce it. Add
a `check:reducers`/import test with a remote URL and an e2e test that
imports one and asserts no request leaves.

### Low: the ad script runs inside the CV builder

**Location:** `index.html:12` loads `adsbygoogle.js` on every page,
including `/cv`; there is no Content-Security-Policy.

**Impact × likelihood:** Google's script (and anything it loads) runs in
the same page as the CV being edited, with full access to its DOM. The
traced session showed no CV data sent anywhere (0 of 54 requests carried
the marker; the page address Google receives excludes the share-link
fragment), and the privacy policy discloses AdSense and its cookies. So
this is a trust dependency, not an observed leak: the "never leaves your
device" promise holds only as long as that third-party code behaves, and
Auto ads may also place ads inside the builder.

**Fix:** load AdSense only on the content pages (landing, guides,
templates, examples), not on `/cv`: inject the script from `App.jsx` per
view instead of from `index.html`, or exclude `/cv` in the AdSense
dashboard's Auto ads page exclusions (which stops ad placement but not the
script). A CSP is the stronger follow-up (see "Not tested").

### Cross-reference (Medium, open): plain HTTP and HSTS

`audit-1.6.16.md` finding 2 is still open on the live site:
`http://portifycv.app/` answers `200` over unencrypted HTTP and HTTPS sends
no `Strict-Transport-Security`. On a hostile network that lets an attacker
serve a modified app, which defeats every protection below. Fix in the
Cloudflare dashboard ("Always Use HTTPS" and HSTS).

---

## Tested and held

### XSS through imported data, in the live preview and the HTML export

Name, title and project name carrying
`"><img src=x onerror="window.__xss=1"><script>window.__xss=2</script>`,
links set to `javascript:window.__xss=4`, and a photo value trying to
break out of its attribute: nothing executed in the live preview, no
`javascript:` link was rendered (`getSafeHref`), and the downloaded HTML
export contained no raw `<script>`, no injected `onerror` and no
`javascript:` link. Opening the exported file in a browser ran nothing.

### Direct Edit inline editing

Inline fields read their value as text (`innerText`/`textContent`) and
force paste to plain text (`execCommand('insertText')`), so pasted markup
never becomes HTML.

### Word export

Link URLs are written as text only; the generator creates no hyperlink
runs, so there's no `javascript:`, `file:` or UNC link to plant in a
`.docx`.

### Share-link tampering, including the new `tp` and `va` keys

A `tp` holding an HTML injection string or `__proto__` opens on the
default template; a `va` holding `__proto__`, `constructor` and a
`<script>` value loads normally; a non-object `va` is rejected with
"Shared CV link is invalid or corrupted." No dialogs, page errors or
console errors.

### Deep nesting (a gap left by the 1.0 pass)

Share links are capped at 16,000 characters before parsing
(`MAX_SHARE_DATA_LENGTH`, `shareLinks.js:4`), so a 200,000-deep payload is
refused as "too large to restore". Under the cap, nesting depths of
1,500-4,000 in `s`, `va`, `sc` and `x` are either rejected cleanly or load
without error. A 200,000-deep `experience` array through JSON import is
rejected at the first level ("experience must contain only objects.").
No crash, hang or page error in any case.

### Address parameters

`?style=` and `?field=` go through allow-list parsers
(`parseStyleVariantParam`, `parseFieldParam`), `?example=` through the
per-template registry (`isTemplateExample`), and `?template=` through
`resolveTemplateId`. None is rendered raw, and the edge worker builds
canonical URLs from the path only.

### Edge worker redirects

Only real routes redirect (case and trailing-slash variants), and the
target is built from the request's own URL with a normalised path, so it
always stays on `portifycv.app`. `//evil.example/`, `///evil.example`,
`/%2F%2Fevil.example`, `/\evil.example` and `/%5Cevil.example/` all return
a plain 404. No open redirect.

### Privacy under a network trace

With a marker typed into the CV and placed in a share-link fragment, none
of the 54 requests on the live site carried it. Third-party traffic was
limited to `pagead2.googlesyndication.com` (the ad script) and
`fundingchoicesmessages.google.com` (Google's consent dialog).

### Response headers

`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` and
`Referrer-Policy: strict-origin-when-cross-origin` are delivered on pages,
assets and the 404 response in production (`audit-1.6.16.md`).

### Dependencies

`npm audit`: 0 vulnerabilities after 1.6.19's `npm audit fix`.

---

## Verification results

- Dynamic tests ran against a real production build (`vite preview`) and
  the live site, driven by Playwright and `curl`, not just source reading.
- No source files were changed by this pass, so the regression suites
  were not re-run; 1.6.19 passed lint, all 8 `check:*` scripts, the build
  and 874 e2e tests earlier the same day.

---

## What was not tested, and why

- **Traffic after accepting Google's consent dialog.** Accepting it would
  load personalised ads and more Google requests; the trace above covers
  the no-consent state only. A repeat with consent given, on a throwaway
  profile, would complete the privacy picture.
- **A Content-Security-Policy.** None exists, so there was nothing to
  test. Designing one that allows AdSense without gutting its value is a
  separate task.
- **The edge worker under `wrangler dev` with hostile `Host` headers** —
  Cloudflare routes by host before the worker runs, and the worker builds
  URLs from `SITE_ORIGIN` for canonicals, so this was judged low value.
- **Cookie/session security, SQL/NoSQL/command injection, SSRF,
  server-side auth.** Not applicable: there's no backend, no accounts and
  no cookies of the app's own.
- **Supply-chain compromise of a dependency or of the AdSense script
  itself.** Out of scope for a point-in-time pass; the AdSense finding
  above is the mitigation that limits its reach.
- **Browser extensions reading the page.** Outside the app's control.

---

## Release readiness (security)

**One Medium finding in the app (remote images via import), one Low
(ad script in the builder), and one open Medium in the hosting
configuration (HTTP/HSTS, from `audit-1.6.16.md`).** Every XSS, injection,
tampering, recursion and redirect attack tried against the new 1.1-1.6
surfaces held, and no CV data was observed leaving the browser. The import
fix is small and self-contained; the HSTS fix is two switches in the
Cloudflare dashboard. With those two done, the remaining risk is the
third-party ad script, which is a product decision about where ads run.
