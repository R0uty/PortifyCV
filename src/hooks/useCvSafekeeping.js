import { useCallback, useEffect, useRef } from 'react'
import {
  CV_SESSION_RESTORE_ENABLED_STORAGE_KEY,
  CV_SESSION_SNAPSHOT_STORAGE_KEY,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from '../utils/cvForm'
import { registerUnsavedChangesCheck } from '../utils/leaveGuard'

// What keeps a CV from being lost by accident, moved out of
// ResumeBuilderPage.jsx (1.6.86): session restore's copy in this tab, and
// the check behind the ask-before-leaving prompts (utils/leaveGuard.js).
//
// Two snapshots of the CV drive it, both JSON strings:
//   - pristine: the demo, example or blank CV the builder last loaded,
//     untouched; null once the CV came from the visitor (restored, shared
//     or imported). Session restore keeps no copy of a CV that still
//     matches it.
//   - saved: the CV as it was when the visitor last had a copy they can
//     get back: opened, imported, loaded, or exported as JSON. Leaving the
//     page with anything else asks first (1.6.66).
export default function useCvSafekeeping({
  formData,
  initialSession,
  sessionRestoreEnabled,
  locale,
  showToast,
  setStorageValue,
  snapshotDelayMs,
}) {
  const pristineCvRef = useRef(initialSession.isOwnCv ? null : JSON.stringify(initialSession.formData))
  const savedCvRef = useRef(null)
  const formDataRef = useRef(formData)
  const warningShownRef = useRef(false)
  // The page's showToast is a new function every render.
  const showToastRef = useRef(showToast)
  useEffect(() => {
    showToastRef.current = showToast
  })

  const markCvSaved = useCallback((data) => {
    savedCvRef.current = JSON.stringify(data)
  }, [])

  const markCvPristine = useCallback((data) => {
    pristineCvRef.current = JSON.stringify(data)
  }, [])

  useEffect(() => {
    setStorageValue(CV_SESSION_RESTORE_ENABLED_STORAGE_KEY, sessionRestoreEnabled ? 'true' : 'false')

    // Turning the feature off clears any saved copy immediately, rather than
    // waiting for the tab to close — an explicit "stop and forget" action.
    if (!sessionRestoreEnabled) {
      safeSessionStorageRemove(CV_SESSION_SNAPSHOT_STORAGE_KEY)
    }
  }, [sessionRestoreEnabled, setStorageValue])

  useEffect(() => {
    if (!sessionRestoreEnabled) {
      return undefined
    }

    // Only a CV the visitor has made their own is kept. An untouched demo,
    // example or blank CV isn't: with restore on by default (1.6.82) a
    // kept copy of the sample CV would win over every "Use this example"
    // link the visitor follows next (see loadInitialCvSession).
    const writeSnapshot = () => {
      const serialized = JSON.stringify(formData)

      if (serialized === pristineCvRef.current) {
        safeSessionStorageRemove(CV_SESSION_SNAPSHOT_STORAGE_KEY)
        return { ok: true }
      }

      return safeSessionStorageSet(CV_SESSION_SNAPSHOT_STORAGE_KEY, serialized)
    }

    const timeoutId = window.setTimeout(() => {
      const result = writeSnapshot()

      if (!result.ok && !warningShownRef.current) {
        warningShownRef.current = true
        showToastRef.current(
          locale === 'fi'
            ? 'Istunnon palautusta ei voitu tallentaa (tila on täynnä tai estetty). CV on silti tallella tässä välilehdessä.'
            : 'Could not save a session-restore copy (storage full or blocked). Your CV is still fine in this tab.',
          'error',
        )
      }
    }, snapshotDelayMs)
    // An edit made just before the page goes would miss the timer.
    window.addEventListener('pagehide', writeSnapshot)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('pagehide', writeSnapshot)
    }
  }, [formData, locale, sessionRestoreEnabled, snapshotDelayMs])

  useEffect(() => {
    formDataRef.current = formData
    if (savedCvRef.current === null) {
      savedCvRef.current = JSON.stringify(formData)
    }
  }, [formData])

  // Compared only when the page is about to unload, or the app asks.
  useEffect(() => registerUnsavedChangesCheck(
    () => JSON.stringify(formDataRef.current) !== savedCvRef.current,
    { keptInTab: () => sessionRestoreEnabled },
  ), [sessionRestoreEnabled])

  return { formDataRef, markCvSaved, markCvPristine }
}
