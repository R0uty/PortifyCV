// The privacy policy in Finnish.
export default {
  kicker: 'Lakiasiat',
  title: 'Tietosuojaseloste',
  effectiveDateLabel: 'Voimassa alkaen',
  effectiveDate: '17. marraskuuta 2026',
  intro:
    'PortifyCV on ilmainen, selaimessa toimiva CV-rakentaja. Sillä ei ole '
    + 'käyttäjätilejä eikä palvelinpuolen tietokantaa — tämä seloste kertoo '
    + 'tarkalleen, mitä tämä tarkoittaa tietojesi kannalta, ja mitä '
    + 'mainosevästeitä sivuston mainokset käyttävät.',
  sections: [
    {
      heading: 'CV-sisältösi',
      paragraphs: [
        'Kaikki mitä kirjoitat PortifyCV:hen — nimesi, työhistoriasi, '
        + 'koulutuksesi ja jokainen muu kenttä — pysyy selaimesi muistissa '
        + 'istuntosi ajan, ellet itse tallenna sitä tälle laitteelle (katso '
        + '"Tälle laitteelle tallennetut CV:t" alla). Sitä ei koskaan lähetetä palvelimelle, koska '
        + 'PortifyCV:llä ei ole sellaista, johon sen voisi lähettää. Se '
        + 'poistuu laitteeltasi vain, jos valitset itse tiedoston viennin '
        + '(PDF, Word, HTML tai JSON) tai luot jakolinkin, ja silloinkin se '
        + 'päätyy suoraan omaan latauskansioosi tai jakamaasi '
        + 'URL-osoitteeseen — ei PortifyCV:lle.',
        {
          parts: [
            'Jakolinkit koodaavat CV:si itse linkin sisään (',
            { code: '#' },
            '-merkin jälkeiseen osaan), jota selaimet eivät koskaan '
            + 'lähetä palvelimelle normaalin sivunlatauksen yhteydessä. '
            + 'Kuka tahansa, jolle lähetät linkin, voi purkaa sen omassa '
            + 'selaimessaan samalla tavalla kuin sinun selaimesi sen loi. '
            + 'Linkki avaa CV:n katselusivun, jolta vastaanottaja voi '
            + 'ladata PDF:n tai avata kopion muokattavaksi omassa '
            + 'selaimessaan. Linkki kuljettaa CV:n tietojen lisäksi '
            + 'valitsemasi fontin ja värit, ATS-tilan sekä PDF:n '
            + 'paperikoon ja sovituksen; kuvat ja hakemuskirje eivät '
            + 'koskaan kulje mukana.',
          ],
        },
      ],
    },
    {
      heading: 'Mitä PortifyCV tallentaa paikallisesti',
      paragraphs: [
        'PortifyCV tallentaa selaimesi paikalliseen tallennustilaan '
        + '(local storage) viisi pientä asetusta, jotta ne säilyvät '
        + 'käyntikertojen välillä:',
      ],
      list: [
        'minkä käyttöliittymän kielen valitsit viimeksi (englanti vai suomi)',
        'oletko jo nähnyt kertaluonteisen opastusvinkin',
        'onko "Palauta viimeisin istunto" -toiminto käytössä (katso alla)',
        'kumpaa muokkaustilaa (Suora muokkaus vai Klassinen) käytit viimeksi',
        'onko editorin osiovalikko pienennetty',
      ],
      paragraphsAfterList: [
        'Mikään näistä ei sisällä mitään osaa CV:stäsi. Kaikki viisi voi '
        + 'tyhjentää milloin tahansa poistamalla selaimesi sivustokohtaiset '
        + 'tiedot tälle verkkotunnukselle. Mainosevästeiden suostumusvalinta '
        + 'tallennetaan erikseen Googlen suostumustyökalun toimesta (katso '
        + '"Evästeet ja mainonta" alla).',
      ],
    },
    {
      heading: 'Palauta viimeisin istunto',
      paragraphs: [
        'Asetukset-valikossa on oletuksena päällä oleva toiminto: '
        + '"Palauta viimeisin istunto". Kun se on päällä, muokkaamastasi '
        + 'CV:stä pidetään työkopiota selaimesi istuntokohtaisessa '
        + 'tallennustilassa (session storage) — ei paikallisessa '
        + 'tallennustilassa — jotta vahinkopäivitys tai välilehden '
        + 'kaatuminen ei tuhoa työtäsi. Kopio pysyy omassa selaimessasi, '
        + 'eikä sitä lähetetä minnekään. Voit kytkeä toiminnon pois '
        + 'Asetuksista.',
        'Istuntotallennustila eroaa yllä mainitusta paikallisesta '
        + 'tallennustilasta siten, että selain tyhjentää sen pysyvästi '
        + 'heti, kun suljet välilehden — se ei säily edes saman '
        + 'selaimen seuraavaan istuntoon, saati lähetä mitään '
        + 'minnekään. Toiminnon kytkeminen takaisin pois päältä '
        + 'tyhjentää tallennetun kopion välittömästi.',
      ],
    },
    {
      heading: 'Tälle laitteelle tallennetut CV:t',
      paragraphs: [
        'Mitään ei tallenneta, ellet itse tallenna. Kun painat '
        + 'rakentajan Tallenna-painiketta ja annat CV:lle nimen, CV '
        + 'tallennetaan selaimesi IndexedDB-tallennustilaan tällä '
        + 'laitteella, ja sen jälkeiset muutokset tallentuvat siihen '
        + 'itsestään. Se ei lähde laitteeltasi, eikä PortifyCV näe sitä.',
        'Tallennetut CV:t säilyvät käyntikertojen välillä, kunnes poistat '
        + 'ne: yksitellen kohdasta Omat CV:t, kaikki kerralla Asetuksista '
        + 'tai tyhjentämällä selaimesi sivustokohtaiset tiedot tälle '
        + 'verkkotunnukselle. Ne eivät siirry toiseen selaimeen tai '
        + 'laitteeseen; vie JSON-tiedosto, jos haluat kopion muualle.',
        'Kun merkitset CV:n haetuksi (Merkitse haetuksi), haku '
        + 'tallennetaan omaan IndexedDB-tietokantaansa tähän selaimeen: '
        + 'yritys, tehtävä, hakupäivä, linkki työpaikkailmoitukseen, tila '
        + 'ja muistiinpanosi, lähetetyn CV:n PDF (ja hakemuskirjeen PDF, jos '
        + 'kirjeessä on tekstiä) kuvineen sekä CV:n tiedot, pohja ja '
        + 'ulkoasu, joista PDF tehtiin. Mitään näistä ei lähetetä '
        + 'minnekään. Haut säilyvät, kunnes poistat ne: yksitellen '
        + 'kohdasta Omat CV:t › Haut, kaikki kerralla Asetuksista tai '
        + 'tyhjentämällä selaimesi sivustokohtaiset tiedot. Tallennettujen '
        + 'CV:iden poistaminen ei poista hakuja, eikä hakujen poistaminen '
        + 'poista CV:itä.',
      ],
    },
    {
      heading: 'Evästeet ja mainonta (Google AdSense)',
      paragraphs: [
        'PortifyCV näyttää mainoksia Google AdSensen kautta rahoittaakseen '
        + 'sivuston ylläpidon. Mainosten näyttämiseen liittyy evästeitä, '
        + 'jotka Google ja sen kumppanit asettavat selaimeesi.',
        {
          parts: [
            'Google käyttää kolmantena '
            + 'osapuolena evästeitä näyttääkseen mainoksia aiempien '
            + 'käyntiesi perusteella tällä ja muilla verkkosivustoilla. '
            + 'Googlen mainosevästeiden käyttö mahdollistaa sen ja sen '
            + 'kumppaneiden näyttää mainoksia käyntisi perusteella tällä '
            + 'sivustolla ja/tai muilla internetin sivustoilla. Voit '
            + 'kieltäytyä kohdennetusta mainonnasta vierailemalla ',
            { link: 'https://adssettings.google.com', text: 'Google-mainosasetuksissa' },
            ', tai kieltäytyä kolmannen osapuolen evästeiden käytöstä '
            + 'kohdennettuun mainontaan osoitteessa ',
            { link: 'https://www.aboutads.info', text: 'www.aboutads.info' },
            '. Lisätietoja siitä, miten Google käyttää tietoja sivustoilta, '
            + 'jotka käyttävät sen palveluita, on saatavilla osoitteessa ',
            {
              link: 'https://policies.google.com/technologies/partner-sites',
              text: 'policies.google.com/technologies/partner-sites',
            },
            '.',
          ],
        },
        'ETA-alueella, Yhdistyneessä kuningaskunnassa ja Sveitsissä '
        + 'näytetään Googlen sertifioima suostumusilmoitus, jossa voit '
        + 'antaa tai evätä suostumuksen mainosevästeille ennen kuin niitä '
        + 'asetetaan.',
        'Mainosevästeet liittyvät ainoastaan mainosten toimittamiseen ja '
        + 'mittaamiseen. Niillä ei ole yhteyttä yllä kuvattuun '
        + 'CV-sisältöön, eivätkä ne pääse siihen käsiksi.',
      ],
    },
    {
      heading: 'Analytiikka (Cloudflare)',
      paragraphs: [
        'PortifyCV käyttää Cloudflare Web Analytics -palvelua nähdäkseen '
        + 'sivuston kokonaiskävijämäärän: kuinka moni vierailee, mitkä '
        + 'sivut ovat suosittuja ja kuinka nopeasti sivut latautuvat. '
        + 'Cloudflare on sama yhtiö, joka toimittaa tämän sivuston. '
        + 'Palvelu ei käytä evästeitä, paikallista tallennustilaa eikä '
        + 'mitään muutakaan selainpuolen seurantatunnistetta, eikä se '
        + 'seuraa sinua muilla verkkosivustoilla.',
        'Kerätty data on koottua ja anonymisoitua — esimerkiksi '
        + 'vierailtu sivu, viittaava sivusto, karkea maa sekä laite- tai '
        + 'selaintyyppi. Sillä ei ole pääsyä mihinkään, mitä kirjoitat '
        + 'CV-rakentajaan: se pysyy omassa selaimessasi täsmälleen yllä '
        + 'kuvatulla tavalla, eikä Cloudflare näe sitä koskaan.',
      ],
    },
    {
      heading: 'Lasten tietosuoja',
      paragraphs: [
        'PortifyCV ei ole suunnattu alle 13-vuotiaille lapsille, eikä se '
        + 'tietoisesti kerää heiltä henkilötietoja.',
      ],
    },
    {
      heading: 'Omat valintasi',
      paragraphs: [
        'Koska mitään CV:stäsi ei koskaan tallenneta oman selaimesi '
        + 'ulkopuolelle, meidän puoleltamme ei ole mitään pyydettävää, '
        + 'korjattavaa tai poistettavaa. Voit poistaa tallentamasi CV:t ja '
        + 'tyhjentää yllä mainitut paikalliset asetukset tai kieltäytyä kohdennetuista '
        + 'mainoksista milloin tahansa tämän selosteen linkkien avulla.',
      ],
    },
    {
      heading: 'Muutokset tähän selosteeseen',
      paragraphs: [
        'Jos tämä seloste muuttuu, sivun yläreunassa oleva '
        + 'voimaantulopäivä päivitetään vastaavasti.',
      ],
    },
    {
      heading: 'Yhteystiedot',
      paragraphs: [
        {
          parts: [
            'Kysymykset tästä selosteesta voi lähettää osoitteeseen ',
            { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
            '.',
          ],
        },
      ],
    },
  ],
}
