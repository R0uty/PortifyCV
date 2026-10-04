import { useEffect, useRef, useState } from 'react'

import CVPreview from './CVPreview'

// Same native width TemplateThumbnail renders at (see its comment): the CV
// lays out at real size, then scales down to the frame. Unlike the
// thumbnail, this shows the WHOLE CV, so the frame's height follows the
// scaled content instead of a fixed A4 crop.
const NATIVE_WIDTH = 780

function ScaledPreview({ formData, template, locale, atsFriendlyMode = false, accentColor }) {
  const frameRef = useRef(null)
  const pageRef = useRef(null)
  const [scale, setScale] = useState(null)
  const [height, setHeight] = useState(null)

  useEffect(() => {
    const frame = frameRef.current
    const pageEl = pageRef.current
    if (!frame || !pageEl) {
      return undefined
    }

    const measure = () => {
      const nextScale = frame.clientWidth / NATIVE_WIDTH
      setScale(nextScale)
      setHeight(pageEl.offsetHeight * nextScale)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(pageEl)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="scaled-preview" ref={frameRef} style={height ? { height } : undefined}>
      <div
        className="scaled-preview__page"
        ref={pageRef}
        aria-hidden="true"
        style={scale ? { transform: `scale(${scale})` } : undefined}
      >
        <CVPreview
          formData={formData}
          template={template}
          locale={locale}
          atsFriendlyMode={atsFriendlyMode}
          accentColor={accentColor}
        />
      </div>
    </div>
  )
}

export default ScaledPreview
