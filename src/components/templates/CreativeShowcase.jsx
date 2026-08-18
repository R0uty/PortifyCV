// Creative Showcase — the non-ATS "Showcase" visual mode for the Creative
// template. Rendered by CVPreview.jsx instead of the shared generic renderer
// whenever variant === 'creative' && !atsFriendlyMode. Shares the exact same
// CvData shape as every other template — this file only differs in
// presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (creative.js).
//
// Single-accent-color design: every color used here besides neutral text/
// borders comes from the one `--cs-accent` variable (see index.css). No
// section has its own distinct background — every section (main or sidebar)
// shares the same white card treatment, a lesson carried over from the
// Developer template's iteration.
//
// Layout: the identity block (photo, name, title, tagline, contact) runs
// full-height down the right rail together with the secondary sections
// (skills, certificates, languages, interests) — same "identity lives in
// the sidebar" structure as Navy Professional / Executive, just mirrored to
// the right instead of the left. Primary sections (about, experience,
// projects, education, links) fill the main column on the left — links
// specifically ordered right after education per explicit request.

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
} from './shared'

// Rotating tints of the single accent color for project accent-strips —
// variety without introducing a second hue (spec: "never more than one
// accent colour throughout the design").
const PROJECT_STRIP_TINTS = ['#7c3aed', '#9333ea', '#a855f7', '#8b5cf6']

// Small outline icon for interest chips — a single shared glyph rather than
// per-interest icon matching (keeps the icon set small and consistent).
const InterestGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.2 5.6L20 10l-4.4 3.8L17 20l-5-3.2L7 20l1.4-6.2L4 10l5.8-1.4L12 3z" />
  </svg>
)

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function SectionHead({ icon, title, subtitle }) {
  return (
    <div className="creative-showcase__section-head">
      <span className="creative-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <div>
        <p className="creative-showcase__section-title">{title}</p>
        <p className="creative-showcase__section-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

function Section({ id, placement, icon, title, subtitle, children }) {
  return (
    <section className="creative-showcase__section" data-export-section={id} data-export-placement={placement}>
      <SectionHead icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

export default function CreativeShowcase({ formData, locale = 'en', previewRef, templateConfig }) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Creative Problem Solver')
  const tagline = snapshot.tagline
  const photo = snapshot.photo
  const showPhoto = Boolean(photo) && isPhotoVisibleForTemplate(
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
    location: isFinnish ? 'Sijainti' : 'Location',
    about: {
      title: isFinnish ? 'Minusta' : 'About Me',
      subtitle: isFinnish ? 'Vähän minusta' : 'A little about me',
    },
    experience: {
      title: isFinnish ? 'Kokemus' : 'Experience',
      subtitle: isFinnish ? 'Ammatillinen matkani' : 'My professional journey',
    },
    projects: {
      title: isFinnish ? 'Projektit' : 'Projects',
      subtitle: isFinnish ? 'Valikoituja töitä' : 'Selected work',
    },
    education: {
      title: isFinnish ? 'Koulutus' : 'Education',
      subtitle: isFinnish ? 'Oppimispolkuni' : 'Learning journey',
    },
    skills: {
      title: isFinnish ? 'Taidot' : 'Skills',
      subtitle: isFinnish ? 'Ydinosaaminen' : 'Core expertise',
    },
    certificates: {
      title: isFinnish ? 'Sertifikaatit' : 'Certificates',
      subtitle: isFinnish ? 'Todistukset ja koulutus' : 'Credentials & training',
    },
    links: {
      title: isFinnish ? 'Linkit' : 'Links',
      subtitle: isFinnish ? 'Löydä minut verkosta' : 'Find me online',
    },
    languages: {
      title: isFinnish ? 'Kielet' : 'Languages',
      subtitle: isFinnish ? 'Puhumani kielet' : 'Languages I speak',
    },
    interests: {
      title: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
      subtitle: isFinnish ? 'Vapaa-ajallani' : 'Beyond work',
    },
  }

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" icon="about" title={copy.about.title} subtitle={copy.about.subtitle}>
          <p className="creative-showcase__intro">{about}</p>
          {snapshot.coreStrengths.length > 0 ? (
            <div className="creative-showcase__badge-row">
              {snapshot.coreStrengths.slice(0, 3).map((item, index) => (
                item.title ? <span key={`${item.title}-${index}`} className="creative-showcase__badge">{item.title}</span> : null
              ))}
            </div>
          ) : null}
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" icon="experience" title={copy.experience.title} subtitle={copy.experience.subtitle}>
          <div className="creative-showcase__exp-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="creative-showcase__exp-card" data-export-card="true">
                    <div className="creative-showcase__exp-row">
                      <div className="min-w-0">
                        <p className="creative-showcase__exp-role">{item.role || copy.untitledRole}</p>
                        {item.company || item.location ? (
                          <p className="creative-showcase__exp-company">
                            {[item.company, item.location].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="creative-showcase__exp-dates">{dateRange || copy.datesPending}</p>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="creative-showcase__exp-desc">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement="main" icon="projects" title={copy.projects.title} subtitle={copy.projects.subtitle}>
          <div className="creative-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="creative-showcase__project-card"
                  style={{ '--cs-strip': PROJECT_STRIP_TINTS[index % PROJECT_STRIP_TINTS.length] }}
                  data-export-card="true"
                >
                  {item.name ? <p className="creative-showcase__project-name">{item.name}</p> : null}
                  {item.description ? <p className="creative-showcase__project-desc">{item.description}</p> : null}
                  {item.stack ? <p className="creative-showcase__project-meta">{item.stack}</p> : null}
                  {item.demoUrl || item.githubUrl ? (
                    <p className="creative-showcase__project-outcome">{item.demoUrl || item.githubUrl}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement="main" icon="education" title={copy.education.title} subtitle={copy.education.subtitle}>
          <div className="creative-showcase__edu-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="creative-showcase__edu-item" data-export-card="true">
                  <span className="creative-showcase__edu-marker" aria-hidden="true" />
                  <span className="creative-showcase__edu-line" aria-hidden="true" />
                  <p className="creative-showcase__edu-degree">{item.degree}</p>
                  {item.school || item.location ? (
                    <p className="creative-showcase__edu-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  {formatDateRange(item.startDate, item.endDate) ? (
                    <p className="creative-showcase__edu-meta">{formatDateRange(item.startDate, item.endDate)}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement="main" icon="links" title={copy.links.title} subtitle={copy.links.subtitle}>
          <div className="creative-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} className="creative-showcase__link-card" data-export-card="true">
                  <span className="creative-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="creative-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="creative-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement="side" icon="skills" title={copy.skills.title} subtitle={copy.skills.subtitle}>
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="creative-showcase__skill-group">
                <p className="creative-showcase__skill-group-label">{cat.label}</p>
                <div className="creative-showcase__skill-chips">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="creative-showcase__chip">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="creative-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement="side" icon="certificates" title={copy.certificates.title} subtitle={copy.certificates.subtitle}>
          <div className="creative-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="creative-showcase__cert-card" data-export-card="true">
                  <span className="creative-showcase__cert-icon" aria-hidden="true">{sectionIcons.certificates}</span>
                  <div className="min-w-0">
                    {item.name ? <p className="creative-showcase__cert-name">{item.name}</p> : null}
                    {item.issuer || item.year ? (
                      <p className="creative-showcase__cert-meta">
                        {[item.issuer, item.year].filter(Boolean).join(', ')}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement="side" icon="languages" title={copy.languages.title} subtitle={copy.languages.subtitle}>
          <div className="creative-showcase__lang-chip-row">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <span key={`${item.language}-${index}`} className="creative-showcase__chip">
                  {item.language}{item.level ? ` — ${item.level}` : ''}
                </span>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'interests') {
      return (
        <Section key={key} id="interests" placement="side" icon="interests" title={copy.interests.title} subtitle={copy.interests.subtitle}>
          <div className="creative-showcase__interest-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`} className="creative-showcase__interest-chip">
                  <InterestGlyph />
                  {item.name}
                </span>
              ))
            ) : (
              <p className="creative-showcase__empty">
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
      data-export-variant="creative"
      data-export-content="true"
      className="creative-showcase preview-document--designer"
    >
      <main className="creative-showcase__main" data-export-primary="true">
        {mainSectionKeys.map((key) => renderMainSection(key))}
      </main>

      <aside className="creative-showcase__sidebar" data-export-secondary="true">
        <div className="creative-showcase__bg" data-export-ignore="true" aria-hidden="true">
          <span className="creative-showcase__blob creative-showcase__blob--one" />
          <span className="creative-showcase__blob creative-showcase__blob--two" />
          <span className="creative-showcase__dots" />
        </div>

        <div className="creative-showcase__identity" data-export-header="true">
          {showPhoto ? (
            <div className="creative-showcase__photo-wrap">
              <img
                src={photo}
                alt={`${fullName} profile`}
                data-export-photo="true"
                className="creative-showcase__photo"
              />
            </div>
          ) : null}

          <p className="creative-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="creative-showcase__name">{fullName}</h1>
          <p className="creative-showcase__role">{title}</p>
          {tagline ? <p className="creative-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="creative-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="creative-showcase__contact-item">
                  <span className="creative-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="creative-showcase__sidebar-divider" aria-hidden="true" />

        {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
      </aside>
    </article>
  )
}
