import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'
import { feedback as feedbackText } from '../i18n/feedback/index.js'

function typeClasses(type) {
  if (type === 'warning') {
    return 'bg-gray-50 text-gray-800'
  }

  return 'bg-gray-50 text-gray-700'
}

function badgeClasses(type) {
  if (type === 'warning') {
    return 'bg-gray-100 text-gray-700'
  }

  return 'accent-surface accent-text-strong'
}

function CVSuggestionsPanel({
  feedback,
  theme = 'dark',
  locale = 'en',
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const t = (key, vars) => feedbackText.t(locale, key, vars)

  return (
    <section
      className={`fade-in-up p-5 sm:p-6 print:hidden ${ui.surface}`}
      style={{ border: '1px solid var(--app-border)' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="ds-kicker uppercase tracking-[0.14em] accent-text">
            {t('suggestions.kicker')}
          </p>
          <h3 className={`ds-section-title mt-2 font-bold uppercase tracking-[-0.02em] ${ui.textPrimary}`}>
            {t('suggestions.title')}
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            {t('suggestions.intro')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] ${badgeClasses('warning')}`} style={{ border: '1px solid var(--app-border)' }}>
            {t('suggestions.warnings', { count: feedback.warningCount })}
          </span>
          <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] ${badgeClasses('tip')}`} style={{ border: '1px solid var(--app-border)' }}>
            {t('suggestions.metricsHints', { count: feedback.metricsCount })}
          </span>
        </div>
      </div>

      {feedback.priorityItems.length === 0 && feedback.metricsItems.length === 0 ? (
        <div className={`mt-5 p-4 ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
          <p className={`text-sm font-semibold ${ui.textPrimary}`}>
            {t('suggestions.allClear')}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {feedback.priorityItems.map((item) => (
              <article
                key={item.id}
                className={`p-4 ${typeClasses(item.type)}`}
                style={{ border: '1px solid var(--app-border)' }}
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.04em]">{item.title}</p>
                  <p className="mt-2 text-sm/6 opacity-90">{item.message}</p>
                </div>
              </article>
            ))}
          </div>

          {feedback.metricsItems.length > 0 ? (
            <div className="mt-5">
              <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>
                {t('suggestions.metricsTitle')}
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
