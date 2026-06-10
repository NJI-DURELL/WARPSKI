import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Home, RotateCcw, Waves } from 'lucide-react';

interface ErrorPageProps {
  code?: string;
  title: string;
  message: string;
  showReload?: boolean;
}

/**
 * Branded full-screen error page. Used for 404 / 403 / runtime errors. Never
 * renders raw error text or URLs — only friendly, human copy.
 */
export function ErrorPage({ code = 'Error', title, message, showReload }: ErrorPageProps) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-5 text-center">
      <div className="grain absolute inset-0 opacity-30" />
      <div className="relative flex flex-col items-center">
        <span className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.4em] text-mist-muted">
          <Waves className="h-4 w-4 text-flame" /> WarpSki
        </span>
        <span className="font-display text-[clamp(4rem,18vw,10rem)] font-black leading-none text-flame">
          {code}
        </span>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-sm text-mist-muted">{message}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-flame">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          {showReload && (
            <button type="button" onClick={() => window.location.reload()} className="btn-ghost">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface BoundaryState {
  hasError: boolean;
}

/**
 * Catches uncaught render errors anywhere in the tree and shows a branded error
 * page instead of a white screen or a raw stack trace.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally not surfacing the error object to the UI. Hook a logging
    // service here in production if desired.
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="500"
          title="Something went wrong"
          message="An unexpected error occurred on our end. Please try again — your cart is safe."
          showReload
        />
      );
    }
    return this.props.children;
  }
}
