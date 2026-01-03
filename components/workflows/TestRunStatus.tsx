import type { TestRunStatus as TestRunStatusType } from '../../types/domain';
import { formatRelativeTime, formatTimestamp } from '../../utils/formatters';

interface TestRunStatusProps {
  status: TestRunStatusType;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

const STATUS_CONFIG: Record<
  TestRunStatusType,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: 'Pending',
    color: '#6b7280',
    bgColor: '#f3f4f6',
  },
  running: {
    label: 'Running',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: '#fee2e2',
  },
};

/**
 * Component displaying test run status
 */
export function TestRunStatus({
  status,
  startedAt,
  completedAt,
  error,
}: TestRunStatusProps) {
  const config = STATUS_CONFIG[status];
  const duration = completedAt
    ? new Date(completedAt).getTime() - new Date(startedAt).getTime()
    : null;

  return (
    <div className="test-run-status">
      <div className="status-header">
        <span
          className="status-badge"
          style={{ color: config.color, backgroundColor: config.bgColor }}
        >
          {config.label}
        </span>
        {duration !== null && (
          <span className="duration">Duration: {formatDuration(duration)}</span>
        )}
      </div>
      <div className="status-details">
        <div className="detail-item">
          <span className="detail-label">Started:</span>
          <span className="detail-value">{formatTimestamp(startedAt)}</span>
        </div>
        {completedAt && (
          <div className="detail-item">
            <span className="detail-label">Completed:</span>
            <span className="detail-value">{formatTimestamp(completedAt)}</span>
          </div>
        )}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      <style jsx>{`
        .test-run-status {
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .duration {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-label {
          font-weight: 500;
          color: #6b7280;
        }

        .detail-value {
          color: #111827;
        }

        .error-message {
          padding: 0.75rem;
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #991b1b;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

