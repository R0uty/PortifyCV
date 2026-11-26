// The About page in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Tietoa',
  title: 'Tietoa PortifyCV:stä',
  intro:
    'PortifyCV on ilmainen, selaimessa toimiva CV-rakentaja. Ei tiliä, '
    + 'ei palvelinta, ei automaattista tallennusta — teet CV:n, viet sen '
    + 'tiedostona tai jakolinkkinä, ja siinä se.',
  sections: [
    {
      heading: 'Mikä PortifyCV on',
      paragraphs: [
        'PortifyCV auttaa kokoamaan siistin, tulostuskelpoisen ansioluettelon '
        + 'muutamassa minuutissa. Muokkaat CV:tä suoraan sivulla (tai '
        + `perinteisellä lomakkeella), valitset ${TEMPLATE_COUNT} pohjasta, joissa `
        + 'kussakin on kolme tyyliä, ja mukana on ATS-ystävällinen tila '
        + 'hakijaseurantajärjestelmiä varten, vienti PDF-, Word-, HTML- ja '
        + 'JSON-muodossa sekä CV:si pohjalta luotava hakemuskirjeluonnos. Koko '
        + 'käyttöliittymä toimii sekä englanniksi että suomeksi.',
        'Kaikki toiminnot ovat ilmaisia. Ei vesileimoja, ei maksumuurin takana '
        + 'olevia pohjia eikä pakollista rekisteröitymistä.',
      ],
    },
    {
      heading: 'Miten se toimii',
      paragraphs: [
        'PortifyCV on staattinen verkkosovellus, joka toimii kokonaan '
        + 'selaimessasi. Sillä ei ole taustapalvelinta eikä tietokantaa. '
        + 'Kaikki mitä kirjoitat, pysyy välilehden muistissa istunnon ajan, '
        + 'eikä sitä lähetetä minnekään. CV poistuu laitteeltasi vain, jos '
        + 'itse viet tiedoston tai luot jakolinkin.',
        {
          parts: [
            'Tarkempi kuvaus tietojen käsittelystä on ',
            {
              link: ROUTES.privacy,
              view: 'privacy',
              text: 'tietosuojaselosteessa',
            },
            '.',
          ],
        },
      ],
    },
    {
      heading: 'Kuka sen tekee',
      paragraphs: [
        'PortifyCV on riippumaton yhden kehittäjän projekti. Sitä ei tue '
        + 'mikään yritys eikä sijoittaja — se on rakennettu, koska ilmaiselle '
        + 'ja yksinkertaiselle CV-työkalulle ilman tilipakkoa oli tarvetta.',
      ],
    },
    {
      heading: 'Miten se rahoitetaan',
      paragraphs: [
        'PortifyCV on ja pysyy ilmaisena. Palvelun ylläpitokulujen '
        + 'kattamiseksi sivustolla näytetään mainoksia Google AdSensen '
        + 'kautta.',
        {
          parts: [
            'ETA-alueella, Yhdistyneessä kuningaskunnassa ja Sveitsissä '
            + 'näytetään Googlen sertifioima suostumusilmoitus, ja '
            + 'mainosevästeiden käyttö on kuvattu ',
            {
              link: ROUTES.privacy,
              view: 'privacy',
              text: 'tietosuojaselosteessa',
            },
            '. Mainoksilla ei ole pääsyä CV-sisältöösi.',
          ],
        },
      ],
    },
    {
      heading: 'Yhteystiedot',
      paragraphs: [
        {
          parts: [
            'Kysymykset, virheilmoitukset ja palaute: ',
            { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
            '.',
          ],
        },
      ],
    },
  ],
}
