import { test, expect } from './fixtures/base.js'

// Applications (1.7.11, src/utils/applicationLog.js): "Mark as applied"
// renders the CV (and the cover letter, when it has a body) to PDF the way
// Download does and keeps those files, with the CV's data, in this
// browser's `portifycv-applications` database. The suite opens the builder
// in Classic mode (playwright.config.js).

const navRail = (page) => page.getByRole('navigation', { name: 'Section navigation' })
const markDialog = (page) => page.getByRole('dialog', { name: 'Mark as applied' })

// Every stored application, read straight from IndexedDB (the files as
// their sizes, since a Blob doesn't cross page.evaluate).
const storedApplications = (page) => page.evaluate(() => new Promise((resolve, reject) => {
  const request = indexedDB.open('portifycv-applications')
  request.onupgradeneeded = () => {
    // Nothing stored yet: don't create the database on the app's behalf.
    request.transaction.abort()
  }
  request.onsuccess = () => {
    const database = request.result
    if (!database.objectStoreNames.contains('applications')) {
      database.close()
      resolve([])
      return
    }
    const getAll = database.transaction('applications').objectStore('applications').getAll()
    getAll.onsuccess = () => {
      database.close()
      resolve(getAll.result.map((record) => ({
        company: record.company,
        role: record.role,
        appliedOn: record.appliedOn,
        adUrl: record.adUrl,
        status: record.status,
        cv: {
          pdfType: record.cv?.pdf?.type,
          pdfSize: record.cv?.pdf?.size ?? 0,
          fileName: record.cv?.fileName,
          paper: record.cv?.paper,
          fit: record.cv?.fit,
          pageCount: record.cv?.pages?.length ?? 0,
        },
        letter: record.letter
          ? { pdfSize: record.letter.pdf?.size ?? 0, paper: record.letter.paper, pageCount: record.letter.pages?.length ?? 0 }
          : null,
        source: {
          fullName: record.source?.data?.fullName,
          templateId: record.source?.templateId,
          look: record.source?.look,
        },
      })))
    }
    getAll.onerror = () => reject(getAll.error)
  }
  // An aborted upgrade (no database yet) ends here.
  request.onerror = () => (request.error?.name === 'AbortError' ? resolve([]) : reject(request.error))
}))

const today = (page) => page.evaluate(() => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
})

async function openMarkApplied(page) {
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Mark as applied' }).click()
  await expect(markDialog(page)).toBeVisible()
  return markDialog(page)
}

async function loadDemo(page) {
  await page.goto('/cv')
  await page.getByRole('button', { name: 'Load demo CV' }).first().click()
}

async function markApplied(page, { company = 'Acme Oy', role = 'Frontend Developer' } = {}) {
  const dialog = await openMarkApplied(page)
  await dialog.getByRole('textbox', { name: 'Company' }).fill(company)
  await dialog.getByRole('textbox', { name: 'Role' }).fill(role)
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('Saved to Applications')).toBeVisible({ timeout: 30_000 })
  await expect(dialog).toBeHidden()
}

test.describe('Mark as applied', () => {
  test('mark as applied stores an application from Classic mode', async ({ page }) => {
    await loadDemo(page)
    const dialog = await openMarkApplied(page)

    await expect(dialog.getByText(
      'A PDF of this CV and its cover letter, as they look now, is kept with the application in this browser.',
    )).toBeVisible()
    // Today, in local time, until the visitor changes it.
    await expect(dialog.getByLabel('Date applied')).toHaveValue(await today(page))
    // Paper and fit start from the tab's PDF choices (A4, Auto by default).
    await expect(dialog.getByRole('radio', { name: 'A4' })).toBeChecked()
    await expect(dialog.getByRole('combobox', { name: 'Fit' })).toHaveValue('auto')

    await dialog.getByRole('textbox', { name: 'Company' }).fill('Acme Oy')
    await dialog.getByRole('textbox', { name: 'Role' }).fill('Frontend Developer')
    await dialog.getByRole('textbox', { name: 'Link to the job ad (optional)' }).fill('https://example.com/jobs/1')
    await dialog.getByRole('radio', { name: 'US Letter' }).check()
    await dialog.getByRole('combobox', { name: 'Fit' }).selectOption('one-page')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.getByText('Saved to Applications')).toBeVisible({ timeout: 30_000 })
    await expect(dialog).toBeHidden()

    const records = await storedApplications(page)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      company: 'Acme Oy',
      role: 'Frontend Developer',
      appliedOn: await today(page),
      adUrl: 'https://example.com/jobs/1',
      status: 'applied',
      cv: { pdfType: 'application/pdf', paper: 'letter', fit: 'one-page' },
      letter: null,
      source: { fullName: 'John Doe', templateId: expect.any(String) },
    })
    expect(records[0].cv.pdfSize).toBeGreaterThan(1000)
    expect(records[0].cv.pageCount).toBeGreaterThan(0)
    expect(records[0].cv.fileName).toMatch(/\.pdf$/)
    expect(records[0].source.look).toEqual(expect.objectContaining({
      atsFriendlyMode: expect.any(Boolean),
      cvFontId: expect.any(String),
      classicNameAlignment: expect.any(String),
    }))
  })

  test('mark as applied stores an application from Direct Edit mode', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await page.locator('.direct-edit-actions').getByRole('button', { name: 'Load demo CV' }).click()

    await markApplied(page)

    const records = await storedApplications(page)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      company: 'Acme Oy',
      role: 'Frontend Developer',
      appliedOn: await today(page),
      status: 'applied',
      source: { fullName: 'John Doe' },
    })
    expect(records[0].cv.pageCount).toBeGreaterThan(0)
  })

  test('company and role are prefilled from the cover letter, else from the pasted ad', async ({ page }) => {
    await loadDemo(page)
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const letter = page.getByRole('dialog', { name: 'Cover letter' })
    await letter.getByRole('textbox', { name: 'Company' }).fill('Globex')
    await letter.getByRole('textbox', { name: "Role you're applying for" }).fill('UI Engineer')
    await letter.getByRole('button', { name: 'Close' }).click()

    let dialog = await openMarkApplied(page)
    await expect(dialog.getByRole('textbox', { name: 'Company' })).toHaveValue('Globex')
    await expect(dialog.getByRole('textbox', { name: 'Role' })).toHaveValue('UI Engineer')
    await dialog.getByRole('button', { name: 'Close' }).click()

    // No role in the letter: the ATS panel's pasted ad gives it.
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    await letter.getByRole('textbox', { name: "Role you're applying for" }).fill('')
    await letter.getByRole('button', { name: 'Close' }).click()
    const panel = page.locator('details.editor-tools', { has: page.locator('.editor-tools__stat') })
    await panel.locator('summary').click()
    await panel.getByRole('textbox', { name: 'Job description' }).fill('Senior React Developer\nReact, TypeScript and testing.')

    dialog = await openMarkApplied(page)
    await expect(dialog.getByRole('textbox', { name: 'Company' })).toHaveValue('Globex')
    await expect(dialog.getByRole('textbox', { name: 'Role' })).toHaveValue('Senior React Developer')
  })

  test('company and role are required', async ({ page }) => {
    await loadDemo(page)
    const dialog = await openMarkApplied(page)
    await dialog.getByRole('textbox', { name: 'Role' }).fill('Frontend Developer')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(dialog.getByText('Enter the company.')).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Company' })).toHaveAttribute('aria-invalid', 'true')

    await dialog.getByRole('textbox', { name: 'Company' }).fill('Acme Oy')
    await dialog.getByRole('textbox', { name: 'Role' }).fill('  ')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(dialog.getByText('Enter the role.')).toBeVisible()

    await page.waitForTimeout(500)
    expect(await storedApplications(page)).toEqual([])
    await expect(dialog).toBeVisible()
  })

  test('pressing Save twice stores one application', async ({ page }) => {
    await loadDemo(page)
    const dialog = await openMarkApplied(page)
    await dialog.getByRole('textbox', { name: 'Company' }).fill('Acme Oy')
    await dialog.getByRole('textbox', { name: 'Role' }).fill('Frontend Developer')
    await dialog.getByRole('button', { name: 'Save', exact: true }).dblclick()

    await expect(dialog.getByRole('button', { name: 'Saving the PDF…' })).toBeDisabled()
    await expect(page.getByText('Saved to Applications')).toBeVisible({ timeout: 30_000 })
    await page.waitForTimeout(500)
    expect(await storedApplications(page)).toHaveLength(1)
  })

  test('a letter of only spaces is not stored', async ({ page }) => {
    await loadDemo(page)
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const letter = page.getByRole('dialog', { name: 'Cover letter' })
    await letter.getByRole('textbox', { name: 'Draft (editable)' }).fill('   ')
    await letter.getByRole('button', { name: 'Close' }).click()

    await markApplied(page)

    const records = await storedApplications(page)
    expect(records).toHaveLength(1)
    expect(records[0].letter).toBeNull()
  })

  test('a letter with a body is stored as its own PDF', async ({ page }) => {
    await loadDemo(page)
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const letter = page.getByRole('dialog', { name: 'Cover letter' })
    await letter.getByRole('button', { name: 'Generate draft' }).click()
    await letter.getByRole('button', { name: 'Close' }).click()

    await markApplied(page)

    const [record] = await storedApplications(page)
    expect(record.letter).toMatchObject({ paper: 'a4' })
    expect(record.letter.pdfSize).toBeGreaterThan(1000)
    expect(record.letter.pageCount).toBeGreaterThan(0)
  })

  test('IndexedDB blocked shows the unavailable message', async ({ page }) => {
    await page.addInitScript(() => {
      IDBFactory.prototype.open = () => {
        throw new DOMException('blocked', 'SecurityError')
      }
    })
    await loadDemo(page)
    const dialog = await openMarkApplied(page)

    await expect(dialog.getByRole('alert')).toContainText('This browser does not allow saving on the device')
    await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0)
    await expect(dialog.getByRole('textbox', { name: 'Company' })).toHaveCount(0)
  })
})
