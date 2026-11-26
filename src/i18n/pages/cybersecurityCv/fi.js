// The cybersecurity CV examples page in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { fieldSearch } from '../../../utils/templateFields.js'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

export default {
  kicker: 'Esimerkkejä',
  title: 'Tietoturva-alan CV-esimerkkejä',
  intro:
    'Tietoturva-CV:n pitää näyttää sekä leveyttä (viitekehykset, vaatimustenmukaisuus) että kädet-savessa-erikoisuutta (työkalut, oikeat tapaukset) — "tietoturva-ammattilainen" ei kerro kummastakaan mitään.',
  sections: [
    {
      heading: 'Kokemuskohta, joka näyttää mitä oikeasti teit',
      examplePair: {
        weakLabel: 'Heikko',
        weak: '"Vastasin yrityksen tietoturvasta ja uhkien seurannasta."',
        strongLabel: 'Vahva',
        strong: '"Johdin tietojenkalastelukampanjan häiriövastetta 400 työntekijän laajuudessa, rajaten tunkeutumisen 3 tunnissa ja rakentaen SIEM:iin uudet tunnistussäännöt saman kaavan varalle."',
      },
    },
    {
      heading: 'Sertifikaatit, jotka kannattaa nimetä tarkasti',
      paragraphs: [
        'CompTIA Security+, CEH, OSCP, CISSP, CISM — kirjoita ne omaan Sertifikaatit-osioonsa myöntäjän ja vuoden kanssa. Osa näistä vanhenee, joten PortifyCV:n vanhenemispäivä-kenttä on tässä alalla erityisen hyödyllinen.',
      ],
    },
    {
      heading: "Kerro laajuus ja vakavuus luvuin",
      paragraphs: [
        "Tietoturvatyötä on helpompi arvioida lukujen avulla: valvotut päätelaitteet tai käyttäjät, päivittäin luokitellut hälytykset, vuodessa hoidetut häiriöt ja kuinka nopeasti ne havaitaan ja rajataan (usein MTTD ja MTTR). \"Luokittelin noin 200 hälytystä viikossa 15 asiakasverkolle\" kertoo heti, missä mittakaavassa toimit.",
      ],
    },
    {
      heading: 'Taidot, jotka näyttävät konkreettisia työkaluja',
      list: [
        'SIEM: Splunk, QRadar, Microsoft Sentinel',
        'Haavoittuvuuksien hallinta ja tunkeutumistestaus',
        'Häiriövaste ja rikostekninen analyysi',
        'Vaatimustenmukaisuus: NIST, ISO 27001',
        'Identiteetin- ja pääsynhallinta (IAM)',
      ],
    },
    {
      heading: "Sertifikaatit, jotka pitää uusia",
      paragraphs: [
        "Moni tietoturvasertifikaatti vanhenee tai vaatii täydennyskoulutuspisteitä pysyäkseen voimassa. Kerro jokaisesta myöntäjä, vuosi ja vanhenemispäivä (PortifyCV:n Sertifikaatit-osiossa on sille kenttä), jotta rekrytoijan ei tarvitse tarkistaa. Laita ilmoituksessa mainitut sertifikaatit ensimmäisiksi.",
      ],
    },
    {
      heading: "Kerro häiriöistä paljastamatta mitään luottamuksellista",
      paragraphs: [
        "Kuvaa häiriön tyyppi, oma osuutesi ja lopputulos, mutta älä koskaan asiakkaiden nimiä, IP-osoitteita tai yksityiskohtia, joista järjestelmän voisi tunnistaa: \"Rajasin kiristyshaittaohjelmatartunnan 400 hengen asiakasyrityksessä 3 tunnissa; dataa ei menetetty\" on riittävän konkreettinen. Jos kuvaus vaatisi luottamuksellisia tietoja ollakseen ymmärrettävä, pidä se yleisellä tasolla.",
      ],
    },
    {
      heading: 'Käytännön näyttö: Hack The Box, TryHackMe, CTF-tulokset',
      paragraphs: [
        'PortifyCV:n Linkit-osiossa on omat kentät suoraan Hack The Boxille ja TryHackMelle — jos sinulla on profiili jommassakummassa, se kuuluu tähän omana rivinään, ei upotettuna tekstiin.',
      ],
    },
    {
      heading: "Siirtyminen tietoturvaan IT:stä tai ohjelmistokehityksestä",
      paragraphs: [
        "Moni asia, jota SOC- tai tietoturvatiimi tarvitsee, voi jo olla työtäsi: lokien lukeminen, verkot, skriptaus, päivitysten hallinta ja käyttöoikeuksien hallinta. Nimeä ne tietoturvan termein (\"lokianalyysi\", \"koventaminen\", \"identiteetin- ja pääsynhallinta\"), lisää kotilabra tai CTF-tulokset näyttämään harjoittelusi ja valitse puoli, joka sopii taustaasi: IT:stä siirrytään usein puolustavaan (blue team) työhön, ohjelmistokehityksestä sovellustietoturvaan.",
      ],
    },
    {
      heading: "Turvallisuusselvitys",
      paragraphs: [
        "Jos sinulla on turvallisuusselvitys, kerro se ja sen taso, kun saat. Suomessa monet julkisen sektorin ja huoltovarmuuskriittisten alojen tehtävät edellyttävät turvallisuusselvitystä, ja valmis selvitys voi lyhentää rekrytointia.",
      ],
    },
    {
      heading: 'Nämä hakemukset kulkevat lähes aina ATS:n läpi',
      paragraphs: [
        'Isot yritykset ja julkishallinto seulovat tietoturvahakemuksia automaattisesti käytännössä aina — yksipalstainen asettelu ilman sarakkeita tai kuvakkeita on tällä alalla erityisen tärkeä.',
      ],
      linkParagraphs: [
        {
          before: 'Lue ',
          linkText: 'ATS-ystävällinen CV-opas',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ' ja tarkista oma pisteesi ennen lähettämistä.',
        },
      ],
    },
  ],
  ctaLabel: 'Aloita CV:si rakentaminen',
  fullExamples: {
    heading: 'Kokonainen tietoturva-analyytikon CV',
    intro: 'Sama esimerkkihenkilö kahdessa pohjassa. Kumpikin avautuu valmiina CV:nä, ja "Käytä tätä esimerkkiä" lataa sen editoriin muokattavaksi.',
  },
  ctaNote: 'Ei kirjautumista. Mitään ei tallenneta, ellet itse tallenna.',
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
    { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tekniikan ja IT-alan CV-pohjat' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
  ],
}
