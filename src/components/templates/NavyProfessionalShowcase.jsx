// Navy Professional Showcase — the non-ATS visual mode for the Navy
// Professional template. Rendered by CVPreview.jsx instead of the shared
// generic renderer whenever variant === 'navyProfessional' &&
// !atsFriendlyMode. Shares the exact same CvData shape as every other
// template — this file only differs in presentation. ATS mode (the app's
// existing global toggle) bypasses this component entirely and falls back
// to the shared flat renderer (navyProfessional.js).
//
// Design language: modern two-column CV with a full-height dark navy left
// sidebar carrying identity (photo, name, title), contact, skills, and
// languages, and a white main column with blue-accented section headings
// for profile, experience, education, and certifications. Structurally
// different from every other bespoke Showcase in this app: the other 8 put
// name/photo/contact in a shared top header above a two-column body: this
// one has no separate header — identity lives inside the sidebar itself,
// matching the reference design's full-height rail.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import {
  contactIcons,
  devIcons,
  sectionIcons,
  formatDateRange,
  formatLinkDisplayValue,
  createSectionRouter,
} from './shared'
import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

// Experience and Education share the `entry` class, whose spacing and
// divider depend on position. Both pass isFirst/isLast from their own
// index — never :first-child/:last-child, which EditableList's per-entry
// wrapper defeats in Direct Edit (every entry becomes both).
function entryClassName(isFirst, isLast) {
  return [
    'navy-professional-showcase__entry',
    isFirst ? 'navy-professional-showcase__entry--first' : '',
    isLast ? 'navy-professional-showcase__entry--last' : '',
  ].filter(Boolean).join(' ')
}

// Navy's own Experience-entry renderer: role and dates share the first
// row, company/location sit on their own line below — not
// directEditExperienceEntry.jsx's shape. Only role and company are
// editable inline; location stays read-only-appended text. `index` is
// formData-relative in the directEditDispatch branch (EditableList's own
// index); the read-only call site passes the snapshot's `sourceIndex`.
function renderExperienceEntry(item, index, { directEditDispatch, copy, isFirst, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []
  const metaLine = [item.company, item.location].filter(Boolean).join(', ')

  return (
    <div key={`${item.role}-${item.company}-${index}`} className={entryClassName(isFirst, isLast)} data-export-card="true" data-direct-edit-index={sourceIndex}>
      <div className="navy-professional-showcase__entry-row">
        <p className="navy-professional-showcase__entry-role">
          {directEditDispatch ? (
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'role' }}
              value={item.role}
              placeholder={copy.untitledRole}
            />
          ) : item.role || copy.untitledRole}
        </p>
        <p className="navy-professional-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <p className="navy-professional-showcase__entry-meta">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
            value={item.company}
            placeholder={copy.company}
          />
          {item.location ? `, ${item.location}` : null}
        </p>
      ) : metaLine ? <p className="navy-professional-showcase__entry-meta">{metaLine}</p> : null}
      {directEditDispatch ? (
        <p className="navy-professional-showcase__bullets navy-professional-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="navy-professional-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function SectionHead({ icon, title }) {
  return (
    <div className="navy-professional-showcase__section-head">
      <span className="navy-professional-showcase__section-icon" aria-hidden="true">
        {sectionIcons[icon]}
      </span>
      <h2 className="navy-professional-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, icon, title, placement = 'main', movedFrom = null, children }) {
  return (
    <section
      className="navy-professional-showcase__section"
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
// Direct Edit's overlay find a section by. The contact block passes none
// and stays untagged.
function SidebarBlock({ id, title, placement = 'side', movedFrom = null, children }) {
  return (
    <div
      className="navy-professional-showcase__sidebar-block"
      data-export-section={id}
      data-export-placement={id ? placement : undefined}
      data-moved-from={movedFrom ?? undefined}
    >
      <p className="navy-professional-showcase__sidebar-heading">{title}</p>
      {children}
    </div>
  )
}

export default function NavyProfessionalShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  showcaseConfig = {},
  atsFriendlyMode = false,
  headingColor = null,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const configShowPhoto = showcaseConfig.showPhoto !== false

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
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

  const contactItems = [
    ['phone', snapshot.phone],
    ['email', snapshot.email],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const linkedinUrl = snapshot.links.linkedin
  // Direct Edit shows every contact slot, empty or not, in the read-only
  // order. LinkedIn is a link field (links.linkedin), not a root one.
  const directEditContactFields = [
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone', 'root', contactIcons.phone],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email', 'root', contactIcons.email],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location', 'root', contactIcons.location],
    ['linkedin', formData.links.linkedin, 'LinkedIn', 'link', devIcons.linkedin],
  ]

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
    profile: isFinnish ? 'Profiili' : 'Profile',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certifications',
    contact: isFinnish ? 'Yhteystiedot' : 'Contact',
    skills: isFinnish ? 'Taidot' : 'Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="about" icon="about" title={copy.profile}>
          <p className="navy-professional-showcase__summary">
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
          <div className="navy-professional-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isFirst: index === 0,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) =>
                renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  isFirst: index === 0,
                  isLast: index === snapshot.experience.length - 1,
                  sourceIndex: snapshot.sourceIndices.experience[index],
                }),
              )
            ) : (
              <p className="navy-professional-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="education" icon="education" title={copy.education}>
          <div className="navy-professional-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(', ')

                return (
                  <div
                    key={`${item.school}-${index}`}
                    className={entryClassName(index === 0, index === snapshot.education.length - 1)}
                    data-export-card="true"
                    data-direct-edit-index={snapshot.sourceIndices.education[index]}
                  >
                    <div className="navy-professional-showcase__entry-row">
                      <p className="navy-professional-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                      <p className="navy-professional-showcase__entry-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                    </div>
                    {metaLine ? <p className="navy-professional-showcase__entry-meta">{metaLine}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="navy-professional-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} placement={placement} movedFrom={movedFrom} id="certificates" icon="certificates" title={copy.certificates}>
          <ul className="navy-professional-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <li key={`${item.name}-${index}`} className="navy-professional-showcase__cert-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  <span className="navy-professional-showcase__cert-dot" aria-hidden="true" />
                  <span>{[item.name, item.issuer].filter(Boolean).join(' – ')}</span>
                </li>
              ))
            ) : (
              <p className="navy-professional-showcase__empty">
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
          <div className="navy-professional-showcase__tag-row">
            {directEditDispatch ? (
              // Chips replace the read-only tags outright (never both, or
              // every skill renders twice).
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            ) : snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="navy-professional-showcase__tag">{skill}</span>
              ))
            ) : (
              <p className="navy-professional-showcase__empty navy-professional-showcase__empty--sidebar">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
          </div>
        </SidebarBlock>
      )
    }

    if (key === 'languages') {
      return (
        <SidebarBlock key={key} placement={placement} movedFrom={movedFrom} id="languages" title={copy.languages}>
          <ul className="navy-professional-showcase__language-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <li key={`${item.language}-${index}`} className="navy-professional-showcase__language-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span>{item.language}</span>
                  {item.level ? <span className="navy-professional-showcase__language-level"> – {item.level}</span> : null}
                </li>
              ))
            ) : (
              <p className="navy-professional-showcase__empty navy-professional-showcase__empty--sidebar">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </ul>
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
      data-export-variant="navyProfessional"
      data-export-content="true"
      // "preview-document--designer"/"--ats" are pure marker classes (no
      // styling rules of their own — see index.css) that
      // ResumeBuilderPage's export handler polls for via
      // waitForPreviewModeSync before starting a PDF export. Unlike every
      // other bespoke Showcase, this one renders in *both* modes (see
      // CVPreview.jsx's delegation comment), so this class has to track
      // the live atsFriendlyMode value rather than being hardcoded to
      // "designer" — getting it wrong hangs the export.
      //
      // "navy-professional-showcase--ats" collapses the sidebar+main grid
      // to one column and strips the dark sidebar background (see the
      // stylesheet) — the one genuinely "necessary" change for ATS mode,
      // since a side-by-side column is exactly what this app's own ATS
      // claims ("no columns") promise to remove. Section order and
      // everything else about the layout stays the same.
      className={`navy-professional-showcase preview-document--${atsFriendlyMode ? 'ats' : 'designer'} tpl-density-standard${atsFriendlyMode ? ' navy-professional-showcase--ats' : ''}`}
      style={headingColor ? { '--cv-heading-color': headingColor } : undefined}
    >
      <aside className="navy-professional-showcase__sidebar" data-export-secondary="true">
        <div data-export-header="true" className="navy-professional-showcase__identity">
          {showPhoto ? (
            <div className="navy-professional-showcase__photo-wrap">
              <img
                src={photo}
                alt={`${fullName} profile`}
                data-export-photo="true"
                className="navy-professional-showcase__photo"
              />
            </div>
          ) : null}
          <p className="navy-professional-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="navy-professional-showcase__name">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="navy-professional-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
        </div>

        <div className="navy-professional-showcase__sidebar-divider" aria-hidden="true" />

        {directEditDispatch ? (
          <SidebarBlock title={copy.contact}>
            <div className="navy-professional-showcase__contact-list">
              {directEditContactFields.map(([key, value, placeholderLabel, pathKind, icon]) => (
                <div key={key} className="navy-professional-showcase__contact-item">
                  <span className="navy-professional-showcase__contact-icon" aria-hidden="true">{icon}</span>
                  <span>
                    <EditableField
                      as="span"
                      path={{ kind: pathKind, field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  </span>
                </div>
              ))}
            </div>
          </SidebarBlock>
        ) : contactItems.length > 0 || linkedinUrl ? (
          <SidebarBlock title={copy.contact}>
            <div className="navy-professional-showcase__contact-list">
              {contactItems.map(([key, value]) => (
                <div key={key} className="navy-professional-showcase__contact-item">
                  <span className="navy-professional-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
                  <span>{value}</span>
                </div>
              ))}
              {linkedinUrl ? (
                <div className="navy-professional-showcase__contact-item">
                  <span className="navy-professional-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                  <span>{formatLinkDisplayValue(linkedinUrl)}</span>
                </div>
              ) : null}
            </div>
          </SidebarBlock>
        ) : null}

        {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
      </aside>

      <main className="navy-professional-showcase__main" data-export-primary="true">
        {mainSectionKeys.map((key) => renderSection(key, 'main'))}
      </main>
    </article>
  )
}
