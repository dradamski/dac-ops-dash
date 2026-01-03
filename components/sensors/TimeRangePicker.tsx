import { useState } from 'react';
import type { TimeRange } from '../../types/domain';
import { formatTimestamp } from '../../utils/formatters';

interface TimeRangePickerProps {
  timeRange: TimeRange | null;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

const PRESET_RANGES = {
  '1h': { hours: 1, label: 'Last Hour' },
  '6h': { hours: 6, label: 'Last 6 Hours' },
  '24h': { hours: 24, label: 'Last 24 Hours' },
  '7d': { hours: 168, label: 'Last 7 Days' },
  '30d': { hours: 720, label: 'Last 30 Days' },
} as const;

/**
 * Component for selecting time ranges with presets
 */
export function TimeRangePicker({
  timeRange,
  onTimeRangeChange,
}: TimeRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const handlePresetClick = (hours: number) => {
    const end = new Date();
    const start = new Date();
    start.setHours(start.getHours() - hours);
    onTimeRangeChange({ start, end });
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (start < end) {
        onTimeRangeChange({ start, end });
        setShowCustom(false);
      }
    }
  };

  return (
    <div className="time-range-picker">
      <label className="picker-label">Time Range</label>
      <div className="picker-controls">
        <div className="preset-buttons">
          {Object.entries(PRESET_RANGES).map(([key, { hours, label }]) => (
            <button
              key={key}
              className="preset-button"
              onClick={() => handlePresetClick(hours)}
            >
              {label}
            </button>
          ))}
          <button
            className="preset-button"
            onClick={() => setShowCustom(!showCustom)}
          >
            Custom
          </button>
        </div>
        {showCustom && (
          <div className="custom-range">
            <div className="custom-inputs">
              <div>
                <label>Start</label>
                <input
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div>
                <label>End</label>
                <input
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
            <button className="apply-button" onClick={handleCustomSubmit}>
              Apply
            </button>
          </div>
        )}
      </div>
      {timeRange && (
        <div className="selected-range">
          {formatTimestamp(timeRange.start)} - {formatTimestamp(timeRange.end)}
        </div>
      )}
      <style jsx>{`
        .time-range-picker {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .picker-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .picker-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .preset-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .preset-button {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .custom-range {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .custom-inputs {
          display: flex;
          gap: 1rem;
        }

        .custom-inputs > div {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .custom-inputs label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .custom-inputs input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .apply-button {
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          align-self: flex-start;
        }

        .apply-button:hover {
          background-color: #2563eb;
        }

        .selected-range {
          font-size: 0.875rem;
          color: #6b7280;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}

