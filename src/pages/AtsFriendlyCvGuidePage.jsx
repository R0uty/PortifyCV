import GuideLayout from '../components/GuideLayout'
import { cvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

// Read off the template registry instead of a hardcoded number — see
// LandingPage.jsx for why this drifted before.
const TEMPLATE_COUNT = cvTemplates.length

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Opas',
      title: 'ATS-ystävällinen CV-opas',
      intro:
        'Hakijaseurantajärjestelmä (ATS) on ohjelmisto, ei ihminen, ja se lukee CV:si eri tavalla kuin odotat. Tässä on mitä se oikeasti tekee, mikä rikkoo sen, ja miten tarkistat oman CV:si oikealla pisteytyksellä arvaamisen sijaan.',
      sections: [
        {
          heading: 'Mitä ATS oikeasti tekee',
          paragraphs: [
            'Se poimii raakatekstin tiedostostasi, erottaa siitä kentät (nimi, yhteystiedot, kokemus, taidot) ja usein järjestää hakijat avainsanaosuman mukaan suhteessa työpaikkailmoitukseen. Tästä seuraa kaksi asiaa: jos jäsennin ei pysty poimimaan puhdasta tekstiä, mikään sisältösi ei lasketa mukaan — ja vaikka sisältö poimittaisiinkin oikein, se pisteytyy heikosti, jos siinä ei mainita oikeita termejä, riippumatta siitä onko sinulla oikeasti kyseinen taito.',
          ],
        },
        {
          heading: 'Mikä rikkoo ATS-jäsentämisen',
          list: [
            'Monisarakkeiset asettelut: jotkin jäsentimet lukevat vasemmalta oikealle koko sivun poikki, jolloin kaksipalstainen asettelu voi lomittaa kokemuksesi taitopalkin kanssa merkityksettömäksi tekstiksi.',
            'Kuvien, kuvakkeiden tai tekstiruutujen sisällä oleva teksti: jäsentimet lukevat yleensä vain dokumentin tekstitasolla olevan oikean tekstin, eivät grafiikkaan leivottua tekstiä.',
            'Taulukot asettelutarkoituksessa: samantyyppinen ongelma — taulukon solujen sisältö jää joskus lukematta tai luetaan väärässä järjestyksessä.',
            'Yhteystiedot ylä- tai alatunnisteessa: osa jäsentimistä ohittaa nämä alueet kokonaan, jolloin sähköpostisi ja puhelinnumerosi katoavat.',
            'Epätavalliset fontit tai raskas symbolien käyttö luetelmamerkkeinä: voi tuottaa sekavaa merkistöä.',
            'Osiotunnisteet, jotka eivät ole odotettuja sanoja ("Matkani" "Kokemus"-sanan sijaan) voivat estää jäsennintä luokittelemasta niiden alla olevaa sisältöä oikein.',
          ],
        },
        {
          heading: 'Miten PortifyCV:n ATS-tila auttaa tässä',
          paragraphs: [
            `ATS-ystävällinen tila litistää minkä tahansa ${TEMPLATE_COUNT} pohjasta yksipalstaiseksi, tekstipainotteiseksi asetteluksi vakioiduilla osiotunnisteilla — sarakkeet, kuvakkeet ja koristeelliset elementit poistuvat kyseisestä renderöinnistä. Vie CV tässä tilassa, kun kohde on ATS eikä ihminen. Kun tila on päällä, muokkaat suoraan sitä versiota, joka viedään. Avainsanapisteytys on editorin Klassinen-tilassa.`,
          ],
          linkParagraphs: [
            {
              before: 'Kokeile sitä ',
              linkText: 'CV-rakentajassa',
              linkTo: ROUTES.builder,
              view: 'builder',
              after: ' — napsauta CV:n oikeasta yläkulmasta ATS-näkymä (tai kytke ATS-ystävällinen tila päälle Asetuksista).',
            },
          ],
        },
        {
          heading: 'Avainsanapisteytys — tarkista oikeaa työpaikkailmoitusta vasten',
          paragraphs: [
            'ATS-tulospaneeli laskee parseroitavuuspisteesi suoraan CV:n sisällöstä selaimessasi. Liitä tavoiteroolisi työpaikkailmoitus samaan paneeliin, ja PortifyCV näyttää, mitkä ilmoituksen tärkeistä termeistä eivät tällä hetkellä esiinny CV:ssäsi — ei arvausta siitä, mitkä avainsanat puuttuvat.',
          ],
          linkParagraphs: [
            {
              before: 'Katso ',
              linkText: 'CV:n taito-osion esimerkkejä',
              linkTo: ROUTES.cvSkills,
              view: 'cvSkills',
              after: ' siitä, miten muotoilla taidot niin että ne vastaavat ilmoituksen käyttämiä termejä.',
            },
          ],
        },
        {
          heading: 'Rehellisyys vientimuodoista: mikä on oikeasti koneluettavaa',
          paragraphs: [
            'PDF-vienti — myös ATS-tilassa — kuvakaappaa esikatselusivun ja upottaa sen kuvana PDF:ään korkean uskollisuuden säilyttämiseksi. Käytännössä tämä tarkoittaa, ettei edes ATS-tilan PDF ole itsestään selkeästi enemmän "koneluettava" tekstin poiminnan kannalta kuin tyylitelty versio — molemmat ovat kuva sivusta. Voit tarkistaa oman PDF-vientisi avaamalla sen ja yrittämällä valita tekstiä hiirellä — jos teksti ei ole valittavissa, se on kuva.',
            'Word-vienti (.docx) rakennetaan suoraan CV:si tiedoista oikeana tekstinä, ja .docx on muoto, jonka useimmat hakijaseurantajärjestelmät ottavat vastaan. Yksi varaus: 12 pohjaa 18:sta viedään Wordiin kaksipalstaisena taulukkona, jotta asettelu säilyy, ja kuten yllä todettiin, osa jäsentimistä lukee taulukoita huonosti. Yksipalstaisen Word-tiedoston saat pohjista Minimalisti, Tiivis, Klassinen ammattilainen, Toimituksellinen, Moderni aikajana ja Muotokuva. Myös HTML-vienti säilyttää oikean, valittavissa olevan tekstin koko sisällöstä.',
          ],
        },
        {
          heading: 'Kirjoita sisältöä, joka pisteytyy hyvin ja lukee hyvin',
          paragraphs: [
            'Avainsanojen tunkeminen tekstiin lukijaa varten ei toimi kummallekaan yleisölle — ATS-pisteytys nostaa esiin puuttuvat termit, mutta lopullinen lukija on silti ihminen. PortifyCV:n sisäänrakennettu ehdotuspaneeli merkitsee passiiviset ilmaisut ("vastuualueena") ja kokemuskohdat, jotka eivät ala vahvalla verbillä tai joista puuttuu mitattava luku — samat asiat, jotka tekevät tekstistä sekä paremmin pisteytyvää että aidosti luettavampaa.',
          ],
          linkParagraphs: [
            {
              before: 'Katso koko ',
              linkText: 'Näin kirjoitat CV:n',
              linkTo: ROUTES.howToWrite,
              view: 'howToWrite',
              after: ' -opas heikoista ja vahvoista uudelleenkirjoitusesimerkeistä.',
            },
          ],
        },
        {
          heading: 'Nopea tarkistuslista ennen lähettämistä',
          list: [
            'Vaihda ATS-ystävälliseen tilaan ja tarkista, ettei mitään puutu tai ole oudossa järjestyksessä',
            'Liitä tavoiterooli ja tarkista avainsanaosuma',
            'Varmista, että yhteystiedot ovat oikeaa tekstiä, ei kuvan sisällä',
            'Jos järjestelmä vaatii aidosti jäsenneltävää tekstiä, vie PDF:n sijaan Word-tiedosto yksipalstaisesta pohjasta (tai HTML)',
          ],
        },
      ],
      ctaLabel: 'Tarkista oma ATS-pisteesi',
      ctaNote: 'Ei kirjautumista. CV pysyy selaimessasi.',
    }
  }

  return {
    kicker: 'Guide',
    title: 'ATS-Friendly CV Guide',
    intro:
      'An applicant tracking system (ATS) is software, not a person, and it reads your CV differently than you’d expect. Here’s what it actually does, what breaks it, and how to check your own CV against real scoring instead of guessing.',
    sections: [
      {
        heading: 'What an ATS actually does',
        paragraphs: [
          'It extracts raw text from your file, pulls out fields (name, contact details, experience, skills), and often ranks candidates by keyword match against the job description. Two consequences follow: if the parser can’t extract clean text, none of your content counts — and even content that is parsed correctly scores low if it doesn’t mention the right terms, regardless of whether you actually have that skill.',
        ],
      },
      {
        heading: 'What breaks ATS parsing',
        list: [
          'Multi-column layouts: some parsers read left-to-right across the whole page, so a two-column layout can interleave your experience with your skills sidebar into nonsense.',
          'Text inside images, icons, or text boxes: parsers usually only read real text in the document’s text layer, not text baked into a graphic.',
          'Tables used for layout: similar issue — content inside table cells is sometimes skipped or read out of order.',
          'Contact info placed in a header or footer: some parsers ignore those regions entirely, dropping your email and phone number.',
          'Unusual fonts or heavy use of symbols as bullets: can produce garbled character output.',
          'Section headings that aren’t the expected words ("My Journey" instead of "Experience") can stop the parser from correctly categorizing the content underneath.',
        ],
      },
      {
        heading: 'How PortifyCV’s ATS mode helps',
        paragraphs: [
          `ATS-friendly mode flattens any of the ${TEMPLATE_COUNT} templates into a single-column, text-forward layout with standard section headings — columns, icons, and decorative elements are removed from that render. Export in this mode when the destination is an ATS rather than a person. While it’s on, the CV you edit is the version you export. Keyword scoring lives in the builder’s Classic mode.`,
        ],
        linkParagraphs: [
          {
            before: 'Try it in the ',
            linkText: 'CV builder',
            linkTo: ROUTES.builder,
            view: 'builder',
            after: ' — click ATS view at the top right of your CV (or turn on ATS-friendly mode in Settings).',
          },
        ],
      },
      {
        heading: 'Keyword scoring — check against a real job posting',
        paragraphs: [
          'The ATS score panel calculates your parser-readiness score directly from your CV content in your browser. Paste the job posting for the role you’re targeting into the same panel, and PortifyCV shows exactly which of the posting’s important terms don’t currently appear on your CV — no guessing which keywords are missing.',
        ],
        linkParagraphs: [
          {
            before: 'See ',
            linkText: 'CV skills examples',
            linkTo: ROUTES.cvSkills,
            view: 'cvSkills',
            after: ' for how to phrase skills so they match the terms a posting actually uses.',
          },
        ],
      },
      {
        heading: 'Being honest about export formats: what’s actually machine-readable',
        paragraphs: [
          'PDF export — including in ATS mode — captures a screenshot of the preview page and embeds it as an image in the PDF, to preserve full visual fidelity. In practice, this means even the ATS-mode PDF isn’t inherently more "machine-readable" for text extraction than the styled version — both are a picture of the page. You can check your own PDF export by opening it and trying to select text with your mouse — if the text isn’t selectable, it’s an image.',
          'Word export (.docx) is built straight from your CV data as real text, and .docx is the format most applicant tracking systems accept. One caveat: 12 of the 18 templates export to Word as a two-column table to keep their layout, and as noted above, some parsers read tables poorly. Minimalist, Compact, Classic Professional, Editorial, Modern Timeline, and Portrait give you a one-column Word file. HTML export also preserves actual, selectable text for the full content.',
        ],
      },
      {
        heading: 'Write content that scores well and reads well',
        paragraphs: [
          'Stuffing keywords in for the parser doesn’t work for either audience — ATS scoring surfaces missing terms, but the final reader is still a person. PortifyCV’s built-in suggestions panel flags passive phrasing ("responsible for") and experience bullets that don’t open with a strong verb or are missing a measurable number — the same things that make text score better and read better.',
        ],
        linkParagraphs: [
          {
            before: 'See the full ',
            linkText: 'How to Write a CV',
            linkTo: ROUTES.howToWrite,
            view: 'howToWrite',
            after: ' guide for weak-vs-strong rewrite examples.',
          },
        ],
      },
      {
        heading: 'A quick pre-submit checklist',
        list: [
          'Switch to ATS-friendly mode and check nothing is missing or reordered strangely',
          'Paste your target job description and check your keyword match',
          'Confirm contact info appears as real text, not inside an image',
          'If the destination system needs genuinely parseable text, export Word from a one-column template (or HTML) instead of PDF',
        ],
      },
    ],
    ctaLabel: 'Check your ATS score',
    ctaNote: 'No login. Your CV stays in your browser.',
  }
}

function AtsFriendlyCvGuidePage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="atsGuide"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={[{ view: 'howToWrite' }, { view: 'cvSkills' }, { view: 'coverLetterExamples' }]}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default AtsFriendlyCvGuidePage
