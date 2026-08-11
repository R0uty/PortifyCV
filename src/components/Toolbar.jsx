import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Link2,
  Maximize2,
  Minimize2,
  Printer,
  Redo2,
  Search,
  Smartphone,
  Undo2,
} from 'lucide-react'

import Logo from './Logo'

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
  onSelectTemplate = () => {},
  templateSelectRef,
  searchQuery = '',
  onSearchChange = () => {},
  onPrint = () => {},
  isFullscreenPreview = false,
  onToggleFullscreenPreview = () => {},
  isResponsivePreview = false,
  onToggleResponsivePreview = () => {},
  activeExport = '',
  isActionBusy = false,
  onExport = () => {},
  onCopyShareLink = () => {},
}) {
  const isFinnish = locale === 'fi'
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
  const exportMenuRef = useRef(null)

  useEffect(() => {
    if (!isExportMenuOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsExportMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExportMenuOpen])

  function handleExportSelect(format) {
    setIsExportMenuOpen(false)
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
          <select
            ref={templateSelectRef}
            className="app-toolbar__select"
            value={selectedTemplateId}
            onChange={(event) => onSelectTemplate(event.target.value)}
            aria-label={isFinnish ? 'Valitse pohja' : 'Select template'}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="app-toolbar__icon-button app-toolbar__icon-button--text"
            onClick={() => onLocaleChange(isFinnish ? 'en' : 'fi')}
            aria-label={isFinnish ? 'Vaihda kieli' : 'Switch language'}
            title={isFinnish ? 'Vaihda kieli' : 'Switch language'}
          >
            {isFinnish ? 'EN' : 'FI'}
          </button>

          <button
            type="button"
            className="app-toolbar__icon-button"
            onClick={onPrint}
            aria-label={isFinnish ? 'Tulosta' : 'Print'}
            title={isFinnish ? 'Tulosta' : 'Print'}
          >
            <Printer size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`app-toolbar__icon-button${isResponsivePreview ? ' app-toolbar__icon-button--active' : ''}`}
            onClick={onToggleResponsivePreview}
            aria-pressed={isResponsivePreview}
            aria-label={isFinnish ? 'Responsiivinen esikatselu' : 'Responsive preview'}
            title={isFinnish ? 'Responsiivinen esikatselu' : 'Responsive preview'}
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
            className="app-toolbar__icon-button"
            disabled={isActionBusy}
            onClick={onCopyShareLink}
            aria-label={isFinnish ? 'Kopioi jakolinkki' : 'Copy share link'}
            title={isFinnish ? 'Kopioi jakolinkki' : 'Copy share link'}
          >
            <Link2 size={16} strokeWidth={2} aria-hidden="true" />
          </button>

          <div className="app-toolbar__export" ref={exportMenuRef}>
            <button
              type="button"
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
              <div className="app-toolbar__export-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('pdf-designer')}
                >
                  PDF
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('html')}
                >
                  HTML
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-toolbar__export-item"
                  disabled={isActionBusy}
                  onClick={() => handleExportSelect('json')}
                >
                  JSON
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
