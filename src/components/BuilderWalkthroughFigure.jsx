// Hand-authored monochrome line schematics for the "How to Use the CV
// Builder" walkthrough — one per step. Deliberately abstract (not
// screenshots): 1.5px black strokes on white, matching the app's SVG
// template thumbnails and grid-paper chrome, so they never drift out of
// sync with the real UI. Each figure is labelled for screen readers; the
// internal shapes are decorative.

const STROKE = '#111111'

function StepNumber({ cx, cy, value }) {
  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} r="13" fill="#ffffff" stroke={STROKE} strokeWidth="1.5" />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fill={STROKE}
      >
        {value}
      </text>
    </g>
  )
}

function Figure({ label, children }) {
  return (
    <svg
      className="builder-walkthrough__svg"
      viewBox="0 0 460 150"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke={STROKE} strokeWidth="1.5">
        {children}
      </g>
    </svg>
  )
}

const FIGURES = {
  // 01 — Fill in your sections: editor frame, left rail with one item
  // highlighted, form fields, live preview on the right.
  sections: (label) => (
    <Figure label={label}>
      <rect x="12" y="14" width="436" height="122" />
      <rect x="12" y="14" width="62" height="122" />
      <line x1="24" y1="36" x2="62" y2="36" />
      <line x1="24" y1="50" x2="62" y2="50" />
      <rect x="20" y="58" width="46" height="14" strokeWidth="2.5" />
      <line x1="24" y1="86" x2="58" y2="86" />
      <line x1="24" y1="100" x2="62" y2="100" />
      <rect x="94" y="32" width="150" height="15" />
      <rect x="94" y="58" width="150" height="30" />
      <rect x="94" y="98" width="150" height="26" />
      <rect x="266" y="26" width="168" height="100" />
      <line x1="282" y1="44" x2="418" y2="44" strokeWidth="2" />
      <line x1="282" y1="60" x2="396" y2="60" strokeWidth="1" />
      <line x1="282" y1="72" x2="418" y2="72" strokeWidth="1" />
      <line x1="282" y1="84" x2="360" y2="84" strokeWidth="1" />
      <StepNumber cx={43} cy={65} value="1" />
    </Figure>
  ),

  // 02 — Tighten your bullets: a form field with bullet lines and an inline
  // flag marker beside a weak one.
  bullets: (label) => (
    <Figure label={label}>
      <rect x="40" y="20" width="300" height="110" />
      <circle cx="64" cy="44" r="2.5" fill={STROKE} />
      <line x1="78" y1="44" x2="300" y2="44" strokeWidth="1" />
      <circle cx="64" cy="68" r="2.5" fill={STROKE} />
      <line x1="78" y1="68" x2="264" y2="68" strokeWidth="1" />
      <circle cx="64" cy="92" r="2.5" fill={STROKE} />
      <line x1="78" y1="92" x2="284" y2="92" strokeWidth="1" />
      {/* flag pointing at the middle bullet */}
      <line x1="352" y1="68" x2="372" y2="68" strokeWidth="1" />
      <path d="M372 58 h26 l-6 10 l6 10 h-26 z" strokeWidth="1.5" />
      <line x1="384" y1="63" x2="384" y2="70" strokeWidth="1.5" />
      <circle cx="384" cy="75" r="1.4" fill={STROKE} stroke="none" />
      <StepNumber cx={53} cy={24} value="2" />
    </Figure>
  ),

  // 03 — Pick a template: three template cards, the middle one selected.
  template: (label) => (
    <Figure label={label}>
      <rect x="28" y="24" width="122" height="102" />
      <line x1="42" y1="42" x2="118" y2="42" strokeWidth="1" />
      <line x1="42" y1="54" x2="136" y2="54" strokeWidth="1" />
      <line x1="42" y1="64" x2="120" y2="64" strokeWidth="1" />
      <rect x="169" y="18" width="122" height="114" strokeWidth="3" />
      <line x1="183" y1="38" x2="259" y2="38" strokeWidth="1.5" />
      <line x1="183" y1="50" x2="277" y2="50" strokeWidth="1" />
      <line x1="183" y1="60" x2="277" y2="60" strokeWidth="1" />
      <line x1="183" y1="70" x2="245" y2="70" strokeWidth="1" />
      <rect x="310" y="24" width="122" height="102" />
      <line x1="324" y1="42" x2="400" y2="42" strokeWidth="1" />
      <line x1="324" y1="54" x2="418" y2="54" strokeWidth="1" />
      <StepNumber cx={230} cy={24} value="3" />
    </Figure>
  ),

  // 04 — Check it against the job: the "ATS score & suggestions" panel —
  // an ATS-friendly-mode toggle, a pasted job description, and a
  // matched / missing keyword list.
  ats: (label) => (
    <Figure label={label}>
      <rect x="40" y="18" width="380" height="114" />
      {/* header row: label + toggle (on) */}
      <line x1="58" y1="38" x2="180" y2="38" strokeWidth="2" />
      <rect x="366" y="30" width="34" height="16" rx="8" />
      <circle cx="392" cy="38" r="5" fill={STROKE} stroke="none" />
      {/* pasted job description box */}
      <rect x="58" y="54" width="150" height="60" />
      <line x1="70" y1="70" x2="196" y2="70" strokeWidth="1" />
      <line x1="70" y1="82" x2="196" y2="82" strokeWidth="1" />
      <line x1="70" y1="94" x2="172" y2="94" strokeWidth="1" />
      {/* keyword list: matched (check) and missing (plus) */}
      <path d="M232 62 l5 5 l10 -10" strokeWidth="2" />
      <line x1="256" y1="62" x2="360" y2="62" strokeWidth="1" />
      <path d="M232 82 l5 5 l10 -10" strokeWidth="2" />
      <line x1="256" y1="82" x2="336" y2="82" strokeWidth="1" />
      <path d="M234 100 h12 M240 94 v12" strokeWidth="2" />
      <line x1="256" y1="100" x2="352" y2="100" strokeWidth="1" />
      <StepNumber cx={53} cy={24} value="4" />
    </Figure>
  ),

  // 05 — Export or share: an open export menu (PDF / HTML / JSON) and a
  // share link URL line.
  export: (label) => (
    <Figure label={label}>
      <rect x="60" y="18" width="120" height="22" />
      <path d="M150 26 l8 8 l8 -8" strokeWidth="2" />
      <rect x="60" y="46" width="120" height="86" />
      <line x1="76" y1="66" x2="150" y2="66" strokeWidth="1.5" />
      <line x1="76" y1="88" x2="150" y2="88" strokeWidth="1.5" />
      <line x1="76" y1="110" x2="150" y2="110" strokeWidth="1.5" />
      {/* share link */}
      <rect x="238" y="60" width="162" height="30" rx="15" />
      <circle cx="258" cy="75" r="6" />
      <line x1="270" y1="75" x2="386" y2="75" strokeWidth="1" />
      <StepNumber cx={73} cy={24} value="5" />
    </Figure>
  ),

  // 06 — Keep your work safe: a settings panel with a "restore last
  // session" toggle switched on.
  restore: (label) => (
    <Figure label={label}>
      <rect x="90" y="20" width="280" height="110" />
      <line x1="110" y1="44" x2="230" y2="44" strokeWidth="1.5" />
      <line x1="110" y1="70" x2="200" y2="70" strokeWidth="1" />
      <rect x="300" y="60" width="42" height="20" rx="10" strokeWidth="2" />
      <circle cx="332" cy="70" r="6" fill={STROKE} stroke="none" />
      <line x1="110" y1="100" x2="240" y2="100" strokeWidth="1" />
      <StepNumber cx={103} cy={24} value="6" />
    </Figure>
  ),
}

export default function BuilderWalkthroughFigure({ step, label }) {
  const render = FIGURES[step]

  if (!render) {
    return null
  }

  return render(label)
}
