// The developer CV examples page in English.
import { ROUTES } from '../../../utils/routes.js'
import { fieldSearch } from '../../../utils/templateFields.js'
import { templatePageLink } from '../../../utils/pageMeta.js'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

const DEVELOPER_TEMPLATE = templatePageLink('developer')

export default {
  kicker: 'Examples',
  title: 'Developer CV Examples',
  intro:
    'A developer CV doesn’t get judged on job title — it gets judged on what you’ve built and what happened because you built it. Here’s how to write experience bullets and project entries that actually show that.',
  sections: [
    {
      heading: 'An experience bullet that shows impact',
      examplePair: {
        weakLabel: 'Weak',
        weak: '"Worked on backend systems and fixed bugs."',
        strongLabel: 'Strong',
        strong: '"Migrated a monolithic Rails API to microservices, cutting p95 latency from 800ms to 120ms and reducing on-call incidents by 60%."',
      },
      paragraphsAfter: [
        'Name the system, the metric, and the number. "Fixed bugs" doesn’t tell anyone anything measurable — "reduced on-call incidents by 60%" does.',
      ],
    },
    {
      heading: "More developer bullets, by kind of work",
      list: [
        "Frontend. Weak: \"Built UI components.\" Strong: \"Rebuilt the checkout in React and cut its JavaScript by 40%; mobile conversion rose 9%.\"",
        "Backend. Weak: \"Worked on the API.\" Strong: \"Split the order API into three services and brought p95 latency from 800 ms to 120 ms.\"",
        "Data. Weak: \"Maintained data pipelines.\" Strong: \"Moved 30 nightly jobs to an orchestrated pipeline; failed runs fell from about 6 a month to 1.\"",
        "DevOps. Weak: \"Managed CI/CD.\" Strong: \"Cut build-and-deploy time from 25 to 7 minutes and moved releases from weekly to daily.\"",
        "Mobile. Weak: \"Developed app features.\" Strong: \"Shipped offline mode for an app with 200,000 users; crash-free sessions rose from 97.1% to 99.4%.\"",
      ],
    },
    {
      heading: "Put your stack next to the result",
      paragraphs: [
        "Recruiters search for technologies, but a bare list doesn’t show what you did with them. Give each job its technologies on their own line (PortifyCV’s experience entries have a field for it), and let the bullets say what you achieved. Use the names the posting uses: \"React\" rather than \"ReactJS\" if that’s what it says.",
      ],
    },
    {
      heading: 'A project entry worth structuring the same way every time',
      paragraphs: [
        'Name, one-sentence description, tech stack, and links — PortifyCV’s Projects section has dedicated fields for all of this (including GitHub and demo links), so you don’t have to force this structure into free-text.',
      ],
      examplePair: {
        weakLabel: 'Example',
        weak: '"Atlas Design System" — a shared component library adopted by six product teams.',
        strongLabel: 'Stack',
        strong: 'React, TypeScript, Storybook · github.com/... · demo link',
      },
    },
    {
      heading: 'Skills: list them, don’t hand-group them',
      paragraphs: [
        'PortifyCV detects your skills by keyword and automatically groups them (Frameworks, Databases, Cloud, DevOps, Security) in several templates, including Developer — just list them by their real name.',
      ],
      linkParagraphs: [
        {
          before: 'See ',
          linkText: 'CV skills examples',
          linkTo: ROUTES.cvSkills,
          view: 'cvSkills',
          after: ' for more.',
        },
      ],
    },
    {
      heading: "Junior or self-taught? Projects carry the CV",
      paragraphs: [
        "Without much work history, two or three good projects are your experience. Pick ones that look like real work: they solve a problem, have a README that explains them, and show a skill the job asks for. Describe each like a job: what it does, what you built, the stack, and a link to the code and, if it’s running, a demo. One finished project beats five tutorials.",
      ],
    },
    {
      heading: 'The Links section is part of the story, not an afterthought',
      paragraphs: [
        'GitHub, portfolio, and personal site belong in their own Links section — not buried in your summary. A recruiter who wants to see your code should be able to find it directly.',
      ],
    },
    {
      heading: "A GitHub profile worth linking",
      list: [
        "Pin the three to six repositories that show your best work.",
        "Give each a README: what it does, how to run it, a screenshot.",
        "If most of your work is private, say so in the profile and let the CV’s projects do the talking.",
        "An empty or abandoned profile hurts more than none; link it only when it helps.",
      ],
    },
    {
      heading: "Signals of seniority",
      paragraphs: [
        "As you grow, recruiters look past individual features to scope: systems you owned, decisions you made, people you helped grow. \"Designed the event pipeline later adopted by four teams\", \"mentored three juniors to independent ownership\", \"led the migration plan and its rollback strategy\". For senior and lead roles, at least one bullet per job should show impact beyond your own code.",
      ],
    },
    {
      heading: 'A template built for exactly this',
      linkParagraphs: [
        {
          before: 'The ',
          linkText: 'Developer template',
          linkTo: DEVELOPER_TEMPLATE.to,
          view: DEVELOPER_TEMPLATE.view,
          after: ' has a dark sidebar plus project and achievement cards — built specifically for a project-based career.',
        },
      ],
    },
  ],
  ctaLabel: 'Start with the Developer template',
  fullExamples: {
    heading: 'Full developer CV examples',
    intro: 'Each one opens as a complete CV in its template, and "Use this example" loads it into the builder to edit.',
  },
  ctaNote: 'No login. Switch templates any time.',
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
    { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tech CV templates' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
  ],
}
