// The cybersecurity CV examples page in English.
import { ROUTES } from '../../../utils/routes.js'
import { fieldSearch } from '../../../utils/templateFields.js'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

export default {
  kicker: 'Examples',
  title: 'Cybersecurity CV Examples',
  intro:
    'A security CV needs to show both breadth (frameworks, compliance) and hands-on specificity (tools, real incidents) — "cybersecurity professional" tells a recruiter neither.',
  sections: [
    {
      heading: 'An experience bullet that shows what you actually did',
      examplePair: {
        weakLabel: 'Weak',
        weak: '"Responsible for company cybersecurity and monitoring threats."',
        strongLabel: 'Strong',
        strong: '"Led incident response for a phishing campaign affecting 400 employees, containing the breach within 3 hours and rebuilding SIEM detection rules to catch the same pattern going forward."',
      },
    },
    {
      heading: 'Certifications worth naming precisely',
      paragraphs: [
        'CompTIA Security+, CEH, OSCP, CISSP, CISM — write them into their own Certificates section with issuer and year. Several of these expire, so PortifyCV’s expiry-date field is especially useful in this field.',
      ],
    },
    {
      heading: "Show scope and severity in numbers",
      paragraphs: [
        "Security work is easier to judge with numbers: endpoints or users monitored, alerts triaged a day, incidents handled a year, and how fast you detect and contain them (often called MTTD and MTTR). \"Triaged about 200 alerts a week across 15 client networks\" places you at once.",
      ],
    },
    {
      heading: 'Skills that show real tools',
      list: [
        'SIEM: Splunk, QRadar, Microsoft Sentinel',
        'Vulnerability management and penetration testing',
        'Incident response and forensic analysis',
        'Compliance: NIST, ISO 27001',
        'Identity and access management (IAM)',
      ],
    },
    {
      heading: "Certifications that need renewing",
      paragraphs: [
        "Many security certifications expire or need continuing education credits to stay valid. List each with its issuer, the year and the expiry date (PortifyCV’s Certificates section has a field for it), so a recruiter doesn’t have to check. Put the certifications the posting names first.",
      ],
    },
    {
      heading: "Write about incidents without revealing anything confidential",
      paragraphs: [
        "Describe the kind of incident, your part and the outcome, never client names, IP addresses or details that could identify a system: \"Contained a ransomware outbreak at a 400-person client within 3 hours; no data was lost\" is specific enough. If a description would need confidential detail to make sense, keep it general.",
      ],
    },
    {
      heading: 'Hands-on proof: Hack The Box, TryHackMe, CTF results',
      paragraphs: [
        'PortifyCV’s Links section has dedicated fields for Hack The Box and TryHackMe specifically — if you have a profile on either, it belongs there as its own line, not buried in prose.',
      ],
    },
    {
      heading: "Moving into security from IT or development",
      paragraphs: [
        "Much of what a SOC or security team needs you may already do: reading logs, networking, scripting, patching, access management. Name those skills in security terms (\"log analysis\", \"hardening\", \"identity and access management\"), add a home lab or CTF results to show you practise, and choose the side that fits your background: IT moves often lead into defensive (blue team) work, development into application security.",
      ],
    },
    {
      heading: "Security clearance",
      paragraphs: [
        "If you hold a security clearance, say so and give its level when you’re allowed to. In Finland, many public-sector and critical-infrastructure roles require a security clearance (turvallisuusselvitys), and having one can shorten the hiring process.",
      ],
    },
    {
      heading: 'These applications go through an ATS almost every time',
      paragraphs: [
        'Large companies and public-sector employers screen security applications automatically almost universally — a single-column layout with no columns or icons matters more here than in most fields.',
      ],
      linkParagraphs: [
        {
          before: 'Read the ',
          linkText: 'ATS-Friendly CV Guide',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ' and check your own score before you apply.',
        },
      ],
    },
  ],
  ctaLabel: 'Start building your CV',
  fullExamples: {
    heading: 'A full cybersecurity analyst CV',
    intro: 'The same example person in two templates. Each opens as a complete CV, and "Use this example" loads it into the builder to edit.',
  },
  ctaNote: 'No login. Nothing saved unless you choose to.',
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
    { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tech CV templates' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
  ],
}
