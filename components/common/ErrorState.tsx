import { ReactNode } from 'react';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  children?: ReactNode;
}

/**
 * Error state component for displaying errors
 */
export function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
  children,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{errorMessage}</p>
      {children}
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
      <style jsx>{`
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          gap: 1rem;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .error-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .error-message {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
          max-width: 400px;
        }

        .retry-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .retry-button:hover {
          background-color: #2563eb;
        }

        .retry-button:active {
          background-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}

