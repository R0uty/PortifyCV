import { test, expect } from './fixtures/base.js'
import { cvTemplates, getCvTemplates } from '../src/utils/cvTemplates.js'
import { TEMPLATE_FIELDS } from '../src/utils/templateFields.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'

// Field filters (1.6.12) on the Free CV Templates grid and the builder's
// template gallery. Expected sets come from the template data, never
// hard-coded, so a retag only needs cvTemplates.js.

const labelsFor = (fieldId, locale = 'en') => getCvTemplates(locale)
  .filter((template) => fieldId === null || template.fields.includes(fieldId))
  .map((template) => template.label)
const fieldGroup = (scope, groupName = 'Field') => scope.getByRole('radiogroup', { name: groupName, exact: true })
const chip = (scope, text, groupName = 'Field') => fieldGroup(scope, groupName).getByRole('radio', { name: text, exact: true })
const status = (scope) => scope.locator('.template-fields__status')
const gridNames = (page) => page.locator('a.templates-page-card__name')
const developer = getTemplateVariants('developer')

test.describe('Free CV Templates field filter', () => {
  test('each chip shows exactly its templates, in gallery order', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await expect(chip(page, 'All')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor(null))

    for (const field of TEMPLATE_FIELDS) {
      await chip(page, field.label.en).check()
      await expect(gridNames(page)).toHaveText(labelsFor(field.id))
    }

    await chip(page, 'All').check()
    await expect(gridNames(page)).toHaveCount(cvTemplates.length)
  })

  test('the address follows the chip without adding history', async ({ page }) => {
    await page.goto('/free-cv-templates')
    const historyLength = await page.evaluate(() => window.history.length)

    await chip(page, 'Tech').check()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=tech$/)
    await chip(page, 'Creative').check()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=creative$/)
    await chip(page, 'All').check()
    await expect(page).toHaveURL(/\/free-cv-templates$/)

    expect(await page.evaluate(() => window.history.length)).toBe(historyLength)
  })

  test('?field= opens on that chip; an unknown value opens on All', async ({ page }) => {
    await page.goto('/free-cv-templates?field=tech')
    await expect(chip(page, 'Tech')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor('tech'))

    await page.goto('/free-cv-templates?field=nope')
    await expect(chip(page, 'All')).toBeChecked()
    await expect(gridNames(page)).toHaveCount(cvTemplates.length)
  })

  test('the status line counts the shown templates, in Finnish too', async ({ page }) => {
    const total = cvTemplates.length
    const shown = labelsFor('leadership').length
    await page.goto('/free-cv-templates?field=leadership')
    await expect(status(page)).toHaveText(`Showing ${shown} of ${total} templates`)

    await page.getByRole('button', { name: 'Switch language' }).click()
    await expect(chip(page, 'Johto', 'Ala')).toBeChecked()
    await expect(status(page)).toHaveText(`Näytetään ${shown}/${total} pohjaa`)
    await expect(gridNames(page)).toHaveText(labelsFor('leadership', 'fi'))

    await chip(page, 'Kaikki', 'Ala').check()
    await expect(status(page)).toHaveText(`Kaikki ${total} pohjaa`)
  })

  test('an unchecked chip darkens its border on hover', async ({ page }) => {
    await page.goto('/free-cv-templates')
    const chipLabel = (text) => page.locator('.template-fields__chip').filter({ hasText: new RegExp(`^${text}$`) })
    const creative = chipLabel('Creative')
    const checkedBorder = await chipLabel('All')
      .evaluate((el) => getComputedStyle(el).borderColor)
    const restBorder = await creative.evaluate((el) => getComputedStyle(el).borderColor)
    expect(restBorder).not.toBe(checkedBorder)

    await creative.hover()
    await expect.poll(() => creative.evaluate((el) => getComputedStyle(el).borderColor)).toBe(checkedBorder)
  })

  test('a look picked on a card survives filtering it away and back', async ({ page }) => {
    await page.goto('/free-cv-templates')
    const developerLook = page.getByRole('radiogroup', { name: 'Style: Developer', exact: true })
      .getByRole('radio', { name: developer[1].label.en, exact: true })
    await developerLook.check()

    await chip(page, 'Creative').check()
    await expect(developerLook).toHaveCount(0)
    await chip(page, 'Tech').check()
    await expect(developerLook).toBeChecked()
  })

  test('Back from a template page returns to the same filter', async ({ page }) => {
    await page.goto('/free-cv-templates?field=graduate')
    await gridNames(page).first().click()
    // The template page carries the filter on (1.6.16).
    await expect(page).toHaveURL(/\/free-cv-templates\/[a-z-]+\?field=graduate$/)

    await page.goBack()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=graduate$/)
    await expect(chip(page, 'Graduate')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor('graduate'))
  })
})

test.describe('Template gallery field filter', () => {
  const openGallery = async (page) => {
    await page.getByRole('button', { name: /^Select template:/ }).click()
    return page.getByRole('dialog', { name: 'Template gallery' })
  }
  const galleryNames = (dialog) => dialog.locator('.template-gallery__name')

  test('a chip filters the cards; reopening the gallery starts on All', async ({ page }) => {
    await page.goto('/cv')
    let dialog = await openGallery(page)
    await expect(chip(dialog, 'All')).toBeChecked()
    await expect(status(dialog)).toHaveText(`All ${cvTemplates.length} templates`)

    await chip(dialog, 'Leadership').check()
    await expect(galleryNames(dialog)).toHaveText(labelsFor('leadership'))
    await expect(status(dialog)).toHaveText(`Showing ${labelsFor('leadership').length} of ${cvTemplates.length} templates`)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    dialog = await openGallery(page)
    await expect(chip(dialog, 'All')).toBeChecked()
    await expect(galleryNames(dialog)).toHaveCount(cvTemplates.length)
  })
})

// 1.6.14: the tech example pages' "See also" row links to the grid on the
// Tech chip instead of the unfiltered grid.
test.describe('Example pages link to the Tech filter', () => {
  for (const path of ['/developer-cv-examples', '/it-cv-examples', '/cybersecurity-cv-examples']) {
    test(`${path} opens the grid on Tech`, async ({ page }) => {
      await page.goto(path)
      const link = page.locator('.templates-page-links').getByRole('link', { name: 'Tech CV templates', exact: true })
      await expect(link).toHaveAttribute('href', '/free-cv-templates?field=tech')
      await expect(page.locator('.templates-page-links').getByRole('link', { name: 'Free CV Templates', exact: true }))
        .toHaveCount(0)

      await link.click()
      await expect(page).toHaveURL(/\/free-cv-templates\?field=tech$/)
      await expect(chip(page, 'Tech')).toBeChecked()
      await expect(page.locator('a.templates-page-card__name')).toHaveText(labelsFor('tech'))
    })
  }

  test('the link is translated', async ({ page }) => {
    await page.goto('/developer-cv-examples')
    await page.getByRole('button', { name: 'Switch language' }).click()
    // The switch moves to the Finnish page, whose links stay Finnish (1.6.35).
    await expect(page).toHaveURL(/\/fi\/kehittajan-cv-esimerkit$/)
    await expect(page.locator('.templates-page-links').getByRole('link', { name: 'Tekniikan ja IT-alan CV-pohjat', exact: true }))
      .toHaveAttribute('href', '/fi/ilmaiset-cv-pohjat?field=tech')
  })
})

// 1.6.16: a template page opened from a filtered grid keeps ?field=, so its
// links back to the grid (breadcrumb, "All templates") and its
// Previous/Next links keep the filter.
test.describe('Template pages keep the grid filter', () => {
  const pager = (page) => page.locator('.template-page__pager')
  const breadcrumb = (page) => page.locator('.template-page__breadcrumb')

  test('a card opened from a filtered grid carries ?field=, and "All templates" returns to it', async ({ page }) => {
    await page.goto('/free-cv-templates?field=tech')
    await gridNames(page).filter({ hasText: /^Developer$/ }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\/developer\?field=tech$/)

    await expect(breadcrumb(page).getByRole('link')).toHaveAttribute('href', '/free-cv-templates?field=tech')
    await pager(page).getByRole('link', { name: 'All templates', exact: true }).click()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=tech$/)
    await expect(chip(page, 'Tech')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor('tech'))
  })

  test('a card link carries both the picked look and the filter; the page keeps both', async ({ page }) => {
    await page.goto('/free-cv-templates?field=tech')
    await page.getByRole('radiogroup', { name: 'Style: Developer', exact: true })
      .getByRole('radio', { name: developer[1].label.en, exact: true }).check()
    const nameLink = gridNames(page).filter({ hasText: /^Developer$/ })
    await expect(nameLink).toHaveAttribute('href', `/free-cv-templates/developer?style=${developer[1].id}&field=tech`)

    await nameLink.click()
    // Changing the look on the page keeps the filter in its address.
    await page.getByRole('radiogroup', { name: 'Style', exact: true })
      .getByRole('radio', { name: developer[2].label.en, exact: true }).check()
    await expect(page).toHaveURL(new RegExp(`/free-cv-templates/developer\\?style=${developer[2].id}&field=tech$`))
  })

  test('Previous and Next keep the filter', async ({ page }) => {
    await page.goto('/free-cv-templates/developer?field=tech')
    const next = pager(page).getByRole('link', { name: /^Next template:/ })
    await expect(next).toHaveAttribute('href', /\?field=tech$/)
    await expect(pager(page).getByRole('link', { name: /Previous template:/ })).toHaveAttribute('href', /\?field=tech$/)

    await next.click()
    await expect(page).toHaveURL(/\/free-cv-templates\/[a-z-]+\?field=tech$/)
    await expect(pager(page).getByRole('link', { name: 'All templates', exact: true }))
      .toHaveAttribute('href', '/free-cv-templates?field=tech')
  })

  test('without a filter, or with an unknown one, the links stay plain', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await expect(gridNames(page).filter({ hasText: /^Developer$/ })).toHaveAttribute('href', '/free-cv-templates/developer')

    await page.goto('/free-cv-templates/developer?field=nope')
    await expect(pager(page).getByRole('link', { name: 'All templates', exact: true })).toHaveAttribute('href', '/free-cv-templates')
    await expect(breadcrumb(page).getByRole('link')).toHaveAttribute('href', '/free-cv-templates')
    await expect(pager(page).getByRole('link', { name: /^Next template:/ })).not.toHaveAttribute('href', /\?/)
  })
})
