import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

function scoreTone(ui, score) {
  if (score >= 85) {
    return ui.isDark
      ? 'border-gray-400/20 bg-gray-400/10 text-gray-100'
      : 'border-gray-300 bg-gray-50 text-gray-800'
  }

  if (score >= 70) {
    return ui.isDark
      ? 'border-gray-400/25 bg-gray-400/12 text-gray-200'
      : 'border-gray-300 bg-gray-100 text-gray-800'
  }

  if (score >= 55) {
    return ui.isDark
      ? 'border-gray-500/25 bg-gray-500/10 text-gray-300'
      : 'border-gray-300 bg-gray-50 text-gray-700'
  }

  return ui.isDark
    ? 'border-gray-400/20 bg-gray-400/10 text-gray-100'
    : 'border-gray-300 bg-gray-50 text-gray-800'
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
  jobDescriptionAnalysis = {
    hasInput: false,
    coverageScore: 0,
    totalKeywords: 0,
    matchedKeywords: [],
    missingKeywords: [],
  },
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isFinnish = locale === 'fi'
  const breakdownItems = Object.values(atsScore.breakdown)

  return (
    <section
      className={`fade-in-up surface-shadow rounded-[var(--radius-card)] border p-5 sm:p-6 print:hidden ${ui.surface}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className={`ds-kicker ${ui.textMuted}`}>{isFinnish ? 'ATS-pisteet' : 'ATS score'}</p>
          <h3 className={`ds-section-title mt-2 font-semibold ${ui.textPrimary}`}>
            {isFinnish ? 'Yhteenveto jäsennysvalmiudesta' : 'Parser-readiness overview'}
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            {isFinnish
              ? 'Piste kertoo, kuinka helposti rekrytointijärjestelmät pystyvät jäsentämään ja arvioimaan CV:n.'
              : 'This score estimates how easily applicant tracking systems can parse and rank the CV.'}
          </p>
        </div>

        <div className={`rounded-[1.5rem] border px-5 py-4 text-center ${scoreTone(ui, atsScore.score)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            {isFinnish ? 'ATS-pisteet' : 'ATS score'}
          </p>
          <p className="mt-2 text-4xl font-semibold leading-none">{atsScore.score}</p>
          <p className="mt-2 text-sm font-medium">{atsScore.rating}</p>
        </div>
      </div>

      <div className={`mt-5 rounded-[1.4rem] border p-4 ${ui.surfaceMuted}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm font-semibold ${ui.textPrimary}`}>ATS-friendly mode</p>
            <p className={`mt-1 text-sm ${ui.textSecondary}`}>
                {isFinnish
                  ? 'Vaihda esikatselu yksinkertaiseen ATS-yhteensopivaan asetteluun.'
                  : 'Switch the preview to a simplified, parser-safe layout with reduced styling.'}
            </p>
          </div>
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              atsFriendlyMode ? ui.buttonActive : ui.button
            }`}
            onClick={onToggleAtsFriendlyMode}
          >
            {atsFriendlyMode
              ? isFinnish ? 'ATS-tila päällä' : 'ATS mode on'
              : isFinnish ? 'Ota ATS-tila käyttöön' : 'Enable ATS mode'}
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
        <p className={`text-sm font-semibold ${ui.textPrimary}`}>
          {isFinnish ? 'Parannusvinkit' : 'Score improvement tips'}
        </p>
        <ul className={`mt-3 space-y-2 ${ui.textSecondary}`}>
          {atsScore.improvementTips.map((tip) => (
            <li key={tip} className={`rounded-2xl border px-4 py-3 text-sm ${ui.surfaceMuted}`}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-5 rounded-[1.4rem] border p-4 ${ui.surfaceMuted}`}>
        <p className={`text-sm font-semibold ${ui.textPrimary}`}>
          {isFinnish ? 'Työpaikkailmoituksen avainsanat' : 'Job description keyword match'}
        </p>
        <p className={`mt-1 text-sm ${ui.textSecondary}`}>
          {isFinnish
            ? 'Liitä työpaikkakuvaus löytääksesi tärkeät termit, joita CV:stäsi puuttuu.'
            : 'Paste a target role description to spot important terms your CV is missing.'}
        </p>
        <textarea
          className={`mt-3 min-h-28 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-ring)] ${ui.input}`}
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder={isFinnish
            ? 'Liitä tähän työpaikkakuvaus avainsanojen kattavuuden analysointia varten.'
            : 'Paste a job description here to analyze keyword coverage.'}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
            onClick={onCopyMissingKeywords}
            disabled={jobDescriptionAnalysis.missingKeywords.length === 0}
          >
            {isFinnish ? 'Kopioi puuttuvat' : 'Copy missing'}
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
            onClick={onClearJobDescription}
            disabled={!jobDescription.trim()}
          >
            {isFinnish ? 'Tyhjennä JD' : 'Clear JD'}
          </button>
        </div>

        {jobDescriptionAnalysis.hasInput ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreTone(ui, jobDescriptionAnalysis.coverageScore)}`}>
                {isFinnish ? 'Kattavuus' : 'Coverage'} {jobDescriptionAnalysis.coverageScore}%
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.surface}`}>
                {isFinnish
                  ? `${jobDescriptionAnalysis.matchedKeywords.length}/${jobDescriptionAnalysis.totalKeywords} avainsanaa osui`
                  : `${jobDescriptionAnalysis.matchedKeywords.length}/${jobDescriptionAnalysis.totalKeywords} keywords matched`}
              </span>
            </div>

            {jobDescriptionAnalysis.missingKeywords.length > 0 ? (
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                  {isFinnish ? 'Puuttuvat avainsanat' : 'Missing keywords'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobDescriptionAnalysis.missingKeywords.slice(0, 12).map((keyword) => (
                    <button
                      type="button"
                      key={`missing-${keyword}`}
                      onClick={() => onAddMissingKeyword(keyword)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${ui.isDark ? 'border-gray-400/25 bg-gray-400/10 text-gray-100' : 'border-gray-300 bg-gray-50 text-gray-800'}`}
                    >
                      + {keyword}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm ${ui.textSecondary}`}>
                {isFinnish
                  ? 'Vahva osuma. CV:si kattaa jo ilmoituksen yleisimmät avainsanat.'
                  : 'Strong match. Your CV already covers the most frequent JD keywords.'}
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
