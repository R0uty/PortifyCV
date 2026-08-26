import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { CV_FONT_OPTIONS, loadAllCvFonts } from '../utils/cvFonts'

// Toolbar's font picker, next to the template quick switcher — same
// dropdown-panel-of-cards shape as TemplateQuickSwitcher.jsx (trigger button,
// horizontally scrollable strip, nav arrows), except each card's "thumbnail"
// is the font's own name set in that font instead of a rendered CV. Every
// option's CSS is fetched the moment the panel opens (loadAllCvFonts) so all
// nine samples can preview in their real face — cheap because these are
// small, mostly-system font stacks (see utils/cvFonts.js), not a dozen full
// custom fonts.
function CvFontSwitcher({
  fontId = '',
  onSelectFont = () => {},
  locale = 'en',
  triggerRef,
}) {
  const isFinnish = locale === 'fi'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const stripRef = useRef(null)
  const selectedFont = CV_FONT_OPTIONS.find((font) => font.id === fontId)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    loadAllCvFonts()

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
  }, [isOpen, triggerRef])

  function handleBlur(event) {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  function handleSelect(nextFontId) {
    onSelectFont(nextFontId)
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
    const card = strip.querySelector('.cv-font-switcher__card')
    const step = card ? card.getBoundingClientRect().width + 12 : 160
    strip.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div className="cv-font-switcher" ref={containerRef} onBlur={handleBlur}>
      <button
        type="button"
        ref={triggerRef}
        className="cv-font-switcher__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {/* Visually hidden so sighted users just see the font name, but
            screen readers get "Select font: X" instead of only "X". */}
        <span className="sr-only">{isFinnish ? 'Valitse fontti: ' : 'Select font: '}</span>
        <span
          className="cv-font-switcher__trigger-label"
          style={{ fontFamily: selectedFont?.stack }}
        >
          {selectedFont?.label || (isFinnish ? 'Fontti' : 'Font')}
        </span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="cv-font-switcher__panel"
          role="dialog"
          aria-label={isFinnish ? 'Valitse fontti' : 'Select font'}
        >
          <button
            type="button"
            className="cv-font-switcher__nav cv-font-switcher__nav--left"
            aria-label={isFinnish ? 'Vieritä vasemmalle' : 'Scroll left'}
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="cv-font-switcher__strip" ref={stripRef} onWheel={handleWheel}>
            {CV_FONT_OPTIONS.map((font) => {
              const isActive = font.id === fontId

              return (
                <button
                  key={font.id}
                  type="button"
                  className={`cv-font-switcher__card${isActive ? ' cv-font-switcher__card--active' : ''}`}
                  data-active={isActive}
                  onClick={() => handleSelect(font.id)}
                >
                  <span className="cv-font-switcher__sample" style={{ fontFamily: font.stack }}>
                    {font.label}
                  </span>
                  <span className="cv-font-switcher__label">{font.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="cv-font-switcher__nav cv-font-switcher__nav--right"
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

export default CvFontSwitcher
