import { test, expect } from './fixtures/base.js'
import { PATH_TO_VIEW, prerenderedPath } from '../src/utils/pageMeta.js'

// 1.6.49: `npm run build` pre-renders every content page (scripts/
// prerender.mjs), and the edge worker serves that markup in index.html's
// no-JavaScript block, so a crawler that doesn't run JavaScript reads the
// page's full text. `vite preview` serves dist/ as files, so the fragments
// can be read here directly.
const fragment = async (request, view, locale) => {
  const response = await request.get(`${prerenderedPath(view, locale)}.html`)
  expect(response.ok(), `${view} (${locale})`).toBe(true)
  return response.text()
}

test('every content page in both languages is pre-rendered, with its own heading and no scripts', async ({ request }) => {
  for (const { view, locale } of PATH_TO_VIEW.values()) {
    if (view === 'builder') continue
    const html = await fragment(request, view, locale)
    expect((html.match(/<h1[\s>]/g) ?? []).length, `${view} (${locale}) <h1>`).toBe(1)
    expect(html, `${view} (${locale})`).not.toContain('<script')
    expect(html, `${view} (${locale})`).toContain('class="site-footer')
  }
})

test('a guide is pre-rendered in full, in its own language with its own links', async ({ request }) => {
  const en = await fragment(request, 'howToWrite', 'en')
  expect(en).toContain('<h1 class="legal-page__title">How to Write a CV</h1>')
  const words = en.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean)
  expect(words.length).toBeGreaterThan(1200)

  const fi = await fragment(request, 'howToWrite', 'fi')
  expect(fi).toContain('Näin kirjoitat CV:n</h1>')
  expect(fi).toContain('href="/fi/ats-ystavallinen-cv"')
  expect(fi).not.toContain('href="/ats-friendly-cv-guide"')
})

// 1.6.54: a template page is pre-rendered with its example CV, not an
// empty preview frame, so its text reaches crawlers that don't run JS.
test('a template page is pre-rendered with its own example CV', async ({ request }) => {
  const developer = await fragment(request, 'template:developer', 'en')
  expect(developer).toContain('Frontend Developer')
  expect(developer).not.toContain('template-page__preview-placeholder')

  const european = await fragment(request, 'template:european', 'fi')
  expect(european).toContain('scaled-preview')
  expect(european).not.toContain('template-page__preview-placeholder')
})
