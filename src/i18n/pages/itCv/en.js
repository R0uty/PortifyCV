// The IT CV examples page in English.
import { ROUTES } from '../../../utils/routes.js'
import { fieldSearch } from '../../../utils/templateFields.js'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

export default {
  kicker: 'Examples',
  title: 'IT CV Examples',
  intro:
    'From sysadmin to service desk: IT hiring managers look for specific systems, the size of the environment and certifications, not generic "computer skills." Here’s how to make that visible, with a full example CV at the end.',
  sections: [
    {
      heading: 'What an IT hiring manager looks for first',
      paragraphs: [
        'In the first scan a hiring manager looks for four things: how big an environment you supported, at what level (first, second or third line), which systems and tools you used, and what changed because you were there. If those show up in the first three lines of your latest role, your CV is already ahead of most.',
      ],
    },
    {
      heading: 'An experience bullet that shows a metric',
      examplePair: {
        weakLabel: 'Weak',
        weak: '"Responsible for maintaining company IT infrastructure and helping employees with computer issues."',
        strongLabel: 'Strong',
        strong: '"Reduced average helpdesk ticket resolution time from 48 hours to 6 hours by rebuilding the internal knowledge base and automating password-reset requests."',
      },
      paragraphsAfter: [
        'The same pattern works across IT roles:',
      ],
      list: [
        'Systems administration. Weak: "Maintained servers." Strong: "Ran 40 Windows and Linux servers at 99.9% availability and automated monthly patching, saving about 10 hours of work a month."',
        'Networking. Weak: "Looked after the company network." Strong: "Rebuilt the network and VPN for three offices; tickets caused by network outages fell by about 70%."',
        'Service desk. Weak: "Helped users with their problems." Strong: "Handled about 40 tickets a day at a 92% first-contact resolution rate."',
      ],
    },
    {
      heading: 'Describe your environment in numbers',
      paragraphs: [
        'The same job title can mean an environment of 20 users or 2,000. Give the size, and a reader sees straight away what kind of work you’re used to:',
      ],
      list: [
        'users ("900 users across three offices")',
        'devices and servers ("450 laptops, 40 servers")',
        'ticket volumes and targets ("about 40 tickets a day, 8-hour SLA")',
        'availability or outages ("99.9% availability", "no unplanned outages in 2024")',
      ],
    },
    {
      heading: 'Name the level when titles vary',
      paragraphs: [
        'IT titles mean different things at different companies: "IT support" can be phone support or server administration. Add the level in brackets after the title, like "IT Support Specialist (2nd line)", so a recruiter doesn’t have to guess. If you moved up a level with the same employer, list the roles separately so the progression shows.',
      ],
    },
    {
      heading: 'Certifications belong in their own section, named precisely',
      paragraphs: [
        'CompTIA A+/Network+/Security+, Cisco CCNA, Microsoft certifications: give each its exact name, issuer and year in a section of its own. PortifyCV’s Certificates section has fields for issuer, year and expiry date, so validity shows directly. Many IT certifications expire, and recruiters check.',
      ],
    },
    {
      heading: 'Skills that read as IT, not office skills',
      paragraphs: [
        'Group skills by area so a reader finds theirs quickly:',
      ],
      list: [
        'Systems: Active Directory, Microsoft 365, Windows Server, Linux',
        'Device management: Intune, SCCM, Jamf',
        'Networking: TCP/IP, DNS, DHCP, VPN, firewalls',
        'Tools and process: ServiceNow, Jira, ITIL',
        'Virtualization and cloud: VMware, Hyper-V, Azure',
      ],
      paragraphsAfter: [
        '"Microsoft Office" doesn’t stand out. "Active Directory user management across a 500-seat environment" does.',
      ],
    },
    {
      heading: 'Show automation and documentation',
      paragraphs: [
        'The strongest IT candidates don’t just fix the same fault again; they stop it happening. If you wrote a script that removed repetitive work, or a guide that cut down questions, say so with a number: "PowerShell script for new-starter accounts removed about 35 tickets a week." A line like that says more than a long list of tools.',
      ],
    },
    {
      heading: 'Early in your career: a home lab and projects',
      paragraphs: [
        'With little work experience, a test environment of your own is good evidence: a domain built on virtual machines, VLANs on your home network, or a small script that handles an everyday task. Put them in the Projects section the way you’d describe a job: what you built, with what, and what you learned or what improved.',
      ],
    },
    {
      heading: 'IT applications go through an ATS more often than most',
      paragraphs: [
        'Larger companies screen IT applications automatically especially often, so a single-column layout with clear section headings pays off more here than in most fields.',
      ],
      linkParagraphs: [
        {
          before: 'Read the ',
          linkText: 'ATS-friendly CV guide',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ' and check your own CV before you apply.',
        },
      ],
    },
  ],
  ctaLabel: 'Start building your CV',
  ctaNote: 'No login. Nothing saved unless you choose to.',
  fullExamples: {
    heading: 'A full IT support specialist CV',
    intro: 'The same example person in two templates: six years on service desks, the environment in numbers, automation and certificates with their expiry dates. "Use this example" loads it into the builder to edit.',
  },
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
    { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tech CV templates' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
  ],
}
