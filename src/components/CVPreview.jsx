import { memo, useMemo } from 'react'

import { createCvSnapshot } from '../utils/cvSnapshot'
import { createSectionVisibility, isPhotoVisibleForTemplate } from '../utils/cvForm'
import { getUiTheme } from '../utils/designSystem'
import { getCvTemplate } from '../utils/cvTemplates'

const previewSectionTitleClasses = 'text-xs font-semibold uppercase tracking-[0.24em]'

function formatDateRange(startDate, endDate) {
  return [startDate, endDate].map((value) => value.trim()).filter(Boolean).join(' - ')
}

function formatLinkLabel(key) {
  if (key === 'github') {
    return 'GitHub'
  }

  if (key === 'linkedin') {
    return 'LinkedIn'
  }

  return key.charAt(0).toUpperCase() + key.slice(1)
}

function getPreviewClasses(variant, isDark) {
  if (variant === 'creative') {
    return isDark
      ? 'border-[var(--accent-border)] bg-gray-950 shadow-[var(--accent-glow)]'
      : 'border-[var(--accent-border)] bg-white shadow-[var(--accent-glow)]'
  }

  return isDark
    ? 'border-gray-800 bg-black shadow-black/30'
    : 'border-black/10 bg-white shadow-black/10'
}

function getHeaderColorClasses(variant, isDark) {
  if (variant === 'corporate') {
    return isDark
      ? 'bg-black text-white border-b border-gray-800'
      : 'bg-white text-black border-b border-black/10'
  }

  if (variant === 'creative') {
    return 'bg-gradient-to-br from-black to-gray-800 text-white'
  }

  if (variant === 'developer') {
    return 'bg-black text-white'
  }

  return 'bg-gray-900 text-white'
}

function getHeaderTitleClasses(variant) {
  if (variant === 'developer' || variant === 'corporate') {
    return 'mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'
  }

  return 'mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'
}

function getHeaderSubtitleClasses(variant, isDark) {
  if (variant === 'corporate' && !isDark) {
    return 'mt-2 text-base leading-7 sm:text-lg text-gray-600'
  }

  return `mt-2 text-base leading-7 sm:text-lg ${isDark ? 'text-gray-300' : 'text-gray-400'}`
}

function getSectionTitleClasses(variant) {
  if (variant === 'developer') {
    return `${previewSectionTitleClasses} font-mono text-gray-500`
  }

  if (variant === 'creative') {
    return `${previewSectionTitleClasses} accent-text`
  }

  if (variant === 'corporate') {
    return `${previewSectionTitleClasses} tracking-[0.32em] text-gray-500`
  }

  return `${previewSectionTitleClasses} text-gray-300`
}

function getMainSectionClasses(variant, isDark) {
  if (variant === 'corporate') {
    return isDark
      ? 'border-b border-gray-800 pb-6 print:border-gray-400 print:pb-6'
      : 'border-b border-black/10 pb-6 print:pb-6'
  }

  return isDark
    ? 'rounded-3xl border border-gray-800 bg-black/50 p-5 sm:p-6 print:border-0 print:px-0'
    : 'rounded-3xl border border-black/10 bg-gray-50/80 p-5 sm:p-6 print:border-0 print:px-0'
}

function getSideContainerClasses(variant, isDark) {
  if (variant === 'creative') {
    return 'space-y-6 rounded-3xl bg-[var(--accent-soft)] p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
  }

  if (variant === 'developer') {
    return isDark
      ? 'space-y-6 rounded-2xl border border-gray-800 bg-black/80 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
      : 'space-y-6 rounded-2xl border border-black/10 bg-gray-50 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
  }

  return isDark
    ? 'space-y-6 rounded-3xl bg-black/60 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
    : 'space-y-6 rounded-3xl bg-gray-50 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
}

function getSideSectionClasses(variant, isDark) {
  if (variant === 'creative') {
    return isDark
      ? 'rounded-2xl border border-[var(--accent-border)] bg-black/40 p-5 print:border-0 print:px-0'
      : 'rounded-2xl border border-[var(--accent-border)] bg-white/80 p-5 print:border-0 print:px-0'
  }

  return isDark
    ? 'rounded-3xl border border-gray-800 bg-black/50 p-5 transition-colors print:border-0 print:px-0'
    : 'rounded-3xl border border-black/10 bg-white/80 p-5 transition-colors print:border-0 print:px-0'
}

function getSkillTagClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'rounded-md border border-gray-700/60 bg-gray-900/40 px-3 py-1.5 text-xs font-mono font-medium text-gray-300'
      : 'rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-mono font-medium text-gray-700'
  }

  if (variant === 'creative') {
    return 'rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-text-strong)]'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'rounded-sm border border-gray-700 bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-300'
      : 'rounded-sm border border-gray-400 bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-700'
  }

  return isDark
    ? 'rounded-full border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-xs font-semibold text-gray-300'
    : 'rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700'
}

function getTimelineBorderClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark ? 'border-gray-700' : 'border-gray-300'
  }

  if (variant === 'creative') {
    return 'border-[var(--accent-border)]'
  }

  return isDark ? 'border-gray-700' : 'border-black/10'
}

function getTimelineDotClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark ? 'border-black bg-gray-400' : 'border-white bg-gray-600'
  }

  if (variant === 'creative') {
    return isDark ? 'border-black bg-[var(--accent-solid)]' : 'border-white bg-[var(--accent-solid)]'
  }

  return isDark ? 'border-black bg-gray-400' : 'border-white bg-gray-600'
}

function getEducationCardClasses(variant, isDark) {
  if (variant === 'corporate') {
    return isDark
      ? 'border-b border-gray-800 py-4'
      : 'border-b border-black/10 py-4'
  }

  return isDark
    ? 'rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-4'
    : 'rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4'
}

function getLinkCardClasses(variant, isDark) {
  if (variant === 'corporate') {
    return isDark
      ? 'border-b border-gray-800 py-3'
      : 'border-b border-gray-200 py-3'
  }

  return isDark
    ? 'rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3'
    : 'rounded-2xl border border-gray-200 bg-white px-4 py-3'
}

function getSplitColumnsClasses(variant) {
  if (variant === 'creative') {
    return 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(200px,0.95fr)] md:gap-8 print:grid-cols-1'
  }

  return 'grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1.62fr)_minmax(200px,0.88fr)] md:gap-8 print:grid-cols-1'
}

function renderSectionCard({ section, placement, children, classes }) {
  return (
    <section
      key={section}
      className={classes}
      data-export-section={section}
      data-export-placement={placement}
    >
      {children}
    </section>
  )
}

function CVPreview({
  formData,
  theme = 'dark',
  previewRef = null,
  template = 'minimal',
  locale = 'en',
  atsFriendlyMode = false,
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isDark = ui.isDark
  const templateConfig = useMemo(() => getCvTemplate(template, locale), [locale, template])
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])
  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
  const photo = snapshot.photo
  const showPhoto = Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const about = snapshot.about
    || (isFinnish
      ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
      : 'Your professional summary will appear here as you fill out the CV form.')
  const skills = snapshot.skills
  const experience = snapshot.experience
  const education = snapshot.education
  const links = Object.entries(snapshot.links)
  const sectionVisibility = {
    ...createSectionVisibility(),
    ...(formData.sectionVisibility ?? {}),
  }
  const visiblePrimarySections = templateConfig.primarySections.filter(
    (section) => sectionVisibility[section],
  )
  const visibleSecondarySections = templateConfig.secondarySections.filter(
    (section) => sectionVisibility[section],
  )

  const variant = templateConfig.variant
  const sectionTitleClasses = getSectionTitleClasses(variant)
  const isMinimalVariant = variant === 'minimal'
  const mainSectionClasses = getMainSectionClasses(variant, isDark)
  const sideSectionClasses = getSideSectionClasses(variant, isDark)
  const skillTagClasses = getSkillTagClasses(variant, isDark)
  const timelineBorderClasses = getTimelineBorderClasses(variant, isDark)
  const timelineDotClasses = getTimelineDotClasses(variant, isDark)
  const educationCardClasses = getEducationCardClasses(variant, isDark)
  const linkCardClasses = getLinkCardClasses(variant, isDark)
  const resolvedSectionTitleClasses = atsFriendlyMode
    ? 'text-xs font-semibold uppercase tracking-[0.18em] text-gray-500'
    : sectionTitleClasses
  const resolvedMainSectionClasses = atsFriendlyMode
    ? 'border-b border-gray-200 pb-6 print:border-0 print:px-0'
    : mainSectionClasses
  const resolvedSideSectionClasses = atsFriendlyMode
    ? 'border-b border-gray-200 pb-6 print:border-0 print:px-0'
    : sideSectionClasses
  const bodyTextClasses = atsFriendlyMode
    ? 'text-gray-700'
    : isDark
      ? isMinimalVariant
        ? 'text-gray-100'
        : 'text-gray-300'
      : 'text-gray-600'
  const supportingTextClasses = atsFriendlyMode
    ? 'text-gray-700'
    : isDark
      ? isMinimalVariant
        ? 'text-gray-200'
        : 'text-gray-200'
      : 'text-gray-700'
  const metaTextClasses = atsFriendlyMode
    ? 'text-gray-500'
    : isDark
      ? isMinimalVariant
        ? 'text-gray-300'
        : 'text-gray-400'
      : 'text-gray-400'
  const summaryBadgeClasses =
    variant === 'creative'
      ? 'border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-text-strong)]'
      : isDark
        ? isMinimalVariant
          ? 'bg-gray-800 text-gray-100'
          : 'bg-gray-900 text-gray-300'
        : 'bg-gray-100 text-gray-500'

  const renderSection = (section, placement = 'main') => {
    if (!sectionVisibility[section]) {
      return null
    }

    const sectionClasses =
      placement === 'main' ? resolvedMainSectionClasses : resolvedSideSectionClasses

    if (section === 'about') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <div
              className={`flex items-center justify-between gap-4 border-b pb-4 ${
                atsFriendlyMode
                  ? 'border-gray-200'
                  : isDark
                    ? 'border-white/6'
                    : 'border-black/5'
              }`}
            >
              <h4 className={resolvedSectionTitleClasses}>{isFinnish ? 'Esittely' : 'About'}</h4>
              {!atsFriendlyMode ? (
                <div
                  data-export-summary-chip="true"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${summaryBadgeClasses}`}
                >
                  {templateConfig.summaryBadgeLabel}
                </div>
              ) : null}
            </div>
            <p className={`mt-5 text-[0.98rem] leading-8 ${bodyTextClasses}`}>
              {about}
            </p>
          </>
        ),
      })
    }

    if (section === 'experience') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={resolvedSectionTitleClasses}>{isFinnish ? 'Kokemus' : 'Experience'}</h4>
            <div className="mt-6 space-y-7">
              {experience.length > 0 ? (
                experience.map((item, index) => {
                  const dateRange = formatDateRange(item.startDate, item.endDate)
                  const heading = [item.role.trim(), item.company.trim()]
                    .filter(Boolean)
                    .join(' @ ')

                  return (
                    <div
                      key={`${item.role}-${item.company}-${index}`}
                      className={`relative border-l-2 pl-6 ${
                        atsFriendlyMode ? 'border-gray-300' : timelineBorderClasses
                      }`}
                      data-export-card="true"
                    >
                      <span
                        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 shadow-sm ${
                          atsFriendlyMode ? 'border-white bg-gray-500' : timelineDotClasses
                        }`}
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p
                            className={`text-lg font-semibold tracking-tight ${
                              atsFriendlyMode
                                ? 'text-gray-900'
                                : isDark
                                  ? 'text-white'
                                  : 'text-gray-900'
                            }`}
                          >
                            {heading || (isFinnish ? 'Nimeämätön rooli' : 'Untitled role')}
                          </p>
                          {item.description.trim() ? (
                            <p className={`mt-3 text-sm leading-7 ${bodyTextClasses}`}>
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.16em] ${metaTextClasses}`}>
                          {dateRange || (isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending')}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish
                    ? 'Kokemuskohdat näkyvät tässä aikajanamuodossa.'
                    : 'Experience entries will render here in a timeline layout.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    if (section === 'education') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={resolvedSectionTitleClasses}>{isFinnish ? 'Koulutus' : 'Education'}</h4>
            <div className="mt-6 space-y-4">
              {education.length > 0 ? (
                education.map((item, index) => (
                  <div
                    key={`${item.school}-${item.degree}-${index}`}
                    className={atsFriendlyMode ? 'border border-gray-200 px-4 py-4' : educationCardClasses}
                    data-export-card="true"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-base font-semibold tracking-tight ${
                            atsFriendlyMode
                              ? 'text-gray-900'
                              : isDark
                                ? 'text-white'
                                : 'text-gray-900'
                          }`}
                        >
                          {[item.degree.trim(), item.school.trim()]
                            .filter(Boolean)
                            .join(', ') || (isFinnish ? 'Koulutusmerkintä' : 'Education entry')}
                        </p>
                      </div>
                      <p className={`text-xs font-medium uppercase tracking-[0.16em] ${metaTextClasses}`}>
                        {formatDateRange(item.startDate, item.endDate)
                          || (isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish
                    ? 'Koulutuskohdat näkyvät tässä, kun lisäät niitä.'
                    : 'Education items will appear here once you add them.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    if (section === 'skills') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={resolvedSectionTitleClasses}>{isFinnish ? 'Taidot' : 'Skills'}</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    data-export-skill="true"
                    className={
                      atsFriendlyMode
                        ? 'rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700'
                        : skillTagClasses
                    }
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Lisää taitoja näyttääksesi ne tageina.' : 'Add skills to display them as tags.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    if (section === 'links') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={resolvedSectionTitleClasses}>{isFinnish ? 'Linkit' : 'Links'}</h4>
            <div className="mt-4 space-y-3">
              {links.length > 0 ? (
                links.map(([key, value]) => (
                  <div
                    key={key}
                    data-export-card="true"
                    className={atsFriendlyMode ? 'border border-gray-200 px-4 py-3' : linkCardClasses}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${metaTextClasses}`}>
                      {formatLinkLabel(key)}
                    </p>
                    <p className={`mt-2 break-all text-sm ${supportingTextClasses}`}>
                      {value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish
                    ? 'Portfolio- ja some-linkit näkyvät tässä.'
                    : 'Portfolio and social links will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    return null
  }

  return (
    <article
      ref={previewRef}
      data-export-root="true"
      data-export-variant={variant}
      className={`preview-document fade-in-soft overflow-hidden rounded-[2rem] border shadow-xl transition-all duration-300 print:rounded-none print:border-0 print:bg-white print:shadow-none ${
        atsFriendlyMode ? 'preview-document--ats' : 'preview-document--designer'
      } ${
        atsFriendlyMode
          ? 'border-gray-300 bg-white text-gray-900 shadow-gray-300/15'
          : getPreviewClasses(variant, isDark)
      }`}
    >
      <header
        data-export-header="true"
        className={`preview-document__header px-5 py-6 sm:px-8 sm:py-7 print:px-0 ${
          atsFriendlyMode
            ? 'border-b border-gray-200 bg-white text-gray-900'
            : getHeaderColorClasses(variant, isDark)
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              data-export-ignore="true"
              className={`ds-kicker print:hidden ${atsFriendlyMode ? 'text-gray-500' : 'accent-text'}`}
            >
              {atsFriendlyMode
                ? isFinnish ? 'ATS-ystävällinen tila' : 'ATS-friendly mode'
                : `${templateConfig.label} ${isFinnish ? 'pohja' : 'Template'}`}
            </p>
            <h3
              className={`leading-none ${
                atsFriendlyMode ? 'mt-2 text-4xl font-semibold tracking-tight text-gray-900' : getHeaderTitleClasses(variant)
              }`}
            >
              {fullName}
            </h3>
            <p className={getHeaderSubtitleClasses(variant, isDark)}>
              {title}
            </p>
          </div>
          {showPhoto ? (
            <div className="shrink-0">
              <img
                src={photo}
                alt={`${fullName} profile`}
                data-export-photo="true"
                className={`rounded-2xl border ${
                  atsFriendlyMode
                    ? 'border-gray-300'
                    : isDark
                      ? 'border-white/15'
                      : 'border-black/10'
                }`}
                style={{ width: '6.2rem', height: '6.2rem', objectFit: 'cover' }}
              />
            </div>
          ) : null}
        </div>
      </header>

      <div
        data-export-content="true"
        className={`preview-document__content px-5 py-6 sm:px-8 sm:py-8 print:px-0 print:py-6 ${
          atsFriendlyMode
            ? 'space-y-7'
            : templateConfig.layout === 'split'
            ? getSplitColumnsClasses(variant)
            : 'space-y-6 sm:space-y-6'
        }`}
      >
        <div
          className="preview-document__column space-y-6 sm:space-y-6 lg:space-y-7"
          data-export-primary="true"
        >
          {visiblePrimarySections.map((section) => renderSection(section, 'main'))}
        </div>

        {visibleSecondarySections.length > 0 && !atsFriendlyMode ? (
          <aside
            className={`preview-document__column ${getSideContainerClasses(variant, isDark)}`}
            data-export-secondary="true"
          >
            {visibleSecondarySections.map((section) =>
              renderSection(section, 'side'),
            )}
          </aside>
        ) : null}

        {visibleSecondarySections.length > 0 && atsFriendlyMode ? (
          <div className="preview-document__column space-y-6" data-export-secondary="true">
            {visibleSecondarySections.map((section) => renderSection(section, 'main'))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

const MemoizedCVPreview = memo(CVPreview)

MemoizedCVPreview.displayName = 'CVPreview'

export default MemoizedCVPreview
