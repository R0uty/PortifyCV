// Editorial Showcase — the non-ATS visual mode for the Editorial template.
// Rendered by CVPreview.jsx instead of the shared generic renderer whenever
// variant === 'editorial' && !atsFriendlyMode. Shares the exact same CvData
// shape as every other template — this file only differs in presentation.
// ATS mode (the app's existing global toggle) bypasses this component
// entirely and falls back to the shared flat renderer (editorial.js).
//
// Design language (docs/template-design-system.md): the open `numbered` +
// `single-column-flow` combination (§5) — a magazine-style single column
// distinct from Classic Professional's centered letterhead and
// Minimalist's plain header. One column, no sidebar; sections carry a
// two-digit accent ordinal (§4 `numbered`, shared with Creative, but never
// duplicating it — Creative is right-rail + main, this is
// single-column-flow, so the combination itself is new). One
// user-customizable accent (`--tpl-accent`), used sparingly — the
// professional title, the numbered ordinals, and a single rule under the
// masthead; section labels and body text stay ink. An optional, modest
// photo sits beside the masthead identity block — unlike Classic
// Professional (which never shows one), this template shows one whenever
// the user has added a photo and left it visible for this template.

import { useMemo } from 'react'
import CvHeading from '../CvHeading'

import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { formatDateRange, formatLinkDisplayValue } from './shared'
import { accentSoftFill } from '../../utils/templateAccents'
import { EDITORIAL_DEFAULT_ACCENT_COLOR } from './editorial'
import { renderExperienceEntry } from './directEditExperienceEntry'
import { cv } from '../../i18n/cv'

function SectionHead({ number, title }) {
  return (
    <div className="editorial-showcase__section-head">
      <span className="editorial-showcase__section-num" aria-hidden="true">
        {String(number).padStart(2, '0')}
      </span>
      <CvHeading as="h2" className="editorial-showcase__section-title">{title}</CvHeading>
    </div>
  )
}

function Section({ id, number, title, children }) {
  return (
    <section className="editorial-showcase__section" data-export-section={id} data-export-placement="main">
      <SectionHead number={number} title={title} />
      {children}
    </section>
  )
}

export default function EditorialShowcase({
  formData,
  locale = 'en',
  previewRef,
  paletteStyle = {},
  templateConfig,
  headingColor = null,
  accentColor = EDITORIAL_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || cv.t(locale, 'placeholders.name')
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

  const directEditMetaFields = [
    ['location', formData.location, cv.t(locale, 'contact.location')],
    ['email', formData.email, cv.t(locale, 'contact.email')],
    ['phone', formData.phone, cv.t(locale, 'contact.phone')],
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
  const sectionKeys = orderedSections.filter((key) => primarySet.has(key) && sectionVisibility[key])
  const sectionNumber = (key) => sectionKeys.indexOf(key) + 1

  const copy = {
    untitledRole: cv.t(locale, 'placeholders.untitledRole'),
    datesPending: cv.t(locale, 'placeholders.datesPending'),
    company: cv.t(locale, 'placeholders.company'),
    descriptionPlaceholder: cv.t(locale, 'placeholders.description'),
    about: cv.t(locale, 'sections.about'),
    experience: cv.t(locale, 'sections.experience'),
    education: cv.t(locale, 'sections.education'),
    skills: cv.t(locale, 'sections.skills'),
    projects: cv.t(locale, 'sections.projects'),
    links: cv.t(locale, 'sections.links'),
    languages: cv.t(locale, 'sections.languages'),
    certificates: cv.t(locale, 'sections.certificates'),
  }

  const renderSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" number={sectionNumber(key)} title={copy.about}>
          <p className="editorial-showcase__intro">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'about' }}
              value={formData.about}
              placeholder={cv.t(locale, 'placeholders.summary')}
              multiline
            />
          </p>
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" number={sectionNumber(key)} title={copy.experience}>
          <div className="editorial-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={cv.t(locale, 'add.experience')}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  classPrefix: 'editorial-showcase',
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                sourceIndex: snapshot.sourceIndices.experience[index],
                copy,
                classPrefix: 'editorial-showcase',
              }))
            ) : (
              <p className="editorial-showcase__empty">
                {cv.t(locale, 'empty.experience')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" number={sectionNumber(key)} title={copy.education}>
          <div className="editorial-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(' · ')

                return (
                  <div key={`${item.school}-${index}`} className="editorial-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                    <div className="editorial-showcase__entry-row">
                      <p className="editorial-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                      <p className="editorial-showcase__entry-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                    </div>
                    {metaLine ? <p className="editorial-showcase__entry-meta">{metaLine}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="editorial-showcase__empty">
                {cv.t(locale, 'empty.education')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" number={sectionNumber(key)} title={copy.skills}>
          {/* Three-way ternary rather than Classic Professional's persistent
              .tag-row wrapper: .tag-row's own margin-top (0.9rem) would stack
              with .empty's margin-top (0.8rem) if the empty state were nested
              inside it — flex-item margins don't collapse — adding an unwanted
              extra gap. Keeping the three states as fully separate branches
              avoids that regression while still guaranteeing mutual exclusion
              (a single chained ternary can only ever select one branch). */}
          {directEditDispatch ? (
            <div className="editorial-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={cv.t(locale, 'add.item')} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="editorial-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="editorial-showcase__tag tpl-chip-wrappable">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="editorial-showcase__empty">
              {cv.t(locale, 'empty.skills')}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" number={sectionNumber(key)} title={copy.projects}>
          <div className="editorial-showcase__entry-list">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="editorial-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="editorial-showcase__entry-role">{item.name}</p> : null}
                    {item.description ? <p className="editorial-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="editorial-showcase__tag-row">
                        {tags.map((tag) => (
                          <span key={tag} className="editorial-showcase__tag tpl-chip-wrappable">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="editorial-showcase__empty">
                {cv.t(locale, 'empty.projects')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      const linkEntries = Object.entries(snapshot.links)

      return (
        <Section key={key} id="links" number={sectionNumber(key)} title={copy.links}>
          <div className="editorial-showcase__plain-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="editorial-showcase__link-item tpl-value-breakable" data-export-card="true" title={value}>
                  {formatLinkDisplayValue(value)}
                </p>
              ))
            ) : (
              <p className="editorial-showcase__empty">
                {cv.t(locale, 'empty.links')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" number={sectionNumber(key)} title={copy.languages}>
          {snapshot.languages.length > 0 ? (
            <p className="editorial-showcase__language-row">
              {snapshot.languages.map((item, index) => (
                <span key={`${item.language}-${index}`} className="editorial-showcase__language-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  {index > 0 ? <span className="editorial-showcase__language-sep" aria-hidden="true">·</span> : null}
                  {item.language}
                  {item.level ? <> – {item.level}</> : null}
                </span>
              ))}
            </p>
          ) : (
            <p className="editorial-showcase__empty">
              {cv.t(locale, 'empty.languages')}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" number={sectionNumber(key)} title={copy.certificates}>
          <div className="editorial-showcase__plain-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <p key={`${item.name}-${index}`} className="editorial-showcase__cert-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {[item.name, item.issuer].filter(Boolean).join(' – ')}
                </p>
              ))
            ) : (
              <p className="editorial-showcase__empty">
                {cv.t(locale, 'empty.certificates')}
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
      data-export-variant="editorial"
      className="editorial-showcase preview-document--designer tpl-density-roomy"
      style={{
        ...paletteStyle,
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, EDITORIAL_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header className="editorial-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="editorial-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {cv.t(locale, 'kicker.template')}
          </p>
          <CvHeading as="h1" className="editorial-showcase__name" data-cv-name>
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={cv.t(locale, 'placeholders.name')}
            />
          </CvHeading>
          <p className="editorial-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={cv.t(locale, 'placeholders.title')}
            />
          </p>
          {directEditDispatch || metaItems.length > 0 ? (
            <div className="editorial-showcase__meta">
              {(directEditDispatch ? directEditMetaFields : metaItems).map(([key, value, placeholderLabel]) => (
                directEditDispatch ? (
                  <span key={key} className="editorial-showcase__meta-item">
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  </span>
                ) : (
                  <span key={key} className="editorial-showcase__meta-item">{value}</span>
                )
              ))}
              {directEditDispatch && linkedinUrl ? (
                <span className="editorial-showcase__meta-item">{formatLinkDisplayValue(linkedinUrl)}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="editorial-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="editorial-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      {/* Single accent rule under the masthead — a solid background colour
          rasterizes cleanly in PDF export, unlike a gradient (see the
          Creative Showcase's own stripe for the same reasoning). */}
      <div className="editorial-showcase__rule" aria-hidden="true" />

      <div className="editorial-showcase__body" data-export-content="true">
        {sectionKeys.map((key) => renderSection(key))}
      </div>
    </article>
  )
}
