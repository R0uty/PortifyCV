// Layout audit for rendered CVs (Phase 2 template polish). auditLayout runs
// in the browser against one rendered CV root and returns rule violations;
// the template harness (template-layout.spec.js) treats any violation that
// is not allowlisted as a failure. Rules map to docs/template-design-system.md
// §7 (content edge cases). Thresholds live here and nowhere else.

export const LAYOUT_THRESHOLDS = {
  maxNameLines: 2, // §7.1
  maxPages: 2.0, // Phase 2 decision: typical CV ≤ 2 A4 pages
  overflowTolerancePx: 2,
}

// Fonts change line breaks; measure only after they've loaded.
export async function waitForStableLayout(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

export async function auditLayout(page, rootSelector, opts = {}) {
  const violations = await page.evaluate(
    ({ rootSelector, thresholds, checkLength }) => {
      const root = document.querySelector(rootSelector)
      if (!root) return [{ rule: 'missing-root', detail: rootSelector }]

      const violations = []
      const add = (rule, detail) => violations.push({ rule, detail })
      const scale = root.getBoundingClientRect().width / root.offsetWidth || 1
      const rootRect = root.getBoundingClientRect()
      const isDecorative = (el) => Boolean(el.closest('[data-decorative]'))
      const label = (el) => `${el.tagName.toLowerCase()}.${String(el.className).trim().split(/\s+/)[0] || ''} "${(el.textContent || '').trim().slice(0, 40)}"`
      const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())

      // A word wider than its own containing block can't be rendered on one
      // line no matter what CSS the page uses — breaking it is unavoidable,
      // not a defect. Measures the word's natural (unbroken) width with an
      // off-DOM span cloned from the word's own element's computed font
      // properties, and compares it against `container`'s content width
      // (clientWidth minus horizontal padding). Reused across every word
      // this audit checks; one measuring span, its font re-set per word.
      const measuringSpan = document.createElement('span')
      measuringSpan.style.position = 'absolute'
      measuringSpan.style.visibility = 'hidden'
      measuringSpan.style.whiteSpace = 'nowrap'
      measuringSpan.style.left = '-99999px'
      measuringSpan.style.top = '0'
      document.body.appendChild(measuringSpan)

      const measureUnbrokenWidth = (word, fontEl) => {
        const cs = getComputedStyle(fontEl)
        measuringSpan.style.font = cs.font
        measuringSpan.style.fontFamily = cs.fontFamily
        measuringSpan.style.fontSize = cs.fontSize
        measuringSpan.style.fontWeight = cs.fontWeight
        measuringSpan.style.letterSpacing = cs.letterSpacing
        measuringSpan.style.textTransform = cs.textTransform
        measuringSpan.textContent = word
        return measuringSpan.getBoundingClientRect().width
      }

      // `clientWidth` is defined as 0 for a plain inline element (most of
      // the skill-chip `<span>`s this exemption exists for aren't
      // `display: block`/`inline-block`/flex themselves), so content width
      // has to come from `getBoundingClientRect()` instead — which is in
      // viewport (post-transform) px, unlike the off-DOM `measureUnbrokenWidth`
      // span above (outside any zoom transform the preview applies, so
      // always intrinsic px). Divide by `scale` to bring it back to the
      // same intrinsic frame before subtracting the (always intrinsic,
      // CSS-declared) padding.
      const elementContentWidth = (el) => {
        const cs = getComputedStyle(el)
        const paddingLeft = parseFloat(cs.paddingLeft) || 0
        const paddingRight = parseFloat(cs.paddingRight) || 0
        return el.getBoundingClientRect().width / scale - paddingLeft - paddingRight
      }

      // The width to compare a word's natural size against must be the
      // *most room this word could ever get*, not whatever width its own
      // flex item happens to render at right now — a flex item inside a
      // flex/grid row can itself be squeezed narrower than the row's own
      // available width (that squeeze, via a lowered min-content, is
      // exactly the defect this audit exists to catch). So walk up from
      // the word's own element to the nearest flex/grid *formatting
      // context* ancestor (the row/column itself, not the item) and use
      // its content width instead — stable regardless of how its children
      // currently happen to be laid out. Falls back to the word's nearest
      // block container (this file's existing `getBlockContainer`,
      // computed by the caller) when the word isn't inside a flex/grid row
      // at all.
      const widestAvailableWidth = (fontEl, fallbackContainer) => {
        let ancestor = fontEl
        while (ancestor && ancestor !== root.parentElement) {
          const display = getComputedStyle(ancestor).display
          if (['flex', 'grid', 'inline-flex', 'inline-grid'].includes(display)) {
            return elementContentWidth(ancestor)
          }
          ancestor = ancestor.parentElement
        }
        return elementContentWidth(fallbackContainer)
      }

      // Find ancestor that clips this element; return first clipping ancestor or null
      // Checks all four edges based on overflow-x/overflow-y settings
      const findClippingAncestor = (el) => {
        let ancestor = el.parentElement
        while (ancestor && ancestor !== root) {
          const cs = getComputedStyle(ancestor)
          const ancestorRect = ancestor.getBoundingClientRect()
          const elRect = el.getBoundingClientRect()

          // Check horizontal overflow
          if (['hidden', 'clip'].includes(cs.overflowX)) {
            if ((elRect.right - ancestorRect.right) / scale > thresholds.overflowTolerancePx ||
                (ancestorRect.left - elRect.left) / scale > thresholds.overflowTolerancePx) {
              return ancestor
            }
          }

          // Check vertical overflow
          if (['hidden', 'clip'].includes(cs.overflowY)) {
            if ((elRect.bottom - ancestorRect.bottom) / scale > thresholds.overflowTolerancePx ||
                (ancestorRect.top - elRect.top) / scale > thresholds.overflowTolerancePx) {
              return ancestor
            }
          }

          ancestor = ancestor.parentElement
        }
        return null
      }

      const isClippedByAncestor = (el) => findClippingAncestor(el) !== null

      for (const el of root.querySelectorAll('*')) {
        if (isDecorative(el)) continue
        const rect = el.getBoundingClientRect()
        if (!rect.width || !rect.height) continue

        // beyond-page: element extends past root's right edge, but not if clipped by intermediate ancestor
        if ((rect.right - rootRect.right) / scale > thresholds.overflowTolerancePx) {
          // Check if clipped by an intermediate ancestor (via shared helper)
          const clippingAncestor = findClippingAncestor(el)
          if (!clippingAncestor) {
            add('beyond-page', label(el))
          }
        }

        if (ownText(el)) {
          const cs = getComputedStyle(el)
          const hidesX = ['hidden', 'clip'].includes(cs.overflowX) || cs.textOverflow === 'ellipsis'
          const hidesY = ['hidden', 'clip'].includes(cs.overflowY)
          // Check for clipping on the element itself
          if ((hidesX && el.scrollWidth > el.clientWidth + 1) || (hidesY && el.scrollHeight > el.clientHeight + 1)) {
            add('clipped-text', label(el))
          }
          // Check for clipping by ancestor
          else if (isClippedByAncestor(el)) {
            add('clipped-text', label(el))
          }
        }
      }

      if (/will appear here|näky\S* tässä/i.test(root.innerText)) {
        add('placeholder', (root.innerText.match(/[^\n]*(will appear here|näky\S* tässä)[^\n]*/i) || [''])[0].slice(0, 60))
      }

      // Distinct line boxes = distinct rounded `top` values of the text's client rects.
      const lineCount = (el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const tops = []
        for (const r of range.getClientRects()) {
          if (r.width < 1) continue
          if (!tops.some((t) => Math.abs(t - r.top) < 3 * scale)) tops.push(r.top)
        }
        return tops.length
      }

      const names = [...root.querySelectorAll('[data-cv-name]')].filter((el) => el.getBoundingClientRect().width)
      if (names.length === 0) {
        add('name-lines', 'no visible [data-cv-name] element')
      } else {
        for (const el of names) {
          const lines = lineCount(el)
          if (lines > thresholds.maxNameLines) add('name-lines', `${lines} lines: "${el.textContent.trim()}"`)
        }
      }

      // A word whose glyphs land on two line boxes was broken mid-word.
      // URL/email-like tokens may break anywhere (that's the fix for clipped
      // links), and hyphens/slashes are legitimate break points.
      // Process text per block container, respecting block boundaries (no concatenation across blocks).
      const isBlockContainer = (el) => {
        if (el === root) return true
        const cs = getComputedStyle(el)
        const display = cs.display
        // Block-level and inline-block elements start new formatting contexts
        return ['block', 'flex', 'grid', 'list-item', 'table', 'table-cell', 'inline-block'].includes(display) ||
               // Flex/grid items are their own containers
               (el.parentElement && ['flex', 'grid'].includes(getComputedStyle(el.parentElement).display))
      }

      const getBlockContainer = (el) => {
        let current = el
        while (current && current !== root.parentElement) {
          if (isBlockContainer(current)) return current
          current = current.parentElement
        }
        return root
      }

      const reported = new Set()
      const blockContainers = new Set()
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.parentElement || isDecorative(node.parentElement)) continue
        blockContainers.add(getBlockContainer(node.parentElement))
      }

      for (const container of blockContainers) {
        // Concatenate text nodes in this container, respecting nested block boundaries
        const textNodes = []
        const nodeOffsets = []
        let currentOffset = 0

        // Collect all nested block containers to skip them
        const nestedBlockContainers = new Set()
        const findNestedBlocks = (el) => {
          for (const child of el.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE && isBlockContainer(child) && child !== container) {
              nestedBlockContainers.add(child)
              // Don't recurse into nested blocks; they're processed separately
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              findNestedBlocks(child)
            }
          }
        }
        findNestedBlocks(container)

        // Walk container's content, skipping text in nested block containers
        const walk = (el) => {
          for (const node of el.childNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && isDecorative(node)) continue
            if (nestedBlockContainers.has(node)) continue // Skip nested block containers entirely

            if (node.nodeType === Node.TEXT_NODE) {
              // Include whitespace-only nodes too — a lone space between two
              // adjacent inline elements (e.g. `<span>A</span> <span>B</span>`)
              // is a real text node and a real word boundary. Dropping it here
              // used to glue the words on either side into one fake token.
              nodeOffsets.push({ node, start: currentOffset, end: currentOffset + node.textContent.length })
              textNodes.push(node)
              currentOffset += node.textContent.length
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'BR') {
                // Add space for line break
                textNodes.push(' ')
                currentOffset += 1
              } else if (!isBlockContainer(node)) {
                // Recurse into non-block elements only
                walk(node)
              }
              // Skip recursion into block containers (they're processed separately)
            }
          }
        }
        walk(container)

        const concatenated = textNodes.map((n) => typeof n === 'string' ? n : n.textContent).join('')
        const tokens = /\S+/g
        for (let t = tokens.exec(concatenated); t; t = tokens.exec(concatenated)) {
          // URL/email-like tokens (any of @ . : /) may break anywhere.
          if (/[@.:/]/.test(t[0])) continue
          const parts = /[^\-–—]+/g
          for (let m = parts.exec(t[0]); m; m = parts.exec(t[0])) {
            const word = m[0]
            if (word.length < 4 || reported.has(word)) continue
            const start = t.index + m.index
            const end = start + word.length

            // Find which nodes contain the start and end of this word
            const startNodeInfo = nodeOffsets.find((no) => no.start <= start && start < no.end)
            const endNodeInfo = nodeOffsets.find((no) => no.start < end && end <= no.end)

            // Handle case where word spans multiple text nodes
            let endNode = endNodeInfo
            if (!endNode) {
              endNode = nodeOffsets.findLast((no) => no.start < end)
            }

            if (!startNodeInfo || !endNode) continue

            try {
              const range = document.createRange()
              range.setStart(startNodeInfo.node, Math.max(0, Math.min(start - startNodeInfo.start, startNodeInfo.node.textContent.length)))
              range.setEnd(endNode.node, Math.max(0, Math.min(end - endNode.start, endNode.node.textContent.length)))

              const tops = []
              for (const r of range.getClientRects()) {
                if (r.width >= 1 && !tops.some((t) => Math.abs(t - r.top) < 3 * scale)) tops.push(r.top)
              }
              if (tops.length > 1) {
                // Exempt a word that genuinely cannot fit its own row/
                // column on one line regardless of CSS — breaking it is
                // unavoidable there, not a layout defect (controller
                // ruling, Task 9 fix round 1).
                const fontEl = startNodeInfo.node.parentElement
                const unbrokenWidth = measureUnbrokenWidth(word, fontEl)
                const availableWidth = widestAvailableWidth(fontEl, container)
                if (unbrokenWidth <= availableWidth + thresholds.overflowTolerancePx) {
                  reported.add(word)
                  add('mid-word-break', `"${word}" in ${label(container)}`)
                }
              }
            } catch {
              // Skip if range is invalid
            }
          }
        }
      }

      if (checkLength) {
        const pages = root.offsetHeight / (root.offsetWidth * 1.414)
        if (pages > thresholds.maxPages) add('length', `${pages.toFixed(2)} A4 pages`)
      }

      measuringSpan.remove()

      return violations
    },
    { rootSelector, thresholds: LAYOUT_THRESHOLDS, checkLength: Boolean(opts.checkLength) },
  )

  // Filter out rules that are in the skipRules array
  if (opts.skipRules && opts.skipRules.length > 0) {
    return violations.filter((v) => !opts.skipRules.includes(v.rule))
  }

  return violations
}

// Splits violations into those not covered by the allowlist, and reports
// allowlist entries for this key that no longer match anything (stale), so
// a fixed defect forces its entry to be removed.
export function filterAllowlisted(violations, allowlist, key) {
  const entries = allowlist.filter((e) => e.template === key.template && e.subject === key.subject && e.mode === key.mode)
  const remaining = violations.filter((v) => !entries.some((e) => e.rule === v.rule))
  const staleEntries = entries.filter((e) => !violations.some((v) => v.rule === e.rule))
  return { remaining, staleEntries }
}
