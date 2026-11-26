// The IT CV examples page in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { fieldSearch } from '../../../utils/templateFields.js'

// "See also" opens the templates grid on the Tech chip (1.6.14).
const TECH_SEARCH = fieldSearch('tech')

export default {
  kicker: 'Esimerkkejä',
  title: 'IT-alan CV-esimerkkejä',
  intro:
    'Järjestelmänvalvojasta tukihenkilöön: IT-rekrytoija etsii tiettyjä järjestelmiä, ympäristön kokoa ja sertifikaatteja, ei yleisiä "tietokonetaitoja". Näin kirjoitat ne näkyviin, ja lopussa on kokonainen esimerkki-CV.',
  sections: [
    {
      heading: 'Mitä IT-rekrytoija katsoo ensimmäiseksi',
      paragraphs: [
        'Ensimmäisellä silmäyksellä rekrytoija etsii neljää asiaa: minkä kokoista ympäristöä olet tukenut, millä tasolla (1., 2. vai 3. taso), mitä järjestelmiä ja työkaluja käytit ja mitä muuttui, koska olit siellä. Jos nämä löytyvät viimeisimmän tehtäväsi kolmesta ensimmäisestä rivistä, CV on jo parempi kuin useimmat.',
      ],
    },
    {
      heading: 'Kokemuskohta, joka näyttää mittarin',
      examplePair: {
        weakLabel: 'Heikko',
        weak: '"Vastasin yrityksen IT-infrastruktuurista ja autoin työntekijöitä tietokoneongelmissa."',
        strongLabel: 'Vahva',
        strong: '"Lyhensin palvelupisteen tikettien keskimääräisen ratkaisuajan 48 tunnista 6 tuntiin uudistamalla sisäisen tietopankin ja automatisoimalla salasanojen nollaukset."',
      },
      paragraphsAfter: [
        'Samaa mallia voi käyttää IT:n eri tehtävissä:',
      ],
      list: [
        'Järjestelmänvalvonta. Heikko: "Ylläpidin palvelimia." Vahva: "Ylläpidin 40 Windows- ja Linux-palvelinta 99,9 %:n käytettävyydellä ja automatisoin kuukausipäivitykset, mikä säästi noin 10 työtuntia kuukaudessa."',
        'Verkot. Heikko: "Hoidin yrityksen verkkoa." Vahva: "Uudistin kolmen toimipisteen verkon ja VPN:n; verkkokatkoista johtuvat tiketit vähenivät noin 70 %."',
        'Palvelupiste. Heikko: "Autoin käyttäjiä ongelmissa." Vahva: "Käsittelin noin 40 tikettiä päivässä, ja niistä 92 % ratkesi ensimmäisellä yhteydenotolla."',
      ],
    },
    {
      heading: 'Kerro ympäristöstäsi luvuin',
      paragraphs: [
        'Sama tehtävänimike voi tarkoittaa 20 tai 2 000 käyttäjän ympäristöä. Kerro koko, niin lukija näkee heti, millaiseen työhön olet tottunut:',
      ],
      list: [
        'käyttäjien määrä ("900 käyttäjää kolmessa toimipisteessä")',
        'laitteet ja palvelimet ("450 kannettavaa, 40 palvelinta")',
        'tikettimäärät ja tavoiteajat ("noin 40 tikettiä päivässä, SLA 8 tuntia")',
        'käytettävyys tai katkot ("99,9 %:n käytettävyys", "nolla suunnittelematonta katkoa vuonna 2024")',
      ],
    },
    {
      heading: 'Kerro taso, kun nimikkeet vaihtelevat',
      paragraphs: [
        'IT-nimikkeet tarkoittavat eri yrityksissä eri asioita: "IT-tuki" voi olla puhelinpalvelua tai palvelinylläpitoa. Lisää taso nimikkeen perään sulkuihin, esimerkiksi "IT-tukihenkilö (2. taso)", niin rekrytoijan ei tarvitse arvata. Jos olet siirtynyt tasolta toiselle saman työnantajan palveluksessa, listaa tehtävät erikseen, jotta eteneminen näkyy.',
      ],
    },
    {
      heading: 'Sertifikaatit omaan osioonsa ja tarkalla nimellä',
      paragraphs: [
        'CompTIA A+/Network+/Security+, Cisco CCNA, Microsoftin sertifikaatit: kirjoita ne omaan osioonsa tarkalla nimellä, myöntäjällä ja vuodella. PortifyCV:n Sertifikaatit-osiossa on kentät myöntäjälle, vuodelle ja vanhenemispäivälle, joten voimassaolo näkyy suoraan. Moni IT-sertifikaatti vanhenee, ja rekrytoija tarkistaa sen.',
      ],
    },
    {
      heading: 'Taidot, jotka kuulostavat IT:ltä, eivät toimistotaidoilta',
      paragraphs: [
        'Ryhmittele taidot alueittain, niin lukija löytää omansa nopeasti:',
      ],
      list: [
        'Järjestelmät: Active Directory, Microsoft 365, Windows Server, Linux',
        'Laitehallinta: Intune, SCCM, Jamf',
        'Verkot: TCP/IP, DNS, DHCP, VPN, palomuurit',
        'Työkalut ja prosessit: ServiceNow, Jira, ITIL',
        'Virtualisointi ja pilvi: VMware, Hyper-V, Azure',
      ],
      paragraphsAfter: [
        '"Microsoft Office" ei erotu. "Active Directoryn käyttäjähallinta 500 työaseman ympäristössä" erottuu.',
      ],
    },
    {
      heading: 'Näytä automatisointi ja dokumentointi',
      paragraphs: [
        'Parhaat IT-hakijat eivät vain korjaa samaa vikaa uudelleen, vaan estävät sen. Jos kirjoitit skriptin, joka poisti toistuvan työn, tai ohjeen, joka vähensi kysymyksiä, kerro se luvun kanssa: "PowerShell-skripti uusien tunnusten luontiin poisti noin 35 tikettiä viikossa." Tällainen rivi kertoo enemmän kuin pitkä lista työkaluja.',
      ],
    },
    {
      heading: 'Uran alussa: kotilabra ja projektit',
      paragraphs: [
        'Jos työkokemusta on vähän, oma testiympäristö on hyvä näyttö: virtuaalikoneilla rakennettu toimialue, kotiverkon VLANit tai pieni skripti, joka hoitaa jonkin arkisen tehtävän. Kirjaa ne Projektit-osioon kuten työtehtävät: mitä rakensit, millä välineillä ja mitä opit tai mikä parani.',
      ],
    },
    {
      heading: 'IT-hakemukset kulkevat ATS:n läpi useammin kuin useimmat',
      paragraphs: [
        'Suuret yritykset seulovat IT-hakemukset automaattisesti erityisen usein. Yksipalstainen asettelu ja selkeät osio-otsikot hyödyttävät tällä alalla enemmän kuin monella muulla.',
      ],
      linkParagraphs: [
        {
          before: 'Lue ',
          linkText: 'ATS-ystävällinen CV-opas',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ' ja tarkista oma CV:si ennen kuin haet.',
        },
      ],
    },
  ],
  ctaLabel: 'Aloita CV:si rakentaminen',
  ctaNote: 'Ei kirjautumista. Mitään ei tallenneta, ellet itse tallenna.',
  fullExamples: {
    heading: 'Kokonainen IT-tukihenkilön CV',
    intro: 'Sama esimerkkihenkilö kahdessa pohjassa: kuuden vuoden palvelupistekokemus, ympäristön koko luvuin, automatisointi ja voimassaolevat sertifikaatit. "Käytä tätä esimerkkiä" lataa sen editoriin muokattavaksi.',
  },
  seeAlso: [
    { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkit' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
    { to: `${ROUTES.freeTemplates}${TECH_SEARCH}`, view: 'freeTemplates', search: TECH_SEARCH, text: 'Tekniikan ja IT-alan CV-pohjat' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkit aloittain' },
  ],
}
