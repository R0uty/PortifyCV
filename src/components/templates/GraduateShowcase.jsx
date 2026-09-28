// Graduate Showcase — the non-ATS "future potential" visual mode for the
// Graduate template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'graduate' && !atsFriendlyMode. Shares the
// exact same CvData shape as every other template — this file only differs
// in presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (graduate.js).
//
// Design language (reworked 2026-09-10 to docs/template-design-system.md):
// education-first, welcoming, but no longer a "SaaS card grid" — sections
// flow directly on the page (only a light header tint band remains, the §3
// one-tint region), with the §4 icon-badge heading treatment. One indigo
// accent read from --tpl-accent (user-customizable), replacing the old
// indigo/blue/sky/purple/green palette. Education renders first, with a
// left accent rule; internships keep their small timeline treatment.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { accentSoftFill } from '../../utils/templateAccents'
import { GRADUATE_DEFAULT_ACCENT_COLOR } from './graduate'
import {
  devIcons,
  contactIcons,
  sectionIcons,
  parseSkillCategories,
  formatDateRange,
  formatLinkLabel,
  formatLinkDisplayValue,
  getSafeHref,
  createSectionRouter,
} from './shared'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Detects an in-progress education entry (e.g. endDate "Present" / "Expected
// 2026") so it can be flagged with a small "currently studying" badge,
// per the spec's "Highlight expected graduation if still studying."
function isInProgress(endDate) {
  return /present|expected|ongoing/i.test(endDate || '')
}

function SectionHead({ icon, title }) {
  return (
    <div className="graduate-showcase__section-head">
      <span className="graduate-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <h2 className="graduate-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, icon, title, children }) {
  return (
    <section
      className="graduate-showcase__section"
      data-export-section={id}
      data-export-placement={placement}
      data-moved-from={movedFrom ?? undefined}
    >
      <SectionHead icon={icon} title={title} />
      {children}
    </section>
  )
}

export default function GraduateShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  headingColor = null,
  accentColor = GRADUATE_DEFAULT_ACCENT_COLOR,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const showSidebar = showcaseConfig.showSidebar !== false
  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Vastavalmistunut kehittäjä' : 'Graduate Software Engineer')
  const tagline = snapshot.tagline
  const photo = snapshot.photo
  const showPhoto = configShowPhoto && Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const about = snapshot.about

  const personalContactItems = [
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['location', snapshot.location],
  ].filter(([, value]) => value)

  const linkEntries = Object.entries(snapshot.links)
  const skillCategories = useMemo(
    () => parseSkillCategories(snapshot.skills, isFinnish),
    [snapshot.skills, isFinnish],
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
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    inProgress: isFinnish ? 'Opiskelee parhaillaan' : 'Currently studying',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
    about: isFinnish ? 'Uratavoite' : 'Career Objective',
    education: isFinnish ? 'Koulutus' : 'Education',
    projects: isFinnish ? 'Akateemiset projektit' : 'Academic Projects',
    internships: isFinnish ? 'Harjoittelut' : 'Internships',
    experience: isFinnish ? 'Työkokemus' : 'Work Experience',
    publications: isFinnish ? 'Tutkimus' : 'Research',
    volunteering: isFinnish ? 'Vapaaehtoistyö' : 'Volunteer Work',
    skills: isFinnish ? 'Tekniset taidot' : 'Technical Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    links: isFinnish ? 'Linkit' : 'Links',
    achievements: isFinnish ? 'Saavutukset' : 'Achievements',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
    memberships: isFinnish ? 'Ylimääräinen toiminta' : 'Extracurricular Activities',
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      if (!about) return null

      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} icon="about" title={copy.about}>
          <p className="graduate-showcase__summary">{about}</p>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} icon="education" title={copy.education}>
          <div className="graduate-showcase__edu-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const inProgress = isInProgress(item.endDate)
                const metaLine = [item.grade, item.coursework].filter(Boolean).join(' · ')

                return (
                  <div key={`${item.school}-${index}`} className="graduate-showcase__edu-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                    <div className="graduate-showcase__edu-row">
                      <div className="min-w-0">
                        <p className="graduate-showcase__edu-degree">{item.degree}</p>
                        {item.school || item.location ? (
                          <p className="graduate-showcase__edu-meta">
                            {[item.school, item.location].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <div className="graduate-showcase__edu-dates-col">
                        <p className="graduate-showcase__edu-dates">{dateRange || copy.datesPending}</p>
                        {inProgress ? <span className="graduate-showcase__badge">{copy.inProgress}</span> : null}
                      </div>
                    </div>
                    {item.honors ? <p className="graduate-showcase__edu-honors">{item.honors}</p> : null}
                    {metaLine ? <p className="graduate-showcase__edu-meta">{metaLine}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="graduate-showcase__empty">
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
          <div className="graduate-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const chips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []
                const metaLine = [item.teamSize, item.contribution].filter(Boolean).join(' · ')

                return (
                  <div key={`${item.name}-${index}`} className="graduate-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="graduate-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="graduate-showcase__project-desc">{item.description}</p> : null}
                    {metaLine ? <p className="graduate-showcase__project-meta">{metaLine}</p> : null}
                    {item.impact ? <p className="graduate-showcase__project-impact">{item.impact}</p> : null}
                    {chips.length > 0 ? (
                      <div className="graduate-showcase__tag-row">
                        {chips.map((chip) => (
                          <span key={chip} className="graduate-showcase__tag">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                    {item.githubUrl || item.demoUrl ? (
                      <div className="graduate-showcase__link-row">
                        {item.githubUrl ? (
                          <a
                            href={getSafeHref(item.githubUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="graduate-showcase__project-link"
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
                            className="graduate-showcase__project-link"
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
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'internships') {
      return (
        <Section key={key} id="internships" placement={placement} movedFrom={movedFrom} icon="experience" title={copy.internships}>
          <div className="graduate-showcase__timeline">
            {snapshot.internships.length > 0 ? (
              snapshot.internships.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="graduate-showcase__timeline-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.internships[index]}>
                    <div className="graduate-showcase__timeline-rail">
                      <span className="graduate-showcase__timeline-marker" aria-hidden="true" />
                      <span className="graduate-showcase__timeline-line" aria-hidden="true" />
                    </div>
                    <div className="graduate-showcase__timeline-card">
                      <div className="graduate-showcase__edu-row">
                        <div className="min-w-0">
                          <p className="graduate-showcase__edu-degree">{item.role}</p>
                          {item.company || item.location ? (
                            <p className="graduate-showcase__edu-meta">
                              {[item.company, item.location].filter(Boolean).join(' · ')}
                            </p>
                          ) : null}
                        </div>
                        <p className="graduate-showcase__edu-dates">{dateRange || copy.datesPending}</p>
                      </div>
                      {bullets.length > 0 ? (
                        <ul className="graduate-showcase__bullets">
                          {bullets.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}
                        </ul>
                      ) : null}
                      {item.technologies ? (
                        <p className="graduate-showcase__project-meta">{item.technologies}</p>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Harjoittelut näkyvät tässä.' : 'Internships will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} icon="experience" title={copy.experience}>
          <div className="graduate-showcase__edu-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="graduate-showcase__edu-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.experience[index]}>
                    <div className="graduate-showcase__edu-row">
                      <div className="min-w-0">
                        <p className="graduate-showcase__edu-degree">{item.role}</p>
                        {item.company || item.location ? (
                          <p className="graduate-showcase__edu-meta">
                            {[item.company, item.location].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="graduate-showcase__edu-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="graduate-showcase__bullets">
                        {bullets.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Työkokemus näkyy tässä.' : 'Work experience will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'publications') {
      return (
        <Section key={key} id="publications" placement={placement} movedFrom={movedFrom} icon="publications" title={copy.publications}>
          <div className="graduate-showcase__edu-list">
            {snapshot.publications.length > 0 ? (
              snapshot.publications.map((item, index) => (
                <div key={`${item.title}-${index}`} className="graduate-showcase__edu-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.publications[index]}>
                  {item.title ? <p className="graduate-showcase__edu-degree">{item.title}</p> : null}
                  {item.publisher || item.year ? (
                    <p className="graduate-showcase__edu-meta">
                      {[item.publisher, item.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Tutkimus näkyy tässä.' : 'Research will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'volunteering') {
      return (
        <Section key={key} id="volunteering" placement={placement} movedFrom={movedFrom} icon="volunteering" title={copy.volunteering}>
          <div className="graduate-showcase__edu-list">
            {snapshot.volunteering.length > 0 ? (
              snapshot.volunteering.map((item, index) => {
                const heading = [item.role, item.organization].filter(Boolean).join(' — ')
                return (
                  <div key={`${item.role}-${item.organization}-${index}`} className="graduate-showcase__edu-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.volunteering[index]}>
                    {heading ? <p className="graduate-showcase__edu-degree">{heading}</p> : null}
                    {item.description ? <p className="graduate-showcase__project-desc">{item.description}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Vapaaehtoistyö näkyy tässä.' : 'Volunteer work will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} icon="skills" title={copy.skills}>
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="graduate-showcase__skill-group">
                <p className="graduate-showcase__skill-group-label">{cat.label}</p>
                <div className="graduate-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="graduate-showcase__tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="graduate-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} icon="languages" title={copy.languages}>
          <div className="graduate-showcase__list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="graduate-showcase__list-item graduate-showcase__list-item--row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span>{item.language}</span>
                  {item.level ? <span className="graduate-showcase__list-meta">{item.level}</span> : null}
                </div>
              ))
            ) : (
              <p className="graduate-showcase__empty">
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
          <div className="graduate-showcase__list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="graduate-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {item.name ? <p className="graduate-showcase__list-title">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="graduate-showcase__list-meta">
                      {[item.issuer, item.year].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {item.expiry ? (
                    <p className="graduate-showcase__list-meta">
                      {isFinnish ? `Vanhenee ${item.expiry}` : `Expires ${item.expiry}`}
                    </p>
                  ) : null}
                  {item.credentialUrl ? (
                    <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="graduate-showcase__list-link">
                      {copy.viewCredential}
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="graduate-showcase__empty">
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
          <div className="graduate-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="graduate-showcase__link-card">
                  <span className="graduate-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="graduate-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="graduate-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement={placement} movedFrom={movedFrom} icon="achievements" title={copy.achievements}>
          <div className="graduate-showcase__list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <div key={`${item.title}-${index}`} className="graduate-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.achievements[index]}>
                  <div className="graduate-showcase__list-item-row">
                    {item.title ? <p className="graduate-showcase__list-title">{item.title}</p> : null}
                    {item.year ? <p className="graduate-showcase__list-meta">{item.year}</p> : null}
                  </div>
                  {item.description ? <p className="graduate-showcase__list-desc">{item.description}</p> : null}
                </div>
              ))
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Saavutukset näkyvät tässä.' : 'Achievements will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'memberships') {
      return (
        <Section key={key} id="memberships" placement={placement} movedFrom={movedFrom} icon="memberships" title={copy.memberships}>
          <div className="graduate-showcase__list">
            {snapshot.memberships.length > 0 ? (
              snapshot.memberships.map((item, index) => (
                <div key={`${item.organization}-${index}`} className="graduate-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.memberships[index]}>
                  {item.organization ? <p className="graduate-showcase__list-title">{item.organization}</p> : null}
                  {item.role || item.year ? (
                    <p className="graduate-showcase__list-meta">
                      {[item.role, item.year].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="graduate-showcase__empty">
                {isFinnish ? 'Toiminta näkyy tässä.' : 'Activities will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'interests') {
      return (
        <Section key={key} id="interests" placement={placement} movedFrom={movedFrom} icon="interests" title={copy.interests}>
          <div className="graduate-showcase__interest-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span data-direct-edit-index={snapshot.sourceIndices.interests[index]} key={`${item.name}-${index}`} className="graduate-showcase__interest-chip">{item.name}</span>
              ))
            ) : (
              <p className="graduate-showcase__empty">
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
      data-export-variant="graduate"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // GraduateShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="graduate-showcase preview-document--designer tpl-density-standard"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, GRADUATE_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header data-export-header="true" className="graduate-showcase__header">
        <div className="min-w-0">
          <p className="graduate-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="graduate-showcase__name">{fullName}</h1>
          <p className="graduate-showcase__role">{title}</p>
          {tagline ? <p className="graduate-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="graduate-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="graduate-showcase__contact-item">
                  <span className="graduate-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="graduate-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="graduate-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div
        className="graduate-showcase__body"
        data-export-content="true"
        style={!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        <main className="graduate-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderSection(key, 'main'))}
        </main>
        {showSidebar ? (
          <aside className="graduate-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
