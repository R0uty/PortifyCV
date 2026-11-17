import { memo, useMemo } from 'react'

import { getUiTheme } from '../utils/designSystem'

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
  const isFinnish = locale === 'fi'
  const breakdownItems = Object.values(atsScore.breakdown)

  return (
    <section
      className={`fade-in-up p-5 sm:p-6 print:hidden ${ui.surface}`}
      style={{ border: '1px solid var(--app-border)' }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="ds-kicker uppercase tracking-[0.14em] accent-text">{isFinnish ? 'ATS-pisteet' : 'ATS score'}</p>
          <h3 className={`ds-section-title mt-2 font-bold uppercase tracking-[-0.02em] ${ui.textPrimary}`}>
            {isFinnish ? 'Yhteenveto jäsennysvalmiudesta' : 'Parser-readiness overview'}
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            {isFinnish
              ? 'Piste kertoo, kuinka helposti rekrytointijärjestelmät pystyvät jäsentämään ja arvioimaan CV:n.'
              : 'This score estimates how easily applicant tracking systems can parse and rank the CV.'}
          </p>
        </div>

        <div className="px-5 py-4 text-center" style={{ ...scoreTone(ui, atsScore.score), border: '1px solid var(--app-border-strong)' }}>
          <p className="text-xs font-bold uppercase tracking-[0.14em]">
            {isFinnish ? 'ATS-pisteet' : 'ATS score'}
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
                {isFinnish
                  ? 'Vaihda esikatselu yksinkertaiseen ATS-yhteensopivaan asetteluun. Jätä pois päältä täysin tyyliteltyä vientiä varten. Sama valinta löytyy myös Asetuksista.'
                  : 'Switch the preview to a simplified, parser-safe layout with reduced styling. Leave it off for fully styled template exports. Also in Settings.'}
            </p>
          </div>
          <button
            type="button"
            className={`ui-button ${
              atsFriendlyMode ? ui.buttonActive : ui.button
            }`}
            onClick={onToggleAtsFriendlyMode}
          >
            {atsFriendlyMode
              ? isFinnish ? 'ATS-PÄÄLLÄ' : 'ATS ON'
              : isFinnish ? 'Ota ATS käyttöön' : 'Enable ATS'}
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
                        {isFinnish ? 'Osuneet avainsanat' : 'Matched keywords'}
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
                        {isFinnish
                          ? 'Ei toistu yhteenvedossa tai kokemuksessa'
                          : 'Not repeated in your summary or experience'}
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
          {isFinnish ? 'Parannusvinkit' : 'Score improvement tips'}
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
          {isFinnish ? 'Työpaikkailmoituksen avainsanat' : 'Job description keyword match'}
        </p>
        <p className={`mt-1 text-sm ${ui.textSecondary}`}>
          {isFinnish
            ? 'Liitä työpaikkailmoitus: näet, mitä taitoja ja vaatimuksia siinä mainitaan ja mitkä niistä CV:stäsi jo löytyvät.'
            : 'Paste a job ad to see the skills and requirements it names, and which of them your CV already mentions.'}
        </p>
        <textarea
          className={`mt-3 min-h-28 w-full border px-4 py-3 text-sm transition ${ui.input}`}
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          aria-label={isFinnish ? 'Työpaikkailmoituksen kuvaus' : 'Job description'}
          placeholder={isFinnish
            ? 'Liitä tähän työpaikkakuvaus avainsanojen kattavuuden analysointia varten.'
            : 'Paste a job description here to analyze keyword coverage.'}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`ui-button ${ui.button}`}
            onClick={onCopyMissingKeywords}
            disabled={jobDescriptionAnalysis.missing.length === 0}
          >
            {isFinnish ? 'Kopioi puuttuvat' : 'Copy missing'}
          </button>
          <button
            type="button"
            className={`ui-button ${ui.button}`}
            onClick={onClearJobDescription}
            disabled={!jobDescription.trim()}
          >
            {isFinnish ? 'Tyhjennä JD' : 'Clear JD'}
          </button>
        </div>

        {jobDescriptionAnalysis.hasInput ? (
          <div className="mt-4 space-y-3" data-job-match>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold" style={{ ...scoreTone(ui, jobDescriptionAnalysis.coverageScore), border: '1px solid var(--app-border)' }}>
                {isFinnish ? 'Kattavuus' : 'Coverage'} {jobDescriptionAnalysis.coverageScore}%
              </span>
              <span className={`px-3 py-1 text-xs font-bold ${ui.surface}`} style={{ border: '1px solid var(--app-border)' }}>
                {isFinnish
                  ? `${jobDescriptionAnalysis.found.length}/${jobDescriptionAnalysis.total} vaatimusta löytyy CV:stä`
                  : `${jobDescriptionAnalysis.found.length} of ${jobDescriptionAnalysis.total} requirements in your CV`}
              </span>
            </div>

            {jobDescriptionAnalysis.total === 0 ? (
              <p className={`text-sm ${ui.textSecondary}`}>
                {isFinnish
                  ? 'Ilmoituksesta ei löytynyt tunnistettavia taitoja tai työkaluja.'
                  : 'No skills or tools recognised in this ad.'}
              </p>
            ) : null}

            {jobDescriptionAnalysis.missing.length > 0 ? (
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                  {isFinnish ? 'Puuttuvat avainsanat' : 'Missing keywords'}
                </p>
                <p className={`mt-1 text-xs ${ui.textSecondary}`}>
                  {isFinnish
                    ? 'Lisää vain se, minkä oikeasti osaat. Napautus lisää taitoihin.'
                    : 'Add only what you can honestly claim. Tap one to add it to your skills.'}
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
                {isFinnish
                  ? 'Vahva osuma. CV:si mainitsee kaiken, mitä ilmoituksesta tunnistettiin.'
                  : 'Strong match. Your CV mentions everything recognised in the ad.'}
              </p>
            ) : null}

            {jobDescriptionAnalysis.found.length > 0 ? (
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.14em] ${ui.textMuted}`}>
                  {isFinnish ? 'Löytyy CV:stä' : 'In your CV'}
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
                {isFinnish
                  ? `Vain taitolistassa: ${jobDescriptionAnalysis.skillsOnly.join(', ')}. Kerro työkokemuksessa, missä käytit niitä, niin lukija näkee ne käytössä.`
                  : `Only in your skills list: ${jobDescriptionAnalysis.skillsOnly.join(', ')}. Say where you used them in your experience, so a reader sees them in use.`}
              </p>
            ) : null}

            {onSaveCopyForJob ? (
              <div className="pt-1">
                <button type="button" className={`ui-button ${ui.button}`} onClick={onSaveCopyForJob}>
                  {isFinnish ? 'Tallenna kopio tätä työpaikkaa varten' : 'Save a copy for this job'}
                </button>
                <p className={`mt-1 text-xs ${ui.textSecondary}`}>
                  {savedCvName
                    ? isFinnish
                      ? `Muokkaat kopiota; "${savedCvName}" pysyy sellaisena kuin se tallennettiin.`
                      : `You edit the copy; "${savedCvName}" stays as it was saved.`
                    : isFinnish
                      ? 'Tallentaa tämän CV:n tälle laitteelle tämän työpaikan nimellä.'
                      : 'Saves this CV on this device under a name for this job.'}
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
