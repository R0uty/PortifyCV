// Modern Orange Showcase — the non-ATS visual mode for the Modern Orange
// template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'modernOrange'. Shares the exact same
// CvData shape as every other template — this file only differs in
// presentation.
//
// Design language: premium two-column CV — a light warm cream/orange left
// sidebar (photo, personal info, skills, languages, education timeline)
// beside a white main column (large name header with a solid-orange title
// badge, profile, an orange vertical timeline for experience, compact
// project cards, and a certifications list). Like Navy Professional, this
// Showcase does not bypass itself in ATS mode — it collapses its own
// sidebar+main grid to a single column and strips the cream background
// internally (see the stylesheet's `--ats` variant), the one genuinely
// "necessary" structural change for ATS mode. Like Modern Timeline, the one
// accent color is user-customizable (see the `accentColor` prop, wired from
// a swatch picker in Settings) rather than hardcoded — applied via a single
// CSS custom property on the document root so the rest of the stylesheet
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
  createSectionRouter,
} from './shared'
import { MODERN_ORANGE_DEFAULT_ACCENT_COLOR } from './modernOrange'

// ATS mode is monochrome for every template in this app (see
// CVPreview.jsx's generic-path comments) — this template is no exception,
// even though it otherwise keeps rendering itself (rather than bypassing
// to the generic renderer) in ATS mode.
const MODERN_ORANGE_ATS_ACCENT_COLOR = '#374151'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Best-effort mapping from free-text proficiency ("Fluent", "B2",
// "Edistynyt", ...) to a 1-5 dot count. Falls back to a neutral middle
// value for anything unrecognized rather than guessing high or low — this
// is a stylized visual flourish, not a claim about the CV's actual
// content, so an approximate dot count for unusual input is fine as long
// as it never looks like a strong claim either way. Same heuristic as the
// Modern Timeline Showcase.
function levelToDotCount(level) {
  const normalized = (level || '').toLowerCase()

  if (/native|fluent|c2|äidinkiel|sujuva/.test(normalized)) return 5
  if (/advanced|c1|edistynyt/.test(normalized)) return 4
  if (/intermediate|b1|b2|keskitaso/.test(normalized)) return 3
  if (/basic|elementary|a2|perus/.test(normalized)) return 2
  if (/beginner|a1|alkeet/.test(normalized)) return 1

  return 3
}

// Skills in this app are a flat list of strings with no per-skill
// proficiency field (unlike languages, which at least carry a free-text
// level). Rather than fabricate a number that isn't backed by any real
// input, the dot rating here reads list order as emphasis — the CV form
// already invites "your strongest skills first" the same way most resume
// tools do — and tapers evenly from 5 dots down to a 3-dot floor across
// the list. It's a stylized visual flourish, exactly like the language
// dots above, not a claim about actual proficiency.
function skillOrderDotCount(index, total) {
  if (total <= 1) return 5

  const ratio = index / (total - 1)
  return 5 - Math.round(ratio * 2)
}

function DotRow({ count }) {
  return (
    <span className="modern-orange-showcase__dots" aria-hidden="true">
      {Array.from({ length: 5 }, (_, dotIndex) => (
        <span
          key={dotIndex}
          className={`modern-orange-showcase__dot${dotIndex < count ? ' modern-orange-showcase__dot--filled' : ''}`}
        />
      ))}
    </span>
  )
}

function SectionHead({ icon, title }) {
  return (
    <div className="modern-orange-showcase__section-head">
      <span className="modern-orange-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <h2 className="modern-orange-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, icon, title, placement = 'main', movedFrom = null, children }) {
  return (
    <section
      className="modern-orange-showcase__section"
      data-export-section={id}
      data-export-placement={placement}
      data-moved-from={movedFrom ?? undefined}
    >
      <SectionHead icon={icon} title={title} />
      {children}
    </section>
  )
}

// `id` is set only for real CV sections: it is what the PDF exporter and
// Direct Edit's overlay find a section by. The personal-info block passes none
// and stays untagged.
function SidebarBlock({ id, title, placement = 'side', movedFrom = null, children }) {
  return (
    <div
      className="modern-orange-showcase__sidebar-block"
      data-export-section={id}
      data-export-placement={id ? placement : undefined}
      data-moved-from={movedFrom ?? undefined}
    >
      <p className="modern-orange-showcase__sidebar-heading">{title}</p>
      {children}
    </div>
  )
}

function ExperienceRow({ date, isLast, entryIndex, children }) {
  return (
    <div className={`modern-orange-showcase__exp-row${isLast ? ' modern-orange-showcase__exp-row--last' : ''}`} data-export-card="true" data-direct-edit-index={entryIndex}>
      <p className="modern-orange-showcase__exp-date">{date}</p>
      <div className="modern-orange-showcase__exp-rail">
        <span className="modern-orange-showcase__exp-marker" aria-hidden="true" />
        {!isLast ? <span className="modern-orange-showcase__exp-line" aria-hidden="true" /> : null}
      </div>
      <div className="modern-orange-showcase__exp-content">{children}</div>
    </div>
  )
}

function EducationRow({ isLast, entryIndex, children }) {
  return (
    <div className="modern-orange-showcase__edu-row" data-export-card="true" data-direct-edit-index={entryIndex}>
      <div className="modern-orange-showcase__edu-rail">
        <span className="modern-orange-showcase__edu-marker" aria-hidden="true" />
        {!isLast ? <span className="modern-orange-showcase__edu-line" aria-hidden="true" /> : null}
      </div>
      <div className="modern-orange-showcase__edu-content">{children}</div>
    </div>
  )
}

// Modern Orange's own Experience-entry renderer — reuses the existing
// ExperienceRow wrapper (the rail marker + connecting line), which already
// takes `isLast` as an explicit prop rather than relying on CSS position —
// safe for EditableList's own reordering/removal, since `isLast` is
// recomputed from `index === items.length - 1` on every render regardless
// of DOM wrapping. Only role and company are independently editable —
// location and dates stay read-only-appended text, matching every other
// template's Experience wiring in this rollout. `index` here is always
// formData.experience-relative (only ever read inside directEditDispatch-
// gated branches or the React key) — never assume it lines up with
// snapshot.experience's own (filtered) indices in the read-only call site.
function renderExperienceEntry(item, index, { directEditDispatch, copy, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <ExperienceRow
      key={`${item.role}-${item.company}-${index}`}
      date={dateRange || copy.datesPending}
      isLast={isLast}
      entryIndex={sourceIndex}
    >
      <p className="modern-orange-showcase__exp-role">
        {directEditDispatch ? (
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
            value={item.role}
            placeholder={copy.untitledRole}
          />
        ) : item.role || copy.untitledRole}
      </p>
      {directEditDispatch || item.company || item.location ? (
        <p className="modern-orange-showcase__exp-meta">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
              value={item.company}
              placeholder={copy.company}
            />
          ) : item.company}
          {item.company && item.location ? ` · ${item.location}` : item.location || null}
        </p>
      ) : null}
      {directEditDispatch ? (
        <p className="modern-orange-showcase__bullets modern-orange-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="modern-orange-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </ExperienceRow>
  )
}

export default function ModernOrangeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  accentColor = MODERN_ORANGE_DEFAULT_ACCENT_COLOR,
  atsFriendlyMode = false,
  headingColor = null,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const configShowPhoto = showcaseConfig.showPhoto !== false
  // The one "necessary" color change ATS mode makes here: no user color,
  // since every other template's ATS pass is fully monochrome too (see
  // CVPreview.jsx's generic-path comments).
  const effectiveAccentColor = atsFriendlyMode ? MODERN_ORANGE_ATS_ACCENT_COLOR : accentColor

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const spaceIndex = fullName.indexOf(' ')
  const nameFirst = spaceIndex === -1 ? fullName : fullName.slice(0, spaceIndex)
  const nameRest = spaceIndex === -1 ? '' : fullName.slice(spaceIndex + 1)
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
  const photo = snapshot.photo
  const showPhoto = configShowPhoto && Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const about = snapshot.about
    || (isFinnish
      ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
      : 'Your professional summary will appear here as you fill out the CV form.')

  // Personal info: location, email, phone, website, LinkedIn — deliberately
  // no date-of-birth row, since CvData has no such field anywhere in the
  // app (adding one would be a data-model change, not a template one).
  const personalItems = [
    ['location', snapshot.location],
    ['email', snapshot.email],
    ['phone', snapshot.phone],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
  ]
  const websiteUrl = snapshot.links.website
  const linkedinUrl = snapshot.links.linkedin

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
    personalInfo: isFinnish ? 'Henkilötiedot' : 'Personal Info',
    profile: isFinnish ? 'Profiili' : 'Profile',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    projects: isFinnish ? 'Projektit' : 'Projects',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certifications',
    skills: isFinnish ? 'Taidot' : 'Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
    viewProject: isFinnish ? 'Näytä projekti' : 'View project',
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="about" icon="about" title={copy.profile}>
          <p className="modern-orange-showcase__summary">
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

    if (key === 'experience') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="experience" icon="experience" title={copy.experience}>
          <div className="modern-orange-showcase__exp-list">
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
              <p className="modern-orange-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="projects" icon="projects" title={copy.projects}>
          <div className="modern-orange-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((chip) => chip.trim()).filter(Boolean)
                  : []
                const projectUrl = item.demoUrl || item.githubUrl

                return (
                  <div key={`${item.name}-${index}`} className="modern-orange-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    <span className="modern-orange-showcase__project-icon" aria-hidden="true">
                      {sectionIcons.projects}
                    </span>
                    {item.name ? <p className="modern-orange-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="modern-orange-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="modern-orange-showcase__project-tags">
                        {tags.map((chip) => (
                          <span key={chip} className="modern-orange-showcase__project-tag">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                    {projectUrl ? (
                      <a href={getSafeHref(projectUrl)} target="_blank" rel="noreferrer" className="modern-orange-showcase__project-link">
                        {copy.viewProject} ↗
                      </a>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="modern-orange-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="certificates" icon="certificates" title={copy.certificates}>
          <ul className="modern-orange-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <li key={`${item.name}-${index}`} className="modern-orange-showcase__cert-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  <div className="modern-orange-showcase__cert-row">
                    <div className="modern-orange-showcase__cert-text">
                      {item.name ? <p className="modern-orange-showcase__cert-name">{item.name}</p> : null}
                      {item.issuer ? <p className="modern-orange-showcase__cert-issuer">{item.issuer}</p> : null}
                    </div>
                    {item.year ? <p className="modern-orange-showcase__cert-year">{item.year}</p> : null}
                  </div>
                </li>
              ))
            ) : (
              <p className="modern-orange-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certifications will appear here.'}
              </p>
            )}
          </ul>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <SidebarBlock key={key} placement={placement} movedFrom={movedFrom} id="skills" title={copy.skills}>
          <div className="modern-orange-showcase__skill-list">
            {directEditDispatch ? null : snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill, index) => (
                <div key={skill} data-export-skill="true" className="modern-orange-showcase__skill-row">
                  <span className="modern-orange-showcase__skill-name tpl-text-wrappable">{skill}</span>
                  <DotRow count={skillOrderDotCount(index, snapshot.skills.length)} />
                </div>
              ))
            ) : (
              <p className="modern-orange-showcase__empty modern-orange-showcase__empty--sidebar">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
            {directEditDispatch ? (
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            ) : null}
          </div>
        </SidebarBlock>
      )
    }

    if (key === 'languages') {
      return (
        <SidebarBlock key={key} placement={placement} movedFrom={movedFrom} id="languages" title={copy.languages}>
          <div className="modern-orange-showcase__lang-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="modern-orange-showcase__lang-row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <div className="modern-orange-showcase__lang-head">
                    <span className="modern-orange-showcase__lang-name">{item.language}</span>
                    {item.level ? <span className="modern-orange-showcase__lang-level">{item.level}</span> : null}
                  </div>
                  <DotRow count={levelToDotCount(item.level)} />
                </div>
              ))
            ) : (
              <p className="modern-orange-showcase__empty modern-orange-showcase__empty--sidebar">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </SidebarBlock>
      )
    }

    if (key === 'education') {
      return (
        <SidebarBlock key={key} placement={placement} movedFrom={movedFrom} id="education" title={copy.education}>
          <div className="modern-orange-showcase__edu-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(', ')

                return (
                  <EducationRow
                    key={`${item.school}-${index}`}
                    isLast={index === snapshot.education.length - 1}
                    entryIndex={snapshot.sourceIndices.education[index]}
                  >
                    <p className="modern-orange-showcase__edu-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                    <p className="modern-orange-showcase__edu-degree">{item.degree || copy.untitledRole}</p>
                    {metaLine ? <p className="modern-orange-showcase__edu-meta">{metaLine}</p> : null}
                  </EducationRow>
                )
              })
            ) : (
              <p className="modern-orange-showcase__empty modern-orange-showcase__empty--sidebar">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </SidebarBlock>
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
      data-export-variant="modernOrange"
      data-export-content="true"
      // "preview-document--designer"/"--ats" are pure marker classes (no
      // styling rules of their own — see index.css) that
      // ResumeBuilderPage's export handler polls for via
      // waitForPreviewModeSync before starting a PDF export. This class has
      // to track the live atsFriendlyMode value (same as Navy Professional
      // and Modern Timeline) since this Showcase renders in both modes.
      //
      // "modern-orange-showcase--ats" collapses the sidebar+main grid to
      // one column and strips the cream sidebar background (see the
      // stylesheet) — the one genuinely "necessary" change for ATS mode,
      // since a side-by-side column is exactly what this app's own ATS
      // claims ("no columns") promise to remove.
      className={`modern-orange-showcase preview-document--${atsFriendlyMode ? 'ats' : 'designer'} tpl-density-standard${atsFriendlyMode ? ' modern-orange-showcase--ats' : ''}`}
      style={{
        '--tpl-accent': effectiveAccentColor,
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header data-export-header="true" className="modern-orange-showcase__header">
        <p className="modern-orange-showcase__kicker" data-export-ignore="true">
          {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
        </p>
        <h1 className="modern-orange-showcase__name" data-cv-name>
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          ) : (
            <>
              <span className="modern-orange-showcase__name-first">{nameFirst}</span>
              {nameRest ? (
                <>
                  {/* A literal space so el.textContent reads "First Rest"
                      (copy-paste, screen readers, this app's own layout
                      harness) — the <br/> alone only gives a *visual* line
                      break (docs/template-audit-phase2.md G7/F8). Trailing
                      whitespace before a line break collapses visually, so
                      this doesn't reintroduce a visible gap. */}
                  {' '}
                  <br />
                  <span className="modern-orange-showcase__name-last">{nameRest}</span>
                </>
              ) : null}
            </>
          )}
        </h1>
        <span className="modern-orange-showcase__title-badge">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          ) : title}
        </span>
      </header>

      <aside className="modern-orange-showcase__sidebar" data-export-secondary="true">
        {showPhoto ? (
          <div className="modern-orange-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="modern-orange-showcase__photo"
            />
          </div>
        ) : null}

        {directEditDispatch || personalItems.length > 0 || websiteUrl || linkedinUrl ? (
          <SidebarBlock title={copy.personalInfo}>
            <div className="modern-orange-showcase__contact-list">
              {(directEditDispatch ? directEditContactFields : personalItems).map(([key, value, placeholderLabel]) => (
                <div key={key} className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              ))}
              {websiteUrl ? (
                <div className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{devIcons.website}</span>
                  <span>{formatLinkDisplayValue(websiteUrl)}</span>
                </div>
              ) : null}
              {linkedinUrl ? (
                <div className="modern-orange-showcase__contact-item">
                  <span className="modern-orange-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                  <span>{formatLinkDisplayValue(linkedinUrl)}</span>
                </div>
              ) : null}
            </div>
          </SidebarBlock>
        ) : null}

        {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
      </aside>

      <main className="modern-orange-showcase__main" data-export-primary="true">
        <div className="modern-orange-showcase__header-divider" aria-hidden="true" />

        {mainSectionKeys.map((key) => renderSection(key, 'main'))}
      </main>
    </article>
  )
}
