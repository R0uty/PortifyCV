// Portfolio Showcase — the non-ATS "portfolio website condensed into a
// résumé" visual mode for the Portfolio Hybrid template. Rendered by
// CVPreview.jsx instead of the shared generic renderer whenever
// variant === 'portfolio' && !atsFriendlyMode. Shares the exact same CvData
// shape as every other template — this file only differs in presentation.
// ATS mode (the app's existing global toggle) bypasses this component
// entirely and falls back to the shared flat renderer (portfolio.js).
//
// Featured Projects is the hero section — premium cards with tech chips and
// GitHub/Live Demo links, mirroring the visual weight a real portfolio site
// would give its project showcase. The sidebar's "Skills" section is
// branded as "Tech Stack" since the spec's own CONFIG SUPPORT list only has
// a showTechStack flag, not a separate showSkills one — confirming these are
// the same underlying data.
//
// Restyled 2026-08-23 against docs/portfolio-hybrid-cv.html: serif display
// name (Instrument Serif, self-hosted here via @fontsource rather than
// main.jsx's global Inter import, so its ~9KB weight is only ever fetched
// by users who actually land on this one template's lazy chunk — see
// CVPreview.jsx's React.lazy() split).
//
// Polished v1.2.11 to the design-system bar: the roomy `--tpl-*` type ramp
// (tpl-density-roomy), and §3's one-ink-one-accent rule — the earlier
// seven-hue palette (emerald/teal/sky/violet/pink/orange/green gradients on
// the hairline, section-icon badges, chips, badges and the "Live Demo"
// button) collapses to a single emerald accent read from `--tpl-accent`,
// user-customizable via the Settings swatch (`forestGreen` set).
//
// Moved from `tpl-density-roomy` to `tpl-density-compact` in 1.4.9 (G8,
// docs/template-audit-phase2.md): all three example CVs ran past the
// 2.0-page cap under `roomy`'s card chrome + badge rows, and a single
// density step plus a token-sized vertical-rhythm trim wasn't enough once
// 8a's achievements/technologies lines landed — see the design-system doc's
// own "fit one page" note on `compact` being exactly the class this kind of
// fix switches into.

import { useMemo } from 'react'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { accentSoftFill } from '../../utils/templateAccents'
import { PORTFOLIO_DEFAULT_ACCENT_COLOR } from './portfolio'
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
import { getExperienceBullets, getExperienceAchievements, getExperienceTechnologies } from './directEditExperienceEntry'

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

// Portfolio Hybrid's own Experience-entry renderer: a timeline rail beside
// a card, the same shape as Modern Professional's (not
// directEditExperienceEntry.jsx's two-row one). Only role and company are
// editable inline; location stays read-only-appended text. `index` is
// formData-relative in the directEditDispatch branch (EditableList's own
// index); the read-only call site passes the snapshot's `sourceIndex`.
//
// The rail's connector line is hidden on the last entry through an
// `--last` modifier class, never :last-child — EditableList wraps each
// entry in its own .direct-edit-entry div, making every item a last child.
function renderExperienceEntry(item, index, { directEditDispatch, copy, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = getExperienceBullets(item)
  const achievements = getExperienceAchievements(item)
  const technologies = getExperienceTechnologies(item)

  return (
    <div
      key={`${item.role}-${item.company}-${index}`}
      className={`portfolio-showcase__timeline-item${isLast ? ' portfolio-showcase__timeline-item--last' : ''}`}
      data-export-card="true"
      data-direct-edit-index={sourceIndex}
    >
      <div className="portfolio-showcase__timeline-rail">
        <span className="portfolio-showcase__timeline-marker" aria-hidden="true" />
        <span className="portfolio-showcase__timeline-line" aria-hidden="true" />
      </div>
      <div className="portfolio-showcase__timeline-card">
        <div className="portfolio-showcase__role-row">
          <div className="min-w-0">
            <p className="portfolio-showcase__role-title">
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
              <p className="portfolio-showcase__company">
                <EditableField
                  as="span"
                  path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                  value={item.company}
                  placeholder={copy.company}
                />
                {item.location ? ` · ${item.location}` : null}
              </p>
            ) : item.company || item.location ? (
              <p className="portfolio-showcase__company">
                {[item.company, item.location].filter(Boolean).join(' · ')}
              </p>
            ) : null}
          </div>
          <p className="portfolio-showcase__dates">{dateRange || copy.datesPending}</p>
        </div>
        {directEditDispatch ? (
          <>
            <p className="portfolio-showcase__bullets portfolio-showcase__bullets--editing">
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
                value={item.description}
                placeholder={copy.descriptionPlaceholder}
                multiline
              />
            </p>
            {achievements.length > 0 ? (
              <ul className="portfolio-showcase__bullets">
                {achievements.map((line, lineIndex) => (
                  <li key={lineIndex}>{highlightMetrics(line)}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : bullets.length > 0 ? (
          <ul className="portfolio-showcase__bullets">
            {bullets.map((line, lineIndex) => (
              <li key={lineIndex}>{highlightMetrics(line)}</li>
            ))}
          </ul>
        ) : null}
        {technologies.length > 0 ? (
          <p className="portfolio-showcase__company">{technologies.join(' · ')}</p>
        ) : null}
      </div>
    </div>
  )
}

// One accent-filled icon badge per section (§4 icon-badge treatment), the
// same single-accent mark every other bespoke Showcase uses — the earlier
// per-section two-colour gradient badges were the template's §3 colour
// finding.
function SectionHead({ icon, title, subtitle }) {
  return (
    <div className="portfolio-showcase__section-head">
      <span className="portfolio-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <div>
        <h2 className="portfolio-showcase__section-title">{title}</h2>
        {subtitle ? <p className="portfolio-showcase__section-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, icon, title, subtitle, children }) {
  return (
    <section className="portfolio-showcase__section" data-export-section={id} data-export-placement={placement} data-moved-from={movedFrom ?? undefined}>
      <SectionHead icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

export default function PortfolioShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = PORTFOLIO_DEFAULT_ACCENT_COLOR,
  headingColor = null,
  directEditDispatch = null,
}) {
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

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
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

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} icon="about" title={copy.about} subtitle={copy.aboutSub}>
          <p className="portfolio-showcase__summary">
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

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom} icon="projects" title={copy.projects} subtitle={copy.projectsSub}>
          <div className="portfolio-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const chips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="portfolio-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="portfolio-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="portfolio-showcase__project-desc">{item.description}</p> : null}
                    {item.impact ? (
                      <p className="portfolio-showcase__project-impact">{highlightMetrics(item.impact)}</p>
                    ) : null}
                    {chips.length > 0 ? (
                      <div className="portfolio-showcase__chip-row">
                        {chips.map((chip) => (
                          <span key={chip} className="portfolio-showcase__chip">
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
                            className="portfolio-showcase__link-btn"
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
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} icon="experience" title={copy.experience}>
          <div className="portfolio-showcase__timeline">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) =>
                renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isLast: index === snapshot.experience.length - 1,
                  sourceIndex: snapshot.sourceIndices.experience[index],
                }),
              )
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
        <Section key={key} id="caseStudies" placement={placement} movedFrom={movedFrom} icon="caseStudies" title={copy.caseStudies}>
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
                  <div key={`${item.title}-${index}`} className="portfolio-showcase__case-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.caseStudies[index]}>
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
        <Section key={key} id="openSource" placement={placement} movedFrom={movedFrom} icon="openSource" title={copy.openSource}>
          <div className="portfolio-showcase__project-grid">
            {snapshot.openSource.length > 0 ? (
              snapshot.openSource.map((item, index) => {
                const meta = [
                  item.language,
                  item.stars ? `★ ${item.stars}` : '',
                  item.forks ? `⑂ ${item.forks}` : '',
                ].filter(Boolean)

                return (
                  <div key={`${item.name}-${index}`} className="portfolio-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.openSource[index]}>
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
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} icon="education" title={copy.education}>
          <div className="portfolio-showcase__edu-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="portfolio-showcase__edu-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
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
        <Section key={key} id="testimonials" placement={placement} movedFrom={movedFrom} icon="testimonials" title={copy.testimonials}>
          <div className="portfolio-showcase__testimonial-list">
            {snapshot.testimonials.map((item, index) => {
              const meta = [item.author, item.role].filter(Boolean).join(', ')

              return (
                <div key={`${item.author}-${index}`} className="portfolio-showcase__testimonial-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.testimonials[index]}>
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

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} icon="skills" title={copy.skills}>
          {directEditDispatch ? (
            // Chips replace the read-only badges outright (never both, or
            // every skill renders twice).
            <div className="portfolio-showcase__skill-group">
              <EditableCategorizedChip
                categories={editableSkillCategories}
                addLabel={isFinnish ? '+ Lisää' : '+ Add'}
              />
            </div>
          ) : skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="portfolio-showcase__skill-group">
                <p className="portfolio-showcase__skill-group-label">{cat.label}</p>
                <div className="portfolio-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span
                      key={skill}
                      data-export-skill="true"
                      className="portfolio-showcase__badge tpl-chip-wrappable"
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
        <Section key={key} id="certificates" placement={placement} movedFrom={movedFrom} icon="certificates" title={copy.certificates}>
          <div className="portfolio-showcase__list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="portfolio-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
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
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom} icon="links" title={copy.links}>
          <div className="portfolio-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="portfolio-showcase__link-card">
                  <span className="portfolio-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="portfolio-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="portfolio-showcase__link-value tpl-value-breakable" title={value}>{formatLinkDisplayValue(value)}</p>
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
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} icon="languages" title={copy.languages}>
          <div className="portfolio-showcase__list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="portfolio-showcase__list-item portfolio-showcase__list-item--row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
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
        <Section key={key} id="achievements" placement={placement} movedFrom={movedFrom} icon="achievements" title={copy.achievements}>
          <div className="portfolio-showcase__list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <div key={`${item.title}-${index}`} className="portfolio-showcase__list-item" data-direct-edit-index={snapshot.sourceIndices.achievements[index]}>
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
        <Section key={key} id="interests" placement={placement} movedFrom={movedFrom} icon="interests" title={copy.interests}>
          <div className="portfolio-showcase__interest-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span data-direct-edit-index={snapshot.sourceIndices.interests[index]} key={`${item.name}-${index}`} className="portfolio-showcase__interest-chip tpl-chip-wrappable">{item.name}</span>
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


  // Each section renders through its home renderer in whichever column the
  // user put it — see createSectionRouter in ./shared.
  const renderSection = createSectionRouter(templateConfig, renderMainSection, renderSidebarSection)

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
      className="portfolio-showcase preview-document--designer tpl-density-compact"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.1, PORTFOLIO_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header data-export-header="true" className="portfolio-showcase__header">
        <div className="min-w-0">
          <p className="portfolio-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="portfolio-showcase__name" data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="portfolio-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
          {tagline ? <p className="portfolio-showcase__tagline">{tagline}</p> : null}
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="portfolio-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="portfolio-showcase__contact-item">
                  <span className="portfolio-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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
          {mainSectionKeys.map((key) => renderSection(key, 'main'))}
        </main>
        {showSidebar ? (
          <aside className="portfolio-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
