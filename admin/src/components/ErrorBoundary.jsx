import { Component } from 'react';

/**
 * Global error boundary — catches render errors and shows a visible message
 * instead of a black screen. Future-proofs the app against similar issues.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, stack: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message, stack: error.stack };
  }

  componentDidCatch(error, info) {
    // Log to console for debugging
    console.error('🔥 React render error:', error, info);
  }

  handleReload = () => {
    // Clear any stale localStorage that might be causing the error
    try { localStorage.removeItem('mirrorpro-auth'); } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          background: '#0a0a0f',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '32px',
            background: '#1a1a24',
            borderRadius: '20px',
            border: '1px solid #2a2a38',
          }}>
            <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700 }}>
              ⚠️ Something went wrong
            </h1>
            <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              The admin panel hit an unexpected error. Try reloading — your session has been cleared.
            </p>
            <pre style={{
              margin: '0 0 16px',
              padding: '12px',
              background: '#0a0a0f',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#ff6b6b',
              overflow: 'auto',
              maxHeight: '200px',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}>
              {this.state.error}
              {'\n\n'}
              {this.state.stack?.split('\n').slice(0, 5).join('\n')}
            </pre>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload & Clear Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
