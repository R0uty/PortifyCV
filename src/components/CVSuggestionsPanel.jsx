import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function typeClasses(ui, type) {
  if (type === 'warning') {
    return ui.isDark
      ? 'border-amber-400/20 bg-amber-400/10 text-amber-100'
      : 'border-amber-300 bg-amber-50 text-amber-800'
  }

  return ui.isDark
    ? 'border-white/10 bg-white/5 text-slate-100'
    : 'border-slate-200 bg-slate-50 text-slate-700'
}

function badgeClasses(ui, type) {
  if (type === 'warning') {
    return ui.isDark
      ? 'bg-amber-400/15 text-amber-100'
      : 'bg-amber-100 text-amber-700'
  }

  return 'accent-surface accent-text-strong'
}

function CVSuggestionsPanel({
  feedback,
  theme = 'dark',
  onImproveAboutText,
  onImproveExperienceText,
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])

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
      className={`fade-in-up surface-shadow rounded-[var(--radius-card)] border p-5 sm:p-6 print:hidden ${ui.surface}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`ds-kicker ${ui.textMuted}`}>Smart suggestions</p>
          <h3 className={`ds-section-title mt-2 font-semibold ${ui.textPrimary}`}>
            Improve clarity and impact
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            Rule-based checks flag missing detail, overly long copy, and places where measurable results would strengthen the CV.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClasses(ui, 'warning')}`}>
            {feedback.warningCount} warning{feedback.warningCount === 1 ? '' : 's'}
          </span>
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClasses(ui, 'tip')}`}>
            {feedback.metricsCount} metrics hint{feedback.metricsCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {feedback.priorityItems.length === 0 && feedback.metricsItems.length === 0 ? (
        <div className={`mt-5 rounded-2xl border px-4 py-4 ${ui.surfaceMuted}`}>
          <p className={`text-sm font-medium ${ui.textPrimary}`}>
            Nice work - your CV currently avoids the main rule-based issues.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {feedback.priorityItems.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border px-4 py-4 ${typeClasses(ui, item.type)}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm/6 opacity-90">{item.message}</p>
                  </div>
                  {item.action ? (
                    <button
                      type="button"
                      className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
                      onClick={() => runAction(item.action)}
                    >
                      Improve text
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {feedback.metricsItems.length > 0 ? (
            <div className="mt-5">
              <p className={`text-sm font-semibold ${ui.textPrimary}`}>Metrics suggestions</p>
              <ul className={`mt-3 space-y-2 ${ui.textSecondary}`}>
                {feedback.metricsItems.map((item) => (
                  <li key={item.id} className={`rounded-2xl border px-4 py-3 text-sm ${ui.surfaceMuted}`}>
                    <span className={`font-medium ${ui.textPrimary}`}>{item.title}:</span> {item.message}
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
