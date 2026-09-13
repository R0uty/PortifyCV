// Layout-assembly functions for styled Word export (C2/C3) — each template
// maps to one of these via DOCX_ARCHETYPES (added in a later task once
// buildGridTableBody and buildLabelGridBody also exist). Every function
// here takes already-built docx nodes (the output of docxExport.js's
// existing 20 section builders) and wraps them in a table-based layout —
// none of them build or recolor section content themselves; that stays
// docxExport.js's job (see its withPalette primitive for text color).
// See docs/superpowers/specs/2026-09-13-word-export-c2-c3-design.md.

import { Table, TableRow, TableCell, WidthType, ShadingType, Paragraph, BorderStyle } from 'docx'
import { NO_CELL_BORDERS } from './docxExport'

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
