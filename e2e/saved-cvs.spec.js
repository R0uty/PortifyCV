import { test, expect } from './fixtures/base.js'

// Saved CVs on the device (1.7.1, src/hooks/useCvLibrary.js,
// src/utils/cvLibrary.js). Nothing is stored until the visitor presses
// Save and names the CV; after that its edits save themselves. The suite
// opens the builder in Classic mode (playwright.config.js).

const fullName = (page) => page.getByRole('textbox', { name: /Full name/ })
const saveButton = (page) => page.getByRole('banner').getByRole('button', { name: 'Save on this device' })
const savedButton = (page, name) => page.getByRole('banner').getByRole('button', { name: `Saved on this device: ${name}` })
const savedCvsDialog = (page) => page.getByRole('dialog', { name: 'My CVs' })
const row = (page, name) => savedCvsDialog(page).locator(`[data-saved-cv="${name}"]`)

// Every record in the app's database, read straight from IndexedDB.
const storedCvs = (page) => page.evaluate(() => new Promise((resolve, reject) => {
  const request = indexedDB.open('portifycv')
  request.onerror = () => reject(request.error)
  request.onsuccess = () => {
    const database = request.result
    if (!database.objectStoreNames.contains('cvs')) {
      database.close()
      resolve([])
      return
    }
    const getAll = database.transaction('cvs').objectStore('cvs').getAll()
    getAll.onsuccess = () => {
      database.close()
      resolve(getAll.result.map((record) => ({ id: record.id, name: record.name, fullName: record.data?.fullName })))
    }
    getAll.onerror = () => reject(getAll.error)
  }
}))

const leaveWouldAsk = (page) => page.evaluate(() => {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
})

async function saveAs(page, name) {
  await saveButton(page).click()
  const dialog = page.getByRole('dialog', { name: 'Save on this device' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Name for this CV').fill(name)
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText(`Saved on this device as "${name}".`)).toBeVisible()
  await expect(savedButton(page, name)).toBeVisible()
}

async function openMyCvs(page) {
  await page.getByRole('banner').getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: /^My CVs/ }).click()
  await expect(savedCvsDialog(page)).toBeVisible()
}

test.describe('Saved CVs', () => {
  test('nothing is stored until Save is pressed', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Grace Hopper')
    await page.waitForTimeout(900)

    expect(await storedCvs(page)).toEqual([])
    await expect(saveButton(page)).toBeVisible()
  })

  test('saving names the CV, later edits save themselves, and a reload reopens it', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Grace Hopper')

    await saveButton(page).click()
    const dialog = page.getByRole('dialog', { name: 'Save on this device' })
    // The suggested name comes from the CV.
    await expect(dialog.getByLabel('Name for this CV')).toHaveValue('Grace Hopper CV')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(savedButton(page, 'Grace Hopper CV')).toBeVisible()
    await expect(page.locator('.editor-status-pill')).toHaveText('Saved on this device')

    expect(await storedCvs(page)).toEqual([
      expect.objectContaining({ name: 'Grace Hopper CV', fullName: 'Grace Hopper' }),
    ])

    await fullName(page).fill('Grace B. Hopper')
    await expect.poll(async () => (await storedCvs(page))[0]?.fullName).toBe('Grace B. Hopper')
    // Written to the device, so leaving has nothing to ask about.
    expect(await leaveWouldAsk(page)).toBe(false)

    await page.reload()
    await expect(fullName(page)).toHaveValue('Grace B. Hopper')
    await expect(savedButton(page, 'Grace Hopper CV')).toBeVisible()

    await fullName(page).fill('Rear Admiral Grace Hopper')
    await expect.poll(async () => (await storedCvs(page)).map((cv) => cv.fullName))
      .toEqual(['Rear Admiral Grace Hopper'])
  })

  test('a new visit says saved CVs exist without opening one', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Grace Hopper')
    await saveAs(page, 'Navy')

    // A new tab: no session restore, so nothing to reattach to.
    const other = await page.context().newPage()
    await other.goto('/cv')
    await expect(other.getByText('You have 1 saved CV. Open it from More actions › My CVs.')).toBeVisible()
    await expect(saveButton(other)).toBeVisible()
    await other.close()
  })

  test('My CVs opens, duplicates, renames and deletes', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveAs(page, 'Analyst')

    await openMyCvs(page)
    await savedCvsDialog(page).getByRole('button', { name: 'New CV' }).click()
    await expect(page.getByText('Started a new, empty CV.')).toBeVisible()
    await expect(fullName(page)).toHaveValue('')
    await expect(saveButton(page)).toBeVisible()

    await fullName(page).fill('Grace Hopper')
    await saveAs(page, 'Navy')
    await expect.poll(async () => (await storedCvs(page)).length).toBe(2)

    // Open the other one. The Undo arrow must not reach back into "Navy".
    await openMyCvs(page)
    await expect(row(page, 'Navy').getByText('Open now')).toBeVisible()
    await row(page, 'Analyst').getByRole('button', { name: 'Open' }).click()
    await expect(page.getByText('Opened Analyst.')).toBeVisible()
    await expect(fullName(page)).toHaveValue('Ada Lovelace')
    await expect(savedButton(page, 'Analyst')).toBeVisible()
    await expect(page.getByRole('banner').getByRole('button', { name: 'Undo' })).toBeDisabled()

    await openMyCvs(page)
    await row(page, 'Analyst').getByRole('button', { name: 'Duplicate' }).click()
    await expect(page.getByText('Copy made and opened.')).toBeVisible()
    await expect(savedButton(page, 'Analyst (copy)')).toBeVisible()
    await expect(fullName(page)).toHaveValue('Ada Lovelace')

    await openMyCvs(page)
    await row(page, 'Analyst (copy)').getByRole('button', { name: 'Rename' }).click()
    await savedCvsDialog(page).getByLabel('New name for Analyst (copy)').fill('Analyst, Helsinki')
    await savedCvsDialog(page).getByRole('button', { name: 'Save name' }).click()
    await expect(row(page, 'Analyst, Helsinki')).toBeVisible()
    await expect(savedButton(page, 'Analyst, Helsinki')).toBeVisible()

    // Delete takes a second click.
    await row(page, 'Navy').getByRole('button', { name: 'Delete' }).click()
    await row(page, 'Navy').getByRole('button', { name: 'Confirm delete' }).click()
    await expect(row(page, 'Navy')).toHaveCount(0)
    expect((await storedCvs(page)).map((cv) => cv.name).sort()).toEqual(['Analyst', 'Analyst, Helsinki'])

    // Deleting the open one leaves it on screen, just not saved.
    await row(page, 'Analyst, Helsinki').getByRole('button', { name: 'Delete' }).click()
    await row(page, 'Analyst, Helsinki').getByRole('button', { name: 'Confirm delete' }).click()
    await expect(row(page, 'Analyst, Helsinki')).toHaveCount(0)
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(saveButton(page)).toBeVisible()
    await expect(fullName(page)).toHaveValue('Ada Lovelace')
  })

  test('opening another CV over unsaved changes takes a second click', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveAs(page, 'Analyst')
    await openMyCvs(page)
    await savedCvsDialog(page).getByRole('button', { name: 'New CV' }).click()
    await fullName(page).fill('Unsaved Person')

    await openMyCvs(page)
    await row(page, 'Analyst').getByRole('button', { name: 'Open' }).click()
    await expect(fullName(page)).toHaveValue('Unsaved Person')
    await row(page, 'Analyst').getByRole('button', { name: 'Discard changes and open' }).click()
    await expect(fullName(page)).toHaveValue('Ada Lovelace')
  })

  test('Settings deletes every saved CV', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveAs(page, 'Analyst')

    await page.getByRole('button', { name: 'Settings' }).click()
    const settings = page.getByRole('dialog', { name: 'Settings' })
    await expect(settings.getByText('CVs saved on this device (1)')).toBeVisible()
    await settings.getByRole('button', { name: 'Delete all saved CVs' }).click()
    await settings.getByRole('button', { name: 'Confirm delete all' }).click()
    await expect(page.getByText('All saved CVs were deleted from this device.')).toBeVisible()

    expect(await storedCvs(page)).toEqual([])
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(saveButton(page)).toBeVisible()
    await expect(fullName(page)).toHaveValue('Ada Lovelace')
  })

  test('a save from another tab pauses this one until Save is pressed', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveAs(page, 'Analyst')

    const other = await page.context().newPage()
    await other.goto('/cv')
    await openMyCvs(other)
    await row(other, 'Analyst').getByRole('button', { name: /Open|Discard changes and open/ }).click()
    await expect(fullName(other)).toHaveValue('Ada Lovelace')
    await fullName(other).fill('Ada from the other tab')
    await expect.poll(async () => (await storedCvs(page))[0]?.fullName).toBe('Ada from the other tab')

    await fullName(page).fill('Ada from the first tab')
    await expect(page.getByText(/"Analyst" was changed in another tab, so saving is paused here/)).toBeVisible()
    const paused = page.getByRole('banner').getByRole('button', { name: 'Saving paused: Analyst. Save now' })
    await expect(paused).toBeVisible()
    // Not overwritten while paused.
    await page.waitForTimeout(900)
    expect((await storedCvs(page))[0]?.fullName).toBe('Ada from the other tab')

    await paused.click()
    await expect(page.getByText('Saved on this device.')).toBeVisible()
    await expect(savedButton(page, 'Analyst')).toBeVisible()
    expect((await storedCvs(page))[0]?.fullName).toBe('Ada from the first tab')
    await other.close()
  })

  test('a CV deleted elsewhere is still on screen, and saved again only on request', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveAs(page, 'Analyst')

    await page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('portifycv')
      request.onsuccess = () => {
        const transaction = request.result.transaction('cvs', 'readwrite')
        transaction.objectStore('cvs').clear()
        transaction.oncomplete = () => {
          request.result.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
      }
      request.onerror = () => reject(request.error)
    }))

    await fullName(page).fill('Ada King')
    await expect(page.getByText('"Analyst" is no longer saved on this device.', { exact: false })).toBeVisible()
    await expect(saveButton(page)).toBeVisible()
    await expect(fullName(page)).toHaveValue('Ada King')
    expect(await storedCvs(page)).toEqual([])
  })

  test('clearing or loading the demo does not overwrite the saved CV', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveAs(page, 'Analyst')

    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    await expect(saveButton(page)).toBeVisible()
    await page.waitForTimeout(900)
    expect((await storedCvs(page)).map((cv) => cv.fullName)).toEqual(['Ada Lovelace'])
  })

  test('where the browser blocks storage, the Save dialog says so', async ({ page }) => {
    await page.addInitScript(() => {
      IDBFactory.prototype.open = () => {
        throw new DOMException('blocked', 'SecurityError')
      }
    })
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')
    await saveButton(page).click()

    const dialog = page.getByRole('dialog', { name: 'Save on this device' })
    await expect(dialog.getByRole('alert')).toContainText('This browser does not allow saving on the device')
    await expect(dialog.getByLabel('Name for this CV')).toHaveCount(0)
  })
})
