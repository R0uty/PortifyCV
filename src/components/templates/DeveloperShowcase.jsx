// Developer Showcase — the non-ATS "Developer Showcase" visual mode for the
// Developer template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'developer' && !atsFriendlyMode. Shares the
// exact same CvData shape as every other template — this file only differs
// in presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer.
//
// Restyled 2026-08-23 against docs/developer-showcase-cv.html: sidebar is
// now a full-bleed dark column (no gap/rounded-corner floating panel), and
// most sidebar list items (links, certificates, education, languages) and
// the top-level section wrapper lost their individual card box — only the
// portfolio-style item cards (Projects/Achievements/Open Source/
// Publications) keep a bordered/tinted card, matching the reference. See
// developer.css's own header comment and todo.md item 35 for the full diff.

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
  formatLinkDisplayValue,
  getSafeHref,
} from './shared'

// Category → tag color mapping (spec calls for colorful grouped skills rather
// than plain pills). Falls back to gray for anything unrecognized.
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
const CHIP_COLORS = ['blue', 'teal', 'purple', 'orange', 'green', 'pink']

// Gradient background for every section-icon badge. Previously a different
// color pair per section, cycling through the full --dev-* palette (blue,
// purple, pink, orange, green...) with no logic behind which section got
// which pair — read as random rather than deliberate. Now the same
// teal → blue → purple gradient the template already uses for the name
// text, the photo ring, and every section divider (developer.css), so the
// badges tie into that existing signature instead of introducing more hues.
const SECTION_ICON_GRADIENT = 'linear-gradient(135deg, var(--dev-teal), var(--dev-blue), var(--dev-purple))'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function SectionHeading({ icon, label, tone }) {
  return (
    <div>
      <h2
        className="dev-showcase__section-title"
        style={{ color: tone === 'sidebar' ? '#f1f5f9' : 'var(--dev-primary)' }}
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
      <div className="dev-showcase__section-divider" aria-hidden="true" />
    </div>
  )
}

function Section({ id, placement, children }) {
  const toneClass = placement === 'side' ? 'dev-showcase__section--sidebar' : 'dev-showcase__section--main'

  return (
    <section
      className={`dev-showcase__section ${toneClass}`}
      data-export-section={id}
      data-export-placement={placement}
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
  }

  const renderSidebarSection = (key) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side">
          <SectionHeading icon="skills" label={isFinnish ? 'Taidot' : 'Skills'} tone="sidebar" />
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="dev-showcase__skill-group">
                <p className="dev-showcase__skill-group-label">{cat.label}</p>
                <div className="dev-showcase__skill-tags">
                  {cat.items.map((skill) => (
                    <span
                      key={skill}
                      data-export-skill="true"
                      className={`dev-showcase__skill-tag dev-showcase__skill-tag--${CATEGORY_COLOR[cat.key] || 'gray'}`}
                    >
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
        <Section key={key} id="links" placement="side">
          <SectionHeading icon="links" label={isFinnish ? 'Linkit' : 'Links'} tone="sidebar" />
          {linkEntries.length > 0 ? (
            linkEntries.map(([linkKey, value]) => (
              <div key={linkKey} data-export-card="true" className="dev-showcase__link-card">
                <span className="dev-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                <div className="min-w-0">
                  <p className="dev-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                  <p className="dev-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
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
        <Section key={key} id="certificates" placement="side">
          <SectionHeading icon="certificates" label={isFinnish ? 'Sertifikaatit' : 'Certificates'} tone="sidebar" />
          {snapshot.certificates.length > 0 ? (
            snapshot.certificates.map((item, index) => (
              <div key={`${item.name}-${index}`} data-export-card="true" className="dev-showcase__cert-card">
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
        <Section key={key} id="education" placement="side">
          <SectionHeading icon="education" label={isFinnish ? 'Koulutus' : 'Education'} tone="sidebar" />
          {snapshot.education.length > 0 ? (
            snapshot.education.map((item, index) => (
              <div key={`${item.school}-${index}`} data-export-card="true" className="dev-showcase__edu-item">
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
        <Section key={key} id="languages" placement="side">
          <SectionHeading icon="languages" label={isFinnish ? 'Kielet' : 'Languages'} tone="sidebar" />
          {snapshot.languages.length > 0 ? (
            snapshot.languages.map((item, index) => (
              <div key={`${item.language}-${index}`} className="dev-showcase__lang-item">
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

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main">
          <SectionHeading icon="about" label={isFinnish ? 'Yhteenveto' : 'Summary'} />
          <p className="dev-showcase__summary">{about}</p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main">
          <SectionHeading icon="experience" label={isFinnish ? 'Kokemus' : 'Experience'} />
          <div className="dev-showcase__timeline">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div
                    key={`${item.role}-${item.company}-${index}`}
                    className="dev-showcase__timeline-item"
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
                          <p className="dev-showcase__role-title">{item.role || copy.untitledRole}</p>
                          {item.company || item.location ? (
                            <p className="dev-showcase__company">
                              {[item.company, item.location].filter(Boolean).join(' · ')}
                            </p>
                          ) : null}
                        </div>
                        <p className="dev-showcase__dates">{dateRange || copy.datesPending}</p>
                      </div>
                      {bullets.length > 0 ? (
                        <ul className="dev-showcase__bullets">
                          {bullets.map((line, lineIndex) => (
                            <li key={lineIndex}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                )
              })
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
        <Section key={key} id="projects" placement="main">
          <SectionHeading icon="projects" label={isFinnish ? 'Projektit' : 'Projects'} />
          <div className="dev-showcase__card-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const chips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="dev-showcase__project-card" data-export-card="true">
                    {item.name ? <p className="dev-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="dev-showcase__project-desc">{item.description}</p> : null}
                    {chips.length > 0 ? (
                      <div className="dev-showcase__chip-row">
                        {chips.map((chip, chipIndex) => (
                          <span
                            key={chip}
                            className={`dev-showcase__chip dev-showcase__chip--${CHIP_COLORS[chipIndex % CHIP_COLORS.length]}`}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.githubUrl || item.demoUrl ? (
                      <div className="dev-showcase__link-row">
                        {item.githubUrl ? (
                          <a href={getSafeHref(item.githubUrl)} target="_blank" rel="noreferrer" className="dev-showcase__link-btn">
                            GitHub
                          </a>
                        ) : null}
                        {item.demoUrl ? (
                          <a
                            href={getSafeHref(item.demoUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="dev-showcase__link-btn dev-showcase__link-btn--primary"
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
        <Section key={key} id="achievements" placement="main">
          <SectionHeading icon="achievements" label={isFinnish ? 'Saavutukset' : 'Achievements'} />
          <div className="dev-showcase__card-grid">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <div key={`${item.title}-${index}`} className="dev-showcase__achievement-card" data-export-card="true">
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
        <Section key={key} id="openSource" placement="main">
          <SectionHeading icon="openSource" label={isFinnish ? 'Avoin lähdekoodi' : 'Open Source'} />
          <div className="dev-showcase__card-grid">
            {snapshot.openSource.length > 0 ? (
              snapshot.openSource.map((item, index) => (
                <div key={`${item.name}-${index}`} className="dev-showcase__opensource-card" data-export-card="true">
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
        <Section key={key} id="publications" placement="main">
          <SectionHeading icon="publications" label={isFinnish ? 'Julkaisut' : 'Publications'} />
          <div className="dev-showcase__card-grid">
            {snapshot.publications.length > 0 ? (
              snapshot.publications.map((item, index) => (
                <div key={`${item.title}-${index}`} className="dev-showcase__publication-item" data-export-card="true">
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
      className={`dev-showcase preview-document--designer ${animationEnabled ? '' : 'dev-showcase--no-animation'}`}
    >
      {showDecorations ? (
        <div className="dev-showcase__bg" data-export-ignore="true" aria-hidden="true">
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
          <h1 className={`dev-showcase__name ${gradientEnabled ? '' : 'dev-showcase__name--solid'}`}>{fullName}</h1>
          <p className="dev-showcase__role">{title}</p>
          {personalContactItems.length > 0 ? (
            <div className="dev-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="dev-showcase__contact-item">
                  <span className="dev-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
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

      <div
        className="dev-showcase__body"
        data-export-content="true"
        style={!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        {showSidebar && sidebarSectionKeys.length > 0 ? (
          <aside className="dev-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
          </aside>
        ) : null}
        <main className="dev-showcase__main" data-export-primary="true">
          {!showSidebar ? sidebarSectionKeys.map((key) => renderSidebarSection(key)) : null}
          {mainSectionKeys.map((key) => renderMainSection(key))}
        </main>
      </div>
    </article>
  )
}
