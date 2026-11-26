// The CV skills examples page in Finnish.
import { ROUTES } from '../../../utils/routes.js'

export default {
  kicker: 'Esimerkit',
  title: 'CV:n taito-osion esimerkkejä',
  intro:
    'Taito-osio on lyhin osa CV:täsi ja usein se, jota rekrytoija ja hakijaseurantajärjestelmä lukevat ensimmäisenä avainsanoja etsiessään. Näin valitset ja järjestät taidot, joilla on oikeasti merkitystä.',
  sections: [
    {
      heading: 'Kaksi tyyppiä taitoja — ja miksi vain toinen kuuluu listaan',
      paragraphs: [
        'Kovat taidot ovat tarkistettavissa: työkalut, ohjelmointikielet, menetelmät, sertifikaatit. Ne kuuluvat taito-osioon sellaisenaan. Pehmeät taidot ("johtajuus", "viestintä", "tiimipelaaja") eivät todista mitään pelkkänä sanana kelluvana listassa — ne kannattaa näyttää kokemuskohdissa konkreettisen saavutuksen vieressä, ei nimetä erikseen taitolistassa.',
      ],
    },
    {
      heading: 'Esimerkkejä taitoryhmistä',
      paragraphs: [
        'Nämä ovat havainnollistavia ryhmittelyjä, eivät tyhjentäviä listoja — poimi ja muokkaa oman alasi mukaan:',
      ],
      list: [
        'Suunnittelutyökalut: Figma, Sketch, Adobe XD, Webflow, Suunnittelujärjestelmät, Prototyypitys',
        'Kehitys: Python, SQL, JavaScript, React, Git, Docker, AWS',
        'Prosessit ja menetelmät: Agile/Scrum, Käyttäjätutkimus, A/B-testaus, Sidosryhmien johtaminen',
      ],
      paragraphsAfter: [
        'PortifyCV ryhmittelee taitosi automaattisesti näihin kaltaisiin kategorioihin (Kehykset, Tietokannat, Pilvi, DevOps, Turvallisuus) useissa pohjissa — riittää, että listaat taidot, avainsanantunnistus hoitaa ryhmittelyn puolestasi.',
      ],
    },
    {
      heading: "Taitoryhmiä teknologian ulkopuolelta",
      paragraphs: [
        "Jokaisella alalla on omat kovat taitonsa. Muutama lähtökohta:",
      ],
      list: [
        "Hoitoala: potilaan tilan arviointi, lääkehoito, haavanhoito, sähköinen potilaskertomus, aseptiikka",
        "Talous ja kirjanpito: tilinpäätösraportointi, kuukausikatkot, IFRS, budjetointi, Excel-mallinnus, käyttämäsi toiminnanohjausjärjestelmä",
        "Myynti ja markkinointi: CRM (nimeä järjestelmä), myyntiputken hallinta, neuvottelu, hakukoneoptimointi, kampanja-analytiikka",
        "Asiakaspalvelu: tikettijärjestelmät, chat-palvelu, reklamaatioiden käsittely, palvelutasotavoitteet",
        "Opetus: opetussuunnitelmatyö, luokanhallinta, arvioinnin suunnittelu, digitaaliset oppimisympäristöt",
        "Ravintola-ala: hygieniaosaaminen, annoslaskenta, varastonhallinta, työvuorosuunnittelu",
      ],
    },
    {
      heading: 'Kielitaito kuuluu omaan osioonsa',
      paragraphs: [
        'Puhuttu ja kirjoitettu kielitaito (Englanti — Sujuva, Suomi — Äidinkieli) ei kuulu taito-osioon — PortifyCV:ssä sillä on oma "Kielet"-osionsa, jossa jokaiselle kielelle voi merkitä tason erikseen. Sekoittaminen taitolistaan hukkaa molemmat: kielitaso ei näy selkeästi rivissä muiden taitojen joukossa.',
      ],
    },
    {
      heading: "Näytä pehmeät taidot kokemuskohdissa, älä listassa",
      examplePair: {
        weakLabel: "Heikko",
        weak: "Taidot: \"Erinomaiset vuorovaikutustaidot, johtajuus, ongelmanratkaisu\"",
        strongLabel: "Vahva",
        strong: "Kokemuskohta: \"Johdin 6 hengen tiimin järjestelmäsiirron läpi ja pidin viikkotiedotteet 40 käyttäjälle; yksikään määräaika ei venynyt.\"",
      },
      paragraphsAfter: [
        "Vahva versio näyttää johtajuuden ja viestintätaidot nimeämättä kumpaakaan. Lukija uskoo tekemisiäsi enemmän kuin sitä, millaiseksi kuvaat itseäsi.",
      ],
    },
    {
      heading: "Taitotasot ja arviot: pidä ne rehellisinä",
      paragraphs: [
        "Tähdet, palkit ja prosentit näyttävät siisteiltä mutta kertovat vähän: tarkoittaako \"4/5\" Excelissä pivot-taulukoita vai makroja? Jos kerrot tason, tee siitä tarkistettava: käyttövuodet, sillä tehdyn työn laajuus tai sertifikaatti. Osa pohjista näyttää taitotasot pisteinä; jos käytät sellaista, arvioi itsesi niin kuin perustelisit sen haastattelussa.",
        "Kielitaidossa käytä eurooppalaista taitotasoasteikkoa (A1–C2) tai selkeitä sanoja, kuten äidinkieli, sujuva, ammatillinen tai perustaso.",
      ],
    },
    {
      heading: 'Kuinka monta taitoa — ei liikaa, ei liian vähän',
      paragraphs: [
        'Alle neljä taitoa lukee ohuelta; PortifyCV:n sisäänrakennettu tarkistus merkitsee taito-osion, jossa on alle neljä kohtaa. Toisessa päässä: 30 taidon tyhjentävä lista ei erotu joukosta — rekrytoija ei tiedä mitkä niistä ovat oikeasti vahvuuksiasi. 8–15 tarkkaan valittua taitoa, jotka pystyt perustelemaan haastattelussa, on useimmiten oikea väli.',
      ],
    },
    {
      heading: "Missä muualla taidot näkyvät",
      paragraphs: [
        "Taitolista on silmäilyä varten; muu CV on näyttö. Mainitse kaksi tai kolme tärkeintä taitoasi myös yhteenvedossa ja varmista, että jokainen keskeinen taito näkyy ainakin yhdessä kokemuskohdassa tuloksen kanssa. Joissain pohjissa on lisäksi Vahvuudet-osio laajemmille kyvyille, kuten \"budjettivastuu\" tai \"tiimin rakentaminen\", jotka eivät sovi työkalulistaan.",
      ],
    },
    {
      heading: "Pidä lista ajan tasalla",
      list: [
        "Poista työkalut, joita kukaan ei enää rekrytoi, ja versionumerot, ellei ilmoitus pyydä niitä.",
        "Jätä pois perustaidot, jotka jokaisella hakijalla oletetaan olevan, kuten sähköposti tai verkkoselain.",
        "Laita ensin taidot, joita tämä työ tarvitsee; listan ei tarvitse olla aakkosjärjestyksessä.",
      ],
    },
    {
      heading: 'Kohdista taidot työpaikkailmoitukseen',
      paragraphs: [
        'Sama taito voidaan kirjoittaa monella tavalla ("UX-tutkimus" vs. "Käyttäjätutkimus") — jos ilmoitus käyttää tiettyä termiä ja sinulla on kyseinen osaaminen, käytä samaa sanamuotoa.',
      ],
      linkParagraph: {
        before: 'PortifyCV:n ',
        linkText: 'ATS-paneeli',
        linkTo: ROUTES.atsGuide,
        after: ' listaa liittämästäsi työpaikkailmoituksesta tunnistamansa taidot ja vaatimukset sekä sen, mitkä niistä puuttuvat CV:stäsi.',
      },
    },
    {
      heading: "Vaihdatko alaa? Aloita siirrettävistä taidoista",
      paragraphs: [
        "Etsi taidot, jotka vanha ja uusi työ jakavat, ja nimeä ne uuden alan sanoilla: koulutussuunnitteluun siirtyvällä opettajalla on \"opetussuunnitelmatyö\" ja \"oppimisen arviointi\", operatiiviseen työhön siirtyvällä myymäläpäälliköllä \"varastosuunnittelu\" ja \"työvuorosuunnittelu\". Tue jokaista kohdalla aiemmista tehtävistäsi.",
      ],
    },
    {
      heading: 'Virheet, jotka kannattaa välttää',
      list: [
        'Ohuet yleistermit ilman todistetta ("Microsoft Office", "tiimipelaaja", "ahkera")',
        'Taitojen listaaminen, joita et pystyisi perustelemaan haastattelussa',
        'Yksi erottelematon tekstimössö erillisten, selattavien kohtien sijaan',
        'Kielitaidon sekoittaminen taitolistaan oman osion sijaan',
      ],
    },
  ],
  ctaLabel: 'Lisää taitosi nyt',
  ctaNote: 'Ei kirjautumista. Automaattinen ryhmittely useissa pohjissa.',
  seeAlso: [
    { to: ROUTES.howToWrite, view: 'howToWrite', text: 'Näin kirjoitat CV:n' },
    { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
    { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Ilmaiset CV-pohjat' },
    { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
  ],
}
