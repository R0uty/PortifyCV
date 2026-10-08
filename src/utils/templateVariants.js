// Template style variants (Phase 3, v1.6). Each template has an ordered
// list of curated looks; variant #1 (`id: 'default'`) is today's look,
// unchanged. A variant is:
//   - `palette`: values for the template's OWN local CSS variables
//     (`--dev-*`, `--np-*` …), declared with their defaults on the
//     template's root rule in src/styles/templates/<name>.css. CVPreview
//     sets them as inline CSS variables on the Showcase root.
//   - `accent`: the starting value of the existing per-template accent
//     picker (`null` for a template without one).
//   - `fontId`: one of CV_FONT_OPTIONS (utils/cvFonts.js).
//   - `headingColor`: a hex, or '' for the template's own heading colour.
// Never layout or spacing. Values are hex/rgba() only — never color-mix()
// or oklch(), which the html2canvas PDF export can't rasterize
// (docs/template-design-system.md §8).
//
// Variant ids are PERMANENT once shipped (share links store them under
// `va`, see shareLinks.js); labels may change. Variant #1 is never stored
// in the CV — choosing it deletes the template's entry.
//
// `scripts/check-template-variants.mjs` enforces: variant #1's palette
// equals the stylesheet defaults character for character, every variant
// sets exactly the same variables, contrast of every `textPairs` entry,
// valid fonts, and accents drawn from the template's swatch set.
//
// Relative imports here carry an explicit `.js` (unlike most of src/) so
// Playwright specs can import this module under plain Node ESM.
import { getTemplateAccent, resolveTemplateAccent } from './cvTemplates.js'
import { DEFAULT_CV_FONT_ID } from './cvFonts.js'

export const DEFAULT_STYLE_VARIANT_ID = 'default'

const ORIGINAL_LABEL = { en: 'Original', fi: 'Alkuperäinen' }

function original(templateId, palette) {
  return {
    id: DEFAULT_STYLE_VARIANT_ID,
    label: ORIGINAL_LABEL,
    palette,
    accent: getTemplateAccent(templateId)?.default ?? null,
    fontId: DEFAULT_CV_FONT_ID,
    headingColor: '',
  }
}


// A designed variant (#2, #3). `accent` is null for a template without an
// accent picker, else one of its swatches.
function look({ id, label, fontId, palette, accent = null, headingColor = '' }) {
  return { id, label, palette, accent, fontId, headingColor }
}

const ACCENT = '--tpl-accent'

export const TEMPLATE_VARIANTS = {
  minimal: {
    swatchVariables: ['--min-accent-ink', '--min-accent-line', '--min-ink'],
    textPairs: [
      { foreground: '--min-ink', background: '--min-bg', size: 'body' },
      { foreground: '--min-muted', background: '--min-bg', size: 'body' },
      { foreground: '--min-accent-ink', background: '--min-bg', size: 'body' },
      { foreground: '--min-accent-ink', background: '--min-accent-soft', size: 'body' },
      { foreground: '--min-accent-text', background: '--min-bg', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--min-accent-text', background: '--min-bg', ratio: '3.19', reason: 'Amber-600 project names on white, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('minimal', {
        '--min-ink': '#111827',
        '--min-muted': '#6b7280',
        '--min-accent-ink': '#b45309',
        '--min-accent-text': '#d97706',
        '--min-accent-soft': '#fffbeb',
        '--min-accent-line': '#fde68a',
        '--min-header-line': '#fef3c7',
        '--min-rule': '#fcd34d',
        '--min-border': '#e5e7eb',
        '--min-bg': '#ffffff',
      }),
      look({
        id: 'slate',
        label: { en: 'Slate', fi: 'Liuske' },
        fontId: 'helvetica',
        palette: {
          '--min-ink': '#0f172a',
          '--min-muted': '#64748b',
          '--min-accent-ink': '#334155',
          '--min-accent-text': '#475569',
          '--min-accent-soft': '#f1f5f9',
          '--min-accent-line': '#cbd5e1',
          '--min-header-line': '#e2e8f0',
          '--min-rule': '#94a3b8',
          '--min-border': '#e2e8f0',
          '--min-bg': '#ffffff',
        },
      }),
      look({
        id: 'forest',
        label: { en: 'Forest', fi: 'Metsä' },
        fontId: 'georgia',
        palette: {
          '--min-ink': '#1c1917',
          '--min-muted': '#57534e',
          '--min-accent-ink': '#166534',
          '--min-accent-text': '#15803d',
          '--min-accent-soft': '#f0fdf4',
          '--min-accent-line': '#bbf7d0',
          '--min-header-line': '#dcfce7',
          '--min-rule': '#86efac',
          '--min-border': '#e7e5e4',
          '--min-bg': '#fffefb',
        },
      }),
    ],
  },
  developer: {
    swatchVariables: ['--dev-sidebar', '--dev-teal', '--dev-purple'],
    textPairs: [
      { foreground: '--dev-text', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-text', background: '--dev-surface', size: 'body' },
      { foreground: '--dev-primary', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-primary', background: '--dev-surface', size: 'body' },
      { foreground: '--dev-accent', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-accent', background: '--dev-surface', size: 'body' },
      { foreground: '--dev-muted', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-muted', background: '--dev-surface', size: 'body' },
      { foreground: '--dev-body', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-body', background: '--dev-surface', size: 'body' },
      { foreground: '--dev-teal', background: '--dev-bg', size: 'body' },
      { foreground: '--dev-sidebar-text', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-text', background: '--dev-sidebar-end', size: 'body' },
      { foreground: '--dev-sidebar-muted', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-muted', background: '--dev-sidebar-end', size: 'body' },
      { foreground: '--dev-sidebar-heading', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-heading', background: '--dev-sidebar-end', size: 'body' },
      { foreground: '--dev-sidebar-chip-text', background: '--dev-sidebar', size: 'body' },
      { foreground: '--dev-sidebar-chip-text', background: '--dev-sidebar-end', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.85)', background: '--dev-sidebar', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.85)', background: '--dev-sidebar-end', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--dev-teal', background: '--dev-bg', ratio: '2.49', reason: 'Bright teal cert link on a sidebar section moved onto the light main column (.dev-showcase__cert-link), below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('developer', {
        '--dev-primary': '#0f172a',
        '--dev-teal': '#14b8a6',
        '--dev-blue': '#3b82f6',
        '--dev-purple': '#8b5cf6',
        '--dev-accent': '#0f766e',
        '--dev-gray': '#64748b',
        '--dev-border': '#e2e8f0',
        '--dev-bg': '#ffffff',
        '--dev-surface': '#f8fafc',
        '--dev-header-border': '#e2e8f0',
        '--dev-sidebar': '#0f172a',
        '--dev-text': '#0f172a',
        '--dev-muted': '#64748b',
        '--dev-sidebar-end': '#1e293b',
        '--dev-sidebar-text': '#e2e8f0',
        '--dev-sidebar-muted': '#94a3b8',
        '--dev-sidebar-heading': '#f1f5f9',
        '--dev-sidebar-chip-bg': 'rgba(20, 184, 166, 0.16)',
        '--dev-sidebar-chip-text': '#5eead4',
        '--dev-sidebar-line': 'rgba(148, 163, 184, 0.25)',
        '--dev-body': '#334155',
        '--dev-accent-soft': 'rgba(15, 118, 110, 0.1)',
      }),
      look({
        id: 'graphite',
        label: { en: 'Graphite', fi: 'Grafiitti' },
        fontId: 'helvetica',
        palette: {
          '--dev-primary': '#18181b',
          '--dev-teal': '#15803d',
          '--dev-blue': '#14b8a6',
          '--dev-purple': '#0ea5e9',
          '--dev-accent': '#15803d',
          '--dev-gray': '#71717a',
          '--dev-border': '#e4e4e7',
          '--dev-bg': '#ffffff',
          '--dev-surface': '#fafafa',
          '--dev-header-border': '#e4e4e7',
          '--dev-sidebar': '#18181b',
          '--dev-text': '#18181b',
          '--dev-muted': '#71717a',
          '--dev-sidebar-end': '#27272a',
          '--dev-sidebar-text': '#e4e4e7',
          '--dev-sidebar-muted': '#a1a1aa',
          '--dev-sidebar-heading': '#f4f4f5',
          '--dev-sidebar-chip-bg': 'rgba(34, 197, 94, 0.16)',
          '--dev-sidebar-chip-text': '#86efac',
          '--dev-sidebar-line': 'rgba(161, 161, 170, 0.25)',
          '--dev-body': '#3f3f46',
          '--dev-accent-soft': 'rgba(21, 128, 61, 0.1)',
        },
      }),
      look({
        id: 'midnight',
        label: { en: 'Midnight', fi: 'Keskiyö' },
        fontId: 'lato',
        palette: {
          '--dev-primary': '#1e1b4b',
          '--dev-teal': '#4f46e5',
          '--dev-blue': '#a78bfa',
          '--dev-purple': '#f472b6',
          '--dev-accent': '#6d28d9',
          '--dev-gray': '#64648b',
          '--dev-border': '#e4e4f0',
          '--dev-bg': '#ffffff',
          '--dev-surface': '#f8f8fc',
          '--dev-header-border': '#e4e4f0',
          '--dev-sidebar': '#1e1b4b',
          '--dev-text': '#1e1b4b',
          '--dev-muted': '#64648b',
          '--dev-sidebar-end': '#312e81',
          '--dev-sidebar-text': '#e0e7ff',
          '--dev-sidebar-muted': '#c7d2fe',
          '--dev-sidebar-heading': '#eef2ff',
          '--dev-sidebar-chip-bg': 'rgba(129, 140, 248, 0.2)',
          '--dev-sidebar-chip-text': '#c4b5fd',
          '--dev-sidebar-line': 'rgba(165, 180, 252, 0.25)',
          '--dev-body': '#3a3a5c',
          '--dev-accent-soft': 'rgba(109, 40, 217, 0.1)',
        },
      }),
    ],
  },
  creative: {
    swatchVariables: ['--cr-page', '--cr-sidebar'],
    textPairs: [
      { foreground: '--cr-ink', background: '--cr-page', size: 'body' },
      { foreground: '--cr-ink', background: '--cr-sidebar', size: 'body' },
      { foreground: '--cr-ink', background: '--cr-card', size: 'body' },
      { foreground: '--cr-ink-muted', background: '--cr-page', size: 'body' },
      { foreground: '--cr-ink-muted', background: '--cr-sidebar', size: 'body' },
      { foreground: '--cr-ink-muted', background: '--cr-card', size: 'body' },
      { foreground: '--cr-ink-faint', background: '--cr-page', size: 'body' },
      { foreground: '--cr-ink-faint', background: '--cr-sidebar', size: 'body' },
      { foreground: '--cr-ink-faint', background: '--cr-card', size: 'body' },
      { foreground: ACCENT, background: '--cr-page', size: 'body' },
      { foreground: ACCENT, background: '--cr-sidebar', size: 'body' },
      { foreground: ACCENT, background: '--cr-card', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--cr-ink-faint', background: '--cr-sidebar', ratio: '4.25', reason: 'Faint meta text on the sand sidebar, below 4.5:1 since before Phase 3; variant #1 must not change.' },
      { foreground: ACCENT, background: '--cr-page', ratio: '3.35', reason: 'Coral accent role/section number on the peach page (.creative-showcase__role, .creative-showcase__section-num), below 4.5:1 since before Phase 3; variant #1 must not change.' },
      { foreground: ACCENT, background: '--cr-sidebar', ratio: '2.97', reason: 'Coral accent section number/dates on the sand sidebar, below 4.5:1 since before Phase 3; variant #1 must not change.' },
      { foreground: ACCENT, background: '--cr-card', ratio: '3.64', reason: 'Coral accent dates on experience cards (.creative-showcase__exp-dates), below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('creative', {
        '--cr-ink': '#1a1a1a',
        '--cr-ink-muted': '#4b4b4b',
        '--cr-ink-faint': '#6b6b6b',
        '--cr-border': '#ecdfc9',
        '--cr-page': '#fdf1e2',
        '--cr-sidebar': '#f7e3c4',
        '--cr-card': '#fffcf6',
      }),
      // Sidebar is #e7f3e1, not the proposed #dfe9da: the teal accent
      // lands on sidebar dates at body size and measured 4.14:1 there.
      look({
        id: 'sage',
        label: { en: 'Sage', fi: 'Salvia' },
        fontId: 'lato',
        accent: '#1f7a6c',
        palette: {
          '--cr-ink': '#17241f',
          '--cr-ink-muted': '#3f4c46',
          '--cr-ink-faint': '#56635c',
          '--cr-border': '#cfdcc9',
          '--cr-page': '#eef3ec',
          '--cr-sidebar': '#e7f3e1',
          '--cr-card': '#fbfdfa',
        },
      }),
      look({
        id: 'violet',
        label: { en: 'Violet', fi: 'Violetti' },
        fontId: 'georgia',
        accent: '#7c3aed',
        palette: {
          '--cr-ink': '#1c1a24',
          '--cr-ink-muted': '#46434f',
          '--cr-ink-faint': '#5e5a68',
          '--cr-border': '#ddd6ec',
          '--cr-page': '#f5f3fa',
          '--cr-sidebar': '#e9e4f5',
          '--cr-card': '#fdfcff',
        },
      }),
    ],
  },
  modern: {
    swatchVariables: ['--ms-navy', '--ms-rose', '--ms-bg'],
    textPairs: [
      { foreground: '--ms-navy', background: '--ms-bg', size: 'body' },
      { foreground: '--ms-navy', background: '--ms-bg-subtle', size: 'body' },
      { foreground: '--ms-navy-muted', background: '--ms-bg', size: 'body' },
      { foreground: '--ms-navy-muted', background: '--ms-bg-subtle', size: 'body' },
      { foreground: '--ms-text', background: '--ms-bg', size: 'body' },
      { foreground: '--ms-text', background: '--ms-bg-subtle', size: 'body' },
      { foreground: '--ms-muted', background: '--ms-bg', size: 'body' },
      { foreground: '--ms-muted', background: '--ms-bg-subtle', size: 'body' },
      { foreground: '--ms-rose', background: '--ms-bg', size: 'body' },
      { foreground: '--ms-rose', background: '--ms-bg-subtle', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--ms-muted', background: '--ms-bg', ratio: '4.45', reason: 'Slate meta text on the page background (.modern-showcase__contact-item), just below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('modern', {
        '--ms-navy': '#0f172a',
        '--ms-navy-muted': '#334155',
        '--ms-rose': '#be123c',
        '--ms-blush': '#fb7185',
        '--ms-border': '#e2e8f0',
        '--ms-border-soft': '#f1f5f9',
        '--ms-text': '#1e293b',
        '--ms-muted': '#64748b',
        '--ms-bg': '#f7f7fa',
        '--ms-bg-subtle': '#fafafa',
        '--ms-card': '#ffffff',
      }),
      look({
        id: 'ocean',
        label: { en: 'Ocean', fi: 'Meri' },
        fontId: 'helvetica',
        palette: {
          '--ms-navy': '#0c4a6e',
          '--ms-navy-muted': '#2b4a5e',
          '--ms-rose': '#0369a1',
          '--ms-blush': '#7dd3fc',
          '--ms-border': '#dbe5ec',
          '--ms-border-soft': '#eef3f7',
          '--ms-text': '#0f2a3d',
          '--ms-muted': '#52667a',
          '--ms-bg': '#f5f8fa',
          '--ms-bg-subtle': '#f9fbfc',
          '--ms-card': '#ffffff',
        },
      }),
      look({
        id: 'plum',
        label: { en: 'Plum', fi: 'Luumu' },
        fontId: 'georgia',
        palette: {
          '--ms-navy': '#3b0764',
          '--ms-navy-muted': '#4c2a5e',
          '--ms-rose': '#a21caf',
          '--ms-blush': '#f0abfc',
          '--ms-border': '#ece2ef',
          '--ms-border-soft': '#f6f0f7',
          '--ms-text': '#2a1b33',
          '--ms-muted': '#675a70',
          '--ms-bg': '#faf7fa',
          '--ms-bg-subtle': '#fcfafc',
          '--ms-card': '#ffffff',
        },
      }),
    ],
  },
  executive: {
    swatchVariables: ['--ex-ink', '--ex-rail'],
    textPairs: [
      { foreground: '--ex-ink', background: '--ex-bg', size: 'body' },
      { foreground: '--ex-ink', background: '--ex-rail', size: 'body' },
      { foreground: '--ex-ink', background: '--ex-card', size: 'body' },
      { foreground: '--ex-ink-muted', background: '--ex-bg', size: 'body' },
      { foreground: '--ex-ink-muted', background: '--ex-rail', size: 'body' },
      { foreground: '--ex-ink-muted', background: '--ex-card', size: 'body' },
      { foreground: '--ex-ink-faint', background: '--ex-bg', size: 'body' },
      { foreground: '--ex-ink-faint', background: '--ex-rail', size: 'body' },
      { foreground: '--ex-ink-faint', background: '--ex-card', size: 'body' },
      { foreground: ACCENT, background: '--ex-bg', size: 'body' },
      { foreground: ACCENT, background: '--ex-rail', size: 'body' },
      { foreground: ACCENT, background: '--ex-card', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('executive', {
        '--ex-ink': '#1c1917',
        '--ex-ink-muted': '#44403c',
        '--ex-ink-faint': '#6b645e',
        '--ex-border': '#d6d3d1',
        '--ex-rail': '#f7f4ef',
        '--ex-bg': '#faf9f7',
        '--ex-card': '#ffffff',
      }),
      look({
        id: 'navy',
        label: { en: 'Navy', fi: 'Laivasto' },
        fontId: 'timesNewRoman',
        accent: '#1e3a8a',
        palette: {
          '--ex-ink': '#0f172a',
          '--ex-ink-muted': '#334155',
          '--ex-ink-faint': '#5b6779',
          '--ex-border': '#cbd5e1',
          '--ex-rail': '#f1f4f9',
          '--ex-bg': '#f8fafc',
          '--ex-card': '#ffffff',
        },
      }),
      look({
        id: 'burgundy',
        label: { en: 'Burgundy', fi: 'Viini' },
        fontId: 'georgia',
        accent: '#9f1239',
        palette: {
          '--ex-ink': '#1f1416',
          '--ex-ink-muted': '#4a3b3d',
          '--ex-ink-faint': '#6e5f61',
          '--ex-border': '#e2d4d4',
          '--ex-rail': '#f9f1f1',
          '--ex-bg': '#fcf9f9',
          '--ex-card': '#ffffff',
        },
      }),
    ],
  },
  timeline: {
    swatchVariables: ['--tl-text', '--tl-bg'],
    textPairs: [
      { foreground: '--tl-text', background: '--tl-bg', size: 'body' },
      { foreground: '--tl-muted', background: '--tl-bg', size: 'body' },
      { foreground: ACCENT, background: '--tl-bg', size: 'body' },
      { foreground: '--tl-ink', background: '--tl-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('timeline', {
        '--tl-text': '#1f2937',
        '--tl-muted': '#6b7280',
        '--tl-border': '#e5e7eb',
        '--tl-bg': '#fdfdfd',
        '--tl-ink': '#111827',
      }),
      look({
        id: 'blue',
        label: { en: 'Blue', fi: 'Sininen' },
        fontId: 'lato',
        accent: '#2563eb',
        palette: {
          '--tl-text': '#1e293b',
          '--tl-muted': '#64748b',
          '--tl-border': '#e2e8f0',
          '--tl-bg': '#fcfdff',
          '--tl-ink': '#0f172a',
        },
      }),
      look({
        id: 'rose',
        label: { en: 'Rose', fi: 'Ruusu' },
        fontId: 'georgia',
        accent: '#be123c',
        palette: {
          '--tl-text': '#292524',
          '--tl-muted': '#6b6460',
          '--tl-border': '#e7e2e0',
          '--tl-bg': '#fdfcfc',
          '--tl-ink': '#1c1917',
        },
      }),
    ],
  },
  graduate: {
    swatchVariables: ['--gr-ink', '--gr-bg'],
    textPairs: [
      { foreground: '--gr-ink', background: '--gr-bg', size: 'body' },
      { foreground: '--gr-ink-muted', background: '--gr-bg', size: 'body' },
      { foreground: ACCENT, background: '--gr-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('graduate', {
        '--gr-ink': '#1e293b',
        '--gr-ink-muted': '#475569',
        '--gr-border': '#e2e8f0',
        '--gr-bg': '#f7f7fa',
      }),
      look({
        id: 'blue',
        label: { en: 'Blue', fi: 'Sininen' },
        fontId: 'lato',
        accent: '#2563eb',
        palette: {
          '--gr-ink': '#1b2a3d',
          '--gr-ink-muted': '#46566b',
          '--gr-border': '#dbe3ee',
          '--gr-bg': '#f5f8fc',
        },
      }),
      look({
        id: 'rose',
        label: { en: 'Rose', fi: 'Ruusu' },
        fontId: 'georgia',
        accent: '#be123c',
        palette: {
          '--gr-ink': '#2a1f23',
          '--gr-ink-muted': '#5b4b51',
          '--gr-border': '#ebdfe3',
          '--gr-bg': '#faf7f8',
        },
      }),
    ],
  },
  compact: {
    swatchVariables: ['--cp-ink', '--cp-bg'],
    textPairs: [
      { foreground: '--cp-ink', background: '--cp-bg', size: 'body' },
      { foreground: '--cp-ink-muted', background: '--cp-bg', size: 'body' },
      { foreground: ACCENT, background: '--cp-bg', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: ACCENT, background: '--cp-bg', ratio: '3.83', reason: 'Sky accent text on the page background (.compact-showcase__role, .compact-showcase__entry-dates), below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('compact', {
        '--cp-ink': '#0f172a',
        '--cp-ink-muted': '#475569',
        '--cp-border': '#cbd5e1',
        '--cp-card': '#ffffff',
        '--cp-bg': '#f7f7fa',
      }),
      look({
        id: 'slate',
        label: { en: 'Slate', fi: 'Liuske' },
        fontId: 'arial',
        accent: '#334155',
        palette: {
          '--cp-ink': '#111827',
          '--cp-ink-muted': '#4b5563',
          '--cp-border': '#d1d5db',
          '--cp-card': '#ffffff',
          '--cp-bg': '#f5f6f8',
        },
      }),
      look({
        id: 'indigo',
        label: { en: 'Indigo', fi: 'Indigo' },
        fontId: 'calibri',
        accent: '#4f46e5',
        palette: {
          '--cp-ink': '#1e1b3a',
          '--cp-ink-muted': '#4b4a63',
          '--cp-border': '#d4d4e8',
          '--cp-card': '#ffffff',
          '--cp-bg': '#f6f6fb',
        },
      }),
    ],
  },
  portfolio: {
    swatchVariables: ['--pf-slate', '--pf-sidebar-tint'],
    textPairs: [
      { foreground: '--pf-slate', background: '--pf-card', size: 'body' },
      { foreground: '--pf-slate', background: '--pf-sidebar-tint', size: 'body' },
      { foreground: '--pf-slate', background: '--pf-header-top', size: 'body' },
      { foreground: '--pf-text', background: '--pf-card', size: 'body' },
      { foreground: '--pf-text', background: '--pf-sidebar-tint', size: 'body' },
      { foreground: '--pf-text', background: '--pf-header-top', size: 'body' },
      { foreground: '--pf-gray', background: '--pf-card', size: 'body' },
      { foreground: '--pf-gray', background: '--pf-sidebar-tint', size: 'body' },
      { foreground: '--pf-gray', background: '--pf-header-top', size: 'body' },
      { foreground: ACCENT, background: '--pf-card', size: 'body' },
      { foreground: ACCENT, background: '--pf-sidebar-tint', size: 'body' },
      { foreground: ACCENT, background: '--pf-header-top', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--pf-gray', background: '--pf-sidebar-tint', ratio: '4.48', reason: 'Grey meta text on the sidebar tint, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('portfolio', {
        '--pf-slate': '#0f172a',
        '--pf-gray': '#64748b',
        '--pf-border': '#e2e8f0',
        '--pf-border-soft': '#eef1f6',
        '--pf-text': '#1e293b',
        '--pf-card': '#ffffff',
        '--pf-sidebar-tint': '#f7f8fa',
        '--pf-bg': '#f7f7fa',
        '--pf-header-top': '#fafbfc',
        '--pf-header-bottom': '#ffffff',
      }),
      look({
        id: 'sky',
        label: { en: 'Sky', fi: 'Taivas' },
        fontId: 'lato',
        accent: '#0369a1',
        palette: {
          '--pf-slate': '#0c2a40',
          '--pf-gray': '#55687a',
          '--pf-border': '#dbe6ee',
          '--pf-border-soft': '#ebf1f6',
          '--pf-text': '#1a3348',
          '--pf-card': '#ffffff',
          '--pf-sidebar-tint': '#f2f7fb',
          '--pf-bg': '#f5f8fb',
          '--pf-header-top': '#eef5fb',
          '--pf-header-bottom': '#ffffff',
        },
      }),
      look({
        id: 'slate',
        label: { en: 'Slate', fi: 'Liuske' },
        fontId: 'georgia',
        accent: '#334155',
        palette: {
          '--pf-slate': '#1c1917',
          '--pf-gray': '#6b6460',
          '--pf-border': '#e7e5e4',
          '--pf-border-soft': '#f0eeed',
          '--pf-text': '#292524',
          '--pf-card': '#ffffff',
          '--pf-sidebar-tint': '#f5f5f4',
          '--pf-bg': '#f7f7f6',
          '--pf-header-top': '#f7f6f4',
          '--pf-header-bottom': '#ffffff',
        },
      }),
    ],
  },
  techExec: {
    swatchVariables: ['--te-navy', '--te-bg'],
    textPairs: [
      { foreground: '--te-ink', background: '--te-bg', size: 'body' },
      { foreground: '--te-ink-muted', background: '--te-bg', size: 'body' },
      { foreground: '--te-ink-faint', background: '--te-bg', size: 'body' },
      { foreground: ACCENT, background: '--te-bg', size: 'body' },
      { foreground: '#ffffff', background: '--te-navy', size: 'large' },
      { foreground: '--te-masthead-kicker', background: '--te-navy', size: 'body' },
      { foreground: '--te-masthead-role', background: '--te-navy', size: 'body' },
      { foreground: '--te-masthead-contact', background: '--te-navy', size: 'body' },
      { foreground: '--te-masthead-icon', background: '--te-navy', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('techExec', {
        '--te-navy': '#163d7a',
        '--te-ink': '#1e293b',
        '--te-ink-muted': '#475569',
        '--te-ink-faint': '#64748b',
        '--te-border': '#e2e8f0',
        '--te-bg': '#f8fafc',
        '--te-masthead-kicker': '#a8b5c8',
        '--te-masthead-role': '#bfdbfe',
        '--te-masthead-contact': '#cbd5e1',
        '--te-masthead-icon': '#93c5fd',
      }),
      look({
        id: 'teal',
        label: { en: 'Teal', fi: 'Sinivihreä' },
        fontId: 'calibri',
        accent: '#0f766e',
        palette: {
          '--te-navy': '#134e4a',
          '--te-ink': '#172826',
          '--te-ink-muted': '#3f504d',
          '--te-ink-faint': '#5a6b68',
          '--te-border': '#dae6e3',
          '--te-bg': '#f7faf9',
          '--te-masthead-kicker': '#a3c4bd',
          '--te-masthead-role': '#99f6e4',
          '--te-masthead-contact': '#c6dbd6',
          '--te-masthead-icon': '#5eead4',
        },
      }),
      look({
        id: 'slate',
        label: { en: 'Slate', fi: 'Liuske' },
        fontId: 'helvetica',
        accent: '#4f46e5',
        palette: {
          '--te-navy': '#1e293b',
          '--te-ink': '#0f172a',
          '--te-ink-muted': '#475569',
          '--te-ink-faint': '#64748b',
          '--te-border': '#e2e8f0',
          '--te-bg': '#f8fafc',
          '--te-masthead-kicker': '#a3afc0',
          '--te-masthead-role': '#e2e8f0',
          '--te-masthead-contact': '#cbd5e1',
          '--te-masthead-icon': '#94a3b8',
        },
      }),
    ],
  },
  classicProfessional: {
    swatchVariables: ['--cp-text', '--cp-border', '--cp-bg'],
    textPairs: [
      { foreground: '--cp-text', background: '--cp-bg', size: 'body' },
      { foreground: '--cp-muted', background: '--cp-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('classicProfessional', {
        '--cp-text': '#111111',
        '--cp-muted': '#52525b',
        '--cp-border': '#d4d4d8',
        '--cp-bg': '#fdfdfd',
      }),
      look({
        id: 'navy',
        label: { en: 'Navy', fi: 'Laivasto' },
        fontId: 'timesNewRoman',
        headingColor: '#1e3a8a',
        palette: {
          '--cp-text': '#0f172a',
          '--cp-muted': '#475569',
          '--cp-border': '#cbd5e1',
          '--cp-bg': '#fdfdfd',
        },
      }),
      look({
        id: 'warm',
        label: { en: 'Warm', fi: 'Lämmin' },
        fontId: 'georgia',
        headingColor: '#7f1d1d',
        palette: {
          '--cp-text': '#292524',
          '--cp-muted': '#57534e',
          '--cp-border': '#d6d3d1',
          '--cp-bg': '#fdfcfa',
        },
      }),
    ],
  },
  navyProfessional: {
    swatchVariables: ['--np-navy', '--np-blue', '--np-bg'],
    textPairs: [
      { foreground: '#ffffff', background: '--np-navy', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.85)', background: '--np-navy', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.55)', background: '--np-navy', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.5)', background: '--np-navy', size: 'body' },
      { foreground: '--np-blue-light', background: '--np-navy', size: 'body' },
      { foreground: '--np-text', background: '--np-bg', size: 'body' },
      { foreground: '--np-muted', background: '--np-bg', size: 'body' },
      { foreground: '--np-blue', background: '--np-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('navyProfessional', {
        '--np-navy': '#16233a',
        '--np-navy-line': 'rgba(255, 255, 255, 0.14)',
        '--np-blue': '#2563eb',
        '--np-blue-light': '#93c5fd',
        '--np-text': '#1f2937',
        '--np-muted': '#6b7280',
        '--np-border': '#e5e7eb',
        '--np-bg': '#fdfdfd',
      }),
      look({
        id: 'forest',
        label: { en: 'Forest', fi: 'Metsä' },
        fontId: 'lato',
        palette: {
          '--np-navy': '#14352a',
          '--np-navy-line': 'rgba(255, 255, 255, 0.14)',
          '--np-blue': '#15803d',
          '--np-blue-light': '#86efac',
          '--np-text': '#1c2621',
          '--np-muted': '#5f6b65',
          '--np-border': '#e1e7e3',
          '--np-bg': '#fdfdfc',
        },
      }),
      look({
        id: 'charcoal',
        label: { en: 'Charcoal', fi: 'Hiili' },
        fontId: 'georgia',
        palette: {
          '--np-navy': '#27272a',
          '--np-navy-line': 'rgba(255, 255, 255, 0.14)',
          '--np-blue': '#b45309',
          '--np-blue-light': '#fcd34d',
          '--np-text': '#1c1917',
          '--np-muted': '#69625c',
          '--np-border': '#e7e5e4',
          '--np-bg': '#fdfdfc',
        },
      }),
    ],
  },
  modernOrange: {
    swatchVariables: ['--mo-text', '--mo-sidebar-bg'],
    textPairs: [
      { foreground: '--mo-text', background: '--mo-bg', size: 'body' },
      { foreground: '--mo-text', background: '--mo-sidebar-bg', size: 'body' },
      { foreground: '--mo-muted', background: '--mo-bg', size: 'body' },
      { foreground: '--mo-muted', background: '--mo-sidebar-bg', size: 'body' },
      { foreground: ACCENT, background: '--mo-bg', size: 'body' },
      { foreground: ACCENT, background: '--mo-sidebar-bg', size: 'body' },
      { foreground: '#ffffff', background: ACCENT, size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: ACCENT, background: '--mo-bg', ratio: '2.42', reason: 'Orange accent dates/meta/name on the page, below 4.5:1 since before Phase 3; variant #1 must not change.' },
      { foreground: ACCENT, background: '--mo-sidebar-bg', ratio: '2.30', reason: 'Orange accent sidebar headings on the cream sidebar (.modern-orange-showcase__sidebar-heading), below 4.5:1 since before Phase 3; variant #1 must not change.' },
      { foreground: '#ffffff', background: ACCENT, ratio: '2.46', reason: 'White title-badge text on orange (.modern-orange-showcase__title-badge), below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('modernOrange', {
        '--mo-text': '#151a22',
        '--mo-muted': '#6b7280',
        '--mo-border': '#ece1d2',
        '--mo-sidebar-bg': '#fdf6ec',
        '--mo-dot-empty': '#e6dcc9',
        '--mo-bg': '#fdfdfd',
      }),
      look({
        id: 'blue',
        label: { en: 'Blue', fi: 'Sininen' },
        fontId: 'lato',
        accent: '#1d4ed8',
        palette: {
          '--mo-text': '#111827',
          '--mo-muted': '#526073',
          '--mo-border': '#d9e2f3',
          '--mo-sidebar-bg': '#f2f6fd',
          '--mo-dot-empty': '#cdd8ee',
          '--mo-bg': '#fdfdfe',
        },
      }),
      look({
        id: 'rose',
        label: { en: 'Rose', fi: 'Ruusu' },
        fontId: 'georgia',
        accent: '#be123c',
        palette: {
          '--mo-text': '#1f1517',
          '--mo-muted': '#6a585c',
          '--mo-border': '#f1dade',
          '--mo-sidebar-bg': '#fdf2f4',
          '--mo-dot-empty': '#ecd3d8',
          '--mo-bg': '#fdfcfc',
        },
      }),
    ],
  },
  colorfulCompact: {
    swatchVariables: ['--cc-dark', '--cc-pink', '--cc-blue', '--cc-green'],
    textPairs: [
      { foreground: '--cc-ink', background: '--cc-page', size: 'body' },
      { foreground: '--cc-ink', background: '--cc-card', size: 'body' },
      { foreground: '--cc-ink', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-muted', background: '--cc-page', size: 'body' },
      { foreground: '--cc-muted', background: '--cc-card', size: 'body' },
      { foreground: '--cc-muted', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-body', background: '--cc-card', size: 'body' },
      { foreground: '--cc-body', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-pink-text', background: '--cc-page', size: 'body' },
      { foreground: '--cc-pink-text', background: '--cc-card', size: 'body' },
      { foreground: '--cc-pink-text', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-orange-text', background: '--cc-page', size: 'body' },
      { foreground: '--cc-orange-text', background: '--cc-card', size: 'body' },
      { foreground: '--cc-orange-text', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-green-text', background: '--cc-page', size: 'body' },
      { foreground: '--cc-green-text', background: '--cc-card', size: 'body' },
      { foreground: '--cc-green-text', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-teal-text', background: '--cc-page', size: 'body' },
      { foreground: '--cc-teal-text', background: '--cc-card', size: 'body' },
      { foreground: '--cc-teal-text', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-blue-text', background: '--cc-page', size: 'body' },
      { foreground: '--cc-blue-text', background: '--cc-card', size: 'body' },
      { foreground: '--cc-blue-text', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-purple-text', background: '--cc-page', size: 'body' },
      { foreground: '--cc-purple-text', background: '--cc-card', size: 'body' },
      { foreground: '--cc-purple-text', background: '--cc-sidebar', size: 'body' },
      { foreground: '--cc-pink-text', background: '--cc-pink-soft', size: 'body' },
      { foreground: '--cc-orange-text', background: '--cc-orange-soft', size: 'body' },
      { foreground: '--cc-green-text', background: '--cc-green-soft', size: 'body' },
      { foreground: '--cc-teal-text', background: '--cc-teal-soft', size: 'body' },
      { foreground: '--cc-blue-text', background: '--cc-blue-soft', size: 'body' },
      { foreground: '--cc-purple-text', background: '--cc-purple-soft', size: 'body' },
      { foreground: '#ffffff', background: '--cc-pink-text', size: 'body' },
      { foreground: '#ffffff', background: '--cc-orange-text', size: 'body' },
      { foreground: '#ffffff', background: '--cc-green-text', size: 'body' },
      { foreground: '#ffffff', background: '--cc-teal-text', size: 'body' },
      { foreground: '#ffffff', background: '--cc-blue-text', size: 'body' },
      { foreground: '#ffffff', background: '--cc-purple-text', size: 'body' },
      { foreground: '#ffffff', background: '--cc-dark', size: 'large' },
      { foreground: '--cc-orange', background: '--cc-dark', size: 'large' },
      { foreground: 'rgba(255, 255, 255, 0.5)', background: '--cc-dark', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.65)', background: '--cc-dark', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.8)', background: '--cc-dark', size: 'body' },
    ],
    defaultContrastExceptions: [
      { foreground: '--cc-muted', background: '--cc-sidebar', ratio: '4.39', reason: 'Grey meta text on the sidebar, below 4.5:1 since before Phase 3; variant #1 must not change.' },
    ],
    variants: [
      original('colorfulCompact', {
        '--cc-pink': '#ec4899',
        '--cc-pink-text': '#be185d',
        '--cc-orange': '#f97316',
        '--cc-orange-text': '#c2410c',
        '--cc-green': '#22c55e',
        '--cc-green-text': '#15803d',
        '--cc-teal': '#14b8a6',
        '--cc-teal-text': '#0f766e',
        '--cc-blue': '#3b82f6',
        '--cc-blue-text': '#1d4ed8',
        '--cc-purple': '#a855f7',
        '--cc-purple-text': '#7e22ce',
        '--cc-page': '#ffffff',
        '--cc-body': '#3f3f46',
        '--cc-pink-soft': '#fce7f3',
        '--cc-orange-soft': '#ffedd5',
        '--cc-green-soft': '#dcfce7',
        '--cc-teal-soft': '#ccfbf1',
        '--cc-blue-soft': '#dbeafe',
        '--cc-purple-soft': '#f3e8ff',
        '--cc-dark': '#16132a',
        '--cc-ink': '#18181b',
        '--cc-muted': '#6b7280',
        '--cc-sidebar': '#f2f4f8',
        '--cc-border': '#e5e7eb',
        '--cc-card': '#ffffff',
      }),
      // Colorful Compact's documented multicolour exception
      // (docs/template-design-system.md §3): each variant is another set
      // of six section hues in the same slots (the slot names are the
      // Original's hues), each with its -text and -soft partners.
      look({
        id: 'ocean',
        label: { en: 'Ocean', fi: 'Meri' },
        fontId: 'helvetica',
        palette: {
          '--cc-pink': '#0ea5e9',
          '--cc-pink-text': '#0369a1',
          '--cc-orange': '#06b6d4',
          '--cc-orange-text': '#0e7490',
          '--cc-green': '#14b8a6',
          '--cc-green-text': '#0f766e',
          '--cc-teal': '#6366f1',
          '--cc-teal-text': '#4338ca',
          '--cc-blue': '#3b82f6',
          '--cc-blue-text': '#1d4ed8',
          '--cc-purple': '#8b5cf6',
          '--cc-purple-text': '#6d28d9',
          '--cc-page': '#ffffff',
          '--cc-body': '#334155',
          '--cc-pink-soft': '#e0f2fe',
          '--cc-orange-soft': '#cffafe',
          '--cc-green-soft': '#ccfbf1',
          '--cc-teal-soft': '#e0e7ff',
          '--cc-blue-soft': '#dbeafe',
          '--cc-purple-soft': '#ede9fe',
          '--cc-dark': '#0c1a2e',
          '--cc-ink': '#0f172a',
          '--cc-muted': '#5b6678',
          '--cc-sidebar': '#f1f5f9',
          '--cc-border': '#e2e8f0',
          '--cc-card': '#ffffff',
        },
      }),
      look({
        id: 'sunset',
        label: { en: 'Sunset', fi: 'Iltarusko' },
        fontId: 'lato',
        palette: {
          '--cc-pink': '#f43f5e',
          '--cc-pink-text': '#be123c',
          '--cc-orange': '#ef4444',
          '--cc-orange-text': '#b91c1c',
          '--cc-green': '#f97316',
          '--cc-green-text': '#c2410c',
          '--cc-teal': '#f59e0b',
          '--cc-teal-text': '#b45309',
          '--cc-blue': '#fb7c6b',
          '--cc-blue-text': '#b4442f',
          '--cc-purple': '#c026d3',
          '--cc-purple-text': '#a21caf',
          '--cc-page': '#ffffff',
          '--cc-body': '#44403c',
          '--cc-pink-soft': '#ffe4e6',
          '--cc-orange-soft': '#fee2e2',
          '--cc-green-soft': '#ffedd5',
          '--cc-teal-soft': '#fef3c7',
          '--cc-blue-soft': '#ffe8e3',
          '--cc-purple-soft': '#fae8ff',
          '--cc-dark': '#2a1313',
          '--cc-ink': '#1c1917',
          '--cc-muted': '#6b625d',
          '--cc-sidebar': '#faf5f2',
          '--cc-border': '#ece4df',
          '--cc-card': '#ffffff',
        },
      }),
    ],
  },
  quadrant: {
    swatchVariables: ['--qd-text', '--qd-border'],
    textPairs: [
      { foreground: '--qd-text', background: '--qd-bg', size: 'body' },
      { foreground: '--qd-text', background: '--qd-card', size: 'body' },
      { foreground: '--qd-muted', background: '--qd-bg', size: 'body' },
      { foreground: '--qd-muted', background: '--qd-card', size: 'body' },
      { foreground: ACCENT, background: '--qd-bg', size: 'body' },
      { foreground: ACCENT, background: '--qd-card', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('quadrant', {
        '--qd-text': '#0f172a',
        '--qd-muted': '#475569',
        '--qd-border': '#bfe0e6',
        '--qd-bg': '#f7fafa',
        '--qd-card': '#ffffff',
      }),
      look({
        id: 'teal',
        label: { en: 'Teal', fi: 'Sinivihreä' },
        fontId: 'lato',
        accent: '#0f766e',
        palette: {
          '--qd-text': '#10201e',
          '--qd-muted': '#43524f',
          '--qd-border': '#c3e3dd',
          '--qd-bg': '#f6faf9',
          '--qd-card': '#ffffff',
        },
      }),
      look({
        id: 'indigo',
        label: { en: 'Indigo', fi: 'Indigo' },
        fontId: 'calibri',
        accent: '#4f46e5',
        palette: {
          '--qd-text': '#1a1833',
          '--qd-muted': '#4a4963',
          '--qd-border': '#d4d4f5',
          '--qd-bg': '#f7f7fc',
          '--qd-card': '#ffffff',
        },
      }),
    ],
  },
  editorial: {
    swatchVariables: ['--ed-ink', '--ed-bg'],
    textPairs: [
      { foreground: '--ed-ink', background: '--ed-bg', size: 'body' },
      { foreground: '--ed-muted', background: '--ed-bg', size: 'body' },
      { foreground: '--ed-faint', background: '--ed-bg', size: 'body' },
      { foreground: ACCENT, background: '--ed-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('editorial', {
        '--ed-ink': '#1a1a1a',
        '--ed-muted': '#52525b',
        '--ed-faint': '#71717a',
        '--ed-border': '#e4e4e7',
        '--ed-bg': '#fdfdfd',
      }),
      look({
        id: 'navy',
        label: { en: 'Navy', fi: 'Laivasto' },
        fontId: 'timesNewRoman',
        accent: '#1e3a8a',
        palette: {
          '--ed-ink': '#111827',
          '--ed-muted': '#475569',
          '--ed-faint': '#64748b',
          '--ed-border': '#e2e8f0',
          '--ed-bg': '#fcfcfd',
        },
      }),
      look({
        id: 'teal',
        label: { en: 'Teal', fi: 'Sinivihreä' },
        fontId: 'georgia',
        accent: '#0f766e',
        palette: {
          '--ed-ink': '#1c1a17',
          '--ed-muted': '#57534e',
          '--ed-faint': '#6f6a63',
          '--ed-border': '#e7e3dc',
          '--ed-bg': '#fcfbf8',
        },
      }),
    ],
  },
  portrait: {
    swatchVariables: ['--pt-ink', '--pt-bg'],
    textPairs: [
      { foreground: '--pt-ink', background: '--pt-bg', size: 'body' },
      { foreground: '--pt-muted', background: '--pt-bg', size: 'body' },
      { foreground: '--pt-faint', background: '--pt-bg', size: 'body' },
      { foreground: ACCENT, background: '--pt-bg', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.92)', background: ACCENT, size: 'large' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('portrait', {
        '--pt-ink': '#1a1a1a',
        '--pt-muted': '#52525b',
        '--pt-faint': '#71717a',
        '--pt-border': '#e4e4e7',
        '--pt-bg': '#fdfdfd',
      }),
      look({
        id: 'slate',
        label: { en: 'Slate', fi: 'Liuske' },
        fontId: 'helvetica',
        accent: '#334155',
        palette: {
          '--pt-ink': '#111827',
          '--pt-muted': '#4b5563',
          '--pt-faint': '#6b7280',
          '--pt-border': '#e5e7eb',
          '--pt-bg': '#fdfdfd',
        },
      }),
      look({
        id: 'crimson',
        label: { en: 'Crimson', fi: 'Karmiini' },
        fontId: 'georgia',
        accent: '#9f1239',
        palette: {
          '--pt-ink': '#1f1416',
          '--pt-muted': '#56494b',
          '--pt-faint': '#736568',
          '--pt-border': '#ebe1e0',
          '--pt-bg': '#fdfbfa',
        },
      }),
    ],
  },
  european: {
    swatchVariables: ['--eu-ink', '--eu-bg'],
    textPairs: [
      { foreground: '--eu-ink', background: '--eu-bg', size: 'body' },
      { foreground: '--eu-muted', background: '--eu-bg', size: 'body' },
      { foreground: '--eu-faint', background: '--eu-bg', size: 'body' },
      { foreground: ACCENT, background: '--eu-bg', size: 'body' },
    ],
    defaultContrastExceptions: [],
    variants: [
      original('european', {
        '--eu-ink': '#1a1a1a',
        '--eu-muted': '#52525b',
        '--eu-faint': '#71717a',
        '--eu-border': '#e4e4e7',
        '--eu-bg': '#fdfdfd',
      }),
      look({
        id: 'forest',
        label: { en: 'Forest', fi: 'Metsä' },
        fontId: 'calibri',
        accent: '#15803d',
        palette: {
          '--eu-ink': '#17201a',
          '--eu-muted': '#48544c',
          '--eu-faint': '#646f68',
          '--eu-border': '#dde5df',
          '--eu-bg': '#fcfdfc',
        },
      }),
      look({
        id: 'slate',
        label: { en: 'Slate', fi: 'Liuske' },
        fontId: 'arial',
        accent: '#334155',
        palette: {
          '--eu-ink': '#0f172a',
          '--eu-muted': '#475569',
          '--eu-faint': '#64748b',
          '--eu-border': '#e2e8f0',
          '--eu-bg': '#fcfcfd',
        },
      }),
    ],
  },
}

export function getTemplateVariants(templateId) {
  return TEMPLATE_VARIANTS[templateId]?.variants ?? []
}

// Falls back to variant #1 for an unknown id, so a CV from a newer
// version (or a typo in a hand-edited file) still renders.
export function getTemplateVariant(templateId, variantId) {
  const variants = getTemplateVariants(templateId)
  if (variants.length === 0) {
    return null
  }
  return variants.find((variant) => variant.id === variantId) ?? variants[0]
}

export function resolveStyleVariantId(formData, templateId) {
  const stored = formData?.styleVariantByTemplate?.[templateId]
  return getTemplateVariant(templateId, stored)?.id ?? DEFAULT_STYLE_VARIANT_ID
}

export function getPaletteVariables(templateId) {
  return Object.keys(getTemplateVariants(templateId)[0]?.palette ?? {})
}

export function getVariantPaletteStyle(templateId, variantId) {
  return { ...(getTemplateVariant(templateId, variantId)?.palette ?? {}) }
}

export function getVariantSwatches(templateId, variant) {
  const swatchVariables = TEMPLATE_VARIANTS[templateId]?.swatchVariables ?? []
  return [variant?.accent, ...swatchVariables.map((name) => variant?.palette[name])]
    .filter(Boolean)
    .slice(0, 4)
}

// True when the tab-only accent, font or headings colour has been tweaked
// away from the active variant's values — drives the Style picker's
// "Modified" marker.
export function isStyleVariantModified({ templateId, variantId, templateAccentColors, cvFontId, cvHeadingColor }) {
  const variant = getTemplateVariant(templateId, variantId)
  if (!variant) {
    return false
  }
  const accent = resolveTemplateAccent(templateAccentColors, templateId)
  if (variant.accent && String(accent).toLowerCase() !== variant.accent.toLowerCase()) {
    return true
  }
  return cvFontId !== variant.fontId
    || String(cvHeadingColor || '').toLowerCase() !== variant.headingColor.toLowerCase()
}
