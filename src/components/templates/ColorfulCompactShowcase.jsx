// Colorful Compact Showcase — the non-ATS visual mode for the Colorful
// Compact template. Rendered by CVPreview.jsx instead of the shared generic
// renderer whenever variant === 'colorfulCompact' && !atsFriendlyMode.
// Shares the exact same CvData shape as every other template — this file
// only differs in presentation.
//
// Built against docs/Colorfull-compact.png (a hand-mocked reference
// screenshot, not markup like some other templates' docs/*.html references
// — colors/spacing below are eyeballed off that image). Dark full-bleed
// header (two-tone name, dot-marked contact line, gradient-ringed photo)
// framed top and bottom by a plain (non-repeating) rainbow gradient bar —
// see CreativeShowcase.jsx's STRIPE_SEGMENTS comment for why a *repeating*
// linear-gradient is unsafe for html2canvas; a single multi-stop
// linear-gradient bar like this one doesn't hit that bug (confirmed already
// in production by portfolio.css's header hairline).
//
// Colour is the one visual idea this template is built around, so it is the
// single template allowed more than one accent — but only under the design
// system's capped exception (§3): a fixed, named six-swatch palette, one hue
// assigned per *section*, in order. Never per skill chip, per project card
// or per bullet — everything decorative inside a section takes that
// section's one colour. There is no user-customizable accentColor prop.
// (Polished v1.2.12: the 7th/8th hues — yellow, charcoal — retired, and the
// per-item colour cycles collapsed to the section colour; compact type ramp
// adopted.)

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { formatDateRange, formatLinkDisplayValue, createSectionRouter } from './shared'
import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'

// The capped, named palette (design-system §3). Assigned by running section
// position (main sections first, then sidebar), wrapping after six. Order
// matches the spec's table: pink, orange, green, teal, blue, purple.
const SECTION_COLORS = ['pink', 'orange', 'green', 'teal', 'blue', 'purple']

// Fixed single colour for the dark header's contact dots — matches the
// two-tone name's accent half. Not a section, so not part of the cycle.
const HEADER_ACCENT = 'orange'

function splitToBullets(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function colorAt(cycle, index) {
  return cycle[index % cycle.length]
}

// Colorful Compact's own Experience-entry renderer — not
// directEditExperienceEntry.jsx: role and the company/location meta line
// nest together in one `min-w-0` div with the date as its sibling, the
// same shape as Creative's. Only role and company are editable inline;
// location stays read-only-appended text. `index` is formData-relative in
// the directEditDispatch branch (EditableList's own index); the read-only
// call site passes the snapshot's `sourceIndex` for data-direct-edit-index.
//
// First/last spacing is driven by isFirst/isLast modifier classes, never
// :first-child/:last-child — EditableList wraps each entry in its own
// .direct-edit-entry div, which makes every row a first AND last child.
function renderExperienceEntry(item, index, { directEditDispatch, copy, color, isFirst, isLast, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = item.description ? splitToBullets(item.description) : []
  const metaLine = [item.company, item.location].filter(Boolean).join(' · ')
  const rowClassName = [
    'colorful-compact-showcase__exp-row',
    isFirst ? 'colorful-compact-showcase__exp-row--first' : '',
    isLast ? 'colorful-compact-showcase__exp-row--last' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      data-direct-edit-index={sourceIndex}
      key={`${item.role}-${item.company}-${index}`}
      className={rowClassName}
      data-export-card="true"
    >
      <div className="colorful-compact-showcase__exp-head">
        <div className="min-w-0">
          <p className="colorful-compact-showcase__exp-role">
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
            <p className="colorful-compact-showcase__exp-meta">
              <EditableField
                as="span"
                path={{ kind: 'arrayItem', section: 'experience', index, field: 'company' }}
                value={item.company}
                placeholder={copy.company}
              />
              {item.location ? ` · ${item.location}` : null}
            </p>
          ) : metaLine ? <p className="colorful-compact-showcase__exp-meta">{metaLine}</p> : null}
        </div>
        <p className={`colorful-compact-showcase__exp-date colorful-compact-showcase__exp-date--${color}`}>
          {dateRange || copy.datesPending}
        </p>
      </div>
      {directEditDispatch ? (
        <p className="colorful-compact-showcase__bullets colorful-compact-showcase__bullets--editing">
          <EditableField
            as="span"
            path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
            value={item.description}
            placeholder={copy.descriptionPlaceholder}
            multiline
          />
        </p>
      ) : bullets.length > 0 ? (
        <ul className="colorful-compact-showcase__bullets">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function SectionHead({ title, color }) {
  return (
    <div className="colorful-compact-showcase__section-head">
      <span
        className={`colorful-compact-showcase__section-dot colorful-compact-showcase__section-dot--${color}`}
        aria-hidden="true"
      />
      <h2 className={`colorful-compact-showcase__section-title colorful-compact-showcase__section-title--${color}`}>
        {title}
      </h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, title, color, children }) {
  return (
    <section className="colorful-compact-showcase__section" data-export-section={id} data-export-placement={placement} data-moved-from={movedFrom ?? undefined}>
      <SectionHead title={title} color={color} />
      {children}
    </section>
  )
}

export default function ColorfulCompactShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const spaceIndex = fullName.indexOf(' ')
  const nameFirst = spaceIndex === -1 ? fullName : fullName.slice(0, spaceIndex)
  const nameRest = spaceIndex === -1 ? '' : fullName.slice(spaceIndex + 1)
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Professional Title')
  const tagline = snapshot.tagline
  const photo = snapshot.photo
  const showPhoto = Boolean(photo) && isPhotoVisibleForTemplate(
    formData.photoVisibilityByTemplate,
    templateConfig.id,
  )
  const about = snapshot.about
    || (isFinnish
      ? 'Ammatillinen yhteenvetosi näkyy tässä, kun täytät CV-lomaketta.'
      : 'Your professional summary will appear here as you fill out the CV form.')

  const websiteUrl = snapshot.links.website
  const contactItems = [
    ['email', snapshot.email],
    ['location', snapshot.location],
    ['phone', snapshot.phone],
    ['website', websiteUrl],
  ].filter(([, value]) => value)
  // Direct Edit shows every contact slot, empty or not, in the read-only
  // order. The website is a link field (links.website), not a root one.
  const directEditContactFields = [
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email', 'root'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location', 'root'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone', 'root'],
    ['website', formData.links.website, isFinnish ? 'Verkkosivusto' : 'Website', 'link'],
  ]

  const linkEntries = Object.entries(snapshot.links)

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
    about: isFinnish ? 'Tietoa minusta' : 'About',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    projects: isFinnish ? 'Projektit' : 'Projects',
    skills: isFinnish ? 'Taidot' : 'Skills',
    education: isFinnish ? 'Koulutus' : 'Education',
    languages: isFinnish ? 'Kielet' : 'Languages',
    links: isFinnish ? 'Linkit' : 'Links',
    achievements: isFinnish ? 'Lisätiedot' : 'Extras',
  }

  const renderMainSection = (key, placement, movedFrom, color) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} title={copy.about} color={color}>
          <p className="colorful-compact-showcase__summary">
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
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} title={copy.experience} color={color}>
          <div className="colorful-compact-showcase__exp-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  color,
                  isFirst: index === 0,
                  isLast: index === formData.experience.length - 1,
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) =>
                renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  color,
                  isFirst: index === 0,
                  isLast: index === snapshot.experience.length - 1,
                  sourceIndex: snapshot.sourceIndices.experience[index],
                }),
              )
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom} title={copy.projects} color={color}>
          <div className="colorful-compact-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="colorful-compact-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="colorful-compact-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="colorful-compact-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="colorful-compact-showcase__tag-row">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`colorful-compact-showcase__tag colorful-compact-showcase__tag--${color}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, placement, movedFrom, color) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} title={copy.skills} color={color}>
          {directEditDispatch ? (
            // Chips replace the read-only pills outright (never both, or
            // every skill renders twice); the empty-state <p> stays out of
            // the chip row, matching Executive.
            <div className="colorful-compact-showcase__skill-row">
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            </div>
          ) : snapshot.skills.length > 0 ? (
            <div className="colorful-compact-showcase__skill-row">
              {snapshot.skills.map((skill) => (
                <span
                  key={skill}
                  data-export-skill="true"
                  className={`colorful-compact-showcase__skill-pill colorful-compact-showcase__skill-pill--${color}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="colorful-compact-showcase__empty">
              {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} title={copy.education} color={color}>
          <div className="colorful-compact-showcase__plain-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(' · ')
                const dateRange = formatDateRange(item.startDate, item.endDate)

                return (
                  <div key={`${item.school}-${index}`} className="colorful-compact-showcase__plain-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                    <p className="colorful-compact-showcase__plain-title">{item.degree || copy.untitledRole}</p>
                    {metaLine || dateRange ? (
                      <p className="colorful-compact-showcase__plain-meta">
                        {[metaLine, dateRange].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} title={copy.languages} color={color}>
          <div className="colorful-compact-showcase__lang-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <div key={`${item.language}-${index}`} className="colorful-compact-showcase__lang-row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  <span className="colorful-compact-showcase__lang-name">{item.language}</span>
                  {item.level ? (
                    <span
                      className={`colorful-compact-showcase__lang-badge colorful-compact-showcase__lang-badge--${color}`}
                    >
                      {item.level}
                    </span>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom} title={copy.links} color={color}>
          <div className="colorful-compact-showcase__plain-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="colorful-compact-showcase__link-item tpl-value-breakable" data-export-card="true" title={value}>
                  {formatLinkDisplayValue(value)}
                </p>
              ))
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'achievements') {
      return (
        <Section key={key} id="achievements" placement={placement} movedFrom={movedFrom} title={copy.achievements} color={color}>
          <div className="colorful-compact-showcase__plain-list">
            {snapshot.achievements.length > 0 ? (
              snapshot.achievements.map((item, index) => (
                <p key={`${item.title}-${index}`} className="colorful-compact-showcase__extra-line" data-direct-edit-index={snapshot.sourceIndices.achievements[index]}>
                  {item.description ? `${item.title} — ${item.description}` : item.title}
                </p>
              ))
            ) : (
              <p className="colorful-compact-showcase__empty">
                {isFinnish ? 'Lisätiedot näkyvät tässä.' : 'Extras will appear here.'}
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
      data-export-variant="colorfulCompact"
      className="colorful-compact-showcase preview-document--designer tpl-density-compact"
    >
      <div className="colorful-compact-showcase__rainbow colorful-compact-showcase__rainbow--top" aria-hidden="true" />

      <header className="colorful-compact-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="colorful-compact-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          {/* The two-tone split can't live inside one contentEditable field,
              so Direct Edit shows the whole name as one field (in the lead
              colour — see colorfulCompact.css), like Modern Timeline. */}
          <h1 className="colorful-compact-showcase__name" data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : (
              <>
                <span className="colorful-compact-showcase__name-lead">{nameFirst}</span>
                {nameRest ? <> <span className="colorful-compact-showcase__name-accent">{nameRest}</span></> : null}
              </>
            )}
          </h1>
          <p className="colorful-compact-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
            {tagline ? ` · ${tagline}` : ''}
          </p>
          {directEditDispatch || contactItems.length > 0 ? (
            <div className="colorful-compact-showcase__contact">
              {(directEditDispatch ? directEditContactFields : contactItems).map(([key, value, placeholderLabel, pathKind]) => (
                <span key={key} className="colorful-compact-showcase__contact-item">
                  <span
                    className={`colorful-compact-showcase__contact-dot colorful-compact-showcase__contact-dot--${HEADER_ACCENT}`}
                    aria-hidden="true"
                  />
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: pathKind, field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : key === 'website' ? formatLinkDisplayValue(value) : value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="colorful-compact-showcase__photo-ring">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="colorful-compact-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      <div className="colorful-compact-showcase__body" data-export-content="true">
        <main className="colorful-compact-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key, index) => renderSection(key, 'main', colorAt(SECTION_COLORS, index)))}
        </main>

        <aside className="colorful-compact-showcase__sidebar" data-export-secondary="true">
          {sidebarSectionKeys.map((key, index) =>
            renderSection(key, 'side', colorAt(SECTION_COLORS, mainSectionKeys.length + index)))}
        </aside>
      </div>

      <div className="colorful-compact-showcase__rainbow colorful-compact-showcase__rainbow--bottom" aria-hidden="true" />
    </article>
  )
}
