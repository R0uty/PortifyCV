// Builds each PDF page from the painted capture canvas (1.6.72). Where a page
// is cut is first chosen from DOM measurements, but html2canvas paints text a
// few px away from where the DOM puts it, so a cut the DOM calls safe can
// still run through a heading. These helpers read the painted pixels instead:
// a row that matches the row above it has nothing passing through it, so it
// is safe to cut at and safe to stretch, which is how a designer page's
// backgrounds and sidebars reach the edges of the paper.

// A pixel counts as changed past this summed RGB difference, so a soft
// background gradient doesn't. A row may have this share of changed pixels,
// so a slanted edge or a rounded corner doesn't make it busy.
const CHANGED_PIXEL_DIFFERENCE = 36
const BUSY_ROW_SHARE = 0.001
// Enough for the gap between two lines of tight text, in CSS px.
const QUIET_RUN_CSS_PX = 3
// How much of its box a line may have on the far side of a cut: a DOM box
// reaches above and below the glyphs painted in it.
const LINE_BOX_OVERLAP = 0.2

// For each canvas row, whether it matches the row above. Null when the pixels
// can't be read (a tainted canvas), which leaves the DOM-chosen cuts as they are.
export function measureQuietRows(canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context || canvas.width <= 0 || canvas.height <= 0) {
    return null
  }

  let data

  try {
    ({ data } = context.getImageData(0, 0, canvas.width, canvas.height))
  } catch {
    return null
  }

  const { width, height } = canvas
  const allowed = Math.max(1, Math.floor(width * BUSY_ROW_SHARE))
  const quiet = new Uint8Array(height)
  quiet[0] = 1

  for (let y = 1; y < height; y += 1) {
    const rowStart = y * width * 4
    let changed = 0

    for (let offset = 0; offset < width * 4 && changed <= allowed; offset += 4) {
      const here = rowStart + offset
      const above = here - width * 4
      const difference = Math.abs(data[here] - data[above])
        + Math.abs(data[here + 1] - data[above + 1])
        + Math.abs(data[here + 2] - data[above + 2])

      if (difference > CHANGED_PIXEL_DIFFERENCE) {
        changed += 1
      }
    }

    quiet[y] = changed <= allowed ? 1 : 0
  }

  return quiet
}

export function quietRunLength(scale) {
  return Math.max(2, Math.round(QUIET_RUN_CSS_PX * scale))
}

function isRunQuiet(quiet, bottomRow, runLength) {
  for (let y = bottomRow; y > bottomRow - runLength; y -= 1) {
    if (y < 0 || !quiet[y]) {
      return false
    }
  }

  return true
}

// Moves a cut up to the nearest painted gap, no higher than `floorY`. A gap
// inside a line's box doesn't count: the rows through the stems of a big
// "HILL" all match too. Keeps `y` when there is no gap, as in a tall photo.
export function snapCutToQuietRow(y, floorY, quiet, runLength, lineRanges = []) {
  if (!quiet) {
    return y
  }

  const isInsideLine = (row) => lineRanges.some(({ top, bottom }) => {
    const overlap = (bottom - top) * LINE_BOX_OVERLAP
    return row > top + overlap && row < bottom - overlap
  })

  for (let row = y; row > floorY; row -= 1) {
    if (isRunQuiet(quiet, row, runLength) && !isInsideLine(row)) {
      return row
    }
  }

  return y
}

// Whether a slice has anything painted in it at all, past its first row.
export function isSliceBlank(top, bottom, quiet) {
  if (!quiet) {
    return false
  }

  for (let y = top + 1; y < bottom; y += 1) {
    if (!quiet[y]) {
      return false
    }
  }

  return true
}

function findLongestGapMiddle(slice, contentBottom, quiet) {
  const start = Math.max(slice.top + 1, Math.ceil(contentBottom) + 1)
  let best = null
  let bestLength = 0
  let runStart = null

  for (let y = start; y <= slice.bottom; y += 1) {
    if (y < slice.bottom && quiet[y]) {
      runStart ??= y
      continue
    }

    if (runStart !== null && y - runStart > bestLength) {
      // Its middle, well away from whatever edge the gap ends at.
      best = runStart + Math.floor((y - runStart) / 2)
      bestLength = y - runStart
    }

    runStart = null
  }

  return best
}

// Without smoothing, or the neighbouring rows bleed in and a thin line beside
// this one fades down the page.
// The row to stretch so a last page reaches the bottom of the paper: the
// longest gap below the last section, so a template's closing band or footer
// stays at the page's bottom edge at its own height, or else below the last
// line of text, when a section runs right down to the bottom.
export function findLastPageStretchRow(slice, lastSectionBottom, lastTextBottom, quiet) {
  if (!quiet) {
    return null
  }

  return findLongestGapMiddle(slice, lastSectionBottom, quiet)
    ?? findLongestGapMiddle(slice, lastTextBottom, quiet)
}

function stretchRow(context, canvas, row, destinationY, height) {
  if (height > 0) {
    context.imageSmoothingEnabled = false
    context.drawImage(canvas, 0, row, canvas.width, 1, 0, destinationY, canvas.width, height)
    context.imageSmoothingEnabled = true
  }
}

// Paints one slice on a whole sheet of paper, with room above and below it
// filled by repeating the rows at its edges, so backgrounds run off the page
// instead of stopping at a white frame. A row with something passing through
// it isn't repeated, since that would smear; white shows there instead.
export function paintFullBleedPage(pageCanvas, canvas, slice, options) {
  const { paperHeightPx, topPadPx, isLastPage, stretchRowY, quiet } = options
  const context = pageCanvas.getContext('2d')
  const sliceHeight = slice.bottom - slice.top
  const belowSlice = topPadPx + sliceHeight

  pageCanvas.width = canvas.width
  pageCanvas.height = paperHeightPx
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

  if (topPadPx > 0 && quiet?.[slice.top] && quiet[slice.top + 1]) {
    stretchRow(context, canvas, slice.top, 0, topPadPx)
  }

  context.drawImage(canvas, 0, slice.top, canvas.width, sliceHeight, 0, topPadPx, canvas.width, sliceHeight)

  const room = paperHeightPx - belowSlice

  if (room <= 0) {
    return
  }

  if (isLastPage) {
    if (stretchRowY !== null) {
      const rowY = topPadPx + (stretchRowY - slice.top)
      const belowHeight = slice.bottom - stretchRowY
      stretchRow(context, canvas, stretchRowY, rowY, room)
      context.drawImage(canvas, 0, stretchRowY, canvas.width, belowHeight, 0, rowY + room, canvas.width, belowHeight)
    }

    return
  }

  if (quiet?.[slice.bottom - 1]) {
    stretchRow(context, canvas, slice.bottom - 1, belowSlice, room)
  }
}
