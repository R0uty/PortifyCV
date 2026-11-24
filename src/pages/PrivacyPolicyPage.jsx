const EFFECTIVE_DATE = {
  en: '17 November 2026',
  fi: '17. marraskuuta 2026',
}

function getPrivacyCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Lakiasiat',
      title: 'Tietosuojaseloste',
      effectiveDateLabel: 'Voimassa alkaen',
      effectiveDate: EFFECTIVE_DATE.fi,
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
  }

  return {
    kicker: 'Legal',
    title: 'Privacy Policy',
    effectiveDateLabel: 'Effective date',
    effectiveDate: EFFECTIVE_DATE.en,
    intro:
      'PortifyCV is a free, browser-based CV builder. It has no user '
      + 'accounts and no server-side database — this policy explains '
      + 'exactly what that means for your data, and which advertising '
      + "cookies the site's ads use.",
    sections: [
      {
        heading: 'Your CV content',
        paragraphs: [
          "Everything you type into PortifyCV — your name, work history, "
          + "education, and every other field — stays in your browser's "
          + 'memory for the duration of your session, unless you choose to save '
          + 'it on this device (see "CVs saved on this device" below). It is '
          + 'never uploaded to '
          + 'a server, because PortifyCV does not have one to upload it to. It '
          + 'leaves your device only if you explicitly choose to export a file '
          + '(PDF, Word, HTML, or JSON) or generate a share link, and even then it '
          + 'goes directly to your own downloads folder or into the URL you '
          + 'choose to share — not to PortifyCV.',
          {
            parts: [
              'Share links encode your CV inside the link itself (the part '
              + 'after ',
              { code: '#' },
              '), which browsers never send to a server as part of a normal '
              + 'page load. Anyone you send that link to can decode it in '
              + 'their own browser the same way yours created it. The link '
              + 'opens a view-only page where the recipient can download a '
              + 'PDF or open a copy to edit in their own browser. Besides '
              + 'your CV data it carries your chosen font and colours, ATS '
              + 'mode, and the PDF paper size and fit; photos and the cover '
              + 'letter never travel in it.',
            ],
          },
        ],
      },
      {
        heading: 'What PortifyCV stores locally',
        paragraphs: [
          "PortifyCV stores five small preferences in your browser's local "
          + 'storage, so they persist between visits:',
        ],
        list: [
          'which interface language you last selected (English or Finnish)',
          'whether you have already seen the one-time onboarding tip',
          'whether the "Restore last session" feature is turned on (see below)',
          'which builder mode (Direct Edit or Classic) you last used',
          "whether the builder's section menu is collapsed",
        ],
        paragraphsAfterList: [
          "None of these contain any part of your CV. All five can be "
          + "cleared at any time by clearing your browser's site data for "
          + 'this domain. Your advertising-cookie consent choice is stored '
          + "separately by Google's consent tool (see \"Cookies and "
          + 'advertising" below).',
        ],
      },
      {
        heading: 'Restore last session',
        paragraphs: [
          'Settings includes a feature that is on by default: "Restore '
          + 'last session." While it is on, a working copy of the CV you '
          + "have edited is kept in your browser tab's session storage — "
          + 'not local storage — so an accidental refresh or tab crash '
          + 'does not lose your work. The copy stays in your own browser '
          + 'and is not sent anywhere. You can turn the feature off in '
          + 'Settings.',
          'Session storage differs from the local storage described above '
          + 'in one important way: your browser permanently clears it the '
          + 'moment you close the tab. It does not carry over to your next '
          + 'visit, even in the same browser, and it is never sent '
          + 'anywhere. Turning the feature back off clears the saved copy '
          + 'immediately.',
        ],
      },
      {
        heading: 'CVs saved on this device',
        paragraphs: [
          'Nothing is saved unless you choose to. When you press Save in the '
          + 'builder and name a CV, it is stored in your browser\'s IndexedDB '
          + 'storage on this device, and your later edits to it are saved '
          + 'there automatically. It does not leave your device, and '
          + 'PortifyCV never sees it.',
          'Saved CVs stay between visits until you delete them: one at a '
          + 'time from My CVs, all at once from Settings, or by clearing '
          + "your browser's site data for this domain. They do not move to "
          + 'another browser or device; export JSON if you want a copy '
          + 'elsewhere.',
          'When you mark a CV as applied (Mark as applied), the application '
          + 'is stored in its own IndexedDB database in this browser: the '
          + 'company, role, date applied, ad link, status and your notes, the '
          + 'PDF of the CV that was sent (and of the cover letter, when it has '
          + 'text) with pictures of its pages, and the CV data, template and '
          + 'look it was made from. None of it is sent anywhere. Applications '
          + 'stay until you delete them: one at a time from My CVs › '
          + 'Applications, all at once from Settings, or by clearing your '
          + "browser's site data for this domain. Deleting your saved CVs "
          + 'does not delete applications, and deleting applications does not '
          + 'delete your saved CVs.',
        ],
      },
      {
        heading: 'Cookies and advertising (Google AdSense)',
        paragraphs: [
          'PortifyCV shows ads through Google AdSense to fund the running of '
          + 'the site. Serving those ads involves cookies, set in your '
          + 'browser by Google and its partners.',
          {
            parts: [
              'Google, as a third party, uses cookies to '
              + "serve ads based on your prior visits to this and other "
              + "websites. Google's use of advertising cookies enables it "
              + 'and its partners to serve ads based on your visit to this '
              + 'site and/or other sites on the internet. You can opt out of '
              + 'personalized advertising by visiting ',
              { link: 'https://adssettings.google.com', text: 'Google Ads Settings' },
              ", or opt out of a third-party vendor's use of cookies for "
              + 'personalized advertising by visiting ',
              { link: 'https://www.aboutads.info', text: 'www.aboutads.info' },
              '. More detail on how Google uses information from sites that '
              + 'use its services is available at ',
              {
                link: 'https://policies.google.com/technologies/partner-sites',
                text: 'policies.google.com/technologies/partner-sites',
              },
              '.',
            ],
          },
          'In the EEA, the UK, and Switzerland, a Google-certified consent '
          + 'message is shown so you can grant or refuse consent for '
          + 'advertising cookies before any are set.',
          'Advertising cookies relate to ad delivery and measurement only. '
          + 'They are unrelated to, and cannot access, the CV content '
          + 'described above.',
        ],
      },
      {
        heading: 'Analytics (Cloudflare)',
        paragraphs: [
          'PortifyCV uses Cloudflare Web Analytics to see aggregate traffic '
          + 'to this site: how many people visit, which pages are popular, '
          + 'and how fast pages load. Cloudflare is the same company that '
          + 'serves this site. It does not use cookies, local storage, or '
          + 'any other client-side tracking identifier, and it does not '
          + 'follow you across other websites.',
          'The data it collects is aggregated and anonymized — things like '
          + 'the page you visited, the site that referred you, your '
          + 'approximate country, and your device or browser type. It has '
          + 'no access to anything you type into the CV builder; that stays '
          + 'in your own browser exactly as described above, and Cloudflare '
          + 'never sees it.',
        ],
      },
      {
        heading: "Children's privacy",
        paragraphs: [
          'PortifyCV is not directed at children under 13 and does not '
          + 'knowingly collect personal information from them.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'Because nothing about your CV is ever stored outside your own '
          + 'browser, there is nothing on our end to request, correct, or '
          + 'delete. You can delete your saved CVs and clear the local '
          + 'preferences above, or opt '
          + 'out of personalized ads, at any time using the links in this '
          + 'policy.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'If this policy changes, the effective date at the top of this '
          + 'page will be updated to reflect it.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          {
            parts: [
              'Questions about this policy can be sent to ',
              { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
              '.',
            ],
          },
        ],
      },
    ],
  }
}

function RichParagraph({ parts }) {
  return (
    <p>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>
        }

        if (part.code) {
          return <code key={index}>{part.code}</code>
        }

        if (part.link) {
          return (
            <a key={index} href={part.link} target={part.link.startsWith('mailto:') ? undefined : '_blank'} rel={part.link.startsWith('mailto:') ? undefined : 'noreferrer'}>
              {part.text}
            </a>
          )
        }

        return null
      })}
    </p>
  )
}

function PrivacyPolicyPage({ locale = 'en' }) {
  const copy = getPrivacyCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__kicker">{copy.kicker}</p>
        <h1 className="legal-page__title">{copy.title}</h1>
        <p className="legal-page__meta">
          {copy.effectiveDateLabel}: {copy.effectiveDate}
        </p>

        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) =>
              typeof paragraph === 'string' ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <RichParagraph key={index} parts={paragraph.parts} />
              ),
            )}
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.paragraphsAfterList?.map((paragraph, index) => (
              <p key={`after-${index}`}>{paragraph}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default PrivacyPolicyPage
