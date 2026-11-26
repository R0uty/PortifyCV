// The developer CV examples page in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { fieldSearch } from '../../../utils/templateFields.js'
import { templatePageLink } from '../../../utils/pageMeta.js'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

const DEVELOPER_TEMPLATE = templatePageLink('developer')

export default {
  kicker: 'Esimerkkejä',
  title: 'Kehittäjän CV-esimerkkejä',
  intro:
    'Kehittäjän CV:tä ei arvioida tehtävänimikkeen vaan sen perusteella, mitä olet rakentanut ja millä vaikutuksella. Näin rakennat kokemuskohdat ja projektit, jotka näyttävät sen.',
  sections: [
    {
      heading: 'Kokemuskohta, joka näyttää vaikutuksen',
      examplePair: {
        weakLabel: 'Heikko',
        weak: '"Työskentelin backend-järjestelmien parissa ja korjasin virheitä."',
        strongLabel: 'Vahva',
        strong: '"Migroin monoliittisen Rails-API:n mikropalveluiksi, pudottaen p95-vasteajan 800 ms:sta 120 ms:iin ja vähentäen päivystyshälytyksiä 60 %."',
      },
      paragraphsAfter: [
        'Nimeä järjestelmä, mittari ja luku. "Korjasin virheitä" ei kerro mitään mitattavaa — "vähensin päivystyshälytyksiä 60 %" kertoo.',
      ],
    },
    {
      heading: "Lisää kehittäjän kokemuskohtia työn lajin mukaan",
      list: [
        "Frontend. Heikko: \"Rakensin käyttöliittymäkomponentteja.\" Vahva: \"Rakensin kassan uudelleen Reactilla ja pienensin sen JavaScriptiä 40 %; mobiilikonversio nousi 9 %.\"",
        "Backend. Heikko: \"Työskentelin rajapinnan parissa.\" Vahva: \"Jaoin tilausrajapinnan kolmeen palveluun ja laskin p95-vasteajan 800 ms:sta 120 ms:iin.\"",
        "Data. Heikko: \"Ylläpidin dataputkia.\" Vahva: \"Siirsin 30 yöajoa orkestroituun putkeen; epäonnistuneet ajot vähenivät noin kuudesta kuukaudessa yhteen.\"",
        "DevOps. Heikko: \"Hoidin CI/CD:tä.\" Vahva: \"Lyhensin käännöksen ja julkaisun 25 minuutista 7 minuuttiin ja siirsin julkaisut viikoittaisista päivittäisiksi.\"",
        "Mobiili. Heikko: \"Kehitin sovelluksen ominaisuuksia.\" Vahva: \"Toin offline-tilan 200 000 käyttäjän sovellukseen; kaatumattomien istuntojen osuus nousi 97,1 %:sta 99,4 %:iin.\"",
      ],
    },
    {
      heading: "Pidä teknologiat tuloksen vieressä",
      paragraphs: [
        "Rekrytoijat hakevat teknologioita, mutta pelkkä lista ei kerro, mitä teit niillä. Anna jokaiselle työpaikalle oma teknologiarivinsä (PortifyCV:n kokemuskohdissa on sille kenttä), ja anna kohtien kertoa, mitä saavutit. Käytä ilmoituksen nimiä: \"React\" eikä \"ReactJS\", jos ilmoituksessa lukee niin.",
      ],
    },
    {
      heading: 'Projektikohta, joka kannattaa muotoilla samalla tavalla joka kerta',
      paragraphs: [
        'Nimi, yhden lauseen kuvaus, teknologiapino ja linkit — PortifyCV:n Projektit-osiossa on omat kentät kaikille näille (myös GitHub- ja demolinkille), joten tätä rakennetta ei tarvitse väkisin sovittaa muuhun tekstiin.',
      ],
      examplePair: {
        weakLabel: 'Esimerkki',
        weak: '"Atlas Design System" — jaettu komponenttikirjasto, jonka kuusi tuotetiimiä ottivat käyttöön.',
        strongLabel: 'Pino',
        strong: 'React, TypeScript, Storybook · github.com/... · demo-linkki',
      },
    },
    {
      heading: 'Taidot: listaa, älä ryhmittele käsin',
      paragraphs: [
        'PortifyCV tunnistaa taitosi avainsanoilla ja ryhmittelee ne automaattisesti (Kehykset, Tietokannat, Pilvi, DevOps, Turvallisuus) useissa pohjissa, mukaan lukien Kehittäjä-pohjassa — riittää, että listaat taidot oikeilla nimillä.',
      ],
      linkParagraphs: [
        {
          before: 'Katso ',
          linkText: 'CV:n taito-osion esimerkkejä',
          linkTo: ROUTES.cvSkills,
          view: 'cvSkills',
          after: ' tarkemmin.',
        },
      ],
    },
    {
      heading: "Juniori tai itseoppinut? Projektit kantavat CV:n",
      paragraphs: [
        "Kun työhistoriaa on vähän, kaksi tai kolme hyvää projektia on kokemuksesi. Valitse sellaiset, jotka näyttävät oikealta työltä: ne ratkaisevat ongelman, niillä on README, joka selittää ne, ja ne näyttävät taidon, jota työ vaatii. Kuvaa jokainen kuin työpaikka: mitä se tekee, mitä rakensit, teknologiat sekä linkki koodiin ja, jos se on käynnissä, demoon. Yksi valmis projekti voittaa viisi tutoriaalia.",
      ],
    },
    {
      heading: 'Linkit-osio on osa tarinaa, ei jälkiajatus',
      paragraphs: [
        'GitHub, portfolio ja henkilökohtainen sivu kuuluvat omaan Linkit-osioonsa — ei upotettuina yhteenvetoon. Rekrytoija, joka haluaa nähdä koodisi, löytää sen suoraan.',
      ],
    },
    {
      heading: "GitHub-profiili, joka kannattaa linkittää",
      list: [
        "Kiinnitä kolmesta kuuteen repositoriota, jotka näyttävät parhaan työsi.",
        "Anna jokaiselle README: mitä se tekee, miten sen ajaa ja kuvakaappaus.",
        "Jos suurin osa työstäsi on yksityistä, kerro se profiilissa ja anna CV:n projektien puhua.",
        "Tyhjä tai hylätty profiili haittaa enemmän kuin profiilin puuttuminen; linkitä se vain, kun siitä on hyötyä.",
      ],
    },
    {
      heading: "Senioriteetin merkit",
      paragraphs: [
        "Kokemuksen kasvaessa rekrytoijat katsovat yksittäisten ominaisuuksien ohi vastuun laajuuteen: järjestelmät, joista vastasit, päätökset, jotka teit, ja ihmiset, joiden kasvua tuit. \"Suunnittelin tapahtumaputken, jonka neljä tiimiä otti myöhemmin käyttöön\", \"mentoroin kolme junioria itsenäisiksi omistajiksi\", \"johdin siirtymäsuunnitelman ja sen palautusstrategian\". Seniori- ja liidirooleissa jokaisessa työpaikassa pitäisi olla ainakin yksi kohta, joka näyttää vaikutuksen oman koodin ulkopuolella.",
      ],
    },
    {
      heading: 'Pohja, joka on rakennettu juuri tälle',
      linkParagraphs: [
        {
          before: '',
          linkText: 'Kehittäjä-pohjassa',
          linkTo: DEVELOPER_TEMPLATE.to,
          view: DEVELOPER_TEMPLATE.view,
          after: ' on tumma sivupalkki sekä projekti- ja saavutuskortit — rakennettu nimenomaan projektipohjaiselle uralle.',
        },
      ],
    },
  ],
  ctaLabel: 'Aloita Kehittäjä-pohjalla',
  fullExamples: {
    heading: 'Kokonaisia kehittäjän CV-esimerkkejä',
    intro: 'Jokainen avautuu valmiina CV:nä omassa pohjassaan, ja "Käytä tätä esimerkkiä" lataa sen editoriin muokattavaksi.',
  },
  ctaNote: 'Ei kirjautumista. Vaihda pohjaa milloin tahansa.',
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
    { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tekniikan ja IT-alan CV-pohjat' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
  ],
}
