import TemplateThumbnailImage from './TemplateThumbnailImage'

// A fanned stack of 3 real templates (their pre-rendered thumbnails, made
// from the live renderer by `npm run thumbnails`) — the hero's "picture
// of the result," not a hand-made marketing mockup. Minimalist sits on top and
// dead-center (black-on-white, so it doesn't fight the hero's own
// monochrome type); Developer and Creative peek out behind it specifically
// to show the range — dark/technical and warm/colorful — a single template
// can't.
const STACK_TEMPLATES = [
  { id: 'creative', modifier: 'back-left' },
  { id: 'developer', modifier: 'back-right' },
  { id: 'minimal', modifier: 'front' },
]

function LandingHeroPreview({ locale = 'en', label = '' }) {
  return (
    <div className="landing-preview__stack" role="img" aria-label={label}>
      {STACK_TEMPLATES.map(({ id, modifier }) => (
        <div key={id} className={`landing-preview__thumb landing-preview__thumb--${modifier}`}>
          <TemplateThumbnailImage
            templateId={id}
            locale={locale}
            loading="eager"
            fetchPriority={modifier === 'front' ? 'high' : undefined}
          />
        </div>
      ))}
    </div>
  )
}

export default LandingHeroPreview
