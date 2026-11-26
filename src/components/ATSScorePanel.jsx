import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'
import { feedback } from '../i18n/feedback/index.js'

function scoreTone(ui, score) {
  if (score >= 85) {
    return { backgroundColor: 'rgba(0,0,0,0.06)', color: '#111111' }
  }

  if (score >= 70) {
    return { backgroundColor: 'rgba(0,0,0,0.04)', color: '#374151' }
  }

  if (score >= 55) {
    return { backgroundColor: 'rgba(0,0,0,0.04)', color: '#374151' }
  }

  return { backgroundColor: 'rgba(0,0,0,0.04)', color: '#6b7280' }
}

function ATSScorePanel({
  atsScore,
  theme = 'dark',
  locale = 'en',
  atsFriendlyMode,
  onToggleAtsFriendlyMode,
  jobDescription = '',
  onJobDescriptionChange = () => {},
  onAddMissingKeyword = () => {},
  onCopyMissingKeywords = () => {},
  onClearJobDescription = () => {},
  // utils/jobMatch.js's matchJobAd() (1.7.2).
  jobDescriptionAnalysis = {
    hasInput: false,
    coverageScore: 0,
    total: 0,
    found: [],
    missing: [],
    skillsOnly: [],
  },
  // Null where this browser can't save CVs.
  onSaveCopyForJob = null,
  // The saved CV open now, if any: the copy leaves it as it is.
  savedCvName = '',
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const t = (key, vars) => feedback.t(locale, key, vars)
  const breakdownItems = Object.values(atsScore.breakdown)

  return (
    <section
      className={`fade-in-up p-5 sm:p-6 print:hidden ${ui.surface}`}
      style={{ border: '1px solid var(--app-border)' }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="ds-kicker uppercase tracking-[0.14em] accent-text">{t('atsPanel.kicker')}</p>
          <h3 className={`ds-section-title mt-2 font-bold uppercase tracking-[-0.02em] ${ui.textPrimary}`}>
            {t('atsPanel.title')}
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            {t('atsPanel.intro')}
          </p>
        </div>

        <div className="px-5 py-4 text-center" style={{ ...scoreTone(ui, atsScore.score), border: '1px solid var(--app-border-strong)' }}>
          <p className="text-xs font-bold uppercase tracking-[0.14em]">
            {t('atsPanel.kicker')}
          </p>
          <p className="mt-2 text-4xl font-bold leading-none">{atsScore.score}</p>
          <p className="mt-2 text-sm font-semibold">{atsScore.rating}</p>
        </div>
      </div>

      <div className={`mt-5 p-4 ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>ATS-friendly mode</p>
            <p className={`mt-1 text-sm ${ui.textSecondary}`}>
                {t('atsPanel.modeHint')}
            </p>
          </div>
          <button
            type="button"
            className={`ui-button ${
              atsFriendlyMode ? ui.buttonActive : ui.button
            }`}
            onClick={onToggleAtsFriendlyMode}
          >
            {atsFriendlyMode ? t('atsPanel.atsOn') : t('atsPanel.enableAts')}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {breakdownItems.map((item) => {
          const hasKeywordBreakdown = Array.isArray(item.matchedKeywords) || Array.isArray(item.missingKeywords)
          const matchedKeywords = item.matchedKeywords ?? []
          const missingKeywords = item.missingKeywords ?? []

          return (
            <article key={item.label} className={`p-4 ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
              <div className="flex items-center justify-between gap-3">
                <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>{item.label}</p>
                <span className="px-3 py-1 text-xs font-bold" style={{ ...scoreTone(ui, item.score), border: '1px solid var(--app-border)' }}>
                  {item.score}/{item.maxScore}
                </span>
              </div>
              <p className={`mt-2 text-sm leading-6 ${ui.textSecondary}`}>{item.summary}</p>

              {hasKeywordBreakdown && (matchedKeywords.length > 0 || missingKeywords.length > 0) ? (
                <div className="mt-3 space-y-2">
                  {matchedKeywords.length > 0 ? (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                        {t('atsPanel.matchedKeywords')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {matchedKeywords.slice(0, 12).map((keyword) => (
                          <span
                            key={`matched-${keyword}`}
                            className="border px-3 py-1 text-xs font-semibold"
                            style={{ borderColor: 'rgba(0,0,0,0.15)', backgroundColor: 'rgba(0,0,0,0.02)', color: '#111111' }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {missingKeywords.length > 0 ? (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                        {t('atsPanel.notRepeated')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {missingKeywords.slice(0, 12).map((keyword) => (
                          <span
                            key={`missing-${keyword}`}
                            className="border px-3 py-1 text-xs font-semibold"
                            style={{ borderColor: 'rgba(0,0,0,0.2)', backgroundColor: 'rgba(0,0,0,0.04)', color: '#374151' }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      <div className="mt-5">
        <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>
          {t('atsPanel.tipsTitle')}
        </p>
        <ul className={`mt-3 space-y-2 ${ui.textSecondary}`}>
          {atsScore.improvementTips.map((tip) => (
            <li key={tip} className={`px-4 py-3 text-sm ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-5 p-4 ${ui.surfaceMuted}`} style={{ border: '1px solid var(--app-border)' }}>
        <p className={`text-sm font-bold uppercase tracking-[0.04em] ${ui.textPrimary}`}>
          {t('atsPanel.jobTitle')}
        </p>
        <p className={`mt-1 text-sm ${ui.textSecondary}`}>
          {t('atsPanel.jobIntro')}
        </p>
        <textarea
          className={`mt-3 min-h-28 w-full border px-4 py-3 text-sm transition ${ui.input}`}
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          aria-label={t('atsPanel.jobAria')}
          placeholder={t('atsPanel.jobPlaceholder')}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`ui-button ${ui.button}`}
            onClick={onCopyMissingKeywords}
            disabled={jobDescriptionAnalysis.missing.length === 0}
          >
            {t('atsPanel.copyMissing')}
          </button>
          <button
            type="button"
            className={`ui-button ${ui.button}`}
            onClick={onClearJobDescription}
            disabled={!jobDescription.trim()}
          >
            {t('atsPanel.clear')}
          </button>
        </div>

        {jobDescriptionAnalysis.hasInput ? (
          <div className="mt-4 space-y-3" data-job-match>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold" style={{ ...scoreTone(ui, jobDescriptionAnalysis.coverageScore), border: '1px solid var(--app-border)' }}>
                {t('atsPanel.coverage', { score: jobDescriptionAnalysis.coverageScore })}
              </span>
              <span className={`px-3 py-1 text-xs font-bold ${ui.surface}`} style={{ border: '1px solid var(--app-border)' }}>
                {t('atsPanel.foundCount', { found: jobDescriptionAnalysis.found.length, total: jobDescriptionAnalysis.total })}
              </span>
            </div>

            {jobDescriptionAnalysis.total === 0 ? (
              <p className={`text-sm ${ui.textSecondary}`}>
                {t('atsPanel.nothingRecognised')}
              </p>
            ) : null}

            {jobDescriptionAnalysis.missing.length > 0 ? (
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                  {t('atsPanel.missingTitle')}
                </p>
                <p className={`mt-1 text-xs ${ui.textSecondary}`}>
                  {t('atsPanel.missingHint')}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobDescriptionAnalysis.missing.map((keyword) => (
                    <button
                      type="button"
                      key={`missing-${keyword}`}
                      onClick={() => onAddMissingKeyword(keyword)}
                      className="border px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: 'rgba(0,0,0,0.2)', backgroundColor: 'rgba(0,0,0,0.04)', color: '#374151' }}
                    >
                      + {keyword}
                    </button>
                  ))}
                </div>
              </div>
            ) : jobDescriptionAnalysis.total > 0 ? (
              <p className={`text-sm ${ui.textSecondary}`}>
                {t('atsPanel.strongMatch')}
              </p>
            ) : null}

            {jobDescriptionAnalysis.found.length > 0 ? (
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                  {t('atsPanel.inCv')}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobDescriptionAnalysis.found.map(({ label }) => (
                    <span
                      key={`found-${label}`}
                      className="border px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {jobDescriptionAnalysis.skillsOnly.length > 0 ? (
              <p className={`text-sm ${ui.textSecondary}`} data-job-match-skills-only>
                {t('atsPanel.skillsOnly', { skills: jobDescriptionAnalysis.skillsOnly.join(', ') })}
              </p>
            ) : null}

            {onSaveCopyForJob ? (
              <div className="pt-1">
                <button type="button" className={`ui-button ${ui.button}`} onClick={onSaveCopyForJob}>
                  {t('atsPanel.saveCopy')}
                </button>
                <p className={`mt-1 text-xs ${ui.textSecondary}`}>
                  {savedCvName
                    ? t('atsPanel.saveCopyOpen', { name: savedCvName })
                    : t('atsPanel.saveCopyNew')}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

const MemoizedATSScorePanel = memo(ATSScorePanel)

MemoizedATSScorePanel.displayName = 'ATSScorePanel'

export default MemoizedATSScorePanel
