import { useState } from 'react';
import { useDacUnits } from '../hooks/useDacUnits';
import { useTestRuns } from '../hooks/useTestRuns';
import { TestRunButton } from '../components/workflows/TestRunButton';
import { TestRunStatus } from '../components/workflows/TestRunStatus';
import { TestResultsPanel } from '../components/workflows/TestResultsPanel';
import { Card } from '../components/common/Card';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { formatTimestamp } from '../utils/formatters';

/**
 * Tests page for running and viewing test results
 */
export function TestsPage() {
  const { units, isLoading: unitsLoading } = useDacUnits();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTestRunId, setSelectedTestRunId] = useState<string | null>(null);

  const {
    testRuns,
    isLoading: runsLoading,
    error,
    refetch,
    triggerNewTest,
  } = useTestRuns({
    unitId: selectedUnitId,
    enabled: !!selectedUnitId,
  });

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const selectedTestRun = testRuns.find((run) => run.id === selectedTestRunId);

  const handleTriggerTest = async () => {
    if (!selectedUnitId) return;
    const newTest = await triggerNewTest();
    if (newTest) {
      setSelectedTestRunId(newTest.id);
    }
  };

  if (unitsLoading) {
    return <LoadingState message="Loading units..." />;
  }

  return (
    <div className="tests-page">
      <div className="page-header">
        <h1>Test Runs</h1>
        <p className="page-subtitle">Trigger and monitor test runs for DAC units</p>
      </div>

      <div className="tests-layout">
        <div className="tests-sidebar">
          <Card title="Select Unit">
            <div className="unit-selector">
              <select
                value={selectedUnitId || ''}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value || null);
                  setSelectedTestRunId(null);
                }}
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

            {selectedUnitId && (
              <>
                <div className="test-actions">
                  <TestRunButton
                    onClick={handleTriggerTest}
                    unitName={selectedUnit?.name}
                  />
                </div>

                {error && (
                  <div className="error-section">
                    <ErrorState error={error} onRetry={refetch} />
                  </div>
                )}
              </>
            )}
          </Card>

          {selectedUnitId && (
            <Card title="Test History">
              {runsLoading ? (
                <LoadingState message="Loading test runs..." size="small" />
              ) : testRuns.length === 0 ? (
                <div className="empty-state">
                  <p>No test runs found for this unit.</p>
                </div>
              ) : (
                <div className="test-runs-list">
                  {testRuns.map((run) => (
                    <div
                      key={run.id}
                      className={`test-run-item ${
                        selectedTestRunId === run.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedTestRunId(run.id)}
                    >
                      <div className="test-run-header">
                        <span className={`test-status status-${run.status}`}>
                          {run.status}
                        </span>
                        <span className="test-time">
                          {formatTimestamp(run.startedAt)}
                        </span>
                      </div>
                      {run.results && (
                        <div className="test-result-indicator">
                          {run.results.passed ? '✓ Passed' : '✗ Failed'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="tests-content">
          {!selectedUnitId ? (
            <Card>
              <div className="empty-state">
                <p>Please select a unit to view test runs.</p>
              </div>
            </Card>
          ) : selectedTestRun ? (
            <>
              <Card title={`Test Run: ${selectedTestRun.id}`}>
                <TestRunStatus
                  status={selectedTestRun.status}
                  startedAt={selectedTestRun.startedAt}
                  completedAt={selectedTestRun.completedAt}
                  error={selectedTestRun.error}
                />
              </Card>

              {selectedTestRun.results && (
                <TestResultsPanel
                  results={selectedTestRun.results}
                  testId={selectedTestRun.id}
                />
              )}
            </>
          ) : (
            <Card>
              <div className="empty-state">
                <p>Select a test run from the history to view details.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        .tests-page {
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

        .tests-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
        }

        .tests-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .unit-selector {
          margin-bottom: 1rem;
        }

        .select-input {
          width: 100%;
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

        .test-actions {
          margin-top: 1rem;
        }

        .error-section {
          margin-top: 1rem;
        }

        .test-runs-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .test-run-item {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .test-run-item:hover {
          border-color: #3b82f6;
          background-color: #f9fafb;
        }

        .test-run-item.selected {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .test-run-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .test-status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-pending {
          background-color: #f3f4f6;
          color: #6b7280;
        }

        .status-running {
          background-color: #dbeafe;
          color: #3b82f6;
        }

        .status-completed {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-failed {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .test-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .test-result-indicator {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
        }

        .tests-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        @media (max-width: 1024px) {
          .tests-layout {
            grid-template-columns: 1fr;
          }

          .tests-sidebar {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

