// The cover letter examples page in English.
import { ROUTES } from '../../../utils/routes.js'

export default {
  kicker: 'Examples',
  title: 'Cover Letter Examples',
  intro:
    'A cover letter has one job: explain why you specifically fit this specific role, in words your CV doesn’t already say. Here are real structural examples — a weak and a strong version of each part — and how PortifyCV drafts the first version for you.',
  sections: [
    {
      heading: 'The four parts a good cover letter needs',
      paragraphs: [
        'An opening that names the role and the company. A paragraph that connects your most relevant experience to this role. A brief mention of your core skills. A closing that invites the next step. Nothing more — a one-page letter where every paragraph does work beats a three-page overview of your career, every time.',
      ],
    },
    {
      heading: 'An opening that works',
      examplePair: {
        weakLabel: 'Weak',
        weak: '"To Whom It May Concern, I am writing to apply for the position I saw advertised."',
        strongLabel: 'Strong',
        strong: '"I’m writing to apply for the Senior Product Designer role at Example Oy. I’ve spent the last five years building design systems that survive contact with real engineering teams."',
      },
      paragraphsAfter: [
        'Name the role and the company in the first sentence. If you know the hiring manager’s name, use it instead of "To Whom It May Concern" — it signals you did your homework.',
      ],
    },
    {
      heading: 'Connecting your experience to the role',
      examplePair: {
        weakLabel: 'Weak',
        weak: '"I have experience in many areas and am confident I would be a good fit."',
        strongLabel: 'Strong',
        strong: '"In my current role as Senior Product Designer at Example Oy: led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
      },
      paragraphsAfter: [
        'Pick one concrete achievement from your CV and connect it directly to what the job posting is asking for — don’t restate your whole CV as prose.',
      ],
    },
    {
      heading: "Why this company, in one specific sentence",
      paragraphs: [
        "Say why you want this job at this company, not just any job. One specific reason is enough, and it’s the part most letters skip.",
      ],
      examplePair: {
        weakLabel: "Weak",
        weak: "\"Example Oy is a leading company with a great culture, and I would love to be part of it.\"",
        strongLabel: "Strong",
        strong: "\"Your move to self-service onboarding is exactly the problem I solved at my last job, where it cut support tickets by a third.\"",
      },
      paragraphsAfter: [
        "The strong version could only have been written to this company. Look for a recent product launch, a stated goal in the job posting, or a problem the role exists to solve.",
      ],
    },
    {
      heading: "A skills paragraph that proves, not lists",
      examplePair: {
        weakLabel: "Weak",
        weak: "\"I am skilled in Figma, user research, prototyping, accessibility and design systems.\"",
        strongLabel: "Strong",
        strong: "\"The posting asks for accessibility experience: I led our move to WCAG 2.1 AA across 40 screens and trained the team to keep it there.\"",
      },
      paragraphsAfter: [
        "Your CV already lists the skills. The letter picks the one or two the posting cares about most and shows them in action.",
      ],
    },
    {
      heading: 'A closing that invites the next step',
      examplePair: {
        weakLabel: 'Weak',
        weak: '"I hope to hear from you soon."',
        strongLabel: 'Strong',
        strong: '"I’d welcome the opportunity to discuss how my experience could contribute to your team. Thank you for your time and consideration."',
      },
    },
    {
      heading: "Length, format and tone",
      list: [
        "About 250 to 400 words, in three or four short paragraphs. One page at most.",
        "The same name and contact details at the top as on your CV, so the two clearly belong together.",
        "First person and plain words. Confident is fine; superlatives about yourself (\"exceptional\", \"passionate\") aren’t evidence.",
        "Send it as the file type the posting asks for, with a useful name like \"Firstname-Lastname-cover-letter.pdf\".",
      ],
    },
    {
      heading: "Phrases to replace, and what to write instead",
      list: [
        "\"I am a team player\" → one sentence about something the team achieved and your part in it.",
        "\"I am passionate about…\" → what you’ve done about it: a project, a course, a result.",
        "\"I believe I would be a great fit\" → the specific overlap between the posting and your experience.",
        "\"Please find attached my CV\" → leave it out; the reader can see the attachment.",
      ],
    },
    {
      heading: 'Let PortifyCV draft the first version',
      paragraphs: [
        'PortifyCV’s cover letter generator isn’t AI — it’s a deterministic template that pulls straight from your CV data: the opening names the role and company you’re applying to (if you provide them), the second paragraph pulls your most recent role and its best achievement or description, the third lists your top skills, and the closing is pre-written. If you have pasted a job ad into the ATS panel, the third paragraph lists up to four of its requirements that your CV covers instead, and the letter is saved with your CV (but never put in a share link). Same "nothing touches a server" principle as the rest of the app — the draft is built entirely in your browser.',
      ],
      linkParagraph: {
        before: 'Fill in the company name, role title, and hiring manager’s name (all optional) in the ',
        linkText: 'CV builder',
        linkTo: ROUTES.builder,
        after: ', then edit from there — copy it, download it as text, or export it as a PDF.',
      },
    },
    {
      heading: "A complete short example",
      letter: true,
      paragraphs: [
        "Dear Ms Virtanen,",
        "I’m applying for the Customer Success Manager role at Example Oy. For the past four years I’ve looked after 60 mid-size customers at a software company, and I’d like to bring that to a team that is growing its customer base as fast as yours.",
        "Your posting asks for someone who can reduce churn. In my current role I set up quarterly check-ins with every customer and a warning list for accounts that stopped using key features; over two years our yearly churn fell from 14% to 8%.",
        "I also see that you’re moving onboarding online. I built our onboarding course in our help centre, which now handles about half of new customers’ first questions.",
        "I’d be glad to talk about how I could help your team keep the customers it wins. Thank you for reading.",
        "Best regards,",
    "John Doe",
      ],
      paragraphsAfter: [
        "About 170 words: role and company first, one proof per paragraph tied to the posting, a clear close.",
      ],
    },
    {
      heading: "Applying through a form or by email",
      paragraphs: [
        "Many applications have no place for a letter file: a form asks \"Why are you interested in this role?\" or you send an email. Use the same structure, shorter: two or three sentences on why this role, one piece of evidence, and the close. In an email, the letter is the message itself and your CV is the attachment.",
      ],
    },
    {
      heading: "Applying in Finland",
      paragraphs: [
        "In Finland the cover letter is called a hakemus (or työhakemus) and is expected for most jobs. It follows the same shape: one page, the role and company first, concrete evidence and a reason for this employer. Write it in the language of the posting. A Finnish-language posting expects a Finnish letter even if the workplace uses English.",
      ],
    },
    {
      heading: 'Mistakes to avoid',
      list: [
        'Restating your CV word-for-word instead of connecting it to this specific role',
        '"To Whom It May Concern" when you could have found a name',
        'No specific reason for wanting this particular company',
        'Going longer than one page',
      ],
    },
  ],
  ctaLabel: 'Generate your cover letter',
  ctaNote: 'No login. The draft stays in your browser.',
  seeAlso: [
    { to: ROUTES.howToWrite, view: 'howToWrite', text: 'How to Write a CV' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
    { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
  ],
}
