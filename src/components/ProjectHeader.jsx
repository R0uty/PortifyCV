import { getUiTheme } from '../utils/designSystem'

function ProjectHeader({
  theme = 'light',
  activeExport = '',
  isActionBusy = false,
  locale = 'en',
  onReturn = () => {},
  onLocaleChange = () => {},
  onToggleTheme = () => {},
  onExport = () => {},
}) {
  const ui = getUiTheme(theme)
  const isFinnish = locale === 'fi'
  const isDark = theme === 'dark'
  const primaryActionButtonClassName =
    'action-button action-button--primary rounded-full border px-4 py-2.5 text-sm font-semibold transition'

  return (
    <header className={`project-header project-header--${theme} print:hidden`}>
      <div className="project-header__container w-full">
        <div className={`project-header__inner ${ui.surfaceStrong}`}>
          <div className="project-header__content">
            <div className="project-header__left">
              <button
                type="button"
                className={`action-button action-button--secondary rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
                onClick={onReturn}
              >
                {isFinnish ? 'Takaisin' : 'Return'}
              </button>
            </div>
            <div className="project-header__actions">
              <button
                type="button"
                className={`action-button action-button--secondary rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
                onClick={onToggleTheme}
                aria-label={isDark
                  ? isFinnish ? 'Vaihda vaaleaan teemaan' : 'Switch to light theme'
                  : isFinnish ? 'Vaihda tummaan teemaan' : 'Switch to dark theme'}
                title={isDark
                  ? isFinnish ? 'Vaihda vaaleaan teemaan' : 'Switch to light theme'
                  : isFinnish ? 'Vaihda tummaan teemaan' : 'Switch to dark theme'}
              >
                {isDark ? (isFinnish ? 'Vaalea' : 'Light') : (isFinnish ? 'Tumma' : 'Dark')}
              </button>
              <button
                type="button"
                className={`action-button action-button--secondary rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
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
