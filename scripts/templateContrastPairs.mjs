// Check-only contrast data for the template style variants, read by
// scripts/check-template-variants.mjs and nothing else. It lives here, not
// in src/utils/templateVariants.js, so the app bundle never ships it.
//
// `textPairs`: every text colour a template's Showcase draws on one of its
// backgrounds, traced from real CSS usage. Each side is a palette variable
// of the template (`--min-ink` …), `--tpl-accent` (the look's accent), or
// a literal colour. The check resolves each pair for all of the template's
// looks and requires 4.5:1 (`size: 'body'`) or 3:1 (`size: 'large'`).
//
// `defaultContrastExceptions` (optional, none today): a pair of variant #1
// that is knowingly below the floor, as
// `{ foreground, background, ratio: '3.19', reason }`. The check fails if
// the recorded ratio is no longer exact or the pair now passes, so a fixed
// exception has to be removed. All 13 were fixed in 1.6.9.

const ACCENT = '--tpl-accent'

export const TEMPLATE_CONTRAST_PAIRS = {
  minimal: {
    textPairs: [
      { foreground: '--min-ink', background: '--min-bg', size: 'body' },
      { foreground: '--min-muted', background: '--min-bg', size: 'body' },
      { foreground: '--min-accent-ink', background: '--min-bg', size: 'body' },
      { foreground: '--min-accent-ink', background: '--min-accent-soft', size: 'body' },
      { foreground: '--min-accent-text', background: '--min-bg', size: 'body' },
    ],
  },
  developer: {
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
  },
  creative: {
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
  },
  modern: {
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
  },
  executive: {
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
  },
  timeline: {
    textPairs: [
      { foreground: '--tl-text', background: '--tl-bg', size: 'body' },
      { foreground: '--tl-muted', background: '--tl-bg', size: 'body' },
      { foreground: ACCENT, background: '--tl-bg', size: 'body' },
      { foreground: '--tl-ink', background: '--tl-bg', size: 'body' },
    ],
  },
  graduate: {
    textPairs: [
      { foreground: '--gr-ink', background: '--gr-bg', size: 'body' },
      { foreground: '--gr-ink-muted', background: '--gr-bg', size: 'body' },
      { foreground: ACCENT, background: '--gr-bg', size: 'body' },
    ],
  },
  compact: {
    textPairs: [
      { foreground: '--cp-ink', background: '--cp-bg', size: 'body' },
      { foreground: '--cp-ink-muted', background: '--cp-bg', size: 'body' },
      { foreground: ACCENT, background: '--cp-bg', size: 'body' },
    ],
  },
  portfolio: {
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
  },
  techExec: {
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
  },
  classicProfessional: {
    textPairs: [
      { foreground: '--cp-text', background: '--cp-bg', size: 'body' },
      { foreground: '--cp-muted', background: '--cp-bg', size: 'body' },
    ],
  },
  navyProfessional: {
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
  },
  modernOrange: {
    textPairs: [
      { foreground: '--mo-text', background: '--mo-bg', size: 'body' },
      { foreground: '--mo-text', background: '--mo-sidebar-bg', size: 'body' },
      { foreground: '--mo-muted', background: '--mo-bg', size: 'body' },
      { foreground: '--mo-muted', background: '--mo-sidebar-bg', size: 'body' },
      { foreground: ACCENT, background: '--mo-bg', size: 'body' },
      { foreground: ACCENT, background: '--mo-sidebar-bg', size: 'body' },
      { foreground: '#ffffff', background: ACCENT, size: 'body' },
    ],
  },
  colorfulCompact: {
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
  },
  quadrant: {
    textPairs: [
      { foreground: '--qd-text', background: '--qd-bg', size: 'body' },
      { foreground: '--qd-text', background: '--qd-card', size: 'body' },
      { foreground: '--qd-muted', background: '--qd-bg', size: 'body' },
      { foreground: '--qd-muted', background: '--qd-card', size: 'body' },
      { foreground: ACCENT, background: '--qd-bg', size: 'body' },
      { foreground: ACCENT, background: '--qd-card', size: 'body' },
    ],
  },
  editorial: {
    textPairs: [
      { foreground: '--ed-ink', background: '--ed-bg', size: 'body' },
      { foreground: '--ed-muted', background: '--ed-bg', size: 'body' },
      { foreground: '--ed-faint', background: '--ed-bg', size: 'body' },
      { foreground: ACCENT, background: '--ed-bg', size: 'body' },
    ],
  },
  portrait: {
    textPairs: [
      { foreground: '--pt-ink', background: '--pt-bg', size: 'body' },
      { foreground: '--pt-muted', background: '--pt-bg', size: 'body' },
      { foreground: '--pt-faint', background: '--pt-bg', size: 'body' },
      { foreground: ACCENT, background: '--pt-bg', size: 'body' },
      { foreground: 'rgba(255, 255, 255, 0.92)', background: ACCENT, size: 'large' },
    ],
  },
  european: {
    textPairs: [
      { foreground: '--eu-ink', background: '--eu-bg', size: 'body' },
      { foreground: '--eu-muted', background: '--eu-bg', size: 'body' },
      { foreground: '--eu-faint', background: '--eu-bg', size: 'body' },
      { foreground: ACCENT, background: '--eu-bg', size: 'body' },
    ],
  },
}
