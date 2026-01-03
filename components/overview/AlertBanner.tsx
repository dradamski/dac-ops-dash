import type { UnitStatus } from '../../types/domain';
import { getStatusColor } from '../../utils/thresholds';

interface AlertBannerProps {
  message: string;
  severity: UnitStatus;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Alert banner component for displaying important messages
 */
export function AlertBanner({
  message,
  severity,
  onDismiss,
  action,
}: AlertBannerProps) {
  const color = getStatusColor(severity);
  const backgroundColor = {
    healthy: '#d1fae5',
    warning: '#fef3c7',
    critical: '#fee2e2',
  }[severity];

  const textColor = {
    healthy: '#065f46',
    warning: '#92400e',
    critical: '#991b1b',
  }[severity];

  return (
    <div className="alert-banner" style={{ backgroundColor, color: textColor }}>
      <div className="alert-content">
        <div className="alert-indicator" style={{ backgroundColor: color }} />
        <p className="alert-message">{message}</p>
        {action && (
          <button className="alert-action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
      <style jsx>{`
        .alert-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .alert-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .alert-message {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          flex: 1;
        }

        .alert-action {
          padding: 0.375rem 0.75rem;
          background-color: transparent;
          border: 1px solid currentColor;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .alert-action:hover {
          opacity: 0.8;
        }

        .alert-dismiss {
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .alert-dismiss:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

