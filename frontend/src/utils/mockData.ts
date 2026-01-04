import type {
  SensorReading,
  DacUnit,
  TestRun,
  SensorType,
  UnitStatus,
  TestRunStatus,
} from '../types/domain';

/**
 * Generate mock sensor readings for a given time range and sensor type
 */
export function generateMockSensorReadings(
  sensorType: SensorType,
  unitId: string,
  startTime: Date,
  endTime: Date,
  intervalMinutes: number = 5
): SensorReading[] {
  const readings: SensorReading[] = [];
  const current = new Date(startTime);
  
  // Base values and variations for each sensor type
  const baseValues: Record<SensorType, { base: number; variation: number; unit: string }> = {
    co2: { base: 420, variation: 50, unit: 'ppm' },
    temperature: { base: 25, variation: 5, unit: '°C' },
    airflow: { base: 45, variation: 10, unit: 'm³/s' },
    efficiency: { base: 85, variation: 8, unit: '%' },
  };

  const config = baseValues[sensorType];

  while (current <= endTime) {
    // Add some realistic variation with slight trending
    const trend = Math.sin((current.getTime() - startTime.getTime()) / 3600000) * 0.3;
    const randomVariation = (Math.random() - 0.5) * config.variation;
    const value = config.base + trend * config.variation + randomVariation;

    readings.push({
      timestamp: current.toISOString(),
      sensorType,
      value: Math.max(0, value), // Ensure non-negative
      unit: config.unit,
      unitId,
    });

    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return readings;
}

/**
 * Generate mock DAC units
 */
export function generateMockDacUnits(): DacUnit[] {
  return [
    {
      id: 'unit-1',
      name: 'DAC Unit Alpha',
      status: 'healthy',
      location: 'Building A, Floor 2',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'unit-2',
      name: 'DAC Unit Beta',
      status: 'warning',
      location: 'Building A, Floor 3',
      lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'unit-3',
      name: 'DAC Unit Gamma',
      status: 'healthy',
      location: 'Building B, Floor 1',
      lastUpdated: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'unit-4',
      name: 'DAC Unit Delta',
      status: 'critical',
      location: 'Building B, Floor 2',
      lastUpdated: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}

/**
 * Generate mock test run
 */
export function generateMockTestRun(unitId: string, status: TestRunStatus = 'completed'): TestRun {
  const startedAt = new Date(Date.now() - 3600000);
  const completedAt = status === 'completed' || status === 'failed' 
    ? new Date(startedAt.getTime() + 300000) 
    : undefined;

  const passed = status === 'completed' && Math.random() > 0.2;

  return {
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    unitId,
    status,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt?.toISOString(),
    results: status === 'completed' ? {
      passed,
      metrics: [
        {
          name: 'CO₂ Capture Rate',
          value: passed ? 85.5 : 65.2,
          unit: '%',
          threshold: { min: 70, max: 100 },
        },
        {
          name: 'Energy Efficiency',
          value: passed ? 92.3 : 68.1,
          unit: '%',
          threshold: { min: 80, max: 100 },
        },
        {
          name: 'System Pressure',
          value: passed ? 1.2 : 2.5,
          unit: 'bar',
          threshold: { min: 0.8, max: 2.0 },
        },
      ],
      summary: passed
        ? 'All systems operating within normal parameters.'
        : 'Some metrics exceeded acceptable thresholds.',
    } : undefined,
    error: status === 'failed' ? 'Test execution encountered an error.' : undefined,
  };
}

/**
 * Generate multiple mock test runs for a unit
 */
export function generateMockTestRuns(unitId: string, count: number = 5): TestRun[] {
  const runs: TestRun[] = [];
  const statuses: TestRunStatus[] = ['completed', 'completed', 'completed', 'failed', 'pending'];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const run = generateMockTestRun(unitId, status);
    // Stagger start times
    run.startedAt = new Date(Date.now() - (count - i) * 3600000).toISOString();
    if (run.completedAt) {
      const started = new Date(run.startedAt);
      run.completedAt = new Date(started.getTime() + 300000).toISOString();
    }
    runs.push(run);
  }
  
  return runs.sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

