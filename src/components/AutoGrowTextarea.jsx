import { useEffect, useRef } from 'react'

export default function AutoGrowTextarea({
  className,
  value,
  onChange,
  placeholder,
  minHeight = 112,
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
      ref={textareaRef}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
    />
  )
}
