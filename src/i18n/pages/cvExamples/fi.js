// The CV examples hub in Finnish.
import { ROUTES } from '../../../utils/routes.js'

export default {
  kicker: 'Esimerkkejä',
  title: 'CV-esimerkkejä alan mukaan',
  intro:
    'Sama rakenne — vahva yhteenveto, tuloskeskeiset kokemuskohdat, oikeat taidot — toimii joka alalla, mutta yksityiskohdat vaihtelevat. Valitse omasi alta.',
  cards: [
    {
      view: 'developerCv',
      path: ROUTES.developerCv,
      title: 'Kehittäjän CV-esimerkkejä',
      body: 'Projektikohtien rakenne, tekninen taitolista ja miksi Kehittäjä-pohja on rakennettu juuri tälle.',
    },
    {
      view: 'itCv',
      path: ROUTES.itCv,
      title: 'IT-alan CV-esimerkkejä',
      body: 'Sertifikaatit, järjestelmät ja taidot, jotka erottuvat yleisistä "tietokonetaidoista".',
    },
    {
      view: 'cybersecurityCv',
      path: ROUTES.cybersecurityCv,
      title: 'Tietoturva-alan CV-esimerkkejä',
      body: 'SIEM-työkalut, sertifikaatit ja Hack The Box / TryHackMe -profiilit omalla paikallaan.',
    },
    {
      view: 'finnishCv',
      path: ROUTES.finnishCv,
      title: 'Suomalaisen CV:n esimerkkejä',
      body: 'Mitä jätetään pois, kielitaidon merkitys, ja kaksikielinen esimerkki samasta sisällöstä.',
    },
  ],
  sharedTitle: 'Mitä jokaisessa vahvassa CV:ssä on',
  sharedIntro: 'Alasta riippumatta CV yleensä silmäillään ennen kuin se luetaan, ja samat neljä asiaa kantavat sen ensimmäisen silmäyksen yli.',
  shared: [
    'Yhteenveto, joka kertoo roolisi, kokemusvuotesi ja sen, missä olet parhaimmillasi, kahdessa tai kolmessa lauseessa.',
    'Kokemuskohdat, jotka alkavat verbillä, kertovat mitä teit ja päättyvät tulokseen: lukuun, säästettyyn aikaan tai ongelmaan, joka loppui.',
    'Taidot, jotka vastaavat työpaikkailmoituksen omia sanoja, jotta sekä hakijaseurantajärjestelmä että ihminen löytävät ne.',
    'Yksi tai kaksi sivua. Vanhemmat tai vähemmän olennaiset tehtävät tiivistyvät yhdelle riville, jotta tuoreimmat mahtuvat ensimmäiselle sivulle.',
  ],
  fieldsTitle: 'Mikä muuttuu alalta toiselle',
  fieldsIntro: 'Rakenne pysyy samana, mutta se, mikä lasketaan näytöksi, vaihtelee. Tässä kunkin alan lukijoiden ensimmäiseksi etsimät asiat ja niihin sopivat pohjat.',
  templatesLabel: 'Sopivat pohjat:',
  fields: {
    software: ['Ohjelmistokehitys', 'Projektit painavat yhtä paljon kuin tehtävänimikkeet. Mainitse teknologiat jokaisessa kohdassa, linkitä koodiin tai demoon kun voit, ja mittaa tuloksia käyttäjinä, nopeutena tai luotettavuutena, ei koodiriveinä.'],
    it: ['IT-tuki ja järjestelmät', 'Kerro ympäristön koko (käyttäjät, laitteet, toimipisteet), ylläpitämäsi järjestelmät ja tiketit, jotka sait loppumaan. Sertifikaatit kuuluvat omaan osioonsa vuosilukuineen.'],
    security: ['Tietoturva', 'Nimeä työkalut (SIEM, EDR, haavoittuvuusskannerit), käsittelemäsi poikkeamat tai löydökset ja käytännön näyttö, kuten harjoitusympäristöjen sijoitukset tai julkaistut kirjoitukset. Ympäripyöreä "tietoturvaosaaminen" ei kerro mitään.'],
    healthcare: ['Terveydenhuolto', 'Aloita ammattioikeudesta tai laillistuksesta sekä osastoista ja erikoisaloista, joilla olet työskennellyt. Potilasmäärät, vuorot ja kehittämäsi käytännöt ovat mitattava osa.'],
    education: ['Opetus', 'Ensin aineet, ikäryhmät ja asteet, sitten tulokset: koetulokset, rakentamasi ohjelmat, ohjaamasi oppilaat. Koulun nimi merkitsee vähemmän kuin se, mikä luokassasi muuttui.'],
    sales: ['Myynti, markkinointi ja asiakkuudet', 'Luvuilla on tässä enemmän painoa kuin useimmilla aloilla. Liikevaihto, myyntiputki, tavoitteet, konversio, asiakaspysyvyys ja kampanjoiden tulokset kuuluvat lähes jokaiseen kohtaan, aikajänteen kera.'],
    creative: ['Suunnittelu ja luova työ', 'CV ohjaa portfolioon, se ei korvaa sitä. Laita linkki lähelle alkua, kerro, minkä ongelman kukin projekti ratkaisi, ja anna asettelun näyttää makua peittämättä tekstiä.'],
    finance: ['Talous ja johtaminen', 'Vastuun laajuus on pääasia: budjetin koko, tiimin koko, yhtiöiden tai markkinoiden määrä. Lukija odottaa hillittyä asettelua ja tarkkoja lukuja.'],
    graduates: ['Vastavalmistuneet ja uran alkuvaihe', 'Koulutus tulee ensin, ja projektit, harjoittelut, osa-aikatyöt ja kurssit hoitavat työkokemuksen tehtävää. Yksi vahva projekti tuloksineen voittaa pitkän kurssilistan.'],
  },
  useTitle: 'Näin käytät esimerkkejä',
  use: [
    'Esimerkki-CV:t on kirjoitettu kuvitteellisille henkilöille, mutta jokainen kohta noudattaa yllä olevaa kaavaa, joten ne ovat malli rakenteelle ja sävylle, eivät kopioitavaa tekstiä: kopioitu sanamuoto kuvaa jonkun toisen työtä, ei sinun.',
    'Käytännössä: avaa esimerkki editoriin, pidä osioiden järjestys ja kohtien muoto, ja vaihda jokainen väite ja luku omaksesi. Jos kohdalle ei löydy vastinetta omasta työstäsi, poista se äläkä keksi tilalle.',
    'Tarkista lopuksi luonnoksesi oikeaa työpaikkailmoitusta vasten. Klassinen-tilan ATS-pisteet ja ehdotukset -paneeli vertaa CV:täsi liitettyyn ilmoitukseen ja listaa avainsanat, jotka siitä vielä puuttuvat.',
  ],
  fullExamplesTitle: 'Kokonaisia CV-esimerkkejä',
  fullExamplesIntro: 'Valmiita esimerkki-CV:itä eri aloilta, kukin omassa pohjassaan. "Käytä tätä esimerkkiä" lataa esimerkin editoriin muokattavaksi, ja jokaisen pohjan sivulla on lisää esimerkkejä.',
  linksLabel: 'Katso myös:',
  howToWriteLink: 'Näin kirjoitat CV:n',
  templatesLink: 'Ilmaiset CV-pohjat',
  ctaLabel: 'Aloita CV:si rakentaminen',
  ctaNote: 'Ei kirjautumista. Mitään ei tallenneta, ellet itse tallenna.',
}
