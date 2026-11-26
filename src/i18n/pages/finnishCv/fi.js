// The Finnish CV examples page in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

// The understated templates the "safe choice" section links, as
// ExampleCvLinks pairs with no example (each links its template page).
const SAFE_TEMPLATES = [['minimal', null], ['classicProfessional', null], ['navyProfessional', null]]

export default {
  kicker: 'Esimerkkejä',
  title: 'Suomalaisen CV:n esimerkkejä',
  intro:
    'Suomalainen CV eroaa monesta kansainvälisestä käytännöstä muutamalla konkreettisella tavalla. Tässä on mitä kannattaa sisällyttää, mitä jättää pois, ja miten PortifyCV tukee kaksikielistä hakua.',
  sections: [
    {
      heading: 'Mitä jätetään pois',
      paragraphs: [
        'Henkilötunnusta, siviilisäätyä tai muita arkaluontoisia henkilötietoja ei kuulu laittaa CV:hen — ne eivät liity osaamiseesi, ja monissa maissa niiden pyytäminen olisi jopa kiellettyä. PortifyCV:n Henkilötiedot-osio kysyy vain nimen, tehtävänimikkeen ja yhteystiedot — ei tilaa, jonne tällaista tietoa voisi vahingossa raapustaa.',
      ],
    },
    {
      heading: 'Pituus ja rakenne',
      paragraphs: [
        'Yksi tai kaksi sivua riittää useimmille — pidempi CV ei näytä kokeneemmalta, se näyttää editoimattomalta. Rakenne on lähellä muuta Eurooppaa: yhteystiedot, lyhyt yhteenveto, työkokemus, koulutus, taidot, ja usein kielitaito omana osionaan.',
      ],
    },
    {
      heading: "Kuva ja henkilötiedot",
      paragraphs: [
        "Kuva on suomalaisessa CV:ssä yleinen mutta ei pakollinen. Jos lisäät sen, käytä selkeää ja tuoretta kasvokuvaa; kuvan puuttumista ei pidetä miinuksena. Vanhemmissa suomalaisissa CV:issä lueteltiin usein syntymäaika, perhe ja harrastukset tarkasti; nykyään riittää nimi, tehtävänimike, puhelin, sähköposti, kotikaupunki ja LinkedIn-linkki.",
      ],
    },
    {
      heading: "Päivämäärät, nimikkeet ja tutkinnot",
      list: [
        "Suomalaiset päivämäärät ovat yleensä muotoa \"1/2022–3/2024\". Valitse yksi muoto ja pidä siitä kiinni.",
        "Pidä tehtävänimikkeet CV:n kielellä, ja lisää englanninkieliseen CV:hen alkuperäinen nimike sulkuihin, jos sille ei ole selvää vastinetta.",
        "Käytä tutkinnoista virallisia nimiä ja käännöksiä, kuten \"insinööri (AMK)\" tai englanniksi \"Bachelor of Engineering\", jotta lukija tietää tason.",
      ],
    },
    {
      heading: 'Kielitaito-osio on tavallista tärkeämpi',
      paragraphs: [
        'Suomalaisilla työpaikoilla kysytään usein sekä suomen että ruotsin taitoa englannin lisäksi. PortifyCV:n Kielet-osiossa jokaiselle kielelle merkitään oma taso — tämä kannattaa täyttää huolella, se on yksi ensimmäisistä asioista, joita moni rekrytoija Suomessa katsoo.',
      ],
    },
    {
      heading: "Kielitodistukset: YKI ja virkamiesruotsi",
      paragraphs: [
        "Jos olet suorittanut yleisen kielitutkinnon (YKI), kerro kieli ja taso, esimerkiksi \"suomi, YKI taso 4\". Se kertoo työnantajalle enemmän kuin \"hyvä\". Julkisen sektorin tehtävissä vaaditaan usein todistus virkamiesruotsista tai -suomesta, joten mainitse se, jos sinulla on sellainen.",
      ],
    },
    {
      heading: 'Rakenna se suomeksi — tai molemmilla kielillä',
      paragraphs: [
        'PortifyCV toimii kokonaan suomeksi kielivalitsimen kautta: koko rakentaja, esikatselu ja viennit kääntyvät, joten voit kirjoittaa CV:n suoraan suomalaiselle työnantajalle sopivalla kielellä sen sijaan, että kirjoittaisit sen englanniksi ja kääntäisit jälkikäteen. CV:n kieli voi myös poiketa sovelluksen kielestä: Asetukset › CV:n kieli määrää CV:n otsikot, päivämäärät ja viennit, joten voit käyttää rakentajaa suomeksi ja tehdä englanninkielisen CV:n tai päinvastoin.',
      ],
    },
    {
      heading: 'Sama sisältö kahdella kielellä',
      examplePair: {
        weakLabel: 'Suomeksi',
        weak: '"Johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
        strongLabel: 'Englanniksi',
        strong: '"Led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
      },
      paragraphsAfter: [
        'Rakenne ja luvut pysyvät samoina — vain kieli vaihtuu. Vältä suoraa sanasta sanaan -käännöstä, joka usein kuulostaa kömpelöltä; kirjoita lause uudelleen kohdekielellä.',
      ],
    },
    {
      heading: "Suosittelijat",
      paragraphs: [
        "Suomalaiset työnantajat ottavat yhteyttä suosittelijoihin, usein prosessin loppuvaiheessa. Yhden tai kahden nimen listaaminen tehtävänimikkeen ja puhelinnumeron kanssa on tavallista; myös \"suosittelijat pyydettäessä\" käy. Kysy jokaiselta lupa ennen kuin listaat hänet.",
      ],
    },
    {
      heading: "Varusmies- tai siviilipalvelus ja vapaaehtoistyö",
      paragraphs: [
        "Suoritetun varusmies- tai siviilipalveluksen voi mainita lyhyesti, ja siitä kannattaa kertoa rivi, kun se liittyy haettavaan työhön: johtajakoulutus, erikoistehtävä tai työssä tarvittavat taidot. Vapaaehtoistyötä ja järjestöjen luottamustehtäviä arvostetaan Suomessa; kerro niistä lyhyesti, mitä teit.",
      ],
    },
    {
      heading: "Hakeminen: CV ja hakemus, usein lomakkeella",
      paragraphs: [
        "Useimmat suomalaiset työnantajat odottavat CV:n lisäksi erillisen hakemuksen. Monet käyttävät verkkolomaketta, jolle ladataan CV ja liitetään hakemus tai vastataan muutamaan kysymykseen. Kirjoita molemmat ilmoituksen kielellä.",
      ],
    },
    {
      heading: 'Turvallinen, ammattimainen pohjavalinta',
      paragraphs: [
        `Nämä kolme lukevat siistin ja asiallisen, mikä sopii suomalaisten työnantajien yleensä maltillisiin odotuksiin — mutta mikä tahansa ${TEMPLATE_COUNT} pohjasta toimii, ja vaihtaminen ei koske tekstiäsi:`,
      ],
      templateLinks: SAFE_TEMPLATES,
      linkParagraphs: [
        {
          before: 'Katso kaikki ',
          linkText: `${TEMPLATE_COUNT} ilmaista pohjaa`,
          linkTo: ROUTES.freeTemplates,
          view: 'freeTemplates',
          after: '.',
        },
      ],
    },
  ],
  ctaLabel: 'Aloita CV:si rakentaminen',
  fullExamples: {
    heading: 'Kokonaisia CV-esimerkkejä Eurooppalainen-pohjassa',
    intro: 'Eurooppalainen-pohja noudattaa EU:ssa yleistä Europass-tyylistä asettelua. Esimerkit avautuvat valmiina CV:inä sillä kielellä, jonka olet valinnut, ja "Käytä tätä esimerkkiä" lataa ne editoriin muokattavaksi.',
  },
  ctaNote: 'Ei kirjautumista. Saatavilla suomeksi ja englanniksi.',
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
    { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Ilmaiset CV-pohjat' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
  ],
}
