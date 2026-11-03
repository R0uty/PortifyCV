import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, FileWarning } from 'lucide-react'

import { getTabStops } from '../utils/focusTrap'

// Asks before an in-app link or back/forward leaves a CV with unsaved edits
// (1.6.68), in place of the browser's plain "Leave site?" prompt, which
// still covers closing the tab or reloading (browsers allow nothing else
// there). Keep editing is the default; the visitor can also download a
// JSON copy and then leave, or leave without one.
function LeaveConfirmDialog({ locale, onStay, onLeave, onSaveAndLeave }) {
  const panelRef = useRef(null)
  const stayRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const onStayRef = useRef(onStay)
  const [isSaving, setIsSaving] = useState(false)
  const isFinnish = locale === 'fi'

  useEffect(() => {
    onStayRef.current = onStay
  }, [onStay])

  // Mounted only while asking, so each time starts fresh.
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement
    const focusTimeoutId = window.setTimeout(() => stayRef.current?.focus(), 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onStayRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }
      const focusable = getTabStops(panelRef.current)
      if (focusable.length === 0) {
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimeoutId)
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus?.()
    }
  }, [])

  const handleSaveAndLeave = async () => {
    setIsSaving(true)
    try {
      await onSaveAndLeave()
    } catch {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-overlay leave-dialog-overlay print:hidden" onClick={onStay}>
      <div
        ref={panelRef}
        className="leave-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-dialog-title"
        aria-describedby="leave-dialog-body"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="leave-dialog__icon" aria-hidden="true">
          <FileWarning size={26} strokeWidth={1.8} />
        </div>
        <h2 id="leave-dialog-title" className="leave-dialog__title">
          {isFinnish ? 'Poistutaanko tallentamatta?' : 'Leave without saving?'}
        </h2>
        <div id="leave-dialog-body" className="leave-dialog__body">
          <p>
            {isFinnish
              ? 'PortifyCV ei tallenna CV:täsi mihinkään. Jos poistut nyt, viimeisimmät muutoksesi katoavat.'
              : "PortifyCV doesn't store your CV anywhere. If you leave now, your latest changes are gone."}
          </p>
          <p className="leave-dialog__hint">
            {isFinnish
              ? 'Lataa JSON-kopio, niin voit tuoda sen myöhemmin ja jatkaa siitä, mihin jäit.'
              : 'Download a JSON copy to import later and pick up where you left off.'}
          </p>
        </div>
        <div className="leave-dialog__actions">
          <button
            ref={stayRef}
            type="button"
            className="leave-dialog__button leave-dialog__button--primary"
            onClick={onStay}
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            {isFinnish ? 'Jatka muokkausta' : 'Keep editing'}
          </button>
          <button
            type="button"
            className="leave-dialog__button leave-dialog__button--secondary"
            onClick={handleSaveAndLeave}
            disabled={isSaving}
          >
            <Download size={16} strokeWidth={2} aria-hidden="true" />
            {isFinnish ? 'Lataa JSON ja poistu' : 'Download JSON & leave'}
          </button>
          <button
            type="button"
            className="leave-dialog__button leave-dialog__button--danger"
            onClick={onLeave}
            disabled={isSaving}
          >
            {isFinnish ? 'Poistu tallentamatta' : 'Leave without saving'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeaveConfirmDialog
