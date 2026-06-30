export default function Field({
  label,
  error,
  required = false,
  children,
  labelClassName = 'text-gray-300',
}) {
  return (
    <label className="block">
      <span className={`text-sm font-medium ${labelClassName}`}>
        {label}
        {required ? <span className="ml-1 text-gray-500">*</span> : null}
      </span>
      {children}
      {error ? <p className="mt-2 text-xs text-gray-500">{error}</p> : null}
    </label>
  )
}
