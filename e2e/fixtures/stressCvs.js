import {
  createInitialCvData, createEmptyLinks, createEmptyExperience, createEmptyEducation,
  createEmptyProject, createEmptyInterest,
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
    // 'Kubernetesoperatorreconciliationloopsdesign' is a 44-character
    // unbreakable single token (no spaces to wrap at) — G9/F-controller
    // item C, docs/template-audit-phase2.md — checked across every
    // template, not just Modern Orange's skill-dot row it was added for.
    skills: ['Kubernetes', 'Infrastructure-as-code governance and policy-as-code tooling', 'Terraform', 'Go', 'Kubernetesoperatorreconciliationloopsdesign'],
    experience: [job(0), job(1)],
    education: [{ ...createEmptyEducation(), school: 'Aalto University', degree: 'M.Sc. (Tech.) Computer Science', startDate: '2012', endDate: '2017' }],
    // The same 44-char token also appears in a project's `stack` (parsed
    // into chip tags by every template's project renderer, e.g.
    // `item.stack.split(',')`) and in `interests` — item 2, Task 9 fix
    // round 2, docs/template-audit-phase2.md — so every template's
    // project-tech-stack chip and interest chip gets exercised too, not
    // just the dedicated `skills` chip row.
    projects: [{
      ...createEmptyProject(),
      name: 'Reliability Platform',
      description: 'Built the internal platform powering incident response and capacity planning.',
      stack: 'Kubernetes, Terraform, Kubernetesoperatorreconciliationloopsdesign',
      date: '2023',
    }],
    interests: [
      { ...createEmptyInterest(), name: 'Kubernetesoperatorreconciliationloopsdesign' },
      { ...createEmptyInterest(), name: 'Trail running' },
    ],
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
  // Task 9 fix round 1 regression case: several *ordinary* longish skill
  // words (none of them a single unbreakable 40+ char token) crowding a
  // skill-chip row. `.tpl-chip-wrappable`'s `max-width: 100%`
  // (src/styles/templates/_system.css) must let a chip that doesn't fit
  // the current line wrap to the next one intact — none of these words
  // should ever break mid-word. This is exactly the crowded-row scenario
  // where a per-template `overflow-wrap: anywhere` (reverted in this fix
  // round) fractured an ordinary word, the same defect class as G7's
  // original Modern Orange bug.
  'crowded-skills': {
    ...base(),
    fullName: 'Noora Example',
    title: 'Platform Engineer',
    email: 'noora.example@example.com',
    phone: '+358 40 000 9903',
    location: 'Oulu, Finland',
    about: 'Platform engineer specializing in resilient, observable distributed infrastructure.',
    skills: [
      'Infrastructure-as-code',
      'Observability engineering',
      'Distributed systems',
      'Container orchestration',
      'Continuous integration',
      'Service mesh architecture',
      'Incident response',
      'Capacity planning',
      'Configuration management',
      'Platform reliability',
    ],
    experience: [job(0), job(1)],
    education: [{ ...createEmptyEducation(), school: 'University of Oulu', degree: 'M.Sc. Computer Science', startDate: '2014', endDate: '2019' }],
  },
}
