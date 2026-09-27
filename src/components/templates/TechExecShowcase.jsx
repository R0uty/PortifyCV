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
  formatDateRange,
  formatLinkLabel,
  formatLinkDisplayValue,
  getSafeHref,
} from './shared'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function SectionHead({ title }) {
  return (
    <div className="tech-exec-showcase__section-head">
      <h2 className="tech-exec-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, title, children }) {
  return (
    <section className="tech-exec-showcase__section" data-export-section={id} data-export-placement={placement}>
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
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
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

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" title={copy.profile}>
          <p className="tech-exec-showcase__summary">{about}</p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" title={copy.experience}>
          <div className="tech-exec-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="tech-exec-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.experience[index]}>
                    <div className="tech-exec-showcase__entry-row">
                      <p className="tech-exec-showcase__entry-role">{item.role || copy.untitledRole}</p>
                      <p className="tech-exec-showcase__entry-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {item.company || item.location ? (
                      <p className="tech-exec-showcase__entry-meta">
                        {[item.company, item.location].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    {bullets.length > 0 ? (
                      <ul className="tech-exec-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
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
        <Section key={key} id="education" placement="main" title={copy.education}>
          <div className="tech-exec-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="tech-exec-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
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
        <Section key={key} id="skills" placement="main" title={copy.skills}>
          {skillCategories.length > 0 ? (
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

  const renderSidebarSection = (key) => {
    if (key === 'coreStrengths') {
      return (
        <Section key={key} id="coreStrengths" placement="side" title={copy.coreStrengths}>
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
        <Section key={key} id="certificates" placement="side" title={copy.certificates}>
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
        <Section key={key} id="projects" placement="side" title={copy.projects}>
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
        <Section key={key} id="links" placement="side" title={copy.links}>
          <div className="tech-exec-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="tech-exec-showcase__link-card">
                  <span className="tech-exec-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="tech-exec-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="tech-exec-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
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
        <Section key={key} id="languages" placement="side" title={copy.languages}>
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
        <Section key={key} id="interests" placement="side" title={copy.interests}>
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
      className="tech-exec-showcase preview-document--designer tpl-density-standard"
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
          <h1 className="tech-exec-showcase__name">{fullName}</h1>
          <p className="tech-exec-showcase__role">{title}</p>
          {personalContactItems.length > 0 ? (
            <div className="tech-exec-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="tech-exec-showcase__contact-item">
                  <span className="tech-exec-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
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
          {mainSectionKeys.map((key) => renderMainSection(key))}
        </main>

        <aside className="tech-exec-showcase__sidebar" data-export-secondary="true">
          {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
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
