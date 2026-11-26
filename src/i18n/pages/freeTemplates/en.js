// The Free CV Templates page in English.
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Templates',
  title: 'Free CV Templates',
  intro:
    `All ${TEMPLATE_COUNT} templates are completely free, with no watermark and no account. Each comes in three looks (a colour palette, a font, and a heading colour) you can try right on its card. Swap templates any time while you build — your content stays, only the layout changes.`,
  useTemplate: 'Use this template',
  viewExamples: 'View examples',
  style: 'Style',
  notSureTitle: 'Not sure where to start?',
  notSureBody:
    'Pick any template — you can switch to another one at any point without losing a single word you’ve written. If you’re applying somewhere your application goes through an applicant tracking system, switch on ATS-friendly mode from any template before exporting (the builder’s ATS view button).',
  ctaLabel: 'Start without picking a template',
  linksLabel: 'See also:',
  howToWriteLink: 'How to Write a CV',
  atsGuideLink: 'ATS-Friendly CV Guide',
  cvSkillsLink: 'CV Skills Examples',
  coverLetterLink: 'Cover Letter Examples',
  cvExamplesLink: 'CV Examples by Field',
}
