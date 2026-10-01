# Template Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the 18 CV templates a public page at `/free-cv-templates/<slug>`. Each page shows a live preview of 2–3 example CVs you can switch between, and has a "Use this example" button that opens the builder with that template and example loaded.

**Architecture:** One `VIEW_HEAD` entry per template is generated from `cvTemplates.js`. The client router (`App.jsx`) and the Cloudflare worker already resolve exact paths from `VIEW_HEAD`, so all 18 routes, their metadata, and their 404/redirect handling come for free. A single lazy `TemplateDetailPage` renders every template. Example CVs live in a shared pool of 24 people, one module per person exporting `{ en, fi }`, and each is loaded with a dynamic `import()`. The builder accepts `?example=` but never overwrites a restored session.

**Tech Stack:** React 19 + Vite, hand-written utility CSS, Playwright e2e, framework-free Node check scripts (`scripts/*.mjs`), Cloudflare Workers.

**Spec:** `docs/superpowers/specs/2026-10-01-template-pages-design.md`

## Global Constraints

- Branch `v1.4.0` (cut from `v1.3.0`). Never merge into `main` without a PR and the user's explicit approval.
- Commits carry the user's name only. **No `Co-Authored-By: Claude` line** (user rule, overrides any default attribution).
- After each task, bump the patch version (`npm version 1.3.<n> --no-git-tag-version`) in its own standalone commit `Bump version to 1.3.<n>`. Task 13 sets `1.4.0`.
- Slugs are public URLs and are permanent once shipped. Never rename one.
- Bilingual: every user-facing string has `en` and `fi`. Follow the repo idiom: an `isFinnish ? '…' : '…'` pair or a `getCopy(locale)` object, not an i18n library.
- `VIEW_HEAD` titles and descriptions are English-only, like every existing route, because the worker serves them before any locale is known.
- Example people are fictional. Emails end in `@example.com`, phones use `+358 40 000 xxxx`, and there are no real photos. Photo templates get the existing placeholder silhouette on the template page only, never in the builder.
- No new runtime dependencies.
- Utility class names follow the existing hand-written Tailwind-alike layer. Put new component CSS in `src/styles/app-shell.css` next to `.templates-page-*`.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/utils/cvTemplates.js` | modify | add `slug` to each template, plus `getTemplateSlug(id)` |
| `src/utils/routes.js` | modify | `templatePath(slug)` |
| `src/utils/templatePageCopy.js` | create | per-template `metaDescription` (en) and `bestFor` / `tips` (en+fi) |
| `src/utils/pageMeta.js` | modify | generate `template:<id>` `VIEW_HEAD` entries; `buildTemplatePageSchema` |
| `worker/index.js` | modify | emit the BreadcrumbList JSON-LD for `schema: 'template'` |
| `src/App.jsx` | modify | render `TemplateDetailPage` for `template:*` views; JSON-LD branch; `goToBuilder(templateId, exampleId)` |
| `src/utils/thumbnailCv.js` | modify | export `withPlaceholderPhoto(cv)` (extracted from `buildThumbnailCv`) |
| `src/utils/examples/buildExampleCv.js` | create | merge an example's content over `createInitialCvData()` |
| `src/utils/examples/<exampleId>.js` | create ×24 | one example person, `export default { en, fi }` |
| `src/utils/exampleCvs.js` | create | example registry, template→examples mapping, loaders |
| `src/components/ScaledPreview.jsx` | create | full `CVPreview` scaled to its container width, with height kept |
| `src/pages/TemplateDetailPage.jsx` | create | the page |
| `src/pages/FreeCvTemplatesPage.jsx` | modify | link each card to its page |
| `src/pages/ResumeBuilderPage.jsx` | modify | `?example=` handoff with session-snapshot guard |
| `src/styles/app-shell.css` | modify | `.template-page*` styles |
| `public/sitemap.xml` | modify | 18 new `<url>` entries |
| `scripts/check-template-pages.mjs` | create | `check:template-pages` |
| `package.json`, `.github/workflows/ci.yml` | modify | register and run the new check |
| `e2e/template-pages.spec.js` | create | e2e coverage |

## Reference: slugs (permanent)

| templateId | slug |
|---|---|
| minimal | minimalist |
| developer | developer |
| creative | creative |
| modern | modern-professional |
| executive | executive |
| timeline | modern-timeline |
| graduate | graduate |
| compact | compact |
| portfolio | portfolio-hybrid |
| techExec | tech-executive |
| classicProfessional | classic-professional |
| navyProfessional | navy-professional |
| modernOrange | modern-orange |
| colorfulCompact | colorful-compact |
| quadrant | quadrant |
| editorial | editorial |
| portrait | portrait |
| european | european |

## Reference: example roster (24 people)

The template→example mapping. Order matters: the first listed is the page's default example. The stress cases are deliberate, and Phase 2 depends on them.

| templateId | examples |
|---|---|
| minimal | nurse, accountant, cybersecurity-analyst |
| developer | frontend-developer, data-engineer, junior-developer |
| creative | ux-designer, graphic-designer |
| modern | marketing-manager, project-manager, product-manager |
| executive | finance-director, operations-manager, engineering-director |
| timeline | project-manager, teacher, operations-manager |
| graduate | junior-developer, business-graduate |
| compact | data-engineer, cybersecurity-analyst, business-graduate |
| portfolio | frontend-developer, ux-designer, product-manager |
| techExec | engineering-director, cto |
| classicProfessional | accountant, finance-director, research-scientist |
| navyProfessional | cto, sales-manager, research-scientist |
| modernOrange | marketing-manager, ux-designer, customer-success |
| colorfulCompact | graphic-designer, customer-success |
| quadrant | marketing-manager, sales-manager, journalist |
| editorial | journalist, research-scientist |
| portrait | brand-specialist, chef, architect |
| european | nurse, teacher, chef |

Roles (`en` / `fi`):

| exampleId | en | fi | stress role |
|---|---|---|---|
| frontend-developer | Frontend developer | Frontend-kehittäjä | |
| data-engineer | Data engineer | Data engineer | **20+ skills** |
| junior-developer | Junior developer | Juniorikehittäjä | **thin: 1 internship, no full-time role** |
| ux-designer | UX designer | UX-suunnittelija | |
| graphic-designer | Graphic designer | Graafinen suunnittelija | |
| marketing-manager | Marketing manager | Markkinointipäällikkö | |
| project-manager | Project manager | Projektipäällikkö | |
| product-manager | Product manager | Tuotepäällikkö | |
| finance-director | Finance director | Talousjohtaja | **6 roles, two-page history** |
| operations-manager | Operations manager | Operatiivinen päällikkö | |
| engineering-director | Engineering director | Kehitysjohtaja | |
| cto | Chief technology officer | Teknologiajohtaja | **long name: "Maximilian Alexander Vandenberg-Lindqvist"** |
| nurse | Registered nurse | Sairaanhoitaja | |
| accountant | Accountant | Kirjanpitäjä | |
| cybersecurity-analyst | Cybersecurity analyst | Kyberturvallisuusanalyytikko | |
| teacher | Teacher | Opettaja | |
| business-graduate | Business graduate | Kauppatieteiden vastavalmistunut | |
| research-scientist | Research scientist | Tutkija | |
| sales-manager | Sales manager | Myyntipäällikkö | |
| customer-success | Customer success manager | Asiakkuuspäällikkö | |
| journalist | Journalist | Toimittaja | |
| brand-specialist | Brand specialist | Brändiasiantuntija | |
| chef | Head chef | Keittiöpäällikkö | |
| architect | Architect | Arkkitehti | |

Each person must fill **every section in the `primarySections` of every template they're listed under**, in both locales. The check script's content rules (added in Task 4) list the missing sections per person, so run it while writing content.

---

### Task 1: Slugs, routes, and the check script

**Files:**
- Create: `scripts/check-template-pages.mjs`
- Modify: `src/utils/cvTemplates.js` (each entry in `templateMap`; exports near `getCvTemplate`)
- Modify: `src/utils/routes.js`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `templateMap[id].slug: string`; `getTemplateSlug(templateId: string): string | null`; `templatePath(slug: string): string` → `/free-cv-templates/<slug>`; `npm run check:template-pages`.

The check script grows across tasks: each later task appends its own rules to it. Rules that need files that don't exist yet are added in the task that creates those files, so the script passes at the end of every task.

- [ ] **Step 1: Write the failing check**

Create `scripts/check-template-pages.mjs`:

```js
// Regression checks for the per-template pages (/free-cv-templates/<slug>):
// slugs, routes, metadata, example CVs, and page copy. Framework-free,
// run directly:
//
//   node scripts/check-template-pages.mjs

import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const rootDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = resolvePath(rootDir, 'src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

const { cvTemplates, getTemplateSlug } = await importSrc('utils/cvTemplates.js')
const { templatePath } = await importSrc('utils/routes.js')

// --- Slugs -----------------------------------------------------------------
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const slugs = cvTemplates.map((template) => template.slug)
const badSlugs = cvTemplates.filter((template) => !SLUG_RE.test(template.slug ?? ''))
check('every template has a kebab-case slug', badSlugs.length === 0, badSlugs.map((t) => t.id).join(', '))
check('slugs are unique', new Set(slugs).size === slugs.length)
check(
  'getTemplateSlug resolves every template id',
  cvTemplates.every((template) => getTemplateSlug(template.id) === template.slug),
)
check('getTemplateSlug returns null for an unknown id', getTemplateSlug('nope') === null)
check(
  'templatePath nests under /free-cv-templates',
  templatePath('developer') === '/free-cv-templates/developer',
)

if (failures > 0) {
  console.log(`\n${failures} template-page check(s) failed.`)
  process.exit(1)
}
console.log('\nAll template-page checks passed.')
```

Add to `package.json` scripts, after `check:section-columns`:

```json
    "check:template-pages": "node scripts/check-template-pages.mjs",
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run -s check:template-pages`
Expected: it fails, because `getTemplateSlug` and `templatePath` aren't exported yet (an import/TypeError, or FAIL lines on the slug rules).

- [ ] **Step 3: Implement**

In `src/utils/cvTemplates.js`, add a `slug` line directly under each entry's `id:` line, using the slug table above. For example:

```js
  developer: {
    id: 'developer',
    slug: 'developer',
```

```js
  techExec: {
    id: 'techExec',
    slug: 'tech-executive',
```

Above `const templateMap = {` add:

```js
// `slug` is each template's public page URL (/free-cv-templates/<slug>,
// see routes.js templatePath). Slugs are permanent once shipped: renaming
// one breaks every link and search result pointing at it. If a template is
// retired, map its slug to the surviving template instead of deleting it.
```

Below `isValidTemplateId`, add:

```js
export function getTemplateSlug(templateId) {
  return templateMap[templateId]?.slug ?? null
}
```

In `src/utils/routes.js`, after the `ROUTES` object:

```js
// Per-template pages (one per cvTemplates entry, keyed by its permanent
// slug). Not in ROUTES because the list is generated from the template
// registry. See pageMeta.js for the matching VIEW_HEAD entries.
export function templatePath(slug) {
  return `${ROUTES.freeTemplates}/${slug}`
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm run -s check:template-pages && npm run -s lint`
Expected: `All template-page checks passed.` and no lint output.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-template-pages.mjs src/utils/cvTemplates.js src/utils/routes.js package.json
git commit -m "Add permanent slugs and page paths for every template"
npm version 1.3.1 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.1"
```

---

### Task 2: Metadata, structured data, and the sitemap

**Files:**
- Create: `src/utils/templatePageCopy.js`
- Modify: `src/utils/pageMeta.js`
- Modify: `worker/index.js:69-93` (`rewriteForRoute`)
- Modify: `src/App.jsx:13` (import), `src/App.jsx:137-148` (structured-data branch in `useDocumentHead`)
- Modify: `public/sitemap.xml`
- Modify: `scripts/check-template-pages.mjs`

**Interfaces:**
- Consumes: `templatePath`, `getTemplateSlug`, `template.slug`.
- Produces: `TEMPLATE_PAGE_COPY[templateId] = { metaDescription: string, en: { bestFor: string, tips: string[] }, fi: { bestFor, tips } }`; `VIEW_HEAD['template:<id>'] = { title, path, description, templateId, schema: 'template' }`; `buildTemplatePageSchema(head)` → BreadcrumbList object; `TEMPLATE_VIEW_PREFIX = 'template:'`.

`metaDescription` is English-only because `VIEW_HEAD` is. This narrows the spec's "both locales" wording, and the spec is updated to match in Step 6. In this task, `en`/`fi` `bestFor`/`tips` are written for **all 18 templates**; Task 9 only reviews and polishes them. The developer entry is given in full as the reference for tone and length.

- [ ] **Step 1: Add the failing rules to the check script**

Insert before the final `if (failures > 0)` block:

```js
// --- Metadata -----------------------------------------------------------------
const { VIEW_HEAD, buildTemplatePageSchema, TEMPLATE_VIEW_PREFIX } = await importSrc('utils/pageMeta.js')
const { TEMPLATE_PAGE_COPY } = await importSrc('utils/templatePageCopy.js')

for (const template of cvTemplates) {
  const head = VIEW_HEAD[`${TEMPLATE_VIEW_PREFIX}${template.id}`]
  check(`${template.id}: has a VIEW_HEAD entry`, Boolean(head))
  if (!head) continue
  check(`${template.id}: path is templatePath(slug)`, head.path === templatePath(template.slug), head.path)
  check(
    `${template.id}: description is 50–160 chars`,
    head.description.length >= 50 && head.description.length <= 160,
    `${head.description.length} chars`,
  )
  const schema = buildTemplatePageSchema(head)
  check(
    `${template.id}: breadcrumb ends at its own page`,
    schema['@type'] === 'BreadcrumbList'
      && schema.itemListElement.length === 3
      && schema.itemListElement[2].item === `https://portifycv.app${head.path}`,
  )
}

const titles = Object.values(VIEW_HEAD).map((head) => head.title)
check('every VIEW_HEAD title is unique', new Set(titles).size === titles.length)

// --- Page copy ------------------------------------------------------------------
for (const template of cvTemplates) {
  const copy = TEMPLATE_PAGE_COPY[template.id]
  for (const locale of ['en', 'fi']) {
    const localized = copy?.[locale]
    check(
      `${template.id}/${locale}: bestFor and exactly 3 non-empty tips`,
      Boolean(localized?.bestFor?.trim())
        && Array.isArray(localized.tips)
        && localized.tips.length === 3
        && localized.tips.every((tip) => tip.trim().length > 0),
    )
  }
}
const allTips = Object.values(TEMPLATE_PAGE_COPY).flatMap((copy) => copy.en.tips)
check('no English tip is copy-pasted between templates', new Set(allTips).size === allTips.length)

// --- Sitemap ------------------------------------------------------------------
const sitemap = readFileSync(resolvePath(rootDir, 'public/sitemap.xml'), 'utf8')
const missingFromSitemap = cvTemplates.filter(
  (template) => !sitemap.includes(`<loc>https://portifycv.app${templatePath(template.slug)}</loc>`),
)
check('every template page is in sitemap.xml', missingFromSitemap.length === 0, missingFromSitemap.map((t) => t.slug).join(', '))
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run -s check:template-pages`
Expected: an import error for `templatePageCopy.js`, or FAIL on every metadata rule.

- [ ] **Step 3: Create `src/utils/templatePageCopy.js`**

```js
// Copy for the per-template pages (/free-cv-templates/<slug>). Each entry
// is written for that template specifically: who it suits and three
// concrete tips about its own layout. Eighteen pages that differ only by
// template name would read as thin, duplicate content to search engines
// and AdSense review.
//
// metaDescription is English-only, like every VIEW_HEAD description (the
// worker serves it before any locale is known). 50–160 characters;
// check:template-pages enforces the bounds.
export const TEMPLATE_PAGE_COPY = {
  developer: {
    metaDescription:
      'Free Developer CV template: dark sidebar for your stack, project and open-source cards up front. Live examples, no login, PDF and Word export.',
    en: {
      bestFor: 'Software engineers, data and platform engineers, and anyone whose best evidence is things they built.',
      tips: [
        'Lead the main column with two or three projects that have a measurable outcome. The cards give each one room for a link and a stack line.',
        'Keep the sidebar skills list to about twelve items. Past that it runs below the fold of page one and pushes Education onto page two.',
        'Put a GitHub link in Links. The header shows it next to your email, which is where a technical reviewer looks first.',
      ],
    },
    fi: {
      bestFor: 'Ohjelmistokehittäjille, data- ja alustainsinööreille sekä kaikille, joiden vahvin näyttö on itse rakennetut asiat.',
      tips: [
        'Aloita pääpalsta kahdella tai kolmella projektilla, joilla on mitattava tulos. Korteissa jokaiselle mahtuu linkki ja teknologiarivi.',
        'Pidä sivupalkin taitolista noin kahdessatoista kohdassa. Pidempi lista valuu ensimmäisen sivun alaosaan ja työntää Koulutuksen toiselle sivulle.',
        'Lisää GitHub-linkki Linkkeihin. Otsikko näyttää sen sähköpostisi vieressä, josta tekninen arvioija katsoo ensimmäisenä.',
      ],
    },
  },
  // …one entry per remaining template id, same shape. Write each one from
  // that template's actual layout: open it in the builder with the demo CV
  // and note what's distinctive (columns, photo, sidebar capacity, timeline,
  // accent swatch, what ATS mode does to it).
}
```

Then write the other 17 entries in full, for `minimal`, `creative`, `modern`, `executive`, `timeline`, `graduate`, `compact`, `portfolio`, `techExec`, `classicProfessional`, `navyProfessional`, `modernOrange`, `colorfulCompact`, `quadrant`, `editorial`, `portrait` and `european`, before moving on. Rules for each entry:
- `metaDescription`: starts `Free <Label> CV template:`, then names the template's distinctive layout trait, and ends with `no login`. 50–160 characters.
- `bestFor`: one sentence naming 2–4 audiences, matching the roster's examples for that template.
- `tips`: 3 sentences of concrete layout advice that applies to this template only. No generic CV advice.
- `fi`: natural Finnish (see `FinnishCvExamplesPage.jsx` for the register), not word-for-word.

The placeholder comment above must not survive into the commit.

- [ ] **Step 4: Generate the `VIEW_HEAD` entries in `src/utils/pageMeta.js`**

Change the imports:

```js
import { ROUTES, templatePath } from './routes.js'
import { cvTemplates } from './cvTemplates.js'
import { TEMPLATE_PAGE_COPY } from './templatePageCopy.js'
```

Rename the existing `export const VIEW_HEAD = {` to `const STATIC_VIEW_HEAD = {`, keeping its contents unchanged. Below its closing `}` add:

```js
// View key prefix for the per-template pages: `template:developer` etc.
// App.jsx maps every key with this prefix onto TemplateDetailPage.
export const TEMPLATE_VIEW_PREFIX = 'template:'

// One entry per template, generated from the registry so a new template
// gets its page, metadata, worker routing, and 404/redirect handling just
// by being added to cvTemplates.js (plus its copy in templatePageCopy.js,
// which check:template-pages enforces).
const TEMPLATE_VIEW_HEAD = Object.fromEntries(
  cvTemplates.map((template) => [
    `${TEMPLATE_VIEW_PREFIX}${template.id}`,
    {
      title: `${template.label} CV Template - Free, No Login - PortifyCV`,
      path: templatePath(template.slug),
      description: TEMPLATE_PAGE_COPY[template.id]?.metaDescription ?? template.description,
      templateId: template.id,
      schema: 'template',
    },
  ]),
)

export const VIEW_HEAD = { ...STATIC_VIEW_HEAD, ...TEMPLATE_VIEW_HEAD }
```

`STATIC_VIEW_HEAD` entries reference `ROUTES.*`, which is unchanged, so no other edits to that block are needed. Below `buildArticleSchema` add:

```js
// BreadcrumbList for a per-template page: Home › Free CV templates › <Label>.
// The template pages aren't articles, so they don't get Article schema.
export function buildTemplatePageSchema(head) {
  const crumbs = [
    { name: 'PortifyCV', path: ROUTES.landing },
    { name: 'Free CV templates', path: ROUTES.freeTemplates },
    { name: head.title.replace(/ CV Template - .*$/, ''), path: head.path },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_ORIGIN}${crumb.path}`,
    })),
  }
}

// The per-view JSON-LD block, or null when a view has none. Shared by
// App.jsx (client) and worker/index.js (edge), like VIEW_HEAD itself.
export function buildViewSchema(head) {
  if (head.isArticle) return buildArticleSchema(head)
  if (head.schema === 'template') return buildTemplatePageSchema(head)
  return null
}
```

- [ ] **Step 5: Use `buildViewSchema` on the client and at the edge**

`src/App.jsx` line 13: change the import to

```js
import { VIEW_HEAD, SITE_ORIGIN, buildViewSchema } from './utils/pageMeta'
```

Replace the structured-data block in `useDocumentHead` (`const existingScript …` through the closing `}` of the `else if`) with:

```js
    const existingScript = document.getElementById(VIEW_STRUCTURED_DATA_SCRIPT_ID)
    const schema = buildViewSchema(head)
    if (schema) {
      const script = existingScript ?? document.createElement('script')
      script.type = 'application/ld+json'
      script.id = VIEW_STRUCTURED_DATA_SCRIPT_ID
      script.textContent = JSON.stringify(schema)
      if (!existingScript) {
        document.head.appendChild(script)
      }
    } else if (existingScript) {
      existingScript.remove()
    }
```

`NOT_FOUND_HEAD` has neither `isArticle` nor `schema`, so `buildViewSchema` returns null for it, the same as before.

`worker/index.js` line 20: change the import to `import { VIEW_HEAD, SITE_ORIGIN, buildViewSchema } from '../src/utils/pageMeta.js'`. In `rewriteForRoute`, replace the `if (head.isArticle) { … }` block with:

```js
  const schema = buildViewSchema(head)
  if (schema) {
    rewriter.on(
      'head',
      new AppendToHead(`<script type="application/ld+json" id="view-structured-data">${JSON.stringify(schema)}</script>`),
    )
  }
```

- [ ] **Step 6: Sitemap and spec wording**

In `public/sitemap.xml`, insert one block per template directly after the `/free-cv-templates` `<url>` block, in `cvTemplates` order:

```xml
  <url>
    <loc>https://portifycv.app/free-cv-templates/developer</loc>
    <lastmod>2026-10-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

Write out all 18, using the slug table.

In the spec (`docs/superpowers/specs/2026-10-01-template-pages-design.md`), test rule 5, change "a `metaDescription` of 50–160 characters" to "an English `metaDescription` of 50–160 characters (English-only, like every `VIEW_HEAD` description)".

- [ ] **Step 7: Run checks**

Run: `npm run -s check:template-pages && npm run -s lint && npm run -s build`
Expected: all checks ok, no lint output, and the build succeeds. The worker imports `pageMeta.js`, so a broken import shows up in the build.

- [ ] **Step 8: Commit**

```bash
git add src/utils/templatePageCopy.js src/utils/pageMeta.js worker/index.js src/App.jsx public/sitemap.xml scripts/check-template-pages.mjs docs/superpowers/specs/2026-10-01-template-pages-design.md
git commit -m "Generate metadata, breadcrumb schema, and sitemap entries for template pages"
npm version 1.3.2 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.2"
```

---

### Task 3: The page skeleton, routed end to end

**Files:**
- Create: `src/components/ScaledPreview.jsx`
- Create: `src/pages/TemplateDetailPage.jsx`
- Create: `e2e/template-pages.spec.js`
- Modify: `src/utils/thumbnailCv.js`
- Modify: `src/App.jsx` (lazy import list near line 28; `STATIC_PAGES` lookup at line 383)
- Modify: `src/styles/app-shell.css` (after `.templates-page-*` rules, ~line 2580)

**Interfaces:**
- Consumes: `VIEW_HEAD[view].templateId`, `TEMPLATE_VIEW_PREFIX`, `getCvTemplate(id, locale)`, `resolveTemplateAccent(null, id)`, `TEMPLATE_PAGE_COPY`.
- Produces: `<ScaledPreview formData template locale atsFriendlyMode accentColor />`; `withPlaceholderPhoto(cv): CvData`; `<TemplateDetailPage templateId locale onGetStarted onNavigateToView />`.

In this task the page renders the existing demo CV. Real examples arrive in Task 4.

- [ ] **Step 1: Write the failing e2e tests**

Create `e2e/template-pages.spec.js`:

```js
import { test, expect } from '@playwright/test'

// Per-template pages: /free-cv-templates/<slug>. One page component renders
// all 18; routing comes from the VIEW_HEAD entries generated in pageMeta.js.

test.describe('Template pages', () => {
  test('a template page loads directly at its own URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Developer CV template')
    await expect(page).toHaveTitle('Developer CV Template - Free, No Login - PortifyCV')
    await expect(page.locator('.template-page__preview .cv-preview, .template-page__preview [data-export-header]').first()).toBeVisible()
  })

  test('an unknown template slug shows the not-found view', async ({ page }) => {
    await page.goto('/free-cv-templates/not-a-template')
    await expect(page).toHaveTitle('Page Not Found - PortifyCV')
  })

  test('the page carries breadcrumb structured data', async ({ page }) => {
    await page.goto('/free-cv-templates/modern-timeline')
    const schema = JSON.parse(await page.locator('#view-structured-data').textContent())
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement[2].item).toBe('https://portifycv.app/free-cv-templates/modern-timeline')
  })
})
```

Before running: confirm the preview selector against what `CVPreview` actually renders (`grep -n "className=" src/components/CVPreview.jsx | head`), and narrow it to one real root class if `.cv-preview` doesn't exist. Every Showcase renders `[data-export-header]`, so that half of the selector is guaranteed.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test e2e/template-pages.spec.js`
Expected: test 1 fails (no heading; the not-found view renders), test 3 fails. Test 2 may already pass, which is fine: it guards the fallback.

- [ ] **Step 3: Extract `withPlaceholderPhoto` in `src/utils/thumbnailCv.js`**

Add above `buildThumbnailCv`:

```js
// Fills the profile-photo slot with the neutral silhouette, so a
// photo-capable template doesn't render an empty gap in a marketing
// preview. Text-only templates keep the photo hidden. Only for
// previews of sample CVs, never for a user's own CV or the builder.
export function withPlaceholderPhoto(cv) {
  if (cv.photo) {
    return cv
  }

  return {
    ...cv,
    photo: PLACEHOLDER_PROFILE_PHOTO,
    photoVisibilityByTemplate: {
      ...cv.photoVisibilityByTemplate,
      ...Object.fromEntries(PHOTO_FREE_TEMPLATE_IDS.map((id) => [id, false])),
    },
  }
}
```

Replace `buildThumbnailCv`'s `photoFallback` block and its use with:

```js
  const withPhoto = usingDemo ? withPlaceholderPhoto(source) : source

  return {
    ...withPhoto,
    about: (source.about ?? '').slice(0, THUMBNAIL_ABOUT_LENGTH),
```

Leave the rest of the return object as it is.

- [ ] **Step 4: Create `src/components/ScaledPreview.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react'

import CVPreview from './CVPreview'

// Same native width TemplateThumbnail renders at (see its comment): the CV
// lays out at real size, then scales down to the frame. Unlike the
// thumbnail, this shows the WHOLE CV, so the frame's height follows the
// scaled content instead of a fixed A4 crop.
const NATIVE_WIDTH = 780

function ScaledPreview({ formData, template, locale, atsFriendlyMode = false, accentColor }) {
  const frameRef = useRef(null)
  const pageRef = useRef(null)
  const [scale, setScale] = useState(null)
  const [height, setHeight] = useState(null)

  useEffect(() => {
    const frame = frameRef.current
    const pageEl = pageRef.current
    if (!frame || !pageEl) {
      return undefined
    }

    const measure = () => {
      const nextScale = frame.clientWidth / NATIVE_WIDTH
      setScale(nextScale)
      setHeight(pageEl.offsetHeight * nextScale)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(pageEl)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="scaled-preview" ref={frameRef} style={height ? { height } : undefined}>
      <div
        className="scaled-preview__page"
        ref={pageRef}
        aria-hidden="true"
        style={scale ? { transform: `scale(${scale})` } : undefined}
      >
        <CVPreview
          formData={formData}
          template={template}
          locale={locale}
          atsFriendlyMode={atsFriendlyMode}
          accentColor={accentColor}
        />
      </div>
    </div>
  )
}

export default ScaledPreview
```

`aria-hidden` matches TemplateThumbnail: the preview is a picture of the output, and its text isn't page content. The page's own H1 and copy carry the meaning.

- [ ] **Step 5: Create `src/pages/TemplateDetailPage.jsx` (skeleton)**

```jsx
import { lazy, Suspense, useMemo } from 'react'

import InternalNavLink from '../components/InternalNavLink'
import { getCvTemplate, resolveTemplateAccent } from '../utils/cvTemplates'
import { TEMPLATE_PAGE_COPY } from '../utils/templatePageCopy'
import { ROUTES } from '../utils/routes'
import { demoCvData } from '../utils/cvForm'
import { withPlaceholderPhoto } from '../utils/thumbnailCv'

// CVPreview is the heaviest import here; lazy so the page's own chunk
// stays small. It shares the CVPreview chunk with the landing page and
// the builder.
const ScaledPreview = lazy(() => import('../components/ScaledPreview'))

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      breadcrumb: 'Pohjat',
      heading: (label) => `${label} – CV-pohja`,
      bestFor: 'Sopii:',
      useTemplate: 'Aloita tyhjästä tällä pohjalla',
    }
  }

  return {
    breadcrumb: 'Templates',
    heading: (label) => `${label} CV template`,
    bestFor: 'Best for:',
    useTemplate: 'Start blank with this template',
  }
}

function TemplateDetailPage({ templateId, locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  const copy = getCopy(resolvedLocale)
  const template = getCvTemplate(templateId, resolvedLocale)
  const pageCopy = TEMPLATE_PAGE_COPY[templateId]?.[resolvedLocale]
  const previewCv = useMemo(() => withPlaceholderPhoto(demoCvData), [])

  return (
    <div className="landing-page template-page">
      <nav className="template-page__breadcrumb" aria-label={copy.breadcrumb}>
        <InternalNavLink to={ROUTES.freeTemplates} onNavigate={() => onNavigateToView('freeTemplates')}>
          {copy.breadcrumb}
        </InternalNavLink>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{template.label}</span>
      </nav>

      <div className="template-page__layout">
        <div className="template-page__info">
          <h1 className="landing-section__title">{copy.heading(template.label)}</h1>
          <p className="landing-section__subtitle">{template.description}</p>
          {pageCopy && (
            <p className="template-page__best-for">
              <strong>{copy.bestFor}</strong> {pageCopy.bestFor}
            </p>
          )}
          <div className="template-page__actions">
            <button type="button" className="landing-cta" onClick={() => onGetStarted(templateId)}>
              {copy.useTemplate}
            </button>
          </div>
        </div>

        <div className="template-page__preview">
          <Suspense fallback={<div className="template-page__preview-placeholder" aria-hidden="true" />}>
            <ScaledPreview
              formData={previewCv}
              template={templateId}
              locale={resolvedLocale}
              accentColor={resolveTemplateAccent(null, templateId)}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default TemplateDetailPage
```

The Finnish heading uses an en dash on purpose ("Kehittäjä – CV-pohja"). Finnish doesn't put a bare label before "CV-pohja", so "Kehittäjä CV-pohja" would read as broken.

- [ ] **Step 6: Wire it into `src/App.jsx`**

After the `FinnishCvExamplesPage` lazy import:

```js
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage'))
```

Add `TEMPLATE_VIEW_PREFIX` to the `pageMeta` import. Replace line 383 (`const PageComponent = STATIC_PAGES[view] ?? LandingPage`) and the `<PageComponent … />` render with:

```jsx
    const templatePageId = view.startsWith(TEMPLATE_VIEW_PREFIX) ? VIEW_HEAD[view]?.templateId : null
    const PageComponent = templatePageId ? TemplateDetailPage : (STATIC_PAGES[view] ?? LandingPage)
```

```jsx
          <PageComponent
            key={view}
            locale={locale}
            templateId={templatePageId ?? undefined}
            onGetStarted={goToBuilder}
            onNavigateToView={goToView}
          />
```

`key={view}` remounts the page when moving between two template pages, so per-page state (selected example, ATS toggle) resets instead of carrying over.

- [ ] **Step 7: Styles**

Append to `src/styles/app-shell.css` after the `.templates-page-card__cta` rules:

```css
/* Per-template page (/free-cv-templates/<slug>). Two columns: copy and
   actions on the left, a live scaled preview on the right. Stacks under
   1024px, the same breakpoint as the landing hero. */
.template-page__breadcrumb {
  font-size: var(--text-caption);
  color: var(--app-text-muted);
  margin-bottom: var(--space-6);
}

.template-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: var(--space-10);
  align-items: start;
}

.template-page__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.template-page__best-for {
  font-size: var(--text-body-sm);
  line-height: 1.6;
  color: var(--app-text);
}

.template-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.template-page__preview-placeholder {
  aspect-ratio: 1 / 1.414;
  background: #ffffff;
  border: 1px solid var(--app-border);
}

.scaled-preview {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: var(--radius-sm);
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.scaled-preview__page {
  width: 780px;
  transform-origin: top left;
  pointer-events: none;
  user-select: none;
}

@media (max-width: 1023px) {
  .template-page__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Before committing, check that every `var(--space-*)` used above exists in `src/styles/tokens.css` (`grep -o "\-\-space-[0-9]*" src/styles/tokens.css | sort -u`), and swap any missing one for the nearest defined step.

- [ ] **Step 8: Run tests and checks**

Run: `npx playwright test e2e/template-pages.spec.js && npm run -s lint && npm run -s check:template-pages`
Expected: 3 passed, no lint output, checks ok.

- [ ] **Step 9: Visual check in the browser preview**

Start the dev server with preview_start, then open `/free-cv-templates/developer` and `/free-cv-templates/portrait`. Confirm the preview is scaled with nothing clipped at the bottom, and that Portrait shows the silhouette photo. Take a screenshot as proof.

- [ ] **Step 10: Commit**

```bash
git add src/components/ScaledPreview.jsx src/pages/TemplateDetailPage.jsx src/utils/thumbnailCv.js src/App.jsx src/styles/app-shell.css e2e/template-pages.spec.js
git commit -m "Add the per-template page with a live scaled preview"
npm version 1.3.3 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.3"
```

---

### Task 4: Example registry and the first example person

**Files:**
- Create: `src/utils/examples/buildExampleCv.js`
- Create: `src/utils/examples/frontend-developer.js`
- Create: `src/utils/exampleCvs.js`
- Modify: `scripts/check-template-pages.mjs`

**Interfaces:**
- Consumes: `createInitialCvData`, `createEmptyLinks`, `parseImportedCvData`, `CV_SECTION_ORDER_KEYS` from `cvForm.js`.
- Produces:
  - `buildExampleCv(content: Partial<CvData>): CvData`
  - `EXAMPLES: { [exampleId]: { role: { en: string, fi: string }, load: () => Promise<{ default: { en: CvData, fi: CvData } }> } }`
  - `TEMPLATE_EXAMPLES: { [templateId]: string[] }`
  - `getTemplateExamples(templateId): Array<{ id, role }>` (role already localized by caller)
  - `isTemplateExample(templateId, exampleId): boolean`
  - `loadExampleCv(exampleId, locale): Promise<CvData | null>`

The registry lists all 24 ids from the start, so `TEMPLATE_EXAMPLES` is final. Content files for the other 23 arrive in Tasks 5–8. Until then the check script's content rules report those people as `pending`, not FAIL, and become strict in Task 8 (see Step 1). That keeps `check:template-pages` green at every commit on this branch.

- [ ] **Step 1: Add the content rules to the check script**

Insert before the final `if (failures > 0)` block:

```js
// --- Example CVs -------------------------------------------------------------
const { EXAMPLES, TEMPLATE_EXAMPLES, loadExampleCv } = await importSrc('utils/exampleCvs.js')
const { parseImportedCvData, CV_SECTION_ORDER_KEYS } = await importSrc('utils/cvForm.js')
// Flip to true in Task 8, once all 24 example files exist. Until then a
// person whose loader still points at the _pending stub is reported as
// pending, not as a failure. Reads the registry, not the filesystem, so it
// agrees with what Vite builds.
const REQUIRE_ALL_EXAMPLES = false

function isSectionFilled(cv, key) {
  const value = cv[key]
  const hasText = (item) => typeof item === 'string'
    ? item.trim().length > 0
    : Boolean(item) && Object.values(item).some((field) => (typeof field === 'string' ? field.trim() : Array.isArray(field) && field.length))
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some(hasText)
  if (value && typeof value === 'object') return Object.values(value).some((field) => typeof field === 'string' && field.trim())
  return false
}

for (const template of cvTemplates) {
  const ids = TEMPLATE_EXAMPLES[template.id] ?? []
  check(`${template.id}: lists 2–3 examples`, ids.length >= 2 && ids.length <= 3, `${ids.length}`)
  check(`${template.id}: every listed example is registered`, ids.every((id) => EXAMPLES[id]), ids.filter((id) => !EXAMPLES[id]).join(', '))
}

const usedIds = new Set(Object.values(TEMPLATE_EXAMPLES).flat())
const unused = Object.keys(EXAMPLES).filter((id) => !usedIds.has(id))
check('every registered example is used by a template', unused.length === 0, unused.join(', '))

const pending = []
for (const [exampleId, entry] of Object.entries(EXAMPLES)) {
  check(`${exampleId}: has en and fi role labels`, Boolean(entry.role?.en && entry.role?.fi))
  if (entry.load.toString().includes('_pending')) {
    pending.push(exampleId)
    continue
  }

  const templatesUsingIt = cvTemplates.filter((template) => (TEMPLATE_EXAMPLES[template.id] ?? []).includes(exampleId))
  const requiredSections = [...new Set(templatesUsingIt.flatMap((template) => template.primarySections))]

  for (const locale of ['en', 'fi']) {
    const cv = await loadExampleCv(exampleId, locale)
    const tag = `${exampleId}/${locale}`
    check(`${tag}: loads`, Boolean(cv))
    if (!cv) continue

    let parsed = null
    try { parsed = parseImportedCvData(JSON.parse(JSON.stringify(cv))) } catch (error) {
      check(`${tag}: accepted by parseImportedCvData`, false, error.message)
    }
    if (parsed) {
      const changed = CV_SECTION_ORDER_KEYS.filter((key) => Array.isArray(cv[key]) && cv[key].length !== parsed[key]?.length)
      check(`${tag}: parsing keeps every entry`, changed.length === 0, changed.join(', '))
    }

    check(`${tag}: has fullName and title`, Boolean(cv.fullName?.trim() && cv.title?.trim()))
    check(`${tag}: email is @example.com`, /@example\.com$/.test(cv.email ?? ''), cv.email)
    check(`${tag}: no photo baked in`, !cv.photo)
    const missing = requiredSections.filter((key) => !isSectionFilled(cv, key))
    check(`${tag}: fills every primary section of ${templatesUsingIt.map((t) => t.id).join(', ')}`, missing.length === 0, `missing: ${missing.join(', ')}`)
  }
}

if (pending.length > 0) {
  console.log(`pend  ${pending.length} example file(s) not written yet: ${pending.join(', ')}`)
}
check('all example files exist', !REQUIRE_ALL_EXAMPLES || pending.length === 0, pending.join(', '))
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run -s check:template-pages`
Expected: an import error for `utils/exampleCvs.js`.

- [ ] **Step 3: Create `src/utils/examples/buildExampleCv.js`**

```js
import { createEmptyLinks, createInitialCvData } from '../cvForm.js'

// An example CV is only its content. Everything it leaves out (section
// visibility, ordering, empty sections) comes from a fresh CV, exactly as
// if a user had typed it in. The result goes through parseImportedCvData
// unchanged, which check:template-pages enforces.
export function buildExampleCv(content) {
  const base = createInitialCvData()

  return {
    ...base,
    ...content,
    links: { ...createEmptyLinks(), ...content.links },
  }
}
```

- [ ] **Step 4: Create `src/utils/examples/frontend-developer.js` (reference example)**

This is the reference for every other example file: length, tone, and the `{ en, fi }` shape. It must fill the union of Developer's and Portfolio Hybrid's `primarySections`. Check that with `grep -n "primarySections" src/utils/cvTemplates.js` for `developer` and `portfolio`, and add whatever sections the union needs beyond those shown here.

```js
import { buildExampleCv } from './buildExampleCv.js'

// Fictional person. Listed under: developer (default), portfolio.
const shared = {
  fullName: 'Mikael Laine',
  email: 'mikael.laine@example.com',
  phone: '+358 40 000 1201',
  links: {
    github: 'https://github.com/example-mlaine',
    linkedin: 'https://linkedin.com/in/example-mlaine',
    portfolio: 'https://mlaine.example.com',
  },
}

const en = buildExampleCv({
  ...shared,
  title: 'Frontend Developer',
  location: 'Tampere, Finland',
  about:
    'Frontend developer with 5 years of building accessible React applications for fintech and e-commerce. I care about fast pages, readable components, and shipping small changes often.',
  skills: ['React', 'TypeScript', 'Next.js', 'CSS architecture', 'Accessibility (WCAG 2.2)', 'Playwright', 'Vite', 'Storybook', 'GraphQL', 'Web performance'],
  experience: [
    {
      role: 'Frontend Developer',
      company: 'Northpay Oy',
      location: 'Tampere, Finland',
      employmentType: 'Full-time',
      startDate: 'Mar 2022',
      endDate: '',
      isCurrent: true,
      description: 'Own the customer-facing payments dashboard used by 40,000 merchants.',
      achievements: [
        'Cut dashboard load time from 4.1 s to 1.6 s by splitting bundles and moving charts to a worker.',
        'Led the WCAG 2.2 AA audit and fixed 120+ issues; zero accessibility complaints since.',
        'Introduced Playwright visual tests that catch ~5 regressions a month before release.',
      ],
      technologies: ['React', 'TypeScript', 'Playwright'],
    },
    {
      role: 'Junior Frontend Developer',
      company: 'Kauppakatu Digital',
      location: 'Helsinki, Finland',
      employmentType: 'Full-time',
      startDate: 'Aug 2019',
      endDate: 'Feb 2022',
      isCurrent: false,
      description: 'Built storefront features for three Nordic retail clients.',
      achievements: [
        'Rebuilt the product listing page as a reusable component set used across all three storefronts.',
        'Raised mobile conversion 9% with a simplified checkout flow.',
      ],
      technologies: ['React', 'Next.js', 'GraphQL'],
    },
  ],
  education: [
    {
      school: 'Tampere University of Applied Sciences',
      degree: 'B.Eng. Software Engineering',
      location: 'Tampere, Finland',
      startDate: '2015',
      endDate: '2019',
      honors: '',
      coursework: 'Web development, Human–computer interaction, Databases',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'a11y-lint-action',
      role: 'Author',
      description: 'GitHub Action that runs axe-core on preview deployments and comments the diff on the PR. 600+ stars.',
      technologies: ['TypeScript', 'axe-core', 'GitHub Actions'],
      link: 'https://github.com/example-mlaine/a11y-lint-action',
    },
    {
      name: 'Tram times widget',
      role: 'Author',
      description: 'Offline-first PWA showing live Tampere tram departures; 3,000 weekly users.',
      technologies: ['Preact', 'Service Workers'],
      link: 'https://trams.mlaine.example.com',
    },
  ],
  achievements: [
    { title: 'Speaker, React Finland 2024', description: 'Talk: "Shipping accessible charts".', date: '2024' },
  ],
  openSource: [
    { name: 'Vite', role: 'Contributor', description: 'Fixed CSS source-map handling for nested imports.', link: 'https://github.com/vitejs/vite' },
  ],
  publications: [
    { title: 'Making dashboards fast without a rewrite', publisher: 'dev.to', date: '2023', link: 'https://dev.to/example-mlaine' },
  ],
})

const fi = buildExampleCv({
  ...shared,
  title: 'Frontend-kehittäjä',
  location: 'Tampere',
  about:
    'Frontend-kehittäjä, jolla on viiden vuoden kokemus saavutettavien React-sovellusten rakentamisesta fintech- ja verkkokauppa-alalla. Minulle tärkeintä ovat nopeat sivut, selkeät komponentit ja pienet, usein julkaistavat muutokset.',
  skills: ['React', 'TypeScript', 'Next.js', 'CSS-arkkitehtuuri', 'Saavutettavuus (WCAG 2.2)', 'Playwright', 'Vite', 'Storybook', 'GraphQL', 'Verkkosuorituskyky'],
  experience: [
    {
      role: 'Frontend-kehittäjä',
      company: 'Northpay Oy',
      location: 'Tampere',
      employmentType: 'Full-time',
      startDate: '03/2022',
      endDate: '',
      isCurrent: true,
      description: 'Vastaan 40 000 kauppiaan käyttämästä maksujen hallintanäkymästä.',
      achievements: [
        'Lyhensin näkymän latausajan 4,1 sekunnista 1,6 sekuntiin pilkkomalla paketit ja siirtämällä kaaviot workeriin.',
        'Johdin WCAG 2.2 AA -auditoinnin ja korjasin yli 120 ongelmaa; saavutettavuudesta ei ole tullut yhtään valitusta sen jälkeen.',
        'Otin käyttöön Playwright-visuaalitestit, jotka löytävät noin viisi regressiota kuukaudessa ennen julkaisua.',
      ],
      technologies: ['React', 'TypeScript', 'Playwright'],
    },
    {
      role: 'Nuorempi frontend-kehittäjä',
      company: 'Kauppakatu Digital',
      location: 'Helsinki',
      employmentType: 'Full-time',
      startDate: '08/2019',
      endDate: '02/2022',
      isCurrent: false,
      description: 'Rakensin verkkokauppatoimintoja kolmelle pohjoismaiselle vähittäiskauppa-asiakkaalle.',
      achievements: [
        'Uudistin tuotelistaussivun uudelleenkäytettäviksi komponenteiksi, jotka otettiin käyttöön kaikissa kolmessa verkkokaupassa.',
        'Nostin mobiilikonversiota 9 % yksinkertaistetulla kassaprosessilla.',
      ],
      technologies: ['React', 'Next.js', 'GraphQL'],
    },
  ],
  education: [
    {
      school: 'Tampereen ammattikorkeakoulu',
      degree: 'Insinööri (AMK), ohjelmistotekniikka',
      location: 'Tampere',
      startDate: '2015',
      endDate: '2019',
      honors: '',
      coursework: 'Web-kehitys, ihminen–tietokone-vuorovaikutus, tietokannat',
      grade: '',
    },
  ],
  projects: [
    {
      name: 'a11y-lint-action',
      role: 'Tekijä',
      description: 'GitHub Action, joka ajaa axe-corea esikatseluympäristöissä ja kommentoi muutokset pull requestiin. Yli 600 tähteä.',
      technologies: ['TypeScript', 'axe-core', 'GitHub Actions'],
      link: 'https://github.com/example-mlaine/a11y-lint-action',
    },
    {
      name: 'Ratikka-aikataulut',
      role: 'Tekijä',
      description: 'Offline-tilassa toimiva PWA, joka näyttää Tampereen ratikoiden lähtöajat reaaliajassa; 3 000 käyttäjää viikossa.',
      technologies: ['Preact', 'Service Workers'],
      link: 'https://trams.mlaine.example.com',
    },
  ],
  achievements: [
    { title: 'Puhuja, React Finland 2024', description: 'Esitys: "Saavutettavat kaaviot tuotannossa".', date: '2024' },
  ],
  openSource: [
    { name: 'Vite', role: 'Kontribuuttori', description: 'Korjasin CSS-lähdekarttojen käsittelyn sisäkkäisille importeille.', link: 'https://github.com/vitejs/vite' },
  ],
  publications: [
    { title: 'Nopeampi hallintanäkymä ilman uudelleenkirjoitusta', publisher: 'dev.to', date: '2023', link: 'https://dev.to/example-mlaine' },
  ],
})

export default { en, fi }
```

Before writing, verify the field names of each record type against its factory in `src/utils/cvForm.js` (`createEmptyProject`, `createEmptyAchievement`, `createEmptyOpenSource`, `createEmptyPublication`, `createEmptyExperience`, `createEmptyEducation`), and use exactly those keys. `parseImportedCvData` rejects unknown keys or drops them silently. The "parsing keeps every entry" check catches a dropped entry, but it can't catch a dropped field, so the reviewer must compare the keys against the factories. Also check how `employmentType` values are stored (`EMPLOYMENT_TYPE_OPTIONS`, `cvForm.js:8`) and use a stored value, not a translation.

- [ ] **Step 5: Create `src/utils/exampleCvs.js`**

```js
// Example CVs for the per-template pages, and the builder's ?example= deep
// link. A shared pool: one fictional person can appear under several
// templates when the fit is real. Each person's content lives in its own
// module (./examples/<id>.js, exporting { en, fi }) and is loaded with a
// dynamic import, so a visitor only downloads the examples they view.
//
// TEMPLATE_EXAMPLES order matters: the first id is the page's default.
// Every person must fill every primary section of every template they're
// listed under; check:template-pages enforces that.

const role = (en, fi) => ({ en, fi })

export const EXAMPLES = {
  'frontend-developer': { role: role('Frontend developer', 'Frontend-kehittäjä'), load: () => import('./examples/frontend-developer.js') },
  'data-engineer': { role: role('Data engineer', 'Data engineer'), load: () => import('./examples/data-engineer.js') },
  'junior-developer': { role: role('Junior developer', 'Juniorikehittäjä'), load: () => import('./examples/junior-developer.js') },
  'ux-designer': { role: role('UX designer', 'UX-suunnittelija'), load: () => import('./examples/ux-designer.js') },
  'graphic-designer': { role: role('Graphic designer', 'Graafinen suunnittelija'), load: () => import('./examples/graphic-designer.js') },
  'marketing-manager': { role: role('Marketing manager', 'Markkinointipäällikkö'), load: () => import('./examples/marketing-manager.js') },
  'project-manager': { role: role('Project manager', 'Projektipäällikkö'), load: () => import('./examples/project-manager.js') },
  'product-manager': { role: role('Product manager', 'Tuotepäällikkö'), load: () => import('./examples/product-manager.js') },
  'finance-director': { role: role('Finance director', 'Talousjohtaja'), load: () => import('./examples/finance-director.js') },
  'operations-manager': { role: role('Operations manager', 'Operatiivinen päällikkö'), load: () => import('./examples/operations-manager.js') },
  'engineering-director': { role: role('Engineering director', 'Kehitysjohtaja'), load: () => import('./examples/engineering-director.js') },
  cto: { role: role('Chief technology officer', 'Teknologiajohtaja'), load: () => import('./examples/cto.js') },
  nurse: { role: role('Registered nurse', 'Sairaanhoitaja'), load: () => import('./examples/nurse.js') },
  accountant: { role: role('Accountant', 'Kirjanpitäjä'), load: () => import('./examples/accountant.js') },
  'cybersecurity-analyst': { role: role('Cybersecurity analyst', 'Kyberturvallisuusanalyytikko'), load: () => import('./examples/cybersecurity-analyst.js') },
  teacher: { role: role('Teacher', 'Opettaja'), load: () => import('./examples/teacher.js') },
  'business-graduate': { role: role('Business graduate', 'Kauppatieteiden vastavalmistunut'), load: () => import('./examples/business-graduate.js') },
  'research-scientist': { role: role('Research scientist', 'Tutkija'), load: () => import('./examples/research-scientist.js') },
  'sales-manager': { role: role('Sales manager', 'Myyntipäällikkö'), load: () => import('./examples/sales-manager.js') },
  'customer-success': { role: role('Customer success manager', 'Asiakkuuspäällikkö'), load: () => import('./examples/customer-success.js') },
  journalist: { role: role('Journalist', 'Toimittaja'), load: () => import('./examples/journalist.js') },
  'brand-specialist': { role: role('Brand specialist', 'Brändiasiantuntija'), load: () => import('./examples/brand-specialist.js') },
  chef: { role: role('Head chef', 'Keittiöpäällikkö'), load: () => import('./examples/chef.js') },
  architect: { role: role('Architect', 'Arkkitehti'), load: () => import('./examples/architect.js') },
}

export const TEMPLATE_EXAMPLES = {
  minimal: ['nurse', 'accountant', 'cybersecurity-analyst'],
  developer: ['frontend-developer', 'data-engineer', 'junior-developer'],
  creative: ['ux-designer', 'graphic-designer'],
  modern: ['marketing-manager', 'project-manager', 'product-manager'],
  executive: ['finance-director', 'operations-manager', 'engineering-director'],
  timeline: ['project-manager', 'teacher', 'operations-manager'],
  graduate: ['junior-developer', 'business-graduate'],
  compact: ['data-engineer', 'cybersecurity-analyst', 'business-graduate'],
  portfolio: ['frontend-developer', 'ux-designer', 'product-manager'],
  techExec: ['engineering-director', 'cto'],
  classicProfessional: ['accountant', 'finance-director', 'research-scientist'],
  navyProfessional: ['cto', 'sales-manager', 'research-scientist'],
  modernOrange: ['marketing-manager', 'ux-designer', 'customer-success'],
  colorfulCompact: ['graphic-designer', 'customer-success'],
  quadrant: ['marketing-manager', 'sales-manager', 'journalist'],
  editorial: ['journalist', 'research-scientist'],
  portrait: ['brand-specialist', 'chef', 'architect'],
  european: ['nurse', 'teacher', 'chef'],
}

export function getTemplateExamples(templateId, locale = 'en') {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  return (TEMPLATE_EXAMPLES[templateId] ?? [])
    .filter((id) => EXAMPLES[id])
    .map((id) => ({ id, role: EXAMPLES[id].role[resolvedLocale] }))
}

export function isTemplateExample(templateId, exampleId) {
  return typeof exampleId === 'string' && (TEMPLATE_EXAMPLES[templateId] ?? []).includes(exampleId)
}

// Resolves to null (never throws) for an unknown id, or an example whose
// file isn't written yet, so a stale ?example= link degrades to the
// default instead of breaking the page or the builder.
export async function loadExampleCv(exampleId, locale = 'en') {
  const entry = EXAMPLES[exampleId]
  if (!entry) {
    return null
  }

  try {
    const module = await entry.load()
    return structuredClone(module.default[locale === 'fi' ? 'fi' : 'en'])
  } catch {
    return null
  }
}
```

Vite resolves each `import('./examples/<id>.js')` at build time, so **a missing file fails `npm run build`**, even though `loadExampleCv` would swallow it at runtime. Until Tasks 5–8 finish, keep the 23 not-yet-written people's `load` pointing at a shared stub. Create `src/utils/examples/_pending.js`:

```js
// Stand-in for example files not written yet. Removed in Task 8.
export default null
```

For every person except `frontend-developer`, temporarily write `load: () => import('./examples/_pending.js')`. `loadExampleCv` then reads `module.default[locale]` from `null`, throws, and resolves to `null`, which is the documented fallback. Each content task switches its people to their real file. The check script's pending test (Step 1) already looks for `_pending` in each loader.

- [ ] **Step 6: Run checks**

Run: `npm run -s check:template-pages && npm run -s lint && npm run -s build`
Expected: ok lines for `frontend-developer/en` and `/fi`, one `pend  23 example file(s) not written yet` line, no FAIL, and the build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/utils/examples src/utils/exampleCvs.js scripts/check-template-pages.mjs
git commit -m "Add the example CV registry and the first example"
npm version 1.3.4 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.4"
```

---

### Task 5: Page features (example switcher, ATS view, previous/next, layout facts, tips)

**Files:**
- Modify: `src/pages/TemplateDetailPage.jsx`
- Modify: `src/styles/app-shell.css`
- Modify: `e2e/template-pages.spec.js`

**Interfaces:**
- Consumes: `getTemplateExamples`, `loadExampleCv`, `isTemplateExample`, `cvTemplates`, `templatePath`, `TEMPLATE_VIEW_PREFIX`, `onGetStarted(templateId, exampleId)` (the second argument lands in Task 7; until then App ignores it).
- Produces: the `?example=` page param (`history.replaceState`); `.template-page__examples` radiogroup; ATS checkbox labelled "ATS view" / "ATS-näkymä".

- [ ] **Step 1: Write the failing e2e tests**

Append to the `test.describe` in `e2e/template-pages.spec.js`:

```js
  test('the example switcher changes the preview and the URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const examples = page.getByRole('radiogroup', { name: 'Examples' })
    await expect(examples.getByRole('radio', { name: 'Frontend developer' })).toBeChecked()
    await expect(page.locator('.template-page__preview')).toContainText('Mikael Laine')

    await examples.getByRole('radio', { name: 'Data engineer' }).click()
    await expect(page).toHaveURL(/\?example=data-engineer$/)

    await page.reload()
    await expect(page.getByRole('radiogroup', { name: 'Examples' }).getByRole('radio', { name: 'Data engineer' })).toBeChecked()
  })

  test('an unknown ?example= falls back to the first example', async ({ page }) => {
    await page.goto('/free-cv-templates/developer?example=nope')
    await expect(page.getByRole('radiogroup', { name: 'Examples' }).getByRole('radio', { name: 'Frontend developer' })).toBeChecked()
  })

  test('the ATS view toggle switches the preview to ATS rendering', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const preview = page.locator('.template-page__preview')
    const before = await preview.innerHTML()
    await page.getByRole('checkbox', { name: 'ATS view' }).check()
    await expect.poll(() => preview.innerHTML()).not.toBe(before)
  })

  test('previous and next wrap around the template list', async ({ page }) => {
    await page.goto('/free-cv-templates/minimalist')
    await page.getByRole('link', { name: /Previous template/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/european$/)
    await page.getByRole('link', { name: /Next template/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/minimalist$/)
  })
```

While `data-engineer` is still a `_pending` stub (until Task 5's content batch), the switcher test's preview check must only look at the URL and the radio state, as written above. The page falls back to the demo CV for an example that loads `null`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test e2e/template-pages.spec.js`
Expected: the four new tests fail (no radiogroup, no checkbox, no previous/next links).

- [ ] **Step 3: Implement the full page**

Replace `src/pages/TemplateDetailPage.jsx` with:

```jsx
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'

import InternalNavLink from '../components/InternalNavLink'
import { cvTemplates, getCvTemplate, resolveTemplateAccent } from '../utils/cvTemplates'
import { TEMPLATE_PAGE_COPY } from '../utils/templatePageCopy'
import { getTemplateExamples, isTemplateExample, loadExampleCv } from '../utils/exampleCvs'
import { ROUTES, templatePath } from '../utils/routes'
import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'
import { demoCvData } from '../utils/cvForm'
import { withPlaceholderPhoto } from '../utils/thumbnailCv'

const ScaledPreview = lazy(() => import('../components/ScaledPreview'))

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      breadcrumb: 'Pohjat',
      heading: (label) => `${label} – CV-pohja`,
      bestFor: 'Sopii:',
      examples: 'Esimerkit',
      atsView: 'ATS-näkymä',
      useExample: 'Käytä tätä esimerkkiä',
      useTemplate: 'Aloita tyhjästä tällä pohjalla',
      tipsTitle: 'Vinkkejä tähän pohjaan',
      previous: 'Edellinen pohja',
      next: 'Seuraava pohja',
      all: 'Kaikki pohjat',
      facts: { split: '2 palstaa', single: '1 palsta', sections: (n) => `${n} osiota` },
    }
  }

  return {
    breadcrumb: 'Templates',
    heading: (label) => `${label} CV template`,
    bestFor: 'Best for:',
    examples: 'Examples',
    atsView: 'ATS view',
    useExample: 'Use this example',
    useTemplate: 'Start blank with this template',
    tipsTitle: 'Tips for this template',
    previous: 'Previous template',
    next: 'Next template',
    all: 'All templates',
    facts: { split: '2 columns', single: '1 column', sections: (n) => `${n} sections` },
  }
}

function readExampleParam() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('example')
}

function TemplateDetailPage({ templateId, locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const resolvedLocale = locale === 'fi' ? 'fi' : 'en'
  const copy = getCopy(resolvedLocale)
  const template = getCvTemplate(templateId, resolvedLocale)
  const pageCopy = TEMPLATE_PAGE_COPY[templateId]?.[resolvedLocale]
  const examples = useMemo(() => getTemplateExamples(templateId, resolvedLocale), [templateId, resolvedLocale])

  const [exampleId, setExampleId] = useState(() => {
    const requested = readExampleParam()
    return isTemplateExample(templateId, requested) ? requested : examples[0]?.id ?? null
  })
  const [exampleCv, setExampleCv] = useState(null)
  const [atsView, setAtsView] = useState(false)

  useEffect(() => {
    let cancelled = false
    setExampleCv(null)
    loadExampleCv(exampleId, resolvedLocale).then((cv) => {
      if (!cancelled) setExampleCv(cv)
    })
    return () => { cancelled = true }
  }, [exampleId, resolvedLocale])

  const selectExample = (nextId) => {
    setExampleId(nextId)
    const url = new URL(window.location.href)
    url.searchParams.set('example', nextId)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
  }

  // A not-yet-written or failed example falls back to the demo CV rather
  // than an empty frame.
  const previewCv = useMemo(() => withPlaceholderPhoto(exampleCv ?? demoCvData), [exampleCv])

  const index = cvTemplates.findIndex((entry) => entry.id === templateId)
  const neighbour = (offset) => cvTemplates[(index + offset + cvTemplates.length) % cvTemplates.length]
  const previous = getCvTemplate(neighbour(-1).id, resolvedLocale)
  const next = getCvTemplate(neighbour(1).id, resolvedLocale)
  const goToTemplate = (target) => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${target.id}`)

  const sectionCount = template.primarySections.length + (template.secondarySections?.length ?? 0)
  const facts = [
    template.layout === 'split' ? copy.facts.split : copy.facts.single,
    copy.facts.sections(sectionCount),
  ]

  return (
    <div className="landing-page template-page">
      <nav className="template-page__breadcrumb" aria-label={copy.breadcrumb}>
        <InternalNavLink to={ROUTES.freeTemplates} onNavigate={() => onNavigateToView('freeTemplates')}>
          {copy.breadcrumb}
        </InternalNavLink>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{template.label}</span>
      </nav>

      <div className="template-page__layout">
        <div className="template-page__info">
          <h1 className="landing-section__title">{copy.heading(template.label)}</h1>
          <p className="landing-section__subtitle">{template.description}</p>
          {pageCopy && (
            <p className="template-page__best-for">
              <strong>{copy.bestFor}</strong> {pageCopy.bestFor}
            </p>
          )}
          <ul className="template-page__facts">
            {facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>

          {examples.length > 0 && (
            <div className="template-page__examples" role="radiogroup" aria-label={copy.examples}>
              {examples.map((example) => (
                <label key={example.id} className="template-page__example">
                  <input
                    type="radio"
                    name="template-example"
                    value={example.id}
                    checked={example.id === exampleId}
                    onChange={() => selectExample(example.id)}
                  />
                  <span>{example.role}</span>
                </label>
              ))}
            </div>
          )}

          <label className="template-page__ats-toggle">
            <input type="checkbox" checked={atsView} onChange={(event) => setAtsView(event.target.checked)} />
            <span>{copy.atsView}</span>
          </label>

          <div className="template-page__actions">
            <button type="button" className="landing-cta" onClick={() => onGetStarted(templateId, exampleId)}>
              {copy.useExample}
            </button>
            <button type="button" className="templates-page-card__cta" onClick={() => onGetStarted(templateId)}>
              {copy.useTemplate}
            </button>
          </div>
        </div>

        <div className="template-page__preview">
          <Suspense fallback={<div className="template-page__preview-placeholder" aria-hidden="true" />}>
            <ScaledPreview
              formData={previewCv}
              template={templateId}
              locale={resolvedLocale}
              atsFriendlyMode={atsView}
              accentColor={resolveTemplateAccent(null, templateId)}
            />
          </Suspense>
        </div>
      </div>

      {pageCopy && (
        <div className="landing-section">
          <h2 className="landing-section__title" style={{ fontSize: 'var(--text-title)' }}>{copy.tipsTitle}</h2>
          <ul className="template-page__tips">
            {pageCopy.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>
      )}

      <nav className="template-page__pager" aria-label={copy.all}>
        <InternalNavLink to={templatePath(previous.slug)} onNavigate={() => goToTemplate(previous)}>
          ← {copy.previous}: {previous.label}
        </InternalNavLink>
        <InternalNavLink to={ROUTES.freeTemplates} onNavigate={() => onNavigateToView('freeTemplates')}>
          {copy.all}
        </InternalNavLink>
        <InternalNavLink to={templatePath(next.slug)} onNavigate={() => goToTemplate(next)}>
          {copy.next}: {next.label} →
        </InternalNavLink>
      </nav>
    </div>
  )
}

export default TemplateDetailPage
```

`onNavigateToView` is App's `goToView`, which calls `pushViewUrl(view)` and reads `VIEW_HEAD[view].path`. That already works for `template:*` keys, because they're real `VIEW_HEAD` entries. There's no photo fact: the registry has no per-template photo flag, and adding one is Phase 4 (filters).

- [ ] **Step 4: Styles**

Append to `src/styles/app-shell.css`, after the Task 3 rules:

```css
.template-page__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.template-page__facts li {
  border: 1px solid var(--app-border);
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: var(--text-caption);
  color: var(--app-text-muted);
}

.template-page__examples {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.template-page__example input,
.template-page__ats-toggle input {
  accent-color: #111111;
}

.template-page__example {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1.5px solid var(--app-border);
  padding: 0.4rem 0.8rem;
  font-size: var(--text-body-sm);
  cursor: pointer;
}

.template-page__example:has(input:checked) {
  border-color: #111111;
}

.template-page__example:has(input:focus-visible) {
  outline: 2px solid #111111;
  outline-offset: 2px;
}

.template-page__ats-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-body-sm);
}

.template-page__tips {
  display: grid;
  gap: var(--space-3);
  padding-left: 1.2rem;
  line-height: 1.6;
}

.template-page__pager {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-8) 0;
  font-size: var(--text-body-sm);
}
```

- [ ] **Step 5: Run tests**

Run: `npx playwright test e2e/template-pages.spec.js && npm run -s lint`
Expected: 7 passed, no lint output.

- [ ] **Step 6: Visual check at desktop and phone width**

Start the dev server with preview_start, open `/free-cv-templates/developer`, and take a screenshot. Then use resize_window with the mobile preset and confirm no horizontal page scroll. Per the user's memory notes, `resize_window` can no-op, so check `document.documentElement.scrollWidth <= window.innerWidth` with javascript_tool rather than trusting the screenshot. Reset with the desktop preset afterwards.

- [ ] **Step 7: Commit**

```bash
git add src/pages/TemplateDetailPage.jsx src/styles/app-shell.css e2e/template-pages.spec.js
git commit -m "Add example switcher, ATS view, tips, and previous/next to template pages"
npm version 1.3.5 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.5"
```

---

### Task 6: Hub page links to each template page

**Files:**
- Modify: `src/pages/FreeCvTemplatesPage.jsx:67-82`
- Modify: `e2e/template-pages.spec.js`

**Interfaces:**
- Consumes: `templatePath`, `TEMPLATE_VIEW_PREFIX`, `onNavigateToView`.

- [ ] **Step 1: Write the failing e2e test**

```js
  test('a hub card links to its template page', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await page.getByRole('link', { name: 'Modern Timeline', exact: true }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/modern-timeline$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modern Timeline CV template')
  })
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/template-pages.spec.js -g "hub card"`
Expected: FAIL (no such link).

- [ ] **Step 3: Implement**

In `FreeCvTemplatesPage.jsx`, add the imports `import { ROUTES, templatePath } from '../utils/routes'` (extending the existing `ROUTES` import) and `import { TEMPLATE_VIEW_PREFIX } from '../utils/pageMeta'`. Replace the card's thumbnail `<div>` and name `<p>` with:

```jsx
              <InternalNavLink
                to={templatePath(template.slug)}
                onNavigate={() => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${template.id}`)}
                className="templates-page-card__thumb"
              >
                <TemplateThumbnail templateId={template.id} formData={thumbnailCv} locale={resolvedLocale} />
              </InternalNavLink>
              <InternalNavLink
                to={templatePath(template.slug)}
                onNavigate={() => onNavigateToView(`${TEMPLATE_VIEW_PREFIX}${template.id}`)}
                className="templates-page-card__name"
              >
                {template.label}
              </InternalNavLink>
```

The thumbnail is `aria-hidden` (TemplateThumbnail), so the first link has no accessible name. Add `aria-hidden="true"` and `tabIndex={-1}` to it, so keyboard and screen-reader users get one link per card (the name). `InternalNavLink` doesn't forward extra props, so extend it to spread `...rest` onto the `<a>`:

```jsx
function InternalNavLink({ to, onNavigate, className, children, ...rest }) {
  return (
    <a
      {...rest}
      href={to}
```

Add `src/components/InternalNavLink.jsx` to this task's files. Give `.templates-page-card__name` `text-decoration: none` and a hover underline in `app-shell.css`, so it still reads as the card title.

- [ ] **Step 4: Run tests**

Run: `npx playwright test e2e/template-pages.spec.js && npx playwright test e2e/landing.spec.js && npm run -s lint`
Expected: all pass. The landing spec covers the hub's existing "Use this template" flow.

- [ ] **Step 5: Commit**

```bash
git add src/pages/FreeCvTemplatesPage.jsx src/components/InternalNavLink.jsx src/styles/app-shell.css e2e/template-pages.spec.js
git commit -m "Link each template card on the hub to its own page"
npm version 1.3.6 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.6"
```

---

### Task 7: Builder handoff (`?example=`) with the session-snapshot guard

**Files:**
- Modify: `src/App.jsx` (`goToBuilder`, ~line 335)
- Modify: `src/pages/ResumeBuilderPage.jsx` (`loadInitialCvSession` ~245–330; new effect next to the `clearShareParam` effect ~590)
- Modify: `e2e/template-pages.spec.js`

**Interfaces:**
- Consumes: `isTemplateExample`, `loadExampleCv`, `EXAMPLES[id].role`, the `?template=` param (read by `uiReducer`).
- Produces: `goToBuilder(templateId?: string, exampleId?: string)`; `loadInitialCvSession()` gains a `pendingExampleId: string | null` return field.

Loading is async (dynamic import), but `loadInitialCvSession` is sync (`useMemo`). So that function only decides whether an example should load. A mount effect then does the load. The decision keeps the spec's priority order: a share link, then a restored snapshot, both beat `?example=`.

- [ ] **Step 1: Write the failing e2e tests**

```js
  test('"Use this example" opens the builder with that template and example', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await page.getByRole('button', { name: 'Use this example' }).click()
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
    await expect(page.getByText('Loaded the Frontend developer example.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Mikael Laine')
  })

  test('an example link never overwrites a restored session', async ({ page }) => {
    await page.goto('/cv')
    await page.evaluate(() => window.localStorage.setItem('portifycv-session-restore-enabled', 'true'))
    await page.reload()
    await page.getByRole('textbox', { name: /Full name/ }).fill('Grace Hopper')
    await expect
      .poll(() => page.evaluate(() => window.sessionStorage.getItem('portifycv-session-snapshot')))
      .toContain('Grace Hopper')

    await page.goto('/cv?template=developer&example=frontend-developer')
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Grace Hopper')
  })
```

The builder opens in Direct Edit mode by default, and the `Full name` textbox is Classic mode's form field. Before running, check `e2e/session-restore.spec.js` and `e2e/direct-edit.spec.js` for how they reach the field in the default mode, and copy that. If they switch to Classic mode first, do the same here.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test e2e/template-pages.spec.js -g "example"`
Expected: both new tests fail. The first because the URL keeps `example=` or the name isn't loaded. The second may already pass; it guards the snapshot priority.

- [ ] **Step 3: `goToBuilder` in `src/App.jsx`**

Replace the `query` computation inside `goToBuilder` and its signature:

```js
  const goToBuilder = useCallback((templateId, exampleId) => {
    setView('builder')

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams()
      if (typeof templateId === 'string' && templateId) params.set('template', templateId)
      if (typeof exampleId === 'string' && exampleId) params.set('example', exampleId)
      const query = params.toString() ? `?${params}` : ''
      const nextPath = `${VIEW_HEAD.builder.path}${query}`
```

Leave the rest of the function unchanged. Update the comment above it so it mentions the optional `exampleId` (the template pages' "Use this example").

- [ ] **Step 4: Decide in `loadInitialCvSession`**

Add the import `import { EXAMPLES, isTemplateExample, loadExampleCv } from '../utils/exampleCvs'`. Add `pendingExampleId: null` to **every** existing `return { … }` in `loadInitialCvSession`: the SSR guard, share link, share error, snapshot restore, onboarding demo and blank. Then, just before the `if (!hasSeenOnboarding)` block (after the snapshot block, so a restored snapshot has already returned), insert:

```js
  // ?example= from a template page's "Use this example". Only reached when
  // there's no share link and no restored snapshot (both returned above),
  // so an example link can never overwrite a CV the user is working on.
  // The file loads asynchronously; ResumeBuilderPage's mount effect
  // dispatches it. Until then the builder shows a blank CV, not the
  // onboarding demo, so the demo doesn't flash first.
  const params = new URLSearchParams(window.location.search)
  const requestedExampleId = params.get('example')
  if (isTemplateExample(params.get('template'), requestedExampleId)) {
    return {
      formData: initialCvData,
      initialToast: null,
      clearShareParam: false,
      storageIssue: hasStorageIssue,
      pendingExampleId: requestedExampleId,
    }
  }
```

`markOnboardingSeen()` has already run above this point, so an example visit counts as onboarding seen, as the spec requires. When a share link or a snapshot wins, `pendingExampleId` is `null` but the `example` param is still in the URL. The effect in Step 5 strips it unconditionally, so no extra flag is needed.

- [ ] **Step 5: Load and dispatch in the component**

Next to the `clearShareParam` effect (~line 590), add:

```js
  // Strip ?example= so a reload doesn't re-apply it on top of edits. Always
  // strip, whether or not it loaded: a restored session also ignores it.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('example')) {
      url.searchParams.delete('example')
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    }

    const exampleId = initialSession.pendingExampleId
    if (!exampleId) {
      return undefined
    }

    let cancelled = false
    loadExampleCv(exampleId, locale).then((exampleCv) => {
      if (cancelled || !exampleCv) return
      dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: exampleCv })
      const roleLabel = EXAMPLES[exampleId].role[locale === 'fi' ? 'fi' : 'en']
      showToast(locale === 'fi' ? `Esimerkki ladattu: ${roleLabel}.` : `Loaded the ${roleLabel} example.`)
    })
    return () => { cancelled = true }
    // Mount-only: the session decision is made once, like initialSession itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSession])
```

Check what the repo's ESLint config actually reports here (`npm run lint`). If the `react-hooks` rule isn't enabled, drop the disable comment, because an unused disable directive is itself a lint error under `--report-unused-disable-directives`. `showToast` is declared at ~line 445, so the effect must sit after that declaration, which is the case at ~590.

- [ ] **Step 6: Run tests**

Run: `npx playwright test e2e/template-pages.spec.js e2e/session-restore.spec.js e2e/editor.spec.js && npm run -s lint && npm run -s check:reducers`
Expected: all pass. The session-restore and editor specs guard the untouched onboarding/snapshot paths.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/pages/ResumeBuilderPage.jsx e2e/template-pages.spec.js
git commit -m "Open the builder with a template page's example, never over a restored session"
npm version 1.3.7 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.7"
```

---

### Task 8: Example content (23 people, en + fi), in four batches

**Files:**
- Create: `src/utils/examples/<exampleId>.js` for each person below
- Modify: `src/utils/exampleCvs.js` (switch each person's `load` from `_pending.js` to the real file)
- Finally: delete `src/utils/examples/_pending.js`, set `REQUIRE_ALL_EXAMPLES = true` in the check script, and remove the `_pending` existence test

**Interfaces:**
- Consumes: `buildExampleCv`, and the shape and field names fixed by `frontend-developer.js` (Task 4).

Each batch is its own commit and version bump. For every person:
1. Read the templates they're listed under (roster table) and run `npm run -s check:template-pages` to see exactly which sections they must fill.
2. Write `en`, then `fi`: same person, same facts and numbers. Finnish dates use `MM/YYYY`, cities have no ", Finland", and degree names use Finnish forms (`FinnishCvExamplesPage.jsx` has the conventions).
3. Every experience entry needs 2–3 achievements with a concrete number, the same bar as the reference file.
4. Give each person a different first name, surname and employer from everyone else in the pool. Employers are invented. Don't use real company names, except open-source projects in `openSource`, where contributing to a real project is normal and harmless.
5. Hit the stress case if the person has one (roster table).
6. Switch the person's `load` in `exampleCvs.js` to `import('./examples/<id>.js')`.

Batches:
- **8a:** data-engineer (20+ skills), junior-developer (thin), ux-designer, graphic-designer, marketing-manager, project-manager → bump 1.3.8
- **8b:** product-manager, finance-director (6 roles), operations-manager, engineering-director, cto (long name), nurse → bump 1.3.9
- **8c:** accountant, cybersecurity-analyst, teacher, business-graduate, research-scientist, sales-manager → bump 1.3.10
- **8d:** customer-success, journalist, brand-specialist, chef, architect → finalisation below → bump 1.3.11

- [ ] **Step 1 (per batch): Write the six files and switch their loaders**

- [ ] **Step 2 (per batch): Run the check**

Run: `npm run -s check:template-pages && npm run -s build`
Expected: the batch's people show `ok` for both locales, the `pend` count drops by the batch size, there's no FAIL, and the build succeeds.

- [ ] **Step 3 (per batch): Visual check**

Start the dev server with preview_start. Open each template page the batch's people appear on, select each new person, and screenshot any page whose layout breaks (overflow, clipped name, a section that runs past page one when it shouldn't). **Don't fix template CSS here.** That's Phase 2. List each breakage in `todo.md` under a new heading `## Phase 2 inputs (from template-page examples)`, with template, person and symptom.

- [ ] **Step 4 (per batch): Commit**

```bash
git add src/utils/examples src/utils/exampleCvs.js todo.md
git commit -m "Add example CVs: <comma-separated ids>"
npm version 1.3.<n> --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.<n>"
```

- [ ] **Step 5 (after 8d): Make the check strict**

Delete `src/utils/examples/_pending.js`. In `scripts/check-template-pages.mjs`, set `REQUIRE_ALL_EXAMPLES = true`. The `_pending` test stays as a guard: it now matches nothing, and the strict flag turns any reintroduced stub into a FAIL. Run `grep -rn "_pending.js" src` and expect no output.

Run: `npm run -s check:template-pages && npm run -s build`
Expected: no `pend` line, no FAIL, and the build succeeds. Commit it with batch 8d.

---

### Task 9: Copy review and full e2e coverage

**Files:**
- Modify: `src/utils/templatePageCopy.js` (review only)
- Modify: `e2e/template-pages.spec.js`

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Write the failing or new e2e tests**

```js
  test('every template page renders without console errors', async ({ page }) => {
    const errors = []
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/free-cv-templates')
    const hrefs = await page.locator('a.templates-page-card__name').evaluateAll((links) => links.map((link) => link.getAttribute('href')))
    expect(hrefs).toHaveLength(18)

    for (const href of hrefs) {
      await page.goto(href)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('.template-page__preview [data-export-header]').first()).toBeVisible()
    }
    expect(errors).toEqual([])
  })

  test('the Finnish page shows Finnish copy and a Finnish example', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await page.evaluate(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kehittäjä – CV-pohja')
    await expect(page.getByRole('radiogroup', { name: 'Esimerkit' })).toBeVisible()
    await expect(page.locator('.template-page__preview')).toContainText('Frontend-kehittäjä')
  })
```

AdSense loads in `index.html`, and in the preview server it may log console errors that have nothing to do with this feature. If it does, filter messages whose text matches `/adsbygoogle|googlesyndication/` out of `errors`, and leave a one-line comment explaining why.

- [ ] **Step 2: Run them**

Run: `npx playwright test e2e/template-pages.spec.js`
Expected: all pass. A failure on one slug's page is a real bug: fix it before going on.

- [ ] **Step 3: Copy review**

Read all 18 entries of `templatePageCopy.js` in both locales against the live pages. For each, check:
- the tips describe what the page's preview actually shows;
- no tip is generic CV advice;
- the Finnish reads naturally;
- the `bestFor` audiences match that template's listed examples.

Edit anything that fails these.

- [ ] **Step 4: Commit**

```bash
git add src/utils/templatePageCopy.js e2e/template-pages.spec.js
git commit -m "Cover all template pages in e2e and tighten their copy"
npm version 1.3.12 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.3.12"
```

---

### Task 10: CI, worker check, bundle check, release notes, PR

**Files:**
- Modify: `.github/workflows/ci.yml` (after the `check:section-columns` step, ~line 47)
- Modify: `.github/workflows/ci.yml` `on.push.branches`
- Modify: `CLAUDE.md`, `README.md`, `changes.md`

- [ ] **Step 1: Run the check in CI**

Add after the `check:section-columns` step, copying its exact `- name:` / `run:` shape:

```yaml
      - name: Template page checks
        run: npm run check:template-pages
```

Change `branches: [main, v1.3.0]` to `branches: [main, v1.4.0]`. By then `v1.3.0` has merged, so it no longer needs push CI.

- [ ] **Step 2: Worker check**

Run `npm run build`, then start `npm run worker:dev` in the background and run:

```bash
curl -s http://localhost:8787/free-cv-templates/developer | grep -E "<title>|rel=\"canonical\"|BreadcrumbList"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/free-cv-templates/not-a-template
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:8787/free-cv-templates/Developer/
```

Expected: the Developer title, a canonical link ending `/free-cv-templates/developer`, and the BreadcrumbList JSON-LD; then `404`; then `301 …/free-cv-templates/developer`. Check `wrangler.jsonc` / the `worker:dev` output for the real port, and stop the worker afterwards.

- [ ] **Step 3: Bundle check**

Compare `npm run build`'s entry chunk (`dist/assets/index-*.js` gzip size) against the `v1.3.0` build. It must not grow by more than ~2 KB gzip: the routing and copy are small, and the page and examples are lazy. Each example must be its own small chunk (`ls dist/assets | grep -c -E "^(frontend-developer|data-engineer)"`, or check the build log). If the entry chunk grew because `templatePageCopy.js` is pulled in through `pageMeta.js`, that's expected and acceptable (it's text). Record the numbers in `changes.md`.

- [ ] **Step 4: Full verification**

Run: `npm run lint && for s in share reducers feedback docx-export section-schema section-columns template-pages; do npm run -s check:$s || exit 1; done && npm run test:e2e`
Expected: lint clean, all seven checks pass, and the full e2e suite passes. Record the count.

- [ ] **Step 5: Docs**

- `CLAUDE.md`: add `npm run check:template-pages` to the Commands block, with a one-line description in the `check:*` paragraph. Update "six" to "seven" and CI's branch list. In the Architecture section, add a short paragraph: template pages are generated from `cvTemplates` → `VIEW_HEAD`; slugs are permanent; examples live in `src/utils/examples/`, and every person must fill their templates' primary sections.
- `README.md`: add the new check to Development, and `/free-cv-templates/<slug>` to Routes.
- `changes.md`: a new top entry, "Template pages — 2026-10-xx", covering what shipped, the verification numbers, and the Phase 2 inputs collected in `todo.md`.

- [ ] **Step 6: Version and push**

```bash
git add .github/workflows/ci.yml CLAUDE.md README.md changes.md
git commit -m "Run template page checks in CI and document template pages"
npm version 1.4.0 --no-git-tag-version && git add package.json package-lock.json && git commit -m "Bump version to 1.4.0"
```

Push `v1.4.0` **only after `v1.3.0` has merged into `main`**. First rebase: `git fetch origin && git rebase origin/main`, resolve any conflicts, and re-run Step 4. Then `git push -u origin v1.4.0`.

- [ ] **Step 7: PR description**

Write the PR description (v1.4.0 → main) to the scratchpad and send it to the user. It covers: what shipped, the routes added, how the examples work, verification numbers, the worker check output, the bundle numbers, and the Phase 2 inputs. End it with the 🤖 Claude Code line. **Do not open or merge the PR.** The user opens it and decides on the merge.

---

## Self-review notes (resolved inline)

- **Spec coverage:**
  - slugs → T1
  - routes and metadata → T2
  - structured data → T2
  - App shell → T3, T7
  - page and preview → T3, T5
  - hub links → T6
  - builder handoff and snapshot guard → T7
  - example pool and stress cases → T4, T8
  - per-template copy → T2, T9
  - sitemap → T2
  - check rules 1–7 → T1, T2, T4, T8
  - e2e list → T3, T5, T6, T7, T9
  - manual worker check → T10
  - bundle → T10
- **Deviation from the spec:** `metaDescription` is English-only. That's consistent with all `VIEW_HEAD` descriptions, and T2 Step 6 updates the spec to match.
- **Build safety:** Vite fails on a missing dynamic-import target, so not-yet-written people point at `_pending.js` until T8 removes it. The check script reads the registry, not the filesystem, so it agrees with the build.
- **Names used consistently across tasks:**
  - `TEMPLATE_VIEW_PREFIX`, `buildViewSchema`, `TEMPLATE_PAGE_COPY`
  - `EXAMPLES`, `TEMPLATE_EXAMPLES`, `getTemplateExamples(templateId, locale)`, `isTemplateExample`, `loadExampleCv(exampleId, locale)`
  - `withPlaceholderPhoto`, `ScaledPreview`, `pendingExampleId`, `goToBuilder(templateId, exampleId)`
