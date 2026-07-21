function getLandingCopy(locale) {
  if (locale === 'fi') {
    return {
      startButton: 'Aloita rakentaminen',
      title: 'Rakenna CV',
      subtitle: 'Selkeä CV-rakentaja pohjilla, live-esikatselulla ja nopeilla vientivaihtoehdoilla.',
      trustLine: 'Ei kirjautumista. Ei tietojen tallennusta.',
    }
  }

  return {
    startButton: 'Start building',
    title: 'Build a CV',
    subtitle: 'A focused CV builder with templates, live preview, and fast export options.',
    trustLine: 'No login. No data saved.',
  }
}

function LandingPage({
  locale = 'en',
  onGetStarted = () => {},
}) {
  const copy = getLandingCopy(locale)

  return (
    <section className="landing-page">
      <div className="landing-hero">
        <h1 className="landing-title">{copy.title}</h1>
        <p className="landing-subtitle">{copy.subtitle}</p>
        <p className="landing-trust">{copy.trustLine}</p>
        <button type="button" className="landing-cta" onClick={onGetStarted}>
          {copy.startButton}
        </button>
      </div>
    </section>
  )
}

export default LandingPage
