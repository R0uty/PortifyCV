import { useEffect, useRef } from 'react'

// Anything not named here still reaches the textarea: FloatingField clones its
// child to inject `id` and the aria-* attributes that tie it to its label, and
// dropping them would leave the label pointing at nothing.
export default function AutoGrowTextarea({
  className,
  value,
  onChange,
  placeholder,
  minHeight = 112,
  ...rest
}) {
  const textareaRef = useRef(null)

  const resize = () => {
    const el = textareaRef.current

    if (!el) {
      return
    }

    // An empty textarea needs no measurement — skip it, because some
    // browsers factor the (possibly long) placeholder into scrollHeight
    // once the value is empty, which would wildly overgrow the field.
    if (!value) {
      el.style.height = `${minHeight}px`
      return
    }

    el.style.height = '0px'
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }

  useEffect(() => {
    resize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, value])

  useEffect(() => {
    // A field that mounts while an ancestor is mid-transition (a
    // collapsible card expanding, a panel entrance animation) gets measured
    // against a transient width, and nothing else re-triggers the effect
    // above once layout settles — so watch the row's own box and re-measure
    // whenever it actually changes size.
    const parent = textareaRef.current?.parentElement

    if (!parent || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => resize())
    observer.observe(parent)

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <textarea
      {...rest}
      ref={textareaRef}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
    />
  )
}
