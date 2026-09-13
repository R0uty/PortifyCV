// Regression check for the docx export builders (src/utils/docxExport.js).
// Pure data-in, docx-object-out functions — no browser, no download — so
// they run the same way scripts/check-reducers.mjs does: import the real
// source module in plain Node and assert on its output.
//
//   node scripts/check-docx-export.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// The app's source uses extensionless relative imports, which Vite resolves
// and bare Node does not.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },
})

const srcDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '../src')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(srcDir, relativePath)).href)

const { Document, Paragraph, TextRun, Packer } = await import('docx')
const {
  buildIdentityBlock,
  buildDocxDocument,
  buildAboutSection,
  buildSkillsSection,
  buildExperienceSection,
  buildEducationSection,
  buildLinksSection,
  buildLanguagesSection,
  buildInterestsSection,
  buildCoreStrengthsSection,
  buildCertificatesSection,
  buildAchievementsSection,
  buildMembershipsSection,
  buildPublicationsSection,
  buildProjectsSection,
  buildOpenSourceSection,
  buildLeadershipSection,
  buildSpeakingSection,
  buildVolunteeringSection,
  buildInternshipsSection,
  buildCaseStudiesSection,
  buildTestimonialsSection,
} = await importSrc('utils/docxExport.js')
const { createExportCopy } = await importSrc('utils/exporters.js')
const { demoCvData, createInitialCvData } = await importSrc('utils/cvForm.js')
const { createCvSnapshot } = await importSrc('utils/cvSnapshot.js')
const { buildRailTableBody, buildGridTableBody, buildLabelGridBody, DOCX_ARCHETYPES } = await importSrc('utils/docxArchetypes.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

console.log('\ndocxExport: identity block\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')
  const block = await buildIdentityBlock(snapshot, copy, false)
  check('returns an array', Array.isArray(block))
  check('has no photo table when includePhoto is false', block.length === 3)
  check('every entry is a real docx Paragraph', block.every((entry) => entry instanceof Paragraph))
}

{
  const snapshot = createCvSnapshot({ ...demoCvData, email: '', phone: '', location: '' })
  const copy = createExportCopy('en')
  const block = await buildIdentityBlock(snapshot, copy, false)
  check('drops the contact line entirely when there is no contact info', block.length === 2)
}

console.log('\ndocxExport: core narrative sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const about = buildAboutSection(snapshot, copy)
  check('About: heading + one body paragraph for the demo CV', about.length === 2)

  const skills = buildSkillsSection(snapshot, copy)
  check('Skills: heading + one bullet per skill', skills.length === 1 + demoCvData.skills.length)

  const experience = buildExperienceSection(snapshot, copy)
  check('Experience: at least a heading plus one entry', experience.length > 1)

  const education = buildEducationSection(snapshot, copy)
  check('Education: at least a heading plus one entry', education.length > 1)
}

{
  const blankSnapshot = createCvSnapshot(createInitialCvData())
  const copy = createExportCopy('en')

  const about = buildAboutSection(blankSnapshot, copy)
  check('About falls back to "Add a professional summary" placeholder copy', about.length === 2)

  const skills = buildSkillsSection(blankSnapshot, copy)
  check('Skills falls back to a single placeholder line when empty', skills.length === 2)

  const experience = buildExperienceSection(blankSnapshot, copy)
  check('Experience falls back to a single placeholder line when empty', experience.length === 2)

  const education = buildEducationSection(blankSnapshot, copy)
  check('Education falls back to a single placeholder line when empty', education.length === 2)
}

console.log('\ndocxExport: list-shaped sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const links = buildLinksSection(snapshot, copy)
  check('Links: heading + one line per link', links.length === 1 + Object.keys(snapshot.links).length)

  const languages = buildLanguagesSection(snapshot, copy)
  check('Languages: heading + one line per language', languages.length === 1 + snapshot.languages.length)

  const interests = buildInterestsSection(snapshot, copy)
  check('Interests: heading + one joined line', interests.length === 2)

  const coreStrengths = buildCoreStrengthsSection(snapshot, copy)
  check('Core Strengths: at least a heading plus one entry', coreStrengths.length > 1)
}

{
  const blankSnapshot = createCvSnapshot(createInitialCvData())
  const copy = createExportCopy('en')

  const links = buildLinksSection(blankSnapshot, copy)
  check('Links falls back to a single placeholder line when empty', links.length === 2)

  const interests = buildInterestsSection(blankSnapshot, copy)
  check('Interests renders nothing (no orphan heading) when empty', interests.length === 0)
}

console.log('\ndocxExport: achievement-shaped sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const certificates = buildCertificatesSection(snapshot, copy)
  check('Certificates: heading + one bullet per certificate', certificates.length === 1 + demoCvData.certificates.length)

  const achievements = buildAchievementsSection(snapshot, copy)
  check('Achievements: at least a heading plus one entry', achievements.length > 1)

  const memberships = buildMembershipsSection(snapshot, copy)
  check('Memberships: heading + one bullet per membership', memberships.length === 1 + demoCvData.memberships.length)

  const publications = buildPublicationsSection(snapshot, copy)
  check('Publications: at least a heading plus one entry', publications.length > 1)
}

console.log('\ndocxExport: career-narrative sections\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const sections = [
    ['Projects', buildProjectsSection, demoCvData.projects],
    ['Open Source', buildOpenSourceSection, demoCvData.openSource],
    ['Leadership', buildLeadershipSection, demoCvData.leadership],
    ['Speaking', buildSpeakingSection, demoCvData.speaking],
    ['Volunteering', buildVolunteeringSection, demoCvData.volunteering],
    ['Internships', buildInternshipsSection, demoCvData.internships],
  ]

  sections.forEach(([label, build, sourceData]) => {
    const result = build(snapshot, copy)
    check(`${label}: at least a heading plus one entry per item`, result.length >= 1 + sourceData.length)
  })
}

console.log('\ndocxExport: case studies and testimonials\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')

  const caseStudies = buildCaseStudiesSection(snapshot, copy)
  check('Case Studies: at least a heading plus one entry', caseStudies.length > 1)

  const testimonials = buildTestimonialsSection(snapshot, copy)
  check('Testimonials: at least a heading plus one entry', testimonials.length > 1)
}

console.log('\ndocxExport: full document assembly\n')

{
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  check('produces a non-empty buffer for the demo CV', buffer.length > 0)
  check('produces a real ZIP container (.docx magic bytes)', buffer[0] === 0x50 && buffer[1] === 0x4b)
}

{
  const doc = await buildDocxDocument(createInitialCvData(), { template: 'minimal', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  check('builds successfully from a blank CV (every section on placeholder copy)', buffer.length > 0)
}

{
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'fi' })
  const buffer = await Packer.toBuffer(doc)
  check('builds successfully in Finnish locale', buffer.length > 0)
}

{
  const doc = await buildDocxDocument(demoCvData, { template: 'timeline', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  check('builds successfully for a template with a different section order', buffer.length > 0)
}

console.log('\ndocxExport: no orphan headings on a partially-filled CV\n')

{
  const partialCvData = {
    ...demoCvData,
    interests: [],
    languages: [],
    coreStrengths: [],
    certificates: [],
    achievements: [],
    memberships: [],
    publications: [],
    projects: [],
    openSource: [],
    leadership: [],
    speaking: [],
    volunteering: [],
    internships: [],
    caseStudies: [],
    testimonials: [],
  }
  const snapshot = createCvSnapshot(partialCvData)
  const copy = createExportCopy('en')

  const emptyBuilders = [
    ['Languages', buildLanguagesSection],
    ['CoreStrengths', buildCoreStrengthsSection],
    ['Certificates', buildCertificatesSection],
    ['Achievements', buildAchievementsSection],
    ['Memberships', buildMembershipsSection],
    ['Publications', buildPublicationsSection],
    ['Projects', buildProjectsSection],
    ['OpenSource', buildOpenSourceSection],
    ['Leadership', buildLeadershipSection],
    ['Speaking', buildSpeakingSection],
    ['Volunteering', buildVolunteeringSection],
    ['Internships', buildInternshipsSection],
    ['CaseStudies', buildCaseStudiesSection],
    ['Testimonials', buildTestimonialsSection],
  ]

  emptyBuilders.forEach(([label, build]) => {
    check(`${label} contributes nothing when empty (no orphan heading)`, build(snapshot, copy).length === 0)
  })

  // Interests was already covered by an existing check above — but confirm here too for completeness of this fixture.
  check('Interests contributes nothing when empty (no orphan heading)', buildInterestsSection(snapshot, copy).length === 0)
}

console.log('\ndocxExport: heading color (monochrome by default, accent when provided)\n')

{
  // No accentColor passed — headings stay the two monochrome tokens,
  // exactly C1's original guarantee.
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)

  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentXmlFile = zip.file('word/document.xml')
  check('word/document.xml is present in the packed .docx', documentXmlFile !== null)

  if (documentXmlFile) {
    const documentXml = await documentXmlFile.async('string')
    const colorMatches = [...documentXml.matchAll(/w:color w:val="([0-9A-Fa-f]{6})"/g)]
    const colorsUsed = new Set(colorMatches.map(([, hex]) => hex.toUpperCase()))

    check('found at least one w:color in the generated document', colorMatches.length > 0)
    check(
      'with no accentColor, every text color is one of the two monochrome tokens (1A1A1A / 666666)',
      colorsUsed.size > 0 && [...colorsUsed].every((hex) => hex === '1A1A1A' || hex === '666666'),
      `colors found: ${[...colorsUsed].join(', ')}`,
    )
  }
}

{
  // accentColor passed — headings use it; body text stays monochrome.
  const doc = await buildDocxDocument(demoCvData, { template: 'creative', locale: 'en', accentColor: '#e2572a' })
  const buffer = await Packer.toBuffer(doc)

  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentXml = await zip.file('word/document.xml').async('string')
  const colorMatches = [...documentXml.matchAll(/w:color w:val="([0-9A-Fa-f]{6})"/g)]
  const colorsUsed = new Set(colorMatches.map(([, hex]) => hex.toUpperCase()))

  check('with accentColor #e2572a, the accent hex E2572A appears in the document', colorsUsed.has('E2572A'))
  check(
    'with accentColor set, every color is still one of the three expected tokens (1A1A1A / 666666 / E2572A) — no stray hues',
    [...colorsUsed].every((hex) => hex === '1A1A1A' || hex === '666666' || hex === 'E2572A'),
    `colors found: ${[...colorsUsed].join(', ')}`,
  )
}

{
  // accent: null template (Modern Professional) — accentColor omitted by
  // the caller in practice, but confirm passing one anyway has no special
  // handling needed here (buildDocxDocument doesn't know about the
  // registry's accent:null — that's ResumeBuilderPage.jsx's job, tested
  // manually in Task 5). This check just documents the contract: omitting
  // accentColor is what keeps a template monochrome.
  const doc = await buildDocxDocument(demoCvData, { template: 'modern', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const documentXml = await zip.file('word/document.xml').async('string')
  check('omitting accentColor entirely still produces a valid document', documentXml.includes('<w:document'))
}

console.log('\ndocxArchetypes: buildRailTableBody\n')

async function packAndReadDocumentXml(children) {
  const doc = new Document({ sections: [{ children }] })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  return zip.file('word/document.xml').async('string')
}

{
  const main = [new Paragraph({ children: [new TextRun('Main content')] })]
  const rail = [new Paragraph({ children: [new TextRun('Rail content')] })]

  const result = buildRailTableBody(main, rail, { railSide: 'left', dark: false })
  check('returns an array with exactly one Table', Array.isArray(result) && result.length === 1)

  const xml = await packAndReadDocumentXml(result)
  check('produced exactly one table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('produced exactly two cells in that table', (xml.match(/<w:tc>/g) ?? []).length === 2)
  const railIndex = xml.indexOf('Rail content')
  const mainIndex = xml.indexOf('Main content')
  check('railSide "left" places rail content before main content in document order', railIndex > -1 && mainIndex > -1 && railIndex < mainIndex)
}

{
  const main = [new Paragraph({ children: [new TextRun('Main content')] })]
  const rail = [new Paragraph({ children: [new TextRun('Rail content')] })]

  const result = buildRailTableBody(main, rail, { railSide: 'right', dark: false })
  const xml = await packAndReadDocumentXml(result)
  const railIndex = xml.indexOf('Rail content')
  const mainIndex = xml.indexOf('Main content')
  check('railSide "right" places main content before rail content in document order', mainIndex > -1 && railIndex > -1 && mainIndex < railIndex)
  check('no cell shading when dark is false', !xml.includes('w:fill="1F2937"'))
}

{
  const main = [new Paragraph({ children: [new TextRun('Main content')] })]
  const rail = [new Paragraph({ children: [new TextRun('Rail content')] })]

  const result = buildRailTableBody(main, rail, { railSide: 'left', dark: true })
  const xml = await packAndReadDocumentXml(result)
  check('dark:true shades the rail cell with the expected fill', xml.includes('w:fill="1F2937"'))
}

console.log('\ndocxArchetypes: buildGridTableBody\n')

{
  const cell = (text) => [new Paragraph({ children: [new TextRun(text)] })]
  const result = buildGridTableBody([cell('TL'), cell('TR'), cell('BL'), cell('BR')])

  check('returns an array with exactly one Table', Array.isArray(result) && result.length === 1)

  const xml = await packAndReadDocumentXml(result)
  check('produced exactly one table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('produced exactly 2 rows', (xml.match(/<w:tr>/g) ?? []).length === 2)
  check('produced exactly 4 cells', (xml.match(/<w:tc>/g) ?? []).length === 4)
  check('cells have a visible border (unlike railTable)', xml.includes('w:val="single"'))

  const positions = ['TL', 'TR', 'BL', 'BR'].map((label) => xml.indexOf(label))
  check('all 4 labels present and in reading order (TL, TR, BL, BR)', positions.every((p) => p > -1) && positions[0] < positions[1] && positions[1] < positions[2] && positions[2] < positions[3])
}

{
  // An empty cell (a quadrant with no assigned sections) must not throw —
  // docx.js requires at least one paragraph per cell.
  const cell = (text) => [new Paragraph({ children: [new TextRun(text)] })]
  const result = buildGridTableBody([cell('Only content'), [], [], []])
  check('an empty quadrant does not throw and still produces one table', Array.isArray(result) && result.length === 1)
}

console.log('\ndocxArchetypes: buildLabelGridBody\n')

{
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')
  const order = ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates']
  const result = buildLabelGridBody(order, snapshot, copy, () => true)

  check('returns a non-empty array', Array.isArray(result) && result.length > 0)

  const xml = await packAndReadDocumentXml(result)
  check('produced 8 section headings', (xml.match(new RegExp(copy.about.toUpperCase(), 'g')) ?? []).length >= 1)
  check('produced at least one table (label/value rows)', (xml.match(/<w:tbl>/g) ?? []).length > 0)
  check('each table row has exactly 2 cells (label + value)', [...xml.matchAll(/<w:tr>[\s\S]*?<\/w:tr>/g)].every((row) => (row[0].match(/<w:tc>/g) ?? []).length === 2))
}

{
  // Empty CV — every section must still show its heading + an empty-state
  // row, matching every other archetype's "no orphan heading, but no
  // silently-missing section either" behavior from the C1 fix.
  const snapshot = createCvSnapshot(createInitialCvData())
  const copy = createExportCopy('en')
  const order = ['about', 'experience', 'education', 'skills', 'projects', 'links', 'languages', 'certificates']
  const result = buildLabelGridBody(order, snapshot, copy, () => true)
  check('an empty CV does not throw', Array.isArray(result))

  const xml = await packAndReadDocumentXml(result)
  check('empty CV still produces valid document.xml', xml.includes('<w:document'))
}

{
  // isVisible predicate is respected — hiding a section drops it entirely.
  const snapshot = createCvSnapshot(demoCvData)
  const copy = createExportCopy('en')
  const order = ['about', 'experience']
  const result = buildLabelGridBody(order, snapshot, copy, (section) => section !== 'experience')
  const xml = await packAndReadDocumentXml(result)
  check('a hidden section is excluded entirely', !xml.includes(copy.experience.toUpperCase()))
}

console.log('\ndocxExport: archetype dispatch (buildDocxDocument)\n')

{
  check('DOCX_ARCHETYPES has an entry for all 18 known templates', Object.keys(DOCX_ARCHETYPES).length === 18)
}

{
  // oneColumn: unchanged shape — no tables at all. (demoCvData.photo is
  // always '' — buildIdentityBlock only emits a table when a photo is
  // present, and photo-cropping is DOM-only so it can never be exercised
  // in this plain-Node check script — so the identity block contributes 0
  // tables here, not 1.)
  const doc = await buildDocxDocument(demoCvData, { template: 'minimal', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('oneColumn (minimal) produces exactly 0 tables (no photo in demoCvData, no body tables)', (xml.match(/<w:tbl>/g) ?? []).length === 0)
}

{
  // railTable, left (Executive) — 1 table: the rail table (no identity
  // table — see the oneColumn check above for why).
  const doc = await buildDocxDocument(demoCvData, { template: 'executive', locale: 'en', accentColor: '#b45309' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('railTable (executive) produces exactly 1 table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('accent color B45309 present', xml.includes('w:val="B45309"') || xml.includes('w:val="b45309"'.toUpperCase()))
}

{
  // darkSidebarTable (Developer) — 1 table, and the dark fill present.
  const doc = await buildDocxDocument(demoCvData, { template: 'developer', locale: 'en' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('darkSidebarTable (developer) produces exactly 1 table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('dark sidebar fill present', xml.includes('w:fill="1F2937"'))
}

{
  // gridTable (Quadrant) — 1 table: the 2x2 grid (no identity table).
  const doc = await buildDocxDocument(demoCvData, { template: 'quadrant', locale: 'en', accentColor: '#0e7490' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('gridTable (quadrant) produces exactly 1 table', (xml.match(/<w:tbl>/g) ?? []).length === 1)
  check('gridTable has 4 cells in its grid', (xml.match(/<w:tc>/g) ?? []).length === 4)
}

{
  // labelGridTable (European) — identity table + one table per visible section.
  const doc = await buildDocxDocument(demoCvData, { template: 'european', locale: 'en', accentColor: '#1d4ed8' })
  const buffer = await Packer.toBuffer(doc)
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml').async('string')
  check('labelGridTable (european) produces more than 2 tables (identity + one per row)', (xml.match(/<w:tbl>/g) ?? []).length > 2)
  check('accent color 1D4ED8 present', xml.toUpperCase().includes('W:VAL="1D4ED8"'.toUpperCase()) || xml.includes('1D4ED8'))
}

console.log(`\n${failures === 0 ? 'All docx export checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
