// The CV skills examples page in English.
import { ROUTES } from '../../../utils/routes.js'

export default {
  kicker: 'Examples',
  title: 'CV Skills Examples',
  intro:
    'The skills section is the shortest part of your CV, and often the first place a recruiter — or an applicant tracking system — looks for keywords. Here’s how to choose and organize skills that actually matter.',
  sections: [
    {
      heading: 'Two kinds of skills — and why only one belongs in the list',
      paragraphs: [
        'Hard skills are verifiable: tools, programming languages, methods, certifications. These belong in the skills section as-is. Soft skills ("leadership," "communication," "team player") don’t prove anything floating alone in a list — show them inside your experience bullets next to a concrete achievement instead of naming them separately in a skills list.',
      ],
    },
    {
      heading: 'Example skill groupings',
      paragraphs: [
        'These are illustrative groupings, not exhaustive lists — pick and adapt what fits your own field:',
      ],
      list: [
        'Design tools: Figma, Sketch, Adobe XD, Webflow, Design Systems, Prototyping',
        'Engineering: Python, SQL, JavaScript, React, Git, Docker, AWS',
        'Process and methodology: Agile/Scrum, User Research, A/B Testing, Stakeholder Management',
      ],
      paragraphsAfter: [
        'PortifyCV automatically groups your skills into categories like these (Frameworks, Databases, Cloud, DevOps, Security) in several templates — just list them, keyword detection handles the grouping for you.',
      ],
    },
    {
      heading: "Skill groupings outside tech",
      paragraphs: [
        "Every field has its own hard skills. A few starting points:",
      ],
      list: [
        "Healthcare: patient assessment, medication administration, wound care, electronic patient records, infection control",
        "Finance and accounting: financial reporting, month-end close, IFRS, budgeting, Excel modelling, an ERP system you’ve used",
        "Sales and marketing: CRM (name the system), pipeline management, negotiation, SEO, campaign analytics",
        "Customer service: ticketing systems, live chat, complaint handling, service level targets",
        "Education: curriculum planning, classroom management, assessment design, digital learning platforms",
        "Hospitality: food safety, menu costing, stock control, rota planning",
      ],
    },
    {
      heading: 'Language proficiency belongs in its own section',
      paragraphs: [
        'Spoken and written language ability (English — Fluent, Finnish — Native) doesn’t belong in the skills section — PortifyCV has a dedicated "Languages" section where each language gets its own proficiency level. Mixing it into the skills list loses both: proficiency doesn’t read clearly buried among other skills.',
      ],
    },
    {
      heading: "Show soft skills in your bullets, not in the list",
      examplePair: {
        weakLabel: "Weak",
        weak: "Skills: \"Excellent communication skills, leadership, problem solving\"",
        strongLabel: "Strong",
        strong: "Experience bullet: \"Led a team of 6 through a system migration, running weekly updates for 40 users; no deadlines missed.\"",
      },
      paragraphsAfter: [
        "The strong version shows leadership and communication without naming either. A reader believes what you did more than what you call yourself.",
      ],
    },
    {
      heading: "Skill levels and ratings: keep them honest",
      paragraphs: [
        "Stars, bars and percentages look tidy but don’t mean much: is \"4 out of 5\" in Excel pivot tables or macros? If you show a level, make it something a reader can check: years of use, the size of what you built with it, or a certificate. Some templates show dots for skill levels; if you use one, rate yourself the way you would defend in an interview.",
        "For languages, use the common European scale (A1 to C2) or plain words such as native, fluent, professional or basic.",
      ],
    },
    {
      heading: 'How many skills — not too many, not too few',
      paragraphs: [
        'Fewer than four reads thin; PortifyCV’s built-in check flags a skills section with under four entries. At the other end: an exhaustive list of 30 skills doesn’t stand out — a recruiter can’t tell which ones are actually your strengths. 8-15 carefully chosen skills you can defend in an interview is usually the right range.',
      ],
    },
    {
      heading: "Where else skills belong",
      paragraphs: [
        "The skills list is for scanning; the rest of the CV is the proof. Name your two or three most important skills in the summary too, and make sure each key skill shows up at least once in an experience bullet with a result. Some templates also have a Core Strengths section for broader capabilities, such as \"budget ownership\" or \"team building\", that don’t fit a tool list.",
      ],
    },
    {
      heading: "Keep the list current",
      list: [
        "Remove tools nobody hires for any more, and versions unless the posting asks for one.",
        "Drop basics every candidate is assumed to have, like email or web browsers.",
        "Put the skills this job needs first; the list doesn’t have to be alphabetical.",
      ],
    },
    {
      heading: 'Match your skills to the job posting',
      paragraphs: [
        'The same skill can be phrased different ways ("UX research" vs. "User research") — if the posting uses a specific term and you have that skill, match its wording.',
      ],
      linkParagraph: {
        before: 'PortifyCV’s ',
        linkText: 'ATS panel',
        linkTo: ROUTES.atsGuide,
        after: ' lists the skills and requirements it recognises in a pasted job posting, and which of them your CV is missing.',
      },
    },
    {
      heading: "Changing careers? Lead with transferable skills",
      paragraphs: [
        "Look for skills your old job and the new one share, and name them in the new field’s words: a teacher moving into training design has \"curriculum design\" and \"learning assessment\"; a retail manager moving into operations has \"inventory planning\" and \"staff scheduling\". Back each one with a bullet from your past roles.",
      ],
    },
    {
      heading: 'Mistakes to avoid',
      list: [
        'Vague filler with nothing to back it up ("Microsoft Office," "team player," "hard worker")',
        'Listing skills you couldn’t defend in an interview',
        'One undifferentiated wall of text instead of separate, scannable entries',
        'Mixing language proficiency into the skills list instead of its own section',
      ],
    },
  ],
  ctaLabel: 'Add your skills now',
  ctaNote: 'No login. Auto-grouped in several templates.',
  seeAlso: [
    { to: ROUTES.howToWrite, view: 'howToWrite', text: 'How to Write a CV' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
    { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
  ],
}
