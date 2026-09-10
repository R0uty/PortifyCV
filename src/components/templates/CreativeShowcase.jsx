// Creative Showcase — the non-ATS "Showcase" visual mode for the Creative
// template. Rendered by CVPreview.jsx instead of the shared generic renderer
// whenever variant === 'creative' && !atsFriendlyMode. Shares the exact same
// CvData shape as every other template — this file only differs in
// presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (creative.js).
//
// Reworked 2026-09-10 to the house design system (docs/template-design-system.md):
//   - Section headings moved onto the §4 `numbered` treatment (a two-digit
//     ordinal in the accent, running once through the whole document, main
//     column then sidebar) — replacing the previous off-menu bold
//     sentence-case title + italic subtitle, which scored 0 on structural
//     clarity.
//   - Colour collapsed to §3: one ink (+ two muted steps), one accent read
//     from `--tpl-accent` (with a JS-computed soft fill in `--tpl-accent-soft`),
//     and the cream page / tan sidebar as the single neutral tint. The old
//     five-colour accent system (coral / teal / violet / gold + five pastel
//     tag tints + a four-colour stripe + alternating card borders) is gone.
//   - Type sizes read the shared `--tpl-*` ramp via the `tpl-density-roomy`
//     class on the root; the name is no longer two-tone.
//   - Accent is user-customizable via the Settings swatch (`accentColor`
//     prop, warmCoral swatch set — see cvTemplates.js / templateAccents.js).
// Structure (right-rail + main), the decorative export-ignored blobs, the
// bordered entry cards and the section order are unchanged.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { parseSkillCategories, formatDateRange, formatLinkDisplayValue } from './shared'
import { accentSoftFill } from '../../utils/templateAccents'
import { CREATIVE_DEFAULT_ACCENT_COLOR } from './creative'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function SectionHead({ number, title }) {
  return (
    <div className="creative-showcase__section-head">
      <span className="creative-showcase__section-num" aria-hidden="true">
        {String(number).padStart(2, '0')}
      </span>
      <h2 className="creative-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, number, title, children }) {
  return (
    <section className="creative-showcase__section" data-export-section={id} data-export-placement={placement}>
      <SectionHead number={number} title={title} />
      {children}
    </section>
  )
}

export default function CreativeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = CREATIVE_DEFAULT_ACCENT_COLOR,
}) {
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
  // Flattened, not grouped by category — the "Toolkit" pill row has no
  // category labels above it.
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

  // One running ordinal for the `numbered` heading treatment — main column
  // first, then sidebar, so it reads as a single editorial index of the
  // whole document rather than restarting per column.
  const numberedKeys = [...mainSectionKeys, ...sidebarSectionKeys]
  const sectionNumber = (key) => numberedKeys.indexOf(key) + 1

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    about: isFinnish ? 'Hei' : 'Hello',
    experience: isFinnish ? 'Työ' : 'Work',
    projects: isFinnish ? 'Projektit' : 'Projects',
    education: isFinnish ? 'Koulutus' : 'School',
    skills: isFinnish ? 'Työkalut' : 'Toolkit',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    links: isFinnish ? 'Löydä minut' : 'Find me',
    languages: isFinnish ? 'Kielet' : 'Languages',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }

  const renderMainSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement="main" number={sectionNumber(key)} title={copy.about}>
          <p className="creative-showcase__intro">{about}</p>
          {snapshot.coreStrengths.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {snapshot.coreStrengths.slice(0, 3).map((item, index) => (
                item.title ? (
                  <span key={`${item.title}-${index}`} className="creative-showcase__pill">
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
        <Section key={key} id="experience" placement="main" number={sectionNumber(key)} title={copy.experience}>
          <div className="creative-showcase__exp-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div
                    key={`${item.role}-${item.company}-${index}`}
                    className="creative-showcase__exp-card"
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
        <Section key={key} id="projects" placement="main" number={sectionNumber(key)} title={copy.projects}>
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
                        {tags.map((tag) => (
                          <span key={tag} className="creative-showcase__tag">{tag}</span>
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
        <Section key={key} id="skills" placement="side" number={sectionNumber(key)} title={copy.skills}>
          {flatSkills.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {flatSkills.map((skill) => (
                <span key={skill} data-export-skill="true" className="creative-showcase__pill">
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
        <Section key={key} id="education" placement="side" number={sectionNumber(key)} title={copy.education}>
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
        <Section key={key} id="certificates" placement="side" number={sectionNumber(key)} title={copy.certificates}>
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
        <Section key={key} id="links" placement="side" number={sectionNumber(key)} title={copy.links}>
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
        <Section key={key} id="languages" placement="side" number={sectionNumber(key)} title={copy.languages}>
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
        <Section key={key} id="interests" placement="side" number={sectionNumber(key)} title={copy.interests}>
          <div className="creative-showcase__pill-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`} className="creative-showcase__tag">
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
      className="creative-showcase preview-document--designer tpl-density-roomy"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, CREATIVE_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
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
          <h1 className="creative-showcase__name">{fullName}</h1>
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

      {/* Single accent rule under the header — a real brand element the
          exported PDF keeps (a solid background colour rasterizes fine,
          unlike the repeating-linear-gradient an earlier version used). */}
      <div className="creative-showcase__stripe" aria-hidden="true" />

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
