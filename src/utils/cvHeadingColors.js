// User-adjustable color for the CV's heading text only (the candidate name
// and section titles — e.g. "EXPERIENCE", "EDUCATION") — never body copy.
// Stored as a plain hex string, or '' to mean "use the template's own
// heading color" (no override at all) — see CvHeadingColorSwitcher.jsx for
// the picker UI (a native <input type="color"> the user can freely adjust).
//
// Deliberately NOT wired into every template: Developer's name is an
// animated gradient, Colorful Compact's name/section titles sit on a dark
// header and already carry their own multi-color per-section identity, and
// Navy Professional's name sits in white text on its dark sidebar — forcing
// any of these to a flat color would either be illegible or fight a design
// the template is built around. Those three keep their own look; every
// other template (plus the shared ATS-friendly/Minimal/techExec renderer)
// honors this picker on its name and section titles.
export const DEFAULT_CV_HEADING_COLOR = ''

// Seeds the native color input the first time the user opens the picker
// (before they've ever chosen a color of their own).
export const CV_HEADING_COLOR_SEED = '#1f2937'

// One-click presets shown above the color wheel / hex field, so a user who
// just wants "make the headings navy" doesn't have to reach for a picker.
// A restrained set of dark, print-safe heading colors; the wheel stays for
// anyone who wants something exact.
export const CV_HEADING_COLOR_PRESETS = [
  { color: '#1f2937', label: { en: 'Slate', fi: 'Liuske' } },
  { color: '#0f172a', label: { en: 'Ink', fi: 'Muste' } },
  { color: '#1e40af', label: { en: 'Navy', fi: 'Laivastonsininen' } },
  { color: '#7f1d1d', label: { en: 'Burgundy', fi: 'Viininpunainen' } },
  { color: '#166534', label: { en: 'Forest', fi: 'Metsänvihreä' } },
  { color: '#5b21b6', label: { en: 'Violet', fi: 'Violetti' } },
]

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function isValidCvHeadingColor(color) {
  return color === '' || HEX_COLOR_PATTERN.test(color)
}
