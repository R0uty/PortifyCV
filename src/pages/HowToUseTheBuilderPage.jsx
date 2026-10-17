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
        'Seitsemän vaihetta tyhjästä valmiiseen CV:hen — mistä kukin toiminto löytyy ja mihin se vaikuttaa. Sisällön kirjoittamiseen katso ',
      introLink: {
        linkText: 'Näin kirjoitat CV:n',
        linkTo: ROUTES.howToWrite,
        view: 'howToWrite',
        after: '.',
      },
      steps: [
        {
          step: 'edit',
          heading: 'Muokkaa suoraan CV:ssä',
          figureLabel: 'CV-sivu, jossa yksi osio on rajattu kynäkuvakkeineen, ja sen vieressä osion kentät avoimessa ponnahdusikkunassa.',
          caption:
            'Editori avautuu Suora muokkaus -tilassa: CV itse on editori. Napsauta mitä tahansa tekstiä — nimeäsi, tehtävänimikettä, luettelokohtaa — ja kirjoita. Jokaisen osion kynä avaa sen kaikki kentät osion viereen, missä voit lisätä, poistaa, kopioida ja järjestää kohteita uudelleen; useimmissa kaksipalstaisissa pohjissa voit myös siirtää osion pääpalstan ja sivupalkin välillä. Vasemman reunan valikko vie kuhunkin osioon, Osiot-valikosta piilotat ne, joita et tarvitse, ja "Lataa demo-CV" täyttää esimerkkisisällön pohjaksi.',
        },
        {
          step: 'sections',
          heading: 'Mieluummin lomake? Vaihda Klassinen-tilaan',
          figureLabel: 'Klassinen-tila: osiovalikko vasemmalla, lomake keskellä, esikatselu oikealla.',
          caption:
            'Yläpalkin Suora muokkaus / Klassinen -valitsin vaihtaa lomakenäkymään: vasemman reunan valikko listaa jokaisen osion, lomake on keskellä ja oikean reunan esikatselu päivittyy kun kirjoitat. Lomakkeen yläosan Näkyvät osiot -paneelista voit kytkeä pois sen, mikä ei sovi tähän CV:hen — tiedot säilyvät joka tapauksessa. Molemmat tilat muokkaavat samaa CV:tä, joten voit vaihtaa milloin vain. Vaiheiden 3 ja 5 työkalut ovat Klassinen-tilassa.',
        },
        {
          step: 'bullets',
          heading: 'Terävöitä kokemuskohdat',
          figureLabel: 'Lomakekenttä, jossa yksi luettelokohta on merkitty huomiolipulla.',
          caption:
            'Klassinen-tilassa heikot kohdat merkitään kirjoittaessasi suoraan kentän viereen: passiiviset ilmaukset kuten "vastuualueena", aloitukset jotka eivät ole vahva verbi, ja kohdat joista puuttuu mitattava luku. "ATS-pisteet ja ehdotukset" -paneeli laskee ne yhteen.',
        },
        {
          step: 'template',
          heading: 'Valitse pohja — sisältösi pysyy ennallaan',
          figureLabel: 'Kolme pohjakorttia rinnakkain, keskimmäinen valittuna.',
          caption:
            `Pohjan vaihtaminen ei koskaan kosketa tekstiäsi, joten kaikkien ${TEMPLATE_COUNT} pohjan kokeilu on turvallista. Jokainen pohja käyttää eri osioita — ne, joita pohja ei käytä, piilotetaan editorista ja esikatselusta kunnes vaihdat takaisin. Jokaisella pohjalla on myös kolme tyyliä (värit, fontti ja otsikoiden väri), jotka valitset yläpalkin Tyyli-valikosta.`,
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
            'Avaa Klassinen-tilassa lomakekenttien yläpuolelta "ATS-pisteet ja ehdotukset" -paneeli. Sen "ATS-ystävällinen tila" -kytkin vaihtaa esikatselun tasaiseksi, yhden sarakkeen asetteluksi, jonka hakijaseurantajärjestelmät osaavat lukea (Suora muokkaus -tilassa saman tekee CV:n oikean yläkulman ATS-näkymä-painike), ja työpaikkailmoituksen liittäminen listaa avainsanat, jotka CV:stäsi vielä puuttuvat.',
        },
        {
          step: 'export',
          heading: 'Vie tiedostoksi tai jaa linkkinä',
          figureLabel: 'Avattu Vie-valikko vaihtoehdoilla PDF, Word, HTML ja JSON sekä jakolinkki.',
          caption:
            'Vie-valikossa on neljä muotoa: PDF hakemuksiin, Word muokattavaksi toisessa ohjelmassa, HTML verkkoon ja JSON varmuuskopioksi tai myöhempää muokkausta varten. Jakolinkki koodaa koko CV:n URL-osoitteeseen — sitä ei lähetetä palvelimelle, eivätkä kuvat mahdu mukaan. Vasemman reunan Hakemuskirje-kohta luo CV:si pohjalta hakemuskirjeluonnoksen, jota voit muokata.',
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
      'Seven steps from blank to finished — where each feature lives and what it affects. For advice on what to actually write, see ',
    introLink: {
      linkText: 'How to Write a CV',
      linkTo: ROUTES.howToWrite,
      view: 'howToWrite',
      after: '.',
    },
    steps: [
      {
        step: 'edit',
        heading: 'Edit right on the CV',
        figureLabel: 'A CV page with one section outlined and its pencil, and that section\'s fields open in a popup beside it.',
        caption:
          'The builder opens in Direct Edit: the CV itself is the editor. Click any text on it — your name, a job title, a bullet — and type. Each section\'s pencil opens all its fields beside it, where you add, remove, duplicate, and reorder entries; on most two-column templates you can also move a section between the main column and the sidebar. The rail on the left jumps to each section, the Sections menu hides the ones you don\'t need, and Load demo CV fills in example content to start from.',
      },
      {
        step: 'sections',
        heading: 'Prefer a form? Switch to Classic',
        figureLabel: 'Classic mode: section rail on the left, form in the middle, live preview on the right.',
        caption:
          'The Direct Edit / Classic switch in the top bar swaps to a form view: the rail lists every section, the form sits in the middle, and the preview on the right updates as you type. Use the Visible sections panel at the top of the form to switch off anything that doesn\'t apply — your data stays either way. Both modes edit the same CV, so switch whenever you like. The tools in steps 3 and 5 live in Classic.',
      },
      {
        step: 'bullets',
        heading: 'Tighten your experience bullets',
        figureLabel: 'A form field with one bullet point marked by a warning flag.',
        caption:
          'In Classic mode, weak bullets get flagged inline next to the field as you write: passive phrases like "responsible for," openers that aren\'t a strong verb, and bullets with no measurable number. The ATS score & suggestions panel totals them up.',
      },
      {
        step: 'template',
        heading: 'Pick a template — your content stays put',
        figureLabel: 'Three template cards side by side with the middle one selected.',
        caption:
          `Swapping templates never touches your text, so it's safe to try all ${TEMPLATE_COUNT} before deciding. Each one uses a different set of sections — the ones a template doesn't use are tucked out of the editor and preview until you switch back. Each template also has three looks (a colour palette, a font, and a heading colour), picked from the Style menu in the top bar.`,
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
          'In Classic mode, open the "ATS score & suggestions" panel above the form fields. Its ATS-friendly-mode toggle flattens the preview to the single-column layout applicant tracking systems can parse (in Direct Edit, the ATS view button at the top right of your CV does the same), and pasting a job description lists the keywords your CV is still missing.',
      },
      {
        step: 'export',
        heading: 'Export a file or share a link',
        figureLabel: 'An open export menu offering PDF, Word, HTML and JSON, next to a share link.',
        caption:
          'The Export menu offers four formats: PDF for applications, Word for editing in another program, HTML for the web, and JSON as a backup or to keep editing later. The share-link button encodes the whole CV into the URL — never sent to a server, and images don\'t fit. Cover letter, in the rail on the left, drafts an editable cover letter from your CV.',
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
                <BuilderWalkthroughFigure step={step.step} label={step.figureLabel} number={String(index + 1)} />
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
