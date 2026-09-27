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

  // formData index of every entry that survives the filter below, per
  // record-array section. Templates render these filtered arrays, so their
  // own map index is snapshot-relative; Direct Edit's entry pencils need
  // the formData index the popup (and every reducer action) addresses.
  const sourceIndices = {
    experience: [],
    education: [],
    coreStrengths: [],
    certificates: [],
    projects: [],
    languages: [],
    interests: [],
    achievements: [],
    openSource: [],
    publications: [],
    leadership: [],
    memberships: [],
    speaking: [],
    volunteering: [],
    internships: [],
    caseStudies: [],
    testimonials: [],
  }

  return {
    fullName: trimValue(formData.fullName),
    title: trimValue(formData.title),
    about: trimValue(formData.about),
    tagline: trimValue(formData.tagline),
    email: trimValue(formData.email),
    phone: trimValue(formData.phone),
    location: trimValue(formData.location),
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
        location: trimValue(item.location),
        employmentType: trimValue(item.employmentType),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
        isCurrent: Boolean(item.isCurrent),
        description: trimValue(item.description),
        achievements: Array.isArray(item.achievements)
          ? item.achievements.map(trimValue).filter(Boolean)
          : [],
        technologies: Array.isArray(item.technologies)
          ? item.technologies.map(trimValue).filter(Boolean)
          : [],
      }

      if (
        normalizedItem.role ||
        normalizedItem.company ||
        normalizedItem.location ||
        normalizedItem.startDate ||
        normalizedItem.endDate ||
        normalizedItem.isCurrent ||
        normalizedItem.description ||
        normalizedItem.achievements.length > 0 ||
        normalizedItem.technologies.length > 0
      ) {
        next.push(normalizedItem)
        sourceIndices.experience.push(index)
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
        location: trimValue(item.location),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
        honors: trimValue(item.honors),
        coursework: trimValue(item.coursework),
        grade: trimValue(item.grade),
      }

      if (
        normalizedItem.school ||
        normalizedItem.degree ||
        normalizedItem.location ||
        normalizedItem.startDate ||
        normalizedItem.endDate ||
        normalizedItem.honors ||
        normalizedItem.coursework ||
        normalizedItem.grade
      ) {
        next.push(normalizedItem)
        sourceIndices.education.push(index)
      }

      return next
    }, []),
    links: Object.fromEntries(
      Object.entries(formData.links).filter(
        ([key, value]) => isSectionItemVisible('links', key) && trimValue(value),
      ),
    ),
    coreStrengths: formData.coreStrengths.reduce((next, item, index) => {
      if (!isSectionItemVisible('coreStrengths', index)) {
        return next
      }

      const normalizedItem = {
        title: trimValue(item.title),
        description: trimValue(item.description),
      }

      if (normalizedItem.title || normalizedItem.description) {
        next.push(normalizedItem)
        sourceIndices.coreStrengths.push(index)
      }

      return next
    }, []),
    certificates: formData.certificates.reduce((next, item, index) => {
      if (!isSectionItemVisible('certificates', index)) {
        return next
      }

      const normalizedItem = {
        name: trimValue(item.name),
        issuer: trimValue(item.issuer),
        year: trimValue(item.year),
        credentialUrl: trimValue(item.credentialUrl),
        expiry: trimValue(item.expiry),
      }

      if (
        normalizedItem.name ||
        normalizedItem.issuer ||
        normalizedItem.year ||
        normalizedItem.credentialUrl ||
        normalizedItem.expiry
      ) {
        next.push(normalizedItem)
        sourceIndices.certificates.push(index)
      }

      return next
    }, []),
    projects: formData.projects.reduce((next, item, index) => {
      if (!isSectionItemVisible('projects', index)) {
        return next
      }

      const normalizedItem = {
        name: trimValue(item.name),
        description: trimValue(item.description),
        stack: trimValue(item.stack),
        githubUrl: trimValue(item.githubUrl),
        demoUrl: trimValue(item.demoUrl),
        organization: trimValue(item.organization),
        impact: trimValue(item.impact),
        date: trimValue(item.date),
        teamSize: trimValue(item.teamSize),
        contribution: trimValue(item.contribution),
        image: getPhotoDataUrl(item.image),
      }

      if (
        normalizedItem.name ||
        normalizedItem.description ||
        normalizedItem.stack ||
        normalizedItem.githubUrl ||
        normalizedItem.demoUrl ||
        normalizedItem.organization ||
        normalizedItem.impact ||
        normalizedItem.date ||
        normalizedItem.teamSize ||
        normalizedItem.contribution ||
        normalizedItem.image
      ) {
        next.push(normalizedItem)
        sourceIndices.projects.push(index)
      }

      return next
    }, []),
    languages: formData.languages.reduce((next, item, index) => {
      if (!isSectionItemVisible('languages', index)) {
        return next
      }

      const normalizedItem = {
        language: trimValue(item.language),
        level: trimValue(item.level),
      }

      if (normalizedItem.language || normalizedItem.level) {
        next.push(normalizedItem)
        sourceIndices.languages.push(index)
      }

      return next
    }, []),
    interests: formData.interests.reduce((next, item, index) => {
      if (!isSectionItemVisible('interests', index)) {
        return next
      }

      const normalizedItem = { name: trimValue(item.name) }

      if (normalizedItem.name) {
        next.push(normalizedItem)
        sourceIndices.interests.push(index)
      }

      return next
    }, []),
    achievements: formData.achievements.reduce((next, item, index) => {
      if (!isSectionItemVisible('achievements', index)) {
        return next
      }

      const normalizedItem = {
        title: trimValue(item.title),
        description: trimValue(item.description),
        year: trimValue(item.year),
      }

      if (normalizedItem.title || normalizedItem.description || normalizedItem.year) {
        next.push(normalizedItem)
        sourceIndices.achievements.push(index)
      }

      return next
    }, []),
    openSource: formData.openSource.reduce((next, item, index) => {
      if (!isSectionItemVisible('openSource', index)) {
        return next
      }

      const normalizedItem = {
        name: trimValue(item.name),
        description: trimValue(item.description),
        language: trimValue(item.language),
        stars: trimValue(item.stars),
        forks: trimValue(item.forks),
        url: trimValue(item.url),
      }

      if (
        normalizedItem.name ||
        normalizedItem.description ||
        normalizedItem.language ||
        normalizedItem.stars ||
        normalizedItem.forks ||
        normalizedItem.url
      ) {
        next.push(normalizedItem)
        sourceIndices.openSource.push(index)
      }

      return next
    }, []),
    publications: formData.publications.reduce((next, item, index) => {
      if (!isSectionItemVisible('publications', index)) {
        return next
      }

      const normalizedItem = {
        title: trimValue(item.title),
        publisher: trimValue(item.publisher),
        year: trimValue(item.year),
        url: trimValue(item.url),
      }

      if (
        normalizedItem.title ||
        normalizedItem.publisher ||
        normalizedItem.year ||
        normalizedItem.url
      ) {
        next.push(normalizedItem)
        sourceIndices.publications.push(index)
      }

      return next
    }, []),
    leadership: formData.leadership.reduce((next, item, index) => {
      if (!isSectionItemVisible('leadership', index)) {
        return next
      }

      const normalizedItem = {
        role: trimValue(item.role),
        organization: trimValue(item.organization),
        description: trimValue(item.description),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
      }

      if (
        normalizedItem.role ||
        normalizedItem.organization ||
        normalizedItem.description ||
        normalizedItem.startDate ||
        normalizedItem.endDate
      ) {
        next.push(normalizedItem)
        sourceIndices.leadership.push(index)
      }

      return next
    }, []),
    memberships: formData.memberships.reduce((next, item, index) => {
      if (!isSectionItemVisible('memberships', index)) {
        return next
      }

      const normalizedItem = {
        organization: trimValue(item.organization),
        role: trimValue(item.role),
        year: trimValue(item.year),
      }

      if (normalizedItem.organization || normalizedItem.role || normalizedItem.year) {
        next.push(normalizedItem)
        sourceIndices.memberships.push(index)
      }

      return next
    }, []),
    speaking: formData.speaking.reduce((next, item, index) => {
      if (!isSectionItemVisible('speaking', index)) {
        return next
      }

      const normalizedItem = {
        conference: trimValue(item.conference),
        topic: trimValue(item.topic),
        audience: trimValue(item.audience),
        date: trimValue(item.date),
      }

      if (
        normalizedItem.conference ||
        normalizedItem.topic ||
        normalizedItem.audience ||
        normalizedItem.date
      ) {
        next.push(normalizedItem)
        sourceIndices.speaking.push(index)
      }

      return next
    }, []),
    volunteering: formData.volunteering.reduce((next, item, index) => {
      if (!isSectionItemVisible('volunteering', index)) {
        return next
      }

      const normalizedItem = {
        organization: trimValue(item.organization),
        role: trimValue(item.role),
        description: trimValue(item.description),
      }

      if (normalizedItem.organization || normalizedItem.role || normalizedItem.description) {
        next.push(normalizedItem)
        sourceIndices.volunteering.push(index)
      }

      return next
    }, []),
    internships: formData.internships.reduce((next, item, index) => {
      if (!isSectionItemVisible('internships', index)) {
        return next
      }

      const normalizedItem = {
        role: trimValue(item.role),
        company: trimValue(item.company),
        location: trimValue(item.location),
        startDate: trimValue(item.startDate),
        endDate: trimValue(item.endDate),
        description: trimValue(item.description),
        technologies: trimValue(item.technologies),
      }

      if (
        normalizedItem.role ||
        normalizedItem.company ||
        normalizedItem.location ||
        normalizedItem.startDate ||
        normalizedItem.endDate ||
        normalizedItem.description ||
        normalizedItem.technologies
      ) {
        next.push(normalizedItem)
        sourceIndices.internships.push(index)
      }

      return next
    }, []),
    caseStudies: formData.caseStudies.reduce((next, item, index) => {
      if (!isSectionItemVisible('caseStudies', index)) {
        return next
      }

      const normalizedItem = {
        title: trimValue(item.title),
        problem: trimValue(item.problem),
        solution: trimValue(item.solution),
        technologies: trimValue(item.technologies),
        outcome: trimValue(item.outcome),
        lessons: trimValue(item.lessons),
      }

      if (
        normalizedItem.title ||
        normalizedItem.problem ||
        normalizedItem.solution ||
        normalizedItem.technologies ||
        normalizedItem.outcome ||
        normalizedItem.lessons
      ) {
        next.push(normalizedItem)
        sourceIndices.caseStudies.push(index)
      }

      return next
    }, []),
    testimonials: formData.testimonials.reduce((next, item, index) => {
      if (!isSectionItemVisible('testimonials', index)) {
        return next
      }

      const normalizedItem = {
        quote: trimValue(item.quote),
        author: trimValue(item.author),
        role: trimValue(item.role),
      }

      if (normalizedItem.quote || normalizedItem.author || normalizedItem.role) {
        next.push(normalizedItem)
        sourceIndices.testimonials.push(index)
      }

      return next
    }, []),
    sourceIndices,
  }
}

/**
 * @param {CvData} formData
 * @returns {string}
 */
export function createExportFileName(formData) {
  const baseName = trimValue(formData.fullName) || 'cv'
  // Accented letters are folded to their base form so "Ääkkös" stays readable
  // rather than losing characters outright.
  const slug = baseName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // A name written entirely in a non-Latin script slugs down to nothing, which
  // would otherwise produce a file named ".pdf".
  return slug || 'cv'
}
