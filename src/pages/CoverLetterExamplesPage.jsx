import GuideLayout from '../components/GuideLayout'
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
            strong: '"Haen Example Oy:n Senior Product Designer -tehtävää. Olen viimeiset viisi vuotta rakentanut suunnittelujärjestelmiä, jotka selviävät kosketuksesta oikeisiin insinööritiimeihin."',
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
            strong: '"Nykyisessä roolissani Senior Product Designerina Example Oy:ssä: johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
          },
          paragraphsAfter: [
            'Poimi yksi konkreettinen saavutus CV:stäsi ja yhdistä se suoraan siihen, mitä työpaikkailmoitus pyytää — älä toista koko CV:täsi proosana.',
          ],
        },
        {
          heading: "Miksi juuri tämä yritys, yhdellä konkreettisella lauseella",
          paragraphs: [
            "Kerro, miksi haluat juuri tämän työn tässä yrityksessä, et mitä tahansa työtä. Yksi konkreettinen syy riittää, ja se on kohta, jonka useimmat kirjeet ohittavat.",
          ],
          examplePair: {
            weakLabel: "Heikko",
            weak: "\"Example Oy on alansa johtava yritys, jolla on hieno kulttuuri, ja haluaisin olla osa sitä.\"",
            strongLabel: "Vahva",
            strong: "\"Siirtymänne itsepalveluperehdytykseen on juuri se ongelma, jonka ratkaisin edellisessä työssäni, jossa se vähensi tukipyyntöjä kolmanneksella.\"",
          },
          paragraphsAfter: [
            "Vahvan version olisi voinut kirjoittaa vain tälle yritykselle. Etsi tuore tuotejulkaisu, ilmoituksessa mainittu tavoite tai ongelma, jota varten tehtävä on olemassa.",
          ],
        },
        {
          heading: "Taitokappale, joka todistaa eikä vain luettele",
          examplePair: {
            weakLabel: "Heikko",
            weak: "\"Hallitsen Figman, käyttäjätutkimuksen, prototypoinnin, saavutettavuuden ja suunnittelujärjestelmät.\"",
            strongLabel: "Vahva",
            strong: "\"Ilmoituksessa haetaan saavutettavuuskokemusta: johdin siirtymämme WCAG 2.1 AA -tasolle 40 näkymässä ja koulutin tiimin pitämään tason yllä.\"",
          },
          paragraphsAfter: [
            "CV:ssäsi taidot on jo lueteltu. Kirje poimii niistä yhden tai kaksi, joita ilmoitus painottaa eniten, ja näyttää ne käytännössä.",
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
          heading: "Pituus, muoto ja sävy",
          list: [
            "Noin 250–400 sanaa kolmessa tai neljässä lyhyessä kappaleessa. Enintään yksi sivu.",
            "Ylhäällä sama nimi ja samat yhteystiedot kuin CV:ssä, jotta ne selvästi kuuluvat yhteen.",
            "Minämuoto ja selkeä kieli. Itsevarmuus on hyvä asia; itsestä käytetyt superlatiivit (\"poikkeuksellinen\", \"intohimoinen\") eivät ole näyttöä.",
            "Lähetä tiedostomuoto, jota ilmoitus pyytää, ja anna sille hyödyllinen nimi, kuten \"Etunimi-Sukunimi-hakemus.pdf\".",
          ],
        },
        {
          heading: "Fraasit, jotka kannattaa korvata, ja mitä kirjoittaa tilalle",
          list: [
            "\"Olen hyvä tiimipelaaja\" → yksi lause jostain, minkä tiimi saavutti, ja omasta osuudestasi siinä.",
            "\"Olen intohimoinen…\" → mitä olet tehnyt asian eteen: projekti, kurssi, tulos.",
            "\"Uskon sopivani tehtävään erinomaisesti\" → ilmoituksen ja kokemuksesi konkreettinen yhtymäkohta.",
            "\"Liitteenä CV:ni\" → jätä pois; lukija näkee liitteen.",
          ],
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
          heading: "Kokonainen lyhyt esimerkki",
          letter: true,
          paragraphs: [
            "Hyvä Maria Virtanen,",
            "Haen Example Oy:n asiakkuuspäällikön tehtävää. Olen neljän vuoden ajan vastannut 60 keskikokoisesta asiakkaasta ohjelmistoyrityksessä, ja haluaisin tuoda tämän kokemuksen tiimiin, jonka asiakaskunta kasvaa yhtä nopeasti kuin teidän.",
            "Ilmoituksessanne haetaan henkilöä, joka vähentää asiakaspoistumaa. Nykyisessä työssäni otin käyttöön neljännesvuosittaiset tapaamiset jokaisen asiakkaan kanssa sekä varoituslistan asiakkaista, jotka lakkasivat käyttämästä keskeisiä toimintoja; kahdessa vuodessa vuotuinen poistuma laski 14 %:sta 8 %:iin.",
            "Huomasin myös, että siirrätte perehdytyksen verkkoon. Rakensin ohjekeskukseemme perehdytyskurssin, joka hoitaa nyt noin puolet uusien asiakkaiden ensimmäisistä kysymyksistä.",
            "Keskustelen mielelläni siitä, miten voisin auttaa tiimiänne pitämään voittamansa asiakkaat. Kiitos, että luit hakemukseni.",
            "Ystävällisin terveisin",
        "John Doe",
          ],
          paragraphsAfter: [
            "Noin 140 sanaa: ensin tehtävä ja yritys, jokaisessa kappaleessa yksi ilmoitukseen sidottu näyttö ja selkeä lopetus.",
          ],
        },
        {
          heading: "Hakeminen lomakkeella tai sähköpostilla",
          paragraphs: [
            "Monessa haussa ei ole paikkaa kirjetiedostolle: lomake kysyy \"Miksi olet kiinnostunut tehtävästä?\" tai hakemus lähetetään sähköpostilla. Käytä samaa rakennetta lyhyempänä: kaksi tai kolme lausetta siitä, miksi juuri tämä tehtävä, yksi näyttö ja lopetus. Sähköpostissa itse viesti on hakemus ja CV on liitteenä.",
          ],
        },
        {
          heading: "Hakeminen Suomessa",
          paragraphs: [
            "Suomessa saatekirjettä kutsutaan hakemukseksi tai työhakemukseksi, ja sitä odotetaan useimpiin työpaikkoihin. Rakenne on sama: yksi sivu, ensin tehtävä ja yritys, konkreettista näyttöä ja syy hakea juuri tälle työnantajalle. Kirjoita hakemus ilmoituksen kielellä. Suomenkielinen ilmoitus odottaa suomenkielistä hakemusta, vaikka työpaikalla puhuttaisiin englantia.",
          ],
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
}

function CoverLetterExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="coverLetterExamples"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={copy.seeAlso.map((link) => ({ view: link.view, search: link.search, title: link.text }))}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default CoverLetterExamplesPage
