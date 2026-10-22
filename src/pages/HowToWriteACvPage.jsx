import GuideLayout from '../components/GuideLayout'
import { cvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

// Read off the template registry instead of a hardcoded number — see
// LandingPage.jsx for why this drifted before.
const TEMPLATE_COUNT = cvTemplates.length

function getCopy(locale) {
  if (locale === 'fi') {
    return {
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
      ctaNote: 'Ei kirjautumista. Mitään ei tallenneta ennen kuin viet CV:n.',
    }
  }

  return {
    kicker: 'Guide',
    title: 'How to Write a CV',
    intro:
      'A CV has one job: get you an interview. This is a practical walkthrough of what to include, what to cut, and how to phrase it, with before-and-after examples you can copy the shape of.',
    sections: [
      {
        heading: 'Start with the sections that actually matter',
        paragraphs: [
          'Most CVs need, in this order: contact details, a short summary, experience, education, and skills. Add certificates, projects, languages, or links only if they add something a recruiter would act on. An "Interests" section that says "reading, hiking" takes space a hiring manager could spend on your last job.',
          'The order can change with your stage. A recent graduate with little work history leads with education and projects; someone with ten years of experience keeps education to a line or two near the end. PortifyCV lets you hide any section per CV and move sections up or down, and the preview updates as you do, so you can see how much room each one takes before you commit.',
        ],
      },
      {
        heading: 'Contact details: what to include and what to leave out',
        list: [
          'Include your full name, a professional email address, a phone number, and your city (a full street address isn’t needed).',
          'Add a LinkedIn profile, portfolio or GitHub link if it shows work relevant to the job, and check that it’s up to date.',
          'Leave out your date of birth, ID numbers, marital status and nationality. They aren’t qualifications, and in many countries an employer may not even ask for them.',
          'A photo is optional and depends on the country and field: common in parts of Europe, unusual in the US and UK. If you add one, use a plain, recent headshot.',
        ],
      },
      {
        heading: 'Write a summary that says something specific',
        paragraphs: [
          'Two or three sentences: who you are professionally, your strongest piece of evidence, and what you want next. It should read like the strong first line of a cover letter, not a job title with adjectives attached.',
        ],
        examplePair: {
          weakLabel: 'Weak',
          weak: '"Hardworking professional with excellent communication skills seeking a challenging opportunity."',
          strongLabel: 'Stronger',
          strong: '"Backend engineer who has shipped three production payment systems and cut API latency by 40% at two Series B startups."',
        },
        paragraphsAfter: [
          'The difference: the second version can be checked. It names what you did and roughly how well. If a sentence could describe thousands of other candidates unchanged, rewrite it.',
          'Changing careers? Lead with the transferable proof, not the old job title: "Former teacher who built and ran a 200-student online course platform, now moving into instructional design."',
        ],
        linkParagraphs: [
          {
            before: 'The same "specific, not generic" rule applies to a cover letter. See ',
            linkText: 'cover letter examples',
            linkTo: ROUTES.coverLetterExamples,
            view: 'coverLetterExamples',
            after: ' for weak and strong openings and closings.',
          },
        ],
      },
      {
        heading: 'Write experience bullets that show impact, not duties',
        paragraphs: [
          'List jobs newest first, with the title, employer, city and dates. Give recent roles three to five bullets and older ones one or two. Two failure modes show up constantly:',
        ],
        list: [
          'Describing responsibilities instead of results ("Responsible for managing the support queue"). That only tells a reader what you were assigned, not what happened because you did it.',
          'Opening every bullet with a filler phrase instead of an action verb: "Was in charge of onboarding" instead of "Led onboarding for 40 new hires."',
        ],
        paragraphsAfter: [
          'Rewrite each bullet as: [strong verb] + [what you did] + [measurable result]. "Reduced onboarding time from three weeks to five days by rebuilding the training checklist" tells a recruiter what to expect from you in three seconds. PortifyCV’s suggestions check for exactly this: they flag passive phrases like "responsible for", bullets that don’t open with a strong verb, and bullets with no number, right next to the field you’re editing.',
        ],
      },
      {
        heading: 'More before-and-after bullets, by role',
        paragraphs: [
          'The same pattern works far beyond tech. If you don’t have an exact number, an honest approximation ("about 30", "roughly a third") is still better than none.',
        ],
        list: [
          'Sales. Weak: "Handled key accounts." Strong: "Grew revenue from 12 key accounts by 18% in a year by moving them to quarterly business reviews."',
          'Nursing. Weak: "Cared for patients on a busy ward." Strong: "Cared for up to 8 patients per shift on a 30-bed surgical ward and trained 5 new nurses on the medication system."',
          'Customer service. Weak: "Answered customer emails." Strong: "Answered about 60 customer emails a day and cut the average first reply time from 9 hours to 2."',
          'Teaching. Weak: "Taught maths to secondary students." Strong: "Taught maths to 120 students a year; the classes’ pass rate in the national exam rose from 71% to 84% in two years."',
        ],
      },
      {
        heading: 'Education, certificates and projects',
        paragraphs: [
          'For each degree, give the name, the school and the years; add a thesis or grade only if it helps for this job. Certificates get the issuer and the year, plus the expiry date when they lapse (PortifyCV’s Certificates section has a field for it), because a recruiter checks whether they’re still valid.',
          'Projects earn their place when they show skills your job history doesn’t: name, one line on what it does, your part in it, and a link. For graduates and career changers, they often carry more weight than early jobs.',
        ],
      },
      {
        heading: 'Choose skills a recruiter would search for, not everything you’ve touched',
        paragraphs: [
          'List skills you can defend in an interview, grouped so a reader, human or software, can find the ones that match the job posting in a few seconds.',
        ],
        linkParagraphs: [
          {
            before: 'See ',
            linkText: 'CV skills examples',
            linkTo: ROUTES.cvSkills,
            view: 'cvSkills',
            after: ' for how to group and phrase them, and how many is actually the right number.',
          },
        ],
      },
      {
        heading: 'Tailor it to each job',
        paragraphs: [
          'Sending the same CV everywhere is the most common reason a good CV gets no replies. Tailoring doesn’t mean rewriting it each time; it takes about fifteen minutes:',
        ],
        list: [
          'Read the posting and mark the three or four things it asks for most.',
          'Use the posting’s exact words where they’re true for you: if it says "stakeholder management", don’t only write "worked with partners".',
          'Move the bullets that prove those things to the top of each role.',
          'Adjust the summary’s last sentence to this job.',
        ],
        linkParagraphs: [
          {
            before: 'In PortifyCV’s Classic mode, paste the job posting into the ',
            linkText: 'ATS score panel',
            linkTo: ROUTES.atsGuide,
            view: 'atsGuide',
            after: ' to see which of its key terms your CV doesn’t mention yet.',
          },
        ],
      },
      {
        heading: 'Length and format',
        list: [
          'One page early in your career; two pages once you have several relevant roles. More than two rarely helps.',
          'One date format throughout (for example "Jan 2022 – Mar 2024"), and one style for headings.',
          'A readable font at 10 to 12 points, with enough white space that each section stands apart.',
          'Send the file type the posting asks for. If an applicant tracking system will read it, a Word file from a one-column template keeps your text machine-readable; the ATS guide below explains why.',
        ],
      },
      {
        heading: 'Mistakes worth fixing before you send it',
        list: [
          'A generic objective ("Seeking a position where I can grow professionally") that says nothing about this job',
          'Inconsistent or missing dates. Recruiters read gaps as red flags whether or not there’s a good reason, so give a short reason for longer ones',
          'A wall of text with no bullets. Nobody reads long paragraphs in a first scan of a few seconds',
          'No numbers anywhere. If you can approximate an impact, do it',
          'Abbreviations only your old employer used. Spell them out once',
          'Typos and a wrong company name. Read it aloud once, or have someone else read it',
        ],
      },
      {
        heading: 'Format for the reader that sees it first: often software',
        paragraphs: [
          'Many companies route applications through an applicant tracking system before a person opens them. A layout with several columns, icons instead of section headings, or text inside boxes and tables can get scrambled or dropped by that software, even if it looks fine to you.',
        ],
        linkParagraphs: [
          {
            before: 'Read the ',
            linkText: 'ATS-friendly CV guide',
            linkTo: ROUTES.atsGuide,
            view: 'atsGuide',
            after: ' for what breaks, which export to use, and how to check your own CV.',
          },
        ],
      },
      {
        heading: 'Then choose a layout for the human reader',
        paragraphs: [
          'Once the content is solid, the template is a wrapper around it. Swapping templates in PortifyCV never touches your text, so it’s safe to try a few, and each comes in three looks.',
        ],
        linkParagraphs: [
          {
            before: 'See all ',
            linkText: `${TEMPLATE_COUNT} free templates`,
            linkTo: ROUTES.freeTemplates,
            view: 'freeTemplates',
            after: '.',
          },
        ],
      },
      {
        heading: 'A final check before you send it',
        list: [
          'Your name, email and phone number are correct and match your LinkedIn profile.',
          'The summary mentions this job’s field and your strongest proof.',
          'Every recent role has at least one bullet with a number.',
          'The skills include the posting’s key terms that are true for you.',
          'Dates are consistent and there are no unexplained gaps.',
          'The file name is useful, like "Firstname-Lastname-CV.pdf", not "cv_final_v3.pdf".',
        ],
      },
    ],
    ctaLabel: 'Start building your CV',
    ctaNote: 'No login. Nothing saved until you export.',
  }
}

function HowToWriteACvPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="howToWrite"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={[{ view: 'atsGuide' }, { view: 'cvSkills' }, { view: 'coverLetterExamples' }]}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    ></GuideLayout>
  )
}

export default HowToWriteACvPage
