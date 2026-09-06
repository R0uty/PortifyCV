// Portfolio Showcase — the non-ATS "portfolio website condensed into a
// résumé" visual mode for the Portfolio Hybrid template. Rendered by
// CVPreview.jsx instead of the shared generic renderer whenever
// variant === 'portfolio' && !atsFriendlyMode. Shares the exact same CvData
// shape as every other template — this file only differs in presentation.
// ATS mode (the app's existing global toggle) bypasses this component
// entirely and falls back to the shared flat renderer (portfolio.js).
//
// Featured Projects is the hero section — premium cards with colorful tech
// chips and GitHub/Live Demo action buttons, mirroring the visual weight a
// real portfolio site would give its project showcase. The sidebar's
// "Skills" section is deliberately branded and styled as "Tech Stack"
// (colorful category-colored badges rather than plain tags) since the
// spec's own CONFIG SUPPORT list only has a showTechStack flag, not a
// separate showSkills one — confirming these are the same underlying data
// rendered with more personality.
//
// Restyled 2026-08-23 against docs/portfolio-hybrid-cv.html: serif display
// name (Instrument Serif, self-hosted here via @fontsource rather than
// main.jsx's global Inter import, so its ~9KB weight is only ever fetched
// by users who actually land on this one template's lazy chunk — see
// CVPreview.jsx's React.lazy() split), a gradient hairline across the very
// top of the card, and every section icon upgraded from a flat glyph to a
// small colored gradient badge (a different two-color pairing per section,
// per the reference) — matching the template's already-established
// "portfolio website condensed into a résumé" multi-color identity instead
// of the single-accent badge every other bespoke Showcase uses.

import { useMemo } from 'react'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import {
  devIcons,
  contactIcons,
  sectionIcons,
  parseSkillCategories,
  formatDateRange,
  formatLinkLabel,
  formatLinkDisplayValue,
  getSafeHref,
} from './shared'

// Category → tag color mapping, matching DeveloperShowcase's palette so
// "Tech Stack" reads consistently with the app's other colorful showcase.
const CATEGORY_COLOR = {
  languages: 'blue',
  frameworks: 'purple',
  databases: 'orange',
  cloud: 'teal',
  devops: 'pink',
  security: 'green',
  other: 'gray',
}

// Rotating palette for free-text tech-stack chips (project.stack), since we
// can't know each individual technology's "correct" color ahead of time.
const CHIP_COLORS = ['emerald', 'teal', 'sky', 'purple', 'green', 'pink']

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Bolds metric-shaped tokens so quantified impact stands out, consistent
// with every other Showcase's "metrics should be emphasised" treatment.
const METRIC_PATTERN = /(\$[\d,.]+[MKB]?\+?|£[\d,.]+[MKB]?\+?|\d+(?:[.,]\d+)?%|\d+x\b|\d+\+|\b\d{2,}(?:,\d{3})+\b)/gi

function highlightMetrics(text) {
  const parts = text.split(METRIC_PATTERN)
  if (parts.length === 1) return text
  return parts.map((part, index) => (
    METRIC_PATTERN.test(part) && part
      ? <strong key={index} className="portfolio-showcase__metric">{part}</strong>
      : part
  ))
}

// Two-color gradient badge per section id, matching the reference mockup's
// per-section icon treatment (About falls back to the base rule's
// emerald→teal gradient in portfolio.css, so it has no entry here).
const SECTION_ICON_TONE = {
  projects: 'violet-sky',
  experience: 'sky-emerald',
  caseStudies: 'orange-pink',
  openSource: 'sky-teal',
  education: 'emerald-teal',
  testimonials: 'violet-pink',
  skills: 'emerald-sky',
  links: 'sky-violet',
  certificates: 'green-teal',
  languages: 'pink-violet',
  achievements: 'orange-pink',
  interests: 'teal-emerald',
}

function SectionHead({ id, icon, title, subtitle }) {
  const tone = SECTION_ICON_TONE[id]
  const iconClassName = tone
    ? `portfolio-showcase__section-icon portfolio-showcase__section-icon--${tone}`
    : 'portfolio-showcase__section-icon'

  return (
    <div className="portfolio-showcase__section-head">
      <span className={iconClassName} aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <div>
        <h2 className="portfolio-showcase__section-title">{title}</h2>
        {subtitle ? <p className="portfolio-showcase__section-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function Section({ id, placement, icon, title, subtitle, children }) {
  return (
    <section className="portfolio-showcase__section" data-export-section={id} data-export-placement={placement}>
      <SectionHead id={id} icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

export default function PortfolioShowcase({ formData, locale = 'en', previewRef, templateConfig, showcaseConfig = {}, headingColor = null }) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const showSidebar = showcaseConfig.showSidebar !== false
  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Full Stack -kehittäjä' : 'Full Stack Developer')
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
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
    about: isFinnish ? 'Minusta' : 'About Me',
    aboutSub: isFinnish ? 'Vähän minusta' : 'A little about me',
    projects: isFinnish ? 'Esitellyt projektit' : 'Featured Projects',
    projectsSub: isFinnish ? 'Valikoituja töitä' : 'Selected work',
    experience: isFinnish ? 'Kokemus' : 'Professional Experience',
    caseStudies: isFinnish ? 'Tapaustutkimukset' : 'Case Studies',
    openSource: isFinnish ? 'Avoin lähdekoodi' : 'Open Source',
    education: isFinnish ? 'Koulutus' : 'Education',
    testimonials: isFinnish ? 'Suositukset' : 'Testimonials',
    skills: isFinnish ? 'Teknologiat' : 'Tech Stack',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    links: isFinnish ? 'Linkit' : 'Links',
    languages: isFinnish ? 'Kielet' : 'Languages',
    achievements: isFinnish ? 'Saavutukset' : 'Achievements',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
    problem: isFinnish ? 'Ongelma' : 'Problem',
    solution: isFinnish ? 'Ratkaisu' : 'Solution',
    technologies: isFinnish ? 'Teknologiat' : 'Technologies',
    outcome: isFinnish ? 'Tulos' : 'Outcome',
    lessons: isFinnish ? 'Opitut asiat' : 'Lessons Learned',
  }

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" icon="about" title={copy.about} subtitle={copy.aboutSub}>
          <p className="portfolio-showcase__summary">{about}</p>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement="main" icon="projects" title={copy.projects} subtitle={copy.projectsSub}>
          <div className="portfolio-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const chips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="portfolio-showcase__project-card" data-export-card="true">
                    {item.name ? <p className="portfolio-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="portfolio-showcase__project-desc">{item.description}</p> : null}
                    {item.impact ? (
                      <p className="portfolio-showcase__project-impact">{highlightMetrics(item.impact)}</p>
                    ) : null}
                    {chips.length > 0 ? (
                      <div className="portfolio-showcase__chip-row">
                        {chips.map((chip, chipIndex) => (
                          <span
                            key={chip}
                            className={`portfolio-showcase__chip portfolio-showcase__chip--${CHIP_COLORS[chipIndex % CHIP_COLORS.length]}`}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.githubUrl || item.demoUrl ? (
                      <div className="portfolio-showcase__link-row">
                        {item.githubUrl ? (
                          <a href={getSafeHref(item.githubUrl)} target="_blank" rel="noreferrer" className="portfolio-showcase__link-btn">
                            GitHub
                          </a>
                        ) : null}
                        {item.demoUrl ? (
                          <a
                            href={getSafeHref(item.demoUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="portfolio-showcase__link-btn portfolio-showcase__link-btn--primary"
                          >
                            {isFinnish ? 'Demo' : 'Live Demo'}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" icon="experience" title={copy.experience}>
          <div className="portfolio-showcase__timeline">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="portfolio-showcase__timeline-item" data-export-card="true">
                    <div className="portfolio-showcase__timeline-rail">
                      <span className="portfolio-showcase__timeline-marker" aria-hidden="true" />
                      <span className="portfolio-showcase__timeline-line" aria-hidden="true" />
                    </div>
                    <div className="portfolio-showcase__timeline-card">
                      <div className="portfolio-showcase__role-row">
                        <div className="min-w-0">
                          <p className="portfolio-showcase__role-title">{item.role || copy.untitledRole}</p>
                          {item.company || item.location ? (
                            <p className="portfolio-showcase__company">
                              {[item.company, item.location].filter(Boolean).join(' · ')}
                            </p>
                          ) : null}
                        </div>
                        <p className="portfolio-showcase__dates">{dateRange || copy.datesPending}</p>
                      </div>
                      {bullets.length > 0 ? (
                        <ul className="portfolio-showcase__bullets">
                          {bullets.map((line, lineIndex) => (
                            <li key={lineIndex}>{highlightMetrics(line)}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'caseStudies') {
      return (
        <Section key={key} id="caseStudies" placement="main" icon="caseStudies" title={copy.caseStudies}>
          <div className="portfolio-showcase__case-list">
            {snapshot.caseStudies.length > 0 ? (
              snapshot.caseStudies.map((item, index) => {
                const rows = [
                  [copy.problem, item.problem],
                  [copy.solution, item.solution],
                  [copy.technologies, item.technologies],
                  [copy.outcome, item.outcome],
                  [copy.lessons, item.lessons],
                ].filter(([, value]) => value)

                return (
                  <div key={`${item.title}-${index}`} className="portfolio-showcase__case-card" data-export-card="true">
                    {item.title ? <p className="portfolio-showcase__project-name">{item.title}</p> : null}
                    <div className="portfolio-showcase__case-rows">
                      {rows.map(([label, value]) => (
                        <p key={label} className="portfolio-showcase__case-row">
                          <span className="portfolio-showcase__case-label">{label}</span>
                          {value}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Tapaustutkimukset näkyvät tässä.' : 'Case studies will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'openSource') {
      return (
        <Section key={key} id="openSource" placement="main" icon="openSource" title={copy.openSource}>
          <div className="portfolio-showcase__project-grid">
            {snapshot.openSource.length > 0 ? (
              snapshot.openSource.map((item, index) => {
                const meta = [
                  item.language,
                  item.stars ? `★ ${item.stars}` : '',
                  item.forks ? `⑂ ${item.forks}` : '',
                ].filter(Boolean)

                return (
                  <div key={`${item.name}-${index}`} className="portfolio-showcase__project-card" data-export-card="true">
                    {item.name ? <p className="portfolio-showcase__project-name">{item.name}</p> : null}
                    {meta.length > 0 ? (
                      <p className="portfolio-showcase__project-meta">{meta.join('   ')}</p>
                    ) : null}
                    {item.description ? <p className="portfolio-showcase__project-desc">{item.description}</p> : null}
                    {item.url ? <p className="portfolio-showcase__project-link">{item.url}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish
                  ? 'Avoimen lähdekoodin projektit näkyvät tässä.'
                  : 'Open-source repositories will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement="main" icon="education" title={copy.education}>
          <div className="portfolio-showcase__edu-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="portfolio-showcase__edu-item" data-export-card="true">
                  <p className="portfolio-showcase__project-name">{item.degree}</p>
                  {item.school || item.location ? (
                    <p className="portfolio-showcase__project-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {formatDateRange(item.startDate, item.endDate) ? (
                    <p className="portfolio-showcase__project-meta">{formatDateRange(item.startDate, item.endDate)}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'testimonials') {
      if (snapshot.testimonials.length === 0) return null

      return (
        <Section key={key} id="testimonials" placement="main" icon="testimonials" title={copy.testimonials}>
          <div className="portfolio-showcase__testimonial-list">
            {snapshot.testimonials.map((item, index) => {
              const meta = [item.author, item.role].filter(Boolean).join(', ')

              return (
                <div key={`${item.author}-${index}`} className="portfolio-showcase__testimonial-card" data-export-card="true">
                  {item.quote ? <p className="portfolio-showcase__testimonial-quote">&ldquo;{item.quote}&rdquo;</p> : null}
                  {meta ? <p className="portfolio-showcase__testimonial-meta">{meta}</p> : null}
                </div>
              )
            })}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side" icon="skills" title={copy.skills}>
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="portfolio-showcase__skill-group">
                <p className="portfolio-showcase__skill-group-label">{cat.label}</p>
                <div className="portfolio-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span
                      key={skill}
                      data-export-skill="true"
                      className={`portfolio-showcase__badge portfolio-showcase__badge--${CATEGORY_COLOR[cat.key] || 'gray'}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="portfolio-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement="side" icon="certificates" title={copy.certificates}>
          <div className="portfolio-showcase__list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="portfolio-showcase__list-item">
                  {item.name ? <p className="portfolio-showcase__list-title">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="portfolio-showcase__list-meta">
                      {[item.issuer, item.year].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                  {item.credentialUrl ? (
                    <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="portfolio-showcase__list-link">
                      {copy.viewCredential}
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement="side" icon="links" title={copy.links}>
          <div className="portfolio-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="portfolio-showcase__link-card">
                  <span className="portfolio-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="portfolio-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="portfolio-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement="side" icon="languages" title={copy.languages}>
          <div className="portfolio-showcase__list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="portfolio-showcase__list-item portfolio-showcase__list-item--row">
                  <span>{item.language}</span>
                  {item.level ? <span className="portfolio-showcase__list-meta">{item.level}</span> : null}
                </div>
              ))
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement="side" icon="achievements" title={copy.achievements}>
          <div className="portfolio-showcase__list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <div key={`${item.title}-${index}`} className="portfolio-showcase__list-item">
                  <div className="portfolio-showcase__list-item-row">
                    {item.title ? <p className="portfolio-showcase__list-title">{item.title}</p> : null}
                    {item.year ? <p className="portfolio-showcase__list-meta">{item.year}</p> : null}
                  </div>
                  {item.description ? <p className="portfolio-showcase__list-desc">{item.description}</p> : null}
                </div>
              ))
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Saavutukset näkyvät tässä.' : 'Achievements will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'interests') {
      return (
        <Section key={key} id="interests" placement="side" icon="interests" title={copy.interests}>
          <div className="portfolio-showcase__interest-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`} className="portfolio-showcase__interest-chip">{item.name}</span>
              ))
            ) : (
              <p className="portfolio-showcase__empty">
                {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
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
      data-export-variant="portfolio"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // PortfolioShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="portfolio-showcase preview-document--designer"
      style={headingColor ? { '--cv-heading-color': headingColor } : undefined}
    >
      <header data-export-header="true" className="portfolio-showcase__header">
        <div className="min-w-0">
          <p className="portfolio-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="portfolio-showcase__name">{fullName}</h1>
          <p className="portfolio-showcase__role">{title}</p>
          {tagline ? <p className="portfolio-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="portfolio-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="portfolio-showcase__contact-item">
                  <span className="portfolio-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="portfolio-showcase__photo-wrap">
            <div className="portfolio-showcase__photo-ring">
              <img
                src={photo}
                alt={`${fullName} profile`}
                data-export-photo="true"
                className="portfolio-showcase__photo"
              />
            </div>
          </div>
        ) : null}
      </header>

      <div
        className="portfolio-showcase__body"
        data-export-content="true"
        style={!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        <main className="portfolio-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderMainSection(key))}
        </main>
        {showSidebar ? (
          <aside className="portfolio-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
