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
  const generatedControlId = useId()
  const child = isValidElement(children) ? children : null
  // The label is a sibling of the control (the float effect keys off
  // :placeholder-shown + label), so it cannot label it implicitly. Pairing an id
  // with htmlFor is what gives the control its accessible name and makes a click
  // on the label focus it.
  const controlId = child?.props.id ?? generatedControlId

  const enhancedChild = child
    ? cloneElement(child, {
      id: controlId,
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
      <label className="floating-field__label" htmlFor={controlId}>
        {label}
        {required ? <span className="floating-field__required">*</span> : null}
      </label>
      {error ? <p id={errorId} className="floating-field__error">{error}</p> : null}
    </div>
  )
}

export default FloatingField
