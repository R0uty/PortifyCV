import { useState } from 'react'
import { normalizeSectionOrder } from '../utils/cvForm'
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

export default function SectionsMenu({ formData, dispatchFormData, templateConfig, locale }) {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <div className="direct-edit-sections">
      <button
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
        </div>
      ) : null}
    </div>
  )
}
