import { createContext } from 'react'

// True inside a marketing preview of a CV (the template thumbnails on the
// landing page, the Free CV Templates grid and the builder gallery, and a
// template page's example). There the CV's name and section titles are
// part of a picture, not of the page, so CvHeading renders them without
// heading tags: otherwise a crawler reads 36 "John Doe" <h1>s on the front
// page. The builder's own previews and exports keep real headings.
export const DecorativeHeadingsContext = createContext(false)
