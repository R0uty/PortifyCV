// Writes each content page's pre-rendered markup to dist/prerendered/
// (1.6.49), from the server build of src/prerender.jsx that `npm run build`
// makes in dist-ssr/. The edge worker serves it inside index.html's
// #seo-landing block, so a crawler that doesn't run JavaScript (AdSense's
// review, Bing, link-preview bots) reads the page's real text rather than
// a summary. Run with NODE_ENV=production, so it renders with the same
// React build visitors get.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { renderRoute } = await import(pathToFileURL(resolve(rootDir, 'dist-ssr/prerender.js')).href)
const { PATH_TO_VIEW, prerenderedPath } = await import(pathToFileURL(resolve(rootDir, 'src/utils/pageMeta.js')).href)

let count = 0
for (const { view, locale } of PATH_TO_VIEW.values()) {
  if (view === 'builder') continue
  const html = await renderRoute(view, locale)
  if (!html.includes('<h1')) {
    throw new Error(`pre-render of ${view} (${locale}) has no <h1>`)
  }
  const file = resolve(rootDir, 'dist', `.${prerenderedPath(view, locale)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  count += 1
}
console.log(`Pre-rendered ${count} pages into dist/prerendered/.`)
