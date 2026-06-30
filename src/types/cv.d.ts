export type Locale = 'en' | 'fi'

export interface CvExperienceItem {
  role: string
  company: string
  startDate: string
  endDate: string
  description: string
}

export interface CvEducationItem {
  school: string
  degree: string
  startDate: string
  endDate: string
}

export interface CvLinks {
  github: string
  linkedin: string
  portfolio: string
  website: string
}

export interface CvSectionVisibility {
  about: boolean
  skills: boolean
  experience: boolean
  education: boolean
  links: boolean
}

export interface CvSectionItemVisibility {
  skills: Record<string, boolean>
  experience: Record<string, boolean>
  education: Record<string, boolean>
  links: Record<string, boolean>
}

export interface CvData {
  fullName: string
  title: string
  about: string
  photo: string
  photoVisibilityByTemplate: Record<string, boolean>
  skills: string[]
  experience: CvExperienceItem[]
  education: CvEducationItem[]
  links: CvLinks
  sectionVisibility: CvSectionVisibility
  sectionItemVisibility: CvSectionItemVisibility
}

export interface CvSnapshot {
  fullName: string
  title: string
  about: string
  photo: string
  skills: string[]
  experience: CvExperienceItem[]
  education: CvEducationItem[]
  links: Record<string, string>
}
