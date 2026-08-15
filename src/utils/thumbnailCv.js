import { demoCvData } from './cvForm'

// Each thumbnail renders a real CVPreview (see components/TemplateThumbnail.jsx),
// so the card shows the layout the user is actually choosing rather than an
// abstract skeleton. A full preview would be needlessly heavy, so the CV is
// trimmed to what survives being shrunk to thumbnail size — the header, a
// couple of entries, and a few skills.
const THUMBNAIL_EXPERIENCE_COUNT = 2
const THUMBNAIL_EDUCATION_COUNT = 1
const THUMBNAIL_ITEM_COUNT = 3
const THUMBNAIL_SKILL_COUNT = 6
const THUMBNAIL_ABOUT_LENGTH = 240

function hasContent(formData) {
  if (!formData) {
    return false
  }

  return Boolean(
    formData.fullName?.trim()
      || formData.title?.trim()
      || formData.about?.trim()
      || formData.experience?.some((item) => item.role?.trim() || item.company?.trim()),
  )
}

// formData is optional — pass a real in-progress CV (falls back to the demo
// CV if it's still empty) or omit it entirely to always use the demo CV,
// which is what the landing page's template preview does.
export function buildThumbnailCv(formData) {
  const source = hasContent(formData) ? formData : demoCvData
  const take = (value, count) => (Array.isArray(value) ? value.slice(0, count) : [])

  return {
    ...source,
    about: (source.about ?? '').slice(0, THUMBNAIL_ABOUT_LENGTH),
    experience: take(source.experience, THUMBNAIL_EXPERIENCE_COUNT),
    education: take(source.education, THUMBNAIL_EDUCATION_COUNT),
    skills: take(source.skills, THUMBNAIL_SKILL_COUNT),
    projects: take(source.projects, THUMBNAIL_ITEM_COUNT),
    certificates: take(source.certificates, THUMBNAIL_ITEM_COUNT),
    coreStrengths: take(source.coreStrengths, THUMBNAIL_ITEM_COUNT),
    languages: take(source.languages, THUMBNAIL_ITEM_COUNT),
  }
}
