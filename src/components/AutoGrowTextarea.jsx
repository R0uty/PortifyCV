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

  useEffect(() => {
    if (!textareaRef.current) {
      return
    }

    textareaRef.current.style.height = '0px'
    textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`
  }, [minHeight, value])

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
