import { useCallback, useEffect, useRef, useState } from 'react'

// The Classic preview's paper width, 220mm in CSS px — .preview-zoom-wrapper's
// width in app-shell.css, and the width PDF export renders the CV at.
const PREVIEW_PAPER_WIDTH_PX = (220 / 25.4) * 96

// The Classic preview's zoom, moved out of ResumeBuilderPage.jsx (1.6.86):
// the zoom itself, whether Fit Width is in charge of it, the three elements
// it measures, and every control that changes it.
export default function usePreviewZoom({ builderMode, isResponsivePreview }) {
  // The CV the user sees in Classic mode's preview panel. previewRef is the
  // off-screen export source (the .direct-edit-export-source copy in
  // ResumeBuilderPage.jsx), which hides empty sections and gets .pdf-export-root's PDF-only
  // spacing — so anything sizing the visible preview, like Fit Page, has to
  // measure this one instead.
  const visiblePreviewRef = useRef(null)
  const previewViewportRef = useRef(null)
  const [zoomPercent, setZoomPercent] = useState(100)
  // Fit Width is the default: the Classic preview lays the CV out at its
  // paper width and scales it to the pane (see .preview-zoom-wrapper in
  // app-shell.css), re-fitting as the pane resizes. Any other zoom control
  // leaves it at the zoom picked.
  const [isFitWidthZoom, setIsFitWidthZoom] = useState(true)
  const previewStageRef = useRef(null)

  const clampZoomPercent = useCallback((value) => Math.round(Math.min(200, Math.max(40, value))), [])

  const handleSetZoomPercent = useCallback((value) => {
    setIsFitWidthZoom(false)
    setZoomPercent(clampZoomPercent(value))
  }, [clampZoomPercent])

  const handleZoomBy = useCallback((delta) => {
    setIsFitWidthZoom(false)
    setZoomPercent((value) => clampZoomPercent(value + delta))
  }, [clampZoomPercent])

  const handleFitWidth = useCallback(() => {
    setIsFitWidthZoom(true)
  }, [])

  // The zoom at which the paper-width CV fills the preview stage, capped at
  // actual size so a wide pane shows the page at 100% rather than blowing it
  // up. Narrow preview reflows the CV to its 26rem column instead of
  // scaling it, so it fits at 100%.
  useEffect(() => {
    const stage = previewStageRef.current

    if (!isFitWidthZoom || !stage) {
      return undefined
    }

    // A ResizeObserver reports the stage's size as soon as it starts
    // observing, so this also makes the first fit. The fit waits a frame:
    // a new zoom resizes the stage (its height, a scrollbar), and resizing
    // an observed box inside the observer's own callback is a loop error.
    let frame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (isResponsivePreview) {
          setZoomPercent(100)
        } else if (stage.clientWidth > 0) {
          const { paddingLeft, paddingRight } = getComputedStyle(stage)
          const width = stage.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)
          setZoomPercent(Math.max(25, Math.min(100, Math.floor((width / PREVIEW_PAPER_WIDTH_PX) * 100))))
        }
      })
    })

    observer.observe(stage)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
    // builderMode: the stage exists only in Classic, so coming over from
    // Direct Edit has to start the fit; it used to stay at 100% (1.6.83).
  }, [builderMode, isFitWidthZoom, isResponsivePreview])

  const handleFitPage = useCallback(() => {
    const viewport = previewViewportRef.current
    const content = visiblePreviewRef.current
    const zoomWrapper = content?.closest('.preview-zoom-wrapper')
    const availableHeight = viewport ? viewport.clientHeight - 48 : 0

    setIsFitWidthZoom(false)

    if (!zoomWrapper || availableHeight <= 0 || content.getBoundingClientRect().height <= 0) {
      setZoomPercent(100)
      return
    }

    // In Narrow preview the CV reflows to its zoomed width — zooming in
    // narrows its layout box and makes it taller — so its height at the
    // current zoom doesn't predict its height at any other. Binary-search the largest zoom whose
    // rendered height fits instead, writing each candidate straight onto the
    // wrapper so getBoundingClientRect forces a synchronous layout at it,
    // then restore React's value before committing the result. Falls back to
    // the 40% floor when even that overflows.
    const committedZoom = zoomWrapper.style.getPropertyValue('--preview-zoom')
    const fitsAt = (percent) => {
      zoomWrapper.style.setProperty('--preview-zoom', String(percent / 100))
      return content.getBoundingClientRect().height <= availableHeight
    }
    let low = 40
    let high = 200

    while (low < high) {
      const mid = Math.ceil((low + high) / 2)

      if (fitsAt(mid)) {
        low = mid
      } else {
        high = mid - 1
      }
    }

    zoomWrapper.style.setProperty('--preview-zoom', committedZoom)
    setZoomPercent(low)
  }, [])

  useEffect(() => {
    const viewport = previewViewportRef.current

    if (!viewport) {
      return undefined
    }

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        return
      }

      event.preventDefault()
      setIsFitWidthZoom(false)
      setZoomPercent((value) => clampZoomPercent(value - Math.sign(event.deltaY) * 5))
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      viewport.removeEventListener('wheel', handleWheel)
    }
  }, [clampZoomPercent])

  return {
    zoomPercent,
    isFitWidthZoom,
    previewStageRef,
    previewViewportRef,
    visiblePreviewRef,
    handleSetZoomPercent,
    handleZoomBy,
    handleFitWidth,
    handleFitPage,
  }
}
