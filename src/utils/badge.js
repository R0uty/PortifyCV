export const PORTIFYCV_SITE_URL = 'https://portifycv.app'

/**
 * A self-contained, inline-styled HTML snippet ("made with PortifyCV" badge)
 * meant to be pasted onto an arbitrary external site (a portfolio, a blog),
 * so it can't depend on this app's own CSS classes — every style has to
 * travel with the markup. Text-only, deliberately: the app's only logo asset
 * is a 512x512 raster PNG (no SVG in the repo), so referencing it would mean
 * either a network request out to portifycv.app on every page load of
 * whoever embeds this, or bloating the snippet with a large base64 blob —
 * both worse than just not including a mark.
 * @param {'en' | 'fi'} [locale]
 * @returns {string}
 */
export function buildPortifyCvBadgeSnippet(locale = 'en') {
  const label = locale === 'fi' ? 'Tehty PortifyCV:llä' : 'Made with PortifyCV'

  return `<a href="${PORTIFYCV_SITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 12px;background:#111111;color:#ffffff;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">${label}</a>`
}
