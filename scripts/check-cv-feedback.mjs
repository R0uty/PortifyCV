// Regression check for the rule-based CV feedback engine (src/utils/cvFeedback.js).
//
// It's pure — (CvData) -> feedback object, no side effects — so it runs the
// same way ResumeBuilderPage calls it, without needing a browser.
//
//   node scripts/check-cv-feedback.mjs
//
// Exits non-zero if any check fails.

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

const { evaluateCvFeedback, getBulletHints, countBlankBullets } = await importSrc('utils/cvFeedback.js')
const { createInitialCvData, createEmptyExperience } = await importSrc('utils/cvForm.js')
const { EXAMPLES, loadExampleCv } = await importSrc('utils/exampleCvs.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

function withExperience(overrides) {
  const data = createInitialCvData()
  data.experience = [{ ...createEmptyExperience(), role: 'Engineer', company: 'Acme', ...overrides }]
  return data
}

function tipIdsForFirstExperience(feedback) {
  return feedback.inlineTips.experienceItems[0].map((item) => item.id)
}

console.log('\nevaluateCvFeedback — profile, skills, experience baseline\n')

{
  const feedback = evaluateCvFeedback(createInitialCvData())
  check('an empty CV flags a missing summary', feedback.inlineTips.profile.some((item) => item.id === 'about-missing'))
  check('an empty CV flags missing skills', feedback.inlineTips.skills.some((item) => item.id === 'skills-missing'))
  check('an empty CV flags missing experience', feedback.inlineTips.experience.some((item) => item.id === 'experience-empty'))
}

{
  const data = createInitialCvData()
  data.about = 'Product designer with 7+ years of experience shaping SaaS workflows and design systems.'
  data.skills = ['Figma', 'Design Systems', 'User Research', 'Prototyping']
  const feedback = evaluateCvFeedback(data)
  check('a filled-in profile clears the missing-summary tip', !feedback.inlineTips.profile.some((item) => item.id === 'about-missing'))
  check('4+ skills clears the thin-skills warning', !feedback.inlineTips.skills.some((item) => item.id === 'skills-thin'))
}

console.log('\nevaluateCvFeedback — weak-phrase detection (new)\n')

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Responsible for managing the support queue and onboarding new hires.' }))
  const ids = tipIdsForFirstExperience(feedback)
  check('a "responsible for" description is flagged as a weak phrase', ids.includes('experience-weak-phrase-0'))
  const weakPhraseTip = feedback.inlineTips.experienceItems[0].find((item) => item.id === 'experience-weak-phrase-0')
  check('the weak-phrase tip names the offending phrase', weakPhraseTip.message.toLowerCase().includes('responsible for'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Was in charge of the migration to the new billing platform.' }))
  check('"in charge of" is also caught as a weak phrase', tipIdsForFirstExperience(feedback).includes('experience-weak-phrase-0'))
}

{
  const feedback = evaluateCvFeedback(
    withExperience({
      description: 'Owned the onboarding revamp end to end.',
      achievements: ['Helped with rollout across 6 regional teams.'],
    }),
  )
  check('a weak phrase in an achievement bullet is caught even when the description is clean', tipIdsForFirstExperience(feedback).includes('experience-weak-phrase-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Led the migration to the new billing platform, cutting invoice errors by 30%.' }))
  check('clean, metric-bearing phrasing does not trigger the weak-phrase tip', !tipIdsForFirstExperience(feedback).includes('experience-weak-phrase-0'))
}

console.log('\nevaluateCvFeedback — action-verb detection (new)\n')

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Ensured the project stayed on schedule across three quarters.' }))
  check('an opener not on the strong-verb list is flagged', tipIdsForFirstExperience(feedback).includes('experience-action-verb-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Led the migration to the new billing platform, cutting invoice errors by 30%.' }))
  check('an opener on the strong-verb list is not flagged', !tipIdsForFirstExperience(feedback).includes('experience-action-verb-0'))
}

{
  // Only the description opens weakly; one of two achievement bullets opens
  // with a strong verb, so the entry as a whole should not be flagged - the
  // check should look across every bullet, not just the description.
  const feedback = evaluateCvFeedback(
    withExperience({
      description: 'Ensured the onboarding flow stayed on track.',
      achievements: ['Built a reusable component library.', 'Coordinated the beta rollout.'],
    }),
  )
  check('the action-verb tip does not fire when at least one bullet opens strongly', !tipIdsForFirstExperience(feedback).includes('experience-action-verb-0'))
}

{
  const feedback = evaluateCvFeedback(
    withExperience({
      description: 'Ensured the onboarding flow stayed on track.',
      achievements: ['Was present for every planning meeting.'],
    }),
  )
  check('the action-verb tip fires when every bullet opens weakly', tipIdsForFirstExperience(feedback).includes('experience-action-verb-0'))
}

{
  // A weak phrase and a weak opener can coexist on the same bullet; both
  // signals should surface rather than one silently suppressing the other.
  const feedback = evaluateCvFeedback(withExperience({ description: 'Responsible for the support queue.' }))
  const ids = tipIdsForFirstExperience(feedback)
  check('a weak-phrase bullet that also opens weakly gets both tips', ids.includes('experience-weak-phrase-0') && ids.includes('experience-action-verb-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: '' }))
  check('an entry with no description gets neither phrasing tip (description-missing already covers it)', tipIdsForFirstExperience(feedback).every((id) => !id.startsWith('experience-weak-phrase') && !id.startsWith('experience-action-verb')))
}

console.log('\nevaluateCvFeedback — Finnish phrasing (1.6.51)\n')

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Vastuualueena asiakastuki ja laskutus.' }))
  check('a Finnish duty-list description ("vastuualueena") is flagged as a weak phrase', tipIdsForFirstExperience(feedback).includes('experience-weak-phrase-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Olin vastuussa uusien työntekijöiden perehdytyksestä.' }))
  check('"olin vastuussa" is flagged as a weak phrase', tipIdsForFirstExperience(feedback).includes('experience-weak-phrase-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Perehdytin 40 uutta työntekijää ja lyhensin perehdytyksen viiteen päivään.' }))
  check('a Finnish bullet opening with a strong verb ("Perehdytin") gets no action-verb tip', !tipIdsForFirstExperience(feedback).includes('experience-action-verb-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Johdan 12 hengen tiimiä ja vastaan budjetista.' }))
  check('a current Finnish role in the present tense ("Johdan") gets no action-verb tip', !tipIdsForFirstExperience(feedback).includes('experience-action-verb-0'))
}

{
  const feedback = evaluateCvFeedback(withExperience({ description: 'Vastasin palvelupisteestä 300 käyttäjälle.' }))
  check('"Vastasin", the usual active opener of a Finnish role, is not a weak phrase', !tipIdsForFirstExperience(feedback).includes('experience-weak-phrase-0'))
}

console.log('\nevaluateCvFeedback — the example CVs model good phrasing (1.6.51)\n')

{
  const flagged = []
  for (const exampleId of Object.keys(EXAMPLES)) {
    for (const locale of ['en', 'fi']) {
      const feedback = evaluateCvFeedback(await loadExampleCv(exampleId, locale), { locale })
      const ids = feedback.inlineTips.experienceItems.flat().map((item) => item.id)
        .filter((id) => id.startsWith('experience-weak-phrase') || id.startsWith('experience-action-verb'))
      if (ids.length) flagged.push(`${exampleId} (${locale}): ${ids.join(', ')}`)
    }
  }
  check('no example CV gets a weak-phrase or action-verb tip, in either language', flagged.length === 0, flagged.join('; '))
}

console.log('\ngetBulletHints — one bullet at a time (1.7.3)\n')
{
  const same = (label, actual, expected) =>
    check(label, JSON.stringify(actual) === JSON.stringify(expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
  const ids = (bullets, locale = 'en') => getBulletHints(bullets, { locale }).map((hints) => hints.map((hint) => hint.id))

  same('a strong bullet with a number gets nothing', ids(['Cut checkout latency by 40% by moving pricing to an edge cache.']), [[]])
  same('duty-list phrasing', ids(['Responsible for the design system used by 6 teams.']), [['weak-phrase']])
  same('a weak opener', ids(['I built the billing service for 300 customers.']), [['weak-opener']])
  same('weak phrasing outranks the opener, not both', ids(['Worked on the API for 3 years.']), [['weak-phrase']])
  same('filler', ids(['Successfully launched the app to 20,000 users.']), [['filler']])
  same('filler as a phrase', ids(['Built dashboards, reports, etc. for 5 teams.']), [['filler']])
  same('no number in a full sentence', ids(['Led the migration of the payments platform to TypeScript.']), [['no-number']])
  same('a short bullet gets no number hint', ids(['Led the migration.']), [[]])
  check('too long, with its word count', getBulletHints([`Built ${'a very long and winding bullet '.repeat(6)}for 4 teams.`])[0][0].message.startsWith('40 words'))
  same('the same opening verb as an earlier bullet', ids(['Led a team of 5.', 'Led the 2024 migration.', 'Built a CLI used by 40 engineers.']), [[], ['repeated-opener'], []])
  same('at most two hints a bullet', ids([`I successfully worked ${'without any figures at all '.repeat(6)}`]).map((list) => list.length), [2])
  same('a blank left in a bullet', ids(['Cut the monthly close from [__] days to [__].']), [['blank']])
  same('the blank hint comes first and replaces the number hint', ids(['Led the migration of the payments platform for [__] teams.']), [['blank']])
  same('Finnish: the blank hint copy', getBulletHints(['Lyhensin kuukausikirjanpidon [__] päivästä [__] päivään.'], { locale: 'fi' })[0][0].message, 'Täytä aukko: kohdassa on vielä [__].')
  same('English: the blank hint copy', getBulletHints(['Cut the monthly close from [__] days to [__].'])[0][0].message, 'Fill in the blank: [__] is still in this bullet.')
  {
    const blankJob = (hidden) => {
      const cv = createInitialCvData()
      cv.experience = [{ ...createEmptyExperience(), achievements: ['Cut close to [__] days.', 'Led [__] people.', 'Shipped it.'] }]
      if (hidden) cv.sectionItemVisibility = { experience: { '0': false } }
      return cv
    }
    same('countBlankBullets counts blanked bullets in a visible job', countBlankBullets(blankJob(false)), 2)
    same('countBlankBullets ignores a hidden job', countBlankBullets(blankJob(true)), 0)
    {
      const cv = blankJob(false)
      cv.sectionVisibility = { ...cv.sectionVisibility, experience: false }
      same('countBlankBullets ignores a switched-off Experience section', countBlankBullets(cv), 0)
    }
    same('countBlankBullets is 0 on an empty CV', countBlankBullets(createInitialCvData()), 0)
  }
  same('an empty bullet gets nothing', ids(['', '  ']), [[], []])
  same('Finnish: duty phrasing and filler', ids(['Vastuualueena asiakaspalvelu.', 'Rakensin onnistuneesti uuden varausjärjestelmän 3 kuukaudessa.'], 'fi'), [['weak-phrase'], ['filler']])
  same('Finnish: a weak opener', ids(['Olin mukana 12 hengen projektissa.'], 'fi'), [['weak-phrase']])
  same('Finnish: "Olen" opener', ids(['Olen tehnyt asiakkaille 40 kotikäyntiä viikossa.'], 'fi'), [['weak-opener']])
  same('Finnish: "Tein" is a fine opener', ids(['Tein 90+ asiakashaastattelua kolmessa segmentissä.'], 'fi'), [[]])
  check('hints follow the UI language', getBulletHints(['I led 3 teams.'], { locale: 'fi' })[0][0].message.startsWith('Aloita'))

  // The example CVs are what visitors copy from: their bullets should
  // model the advice, so none gets a phrasing hint.
  const flagged = []
  for (const exampleId of Object.keys(EXAMPLES)) {
    for (const locale of ['en', 'fi']) {
      const data = await loadExampleCv(exampleId, locale)
      data.experience.forEach((entry, entryIndex) => {
        getBulletHints(entry.achievements ?? [], { locale }).forEach((hints, bulletIndex) => {
          const phrasing = hints.filter((hint) => hint.id !== 'no-number')
          if (phrasing.length) flagged.push(`${exampleId} (${locale}) role ${entryIndex + 1} bullet ${bulletIndex + 1}: ${phrasing.map((hint) => hint.id).join(', ')}`)
        })
      })
    }
  }
  check('no example CV bullet gets a phrasing hint, in either language', flagged.length === 0, flagged.join('; '))
}

console.log()
if (failures > 0) {
  console.log(`${failures} check(s) failed.`)
  process.exit(1)
}

console.log('All CV feedback checks passed.')
