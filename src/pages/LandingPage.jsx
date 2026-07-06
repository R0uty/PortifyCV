import { getUiTheme } from '../utils/designSystem'

function getLandingCopy(locale) {
  if (locale === 'fi') {
    return {
      themeButton: 'Teema',
      startButton: 'Aloita rakentaminen',
      kicker: 'PortifyCV',
      title: 'Luo viimeistelty CV minuuteissa',
      subtitle: 'Selkeä CV-rakentaja pohjilla, live-esikatselulla ja nopeilla vientivaihtoehdoilla.',
      featuresLabel: 'Ominaisuudet',
      featureItems: [
        {
          title: 'Live CV-esikatselu',
          description: 'Näet muutokset heti, kun muokkaat tietojasi.',
        },
        {
          title: 'ATS-ystävällinen tila',
          description: 'Vaihda rekryjärjestelmille sopivaan muotoiluun tarvittaessa.',
        },
        {
          title: 'Vienti ja jakaminen',
          description: 'Lataa PDF, HTML tai JSON tai jaa suoran linkin kautta.',
        },
      ],
    }
  }

  return {
    themeButton: 'Theme',
    startButton: 'Start building',
    kicker: 'PortifyCV',
    title: 'Build a polished CV in minutes',
    subtitle: 'A focused CV builder with templates, live preview, and fast export options.',
    featuresLabel: 'Features',
    featureItems: [
      {
        title: 'Live CV preview',
        description: 'See changes instantly while you edit your details.',
      },
      {
        title: 'ATS-friendly mode',
        description: 'Switch to recruiter-safe formatting when you need it.',
      },
      {
        title: 'Export and share',
        description: 'Download PDF, HTML, JSON, or share with a direct link.',
      },
    ],
  }
}

function LandingPage({
  theme = 'dark',
  locale = 'en',
  onToggleTheme = () => {},
  onToggleLocale = () => {},
  onGetStarted,
}) {
  const ui = getUiTheme(theme)
  const isDark = theme === 'dark'
  const isFinnish = locale === 'fi'
  const copy = getLandingCopy(locale)

  return (
    <main className={`landing-page app-shell app-shell--${theme}`}>
      <section className="landing-hero">
        <div className="landing-controls">
          <button
            type="button"
            className={`action-button action-button--secondary border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
            onClick={onToggleTheme}
          >
            {copy.themeButton}: {isDark ? (isFinnish ? 'Vaalea' : 'Light') : (isFinnish ? 'Tumma' : 'Dark')}
          </button>
          <button
            type="button"
            className={`action-button action-button--secondary border px-3 py-2 text-xs font-semibold transition ${ui.button}`}
            onClick={onToggleLocale}
          >
            {isFinnish ? 'EN' : 'FI'}
          </button>
        </div>
        <p className="landing-kicker">{copy.kicker}</p>
        <h1 className="landing-title">{copy.title}</h1>
        <p className="landing-subtitle">{copy.subtitle}</p>
        <button type="button" className="landing-cta" onClick={onGetStarted}>
          {copy.startButton}
        </button>
      </section>

      <section className="landing-features" aria-label={copy.featuresLabel}>
        {copy.featureItems.map((item) => (
          <article key={item.title} className="landing-feature-card">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default LandingPage
