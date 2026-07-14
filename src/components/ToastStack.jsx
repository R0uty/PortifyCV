import { getUiTheme } from '../utils/designSystem'

function ToastStack({ toasts = [], theme = 'dark' }) {
  if (toasts.length === 0) {
    return null
  }

  const ui = getUiTheme(theme)

  return (
    <div
      className={`pointer-events-none fixed right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3 print:hidden ${ui.toastOffset}`}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`fade-in-up rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${
            toast.type === 'success'
              ? 'border-emerald-300/50 bg-emerald-600/90 text-white'
              : toast.type === 'error'
                ? 'border-red-300/50 bg-red-600/90 text-white'
                : 'border-slate-300/50 bg-slate-700/90 text-white'
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
