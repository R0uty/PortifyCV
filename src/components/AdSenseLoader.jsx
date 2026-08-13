import { useEffect } from 'react'

// Unset until a real AdSense account exists — see docs/adsense-indexing-readiness.md.
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID

// Loads the real AdSense script only once a publisher ID is configured AND
// the visitor has accepted the cookie-consent banner (ConsentBanner). With
// no VITE_ADSENSE_CLIENT_ID set, this is a no-op — nothing is requested from
// Google, so today's "no data saved" claim stays true.
function AdSenseLoader({ consent }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || consent !== 'accepted') {
      return
    }
    if (document.querySelector('script[data-adsense-loader]')) {
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`
    script.crossOrigin = 'anonymous'
    script.dataset.adsenseLoader = 'true'
    document.head.appendChild(script)
  }, [consent])

  return null
}

export default AdSenseLoader
