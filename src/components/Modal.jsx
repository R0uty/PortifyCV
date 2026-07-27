import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({ isOpen, onClose, title, description, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay print:hidden" onClick={onClose}>
      <div
        className={`modal-panel modal-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
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
