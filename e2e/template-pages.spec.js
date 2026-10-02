import { test, expect } from '@playwright/test'

// Per-template pages: /free-cv-templates/<slug>. One page component renders
// all 18; routing comes from the VIEW_HEAD entries generated in pageMeta.js.

test.describe('Template pages', () => {
  test('a template page loads directly at its own URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Developer CV template')
    await expect(page).toHaveTitle('Developer CV Template - Free, No Login - PortifyCV')
    await expect(page.locator('.template-page__preview [data-export-header]').first()).toBeVisible()

    const breadcrumbBox = await page.locator('.template-page__breadcrumb').boundingBox()
    const headingBox = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(Math.abs(breadcrumbBox.x - headingBox.x)).toBeLessThanOrEqual(2)
  })

  test('an unknown template slug shows the not-found view', async ({ page }) => {
    await page.goto('/free-cv-templates/not-a-template')
    await expect(page).toHaveTitle('Page Not Found - PortifyCV')
  })

  test('the page carries breadcrumb structured data', async ({ page }) => {
    await page.goto('/free-cv-templates/modern-timeline')
    const schema = JSON.parse(await page.locator('#view-structured-data').textContent())
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement[2].item).toBe('https://portifycv.app/free-cv-templates/modern-timeline')
  })

  test('the example switcher changes the preview and the URL', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const examples = page.getByRole('radiogroup', { name: 'Examples' })
    await expect(examples.getByRole('radio', { name: 'Frontend developer' })).toBeChecked()
    await expect(page.locator('.template-page__preview')).toContainText('Mikael Laine')

    await examples.getByRole('radio', { name: 'Data engineer' }).click()
    await expect(page).toHaveURL(/\?example=data-engineer$/)

    await page.reload()
    await expect(page.getByRole('radiogroup', { name: 'Examples' }).getByRole('radio', { name: 'Data engineer' })).toBeChecked()
  })

  test('switching examples does not show the previous example under the new radio', async ({ page }) => {
    // Delay the dynamic import of the new example so the race window
    // between clicking the radio and the load resolving is wide enough
    // to observe deterministically, instead of depending on how fast an
    // already-cached chunk happens to resolve.
    await page.route('**/*data-engineer*.js', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await page.goto('/free-cv-templates/developer')
    const examples = page.getByRole('radiogroup', { name: 'Examples' })
    const preview = page.locator('.template-page__preview')
    await expect(preview).toContainText('Mikael Laine')

    await examples.getByRole('radio', { name: 'Data engineer' }).click()
    // The data-engineer chunk's dynamic import is delayed above. Read the
    // preview's text as an immediate snapshot (no Playwright auto-retry
    // polling) right after the click, while the import is still in
    // flight: it must already have dropped the frontend-developer
    // example's content (falling back to the demo CV instead), not keep
    // showing it until the import settles.
    const immediateText = await preview.innerText()
    expect(immediateText).not.toContain('Mikael Laine')

    // Once the delayed chunk resolves, the preview must show the
    // data-engineer person, proving the race was real and is now won by
    // the right example (not just "not Mikael Laine").
    await expect(preview).toContainText('Elina Virtanen')
  })

  test('an unknown ?example= falls back to the first example', async ({ page }) => {
    await page.goto('/free-cv-templates/developer?example=nope')
    await expect(page.getByRole('radiogroup', { name: 'Examples' }).getByRole('radio', { name: 'Frontend developer' })).toBeChecked()
  })

  test('the ATS view toggle switches the preview to ATS rendering', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const preview = page.locator('.template-page__preview')
    const before = await preview.innerHTML()
    await page.getByRole('checkbox', { name: 'ATS view' }).check()
    await expect.poll(() => preview.innerHTML()).not.toBe(before)
  })

  test('previous and next wrap around the template list', async ({ page }) => {
    await page.goto('/free-cv-templates/minimalist')
    await page.getByRole('link', { name: /Previous template/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/european$/)
    await page.getByRole('link', { name: /Next template/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/minimalist$/)
  })

  test('a hub card links to its template page', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await page.getByRole('link', { name: 'Modern Timeline', exact: true }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/modern-timeline$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Modern Timeline CV template')
  })

  test('"Use this example" opens the builder with that template and example', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    await page.getByRole('button', { name: 'Use this example' }).click()
    await expect(page).toHaveURL(/\/cv\?template=developer$/)
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
    await expect(page.getByText('Loaded the Frontend developer example.')).toBeVisible()
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Mikael Laine')
  })

  test('the preview hides empty sections instead of showing placeholder text', async ({ page }) => {
    await page.goto('/free-cv-templates/developer')
    const preview = page.locator('.template-page__preview')
    await expect(preview).toBeVisible()
    await expect(preview).not.toContainText(/will appear here/i)

    await page.goto('/free-cv-templates/graduate')
    const graduatePreview = page.locator('.template-page__preview')
    await expect(graduatePreview).toBeVisible()
    await expect(graduatePreview).not.toContainText(/will appear here/i)
  })

  test('the preview hides empty sections in Finnish too', async ({ page }) => {
    // Every Finnish placeholder across the Showcase templates follows the
    // same "<Section> näky(vät|y) tässä[,.]" pattern (e.g. "Kielet näkyvät
    // tässä.", "Koulutus näkyy tässä."); one case-insensitive regex on the
    // shared "näky... tässä" fragment covers all of them.
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))

    await page.goto('/free-cv-templates/developer')
    const preview = page.locator('.template-page__preview')
    await expect(preview).toBeVisible()
    await expect(preview).not.toContainText(/näky\S* tässä/i)

    await page.goto('/free-cv-templates/graduate')
    const graduatePreview = page.locator('.template-page__preview')
    await expect(graduatePreview).toBeVisible()
    await expect(graduatePreview).not.toContainText(/näky\S* tässä/i)
  })

  test('an example link never overwrites a restored session', async ({ page }) => {
    await page.goto('/cv')
    await page.evaluate(() => window.localStorage.setItem('portifycv-session-restore-enabled', 'true'))
    await page.reload()
    await page.getByRole('textbox', { name: /Full name/ }).fill('Grace Hopper')
    await expect
      .poll(() => page.evaluate(() => window.sessionStorage.getItem('portifycv-session-snapshot')))
      .toContain('Grace Hopper')

    await page.goto('/cv?template=developer&example=frontend-developer')
    await expect(page.locator('.app-toolbar__template-trigger-label')).toHaveText('Developer')
    await expect(page.getByRole('textbox', { name: /Full name/ })).toHaveValue('Grace Hopper')
  })
})
