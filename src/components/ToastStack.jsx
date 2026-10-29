// `clearBottomBar`: Classic mode's bar pinned to the bottom of a phone or
// tablet screen is showing, so toasts sit above it rather than on it.
function ToastStack({ toasts = [], clearBottomBar = false }) {
  if (toasts.length === 0) {
    return null
  }

  const toastStyles = {
    success: {
      borderColor: '#111111',
      backgroundColor: 'rgba(17,17,17,0.92)',
      color: '#ffffff',
    },
    error: {
      borderColor: '#6b7280',
      backgroundColor: 'rgba(75,85,99,0.92)',
      color: '#ffffff',
    },
    info: {
      borderColor: 'rgba(0,0,0,0.2)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      color: '#111111',
    },
  }

  return (
    <div
      className={`toast-stack${clearBottomBar ? ' toast-stack--above-bar' : ''} pointer-events-none fixed right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3 print:hidden bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]`}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="fade-in-up border px-4 py-3 backdrop-blur"
          style={toastStyles[toast.type] || toastStyles.info}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
