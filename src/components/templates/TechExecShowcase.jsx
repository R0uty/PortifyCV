// Tech Executive Showcase — the non-ATS visual mode for the Tech Executive
// template. Rendered by CVPreview.jsx instead of the shared flat renderer
// whenever variant === 'techExec' && !atsFriendlyMode. Shares the exact
// same CvData shape as every other template — this file only differs in
// presentation. ATS mode bypasses this component entirely and falls back to
// the shared flat renderer (techExec.js).
//
// Design language (docs/template-design-system.md): an "annual-report /
// navy leadership" layout. A deep-navy (#163D7A) full-width masthead with
// knocked-out white identity, a right-rail + main two-column body, and a
// deep-navy footer band that shows the user's tagline as the document's
// sign-off (only when they have one). The navy bands are the one §3 tint
// region; one royal-blue accent from --tpl-accent; §4 rule-under headings.
// New in v1.2.9 — Tech Executive previously rendered only through the flat
// renderer, which made it read as a near-twin of Modern Professional.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { accentSoftFill } from '../../utils/templateAccents'
import { TECHEXEC_DEFAULT_ACCENT_COLOR } from './techExec'
import {
  devIcons,
  contactIcons,
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

// Experience and Education share the `entry` class, whose spacing and
// divider depend on position. Both pass isFirst/isLast from their own
// index — never :first-child/:last-child, which EditableList's per-entry
// wrapper defeats in Direct Edit (every entry becomes both).
function entryClassName(isFirst, isLast) {
  return [
    'tech-exec-showcase__entry',
    isFirst ? 'tech-exec-showcase__entry--first' : '',
    isLast ? 'tech-exec-showcase__entry--last' : '',
  ].filter(Boolean).join(' ')
}

// Tech Executive's own Experience-entry renderer: role and dates share the
// first row, company/location sit on their own line below. Only role and
// company are editable inline; location stays read-only-appended text.
// `index` is formData-relative in the directEditDispatch branch
// (EditableList's own index); the read-only call site passes the
// snapshot's `sourceIndex`.
function renderExperienceEntry(item, index, { directEditDispatch, copy, isFirst, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = getExperienceBullets(item)
  const achievements = getExperienceAchievements(item)
  const technologies = getExperienceTechnologies(item)

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={entryClassName(isFirst, isLast)} data-export-card="true" data-direct-edit-index={sourceIndex}>
      <div className="tech-exec-showcase__entry-row">
        <p className="tech-exec-showcase__entry-role">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
              value={item.role}
              placeholder={copy.untitledRole}
            />
          ) : item.role || copy.untitledRole}
        </p>
        <p className="tech-exec-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <p className="tech-exec-showcase__entry-meta">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
            value={item.company}
            placeholder={copy.company}
          />
          {item.location ? ` · ${item.location}` : null}
        </p>
      ) : item.company || item.location ? (
        <p className="tech-exec-showcase__entry-meta">
          {[item.company, item.location].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      {directEditDispatch ? (
        <>
          <p className="tech-exec-showcase__bullets tech-exec-showcase__bullets--editing">
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
              value={item.description}
              placeholder={copy.descriptionPlaceholder}
              multiline
            />
          </p>
          {achievements.length > 0 ? (
            <ul className="tech-exec-showcase__bullets">
              {achievements.map((line, lineIndex) => (
                <li key={lineIndex}>{line}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : bullets.length > 0 ? (
        <ul className="tech-exec-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
      {technologies.length > 0 ? (
        <p className="tech-exec-showcase__entry-technologies">{technologies.join(' · ')}</p>
      ) : null}
    </div>
  )
}

function SectionHead({ title }) {
  return (
    <div className="tech-exec-showcase__section-head">
      <h2 className="tech-exec-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, title, children }) {
  return (
    <section className="tech-exec-showcase__section" data-export-section={id} data-export-placement={placement} data-moved-from={movedFrom ?? undefined}>
      <SectionHead title={title} />
      {children}
    </section>
  )
}

export default function TechExecShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = TECHEXEC_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
  const tagline = snapshot.tagline
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
    profile: isFinnish ? 'Profiili' : 'Profile',
    experience: isFinnish ? 'Työkokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    skills: isFinnish ? 'Tekniset taidot' : 'Technical Skills',
    coreStrengths: isFinnish ? 'Ydinvahvuudet' : 'Core Strengths',
    certificates: isFinnish ? 'Sertifioinnit' : 'Certifications',
    projects: isFinnish ? 'Projektit' : 'Projects',
    links: isFinnish ? 'Linkit' : 'Links',
    languages: isFinnish ? 'Kielet' : 'Languages',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} title={copy.profile}>
          <p className="tech-exec-showcase__summary">
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
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} title={copy.experience}>
          <div className="tech-exec-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
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
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} title={copy.education}>
          <div className="tech-exec-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div
                  key={`${item.school}-${index}`}
                  className={entryClassName(index === 0, index === snapshot.education.length - 1)}
                  data-export-card="true"
                  data-direct-edit-index={snapshot.sourceIndices.education[index]}
                >
                  <div className="tech-exec-showcase__entry-row">
                    <p className="tech-exec-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                    <p className="tech-exec-showcase__entry-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                  </div>
                  {item.school || item.location ? (
                    <p className="tech-exec-showcase__entry-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} title={copy.skills}>
          {directEditDispatch ? (
            // The read-only look is one comma-joined line per category,
            // which no chip component reproduces. While editing, the section
            // shows the shared grouped chips instead (same categories, same
            // order); the comma lines return as soon as editing ends.
            <div className="tech-exec-showcase__skill-groups">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : skillCategories.length > 0 ? (
            <div className="tech-exec-showcase__skill-groups">
              {skillCategories.map((cat) => (
                <p key={cat.key} className="tech-exec-showcase__skill-group" data-export-skill="true">
                  <span className="tech-exec-showcase__skill-group-label">{cat.label}: </span>
                  <span className="tech-exec-showcase__skill-items">{cat.items.join(', ')}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="tech-exec-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'coreStrengths') {
      return (
        <Section key={key} id="coreStrengths" placement={placement} movedFrom={movedFrom} title={copy.coreStrengths}>
          <div className="tech-exec-showcase__strength-list">
            {snapshot.coreStrengths.length > 0 ? (
              snapshot.coreStrengths.map((item, index) => (
                <div key={`${item.title}-${index}`} className="tech-exec-showcase__strength-item" data-direct-edit-index={snapshot.sourceIndices.coreStrengths[index]}>
                  {item.title ? <p className="tech-exec-showcase__strength-title">{item.title}</p> : null}
                  {item.description ? <p className="tech-exec-showcase__strength-desc">{item.description}</p> : null}
                </div>
              ))
            ) : (
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Ydinvahvuudet näkyvät tässä.' : 'Core strengths will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement={placement} movedFrom={movedFrom} title={copy.certificates}>
          <ul className="tech-exec-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <li key={`${item.name}-${index}`} className="tech-exec-showcase__cert-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  <span className="tech-exec-showcase__cert-dot" aria-hidden="true" />
                  <div className="min-w-0">
                    {item.name ? <p className="tech-exec-showcase__cert-name">{item.name}</p> : null}
                    {item.issuer || item.year ? (
                      <p className="tech-exec-showcase__cert-meta">
                        {[item.issuer, item.year].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    {item.credentialUrl ? (
                      <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="tech-exec-showcase__cert-link">
                        {copy.viewCredential}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))
            ) : (
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Sertifioinnit näkyvät tässä.' : 'Certifications will appear here.'}
              </p>
            )}
          </ul>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom} title={copy.projects}>
          <div className="tech-exec-showcase__project-list">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="tech-exec-showcase__project" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="tech-exec-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="tech-exec-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <p className="tech-exec-showcase__project-stack">{tags.join(' · ')}</p>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom} title={copy.links}>
          <div className="tech-exec-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="tech-exec-showcase__link-card">
                  <span className="tech-exec-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="tech-exec-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="tech-exec-showcase__link-value tpl-value-breakable" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} title={copy.languages}>
          <ul className="tech-exec-showcase__inline-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <li key={`${item.language}-${index}`} className="tech-exec-showcase__inline-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span>{item.language}</span>
                  {item.level ? <span className="tech-exec-showcase__inline-meta"> — {item.level}</span> : null}
                </li>
              ))
            ) : (
              <p className="tech-exec-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </ul>
        </Section>
      )
    }

    if (key === 'interests') {
      return (
        <Section key={key} id="interests" placement={placement} movedFrom={movedFrom} title={copy.interests}>
          {snapshot.interests.length > 0 ? (
            <p className="tech-exec-showcase__interests">
              {snapshot.interests.map((item) => item.name).filter(Boolean).join(' · ')}
            </p>
          ) : (
            <p className="tech-exec-showcase__empty">
              {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
            </p>
          )}
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
      data-export-variant="techExec"
      data-export-content="true"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own) that ResumeBuilderPage's export handler polls for before
      // starting a PDF export. TechExecShowcase only ever renders in non-ATS
      // mode, so it's always "designer" — omitting it hangs the export.
      className="tech-exec-showcase preview-document--designer tpl-density-compact"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, TECHEXEC_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header className="tech-exec-showcase__masthead" data-export-header="true">
        <div className="min-w-0">
          <p className="tech-exec-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="tech-exec-showcase__name" data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="tech-exec-showcase__role">
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
            <div className="tech-exec-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="tech-exec-showcase__contact-item">
                  <span className="tech-exec-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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
          <div className="tech-exec-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="tech-exec-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div className="tech-exec-showcase__body">
        <main className="tech-exec-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderSection(key, 'main'))}
        </main>

        <aside className="tech-exec-showcase__sidebar" data-export-secondary="true">
          {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
        </aside>
      </div>

      {tagline ? (
        <footer className="tech-exec-showcase__footer">
          <p className="tech-exec-showcase__footer-text">{tagline}</p>
        </footer>
      ) : null}
    </article>
  )
}
