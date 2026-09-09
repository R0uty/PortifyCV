# AdSense & Google indexing readiness

**Date:** 2026-08-11
**Scope:** Everything in this repository that can be prepared for Google
AdSense approval and Google Search indexing without an actual AdSense
account or a live production domain — neither existed yet at the time of
this pass (see "What still needs you" below). This is a readiness pass, not
an audit of existing behaviour — see `docs/audit-1.0.0.md` through
`docs/audit-1.0.2.md` for those, and `docs/security-audit-1.0.md` for the
security pass. Same "what was checked / what changed / what's still open"
format as those documents.

---

## Update — 2026-09-09

A second pass, now that `portifycv.app` is live and serving all routes:

- **About + contact page added.** `src/pages/AboutPage.jsx` at `/about`,
  linked from the footer on every view alongside the privacy policy.
  Covers what PortifyCV is, how it works, who makes it, how it's funded
  (Google AdSense, disclosed in advance), and a contact address —
  bilingual en/fi. AdSense's site review expects a clear About page and a
  contact route; this closes that gap.
- **Contact address is now real.** `privacy@portifycv.app` (a placeholder
  that never had a mailbox) was replaced everywhere with
  `portifycv@gmail.com` — in `src/pages/PrivacyPolicyPage.jsx` (en + fi)
  and on the new About page. The privacy policy's effective date was
  bumped to 9 September 2026 to reflect the change.
- **Sitemap gaps fixed.** `public/sitemap.xml` was missing
  `/how-to-use-the-cv-builder` (added since the last pass) and now also
  lists `/about`. `lastmod` on the two changed pages updated.

### AdSense wired in (same day, after the user supplied publisher
`ca-pub-4696294951019088`)

The original design — an env-var-gated `AdSenseLoader` that injected the
script only after a click on a custom `ConsentBanner` — was replaced,
because a consent-gated script is not discoverable by AdSense's
verification/review crawler and leaves most visitors never loading ads:

- **AdSense snippet in `index.html` `<head>`**, loaded on every route with
  no JS/consent dependency. Also enables Auto ads. The publisher ID is
  public (it ships in the tag on every page), so it is committed directly
  rather than kept in `VITE_ADSENSE_CLIENT_ID`.
- **`public/ads.txt`** added:
  `google.com, pub-4696294951019088, DIRECT, f08c47fec0942fa0`.
- **`src/components/AdSenseLoader.jsx`, `src/components/ConsentBanner.jsx`,
  `src/utils/consent.js`, and the `.consent-banner` CSS were deleted**,
  along with their wiring in `src/App.jsx` (the `adConsent` state and the
  `portifycv-ad-consent` localStorage key are gone). EEA/UK/CH consent is
  now Google's certified GDPR message, enabled in the AdSense dashboard
  under **Privacy & messaging** — no app code.
- **Privacy policy + About page** rewritten from "ads may be enabled
  later" to present tense: the site shows AdSense ads now; the local-
  storage list dropped from four items to three (locale, onboarding-seen,
  session-restore-enabled).

Still open (all dashboard-side, no repo work): finish AdSense approval if
still pending, and **enable the GDPR consent message in Privacy &
messaging** — the privacy policy and About page already state that this
message is shown, so it must actually be turned on before EEA traffic
arrives.

---

## Why this doc exists

AdSense approval and Google indexing both depend on things this repo can
and can't provide on its own:

- **This repo can provide:** a privacy policy, sufficient real content
  (not just a bare tool page), correct canonical/sitemap/structured-data
  setup, working direct-URL routing, and a consent-gated mechanism ready to
  switch on the moment there's a real AdSense account.
- **Only your Google account can provide:** actually applying for AdSense,
  a publisher ID, a Search Console verification, and a real production
  domain to point all of the above at.

This document draws that line explicitly so "ready for AdSense" doesn't
quietly become a claim the repo can't back up on its own.

---

## What was done

### Google indexing

1. **Real content moved into the actually-rendered page.** The rich "Why
   use PortifyCV" and feature copy previously lived only in the `#seo-landing`
   block in `index.html`, which `src/main.jsx` removes (`seoLanding.remove()`)
   before React ever renders — meaning Googlebot, which executes JavaScript
   and indexes the post-render DOM, never actually saw that content. It now
   lives in `src/pages/LandingPage.jsx` itself: a "Why use PortifyCV" section
   (3 cards) and a 6-question FAQ section, both real React-rendered content,
   in English and Finnish. The static `#seo-landing` fallback (for non-JS
   crawlers and the brief pre-hydration window) was updated to match, so
   there's no mismatch between what a JS-executing crawler sees and what a
   non-JS one sees.
2. **FAQPage structured data.** Added a `FAQPage` JSON-LD block to
   `index.html` matching the new FAQ section, alongside the existing
   `SoftwareApplication` block — both are eligible for rich results.
3. **Sitemap expanded.** `public/sitemap.xml` previously listed only `/`.
   Added `/cv` and `/privacy` with `lastmod` dates.
4. **Per-route canonical URL, title, and meta description.** This was a
   real bug, not just a gap: `index.html` is one static file shared by
   every route (`/`, `/cv`, `/privacy`), so its `<link rel="canonical">`
   was hardcoded to the homepage URL on every route. A canonical tag on
   `/cv` pointing at `/` tells Google "the real version of this page is the
   homepage" — which would have suppressed `/cv` and `/privacy` from being
   indexed as their own pages even after being added to the sitemap. Fixed
   with a `useDocumentHead(view)` effect in `src/App.jsx` that updates
   `document.title`, the canonical `<link>`, and the meta description on
   view change. Verified in a real browser: `/cv` now reports canonical
   `https://portifycv.app/cv` and its own title/description; `/privacy`
   reports its own.
5. **Fixed missing SPA routing fallback.** Neither `public/_redirects`
   (Netlify) nor a `rewrites` block in `vercel.json` (Vercel) existed
   before this pass — meaning a direct visit, a page refresh, or a crawler
   fetching `/cv` or `/privacy` would most likely 404 in production, even
   though the in-app pathname check for those routes already worked for
   client-side navigation. Both are now configured. `npm run build` already
   copied `dist/index.html` to `dist/404.html` for GitHub Pages' equivalent
   workaround — that part predates this pass.

### AdSense readiness

6. **Privacy policy page**, `src/pages/PrivacyPolicyPage.jsx` at `/privacy`,
   linked from the footer on every view. Covers: what data PortifyCV does
   and doesn't collect (verified against actual code — only two
   `localStorage` keys exist app-wide, `ui-locale` and
   `portifycv-onboarding-seen`; no CV content is ever persisted or
   transmitted), a cookies/advertising section that discloses Google
   AdSense usage **in advance** (written to stay accurate the day
   advertising is switched on, not just the day it's read), a children's
   privacy note, and a contact address. This exists specifically because
   Google reviews the privacy policy as part of the AdSense application —
   it needs to already disclose ad-cookie usage at application time, before
   any ad actually renders.
7. **Consent banner + gated AdSense loader**, `src/components/ConsentBanner.jsx`
   and `src/components/AdSenseLoader.jsx`, wired into `src/App.jsx` on every
   view. Both read a single `VITE_ADSENSE_CLIENT_ID` env var:
   - **Unset (today's state):** the banner never renders and no script is
     ever injected. Verified in a real browser — no `.consent-banner`
     element in the DOM, no `<script>` requested from
     `pagead2.googlesyndication.com`, nothing written to `localStorage`
     under the consent key. The "no data saved" claim stays true because
     nothing ad-related runs at all.
   - **Set:** the banner appears once (until the visitor accepts or
     rejects), the choice is stored locally (`portifycv-ad-consent`), and
     the real AdSense loader script only injects after "Accept". Verified
     with a throwaway fake client ID (`ca-pub-0000000000000000`) — banner
     rendered, Accept dismissed it, the script tag appeared in `<head>`
     with the configured client ID in its `src`, and the consent choice
     persisted.
8. **No fabricated `ads.txt` or AdSense verification meta tag.** Both
   require a real publisher ID from Google, which doesn't exist yet.
   Publishing a placeholder `ads.txt` risks it being crawled and cached
   before it's replaced with real content — worse than not having one.
   See "What still needs you" below for the exact steps once a publisher ID
   exists.

---

## Verification results

- `npm run lint` — clean.
- `npm run build` — succeeds.
- `npm run check:reducers` — 54/54 pass.
- `npm run check:share` — 15/15 pass.
- `npm run test:e2e` — 14/14 pass, unaffected by this pass's changes.
- Manual browser verification (Playwright + `javascript_tool`, not just
  reading source): canonical/title/description per route confirmed
  correct on `/`, `/cv`, `/privacy`; consent banner confirmed dormant with
  no env var and confirmed functional with a throwaway fake client ID;
  `/privacy` and the expanded landing page visually reviewed via
  screenshot.

---

## What still needs you

Nothing below can be done from inside this repository — each needs your
own Google account, a real domain, or a business decision only you can
make.

1. **Apply for Google AdSense** at [adsense.google.com](https://adsense.google.com)
   once the site is deployed to its real domain. Google reviews the live
   site (content, privacy policy, navigation) as part of approval.
2. **On approval**, Google gives you a publisher ID (`pub-XXXXXXXXXXXXXXXX`)
   and an ad script snippet. Set it as `VITE_ADSENSE_CLIENT_ID` (full
   format: `ca-pub-XXXXXXXXXXXXXXXX`) in your host's build environment
   variables (Netlify/Vercel project settings) — not committed to the repo,
   since it varies by environment and there's no reason to hardcode it.
   The consent banner and loader activate automatically the next time the
   site builds with that variable set; no code change needed.
3. **Add a real `public/ads.txt`** with the exact line Google gives you
   (typically `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`).
4. **Update the placeholder contact address** in
   `src/pages/PrivacyPolicyPage.jsx` (`privacy@portifycv.app`) to a real,
   monitored address — a dead mailbox on a privacy policy is a real gap,
   not a cosmetic one.
5. **Confirm the real production domain** and update it everywhere
   `portifycv.app` is currently used as a placeholder: `index.html`
   (canonical, OG, Twitter, JSON-LD, and the `SITE_ORIGIN` constant in
   `src/App.jsx`), `public/sitemap.xml`, `public/robots.txt`. The README's
   "Google SEO Setup" section already documents this swap.
6. **Google Search Console**: add the production domain, verify ownership,
   submit `https://<your-domain>/sitemap.xml`. Also documented in the
   README.
7. **Decide on EEA/UK consent scope.** The current `ConsentBanner` is a
   simple accept/reject notice, which covers Google's baseline EU User
   Consent Policy requirement. If you want IAB TCF-certified consent
   signals (some ad networks and a stricter reading of GDPR expect this),
   that requires an actual CMP (e.g. Google's Funding Choices) — a bigger
   integration than this pass's scope, and not something to add
   speculatively before there's a real ad account to configure it against.
