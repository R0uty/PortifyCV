// Timeline Showcase — the non-ATS visual mode for the Modern Timeline
// template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'timeline' && !atsFriendlyMode. Shares the
// exact same CvData shape as every other template — this file only
// differs in presentation. ATS mode (the app's existing global toggle)
// bypasses this component entirely and falls back to the shared flat
// renderer (timeline.js).
//
// Design language: restrained, modern, single-column — no sidebar, no
// heavy cards. A vertical timeline (dot + connecting line, date in its own
// left column) is the one strong visual feature, used for both Experience
// and Education. Everything else — profile, project cards, skill tags,
// languages, certifications — stays plain and whitespace-led. The one
// accent color is user-customizable (see the `accentColor` prop, wired
// from a small swatch picker in Settings) rather than hardcoded, unlike
// every other bespoke Showcase in this app — applied via a single CSS
// custom property on the document root so the rest of the stylesheet
// never needs to know the actual color.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import {
  contactIcons,
  devIcons,
  sectionIcons,
  formatDateRange,
  formatLinkDisplayValue,
  getSafeHref,
} from './shared'
import { TIMELINE_DEFAULT_ACCENT_COLOR } from './timeline'

// ATS mode is monochrome for every template in this app (see
// CVPreview.jsx's generic-path comments) — this template is no exception,
// even though it otherwise keeps rendering itself (rather than bypassing
// to the generic renderer) in ATS mode.
const TIMELINE_ATS_ACCENT_COLOR = '#374151'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Best-effort mapping from free-text proficiency ("Fluent", "B2",
// "Edistynyt", ...) to a 1-5 dot count. Falls back to a neutral middle
// value for anything unrecognized rather than guessing high or low —
// this is a stylized visual flourish, not a claim about the CV's actual
// content, so an approximate dot count for unusual input is fine as long
// as it never looks like a strong claim either way.
function levelToDotCount(level) {
  const normalized = (level || '').toLowerCase()

  if (/native|fluent|c2|äidinkiel|sujuva/.test(normalized)) return 5
  if (/advanced|c1|edistynyt/.test(normalized)) return 4
  if (/intermediate|b1|b2|keskitaso/.test(normalized)) return 3
  if (/basic|elementary|a2|perus/.test(normalized)) return 2
  if (/beginner|a1|alkeet/.test(normalized)) return 1

  return 3
}

function SectionHead({ icon, title }) {
  return (
    <div className="timeline-showcase__section-head">
      <span className="timeline-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <h2 className="timeline-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, icon, title, children }) {
  return (
    <section className="timeline-showcase__section" data-export-section={id} data-export-placement="main">
      <SectionHead icon={icon} title={title} />
      {children}
    </section>
  )
}

function TimelineRow({ date, isLast, entryIndex, children }) {
  return (
    <div className={`timeline-showcase__row${isLast ? ' timeline-showcase__row--last' : ''}`} data-export-card="true" data-direct-edit-index={entryIndex}>
      <p className="timeline-showcase__row-date">{date}</p>
      <div className="timeline-showcase__row-rail">
        <span className="timeline-showcase__row-marker" aria-hidden="true" />
        {!isLast ? <span className="timeline-showcase__row-line" aria-hidden="true" /> : null}
      </div>
      <div className="timeline-showcase__row-content">{children}</div>
    </div>
  )
}

function renderExperienceEntry(item, index, { directEditDispatch, copy, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <TimelineRow
      key={`${item.role}-${item.company}-${index}`}
      date={dateRange || copy.datesPending}
      isLast={isLast}
      entryIndex={sourceIndex}
    >
      <p className="timeline-showcase__entry-role">
        {directEditDispatch ? (
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
            value={item.role}
            placeholder={copy.untitledRole}
          />
        ) : (
          item.role || copy.untitledRole
        )}
      </p>
      {directEditDispatch || item.company || item.location ? (
        <p className="timeline-showcase__entry-meta">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
              value={item.company}
              placeholder={copy.company}
            />
          ) : (
            item.company
          )}
          {item.company && item.location ? ` · ${item.location}` : item.location || null}
        </p>
      ) : null}
      {directEditDispatch ? (
        <p className="timeline-showcase__bullets timeline-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="timeline-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </TimelineRow>
  )
}

export default function TimelineShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = TIMELINE_DEFAULT_ACCENT_COLOR,
  atsFriendlyMode = false,
  headingColor = null,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const configShowPhoto = showcaseConfig.showPhoto !== false
  // The one "necessary" change ATS mode makes here: no user color, since
  // every other template's ATS pass is fully monochrome too (see
  // CVPreview.jsx's generic-path comments). Everything else — the
  // timeline, the section order, the icons — is already single-column and
  // stays exactly as-is.
  const effectiveAccentColor = atsFriendlyMode ? TIMELINE_ATS_ACCENT_COLOR : accentColor

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const spaceIndex = fullName.indexOf(' ')
  const nameFirst = spaceIndex === -1 ? fullName : fullName.slice(0, spaceIndex)
  const nameRest = spaceIndex === -1 ? '' : fullName.slice(spaceIndex)
  const photo = snapshot.photo
  const showPhoto = configShowPhoto && Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const personalContactItems = [
    ['phone', snapshot.phone],
    ['email', snapshot.email],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]
  const linkContactItems = [
    ['linkedin', snapshot.links.linkedin],
    ['website', snapshot.links.website],
    ['github', snapshot.links.github],
  ].filter(([, value]) => value)

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
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    profile: isFinnish ? 'Profiili' : 'Profile',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    projects: isFinnish ? 'Projektit' : 'Projects',
    skills: isFinnish ? 'Taidot' : 'Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certifications',
    viewProject: isFinnish ? 'Näytä projekti' : 'View project',
    viewCredential: isFinnish ? 'Näytä todennus' : 'View credential',
  }

  const renderSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" icon="about" title={copy.profile}>
          <p className="timeline-showcase__summary">
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
          </p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" icon="experience" title={copy.experience}>
          <div className="timeline-showcase__timeline">
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
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                sourceIndex: snapshot.sourceIndices.experience[index],
                copy,
                isLast: index === snapshot.experience.length - 1,
              }))
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" icon="education" title={copy.education}>
          <div className="timeline-showcase__timeline">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(' · ')

                return (
                  <TimelineRow
                    key={`${item.school}-${index}`}
                    date={formatDateRange(item.startDate, item.endDate)}
                    isLast={index === snapshot.education.length - 1}
                    entryIndex={snapshot.sourceIndices.education[index]}
                  >
                    <p className="timeline-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                    {metaLine ? <p className="timeline-showcase__entry-meta">{metaLine}</p> : null}
                  </TimelineRow>
                )
              })
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" icon="projects" title={copy.projects}>
          <div className="timeline-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const stackChips = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []
                const projectUrl = item.demoUrl || item.githubUrl

                return (
                  <div key={`${item.name}-${index}`} className="timeline-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    <span className="timeline-showcase__project-icon" aria-hidden="true">
                      {sectionIcons.projects}
                    </span>
                    {item.name ? <p className="timeline-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="timeline-showcase__project-desc">{item.description}</p> : null}
                    {stackChips.length > 0 ? (
                      <div className="timeline-showcase__project-tags">
                        {stackChips.map((chip) => (
                          <span key={chip} className="timeline-showcase__project-tag">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                    {projectUrl ? (
                      <a href={getSafeHref(projectUrl)} target="_blank" rel="noreferrer" className="timeline-showcase__project-link">
                        {copy.viewProject} ↗
                      </a>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" icon="skills" title={copy.skills}>
          {/* Three-way ternary rather than one persistent .tag-row wrapper:
              .tag-row's own margin-top (1rem) would stack with .empty's
              margin-top (0.8rem) if the empty state were nested inside it —
              flex-item margins don't collapse — adding an unwanted extra
              gap. Keeping the three states as fully separate branches
              avoids that regression while still guaranteeing mutual
              exclusion (a single chained ternary can only ever select one
              branch), same pattern Round 2/3 used for Editorial/Portrait. */}
          {directEditDispatch ? (
            <div className="timeline-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="timeline-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="timeline-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="timeline-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" icon="languages" title={copy.languages}>
          <div className="timeline-showcase__language-row">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => {
                const dotCount = levelToDotCount(item.level)

                return (
                  <div key={`${item.language}-${index}`} className="timeline-showcase__language-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                    <p className="timeline-showcase__language-name">{item.language}</p>
                    {item.level ? <p className="timeline-showcase__language-level">{item.level}</p> : null}
                    <div className="timeline-showcase__language-dots" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, dotIndex) => (
                        <span
                          key={dotIndex}
                          className={`timeline-showcase__language-dot${dotIndex < dotCount ? ' timeline-showcase__language-dot--filled' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" icon="certificates" title={copy.certificates}>
          <div className="timeline-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="timeline-showcase__cert-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  <div className="timeline-showcase__cert-row">
                    <div className="min-w-0">
                      {item.name ? <p className="timeline-showcase__cert-name">{item.name}</p> : null}
                      {item.issuer ? <p className="timeline-showcase__cert-issuer">{item.issuer}</p> : null}
                    </div>
                    {item.year ? <p className="timeline-showcase__cert-year">{item.year}</p> : null}
                  </div>
                  {item.credentialUrl ? (
                    <a href={getSafeHref(item.credentialUrl)} target="_blank" rel="noreferrer" className="timeline-showcase__cert-link">
                      {copy.viewCredential}
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="timeline-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certifications will appear here.'}
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
      data-export-variant="timeline"
      // "preview-document--designer"/"--ats" are pure marker classes (no
      // styling rules of their own — see index.css) that
      // ResumeBuilderPage's export handler polls for via
      // waitForPreviewModeSync before starting a PDF export. Unlike every
      // other bespoke Showcase, this one renders in *both* modes (see
      // CVPreview.jsx's delegation comment), so — unlike those — this
      // class has to actually track the live atsFriendlyMode value rather
      // than being hardcoded to "designer". Getting this wrong hangs the
      // export: the handler polls forever for a class that never appears.
      className={`timeline-showcase preview-document--${atsFriendlyMode ? 'ats' : 'designer'} tpl-density-standard`}
      style={{
        '--tpl-accent': effectiveAccentColor,
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header data-export-header="true" className="timeline-showcase__header">
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

        <div className="min-w-0">
          <p className="timeline-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="timeline-showcase__name" data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : (
              <>{nameFirst}<span className="timeline-showcase__name-accent">{nameRest}</span></>
            )}
          </h1>
          <p className="timeline-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          </p>

          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="timeline-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="timeline-showcase__contact-item">
                  <span className="timeline-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : (
                    value
                  )}
                </span>
              ))}
            </div>
          ) : null}

          {linkContactItems.length > 0 ? (
            <div className="timeline-showcase__contact">
              {linkContactItems.map(([key, value]) => (
                <span key={key} className="timeline-showcase__contact-item">
                  <span className="timeline-showcase__contact-icon" aria-hidden="true">{devIcons[key]}</span>
                  {formatLinkDisplayValue(value)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div className="timeline-showcase__header-divider" aria-hidden="true" />

      <div className="timeline-showcase__body" data-export-content="true">
        {sectionKeys.map((key) => renderSection(key))}
      </div>
    </article>
  )
}
