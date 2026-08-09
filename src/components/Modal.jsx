import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Modal({ isOpen, onClose, title, description, children, size = 'md' }) {
  const panelRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  // Callers commonly pass an inline arrow for onClose. Reading it through a ref
  // keeps the effect below tied to `isOpen` alone, so a parent re-render cannot
  // tear down the focus trap and bounce focus out of the open dialog.
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    previouslyFocusedRef.current = document.activeElement

    const focusTimeoutId = window.setTimeout(() => {
      panelRef.current?.focus()
    }, 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR))

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
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay print:hidden" onClick={onClose}>
      <div
        ref={panelRef}
        className={`modal-panel modal-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-panel__header">
          <div>
            <h2 className="modal-panel__title">{title}</h2>
            {description ? <p className="modal-panel__description">{description}</p> : null}
          </div>
          <button
            type="button"
            className="modal-panel__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-panel__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
