import { test, expect } from './fixtures/base.js'
import { ENGLISH_CV_LINES } from '../scripts/fixtures/cvImportSamples.mjs'
import { DOCX_MIME, PDF_MIME, makeDocx, makePdf, makeTwoColumnPdf } from './helpers/cvImportFiles.js'

// Importing someone's existing CV from a PDF or Word file (1.7.0). The
// parser's own rules are covered by scripts/check-cv-import.mjs; this is
// the part that needs a browser: pdf.js and its worker, the .docx reader,
// and the builder applying the result.

const CV_FILE_INPUT = 'input[type="file"][accept^=".pdf,.docx"]'
const JSON_INPUT = 'input[type="file"][accept=".json,application/json"]'
const name = (page) => page.locator('.direct-edit-preview [data-cv-name]')

const openImportDialog = async (page) => {
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Import CV' }).click()
  const dialog = page.getByRole('dialog', { name: 'Import CV' })
  await expect(dialog).toBeVisible()
  return dialog
}

const chooseFile = async (page, dialog, file) => {
  const chooser = page.waitForEvent('filechooser')
  await dialog.getByRole('button', { name: 'Choose PDF or Word' }).click()
  await (await chooser).setFiles(file)
}

const expectJaneImported = async (page, fileName) => {
  await expect(page.getByText(`Imported from ${fileName}: 2 jobs, 1 degree, 5 skills. Check the details.`)).toBeVisible()
  await expect(name(page)).toHaveText('Jane Example')
  const preview = page.locator('.direct-edit-preview')
  await expect(preview).toContainText('Northwind Oy')
  await expect(preview).toContainText('Cut checkout latency by 40% by moving pricing to an edge cache.')
  await expect(preview).toContainText('Aalto University')
  await expect(preview).toContainText('jane@example.com')
}

test.describe('CV file import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
  })

  test('a PDF fills the CV and closes the dialog, without any request leaving the site', async ({ page, baseURL }) => {
    const foreignRequests = []
    page.on('request', (request) => {
      const url = request.url()
      if (/^https?:/.test(url) && !url.startsWith(baseURL) && !/googlesyndication|doubleclick|adsbygoogle/.test(url)) {
        foreignRequests.push(url)
      }
    })

    const dialog = await openImportDialog(page)
    foreignRequests.length = 0
    await chooseFile(page, dialog, { name: 'jane.pdf', mimeType: PDF_MIME, buffer: makePdf(ENGLISH_CV_LINES) })

    await expectJaneImported(page, 'jane.pdf')
    await expect(dialog).toBeHidden()
    expect(foreignRequests).toEqual([])
  })

  test('a Word file fills the CV', async ({ page }) => {
    const dialog = await openImportDialog(page)
    await chooseFile(page, dialog, { name: 'jane.docx', mimeType: DOCX_MIME, buffer: await makeDocx(ENGLISH_CV_LINES) })

    await expectJaneImported(page, 'jane.docx')
    await expect(dialog).toBeHidden()
  })

  test('a two-column PDF is read column by column', async ({ page }) => {
    const [fullName, title, , , ...body] = ENGLISH_CV_LINES
    const skillsAt = body.indexOf('Skills')
    const dialog = await openImportDialog(page)
    await chooseFile(page, dialog, {
      name: 'columns.pdf',
      mimeType: PDF_MIME,
      buffer: makeTwoColumnPdf({
        name: fullName,
        main: [title, ...body.slice(0, skillsAt)],
        sidebar: ['Contact', 'jane@example.com', '+358 40 123 4567', 'Helsinki, Finland', ...body.slice(skillsAt)],
      }),
    })

    await expect(page.getByText('Imported from columns.pdf: 2 jobs, 1 degree, 5 skills. Check the details.')).toBeVisible()
    await expect(name(page)).toHaveText('Jane Example')
    const preview = page.locator('.direct-edit-preview')
    await expect(preview).toContainText('Northwind Oy')
    await expect(preview).toContainText('jane@example.com')
    await expect(preview).toContainText('PostgreSQL')
  })

  test('Undo brings back the CV the import replaced', async ({ page }) => {
    await page.locator(JSON_INPUT).setInputFiles({
      name: 'earlier.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ fullName: 'Earlier Person', title: 'Welder' })),
    })
    await expect(name(page)).toHaveText('Earlier Person')
    // Past HISTORY_COMMIT_DELAY_MS (600 ms), so the two imports are
    // separate undo steps, as they are for a real user.
    await page.waitForTimeout(800)

    await page.locator(CV_FILE_INPUT).setInputFiles({ name: 'jane.pdf', mimeType: PDF_MIME, buffer: makePdf(ENGLISH_CV_LINES) })
    await expect(name(page)).toHaveText('Jane Example')

    await page.getByRole('banner').getByRole('button', { name: 'Undo' }).click()
    await expect(name(page)).toHaveText('Earlier Person')
  })

  test('a file that is not what its name says is refused, and the next upload still works', async ({ page }) => {
    const dialog = await openImportDialog(page)
    const before = await name(page).textContent()

    await chooseFile(page, dialog, { name: 'broken.pdf', mimeType: PDF_MIME, buffer: Buffer.from('this is not a PDF') })
    await expect(page.getByText('Could not read the file. It may be damaged or password-protected.')).toBeVisible()
    await expect(name(page)).toHaveText(before ?? '')
    await expect(dialog).toBeVisible()

    await chooseFile(page, dialog, { name: 'broken.docx', mimeType: DOCX_MIME, buffer: Buffer.from('not a zip either') })
    await expect(page.getByText('Could not read the file. It may be damaged or password-protected.').last()).toBeVisible()

    await chooseFile(page, dialog, { name: 'jane.pdf', mimeType: PDF_MIME, buffer: makePdf(ENGLISH_CV_LINES) })
    await expect(name(page)).toHaveText('Jane Example')
  })

  test('a PDF with no text is reported as scanned and changes nothing', async ({ page }) => {
    const dialog = await openImportDialog(page)
    const before = await name(page).textContent()

    await chooseFile(page, dialog, { name: 'scan.pdf', mimeType: PDF_MIME, buffer: makePdf([]) })
    await expect(page.getByText('No text found. The file looks like a scanned image.')).toBeVisible()
    await expect(name(page)).toHaveText(before ?? '')
  })

  test('Classic mode has the same upload', async ({ page }) => {
    await page.getByRole('tab', { name: 'Classic' }).click()
    await page.getByText('Import CV', { exact: true }).first().click()

    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Choose PDF or Word' }).click()
    await (await chooser).setFiles({ name: 'jane.docx', mimeType: DOCX_MIME, buffer: await makeDocx(ENGLISH_CV_LINES) })

    await expect(page.getByText('Imported from jane.docx: 2 jobs, 1 degree, 5 skills. Check the details.')).toBeVisible()
    await expect(page.locator('[data-cv-name]').first()).toHaveText('Jane Example')
  })

  test('the upload is offered in Finnish', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto('/cv')
    await page.getByRole('banner').getByRole('button', { name: 'Lisää toimintoja' }).click()
    await page.getByRole('menuitem', { name: 'Tuo CV' }).click()

    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('dialog', { name: 'Tuo CV' }).getByRole('button', { name: 'Valitse PDF tai Word' }).click()
    await (await chooser).setFiles({ name: 'jane.pdf', mimeType: PDF_MIME, buffer: makePdf(ENGLISH_CV_LINES) })

    await expect(page.getByText('Tuotu tiedostosta jane.pdf: 2 työpaikkaa, 1 tutkinto, 5 taitoa. Tarkista tiedot.')).toBeVisible()
  })
})
