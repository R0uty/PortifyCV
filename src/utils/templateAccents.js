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
  // Cool-blue set — sky first/default. Compact's range: crisp blues plus a
  // near-mono slate for a purely typographic one-pager.
  coolBlue: [
    { color: '#0284c7', label: { en: 'Sky', fi: 'Taivas' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen' } },
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu' } },
  ],
  // Warm-gold set — gold first/default. Executive's range: restrained,
  // boardroom-appropriate alternatives, each dark enough to clear 4.5:1 on
  // white (the accent lands on the role line and metric text, not just icons).
  warmGold: [
    { color: '#b45309', label: { en: 'Gold', fi: 'Kulta' } },
    { color: '#92400e', label: { en: 'Umber', fi: 'Umbra' } },
    { color: '#9f1239', label: { en: 'Burgundy', fi: 'Viininpunainen' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä' } },
    { color: '#1e3a8a', label: { en: 'Navy', fi: 'Laivastonsininen' } },
    { color: '#15803d', label: { en: 'Forest', fi: 'Metsänvihreä' } },
  ],
  // Cool-indigo set — indigo first/default. Graduate's range: keeps the
  // established indigo identity, with cool alternatives that don't warm it up.
  coolIndigo: [
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo' } },
    { color: '#6d28d9', label: { en: 'Violet', fi: 'Violetti' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen' } },
    { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä' } },
    { color: '#059669', label: { en: 'Emerald', fi: 'Smaragdi' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu' } },
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

// A soft translucent fill derived from a chosen accent hex — for chip/badge
// backgrounds that must track a user-picked swatch. Returns a plain `rgba()`
// (which the html2canvas PDF export can rasterize, unlike `color-mix()`).
// Falls back to `fallbackHex` if `hex` is not a 3/6-digit hex string.
export function accentSoftFill(hex, alpha, fallbackHex) {
  const match = typeof hex === 'string' && hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  const raw = match ? match[1] : String(fallbackHex ?? '#000000').replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
