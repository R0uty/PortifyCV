// Regression check for the job-ad matcher (src/utils/jobMatch.js and its
// term list, src/utils/jobTerms.js), which also covers the cover-letter draft
// written for an ad (src/utils/coverLetter.js): what counts as a requirement in an
// English or Finnish ad, and what of it a CV already says.
//
//   node scripts/check-job-match.mjs
//
// Exits non-zero if any check fails. When an ad reads badly, add it here
// as a case first, then fix the matcher.

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

// The app's source uses extensionless relative imports, which Vite resolves and
// bare Node does not.
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

const { matchJobAd, jobTitleFromAd } = await importSrc('utils/jobMatch.js')
const { generateCoverLetterDraft } = await importSrc('utils/coverLetter.js')
const { createInitialCvData, createEmptyExperience } = await importSrc('utils/cvForm.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}
const same = (label, actual, expected) =>
  check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)

const labels = (result) => [...result.found.map((item) => item.label), ...result.missing]
const has = (result, label) => labels(result).includes(label)

function cv(overrides = {}) {
  const data = createInitialCvData()
  const experience = { ...createEmptyExperience(), role: 'Frontend Developer', company: 'Northwind Oy' }
  return { ...data, experience: [experience], ...overrides }
}

const ENGLISH_AD = `We are looking for a Senior Frontend Developer to join our product team in Helsinki.
Requirements: 5+ years of experience with React and TypeScript, strong knowledge of CSS and
accessibility (WCAG), experience with testing (Jest, Playwright), CI/CD pipelines, and REST or
GraphQL APIs. Nice to have: Next.js, design systems, Figma. We offer flexible working hours.
Apply via LinkedIn by the end of May; the rest of the team is in Espoo.`

const FINNISH_AD = `Etsimme kokenutta frontend-kehittäjää tiimiimme Helsinkiin. Edellytämme kokemusta
Reactista ja TypeScriptistä, hyvää CSS-osaamista sekä saavutettavuuden tuntemusta. Kokemus
testauksesta (Jest, Playwright) ja CI/CD-putkista katsotaan eduksi. Hyvä englannin kielen taito.`

// ── What counts as a requirement ──
{
  const result = matchJobAd(cv(), ENGLISH_AD)
  same('English ad: requirements in the order the ad names them', labels(result).sort(), [
    'APIs', 'CI/CD', 'CSS', 'Figma', 'GraphQL', 'Jest', 'Next.js', 'Playwright', 'REST', 'React',
    'TypeScript', 'WCAG', 'Accessibility', 'Design systems', 'Frontend', 'Testing',
  ].sort())
  for (const noise of ['team', 'looking', 'Helsinki', 'Espoo', 'May', 'LinkedIn', 'experience', 'working']) {
    check(`English ad: "${noise}" is not a requirement`, !labels(result).some((label) => label.toLowerCase() === noise.toLowerCase()))
  }
  check('English ad: three-letter CSS is kept', has(result, 'CSS'))
  check('English ad: "design systems" stays one phrase', has(result, 'Design systems') && !has(result, 'Design'))
  same('English ad: a CV with only a job title has only that', result.found.map((item) => item.label), ['Frontend'])
}
{
  const result = matchJobAd(cv(), 'Experience with REST APIs. The rest of the stack is Java.')
  check('"the rest of" in prose is not REST', labels(result).filter((label) => label === 'REST').length === 1)
  check('Java stays Java', has(result, 'Java') && !has(result, 'JavaScript'))
}
{
  const result = matchJobAd(cv(), 'You will spring into action and react quickly. Strong JavaScript skills.')
  check('"spring" and "react" in prose are not Spring and React', !has(result, 'Spring') && !has(result, 'React'))
  check('JavaScript is not Java', has(result, 'JavaScript') && !has(result, 'Java'))
}
{
  const result = matchJobAd(cv(), 'Must know C#, C++ and ASP.NET; A/B testing and Kotlinista is a plus.')
  for (const label of ['C#', 'C++', 'ASP.NET', 'A/B testing']) check(`tech by its shape: ${label}`, has(result, label))
  check('"A/B testing" claims its words before "testing"', !has(result, 'Testing'))
}

// ── Finnish ──
{
  const result = matchJobAd(cv(), FINNISH_AD)
  same('Finnish ad: inflected terms read back to their base form', labels(result).sort(), [
    'CI/CD', 'CSS', 'Englannin kieli', 'Frontend', 'Jest', 'Playwright', 'React', 'Saavutettavuus',
    'Testaus', 'TypeScript',
  ].sort())
  check('Finnish ad: no word broken at ä or ö', !labels(result).some((label) => /^[^\s]*[a-z]$/.test(label) && /taustaj|rjestelm|kehitt$/.test(label)))
  check('Finnish ad: Helsinkiin is not a requirement', !labels(result).some((label) => /helsin/i.test(label)))
}

// ── What the CV already says ──
{
  const data = cv({
    skills: ['React', 'TypeScript', 'Triage'],
    about: 'Frontend developer focused on accessibility.',
    experience: [{
      ...createEmptyExperience(),
      role: 'Frontend Developer',
      achievements: ['Moved the build to CI/CD with GitHub Actions.'],
      technologies: ['Playwright'],
    }],
  })
  const result = matchJobAd(data, ENGLISH_AD)
  const where = Object.fromEntries(result.found.map((item) => [item.label, item.where]))
  same('found in skills only', where.React, ['skills'])
  same('found in an achievement bullet', where['CI/CD'], ['experience'])
  same('found in the summary', where.Accessibility, ['summary'])
  same('technologies count as skills', where.Playwright, ['skills'])
  same('skillsOnly lists what the CV never shows in use', result.skillsOnly, ['React', 'TypeScript', 'Playwright'])
  same('coverage is the share found', result.coverageScore, Math.round((result.found.length / result.total) * 100))
  check('the inflected Finnish ad matches the same English skills', matchJobAd(data, FINNISH_AD).found.some((item) => item.label === 'React'))
}
{
  const data = cv({ skills: ['Triage', 'Lääkehoito'] })
  const result = matchJobAd(data, 'Haemme sairaanhoitajaa. Hallitset triagen ja lääkehoidon perusteet.')
  check("the CV's own skills count when the ad names them (Triage)", result.found.some((item) => item.label === 'Triage'))
}
{
  same('an empty ad has no input', matchJobAd(cv(), '   ').hasInput, false)
  check('a long ad lists at most 30 requirements', matchJobAd(cv(), `${ENGLISH_AD} ${'AWS Azure GCP Docker Kubernetes Terraform Ansible Linux Git GitHub GitLab Jenkins Kafka Redis Python Ruby Rust Scala '.repeat(3)}`).total <= 30)
}

{
  same('jobTitleFromAd takes the first line without trailing punctuation', jobTitleFromAd('Senior Frontend Developer.\nWe are looking for…'), 'Senior Frontend Developer')
  same('jobTitleFromAd skips leading blank lines', jobTitleFromAd('\n  \nQA Engineer:\nBody'), 'QA Engineer')
  same('jobTitleFromAd gives nothing for a first line over 40 characters', jobTitleFromAd('We are a fast-growing company looking for a developer'), '')
  same('jobTitleFromAd gives nothing for an empty ad', jobTitleFromAd(''), '')
}
{
  const data = cv({ skills: ['React', 'TypeScript', 'Figma', 'SQL'] })
  const ad = 'Frontend Developer\nYou know TypeScript and React, WCAG.'
  const en = generateCoverLetterDraft(data, { locale: 'en', jobAd: ad })
  check('the draft for an ad names the ad\'s terms the CV has', en.includes('TypeScript') && en.includes('React'))
  check('the draft for an ad leaves out skills the ad does not ask for', !en.includes('Figma'))
  check('the draft for an ad uses the ad line', /My experience covers what this role asks for: [^.]*\./.test(en), en)
  const fi = generateCoverLetterDraft(data, { locale: 'fi', jobAd: ad })
  check('the Finnish draft signs off in Finnish', fi.includes('Ystävällisin terveisin'))
  check('the Finnish draft for an ad uses the Finnish line', fi.includes('Kokemukseni kattaa sen, mitä tehtävässä haetaan:'))
  const plain = generateCoverLetterDraft(data, { locale: 'en' })
  check('with no ad the draft names the CV skills', plain.includes('Figma') && plain.includes('SQL') && plain.includes('My background includes'))
  const noMatch = generateCoverLetterDraft(data, { locale: 'en', jobAd: 'Nurse wanted for night shifts.' })
  check('an ad with nothing found keeps the CV skills', noMatch.includes('My background includes'))
}

console.log()
if (failures > 0) {
  console.log(`${failures} check(s) failed.`)
  process.exit(1)
}

console.log('All job-ad matcher checks passed.')
