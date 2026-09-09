import BuilderWalkthroughFigure from '../components/BuilderWalkthroughFigure'
import InternalNavLink from '../components/InternalNavLink'
import { cvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

// Read off the template registry instead of a hardcoded number — see
// LandingPage.jsx for why this drifted before.
const TEMPLATE_COUNT = cvTemplates.length

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Opas',
      title: 'Näin käytät CV-editoria',
      intro:
        'Kuusi vaihetta tyhjästä valmiiseen CV:hen — mistä kukin toiminto löytyy ja mihin se vaikuttaa. Sisällön kirjoittamiseen katso ',
      introLink: {
        linkText: 'Näin kirjoitat CV:n',
        linkTo: ROUTES.howToWrite,
        view: 'howToWrite',
        after: '.',
      },
      steps: [
        {
          step: 'sections',
          heading: 'Täytä osiot',
          figureLabel: 'Editorin asettelu: osiovalikko vasemmalla, lomake keskellä, esikatselu oikealla.',
          caption:
            'Vasemman reunan valikko listaa jokaisen osion ja vie siihen. Lomakkeen yläosassa olevasta Näkyvät osiot -paneelista voit kytkeä pois sen, mikä ei sovi tähän CV:hen — tiedot säilyvät joka tapauksessa. Oikean reunan esikatselu päivittyy kun kirjoitat.',
        },
        {
          step: 'bullets',
          heading: 'Terävöitä kokemuskohdat',
          figureLabel: 'Lomakekenttä, jossa yksi luettelokohta on merkitty huomiolipulla.',
          caption:
            'Kirjoittaessasi heikot kohdat merkitään suoraan kentän viereen: passiiviset ilmaukset kuten "vastuualueena", aloitukset jotka eivät ole vahva verbi, ja kohdat joista puuttuu mitattava luku. "ATS-pisteet ja ehdotukset" -paneeli laskee ne yhteen.',
        },
        {
          step: 'template',
          heading: 'Valitse pohja — sisältösi pysyy ennallaan',
          figureLabel: 'Kolme pohjakorttia rinnakkain, keskimmäinen valittuna.',
          caption:
            `Pohjan vaihtaminen ei koskaan kosketa tekstiäsi, joten kaikkien ${TEMPLATE_COUNT} pohjan kokeilu on turvallista. Jokainen pohja käyttää eri osioita — ne, joita pohja ei käytä, piilotetaan editorista ja esikatselusta kunnes vaihdat takaisin.`,
          linkParagraph: {
            before: 'Katso kaikki ',
            linkText: `${TEMPLATE_COUNT} pohjaa`,
            linkTo: ROUTES.freeTemplates,
            view: 'freeTemplates',
            after: ' etukäteen.',
          },
        },
        {
          step: 'ats',
          heading: 'Tarkista CV työpaikkailmoitusta vasten',
          figureLabel: '"ATS-pisteet ja ehdotukset" -paneeli: ATS-ystävällinen tila -kytkin, ilmoitustekstin kenttä ja lista osuneista ja puuttuvista avainsanoista.',
          caption:
            'Avaa lomakekenttien yläpuolelta "ATS-pisteet ja ehdotukset" -paneeli. Sen "ATS-ystävällinen tila" -kytkin vaihtaa esikatselun tasaiseksi, yhden sarakkeen asetteluksi, jonka hakijaseurantajärjestelmät osaavat lukea, ja työpaikkailmoituksen liittäminen listaa avainsanat, jotka CV:stäsi vielä puuttuvat.',
        },
        {
          step: 'export',
          heading: 'Vie tiedostoksi tai jaa linkkinä',
          figureLabel: 'Avattu Vie-valikko vaihtoehdoilla PDF, HTML ja JSON sekä jakolinkki.',
          caption:
            'Vie-valikossa on kolme muotoa: PDF hakemuksiin, HTML verkkoon ja JSON varmuuskopioksi tai myöhempää muokkausta varten. Jakolinkki koodaa koko CV:n URL-osoitteeseen — sitä ei lähetetä palvelimelle, eivätkä kuvat mahdu mukaan.',
        },
        {
          step: 'restore',
          heading: 'Suojaa työsi vahinkopäivitykseltä (valinnainen)',
          figureLabel: 'Asetuspaneeli, jossa "Palauta viimeisin istunto" -kytkin on päällä.',
          caption:
            'Oletuksena mitään CV:stäsi ei tallenneta — välilehden sulkeminen pyyhkii kaiken. Ota Asetuksista käyttöön "Palauta viimeisin istunto": työkopio säilyy vain siinä välilehdessä ja poistuu heti kun suljet sen.',
        },
      ],
      ctaLabel: 'Aloita CV:si rakentaminen',
      ctaNote: 'Ei kirjautumista. Ei mitään tallennettua ennen kuin viet CV:n.',
    }
  }

  return {
    kicker: 'Guide',
    title: 'How to Use the CV Builder',
    intro:
      'Six steps from blank to finished — where each feature lives and what it affects. For advice on what to actually write, see ',
    introLink: {
      linkText: 'How to Write a CV',
      linkTo: ROUTES.howToWrite,
      view: 'howToWrite',
      after: '.',
    },
    steps: [
      {
        step: 'sections',
        heading: 'Fill in your sections',
        figureLabel: 'The editor layout: section rail on the left, form in the middle, live preview on the right.',
        caption:
          'The rail on the left lists every section and jumps to it. Use the Visible sections panel at the top of the form to switch off anything that doesn\'t apply — your data stays either way. The preview on the right updates as you type.',
      },
      {
        step: 'bullets',
        heading: 'Tighten your experience bullets',
        figureLabel: 'A form field with one bullet point marked by a warning flag.',
        caption:
          'As you write, weak bullets get flagged inline next to the field: passive phrases like "responsible for," openers that aren\'t a strong verb, and bullets with no measurable number. The ATS score & suggestions panel totals them up.',
      },
      {
        step: 'template',
        heading: 'Pick a template — your content stays put',
        figureLabel: 'Three template cards side by side with the middle one selected.',
        caption:
          `Swapping templates never touches your text, so it's safe to try all ${TEMPLATE_COUNT} before deciding. Each one uses a different set of sections — the ones a template doesn't use are tucked out of the editor and preview until you switch back.`,
        linkParagraph: {
          before: 'See all ',
          linkText: `${TEMPLATE_COUNT} templates`,
          linkTo: ROUTES.freeTemplates,
          view: 'freeTemplates',
          after: ' ahead of time.',
        },
      },
      {
        step: 'ats',
        heading: 'Check it against the job posting',
        figureLabel: 'The "ATS score and suggestions" panel: an ATS-friendly-mode toggle, a job-description box, and a matched-and-missing keyword list.',
        caption:
          'Open the "ATS score & suggestions" panel above the form fields. Its ATS-friendly-mode toggle flattens the preview to the single-column layout applicant tracking systems can parse, and pasting a job description lists the keywords your CV is still missing.',
      },
      {
        step: 'export',
        heading: 'Export a file or share a link',
        figureLabel: 'An open export menu offering PDF, HTML and JSON, next to a share link.',
        caption:
          'The Export menu offers three formats: PDF for applications, HTML for the web, and JSON as a backup or to keep editing later. The share-link button encodes the whole CV into the URL — never sent to a server, and images don\'t fit.',
      },
      {
        step: 'restore',
        heading: 'Guard against an accidental refresh (optional)',
        figureLabel: 'A settings panel with the "Restore last session" toggle switched on.',
        caption:
          'By default nothing about your CV is saved — closing or refreshing the tab clears everything. Enable "Restore last session" in Settings and a working copy is kept in that tab only, cleared the moment you close it.',
      },
    ],
    ctaLabel: 'Start building your CV',
    ctaNote: 'No login. Nothing saved until you export.',
  }
}

function HowToUseTheBuilderPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__kicker">{copy.kicker}</p>
        <h1 className="legal-page__title">{copy.title}</h1>
        <p>
          {copy.intro}
          <InternalNavLink
            to={copy.introLink.linkTo}
            onNavigate={() => onNavigateToView(copy.introLink.view)}
          >
            {copy.introLink.linkText}
          </InternalNavLink>
          {copy.introLink.after}
        </p>

        <ol className="builder-walkthrough">
          {copy.steps.map((step, index) => (
            <li key={step.step} className="builder-walkthrough__step">
              <div className="builder-walkthrough__head">
                <span className="builder-walkthrough__num">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="builder-walkthrough__heading">{step.heading}</h2>
              </div>
              <div className="builder-walkthrough__figure">
                <BuilderWalkthroughFigure step={step.step} label={step.figureLabel} />
              </div>
              <p className="builder-walkthrough__caption">{step.caption}</p>
              {step.linkParagraph ? (
                <p className="builder-walkthrough__caption">
                  {step.linkParagraph.before}
                  <InternalNavLink
                    to={step.linkParagraph.linkTo}
                    onNavigate={() => onNavigateToView(step.linkParagraph.view)}
                  >
                    {step.linkParagraph.linkText}
                  </InternalNavLink>
                  {step.linkParagraph.after}
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="legal-page__cta">
          <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
            {copy.ctaLabel}
          </button>
          <span className="legal-page__cta-note">{copy.ctaNote}</span>
        </div>
      </div>
    </section>
  )
}

export default HowToUseTheBuilderPage
