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
              if (node.textContent.trim()) {
                nodeOffsets.push({ node, start: currentOffset, end: currentOffset + node.textContent.length })
                textNodes.push(node)
                currentOffset += node.textContent.length
              }
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
                reported.add(word)
                add('mid-word-break', `"${word}" in ${label(container)}`)
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
