// index.html's AdSense tag, which the worker removes from the builder and
// from 404 pages (1.6.48). Its own module because the Workers runtime reads
// every export of worker/index.js as an entry point and won't start when
// one is a string (1.6.49).
export const ADSENSE_SCRIPT = 'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
