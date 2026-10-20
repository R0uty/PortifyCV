import { test, expect } from './fixtures/base.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { getCvTemplates } from '../src/utils/cvTemplates.js'
import { CV_FONT_OPTIONS } from '../src/utils/cvFonts.js'

// Read on the name (every Showcase's <h1 data-cv-name>), which inherits
// the look's palette from the Showcase root.
const paletteVar = (scope, name) => scope.locator('[data-cv-name]').first()
  .evaluate((el, variable) => getComputedStyle(el).getPropertyValue(variable).trim(), name)

test.describe('Landing page', () => {
  test('shows the hero, a picture of the output, and the trust line', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Free CV builder. Build it, take it, done.' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Example CV built with PortifyCV' })).toBeVisible()
    await expect(page.getByText('No login. No data saved.').first()).toBeVisible()
  })

  test('Start building opens the CV editor', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Start building' }).click()

    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Section navigation' })).toBeVisible()
  })

  test('View templates, next to Start building, opens the templates page', async ({ page }) => {
    await page.goto('/')

    const viewTemplates = page.locator('.landing-hero').getByRole('link', { name: 'View templates' })
    await expect(viewTemplates).toHaveAttribute('href', '/free-cv-templates')
    await viewTemplates.click()

    await expect(page).toHaveURL(/\/free-cv-templates$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Free CV Templates' })).toBeVisible()
  })

  test('the hero stack shows Minimalist in front, Creative and Developer behind', async ({ page }) => {
    await page.goto('/')

    const variantOf = (modifier) => page.locator(`.landing-preview__thumb--${modifier} [data-export-variant]`)
      .first().getAttribute('data-export-variant')
    expect(await variantOf('front')).toBe('minimal')
    expect(await variantOf('back-left')).toBe('creative')
    expect(await variantOf('back-right')).toBe('developer')
  })
})

test.describe('Landing templates strip looks', () => {
  // Card n (gallery order) shows its template's look n mod 3, named under
  // the template name; the loop copy repeats the same looks. A look whose
  // font is a download (Calibri, Lato) is skipped for the next one in the
  // rotation (1.6.18), so the landing page never fetches a font for a strip
  // thumbnail.
  const cards = (page) => page.locator('.landing-templates-card')
  const downloadsFont = (fontId) => Boolean(CV_FONT_OPTIONS.find((font) => font.id === fontId)?.load)
  const stripLook = (variants, index) => {
    for (let step = 0; step < variants.length; step += 1) {
      const look = variants[(index + step) % variants.length]
      if (!downloadsFont(look.fontId)) return look
    }
    return variants[0]
  }

  test('cards rotate through each template\'s looks and name the look', async ({ page }) => {
    await page.goto('/')
    const templates = getCvTemplates('en')
    await expect(cards(page)).toHaveCount(templates.length * 2)

    for (const [index, template] of templates.entries()) {
      const variants = getTemplateVariants(template.id)
      const look = stripLook(variants, index)
      for (const copy of [0, 1]) {
        const card = cards(page).nth(index + copy * templates.length)
        await expect(card.locator('.landing-templates-card__name')).toHaveText(template.label)
        await expect(card.locator('.landing-templates-card__look')).toHaveText(look.label.en)
        // The first palette variable this look sets differently from the
        // original proves the look is really rendered, not just named.
        const name = Object.keys(look.palette)
          .find((key) => look.palette[key].toLowerCase() !== variants[0].palette[key].toLowerCase())
        if (name) {
          await expect.poll(() => paletteVar(card, name)).toBe(look.palette[name])
        }
      }
    }
  })

  test('look names follow the language', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Switch language' }).click()

    const templates = getCvTemplates('fi')
    await expect(cards(page).first().locator('.landing-templates-card__look'))
      .toHaveText(getTemplateVariants(templates[0].id)[0].label.fi)
    await expect(cards(page).nth(1).locator('.landing-templates-card__look'))
      .toHaveText(getTemplateVariants(templates[1].id)[1].label.fi)
  })

  test('the landing page downloads no font for a strip thumbnail', async ({ page }) => {
    const fontRequests = []
    page.on('request', (request) => {
      if (/carlito|lato/i.test(request.url())) fontRequests.push(request.url())
    })
    await page.goto('/')
    await page.locator('.landing-templates-wrap').scrollIntoViewIfNeeded()
    await page.waitForLoadState('networkidle')
    expect(fontRequests).toEqual([])
  })

  test('screen readers get each strip card once, not the loop copy', async ({ page }) => {
    await page.goto('/')
    const templates = getCvTemplates('en')
    await expect(cards(page)).toHaveCount(templates.length * 2)
    // The loop copy is visual only.
    await expect(page.locator('.landing-templates-card[aria-hidden="true"]')).toHaveCount(templates.length)
    const snapshot = await page.locator('.landing-templates-wrap').ariaSnapshot()
    for (const template of templates) {
      const mentions = snapshot.split('\n').filter((line) => line.trim() === `- paragraph: ${template.label}`)
      expect(mentions, template.label).toHaveLength(1)
    }
  })
})
