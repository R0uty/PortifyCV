import { memo, useMemo } from 'react'

import { createCvSnapshot } from '../utils/exporters'
import { getUiTheme } from '../utils/designSystem'
import { getCvTemplate } from '../utils/cvTemplates'

const previewSectionTitleClasses =
  'text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'

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
  if (variant === 'developer') {
    return isDark
      ? 'border-sky-900/60 bg-[#020817] shadow-slate-950/30'
      : 'border-slate-300 bg-slate-50 shadow-slate-950/10'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'border-slate-800 bg-slate-950 shadow-slate-950/30'
      : 'border-slate-200 bg-white shadow-slate-950/10'
  }

  if (variant === 'creative') {
    return isDark
      ? 'border-fuchsia-900/40 bg-slate-950 shadow-slate-950/35'
      : 'border-fuchsia-200 bg-white shadow-fuchsia-100/40'
  }

  return isDark
    ? 'border-slate-800 bg-slate-950 shadow-slate-950/30'
    : 'border-slate-200 bg-white shadow-slate-950/10'
}

function getHeaderClasses(variant) {
  if (variant === 'creative') {
    return 'bg-gradient-to-r from-fuchsia-700 via-sky-600 to-blue-700'
  }

  if (variant === 'corporate') {
    return 'bg-slate-800'
  }

  return 'bg-slate-900'
}

function getTitleClasses(variant) {
  if (variant === 'developer') {
    return 'mt-3 font-mono text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.8rem]'
  }

  if (variant === 'corporate') {
    return 'mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[3.15rem] font-serif'
  }

  if (variant === 'creative') {
    return 'mt-3 text-4xl font-semibold tracking-tight sm:text-5xl'
  }

  return 'mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'
}

function getSectionTitleClasses(variant) {
  if (variant === 'developer') {
    return `${previewSectionTitleClasses} font-mono`
  }

  if (variant === 'corporate') {
    return `${previewSectionTitleClasses} tracking-[0.18em]`
  }

  return previewSectionTitleClasses
}

function getMainSectionClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'rounded-3xl border border-sky-900/50 bg-slate-950/70 p-5 sm:p-6 print:border-0 print:px-0'
      : 'rounded-3xl border border-slate-300 bg-white p-5 sm:p-6 print:border-0 print:px-0'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 print:border-0 print:px-0'
      : 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 print:border-0 print:px-0'
  }

  if (variant === 'creative') {
    return isDark
      ? 'rounded-[2rem] border border-fuchsia-900/40 bg-gradient-to-br from-fuchsia-500/10 via-slate-900/70 to-sky-500/10 p-5 sm:p-6 print:border-0 print:px-0'
      : 'rounded-[2rem] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-sky-50 p-5 sm:p-6 print:border-0 print:px-0'
  }

  return isDark
    ? 'rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 print:border-0 print:px-0'
    : 'rounded-3xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 print:border-0 print:px-0'
}

function getSideContainerClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'space-y-5 rounded-3xl border border-sky-900/40 bg-slate-950/75 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0'
      : 'space-y-5 rounded-3xl border border-slate-300 bg-slate-100 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0'
  }

  if (variant === 'creative') {
    return isDark
      ? 'space-y-5 rounded-[2rem] border border-fuchsia-900/40 bg-gradient-to-br from-fuchsia-500/10 via-slate-950/80 to-sky-500/10 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0'
      : 'space-y-5 rounded-[2rem] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-sky-50 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:border-0 print:bg-transparent print:p-0'
  }

  if (variant === 'corporate') {
    return 'space-y-5 print:space-y-4'
  }

  return isDark
    ? 'space-y-5 rounded-3xl bg-slate-900/80 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
    : 'space-y-5 rounded-3xl bg-slate-50 p-5 sm:space-y-6 sm:p-6 print:rounded-none print:bg-transparent print:p-0'
}

function getSideSectionClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'rounded-3xl border border-sky-900/40 bg-slate-950/60 p-5 transition-colors print:border-0 print:px-0'
      : 'rounded-3xl border border-slate-300 bg-white p-5 transition-colors print:border-0 print:px-0'
  }

  if (variant === 'creative') {
    return isDark
      ? 'rounded-[1.75rem] border border-fuchsia-900/40 bg-slate-950/40 p-5 transition-colors print:border-0 print:px-0'
      : 'rounded-[1.75rem] border border-fuchsia-200 bg-white/90 p-5 transition-colors print:border-0 print:px-0'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-colors print:border-0 print:px-0'
      : 'rounded-2xl border border-slate-200 bg-white p-5 transition-colors print:border-0 print:px-0'
  }

  return isDark
    ? 'rounded-3xl border border-slate-800 bg-slate-950/40 p-5 transition-colors print:border-0 print:px-0'
    : 'rounded-3xl border border-slate-200 bg-white/80 p-5 transition-colors print:border-0 print:px-0'
}

function getSkillTagClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200'
      : 'rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200'
      : 'rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700'
  }

  if (variant === 'creative') {
    return isDark
      ? 'rounded-full bg-gradient-to-r from-fuchsia-500/20 to-sky-500/20 px-3 py-1.5 text-xs font-semibold text-fuchsia-100'
      : 'rounded-full bg-gradient-to-r from-fuchsia-100 to-sky-100 px-3 py-1.5 text-xs font-semibold text-fuchsia-800'
  }

  return isDark
    ? 'rounded-full bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-200'
    : 'rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-800'
}

function getTimelineBorderClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark ? 'border-sky-900/70' : 'border-sky-200'
  }

  if (variant === 'creative') {
    return isDark ? 'border-fuchsia-900/60' : 'border-fuchsia-200'
  }

  return isDark ? 'border-sky-900/70' : 'border-sky-100'
}

function getTimelineDotClasses(variant, isDark) {
  if (variant === 'creative') {
    return isDark ? 'border-slate-950 bg-fuchsia-500' : 'border-white bg-fuchsia-500'
  }

  return isDark ? 'border-slate-950 bg-sky-500' : 'border-white bg-sky-500'
}

function getEducationCardClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'rounded-2xl border border-sky-900/40 bg-slate-950/60 px-4 py-4'
      : 'rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4'
  }

  if (variant === 'creative') {
    return isDark
      ? 'rounded-[1.5rem] border border-fuchsia-900/40 bg-slate-950/50 px-4 py-4'
      : 'rounded-[1.5rem] border border-fuchsia-200 bg-white px-4 py-4'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4'
      : 'rounded-xl border border-slate-200 bg-slate-50 px-4 py-4'
  }

  return isDark
    ? 'rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4'
    : 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4'
}

function getLinkCardClasses(variant, isDark) {
  if (variant === 'developer') {
    return isDark
      ? 'rounded-2xl border border-sky-900/40 bg-slate-950/60 px-4 py-3'
      : 'rounded-2xl border border-slate-300 bg-white px-4 py-3'
  }

  if (variant === 'creative') {
    return isDark
      ? 'rounded-[1.5rem] border border-fuchsia-900/40 bg-slate-950/50 px-4 py-3'
      : 'rounded-[1.5rem] border border-fuchsia-200 bg-white px-4 py-3'
  }

  if (variant === 'corporate') {
    return isDark
      ? 'rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3'
      : 'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3'
  }

  return isDark
    ? 'rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3'
    : 'rounded-2xl border border-slate-200 bg-white px-4 py-3'
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
  atsFriendlyMode = false,
}) {
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isDark = ui.isDark
  const templateConfig = useMemo(() => getCvTemplate(template), [template])
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])
  const fullName = snapshot.fullName || 'Your Name'
  const title = snapshot.title || 'Professional Title'
  const about =
    snapshot.about || 'Your professional summary will appear here as you fill out the CV form.'
  const skills = snapshot.skills
  const experience = snapshot.experience
  const education = snapshot.education
  const links = Object.entries(snapshot.links)

  const sectionTitleClasses = getSectionTitleClasses(templateConfig.variant)
  const mainSectionClasses = getMainSectionClasses(templateConfig.variant, isDark)
  const sideSectionClasses = getSideSectionClasses(templateConfig.variant, isDark)
  const skillTagClasses = getSkillTagClasses(templateConfig.variant, isDark)
  const timelineBorderClasses = getTimelineBorderClasses(templateConfig.variant, isDark)
  const timelineDotClasses = getTimelineDotClasses(templateConfig.variant, isDark)
  const educationCardClasses = getEducationCardClasses(templateConfig.variant, isDark)
  const linkCardClasses = getLinkCardClasses(templateConfig.variant, isDark)
  const resolvedSectionTitleClasses = atsFriendlyMode
    ? 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'
    : sectionTitleClasses
  const resolvedMainSectionClasses = atsFriendlyMode
    ? 'border-b border-slate-200 pb-6 print:border-0 print:px-0'
    : mainSectionClasses
  const resolvedSideSectionClasses = atsFriendlyMode
    ? 'border-b border-slate-200 pb-6 print:border-0 print:px-0'
    : sideSectionClasses

  const renderSection = (section, placement = 'main') => {
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
                  ? 'border-slate-200'
                  : isDark
                    ? 'border-white/6'
                    : 'border-black/5'
              }`}
            >
              <h4 className={resolvedSectionTitleClasses}>About</h4>
              {!atsFriendlyMode ? (
                <div
                  data-export-summary-chip="true"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {templateConfig.summaryBadgeLabel}
                </div>
              ) : null}
            </div>
            <p
              className={`mt-5 text-[0.98rem] leading-8 ${
                atsFriendlyMode
                  ? 'text-slate-700'
                  : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
              }`}
            >
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
            <h4 className={resolvedSectionTitleClasses}>Experience</h4>
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
                      className={`relative border-l-2 pl-5 ${
                        atsFriendlyMode ? 'border-slate-300' : timelineBorderClasses
                      }`}
                    >
                      <span
                        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 shadow-sm ${
                          atsFriendlyMode ? 'border-white bg-slate-500' : timelineDotClasses
                        }`}
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p
                            className={`text-lg font-semibold tracking-tight ${
                              atsFriendlyMode
                                ? 'text-slate-900'
                                : isDark
                                  ? 'text-white'
                                  : 'text-slate-900'
                            }`}
                          >
                            {heading || 'Untitled role'}
                          </p>
                          {item.description.trim() ? (
                            <p
                              className={`mt-3 text-sm leading-7 ${
                                atsFriendlyMode
                                  ? 'text-slate-700'
                                  : isDark
                                    ? 'text-slate-300'
                                    : 'text-slate-600'
                              }`}
                            >
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <p className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          {dateRange || 'Dates pending'}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-500">
                  Experience entries will render here in a timeline layout.
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
            <h4 className={resolvedSectionTitleClasses}>Education</h4>
            <div className="mt-6 space-y-4">
              {education.length > 0 ? (
                education.map((item, index) => (
                  <div
                    key={`${item.school}-${item.degree}-${index}`}
                    className={atsFriendlyMode ? 'border border-slate-200 px-4 py-4' : educationCardClasses}
                    data-export-card="true"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-base font-semibold tracking-tight ${
                            atsFriendlyMode
                              ? 'text-slate-900'
                              : isDark
                                ? 'text-white'
                                : 'text-slate-900'
                          }`}
                        >
                          {[item.degree.trim(), item.school.trim()]
                            .filter(Boolean)
                            .join(', ') || 'Education entry'}
                        </p>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {formatDateRange(item.startDate, item.endDate) || 'Dates pending'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Education items will appear here once you add them.
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
            <h4 className={resolvedSectionTitleClasses}>Skills</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    data-export-skill="true"
                    className={
                      atsFriendlyMode
                        ? 'rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700'
                        : skillTagClasses
                    }
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">Add skills to display them as tags.</p>
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
            <h4 className={resolvedSectionTitleClasses}>Links</h4>
            <div className="mt-4 space-y-3">
              {links.length > 0 ? (
                links.map(([key, value]) => (
                  <div
                    key={key}
                    data-export-card="true"
                    className={atsFriendlyMode ? 'border border-slate-200 px-4 py-3' : linkCardClasses}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {formatLinkLabel(key)}
                    </p>
                    <p
                      className={`mt-2 break-all text-sm ${
                        atsFriendlyMode
                          ? 'text-slate-700'
                          : isDark
                            ? 'text-slate-200'
                            : 'text-slate-700'
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Portfolio and social links will appear here.
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
      className={`preview-document fade-in-soft overflow-hidden rounded-[2rem] border shadow-xl transition-all duration-300 print:rounded-none print:border-0 print:bg-white print:shadow-none ${
        atsFriendlyMode ? 'preview-document--ats' : 'preview-document--designer'
      } ${
        templateConfig.variant === 'minimal' && !atsFriendlyMode
          ? 'preview-document--full-width'
          : ''
      } ${
        atsFriendlyMode
          ? 'border-slate-300 bg-white text-slate-900 shadow-slate-300/15'
          : getPreviewClasses(templateConfig.variant, isDark)
      }`}
    >
      <header
        data-export-header="true"
        className={`preview-document__header px-5 py-7 sm:px-8 sm:py-9 print:px-0 ${
          atsFriendlyMode
            ? 'border-b border-slate-200 bg-white text-slate-900'
            : `${getHeaderClasses(templateConfig.variant)} text-white`
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`ds-kicker ${atsFriendlyMode ? 'text-slate-500' : 'accent-text'}`}>
              {atsFriendlyMode ? 'ATS-friendly mode' : `${templateConfig.label} Template`}
            </p>
            <h3
              className={`leading-none ${
                atsFriendlyMode ? 'mt-3 text-4xl font-semibold tracking-tight text-slate-900' : getTitleClasses(templateConfig.variant)
              }`}
            >
              {fullName}
            </h3>
            <p
              className={`mt-3 text-base leading-7 sm:text-lg ${
                atsFriendlyMode ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {title}
            </p>
          </div>

          {!atsFriendlyMode ? (
            <div
              data-export-ignore="true"
              className="inline-flex w-fit rounded-full border accent-border accent-surface px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] accent-text"
            >
              Real-time sync
            </div>
          ) : null}
        </div>
      </header>

      <div
        data-export-content="true"
        className={`preview-document__content px-5 py-6 sm:px-8 sm:py-8 print:px-0 print:py-6 ${
          atsFriendlyMode
            ? 'space-y-6'
            : templateConfig.layout === 'split'
            ? 'grid gap-5 sm:gap-6 2xl:grid-cols-[minmax(0,1.62fr)_minmax(240px,0.88fr)] 2xl:gap-8 print:grid-cols-1'
            : 'space-y-5 sm:space-y-6'
        }`}
      >
        <div
          className="preview-document__column space-y-5 sm:space-y-6 lg:space-y-7"
          data-export-primary="true"
        >
          {templateConfig.primarySections.map((section) => renderSection(section, 'main'))}
        </div>

        {templateConfig.secondarySections.length > 0 && !atsFriendlyMode ? (
          <aside
            className={`preview-document__column ${getSideContainerClasses(templateConfig.variant, isDark)}`}
            data-export-secondary="true"
          >
            {templateConfig.secondarySections.map((section) =>
              renderSection(section, 'side'),
            )}
          </aside>
        ) : null}

        {templateConfig.secondarySections.length > 0 && atsFriendlyMode ? (
          <div className="preview-document__column space-y-6" data-export-secondary="true">
            {templateConfig.secondarySections.map((section) => renderSection(section, 'main'))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

const MemoizedCVPreview = memo(CVPreview)

MemoizedCVPreview.displayName = 'CVPreview'

export default MemoizedCVPreview
