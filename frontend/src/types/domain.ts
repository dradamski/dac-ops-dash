export type SensorType = 'co2' | 'temperature' | 'airflow' | 'efficiency';

export type UnitStatus = 'healthy' | 'warning' | 'critical';

export type TestRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SensorReading {
  timestamp: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  unitId?: string; // Optional: which DAC unit this reading is from
}

export interface DacUnit {
  id: string;
  name: string;
  status: UnitStatus;
  location?: string;
  lastUpdated?: string;
}

export interface TestRun {
  id: string;
  unitId: string;
  status: TestRunStatus;
  startedAt: string;
  completedAt?: string;
  results?: TestResults;
  error?: string;
}

export interface TestResults {
  passed: boolean;
  metrics: {
    name: string;
    value: number;
    unit: string;
    threshold?: {
      min?: number;
      max?: number;
    };
  }[];
  summary: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface SensorDataFilter {
  unitId?: string;
  sensorType?: SensorType;
  timeRange?: TimeRange;
}

