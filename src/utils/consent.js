import { safeStorageGet, safeStorageSet } from './cvForm'

export const AD_CONSENT_STORAGE_KEY = 'portifycv-ad-consent'

export function getAdConsent() {
  const stored = safeStorageGet(AD_CONSENT_STORAGE_KEY).value

  return stored === 'accepted' || stored === 'rejected' ? stored : null
}

export function setAdConsent(value) {
  safeStorageSet(AD_CONSENT_STORAGE_KEY, value)
}
