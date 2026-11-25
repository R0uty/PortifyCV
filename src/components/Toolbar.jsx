import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FolderOpen,
  Mail,
  Maximize2,
  MoreHorizontal,
  Redo2,
  Save,
  Search,
  Send,
  Settings,
  Smartphone,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react'

import Logo from './Logo'
import LocaleFlagIcon from './LocaleFlagIcon'
import CvFontSwitcher from './CvFontSwitcher'
import CvStyleSwitcher from './CvStyleSwitcher'
import CvHeadingColorSwitcher from './CvHeadingColorSwitcher'
import { builderShell } from '../i18n/builderShell'

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
  atsFriendlyMode = false,
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
  onOpenImport,
  savedCvStatus = null,
  onSaveCv = () => {},
  onOpenSavedCvs = () => {},
  onMarkApplied = () => {},
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
            aria-label={builderShell.t(locale, 'toolbar.returnLabel')}
            title={builderShell.t(locale, 'toolbar.returnTitle')}
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
            aria-label={builderShell.t(locale, 'toolbar.undo')}
            title={builderShell.t(locale, 'toolbar.undo')}
          >
            <Undo2 size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="app-toolbar__icon-button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label={builderShell.t(locale, 'toolbar.redo')}
            title={builderShell.t(locale, 'toolbar.redo')}
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
                placeholder={builderShell.t(locale, 'toolbar.searchPlaceholder')}
                aria-label={builderShell.t(locale, 'toolbar.searchLabel')}
              />
            </label>
          </div>
        ) : null}

        <div className="app-toolbar__spacer" />

        <div className="app-toolbar__group app-toolbar__group--actions">
          <div className="app-toolbar__control-cluster">
            {/* A tablist's keys (1.6.85): one tab stop, on the selected
                mode; the arrow keys, Home and End move between the two and
                switch. It had the roles without the keyboard behaviour. */}
            <div
              className="app-toolbar__mode-switch"
              role="tablist"
              aria-label={builderShell.t(locale, 'mode.label')}
              onKeyDown={(event) => {
                const next = {
                  ArrowLeft: builderMode === 'direct' ? 'classic' : 'direct',
                  ArrowRight: builderMode === 'direct' ? 'classic' : 'direct',
                  Home: 'direct',
                  End: 'classic',
                }[event.key]
                if (!next) return
                event.preventDefault()
                onSetBuilderMode(next)
                event.currentTarget.querySelector(`[data-builder-mode="${next}"]`)?.focus()
              }}
            >
              <button
                type="button"
                role="tab"
                data-builder-mode="direct"
                tabIndex={builderMode === 'direct' ? 0 : -1}
                aria-selected={builderMode === 'direct'}
                className={`app-toolbar__mode-switch-btn${builderMode === 'direct' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
                onClick={() => onSetBuilderMode('direct')}
              >
                {builderShell.t(locale, 'mode.directEdit')}
              </button>
              <button
                type="button"
                role="tab"
                data-builder-mode="classic"
                tabIndex={builderMode === 'classic' ? 0 : -1}
                aria-selected={builderMode === 'classic'}
                className={`app-toolbar__mode-switch-btn${builderMode === 'classic' ? ' app-toolbar__mode-switch-btn--active' : ''}`}
                onClick={() => onSetBuilderMode('classic')}
              >
                {builderShell.t(locale, 'mode.classic')}
              </button>
            </div>

            <button
              type="button"
              className="app-toolbar__template-trigger"
              onClick={onOpenTemplateGallery}
            >
              {/* Visually hidden so sighted users see "Template" and the
                  name, while screen readers get "Select template: X". */}
              <span className="sr-only">{builderShell.t(locale, 'template.select')}</span>
              <span className="app-toolbar__trigger-caption" aria-hidden="true">{builderShell.t(locale, 'template.caption')}</span>
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
                {builderShell.t(locale, 'design.label')}
                {isStyleVariantModified ? (
                  <span className="app-toolbar__modified-dot" title={builderShell.t(locale, 'design.modified')}>
                    <span className="sr-only">{builderShell.t(locale, 'design.modifiedSr')}</span>
                  </span>
                ) : null}
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>

              {isDesignOpen ? (
                <div
                  className="app-toolbar__menu app-toolbar__design-panel"
                  role="group"
                  aria-label={builderShell.t(locale, 'design.label')}
                  ref={designPanelRef}
                >
                  <div className="app-toolbar__design-row">
                    <span className="app-toolbar__design-label">{builderShell.t(locale, 'design.style')}</span>
                    <CvStyleSwitcher
                      variants={styleVariants}
                      variantId={styleVariantId}
                      isModified={isStyleVariantModified}
                      onSelectVariant={onSelectStyleVariant}
                      locale={locale}
                    />
                  </div>
                  <div className="app-toolbar__design-row">
                    <span className="app-toolbar__design-label">{builderShell.t(locale, 'design.font')}</span>
                    <CvFontSwitcher
                      fontId={cvFontId}
                      onSelectFont={onCvFontChange}
                      locale={locale}
                    />
                  </div>
                  <div className="app-toolbar__design-row">
                    <span className="app-toolbar__design-label">{builderShell.t(locale, 'design.headings')}</span>
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
            aria-label={builderShell.t(locale, 'language.switch')}
            title={builderShell.t(locale, 'language.switch')}
          >
            <LocaleFlagIcon locale={isFinnish ? 'fi' : 'en'} className="app-toolbar__locale-flag" />
            {builderShell.t(locale, 'language.code')}
          </button>

          {/* Save on this device (1.7.1). Nothing is stored until this is
              pressed; once the CV is saved it opens My CVs instead. */}
          {savedCvStatus ? (
            <button
              type="button"
              className={`app-toolbar__save${savedCvStatus.needsAttention ? ' app-toolbar__save--attention' : savedCvStatus.isSaved ? ' app-toolbar__save--saved' : ''}`}
              onClick={onSaveCv}
              aria-label={savedCvStatus.needsAttention
                ? builderShell.t(locale, 'save.pausedLabel', { name: savedCvStatus.name })
                : savedCvStatus.isSaved
                  ? builderShell.t(locale, 'save.savedLabel', { name: savedCvStatus.name })
                  : builderShell.t(locale, 'save.saveOnDevice')}
              title={savedCvStatus.needsAttention
                ? builderShell.t(locale, 'save.pausedTitle')
                : savedCvStatus.isSaved
                  ? builderShell.t(locale, 'save.savedLabel', { name: savedCvStatus.name })
                  : builderShell.t(locale, 'save.saveOnDevice')}
            >
              {savedCvStatus.isSaved && !savedCvStatus.needsAttention
                ? <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                : <Save size={15} strokeWidth={2} aria-hidden="true" />}
              <span className="app-toolbar__save-label" aria-hidden="true">
                {savedCvStatus.isSaved && !savedCvStatus.needsAttention
                  ? builderShell.t(locale, 'save.saved')
                  : builderShell.t(locale, 'save.save')}
              </span>
            </button>
          ) : null}

          <div className="app-toolbar__popover" ref={moreContainerRef} onBlur={moreHandleBlur}>
            <button
              type="button"
              ref={moreTriggerRef}
              className="app-toolbar__icon-button"
              aria-haspopup="menu"
              aria-expanded={isMoreOpen}
              aria-label={builderShell.t(locale, 'more.label')}
              title={builderShell.t(locale, 'more.label')}
              onClick={moreToggle}
            >
              <MoreHorizontal size={16} strokeWidth={2} aria-hidden="true" />
            </button>

            {isMoreOpen ? (
              <div
                className="app-toolbar__menu"
                role="menu"
                aria-label={builderShell.t(locale, 'more.label')}
                ref={morePanelRef}
                onKeyDown={moreHandleMenuKeyDown}
              >
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={isResponsivePreview}
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onToggleResponsivePreview)}
                  title={builderShell.t(locale, 'more.narrowPreviewTitle')}
                >
                  <Smartphone size={15} strokeWidth={2} aria-hidden="true" />
                  {builderShell.t(locale, 'more.narrowPreview')}
                </button>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={isFullscreenPreview}
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onToggleFullscreenPreview)}
                >
                  <Maximize2 size={15} strokeWidth={2} aria-hidden="true" />
                  {builderShell.t(locale, 'more.fullscreenPreview')}
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
                  {builderShell.t(locale, 'more.coverLetter')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onOpenSettings)}
                >
                  <Settings size={15} strokeWidth={2} aria-hidden="true" />
                  {builderShell.t(locale, 'more.settings')}
                </button>
                {/* Direct Edit only: Classic has Import CV in its form
                    column (1.6.80). */}
                {builderMode === 'direct' && onOpenImport ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="app-toolbar__menu-item"
                    onClick={() => handleMoreSelect(onOpenImport)}
                  >
                    <Upload size={15} strokeWidth={2} aria-hidden="true" />
                    {builderShell.t(locale, 'more.importCv')}
                  </button>
                ) : null}
                {/* Phones only (CSS): the toolbar's Save button has no
                    room there, so it moves to the top of this menu. */}
                {savedCvStatus ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="app-toolbar__menu-item app-toolbar__menu-item--save"
                    onClick={() => handleMoreSelect(onSaveCv)}
                  >
                    {savedCvStatus.isSaved && !savedCvStatus.needsAttention
                      ? <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                      : <Save size={15} strokeWidth={2} aria-hidden="true" />}
                    {savedCvStatus.needsAttention
                      ? builderShell.t(locale, 'save.pausedMenu')
                      : savedCvStatus.isSaved
                        ? builderShell.t(locale, 'save.savedMenu', { name: savedCvStatus.name })
                        : builderShell.t(locale, 'save.saveOnDevice')}
                  </button>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onOpenSavedCvs)}
                >
                  <FolderOpen size={15} strokeWidth={2} aria-hidden="true" />
                  {builderShell.t(locale, 'more.myCvs')}
                  {savedCvStatus?.count ? ` (${savedCvStatus.count})` : ''}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__menu-item"
                  onClick={() => handleMoreSelect(onMarkApplied)}
                >
                  <Send size={15} strokeWidth={2} aria-hidden="true" />
                  {builderShell.t(locale, 'more.markApplied')}
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
                    ? builderShell.t(locale, 'more.confirmClear')
                    : builderShell.t(locale, 'more.clearCv')}
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
                ? builderShell.t(locale, 'export.exporting')
                : builderShell.t(locale, 'export.export')}
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
                    {atsFriendlyMode
                      ? builderShell.t(locale, 'export.pdfAtsHint')
                      : builderShell.t(locale, 'export.pdfDesignHint')}
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
                    {builderShell.t(locale, 'export.htmlHint')}
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
                    {builderShell.t(locale, 'export.jsonHint')}
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
                    {builderShell.t(locale, 'export.docxHint')}
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
                  {builderShell.t(locale, 'export.shareLink')}
                  <span className="app-toolbar__export-item-hint">
                    {builderShell.t(locale, 'export.shareLinkHint')}
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
