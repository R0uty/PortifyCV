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

import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { formatDateRange, formatLinkDisplayValue } from './shared'
import { accentSoftFill } from '../../utils/templateAccents'
import { EDITORIAL_DEFAULT_ACCENT_COLOR } from './editorial'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function renderExperienceEntry(item, index, { directEditDispatch, copy }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []

  return (
    <div key={`${item.role}-${item.company}-${index}`} className="editorial-showcase__entry" data-export-card="true">
      <div className="editorial-showcase__entry-row">
        <p className="editorial-showcase__entry-role">
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
        <p className="editorial-showcase__entry-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch || item.company || item.location ? (
        <p className="editorial-showcase__entry-meta">
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
        <p className="editorial-showcase__bullets editorial-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="editorial-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function SectionHead({ number, title }) {
  return (
    <div className="editorial-showcase__section-head">
      <span className="editorial-showcase__section-num" aria-hidden="true">
        {String(number).padStart(2, '0')}
      </span>
      <h2 className="editorial-showcase__section-title">{title}</h2>
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
  templateConfig,
  headingColor = null,
  accentColor = EDITORIAL_DEFAULT_ACCENT_COLOR,
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
  const sectionNumber = (key) => sectionKeys.indexOf(key) + 1

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
        <Section key={key} id="about" number={sectionNumber(key)} title={copy.about}>
          <p className="editorial-showcase__intro">
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
        <Section key={key} id="experience" number={sectionNumber(key)} title={copy.experience}>
          <div className="editorial-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy }))
            ) : (
              <p className="editorial-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
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
                  <div key={`${item.school}-${index}`} className="editorial-showcase__entry" data-export-card="true">
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
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills" number={sectionNumber(key)} title={copy.skills}>
          {directEditDispatch ? (
            <div className="editorial-showcase__tag-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="editorial-showcase__tag-row">
              {snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="editorial-showcase__tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="editorial-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
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
                  <div key={`${item.name}-${index}`} className="editorial-showcase__entry" data-export-card="true">
                    {item.name ? <p className="editorial-showcase__entry-role">{item.name}</p> : null}
                    {item.description ? <p className="editorial-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="editorial-showcase__tag-row">
                        {tags.map((tag) => (
                          <span key={tag} className="editorial-showcase__tag">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="editorial-showcase__empty">
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
        <Section key={key} id="links" number={sectionNumber(key)} title={copy.links}>
          <div className="editorial-showcase__plain-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="editorial-showcase__link-item" data-export-card="true" title={value}>
                  {formatLinkDisplayValue(value)}
                </p>
              ))
            ) : (
              <p className="editorial-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
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
                <span key={`${item.language}-${index}`} className="editorial-showcase__language-item">
                  {index > 0 ? <span className="editorial-showcase__language-sep" aria-hidden="true">·</span> : null}
                  {item.language}
                  {item.level ? <> – {item.level}</> : null}
                </span>
              ))}
            </p>
          ) : (
            <p className="editorial-showcase__empty">
              {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
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
                <p key={`${item.name}-${index}`} className="editorial-showcase__cert-item">
                  {[item.name, item.issuer].filter(Boolean).join(' – ')}
                </p>
              ))
            ) : (
              <p className="editorial-showcase__empty">
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
      data-export-variant="editorial"
      className="editorial-showcase preview-document--designer tpl-density-roomy"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, EDITORIAL_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <header className="editorial-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="editorial-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="editorial-showcase__name">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'fullName' }}
              value={formData.fullName}
              placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
            />
          </h1>
          <p className="editorial-showcase__role">
            <EditableField
              as="span"
              path={{ kind: 'root', field: 'title' }}
              value={formData.title}
              placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
            />
          </p>
          {directEditDispatch || metaItems.length > 0 ? (
            <div className="editorial-showcase__meta">
              {(directEditDispatch ? directEditMetaFields : metaItems).map(([key, value, placeholderLabel]) => (
                directEditDispatch ? (
                  <EditableField
                    key={key}
                    as="span"
                    className="editorial-showcase__meta-item"
                    path={{ kind: 'root', field: key }}
                    value={value}
                    placeholder={placeholderLabel}
                  />
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
