import { test, expect } from './fixtures/base.js'
import { readFile } from 'node:fs/promises'
import { cvTemplates, defaultTemplateId } from '../src/utils/cvTemplates.js'
import { pdfText } from './helpers/pdfFile.js'
import { pickTemplate } from './helpers/templateGallery.js'
import { downloadFromPdfPreview } from './helpers/pdfPreview.js'

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

// The Applications tab of My CVs (src/hooks/useApplications.js).
const myCvsDialog = (page) => page.getByRole('dialog', { name: 'My CVs' })
const applicationRow = (page, company) => myCvsDialog(page).locator(`[data-application="${company}"]`)

async function openApplications(page) {
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: /^My CVs/ }).click()
  await expect(myCvsDialog(page)).toBeVisible()
  await myCvsDialog(page).getByRole('tab', { name: /^Applications/ }).click()
}

const storedNotes = async (page) => (await page.evaluate(() => new Promise((resolve, reject) => {
  const request = indexedDB.open('portifycv-applications')
  request.onsuccess = () => {
    const getAll = request.result.transaction('applications').objectStore('applications').getAll()
    getAll.onsuccess = () => {
      request.result.close()
      resolve(getAll.result.map((record) => ({ company: record.company, status: record.status, note: record.note })))
    }
    getAll.onerror = () => reject(getAll.error)
  }
  request.onerror = () => reject(request.error)
})))

test.describe('Applications tab', () => {
  test('the toast says where the application went', async ({ page }) => {
    await loadDemo(page)
    await markApplied(page)
    await expect(page.getByText('Saved to Applications in My CVs.')).toBeVisible()
  })

  test('the tab lists applications with their details, newest first', async ({ page }) => {
    await loadDemo(page)
    await openApplications(page)
    await expect(myCvsDialog(page).getByText(
      'Mark a CV as applied from the menu to keep the PDF you sent here.',
    )).toBeVisible()
    await myCvsDialog(page).getByRole('button', { name: 'Close' }).click()

    await markApplied(page, { company: 'Acme Oy', role: 'Frontend Developer' })
    await markApplied(page, { company: 'Globex', role: 'UI Engineer' })
    await openApplications(page)

    const tab = myCvsDialog(page).getByRole('tab', { name: 'Applications (2)' })
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(myCvsDialog(page).getByRole('tab', { name: 'My CVs' })).toHaveAttribute('aria-selected', 'false')
    await expect(myCvsDialog(page).locator('[data-application]')).toHaveText([/Globex/, /Acme Oy/])

    const row = applicationRow(page, 'Acme Oy')
    await expect(row).toContainText('Frontend Developer')
    const date = await page.evaluate(() => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
    await expect(row).toContainText(date)
    await expect(row.getByLabel('Status')).toHaveValue('applied')
    await expect(row.getByRole('button', { name: 'View sent' })).toBeVisible()
    await expect(row.getByRole('button', { name: 'Start new CV from it' })).toBeVisible()
  })

  test('status and note survive a reload', async ({ page }) => {
    await loadDemo(page)
    await markApplied(page)
    await openApplications(page)

    const row = applicationRow(page, 'Acme Oy')
    await row.getByLabel('Status').selectOption({ label: 'Interview' })
    await row.getByLabel('Note').fill('Call on Tuesday')
    await row.getByLabel('Note').blur()
    await expect.poll(() => storedNotes(page)).toEqual([{ company: 'Acme Oy', status: 'interview', note: 'Call on Tuesday' }])

    await page.reload()
    await openApplications(page)
    await expect(applicationRow(page, 'Acme Oy').getByLabel('Status')).toHaveValue('interview')
    await expect(applicationRow(page, 'Acme Oy').getByLabel('Note')).toHaveValue('Call on Tuesday')
  })

  test('a note typed just before closing is kept', async ({ page }) => {
    await loadDemo(page)
    await markApplied(page)
    await openApplications(page)

    await applicationRow(page, 'Acme Oy').getByLabel('Note').fill('Sent on Monday')
    await page.keyboard.press('Escape')
    await expect(myCvsDialog(page)).toBeHidden()

    await openApplications(page)
    await expect(applicationRow(page, 'Acme Oy').getByLabel('Note')).toHaveValue('Sent on Monday')
    expect(await storedNotes(page)).toEqual([{ company: 'Acme Oy', status: 'applied', note: 'Sent on Monday' }])
  })

  test('an application from another tab shows when the tab opens', async ({ page }) => {
    await page.goto('/cv')
    await expect(page.getByRole('banner').getByRole('button', { name: 'More actions' })).toBeVisible()

    const other = await page.context().newPage()
    await loadDemo(other)
    await markApplied(other)

    await openApplications(page)
    await expect(applicationRow(page, 'Acme Oy')).toBeVisible()
    await expect(myCvsDialog(page).getByRole('tab', { name: 'Applications (1)' })).toBeVisible()
  })

  test('delete asks first', async ({ page }) => {
    await loadDemo(page)
    await markApplied(page)
    await openApplications(page)

    const row = applicationRow(page, 'Acme Oy')
    await row.getByRole('button', { name: 'Delete' }).click()
    await expect(row.getByText('Delete the application to Acme Oy? The PDF that was sent goes with it.')).toBeVisible()
    await row.getByRole('button', { name: 'Cancel' }).click()
    await expect(row.getByText('Delete the application to Acme Oy?')).toHaveCount(0)
    expect(await storedApplications(page)).toHaveLength(1)

    await row.getByRole('button', { name: 'Delete' }).click()
    await row.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(row).toHaveCount(0)
    await expect(myCvsDialog(page).getByRole('tab', { name: 'Applications (0)' })).toBeVisible()
    expect(await storedApplications(page)).toEqual([])
  })

  test('Delete all applications clears only applications', async ({ page }) => {
    await loadDemo(page)
    await page.getByRole('banner').getByRole('button', { name: 'Save on this device' }).click()
    const save = page.getByRole('dialog', { name: 'Save on this device' })
    await save.getByLabel('Name for this CV').fill('Analyst')
    await save.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('Saved on this device as "Analyst".')).toBeVisible()
    await markApplied(page)

    await page.getByRole('button', { name: 'Settings' }).click()
    const settings = page.getByRole('dialog', { name: 'Settings' })
    await expect(settings.getByText('Applications on this device (1)')).toBeVisible()
    await settings.getByRole('button', { name: 'Delete all applications' }).click()
    await settings.getByRole('button', { name: 'Confirm delete all applications' }).click()
    await expect(page.getByText('All applications were deleted from this device.')).toBeVisible()
    await expect(settings.getByText('Applications on this device')).toHaveCount(0)
    await settings.getByRole('button', { name: 'Close' }).click()

    expect(await storedApplications(page)).toEqual([])
    await openApplications(page)
    await expect(myCvsDialog(page).getByText('Mark a CV as applied from the menu to keep the PDF you sent here.')).toBeVisible()
    await myCvsDialog(page).getByRole('tab', { name: 'My CVs' }).click()
    await expect(myCvsDialog(page).locator('[data-saved-cv="Analyst"]')).toBeVisible()
    await myCvsDialog(page).getByRole('button', { name: 'Close' }).click()

    // The other way round: deleting the saved CVs leaves applications.
    await markApplied(page)
    await page.getByRole('button', { name: 'Settings' }).click()
    await settings.getByRole('button', { name: 'Delete all saved CVs' }).click()
    await settings.getByRole('button', { name: 'Confirm delete all', exact: true }).click()
    await expect(page.getByText('All saved CVs were deleted from this device.')).toBeVisible()
    await settings.getByRole('button', { name: 'Close' }).click()

    expect(await storedApplications(page)).toHaveLength(1)
    await openApplications(page)
    await expect(applicationRow(page, 'Acme Oy')).toBeVisible()
  })

  test('IndexedDB blocked shows the unavailable message in the tab', async ({ page }) => {
    await page.addInitScript(() => {
      IDBFactory.prototype.open = () => {
        throw new DOMException('blocked', 'SecurityError')
      }
    })
    await page.goto('/cv')
    await openApplications(page)
    await expect(myCvsDialog(page).getByRole('alert')).toContainText('This browser does not allow saving on the device')
  })

  test('the tab and statuses are in Finnish', async ({ page }) => {
    await loadDemo(page)
    await markApplied(page)
    await page.evaluate(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.reload()

    await page.getByRole('banner').getByRole('button', { name: 'Lisää toimintoja' }).click()
    await page.getByRole('menuitem', { name: /^Omat CV:t/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Omat CV:t' })
    await dialog.getByRole('tab', { name: 'Haut (1)' }).click()

    const status = dialog.locator('[data-application="Acme Oy"]').getByLabel('Tila')
    await expect(status.locator('option')).toHaveText(['Haettu', 'Haastattelu', 'Tarjous', 'Hylätty', 'Ei vastausta'])
    await expect(dialog.locator('[data-application="Acme Oy"]').getByRole('button', { name: 'Näytä lähetetty' })).toBeVisible()
  })
})

// View sent and Start new CV from it (ApplicationViewModal.jsx and the
// builder's handleStartFromApplication).
const templateName = (id) => cvTemplates.find((template) => template.id === id).label
const templateLabel = (page) => page.locator('.app-toolbar__template-trigger-label')
const fullNameField = (page) => page.getByRole('textbox', { name: /Full name/ })
const viewDialog = (page, company = 'Acme Oy') => page.getByRole('dialog', { name: `Sent to ${company}` })

// Writes a record straight into the applications store, as an older
// version of the app (or a fallback render) would have left it.
const putApplication = (page, overrides) => page.evaluate((overrides) => new Promise((resolve, reject) => {
  const pdf = new Blob(['%PDF-1.4 stored test file'], { type: 'application/pdf' })
  const now = new Date().toISOString()
  const record = {
    id: 'stored-1',
    company: 'Initech',
    role: 'Analyst',
    appliedOn: '2026-01-15',
    adUrl: '',
    status: 'applied',
    note: '',
    cv: { pdf, fileName: 'Stored_CV.pdf', paper: 'a4', fit: 'auto', pages: [] },
    letter: null,
    source: {
      data: { fullName: 'Retro Person', title: 'Old Title' },
      templateId: 'classic',
      look: { atsFriendlyMode: false, cvFontId: 'inter', cvHeadingColor: '', accentColor: '', classicNameAlignment: 'left' },
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
  if (overrides.sourceOverrides) {
    record.source = { ...record.source, ...overrides.sourceOverrides }
    delete record.sourceOverrides
  }
  const request = indexedDB.open('portifycv-applications', 1)
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains('applications')) {
      request.result.createObjectStore('applications', { keyPath: 'id' })
    }
  }
  request.onsuccess = () => {
    const transaction = request.result.transaction('applications', 'readwrite')
    transaction.objectStore('applications').put(record)
    transaction.oncomplete = () => {
      request.result.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  }
  request.onerror = () => reject(request.error)
}), overrides)

async function openViewSent(page, company = 'Acme Oy') {
  await openApplications(page)
  await applicationRow(page, company).getByRole('button', { name: 'View sent' }).click()
  await expect(viewDialog(page, company)).toBeVisible()
  return viewDialog(page, company)
}

async function downloadStored(dialog, testInfo, name) {
  const page = dialog.page()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Download PDF' }).click(),
  ])
  const path = testInfo.outputPath(`${name}.pdf`)
  await download.saveAs(path)
  const bytes = await readFile(path)
  return { fileName: download.suggestedFilename(), bytes, text: pdfText(new TextDecoder('windows-1252').decode(bytes)) }
}

test.describe('View sent and Start new CV', () => {
  test('View sent shows the pages that were stored, not today\'s CV', async ({ page }, testInfo) => {
    await loadDemo(page)
    await fullNameField(page).fill('Jane Example')
    await markApplied(page)

    await fullNameField(page).fill('Changed Name')
    await pickTemplate(page, templateName('developer'))

    const dialog = await openViewSent(page)
    const date = await page.evaluate(() => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
    await expect(dialog).toContainText('Frontend Developer')
    await expect(dialog).toContainText(date)
    expect(await dialog.locator('img[data-stored-page]').count()).toBeGreaterThanOrEqual(1)
    await expect(dialog.locator('img[data-stored-page]').first()).toHaveJSProperty('complete', true)
    expect(await dialog.locator('img[data-stored-page]').first().evaluate((image) => image.naturalWidth)).toBeGreaterThan(0)

    const [record] = await storedApplications(page)
    const file = await downloadStored(dialog, testInfo, 'stored-cv')
    expect(file.fileName).toBe(record.cv.fileName)
    expect(file.bytes.length).toBe(record.cv.pdfSize)
    expect(file.text).toContain('Jane Example')
    expect(file.text).not.toContain('Changed Name')
  })

  test('CV / Cover letter switch appears only with a letter', async ({ page }, testInfo) => {
    await loadDemo(page)
    await markApplied(page, { company: 'Acme Oy' })
    let dialog = await openViewSent(page)
    await expect(dialog.getByRole('tab')).toHaveCount(0)
    await dialog.getByRole('button', { name: 'Close' }).click()
    await myCvsDialog(page).getByRole('button', { name: 'Close' }).click()

    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const letter = page.getByRole('dialog', { name: 'Cover letter' })
    await letter.getByRole('button', { name: 'Generate draft' }).click()
    await letter.getByRole('button', { name: 'Close' }).click()
    await markApplied(page, { company: 'Globex' })

    dialog = await openViewSent(page, 'Globex')
    const cvTab = dialog.getByRole('tab', { name: 'CV' })
    const letterTab = dialog.getByRole('tab', { name: 'Cover letter' })
    await expect(cvTab).toHaveAttribute('aria-selected', 'true')
    const cvFile = await downloadStored(dialog, testInfo, 'switch-cv')

    await letterTab.click()
    await expect(letterTab).toHaveAttribute('aria-selected', 'true')
    expect(await dialog.locator('img[data-stored-page]').count()).toBeGreaterThanOrEqual(1)
    const letterFile = await downloadStored(dialog, testInfo, 'switch-letter')
    expect(letterFile.fileName).not.toBe(cvFile.fileName)
    const records = await storedApplications(page)
    const globex = records.find((record) => record.company === 'Globex')
    expect(letterFile.bytes.length).toBe(globex.letter.pdfSize)
  })

  test('Start new CV puts the sent CV back and Undo restores the previous one', async ({ page }) => {
    await loadDemo(page)
    const sentTemplate = await templateLabel(page).textContent()
    await markApplied(page)

    await pickTemplate(page, templateName('developer'))
    await fullNameField(page).fill('Edited Name')

    await openApplications(page)
    await applicationRow(page, 'Acme Oy').getByRole('button', { name: 'Start new CV from it' }).click()
    await expect(myCvsDialog(page)).toBeHidden()
    await expect(page.getByText('Started a new CV from the application to Acme Oy.')).toBeVisible()
    await expect(fullNameField(page)).toHaveValue('John Doe')
    await expect(templateLabel(page)).toHaveText(sentTemplate)

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(templateLabel(page)).toHaveText(templateName('developer'))
    await expect(fullNameField(page)).toHaveValue('Edited Name')
  })

  test('Start new CV from View sent closes it', async ({ page }) => {
    await loadDemo(page)
    await markApplied(page)
    await fullNameField(page).fill('Edited Name')

    const dialog = await openViewSent(page)
    await dialog.getByRole('button', { name: 'Start new CV from it' }).click()
    await expect(dialog).toBeHidden()
    await expect(myCvsDialog(page)).toBeHidden()
    await expect(fullNameField(page)).toHaveValue('John Doe')
  })

  test('an application in a retired template opens in its replacement', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await expect(templateLabel(page)).toHaveText(templateName('developer'))
    await putApplication(page, {})
    await openApplications(page)
    await applicationRow(page, 'Initech').getByRole('button', { name: 'Start new CV from it' }).click()
    await expect(fullNameField(page)).toHaveValue('Retro Person')
    await expect(templateLabel(page)).toHaveText(templateName('classicProfessional'))

    await putApplication(page, { id: 'stored-2', company: 'Umbrella', sourceOverrides: { templateId: 'no-such-template' } })
    await openApplications(page)
    await applicationRow(page, 'Umbrella').getByRole('button', { name: 'Start new CV from it' }).click()
    await expect(page.getByText('Started a new CV from the application to Umbrella.')).toBeVisible()
    await expect(templateLabel(page)).toHaveText(templateName(defaultTemplateId))
    await expect(page.locator('[role="alert"]', { hasText: /could not|error/i })).toHaveCount(0)
  })

  test('an application whose CV data is unreadable changes nothing', async ({ page }) => {
    await loadDemo(page)
    await putApplication(page, { id: 'stored-3', company: 'Broken', sourceOverrides: { data: 'not a CV' } })
    await openApplications(page)
    await applicationRow(page, 'Broken').getByRole('button', { name: 'Start new CV from it' }).click()
    await expect(page.getByText("This application's CV could not be opened.")).toBeVisible()
    await expect(fullNameField(page)).toHaveValue('John Doe')
  })

  test('a fallback PDF shows a note instead of pages', async ({ page }, testInfo) => {
    await page.goto('/cv')
    await putApplication(page, { company: 'Acme Oy' })
    let dialog = await openViewSent(page)
    await expect(dialog.getByText("There's no picture of this PDF. Download it to see it.")).toBeVisible()
    await expect(dialog.locator('img[data-stored-page]')).toHaveCount(0)
    const file = await downloadStored(dialog, testInfo, 'fallback')
    expect(file.fileName).toBe('Stored_CV.pdf')
    expect(file.bytes.toString('latin1')).toBe('%PDF-1.4 stored test file')
    await dialog.getByRole('button', { name: 'Close' }).click()

    await page.evaluate(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.reload()
    await page.getByRole('banner').getByRole('button', { name: 'Lisää toimintoja' }).click()
    await page.getByRole('menuitem', { name: /^Omat CV:t/ }).click()
    const list = page.getByRole('dialog', { name: 'Omat CV:t' })
    await list.getByRole('tab', { name: /^Haut/ }).click()
    await list.locator('[data-application="Acme Oy"]').getByRole('button', { name: 'Näytä lähetetty' }).click()
    dialog = page.getByRole('dialog', { name: 'Lähetetty: Acme Oy' })
    await expect(dialog.getByText('Tästä PDF:stä ei ole kuvaa. Lataa se nähdäksesi sen.')).toBeVisible()
  })

  test('the ad link is a link only for a web address', async ({ page }) => {
    await page.goto('/cv')
    await putApplication(page, { company: 'Acme Oy', adUrl: 'https://example.com/jobs/7' })
    let dialog = await openViewSent(page)
    const link = dialog.getByRole('link', { name: 'https://example.com/jobs/7' })
    await expect(link).toHaveAttribute('href', 'https://example.com/jobs/7')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await dialog.getByRole('button', { name: 'Close' }).click()

    await putApplication(page, { id: 'stored-4', company: 'Evil Corp', adUrl: 'javascript:alert(1)' })
    await myCvsDialog(page).getByRole('button', { name: 'Close' }).click()
    dialog = await openViewSent(page, 'Evil Corp')
    await expect(dialog.getByText('javascript:alert(1)')).toBeVisible()
    await expect(dialog.getByRole('link')).toHaveCount(0)
  })
})

// The PDF that was stored is the PDF Download makes (a worker may stamp
// dates, so compare page count and text layer, not bytes).
const pageCount = (bytes) => (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length

test.describe('Stored PDFs', () => {
  test('the stored PDF is the downloaded PDF @slow', async ({ page }, testInfo) => {
    test.setTimeout(180_000)
    await loadDemo(page)

    // What the PDF preview's Download produces for US Letter, one page.
    await page.getByRole('banner').getByRole('button', { name: 'Export', exact: true }).click()
    await page.getByRole('menuitem', { name: 'PDF' }).click()
    const download = await downloadFromPdfPreview(page, { timeout: 90_000, paper: 'letter', fit: 'one-page' })
    const downloadPath = testInfo.outputPath('preview-download.pdf')
    await download.saveAs(downloadPath)
    const downloaded = await readFile(downloadPath)

    const dialog = await openMarkApplied(page)
    await dialog.getByRole('textbox', { name: 'Company' }).fill('Acme Oy')
    await dialog.getByRole('textbox', { name: 'Role' }).fill('Frontend Developer')
    await dialog.getByRole('radio', { name: 'US Letter' }).check()
    await dialog.getByRole('combobox', { name: 'Fit' }).selectOption('one-page')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('Saved to Applications')).toBeVisible({ timeout: 30_000 })

    const viewDialogHandle = await openViewSent(page)
    const stored = await downloadStored(viewDialogHandle, testInfo, 'stored-download')
    const downloadedText = pdfText(new TextDecoder('windows-1252').decode(downloaded))

    expect(stored.text).toContain('John Doe')
    expect(pageCount(stored.bytes)).toBe(1)
    expect(pageCount(stored.bytes)).toBe(pageCount(downloaded))
    expect(stored.text).toBe(downloadedText)
  })

  test('a letter is stored as its own PDF @slow', async ({ page }, testInfo) => {
    test.setTimeout(180_000)
    await loadDemo(page)
    await navRail(page).getByRole('button', { name: 'Cover letter' }).click()
    const letter = page.getByRole('dialog', { name: 'Cover letter' })
    await letter.getByRole('textbox', { name: 'Company' }).fill('Northwind Labs')
    await letter.getByRole('button', { name: 'Generate draft' }).click()
    const draft = letter.getByRole('textbox', { name: 'Draft (editable)' })
    await expect(draft).toHaveValue(/Northwind Labs/)
    // The first sentence after the greeting.
    const body = await draft.inputValue()
    const sentence = body.split(/\n{2,}/)[1].split(/(?<=[.!?])\s/)[0].replace(/\s+/g, ' ').trim()
    await letter.getByRole('button', { name: 'Close' }).click()

    const dialog = await openMarkApplied(page)
    await dialog.getByRole('textbox', { name: 'Company' }).fill('Northwind Labs')
    await dialog.getByRole('textbox', { name: 'Role' }).fill('Frontend Developer')
    await dialog.getByRole('radio', { name: 'US Letter' }).check()
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('Saved to Applications')).toBeVisible({ timeout: 30_000 })

    const [record] = await storedApplications(page)
    expect(record.letter.paper).toBe('letter')

    const view = await openViewSent(page, 'Northwind Labs')
    await view.getByRole('tab', { name: 'Cover letter' }).click()
    const file = await downloadStored(view, testInfo, 'stored-letter')
    expect(file.fileName).toMatch(/cover-letter\.pdf$/)
    expect(file.text).toContain('Northwind Labs')
    expect(file.text).toContain(sentence)
  })
})
