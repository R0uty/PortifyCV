import { getUiTheme } from '../utils/designSystem'

function ProjectHeader({
  theme = 'light',
  activeExport = '',
  isActionBusy = false,
  locale = 'en',
  onLocaleChange = () => {},
  onExport = () => {},
}) {
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'
  const primaryActionButtonClassName =
    'action-button action-button--primary rounded-full border px-4 py-2.5 text-sm font-semibold transition'

  return (
    <header className="project-header print:hidden">
      <div className="project-header__container mx-auto w-full max-w-[110rem] px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        <div className={`project-header__inner ${ui.surfaceStrong}`}>
          <div className="project-header__content">
            <div className="project-header__heading">
              <h1 className="brand-mark">
                <span className="brand-mark__slashes" aria-hidden="true">
                  //
                </span>{' '}
                PortifyCV
              </h1>
              <p className={`mt-2 text-sm font-medium leading-relaxed ${ui.textPrimary}`}>
                {isFinnish ? 'Rakenna ja vie CV:si ilmaiseksi' : 'Build and export your cv for free'}
              </p>
            </div>
            <div className="project-header__actions">
              <button
                type="button"
                className={`action-button action-button--secondary rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
                onClick={() => onLocaleChange(isFinnish ? 'en' : 'fi')}
              >
                {isFinnish ? 'EN' : 'FI'}
              </button>
              <button
                type="button"
                className={`${primaryActionButtonClassName} accent-border accent-surface accent-text-strong`}
                disabled={isActionBusy}
                onClick={() => onExport('pdf-designer')}
              >
                {activeExport === 'pdf-designer'
                  ? isFinnish ? 'Viedään PDF...' : 'Exporting PDF...'
                  : isFinnish ? 'Vie PDF' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ProjectHeader
