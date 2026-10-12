import { test, expect } from './fixtures/base.js'
import { demoCvData } from '../src/utils/cvForm.js'

// JSON import must never make the app fetch something on its own
// (1.6.20, docs/security-audit-1.6.19.md): a remote URL in photo or a
// project image used to be loaded as soon as the file was imported, a
// tracking beacon for whoever crafted the file. Requests to the bait host
// are intercepted, so nothing leaves the test.

const BAIT = 'https://pentest-beacon.invalid'

const importFile = async (page, cv, name = 'crafted-cv.json') => {
  await page.getByRole('tab', { name: 'Classic' }).click()
  await page.locator('input[type="file"][accept=".json,application/json"]').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(cv)),
  })
}

test.describe('JSON import images', () => {
  test('a remote photo or project image is refused and never fetched', async ({ page }) => {
    const baitRequests = []
    await page.route(`${BAIT}/**`, (route) => {
      baitRequests.push(route.request().url())
      return route.fulfill({ status: 204, body: '' })
    })
    await page.goto('/cv?template=developer')

    const crafted = structuredClone(demoCvData)
    crafted.fullName = 'Crafted Person'
    crafted.photo = `${BAIT}/photo.png?who=victim`
    crafted.projects[0].image = `${BAIT}/project.png`
    await importFile(page, crafted)

    await expect(page.getByText(/photo must be an image embedded in the file/)).toBeVisible()
    await expect(page.locator(`img[src^="${BAIT}"]`)).toHaveCount(0)
    // The refused file changed nothing.
    await expect(page.locator('[data-cv-name]').first()).not.toContainText('Crafted Person')
    expect(baitRequests).toEqual([])
  })

  test('an embedded photo still imports', async ({ page }) => {
    await page.goto('/cv?template=developer')

    const cv = structuredClone(demoCvData)
    cv.fullName = 'Embedded Person'
    // 1x1 PNG, the same inline form the app's own upload produces.
    cv.photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    await importFile(page, cv, 'embedded-cv.json')

    await expect(page.getByText('Imported CV data from embedded-cv.json.')).toBeVisible()
    await expect(page.locator('[data-cv-name]').first()).toContainText('Embedded Person')
    await expect(page.locator('img[src^="data:image/png"]').first()).toBeVisible()
  })
})
