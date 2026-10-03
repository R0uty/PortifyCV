// Creative Showcase — the non-ATS "Showcase" visual mode for the Creative
// template. Rendered by CVPreview.jsx instead of the shared generic renderer
// whenever variant === 'creative' && !atsFriendlyMode. Shares the exact same
// CvData shape as every other template — this file only differs in
// presentation. ATS mode (the app's existing global toggle) bypasses this
// component entirely and falls back to the shared flat renderer (creative.js).
//
// Reworked 2026-09-10 to the house design system (docs/template-design-system.md):
//   - Section headings moved onto the §4 `numbered` treatment (a two-digit
//     ordinal in the accent, running once through the whole document, main
//     column then sidebar) — replacing the previous off-menu bold
//     sentence-case title + italic subtitle, which scored 0 on structural
//     clarity.
//   - Colour collapsed to §3: one ink (+ two muted steps), one accent read
//     from `--tpl-accent` (with a JS-computed soft fill in `--tpl-accent-soft`),
//     and the cream page / tan sidebar as the single neutral tint. The old
//     five-colour accent system (coral / teal / violet / gold + five pastel
//     tag tints + a four-colour stripe + alternating card borders) is gone.
//   - Type sizes read the shared `--tpl-*` ramp via the `tpl-density-roomy`
//     class on the root; the name is no longer two-tone.
//   - Accent is user-customizable via the Settings swatch (`accentColor`
//     prop, warmCoral swatch set — see cvTemplates.js / templateAccents.js).
// Structure (right-rail + main), the decorative export-ignored blobs, the
// bordered entry cards and the section order are unchanged.

import { useMemo } from 'react'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder, isPhotoVisibleForTemplate } from '../../utils/cvForm'
import { parseSkillCategories, formatDateRange, formatLinkDisplayValue, createSectionRouter } from './shared'
import { accentSoftFill, accentInkMix } from '../../utils/templateAccents'
import { CREATIVE_DEFAULT_ACCENT_COLOR } from './creative'
import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import { getExperienceBullets, getExperienceAchievements, getExperienceTechnologies } from './directEditExperienceEntry'

// Creative's own Experience-entry renderer — deliberately NOT
// directEditExperienceEntry.jsx (the shared module for Classic
// Professional/Editorial/Portrait). Creative's read-only shape nests role
// AND the company/location meta line together inside one `min-w-0` div,
// with dates as a sibling of THAT div (not of role directly) — the same
// structural shape Executive (Round 6) has, genuinely different from the
// shared module's flat two-children entry-row. Only role and company are
// independently editable, matching the shared module's own precedent —
// location stays read-only-appended text. `index` is always
// formData.experience-relative (only ever read inside
// directEditDispatch-gated branches below) — never assume it lines up
// with snapshot.experience's own (filtered) indices in the read-only
// call site.
function renderExperienceEntry(item, index, { directEditDispatch, copy, sourceIndex = index }) {
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const bullets = getExperienceBullets(item)
  const achievements = getExperienceAchievements(item)
  const technologies = getExperienceTechnologies(item)

  return (
    <div
      key={`${item.role}-${item.company}-${index}`}
      className="creative-showcase__exp-card"
      data-export-card="true"
      data-direct-edit-index={sourceIndex}
    >
      <div className="creative-showcase__exp-row">
        <div className="min-w-0">
          <p className="creative-showcase__exp-role">
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
            <p className="creative-showcase__exp-company">
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
        </div>
        <p className="creative-showcase__exp-dates">{dateRange || copy.datesPending}</p>
      </div>
      {directEditDispatch ? (
        <>
          <p className="creative-showcase__exp-desc creative-showcase__exp-desc--editing">
            <EditableField
              as="span"
              path={{ kind: 'arrayItem', section: 'experience', index, field: 'description' }}
              value={item.description}
              placeholder={copy.descriptionPlaceholder}
              multiline
            />
          </p>
          {achievements.length > 0 ? (
            <ul className="creative-showcase__exp-desc">
              {achievements.map((line, lineIndex) => (
                <li key={lineIndex}>{line}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : bullets.length > 0 ? (
        <ul className="creative-showcase__exp-desc">
          {bullets.map((line, lineIndex) => (
            <li key={lineIndex}>{line}</li>
          ))}
        </ul>
      ) : null}
      {technologies.length > 0 ? (
        <p className="creative-showcase__exp-company">{technologies.join(' · ')}</p>
      ) : null}
    </div>
  )
}

function SectionHead({ number, title }) {
  return (
    <div className="creative-showcase__section-head">
      <span className="creative-showcase__section-num" aria-hidden="true">
        {String(number).padStart(2, '0')}
      </span>
      <h2 className="creative-showcase__section-title">{title}</h2>
    </div>
  )
}

function Section({ id, placement, movedFrom = null, number, title, children }) {
  return (
    <section
      className="creative-showcase__section"
      data-export-section={id}
      data-export-placement={placement}
      data-moved-from={movedFrom ?? undefined}
    >
      <SectionHead number={number} title={title} />
      {children}
    </section>
  )
}

export default function CreativeShowcase({
  formData,
  locale = 'en',
  previewRef,
  templateConfig,
  headingColor = null,
  accentColor = CREATIVE_DEFAULT_ACCENT_COLOR,
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const fullName = snapshot.fullName || (isFinnish ? 'Nimesi' : 'Your Name')
  const title = snapshot.title || (isFinnish ? 'Ammattinimike' : 'Creative Problem Solver')
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

  const personalContactItems = [
    ['email', snapshot.email],
    ['phone', snapshot.phone],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const directEditContactFields = [
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
  ]

  const linkEntries = Object.entries(snapshot.links)
  // Flattened, not grouped by category — the "Toolkit" pill row has no
  // category labels above it.
  const flatSkills = useMemo(
    () => parseSkillCategories(snapshot.skills, isFinnish).flatMap((cat) => cat.items),
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

  // One running ordinal for the `numbered` heading treatment — main column
  // first, then sidebar, so it reads as a single editorial index of the
  // whole document rather than restarting per column.
  const numberedKeys = [...mainSectionKeys, ...sidebarSectionKeys]
  const sectionNumber = (key) => numberedKeys.indexOf(key) + 1

  const copy = {
    untitledRole: isFinnish ? 'Nimeämätön rooli' : 'Untitled role',
    company: isFinnish ? 'Yritys' : 'Company',
    descriptionPlaceholder: isFinnish ? 'Kuvaus' : 'Description',
    datesPending: isFinnish ? 'Päivämäärät puuttuvat' : 'Dates pending',
    about: isFinnish ? 'Hei' : 'Hello',
    experience: isFinnish ? 'Työ' : 'Work',
    projects: isFinnish ? 'Projektit' : 'Projects',
    education: isFinnish ? 'Koulutus' : 'School',
    skills: isFinnish ? 'Työkalut' : 'Toolkit',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certificates',
    links: isFinnish ? 'Löydä minut' : 'Find me',
    languages: isFinnish ? 'Kielet' : 'Languages',
    interests: isFinnish ? 'Kiinnostuksen kohteet' : 'Interests',
  }

  const renderMainSection = (key, placement = 'main', movedFrom = null) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.about}>
          <p className="creative-showcase__intro">
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
          {snapshot.coreStrengths.length > 0 ? (
            <div className="creative-showcase__pill-row">
              {snapshot.coreStrengths.slice(0, 3).map((item, index) => (
                item.title ? (
                  <span key={`${item.title}-${index}`} className="creative-showcase__pill" data-direct-edit-index={snapshot.sourceIndices.coreStrengths[index]}>
                    {item.title}
                  </span>
                ) : null
              ))}
            </div>
          ) : null}
        </Section>
      )
    }

    if (key === 'experience') {
      return (
        <Section key={key} id="experience" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.experience}>
          <div className="creative-showcase__exp-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
              >
                {(item, index) => renderExperienceEntry(item, index, { directEditDispatch, copy })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) =>
                renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  sourceIndex: snapshot.sourceIndices.experience[index],
                }),
              )
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'projects') {
      return (
        <Section key={key} id="projects" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.projects}>
          <div className="creative-showcase__project-grid">
            {snapshot.projects.length > 0 ? (
              snapshot.projects.map((item, index) => {
                const tags = item.stack
                  ? item.stack.split(',').map((tag) => tag.trim()).filter(Boolean)
                  : []

                return (
                  <div key={`${item.name}-${index}`} className="creative-showcase__project-card" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.projects[index]}>
                    {item.name ? <p className="creative-showcase__project-name">{item.name}</p> : null}
                    {item.description ? <p className="creative-showcase__project-desc">{item.description}</p> : null}
                    {tags.length > 0 ? (
                      <div className="creative-showcase__tag-row">
                        {tags.map((tag) => (
                          <span key={tag} className="creative-showcase__tag">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Projektit näkyvät tässä.' : 'Projects will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    return null
  }

  const renderSidebarSection = (key, placement = 'side', movedFrom = null) => {
    if (key === 'skills') {
      return (
        <Section key={key} id="skills" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.skills}>
          <div className="creative-showcase__pill-row">
            {directEditDispatch ? null : flatSkills.length > 0 ? (
              flatSkills.map((skill) => (
                <span key={skill} data-export-skill="true" className="creative-showcase__pill">
                  {skill}
                </span>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Taidot näkyvät tässä.' : 'Skills will appear here.'}
              </p>
            )}
            {directEditDispatch ? (
              <EditableChip skills={formData.skills} addLabel={isFinnish ? '+ Lisää' : '+ Add'} />
            ) : null}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.education}>
          <div className="creative-showcase__plain-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => (
                <div key={`${item.school}-${index}`} className="creative-showcase__plain-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                  <p className="creative-showcase__plain-title">{item.degree}</p>
                  {item.school || item.location ? (
                    <p className="creative-showcase__plain-meta">
                      {[item.school, item.location].filter(Boolean).join(' · ')}
                      {formatDateRange(item.startDate, item.endDate) ? ` · ${formatDateRange(item.startDate, item.endDate)}` : ''}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.certificates}>
          <div className="creative-showcase__plain-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <div key={`${item.name}-${index}`} className="creative-showcase__plain-item" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {item.name ? <p className="creative-showcase__plain-title">{item.name}</p> : null}
                  {item.issuer || item.year ? (
                    <p className="creative-showcase__plain-meta">
                      {[item.issuer, item.year].filter(Boolean).join(', ')}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Sertifikaatit näkyvät tässä.' : 'Certificates will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'links') {
      return (
        <Section key={key} id="links" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.links}>
          <div className="creative-showcase__arrow-list">
            {linkEntries.length > 0 ? (
              linkEntries.map(([linkKey, value]) => (
                <p key={linkKey} className="creative-showcase__arrow-item tpl-value-breakable" data-export-card="true" title={value}>
                  <span className="creative-showcase__arrow" aria-hidden="true">&rarr;</span>
                  {formatLinkDisplayValue(value)}
                </p>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Linkit näkyvät tässä.' : 'Links will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.languages}>
          <div className="creative-showcase__plain-list">
            {snapshot.languages.length > 0 ? (
              snapshot.languages.map((item, index) => (
                <p key={`${item.language}-${index}`} className="creative-showcase__lang-row" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  {item.language}
                  {item.level ? <span className="creative-showcase__lang-level"> {item.level}</span> : null}
                </p>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'interests') {
      return (
        <Section key={key} id="interests" placement={placement} movedFrom={movedFrom} number={sectionNumber(key)} title={copy.interests}>
          <div className="creative-showcase__pill-row">
            {snapshot.interests.length > 0 ? (
              snapshot.interests.map((item, index) => (
                <span key={`${item.name}-${index}`} className="creative-showcase__tag" data-direct-edit-index={snapshot.sourceIndices.interests[index]}>
                  {item.name}
                </span>
              ))
            ) : (
              <p className="creative-showcase__empty">
                {isFinnish ? 'Kiinnostuksen kohteet näkyvät tässä.' : 'Interests will appear here.'}
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
      data-export-variant="creative"
      className="creative-showcase preview-document--designer tpl-density-roomy"
      style={{
        '--tpl-accent': accentColor,
        '--tpl-accent-soft': accentSoftFill(accentColor, 0.12, CREATIVE_DEFAULT_ACCENT_COLOR),
        // The kicker's accent, darkened 25% toward --cr-ink (#1a1a1a) so every
        // swatch clears 4.5:1 on the peach page — see creative.css.
        '--cr-kicker': accentInkMix(accentColor, '#1a1a1a', 0.25, CREATIVE_DEFAULT_ACCENT_COLOR),
        ...(headingColor ? { '--cv-heading-color': headingColor } : null),
      }}
    >
      <div className="creative-showcase__bg" data-export-ignore="true" data-decorative aria-hidden="true">
        <span className="creative-showcase__blob creative-showcase__blob--top" />
        <span className="creative-showcase__blob creative-showcase__blob--bottom" />
      </div>

      <header className="creative-showcase__header" data-export-header="true">
        <div className="min-w-0">
          <p className="creative-showcase__kicker" data-export-ignore="true">
            {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
          </p>
          <h1 className="creative-showcase__name" data-cv-name>
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'fullName' }}
                value={formData.fullName}
                placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
              />
            ) : fullName}
          </h1>
          <p className="creative-showcase__role">
            {directEditDispatch ? (
              <EditableField
                as="span"
                path={{ kind: 'root', field: 'title' }}
                value={formData.title}
                placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
              />
            ) : title}
          </p>
          {tagline ? <p className="creative-showcase__tagline">{tagline}</p> : null}
          {directEditDispatch || personalContactItems.length > 0 ? (
            <div className="creative-showcase__contact">
              {(directEditDispatch ? directEditContactFields : personalContactItems).map(([key, value, placeholderLabel]) => (
                <span key={key} className="creative-showcase__contact-item">
                  {directEditDispatch ? (
                    <EditableField
                      as="span"
                      path={{ kind: 'root', field: key }}
                      value={value}
                      placeholder={placeholderLabel}
                    />
                  ) : value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showPhoto ? (
          <div className="creative-showcase__photo-wrap">
            <img
              src={photo}
              alt={`${fullName} profile`}
              data-export-photo="true"
              className="creative-showcase__photo"
            />
          </div>
        ) : null}
      </header>

      {/* Single accent rule under the header — a real brand element the
          exported PDF keeps (a solid background colour rasterizes fine,
          unlike the repeating-linear-gradient an earlier version used). */}
      <div className="creative-showcase__stripe" aria-hidden="true" />

      <div className="creative-showcase__body" data-export-content="true">
        <main className="creative-showcase__main" data-export-primary="true">
          {mainSectionKeys.map((key) => renderSection(key, 'main'))}
        </main>

        <aside className="creative-showcase__sidebar" data-export-secondary="true">
          {sidebarSectionKeys.map((key) => renderSection(key, 'side'))}
        </aside>
      </div>
    </article>
  )
}
