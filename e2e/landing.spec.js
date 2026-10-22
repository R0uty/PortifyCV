import { test, expect } from './fixtures/base.js'
import { getTemplateVariants } from '../src/utils/templateVariants.js'
import { getCvTemplates } from '../src/utils/cvTemplates.js'
import { filterTemplatesByField } from '../src/utils/templateFields.js'

test.describe('Landing page', () => {
  test('shows the hero, a picture of the output, and the trust line', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Free CV builder. Build it, take it, done.' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'The PortifyCV editor: a CV with its About section open for editing beside it.' })).toBeVisible()
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

  // 1.6.32: the hero shows the builder itself (Direct Edit, a popup open),
  // pre-rendered by `npm run thumbnails`, in the visitor's language; and
  // its facts as chips.
  test('the hero shows the editor screenshot and the facts as chips', async ({ page }) => {
    await page.goto('/')
    const shot = page.locator('.landing-product-shot img')
    await expect(shot).toHaveAttribute('src', '/thumbnails/product/direct-edit-en.webp')
    await expect.poll(() => shot.evaluate((img) => img.complete && img.naturalWidth)).toBe(1280)
    await expect(page.getByRole('list', { name: 'Included' }).getByRole('listitem')).toHaveCount(4)

    await page.getByRole('button', { name: 'Switch language' }).click()
    await expect(shot).toHaveAttribute('src', '/thumbnails/product/direct-edit-fi.webp')
  })
})

// 1.6.33: the front page's templates section is the templates page's field
// chips over up to six pre-rendered thumbnails (card n shows look n mod 3),
// each a link to its template page; "Browse all" keeps the field.
test.describe('Landing templates by field', () => {
  const cards = (page) => page.locator('.landing-templates__card')

  test('shows six templates, each in a look, linking to its template page', async ({ page }) => {
    await page.goto('/')
    const templates = getCvTemplates('en')
    await expect(cards(page)).toHaveCount(6)
    for (const [index, template] of templates.slice(0, 6).entries()) {
      const variants = getTemplateVariants(template.id)
      const look = variants[index % variants.length]
      const card = cards(page).nth(index)
      await expect(card.locator('.landing-templates__name')).toHaveText(template.label)
      await expect(card.locator('.landing-templates__look')).toHaveText(look.label.en)
      await expect(card.locator('img')).toHaveAttribute('src', `/thumbnails/${template.id}/${look.id}-en.webp`)
      await expect(card).toHaveAttribute('href', `/free-cv-templates/${template.slug}${look.id === 'default' ? '' : `?style=${look.id}`}`)
    }
  })

  test('a field chip filters the cards and Browse all keeps the field', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('.landing-templates')
    await section.getByRole('radiogroup', { name: 'Field', exact: true }).getByRole('radio', { name: 'Creative', exact: true }).check()
    const creative = filterTemplatesByField(getCvTemplates('en'), 'creative')
    await expect(cards(page)).toHaveCount(Math.min(6, creative.length))
    await expect(cards(page).first().locator('.landing-templates__name')).toHaveText(creative[0].label)

    const browse = section.getByRole('link', { name: `Browse all ${getCvTemplates('en').length} templates` })
    await expect(browse).toHaveAttribute('href', '/free-cv-templates?field=creative')
    await browse.click()
    await expect(page).toHaveURL(/\/free-cv-templates\?field=creative$/)
  })

  test('looks and images follow the language', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Switch language' }).click()
    const templates = getCvTemplates('fi')
    const look = getTemplateVariants(templates[1].id)[1]
    await expect(cards(page).nth(1).locator('.landing-templates__look')).toHaveText(look.label.fi)
    await expect(cards(page).nth(1).locator('img')).toHaveAttribute('src', `/thumbnails/${templates[1].id}/${look.id}-fi.webp`)
  })

  test('the landing page downloads no CV font', async ({ page }) => {
    const fontRequests = []
    page.on('request', (request) => {
      if (/carlito|lato/i.test(request.url())) fontRequests.push(request.url())
    })
    await page.goto('/')
    await page.locator('.landing-templates').scrollIntoViewIfNeeded()
    await page.waitForLoadState('networkidle')
    expect(fontRequests).toEqual([])
  })
})

test('How it works shows three steps and links the full walkthrough', async ({ page }) => {
  await page.goto('/')
  const steps = page.locator('.landing-step')
  await expect(steps).toHaveCount(3)
  await expect(steps.locator('h3')).toHaveText(['Pick a template', 'Edit right on the CV', 'Export or share'])
  await page.getByRole('link', { name: 'Read the full walkthrough' }).click()
  await expect(page).toHaveURL(/\/how-to-use-the-cv-builder$/)
})

// 1.6.50: the walkthrough shows screenshots of the real builder (until then
// line drawings), in the page's language.

// Each image's path, once all `count` of them have loaded (they're lazy,
// so they are scrolled into view first).
async function loadedImages(locator, count) {
  await expect(locator).toHaveCount(count)
  for (const image of await locator.all()) {
    await image.scrollIntoViewIfNeeded()
  }
  await expect.poll(() => locator.evaluateAll((images) => images.every((image) => image.naturalWidth === 960 && image.naturalHeight === 600))).toBe(true)
  return locator.evaluateAll((images) => images.map((image) => new URL(image.currentSrc).pathname))
}

test('How it works and the builder guide show screenshots of the builder, in the page language', async ({ page }) => {
  await page.goto('/')
  const landingShots = await loadedImages(page.locator('.landing-step img'), 3)
  expect(landingShots).toEqual(
    ['template', 'edit', 'export'].map((step) => `/thumbnails/walkthrough/${step}-en.webp`),
  )
  await expect(page.getByRole('img', { name: /^The template gallery:/ })).toBeAttached()

  await page.goto('/fi/cv-editorin-kayttoopas')
  const guideShots = await loadedImages(page.locator('.builder-walkthrough__figure img'), 7)
  expect(guideShots).toEqual(
    ['edit', 'sections', 'bullets', 'template', 'ats', 'export', 'restore'].map((step) => `/thumbnails/walkthrough/${step}-fi.webp`),
  )
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
    // Scroll only once the page has rendered: React can commit after the
    // load event, and a scroll before that has nothing to scroll.
    await expect(page.locator('.landing-hero__actions')).toBeVisible()
    await expect(page.locator('.landing-templates__card').first()).toBeAttached()
    await page.evaluate(() => window.scrollTo(0, 1500))
    const bar = page.locator('.landing-sticky-cta')
    await expect(bar).toBeVisible()
    await bar.getByRole('button', { name: 'Start building' }).click()
    await expect(page).toHaveURL(/\/cv/)
  })
})

// 1.6.34: the FAQ is an accordion of short answers, the same text as
// index.html's FAQPage JSON-LD (check:template-pages compares them).
test('the FAQ opens one answer at a time and links to the guide behind it', async ({ page }) => {
  await page.goto('/')
  const items = page.locator('#faq details')
  await expect(items).toHaveCount(7)
  const ats = items.filter({ hasText: 'Will my CV pass applicant tracking systems (ATS)?' })
  await expect(ats.locator('.landing-faq__answer')).toBeHidden()
  await ats.locator('summary').click()
  await expect(ats).toHaveAttribute('open', '')
  await ats.getByRole('link', { name: 'ATS-friendly CV guide' }).click()
  await expect(page).toHaveURL(/\/ats-friendly-cv-guide$/)
})
