// Regression checks for the template style-variant registry
// (src/utils/templateVariants.js) against each template's stylesheet
// (src/styles/templates/<name>.css). Framework-free, run directly:
//
//   node scripts/check-template-variants.mjs
//
// Exits non-zero if any check fails.

import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
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

const rootDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..')
const importSrc = (relativePath) => import(pathToFileURL(resolvePath(rootDir, 'src', relativePath)).href)

let failures = 0
function check(label, passed, detail = '') {
  if (!passed) failures += 1
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!passed && detail) console.log(`        ${detail}`)
}

const {
  DEFAULT_STYLE_VARIANT_ID,
  TEMPLATE_VARIANTS,
  getTemplateVariants,
  getTemplateVariant,
  resolveStyleVariantId,
  getPaletteVariables,
  getVariantPaletteStyle,
  getVariantSwatches,
  isStyleVariantModified,
} = await importSrc('utils/templateVariants.js')
const { cvTemplates, getTemplateAccent } = await importSrc('utils/cvTemplates.js')
const { CV_FONT_OPTIONS } = await importSrc('utils/cvFonts.js')
const { ACCENT_SWATCH_SETS } = await importSrc('utils/templateAccents.js')

// Where each template's palette defaults are declared: the root rule of
// its stylesheet. `null` = no stylesheet yet, in which case variant
// #1's palette must be empty (no template is null today; the branch is kept
// in case a new template lands before its stylesheet).
const CSS_SOURCES = {
  minimal: { file: 'minimal.css', root: '.min-doc' },
  developer: { file: 'developer.css', root: '.dev-showcase' },
  creative: { file: 'creative.css', root: '.creative-showcase' },
  modern: { file: 'modern.css', root: '.modern-showcase' },
  executive: { file: 'executive.css', root: '.executive-showcase' },
  timeline: { file: 'timeline.css', root: '.timeline-showcase' },
  graduate: { file: 'graduate.css', root: '.graduate-showcase' },
  compact: { file: 'compact.css', root: '.compact-showcase' },
  portfolio: { file: 'portfolio.css', root: '.portfolio-showcase' },
  techExec: { file: 'techExec.css', root: '.tech-exec-showcase' },
  classicProfessional: { file: 'classicProfessional.css', root: '.classic-professional-showcase' },
  navyProfessional: { file: 'navyProfessional.css', root: '.navy-professional-showcase' },
  modernOrange: { file: 'modernOrange.css', root: '.modern-orange-showcase' },
  colorfulCompact: { file: 'colorfulCompact.css', root: '.colorful-compact-showcase' },
  quadrant: { file: 'quadrant.css', root: '.quadrant-showcase' },
  editorial: { file: 'editorial.css', root: '.editorial-showcase' },
  portrait: { file: 'portrait.css', root: '.portrait-showcase' },
  european: { file: 'european.css', root: '.european-showcase' },
}

// Known non-colour custom properties declared on a root rule (spacing,
// font stacks). Anything else that isn't a plain hex/rgba colour fails the
// check, so a color-mix()/oklch() default can't slip into a root unnoticed.
const NON_COLOUR_ROOT_VARIABLES = {
  'compact.css': ['--cp-header-pad-top', '--cp-section-gap', '--cp-element-gap', '--cp-bullet-gap'],
  'classicProfessional.css': ['--cp-serif'],
}

// Templates whose two designed variants have landed (Part 2 adds each
// batch here). Every other template must still have exactly variant #1.
// Task 14 deletes this set and requires 3 everywhere.
const TEMPLATES_WITH_DESIGNED_VARIANTS = new Set([
  'minimal', 'developer', 'modern', 'classicProfessional', 'navyProfessional', 'colorfulCompact',
  'creative', 'executive', 'timeline', 'graduate', 'compact', 'portfolio',
  'techExec', 'modernOrange', 'quadrant', 'editorial', 'portrait', 'european',
])

const COLOUR_VALUE = /^(#[0-9a-f]{3}|#[0-9a-f]{6}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const ID = /^[a-z][a-zA-Z0-9]*$/

function readStylesheet(file) {
  return readFileSync(resolvePath(rootDir, 'src/styles/templates', file), 'utf8')
}

// Colour custom properties declared directly in the root rule (the first
// `<root> {` at column 0), excluding the shared --tpl-* tokens.
function readRootColourVariables({ file, root }) {
  const css = readStylesheet(file)
  const start = css.indexOf(`\n${root} {\n`)
  if (start === -1) throw new Error(`${file}: no "${root} {" rule at column 0`)
  const end = css.indexOf('\n}', start + 1)
  const variables = {}
  for (const [, name, value] of css.slice(start, end).matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!name.startsWith('--tpl-') && COLOUR_VALUE.test(value.trim())) variables[name] = value.trim()
  }
  return variables
}

function readRootNonColourVariables({ file, root }) {
  const css = readStylesheet(file)
  const start = css.indexOf(`\n${root} {\n`)
  const end = css.indexOf('\n}', start + 1)
  const names = []
  for (const [, name, value] of css.slice(start, end).matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!name.startsWith('--tpl-') && !COLOUR_VALUE.test(value.trim())) names.push(name)
  }
  return names
}

function toRgb(value, over = [255, 255, 255]) {
  const hex = value.match(HEX)
  if (hex) {
    const full = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join('') : hex[1]
    return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16))
  }
  const [r, g, b, a = 1] = value.match(/\(([^)]*)\)/)[1].split(',').map(Number)
  return [r, g, b].map((channel, index) => Math.round(channel * a + over[index] * (1 - a)))
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground, background) {
  const bg = toRgb(background)
  const [light, dark] = [luminance(toRgb(foreground, bg)), luminance(bg)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function resolveColour(ref, variant) {
  if (ref === '--tpl-accent') return variant.accent
  if (ref.startsWith('--')) return variant.palette[ref]
  return ref
}

const fontIds = new Set(CV_FONT_OPTIONS.map((font) => font.id))
const templateIds = cvTemplates.map((template) => template.id)

console.log('\nRegistry shape\n')

check('every template has a registry entry, and nothing else does',
  JSON.stringify([...templateIds].sort()) === JSON.stringify(Object.keys(TEMPLATE_VARIANTS).sort()),
  `templates: ${templateIds.join(',')} | registry: ${Object.keys(TEMPLATE_VARIANTS).join(',')}`)

for (const templateId of templateIds) {
  const entry = TEMPLATE_VARIANTS[templateId]
  if (!entry) continue
  const variants = entry.variants
  const expectedCount = TEMPLATES_WITH_DESIGNED_VARIANTS.has(templateId) ? 3 : 1
  const keys = Object.keys(variants[0]?.palette ?? {}).sort()
  const accentConfig = getTemplateAccent(templateId)

  check(`${templateId}: exactly ${expectedCount} variant(s)`, variants.length === expectedCount, `has ${variants.length}`)
  check(`${templateId}: variant #1 id is '${DEFAULT_STYLE_VARIANT_ID}'`, variants[0]?.id === DEFAULT_STYLE_VARIANT_ID)
  check(`${templateId}: ids are unique and well-formed`,
    new Set(variants.map((v) => v.id)).size === variants.length && variants.every((v) => ID.test(v.id)))
  for (const lang of ['en', 'fi']) {
    check(`${templateId}: ${lang} labels are non-empty and unique`,
      variants.every((v) => typeof v.label?.[lang] === 'string' && v.label[lang].trim())
        && new Set(variants.map((v) => v.label[lang])).size === variants.length)
  }
  check(`${templateId}: variant #1 uses Inter, no headings colour, the registry accent`,
    variants[0].fontId === 'inter' && variants[0].headingColor === ''
      && variants[0].accent === (accentConfig?.default ?? null),
    JSON.stringify({ fontId: variants[0].fontId, headingColor: variants[0].headingColor, accent: variants[0].accent }))
  check(`${templateId}: swatchVariables are palette variables`,
    entry.swatchVariables.every((name) => keys.includes(name)), entry.swatchVariables.join(','))

  for (const variant of variants) {
    const where = `${templateId}/${variant.id}`
    check(`${where}: sets exactly the template's palette variables`,
      JSON.stringify(Object.keys(variant.palette).sort()) === JSON.stringify(keys))
    check(`${where}: palette values are hex/rgba only (no color-mix)`,
      Object.values(variant.palette).every((value) => COLOUR_VALUE.test(value) && !value.includes('color-mix(')),
      JSON.stringify(variant.palette))
    check(`${where}: fontId exists in CV_FONT_OPTIONS`, fontIds.has(variant.fontId), variant.fontId)
    check(`${where}: headingColor is '' or a hex`, variant.headingColor === '' || HEX.test(variant.headingColor))
    check(`${where}: accent is null exactly when the template has no accent`,
      (variant.accent === null) === (accentConfig === null))
    if (variant.id !== DEFAULT_STYLE_VARIANT_ID && variant.accent) {
      check(`${where}: accent is one of the template's swatches`,
        ACCENT_SWATCH_SETS[accentConfig.swatchSet].some((swatch) => swatch.color === variant.accent.toLowerCase()),
        variant.accent)
    }
  }
}

console.log('\nVariant #1 matches the stylesheet defaults\n')

for (const templateId of templateIds) {
  const source = CSS_SOURCES[templateId]
  const palette = TEMPLATE_VARIANTS[templateId]?.variants[0]?.palette ?? {}
  if (source === null) {
    check(`${templateId}: no stylesheet yet, so variant #1's palette is empty`, Object.keys(palette).length === 0)
    continue
  }
  const declared = readRootColourVariables(source)
  check(`${templateId}: palette variables = colour variables on ${source.root}`,
    JSON.stringify(Object.keys(palette).sort()) === JSON.stringify(Object.keys(declared).sort()),
    `registry: ${Object.keys(palette).sort().join(',')} | css: ${Object.keys(declared).sort().join(',')}`)
  for (const [name, value] of Object.entries(declared)) {
    check(`${templateId}: ${name} is '${value}' in both places`, palette[name] === value, `registry has '${palette[name]}'`)
  }
  const allowed = NON_COLOUR_ROOT_VARIABLES[source.file] ?? []
  const unexpected = readRootNonColourVariables(source).filter((name) => !allowed.includes(name))
  check(`${templateId}: every non-colour root variable is on the allowlist (no color-mix()/oklch() defaults)`,
    unexpected.length === 0, `not hex/rgba and not allowlisted: ${unexpected.join(', ')}`)
  // An inline palette variable silently overrides any second declaration
  // (a modifier class, a media query), so each must be declared once.
  const css = readStylesheet(source.file)
  for (const name of Object.keys(declared)) {
    const count = [...css.matchAll(new RegExp(`^\\s*${name}\\s*:`, 'gm'))].length
    check(`${templateId}: ${name} is declared exactly once in ${source.file}`, count === 1, `declared ${count} times`)
  }
}

console.log('\nContrast\n')

for (const templateId of templateIds) {
  const entry = TEMPLATE_VARIANTS[templateId]
  if (!entry) continue
  const usedExceptions = new Set()
  for (const variant of entry.variants) {
    for (const pair of entry.textPairs) {
      const foreground = resolveColour(pair.foreground, variant)
      const background = resolveColour(pair.background, variant)
      const label = `${templateId}/${variant.id}: ${pair.foreground} on ${pair.background} (${pair.size})`
      if (!foreground || !background || !HEX.test(background)) {
        check(label, false, `unresolvable: ${foreground} on ${background} (background must be an opaque hex)`)
        continue
      }
      const ratio = contrastRatio(foreground, background)
      const floor = pair.size === 'large' ? 3 : 4.5
      const exception = variant.id === DEFAULT_STYLE_VARIANT_ID
        ? entry.defaultContrastExceptions.find((e) => e.foreground === pair.foreground && e.background === pair.background)
        : null
      if (exception) {
        usedExceptions.add(exception)
        check(`${label}: known exception still below ${floor}:1 (${ratio.toFixed(2)}) — remove it if it now passes`,
          ratio < floor && ratio.toFixed(2) === exception.ratio, `measured ${ratio.toFixed(2)}, recorded ${exception.ratio}`)
      } else {
        check(`${label}: ${ratio.toFixed(2)} >= ${floor}`, ratio >= floor)
      }
    }
  }
  for (const exception of entry.defaultContrastExceptions) {
    check(`${templateId}: exception ${exception.foreground} on ${exception.background} matches a declared pair`,
      usedExceptions.has(exception))
  }
}

console.log('\nHelpers\n')

{
  const first = getTemplateVariants('developer')[0]
  check('getTemplateVariant falls back to variant #1 for an unknown id',
    getTemplateVariant('developer', 'no-such-look') === first)
  check('getTemplateVariant is null for an unknown template', getTemplateVariant('no-such-template', 'default') === null)
  check('resolveStyleVariantId: nothing stored → default', resolveStyleVariantId({}, 'developer') === 'default')
  check('resolveStyleVariantId: undefined formData → default', resolveStyleVariantId(undefined, 'developer') === 'default')
  check('resolveStyleVariantId: unknown stored id → default',
    resolveStyleVariantId({ styleVariantByTemplate: { developer: 'fromTheFuture' } }, 'developer') === 'default')
  check('getPaletteVariables lists variant #1 palette keys',
    JSON.stringify(getPaletteVariables('developer')) === JSON.stringify(Object.keys(first.palette)))
  const style = getVariantPaletteStyle('developer', 'default')
  style['--mutated'] = 'x'
  check('getVariantPaletteStyle returns a fresh copy', !('--mutated' in first.palette))
  check('getVariantPaletteStyle is {} for an unknown template',
    JSON.stringify(getVariantPaletteStyle('no-such-template', 'default')) === '{}')
  check('getVariantSwatches puts the accent first',
    getVariantSwatches('creative', getTemplateVariant('creative', 'default'))[0] === '#e2572a')
  check('getVariantSwatches returns at most 4 colours',
    templateIds.every((id) => getTemplateVariants(id).every((v) => getVariantSwatches(id, v).length <= 4)))

  const base = { templateId: 'creative', variantId: 'default', templateAccentColors: {}, cvFontId: 'inter', cvHeadingColor: '' }
  check('isStyleVariantModified: untouched look → false', isStyleVariantModified(base) === false)
  check('isStyleVariantModified: other font → true', isStyleVariantModified({ ...base, cvFontId: 'georgia' }) === true)
  check('isStyleVariantModified: headings colour → true', isStyleVariantModified({ ...base, cvHeadingColor: '#1e40af' }) === true)
  check('isStyleVariantModified: other accent → true',
    isStyleVariantModified({ ...base, templateAccentColors: { creative: '#7c3aed' } }) === true)
  check('isStyleVariantModified: accent differs only in case → false',
    isStyleVariantModified({ ...base, templateAccentColors: { creative: '#E2572A' } }) === false)
  check('isStyleVariantModified: accent-less template ignores accents',
    isStyleVariantModified({ ...base, templateId: 'developer', templateAccentColors: { developer: '#123456' } }) === false)
}

console.log(failures === 0 ? '\nAll template-variant checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
