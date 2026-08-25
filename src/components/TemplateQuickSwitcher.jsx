import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import TemplateThumbnail from './TemplateThumbnail'
import { buildThumbnailCv } from '../utils/thumbnailCv'

// Toolbar's template picker: a button that opens a horizontally scrollable
// strip of live thumbnails (same TemplateThumbnail used by the full
// TemplateGalleryModal) instead of a plain <select> of template names.
function TemplateQuickSwitcher({
  templates = [],
  selectedTemplateId = '',
  onSelectTemplate = () => {},
  formDataRef,
  locale = 'en',
  triggerRef,
}) {
  const isFinnish = locale === 'fi'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const stripRef = useRef(null)
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId)

  // Starts as the demo CV (no ref read at render time) and is snapshotted
  // from formDataRef in the effect below each time the panel opens —
  // formDataRef changes on every keystroke and this only needs to be
  // roughly current, not kept live while typing.
  const [thumbnailCv, setThumbnailCv] = useState(() => buildThumbnailCv())

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    setThumbnailCv(buildThumbnailCv(formDataRef?.current))

    // Bring the current template into view instead of always starting the
    // strip scrolled to its leftmost card.
    stripRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef?.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, triggerRef, formDataRef])

  function handleBlur(event) {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  function handleSelect(templateId) {
    onSelectTemplate(templateId)
    setIsOpen(false)
    triggerRef?.current?.focus()
  }

  // Plain vertical mouse wheels don't scroll a horizontal strip on their
  // own — redirect that scroll instead of requiring shift+wheel/trackpad.
  function handleWheel(event) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }
    event.currentTarget.scrollBy({ left: event.deltaY })
    event.preventDefault()
  }

  function scrollByCard(direction) {
    const strip = stripRef.current
    if (!strip) {
      return
    }
    const card = strip.querySelector('.template-quick-switcher__card')
    const step = card ? card.getBoundingClientRect().width + 12 : 160
    strip.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div className="template-quick-switcher" ref={containerRef} onBlur={handleBlur}>
      <button
        type="button"
        ref={triggerRef}
        className="template-quick-switcher__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {/* Visually hidden so sighted users just see the template name, but
            screen readers get "Select template: X" instead of only "X". */}
        <span className="sr-only">{isFinnish ? 'Valitse pohja: ' : 'Select template: '}</span>
        <span className="template-quick-switcher__trigger-label">
          {selectedTemplate?.label || (isFinnish ? 'Valitse pohja' : 'Select template')}
        </span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="template-quick-switcher__panel"
          role="dialog"
          aria-label={isFinnish ? 'Valitse pohja' : 'Select template'}
        >
          <button
            type="button"
            className="template-quick-switcher__nav template-quick-switcher__nav--left"
            aria-label={isFinnish ? 'Vieritä vasemmalle' : 'Scroll left'}
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="template-quick-switcher__strip" ref={stripRef} onWheel={handleWheel}>
            {templates.map((template) => {
              const isActive = template.id === selectedTemplateId

              return (
                <button
                  key={template.id}
                  type="button"
                  className={`template-quick-switcher__card${isActive ? ' template-quick-switcher__card--active' : ''}`}
                  data-active={isActive}
                  onClick={() => handleSelect(template.id)}
                >
                  <span className="template-quick-switcher__thumb template-gallery__thumb">
                    <TemplateThumbnail templateId={template.id} formData={thumbnailCv} locale={locale} />
                  </span>
                  <span className="template-quick-switcher__label">{template.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="template-quick-switcher__nav template-quick-switcher__nav--right"
            aria-label={isFinnish ? 'Vieritä oikealle' : 'Scroll right'}
            onClick={() => scrollByCard(1)}
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default TemplateQuickSwitcher
