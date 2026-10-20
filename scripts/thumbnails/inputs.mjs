// What the pre-rendered thumbnails are made from, as one hash: every
// source file the harness reaches through relative imports (JS/JSX and the
// CSS @import chain from src/index.css). app-shell.css is the exception:
// it's mostly page chrome that changes often and never shows in a
// thumbnail, so only its rules about the CV preview itself count (selectors
// naming preview-document, the thumbnail frame, data-cv-heading,
// data-export or the tpl- primitives).
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

const PREVIEW_SELECTOR = /preview-document|template-gallery__thumb|data-cv-heading|data-export|tpl-/

function resolveImport(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier)
  for (const candidate of [base, `${base}.js`, `${base}.jsx`, `${base}.mjs`, `${base}/index.js`]) {
    if (existsSync(candidate) && !candidate.endsWith('/')) {
      try { readFileSync(candidate); return candidate } catch { /* a directory */ }
    }
  }
  return null
}

function importsOf(file, text) {
  const specifiers = file.endsWith('.css')
    ? [...text.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)].map((m) => m[1])
    : [...text.matchAll(/(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g)]
        .map((m) => m[1] ?? m[2] ?? m[3])
  return specifiers.filter((s) => s.startsWith('.'))
}

function previewRulesOnly(css) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => PREVIEW_SELECTOR.test(m[1]))
    .map((m) => `${m[1].trim()}{${m[2].trim()}}`)
    .join('\n')
}

export function collectThumbnailInputs(rootDir) {
  const entry = resolve(rootDir, 'scripts/thumbnails/harness.jsx')
  const seen = new Set()
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()
    if (seen.has(file)) continue
    seen.add(file)
    const text = readFileSync(file, 'utf8')
    for (const specifier of importsOf(file, text)) {
      const target = resolveImport(file, specifier)
      if (target && !target.includes('node_modules')) queue.push(target)
    }
  }
  return [...seen].map((file) => relative(rootDir, file)).sort()
}

export function computeThumbnailInputsHash(rootDir) {
  const hash = createHash('sha256')
  for (const file of collectThumbnailInputs(rootDir)) {
    const text = readFileSync(resolve(rootDir, file), 'utf8')
    hash.update(`${file}\n`)
    hash.update(file.endsWith('app-shell.css') ? previewRulesOnly(text) : text)
  }
  return hash.digest('hex')
}
