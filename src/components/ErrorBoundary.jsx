import { Component } from 'react'

/**
 * ErrorBoundary
 * -------------
 * Last-resort catch for any render-time crash anywhere in the app tree.
 * Without this, a single thrown error blanks the entire site. With this,
 * the user sees a styled message and can reload.
 *
 * Only catches errors during render / lifecycle / constructors — not
 * async errors, event handlers, or rejected promises. Those still need
 * their own try/catch where they happen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Surface to the console in dev — silent in production to avoid leaking internals.
    if (typeof console !== 'undefined' && console.error) {
      console.error('Render error caught by boundary:', error, info)
    }
  }

  handleReload = () => {
    try {
      window.location.reload()
    } catch {
      /* if even reload fails, nothing more we can do here */
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center grain"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}
      >
        <p
          className="editorial-label mb-6"
          style={{ color: 'var(--accent)' }}
        >
          — Folio · 0X
        </p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95] mb-6 max-w-3xl">
          A formula <br />
          <span className="italic" style={{ color: 'var(--fg-muted)' }}>
            failed to settle.
          </span>
        </h1>
        <p
          className="max-w-md leading-relaxed mb-10"
          style={{ color: 'var(--fg-muted)' }}
        >
          Something in the page would not compose. The dispatch will resume
          on reload. If the error persists, the concierge will hear of it.
        </p>
        <button
          onClick={this.handleReload}
          className="editorial-label tracking-[0.32em] uppercase text-xs px-8 py-4 border transition-colors hover:opacity-80"
          style={{
            borderColor: 'var(--hairline)',
            color: 'var(--fg)',
          }}
        >
          Reload the page →
        </button>
      </div>
    )
  }
}
