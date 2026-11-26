// The ATS-friendly CV guide in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
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
      heading: 'Käytä otsikoita, jotka ATS tunnistaa',
      paragraphs: [
        'Jäsennin lajittelee CV:n kenttiin otsikoiden perusteella. Tavalliset, odotetut sanat toimivat parhaiten; luovat otsikot ("Matkani", "Mitä tuon mukanani") jättävät sen arvailemaan:',
      ],
      list: [
        'Yhteenveto tai Profiili',
        'Työkokemus',
        'Koulutus',
        'Taidot',
        'Sertifikaatit',
        'Kielitaito',
      ],
      paragraphsAfter: [
        'PortifyCV:n pohjissa on tällaiset vakio-otsikot, ja ATS-näkymä säilyttää ne pelkkänä tekstinä.',
      ],
    },
    {
      heading: 'Päivämäärät, nimikkeet ja yhteystiedot, jotka jäsennin osaa lukea',
      list: [
        'Käytä jokaisessa työpaikassa samaa päivämäärämuotoa kuukausineen, esimerkiksi "1/2022–3/2024". Jäsentimet laskevat päivämääristä kokemusvuotesi.',
        'Kirjoita tehtävänimike, työnantaja ja ajankohta omille, selkeästi erotetuille riveilleen, älä yhdeksi pitkäksi riviksi.',
        'Pidä nimi, sähköposti ja puhelinnumero CV:n varsinaisessa sisällössä, ei sivun ylä- tai alatunnisteessa, jonka osa jäsentimistä ohittaa.',
        'Älä laita yhteystietoja tai taitoja taulukoihin tai tekstilaatikoihin.',
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
        'ATS-tulospaneeli laskee parseroitavuuspisteesi suoraan CV:n sisällöstä selaimessasi. Liitä tavoiteroolisi työpaikkailmoitus samaan paneeliin, ja PortifyCV listaa ilmoituksesta tunnistamansa taidot ja vaatimukset: mitkä CV:si jo mainitsee ja mitkä siitä puuttuvat. Sen jälkeen voit tallentaa CV:stä kopion juuri tätä työpaikkaa varten ja muokata sitä.',
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
      heading: 'Käytä ilmoituksen sanoja täyttämättä CV:tä avainsanoilla',
      paragraphs: [
        'Avainsanapisteytys palkitsee ilmoituksen omista termeistä, joten käytä sen sanamuotoja silloin, kun ne pitävät paikkansa. Muutama tapa auttaa sekä jäsennintä että ihmistä, joka lukee CV:n seuraavaksi:',
      ],
      list: [
        'Kirjoita termi samalla tavalla kuin ilmoitus: jos siinä lukee "projektinhallinta", älä kirjoita pelkästään "hoidin projekteja".',
        'Kirjoita lyhenne kerran auki lyhyen muodon kanssa: "hakukoneoptimointi (SEO)". Silloin kumpi tahansa muoto osuu.',
        'Mainitse taito taitolistassa ja näytä se kokemuskohdassa tuloksen kanssa. Asiayhteys ratkaisee ihmislukijalle.',
        'Älä piilota avainsanoja valkoiseen tai pieneen tekstiin. Jäsennin näyttää sen rekrytoijan näkemässä tekstinäkymässä, ja se näyttää huijaamiselta.',
      ],
    },
    {
      heading: 'Rehellisyys vientimuodoista: mikä on oikeasti koneluettavaa',
      paragraphs: [
        'PDF-vienti piirtää jokaisen sivun kuvana esikatselusta, joten tiedosto näyttää täsmälleen samalta kuin ruudulla, ja kirjoittaa saman tekstin sen päälle oikeana, näkymättömänä tekstinä. Tekstin voi valita, hakea ja kopioida, linkit ja sähköpostiosoitteet ovat klikattavia, ja jäsennin saa sanat eikä tyhjää sivua. Teksti noudattaa sivun asettelua, joten kaksipalstaisessa pohjassa jäsennin voi silti lukea palstat oudossa järjestyksessä; ATS-tila antaa sille yhden palstan. Tarkista oma vientisi: PDF-esikatselun Mitä jäsennin lukee -välilehti lukee tiedoston takaisin ja näyttää, mitkä kentät tunnistettiin ja missä järjestyksessä teksti luetaan.',
        'Word-vienti (.docx) rakennetaan suoraan CV:si tiedoista oikeana tekstinä, ja .docx on muoto, jonka useimmat hakijaseurantajärjestelmät ottavat vastaan. Yksi varaus: 12 pohjaa 18:sta viedään Wordiin kaksipalstaisena taulukkona, jotta asettelu säilyy, ja kuten yllä todettiin, osa jäsentimistä lukee taulukoita huonosti. Yksipalstaisen Word-tiedoston saat pohjista Minimalisti, Tiivis, Klassinen ammattilainen, Toimituksellinen, Moderni aikajana ja Muotokuva. Myös HTML-vienti säilyttää oikean, valittavissa olevan tekstin koko sisällöstä.',
      ],
    },
    {
      heading: 'Testaa oma CV:si niin kuin jäsennin sen lukee',
      paragraphs: [
        'Avaa viemäsi tiedosto, valitse kaikki teksti ja liitä se pelkän tekstin editoriin. Kaiken pitäisi olla mukana järkevässä järjestyksessä: ensin nimi ja yhteystiedot, kunkin työpaikan nimike, työnantaja ja ajankohta yhdessä ja osio-otsikot tavallisina sanoina. Jos tekstiä ei voi valita lainkaan, tiedosto on kuva. Jos järjestys on sekaisin, jäsennin sekoittaa sen myös.',
      ],
    },
    {
      heading: 'Kolme ATS-myyttiä',
      list: [
        '"ATS hylkää kaikki muotoillut CV:t." Se ei hylkää muotoilua vaan lukee osan asetteluista väärin. Yksi palsta on varmin, ja siisti ulkoasu voi silti näyttää hyvältä.',
        '"Avainsanojen pitää osua sataprosenttisesti." Tarvitset ne tärkeät termit, jotka oikeasti hallitset. Kaikkeen osumaan täytetty CV kuulostaa huonolta sille, joka päättää.',
        '"ATS-ystävällinen tarkoittaa tylsää." Se tarkoittaa luettavaa rakennetta: selkeät otsikot, yksi palsta ja oikea teksti. Fontit, väljyys ja hieman väriä ovat sallittuja.',
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
        'Käytä tavallisia osio-otsikoita ja yhtä päivämäärämuotoa koko CV:ssä',
        'Liitä viety teksti pelkän tekstin editoriin ja tarkista, että se etenee järjestyksessä',
      ],
    },
  ],
  ctaLabel: 'Tarkista oma ATS-pisteesi',
  ctaNote: 'Ei kirjautumista. CV pysyy selaimessasi.',
}
