// User-selectable body font for the CV preview/export — classic, resume-safe
// fonts rather than a free-form picker. Most of these (Arial, Helvetica,
// Georgia, Times New Roman) are proprietary system fonts that can't be
// self-hosted at all — they're listed by name and simply render as whichever
// installed font the viewer's OS actually has, exactly like Georgia already
// worked in several bespoke template stylesheets before this file existed.
// Calibri gets the same treatment, but with Carlito (an open, metrically
// compatible clone made for LibreOffice) self-hosted as the fallback, so it
// still looks right on a machine without Microsoft Office fonts installed.
// Lato is the only one hosted purely because we chose it, not because we
// have to. Each non-default font's CSS is dynamically imported only when
// chosen (or when the switcher panel opens, to preview all of them at once —
// see CvFontSwitcher.jsx), so the others never cost anything up front.
export const DEFAULT_CV_FONT_ID = 'inter'

export const CV_FONT_OPTIONS = [
  {
    id: 'inter',
    label: 'Inter',
    stack: "'Inter Variable', 'Inter var', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    // Already loaded eagerly in main.jsx as the app's own UI font — nothing
    // to fetch when a user picks (or defaults to) it for the CV too.
    load: null,
  },
  {
    id: 'arial',
    label: 'Arial',
    stack: "Arial, 'Helvetica Neue', Helvetica, 'Liberation Sans', sans-serif",
    load: null,
  },
  {
    id: 'calibri',
    label: 'Calibri',
    stack: "Calibri, Carlito, 'Segoe UI', sans-serif",
    load: () => Promise.all([
      import('@fontsource/carlito/400.css'),
      import('@fontsource/carlito/400-italic.css'),
      import('@fontsource/carlito/700.css'),
    ]),
  },
  {
    id: 'helvetica',
    label: 'Helvetica',
    stack: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    load: null,
  },
  {
    id: 'lato',
    label: 'Lato',
    stack: "'Lato', 'Helvetica Neue', Arial, sans-serif",
    load: () => Promise.all([
      import('@fontsource/lato/400.css'),
      import('@fontsource/lato/400-italic.css'),
      import('@fontsource/lato/700.css'),
    ]),
  },
  {
    id: 'georgia',
    label: 'Georgia',
    stack: "Georgia, 'Times New Roman', Times, serif",
    load: null,
  },
  {
    id: 'timesNewRoman',
    label: 'Times New Roman',
    stack: "'Times New Roman', Times, Georgia, serif",
    load: null,
  },
]

const CV_FONT_BY_ID = new Map(CV_FONT_OPTIONS.map((font) => [font.id, font]))

export function isValidCvFontId(fontId) {
  return CV_FONT_BY_ID.has(fontId)
}

// True for a font whose files must be downloaded (Calibri's Carlito
// fallback, Lato); false for system fonts, Inter (already loaded) and
// unknown ids.
export function cvFontNeedsDownload(fontId) {
  return Boolean(CV_FONT_BY_ID.get(fontId)?.load)
}

export function getCvFontStack(fontId) {
  return (CV_FONT_BY_ID.get(fontId) ?? CV_FONT_BY_ID.get(DEFAULT_CV_FONT_ID)).stack
}

// Resolves once the chosen font's CSS has been fetched and its @font-face
// rules registered — resolves immediately for a system font (no CSS to
// fetch) or an unrecognized id. Callers that need the font to actually be
// painted (a PDF export snapshot) should also await document.fonts.ready
// afterward, since registering the CSS isn't the same as the browser
// finishing the fetch of the specific weight/style in use.
export function loadCvFont(fontId) {
  const font = CV_FONT_BY_ID.get(fontId)
  if (!font?.load) {
    return Promise.resolve()
  }
  return font.load()
}

// Kicks off every font's CSS fetch at once — used when the switcher panel
// opens so each option's sample text can preview in its real face instead of
// a fallback, without paying for any of it until the user actually looks.
export function loadAllCvFonts() {
  return Promise.all(CV_FONT_OPTIONS.map((font) => loadCvFont(font.id)))
}
