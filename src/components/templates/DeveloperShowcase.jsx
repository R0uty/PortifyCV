// Developer Showcase — the non-ATS "Developer Showcase" visual mode for the
// Developer template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'developer' && !atsFriendlyMode. Shares the
// exact same CvData shape as every other template — this file only differs
// in presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer.
//
// Restyled 2026-08-23 against docs/developer-showcase-cv.html (full-bleed
// dark sidebar, portfolio-style cards only on the high-value main sections).
// Reworked 2026-09-10 to docs/template-design-system.md: the per-category /
// per-chip 7-colour cycle on skill tags and project chips is gone — one tag
// style now — and the company line is ink, not blue. The template's one
// documented accent form is the fixed teal→blue→purple cool-spectrum
// gradient (name, photo ring, icon badges, timeline marker); it opts out of
// the Settings accent swatch (§6). §4 heading: icon-badge (the gradient
// divider bar under each title is removed). Type sizes read the `--tpl-*`
// ramp via `tpl-density-standard`.

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

// The fixed cool-spectrum gradient — Developer's one accent form. Used for
// the name text, photo ring, section-icon badges and timeline marker.
const SECTION_ICON_GRADIENT = 'linear-gradient(135deg, var(--dev-teal), var(--dev-blue), var(--dev-purple))'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Developer's own Experience-entry renderer: a timeline rail beside a
// card, like Modern Professional's (not directEditExperienceEntry.jsx's
// shape). Only role and company are editable inline; location stays
// read-only-appended text. `index` is formData-relative in the
// directEditDispatch branch (EditableList's own index); the read-only call
// site passes the snapshot's `sourceIndex`.
//
// The rail's connector line is hidden on the last entry through an
// `--last` modifier class, never :last-child — EditableList wraps each
// entry in its own .direct-edit-entry div, making every item a last child.
function renderExperienceEntry(item, index, { directEditDispatch, copy, showTimeline, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div
      data-direct-edit-index={sourceIndex}
      key={`${item.role}-${item.company}-${index}`}
      className={`dev-showcase__timeline-item${isLast ? ' dev-showcase__timeline-item--last' : ''}`}
      data-export-card="true"
    >
      {showTimeline ? (
        <div className="dev-showcase__timeline-rail">
          <span className="dev-showcase__timeline-marker" aria-hidden="true" />
          <span className="dev-showcase__timeline-line" aria-hidden="true" />
        </div>
      ) : null}
      <div className="dev-showcase__timeline-card">
        <div className="dev-showcase__role-row">
          <div className="min-w-0">
            <p className="dev-showcase__role-title">
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
              <p className="dev-showcase__company">
                <EditableField
                  as="span"
                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                  value={item.company}
                  placeholder={copy.company}
                />
                {item.location ? ` · ${item.location}` : null}
              </p>
            ) : item.company || item.location ? (
              <p className="dev-showcase__company">
                {[item.company, item.location].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
          <p className="dev-showcase__dates">{dateRange || copy.datesPending}</p>
        </div>
        {directEditDispatch ? (
          <p className="dev-showcase__bullets dev-showcase__bullets--editing">
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
              value={item.description}
              placeholder={copy.descriptionPlaceholder}
              multiline
            />
          </p>
        ) : bullets.length > 0 ? (
          <ul className="dev-showcase__bullets">
            {bullets.map((line, lineIndex) => (
              <li key={lineIndex}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

// Takes the section's real placement, the same fact Section derives its
// tone class from, so a section moved between columns gets the heading
// colour of the surface it now sits on (light on the dark rail, primary on
// the page) without every call site restating the mapping.
function SectionHeading({ icon, label, placement }) {
  return (
    <div>
      <h2
        className="dev-showcase__section-title"
        style={{ color: placement === 'side' ? '#f1f5f9' : 'var(--dev-primary)' }}
      >
        <span
          className="dev-showcase__section-icon"
          style={{ background: SECTION_ICON_GRADIENT }}
          aria-hidden="true"
        >
          {sectionIcons[icon]}
        </span>
        {label}
      </h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, children }) {
  const toneClass = placement === 'side' ? 'dev-showcase__section--sidebar' : 'dev-showcase__section--main'

  return (
    <section
      className={`dev-showcase__section ${toneClass}`}
      data-export-section={id}
      data-export-placement={placement}
      data-moved-from={movedFrom ?? undefined}
    >
      {children}
    </section>
  )
}

export default function DeveloperShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  // Config flags read from the template config object (see developer.js's
  // "Developer Showcase config" block) — each has a sensible default so the
  // component still renders fully if a flag is omitted.
  const showDecorations = showcaseConfig.showDecorations !== false
  const showSidebar = showcaseConfig.showSidebar !== false
  const showTimeline = showcaseConfig.showTimeline !== false
  const animationEnabled = showcaseConfig.animationEnabled !== false
  const gradientEnabled = showcaseConfig.gradientEnabled !== false
  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Full Stack -kehittäjä' : 'Full Stack Developer')
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
  const hasSidebar = showSidebar && sidebarSectionKeys.length > 0

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
  }

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="skills" label={isFinnish ? 'Taidot' : 'Skills'} placement={placement} />
          {directEditDispatch ? (
            // Chips replace the read-only tags outright (never both, or
            // every skill renders twice).
            <div className="dev-showcase__skill-group">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="dev-showcase__skill-group">
                <p className="dev-showcase__skill-group-label">{cat.label}</p>
                <div className="dev-showcase__skill-tags">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="dev-showcase__skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="dev-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="links" label={isFinnish ? 'Linkit' : 'Links'} placement={placement} />
          {linkEntries.length > 0 ? (
            linkEntries.map(([linkKey, value]) => (
              <div key={linkKey} data-export-card="true" className="dev-showcase__link-card">
                <span className="dev-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                <div className="min-w-0">
                  <p className="dev-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                  <p className="dev-showcase__link-value tpl-value-breakable" title={value}>{formatLinkDisplayValue(value)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="dev-showcase__empty">
              {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="certificates" label={isFinnish ? 'Sertifikaatit' : 'Certificates'} placement={placement} />
          {snapshot.certificates.length > 0 ? (
            snapshot.certificates.map((item, index) => (
              <div key={`${item.name}-${index}`} data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.certificates[index]} className="dev-showcase__cert-card">
                {item.name ? <p className="dev-showcase__cert-name">{item.name}</p> : null}
                {item.issuer || item.year ? (
                  <p className="dev-showcase__cert-meta">
                    {[item.issuer, item.year].filter(Boolean).join(', ')}
                  </p>
                ) : null}
                {item.credentialUrl ? (
                  <a
                    href={getSafeHref(item.credentialUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="dev-showcase__cert-link"
                  >
                    {copy.viewCredential}
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <p className="dev-showcase__empty">
              {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="education" label={isFinnish ? 'Koulutus' : 'Education'} placement={placement} />
          {snapshot.education.length > 0 ? (
            snapshot.education.map((item, index) => (
              <div key={`${item.school}-${index}`} data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]} className="dev-showcase__edu-item">
                {item.degree ? <p className="dev-showcase__edu-degree">{item.degree}</p> : null}
                {item.school || item.location ? (
                  <p className="dev-showcase__edu-meta">
                    {[item.school, item.location].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                {formatDateRange(item.startDate, item.endDate) ? (
                  <p className="dev-showcase__edu-meta">{formatDateRange(item.startDate, item.endDate)}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="dev-showcase__empty">
              {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="languages" label={isFinnish ? 'Kielet' : 'Languages'} placement={placement} />
          {snapshot.languages.length > 0 ? (
            snapshot.languages.map((item, index) => (
              <div key={`${item.language}-${index}`} className="dev-showcase__lang-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                <span className="dev-showcase__lang-dot" aria-hidden="true" />
                <span>{item.language}</span>
                {item.level ? <span className="dev-showcase__lang-level"> — {item.level}</span> : null}
              </div>
            ))
          ) : (
            <p className="dev-showcase__empty">
              {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    return null
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="about" label={isFinnish ? 'Yhteenveto' : 'Summary'} placement={placement} />
          <p className="dev-showcase__summary">
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
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="experience" label={isFinnish ? 'Kokemus' : 'Experience'} placement={placement} />
          <div className="dev-showcase__timeline">
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
              <p className="dev-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="projects" label={isFinnish ? 'Projektit' : 'Projects'} placement={placement} />
          <div className="dev-showcase__card-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const chips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="dev-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="dev-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="dev-showcase__project-desc">{item.description}</p> : null}
                    {chips.length > 0 ? (
                      <div className="dev-showcase__chip-row">
                        {chips.map((chip) => (
                          <span key={chip} className="dev-showcase__chip">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                    {item.githubUrl || item.demoUrl ? (
                      <div className="dev-showcase__link-row">
                        {item.githubUrl ? (
                          <a
                            href={getSafeHref(item.githubUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="dev-showcase__project-link"
                            title={item.githubUrl}
                          >
                            {formatLinkDisplayValue(item.githubUrl)}
                          </a>
                        ) : null}
                        {item.demoUrl ? (
                          <a
                            href={getSafeHref(item.demoUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="dev-showcase__project-link"
                            title={item.demoUrl}
                          >
                            {formatLinkDisplayValue(item.demoUrl)}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="dev-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="achievements" label={isFinnish ? 'Saavutukset' : 'Achievements'} placement={placement} />
          <div className="dev-showcase__card-grid">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <div key={`${item.title}-${index}`} className="dev-showcase__achievement-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.achievements[index]}>
                  <span className="dev-showcase__trophy-icon" aria-hidden="true">{sectionIcons.achievements}</span>
                  <div className="min-w-0">
                    <div className="dev-showcase__achievement-title-row">
                      {item.title ? <p className="dev-showcase__achievement-title">{item.title}</p> : null}
                      {item.year ? <p className="dev-showcase__achievement-year">{item.year}</p> : null}
                    </div>
                    {item.description ? (
                      <p className="dev-showcase__achievement-desc">{item.description}</p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="dev-showcase__empty">
                {isFinnish ? 'Saavutukset näkyvät tässä.' : 'Achievements will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'openSource') {
      return (
        <Section key={key} id="openSource" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="openSource" label={isFinnish ? 'Avoin lähdekoodi' : 'Open Source'} placement={placement} />
          <div className="dev-showcase__card-grid">
            {snapshot.openSource.length > 0 ? (
              snapshot.openSource.map((item, index) => (
                <div key={`${item.name}-${index}`} className="dev-showcase__opensource-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.openSource[index]}>
                  {item.name ? <p className="dev-showcase__opensource-name">{item.name}</p> : null}
                  {item.language || item.stars || item.forks ? (
                    <div className="dev-showcase__opensource-meta">
                      {item.language ? (
                        <span className="dev-showcase__opensource-meta-item">
                          <span className="dev-showcase__lang-dot" aria-hidden="true" />
                          {item.language}
                        </span>
                      ) : null}
                      {item.stars ? (
                        <span className="dev-showcase__opensource-meta-item">★ {item.stars}</span>
                      ) : null}
                      {item.forks ? (
                        <span className="dev-showcase__opensource-meta-item">⑂ {item.forks}</span>
                      ) : null}
                    </div>
                  ) : null}
                  {item.description ? (
                    <p className="dev-showcase__opensource-desc">{item.description}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="dev-showcase__empty">
                {isFinnish
                  ? 'Avoimen lähdekoodin projektit näkyvät tässä.'
                  : 'Open-source repositories will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'publications') {
      return (
        <Section key={key} id="publications" placement={placement} movedFrom={movedFrom}>
          <SectionHeading icon="publications" label={isFinnish ? 'Julkaisut' : 'Publications'} placement={placement} />
          <div className="dev-showcase__card-grid">
            {snapshot.publications.length > 0 ? (
              snapshot.publications.map((item, index) => (
                <div key={`${item.title}-${index}`} className="dev-showcase__publication-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.publications[index]}>
                  {item.title ? <p className="dev-showcase__publication-title">{item.title}</p> : null}
                  {item.publisher || item.year ? (
                    <p className="dev-showcase__publication-meta">
                      {[item.publisher, item.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="dev-showcase__empty">
                {isFinnish ? 'Julkaisut näkyvät tässä.' : 'Publications will appear here.'}
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
      data-export-variant="developer"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // DeveloperShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className={`dev-showcase preview-document--designer tpl-density-standard ${animationEnabled ? '' : 'dev-showcase--no-animation'}`}
    >
      {showDecorations ? (
        <div className="dev-showcase__bg" data-export-ignore="true" data-decorative aria-hidden="true">
          <span className="dev-showcase__blob dev-showcase__blob--teal" />
          <span className="dev-showcase__blob dev-showcase__blob--purple" />
          <span className="dev-showcase__blob dev-showcase__blob--blue" />
          <span className="dev-showcase__grid" />
        </div>
      ) : null}

      <header data-export-header="true" className="dev-showcase__header">
        <div className="min-w-0">
          <p className="dev-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className={`dev-showcase__name ${gradientEnabled ? '' : 'dev-showcase__name--solid'}`} data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="dev-showcase__role">
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
            <div className="dev-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="dev-showcase__contact-item">
                  <span className="dev-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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
          <div className="dev-showcase__photo-wrap">
            <div className="dev-showcase__photo-ring">
              <div className="dev-showcase__photo-ring-inner">
                <img
                  src={photo}
                  alt={`${fullName} profile`}
                  data-export-photo="true"
                  className="dev-showcase__photo"
                />
              </div>
            </div>
            <span className="dev-showcase__photo-dot" aria-hidden="true" />
          </div>
        ) : null}
      </header>

      {/* The body grid reserves a narrow first track for the rail, so it
          must collapse to one track whenever the rail isn't rendered —
          either because this variant has no sidebar, or because the user
          moved every sidebar section into main, which would otherwise
          squeeze the whole CV into that narrow track. Sidebar sections that
          flow into main for want of a rail render with placement 'main',
          where they actually are, so their heading tone, the PDF exporter's
          pagination and the moved-section CSS all agree. */}
      <div
        className="dev-showcase__body"
        data-export-content="true"
        style={!hasSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        {hasSidebar ? (
          <aside className="dev-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
          </aside>
        ) : null}
        <main className="dev-showcase__main" data-export-primary="true">
          {!showSidebar ? sidebarSectionKeys.map((key) => renderSection(key, 'main')) : null}
          {mainSectionKeys.map((key) => renderSection(key, 'main'))}
        </main>
      </div>
    </article>
  )
}
