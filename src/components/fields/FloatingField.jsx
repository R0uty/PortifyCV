import { cloneElement, isValidElement, useId } from 'react'

function FloatingField({
  label,
  error,
  required = false,
  children,
  className = '',
  alwaysFloat = false,
}) {
  const errorId = useId()
  const child = isValidElement(children) ? children : null

  const enhancedChild = child
    ? cloneElement(child, {
      placeholder: child.props.placeholder ?? ' ',
      'aria-describedby': error ? errorId : child.props['aria-describedby'],
      'aria-invalid': error ? true : child.props['aria-invalid'],
      className: `floating-field__control ${child.props.className ?? ''}`.trim(),
    })
    : children

  return (
    <div
      className={`floating-field${error ? ' floating-field--error' : ''}${alwaysFloat ? ' floating-field--always-float' : ''} ${className}`.trim()}
    >
      {enhancedChild}
      <label className="floating-field__label">
        {label}
        {required ? <span className="floating-field__required">*</span> : null}
      </label>
      {error ? <p id={errorId} className="floating-field__error">{error}</p> : null}
    </div>
  )
}

export default FloatingField
