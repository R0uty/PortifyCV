import { useCallback, useEffect, useRef, useState } from 'react'
import { FORM_ACTION } from '../reducers/cvFormReducer'
import { pickTemplateLook, UI_ACTION } from '../reducers/uiReducer'
import { TEMPLATE_VARIANTS, resolveStyleVariantId } from '../utils/templateVariants'

// An undo/redo history step: the CV, plus — only on a template-gallery
// Use (1.6.6) — the template look it replaced (uiReducer's
// pickTemplateLook), since the template and the tab-only accent, font and
// headings colour aren't part of the CV. Ordinary edits carry no look, so
// undoing them never touches font tweaks.
function historyEntry(formData, look = null) {
  return { formData, look }
}

// The undo past plus a change from the last HISTORY_COMMIT_DELAY_MS that
// the debounced commit hasn't recorded yet, as its own step — so Undo (or
// a gallery Use) right after a change treats that change separately.
function pastWithPendingEdit(past, committed, formData) {
  return formData === committed ? past : [...past, historyEntry(committed)]
}

// The templates whose stored (resolved) style variant differs between two CVs.
function changedStyleVariantTemplates(a, b) {
  return Object.keys(TEMPLATE_VARIANTS)
    .filter((templateId) => resolveStyleVariantId(a, templateId) !== resolveStyleVariantId(b, templateId))
}

// The builder's undo and redo, moved out of ResumeBuilderPage.jsx (1.6.87).
// Edits are grouped into steps `commitDelayMs` apart.
export default function useCvHistory({
  formData,
  initialFormData,
  dispatchFormData,
  dispatchUi,
  uiState,
  selectedTemplate,
  applyStoredStyleVariantLook,
  commitDelayMs,
}) {
  const [historyPast, setHistoryPast] = useState([])
  const [historyFuture, setHistoryFuture] = useState([])
  const historyCommittedRef = useRef(initialFormData)
  const historySkipNextCommitRef = useRef(false)

  useEffect(() => {
    if (historySkipNextCommitRef.current) {
      historySkipNextCommitRef.current = false
      historyCommittedRef.current = formData
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      if (formData !== historyCommittedRef.current) {
        const committed = historyCommittedRef.current

        historyCommittedRef.current = formData
        setHistoryPast((past) => [...past, historyEntry(committed)])
        setHistoryFuture([])
      }
    }, commitDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [commitDelayMs, formData])

  const canUndo = historyPast.length > 0
  const canRedo = historyFuture.length > 0

  // Moves the CV to a history step's. A gallery Use's step may not have
  // changed the CV at all, and the skip flag must only be set when a
  // formData change will consume it, or it would swallow the next edit.
  const restoreHistoryFormData = useCallback((nextFormData) => {
    historyCommittedRef.current = nextFormData
    if (nextFormData !== formData) {
      historySkipNextCommitRef.current = true
      dispatchFormData({ type: FORM_ACTION.SET_FORM_DATA, formData: nextFormData })
    }
  }, [dispatchFormData, formData])

  // Restores the look that goes with a history step: a gallery Use's step
  // puts back the exact template look it replaced; any other step
  // restores the stored looks of the templates whose stored variant
  // changed (a variant pick, Clear CV, Load demo CV), so the font/accent
  // don't linger from the step being left.
  const restoreHistoryLook = useCallback((step) => {
    if (step.look) {
      dispatchUi({ type: UI_ACTION.RESTORE_TEMPLATE_LOOK, look: step.look })
      return
    }
    const changedTemplateIds = changedStyleVariantTemplates(step.formData, formData)
    if (changedTemplateIds.length > 0) {
      applyStoredStyleVariantLook(step.formData, selectedTemplate, changedTemplateIds)
    }
  }, [applyStoredStyleVariantLook, dispatchUi, formData, selectedTemplate])

  const handleUndo = useCallback(() => {
    // Undo straight after a change (e.g. right after "Load demo CV") undoes
    // that change and not also the step before it.
    const past = pastWithPendingEdit(historyPast, historyCommittedRef.current, formData)

    if (past.length === 0) {
      return
    }

    const previous = past[past.length - 1]

    setHistoryPast(past.slice(0, -1))
    // Stepping back over a gallery Use: the redo step keeps the look being
    // left, so Redo returns to it.
    setHistoryFuture([...historyFuture, historyEntry(formData, previous.look ? pickTemplateLook(uiState) : null)])
    restoreHistoryFormData(previous.formData)
    restoreHistoryLook(previous)
  }, [formData, historyFuture, historyPast, restoreHistoryFormData, restoreHistoryLook, uiState])

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) {
      return
    }

    const next = historyFuture[historyFuture.length - 1]

    setHistoryFuture(historyFuture.slice(0, -1))
    // Stepping forward over a gallery Use: the undo step keeps the look
    // being left, so Undo returns to it again.
    setHistoryPast([...historyPast, historyEntry(historyCommittedRef.current, next.look ? pickTemplateLook(uiState) : null)])
    restoreHistoryFormData(next.formData)
    restoreHistoryLook(next)
  }, [historyFuture, historyPast, restoreHistoryFormData, restoreHistoryLook, uiState])

  // A template-gallery Use: one step that keeps the look being replaced.
  // `skipNextCommit` when the Use also changes the CV (it stores another
  // variant), so that change stays part of this step.
  const recordTemplateLookStep = useCallback(({ skipNextCommit }) => {
    setHistoryPast([
      ...pastWithPendingEdit(historyPast, historyCommittedRef.current, formData),
      historyEntry(formData, pickTemplateLook(uiState)),
    ])
    setHistoryFuture([])
    historyCommittedRef.current = formData
    historySkipNextCommitRef.current = skipNextCommit
  }, [formData, historyPast, uiState])

  return { canUndo, canRedo, handleUndo, handleRedo, recordTemplateLookStep }
}
