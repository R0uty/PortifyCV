# SEO audit — "Alternate page with proper canonical tag" — 1.6.87 (2026-11-14)

**Status (2026-11-14):** report only; nothing changed. Verdict: all 69
reported URLs are expected. No bug found; no fix is required.

Scope: the 69 URLs Search Console lists for portifycv.app under
"Vaihtoehtoinen sivu, jossa on oikea ensisijainen tagi" (Alternate page
with proper canonical tag), last crawled 24.10.-6.11.2026. Code read at
`origin/main` `1491ac9` (1.6.87). "Live" means fetched with `curl` (no
JavaScript) from https://portifycv.app today.

## What the status means

Google crawled the URL, read its `<link rel="canonical">`, agreed with it,
and indexes the canonical URL instead. The note "not indexed" applies to
the variant URL only, not to the page it points at. It is a status, not an
error, and it is the intended result of a canonical tag.

## The affected URLs

Every one of the 69 is a query-string variant of a real route. None is a
`/fi` hreflang problem, a `www`/http variant, a trailing-slash or
upper-case variant, a `/cv` URL, or a sitemap URL.

| Group | Count | Example |
| --- | --- | --- |
| Template page `?field=tech` | 36 (18 EN + 18 FI) | `/free-cv-templates/compact?field=tech` |
| Template list `?field=tech` | 2 | `/free-cv-templates?field=tech`, `/fi/ilmaiset-cv-pohjat?field=tech` |
| Template page `?example=<id>` | 23 (11 EN + 12 FI) | `/free-cv-templates/developer?example=data-engineer` |
| Template page `?style=<look>` | 8 (4 EN + 4 FI) | `/free-cv-templates/creative?style=violet` |

## What the live pages return

Checked for all 69 (script, not by eye):

- Status `200`, no redirect, no `X-Robots-Tag` or `Link` header.
- `<link rel="canonical">` is the same URL without the query string, e.g.
  `/fi/ilmaiset-cv-pohjat/compact?example=it-support` →
  `https://portifycv.app/fi/ilmaiset-cv-pohjat/compact`.
- `<meta name="robots" content="index, follow">`.
- `hreflang` `en`, `fi` and `x-default` all present, query-free, and the
  same set on the English and the Finnish page (reciprocal).

This is what the route should emit: `worker/index.js` builds the canonical
from `head.path` alone (`${SITE_ORIGIN}${head.path}`), so a query string
never reaches it.

Sitemap: all 65 URLs in the live `sitemap.xml` return a self-referencing
canonical, and none carries a query string. The "in the sitemap but
canonical points elsewhere" bug does not exist.

## Where Google finds these URLs

They are the site's own internal links, so Google will keep seeing them.

- **`?example=` (23) and `?style=` (8), plus the two list URLs:** plain
  `<a href>` in the prerendered HTML. `?style=` from the landing page's
  template strip (`/` and `/fi`); `?example=` from the CV example pages
  (`templatePageLink()` in `src/utils/pageMeta.js`); `?field=tech` on the
  list from the IT, developer and cybersecurity example pages
  (`fieldSearch('tech')`).
- **Template page `?field=tech` (36):** not in any prerendered HTML. They
  exist only after JavaScript runs on `/free-cv-templates?field=tech`,
  where each card link carries the filter (`cardSearch()` in
  `src/pages/FreeCvTemplatesPage.jsx`, added in 1.6.16 so Back returns to
  the filtered list). Googlebot renders JavaScript, which is how it found
  all 18 in each language.

One more is linked but not in the report yet:
`/free-cv-templates/european?example=teacher` (the Finnish twin is
listed). Expect it to appear; it is the same case.

## Verdict

| Group | Expected? | Action |
| --- | --- | --- |
| `?field=tech` template pages (36) | Yes | None |
| `?field=tech` list pages (2) | Yes | None |
| `?example=` (23) | Yes | None |
| `?style=` (8) | Yes | None |

Real problems: none.

## Not recommended

- **Blocking the parameters in `robots.txt`.** Google could then no longer
  read the canonical, and the URLs would move to "Blocked by robots.txt"
  or be indexed without content.
- **`noindex` on parameter URLs.** It conflicts with the canonical signal
  and gains nothing.
- **Removing the query strings from the links.** They are features (open
  a template on an example, a look, or keep the field filter). The report
  count is cosmetic and the site is far too small for crawl budget to
  matter.

## Worth a look in Search Console (owner only)

This audit cannot see Google's index. To confirm the canonical targets
themselves are indexed, check the bare URLs with "Tarkista URL", e.g.
`https://portifycv.app/free-cv-templates/compact` and
`https://portifycv.app/fi/ilmaiset-cv-pohjat/compact`. If a bare template
page shows as not indexed, that is a separate question from this report.
