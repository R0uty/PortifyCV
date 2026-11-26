// The Free CV Templates page in Finnish.
import { cvTemplates } from '../../../utils/cvTemplates.js'

// Read off the template registry instead of a hardcoded number.
const TEMPLATE_COUNT = cvTemplates.length

export default {
  kicker: 'Pohjat',
  title: 'Ilmaiset CV-pohjat',
  intro:
    `Kaikki ${TEMPLATE_COUNT} pohjaa ovat täysin ilmaisia, ilman vesileimaa ja ilman tiliä. Jokaisessa on kolme tyyliä (värit, fontti ja otsikoiden väri), jotka voit kokeilla suoraan kortilla. Vaihda pohjaa milloin tahansa rakentaessasi — sisältösi säilyy, vain asettelu vaihtuu.`,
  useTemplate: 'Käytä tätä pohjaa',
  viewExamples: 'Katso esimerkit',
  style: 'Tyyli',
  notSureTitle: 'Et ole varma mistä aloittaa?',
  notSureBody:
    'Valitse mikä tahansa pohja — voit vaihtaa toiseen milloin tahansa menettämättä yhtään kirjoittamaasi tekstiä. Jos hait rooliin, jossa hakemus kulkee hakijaseurantajärjestelmän läpi, kytke ATS-ystävällinen tila päälle mistä tahansa pohjasta ennen vientiä (editorin ATS-näkymä-painikkeella).',
  ctaLabel: 'Aloita ilman pohjan valintaa',
  linksLabel: 'Katso myös:',
  howToWriteLink: 'Näin kirjoitat CV:n',
  atsGuideLink: 'ATS-ystävällinen CV-opas',
  cvSkillsLink: 'CV:n taito-osion esimerkkejä',
  coverLetterLink: 'Saatekirje-esimerkkejä',
  cvExamplesLink: 'CV-esimerkkejä aloittain',
}
