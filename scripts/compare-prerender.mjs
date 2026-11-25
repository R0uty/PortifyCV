// Compares two pre-render outputs (dist/prerendered/) page by page, for the
// 1.7.13 move of the interface text into translation files: the text must
// not change. React's `<!-- -->` text separators and whitespace between tags
// are ignored (joining fragments into one string with a placeholder changes
// those and nothing else); any other difference fails.
//
//   node scripts/compare-prerender.mjs <baselineDir> <dir>
//
// Exits 1 on any differing or missing page.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

const [baselineArg, currentArg] = process.argv.slice(2)
if (!baselineArg || !currentArg) {
  console.error('Usage: node scripts/compare-prerender.mjs <baselineDir> <dir>')
  process.exit(2)
}
const baselineDir = resolve(baselineArg)
const currentDir = resolve(currentArg)
for (const dir of [baselineDir, currentDir]) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`Not a directory: ${dir}`)
    process.exit(2)
  }
}

function htmlFiles(dir) {
  const found = []
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name)
    if (statSync(path).isDirectory()) found.push(...htmlFiles(path))
    else if (name.endsWith('.html')) found.push(path)
  }
  return found
}

const normalise = (html) => html.replaceAll('<!-- -->', '').replace(/>\s+</g, '><').trim()

const pages = new Set([baselineDir, currentDir].flatMap((dir) =>
  htmlFiles(dir).map((path) => relative(dir, path).split(sep).join('/'))))

const WINDOW = 200
let differing = 0
for (const page of [...pages].sort()) {
  const baselinePath = resolve(baselineDir, page)
  const currentPath = resolve(currentDir, page)
  if (!existsSync(baselinePath) || !existsSync(currentPath)) {
    differing += 1
    console.log(`MISSING  ${page} (not in ${existsSync(baselinePath) ? currentArg : baselineArg})`)
    continue
  }
  const before = normalise(readFileSync(baselinePath, 'utf8'))
  const after = normalise(readFileSync(currentPath, 'utf8'))
  if (before === after) continue
  differing += 1
  let index = 0
  while (index < before.length && before[index] === after[index]) index += 1
  const start = Math.max(0, index - WINDOW / 2)
  console.log(`DIFF     ${page} (first difference at character ${index})`)
  console.log(`  before: …${before.slice(start, start + WINDOW)}…`)
  console.log(`  after:  …${after.slice(start, start + WINDOW)}…`)
}

if (differing > 0) {
  console.log(`\n${differing} of ${pages.size} page(s) differ.`)
  process.exitCode = 1
} else {
  console.log(`All ${pages.size} page(s) match.`)
}
