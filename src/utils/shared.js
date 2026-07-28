export function formatDateRange(startDate, endDate, isCurrent = false, presentLabel = 'Present') {
  const resolvedEndDate = isCurrent ? presentLabel : endDate

  return [startDate, resolvedEndDate].map((value) => value.trim()).filter(Boolean).join(' - ')
}

export function formatLinkLabel(key) {
  if (key === 'github') {
    return 'GitHub'
  }

  if (key === 'linkedin') {
    return 'LinkedIn'
  }

  return key.charAt(0).toUpperCase() + key.slice(1)
}

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/**
 * Returns `url` if it resolves to a safe protocol (http/https/mailto/tel),
 * otherwise `undefined` so callers can omit the `href` entirely. Guards
 * against `javascript:`/`data:` URIs in user-supplied link fields (project
 * and certificate URLs) being rendered as clickable anchors.
 */
export function getSafeHref(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return undefined
  }

  const trimmedUrl = url.trim()

  try {
    const parsed = new URL(trimmedUrl, window.location.href)

    return SAFE_URL_PROTOCOLS.has(parsed.protocol) ? trimmedUrl : undefined
  } catch {
    return undefined
  }
}
