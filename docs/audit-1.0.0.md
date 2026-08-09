# PortifyCV 1.0.0 pre-release audit

**Date:** 2026-08-09
**Scope:** Bug fixes and control-wiring verification ahead of the 1.0.0 MVP
release. No new features.

This document records what was checked, what was found, how each fix was
verified, and which behaviours are deliberate rather than defects. The
user-facing summary of the same work is in [`../CHANGELOG.md`](../CHANGELOG.md).

---

## How the audit was run

| Area | Method |
| --- | --- |
| Static wiring | Script over all 60 JSX/JS files extracting every `<input>`, `<textarea>`, `<select>`, and `<button>` opening tag, flagging missing `value`/`onChange`/`checked`, missing accessible name, missing explicit `type` |
| Share-link codec | Node harness importing `shareLinks.js` with the browser base64 helpers shimmed; field-by-field diff of encode → decode |
| Runtime accessibility | JavaScript audit in the running app: accessible name for every control, orphan `label[for]`, duplicate `id`, unnamed buttons |
| Interaction | Driving the app in Chrome — typing, nav rail, toolbar buttons, share link, share-link restore on load |
| Exports | Intercepting the generated `Blob` to inspect HTML and JSON output, including hostile input |
| Build health | `npm run lint`, `npm run build`, browser console |

The share-link harness was kept as [`scripts/check-share-links.mjs`](../scripts/check-share-links.mjs)
and runs with `npm run check:share`.

---

## Findings

Ordered by severity.

### 1. Share links were impossible to create for any CV with an image

**Severity:** high — a primary feature failed outright for a common case.

A profile photo is stored as a base64 JPEG data URL. The uploader permits up to
450,000 characters, while `MAX_SHARE_DATA_LENGTH` is 16,000. Measured payloads:

| Photo size | Encoded payload | Result |
| --- | --- | --- |
| none | 6,103 | fits |
| 20KB | 42,551 | 2.6× over the limit |
| 40KB | 78,960 | over |
| 80KB | 151,778 | over |

`buildShareUrl` therefore threw `This CV is too large to fit in a shareable
link.` every time, and the toolbar's share button was permanently broken for
anyone who added a photo or a project image.

**Fix:** images are excluded from the payload. `IMAGE_ROOT_FIELDS` and
`IMAGE_ITEM_FIELDS` in `src/utils/shareLinks.js` list the fields to skip while
encoding; their short keys stay in the tables so any link that does contain one
still decodes. `shareLinkOmitsImages(formData)` lets the UI tell the user the
recipient's copy will arrive without images.

**Why not raise the limit instead:** a URL cannot carry a 100KB image in any
practical sense, and the payload is a fragment the user may paste into a message
or chat client. Dropping images keeps the link a constant ~6,100 characters
regardless of image size.

**Verified:** payload size is now identical with and without an 80KB photo plus
an 80KB project image; text round-trips unchanged; images decode to the schema
default (`''`).

---

### 2. Roughly 27 form fields had no accessible name

**Severity:** high — large parts of the form were unusable with a screen reader.

`FloatingField` renders its `<label>` as a *sibling* of the control, because the
floating effect keys off a `:placeholder-shown + label` selector. The label had
neither a wrapping relationship nor `htmlFor`, so it labelled nothing. Affected
every field in experience, education, certificates, projects, and languages.
Clicking a label also did not focus its input.

**Fix:** `FloatingField` generates an id with `useId`, injects it into the cloned
child (respecting an id the child already has), and points the label at it with
`htmlFor`.

---

### 3. `AutoGrowTextarea` discarded injected props

**Severity:** high — the cause of every remaining orphan label.

The component destructured only `className`, `value`, `onChange`, `placeholder`,
and `minHeight`, and rendered a `<textarea>` from those alone. The `id` that
`FloatingField` clones in was dropped, so each "Description" field produced a
`label[for]` pointing at a non-existent element.

**Fix:** collect the rest with `...rest` and spread it onto the textarea.

**Verified:** the runtime audit went from 10 unnamed controls and 3 orphan
labels to 0 of each, across 131 controls.

---

### 4. Section navigation did nothing

**Severity:** medium — every nav-rail entry appeared dead.

Clicking a nav entry left the editor panel's `scrollTop` at 1523 when the target
required 3885.

**Root cause was the browser, not the app.** In the Chrome instance used for
testing, `element.scrollTo({ behavior: 'smooth' })` silently no-ops on every
element — confirmed against a freshly created scrollable `div` — while
`behavior: 'auto'` works and `prefers-reduced-motion` reports false. Per spec a
user agent that will not animate should jump instantly; this one does neither.

The app code was correct, so users on ordinary Chrome were unaffected. The
failure mode is severe enough to defend against anyway: `scrollSectionIntoView`
in `src/pages/ResumeBuilderPage.jsx` now checks 100ms after requesting a smooth
scroll and jumps instantly if nothing moved. A real smooth scroll has always
started well before that point, so this does not interfere with normal browsers.

**Verified:** all four sampled sections now land at offset 0 from the top of the
editor panel.

---

### 5. Non-Latin names produced files named `.pdf`

**Severity:** medium — broken downloads, and hidden files on Unix.

`createExportFileName` lowercased the name and replaced every character outside
`[a-z0-9]`, then trimmed leading and trailing hyphens. A name written entirely
in a non-Latin script reduced to an empty string.

| Input | Before | After |
| --- | --- | --- |
| `Alex Morgan` | `alex-morgan.pdf` | `alex-morgan.pdf` |
| `Ääkkös Öö` | `kk-s.pdf` | `aakkos-oo.pdf` |
| `José Núñez` | `jos-n-ez.pdf` | `jose-nunez.pdf` |
| `日本語` | `.pdf` | `cv.pdf` |
| `Ω` | `.pdf` | `cv.pdf` |

**Fix:** normalize to NFKD and strip combining marks before slugging, so accented
Latin letters fold to their base form rather than being deleted; fall back to
`cv` when the slug is empty.

---

### 6. Clipboard failures surfaced a raw `TypeError`

**Severity:** low.

`window.navigator.clipboard` is undefined outside a secure context, so the whole
share handler's `catch` reported `Cannot read properties of undefined`. Building
the link and copying it are now separate steps with distinct messages, so a copy
failure tells the user to take the link from the address bar.

---

### 7. Unlabelled textareas and inputs

**Severity:** low.

The job-description textarea (`ATSScorePanel`), the quick-import textarea
(`ResumeBuilderPage`), and the interests inputs (`CVForm`) had placeholders but
no accessible name. Given `aria-label`s.

---

### 8. README inaccuracies

**Severity:** low — documentation only.

- The note that links containing a photo "will exceed the size limit" described
  the old broken behaviour. Rewritten to describe image omission.
- "Only the UI language preference is remembered" was incomplete; an
  onboarding-dismissed flag is also stored. Both are now named.

---

## Deliberate behaviours, not defects

Two things look like bugs and are not. They are recorded here so they are not
"fixed" later by mistake.

### The share payload stays in the address bar after a successful load

`initialSession.clearShareParam` is `false` on a successful share-link load, so
`#data=…` remains in the URL. It is cleared only when the link fails to parse.

This is required by the no-persistence design: nothing is written to storage, so
stripping the fragment would mean a page refresh wipes the CV the recipient just
opened. Keeping it is what makes refresh and bookmarking work. The app warns the
user that the link embeds CV data, and the fragment is never sent to a server.

The trade-off is that the recipient's browser history retains the CV. If that
becomes unacceptable, the fix is to add opt-in persistence first — not to strip
the fragment on its own.

### `esc()` in the HTML exporter does not escape apostrophes

It escapes `&`, `<`, `>`, and `"`. Every attribute in the generated document uses
double quotes, so single quotes cannot break out. Verified against hostile input:
a `fullName` of `<script>alert(1)</script>"onload="x` appears fully escaped and
no raw `<script>` tag reaches the output.

---

## Verification results

All checks below were run against the final state of the working tree.

- `npm run lint` — clean.
- `npm run build` — succeeds. The >500KB chunk warning is the lazily loaded PDF
  vendor bundle and is expected.
- `npm run check:share` — 15/15 checks pass, including full-CV round trip, empty
  CV, non-ASCII text, image omission, malformed-input rejection, legacy v2
  decoding, and `buildShareUrl` → `readCvStateFromLocation`.
- Runtime accessibility audit — 131 controls, 0 without an accessible name, 0
  orphan labels, 0 duplicate ids; 213 buttons, all with a handler and an explicit
  `type`.
- Static wiring scan — no control missing `value`/`onChange`, no button
  defaulting to `type="submit"`.
- Browser console — no errors or warnings; only Vite HMR messages.
- Live behaviour — typing updates the preview including non-ASCII text; the share
  link copies, restores a full CV on load, and reports malformed payloads with a
  friendly message; nav entries scroll to their sections; HTML export escapes
  hostile input and covers all 20 sections; JSON export round-trips through
  import.

---

## Known limitations carried into 1.0.0

None of these block the release.

- **Share links cannot carry images.** By design, as above. JSON export is the
  route when images need to travel.
- **`index.html` loads Inter from Google Fonts.** No CV data is involved, but it
  is a third-party request on a page that otherwise makes none. Self-hosting the
  font would remove it.
- **The PDF vendor bundle is ~602KB** (~177KB gzipped). It is loaded lazily on
  first export, so it does not affect initial load.
- **`buildShareUrl` hardcodes the `/cv` path.** Correct for a root deployment,
  which is what the build targets. A subpath deployment would need this and the
  Vite `base` option changed together.
- **No automated test suite.** `npm run check:share` covers the highest-risk pure
  logic. The rest of the audit was manual.
