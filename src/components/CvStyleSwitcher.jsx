import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { CV_FONT_OPTIONS } from '../utils/cvFonts'
import { useAnchoredPanelPosition } from '../hooks/useAnchoredPanelPosition'

// Toolbar's style-variant picker (Phase 3), right after Template — the
// same popover pattern as CvFontSwitcher.jsx, but a radio group: one row
// per curated look of the current template, each with its colour chips and
// font. Arrow keys move focus, Enter/Space picks, Escape closes. Picking
// (even the checked row) also resets the accent/font/headings tweaks —
// see ResumeBuilderPage's handleSelectStyleVariant.
function CvStyleSwitcher({
  variants = [],
  variantId = 'default',
  isModified = false,
  onSelectVariant = () => {},
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'
  const lang = isFinnish ? 'fi' : 'en'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const activeVariant = variants.find((variant) => variant.id === variantId) ?? variants[0]
  const { style: panelPosition, ready: panelReady } = useAnchoredPanelPosition(isOpen, triggerRef, panelRef)
  const modifiedText = isFinnish ? 'Muokattu' : 'Modified'
  const groupLabel = isFinnish ? 'Valitse tyyli' : 'Select style'
  const triggerLabel = `${groupLabel}: ${activeVariant?.label[lang] ?? ''}${isModified ? `, ${modifiedText}` : ''}`

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Focus moves into the group once it's positioned (it renders hidden
  // until then, and a hidden element can't take focus).
  useEffect(() => {
    if (isOpen && panelReady) {
      panelRef.current?.querySelector('[aria-checked="true"]')?.focus()
    }
  }, [isOpen, panelReady])

  function handleBlur(event) {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  function handlePanelKeyDown(event) {
    const radios = Array.from(panelRef.current?.querySelectorAll('[role="radio"]') ?? [])
    if (radios.length === 0) {
      return
    }
    const index = radios.indexOf(document.activeElement)
    const steps = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    let target = null
    if (event.key in steps) {
      target = radios[(index + steps[event.key] + radios.length) % radios.length]
    } else if (event.key === 'Home') {
      target = radios[0]
    } else if (event.key === 'End') {
      target = radios[radios.length - 1]
    }
    if (target) {
      event.preventDefault()
      target.focus()
    }
  }

  function handleSelect(nextVariantId) {
    onSelectVariant(nextVariantId)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="cv-style-switcher" ref={containerRef} onBlur={handleBlur}>
      <button
        type="button"
        ref={triggerRef}
        className="cv-style-switcher__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={triggerLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="cv-style-switcher__strip" aria-hidden="true">
          {(activeVariant?.swatches ?? []).map((color, index) => (
            <span key={index} className="cv-style-switcher__chip" style={{ background: color }} />
          ))}
        </span>
        <span className="cv-style-switcher__trigger-label" aria-hidden="true">
          {activeVariant?.label[lang]}
        </span>
        {isModified ? (
          <span className="cv-style-switcher__modified" aria-hidden="true">{modifiedText}</span>
        ) : null}
        {isModified ? (
          <span className="cv-style-switcher__dot" aria-hidden="true" />
        ) : null}
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="cv-style-switcher__panel"
          role="radiogroup"
          aria-label={groupLabel}
          ref={panelRef}
          onKeyDown={handlePanelKeyDown}
          style={{ ...panelPosition, visibility: panelReady ? 'visible' : 'hidden' }}
        >
          {variants.map((variant) => {
            const isActive = variant.id === activeVariant?.id
            const font = CV_FONT_OPTIONS.find((option) => option.id === variant.fontId)

            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={variant.label[lang]}
                aria-description={font?.label}
                tabIndex={isActive ? 0 : -1}
                className={`cv-style-switcher__option${isActive ? ' cv-style-switcher__option--active' : ''}`}
                onClick={() => handleSelect(variant.id)}
              >
                <span className="cv-style-switcher__option-text">
                  <span className="cv-style-switcher__option-label">{variant.label[lang]}</span>
                  <span className="cv-style-switcher__option-font" style={{ fontFamily: font?.stack }}>
                    {font?.label}
                  </span>
                </span>
                <span className="cv-style-switcher__strip" aria-hidden="true">
                  {variant.swatches.map((color, index) => (
                    <span key={index} className="cv-style-switcher__chip" style={{ background: color }} />
                  ))}
                </span>
                {isActive ? <Check size={15} strokeWidth={2.5} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default CvStyleSwitcher
