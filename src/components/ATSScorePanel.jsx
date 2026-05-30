import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function scoreTone(ui, score) {
  if (score >= 85) {
    return ui.isDark
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
      : 'border-emerald-300 bg-emerald-50 text-emerald-800'
  }

  if (score >= 70) {
    return ui.isDark
      ? 'border-sky-400/20 bg-sky-400/10 text-sky-100'
      : 'border-sky-300 bg-sky-50 text-sky-800'
  }

  if (score >= 55) {
    return ui.isDark
      ? 'border-amber-400/20 bg-amber-400/10 text-amber-100'
      : 'border-amber-300 bg-amber-50 text-amber-800'
  }

  return ui.isDark
    ? 'border-rose-400/20 bg-rose-400/10 text-rose-100'
    : 'border-rose-300 bg-rose-50 text-rose-800'
}

function ATSScorePanel({
  atsScore,
  theme = 'dark',
  atsFriendlyMode,
  onToggleAtsFriendlyMode,
  jobDescription = '',
  onJobDescriptionChange = () => {},
  onAddMissingKeyword = () => {},
  onCopyMissingKeywords = () => {},
  onClearJobDescription = () => {},
  jobDescriptionAnalysis = {
    hasInput: false,
    coverageScore: 0,
    totalKeywords: 0,
    matchedKeywords: [],
    missingKeywords: [],
  },
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const breakdownItems = Object.values(atsScore.breakdown)

  return (
    <section
      className={`fade-in-up surface-shadow rounded-[var(--radius-card)] border p-5 sm:p-6 print:hidden ${ui.surface}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className={`ds-kicker ${ui.textMuted}`}>ATS score</p>
          <h3 className={`ds-section-title mt-2 font-semibold ${ui.textPrimary}`}>
            Parser-readiness overview
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            This score estimates how easily applicant tracking systems can parse and rank the CV.
          </p>
        </div>

        <div className={`rounded-[1.5rem] border px-5 py-4 text-center ${scoreTone(ui, atsScore.score)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">ATS score</p>
          <p className="mt-2 text-4xl font-semibold leading-none">{atsScore.score}</p>
          <p className="mt-2 text-sm font-medium">{atsScore.rating}</p>
        </div>
      </div>

      <div className={`mt-5 rounded-[1.4rem] border p-4 ${ui.surfaceMuted}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm font-semibold ${ui.textPrimary}`}>ATS-friendly mode</p>
            <p className={`mt-1 text-sm ${ui.textSecondary}`}>
              Switch the preview to a simplified, parser-safe layout with reduced styling.
            </p>
          </div>
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              atsFriendlyMode ? ui.buttonActive : ui.button
            }`}
            onClick={onToggleAtsFriendlyMode}
          >
            {atsFriendlyMode ? 'ATS mode on' : 'Enable ATS mode'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {breakdownItems.map((item) => (
          <article key={item.label} className={`rounded-2xl border px-4 py-4 ${ui.surfaceMuted}`}>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-sm font-semibold ${ui.textPrimary}`}>{item.label}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreTone(ui, item.score)}`}>
                {item.score}/{item.maxScore}
              </span>
            </div>
            <p className={`mt-2 text-sm leading-6 ${ui.textSecondary}`}>{item.summary}</p>
          </article>
        ))}
      </div>

      <div className="mt-5">
        <p className={`text-sm font-semibold ${ui.textPrimary}`}>Score improvement tips</p>
        <ul className={`mt-3 space-y-2 ${ui.textSecondary}`}>
          {atsScore.improvementTips.map((tip) => (
            <li key={tip} className={`rounded-2xl border px-4 py-3 text-sm ${ui.surfaceMuted}`}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-5 rounded-[1.4rem] border p-4 ${ui.surfaceMuted}`}>
        <p className={`text-sm font-semibold ${ui.textPrimary}`}>Job description keyword match</p>
        <p className={`mt-1 text-sm ${ui.textSecondary}`}>
          Paste a target role description to spot important terms your CV is missing.
        </p>
        <textarea
          className={`mt-3 min-h-28 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-ring)] ${ui.input}`}
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder="Paste a job description here to analyze keyword coverage."
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
            onClick={onCopyMissingKeywords}
            disabled={jobDescriptionAnalysis.missingKeywords.length === 0}
          >
            Copy missing
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
            onClick={onClearJobDescription}
            disabled={!jobDescription.trim()}
          >
            Clear JD
          </button>
        </div>

        {jobDescriptionAnalysis.hasInput ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreTone(ui, jobDescriptionAnalysis.coverageScore)}`}>
                Coverage {jobDescriptionAnalysis.coverageScore}%
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.surface}`}>
                {jobDescriptionAnalysis.matchedKeywords.length}/{jobDescriptionAnalysis.totalKeywords} keywords matched
              </span>
            </div>

            {jobDescriptionAnalysis.missingKeywords.length > 0 ? (
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                  Missing keywords
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobDescriptionAnalysis.missingKeywords.slice(0, 12).map((keyword) => (
                    <button
                      type="button"
                      key={`missing-${keyword}`}
                      onClick={() => onAddMissingKeyword(keyword)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${ui.isDark ? 'border-amber-400/25 bg-amber-400/10 text-amber-100' : 'border-amber-300 bg-amber-50 text-amber-800'}`}
                    >
                      + {keyword}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm ${ui.textSecondary}`}>
                Strong match. Your CV already covers the most frequent JD keywords.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}

const MemoizedATSScorePanel = memo(ATSScorePanel)

MemoizedATSScorePanel.displayName = 'ATSScorePanel'

export default MemoizedATSScorePanel
