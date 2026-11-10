import {
  createEmptyAchievement,
  createEmptyCaseStudy,
  createEmptyCertificate,
  createEmptyCoreStrength,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyInternship,
  createEmptyInterest,
  createEmptyLanguage,
  createEmptyLeadership,
  createEmptyLinks,
  createEmptyMembership,
  createEmptyOpenSource,
  createEmptyProject,
  createEmptyPublication,
  createEmptySpeaking,
  createEmptyTestimonial,
  createEmptyVolunteer,
  createInitialCvData,
} from '../../src/utils/cvForm.js'

// A CV with a unique word in every field a person can fill in, read from the
// app's own empty entries so a new field is covered without touching this
// file. Finding each word in an exported file shows no field was lost.
const FACTORIES = {
  experience: createEmptyExperience,
  education: createEmptyEducation,
  coreStrengths: createEmptyCoreStrength,
  certificates: createEmptyCertificate,
  projects: createEmptyProject,
  languages: createEmptyLanguage,
  interests: createEmptyInterest,
  achievements: createEmptyAchievement,
  openSource: createEmptyOpenSource,
  publications: createEmptyPublication,
  leadership: createEmptyLeadership,
  memberships: createEmptyMembership,
  speaking: createEmptySpeaking,
  volunteering: createEmptyVolunteer,
  internships: createEmptyInternship,
  caseStudies: createEmptyCaseStudy,
  testimonials: createEmptyTestimonial,
}
const URL_FIELD = /url$|^(github|linkedin|portfolio|website|behance|dribbble|medium|devto|scholar|boardProfile|blog|researchGate|hackTheBox|tryHackMe|youtube)$/i
const BASICS = ['fullName', 'title', 'about', 'tagline', 'email', 'phone', 'location']

export function createEveryFieldCv() {
  const fields = []
  const word = (path) => {
    const value = `Kfield${String(fields.length).padStart(3, '0')}x`
    fields.push({ path, section: path.split('.')[0], value })
    return value
  }
  const fill = (entry, section) => Object.fromEntries(Object.entries(entry).map(([key, value]) => {
    const path = `${section}.${key}`
    if (key === 'image' || key === 'isCurrent') return [key, value]
    if (Array.isArray(value)) return [key, [word(path), word(path)]]
    if (typeof value === 'string') return [key, URL_FIELD.test(key) ? `https://example.com/${word(path)}` : word(path)]
    return [key, value]
  }))

  const cv = createInitialCvData()
  BASICS.forEach((key) => { cv[key] = word(key) })
  cv.email = `${cv.email}@example.com`
  cv.skills = [word('skills'), word('skills')]
  cv.links = fill(createEmptyLinks(), 'links')
  Object.entries(FACTORIES).forEach(([section, createEntry]) => {
    cv[section] = [fill(createEntry(), section)]
  })

  return { cv, fields, basics: BASICS }
}
