import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  Maximize2,
  MoreHorizontal,
  Redo2,
  Search,
  Settings,
  Smartphone,
  Trash2,
  Undo2,
} from 'lucide-react'

import Logo from './Logo'
import LocaleFlagIcon from './LocaleFlagIcon'
import CvFontSwitcher from './CvFontSwitcher'
import CvStyleSwitcher from './CvStyleSwitcher'
import CvHeadingColorSwitcher from './CvHeadingColorSwitcher'

// Open/close plumbing shared by the toolbar's three popovers (Design,
// More, Export): an outside click, Escape or tabbing out closes one, and
// opening it moves focus to its first item (the ARIA menu-button pattern,
// so keyboard users don't have to Tab past the trigger). `itemSelector`
// picks the focusable items for that and for the arrow keys.
function useToolbarPopover(itemSelector) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  function getItems() {
    return panelRef.current ? [...panelRef.current.querySelectorAll(itemSelector)].filter((item) => !item.disabled) : []
  }

  function focusItem(index) {
    const items = getItems()
    if (!items.length) {
      return
    }
    const clamped = ((index % items.length) + items.length) % items.length
    items[clamped].focus()
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    focusItem(0)

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      // The Design panel holds dropdowns of its own: Escape closes the
      // open one first, and only the next Escape closes the panel.
      if (event.key !== 'Escape' || panelRef.current?.querySelector('[aria-expanded="true"]')) {
        return
      }
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
    // focusItem reads refs only; running this again on its identity
    // would steal focus back to the first item on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function handleMenuKeyDown(event) {
    const items = getItems()
    const currentIndex = items.indexOf(document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem(currentIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem(currentIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusItem(items.length - 1)
    }
  }

  // Tabbing out (not just Escape or an outside click) also closes it —
  // checked via the blur target rather than intercepting Tab itself, since
  // the DOM the browser computes default Tab order from is a frame ahead
  // of whatever this component's state update would remove from it. A
  // blur with no target is a click on something unfocusable, such as a
  // caption in the Design panel: an outside one is the pointerdown
  // handler's to close, an inside one keeps the panel open.
  function handleBlur(event) {
    if (event.relatedTarget && containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  function close() {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    close,
    handleBlur,
    handleMenuKeyDown,
    containerRef,
    triggerRef,
    panelRef,
  }
}

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
  styleVariants = [],
  styleVariantId = 'default',
  isStyleVariantModified = false,
  onSelectStyleVariant = () => {},
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
  onOpenCoverLetter = () => {},
  onClearCv = () => {},
  isClearArmed = false,
}) {
  const isFinnish = locale === 'fi'
  const {
    isOpen: isExportOpen,
    toggle: exportToggle,
    close: exportClose,
    handleBlur: exportHandleBlur,
    handleMenuKeyDown: exportHandleMenuKeyDown,
    containerRef: exportContainerRef,
    triggerRef: exportTriggerRef,
    panelRef: exportPanelRef,
  } = useToolbarPopover('[role="menuitem"]')
  const {
    isOpen: isDesignOpen,
    toggle: designToggle,
    handleBlur: designHandleBlur,
    containerRef: designContainerRef,
    triggerRef: designTriggerRef,
    panelRef: designPanelRef,
  } = useToolbarPopover('button')
  const {
    isOpen: isMoreOpen,
    toggle: moreToggle,
    close: moreClose,
    handleBlur: moreHandleBlur,
    handleMenuKeyDown: moreHandleMenuKeyDown,
    containerRef: moreContainerRef,
    triggerRef: moreTriggerRef,
    panelRef: morePanelRef,
  } = useToolbarPopover('[role="menuitem"], [role="menuitemcheckbox"]')

  function handleExportSelect(format) {
    exportClose()
    onExport(format)
  }

  function handleCopyShareLink() {
    exportClose()
    onCopyShareLink()
  }

  function handleMoreSelect(action) {
    moreClose()
    action()
  }

  // Clear CV stays two-step (ResumeBuilderPage's handleResetForm): the
  // first pick arms it and keeps the menu open on "Confirm clear", the
  // second clears and closes it.
  function handleClearSelect() {
    if (isClearArmed) {
      moreClose()
    }
    onClearCv()
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

        {/* Section search filters Classic mode's nav rail, which Direct
            Edit does not render (its Sections popover lists the sections
            instead), so the box only shows in Classic. */}
        {builderMode === 'classic' ? (
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
        ) : null}

        <div className="app-toolbar__spacer" />

        <div className="app-toolbar__group app-toolbar__group--actions">
          <div className="app-toolbar__control-cluster">
            <div className="app-toolbar__mode-switch" role="tablist" aria-label={locale === 'fi' ? 'Muokkaustila' : 'Builder mode'}>
              <button
                type="button"
                role="tab"
                aria-selected={builderMode === 'direct'}
                className={`app-toolbar__mode-switch-btn${builderMode === 'direct' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
                onClick={() => onSetBuilderMode('direct')}
              >
                {locale === 'fi' ? 'Suora muokkaus' : 'Direct Edit'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={builderMode === 'classic'}
                className={`app-toolbar__mode-switch-btn${builderMode === 'classic' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
                onClick={() => onSetBuilderMode('classic')}
              >
                {locale === 'fi' ? 'Klassinen' : 'Classic'}
              </button>
            </div>

            <button
              type="button"
              className="app-toolbar__template-trigger"
              onClick={onOpenTemplateGallery}
            >
              {/* Visually hidden so sighted users see "Template" and the
                  name, while screen readers get "Select template: X". */}
              <span className="sr-only">{isFinnish ? 'Valitse pohja: ' : 'Select template: '}</span>
              <span className="app-toolbar__trigger-caption" aria-hidden="true">{isFinnish ? 'Pohja' : 'Template'}</span>
              <span className="app-toolbar__template-trigger-label">
                {templates.find((template) => template.id === selectedTemplateId)?.label}
              </span>
              <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
            </button>

            {/* The look of the current template (1.6.67): style, font and
                headings colour used to be three captioned dropdowns in the
                toolbar, which pushed it onto two rows on most laptop
                widths. They share one panel now; each keeps its own
                dropdown inside it. */}
            <div className="app-toolbar__popover" ref={designContainerRef} onBlur={designHandleBlur}>
              <button
                type="button"
                ref={designTriggerRef}
                className="app-toolbar__design-trigger"
                aria-haspopup="true"
                aria-expanded={isDesignOpen}
                onClick={designToggle}
              >
                {isFinnish ? 'Ulkoasu' : 'Design'}
                {isStyleVariantModified ? (
                  <span className="app-toolbar__modified-dot" title={isFinnish ? 'Muokattu' : 'Modified'}>
                    <span className="sr-only">{isFinnish ? ', muokattu' : ', modified'}</span>
                  </span>
                ) : null}
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>

              {isDesignOpen ? (
                <div
                  className="app-toolbar__menu app-toolbar__design-panel"
                  role="group"
                  aria-label={isFinnish ? 'Ulkoasu' : 'Design'}
                  ref={designPanelRef}
                >
                  <div className="app-toolbar__design-row">
                    <span className="app-toolbar__design-label">{isFinnish ? 'Tyyli' : 'Style'}</span>
                    <CvStyleSwitcher
                      variants={styleVariants}
                      variantId={styleVariantId}
                      isModified={isStyleVariantModified}
                      onSelectVariant={onSelectStyleVariant}
                      locale={locale}
                    />
                  </div>
                  <div className="app-toolbar__design-row">
                    <span className="app-toolbar__design-label">{isFinnish ? 'Fontti' : 'Font'}</span>
                    <CvFontSwitcher
                      fontId={cvFontId}
                      onSelectFont={onCvFontChange}
                      locale={locale}
                    />
                  </div>
                  <div className="app-toolbar__design-row">
                    <span className="app-toolbar__design-label">{isFinnish ? 'Otsikot' : 'Headings'}</span>
                    <CvHeadingColorSwitcher
                      color={cvHeadingColor}
                      onSelectColor={onCvHeadingColorChange}
                      locale={locale}
                    />
                  </div>
                </div>
              ) : null}
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

          <div className="app-toolbar__popover" ref={moreContainerRef} onBlur={moreHandleBlur}>
            <button
              type="button"
              ref={moreTriggerRef}
              className="app-toolbar__icon-button"
              aria-haspopup="menu"
              aria-expanded={isMoreOpen}
              aria-label={isFinnish ? 'Lisää toimintoja' : 'More actions'}
              title={isFinnish ? 'Lisää toimintoja' : 'More actions'}
              onClick={moreToggle}
            >
              <MoreHorizontal size={16} strokeWidth={2} aria-hidden="true" />
            </button>

            {isMoreOpen ? (
              <div
                className="app-toolbar__menu"
                role="menu"
                aria-label={isFinnish ? 'Lisää toimintoja' : 'More actions'}
                ref={morePanelRef}
                onKeyDown={moreHandleMenuKeyDown}
              >
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={isResponsivePreview}
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onToggleResponsivePreview)}
                  title={isFinnish
                    ? 'Näytä pohja kapealla leveydellä (kuten HTML-vienti puhelimessa)'
                    : 'Show the template at a narrow width (like the HTML export on a phone)'}
                >
                  <Smartphone size={15} strokeWidth={2} aria-hidden="true" />
                  {isFinnish ? 'Kapea esikatselu' : 'Narrow preview'}
                </button>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={isFullscreenPreview}
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onToggleFullscreenPreview)}
                >
                  <Maximize2 size={15} strokeWidth={2} aria-hidden="true" />
                  {isFinnish ? 'Koko näytön esikatselu' : 'Fullscreen preview'}
                </button>
                {/* The nav rail has Cover letter and Settings from lg up;
                    below that this menu is the way in. */}
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onOpenCoverLetter)}
                >
                  <Mail size={15} strokeWidth={2} aria-hidden="true" />
                  {isFinnish ? 'Hakemuskirje' : 'Cover letter'}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onOpenSettings)}
                >
                  <Settings size={15} strokeWidth={2} aria-hidden="true" />
                  {isFinnish ? 'Asetukset' : 'Settings'}
                </button>
                <div className="app-toolbar__menu-separator" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className={`app-toolbar__menu-item app-toolbar__menu-item--danger${isClearArmed ? ' app-toolbar__menu-item--armed' : ''}`}
                  disabled={isActionBusy}
                  aria-live="polite"
                  onClick={handleClearSelect}
                >
                  <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  {isClearArmed
                    ? isFinnish ? 'Vahvista tyhjennys' : 'Confirm clear'
                    : isFinnish ? 'Tyhjennä CV' : 'Clear CV'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="app-toolbar__popover" ref={exportContainerRef} onBlur={exportHandleBlur}>
            <button
              type="button"
              ref={exportTriggerRef}
              className="app-toolbar__primary"
              disabled={isActionBusy}
              aria-haspopup="menu"
              aria-expanded={isExportOpen}
              onClick={exportToggle}
            >
              {activeExport
                ? isFinnish ? 'Viedään...' : 'Exporting...'
                : isFinnish ? 'Vie' : 'Export'}
              <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
            </button>

            {isExportOpen ? (
              <div
                className="app-toolbar__menu"
                role="menu"
                ref={exportPanelRef}
                onKeyDown={exportHandleMenuKeyDown}
              >
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
                <div className="app-toolbar__menu-separator" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={handleCopyShareLink}
                >
                  {isFinnish ? 'Kopioi jakolinkki' : 'Copy share link'}
                  <span className="app-toolbar__export-item-hint">
                    {isFinnish ? 'CV kulkee linkissä, kuvat jäävät pois' : 'The CV travels in the link, without photos'}
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
