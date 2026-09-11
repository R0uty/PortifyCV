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

const { Paragraph } = await import('docx')
const {
  buildIdentityBlock,
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
  check('Interests renders just the heading when empty', interests.length === 1)
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

console.log(`\n${failures === 0 ? 'All docx export checks passed.' : `${failures} check(s) failed.`}`)
process.exit(failures === 0 ? 0 : 1)
