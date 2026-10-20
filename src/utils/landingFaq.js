import { cvTemplates } from './cvTemplates'

// The front page's FAQ (1.6.34), in one place: LandingPage renders it as
// an accordion, and index.html's FAQPage JSON-LD must say the same thing
// in English (check:template-pages compares them, since search engines
// expect FAQ markup to match the visible text). An answer is `before`,
// an optional link to a page (`link.view`, `link.text`) and `after`.
const TEMPLATE_COUNT = cvTemplates.length

export const LANDING_FAQ = {
  en: [
    {
      q: 'Is PortifyCV really free?',
      before: `Yes. No subscription, no watermark and no paid tier: all ${TEMPLATE_COUNT} templates and every export format are free.`,
    },
    {
      q: 'Do I need to create an account?',
      before: 'No. Open the builder and start typing. There’s no login and no email.',
    },
    {
      q: 'Will my CV pass applicant tracking systems (ATS)?',
      before: 'Turn on ATS view for a plain one-column layout that parsers can read, and check your CV against a job posting’s keywords. The ',
      link: { view: 'atsGuide', text: 'ATS-friendly CV guide' },
      after: ' covers the details.',
    },
    {
      q: 'What formats can I export to?',
      before: 'PDF for applications, Word to edit it elsewhere, HTML for the web, and JSON to keep editing later.',
    },
    {
      q: 'Can I share my CV without sending a file?',
      before: 'Yes. A share link carries the whole CV inside the link itself and is never sent to a server. Photos don’t fit in a link, so export JSON if they need to travel too.',
    },
    {
      q: 'What does PortifyCV store in my browser?',
      before: 'Only five small settings, such as your language, and never your CV. The optional “Restore last session” keeps a copy in that tab until you close it. The ',
      link: { view: 'privacy', text: 'privacy policy' },
      after: ' has the details.',
    },
    {
      q: 'Can I also create a cover letter?',
      before: 'Yes. The builder drafts one from your CV’s summary, latest role and top skills; copy it, download it as text or export it as a PDF. See the ',
      link: { view: 'coverLetterExamples', text: 'cover letter examples' },
      after: '.',
    },
  ],
  fi: [
    {
      q: 'Onko PortifyCV oikeasti ilmainen?',
      before: `Kyllä. Ei tilausmaksua, ei vesileimaa eikä maksullista versiota: kaikki ${TEMPLATE_COUNT} pohjaa ja kaikki vientimuodot ovat ilmaisia.`,
    },
    {
      q: 'Tarvitsenko tilin?',
      before: 'Et. Avaa editori ja ala kirjoittaa. Kirjautumista tai sähköpostia ei kysytä.',
    },
    {
      q: 'Läpäiseekö CV:ni hakijaseurantajärjestelmät (ATS)?',
      before: 'Kytke ATS-näkymä päälle, niin saat pelkistetyn yksipalstaisen asettelun, jonka jäsentimet osaavat lukea, ja vertaa CV:tä työpaikkailmoituksen avainsanoihin. ',
      link: { view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
      after: ' kertoo lisää.',
    },
    {
      q: 'Mihin muotoihin voin viedä CV:ni?',
      before: 'PDF hakemuksiin, Word muokattavaksi muualla, HTML verkkoon ja JSON myöhempää muokkausta varten.',
    },
    {
      q: 'Voinko jakaa CV:ni ilman tiedoston lähettämistä?',
      before: 'Kyllä. Jakolinkki sisältää koko CV:n itse linkissä, eikä sitä lähetetä palvelimelle. Kuvat eivät mahdu linkkiin, joten vie JSON, jos niiden pitää kulkea mukana.',
    },
    {
      q: 'Mitä PortifyCV tallentaa selaimeeni?',
      before: 'Vain viisi pientä asetusta, kuten kielesi, eikä koskaan CV:täsi. Valinnainen ”Palauta viimeisin istunto” pitää kopion siinä välilehdessä, kunnes suljet sen. ',
      link: { view: 'privacy', text: 'Tietosuojaseloste' },
      after: ' kertoo tarkemmin.',
    },
    {
      q: 'Voinko luoda myös hakemuskirjeen?',
      before: 'Kyllä. Editori luo luonnoksen CV:si yhteenvedosta, viimeisimmästä roolista ja tärkeimmistä taidoista; kopioi se, lataa tekstinä tai vie PDF:nä. Katso myös ',
      link: { view: 'coverLetterExamples', text: 'saatekirje-esimerkit' },
      after: '.',
    },
  ],
}

// One answer as plain text, as the FAQPage JSON-LD carries it.
export function faqAnswerText(item) {
  return `${item.before}${item.link ? item.link.text : ''}${item.after ?? ''}`
}
