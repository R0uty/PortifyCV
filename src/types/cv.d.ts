export type Locale = 'en' | 'fi'

export interface CvExperienceItem {
  role: string
  company: string
  location: string
  employmentType: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
  achievements: string[]
  technologies: string[]
}

export interface CvEducationItem {
  school: string
  degree: string
  location: string
  startDate: string
  endDate: string
  honors: string
  coursework: string
  grade: string
}

export interface CvLinks {
  github: string
  linkedin: string
  portfolio: string
  website: string
  behance: string
  dribbble: string
  medium: string
  devto: string
  scholar: string
  boardProfile: string
  blog: string
  researchGate: string
  hackTheBox: string
  tryHackMe: string
  youtube: string
}

export interface CvCoreStrengthItem {
  title: string
  description: string
}

export interface CvCertificateItem {
  name: string
  issuer: string
  year: string
  credentialUrl: string
  expiry: string
}

export interface CvProjectItem {
  name: string
  description: string
  stack: string
  githubUrl: string
  demoUrl: string
  organization: string
  impact: string
  date: string
  teamSize: string
  contribution: string
  image: string
}

export interface CvLanguageItem {
  language: string
  level: string
}

export interface CvInterestItem {
  name: string
}

export interface CvAchievementItem {
  title: string
  description: string
  year: string
}

export interface CvOpenSourceItem {
  name: string
  description: string
  language: string
  stars: string
  forks: string
  url: string
}

export interface CvPublicationItem {
  title: string
  publisher: string
  year: string
  url: string
}

export interface CvLeadershipItem {
  role: string
  organization: string
  description: string
  startDate: string
  endDate: string
}

export interface CvMembershipItem {
  organization: string
  role: string
  year: string
}

export interface CvSpeakingItem {
  conference: string
  topic: string
  audience: string
  date: string
}

export interface CvVolunteerItem {
  organization: string
  role: string
  description: string
}

export interface CvInternshipItem {
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string
  technologies: string
}

export interface CvCaseStudyItem {
  title: string
  problem: string
  solution: string
  technologies: string
  outcome: string
  lessons: string
}

export interface CvTestimonialItem {
  quote: string
  author: string
  role: string
}

export interface CvSectionVisibility {
  about: boolean
  skills: boolean
  experience: boolean
  education: boolean
  links: boolean
  coreStrengths: boolean
  certificates: boolean
  projects: boolean
  languages: boolean
  interests: boolean
  achievements: boolean
  openSource: boolean
  publications: boolean
  leadership: boolean
  memberships: boolean
  speaking: boolean
  volunteering: boolean
  internships: boolean
  caseStudies: boolean
  testimonials: boolean
}

export type CvSectionKey =
  | 'about'
  | 'skills'
  | 'experience'
  | 'education'
  | 'links'
  | 'coreStrengths'
  | 'certificates'
  | 'projects'
  | 'languages'
  | 'interests'
  | 'achievements'
  | 'openSource'
  | 'publications'
  | 'leadership'
  | 'memberships'
  | 'speaking'
  | 'volunteering'
  | 'internships'
  | 'caseStudies'
  | 'testimonials'

export interface CvSectionItemVisibility {
  skills: Record<string, boolean>
  experience: Record<string, boolean>
  education: Record<string, boolean>
  links: Record<string, boolean>
  coreStrengths: Record<string, boolean>
  certificates: Record<string, boolean>
  projects: Record<string, boolean>
  languages: Record<string, boolean>
  interests: Record<string, boolean>
  achievements: Record<string, boolean>
  openSource: Record<string, boolean>
  publications: Record<string, boolean>
  leadership: Record<string, boolean>
  memberships: Record<string, boolean>
  speaking: Record<string, boolean>
  volunteering: Record<string, boolean>
  internships: Record<string, boolean>
  caseStudies: Record<string, boolean>
  testimonials: Record<string, boolean>
}

export interface CvData {
  fullName: string
  title: string
  about: string
  tagline: string
  email: string
  phone: string
  location: string
  photo: string
  photoVisibilityByTemplate: Record<string, boolean>
  sectionOrder: CvSectionKey[]
  skills: string[]
  experience: CvExperienceItem[]
  education: CvEducationItem[]
  links: CvLinks
  coreStrengths: CvCoreStrengthItem[]
  certificates: CvCertificateItem[]
  projects: CvProjectItem[]
  languages: CvLanguageItem[]
  interests: CvInterestItem[]
  achievements: CvAchievementItem[]
  openSource: CvOpenSourceItem[]
  publications: CvPublicationItem[]
  leadership: CvLeadershipItem[]
  memberships: CvMembershipItem[]
  speaking: CvSpeakingItem[]
  volunteering: CvVolunteerItem[]
  internships: CvInternshipItem[]
  caseStudies: CvCaseStudyItem[]
  testimonials: CvTestimonialItem[]
  sectionVisibility: CvSectionVisibility
  sectionItemVisibility: CvSectionItemVisibility
}

export interface CvSnapshot {
  fullName: string
  title: string
  about: string
  tagline: string
  email: string
  phone: string
  location: string
  photo: string
  skills: string[]
  experience: CvExperienceItem[]
  education: CvEducationItem[]
  links: Record<string, string>
  coreStrengths: CvCoreStrengthItem[]
  certificates: CvCertificateItem[]
  projects: CvProjectItem[]
  languages: CvLanguageItem[]
  interests: CvInterestItem[]
  achievements: CvAchievementItem[]
  openSource: CvOpenSourceItem[]
  publications: CvPublicationItem[]
  leadership: CvLeadershipItem[]
  memberships: CvMembershipItem[]
  speaking: CvSpeakingItem[]
  volunteering: CvVolunteerItem[]
  internships: CvInternshipItem[]
  caseStudies: CvCaseStudyItem[]
  testimonials: CvTestimonialItem[]
  /** Per record-array section, the formData index of each entry kept above. */
  sourceIndices: Record<string, number[]>
}
