import { useMemo, useSyncExternalStore } from 'react'

import { readCvStateFromLocation } from '../utils/shareLinks'
import { localizePath } from '../utils/routes'

// The read-only page a share link opens (/view#data=…, 1.7.12). The CV
// lives in the address's fragment, which only the browser has: the address
// is read as an external store (null without a window, so render never
// touches it there), and again when the fragment changes in the same tab.
// A link with no data, or one that doesn't decode, shows a short message
// instead of a CV.
function BadLinkMessage({ locale }) {
  const isFinnish = locale === 'fi'
  return (
    <div className="landing-section" style={{ textAlign: 'center' }}>
      <h1 className="landing-section__title">
        {isFinnish ? 'Tätä CV-linkkiä ei voi avata' : "This CV link can't be opened"}
      </h1>
      <p className="landing-section__subtitle">
        {isFinnish
          ? 'Linkki on voinut katketa tai muuttua. Pyydä lähettäjältä uusi linkki.'
          : 'The link may have been cut short or changed. Ask the sender for a new one.'}
      </p>
      <a href={localizePath('/', locale)}>
        {isFinnish ? 'Siirry PortifyCV:hen' : 'Go to PortifyCV'}
      </a>
    </div>
  )
}

const subscribeToHash = (onChange) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const readHref = () => window.location.href
const readNoHref = () => null

// The link's CV, or null for a missing or corrupt link.
function readSharedCv(href) {
  try {
    return readCvStateFromLocation(href)
  } catch {
    return null
  }
}

export default function SharedCvPage({ locale = 'en' }) {
  const href = useSyncExternalStore(subscribeToHash, readHref, readNoHref)
  const shared = useMemo(() => (href ? readSharedCv(href) : null), [href])

  if (!href) {
    return null
  }
  if (!shared) {
    return <BadLinkMessage locale={locale} />
  }
  return <p data-testid="shared-cv-stub">{shared.formData.fullName}</p>
}
