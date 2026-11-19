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

const { blankNumbers, rankIdeaRoles, loadBulletIdeas } = await importSrc('utils/bulletIdeas.js')
const { EXAMPLES } = await importSrc('utils/exampleCvs.js')
const { BULLET_BLANK } = await importSrc('utils/cvFeedback.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

// Words that may keep a digit after blanking: tech and standard names only.
// A token covers the word itself (HTML5) or a number right after it (WCAG 2.2).
const KEPT_TOKENS = ['WCAG', 'ISO', 'SOC']

console.log('\nblankNumbers\n')
const B = BULLET_BLANK
check('blank marker is [__]', B === '[__]', B)
const blankCases = [
  ['Cut the monthly close from 10 days to 5 by automating reconciliations.', 'Cut the monthly close from [__] days to [__] by automating reconciliations.'],
  ['Raised NPS to 4.6/5 across 25+ accounts.', 'Raised NPS to [__] across [__] accounts.'],
  ['Grew revenue by 35% to €1.2M in 2023.', 'Grew revenue by [__] to [__] in [__].'],
  ['Kasvatin myyntiä 35 % ja 1,2 M€ vuonna 2023.', 'Kasvatin myyntiä [__] ja [__] vuonna [__].'],
  ['Käsittelin 1 200 laskua kuukaudessa.', 'Käsittelin [__] laskua kuukaudessa.'],
  ['Made checkout WCAG 2.1 AA compliant and ISO 27001 ready in Q3 using HTML5 and S3.', 'Made checkout WCAG 2.1 AA compliant and ISO 27001 ready in Q3 using HTML5 and S3.'],
  ['Lifted NPS 45 in FY 2023 for AWS 3 regions.', 'Lifted NPS [__] in FY [__] for AWS [__] regions.'],
  ['Met WCAG 2.1, ISO 27001 and SOC 2.', 'Met WCAG 2.1, ISO 27001 and SOC 2.'],
  ['Raised 5 M in funding.', 'Raised [__] in funding.'],
  ['Cut build time 3x.', 'Cut build time [__].'],
]
for (const [input, expected] of blankCases) {
  const actual = blankNumbers(input)
  check(input, actual === expected, `got: ${actual}`)
}

console.log('\nrankIdeaRoles and loadBulletIdeas\n')
const ideas = { en: await loadBulletIdeas('en'), fi: await loadBulletIdeas('fi') }
const rank = (text, locale) => rankIdeaRoles(text, ideas[locale], locale)
check('en Senior Frontend Developer -> frontend-developer', rank('Senior Frontend Developer', 'en')[0].roleId === 'frontend-developer')
check('en Staff nurse -> nurse', rank('Staff nurse', 'en')[0].roleId === 'nurse')
check('fi Sairaanhoitaja -> nurse', rank('Sairaanhoitaja', 'fi')[0].roleId === 'nurse')
check('fi Frontend-kehittäjänä -> frontend-developer', rank('Frontend-kehittäjänä', 'fi')[0].roleId === 'frontend-developer')
check('fi Ohjelmistokehittäjä -> a developer role', ['frontend-developer', 'junior-developer'].includes(rank('Ohjelmistokehittäjä', 'fi')[0].roleId), rank('Ohjelmistokehittäjä', 'fi')[0].roleId)
check('fi Lähihoitaja -> nurse', rank('Lähihoitaja', 'fi')[0].roleId === 'nurse', rank('Lähihoitaja', 'fi')[0].roleId)
check('fi Projektipäällikkö -> project-manager over other -päällikkö roles', rank('Projektipäällikkö', 'fi')[0].roleId === 'project-manager', rank('Projektipäällikkö', 'fi')[0].roleId)
check('fi a short shared ending ("-ja") matches nothing', rank('Siivooja', 'fi').every((r) => r.score === 0), rank('Siivooja', 'fi').filter((r) => r.score).map((r) => r.roleId).join(','))
check('en shared suffixes do not match ("Public relations")', rank('Public relations', 'en').every((r) => r.score === 0), rank('Public relations', 'en').filter((r) => r.score).map((r) => r.roleId).join(','))
check('Florist scores 0 everywhere', rank('Florist', 'en').every((r) => r.score === 0))
check('empty text scores 0 everywhere', rank('', 'en').every((r) => r.score === 0))
check('ranking keeps every role', rank('Nurse', 'en').length === ideas.en.length)
{
  const ranked = rank('Frontend developer', 'en')
  const scores = ranked.map((r) => r.score)
  check('scores are non-increasing', scores.every((s, i) => i === 0 || scores[i - 1] >= s), scores.join(','))
}

const ids = Object.keys(EXAMPLES)
for (const locale of ['en', 'fi']) {
  check(`${locale}: one role per registered example`, ideas[locale].length === ids.length && ids.every((id) => ideas[locale].some((r) => r.roleId === id)))
}
for (const id of ids) {
  const module = await EXAMPLES[id].load()
  for (const locale of ['en', 'fi']) {
    const expected = []
    for (const job of module.default[locale].experience || []) {
      for (const bullet of job.achievements || []) {
        const blanked = blankNumbers(bullet)
        if (blanked.trim() && !expected.includes(blanked)) expected.push(blanked)
      }
    }
    const role = ideas[locale].find((r) => r.roleId === id)
    check(`${id} ${locale}: bullets are the blanked achievements`, JSON.stringify(role.bullets) === JSON.stringify(expected))
  }
  const en = ideas.en.find((r) => r.roleId === id)
  const fi = ideas.fi.find((r) => r.roleId === id)
  check(`${id}: en and fi bullet counts match`, en.bullets.length === fi.bullets.length, `${en.bullets.length} vs ${fi.bullets.length}`)
}
// A figure written as a word escapes blankNumbers, so an idea would carry
// the example person's fact. Closed lists, used only to guard the example
// content: ordinals and determiners ("first", "one client", "yhdessä") are
// not figures and stay out.
const NUMBER_WORDS = {
  en: /\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|dozens?|half|halved|twice|doubled|tripled)\b/iu,
  fi: /(?<!\p{L})(?:kaksi|kahde\p{L}*|kahte\p{L}*|kolme\p{L}*|kolmi\p{L}*|neljä(?!nnes)\p{L}*|viisi|viide\p{L}*|viitt\p{L}*|kuusi\p{L}*|kuude\p{L}*|kuutt\p{L}*|seitsem\p{L}*|yhdeksä\p{L}*|kymmen\p{L}*|puoli\p{L}*|puole\p{L}*|puolitt\p{L}*|puolet)(?!\p{L})/iu,
}
const blankCount = (text) => text.split(BULLET_BLANK).length - 1
for (const id of ids) {
  const en = ideas.en.find((r) => r.roleId === id)
  const fi = ideas.fi.find((r) => r.roleId === id)
  en.bullets.forEach((bullet, index) => {
    const twin = fi.bullets[index] ?? ''
    check(`${id} #${index + 1}: en and fi blank the same figures`, blankCount(bullet) === blankCount(twin), `en ${blankCount(bullet)}: ${bullet}\n        fi ${blankCount(twin)}: ${twin}`)
  })
}
for (const locale of ['en', 'fi']) {
  for (const role of ideas[locale]) {
    for (const bullet of role.bullets) {
      const word = bullet.match(NUMBER_WORDS[locale])
      check(`${role.roleId} ${locale}: no figure written as a word`, !word, `${word?.[0]} in: ${bullet}`)
    }
  }
}
check('number-word guard catches en "all three storefronts"', NUMBER_WORDS.en.test('used across all three storefronts'))
check('number-word guard catches fi "kolminkertaiseksi"', NUMBER_WORDS.fi.test('sitoutumisen kolminkertaiseksi'))
check('number-word guard catches fi "Kuusiosainen"', NUMBER_WORDS.fi.test('Kuusiosainen selvitys'))
check('number-word guard ignores fi "neljännesvuosibudjetin"', !NUMBER_WORDS.fi.test('Pidin neljännesvuosibudjetin toteuman'))
check('number-word guard ignores en "first" and "one client"', !NUMBER_WORDS.en.test('Launched the first program for one client'))

for (const locale of ['en', 'fi']) {
  for (const role of ideas[locale]) {
    for (const bullet of role.bullets) {
      let rest = bullet
      for (const token of KEPT_TOKENS) rest = rest.replaceAll(new RegExp(`${token}\\s+\\S*\\d\\S*`, 'g'), '').replaceAll(token, '')
      const bad = rest.split(/\s+/).filter((word) => /\d/.test(word))
      check(`${role.roleId} ${locale}: no stray digits`, bad.length === 0, `${bad.join(' ')} in: ${bullet}`)
    }
  }
}

console.log(failures ? `\n${failures} check(s) failed\n` : '\nAll bullet idea checks passed\n')
process.exit(failures ? 1 : 0)
