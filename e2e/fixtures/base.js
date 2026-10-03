import { test as base, expect } from '@playwright/test'

// M-6 (Phase 2 template-polish final fix wave): index.html's AdSense
// snippet (see CLAUDE.md's "AdSense integration" note) makes real network
// requests to ad-serving domains from every page the suite visits. Those
// requests are slow and unreliable in CI/sandboxed networks, and the ads
// script itself does DOM work on load — neither of which this suite's
// tests have any reason to depend on, since none of them assert on ads.
// Aborting these requests at the browser-context level, once, here, avoids
// that timing dependence for every spec that imports `test` from this file
// instead of '@playwright/test' directly.
const AD_URL_PATTERNS = ['**/*googlesyndication*', '**/*doubleclick*', '**/*adsbygoogle*']

export const test = base.extend({
  // Named `runWithPage`, not Playwright's usual `use`, purely to dodge
  // eslint-plugin-react-hooks: it treats any identifier starting with
  // "use" as a React hook call regardless of context, which misfires here
  // since this is a Playwright fixture, not a React component.
  page: async ({ page }, runWithPage) => {
    for (const pattern of AD_URL_PATTERNS) {
      // 'blockedbyclient' makes the browser log the request's console
      // error as "net::ERR_BLOCKED_BY_CLIENT" — the exact string
      // template-pages.spec.js's "renders without console errors" test
      // already filters out as an expected AdSense side effect. The
      // default abort reason logs a generic "net::ERR_FAILED" instead,
      // which that filter doesn't recognize and would fail the test.
      await page.route(pattern, (route) => route.abort('blockedbyclient'))
    }
    await runWithPage(page)
  },
})

export { expect }
