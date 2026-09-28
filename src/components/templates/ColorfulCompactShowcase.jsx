// Colorful Compact Showcase — the non-ATS visual mode for the Colorful
// Compact template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'colorfulCompact' && !atsFriendlyMode.
// Shares the exact same CvData shape as every other template — this file
// only differs in presentation.
//
// Built against docs/Colorfull-compact.png (a hand-mocked reference
// screenshot, not markup like some other templates' docs/*.html references
// — colors/spacing below are eyeballed off that image). Dark full-bleed
// header (two-tone name, dot-marked contact line, gradient-ringed photo)
// framed top and bottom by a plain (non-repeating) rainbow gradient bar —
// see CreativeShowcase.jsx's STRIPE_SEGMENTS comment for why a *repeating*
// linear-gradient is unsafe for html2canvas; a single multi-stop
// linear-gradient bar like this one doesn't hit that bug (confirmed already
// in production by portfolio.css's header hairline).
//
// Colour is the one visual idea this template is built around, so it is the
// single template allowed more than one accent — but only under the design
// system's capped exception (§3): a fixed, named six-swatch palette, one hue
// assigned per *section*, in order. Never per skill chip, per project card
// or per bullet — everything decorative inside a section takes that
// section's one colour. There is no user-customizable accentColor prop.
// (Polished v1.2.12: the 7th/8th hues — yellow, charcoal — retired, and the
// per-item colour cycles collapsed to the section colour; compact type ramp
// adopted.)

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { formatDateRange, formatLinkDisplayValue } from './shared'

// The capped, named palette (design-system §3). Assigned by running section
// position (main sections first, then sidebar), wrapping after six. Order
// matches the spec's table: pink, orange, green, teal, blue, purple.
const SECTION_COLORS = ['pink', 'orange', 'green', 'teal', 'blue', 'purple']

// Fixed single colour for the dark header's contact dots — matches the
// two-tone name's accent half. Not a section, so not part of the cycle.
const HEADER_ACCENT = 'orange'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function colorAt(cycle, index) {
  return cycle[index % cycle.length]
}

function SectionHead({ title, color }) {
  return (
    <div className="colorful-compact-showcase__section-head">
      <span
        className={`colorful-compact-showcase__section-dot colorful-compact-showcase__section-dot--${color}`}
        aria-hidden="true"
      />
      <h2 className={`colorful-compact-showcase__section-title colorful-compact-showcase__section-title--${color}`}>
        {title}
      </h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, title, color, children }) {
  return (
    <section className="colorful-compact-showcase__section" data-export-section={id} data-export-placement={placement} data-moved-from={movedFrom ?? undefined}>
      <SectionHead title={title} color={color} />
      {children}
    </section>
  )
}

export default function ColorfulCompactShowcase({ formData, locale = 'en', previewRef, templateConfig }) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const spaceIndex = fullName.indexOf(' ')
  const nameFirst = spaceIndex === -1 ? fullName : fullName.slice(0, spaceIndex)
  const nameRest = spaceIndex === -1 ? '' : fullName.slice(spaceIndex + 1)
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
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

  const websiteUrl = snapshot.links.website
  const contactItems = [
    ['email', snapshot.email],
    ['location', snapshot.location],
    ['phone', snapshot.phone],
    ['website', websiteUrl],
  ].filter(([, value]) => value)

  const linkEntries = Object.entries(snapshot.links)

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
    about: isFinnish ? 'Tietoa minusta' : 'About',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    projects: isFinnish ? 'Projektit' : 'Projects',
    skills: isFinnish ? 'Taidot' : 'Skills',
    education: isFinnish ? 'Koulutus' : 'Education',
    languages: isFinnish ? 'Kielet' : 'Languages',
    links: isFinnish ? 'Linkit' : 'Links',
    achievements: isFinnish ? 'Lisätiedot' : 'Extras',
  }

  const renderMainSection = (key, color, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} title={copy.about} color={color}>
          <p className="colorful-compact-showcase__summary">{about}</p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} title={copy.experience} color={color}>
          <div className="colorful-compact-showcase__exp-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []
                const metaLine = [item.company, item.location].filter(Boolean).join(' · ')

                return (
                  <div
                    data-direct-edit-index={snapshot.sourceIndices.experience[index]}
                    key={`${item.role}-${item.company}-${index}`}
                    className="colorful-compact-showcase__exp-row"
                    data-export-card="true"
                  >
                    <div className="colorful-compact-showcase__exp-head">
                      <div className="min-w-0">
                        <p className="colorful-compact-showcase__exp-role">{item.role || copy.untitledRole}</p>
                        {metaLine ? <p className="colorful-compact-showcase__exp-meta">{metaLine}</p> : null}
                      </div>
                      <p className={`colorful-compact-showcase__exp-date colorful-compact-showcase__exp-date--${color}`}>
                        {dateRange || copy.datesPending}
                      </p>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="colorful-compact-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom} title={copy.projects} color={color}>
          <div className="colorful-compact-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="colorful-compact-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="colorful-compact-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="colorful-compact-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="colorful-compact-showcase__tag-row">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`colorful-compact-showcase__tag colorful-compact-showcase__tag--${color}`}
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
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, color, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} title={copy.skills} color={color}>
          {snapshot.skills.length > 0 ? (
            <div className="colorful-compact-showcase__skill-row">
              {snapshot.skills.map((skill) => (
                <span
                  key={skill}
                  data-export-skill="true"
                  className={`colorful-compact-showcase__skill-pill colorful-compact-showcase__skill-pill--${color}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="colorful-compact-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} title={copy.education} color={color}>
          <div className="colorful-compact-showcase__plain-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(' · ')
                const dateRange = formatDateRange(item.startDate, item.endDate)

                return (
                  <div key={`${item.school}-${index}`} className="colorful-compact-showcase__plain-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                    <p className="colorful-compact-showcase__plain-title">{item.degree || copy.untitledRole}</p>
                    {metaLine || dateRange ? (
                      <p className="colorful-compact-showcase__plain-meta">
                        {[metaLine, dateRange].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} title={copy.languages} color={color}>
          <div className="colorful-compact-showcase__lang-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="colorful-compact-showcase__lang-row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span className="colorful-compact-showcase__lang-name">{item.language}</span>
                  {item.level ? (
                    <span
                      className={`colorful-compact-showcase__lang-badge colorful-compact-showcase__lang-badge--${color}`}
                    >
                      {item.level}
                    </span>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom} title={copy.links} color={color}>
          <div className="colorful-compact-showcase__plain-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="colorful-compact-showcase__link-item" data-export-card="true" title={value}>
                  {formatLinkDisplayValue(value)}
                </p>
              ))
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement={placement} movedFrom={movedFrom} title={copy.achievements} color={color}>
          <div className="colorful-compact-showcase__plain-list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <p key={`${item.title}-${index}`} className="colorful-compact-showcase__extra-line" data-direct-edit-index={snapshot.sourceIndices.achievements[index]}>
                  {item.description ? `${item.title} — ${item.description}` : item.title}
                </p>
              ))
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Lisätiedot näkyvät tässä.' : 'Extras will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }


  // A section always renders through its HOME renderer — the column the
  // template designed it for — even when the user moved it to the other
  // column. Placement comes from where it actually is (the PDF exporter
  // paginates by it); movedFrom is the CSS hook that adapts it. The
  // per-section colour still comes from the running index in the column
  // the section actually sits in, so the rainbow stays in order.
  const homeSidebarSet = new Set(templateConfig.defaultSecondarySections ?? templateConfig.secondarySections)
  const renderSection = (key, color, placement) => {
    const homePlacement = homeSidebarSet.has(key) ? 'side' : 'main'
    const movedFrom = homePlacement === placement ? null : homePlacement

    return homePlacement === 'side'
      ? renderSidebarSection(key, color, placement, movedFrom)
      : renderMainSection(key, color, placement, movedFrom)
  }

  return (
    <article
      ref={previewRef}
      data-export-root="true"
      data-export-variant="colorfulCompact"
      className="colorful-compact-showcase preview-document--designer tpl-density-compact"
    >
      <div className="colorful-compact-showcase__rainbow colorful-compact-showcase__rainbow--top" aria-hidden="true" />

      <header className="colorful-compact-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="colorful-compact-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="colorful-compact-showcase__name">
            <span className="colorful-compact-showcase__name-lead">{nameFirst}</span>
            {nameRest ? <> <span className="colorful-compact-showcase__name-accent">{nameRest}</span></> : null}
          </h1>
          <p className="colorful-compact-showcase__role">
            {title}{tagline ? ` · ${tagline}` : ''}
          </p>
          {contactItems.length > 0 ? (
            <div className="colorful-compact-showcase__contact">
              {contactItems.map(([key, value]) => (
                <span key={key} className="colorful-compact-showcase__contact-item">
                  <span
                    className={`colorful-compact-showcase__contact-dot colorful-compact-showcase__contact-dot--${HEADER_ACCENT}`}
                    aria-hidden="true"
                  />
                  {key === 'website' ? formatLinkDisplayValue(value) : value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="colorful-compact-showcase__photo-ring">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="colorful-compact-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div className="colorful-compact-showcase__body" data-export-content="true">
        <main className="colorful-compact-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key, index) => renderSection(key, colorAt(SECTION_COLORS, index), 'main'))}
        </main>

        <aside className="colorful-compact-showcase__sidebar" data-export-secondary="true">
          {sidebarSectionKeys.map((key, index) =>
            renderSection(key, colorAt(SECTION_COLORS, mainSectionKeys.length + index), 'side'))}
        </aside>
      </div>

      <div className="colorful-compact-showcase__rainbow colorful-compact-showcase__rainbow--bottom" aria-hidden="true" />
    </article>
  )
}
