import { isValidElement } from 'react'
import InternalNavLink from './InternalNavLink'
import { localizedHead, PATH_TO_VIEW, VIEW_HEAD } from '../utils/pageMeta'
import { localizePath, ROUTES } from '../utils/routes'

// The shared layout of the guide and example pages (1.6.38): breadcrumb,
// updated date and reading time, a link to the page in the other language,
// "On this page" (sticky beside the text on wide screens, a disclosure on
// phones), weak/strong examples as side-by-side cards, a "try it" box
// half-way down, the page's own call to action, and related pages as
// cards. Pages keep their copy as data (`sections`); this renders it.

const COPY = {
  en: {
    home: 'Home',
    onThisPage: 'On this page',
    updated: 'Updated',
    minRead: (minutes) => `${minutes} min read`,
    otherLanguage: 'Suomeksi',
    tryTitle: 'Try it on your own CV',
    tryBody: 'Open the builder and put this into practice. No account needed.',
    tryButton: 'Start building',
    related: 'Related',
  },
  fi: {
    home: 'Etusivu',
    onThisPage: 'Tällä sivulla',
    updated: 'Päivitetty',
    minRead: (minutes) => `${minutes} min lukuaika`,
    otherLanguage: 'In English',
    tryTitle: 'Kokeile omaan CV:hesi',
    tryBody: 'Avaa editori ja kokeile tätä käytännössä. Tiliä ei tarvita.',
    tryButton: 'Aloita rakentaminen',
    related: 'Katso myös',
  },
}

const WORDS_PER_MINUTE = 200
const WEAK_LABEL = /^(weak|heikko)/i
const STRONG_LABEL = /^(strong|vahva)/i

const sectionId = (index) => `section-${index + 1}`

// Every string in the page's copy, for the reading time. A JSX intro
// counts by its children only: in development an element also points at
// its owner component, which loops back to it.
function collectText(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(collectText)
  if (isValidElement(value)) return collectText(value.props.children)
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectText)
  return []
}

function formatDate(date, lang) {
  const parsed = new Date(`${date}T12:00:00Z`)
  return lang === 'fi'
    ? parsed.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' })
    : parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// A link in the copy is { before, linkText, linkTo, after }, linkTo an
// English path (InternalNavLink shows it in the page's language); the
// view to open is looked up from the path.
function LinkParagraph({ link, onNavigateToView }) {
  const view = link.view ?? PATH_TO_VIEW.get(link.linkTo)?.view
  return (
    <p>
      {link.before}
      <InternalNavLink to={link.linkTo} onNavigate={() => onNavigateToView(view)}>
        {link.linkText}
      </InternalNavLink>
      {link.after}
    </p>
  )
}

function ExamplePair({ pair }) {
  const tone = WEAK_LABEL.test(pair.weakLabel) && STRONG_LABEL.test(pair.strongLabel) ? 'compare' : 'neutral'
  return (
    <div className={`guide-pair guide-pair--${tone}`}>
      <div className="guide-pair__card guide-pair__card--first">
        <span className="guide-pair__label">{pair.weakLabel}</span>
        <p>{pair.weak}</p>
      </div>
      <div className="guide-pair__card guide-pair__card--second">
        <span className="guide-pair__label">{pair.strongLabel}</span>
        <p>{pair.strong}</p>
      </div>
    </div>
  )
}

export function GuideSection({ section, index, onNavigateToView, extra = null }) {
  return (
    <div className="guide__section" id={sectionId(index)}>
      <h2>{section.heading}</h2>
      {section.letter ? (
        <div className="guide-letter">
          {section.paragraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>
      ) : section.paragraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      {section.examplePair ? <ExamplePair pair={section.examplePair} /> : null}
      {section.list ? (
        <ul>
          {section.list.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
      {section.paragraphsAfter?.map((paragraph, i) => <p key={`after-${i}`}>{paragraph}</p>)}
      {section.linkParagraph ? <LinkParagraph link={section.linkParagraph} onNavigateToView={onNavigateToView} /> : null}
      {section.linkParagraphs?.map((link, i) => (
        <LinkParagraph key={`link-${i}`} link={link} onNavigateToView={onNavigateToView} />
      ))}
      {extra}
    </div>
  )
}

function GuideLayout({
  view,
  locale = 'en',
  kicker,
  title,
  intro,
  sections = null,
  tocItems = null,
  renderSectionExtra = null,
  children = null,
  cta,
  related = [],
  onGetStarted = () => {},
  onNavigateToView = () => {},
}) {
  const lang = locale === 'fi' ? 'fi' : 'en'
  const copy = COPY[lang]
  const head = localizedHead(VIEW_HEAD[view], lang)
  const date = VIEW_HEAD[view]?.dateModified ?? VIEW_HEAD[view]?.datePublished
  const parentView = VIEW_HEAD[view]?.parent
  const words = collectText([intro, sections, tocItems]).join(' ').split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  const otherLang = lang === 'fi' ? 'en' : 'fi'
  const toc = tocItems ?? (sections ?? []).map((section, index) => ({ id: sectionId(index), label: section.heading }))
  const midpoint = sections ? Math.ceil(sections.length / 2) : -1

  const tocList = (
    <ol className="guide__toc-list">
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.label}</a>
        </li>
      ))}
    </ol>
  )

  return (
    <section className="legal-page guide">
      <div className="guide__inner">
        <nav className="guide__breadcrumb" aria-label="Breadcrumb">
          <InternalNavLink to={ROUTES.landing} onNavigate={() => onNavigateToView('landing')}>{copy.home}</InternalNavLink>
          {parentView ? (
            <>
              <span aria-hidden="true">›</span>
              <InternalNavLink to={ROUTES[parentView]} onNavigate={() => onNavigateToView(parentView)}>
                {localizedHead(VIEW_HEAD[parentView], lang).title.replace(/ - PortifyCV$/, '')}
              </InternalNavLink>
            </>
          ) : null}
          <span aria-hidden="true">›</span>
          <span aria-current="page">{title}</span>
        </nav>

        <header className="guide__header">
          <p className="legal-page__kicker">{kicker}</p>
          <h1 className="legal-page__title">{title}</h1>
          <p className="guide__meta">
            {date ? (
              <span>
                {copy.updated} <time dateTime={date}>{formatDate(date, lang)}</time>
              </span>
            ) : null}
            <span>{copy.minRead(minutes)}</span>
            {/* A full page load on purpose: the other language's page is
                another address, and its twin link is in the <head> too. */}
            <a href={localizePath(head.path, otherLang)} hrefLang={otherLang} lang={otherLang}>
              {copy.otherLanguage} →
            </a>
          </p>
          {intro ? <p className="guide__intro">{intro}</p> : null}
        </header>

        <div className="guide__body">
          {toc.length > 1 ? (
            <aside className="guide__toc" aria-label={copy.onThisPage}>
              <p className="guide__toc-title">{copy.onThisPage}</p>
              {tocList}
            </aside>
          ) : null}

          <div className="guide__content">
            {toc.length > 1 ? (
              <details className="guide__toc-mobile">
                <summary>{copy.onThisPage}</summary>
                {tocList}
              </details>
            ) : null}

            {sections?.map((section, index) => (
              <div key={section.heading}>
                {index === midpoint && sections.length > 2 ? (
                  <aside className="guide__try" aria-label={copy.tryTitle}>
                    <div>
                      <p className="guide__try-title">{copy.tryTitle}</p>
                      <p className="guide__try-body">{copy.tryBody}</p>
                    </div>
                    <button type="button" className="landing-cta" onClick={() => onGetStarted()}>
                      {copy.tryButton}
                    </button>
                  </aside>
                ) : null}
                <GuideSection
                  section={section}
                  index={index}
                  onNavigateToView={onNavigateToView}
                  extra={renderSectionExtra ? renderSectionExtra(section) : null}
                />
              </div>
            ))}

            {children}

            {cta ? (
              <div className="legal-page__cta">
                <button type="button" className="landing-cta" onClick={() => cta.onClick ? cta.onClick() : onGetStarted()}>
                  {cta.label}
                </button>
                <span className="legal-page__cta-note">{cta.note}</span>
              </div>
            ) : null}

            {related.length ? (
              <div className="guide__related">
                <h2>{copy.related}</h2>
                <div className="guide__related-grid">
                  {related.map((item) => {
                    const relatedHead = localizedHead(VIEW_HEAD[item.view], lang)
                    return (
                      <InternalNavLink
                        key={`${item.view}${item.search ?? ''}`}
                        to={`${VIEW_HEAD[item.view].path}${item.search ?? ''}`}
                        onNavigate={() => onNavigateToView(item.view, { search: item.search ?? '' })}
                        className="examples-hub-card"
                      >
                        <span className="examples-hub-card__title">{item.title ?? relatedHead.title.replace(/ - PortifyCV$/, '')}</span>
                        <span className="examples-hub-card__body">{relatedHead.description}</span>
                      </InternalNavLink>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default GuideLayout
