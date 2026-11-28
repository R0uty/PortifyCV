// Classic Professional Showcase — the non-ATS visual mode for the Classic
// Professional template. Rendered by CVPreview.jsx instead of the shared
// generic renderer whenever variant === 'classicProfessional' &&
// !atsFriendlyMode. Shares the exact same CvData shape as every other
// template — this file only differs in presentation. ATS mode (the app's
// existing global toggle) bypasses this component entirely and falls back
// to the shared flat renderer (classicProfessional.js).
//
// Design language: traditional single-column resume — white background,
// black/dark-gray typography only, no accent color, no sidebar, no photo.
// A large serif name (system serif, since the app's one self-hosted
// typeface is Inter — see classicProfessional.js's headerTitle comment)
// is the only visual flourish; everything else is thin 1px dividers and
// generous whitespace, per the "traditional and universally safe" brief.
//
// `nameAlignment` ('center' default | 'left') folds in the retired Classic
// template's left-aligned letterhead as one option (v1.2.10) — set via
// data-name-align, handled in classicProfessional.css.

import { useMemo } from 'react'
import CvHeading from '../CvHeading'

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder } from '../../utils/cvForm'
import {
  contactIcons,
  devIcons,
  formatDateRange,
  formatLinkDisplayValue,
  kickerText,
} from './shared'
import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import { renderExperienceEntry } from './directEditExperienceEntry'
import { cv } from '../../i18n/cv'

function Section({ id, children }) {
  return (
    <section className="classic-professional-showcase__section" data-export-section={id} data-export-placement="main">
      {children}
    </section>
  )
}

export default function ClassicProfessionalShowcase({
  formData,
  locale = 'en',
  previewRef,
  paletteStyle = {},
  templateConfig,
  headingColor = null,
  nameAlignment = 'center',
  directEditDispatch = null,
}) {
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const contactItems = [
    ['phone', snapshot.phone],
    ['email', snapshot.email],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const linkedinUrl = snapshot.links.linkedin
  const directEditContactFields = [
    ['phone', formData.phone, cv.t(locale, 'contact.phone')],
    ['email', formData.email, cv.t(locale, 'contact.email')],
    ['location', formData.location, cv.t(locale, 'contact.location')],
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
    untitledRole: cv.t(locale, 'placeholders.untitledRole'),
    datesPending: cv.t(locale, 'placeholders.datesPending'),
    company: cv.t(locale, 'placeholders.company'),
    descriptionPlaceholder: cv.t(locale, 'placeholders.description'),
    summary: cv.t(locale, 'sections.professionalSummary'),
    experience: cv.t(locale, 'sections.experience'),
    education: cv.t(locale, 'sections.education'),
    skills: cv.t(locale, 'sections.skills'),
    languages: cv.t(locale, 'sections.languages'),
    certificates: cv.t(locale, 'sections.certifications'),
  }

  const renderSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about">
          <CvHeading as="h2" className="classic-professional-showcase__heading">{copy.summary}</CvHeading>
          <p className="classic-professional-showcase__summary">
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
        <Section key={key} id="experience">
          <CvHeading as="h2" className="classic-professional-showcase__heading">{copy.experience}</CvHeading>
          <div className="classic-professional-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={cv.t(locale, 'add.experience')}
              >
                {(item, index) => renderExperienceEntry(item, index, {
                  directEditDispatch,
                  copy,
                  classPrefix: 'classic-professional-showcase',
                  separator: ', ',
                })}
              </EditableList>
            ) : snapshot.experience.length > 0 ? (
              snapshot.experience.map((item, index) => renderExperienceEntry(item, index, {
                directEditDispatch,
                sourceIndex: snapshot.sourceIndices.experience[index],
                copy,
                classPrefix: 'classic-professional-showcase',
                separator: ', ',
              }))
            ) : (
              <p className="classic-professional-showcase__empty">
                {cv.t(locale, 'empty.experience')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education">
          <CvHeading as="h2" className="classic-professional-showcase__heading">{copy.education}</CvHeading>
          <div className="classic-professional-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(', ')

                return (
                  <div key={`${item.school}-${index}`} className="classic-professional-showcase__entry" data-export-card="true" data-direct-edit-index={snapshot.sourceIndices.education[index]}>
                    <div className="classic-professional-showcase__entry-row">
                      <p className="classic-professional-showcase__entry-role">{item.degree || copy.untitledRole}</p>
                      <p className="classic-professional-showcase__entry-dates">{formatDateRange(item.startDate, item.endDate)}</p>
                    </div>
                    {metaLine ? <p className="classic-professional-showcase__entry-meta">{metaLine}</p> : null}
                  </div>
                )
              })
            ) : (
              <p className="classic-professional-showcase__empty">
                {cv.t(locale, 'empty.education')}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills">
          <CvHeading as="h2" className="classic-professional-showcase__heading">{copy.skills}</CvHeading>
          <div className="classic-professional-showcase__tag-row">
            {directEditDispatch ? null : snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="classic-professional-showcase__tag">{skill}</span>
              ))
            ) : (
              <p className="classic-professional-showcase__empty">
                {cv.t(locale, 'empty.skills')}
              </p>
            )}
            {directEditDispatch ? (
              <EditableChip skills={formData.skills} addLabel={cv.t(locale, 'add.item')} />
            ) : null}
          </div>
        </Section>
      )
    }

    if (key === 'languages') {
      return (
        <Section key={key} id="languages">
          <CvHeading as="h2" className="classic-professional-showcase__heading">{copy.languages}</CvHeading>
          {snapshot.languages.length > 0 ? (
            <p className="classic-professional-showcase__language-row">
              {snapshot.languages.map((item, index) => (
                <span key={`${item.language}-${index}`} className="classic-professional-showcase__language-item" data-direct-edit-index={snapshot.sourceIndices.languages[index]}>
                  {index > 0 ? <span className="classic-professional-showcase__language-sep" aria-hidden="true">|</span> : null}
                  {item.language}
                  {item.level ? <> – {item.level}</> : null}
                </span>
              ))}
            </p>
          ) : (
            <p className="classic-professional-showcase__empty">
              {cv.t(locale, 'empty.languages')}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates">
          <CvHeading as="h2" className="classic-professional-showcase__heading">{copy.certificates}</CvHeading>
          <div className="classic-professional-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <p key={`${item.name}-${index}`} className="classic-professional-showcase__cert-item" data-direct-edit-index={snapshot.sourceIndices.certificates[index]}>
                  {[item.name, item.issuer].filter(Boolean).join(' – ')}
                </p>
              ))
            ) : (
              <p className="classic-professional-showcase__empty">
                {cv.t(locale, 'empty.certifications')}
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
      data-export-variant="classicProfessional"
      data-name-align={nameAlignment === 'left' ? 'left' : 'center'}
      // "preview-document--designer" is a pure marker class (no styling
      // rules of its own — see index.css) that ResumeBuilderPage's export
      // handler polls for via waitForPreviewModeSync before starting a PDF
      // export. This Showcase only ever renders in non-ATS mode, so it's
      // always "designer", never "ats". Without this class the export
      // handler polls forever waiting for a class that can never appear,
      // hanging the export.
      className="classic-professional-showcase preview-document--designer tpl-density-roomy"
      style={{ ...paletteStyle, ...(headingColor ? { '--cv-heading-color': headingColor } : null) }}
    >
      <header data-export-header="true" className="classic-professional-showcase__header">
        <p className="classic-professional-showcase__kicker" data-export-ignore="true">
          {kickerText(locale, templateConfig.label)}
        </p>
        <CvHeading as="h1" className="classic-professional-showcase__name" data-cv-name>
          <EditableField
            as="span"
            path={{ kind: 'root', field: 'fullName' }}
            value={formData.fullName}
            placeholder={cv.t(locale, 'placeholders.name')}
          />
        </CvHeading>
        <p className="classic-professional-showcase__role">
          <EditableField
            as="span"
            path={{ kind: 'root', field: 'title' }}
            value={formData.title}
            placeholder={cv.t(locale, 'placeholders.title')}
          />
        </p>
        {directEditDispatch || contactItems.length > 0 || linkedinUrl ? (
          <div className="classic-professional-showcase__contact">
            {(directEditDispatch ? directEditContactFields : contactItems).map(([key, value, placeholderLabel]) => (
              <span key={key} className="classic-professional-showcase__contact-item">
                <span className="classic-professional-showcase__contact-icon" aria-hidden="true">{contactIcons[key]}</span>
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
            {linkedinUrl ? (
              <span className="classic-professional-showcase__contact-item">
                <span className="classic-professional-showcase__contact-icon" aria-hidden="true">{devIcons.linkedin}</span>
                {formatLinkDisplayValue(linkedinUrl)}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="classic-professional-showcase__header-divider" aria-hidden="true" />

      <div className="classic-professional-showcase__body" data-export-content="true">
        {sectionKeys.map((key) => renderSection(key))}
      </div>
    </article>
  )
}
