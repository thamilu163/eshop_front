/**
 * Global Error Handler
 * 
 * Root-level error boundary for catastrophic failures.
 * Last resort error handling when all other boundaries fail.
 * 
 * @module app/global-error
 */

'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Component
 * 
 * Catches errors that bubble up past all other error boundaries.
 * Provides full HTML document fallback.
 * 
 * Note: This must be a full HTML document as it replaces the root layout.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    logger.error('Global error:', error);

    // Report to external service if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (
        window as unknown as {
          Sentry: { captureException: (e: Error) => void };
        }
      ).Sentry.captureException(error);
    }
  }, [error]);

  // Friendly handling for Next devtools simulated errors which can appear
  // during development when the segment explorer triggers a simulated
  // boundary. Convert the technical sentinel into a human-friendly message.
  const isDevtoolsSimulated =
    process.env.NODE_ENV !== 'production' &&
    (error?.message || '').includes('NEXT_DEVTOOLS_SIMULATED_ERROR');

  const displayMessage = isDevtoolsSimulated
    ? 'A development-only simulated error was triggered (Next devtools). This is not a production failure.'
    : error.message || 'An unexpected error occurred.';

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Application Error - eShop</title>
        {/* Styles moved to globals.css to avoid inline styles and CSP issues */}
      </head>
      <body>
        <div className="error-container">
          <div className="icon-container">
            <AlertOctagon className="icon" />
          </div>

          <h1>Application Error</h1>
          <p>{displayMessage}</p>

          {error.digest && (
            <p className="error-id">Error Reference: {error.digest}</p>
          )}

          <div className="button-group">
            <button onClick={reset}>Try Again</button>
            <button onClick={handleGoHome}>
              Go Home
            </button>
            <button onClick={handleReload} className="primary">
              Reload Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && !isDevtoolsSimulated && (
            <details style={{ marginTop: '2rem', textAlign: 'left' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  background: '#fafafa',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  border: '1px solid #e5e5e5',
                }}
              >
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
