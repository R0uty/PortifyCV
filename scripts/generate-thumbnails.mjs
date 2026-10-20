// Pre-renders every template × look × locale thumbnail into
// public/thumbnails/<template>/<look>-<locale>.webp (1.6.30), the front
// page's product shot of the builder (Direct Edit with a section popup
// open) into public/thumbnails/product/direct-edit-<locale>.webp (1.6.32),
// plus public/thumbnails/manifest.json recording what they were made from.
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
const { THUMBNAIL_CSS_WIDTH, THUMBNAIL_PIXEL_RATIO, thumbnailImagePath } = await import('../src/utils/thumbnailImages.js')
const WEBP_QUALITY = 0.82
// The product shot: a 1280 × 800 builder window at 2x, saved at 1280 × 800.
const PRODUCT_VIEWPORT = { width: 1280, height: 800 }

// Chromium encodes WebP itself, so this needs no image library. `scale`
// shrinks the screenshot first (the product shot is captured at 2x).
async function saveWebp(page, png, relPath, scale = 1) {
  const webpBase64 = await page.evaluate(async ({ pngBase64, quality, scale }) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${pngBase64}`)).blob())
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d')
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await canvas.convertToBlob({ type: 'image/webp', quality })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  }, { pngBase64: png.toString('base64'), quality: WEBP_QUALITY, scale })

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
  }

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
