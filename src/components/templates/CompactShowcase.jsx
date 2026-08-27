// Compact Showcase — the non-ATS "ultra-efficient one-pager" visual mode for
// the Compact template. Rendered by CVPreview.jsx instead of the shared
// generic renderer whenever variant === 'compact' && !atsFriendlyMode. Shares
// the exact same CvData shape as every other template — this file only
// differs in presentation. ATS mode (the app's existing global toggle)
// bypasses this component entirely and falls back to the shared flat
// renderer (compact.js).
//
// Unlike every other Showcase in this app, Compact has no main/sidebar
// split — the spec's SECTION ORDER is one flat list (Summary, Skills,
// Experience, Projects, Education, Certificates, Languages, Links,
// Interests), so this component renders a single ordered section list.
//
// "Smart space optimisation": a useLayoutEffect measures the rendered
// article's natural content height against the app's standard one-page
// floor (the `--preview-paper-min-height: 297mm` CSS variable, resolved to
// px by the browser) and steps through three density tiers — cozy, snug,
// tight — shrinking spacing/typography via a class swap until the content
// fits one page or the tightest tier is reached. Because this measures the
// live DOM node that PDF export also captures, the auto-fit applies to the
// exported PDF too, not just the on-screen preview.

import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import {
  devIcons,
  contactIcons,
  parseSkillCategories,
  formatDateRange,
  formatLinkLabel,
} from './shared'

const DENSITY_STEPS = ['cozy', 'snug', 'tight']

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Bolds metric-shaped tokens so quantified impact stands out in the tight
// bullet format, per the spec's "Metrics should be bold."
const METRIC_PATTERN = /(\$[\d,.]+[MKB]?\+?|£[\d,.]+[MKB]?\+?|\d+(?:[.,]\d+)?%|\d+x\b|\d+\+|\b\d{2,}(?:,\d{3})+\b)/gi

function highlightMetrics(text) {
  const parts = text.split(METRIC_PATTERN)
  if (parts.length === 1) return text
  return parts.map((part, index) => (
    METRIC_PATTERN.test(part) && part
      ? <strong key={index} className="compact-showcase__metric">{part}</strong>
      : part
  ))
}

export default function CompactShowcase({ formData, locale = 'en', previewRef, templateConfig, showcaseConfig = {}, headingColor = null }) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const showTwoColumn = showcaseConfig.compactTwoColumn === true
  const configShowPhoto = showcaseConfig.showPhoto !== false

  const rootRef = useRef(null)
  const [density, setDensity] = useState('cozy')
  const [stillOverflowing, setStillOverflowing] = useState(false)
  const [lastDeps, setLastDeps] = useState([null, null, null])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Vanhempi ohjelmistokehittäjä' : 'Senior Software Engineer')
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
  const visibleSet = new Set(templateSectionOrder)
  const sectionKeys = orderedSections.filter((key) => visibleSet.has(key) && sectionVisibility[key] && key !== 'about')

  const copy = {
    datesPending: isFinnish ? 'Pvm puuttuu' : 'Dates pending',
    summary: isFinnish ? 'Yhteenveto' : 'Summary',
    skills: isFinnish ? 'Taidot' : 'Skills',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    projects: isFinnish ? 'Projektit' : 'Projects',
    education: isFinnish ? 'Koulutus' : 'Education',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    languages: isFinnish ? 'Kielet' : 'Languages',
    links: isFinnish ? 'Linkit' : 'Links',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }

  // ── Smart space optimisation ────────────────────────────────────────
  // Whenever the content or layout config changes, re-start from the
  // loosest (cozy) tier — otherwise density could only ever tighten and
  // would stay tight forever even after the user removes content. This
  // follows React's "adjust state during render" pattern (a guarded
  // setState call in the render body, not inside an effect) rather than
  // syncing via useEffect, since the effect-based version just mirrors a
  // prop into state and triggers an avoidable extra render pass.
  const depsChanged = lastDeps[0] !== snapshot || lastDeps[1] !== showTwoColumn || lastDeps[2] !== sectionKeys.length
  if (depsChanged) {
    setLastDeps([snapshot, showTwoColumn, sectionKeys.length])
    if (density !== 'cozy') {
      setDensity('cozy')
    }
  }

  // Steps through density tiers until the rendered content fits within
  // the standard one-page floor, or the tightest tier is reached. Runs
  // again after every density change so each tier gets measured against
  // the freshly laid-out DOM before deciding whether to step down further.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return

    const targetPx = parseFloat(getComputedStyle(el).minHeight)
    if (!targetPx) return

    const overflowing = el.scrollHeight > targetPx + 2
    const stepIndex = DENSITY_STEPS.indexOf(density)

    if (overflowing && stepIndex < DENSITY_STEPS.length - 1) {
      setDensity(DENSITY_STEPS[stepIndex + 1])
      setStillOverflowing(false)
    } else {
      setStillOverflowing(overflowing)
    }
  }, [density, snapshot, sectionKeys.length, showTwoColumn])

  const renderSection = (key) => {
    if (key === 'skills') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="skills" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.skills}</h2>
          {skillCategories.length > 0 ? (
            <div className="compact-showcase__skill-groups">
              {skillCategories.map((cat) => (
                <div key={cat.key} className="compact-showcase__skill-group">
                  <span className="compact-showcase__skill-group-label">{cat.label}:</span>
                  <div className="compact-showcase__tag-row">
                    {cat.items.map((skill) => (
                      <span key={skill} data-export-skill="true" className="compact-showcase__tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="compact-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </section>
      )
    }

    if (key === 'experience') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="experience" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.experience}</h2>
          <div className="compact-showcase__entry-list">
            {snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)
                const bullets = item.description ? splitToBullets(item.description) : []

                return (
                  <div key={`${item.role}-${item.company}-${index}`} className="compact-showcase__entry" data-export-card="true">
                    <div className="compact-showcase__entry-row">
                      <div className="min-w-0">
                        <span className="compact-showcase__entry-role">{item.role}</span>
                        {item.company ? <span className="compact-showcase__entry-company"> · {item.company}</span> : null}
                        {item.location ? <span className="compact-showcase__entry-location"> · {item.location}</span> : null}
                      </div>
                      <span className="compact-showcase__entry-dates">{dateRange || copy.datesPending}</span>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="compact-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{highlightMetrics(line)}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="compact-showcase__empty">
                {isFinnish ? 'Kokemus näkyy tässä.' : 'Experience will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    if (key === 'projects') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="projects" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.projects}</h2>
          <div className="compact-showcase__entry-list">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const linkLine = [item.githubUrl, item.demoUrl].filter(Boolean).join('  ·  ')

                return (
                  <div key={`${item.name}-${index}`} className="compact-showcase__project" data-export-card="true">
                    <span className="compact-showcase__entry-role">{item.name}</span>
                    {item.description ? <span className="compact-showcase__project-desc"> — {item.description}</span> : null}
                    {item.stack ? <p className="compact-showcase__project-stack">{item.stack}</p> : null}
                    {linkLine ? <p className="compact-showcase__project-links">{linkLine}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="compact-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    if (key === 'education') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="education" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.education}</h2>
          <div className="compact-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const dateRange = formatDateRange(item.startDate, item.endDate)

                return (
                  <div key={`${item.school}-${index}`} className="compact-showcase__entry-row" data-export-card="true">
                    <div className="min-w-0">
                      <span className="compact-showcase__entry-role">{item.degree}</span>
                      {item.school ? <span className="compact-showcase__entry-company"> · {item.school}</span> : null}
                    </div>
                    <span className="compact-showcase__entry-dates">{dateRange || copy.datesPending}</span>
                  </div>
                )
              })
            ) : (
              <p className="compact-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    if (key === 'certificates') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="certificates" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.certificates}</h2>
          <div className="compact-showcase__entry-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="compact-showcase__entry-row" data-export-card="true">
                  <span className="compact-showcase__entry-role">{item.name}</span>
                  <span className="compact-showcase__entry-dates">
                    {[item.issuer, item.year].filter(Boolean).join(' · ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="compact-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    if (key === 'languages') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="languages" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.languages}</h2>
          {snapshot.languages.length > 0 ? (
            <p className="compact-showcase__inline-list">
              {snapshot.languages.map((item, index) => (
                <span key={`${item.language}-${index}`}>
                  {index > 0 ? '  ·  ' : ''}
                  {item.language}{item.level ? ` — ${item.level}` : ''}
                </span>
              ))}
            </p>
          ) : (
            <p className="compact-showcase__empty">
              {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
            </p>
          )}
        </section>
      )
    }

    if (key === 'links') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="links" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.links}</h2>
          {linkEntries.length > 0 ? (
            <div className="compact-showcase__link-row">
              {linkEntries.map(([linkKey, value]) => (
                <span key={linkKey} className="compact-showcase__link-item" data-export-card="true">
                  <span className="compact-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <span className="compact-showcase__link-label">{formatLinkLabel(linkKey)}:</span>
                  <span className="compact-showcase__link-value">{value}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="compact-showcase__empty">
              {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
            </p>
          )}
        </section>
      )
    }

    if (key === 'interests') {
      return (
        <section key={key} className="compact-showcase__section" data-export-section="interests" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.interests}</h2>
          {snapshot.interests.length > 0 ? (
            <p className="compact-showcase__inline-list">
              {snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`}>{index > 0 ? '  ·  ' : ''}{item.name}</span>
              ))}
            </p>
          ) : (
            <p className="compact-showcase__empty">
              {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
            </p>
          )}
        </section>
      )
    }

    return null
  }

  return (
    <article
      ref={(node) => {
        rootRef.current = node
        if (previewRef) previewRef.current = node
      }}
      data-export-root="true"
      data-export-variant="compact"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // CompactShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className={`compact-showcase preview-document--designer compact-showcase--${density}${showTwoColumn ? ' compact-showcase--two-column' : ''}`}
      style={headingColor ? { '--cv-heading-color': headingColor } : undefined}
    >
      <header data-export-header="true" className="compact-showcase__header">
        <div className="min-w-0">
          <p className="compact-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="compact-showcase__name">{fullName}</h1>
          <p className="compact-showcase__role">{title}</p>
          {personalContactItems.length > 0 ? (
            <div className="compact-showcase__contact">
              {personalContactItems.map(([key, value], index) => (
                <span key={key} className="compact-showcase__contact-item">
                  {index > 0 ? <span className="compact-showcase__contact-sep" aria-hidden="true">|</span> : null}
                  <span className="compact-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="compact-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="compact-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      {about ? (
        <section className="compact-showcase__section compact-showcase__section--summary" data-export-section="about" data-export-placement="main">
          <h2 className="compact-showcase__section-title">{copy.summary}</h2>
          <p className="compact-showcase__summary">{about}</p>
        </section>
      ) : null}

      <div className="compact-showcase__body" data-export-content="true">
        {sectionKeys.map((key) => renderSection(key))}
      </div>

      {stillOverflowing ? (
        <p className="compact-showcase__overflow-warning" data-export-ignore="true">
          {isFinnish
            ? 'Sisältö saattaa ylittää yhden sivun edes tiiveimmällä asettelulla. Harkitse kohtien lyhentämistä.'
            : 'Content may not fit one page even at the tightest density. Consider trimming a section.'}
        </p>
      ) : null}
    </article>
  )
}
