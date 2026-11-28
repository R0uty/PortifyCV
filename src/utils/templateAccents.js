// Shared preset accent-color swatch sets for templates that expose a
// customizable accent color. A small curated set per "mood" rather than a
// free-form color input, so every choice stays on-brief for the template.
// Each template's registry entry in cvTemplates.js names the set it uses
// via `accent.swatchSet`; SettingsModal renders `getAccentSwatches(setName)`.

export const ACCENT_SWATCH_SETS = {
  // Warm set — orange first/default. Room to adapt without breaking a
  // warm, premium feel. (Originally the Modern Orange swatches.)
  warm: [
    { color: '#a56000', label: { en: 'Orange', fi: 'Oranssi', sv: 'Orange' } },
    { color: '#d97706', label: { en: 'Amber', fi: 'Meripihka', sv: 'Bärnsten' } },
    { color: '#c2410c', label: { en: 'Rust', fi: 'Ruoste', sv: 'Rost' } },
    { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#1d4ed8', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu', sv: 'Rosa' } },
  ],
  // Warm-coral set — coral first/default. Editorial warm range for the
  // Creative template; distinct from `warm` (which leads with Modern
  // Orange's #a56000) by opening on a redder coral.
  warmCoral: [
    { color: '#b43e18', label: { en: 'Coral', fi: 'Koralli', sv: 'Korall' } },
    { color: '#c2410c', label: { en: 'Rust', fi: 'Ruoste', sv: 'Rost' } },
    { color: '#b45309', label: { en: 'Amber', fi: 'Meripihka', sv: 'Bärnsten' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu', sv: 'Rosa' } },
    { color: '#7c3aed', label: { en: 'Violet', fi: 'Violetti', sv: 'Violett' } },
    { color: '#1f7a6c', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
  ],
  // Royal-blue set — royal blue first/default. Tech Executive's range:
  // corporate blues (with its own deep navy) plus restrained cool alternatives.
  royalBlue: [
    { color: '#2563eb', label: { en: 'Royal Blue', fi: 'Kuninkaansininen', sv: 'Kungsblå' } },
    { color: '#163d7a', label: { en: 'Navy', fi: 'Laivastonsininen', sv: 'Marinblå' } },
    { color: '#1d4ed8', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo', sv: 'Indigo' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
  ],
  // Cool-cyan set — cyan first/default. Quadrant's range: the one hue no
  // other template leads with, plus cool alternatives.
  coolCyan: [
    { color: '#0e7490', label: { en: 'Cyan', fi: 'Syaani', sv: 'Cyan' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#059669', label: { en: 'Emerald', fi: 'Smaragdi', sv: 'Smaragd' } },
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo', sv: 'Indigo' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
  ],
  // Cool-blue set — sky first/default. Compact's range: crisp blues plus a
  // near-mono slate for a purely typographic one-pager.
  coolBlue: [
    { color: '#0277b4', label: { en: 'Sky', fi: 'Taivas', sv: 'Himmelsblå' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo', sv: 'Indigo' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu', sv: 'Rosa' } },
  ],
  // Warm-gold set — gold first/default. Executive's range: restrained,
  // boardroom-appropriate alternatives, each dark enough to clear 4.5:1 on
  // white (the accent lands on the role line and metric text, not just icons).
  warmGold: [
    { color: '#b45309', label: { en: 'Gold', fi: 'Kulta', sv: 'Guld' } },
    { color: '#92400e', label: { en: 'Umber', fi: 'Umbra', sv: 'Umbra' } },
    { color: '#9f1239', label: { en: 'Burgundy', fi: 'Viininpunainen', sv: 'Vinröd' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#1e3a8a', label: { en: 'Navy', fi: 'Laivastonsininen', sv: 'Marinblå' } },
    { color: '#15803d', label: { en: 'Forest', fi: 'Metsänvihreä', sv: 'Skogsgrön' } },
  ],
  // Cool-indigo set — indigo first/default. Graduate's range: keeps the
  // established indigo identity, with cool alternatives that don't warm it up.
  coolIndigo: [
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo', sv: 'Indigo' } },
    { color: '#6d28d9', label: { en: 'Violet', fi: 'Violetti', sv: 'Violett' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#059669', label: { en: 'Emerald', fi: 'Smaragdi', sv: 'Smaragd' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu', sv: 'Rosa' } },
  ],
  // Forest-green set — emerald first/default. Portfolio Hybrid's range:
  // keeps the established emerald identity, with cool growth-adjacent
  // alternatives. Every hue clears 4.5:1 on white — the accent lands on the
  // kicker, dates and metric text, not just decorative marks.
  forestGreen: [
    { color: '#047857', label: { en: 'Emerald', fi: 'Smaragdi', sv: 'Smaragd' } },
    { color: '#15803d', label: { en: 'Forest', fi: 'Metsänvihreä', sv: 'Skogsgrön' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#0369a1', label: { en: 'Sky', fi: 'Taivas', sv: 'Himmelsblå' } },
    { color: '#4d7c0f', label: { en: 'Moss', fi: 'Sammal', sv: 'Mossa' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
  ],
  // Ink-crimson set — crimson first/default. Editorial's range: a
  // masthead-red accent plus restrained cool alternatives for a magazine
  // voice that otherwise stays monochrome.
  inkCrimson: [
    { color: '#9f1239', label: { en: 'Crimson', fi: 'Karmiini', sv: 'Karmosin' } },
    { color: '#7f1d1d', label: { en: 'Brick', fi: 'Tiili', sv: 'Tegel' } },
    { color: '#1e3a8a', label: { en: 'Navy', fi: 'Laivastonsininen', sv: 'Marinblå' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo', sv: 'Indigo' } },
  ],
  // Quiet-teal set — teal first/default. Portrait's range: a calm hue that
  // doesn't compete with a real human photo, plus restrained alternatives.
  quietTeal: [
    { color: '#0f766e', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#0e7490', label: { en: 'Cyan', fi: 'Syaani', sv: 'Cyan' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
    { color: '#4d7c0f', label: { en: 'Moss', fi: 'Sammal', sv: 'Mossa' } },
    { color: '#4f46e5', label: { en: 'Indigo', fi: 'Indigo', sv: 'Indigo' } },
    { color: '#9f1239', label: { en: 'Crimson', fi: 'Karmiini', sv: 'Karmosin' } },
  ],
  // Civic-blue set — blue first/default. European's range: a restrained
  // institutional blue plus cool alternatives, none of them any other
  // template's default.
  civicBlue: [
    { color: '#1d4ed8', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#0369a1', label: { en: 'Sky', fi: 'Taivas', sv: 'Himmelsblå' } },
    { color: '#334155', label: { en: 'Slate', fi: 'Liuske', sv: 'Skiffer' } },
    { color: '#15803d', label: { en: 'Forest', fi: 'Metsänvihreä', sv: 'Skogsgrön' } },
    { color: '#6d28d9', label: { en: 'Violet', fi: 'Violetti', sv: 'Violett' } },
    { color: '#9f1239', label: { en: 'Crimson', fi: 'Karmiini', sv: 'Karmosin' } },
  ],
  // Cool set — violet first/default, restrained subtle range.
  // (Originally the Modern Timeline swatches.)
  cool: [
    { color: '#6d28d9', label: { en: 'Violet', fi: 'Violetti', sv: 'Violett' } },
    { color: '#2563eb', label: { en: 'Blue', fi: 'Sininen', sv: 'Blå' } },
    { color: '#0d9488', label: { en: 'Teal', fi: 'Sinivihreä', sv: 'Blågrön' } },
    { color: '#059669', label: { en: 'Emerald', fi: 'Smaragdi', sv: 'Smaragd' } },
    { color: '#b45309', label: { en: 'Amber', fi: 'Meripihka', sv: 'Bärnsten' } },
    { color: '#be123c', label: { en: 'Rose', fi: 'Ruusu', sv: 'Rosa' } },
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

// A user-chosen accent darkened toward the template's ink, as plain hex —
// for accent-coloured text that must clear a contrast floor on a light
// surface whatever swatch is picked. Computed here, not with CSS
// color-mix(), because the PDF export pipeline can't rasterize color-mix()
// (design system §8). `inkShare` is the ink's share, 0–1.
export function accentInkMix(hex, inkHex, inkShare, fallbackHex) {
  const toRgb = (value, fallback) => {
    const match = typeof value === 'string' && value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
    const raw = match ? match[1] : String(fallback ?? '#000000').replace('#', '')
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
    return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16))
  }
  const accent = toRgb(hex, fallbackHex)
  const ink = toRgb(inkHex, '#000000')
  return `#${accent
    .map((channel, index) => Math.round(channel * (1 - inkShare) + ink[index] * inkShare).toString(16).padStart(2, '0'))
    .join('')}`
}
