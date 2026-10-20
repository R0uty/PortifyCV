import { test, expect } from './fixtures/base.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { getCvTemplates } from '../src/utils/cvTemplates.js'

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

    const imageOf = (modifier) => page.locator(`.landing-preview__thumb--${modifier} img`)
    await expect(imageOf('front')).toHaveAttribute('src', '/thumbnails/minimal/default-en.webp')
    await expect(imageOf('back-left')).toHaveAttribute('src', '/thumbnails/creative/default-en.webp')
    await expect(imageOf('back-right')).toHaveAttribute('src', '/thumbnails/developer/default-en.webp')
    // Pre-rendered images, not live CVs (1.6.30): every one actually loads.
    for (const modifier of ['front', 'back-left', 'back-right']) {
      await expect.poll(() => imageOf(modifier).evaluate((img) => img.complete && img.naturalWidth)).toBeGreaterThan(0)
    }
  })
})

test.describe('Landing templates strip looks', () => {
  // Card n (gallery order) shows its template's look n mod 3, named under
  // the template name; the loop copy repeats the same looks. Each card is
  // that look's pre-rendered image (1.6.30).
  const cards = (page) => page.locator('.landing-templates-card')
  const stripLook = (variants, index) => variants[index % variants.length]

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
        await expect(card.locator('img')).toHaveAttribute('src', `/thumbnails/${template.id}/${look.id}-en.webp`)
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
    // Finnish section titles in the image too.
    await expect(cards(page).nth(1).locator('img'))
      .toHaveAttribute('src', `/thumbnails/${templates[1].id}/${getTemplateVariants(templates[1].id)[1].id}-fi.webp`)
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

// 1.6.28: on a phone the hero's "Start building" sat at 732px of an 812px
// screen, under the sticky footer bar. It must be on the first screen and
// actually clickable there; once it scrolls away, a sticky bar offers it.
test.describe('Landing page on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('"Start building" is on the first screen and not covered', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('.landing-hero__actions .landing-cta')
    await expect(cta).toBeVisible()
    const box = await cta.boundingBox()
    expect(box.y + box.height).toBeLessThanOrEqual(812)
    const topElementIsCta = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2))
    })
    expect(topElementIsCta).toBe(true)
    await expect(page.locator('.landing-sticky-cta')).toBeHidden()
  })

  test('a sticky "Start building" bar appears once the hero buttons scroll away', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, 1500))
    const bar = page.locator('.landing-sticky-cta')
    await expect(bar).toBeVisible()
    await bar.getByRole('button', { name: 'Start building' }).click()
    await expect(page).toHaveURL(/\/cv/)
  })
})
