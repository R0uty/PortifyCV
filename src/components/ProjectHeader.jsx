
function ProjectHeader({
  activeExport = '',
  isActionBusy = false,
  locale = 'en',
  canUndo = false,
  canRedo = false,
  onReturn = () => {},
  onLocaleChange = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onExport = () => {},
}) {
  const isFinnish = locale === 'fi'
  const primaryActionButtonClassName =
    'action-button action-button--primary border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition'

  return (
    <header className="project-header print:hidden">
      <div className="project-header__container">
        <div className="project-header__content">
          <div className="project-header__left">
            <button
              type="button"
              className="action-button action-button--secondary border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition"
              onClick={onReturn}
            >
              {isFinnish ? 'Takaisin' : 'Return'}
            </button>
            <button
              type="button"
              className="action-button action-button--secondary border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition"
              onClick={onUndo}
              disabled={!canUndo}
            >
              {isFinnish ? 'Kumoa' : 'Undo'}
            </button>
            <button
              type="button"
              className="action-button action-button--secondary border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition"
              onClick={onRedo}
              disabled={!canRedo}
            >
              {isFinnish ? 'Tee uudelleen' : 'Redo'}
            </button>
          </div>
          <div className="project-header__actions">
            <button
              type="button"
              className="action-button action-button--secondary border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition"
              onClick={() => onLocaleChange(isFinnish ? 'en' : 'fi')}
            >
              {isFinnish ? 'EN' : 'FI'}
            </button>
            <button
              type="button"
              className={primaryActionButtonClassName}
              disabled={isActionBusy}
              onClick={() => onExport('pdf-designer')}
            >
              {activeExport === 'pdf-designer'
                ? isFinnish ? 'Viedään...' : 'Exporting...'
                : isFinnish ? 'Vie PDF' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ProjectHeader
