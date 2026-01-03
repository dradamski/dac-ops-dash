import type { TestRun, TestRunStatus } from '../types/domain';
import { generateMockTestRun, generateMockTestRuns } from '../utils/mockData';

/**
 * Trigger a new test run for a DAC unit
 */
export async function triggerTestRun(unitId: string): Promise<TestRun> {
  try {
    // In production, this would make a POST request to start a test
    // For now, we'll simulate creating a test run
    const testRun = generateMockTestRun(unitId, 'pending');
    
    // Simulate the test starting after a short delay
    setTimeout(() => {
      // In a real app, you'd poll for status updates
      console.log(`Test run ${testRun.id} started for unit ${unitId}`);
    }, 1000);

    return testRun;
  } catch (error) {
    console.error(`Error triggering test run for unit ${unitId}:`, error);
    throw error;
  }
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

