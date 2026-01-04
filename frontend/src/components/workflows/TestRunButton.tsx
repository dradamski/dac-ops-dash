interface TestRunButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  unitName?: string;
}

/**
 * Button component for triggering test runs
 */
export function TestRunButton({
  onClick,
  isLoading = false,
  disabled = false,
  unitName,
}: TestRunButtonProps) {
  const buttonText = unitName
    ? `Run Test on ${unitName}`
    : 'Run Test';

  return (
    <button
      className="test-run-button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner" />
          Running Test...
        </>
      ) : (
        buttonText
      )}
      <style jsx>{`
        .test-run-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .test-run-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .test-run-button:active:not(:disabled) {
          background-color: #1d4ed8;
        }

        .test-run-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}

