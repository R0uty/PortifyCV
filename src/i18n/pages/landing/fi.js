// The front page in Finnish.
import { ROUTES } from '../../../utils/routes.js'
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Ei kirjautumista. Mitään ei tallenneta, ellet itse tallenna.',
  startButton: 'Aloita rakentaminen',
  viewTemplatesButton: 'Katso pohjat',
  howItWorksLink: 'Katso miten se toimii',
  title: 'Ilmainen CV-työkalu. Tee CV, ota se mukaan, valmis.',
  subtitle: 'Napsauta CV:tä ja kirjoita. Valitse pohja ja ota CV mukaan PDF- tai Word-tiedostona tai jakolinkkinä.',
  previewAlt: 'PortifyCV-editori: CV, jonka Esittely-osio on auki muokattavaksi sen vieressä.',
  chipsLabel: 'Mukana',
  chips: [
    { label: `${TEMPLATE_COUNT} pohjaa × 3 tyyliä`, view: 'freeTemplates' },
    { label: 'ATS-näkymä', view: 'atsGuide' },
    { label: 'Suomi ja englanti', view: 'finnishCv' },
    { label: 'Hakemuskirje mukana', view: 'coverLetterExamples' },
  ],
  whyTitle: 'Miksi PortifyCV',
  why: [
    {
      heading: 'Ei tiliä. Ei kirjautumista. Siinä koko juttu.',
      body: 'Ei rekisteröitymistä, ei sähköpostivahvistusta, ei tiliä ylläpidettäväksi. Avaa sivu, ala kirjoittaa ja vie CV kun olet valmis — muuta ei tarvita.',
    },
    {
      heading: 'Mikään ei koskaan päädy palvelimelle',
      body: 'Jokainen vienti (PDF, Word, HTML, JSON) ja jakolinkki muodostetaan kokonaan selaimessasi. Toisin kuin tiliä vaativat CV-työkalut, tietojasi ei koskaan ladata, tallenneta tai näe kukaan muu — koska ne eivät koskaan poistu laitteeltasi.',
    },
    {
      heading: 'Rakennettu rekrytointijärjestelmiä varten',
      body: 'ATS-tila muotoilee CV:n järjestelmien luettavaksi ilman sarakkeita tai grafiikkaa, ja avainsanapisteytys näyttää mitä puuttuu.',
    },
  ],
  howTitle: 'Näin se toimii',
  steps: [
    { step: 'template', title: 'Valitse pohja', body: `${TEMPLATE_COUNT} asettelua, kolme tyyliä kussakin. Vaihda milloin vain, tekstisi säilyy.`, figureLabel: 'Pohjagalleria: alasuodattimet pohjakorttien yllä, kullakin kortilla kolme tyyliä.' },
    { step: 'edit', title: 'Muokkaa suoraan CV:ssä', body: 'Napsauta mitä tahansa tekstiä ja kirjoita, tai avaa osion kynä nähdäksesi kaikki sen kentät.', figureLabel: 'Editori Suora muokkaus -tilassa: demo-CV, jonka yhteenvedon kentät ovat auki ponnahdusikkunassa sen vieressä.' },
    { step: 'export', title: 'Vie tai jaa', body: 'Lataa PDF- tai Word-tiedosto tai kopioi jakolinkki. Mitään ei ladata palvelimelle.', figureLabel: 'Avattu Vie-valikko: PDF, HTML, JSON, Word ja jakolinkki.' },
  ],
  howLink: 'Lue koko käyttöopas',
  templatesTitle: 'Katso pohjat',
  templatesSubtitle: 'Valitse alasi nähdäksesi siihen sopivat pohjat, kukin yhdessä kolmesta tyylistään.',
  templatesCta: `Selaa kaikkia ${TEMPLATE_COUNT} pohjaa`,
  templateCardAlt: '{label} -CV-pohja, {look}',
  guidesTitle: 'Oppaat ja esimerkit',
  guides: [
    { view: 'howToWrite', path: ROUTES.howToWrite, title: 'Näin kirjoitat CV:n', body: 'Osiot, yhteenveto joka sanoo jotain, ja kohdat jotka näyttävät tuloksia.' },
    { view: 'atsGuide', path: ROUTES.atsGuide, title: 'ATS-ystävällinen CV-opas', body: 'Mitä hakijaseurantajärjestelmät lukevat, mikä ne rikkoo ja mikä vientimuoto valita.' },
    { view: 'cvExamples', path: ROUTES.cvExamples, title: 'CV-esimerkkejä aloittain', body: 'Kehittäjän, IT-alan, tietoturva-alan ja suomalaisen CV:n esimerkit sekä kokonaiset CV:t.' },
    { view: 'coverLetterExamples', path: ROUTES.coverLetterExamples, title: 'Saatekirje-esimerkkejä', body: 'Heikot ja vahvat aloitukset, keskiosat ja lopetukset sekä luonnos CV:si pohjalta.' },
  ],
  faqTitle: 'Usein kysytyt kysymykset',
}
