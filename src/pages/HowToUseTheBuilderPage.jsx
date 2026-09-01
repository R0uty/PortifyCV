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
        'Tämä on läpikäynti itse työkalusta — mistä löydät kunkin ominaisuuden ja mihin se vaikuttaa. CV:n sisällön kirjoittamiseen katso ',
      introLink: {
        linkText: 'Näin kirjoitat CV:n',
        linkTo: ROUTES.howToWrite,
        view: 'howToWrite',
        after: '.',
      },
      sections: [
        {
          heading: 'Siirry osioiden välillä vasemman reunan valikosta',
          paragraphs: [
            'Editorin vasemmassa reunassa oleva pystyvalikko listaa jokaisen CV-osion (yhteystiedot, yhteenveto, työkokemus, koulutus, taidot ja muut) sekä Asetukset-painikkeen. Jokainen osio voidaan piilottaa erikseen, jos se ei sovi tähän CV:hen — esikatselu oikealla päivittyy välittömästi jokaisen muutoksen jälkeen, joten näet tarkalleen miltä CV näyttää ennen kuin viet sen mihinkään.',
          ],
        },
        {
          heading: 'Tarkista muotoilu ATS-tilalla ja avainsanapisteytyksellä',
          paragraphs: [
            'Työkalurivin "ATS-ystävällinen tila" -kytkin vaihtaa esikatselun tasaiseksi, yhden sarakkeen asetteluksi ilman kuvakkeita tai taulukoita — juuri sellaiseksi, jonka hakijaseurantajärjestelmät (ATS) osaavat lukea luotettavasti riippumatta siitä, mikä pohja on valittuna.',
            'ATS-paneeli erikseen antaa liittää työpaikkailmoituksen tekstin: se vertaa ilmoituksen avainsanoja CV:si sisältöön ja näyttää, mitkä termit puuttuvat, jotta voit lisätä ne ennen lähettämistä.',
          ],
        },
        {
          heading: 'Käytä ehdotuspaneelia heikkojen kohtien löytämiseen',
          paragraphs: [
            'CV-ehdotukset-paneeli lukee kokemuskohtasi ja merkitsee suoraan muokattavan kentän viereen asiat, jotka kannattaa korjata: passiiviset ilmaukset kuten "vastuualueena", kohdat jotka eivät ala vahvalla verbillä, ja kohdat joista puuttuu mitattava luku kokonaan.',
          ],
        },
        {
          heading: 'Vaihda pohjaa milloin vain — sisältösi pysyy ennallaan',
          paragraphs: [
            `Pohjan vaihtaminen ei koskaan kosketa tekstiäsi, joten kaikkien ${TEMPLATE_COUNT} pohjan kokeileminen ennen päätöstä on turvallista. Jokainen pohja tukee hieman eri osioita — esikatselu näyttää heti, jos jokin täyttämäsi osio ei näy valitussa pohjassa.`,
          ],
          linkParagraphs: [
            {
              before: 'Katso kaikki ',
              linkText: `${TEMPLATE_COUNT} pohjaa`,
              linkTo: ROUTES.freeTemplates,
              view: 'freeTemplates',
              after: ' etukäteen.',
            },
          ],
        },
        {
          heading: 'Vie tiedostoksi tai jaa linkkinä',
          paragraphs: [
            'Työkalurivin Vie-valikosta löytyy kolme muotoa: PDF tulostukseen ja hakemuksiin, HTML jaettavaksi verkossa, ja JSON varmuuskopioksi tai myöhempää muokkausta varten samassa editorissa.',
            'Jakolinkki-painike koodaa koko CV:n suoraan URL-osoitteen fragmenttiin — sitä ei koskaan lähetetä palvelimelle. Kuvat eivät mahdu linkkiin, joten jos CV:ssäsi on profiilikuva, vie JSON, jos kuvan pitää säilyä vastaanottajalla.',
          ],
        },
        {
          heading: 'Ota käyttöön istunnon palautus, jos pelkäät vahinkopäivitystä',
          paragraphs: [
            'Oletuksena mitään CV:stäsi ei tallenneta minnekään — välilehden sulkeminen tai päivittäminen pyyhkii kaiken. Jos haluat suojan vahingossa tapahtuvaa päivitystä vastaan, ota Asetuksista käyttöön "Palauta viimeisin istunto": se pitää työkopiota vain kyseisessä selainvälilehdessä ja poistaa sen automaattisesti heti kun suljet välilehden.',
          ],
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
      'This is a walkthrough of the tool itself — where to find each feature and what it affects. For advice on what to actually write, see ',
    introLink: {
      linkText: 'How to Write a CV',
      linkTo: ROUTES.howToWrite,
      view: 'howToWrite',
      after: '.',
    },
    sections: [
      {
        heading: 'Move between sections from the left-hand rail',
        paragraphs: [
          'The vertical rail on the left of the editor lists every CV section (contact info, summary, experience, education, skills, and the rest) plus a Settings button. Any section can be hidden individually if it doesn\'t belong on this CV — the live preview on the right updates instantly after every change, so you can see exactly what the CV looks like before exporting anything.',
        ],
      },
      {
        heading: 'Check formatting with ATS mode and keyword scoring',
        paragraphs: [
          'The toolbar\'s "ATS-friendly mode" toggle switches the preview to a flat, single-column layout with no icons or tables — the format applicant tracking systems can reliably parse, regardless of which template is selected.',
          'The separate ATS panel lets you paste in a job description: it compares that posting\'s keywords against your CV\'s content and shows which terms are missing, so you can add them before applying.',
        ],
      },
      {
        heading: 'Use the suggestions panel to catch weak bullets',
        paragraphs: [
          'The CV suggestions panel reads your experience bullets and flags issues right next to the field you\'re editing: passive phrases like "responsible for," bullets that don\'t open with a strong verb, and bullets missing a measurable number entirely.',
        ],
      },
      {
        heading: 'Switch templates any time — your content stays put',
        paragraphs: [
          `Swapping templates never touches your text, so it's safe to try all ${TEMPLATE_COUNT} before deciding. Each template supports slightly different sections — the preview immediately shows if something you filled in doesn't appear in the one you've picked.`,
        ],
        linkParagraphs: [
          {
            before: 'See all ',
            linkText: `${TEMPLATE_COUNT} templates`,
            linkTo: ROUTES.freeTemplates,
            view: 'freeTemplates',
            after: ' ahead of time.',
          },
        ],
      },
      {
        heading: 'Export a file or share a link',
        paragraphs: [
          'The toolbar\'s Export menu offers three formats: PDF for printing and applications, HTML for sharing online, and JSON as a backup or to keep editing later in this same builder.',
          'The share-link button encodes the whole CV directly into the URL fragment — it\'s never sent to a server. Images don\'t fit in the link, so if your CV has a profile photo, export JSON instead if the recipient needs the image too.',
        ],
      },
      {
        heading: 'Turn on session restore if you\'re worried about an accidental refresh',
        paragraphs: [
          'By default nothing about your CV is saved anywhere — closing or refreshing the tab clears everything. If you want protection against an accidental refresh, enable "Restore last session" in Settings: it keeps a working copy in that browser tab only, and clears it automatically the moment you close the tab.',
        ],
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

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {section.linkParagraphs?.map((linkParagraph, index) => (
              <p key={`link-${index}`}>
                {linkParagraph.before}
                <InternalNavLink
                  to={linkParagraph.linkTo}
                  onNavigate={() => onNavigateToView(linkParagraph.view)}
                >
                  {linkParagraph.linkText}
                </InternalNavLink>
                {linkParagraph.after}
              </p>
            ))}
          </div>
        ))}

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
