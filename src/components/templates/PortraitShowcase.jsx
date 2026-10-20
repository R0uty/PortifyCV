// Portrait Showcase — the non-ATS visual mode for the Portrait template.
// Rendered by CVPreview.jsx instead of the shared generic renderer whenever
// variant === 'portrait' && !atsFriendlyMode. Shares the exact same CvData
// shape as every other template — this file only differs in presentation.
// ATS mode (the app's existing global toggle) bypasses this component
// entirely and falls back to the shared flat renderer (portrait.js).
//
// Design language (docs/template-design-system.md §5): opens a new
// `photo-rail + main` family. Every existing photo-capable template treats
// the photo as a modest circular avatar (largest today: Portfolio Hybrid's
// 7.75rem) alongside identity/section text in its rail. Portrait is the
// first to make the photo the structure itself — a full-height,
// full-bleed image with no crop-circle, no border, no text sharing the
// column — while identity and every section flow in the main column on
// the right. `rule-under` heading treatment (§4), deliberately quiet so
// the photo stays the focal point. One customizable accent (`--tpl-accent`)
// on the role line and section rules only.
//
// No-photo handling is a real design decision here, not an omission (most
// templates just skip the photo-wrap when there's none — Portrait can't,
// since its whole structure is built around that column): the rail
// becomes a solid accent-tinted panel carrying a large single-letter
// monogram instead, so it never reads as an empty hole.

import { useMemo } from 'react'
import CvHeading from '../CvHeading'

import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { formatDateRange, formatLinkDisplayValue } from './shared'
import { accentSoftFill } from '../../utils/templateAccents'
import { PORTRAIT_DEFAULT_ACCENT_COLOR } from './portrait'
import { renderExperienceEntry } from './directEditExperienceEntry'

function SectionHead({ title }) {
  return (
    <div className="portrait-showcase__section-head">
      <CvHeading as="h2" className="portrait-showcase__section-title">{title}</CvHeading>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <section className="portrait-showcase__section" data-export-section={id} data-export-placement="main">
      <SectionHead title={title} />
      {children}
    </section>
  )
}

export default function PortraitShowcase({
  formData,
  locale = 'en',
  previewRef,
  paletteStyle = {},
  templateConfig,
  headingColor = null,
  accentColor = PORTRAIT_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const photo = snapshot.photo
  const showPhoto = Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const monogram = fullName.trim().charAt(0).toUpperCase() || '?'

  const linkedinUrl = snapshot.links.linkedin
  const metaItems = [
    ['location', snapshot.location],
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['linkedin', linkedinUrl ? formatLinkDisplayValue(linkedinUrl) : ''],
  ].filter(([, value]) => value)

  const directEditMetaFields = [
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
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

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    about: isFinnish ? 'Esittely' : 'About',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    skills: isFinnish ? 'Taidot' : 'Skills',
    projects: isFinnish ? 'Projektit' : 'Projects',
    links: isFinnish ? 'Linkit' : 'Links',
    languages: isFinnish ? 'Kielet' : 'Languages',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
  }

  const renderSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" title={copy.about}>
          <p className="portrait-showcase__intro">
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
        <Section key={key} id="experience" title={copy.experience}>
          <div className="portrait-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  classPrefix: 'portrait-showcase',
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                sourceIndex: snapshot.sourceIndices.experience[index],
                copy,
                classPrefix: 'portrait-showcase',
              }))
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" title={copy.education}>
          <div className="portrait-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(' · ')

                return (
                  <div key={`${item.school}-${index}`} className="portrait-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                    <div className="portrait-showcase__entry-row">
                      <p className="portrait-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                      <p className="portrait-showcase__entry-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                    </div>
                    {metaLine ? <p className="portrait-showcase__entry-meta">{metaLine}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" title={copy.skills}>
          {/* Three-way ternary rather than one persistent .tag-row wrapper:
              .tag-row's own margin-top (0.9rem) would stack with .empty's
              margin-top (0.8rem) if the empty state were nested inside it —
              flex-item margins don't collapse — adding an unwanted extra
              gap. Keeping the three states as fully separate branches
              avoids that regression while still guaranteeing mutual
              exclusion (a single chained ternary can only ever select one
              branch). */}
          {directEditDispatch ? (
            <div className="portrait-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="portrait-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="portrait-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="portrait-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" title={copy.projects}>
          <div className="portrait-showcase__entry-list">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="portrait-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="portrait-showcase__entry-role">{item.name}</p> : null}
                    {item.description ? <p className="portrait-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="portrait-showcase__tag-row">
                        {tags.map((tag) => (
                          <span key={tag} className="portrait-showcase__tag">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      const linkEntries = Object.entries(snapshot.links)

      return (
        <Section key={key} id="links" title={copy.links}>
          <div className="portrait-showcase__plain-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="portrait-showcase__link-item tpl-value-breakable" data-export-card="true" title={value}>
                  {formatLinkDisplayValue(value)}
                </p>
              ))
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" title={copy.languages}>
          {snapshot.languages.length > 0 ? (
            <p className="portrait-showcase__language-row">
              {snapshot.languages.map((item, index) => (
                <span key={`${item.language}-${index}`} className="portrait-showcase__language-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  {index > 0 ? <span className="portrait-showcase__language-sep" aria-hidden="true"> · </span> : null}
                  {item.language}
                  {item.level ? <> – {item.level}</> : null}
                </span>
              ))}
            </p>
          ) : (
            <p className="portrait-showcase__empty">
              {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" title={copy.certificates}>
          <div className="portrait-showcase__plain-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <p key={`${item.name}-${index}`} className="portrait-showcase__cert-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {[item.name, item.issuer].filter(Boolean).join(' – ')}
                </p>
              ))
            ) : (
              <p className="portrait-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
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
      data-export-variant="portrait"
      // "preview-document--designer" is a pure marker class (no styling
      // rules of its own — see index.css) that ResumeBuilderPage's export
      // handler polls for via waitForPreviewModeSync before starting a PDF
      // export. This Showcase only ever renders in non-ATS mode, so it's
      // always "designer", never "ats". Without this class the export
      // handler polls forever waiting for a class that can never appear,
      // hanging the export.
      className="portrait-showcase preview-document--designer tpl-density-standard"
      style={{
        ...paletteStyle,
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, PORTRAIT_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <aside className="portrait-showcase__photo-col" data-export-secondary="true">
        {showPhoto ? (
          <img
            src={photo}
            alt={`${fullName} profile`}
            data-export-photo="true"
            className="portrait-showcase__photo"
          />
        ) : (
          <div className="portrait-showcase__monogram" aria-hidden="true">{monogram}</div>
        )}
      </aside>

      <main className="portrait-showcase__main" data-export-primary="true">
        <header className="portrait-showcase__header" data-export-header="true">
          <p className="portrait-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <CvHeading as="h1" className="portrait-showcase__name" data-cv-name>
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          </CvHeading>
          <p className="portrait-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          </p>
          {directEditDispatch || metaItems.length > 0 ? (
            <div className="portrait-showcase__meta">
              {(directEditDispatch ? directEditMetaFields : metaItems).map(([key, value, placeholderLabel]) => (
                directEditDispatch ? (
                  <span key={key} className="portrait-showcase__meta-item">
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  </span>
                ) : (
                  <span key={key} className="portrait-showcase__meta-item">{value}</span>
                )
              ))}
              {directEditDispatch && linkedinUrl ? (
                <span className="portrait-showcase__meta-item">{formatLinkDisplayValue(linkedinUrl)}</span>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="portrait-showcase__rule" aria-hidden="true" />

        <div className="portrait-showcase__body" data-export-content="true">
          {sectionKeys.map((key) => renderSection(key))}
        </div>
      </main>
    </article>
  )
}
