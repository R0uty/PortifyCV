// The Finnish CV examples page in English.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

// The understated templates the "safe choice" section links, as
// ExampleCvLinks pairs with no example (each links its template page).
const SAFE_TEMPLATES = [['minimal', null], ['classicProfessional', null], ['navyProfessional', null]]

export default {
  kicker: 'Examples',
  title: 'Finnish CV Examples',
  intro:
    'A Finnish CV differs from a lot of international practice in a few concrete ways. Here’s what to include, what to leave out, and how PortifyCV supports a bilingual application.',
  sections: [
    {
      heading: 'What to leave out',
      paragraphs: [
        'A national ID number, marital status, or other sensitive personal details don’t belong on a CV — they have nothing to do with your qualifications, and in many countries asking for them would even be illegal. PortifyCV’s Personal Information section only asks for name, title, and contact details — there’s no field where this kind of data could accidentally end up.',
      ],
    },
    {
      heading: 'Length and structure',
      paragraphs: [
        'One or two pages is enough for most people — a longer CV doesn’t read as more experienced, it reads as unedited. The structure is close to the rest of Europe: contact details, a short summary, work experience, education, skills, and often a dedicated languages section.',
      ],
    },
    {
      heading: "Photo and personal details",
      paragraphs: [
        "A photo is common on Finnish CVs but not required. If you add one, use a plain, recent headshot; leaving it out is never held against you. Older Finnish CVs often listed a date of birth, family and hobbies in detail; today the convention is name, title, phone, email, city and a LinkedIn link.",
      ],
    },
    {
      heading: "Dates, job titles and degrees",
      list: [
        "Finnish dates usually look like \"1/2022–3/2024\". Pick one format and keep it.",
        "Keep job titles in the language of the CV, and add the original in brackets when a Finnish title has no clear English equivalent.",
        "Name degrees the way they’re officially translated, such as \"Bachelor of Engineering (AMK)\" or \"Master of Science (Technology)\", so a reader abroad knows the level.",
      ],
    },
    {
      heading: 'The languages section matters more than usual',
      paragraphs: [
        'Finnish employers often ask about both Finnish and Swedish proficiency in addition to English. PortifyCV’s Languages section lets you mark a proficiency level for each — worth filling in carefully, since it’s one of the first things many recruiters in Finland check.',
      ],
    },
    {
      heading: "Language certificates: YKI and civil-service Swedish",
      paragraphs: [
        "If you’ve taken the National Certificate of Language Proficiency (YKI), name the language and level, such as \"Finnish, YKI level 4\". It tells an employer more than \"good\". For public-sector jobs, proof of civil-service Swedish (virkamiesruotsi) or Finnish is often a requirement, so list it if you have it.",
      ],
    },
    {
      heading: 'Build it in Finnish — or both languages',
      paragraphs: [
        'PortifyCV runs entirely in Finnish through the language toggle: the whole builder, preview, and exports switch, so you can write a CV directly in the language your target employer expects instead of writing it in English and translating afterward. The CV’s own language can also differ from the app’s: Settings › CV language sets the CV’s headings, dates and exports, so you can use the builder in English and still get a Finnish CV, or the other way round.',
      ],
    },
    {
      heading: 'The same content in both languages',
      examplePair: {
        weakLabel: 'English',
        weak: '"Led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
        strongLabel: 'Finnish',
        strong: '"Johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
      },
      paragraphsAfter: [
        'The structure and numbers stay the same — only the language changes. Avoid a direct word-for-word translation, which often reads awkwardly; rewrite the sentence naturally in the target language instead.',
      ],
    },
    {
      heading: "References",
      paragraphs: [
        "Finnish employers do contact references, often near the end of the process. Listing one or two names with their role and phone number is common; \"references on request\" works too. Ask each person before you list them.",
      ],
    },
    {
      heading: "Conscription, civil service and voluntary work",
      paragraphs: [
        "Completed military or civilian service can be listed briefly, and it’s worth a line when it’s relevant: leader training, a specialist role, or skills the job needs. Voluntary work and positions of trust (luottamustehtävät) in associations are valued in Finland; give them a short entry with what you did.",
      ],
    },
    {
      heading: "Applying: a CV plus a hakemus, often through a form",
      paragraphs: [
        "Most Finnish employers expect a CV and a separate application letter, the hakemus. Many use an online form where you upload the CV and paste the letter or answer a few questions. Write both in the language of the job posting.",
      ],
    },
    {
      heading: 'A safe, professional template choice',
      paragraphs: [
        `These three read clean and understated, matching the generally restrained expectations of Finnish employers — but any of the ${TEMPLATE_COUNT} templates works, and switching never touches your text:`,
      ],
      templateLinks: SAFE_TEMPLATES,
      linkParagraphs: [
        {
          before: 'See all ',
          linkText: `${TEMPLATE_COUNT} free templates`,
          linkTo: ROUTES.freeTemplates,
          view: 'freeTemplates',
          after: '.',
        },
      ],
    },
  ],
  ctaLabel: 'Start building your CV',
  fullExamples: {
    heading: 'Full CV examples in the European template',
    intro: 'The European template follows the Europass-style layout common across the EU. Each example opens as a complete CV in the language you have selected (switch to FI for Finnish), and "Use this example" loads it into the builder to edit.',
  },
  ctaNote: 'No login. Available in Finnish and English.',
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
    { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
  ],
}
