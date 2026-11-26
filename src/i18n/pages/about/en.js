// The About page in English.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'About',
  title: 'About PortifyCV',
  intro:
    'PortifyCV is a free, browser-based CV builder. No account, no server, '
    + 'no automatic saving — you build a CV, take it away as a file or a '
    + 'share link, and that is it.',
  sections: [
    {
      heading: 'What PortifyCV is',
      paragraphs: [
        'PortifyCV helps you put together a clean, print-ready CV in a few '
        + 'minutes. You edit the CV right on the page (or in a classic form), '
        + `choose from ${TEMPLATE_COUNT} templates with three looks each, and get an `
        + 'ATS-friendly mode for applicant tracking systems, export to PDF, '
        + 'Word, HTML, and JSON, and a cover letter drafted from your CV. The '
        + 'whole interface works in both English and Finnish.',
        'Every feature is free. There are no watermarks, no paywalled '
        + 'templates, and no required sign-up.',
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'PortifyCV is a static web app that runs entirely in your browser. '
        + 'It has no backend server and no database. Everything you type '
        + "stays in the tab's memory for the length of your session and is "
        + 'never uploaded anywhere. Your CV leaves your device only if you '
        + 'choose to export a file or generate a share link.',
        {
          parts: [
            'The full detail on data handling is in the ',
            {
              link: ROUTES.privacy,
              view: 'privacy',
              text: 'privacy policy',
            },
            '.',
          ],
        },
      ],
    },
    {
      heading: 'Who makes it',
      paragraphs: [
        'PortifyCV is an independent, one-developer project. It is not '
        + 'backed by a company or an investor — it exists because a free, '
        + 'straightforward CV tool that does not demand an account was '
        + 'worth building.',
      ],
    },
    {
      heading: 'How it is funded',
      paragraphs: [
        'PortifyCV is free and will stay free. To cover the cost of '
        + 'running it, the site shows ads through Google AdSense.',
        {
          parts: [
            'In the EEA, the UK, and Switzerland a Google-certified '
            + 'consent message is shown, and the use of advertising '
            + 'cookies is described in the ',
            {
              link: ROUTES.privacy,
              view: 'privacy',
              text: 'privacy policy',
            },
            '. Ads have no access to your CV content.',
          ],
        },
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        {
          parts: [
            'Questions, bug reports, and feedback: ',
            { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
            '.',
          ],
        },
      ],
    },
  ],
}
