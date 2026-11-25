import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearApplications,
  deleteApplication,
  isApplicationLogAvailable,
  listApplications,
  updateApplication,
} from '../utils/applicationLog'
import { builder } from '../i18n/builder'

// The applications logged on this device (1.7.11), for My CVs' Applications
// tab and the Settings row that deletes them all.
//
// Read on mount, whenever `version` changes (the builder bumps it after
// Mark as applied) and on refresh(), which the builder calls when the tab
// or Settings opens, so an application another tab logged shows up then.
//
// Writes go through one queue and a refresh waits for it, so a note flushed
// as the dialog closes is stored before the list is read back.
export default function useApplications({ version = 0, locale = 'en', showToast } = {}) {
  const [isAvailable, setIsAvailable] = useState(isApplicationLogAvailable)
  const [applications, setApplications] = useState([])

  const queueRef = useRef(Promise.resolve())
  const latestRef = useRef({ locale, showToast })
  useEffect(() => {
    latestRef.current = { locale, showToast }
  })

  const say = useCallback((key, type = 'success') => {
    latestRef.current.showToast?.(builder.t(latestRef.current.locale, key), type)
  }, [])

  const enqueue = useCallback((task) => {
    const run = queueRef.current.then(task)
    queueRef.current = run.catch(() => {})
    return run
  }, [])

  const reportFailure = useCallback((error) => {
    if (error?.code === 'unavailable') setIsAvailable(false)
    if (error?.code === 'full') {
      say('applications.storageFull', 'error')
    } else {
      say('applications.changeFailed', 'error')
    }
  }, [say])

  const refresh = useCallback(async () => {
    try {
      await queueRef.current
      // isApplicationLogAvailable() says yes even where opening is refused;
      // reading the list is what finds out.
      const list = await listApplications()
      setIsAvailable(true)
      setApplications(list)
      return list
    } catch (error) {
      if (error?.code === 'unavailable') {
        setIsAvailable(false)
        setApplications([])
      }
      return []
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await refresh()
    })()
  }, [refresh, version])

  // Shown at once (a status select follows the click), then replaced by
  // what was stored.
  const update = useCallback((id, changes) => {
    setApplications((list) => list.map((item) => (item.id === id ? { ...item, ...changes } : item)))

    return enqueue(async () => {
      try {
        const summary = await updateApplication(id, changes)
        setApplications((list) => list.map((item) => (item.id === id ? summary : item)))
        return summary
      } catch (error) {
        // Deleted meanwhile (here or in another tab): nothing left to change.
        if (error?.code === 'missing') {
          setApplications((list) => list.filter((item) => item.id !== id))
          return null
        }
        reportFailure(error)
        refresh()
        return null
      }
    })
  }, [enqueue, refresh, reportFailure])

  const remove = useCallback((id) => enqueue(async () => {
    try {
      await deleteApplication(id)
      setApplications((list) => list.filter((item) => item.id !== id))
      return true
    } catch (error) {
      reportFailure(error)
      return false
    }
  }), [enqueue, reportFailure])

  const removeAll = useCallback(() => enqueue(async () => {
    try {
      await clearApplications()
      setApplications([])
      say('applications.allDeleted')
      return true
    } catch (error) {
      reportFailure(error)
      return false
    }
  }), [enqueue, reportFailure, say])

  return useMemo(() => ({
    isAvailable,
    applications,
    count: applications.length,
    refresh,
    update,
    remove,
    removeAll,
  }), [applications, isAvailable, refresh, remove, removeAll, update])
}
