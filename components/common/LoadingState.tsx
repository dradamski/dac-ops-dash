interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Loading state component with spinner
 */
export function LoadingState({ message = 'Loading...', size = 'medium' }: LoadingStateProps) {
  const sizeClass = {
    small: '1rem',
    medium: '2rem',
    large: '3rem',
  }[size];

  return (
    <div className="loading-state">
      <div className="spinner" style={{ width: sizeClass, height: sizeClass }} />
      {message && <p className="loading-message">{message}</p>}
      <style jsx>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
        }

        .spinner {
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-message {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

