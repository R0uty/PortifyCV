// The builder guide (How to use the builder) in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
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
      figureLabel: 'Editori Suora muokkaus -tilassa: demo-CV, jonka yhteenvedon kentät ovat auki ponnahdusikkunassa sen vieressä.',
      caption:
        'Editori avautuu Suora muokkaus -tilassa: CV itse on editori. Napsauta mitä tahansa tekstiä — nimeäsi, tehtävänimikettä, luettelokohtaa — ja kirjoita. Jokaisen osion kynä avaa sen kaikki kentät osion viereen, missä voit lisätä, poistaa, kopioida ja järjestää kohteita uudelleen; useimmissa kaksipalstaisissa pohjissa voit myös siirtää osion pääpalstan ja sivupalkin välillä. Vasemman reunan valikko vie kuhunkin osioon, Osiot-valikosta piilotat ne, joita et tarvitse, ja "Lataa demo-CV" täyttää esimerkkisisällön pohjaksi.',
    },
    {
      step: 'sections',
      heading: 'Mieluummin lomake? Vaihda Klassinen-tilaan',
      figureLabel: 'Editori Klassinen-tilassa: osiot vasemmalla, lomake keskellä ja esikatselu oikealla.',
      caption:
        'Yläpalkin Suora muokkaus / Klassinen -valitsin vaihtaa lomakenäkymään: vasemman reunan valikko listaa jokaisen osion, lomake on keskellä ja oikean reunan esikatselu päivittyy kun kirjoitat. Lomakkeen yläosan Näkyvät osiot -paneelista voit kytkeä pois sen, mikä ei sovi tähän CV:hen — tiedot säilyvät joka tapauksessa. Molemmat tilat muokkaavat samaa CV:tä, joten voit vaihtaa milloin vain. Vaiheiden 3 ja 5 työkalut ovat Klassinen-tilassa.',
    },
    {
      step: 'bullets',
      heading: 'Terävöitä kokemuskohdat',
      figureLabel: 'Kokemusosio Klassinen-tilassa: heikko luettelokohta, sen alla kohdan oma vinkki ja roolin vinkki "Vahvista sanamuotoa".',
      caption:
        'Jokainen saavutuskohta saa omat vinkkinsä heti, kun siirryt siitä eteenpäin, sekä Klassinen- että Suora muokkaus -tilassa: tehtävälistan kaltaiset ilmaukset kuten "vastuualueena", heikot aloitukset kuten "Olin", täytesanat kuten "onnistuneesti", yli 30 sanan kohdat, edellisen kohdan kanssa sama aloitusverbi ja kohdat ilman lukua. "ATS-pisteet ja ehdotukset" -paneeli laskee roolien vinkit yhteen. Kunkin työpaikan saavutusten alla oleva "Hae ideoita" lisää esimerkki-CV:iden kohtia, joissa luvut on korvattu merkillä [__]; täytä oma lukusi, sillä vinkki merkitsee kohdan, jossa [__] on yhä jäljellä.',
    },
    {
      step: 'template',
      heading: 'Valitse pohja — sisältösi pysyy ennallaan',
      figureLabel: 'Pohjagalleria: alasuodattimet pohjakorttien yllä, kullakin kortilla kolme tyyliä.',
      caption:
        `Pohjan vaihtaminen ei koskaan kosketa tekstiäsi, joten kaikkien ${TEMPLATE_COUNT} pohjan kokeilu on turvallista. Jokainen pohja käyttää eri osioita — ne, joita pohja ei käytä, piilotetaan editorista ja esikatselusta kunnes vaihdat takaisin. Jokaisella pohjalla on myös kolme tyyliä (värit, fontti ja otsikoiden väri), jotka valitset yläpalkin Ulkoasu-valikosta.`,
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
      figureLabel: 'Työpaikkailmoituksen avainsanat: liitetty ilmoitus, kattavuus ja puuttuvat avainsanat.',
      caption:
        'Avaa Klassinen-tilassa lomakekenttien yläpuolelta "ATS-pisteet ja ehdotukset" -paneeli. Sen "ATS-ystävällinen tila" -kytkin vaihtaa esikatselun tasaiseksi, yhden sarakkeen asetteluksi, jonka hakijaseurantajärjestelmät osaavat lukea (Suora muokkaus -tilassa saman tekee CV:n oikean yläkulman ATS-näkymä-painike), ja työpaikkailmoituksen liittäminen listaa avainsanat, jotka CV:stäsi vielä puuttuvat.',
    },
    {
      step: 'export',
      heading: 'Vie tiedostoksi tai jaa linkkinä',
      figureLabel: 'Avattu Vie-valikko: PDF, HTML, JSON, Word ja jakolinkki.',
      caption:
        'Vie-valikossa on neljä muotoa: PDF hakemuksiin, Word muokattavaksi toisessa ohjelmassa, HTML verkkoon ja JSON varmuuskopioksi tai myöhempää muokkausta varten. Saman valikon lopun Kopioi jakolinkki koodaa koko CV:n URL-osoitteeseen — sitä ei lähetetä palvelimelle, eivätkä kuvat mahdu mukaan. Linkki avaa katselusivun, jolta vastaanottaja voi ladata PDF:n tai avata muokattavan kopion uuteen välilehteen; mukana kulkevat fontti, värit, ATS-tila ja PDF:n paperikoko. Vasemman reunan Hakemuskirje-kohta (puhelimella ⋯-valikossa) luo CV:si pohjalta muokattavan hakemuskirjeluonnoksen CV:n kielellä ja vie sen PDF:ksi CV:n ulkoasussa.',
    },
    {
      step: 'restore',
      heading: 'Työsi on suojattu vahinkopäivitykseltä',
      figureLabel: 'Asetukset-ikkuna, jossa "Palauta viimeisin istunto" on päällä.',
      caption:
        '"Palauta viimeisin istunto" on oletuksena päällä: muokkaamastasi CV:stä säilyy työkopio vain siinä välilehdessä, joten sivun päivitys ei hävitä sitä. Välilehden sulkeminen poistaa kopion, joten vie JSON, jos haluat jatkaa myöhemmin. Toiminnon voi kytkeä pois Asetuksista.',
    },
  ],
  ctaLabel: 'Aloita CV:si rakentaminen',
  ctaNote: 'Ei kirjautumista. Mitään ei tallenneta, ellet itse tallenna.',
}
