import type { TestRun, TestRunStatus } from '../types/domain';
import { get, post, patch } from './client';
import { generateMockTestRun, generateMockTestRuns } from '../utils/mockData';

// Store active test runs for status updates
const activeTestRuns = new Map<string, (testRun: TestRun) => void>();

/**
 * Transform backend test run to frontend format
 */
function transformTestRun(backendRun: any): TestRun {
  const run: TestRun = {
    id: String(backendRun.id),
    unitId: String(backendRun.unit_id),
    status: backendRun.status,
    startedAt: backendRun.started_at,
    completedAt: backendRun.completed_at || undefined,
    error: backendRun.error || undefined,
  };

  if (backendRun.result) {
    run.results = {
      passed: backendRun.result.passed,
      summary: backendRun.result.summary,
      metrics: backendRun.result.metrics.map((m: any) => ({
        name: m.name,
        value: Number(m.value),
        unit: m.unit,
        threshold: m.threshold_min !== null || m.threshold_max !== null
          ? {
            min: m.threshold_min !== null ? Number(m.threshold_min) : undefined,
            max: m.threshold_max !== null ? Number(m.threshold_max) : undefined,
          }
          : undefined,
      })),
    };
  }

  return run;
}

/**
 * Trigger a new test run for a DAC unit
 */
export async function triggerTestRun(unitId: string): Promise<TestRun> {
  try {
    const backendRun = await post<any>('/tests/runs', { unitId });
    const testRun = transformTestRun(backendRun);

    // Poll for test completion (test runs in background)
    // In production, you might use WebSockets or Server-Sent Events instead
    const pollForCompletion = async (): Promise<TestRun> => {
      const maxAttempts = 30; // Poll for up to 30 seconds
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        try {
          const updatedRun = await fetchTestRun(testRun.id);
          if (updatedRun && (updatedRun.status === 'completed' || updatedRun.status === 'failed')) {
            return updatedRun;
          }
        } catch (err) {
          console.warn('Error polling test run status:', err);
        }

        attempts++;
      }

      // Return the last known state if polling times out
      return testRun;
    };

    // Start polling in the background and notify subscribers when complete
    pollForCompletion().then((completedRun) => {
      const callback = activeTestRuns.get(testRun.id);
      if (callback) {
        callback(completedRun);
      }
    });

    return testRun;
  } catch (error) {
    // Fallback to mock data if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, using mock data:', error);
      const testRun = generateMockTestRun(unitId, 'running');

      // Simulate completion after delay
      setTimeout(() => {
        const completedRun = generateMockTestRun(unitId, 'completed');
        completedRun.id = testRun.id;
        completedRun.startedAt = testRun.startedAt;
        const callback = activeTestRuns.get(testRun.id);
        if (callback) {
          callback(completedRun);
        }
      }, 3000);

      return testRun;
    }
    console.error(`Error triggering test run for unit ${unitId}:`, error);
    throw error;
  }
}

/**
 * Subscribe to test run status updates
 */
export function subscribeToTestRun(
  testRunId: string,
  callback: (testRun: TestRun) => void
): () => void {
  activeTestRuns.set(testRunId, callback);
  return () => {
    activeTestRuns.delete(testRunId);
  };
}

/**
 * Fetch test runs for a specific unit
 */
export async function fetchTestRuns(unitId: string): Promise<TestRun[]> {
  try {
    const backendRuns = await get<any[]>(`/tests/runs?unitId=${unitId}`);
    return backendRuns.map(transformTestRun);
  } catch (error) {
    // Fallback to mock data if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, using mock data:', error);
      return generateMockTestRuns(unitId, 10);
    }
    console.error(`Error fetching test runs for unit ${unitId}:`, error);
    throw error;
  }
}

/**
 * Fetch a single test run by ID
 */
export async function fetchTestRun(testRunId: string): Promise<TestRun | null> {
  try {
    const backendRun = await get<any>(`/tests/runs/${testRunId}`);
    return transformTestRun(backendRun);
  } catch (error) {
    // Fallback to mock data if API is not available
    if (import.meta.env.DEV) {
      console.warn('API unavailable, using mock data:', error);
      const testRun = generateMockTestRun('unit-1', 'completed');
      testRun.id = testRunId;
      return testRun;
    }
    console.error(`Error fetching test run ${testRunId}:`, error);
    throw error;
  }
}

/**
 * Update test run status (for polling/status updates)
 */
export async function updateTestRunStatus(
  testRunId: string,
  status: TestRunStatus
): Promise<TestRun> {
  try {
    const updateData: any = { status };
    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date().toISOString();
    }
    const backendRun = await patch<any>(`/tests/runs/${testRunId}/status`, updateData);
    return transformTestRun(backendRun);
  } catch (error) {
    console.error(`Error updating test run ${testRunId}:`, error);
    throw error;
  }
}

