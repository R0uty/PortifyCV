// The How to write a CV guide in English.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Guide',
  title: 'How to Write a CV',
  intro:
    'A CV has one job: get you an interview. This is a practical walkthrough of what to include, what to cut, and how to phrase it, with before-and-after examples you can copy the shape of.',
  sections: [
    {
      heading: 'Start with the sections that actually matter',
      paragraphs: [
        'Most CVs need, in this order: contact details, a short summary, experience, education, and skills. Add certificates, projects, languages, or links only if they add something a recruiter would act on. An "Interests" section that says "reading, hiking" takes space a hiring manager could spend on your last job.',
        'The order can change with your stage. A recent graduate with little work history leads with education and projects; someone with ten years of experience keeps education to a line or two near the end. PortifyCV lets you hide any section per CV and move sections up or down, and the preview updates as you do, so you can see how much room each one takes before you commit.',
      ],
    },
    {
      heading: 'Contact details: what to include and what to leave out',
      list: [
        'Include your full name, a professional email address, a phone number, and your city (a full street address isn’t needed).',
        'Add a LinkedIn profile, portfolio or GitHub link if it shows work relevant to the job, and check that it’s up to date.',
        'Leave out your date of birth, ID numbers, marital status and nationality. They aren’t qualifications, and in many countries an employer may not even ask for them.',
        'A photo is optional and depends on the country and field: common in parts of Europe, unusual in the US and UK. If you add one, use a plain, recent headshot.',
      ],
    },
    {
      heading: 'Write a summary that says something specific',
      paragraphs: [
        'Two or three sentences: who you are professionally, your strongest piece of evidence, and what you want next. It should read like the strong first line of a cover letter, not a job title with adjectives attached.',
      ],
      examplePair: {
        weakLabel: 'Weak',
        weak: '"Hardworking professional with excellent communication skills seeking a challenging opportunity."',
        strongLabel: 'Stronger',
        strong: '"Backend engineer who has shipped three production payment systems and cut API latency by 40% at two Series B startups."',
      },
      paragraphsAfter: [
        'The difference: the second version can be checked. It names what you did and roughly how well. If a sentence could describe thousands of other candidates unchanged, rewrite it.',
        'Changing careers? Lead with the transferable proof, not the old job title: "Former teacher who built and ran a 200-student online course platform, now moving into instructional design."',
      ],
      linkParagraphs: [
        {
          before: 'The same "specific, not generic" rule applies to a cover letter. See ',
          linkText: 'cover letter examples',
          linkTo: ROUTES.coverLetterExamples,
          view: 'coverLetterExamples',
          after: ' for weak and strong openings and closings.',
        },
      ],
    },
    {
      heading: 'Write experience bullets that show impact, not duties',
      paragraphs: [
        'List jobs newest first, with the title, employer, city and dates. Give recent roles three to five bullets and older ones one or two. Two failure modes show up constantly:',
      ],
      list: [
        'Describing responsibilities instead of results ("Responsible for managing the support queue"). That only tells a reader what you were assigned, not what happened because you did it.',
        'Opening every bullet with a filler phrase instead of an action verb: "Was in charge of onboarding" instead of "Led onboarding for 40 new hires."',
      ],
      paragraphsAfter: [
        'Rewrite each bullet as: [strong verb] + [what you did] + [measurable result]. "Reduced onboarding time from three weeks to five days by rebuilding the training checklist" tells a recruiter what to expect from you in three seconds. PortifyCV’s suggestions check for exactly this: they flag passive phrases like "responsible for", bullets that don’t open with a strong verb, and bullets with no number, right next to the field you’re editing.',
      ],
    },
    {
      heading: 'More before-and-after bullets, by role',
      paragraphs: [
        'The same pattern works far beyond tech. If you don’t have an exact number, an honest approximation ("about 30", "roughly a third") is still better than none.',
      ],
      list: [
        'Sales. Weak: "Handled key accounts." Strong: "Grew revenue from 12 key accounts by 18% in a year by moving them to quarterly business reviews."',
        'Nursing. Weak: "Cared for patients on a busy ward." Strong: "Cared for up to 8 patients per shift on a 30-bed surgical ward and trained 5 new nurses on the medication system."',
        'Customer service. Weak: "Answered customer emails." Strong: "Answered about 60 customer emails a day and cut the average first reply time from 9 hours to 2."',
        'Teaching. Weak: "Taught maths to secondary students." Strong: "Taught maths to 120 students a year; the classes’ pass rate in the national exam rose from 71% to 84% in two years."',
      ],
    },
    {
      heading: 'Education, certificates and projects',
      paragraphs: [
        'For each degree, give the name, the school and the years; add a thesis or grade only if it helps for this job. Certificates get the issuer and the year, plus the expiry date when they lapse (PortifyCV’s Certificates section has a field for it), because a recruiter checks whether they’re still valid.',
        'Projects earn their place when they show skills your job history doesn’t: name, one line on what it does, your part in it, and a link. For graduates and career changers, they often carry more weight than early jobs.',
      ],
    },
    {
      heading: 'Choose skills a recruiter would search for, not everything you’ve touched',
      paragraphs: [
        'List skills you can defend in an interview, grouped so a reader, human or software, can find the ones that match the job posting in a few seconds.',
      ],
      linkParagraphs: [
        {
          before: 'See ',
          linkText: 'CV skills examples',
          linkTo: ROUTES.cvSkills,
          view: 'cvSkills',
          after: ' for how to group and phrase them, and how many is actually the right number.',
        },
      ],
    },
    {
      heading: 'Tailor it to each job',
      paragraphs: [
        'Sending the same CV everywhere is the most common reason a good CV gets no replies. Tailoring doesn’t mean rewriting it each time; it takes about fifteen minutes:',
      ],
      list: [
        'Read the posting and mark the three or four things it asks for most.',
        'Use the posting’s exact words where they’re true for you: if it says "stakeholder management", don’t only write "worked with partners".',
        'Move the bullets that prove those things to the top of each role.',
        'Adjust the summary’s last sentence to this job.',
      ],
      linkParagraphs: [
        {
          before: 'In PortifyCV’s Classic mode, paste the job posting into the ',
          linkText: 'ATS score panel',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ' to see which of its key terms your CV doesn’t mention yet.',
        },
      ],
    },
    {
      heading: 'Length and format',
      list: [
        'One page early in your career; two pages once you have several relevant roles. More than two rarely helps.',
        'One date format throughout (for example "Jan 2022 – Mar 2024"), and one style for headings.',
        'A readable font at 10 to 12 points, with enough white space that each section stands apart.',
        'Send the file type the posting asks for. If an applicant tracking system will read it, a Word file from a one-column template keeps your text machine-readable; the ATS guide below explains why.',
      ],
    },
    {
      heading: 'Mistakes worth fixing before you send it',
      list: [
        'A generic objective ("Seeking a position where I can grow professionally") that says nothing about this job',
        'Inconsistent or missing dates. Recruiters read gaps as red flags whether or not there’s a good reason, so give a short reason for longer ones',
        'A wall of text with no bullets. Nobody reads long paragraphs in a first scan of a few seconds',
        'No numbers anywhere. If you can approximate an impact, do it',
        'Abbreviations only your old employer used. Spell them out once',
        'Typos and a wrong company name. Read it aloud once, or have someone else read it',
      ],
    },
    {
      heading: 'Format for the reader that sees it first: often software',
      paragraphs: [
        'Many companies route applications through an applicant tracking system before a person opens them. A layout with several columns, icons instead of section headings, or text inside boxes and tables can get scrambled or dropped by that software, even if it looks fine to you.',
      ],
      linkParagraphs: [
        {
          before: 'Read the ',
          linkText: 'ATS-friendly CV guide',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ' for what breaks, which export to use, and how to check your own CV.',
        },
      ],
    },
    {
      heading: 'Then choose a layout for the human reader',
      paragraphs: [
        'Once the content is solid, the template is a wrapper around it. Swapping templates in PortifyCV never touches your text, so it’s safe to try a few, and each comes in three looks.',
      ],
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
    {
      heading: 'A final check before you send it',
      list: [
        'Your name, email and phone number are correct and match your LinkedIn profile.',
        'The summary mentions this job’s field and your strongest proof.',
        'Every recent role has at least one bullet with a number.',
        'The skills include the posting’s key terms that are true for you.',
        'Dates are consistent and there are no unexplained gaps.',
        'The file name is useful, like "Firstname-Lastname-CV.pdf", not "cv_final_v3.pdf".',
      ],
    },
  ],
  ctaLabel: 'Start building your CV',
  ctaNote: 'No login. Nothing saved unless you choose to.',
}
