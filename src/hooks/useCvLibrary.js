import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parseImportedCvData, safeSessionStorageGet, safeSessionStorageRemove, safeSessionStorageSet } from '../utils/cvForm'
import {
  ACTIVE_CV_SESSION_KEY,
  clearSavedCvs,
  createCvRecord,
  deleteSavedCv,
  getSavedCv,
  isCvLibraryAvailable,
  listSavedCvs,
  nextCopyName,
  normalizeCvName,
  renameSavedCv,
  saveCv,
} from '../utils/cvLibrary'

// The saved CVs on this device and the one this tab has open (1.7.1).
//
// "Active" means the CV on screen is a saved one: edits to it are written
// back after a pause. Until the visitor presses Save, nothing is active and
// nothing is written. Anything that swaps the CV on screen for a different
// one (clear, demo, import) must detach() first, or the swap would be
// auto-saved over the CV the visitor meant to keep.
//
// saveState: 'idle' (nothing active), 'saving', 'saved', 'conflict'
// (another tab saved this CV; auto-save is stopped until the visitor saves
// again on purpose) or 'error'.

const serialize = (data, templateId) => `${templateId}\n${JSON.stringify(data)}`

export default function useCvLibrary({
  formData,
  selectedTemplate,
  locale,
  showToast,
  markCvSaved,
  saveDelayMs,
  // True only when this tab's CV came back from session restore: then, and
  // only then, it is still the saved CV this tab had open before a reload.
  canReattach,
  // Called with the saved CV's template when that happens.
  onReattach,
}) {
  // Also turns false once the browser refuses to open the database (a
  // private window, blocked site data), so the Save dialog can say so.
  const [isAvailable, setIsAvailable] = useState(isCvLibraryAvailable)
  const [activeCv, setActiveCv] = useState(null)
  const [saveState, setSaveState] = useState('idle')
  const [savedCvs, setSavedCvs] = useState([])

  const activeRef = useRef(null)
  const lastWrittenRef = useRef(null)
  const writeQueueRef = useRef(Promise.resolve())
  const latestRef = useRef({ formData, selectedTemplate, locale, showToast, markCvSaved, onReattach })
  useEffect(() => {
    latestRef.current = { formData, selectedTemplate, locale, showToast, markCvSaved, onReattach }
  })

  const say = useCallback((english, finnish, type = 'success') => {
    latestRef.current.showToast(latestRef.current.locale === 'fi' ? finnish : english, type)
  }, [])

  const setActive = useCallback((next) => {
    activeRef.current = next
    setActiveCv(next)
    if (next) safeSessionStorageSet(ACTIVE_CV_SESSION_KEY, next.id)
    else safeSessionStorageRemove(ACTIVE_CV_SESSION_KEY)
  }, [])

  const reportFailure = useCallback((error) => {
    if (error?.code === 'full') {
      say('Could not save: this browser\'s storage is full.', 'Tallennus epäonnistui: selaimen tallennustila on täynnä.', 'error')
    } else {
      say(
        'Could not save on this device. Your CV is still open here; export JSON to keep a copy.',
        'Tallennus tälle laitteelle epäonnistui. CV on yhä auki tässä; vie JSON, jos haluat kopion talteen.',
        'error',
      )
    }
  }, [say])

  const refreshSavedCvs = useCallback(async () => {
    if (!isAvailable) return []

    try {
      const list = await listSavedCvs()
      setSavedCvs(list)
      return list
    } catch (error) {
      if (error?.code === 'unavailable') setIsAvailable(false)
      return []
    }
  }, [isAvailable])

  const detach = useCallback(() => {
    setActive(null)
    lastWrittenRef.current = null
    setSaveState('idle')
  }, [setActive])

  // Writes run one at a time, each against the version the last one left.
  const write = useCallback(({ force = false } = {}) => {
    const run = async () => {
      const active = activeRef.current
      if (!active) return false

      const { formData: data, selectedTemplate: templateId, markCvSaved: markSaved } = latestRef.current
      const serialized = serialize(data, templateId)
      if (!force && serialized === lastWrittenRef.current) return true

      setSaveState('saving')

      try {
        const stored = await saveCv(
          createCvRecord({ id: active.id, name: active.name, data, templateId, createdAt: active.createdAt }),
          { expectedUpdatedAt: force ? undefined : active.updatedAt },
        )

        // Detached or switched while the write was in flight: not ours to mark.
        if (activeRef.current?.id !== active.id) return true

        lastWrittenRef.current = serialized
        setActive({ ...activeRef.current, updatedAt: stored.updatedAt, createdAt: stored.createdAt })
        setSaveState('saved')
        markSaved(data)
        setSavedCvs((list) => [
          { id: stored.id, name: stored.name, templateId: stored.templateId, createdAt: stored.createdAt, updatedAt: stored.updatedAt },
          ...list.filter((item) => item.id !== stored.id),
        ])
        return true
      } catch (error) {
        if (activeRef.current?.id !== active.id) return false

        if (error?.code === 'conflict') {
          setSaveState('conflict')
          say(
            `"${active.name}" was changed in another tab, so saving is paused here. Press Save to keep this tab's version instead.`,
            `"${active.name}" muuttui toisessa välilehdessä, joten tallennus on tauolla tässä. Paina Tallenna, jos haluat säilyttää tämän välilehden version.`,
            'error',
          )
        } else if (error?.code === 'missing') {
          detach()
          say(
            `"${active.name}" is no longer saved on this device. It is still open here; save it again to keep it.`,
            `"${active.name}" ei ole enää tallessa tällä laitteella. Se on yhä auki tässä; tallenna se uudelleen, jos haluat säilyttää sen.`,
            'error',
          )
        } else {
          setSaveState('error')
          reportFailure(error)
        }
        return false
      }
    }

    const next = writeQueueRef.current.then(run, run)
    writeQueueRef.current = next.catch(() => {})
    return next
  }, [detach, reportFailure, say, setActive])

  // On arrival: the list, and the saved CV this tab had open before a reload.
  useEffect(() => {
    if (!isAvailable) return undefined

    let cancelled = false
    const rememberedId = safeSessionStorageGet(ACTIVE_CV_SESSION_KEY).value

    ;(async () => {
      const list = await refreshSavedCvs()
      if (cancelled) return

      const remembered = canReattach && rememberedId ? list.find((item) => item.id === rememberedId) : null

      if (remembered) {
        setActive({ id: remembered.id, name: remembered.name, updatedAt: remembered.updatedAt, createdAt: remembered.createdAt })
        setSaveState('saved')
        latestRef.current.onReattach?.({ templateId: remembered.templateId })
        return
      }

      safeSessionStorageRemove(ACTIVE_CV_SESSION_KEY)

      if (list.length > 0) {
        say(
          `You have ${list.length} saved ${list.length === 1 ? 'CV' : 'CVs'}. Open ${list.length === 1 ? 'it' : 'them'} from More actions › My CVs.`,
          `Sinulla on ${list.length} tallennettu${list.length === 1 ? '' : 'a'} CV${list.length === 1 ? '' : ':tä'}. Avaa ${list.length === 1 ? 'se' : 'ne'} kohdasta Lisää toimintoja › Omat CV:t.`,
          'info',
        )
      }
    })()

    return () => {
      cancelled = true
    }
    // Once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save: only while a saved CV is active, and not while paused by a conflict.
  useEffect(() => {
    if (!activeCv || saveState === 'conflict') return undefined
    if (serialize(formData, selectedTemplate) === lastWrittenRef.current) return undefined

    const timeoutId = window.setTimeout(() => {
      write()
    }, saveDelayMs)

    return () => window.clearTimeout(timeoutId)
  }, [activeCv, formData, saveDelayMs, saveState, selectedTemplate, write])

  const saveAs = useCallback(async (name) => {
    // Saving as a new CV while another is open: that one keeps what was
    // typed a moment ago, and the new one starts from the same content.
    if (activeRef.current) await write()

    const { formData: data, selectedTemplate: templateId, markCvSaved: markSaved } = latestRef.current
    const record = createCvRecord({ name: normalizeCvName(name), data, templateId })

    if (!record.name) return false

    try {
      const stored = await saveCv(record, { expectedUpdatedAt: null })

      lastWrittenRef.current = serialize(data, templateId)
      setActive({ id: stored.id, name: stored.name, updatedAt: stored.updatedAt, createdAt: stored.createdAt })
      setSaveState('saved')
      markSaved(data)
      await refreshSavedCvs()
      // Ask the browser not to evict it under storage pressure. Best effort.
      navigator.storage?.persist?.().catch(() => {})
      say(`Saved on this device as "${stored.name}".`, `Tallennettu tälle laitteelle nimellä "${stored.name}".`)
      return true
    } catch (error) {
      reportFailure(error)
      return false
    }
  }, [refreshSavedCvs, reportFailure, say, setActive, write])

  // The visitor pressing Save on a CV that is already saved: write now, and
  // over whatever another tab stored.
  const saveNow = useCallback(async () => {
    const saved = await write({ force: true })
    if (saved && activeRef.current) say('Saved on this device.', 'Tallennettu tälle laitteelle.')
    return saved
  }, [say, write])

  // Loads and validates a saved CV, hands it to `apply` (which puts it on
  // screen), and makes it the active one, all in one go so no render sees
  // the new CV's id with the old CV's content.
  const openCv = useCallback(async (id, apply) => {
    try {
      const record = await getSavedCv(id)

      if (!record) {
        await refreshSavedCvs()
        say('That CV is no longer saved on this device.', 'Tätä CV:tä ei ole enää tallessa tällä laitteella.', 'error')
        return false
      }

      const data = parseImportedCvData(record.data)
      const appliedTemplateId = apply({ data, templateId: record.templateId })

      lastWrittenRef.current = serialize(data, appliedTemplateId)
      setActive({ id: record.id, name: record.name, updatedAt: record.updatedAt, createdAt: record.createdAt })
      setSaveState('saved')
      return true
    } catch (error) {
      if (error?.code) reportFailure(error)
      else say('That saved CV could not be opened.', 'Tallennettua CV:tä ei voitu avata.', 'error')
      return false
    }
  }, [refreshSavedCvs, reportFailure, say, setActive])

  const duplicateCv = useCallback(async (id) => {
    try {
      // A copy of the open CV should include what was typed a moment ago.
      if (activeRef.current?.id === id) await write()

      const record = await getSavedCv(id)
      if (!record) return null

      const names = (await listSavedCvs()).map((item) => item.name)
      const copy = await saveCv(
        createCvRecord({ name: nextCopyName(record.name, names, latestRef.current.locale), data: record.data, templateId: record.templateId }),
        { expectedUpdatedAt: null },
      )
      await refreshSavedCvs()
      return copy.id
    } catch (error) {
      reportFailure(error)
      return null
    }
  }, [refreshSavedCvs, reportFailure, write])

  const renameCv = useCallback(async (id, name) => {
    const nextName = normalizeCvName(name)
    if (!nextName) return false

    try {
      await renameSavedCv(id, nextName)
      if (activeRef.current?.id === id) setActive({ ...activeRef.current, name: nextName })
      await refreshSavedCvs()
      return true
    } catch (error) {
      reportFailure(error)
      return false
    }
  }, [refreshSavedCvs, reportFailure, setActive])

  const deleteCv = useCallback(async (id) => {
    try {
      await deleteSavedCv(id)
      if (activeRef.current?.id === id) detach()
      await refreshSavedCvs()
      return true
    } catch (error) {
      reportFailure(error)
      return false
    }
  }, [detach, refreshSavedCvs, reportFailure])

  const deleteAll = useCallback(async () => {
    try {
      await clearSavedCvs()
      detach()
      setSavedCvs([])
      say('All saved CVs were deleted from this device.', 'Kaikki tallennetut CV:t poistettiin tältä laitteelta.')
      return true
    } catch (error) {
      reportFailure(error)
      return false
    }
  }, [detach, reportFailure, say])

  // One object that only changes when the state does: the page passes it
  // to callbacks that feed the toolbar.
  return useMemo(() => ({
    isAvailable,
    activeCv,
    saveState,
    savedCvs,
    refreshSavedCvs,
    saveAs,
    saveNow,
    openCv,
    duplicateCv,
    renameCv,
    deleteCv,
    deleteAll,
    detach,
  }), [
    activeCv, deleteAll, deleteCv, detach, duplicateCv, isAvailable, openCv,
    refreshSavedCvs, renameCv, saveAs, saveNow, saveState, savedCvs,
  ])
}
