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

import { createCvSnapshot } from '../../utils/cvSnapshot'
import { createSectionVisibility, normalizeSectionOrder } from '../../utils/cvForm'
import {
  contactIcons,
  devIcons,
  formatDateRange,
  formatLinkDisplayValue,
} from './shared'
import EditableField from '../EditableField'
import EditableList, { EditableChip } from '../EditableList'
import { renderExperienceEntry } from './directEditExperienceEntry'

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
  templateConfig,
  headingColor = null,
  nameAlignment = 'center',
  directEditDispatch = null,
}) {
  const isFinnish = locale === 'fi'
  const snapshot = useMemo(() => createCvSnapshot(formData), [formData])

  const contactItems = [
    ['phone', snapshot.phone],
    ['email', snapshot.email],
    ['location', snapshot.location],
  ].filter(([, value]) => value)
  const linkedinUrl = snapshot.links.linkedin
  const directEditContactFields = [
    ['phone', formData.phone, isFinnish ? 'Puhelin' : 'Phone'],
    ['email', formData.email, isFinnish ? 'Sähköposti' : 'Email'],
    ['location', formData.location, isFinnish ? 'Sijainti' : 'Location'],
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
    summary: isFinnish ? 'Yhteenveto' : 'Professional Summary',
    experience: isFinnish ? 'Kokemus' : 'Experience',
    education: isFinnish ? 'Koulutus' : 'Education',
    skills: isFinnish ? 'Taidot' : 'Skills',
    languages: isFinnish ? 'Kielet' : 'Languages',
    certificates: isFinnish ? 'Sertifikaatit' : 'Certifications',
  }

  const renderSection = (key) => {
    if (key === 'about') {
      return (
        <Section key={key} id="about">
          <h2 className="classic-professional-showcase__heading">{copy.summary}</h2>
          <p className="classic-professional-showcase__summary">
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
        <Section key={key} id="experience">
          <h2 className="classic-professional-showcase__heading">{copy.experience}</h2>
          <div className="classic-professional-showcase__entry-list">
            {directEditDispatch ? (
              <EditableList
                section="experience"
                items={formData.experience}
                addLabel={isFinnish ? '+ Lisää työkokemus' : '+ Add experience'}
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
                copy,
                classPrefix: 'classic-professional-showcase',
                separator: ', ',
              }))
            ) : (
              <p className="classic-professional-showcase__empty">
                {isFinnish ? 'Kokemuskohdat näkyvät tässä.' : 'Experience entries will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'education') {
      return (
        <Section key={key} id="education">
          <h2 className="classic-professional-showcase__heading">{copy.education}</h2>
          <div className="classic-professional-showcase__entry-list">
            {snapshot.education.length > 0 ? (
              snapshot.education.map((item, index) => {
                const metaLine = [item.school, item.location].filter(Boolean).join(', ')

                return (
                  <div key={`${item.school}-${index}`} className="classic-professional-showcase__entry" data-export-card="true">
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
                {isFinnish ? 'Koulutus näkyy tässä.' : 'Education will appear here.'}
              </p>
            )}
          </div>
        </Section>
      )
    }

    if (key === 'skills') {
      return (
        <Section key={key} id="skills">
          <h2 className="classic-professional-showcase__heading">{copy.skills}</h2>
          <div className="classic-professional-showcase__tag-row">
            {directEditDispatch ? null : snapshot.skills.length > 0 ? (
              snapshot.skills.map((skill) => (
                <span key={skill} data-export-skill="true" className="classic-professional-showcase__tag">{skill}</span>
              ))
            ) : (
              <p className="classic-professional-showcase__empty">
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

    if (key === 'languages') {
      return (
        <Section key={key} id="languages">
          <h2 className="classic-professional-showcase__heading">{copy.languages}</h2>
          {snapshot.languages.length > 0 ? (
            <p className="classic-professional-showcase__language-row">
              {snapshot.languages.map((item, index) => (
                <span key={`${item.language}-${index}`} className="classic-professional-showcase__language-item">
                  {index > 0 ? <span className="classic-professional-showcase__language-sep" aria-hidden="true">|</span> : null}
                  {item.language}
                  {item.level ? <> – {item.level}</> : null}
                </span>
              ))}
            </p>
          ) : (
            <p className="classic-professional-showcase__empty">
              {isFinnish ? 'Kielet näkyvät tässä.' : 'Languages will appear here.'}
            </p>
          )}
        </Section>
      )
    }

    if (key === 'certificates') {
      return (
        <Section key={key} id="certificates">
          <h2 className="classic-professional-showcase__heading">{copy.certificates}</h2>
          <div className="classic-professional-showcase__cert-list">
            {snapshot.certificates.length > 0 ? (
              snapshot.certificates.map((item, index) => (
                <p key={`${item.name}-${index}`} className="classic-professional-showcase__cert-item">
                  {[item.name, item.issuer].filter(Boolean).join(' – ')}
                </p>
              ))
            ) : (
              <p className="classic-professional-showcase__empty">
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
      style={headingColor ? { '--cv-heading-color': headingColor } : undefined}
    >
      <header data-export-header="true" className="classic-professional-showcase__header">
        <p className="classic-professional-showcase__kicker" data-export-ignore="true">
          {templateConfig.label} {isFinnish ? 'pohja' : 'Template'}
        </p>
        <h1 className="classic-professional-showcase__name">
          <EditableField
            as="span"
            path={{ kind: 'root', field: 'fullName' }}
            value={formData.fullName}
            placeholder={isFinnish ? 'Nimesi' : 'Your Name'}
          />
        </h1>
        <p className="classic-professional-showcase__role">
          <EditableField
            as="span"
            path={{ kind: 'root', field: 'title' }}
            value={formData.title}
            placeholder={isFinnish ? 'Ammattinimike' : 'Professional Title'}
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
