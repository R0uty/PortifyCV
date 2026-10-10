# Template in Share Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A share link carries the sender's selected template (new permanent payload key `tp`) and opens on it, so that template's stored look arrives complete.

**Architecture:**
- `shareLinks.js` writes `d.tp` when encoding and returns it next to the CV when reading the location. One private parse step serves both readers.
- The builder's share branch passes it on as `sharedTemplateId` in the initial session.
- `uiReducer`'s `createInitialUiState` resolves it through a factored-out `resolveTemplateId` (legacy alias, then validity) ahead of `?template=`.

**Tech Stack:**
- React 19 + Vite.
- Framework-free Node `check:*` scripts.
- Playwright e2e against a production build.

**Spec:** `docs/superpowers/specs/2026-10-10-template-in-share-links-design.md`. Read it first.

## Global Constraints

- Branch: this worktree's branch, tracking `origin/v1.6.0`. Never push. Never merge into `main`.
- Commits carry only the user's name: **no `Co-Authored-By` line and no attribution trailer of any kind**.
- Version 1.6.8 goes in a standalone `Bump version to 1.6.8` commit (`npm version 1.6.8 --no-git-tag-version`) at the end of Task 2.
- `tp` is a new **permanent** share key. Never repurpose or rename an existing key. `SHARE_PAYLOAD_VERSION` stays `3`.
- Old links (no `tp`) must still decode to the same CV and open exactly as before.
- Before the bump commit: `npm run lint`, all 8 `npm run check:*`, `CI=1 npm run test:e2e`, `npm run build`.
- Never use bare `git stash`.

---

### Task 1: The `tp` key in the share-link codec, and the builder's call sites

**Files:**
- Modify: `src/utils/shareLinks.js` (`encodeCvStateForUrl` ~399, `decodeCvStateFromUrl` ~406, `buildShareUrl` ~443, `readCvStateFromLocation` ~470)
- Modify: `scripts/check-share-links.mjs` (the `buildShareUrl`/`readCvStateFromLocation` lines near the end, plus new checks)
- Modify: `src/pages/ResumeBuilderPage.jsx` (`loadInitialCvSession`'s share branch ~300; `handleCopyShareLink` ~1148)

**Interfaces:**
- Produces:
  - `encodeCvStateForUrl(formData, templateId = null) => string`
  - `buildShareUrl(formData, { templateId = null, currentHref = window.location.href } = {}) => string`
  - `readCvStateFromLocation(currentHref = window.location.href) => { formData, templateId: string|null } | null`
  - `decodeCvStateFromUrl(encoded) => formData`, unchanged
  - the session field `sharedTemplateId` (string|null) on the share-link branch's return value
- Consumed by Task 2: `initialSession.sharedTemplateId`.

- [ ] **Step 1: Write the failing checks**

In `scripts/check-share-links.mjs`, replace the last block before the final `console.log`:

```js
const url = share.buildShareUrl(demo, 'https://portifycv.app/?stale=1#stale')
const fromUrl = share.readCvStateFromLocation(url)
check('buildShareUrl output can be read back', fromUrl.fullName === demo.fullName,
  `url length ${url.length}, path ${new URL(url).pathname}`)
```

with:

```js
const url = share.buildShareUrl(demo, { currentHref: 'https://portifycv.app/?stale=1#stale' })
const fromUrl = share.readCvStateFromLocation(url)
check('buildShareUrl output can be read back', fromUrl.formData.fullName === demo.fullName,
  `url length ${url.length}, path ${new URL(url).pathname}`)
check('a link built without a template reads back templateId null', fromUrl.templateId === null)

// The sender's selected template travels under its own key ('tp', 1.6.8).
const templateUrl = share.buildShareUrl(demo, { templateId: 'developer', currentHref: 'https://portifycv.app/cv' })
const fromTemplateUrl = share.readCvStateFromLocation(templateUrl)
check('the selected template survives the round trip', fromTemplateUrl.templateId === 'developer')
check('the CV is unchanged when a template travels too',
  diff(demo, fromTemplateUrl.formData).length === 0, diff(demo, fromTemplateUrl.formData).join('; '))
const templateEncoded = new URLSearchParams(new URL(templateUrl).hash.slice(1)).get('data')
check('the template travels as tp', rawPayload(templateEncoded).d.tp === 'developer')
check('decodeCvStateFromUrl still returns only the CV',
  diff(demo, share.decodeCvStateFromUrl(templateEncoded)).length === 0)
check('no template encodes no tp key', !('tp' in rawPayload(share.encodeCvStateForUrl(demo)).d))
check('an empty template encodes no tp key', !('tp' in rawPayload(share.encodeCvStateForUrl(demo, '')).d))

// A link made before 1.6.8 has no tp; a hand-built one may carry junk.
const oldLink = `https://portifycv.app/cv#data=${demoEncoded}`
check('an old link (no tp) reads back templateId null',
  share.readCvStateFromLocation(oldLink).templateId === null
    && diff(demo, share.readCvStateFromLocation(oldLink).formData).length === 0)
const junkPayload = { ...rawPayload(demoEncoded) }
junkPayload.d = { ...junkPayload.d, tp: 42 }
const junkLink = `https://portifycv.app/cv#data=${Buffer.from(JSON.stringify(junkPayload), 'utf8').toString('base64url')}`
check('a non-string tp reads back templateId null', share.readCvStateFromLocation(junkLink).templateId === null)
check('a URL without share data reads back null', share.readCvStateFromLocation('https://portifycv.app/cv') === null)
```

`rawPayload`, `demoEncoded` and `diff` are already defined earlier in the script.

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run check:share`
Expected: it fails. `fromUrl.formData` is undefined (a TypeError, or FAIL lines).

- [ ] **Step 3: Implement the codec**

In `src/utils/shareLinks.js`, replace `encodeCvStateForUrl` and `decodeCvStateFromUrl` with:

```js
// `templateId` is the sender's selected template ('tp', 1.6.8) — permanent
// once shipped, like every other key here. It isn't CV data, so it's added
// beside the compressed CV rather than in compressCvData.
export function encodeCvStateForUrl(formData, templateId = null) {
  const payload = compressCvData(formData)

  if (typeof templateId === 'string' && templateId) {
    payload.d.tp = templateId
  }

  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)

  return encodeBase64Url(bytes)
}

// base64url → the raw payload object. The one parse step behind both
// decodeCvStateFromUrl and readCvStateFromLocation.
function parseSharePayload(encodedValue) {
  if (typeof encodedValue !== 'string' || !encodedValue.trim()) {
    throw new Error('Shared CV data is missing.')
  }

  if (encodedValue.length > MAX_SHARE_DATA_LENGTH) {
    throw new Error('Shared CV link is too large to restore. Import the JSON file instead.')
  }

  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedValue)))
  } catch {
    throw new Error('Shared CV link is invalid or corrupted.')
  }
}

function cvFromPayload(payload) {
  try {
    return parseImportedCvData(expandCvData(payload))
  } catch {
    throw new Error('Shared CV link is invalid or corrupted.')
  }
}

// The raw 'tp' value, or null for a link made before 1.6.8 (or a junk
// value). The builder validates it (uiReducer's resolveTemplateId).
function templateFromPayload(payload) {
  const templateId = isPlainObject(payload) && isPlainObject(payload.d) ? payload.d.tp : null
  return typeof templateId === 'string' && templateId ? templateId : null
}

export function decodeCvStateFromUrl(encodedValue) {
  return cvFromPayload(parseSharePayload(encodedValue))
}
```

Replace `buildShareUrl`'s signature and first line:

```js
export function buildShareUrl(formData, { templateId = null, currentHref = window.location.href } = {}) {
  const encodedValue = encodeCvStateForUrl(formData, templateId)
```

The rest of the function is unchanged.

Replace `readCvStateFromLocation`'s body after `if (!encodedValue) { return null }` so it returns both parts:

```js
  const payload = parseSharePayload(encodedValue)
  return { formData: cvFromPayload(payload), templateId: templateFromPayload(payload) }
```

Also add one sentence to its block comment: "Returns the CV and the sender's selected template ('tp'; null for links made before 1.6.8)."

- [ ] **Step 4: Update the builder's two call sites**

In `src/pages/ResumeBuilderPage.jsx`'s `loadInitialCvSession`, change the share branch to:

```js
    const shared = readCvStateFromLocation()

    if (shared) {
      markOnboardingSeen()
      return {
        formData: shared.formData,
        // The sender's selected template (1.6.8); createInitialUiState
        // opens on it when it resolves.
        sharedTemplateId: shared.templateId,
        initialToast: createToast('Loaded CV from share link.', 'success'),
        clearShareParam: false,
        storageIssue: hasStorageIssue,
        pendingExampleId: null,
      }
    }
```

In `handleCopyShareLink`, change `shareUrl = buildShareUrl(formData)` to `shareUrl = buildShareUrl(formData, { templateId: selectedTemplate })`, and add `selectedTemplate` to that `useCallback`'s dependency array.

- [ ] **Step 5: Run the checks and watch them pass**

Run: `npm run check:share && npm run lint`
Expected: `All share-link checks passed.` and a clean lint.

- [ ] **Step 6: Commit**

```bash
git add src/utils/shareLinks.js scripts/check-share-links.mjs src/pages/ResumeBuilderPage.jsx
git commit -m "Carry the selected template in share links as tp"
```

---

### Task 2: Open a shared link on its template; tests, docs, gate, 1.6.8

**Files:**
- Modify: `src/reducers/uiReducer.js` (`readInitialTemplateId` ~45-54; `createInitialUiState`'s `selectedTemplate` ~128)
- Modify: `scripts/check-reducers.mjs` (import line 35; a new block)
- Modify: `e2e/style-variants.spec.js` (imports; the test `a share link restores another template's look accent`; a new test)
- Modify: `CLAUDE.md`, `changes.md`, `todo.md`

**Interfaces:**
- Consumes: Task 1's `initialSession.sharedTemplateId`.
- Produces: `export function resolveTemplateId(raw) => string | null`.

- [ ] **Step 1: Write the failing reducer checks**

In `scripts/check-reducers.mjs`, extend line 35's import with `resolveTemplateId`:

```js
const { uiReducer, UI_ACTION, createInitialUiState, pickTemplateLook, resolveTemplateId } = await importSrc('reducers/uiReducer.js')
```

Add this block right after the `RESTORE_TEMPLATE_LOOK` block (the one that starts with the comment "A gallery Use's undo step (1.6.6)"):

```js
{
  // A share link opens on the sender's template (1.6.8).
  check('resolveTemplateId accepts a real template', resolveTemplateId('creative') === 'creative')
  check('resolveTemplateId maps the retired classic id', resolveTemplateId('classic') === 'classicProfessional')
  check('resolveTemplateId rejects an unknown id', resolveTemplateId('no-such-template') === null)
  check('resolveTemplateId rejects null', resolveTemplateId(null) === null)
  const fallback = createInitialUiState({}).selectedTemplate
  check('a shared template is selected', createInitialUiState({ sharedTemplateId: 'creative' }).selectedTemplate === 'creative')
  check('a shared retired id opens its successor',
    createInitialUiState({ sharedTemplateId: 'classic' }).selectedTemplate === 'classicProfessional')
  check('an unknown shared template falls back as before',
    createInitialUiState({ sharedTemplateId: 'no-such-template' }).selectedTemplate === fallback)
  check('no shared template falls back as before',
    createInitialUiState({ sharedTemplateId: null }).selectedTemplate === fallback)
}
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run check:reducers`
Expected: `TypeError: resolveTemplateId is not a function`.

- [ ] **Step 3: Implement the resolution**

In `src/reducers/uiReducer.js`, replace `readInitialTemplateId` (and its comment block) with:

```js
// A template id from outside — a `?template=<id>` deep link (e.g. "Use this
// template" on the Free CV Templates page) or a share link's 'tp' (1.6.8) —
// trusted only once checked against the real template map, after mapping a
// retired id onto its successor. Null for anything unrecognized.
export function resolveTemplateId(raw) {
  const templateId = LEGACY_TEMPLATE_ALIASES[raw] ?? raw
  return isValidTemplateId(templateId) ? templateId : null
}

// ?template=<id> opens the builder on that template; an unrecognized or
// missing id falls back to defaultTemplateId exactly like before.
export function readInitialTemplateId() {
  if (typeof window === 'undefined') {
    return defaultTemplateId
  }

  return resolveTemplateId(new URLSearchParams(window.location.search).get('template')) ?? defaultTemplateId
}
```

In `createInitialUiState`, change `selectedTemplate: readInitialTemplateId(),` to:

```js
    // A share link opens on the sender's template (1.6.8), ahead of a
    // ?template= in the same URL; otherwise ?template=, then the default.
    selectedTemplate: resolveTemplateId(initialSession?.sharedTemplateId) ?? readInitialTemplateId(),
```

`LEGACY_TEMPLATE_ALIASES` is declared above `readInitialTemplateId` already. `readInitialClassicNameAlignment` stays as it is.

- [ ] **Step 4: Run it and watch it pass**

Run: `npm run check:reducers && npm run lint`
Expected: `All reducer checks passed.` and a clean lint.

- [ ] **Step 5: e2e — the shared template opens**

In `e2e/style-variants.spec.js`, add an import after line 3:

```js
import { CV_FONT_OPTIONS } from '../src/utils/cvFonts.js'
```

Replace the whole test `a share link restores another template's look accent` (with its comment above it) with:

```js
// A share link opens on the sender's template (1.6.8), so that template's
// look arrives complete — palette, accent, font and headings colour.
test('a share link opens on the sender\'s template and look', async ({ page, context }) => {
  const developerVariant = getTemplateVariants('developer')[1]
  const developerLabel = cvTemplates.find((template) => template.id === 'developer').label
  const fontLabel = CV_FONT_OPTIONS.find((font) => font.id === developerVariant.fontId).label
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=developer')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: developerVariant.label.en }).click()
  await page.getByRole('button', { name: 'Copy share link' }).click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())

  const fresh = await context.newPage()
  await fresh.goto(url)
  await expect(fresh.locator('.app-toolbar__template-trigger-label')).toHaveText(developerLabel)
  await expect(fresh.getByRole('banner').getByRole('button', { name: /^Select style:/ }))
    .toHaveAccessibleName(`Select style: ${developerVariant.label.en}`)
  await expect(fresh.getByRole('banner').getByRole('button', { name: /^Select font:/ }))
    .toHaveAccessibleName(`Select font: ${fontLabel}`)
})

// A loaded CV seeds every template's stored look accent, not only the
// template the link opens on.
test('a share link restores another template\'s look accent', async ({ page, context }) => {
  const creativeVariant = getTemplateVariants('creative')[1]
  const creativeLabel = cvTemplates.find((template) => template.id === 'creative').label
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=creative')
  await styleTrigger(page).click()
  await styleGroup(page).getByRole('radio', { name: creativeVariant.label.en }).click()
  await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${creativeVariant.label.en}`)
  // Send the link from another template, so Creative's look has to come
  // from the stored looks rather than from the template the link opens on.
  await pickTemplate(page, cvTemplates.find((template) => template.id === 'minimal').label)
  await page.getByRole('button', { name: 'Copy share link' }).click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())

  const fresh = await context.newPage()
  await fresh.goto(url)
  await expect(fresh.locator('.app-toolbar__template-trigger-label')).toHaveText('Minimalist')
  await pickTemplate(fresh, creativeLabel)
  await expect.poll(() => fresh.locator('.app-shell__preview [data-export-variant="creative"]')
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--tpl-accent').trim().toLowerCase()))
    .toBe(creativeVariant.accent.toLowerCase())
})
```

`pickTemplate`, `styleTrigger` and `styleGroup` are defined earlier in this file.

Run: `CI=1 npx playwright test e2e/style-variants.spec.js e2e/template-looks.spec.js`
Expected: all pass.

To confirm the new test really depends on the change, temporarily revert Task 1's `templateId: selectedTemplate` argument in `handleCopyShareLink` and run `CI=1 npx playwright test e2e/style-variants.spec.js -g "sender"`. Expected: it fails, opening on Minimalist. Then restore the argument and re-run the spec green. Record both runs in your report.

- [ ] **Step 6: Docs**

**`CLAUDE.md`.** In the "Share links carry the whole CV" paragraph, replace "The per-template style-variant choice travels under the `va` key." with:

```markdown
The per-template style-variant choice travels under the `va` key, and
the sender's selected template under `tp` (1.6.8; the link opens on it —
older links without it open on the default template).
```

**`changes.md`.** Add a new top entry above `## Look names on template cards — 1.6.7, 2026-10-10`:

```markdown
## Share links open on the sender's template — 1.6.8, 2026-10-10

A share link now remembers which template the sender had open and opens
on it, so the template's chosen look arrives complete: its colours,
accent, font and headings colour. Before, every share link opened on
Minimalist, and a look's font and headings colour couldn't travel. The
template travels inside the link's `#data=` part, which browsers never
send to a server, under a new key `tp`. Links made before 1.6.8 have no
template and still open on Minimalist, exactly as before. Hand-picked
accent, font or headings-colour tweaks still don't travel; looks do.
```

**`todo.md`.** Make two edits.

1. Replace this sentence in the Phase 3 "Known gaps" paragraph:

   > Share links don't carry the selected template (they always open on Minimalist), so a non-Minimalist look's font and headings colour can't travel via a share link; its palette and accent do.

   with:

   > ~~Share links don't carry the selected template~~ — fixed 1.6.8: the link carries it as `tp` and opens on it (spec `docs/superpowers/specs/2026-10-10-template-in-share-links-design.md`).

   Keep the line wrapping consistent with the paragraph.
2. In the Phase 4 "Still open (not in this phase)" sentence, remove "the selected template in share links; " and append a sentence after that paragraph: "The selected template in share links was done in 1.6.8."

- [ ] **Step 7: Full gate**

Run each command and keep its output for the report:

```bash
npm run lint
```

```bash
for s in share reducers feedback docx-export section-schema section-columns template-pages template-variants; do npm run -s check:$s > /dev/null && echo "ok $s" || echo "FAIL $s"; done
```

```bash
CI=1 npm run test:e2e
```

```bash
npm run build
```

Expected:
- lint is clean;
- 8 × `ok`;
- the e2e run ends `N passed` with 0 failed;
- the build succeeds.

On any failure, debug it properly. Never weaken an assertion, and never touch `e2e/fixtures/pdfPages.js` or `layoutAllowlist.js`.

- [ ] **Step 8: Commit, then bump**

```bash
git add src/reducers/uiReducer.js scripts/check-reducers.mjs e2e/style-variants.spec.js CLAUDE.md changes.md todo.md
git commit -m "Open a shared link on the sender's template"
npm version 1.6.8 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Bump version to 1.6.8"
```

Don't push.
