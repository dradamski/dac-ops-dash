import { Card } from '../common/Card';
import { getStatusColor } from '../../utils/thresholds';
import type { UnitStatus } from '../../types/domain';

interface SystemStatusCardProps {
  status: UnitStatus;
  count: number;
  title?: string;
}

/**
 * Card component displaying system status summary
 */
export function SystemStatusCard({
  status,
  count,
  title,
}: SystemStatusCardProps) {
  const statusLabels: Record<UnitStatus, string> = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
  };

  const color = getStatusColor(status);
  const displayTitle = title || statusLabels[status];

  return (
    <Card className="system-status-card">
      <div className="status-content">
        <div className="status-indicator" style={{ backgroundColor: color }} />
        <div className="status-info">
          <h4 className="status-title">{displayTitle}</h4>
          <p className="status-count">{count} unit{count !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <style jsx>{`
        .system-status-card {
          padding: 1.25rem;
        }

        .status-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-info {
          flex: 1;
        }

        .status-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.25rem 0;
        }

        .status-count {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
      `}</style>
    </Card>
  );
}

