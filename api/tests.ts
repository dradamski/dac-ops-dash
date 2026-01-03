import type { TestRun, TestRunStatus } from '../types/domain';
import { generateMockTestRun, generateMockTestRuns } from '../utils/mockData';

// Store active test runs for status updates
const activeTestRuns = new Map<string, (testRun: TestRun) => void>();

/**
 * Trigger a new test run for a DAC unit
 */
export async function triggerTestRun(unitId: string): Promise<TestRun> {
  try {
    // In production, this would make a POST request to start a test
    // For now, we'll simulate creating a test run
    const testRun = generateMockTestRun(unitId, 'running');

    // Simulate the test completing after a delay (2-5 seconds)
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      // Generate completed test run with results
      const completedTestRun = generateMockTestRun(unitId, 'completed');
      completedTestRun.id = testRun.id;
      completedTestRun.startedAt = testRun.startedAt;
      completedTestRun.completedAt = new Date().toISOString();

      // Notify any listeners
      const callback = activeTestRuns.get(testRun.id);
      if (callback) {
        callback(completedTestRun);
        activeTestRuns.delete(testRun.id);
      }
    }, delay);

    return testRun;
  } catch (error) {
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
    // In production, this would make a real API call
    // For now, we'll use mock data
    return generateMockTestRuns(unitId, 10);
  } catch (error) {
    console.error(`Error fetching test runs for unit ${unitId}:`, error);
    throw error;
  }
}

/**
 * Fetch a single test run by ID
 */
export async function fetchTestRun(testRunId: string): Promise<TestRun | null> {
  try {
    // In production, this would make a real API call
    // For now, we'll generate a mock test run
    // In a real implementation, you'd need to know the unitId
    // This is a simplified version
    const testRun = generateMockTestRun('unit-1', 'completed');
    testRun.id = testRunId;
    return testRun;
  } catch (error) {
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
    // In production, this would make a PUT/PATCH request
    const testRun = await fetchTestRun(testRunId);
    if (!testRun) {
      throw new Error(`Test run ${testRunId} not found`);
    }

    return {
      ...testRun,
      status,
      completedAt: status === 'completed' || status === 'failed'
        ? new Date().toISOString()
        : testRun.completedAt,
    };
  } catch (error) {
    console.error(`Error updating test run ${testRunId}:`, error);
    throw error;
  }
}

