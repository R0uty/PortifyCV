import { test, expect } from './fixtures/base.js'
import { pickTemplate } from './helpers/templateGallery.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { CV_FONT_OPTIONS } from '../src/utils/cvFonts.js'
import { clearCv, copyShareLink, fontTrigger, styleTrigger } from './helpers/builderToolbar.js'

// The Style picker (Phase 3) in both builder modes, and how a picked
// variant persists (share link, JSON, session restore, template switch,
// undo).
const styleGroup = (page) => page.getByRole('radiogroup', { name: 'Select style' })

for (const mode of ['classic', 'direct']) {
  test.describe(`Style picker (${mode})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/cv?template=developer')
      if (mode === 'direct') await page.getByRole('tab', { name: 'Direct Edit' }).click()
    })

    test('lists the template\'s looks with the current one checked', async ({ page }) => {
      await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original')
      await (await styleTrigger(page)).click()
      await expect(styleGroup(page).getByRole('radio')).toHaveCount(getTemplateVariants('developer').length)
      await expect(styleGroup(page).getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'true')
      await page.keyboard.press('Escape')
      await expect(styleGroup(page)).toBeHidden()
      await expect(await styleTrigger(page)).toBeFocused()
    })

    test('works from the keyboard', async ({ page }) => {
      const next = getTemplateVariants('developer')[1]
      await (await styleTrigger(page)).focus()
      await page.keyboard.press('Enter')
      const original = styleGroup(page).getByRole('radio', { name: 'Original' })
      const nextRadio = styleGroup(page).getByRole('radio', { name: next.label.en })
      await expect(original).toBeFocused()
      // Arrows move focus to a different look without picking it.
      await page.keyboard.press('ArrowDown')
      await expect(nextRadio).toBeFocused()
      await expect(original).not.toBeFocused()
      await expect(original).toHaveAttribute('aria-checked', 'true')
      await page.keyboard.press('ArrowUp')
      await expect(original).toBeFocused()
      // Enter on a non-checked look picks it and closes the panel.
      await page.keyboard.press('ArrowDown')
      await expect(nextRadio).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(styleGroup(page)).toBeHidden()
      await expect(await styleTrigger(page)).toBeFocused()
      await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${next.label.en}`)
    })

    test('a font tweak shows Modified; picking the look again resets it', async ({ page }) => {
      await (await fontTrigger(page)).click()
      await page.getByRole('option', { name: 'Georgia' }).click()
      await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original, Modified')
      await (await styleTrigger(page)).click()
      await styleGroup(page).getByRole('radio', { name: 'Original' }).click()
      await expect(await fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
      await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    })
  })
}

test('the picker follows the selected template', async ({ page }) => {
  await page.goto('/cv?template=creative')
  await (await styleTrigger(page)).click()
  await expect(styleGroup(page).getByRole('radio')).toHaveCount(getTemplateVariants('creative').length)
})

test('Finnish labels', async ({ page }) => {
  await page.goto('/cv?template=developer')
  await page.getByRole('button', { name: 'Switch language' }).click()
  await expect(page.getByRole('banner').getByRole('button', { name: 'Ulkoasu' })).toBeVisible()
  await expect(await styleTrigger(page)).toHaveAccessibleName('Valitse tyyli: Alkuperäinen')
})

// Acceptance for the toolbar's width (1.6.67): at 1280x720 it is one row
// for every template in both modes, even with the look Modified (the
// Design button then carries a dot). Style, Font and Headings used to sit
// in the toolbar itself and wrapped it onto a second row at most laptop
// widths; they live in the Design panel now.
for (const mode of ['classic', 'direct']) {
  test(`at 1280px the toolbar is one row (${mode}, every template, Modified) @slow`, async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 1280, height: 720 })
    const wrapped = []
    for (const { id } of cvTemplates) {
      await page.goto(`/cv?template=${id}`)
      await page.getByRole('tab', { name: mode === 'direct' ? 'Direct Edit' : 'Classic' }).click()
      await (await fontTrigger(page)).click()
      await page.getByRole('option', { name: 'Times New Roman' }).click()
      await expect(await styleTrigger(page)).toHaveAccessibleName(/, Modified$/)
      await page.keyboard.press('Escape')
      // Controls on one row share a vertical middle.
      const middles = await page.evaluate(() => [
        '[aria-label="Return to landing"]',
        '.app-toolbar__template-trigger',
        '.app-toolbar__primary',
      ].map((selector) => {
        const box = document.querySelector(selector).getBoundingClientRect()
        return Math.round(box.top + box.height / 2)
      }))
      if (new Set(middles).size !== 1) wrapped.push(`${id}: control middles ${middles.join(', ')}`)
    }
    expect(wrapped).toEqual([])
  })
}

const minimalVariant = getTemplateVariants('minimal')[1]

test('picking a variant changes the look and its font', async ({ page }) => {
  await page.goto('/cv?template=minimal')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
  await expect(await fontTrigger(page)).toHaveAccessibleName(/^Select font: (Helvetica|Georgia)$/)
  // toHaveCSS can't read custom properties, so read the computed value directly.
  await expect.poll(() => page.locator('.app-shell__preview [data-export-variant="minimal"]')
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--min-accent-ink').trim()))
    .toBe(minimalVariant.palette['--min-accent-ink'])
  // The off-screen export source (the PDF's source) gets the variant too.
  await expect.poll(() => page.locator('.direct-edit-export-source [data-export-root="true"]')
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--min-accent-ink').trim()))
    .toBe(minimalVariant.palette['--min-accent-ink'])
})

test('a variant survives a share link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=minimal')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await copyShareLink(page)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())

  const fresh = await context.newPage()
  await fresh.goto(url)
  await expect(await styleTrigger(fresh))
    .toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('a variant survives a JSON export and import', async ({ page }, testInfo) => {
  await page.goto('/cv?template=minimal')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: 'JSON' }).click()
  const path = testInfo.outputPath('cv.json')
  await (await downloadPromise).saveAs(path)

  await page.goto('/cv?template=minimal')
  await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles(path)
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('a variant survives a session restore', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('portifycv-session-restore-enabled', 'true'))
  await page.goto('/cv?template=minimal')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem('portifycv-session-snapshot')))
    .toContain(minimalVariant.id)
  await page.reload()
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
})

test('switching templates from the gallery applies each template\'s stored look', async ({ page }) => {
  const developerVariant = getTemplateVariants('developer')[2]
  const label = (id) => cvTemplates.find((template) => template.id === id).label
  await page.goto('/cv?template=minimal')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  // A gallery card's Use applies the look the card shows (Phase 4): the
  // other template's stored look, here Original, font included.
  await pickTemplate(page, label('developer'))
  await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await expect(await fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: developerVariant.label.en }).click()
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${developerVariant.label.en}`)
  await pickTemplate(page, label('minimal'))
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
  await pickTemplate(page, label('developer'))
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${developerVariant.label.en}`)
})

test('undo restores the previous look', async ({ page }) => {
  await page.goto('/cv?template=minimal')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original')
  await expect(await fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
})

// A share link opens on the sender's template (1.6.8), so that template's
// look arrives complete — palette, accent, font and headings colour.
test('a share link opens on the sender\'s template and look', async ({ page, context }) => {
  const developerVariant = getTemplateVariants('developer')[1]
  const developerLabel = cvTemplates.find((template) => template.id === 'developer').label
  const fontLabel = CV_FONT_OPTIONS.find((font) => font.id === developerVariant.fontId).label
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=developer')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: developerVariant.label.en }).click()
  await copyShareLink(page)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())

  const fresh = await context.newPage()
  await fresh.goto(url)
  await expect(fresh.locator('.app-toolbar__template-trigger-label')).toHaveText(developerLabel)
  await expect(await styleTrigger(fresh))
    .toHaveAccessibleName(`Select style: ${developerVariant.label.en}`)
  await expect(await fontTrigger(fresh))
    .toHaveAccessibleName(`Select font: ${fontLabel}`)
})

// A loaded CV seeds every template's stored look accent, not only the
// template the link opens on.
test('a share link restores another template\'s look accent', async ({ page, context }) => {
  const creativeVariant = getTemplateVariants('creative')[1]
  const creativeLabel = cvTemplates.find((template) => template.id === 'creative').label
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=creative')
  await (await styleTrigger(page)).click()
  await styleGroup(page).getByRole('radio', { name: creativeVariant.label.en }).click()
  await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${creativeVariant.label.en}`)
  // Send the link from another template, so Creative's look has to come
  // from the stored looks rather than from the template the link opens on.
  await pickTemplate(page, cvTemplates.find((template) => template.id === 'minimal').label)
  await copyShareLink(page)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())

  const fresh = await context.newPage()
  await fresh.goto(url)
  await expect(fresh.locator('.app-toolbar__template-trigger-label')).toHaveText('Minimalist')
  await expect(await styleTrigger(fresh)).toHaveAccessibleName('Select style: Original')
  await pickTemplate(fresh, creativeLabel)
  await expect.poll(() => fresh.locator('.app-shell__preview [data-export-variant="creative"]')
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--tpl-accent').trim().toLowerCase()))
    .toBe(creativeVariant.accent.toLowerCase())
})

// The template a link carries wins over a ?template= in the same URL.
test('a share link\'s template wins over ?template=', async ({ page, context }) => {
  const developerLabel = cvTemplates.find((template) => template.id === 'developer').label
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/cv?template=developer')
  await copyShareLink(page)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#data=')
  const url = await page.evaluate(() => navigator.clipboard.readText())
  const conflicting = url.replace('/cv#', '/cv?template=creative#')
  expect(conflicting).toContain('template=creative')

  const fresh = await context.newPage()
  await fresh.goto(conflicting)
  await expect(fresh.locator('.app-toolbar__template-trigger-label')).toHaveText(developerLabel)
})

// Load demo CV and Clear CV replace the whole CV, so they apply the new
// CV's look like every other whole-CV load; undo restores the old look.
for (const action of ['Load demo CV', 'Clear CV']) {
  test(`${action} resets to the CV's look and undo restores it`, async ({ page }) => {
    await page.goto('/cv?template=minimal')
    await (await styleTrigger(page)).click()
    await styleGroup(page).getByRole('radio', { name: minimalVariant.label.en }).click()
    await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
    // Undo history groups changes made within HISTORY_COMMIT_DELAY_MS
    // (600 ms, ResumeBuilderPage.jsx); wait past it so the pick and the
    // whole-CV replacement are separate steps, as for a real user.
    await page.waitForTimeout(800)
    if (action === 'Clear CV') await clearCv(page)
    else await page.getByRole('button', { name: action }).first().click()
    await expect(await styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    await expect(await fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(await styleTrigger(page)).toHaveAccessibleName(`Select style: ${minimalVariant.label.en}`)
    await expect(await fontTrigger(page)).toHaveAccessibleName(new RegExp(`^Select font: ${minimalVariant.fontId === 'georgia' ? 'Georgia' : 'Helvetica'}$`))
  })
}
