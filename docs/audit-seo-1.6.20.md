# SEO / content audit — 1.6.20 (2026-10-12)

Scope: every public route's copy and metadata against what the app actually
does at 1.6.20 (main `e0898a0`). Report first; nothing here is fixed yet.
Previous pass: `todo.md` item 31 (2026-08-20), which also recorded the
decision not to build thin SEO pages; nothing below proposes new pages.

Verified against code, not assumed. "Live" means checked with `curl` on
https://portifycv.app today.

## Already fine

- **Sitemap coverage:** `public/sitemap.xml` lists all 33 real routes (15
  static + 18 template pages), matching `VIEW_HEAD` exactly. `robots.txt`
  is correct.
- **Template counts in React pages** read `cvTemplates.length` (18)
  everywhere; no hard-coded count in `src/`.
- **Titles/descriptions are unique** across all 33 routes; no duplicates.
- **Finnish parity:** every content page has the same number of sections,
  steps, links and FAQ items in `fi` as in `en`.
- **Field-specific claims hold:** Hack The Box / TryHackMe link fields,
  certificate expiry field, "fewer than four skills" (`MIN_SKILL_COUNT = 4`),
  keyword skill grouping, the deterministic (non-AI) cover letter generator,
  and the image-only PDF caveat are all still true.

## Findings

### Stale or wrong (fix recommended)

**S1. `index.html` static content is out of date, and crawlers see it on
every route.** Live: `curl /free-cv-templates/developer` returns
`<h1>Build a Free CV in Minutes</h1>`, "all 13 templates" and "PDF, HTML,
or JSON". The worker rewrites only `<head>`, so the `#seo-landing` block
(landing copy and FAQ) ships in the HTML of all 33 routes. In
`index.html`:
- "all 13 templates" ×2 (FAQPage JSON-LD and `#seo-landing`). There are 18.
- Export lists omit Word: meta description, SoftwareApplication JSON-LD,
  FAQ JSON-LD, and the `#seo-landing` "Your data stays yours" and FAQ text.
  The landing route's `VIEW_HEAD` description already includes Word, so the
  raw `index.html` and the worker output disagree.
- FAQPage JSON-LD (landing only) no longer matches the visible FAQ in
  `LandingPage.jsx`, which says 18 and includes Word. Google expects FAQ
  markup to match visible content.
- Fix: update the text (small). Optional, larger: have the worker swap
  `#seo-landing`'s `<h1>`/intro for each route's own title/description, so
  a non-JS crawler doesn't see landing copy on every page (see O4).

**S2. The "what we store" answers are wrong in three places.** The code
stores **five** localStorage preferences: language (`ui-locale`),
onboarding-seen, session-restore on/off, builder mode (Direct Edit/Classic,
`portifycv-builder-mode`, since 2026-09-14), and nav-rail collapsed
(`portifycv-nav-rail-collapsed`). The app no longer stores an
advertising-cookie choice: the consent loader was deleted and Google's
message now stores that itself.
- Landing FAQ (EN+FI), `index.html` FAQ JSON-LD and `#seo-landing`: "four
  … your advertising-cookie choice".
- Privacy policy (EN+FI): "three small preferences", listing only three.
- This is a privacy-accuracy issue, not just SEO. Fix: list all five; none
  holds CV content (still true).

**S3. "How to Use the CV Builder" describes only Classic mode, but new
visitors land in Direct Edit.** `uiReducer` defaults to `'direct'`. The
guide's step 1 says "rail on the left, form in the middle, preview on the
right". In Direct Edit there is no form: you click the CV itself, and the
section pencils open a popup. Steps 2 and 4 (inline bullet flags, the "ATS
score & suggestions" panel) exist only in Classic. The guide never mentions
Direct Edit, the Classic/Direct Edit switch, the three looks per template,
or the cover letter. Fix: rewrite step 1 around Direct Edit, say that steps
2 and 4 live in Classic (one click on the toolbar switch), add looks to the
template step, and update `dateModified`. The step figures
(`BuilderWalkthroughFigure`) illustrate the Classic layout; step 1's needs
a Direct Edit variant or a caption change (decide in review).

**S4. The ATS guide says "toggle the mode on in Settings", which does
nothing in the default mode.** `ResumeBuilderPage.jsx:901`: Direct Edit
forces ATS mode off for both preview and export. A visitor following the
guide in Direct Edit gets a styled PDF. Fix: "switch to Classic in the
toolbar, then turn on ATS-friendly mode". The same wording is on the Free
CV Templates page ("switch on ATS-friendly mode from any template") and in
the checklist. *Product note, not SEO:* the Settings toggle stays visible
in Direct Edit with no effect, which may be worth its own small fix (it
could say "applies in Classic mode").

**S5. The ATS guide's export section ignores Word export.** It says HTML is
the only export with real, selectable text. Word (.docx, shipped
2026-09-13) is built from CV data with real text runs (`docxExport.js`),
and .docx is the format most ATS uploads accept. Caveat, to state
honestly: 12 of the 18 templates export to Word as a 2-column table
(`docxArchetypes.js`: rail/sidebar/grid tables), which the guide itself
warns parsers can misread. The one-column archetype is used by Minimalist,
Compact, Classic Professional, Editorial, Modern Timeline and Portrait.
Fix: rewrite that section and the checklist item to recommend Word export
from a one-column template, or HTML.

**S6. Article `dateModified` is never set.** All 10 guide pages emit
`dateModified = datePublished` (2026-08-20/09-01), although most have
changed since (git: HowToUse 09-12, ATS 08-29, CoverLetter 10-06,
Developer/IT/Cyber 10-11). Fix: add `dateModified` to each `VIEW_HEAD`
entry that the content pass changes (and to ones already changed).

**S7. Sitemap `lastmod` is stale.** Examples: `/free-cv-templates`
2026-08-20 (filters shipped 10-11, looks 10-10); all 18 template pages
2026-10-01 (looks, examples, filters since); `/` 2026-08-11 (landing strip
looks 10-11, copy 10-04); `/cv` 2026-08-11 (Direct Edit). Fix: set each
URL to the date of its last real content change (git log per page). Only
set dates that are true; Google ignores lastmod it learns to distrust.

### Missing internal links and content (recommended)

**L1. No content page links to a single template page.** The 18
`/free-cv-templates/<slug>` pages, each with full example CVs (25 example
people, `exampleCvs.js`), are reachable only from the templates grid and
gallery. Pages that name a template in prose without linking it:
- Developer CV examples: "The Developer template has a dark sidebar…" and
  CTA "Start with the Developer template" → link
  `/free-cv-templates/developer`.
- Finnish CV examples: "Minimalist, Classic Professional, and Navy
  Professional…" → link all three.
- CV Examples hub: "why the Developer template is built for exactly this".
- Fix: turn those names into `templatePath(slug)` links. Small, no new copy.

**L2. "CV examples" pages don't show or link to any full example CV.** The
hub and the four field pages have only bullet snippets, while full,
bilingual example CVs exist on the template pages and can be deep-linked
with `?example=` (`TemplateDetailPage.jsx:63`). Real fits:
- Developer → `developer?example=frontend-developer`, `data-engineer`,
  `junior-developer` (Graduate).
- Cybersecurity → `minimalist?example=cybersecurity-analyst` (also Compact).
- IT → `tech-executive?example=engineering-director`/`cto` is a weaker fit;
  no dedicated IT-support example exists. Suggest linking the Tech filter
  only (already there since 1.6.14).
- Finnish → `european?example=nurse`/`teacher` (Europass is common in
  Finland), viewable in Finnish via the locale.
- Hub → a short "Full example CVs" row linking the template pages by role.
- Recommend a "See a full example" link per page (one line each, EN+FI),
  not new pages.

**L3. Looks and Direct Edit are absent from evergreen copy.** The landing
highlights, About ("What PortifyCV is"), the SoftwareApplication JSON-LD
and the Free CV Templates intro never say each template has three looks
(palette, font, heading colour) or that you can edit directly on the CV.
These are the two biggest features since August. Recommend one clause
each: landing highlight, About paragraph, templates intro, JSON-LD
description. No new sections.

### Metadata polish (optional)

**M1. Landing `<title>` is "PortifyCV - CV Builder".** It has no "free";
`og:title` already says "PortifyCV - Free CV Builder". Suggest "PortifyCV -
Free CV Builder, No Login" (31 chars) for both. Brand-facing, so your call.

**M2. Two template titles exceed 60 chars.** Classic Professional (61) and
Modern Professional (60); Google truncates around 60. Could drop " - Free,
No Login" only when it would overflow, or shorten the shared suffix to
"Free CV Template - PortifyCV" for all 18. Changes 18 titles, so it's your
call; slugs are untouched.

**M3. How-to-use description is 179 chars** (others are 89–153). Trim to
about 155 and mention Direct Edit (ties to S3).

**M4. Template meta descriptions vs looks:** Creative, Executive, Timeline
and Compact say "one customizable accent color". The accent picker still
exists (SettingsModal), so that's true, but each template now also has
three looks. Optional: add "three looks" to the descriptions where it fits
the ~160-char budget. Navy Professional's "ATS-friendly two-column layout"
sits awkwardly beside the ATS guide's "multi-column breaks parsers"; its
ATS mode renders a simplified version. Suggest dropping "ATS-friendly" there.

### Optional / larger

**O4. Per-route crawler body.** See S1. The worker could replace
`#seo-landing`'s `<h1>` and first `<p>` with the route's title and
description, and drop the landing FAQ block on non-landing routes (as it
already drops `#ld-faq`). Moderate worker change. The e2e suite doesn't
run the worker, so this needs a `wrangler dev` check. Google renders JS,
so the benefit is mainly other crawlers and link-preview bots; worth doing
but separable.

## Suggested grouping into releases

1. **1.6.21 — accuracy:** S1 text, S2, S4, S5 (stale and wrong claims, incl.
   privacy).
2. **1.6.22 — builder guide:** S3 (+ M3).
3. **1.6.23 — internal links:** L1, L2, L3.
4. **1.6.24 — metadata:** S6, S7, plus whichever of M1/M2/M4 you approve.
5. Later, if wanted: O4.
