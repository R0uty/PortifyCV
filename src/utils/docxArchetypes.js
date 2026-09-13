// Layout-assembly functions for styled Word export (C2/C3) — each template
// maps to one of these via DOCX_ARCHETYPES (added in a later task once
// buildGridTableBody and buildLabelGridBody also exist). Every function
// here takes already-built docx nodes (the output of docxExport.js's
// existing 20 section builders) and wraps them in a table-based layout —
// none of them build or recolor section content themselves; that stays
// docxExport.js's job (see its withPalette primitive for text color).
// See docs/superpowers/specs/2026-09-13-word-export-c2-c3-design.md.

import { Table, TableRow, TableCell, WidthType, ShadingType, Paragraph, BorderStyle } from 'docx'
import { sectionHeading, boldLine, plainLine, emptyNotice, descriptionLines, NO_CELL_BORDERS, META_SIZE } from './docxExport'
import { formatDateRange, formatLinkLabel, formatLinkDisplayValue } from './shared'

const RAIL_WIDTH_PERCENT = 32
const MAIN_WIDTH_PERCENT = 68
const DARK_SIDEBAR_FILL = '1F2937'

export function buildRailTableBody(mainChildren, railChildren, { railSide = 'right', dark = false } = {}) {
  const mainCell = new TableCell({
    width: { size: MAIN_WIDTH_PERCENT, type: WidthType.PERCENTAGE },
    borders: NO_CELL_BORDERS,
    children: mainChildren,
  })
  const railCell = new TableCell({
    width: { size: RAIL_WIDTH_PERCENT, type: WidthType.PERCENTAGE },
    borders: NO_CELL_BORDERS,
    ...(dark ? { shading: { fill: DARK_SIDEBAR_FILL, type: ShadingType.CLEAR } } : null),
    children: railChildren,
  })

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: railSide === 'left' ? [railCell, mainCell] : [mainCell, railCell],
        }),
      ],
    }),
  ]
}

const GRID_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' }
const GRID_CELL_BORDERS = { top: GRID_BORDER, bottom: GRID_BORDER, left: GRID_BORDER, right: GRID_BORDER }
const GRID_CELL_MARGINS = { top: 120, bottom: 120, left: 120, right: 120 }

export function buildGridTableBody(cellChildrenArrays) {
  const [topLeft, topRight, bottomLeft, bottomRight] = cellChildrenArrays

  const cell = (children) => new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: GRID_CELL_BORDERS,
    margins: GRID_CELL_MARGINS,
    children: children.length > 0 ? children : [new Paragraph({})],
  })

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell(topLeft), cell(topRight)] }),
        new TableRow({ children: [cell(bottomLeft), cell(bottomRight)] }),
      ],
    }),
  ]
}

const LABEL_GRID_LABEL_WIDTH = 22
const LABEL_GRID_VALUE_WIDTH = 78

function buildLabelGridRow(labelText, valueChildren) {
  const filteredValue = valueChildren.filter(Boolean)
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: LABEL_GRID_LABEL_WIDTH, type: WidthType.PERCENTAGE },
            borders: NO_CELL_BORDERS,
            children: labelText ? [boldLine(labelText, { size: META_SIZE })] : [new Paragraph({})],
          }),
          new TableCell({
            width: { size: LABEL_GRID_VALUE_WIDTH, type: WidthType.PERCENTAGE },
            borders: NO_CELL_BORDERS,
            children: filteredValue.length > 0 ? filteredValue : [new Paragraph({})],
          }),
        ],
      }),
    ],
  })
}

function buildLabelGridAbout(snapshot, copy) {
  if (!snapshot.about) {
    return [sectionHeading(copy.about), emptyNotice(copy.addSummary)]
  }
  return [sectionHeading(copy.about), buildLabelGridRow('', [plainLine(snapshot.about)])]
}

function buildLabelGridExperience(snapshot, copy) {
  if (snapshot.experience.length === 0) {
    return [sectionHeading(copy.experience), emptyNotice(copy.noExperience)]
  }
  const rows = snapshot.experience.map((item) => {
    const heading = [item.role, item.company].filter(Boolean).join(' @ ') || copy.untitledRole
    const metaLine = [item.company, item.location].filter(Boolean).join(' · ')
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const value = [
      boldLine(heading),
      metaLine ? plainLine(metaLine, { subtle: true, size: META_SIZE }) : null,
      ...descriptionLines(item.description),
    ]
    return buildLabelGridRow(dateRange, value)
  })
  return [sectionHeading(copy.experience), ...rows]
}

function buildLabelGridEducation(snapshot, copy) {
  if (snapshot.education.length === 0) {
    return [sectionHeading(copy.education), emptyNotice(copy.noEducation)]
  }
  const rows = snapshot.education.map((item) => {
    const heading = [item.degree, item.school].filter(Boolean).join(', ') || copy.educationEntry
    const metaLine = [item.school, item.location].filter(Boolean).join(' · ')
    const dateRange = formatDateRange(item.startDate, item.endDate)
    const value = [
      boldLine(heading),
      metaLine ? plainLine(metaLine, { subtle: true, size: META_SIZE }) : null,
    ]
    return buildLabelGridRow(dateRange, value)
  })
  return [sectionHeading(copy.education), ...rows]
}

function buildLabelGridSkills(snapshot, copy) {
  if (snapshot.skills.length === 0) {
    return [sectionHeading(copy.skills), emptyNotice(copy.addSkills)]
  }
  // Flat, not category-grouped — parseSkillCategories lives in
  // src/components/templates/shared.jsx (JSX, not importable from this
  // plain-JS file or from the Node-run check script). See this plan's
  // Global Constraints.
  return [sectionHeading(copy.skills), buildLabelGridRow('', [plainLine(snapshot.skills.join(', '))])]
}

function buildLabelGridProjects(snapshot, copy) {
  if (snapshot.projects.length === 0) {
    return []
  }
  const rows = snapshot.projects.map((item) => {
    const value = [
      item.name ? boldLine(item.name) : null,
      item.description ? plainLine(item.description) : null,
      item.stack ? plainLine(item.stack, { subtle: true, size: META_SIZE }) : null,
    ]
    return buildLabelGridRow(item.date ?? '', value)
  })
  return [sectionHeading(copy.projects), ...rows]
}

function buildLabelGridLinks(snapshot, copy) {
  const links = Object.entries(snapshot.links)
  if (links.length === 0) {
    return [sectionHeading(copy.links), emptyNotice(copy.noLinks)]
  }
  const rows = links.map(([key, value]) => buildLabelGridRow(formatLinkLabel(key), [plainLine(formatLinkDisplayValue(value))]))
  return [sectionHeading(copy.links), ...rows]
}

function buildLabelGridLanguages(snapshot, copy) {
  if (snapshot.languages.length === 0) {
    return []
  }
  const rows = snapshot.languages.map((item) => buildLabelGridRow(item.level ?? '', [plainLine(item.language)]))
  return [sectionHeading(copy.languages), ...rows]
}

function buildLabelGridCertificates(snapshot, copy) {
  if (snapshot.certificates.length === 0) {
    return []
  }
  const rows = snapshot.certificates.map((item) => {
    const text = [item.name, item.issuer].filter(Boolean).join(' – ')
    return buildLabelGridRow(item.year ?? '', [plainLine(text)])
  })
  return [sectionHeading(copy.certificates), ...rows]
}

const LABEL_GRID_SECTION_BUILDERS = {
  about: buildLabelGridAbout,
  experience: buildLabelGridExperience,
  education: buildLabelGridEducation,
  skills: buildLabelGridSkills,
  projects: buildLabelGridProjects,
  links: buildLabelGridLinks,
  languages: buildLabelGridLanguages,
  certificates: buildLabelGridCertificates,
}

export function buildLabelGridBody(sectionOrder, snapshot, copy, isVisible) {
  const rendered = new Set()
  const children = []

  const append = (section) => {
    const build = LABEL_GRID_SECTION_BUILDERS[section]
    if (build && !rendered.has(section) && isVisible(section)) {
      children.push(...build(snapshot, copy))
      rendered.add(section)
    }
  }

  sectionOrder.forEach(append)
  Object.keys(LABEL_GRID_SECTION_BUILDERS).forEach(append)

  return children
}
