// Shared preset accent-color swatch sets for templates that expose a
// customizable accent color. A small curated set per "mood" rather than a
// free-form color input, so every choice stays on-brief for the template.
// Each template's registry entry in cvTemplates.js names the set it uses
// via `accent.swatchSet`; SettingsModal renders `getAccentSwatches(setName)`.

export const ACCENT_SWATCH_SETS = {
  // Warm set — orange first/default. Room to adapt without breaking a
  // warm, premium feel. (Originally the Modern Orange swatches.)
  warm: [
    { color: '#f28c00', label: { en: 'Orange', fi: 'Oranssi' } },
    { color: '#d97706', label: { en: 'Amber', fi: 'Meripihka' } },
    { color: '#c2410c', label: { en: 'Rust', fi: 'Ruoste' } },
    { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä' } },
    { color: '#1d4ed8', label: { en: 'Blue', fi: 'Sininen' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu' } },
  ],
  // Warm-coral set — coral first/default. Editorial warm range for the
  // Creative template; distinct from `warm` (which leads with Modern
  // Orange's #f28c00) by opening on a redder coral.
  warmCoral: [
    { color: '#e2572a', label: { en: 'Coral', fi: 'Koralli' } },
    { color: '#c2410c', label: { en: 'Rust', fi: 'Ruoste' } },
    { color: '#b45309', label: { en: 'Amber', fi: 'Meripihka' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu' } },
    { color: '#7c3aed', label: { en: 'Violet', fi: 'Violetti' } },
    { color: '#1f7a6c', label: { en: 'Teal', fi: 'Sinivihreä' } },
  ],
  // Cool set — violet first/default, restrained subtle range.
  // (Originally the Modern Timeline swatches.)
  cool: [
    { color: '#6d28d9', label: { en: 'Violet', fi: 'Violetti' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen' } },
    { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä' } },
    { color: '#059669', label: { en: 'Emerald', fi: 'Smaragdi' } },
    { color: '#b45309', label: { en: 'Amber', fi: 'Meripihka' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu' } },
  ],
}

export function getAccentSwatches(setName) {
  return ACCENT_SWATCH_SETS[setName] ?? ACCENT_SWATCH_SETS.cool
}
