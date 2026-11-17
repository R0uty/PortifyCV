import { test, expect } from './fixtures/base.js'

// The ATS panel's job-ad box (1.7.2, src/utils/jobMatch.js): the
// requirements an ad names, which the CV already mentions, and a saved
// copy of the CV to tailor for that job. The matcher's rules are checked
// by scripts/check-job-match.mjs; this is the panel around it. The suite
// opens the builder in Classic mode (playwright.config.js).

const AD = `Senior Frontend Developer
We are looking for a developer to join our team in Helsinki. Requirements: React,
TypeScript, CSS and accessibility (WCAG), testing with Playwright, CI/CD pipelines.
Nice to have: design systems and Figma.`

const fullName = (page) => page.getByRole('textbox', { name: /Full name/ })

async function openClassicAtsPanel(page) {
  const panel = page.locator('details.editor-tools', { has: page.locator('.editor-tools__stat') })
  await panel.locator('summary').click()
  return panel
}

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
      resolve(getAll.result.map((record) => ({ name: record.name, fullName: record.data?.fullName })).sort((a, b) => a.name.localeCompare(b.name)))
    }
  }
}))

test.describe('Job ad match', () => {
  test('lists real requirements, and adding one moves it into the CV', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('button', { name: 'Load demo CV' }).first().click()
    const panel = await openClassicAtsPanel(page)
    await panel.getByRole('textbox', { name: 'Job description' }).fill(AD)

    const result = panel.locator('[data-job-match]')
    await expect(result.getByRole('button', { name: '+ CSS' })).toBeVisible()
    await expect(result.getByRole('button', { name: '+ CI/CD' })).toBeVisible()
    // Words from the ad that are not requirements.
    for (const noise of ['team', 'looking', 'Helsinki', 'developer', 'join']) {
      await expect(result.getByRole('button', { name: `+ ${noise}`, exact: true })).toHaveCount(0)
    }
    // The demo CV has these as skills, written its own way.
    await expect(result.getByText('Figma', { exact: true })).toBeVisible()
    await expect(result.getByText('Design Systems', { exact: true })).toBeVisible()

    await result.getByRole('button', { name: '+ CSS' }).click()
    await expect(page.getByText('Added "CSS" to skills.')).toBeVisible()
    await expect(result.getByRole('button', { name: '+ CSS' })).toHaveCount(0)
    await expect(result.locator('[data-job-match-skills-only]')).toContainText('CSS')
  })

  test('reads a Finnish ad', async ({ page }) => {
    await page.goto('/cv')
    const panel = await openClassicAtsPanel(page)
    await panel.getByRole('textbox', { name: 'Job description' }).fill(
      'Edellytämme kokemusta Reactista ja TypeScriptistä, hyvää CSS-osaamista sekä saavutettavuuden tuntemusta. Työpaikka on Helsingissä.',
    )

    const result = panel.locator('[data-job-match]')
    // Missing or already in the sample CV the builder opens with: either way, read back to its base form.
    for (const label of ['React', 'TypeScript', 'CSS', 'Saavutettavuus']) {
      await expect(result.getByText(new RegExp(`^(\\+ )?${label}$`))).toBeVisible()
    }
    await expect(result.getByRole('button', { name: /Helsing/ })).toHaveCount(0)
  })

  test('a copy for the job is saved apart from the saved CV it came from', async ({ page }) => {
    await page.goto('/cv')
    await fullName(page).fill('Ada Lovelace')

    await page.getByRole('banner').getByRole('button', { name: 'Save on this device' }).click()
    const saveDialog = page.getByRole('dialog', { name: 'Save on this device' })
    await saveDialog.getByLabel('Name for this CV').fill('Ada')
    await saveDialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('Saved on this device as "Ada".')).toBeVisible()

    const panel = await openClassicAtsPanel(page)
    await panel.getByRole('textbox', { name: 'Job description' }).fill(AD)
    await expect(panel.getByText('You edit the copy; "Ada" stays as it was saved.')).toBeVisible()
    await panel.getByRole('button', { name: 'Save a copy for this job' }).click()

    await expect(saveDialog.getByLabel('Name for this CV')).toHaveValue('Ada – Senior Frontend Developer')
    await expect(saveDialog.getByText('"Ada" stays as it was saved.', { exact: false })).toBeVisible()
    await saveDialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('banner').getByRole('button', { name: 'Saved on this device: Ada – Senior Frontend Developer' })).toBeVisible()

    await fullName(page).fill('Ada King')
    await expect.poll(() => storedCvs(page)).toEqual([
      { name: 'Ada', fullName: 'Ada Lovelace' },
      { name: 'Ada – Senior Frontend Developer', fullName: 'Ada King' },
    ])
  })

  test('in Direct Edit, Save a copy closes the ATS dialog and asks for a name', async ({ page }) => {
    await page.goto('/cv')
    await page.getByRole('tab', { name: 'Direct Edit' }).click()
    await page.locator('.direct-edit-actions').getByRole('button', { name: /^ATS score/ }).click()
    const atsDialog = page.getByRole('dialog', { name: 'ATS score & suggestions' })
    await atsDialog.getByRole('textbox', { name: 'Job description' }).fill('A very long first line that is clearly not a job title at all, describing the company.\nReact')
    await atsDialog.getByRole('button', { name: 'Save a copy for this job' }).click()

    await expect(atsDialog).toBeHidden()
    const saveDialog = page.getByRole('dialog', { name: 'Save on this device' })
    await expect(saveDialog.getByLabel('Name for this CV')).toHaveValue(/ – tailored$/)
  })
})
