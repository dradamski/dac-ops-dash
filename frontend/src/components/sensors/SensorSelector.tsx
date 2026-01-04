import type { SensorType } from '../../types/domain';
import { formatSensorTypeName } from '../../utils/formatters';

interface SensorSelectorProps {
  selectedSensorType: SensorType | null;
  onSelect: (sensorType: SensorType) => void;
  availableSensorTypes?: SensorType[];
  disabled?: boolean;
}

const DEFAULT_SENSOR_TYPES: SensorType[] = ['co2', 'temperature', 'airflow', 'efficiency'];

/**
 * Dropdown selector for sensor types
 */
export function SensorSelector({
  selectedSensorType,
  onSelect,
  availableSensorTypes = DEFAULT_SENSOR_TYPES,
  disabled = false,
}: SensorSelectorProps) {
  return (
    <div className="sensor-selector">
      <label htmlFor="sensor-select" className="selector-label">
        Sensor Type
      </label>
      <select
        id="sensor-select"
        value={selectedSensorType || ''}
        onChange={(e) => onSelect(e.target.value as SensorType)}
        disabled={disabled}
        className="selector-input"
      >
        <option value="">Select a sensor type</option>
        {availableSensorTypes.map((sensorType) => (
          <option key={sensorType} value={sensorType}>
            {formatSensorTypeName(sensorType)}
          </option>
        ))}
      </select>
      <style jsx>{`
        .sensor-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .selector-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .selector-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background-color: white;
          color: #111827;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .selector-input:hover:not(:disabled) {
          border-color: #9ca3af;
        }

        .selector-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .selector-input:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

