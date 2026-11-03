import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'

// The edge worker fills #seo-landing with the page's pre-rendered markup
// (1.6.49). Removing it before React rendered left only the header and
// footer on screen while the lazy page chunk loaded, and a blank template
// preview for a second or more (1.6.66). So when the block holds a real
// pre-rendered page, it stays on screen while React renders the same page
// invisibly on top of it, and swaps once React's copy has its heading (and,
// on a template page, its example CV) — or after a few seconds regardless.
// Anything else in the block (index.html's plain copy, the worker's
// no-JavaScript fallback) is unstyled text for crawlers: removed at once.
const seoLanding = document.getElementById('seo-landing')
const rootElement = document.getElementById('root')
if (seoLanding?.querySelector('.one-pager')) {
  const waitFor = ['h1', '[data-cv-name]'].filter((selector) => seoLanding.querySelector(selector))
  const isReady = () => waitFor.every((selector) => rootElement.querySelector(selector))
  rootElement.classList.add('root--behind-prerender')
  let observer = null
  let timer = 0
  const swap = () => {
    observer?.disconnect()
    window.clearTimeout(timer)
    seoLanding.remove()
    rootElement.classList.remove('root--behind-prerender')
  }
  observer = new MutationObserver(() => {
    if (isReady()) swap()
  })
  observer.observe(rootElement, { childList: true, subtree: true })
  timer = window.setTimeout(swap, 4000)
} else if (seoLanding) {
  seoLanding.remove()
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error ?? event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
