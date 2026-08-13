// Timeline Showcase — the non-ATS "career storytelling" visual mode for the
// Timeline template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'timeline' && !atsFriendlyMode. Shares the
// exact same CvData shape as every other template — this file only differs
// in presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (timeline.js).
//
// Design language: the timeline is the centerpiece. Every visible entry
// across Career/Education/Certifications/Projects/Awards/Speaking/
// Publications/Volunteering renders as ONE continuous flat list inside the
// main column, each with a colored circular node keyed to its type (see
// NODE_META below), so a single vertical line can run behind the entire
// list rather than being scoped to one section at a time. Skills/Links/
// Languages/Interests are the true sidebar and sit outside the timeline.

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

// Per-type node color + icon + label, in the exact order the spec lists them.
// "achievements" doubles as the spec's "Awards" section; there is no separate
// milestones array — awards/certificates/publications naturally read as the
// storyline's milestone beats once they're threaded onto the same line.
const NODE_META = {
  experience: { colorClass: 'career', icon: 'experience' },
  education: { colorClass: 'education', icon: 'education' },
  certificates: { colorClass: 'certificates', icon: 'certificates' },
  projects: { colorClass: 'projects', icon: 'projects' },
  achievements: { colorClass: 'awards', icon: 'achievements' },
  speaking: { colorClass: 'speaking', icon: 'speaking' },
  publications: { colorClass: 'publications', icon: 'publications' },
  volunteering: { colorClass: 'volunteering', icon: 'volunteering' },
}

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function TimelineNode({ kind }) {
  const meta = NODE_META[kind]
  return (
    <span className={`timeline-showcase__node timeline-showcase__node--${meta.colorClass}`} aria-hidden="true">
      {sectionIcons[meta.icon]}
    </span>
  )
}

export default function TimelineShowcase({ formData, locale = 'en', previewRef, templateConfig, showcaseConfig = {} }) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const showSidebar = showcaseConfig.showSidebar !== false
  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Senior Engineer')
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
    about: isFinnish ? 'Esittely' : 'About',
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
    career: isFinnish ? 'Ura' : 'Career',
    education: isFinnish ? 'Koulutus' : 'Education',
    certificates: isFinnish ? 'Sertifioinnit' : 'Certifications',
    projects: isFinnish ? 'Projektit' : 'Projects',
    achievements: isFinnish ? 'Tunnustukset' : 'Awards',
    speaking: isFinnish ? 'Esiintymiset' : 'Speaking',
    publications: isFinnish ? 'Julkaisut' : 'Publications',
    volunteering: isFinnish ? 'Vapaaehtoistyö' : 'Volunteering',
    skills: isFinnish ? 'Taidot' : 'Skills',
    links: isFinnish ? 'Linkit' : 'Links',
    languages: isFinnish ? 'Kielet' : 'Languages',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }

  // Builds the flat, chronologically-grouped timeline entry list. Each
  // section type keeps its own items in the user's configured order, but
  // all types are threaded onto the same list so one continuous line can
  // run behind every group (see .timeline-showcase__line in index.css).
  const timelineGroups = mainSectionKeys
    .filter((key) => key !== 'about' && NODE_META[key])
    .map((key) => ({ key, items: snapshot[key] }))
    .filter((group) => group.items.length > 0)

  const renderEntryContent = (kind, item) => {
    if (kind === 'experience') {
      const dateRange = formatDateRange(item.startDate, item.endDate)
      const bullets = item.description ? splitToBullets(item.description) : []

      return (
        <>
          {dateRange ? <p className="timeline-showcase__year">{dateRange}</p> : null}
          <p className="timeline-showcase__entry-title">{item.role || copy.untitledRole}</p>
          {item.company || item.location ? (
            <p className="timeline-showcase__entry-meta">
              {[item.company, item.location].filter(Boolean).join(' · ')}
            </p>
          ) : null}
          {bullets.length > 0 ? (
            <ul className="timeline-showcase__bullets">
              {bullets.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}
            </ul>
          ) : null}
        </>
      )
    }

    if (kind === 'education') {
      const dateRange = formatDateRange(item.startDate, item.endDate)
      return (
        <>
          {dateRange ? <p className="timeline-showcase__year">{dateRange}</p> : null}
          <p className="timeline-showcase__entry-title">{item.degree}</p>
          {item.school || item.location ? (
            <p className="timeline-showcase__entry-meta">
              {[item.school, item.location].filter(Boolean).join(' · ')}
            </p>
          ) : null}
          {item.honors ? <p className="timeline-showcase__entry-honors">{item.honors}</p> : null}
        </>
      )
    }

    if (kind === 'certificates') {
      return (
        <>
          {item.year ? <p className="timeline-showcase__year">{item.year}</p> : null}
          <p className="timeline-showcase__entry-title">{item.name}</p>
          {item.issuer ? <p className="timeline-showcase__entry-meta">{item.issuer}</p> : null}
          {item.expiry ? (
            <p className="timeline-showcase__entry-meta">
              {isFinnish ? `Vanhenee ${item.expiry}` : `Expires ${item.expiry}`}
            </p>
          ) : null}
          {item.credentialUrl ? (
            <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="timeline-showcase__entry-link">
              {copy.viewCredential}
            </a>
          ) : null}
        </>
      )
    }

    if (kind === 'projects') {
      return (
        <>
          {item.date ? <p className="timeline-showcase__year">{item.date}</p> : null}
          <p className="timeline-showcase__entry-title">{item.name}</p>
          {item.organization ? <p className="timeline-showcase__entry-meta">{item.organization}</p> : null}
          {item.description ? <p className="timeline-showcase__entry-desc">{item.description}</p> : null}
          {item.impact ? <p className="timeline-showcase__entry-impact">{item.impact}</p> : null}
          {item.stack ? <p className="timeline-showcase__entry-stack">{item.stack}</p> : null}
          {item.demoUrl || item.githubUrl ? (
            <p className="timeline-showcase__entry-link">{item.demoUrl || item.githubUrl}</p>
          ) : null}
        </>
      )
    }

    if (kind === 'achievements') {
      return (
        <>
          {item.year ? <p className="timeline-showcase__year">{item.year}</p> : null}
          <p className="timeline-showcase__entry-title">{item.title}</p>
          {item.description ? <p className="timeline-showcase__entry-desc">{item.description}</p> : null}
        </>
      )
    }

    if (kind === 'speaking') {
      return (
        <>
          {item.date ? <p className="timeline-showcase__year">{item.date}</p> : null}
          <p className="timeline-showcase__entry-title">{item.topic}</p>
          {item.conference ? <p className="timeline-showcase__entry-meta">{item.conference}</p> : null}
          {item.audience ? <p className="timeline-showcase__entry-desc">{item.audience}</p> : null}
        </>
      )
    }

    if (kind === 'publications') {
      return (
        <>
          {item.year ? <p className="timeline-showcase__year">{item.year}</p> : null}
          <p className="timeline-showcase__entry-title">{item.title}</p>
          {item.publisher ? <p className="timeline-showcase__entry-meta">{item.publisher}</p> : null}
        </>
      )
    }

    if (kind === 'volunteering') {
      const heading = [item.role, item.organization].filter(Boolean).join(' — ')
      return (
        <>
          <p className="timeline-showcase__entry-title">{heading}</p>
          {item.description ? <p className="timeline-showcase__entry-desc">{item.description}</p> : null}
        </>
      )
    }

    return null
  }

  const renderSidebarSection = (key) => {
    if (key === 'skills') {
      return (
        <section key={key} className="timeline-showcase__side-section" data-export-section="skills" data-export-placement="side">
          <p className="timeline-showcase__side-title">{copy.skills}</p>
          {skillCategories.length > 0 ? (
            skillCategories.map((cat) => (
              <div key={cat.key} className="timeline-showcase__skill-group">
                <p className="timeline-showcase__skill-group-label">{cat.label}</p>
                <div className="timeline-showcase__tag-row">
                  {cat.items.map((skill) => (
                    <span key={skill} data-export-skill="true" className="timeline-showcase__tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="timeline-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </section>
      )
    }

    if (key === 'links') {
      return (
        <section key={key} className="timeline-showcase__side-section" data-export-section="links" data-export-placement="side">
          <p className="timeline-showcase__side-title">{copy.links}</p>
          <div className="timeline-showcase__link-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <div key={linkKey} data-export-card="true" className="timeline-showcase__link-card">
                  <span className="timeline-showcase__link-icon" aria-hidden="true">{devIcons[linkKey]}</span>
                  <div className="min-w-0">
                    <p className="timeline-showcase__link-label">{formatLinkLabel(linkKey)}</p>
                    <p className="timeline-showcase__link-value" title={value}>{formatLinkDisplayValue(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    if (key === 'languages') {
      return (
        <section key={key} className="timeline-showcase__side-section" data-export-section="languages" data-export-placement="side">
          <p className="timeline-showcase__side-title">{copy.languages}</p>
          <div className="timeline-showcase__list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="timeline-showcase__list-item timeline-showcase__list-item--row">
                  <span>{item.language}</span>
                  {item.level ? <span className="timeline-showcase__list-meta">{item.level}</span> : null}
                </div>
              ))
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    if (key === 'interests') {
      return (
        <section key={key} className="timeline-showcase__side-section" data-export-section="interests" data-export-placement="side">
          <p className="timeline-showcase__side-title">{copy.interests}</p>
          <div className="timeline-showcase__interest-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`} className="timeline-showcase__interest-chip">
                  {item.name}
                </span>
              ))
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
              </p>
            )}
          </div>
        </section>
      )
    }

    return null
  }

  return (
    <article
      ref={previewRef}
      data-export-root="true"
      data-export-variant="timeline"
      // "preview-document--designer" is a pure marker class (no styling rules
      // of its own — see index.css) that ResumeBuilderPage's export handler
      // polls for via waitForPreviewModeSync before starting a PDF export.
      // TimelineShowcase only ever renders in non-ATS mode, so it's always
      // "designer", never "ats". Without this class the export handler polls
      // forever waiting for a class that can never appear, hanging the export.
      className="timeline-showcase preview-document--designer"
    >
      <header data-export-header="true" className="timeline-showcase__header">
        <div className="min-w-0">
          <p className="timeline-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="timeline-showcase__name">{fullName}</h1>
          <p className="timeline-showcase__role">{title}</p>
          {tagline ? <p className="timeline-showcase__tagline">{tagline}</p> : null}
          {personalContactItems.length > 0 ? (
            <div className="timeline-showcase__contact">
              {personalContactItems.map(([key, value]) => (
                <span key={key} className="timeline-showcase__contact-item">
                  <span className="timeline-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="timeline-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="timeline-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div
        className="timeline-showcase__body"
        data-export-content="true"
        style={!showSidebar ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}
      >
        <main className="timeline-showcase__main" data-export-primary="true">
          {about ? (
            <div data-export-section="about">
              <p className="timeline-showcase__group-label timeline-showcase__intro-label">{copy.about}</p>
              <p className="timeline-showcase__intro">{about}</p>
            </div>
          ) : null}

          <div className="timeline-showcase__rail">
            <span className="timeline-showcase__line" data-export-ignore="true" aria-hidden="true" />
            {timelineGroups.map((group) => (
              <div key={group.key} className="timeline-showcase__group" data-export-section={group.key} data-export-placement="main">
                <div className="timeline-showcase__group-label-row">
                  <span className="timeline-showcase__group-spacer" aria-hidden="true" />
                  <p className="timeline-showcase__group-label">{copy[group.key === 'experience' ? 'career' : group.key]}</p>
                </div>
                {group.items.map((item, index) => (
                  <div
                    key={`${group.key}-${index}`}
                    className="timeline-showcase__entry"
                    data-export-card="true"
                  >
                    <div className="timeline-showcase__node-col">
                      <TimelineNode kind={group.key} />
                    </div>
                    <div className="timeline-showcase__entry-content">
                      {renderEntryContent(group.key, item, index)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>

        {showSidebar ? (
          <aside className="timeline-showcase__sidebar" data-export-secondary="true">
            {sidebarSectionKeys.map((key) => renderSidebarSection(key))}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
