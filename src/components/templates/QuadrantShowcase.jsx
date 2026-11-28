// Quadrant Showcase — the non-ATS visual mode for the Quadrant template.
// Rendered by CVPreview.jsx instead of the shared generic renderer whenever
// variant === 'quadrant' && !atsFriendlyMode. Shares the exact same CvData
// shape as every other template — this file only differs in presentation.
// ATS mode (the app's existing global toggle) bypasses this component
// entirely and falls back to the shared flat renderer (quadrant.js).
//
// Layout: a literal 2x2 CSS grid, not four equal boxes — each row auto-
// sizes to its own content, so a long Experience list can grow taller than
// a short Education list without clipping or forcing scroll:
//   top-left     — identity (photo, name, title, contact) — a tight card
//   top-right    — Profile summary + Skills + Languages (About moved here
//                  from the identity cell in the 2026-09-10 rework so the
//                  top-left quadrant isn't visibly taller than the top-right)
//   bottom-left  — Experience (+ Projects) — the one cell that drives PDF
//                  pagination (data-export-placement="main"); the other
//                  three are "side" and fall wherever they land, same
//                  asymmetric handling every split-layout template uses.
//   bottom-right — Education + Certificates + Links
//
// Reworked 2026-09-10 to docs/template-design-system.md: the `compact`
// density ramp (`tpl-density-compact` + `--tpl-*`), one cyan accent read
// from `--tpl-accent` (real soft-cyan icon-badges, accent-tinted grid
// dividers, soft-cyan skill tags), and the About rebalance above.

import { useMemo } from 'react'
import CvHeading from '../CvHeading'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { accentSoftFill } from '../../utils/templateAccents'
import { QUADRANT_DEFAULT_ACCENT_COLOR } from './quadrant'
import {
  devIcons,
  contactIcons,
  sectionIcons,
  parseSkillCategories,
  buildEditableSkillCategories,
  formatDateRange,
  formatLinkLabel,
  formatLinkDisplayValue,
  getSafeHref,
  kickerText,
} from './shared'
import EditableField from '../EditableField'
import EditableList, { EditableCategorizedChip } from '../EditableList'
import { getExperienceBullets, getExperienceAchievements, getExperienceTechnologies } from './directEditExperienceEntry'
import { cv } from '../../i18n/cv'

// Quadrant's own Experience-entry renderer: role and company/location nest
// in one `min-w-0` div with the dates as its sibling. Only role and company
// are editable inline; location stays read-only-appended text. `index` is
// formData-relative in the directEditDispatch branch (EditableList's own
// index); the read-only call site passes the snapshot's `sourceIndex`.
//
// Entry spacing and dividers come from --first/--last modifier classes,
// never :first-child/:last-child — EditableList wraps each entry in its own
// .direct-edit-entry div, making every entry both.
function renderExperienceEntry(item, index, { directEditDispatch, copy, isFirst, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = getExperienceBullets(item)
  const achievements = getExperienceAchievements(item)
  const technologies = getExperienceTechnologies(item)
  const className = [
    'quadrant-showcase__entry',
    isFirst ? 'quadrant-showcase__entry--first' : '',
    isLast ? 'quadrant-showcase__entry--last' : '',
  ].filter(Boolean).join(' ')

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={className} data-export-card="true" data-direct-edit-index={sourceIndex}>
      <div className="quadrant-showcase__entry-row">
        <div className="min-w-0">
          <p className="quadrant-showcase__entry-role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
                value={item.role}
                placeholder={copy.untitledRole}
              />
            ) : item.role || copy.untitledRole}
          </p>
          {directEditDispatch ? (
            <p className="quadrant-showcase__entry-meta">
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                value={item.company}
                placeholder={copy.company}
              />
              {item.location ? ` · ${item.location}` : null}
            </p>
          ) : item.company || item.location ? (
            <p className="quadrant-showcase__entry-meta">
              {[item.company, item.location].filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>
        <p className="quadrant-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <>
          <p className="quadrant-showcase__bullets quadrant-showcase__bullets--editing">
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
              value={item.description}
              placeholder={copy.descriptionPlaceholder}
              multiline
            />
          </p>
          {achievements.length > 0 ? (
            <ul className="quadrant-showcase__bullets">
              {achievements.map((line, lineIndex) => (
                <li key={lineIndex}>{line}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : bullets.length > 0 ? (
        <ul className="quadrant-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
      {technologies.length > 0 ? (
        <p className="quadrant-showcase__entry-technologies">{technologies.join(' · ')}</p>
      ) : null}
    </div>
  )
}

function SectionHead({ icon, title }) {
  return (
    <div className="quadrant-showcase__section-head">
      <span className="quadrant-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <CvHeading as="h2" className="quadrant-showcase__section-title">{title}</CvHeading>
    </div>
  )
}

function Section({ id, placement, icon, title, children, className = '' }) {
  return (
    <section
      className={`quadrant-showcase__section${className ? ` ${className}` : ''}`}
      data-export-section={id}
      data-export-placement={placement}
    >
      <SectionHead icon={icon} title={title} />
      {children}
    </section>
  )
}

export default function QuadrantShowcase({
  formData,
  locale = 'en',
  previewRef,
  paletteStyle = {},
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = QUADRANT_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || cv.t(locale, 'placeholders.name')
  const title = snapshot.title || cv.t(locale, 'placeholders.title')
  const tagline = snapshot.tagline
  const photo = snapshot.photo
  const showPhoto = configShowPhoto && Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const about = snapshot.about
    || cv.t(locale, 'placeholders.summary')

  const personalContactItems = [
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['email', formData.email, cv.t(locale, 'contact.email')],
    ['phone', formData.phone, cv.t(locale, 'contact.phone')],
    ['location', formData.location, cv.t(locale, 'contact.location')],
  ]

  const linkEntries = Object.entries(snapshot.links)
  const skillCategories = useMemo(
    () => parseSkillCategories(snapshot.skills, locale),
    [snapshot.skills, locale],
  )
  // Editing branch only: the same grouping over formData.skills, each chip
  // carrying its ORIGINAL flat-array index so removal hits the right skill.
  const editableSkillCategories = useMemo(
    () => buildEditableSkillCategories(formData.skills, locale),
    [formData.skills, locale],
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
  // 'about' renders inside the identity cell, not the narrative cell — pull
  // it out of the normal main-section list rather than special-casing it
  // in renderNarrativeSection below.
  const narrativeKeys = orderedSections.filter((key) => primarySet.has(key) && key !== 'about' && sectionVisibility[key])
  const showAbout = sectionVisibility.about !== false
  // Same split for skills — it gets its own quadrant, the rest of the
  // secondary sections share the "extras" quadrant. Links always renders
  // last within that quadrant, in its own bordered box, regardless of the
  // user's section order — a fixed anchor point rather than something that
  // drifts around depending on drag order. Languages is pinned into the
  // skills quadrant instead (a short list that pairs naturally with skills)
  // so the extras quadrant — education/certificates/links — doesn't end up
  // carrying 4 section types against the skills quadrant's 1, which read as
  // badly lopsided once a CV had a few certificates and languages.
  const extrasKeys = orderedSections.filter((key) => secondarySet.has(key) && key !== 'skills' && key !== 'links' && key !== 'languages' && sectionVisibility[key])
  const showSkills = sectionVisibility.skills !== false
  const showLinks = sectionVisibility.links !== false
  const showLanguages = sectionVisibility.languages !== false

  const copy = {
    untitledRole: cv.t(locale, 'placeholders.untitledRole'),
    company: cv.t(locale, 'placeholders.company'),
    descriptionPlaceholder: cv.t(locale, 'placeholders.description'),
    datesPending: cv.t(locale, 'placeholders.datesPending'),
    viewCredential: cv.t(locale, 'certificate.viewCredential'),
    summary: cv.t(locale, 'templates.quadrant.summary'),
    experience: cv.t(locale, 'sections.experience'),
    projects: cv.t(locale, 'sections.projects'),
    education: cv.t(locale, 'sections.education'),
    skills: cv.t(locale, 'sections.skills'),
    certificates: cv.t(locale, 'sections.certificates'),
    languages: cv.t(locale, 'sections.languages'),
    links: cv.t(locale, 'sections.links'),
  }

  const renderNarrativeSection = (key) => {
    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" icon="experience" title={copy.experience}>
          <div className="quadrant-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={cv.t(locale, 'add.experience')}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isFirst: index === 0,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) =>
                renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isFirst: index === 0,
                  isLast: index === snapshot.experience.length - 1,
                  sourceIndex: snapshot.sourceIndices.experience[index],
                }),
              )
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.experience')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement="main" icon="projects" title={copy.projects}>
          <div className="quadrant-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const chips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="quadrant-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="quadrant-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="quadrant-showcase__project-desc">{item.description}</p> : null}
                    {chips.length > 0 ? (
                      <div className="quadrant-showcase__tag-row">
                        {chips.map((chip) => (
                          <span key={chip} data-export-skill="true" className="quadrant-showcase__tag tpl-chip-wrappable">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.projects')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderExtraSection = (key) => {
    if (key === 'education') {
      return (
        <Section key={key} id="education" placement="side" icon="education" title={copy.education}>
          <div className="quadrant-showcase__list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="quadrant-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                  {item.degree ? <p className="quadrant-showcase__list-title">{item.degree}</p> : null}
                  {item.school || item.location ? (
                    <p className="quadrant-showcase__list-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  <p className="quadrant-showcase__list-meta">{formatDateRange(item.startDate, item.endDate)}</p>
                </div>
              ))
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.education')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement="side" icon="certificates" title={copy.certificates}>
          <div className="quadrant-showcase__list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="quadrant-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {item.name ? <p className="quadrant-showcase__list-title">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="quadrant-showcase__list-meta">
                      {[item.issuer, item.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {item.credentialUrl ? (
                    <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="quadrant-showcase__list-link">
                      {copy.viewCredential}
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.certificates')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement="side" icon="languages" title={copy.languages}>
          <div className="quadrant-showcase__list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="quadrant-showcase__list-item quadrant-showcase__list-item--row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span>{item.language}</span>
                  {item.level ? <span className="quadrant-showcase__list-meta">{item.level}</span> : null}
                </div>
              ))
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.languages')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement="side" icon="links" title={copy.links} className="quadrant-showcase__section--boxed">
          <div className="quadrant-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="quadrant-showcase__link-card">
                  <span className="quadrant-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="quadrant-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="quadrant-showcase__link-value tpl-value-breakable" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.links')}
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
      data-export-variant="quadrant"
      data-export-content="true"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // QuadrantShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="quadrant-showcase preview-document--designer tpl-density-compact"
      style={{
        ...paletteStyle,
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, QUADRANT_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <section className="quadrant-showcase__cell quadrant-showcase__cell--profile" data-export-header="true" data-export-secondary="true">
        {showPhoto ? (
          <div className="quadrant-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="quadrant-showcase__photo"
            />
          </div>
        ) : null}
        <p className="quadrant-showcase__kicker" data-export-ignore="true">
          {kickerText(locale, templateConfig.label)}
        </p>
        <CvHeading as="h1" className="quadrant-showcase__name" data-cv-name>
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={cv.t(locale, 'placeholders.name')}
            />
          ) : fullName}
        </CvHeading>
        <p className="quadrant-showcase__role">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={cv.t(locale, 'placeholders.title')}
            />
          ) : title}
        </p>
        {tagline ? <p className="quadrant-showcase__tagline">{tagline}</p> : null}
        {directEditDispatch || personalContactItems.length > 0 ? (
          <div className="quadrant-showcase__contact">
            {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
              <span key={key} className="quadrant-showcase__contact-item">
                <span className="quadrant-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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
      </section>

      <section className="quadrant-showcase__cell quadrant-showcase__cell--skills" data-export-secondary="true">
        {showAbout ? (
          <Section id="about" placement="side" icon="about" title={copy.summary}>
            <p className="quadrant-showcase__summary">
              {directEditDispatch ? (
                <EditableField
                  as="span"
                  path={{ kind: 'root', field: 'about' }}
                  value={formData.about}
                  placeholder={cv.t(locale, 'placeholders.summary')}
                  multiline
                />
              ) : about}
            </p>
          </Section>
        ) : null}
        {showSkills ? (
          <Section id="skills" placement="side" icon="skills" title={copy.skills}>
            {directEditDispatch ? (
              // Chips replace the read-only tags outright (never both, or
              // every skill renders twice).
              <div className="quadrant-showcase__skill-group">
                <EditableCategorizedChip
                  categories={editableSkillCategories}
                  addLabel={cv.t(locale, 'add.item')}
                />
              </div>
            ) : skillCategories.length > 0 ? (
              skillCategories.map((cat) => (
                <div key={cat.key} className="quadrant-showcase__skill-group">
                  <p className="quadrant-showcase__skill-group-label">{cat.label}</p>
                  <div className="quadrant-showcase__tag-row">
                    {cat.items.map((skill) => (
                      <span key={skill} data-export-skill="true" className="quadrant-showcase__tag tpl-chip-wrappable">{skill}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="quadrant-showcase__empty">
                {cv.t(locale, 'empty.skills')}
              </p>
            )}
          </Section>
        ) : null}
        {showLanguages ? renderExtraSection('languages') : null}
      </section>

      <section className="quadrant-showcase__cell quadrant-showcase__cell--main" data-export-primary="true">
        {narrativeKeys.map((key) => renderNarrativeSection(key))}
      </section>

      <section className="quadrant-showcase__cell quadrant-showcase__cell--extras" data-export-secondary="true">
        {extrasKeys.map((key) => renderExtraSection(key))}
        {showLinks ? renderExtraSection('links') : null}
      </section>
    </article>
  )
}
