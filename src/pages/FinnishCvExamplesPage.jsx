import GuideLayout from '../components/GuideLayout'
import ExampleCvLinks from '../components/ExampleCvLinks'
import { CONTENT_PAGE_EXAMPLES } from '../utils/exampleCvs'
import { cvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

// Read off the template registry instead of a hardcoded number — see
// LandingPage.jsx for why this drifted before.
const TEMPLATE_COUNT = cvTemplates.length

// The understated templates the "safe choice" section links, as
// ExampleCvLinks pairs with no example (each links its template page).
const SAFE_TEMPLATES = [['minimal', null], ['classicProfessional', null], ['navyProfessional', null]]

function getCopy(locale) {
  if (locale === 'fi') {
    return {
      kicker: 'Esimerkkejä',
      title: 'Suomalaisen CV:n esimerkkejä',
      intro:
        'Suomalainen CV eroaa monesta kansainvälisestä käytännöstä muutamalla konkreettisella tavalla. Tässä on mitä kannattaa sisällyttää, mitä jättää pois, ja miten PortifyCV tukee kaksikielistä hakua.',
      sections: [
        {
          heading: 'Mitä jätetään pois',
          paragraphs: [
            'Henkilötunnusta, siviilisäätyä tai muita arkaluontoisia henkilötietoja ei kuulu laittaa CV:hen — ne eivät liity osaamiseesi, ja monissa maissa niiden pyytäminen olisi jopa kiellettyä. PortifyCV:n Henkilötiedot-osio kysyy vain nimen, tehtävänimikkeen ja yhteystiedot — ei tilaa, jonne tällaista tietoa voisi vahingossa raapustaa.',
          ],
        },
        {
          heading: 'Pituus ja rakenne',
          paragraphs: [
            'Yksi tai kaksi sivua riittää useimmille — pidempi CV ei näytä kokeneemmalta, se näyttää editoimattomalta. Rakenne on lähellä muuta Eurooppaa: yhteystiedot, lyhyt yhteenveto, työkokemus, koulutus, taidot, ja usein kielitaito omana osionaan.',
          ],
        },
        {
          heading: "Kuva ja henkilötiedot",
          paragraphs: [
            "Kuva on suomalaisessa CV:ssä yleinen mutta ei pakollinen. Jos lisäät sen, käytä selkeää ja tuoretta kasvokuvaa; kuvan puuttumista ei pidetä miinuksena. Vanhemmissa suomalaisissa CV:issä lueteltiin usein syntymäaika, perhe ja harrastukset tarkasti; nykyään riittää nimi, tehtävänimike, puhelin, sähköposti, kotikaupunki ja LinkedIn-linkki.",
          ],
        },
        {
          heading: "Päivämäärät, nimikkeet ja tutkinnot",
          list: [
            "Suomalaiset päivämäärät ovat yleensä muotoa \"1/2022–3/2024\". Valitse yksi muoto ja pidä siitä kiinni.",
            "Pidä tehtävänimikkeet CV:n kielellä, ja lisää englanninkieliseen CV:hen alkuperäinen nimike sulkuihin, jos sille ei ole selvää vastinetta.",
            "Käytä tutkinnoista virallisia nimiä ja käännöksiä, kuten \"insinööri (AMK)\" tai englanniksi \"Bachelor of Engineering\", jotta lukija tietää tason.",
          ],
        },
        {
          heading: 'Kielitaito-osio on tavallista tärkeämpi',
          paragraphs: [
            'Suomalaisilla työpaikoilla kysytään usein sekä suomen että ruotsin taitoa englannin lisäksi. PortifyCV:n Kielet-osiossa jokaiselle kielelle merkitään oma taso — tämä kannattaa täyttää huolella, se on yksi ensimmäisistä asioista, joita moni rekrytoija Suomessa katsoo.',
          ],
        },
        {
          heading: "Kielitodistukset: YKI ja virkamiesruotsi",
          paragraphs: [
            "Jos olet suorittanut yleisen kielitutkinnon (YKI), kerro kieli ja taso, esimerkiksi \"suomi, YKI taso 4\". Se kertoo työnantajalle enemmän kuin \"hyvä\". Julkisen sektorin tehtävissä vaaditaan usein todistus virkamiesruotsista tai -suomesta, joten mainitse se, jos sinulla on sellainen.",
          ],
        },
        {
          heading: 'Rakenna se suomeksi — tai molemmilla kielillä',
          paragraphs: [
            'PortifyCV toimii kokonaan suomeksi kielivalitsimen kautta: koko rakentaja, esikatselu ja viennit kääntyvät, joten voit kirjoittaa CV:n suoraan suomalaiselle työnantajalle sopivalla kielellä sen sijaan, että kirjoittaisit sen englanniksi ja kääntäisit jälkikäteen.',
          ],
        },
        {
          heading: 'Sama sisältö kahdella kielellä',
          examplePair: {
            weakLabel: 'Suomeksi',
            weak: '"Johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
            strongLabel: 'Englanniksi',
            strong: '"Led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
          },
          paragraphsAfter: [
            'Rakenne ja luvut pysyvät samoina — vain kieli vaihtuu. Vältä suoraa sanasta sanaan -käännöstä, joka usein kuulostaa kömpelöltä; kirjoita lause uudelleen kohdekielellä.',
          ],
        },
        {
          heading: "Suosittelijat",
          paragraphs: [
            "Suomalaiset työnantajat ottavat yhteyttä suosittelijoihin, usein prosessin loppuvaiheessa. Yhden tai kahden nimen listaaminen tehtävänimikkeen ja puhelinnumeron kanssa on tavallista; myös \"suosittelijat pyydettäessä\" käy. Kysy jokaiselta lupa ennen kuin listaat hänet.",
          ],
        },
        {
          heading: "Varusmies- tai siviilipalvelus ja vapaaehtoistyö",
          paragraphs: [
            "Suoritetun varusmies- tai siviilipalveluksen voi mainita lyhyesti, ja siitä kannattaa kertoa rivi, kun se liittyy haettavaan työhön: johtajakoulutus, erikoistehtävä tai työssä tarvittavat taidot. Vapaaehtoistyötä ja järjestöjen luottamustehtäviä arvostetaan Suomessa; kerro niistä lyhyesti, mitä teit.",
          ],
        },
        {
          heading: "Hakeminen: CV ja hakemus, usein lomakkeella",
          paragraphs: [
            "Useimmat suomalaiset työnantajat odottavat CV:n lisäksi erillisen hakemuksen. Monet käyttävät verkkolomaketta, jolle ladataan CV ja liitetään hakemus tai vastataan muutamaan kysymykseen. Kirjoita molemmat ilmoituksen kielellä.",
          ],
        },
        {
          heading: 'Turvallinen, ammattimainen pohjavalinta',
          paragraphs: [
            `Nämä kolme lukevat siistin ja asiallisen, mikä sopii suomalaisten työnantajien yleensä maltillisiin odotuksiin — mutta mikä tahansa ${TEMPLATE_COUNT} pohjasta toimii, ja vaihtaminen ei koske tekstiäsi:`,
          ],
          templateLinks: SAFE_TEMPLATES,
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
      fullExamples: {
        heading: 'Kokonaisia CV-esimerkkejä Eurooppalainen-pohjassa',
        intro: 'Eurooppalainen-pohja noudattaa EU:ssa yleistä Europass-tyylistä asettelua. Esimerkit avautuvat valmiina CV:inä sillä kielellä, jonka olet valinnut, ja "Käytä tätä esimerkkiä" lataa ne editoriin muokattavaksi.',
      },
      ctaNote: 'Ei kirjautumista. Saatavilla suomeksi ja englanniksi.',
      seeAlso: [
        { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV:n taito-osion esimerkkejä' },
        { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-ystävällinen CV-opas' },
        { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Ilmaiset CV-pohjat' },
        { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV-esimerkkejä aloittain' },
      ],
    }
  }

  return {
    kicker: 'Examples',
    title: 'Finnish CV Examples',
    intro:
      'A Finnish CV differs from a lot of international practice in a few concrete ways. Here’s what to include, what to leave out, and how PortifyCV supports a bilingual application.',
    sections: [
      {
        heading: 'What to leave out',
        paragraphs: [
          'A national ID number, marital status, or other sensitive personal details don’t belong on a CV — they have nothing to do with your qualifications, and in many countries asking for them would even be illegal. PortifyCV’s Personal Information section only asks for name, title, and contact details — there’s no field where this kind of data could accidentally end up.',
        ],
      },
      {
        heading: 'Length and structure',
        paragraphs: [
          'One or two pages is enough for most people — a longer CV doesn’t read as more experienced, it reads as unedited. The structure is close to the rest of Europe: contact details, a short summary, work experience, education, skills, and often a dedicated languages section.',
        ],
      },
      {
        heading: "Photo and personal details",
        paragraphs: [
          "A photo is common on Finnish CVs but not required. If you add one, use a plain, recent headshot; leaving it out is never held against you. Older Finnish CVs often listed a date of birth, family and hobbies in detail; today the convention is name, title, phone, email, city and a LinkedIn link.",
        ],
      },
      {
        heading: "Dates, job titles and degrees",
        list: [
          "Finnish dates usually look like \"1/2022–3/2024\". Pick one format and keep it.",
          "Keep job titles in the language of the CV, and add the original in brackets when a Finnish title has no clear English equivalent.",
          "Name degrees the way they’re officially translated, such as \"Bachelor of Engineering (AMK)\" or \"Master of Science (Technology)\", so a reader abroad knows the level.",
        ],
      },
      {
        heading: 'The languages section matters more than usual',
        paragraphs: [
          'Finnish employers often ask about both Finnish and Swedish proficiency in addition to English. PortifyCV’s Languages section lets you mark a proficiency level for each — worth filling in carefully, since it’s one of the first things many recruiters in Finland check.',
        ],
      },
      {
        heading: "Language certificates: YKI and civil-service Swedish",
        paragraphs: [
          "If you’ve taken the National Certificate of Language Proficiency (YKI), name the language and level, such as \"Finnish, YKI level 4\". It tells an employer more than \"good\". For public-sector jobs, proof of civil-service Swedish (virkamiesruotsi) or Finnish is often a requirement, so list it if you have it.",
        ],
      },
      {
        heading: 'Build it in Finnish — or both languages',
        paragraphs: [
          'PortifyCV runs entirely in Finnish through the language toggle: the whole builder, preview, and exports switch, so you can write a CV directly in the language your target employer expects instead of writing it in English and translating afterward.',
        ],
      },
      {
        heading: 'The same content in both languages',
        examplePair: {
          weakLabel: 'English',
          weak: '"Led end-to-end design for a B2B collaboration suite, improving activation by 21%."',
          strongLabel: 'Finnish',
          strong: '"Johdin B2B-yhteistyöalustan päästä päähän -suunnittelun, parantaen aktivointia 21 %."',
        },
        paragraphsAfter: [
          'The structure and numbers stay the same — only the language changes. Avoid a direct word-for-word translation, which often reads awkwardly; rewrite the sentence naturally in the target language instead.',
        ],
      },
      {
        heading: "References",
        paragraphs: [
          "Finnish employers do contact references, often near the end of the process. Listing one or two names with their role and phone number is common; \"references on request\" works too. Ask each person before you list them.",
        ],
      },
      {
        heading: "Conscription, civil service and voluntary work",
        paragraphs: [
          "Completed military or civilian service can be listed briefly, and it’s worth a line when it’s relevant: leader training, a specialist role, or skills the job needs. Voluntary work and positions of trust (luottamustehtävät) in associations are valued in Finland; give them a short entry with what you did.",
        ],
      },
      {
        heading: "Applying: a CV plus a hakemus, often through a form",
        paragraphs: [
          "Most Finnish employers expect a CV and a separate application letter, the hakemus. Many use an online form where you upload the CV and paste the letter or answer a few questions. Write both in the language of the job posting.",
        ],
      },
      {
        heading: 'A safe, professional template choice',
        paragraphs: [
          `These three read clean and understated, matching the generally restrained expectations of Finnish employers — but any of the ${TEMPLATE_COUNT} templates works, and switching never touches your text:`,
        ],
        templateLinks: SAFE_TEMPLATES,
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
    fullExamples: {
      heading: 'Full CV examples in the European template',
      intro: 'The European template follows the Europass-style layout common across the EU. Each example opens as a complete CV in the language you have selected (switch to FI for Finnish), and "Use this example" loads it into the builder to edit.',
    },
    ctaNote: 'No login. Available in Finnish and English.',
    seeAlso: [
      { to: ROUTES.cvSkills, view: 'cvSkills', text: 'CV Skills Examples' },
      { to: ROUTES.atsGuide, view: 'atsGuide', text: 'ATS-Friendly CV Guide' },
      { to: ROUTES.freeTemplates, view: 'freeTemplates', text: 'Free CV Templates' },
      { to: ROUTES.cvExamples, view: 'cvExamples', text: 'CV Examples by Field' },
    ],
  }
}

function FinnishCvExamplesPage({ locale = 'en', onGetStarted = () => {}, onNavigateToView = () => {} }) {
  const copy = getCopy(locale === 'fi' ? 'fi' : 'en')

  return (
    <GuideLayout
      view="finnishCv"
      locale={locale}
      kicker={copy.kicker}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
      renderSectionExtra={(section) => (section.templateLinks
        ? <ExampleCvLinks examples={section.templateLinks} locale={locale} onNavigateToView={onNavigateToView} />
        : null)}
      cta={{ label: copy.ctaLabel, note: copy.ctaNote }}
      related={copy.seeAlso.map((link) => ({ view: link.view, search: link.search, title: link.text }))}
      onGetStarted={onGetStarted}
      onNavigateToView={onNavigateToView}
    >
      <div className="guide__section">
        <h2>{copy.fullExamples.heading}</h2>
        <p>{copy.fullExamples.intro}</p>
        <ExampleCvLinks examples={CONTENT_PAGE_EXAMPLES.finnishCv} locale={locale} onNavigateToView={onNavigateToView} />
      </div>
    </GuideLayout>
  )
}

export default FinnishCvExamplesPage
