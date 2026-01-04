import { Card } from '../common/Card';
import type { TestResults } from '../../types/domain';
import { formatSensorValue } from '../../utils/formatters';

interface TestResultsPanelProps {
  results: TestResults;
  testId?: string;
}

/**
 * Panel component displaying test run results
 */
export function TestResultsPanel({ results, testId }: TestResultsPanelProps) {
  const { passed, metrics, summary } = results;

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

            return (
              <div key={index} className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
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

