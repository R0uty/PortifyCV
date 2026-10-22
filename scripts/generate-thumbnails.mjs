// Pre-renders every template × look × locale thumbnail into
// public/thumbnails/<template>/<look>-<locale>.webp (1.6.30), the front
// page's product shot of the builder (Direct Edit with a section popup
// open) into public/thumbnails/product/direct-edit-<locale>.webp (1.6.32),
// each template page's 1200 × 630 share image into
// public/thumbnails/og/<template>-<locale>.jpg (1.6.47), plus
// public/thumbnails/manifest.json recording what they were made from.
// Run after changing a template's code or styles; check:thumbnails fails
// until you do:
//
//   npm run thumbnails
//
// Starts its own Vite dev server for scripts/thumbnails/harness.html,
// which renders the same live TemplateThumbnail the site used before, and
// screenshots each one with Playwright's Chromium (`npx playwright install
// chromium` once).
import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { computeThumbnailInputsHash } from './thumbnails/inputs.mjs'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(rootDir, 'public/thumbnails')
const { THUMBNAIL_CSS_WIDTH, THUMBNAIL_PIXEL_RATIO, thumbnailImagePath, walkthroughImagePath } = await import('../src/utils/thumbnailImages.js')
const WEBP_QUALITY = 0.82
// The product shot: a 1280 × 800 builder window at 2x, saved at 1280 × 800.
const PRODUCT_VIEWPORT = { width: 1280, height: 800 }

// Chromium encodes WebP and JPEG itself, so this needs no image library.
// `scale` shrinks the screenshot first (the product shot is captured at 2x);
// `size` resizes it to exact pixel dimensions instead.
async function saveWebp(page, png, relPath, scale = 1, type = 'image/webp', size = null) {
  const webpBase64 = await page.evaluate(async ({ pngBase64, quality, scale, type, size }) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${pngBase64}`)).blob())
    const width = size ? size.width : Math.round(bitmap.width * scale)
    const height = size ? size.height : Math.round(bitmap.height * scale)
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d')
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await canvas.convertToBlob({ type, quality })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }, { pngBase64: png.toString('base64'), quality: WEBP_QUALITY, scale, type, size })

  const outPath = resolve(rootDir, 'public', relPath)
  const buffer = Buffer.from(webpBase64, 'base64')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buffer)
  files[relPath.replace(/^thumbnails\//, '')] = createHash('sha256').update(buffer).digest('hex')
}

// The builder in Direct Edit with the demo CV and the summary's popup
// open, as a first-time visitor sees it on a laptop.
async function captureProductShot(locale) {
  const context = await browser.newContext({ viewport: PRODUCT_VIEWPORT, deviceScaleFactor: 2 })
  await context.addInitScript((lang) => {
    localStorage.setItem('ui-locale', lang)
    localStorage.setItem('portifycv-onboarding-seen', 'true')
    localStorage.setItem('portifycv-nav-rail-collapsed', 'true')
    localStorage.setItem('portifycv-builder-mode', 'direct')
  }, locale)
  const page = await context.newPage()
  await page.goto(`${baseUrl}/cv?template=modern`)
  await page.waitForLoadState('networkidle')
  await page.locator('.direct-edit-actions button', { hasText: /^(Load demo CV|Lataa demo-CV)$/ }).click()
  // Its "Demo CV loaded" message must be gone before the shot.
  await page.getByText(/^(Demo CV loaded|Demo-CV ladattu)\.$/).waitFor({ state: 'detached', timeout: 15_000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.direct-edit-preview [data-export-section="about"]').first().hover()
  await page.locator('[data-direct-edit-pencil="about"]').click()
  await page.locator('.direct-edit-popup').waitFor()
  await page.mouse.move(4, PRODUCT_VIEWPORT.height - 4)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  const png = await page.screenshot({ type: 'png', animations: 'disabled' })
  await saveWebp(page, png, `thumbnails/product/direct-edit-${locale}.webp`, 0.5)
  await context.close()
}

// The builder walkthrough's screenshots (1.6.50), one per step of "How
// to use the builder" (three of them also on the front page's "How it
// works"): the real builder with the demo CV, cropped to the part the step
// is about, at 16:10 and saved 960 × 600.
const WALKTHROUGH_SIZE = { width: 960, height: 600 }
const WALKTHROUGH_TEXT = {
  en: {
    loadDemo: 'Load demo CV', demoLoaded: 'Demo CV loaded.', classic: 'Classic', 
    weakBullet: 'Responsible for the design system',
    jobDescription: 'Senior Product Designer. Figma, design systems, user research, accessibility, prototyping, A/B testing, stakeholder management, SQL.',
    template: /^Select template/, export: 'Export', settings: 'Settings', restore: 'Restore last session', achievement: 'Achievement 2',
    bulletTip: 'Strengthen the wording in role 1', jobDescriptionLabel: 'Job description', keywordHeading: 'Job description keyword match', missingKeywords: 'Missing keywords',
  },
  fi: {
    loadDemo: 'Lataa demo-CV', demoLoaded: 'Demo-CV ladattu.', classic: 'Klassinen', 
    // The demo CV is in English in both languages, and so are the weak
    // phrases the builder flags.
    weakBullet: 'Responsible for the design system',
    jobDescription: 'Senior Product Designer. Figma, design systems, user research, accessibility, prototyping, A/B testing, stakeholder management, SQL.',
    template: /^Valitse pohja/, export: 'Vie', settings: 'Asetukset', restore: 'Palauta viimeisin istunto', achievement: 'Saavutus 2',
    bulletTip: 'Vahvista sanamuotoa roolissa 1', jobDescriptionLabel: 'Työpaikkailmoituksen kuvaus', keywordHeading: 'Työpaikkailmoituksen avainsanat', missingKeywords: 'Puuttuvat avainsanat',
  },
}

// The smallest 16:10 box around `boxes` plus `pad`, kept inside the window
// and above `bottomLimit` (the builder's fixed footer bar).
function walkthroughClip(boxes, bottomLimit, pad = 24) {
  const left = Math.min(...boxes.map((b) => b.x)) - pad
  const top = Math.min(...boxes.map((b) => b.y)) - pad
  const right = Math.max(...boxes.map((b) => b.x + b.width)) + pad
  const bottom = Math.max(...boxes.map((b) => b.y + b.height)) + pad
  let width = right - left
  let height = bottom - top
  const ratio = WALKTHROUGH_SIZE.width / WALKTHROUGH_SIZE.height
  if (width / height < ratio) width = height * ratio
  else height = width / ratio
  width = Math.min(width, PRODUCT_VIEWPORT.width)
  height = Math.min(height, bottomLimit)
  const cx = (left + right) / 2
  const cy = (top + bottom) / 2
  const x = Math.max(0, Math.min(cx - width / 2, PRODUCT_VIEWPORT.width - width))
  const y = Math.max(0, Math.min(cy - height / 2, bottomLimit - height))
  return { x, y, width, height }
}

async function captureWalkthrough(locale) {
  const text = WALKTHROUGH_TEXT[locale]
  const open = async (mode) => {
    const context = await browser.newContext({ viewport: PRODUCT_VIEWPORT, deviceScaleFactor: 2 })
    await context.addInitScript(({ lang, builderMode }) => {
      localStorage.setItem('ui-locale', lang)
      localStorage.setItem('portifycv-onboarding-seen', 'true')
      localStorage.setItem('portifycv-builder-mode', builderMode)
    }, { lang: locale, builderMode: mode })
    const page = await context.newPage()
    await page.goto(`${baseUrl}/cv?template=modern`)
    await page.waitForLoadState('networkidle')
    await page.locator('button', { hasText: new RegExp(`^${text.loadDemo}$`) }).first().click()
    await page.getByText(text.demoLoaded, { exact: true }).waitFor({ state: 'detached', timeout: 15_000 })
    await page.evaluate(() => window.scrollTo(0, 0))
    return page
  }
  // Scrolls `locator` to just below the builder's top bar, in whichever
  // pane scrolls it.
  const bringToTop = (locator) => locator.evaluate((el) => {
    let pane = el.parentElement
    while (pane && !(pane.scrollHeight > pane.clientHeight && /auto|scroll/.test(getComputedStyle(pane).overflowY))) {
      pane = pane.parentElement
    }
    const offset = el.getBoundingClientRect().top - 140
    if (pane) pane.scrollTop += offset
    else window.scrollBy(0, offset)
  })
  const shoot = async (page, step, boxes) => {
    await page.mouse.move(4, PRODUCT_VIEWPORT.height - 4)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    const footerTop = await page.evaluate(() => {
      const footer = document.querySelector('footer.site-footer')
      return footer ? footer.getBoundingClientRect().top : null
    })
    const bottomLimit = footerTop > 0 ? Math.min(footerTop, PRODUCT_VIEWPORT.height) : PRODUCT_VIEWPORT.height
    const clip = boxes
      ? walkthroughClip(await Promise.all(boxes.map((l) => l.boundingBox())), bottomLimit)
      : { x: 0, y: 0, ...PRODUCT_VIEWPORT }
    const png = await page.screenshot({ type: 'png', animations: 'disabled', clip })
    await saveWebp(page, png, walkthroughImagePath(step, locale), 1, 'image/webp', WALKTHROUGH_SIZE)
  }

  // 1. Direct Edit: the summary outlined with its pencil, its popup open.
  let page = await open('direct')
  const about = page.locator('.direct-edit-preview [data-export-section="about"]').first()
  await about.hover()
  await page.locator('[data-direct-edit-pencil="about"]').click()
  await page.locator('.direct-edit-popup').waitFor()
  await shoot(page, 'edit', [about, page.locator('.direct-edit-popup')])
  await page.context().close()

  // 2-7 in Classic.
  page = await open('classic')
  await shoot(page, 'sections', null)

  // The first role's last bullet, rewritten weak, and the tip it gets.
  const bullet = page.getByRole('textbox', { name: text.achievement }).first()
  await bullet.fill(text.weakBullet)
  await bullet.evaluate((el) => el.blur())
  const tips = page.getByText(text.bulletTip).filter({ visible: true }).first()
  await tips.waitFor()
  await bringToTop(bullet)
  await shoot(page, 'bullets', [bullet, tips.locator('xpath=..')])

  await page.getByRole('banner').getByRole('button', { name: text.template }).click()
  const gallery = page.getByRole('dialog').first()
  await gallery.waitFor()
  await page.waitForTimeout(800)
  await shoot(page, 'template', [gallery])
  await page.keyboard.press('Escape')

  // The ATS panel with a job posting pasted in: coverage and missing
  // keywords.
  await page.evaluate(() => window.scrollTo(0, 0))
  const atsPanel = page.locator('details.editor-tools', { has: page.locator('.editor-tools__stat') })
  await atsPanel.locator('summary').click()
  const jobDescription = atsPanel.getByRole('textbox', { name: text.jobDescriptionLabel })
  await jobDescription.fill(text.jobDescription)
  await jobDescription.evaluate((el) => el.blur())
  const keywordHeading = atsPanel.getByText(text.keywordHeading, { exact: true })
  const missing = atsPanel.locator('div', { has: page.getByText(text.missingKeywords, { exact: true }) }).last()
  await bringToTop(keywordHeading)
  await shoot(page, 'ats', [keywordHeading, missing])

  await page.evaluate(() => window.scrollTo(0, 0))
  const exportButton = page.getByRole('banner').getByRole('button', { name: text.export, exact: true })
  await exportButton.click()
  await shoot(page, 'export', [exportButton, page.getByRole('menu').first()])
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: text.settings, exact: true }).first().click()
  const settings = page.getByRole('dialog', { name: text.settings })
  await settings.waitFor()
  await settings.locator('.settings-row', { hasText: text.restore }).locator('.toggle-switch').click()
  await shoot(page, 'restore', [settings])
  await page.context().close()
}

// Each template page's share image (1.6.47): the og.js cards, which embed
// the thumbnails just written, so this runs after them.
async function captureShareImages() {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(`${baseUrl}/scripts/thumbnails/og.html`)
  await page.waitForFunction(() => window.__ogReady === true, null, { timeout: 60_000 })
  const cards = await page.locator('[data-og]').all()
  for (const card of cards) {
    const [templateId, locale] = (await card.getAttribute('data-og')).split('/')
    await card.scrollIntoViewIfNeeded()
    const png = await card.screenshot({ type: 'png', animations: 'disabled' })
    await saveWebp(page, png, `thumbnails/og/${templateId}-${locale}.jpg`, 1, 'image/jpeg')
  }
  console.log(`${cards.length} share images`)
  await page.close()
}

const server = await createServer({ root: rootDir, logLevel: 'error', server: { port: 0 } })
await server.listen()
const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await chromium.launch()
const files = {}

try {
  rmSync(outDir, { recursive: true, force: true })
  for (const locale of ['en', 'fi']) {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: THUMBNAIL_PIXEL_RATIO,
    })
    await page.goto(`${baseUrl}/scripts/thumbnails/harness.html?locale=${locale}`)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => window.__thumbnailsReady === true, null, { timeout: 60_000 })
    await page.evaluate(() => document.fonts.ready)

    const cells = await page.locator('[data-thumb]').all()
    for (const cell of cells) {
      const [templateId, variantId] = (await cell.getAttribute('data-thumb')).split('/')
      const frame = cell.locator('.template-gallery__thumb-frame')
      await frame.scrollIntoViewIfNeeded()
      const png = await frame.screenshot({ type: 'png', animations: 'disabled' })
      await saveWebp(page, png, thumbnailImagePath(templateId, variantId, locale))
    }
    console.log(`${locale}: ${cells.length} thumbnails`)
    await page.close()
    await captureProductShot(locale)
    console.log(`${locale}: product shot`)
    await captureWalkthrough(locale)
    console.log(`${locale}: walkthrough`)
  }
  await captureShareImages()

  const manifest = {
    note: 'Generated by `npm run thumbnails`; checked by `npm run check:thumbnails`. Do not edit by hand.',
    cssWidth: THUMBNAIL_CSS_WIDTH,
    pixelRatio: THUMBNAIL_PIXEL_RATIO,
    inputsHash: computeThumbnailInputsHash(rootDir),
    files: Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b))),
  }
  writeFileSync(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  const totalKb = Math.round(Object.keys(files).length)
  console.log(`Wrote ${totalKb} images and manifest.json to public/thumbnails/`)
} finally {
  await browser.close()
  await server.close()
}
