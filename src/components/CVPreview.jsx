// CVPreview — the main CV document renderer.
// Renders a styled resume preview using template-specific config objects.
// Handles data preparation, ATS mode overrides, section visibility, and layout rendering.
// Each template config (from ./templates/) provides CSS class getters and layout flags.

import { memo, useMemo } from 'react'

import { createCvSnapshot } from '../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../utils/cvForm'
import { getUiTheme } from '../utils/designSystem'
import { getCvTemplate } from '../utils/cvTemplates'
import {
  devIcons,
  parseSkillCategories,
  previewSectionTitleClasses,
  renderSectionCard,
  formatDateRange,
  formatLinkLabel,
} from './templates/shared'
import { getTemplateConfig } from './templates'

function CVPreview({
  formData,
  theme = 'dark',
  previewRef = null,
  template = 'minimal',
  locale = 'en',
  atsFriendlyMode = false,
}) {
  // ── Theme and template resolution ──────────────────────────────────
  // Resolve the UI theme (dark/light) and the template config (variant, layout, etc.)
  const ui = useMemo(() => getUiTheme(theme), [theme])
  const isDark = ui.isDark
  const templateConfig = useMemo(() => getCvTemplate(template, locale), [locale, template])
  const t = getTemplateConfig(templateConfig.variant)
  const variant = templateConfig.variant
  const isFinnish = locale === 'fi'
  const isCompact = t.isCompact === true

  // ── CV data extraction ─────────────────────────────────────────────
  // Pull all CV data from the form state, with fallback placeholders
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

  // ── Section visibility and ordering ────────────────────────────────
  // Merge default visibility with user overrides, then sort sections per template order
  const sectionVisibility = {
    ...createSectionVisibility(),
    ...(formData.sectionVisibility ?? {}),
  }
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const orderedSections = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
  const primarySections = new Set(templateConfig.primarySections)
  const secondarySections = new Set(templateConfig.secondarySections)
  const visiblePrimarySections = orderedSections.filter(
    (section) => primarySections.has(section) && sectionVisibility[section],
  )
  const visibleSecondarySections = orderedSections.filter(
    (section) => secondarySections.has(section) && sectionVisibility[section],
  )

  // ── Accent color for ATS mode ──────────────────────────────────────
  // Some templates define an accent color used to tint ATS-mode badges
  const accent = t.accentColor()

  // ── Resolved CSS classes ───────────────────────────────────────────
  // Each class is either the template's normal class or an ATS-friendly override.
  // ATS mode strips colors, backgrounds, shadows, and decorative styling.

  // Section title — uses accent color in ATS mode if available
  const sectionTitleClasses = atsFriendlyMode
    ? accent
      ? `${previewSectionTitleClasses} text-${accent.light}-600`
      : `${previewSectionTitleClasses} text-gray-500`
    : t.sectionTitle(previewSectionTitleClasses)

  // Main content section wrapper
  const resolvedMainSectionClasses = atsFriendlyMode
    ? 'border-b border-gray-200 pb-6 print:border-0 print:px-0'
    : t.mainSection(isDark)

  // Sidebar section wrapper
  const resolvedSideSectionClasses = atsFriendlyMode
    ? 'border-b border-gray-200 pb-6 print:border-0 print:px-0'
    : t.sideSection(isDark)

  // Body text color — slightly lighter in dark mode, minimal gets special treatment
  const bodyTextClasses = atsFriendlyMode
    ? 'text-gray-700'
    : isDark
      ? variant === 'minimal'
        ? 'text-gray-100'
        : 'text-gray-300'
      : 'text-gray-600'

  // Supporting text color — used for link values and secondary content
  const supportingTextClasses = atsFriendlyMode
    ? 'text-gray-700'
    : isDark
      ? 'text-gray-200'
      : 'text-gray-700'

  // Meta text color — used for dates, labels, and metadata
  const metaTextClasses = atsFriendlyMode
    ? 'text-gray-500'
    : isDark
      ? variant === 'minimal'
        ? 'text-gray-300'
        : 'text-gray-400'
      : 'text-gray-400'

  // Skill tag pill — ATS uses accent-tinted pills or plain gray
  const resolvedSkillTagClasses = atsFriendlyMode
    ? accent
      ? `rounded-md border border-${accent.light}-200 bg-${accent.light}-50 px-3 py-1.5 text-xs font-semibold text-${accent.light}-700`
      : 'rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700'
    : t.skillTag(isDark)

  // Timeline left-border and dot — ATS uses neutral gray
  const resolvedTimelineBorderClasses = atsFriendlyMode
    ? 'border-gray-300'
    : t.timelineBorder(isDark)
  const resolvedTimelineDotClasses = atsFriendlyMode
    ? 'border-white bg-gray-500'
    : t.timelineDot(isDark)

  // Education and link card wrappers — ATS uses plain bordered cards
  const resolvedEducationCardClasses = atsFriendlyMode
    ? 'border border-gray-200 px-4 py-4'
    : t.educationCard(isDark)
  const resolvedLinkCardClasses = atsFriendlyMode
    ? 'border border-gray-200 px-4 py-3'
    : t.linkCard(isDark)

  // Summary badge pill — ATS uses accent-tinted or plain gray
  const summaryBadgeClasses = atsFriendlyMode
    ? accent
      ? `border border-${accent.light}-200 bg-${accent.light}-50 text-${accent.light}-700`
      : 'bg-gray-100 text-gray-500'
    : t.summaryBadge(isDark)

  // ── Compact variant size overrides ─────────────────────────────────
  // When isCompact is true, all sizes and spacing are reduced for density
  const aboutTextSize = isCompact ? 'text-[0.82rem] leading-6' : 'text-[0.98rem] leading-8'
  const experienceItemGap = isCompact ? 'space-y-4' : 'space-y-7'
  const experienceItemPadding = isCompact ? 'pl-5' : 'pl-6'
  const experienceItemBorder = isCompact ? 'border-l' : 'border-l-2'
  const experienceItemDot = isCompact ? 'h-3 w-3 -left-[7px]' : 'h-4 w-4 -left-[9px]'
  const experienceTitleSize = isCompact ? 'text-base' : 'text-lg'
  const experienceDescSize = isCompact ? 'text-xs leading-5' : 'text-sm leading-7'
  const experienceDateSize = isCompact ? 'text-[0.6rem]' : 'text-xs'
  const educationItemGap = isCompact ? 'space-y-2' : 'space-y-4'
  const educationTitleSize = isCompact ? 'text-sm' : 'text-base'
  const linkItemGap = isCompact ? 'space-y-1.5' : 'space-y-3'
  const sectionSpacing = isCompact ? 'space-y-3' : 'space-y-6 sm:space-y-6'
  const contentPadding = t.contentPadding
    || (isCompact
      ? 'px-4 py-4 sm:px-5 sm:py-5 print:px-0 print:py-4'
      : 'px-5 py-6 sm:px-8 sm:py-8 print:px-0 print:py-6')
  const headerPadding = isCompact
    ? 'px-4 py-4 sm:px-5 sm:py-5 print:px-0'
    : 'px-5 py-6 sm:px-8 sm:py-7 print:px-0'

  // ── Section renderer ───────────────────────────────────────────────
  // Dispatches to the correct section layout based on section name and template config.
  // Each section returns a renderSectionCard() call with the appropriate children.
  const renderSection = (section, placement = 'main') => {
    if (!sectionVisibility[section]) {
      return null
    }

    const sectionClasses =
      placement === 'main' ? resolvedMainSectionClasses : resolvedSideSectionClasses

    // ── About section ────────────────────────────────────────────────
    // Renders the professional summary with a section title, summary badge, and body text.
    if (section === 'about') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <div
              className={`flex items-center justify-between gap-4 border-b pb-3 ${
                atsFriendlyMode ? 'border-gray-200' : t.aboutBorder(isDark)
              }`}
            >
              <h4 className={sectionTitleClasses}>{isFinnish ? 'Esittely' : 'About'}</h4>
              {!atsFriendlyMode ? (
                <div
                  data-export-summary-chip="true"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${summaryBadgeClasses}`}
                >
                  {templateConfig.summaryBadgeLabel}
                </div>
              ) : null}
            </div>
            <p className={`mt-4 ${aboutTextSize} ${bodyTextClasses}`}>
              {about}
            </p>
          </>
        ),
      })
    }

    // ── Experience section ───────────────────────────────────────────
    // Two layouts: 'clean' (role/company separate, no dots) or 'timeline' (with left-border dots).
    // 'clean' is used by minimal, developer, creative, executive, timeline templates.
    // 'timeline' is used by modern, graduate, compact, portfolio templates.
    if (section === 'experience') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={sectionTitleClasses}>{isFinnish ? 'Kokemus' : 'Experience'}</h4>
            <div className={`mt-5 ${experienceItemGap}`}>
              {experience.length > 0 ? (
                experience.map((item, index) => {
                  const dateRange = formatDateRange(item.startDate, item.endDate)
                  const heading = [item.role.trim(), item.company.trim()]
                    .filter(Boolean)
                    .join(' @ ')

                  // Clean layout — role and company shown separately, no timeline dots
                  if (t.experienceLayout === 'clean') {
                    return (
                      <div
                        key={`${item.role}-${item.company}-${index}`}
                        className="relative pl-0"
                        data-export-card="true"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <p
                              className={`${experienceTitleSize} font-semibold tracking-tight text-gray-900`}
                            >
                              {item.role.trim() || (isFinnish ? 'Nimeämätön rooli' : 'Untitled role')}
                            </p>
                            {item.company.trim() ? (
                              <p className="text-sm text-gray-500">
                                {item.company}
                              </p>
                            ) : null}
                            {item.description.trim() ? (
                              <p className={`mt-2 ${experienceDescSize} ${bodyTextClasses}`}>
                                {item.description}
                              </p>
                            ) : null}
                          </div>

                          <p className={`shrink-0 sm:ml-4 ${experienceDateSize} font-medium uppercase tracking-[0.16em] ${metaTextClasses}`}>
                            {dateRange || (isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending')}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  // Timeline layout — combined heading with left-border and dot marker
                  return (
                    <div
                      key={`${item.role}-${item.company}-${index}`}
                      className={`relative ${experienceItemBorder} ${experienceItemPadding} ${resolvedTimelineBorderClasses}`}
                      data-export-card="true"
                    >
                      <span
                        className={`absolute ${experienceItemDot} top-1 rounded-full border-4 shadow-sm ${resolvedTimelineDotClasses}`}
                      />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p
                            className={`${experienceTitleSize} font-semibold tracking-tight ${
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
                            <p className={`mt-2 ${experienceDescSize} ${bodyTextClasses}`}>
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <p className={`shrink-0 ${experienceDateSize} font-medium uppercase tracking-[0.16em] ${metaTextClasses}`}>
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

    // ── Education section ────────────────────────────────────────────
    // Renders education entries with degree, school, and date range.
    // Card styling varies by template (clean borders, rounded cards, etc.)
    if (section === 'education') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={sectionTitleClasses}>{isFinnish ? 'Koulutus' : 'Education'}</h4>
            <div className={`mt-5 ${educationItemGap}`}>
              {education.length > 0 ? (
                education.map((item, index) => (
                  <div
                    key={`${item.school}-${item.degree}-${index}`}
                    className={resolvedEducationCardClasses}
                    data-export-card="true"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p
                          className={`${educationTitleSize} font-semibold tracking-tight text-gray-900`}
                        >
                          {item.degree.trim() || (isFinnish ? 'Koulutusmerkintä' : 'Education entry')}
                        </p>
                        {item.school.trim() ? (
                          <p className="text-sm text-gray-500">{item.school}</p>
                        ) : null}
                      </div>
                      <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.16em] ${metaTextClasses}`}>
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

    // ── Skills section ───────────────────────────────────────────────
    // Two layouts: 'categorized' (grouped by category) or 'flat' (all tags in a row).
    // 'categorized' is used by developer, creative, executive, timeline templates.
    // 'flat' is used by minimal, modern, graduate, compact, portfolio templates.
    if (section === 'skills') {
      // Categorized layout — skills grouped under category headings
      if (t.skillsLayout === 'categorized') {
        const categories = parseSkillCategories(skills, isFinnish)
        return renderSectionCard({
          section,
          placement,
          classes: sectionClasses,
          children: (
            <>
              <h4 className={sectionTitleClasses}>{isFinnish ? 'Taidot' : 'Skills'}</h4>
              <div className="mt-4 space-y-3">
                {skills.length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat.label}>
                      <p className={`mb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] ${t.categoryLabelColor}`}>{cat.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((skill) => (
                          <span key={skill} data-export-skill="true" className={resolvedSkillTagClasses}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
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

      // Flat layout — all skill tags in a single flex-wrap row
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={sectionTitleClasses}>{isFinnish ? 'Taidot' : 'Skills'}</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    data-export-skill="true"
                    className={resolvedSkillTagClasses}
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

    // ── Links section ────────────────────────────────────────────────
    // Three layouts: 'icon-list' (icon + label + value), 'minimal-inline' (inline pairs),
    // or 'cards' (card-style with label and value).
    // 'icon-list' is used by developer, creative, executive, timeline.
    // 'minimal-inline' is used by minimal.
    // 'cards' is used by modern, graduate, compact, portfolio.
    if (section === 'links') {
      // Icon-list layout — SVG icon + uppercase label + truncated value
      if (t.linksLayout === 'icon-list') {
        return renderSectionCard({
          section,
          placement,
          classes: sectionClasses,
          children: (
            <>
              <h4 className={sectionTitleClasses}>{isFinnish ? 'Linkit' : 'Links'}</h4>
              <div className="mt-3 space-y-1.5">
                {links.length > 0 ? (
                  links.map(([key, value]) => (
                    <div key={key} data-export-card="true" className="flex items-center gap-2 py-1">
                      <span className={`shrink-0 ${t.linkIconColor}`}>{devIcons[key] || null}</span>
                      <div className="min-w-0">
                        <p className={`text-[0.6rem] font-bold uppercase tracking-[0.18em] ${t.linkIconColor || 'text-gray-400'}`}>{formatLinkLabel(key)}</p>
                        <p className="truncate text-[0.72rem] text-gray-600">{value}</p>
                      </div>
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

      // Minimal-inline layout — uppercase label + value on the same line, flex-wrapped
      if (t.linksLayout === 'minimal-inline') {
        return renderSectionCard({
          section,
          placement,
          classes: sectionClasses,
          children: (
            <>
              <h4 className={sectionTitleClasses}>{isFinnish ? 'Linkit' : 'Links'}</h4>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {links.length > 0 ? (
                  links.map(([key, value]) => (
                    <div key={key} data-export-card="true" className="flex items-center gap-1.5 text-sm">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{formatLinkLabel(key)}</span>
                      <span className="text-gray-600">{value}</span>
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

      // Cards layout — bordered card with uppercase label and break-all value
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            <h4 className={sectionTitleClasses}>{isFinnish ? 'Linkit' : 'Links'}</h4>
            <div className={`mt-4 ${linkItemGap}`}>
              {links.length > 0 ? (
                links.map(([key, value]) => (
                  <div
                    key={key}
                    data-export-card="true"
                    className={resolvedLinkCardClasses}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${metaTextClasses}`}>
                      {formatLinkLabel(key)}
                    </p>
                    <p className={`mt-1 break-all text-sm ${supportingTextClasses}`}>
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

  // ── Document shell ─────────────────────────────────────────────────
  // The outer <article> wraps the entire CV. Style varies by template and ATS mode.
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
          : t.preview(isDark)
      }`}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      {/* Contains: template label, full name, title, contact info, and optional photo */}
      <header
        data-export-header="true"
        className={`preview-document__header ${headerPadding} print:px-0 ${
          atsFriendlyMode
            ? 'border-b border-gray-200 bg-white text-gray-900'
            : t.headerColor(isDark)
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Template label — hidden in print, shows "ATS-friendly mode" when ATS is on */}
            <p
              data-export-ignore="true"
              className={`ds-kicker print:hidden ${atsFriendlyMode ? 'text-gray-500' : 'text-current/80'}`}
            >
              {atsFriendlyMode
                ? isFinnish ? 'ATS-ystävällinen tila' : 'ATS-friendly mode'
                : `${templateConfig.label} ${isFinnish ? 'pohja' : 'Template'}`}
            </p>

            {/* Full name heading — uses template-specific font size and weight */}
            <h3
              className={`leading-none ${
                atsFriendlyMode ? 'mt-2 text-4xl font-semibold tracking-tight text-gray-900' : t.headerTitle()
              }`}
            >
              {fullName}
            </h3>

            {/* Professional title / subtitle */}
            <p className={t.headerSubtitle(isDark)}>
              {title}
            </p>

            {/* Contact info — piped layout (minimal: values separated by |) */}
            {t.headerContactMode === 'piped' && links.length > 0 && links.some(([, v]) => v.trim()) ? (
              <p className={`mt-3 flex flex-wrap items-center ${t.headerContactGap} gap-y-1 ${t.headerContactTextSize} leading-5 ${t.headerContactTextColor}`}>
                {links.filter(([, v]) => v.trim()).map(([key, value], i, arr) => (
                  <span key={key} className="flex items-center gap-x-2">
                    <span>{value}</span>
                    {i < arr.length - 1 ? <span className="text-gray-300">|</span> : null}
                  </span>
                ))}
              </p>
            ) : null}

            {/* Contact info — icon layout (developer, creative, executive, timeline) */}
            {t.headerContactMode === 'icons' && links.length > 0 && links.some(([, v]) => v.trim()) ? (
              <div className={`mt-3 flex flex-wrap items-center ${t.headerContactGap} gap-y-1.5`}>
                {links.filter(([, v]) => v.trim()).map(([key, value]) => (
                  <span key={key} className={`flex items-center gap-1.5 ${t.headerContactTextSize} leading-5 ${t.headerContactTextColor}`}>
                    {t.headerContactIconColor ? (
                      <span className={t.headerContactIconColor}>{devIcons[key] || null}</span>
                    ) : (
                      devIcons[key] || null
                    )}
                    <span>{value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Profile photo — shown when enabled and photo exists */}
          {showPhoto ? (
            <div className="shrink-0">
              <img
                src={photo}
                alt={`${fullName} profile`}
                data-export-photo="true"
                className={`rounded-2xl border-2 ${
                  atsFriendlyMode
                    ? 'border-gray-300'
                    : t.photoBorder(isDark)
                }`}
                style={{ width: '7rem', height: '7rem', objectFit: 'cover' }}
              />
            </div>
          ) : null}
        </div>
      </header>

      {/* ── Content area ──────────────────────────────────────────── */}
      {/* Renders primary sections (main column) and secondary sections (sidebar).
          In split layout, sidebar uses CSS grid. In stacked layout, all sections are vertical.
          ATS mode flattens everything into a single column. */}
      <div
        data-export-content="true"
        className={`preview-document__content ${contentPadding} print:px-0 ${
          atsFriendlyMode
            ? 'space-y-7'
            : templateConfig.layout === 'split'
            ? t.splitColumns()
            : sectionSpacing
        }`}
      >
        {/* Primary sections column — experience, about, education, etc. */}
        <div
          className={`preview-document__column ${sectionSpacing} lg:space-y-7 ${
            t.sidebarFirst ? 'order-2' : ''
          }`}
          data-export-primary="true"
        >
          {visiblePrimarySections.map((section) => renderSection(section, 'main'))}
        </div>

        {/* Secondary sections sidebar — skills, links (non-ATS only) */}
        {visibleSecondarySections.length > 0 && !atsFriendlyMode ? (
          <aside
            className={`preview-document__column ${
              t.sidebarFirst ? 'order-1' : ''
            } ${t.sideContainer(isDark)}`}
            data-export-secondary="true"
          >
            {visibleSecondarySections.map((section) =>
              renderSection(section, 'side'),
            )}
          </aside>
        ) : null}

        {/* ATS mode — secondary sections rendered as flat main sections */}
        {visibleSecondarySections.length > 0 && atsFriendlyMode ? (
          <div className="preview-document__column space-y-6" data-export-secondary="true">
            {visibleSecondarySections.map((section) => renderSection(section, 'main'))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

// Memoize to prevent unnecessary re-renders when props haven't changed
const MemoizedCVPreview = memo(CVPreview)

MemoizedCVPreview.displayName = 'CVPreview'

export default MemoizedCVPreview
