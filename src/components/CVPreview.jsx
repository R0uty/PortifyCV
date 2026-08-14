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
  contactIcons,
  sectionIcons,
  parseSkillCategories,
  previewSectionTitleClasses,
  renderSectionCard,
  formatDateRange,
  formatLinkLabel,
} from './templates/shared'
import { getTemplateConfig } from './templates'
import DeveloperShowcase from './templates/DeveloperShowcase'
import CreativeShowcase from './templates/CreativeShowcase'
import ModernShowcase from './templates/ModernShowcase'
import ExecutiveShowcase from './templates/ExecutiveShowcase'
import TimelineShowcase from './templates/TimelineShowcase'
import GraduateShowcase from './templates/GraduateShowcase'
import CompactShowcase from './templates/CompactShowcase'
import PortfolioShowcase from './templates/PortfolioShowcase'

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

  // ── Developer Showcase delegation ───────────────────────────────────
  // The Developer template's non-ATS look is a fully bespoke visual system
  // (sidebar, gradients, cards, animations) that doesn't fit the shared
  // section-renderer below. ATS mode (the app's existing global toggle)
  // still falls through to the generic flat renderer beneath this check.
  // IMPORTANT: this must come after every hook call above (Rules of Hooks) —
  // never move it earlier without checking no hook follows it.
  if (variant === 'developer' && !atsFriendlyMode) {
    return (
      <DeveloperShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }

  // ── Creative Showcase delegation ────────────────────────────────────
  // Same reasoning as Developer Showcase above — a fully bespoke visual
  // system that ATS mode bypasses entirely.
  if (variant === 'creative' && !atsFriendlyMode) {
    return (
      <CreativeShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
      />
    )
  }

  // ── Modern Showcase delegation ───────────────────────────────────────
  // Same reasoning as Developer/Creative Showcase above — a fully bespoke
  // "premium executive" visual system that ATS mode bypasses entirely.
  if (variant === 'modern' && !atsFriendlyMode) {
    return (
      <ModernShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }

  // ── Executive Showcase delegation ───────────────────────────────────
  // Same reasoning as Developer/Creative/Modern Showcase above — a fully
  // bespoke "boardroom" visual system that ATS mode bypasses entirely.
  if (variant === 'executive' && !atsFriendlyMode) {
    return (
      <ExecutiveShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }

  // ── Timeline Showcase delegation ────────────────────────────────────
  // Same reasoning as Developer/Creative/Modern/Executive Showcase above —
  // a fully bespoke "career storytelling" visual system that ATS mode
  // bypasses entirely.
  if (variant === 'timeline' && !atsFriendlyMode) {
    return (
      <TimelineShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }

  // ── Graduate Showcase delegation ────────────────────────────────────
  // Same reasoning as Developer/Creative/Modern/Executive/Timeline Showcase
  // above — a fully bespoke "future potential" visual system that ATS mode
  // bypasses entirely.
  if (variant === 'graduate' && !atsFriendlyMode) {
    return (
      <GraduateShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }

  // ── Compact Showcase delegation ─────────────────────────────────────
  // Same reasoning as Developer/Creative/Modern/Executive/Timeline/Graduate
  // Showcase above — a fully bespoke "ultra-efficient one-pager" visual
  // system that ATS mode bypasses entirely.
  if (variant === 'compact' && !atsFriendlyMode) {
    return (
      <CompactShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }

  // ── Portfolio Showcase delegation ───────────────────────────────────
  // Same reasoning as Developer/Creative/Modern/Executive/Timeline/
  // Graduate/Compact Showcase above — a fully bespoke "portfolio website
  // condensed into a résumé" visual system that ATS mode bypasses entirely.
  if (variant === 'portfolio' && !atsFriendlyMode) {
    return (
      <PortfolioShowcase
        formData={formData}
        locale={locale}
        previewRef={previewRef}
        templateConfig={templateConfig}
        showcaseConfig={t}
      />
    )
  }
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
  const personalContactItems = [
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const skills = snapshot.skills
  const experience = snapshot.experience
  const education = snapshot.education
  const links = Object.entries(snapshot.links)
  const coreStrengths = snapshot.coreStrengths
  const certificates = snapshot.certificates
  const projects = snapshot.projects
  const languages = snapshot.languages
  const interests = snapshot.interests
  const achievements = snapshot.achievements
  const openSource = snapshot.openSource
  const publications = snapshot.publications
  const leadership = snapshot.leadership
  const memberships = snapshot.memberships
  const speaking = snapshot.speaking
  const volunteering = snapshot.volunteering
  const internships = snapshot.internships
  const caseStudies = snapshot.caseStudies
  const testimonials = snapshot.testimonials

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

  // Accent text color used for project names, etc. — falls back to the
  // template's dedicated override class when one is provided.
  const accentTextClasses = atsFriendlyMode
    ? 'text-gray-900'
    : t.accentTextClass || (accent ? `text-${accent.light}-600` : 'text-gray-700')

  // ── Resolved CSS classes ───────────────────────────────────────────
  // Each class is either the template's normal class or an ATS-friendly override.
  // ATS mode strips colors, backgrounds, shadows, and decorative styling.

  // Section title — ATS mode is fully monochrome, no accent color
  const sectionTitleClasses = atsFriendlyMode
    ? `${previewSectionTitleClasses} text-gray-500`
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

  // Skill tag pill — ATS mode is fully monochrome, no accent color
  const resolvedSkillTagClasses = atsFriendlyMode
    ? 'rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700'
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

  // Summary badge pill — ATS mode is fully monochrome, no accent color
  const summaryBadgeClasses = atsFriendlyMode
    ? 'bg-gray-100 text-gray-500'
    : t.summaryBadge(isDark)

  // Professional title / subtitle under the name — ATS mode strips accent color
  const resolvedHeaderSubtitleClasses = atsFriendlyMode
    ? 'mt-2 text-base text-gray-500'
    : t.headerSubtitle(isDark)

  // Skill category label (categorized skills layout) — ATS mode strips accent color
  const resolvedCategoryLabelColor = atsFriendlyMode ? 'text-gray-500' : t.categoryLabelColor

  // Link icon + label color (icon-list links layout) — ATS mode strips accent color
  const resolvedLinkIconColor = atsFriendlyMode ? 'text-gray-400' : t.linkIconColor

  // Experience company/location line — ATS mode strips accent color
  const resolvedExperienceCompanyColor = atsFriendlyMode
    ? 'text-gray-500'
    : t.experienceCompanyColor || 'text-gray-500'

  // Certificate bullet dot — ATS mode strips accent color
  const resolvedBulletColor = atsFriendlyMode ? 'bg-gray-400' : t.bulletColor || 'bg-gray-400'

  // Header contact text/icon color and per-item class overrides — ATS mode strips
  // accent color. Item/icon-wrap classes are forced to null in ATS so the generic
  // fallback templates (which read the color variables below) are used instead of
  // any template-specific class string with a color baked directly into it.
  const resolvedHeaderContactTextColor = atsFriendlyMode ? 'text-gray-500' : t.headerContactTextColor
  const resolvedHeaderContactIconColor = atsFriendlyMode ? 'text-gray-400' : t.headerContactIconColor
  const resolvedHeaderContactItemClass = atsFriendlyMode ? null : t.headerContactItemClass
  const resolvedHeaderContactIconWrapClass = atsFriendlyMode ? null : t.headerContactIconWrapClass

  // Small circular icon badge fill/glyph color (Core Strengths list, Interests glyphs)
  // — ATS mode strips accent color
  const resolvedSectionIconBg = atsFriendlyMode ? 'bg-gray-100' : t.sectionIconBg || 'bg-gray-100'
  const resolvedSectionIconColor = atsFriendlyMode ? 'text-gray-500' : t.sectionIconColor || 'text-gray-500'

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

  // Small circular monochrome icon rendered before a section title — opt-in via
  // the template's `showSectionIcons` flag (used by the Tech Executive template).
  const renderSectionHeading = (key, label) => (
    <div className="flex items-center gap-2.5">
      {!atsFriendlyMode && t.showSectionIcons && sectionIcons[key] ? (
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${t.sectionIconBg || 'bg-gray-100'} ${t.sectionIconColor || 'text-gray-500'}`}
          aria-hidden="true"
        >
          {sectionIcons[key]}
        </span>
      ) : null}
      <h4 className={sectionTitleClasses}>{label}</h4>
    </div>
  )

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
              {renderSectionHeading('about', isFinnish ? 'Esittely' : 'About')}
              {!atsFriendlyMode ? (
                <div
                  data-export-summary-chip="true"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${summaryBadgeClasses}`}
                >
                  {templateConfig.summaryBadgeLabel}
                </div>
              ) : null}
            </div>
            <p className={`mt-4 whitespace-pre-line ${aboutTextSize} ${bodyTextClasses}`}>
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
            {renderSectionHeading('experience', isFinnish ? 'Kokemus' : 'Experience')}
            <div className={`mt-5 ${experienceItemGap}`}>
              {experience.length > 0 ? (
                experience.map((item, index) => {
                  const dateRange = formatDateRange(
                    item.startDate,
                    item.endDate,
                    item.isCurrent,
                    isFinnish ? 'Nykyinen' : 'Present',
                  )
                  const heading = [item.role.trim(), item.company.trim()]
                    .filter(Boolean)
                    .join(' @ ')
                  const renderDescription = (text) => {
                    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

                    if (lines.length > 1) {
                      return (
                        <ul className={`mt-2 list-disc space-y-1.5 pl-4 ${experienceDescSize} ${bodyTextClasses}`}>
                          {lines.map((line, lineIndex) => (
                            <li key={lineIndex}>{line}</li>
                          ))}
                        </ul>
                      )
                    }

                    return <p className={`mt-2 ${experienceDescSize} ${bodyTextClasses}`}>{text}</p>
                  }
                  const renderExtras = () => (
                    <>
                      {item.achievements?.length > 0 ? (
                        <ul className={`mt-2 list-disc space-y-1.5 pl-4 ${experienceDescSize} ${bodyTextClasses}`}>
                          {item.achievements.map((achievement, achievementIndex) => (
                            <li key={achievementIndex}>{achievement}</li>
                          ))}
                        </ul>
                      ) : null}
                      {item.technologies?.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.technologies.map((technology) => (
                            <span key={technology} data-export-skill="true" className={resolvedSkillTagClasses}>
                              {technology}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </>
                  )

                  // Timeline-clean layout — left-border + dot marker, with role, company,
                  // and location shown as separate lines (used by the Tech Executive template).
                  if (t.experienceLayout === 'timeline-clean') {
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
                          <div className="min-w-0 flex-1">
                            <p
                              className={`${experienceTitleSize} font-semibold tracking-tight ${
                                atsFriendlyMode
                                  ? 'text-gray-900'
                                  : isDark
                                    ? 'text-white'
                                    : 'text-gray-900'
                              }`}
                            >
                              {item.role.trim() || (isFinnish ? 'Nimeämätön rooli' : 'Untitled role')}
                            </p>
                            {item.company.trim() || item.location.trim() ? (
                              <p className={`text-sm font-medium ${resolvedExperienceCompanyColor}`}>
                                {[item.company.trim(), item.location.trim()].filter(Boolean).join(' · ')}
                              </p>
                            ) : null}
                            {item.description.trim() ? renderDescription(item.description) : null}
                            {renderExtras()}
                          </div>

                          {/* Capped width + tighter tracking than the shared "clean" date
                              treatment: this layout's extra left border/padding narrows the
                              main column further, so a spelled-out date range ("Jan 2022 -
                              Present") at full width was eating ~45% of the row and forcing
                              the description into a cramped single column. Wrapping the date
                              onto two lines instead gives the description most of the row. */}
                          <p className={`shrink-0 sm:ml-4 sm:max-w-[5.5rem] sm:text-right ${experienceDateSize} font-medium uppercase tracking-[0.06em] ${metaTextClasses}`}>
                            {dateRange || (isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending')}
                          </p>
                        </div>
                      </div>
                    )
                  }

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
                              <p className={`mt-2 whitespace-pre-line ${experienceDescSize} ${bodyTextClasses}`}>
                                {item.description}
                              </p>
                            ) : null}
                            {renderExtras()}
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
                            <p className={`mt-2 whitespace-pre-line ${experienceDescSize} ${bodyTextClasses}`}>
                              {item.description}
                            </p>
                          ) : null}
                          {renderExtras()}
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
            {renderSectionHeading('education', isFinnish ? 'Koulutus' : 'Education')}
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
                        {item.school.trim() || item.location.trim() ? (
                          <p className="text-sm text-gray-500">
                            {[item.school.trim(), item.location.trim()].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.16em] ${metaTextClasses}`}>
                        {formatDateRange(item.startDate, item.endDate)
                          || (isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending')}
                      </p>
                    </div>
                    {item.honors ? (
                      <p className={`mt-1 text-xs italic ${bodyTextClasses}`}>{item.honors}</p>
                    ) : null}
                    {item.grade || item.coursework ? (
                      <p className={`mt-1 text-xs ${metaTextClasses}`}>
                        {[item.grade, item.coursework].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
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
              {renderSectionHeading('skills', isFinnish ? 'Taidot' : 'Skills')}
              <div className="mt-4 space-y-3">
                {skills.length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat.label}>
                      <p className={`mb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] ${resolvedCategoryLabelColor}`}>{cat.label}</p>
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
            {renderSectionHeading('skills', isFinnish ? 'Taidot' : 'Skills')}
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
              {renderSectionHeading('links', isFinnish ? 'Linkit' : 'Links')}
              <div className="mt-3 space-y-1.5">
                {links.length > 0 ? (
                  links.map(([key, value]) => (
                    <div key={key} data-export-card="true" className="flex items-center gap-2 py-1">
                      <span className={`shrink-0 ${resolvedLinkIconColor}`}>{devIcons[key] || null}</span>
                      <div className="min-w-0">
                        <p className={`text-[0.6rem] font-bold uppercase tracking-[0.18em] ${resolvedLinkIconColor || 'text-gray-400'}`}>{formatLinkLabel(key)}</p>
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
              {renderSectionHeading('links', isFinnish ? 'Linkit' : 'Links')}
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
            {renderSectionHeading('links', isFinnish ? 'Linkit' : 'Links')}
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

    // ── Core Strengths section ───────────────────────────────────────
    // Simple icon list — icon, bold title, short supporting description.
    if (section === 'coreStrengths') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('coreStrengths', isFinnish ? 'Vahvuudet' : 'Core Strengths')}
            <div className="mt-4 space-y-4">
              {coreStrengths.length > 0 ? (
                coreStrengths.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-start gap-3" data-export-card="true">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${resolvedSectionIconBg} ${resolvedSectionIconColor}`}
                      aria-hidden="true"
                    >
                      {sectionIcons.coreStrengths}
                    </span>
                    <div className="min-w-0">
                      {item.title ? (
                        <p className="text-sm font-semibold tracking-tight text-gray-900">{item.title}</p>
                      ) : null}
                      {item.description ? (
                        <p className={`mt-0.5 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Vahvuudet näkyvät tässä.' : 'Core strengths will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Certificates section ─────────────────────────────────────────
    // Plain bullet list — no badges, no progress rings.
    if (section === 'certificates') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('certificates', isFinnish ? 'Sertifikaatit' : 'Certificates')}
            {certificates.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {certificates.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    className={`flex items-start gap-2 text-sm ${supportingTextClasses}`}
                    data-export-card="true"
                  >
                    <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${resolvedBulletColor}`} aria-hidden="true" />
                    <span>
                      {item.name}
                      {item.issuer || item.year ? (
                        <span className={metaTextClasses}>
                          {' — '}
                          {[item.issuer, item.year].filter(Boolean).join(', ')}
                        </span>
                      ) : null}
                      {item.expiry ? (
                        <span className={metaTextClasses}>
                          {' · '}
                          {isFinnish ? `Vanhenee ${item.expiry}` : `Expires ${item.expiry}`}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            )}
          </>
        ),
      })
    }

    // ── Projects section ─────────────────────────────────────────────
    // Project name (accent color), one-sentence description, optional stack line.
    if (section === 'projects') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('projects', isFinnish ? 'Projektit' : 'Projects')}
            <div className="mt-4 space-y-4">
              {projects.length > 0 ? (
                projects.map((item, index) => (
                  <div key={`${item.name}-${index}`} data-export-card="true">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="mb-2 w-full max-w-xs rounded object-cover"
                        style={{ maxHeight: '9rem' }}
                      />
                    ) : null}
                    {item.name ? (
                      <p className={`text-sm font-semibold tracking-tight ${accentTextClasses}`}>{item.name}</p>
                    ) : null}
                    {item.description ? (
                      <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                    ) : null}
                    {item.teamSize || item.contribution ? (
                      <p className={`mt-1 text-xs ${metaTextClasses}`}>
                        {[item.teamSize, item.contribution].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    {item.stack ? (
                      <p className={`mt-1 text-[0.68rem] uppercase tracking-[0.1em] ${metaTextClasses}`}>{item.stack}</p>
                    ) : null}
                    {item.githubUrl || item.demoUrl ? (
                      <p className={`mt-1 text-xs ${supportingTextClasses}`}>
                        {[item.githubUrl, item.demoUrl].filter(Boolean).join('  ·  ')}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Languages section ────────────────────────────────────────────
    // Simple "Language — Level" list.
    if (section === 'languages') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('languages', isFinnish ? 'Kielet' : 'Languages')}
            <div className="mt-4 space-y-1.5">
              {languages.length > 0 ? (
                languages.map((item, index) => (
                  <p
                    key={`${item.language}-${index}`}
                    className={`text-sm ${supportingTextClasses}`}
                    data-export-card="true"
                  >
                    <span className="font-medium text-gray-900">{item.language}</span>
                    {item.level ? <span className={metaTextClasses}> — {item.level}</span> : null}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Interests section ────────────────────────────────────────────
    // Small outline icon + label, kept subtle.
    if (section === 'interests') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('interests', isFinnish ? 'Kiinnostuksen kohteet' : 'Interests')}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {interests.length > 0 ? (
                interests.map((item, index) => (
                  <span
                    key={`${item.name}-${index}`}
                    className={`inline-flex items-center gap-1.5 text-sm ${supportingTextClasses}`}
                    data-export-card="true"
                  >
                    <span className={resolvedSectionIconColor} aria-hidden="true">
                      {sectionIcons.interests}
                    </span>
                    {item.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Achievements section ─────────────────────────────────────────
    // Title (bold), year (right-aligned meta), short description below.
    if (section === 'achievements') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('achievements', isFinnish ? 'Saavutukset' : 'Achievements')}
            <div className="mt-4 space-y-4">
              {achievements.length > 0 ? (
                achievements.map((item, index) => (
                  <div key={`${item.title}-${index}`} data-export-card="true">
                    <div className="flex items-start justify-between gap-4">
                      {item.title ? (
                        <p className="text-sm font-semibold tracking-tight text-gray-900">{item.title}</p>
                      ) : null}
                      {item.year ? (
                        <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.14em] ${metaTextClasses}`}>{item.year}</p>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Saavutukset näkyvät tässä.' : 'Achievements will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Open Source section ──────────────────────────────────────────
    // Repository name (accent), language/stars/forks meta line, description.
    if (section === 'openSource') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('openSource', isFinnish ? 'Avoin lähdekoodi' : 'Open Source')}
            <div className="mt-4 space-y-4">
              {openSource.length > 0 ? (
                openSource.map((item, index) => {
                  const metaParts = [
                    item.language,
                    item.stars ? `★ ${item.stars}` : '',
                    item.forks ? `⑂ ${item.forks}` : '',
                  ].filter(Boolean)

                  return (
                    <div key={`${item.name}-${index}`} data-export-card="true">
                      {item.name ? (
                        <p className={`text-sm font-semibold tracking-tight ${accentTextClasses}`}>{item.name}</p>
                      ) : null}
                      {metaParts.length > 0 ? (
                        <p className={`mt-0.5 text-[0.68rem] uppercase tracking-[0.1em] ${metaTextClasses}`}>
                          {metaParts.join('   ')}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                      ) : null}
                      {item.url ? (
                        <p className={`mt-1 text-xs ${supportingTextClasses}`}>{item.url}</p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Avoimen lähdekoodin projektit näkyvät tässä.' : 'Open-source repositories will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Publications section ─────────────────────────────────────────
    // Title (bold), publisher + year meta line, optional link.
    if (section === 'publications') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('publications', isFinnish ? 'Julkaisut' : 'Publications')}
            <div className="mt-4 space-y-4">
              {publications.length > 0 ? (
                publications.map((item, index) => (
                  <div key={`${item.title}-${index}`} data-export-card="true">
                    {item.title ? (
                      <p className="text-sm font-semibold tracking-tight text-gray-900">{item.title}</p>
                    ) : null}
                    {item.publisher || item.year ? (
                      <p className={`mt-0.5 text-xs ${metaTextClasses}`}>
                        {[item.publisher, item.year].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    {item.url ? (
                      <p className={`mt-1 text-xs ${supportingTextClasses}`}>{item.url}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Julkaisut näkyvät tässä.' : 'Publications will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Leadership Experience section ────────────────────────────────
    // Role — organization heading, dates, short description below.
    if (section === 'leadership') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('leadership', isFinnish ? 'Johtamiskokemus' : 'Leadership Experience')}
            <div className="mt-4 space-y-4">
              {leadership.length > 0 ? (
                leadership.map((item, index) => {
                  const heading = [item.role, item.organization].filter(Boolean).join(' — ')
                  const dateRange = formatDateRange(item.startDate, item.endDate)

                  return (
                    <div key={`${item.role}-${item.organization}-${index}`} data-export-card="true">
                      <div className="flex items-start justify-between gap-4">
                        {heading ? (
                          <p className="text-sm font-semibold tracking-tight text-gray-900">{heading}</p>
                        ) : null}
                        {dateRange ? (
                          <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.14em] ${metaTextClasses}`}>{dateRange}</p>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Johtamiskokemus näkyy tässä.' : 'Leadership experience will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Professional Memberships section ─────────────────────────────
    // Organization (bold), role + year meta line.
    if (section === 'memberships') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('memberships', isFinnish ? 'Ammattijäsenyydet' : 'Professional Memberships')}
            <div className="mt-4 space-y-3">
              {memberships.length > 0 ? (
                memberships.map((item, index) => (
                  <div key={`${item.organization}-${index}`} data-export-card="true">
                    {item.organization ? (
                      <p className="text-sm font-semibold tracking-tight text-gray-900">{item.organization}</p>
                    ) : null}
                    {item.role || item.year ? (
                      <p className={`mt-0.5 text-xs ${metaTextClasses}`}>
                        {[item.role, item.year].filter(Boolean).join(', ')}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Jäsenyydet näkyvät tässä.' : 'Memberships will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Speaking section ──────────────────────────────────────────────
    // Topic (bold), conference + date meta line, optional audience line.
    if (section === 'speaking') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('speaking', isFinnish ? 'Esiintymiset' : 'Speaking')}
            <div className="mt-4 space-y-4">
              {speaking.length > 0 ? (
                speaking.map((item, index) => (
                  <div key={`${item.conference}-${item.topic}-${index}`} data-export-card="true">
                    {item.topic ? (
                      <p className="text-sm font-semibold tracking-tight text-gray-900">{item.topic}</p>
                    ) : null}
                    {item.conference || item.date ? (
                      <p className={`mt-0.5 text-xs ${metaTextClasses}`}>
                        {[item.conference, item.date].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    {item.audience ? (
                      <p className={`mt-1 text-xs leading-6 ${bodyTextClasses}`}>{item.audience}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Esiintymiset näkyvät tässä.' : 'Speaking engagements will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Volunteering section ──────────────────────────────────────────
    // Role — organization heading, short description below.
    if (section === 'volunteering') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('volunteering', isFinnish ? 'Vapaaehtoistyö' : 'Volunteering')}
            <div className="mt-4 space-y-4">
              {volunteering.length > 0 ? (
                volunteering.map((item, index) => {
                  const heading = [item.role, item.organization].filter(Boolean).join(' — ')

                  return (
                    <div key={`${item.role}-${item.organization}-${index}`} data-export-card="true">
                      {heading ? (
                        <p className="text-sm font-semibold tracking-tight text-gray-900">{heading}</p>
                      ) : null}
                      {item.description ? (
                        <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Vapaaehtoistyö näkyy tässä.' : 'Volunteer work will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Internships section ───────────────────────────────────────────
    // Role @ company heading, dates, description, optional technologies line.
    if (section === 'internships') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('internships', isFinnish ? 'Harjoittelut' : 'Internships')}
            <div className="mt-4 space-y-4">
              {internships.length > 0 ? (
                internships.map((item, index) => {
                  const heading = [item.role, item.company].filter(Boolean).join(' @ ')
                    || (isFinnish ? 'Nimeämätön rooli' : 'Untitled role')
                  const dateRange = formatDateRange(item.startDate, item.endDate)

                  return (
                    <div key={`${item.role}-${item.company}-${index}`} data-export-card="true">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-semibold tracking-tight text-gray-900">{heading}</p>
                        {dateRange ? (
                          <p className={`shrink-0 text-xs font-medium uppercase tracking-[0.14em] ${metaTextClasses}`}>{dateRange}</p>
                        ) : null}
                      </div>
                      {item.company || item.location ? (
                        <p className="text-sm text-gray-500">
                          {[item.company, item.location].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className={`mt-1 whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>{item.description}</p>
                      ) : null}
                      {item.technologies ? (
                        <p className={`mt-1 text-[0.68rem] uppercase tracking-[0.1em] ${metaTextClasses}`}>{item.technologies}</p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Harjoittelut näkyvät tässä.' : 'Internships will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Case Studies section ──────────────────────────────────────────
    // Title (bold), then labeled Problem/Solution/Technologies/Outcome/
    // Lessons Learned rows — a miniature portfolio page per case study.
    if (section === 'caseStudies') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('caseStudies', isFinnish ? 'Tapaustutkimukset' : 'Case Studies')}
            <div className="mt-4 space-y-5">
              {caseStudies.length > 0 ? (
                caseStudies.map((item, index) => {
                  const rows = [
                    [isFinnish ? 'Ongelma' : 'Problem', item.problem],
                    [isFinnish ? 'Ratkaisu' : 'Solution', item.solution],
                    [isFinnish ? 'Teknologiat' : 'Technologies', item.technologies],
                    [isFinnish ? 'Tulos' : 'Outcome', item.outcome],
                    [isFinnish ? 'Opitut asiat' : 'Lessons Learned', item.lessons],
                  ].filter(([, value]) => value)

                  return (
                    <div key={`${item.title}-${index}`} data-export-card="true">
                      {item.title ? (
                        <p className="text-sm font-semibold tracking-tight text-gray-900">{item.title}</p>
                      ) : null}
                      <div className="mt-1 space-y-1">
                        {rows.map(([label, value]) => (
                          <p key={label} className={`whitespace-pre-line text-xs leading-6 ${bodyTextClasses}`}>
                            <span className={`font-semibold ${metaTextClasses}`}>{label}: </span>
                            {value}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Tapaustutkimukset näkyvät tässä.' : 'Case studies will appear here.'}
                </p>
              )}
            </div>
          </>
        ),
      })
    }

    // ── Testimonials section ──────────────────────────────────────────
    // Quote text, then author — role attribution line.
    if (section === 'testimonials') {
      return renderSectionCard({
        section,
        placement,
        classes: sectionClasses,
        children: (
          <>
            {renderSectionHeading('testimonials', isFinnish ? 'Suositukset' : 'Testimonials')}
            <div className="mt-4 space-y-4">
              {testimonials.length > 0 ? (
                testimonials.map((item, index) => {
                  const meta = [item.author, item.role].filter(Boolean).join(', ')

                  return (
                    <div key={`${item.author}-${index}`} data-export-card="true">
                      {item.quote ? (
                        <p className={`whitespace-pre-line text-xs italic leading-6 ${bodyTextClasses}`}>&ldquo;{item.quote}&rdquo;</p>
                      ) : null}
                      {meta ? (
                        <p className={`mt-1 text-xs ${metaTextClasses}`}>{meta}</p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">
                  {isFinnish ? 'Suositukset näkyvät tässä.' : 'Testimonials will appear here.'}
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
        <div className={t.headerLayoutClass || 'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'}>
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
            <p className={resolvedHeaderSubtitleClasses}>
              {title}
            </p>

            {/* Contact info — piped layout (minimal: email/phone/location separated by |,
                no icons — GitHub/LinkedIn/Portfolio/website stay in the Links section) */}
            {t.headerContactMode === 'piped' && personalContactItems.length > 0 ? (
              <p className={`mt-3 flex flex-wrap items-center ${t.headerContactGap} gap-y-1 ${t.headerContactTextSize} leading-5 ${resolvedHeaderContactTextColor}`}>
                {personalContactItems.map(([key, value], i, arr) => (
                  <span key={key} className="flex items-center gap-x-2">
                    <span>{value}</span>
                    {i < arr.length - 1 ? <span className="text-gray-300">|</span> : null}
                  </span>
                ))}
              </p>
            ) : null}

            {/* Contact info — icon layout (developer, creative, executive, timeline) */}
            {t.headerContactMode === 'icons' && links.length > 0 && links.some(([, v]) => v.trim()) ? (
              <div className={t.headerContactContainerClass || `mt-3 flex flex-wrap ${t.headerContactGap} gap-y-1.5`}>
                {links.filter(([, v]) => v.trim()).map(([key, value]) => (
                  <span key={key} className={resolvedHeaderContactItemClass || `flex items-center gap-1.5 ${t.headerContactTextSize} leading-5 ${resolvedHeaderContactTextColor}`}>
                    {devIcons[key] ? (
                      <span className={`${resolvedHeaderContactIconWrapClass || 'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-gray-400'} ${resolvedHeaderContactIconColor || ''}`}>
                        {devIcons[key]}
                      </span>
                    ) : null}
                    <span>{value}</span>
                  </span>
                ))}
              </div>
            ) : null}

            {/* Contact info — personal layout (email, phone, location; excludes GitHub/LinkedIn/Portfolio) */}
            {t.headerContactMode === 'personal' && personalContactItems.length > 0 ? (
              <div className={t.headerContactContainerClass || `mt-3 flex flex-wrap ${t.headerContactGap} gap-y-1.5`}>
                {personalContactItems.map(([key, value]) => (
                  <span key={key} className={resolvedHeaderContactItemClass || `flex items-center gap-1.5 ${t.headerContactTextSize} leading-5 ${resolvedHeaderContactTextColor}`}>
                    {contactIcons[key] ? (
                      <span className={`${resolvedHeaderContactIconWrapClass || 'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center text-gray-400'} ${resolvedHeaderContactIconColor || ''}`}>
                        {contactIcons[key]}
                      </span>
                    ) : null}
                    <span>{value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Profile photo — shown when enabled and photo exists */}
          {showPhoto ? (
            <div className="shrink-0">
              <div className="relative inline-block">
                <img
                  src={photo}
                  alt={`${fullName} profile`}
                  data-export-photo="true"
                  className={`border-2 ${
                    atsFriendlyMode
                      ? 'border-gray-300'
                      : t.photoBorder(isDark)
                  }`}
                  style={{
                    width: t.photoSize || '7rem',
                    height: t.photoSize || '7rem',
                    objectFit: 'cover',
                    // This app's shared utility layer zeroes out all `rounded-*` classes
                    // (a deliberate sharp-corner design system), so a circular photo — a
                    // hard requirement for this template — needs an explicit inline override.
                    borderRadius: t.photoShape === 'circle' ? '9999px' : 0,
                    ...(!atsFriendlyMode && t.photoDecoration
                      ? { boxShadow: `0 0 0 4px #ffffff, 0 0 0 6px ${t.photoRingColor || '#2563EB'}` }
                      : {}),
                  }}
                />
                {!atsFriendlyMode && t.photoDecoration ? (
                  <svg
                    className="pointer-events-none absolute -bottom-1 -right-1 h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={t.photoRingColor || '#2563EB'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M4 20l6-6M11 20l8-8M17 20l4-4" />
                  </svg>
                ) : null}
              </div>
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
        {/* ATS mode + sidebarFirst — secondary sections rendered first to preserve intended order */}
        {atsFriendlyMode && t.sidebarFirst && visibleSecondarySections.length > 0 ? (
          <div className="preview-document__column space-y-6" data-export-secondary="true">
            {visibleSecondarySections.map((section) => renderSection(section, 'main'))}
          </div>
        ) : null}

        {/* Primary sections column — experience, about, education, etc. */}
        <div
          className={`preview-document__column ${sectionSpacing} lg:space-y-7 ${
            !atsFriendlyMode && t.sidebarFirst ? 'order-2' : ''
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

        {/* ATS mode (non-sidebarFirst) — secondary sections rendered after primary */}
        {visibleSecondarySections.length > 0 && atsFriendlyMode && !t.sidebarFirst ? (
          <div className="preview-document__column space-y-6" data-export-secondary="true">
            {visibleSecondarySections.map((section) => renderSection(section, 'main'))}
          </div>
        ) : null}
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      {/* Thin accent-color strip with an optional inspirational quote — opt-in via
          the template's `hasFooter` flag (used by the Tech Executive template). */}
      {!atsFriendlyMode && t.hasFooter && t.footerQuote ? (
        <footer
          className={`px-5 py-3 text-center sm:px-8 print:px-0 ${t.footerClasses || 'bg-gray-900 text-white'}`}
        >
          <p className="text-[0.68rem] italic tracking-[0.02em] opacity-80">
            {t.footerQuote(isFinnish)}
          </p>
        </footer>
      ) : null}
    </article>
  )
}

// Memoize to prevent unnecessary re-renders when props haven't changed
const MemoizedCVPreview = memo(CVPreview)

MemoizedCVPreview.displayName = 'CVPreview'

export default MemoizedCVPreview
