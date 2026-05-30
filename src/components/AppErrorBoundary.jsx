import { Component } from 'react'

import { getUiTheme } from '../utils/designSystem'

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Intentionally silent in UI; fallback panel handles recovery.
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return this.props.renderFallback({ onRetry: this.handleRetry })
    }

    return this.props.children
  }
}

function AppErrorBoundary({ children, theme = 'dark', panelTitle = 'Panel' }) {
  const ui = getUiTheme(theme)

  return (
    <ErrorBoundaryInner
      renderFallback={({ onRetry }) => (
        <section
          className={`fade-in-up surface-shadow rounded-[var(--radius-card)] border p-5 sm:p-6 print:hidden ${ui.surface}`}
          role="alert"
        >
          <p className={`ds-kicker ${ui.textMuted}`}>{panelTitle}</p>
          <h3 className={`ds-section-title mt-2 font-semibold ${ui.textPrimary}`}>
            This section failed to render.
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            Try loading it again. Your CV data is still available.
          </p>
          <button
            type="button"
            className={`mt-4 rounded-full border px-4 py-2 text-sm font-medium transition ${ui.button}`}
            onClick={onRetry}
          >
            Retry panel
          </button>
        </section>
      )}
    >
      {children}
    </ErrorBoundaryInner>
  )
}

export default AppErrorBoundary