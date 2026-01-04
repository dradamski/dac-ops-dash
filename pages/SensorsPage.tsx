import { useEffect } from 'react';
import { useFilters } from '../context/FilterContext';
import { useDacUnits } from '../hooks/useDacUnits';
import { useSensorData } from '../hooks/useSensorData';
import { SensorChart } from '../components/sensors/SensorChart';
import { SensorSelector } from '../components/sensors/SensorSelector';
import { TimeRangePicker } from '../components/sensors/TimeRangePicker';
import { Card } from '../components/common/Card';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import type { SensorType } from '../types/domain';

/**
 * Sensors page for viewing sensor data charts
 */
export function SensorsPage() {
  const { units, isLoading: unitsLoading } = useDacUnits();
  const {
    selectedUnitId,
    selectedSensorType,
    timeRange,
    setSelectedUnitId,
    setSelectedSensorType,
    setTimeRange,
  } = useFilters();

  // Set default unit if none selected
  useEffect(() => {
    if (!selectedUnitId && units.length > 0) {
      setSelectedUnitId(units[0].id);
    }
  }, [selectedUnitId, units, setSelectedUnitId]);

  // Set default time range if none set
  useEffect(() => {
    if (!timeRange) {
      const end = new Date();
      const start = new Date();
      start.setHours(start.getHours() - 24);
      setTimeRange({ start, end });
    }
  }, [timeRange, setTimeRange]);

  const {
    data: sensorData,
    isLoading: dataLoading,
    error,
    refetch,
  } = useSensorData({
    filter: {
      unitId: selectedUnitId || undefined,
      sensorType: selectedSensorType || undefined,
      timeRange: timeRange || undefined,
    },
    enabled: !!(selectedUnitId && selectedSensorType && timeRange),
  });

  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  if (unitsLoading) {
    return <LoadingState message="Loading units..." />;
  }

  return (
    <div className="sensors-page">
      <div className="page-header">
        <h1>Sensor Data</h1>
        <p className="page-subtitle">View real-time and historical sensor readings</p>
      </div>

      <div className="sensors-layout">
        <div className="sensors-controls">
          <Card title="Filters">
            <div className="controls-content">
              <div className="control-group">
                <label htmlFor="unit-select">Unit</label>
                <select
                  id="unit-select"
                  value={selectedUnitId || ''}
                  onChange={(e) => setSelectedUnitId(e.target.value || null)}
                  className="select-input"
                >
                  <option value="">Select a unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <SensorSelector
                selectedSensorType={selectedSensorType}
                onSelect={(sensorType: SensorType) => setSelectedSensorType(sensorType)}
              />

              <TimeRangePicker
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </div>
          </Card>
        </div>

        <div className="sensors-chart">
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : !selectedUnitId || !selectedSensorType || !timeRange ? (
            <Card>
              <div className="empty-state">
                <p>Please select a unit, sensor type, and time range to view data.</p>
              </div>
            </Card>
          ) : dataLoading ? (
            <Card>
              <LoadingState message="Loading sensor data..." />
            </Card>
          ) : sensorData.length === 0 ? (
            <Card>
              <div className="empty-state">
                <p>No data available for the selected filters.</p>
              </div>
            </Card>
          ) : (
            <Card title={selectedUnit?.name || 'Sensor Data'}>
              <SensorChart
                data={sensorData}
                sensorType={selectedSensorType}
                height={400}
              />
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        .sensors-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .sensors-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
        }

        .sensors-controls {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .controls-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .select-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background-color: white;
          color: #111827;
          cursor: pointer;
        }

        .select-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .sensors-chart {
          min-width: 0;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        @media (max-width: 1024px) {
          .sensors-layout {
            grid-template-columns: 1fr;
          }

          .sensors-controls {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

