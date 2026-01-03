import { useState, useEffect, useCallback } from 'react';
import type { TestRun, TestRunStatus } from '../types/domain';
import { triggerTestRun, fetchTestRuns, fetchTestRun, updateTestRunStatus } from '../api/tests';

interface UseTestRunsOptions {
  unitId: string | null;
  enabled?: boolean;
}

interface UseTestRunsResult {
  testRuns: TestRun[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  triggerNewTest: () => Promise<TestRun | null>;
}

/**
 * Hook for fetching test runs for a unit
 */
export function useTestRuns(options: UseTestRunsOptions): UseTestRunsResult {
  const { unitId, enabled = true } = options;
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !unitId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const runs = await fetchTestRuns(unitId);
      setTestRuns(runs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch test runs');
      setError(error);
      setTestRuns([]);
    } finally {
      setIsLoading(false);
    }
  }, [unitId, enabled]);

  const triggerNewTest = useCallback(async (): Promise<TestRun | null> => {
    if (!unitId) return null;

    try {
      const newTestRun = await triggerTestRun(unitId);
      // Refresh the list after triggering
      await fetchData();
      return newTestRun;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to trigger test run');
      setError(error);
      return null;
    }
  }, [unitId, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    testRuns,
    isLoading,
    error,
    refetch: fetchData,
    triggerNewTest,
  };
}

interface UseTestRunOptions {
  testRunId: string | null;
  enabled?: boolean;
}

interface UseTestRunResult {
  testRun: TestRun | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateStatus: (status: TestRunStatus) => Promise<void>;
}

/**
 * Hook for fetching a single test run
 */
export function useTestRun(options: UseTestRunOptions): UseTestRunResult {
  const { testRunId, enabled = true } = options;
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !testRunId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const run = await fetchTestRun(testRunId);
      setTestRun(run);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch test run');
      setError(error);
      setTestRun(null);
    } finally {
      setIsLoading(false);
    }
  }, [testRunId, enabled]);

  const updateStatus = useCallback(
    async (status: TestRunStatus) => {
      if (!testRunId) return;

      try {
        const updatedRun = await updateTestRunStatus(testRunId, status);
        setTestRun(updatedRun);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update test run status');
        setError(error);
      }
    },
    [testRunId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    testRun,
    isLoading,
    error,
    refetch: fetchData,
    updateStatus,
  };
}

