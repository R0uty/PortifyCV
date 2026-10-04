import { createEmptyLinks, createInitialCvData } from '../cvForm.js'

// An example CV is only its content. Everything it leaves out (section
// visibility, ordering, empty sections) comes from a fresh CV, exactly as
// if a user had typed it in. The result goes through parseImportedCvData
// unchanged, which check:template-pages enforces.
export function buildExampleCv(content) {
  const base = createInitialCvData()

  return {
    ...base,
    ...content,
    links: { ...createEmptyLinks(), ...content.links },
  }
}
