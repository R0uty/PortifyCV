import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Link2,
  Maximize2,
  Minimize2,
  Redo2,
  Search,
  Settings,
  Smartphone,
  Undo2,
} from 'lucide-react'

import Logo from './Logo'
import LocaleFlagIcon from './LocaleFlagIcon'
import CvFontSwitcher from './CvFontSwitcher'
import CvHeadingColorSwitcher from './CvHeadingColorSwitcher'

function Toolbar({
  locale = 'en',
  onReturn = () => {},
  onLocaleChange = () => {},
  canUndo = false,
  canRedo = false,
  onUndo = () => {},
  onRedo = () => {},
  templates = [],
  selectedTemplateId = '',
  onOpenTemplateGallery = () => {},
  builderMode = 'classic',
  onSetBuilderMode = () => {},
  cvFontId = '',
  onCvFontChange = () => {},
  cvHeadingColor = '',
  onCvHeadingColorChange = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  isFullscreenPreview = false,
  onToggleFullscreenPreview = () => {},
  isResponsivePreview = false,
  onToggleResponsivePreview = () => {},
  activeExport = '',
  isActionBusy = false,
  onExport = () => {},
  onCopyShareLink = () => {},
  onOpenSettings = () => {},
}) {
  const isFinnish = locale === 'fi'
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const exportMenuRef = useRef(null)
  const exportTriggerRef = useRef(null)

  function focusExportMenuItem(index) {
    const items = exportMenuRef.current?.querySelectorAll('[role="menuitem"]')
    if (!items?.length) {
      return
    }
    const clamped = ((index % items.length) + items.length) % items.length
    items[clamped].focus()
  }

  useEffect(() => {
    if (!isExportMenuOpen) {
      return undefined
    }

    // ARIA menu-button pattern: opening moves focus into the menu instead of
    // leaving it on the trigger, so keyboard users don't have to Tab past it.
    focusExportMenuItem(0)

    function handlePointerDown(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsExportMenuOpen(false)
        exportTriggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExportMenuOpen])

  function handleExportMenuKeyDown(event) {
    const items = exportMenuRef.current?.querySelectorAll('[role="menuitem"]')
    if (!items?.length) {
      return
    }
    const currentIndex = Array.prototype.indexOf.call(items, document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusExportMenuItem(currentIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusExportMenuItem(currentIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusExportMenuItem(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusExportMenuItem(items.length - 1)
    }
  }

  // Tabbing out (not just Escape or an outside click) should also close the
  // menu — checked via the blur target rather than intercepting Tab itself,
  // since the DOM the browser computes default Tab order from is a frame
  // ahead of whatever this component's state update would remove from it.
  function handleExportBlur(event) {
    if (exportMenuRef.current && !exportMenuRef.current.contains(event.relatedTarget)) {
      setIsExportMenuOpen(false)
    }
  }

  function handleExportSelect(format) {
    setIsExportMenuOpen(false)
    exportTriggerRef.current?.focus()
    onExport(format)
  }

  return (
    <header className="app-toolbar print:hidden">
      <div className="app-toolbar__inner">
        <div className="app-toolbar__group">
          <button
            type="button"
            className="app-toolbar__icon-button"
            onClick={onReturn}
            aria-label={isFinnish ? 'Takaisin' : 'Return to landing'}
            title={isFinnish ? 'Takaisin' : 'Return'}
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <span className="app-toolbar__title">
            <Logo size={18} />
            PortifyCV
          </span>
        </div>

        <div className="app-toolbar__group">
          <button
            type="button"
            className="app-toolbar__icon-button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label={isFinnish ? 'Kumoa' : 'Undo'}
            title={isFinnish ? 'Kumoa' : 'Undo'}
          >
            <Undo2 size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="app-toolbar__icon-button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label={isFinnish ? 'Tee uudelleen' : 'Redo'}
            title={isFinnish ? 'Tee uudelleen' : 'Redo'}
          >
            <Redo2 size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="app-toolbar__group app-toolbar__group--search">
          <label className="app-toolbar__search">
            <Search size={14} strokeWidth={2} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={isFinnish ? 'Etsi osioita...' : 'Search sections...'}
              aria-label={isFinnish ? 'Etsi osioita' : 'Search sections'}
            />
          </label>
        </div>

        <div className="app-toolbar__spacer" />

        <div className="app-toolbar__group">
          <div className="app-toolbar__control-cluster">
            <div className="app-toolbar__mode-switch" role="tablist" aria-label={locale === 'fi' ? 'Muokkaustila' : 'Builder mode'}>
              <button
                type="button"
                role="tab"
                aria-selected={builderMode === 'classic'}
                className={`app-toolbar__mode-switch-btn${builderMode === 'classic' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
                onClick={() => onSetBuilderMode('classic')}
              >
                {locale === 'fi' ? 'Klassinen' : 'Classic'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={builderMode === 'direct'}
                className={`app-toolbar__mode-switch-btn${builderMode === 'direct' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
                onClick={() => onSetBuilderMode('direct')}
              >
                {locale === 'fi' ? 'Suora muokkaus' : 'Direct Edit'}
              </button>
            </div>

            <div className="app-toolbar__labeled-control">
              <span className="app-toolbar__control-label">{isFinnish ? 'Pohja' : 'Template'}</span>
              <button
                type="button"
                className="app-toolbar__template-trigger"
                onClick={onOpenTemplateGallery}
              >
                {/* Visually hidden so sighted users just see the template name, but
                    screen readers get "Select template: X" instead of only "X". */}
                <span className="sr-only">{isFinnish ? 'Valitse pohja: ' : 'Select template: '}</span>
                <span className="app-toolbar__template-trigger-label">
                  {templates.find((template) => template.id === selectedTemplateId)?.label}
                </span>
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="app-toolbar__labeled-control">
              <span className="app-toolbar__control-label">{isFinnish ? 'Fontti' : 'Font'}</span>
              <CvFontSwitcher
                fontId={cvFontId}
                onSelectFont={onCvFontChange}
                locale={locale}
              />
            </div>

            <div className="app-toolbar__labeled-control">
              <span className="app-toolbar__control-label">{isFinnish ? 'Otsikot' : 'Headings'}</span>
              <CvHeadingColorSwitcher
                color={cvHeadingColor}
                onSelectColor={onCvHeadingColorChange}
                locale={locale}
              />
            </div>
          </div>

          <button
            type="button"
            className="app-toolbar__icon-button app-toolbar__icon-button--text"
            onClick={() => onLocaleChange(isFinnish ? 'en' : 'fi')}
            aria-label={isFinnish ? 'Vaihda kieli' : 'Switch language'}
            title={isFinnish ? 'Vaihda kieli' : 'Switch language'}
          >
            <LocaleFlagIcon locale={isFinnish ? 'fi' : 'en'} className="app-toolbar__locale-flag" />
            {isFinnish ? 'FI' : 'EN'}
          </button>

          <button
            type="button"
            className={`app-toolbar__icon-button${isResponsivePreview ? ' app-toolbar__icon-button--active' : ''}`}
            onClick={onToggleResponsivePreview}
            aria-pressed={isResponsivePreview}
            aria-label={isFinnish ? 'Kapea esikatselu' : 'Narrow preview'}
            title={isFinnish
              ? 'Näytä pohja kapealla leveydellä (kuten HTML-vienti puhelimessa)'
              : 'Show the template at a narrow width (like the HTML export on a phone)'}
          >
            <Smartphone size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`app-toolbar__icon-button${isFullscreenPreview ? ' app-toolbar__icon-button--active' : ''}`}
            onClick={onToggleFullscreenPreview}
            aria-pressed={isFullscreenPreview}
            aria-label={isFinnish ? 'Koko näytön esikatselu' : 'Fullscreen preview'}
            title={isFinnish ? 'Koko näytön esikatselu' : 'Fullscreen preview'}
          >
            {isFullscreenPreview ? (
              <Minimize2 size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Maximize2 size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="app-toolbar__icon-button lg:hidden"
            onClick={onOpenSettings}
            aria-label={isFinnish ? 'Asetukset' : 'Settings'}
            title={isFinnish ? 'Asetukset' : 'Settings'}
          >
            <Settings size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="app-toolbar__icon-button"
            disabled={isActionBusy}
            onClick={onCopyShareLink}
            aria-label={isFinnish ? 'Kopioi jakolinkki' : 'Copy share link'}
            title={isFinnish ? 'Kopioi jakolinkki' : 'Copy share link'}
          >
            <Link2 size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="app-toolbar__export" ref={exportMenuRef} onBlur={handleExportBlur}>
            <button
              type="button"
              ref={exportTriggerRef}
              className="app-toolbar__primary"
              disabled={isActionBusy}
              aria-haspopup="menu"
              aria-expanded={isExportMenuOpen}
              onClick={() => setIsExportMenuOpen((open) => !open)}
            >
              {activeExport
                ? isFinnish ? 'Viedään...' : 'Exporting...'
                : isFinnish ? 'Vie' : 'Export'}
              <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
            </button>

            {isExportMenuOpen ? (
              <div className="app-toolbar__export-menu" role="menu" onKeyDown={handleExportMenuKeyDown}>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('pdf-designer')}
                >
                  PDF
                  <span className="app-toolbar__export-item-hint">
                    {isFinnish ? 'Tulostusvalmis CV, valmis lähetettäväksi' : 'Print-ready CV, ready to send'}
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('html')}
                >
                  HTML
                  <span className="app-toolbar__export-item-hint">
                    {isFinnish ? 'Yksi verkkosivutiedosto, avautuu selaimessa' : 'One web-page file, opens in any browser'}
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('json')}
                >
                  JSON
                  <span className="app-toolbar__export-item-hint">
                    {isFinnish ? 'Varmuuskopio, jonka voi tuoda takaisin' : 'Backup you can import again later'}
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('docx')}
                >
                  Word
                  <span className="app-toolbar__export-item-hint">
                    {isFinnish
                      ? 'Muokattava .docx, toimii kaikkien ATS-järjestelmien kanssa'
                      : 'Editable .docx, works with any ATS'}
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Toolbar
