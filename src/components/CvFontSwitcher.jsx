import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { CV_FONT_OPTIONS, loadAllCvFonts } from '../utils/cvFonts'
import { useAnchoredPanelPosition } from '../hooks/useAnchoredPanelPosition'

// Toolbar's font picker, next to the template quick switcher — a plain
// vertical dropdown list: every font on one screen, its name set in its own
// face so the label doubles as the preview. Every option's CSS is fetched
// the moment the panel opens (loadAllCvFonts) so all samples render in their
// real face — cheap because these are small, mostly-system font stacks (see
// utils/cvFonts.js), not a dozen full custom fonts.
function CvFontSwitcher({
  fontId = '',
  onSelectFont = () => {},
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const panelRef = useRef(null)
  // Toolbar.jsx doesn't pass a triggerRef prop — an internal ref both drives
  // the button itself and gives useAnchoredPanelPosition a real DOM node to
  // measure.
  const triggerRef = useRef(null)
  const selectedFont = CV_FONT_OPTIONS.find((font) => font.id === fontId)
  const { style: panelPosition, ready: panelReady } = useAnchoredPanelPosition(isOpen, triggerRef, panelRef)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    loadAllCvFonts()

    panelRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })

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
          role="listbox"
          aria-label={isFinnish ? 'Valitse fontti' : 'Select font'}
          ref={panelRef}
          style={{ ...panelPosition, visibility: panelReady ? 'visible' : 'hidden' }}
        >
          {CV_FONT_OPTIONS.map((font) => {
            const isActive = font.id === fontId

            return (
              <button
                key={font.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`cv-font-switcher__option${isActive ? ' cv-font-switcher__option--active' : ''}`}
                data-active={isActive}
                style={{ fontFamily: font.stack }}
                onClick={() => handleSelect(font.id)}
              >
                <span className="cv-font-switcher__option-label">{font.label}</span>
                {isActive ? <Check size={15} strokeWidth={2.5} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default CvFontSwitcher
