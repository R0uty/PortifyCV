// Stays dormant until VITE_ADSENSE_CLIENT_ID is configured — showing a
// cookie-for-ads notice before the site actually serves ads would be
// inaccurate. See docs/adsense-indexing-readiness.md.
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID

function ConsentBanner({ consent, onDecide, locale = 'en' }) {
  if (!ADSENSE_CLIENT_ID || consent !== null) {
    return null
  }

  const isFinnish = locale === 'fi'

  return (
    <div
      className="consent-banner"
      role="dialog"
      aria-label={isFinnish ? 'Evästesuostumus' : 'Cookie consent'}
    >
      <p className="consent-banner__text">
        {isFinnish ? (
          <>
            PortifyCV käyttää mainontaan liittyviä evästeitä auttaakseen
            rahoittamaan sivustoa. CV-sisältöösi tämä ei koskaan vaikuta. Katso{' '}
            <a href="/privacy">tietosuojaseloste</a> lisätietoja varten.
          </>
        ) : (
          <>
            PortifyCV uses cookies for advertising to help fund the site. Your CV
            content is never affected by this. See the{' '}
            <a href="/privacy">privacy policy</a> for details.
          </>
        )}
      </p>
      <div className="consent-banner__actions">
        <button
          type="button"
          className="consent-banner__button consent-banner__button--reject"
          onClick={() => onDecide('rejected')}
        >
          {isFinnish ? 'Hylkää' : 'Reject'}
        </button>
        <button
          type="button"
          className="consent-banner__button consent-banner__button--accept"
          onClick={() => onDecide('accepted')}
        >
          {isFinnish ? 'Hyväksy' : 'Accept'}
        </button>
      </div>
    </div>
  )
}

export default ConsentBanner
