import { useId, cloneElement, isValidElement } from 'react'

export default function Field({
  label,
  error,
  required = false,
  children,
  labelClassName = 'text-gray-300',
}) {
  const errorId = useId()

  return (
    <label className="block">
      <span className={`text-xs font-semibold uppercase tracking-[0.06em] ${labelClassName}`}>
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </span>
      {error && isValidElement(children)
        ? cloneElement(children, { 'aria-describedby': errorId, 'aria-invalid': true })
        : children}
      {error ? <p id={errorId} className="mt-2 text-xs text-red-400">{error}</p> : null}
    </label>
  )
}
