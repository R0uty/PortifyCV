// @ts-check
import { createSectionItemVisibility } from './cvForm'

/** @typedef {import('../types/cv').CvData} CvData */
/** @typedef {import('../types/cv').CvSnapshot} CvSnapshot */

function trimValue(value = '') {
  return String(value).trim()
}

function getPhotoDataUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmedValue = value.trim()

  if (!/^data:image\/(png|jpe?g);base64,/i.test(trimmedValue)) {
    return ''
  }

  return trimmedValue
}

/**
 * Build a normalized snapshot used by rendering, scoring, and exports.
 * @param {CvData} formData
 * @returns {CvSnapshot}
 */
export function createCvSnapshot(formData) {
  const sectionItemVisibility = {
    ...createSectionItemVisibility(),
    ...(formData.sectionItemVisibility ?? {}),
  }
  const isSectionItemVisible = (section, itemKey) =>
    sectionItemVisibility[section]?.[String(itemKey)] !== false

  return {
    fullName: trimValue(formData.fullName),
    title: trimValue(formData.title),
    about: trimValue(formData.about),
    photo: getPhotoDataUrl(formData.photo),
    skills: formData.skills.reduce((next, skill, index) => {
      if (!isSectionItemVisible('skills', index)) {
        return next
      }

      const normalizedSkill = trimValue(skill)

      if (normalizedSkill) {
        next.push(normalizedSkill)
      }

      return next
    }, []),
    experience: formData.experience.reduce((next, item, index) => {
      if (!isSectionItemVisible('experience', index)) {
        return next
      }

      const normalizedItem = {
        role: trimValue(item.role),
        company: trimValue(item.company),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
        description: trimValue(item.description),
      }

      if (
        normalizedItem.role ||
        normalizedItem.company ||
        normalizedItem.startDate ||
        normalizedItem.endDate ||
        normalizedItem.description
      ) {
        next.push(normalizedItem)
      }

      return next
    }, []),
    education: formData.education.reduce((next, item, index) => {
      if (!isSectionItemVisible('education', index)) {
        return next
      }

      const normalizedItem = {
        school: trimValue(item.school),
        degree: trimValue(item.degree),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
      }

      if (
        normalizedItem.school ||
        normalizedItem.degree ||
        normalizedItem.startDate ||
        normalizedItem.endDate
      ) {
        next.push(normalizedItem)
      }

      return next
    }, []),
    links: Object.fromEntries(
      Object.entries(formData.links).filter(
        ([key, value]) => isSectionItemVisible('links', key) && trimValue(value),
      ),
    ),
  }
}

/**
 * @param {CvData} formData
 * @returns {string}
 */
export function createExportFileName(formData) {
  const baseName = trimValue(formData.fullName) || 'cv'

  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
