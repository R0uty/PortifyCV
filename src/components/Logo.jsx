export default function Logo({ className = '', size = 40 }) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      aria-hidden="true"
    />
  )
}
