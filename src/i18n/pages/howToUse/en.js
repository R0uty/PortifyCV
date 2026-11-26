// The builder guide (How to use the builder) in English.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Guide',
  title: 'How to Use the CV Builder',
  intro:
    'Seven steps from blank to finished — where each feature lives and what it affects. For advice on what to actually write, see ',
  introLink: {
    linkText: 'How to Write a CV',
    linkTo: ROUTES.howToWrite,
    view: 'howToWrite',
    after: '.',
  },
  steps: [
    {
      step: 'edit',
      heading: 'Edit right on the CV',
      figureLabel: 'The builder in Direct Edit: the demo CV, with its summary\'s fields open in a popup beside it.',
      caption:
        'The builder opens in Direct Edit: the CV itself is the editor. Click any text on it — your name, a job title, a bullet — and type. Each section\'s pencil opens all its fields beside it, where you add, remove, duplicate, and reorder entries; on most two-column templates you can also move a section between the main column and the sidebar. The rail on the left jumps to each section, the Sections menu hides the ones you don\'t need, and Load demo CV fills in example content to start from.',
    },
    {
      step: 'sections',
      heading: 'Prefer a form? Switch to Classic',
      figureLabel: 'The builder in Classic mode: sections on the left, the form in the middle, the live preview on the right.',
      caption:
        'The Direct Edit / Classic switch in the top bar swaps to a form view: the rail lists every section, the form sits in the middle, and the preview on the right updates as you type. Use the Visible sections panel at the top of the form to switch off anything that doesn\'t apply — your data stays either way. Both modes edit the same CV, so switch whenever you like. The tools in steps 3 and 5 live in Classic.',
    },
    {
      step: 'bullets',
      heading: 'Tighten your experience bullets',
      figureLabel: 'An experience entry in Classic mode: a weak bullet with its own hint underneath, and the role\'s "Strengthen the wording" tip below.',
      caption:
        'Each achievement bullet gets its own hints as soon as you move on from it, in Classic and Direct Edit alike: duty-list phrases like "responsible for," weak openers like "I" or "Worked," filler like "successfully," bullets over 30 words, the same opening verb as an earlier bullet, and bullets with no number. The ATS score & suggestions panel totals up the tips for each role. "Get ideas" under each job\'s achievements adds bullets from the example CVs with their numbers replaced by [__]; fill in your own figure, since a hint flags any bullet that still holds [__].',
    },
    {
      step: 'template',
      heading: 'Pick a template — your content stays put',
      figureLabel: 'The template gallery: field filters above the template cards, each with its three looks.',
      caption:
        `Swapping templates never touches your text, so it's safe to try all ${TEMPLATE_COUNT} before deciding. Each one uses a different set of sections — the ones a template doesn't use are tucked out of the editor and preview until you switch back. Each template also has three looks (a colour palette, a font, and a heading colour), picked from Design in the top bar.`,
      linkParagraph: {
        before: 'See all ',
        linkText: `${TEMPLATE_COUNT} templates`,
        linkTo: ROUTES.freeTemplates,
        view: 'freeTemplates',
        after: ' ahead of time.',
      },
    },
    {
      step: 'ats',
      heading: 'Check it against the job posting',
      figureLabel: 'The job description keyword match: a pasted job posting, keyword coverage, and the missing keywords.',
      caption:
        'In Classic mode, open the "ATS score & suggestions" panel above the form fields. Its ATS-friendly-mode toggle flattens the preview to the single-column layout applicant tracking systems can parse (in Direct Edit, the ATS view button at the top right of your CV does the same), and pasting a job description lists the keywords your CV is still missing.',
    },
    {
      step: 'export',
      heading: 'Export a file or share a link',
      figureLabel: 'The open Export menu: PDF, HTML, JSON, Word and a share link.',
      caption:
        'The Export menu offers four formats: PDF for applications, Word for editing in another program, HTML for the web, and JSON as a backup or to keep editing later. Copy share link, at the bottom of the same menu, encodes the whole CV into the URL — never sent to a server, and images don\'t fit. The link opens a view-only page where the recipient can download a PDF or open an editable copy in a new tab; your font, colours, ATS mode and PDF paper size travel with it. Cover letter, in the rail on the left (on a phone, in the ⋯ menu), drafts an editable cover letter from your CV, in your CV\'s language, and exports it as a PDF in your CV\'s look.',
    },
    {
      step: 'restore',
      heading: 'Your work survives an accidental refresh',
      figureLabel: 'The Settings dialog with "Restore last session" switched on.',
      caption:
        '"Restore last session" is on by default: a working copy of the CV you have edited is kept in that tab only, so refreshing the page does not lose it. Closing the tab clears the copy, so export JSON if you want to carry on later. You can turn the feature off in Settings.',
    },
  ],
  ctaLabel: 'Start building your CV',
  ctaNote: 'No login. Nothing saved unless you choose to.',
}
