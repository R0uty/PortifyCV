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
        'CV:llä on yksi tehtävä: viedä sinut haastatteluun. Tämä on käytännön läpikäynti siitä, mitä kannattaa sisällyttää, mitä karsia, ja miten muotoilla se — ei listaa yleisiä vinkkejä, jotka olet jo lukenut.',
      sections: [
        {
          heading: 'Aloita osioista, joilla on oikeasti merkitystä',
          paragraphs: [
            'Useimmat CV:t tarvitsevat tässä järjestyksessä: yhteystiedot, lyhyen yhteenvedon, työkokemuksen, koulutuksen ja taidot. Lisää sertifikaatit, projektit, kielet tai linkit vain, jos ne tuovat jotain, minkä perusteella rekrytoija oikeasti tekisi päätöksen — tyhjä "Kiinnostuksen kohteet" -osio tekstillä "lukeminen, vaeltaminen" vie tilaa, jonka rekrytoija voisi käyttää viimeisimpään työhösi. PortifyCV:n editori tukee tätä suoraan: jokaisen osion voi piilottaa CV-kohtaisesti, ja esikatselu päivittyy heti, joten näet tarkalleen kuinka paljon tilaa osio vie ennen kuin sitoudut siihen.',
          ],
        },
        {
          heading: 'Kirjoita yhteenveto, joka sanoo jotain konkreettista',
          paragraphs: [
            'Yhteenvedon pitäisi lukea kuin saatekirjeen vahva ensimmäinen lause, ei tehtävänimike lisättyine adjektiiveineen.',
          ],
          examplePair: {
            weakLabel: 'Heikko',
            weak: '"Ahkera ammattilainen, jolla on erinomaiset viestintätaidot ja joka etsii haastavaa mahdollisuutta."',
            strongLabel: 'Vahvempi',
            strong: '"Backend-kehittäjä, joka on vienyt tuotantoon kolme maksujärjestelmää ja pudottanut API:n vasteaikaa 40 % kahdessa Series B -vaiheen yrityksessä."',
          },
          paragraphsAfter: [
            'Ero: jälkimmäinen on tarkistettavissa. Se nimeää mitä teit ja suunnilleen kuinka hyvin. Jos lause voisi kuvata tuhansia muita hakijoita muuttumattomana, kirjoita se uudelleen.',
          ],
          linkParagraphs: [
            {
              before: 'Sama "konkreettinen, ei yleinen" -sääntö pätee saatekirjeeseen — katso ',
              linkText: 'saatekirje-esimerkkejä',
              linkTo: ROUTES.coverLetterExamples,
              view: 'coverLetterExamples',
              after: ' heikoista ja vahvoista avauksista ja lopetuksista.',
            },
          ],
        },
        {
          heading: 'Kirjoita kokemuskohdat, jotka näyttävät vaikutuksen — eivät vastuualueita',
          paragraphs: [
            'Kaksi virhettä toistuu jatkuvasti:',
          ],
          list: [
            'Vastuualueiden kuvaaminen tulosten sijaan ("Vastuualueena tukijonon hallinta") — tämä kertoo lukijalle vain mihin sinut nimettiin, ei mitä siitä seurasi.',
            'Jokaisen kohdan aloittaminen täytesanalla tai tehtävällä vahvan verbin sijaan: "Vastasin perehdytyksestä" verrattuna "Johdin 40 uuden työntekijän perehdytystä."',
          ],
          paragraphsAfter: [
            'Kirjoita jokainen kohta muotoon: [vahva verbi] + [mitä teit] + [mitattava tulos]. "Lyhensin perehdytysajan kolmesta viikosta viiteen päivään rakentamalla koulutuslistan uudelleen" kertoo rekrytoijalle mitä sinulta voi odottaa kolmessa sekunnissa. PortifyCV:n sisäänrakennettu ehdotuspaneeli tarkistaa juuri tämän — se merkitsee passiiviset ilmaisut kuten "vastuualueena" ja kohdat, jotka eivät ala vahvalla verbillä, sekä erikseen kohdat joista puuttuu luku kokonaan, suoraan muokattavan kentän vieressä.',
          ],
        },
        {
          heading: 'Valitse taidot, joita rekrytoija oikeasti hakee — ei kaikkea mihin olet koskaan koskenut',
          paragraphs: [
            'Listaa taidot, jotka pystyt perustelemaan haastattelussa, ryhmiteltyinä niin että selaaja (ihminen tai ATS) löytää työpaikkailmoitusta vastaavat alle viidessä sekunnissa.',
          ],
          linkParagraphs: [
            {
              before: 'Katso ',
              linkText: 'CV:n taito-osion esimerkkejä',
              linkTo: ROUTES.cvSkills,
              view: 'cvSkills',
              after: ' siitä, miten ryhmitellä ja muotoilla ne, ja kuinka monta on oikeasti sopiva määrä.',
            },
            {
              before: 'Jos haet tiettyyn rooliin, liitä työpaikkailmoitus PortifyCV:n ',
              linkText: 'ATS-paneeliin',
              linkTo: ROUTES.atsGuide,
              view: 'atsGuide',
              after: ' — se näyttää mitkä listaamistasi taidoista ja ilmauksista puuttuvat CV:stäsi suhteessa kyseiseen ilmoitukseen.',
            },
          ],
        },
        {
          heading: 'Virheet, jotka kannattaa korjata ennen lähettämistä',
          list: [
            'Yleinen tavoitelause ("Etsin roolia, jossa voin kehittyä ammatillisesti") joka ei kerro mitään tästä työstä',
            'Epäjohdonmukaiset tai puuttuvat päivämäärät — rekrytoijat lukevat aukot varoitusmerkkeinä, oli selitys mikä tahansa',
            'Tekstiseinä ilman luetelmakohtia — kukaan ei lue kappaleita kuuden sekunnin ensisilmäyksessä',
            'Ei yhtäkään lukua missään — jos pystyt arvioimaan vaikutuksen, tee se',
            'Saman CV:n lähettäminen kymmeneen eri rooliin muuttumattomana',
          ],
        },
        {
          heading: 'Muotoile ensin lukijalle, joka näkee sen ensin — usein ohjelmisto',
          paragraphs: [
            'Monet yritykset ohjaavat hakemukset hakijaseurantajärjestelmän läpi ennen kuin kukaan avaa niitä. Asettelu, jossa on useita sarakkeita, kuvakkeita otsikoiden tilalla, tai sisältöä tekstiruuduissa ja taulukoissa, voi sekoittua tai kadota tuolle ohjelmistolle, vaikka se näyttäisi sinusta hyvältä.',
          ],
          linkParagraphs: [
            {
              before: 'Lue ',
              linkText: 'ATS-ystävällinen CV-opas',
              linkTo: ROUTES.atsGuide,
              view: 'atsGuide',
              after: ' siitä, mikä täsmälleen menee rikki ja miten tarkistat oman CV:si.',
            },
          ],
        },
        {
          heading: 'Valitse sitten asettelu ihmislukijalle',
          paragraphs: [
            'Kun sisältö on kunnossa, pohja on vain kääre sen ympärillä — pohjan vaihtaminen PortifyCV:ssä ei koskaan koske tekstiäsi, joten muutaman kokeileminen ennen päätöstä on turvallista.',
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
      ],
      ctaLabel: 'Aloita CV:si rakentaminen',
      ctaNote: 'Ei kirjautumista. Ei mitään tallennettua ennen kuin viet CV:n.',
    }
  }

  return {
    kicker: 'Guide',
    title: 'How to Write a CV',
    intro:
      'A CV has one job: get you an interview. This is a practical walkthrough of what to include, what to cut, and how to phrase it — not a list of generic tips you’ve already read.',
    sections: [
      {
        heading: 'Start with the sections that actually matter',
        paragraphs: [
          'Most CVs need, in this order: contact details, a short summary, experience, education, and skills. Add certificates, projects, languages, or links only if they add something a recruiter would act on — an empty "Interests" section with "reading, hiking" wastes space a hiring manager could spend on your last job. PortifyCV’s editor mirrors this: every section can be hidden per CV, and the live preview updates as you toggle them, so it’s easy to see exactly how much room a section is taking before you commit to it.',
        ],
      },
      {
        heading: 'Write a summary that says something specific',
        paragraphs: [
          'A summary should read like a strong first sentence of a cover letter, not a job title with adjectives attached.',
        ],
        examplePair: {
          weakLabel: 'Weak',
          weak: '"Hardworking professional with excellent communication skills seeking a challenging opportunity."',
          strongLabel: 'Stronger',
          strong: '"Backend engineer who has shipped three production payment systems and cut API latency by 40% at two Series B startups."',
        },
        paragraphsAfter: [
          'The difference: the second version is falsifiable. It names what you did and roughly how well. If a sentence could describe thousands of other candidates unchanged, rewrite it.',
        ],
        linkParagraphs: [
          {
            before: 'The same "specific, not generic" rule applies to a cover letter — see ',
            linkText: 'cover letter examples',
            linkTo: ROUTES.coverLetterExamples,
            view: 'coverLetterExamples',
            after: ' for weak-vs-strong openings and closings.',
          },
        ],
      },
      {
        heading: 'Write experience bullets that show impact, not duties',
        paragraphs: [
          'Two failure modes show up constantly:',
        ],
        list: [
          'Describing responsibilities instead of results ("Responsible for managing the support queue") — this only tells a reader what you were assigned, not what happened because you did it.',
          'Opening every bullet with a filler verb or a task instead of an action verb: "Was in charge of onboarding" instead of "Led onboarding for 40 new hires."',
        ],
        paragraphsAfter: [
          'Rewrite each bullet as: [strong verb] + [what you did] + [measurable result]. "Reduced onboarding time from three weeks to five days by rebuilding the training checklist" tells a recruiter what to expect from you in three seconds. PortifyCV’s built-in suggestions panel checks for exactly this — it flags passive phrases like "responsible for" and bullets that don’t open with a strong verb, and separately flags bullets missing a number entirely, right next to the field you’re editing.',
        ],
      },
      {
        heading: 'Choose skills a recruiter would search for, not everything you’ve touched',
        paragraphs: [
          'List skills you can defend in an interview, grouped so a scanner — human or ATS — can find the ones that match the job posting in under five seconds.',
        ],
        linkParagraphs: [
          {
            before: 'See ',
            linkText: 'CV skills examples',
            linkTo: ROUTES.cvSkills,
            view: 'cvSkills',
            after: ' for how to group and phrase them, and how many is actually the right number.',
          },
          {
            before: 'If you’re applying to a specific role, paste the job description into PortifyCV’s ',
            linkText: 'ATS panel',
            linkTo: ROUTES.atsGuide,
            view: 'atsGuide',
            after: ' — it shows which of your listed skills and phrases are missing from your CV relative to that posting.',
          },
        ],
      },
      {
        heading: 'Mistakes worth fixing before you send it',
        list: [
          'A generic objective statement ("Seeking a position where I can grow professionally") that says nothing about this job',
          'Inconsistent or missing dates — recruiters read gaps as red flags whether or not there’s a reasonable explanation',
          'A wall of text with no bullets — nobody reads paragraphs in a six-second first scan',
          'No numbers anywhere — if you can approximate an impact, do it',
          'Applying the same CV to ten different roles unchanged',
        ],
      },
      {
        heading: 'Format for the reader that sees it first — often software',
        paragraphs: [
          'Many companies route applications through an applicant tracking system before a person ever opens them. A layout with multiple columns, icons standing in for section headers, or content inside text boxes and tables can get scrambled or dropped by that software, even if it looks fine to you.',
        ],
        linkParagraphs: [
          {
            before: 'Read the ',
            linkText: 'ATS-Friendly CV Guide',
            linkTo: ROUTES.atsGuide,
            view: 'atsGuide',
            after: ' for what specifically breaks and how to check your own CV against it.',
          },
        ],
      },
      {
        heading: 'Then choose a layout for the human reader',
        paragraphs: [
          'Once the content is solid, the template is a wrapper around it — swapping templates in PortifyCV never touches your text, so it’s safe to try a few before deciding.',
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
