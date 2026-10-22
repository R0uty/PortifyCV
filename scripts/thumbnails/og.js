// One 1200 × 630 share card per template and language (1.6.47): the
// template's name and a line of facts beside its pre-rendered thumbnail,
// on PortifyCV's grid paper. scripts/generate-thumbnails.mjs screenshots
// each [data-og] card into public/thumbnails/og/<template>-<locale>.jpg.
// Dev-only (served by `vite`, never built).
import '@fontsource-variable/inter'
import { getCvTemplates } from '../../src/utils/cvTemplates'
import { thumbnailImageSrc } from '../../src/utils/thumbnailImages'

const COPY = {
  en: { kicker: 'Free CV template', facts: 'No sign-up · PDF & Word · 3 looks' },
  fi: { kicker: 'Ilmainen CV-pohja', facts: 'Ei kirjautumista · PDF ja Word · 3 tyyliä' },
}

const style = document.createElement('style')
style.textContent = `
  .og { width: 1200px; height: 630px; box-sizing: border-box; position: relative; overflow: hidden;
    display: grid; grid-template-columns: 1fr 420px; gap: 56px; align-items: center; padding: 0 80px;
    font-family: 'Inter Variable', Inter, system-ui, sans-serif; color: #16161a;
    background-color: #fbfbfd;
    background-image: linear-gradient(to right, rgba(22,22,26,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(22,22,26,0.06) 1px, transparent 1px);
    background-size: 32px 32px; }
  .og__kicker { font-size: 22px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
  .og__name { margin: 18px 0 0; font-size: 76px; line-height: 1; font-weight: 800; letter-spacing: -0.03em; }
  .og__facts { margin-top: 28px; font-size: 26px; color: rgba(22,22,26,0.66); }
  .og__brand { position: absolute; left: 80px; bottom: 52px; font-size: 24px; font-weight: 800; letter-spacing: -0.01em; }
  .og__thumb { width: 420px; height: 487px; border: 1px solid rgba(22,22,26,0.12); background: #fff;
    box-shadow: 0 40px 80px -40px rgba(0,0,0,0.35); overflow: hidden; }
  .og__thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top left; display: block; }
`
document.head.appendChild(style)

const root = document.getElementById('cards')
const images = []
for (const locale of ['en', 'fi']) {
  for (const template of getCvTemplates(locale)) {
    const card = document.createElement('div')
    card.className = 'og'
    card.dataset.og = `${template.id}/${locale}`
    card.innerHTML = `
      <div>
        <div class="og__kicker">${COPY[locale].kicker}</div>
        <div class="og__name">${template.label}</div>
        <div class="og__facts">${COPY[locale].facts}</div>
      </div>
      <div class="og__thumb"><img alt="" src="${thumbnailImageSrc(template.id, 'default', locale)}"></div>
      <div class="og__brand">PortifyCV</div>`
    root.appendChild(card)
    images.push(card.querySelector('img'))
  }
}

Promise.all([
  document.fonts.ready,
  ...images.map((img) => (img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve }))),
]).then(() => { window.__ogReady = true })
