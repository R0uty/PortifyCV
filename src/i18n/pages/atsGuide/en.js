// The ATS-friendly CV guide in English.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Guide',
  title: 'ATS-Friendly CV Guide',
  intro:
    'An applicant tracking system (ATS) is software, not a person, and it reads your CV differently than you’d expect. Here’s what it actually does, what breaks it, and how to check your own CV against real scoring instead of guessing.',
  sections: [
    {
      heading: 'What an ATS actually does',
      paragraphs: [
        'It extracts raw text from your file, pulls out fields (name, contact details, experience, skills), and often ranks candidates by keyword match against the job description. Two consequences follow: if the parser can’t extract clean text, none of your content counts — and even content that is parsed correctly scores low if it doesn’t mention the right terms, regardless of whether you actually have that skill.',
      ],
    },
    {
      heading: 'What breaks ATS parsing',
      list: [
        'Multi-column layouts: some parsers read left-to-right across the whole page, so a two-column layout can interleave your experience with your skills sidebar into nonsense.',
        'Text inside images, icons, or text boxes: parsers usually only read real text in the document’s text layer, not text baked into a graphic.',
        'Tables used for layout: similar issue — content inside table cells is sometimes skipped or read out of order.',
        'Contact info placed in a header or footer: some parsers ignore those regions entirely, dropping your email and phone number.',
        'Unusual fonts or heavy use of symbols as bullets: can produce garbled character output.',
        'Section headings that aren’t the expected words ("My Journey" instead of "Experience") can stop the parser from correctly categorizing the content underneath.',
      ],
    },
    {
      heading: 'Use section headings an ATS recognises',
      paragraphs: [
        'A parser sorts your CV into fields by its headings. Plain, expected words work best; creative ones ("My Journey", "What I Bring") leave it guessing:',
      ],
      list: [
        'Summary or Profile',
        'Experience or Work Experience',
        'Education',
        'Skills',
        'Certifications',
        'Languages',
      ],
      paragraphsAfter: [
        'PortifyCV’s templates use standard headings like these, and ATS view keeps them as plain text.',
      ],
    },
    {
      heading: 'Dates, titles and contact details a parser can read',
      list: [
        'Give every job the same date format, such as "Jan 2022 – Mar 2024", with the month. Parsers use dates to work out your years of experience.',
        'Put the job title, the employer and the dates on separate, clearly labelled lines rather than combining them in one long line.',
        'Keep your name, email and phone number in the main body of the CV, not in a page header or footer, which some parsers skip.',
        'Avoid putting contact details or skills in tables or text boxes.',
      ],
    },
    {
      heading: 'How PortifyCV’s ATS mode helps',
      paragraphs: [
        `ATS-friendly mode flattens any of the ${TEMPLATE_COUNT} templates into a single-column, text-forward layout with standard section headings — columns, icons, and decorative elements are removed from that render. Export in this mode when the destination is an ATS rather than a person. While it’s on, the CV you edit is the version you export. Keyword scoring lives in the builder’s Classic mode.`,
      ],
      linkParagraphs: [
        {
          before: 'Try it in the ',
          linkText: 'CV builder',
          linkTo: ROUTES.builder,
          view: 'builder',
          after: ' — click ATS view at the top right of your CV (or turn on ATS-friendly mode in Settings).',
        },
      ],
    },
    {
      heading: 'Keyword scoring — check against a real job posting',
      paragraphs: [
        'The ATS score panel calculates your parser-readiness score directly from your CV content in your browser. Paste the job posting for the role you’re targeting into the same panel, and PortifyCV lists the skills and requirements it recognises in the posting: which your CV already mentions and which are missing. Then you can save a copy of your CV for that job and tailor it.',
      ],
      linkParagraphs: [
        {
          before: 'See ',
          linkText: 'CV skills examples',
          linkTo: ROUTES.cvSkills,
          view: 'cvSkills',
          after: ' for how to phrase skills so they match the terms a posting actually uses.',
        },
      ],
    },
    {
      heading: 'Match the posting’s words without stuffing',
      paragraphs: [
        'Keyword scoring rewards the posting’s exact terms, so use its wording where it’s true for you. A few habits help both the parser and the person who reads it next:',
      ],
      list: [
        'Write a term the way the posting does: if it says "project management", don’t only write "managed projects".',
        'Spell out an abbreviation once with the short form: "Search engine optimisation (SEO)". Then either form matches.',
        'Name a skill in the skills list and show it in a bullet with a result. Context counts with the human reader.',
        'Don’t hide keywords in white or tiny text. A parser shows it in the plain-text view a recruiter sees, and it reads as cheating.',
      ],
    },
    {
      heading: 'Being honest about export formats: what’s actually machine-readable',
      paragraphs: [
        'PDF export draws each page as a picture of the preview, so the file looks exactly like what you see, and writes the same text over it as real, invisible text. You can select, search and copy it, links and email addresses are clickable, and a parser gets the words rather than an empty page. The text follows the page’s layout, so in a two-column template a parser may still read the columns in an odd order; ATS mode gives it a single column to read. Check your own export: the PDF preview’s What a parser reads tab reads the file back and shows which fields were recognised and the order the text is read in.',
        'Word export (.docx) is built straight from your CV data as real text, and .docx is the format most applicant tracking systems accept. One caveat: 12 of the 18 templates export to Word as a two-column table to keep their layout, and as noted above, some parsers read tables poorly. Minimalist, Compact, Classic Professional, Editorial, Modern Timeline, and Portrait give you a one-column Word file. HTML export also preserves actual, selectable text for the full content.',
      ],
    },
    {
      heading: 'Test your own CV the way a parser reads it',
      paragraphs: [
        'Open the file you exported, select all the text and paste it into a plain-text editor. Everything should be there, in a sensible order: your name and contact details first, each job’s title, employer and dates together, and the section headings in plain words. If you can’t select the text at all, the file is an image. If the order is scrambled, a parser will scramble it too.',
      ],
    },
    {
      heading: 'Three ATS myths',
      list: [
        '"An ATS rejects every designed CV." It doesn’t reject designs; it misreads some layouts. One column is the safest, and a clean design can still look good.',
        '"You need a 100% keyword match." You need the important terms you genuinely have. A CV stuffed to match everything reads badly to the person who decides.',
        '"ATS-friendly means plain and boring." It means readable structure: clear headings, one column, real text. Type, spacing and a little colour are fine.',
      ],
    },
    {
      heading: 'Write content that scores well and reads well',
      paragraphs: [
        'Stuffing keywords in for the parser doesn’t work for either audience — ATS scoring surfaces missing terms, but the final reader is still a person. PortifyCV’s built-in suggestions panel flags passive phrasing ("responsible for") and experience bullets that don’t open with a strong verb or are missing a measurable number — the same things that make text score better and read better.',
      ],
      linkParagraphs: [
        {
          before: 'See the full ',
          linkText: 'How to Write a CV',
          linkTo: ROUTES.howToWrite,
          view: 'howToWrite',
          after: ' guide for weak-vs-strong rewrite examples.',
        },
      ],
    },
    {
      heading: 'A quick pre-submit checklist',
      list: [
        'Switch to ATS-friendly mode and check nothing is missing or reordered strangely',
        'Paste your target job description and check your keyword match',
        'Confirm contact info appears as real text, not inside an image',
        'If the destination system needs genuinely parseable text, export Word from a one-column template (or HTML) instead of PDF',
        'Use plain section headings and one date format throughout',
        'Paste the exported text into a plain-text editor and check it reads in order',
      ],
    },
  ],
  ctaLabel: 'Check your ATS score',
  ctaNote: 'No login. Your CV stays in your browser.',
}
