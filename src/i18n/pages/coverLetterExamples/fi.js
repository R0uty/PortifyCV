// The cover letter examples page in Finnish.
import { ROUTES } from '../../../utils/routes.js'

export default {
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
        'PortifyCV:n saatekirjegeneraattori ei ole tekoäly — se on määrätietoinen malli, joka poimii CV:si datan suoraan: avaus nimeää hakemasi roolin ja yrityksen (jos annat ne), toinen kappale poimii viimeisimmän roolisi ja sen parhaan saavutuksen tai kuvauksen, kolmas listaa tärkeimmät taitosi, ja lopetus on valmiiksi kirjoitettu. Jos olet liittänyt työpaikkailmoituksen ATS-paneeliin, kolmas kappale listaa sen sijaan enintään neljä ilmoituksen vaatimusta, jotka CV:si kattaa, ja kirje tallentuu CV:si mukana (mutta ei koskaan jakolinkkiin). Sama "ei mitään palvelimelle" -periaate kuin muussakin sovelluksessa: luonnos rakennetaan kokonaan selaimessasi.',
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
