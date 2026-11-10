import { useEffect, useRef, useState } from 'react'
import { CV_SECTION_ORDER_KEYS, normalizeSectionOrder } from '../utils/cvForm'
import { FORM_ACTION } from '../reducers/cvFormReducer'

// Wording here must stay in sync with `sectionVisibilityFieldsEn`/`Fi` in
// `src/utils/cvForm.js` (CVForm.jsx's own nav rail source), so the Direct
// Edit menu and the Classic "Visible sections" panel never disagree on a
// label for the same section key.
const SECTION_LABELS_EN = {
  about: 'About', experience: 'Experience', education: 'Education', skills: 'Skills',
  projects: 'Projects', links: 'Links', languages: 'Languages', certificates: 'Certificates',
  coreStrengths: 'Core Strengths', achievements: 'Achievements', interests: 'Interests',
  openSource: 'Open Source', publications: 'Publications', leadership: 'Leadership Experience',
  memberships: 'Professional Memberships', speaking: 'Speaking', volunteering: 'Volunteering',
  internships: 'Internships', caseStudies: 'Case Studies', testimonials: 'Testimonials',
}
const SECTION_LABELS_FI = {
  about: 'Esittely', experience: 'Kokemus', education: 'Koulutus', skills: 'Taidot',
  projects: 'Projektit', links: 'Linkit', languages: 'Kielet', certificates: 'Sertifikaatit',
  coreStrengths: 'Vahvuudet', achievements: 'Saavutukset', interests: 'Kiinnostuksen kohteet',
  openSource: 'Avoin lähdekoodi', publications: 'Julkaisut', leadership: 'Johtamiskokemus',
  memberships: 'Ammattijäsenyydet', speaking: 'Esiintymiset', volunteering: 'Vapaaehtoistyö',
  internships: 'Harjoittelut', caseStudies: 'Tapaustutkimukset', testimonials: 'Suositukset',
}

// Sections a template leaves out, most often missed first. The panel names
// the first few and counts the rest.
const MISSING_SECTION_PRIORITY = ['languages', 'certificates', 'projects', 'links', 'education', 'skills']
const MISSING_SECTIONS_NAMED = 4

export default function SectionsMenu({
  formData,
  dispatchFormData,
  templateConfig,
  locale,
  onOpenTemplateGallery = null,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  // The panel used to close only from its own button, so it stayed open
  // under the toolbar menus and over a section popup (1.6.75). A press
  // anywhere else closes it; Escape closes it and hands focus back.
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      const focusWasInside = rootRef.current?.contains(document.activeElement)
      setIsOpen(false)
      if (focusWasInside) {
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])
  const isFinnish = locale === 'fi'
  const labels = isFinnish ? SECTION_LABELS_FI : SECTION_LABELS_EN
  const templateSectionOrder = [
    ...templateConfig.primarySections,
    ...templateConfig.secondarySections,
  ]
  // normalizeSectionOrder always appends every CV_SECTION_ORDER_KEYS entry
  // at the end (not just the ones in `templateSectionOrder`), so — exactly
  // like CVForm.jsx's own nav rail does — its raw output has to be
  // filtered back down to the sections this template actually supports.
  // Skipping this filter would offer toggles (e.g. "Publications") for
  // sections Minimalist never renders at all.
  const templateSectionKeySet = new Set(templateSectionOrder)
  const sections = normalizeSectionOrder(formData.sectionOrder, templateSectionOrder)
    .filter((section) => templateSectionKeySet.has(section))
  // The panel listed only what this template has, so nothing said that
  // Languages or Certificates exist at all, in another template (1.6.81).
  const missingSections = [
    ...MISSING_SECTION_PRIORITY,
    ...CV_SECTION_ORDER_KEYS.filter((section) => !MISSING_SECTION_PRIORITY.includes(section)),
  ].filter((section) => !templateSectionKeySet.has(section))
  const namedMissing = missingSections.slice(0, MISSING_SECTIONS_NAMED).map((section) => labels[section] || section)
  const unnamedMissingCount = missingSections.length - namedMissing.length
  const missingText = isFinnish
    ? `Tässä pohjassa ei ole: ${namedMissing.join(', ')}${unnamedMissingCount > 0 ? ` ja ${unnamedMissingCount} muuta` : ''}.`
    : `Not in this template: ${namedMissing.join(', ')}${unnamedMissingCount > 0 ? ` and ${unnamedMissingCount} more` : ''}.`

  return (
    <div className="direct-edit-sections" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="direct-edit-sections__trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        {isFinnish ? 'Osiot' : 'Sections'}
      </button>
      {isOpen ? (
        <div className="direct-edit-sections__panel">
          {sections.map((section) => (
            <label key={section} className="direct-edit-sections__row">
              <input
                type="checkbox"
                checked={formData.sectionVisibility?.[section] !== false}
                onChange={() => dispatchFormData({ type: FORM_ACTION.TOGGLE_SECTION_VISIBILITY, section })}
              />
              {labels[section] || section}
            </label>
          ))}
          {missingSections.length ? (
            <div className="direct-edit-sections__missing">
              <p>{missingText}</p>
              {onOpenTemplateGallery ? (
                <button
                  type="button"
                  className="direct-edit-sections__missing-link"
                  onClick={() => {
                    setIsOpen(false)
                    onOpenTemplateGallery()
                  }}
                >
                  {isFinnish ? 'Katso muut pohjat' : 'See other templates'}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
