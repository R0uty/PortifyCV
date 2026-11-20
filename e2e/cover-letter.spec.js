import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'

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
    await expect.poll(() => page.evaluate(() => Object.keys(window.sessionStorage).length)).toBeGreaterThan(0)
    await page.waitForTimeout(900)

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
