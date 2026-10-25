import { prerenderToNodeStream } from 'react-dom/static'
import { Buffer } from 'node:buffer'
import App from './App.jsx'
import { VIEW_HEAD } from './utils/pageMeta'
import { TEMPLATE_EXAMPLES, loadExampleCv } from './utils/exampleCvs'

// Build-time pre-render (1.6.49): each content page's full markup, for
// crawlers that don't run JavaScript. scripts/prerender.mjs writes it to
// dist/prerendered/, and the edge worker puts it in index.html's
// #seo-landing block, which src/main.jsx removes before React renders the
// same page into #root.
// `progressiveChunkSize: Infinity` keeps every Suspense boundary (each
// page is React.lazy()) in place: React otherwise moves a large one after
// the footer behind a swap script, which this block never runs.
export async function renderRoute(view, locale) {
  // A template page opens on its first example, loaded in an effect; load
  // it now so the page renders with it (TemplateDetailPage peeks at it).
  const templateId = VIEW_HEAD[view]?.templateId
  if (templateId && TEMPLATE_EXAMPLES[templateId]?.length) {
    await loadExampleCv(TEMPLATE_EXAMPLES[templateId][0], locale)
  }
  const { prelude } = await prerenderToNodeStream(<App route={{ view, locale }} />, {
    progressiveChunkSize: Number.POSITIVE_INFINITY,
  })
  const chunks = []
  for await (const chunk of prelude) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
    // React's inline runtime scripts; the block is never hydrated.
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<link rel="(?:preload|expect)"[^>]*>/g, '')
}
