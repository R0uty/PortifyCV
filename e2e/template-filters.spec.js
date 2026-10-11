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
    await expect(page).toHaveURL(/\/free-cv-templates\/[a-z-]+$/)

    await page.goBack()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=graduate$/)
    await expect(chip(page, 'Graduate')).toBeChecked()
    await expect(gridNames(page)).toHaveText(labelsFor('graduate'))
  })
})
