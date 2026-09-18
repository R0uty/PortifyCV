// Executive Showcase — the non-ATS "boardroom" visual mode for the Executive
// template. Rendered by CVPreview.jsx instead of the shared generic renderer
// whenever variant === 'executive' && !atsFriendlyMode. Shares the exact
// same CvData shape as every other template — this file only differs in
// presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (executive.js).
//
// Design language (reworked 2026-09-10 to docs/template-design-system.md):
// a warm-charcoal "boardroom" resume with one gold accent read from
// --tpl-accent (user-customizable). §3 colour: one ink (+ two muted steps),
// one gold accent, and a warm-neutral left rail as the single tint region
// (was a pale indigo wash — the residual second hue the Aug indigo→gold
// pass left behind). §4 heading: rule-under — a tracked-uppercase label
// over a 1px gold hairline, no glyph. No decorative timeline, no boxed
// section containers; only Projects and Links use a subtle bordered card
// (the template's stated "Professional cards" exception).
//
// Layout: identity (photo, name, title, tagline, contact) runs full-height
// down the left rail with the secondary sections; primary sections fill the
// main column — same "identity in the sidebar" structure as Navy
// Professional / Modern Orange.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import EditableField from '../EditableField'
import EditableList, { EditableCategorizedChip } from '../EditableList'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { accentSoftFill } from '../../utils/templateAccents'
import { EXECUTIVE_DEFAULT_ACCENT_COLOR } from './executive'
import {
  devIcons,
  contactIcons,
  parseSkillCategories,
  buildEditableSkillCategories,
  formatDateRange,
  formatLinkLabel,
  formatLinkDisplayValue,
  getSafeHref,
} from './shared'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Bolds metric-shaped tokens (percentages, multipliers, counts, currency
// amounts) inside bullet text so quantified business impact stands out,
// per the spec's "Numbers should be visually emphasised" requirement.
const METRIC_PATTERN = /(£[\d,.]+[MKB]?\+?|\$[\d,.]+[MKB]?\+?|\d+(?:[.,]\d+)?%|\d+x\b|\d+\+|\b\d{2,}(?:,\d{3})+\b)/gi

function highlightMetrics(text, showMetrics) {
  if (!showMetrics) return text
  const parts = text.split(METRIC_PATTERN)
  if (parts.length === 1) return text
  return parts.map((part, index) => (
    METRIC_PATTERN.test(part) && part
      ? <strong key={index} className="executive-showcase__metric">{part}</strong>
      : part
  ))
}

// Executive's own Experience-entry renderer — deliberately NOT
// directEditExperienceEntry.jsx (the shared module for Classic
// Professional/Editorial/Portrait). Executive's read-only shape nests
// role AND the company/location meta line together inside one `min-w-0`
// div, with dates as a sibling of THAT div (not of role directly) — a
// real structural difference from the shared module's flat two-children
// entry-row, even though the visual result looks similar. Only role and
// company are independently editable, matching the shared module's own
// precedent — location stays read-only-appended text.
//
// `index` is always formData.experience-relative (only ever read inside
// directEditDispatch-gated branches below) — never assume it lines up with
// snapshot.experience's own (filtered) indices in the read-only call site.
//
// `isFirst`/`isLast` drive the entry's top-padding/bottom-divider via CSS
// modifier classes, not the `:not(:first-child)`/`:last-child` positional
// selectors this file used to rely on. Direct Edit mode wraps every entry
// in `EditableList`'s own `.direct-edit-entry` div (drag handle + remove
// button + the entry itself), which makes every `.executive-showcase__entry`
// the 3rd/last child of ITS OWN wrapper regardless of overall list
// position — so an unqualified `:last-child` matches every entry, not just
// the true-last one. A wrapper-anchored `:last-of-type` re-fix doesn't work
// either: `EditableList`'s `DndContext` (no `accessibility.container`
// configured) mounts an un-portaled accessibility live-region — two more
// untyped `<div>` siblings — after the last `.direct-edit-entry` once
// mounted, so the true-last wrapper is never actually `:last-of-type`
// among `div`-tag siblings. Both positional-selector approaches were tried
// and found broken (see the Direct Edit Phase 2 Round 7 changes.md entry,
// where the identical bug class was found and fixed on Modern Orange) —
// modifier classes driven by the already-correct JS index are the only
// mechanism proven robust against whatever `EditableList`/dnd-kit renders
// around an entry.
function renderExperienceEntry(item, index, { directEditDispatch, copy, showMetrics, isFirst, isLast }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []
  const entryClassName = [
    'executive-showcase__entry',
    // Unconditional marker opting this entry out of executive.css's
    // position-based `:not(:first-child)`/`:last-child` rules (correct
    // only for Leadership/Education, which never go through this
    // function) — see the CSS file's own comment above `--wired` for why.
    'executive-showcase__entry--wired',
    !isFirst ? 'executive-showcase__entry--not-first' : null,
    isLast ? 'executive-showcase__entry--last' : null,
  ].filter(Boolean).join(' ')

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={entryClassName} data-export-card="true">
      <div className="executive-showcase__entry-row">
        <div className="min-w-0">
          <p className="executive-showcase__entry-role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
                value={item.role}
                placeholder={copy.untitledRole}
              />
            ) : item.role || copy.untitledRole}
          </p>
          {directEditDispatch || item.company || item.location ? (
            <p className="executive-showcase__entry-meta">
              {directEditDispatch ? (
                <EditableField
                  as="span"
                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                  value={item.company}
                  placeholder={copy.company}
                />
              ) : item.company}
              {item.company && item.location ? ` · ${item.location}` : item.location || null}
            </p>
          ) : null}
        </div>
        <p className="executive-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <p className="executive-showcase__bullets executive-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="executive-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{highlightMetrics(line, showMetrics)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function SectionHead({ title }) {
  return (
    <div className="executive-showcase__section-head">
      <h2 className="executive-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, title, children }) {
  return (
    <section className="executive-showcase__section" data-export-section={id} data-export-placement={placement}>
      <SectionHead title={title} />
      {children}
    </section>
  )
}

export default function ExecutiveShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = EXECUTIVE_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const showSidebar = showcaseConfig.showSidebar !== false
  const configShowPhoto = showcaseConfig.showPhoto !== false
  const showExecutiveTagline = showcaseConfig.showExecutiveTagline !== false
  const showMetrics = showcaseConfig.showMetrics !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Toimitusjohtaja' : 'Chief Executive')
  const tagline = showExecutiveTagline ? snapshot.tagline : ''
  const photo = snapshot.photo
  const showPhoto = configShowPhoto && Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const about = snapshot.about
    || (isFinnish
      ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
      : 'Your executive summary will appear here as you fill out the CV form.')

  const personalContactItems = [
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]

  const linkEntries = Object.entries(snapshot.links)
  const skillCategories = useMemo(
    () => parseSkillCategories(snapshot.skills, isFinnish),
    [snapshot.skills, isFinnish],
  )
  // Editing-branch-only: the same categorization, but computed off the raw
  // formData.skills array (not the trimmed snapshot) and with each item's
  // ORIGINAL flat-array index attached — see buildEditableSkillCategories
  // in shared.jsx for why a per-text queue is used instead of a plain Map.
  const editableSkillCategories = useMemo(
    () => buildEditableSkillCategories(formData.skills, isFinnish),
    [formData.skills, isFinnish],
  )

  const sectionVisibility = {
    ...createSectionVisibility(),
    ...(formData.sectionVisibility ?? {}),
  }
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  const orderedSections = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
  const primarySet = new Set(templateConfig.primarySections)
  const secondarySet = new Set(templateConfig.secondarySections)
  const mainSectionKeys = orderedSections.filter((key) => primarySet.has(key) && sectionVisibility[key])
  const sidebarSectionKeys = orderedSections.filter((key) => secondarySet.has(key) && sectionVisibility[key])

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
    profile: isFinnish ? 'Johtajaprofiili' : 'Executive Profile',
    experience: isFinnish ? 'Työkokemus' : 'Professional Experience',
    leadership: isFinnish ? 'Johtamiskokemus' : 'Leadership Experience',
    projects: isFinnish ? 'Strategiset hankkeet' : 'Major Projects',
    education: isFinnish ? 'Koulutus' : 'Education',
    coreStrengths: isFinnish ? 'Ydinosaaminen' : 'Core Competencies',
    skills: isFinnish ? 'Johtamistaidot' : 'Executive Skills',
    certificates: isFinnish ? 'Sertifioinnit' : 'Certifications',
    languages: isFinnish ? 'Kielet' : 'Languages',
    memberships: isFinnish ? 'Ammattijäsenyydet' : 'Professional Memberships',
    achievements: isFinnish ? 'Tunnustukset' : 'Awards',
    links: isFinnish ? 'Linkit' : 'Links',
  }

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" title={copy.profile}>
          <p className="executive-showcase__summary">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'about' }}
                value={formData.about}
                placeholder={
                  isFinnish
                    ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
                    : 'Your executive summary will appear here as you fill out the CV form.'
                }
                multiline
              />
            ) : about}
          </p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" title={copy.experience}>
          <div className="executive-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  showMetrics,
                  isFirst: index === 0,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                copy,
                showMetrics,
                isFirst: index === 0,
                isLast: index === snapshot.experience.length - 1,
              }))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'leadership') {
      if (snapshot.leadership.length === 0) return null

      return (
        <Section key={key} id="leadership" placement="main" title={copy.leadership}>
          <div className="executive-showcase__entry-list">
            {snapshot.leadership.map((item, index) => {
              const heading = [item.role, item.organization].filter(Boolean).join(' — ')
              const dateRange = formatDateRange(item.startDate, item.endDate)
              const bullets = item.description ? splitToBullets(item.description) : []

              return (
                <div key={`${item.role}-${item.organization}-${index}`} className="executive-showcase__entry" data-export-card="true">
                  <div className="executive-showcase__entry-row">
                    <p className="executive-showcase__entry-role">{heading || copy.untitledRole}</p>
                    <p className="executive-showcase__entry-dates">{dateRange}</p>
                  </div>
                  {bullets.length > 0 ? (
                    <ul className="executive-showcase__bullets">
                      {bullets.map((line, lineIndex) => (
                        <li key={lineIndex}>{highlightMetrics(line, showMetrics)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement="main" title={copy.projects}>
          <div className="executive-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => (
                <div key={`${item.name}-${index}`} className="executive-showcase__project-card" data-export-card="true">
                  {item.name ? <p className="executive-showcase__project-name">{item.name}</p> : null}
                  {item.organization ? <p className="executive-showcase__project-org">{item.organization}</p> : null}
                  {item.description ? <p className="executive-showcase__project-desc">{item.description}</p> : null}
                  {item.impact ? (
                    <p className="executive-showcase__project-impact">{highlightMetrics(item.impact, showMetrics)}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Hankkeet näkyvät tässä.' : 'Major projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement="main" title={copy.achievements}>
          <ul className="executive-showcase__award-list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <li key={`${item.title}-${index}`} className="executive-showcase__award-item">
                  <span className="executive-showcase__award-dot" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="executive-showcase__award-row">
                      {item.title ? <p className="executive-showcase__award-title">{item.title}</p> : null}
                      {item.year ? <p className="executive-showcase__award-year">{item.year}</p> : null}
                    </div>
                    {item.description ? <p className="executive-showcase__award-desc">{item.description}</p> : null}
                  </div>
                </li>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Tunnustukset näkyvät tässä.' : 'Awards will appear here.'}
              </p>
            )}
          </ul>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement="main" title={copy.education}>
          <div className="executive-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="executive-showcase__entry" data-export-card="true">
                  <div className="executive-showcase__entry-row">
                    <div className="min-w-0">
                      {item.degree ? <p className="executive-showcase__entry-role">{item.degree}</p> : null}
                      {item.school || item.location ? (
                        <p className="executive-showcase__entry-meta">
                          {[item.school, item.location].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <p className="executive-showcase__entry-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key) => {
    if (key === 'coreStrengths') {
      return (
        <Section key={key} id="coreStrengths" placement="side" title={copy.coreStrengths}>
          <div className="executive-showcase__strength-list">
            {snapshot.coreStrengths.length > 0 ? (
              snapshot.coreStrengths.map((item, index) => (
                <div key={`${item.title}-${index}`} className="executive-showcase__strength-item">
                  {item.title ? <p className="executive-showcase__strength-title">{item.title}</p> : null}
                  {item.description ? <p className="executive-showcase__strength-desc">{item.description}</p> : null}
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Ydinosaaminen näkyy tässä.' : 'Core competencies will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side" title={copy.skills}>
          {directEditDispatch ? null : skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="executive-showcase__skill-group">
                <p className="executive-showcase__skill-group-label">{cat.label}</p>
                <div className="executive-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="executive-showcase__tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="executive-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
          {directEditDispatch ? (
            <div className="executive-showcase__skill-group">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : null}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement="side" title={copy.certificates}>
          <div className="executive-showcase__list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="executive-showcase__list-item">
                  {item.name ? <p className="executive-showcase__list-title">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="executive-showcase__list-meta">
                      {[item.issuer, item.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {item.credentialUrl ? (
                    <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="executive-showcase__list-link">
                      {copy.viewCredential}
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Sertifioinnit näkyvät tässä.' : 'Certifications will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement="side" title={copy.languages}>
          <div className="executive-showcase__list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="executive-showcase__list-item executive-showcase__list-item--row">
                  <span>{item.language}</span>
                  {item.level ? <span className="executive-showcase__list-meta">{item.level}</span> : null}
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'memberships') {
      return (
        <Section key={key} id="memberships" placement="side" title={copy.memberships}>
          <div className="executive-showcase__list">
            {snapshot.memberships.length > 0 ? (
              snapshot.memberships.map((item, index) => (
                <div key={`${item.organization}-${index}`} className="executive-showcase__list-item">
                  {item.organization ? <p className="executive-showcase__list-title">{item.organization}</p> : null}
                  {item.role || item.year ? (
                    <p className="executive-showcase__list-meta">
                      {[item.role, item.year].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Jäsenyydet näkyvät tässä.' : 'Memberships will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement="side" title={copy.links}>
          <div className="executive-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="executive-showcase__link-card">
                  <span className="executive-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="executive-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="executive-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="executive-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  return (
    <article
      ref={previewRef}
      data-export-root="true"
      data-export-variant="executive"
      data-export-content="true"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // ExecutiveShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="executive-showcase preview-document--designer tpl-density-standard"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, EXECUTIVE_DEFAULT_ACCENT_COLOR),
        ...(!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : null),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <aside className="executive-showcase__sidebar" data-export-secondary="true">
        <div className="executive-showcase__identity" data-export-header="true">
          {showPhoto ? (
            <div className="executive-showcase__photo-wrap">
              <img
                src={photo}
                alt={`${fullName} profile`}
                data-export-photo="true"
                className="executive-showcase__photo"
              />
            </div>
          ) : null}
          <p className="executive-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="executive-showcase__name">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="executive-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
          {tagline ? <p className="executive-showcase__tagline">{tagline}</p> : null}
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="executive-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="executive-showcase__contact-item">
                  <span className="executive-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showSidebar ? (
          <>
            <div className="executive-showcase__sidebar-divider" aria-hidden="true" />
            {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
          </>
        ) : null}
      </aside>

      <main className="executive-showcase__main" data-export-primary="true">
        {mainSectionKeys.map((key) => renderMainSection(key))}
      </main>
    </article>
  )
}
