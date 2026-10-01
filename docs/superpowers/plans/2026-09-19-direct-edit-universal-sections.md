# Direct Edit universal section editing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every section on all 18 templates fully editable in Direct
Edit mode via a hover pencil that opens a schema-driven popup editor, with
column-aware section reordering and per-section hiding.

**Architecture:** A delegated overlay (`SectionEditOverlay`) sits above
`CVPreview` inside `.direct-edit-preview`, resolves a hovered element to a
section key through the `data-export-section` / `data-export-header`
attributes every Showcase already carries for the PDF exporter, and opens
`SectionEditorPopup` for that key. The popup renders real form inputs from
a new `sectionSchema.js` and reads `formData[section]` **directly**, so
entry indices are correct by construction. Zero template files are touched.

**Tech Stack:** React 19, Vite, hand-written utility CSS, Playwright e2e,
framework-free Node check scripts.

**Spec:** `docs/superpowers/specs/2026-09-19-direct-edit-universal-sections-design.md`

## Global Constraints

- **No new `cvFormReducer` actions.** Every dispatch uses an existing
  `FORM_ACTION`. Exact verified payloads:
  - `SET_ROOT_FIELD` → `{ field, value }`
  - `SET_LINK_FIELD` → `{ field, value }`
  - `TOGGLE_SECTION_VISIBILITY` → `{ section }`
  - `TOGGLE_SECTION_ITEM_VISIBILITY` → `{ section, itemKey }` (itemKey is stringified internally)
  - `TOGGLE_PHOTO_VISIBILITY` → `{ template }` (**required** — no-ops without it)
  - `ADD_SKILL` → `{ skill }` (trims; silently no-ops on empty or case-insensitive duplicate)
  - `REMOVE_SKILL` → `{ index }`
  - `MOVE_SKILL` → `{ index, direction }` (direction is `-1` or `1`)
  - `UPDATE_ARRAY_ITEM` → `{ section, index, field, value }`
  - `ADD_ARRAY_ITEM` → `{ section }`
  - `REMOVE_ARRAY_ITEM` → `{ section, index }`
  - `DUPLICATE_ARRAY_ITEM` → `{ section, index }`
  - `MOVE_ARRAY_ITEM` → `{ section, index, direction }`
  - `MOVE_SECTION_ORDER` → `{ fromSection, toSection, fallbackOrder }`
- Commits carry only `r0uty <yasa.sheva@gmail.com>` — **never** an AI/Claude
  co-authorship trailer, and never mention Claude or AI in the message.
- The popup reads `formData`, **never** `snapshot` and **never** the DOM,
  for anything index-related. `createCvSnapshot` filters by
  `sectionItemVisibility`, so DOM order diverges from `formData` order.
- The overlay must mount **outside** `previewRef` so `html2canvas` never
  captures it during PDF export.
- All user-facing strings are bilingual inline `isFinnish ? 'fi' : 'en'`
  pairs, matching the codebase's existing convention (no i18n library).
- Zero changes to any `src/components/templates/*` file in this plan.
- Zero behaviour change to existing inline editing on the 9 wired templates.
- Bump `package.json`'s patch version once, in Task 8.

---

## File structure

- **Create** `src/utils/sectionSchema.js` — section field descriptors and
  shapes. Pure data plus small pure helpers; no React.
- **Create** `scripts/check-section-schema.mjs` — validates the schema
  against `cvForm.js`'s factories in both directions.
- **Create** `src/components/SectionEditorPopup.jsx` — the popup editor.
  Owns all five section shapes.
- **Create** `src/components/SectionEditOverlay.jsx` — delegation,
  geometry, pencil, popup mounting. The only file touching DOM geometry.
- **Create** `src/styles/direct-edit-popup.css` — overlay, pencil and
  popup styling.
- **Modify** `src/components/DirectEditPreview.jsx` — mount the overlay,
  remove the "not available yet" notice.
- **Modify** `src/utils/directEdit.js` — rename to inline-edit semantics.
- **Modify** `scripts/check-direct-edit.mjs` — follow the rename.
- **Modify** `src/index.css` — import the new stylesheet.
- **Modify** `e2e/direct-edit.spec.js` — new coverage.
- **Modify** `package.json` — new check script, patch version bump.
- **Modify** `changes.md` — one entry.
- **Modify** `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
  — the two documentation corrections owed.

---

### Task 1: Section schema + validation script

**Files:**
- Create: `src/utils/sectionSchema.js`
- Create: `scripts/check-section-schema.mjs`
- Modify: `package.json` (add the `check:section-schema` script only — no version bump here)

**Interfaces:**
- Produces: `SECTION_SCHEMA` (object keyed by section key),
  `getSectionSchema(sectionKey)` → schema entry or `undefined`,
  `SECTION_SHAPE` (frozen string enum). Tasks 3-6 consume all three.
- Schema entry shape:
  `{ shape, labelEn, labelFi, fields: [{ key, labelEn, labelFi, type }] }`
  where `type` is one of `'text' | 'textarea' | 'month' | 'url' | 'checkbox'`.
- `SECTION_SHAPE` values: `'rootGroup' | 'rootScalar' | 'stringArray' | 'linkMap' | 'recordArray'`.

- [ ] **Step 1: Write the failing check script**

Create `scripts/check-section-schema.mjs`:

**Critical mechanical detail:** plain static imports of `src/` modules do
NOT work in these scripts. `src/utils/cvForm.js` imports siblings without
file extensions, which Node's ESM resolver rejects. `scripts/check-direct-edit.mjs`
solves this with a `registerHooks` resolver shim plus a dynamic `importSrc`
helper — copy that preamble verbatim (it is reproduced below) rather than
writing top-level `import ... from '../src/...'` statements.

```js
// Validates sectionSchema.js against the real data model in cvForm.js.
// A schema field naming a key no factory produces would dispatch
// UPDATE_ARRAY_ITEM into a field nothing reads — a silent data loss with
// no crash to notice. This is the same cheap insurance check:share gives
// the share-link short keys.
//
//   node scripts/check-section-schema.mjs

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// src/ modules import siblings without file extensions; Node's ESM
// resolver needs this shim to follow them. Same preamble as
// scripts/check-direct-edit.mjs.
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

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const { SECTION_SCHEMA, SECTION_SHAPE } = await importSrc('utils/sectionSchema.js')
const cvForm = await importSrc('utils/cvForm.js')

const FACTORY_BY_SECTION = {
  experience: cvForm.createEmptyExperience,
  education: cvForm.createEmptyEducation,
  coreStrengths: cvForm.createEmptyCoreStrength,
  certificates: cvForm.createEmptyCertificate,
  projects: cvForm.createEmptyProject,
  languages: cvForm.createEmptyLanguage,
  achievements: cvForm.createEmptyAchievement,
  openSource: cvForm.createEmptyOpenSource,
  publications: cvForm.createEmptyPublication,
  interests: cvForm.createEmptyInterest,
  leadership: cvForm.createEmptyLeadership,
  memberships: cvForm.createEmptyMembership,
  speaking: cvForm.createEmptySpeaking,
  volunteering: cvForm.createEmptyVolunteer,
  internships: cvForm.createEmptyInternship,
  caseStudies: cvForm.createEmptyCaseStudy,
  testimonials: cvForm.createEmptyTestimonial,
}

// Fields deliberately NOT exposed in the Phase A popup. Listing them here
// (rather than silently omitting them) makes each exclusion a recorded
// decision: experience.achievements/technologies are nested arrays needing
// their own sub-editor, and *.image is an upload, not a text field.
const INTENTIONALLY_EXCLUDED = {
  experience: ['achievements', 'technologies'],
  projects: ['image'],
}

const failures = []

function check(condition, message) {
  if (!condition) {
    failures.push(message)
  }
}

// 1. Every section in createSectionVisibility() has a schema entry.
for (const section of Object.keys(cvForm.createSectionVisibility())) {
  check(SECTION_SCHEMA[section], `missing schema entry for section "${section}"`)
}

// 2. identity is a synthetic section with no sectionVisibility entry.
check(SECTION_SCHEMA.identity, 'missing schema entry for synthetic section "identity"')

// 3. Every schema entry is well formed.
for (const [section, entry] of Object.entries(SECTION_SCHEMA)) {
  check(
    Object.values(SECTION_SHAPE).includes(entry.shape),
    `section "${section}" has unknown shape "${entry.shape}"`,
  )
  check(typeof entry.labelEn === 'string' && entry.labelEn.length > 0, `section "${section}" missing labelEn`)
  check(typeof entry.labelFi === 'string' && entry.labelFi.length > 0, `section "${section}" missing labelFi`)

  for (const field of entry.fields) {
    check(typeof field.key === 'string' && field.key.length > 0, `section "${section}" has a field with no key`)
    check(
      ['text', 'textarea', 'month', 'url', 'checkbox'].includes(field.type),
      `section "${section}" field "${field.key}" has unknown type "${field.type}"`,
    )
    check(typeof field.labelEn === 'string' && field.labelEn.length > 0, `section "${section}" field "${field.key}" missing labelEn`)
    check(typeof field.labelFi === 'string' && field.labelFi.length > 0, `section "${section}" field "${field.key}" missing labelFi`)
  }
}

// 4. Record-array schemas match their factory in BOTH directions.
for (const [section, factory] of Object.entries(FACTORY_BY_SECTION)) {
  const entry = SECTION_SCHEMA[section]

  if (!entry) {
    continue
  }

  check(
    entry.shape === SECTION_SHAPE.recordArray,
    `section "${section}" has a factory but shape "${entry.shape}"`,
  )

  const factoryKeys = Object.keys(factory())
  const schemaKeys = entry.fields.map((field) => field.key)
  const excluded = INTENTIONALLY_EXCLUDED[section] ?? []

  for (const key of schemaKeys) {
    check(factoryKeys.includes(key), `section "${section}" schema field "${key}" does not exist on its factory`)
  }

  for (const key of factoryKeys) {
    check(
      schemaKeys.includes(key) || excluded.includes(key),
      `section "${section}" factory field "${key}" is neither in the schema nor in INTENTIONALLY_EXCLUDED`,
    )
  }
}

// 5. linkMap schema matches createEmptyLinks().
const linkKeys = Object.keys(cvForm.createEmptyLinks())
const linkSchemaKeys = SECTION_SCHEMA.links.fields.map((field) => field.key)

for (const key of linkSchemaKeys) {
  check(linkKeys.includes(key), `links schema field "${key}" does not exist on createEmptyLinks()`)
}

for (const key of linkKeys) {
  check(linkSchemaKeys.includes(key), `createEmptyLinks() field "${key}" is missing from the links schema`)
}

if (failures.length > 0) {
  console.error(`check:section-schema FAILED with ${failures.length} problem(s):`)
  failures.forEach((message) => console.error(`  - ${message}`))
  process.exit(1)
}

console.log(`check:section-schema passed (${Object.keys(SECTION_SCHEMA).length} sections validated)`)
```

Add to `package.json`'s `scripts`, directly after `check:direct-edit`:

```json
    "check:section-schema": "node scripts/check-section-schema.mjs",
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run check:section-schema`
Expected: FAIL — `Cannot find module '.../src/utils/sectionSchema.js'`. That
is the correct RED: the schema does not exist yet.

- [ ] **Step 3: Write the schema**

Create `src/utils/sectionSchema.js`. Field lists are copied verbatim from
`cvForm.js`'s factories (lines 16-166) — do not invent or rename keys:

```js
// Field descriptors for Direct Edit's popup section editor.
//
// This is the single source of truth for "what fields does section X
// have, and how should each be rendered". It exists because the popup is
// template-agnostic: it cannot read field names off a template's JSX the
// way inline editing does, so it needs the data model described in one
// place. scripts/check-section-schema.mjs validates it against
// cvForm.js's factories in both directions on every run, so a renamed or
// removed factory field fails the build rather than silently dropping a
// user's edit.

export const SECTION_SHAPE = Object.freeze({
  rootGroup: 'rootGroup',
  rootScalar: 'rootScalar',
  stringArray: 'stringArray',
  linkMap: 'linkMap',
  recordArray: 'recordArray',
})

const text = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'text' })
const area = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'textarea' })
const month = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'month' })
const url = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'url' })
const check = (key, labelEn, labelFi) => ({ key, labelEn, labelFi, type: 'checkbox' })

export const SECTION_SCHEMA = {
  // Synthetic section: the header block, which has no sectionOrder entry
  // and is reached via [data-export-header] rather than
  // [data-export-section]. `photo` is handled separately by the popup
  // (TOGGLE_PHOTO_VISIBILITY needs a template id, not a field value), so
  // it is not listed as a field here.
  identity: {
    shape: SECTION_SHAPE.rootGroup,
    labelEn: 'Header',
    labelFi: 'Otsikko',
    fields: [
      text('fullName', 'Full name', 'Koko nimi'),
      text('title', 'Professional title', 'Ammattinimike'),
      text('tagline', 'Tagline', 'Iskulause'),
      text('email', 'Email', 'Sähköposti'),
      text('phone', 'Phone', 'Puhelin'),
      text('location', 'Location', 'Sijainti'),
    ],
  },

  about: {
    shape: SECTION_SHAPE.rootScalar,
    labelEn: 'About',
    labelFi: 'Esittely',
    fields: [area('about', 'Summary', 'Yhteenveto')],
  },

  skills: {
    shape: SECTION_SHAPE.stringArray,
    labelEn: 'Skills',
    labelFi: 'Taidot',
    fields: [text('skill', 'Skill', 'Taito')],
  },

  links: {
    shape: SECTION_SHAPE.linkMap,
    labelEn: 'Links',
    labelFi: 'Linkit',
    fields: [
      url('github', 'GitHub', 'GitHub'),
      url('linkedin', 'LinkedIn', 'LinkedIn'),
      url('portfolio', 'Portfolio', 'Portfolio'),
      url('website', 'Website', 'Verkkosivu'),
      url('behance', 'Behance', 'Behance'),
      url('dribbble', 'Dribbble', 'Dribbble'),
      url('medium', 'Medium', 'Medium'),
      url('devto', 'dev.to', 'dev.to'),
      url('scholar', 'Google Scholar', 'Google Scholar'),
      url('boardProfile', 'Board profile', 'Hallitusprofiili'),
      url('blog', 'Blog', 'Blogi'),
      url('researchGate', 'ResearchGate', 'ResearchGate'),
      url('hackTheBox', 'Hack The Box', 'Hack The Box'),
      url('tryHackMe', 'TryHackMe', 'TryHackMe'),
      url('youtube', 'YouTube', 'YouTube'),
    ],
  },

  experience: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Experience',
    labelFi: 'Kokemus',
    fields: [
      text('role', 'Role', 'Rooli'),
      text('company', 'Company', 'Yritys'),
      text('location', 'Location', 'Sijainti'),
      text('employmentType', 'Employment type', 'Työsuhteen tyyppi'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
      check('isCurrent', 'Current role', 'Nykyinen rooli'),
      area('description', 'Description', 'Kuvaus'),
    ],
  },

  education: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Education',
    labelFi: 'Koulutus',
    fields: [
      text('school', 'School', 'Oppilaitos'),
      text('degree', 'Degree', 'Tutkinto'),
      text('location', 'Location', 'Sijainti'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
      text('honors', 'Honors', 'Kunniamaininnat'),
      area('coursework', 'Coursework', 'Opinnot'),
      text('grade', 'Grade', 'Arvosana'),
    ],
  },

  coreStrengths: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Core strengths',
    labelFi: 'Vahvuudet',
    fields: [
      text('title', 'Title', 'Otsikko'),
      area('description', 'Description', 'Kuvaus'),
    ],
  },

  certificates: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Certificates',
    labelFi: 'Sertifikaatit',
    fields: [
      text('name', 'Name', 'Nimi'),
      text('issuer', 'Issuer', 'Myöntäjä'),
      text('year', 'Year', 'Vuosi'),
      url('credentialUrl', 'Credential URL', 'Todistuksen osoite'),
      text('expiry', 'Expiry', 'Voimassaolo'),
    ],
  },

  projects: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Projects',
    labelFi: 'Projektit',
    fields: [
      text('name', 'Name', 'Nimi'),
      area('description', 'Description', 'Kuvaus'),
      text('stack', 'Stack', 'Teknologiat'),
      url('githubUrl', 'GitHub URL', 'GitHub-osoite'),
      url('demoUrl', 'Demo URL', 'Demo-osoite'),
      text('organization', 'Organization', 'Organisaatio'),
      text('impact', 'Impact', 'Vaikutus'),
      text('date', 'Date', 'Päivämäärä'),
      text('teamSize', 'Team size', 'Tiimin koko'),
      area('contribution', 'Contribution', 'Oma panos'),
    ],
  },

  languages: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Languages',
    labelFi: 'Kielet',
    fields: [
      text('language', 'Language', 'Kieli'),
      text('level', 'Level', 'Taso'),
    ],
  },

  interests: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Interests',
    labelFi: 'Kiinnostuksen kohteet',
    fields: [text('name', 'Name', 'Nimi')],
  },

  achievements: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Achievements',
    labelFi: 'Saavutukset',
    fields: [
      text('title', 'Title', 'Otsikko'),
      area('description', 'Description', 'Kuvaus'),
      text('year', 'Year', 'Vuosi'),
    ],
  },

  openSource: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Open source',
    labelFi: 'Avoin lähdekoodi',
    fields: [
      text('name', 'Name', 'Nimi'),
      area('description', 'Description', 'Kuvaus'),
      text('language', 'Language', 'Kieli'),
      text('stars', 'Stars', 'Tähdet'),
      text('forks', 'Forks', 'Haarat'),
      url('url', 'URL', 'Osoite'),
    ],
  },

  publications: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Publications',
    labelFi: 'Julkaisut',
    fields: [
      text('title', 'Title', 'Otsikko'),
      text('publisher', 'Publisher', 'Julkaisija'),
      text('year', 'Year', 'Vuosi'),
      url('url', 'URL', 'Osoite'),
    ],
  },

  leadership: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Leadership experience',
    labelFi: 'Johtamiskokemus',
    fields: [
      text('role', 'Role', 'Rooli'),
      text('organization', 'Organization', 'Organisaatio'),
      area('description', 'Description', 'Kuvaus'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
    ],
  },

  memberships: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Professional memberships',
    labelFi: 'Ammattijäsenyydet',
    fields: [
      text('organization', 'Organization', 'Organisaatio'),
      text('role', 'Role', 'Rooli'),
      text('year', 'Year', 'Vuosi'),
    ],
  },

  speaking: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Speaking',
    labelFi: 'Esiintymiset',
    fields: [
      text('conference', 'Conference', 'Konferenssi'),
      text('topic', 'Topic', 'Aihe'),
      text('audience', 'Audience', 'Yleisö'),
      text('date', 'Date', 'Päivämäärä'),
    ],
  },

  volunteering: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Volunteering',
    labelFi: 'Vapaaehtoistyö',
    fields: [
      text('organization', 'Organization', 'Organisaatio'),
      text('role', 'Role', 'Rooli'),
      area('description', 'Description', 'Kuvaus'),
    ],
  },

  internships: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Internships',
    labelFi: 'Harjoittelut',
    fields: [
      text('role', 'Role', 'Rooli'),
      text('company', 'Company', 'Yritys'),
      text('location', 'Location', 'Sijainti'),
      month('startDate', 'Start date', 'Aloituspäivä'),
      month('endDate', 'End date', 'Lopetuspäivä'),
      area('description', 'Description', 'Kuvaus'),
      text('technologies', 'Technologies', 'Teknologiat'),
    ],
  },

  caseStudies: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Case studies',
    labelFi: 'Tapaustutkimukset',
    fields: [
      text('title', 'Title', 'Otsikko'),
      area('problem', 'Problem', 'Ongelma'),
      area('solution', 'Solution', 'Ratkaisu'),
      text('technologies', 'Technologies', 'Teknologiat'),
      area('outcome', 'Outcome', 'Lopputulos'),
      area('lessons', 'Lessons', 'Opit'),
    ],
  },

  testimonials: {
    shape: SECTION_SHAPE.recordArray,
    labelEn: 'Testimonials',
    labelFi: 'Suositukset',
    fields: [
      area('quote', 'Quote', 'Lainaus'),
      text('author', 'Author', 'Kirjoittaja'),
      text('role', 'Role', 'Rooli'),
    ],
  },
}

export function getSectionSchema(sectionKey) {
  return SECTION_SCHEMA[sectionKey]
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npm run check:section-schema`
Expected: PASS — `check:section-schema passed (21 sections validated)`.

If it reports a factory field neither in the schema nor excluded, add the
field to the schema (preferred) or to `INTENTIONALLY_EXCLUDED` with a
reason. Do not delete the assertion.

- [ ] **Step 5: Prove the check can fail**

Temporarily rename `role` to `rolee` in the `experience` schema entry, run
`npm run check:section-schema`, and confirm it exits non-zero naming that
field. Then restore it and confirm PASS again. A check that cannot fail is
not a check.

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/utils/sectionSchema.js scripts/check-section-schema.mjs package.json
git commit -m "Add section schema and its validation script for popup editing"
```

---

### Task 2: Overlay, hover pencil, and popup shell

**Files:**
- Create: `src/components/SectionEditOverlay.jsx`
- Create: `src/components/SectionEditorPopup.jsx` (shell only — shapes land in Tasks 3-5)
- Create: `src/styles/direct-edit-popup.css`
- Modify: `src/index.css`
- Modify: `src/components/DirectEditPreview.jsx`
- Modify: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: `getSectionSchema` from Task 1.
- Produces: `SectionEditOverlay` (props `formData`, `dispatchFormData`,
  `templateConfig`, `locale`), and `SectionEditorPopup` (props
  `sectionKey`, `formData`, `dispatchFormData`, `templateConfig`,
  `locale`, `onClose`). Tasks 3-6 add shape branches inside the popup's
  `renderBody()` and controls to its header — they do not change either
  signature.

- [ ] **Step 1: Write the failing e2e test**

Add to `e2e/direct-edit.spec.js`, inside the existing
`test.describe('Direct Edit builder', ...)` block (line 18). That block's
`beforeEach` already does `page.goto('/cv')` and clicks "Load demo CV", so
tests start with demo data loaded in Classic mode — do not re-navigate or
re-load demo data:

```js
  test('hovering a section in Direct Edit reveals a pencil that opens the section popup', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const aboutSection = page.locator('[data-export-section="about"]').first()
    await expect(aboutSection).toBeVisible()

    await aboutSection.hover()

    const pencil = page.locator('.direct-edit-pencil')
    await expect(pencil).toBeVisible()

    await pencil.click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('About')

    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)
  })
```

The only file-scope helper that exists today is
`selectTemplate(page, label)` (line 7). Switching modes is a plain tab
click, as above — there is no `switchToDirectEdit` helper, and none needs
to be added.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/direct-edit.spec.js -g "reveals a pencil"`
Expected: FAIL — no `.direct-edit-pencil` element exists yet.

- [ ] **Step 3: Write the popup shell**

Create `src/components/SectionEditorPopup.jsx`:

```jsx
import { useEffect } from 'react'
import { getSectionSchema } from '../utils/sectionSchema'

// The popup editor for one section. Renders real <input>/<textarea>
// elements and reads formData directly — never the DOM and never
// snapshot, because createCvSnapshot filters entries by
// sectionItemVisibility, so DOM order diverges from formData order and
// any index derived from the DOM would target the wrong record.
export default function SectionEditorPopup({
  sectionKey,
  formData,
  dispatchFormData,
  templateConfig,
  locale,
  onClose,
}) {
  const isFinnish = locale === 'fi'
  const schema = getSectionSchema(sectionKey)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!schema) {
    return null
  }

  const renderBody = () => (
    <p className="direct-edit-popup__empty">
      {isFinnish ? 'Ei vielä muokattavia kenttiä.' : 'No editable fields yet.'}
    </p>
  )

  return (
    <div
      className="direct-edit-popup"
      role="dialog"
      aria-label={isFinnish ? schema.labelFi : schema.labelEn}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="direct-edit-popup__header">
        <span className="direct-edit-popup__title">
          {isFinnish ? schema.labelFi : schema.labelEn}
        </span>
        <button
          type="button"
          className="direct-edit-popup__close"
          onClick={onClose}
          aria-label={isFinnish ? 'Sulje' : 'Close'}
        >
          &times;
        </button>
      </div>
      <div className="direct-edit-popup__body">{renderBody()}</div>
    </div>
  )
}
```

- [ ] **Step 4: Write the overlay**

Create `src/components/SectionEditOverlay.jsx`:

```jsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import SectionEditorPopup from './SectionEditorPopup'
import { getSectionSchema } from '../utils/sectionSchema'

// Every Showcase already tags its section wrappers with
// data-export-section (and its header with data-export-header) for the
// PDF exporter. Reusing those as the hover target is what lets this
// overlay reach all 18 templates without touching a single template file.
const SECTION_SELECTOR = '[data-export-section], [data-export-header]'

function resolveSectionKey(target) {
  const match = target.closest?.(SECTION_SELECTOR)

  if (!match) {
    return null
  }

  if (match.hasAttribute('data-export-section')) {
    return match.getAttribute('data-export-section')
  }

  // The header block is not a sectionOrder section; the schema models it
  // under the synthetic key "identity".
  return 'identity'
}

export default function SectionEditOverlay({
  formData,
  dispatchFormData,
  templateConfig,
  locale,
}) {
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [openSectionKey, setOpenSectionKey] = useState(null)

  // Measured in container coordinates (sectionRect - containerRect), not
  // viewport coordinates: the overlay and the preview scroll together, so
  // this offset is scroll-invariant and needs no scroll listener.
  const measure = useCallback((element, sectionKey) => {
    const container = containerRef.current

    if (!container || !element) {
      return null
    }

    const base = container.getBoundingClientRect()
    const rect = element.getBoundingClientRect()

    return {
      sectionKey,
      top: rect.top - base.top,
      left: rect.left - base.left,
      right: rect.right - base.left,
      width: rect.width,
    }
  }, [])

  // The listener goes on the PARENT (.direct-edit-preview), not on this
  // overlay host. Two reasons, both fatal to the obvious approach:
  //   1. The host is `pointer-events: none` so inline contentEditable
  //      editing keeps working underneath it — a pointer-events:none
  //      element never becomes an event target at all.
  //   2. The host is a SIBLING of <CVPreview>, not its ancestor, so
  //      events from the CV's sections would never bubble to it anyway.
  // The shared parent is the nearest node that actually sees both.
  useEffect(() => {
    const host = containerRef.current
    const parent = host?.parentElement

    if (!parent) {
      return undefined
    }

    const handlePointerOver = (event) => {
      if (openSectionKey) {
        return
      }

      // Ignore our own chrome — it lives inside the host, whose children
      // do take pointer events.
      if (event.target.closest?.('.direct-edit-overlay-host')) {
        return
      }

      const element = event.target.closest?.(SECTION_SELECTOR)

      if (!element) {
        return
      }

      const sectionKey = resolveSectionKey(event.target)

      if (!sectionKey || !getSectionSchema(sectionKey)) {
        return
      }

      setHovered(measure(element, sectionKey))
    }

    const handlePointerLeave = () => {
      if (!openSectionKey) {
        setHovered(null)
      }
    }

    const handlePointerDown = (event) => {
      if (!openSectionKey) {
        return
      }

      // Click-outside closes; clicks on the popup or pencil do not.
      if (event.target.closest?.('.direct-edit-popup, .direct-edit-pencil')) {
        return
      }

      setOpenSectionKey(null)
      setHovered(null)
    }

    parent.addEventListener('pointerover', handlePointerOver)
    parent.addEventListener('pointerleave', handlePointerLeave)
    parent.addEventListener('pointerdown', handlePointerDown)

    return () => {
      parent.removeEventListener('pointerover', handlePointerOver)
      parent.removeEventListener('pointerleave', handlePointerLeave)
      parent.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [measure, openSectionKey])

  // Content reflows as the user types, so re-measure the active section
  // after every formData change to keep the pencil attached to it.
  useLayoutEffect(() => {
    if (!hovered) {
      return
    }

    const container = containerRef.current
    const selector =
      hovered.sectionKey === 'identity'
        ? '[data-export-header]'
        : `[data-export-section="${hovered.sectionKey}"]`
    const element = container?.querySelector(selector)
    const next = measure(element, hovered.sectionKey)

    if (next && (next.top !== hovered.top || next.right !== hovered.right)) {
      setHovered(next)
    }
  }, [formData, hovered, measure])

  const handleClose = useCallback(() => {
    setOpenSectionKey(null)
    setHovered(null)
  }, [])

  return (
    <div ref={containerRef} className="direct-edit-overlay-host">
      {hovered && !openSectionKey ? (
        <button
          type="button"
          className="direct-edit-pencil"
          style={{ top: `${hovered.top}px`, left: `${hovered.right}px` }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setOpenSectionKey(hovered.sectionKey)}
          aria-label={locale === 'fi' ? 'Muokkaa osiota' : 'Edit section'}
        >
          &#9998;
        </button>
      ) : null}

      {openSectionKey && hovered ? (
        <div
          className="direct-edit-popup-anchor"
          style={{ top: `${hovered.top}px`, left: `${hovered.right}px` }}
        >
          <SectionEditorPopup
            sectionKey={openSectionKey}
            formData={formData}
            dispatchFormData={dispatchFormData}
            templateConfig={templateConfig}
            locale={locale}
            onClose={handleClose}
          />
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 5: Write the stylesheet**

Create `src/styles/direct-edit-popup.css`:

```css
/* Overlay host: covers the preview so hover can be delegated, but is
   pointer-transparent itself — only the pencil and popup take pointer
   events, so inline contentEditable editing underneath still works. */
.direct-edit-overlay-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.direct-edit-overlay-host > * {
  pointer-events: auto;
}

.direct-edit-pencil {
  position: absolute;
  transform: translate(-100%, 0);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--color-border, #d4d4d8);
  background: var(--color-surface, #ffffff);
  color: var(--color-ink, #18181b);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px -6px rgba(0, 0, 0, 0.4);
}

.direct-edit-pencil:hover,
.direct-edit-pencil:focus-visible {
  background: var(--color-surface-strong, #f4f4f5);
}

.direct-edit-popup-anchor {
  position: absolute;
  transform: translate(-100%, 0);
  max-width: min(420px, 90vw);
}

.direct-edit-popup {
  width: 380px;
  max-width: 90vw;
  max-height: 70vh;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid var(--color-border, #d4d4d8);
  background: var(--color-surface, #ffffff);
  color: var(--color-ink, #18181b);
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.5);
}

.direct-edit-popup__header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--color-border, #d4d4d8);
  background: inherit;
}

.direct-edit-popup__title {
  font-size: 13px;
  font-weight: 700;
}

.direct-edit-popup__close {
  border: 0;
  background: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: inherit;
}

.direct-edit-popup__body {
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.direct-edit-popup__empty {
  font-size: 12px;
  opacity: 0.7;
}
```

Import it in `src/index.css`, on the line directly after the existing
`direct-edit.css` import (match that line's exact syntax):

```css
@import './styles/direct-edit-popup.css';
```

- [ ] **Step 6: Mount the overlay**

In `src/components/DirectEditPreview.jsx`, import the overlay:

```jsx
import SectionEditOverlay from './SectionEditOverlay'
```

The overlay is positioned against `.direct-edit-preview`, which must
therefore establish a containing block. Add `position: relative` to
`.direct-edit-preview` in `src/styles/direct-edit.css` if it does not
already have it — check first, and if it already does, change nothing.

Then render the overlay as a **sibling** of `<CVPreview>`, immediately
after it, still inside the `.direct-edit-preview` div. It must NOT wrap
`CVPreview` and must NOT be inside `previewRef`, so `html2canvas` never
captures it:

```jsx
      <CVPreview
        formData={formData}
        theme={theme}
        template={selectedTemplate}
        locale={locale}
        atsFriendlyMode={false}
        accentColor={accentColor}
        headingColor={headingColor}
        classicNameAlignment={classicNameAlignment}
        directEditDispatch={isSupported ? dispatchFormData : null}
        previewRef={previewRef}
      />
      <SectionEditOverlay
        formData={formData}
        dispatchFormData={dispatchFormData}
        templateConfig={templateConfig}
        locale={locale}
      />
```

Leave the `isSupported` notice and the `directEditDispatch={isSupported ? ... : null}`
gate exactly as they are for now — Task 7 removes the notice, once the
popup is genuinely functional.

- [ ] **Step 7: Run the e2e test to verify it passes**

Run: `npx playwright test e2e/direct-edit.spec.js -g "reveals a pencil"`
Expected: PASS.

- [ ] **Step 8: Verify export safety manually**

Start the dev server via the Browser pane, switch to Direct Edit, hover a
section so the pencil shows, then run a PDF export. Confirm the exported
PDF contains no pencil. Then confirm via the DOM that
`.direct-edit-overlay-host` is NOT a descendant of the element
`previewRef` points at:

```js
document.querySelector('[data-export-root="true"]').contains(document.querySelector('.direct-edit-overlay-host'))
```

Expected: `false`.

- [ ] **Step 9: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 10: Commit**

```bash
git add src/components/SectionEditOverlay.jsx src/components/SectionEditorPopup.jsx src/styles/direct-edit-popup.css src/index.css src/styles/direct-edit.css src/components/DirectEditPreview.jsx e2e/direct-edit.spec.js
git commit -m "Add hover pencil overlay and section popup shell to Direct Edit"
```

---

### Task 3: Record-array editing in the popup

**Files:**
- Modify: `src/components/SectionEditorPopup.jsx`
- Modify: `src/styles/direct-edit-popup.css`
- Modify: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: `SECTION_SHAPE`, `getSectionSchema` (Task 1); the popup shell
  signature (Task 2).
- Produces: nothing new consumed by later tasks. Tasks 4-6 add sibling
  branches to the same `renderBody()` switch.

This is the largest shape: 17 sections use it.

- [ ] **Step 1: Write the failing e2e test**

Add to `e2e/direct-edit.spec.js`:

```js
  test('the popup edits an experience entry and lists hidden entries with a visibility toggle', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil').click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    // Every entry is listed, including any hidden via sectionItemVisibility.
    const entries = popup.locator('.direct-edit-popup__entry')
    await expect(entries.first()).toBeVisible()

    const roleInput = entries.first().locator('input[data-field="role"]')
    await roleInput.fill('Popup Edited Role')

    // The live preview behind the popup reflects the edit immediately.
    await expect(
      page.locator('[data-export-section="experience"]').first(),
    ).toContainText('Popup Edited Role')

    // Adding an entry appends one row.
    const countBefore = await entries.count()
    await popup.locator('.direct-edit-popup__add').click()
    await expect(entries).toHaveCount(countBefore + 1)

    // Hiding an entry KEEPS it listed in the popup, marked hidden. That
    // is the fix for the bug parked since Phase 1: a Classic-hidden entry
    // used to reappear as editable in Direct Edit with no way to see or
    // change its hidden state.
    //
    // Deliberately NOT asserted here: that the entry vanishes from the
    // preview. On inline-wired templates EditableList renders raw
    // formData (unfiltered by sectionItemVisibility) by design, so in
    // Direct Edit the entry stays visible — a documented, accepted
    // trade-off since Phase 1 that this task does not change. Asserting
    // otherwise would encode a false expectation and fail.
    const firstEntry = entries.first()
    await firstEntry.locator('.direct-edit-popup__entry-visibility').click()
    await expect(firstEntry).toHaveClass(/direct-edit-popup__entry--hidden/)
    await expect(entries).toHaveCount(countBefore + 1)

    // And it round-trips back to visible.
    await firstEntry.locator('.direct-edit-popup__entry-visibility').click()
    await expect(firstEntry).not.toHaveClass(/direct-edit-popup__entry--hidden/)
  })
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/direct-edit.spec.js -g "edits an experience entry"`
Expected: FAIL — no `.direct-edit-popup__entry` elements exist.

- [ ] **Step 3: Add the field renderer and record-array branch**

In `src/components/SectionEditorPopup.jsx`, **extend** the existing
`sectionSchema` import (Task 2 already imports `getSectionSchema` — do not
add a second import statement for the same module) and add the reducer
import:

```jsx
import { SECTION_SHAPE, getSectionSchema } from '../utils/sectionSchema'
import { FORM_ACTION } from '../reducers/cvFormReducer'
```

Add this field renderer above the component:

```jsx
function FieldInput({ field, value, isFinnish, onChange }) {
  const label = isFinnish ? field.labelFi : field.labelEn
  const shared = {
    'data-field': field.key,
    id: `direct-edit-field-${field.key}`,
    className: 'direct-edit-popup__input',
  }

  if (field.type === 'checkbox') {
    return (
      <label className="direct-edit-popup__field direct-edit-popup__field--inline">
        <input
          {...shared}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="direct-edit-popup__label">{label}</span>
      </label>
    )
  }

  return (
    <label className="direct-edit-popup__field">
      <span className="direct-edit-popup__label">{label}</span>
      {field.type === 'textarea' ? (
        <textarea
          {...shared}
          rows={3}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={field.type === 'month' ? 'month' : field.type === 'url' ? 'url' : 'text'}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  )
}
```

Replace the shell's `renderBody` with a shape switch whose first branch is
the record array:

```jsx
  const renderRecordArray = () => {
    const items = Array.isArray(formData[sectionKey]) ? formData[sectionKey] : []
    const itemVisibility = formData.sectionItemVisibility?.[sectionKey] ?? {}

    return (
      <>
        {items.map((item, index) => {
          // index is formData-relative and stays that way: it is read
          // straight off this map over formData[sectionKey], never off
          // the DOM or a snapshot-filtered list.
          const isHidden = itemVisibility[String(index)] === false

          return (
            <div
              key={index}
              className={`direct-edit-popup__entry${isHidden ? ' direct-edit-popup__entry--hidden' : ''}`}
            >
              <div className="direct-edit-popup__entry-bar">
                <span className="direct-edit-popup__entry-index">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM, section: sectionKey, index, direction: -1 })
                  }
                  disabled={index === 0}
                  aria-label={isFinnish ? 'Siirrä ylös' : 'Move up'}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.MOVE_ARRAY_ITEM, section: sectionKey, index, direction: 1 })
                  }
                  disabled={index === items.length - 1}
                  aria-label={isFinnish ? 'Siirrä alas' : 'Move down'}
                >
                  &darr;
                </button>
                <button
                  type="button"
                  className="direct-edit-popup__entry-visibility"
                  onClick={() =>
                    dispatchFormData({
                      type: FORM_ACTION.TOGGLE_SECTION_ITEM_VISIBILITY,
                      section: sectionKey,
                      itemKey: index,
                    })
                  }
                >
                  {isHidden ? (isFinnish ? 'Näytä' : 'Show') : (isFinnish ? 'Piilota' : 'Hide')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.DUPLICATE_ARRAY_ITEM, section: sectionKey, index })
                  }
                >
                  {isFinnish ? 'Kopioi' : 'Duplicate'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatchFormData({ type: FORM_ACTION.REMOVE_ARRAY_ITEM, section: sectionKey, index })
                  }
                >
                  {isFinnish ? 'Poista' : 'Remove'}
                </button>
              </div>
              {schema.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={item[field.key]}
                  isFinnish={isFinnish}
                  onChange={(value) =>
                    dispatchFormData({
                      type: FORM_ACTION.UPDATE_ARRAY_ITEM,
                      section: sectionKey,
                      index,
                      field: field.key,
                      value,
                    })
                  }
                />
              ))}
            </div>
          )
        })}
        <button
          type="button"
          className="direct-edit-popup__add"
          onClick={() => dispatchFormData({ type: FORM_ACTION.ADD_ARRAY_ITEM, section: sectionKey })}
        >
          {isFinnish ? '+ Lisää' : '+ Add'}
        </button>
      </>
    )
  }

  const renderBody = () => {
    switch (schema.shape) {
      case SECTION_SHAPE.recordArray:
        return renderRecordArray()
      default:
        return (
          <p className="direct-edit-popup__empty">
            {isFinnish ? 'Ei vielä muokattavia kenttiä.' : 'No editable fields yet.'}
          </p>
        )
    }
  }
```

- [ ] **Step 4: Style the entry rows**

Append to `src/styles/direct-edit-popup.css`:

```css
.direct-edit-popup__entry {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.6rem;
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 8px;
}

.direct-edit-popup__entry--hidden {
  opacity: 0.55;
}

.direct-edit-popup__entry-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
  font-size: 11px;
}

.direct-edit-popup__entry-bar button {
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 6px;
  background: none;
  padding: 0.15rem 0.4rem;
  font-size: 11px;
  cursor: pointer;
  color: inherit;
}

.direct-edit-popup__entry-bar button:disabled {
  opacity: 0.4;
  cursor: default;
}

.direct-edit-popup__entry-index {
  font-weight: 700;
  margin-right: auto;
}

.direct-edit-popup__field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.direct-edit-popup__field--inline {
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
}

.direct-edit-popup__label {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
}

.direct-edit-popup__input {
  width: 100%;
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font: inherit;
  font-size: 12px;
  background: var(--color-surface, #ffffff);
  color: inherit;
}

.direct-edit-popup__field--inline .direct-edit-popup__input {
  width: auto;
}

.direct-edit-popup__add {
  border: 1px dashed var(--color-border, #d4d4d8);
  border-radius: 8px;
  background: none;
  padding: 0.4rem;
  font-size: 12px;
  cursor: pointer;
  color: inherit;
}
```

- [ ] **Step 5: Run the e2e test to verify it passes**

Run: `npx playwright test e2e/direct-edit.spec.js -g "edits an experience entry"`
Expected: PASS.

- [ ] **Step 6: Verify the hidden-entry behaviour manually**

In the dev server: open the Experience popup, click Hide on entry #2,
confirm it remains listed (dimmed) in the popup, switch to Classic mode
and confirm the same entry reads as hidden there, switch back and click
Show. This is the bug parked since Phase 1 — confirm the hidden state is
now visible and controllable.

Do NOT expect the entry to vanish from the Direct Edit preview on an
inline-wired template: `EditableList` renders raw `formData` there by
design. On a template without inline wiring (e.g. Quadrant) the preview
renders from `snapshot` and the entry WILL disappear — check both so you
know which behaviour belongs to which path.

- [ ] **Step 7: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add src/components/SectionEditorPopup.jsx src/styles/direct-edit-popup.css e2e/direct-edit.spec.js
git commit -m "Add record-array section editing to the Direct Edit popup"
```

---

### Task 4: Identity, About and Links editing in the popup

**Files:**
- Modify: `src/components/SectionEditorPopup.jsx`
- Modify: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: `FieldInput` and the `renderBody` switch (Task 3).
- Produces: nothing consumed later.

- [ ] **Step 1: Write the failing e2e test**

```js
  test('the popup edits header fields including tagline, which no template wires inline', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-header]').first().hover()
    await page.locator('.direct-edit-pencil').click()

    const popup = page.locator('.direct-edit-popup')
    await expect(popup).toBeVisible()

    await popup.locator('input[data-field="tagline"]').fill('Popup tagline')
    await expect(page.locator('[data-export-header]').first()).toContainText('Popup tagline')
  })
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/direct-edit.spec.js -g "including tagline"`
Expected: FAIL — the identity popup renders the "no editable fields" text.

- [ ] **Step 3: Add the three branches**

Add to `SectionEditorPopup.jsx`, above `renderBody`:

```jsx
  const renderRootGroup = () => (
    <>
      {schema.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={formData[field.key]}
          isFinnish={isFinnish}
          onChange={(value) =>
            dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: field.key, value })
          }
        />
      ))}
      {formData.photo ? (
        <label className="direct-edit-popup__field direct-edit-popup__field--inline">
          <input
            type="checkbox"
            className="direct-edit-popup__input"
            data-field="photoVisible"
            checked={isPhotoVisibleForTemplate(formData.photoVisibilityByTemplate, templateConfig.id)}
            onChange={() =>
              dispatchFormData({ type: FORM_ACTION.TOGGLE_PHOTO_VISIBILITY, template: templateConfig.id })
            }
          />
          <span className="direct-edit-popup__label">
            {isFinnish ? 'Näytä valokuva' : 'Show photo'}
          </span>
        </label>
      ) : null}
    </>
  )

  const renderRootScalar = () => {
    const field = schema.fields[0]

    return (
      <FieldInput
        field={field}
        value={formData[field.key]}
        isFinnish={isFinnish}
        onChange={(value) =>
          dispatchFormData({ type: FORM_ACTION.SET_ROOT_FIELD, field: field.key, value })
        }
      />
    )
  }

  const renderLinkMap = () => (
    <>
      {schema.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={formData.links?.[field.key]}
          isFinnish={isFinnish}
          onChange={(value) =>
            dispatchFormData({ type: FORM_ACTION.SET_LINK_FIELD, field: field.key, value })
          }
        />
      ))}
    </>
  )
```

Add the import needed by the photo toggle:

```jsx
import { isPhotoVisibleForTemplate } from '../utils/cvForm'
```

Add the branches to the switch, above `default`:

```jsx
      case SECTION_SHAPE.rootGroup:
        return renderRootGroup()
      case SECTION_SHAPE.rootScalar:
        return renderRootScalar()
      case SECTION_SHAPE.linkMap:
        return renderLinkMap()
```

Note `TOGGLE_PHOTO_VISIBILITY` requires `{ template }` and silently
returns unchanged state without it — `templateConfig.id` is the value to
pass, matching how the Showcases call `isPhotoVisibleForTemplate`.

- [ ] **Step 4: Run the e2e test to verify it passes**

Run: `npx playwright test e2e/direct-edit.spec.js -g "including tagline"`
Expected: PASS.

- [ ] **Step 5: Manual check of About and Links**

In the dev server, confirm: the About popup edits the summary and the text
updates live behind the popup; the Links popup edits a URL and the link
row updates; a template that renders no tagline still saves the tagline
without visual breakage.

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/SectionEditorPopup.jsx e2e/direct-edit.spec.js
git commit -m "Add header, About and Links editing to the Direct Edit popup"
```

---

### Task 5: Skills editing in the popup

**Files:**
- Modify: `src/components/SectionEditorPopup.jsx`
- Modify: `src/styles/direct-edit-popup.css`
- Modify: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: the `renderBody` switch (Task 3).
- Produces: nothing consumed later.

**Design note — read before implementing.** `ADD_SKILL` takes
`{ skill }`, trims it, and **silently no-ops on an empty or
case-insensitively duplicate value**. The existing inline `EditableChip`
auto-generates a "New skill N" label and therefore has a long-parked bug
where "+ Add" silently does nothing after a remove-then-add sequence. Do
not reproduce that: the popup takes the skill text from a real input the
user typed, so there is nothing to collide. Disable the Add button when
the input is empty, and surface a short message when the reducer rejects a
duplicate.

- [ ] **Step 1: Write the failing e2e test**

```js
  test('the popup adds, reorders and removes skills, and refuses duplicates', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="skills"]').first().hover()
    await page.locator('.direct-edit-pencil').click()

    const popup = page.locator('.direct-edit-popup')
    const rows = popup.locator('.direct-edit-popup__skill')
    const countBefore = await rows.count()

    await popup.locator('.direct-edit-popup__skill-input').fill('Popup Skill')
    await popup.locator('.direct-edit-popup__skill-add').click()
    await expect(rows).toHaveCount(countBefore + 1)

    // A duplicate is rejected by the reducer and reported, not silently dropped.
    await popup.locator('.direct-edit-popup__skill-input').fill('popup skill')
    await popup.locator('.direct-edit-popup__skill-add').click()
    await expect(rows).toHaveCount(countBefore + 1)
    await expect(popup.locator('.direct-edit-popup__notice')).toBeVisible()
  })
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/direct-edit.spec.js -g "adds, reorders and removes skills"`
Expected: FAIL — no `.direct-edit-popup__skill` elements.

- [ ] **Step 3: Add the string-array branch**

Add `useState` to the existing React import in `SectionEditorPopup.jsx`,
then add above `renderBody`:

```jsx
  const renderStringArray = () => {
    const items = Array.isArray(formData[sectionKey]) ? formData[sectionKey] : []

    const handleAdd = () => {
      const candidate = draftSkill.trim()

      if (!candidate) {
        return
      }

      const isDuplicate = items.some((skill) => skill.toLowerCase() === candidate.toLowerCase())

      if (isDuplicate) {
        setNotice(isFinnish ? 'Tämä taito on jo listalla.' : 'That skill is already listed.')
        return
      }

      dispatchFormData({ type: FORM_ACTION.ADD_SKILL, skill: candidate })
      setDraftSkill('')
      setNotice('')
    }

    return (
      <>
        {items.map((skill, index) => (
          <div key={`${skill}-${index}`} className="direct-edit-popup__skill">
            <span className="direct-edit-popup__skill-text">{skill}</span>
            <button
              type="button"
              onClick={() => dispatchFormData({ type: FORM_ACTION.MOVE_SKILL, index, direction: -1 })}
              disabled={index === 0}
              aria-label={isFinnish ? 'Siirrä ylös' : 'Move up'}
            >
              &uarr;
            </button>
            <button
              type="button"
              onClick={() => dispatchFormData({ type: FORM_ACTION.MOVE_SKILL, index, direction: 1 })}
              disabled={index === items.length - 1}
              aria-label={isFinnish ? 'Siirrä alas' : 'Move down'}
            >
              &darr;
            </button>
            <button
              type="button"
              onClick={() => dispatchFormData({ type: FORM_ACTION.REMOVE_SKILL, index })}
              aria-label={isFinnish ? 'Poista' : 'Remove'}
            >
              &times;
            </button>
          </div>
        ))}
        <div className="direct-edit-popup__skill-row">
          <input
            type="text"
            className="direct-edit-popup__input direct-edit-popup__skill-input"
            value={draftSkill}
            placeholder={isFinnish ? 'Uusi taito' : 'New skill'}
            onChange={(event) => {
              setDraftSkill(event.target.value)
              setNotice('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAdd()
              }
            }}
          />
          <button
            type="button"
            className="direct-edit-popup__skill-add"
            onClick={handleAdd}
            disabled={!draftSkill.trim()}
          >
            {isFinnish ? 'Lisää' : 'Add'}
          </button>
        </div>
        {notice ? <p className="direct-edit-popup__notice">{notice}</p> : null}
      </>
    )
  }
```

Declare the two pieces of local state near the top of the component, above
the early `if (!schema)` return so hook order stays stable:

```jsx
  const [draftSkill, setDraftSkill] = useState('')
  const [notice, setNotice] = useState('')
```

Add the branch to the switch:

```jsx
      case SECTION_SHAPE.stringArray:
        return renderStringArray()
```

- [ ] **Step 4: Style the skill rows**

Append to `src/styles/direct-edit-popup.css`:

```css
.direct-edit-popup__skill {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 12px;
}

.direct-edit-popup__skill-text {
  margin-right: auto;
  overflow-wrap: anywhere;
}

.direct-edit-popup__skill button {
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 6px;
  background: none;
  padding: 0.1rem 0.35rem;
  font-size: 11px;
  cursor: pointer;
  color: inherit;
}

.direct-edit-popup__skill button:disabled {
  opacity: 0.4;
  cursor: default;
}

.direct-edit-popup__skill-row {
  display: flex;
  gap: 0.35rem;
}

.direct-edit-popup__skill-add {
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 6px;
  background: none;
  padding: 0.3rem 0.6rem;
  font-size: 12px;
  cursor: pointer;
  color: inherit;
}

.direct-edit-popup__skill-add:disabled {
  opacity: 0.4;
  cursor: default;
}

.direct-edit-popup__notice {
  font-size: 11px;
  opacity: 0.8;
}
```

- [ ] **Step 5: Run the e2e test to verify it passes**

Run: `npx playwright test e2e/direct-edit.spec.js -g "adds, reorders and removes skills"`
Expected: PASS.

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/SectionEditorPopup.jsx src/styles/direct-edit-popup.css e2e/direct-edit.spec.js
git commit -m "Add skills editing to the Direct Edit popup"
```

---

### Task 6: Section-level controls — column-aware reorder and hide

**Files:**
- Modify: `src/components/SectionEditorPopup.jsx`
- Modify: `src/styles/direct-edit-popup.css`
- Modify: `e2e/direct-edit.spec.js`

**Interfaces:**
- Consumes: the popup header (Task 2), `templateConfig` prop.
- Produces: nothing consumed later.

**Design note — the trap this task exists to avoid.** `sectionOrder` is a
single flat array, but the user sees it filtered down to **one column**.
On a rail template the section visually above Skills in the sidebar may be
several positions away in the flat array, with main-column sections
between them. `MOVE_SECTION_ORDER` takes `{ fromSection, toSection }`
(key-to-key), so the fix is to pick `toSection` from the **column-filtered
neighbour list** — not the flat-array neighbour.
`CVForm.jsx`'s `moveSectionByDirection` uses the flat neighbour, which is
correct there because Classic's nav rail shows one flat list. Copying it
here would produce moves that appear to do nothing.

- [ ] **Step 1: Write the failing e2e test**

```js
  test('moving a sidebar section up swaps it with its own column neighbour, not a main-column section', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Creative')

    const sidebarOrderBefore = await page
      .locator('[data-export-secondary="true"] [data-export-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-export-section')))

    expect(sidebarOrderBefore.length).toBeGreaterThan(1)
    const target = sidebarOrderBefore[1]

    await page.locator(`[data-export-section="${target}"]`).first().hover()
    await page.locator('.direct-edit-pencil').click()
    await page.locator('.direct-edit-popup__move-up').click()

    const sidebarOrderAfter = await page
      .locator('[data-export-secondary="true"] [data-export-section]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-export-section')))

    expect(sidebarOrderAfter[0]).toBe(target)
  })
```

Use the spec file's existing `selectTemplate` helper.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test e2e/direct-edit.spec.js -g "swaps it with its own column neighbour"`
Expected: FAIL — no `.direct-edit-popup__move-up` button.

- [ ] **Step 3: Add the column-aware neighbour helper**

Add to `src/utils/sectionSchema.js`:

```js
// Returns the section key that sits `direction` away from `sectionKey`
// WITHIN ITS OWN COLUMN, or null at the end of that column.
//
// sectionOrder is one flat array, but a rail template splits it into a
// main column (primarySections) and a sidebar (secondarySections). The
// flat neighbour of a sidebar section is frequently a main-column section,
// so moving toward it looks like nothing happened. Callers must pass the
// key returned here as MOVE_SECTION_ORDER's `toSection`.
export function getColumnNeighbourSection(sectionKey, direction, orderedSections, templateConfig) {
  const primary = new Set(templateConfig.primarySections)
  const column = primary.has(sectionKey)
    ? orderedSections.filter((key) => primary.has(key))
    : orderedSections.filter((key) => new Set(templateConfig.secondarySections).has(key))
  const position = column.indexOf(sectionKey)

  if (position < 0) {
    return null
  }

  return column[position + direction] ?? null
}
```

- [ ] **Step 4: Add the header controls**

In `SectionEditorPopup.jsx`, **extend the two existing import statements**
rather than adding duplicates — Task 4 already imports from
`../utils/cvForm`, and Tasks 2-3 already import from
`../utils/sectionSchema`. The end state of those two lines:

```jsx
import { isPhotoVisibleForTemplate, normalizeSectionOrder } from '../utils/cvForm'
import { SECTION_SHAPE, getSectionSchema, getColumnNeighbourSection } from '../utils/sectionSchema'
```

Add above the return, after the `if (!schema)` guard:

```jsx
  // identity is not a sectionOrder section, so it has no neighbours and
  // cannot be hidden — the header always renders.
  const isOrderableSection = sectionKey !== 'identity'
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const orderedSections = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
    .filter((key) => templateSectionOrder.includes(key))

  const moveSection = (direction) => {
    const toSection = getColumnNeighbourSection(sectionKey, direction, orderedSections, templateConfig)

    if (!toSection) {
      return
    }

    dispatchFormData({
      type: FORM_ACTION.MOVE_SECTION_ORDER,
      fromSection: sectionKey,
      toSection,
      fallbackOrder: templateSectionOrder,
    })
  }

  const canMoveUp =
    isOrderableSection && Boolean(getColumnNeighbourSection(sectionKey, -1, orderedSections, templateConfig))
  const canMoveDown =
    isOrderableSection && Boolean(getColumnNeighbourSection(sectionKey, 1, orderedSections, templateConfig))
```

Add the controls into the popup header, between the title and the close
button:

```jsx
        {isOrderableSection ? (
          <div className="direct-edit-popup__section-controls">
            <button
              type="button"
              className="direct-edit-popup__move-up"
              onClick={() => moveSection(-1)}
              disabled={!canMoveUp}
              aria-label={isFinnish ? 'Siirrä osiota ylös' : 'Move section up'}
            >
              &uarr;
            </button>
            <button
              type="button"
              className="direct-edit-popup__move-down"
              onClick={() => moveSection(1)}
              disabled={!canMoveDown}
              aria-label={isFinnish ? 'Siirrä osiota alas' : 'Move section down'}
            >
              &darr;
            </button>
            <button
              type="button"
              className="direct-edit-popup__hide-section"
              onClick={() => {
                dispatchFormData({ type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section: sectionKey })
                onClose()
              }}
            >
              {isFinnish ? 'Piilota' : 'Hide'}
            </button>
          </div>
        ) : null}
```

Hiding closes the popup because the section it is anchored to is about to
leave the DOM.

- [ ] **Step 5: Style the controls**

Append to `src/styles/direct-edit-popup.css`:

```css
.direct-edit-popup__section-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.direct-edit-popup__section-controls button {
  border: 1px solid var(--color-border, #d4d4d8);
  border-radius: 6px;
  background: none;
  padding: 0.15rem 0.4rem;
  font-size: 11px;
  cursor: pointer;
  color: inherit;
}

.direct-edit-popup__section-controls button:disabled {
  opacity: 0.4;
  cursor: default;
}
```

- [ ] **Step 6: Run the e2e test to verify it passes**

Run: `npx playwright test e2e/direct-edit.spec.js -g "swaps it with its own column neighbour"`
Expected: PASS.

- [ ] **Step 7: Prove the naive version would fail**

Temporarily change `moveSection` to use the flat neighbour instead
(`orderedSections[orderedSections.indexOf(sectionKey) + direction]`), re-run
the test, and confirm it FAILS on a rail template. Restore the
column-aware version and confirm PASS. This proves the test actually
guards the trap rather than passing either way.

- [ ] **Step 8: Run lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add src/utils/sectionSchema.js src/components/SectionEditorPopup.jsx src/styles/direct-edit-popup.css e2e/direct-edit.spec.js
git commit -m "Add column-aware section reordering and hiding to the Direct Edit popup"
```

---

### Task 7: Retire the "not available yet" notice and narrow the allowlist's meaning

**Files:**
- Modify: `src/utils/directEdit.js`
- Modify: `scripts/check-direct-edit.mjs`
- Modify: `src/components/DirectEditPreview.jsx`
- Modify: `e2e/direct-edit.spec.js`

**Interfaces:**
- Produces: `INLINE_EDIT_SUPPORTED_TEMPLATES` and `isInlineEditSupported`,
  replacing `DIRECT_EDIT_SUPPORTED_TEMPLATES` / `isDirectEditSupported`.

Popup editing now works on every template, so the allowlist no longer
gates "can you edit this template" — only "does this template also have
the inline bonus". Leaving the old name would tell every future reader
that unlisted templates are uneditable, which is exactly what stops being
true.

- [ ] **Step 1: Find every call site before renaming**

Run:
```bash
grep -rn "DIRECT_EDIT_SUPPORTED_TEMPLATES\|isDirectEditSupported" src/ scripts/ e2e/
```
Record the full list. Every hit must be updated in this task — a missed
one is a build break.

- [ ] **Step 2: Rename in `src/utils/directEdit.js`**

```js
// Templates that additionally support INLINE editing — clicking text in
// the preview and typing in place. Popup editing (the hover pencil and
// section editor) works on every template regardless of this list, so a
// template missing from it is not read-only; it simply lacks the inline
// bonus layer.
export const INLINE_EDIT_SUPPORTED_TEMPLATES = ['minimal', 'classicProfessional', 'editorial', 'portrait', 'timeline', 'compact', 'executive', 'modernOrange', 'creative']

export function isInlineEditSupported(templateId) {
  return INLINE_EDIT_SUPPORTED_TEMPLATES.includes(templateId)
}
```

- [ ] **Step 3: Update `scripts/check-direct-edit.mjs`**

Update its import and every reference to the new names. Keep the script's
assertions themselves unchanged — it still validates that every listed id
is a real template id.

- [ ] **Step 4: Update `DirectEditPreview.jsx`**

Change the import and the local:

```jsx
import { isInlineEditSupported } from '../utils/directEdit'
```

```jsx
  const isInlineSupported = isInlineEditSupported(selectedTemplate)
```

**Delete the entire `{!isSupported ? (<p className="direct-edit-preview__notice">…</p>) : null}` block** — every
template is now editable, so the notice is false.

Keep `SectionsMenu` rendered unconditionally (it was previously gated on
`isSupported`; section show/hide is not inline-specific):

```jsx
      <SectionsMenu
        formData={formData}
        dispatchFormData={dispatchFormData}
        templateConfig={templateConfig}
        locale={locale}
      />
```

Keep the inline gate on `CVPreview` only:

```jsx
        directEditDispatch={isInlineSupported ? dispatchFormData : null}
```

Remove the now-unused `direct-edit-preview__notice` rule from
`src/styles/direct-edit.css` if nothing else uses it — grep first.

- [ ] **Step 5: Update the e2e spec's references**

If any existing test asserts the notice text for an unwired template,
replace that assertion with one proving the opposite: on an unwired
template (e.g. `Quadrant`), hovering a section reveals the pencil and the
popup opens:

```js
  test('an inline-unwired template is still fully editable through the popup', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await selectTemplate(page, 'Quadrant')

    await expect(page.locator('.direct-edit-preview__notice')).toHaveCount(0)

    await page.locator('[data-export-section="experience"]').first().hover()
    await page.locator('.direct-edit-pencil').click()
    await expect(page.locator('.direct-edit-popup')).toBeVisible()
  })
```

Confirm `Quadrant` is the exact gallery label used by `selectTemplate`;
if not, use the real label.

- [ ] **Step 5b: Confirm no stale references remain**

Run:
```bash
grep -rn "DIRECT_EDIT_SUPPORTED_TEMPLATES\|isDirectEditSupported\|direct-edit-preview__notice" src/ scripts/ e2e/
```
Expected: no output.

- [ ] **Step 6: Verify**

Run:
```bash
npm run check:direct-edit
npm run lint
npx playwright test e2e/direct-edit.spec.js -g "still fully editable through the popup"
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/utils/directEdit.js scripts/check-direct-edit.mjs src/components/DirectEditPreview.jsx src/styles/direct-edit.css e2e/direct-edit.spec.js
git commit -m "Narrow the editing allowlist to inline support and drop the unavailable notice"
```

---

### Task 8: All-template e2e coverage, docs, and full verification

**Files:**
- Modify: `e2e/direct-edit.spec.js` (including lifting `exportPdfAndExpectSuccess` from inside a test to file scope)
- Modify: `changes.md`
- Modify: `package.json` (patch version bump)
- Modify: `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`
- Add: `docs/superpowers/plans/2026-09-19-direct-edit-universal-sections.md` (this plan file — commit it here; it is untracked until this task)

**Interfaces:**
- Consumes: everything above. Produces: nothing — this is the last task.

- [ ] **Step 1: Add the all-template parameterized loop**

The popup is template-agnostic, so coverage inverts from one-test-per-
template into one loop across every template. Add to
`e2e/direct-edit.spec.js`:

```js
  const ALL_TEMPLATE_LABELS = [
    'Minimalist', 'Classic Professional', 'Editorial', 'Portrait', 'Modern Timeline',
    'Compact', 'Executive', 'Modern Orange', 'Creative', 'Modern Professional',
    'Graduate', 'Portfolio Hybrid', 'Tech Executive', 'Colorful Compact',
    'Developer', 'Navy Professional', 'Quadrant', 'European',
  ]

  for (const label of ALL_TEMPLATE_LABELS) {
    test(`${label}: a section pencil opens a working popup editor`, async ({ page }) => {
      await page.getByRole('tab', { name: 'Direct Edit' }).click()
      await selectTemplate(page, label)

      const section = page.locator('[data-export-section="experience"]').first()
      await expect(section).toBeVisible()

      await section.hover()
      await page.locator('.direct-edit-pencil').click()

      const popup = page.locator('.direct-edit-popup')
      await expect(popup).toBeVisible()

      const roleInput = popup.locator('input[data-field="role"]').first()
      await roleInput.fill(`${label} popup role`)
      await expect(section).toContainText(`${label} popup role`)
    })
  }
```

Before running, confirm every label matches the gallery's real labels —
read `src/utils/cvTemplates.js` and correct any that differ rather than
guessing. A wrong label makes `selectTemplate` fail confusingly.

If a specific template does not render an `experience` section at all,
use a section it does render for that template rather than deleting the
row — note the substitution in a comment.

- [ ] **Step 2: Add the empty-section test**

This one needs an empty CV, but the existing
`test.describe('Direct Edit builder')` block's `beforeEach` always clicks
"Load demo CV". So add it as its **own top-level describe block** at the
end of the file, with its own `beforeEach` that only navigates:

```js
test.describe('Direct Edit popup on an empty CV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
  })

  test('a section with no entries can still be edited and given its first entry', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    const section = page.locator('[data-export-section="experience"]').first()
    await expect(section).toBeVisible()

    await section.hover()
    await page.locator('.direct-edit-pencil').click()

    const popup = page.locator('.direct-edit-popup')
    await popup.locator('.direct-edit-popup__add').click()
    await popup.locator('input[data-field="role"]').first().fill('First ever role')

    await expect(section).toContainText('First ever role')
  })
})
```

Note the extra closing `})` — this test lives in its own describe block,
outside `test.describe('Direct Edit builder', ...)`.

- [ ] **Step 3: Extract the export helper, then add the export-safety test**

`exportPdfAndExpectSuccess` currently exists only as a local function
*inside* the test at `e2e/direct-edit.spec.js:192`, closing over `page`.
Lift it to file scope so two tests can share it, taking `page` as a
parameter:

```js
async function exportPdfAndExpectSuccess(page) {
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: 'PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  await expect(page.getByRole('alert')).toHaveCount(0)
}
```

Delete the inner declaration and update that test's two call sites to
`await exportPdfAndExpectSuccess(page)`. Its behaviour must not change —
run it after the refactor to confirm:
`npx playwright test e2e/direct-edit.spec.js -g "PDF export succeeds"`.

Then add the new test:

```js
  test('the popup overlay never appears in an exported PDF', async ({ page }) => {
    await page.getByRole('tab', { name: 'Direct Edit' }).click()

    await page.locator('[data-export-section="about"]').first().hover()
    await expect(page.locator('.direct-edit-pencil')).toBeVisible()

    // The overlay must live outside the element previewRef points at, or
    // html2canvas captures the pencil and popup chrome into the PDF.
    const overlayIsInsideExportRoot = await page.evaluate(() => {
      const root = document.querySelector('[data-export-root="true"]')
      const overlay = document.querySelector('.direct-edit-overlay-host')
      return Boolean(root && overlay && root.contains(overlay))
    })

    expect(overlayIsInsideExportRoot).toBe(false)

    await exportPdfAndExpectSuccess(page)
  })
```

- [ ] **Step 4: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: all pass. If the documented pre-existing flake on `'the footer
never overlaps the CV preview in Direct Edit mode'` appears under
parallel workers, re-run that test in isolation
(`npx playwright test e2e/direct-edit.spec.js -g "footer never overlaps" --workers=1`)
to confirm it is the known flake and not a regression. Do not paper over
any other failure.

- [ ] **Step 5: Run the rest of the verification suite**

Run:
```bash
npm run lint
npm run check:reducers
npm run check:share
npm run check:direct-edit
npm run check:section-schema
npm run build
```
Expected: all clean/pass.

- [ ] **Step 6: Fix the two stale claims in the rollout roadmap**

In `docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md`:

1. In the "Known risk to fix proactively" section, remove Creative from
   the list of templates said to need "a categorized-aware chip
   treatment" — Round 8 proved Creative renders skills flat. **Tech
   Executive stays in the list but gets a caveat** that its actual
   rendering must be read from its Showcase file before planning, not
   taken from this doc or its config.
2. Add this lesson in the same section:

```markdown
A template's `skillsLayout` config value has now been proven wrong in
BOTH directions: Compact's config said `'flat'` while its Showcase
rendered categorized, and Creative's said `'categorized'` while its
Showcase renders flat. The config value predicts nothing about a bespoke
Showcase — always read the actual Showcase file before planning a round.
```

3. Add a status line at the top noting that the per-template inline
   rollout is no longer the critical path for editability, and pointing
   at `docs/superpowers/specs/2026-09-19-direct-edit-universal-sections-design.md`.

- [ ] **Step 7: Add the `changes.md` entry**

Add at the top of the "Running log", matching the style of the entry
below it:

```markdown
## Direct Edit: every section on every template is now editable — 2026-09-19

Direct Edit gains a section editor: hovering any section in the live
preview reveals a pencil, and clicking it opens a popup with every field
that section holds — including fields a template never displays (the
`tagline`, an education `location`), which no amount of inline wiring
could reach. It works on all 18 templates with no per-template code,
because it hangs off the `data-export-section`/`data-export-header`
attributes every template already carried for the PDF exporter. Sections
can be reordered within their column and hidden from the same popup, and
entries can be added, duplicated, removed, reordered and individually
hidden. Because the popup uses real form inputs rather than
`contentEditable`, it is structurally immune to the three bug classes the
inline rollout kept hitting — `text-transform` corrupting saved text,
multi-line descriptions collapsing, and `EditableList`'s wrapper breaking
positional CSS. It also fixes a bug parked since Phase 1: entries hidden
in Classic mode are now listed in the popup with an explicit visibility
toggle instead of silently reappearing. The "Direct Edit isn't available
yet for this template" notice is gone, because it is no longer true.
```

- [ ] **Step 8: Bump the version**

In `package.json`, bump the patch version (currently `1.2.46` → `1.2.47`;
verify the real current value first).

- [ ] **Step 9: Commit**

```bash
git add e2e/direct-edit.spec.js changes.md package.json docs/superpowers/specs/2026-09-14-direct-edit-phase2-rollout.md docs/superpowers/plans/2026-09-19-direct-edit-universal-sections.md
git commit -m "Add all-template popup e2e coverage, changelog entry and roadmap corrections"
```

---

## After this plan: final whole-branch review

Dispatch one final whole-branch review (opus) over all eight tasks'
combined diff before considering this done. Direct particular attention at:

- **Export safety.** The overlay must never reach `html2canvas`. Verify
  live, with a real export on a template that has a popup open, not just
  by reading the DOM tree.
- **Index correctness.** Re-derive that every dispatch carrying an `index`
  got it from a map over `formData[section]` and never from a
  snapshot-filtered or DOM-derived list — the hazard that produced Round
  5's bug.
- **The column-aware reorder.** Confirm on a real rail template (Creative
  or Executive) that moving a sidebar section up does not swap it with a
  main-column section, and that the disabled states are right at both
  ends of a column.
- **Pointer-events layering.** The overlay covers the preview; confirm
  inline `contentEditable` editing on the 9 wired templates still works
  underneath it and that no click is being swallowed.
- **Popup anchoring at the page edges.** A section near the right edge or
  the bottom of a long CV should still get a fully visible popup.
