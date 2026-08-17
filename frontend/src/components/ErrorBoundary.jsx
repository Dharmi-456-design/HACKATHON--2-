import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A1610] flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/50 border border-red-700/50 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-2xl bg-[#96CD7B] text-[#0A1610] font-bold text-sm hover:bg-[#7DB865] transition-colors cursor-pointer"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 text-xs text-red-400 text-left bg-red-950/30 p-4 rounded-xl overflow-auto max-h-48">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
