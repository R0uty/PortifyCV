import { useEffect, useRef, useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'

import {
  CV_HEADING_COLOR_PRESETS,
  CV_HEADING_COLOR_SEED,
  isValidCvHeadingColor,
} from '../utils/cvHeadingColors'
import { useAnchoredPanelPosition } from '../hooks/useAnchoredPanelPosition'

// Toolbar's heading-color picker, next to the font switcher — same
// trigger-button + panel shape as CvFontSwitcher.jsx, except the panel holds
// a native <input type="color"> (the browser's own adjustable color picker,
// with an eyedropper in most browsers) plus a synced hex field, rather than
// a fixed set of swatches — the user picks any color, not from a palette.
function CvHeadingColorSwitcher({
  color = '',
  onSelectColor = () => {},
  locale = 'en',
}) {
  const isFinnish = locale === 'fi'
  const [isOpen, setIsOpen] = useState(false)
  const [hexDraft, setHexDraft] = useState(color)
  // Keeps the hex field in sync when `color` changes from outside typing —
  // e.g. the native color-wheel input, or a reset — without the effect-based
  // setState React's lint flags; comparing against the last-seen prop during
  // render is the documented "adjust state on prop change" pattern.
  const [lastColorProp, setLastColorProp] = useState(color)
  if (color !== lastColorProp) {
    setLastColorProp(color)
    setHexDraft(color)
  }
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const colorInputValue = /^#[0-9a-fA-F]{6}$/.test(color) ? color : CV_HEADING_COLOR_SEED
  const activePreset = CV_HEADING_COLOR_PRESETS.find(
    (preset) => preset.color.toLowerCase() === color.toLowerCase(),
  )
  const triggerLabel = activePreset
    ? activePreset.label[locale] ?? activePreset.label.en
    : color || (isFinnish ? 'Oletus' : 'Default')
  const { style: panelPosition, ready: panelReady } = useAnchoredPanelPosition(isOpen, triggerRef, panelRef)

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

  function handleBlur(event) {
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  // Only commits to onSelectColor on blur/Enter, not on every keystroke —
  // committing mid-typing would round-trip through the parent and back,
  // resyncing hexDraft to the (now-stale) normalized value and clobbering
  // whatever the user was about to type next.
  function handleHexChange(event) {
    setHexDraft(event.target.value)
  }

  function commitHexDraft() {
    const value = hexDraft.trim()
    const normalized = value.startsWith('#') ? value : `#${value}`
    if (value !== '' && isValidCvHeadingColor(normalized) && normalized !== '#') {
      onSelectColor(normalized)
    } else {
      setHexDraft(color)
    }
  }

  function handleHexKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitHexDraft()
    }
  }

  function handleReset() {
    onSelectColor('')
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="cv-heading-color-switcher" ref={containerRef} onBlur={handleBlur}>
      <button
        type="button"
        ref={triggerRef}
        className="cv-heading-color-switcher__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="sr-only">{isFinnish ? 'Valitse otsikoiden väri: ' : 'Select heading color: '}</span>
        <span
          className="cv-heading-color-switcher__swatch"
          style={{ background: color || 'var(--app-surface-strong)' }}
          aria-hidden="true"
        />
        <span className="cv-heading-color-switcher__trigger-label">
          {triggerLabel}
        </span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          className="cv-heading-color-switcher__panel"
          role="dialog"
          aria-label={isFinnish ? 'Valitse otsikoiden väri' : 'Select heading color'}
          ref={panelRef}
          style={{ ...panelPosition, visibility: panelReady ? 'visible' : 'hidden' }}
        >
          <div
            className="cv-heading-color-switcher__presets"
            role="group"
            aria-label={isFinnish ? 'Valmiit värit' : 'Preset colors'}
          >
            {CV_HEADING_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                className={`cv-heading-color-switcher__preset${
                  preset.color.toLowerCase() === color.toLowerCase() ? ' cv-heading-color-switcher__preset--active' : ''
                }`}
                style={{ background: preset.color }}
                aria-pressed={preset.color.toLowerCase() === color.toLowerCase()}
                aria-label={preset.label[locale] ?? preset.label.en}
                title={preset.label[locale] ?? preset.label.en}
                onClick={() => onSelectColor(preset.color)}
              />
            ))}
          </div>

          <label className="cv-heading-color-switcher__picker-row">
            <input
              type="color"
              className="cv-heading-color-switcher__native-input"
              value={colorInputValue}
              onChange={(event) => onSelectColor(event.target.value)}
              aria-label={isFinnish ? 'Väripyörä' : 'Color wheel'}
            />
            <input
              type="text"
              className="cv-heading-color-switcher__hex-input"
              value={hexDraft}
              onChange={handleHexChange}
              onBlur={commitHexDraft}
              onKeyDown={handleHexKeyDown}
              placeholder="#1f2937"
              spellCheck={false}
              aria-label={isFinnish ? 'Väri heksana' : 'Hex color'}
            />
          </label>

          <button
            type="button"
            className="cv-heading-color-switcher__reset"
            onClick={handleReset}
            disabled={!color}
          >
            <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
            {isFinnish ? 'Käytä pohjan oletusta' : 'Use template default'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default CvHeadingColorSwitcher
