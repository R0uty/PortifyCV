import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { pdfText } from './helpers/pdfFile.js'
import { downloadFromPdfPreview } from './helpers/pdfPreview.js'
import { headingColorTrigger, styleTrigger } from './helpers/builderToolbar.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { NAME_OWN_COLOR_VARIABLES } from '../src/utils/cvHeadingColors.js'

// Coverage for the cover-letter generator (todo items 20 / 26). It has
// check:reducers coverage for its UI-state transitions but no end-to-end
// spec, unlike the rest of the editor/export flows.

const navRail = (page) =>
  page.getByRole('navigation', { name: 'Section navigation' })

async function openCoverLetter(page) {
  await page.goto('/cv')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
  await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
  const dialog = page.getByRole('dialog', { name: 'Cover letter' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Cover letter', () => {
  test('generates a draft from the CV and enables the export actions', async ({ page }) => {
    const dialog = await openCoverLetter(page)

    const draft = dialog.getByRole('textbox', { name: 'Draft (editable)' })
    await expect(draft).toHaveValue('')
    await expect(dialog.getByRole('button', { name: 'Copy to clipboard' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Download .txt' })).toBeDisabled()

    await dialog.getByRole('button', { name: 'Generate draft' }).click()

    await expect(draft).toHaveValue(/John Doe/)
    await expect(dialog.getByRole('button', { name: 'Copy to clipboard' })).toBeEnabled()
    await expect(dialog.getByRole('button', { name: 'Download .txt' })).toBeEnabled()
    await expect(dialog.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
    // The button flips to "Regenerate" once there is a draft.
    await expect(dialog.getByRole('button', { name: 'Regenerate draft' })).toBeVisible()
  })

  test('the company field flows into the generated draft', async ({ page }) => {
    const dialog = await openCoverLetter(page)

    await dialog.getByRole('textbox', { name: 'Company' }).fill('Northwind Labs')
    await dialog.getByRole('button', { name: 'Generate draft' }).click()

    await expect(dialog.getByRole('textbox', { name: 'Draft (editable)' })).toHaveValue(/Northwind Labs/)
  })

  test('copies the draft to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const dialog = await openCoverLetter(page)

    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    await dialog.getByRole('button', { name: 'Copy to clipboard' }).click()

    await expect(page.getByText('Cover letter copied to clipboard.')).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('John Doe')
  })

  test('downloads the draft as a .txt file', async ({ page }) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('button', { name: 'Generate draft' }).click()

    const downloadPromise = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Download .txt' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/cover-letter\.txt$/)
  })

  test('the letter survives a reload', async ({ page }) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    const draft = dialog.getByRole('textbox', { name: 'Draft (editable)' })
    await expect(draft).toHaveValue(/John Doe/)
    const before = await draft.inputValue()
    // Session restore writes the snapshot on a debounce: wait until it holds
    // this letter, not merely until something is stored.
    await expect.poll(() => page.evaluate(() => {
      try {
        return JSON.parse(window.sessionStorage.getItem('portifycv-session-snapshot') ?? '{}').coverLetter?.body ?? ''
      } catch {
        return ''
      }
    })).toBe(before)

    await page.reload()
    await expect(page.getByText('Restored your last session.')).toBeVisible()
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    await expect(page.getByRole('dialog', { name: 'Cover letter' })
      .getByRole('textbox', { name: 'Draft (editable)' })).toHaveValue(before)
  })

  test('the letter travels in JSON export', async ({ page }, testInfo) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Draft (editable)' })).toHaveValue(/John Doe/)
    await page.keyboard.press('Escape')

    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'JSON' }).click()
    const path = testInfo.outputPath('cv.json')
    await (await downloadPromise).saveAs(path)
    const exported = JSON.parse(await readFile(path, 'utf8'))
    expect(exported.coverLetter.body).toContain('John Doe')
  })

  test('loading the demo replaces the letter', async ({ page }) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('textbox', { name: 'Draft (editable)' }).fill('My own letter')
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    await expect(page.getByRole('dialog', { name: 'Cover letter' })
      .getByRole('textbox', { name: 'Draft (editable)' })).toHaveValue('')
  })

  test('a Finnish CV in the English builder drafts in Finnish', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    const settings = page.getByRole('dialog', { name: 'Settings' })
    await settings.getByRole('button', { name: 'Suomi', exact: true }).click()
    await page.keyboard.press('Escape')

    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const dialog = page.getByRole('dialog', { name: 'Cover letter' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Draft (editable)' })).toHaveValue(/Ystävällisin terveisin/)
  })

  test('a pasted job ad fills the role', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    const panel = page.locator('details.editor-tools', { has: page.locator('.editor-tools__stat') })
    await panel.locator('summary').click()
    await panel.getByRole('textbox', { name: 'Job description' }).fill('Senior Product Designer\nFigma, user research and prototyping.')

    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const dialog = page.getByRole('dialog', { name: 'Cover letter' })
    await expect(dialog.getByRole('textbox', { name: "Role you're applying for" })).toHaveValue('Senior Product Designer')
    await expect(dialog.getByText('Using the job ad from the ATS check.')).toBeVisible()
  })

  test('Regenerate asks before replacing an edited letter', async ({ page }) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    const draft = dialog.getByRole('textbox', { name: 'Draft (editable)' })
    await draft.fill('My edited letter')

    let message = ''
    page.once('dialog', (d) => { message = d.message(); d.dismiss() })
    await dialog.getByRole('button', { name: 'Regenerate draft' }).click()
    await expect(draft).toHaveValue('My edited letter')
    expect(message).toBe('Replace your edited letter with a new draft?')
  })
})

// The letter's own page (1.7.9): drawn in the CV's look, exported through
// the CV's PDF pipeline (renderCvPdf with `document: 'letter'`).
const letterPage = (page) => page.locator('[data-cover-letter]')

async function openLetterPdfPreview(dialog) {
  await dialog.getByRole('button', { name: /^(Download PDF|Lataa PDF)$/ }).click()
  const preview = dialog.page().getByRole('dialog', { name: /^(Cover letter PDF|Hakemuskirjeen PDF)$/ })
  await expect(preview).toBeVisible()
  return preview
}

async function saveLetterPdf(page, testInfo, name) {
  const download = await downloadFromPdfPreview(page, { timeout: 90_000 })
  const path = testInfo.outputPath(`${name}.pdf`)
  await download.saveAs(path)
  const bytes = await readFile(path)
  return {
    fileName: download.suggestedFilename(),
    text: pdfText(new TextDecoder('windows-1252').decode(bytes)),
    pageCount: (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length,
  }
}

const rgb = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgb(${value >> 16}, ${(value >> 8) & 255}, ${value & 255})`
}

const normalized = (value) => value.replace(/\s+/g, ' ').trim()

test.describe('Cover letter PDF', () => {
  test('the letter PDF looks like the CV and reads as text @slow', async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('textbox', { name: 'Company' }).fill('Northwind Labs')
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    const draft = dialog.getByRole('textbox', { name: 'Draft (editable)' })
    await expect(draft).toHaveValue(/Northwind Labs/)
    const body = await draft.inputValue()
    // The first sentence after the greeting.
    const firstSentence = normalized(body.split(/\n{2,}/)[1].split(/(?<=[.!?])\s/)[0])

    const preview = await openLetterPdfPreview(dialog)
    await expect(page.getByRole('dialog', { name: 'Cover letter', exact: true })).toBeHidden()
    await expect(preview.getByRole('group', { name: 'Fit' })).toHaveCount(0)
    await expect(preview.getByRole('tab', { name: 'What a parser reads' })).toHaveCount(0)

    const pdf = await saveLetterPdf(page, testInfo, 'letter')
    expect(pdf.fileName).toMatch(/-cover-letter\.pdf$/)
    expect(pdf.text).toContain('John Doe')
    expect(pdf.text).toContain('Northwind Labs')
    expect(pdf.text).toContain(firstSentence)
    // Downloading returns to the letter.
    await expect(preview).toBeHidden()
    await expect(page.getByRole('dialog', { name: 'Cover letter', exact: true })).toBeVisible()
  })

  test('closing the preview returns to the letter dialog', async ({ page }) => {
    const dialog = await openCoverLetter(page)
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    const preview = await openLetterPdfPreview(dialog)
    await preview.getByRole('button', { name: 'Cancel' }).click()
    await expect(preview).toBeHidden()
    await expect(page.getByRole('dialog', { name: 'Cover letter', exact: true })).toBeVisible()
  })

  test('the letter page follows the chosen look', async ({ page }) => {
    // Timeline's looks change both the font and the accent, which the
    // letter's name takes when no headings colour is chosen.
    await page.goto('/cv?template=timeline')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    const look = () => letterPage(page).evaluate((root) => ({
      font: getComputedStyle(root).fontFamily,
      color: getComputedStyle(root.querySelector('[data-cv-name]')).color,
    }))
    const before = await look()

    const [, blue] = getTemplateVariants('timeline')
    await (await styleTrigger(page)).click()
    await page.getByRole('radiogroup', { name: 'Select style' }).getByRole('radio', { name: blue.label.en }).click()

    await expect.poll(async () => (await look()).font).not.toBe(before.font)
    await expect.poll(async () => (await look()).color).toBe(rgb(blue.accent))
    expect(before.color).not.toBe(rgb(blue.accent))
  })

  // The headings colour reaches every template's name but three
  // (cvHeadingColors.js's NAME_OWN_COLOR_VARIABLES); the letter's name
  // follows the CV's own name, so the two never disagree.
  test('the letter\'s name takes the headings colour only where the CV\'s name does', async ({ page }) => {
    test.setTimeout(180_000)
    const burgundy = '#7f1d1d'
    const mismatches = []

    for (const template of cvTemplates) {
      await page.goto(`/cv?template=${template.id}`)
      await page.getByRole('button', { name: 'Load demo CV' }).first().click()
      await (await headingColorTrigger(page)).click()
      await page.getByRole('dialog', { name: 'Select heading color' }).getByRole('button', { name: 'Burgundy' }).click()
      const cvName = page.locator('.app-shell__preview [data-cv-name], .direct-edit-preview [data-cv-name]').first()
      const letterName = letterPage(page).locator('[data-cv-name]')
      const ownVariable = NAME_OWN_COLOR_VARIABLES[template.id]

      if (ownVariable) {
        await expect(letterName).toHaveCSS('color', rgb(getTemplateVariants(template.id)[0].palette[ownVariable]))
        const cvColor = await cvName.evaluate((el) => getComputedStyle(el).color)
        if (cvColor === rgb(burgundy)) mismatches.push(`${template.id}: the CV name took the headings colour`)
      } else {
        await expect(letterName).toHaveCSS('color', rgb(burgundy))
        const cvColor = await cvName.evaluate((el) => getComputedStyle(el).color)
        if (cvColor !== rgb(burgundy)) mismatches.push(`${template.id}: the CV name is ${cvColor}`)
      }
    }

    expect(mismatches).toEqual([])
  })

  test('a Finnish CV\'s letter PDF is in Finnish @slow', async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    await page.getByRole('dialog', { name: 'Settings' }).getByRole('button', { name: 'Suomi', exact: true }).click()
    await page.keyboard.press('Escape')

    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const dialog = page.getByRole('dialog', { name: 'Cover letter' })
    await dialog.getByRole('button', { name: 'Generate draft' }).click()
    await openLetterPdfPreview(dialog)

    const pdf = await saveLetterPdf(page, testInfo, 'letter-fi')
    expect(pdf.text).toContain('Ystävällisin terveisin')
    expect(pdf.fileName).toMatch(/-hakemuskirje\.pdf$/)
  })

  test('a long letter continues on a second page @slow', async ({ page }, testInfo) => {
    test.setTimeout(120_000)
    const dialog = await openCoverLetter(page)
    const paragraphs = Array.from({ length: 40 }, (_, index) =>
      `Paragraph ${index + 1}: I led the redesign of a shared component library and shipped it across four product teams.`)
    await dialog.getByRole('textbox', { name: 'Draft (editable)' }).fill(paragraphs.join('\n\n'))
    await openLetterPdfPreview(dialog)

    const pdf = await saveLetterPdf(page, testInfo, 'letter-long')
    expect(pdf.pageCount).toBeGreaterThanOrEqual(2)
    expect(pdf.text).toContain('Paragraph 40:')
  })

  test('with ATS-friendly mode on, the letter is plain black', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    const settings = page.getByRole('dialog', { name: 'Settings' })
    await settings.locator('.settings-row', { hasText: 'ATS-friendly mode' }).locator('.toggle-switch').click()
    await page.keyboard.press('Escape')

    await expect(letterPage(page).locator('[data-cv-name]')).toHaveCSS('color', 'rgb(0, 0, 0)')
  })
})

test.describe('Cover letter on mobile', () => {
  // The nav rail — the cover letter's only desktop entry point — is hidden
  // below the lg breakpoint, so the toolbar's More menu carries it too
  // (audit-1.0.3.md finding 1 / todo item 26a; the mobile bottom bar's own
  // button until 1.6.67, which reached Classic mode only).
  test.use({ viewport: { width: 390, height: 844 } })

  for (const mode of ['Classic', 'Direct Edit']) {
    test(`the More menu opens the cover letter modal (${mode})`, async ({ page }) => {
      await page.goto('/cv')
      await page.getByRole('tab', { name: mode }).click()
      await page.getByRole('button', { name: 'Load demo CV' }).first().click()

      await expect(navRail(page)).toBeHidden()

      await page.getByRole('button', { name: 'More actions' }).click()
      await page.getByRole('menuitem', { name: 'Cover letter' }).click()
      await expect(page.getByRole('dialog', { name: 'Cover letter' })).toBeVisible()
    })
  }
})
