import { cvTemplates } from '../utils/cvTemplates'
import { ROUTES } from '../utils/routes'

// Read off the template registry, like the other pages' counts.
const TEMPLATE_COUNT = cvTemplates.length

function getAboutCopy(locale, onNavigateToView) {
  if (locale === 'fi') {
    return {
      kicker: 'Tietoa',
      title: 'Tietoa PortifyCV:stä',
      intro:
        'PortifyCV on ilmainen, selaimessa toimiva CV-rakentaja. Ei tiliä, '
        + 'ei palvelinta, ei automaattista tallennusta — teet CV:n, viet sen '
        + 'tiedostona tai jakolinkkinä, ja siinä se.',
      sections: [
        {
          heading: 'Mikä PortifyCV on',
          paragraphs: [
            'PortifyCV auttaa kokoamaan siistin, tulostuskelpoisen ansioluettelon '
            + 'muutamassa minuutissa. Muokkaat CV:tä suoraan sivulla (tai '
            + `perinteisellä lomakkeella), valitset ${TEMPLATE_COUNT} pohjasta, joissa `
            + 'kussakin on kolme tyyliä, ja mukana on ATS-ystävällinen tila '
            + 'hakijaseurantajärjestelmiä varten, vienti PDF-, Word-, HTML- ja '
            + 'JSON-muodossa sekä CV:si pohjalta luotava hakemuskirjeluonnos. Koko '
            + 'käyttöliittymä toimii sekä englanniksi että suomeksi.',
            'Kaikki toiminnot ovat ilmaisia. Ei vesileimoja, ei maksumuurin takana '
            + 'olevia pohjia eikä pakollista rekisteröitymistä.',
          ],
        },
        {
          heading: 'Miten se toimii',
          paragraphs: [
            'PortifyCV on staattinen verkkosovellus, joka toimii kokonaan '
            + 'selaimessasi. Sillä ei ole taustapalvelinta eikä tietokantaa. '
            + 'Kaikki mitä kirjoitat, pysyy välilehden muistissa istunnon ajan, '
            + 'eikä sitä lähetetä minnekään. CV poistuu laitteeltasi vain, jos '
            + 'itse viet tiedoston tai luot jakolinkin.',
            {
              parts: [
                'Tarkempi kuvaus tietojen käsittelystä on ',
                {
                  link: ROUTES.privacy,
                  view: 'privacy',
                  text: 'tietosuojaselosteessa',
                  onNavigateToView,
                },
                '.',
              ],
            },
          ],
        },
        {
          heading: 'Kuka sen tekee',
          paragraphs: [
            'PortifyCV on riippumaton yhden kehittäjän projekti. Sitä ei tue '
            + 'mikään yritys eikä sijoittaja — se on rakennettu, koska ilmaiselle '
            + 'ja yksinkertaiselle CV-työkalulle ilman tilipakkoa oli tarvetta.',
          ],
        },
        {
          heading: 'Miten se rahoitetaan',
          paragraphs: [
            'PortifyCV on ja pysyy ilmaisena. Palvelun ylläpitokulujen '
            + 'kattamiseksi sivustolla näytetään mainoksia Google AdSensen '
            + 'kautta.',
            {
              parts: [
                'ETA-alueella, Yhdistyneessä kuningaskunnassa ja Sveitsissä '
                + 'näytetään Googlen sertifioima suostumusilmoitus, ja '
                + 'mainosevästeiden käyttö on kuvattu ',
                {
                  link: ROUTES.privacy,
                  view: 'privacy',
                  text: 'tietosuojaselosteessa',
                  onNavigateToView,
                },
                '. Mainoksilla ei ole pääsyä CV-sisältöösi.',
              ],
            },
          ],
        },
        {
          heading: 'Yhteystiedot',
          paragraphs: [
            {
              parts: [
                'Kysymykset, virheilmoitukset ja palaute: ',
                { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
                '.',
              ],
            },
          ],
        },
      ],
    }
  }

  return {
    kicker: 'About',
    title: 'About PortifyCV',
    intro:
      'PortifyCV is a free, browser-based CV builder. No account, no server, '
      + 'no automatic saving — you build a CV, take it away as a file or a '
      + 'share link, and that is it.',
    sections: [
      {
        heading: 'What PortifyCV is',
        paragraphs: [
          'PortifyCV helps you put together a clean, print-ready CV in a few '
          + 'minutes. You edit the CV right on the page (or in a classic form), '
          + `choose from ${TEMPLATE_COUNT} templates with three looks each, and get an `
          + 'ATS-friendly mode for applicant tracking systems, export to PDF, '
          + 'Word, HTML, and JSON, and a cover letter drafted from your CV. The '
          + 'whole interface works in both English and Finnish.',
          'Every feature is free. There are no watermarks, no paywalled '
          + 'templates, and no required sign-up.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'PortifyCV is a static web app that runs entirely in your browser. '
          + 'It has no backend server and no database. Everything you type '
          + "stays in the tab's memory for the length of your session and is "
          + 'never uploaded anywhere. Your CV leaves your device only if you '
          + 'choose to export a file or generate a share link.',
          {
            parts: [
              'The full detail on data handling is in the ',
              {
                link: ROUTES.privacy,
                view: 'privacy',
                text: 'privacy policy',
                onNavigateToView,
              },
              '.',
            ],
          },
        ],
      },
      {
        heading: 'Who makes it',
        paragraphs: [
          'PortifyCV is an independent, one-developer project. It is not '
          + 'backed by a company or an investor — it exists because a free, '
          + 'straightforward CV tool that does not demand an account was '
          + 'worth building.',
        ],
      },
      {
        heading: 'How it is funded',
        paragraphs: [
          'PortifyCV is free and will stay free. To cover the cost of '
          + 'running it, the site shows ads through Google AdSense.',
          {
            parts: [
              'In the EEA, the UK, and Switzerland a Google-certified '
              + 'consent message is shown, and the use of advertising '
              + 'cookies is described in the ',
              {
                link: ROUTES.privacy,
                view: 'privacy',
                text: 'privacy policy',
                onNavigateToView,
              },
              '. Ads have no access to your CV content.',
            ],
          },
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          {
            parts: [
              'Questions, bug reports, and feedback: ',
              { link: 'mailto:portifycv@gmail.com', text: 'portifycv@gmail.com' },
              '.',
            ],
          },
        ],
      },
    ],
  }
}

function RichParagraph({ parts }) {
  return (
    <p>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>
        }

        if (part.link) {
          const isExternal = part.link.startsWith('http')
          const isMailto = part.link.startsWith('mailto:')

          return (
            <a
              key={index}
              href={part.link}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              onClick={
                part.view && !isExternal && !isMailto
                  ? (event) => {
                      if (
                        event.defaultPrevented
                        || event.button !== 0
                        || event.metaKey
                        || event.ctrlKey
                        || event.shiftKey
                        || event.altKey
                      ) {
                        return
                      }
                      event.preventDefault()
                      part.onNavigateToView(part.view)
                    }
                  : undefined
              }
            >
              {part.text}
            </a>
          )
        }

        return null
      })}
    </p>
  )
}

function AboutPage({ locale = 'en', onNavigateToView = () => {} }) {
  const copy = getAboutCopy(locale === 'fi' ? 'fi' : 'en', onNavigateToView)

  return (
    <section className="legal-page">
      <div className="legal-page__inner">
        <p className="legal-page__kicker">{copy.kicker}</p>
        <h1 className="legal-page__title">{copy.title}</h1>

        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) =>
              typeof paragraph === 'string' ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <RichParagraph key={index} parts={paragraph.parts} />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default AboutPage
