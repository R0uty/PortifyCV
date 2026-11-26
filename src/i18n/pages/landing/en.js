// The front page in English.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'No login. Nothing saved unless you choose to.',
  startButton: 'Start building',
  viewTemplatesButton: 'View templates',
  howItWorksLink: 'See how it works',
  title: 'Free CV builder. Build it, take it, done.',
  subtitle: 'Click your CV and type. Pick a template, then take it with you as a PDF, a Word file or a share link.',
  previewAlt: 'The PortifyCV editor: a CV with its About section open for editing beside it.',
  chipsLabel: 'Included',
  chips: [
    { label: `${TEMPLATE_COUNT} templates × 3 looks`, view: 'freeTemplates' },
    { label: 'ATS view', view: 'atsGuide' },
    { label: 'English & Finnish', view: 'finnishCv' },
    { label: 'Cover letter included', view: 'coverLetterExamples' },
  ],
  whyTitle: 'Why use PortifyCV',
  why: [
    {
      heading: 'No account. No login. That’s the whole point.',
      body: 'Skip the sign-up, the email confirmation, the account to manage. Open the page, start typing, and export when you’re done — there is nothing else to it.',
    },
    {
      heading: 'Nothing ever touches a server',
      body: 'Every export (PDF, Word, HTML, JSON) and every share link is generated entirely in your browser. Unlike CV builders that require an account, your data is never uploaded, stored, or seen by anyone — because it never leaves your device.',
    },
    {
      heading: 'Built for applicant tracking systems',
      body: 'Toggle ATS mode for a layout that parsers can actually read — no columns, icons, or tables to trip them up — plus keyword scoring that shows what your CV is missing.',
    },
  ],
  howTitle: 'How it works',
  steps: [
    { step: 'template', title: 'Pick a template', body: `${TEMPLATE_COUNT} layouts, three looks each. Switch any time; your text stays.`, figureLabel: 'The template gallery: field filters above the template cards, each with its three looks.' },
    { step: 'edit', title: 'Edit right on the CV', body: 'Click any text and type, or open a section’s pencil for all its fields.', figureLabel: 'The builder in Direct Edit: the demo CV, with its summary\'s fields open in a popup beside it.' },
    { step: 'export', title: 'Export or share', body: 'Download a PDF or Word file, or copy a share link. Nothing is uploaded.', figureLabel: 'The open Export menu: PDF, HTML, JSON, Word and a share link.' },
  ],
  howLink: 'Read the full walkthrough',
  templatesTitle: 'See the templates',
  templatesSubtitle: 'Pick your field to see the templates that suit it, each in one of its three looks.',
  templatesCta: `Browse all ${TEMPLATE_COUNT} templates`,
  // LandingTemplatesByField.jsx's card image, filled with t().
  templateCardAlt: '{label} CV template, {look}',
  guidesTitle: 'Guides and examples',
  guides: [
    { view: 'howToWrite', path: ROUTES.howToWrite, title: 'How to write a CV', body: 'Sections, a summary that says something, and bullets that show impact.' },
    { view: 'atsGuide', path: ROUTES.atsGuide, title: 'ATS-friendly CV guide', body: 'What applicant tracking systems read, what breaks them, and which export to use.' },
    { view: 'cvExamples', path: ROUTES.cvExamples, title: 'CV examples by field', body: 'Developer, IT, cybersecurity and Finnish CVs, with full example CVs.' },
    { view: 'coverLetterExamples', path: ROUTES.coverLetterExamples, title: 'Cover letter examples', body: 'Weak and strong openings, middles and closings, and a draft from your CV.' },
  ],
  faqTitle: 'Frequently asked questions',
}
