// Executive Showcase — the non-ATS "boardroom" visual mode for the Executive
// template. Rendered by CVPreview.jsx instead of the shared generic renderer
// whenever variant === 'executive' && !atsFriendlyMode. Shares the exact
// same CvData shape as every other template — this file only differs in
// presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (executive.js).
//
// Design language: luxury boardroom resume — deep navy / indigo / royal blue,
// with a single restrained gold accent reserved for the Awards section only
// (per spec: "Gold should only be used for subtle highlights"). No decorative
// timeline, no boxed section containers — whitespace and thin 1px dividers
// separate content instead (see DeveloperShowcase / CreativeShowcase / index.css
// for the more heavily-carded counterexamples). Only Projects and Links use a
// subtle bordered card, matching the spec's explicit "Professional cards" call-out.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import {
  devIcons,
  contactIcons,
  sectionIcons,
  parseSkillCategories,
  formatDateRange,
  formatLinkLabel,
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

function SectionHead({ icon, title, tone }) {
  return (
    <div className="executive-showcase__section-head">
      <span className={`executive-showcase__section-icon${tone === 'gold' ? ' executive-showcase__section-icon--gold' : ''}`} aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <p className="executive-showcase__section-title">{title}</p>
    </div>
  )
}

function Section({ id, placement, icon, title, tone, children }) {
  return (
    <section className="executive-showcase__section" data-export-section={id} data-export-placement={placement}>
      <SectionHead icon={icon} title={title} tone={tone} />
      {children}
    </section>
  )
}

export default function ExecutiveShowcase({ formData, locale = 'en', previewRef, templateConfig, showcaseConfig = {} }) {
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
        <Section key={key} id="about" placement="main" icon="about" title={copy.profile}>
          <p className="executive-showcase__summary">{about}</p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" icon="experience" title={copy.experience}>
          <div className="executive-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="executive-showcase__entry" data-export-card="true">
                    <div className="executive-showcase__entry-row">
                      <div className="min-w-0">
                        <p className="executive-showcase__entry-role">{item.role || copy.untitledRole}</p>
                        {item.company || item.location ? (
                          <p className="executive-showcase__entry-meta">
                            {[item.company, item.location].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="executive-showcase__entry-dates">{dateRange || copy.datesPending}</p>
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
              })
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
        <Section key={key} id="leadership" placement="main" icon="leadership" title={copy.leadership}>
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
        <Section key={key} id="projects" placement="main" icon="projects" title={copy.projects}>
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

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement="main" icon="education" title={copy.education}>
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
        <Section key={key} id="coreStrengths" placement="side" icon="coreStrengths" title={copy.coreStrengths}>
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
        <Section key={key} id="skills" placement="side" icon="skills" title={copy.skills}>
          {skillCategories.length > 0 ? (
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
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement="side" icon="certificates" title={copy.certificates}>
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
                    <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="executive-showcase__list-link">
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
        <Section key={key} id="languages" placement="side" icon="languages" title={copy.languages}>
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
        <Section key={key} id="memberships" placement="side" icon="memberships" title={copy.memberships}>
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

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement="side" icon="achievements" title={copy.achievements} tone="gold">
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

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement="side" icon="links" title={copy.links}>
          <div className="executive-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="executive-showcase__link-card">
                  <span className="executive-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="executive-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="executive-showcase__link-value">{value}</p>
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
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // ExecutiveShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="executive-showcase preview-document--designer"
    >
      <header data-export-header="true" className="executive-showcase__header">
        <div className="min-w-0">
          <p className="executive-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="executive-showcase__name">{fullName}</h1>
          <p className="executive-showcase__role">{title}</p>
          {tagline ? <p className="executive-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="executive-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="executive-showcase__contact-item">
                  <span className="executive-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

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
      </header>

      <div className="executive-showcase__header-divider" aria-hidden="true" />

      <div
        className="executive-showcase__body"
        data-export-content="true"
        style={!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        <main className="executive-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderMainSection(key))}
        </main>
        {showSidebar ? (
          <aside className="executive-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
