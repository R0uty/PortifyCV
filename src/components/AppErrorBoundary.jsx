import { Component } from 'react'

import { getUiTheme } from '../utils/designSystem'
import { builder } from '../i18n/builder'

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error('AppErrorBoundary caught:', error)
    }
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

function AppErrorBoundary({ children, theme = 'dark', panelTitle = 'Panel', locale = 'en' }) {
  const ui = getUiTheme(theme)
  const t = (key) => builder.t(locale, key)

  return (
    <ErrorBoundaryInner
      renderFallback={({ onRetry }) => (
        <section
          className={`fade-in-up p-5 sm:p-6 print:hidden ${ui.surface}`}
          style={{ border: '1px solid var(--app-border)' }}
          role="alert"
        >
          <p className="ds-kicker uppercase tracking-[0.14em] accent-text">{panelTitle}</p>
          <h3 className={`ds-section-title mt-2 font-bold uppercase tracking-[-0.02em] ${ui.textPrimary}`}>
            {t('errorBoundary.title')}
          </h3>
          <p className={`ds-body-sm mt-3 ${ui.textSecondary}`}>
            {t('errorBoundary.body')}
          </p>
          <button
            type="button"
            className={`mt-4 ui-button ${ui.button}`}
            onClick={onRetry}
          >
            {t('errorBoundary.retry')}
          </button>
        </section>
      )}
    >
      {children}
    </ErrorBoundaryInner>
  )
}

export default AppErrorBoundary
