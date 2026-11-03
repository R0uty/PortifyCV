# AdSense readiness audit — live site v1.6.65 (2026-11-03)

Scope: the live site at portifycv.app (v1.6.65, same as `origin/main`), all
65 sitemap URLs fetched with a Mediapartners-Google user agent, plus a manual
pass in a browser at 1366×900 and 375×812. Goal: clear the "low-value
content" (Vähäarvoinen sisältö) rejection from 2026-10-22.

## What is already in good shape

These are not the cause of the rejection. Leave them as they are.

- **Policy plumbing:** `ads.txt` is correct. `robots.txt` allows all. The
  AdSense script loads on every content page and not on `/cv` or 404. The
  Funding Choices (GDPR) message loads. The privacy policy has the Google
  third-party cookie disclosure and links to adssettings and partner-sites.
  About and Contact pages exist.
- **Crawlable content:** every route returns prerendered HTML with its own
  title, canonical, description and hreflang. All 69 internal links return
  200.
- **Volume and uniqueness:** content pages have 600–1,700 words each (the
  shared nav and footer are about 100 words). The 18 English template pages
  share almost no text with each other: average 5-gram Jaccard 0.01, max
  0.03. These are not duplicate doorway pages.
- **Page quality:** the guides read well, show "Updated … · N min read", and
  have a table of contents. The landing page has a clear H1, How it works,
  templates by field, guides, and an FAQ.

## Why it is probably still "low value" — ranked

### 1. Google hasn't indexed the content yet (most likely cause)
As of 2026-10-27, Search Console showed **~2 indexed pages** and 15 pages
"crawled – currently not indexed". Most of the content work (PRs #5, #9,
#10–#12) went live after the first rejection. AdSense judges the site
mostly as Google sees it. If Google indexes 2 pages, it sees a CV tool with
a landing page.
- **Do:** in Search Console, request indexing for the guides and template
  pages and click *Validate fix* on "crawled – not indexed". Wait until at
  least 40 of the 65 URLs show as indexed. Then request the AdSense review,
  about 3–4 weeks after the last big content deploy. Re-applying sooner
  mostly burns a review.

### 2. Content-to-tool ratio: most URLs are generated from one template
Of the 65 URLs, 36 are template pages (18 templates × EN/FI) from one page
component. 4 more are the hub, landing, about and privacy pages, in both
languages. Only **11 topics** are free-standing editorial articles. A
reviewer clicking around sees the same template-page layout many times. The
copy differs, but each page still reads as "product page for template X".
- **Do (highest value):** build per-role example pages from the people that
  already exist. `src/utils/examples/` has **25 example CVs** (nurse,
  teacher, chef, accountant, sales manager, project manager, journalist, …),
  but only developer/IT/cybersecurity/Finnish have their own pages. For each
  role, write 800–1,200 words: what recruiters in that field look for, a
  sample summary, 6–8 example bullets, a skills list, mistakes to avoid, and
  the rendered example CV. 10–15 of these, in EN first, roughly doubles the
  editorial base with content people actually search for. (This "role pages
  pilot" was deferred while waiting for Search Console data. It is now the
  most useful content lever.)
- **Do:** add 4–6 standalone guides that a CV-tool user needs and that no
  template page covers: CV vs résumé, CV with no experience, how long a CV
  should be, employment gaps, a CV for career changers, and a CV in Finland
  for international applicants (the Finnish angle is a real differentiator).

### 3. Example people all share one identity
Every example CV is "John Doe", `john.doe@example.com`, `0123456789`, and
`*.example.com` links (25 example files, rendered on every template page).
A reviewer sees the same placeholder person on 36+ pages. That reads as
filler and makes the examples feel like lorem ipsum instead of worked
examples. *The user declined distinct names on 2026-10-25.* Worth
reconsidering in this context only: realistic but clearly fictional names
per role (e.g. "Aino Virtanen, Registered Nurse") make each example look
like real editorial work. Keep `example.com` addresses.

### 4. No visible authorship on the guides
The guides carry a date but no author. About says "an independent,
one-developer project" with no name. The user chose to keep "PortifyCV" as
the identity. A middle ground that still helps E-E-A-T: an "Editorial
standards / How we write our guides" section on About (sources: Finnish
TE-palvelut/Työmarkkinatori guidance, what was checked in the app), plus a
"Written and reviewed by PortifyCV" byline that links to it.

### 5. Ads on pages with little publisher content
Ads load on `/about` (≈300 own words), `/fi/tietoa`, `/privacy` and
`/fi/tietosuoja`. That isn't a policy breach, but those pages add nothing
to the "value" signal, and AdSense guidance prefers ads only next to real
content. Excluding them is cheap and costs nothing in revenue.
- **Do:** extend the 1.6.48 "no ads on /cv + 404" rule to about/privacy in
  both locales.

## UI / frontend findings

| # | Area | Finding | Impact |
|---|---|---|---|
| U1 | All content pages | `src/main.jsx` removes the prerendered `#seo-landing` before the lazy page chunk loads. For a moment the page shows only the header and footer, and the template preview area is blank for about 1–3 s. A reviewer's first impression can be an empty page. | High (first impression) |
| U2 | Builder, phone | The toolbar is sticky and **247 px tall at 375×812 (30% of the screen)**: back/undo, mode switch, template, colour, font, headings, locale, device, fullscreen, settings, share, export. Editing space is a small window. Collapse secondary controls into one "Design" sheet. | High (phone users) |
| U3 | Every page | The footer bar ("No login. No data saved. v1.6.65 · About · Privacy · Contact") is `position: sticky`, so it always takes 52 px at the bottom. Auto ads' anchor ad also docks to the bottom edge, so the two will stack or overlap. Make it a normal footer. | Medium |
| U4 | Brand | The logo mark is a small clip-art document icon with serif "PortifyCV" text. It looks different from the polished Inter-based UI around it, and on phone it is the most visible element in the header. A plain wordmark in the site's type would look more trustworthy. | Medium (trust) |
| U5 | Copy | The hero eyebrow "No login. No data saved." and the FAQ appear next to ad cookies. The privacy page explains this accurately, but the slogan should say "your CV never leaves your browser" rather than "no data saved". | Low (policy-adjacent) |
| U6 | Builder | Earlier, still open: heavy grey Export/zoom buttons, square Classic buttons, oversized Classic panel headings, cover-letter buttons active when empty, toolbar template-name ellipsis, phone Classic preview reflows. | Low–Medium |

## Suggested order

1. Search Console: request indexing and validate the fix now. No code
   needed.
2. U1 (keep prerendered content until the page mounts), U3 (non-sticky
   footer), and no ads on about/privacy. Small and quick.
3. Role example pages, 10–15 in EN, then FI, plus 4–6 standalone guides.
4. Optional: distinct example identities, editorial-standards section and
   byline.
5. U2 phone toolbar and logo.
6. Re-apply to AdSense once at least 40 URLs are indexed and the new
   content has been live for about 3–4 weeks.
