import { test, expect } from './fixtures/base.js'
import { getTemplateVariants, getVariantLook } from '../src/utils/templateVariants.js'
import { cvTemplates } from '../src/utils/cvTemplates.js'
import { CV_FONT_OPTIONS, getCvFontStack } from '../src/utils/cvFonts.js'

// Phase 4: the style looks outside the builder's Style picker. These are
// the builder's template gallery, the Free CV Templates grid, the template
// pages, and the ?style= handoff into the builder. Assertions read the
// palette variables, --font-sans and the Style picker's label, not
// screenshots.

const label = (id) => cvTemplates.find((template) => template.id === id).label
const fontLabel = (fontId) => CV_FONT_OPTIONS.find((font) => font.id === fontId).label
const styleTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select style:/ })
const fontTrigger = (page) => page.getByRole('banner').getByRole('button', { name: /^Select font:/ })
const templateLabel = (page) => page.locator('.app-toolbar__template-trigger-label')

// The first palette variable whose value differs between two looks, so
// a read of it proves which look is rendered.
const differingVar = (a, b) => Object.keys(a.palette)
  .find((name) => a.palette[name].toLowerCase() !== b.palette[name].toLowerCase())

// Read on the name (every Showcase's <h1 data-cv-name>), which inherits
// the palette from the Showcase root. toHaveCSS can't read custom
// properties.
const paletteVar = (scope, name) => scope.locator('[data-cv-name]').first()
  .evaluate((el, variable) => getComputedStyle(el).getPropertyValue(variable).trim(), name)

const lookGroup = (scope, groupName) => scope.getByRole('radiogroup', { name: groupName, exact: true })
const lookRadio = (scope, groupName, variant) => lookGroup(scope, groupName)
  .getByRole('radio', { name: variant.label.en, exact: true })

const developer = getTemplateVariants('developer')
const creative = getTemplateVariants('creative')
const developerVar = differingVar(developer[0], developer[1])
const creativeVar = differingVar(creative[0], creative[1])

test.describe('Template gallery looks', () => {
  const openGallery = async (page) => {
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    await expect(dialog.locator('.template-gallery__thumb [data-export-variant]')).toHaveCount(cvTemplates.length)
    return dialog
  }
  const card = (dialog, id) => dialog.locator('.template-gallery__card')
    .filter({ has: lookGroup(dialog.page(), `Style: ${label(id)}`) })
  const thumbFont = (scope) => scope.locator('.template-gallery__thumb-page')
    .evaluate((el) => el.style.getPropertyValue('--font-sans'))

  test('cards open on each template\'s stored look; a swatch previews only its own card', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await styleTrigger(page).click()
    await page.getByRole('radiogroup', { name: 'Select style' }).getByRole('radio', { name: developer[1].label.en }).click()
    await page.getByRole('button', { name: /^Select template:/ }).click()
    const dialog = page.getByRole('dialog', { name: 'Template gallery' })
    await expect(lookRadio(dialog, `Style: ${label('developer')}`, developer[1])).toBeChecked()
    await expect(lookRadio(dialog, `Style: ${label('creative')}`, creative[0])).toBeChecked()

    await lookRadio(dialog, `Style: ${label('creative')}`, creative[1]).check()
    await expect.poll(() => paletteVar(card(dialog, 'creative'), creativeVar)).toBe(creative[1].palette[creativeVar])
    await expect.poll(() => thumbFont(card(dialog, 'creative'))).toBe(getVariantLook('creative', creative[1].id).fontStack)
    // Only that card changed, and nothing was selected.
    expect(await paletteVar(card(dialog, 'developer'), developerVar)).toBe(developer[1].palette[developerVar])
    await expect(dialog).toBeVisible()
    await expect(templateLabel(page)).toHaveText(label('developer'))
  })

  test('the open template\'s card mirrors live tweaks until another look is previewed', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await fontTrigger(page).click()
    await page.getByRole('option', { name: 'Georgia' }).click()
    const dialog = await openGallery(page)
    const developerCard = card(dialog, 'developer')
    await expect.poll(() => thumbFont(developerCard)).toBe(getCvFontStack('georgia'))
    await expect(developerCard.locator('.template-gallery__use')).toHaveText('In use')

    await lookRadio(dialog, `Style: ${label('developer')}`, developer[1]).check()
    await expect.poll(() => thumbFont(developerCard)).toBe(getVariantLook('developer', developer[1].id).fontStack)
    await expect(developerCard.locator('.template-gallery__use')).toHaveText('Use this style')

    await lookRadio(dialog, `Style: ${label('developer')}`, developer[0]).check()
    await expect.poll(() => thumbFont(developerCard)).toBe(getCvFontStack('georgia'))
    await expect(developerCard.locator('.template-gallery__use')).toHaveText('In use')
  })

  test('Use applies the template and the shown look; Undo restores the stored look', async ({ page }) => {
    await page.goto('/cv?template=minimal')
    const dialog = await openGallery(page)
    await lookRadio(dialog, `Style: ${label('developer')}`, developer[1]).check()
    await card(dialog, 'developer').getByRole('button').click()
    await expect(dialog).toBeHidden()
    await expect(templateLabel(page)).toHaveText(label('developer'))
    await expect(styleTrigger(page)).toHaveAccessibleName(`Select style: ${developer[1].label.en}`)
    await expect(fontTrigger(page)).toHaveAccessibleName(`Select font: ${fontLabel(developer[1].fontId)}`)
    await expect.poll(() => paletteVar(page.locator('.app-shell__preview'), developerVar)).toBe(developer[1].palette[developerVar])

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original')
    await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Inter')
  })

  test('Use on the open template\'s stored look keeps the tweaks', async ({ page }) => {
    await page.goto('/cv?template=developer')
    await fontTrigger(page).click()
    await page.getByRole('option', { name: 'Georgia' }).click()
    const dialog = await openGallery(page)
    await card(dialog, 'developer').getByRole('button').click()
    await expect(dialog).toBeHidden()
    await expect(styleTrigger(page)).toHaveAccessibleName('Select style: Original, Modified')
    await expect(fontTrigger(page)).toHaveAccessibleName('Select font: Georgia')
  })

  test('View examples carries the previewed look', async ({ page }) => {
    await page.goto('/cv')
    const dialog = await openGallery(page)
    const link = dialog.getByRole('link', { name: `View examples: ${label('developer')}` })
    const slug = cvTemplates.find((template) => template.id === 'developer').slug
    await expect(link).toHaveAttribute('href', `/free-cv-templates/${slug}`)
    await lookRadio(dialog, `Style: ${label('developer')}`, developer[1]).check()
    await expect(link).toHaveAttribute('href', `/free-cv-templates/${slug}?style=${developer[1].id}`)
    await lookRadio(dialog, `Style: ${label('developer')}`, developer[0]).check()
    await expect(link).toHaveAttribute('href', `/free-cv-templates/${slug}`)
  })

  test('the looks are a keyboard radio group', async ({ page }) => {
    await page.goto('/cv')
    const dialog = await openGallery(page)
    const group = `Style: ${label('developer')}`
    await expect(lookGroup(dialog, group).getByRole('radio')).toHaveCount(developer.length)
    await lookRadio(dialog, group, developer[0]).focus()
    await page.keyboard.press('ArrowRight')
    await expect(lookRadio(dialog, group, developer[1])).toBeFocused()
    await expect(lookRadio(dialog, group, developer[1])).toBeChecked()
  })
})

const developerSlug = cvTemplates.find((template) => template.id === 'developer').slug

test.describe('Free CV Templates grid looks', () => {
  const gridCard = (page, id) => page.locator('.templates-page-card')
    .filter({ has: lookGroup(page, `Style: ${label(id)}`) })

  test('a swatch previews only its own card and carries into its links', async ({ page }) => {
    await page.goto('/free-cv-templates')
    await expect(page.locator('.templates-page-card [data-export-variant]')).toHaveCount(cvTemplates.length)
    const developerCard = gridCard(page, 'developer')
    const nameLink = developerCard.locator('a.templates-page-card__name')
    const examplesLink = developerCard.getByRole('link', { name: `View examples: ${label('developer')}` })
    await expect(nameLink).toHaveAttribute('href', `/free-cv-templates/${developerSlug}`)

    await lookRadio(page, `Style: ${label('developer')}`, developer[1]).check()
    await expect.poll(() => paletteVar(developerCard, developerVar)).toBe(developer[1].palette[developerVar])
    expect(await paletteVar(gridCard(page, 'creative'), creativeVar)).toBe(creative[0].palette[creativeVar])
    await expect(nameLink).toHaveAttribute('href', `/free-cv-templates/${developerSlug}?style=${developer[1].id}`)
    await expect(examplesLink).toHaveAttribute('href', `/free-cv-templates/${developerSlug}?style=${developer[1].id}`)

    await developerCard.locator('.templates-page-card__thumb').click()
    await expect(page).toHaveURL(new RegExp(`/free-cv-templates/${developerSlug}\\?style=${developer[1].id}$`))
    await expect(lookRadio(page, 'Style', developer[1])).toBeChecked()
  })
})

test.describe('Template page looks', () => {
  test('?style= opens the page on that look; an unknown one on Original', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?style=${developer[2].id}`)
    await expect(lookRadio(page, 'Style', developer[2])).toBeChecked()
    await expect.poll(() => paletteVar(page.locator('.template-page__preview'), differingVar(developer[0], developer[2])))
      .toBe(developer[2].palette[differingVar(developer[0], developer[2])])

    await page.goto(`/free-cv-templates/${developerSlug}?style=no-such-look`)
    await expect(lookRadio(page, 'Style', developer[0])).toBeChecked()
  })

  test('the picker updates the URL and keeps ?example=', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?example=data-engineer`)
    await lookRadio(page, 'Style', developer[1]).check()
    await expect(page).toHaveURL(new RegExp(`\\?example=data-engineer&style=${developer[1].id}$`))
    await expect.poll(() => paletteVar(page.locator('.template-page__preview'), developerVar)).toBe(developer[1].palette[developerVar])
    await lookRadio(page, 'Style', developer[0]).check()
    await expect(page).toHaveURL(/\?example=data-engineer$/)
  })

  test('moving to another template starts it on Original', async ({ page }) => {
    await page.goto(`/free-cv-templates/${developerSlug}?style=${developer[1].id}`)
    await page.getByRole('link', { name: /^Next template:/ }).click()
    await expect(page).not.toHaveURL(/style=/)
    await expect(lookGroup(page, 'Style').getByRole('radio').first()).toBeChecked()
  })

  test('Finnish label', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('ui-locale', 'fi'))
    await page.goto(`/free-cv-templates/${developerSlug}`)
    await expect(page.getByRole('radiogroup', { name: 'Tyyli', exact: true })).toBeVisible()
  })
})
