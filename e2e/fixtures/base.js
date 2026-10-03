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
      await page.route(pattern, (route) => route.abort())
    }
    await runWithPage(page)
  },
})

export { expect }
