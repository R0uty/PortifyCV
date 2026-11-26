// The How to write a CV guide in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Opas',
  title: 'Näin kirjoitat CV:n',
  intro:
    'CV:llä on yksi tehtävä: saada sinut haastatteluun. Tämä on käytännön opas siihen, mitä ottaa mukaan, mitä jättää pois ja miten sen muotoilee, ja mukana on ennen–jälkeen-esimerkkejä, joiden mallia voit seurata.',
  sections: [
    {
      heading: 'Aloita osioista, joilla on oikeasti merkitystä',
      paragraphs: [
        'Useimmissa CV:issä tarvitaan tässä järjestyksessä: yhteystiedot, lyhyt yhteenveto, työkokemus, koulutus ja taidot. Lisää sertifikaatit, projektit, kielet tai linkit vain, jos ne kertovat jotain, mihin rekrytoija tarttuisi. "Harrastukset"-osio, jossa lukee "lukeminen, retkeily", vie tilaa, jonka rekrytoija käyttäisi mieluummin viimeisimpään työhösi.',
        'Järjestys voi vaihdella urasi vaiheen mukaan. Vastavalmistunut, jolla on vähän työkokemusta, aloittaa koulutuksesta ja projekteista; kymmenen vuoden kokemuksella koulutus mahtuu rivin tai kahden mittaisena loppuun. PortifyCV:ssä voit piilottaa minkä tahansa osion CV-kohtaisesti ja siirtää osioita ylös tai alas, ja esikatselu päivittyy heti, joten näet, paljonko tilaa kukin vie.',
      ],
    },
    {
      heading: 'Yhteystiedot: mitä ottaa mukaan ja mitä jättää pois',
      list: [
        'Ota mukaan koko nimesi, asiallinen sähköpostiosoite, puhelinnumero ja kotikaupunkisi (koko katuosoitetta ei tarvita).',
        'Lisää LinkedIn-profiili, portfolio tai GitHub-linkki, jos se näyttää työhön liittyvää osaamista, ja varmista, että se on ajan tasalla.',
        'Jätä pois syntymäaika, henkilötunnus, siviilisääty ja kansalaisuus. Ne eivät ole pätevyyksiä, eikä työnantaja saa monessa maassa edes kysyä niitä.',
        'Kuva on vapaaehtoinen ja riippuu maasta ja alasta: Suomessa ja muualla Euroopassa se on melko tavallinen, Yhdysvalloissa ja Britanniassa harvinainen. Jos lisäät kuvan, käytä selkeää ja tuoretta kasvokuvaa.',
      ],
    },
    {
      heading: 'Kirjoita yhteenveto, joka sanoo jotain konkreettista',
      paragraphs: [
        'Kaksi tai kolme lausetta: kuka olet ammatillisesti, vahvin näyttösi ja mitä haet seuraavaksi. Sen pitäisi kuulostaa hyvän hakemuskirjeen ensimmäiseltä lauseelta, ei ammattinimikkeeltä, johon on lisätty adjektiiveja.',
      ],
      examplePair: {
        weakLabel: 'Heikko',
        weak: '"Ahkera ammattilainen, jolla on erinomaiset vuorovaikutustaidot ja joka etsii haastavaa tehtävää."',
        strongLabel: 'Vahvempi',
        strong: '"Taustajärjestelmäkehittäjä, joka on vienyt tuotantoon kolme maksujärjestelmää ja lyhentänyt rajapintojen vasteaikaa 40 % kahdessa kasvuyrityksessä."',
      },
      paragraphsAfter: [
        'Ero: jälkimmäisen voi tarkistaa. Se kertoo, mitä teit ja suunnilleen kuinka hyvin. Jos lause sopisi sellaisenaan tuhansiin muihin hakijoihin, kirjoita se uudelleen.',
        'Vaihdatko alaa? Aloita siirrettävästä näytöstä, älä vanhasta ammattinimikkeestä: "Entinen opettaja, joka rakensi ja ylläpiti 200 opiskelijan verkkokurssialustaa ja siirtyy nyt oppimismuotoiluun."',
      ],
      linkParagraphs: [
        {
          before: 'Sama "konkreettinen, ei yleinen" -sääntö pätee hakemuskirjeeseen. Katso ',
          linkText: 'hakemuskirje-esimerkit',
          linkTo: ROUTES.coverLetterExamples,
          view: 'coverLetterExamples',
          after: ' heikoista ja vahvoista aloituksista ja lopetuksista.',
        },
      ],
    },
    {
      heading: 'Kirjoita kokemuskohdat, jotka näyttävät tuloksia, ei tehtäviä',
      paragraphs: [
        'Listaa työpaikat uusimmasta alkaen: tehtävänimike, työnantaja, paikkakunta ja ajankohta. Anna viimeisimmille tehtäville kolmesta viiteen kohtaa ja vanhemmille yksi tai kaksi. Kaksi virhettä toistuu jatkuvasti:',
      ],
      list: [
        'Vastuualueiden kuvaaminen tulosten sijaan ("Vastuualueena asiakastukijonon hallinta"). Se kertoo lukijalle vain, mitä sinulle annettiin tehtäväksi, ei sitä, mitä tapahtui, koska teit sen.',
        'Jokaisen kohdan aloittaminen täytesanoilla toimintaverbin sijaan: "Olin vastuussa perehdytyksestä" sen sijaan, että "Perehdytin 40 uutta työntekijää".',
      ],
      paragraphsAfter: [
        'Kirjoita jokainen kohta muodossa: [vahva verbi] + [mitä teit] + [mitattava tulos]. "Lyhensin perehdytyksen kolmesta viikosta viiteen päivään uudistamalla koulutuksen tarkistuslistan" kertoo rekrytoijalle kolmessa sekunnissa, mitä sinulta voi odottaa. PortifyCV:n ehdotukset tarkistavat juuri tämän: ne merkitsevät passiiviset ilmaukset kuten "vastuualueena", kohdat, jotka eivät ala vahvalla verbillä, ja kohdat, joista puuttuu luku, suoraan muokattavan kentän viereen.',
      ],
    },
    {
      heading: 'Lisää ennen–jälkeen-esimerkkejä eri aloilta',
      paragraphs: [
        'Sama malli toimii kaukana teknologian ulkopuolellakin. Jos tarkkaa lukua ei ole, rehellinen arvio ("noin 30", "noin kolmannes") on silti parempi kuin ei mitään.',
      ],
      list: [
        'Myynti. Heikko: "Hoidin avainasiakkaita." Vahva: "Kasvatin 12 avainasiakkaan myyntiä 18 % vuodessa siirtämällä ne neljännesvuosittaisiin liiketoimintakatsauksiin."',
        'Hoitotyö. Heikko: "Hoidin potilaita kiireisellä osastolla." Vahva: "Hoidin vuorossa enintään 8 potilasta 30-paikkaisella kirurgisella osastolla ja perehdytin 5 uutta hoitajaa lääkejärjestelmään."',
        'Asiakaspalvelu. Heikko: "Vastasin asiakkaiden sähköposteihin." Vahva: "Vastasin noin 60 asiakkaan sähköpostiin päivässä ja lyhensin ensimmäisen vastauksen keskiaikaa 9 tunnista 2 tuntiin."',
        'Opetus. Heikko: "Opetin matematiikkaa yläkoululaisille." Vahva: "Opetin matematiikkaa 120 oppilaalle vuodessa; luokkien läpäisyprosentti valtakunnallisessa kokeessa nousi kahdessa vuodessa 71 %:sta 84 %:iin."',
      ],
    },
    {
      heading: 'Koulutus, sertifikaatit ja projektit',
      paragraphs: [
        'Kerro jokaisesta tutkinnosta nimi, oppilaitos ja vuodet; lisää opinnäytetyö tai arvosana vain, jos siitä on hyötyä juuri tähän työhön. Sertifikaateista kerrotaan myöntäjä ja vuosi sekä vanhenemispäivä, jos ne vanhenevat (PortifyCV:n Sertifikaatit-osiossa on sille oma kenttä), koska rekrytoija tarkistaa, ovatko ne yhä voimassa.',
        'Projektit ansaitsevat paikkansa, kun ne näyttävät taitoja, joita työhistoriasi ei näytä: nimi, yksi rivi siitä, mitä se tekee, oma osuutesi ja linkki. Vastavalmistuneilla ja alanvaihtajilla ne painavat usein enemmän kuin ensimmäiset työpaikat.',
      ],
    },
    {
      heading: 'Valitse taidot, joita rekrytoija etsisi, ei kaikkea, mihin olet koskenut',
      paragraphs: [
        'Listaa taidot, jotka pystyt perustelemaan haastattelussa, ja ryhmittele ne niin, että lukija, ihminen tai ohjelmisto, löytää ilmoitukseen sopivat muutamassa sekunnissa.',
      ],
      linkParagraphs: [
        {
          before: 'Katso ',
          linkText: 'CV:n taito-osion esimerkit',
          linkTo: ROUTES.cvSkills,
          view: 'cvSkills',
          after: ' siitä, miten ne ryhmitellään ja muotoillaan ja kuinka monta on sopiva määrä.',
        },
      ],
    },
    {
      heading: 'Räätälöi CV jokaiseen työpaikkaan',
      paragraphs: [
        'Saman CV:n lähettäminen joka paikkaan on yleisin syy siihen, että hyvä CV ei tuota vastauksia. Räätälöinti ei tarkoita uudelleenkirjoittamista joka kerta; siihen menee noin vartti:',
      ],
      list: [
        'Lue ilmoitus ja merkitse kolme tai neljä asiaa, joita se painottaa eniten.',
        'Käytä ilmoituksen omia sanoja silloin, kun ne pitävät paikkansa: jos siinä lukee "sidosryhmäyhteistyö", älä kirjoita pelkästään "tein yhteistyötä kumppaneiden kanssa".',
        'Siirrä kunkin tehtävän kohdista ne, jotka todistavat nämä asiat, ylimmiksi.',
        'Muokkaa yhteenvedon viimeinen lause tähän työhön sopivaksi.',
      ],
      linkParagraphs: [
        {
          before: 'Liitä PortifyCV:n Klassinen-tilassa työpaikkailmoitus ',
          linkText: 'ATS-pisteet-paneeliin',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ', niin näet, mitä sen keskeisistä termeistä CV:si ei vielä mainitse.',
        },
      ],
    },
    {
      heading: 'Pituus ja muotoilu',
      list: [
        'Yksi sivu uran alussa; kaksi sivua, kun alaan liittyviä tehtäviä on useita. Yli kahdesta sivusta on harvoin hyötyä.',
        'Yksi päivämäärämuoto koko CV:ssä (esimerkiksi "1/2022–3/2024") ja yksi tyyli otsikoille.',
        'Selkeä fontti 10–12 pisteen koossa ja niin paljon tyhjää tilaa, että osiot erottuvat toisistaan.',
        'Lähetä se tiedostomuoto, jota ilmoitus pyytää. Jos CV:n lukee hakijaseurantajärjestelmä, yksipalstaisesta pohjasta viety Word-tiedosto pitää tekstin koneluettavana; alla oleva ATS-opas kertoo miksi.',
      ],
    },
    {
      heading: 'Virheet, jotka kannattaa korjata ennen lähettämistä',
      list: [
        'Yleinen tavoitelause ("Etsin tehtävää, jossa voin kehittyä ammatillisesti"), joka ei kerro mitään tästä työstä',
        'Epäjohdonmukaiset tai puuttuvat päivämäärät. Rekrytoijat lukevat aukot varoitusmerkeiksi riippumatta siitä, onko niihin hyvä syy, joten kerro pidemmistä lyhyesti syy',
        'Tekstimassa ilman luettelokohtia. Kukaan ei lue pitkiä kappaleita muutaman sekunnin ensisilmäyksellä',
        'Ei yhtään lukua. Jos voit arvioida vaikutuksen, tee se',
        'Lyhenteet, joita käytti vain entinen työnantajasi. Kirjoita ne kerran auki',
        'Kirjoitusvirheet ja väärä yrityksen nimi. Lue CV kerran ääneen tai pyydä jotakuta muuta lukemaan se',
      ],
    },
    {
      heading: 'Muotoile ensin lukijalle, joka näkee CV:n ensimmäisenä: usein ohjelmistolle',
      paragraphs: [
        'Monet yritykset ohjaavat hakemukset hakijaseurantajärjestelmän kautta ennen kuin ihminen avaa ne. Monipalstainen asettelu, osio-otsikoiden tilalla olevat kuvakkeet tai tekstilaatikoiden ja taulukoiden sisällä oleva teksti voivat sekoittua tai kadota ohjelmistossa, vaikka ne näyttäisivät sinusta hyviltä.',
      ],
      linkParagraphs: [
        {
          before: 'Lue ',
          linkText: 'ATS-ystävällinen CV-opas',
          linkTo: ROUTES.atsGuide,
          view: 'atsGuide',
          after: ': mikä rikkoo jäsentämisen, mikä vientimuoto valita ja miten tarkistat oman CV:si.',
        },
      ],
    },
    {
      heading: 'Valitse sitten asettelu ihmislukijalle',
      paragraphs: [
        'Kun sisältö on kunnossa, pohja on vain kehys sen ympärillä. Pohjan vaihtaminen PortifyCV:ssä ei koske tekstiisi, joten voit kokeilla useaa, ja jokaisessa on kolme tyyliä.',
      ],
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
    {
      heading: 'Viimeinen tarkistus ennen lähettämistä',
      list: [
        'Nimi, sähköposti ja puhelinnumero ovat oikein ja vastaavat LinkedIn-profiiliasi.',
        'Yhteenveto mainitsee tämän työn alan ja vahvimman näyttösi.',
        'Jokaisessa viimeaikaisessa tehtävässä on ainakin yksi kohta, jossa on luku.',
        'Taidoissa on ilmoituksen keskeiset termit, jotka pitävät paikkansa.',
        'Päivämäärät ovat johdonmukaisia, eikä selittämättömiä aukkoja ole.',
        'Tiedostonimi on hyödyllinen, kuten "Etunimi-Sukunimi-CV.pdf", ei "cv_final_v3.pdf".',
      ],
    },
  ],
  ctaLabel: 'Aloita CV:si rakentaminen',
  ctaNote: 'Ei kirjautumista. Mitään ei tallenneta, ellet itse tallenna.',
}
