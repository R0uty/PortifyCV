// The text the HTML, Word and text-only PDF exports write into the file,
// in English. Read through createExportCopy (utils/exporters.js) with the
// CV's language (`cvLocale`).
export default {
  placeholders: {
    untitledRole: 'Untitled role',
    educationEntry: 'Education entry',
  },
  sections: {
    about: 'About',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    links: 'Links',
    coreStrengths: 'Core Strengths',
    certificates: 'Certificates',
    projects: 'Projects',
    languages: 'Languages',
    interests: 'Interests',
    achievements: 'Achievements',
    openSource: 'Open Source',
    publications: 'Publications',
    leadership: 'Leadership Experience',
    memberships: 'Professional Memberships',
    speaking: 'Speaking',
    volunteering: 'Volunteering',
    internships: 'Internships',
    caseStudies: 'Case Studies',
    testimonials: 'Testimonials',
  },
  caseStudy: {
    problem: 'Problem',
    solution: 'Solution',
    technologies: 'Technologies',
    outcome: 'Outcome',
    lessonsLearned: 'Lessons Learned',
  },
  // As the templates word them (CVPreview.jsx, GraduateShowcase.jsx).
  dates: {
    present: 'Present',
  },
  certificate: {
    expires: 'Expires',
  },
  // The HTML file's <title> when the CV has no name.
  documentTitle: 'CV',
}
