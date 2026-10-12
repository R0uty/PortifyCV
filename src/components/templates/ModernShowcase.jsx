// Modern Professional Showcase — the non-ATS "Showcase" visual mode for the
// Modern Professional template. Rendered by CVPreview.jsx instead of the
// shared generic renderer whenever variant === 'modern' && !atsFriendlyMode.
// Shares the exact same CvData shape as every other template — this file
// only differs in presentation. ATS mode (the app's existing global toggle)
// bypasses this component entirely and falls back to the shared flat
// renderer (modern.js).
//
// Design language: premium executive consulting-firm resume, restyled
// 2026-08-23 against docs/modern-professional-cv.html. Navy / rose / blush
// palette, thin 1px hairline dividers, uppercase section titles with wide
// tracking. Rose is reserved for wayfinding accents only — icons, dates,
// timeline markers, one 3px gradient hairline at the very top of the card —
// never for primary content text (name, role, and metrics all stay navy).
// Sections flow directly on the page (no per-section card border/
// background); the only structural color block is the sidebar's subtle
// off-white tint, separated from the main column by a single vertical
// hairline — restraint over ornamentation (see DeveloperShowcase /
// CreativeShowcase for the more colorful counterexamples).

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
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
  createSectionRouter,
} from './shared'
import EditableField from '../EditableField'
import EditableList, { EditableCategorizedChip } from '../EditableList'
import { getExperienceBullets, getExperienceAchievements, getExperienceTechnologies } from './directEditExperienceEntry'

// Small outline glyph for interest chips — a single shared glyph rather than
// per-interest icon matching, consistent with the Creative template's choice.
function InterestGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.2 5.6L20 10l-4.4 3.8L17 20l-5-3.2L7 20l1.4-6.2L4 10l5.8-1.4L12 3z" />
    </svg>
  )
}

// Bolds simple metric-shaped tokens (percentages, multipliers, counts,
// currency amounts) inside bullet text so quantified impact stands out,
// per the spec's "metrics stand out" requirement — without per-item manual
// tagging.
const METRIC_PATTERN = /(\$[\d,.]+[MKB]?\+?|\d+(?:[.,]\d+)?%|\d+x\b|\d+\+|\b\d{2,}(?:,\d{3})+\b)/gi

function highlightMetrics(text) {
  const parts = text.split(METRIC_PATTERN)
  if (parts.length === 1) return text
  return parts.map((part, index) => (
    METRIC_PATTERN.test(part) && part
      ? <strong key={index} className="modern-showcase__metric">{part}</strong>
      : part
  ))
}

// Modern Professional's own Experience-entry renderer: a timeline rail
// beside a card, unlike directEditExperienceEntry.jsx's two-row shape. Only
// role and company are editable inline; location stays read-only-appended
// text. `index` is formData-relative in the directEditDispatch branch
// (EditableList's own index); the read-only call site passes the
// snapshot's `sourceIndex` for data-direct-edit-index.
//
// The rail's connector line is hidden on the last entry through an
// `--last` modifier class, never :last-child — EditableList wraps each
// entry in its own .direct-edit-entry div, making every item a last child.
function renderExperienceEntry(item, index, { directEditDispatch, copy, showTimeline, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = getExperienceBullets(item)
  const achievements = getExperienceAchievements(item)
  const technologies = getExperienceTechnologies(item)

  return (
    <div
      key={`${item.role}-${item.company}-${index}`}
      className={`modern-showcase__timeline-item${isLast ? ' modern-showcase__timeline-item--last' : ''}`}
      data-export-card="true"
      data-direct-edit-index={sourceIndex}
    >
      {showTimeline ? (
        <div className="modern-showcase__timeline-rail">
          <span className="modern-showcase__timeline-marker" aria-hidden="true" />
          <span className="modern-showcase__timeline-line" aria-hidden="true" />
        </div>
      ) : null}
      <div className="modern-showcase__timeline-card">
        <div className="modern-showcase__role-row">
          <div className="min-w-0">
            <p className="modern-showcase__role-title">
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
              <p className="modern-showcase__company">
                <EditableField
                  as="span"
                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                  value={item.company}
                  placeholder={copy.company}
                />
                {item.location ? ` · ${item.location}` : null}
              </p>
            ) : item.company || item.location ? (
              <p className="modern-showcase__company">
                {[item.company, item.location].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
          <p className="modern-showcase__dates">{dateRange || copy.datesPending}</p>
        </div>
        {directEditDispatch ? (
          <>
            <p className="modern-showcase__bullets modern-showcase__bullets--editing">
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
                value={item.description}
                placeholder={copy.descriptionPlaceholder}
                multiline
              />
            </p>
            {achievements.length > 0 ? (
              <ul className="modern-showcase__bullets">
                {achievements.map((line, lineIndex) => (
                  <li key={lineIndex}>{highlightMetrics(line)}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : bullets.length > 0 ? (
          <ul className="modern-showcase__bullets">
            {bullets.map((line, lineIndex) => (
              <li key={lineIndex}>{highlightMetrics(line)}</li>
            ))}
          </ul>
        ) : null}
        {technologies.length > 0 ? (
          <p className="modern-showcase__technologies">{technologies.join(' · ')}</p>
        ) : null}
      </div>
    </div>
  )
}

function SectionHead({ icon, title }) {
  return (
    <div className="modern-showcase__section-head">
      <span className="modern-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <h2 className="modern-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, icon, title, children }) {
  return (
    <section className="modern-showcase__section" data-export-section={id} data-export-placement={placement} data-moved-from={movedFrom ?? undefined}>
      <SectionHead icon={icon} title={title} />
      <div className="modern-showcase__section-divider" aria-hidden="true" />
      {children}
    </section>
  )
}

export default function ModernShowcase({
  formData,
  locale = 'en',
  previewRef,
  paletteStyle = {},
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const showTimeline = showcaseConfig.showTimeline !== false
  const showSidebar = showcaseConfig.showSidebar !== false
  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Senior Professional')
  const photo = snapshot.photo
  const showPhoto = configShowPhoto && Boolean(photo) && isPhotoVisibleForTemplate(
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
  // Editing branch only: the same grouping over formData.skills, each chip
  // carrying its ORIGINAL flat-array index so removal hits the right skill.
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
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
    summary: isFinnish ? 'Yhteenveto' : 'Professional Summary',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    projects: isFinnish ? 'Projektit' : 'Projects',
    achievements: isFinnish ? 'Saavutukset' : 'Achievements',
    skills: isFinnish ? 'Taidot' : 'Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    links: isFinnish ? 'Linkit' : 'Links',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} icon="about" title={copy.summary}>
          <p className="modern-showcase__summary">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'about' }}
                value={formData.about}
                placeholder={
                  isFinnish
                    ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
                    : 'Your professional summary will appear here as you fill out the CV form.'
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
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} icon="experience" title={copy.experience}>
          <div className="modern-showcase__timeline">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  showTimeline,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) =>
                renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  showTimeline,
                  isLast: index === snapshot.experience.length - 1,
                  sourceIndex: snapshot.sourceIndices.experience[index],
                }),
              )
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} icon="education" title={copy.education}>
          <div className="modern-showcase__edu-grid">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="modern-showcase__edu-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                  {item.degree ? <p className="modern-showcase__edu-degree">{item.degree}</p> : null}
                  {item.school || item.location ? (
                    <p className="modern-showcase__edu-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {formatDateRange(item.startDate, item.endDate) ? (
                    <p className="modern-showcase__edu-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom} icon="projects" title={copy.projects}>
          <div className="modern-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const stackTags = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="modern-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="modern-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="modern-showcase__project-desc">{item.description}</p> : null}
                    {stackTags.length > 0 ? (
                      <div className="modern-showcase__tag-row">
                        {stackTags.map((chip) => (
                          <span key={chip} className="modern-showcase__tag tpl-chip-wrappable">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                    {item.demoUrl || item.githubUrl ? (
                      <p className="modern-showcase__project-link">{item.demoUrl || item.githubUrl}</p>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement={placement} movedFrom={movedFrom} icon="achievements" title={copy.achievements}>
          <ul className="modern-showcase__achievement-list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <li key={`${item.title}-${index}`} className="modern-showcase__achievement-item" data-direct-edit-index={snapshot.sourceIndices.achievements[index]}>
                  <span className="modern-showcase__achievement-dot" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="modern-showcase__achievement-row">
                      {item.title ? <p className="modern-showcase__achievement-title">{item.title}</p> : null}
                      {item.year ? <p className="modern-showcase__achievement-year">{item.year}</p> : null}
                    </div>
                    {item.description ? <p className="modern-showcase__achievement-desc">{item.description}</p> : null}
                  </div>
                </li>
              ))
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Saavutukset näkyvät tässä.' : 'Achievements will appear here.'}
              </p>
            )}
          </ul>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} icon="skills" title={copy.skills}>
          {directEditDispatch ? (
            // Chips replace the read-only tags outright (never both, or
            // every skill renders twice).
            <div className="modern-showcase__skill-group">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="modern-showcase__skill-group">
                <p className="modern-showcase__skill-group-label">{cat.label}</p>
                <div className="modern-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="modern-showcase__tag tpl-chip-wrappable">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="modern-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} icon="languages" title={copy.languages}>
          <div className="modern-showcase__lang-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="modern-showcase__lang-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span>{item.language}</span>
                  {item.level ? <span className="modern-showcase__lang-level">{item.level}</span> : null}
                </div>
              ))
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement={placement} movedFrom={movedFrom} icon="certificates" title={copy.certificates}>
          <div className="modern-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="modern-showcase__cert-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {item.name ? <p className="modern-showcase__cert-name">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="modern-showcase__cert-meta">
                      {[item.issuer, item.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {item.credentialUrl ? (
                    <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="modern-showcase__cert-link">
                      {copy.viewCredential}
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom} icon="links" title={copy.links}>
          <div className="modern-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="modern-showcase__link-card">
                  <span className="modern-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="modern-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="modern-showcase__link-value tpl-value-breakable" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'interests') {
      return (
        <Section key={key} id="interests" placement={placement} movedFrom={movedFrom} icon="interests" title={copy.interests}>
          <div className="modern-showcase__interest-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`} className="modern-showcase__interest-chip tpl-chip-wrappable" data-direct-edit-index={snapshot.sourceIndices.interests[index]}>
                  <InterestGlyph />
                  {item.name}
                </span>
              ))
            ) : (
              <p className="modern-showcase__empty">
                {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }


  // Each section renders through its home renderer in whichever column the
  // user put it — see createSectionRouter in ./shared.
  const renderSection = createSectionRouter(templateConfig, renderMainSection, renderSidebarSection)

  return (
    <article
      ref={previewRef}
      data-export-root="true"
      data-export-variant="modern"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // ModernShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="modern-showcase preview-document--designer tpl-density-standard"
      style={{ ...paletteStyle, ...(headingColor ? { '--cv-heading-color': headingColor } : null) }}
    >
      <header data-export-header="true" className="modern-showcase__header">
        <div className="min-w-0">
          <p className="modern-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="modern-showcase__name" data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="modern-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="modern-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="modern-showcase__contact-item">
                  <span className="modern-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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

        {showPhoto ? (
          <div className="modern-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="modern-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div className="modern-showcase__header-divider" aria-hidden="true" />

      <div
        className="modern-showcase__body"
        data-export-content="true"
        style={!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        <main className="modern-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderSection(key, 'main'))}
        </main>
        {showSidebar ? (
          <aside className="modern-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
