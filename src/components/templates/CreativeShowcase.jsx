// Creative Showcase — the non-ATS "Showcase" visual mode for the Creative
// template. Rendered by CVPreview.jsx instead of the shared generic renderer
// whenever variant === 'creative' && !atsFriendlyMode. Shares the exact same
// CvData shape as every other template — this file only differs in
// presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (creative.js).
//
// Restyled 2026-08-23 against docs/creative.png (a hand-mocked reference
// screenshot, not markup like the other templates' docs/*.html references —
// colors/spacing below are eyeballed off that image, not lifted from source).
// Full-width editorial header (name/role/tagline/contact + photo) instead of
// a full-height identity sidebar, a multi-color striped hairline under it,
// and a five-color accent system (coral / ink / teal / violet / gold) used
// for the two-tone name, alternating card left-borders, and pill fills —
// replacing the old single-accent design entirely. Section headers lost
// their icon badge (the reference has none) and their title+subtitle now
// sit inline on one baseline rather than stacked. Only individual entries
// (experience/project cards) get a bordered card treatment; section
// containers themselves (About, Toolkit, School, ...) sit directly on the
// page/sidebar background with no card of their own — a Portfolio-Hybrid-
// style change from the old "every section is a white card" rule.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { parseSkillCategories, formatDateRange, formatLinkDisplayValue } from './shared'

// Cycled by index for experience-card left borders (five-tint variety).
const CARD_ACCENTS = ['coral', 'teal', 'violet', 'gold']

// Cycled by index for solid-fill pills (Toolkit, coreStrengths badges) —
// exactly the three-color rotation the reference mockup uses for its
// Toolkit pills (coral / ink / gold), not the five-tint card-border set.
const PILL_CYCLE = ['coral', 'ink', 'gold']

// Cycled by index for project tag chips — a softer/lighter five-tint set
// than CARD_ACCENTS, matching the reference's pastel project tags versus
// its solid-fill toolkit pills.
const TAG_CYCLE = ['peach', 'mint', 'gold', 'lavender', 'pink']

// The header's striped hairline is built from real elements, not a CSS
// `repeating-linear-gradient` — html2canvas (the PDF export renderer)
// silently drops that gradient function entirely (transparent, not even a
// solid fallback), confirmed against a real exported PDF: the stripe shows
// correctly in the live preview but is simply missing from the page. 40
// segments comfortably tiles the widest card width the app renders at.
const STRIPE_COLORS = ['coral', 'teal', 'gold', 'violet']
const STRIPE_SEGMENTS = Array.from({ length: 40 }, (_, index) => STRIPE_COLORS[index % STRIPE_COLORS.length])

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function SectionHead({ title, subtitle }) {
  return (
    <div className="creative-showcase__section-head">
      <h2 className="creative-showcase__section-title">{title}</h2>
      {subtitle ? <p className="creative-showcase__section-subtitle">{subtitle}</p> : null}
    </div>
  )
}

function Section({ id, placement, title, subtitle, children }) {
  return (
    <section className="creative-showcase__section" data-export-section={id} data-export-placement={placement}>
      <SectionHead title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

export default function CreativeShowcase({ formData, locale = 'en', previewRef, templateConfig, headingColor = null }) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const [nameLead, ...nameRestParts] = fullName.split(' ')
  const nameAccent = nameRestParts.join(' ')
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
  // Flattened, not grouped by category — the reference's "Toolkit" is one
  // flat pill row with no category labels above it.
  const flatSkills = useMemo(
    () => parseSkillCategories(snapshot.skills, isFinnish).flatMap((cat) => cat.items),
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
    about: { title: isFinnish ? 'Hei' : 'Hello', subtitle: isFinnish ? 'vähän minusta' : 'a little about me' },
    experience: { title: isFinnish ? 'Työ' : 'Work', subtitle: isFinnish ? 'valitut roolit' : 'selected roles' },
    projects: { title: isFinnish ? 'Projektit' : 'Projects', subtitle: isFinnish ? 'esittelyssä' : 'featured' },
    education: { title: isFinnish ? 'Koulutus' : 'School', subtitle: '' },
    skills: { title: isFinnish ? 'Työkalut' : 'Toolkit', subtitle: '' },
    certificates: { title: isFinnish ? 'Sertifikaatit' : 'Certificates', subtitle: '' },
    links: { title: isFinnish ? 'Löydä minut' : 'Find me', subtitle: '' },
    languages: { title: isFinnish ? 'Kielet' : 'Languages', subtitle: '' },
    interests: { title: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests', subtitle: '' },
  }

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" title={copy.about.title} subtitle={copy.about.subtitle}>
          <p className="creative-showcase__intro">{about}</p>
          {snapshot.coreStrengths.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {snapshot.coreStrengths.slice(0, 3).map((item, index) => (
                item.title ? (
                  <span
                    key={`${item.title}-${index}`}
                    className={`creative-showcase__pill creative-showcase__pill--${PILL_CYCLE[index % PILL_CYCLE.length]}`}
                  >
                    {item.title}
                  </span>
                ) : null
              ))}
            </div>
          ) : null}
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement="main" title={copy.experience.title} subtitle={copy.experience.subtitle}>
          <div className="creative-showcase__exp-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]

                return (
                  <div
                    key={`${item.role}-${item.company}-${index}`}
                    className={`creative-showcase__exp-card creative-showcase__exp-card--${accent}`}
                    data-export-card="true"
                  >
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
        <Section key={key} id="projects" placement="main" title={copy.projects.title} subtitle={copy.projects.subtitle}>
          <div className="creative-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="creative-showcase__project-card" data-export-card="true">
                    {item.name ? <p className="creative-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="creative-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="creative-showcase__tag-row">
                        {tags.map((tag, tagIndex) => (
                          <span
                            key={tag}
                            className={`creative-showcase__tag creative-showcase__tag--${TAG_CYCLE[tagIndex % TAG_CYCLE.length]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
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
        <Section key={key} id="skills" placement="side" title={copy.skills.title}>
          {flatSkills.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {flatSkills.map((skill, index) => (
                <span
                  key={skill}
                  data-export-skill="true"
                  className={`creative-showcase__pill creative-showcase__pill--${PILL_CYCLE[index % PILL_CYCLE.length]}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="creative-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement="side" title={copy.education.title}>
          <div className="creative-showcase__plain-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="creative-showcase__plain-item" data-export-card="true">
                  <p className="creative-showcase__plain-title">{item.degree}</p>
                  {item.school || item.location ? (
                    <p className="creative-showcase__plain-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                      {formatDateRange(item.startDate, item.endDate) ? ` · ${formatDateRange(item.startDate, item.endDate)}` : ''}
                    </p>
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

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement="side" title={copy.certificates.title}>
          <div className="creative-showcase__plain-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="creative-showcase__plain-item" data-export-card="true">
                  {item.name ? <p className="creative-showcase__plain-title">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="creative-showcase__plain-meta">
                      {[item.issuer, item.year].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
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

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement="side" title={copy.links.title}>
          <div className="creative-showcase__arrow-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="creative-showcase__arrow-item" data-export-card="true" title={value}>
                  <span className="creative-showcase__arrow" aria-hidden="true">&rarr;</span>
                  {formatLinkDisplayValue(value)}
                </p>
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

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement="side" title={copy.languages.title}>
          <div className="creative-showcase__plain-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <p key={`${item.language}-${index}`} className="creative-showcase__lang-row">
                  {item.language}
                  {item.level ? <span className="creative-showcase__lang-level"> {item.level}</span> : null}
                </p>
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
        <Section key={key} id="interests" placement="side" title={copy.interests.title}>
          <div className="creative-showcase__pill-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span
                  key={`${item.name}-${index}`}
                  className={`creative-showcase__tag creative-showcase__tag--${TAG_CYCLE[index % TAG_CYCLE.length]}`}
                >
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
      className="creative-showcase preview-document--designer"
      style={headingColor ? { '--cv-heading-color': headingColor } : undefined}
    >
      <div className="creative-showcase__bg" data-export-ignore="true" aria-hidden="true">
        <span className="creative-showcase__blob creative-showcase__blob--top" />
        <span className="creative-showcase__blob creative-showcase__blob--bottom" />
      </div>

      <header className="creative-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="creative-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="creative-showcase__name">
            <span className="creative-showcase__name-lead">{nameLead}</span>
            {nameAccent ? <> <span className="creative-showcase__name-accent">{nameAccent}</span></> : null}
          </h1>
          <p className="creative-showcase__role">{title}</p>
          {tagline ? <p className="creative-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="creative-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="creative-showcase__contact-item">{value}</span>
              ))}
            </div>
          ) : null}
        </div>

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
      </header>

      {/* Not data-export-ignore — unlike the pure-decoration blobs above,
          this striped bar is a real brand element the exported PDF should
          keep, the same way Modern/Portfolio Hybrid's top gradient hairline
          survives into their exports. Built from real segment elements —
          see STRIPE_SEGMENTS above for why. */}
      <div className="creative-showcase__stripe" aria-hidden="true">
        {STRIPE_SEGMENTS.map((color, index) => (
          <span key={index} className={`creative-showcase__stripe-seg creative-showcase__stripe-seg--${color}`} />
        ))}
      </div>

      <div className="creative-showcase__body" data-export-content="true">
        <main className="creative-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderMainSection(key))}
        </main>

        <aside className="creative-showcase__sidebar" data-export-secondary="true">
          {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
        </aside>
      </div>
    </article>
  )
}
