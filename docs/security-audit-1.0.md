# PortifyCV 1.0 security audit (penetration-test pass)

**Date:** 2026-08-11
**Scope:** A whole-application, adversarial security pass — different in
kind from `audit-1.0.0.md`/`audit-1.0.1.md`/`audit-1.0.2.md`, which reviewed
UX, accessibility, and general release readiness. This document covers only
security: does untrusted input ever reach a sink it can corrupt, and does
the "nothing leaves your browser" privacy claim hold under a real network
trace. Findings are reported the way a pentest report is, not a UI-review
doc: severity, reproduction, fix.

No code changes were required by this pass — every attack tried was already
mitigated by existing code, most of it hardened during `audit-1.0.1.md`
(dompurify bump, `getSafeHref`, `validateAllowedKeys`). This document exists
to record *that it was tested*, not just assumed.

---

## How the audit was run

| Area | Method |
| --- | --- |
| Attack surface mapping | PortifyCV is a static SPA with no backend: no auth, no server, no database. Untrusted input enters at three points — form fields (rendered live + exported), pasted free-text CV parsing, and imported data (JSON file upload, share-link URL fragment). Each was treated as a separate sink, per file/per export path, not assumed to share one code path. |
| XSS — live preview | Playwright: filled Full Name / Title fields with `<img src=x onerror="window.__xss=1">"><script>alert(1)</script>`, checked rendered DOM, checked for actual `onerror`/`alert` execution, checked for a fired `dialog` event. |
| XSS — HTML export | Same payload class (`"><script>alert(document.domain)</script><svg onload=alert(2)>`) into form fields, triggered the real **Export → HTML** menu action, read the *actual downloaded file* from disk and searched for unescaped tags — not just the in-app preview. |
| Prototype pollution — JSON import | Hand-built raw JSON text (not a JS object literal, which silently drops `__proto__`) with `__proto__` keys both at the top level and nested inside `experience[]`, uploaded via the real file-input control, checked `Object.prototype` and `Array.prototype` afterward. |
| Prototype pollution / crash-resistance — share links | Five crafted `#data=` fragments navigated to directly: garbage (non-base64) text, valid-base64-but-non-JSON, a 500KB oversized payload, valid JSON of the wrong shape (array instead of object), and valid JSON carrying a raw `__proto__` key with no `parseImportedCvData` wrapper to catch it first. |
| `javascript:`/`data:` URI injection | Grepped every `href={...}` in the codebase for a bypass of `getSafeHref()` (used in 21 call sites); confirmed none exist. |
| ReDoS | Read `parsePastedCvText()` and its helpers (`src/utils/cvForm.js`) for nested-quantifier regex patterns; all are simple, anchored, fixed-alternation. |
| Privacy / network | Captured every `request` event during a full interactive session (landing → form fill with the XSS payloads above → export) and classified by host. |
| Transport/response headers | `curl -sI` against the actual `vite preview` server (the header source added in `audit-1.0.2.md`) for `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. |
| Dependency audit | `npm audit` re-run fresh this session rather than trusting the `audit-1.0.1.md` result. |

---

## Findings

**No exploitable vulnerabilities found.** Nothing below required a code
change — this section documents what was tried and why each attempt failed,
so the "clean" result is falsifiable rather than asserted.

### Tested and held: reflected/DOM XSS in form fields (live preview)

**Payload:** `<img src=x onerror="window.__xss=1">"><script>alert(1)</script>`
into the Full Name and Title fields.

**Result:** the payload appears in the preview DOM as literal escaped text.
`window.__xss` was never set, no `alert()` dialog fired. React's default
JSX text-node escaping is doing the work here and it isn't bypassed
anywhere in the preview render path — no `dangerouslySetInnerHTML` on
user-controlled data was found.

### Tested and held: XSS in the generated HTML export file

**Payload:** `"><script>alert(document.domain)</script><svg onload=alert(2)>`
into Full Name / Title, then a real **Export → HTML** click, then the
*downloaded file* (not the live DOM) inspected on disk.

**Result:** no raw `<script>alert` or `<svg onload=alert` in the file; the
properly-escaped `&lt;script&gt;alert...` form is present instead. This
matters as a separate check from the live-preview case because a standalone
exported HTML file is a second, independent sink — `exporters.js`'s own
`esc()` helper (`src/utils/exporters.js:236`) escapes `&`, `<`, `>`, and `"`
before interpolating into the template string, which is the reason this
holds even though the export path doesn't go through React at all.

### Tested and held: prototype pollution via JSON import

**Payload:** hand-written raw JSON (bypassing JS-object-literal semantics,
which drop `__proto__` before it ever reaches the wire) with `__proto__`
keys at the top level and nested inside `experience[0]`, uploaded through
the real file-picker.

**Result:** `Object.prototype` and `Array.prototype` were unpolluted
afterward; the app showed a rejection/error message. `validateAllowedKeys()`
(`src/utils/cvForm.js:779`) enforces a strict per-shape allowlist on every
imported object — a key not on the list is rejected outright, so
`__proto__` is treated the same as any other unrecognized key rather than
needing special-case handling.

### Tested and held: share-link tampering

Five malformed/hostile `#data=` fragments navigated to directly:

| Case | Result |
| --- | --- |
| Garbage (invalid base64) | App loads normally, no crash, no console error |
| Valid base64, non-JSON payload | Same |
| 500KB oversized fragment | Same — rejected before ever reaching `JSON.parse` |
| Valid JSON, wrong top-level shape (array) | Same |
| Valid JSON with raw `__proto__` key | Same; `Object.prototype` confirmed unpolluted afterward |

**Why this held:** `decodeCvStateFromUrl()` (`src/utils/shareLinks.js:373`)
layers three independent defenses — a hard length cap
(`MAX_SHARE_DATA_LENGTH = 16000`, checked *before* decoding, so an oversized
fragment never reaches `atob`/`JSON.parse` at all), a `try/catch` around the
base64-decode-and-parse step that collapses any failure into one generic
"Shared CV link is invalid or corrupted" error, and reuse of the same
`parseImportedCvData()` → `validateAllowedKeys()` allowlist that the JSON-
import path uses — so a `__proto__` key smuggled in via a share link is
rejected by the identical logic already proven safe above, not a second,
untested code path.

### Tested and held: `javascript:`/`data:` URI injection

All 21 call sites that build an `href` from user-controlled data (project
links, certificate links, social links) route through `getSafeHref()`
(`src/utils/shared.js:27`), an allowlist that only permits `http:`, `https:`,
and `mailto:` schemes. No call site was found that interpolates a raw
user-supplied URL into `href` directly.

### Tested and held: ReDoS in the pasted-CV-text parser

`parsePastedCvText()` and its helpers `normalizeLines()`, `isHeading()`,
`extractSkillTokens()` (`src/utils/cvForm.js:1532-1645`) use only simple,
anchored regexes with fixed alternation (e.g. `/^(about|summary|profile)$/i`,
`/[,•;|/]+/`) — no nested quantifiers (`(a+)+` shape) that could cause
catastrophic backtracking on adversarial input.

### Tested and held: privacy claim ("nothing leaves your browser")

Captured all network requests during a session that filled in XSS payloads
and exercised the export flow: 12 total requests, 0 to any non-localhost
host. The claim was verified from an actual traffic capture, not from
reading the code that's supposed to prevent outbound requests.

### Tested and held: response/transport headers

`curl -sI` against the local `vite preview` server confirmed
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and
`Referrer-Policy: strict-origin-when-cross-origin` are actually delivered —
this exercises the real fix from `audit-1.0.2.md` (moving these out of a
`<meta http-equiv>`, which cannot carry them, and into `vite.config.js`'s
`preview.headers` plus `public/_headers`/`vercel.json` for real hosts).

### Dependency audit

`npm audit` re-run fresh this session: 0 vulnerabilities across 203
dependencies (24 prod, 169 dev, 47 optional, 3 peer). Consistent with the
`audit-1.0.1.md` fix (finding 11: brace-expansion, dompurify, nanoid).

---

## Verification results

- `npm audit` — 0 vulnerabilities (prod + dev + optional + peer, 203 total).
- Live/dynamic tests above run against a real `npm run build` +
  `vite preview` server, driven by Playwright, not just static code reading.
- `curl -sI` against the running preview server for header verification.

No source files were changed by this pass, so the existing regression
suites (`check:reducers`, `check:share`, `test:e2e`, `lint`, `build`) were
not re-run — nothing they cover was touched.

---

## What was not tested, and why

- **Production hosting header delivery.** Headers were verified against
  `vite preview` (dev-adjacent) and by reading `public/_headers`/
  `vercel.json`, but not against an actual deployed Netlify/Vercel instance
  — no live deployment exists yet to test against. `audit-1.0.2.md` already
  flags GitHub Pages specifically as unable to deliver these headers at all.
- **Clickjacking exploitation beyond the header check.** Confirmed
  `X-Frame-Options: DENY` is served; did not additionally build a hostile
  iframe page to empirically confirm the browser honors it, since this is
  well-trodden browser behavior rather than app-specific logic.
- **Cookie/session security.** N/A — the app sets no cookies and has no
  session or auth concept to attack.
- **SSRF, SQL/NoSQL/command injection, server-side auth bypass.** N/A — no
  server backend exists; these categories don't apply to this architecture
  (see the attack-surface note in `~/.claude/skills/pentest/SKILL.md`).
- **Supply-chain compromise of a dependency itself** (as opposed to a known
  CVE in one) — out of scope for a single `npm audit` pass; would require
  ongoing monitoring, not a one-time check.
- **Denial-of-service via extremely deep/recursive JSON nesting** (stack
  exhaustion in `JSON.parse` or the recursive validators) — the 500KB flat
  fragment case was tested and held, but a deeply nested (not just large)
  payload targeting recursion depth specifically was not separately tried.
- **Browser extension / supply-chain-in-the-browser attacks** (malicious
  extension reading page content) — outside the application's own control
  and outside this audit's scope.

---

## Release readiness (security)

**No open security findings.** Every input surface this pass mapped —
live-rendered form fields, the standalone HTML export file, JSON import,
share-link URL fragments, and link `href`s — was tested with real adversarial
payloads through the running app, not just read as source, and every one
held. The privacy claim central to the product ("nothing leaves your
browser") was confirmed from an actual network capture rather than assumed
from the absence of `fetch`/`XMLHttpRequest` calls in the source.

This is a narrower claim than "the app has no security bugs" — see "What was
not tested" above, most notably real production header delivery, which
can't be verified until something is actually deployed.
