import { Card } from '../common/Card';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { getStatusColor } from '../../utils/thresholds';
import { formatRelativeTime } from '../../utils/formatters';
import type { DacUnit } from '../../types/domain';

interface UnitStatusGridProps {
  units: DacUnit[];
  isLoading?: boolean;
  error?: Error | null;
  onUnitClick?: (unit: DacUnit) => void;
}

/**
 * Grid component displaying DAC units with their status
 */
export function UnitStatusGrid({
  units,
  isLoading = false,
  error = null,
  onUnitClick,
}: UnitStatusGridProps) {
  if (isLoading) {
    return <LoadingState message="Loading units..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (units.length === 0) {
    return (
      <div className="empty-state">
        <p>No units found</p>
      </div>
    );
  }

  return (
    <div className="unit-grid">
      {units.map((unit) => {
        const statusColor = getStatusColor(unit.status);
        const handleClick = () => onUnitClick?.(unit);

        return (
          <Card
            key={unit.id}
            className={`unit-card ${onUnitClick ? 'clickable' : ''}`}
            onClick={handleClick}
          >
            <div className="unit-header">
              <div className="unit-status-indicator" style={{ backgroundColor: statusColor }} />
              <h3 className="unit-name">{unit.name}</h3>
            </div>
            {unit.location && (
              <p className="unit-location">📍 {unit.location}</p>
            )}
            <div className="unit-footer">
              <span className={`unit-status-badge status-${unit.status}`}>
                {unit.status}
              </span>
              {unit.lastUpdated && (
                <span className="unit-last-updated">
                  {formatRelativeTime(unit.lastUpdated)}
                </span>
              )}
            </div>
            <style jsx>{`
              .unit-card {
                padding: 1.25rem;
                transition: transform 0.2s, box-shadow 0.2s;
              }

              .unit-card.clickable {
                cursor: pointer;
              }

              .unit-card.clickable:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              }

              .unit-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
              }

              .unit-status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex-shrink: 0;
              }

              .unit-name {
                font-size: 1.125rem;
                font-weight: 600;
                color: #111827;
                margin: 0;
                flex: 1;
              }

              .unit-location {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0 0 0.75rem 0;
              }

              .unit-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 0.75rem;
                padding-top: 0.75rem;
                border-top: 1px solid #e5e7eb;
              }

              .unit-status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: capitalize;
              }

              .status-healthy {
                background-color: #d1fae5;
                color: #065f46;
              }

              .status-warning {
                background-color: #fef3c7;
                color: #92400e;
              }

              .status-critical {
                background-color: #fee2e2;
                color: #991b1b;
              }

              .unit-last-updated {
                font-size: 0.75rem;
                color: #9ca3af;
              }

              .empty-state {
                text-align: center;
                padding: 3rem;
                color: #6b7280;
              }
            `}</style>
          </Card>
        );
      })}
      <style jsx>{`
        .unit-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
      `}</style>
    </div>
  );
}

