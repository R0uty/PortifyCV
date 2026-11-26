// The CV examples hub in English.
import { ROUTES } from '../../../utils/routes.js'

export default {
  kicker: 'Examples',
  title: 'CV Examples by Field',
  intro:
    'The same structure — a strong summary, results-focused experience bullets, the right skills — works across every field, but the details differ. Pick yours below.',
  cards: [
    {
      view: 'developerCv',
      path: ROUTES.developerCv,
      title: 'Developer CV Examples',
      body: 'How to structure project entries, a technical skills list, and why the Developer template is built for exactly this.',
    },
    {
      view: 'itCv',
      path: ROUTES.itCv,
      title: 'IT CV Examples',
      body: 'Certifications, systems, and skills that stand out from generic "computer skills."',
    },
    {
      view: 'cybersecurityCv',
      path: ROUTES.cybersecurityCv,
      title: 'Cybersecurity CV Examples',
      body: 'SIEM tools, certifications, and where a Hack The Box or TryHackMe profile belongs.',
    },
    {
      view: 'finnishCv',
      path: ROUTES.finnishCv,
      title: 'Finnish CV Examples',
      body: 'What to leave out, why the languages section matters more, and a bilingual example of the same content.',
    },
  ],
  sharedTitle: 'What every strong CV has in common',
  sharedIntro: 'Whatever the field, a CV is usually skimmed before it is read, and the same four things carry it through that first look.',
  shared: [
    'A summary that names your role, your years of experience and the one thing you do best, in two or three sentences.',
    'Experience bullets that start with a verb, say what you did, and end with a result: a number, time saved, a problem that stopped.',
    "Skills in the job posting's own words, so both an applicant tracking system and a person find them.",
    'One or two pages. Older or less relevant roles shrink to a line each instead of pushing the recent ones off the first page.',
  ],
  fieldsTitle: 'What changes from field to field',
  fieldsIntro: "The structure stays the same; what counts as evidence doesn't. These are the details each field's readers look for first, and the templates that suit them.",
  templatesLabel: 'Templates that suit it:',
  fields: {
    software: ['Software development', 'Projects carry as much weight as job titles. Name the stack in each entry, link to code or a live demo where you can, and measure outcomes in users, speed or reliability rather than lines of code.'],
    it: ['IT support and systems', 'Show the size of the environment (users, devices, sites), the systems you administer, and the tickets you made disappear. Certifications belong in their own section, with the year.'],
    security: ['Cybersecurity', 'Name the tools (SIEM, EDR, vulnerability scanners), the incidents or findings you handled, and hands-on proof such as lab rankings or published write-ups. A vague "security awareness" adds nothing.'],
    healthcare: ['Healthcare', 'Lead with your licence or registration and the units or specialities you have worked in. Patient numbers, shift patterns and the protocols you improved are the measurable part.'],
    education: ['Education', 'Subjects, age groups and levels first, then results: exam outcomes, programmes you built, students you mentored. The school matters less than what changed in your classroom.'],
    sales: ['Sales, marketing and customer success', 'Numbers carry more weight here than in most fields. Revenue, pipeline, quota, conversion, retention and campaign results belong in nearly every bullet, with the time frame.'],
    creative: ['Design and creative work', "The CV points to the portfolio; it doesn't replace it. Put the link near the top, say what problem each project solved, and let the layout show some taste without hiding the text."],
    finance: ['Finance and management', 'Scope is the headline: budget, team size, the number of entities or markets you covered. Readers expect a conservative layout and exact figures.'],
    graduates: ['Graduates and career starters', 'Education goes first, with projects, internships, part-time work and coursework doing the job of experience. One strong project with a result beats a long list of modules.'],
  },
  useTitle: 'How to use these examples',
  use: [
    "The example CVs are written for fictional people, but every bullet follows the pattern above, so they're a reference for structure and tone, not text to copy: copied phrasing describes someone else's work, not yours.",
    "A practical way to use one: open it in the builder, keep the section order and the shape of each bullet, and replace every claim and number with your own. If a bullet has no equivalent in your work, delete it rather than inventing one.",
    "Then check your draft against a real job posting. In Classic mode, the ATS score & suggestions panel compares your CV with a pasted posting and lists the keywords it still lacks.",
  ],
  fullExamplesTitle: 'Full example CVs',
  fullExamplesIntro: 'Complete example CVs from different fields, each in its own template. "Use this example" loads one into the builder to edit, and every template page has more.',
  linksLabel: 'See also:',
  howToWriteLink: 'How to Write a CV',
  templatesLink: 'Free CV Templates',
  ctaLabel: 'Start building your CV',
  ctaNote: 'No login. Nothing saved unless you choose to.',
}
