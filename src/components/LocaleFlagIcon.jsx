// Small inline-SVG flag icons for the locale toggle (App.jsx's header button
// and Toolbar.jsx's builder toolbar button). Hand-drawn rather than the
// flag emoji (🇫🇮/🇬🇧) — those render as a generic "flag" placeholder glyph
// on a lot of Linux desktop environments (confirmed on this project's own
// dev platform) and, historically, as plain two-letter country codes on
// Windows, so an emoji flag is not a reliable "visual" flag for a chunk of
// this app's actual audience. These are simplified (not vexillologically
// exact — the Union Jack's counter-changed diagonal isn't reproduced) since
// at the ~16px button size that precision is imperceptible anyway.
export default function LocaleFlagIcon({ locale, className = '' }) {
  const classes = `locale-flag-icon ${className}`.trim()

  if (locale === 'fi') {
    return (
      <svg viewBox="0 0 18 11" width="1.1em" height="0.68em" className={classes} aria-hidden="true">
        <rect width="18" height="11" fill="#ffffff" />
        <rect x="5" width="3" height="11" fill="#002f6c" />
        <rect y="4" width="18" height="3" fill="#002f6c" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 10" width="1.1em" height="0.55em" className={classes} aria-hidden="true">
      <rect width="20" height="10" fill="#00247d" />
      <polygon points="0,0 3,0 20,8.5 20,10 17,10 0,1.5" fill="#ffffff" />
      <polygon points="20,0 17,0 0,8.5 0,10 3,10 20,1.5" fill="#ffffff" />
      <polygon points="0,0 1.5,0 20,9.3 20,10 18.5,10 0,0.7" fill="#cf142b" />
      <polygon points="20,0 18.5,0 0,9.3 0,10 1.5,10 20,0.7" fill="#cf142b" />
      <rect x="8" width="4" height="10" fill="#ffffff" />
      <rect y="3.5" width="20" height="3" fill="#ffffff" />
      <rect x="8.8" width="2.4" height="10" fill="#cf142b" />
      <rect y="4.2" width="20" height="1.6" fill="#cf142b" />
    </svg>
  )
}
