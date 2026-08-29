import { useId } from 'react'

function ToggleSwitch({ checked = false, onChange = () => {}, label, ariaLabel, disabled = false }) {
  const id = useId()

  return (
    <label className={`toggle-switch${disabled ? ' toggle-switch--disabled' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="toggle-switch__input"
        checked={checked}
        disabled={disabled}
        aria-label={label ? undefined : ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-switch__track" aria-hidden="true">
        <span className="toggle-switch__thumb" />
      </span>
      {label ? <span className="toggle-switch__label">{label}</span> : null}
    </label>
  )
}

export default ToggleSwitch
