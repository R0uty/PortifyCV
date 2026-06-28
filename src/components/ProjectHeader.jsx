import { getUiTheme } from '../utils/designSystem'

function ProjectHeader({
  theme = 'light',
  activeExport = '',
  isActionBusy = false,
  onExport = () => {},
}) {
  const ui = getUiTheme(theme)
  const primaryActionButtonClassName =
    'action-button action-button--primary rounded-full border px-4 py-2.5 text-sm font-semibold transition'
  const secondaryActionButtonClassName =
    'action-button action-button--secondary rounded-full border px-4 py-2.5 text-sm font-semibold transition'

  return (
    <header className="project-header print:hidden">
      <div className="project-header__container mx-auto w-full max-w-[110rem] px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        <div className={`project-header__inner ${ui.surfaceStrong}`}>
          <div className="project-header__content">
            <div className="project-header__heading">
              <p className="brand-mark accent-text">PortifyCV</p>
              <p className={`mt-2 text-sm font-medium leading-relaxed ${ui.textPrimary}`}>
                Build and export your cv for free
              </p>
            </div>
            <div className="project-header__actions">
              <button
                type="button"
                className={`${primaryActionButtonClassName} accent-border accent-surface accent-text-strong`}
                disabled={isActionBusy}
                onClick={() => onExport('pdf-designer')}
              >
                {activeExport === 'pdf-designer' ? 'Exporting PDF...' : 'Export PDF'}
              </button>
              <button
                type="button"
                className={`${secondaryActionButtonClassName} ${ui.button}`}
                disabled={isActionBusy}
                onClick={() => onExport('html')}
              >
                {activeExport === 'html' ? 'Exporting HTML...' : 'Export HTML'}
              </button>
              <button
                type="button"
                className={`${secondaryActionButtonClassName} ${ui.button}`}
                disabled={isActionBusy}
                onClick={() => onExport('json')}
              >
                {activeExport === 'json' ? 'Exporting JSON...' : 'Export JSON'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ProjectHeader
