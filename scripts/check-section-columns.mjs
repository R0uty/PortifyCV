// Regression checks for src/utils/sectionColumns.js — the rules for moving
// a section between a two-column template's main column and sidebar.
// Framework-free, run directly:
//
//   node scripts/check-section-columns.mjs

import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

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

const columns = await importSrc('utils/sectionColumns.js')

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

// Fixtures, not the real registry: these checks pin the RULES, and must not
// start failing because a real template's section lists were edited.
const split = {
  id: 'fixtureSplit',
  layout: 'split',
  columnMoves: true,
  primarySections: ['about', 'experience', 'projects', 'education'],
  secondarySections: ['skills', 'links', 'languages'],
}
const unflagged = { ...split, id: 'fixtureUnflagged', columnMoves: undefined }
const stacked = { ...split, id: 'fixtureStacked', layout: 'stacked', secondarySections: [] }

console.log('\nsectionColumns: canMoveSection\n')
check('a sidebar section can move to main', columns.canMoveSection(split, 'skills') === true)
check('a proven main section can move to the sidebar', columns.canMoveSection(split, 'education') === true)
check('projects is in the proven set', columns.canMoveSection(split, 'projects') === true)
check('experience cannot move', columns.canMoveSection(split, 'experience') === false)
check('about cannot move', columns.canMoveSection(split, 'about') === false)
check('a section the template does not support cannot move', columns.canMoveSection(split, 'interests') === false)
check('nothing moves on an unflagged template', columns.canMoveSection(unflagged, 'skills') === false)
check('nothing moves on a stacked template', columns.canMoveSection(stacked, 'education') === false)

console.log('\nsectionColumns: setSectionColumn\n')
{
  const moved = columns.setSectionColumn({}, split, 'skills', 'main')
  check('moving away from home stores an override',
    JSON.stringify(moved) === JSON.stringify({ fixtureSplit: { skills: 'main' } }), JSON.stringify(moved))

  const back = columns.setSectionColumn(moved, split, 'skills', 'sidebar')
  check('moving home deletes the entry and the empty template map',
    JSON.stringify(back) === '{}', JSON.stringify(back))

  const other = { otherTemplate: { links: 'main' } }
  const kept = columns.setSectionColumn(other, split, 'education', 'sidebar')
  check('other templates\' overrides are kept',
    JSON.stringify(kept) === JSON.stringify({ otherTemplate: { links: 'main' }, fixtureSplit: { education: 'sidebar' } }),
    JSON.stringify(kept))

  check('a non-object map is treated as empty',
    JSON.stringify(columns.setSectionColumn(null, split, 'skills', 'main')) === JSON.stringify({ fixtureSplit: { skills: 'main' } }))
}

console.log('\nsectionColumns: getEffectiveTemplateConfig\n')
{
  const none = columns.getEffectiveTemplateConfig(split, {})
  check('no overrides keeps both columns',
    JSON.stringify(none.primarySections) === JSON.stringify(split.primarySections) &&
    JSON.stringify(none.secondarySections) === JSON.stringify(split.secondarySections))
  check('defaultSecondarySections is always attached',
    JSON.stringify(none.defaultSecondarySections) === JSON.stringify(split.secondarySections))
  check('baseConfig points at the input', none.baseConfig === split)

  const moved = columns.getEffectiveTemplateConfig(split, { fixtureSplit: { skills: 'main', education: 'sidebar' } })
  check('skills moves to main, keeping combined relative order',
    JSON.stringify(moved.primarySections) === JSON.stringify(['about', 'experience', 'projects', 'skills']),
    JSON.stringify(moved.primarySections))
  check('education moves to the sidebar, keeping combined relative order',
    JSON.stringify(moved.secondarySections) === JSON.stringify(['education', 'links', 'languages']),
    JSON.stringify(moved.secondarySections))
  check('the base config is not mutated',
    JSON.stringify(split.primarySections) === JSON.stringify(['about', 'experience', 'projects', 'education']))

  const junk = columns.getEffectiveTemplateConfig(split, {
    fixtureSplit: { experience: 'sidebar', interests: 'main', skills: 'left', links: 'main' },
  })
  check('disallowed, unsupported and invalid entries are ignored; valid ones apply',
    JSON.stringify(junk.primarySections) === JSON.stringify(['about', 'experience', 'projects', 'education', 'links']) &&
    JSON.stringify(junk.secondarySections) === JSON.stringify(['skills', 'languages']),
    `${JSON.stringify(junk.primarySections)} / ${JSON.stringify(junk.secondarySections)}`)

  const foreign = columns.getEffectiveTemplateConfig(split, { someOtherTemplate: { skills: 'main' } })
  check('another template\'s overrides are ignored',
    JSON.stringify(foreign.secondarySections) === JSON.stringify(split.secondarySections))

  const off = columns.getEffectiveTemplateConfig(unflagged, { fixtureUnflagged: { skills: 'main' } })
  check('overrides are ignored while a template is unflagged',
    JSON.stringify(off.secondarySections) === JSON.stringify(split.secondarySections))

  check('a malformed overrides value is ignored',
    JSON.stringify(columns.getEffectiveTemplateConfig(split, 'nope').secondarySections) === JSON.stringify(split.secondarySections))
}

console.log('\nsectionColumns: getSectionColumn\n')
{
  const moved = columns.getEffectiveTemplateConfig(split, { fixtureSplit: { skills: 'main' } })
  check('reports main for a moved section', columns.getSectionColumn(moved, 'skills') === 'main')
  check('reports sidebar for a sidebar section', columns.getSectionColumn(moved, 'links') === 'sidebar')
  check('reports null for an unsupported section', columns.getSectionColumn(moved, 'interests') === null)
}

console.log(failures === 0 ? '\nAll section-columns checks passed.' : `\n${failures} section-columns check(s) FAILED.`)
process.exit(failures === 0 ? 0 : 1)
