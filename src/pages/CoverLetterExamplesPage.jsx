import InternalNavLink from '../components/InternalNavLink'
import { ROUTES } from '../utils/routes'

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkit',
      title: 'Saatekirje-esimerkkejä',
      intro:
        'Saatekirjeellä on yksi tehtävä: selittää miksi juuri sinä sopisit juuri tähän rooliin, sanoin joita CV ei itsessään sano. Tässä on aidon rakenteen esimerkit — heikko ja vahva versio jokaisesta osasta — ja miten PortifyCV kirjoittaa ensimmäisen luonnoksen puolestasi.',
      sections: [
        {
          heading: 'Neljä osaa, joita hyvä saatekirje tarvitsee',
          paragraphs: [
            'Avaus, joka nimeää roolin ja yrityksen. Kappale, joka yhdistää viimeisimmän kokemuksesi tähän rooliin. Lyhyt maininta ydinosaamisestasi. Lopetus, joka kutsuu seuraavaan askeleeseen. Ei enempää — yhden sivun mittainen kirje, jossa jokainen kappale tekee työtä, voittaa aina kolmen sivun yleiskatsauksen urastasi.',
          ],
        },
        {
          heading: 'Avaus, joka toimii',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Kenelle asia kuuluukin, haen ilmoittamaanne avointa tehtävää."',
            strongLabel: 'Vahva',
            strong: '"Haen Studio Northin Senior Product Designer -tehtävää. Olen viimeiset viisi vuotta rakentanut suunnittelujärjestelmiä, jotka selviävät kosketuksesta oikeisiin insinööritiimeihin."',
          },
          paragraphsAfter: [
            'Nimeä rooli ja yritys ensimmäisessä lauseessa. Jos tiedät rekrytoijan nimen, käytä sitä "Kenelle asia kuuluukin" -tervehdyksen sijaan — se kertoo, että teit läksysi.',
          ],
        },
        {
          heading: 'Kokemuksen yhdistäminen rooliin',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Minulla on kokemusta monilta alueilta ja uskon sopivani hyvin tehtävään."',
            strongLabel: 'Vahva',
            strong: '"Nykyisessä roolissani Senior Product Designerina Studio Northissa: johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
          },
          paragraphsAfter: [
            'Poimi yksi konkreettinen saavutus CV:stäsi ja yhdistä se suoraan siihen, mitä työpaikkailmoitus pyytää — älä toista koko CV:täsi proosana.',
          ],
        },
        {
          heading: 'Lopetus, joka kutsuu seuraavaan askeleeseen',
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Toivon kuulevani teistä pian."',
            strongLabel: 'Vahva',
            strong: '"Keskustelen mielelläni siitä, miten kokemukseni voisi hyödyttää tiimiänne. Kiitos ajastanne ja harkinnastanne."',
          },
        },
        {
          heading: 'Anna PortifyCV:n kirjoittaa ensimmäinen versio',
          paragraphs: [
            'PortifyCV:n saatekirjegeneraattori ei ole tekoäly — se on määrätietoinen malli, joka poimii CV:si datan suoraan: avaus nimeää hakemasi roolin ja yrityksen (jos annat ne), toinen kappale poimii viimeisimmän roolisi ja sen parhaan saavutuksen tai kuvauksen, kolmas listaa tärkeimmät taitosi, ja lopetus on valmiiksi kirjoitettu. Sama "ei mitään palvelimelle" -periaate kuin muussakin sovelluksessa: luonnos rakennetaan kokonaan selaimessasi.',
          ],
          linkParagraph: {
            before: 'Täytä yrityksen nimi, tehtävänimike ja rekrytoijan nimi (valinnaisia) ',
            linkText: 'CV-rakentajassa',
            linkTo: ROUTES.builder,
            after: ', ja muokkaa luonnosta sieltä — kopioi, lataa tekstinä tai vie PDF-muodossa.',
          },
        },
        {
          heading: 'Virheet, jotka kannattaa välttää',
          list: [
            'CV:n toistaminen sanasta sanaan sen sijaan, että yhdistäisit sen tähän nimenomaiseen rooliin',
            '"Kenelle asia kuuluukin" kun nimen olisi voinut löytää',
            'Ei yhtäkään konkreettista syytä sille, miksi juuri tämä yritys',
            'Yli yhden sivun pituus',
          ],
        },
      ],
      ctaLabel: 'Luo saatekirjeesi',
      ctaNote: 'Ei kirjautumista. Luonnos pysyy selaimessasi.',
      seeAlsoLabel: 'Katso myös:',
      seeAlso: [
        { to: ROUTES.howToWrite, view: 'howToWrite', text: 'Näin kirjoitat CV:n' },
        { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
        { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Ilmaiset CV-pohjat' },
        { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
      ],
    }
  }

  return {
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
          strong: '"I’m writing to apply for the Senior Product Designer role at Studio North. I’ve spent the last five years building design systems that survive contact with real engineering teams."',
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
          strong: '"In my current role as Senior Product Designer at Studio North: led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
        },
        paragraphsAfter: [
          'Pick one concrete achievement from your CV and connect it directly to what the job posting is asking for — don’t restate your whole CV as prose.',
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
        heading: 'Let PortifyCV draft the first version',
        paragraphs: [
          'PortifyCV’s cover letter generator isn’t AI — it’s a deterministic template that pulls straight from your CV data: the opening names the role and company you’re applying to (if you provide them), the second paragraph pulls your most recent role and its best achievement or description, the third lists your top skills, and the closing is pre-written. Same "nothing touches a server" principle as the rest of the app — the draft is built entirely in your browser.',
        ],
        linkParagraph: {
          before: 'Fill in the company name, role title, and hiring manager’s name (all optional) in the ',
          linkText: 'CV builder',
          linkTo: ROUTES.builder,
          after: ', then edit from there — copy it, download it as text, or export it as a PDF.',
        },
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
    seeAlsoLabel: 'See also:',
    seeAlso: [
      { to: ROUTES.howToWrite, view: 'howToWrite', text: 'How to Write a CV' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
      { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
    ],
  }
}

function CoverLetterExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <div className="legal-page__intro-row">
          <img
            src="/writing-quill.jpg"
            alt=""
            width="784"
            height="1168"
            loading="lazy"
            className="legal-page__illustration"
          />
          <div>
            <p className="legal-page__kicker">{copy.kicker}</p>
            <h1 className="legal-page__title">{copy.title}</h1>
          </div>
        </div>
        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {section.examplePair ? (
              <ul>
                <li>
                  <strong>{section.examplePair.weakLabel}:</strong> {section.examplePair.weak}
                </li>
                <li>
                  <strong>{section.examplePair.strongLabel}:</strong> {section.examplePair.strong}
                </li>
              </ul>
            ) : null}
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.paragraphsAfter?.map((paragraph, index) => (
              <p key={`after-${index}`}>{paragraph}</p>
            ))}
            {section.linkParagraph ? (
              <p>
                {section.linkParagraph.before}
                <InternalNavLink to={section.linkParagraph.linkTo} onNavigate={() => onNavigateToView('builder')}>
                  {section.linkParagraph.linkText}
                </InternalNavLink>
                {section.linkParagraph.after}
              </p>
            ) : null}
          </div>
        ))}

        <div className="legal-page__cta">
          <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
            {copy.ctaLabel}
          </button>
          <span className="legal-page__cta-note">{copy.ctaNote}</span>
        </div>
        <div className="templates-page-links">
          <span>{copy.seeAlsoLabel}</span>
          {copy.seeAlso.map((link) => (
            <InternalNavLink key={link.view} to={link.to} onNavigate={() => onNavigateToView(link.view)}>
              {link.text}
            </InternalNavLink>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CoverLetterExamplesPage
