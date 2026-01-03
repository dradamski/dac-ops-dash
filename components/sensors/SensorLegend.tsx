import { formatSensorTypeName } from '../../utils/formatters';
import type { SensorType } from '../../types/domain';

interface SensorLegendProps {
  sensorType: SensorType | string;
  unit: string;
  value?: number;
}

/**
 * Legend component for sensor charts
 */
export function SensorLegend({ sensorType, unit, value }: SensorLegendProps) {
  const sensorName = formatSensorTypeName(sensorType as SensorType);

  return (
    <div className="sensor-legend">
      <div className="legend-content">
        <h3 className="legend-title">{sensorName}</h3>
        {value !== undefined && (
          <span className="legend-value">
            {value.toFixed(2)} {unit}
          </span>
        )}
      </div>
      <style jsx>{`
        .sensor-legend {
          margin-bottom: 1rem;
        }

        .legend-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .legend-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .legend-value {
          font-size: 1rem;
          font-weight: 500;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

