// European Showcase — the non-ATS visual mode for the European template.
// Rendered by CVPreview.jsx instead of the shared generic renderer whenever
// variant === 'european' && !atsFriendlyMode. Shares the exact same CvData
// shape as every other template — this file only differs in presentation.
// ATS mode (the app's existing global toggle) bypasses this component
// entirely and falls back to the shared flat renderer (european.js).
//
// Design language (docs/template-design-system.md §5): opens a new
// `label-grid` family — a Europass-adjacent, genuinely minimal one-page
// layout where every section reads as a label/value table (a narrow left
// column carrying a date, category, link type or level; a wider right
// column carrying the content) instead of flowing prose. Distinct from
// every other `single-column-flow` member (Minimalist, Classic
// Professional, Compact, Editorial), which all read top-to-bottom as
// prose paragraphs and bordered entries — nothing else in the app uses a
// persistent label/value table as its reading pattern. `left-tick`
// heading treatment (§4, until now only Colorful Compact — a very
// different colorful template) — a small solid accent mark before each
// section label.
//
// One-page fit reuses Compact's proven measure-and-step technique (same
// mechanism, not its visual identity): a useLayoutEffect measures the
// rendered height against the standard one-page floor and steps from
// `standard` density down to `compact` if it overflows, with a quiet
// warning at the floor — see CompactShowcase.jsx for the original. Also
// watches its own box with a ResizeObserver (same fix as
// AutoGrowTextarea.jsx's mount-time race) and re-measures on every real
// resize, not just on mount — this template is reached by selecting it
// from the gallery modal, whose close transition can still be settling
// the preview panel's width at the exact moment the one-shot
// useLayoutEffect fires, measuring a transient zero-width box and never
// re-checking once the layout actually stabilizes.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue, parseSkillCategories } from './shared'
import { accentSoftFill } from '../../utils/templateAccents'
import { EUROPEAN_DEFAULT_ACCENT_COLOR } from './european'

const DENSITY_STEPS = ['standard', 'compact']

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function SectionHead({ title }) {
  return (
    <div className="european-showcase__section-head">
      <span className="european-showcase__section-tick" aria-hidden="true" />
      <h2 className="european-showcase__section-title">{title}</h2>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="european-showcase__row">
      <div className="european-showcase__row-label">{label}</div>
      <div className="european-showcase__row-value">{children}</div>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section className="european-showcase__section" data-export-section={id} data-export-placement="main">
      <SectionHead title={title} />
      {children}
    </section>
  )
}

export default function EuropeanShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = EUROPEAN_DEFAULT_ACCENT_COLOR,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const rootRef = useRef(null)
  const [density, setDensity] = useState('standard')
  const [stillOverflowing, setStillOverflowing] = useState(false)
  const [lastContentKey, setLastContentKey] = useState(null)
  const [resizeTick, setResizeTick] = useState(0)

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
  const about = snapshot.about
    || (isFinnish
      ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
      : 'Your professional summary will appear here as you fill out the CV form.')
  const photo = snapshot.photo
  const showPhoto = Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )

  const linkedinUrl = snapshot.links.linkedin
  const metaItems = [
    ['location', snapshot.location],
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['linkedin', linkedinUrl ? formatLinkDisplayValue(linkedinUrl) : ''],
  ].filter(([, value]) => value)

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
  const sectionKeys = orderedSections.filter((key) => primarySet.has(key) && sectionVisibility[key])

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    about: isFinnish ? 'Esittely' : 'About',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    skills: isFinnish ? 'Taidot' : 'Skills',
    projects: isFinnish ? 'Projektit' : 'Projects',
    links: isFinnish ? 'Linkit' : 'Links',
    languages: isFinnish ? 'Kielet' : 'Languages',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
  }

  // ── One-page auto-fit ────────────────────────────────────────────────
  // Whenever the content changes, re-start from the loosest (standard)
  // tier — otherwise density could only ever tighten and would stay
  // compact forever even after the user removes content. Follows React's
  // "adjust state during render" pattern (a guarded setState call in the
  // render body), same as CompactShowcase.jsx — but keyed on a cheap
  // content fingerprint (string) rather than the `snapshot` object's own
  // identity, which isn't stable across every re-render here the way
  // Compact's copy of this pattern assumes; comparing content instead of
  // reference is what actually makes the guard fire only when the
  // rendered content itself changes.
  const contentKey = `${JSON.stringify(snapshot).length}:${sectionKeys.join(',')}`
  if (lastContentKey !== contentKey) {
    setLastContentKey(contentKey)
    if (density !== 'standard') {
      setDensity('standard')
    }
  }

  // Steps down to `compact` if the rendered content overflows the
  // standard one-page floor; shows a quiet warning if it still overflows
  // at that tightest shared tier. Same measure-and-step technique as
  // CompactShowcase.jsx. `resizeTick` is bumped by the ResizeObserver
  // below whenever the root's actual box size changes, so a measurement
  // taken against a transient zero-width box (see the file header
  // comment) gets corrected once the surrounding panel settles, instead
  // of the one-shot version this effect started as.
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
  }, [density, contentKey, resizeTick])

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => setResizeTick((tick) => tick + 1))
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  const renderSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" title={copy.about}>
          <Row label="">
            <p className="european-showcase__intro">{about}</p>
          </Row>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" title={copy.experience}>
          {snapshot.experience.length > 0 ? (
            snapshot.experience.map((item, index) => {
              const dateRange = formatDateRange(item.startDate, item.endDate)
              const bullets = item.description ? splitToBullets(item.description) : []
              const metaLine = [item.company, item.location].filter(Boolean).join(' · ')

              return (
                <div key={`${item.role}-${item.company}-${index}`} data-export-card="true">
                  <Row label={dateRange || copy.datesPending}>
                    <p className="european-showcase__entry-role">{item.role || copy.untitledRole}</p>
                    {metaLine ? <p className="european-showcase__entry-meta">{metaLine}</p> : null}
                    {bullets.length > 0 ? (
                      <ul className="european-showcase__bullets">
                        {bullets.map((line, lineIndex) => (
                          <li key={lineIndex}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                  </Row>
                </div>
              )
            })
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            </Row>
          )}
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" title={copy.education}>
          {snapshot.education.length > 0 ? (
            snapshot.education.map((item, index) => {
              const metaLine = [item.school, item.location].filter(Boolean).join(' · ')

              return (
                <div key={`${item.school}-${index}`} data-export-card="true">
                  <Row label={formatDateRange(item.startDate, item.endDate) || copy.datesPending}>
                    <p className="european-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                    {metaLine ? <p className="european-showcase__entry-meta">{metaLine}</p> : null}
                  </Row>
                </div>
              )
            })
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            </Row>
          )}
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" title={copy.skills}>
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <Row key={cat.key} label={cat.label}>
                <p className="european-showcase__skill-items" data-export-skill="true">{cat.items.join(', ')}</p>
              </Row>
            ))
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            </Row>
          )}
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" title={copy.projects}>
          {snapshot.projects.length > 0 ? (
            snapshot.projects.map((item, index) => {
              const tags = item.stack
                ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                : []

              return (
                <div key={`${item.name}-${index}`} data-export-card="true">
                  <Row label={item.date || ''}>
                    {item.name ? <p className="european-showcase__entry-role">{item.name}</p> : null}
                    {item.description ? <p className="european-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <p className="european-showcase__tag-line">{tags.join(', ')}</p>
                    ) : null}
                  </Row>
                </div>
              )
            })
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            </Row>
          )}
        </Section>
      )
    }

    if (key === 'links') {
      const linkEntries = Object.entries(snapshot.links)

      return (
        <Section key={key} id="links" title={copy.links}>
          {linkEntries.length > 0 ? (
            linkEntries.map(([linkKey, value]) => (
              <Row key={linkKey} label={formatLinkLabel(linkKey)}>
                <p className="european-showcase__link-value" data-export-card="true" title={value}>
                  {formatLinkDisplayValue(value)}
                </p>
              </Row>
            ))
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            </Row>
          )}
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" title={copy.languages}>
          {snapshot.languages.length > 0 ? (
            snapshot.languages.map((item, index) => (
              <Row key={`${item.language}-${index}`} label={item.level || ''}>
                <p className="european-showcase__language-value">{item.language}</p>
              </Row>
            ))
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            </Row>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" title={copy.certificates}>
          {snapshot.certificates.length > 0 ? (
            snapshot.certificates.map((item, index) => (
              <Row key={`${item.name}-${index}`} label={item.year || ''}>
                <p className="european-showcase__cert-value">
                  {[item.name, item.issuer].filter(Boolean).join(' – ')}
                </p>
              </Row>
            ))
          ) : (
            <Row label="">
              <p className="european-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            </Row>
          )}
        </Section>
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
      data-export-variant="european"
      // "preview-document--designer" is a pure marker class (no styling
      // rules of its own — see index.css) that ResumeBuilderPage's export
      // handler polls for via waitForPreviewModeSync before starting a PDF
      // export. This Showcase only ever renders in non-ATS mode, so it's
      // always "designer", never "ats". Without this class the export
      // handler polls forever waiting for a class that can never appear,
      // hanging the export.
      className={`european-showcase preview-document--designer tpl-density-${density}`}
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, EUROPEAN_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header className="european-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="european-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="european-showcase__name">{fullName}</h1>
          <p className="european-showcase__role">{title}</p>
          {metaItems.length > 0 ? (
            <div className="european-showcase__meta">
              {metaItems.map(([key, value]) => (
                <span key={key} className="european-showcase__meta-item">{value}</span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="european-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="european-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div className="european-showcase__rule" aria-hidden="true" />

      <div className="european-showcase__body" data-export-content="true">
        {sectionKeys.map((key) => renderSection(key))}
      </div>

      {stillOverflowing ? (
        <p className="european-showcase__overflow-warning" data-export-ignore="true">
          {isFinnish
            ? 'Sisältö saattaa ylittää yhden sivun edes tiiveimmällä asettelulla. Harkitse kohtien lyhentämistä.'
            : 'Content may not fit one page even at the tightest density. Consider trimming a section.'}
        </p>
      ) : null}
    </article>
  )
}
