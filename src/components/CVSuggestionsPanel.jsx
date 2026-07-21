import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function typeClasses(ui, type) {
  if (type === 'warning') {
    return ui.isDark
      ? 'bg-red-500/8 text-red-400'
      : 'bg-gray-50 text-gray-800'
  }

  return ui.isDark
    ? 'bg-white/5 text-gray-100'
    : 'bg-gray-50 text-gray-700'
}

function badgeClasses(ui, type) {
  if (type === 'warning') {
    return ui.isDark
      ? 'bg-red-500/15 text-red-400'
      : 'bg-gray-100 text-gray-700'
  }

  return 'accent-surface accent-text-strong'
}

function CVSuggestionsPanel({
  feedback,
  theme = 'dark',
  locale = 'en',
  onImproveAboutText,
  onImproveExperienceText,
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isFinnish = locale === 'fi'

  const runAction = (action) => {
    if (!action) {
      return
    }

    if (action.type === 'about') {
      onImproveAboutText()
    }

    if (action.type === 'experience') {
      onImproveExperienceText(action.index)
    }
  }

  return (
    <section
      className={`fade-in-up p-5 sm:p-6 print:hidden ${ui.surface}`}
      style={{ border: '1px solid var(--app-border)' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="ds-kicker uppercase tracking-[0.14em] accent-text">
            {isFinnish ? 'Älykkäät ehdotukset' : 'Smart suggestions'}
          </p>
          <h3 className={`ds-section-title mt-2 font-bold uppercase tracking-[-0.02em] ${ui.textPrimary}`}>
            {isFinnish ? 'Paranna selkeyttä ja vaikuttavuutta' : 'Improve clarity and impact'}
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            {isFinnish
              ? 'Sääntöpohjainen tarkistus löytää puuttuvat tiedot, liian pitkän tekstin ja kohdat, joissa mitattavat tulokset vahvistaisivat CV:tä.'
              : 'Rule-based checks flag missing detail, overly long copy, and places where measurable results would strengthen the CV.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] ${badgeClasses(ui, 'warning')}`} style={{ border: '1px solid var(--app-border)' }}>
            {isFinnish
              ? `${feedback.warningCount} varoitus${feedback.warningCount === 1 ? '' : 'ta'}`
              : `${feedback.warningCount} warning${feedback.warningCount === 1 ? '' : 's'}`}
          </span>
          <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] ${badgeClasses(ui, 'tip')}`} style={{ border: '1px solid var(--app-border)' }}>
            {isFinnish
              ? `${feedback.metricsCount} mittarivinkki${feedback.metricsCount === 1 ? '' : 'ä'}`
              : `${feedback.metricsCount} metrics hint${feedback.metricsCount === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {feedback.priorityItems.length === 0 && feedback.metricsItems.length === 0 ? (
        <div className={`mt-5 p-4 ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
          <p className={`text-sm font-semibold ${ui.textPrimary}`}>
            {isFinnish
              ? 'Hyvää työtä - CV:ssäsi ei tällä hetkellä ole merkittäviä sääntöpohjaisia puutteita.'
              : 'Nice work - your CV currently avoids the main rule-based issues.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {feedback.priorityItems.map((item) => (
              <article
                key={item.id}
                className={`p-4 ${typeClasses(ui, item.type)}`}
                style={{ border: '1px solid var(--app-border)' }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.04em]">{item.title}</p>
                    <p className="mt-2 text-sm/6 opacity-90">{item.message}</p>
                  </div>
                  {item.action ? (
                    <button
                      type="button"
                      className={`shrink-0 border px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] transition ${ui.button}`}
                      onClick={() => runAction(item.action)}
                    >
                      {isFinnish ? 'Paranna tekstiä' : 'Improve text'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {feedback.metricsItems.length > 0 ? (
            <div className="mt-5">
              <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>
                {isFinnish ? 'Mittariehdotukset' : 'Metrics suggestions'}
              </p>
              <ul className={`mt-3 space-y-2 ${ui.textSecondary}`}>
                {feedback.metricsItems.map((item) => (
                  <li key={item.id} className={`px-4 py-3 text-sm ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
                    <span className={`font-semibold ${ui.textPrimary}`}>{item.title}:</span> {item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

const MemoizedCVSuggestionsPanel = memo(CVSuggestionsPanel)

MemoizedCVSuggestionsPanel.displayName = 'CVSuggestionsPanel'

export default MemoizedCVSuggestionsPanel
