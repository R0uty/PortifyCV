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

const { Paragraph, Packer } = await import('docx')
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

console.log('\ndocxExport: monochrome by design (no stray colors in the generated XML)\n')

{
  // document.xml lives inside the .docx ZIP container, typically DEFLATE-
  // compressed — a raw-byte regex over the packed buffer finds nothing, so
  // this unzips with JSZip (already a transitive dependency of docx, and
  // available at node_modules/jszip) and inspects the real XML text.
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
      'every text color is one of the two monochrome tokens (1A1A1A / 666666) — no stray hues',
      colorsUsed.size > 0 && [...colorsUsed].every((hex) => hex === '1A1A1A' || hex === '666666'),
      `colors found: ${[...colorsUsed].join(', ')}`,
    )
  }
}

console.log(`\n${failures === 0 ? 'All docx export checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
