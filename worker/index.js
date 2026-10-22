// Edge-side HTML rewriting in front of the static assets bundle.
//
// PortifyCV is a client-rendered SPA (see src/App.jsx's useDocumentHead) —
// title/canonical/description/OG/Article-schema are only ever correct once
// React has mounted and patched the DOM. Any crawler or unfurl bot that
// doesn't execute JS (Bing, LinkedIn, Slack, Discord, ...) was previously
// served the landing page's metadata for every single route, because
// wrangler.jsonc's SPA fallback returns the same dist/index.html, unedited,
// for every path. This worker intercepts each request first and:
//   1. passes real static files straight through untouched,
//   2. rewrites the shared index.html shell with the requested route's own
//      title/canonical/description/OG/Article-schema before it leaves the
//      edge, so the *first* response for /cv or /privacy already carries
//      that page's metadata, not the homepage's,
//   3. redirects case/trailing-slash duplicates (/CV, /cv/) to the one
//      canonical URL instead of serving the same content twice, and
//   4. returns a real 404 (with noindex) for paths that aren't a known
//      route, instead of the soft-404 the SPA fallback produced (200,
//      indexable, homepage content, for literally any typo'd URL).
import { VIEW_HEAD, SITE_ORIGIN, buildViewSchema, localizedHead, PATH_TO_VIEW, prerenderedPath } from '../src/utils/pageMeta.js'
import { LANDING_FAQ, faqAnswerText } from '../src/utils/landingFaq.js'
import { ADSENSE_SCRIPT } from './adsense.js'

// The Finnish front page's FAQPage JSON-LD (1.6.35): index.html carries
// the English one, which must match the visible FAQ, so /fi gets its own.
const FAQ_SCHEMA_FI = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: LANDING_FAQ.fi.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(item) },
  })),
})


const escapeHtml = (text) => String(text)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// The no-JavaScript body for one route (1.6.46, audit item O4). index.html's
// #seo-landing block is the English front page's copy, which every other
// route used to serve too, so a crawler or link-preview bot that doesn't run
// JS read landing copy on /how-to-write-a-cv or /fi/tietoa. Every route but
// the English front page now gets its own heading and description, links to
// the main pages in its language, and on /fi the Finnish FAQ. React removes
// the block on load (src/main.jsx), so visitors never see it. Since 1.6.49
// the block holds the page's full pre-rendered markup instead; this is the
// fallback when a build has none.
const FALLBACK_LINKS = ['landing', 'freeTemplates', 'howToWrite', 'atsGuide', 'cvExamples', 'coverLetterExamples']

export function fallbackBody(view, head) {
  const heading = head.title.replace(/^PortifyCV - /, '').replace(/ - PortifyCV$/, '')
  const links = FALLBACK_LINKS
    .filter((linkView) => linkView !== view)
    .map((linkView) => {
      const linkHead = localizedHead(VIEW_HEAD[linkView], head.locale)
      return `<li><a href="${linkHead.path}">${escapeHtml(linkHead.title.replace(/ - PortifyCV$/, ''))}</a></li>`
    })
    .join('')
  const faq = view === 'landing' && head.locale === 'fi'
    ? `<section><h2>Usein kysytyt kysymykset</h2>${LANDING_FAQ.fi
      .map((item) => `<p><strong>${escapeHtml(item.q)}</strong> ${escapeHtml(faqAnswerText(item))}</p>`)
      .join('')}</section>`
    : ''
  return `<h1>${escapeHtml(heading)}</h1><p>${escapeHtml(head.description)}</p>${faq}<nav><ul>${links}</ul></nav>`
}

class SetInnerHtml {
  constructor(html) {
    this.html = html
  }

  element(el) {
    el.setInnerContent(this.html, { html: true })
  }
}

// Hashed JS/CSS bundles, images, fonts, robots.txt, sitemap.xml, etc. — any
// request that isn't asking for an HTML page. These never need rewriting or
// route matching, so they skip straight to the assets binding.
const ASSET_EXTENSION_RE = /\.[a-zA-Z0-9]+$/

class SetText {
  constructor(value) {
    this.value = value
  }

  element(el) {
    el.setInnerContent(this.value)
  }
}

class SetAttr {
  constructor(name, value) {
    this.name = name
    this.value = value
  }

  element(el) {
    el.setAttribute(this.name, this.value)
  }
}

class RemoveElement {
  element(el) {
    el.remove()
  }
}

class AppendToHead {
  constructor(html) {
    this.html = html
  }

  element(el) {
    el.append(this.html, { html: true })
  }
}

// FAQPage schema only matches visible content on the landing route (see
// src/pages/LandingPage.jsx's FAQ section) — every other route had it too,
// which is structured data that doesn't describe the page it's on.
// `locale` is the address's language (1.6.35): /fi/… pages get Finnish
// metadata, <html lang="fi">, and hreflang links to their English twin.
// `body` is the page's pre-rendered markup (1.6.49, scripts/prerender.mjs),
// or null when there's none, as in `wrangler dev` before a full build.
function rewriteForRoute(response, view, locale, body) {
  const head = localizedHead(VIEW_HEAD[view], locale)
  const canonicalUrl = `${SITE_ORIGIN}${head.path}`
  const rewriter = new HTMLRewriter()
    .on('html', new SetAttr('lang', head.locale))
    .on('meta[property="og:locale"]', new SetAttr('content', head.locale === 'fi' ? 'fi_FI' : 'en_US'))
    .on('title', new SetText(head.title))
    .on('link[rel="canonical"]', new SetAttr('href', canonicalUrl))
    .on('meta[name="description"]', new SetAttr('content', head.description))
    .on('meta[property="og:url"]', new SetAttr('content', canonicalUrl))
    .on('meta[property="og:title"]', new SetAttr('content', head.title))
    .on('meta[property="og:description"]', new SetAttr('content', head.description))
    .on('meta[name="twitter:title"]', new SetAttr('content', head.title))
    .on('meta[name="twitter:description"]', new SetAttr('content', head.description))
    .on('meta[property="og:image"]', new SetAttr('content', `${SITE_ORIGIN}${head.ogImage}`))
    .on('meta[name="twitter:image"]', new SetAttr('content', `${SITE_ORIGIN}${head.ogImage}`))

  if (view !== 'landing') {
    rewriter.on('#ld-faq', new RemoveElement())
  } else if (head.locale === 'fi') {
    rewriter.on('#ld-faq', new SetInnerHtml(FAQ_SCHEMA_FI))
  }

  if (body) {
    rewriter.on('#seo-landing', new SetInnerHtml(body))
  } else if (!(view === 'landing' && head.locale === 'en')) {
    rewriter.on('#seo-landing', new SetInnerHtml(fallbackBody(view, head)))
  }

  // No ads in the builder (1.6.48): it's an app screen, where AdSense
  // doesn't allow them and where Auto ads would sit among its buttons.
  if (view === 'builder') {
    rewriter.on(ADSENSE_SCRIPT, new RemoveElement())
  }

  if (head.alternates) {
    const { en, fi } = head.alternates
    rewriter.on('head', new AppendToHead([
      `<link rel="alternate" hreflang="en" href="${SITE_ORIGIN}${en}">`,
      `<link rel="alternate" hreflang="fi" href="${SITE_ORIGIN}${fi}">`,
      `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${en}">`,
    ].join('')))
  }

  const schema = buildViewSchema(head)
  if (schema) {
    rewriter.on(
      'head',
      new AppendToHead(`<script type="application/ld+json" id="view-structured-data">${JSON.stringify(schema)}</script>`),
    )
  }

  return rewriter.transform(response)
}

// The builder has no pre-render: it's an app, with nothing to read.
async function prerenderedBody(env, request, route) {
  if (route.view === 'builder') return null
  const response = await env.ASSETS.fetch(new Request(new URL(prerenderedPath(route.view, route.locale), request.url)))
  return response.ok ? response.text() : null
}

function normalizePath(pathname) {
  const trimmed = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return trimmed.toLowerCase()
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { pathname } = url

    if (pathname.startsWith('/assets/') || ASSET_EXTENSION_RE.test(pathname)) {
      return env.ASSETS.fetch(request)
    }

    const normalized = normalizePath(pathname)
    const route = PATH_TO_VIEW.get(normalized)

    if (route && normalized !== pathname) {
      const redirectUrl = new URL(request.url)
      redirectUrl.pathname = normalized
      return Response.redirect(redirectUrl.toString(), 301)
    }

    if (route) {
      // Cloudflare's asset server redirects an explicit "/index.html"
      // request to "/" (treats it as the implicit directory file), so
      // fetch "/" itself to get the shell's raw bytes rather than following
      // a redirect for every route.
      const assetResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request))
      return rewriteForRoute(assetResponse, route.view, route.locale ?? 'en', await prerenderedBody(env, request, route))
    }

    // Not a real file and not a known route — a genuinely missing page.
    // Real 404 status + noindex, rather than the SPA fallback's 200 with
    // homepage content for any junk URL a crawler happens to find. Fetch
    // "/404", not "/404.html": like "/index.html" above, the asset server
    // answers "/404.html" with a 307 to "/404", and wrapping that empty
    // redirect served a blank page with a stray Location header (1.6.17,
    // docs/audit-1.6.16.md finding 1).
    const notFoundResponse = await env.ASSETS.fetch(new Request(new URL('/404', request.url), request))
    const rewritten = new HTMLRewriter()
      .on('title', new SetText('Page Not Found - PortifyCV'))
      .on('meta[name="robots"]', new SetAttr('content', 'noindex, follow'))
      .on('link[rel="canonical"]', new RemoveElement())
      .on('#ld-faq', new RemoveElement())
      // No ads on an error page: AdSense doesn't allow them there (1.6.48).
      .on(ADSENSE_SCRIPT, new RemoveElement())
      .transform(notFoundResponse)

    return new Response(rewritten.body, {
      status: 404,
      statusText: 'Not Found',
      headers: rewritten.headers,
    })
  },
}
