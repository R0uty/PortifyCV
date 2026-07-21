export default function Logo({ className = '', size = 40 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" fill="#111111" />
      <path
        d="M22 20h12c5.5 0 9 3.5 9 8s-3.5 8-9 8H28v8h-6V20Zm6 5v6h6c2.8 0 4.5-1.6 4.5-4s-1.7-4-4.5-4H28Z"
        fill="#ffffff"
      />
      <rect x="22" y="44" width="18" height="3" fill="#ffffff" opacity="0.4" />
    </svg>
  )
}
