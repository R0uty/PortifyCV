// Fields an ATS layout has to carry even where a template's designer layout
// leaves them out (1.6.73). Timeline, Navy Professional and Modern Orange
// keep their own markup in ATS mode instead of the flat renderer, so they
// add these lines there, in ATS mode only, leaving their designer pages as
// they are. One line per value, as plain text an ATS can read.

const joinFilled = (values, separator = ' · ') => values.filter(Boolean).join(separator)

export function getEducationDetails(item) {
  return [item.honors, joinFilled([item.grade, item.coursework])].filter(Boolean)
}

export function getCertificateDetails(item, isFinnish) {
  return [
    item.expiry ? `${isFinnish ? 'Vanhenee' : 'Expires'} ${item.expiry}` : '',
    item.credentialUrl,
  ].filter(Boolean)
}

export function getProjectDetails(item) {
  return [
    joinFilled([item.organization, item.date]),
    item.impact,
    joinFilled([item.teamSize, item.contribution]),
    joinFilled([item.githubUrl, item.demoUrl]),
  ].filter(Boolean)
}
