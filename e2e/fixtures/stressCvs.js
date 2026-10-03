import {
  createInitialCvData, createEmptyLinks, createEmptyExperience, createEmptyEducation,
} from '../../src/utils/cvForm.js'

// Synthetic CVs for docs/template-design-system.md §7 cases the 24 example
// people don't cover. Fictional data only.
const base = () => createInitialCvData()

const job = (i) => ({
  ...createEmptyExperience(),
  role: `Senior Operations Specialist ${i}`,
  company: `Example Company ${i} Oy`,
  location: 'Helsinki, Finland',
  employmentType: 'Full-time',
  startDate: `Jan ${2024 - i * 2}`,
  endDate: i === 0 ? '' : `Dec ${2025 - i * 2}`,
  isCurrent: i === 0,
  description: 'Ran day-to-day operations for a regional team and owned the quarterly planning cycle.',
  achievements: [
    'Cut order lead time from 9 days to 4 across 3 warehouses.',
    'Introduced a weekly KPI review adopted by 6 teams.',
    'Reduced supplier escalations by 35% in 12 months.',
  ],
  technologies: ['SAP', 'Power BI'],
})

export const STRESS_CVS = {
  'long-single-word': {
    ...base(),
    // fullName is a §7.1-faithful long two-part name (G7 fix round 1,
    // docs/template-audit-phase2.md) — the email/URLs/60-char skill below
    // intentionally keep the old long, hyphenated strings, since those
    // still test G6 (long unbreakable values), unrelated to the name fix.
    fullName: 'Maximiliana Kristiansen',
    title: 'Principal Infrastructure Reliability Engineer',
    email: 'kristiansen-vandenberghe.oyelaran-lindqvist@example.com',
    phone: '+358 40 000 9901',
    location: 'Espoo, Finland',
    about: 'Infrastructure engineer focused on reliability and incident response.',
    skills: ['Kubernetes', 'Infrastructure-as-code governance and policy-as-code tooling', 'Terraform', 'Go'],
    experience: [job(0), job(1)],
    education: [{ ...createEmptyEducation(), school: 'Aalto University', degree: 'M.Sc. (Tech.) Computer Science', startDate: '2012', endDate: '2017' }],
    links: {
      ...createEmptyLinks(),
      github: 'https://github.com/example-kristiansen-vandenberghe-oyelaran',
      linkedin: 'https://linkedin.com/in/example-kristiansen-vandenberghe-oyelaran-lindqvist',
      portfolio: 'https://kristiansen-vandenberghe.example.com/portfolio/infrastructure',
    },
  },
  'ten-jobs': {
    ...base(),
    fullName: 'Taina Example',
    title: 'Operations Director',
    email: 'taina.example@example.com',
    phone: '+358 40 000 9902',
    location: 'Tampere, Finland',
    about: 'Operations leader with a long, steady career across logistics and retail.',
    skills: ['Operations', 'Lean', 'Budgeting', 'SAP'],
    experience: Array.from({ length: 10 }, (_, i) => job(i)),
    education: [{ ...createEmptyEducation(), school: 'University of Tampere', degree: 'M.Sc. Economics', startDate: '1998', endDate: '2003' }],
  },
  sparse: {
    ...base(),
    fullName: 'Ada Example',
    title: 'Accountant',
    experience: [{ ...createEmptyExperience(), role: 'Accountant', company: 'Example Oy', startDate: 'Jan 2020', isCurrent: true }],
  },
}
