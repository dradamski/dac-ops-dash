import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import type { TestResults, SensorType } from '../../types/domain';
import { formatSensorValue } from '../../utils/formatters';

interface TestResultsPanelProps {
  results: TestResults;
  testId?: string;
  unitId: string;
}

/**
 * Map metric names to sensor types
 */
function mapMetricToSensorType(metricName: string): SensorType | null {
  const name = metricName.toLowerCase();
  if (name.includes('co₂') || name.includes('co2') || name.includes('capture')) {
    return 'efficiency'; // CO₂ Capture Rate maps to Capture Efficiency
  }
  if (name.includes('efficiency')) {
    return 'efficiency';
  }
  if (name.includes('temperature') || name.includes('temp')) {
    return 'temperature';
  }
  if (name.includes('airflow') || name.includes('air flow')) {
    return 'airflow';
  }
  if (name.includes('pressure')) {
    // System Pressure doesn't have a direct sensor type, return null
    return null;
  }
  return null;
}

/**
 * Panel component displaying test run results
 */
export function TestResultsPanel({ results, testId, unitId }: TestResultsPanelProps) {
  const navigate = useNavigate();
  const { passed, metrics, summary } = results;

  const handleMetricClick = (metricName: string) => {
    const sensorType = mapMetricToSensorType(metricName);
    const params = new URLSearchParams({ unitId });
    if (sensorType) {
      params.set('sensorType', sensorType);
    }
    navigate(`/sensors?${params.toString()}`);
  };

  return (
    <Card
      title={testId ? `Test Results: ${testId}` : 'Test Results'}
      className={passed ? 'test-passed' : 'test-failed'}
    >
      <div className="results-header">
        <span className={`result-badge ${passed ? 'passed' : 'failed'}`}>
          {passed ? '✓ Passed' : '✗ Failed'}
        </span>
      </div>

      <div className="results-summary">
        <p>{summary}</p>
      </div>

      <div className="results-metrics">
        <h4 className="metrics-title">Metrics</h4>
        <div className="metrics-list">
          {metrics.map((metric, index) => {
            const inRange = metric.threshold
              ? (!metric.threshold.min || metric.value >= metric.threshold.min) &&
              (!metric.threshold.max || metric.value <= metric.threshold.max)
              : true;

            const sensorType = mapMetricToSensorType(metric.name);
            const isClickable = !!sensorType;

            return (
              <div
                key={index}
                className={`metric-item ${isClickable ? 'clickable' : ''}`}
                onClick={isClickable ? () => handleMetricClick(metric.name) : undefined}
                title={isClickable ? 'Click to view sensor data' : undefined}
              >
                <div className="metric-header">
                  <span className="metric-name">
                    {metric.name}
                    {isClickable && <span className="click-hint">🔗</span>}
                  </span>
                  <span className={`metric-status ${inRange ? 'in-range' : 'out-of-range'}`}>
                    {inRange ? '✓' : '✗'}
                  </span>
                </div>
                <div className="metric-value">
                  {formatSensorValue(metric.value, metric.unit)}
                </div>
                {metric.threshold && (
                  <div className="metric-threshold">
                    Range: {metric.threshold.min ?? 'N/A'} - {metric.threshold.max ?? 'N/A'}{' '}
                    {metric.unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .test-passed {
          border-left: 4px solid #10b981;
        }

        .test-failed {
          border-left: 4px solid #ef4444;
        }

        .results-header {
          margin-bottom: 1rem;
        }

        .result-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .result-badge.passed {
          background-color: #d1fae5;
          color: #065f46;
        }

        .result-badge.failed {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .results-summary {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 6px;
        }

        .results-summary p {
          margin: 0;
          color: #374151;
          line-height: 1.5;
        }

        .results-metrics {
          margin-top: 1.5rem;
        }

        .metrics-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metric-item {
          padding: 1rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .metric-item.clickable {
          cursor: pointer;
        }

        .metric-item.clickable:hover {
          border-color: #3b82f6;
          background-color: #f9fafb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .click-hint {
          margin-left: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .metric-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .metric-status {
          font-size: 1rem;
          font-weight: 600;
        }

        .metric-status.in-range {
          color: #10b981;
        }

        .metric-status.out-of-range {
          color: #ef4444;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .metric-threshold {
          font-size: 0.75rem;
          color: #6b7280;
        }
      `}</style>
    </Card>
  );
}

